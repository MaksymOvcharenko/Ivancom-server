
import { getShipmentByIdForSendGooGle } from "../checkDataForID.js";
import { appendData, getHeaders } from "./google.js";




const spreadsheetId = '1nGQDLwJ4MpD0W_vZG-EdNfMbMghSM_dr3D09MGvU2eM'; // ID вашей таблицы
const range = 'Sheet1!A1:AZ1'; // Диапазон, в котором находятся заголовки


// Данные из вашего объекта
const data = {

        "success": true,
        "data": {
            "shipment": {
                "id": 101,
                "inpost_code": "4749878180",
                "np_tracking_number": "20451058724962"
            },
            "sender": {
                "id": 32,
                "last_name": "Тестовиr",
                "first_name": "Відправник",
                "middle_name": "Семенович",
                "phone": "48574267422",
                "email": "ivan.ivanenko1@example.com",
                "ref_code_np": null,
                "ref_code_np_contactPerson": null,
                "created_at": "2024-12-06T12:38:48.602Z",
                "updated_at": "2024-12-06T12:38:48.602Z"
            },
            "recipient": {
                "id": 37,
                "last_name": "Овчаренко",
                "first_name": "Максим",
                "middle_name": ".",
                "phone": "380961855185",
                "email": "maxmersin@gmail.com",
                "ref_code_np": "b0c8055f-0ebd-11ef-bcd0-48df37b921da",
                "ref_code_np_contactPerson": "e73266e4-b640-11ef-bcd0-48df37b921da",
                "created_at": "2024-12-09T14:18:54.272Z",
                "updated_at": "2024-12-09T14:18:54.272Z"
            },
            "senderAddress": {
                "id": 39,
                "user_id": 32,
                "parcel_id": 106,
                "address_type": "sender",
                "country": "Poland",
                "city": "Krakow",
                "street": "Jana pawla II",
                "building_number": "154",
                "apartment_number": null,
                "floor_number": null,
                "postal_code": null,
                "np_branch": null,
                "np_branch_ref": null,
                "np_street_ref": null,
                "np_city_ref": null,
                "delivery_method": "address",
                "inpost_branch_number": "z",
                "inpost_street_ref": null,
                "np_tracking_number": null,
                "created_at": "2024-12-09T14:18:54.296Z",
                "updated_at": "2024-12-09T14:18:54.296Z"
            },
            "recipientAddress": {
                "id": 45,
                "user_id": 37,
                "parcel_id": 114,
                "address_type": "recipient",
                "country": "Україна",
                "city": "Київ",
                "street": "Драгоманова Михайла",
                "building_number": "1",
                "apartment_number": "14",
                "floor_number": null,
                "postal_code": null,
                "np_branch": null,
                "np_branch_ref": null,
                "np_street_ref": null,
                "np_city_ref": "8d5a980d-391c-11dd-90d9-001a92567626",
                "delivery_method": "address",
                "inpost_branch_number": null,
                "inpost_street_ref": null,
                "np_tracking_number": null,
                "created_at": "2024-12-09T14:53:34.690Z",
                "updated_at": "2024-12-09T14:53:34.690Z"
            },
            "parcel": {
                "id": 114,
                "user_id": 32,
                "crate_name": "B",
                "length": "64",
                "width": "38",
                "height": "19",
                "weight_actual": "11.55",
                "weight_dimensional": "11.552",
                "estimated_value": "1500",
                "price": "160",
                "description": {
                    "contents": "Побутові речі"
                },
                "created_at": "2024-12-09T14:53:34.683Z",
                "updated_at": "2024-12-09T14:53:34.683Z"
            },
            "payment": null
        }

};

// Функция для записи данных в таблицу
export const writeData = async (id) => {
  try {
    const dataShipment =  await getShipmentByIdForSendGooGle(id);


//    console.log(dataShipment.sender.dataValues.last_name);
   const sender = dataShipment.sender.dataValues;
   const recipient = dataShipment.recipient.dataValues;
   const parcel = dataShipment.parcel.dataValues;
   const senderAddress = dataShipment.senderAddress.dataValues;
   const recipientAddress = dataShipment.recipientAddress.dataValues;
    // Получаем заголовки из Google Sheets
    const headers = await getHeaders(spreadsheetId, range);

    // Преобразуем данные в массив значений, соответствующих заголовкам
    const values = headers.map(header => {
      // Преобразуем объект в строку значений в зависимости от заголовка
      switch (header) {
        case 'senderFirstName':
          return sender.first_name;
        case 'senderLastName':
            return sender.last_name;
        case 'senderPhone':
            return sender.phone;
        case 'senderEmail':
            return sender.email;
        case 'receiverFirstName':
            return recipient.first_name;
        case 'receiverLastName':
          return  recipient.last_name;
        case 'receiverPhone':
          return recipient.phone;
        case 'receiverEmail':
          return recipient.email;
        case 'parcelValuation':
          return parcel.estimated_value;
        case 'parcelSize':
          return parcel.crate_name;
        case 'cargoDescription':
          return parcel.description.contents;
        case 'senderAddress':
          return senderAddress.inpost_branch_number;
          case 'senderAddressCity':
            return senderAddress.city;

          case 'senderAddressStreet':
            return senderAddress.street;
          case 'deliveryWarehouse':
          return recipientAddress.np_branch;
          case 'deliveryCity':
          return recipientAddress.city;
          case 'deliveryStreet':
          return recipientAddress.street;
          case 'deliveryHouse':
          return recipientAddress.building_number;
          case 'deliveryApartment':
          return recipientAddress.apartment_number;
          case 'deliveryFloor':
          return recipientAddress.floor_number;
          case 'cargoSumm':
          return parcel.price;
          case 'valuaitonSumm':
          return parcel.price;
          case 'npSumm':
          return parcel.price;
          case 'allSumm':
          return parcel.price;
          case 'inpostCode':
          return dataShipment.shipment.inpost_code;
          case 'ttnNp':
          return dataShipment.shipment.np_tracking_number;

        case 'Created At':
          return data.sender.created_at; // Используйте соответствующие поля для других данных
        default:
          return ''; // Пустое значение, если нет соответствующего поля
      }
    });

    // Записываем данные в таблицу
    await appendData(spreadsheetId, 'Sheet1!A4', values);
  } catch (error) {
    console.error('Ошибка при записи данных:', error);
  }
};

writeData();
