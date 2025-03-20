import { Router } from 'express';
import { formUaToWorldController } from '../../controllers/forms/formUaToWorldController.js';

const router = Router();

router.post('/uaToWorld', formUaToWorldController);

export default router;
