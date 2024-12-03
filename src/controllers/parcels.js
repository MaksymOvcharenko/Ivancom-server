import Parcel from "../db/models/parcels.js";


// Створення нової посилки
export const createParcel = async (req, res) => {
  try {
      const {
          crate_name,
          length,
          width,
          height,
          weight_actual,
          weight_dimensional,
          estimated_value,
          price,
          description,
          user_id, // Додано
      } = req.body;

      // Перевірка наявності user_id
      if (!user_id) {
          return res.status(400).json({
              success: false,
              message: "user_id є обов'язковим полем.",
          });
      }

      const parcel = await Parcel.create({
          crate_name,
          length,
          width,
          height,
          weight_actual,
          weight_dimensional,
          estimated_value,
          price,
          description,
          user_id, // Передаємо user_id
      });

      res.status(201).json({
          success: true,
          data: parcel,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: "Не вдалося створити посилку.",
          error,
      });
  }
};

// Отримання всіх посилок
export const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.findAll();

    res.status(200).json({
      success: true,
      data: parcels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Не вдалося отримати посилки.',
    });
  }
};

// Отримання посилки за ID
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findByPk(id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Посилка не знайдена.',
      });
    }

    res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Не вдалося отримати посилку.',
    });
  }
};
