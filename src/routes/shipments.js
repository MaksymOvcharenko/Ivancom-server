import express from 'express';
import {
  createShipment,
  deleteShipment,
  getShipmentById,
  getShipments,
  //   updatePaymentStatus,
  updateShipment,
} from '../controllers/shipments.js';
import updatePaymentStatusNew from './p24status.js';

const router = express.Router();

router.post('/', createShipment);
router.get('/', getShipments);
// router.get('/update-payment-status', updatePaymentStatus);
router.get('/update-payment-status', updatePaymentStatusNew);
router.get('/:id', getShipmentById);

router.put('/:id', updateShipment);
router.delete('/:id', deleteShipment);

export default router;
