import express from 'express';
import { createUser } from '../controllers/user.js';

const router = express.Router();

// Роут для создания нового пользователя
router.post('/users', createUser);

export default router;
