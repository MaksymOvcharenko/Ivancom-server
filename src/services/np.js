import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const apiUrl = "https://api.novaposhta.ua/v2.0/json/";


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
//       const methodProperties = { /// Тест
//         FirstName: 'Отримувач',
//   MiddleName: '.',
//   LastName: 'Тестефір',
//   Phone: '380967654320',
//   Email: 'recipient@example.com',
//   CounterpartyType: 'PrivatePerson',
//   CounterpartyProperty: 'Recipient'  // Властивість контрагента
//       };




  const requestData = {
    // apiKey: "a13a950b799ed7cbe09727463f044465",
    apiKey: process.env.NP_API,
    modelName: "CounterpartyGeneral",  // Модель
    calledMethod: "save",             // Метод, що викликається
    methodProperties: methodProperties // Властивості методу
  };

  const apiUrl = "https://api.novaposhta.ua/v2.0/json/"; // Базова URL для API Нової Пошти

  try {
    const response = await axios.post(apiUrl, requestData,
    );






    return response.data.data[0];
    ; // Повертаємо відповідь від API
  } catch (error) {
    console.error("Помилка запиту:", error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
  }
};

// createContactPersonRef();


export const CreateInternetDocumentWarehouse = async (descriptionNp, valuationNp,weightActuality, cityNpRef,recipientNpRef,recipientContactNpRef,recipientNpWarehouseRef,recipientNpPhone) => {
    const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("uk-UA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});


    const methodProperties = {
     PayerType : "Sender",
     PaymentMethod : "NonCash",
     DateTime : formattedDate,
     CargoType : "Cargo",
    //  VolumeGeneral : "0.01", // Обьемна вага
     Weight : weightActuality,
     ServiceType : "WarehouseWarehouse",
     SeatsAmount : "1",
     Description : descriptionNp || "Опис відсутній",
     Cost : valuationNp,
    //  "CitySender" : "83829d5b-f91d-11ea-80fb-b8830365bd04",
    //  "Sender" : "b0b5fa26-0ebd-11ef-bcd0-48df37b921da",
    //  "SenderAddress" : "90aefdf0-fca0-11ea-b580-b8830365bd14",
    //  "ContactSender" : "770a06ff-184c-11ef-bcd0-48df37b921da",
    //  "SendersPhone" : "380958010474",

     CitySender : process.env.SENDER_CITY_REF,
     Sender : process.env.SENDER_REF,
     SenderAddress : process.env.SENDER_ADDRESS_REF,
     ContactSender : process.env.SENDER_CONTACT_REF,
     SendersPhone : process.env.SENDER_PHONE_REF,
     CityRecipient : cityNpRef,
     Recipient : recipientNpRef,
     RecipientAddress : recipientNpWarehouseRef,
     ContactRecipient : recipientContactNpRef,
     RecipientsPhone : recipientNpPhone
        };


    const requestData = {
        // apiKey: "a13a950b799ed7cbe09727463f044465",
        apiKey: process.env.NP_API,
        modelName: "InternetDocumentGeneral",  // Модель
        calledMethod: "save",             // Метод, що викликається
        methodProperties: methodProperties // Властивості методу
      };

    try {
        const response = await axios.post(apiUrl, requestData,);





        console.log(response);

        return response.data.data[0].IntDocNumber;
        ; // Повертаємо відповідь від API
      } catch (error) {
        console.error("Помилка запиту:", error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
      }
};
export const CreateInternetDocumentAddress = async (descriptionNp, valuationNp,weightActuality, cityNpRef,recipientNpRef,recipientContactNpRef,recipientNpPhone,recipientNpStreet,
  recipientNpBuildingNumber,
  recipientNpFlat,) => {
  const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("uk-UA", {
day: "2-digit",
month: "2-digit",
year: "numeric",
});
  const recAddress = await createAddress(recipientNpRef,cityNpRef,recipientNpStreet,
    recipientNpBuildingNumber,
    recipientNpFlat,);
  const methodProperties = {
   PayerType : "Sender",
   PaymentMethod : "NonCash",
   DateTime : formattedDate,
   CargoType : "Cargo",
  //  VolumeGeneral : "0.01", // Обьемна вага
   Weight : weightActuality,
   ServiceType : "WarehouseDoors",
   SeatsAmount : "1",
   Description : descriptionNp || "Опис відсутній",
   Cost : valuationNp,
  //  "CitySender" : "83829d5b-f91d-11ea-80fb-b8830365bd04",
  //  "Sender" : "b0b5fa26-0ebd-11ef-bcd0-48df37b921da",
  //  "SenderAddress" : "90aefdf0-fca0-11ea-b580-b8830365bd14",
  //  "ContactSender" : "770a06ff-184c-11ef-bcd0-48df37b921da",
  //  "SendersPhone" : "380958010474",

   CitySender : process.env.SENDER_CITY_REF,
   Sender : process.env.SENDER_REF,
   SenderAddress : process.env.SENDER_ADDRESS_REF,
   ContactSender : process.env.SENDER_CONTACT_REF,
   SendersPhone : process.env.SENDER_PHONE_REF,
   CityRecipient : cityNpRef,
   Recipient : recipientNpRef,
   RecipientAddress : recAddress,
   ContactRecipient : recipientContactNpRef,
   RecipientsPhone : recipientNpPhone
      };


  const requestData = {
      // apiKey: "a13a950b799ed7cbe09727463f044465",
      apiKey: process.env.NP_API,
      modelName: "InternetDocumentGeneral",  // Модель
      calledMethod: "save",             // Метод, що викликається
      methodProperties: methodProperties // Властивості методу
    };

  try {
      const response = await axios.post(apiUrl, requestData,);






      console.log(response);

      return response.data.data[0].IntDocNumber;
      ; // Повертаємо відповідь від API
    } catch (error) {
      console.error("Помилка запиту:", error.response ? error.response.data : error.message);
      throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
    }
};
export const createAddress = async (recipientNpRef,cityNpRef,recipientNpStreet,
  recipientNpBuildingNumber,
  recipientNpFlat,) => {
    const streetRef=  await getAddress(cityNpRef,recipientNpStreet);
  const methodProperties = {
      CounterpartyRef : recipientNpRef,
StreetRef :  streetRef,
BuildingNumber : recipientNpBuildingNumber,
Flat : recipientNpFlat,
    };





const requestData = {
  // apiKey: "a13a950b799ed7cbe09727463f044465",
  apiKey: process.env.NP_API,
  modelName: "AddressGeneral",  // Модель
  calledMethod: "save",             // Метод, що викликається
  methodProperties: methodProperties // Властивості методу
};

const apiUrl = "https://api.novaposhta.ua/v2.0/json/"; // Базова URL для API Нової Пошти

try {
  const response = await axios.post(apiUrl, requestData,
  );






  return response.data.data[0].Ref;
  ; // Повертаємо відповідь від API
} catch (error) {
  console.error("Помилка запиту:", error.response ? error.response.data : error.message);
  throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
}
};
export const getAddress = async (cityNpRef,recipientNpStreet,)=>{

  const methodProperties = {
    CityRef: cityNpRef,
      FindByString: recipientNpStreet,
  };

const requestData = {
  // apiKey: "a13a950b799ed7cbe09727463f044465",
  apiKey: process.env.NP_API,
  modelName: "AddressGeneral",  // Модель
  calledMethod: "getStreet",             // Метод, що викликається
  methodProperties: methodProperties // Властивості методу
};

const apiUrl = "https://api.novaposhta.ua/v2.0/json/"; // Базова URL для API Нової Пошти


try {
  const response = await axios.post(apiUrl, requestData,
  );






  return response.data.data[0].Ref;
  ; // Повертаємо відповідь від API
} catch (error) {
  console.error("Помилка запиту:", error.response ? error.response.data : error.message);
  throw new Error(error.response ? error.response.data : error.message); // Кидаємо помилку, якщо щось пішло не так
}
};
