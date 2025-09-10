import PromoCodeUsage from '../db/models/promo_code_usage.js';
import User from '../db/models/users.js';

import { normPhone, normCode } from '../utils/promo.js';

/**
 * POST /api/promo/validate-by-phone
 * body: { phone: string, code: string }
 * resp: { userFound, userId, available, alreadyUsed }
 */
export async function validateByPhone(req, res) {
  try {
    const phoneRaw = req.body?.phone ?? '';
    const codeRaw = req.body?.code ?? '';

    const phone = normPhone(phoneRaw);
    const code = normCode(codeRaw);

    if (!phone || !code) {
      return res.status(400).json({ ok: false, error: 'bad_input' });
    }

    // шукаємо юзера: спробуємо по нормалізованому і по raw (бо поле phone у тебе як є)
    let user = await User.findOne({ where: { phone } });
    if (!user && phoneRaw && phoneRaw !== phone) {
      user = await User.findOne({ where: { phone: phoneRaw } });
    }

    // якщо юзера ще нема — UX: вважаємо, що код НЕ використовувався цим номером
    if (!user) {
      return res.json({
        userFound: false,
        userId: null,
        available: true,
        alreadyUsed: false,
      });
    }

    // чи є запис у таблиці використаних промокодів
    const used = await PromoCodeUsage.findOne({
      where: { user_id: user.id, code_norm: code },
      attributes: ['id'],
    });

    return res.json({
      userFound: true,
      userId: user.id,
      available: !used,
      alreadyUsed: !!used,
    });
  } catch (err) {
    console.error('validate-by-phone error:', err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
}
