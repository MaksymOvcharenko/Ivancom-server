import multer from 'multer';

// Налаштовуємо Multer, щоб зберігати файл в пам'яті
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
