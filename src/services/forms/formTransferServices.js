import Transfers from '../../db/models/forms/formTransfers.js';
import { writeFormDataTransfers } from '../google/sendTransfers.js';

export const formTransferServices = async (formData) => {
  try {
    // Зберігаємо дані у базі даних
    const savedData = await Transfers.create(formData);
    console.log('Дані успішно збережено в базі:', savedData);
    console.log(formData);
    // Викликаємо функцію для запису даних у Google Таблицю
    await writeFormDataTransfers(formData);

    return savedData; // Повертаємо збережені дані
  } catch (error) {
    console.error('Помилка при збереженні даних:', error);
    throw error; // Перебиваємо помилку для подальшої обробки
  }
};
