// controllers/payment1cController.js
import { Op } from "sequelize";
import Payment1C from "../db/models/Payment1C.js";

const SORT_WHITELIST = new Set([
  "created_at", "updated_at", "act_number", "status", "pay_method", "amount_uah", "amount_pln"
]);

export async function listPayments1c(req, res) {
  try {
    const {
      page = "1",
      pageSize = "20",
      q = "",
      status = "",
      method = "",
      from = "",
      to = "",
      sortBy = "created_at",
      sortDir = "DESC",
    } = req.query;

    const limit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pageNum - 1) * limit;

    const where = {};
    if (status) where.status = String(status).toLowerCase();
    if (method) where.pay_method = String(method).toLowerCase();

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to) where.created_at[Op.lte] = new Date(to);
    }

    if (q) {
      const like = { [Op.iLike]: `%${q}%` };
      where[Op.or] = [
        { act_number: like },
        { email: like },
        { phone: like },
        { np_ttn: like },
        { gateway_order_id: like },
      ];
    }

    const orderField = SORT_WHITELIST.has(String(sortBy)) ? String(sortBy) : "created_at";
    const orderDir = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { rows, count } = await Payment1C.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDir]],
      // віддаємо тільки потрібні колонки
      attributes: [
        "id","act_number","amount_uah","amount_pln","pay_method",
        "email","phone","np_ttn","link_token","payment_url",
        "gateway_order_id","status","created_at","updated_at"
      ],
    });

    return res.json({
      total: count,
      page: pageNum,
      pageSize: limit,
      items: rows,
    });
  } catch (e) {
    console.error("listPayments1c error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
