import { registerTransaction } from './registerTransaction.js';

registerTransaction({
  sessionId: 'ivankom-' + Date.now(),
  amount: 123, // 12.34 PLN
  description: 'Тестова оплата Ivankom',
  email: 'client@example.com',
  urlReturn: 'https://ivancom.eu',
  urlStatus: 'https://ivancom-server.onrender.com/p24/status',
});
