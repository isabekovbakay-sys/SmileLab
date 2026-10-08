/**
 * Проверяет, что в релизный бандл не попали демо-данные и демо-тексты.
 * Собирает JS-бандл Android без байткода (EXPO_PUBLIC_DEMO=0, кэш Metro очищается — иначе
 * Metro может взять значение переменной из прошлой сборки) и ищет в нём строки из src/data/demo.
 * Запуск: npm run bundle:check
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { demoStrings } from '../src/data/demo';

const root = resolve(__dirname, '..');
// --demo: проверить саму проверку — в демо-бандле строки должны найтись.
const demoRun = process.argv.includes('--demo');
const outDir = join(root, 'dist-release-check');

rmSync(outDir, { recursive: true, force: true });
const exported = spawnSync(
  'npx',
  ['expo', 'export', '--platform', 'android', '--no-bytecode', '--clear', '--output-dir', outDir],
  {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, EXPO_PUBLIC_DEMO: demoRun ? '1' : '0' },
  },
);
if (exported.status !== 0) {
  console.error('✗ Не удалось собрать бандл.');
  process.exit(1);
}

function jsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return jsFiles(path);
    return /\.(js|hbc)$/.test(name) ? [path] : [];
  });
}

// Уникальные для демо строки: тексты демо-режима на обоих языках (кнопки совпадают с обычными).
const markers = (['ru', 'ky'] as const).flatMap((lang) => [
  demoStrings[lang].notice,
  demoStrings[lang].successText('WhatsApp'),
]);

// Минификатор записывает кириллицу как \uXXXX — ищем оба вида.
const escapeUnicode = (text: string) =>
  text.replace(/[^\x20-\x7e]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`);

const found: string[] = [];
for (const file of jsFiles(outDir)) {
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  for (const marker of new Set(markers)) {
    if (text.includes(marker) || lower.includes(escapeUnicode(marker).toLowerCase())) {
      found.push(`«${marker}» в ${file.replace(`${root}/`, '')}`);
    }
  }
}
rmSync(outDir, { recursive: true, force: true });

if (demoRun) {
  console.log(`Демо-бандл: найдено ${found.length} совпадений (должно быть больше нуля).`);
  process.exit(found.length > 0 ? 0 : 1);
}

if (found.length > 0) {
  console.error('\n✗ В релизном бандле найдены демо-данные:');
  for (const line of found) console.error(`  • ${line}`);
  process.exit(1);
}
console.log(`✓ Демо-данных в релизном бандле нет (проверено строк: ${new Set(markers).size}).`);
