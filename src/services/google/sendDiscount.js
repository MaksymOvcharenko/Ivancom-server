import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1BEBXqp-q8uvNlyjhNDcyFbWYk8c5xXBomfArSFH1MoA'; // ID вашей таблицы
const range = 'Sheet1!A1:AZ1'; // Диапазон, в котором находятся заголовки
// const rangeForUpdate = 'Sheet1!A1:AZ'; // Диапазон, в котором находятся заголовки
export const writeDiscountData = async (email, discount) => {
  try {
    // Получаем заголовки из Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуем данные в массив значений, соответствующих заголовкам
    const values = headers.map((header) => {
      // Преобразуем объект в строку значений в зависимости от заголовка
      switch (header) {
        case 'email':
          return email;
        case 'discount':
          return discount;
        // Используйте соответствующие поля для других данных
        default:
          return ''; // Пустое значение, если нет соответствующего поля
      }
    });

    // Записываем данные в таблицу
    await appendData(spreadsheetId, 'Sheet1!A4', values);
  } catch (error) {
    console.error('Ошибка при записи данных:', error);
  }
};
