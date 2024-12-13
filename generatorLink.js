// import puppeteer from 'puppeteer';





// export async function loginAndFillForm(shipmentID, summa, senderFullName, senderEmail, senderPhone, senderPostalCode, senderCity, senderStreet, senderHouse) {
//     const browser = await puppeteer.launch({ headless: true});
//     const page = await browser.newPage();

//     try {
//       // 1. Перейти на сторінку авторизації
//       await page.goto('https://panel.przelewy24.pl/generator_link.php', { waitUntil: 'load', timeout: 0 });

//       // 2. Виконати авторизацію
//       await page.type('#lo_login', '320208');
//       await page.type('#lo_haslo', 'Ivancomparcels@2024');
//       await Promise.all([
//         page.click('#loginButton'),
//         page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
//       ]);
//       console.log('Авторизація успішна!');

//       // 3. Перевірити, чи форма доступна
//       await page.waitForSelector('#formsz', { visible: true });

//       // 4. Заповнення полів форми
//       await page.select('select[name="z24_id_sprzedawcy"]', '320208'); // Вибрати ID продавця
//       await page.type('input[name="z24_nazwa"]', `Plata za zamowienie numer ${String(shipmentID)}`); // Заповнити "Титул платежу"
//       await page.type('textarea[name="z24_opis"]', 'Zamowienie From Pl to Ua with Inpost'); // Заповнити "Додатковий опис"
//       await page.type('input[name="z24_kwota"]', String(summa)); // Ввести суму
//       await page.select('select[name="z24_currency"]', 'selected'); // Вибрати валюту (USD)
//       await page.click('input[name="z24_language"][value="pl"]'); // Обрати англійську мову
//       await page.type('input[name="z24_return_url"]', 'https://example.com'); // Ввести URL повернення

//       // Заповнення інформації про відправника
//       await page.type('input[name="k24_nazwa"]', senderFullName);
//     //   await page.type('input[name="k24_firma"]', 'Компанія Тест');
//     //   await page.type('input[name="k24_nip"]', '1234567890');
//       await page.type('input[name="k24_email"]', senderEmail);
//       await page.type('input[name="k24_telefon"]', senderPhone);
//       await page.type('input[name="k24_kod"]', senderPostalCode);
//       await page.type('input[name="k24_miasto"]', senderCity);
//       await page.type('input[name="k24_ulica"]', senderStreet);
//       await page.type('input[name="k24_numer_dom"]', senderHouse);
//       await page.select('select[name="k24_kraj"]', 'PL'); // Вибір країни (Україна)

//       // 5. Надіслати форму
//       await page.waitForSelector('input[type="submit"]');
//       await page.click('input[type="submit"]'); // Клік по кнопці сабміту

//       console.log('Форма заповнена та відправлена!');

//       // 6. Дочекатися редиректу (відповіді від сервера)
//       await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });

//       // 7. Отримати нову URL після переадресації
//       const redirectedUrl = page.url();
//       console.log('Нова URL-адреса після редиректу:', redirectedUrl);

//       // 8. Дочекатися появи елемента з посиланням на оплату
//       await page.waitForSelector('#link');

//       // 9. Забрати значення з input (посилання на оплату)
//       const paymentLink = await page.$eval('#link', el => el.value);

//       console.log('Посилання на оплату:', paymentLink);
//       await page.screenshot({ path: 'form_submission.png' });
//       return paymentLink; // Зберегти скріншот для перевірки
//     } catch (error) {
//       console.error('Помилка при роботі з формою:', error);
//     } finally {
//       // Закрити браузер
//       await browser.close();
//     }
//   }

  // Виклик функції
  // loginAndFillForm("Test123", "25", "Testowyi", "Example@gmail.com", "48574267422", "31-223", "Krakow", "Jana Pawla II", "154");
  import puppeteer from 'puppeteer';


  export async function loginAndFillForm(shipmentID, summa, senderFullName, senderEmail, senderPhone, senderPostalCode, senderCity, senderStreet, senderHouse) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      console.log('Перехожу на сторінку авторизації...');
      await page.goto('https://panel.przelewy24.pl/generator_link.php', { waitUntil: 'load', timeout: 60000 }); // Довший тайм-аут для навігації
      console.log('Сторінка завантажена.');

      console.log('Виконую авторизацію...');
      await page.type('#lo_login', '320208');
      await page.type('#lo_haslo', 'Ivancomparcels@2024');
      await Promise.all([
        page.click('#loginButton'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }) // Тайм-аут для навігації
      ]);
      console.log('Авторизація успішна!');

      // Перевіряємо, чи доступна форма
      console.log('Перевіряю доступність форми...');
      await page.waitForSelector('#formsz', { visible: true, timeout: 5000 });
      console.log('Форма доступна.');

      // Заповнюємо поля форми
      console.log('Заповнюю поля форми...');
      if (!shipmentID) {
        console.error('ERROR: shipmentID не визначено!');
        return;
      }
      console.log(`shipmentID: ${shipmentID}`);

      if (!summa) {
        console.error('ERROR: Сума не задана!');
        return;
      }
      console.log(`summa: ${summa}`);

      console.log(`senderFullName: ${senderFullName}`);
      console.log(`senderEmail: ${senderEmail}`);
      console.log(`senderPhone: ${senderPhone}`);
      console.log(`senderPostalCode: ${senderPostalCode}`);
      console.log(`senderCity: ${senderCity}`);
      console.log(`senderStreet: ${senderStreet}`);
      console.log(`senderHouse: ${senderHouse}`);

      await page.select('select[name="z24_id_sprzedawcy"]', '320208'); // Вибір ID продавця
      await page.type('input[name="z24_nazwa"]', `Plata za zamowienie numer ${String(shipmentID)}`); // Титул платежу
      await page.type('textarea[name="z24_opis"]', 'Zamowienie From Pl to Ua with Inpost'); // Додатковий опис
      await page.type('input[name="z24_kwota"]', String(summa)); // Сума
      await page.select('select[name="z24_currency"]', 'selected'); // Валюта
      await page.click('input[name="z24_language"][value="pl"]'); // Мова
      await page.type('input[name="z24_return_url"]', 'https://example.com'); // URL повернення

      // Заповнюємо інформацію про відправника
      await page.type('input[name="k24_nazwa"]', String(senderFullName));
      await page.type('input[name="k24_email"]', String(senderEmail));
      await page.type('input[name="k24_telefon"]', String(senderPhone));
      await page.type('input[name="k24_kod"]', String(senderPostalCode));
      await page.type('input[name="k24_miasto"]', String(senderCity));
      await page.type('input[name="k24_ulica"]', String(senderStreet));
      await page.type('input[name="k24_numer_dom"]', String(senderHouse));
      await page.select('select[name="k24_kraj"]', 'PL'); // Країна

      // Надіслати форму
      console.log('Надсилаю форму...');
      await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
      await page.click('input[type="submit"]'); // Клік по кнопці сабміту
      console.log('Форма заповнена та відправлена!');

      // Дочекаємося редиректу після сабміту
      console.log('Дочекаюся редиректу...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }); // Тайм-аут для редиректу
      console.log('Редирект завершено.');

      // Отримуємо нову URL після переадресації
      const redirectedUrl = page.url();
      console.log('Нова URL-адреса після редиректу:', redirectedUrl);

      // Чекаємо на посилання на оплату
      console.log('Дочекаюся елемента з посиланням на оплату...');
      await page.waitForSelector('#link', { visible: true, timeout: 5000 });

      // Забираємо посилання з input
      const paymentLink = await page.$eval('#link', el => el.value);
      console.log('Посилання на оплату:', paymentLink);

      // Виводимо скріншот
      await page.screenshot({ path: 'form_submission.png' });
      return paymentLink; // Повертаємо посилання на оплату
    } catch (error) {
      console.error('Помилка при роботі з формою:', error);
    } finally {
      // Закрити браузер
      await browser.close();

    }}




// loginToWebsite().catch(err => {
//   console.error('Ошибка:', err);
// });
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://panel.przelewy24.pl/generator_link.php');
    console.log('Page title:', await page.title());
    await browser.close();
  })();
