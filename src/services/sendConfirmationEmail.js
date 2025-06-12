import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: 'reklamacja@ivancom.eu',
    pass: 'IvankomSuper2025@1',
  },
});

const sendConfirmationEmail = async (toEmail) => {
  const message = `
    Дякуємо, рекламацію прийнято. Просимо очікувати на відповідь. Термін розгляду — до 30 днів.<br><br>
    <i>Це повідомлення згенеровано автоматично, відповідати на нього не потрібно.</i>
  `;

  try {
    await transporter.sendMail({
      from: 'IVANCOM <reklamacja@ivancom.eu>',
      to: toEmail,
      subject: 'Підтвердження заявки на рекламацію',
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

export default sendConfirmationEmail;
