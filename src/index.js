// src/index.js


import  { testConnection } from './db/db.js';
import { setupServer } from './server.js';
import dotenv from 'dotenv';
dotenv.config();
const bootstrap = async () => {
  await testConnection();

  setupServer();
};

bootstrap();
