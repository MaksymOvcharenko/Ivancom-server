import express from "express";
import { oneCAuth } from "../utils/payments1c.js";
import { createFrom1C } from "../controllers/payment1cController.js";



const router = express.Router();
router.use(oneCAuth);

router.post("/payments", createFrom1C);

export default router;
