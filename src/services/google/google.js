import { google } from 'googleapis';
import path from 'path';

// import { fileURLToPath } from 'url';

// Получаем путь текущего файла
// const __filename = fileURLToPath(import.meta.url);
// Получаем директорию текущего файла
// const __dirname = path.dirname(__filename);

// Формируем путь к файлу

// Модуль аутентифікації
export const authenticate = async () => {
  // const keyFilePath = path.join(__dirname, 'google_file.json'); // Встановлюємо шлях до ключа LocalHost
  const keyFilePath = path.join('/etc/secrets', 'google_file.json'); // Встановлюємо шлях до ключа Render
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath, // Використовуємо абсолютний шлях
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive', // Повний доступ до Google Drive
      'https://www.googleapis.com/auth/drive.file',
    ], // Скопи для доступу
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

export const getData = async (spreadsheetId, range) => {
  const authClient = await authenticate();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values || [];
};
export const updateRow = async (spreadsheetId, range, values) => {
  const authClient = await authenticate();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: { values: [values] }, // Обёртка в массив, чтобы передать строку
  });
};
