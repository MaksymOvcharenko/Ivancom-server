import express from 'express';
import parcelRoutes from './parcels.js';
import userRoutes from './users.js';

const router = express.Router();

// Підключення кожного роута
router.use('/parcels', parcelRoutes);
router.use('/users', userRoutes);

// Інші групи роутів можна додати тут
// router.use('/example', exampleRoutes);

export default router;
