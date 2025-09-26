export function oneCAuth(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token || token !== process.env.EMAIL_API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
export async function createMonoInvoiceStub({ payment }) {
  // імітуємо відповідь монобанку
  return {
    invoiceId: `mono-${payment.id}`,
    pageUrl: `https://pay.monobank.ua/stub/${payment.id}`,
    raw: { stub: true }
  };
}
export async function createP24Stub({ payment }) {
  // імітуємо відповідь p24
  return {
    orderId: `p24-${payment.id}`,
    paymentUrl: `https://secure.przelewy24.pl/trnRequest/stub-${payment.id}`,
    raw: { stub: true }
  };
}
export async function sendPaymentEmailStub(to, { subject, contentHtml, payLink }) {
  // просто логуємо для тестів
  console.log("📧 [STUB] email to:", to, { subject, payLink, contentHtml });
  return true;
}
