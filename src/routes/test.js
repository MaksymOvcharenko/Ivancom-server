import { Router } from 'express';
import { testGoogle } from '../controllers/testGoogle.js';

const router = Router();

// Тестовий маршрут для взаємодії з Google Drive API
router.post('/google', testGoogle);

export default router;
