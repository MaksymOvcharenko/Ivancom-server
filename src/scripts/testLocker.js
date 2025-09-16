import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

import { createInpostLockerSimpleOnce } from '../services/inpostSimple.js';

(async () => {
  try {
    const r = await createInpostLockerSimpleOnce({
      orderNumber: 'ORD-1002',
      comment: 'Тест поштомат',
      receiver: { email: 'receiver@example.com', phone: '+48500111222' },
      lockerId: 'KRA01A', // заміни на реальний
    });
    console.log(
      '[locker] id =',
      r.id,
      'tracking =',
      r.trackingNumber,
      'label =',
      r.labelUrl,
    );
  } catch (e) {
    console.error('[locker] ERROR:', e.response?.data || e.message);
  }
})();
