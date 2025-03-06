import { Router } from 'express';
import { formWorlduaController } from '../../controllers/forms/formWorlduaController.js';

const router = Router();

router.post('/worldtoua', formWorlduaController);

export default router;
