// services/tariffs.js

/** Нормалізація країни з будь-якої англ. варіації до ключа з таблиці */
export function normalizeCountryName(countryRaw = '') {
  const c = String(countryRaw).trim().toLowerCase();

  const map = {
    germany: 'Germany',
    deutschland: 'Germany',

    belgium: 'Belgium',

    'czech republic': 'Czechia',
    czechia: 'Czechia',

    spain: 'Spain',

    ireland: 'Ireland',

    italy: 'Italy',

    austria: 'Austria',

    bulgaria: 'Bulgaria',

    croatia: 'Croatia',

    cyprus: 'Cyprus',

    denmark: 'Denmark',

    estonia: 'Estonia',

    finland: 'Finland',

    france: 'France',

    greece: 'Greece',

    netherlands: 'Netherlands',
    holland: 'Netherlands',

    lithuania: 'Lithuania',

    luxembourg: 'Luxembourg',

    latvia: 'Latvia',

    malta: 'Malta',

    monaco: 'Monaco',

    portugal: 'Portugal',

    romania: 'Romania',

    slovakia: 'Slovakia',

    slovenia: 'Slovenia',

    sweden: 'Sweden',

    hungary: 'Hungary',

    poland: 'Poland',
  };

  // точне співпадіння по ключу
  if (map[c]) return map[c];

  // капіталізувати слова (fallback)
  return c
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(' ');
}

/**
 * Базові тарифи PL -> EU (кур'єр DHL) у zł
 * ключі — англ. назви країн
 */
const DHL_EU_RATES_PLN = {
  Germany: { kg1: 60, kg3: 64 },
  Belgium: { kg1: 73, kg3: 81 },
  Czechia: { kg1: 57, kg3: 61 },
  Spain: { kg1: 62, kg3: 79 },
  Ireland: { kg1: 87, kg3: 91 },
  Italy: { kg1: 71, kg3: 78 },
  Austria: { kg1: 73, kg3: 81 },
  Bulgaria: { kg1: 87, kg3: 91 },
  Croatia: { kg1: 87, kg3: 91 },
  Cyprus: { kg1: 87, kg3: 91 },
  Denmark: { kg1: 87, kg3: 91 },
  Estonia: { kg1: 63, kg3: 74 },
  Finland: { kg1: 71, kg3: 78 },
  France: { kg1: 75, kg3: 84 },
  Greece: { kg1: 87, kg3: 91 },
  Netherlands: { kg1: 64, kg3: 68 },
  Lithuania: { kg1: 63, kg3: 67 },
  Luxembourg: { kg1: 73, kg3: 81 },
  Latvia: { kg1: 63, kg3: 67 },
  Malta: { kg1: 86, kg3: 145 },
  Monaco: { kg1: 86, kg3: 145 },
  Portugal: { kg1: 87, kg3: 91 },
  Romania: { kg1: 71, kg3: 78 },
  Slovakia: { kg1: 56, kg3: 60 },
  Slovenia: { kg1: 89, kg3: 95 },
  Sweden: { kg1: 87, kg3: 91 },
  Hungary: { kg1: 69, kg3: 72 },
};

/**
 * Спеціальні PL тарифи LIKI24 (до 3 кг) — InPost всередині Польщі
 */
const LIKI24_INPOST_PLN = {
  inpost_courier: 36, // кур'єр
  inpost_paczkomat: 35, // поштомат
};

/**
 * Можливість перевизначити тарифи під конкретний бізнес.
 * За замовчуванням: businessId=0 — LIKI24 логіка з InPost PL та DHL EU.
 * Для інших бізнесів можна додати overrides.
 */
const BUSINESS_OVERRIDES = {
  // приклад структури:
  // 42: {
  //   inpost: { inpost_courier: 40, inpost_paczkomat: 38 },
  //   dhlEuRates: { ...DHL_EU_RATES_PLN, Germany: { kg1: 62, kg3: 66 } },
  //   insuranceRules: { enableDhl: true, th1kg: 40, th3kg: 120, fixedFee: 11 },
  // },
};

/** Отримати конфіг для бізнесу з fallback на LIKI24 дефолти */
function getBusinessConfig(businessId) {
  const overrides = BUSINESS_OVERRIDES[businessId];
  return {
    inpost: overrides?.inpost ?? LIKI24_INPOST_PLN,
    dhlEuRates: overrides?.dhlEuRates ?? DHL_EU_RATES_PLN,
    insuranceRules: overrides?.insuranceRules ?? {
      // Страховка рахується ТІЛЬКИ для DHL:
      enableDhl: true,
      // якщо declaredValue > threshold -> страхування = fixedFee
      th1kg: 40, // для 1 кг
      th3kg: 120, // для 3 кг
      fixedFee: 11, // PLN
    },
  };
}

/**
 * Розрахунок shipping_cost (PLN)
 * @param {{ businessId:number, method:string, country?:string, countryCode?:string, weightClass?: (1|3) }} p
 */
export function computeShippingCost(p) {
  const { businessId = 0, method, country, countryCode, weightClass = 3 } = p;
  const cfg = getBusinessConfig(businessId);

  // InPost всередині Польщі (для LIKI24 це фіксована ціна до 3 кг)
  const isInpost = method === 'inpost_courier' || method === 'inpost_paczkomat';
  const isPL =
    (countryCode || '').toUpperCase() === 'PL' ||
    normalizeCountryName(country) === 'Poland';

  if (isInpost && isPL) {
    const price = cfg.inpost[method];
    if (typeof price === 'number') return price;
  }

  // DHL кур'єр по Європі: беремо за таблицею PL -> EU
  const isDhl =
    method === 'dhl_courier_person' ||
    method === 'dhl_courier_company' ||
    method === 'dhl_courier';

  if (isDhl) {
    const key = normalizeCountryName(country);
    const row = cfg.dhlEuRates[key];
    if (!row) {
      // країна не знайдена — можна віддати 0 або кинути помилку
      return 0;
    }
    return weightClass === 1 ? row.kg1 : row.kg3;
  }

  // дефолт — нічого не знаємо
  return 0;
}

/**
 * Розрахунок insurance_cost (PLN)
 * ДЛЯ DHL: якщо declaredValue > threshold (залежить від ваги) — фіксований платіж.
 * Для InPost — 0 (страхування вбудоване/не тарифікуємо).
 * @param {{ businessId:number, method:string, declaredValue?:number, weightClass?: (1|3) }} p
 */
export function computeInsuranceCost(p) {
  const { businessId = 0, method, declaredValue = 0, weightClass = 3 } = p;
  const cfg = getBusinessConfig(businessId);

  const isDhl =
    method === 'dhl_courier_person' ||
    method === 'dhl_courier_company' ||
    method === 'dhl_courier';

  if (!isDhl || !cfg.insuranceRules?.enableDhl) return 0;

  const th =
    weightClass === 1 ? cfg.insuranceRules.th1kg : cfg.insuranceRules.th3kg;
  if (declaredValue > th) return cfg.insuranceRules.fixedFee;

  return 0;
}
