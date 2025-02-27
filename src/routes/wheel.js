import { Router } from 'express';
import WheelController from '../controllers/wheel.js';

const router = Router();

router.post('/spin', WheelController.spinWheel);

export default router;
