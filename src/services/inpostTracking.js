import axios from 'axios';

/**
 * InPost Tracking API не вимагає токена.
 * Використовуємо той самий BASE, або дефолтний прод.
 */
const BASE =
  process.env.INPOST_API_BASE || 'https://api-shipx-pl.easypack24.net';

export async function getTrackingByNumber(trackingNumber) {
  if (!trackingNumber) throw new Error('trackingNumber is required');
  const url = `${BASE}/v1/tracking/${trackingNumber}`;
  const { data } = await axios.get(url, {
    headers: { Accept: 'application/json' },
    validateStatus: (s) => s >= 200 && s < 500, // щоб віддати 404 як є
  });
  if (!data || data.error) {
    const err = new Error('Tracking not found');
    err.status = 404;
    err.body = data;
    throw err;
  }
  return data; // весь об'єкт tracker як у доках
}
