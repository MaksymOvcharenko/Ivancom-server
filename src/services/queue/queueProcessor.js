// queueProcessor.js

let taskQueue = []; // Очередь запросов
let isProcessing = false; // Флаг выполнения текущего запроса

// Функция добавления задачи в очередь
export function addToQueue(task) {
  taskQueue.push(task); // Добавляем задачу в очередь
  processQueue(); // Запускаем обработку
}

// Функция обработки очереди
async function processQueue() {
  if (isProcessing || taskQueue.length === 0) return; // Если уже идет обработка, ничего не делаем
  isProcessing = true;

  const { handler, req, res, next } = taskQueue.shift(); // Достаем первую задачу из очереди
  try {
    console.log(`Начинаем обработку запроса: ${req.url}`);
    await handler(req, res, next); // Выполняем переданную функцию-обработчик
  } catch (error) {
    console.error(`Ошибка при обработке запроса:`, error);
    res.status(500).send('Произошла ошибка при обработке запроса');
  } finally {
    isProcessing = false;
    processQueue(); // Переходим к следующей задаче
  }
}

// Экспорт функции добавления задач в очередь

