// src/utils/sendPaidEmailOnce.js
import "dotenv/config";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import User from "../db/models/users.js";
import Shipment from "../db/models/shipments.js";
import Address from "../db/models/address.js";
import Parcel from "../db/models/parcels.js";
import Payment from "../db/models/payments.js";

// === ПІДКЛЮЧЕННЯ ТВОЇХ МОДЕЛЕЙ (шляхи під себе) ===

// Якщо у тебе sequelize експортиться окремо — переконайся, що ініціалізація вже виконана
// import sequelize from "../db.js"; // за потреби

// --- SMTP transporter (твій OVH) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "ssl0.ovh.net",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "office@ivancom.eu",
    pass: process.env.SMTP_PASS, // ВИНЕСИ У .env
  },
});

// --- HELPERS ---
function buildReadableAddress(addr) {
  if (!addr) return "-";
  if (addr.delivery_method === "department" && addr.np_branch) {
    return `${addr.np_branch}`;
  }
  if (addr.inpost_branch_number) {
    return `Paczkomat ${addr.inpost_branch_number}${addr.city ? `, ${addr.city}` : ""}`;
  }
  const parts = [
    addr.city && `${addr.city}`,
    addr.street && `${addr.street}`,
    addr.building_number && `буд. ${addr.building_number}`,
    addr.apartment_number && `кв. ${addr.apartment_number}`,
    addr.floor_number && `пов. ${addr.floor_number}`,
    addr.postal_code && `${addr.postal_code}`,
    addr.country && `${addr.country}`,
  ].filter(Boolean);
  return parts.join(", ");
}

function buildEmailHtml({ sender, recipient, senderAddress, recipientAddress, parcel, shipment }) {
  const declValue = parcel?.estimated_value ?? "-";
  const dims = parcel
    ? `${parcel.length}×${parcel.width}×${parcel.height} см; вага: ${parcel.weight_actual ?? "-"} кг`
    : "-";
  const desc = parcel?.description?.contents ?? "-";
  const paidAmount = parcel?.price ?? "-";
  const inpostCode = shipment?.inpost_code || "-";
  const npTtn = shipment?.np_tracking_number || "-";
  const trackUrl = `https://package-ivancom.vercel.app/tracking?id=${shipment?.id}`;

  return `
<table style="font-family: Arial, sans-serif; line-height:1.6; color:#333; width:100%; max-width:600px; margin:0 auto; border-collapse:collapse;">
  <tr><td>
    <h2 style="color:#007bff;">Привіт, ${sender?.first_name ?? ""} ${sender?.last_name ?? ""}!</h2>
    <p>Дякуємо за оплату. Нижче — дані для комплектації відправлення.</p>

    <h3>Інформація про посилку:</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
      <tr><td style="padding:5px 0;"><strong>Оголошена вартість:</strong></td><td>${declValue} zł</td></tr>
      <tr><td style="padding:5px 0;"><strong>Габарити:</strong></td><td>${dims}</td></tr>
      <tr><td style="padding:5px 0;"><strong>Опис відправлення:</strong></td><td>${desc}</td></tr>
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Відправник:</strong></td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">
          Ім'я: ${sender?.first_name ?? ""}, Прізвище: ${sender?.last_name ?? ""}, Тел: ${sender?.phone ?? ""}, Email: ${sender?.email ?? ""}
        </td>
      </tr>
      <tr><td style="padding:5px 0;"><strong>Адреса відправника:</strong></td><td>${buildReadableAddress(senderAddress)}</td></tr>
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Отримувач:</strong></td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">
          Ім'я: ${recipient?.first_name ?? ""}, Прізвище: ${recipient?.last_name ?? ""}, Тел: ${recipient?.phone ?? ""}, Email: ${recipient?.email ?? ""}
        </td>
      </tr>
      <tr><td style="padding:5px 0;"><strong>Адреса отримувача:</strong></td><td>${buildReadableAddress(recipientAddress)}</td></tr>
      <tr><td style="padding:5px 0;"><strong>Сплачена сума:</strong></td><td>${paidAmount} zł</td></tr>
    </table>

    <h3>Деталі доставки:</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
      <tr>
        <td style="padding:5px 0;"><strong>Код надання (InPost):</strong></td>
        <td>${inpostCode}</td>
        <td style="padding:5px 0; color:red;"><strong>Термін дії 14 днів</strong></td>
      </tr>
      <tr><td style="padding:5px 0;"><strong>ТТН Нова Пошта:</strong></td><td>${npTtn}</td></tr>
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Слідкуй за посилкою:</strong></td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">
          <a href="${trackUrl}" style="color:#007bff; font-size:20px; text-decoration:none;">Відстежити</a>
        </td>
      </tr>
    </table>

    <div style="text-align:center; margin:24px 0;">
      <p style="margin:0 0 8px 0;">QR-код для наклейки/сканування${inpostCode && inpostCode !== "-" ? ` (InPost: <b>${inpostCode}</b>)` : ""}:</p>
      <img src="cid:qrcodecid" alt="QR Code" style="display:block; margin:0 auto; max-width:320px; width:100%; height:auto;" />
    </div>

    <p>Якщо є питання — напишіть у відповідь на лист. Гарного дня!</p>
    <p>Email: ivancominpost@gmail.com</p>
    <a href="https://ivancom.eu/">Ivancom.eu</a>
  </td></tr>
</table>`;
}


// --- ОСНОВНЕ: взяти з БД, згенерити QR, відправити ---
export async function sendPaidEmailOnce(
  shipmentId,
  { toOverride, ccRecipient = true } = {}
) {
  const shipment = await Shipment.findByPk(shipmentId, {
    include: [
      { model: User, as: "sender", attributes: { exclude: ["password"] } },
      { model: User, as: "recipient", attributes: { exclude: ["password"] } },
      { model: Address, as: "senderAddress" },
      { model: Address, as: "recipientAddress" },
      { model: Parcel },
      { model: Payment },
    ],
  });

  if (!shipment) throw new Error(`Shipment #${shipmentId} not found`);

  const view = {
    shipment: {
      id: shipment.id,
      inpost_code: shipment.inpost_code,
      np_tracking_number: shipment.np_tracking_number,
      created_at: shipment.createdAt,
      updated_at: shipment.updatedAt,
    },
    sender: shipment.sender,
    recipient: shipment.recipient,
    senderAddress: shipment.senderAddress,
    recipientAddress: shipment.recipientAddress,
    parcel: shipment.Parcel ?? shipment.parcel ?? null,
    payment: shipment.Payment ?? shipment.payment ?? null,
  };

  const qrPayload =
    (view.shipment.inpost_code && String(view.shipment.inpost_code).trim()) ||
    (view.shipment.np_tracking_number && String(view.shipment.np_tracking_number).trim()) ||
    String(view.shipment.id);

  const qrBuffer = await QRCode.toBuffer(qrPayload, {
    type: "png",
    width: 360,
    errorCorrectionLevel: "M",
  });

  const html = buildEmailHtml({
    sender: view.sender,
    recipient: view.recipient,
    senderAddress: view.senderAddress,
    recipientAddress: view.recipientAddress,
    parcel: view.parcel,
    shipment: view.shipment,
  });

  // головне: відправляємо ВІДПРАВНИКУ
  const toEmail = toOverride || view.sender?.email;
  if (!toEmail) throw new Error("Sender email is missing");
  console.log("Sending paid email to (sender):", toEmail);

  const info = await transporter.sendMail({
    from: `"Ivancom" <${process.env.SMTP_USER || "office@ivancom.eu"}>`,
    to: toEmail,
    cc: ccRecipient && view.recipient?.email ? view.recipient.email : undefined,
    subject: `Інформація для відправника по відправленню №${view.shipment.id}`,
    html,
    attachments: [
      {
        filename: `qr-${qrPayload}.png`,
        content: qrBuffer,
        cid: "qrcodecid",
      },
    ],
  });

  return info;
}


// --- CLI запуск: node src/utils/sendPaidEmailOnce.js <shipmentId> ---
