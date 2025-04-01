import { Tracking } from '../db/models/tracking.js';

export const trackingService = {
  async findByTTN(ttn) {
    // ищем все записи с такой TTН
    const records = await Tracking.findAll({
      where: { ttn },
    });

    return records;
  },
};
