import { writeDiscountData } from '../services/google/sendDiscount.js';
import EmailService from '../services/participant.js';
import WheelService from '../services/wheelService.js';

class WheelController {
  static async spinWheel(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: 'Email обов’язковий' });
      }

      // Перевіряємо, чи email вже є в базі
      const emailExists = await EmailService.checkEmail(email);

      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, message: 'Цей email вже використовувався' });
      }

      // Якщо email новий, додаємо його в БД
      await EmailService.saveEmail(email);

      // Запускаємо колесо фортуни
      const result = await WheelService.spin();
      console.log(email, result.discount + 'send to google');

      await writeDiscountData(email, result.discount);
      return res.json({ success: true, prize: result });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: 'Ошибка при вращении колеса' });
    }
  }
}

export default WheelController;
