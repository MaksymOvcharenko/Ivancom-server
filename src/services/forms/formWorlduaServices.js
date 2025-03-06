import formWorldua from '../../db/models/forms/formWorldua.js';
import { writeFormDataWorldUa } from '../google/sendFormWorldUa.js';
// Імпортуємо вашу функцію для запису в Google Таблицю

export const formWorldUaServices = async (formData) => {
  try {
    // Зберігаємо дані у базі даних
    const savedData = await formWorldua.create(formData);
    console.log('Дані успішно збережено в базі:', savedData);
    console.log(formData);
    // Викликаємо функцію для запису даних у Google Таблицю
    await writeFormDataWorldUa(formData);

    return savedData; // Повертаємо збережені дані
  } catch (error) {
    console.error('Помилка при збереженні даних:', error);
    throw error; // Перебиваємо помилку для подальшої обробки
  }
};
