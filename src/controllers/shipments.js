import Address from "../db/models/address.js";
import Parcel from "../db/models/parcels.js";
import Payment from "../db/models/payments.js";
import Shipment from "../db/models/shipments.js";
import User from "../db/models/users.js";


export const createShipment = async (req, res) => {
  try {
    const {
      sender_id,
      recipient_id,
      sender_address_id,
      recipient_address_id,
      parcel_id,
      payment_id,
    } = req.body;

    const newShipment = await Shipment.create({
      sender_id,
      recipient_id,
      sender_address_id,
      recipient_address_id,
      parcel_id,
      payment_id,
    });

    res.status(201).json({
      success: true,
      data: newShipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка створення відправлення',
      error,
    });
  }
};

export const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findAll();
    res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання списку відправлень',
      error,
    });
  }
};

// export const getShipmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const shipment = await Shipment.findByPk(id);

//     if (!shipment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Відправлення не знайдено',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: shipment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Помилка отримання відправлення',
//       error,
//     });
//   }
// };
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({
        success: false,
        message: 'Відправлення не знайдено',
      });
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

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Помилка отримання відправлення',
      error: error.message,
    });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sender_id,
      recipient_id,
      sender_address_id,
      recipient_address_id,
      parcel_id,
      payment_id,
    } = req.body;

    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Відправлення не знайдено',
      });
    }

    await shipment.update({
      sender_id,
      recipient_id,
      sender_address_id,
      recipient_address_id,
      parcel_id,
      payment_id,
    });

    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення відправлення',
      error,
    });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Відправлення не знайдено',
      });
    }

    await shipment.destroy();

    res.status(200).json({
      success: true,
      message: 'Відправлення видалено',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка видалення відправлення',
      error,
    });
  }
};
