import { formWorldUaServices } from '../../services/forms/formWorlduaServices.js';

export const formWorlduaController = async (req, res) => {
  try {
    const data = await formWorldUaServices(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
