import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1RejOo3NLI0mHBz046G85CAOKRrXTKBh-etXeWfJeE-s'; // ID вашої таблиці
const range = 'Sheet1!A1:AZ1'; // Діапазон, в якому знаходяться заголовки

export const writeFormDataTransfers = async (data) => {
  try {
    // Отримуємо заголовки з Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуємо дані в масив значень, які відповідають заголовкам
    const values = headers.map((header) => {
      switch (header) {
        case 'id':
          return data.id || '';
        case 'senderName':
          return data.senderName || '';
        case 'senderSurname':
          return data.senderSurname || '';
        case 'senderEmail':
          return data.senderEmail || '';
        case 'senderPhone':
          return data.senderPhone || '';
        case 'hidePhone':
          return data.hidePhone || '';
        case 'from':
          return data.from || '';
        case 'for':
          return data.for || '';
        case 'agreement':
          return data.agreement || '';
        case 'sendDate':
          return data.sendDate || '';
        case 'date':
          return new Date().toISOString().slice(0, 16).replace('T', ' ');
        case 'telegramNick':
          return data.telegramNick || '';
        case 'createdAt':
          return data.createdAt || '';
        case 'updatedAt':
          return data.updatedAt || '';

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
