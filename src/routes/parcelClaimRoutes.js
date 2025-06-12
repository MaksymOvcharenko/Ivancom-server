import { Router } from 'express';
import { createClaimController } from '../controllers/parcelClaimController.js';

const router = Router();

router.post('/', createClaimController);
console.log('ParcelClaimRoutes loaded');
export default router;
