import { Router } from 'express';
import { formTransferController } from '../../controllers/forms/formTransfer.js';

const router = Router();

router.post('/transfer', formTransferController);

export default router;
