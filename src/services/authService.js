// services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import BusinessUser from '../db/models/bussines/BusinessUser.js';
import BusinessClient from '../db/models/bussines/BusinessClient.js';

const rounds = Number(process.env.BCRYPT_ROUNDS || 10);

export async function registerUser({
  email,
  password,
  role = 'user',
  business_client_id = null,
}) {
  if (!email || !password) throw new Error('Email & password required');
  if (role === 'user' && !business_client_id)
    throw new Error('business_client_id required for user');

  const existing = await BusinessUser.findOne({ where: { email } });
  if (existing) throw new Error('User exists');

  if (business_client_id) {
    const bc = await BusinessClient.findByPk(business_client_id);
    if (!bc) throw new Error('business_client not found');
  }

  const password_hash = await bcrypt.hash(password, rounds);
  const user = await BusinessUser.create({
    email,
    password_hash,
    role,
    business_client_id,
    is_active: true,
  });

  return sanitizeUser(user);
}

export async function loginUser({ email, password }) {
  const user = await BusinessUser.findOne({ where: { email } });
  if (!user || !user.is_active) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

// 2 запити: спершу user, потім business_client (якщо є)
export async function getMe(userId) {
  const user = await BusinessUser.findByPk(userId, {
    attributes: [
      'id',
      'email',
      'role',
      'business_client_id',
      'is_active',
      'created_at',
    ],
  });
  if (!user) throw new Error('User not found');

  let business_client = null;
  if (user.business_client_id) {
    business_client = await BusinessClient.findByPk(user.business_client_id, {
      attributes: ['id', 'code', 'name', 'status', 'created_at'],
    });
  }
  return { ...sanitizeUser(user), business_client };
}

function signToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    business_client_id: user.business_client_id || null,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '2h',
  });
}

function sanitizeUser(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    business_client_id: u.business_client_id,
    is_active: u.is_active,
    created_at: u.created_at,
  };
}
