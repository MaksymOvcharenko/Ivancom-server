// routes/inpost.js
import { Router } from 'express';
import { getShipmentLabel } from '../../services/inpostClient.js';
import { getTrackingByNumber } from '../../services/inpostTracking.js';

const r = Router();

r.get('/inpost/shipments/:shipmentId/label', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { format = 'Pdf', type = 'A6' } = req.query;

    const { buffer, contentType } = await getShipmentLabel(shipmentId, {
      format,
      type,
    });

    res.setHeader('Content-Type', contentType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="label-${shipmentId}.pdf"`,
    );
    res.send(Buffer.from(buffer));
  } catch (e) {
    const status = e.response?.status || 500;
    const body = e.response?.data || { error: e.message };
    res.status(status).send(body);
  }
});
r.get('/inpost/tracking/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const data = await getTrackingByNumber(trackingNumber);
    res.json({ ok: true, tracking: data });
  } catch (e) {
    res
      .status(e.status || e.response?.status || 500)
      .send(e.body || e.response?.data || { error: e.message });
  }
});
export default r;
