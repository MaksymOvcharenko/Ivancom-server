import { google } from 'googleapis';
import path from 'path';

// Модуль аутентифікації
export const authenticate = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join('google_file.json'), // Путь к вашему ключу
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
};

// Получение заголовков из Google Sheets
export const getHeaders = async (spreadsheetId, range) => {
  const authClient = await authenticate();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const request = {
    spreadsheetId,
    range,
  };

  try {
    const response = await sheets.spreadsheets.values.get(request);
    return response.data.values[0]; // Получаем первую строку с заголовками
  } catch (error) {
    console.error('Ошибка при получении заголовков:', error);
  }
};

// Запись данных в Google Sheets (вставка строки ниже заголовков)
export const appendData = async (spreadsheetId, range, values) => {
  const authClient = await authenticate();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const request = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [values],
    },
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log('Данные успешно добавлены:', response.data);
  } catch (error) {
    console.error('Ошибка при добавлении данных:', error);
  }
};
