// import { google } from 'googleapis';

// import Animals from '../../db/models/forms/formAnimals.js';
// import { writeFormDataAnimals } from '../google/sendAnimals.js';
// import { authenticate } from '../google/google.js';

// export const formAnimalsServices = async (formData, files) => {
//   try {
//     console.log('Отримані дані:', formData);
//     console.log('Отримані файли:', files);

//     // Аутентифікація через сервісний аккаунт
//     const auth = await authenticate();
//     const drive = google.drive({ version: 'v3', auth });

//     // Масив для зберігання лінків на файли
//     const fileLinks = [];

//     // Завантаження кожного файлу на Google Drive
//     for (const file of files) {
//       const fileMetadata = {
//         name: file.originalname,
//         parents: ['1iPLycEpJjetwXNDMAG-2iOJMAFGE5IlO'], // Вкажи ID папки на Google Drive
//       };

//       const media = {
//         mimeType: file.mimetype,
//         body: file.buffer,
//       };

//       const response = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id, webViewLink',
//       });

//       // const fileId = response.data.id;
//       const fileLink = response.data.webViewLink;
//       fileLinks.push(fileLink);
//     }

//     // Додаємо посилання на файли до formData
//     formData.fileLinks = fileLinks;

//     // Зберігаємо дані у базі даних
//     const savedData = await Animals.create(formData);
//     console.log('Дані успішно збережено в базі:', savedData);

//     // Записуємо дані у Google Таблицю
//     await writeFormDataAnimals(formData);

//     return savedData;
//   } catch (error) {
//     console.error('Помилка при збереженні даних:', error);
//     throw error;
//   }
// };
import { google } from 'googleapis';
import { Readable } from 'node:stream';

import Animals from '../../db/models/forms/formAnimals.js';
import { writeFormDataAnimals } from '../google/sendAnimals.js';
import { authenticate } from '../google/google.js';

export const formAnimalsServices = async (formData, files) => {
  try {
    console.log('Отримані дані:', formData);
    console.log('Отримані файли:', files);

    // Аутентифікація через сервісний аккаунт
    console.log('Аутентифікація через сервісний аккаунт...');
    const auth = await authenticate();
    const drive = google.drive({ version: 'v3', auth });
    console.log('Аутентифікація успішна!');

    // Масив для зберігання лінків на файли
    const fileLinks = [];

    // Завантаження кожного файлу на Google Drive
    const fileArray = files.file || []; // Якщо файли є, використовуємо їх, якщо ні — порожній масив

    // Тепер можна ітерувати по масиву fileArray
    for (const file of fileArray) {
      const fileMetadata = {
        name: file.originalname,
        parents: ['1iPLycEpJjetwXNDMAG-2iOJMAFGE5IlO'], // Вкажи ID папки на Google Drive
      };

      const fileBuffer = file.buffer; // Це буфер, який надає multer

      // Перетворення буфера в потік
      const fileStream = Readable.from(fileBuffer);
      const media = {
        mimeType: file.mimetype,
        body: fileStream,
      };

      try {
        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });

        const fileLink = response.data.webViewLink;
        fileLinks.push(fileLink);
      } catch (error) {
        console.error('Помилка при завантаженні файлу на Google Drive:', error);
      }
    }

    // Додаємо посилання на файли до formData
    formData.fileLinks = fileLinks;
    console.log('Посилання на файли додано до formData:', fileLinks);

    // Зберігаємо дані у базі даних
    console.log('Збереження даних у базі...');
    const savedData = await Animals.create(formData);
    console.log('Дані успішно збережено в базі:', savedData);

    // Записуємо дані у Google Таблицю
    console.log('Запис даних у Google Таблицю:', formData);
    await writeFormDataAnimals(formData);
    console.log('Дані успішно записано в Google Таблицю');

    return savedData;
  } catch (error) {
    console.error('Помилка при обробці форми:', error);
    throw error;
  }
};
