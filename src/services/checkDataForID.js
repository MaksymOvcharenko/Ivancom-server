import Address from "../db/models/address.js";
import Parcel from "../db/models/parcels.js";
import Payment from "../db/models/payments.js";
import Shipment from "../db/models/shipments.js";
import User from "../db/models/users.js";

export const getShipmentByIdForSendGooGle = async (id) => {
    try {


      const shipment = await Shipment.findByPk(id, {
        include: [
          { model: User, as: 'sender', attributes: { exclude: ['password'] } },
          { model: User, as: 'recipient', attributes: { exclude: ['password'] } },
          { model: Address, as: 'senderAddress' },
          { model: Address, as: 'recipientAddress' },
          { model: Parcel },
          { model: Payment },
        ],
      });


      if (!shipment) {
        return {

          message: 'Відправлення не знайдено',
        };
      }

      // Формуємо відповідь
      const response = {
        shipment: {
          id: shipment.id,
          inpost_code:shipment.inpost_code,
          np_tracking_number: shipment.np_tracking_number,
          created_at: shipment.createdAt,
          updated_at: shipment.updatedAt,
        },
        sender: shipment.sender,
        recipient: shipment.recipient,
        senderAddress: shipment.senderAddress,
        recipientAddress: shipment.recipientAddress,
        parcel: shipment.Parcel,
        payment: shipment.Payment,
      };



      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Помилка отримання відправлення',
        error: error.message,
      };
    }
  };

