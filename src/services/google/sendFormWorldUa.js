import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1UNIhCXjiV-OmgrBBFlLQ4H76fBeGPG9hGUBjOvKg_Ds'; // ID вашої таблиці
const range = 'Sheet1!A1:AZ1'; // Діапазон, в якому знаходяться заголовки

export const writeFormDataWorldUa = async (data) => {
  try {
    // Отримуємо заголовки з Google Sheets
    const headers = await getHeaders(spreadsheetId, range);
    console.log('Отримані заголовки:', headers);
    // Перевіряємо, чи заголовки отримані успішно
    // Преобразуємо дані в масив значень, які відповідають заголовкам
    const values = headers.map((header) => {
      switch (header) {
        case 'ids':
          return data.id || '';
        case 'agreement':
          return data.agreement || '';
        case 'orderAmount':
          return data.orderAmount || '';
        case 'sendDate':
          return data.sendDate || '';
        case 'hidePhone':
          return data.hidePhone || '';
        case 'createdAt':
          return data.createdAt || '';
        case 'updatedAt':
          return data.updatedAt || '';
        case 'recipientPhone':
          return data.recipientPhone || '';
        case 'recipientName':
          return data.recipientName || '';
        case 'recipientSurname':
          return data.recipientSurname || '';
        case 'senderEmail':
          return data.senderEmail || '';
        case 'content':
          return data.content || '';
        case 'senderSurname':
          return data.senderSurname || '';
        case 'carrier':
          return data.carrier || '';
        case 'trackingNumber':
          return data.trackingNumber || '';
        case 'senderName':
          return data.senderName || '';
        case 'senderPhone':
          return data.senderPhone || '';
        case 'promoCode':
          return data.promoCode || '';
        case 'currency':
          return data.currency || '';

        case 'npDepartment':
          return data.npDepartment || '';
        case 'city':
          return data.city || '';
        case 'region':
          return data.region || '';
        case 'pay':
          return data.currencypay || 'тест';
        default:
          return '';
      }
    });

    // Записуємо дані в таблицю
    await appendData(spreadsheetId, 'Sheet1!A4', values);
  } catch (error) {
    console.error('Помилка при записі даних:', error);
  }
};
