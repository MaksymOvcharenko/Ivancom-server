import express from 'express';
import { createShipment } from '../controllers/createPackageGenerator.js';



const router = express.Router();

router.post('/', createShipment); // Створення нової посилки
export default router;
