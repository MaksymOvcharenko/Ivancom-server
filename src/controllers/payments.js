import Payment from "../db/models/payments.js";


export const createPayment = async (req, res) => {
  try {
    const { shipment_id, amount, redirect_code, confirmation } = req.body;

    const newPayment = await Payment.create({
      shipment_id,
      amount,
      redirect_code,
      confirmation,
    });

    res.status(201).json({
      success: true,
      data: newPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка створення платежу',
      error,
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання списку платежів',
      error,
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платіж не знайдено',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка отримання платежу',
      error,
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipment_id, amount, redirect_code, confirmation } = req.body;

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платіж не знайдено',
      });
    }

    await payment.update({ shipment_id, amount, redirect_code, confirmation });

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення платежу',
      error,
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платіж не знайдено',
      });
    }

    await payment.destroy();

    res.status(200).json({
      success: true,
      message: 'Платіж видалено',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Помилка видалення платежу',
      error,
    });
  }
};
