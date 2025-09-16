// controllers/businessOrderController.ts

import BusinessOrder from '../db/models/bussines/BusinessOrder.js';

import { Op } from 'sequelize';
export const createBusinessOrder = async (req, res) => {
  try {
    const b = req.body;

    // обов’язкові
    const businessId =
      req.user?.selectedBusinessId ||
      b.meta?.selectedBusinessId ||
      b.businessId;
    const senderClientId = b.sender?.clientId;

    if (!businessId)
      return res.status(400).json({ error: 'business_id is required' });
    if (!senderClientId)
      return res.status(400).json({ error: 'sender.clientId is required' });
    if (!b.orderNumber)
      return res.status(400).json({ error: 'orderNumber is required' });
    if (!b.package?.method)
      return res.status(400).json({ error: 'delivery_method is required' });

    const dims = b.shipment?.dims ?? { length: 15, width: 15, height: 10 };
    const weightClass =
      b.shipment?.weightClass === 1 || b.shipment?.weightClass === 3
        ? b.shipment.weightClass
        : null;

    const created = await BusinessOrder.create({
      // ключові
      business_id: businessId,
      order_number: b.orderNumber,
      batch_number: b.batchNumber || null,

      // sender
      sender_client_id: senderClientId,
      sender_promo_code: b.sender?.promoCode ?? null,
      sender_payer: b.sender?.payer ?? 'sender',
      sender_name: b.sender?.name ?? null,
      sender_surname: b.sender?.surname ?? null,
      sender_phone: b.sender?.phoneE164 ?? null,
      sender_email: b.sender?.email ?? null,

      // receiver
      receiver_type: b.receiver?.type === 'company' ? 'company' : 'person',
      receiver_firstname: b.receiver?.firstName ?? null,
      receiver_lastname: b.receiver?.lastName ?? null,
      receiver_phone: b.receiver?.phoneE164 ?? null,
      receiver_email: b.receiver?.email ?? null,
      receiver_company:
        b.receiver?.type === 'company' ? b.receiver?.companyName ?? null : null,

      // address
      address_country: b.package?.address?.country ?? null,
      address_country_code: b.package?.address?.countryCode ?? null,
      address_city: b.package?.address?.city ?? null,
      address_region: b.package?.address?.region ?? null,
      address_street: b.package?.address?.street ?? null,
      address_postal_code: b.package?.address?.postalCode ?? null,
      address_house_number: b.package?.address?.houseNumber ?? null,
      address_apartment: b.package?.address?.apartment ?? null,

      // delivery
      delivery_method: b.package?.method, // required вище
      paczkomat_code: b.package?.paczkomat ?? null,

      // shipment
      declared_value: b.shipment?.declaredValue ?? null,
      weight_class: weightClass,
      dim_length_cm: dims.length,
      dim_width_cm: dims.width,
      dim_height_cm: dims.height,

      // costs (за бажанням передаєш з фронта)
      shipping_route: b.costs?.shipping_route ?? null,
      shipping_cost: b.costs?.shipping_cost ?? null,
      box_cost: b.costs?.box_cost ?? 2,
      insurance_cost: b.costs?.insurance_cost ?? 0,
      currency: b.costs?.currency ?? 'PLN',
      //   total_cost: b.costs?.total_cost ?? null, // якщо не рахуєш на бек

      // tracking
      tracking_inpost: b.tracking?.inpost ?? null,
      tracking_dhl: b.tracking?.dhl ?? null,

      status: b.status ?? 'draft',

      // meta — JSONB
      meta: {
        ...b.meta,
        from_ui: true,
      },

      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ ok: true, id: created.id });
  } catch (e) {
    const msg = e?.errors?.[0]?.message || e.message || 'Internal error';
    return res.status(422).json({ error: msg });
  }
};
// export const getBusinessOrders = async (req, res) => {
//   try {
//     const {
//       businessId,
//       limit = '50',
//       offset = '0',
//       status, // optional: draft|processing|shipped|delivered
//       from, // optional: ISO date
//       to, // optional: ISO date
//       search, // optional: шукає по order_number / tracking / email тощо
//     } = req.query;

//     if (!businessId) {
//       return res.status(400).json({ error: 'businessId is required' });
//     }

//     const where = { business_id: businessId };

//     // фільтр по статусу
//     if (status) where.status = status;

//     // фільтр по даті створення
//     if (from || to) {
//       where.created_at = {};
//       if (from) where.created_at[Op.gte] = new Date(from);
//       if (to) where.created_at[Op.lte] = new Date(to);
//     }

//     // простий пошук
//     if (search && String(search).trim()) {
//       const s = String(search).trim();
//       where[Op.or] = [
//         { order_number: { [Op.iLike]: `%${s}%` } },
//         { receiver_email: { [Op.iLike]: `%${s}%` } },
//         { tracking_inpost: { [Op.iLike]: `%${s}%` } },
//         { tracking_dhl: { [Op.iLike]: `%${s}%` } },
//         { receiver_firstname: { [Op.iLike]: `%${s}%` } },
//         { receiver_lastname: { [Op.iLike]: `%${s}%` } },
//       ];
//     }

//     const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
//     const off = Math.max(parseInt(offset, 10) || 0, 0);

//     const { rows, count } = await BusinessOrder.findAndCountAll({
//       where,
//       order: [['created_at', 'DESC']],
//       limit: lim,
//       offset: off,
//     });

//     return res.json({
//       ok: true,
//       total: count,
//       limit: lim,
//       offset: off,
//       items: rows,
//     });
//   } catch (e) {
//     return res.status(500).json({ error: e.message });
//   }
// };
export const getBusinessOrders = async (req, res) => {
  try {
    const q = req.query;
    const businessId = q.businessId;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    const and = [{ business_id: businessId }];

    // ---- точкові фільтри ----
    // статус
    if (q.status) and.push({ status: q.status });

    // метод доставки
    const method = q.method || q.delivery_method;
    if (method) and.push({ delivery_method: method });

    // клас ваги
    const weightClass = q.weightClass || q.weight_class;
    if (weightClass) and.push({ weight_class: Number(weightClass) });

    // № замовлення / партії (LIKE)
    const orderNumber = (q.orderNumber || q.order_number || '').trim();
    if (orderNumber)
      and.push({ order_number: { [Op.iLike]: `%${orderNumber}%` } });

    const batchNumber = (q.batchNumber || q.batch_number || '').trim();
    if (batchNumber)
      and.push({ batch_number: { [Op.iLike]: `%${batchNumber}%` } });

    // телефон / email одержувача (LIKE)
    const receiverPhone = (q.receiverPhone || q.receiver_phone || '').trim();
    if (receiverPhone)
      and.push({ receiver_phone: { [Op.iLike]: `%${receiverPhone}%` } });

    const receiverEmail = (q.receiverEmail || q.receiver_email || '').trim();
    if (receiverEmail)
      and.push({ receiver_email: { [Op.iLike]: `%${receiverEmail}%` } });

    // місто / код країни
    const city = (q.city || q.address_city || '').trim();
    if (city) and.push({ address_city: { [Op.iLike]: `%${city}%` } });

    const countryCodeRaw = (
      q.countryCode ||
      q.address_country_code ||
      ''
    ).trim();
    if (countryCodeRaw)
      and.push({ address_country_code: countryCodeRaw.toUpperCase() });

    // трек (шукаємо одночасно у inpost + dhl)
    const tracking = (q.tracking || '').trim();
    if (tracking) {
      and.push({
        [Op.or]: [
          { tracking_inpost: { [Op.iLike]: `%${tracking}%` } },
          { tracking_dhl: { [Op.iLike]: `%${tracking}%` } },
        ],
      });
    }

    // діапазон дат: підтримка і from/to, і dateFrom/dateTo
    const from = q.from || q.dateFrom;
    const to = q.to || q.dateTo;
    if (from || to) {
      const range = {};
      if (from) range[Op.gte] = new Date(from);
      if (to) range[Op.lte] = new Date(to);
      and.push({ created_at: range });
    }

    // глобальний пошук (розширив + включив phone)
    const search = (q.search || '').trim();
    if (search) {
      and.push({
        [Op.or]: [
          { order_number: { [Op.iLike]: `%${search}%` } },
          { receiver_email: { [Op.iLike]: `%${search}%` } },
          { receiver_phone: { [Op.iLike]: `%${search}%` } },
          { tracking_inpost: { [Op.iLike]: `%${search}%` } },
          { tracking_dhl: { [Op.iLike]: `%${search}%` } },
          { receiver_firstname: { [Op.iLike]: `%${search}%` } },
          { receiver_lastname: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    // ---- пагінація: page/pageSize або limit/offset ----
    const pageParam = q.page ? parseInt(q.page, 10) : null;
    const pageSizeParam = q.pageSize ? parseInt(q.pageSize, 10) : null;

    const lim = Math.min(
      Math.max(parseInt(q.limit ?? pageSizeParam ?? '50', 10) || 50, 1),
      200,
    );
    const off = pageParam
      ? Math.max((pageParam - 1) * lim, 0)
      : Math.max(parseInt(q.offset ?? '0', 10) || 0, 0);

    const { rows, count } = await BusinessOrder.findAndCountAll({
      where: { [Op.and]: and },
      order: [['created_at', 'DESC']],
      limit: lim,
      offset: off,
    });

    return res.json({
      ok: true,
      total: count,
      limit: lim,
      offset: off,
      // на майбутнє віддаю ще page/pageSize — фронту зручно
      page: pageParam ?? Math.floor(off / lim) + 1,
      pageSize: lim,
      items: rows,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
const ALLOWED_FIELDS = new Set([
  // receiver
  'receiver_type',
  'receiver_firstname',
  'receiver_lastname',
  'receiver_phone',
  'receiver_email',
  'receiver_company',

  // address
  'address_country',
  'address_country_code',
  'address_city',
  'address_region',
  'address_street',
  'address_postal_code',
  'address_house_number',
  'address_apartment',

  // delivery
  'delivery_method',
  'paczkomat_code',

  // shipment params
  'declared_value',
  'weight_class',
  'dim_length_cm',
  'dim_width_cm',
  'dim_height_cm',
  'comment',

  // tracking
  'tracking_inpost',
  'tracking_dhl',

  // costs
  'shipping_route',
  'shipping_cost',
  'box_cost',
  'insurance_cost',
  'currency',
  'total_cost',

  // status
  'status',
  // технічно можна оновити batch_number
  'batch_number',
]);

/** Нормалізує keys з фронта у колонки БД (snake_case) */
function normalizePatchBody(body = {}) {
  const map = {
    // receiver*
    receiverType: 'receiver_type',
    receiverFirstName: 'receiver_firstname',
    receiverLastName: 'receiver_lastname',
    receiverPhone: 'receiver_phone',
    receiverEmail: 'receiver_email',
    receiverCompany: 'receiver_company',

    // address*
    addressCountry: 'address_country',
    addressCountryCode: 'address_country_code',
    addressCity: 'address_city',
    addressRegion: 'address_region',
    addressStreet: 'address_street',
    addressPostalCode: 'address_postal_code',
    addressHouseNumber: 'address_house_number',
    addressApartment: 'address_apartment',

    // delivery
    deliveryMethod: 'delivery_method',
    paczkomat: 'paczkomat_code',

    // shipment
    declaredValue: 'declared_value',
    weightClass: 'weight_class',
    dimLengthCm: 'dim_length_cm',
    dimWidthCm: 'dim_width_cm',
    dimHeightCm: 'dim_height_cm',
    comment: 'comment',

    // tracking
    trackingInpost: 'tracking_inpost',
    trackingDhl: 'tracking_dhl',

    // costs
    shippingRoute: 'shipping_route',
    shippingCost: 'shipping_cost',
    boxCost: 'box_cost',
    insuranceCost: 'insurance_cost',
    currency: 'currency',
    totalCost: 'total_cost',

    status: 'status',
    batchNumber: 'batch_number',
  };

  const out = {};
  for (const [k, v] of Object.entries(body)) {
    const dbKey = map[k] || k; // якщо вже snake_case – пройде напряму
    if (ALLOWED_FIELDS.has(dbKey)) out[dbKey] = v;
  }
  return out;
}

/** PATCH /api/business-orders/:id?businessId=... */
export async function updateBusinessOrder(req, res) {
  try {
    const { id } = req.params;
    const businessId =
      req.query.businessId ||
      req.user?.selectedBusinessId ||
      req.body?.businessId;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    const order = await BusinessOrder.findOne({
      where: { id, business_id: businessId },
    });
    if (!order) {
      return res
        .status(404)
        .json({ error: 'Order not found for this business' });
    }

    const patch = normalizePatchBody(req.body || {});
    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    patch.updated_at = new Date();

    await order.update(patch);
    return res.json({ ok: true, order });
  } catch (e) {
    const code = String(e?.name || '').includes('Sequelize') ? 422 : 500;
    return res.status(code).json({ error: e.message });
  }
}

/** DELETE /api/business-orders/:id?businessId=...  */
export async function deleteBusinessOrder(req, res) {
  try {
    const { id } = req.params;
    const businessId =
      req.query.businessId ||
      req.user?.selectedBusinessId ||
      req.body?.businessId;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    const deleted = await BusinessOrder.destroy({
      where: { id, business_id: businessId },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ error: 'Order not found or already removed' });
    }

    return res.json({ ok: true, deleted: 1 });
  } catch (e) {
    const code = String(e?.name || '').includes('Sequelize') ? 422 : 500;
    return res.status(code).json({ error: e.message });
  }
}
