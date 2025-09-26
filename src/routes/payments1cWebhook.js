import express from "express";
import axios from "axios";
import crypto from "crypto";
import Payment1C from "../db/models/Payment1C.js";
import Payment1CEvent from "../db/models/Payment1CEvent.js";

const {
  P24_MERCHANT_ID,
  P24_CRC,
  P24_API_KEY,
  MONO_SIGN_MODE = "none",         // 'none' | 'hmac' | 'rsa'
  MONO_HMAC_SECRET,                // якщо MONO_SIGN_MODE='hmac' (зазвичай merchant token)
  MONO_WEBHOOK_PUBKEY_PEM          // якщо MONO_SIGN_MODE='rsa' (PEM рядок)
} = process.env;

const router = express.Router();

/* ---------- helpers ---------- */

async function logEvent(paymentId, type, payload) {
  try {
    await Payment1CEvent.create({
      payment_id: paymentId,
      event_type: type,
      event_payload: payload || null
    });
  // eslint-disable-next-line no-empty
  } catch {}
}

async function applyPaidByActNumber(actNumber, meta) {
  const p = await Payment1C.findOne({ where: { act_number: String(actNumber) } });
  if (!p) throw new Error(`payment_1c not found by act_number=${actNumber}`);

  if (p.status !== "paid") {
    await Payment1C.update(
      {
        status: "paid",
        gateway_order_id: meta?.orderId ?? p.gateway_order_id,
        updated_at: new Date()
      },
      { where: { id: p.id } }
    );
    await logEvent(p.id, "status_changed", { status: "paid", meta });
  }
  return p;
}

/** P24 verify-sign (sha384 JSON(payload)) */
function p24Sign(payload) {
  return crypto.createHash("sha384").update(JSON.stringify(payload)).digest("hex");
}

async function verifyP24(body) {
  const { sessionId, orderId, amount, currency } = body || {};
  if (!sessionId || !orderId || !amount || !currency) {
    return { ok: false, reason: "Bad body" };
  }

  const merchantId = Number(P24_MERCHANT_ID);
  const crc = String(P24_CRC);
  const basicUser = String(merchantId);
  const basicPass = String(P24_API_KEY);

  const verifyPayload = {
    sessionId: String(sessionId),
    orderId: Number(orderId),
    amount: Number(amount),
    currency: String(currency),
    crc
  };

  const sign = p24Sign(verifyPayload);

  const resp = await axios.put(
    "https://secure.przelewy24.pl/api/v1/transaction/verify",
    {
      sessionId: verifyPayload.sessionId,
      posId: merchantId,
      orderId: verifyPayload.orderId,
      amount: verifyPayload.amount,
      currency: verifyPayload.currency,
      sign
    },
    { auth: { username: basicUser, password: basicPass }, timeout: 10000 }
  );

  return { ok: resp?.data?.data?.status === "success", raw: resp?.data };
}

/** Monobank: перевірка підпису (опціонально) */
function verifyMonoSignature(req) {
  if (MONO_SIGN_MODE === "hmac") {
    const xSign = req.header("X-Signature");
    if (!xSign || !MONO_HMAC_SECRET || !req.rawBody) return false;
    const calc = crypto.createHmac("sha256", MONO_HMAC_SECRET)
      .update(req.rawBody)
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(xSign), Buffer.from(calc));
  }
  if (MONO_SIGN_MODE === "rsa") {
    const xSign = req.header("X-Signature");
    if (!xSign || !MONO_WEBHOOK_PUBKEY_PEM || !req.rawBody) return false;
    const verifier = crypto.createVerify("SHA256");
    verifier.update(req.rawBody);
    verifier.end();
    return verifier.verify(MONO_WEBHOOK_PUBKEY_PEM, Buffer.from(xSign, "base64"));
  }
  return true; // MONO_SIGN_MODE='none'
}

/* ---------- raw json (для підписів) ---------- */
const rawJson = express.json({
  type: "*/*",
  verify: (req, _res, buf) => { req.rawBody = buf; }
});

/**
 * Єдина точка вебхуків:
 *   GET/POST /api/payments1c/update?actNumber=ACT-...&provider=p24
 *   GET/POST /api/payments1c/update?actNumber=ACT-...&provider=mono&status=1
 */
router.all("/update", rawJson, async (req, res) => {
  const { actNumber, provider } = req.query;
  const wantRedirect = String(req.query.redirect || "") === "1";

  if (!actNumber || !provider) {
    return res.status(400).json({ error: "actNumber і provider обов'язкові" });
  }

  try {
    /* -------- P24 -------- */
    if (String(provider).toLowerCase() === "p24" || String(provider).toLowerCase() === "przelewy24") {
      const body = req.body || {};
      await logEvent(null, "webhook_received", { provider: "p24", actNumber, body });

      const v = await verifyP24(body);
      if (!v.ok) return res.status(400).json({ error: "P24 verification failed" });

      const p = await applyPaidByActNumber(actNumber, {
        provider: "p24",
        orderId: body?.orderId,
        amount: body?.amount,
        currency: body?.currency,
        methodId: body?.methodId,
        statement: body?.statement
      });

      if (wantRedirect) {
        const redirectTo = process.env.PUBLIC_BASE_URL ? `${process.env.PUBLIC_BASE_URL}/pay/${p.link_token}` : "/";
        return res.redirect(302, redirectTo);
      }
      return res.status(200).json({ status: "OK" });
    }

    /* -------- Monobank -------- */
    if (String(provider).toLowerCase() === "mono" || String(provider).toLowerCase() === "monobank") {
      // (опціонально) перевіряємо підпис
      if (!verifyMonoSignature(req)) {
        return res.status(400).json({ error: "Mono signature invalid" });
      }

      const { invoiceId, status, amount, currency, ccy, reference } = req.body || {};
      await logEvent(null, "webhook_received", { provider: "mono", actNumber, body: req.body });

      if (!invoiceId && !status) {
        // якщо монобанк шле лише редірект зі status у query
        if (!req.query.status) {
          return res.status(400).json({ error: "Missing invoiceId/status" });
        }
      }

      const rawStatus = String(status || req.query.status || "").toLowerCase();
      const success = ["1", "true", "success", "paid", "ok"].includes(rawStatus);
      if (!success) {
        return res.status(200).json({ status: "ignored", info: `mono status=${rawStatus}` });
      }

      const normCurrency =
        currency ||
        (ccy === 980 ? "UAH" : ccy === 985 ? "PLN" : ccy === 978 ? "EUR" : undefined);

      await applyPaidByActNumber(actNumber, {
        provider: "mono",
        orderId: invoiceId,
        amount,
        currency: normCurrency,
        statement: reference
      });

      return res.status(200).json({ status: "OK" });
    }

    return res.status(400).json({ error: "Unknown provider" });
  } catch (err) {
    console.error("❌ payments1c webhook error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
