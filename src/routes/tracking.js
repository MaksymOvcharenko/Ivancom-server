import { Router } from 'express';
import { trackingController } from '../controllers/tracking.controller.js';

const router = Router();

// Принятие TTН и обработка
router.get('/', trackingController);

export default router;
