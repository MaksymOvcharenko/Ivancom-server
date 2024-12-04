import sequelize from "../db/db.js";
import User from "../db/models/users.js";
import { createContactPersonRef } from "../services/np.js";






export const createShipment = async (req, res) => {
    const t = await sequelize.transaction(); // Починаємо транзакцію

    // Порожній об'єкт для шипменту
    const shipmentData = {
      sender_id: null,
      recipient_id: null,
      parcel_id: null,
      sender_address_id: null,
      recipient_address_id: null,
      payment_id: null, // Може залишатися null, якщо оплата не потрібна
    };

    try {
      const { sender, recipient, senderAddress, recipientAddress, parcel, payment } = req.body;

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
      } else {
        const refRecipient = await createContactPersonRef(
          recipient.first_name,
          recipient.last_name,
          recipient.phone,
          recipient.email
        );
        console.log("Recipient NP Ref:", refRecipient[0]);

        const newRecipient = await User.create(
          {
            last_name: recipient.last_name,
            first_name: recipient.first_name,
            middle_name: recipient.middle_name || ".",
            phone: recipient.phone,
            email: recipient.email,
            ref_code_np: refRecipient[0],
          },
          { transaction: t }
        );
        recipientId = newRecipient.id;
      }
      shipmentData.recipient_id = recipientId;

      // === КРОК 3: TODO - Обробка адреси (SenderAddress, RecipientAddress) ===
      // Логіка для перевірки/створення адрес.

      // === КРОК 4: TODO - Обробка посилки (Parcel) ===
      // Логіка для перевірки/створення посилки.

      // === КРОК 5: TODO - Обробка платежу (Payment) ===
      // Логіка для перевірки/створення платежу.

      console.log("Shipment data so far:", shipmentData);

      await t.commit(); // Підтверджуємо транзакцію
      res.status(201).json({
        success: true,
        message: "Shipment created successfully",
        data: shipmentData,
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
