// src/index.js

import {
  testConnection,
  testConnection1С,
  testConnectionTracking,
} from './db/db.js';
import { setupServer } from './server.js';
import dotenv from 'dotenv';
dotenv.config();
const bootstrap = async () => {
  await testConnection();
  await testConnectionTracking();
  await testConnection1С();
  setupServer();
};

bootstrap();
