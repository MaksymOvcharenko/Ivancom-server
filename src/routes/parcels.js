import express from 'express';
import { createParcel, getParcelById, getParcels } from '../controllers/parcels.js';


const router = express.Router();

router.post('/', createParcel); // Створення нової посилки
router.get('/', getParcels); // Отримання всіх посилок
router.get('/:id', getParcelById); // Отримання посилки за ID

export default router;
