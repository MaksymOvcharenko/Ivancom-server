// routes/auth.routes.js
import { Router } from 'express';
import { getMe, loginUser, registerUser } from '../../services/authService.js';
import { adminOnly, authRequired } from '../../middleware/authMiddleware.js';

const router = Router();

/** POST /api/auth/login  -> { token, role, business_client_id, user } */
router.post('/login', async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);
    return res.json({
      token,
      role: user.role,
      business_client_id: user.business_client_id,
      user,
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/** POST /api/auth/register (admin-only) */
router.post('/register', authRequired, adminOnly, async (req, res) => {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ user });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/** GET /api/auth/me -> поточний юзер + бізнес (2 окремі запити) */
router.get('/me', authRequired, async (req, res) => {
  try {
    const data = await getMe(req.user.sub);
    return res.json({ user: data });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

/** POST /api/auth/logout (для JWT-access – просто відповідь ОК) */
router.post('/logout', authRequired, (_req, res) => {
  return res.json({ ok: true });
});

export default router;
