// /* eslint-env node */

// import { auth, createShipments } from '../utils/dhl24Client.js';

// console.log('Auth preview:', auth());
// const shipment = {
//   shipper: {
//     name: 'IVAN KYSIL IVANCOM',
//     postalCode: '37732', // без дефіса
//     city: 'MEDYKA',
//     street: 'MEDYKA',
//     houseNumber: '405A',
//     contactPerson: 'IVAN KYSIL',
//     contactPhone: '570371048',
//     contactEmail: 'ivancom.krakow@gmail.com',
//   },
//   receiver: {
//     addressType: 'B', // B – firma / C – osoba prywatna
//     country: 'PL',
//     name: 'Odbiorca Test',
//     postalCode: '00909',
//     city: 'Warszawa',
//     street: 'Wąwozowa',
//     houseNumber: '2',
//     contactPerson: 'Jan Test',
//     contactPhone: '600000000',
//     contactEmail: 'odbiorca@example.com',
//   },
//   pieceList: [
//     {
//       type: 'PACKAGE', // PACKAGE | ENVELOPE | PALLET
//       weight: 2, // кг
//       width: 20,
//       height: 10,
//       length: 30,
//       quantity: 1,
//       nonStandard: false,
//     },
//   ],
//   payment: {
//     paymentMethod: 'BANK_TRANSFER', // завжди так для DHL24
//     payerType: 'SHIPPER', // SHIPPER або USER (третя сторона)
//   },
//   service: {
//     product: 'AH', // стандартний кур’єр PL->PL
//     insurance: false,
//     collectOnDelivery: false,
//   },
//   shipmentDate: '2025-09-25', // YYYY-MM-DD
//   content: 'Towar',
// };
// const shipmentDE_MUC = {
//   shipper: {
//     name: 'IVAN KYSIL IVANCOM',
//     postalCode: '37732',
//     city: 'Medyka',
//     street: 'Medyka',
//     houseNumber: '405A',
//     contactPhone: '570371048',
//     contactEmail: 'ivancom.krakow@gmail.com',
//   },
//   receiver: {
//     addressType: 'С',
//     country: 'DE',
//     name: 'Anna Beispiel',
//     postalCode: '14793', // Мюнхен — реальный индекс (центр)
//     city: 'Buckautal',
//     street: 'Munitionsdepot Buckau',
//     houseNumber: '12',
//     contactPerson: 'Anna Beispiel',
//     contactPhone: '+49 89 7654321',
//     contactEmail: 'anna.beispiel@example.de',
//   },
//   pieceList: [
//     {
//       type: 'PACKAGE',
//       width: 40,
//       height: 20,
//       length: 30,
//       weight: 3.2,
//       quantity: 1,
//       nonStandard: false,
//     },
//   ],
//   payment: {
//     paymentMethod: 'BANK_TRANSFER',
//     payerType: 'SHIPPER',
//   },
//   service: {
//     product: 'INT',
//     collectOnDelivery: false,
//     insurance: false,
//   },
//   shipmentDate: new Date().toISOString().slice(0, 10),
//   content: 'Test items',
//   reference: 'TEST-ORDER-002',
// };

// const result = await createShipments(shipmentDE_MUC);

// console.log('createShipments ->', result);
// /*
// Очікуємо масив на кшталт:
// [
//   { shipmentId: '1234567890', orderStatus: 'NONE', error: null }
// ]
// */
/* eslint-env node */

// 1) базова перевірка доступу
// console.log('Auth preview:', auth());
// console.log('API version:', await getVersion());

// // 2) стягуємо довідник міжнародних параметрів (для продукту)
// const intl = await getInternationalParams();
// const de = intl.find((x) => x.countryCode === 'DE');
// console.log('DE international params (cut):', {
//   countryCode: de?.countryCode,
//   product: de?.product,
//   pieceHeader: de?.pieceHeader,
//   pickupDays: de?.pickupDays,
// });

// // 3) перевіряємо індекс і дату (враховує вихідні/свята на стороні DHL)
// const today = new Date().toISOString().slice(0, 10);
// const zipCheck = await getPostalCodeServices({
//   postCode: '80331', // Мюнхен-центр, 5 цифр
//   pickupDate: today,
// });
// console.log('PostalCode services @', today, '=>', zipCheck);

// // 4) створюємо міжнародну відправку DE з продуктом із довідника
// const productDE = await resolveProductForCountry('DE'); // очікувано "EK" (DHL PARCEL CONNECT) або те, що поверне API

// const result = await createShipmentsSmart({
//   shipper: {
//     name: 'IVAN KYSIL IVANCOM',
//     postalCode: '37732',
//     city: 'Medyka',
//     street: 'Medyka',
//     houseNumber: '405A',
//     contactPerson: 'IVAN KYSIL',
//     contactPhone: '570371048',
//     contactEmail: 'ivancom.krakow@gmail.com',
//   },
//   receiver: {
//     addressType: 'C',
//     country: 'DE',
//     name: 'Anna Beispiel',
//     postalCode: '80331',
//     city: 'München',
//     street: 'Neuhauser Str.',
//     houseNumber: '1',
//     contactPerson: 'Anna Beispiel',
//     contactPhone: '49897654321',
//     contactEmail: 'anna.beispiel@example.de',
//   },
//   pieces: [
//     {
//       type: 'PACKAGE',
//       width: 40,
//       height: 20,
//       length: 30,
//       weight: 3,
//       quantity: 1,
//       nonStandard: false,
//     },
//   ],
//   service: {
//     product: productDE, // <- головне: беремо з довідника
//     collectOnDelivery: false,
//     insurance: false,
//   },
//   comment: 'Order #1234 / fragile',
//   shipmentDate: today,
//   content: 'rzeczy',
//   reference: 'TEST-ORDER-002',
//   // skipRestrictionCheck: true, // якщо треба примусово оминути обмеження
// });

// console.log('createShipments ->', result);
// const res1 = await createDhlShipmentUnified({
//   receiver: {
//     isCompany: false,
//     country: 'DE',
//     name: 'Anna Beispiel',
//     postalCode: '80331',
//     city: 'München',
//     street: 'Neuhauser Str.',
//     houseNumber: '1',
//     contactPerson: 'Anna Beispiel',
//     contactPhone: '49897654321',
//     contactEmail: 'anna.beispiel@example.de',
//   },
//   weightKg: 1,
//   reference: 'ORD-1001',
//   comment: 'Fragile / test',
// });
// console.log('Unified #1 ->', res1);
// const res2 = await createDhlShipmentUnified({
//   receiver: {
//     isCompany: true,
//     country: 'DE',
//     name: 'ACME GmbH',
//     postalCode: '10117',
//     city: 'Berlin',
//     street: 'Unter den Linden',
//     houseNumber: '5',
//     contactPerson: 'Hans',
//     contactPhone: '4930123456',
//     contactEmail: 'office@acme.de',
//   },
//   weightKg: 3,
//   reference: 'ORD-1002',
//   comment: 'Invoice inside',
//   valuationUah: 2100, // => ~200 PLN страхова
// });
// console.log('Unified #2 ->', res2);
// const out = await createDhlShipmentUnified({
//   receiver: {
//     country: 'DE',
//     name: '...',
//     postalCode: '...',
//     city: '...',
//     street: '...',
//     isCompany: false,
//   },
//   weightKg: 1, // або 3
//   reference: 'ORDER-1234',
//   comment: 'номер + короткий опис',
//   valuationUah: 3150, // або valuationPln: 300 — якщо треба страхування
// });
// console.log(out);
