import { Router } from 'express';
import {
  getAuthUrl,
  getRefreshToken,
} from '../services/google/googleReviewsService.js';

const router = Router();

// 1. Отримати URL авторизації
router.get('/auth/google', (req, res) => {
  const url = getAuthUrl();
  res.json({ url });
});

// 2. Обміняти код на refresh_token
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Не передано код авторизації' });
  }

  try {
    const refreshToken = await getRefreshToken(code);
    res.json({ refreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
