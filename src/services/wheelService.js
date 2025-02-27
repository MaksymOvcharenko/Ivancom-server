import { Op } from 'sequelize';
import Discount from '../db/models/discount.js';

class WheelService {
  static async spin() {
    try {
      const minNegativeChance = 40;
      const maxNegativeChance = 50;
      const tenPercentChance =
        Math.floor(
          Math.random() * (maxNegativeChance - minNegativeChance + 1),
        ) + minNegativeChance;

      // Отримуємо доступні знижки та перетворюємо в звичайні об'єкти
      const availableDiscounts = (
        await Discount.findAll({
          where: {
            remaining: { [Op.gt]: 0 },
            percentage: { [Op.ne]: 10 },
          },
        })
      ).map((d) => d.toJSON());

      console.log('Доступні знижки:', availableDiscounts);

      if (availableDiscounts.length === 0) {
        console.warn('⚠️ Немає доступних знижок, видаємо -10%');
        return { message: 'Ваша скидка 🎉', discount: '10%' };
      }

      const isNegativeSelected = Math.random() * 100 < tenPercentChance;
      if (isNegativeSelected) {
        return { message: 'Ваша скидка 🎉', discount: '10%' };
      }

      const totalRemaining = availableDiscounts.reduce(
        (sum, d) => sum + d.remaining,
        0,
      );
      const weightedDiscounts = availableDiscounts.map((discount) => ({
        ...discount,
        weight: Math.max(
          1,
          Math.round((discount.remaining / totalRemaining) * 100),
        ),
      }));

      console.log('Знижки з вагами:', weightedDiscounts);

      let random =
        Math.random() * weightedDiscounts.reduce((sum, d) => sum + d.weight, 0);
      let selectedDiscount = weightedDiscounts.find((discount) => {
        if (random < discount.weight) return true;
        random -= discount.weight;
        return false;
      });

      // Перевірка, чи знайдено знижку
      selectedDiscount =
        selectedDiscount || weightedDiscounts[weightedDiscounts.length - 1];
      if (!selectedDiscount) {
        console.warn('⚠️ Не вдалося вибрати знижку, даємо -10%');
        return { message: 'Ваша скидка 🎉', discount: '10%' };
      }

      console.log('Випала знижка:', selectedDiscount);

      await Discount.update(
        { remaining: selectedDiscount.remaining - 1 },
        { where: { id: selectedDiscount.id } },
      );

      return {
        message: 'Ваша скидка 🎉',
        discount: `${selectedDiscount.percentage}%`,
      };
    } catch (error) {
      console.error('❌ Помилка при обертанні колеса:', error);
      return { success: false, message: 'Ошибка при вращении колеса' }; // Повертаємо коректний респонс
    }
  }
}

export default WheelService;
