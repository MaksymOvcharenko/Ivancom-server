// import client from "./db.js";


// export async function createTable() {
//     try {
//       // Подключаемся к базе данных


//       // Проверяем, существует ли таблица, и если нет, то создаем её
//       const checkTableQuery = `
//         SELECT EXISTS (
//           SELECT 1
//           FROM information_schema.tables
//           WHERE table_name = 'users'
//         );
//       `;
//       const res = await client.query(checkTableQuery);

//       // Если таблица не существует, то создаем её
//       if (!res.rows[0].exists) {
//         const createTableQuery = `
//           CREATE TABLE users (
//             id SERIAL PRIMARY KEY,
//             name VARCHAR(100),
//             email VARCHAR(100)
//           );
//         `;
//         await client.query(createTableQuery);
//         console.log('Table "users" created successfully!');
//       } else {
//         console.log('Table "users" already exists!');
//       }

//     } catch (err) {
//       console.error('Error creating table:', err);
//     } finally {
//       // Закрытие соединения с базой данных
//       await client.end();
//     }
//   }
