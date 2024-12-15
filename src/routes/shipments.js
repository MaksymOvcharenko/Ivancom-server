import express from 'express';
import { createShipment, deleteShipment, getShipmentById, getShipments, updatePaymentStatus, updateShipment } from '../controllers/shipments.js';


const router = express.Router();

router.post('/', createShipment);
router.get('/', getShipments);
router.get('/update-payment-status', updatePaymentStatus);
router.get('/:id', getShipmentById);

router.put('/:id', updateShipment);
router.delete('/:id', deleteShipment);

export default router;
