import { Router } from "express";
import { sendPaidEmailOnce } from "../utils/sendPaidEmailOnce.js";



const router = Router();

router.post("/shipments/:id/send-test-mail", async (req, res) => {
  try {
    const { id } = req.params;

    const info = await sendPaidEmailOnce(id);

    return res.json({
      success: true,
      message: "Email sent",
      messageId: info.messageId,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

export default router;
