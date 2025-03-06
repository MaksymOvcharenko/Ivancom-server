import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1UNIhCXjiV-OmgrBBFlLQ4H76fBeGPG9hGUBjOvKg_Ds'; // ID вашої таблиці
const range = 'Sheet1!A1:AZ1'; // Діапазон, в якому знаходяться заголовки

export const writeFormDataWorldUa = async (data) => {
  try {
    // Отримуємо заголовки з Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуємо дані в масив значень, які відповідають заголовкам
    const values = headers.map((header) => {
      switch (header) {
        case 'ids':
          return data.id || '';
        case 'agreement':
          return data.agreement || '';
        case 'orderAmount':
          return data.order_amount || '';
        case 'sendDate':
          return data.send_date || '';
        case 'hidePhone':
          return data.hide_phone || '';
        case 'createdAt':
          return data.created_at || '';
        case 'updatedAt':
          return data.updated_at || '';
        case 'recipientPhone':
          return data.recipient_phone || '';
        case 'recipientName':
          return data.recipient_name || '';
        case 'recipientSurname':
          return data.recipient_surname || '';
        case 'senderEmail':
          return data.sender_email || '';
        case 'content':
          return data.content || '';
        case 'senderSurname':
          return data.sender_surname || '';
        case 'carrier':
          return data.carrier || '';
        case 'trackingNumber':
          return data.tracking_number || '';
        case 'senderName':
          return data.sender_name || '';
        case 'senderPhone':
          return data.sender_phone || '';
        case 'promoCode':
          return data.promo_code || '';
        case 'currency':
          return data.currency || '';
        case 'npDepartment':
          return data.np_department || '';
        case 'city':
          return data.city || '';
        case 'region':
          return data.region || '';
        default:
          return ''; // Пусте значення, якщо немає відповідного поля
      }
    });

    // Записуємо дані в таблицю
    await appendData(spreadsheetId, 'Sheet1!A4', values);
  } catch (error) {
    console.error('Помилка при записі даних:', error);
  }
};
