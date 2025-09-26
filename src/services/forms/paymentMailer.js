import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Точний шлях до шаблону (у цій же папці або поряд)
const templatePath = path.join(__dirname, 'templates', 'shipment-emailPay.html');

// ✅ 2) Читаємо ОДИН раз
let HTML_TEMPLATE = "";
try {
  HTML_TEMPLATE = await fs.readFile(templatePath, "utf-8");
  console.log("✅ Email template loaded:", templatePath);
} catch (e) {
  console.warn("⚠️ Could not read template, will fallback. Reason:", e.message);
  HTML_TEMPLATE = `
    <div style="font-family:Arial,sans-serif">
      [MESSAGE_CONTENT]
      <p style="margin-top:24px;">
        <a href="[PAY_LINK]" style="display:inline-block;padding:12px 18px;text-decoration:none;border-radius:8px;background:#0f62fe;color:#fff;">
          Оплатити
        </a>
      </p>
    </div>`;
}

// 🔐 SMTP: тримаємо креденшали в .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "ssl0.ovh.net",
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true", // 465 = true
  auth: {
    user: process.env.SMTP_USER || "office@ivancom.eu",
    pass: process.env.SMTP_PASS, // поклади в .env
  },
});

// 📨 головна функція
export async function sendPaymentEmail(to, {
  subject = "Посилання на оплату",
  contentHtml = "",   // ← текст із 1С (HTML дозволений)
  payLink,            // ← наш публічний лінк на /pay/:token
}) {
  if (!to) throw new Error("No recipient email");
  if (!payLink) throw new Error("No payment link");

  // підставляємо контент і лінк
  let html = HTML_TEMPLATE.replace("[MESSAGE_CONTENT]", contentHtml || "");
  if (html.includes("[PAY_LINK]")) {
    html = html.replaceAll("[PAY_LINK]", payLink);
  } else {
    // якщо в шаблоні немає плейсхолдера — додамо кнопку в кінці
    html += `
      <p style="margin-top:24px;">
        <a href="${payLink}" style="display:inline-block;padding:12px 18px;text-decoration:none;border-radius:8px;background:#0f62fe;color:#fff;">
          Оплатити
        </a>
      </p>`;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'IVANCOM <office@ivancom.eu>',
    to,
    subject,
    html,
  });

  return { ok: true };
}
