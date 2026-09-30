/**
 * Генерирует docs/privacy-policy.html (KY + RU) из тех же строк i18n и контактов конфига,
 * что и экран «Политика конфиденциальности» в приложении. Запуск: npm run privacy:html
 * Файл можно опубликовать через GitHub Pages и указать ссылку в Google Play Console.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { clinicConfig } from '../src/config/clinic';
import { ky } from '../src/i18n/ky';
import { ru, type Strings } from '../src/i18n/ru';
import { colors } from '../src/theme/colors';
import { formatInternationalPhone } from '../src/utils/phone';

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const contacts = {
  clinic: clinicConfig.name,
  phone: formatInternationalPhone(clinicConfig.contacts.phone),
  email: clinicConfig.contacts.email,
};

function section(lang: 'ky' | 'ru', t: Strings): string {
  const items = t.privacy
    .sections(contacts)
    .map((s) => `      <h2>${escape(s.title)}</h2>\n      <p>${escape(s.body)}</p>`)
    .join('\n');
  return `    <article id="${lang}" lang="${lang}">
      <h1>${escape(t.privacy.title)}</h1>
      <p class="updated">${escape(t.privacy.updated)}</p>
${items}
    </article>`;
}

const html = `<!doctype html>
<html lang="ky">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(clinicConfig.name)} — ${escape(ky.privacy.title)} / ${escape(ru.privacy.title)}</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; background: ${colors.background}; color: ${colors.textPrimary};
        font: 16px/1.6 -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif; }
      header { background: ${colors.hero}; color: ${colors.textOnHero}; padding: 28px 20px; }
      header strong { font-size: 22px; }
      header span { color: ${colors.accent}; }
      nav { margin-top: 12px; display: flex; gap: 8px; }
      nav a { color: ${colors.textOnHero}; border: 1px solid ${colors.heroLine}; border-radius: 999px;
        padding: 6px 14px; text-decoration: none; }
      main { max-width: 720px; margin: 0 auto; padding: 12px 20px 48px; }
      article + article { border-top: 1px solid ${colors.border}; margin-top: 32px; }
      h1 { font-size: 26px; line-height: 1.25; margin: 28px 0 4px; }
      h2 { font-size: 18px; margin: 24px 0 4px; }
      p { margin: 0 0 8px; color: ${colors.textSecondary}; }
      .updated { color: ${colors.textMuted}; font-size: 14px; }
    </style>
  </head>
  <body>
    <header>
      <strong>Smile<span>Lab</span></strong>
      <nav><a href="#ky">Кыргызча</a><a href="#ru">Русский</a></nav>
    </header>
    <main>
${section('ky', ky)}
${section('ru', ru)}
    </main>
  </body>
</html>
`;

const out = resolve(__dirname, '../docs/privacy-policy.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`✓ ${out}`);
