import express from 'express';
import crypto from 'crypto';
const router = express.Router();

router.post('/p24/status', express.json(), (req, res) => {
  console.log('📩 P24 webhook received:', req.body);

  const { sessionId, orderId, amount, currency, sign } = req.body;

  const crc = 'a71343a7b69fea5b';

  const expectedPayload = {
    sessionId,
    orderId: Number(orderId),
    amount: Number(amount),
    currency,
    crc,
  };

  const expectedSign = crypto
    .createHash('sha384')
    .update(JSON.stringify(expectedPayload), 'utf8')
    .digest('hex');

  if (expectedSign !== sign) {
    console.log('❌ Sign mismatch!');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log('✅ Valid signature! Payment confirmed.');

  // Тут ти можеш далі зберегти оплату в БД або оновити статус
  return res.status(200).json({ status: 'OK' });
});

export default router;
