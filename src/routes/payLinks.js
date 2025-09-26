// routes/payLinks.js
import express from "express";
import Payment1C from "../db/models/Payment1C.js";
import Payment1CEvent from "../db/models/Payment1CEvent.js";
import { generateMonobankInvoice } from "../services/monopay.js";
import { registerTransaction } from "../services/przelew/registerTransaction.js";

const router = express.Router();

const FINAL_STATUSES = new Set(["paid","failed","expired","canceled"]);

function baseUrlOf(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}
function isExpired(p) {
  if (!p.payment_url) return true;

  const ttlSec =
    (p.pay_method === "mono" || p.pay_method === "monobank")
      ? parseInt(process.env.MONO_LINK_TTL_SEC || "900", 10)
      : parseInt(process.env.P24_LINK_TTL_SEC || "900", 10);

  const madeAt = new Date(p.updated_at || p.created_at || Date.now());
  return (Date.now() - madeAt.getTime()) > ttlSec * 1000;
}
/**
 * GET /pay/:token
 * - paid -> проста сторінка "вже оплачено"
 * - є providerUrl -> 302 redirect
 * - інакше -> коротке повідомлення + інструкція (можна натиснути refresh)
 */
router.get("/pay/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const p = await Payment1C.findOne({ where: { link_token: token } });
    if (!p) return res.status(404).send("Invalid link");

    if (p.status === "paid") {
      return res
        .status(200)
        .send(`<html><body style="font-family:sans-serif">
          <h2>Платіж уже виконано</h2>
          <p>Оплата за акт <b>${p.act_number}</b> зафіксована.</p>
        </body></html>`);
    }

    if (p.payment_url && !isExpired(p)) {
  return res.redirect(302, p.payment_url);
}

    const b = baseUrlOf(req);
    return res
      .status(409)
      .send(`<html><body style="font-family:sans-serif">
        <h3>Посилання на оплату ще не готове або протухло.</h3>
        <p><form method="POST" action="${b}/pay/${p.link_token}/refresh?redirect=1">
          <button type="submit" style="padding:10px 16px;border-radius:8px;background:#0f62fe;color:#fff;border:0;cursor:pointer">
            Оновити посилання
          </button>
        </form></p>
      </body></html>`);
  } catch (e) {
    console.error("GET /pay error:", e);
    return res.status(500).send("Server error");
  }
});

/**
 * POST /pay/:token/refresh
 * - створює НОВИЙ інвойс у Mono/P24 (навіть якщо старий існує/прострочений)
 * - оновлює payment_url + gateway_order_id
 * - 302 на новий providerUrl якщо redirect=1, або JSON
 *
 * Підписи вебхуків не чіпаємо: webHookUrl той самий /api/payments1c/update?... як у твоєму контролері.
 */
router.post("/pay/:token/refresh", async (req, res) => {
  try {
    const token = req.params.token;
    const p = await Payment1C.findOne({ where: { link_token: token } });
    if (!p) return res.status(404).json({ error: "Invalid link" });

    if (FINAL_STATUSES.has(p.status)) {
      return res.status(409).json({ error: `Payment is ${p.status}` });
    }

    const b = baseUrlOf(req);
    const payLink = `${b}/pay/${p.link_token}`;
    const statusBase = `${b}/api/payments1c/update?actNumber=${encodeURIComponent(p.act_number)}&provider=`;

    let newUrl = null;
    let newOrderId = null;

    if (p.pay_method === "mono" || p.pay_method === "monobank") {
      const uah = Number(p.amount_uah || 0);
      const sumKop = Math.max(1, Math.round(uah * 100));
      const basketOrder = [
        {
          name: `Організація перевезення відправлень ACT-${p.act_number}`,
          qty: 1,
          sum: sumKop,
          total: sumKop,
          unit: "шт.",
          code: `ACT-${p.act_number}`,
        },
      ];

      const inv = await generateMonobankInvoice({
        orderId: String(p.id),
        amountUAH: uah,
        reference: `ACT ${p.act_number}`,
        destination: `Організація перевезення відправлень ACT-${p.act_number}`,
        comment: "Дякуємо за оплату!",
        basketOrder,
        redirectUrl: payLink,                      // повертаємо на наш стабільний лінк
        webHookUrl: `${statusBase}mono&status=1`, // твій робочий вебхук
        validitySec: 3600,
        paymentType: "debit",
        ccy: 980,
      });

      newUrl = inv.pageUrl;
      newOrderId = inv.invoiceId;
    } else if (p.pay_method === "p24" || p.pay_method === "przelewy24") {
      const grosz = Math.max(1, Math.round(Number(p.amount_pln || 0) * 100));
      const sessionId = `p24-${p.id}-${Date.now()}`; // унікально, щоб не конфліктувати зі старими

      const paymentUrl = await registerTransaction({
        sessionId,
        amount: grosz,
        description: `Zamowlenie ${p.act_number}`,
        email: p.email || "noemail@example.com",
        urlReturn: payLink,                      // назад на наш стабільний токен
        urlStatus: `${statusBase}p24`,          // твій verify-хук
      });

      newUrl = paymentUrl;
      newOrderId = sessionId;
    } else {
      return res.status(400).json({ error: "Unsupported method" });
    }

    await p.update({
      payment_url: newUrl,
      gateway_order_id: newOrderId,
      updated_at: new Date(),
    });

    await Payment1CEvent.create({
      payment_id: p.id,
      event_type: "gateway_regenerated",
      event_payload: { provider: p.pay_method, url: newUrl, orderId: newOrderId },
    });

    // редіректити чи JSON?
    if (String(req.query.redirect || "") === "1") {
      return res.redirect(302, newUrl);
    }
    return res.status(200).json({ providerUrl: newUrl, status: p.status });
  } catch (e) {
    console.error("POST /pay refresh error:", e?.response?.data || e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
