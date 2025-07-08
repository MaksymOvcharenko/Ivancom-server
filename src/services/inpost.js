import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
dotenv.config();

export async function sendInpostRequest(
  numberShipment,
  crateType,
  senderPhone,
  senderEmail,
) {
  const url = process.env.INPOST_URL;
  function generateFutureDate(daysAhead = 14) {
    // Отримуємо поточну дату
    const currentDate = new Date();

    // Додаємо до поточної дати 14 днів
    currentDate.setDate(currentDate.getDate() + daysAhead);

    // Форматуємо дату у потрібний формат
    const formattedDate = currentDate.toISOString().split('T');
    const date = formattedDate[0]; // Дата у форматі YYYY-MM-DD
    const time = formattedDate[1].substring(0, 8); // Час у форматі HH:mm:ss

    // Формуємо результат у форматі "YYYY-MM-DDTHH:mm:ss"
    return `${date}T${time}`;
  }

  // Викликаємо функцію для генерування дати на 14 днів наперед
  const futureDate = generateFutureDate(14);

  // XML-контент, який потрібно відправити
  const xmlContent = `
    <paczkomaty>
      <rma>${numberShipment}</rma>
      <packType>${crateType}</packType>
      <expirationDate>${futureDate}</expirationDate>

      <senderPhone>48696200638</senderPhone>
      <senderEmail>ivancominpost@gmail.com</senderEmail>
      <returnDescription1>Zamówienie:${numberShipment}</returnDescription1>
      <address>
      <companyName>Ivancom</companyName>
        <name>Ivan</name>
        <surName>Kysil</surName>
        <email>ivancominpost@gmail.com</email>
        <street>Medyka</street>
        <buldingNo>405A/buldingNo>
        <flatNo>83</flatNo>
        <zipCode>31-982</zipCode>
        <town>Medyka</town>
      </address>
    </paczkomaty>
  `;

  // Формат даних, які відправляються
  const formData = new URLSearchParams();
  formData.append('email', process.env.INPOST_LOGIN);
  formData.append('password', process.env.INPOST_PASSWORD);
  formData.append('content', xmlContent);

  try {
    // Відправляємо POST запит
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Формат для передачі даних
      },
      body: formData.toString(),
    });

    // Обробляємо відповідь
    if (response.ok) {
      const result = await response.text(); // Якщо відповідь у вигляді тексту

      // Якщо відповідь у форматі XML, то парсимо її
      try {
        const parsedXml = await parseStringPromise(result);

        // Приклад отримання значення коду з XML:
        const code = parsedXml?.paczkomaty?.return?.[0]?.code?.[0];

        return code;
      } catch (parseError) {
        console.error('Помилка парсингу XML:', parseError.message);
      }
    } else {
      console.error('Помилка:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Помилка при відправці запиту:', error);
  }
}

// Викликаємо функцію
sendInpostRequest();
