



import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

export default sequelize;




// const { Client } = pkg;


//  const client = new Client({
//   user: env("DB_USER"),
//   host: env("DB_HOST"),
//   database: env("DB_DATABASE"),
//   password: env("DB_PASSWORD"),
//   port: env("DB_PORT"),
// });

// client.connect()
//   .then(() => console.log('Connected to PostgreSQL'))
//   .catch(err => console.error('Connection error', err.stack));

// // Пример простого запроса
export const testConnection = async () => {
  try {
    sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully with sequlazi.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });
  } catch (err) {
    console.error('Query error', err.stack);
  }
};



// export default client;
