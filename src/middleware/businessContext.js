// middleware/businessContext.js
export function resolveBusinessContext(req, res, next) {
  const role = req.user?.role;
  const own = req.user?.business_client_id || null;
  const headerId = req.headers['x-business-id'] || null;

  // user — працює тільки у своєму бізнесі
  if (role === 'user') {
    req.context = { businessClientId: own };
    return next();
  }

  // admin — може явно обрати бізнес через заголовок
  if (role === 'admin') {
    req.context = { businessClientId: headerId || null };
    return next();
  }

  req.context = { businessClientId: null };
  next();
}
