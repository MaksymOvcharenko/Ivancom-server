import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1zAnszt7CJeVukTGY4uaMD-zzz9ZMh4KOesAcwZOGAnw'; // ID вашої таблиці
const range = 'Sheet1!A1:O1'; // Діапазон, в якому знаходяться заголовки

export const writeFormDataAnimals = async (data) => {
  try {
    // Отримуємо заголовки з Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуємо дані в масив значень, які відповідають заголовкам
    const values = headers.map((header) => {
      switch (header) {
        case 'id':
          return data.id || '';
        case 'poroda':
          return data.poroda || '';
        case 'weightAnimals':
          return data.weightAnimals || '';
        case 'typeAnimals':
          return data.typeAnimals || '';
        case 'agreement':
          return data.agreement || '';
        case 'for':
          return data.for || '';
        case 'from':
          return data.from || '';
        case 'sendDate':
          return data.sendDate || '';
        case 'hidePhone':
          return data.hidePhone || '';
        case 'senderPhone':
          return data.senderPhone || '';
        case 'senderEmail':
          return data.senderEmail || '';
        case 'senderSurname':
          return data.senderSurname || '';
        case 'senderName':
          return data.senderName || '';
        case 'fileLinks':
          return data.fileLinks.join(', ') || ''; // Якщо кілька лінків, об'єднуємо їх
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
