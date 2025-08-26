import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export async function registerTransaction({
  sessionId,
  amount,
  description,
  email,
  urlReturn,
  urlStatus,
}) {
  const posId = 320208;
  const merchantId = 320208;
  const currency = 'PLN';
  const crc = 'a71343a7b69fea5b';

  const signPayload = {
    sessionId,
    merchantId: Number(merchantId),
    amount,
    currency,
    crc,
  };

  const sign = crypto
    .createHash('sha384')
    .update(JSON.stringify(signPayload), 'utf8')
    .digest('hex');

  const payload = {
    merchantId: Number(merchantId),
    posId: Number(posId),
    sessionId,
    amount,
    currency,
    description,
    email,
    country: 'PL',
    language: 'pl',
    urlReturn,
    urlStatus,
    sign,
    regulationAccept: true,
  };

  console.log('📤 Payload:', payload);

  try {
    const res = await axios.post(
      'https://secure.przelewy24.pl/api/v1/transaction/register',
      payload,
      {
        auth: {
          username: 320208,
          password: 'a137baa9d800db0122922d680aa41218',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('📥 P24 response:', res.data);

    if (!res.data || !res.data.data || !res.data.data.token) {
      throw new Error('❌ No token received');
    }

    const token = res.data.data.token;
    const redirectUrl = `https://secure.przelewy24.pl/trnRequest/${token}`;
    console.log('✅ Redirect user to:', redirectUrl);
    return redirectUrl;
  } catch (err) {
    console.error('❌ Register error:', err.response?.data || err.message);
    throw err;
  }
}
