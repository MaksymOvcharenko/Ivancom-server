// import axios from 'axios';
// import dotenv from 'dotenv';
// dotenv.config(); // якщо запускаєш скрипти не з кореня — підключай .env у самих скриптах з явним шляхом

// export async function postShipment(payload) {
//   const BASE = process.env.INPOST_API_BASE;
//   const TOKEN = process.env.INPOST_API_TOKEN;
//   const ORG_ID = process.env.INPOST_ORG_ID;
//   if (!BASE) throw new Error('INPOST_API_BASE is not set');
//   if (!TOKEN) throw new Error('INPOST_API_TOKEN is not set');
//   if (!ORG_ID) throw new Error('INPOST_ORG_ID is not set');

//   const { data } = await axios.post(
//     `${BASE}/v1/organizations/${ORG_ID}/shipments`,
//     payload,
//     {
//       headers: {
//         Authorization: `Bearer ${TOKEN}`,
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       },
//     },
//   );
//   return data; // { id, tracking_number: null, ... }
// }

// export async function getShipment(shipmentId) {
//   const BASE = process.env.INPOST_API_BASE;
//   const TOKEN = process.env.INPOST_API_TOKEN;
//   if (!BASE) throw new Error('INPOST_API_BASE is not set');
//   if (!TOKEN) throw new Error('INPOST_API_TOKEN is not set');

//   const { data } = await axios.get(`${BASE}/v1/shipments/${shipmentId}`, {
//     headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
//   });
//   console.log('📤 Payload:', data);

//   return data; // може вже мати tracking_number, documents.label.href
// }
// src/services/inpostClient.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.INPOST_API_BASE;
const TOKEN = process.env.INPOST_API_TOKEN;

export async function getShipmentLabel(
  shipmentId,
  { format = 'Pdf', type = 'A6' } = {},
) {
  if (!BASE) throw new Error('INPOST_API_BASE is not set');
  if (!TOKEN) throw new Error('INPOST_API_TOKEN is not set');
  if (!shipmentId) throw new Error('shipmentId is required');

  const { data, headers } = await axios.get(
    `${BASE}/v1/shipments/${shipmentId}/label`,
    {
      params: { format, type }, // Pdf|Zpl|Epl ; type: normal|A6 (courier = A6)
      headers: { Authorization: `Bearer ${TOKEN}` },
      responseType: 'arraybuffer', // бинарник!
      validateStatus: (s) => s >= 200 && s < 500, // щоб зловити 404/422 тіло
    },
  );

  return {
    buffer: data,
    contentType: headers['content-type'] || 'application/pdf',
    status: headers?.status || 200,
  };
}
export async function postShipment(payload) {
  const BASE = process.env.INPOST_API_BASE;
  const TOKEN = process.env.INPOST_API_TOKEN;
  const ORG_ID = process.env.INPOST_ORG_ID;
  if (!BASE) throw new Error('INPOST_API_BASE is not set');
  if (!TOKEN) throw new Error('INPOST_API_TOKEN is not set');
  if (!ORG_ID) throw new Error('INPOST_ORG_ID is not set');

  const { data } = await axios.post(
    `${BASE}/v1/organizations/${ORG_ID}/shipments`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  return data;
}

export async function getShipment(shipmentId) {
  const BASE = process.env.INPOST_API_BASE;
  const TOKEN = process.env.INPOST_API_TOKEN;
  if (!BASE) throw new Error('INPOST_API_BASE is not set');
  if (!TOKEN) throw new Error('INPOST_API_TOKEN is not set');

  const { data } = await axios.get(`${BASE}/v1/shipments/${shipmentId}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  console.log('📤 Payload:', data);
  return data;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
