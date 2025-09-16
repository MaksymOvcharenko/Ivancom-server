// routes/businessOrders.js (або твій існуючий router)
import { Router } from 'express';

import BusinessOrder from '../../db/models/bussines/BusinessOrder.js';
import { getShipmentLabel } from '../../services/inpostClient.js';

const router = Router();

/**
 * GET /api/business-orders/:id/label?format=Pdf&type=A6
 * Повертає файл етикетки (PDF/ZPL/EPL) з InPost по inpost_shipment_id.
 */
router.get('/business-orders/:id/label', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'Pdf', type = 'A6' } = req.query;

    const order = await BusinessOrder.findByPk(id);
    if (!order)
      return res.status(404).json({ ok: false, error: 'Order not found' });

    // Поки що підтримуємо лише InPost
    const isInpost =
      order.delivery_method === 'inpost_courier' ||
      order.delivery_method === 'inpost_paczkomat';
    if (!isInpost)
      return res.status(400).json({
        ok: false,
        error: 'Label not supported for this provider yet',
      });

    if (!order.inpost_shipment_id)
      return res.status(409).json({
        ok: false,
        error: 'inpost_shipment_id is missing for this order',
      });

    const { buffer, contentType } = await getShipmentLabel(
      order.inpost_shipment_id,
      { format, type },
    );

    const ext = (format || 'Pdf').toLowerCase(); // pdf/zpl/epl
    const fileName = `label-${order.order_number}.${
      ext === 'pdf' ? 'pdf' : ext
    }`;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    return res.send(Buffer.from(buffer));
  } catch (e) {
    const status = e.response?.status || 500;
    const body = e.response?.data;
    if (body) {
      return res.status(status).send(body); // наприклад, 404 якщо ще не готово
    }
    return res.status(status).json({ ok: false, error: e.message });
  }
});

export default router;
