// залишаємо тільки + і цифри; прибираємо пробіли/дефіси/дужки
export const normPhone = (raw = '') => {
  const only = String(raw).replace(/[^\d+]/g, '');
  return only.startsWith('+') ? only : `+${only}`;
};

// промокод: trim + нижній регістр
export const normCode = (s = '') => String(s).trim().toLowerCase();
