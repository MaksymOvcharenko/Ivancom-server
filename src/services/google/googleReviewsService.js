// import { google } from 'googleapis';
// import dotenv from 'dotenv';

// dotenv.config();

// // Логування змінних .env
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log(
//   'GOOGLE_CLIENT_SECRET:',
//   process.env.GOOGLE_CLIENT_SECRET ? 'OK' : 'NOT SET',
// );
// console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
// console.log(
//   'GOOGLE_REFRESH_TOKEN:',
//   process.env.GOOGLE_REFRESH_TOKEN ? 'OK' : 'NOT SET',
// );

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI,
// );

// // Встановлюємо refresh_token
// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// // 1. Отримання URL для авторизації
export const getAuthUrl = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/business.manage'],
    prompt: 'consent',
  });

  console.log('Авторизуйся за посиланням:', authUrl);
  return authUrl;
};
export async function getRefreshToken(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      console.log('Токены получены успешно:', tokens);

      // Сохраняем refresh_token в базе данных
      //   saveTokens(tokens);

      return tokens.refresh_token;
    } else {
      throw new Error(
        'Refresh token не найден. Возможно, он уже был использован.',
      );
    }
  } catch (error) {
    console.error('Ошибка при получении токенов:', error.message);
    throw error;
  }
}

// function saveTokens(tokens) {
//   // Сюда добавь логику сохранения токенов в базу данных
//   console.log('Сохранение токенов:', tokens);
// }
// // 2. Отримання access_token через refresh_token
// let cachedToken = null;
// let tokenExpiresAt = 0;

// const getAccessToken = async () => {
//   const now = Date.now();

//   if (cachedToken && now < tokenExpiresAt) {
//     return cachedToken;
//   }

//   try {
//     const { credentials } = await oauth2Client.refreshAccessToken();
//     if (!credentials.access_token) {
//       throw new Error('Не вдалося отримати access_token');
//     }

//     cachedToken = credentials.access_token;
//     tokenExpiresAt = now + (credentials.expiry_date - 10) * 1000;

//     return cachedToken;
//   } catch (error) {
//     console.error('Помилка оновлення access_token:', error);
//     throw new Error('Не вдалося оновити access_token');
//   }
// };
// export const getAccounts = async () => {
//   try {
//     const accessToken = await getAccessToken();
//     console.log('Token;' + accessToken);

//     const res = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     const data = await res.json();
//     console.log('Accounts:', data);

//     if (!data.accounts || data.accounts.length === 0) {
//       throw new Error('Не знайдено жодного акаунту.');
//     }

//     return data.accounts; // Повертає масив акаунтів
//   } catch (error) {
//     console.error('Помилка отримання акаунтів:', error.message);
//     throw error;
//   }
// };
// // 3. Отримання відгуків
// export const getReviews = async () => {
//   try {
//     console.log('Отримуємо access_token...');
//     const accessToken = await getAccessToken();
//     console.log('Access Token:', accessToken);

//     const url = `https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`;
//     console.log('Запит до Google API:', url);

//     const res = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     console.log('Google API Response Status:', res.status);

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(
//         `Помилка отримання відгуків: ${res.statusText} - ${errorText}`,
//       );
//     }

//     const data = await res.json();
//     console.log('Отримані відгуки:', data);

//     return data.reviews;
//   } catch (error) {
//     console.error('Помилка у getReviews:', error);
//     throw new Error('Не вдалося отримати відгуки');
//   }
// };
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Оновлення клієнта OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Функція для отримання access_token
const getAccessToken = async () => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error('Не вдалося отримати access_token');
    }
    return credentials.access_token;
  } catch (error) {
    console.error('Помилка при отриманні access_token:', error.message);
    throw error;
  }
};

// 1. Отримання акаунтів через API Google
export const getAccounts = async () => {
  try {
    // Отримуємо актуальний access_token
    const accessToken = await getAccessToken();
    console.log('Access Token:', accessToken); // Виведемо токен для перевірки

    // Використовуємо raw HTTP запит для отримання акаунтів
    const res = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Перевірка на успішний статус відповіді
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Помилка отримання акаунтів: ${res.statusText} - ${errorText}`,
      );
    }

    const data = await res.json();
    console.log('Accounts:', data);

    if (!data.accounts || data.accounts.length === 0) {
      throw new Error('Не знайдено жодного акаунту.');
    }

    return data.accounts; // Повертаємо акаунти
  } catch (error) {
    console.error('Помилка отримання акаунтів:', error.message);
    throw error;
  }
};

// Використання
// getAccounts()
//   .then((accounts) => {
//     console.log('Ваші акаунти:', accounts);
//   })
//   .catch((error) => {
//     console.error('Помилка при отриманні акаунтів:', error.message);
//   });
