// routes/updatePaymentStatus.js
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import Shipment from '../db/models/shipments.js';
import Payment from '../db/models/payments.js';
import { updatePaymentStatusInGoogleSheets } from '../services/google/main.js';

const {
  FRONTEND_URL = 'https://package-ivancom.vercel.app/confirmation',
  P24_MERCHANT_ID,
  P24_CRC,
  P24_API_KEY,
} = process.env;

const router = express.Router();

/** Ідемпотентне застосування "успішної оплати" */
async function applyPaymentSuccess(shipmentIdRaw, meta) {
  const shipmentId = String(shipmentIdRaw);

  const shipment = await Shipment.findOne({ where: { id: shipmentId } });
  if (!shipment) throw new Error(`Shipment ${shipmentId} не знайдено`);

  const paymentId = shipment.dataValues.payment_id;
  if (!paymentId)
    throw new Error(`У shipment ${shipmentId} відсутній payment_id`);

  const payment = await Payment.findOne({ where: { id: paymentId } });
  if (!payment) throw new Error(`Payment ${paymentId} не знайдено`);

  const isAlreadyPaid =
    payment.dataValues.status === true || payment.dataValues.status === 'true';

  if (!isAlreadyPaid) {
    await Payment.update(
      {
        status: 'true',
        // опціонально збережемо метадані, якщо такі поля є у вашій схемі
        p24_order_id: meta?.orderId ?? payment.dataValues.p24_order_id,
        p24_amount: meta?.amount ?? payment.dataValues.p24_amount,
        p24_currency: meta?.currency ?? payment.dataValues.p24_currency,
        p24_method_id: meta?.methodId ?? payment.dataValues.p24_method_id,
        p24_statement: meta?.statement ?? payment.dataValues.p24_statement,
        provider: meta?.provider ?? payment.dataValues.provider,
      },
      { where: { id: paymentId } },
    );
  }

  await updatePaymentStatusInGoogleSheets(shipmentId, 'success');

  return `${FRONTEND_URL}?id=${shipmentId}`;
}

/** sign для /transaction/verify у P24 */
function buildVerifySign(payload) {
  return crypto
    .createHash('sha384')
    .update(JSON.stringify(payload))
    .digest('hex');
}

/** Верифікація P24: повертає true/false + дані */
async function verifyP24(body) {
  const { sessionId, orderId, amount, currency } = body || {};
  if (!sessionId || !orderId || !amount || !currency) {
    throw new Error('Некоректний body для верифікації P24');
  }

  const merchantId = Number(P24_MERCHANT_ID);
  const crc = String(P24_CRC);
  const p24Username = String(merchantId);
  const p24Password = String(P24_API_KEY);

  const verifyPayload = {
    sessionId: String(sessionId),
    orderId: Number(orderId),
    amount: Number(amount),
    currency: String(currency),
    crc,
  };

  const sign = buildVerifySign(verifyPayload);

  const resp = await axios.put(
    'https://secure.przelewy24.pl/api/v1/transaction/verify',
    {
      sessionId: verifyPayload.sessionId,
      posId: merchantId,
      orderId: verifyPayload.orderId,
      amount: verifyPayload.amount,
      currency: verifyPayload.currency,
      sign,
    },
    {
      auth: { username: p24Username, password: p24Password },
      timeout: 10000,
    },
  );

  return {
    ok: resp?.data?.data?.status === 'success',
    raw: resp?.data,
  };
}

/**
 * Єдиний вебхук:
 * URL приклад (той, що ти формуєш як urlStatus):
 * https://ivancom-server.onrender.com/shipments/update-payment-status?shipmentId=123&status=1&dummy=extra&provider=p24
 * або
 * https://ivancom-server.onrender.com/shipments/update-payment-status?shipmentId=123&status=1&dummy=extra&provider=mono
 */
router.all('/update-payment-status', express.json(), async (req, res) => {
  const { shipmentId, status, provider } = req.query;
  console.log('🔔 Incoming payment webhook:', {
    provider,
    shipmentId,
    status,
    method: req.method,
  });
  // P24/Mono зазвичай шлють POST; але дозволимо і GET для дебагу
  const isRedirectWanted = String(req.query.redirect || '') === '1';

  if (!shipmentId || !provider) {
    return res.status(400).json({ error: "shipmentId і provider обов'язкові" });
  }

  try {
    if (provider === 'p24') {
      // 1) ВЕРИФІКАЦІЯ P24
      console.log(
        '📦 P24 webhook body:',
        JSON.stringify(req.body || {}, null, 2),
      );
      const verified = await verifyP24(req.body || {});
      if (!verified.ok) {
        console.log('⚠️ P24 verification failed');
        return res.status(400).json({ error: 'P24 verification failed' });
      }

      // 2) ОНОВЛЕННЯ СТАТУСУ
      const redirectUrl = await applyPaymentSuccess(shipmentId, {
        provider: 'p24',
        orderId: req.body?.orderId,
        amount: req.body?.amount,
        currency: req.body?.currency,
        methodId: req.body?.methodId,
        statement: req.body?.statement,
      });

      if (isRedirectWanted) return res.redirect(302, redirectUrl);
      return res.status(200).json({ status: 'OK' });
    }

    if (provider === 'mono') {
      // ⚠️ Як і просив: без верифікації — одразу проставляємо статус
      // Мапимо truthy статуси
      const isSuccess = ['1', 'true', 'success', 'paid', 'ok'].includes(
        String(status).toLowerCase(),
      );
      if (!isSuccess) {
        // Якщо хочеш фіксувати невдачу — тут можна оновити БД/Sheets іншим статусом
        return res.status(400).json({ error: 'Mono status is not success' });
      }

      const redirectUrl = await applyPaymentSuccess(shipmentId, {
        provider: 'mono',
        // якщо з монобанку прилітають якісь дані в body — збережемо
        orderId: req.body?.invoiceId || req.body?.orderId,
        amount: req.body?.amount,
        currency: req.body?.currency || 'UAH',
        statement: req.body?.reference,
      });

      if (isRedirectWanted) return res.redirect(302, redirectUrl);
      return res.status(200).json({ status: 'OK' });
    }

    return res.status(400).json({ error: 'Unknown provider' });
  } catch (err) {
    console.error(
      '❌ Webhook handling error:',
      err?.response?.data || err?.message || err,
    );
    // За бажанням можна завжди відповідати 200, щоб провайдер не ретраїв
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
