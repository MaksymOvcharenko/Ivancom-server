// routes/businessOrders.ts
import { Router } from 'express';
import {
  createBusinessOrder,
  deleteBusinessOrder,
  getBusinessOrders,
  updateBusinessOrder,
} from '../../controllers/orders.js';

const router = Router();

// створити замовлення
router.post('/', createBusinessOrder);
router.get('/', getBusinessOrders);
router.patch('/:id', updateBusinessOrder);
router.delete('/:id', deleteBusinessOrder);
export default router;
