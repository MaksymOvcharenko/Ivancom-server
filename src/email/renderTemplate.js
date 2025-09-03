import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(s = '') {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToParagraphsHtml(txt = '') {
  return (
    txt
      .trim()
      .split(/\r?\n\r?\n/)
      .map(
        (p) =>
          `<p style="margin:0 0 12px 0">${escapeHtml(p).replace(
            /\r?\n/g,
            '<br>',
          )}</p>`,
      )
      .join('') ||
    `<p style="margin:0">${escapeHtml(txt).replace(/\r?\n/g, '<br>')}</p>`
  );
}

function textToBrHtml(txt = '') {
  return `<p style="margin:0">${escapeHtml(txt).replace(/\r?\n/g, '<br>')}</p>`;
}

export function renderEmailHtml({
  contentHtml,
  contentText,
  mode = 'paragraphs',
  templateFile = 'shipment-email.html',
}) {
  // Шаблон шукаємо в тій самій папці, що й цей файл
  const templatePath = path.join(__dirname, templateFile);
  const raw = fs.readFileSync(templatePath, 'utf8');

  const messageBlock =
    typeof contentHtml === 'string'
      ? contentHtml
      : mode === 'paragraphs'
      ? textToParagraphsHtml(contentText)
      : textToBrHtml(contentText);

  if (!raw.includes('[MESSAGE_CONTENT]')) {
    throw new Error('У шаблоні відсутній маркер [MESSAGE_CONTENT]');
  }

  return raw.replace('[MESSAGE_CONTENT]', messageBlock);
}
