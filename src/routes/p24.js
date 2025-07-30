// routes/p24.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// P24 Webhook для підтвердження транзакції
router.post('/status', express.json(), async (req, res) => {
  const body = req.body;
  console.log('📩 P24 webhook received:', body);

  const { sessionId, orderId, amount, currency, sign } = body;

  //   const merchantId = 320208;
  const crc = 'a71343a7b69fea5b';

  const verifyPayload = {
    sessionId,
    orderId: Number(orderId),
    amount: Number(amount),
    currency,
    crc,
  };

  const expectedSign = crypto
    .createHash('sha384')
    .update(JSON.stringify(verifyPayload), 'utf8')
    .digest('hex');

  if (expectedSign !== sign) {
    console.warn('❌ Sign mismatch!');
    return res.status(400).json({ error: 'Invalid sign' });
  }

  // ✅ Платіж підтверджено
  console.log('✅ Оплата успішна для сесії:', sessionId);

  // 💾 Тут можеш оновити статус оплати в БД, якщо треба

  res.status(200).json({ status: 'OK' });
});

export default router;
