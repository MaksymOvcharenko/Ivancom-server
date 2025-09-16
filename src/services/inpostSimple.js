// import { postShipment, getShipment } from './inpostClient.js';

// const PLN = (v) => Math.round(Number(v || 0));
// const clamp = (s, n) => (s || '').toString().slice(0, n);
// const ref = (ord, cmt) => {
//   const r = (cmt ? `${ord} | ${cmt}` : `${ord}`).trim();
//   const t = clamp(r, 100);
//   return t.length >= 3 ? t : clamp(`ORD-${ord}`, 100);
// };

// // ——— КУР’ЄР ———
// export async function createInpostCourierSimpleOnce({
//   orderNumber,
//   comment,
//   weightTier = '1kg', // '1kg' | '3kg'
//   receiver,
//   address, // { street, building, city, post_code, country_code:'PL', apartment? }
// }) {
//   if (!receiver?.phone) throw new Error('receiver.phone is required');
//   if (!receiver?.email) throw new Error('receiver.email is required');
//   if (address?.country_code !== 'PL')
//     throw new Error('Courier requires PL address');

//   const payload = {
//     receiver: {
//       company_name: receiver.companyName || undefined,
//       first_name: receiver.firstName || undefined,
//       last_name: receiver.lastName || undefined,
//       email: receiver.email,
//       phone: receiver.phone,
//       address: {
//         street: address.street,
//         building_number: address.building,
//         city: address.city,
//         post_code: address.post_code,
//         country_code: 'PL',
//         apartment: address.apartment || undefined,
//       },
//     },
//     parcels: [
//       {
//         id: 'box-a',
//         dimensions: { length: '150', width: '150', height: '100', unit: 'mm' },
//         weight: { amount: weightTier === '3kg' ? '2.9' : '0.9', unit: 'kg' },
//         is_non_standard: false,
//       },
//     ],
//     insurance: {
//       amount: PLN(process.env.INPOST_DEFAULT_INSURANCE_PLN || 5000),
//       currency: 'PLN',
//     },
//     service: 'inpost_courier_standard',
//     reference: ref(orderNumber, comment),
//   };

//   const created = await postShipment(payload); // POST
//   const fresh = await getShipment(created.id); // одразу один GET

//   return {
//     id: created.id,
//     trackingNumber: fresh?.tracking_number ?? null,
//     labelUrl: fresh?.documents?.label?.href || fresh?.label_url || null,
//     rawPost: created,
//     rawGet: fresh,
//   };
// }

// // ——— ПОШТОМАТ ———
// export async function createInpostLockerSimpleOnce({
//   orderNumber,
//   comment,
//   receiver, // { email, phone, (optional firstName/lastName/companyName) }
//   lockerId, // напр. "KRA01A"
// }) {
//   if (!receiver?.phone) throw new Error('receiver.phone is required');
//   if (!receiver?.email) throw new Error('receiver.email is required');
//   if (!lockerId) throw new Error('lockerId is required');

//   const payload = {
//     receiver: {
//       company_name: receiver.companyName || undefined,
//       first_name: receiver.firstName || undefined,
//       last_name: receiver.lastName || undefined,
//       email: receiver.email,
//       phone: receiver.phone,
//     },
//     parcels: { template: 'small' }, // аналог A
//     insurance: {
//       amount: PLN(process.env.INPOST_DEFAULT_INSURANCE_PLN || 5000),
//       currency: 'PLN',
//     },
//     custom_attributes: {
//       target_point: lockerId,
//       sending_method: 'dispatch_order',
//     },
//     service: 'inpost_locker_standard',
//     reference: ref(orderNumber, comment),
//   };

//   const created = await postShipment(payload); // POST
//   const fresh = await getShipment(created.id); // одразу один GET

//   return {
//     id: created.id,
//     trackingNumber: fresh?.tracking_number ?? null,
//     labelUrl: fresh?.documents?.label?.href || fresh?.label_url || null,
//     rawPost: created,
//     rawGet: fresh,
//   };
// }
// src/services/inpostSimple.js
import { postShipment, getShipment, sleep } from './inpostClient.js';

const PLN = (v) => Math.round(Number(v || 0));
const clamp = (s, n) => (s || '').toString().slice(0, n);
const buildRef = (ord, cmt) => {
  const r = (cmt ? `${ord} | ${cmt}` : `${ord}`).trim();
  const t = clamp(r, 100);
  return t.length >= 3 ? t : clamp(`ORD-${ord}`, 100);
};

async function postThenGetTracking(shipmentId, tries = 5, delayMs = 1000) {
  let fresh = await getShipment(shipmentId);
  for (let i = 0; i < tries && !fresh?.tracking_number; i++) {
    await sleep(delayMs);
    fresh = await getShipment(shipmentId);
  }
  return fresh;
}

// ——— КУР’ЄР ———
export async function createInpostCourierSimpleOnce({
  orderNumber,
  comment,
  weightTier = '1kg', // '1kg' | '3kg'
  receiver,
  address, // { street, building, city, post_code, country_code:'PL', apartment? }
}) {
  if (!receiver?.phone) throw new Error('receiver.phone is required');
  if (!receiver?.email) throw new Error('receiver.email is required');
  if (address?.country_code !== 'PL')
    throw new Error('Courier requires PL address');

  const payload = {
    receiver: {
      company_name: receiver.companyName || undefined,
      first_name: receiver.firstName || undefined,
      last_name: receiver.lastName || undefined,
      email: receiver.email,
      phone: receiver.phone,
      address: {
        street: address.street,
        building_number: address.building,
        city: address.city,
        post_code: address.post_code,
        country_code: 'PL',
        apartment: address.apartment || undefined,
      },
    },
    parcels: [
      {
        id: 'box-a',
        dimensions: { length: '150', width: '150', height: '100', unit: 'mm' },
        weight: { amount: weightTier === '3kg' ? '2.9' : '0.9', unit: 'kg' },
        is_non_standard: false,
      },
    ],
    insurance: {
      amount: PLN(process.env.INPOST_DEFAULT_INSURANCE_PLN || 5000),
      currency: 'PLN',
    },
    service: 'inpost_courier_standard',
    reference: buildRef(orderNumber, comment),
  };

  const created = await postShipment(payload);
  const fresh = await postThenGetTracking(created.id, 5, 1000);

  return {
    id: created.id,
    trackingNumber: fresh?.tracking_number ?? null,
    labelUrl: fresh?.documents?.label?.href || fresh?.label_url || null,
    rawPost: created,
    rawGet: fresh,
  };
}

// ——— ПОШТОМАТ ———
export async function createInpostLockerSimpleOnce({
  orderNumber,
  comment,
  receiver, // { email, phone, (optional firstName/lastName/companyName) }
  lockerId,
}) {
  if (!receiver?.phone) throw new Error('receiver.phone is required');
  if (!receiver?.email) throw new Error('receiver.email is required');
  if (!lockerId) throw new Error('lockerId is required');

  const payload = {
    receiver: {
      company_name: receiver.companyName || undefined,
      first_name: receiver.firstName || undefined,
      last_name: receiver.lastName || undefined,
      email: receiver.email,
      phone: receiver.phone,
    },
    parcels: { template: 'small' }, // A
    insurance: {
      amount: PLN(process.env.INPOST_DEFAULT_INSURANCE_PLN || 5000),
      currency: 'PLN',
    },
    custom_attributes: {
      target_point: lockerId,
      sending_method: 'dispatch_order',
    },
    service: 'inpost_locker_standard',
    reference: buildRef(orderNumber, comment),
  };

  const created = await postShipment(payload);
  const fresh = await postThenGetTracking(created.id, 5, 1000);

  return {
    id: created.id,
    trackingNumber: fresh?.tracking_number ?? null,
    labelUrl: fresh?.documents?.label?.href || fresh?.label_url || null,
    rawPost: created,
    rawGet: fresh,
  };
}
