// src/services/sendMonobankReceipt.js
import axios from 'axios';
import nodemailer from 'nodemailer';
import Shipment from '../db/models/shipments.js';
import User from '../db/models/users.js';

const MONO_API = 'https://api.monobank.ua/api/merchant';
const { MONO_TOKEN } = process.env;

// ✅ твій SMTP transporter (як ти дав)
const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: 'office@ivancom.eu',
    pass: String(process.env.SMTP_PASS || 'IvankomSuper2025@1').trim(),
  },
});

/** 1) Shipment -> sender_id */
async function getSenderIdByShipmentId(shipmentId) {
  const ship = await Shipment.findOne({
    where: { id: String(shipmentId) },
    attributes: ['sender_id'],
  });
  if (!ship) throw new Error(`Shipment ${shipmentId} not found`);
  if (!ship.sender_id)
    throw new Error(`sender_id missing on shipment ${shipmentId}`);
  console.log(`Found sender_id for shipment ${shipmentId}:`, ship.sender_id);

  return Number(ship.sender_id);
}

/** 2) User -> email */
async function getUserEmailById(userId) {
  const user = await User.findOne({
    where: { id: Number(userId) },
    attributes: ['email'],
  });
  if (!user) throw new Error(`User ${userId} not found`);
  if (!user.email) throw new Error(`Email missing for user ${userId}`);
  console.log(`Found email for user ${userId}:`, user.email);

  return String(user.email);
}

/** 3) Monobank fiscal check */
async function fetchFiscalCheck(invoiceId) {
  if (!MONO_TOKEN) throw new Error('MONO_TOKEN is missing');
  const url = `${MONO_API}/invoice/fiscal-checks`;

  const resp = await axios.get(url, {
    params: { invoiceId: String(invoiceId) },
    headers: {
      'X-Token': MONO_TOKEN,
      Authorization: `Bearer ${MONO_TOKEN}`,
    },
    timeout: 15000,
  });

  const checks = resp?.data?.checks || [];
  const done = checks.find((c) => String(c.status).toLowerCase() === 'done');
  const status = done ? 'done' : checks[0]?.status || 'process';
  console.log(`Monobank fiscal check for invoice ${invoiceId} status:`, status);

  return {
    status,
    fileBase64: done?.file || null,
    taxUrl: done?.taxUrl || null,
  };
}

/** 4) Email з PDF (без зберігання на диск) */
async function sendReceiptEmail({
  to,
  base64pdf,
  taxUrl,
  shipmentId,
  invoiceId,
}) {
  return transporter.sendMail({
    from: '"Ivancom" <office@ivancom.eu>',
    to,
    subject: `Фіскальний чек за відправленням №${shipmentId}`,
    text: `Доброго дня!
Надсилаємо ваш фіскальний чек за відправленням №${shipmentId}.
Посилання на чек у ДПС: ${taxUrl || '—'}.
Дякуємо, що скористалися нашими послугами!`,
    attachments: [
      {
        filename: `receipt-${invoiceId}.pdf`,
        content: base64pdf,
        encoding: 'base64',
        contentType: 'application/pdf',
      },
    ],
  });
}

/** 🔔 Оркестратор: 2 БД-запити → Monobank → SMTP */
export async function processAndEmailMonobankReceipt({
  shipmentId,
  invoiceId,
}) {
  if (!shipmentId || !invoiceId) {
    throw new Error('shipmentId та invoiceId обовʼязкові');
  }

  // 1) Shipment -> sender_id
  const senderId = await getSenderIdByShipmentId(shipmentId);
  console.log(`[receipt] senderId for shipment ${shipmentId}:`, senderId);

  // 2) User -> email
  const toEmail = await getUserEmailById(senderId);
  console.log(`[receipt] sender email:`, toEmail);

  // 3) Monobank check
  const { status, fileBase64, taxUrl } = await fetchFiscalCheck(invoiceId);
  console.log(`[receipt] monobank invoice ${invoiceId} status:`, status);

  if (status !== 'done' || !fileBase64) {
    return { sent: false, status, message: 'Чек ще готується', taxUrl };
  }

  // 4) Send email
  await sendReceiptEmail({
    to: toEmail,
    base64pdf: fileBase64,
    taxUrl,
    shipmentId,
    invoiceId,
  });

  return { sent: true, status: 'done', taxUrl, to: toEmail };
}
// (async () => {
//   try {
//     const res = await processAndEmailMonobankReceipt({
//       shipmentId: 187, // підстав свій
//       invoiceId: '250827BuUca4BjXPdZF3', // підстав свій
//     });
//     console.log('RESULT:', res);
//   } catch (e) {
//     console.error('ERR:', e);
//   }
// })();
