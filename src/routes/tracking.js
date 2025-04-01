import { Router } from 'express';
import { trackingController } from '../controllers/tracking.controller.js';

const router = Router();

// Принятие TTН и обработка
router.post('/', trackingController);

export default router;
