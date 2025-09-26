import { v4 as uuidv4 } from "uuid";
import Joi from "joi";


import Payment1C from "../db/models/Payment1C.js";
import Payment1CEvent from "../db/models/Payment1CEvent.js";

import { sendPaymentEmail } from "../services/forms/paymentMailer.js";
import { generateMonobankInvoice } from "../services/monopay.js";
import { registerTransaction } from "../services/przelew/registerTransaction.js";

const schema = Joi.object({
  actNumber: Joi.string().trim().required(),
  amountUAH: Joi.number().positive().precision(2).required(),
  amountPLN: Joi.number().positive().precision(2).required(),
  method: Joi.string().valid("mono","p24").required(),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  emailText: Joi.string().allow("", null),
  npTTN: Joi.string().allow("", null)
});
const FINAL_STATUSES = new Set(['paid','failed','expired','canceled']);
// export async function createFrom1C(req, res) {
//   try {
//     const { value, error } = schema.validate(req.body, { abortEarly: false });
//     if (error) return res.status(400).json({ error: "Validation error", details: error.details });

//     const { actNumber, amountUAH, amountPLN, method, email, phone, emailText, npTTN } = value;

//     // ідемпотентність по act_number
//     let p = await Payment1C.findOne({ where: { act_number: actNumber } });
    
//     if (!p) {
//       const linkToken = uuidv4().replace(/-/g, "");
//       p = await Payment1C.create({
//         act_number: actNumber,
//         amount_uah: amountUAH,
//         amount_pln: amountPLN,
//         pay_method: method,
//         email, phone, email_text: emailText, np_ttn: npTTN,
//         link_token: linkToken,
//         status: "pending"
//       });
//       await Payment1CEvent.create({ payment_id: p.id, event_type: "created", event_payload: { from: "1C" } });
//     }
// if (p.status === 'paid') {
//   const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
//   await Payment1CEvent.create({
//   payment_id: p.id,
//   event_type: 'duplicate_request_ignored',
//   event_payload: { reason: 'already_paid' }
// });

//   return res.status(200).json({
//     id: p.id,
//     actNumber: p.act_number,
//     paymentLink: `${baseUrl}/pay/${p.link_token}`,
//     providerUrl: p.payment_url || null,
//     status: p.status
//   });
// }
//     // заглушка під створення платежу
//     if (!FINAL_STATUSES.has(p.status) && (!p.payment_url || !p.gateway_order_id)) {
//       // ================= MONO real create =================
// if (p.pay_method === "mono" || p.pay_method === "monobank") {
// const baseUrl = "https://ivancom-server.onrender.com";
// const statusBase = `${baseUrl}/api/payments1c/update?actNumber=${encodeURIComponent(p.act_number)}&provider=`;

//   // сума у копійках (інт)
//   const uah = Number(p.amount_uah || 0);
//   const sumKop = Math.max(1, Math.round(uah * 100)); // мінімум 1 коп.

//   // обов'язково додаємо code!
//   const basketOrder = [
//     {
//       name: `Організація перевезення відправлень ACT-${p.act_number}`,
//       qty: 1,
//       sum: sumKop,
//       total: sumKop,
//       unit: "шт.",
//       code: `ACT-${p.act_number}`,
//     },
//   ];

//   try {
//     const inv = await generateMonobankInvoice({
//       orderId: String(p.id),
//       amountUAH: uah, // функція сама помножить на 100
//       reference: `ACT ${p.act_number}`,
//       destination: `Організація перевезення відправлень ACT-${p.act_number}`,
//       comment: "Дякуємо за оплату!",
//       basketOrder,
//       redirectUrl: baseUrl, // після оплати повертаємо на наш універсальний лінк
//       webHookUrl: `${statusBase}mono&status=1`,
//       validitySec: 3600,
//       paymentType: "debit",
//       ccy: 980,
//     });

//     await p.update({
//       payment_url: inv.pageUrl,
//       gateway_order_id: inv.invoiceId,
//       updated_at: new Date(),
//     });

//     await Payment1CEvent.create({
//       payment_id: p.id,
//       event_type: "gateway_created",
//       event_payload: inv.raw,
//     });
//   } catch (err) {
//     // не валимо запит для 1С — лог і резервний сценарій
//     await Payment1CEvent.create({
//       payment_id: p.id,
//       event_type: "gateway_error",
//       event_payload: {
//         provider: "mono",
//         message: err?.response?.data || err.message,
//         status: err?.response?.status,
//       },
//     });

//     // fallback: залишаємо payment_url порожнім — 1С отримає наш токен-лінк,
//     // а ти зможеш повторити створення інвойсу окремо
//     if (!p.payment_url) {
//       await p.update({ updated_at: new Date() });
//     }
//   }
// }else if (p.pay_method === "p24" || p.pay_method === "przelewy24") {
//     console.log("Creating P24 payment for:", p.id, p.act_number, p.amount_pln);
    
//   const baseUrl = "https://ivancom-server.onrender.com";
// const statusBase = `${baseUrl}/api/payments1c/update?actNumber=${encodeURIComponent(p.act_number)}&provider=`;

//   const amountPln = Number(p.amount_pln || 0);
//   const grosz = Math.max(1, Math.round(amountPln * 100)); // grosz (int)
//   const sessionId = `p24-${p.id}`;

//   try {
//     const paymentUrl = await registerTransaction({
//       sessionId,
//       amount: grosz,
//       description: `Zamowlenie ${p.act_number}`,
//       email: p.email || "noemail@example.com",
//       urlReturn: baseUrl,
//       urlStatus: `${statusBase}p24`
//     });
//    console.log("Created P24 payment:", { paymentUrl, sessionId, grosz });
   
//     await p.update({
//       payment_url: paymentUrl,
//       gateway_order_id: sessionId,
//       updated_at: new Date(),
//     });

//     await Payment1CEvent.create({
//       payment_id: p.id,
//       event_type: "gateway_created",
//       event_payload: { provider: "p24", sessionId, grosz, paymentUrl },
//     });
//   } catch (err) {
//     await Payment1CEvent.create({
//       payment_id: p.id,
//       event_type: "gateway_error",
//       event_payload: {
//         provider: "p24",
//         message: err?.response?.data || err.message,
//         status: err?.response?.status,
//       },
//     });
//     if (!p.payment_url) await p.update({ updated_at: new Date() });
//   }
// }
// // ====================================================
// } 
// // ====================================================

// // емейл
// if (email && !FINAL_STATUSES.has(p.status)) {
//   const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
//   const payLink = p.payment_url || `${baseUrl}/pay/${p.link_token}`;
//   await sendPaymentEmail(email, {
//     subject: "Посилання на оплату",
//     contentHtml: emailText || "",
//     payLink,
//   });
//   await Payment1CEvent.create({ payment_id: p.id, event_type: "email_sent", event_payload: { to: email } });
//   if (p.status !== "link_sent") await p.update({ status: "link_sent", updated_at: new Date() });
// }

// // відповідь для 1С
// {
//   const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
//   return res.status(200).json({
//     id: p.id,
//     actNumber: p.act_number,
//     paymentLink: `${baseUrl}/pay/${p.link_token}`,
//     providerUrl: p.payment_url || null,
//     status: p.status,
//   });
// }
//   } catch (e) {
//     console.error("1C create payment error:", e);
//     return res.status(500).json({ error: "Server error" });
//   }
// }
export async function createFrom1C(req, res) {
  try {
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: "Validation error", details: error.details });

    const { actNumber, amountUAH, amountPLN, method, email, phone, emailText, npTTN } = value;

    // 0) базові URL-и (один раз)
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const methodNorm = (method || "").toLowerCase() === "monobank" ? "mono" : method;
    
    // 1) знайти/створити
    let p = await Payment1C.findOne({ where: { act_number: actNumber } });
    if (!p) {
      p = await Payment1C.create({
        act_number: actNumber,
        amount_uah: amountUAH,
        amount_pln: amountPLN,
        pay_method: methodNorm,
        email, phone, email_text: emailText, np_ttn: npTTN,
        link_token: uuidv4().replace(/-/g, ""),
        status: "pending"
      });
      await Payment1CEvent.create({ payment_id: p.id, event_type: "created", event_payload: { from: "1C" } });
    }

    // 2) гарантуємо токен для старих записів
    if (!p.link_token) {
      await p.update({ link_token: uuidv4().replace(/-/g, ""), updated_at: new Date() });
    }

    // 3) фінальні статуси — ранній вихід (не даунгрейдимо, не шлемо листи)
    if (FINAL_STATUSES.has(p.status)) {
      await Payment1CEvent.create({
        payment_id: p.id,
        event_type: "duplicate_request_ignored",
        event_payload: { reason: `final_status:${p.status}` }
      });
      return res.status(200).json({
        id: p.id,
        actNumber: p.act_number,
        paymentLink: `${baseUrl}/pay/${p.link_token}`,
        // якщо хочеш, можеш підміняти providerUrl на токен, щоб 1С не брала короткий лінк:
        providerUrl: `${baseUrl}/pay/${p.link_token}`,
        status: p.status
      });
    }

    // 4) якщо метод змінився і ще не створювали інвойс — оновимо
    if (p.pay_method !== methodNorm && !p.payment_url) {
      await p.update({ pay_method: methodNorm, updated_at: new Date() });
    }

    // 5) створення інвойсу лише якщо його немає
    if (!p.payment_url || !p.gateway_order_id) {
      const payLink = `${baseUrl}/pay/${p.link_token}`;
      const statusBase = `${baseUrl}/api/payments1c/update?actNumber=${encodeURIComponent(p.act_number)}&provider=`;

      if (p.pay_method === "mono") {
        const uah = Number(p.amount_uah || 0);
        const sumKop = Math.max(1, Math.round(uah * 100));
        const basketOrder = [{ name: `Організація перевезення відправлень ACT-${p.act_number}`, qty: 1, sum: sumKop, total: sumKop, unit: "шт.", code: `ACT-${p.act_number}` }];

        try {
          const inv = await generateMonobankInvoice({
            orderId: String(p.id),
            amountUAH: uah,
            reference: `ACT ${p.act_number}`,
            destination: `Організація перевезення відправлень ACT-${p.act_number}`,
            comment: "Дякуємо за оплату!",
            basketOrder,
            redirectUrl: payLink,                 // 👈 редіректимо на наш стабільний лінк
            webHookUrl: `${statusBase}mono&status=1`,
            validitySec: 3600,
            paymentType: "debit",
            ccy: 980
          });

          await p.update({ payment_url: inv.pageUrl, gateway_order_id: inv.invoiceId, updated_at: new Date() });
          await Payment1CEvent.create({ payment_id: p.id, event_type: "gateway_created", event_payload: inv.raw });
        } catch (err) {
          await Payment1CEvent.create({ payment_id: p.id, event_type: "gateway_error", event_payload: { provider: "mono", message: err?.response?.data || err.message, status: err?.response?.status } });
        }
      } else if (p.pay_method === "p24" || p.pay_method === "przelewy24") {
        try {
          const grosz = Math.max(1, Math.round(Number(p.amount_pln || 0) * 100));
          const sessionId = `p24-${p.id}`;
          const paymentUrl = await registerTransaction({
            sessionId,
            amount: grosz,
            description: `Zamowlenie ${p.act_number}`,
            email: p.email || "noemail@example.com",
            urlReturn: payLink,                   // 👈 теж на наш токен
            urlStatus: `${statusBase}p24`
          });

          await p.update({ payment_url: paymentUrl, gateway_order_id: sessionId, updated_at: new Date() });
          await Payment1CEvent.create({ payment_id: p.id, event_type: "gateway_created", event_payload: { provider: "p24", sessionId, grosz, paymentUrl } });
        } catch (err) {
          await Payment1CEvent.create({ payment_id: p.id, event_type: "gateway_error", event_payload: { provider: "p24", message: err?.response?.data || err.message, status: err?.response?.status } });
        }
      }
    }

    // 6) емейл лише якщо не фінальний статус
    if (email && !FINAL_STATUSES.has(p.status)) {
      const payLink = `${baseUrl}/pay/${p.link_token}`; // завжди токен (не короткий providerUrl)
      await sendPaymentEmail(email, { subject: "Посилання на оплату", contentHtml: emailText || "", payLink });
      await Payment1CEvent.create({ payment_id: p.id, event_type: "email_sent", event_payload: { to: email } });
      if (p.status !== "link_sent") await p.update({ status: "link_sent", updated_at: new Date() });
    }

    // 7) відповідь 1С — віддаємо тільки стабільний лінк (щоб не протухав)
    return res.status(200).json({
      id: p.id,
      actNumber: p.act_number,
      paymentLink: `${baseUrl}/pay/${p.link_token}`,
      providerUrl: p.payment_url || null,  // тимчасово дублюємо токен
      status: p.status
    });

  } catch (e) {
    console.error("1C create payment error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
