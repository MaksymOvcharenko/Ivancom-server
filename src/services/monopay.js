// services/monobank.js
import axios from 'axios';

const {
  MONO_TOKEN, // ← поклади свій merchant token у .env
} = process.env;

/**
 * Створює інвойс у Monobank і повертає { invoiceId, pageUrl }.
 * amountUAH — сума у гривнях (ми конвертимо у копійки).
 * basketOrder — масив позицій кошика (як у твоєму прикладі).
 */
export async function generateMonobankInvoice({
  orderId,
  amountUAH,
  reference = `Order ${orderId}`,
  destination = 'За організацію перевезення відправлень',
  comment = 'Дякуємо за оплату!',
  basketOrder = [],
  redirectUrl,
  webHookUrl,
  validitySec = 3600,
  paymentType = 'debit', // 'debit' | 'hold'
  ccy = 980, // 980 = UAH
}) {
  if (!MONO_TOKEN) throw new Error('MONO_TOKEN is not set');

  // Monobank очікує amount в КОПІЙКАХ (integer)
  const amount = Math.round(Number(amountUAH) * 100);

  const payload = {
    amount,
    ccy,
    merchantPaymInfo: {
      reference,
      destination,
      comment,
      basketOrder,
    },
    redirectUrl,
    webHookUrl,
    validity: validitySec,
    paymentType,
  };

  const { data } = await axios.post(
    'https://api.monobank.ua/api/merchant/invoice/create',
    payload,
    {
      headers: {
        'X-Token': MONO_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // необов’язково, але можна:
        'X-Cms': 'Custom',
        'X-Cms-Version': '1.0',
      },
      timeout: 10000,
    },
  );

  // очікувані поля у відповіді: invoiceId, pageUrl
  if (!data?.pageUrl) {
    throw new Error(`Mono: unexpected response: ${JSON.stringify(data)}`);
  }

  return {
    invoiceId: data.invoiceId,
    pageUrl: data.pageUrl,
    raw: data,
  };
}
