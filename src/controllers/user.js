// userController.js
 // Подключение к базе данных

import client from "../db/db.js";





export const createUser = async (req, res) => {
  const { name, email } = req.body; // Данные, которые приходят от клиента

  try {
    // Запрос для добавления пользователя в таблицу users
    const result = await client.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    // Отправляем обратно созданного пользователя
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};


