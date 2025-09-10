import { Router } from 'express';
import { validateByPhone } from '../controllers/promoController.js';

const router = Router();

router.post('/validate-by-phone', validateByPhone);

export default router;
