import { Router } from 'express';

import { renderEmailHtml } from '../email/renderTemplate.js';
import { transporter } from '../email/transporter.js';

const router = Router();

// простий ключ у заголовку
router.use((req, res, next) => {
  const key = req.header('x-api-key');
  if (!key || key !== process.env.EMAIL_API_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
});

/**
 * POST /api/send-email
 * body:
 * {
 *   "to": "user@example.com",
 *   "subject": "Тема",
 *   // 1) HTML-режим:
 *   "contentHtml": "<p>Привіт</p><p>Ваше замовлення...</p>"
 *   // або 2) Текстовий режим:
 *   "contentText": "Абзац 1\n\nАбзац 2 рядок 1\nРядок 2",
 *   "mode": "paragraphs" | "br"   // опційно (за замовчуванням "paragraphs")
 * }
 */
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, contentHtml, contentText, mode } = req.body || {};
    if (!to || !subject || (!contentHtml && !contentText)) {
      return res.status(400).json({
        ok: false,
        error: 'Потрібні поля: to, subject і (contentHtml або contentText)',
      });
    }

    const html = renderEmailHtml({ contentHtml, contentText, mode });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });

    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('send-email error:', e);
    res.status(500).json({ ok: false, error: e.message || 'Server error' });
  }
});

export default router;
