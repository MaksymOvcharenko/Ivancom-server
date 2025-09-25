
import soap from 'soap';
import 'dotenv/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

const WSDL_URL = process.env.DHL24_WSDL_URL || 'https://dhl24.com.pl/webapi2';
const LOGIN = process.env.DHL24_LOGIN || '';
const PASS = process.env.DHL24_PASSWORD || '';
const ACCOUNT = String(process.env.DHL24_ACCOUNT_NUMBER || '');
const DEF_PROD = process.env.DHL24_DEFAULT_PRODUCT || 'AH';

/* ===== AUTH ===== */
function buildAuth() {
  return { username: LOGIN, password: PASS };
}

/* ===== SOAP CLIENT ===== */
export async function getSoapClient() {
  return await soap.createClientAsync(WSDL_URL, { timeout: 30000 });
}

/* ===== HELPERS ===== */
// function digitsOnly(s = '') {
//   return String(s).replace(/\D+/g, '');
// }
// function normalizePostcode(s = '') {
//   return digitsOnly(s).slice(0, 5); // 5 цифр
// }
function trimLen(s = '', n) {
  const v = String(s || '');
  return typeof n === 'number' ? v.slice(0, n) : v;
}
function clampHouseApt({ houseNumber = '', apartmentNumber = '' } = {}) {
  let h = trimLen(houseNumber, 15);
  let a = trimLen(apartmentNumber, 15);
  if ((h + a).length > 15) a = a.slice(0, Math.max(15 - h.length, 0));
  return { houseNumber: h, apartmentNumber: a };
}
function toIsoDateFromPl(s) {
  // "25-09-2025" -> "2025-09-25"
  const m = String(s).match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
// прибрати пробіли/непереносимі пробіли і будь-які тире/довгі дефіси
export function normalizePostalSimple(v) {
  return String(v ?? '')
    .normalize('NFKC')
    .replace(/[\u00A0\s\-–—]+/g, '') // пробіли + -, – , —
    .toUpperCase();
}
// десь поряд:
const _clean = (v) =>
  String(v ?? "")
    .normalize("NFKC")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2010-\u2015\u2212]/g, "-") // різні види тире → "-"
    .replace(/\s+/g, " ")
    .trim();

export function normalizePostalInternational(v = "", country) {
  const cc = String(country || "").toUpperCase();
  let s = _clean(v);

  // якщо країна невідома — просто вертаємо очищене значення БЕЗ видалення дефісів
  if (!cc) return s;

  switch (cc) {
    // Польща: NN-NNN. Якщо дали "NNNNN", вставляємо дефіс 2-3.
    // case "PL": {
    //   const d = s.replace(/\D/g, "");
    //   if (/^\d{5}$/.test(d)) return `${d.slice(0, 2)}-${d.slice(2)}`;
    //   if (/^\d{2}-\d{3}$/.test(s)) return s;
    //   return s; // не ламати, якщо щось нетипове
    // }

    // Португалія: NNNN-NNN. Якщо дали "NNNNNNN", вставляємо дефіс 4-5.
    case "PT": {
      const compact = s.replace(/\s+/g, "");
      if (/^\d{4}-\d{3}$/.test(compact)) return compact;
      const digits = compact.replace(/-/g, "");
      if (/^\d{7}$/.test(digits)) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return compact;
    }

    // Нідерланди: NNNNAA (без пробілу, літери UPPER)
    case "NL": {
      const z = s.replace(/\s+/g, "").toUpperCase();
      return z;
    }

    // Мальта: AAANNNN (3 літери + 4 цифри, без пробілу)
    case "MT": {
      const z = s.replace(/\s+/g, "").toUpperCase();
      return z;
    }

    // Велика Британія: залишаємо пробіл перед останніми 3 символами
    // (канонізація без суворої перевірки всіх варіантів)
    case "GB": {
      let z = s.replace(/\s+/g, "").toUpperCase();
      if (z.length > 3) z = z.replace(/^(.+)([A-Z0-9]{3})$/, "$1 $2");
      return z;
    }

    default:
      return s;
  }
}
// приклади:
// "28 217"   -> "28217"
// "12-345"   -> "12345"
// "1234 AB"  -> "1234AB"

// --- helper: витягнути всі доступні дати з тексту помилки DHL
function extractAvailableDatesFromError(errMsg = '') {
  const re = /(\d{2}-\d{2}-\d{4})/g; // dd-MM-YYYY
  const found = [];
  let m;
  while ((m = re.exec(String(errMsg))) !== null) found.push(m[1]);
  // конвертуємо у ISO
  const iso = found.map(toIsoDateFromPl).filter(Boolean);
  // унікальні, в початковому порядку
  return [...new Set(iso)];
}
function mapAddress(a = {}) {
  // для shipper country ОБОВʼЯЗКОВО має їхати у SOAP
  const country = String(a.country || "PL").toUpperCase();
  return {
    name: a.name,
    country,                          // <-- не викидати!
    street: a.street,
    houseNumber: a.houseNumber,
    city: a.city,
    postalCode: normalizePostalInternational(a.postalCode, country),
    apartmentNumber: a.apartmentNumber || "",
    contactPerson: a.contactPerson || a.name,
    contactPhone: a.contactPhone,
    contactEmail: a.contactEmail,
  };
}

function mapReceiver(r = {}) {
  const country = String(r.country || "").toUpperCase();
  return {
    addressType: r.addressType || (r.isCompany ? "B" : "C"),
    country,                          // <-- обовʼязково
    isPackstation: false,
    isPostfiliale: false,
    postnummer: null,
    name: r.name,
    postalCode: normalizePostalInternational(r.postalCode, country),
    city: r.city,
    street: r.street,
    houseNumber: r.houseNumber,
    apartmentNumber: r.apartmentNumber || "",
    contactPerson: r.contactPerson || r.name,
    contactPhone: r.contactPhone,
    contactEmail: r.contactEmail,
  };
}
function defaultPiece() {
  return {
    type: 'PACKAGE',
    width: 15,
    height: 10,
    length: 15,
    weight: 1,
    quantity: 1,
    nonStandard: false,
    euroReturn: false,
  };
}
export const DHL_LABEL_TYPES = [
  'LP', // list przewozowy (PDF)
  'BLP', // etykieta BLP (PDF)
  'BLP_A4', // BLP в PDF A4 (інколи називають BLP_PDF_A4 або BLPp? тримай як BLP_A4 якщо у твоїй інсталяції є)
  'ZBLP', // Zebra ZPL
  'ZBLP300', // Zebra ZPL 300dpi
  'QR_PDF', // QR у PDF (ZK i ZC)
  'QR2_IMG', // QR 2x2 cm PNG
  'QR4_IMG', // QR 4x4 cm PNG
  'QR6_IMG', // QR 6x6 cm PNG
];
/* ===== CACHES ===== */
let _intlParamsCache = null; // мапа { countryCode: { product, pieceHeader, ... } }

/* ===== PUBLIC: META ===== */
export async function getVersion() {
  const client = await getSoapClient();
  const [res] = await client.getVersionAsync({});
  return res?.getVersionResult;
}

/**
 * getInternationalParams — тягнемо довідник для міжнародних відправок.
 * Повертає масив елементів з кодом країни та параметрами (в т.ч. product).
 */
export async function getInternationalParams() {
  const client = await getSoapClient();
  const payload = { authData: buildAuth() };
  const [res] = await client.getInternationalParamsAsync(payload);
  const list = res?.getInternationalParamsResult?.params?.item || [];
  console.log('getInternationalParams raw:', list);

  // нормалізуємо у зручний формат
  return list.map((it) => ({
    countryName: it?.countryName || null,
    countryNameEn: it?.countryNameEn || null,
    countryCode: it?.countryCode || null, // напр. "DE"
    product: it?.product || null, // напр. "EK" (DHL PARCEL CONNECT)
    pieceHeader: it?.pieceHeader || null,
    pickupDays: Number(it?.pickupDays ?? 0),
    packstationAvailable:
      it?.packstationAvailable === true || it?.packstationAvailable === 'true',
    postfilialeAvailable:
      it?.postfilialeAvailable === true || it?.postfilialeAvailable === 'true',
    // можна додати інші поля за потреби
  }));
}

/**
 * Кешована мапа countryCode -> product
 */
export async function resolveProductForCountry(
  countryCode,
  fallback = DEF_PROD,
) {
  const cc = String(countryCode || '').toUpperCase();
  if (!cc) return fallback;

  if (!_intlParamsCache) {
    const list = await getInternationalParams();
    _intlParamsCache = new Map();
    for (const it of list) {
      if (it.countryCode)
        _intlParamsCache.set(String(it.countryCode).toUpperCase(), it);
    }
  }

  const rec = _intlParamsCache.get(cc);
  // product з довідника (на скрінах це "EK" для DE — DHL PARCEL CONNECT)
  return rec?.product || fallback;
}

/**
 * getPostalCodeServices — перевірка валідності поштового коду та доступних сервісів на дату.
 * @param {object} args { postCode, pickupDate:'YYYY-MM-DD', city?, street?, houseNumber?, apartmentNumber? }
 */
export async function getPostalCodeServices(args = {}) {
  const client = await getSoapClient();
  const payload = {
    authData: buildAuth(),
    postCode: normalizePostalInternational(args.postCode),
    pickupDate: args.pickupDate, // 'YYYY-MM-DD'
  };
  if (args.city) payload.city = trimLen(args.city, 35);
  if (args.street) payload.street = trimLen(args.street, 35);
  if (args.houseNumber) payload.houseNumber = trimLen(args.houseNumber, 15);
  if (args.apartmentNumber)
    payload.apartmentNumber = trimLen(args.apartmentNumber, 15);

  const [res] = await client.getPostalCodeServicesAsync(payload);
  const r = res?.getPostalCodeServicesResult || {};
  return {
    ok: !!r,
    // головні прапори
    domesticExpress9: !!r.domesticExpress9,
    domesticExpress12: !!r.domesticExpress12,
    deliveryEvening: !!r.deliveryEvening,
    pickupOnSaturday: !!r.pickupOnSaturday,
    deliverySaturday: !!r.deliverySaturday,
    exPickupFrom: r.exPickupFrom || null,
    exPickupTo: r.exPickupTo || null,
    // сирий респонс, якщо треба подивитися все
    raw: r,
  };
}

/* ===== SHIPMENTS ===== */
export async function createShipments({
  shipper,
  receiver,
  pieces,
  payment,
  service,
  shipmentDate = new Date().toISOString().slice(0, 10),
  content = 'rzeczy',
  comment = '',
  reference = '',
  skipRestrictionCheck = false,
} = {}) {
  const client = await getSoapClient();
 client.on('request', (xml) => console.log('SOAP REQUEST >>>\n', xml));
client.on('response', (xml) => console.log('SOAP RESPONSE <<<\n', xml));
  const finalPayment = {
    paymentMethod: 'BANK_TRANSFER',
    payerType: 'SHIPPER',
    accountNumber: ACCOUNT,
    ...(payment || {}),
  };

  const finalService = {
    product: DEF_PROD,
    ...(service || {}),
  };

  const payload = {
    authData: buildAuth(),
    shipments: {
      item: [
        {
          shipper: mapAddress(shipper || {}),
          receiver: mapReceiver(receiver || {}),
          pieceList: {
            item: pieces && pieces.length ? pieces : [defaultPiece()],
          },
          payment: finalPayment,
          service: finalService,
          shipmentDate,
          skipRestrictionCheck,
          comment,
          content,
          reference,
        },
      ],
    },
  };

  try {
    const [res] = await client.createShipmentsAsync(payload);
    const list = res?.createShipmentsResult?.item || [];
    return list.map((it) => ({
      shipmentId: it?.shipmentId ?? null,
      orderStatus: it?.orderStatus ?? null,
      error: it?.error ?? null,
    }));
  } catch (e) {
    const msg =
      e?.root?.Envelope?.Body?.Fault?.faultstring ||
      e?.message ||
      'DHL24 createShipments error';
    return [{ shipmentId: null, orderStatus: null, error: String(msg) }];
  }
}
export async function createShipmentsSmart(args = {}) {
  const tryOnce = async (date) => {
    const res = await createShipments({ ...args, shipmentDate: date });
    return res;
  };

  const initialDate =
    args.shipmentDate || new Date().toISOString().slice(0, 10);

  // 1) перша спроба — як є
  let res = await tryOnce(initialDate);
  const first = res?.[0];

  // якщо успіх або не дата-помилка — повертаємо як є
  if (!first?.error) return res;

  // 2) парсимо доступні дати з тексту помилки
  const dates = extractAvailableDatesFromError(first.error);
  if (!dates.length) return res; // нічого парсити — віддаємо початкову помилку

  // приберемо початкову (щоб не повторювати ту саму дату)
  const queue = dates.filter((d) => d !== initialDate);

  // 3) ідемо по черзі, поки не вистрілить
  for (const date of queue) {
    const attempt = await tryOnce(date);
    const item = attempt?.[0];
    if (item && !item.error) {
      // підклеїмо інфо, що дата була авто-змінена (опціонально)
      return attempt;
    }
    res = attempt; // збережемо останню помилку
  }

  return res;
}
// === допоміжні речі для unified ===
function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Обчислити страхову суму в PLN.
 * @param {{valuationPln?: number, valuationUah?: number}} v
 * @returns {{enabled:boolean, valuePln?:number}}
 */
function resolveInsurance(v = {}) {
  const { valuationPln, valuationUah } = v;
  if (valuationPln && valuationPln > 0) {
    return { enabled: true, valuePln: round2(valuationPln) };
  }
  if (valuationUah && valuationUah > 0) {
    // з ТЗ: страховка = (оценка / 10,5 грн) в злотих
    return { enabled: true, valuePln: round2(Number(valuationUah) / 10.5) };
  }
  return { enabled: false };
}

/**
 * Вибрати габарити під вагу (≤1 кг або ≤3 кг).
 * @param {number} weightKg
 * @returns {{width:number,height:number,length:number,weight:number}}
 */
function pieceByWeight(weightKg = 1) {
  const w = Number(weightKg) || 1;
  if (w <= 1) {
    return { width: 15, height: 10, length: 15, weight: Math.max(w, 0.1) };
  }
  // до 3 кг
  return {
    width: 30,
    height: 20,
    length: 20,
    weight: Math.min(Math.max(w, 1.01), 3),
  };
}

/**
 * Уніфікований виклик створення відправлення DHL.
 *
 * @param {{
 *   shipper?: any,                    // якщо не передаси — візьметься з .env/дефолтів
 *   receiver: {
 *     country: string,                // 'PL' | 'DE' | ...
 *     name: string,
 *     postalCode: string,
 *     city: string,
 *     street: string,
 *     houseNumber?: string,
 *     apartmentNumber?: string,
 *     contactPerson?: string,
 *     contactPhone?: string,
 *     contactEmail?: string,
 *     isCompany?: boolean             // true -> B, false -> C
 *   },
 *   weightKg: 1|3,                    // 1 або 3 (можна дробове 1.2, 2.7)
 *   comment?: string,                 // до 100 символів
 *   reference?: string,               // № замовлення тощо
 *   shipmentDate?: string,            // YYYY-MM-DD (не обов'язково)
 *   valuationPln?: number,            // оцінка в PLN (вмикає страхування)
 *   valuationUah?: number,            // або оцінка в UAH
 * }} args
 *
 * @returns same as createShipmentsSmart
 */
export async function createDhlShipmentUnified(args = {}) {
  if (!args?.receiver?.country) {
    throw new Error('receiver.country is required');
  }
  const receiver = {
    ...args.receiver,
    addressType: args.receiver.isCompany ? 'B' : 'C',
  };

  // product: PL — беремо дефолт AH; інші країни — через getInternationalParams
  const country = String(receiver.country).toUpperCase();
  const product =
    country === 'PL'
      ? process.env.DHL24_DEFAULT_PRODUCT || 'AH'
      : await resolveProductForCountry(country);

  // габарити по вазі
  const piece = pieceByWeight(args.weightKg || 1);

  // страхування
  const ins = resolveInsurance({
    valuationPln: args.valuationPln,
    valuationUah: args.valuationUah,
  });

  // комент/референс обрізати в межах API
  const comment = (args.comment || '').toString().slice(0, 100);
  const reference = (args.reference || '').toString().slice(0, 50);

  // дата (можеш не передавати — візьме сьогодні, а обгортка сама перепробує допустимі)
  const date = args.shipmentDate || new Date().toISOString().slice(0, 10);

  // shipper — якщо не передали, поставимо базовий (замінюй на свої дефолти за потреби)
  const shipperDefault = {
    name: 'IVAN KYSIL IVANCOM',
    postalCode: '37732',
    city: 'Medyka',
    street: 'Medyka',
    houseNumber: '405A',
    contactPerson: 'IVAN KYSIL',
    contactPhone: '570371048',
    contactEmail: 'ivancom.krakow@gmail.com',
  };

  const service = {
    product,
    collectOnDelivery: false,
    insurance: ins.enabled,
  };

  // деякі інсталяції DHL очікують поле insuranceValue
  if (ins.enabled) {
    service.insuranceValue = ins.valuePln; // якщо API це не приймає, просто прибери це поле
  }

  return await createShipmentsSmart({
    shipper: args.shipper || shipperDefault,
    receiver,
    pieces: [{ type: 'PACKAGE', quantity: 1, nonStandard: false, ...piece }],
    service,
    payment: { paymentMethod: 'BANK_TRANSFER', payerType: 'SHIPPER' },
    shipmentDate: date,
    content: 'rzeczy',
    comment,
    reference,
  });
}
// export async function getLabels(items = []) {
//   if (!Array.isArray(items) || items.length === 0) {
//     throw new Error('getLabels: items is required');
//   }
//   const client = await getSoapClient();

//   const payload = {
//     authData: buildAuth(),
//     itemsToPrint: {
//       item: items.slice(0, 3).map((it) => ({
//         labelType: it.labelType,
//         // деякі інсталяції хочуть integer, інші — string, тож просто передамо як є
//         shipmentId: it.shipmentId,
//       })),
//     },
//   };

//   const [res] = await client.getLabelsAsync(payload);
//   console.log('getLabels res=', res);

//   const raw = res?.getLabelsResult?.itemsToPrintResponse?.item || [];
//   const mapContentType = (t) => {
//     if (t === 'ZBLP' || t === 'ZBLP300') return 'application/zpl';
//     if (t.endsWith('_IMG')) return 'image/png';
//     return 'application/pdf';
//   };

//   return raw.map((it) => ({
//     shipmentId: it?.shipmentId ?? null,
//     labelType: it?.labelType ?? null,
//     data: it?.labelData ?? null, // base64
//     contentType: mapContentType(it?.labelType),
//   }));
// }
export async function getLabels(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('getLabels: items is required');
  }
  const client = await getSoapClient();

  const payload = {
    authData: buildAuth(),
    itemsToPrint: {
      item: items.slice(0, 3).map((it) => ({
        labelType: it.labelType,
        shipmentId: it.shipmentId,
      })),
    },
  };

  const [res] = await client.getLabelsAsync(payload);
  // console.log('getLabels raw response:', JSON.stringify(res, null, 2)); // ← лиши на час дебага

  const root = res?.getLabelsResult || res?.GetLabelsResult || res;

  // helpers
  const arrify = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const firstNonEmpty = (...cands) => {
    for (const c of cands) {
      const a = arrify(c);
      if (a.length) return a;
    }
    return [];
  };

  // різні варіанти, які трапляються у DHL24:
  // 1) { getLabelsResult: { itemsToPrintResponse: { item: [...] } } }
  // 2) { getLabelsResult: { item: [...] } }
  // 3) інколи просто { getLabelsResult: { ...one item... } }
  const raw = firstNonEmpty(
    root?.itemsToPrintResponse?.item,
    root?.itemsToPrintResponse,
    root?.item,
    root,
  );

  const mapContentType = (t = '') => {
    if (t === 'ZBLP' || t === 'ZBLP300') return 'application/zpl';
    if (String(t).endsWith('_IMG')) return 'image/png';
    return 'application/pdf';
  };

  // у різних інсталяціях поле з base64 називається labelData / labeldata / data / fileContent / file
  const out = raw
    .map((it) => {
      const labelType = it?.labelType ?? it?.type ?? null;
      const shipmentId = it?.shipmentId ?? it?.shipmentID ?? it?.id ?? null;
      const data =
        it?.labelData ??
        it?.labeldata ??
        it?.data ??
        it?.fileContent ??
        it?.file ??
        null;

      return data
        ? {
            shipmentId,
            labelType,
            data,
            contentType: mapContentType(labelType),
          }
        : null;
    })
    .filter(Boolean);

  return out;
}
export async function getPostalCodeServicesTest({
  postCode,
  pickupDate,
  city,
  street,
  houseNumber,
  apartmentNumber,
} = {}) {
  if (!postCode) throw new Error('postCode is required');
  if (!pickupDate) throw new Error('pickupDate is required');

  const client = await getSoapClient();

  const payload = {
    authData: buildAuth(),
    postCode: normalizePostalSimple(postCode),
    pickupDate, // 'YYYY-MM-DD'
    city: city || undefined,
    street: street || undefined,
    houseNumber: houseNumber || undefined,
    apartmentNumber: apartmentNumber || undefined,
  };

  const [res] = await client.getPostalCodeServicesAsync(payload);

  const r =
    res?.getPostalCodeServicesResult || res?.GetPostalCodeServicesResult || res;
  // повертаємо як є + echo
  return {
    echo: {
      postCode: payload.postCode,
      pickupDate,
      city,
      street,
      houseNumber,
      apartmentNumber,
    },
    data: r || null,
  };
}
/**
 * Трекінг/події по відправці.
 * Повертає: { shipmentId, receivedBy, events: [{date, description, location?, status?}] }
 */
export async function getTrackAndTraceInfo(shipmentId) {
  if (!shipmentId)
    throw new Error('getTrackAndTraceInfo: shipmentId is required');
  const client = await getSoapClient();

  const payload = { authData: buildAuth(), shipmentId };
  const [res] = await client.getTrackAndTraceInfoAsync(payload);
  const r = res?.getTrackAndTraceInfoResult || {};

  const events = (r?.events?.item || []).map((e) => ({
    date: e?.eventTime || e?.time || e?.date || null,
    description: e?.description || e?.eventDescription || e?.status || null,
    location: e?.terminal || e?.location || null,
    status: e?.status || null,
  }));

  // відсортуємо за датою якщо можливо
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    shipmentId: r?.shipmentId || String(shipmentId),
    receivedBy: r?.receivedBy || null,
    events,
    raw: r, // на випадок дебага
  };
}
/* корисні експорти */
export const auth = buildAuth;
export const _normalize = {
  
  clampHouseApt,
  mapAddress,
  mapReceiver,
};
