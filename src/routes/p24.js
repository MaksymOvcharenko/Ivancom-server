import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

router.post('/status', express.json(), async (req, res) => {
  console.log('📩 P24 webhook received:\n', JSON.stringify(req.body, null, 2));

  const { sessionId, orderId, amount, currency, sign: receivedSign } = req.body;

  const merchantId = 320208; // 👈 заміни, якщо інший
  const crc = 'a71343a7b69fea5b'; // 👈 заміни, якщо інший
  const p24Username = merchantId.toString(); // для basic auth
  const p24Password = 'a137baa9d800db0122922d680aa41218'; // ⚠️ Важливо! Встав свій API ключ!

  // 📦 Формуємо дані для перевірки
  const verifyPayload = {
    sessionId,
    orderId: Number(orderId),
    amount: Number(amount),
    currency,
    crc,
  };

  const generatedVerifySign = crypto
    .createHash('sha384')
    .update(JSON.stringify(verifyPayload))
    .digest('hex');

  console.log('🧾 Payload for VERIFY:', JSON.stringify(verifyPayload));
  console.log('🔐 Generated sign for VERIFY:', generatedVerifySign);

  // 📤 Запит до Przelewy24 на верифікацію
  try {
    const response = await axios.put(
      'https://secure.przelewy24.pl/api/v1/transaction/verify',
      {
        sessionId,
        posId: merchantId,
        orderId,
        amount,
        currency,
        sign: generatedVerifySign,
      },
      {
        auth: {
          username: p24Username,
          password: p24Password,
        },
      },
    );

    const data = response.data;
    console.log('✅ VERIFY response from P24:', data);

    if (data.status === 'success') {
      // 💾 Можеш тут зберегти в БД
      console.log('💰 Payment VERIFIED & SUCCESS!');
      return res.status(200).json({ status: 'OK' });
    } else {
      console.log('⚠️ Payment verification failed!');
      return res.status(400).json({ error: 'Verification failed' });
    }
  } catch (err) {
    console.error('❌ Error during VERIFY:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification error' });
  }
});

export default router;
