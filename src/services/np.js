import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();



// Запит для створення контактної особи
export const createContactPersonRef = async (firstName,lastName,phone,email) => {
    const methodProperties = {
        FirstName: firstName,
        MiddleName: ".",
        LastName: lastName,
        Phone: phone,
        Email: email,
        CounterpartyType: "PrivatePerson", // Тип контрагента
        CounterpartyProperty: "Recipient"  // Властивість контрагента
      };
  const requestData = {
    apiKey: process.env.NP_API,
    modelName: "CounterpartyGeneral",  // Модель
    calledMethod: "save",             // Метод, що викликається
    methodProperties: methodProperties // Властивості методу
  };

  const apiUrl = "https://api.novaposhta.ua/v2.0/json/"; // Базова URL для API Нової Пошти

  try {
    const response = await axios.post(apiUrl, requestData,
    );

    return response.data.data.map((e)=>e.Ref)
    ; // Повертаємо відповідь від API
  } catch (error) {
    console.error("Помилка запиту:", error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
  }
};

