// import { sequelizeDB1C } from '../../db/db.js';

import formUaWorldServices from '../../services/forms/formUaToWorldServices.js';
import sendEmail from '../../services/forms/sendEmail.js';

export const formUaToWorldController = async (req, res) => {
  try {
    const data = req.body;
    const newData = await formUaWorldServices(data);
    await sendEmail(newData);
    res.status(201).json({ success: true, newData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// async function getTableColumns() {
//   try {
//     const queryInterface = sequelizeDB1C.getQueryInterface();
//     const tableDescription = await queryInterface.describeTable('addresses'); // замените на имя вашей таблицы

//     console.log(tableDescription); // Выводит описание таблицы с колонками
//   } catch (error) {
//     console.error('Ошибка при получении данных:', error);
//   }
// }
// async function getColumnsInfo() {
//   try {
//     const [results, metadata] = await sequelizeDB1C.query(
//       'DESCRIBE addresses;', // Замените на имя вашей таблицы
//     );

//     console.log(results); // Выводит информацию о колонках
//   } catch (error) {
//     console.error('Ошибка при выполнении запроса:', error);
//   }
// }

// getColumnsInfo();
