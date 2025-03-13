import { formAnimalsServices } from '../../services/forms/formAnimalsServices.js';

export const formAnimalsController = async (req, res) => {
  try {
    const { body, files } = req;
    // console.log('Отримані файли:', req.files);
    const data = await formAnimalsServices(body, files);

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Помилка у formAnimalsController:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
