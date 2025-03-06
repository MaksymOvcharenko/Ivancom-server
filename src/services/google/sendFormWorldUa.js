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
        case 'id':
          return data.id || '';
        case 'agreement':
          return data.agreement || '';
        case 'order_amount':
          return data.order_amount || '';
        case 'send_date':
          return data.send_date || '';
        case 'hide_phone':
          return data.hide_phone || '';
        case 'created_at':
          return data.created_at || '';
        case 'updated_at':
          return data.updated_at || '';
        case 'recipient_phone':
          return data.recipient_phone || '';
        case 'recipient_name':
          return data.recipient_name || '';
        case 'recipient_surname':
          return data.recipient_surname || '';
        case 'sender_email':
          return data.sender_email || '';
        case 'content':
          return data.content || '';
        case 'sender_surname':
          return data.sender_surname || '';
        case 'carrier':
          return data.carrier || '';
        case 'tracking_number':
          return data.tracking_number || '';
        case 'sender_name':
          return data.sender_name || '';
        case 'sender_phone':
          return data.sender_phone || '';
        case 'promo_code':
          return data.promo_code || '';
        case 'currency':
          return data.currency || '';
        case 'np_department':
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
