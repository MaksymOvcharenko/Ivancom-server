import { auth, getVersion } from '../utils/dhl24Client.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
try {
  console.log('Auth preview:', auth()); // перевір, що підтягнуло логін/пароль
  const ver = await getVersion();
  console.log('DHL24 WebAPI version:', ver);
} catch (e) {
  console.error('getVersion error:', e);
}
