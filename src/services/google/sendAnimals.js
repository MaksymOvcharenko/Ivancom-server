import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1zAnszt7CJeVukTGY4uaMD-zzz9ZMh4KOesAcwZOGAnw'; // ID вашої таблиці
const range = 'Sheet1!A1:Z1'; // Діапазон, в якому знаходяться заголовки

export const writeFormDataAnimals = async (data) => {
  try {
    // Отримуємо заголовки з Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуємо дані в масив значень, які відповідають заголовкам
    const values = headers.map((header) => {
      switch (header) {
        case 'ID':
          return data.id || '';
        case 'Poroda':
          return data.poroda || '';
        case 'WeightAnimals':
          return data.weightAnimals || '';
        case 'TypeAnimals':
          return data.typeAnimals || '';
        case 'Agreement':
          return data.agreement || '';
        case 'For':
          return data.for || '';
        case 'From':
          return data.from || '';
        case 'SendDate':
          return data.sendDate || '';
        case 'HidePhone':
          return data.hidePhone || '';
        case 'SenderPhone':
          return data.senderPhone || '';
        case 'SenderEmail':
          return data.senderEmail || '';
        case 'SenderSurname':
          return data.senderSurname || '';
        case 'SenderName':
          return data.senderName || '';
        case 'FileLinks':
          return data.fileLinks.join(', ') || ''; // Якщо кілька лінків, об'єднуємо їх
        case 'CreatedAt':
          return data.createdAt || '';
        case 'UpdatedAt':
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
