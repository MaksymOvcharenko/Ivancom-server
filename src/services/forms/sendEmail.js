// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();
// const sendEmail = async ({
//   ttn,
//   senderFirstName,
//   senderLastName,
//   senderPhone,
//   senderEmail,
//   recipientFirstName,
//   recipientLastName,
//   recipientPhone,
//   recipientEmail,
//   deliveryOption,
//   branch,
//   inpost_number,
//   location,
//   locality,
//   administrativeAreaLevel1,
//   apart,
//   postalCode,
//   country,
//   parcelDescription,
//   payer,
//   dataConsent,
//   rateFromPLNtoUAH,
//   promoCode,
//   holod,
//   house,
// }) => {
//   const toName =
//     payer === 'recipient'
//       ? `${recipientFirstName} ${recipientLastName}`
//       : `${senderFirstName} ${senderLastName}`;
//   const toEmail = payer === 'recipient' ? recipientEmail : senderEmail;

//   let message = `
//     <p>Доброго дня! Вас вітає транспортна компанія IVANCOM.</p>
//     <p>Шановний/на ${toName}, нижче наведені Ваші дані:</p>
//     <p>
//         <strong>Номер ТТН:</strong> ${ttn}<br>
//   `;

//   if (deliveryOption === 'branch' && branch) {
//     message += `<strong>Варіант доставки:</strong> Відділення Ivancom ${branch}<br>`;
//   } else if (deliveryOption === 'ivancom-courier') {
//     message += `<strong>Варіант доставки:</strong> Кур'єр Ivancom<br>`;
//   } else if (deliveryOption === 'dhl') {
//     message += `<strong>Варіант доставки:</strong> Доставка за межі Польщі<br>`;
//   } else if (deliveryOption === 'inpost') {
//     if (inpost_number) {
//       message += `<strong>Варіант доставки:</strong> Поштомат Inpost ${inpost_number}<br>`;
//     } else {
//       message += `<strong>Варіант доставки:</strong> Кур'єр Inpost<br>`;
//     }
//   }
//   if (holod === 1) {
//     message += `<strong>Варіант доставки:</strong> Обрана доставка в холоді, доплата + 50 зл.<br>`;
//   }
//   if (
//     deliveryOption === 'ivancom-courier' ||
//     deliveryOption === 'dhl' ||
//     (deliveryOption === 'inpost' && !inpost_number)
//   ) {
//     message += `<strong>Адреса доставки:</strong> ${administrativeAreaLevel1}, ${locality}, ${location},${house}/ ${apart}<br>`;
//   }

//   message += `
//       <strong>Отримувач:</strong> ${recipientFirstName} ${recipientLastName}<br>
//       <strong>Телефон отримувача:</strong> <a href='tel:${recipientPhone}'>${recipientPhone}</a><br>
//       <strong>Опис відправлення:</strong> ${parcelDescription}<br>
//       <strong>Промокод:</strong> ${promoCode || 'Не вказано'}<br>
//       <strong>Країна:</strong> ${country}<br>

//   </p>
//   <p>Дякуємо Вам, що обрали нашу поштову службу!</p>
//   <p>З повагою, команда IVANCOM.<br>
//   <a href='https://ivancom.eu/'>https://ivancom.eu/</a></p>
// `;

//   // const transporter = nodemailer.createTransport({
//   //   service: 'gmail',
//   //   auth: {
//   //     user: process.env.NODE_MAILER_SMPT_USER,
//   //     pass: process.env.NODE_MAILER_SMPT_PASSWORD,
//   //   },
//   // }); // гмайл
//   const transporter = nodemailer.createTransport({
//     host: 'ssl0.ovh.net',
//     port: 465,
//     secure: true, // SSL/TLS
//     auth: {
//       user: 'office@ivancom.eu',
//       pass: 'IvankomSuper2025@1', // або той пароль, що точно працює
//     },
//   }); // оvh

//   try {
//     await transporter.sendMail({
//       // from: 'ivancom.krakow@gmail.com',// гмаил
//       from: 'IVANCOM <office@ivancom.eu>', // оvh
//       to: toEmail,
//       subject: `Заявка відправки посилки №${ttn}`,
//       html: message,
//     });
//     return { success: true, message: 'Email sent successfully' };
//   } catch (error) {
//     return {
//       success: false,
//       message: `Failed to send email. Error: ${error.message}`,
//     };
//   }
// };

// // export default sendEmail;
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import fs from 'fs/promises';
// import path from 'path';

// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const templatePath = path.join(__dirname, 'templates', 'shipment-email.html');
// const html = await fs.readFile(templatePath, 'utf-8');
// dotenv.config();

// const sendEmail = async (props) => {
//   const {
//     ttn,
//     senderFirstName,
//     senderLastName,

//     senderEmail,
//     recipientFirstName,
//     recipientLastName,
//     recipientPhone,
//     recipientEmail,
//     deliveryOption,
//     branch,
//     inpost_number,
//     location,
//     locality,
//     administrativeAreaLevel1,
//     apart,

//     country,
//     parcelDescription,
//     payer,

//     promoCode,
//     holod,
//     house,
//   } = props;

//   const toName =
//     payer === 'recipient'
//       ? `${recipientFirstName} ${recipientLastName}`
//       : `${senderFirstName} ${senderLastName}`;
//   const toEmail = payer === 'recipient' ? recipientEmail : senderEmail;

//   let messageContent = `
//     <p>Доброго дня! Вас вітає транспортна компанія IVANCOM.</p>
//     <p>Шановний/на ${toName}, нижче наведені Ваші дані:</p>
//     <p>
//       <strong>Номер ТТН:</strong> ${ttn}<br>
//   `;

//   if (deliveryOption === 'branch' && branch) {
//     messageContent += `<strong>Варіант доставки:</strong> Відділення Ivancom ${branch}<br>`;
//   } else if (deliveryOption === 'ivancom-courier') {
//     messageContent += `<strong>Варіант доставки:</strong> Кур'єр Ivancom<br>`;
//   } else if (deliveryOption === 'dhl') {
//     messageContent += `<strong>Варіант доставки:</strong> Доставка за межі Польщі<br>`;
//   } else if (deliveryOption === 'inpost') {
//     if (inpost_number) {
//       messageContent += `<strong>Варіант доставки:</strong> Поштомат Inpost ${inpost_number}<br>`;
//     } else {
//       messageContent += `<strong>Варіант доставки:</strong> Кур'єр Inpost<br>`;
//     }
//   }

//   if (holod === 1) {
//     messageContent += `<strong>Варіант доставки:</strong> Обрана доставка в холоді, доплата + 50 зл.<br>`;
//   }

//   if (
//     deliveryOption === 'ivancom-courier' ||
//     deliveryOption === 'dhl' ||
//     (deliveryOption === 'inpost' && !inpost_number)
//   ) {
//     messageContent += `<strong>Адреса доставки:</strong> ${administrativeAreaLevel1}, ${locality}, ${location}, ${house}/${apart}<br>`;
//   }

//   messageContent += `
//       <strong>Отримувач:</strong> ${recipientFirstName} ${recipientLastName}<br>
//       <strong>Телефон отримувача:</strong> <a href='tel:${recipientPhone}'>${recipientPhone}</a><br>
//       <strong>Опис відправлення:</strong> ${parcelDescription}<br>
//       <strong>Промокод:</strong> ${promoCode || 'Не вказано'}<br>
//       <strong>Країна:</strong> ${country}<br>
//     </p>
//     <p>Дякуємо Вам, що обрали нашу поштову службу!</p>
//     <p>З повагою, команда IVANCOM.<br>
//     <a href='https://ivancom.eu/'>https://ivancom.eu/</a></p>
//   `;

//   // Завантажуємо шаблон
//   const templatePath = path.join(
//     process.cwd(),
//     'templates',
//     'shipment-email.html',
//   );
//   let html;

//   try {
//     html = await fs.readFile(templatePath, 'utf-8');
//     console.log('💌 html content:', html);
//     // Підставляємо значення
//     html = html.replace('[MESSAGE_CONTENT]', messageContent);
//   } catch (error) {
//     return {
//       success: false,
//       message: `Помилка при читанні шаблону: ${error.message}`,
//     };
//   }

//   // Надсилання
//   const transporter = nodemailer.createTransport({
//     host: 'ssl0.ovh.net',
//     port: 465,
//     secure: true,
//     auth: {
//       user: 'office@ivancom.eu',
//       pass: 'IvankomSuper2025@1',
//     },
//   });

//   try {
//     await transporter.sendMail({
//       from: 'IVANCOM <office@ivancom.eu>',
//       to: toEmail,
//       subject: `Заявка відправки посилки №${ttn}`,
//       html,
//     });

//     return { success: true, message: 'Email sent successfully' };
//   } catch (error) {
//     return {
//       success: false,
//       message: `Failed to send email. Error: ${error.message}`,
//     };
//   }
// };

// export default sendEmail;

// sendEmail({
//   ttn: 'IVC123456789',
//   senderFirstName: 'Іван',
//   senderLastName: 'Петренко',
//   senderEmail: 'maxmersin@gmail.com',

//   recipientFirstName: 'Олена',
//   recipientLastName: 'Іваненко',
//   recipientPhone: '+380501112233',
//   recipientEmail: 'maxmersin@gmail.com',

//   deliveryOption: 'inpost', // або 'branch', 'ivancom-courier', 'dhl'
//   branch: 'Краків-1',
//   inpost_number: 'KR12345',
//   location: 'ul. Jana Pawła II',
//   locality: 'Kraków',
//   administrativeAreaLevel1: 'Małopolskie',
//   apart: '12B',
//   house: '154',

//   country: 'Україна',
//   parcelDescription: 'Документи + зарядка для ноутбука',
//   payer: 'sender', // або 'recipient'
//   promoCode: 'WELCOME10',
//   holod: 1, // якщо доставка в холоді
// })
//   .then(console.log)
//   .catch(console.error);
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ⏬ Ініціалізація змінних шляху до файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Точний шлях до шаблону (у цій же папці або поряд)
const templatePath = path.join(__dirname, 'templates', 'shipment-email.html');

// 🔧 Завантаження шаблону один раз (на старті)
let htmlTemplate = '';
try {
  htmlTemplate = await fs.readFile(templatePath, 'utf-8');
  console.log('✅ HTML шаблон зчитано');
} catch (err) {
  console.error('❌ Помилка при зчитуванні шаблону:', err.message);
}

dotenv.config();

const sendEmail = async (props) => {
  const {
    ttn,
    senderFirstName,
    senderLastName,
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
    country,
    parcelDescription,
    payer,
    promoCode,
    holod,
    house,
  } = props;

  const toName =
    payer === 'recipient'
      ? `${recipientFirstName} ${recipientLastName}`
      : `${senderFirstName} ${senderLastName}`;
  const toEmail = payer === 'recipient' ? recipientEmail : senderEmail;

  let messageContent = `
   
    <p>Шановний/на ${toName}, нижче наведені Ваші дані:</p>
    <p>
      <strong>Номер ТТН:</strong> ${ttn}<br>
  `;

  if (deliveryOption === 'branch' && branch) {
    messageContent += `<strong>Варіант доставки:</strong> Відділення Ivancom ${branch}<br>`;
  } else if (deliveryOption === 'ivancom-courier') {
    messageContent += `<strong>Варіант доставки:</strong> Кур'єр Ivancom<br>`;
  } else if (deliveryOption === 'dhl') {
    messageContent += `<strong>Варіант доставки:</strong> Доставка за межі Польщі<br>`;
  } else if (deliveryOption === 'inpost') {
    if (inpost_number) {
      messageContent += `<strong>Варіант доставки:</strong> Поштомат Inpost ${inpost_number}<br>`;
    } else {
      messageContent += `<strong>Варіант доставки:</strong> Кур'єр Inpost<br>`;
    }
  }

  if (holod === 1) {
    messageContent += `<strong>Варіант доставки:</strong> Обрана доставка в холоді, доплата + 50 зл.<br>`;
  }

  if (
    deliveryOption === 'ivancom-courier' ||
    deliveryOption === 'dhl' ||
    (deliveryOption === 'inpost' && !inpost_number)
  ) {
    messageContent += `<strong>Адреса доставки:</strong> ${administrativeAreaLevel1}, ${locality}, ${location}, ${house}/${apart}<br>`;
  }

  messageContent += `
      <strong>Отримувач:</strong> ${recipientFirstName} ${recipientLastName}<br>
      <strong>Телефон отримувача:</strong> <a href='tel:${recipientPhone}'>${recipientPhone}</a><br>
      <strong>Опис відправлення:</strong> ${parcelDescription}<br>
      <strong>Промокод:</strong> ${promoCode || 'Не вказано'}<br>
      <strong>Країна:</strong> ${country}<br>
    </p>
    <p>Дякуємо Вам, що обрали нашу поштову службу!</p>
 
  `;
  // console.log('🔎 HTML до заміни:\n', htmlTemplate.slice(0, 500));
  // 🔁 Підставляємо в шаблон
  let html = htmlTemplate.replace('[MESSAGE_CONTENT]', messageContent);

  const transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true,
    auth: {
      user: 'office@ivancom.eu',
      pass: 'IvankomSuper2025@1',
    },
  });

  try {
    await transporter.sendMail({
      from: 'IVANCOM <office@ivancom.eu>',
      to: toEmail,
      subject: `Заявка відправки посилки №${ttn}`,
      html,
    });
    // console.log('✅ Лист надіслано:', html);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email. Error: ${error.message}`,
    };
  }
};

export default sendEmail;

// // 👇 Тестовий виклик
// sendEmail({
//   ttn: 'IVC123456789',
//   senderFirstName: 'Іван',
//   senderLastName: 'Петренко',
//   senderEmail: 'maxmersin@gmail.com',
//   recipientFirstName: 'Олена',
//   recipientLastName: 'Іваненко',
//   recipientPhone: '+380501112233',
//   recipientEmail: 'maxmersin@gmail.com',
//   deliveryOption: 'inpost',
//   branch: 'Краків-1',
//   inpost_number: 'KR12345',
//   location: 'ul. Jana Pawła II',
//   locality: 'Kraków',
//   administrativeAreaLevel1: 'Małopolskie',
//   apart: '12B',
//   house: '154',
//   country: 'Україна',
//   parcelDescription: 'Документи + зарядка для ноутбука',
//   payer: 'sender',
//   promoCode: 'WELCOME10',
//   holod: 1,
// })
//   .then(console.log)
//   .catch(console.error);
