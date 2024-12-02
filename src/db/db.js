import pkg from 'pg';



import { env } from '../utils/env.js';
import dotenv from 'dotenv';




const { Client } = pkg;

dotenv.config();

 const client = new Client({
  user: env("DB_USER"),
  host: env("DB_HOST"),
  database: env("DB_DATABASE"),
  password: env("DB_PASSWORD"),
  port: env("DB_PORT"),
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Пример простого запроса
export const testConnection = async () => {
  try {
    const res = await client.query('SELECT NOW()');
    console.log('Current time:', res.rows[0]);
  } catch (err) {
    console.error('Query error', err.stack);
  }
};



export default client;
