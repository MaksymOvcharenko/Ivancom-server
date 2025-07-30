import express from 'express';
import crypto from 'crypto';
const router = express.Router();

router.post('/status', express.json(), (req, res) => {
  console.log('📩 P24 webhook received:\n', JSON.stringify(req.body, null, 2));

  const { sessionId, orderId, amount, currency, sign } = req.body;
  const crc = 'a71343a7b69fea5b'; // 🔒 заміни на свій справжній, якщо тестуєш інший

  // Підготовка expected payload
  const expectedPayload = {
    sessionId,
    orderId: Number(orderId),
    amount: Number(amount),
    currency,
    crc,
  };

  // Обчислення підпису
  const expectedSign = crypto
    .createHash('sha384')
    .update(JSON.stringify(expectedPayload), 'utf8')
    .digest('hex');

  // 🔍 Логування всього для перевірки через калькулятор
  console.log(
    '🧾 Expected payload (JSON.stringify):\n',
    JSON.stringify(expectedPayload),
  );
  console.log('📬 Sign from Przelewy24:', sign);
  console.log('🔐 My generated sign:', expectedSign);

  // Перевірка підпису
  if (expectedSign !== sign) {
    console.log('❌ Sign mismatch!');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log('✅ Valid signature! Payment confirmed.');
  return res.status(200).json({ status: 'OK' });
});

export default router;
