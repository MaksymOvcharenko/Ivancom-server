import { Router } from 'express';
import { formAnimalsController } from '../../controllers/forms/formAnimals.js';
import upload from '../../services/multerConfig.js';

const router = Router();

router.post(
  '/animals',
  upload.fields([{ name: 'file', maxCount: 10 }]),
  formAnimalsController,
);

export default router;
