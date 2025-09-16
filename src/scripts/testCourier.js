import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

import { createInpostCourierSimpleOnce } from '../services/inpostSimple.js';

(async () => {
  try {
    const r = await createInpostCourierSimpleOnce({
      orderNumber: 'ORD-1001',
      comment: 'Тест кур’єр',
      weightTier: '1kg',
      receiver: {
        firstName: 'Ivan',
        lastName: 'Test',
        email: 'receiver@example.com',
        phone: '+48500111222',
      },
      address: {
        street: 'Długa',
        building: '1',
        city: 'Kraków',
        post_code: '30-001',
        country_code: 'PL',
      },
    });
    console.log(
      '[courier] id =',
      r.id,
      'tracking =',
      r.trackingNumber,
      'label =',
      r.labelUrl,
    );
  } catch (e) {
    console.error('[courier] ERROR:', e.response?.data || e.message);
  }
})();
