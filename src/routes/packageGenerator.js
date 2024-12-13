// import express from 'express';
// import { createShipment } from '../controllers/createPackageGenerator.js';



// const router = express.Router();

// router.post('/', createShipment); // Створення нової посилки
// export default router;
import express from 'express';
import { createShipment } from '../controllers/createPackageGenerator.js';
import { addToQueue } from '../services/queue/queueProcessor.js';
 // Подключаем вашу очередь

const router = express.Router();

// Используем очередь для маршрута
router.post('/', (req, res, next) => {
  addToQueue({
    handler: createShipment, // Передаем ваш контроллер
    req, // Текущий запрос
    res, // Ответ
    next, // Следующий обработчик
  });
});

export default router;
