// src/scripts/checkShipment.js
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

import { getShipment } from '../services/inpostClient.js';

const id = process.argv[2];
if (!id) {
  console.error('Usage: node src/scripts/checkShipment.js 2320402497');
  process.exit(1);
}

try {
  const s = await getShipment(id);
  console.log('[check] id:', s?.id, 'status:', s?.status);
  console.log('[check] tracking:', s?.tracking_number);
  console.log(
    '[check] labelUrl:',
    s?.documents?.label?.href || s?.label_url || null,
  );
} catch (e) {
  console.error('[check] ERROR:', e.response?.data || e.message);
}
