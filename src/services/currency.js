// currency.ts/js
import axios from 'axios';

export const fetchExchangeRate = async () => {
  try {
    const { data } = await axios.get(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&valcode=PLN',
    );
    const rateData = Array.isArray(data)
      ? data.find((x) => x.cc === 'PLN')
      : null;
    return rateData?.rate || 0; // UAH за 1 PLN
  } catch (e) {
    console.error('Помилка отримання курсу з НБУ:', e);
    return 0;
  }
};

// PLN -> UAH, з націнкою +6.5%, з усіма варіантами для Mono
export async function convertPlnToUahWithFee(plnAmount, feePct = 6.5) {
  const rate = await fetchExchangeRate(); // UAH per 1 PLN
  if (!rate) throw new Error('NBU PLN rate is 0');

  const baseUah = Number(plnAmount) * rate; // сума в грн
  const totalUah = baseUah * (1 + feePct / 100); // +6.5%
  const totalKop = Math.round(totalUah * 100); // для Monobank (копійки, integer)

  return {
    rate, // курс UAH/PLN
    baseUah, // без націнки
    totalUah, // з націнкою
    totalKop, // з націнкою у копійках (це і треба Mono)
  };
}
