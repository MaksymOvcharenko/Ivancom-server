import ParcelClaim from '../db/models/ParcelClaim.js';

const createClaim = async (data) => {
  return await ParcelClaim.create(data);
};

export default { createClaim };
