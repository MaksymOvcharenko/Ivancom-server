// import fs from 'node:fs/promises';
// import { pathToFile } from './path.js';
// const pathToTxt = pathToFile('text.txt');
// const fileContent = await fs.readFile(pathToTxt);
// console.log(fileContent.toString());
//-------------------Read
// (async () => {
//   try {
//     const data = await fs.readFile(pathToTxt, 'utf-8');
//     console.log('Файл:', data);
//   } catch (error) {
//     console.log('Error:', error);
//   }
// })();
// -----------------Write
// (async () => {
//   const data = 'Write text';
//   try {
//     await fs.writeFile(pathToTxt, data, 'utf-8');
//     console.log('Файл:', data);
//   } catch (error) {
//     console.log('Error:', error);
//   }
// })();
//-------------------Append
// (async () => {
//   const data = '    Append text';
//   try {
//     await fs.appendFile(pathToTxt, data, 'utf-8');
//     console.log('Файл:', data);
//   } catch (error) {
//     console.log('Error:', error);
//   }
// })();
//-------------------rename
// (async () => {
//   try {
//     await fs.rename('./src/text.txt', './src/newfile.txt');
//   } catch (error) {
//     console.log('Error:', error);
//   }
// })();
//--------------------unlink (delete)
// (async () => {
//   try {
//     await fs.unlink('./src/newfile.txt');
//     console.log('Файл успішно видалено.');
//   } catch (err) {
//     console.error('Помилка видалення файлу:', err);
//   }
// })();
//---------------------Read directory (file directory)
// (async () => {
//   try {
//     const files = await fs.readdir('.');
//     console.log('Список файлів і каталогів:', files);
//   } catch (err) {
//     console.error('Помилка отримання списку файлів і каталогів:', err);
//   }
// })();
// -------------------Read чи наявний файл у цій директорії
// (async () => {
//   const path = 'src/text.txt';
//   try {
//     await fs.access(path);
//     console.log(`Файл або каталог '${path}' доступний.`);
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       console.log(`Файл або каталог '${path}' не існує.`);
//     } else {
//       console.error(
//         `Помилка перевірки доступності файлу або каталогу '${path}':`,
//         err,
//       );
//     }
//   }
// })();
