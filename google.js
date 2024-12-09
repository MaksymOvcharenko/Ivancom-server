// import { google } from "googleapis";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";


// // Отримуємо поточний шлях за допомогою import.meta.url
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Функція для аутентифікації та роботи з Google Sheets
// async function authenticateWithGoogleAPI() {
//     const auth = new google.auth.GoogleAuth({
//         keyFile: path.resolve(__dirname, 'google_file.json'), // Шлях до вашого ключа
//         scopes: "https://www.googleapis.com/auth/spreadsheets",
//     });

//     const client = await auth.getClient();
//     const googleSheets = google.sheets({ version: "v4", auth: client });

//     return { googleSheets, client };
// }

// // Функція для створення таблиці та додавання даних
// async function createSheetAndAddData() {
//     const { googleSheets, client } = await authenticateWithGoogleAPI();

//     const spreadsheetId = '12T7tYgyEmBz5O3GLZWfPoU9gP6r_7Jk0kpn8C7Ilzgk'; // Замініть на ID вашої таблиці
//     const sheetName = 'Аркуш1'; // Назва листа

//     // 1. Створення заголовків стовпців (якщо таблиця порожня)
//     await googleSheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `${sheetName}!A1:AZ1`, // Вибір діапазону для заголовків
//         valueInputOption: "USER_ENTERED",
//         requestBody: {
//             values: [
//                 [
//                     'Sender ID', 'Sender Last Name', 'Sender First Name', 'Sender Middle Name', 'Sender Phone', 'Sender Email',
//                     'Recipient ID', 'Recipient Last Name', 'Recipient First Name', 'Recipient Middle Name', 'Recipient Phone', 'Recipient Email',
//                     'Sender Address Country', 'Sender Address City', 'Sender Address Street', 'Sender Address Building', 'Sender Address Apartment',
//                     'Recipient Address Country', 'Recipient Address City', 'Recipient Address Street', 'Recipient Address Building',
//                     'Parcel Length', 'Parcel Width', 'Parcel Height', 'Parcel Weight', 'Parcel Estimated Value', 'Parcel Price', 'Parcel Contents'
//                 ]
//             ]
//         }
//     });

//     // 2. Формат даних, які будемо записувати
//     const data = [
//         [
//             32, "Тестовий", "Відправник", "Семенович", "48574267422", "ivan.ivanenko1@example.com",
//             36, "Повний", "Олексій", ".", "380738569307", "Test1234@gmail.com",
//             "Poland", "Krakow", "Jana pawla II", "156", null,
//             "Україна", "Київ", "Хрещатик", "99", "1",
//             30, 20, 10, 2.5, 500, 100, "Електроніка"
//         ]
//     ];

//     // 3. Додавання даних
//     await googleSheets.spreadsheets.values.append({
//         spreadsheetId,
//         range: `${sheetName}!A2:T2`, // Запис даних починається з другого рядка
//         valueInputOption: "USER_ENTERED",
//         requestBody: {
//             values: data
//         }
//     });

//     console.log("Дані успішно додано в таблицю!");
// }

// // Виклик функції для створення таблиці та запису даних
// createSheetAndAddData().catch(console.error);
