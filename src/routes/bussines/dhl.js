import { Router } from 'express';
import {
  DHL_LABEL_TYPES,
  getLabels,
  getTrackAndTraceInfo,
} from '../../utils/dhl24Client.js';

const router = Router();

/**
 * GET /api/dhl/label/:shipmentId?type=BLP
 * Віддає base64 контент і mime type.
 */
router.get('/label/:shipmentId', async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const type = (req.query.type || 'BLP').toString().toUpperCase();

    if (!DHL_LABEL_TYPES.includes(type)) {
      return res.status(400).json({ error: `Unsupported label type: ${type}` });
    }

    const out = await getLabels([{ shipmentId, labelType: type }]);
    console.log('getLabels result:', out);

    const item = out?.[0];

    if (!item?.data) {
      return res.status(404).json({ error: 'Label not found' });
    }

    return res.json({
      ok: true,
      shipmentId: item.shipmentId,
      labelType: item.labelType,
      contentType: item.contentType,
      data: item.data, // base64
    });
  } catch (e) {
    return res.status(422).json({ error: e.message || 'DHL label error' });
  }
});

/**
 * GET /api/dhl/track/:shipmentId
 * Повертає трек-таймлайн.
 */
router.get('/track/:shipmentId', async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const info = await getTrackAndTraceInfo(shipmentId);
    return res.json({ ok: true, ...info });
  } catch (e) {
    return res.status(422).json({ error: e.message || 'DHL track error' });
  }
});

export default router;
