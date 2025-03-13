import { formTransferServices } from '../../services/forms/formTransferServices.js';

export const formTransferController = async (req, res) => {
  try {
    const data = await formTransferServices(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
