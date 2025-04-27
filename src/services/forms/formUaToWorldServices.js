// import UaToWorld from '../../db/models/forms/formUaToWorld.js';

// export const formWorldUaServices = async (formData) => {
//   try {
//     const {
//       ttn,
//       senderName,
//       senderSurname,
//       senderPhone,
//       senderEmail,
//       receiverName,
//       receiverSurname,
//       receiverPhone,
//       receiverEmail,
//       payer,
//       country,
//       city,
//       region,
//       street,
//       postalCode,
//       houseNumber,
//       apartment,
//       selectedSubCity,
//       paczkomat,
//       deliveryMethod,
//       inpostMethod,
//       description,
//       agree,
//     } = formData;

//     const newEntry = await UaToWorld.create({
//       ttn, //+
//       senderFirstName: senderName, //+
//       senderLastName: senderSurname, //+
//       senderPhone, //+
//       senderEmail, //+
//       recipientFirstName: receiverName, //+
//       recipientLastName: receiverSurname, //+
//       recipientPhone: receiverPhone, //+
//       recipientEmail: receiverEmail, //+
//       deliveryOption: deliveryMethod, //----
//       inpost_number: paczkomat, //+
//       location: street, //+
//       locality: city, //+
//       administrativeAreaLevel1: region, //+
//       apart: apartment, //+
//       postalCode, //+
//       country, //+
//       parcelDescription: description,
//       payer, //+
//       dataConsent: agree ? 1 : 0,
//       rateFromPLNtoUAH: '0', // Потрібно додати значення за замовчуванням або обчислення
//     });

//     return newEntry;
//   } catch (error) {
//     console.error('Error saving form data:', error);
//     throw new Error('Не вдалося зберегти дані у базу даних');
//   }
// };

import axios from 'axios';
import UaToWorld from '../../db/models/forms/formUaToWorld.js';

// Функція для визначення deliveryOption та branch
// const determineDeliveryOptionAndBranch = (formData) => {
//   const { selectedSubCity, deliveryMethod } = formData;

//   const branchCities = {
//     BranchKrakow: { deliveryOption: 'branch', branch: 'Krakow' },
//     BranchWarzsawa: { deliveryOption: 'branch', branch: 'Warsaw' },
//     BranchWroclaw: { deliveryOption: 'branch', branch: 'Wroclaw' },
//     BranchKatowice: { deliveryOption: 'branch', branch: 'Katowice' },
//   };

//   let modifiedDeliveryMethod = deliveryMethod;

//   if (deliveryMethod === 'InPost') {
//     modifiedDeliveryMethod = 'inpost';
//   } else if (deliveryMethod === 'Courier Ivancom') {
//     modifiedDeliveryMethod = 'ivancom-courier';
//   }

//   if (selectedSubCity) {
//     return { deliveryOption: 'ivancom-courier', branch: selectedSubCity };
//   }

//   if (branchCities[deliveryMethod]) {
//     return {
//       deliveryOption: branchCities[deliveryMethod].deliveryOption,
//       branch: branchCities[deliveryMethod].branch,
//     };
//   }

//   return { deliveryOption: modifiedDeliveryMethod, branch: 'Krakow' };
// };
const determineDeliveryOptionAndBranch = (formData) => {
  const { selectedSubCity, deliveryMethod, city } = formData;

  const cityToBranch = {
    Kraków: 'Krakow',
    Warszawa: 'Warsaw',
    Wrocław: 'Wroclaw',
    Katowice: 'Katowice',
    Kielce: 'Kielce',
  };

  const branchCities = {
    BranchKrakow: { deliveryOption: 'branch', branch: 'Krakow' },
    BranchWarzsawa: { deliveryOption: 'branch', branch: 'Warsaw' },
    BranchWroclaw: { deliveryOption: 'branch', branch: 'Wroclaw' },
    BranchKatowice: { deliveryOption: 'branch', branch: 'Katowice' },
  };

  let modifiedDeliveryMethod = deliveryMethod;

  if (deliveryMethod === 'InPost') {
    modifiedDeliveryMethod = 'inpost';
  } else if (deliveryMethod === 'Courier Ivancom') {
    modifiedDeliveryMethod = 'ivancom-courier';
  }

  // Якщо доставка кур'єром і є місто
  if (deliveryMethod === 'Courier Ivancom' && city && cityToBranch[city]) {
    return {
      deliveryOption: 'ivancom-courier',
      branch: cityToBranch[city],
    };
  }

  // Якщо є вибране підмісто — залишаємо як fallback
  if (selectedSubCity) {
    return { deliveryOption: 'ivancom-courier', branch: selectedSubCity };
  }

  // Якщо відповідність у branchCities
  if (branchCities[deliveryMethod]) {
    return {
      deliveryOption: branchCities[deliveryMethod].deliveryOption,
      branch: branchCities[deliveryMethod].branch,
    };
  }

  // Дефолтне значення
  return { deliveryOption: modifiedDeliveryMethod, branch: 'Krakow' };
};

// Функція для отримання курсу з НБУ
const fetchExchangeRate = async () => {
  try {
    const response = await axios.get(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&valcode=PLN',
    );
    const rateData = response.data.find((item) => item.cc === 'PLN');
    return rateData?.rate || 0;
  } catch (error) {
    console.error('Помилка отримання курсу з НБУ:', error);
    return 0;
  }
};

const formUaWorldServices = async (formData) => {
  try {
    const {
      ttn,
      senderName,
      senderSurname,
      senderPhone,
      senderEmail,
      receiverName,
      receiverSurname,
      receiverPhone,
      receiverEmail,
      payer,
      country,
      city,
      region,
      street,
      postalCode,
      // houseNumber,
      apartment,
      paczkomat,
      description,
      agree,
      promocode,
      cold,
    } = formData;

    // Отримуємо deliveryOption та branch
    const { deliveryOption, branch } =
      determineDeliveryOptionAndBranch(formData);

    // Отримуємо курс PLN до UAH
    const rateFromPLNtoUAH = await fetchExchangeRate();

    const newEntry = await UaToWorld.create({
      ttn,
      senderFirstName: senderName,
      senderLastName: senderSurname,
      senderPhone,
      senderEmail,
      recipientFirstName: receiverName,
      recipientLastName: receiverSurname,
      recipientPhone: receiverPhone,
      recipientEmail: receiverEmail,
      deliveryOption,
      branch,
      inpost_number: paczkomat,
      location: street,
      locality: city,
      administrativeAreaLevel1: region,
      apart: apartment,
      postalCode,
      country,
      parcelDescription: description,
      payer,
      dataConsent: agree ? 1 : 0,
      rateFromPLNtoUAH,
      promoCode: promocode,
      holod: cold ? 1 : 0,
    });

    return newEntry;
  } catch (error) {
    console.error('Error saving form data:', error);
    throw new Error('Не вдалося зберегти дані у базу даних');
  }
};
export default formUaWorldServices;
