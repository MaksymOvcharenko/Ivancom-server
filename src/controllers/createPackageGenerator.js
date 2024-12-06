import sequelize from "../db/db.js";
import Address from "../db/models/address.js";
import Parcel from "../db/models/parcels.js";
import Shipment from "../db/models/shipments.js";
import User from "../db/models/users.js";
import { convertToUAH } from "../services/convertPlnToUah.js";
import { gabarytes } from "../services/gabarytes.js";
import { createContactPersonRef, CreateInternetDocumentWarehouse } from "../services/np.js";






export const createShipment = async (req, res) => {
    const t = await sequelize.transaction(); // Починаємо транзакцію

    // Порожній об'єкт для шипменту
    const shipmentData = {
      sender_id: null,
      recipient_id: null,
      parcel_id: null,
      sender_address_id: 2,
      recipient_address_id: 2,
      payment_id: null,
      np_tracking_number: null, // Може залишатися null, якщо оплата не потрібна
    };
    let refNpUser = null;
    let refNpUserContact = null;
    let weightActuality = null;




    try {
      const { sender, recipient, senderAddress, recipientAddress, parcel, payment } = req.body;
      let length, width, height, weightActual, weightDimensional;

// Габарити та вага для кожного типу скриньки (зберігаються на бекенді)
const crateDimensions = gabarytes;

// Дані, що приходять з фронтенду


// Перевірка та присвоєння даних
if (crateDimensions[parcel.crate_name]) {
  const crate = crateDimensions[parcel.crate_name];
  length = crate.length;
  width = crate.width;
  height = crate.height;
  weightActual = crate.weightActual;
  weightActuality = weightActual;
  // Розрахунок об'ємної ваги
  weightDimensional = (length * width * height) / 4000; // Стандартний коефіцієнт для переводу в кг
} else {
  throw new Error(`Невідомий тип скриньки: ${parcel.crate_name}`);
}

      // === КРОК 1: Обробка відправника (Sender) ===
      let senderId;
      const existingSender = await User.findOne({
        where: { phone: sender.phone },
        transaction: t,
      });

      if (existingSender) {
        senderId = existingSender.id;
      } else {
        // const refUser = await createContactPersonRef(  ...Можливість створювати реф для НП в Відправнику
        //   sender.first_name,
        //   sender.middle_name || ".",
        //   sender.last_name,
        //   sender.phone,
        //   sender.email
        // );
        // console.log("Sender NP Ref:", refUser[0]);

        const newSender = await User.create(
          {
            last_name: sender.last_name,
            first_name: sender.first_name,
            middle_name: recipient.middle_name || ".",
            phone: sender.phone,
            email: sender.email,
            // ref_code_np: refUser[0],
          },
          { transaction: t }
        );
        senderId = newSender.id;
      }
      shipmentData.sender_id = senderId;

      // === КРОК 2: Обробка отримувача (Recipient) ===
      let recipientId;
      const existingRecipient = await User.findOne({
        where: { phone: recipient.phone },
        transaction: t,
      });

      if (existingRecipient) {
        recipientId = existingRecipient.id;
        refNpUser = existingRecipient.ref_code_np;
        refNpUserContact = existingRecipient.ref_code_np_contactPerson;
      } else {
        const refRecipient = await createContactPersonRef(
          recipient.first_name,
          recipient.last_name,
          recipient.phone,
          recipient.email
        );
        console.log("NP Response Data:", JSON.stringify(refRecipient));
        console.log(refRecipient.Ref);
        refNpUser = refRecipient.Ref;
        refNpUserContact = refRecipient.ContactPerson.data[0].Ref;

        const newRecipient = await User.create(
          {
            last_name: recipient.last_name,
            first_name: recipient.first_name,
            middle_name: recipient.middle_name || ".",
            phone: recipient.phone,
            email: recipient.email,
            ref_code_np: refRecipient.Ref,
            ref_code_np_contactPerson: refRecipient.ContactPerson.data[0].Ref
          },
          { transaction: t }
        );
        recipientId = newRecipient.id;
      }
      shipmentData.recipient_id = recipientId;
            // === КРОК 4: TODO - Обробка посилки (Parcel) ===
      // Логіка для перевірки/створення посилки.
      const newParcel = await Parcel.create(
        {
          user_id: senderId, // Прив'язуємо посилку до ID відправника
          crate_name: parcel.crate_name,
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          weight_actual: parcel.weight_actual,
          weight_dimensional: parcel.weight_dimensional,
          estimated_value: parcel.estimated_value,
          price: parcel.price,
          description: parcel.description,
        },
        { transaction: t }
      );

      // Додаємо ID посилки до shipmentData
      shipmentData.parcel_id = newParcel.id;

      // === КРОК 3: TODO - Обробка адреси (SenderAddress, RecipientAddress) ===
      // Логіка для перевірки/створення адрес.
      let senderAddressId;
const existingSenderAddress = await Address.findOne({
  where: {
    user_id: senderId,
    address_type: 'sender',
    city: senderAddress.city,
    street: senderAddress.street|| null,
    building_number: senderAddress.building_number || null,
    apartment_number: senderAddress.apartment_number || null,
  },
  transaction: t,
});

if (existingSenderAddress) {
  senderAddressId = existingSenderAddress.id;
} else {
  const newSenderAddress = await Address.create(
    {
      user_id: senderId,
      parcel_id: shipmentData.parcel_id, // Можна залишити null, якщо посилка ще не створена
      address_type: 'sender',
      country: senderAddress.country,
      city: senderAddress.city,
      street: senderAddress.street,
      building_number: senderAddress.building_number || null,
      apartment_number: senderAddress.apartment_number || null,
      floor_number: senderAddress.floor_number || null,
      postal_code: senderAddress.postal_code || null,
      delivery_method: senderAddress.delivery_method || 'address',
      np_branch_ref: senderAddress.np_branch_ref || null,
      np_branch: senderAddress.np_branch || null,
      np_street_ref: senderAddress.np_street_ref || null,
      np_city_ref: senderAddress.np_city_ref || null,
      inpost_branch_number: senderAddress.inpost_branch_number || null,
      inpost_street_ref: senderAddress.inpost_street_ref || null,
    },
    { transaction: t }
  );
  senderAddressId = newSenderAddress.id;
}

///Адреса отримувача

let recipientAddressId;
const existingRecipientAddress = await Address.findOne({
  where: {
    user_id: recipientId,
    address_type: 'recipient',
    city: recipientAddress.city,
    street: recipientAddress.street|| null,
    building_number: recipientAddress.building_number || null,
    apartment_number: recipientAddress.apartment_number || null,
  },
  transaction: t,
});

if (existingRecipientAddress) {
  recipientAddressId = existingRecipientAddress.id;
} else {
  // Додаткова перевірка для 'department' delivery_method
  if (recipientAddress.delivery_method === 'address') {

    const npBranchRef = await getNovaPoshtaBranchRef({
      city: recipientAddress.city,
      branch: recipientAddress.np_branch,
    });

    if (!npBranchRef) {
      throw new Error('Failed to fetch Nova Poshta branch reference');
    }

    recipientAddress.np_branch_ref = npBranchRef;
  }

  // Створення адреси отримувача
  const newRecipientAddress = await Address.create(
    {
      user_id: recipientId,
      parcel_id: shipmentData.parcel_id,
      address_type: 'recipient',
      country: recipientAddress.country,
      city: recipientAddress.city,
      street: recipientAddress.street|| null,
      building_number: recipientAddress.building_number || null,
      apartment_number: recipientAddress.apartment_number || null,
      floor_number: recipientAddress.floor_number || null,
      postal_code: recipientAddress.postal_code || null,
      delivery_method: recipientAddress.delivery_method || 'address',
      np_branch_ref: recipientAddress.np_branch_ref || null,
      np_branch: recipientAddress.np_branch || null,
      np_street_ref: recipientAddress.np_street_ref || null,
      np_city_ref: recipientAddress.np_city_ref || null,
      inpost_branch_number: recipientAddress.inpost_branch_number || null,
      inpost_street_ref: recipientAddress.inpost_street_ref || null,
    },
    { transaction: t }
  );
  recipientAddressId = newRecipientAddress.id;
}

// Додаємо ID адреси отримувача до shipmentData
shipmentData.recipient_address_id = recipientAddressId;

// Додаємо ID адреси відправника до shipmentData
shipmentData.sender_address_id = senderAddressId;
// Створюємо НП ТТН
const sendNp = async ()=>{
    const descriptionNp = parcel.description.contents;
const valuationNp = convertToUAH(parcel.estimated_value);
const cityNpRef = recipientAddress.np_city_ref;
const recipientNpRef = refNpUser;
const recipientContactNpRef = refNpUserContact;
const recipientNpWarehouseRef = recipientAddress.np_branch_ref;
const recipientNpPhone = recipient.phone;
let npTruckNumber = await CreateInternetDocumentWarehouse(descriptionNp,valuationNp,weightActuality,cityNpRef,recipientNpRef,recipientContactNpRef,recipientNpWarehouseRef,recipientNpPhone );
console.log(npTruckNumber);

return npTruckNumber;
};
let npTruckNumber =  await sendNp();
shipmentData.np_tracking_number=npTruckNumber;

      // === КРОК 5: TODO - Обробка платежу (Payment) ===
      // Логіка для перевірки/створення платежу.
     // === КРОК 6: TODO - Створення Посилки (Shipment) ===
     const newShipment = await Shipment.create(shipmentData,{ transaction: t });

    //  console.log("Shipment data so far:", shipmentData);

      await t.commit(); // Підтверджуємо транзакцію
      res.status(201).json({
        success: true,
        message: "Shipment created successfully",
        data: {...shipmentData, shipmentId:newShipment.id},
        id: newShipment.id,
      });
    } catch (error) {
      await t.rollback(); // Відкат транзакції у разі помилки
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to create shipment",
        error: error.message,
      });
    }
  };
