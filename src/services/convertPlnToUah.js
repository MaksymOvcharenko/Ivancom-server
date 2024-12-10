export async function convertToUAH(amountInPln) {
    const apiUrl = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const plnRate = data.find((currency) => currency.cc === "PLN").rate;

      // Конвертуємо суму
      const amountInUAH = amountInPln * plnRate;
      console.log(amountInPln + "PLN");
      console.log(amountInUAH + "UAH");

      return amountInUAH.toFixed(2).toString(); // Округлення до 2 знаків
    } catch (error) {
      console.error("Помилка отримання курсу валют:", error);
      return null;
    }
  }

  // Використання
  // convertToUAH(100).then((uah) => {
  //   let uahOur = uah *1.05;
  //   console.log(`100 PLN = ${uahOur} UAH`);
  //   return uahOur.toString();

  // });
  // convertToUAH(100);
