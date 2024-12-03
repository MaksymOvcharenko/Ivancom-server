import express from 'express';
import { createUser } from '../controllers/user.js';



const router = express.Router();

router.post('/',createUser); // Створення нової посилки


export default router;
