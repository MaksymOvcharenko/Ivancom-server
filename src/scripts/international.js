// // dhl/international.js

// // Отримати список продуктів для країни (DE, CZ, SK, …)
// export async function listInternationalProducts(countryCode) {
//   const client = await getSoapClient();
//   const [res] = await client.getInternationalParams2Async({ authData: auth });

//   const countries = res?.getInternationalParams2Result?.params?.item || [];
//   const entry = countries.find((c) => c.countryCode === countryCode);

//   const products = (entry?.products?.item || []).map((p) => ({
//     code: p.product, // ОЦЕ ПІДСТАВЛЯТИ В service.product
//     name: p.productName,
//     dhl24Available: !!p.dhl24Available,
//     deliveryMethod: p.deliveryMethod,
//   }));

//   return { country: countryCode, products };
// }

// // Взяти "перший придатний" код продукту для країни
// export async function pickInternationalProduct(countryCode) {
//   const { products } = await listInternationalProducts(countryCode);
//   if (!products.length) {
//     throw new Error(
//       `Brak produktów dla kraju ${countryCode} na Twoim koncie (DHL24).`,
//     );
//   }
//   // бажано віддати той, що офіційно доступний у DHL24
//   return (products.find((p) => p.dhl24Available) || products[0]).code;
// }
