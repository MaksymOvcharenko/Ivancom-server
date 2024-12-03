

import User from "../db/models/users.js";
export const createUser = async (req, res) => {
  try {
    const { last_name, first_name, middle_name, phone, email, ref_code_np } = req.body;

    // Створюємо нового користувача
    const newUser = await User.create({
      last_name,
      first_name,
      middle_name,
      phone,
      email,
      ref_code_np,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error creating user',
      error: error.message,
    });
  }
};


