import express from 'express';
import parcelRoutes from './parcels.js';
import userRoutes from './users.js';
import addressRoutes from './address.js';
import paymentsRoutes from './payments.js';
import shipmentsRoutes from './shipments.js';
import packageGeneratorRoutes from './packageGenerator.js';
const router = express.Router();

// Підключення кожного роута
router.use('/parcels', parcelRoutes);
router.use('/users', userRoutes);
router.use('/address', addressRoutes);
router.use('/payments', paymentsRoutes);
router.use('/shipments', shipmentsRoutes);
router.use('/generate-package', packageGeneratorRoutes);
// Інші групи роутів можна додати тут
// router.use('/example', exampleRoutes);

export default router;
