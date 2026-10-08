// Графика для Google Play: 7 скриншотов 1080×1920 на кыргызском и русском + feature graphic 1024×500.
//
// 1) Заполните данные клиники (src/config/clinic.ts, src/data/clinic/) — npm run release:check должен пройти.
// 2) Соберите web-версию БЕЗ демо (кэш Metro очищаем, иначе останется значение из прошлой сборки):
//      EXPO_PUBLIC_DEMO=0 npx expo export --platform web --clear --output-dir web-dist
// 3) Установите браузер (один раз): npx playwright-core install chromium
// 4) Запустите:                     npm run store:graphics
//
// Экран с вводом телефона не снимается: в магазине не должно быть тестовых номеров.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

import { chromium } from 'playwright-core';

const ROOT = resolve(import.meta.dirname, '..');
const WEB = resolve(ROOT, process.argv[2] ?? 'web-dist');
const OUT = resolve(ROOT, 'store/google-play');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.json': 'application/json' };

if (!existsSync(join(WEB, 'index.html'))) {
  console.error(`Нет web-сборки в ${WEB}. Сначала: npx expo export --platform web --output-dir web-dist`);
  process.exit(1);
}

// Статический сервер с SPA-фолбэком на index.html.
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(WEB, path);
  if (!file.startsWith(WEB) || !existsSync(file) || statSync(file).isDirectory()) file = join(WEB, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const wait = (page, ms = 900) => page.waitForTimeout(ms);

async function capture(lang) {
  const dir = join(OUT, `screenshots-${lang}`);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  // Внешние ссылки (WhatsApp и т. п.) не открываем.
  await page.addInitScript(() => { window.open = () => null; });
  const shot = async (n, name) => page.screenshot({ path: join(dir, `${String(n).padStart(2, '0')}-${name}.png`) });

  await page.goto(`${BASE}/`);
  await wait(page, 2000);
  await page.getByTestId(`onboarding-${lang}`).click();
  await wait(page, 1800);
  await shot(1, 'home');

  await page.getByTestId('tab-services').click();
  await wait(page);
  await shot(2, 'services');

  await page.goto(`${BASE}/service/implant`);
  await wait(page, 1600);
  await shot(3, 'service');

  await page.getByTestId('service-book').click();
  await wait(page, 1800);
  await page.locator('[data-testid^="slot-"]').first().click();
  await wait(page, 400);
  await shot(4, 'datetime');

  await page.getByTestId('datetime-continue').last().click();
  await wait(page);
  await page.locator('input').nth(0).fill(lang === 'ky' ? 'Айпери' : 'Анна');
  await page.locator('input').nth(1).fill('700000000');
  await page.getByTestId('booking-submit').click();
  await wait(page, 1800);
  await shot(5, 'success');

  await page.getByTestId('success-appointments').click();
  await wait(page, 1500);
  await shot(6, 'appointments');

  await page.goto(`${BASE}/contact`);
  await wait(page, 1500);
  await shot(7, 'contacts');
  await context.close();
}

async function featureGraphic(lang) {
  // Шрифт встраивается как data: — страница из setContent не может читать file://.
  const font = (w) =>
    `data:font/ttf;base64,${readFileSync(join(ROOT, `node_modules/@expo-google-fonts/inter/${w}/Inter_${w}.ttf`)).toString('base64')}`;
  const text = {
    ru: { kind: 'Стоматологическая клиника · Бишкек', title: 'Запись к стоматологу<br/>за минуту', sub: 'Цены в сомах · WhatsApp и Telegram · на кыргызском и русском' },
    ky: { kind: 'Стоматологиялык клиника · Бишкек', title: 'Стоматологго<br/>бир мүнөттө жазылуу', sub: 'Баалар сом менен · WhatsApp жана Telegram · кыргызча жана орусча' },
  }[lang];
  const tooth = readFileSync(join(ROOT, 'assets/images/splash-icon.png')).toString('base64');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: Inter; font-weight: 500; src: url(${font('500Medium')}); }
    @font-face { font-family: Inter; font-weight: 700; src: url(${font('700Bold')}); }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1024px; height: 500px; overflow: hidden; font-family: Inter;
      background: linear-gradient(160deg, #1B6A72 0%, #0F4C53 55%, #0A363B 100%); color: #fff; position: relative; }
    .arc { position: absolute; left: -120px; right: -120px; border-radius: 50%; border: 2px solid rgba(63,143,150,.35); }
    .wrap { position: absolute; left: 64px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; gap: 18px; }
    .logo { font-weight: 700; font-size: 34px; letter-spacing: -1px; } .logo span { color: #FF7A59; }
    .kind { font-weight: 500; font-size: 18px; letter-spacing: 1.5px; text-transform: uppercase; color: #CFE3E1; }
    h1 { font-weight: 700; font-size: 56px; line-height: 1.05; letter-spacing: -2px; }
    p { font-weight: 500; font-size: 20px; color: #CFE3E1; }
    img { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); width: 340px; height: 340px; }
  </style></head><body>
    <div class="arc" style="top:300px;height:420px"></div><div class="arc" style="top:360px;height:420px;opacity:.6"></div>
    <div class="wrap"><div class="logo">Smile<span>Lab</span></div><div class="kind">${text.kind}</div><h1>${text.title}</h1><p>${text.sub}</p></div>
    <img src="data:image/png;base64,${tooth}" />
  </body></html>`;
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await wait(page, 300);
  await page.screenshot({ path: join(OUT, `feature-graphic-${lang}.png`) });
  await page.close();
}

try {
  await mkdir(OUT, { recursive: true });
  for (const lang of ['ky', 'ru']) {
    await capture(lang);
    await featureGraphic(lang);
    console.log(`✓ ${lang}: 7 скриншотов и feature graphic`);
  }
} finally {
  await browser.close();
  server.close();
}
