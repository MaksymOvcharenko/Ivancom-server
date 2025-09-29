import express from "express";
import { oneCAuth } from "../utils/payments1c.js";
import { createFrom1C } from "../controllers/payment1cController.js";
import { listPayments1c } from "../controllers/payment1cControllerList.js";


const router = express.Router();
router.get("/payments", /*requireAdmin,*/ listPayments1c);
router.use(oneCAuth);

router.post("/payments", createFrom1C);

export default router;
