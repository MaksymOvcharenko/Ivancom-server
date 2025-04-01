import { trackingService } from '../services/tracking.service.js';

export const trackingController = async (req, res) => {
  try {
    const { ttn } = req.body;

    if (!ttn || typeof ttn !== 'string' || !/^\d{14}$/.test(ttn)) {
      return res
        .status(400)
        .json({ message: 'Некорректный TTН (ожидается 14 цифр)' });
    }

    const records = await trackingService.findByTTN(ttn);

    return res.status(200).json({ data: records });
  } catch (error) {
    console.error('Ошибка в trackingController:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};
