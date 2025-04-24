import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const sendEmail = async ({
  ttn,
  senderFirstName,
  senderLastName,
  senderPhone,
  senderEmail,
  recipientFirstName,
  recipientLastName,
  recipientPhone,
  recipientEmail,
  deliveryOption,
  branch,
  inpost_number,
  location,
  locality,
  administrativeAreaLevel1,
  apart,
  postalCode,
  country,
  parcelDescription,
  payer,
  dataConsent,
  rateFromPLNtoUAH,
  promoCode,
}) => {
  const toName =
    payer === 'recipient'
      ? `${recipientFirstName} ${recipientLastName}`
      : `${senderFirstName} ${senderLastName}`;
  const toEmail = payer === 'recipient' ? recipientEmail : senderEmail;

  let message = `
    <p>Доброго дня! Вас вітає транспортна компанія IVANCOM.</p>
    <p>Шановний/на ${toName}, нижче наведені Ваші дані:</p>
    <p>
        <strong>Номер ТТН:</strong> ${ttn}<br>
  `;

  if (deliveryOption === 'branch' && branch) {
    message += `<strong>Варіант доставки:</strong> Відділення Ivancom ${branch}<br>`;
  } else if (deliveryOption === 'ivancom-courier') {
    message += `<strong>Варіант доставки:</strong> Кур'єр Ivancom<br>`;
  } else if (deliveryOption === 'dhl') {
    message += `<strong>Варіант доставки:</strong> Доставка за межі Польщі<br>`;
  } else if (deliveryOption === 'inpost') {
    if (inpost_number) {
      message += `<strong>Варіант доставки:</strong> Поштомат Inpost ${inpost_number}<br>`;
    } else {
      message += `<strong>Варіант доставки:</strong> Кур'єр Inpost<br>`;
    }
  }

  if (
    deliveryOption === 'ivancom-courier' ||
    deliveryOption === 'dhl' ||
    (deliveryOption === 'inpost' && !inpost_number)
  ) {
    message += `<strong>Адреса доставки:</strong> ${administrativeAreaLevel1}, ${locality}, ${location}, ${apart}<br>`;
  }

  message += ` 
      <strong>Отримувач:</strong> ${recipientFirstName} ${recipientLastName}<br>
      <strong>Телефон отримувача:</strong> <a href='tel:${recipientPhone}'>${recipientPhone}</a><br>
      <strong>Опис відправлення:</strong> ${parcelDescription}<br>
      <strong>Промокод:</strong> ${promoCode || 'Не вказано'}<br>
      <strong>Країна:</strong> ${country}<br>
      
  </p>
  <p>Дякуємо Вам, що обрали нашу поштову службу!</p>
  <p>З повагою, команда IVANCOM.<br>
  <a href='https://ivancom.eu/'>https://ivancom.eu/</a></p>
`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_MAILER_SMPT_USER,
      pass: process.env.NODE_MAILER_SMPT_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: 'ivancom.krakow@gmail.com',
      to: toEmail,
      subject: `Заявка відправки посилки №${ttn}`,
      html: message,
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email. Error: ${error.message}`,
    };
  }
};

export default sendEmail;
