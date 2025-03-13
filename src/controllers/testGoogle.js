import { google } from "googleapis";
import { authenticate } from "../services/google/google.js";

; // Підключаємо функцію аутентифікації

export const testGoogle = async (req, res) => {
  try {
    // Логування початку запиту
    console.log('Starting Google Drive API test request...');

    // Аутентифікація
    const authClient = await authenticate();
    console.log('Successfully authenticated with Google API.');

    // Ініціалізація Google Drive API
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Логування доступних файлів на Google Drive
    console.log('Fetching files from Google Drive...');

    // Отримуємо список файлів з Google Drive
    const response = await drive.files.list({
      pageSize: 10, // Отримуємо перші 10 файлів
      fields: 'nextPageToken, files(id, name)', // Вказуємо, які поля нам потрібні
    });

    // Логування отриманих файлів
    console.log('Files fetched from Google Drive:', response.data.files);

    // Виведемо список файлів на екран
    if (response.data.files.length) {
      console.log('Files:', response.data.files);
      res.status(200).json({ files: response.data.files });
    } else {
      console.log('No files found.');
      res.status(404).send('No files found.');
    }
  } catch (error) {
    // Логування помилок
    console.error(
      'Error occurred while interacting with Google Drive API:',
      error,
    );
    res
      .status(500)
      .send('An error occurred while fetching data from Google Drive.');
  }
};
