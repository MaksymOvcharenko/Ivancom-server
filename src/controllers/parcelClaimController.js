import { writeParcelClaim } from '../services/google/sendReklamacje.js';
import parcelClaimService from '../services/parcelClaimService.js';
import sendConfirmationEmail from '../services/sendConfirmationEmail.js';
console.log('ParcelClaimController loaded');
export const createClaimController = async (req, res) => {
  try {
    const newClaim = await parcelClaimService.createClaim(req.body);
    await sendConfirmationEmail(newClaim.email);
    await writeParcelClaim(newClaim);
    res.status(201).json(newClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка при створенні рекламації' });
  }
};
