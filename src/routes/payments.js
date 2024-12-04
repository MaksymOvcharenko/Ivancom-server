import express from 'express';

import { createPayment, deletePayment, getPaymentById, getPayments, updatePayment } from '../controllers/payments.js';

const router = express.Router();

router.post('/', createPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
