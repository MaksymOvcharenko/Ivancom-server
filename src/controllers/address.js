 // Імпортуємо модель адреси

import Address from "../db/models/address.js";

// Створити нову адресу
export const createAddress = async (req, res) => {
  try {
    const newAddress = await Address.create(req.body); // Створення запису
    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Помилка створення адреси', error });
  }
};

// Отримати всі адреси
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll(); // Отримання всіх записів
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Помилка отримання адрес', error });
  }
};

// Отримати адресу за ID
export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByPk(id); // Пошук за ID
    if (!address) {
      return res.status(404).json({ success: false, message: 'Адреса не знайдена' });
    }
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Помилка отримання адреси', error });
  }
};

// Видалити адресу
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Address.destroy({ where: { id } }); // Видалення запису
    if (!result) {
      return res.status(404).json({ success: false, message: 'Адреса не знайдена' });
    }
    res.status(200).json({ success: true, message: 'Адресу успішно видалено' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Помилка видалення адреси', error });
  }
};
