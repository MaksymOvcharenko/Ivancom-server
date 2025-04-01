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

export const sequelizeTracking = new Sequelize({
  host: process.env.DB_HOST_TRACKING,
  dialect: 'mysql',
  username: process.env.DB_USER_TRACKING,
  password: process.env.DB_PASSWORD_TRACKING,
  database: process.env.DB_DATABASE_TRACKING,
  port: process.env.DB_PORT_TRACKING,
});

export const sequelizeDB1C = new Sequelize({
  host: process.env.DB_HOST_1C,
  dialect: 'mysql', // Змінюємо на 'mysql'
  username: process.env.DB_USER_1C,
  password: process.env.DB_PASSWORD_1C,
  database: process.env.DB_DATABASE_1C,
});
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
    sequelize
      .authenticate()
      .then(() => {
        console.log(
          'Connection has been established successfully with sequlazi.',
        );
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  } catch (err) {
    console.error('Query error', err.stack);
  }
};

// export default client;
export const testConnectionTracking = async () => {
  try {
    sequelize
      .authenticate()
      .then(() => {
        console.log(
          'Connection has been established successfully with sequlazi for Tracking.',
        );
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  } catch (err) {
    console.error('Query error', err.stack);
  }
};
export const testConnection1С = async () => {
  try {
    sequelize
      .authenticate()
      .then(() => {
        console.log(
          'Connection has been established successfully with sequlazi for 1с.',
        );
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  } catch (err) {
    console.error('Query error', err.stack);
  }
};
