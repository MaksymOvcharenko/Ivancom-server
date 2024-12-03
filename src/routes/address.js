import express from 'express';
import { createAddress, deleteAddress, getAddressById, getAllAddresses } from '../controllers/address.js';


const router = express.Router();

// Маршрути для адрес
router.post('/', createAddress); // Створення нової адреси
router.get('/', getAllAddresses); // Отримання всіх адрес
router.get('/:id', getAddressById); // Отримання адреси за ID
router.delete('/:id', deleteAddress); // Видалення адреси

export default router;
