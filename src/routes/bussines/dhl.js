import { Router } from 'express';
import {
  createShipments,
  DHL_LABEL_TYPES,
  getLabels,
  getSoapClient,
  getTrackAndTraceInfo,
  resolveProductForCountry,
} from '../../utils/dhl24Client.js';

const router = Router();

/**
 * GET /api/dhl/label/:shipmentId?type=BLP
 * Віддає base64 контент і mime type.
 */
router.get('/label/:shipmentId', async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const type = (req.query.type || 'BLP').toString().toUpperCase();

    if (!DHL_LABEL_TYPES.includes(type)) {
      return res.status(400).json({ error: `Unsupported label type: ${type}` });
    }

    const out = await getLabels([{ shipmentId, labelType: type }]);
    console.log('getLabels result:', out);

    const item = out?.[0];

    if (!item?.data) {
      return res.status(404).json({ error: 'Label not found' });
    }

    return res.json({
      ok: true,
      shipmentId: item.shipmentId,
      labelType: item.labelType,
      contentType: item.contentType,
      data: item.data, // base64
    });
  } catch (e) {
    return res.status(422).json({ error: e.message || 'DHL label error' });
  }
});

// твій SOAP-клієнт DHL
// WSDL адрес DHL

/**
 * GET /api/dhl/countries
 * Отримати список країн, які доступні у твоєму DHL акаунті
 */
router.get('/countries', async (req, res) => {
  try {
    const client = await getSoapClient('https://dhl24.com.pl/webapi2');

    const [result] = await client.getInternationalParamsAsync({
      authData: {
        username: 'gmailcom_Qy4',
        password: '.Bh4zr1f2tCLZza',
      },
    });
    console.log('DHL raw response:', JSON.stringify(result, null, 2));
    const countries =
      result?.getInternationalParamsResult?.item?.map((c) => ({
        code: c.countryCode,
        name: c.countryName,
        active: c.isAvailable === true,
        products: c.products || [],
      })) || [];

    return res.json({ ok: true, countries });
  } catch (e) {
    console.error('getInternationalParams failed', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});
router.post('/debug/create', async (req, res) => {
  try {
    const {
      receiver,
      weightKg = 1,
      comment = '',
      reference = '',
      shipmentDate,
    } = req.body || {};
    if (!receiver?.country)
      return res.status(400).json({ error: 'receiver.country required' });

    // product по країні
    const product = await resolveProductForCountry(receiver.country);

    // pieces мінімальні за нашими правилами
    const w = Number(weightKg) || 1;
    const piece =
      w <= 1
        ? {
            type: 'PACKAGE',
            width: 15,
            height: 10,
            length: 15,
            weight: Math.max(w, 0.1),
            quantity: 1,
            nonStandard: false,
          }
        : {
            type: 'PACKAGE',
            width: 30,
            height: 20,
            length: 20,
            weight: Math.min(Math.max(w, 1.01), 3),
            quantity: 1,
            nonStandard: false,
          };

    // shipper дефолт (як у проді)
    const shipper = {
      name: 'IVAN KYSIL IVANCOM',
      postalCode: '37732',
      city: 'Medyka',
      street: 'Medyka',
      houseNumber: '405A',
      contactPerson: 'IVAN KYSIL',
      contactPhone: '570371048',
      contactEmail: 'ivancom.krakow@gmail.com',
    };

    // Мʼяка нормалізація індексу
    const normalizePostalIntl = (v = '') =>
      String(v)
        .normalize('NFKC')
        .replace(/[\u00A0\s\-–—]+/g, '');

    const rec = {
      addressType: receiver.isCompany ? 'B' : 'C',
      country: receiver.country,
      name: receiver.name,
      // postalCode: normalizePostalIntl(receiver.postalCode),
      postalCode: receiver.postalCode,
      city: receiver.city, // НЕ ріжемо — даємо повну назву
      street: receiver.street,
      houseNumber: receiver.houseNumber,
      apartmentNumber: receiver.apartmentNumber,
      contactPerson: receiver.contactPerson || receiver.name,
      contactPhone: receiver.contactPhone,
      contactEmail: receiver.contactEmail,
    };

    const payload = {
      authData: undefined, // ставиться всередині createShipments
      shipments: undefined, // конструюється всередині
    };
    console.log(rec);

    // Спроба створення «як є»
    const out = await createShipments({
      shipper,
      receiver: rec,
      pieces: [piece],
      payment: { paymentMethod: 'BANK_TRANSFER', payerType: 'SHIPPER' },
      service: { product, collectOnDelivery: false, insurance: false },
      shipmentDate: '2025-09-26', // shipmentDate || (new Date()).toISOString().slice(0,10),
      content: 'rzeczy',
      comment: String(comment).slice(0, 100),
      reference: String(reference).slice(0, 50),
      skipRestrictionCheck: false,
    });

    // Відповідь DHL*-/-*/
    return res.json({
      ok: true,
      debug: {
        product,
        // покажемо, як наші нормалізатори зрізали поля
        mappedReceiver: {
          ...rec,
          // покажемо довжини для наочного дебага
          _len: {
            city: (rec.city || '').length,
            street: (rec.street || '').length,
          },
        },
        piece,
      },
      dhl: out,
    });
  } catch (e) {
    // Витягнемо сирий fault з SOAP, якщо є
    const msg =
      e?.root?.Envelope?.Body?.Fault?.faultstring ||
      e?.message ||
      'DHL create error';
    return res.status(422).json({ error: msg, raw: e });
  }
});
/**
 * GET /api/dhl/track/:shipmentId
 * Повертає трек-таймлайн.
 */
router.get('/track/:shipmentId', async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const info = await getTrackAndTraceInfo(shipmentId);
    return res.json({ ok: true, ...info });
  } catch (e) {
    return res.status(422).json({ error: e.message || 'DHL track error' });
  }
});
router.get('/validate-postal', async (req, res) => {
  try {
    const country = (req.query.country || '').toString().trim().toUpperCase();
    const postalCode = (req.query.postalCode || '').toString().trim();
    const product = (req.query.product || '').toString().trim().toUpperCase() || await resolveProductForCountry(country);

    if (!country) return res.status(400).json({ ok: false, error: 'country required' });
    if (!postalCode) return res.status(400).json({ ok: false, error: 'postalCode required' });

    const client = await getSoapClient('https://dhl24.com.pl/webapi2');

    const [result] = await client.getPostalCodeServicesAsync({
      authData: {
        username: 'gmailcom_Qy4',
        password: '.Bh4zr1f2tCLZza',
      },
      country,
      postalCode,
      product, // важливо: DHL інколи перевіряє доступність саме під продукт
    });

    const payload = result?.getPostalCodeServicesResult || {};
    // у DHL це може бути або масив, або об’єкт з item
    const services = payload?.item || payload || [];
    const hasServices = Array.isArray(services) ? services.length > 0 : !!services?.service;

    return res.json({
      ok: true,
      input: { country, postalCode, product },
      hasServices,
      services, // сире що повернув DHL — для дебага
    });
  } catch (e) {
    return res.status(422).json({ ok: false, error: e?.message || 'DHL getPostalCodeServices error' });
  }
});

router.post('/validate-postal', async (req, res) => {
  try {
    const { country, postalCode } = req.body || {};
    let { product } = req.body || {};
    if (!country) return res.status(400).json({ ok: false, error: 'country required' });
    if (!postalCode) return res.status(400).json({ ok: false, error: 'postalCode required' });
    product = (product || (await resolveProductForCountry(String(country)))).toUpperCase();

    const client = await getSoapClient('https://dhl24.com.pl/webapi2');

    const [result] = await client.getPostalCodeServicesAsync({
      authData: {
        username: 'gmailcom_Qy4',
        password: '.Bh4zr1f2tCLZza',
      },
      country: String(country).toUpperCase(),
      postalCode: String(postalCode).trim(),
      product,
    });

    const payload = result?.getPostalCodeServicesResult || {};
    const services = payload?.item || payload || [];
    const hasServices = Array.isArray(services) ? services.length > 0 : !!services?.service;

    return res.json({
      ok: true,
      input: { country: String(country).toUpperCase(), postalCode: String(postalCode).trim(), product },
      hasServices,
      services,
    });
  } catch (e) {
    return res.status(422).json({ ok: false, error: e?.message || 'DHL getPostalCodeServices error' });
  }
});
// Простий мап валідних патернів для країн з нецифровими індексами
const ZIP_REGEX = {
  NL: [/^\d{4}[A-Z]{2}$/],                 // NNNNAA
  PT: [/^\d{4}-\d{3}$/],                   // NNNN-NNN
  MT: [/^[A-Z]{3}\d{4}$/],                 // AAANNNN (напр. VLT1111)
  // UK має багато варіантів — візьмемо узагальнену, робочу regex:
  GB: [/^(GIR\s?0AA|(?:(?:[A-Z]{1,2}\d{1,2}|[A-Z]{1,2}\d[A-Z]|[A-Z]\d{1,2}|[A-Z]\d[A-Z])\s?\d[A-Z]{2}))$/i],
};

// Для країн з чисто цифрою — генеруємо з zipFormat
const NUMERIC_BY_FORMAT = {
  'NNNN': /^\d{4}$/,
  'NNNNN': /^\d{5}$/,
  'NNNNNN': /^\d{6}$/,
};

function regexForCountryFromIntl(def) {
  // def.zipFormat із getInternationalParams
  const fmt = (def?.zipFormat || '').toUpperCase().trim();
  if (NUMERIC_BY_FORMAT[fmt]) return [NUMERIC_BY_FORMAT[fmt]];

  // базова генерація: A -> [A-Z], N -> \d, залишаємо дефіси/пробіли як є
  if (/^[AN\- ]+$/.test(fmt)) {
    const rx = new RegExp('^' + fmt
      .replace(/A/g, '[A-Z]')
      .replace(/N/g, '\\d') + '$', 'i');
    return [rx];
  }
  return []; // якщо не змогли визначити — перевіримо по хардкод-мапі вище
}

// Кеш країнових параметрів, щоб не тягнути кожен раз
let _intlCache = null;
async function loadIntlParams() {
  if (_intlCache) return _intlCache;
  const client = await getSoapClient('https://dhl24.com.pl/webapi2');
  const [result] = await client.getInternationalParamsAsync({
    authData: { username: 'gmailcom_Qy4', password: '.Bh4zr1f2tCLZza' },
  });
  const items = result?.getInternationalParamsResult?.item || [];
  _intlCache = items.reduce((acc, it) => {
    acc[it.countryCode] = it;
    return acc;
  }, {});
  return _intlCache;
}

/**
 * GET /api/dhl/validate-postal-intl?country=NL&postalCode=1012JS
 * Локальна перевірка по zipFormat із getInternationalParams (без виклику DHL помилки 105)
 */
router.get('/validate-postal-intl', async (req, res) => {
  try {
    const country = (req.query.country || '').toString().trim().toUpperCase();
    const postalCode = (req.query.postalCode || '').toString().trim();
    if (!country) return res.status(400).json({ ok: false, error: 'country required' });
    if (!postalCode) return res.status(400).json({ ok: false, error: 'postalCode required' });
    if (country === 'PL') return res.redirect(307, `/api/dhl/validate-postal?country=PL&postalCode=${encodeURIComponent(postalCode)}`);

    const intl = await loadIntlParams();
    const def = intl[country];

    // 1) спробуємо хардкод-регекси (NL/PT/GB/MT)
    let patterns = ZIP_REGEX[country] || [];
    // 2) якщо нема — згенеруємо з zipFormat
    if (!patterns.length) patterns = regexForCountryFromIntl(def);
    if (!patterns.length) return res.json({ ok: true, country, postalCode, valid: true, note: 'No zipFormat; cannot strictly validate' });

    const valid = patterns.some((rx) => rx.test(postalCode));
    return res.json({
      ok: true,
      country,
      postalCode,
      valid,
      zipFormat: def?.zipFormat || null,
      usedPatterns: patterns.map(String),
    });
  } catch (e) {
    return res.status(422).json({ ok: false, error: e?.message || 'intl validation error' });
  }
});

export default router;
