// import User from '../models/user.js' // якщо треба вище в коді

import PromoCodeUsage from '../db/models/promo_code_usage.js';

/* ==== ЛОКАЛЬНИЙ "JSON-довідник" політик ==== */
const PROMO_POLICY = {
  // одноразові конкретні коди (нижній регістр)
  singleUseCodes: ['mat25'],
  // або за префіксами (теж нижній регістр)
  singleUsePrefixes: ['one-', 'excl-', 'single-'],
};

/* ==== ХЕЛПЕРИ ==== */
const normCode = (s = '') => String(s).trim().toLowerCase();
const isSingleUse = (raw) => {
  const c = normCode(raw);
  if (!c) return false;
  if (PROMO_POLICY.singleUseCodes.includes(c)) return true;
  return PROMO_POLICY.singleUsePrefixes.some((p) => c.startsWith(p));
};

/**
 * Позначити використання промокоду, якщо він одноразовий.
 * Для багаторазових — нічого не пишемо.
 * Повертає об’єкт статусу, щоб ти міг вирішити, що робити далі.
 */
export async function markPromoUsageIfNeeded(userId, promoCode) {
  const uid = Number(userId);
  const code = normCode(promoCode);

  if (!uid || !code) {
    return { ok: false, wrote: false, status: 'bad_input' };
  }

  if (!isSingleUse(code)) {
    return { ok: true, wrote: false, status: 'skipped_unlimited' };
  }

  try {
    await PromoCodeUsage.create({
      user_id: uid,
      code_norm: code,
      used_at: new Date(),
    });
    return { ok: true, wrote: true, status: 'created' };
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      // вже є запис (user_id, code_norm)
      return { ok: true, wrote: false, status: 'already_used' };
    }
    console.error('markPromoUsageIfNeeded error:', e);
    return { ok: false, wrote: false, status: 'error' };
  }
}
