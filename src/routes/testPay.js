import express from "express";
import Payment1C from "../db/models/Payment1C.js";


const router = express.Router();

/**
 * Тестовий фейковий роут оплати
 * Приклад запиту:
 *   GET /api/test/pay/ACT-2025-001
 */
router.get("/pay/test/:actNumber", async (req, res) => {
  try {
    const { actNumber } = req.params;

    // шукаємо запис у БД
    const payment = await Payment1C.findOne({ where: { act_number: actNumber } });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Акт не знайдено" });
    }

    // оновлюємо статус
    payment.status = "paid";
    payment.updated_at = new Date(); // оновлюємо дату вручну, бо timestamps: false
    await payment.save();

    return res.json({
      success: true,
      message: `Акт ${actNumber} відмічено як оплачений`,
      data: {
        id: payment.id,
        act_number: payment.act_number,
        amount_uah: payment.amount_uah,
        amount_pln: payment.amount_pln,
        status: payment.status
      }
    });
  } catch (err) {
    console.error("❌ Помилка при оновленні статусу:", err);
    return res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

export default router;
