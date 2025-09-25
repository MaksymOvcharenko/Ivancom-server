// /* routes/dhlLog.js */
// import express from 'express';
// import fs from 'fs';
// import path from 'path';
// import { createShipments } from '../utils/dhl24Client.js'; // ваш createShipments
// import {
//   normalizePostalByCountry,
//   normalizePhoneDigits,
// } from '../utils/normalizers.js'; // опц: винести нормалізатори

// const router = express.Router();
// const LOG_FILE = path.join(process.cwd(), 'dhl-attempts.log');

// function nowISO() {
//   return new Date().toISOString();
// }

// function safeString(v) {
//   try {
//     return typeof v === 'string' ? v : JSON.stringify(v);
//   } catch {
//     return String(v);
//   }
// }

// /**
//  * POST /api/dhl/log-create
//  * Тіло = як для debug/create (receiver, weightKg, comment, reference, userInfo?)
//  * Записує лог, намагається викликати createShipments (опціонально), записує відповідь і повертає.
//  */
// router.post('/log-create', async (req, res) => {
//   try {
//     const body = req.body || {};
//     const user = req.user
//       ? { id: req.user.id, email: req.user.email }
//       : body.user || null;
//     const receivedAt = nowISO();

//     // Normalize fields we care about
//     const rawReceiver = body.receiver || {};
//     const country = (rawReceiver.country || '').toString().toUpperCase();
//     const normalizedPostal = normalizePostalByCountry(
//       country,
//       rawReceiver.postalCode || '',
//     );
//     const normalizedPhone = normalizePhoneDigits(
//       rawReceiver.contactPhone || '',
//     );

//     const mappedReceiver = {
//       addressType: (
//         rawReceiver.addressType ||
//         (rawReceiver.isCompany ? 'B' : 'C') ||
//         'C'
//       )
//         .toString()
//         .toUpperCase(),
//       country,
//       name: rawReceiver.name || null,
//       postalCodeRaw: rawReceiver.postalCode || null,
//       postalCodeNormalized: normalizedPostal,
//       city: rawReceiver.city || null,
//       street: rawReceiver.street || null,
//       houseNumber: rawReceiver.houseNumber || null,
//       apartmentNumber: rawReceiver.apartmentNumber || null,
//       contactPerson: rawReceiver.contactPerson || rawReceiver.name || null,
//       contactPhoneRaw: rawReceiver.contactPhone || null,
//       contactPhoneNormalized: normalizedPhone,
//       contactEmail: rawReceiver.contactEmail || null,
//     };

//     // Build log entry
//     const entry = {
//       time: receivedAt,
//       source: req.ip || req.headers['x-forwarded-for'] || 'unknown',
//       user,
//       request: {
//         reference: body.reference || null,
//         comment: body.comment || null,
//         weightKg: body.weightKg || null,
//         receiver: rawReceiver,
//         mappedReceiver,
//       },
//     };

//     // Optionally try to call DHL and capture result (comment out if не хочеш викликів)
//     let dhlResult = null;
//     try {
//       const shipmentPayload = {
//         shipper: body.shipper || undefined,
//         receiver: {
//           // підставляємо вже нормалізовані поля
//           addressType: mappedReceiver.addressType,
//           country: mappedReceiver.country,
//           name: mappedReceiver.name,
//           postalCode: mappedReceiver.postalCodeNormalized,
//           city: mappedReceiver.city,
//           street: mappedReceiver.street,
//           houseNumber: mappedReceiver.houseNumber,
//           apartmentNumber: mappedReceiver.apartmentNumber,
//           contactPerson: mappedReceiver.contactPerson,
//           contactPhone: mappedReceiver.contactPhoneNormalized,
//           contactEmail: mappedReceiver.contactEmail,
//         },
//         pieces: body.pieces || undefined,
//         payment: body.payment || undefined,
//         service: body.service || undefined,
//         shipmentDate:
//           body.shipmentDate || new Date().toISOString().slice(0, 10),
//         content: body.content || 'rzeczy',
//         comment: body.comment || '',
//         reference: body.reference || '',
//         skipRestrictionCheck: true,
//       };

//       // Виклик createShipments і отримання сирої відповіді
//       const result = await createShipments(shipmentPayload);
//       dhlResult = result;
//       entry.dhl = { ok: true, result };
//     } catch (e) {
//       const errMsg =
//         e?.message || (e && e.toString()) || 'createShipments error';
//       entry.dhl = { ok: false, error: errMsg, raw: e?.root ?? null };
//     }

//     // Записати у лог файл (JSON-рядок + новий рядок)
//     fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', {
//       encoding: 'utf8',
//     });

//     // Відповідь клієнту: ехо + що записано
//     return res.json({
//       ok: true,
//       loggedAt: receivedAt,
//       entryPreview: entry,
//       dhlResult,
//     });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ ok: false, error: err?.message || String(err) });
//   }
// });

// export default router;
// routes/dhlLog.js  (оновити наявний файл)
import express from "express";
import fs from "fs";
import path from "path";
import { createShipments } from "../utils/dhl24Client.js"; // твій createShipments
import { normalizePostalByCountry, normalizePhoneDigits } from "../utils/normalizers.js";

const router = express.Router();
const LOG_FILE = path.join(process.cwd(), "dhl-attempts.log");

function nowISO() { return new Date().toISOString(); }

router.post("/log-create", async (req, res) => {
  try {
    const body = req.body || {};
    const user = req.user ? { id: req.user.id, email: req.user.email } : (body.user || null);
    const receivedAt = nowISO();

    const rawReceiver = body.receiver || {};
    const country = (rawReceiver.country || "").toString().toUpperCase();
    const normalizedPostal = normalizePostalByCountry(country, rawReceiver.postalCode || "");
    const normalizedPhone = normalizePhoneDigits(rawReceiver.contactPhone || "");

    const mappedReceiver = {
      addressType: (rawReceiver.addressType || (rawReceiver.isCompany ? "B" : "C") || "C").toString().toUpperCase(),
      country,
      name: rawReceiver.name || null,
      postalCodeRaw: rawReceiver.postalCode || null,
      postalCodeNormalized: normalizedPostal,
      city: rawReceiver.city || null,
      street: rawReceiver.street || null,
      houseNumber: rawReceiver.houseNumber || null,
      apartmentNumber: rawReceiver.apartmentNumber || null,
      contactPerson: rawReceiver.contactPerson || rawReceiver.name || null,
      contactPhoneRaw: rawReceiver.contactPhone || null,
      contactPhoneNormalized: normalizedPhone,
      contactEmail: rawReceiver.contactEmail || null,
    };

    // === Ivancom shipper defaults (підставляємо якщо client не надали shipper) ===
    const defaultShipper = {
      name: "IVAN KYSIL IVANCOM",
      country: 'PL',
      postalCode: "37732",
      city: "Medyka",
      street: "Medyka",
      houseNumber: "405A",
      contactPerson: "IVAN KYSIL",
      contactPhone: "570371048",
      contactEmail: "ivancom.krakow@gmail.com",
    };
    // якщо у body.shipper є — беремо його; інакше ставимо дефолт
    const shipper = Object.assign({}, defaultShipper, body.shipper || {});

    // === service defaults (продукт) ===
    // дозволяй передавати product у body.service.product, інакше дефолт з env/конфігу
    const service = Object.assign(
      {
        product: body.service?.product || process.env.DHL24_DEFAULT_PRODUCT || "AH",
        insurance: body.service?.insurance ?? false,
        collectOnDelivery: body.service?.collectOnDelivery ?? false,
      },
      body.service || {}
    );

    const entry = {
      time: receivedAt,
      source: req.ip || req.headers["x-forwarded-for"] || "unknown",
      user,
      request: {
        reference: body.reference || null,
        comment: body.comment || null,
        weightKg: body.weightKg || null,
        receiver: rawReceiver,
        mappedReceiver,
        shipper,
        service,
      },
    };

    // === спроба відправити на DHL (логування відповіді) ===
    try {
      const shipmentPayload = {
        shipper: {
          name: shipper.name,
          postalCode: shipper.postalCode,
          city: shipper.city,
          street: shipper.street,
          houseNumber: shipper.houseNumber,
          contactPerson: shipper.contactPerson,
          contactPhone: shipper.contactPhone,
          contactEmail: shipper.contactEmail,
        },
        receiver: {
          addressType: mappedReceiver.addressType,
          country: mappedReceiver.country,
          name: mappedReceiver.name,
          postalCode: mappedReceiver.postalCodeNormalized,
          city: mappedReceiver.city,
          street: mappedReceiver.street,
          houseNumber: mappedReceiver.houseNumber,
          apartmentNumber: mappedReceiver.apartmentNumber,
          contactPerson: mappedReceiver.contactPerson,
          contactPhone: mappedReceiver.contactPhoneNormalized,
          contactEmail: mappedReceiver.contactEmail,
        },
        pieces: body.pieces || [{ type: "PACKAGE", width: 15, height: 10, length: 15, weight: body.weightKg || 1, quantity: 1, nonStandard: false }],
        payment: body.payment || { paymentMethod: "BANK_TRANSFER", payerType: "SHIPPER" },
        service: {
          product: "EK",
          insurance: service.insurance,
          collectOnDelivery: service.collectOnDelivery,
        },
        shipmentDate: body.shipmentDate || new Date().toISOString().slice(0, 10),
        content: body.content || "rzeczy",
        comment: body.comment || "",
        reference: body.reference || "",
        skipRestrictionCheck: body.skipRestrictionCheck ?? true,
      };

      const dhlRes = await createShipments(shipmentPayload);
      entry.dhl = { ok: true, result: dhlRes, payloadSent: shipmentPayload };
    } catch (e) {
      entry.dhl = {
        ok: false,
        error: e?.message || (e && e.toString()) || "createShipments error",
        raw: (e && e.root) || null,
      };
    }

    // append to file
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", { encoding: "utf8" });

    return res.json({ ok: true, loggedAt: receivedAt, entryPreview: entry });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;
