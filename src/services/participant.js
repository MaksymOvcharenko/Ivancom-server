import Participant from '../db/models/Participant.js';

class EmailService {
  static async checkEmail(email) {
    const existing = await Participant.findOne({ where: { email } });
    return !!existing; // Повертає true, якщо email знайдено
  }

  static async saveEmail(email) {
    await Participant.create({ email });
  }
}

export default EmailService;
