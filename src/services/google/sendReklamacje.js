import { appendData, getHeaders } from './google.js';

const spreadsheetId = '1fuMG1ujedsQniMAEq5vLSYiAHdEy4wjOgZra1HoSWOM';
const range = 'Sheet1!A1:AZ1';

export const writeParcelClaim = async (data) => {
  try {
    const headers = await getHeaders(spreadsheetId, range);

    const values = headers.map((header) => {
      switch (header) {
        case 'id':
          return data.id || '';
        case 'full_name':
          return data.full_name || '';
        case 'email':
          return data.email || '';
        case 'phone':
          return data.phone || '';
        case 'city':
          return data.city || '';
        case 'ttn_number':
          return data.ttn_number || '';
        case 'direction':
          return data.direction || '';
        case 'parcel_content':
          return data.parcel_content || '';
        case 'damage_type':
          return data.damage_type || '';
        case 'compensation_type':
          return data.compensation_type || '';
        case 'problem_description':
          return data.problem_description || '';
        case 'created_at':
          return data.created_at || '';
        default:
          return '';
      }
    });

    await appendData(spreadsheetId, 'Sheet1!A4', values);
  } catch (error) {
    console.error('Помилка при записі рекламації:', error);
  }
};
