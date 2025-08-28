// routes/businessClient.routes.js
import { Router } from 'express';

import { adminOnly, authRequired } from '../../middleware/authMiddleware.js';
import BusinessClient from '../../db/models/bussines/BusinessClient.js';

const router = Router();

// Список активних бізнесів (для селектора адміна)
router.get('/', authRequired, async (req, res) => {
  try {
    const rows = await BusinessClient.findAll({
      where: { status: 'active' },
      attributes: ['id', 'code', 'name', 'status', 'created_at'],
      order: [['name', 'ASC']],
    });
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Створити бізнес (admin-only)
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name)
      return res.status(400).json({ error: 'code & name required' });

    const exists = await BusinessClient.findOne({ where: { code } });
    if (exists) return res.status(409).json({ error: 'code already exists' });

    const row = await BusinessClient.create({ code, name, status: 'active' });
    res.status(201).json({ business_client: row });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
