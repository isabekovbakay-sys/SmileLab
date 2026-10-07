/**
 * Таблица для вычитки кыргызского перевода носителем языка: docs/ky-review.md.
 * Строки интерфейса (src/i18n), демо-тексты и тексты клиники; функции показаны с примерными значениями.
 * Запуск: npx tsx scripts/ky-review.ts
 *
 * Колонка «Замечание» заполняется автоматически (подозрительные места) и вручную (NOTES ниже).
 * Строки с замечанием помечены ⚠ — их стоит проверить в первую очередь.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { clinicContent } from '../src/data/clinic/content';
import { demoCatalog, demoStrings } from '../src/data/demo';
import { ky } from '../src/i18n/ky';
import { ru } from '../src/i18n/ru';
import type { Language, LocalizedText } from '../src/types/domain';

/** Ручные замечания переводчика (что вызывает сомнение). */
const NOTES: Record<string, string> = {
  'booking.noTimeLeft': 'Возможно, естественнее «Бул күнгө бош убакыт калган жок».',
  'booking.doctorOptional': '«мүмкүн болсо» — проверить, понятно ли «врач по возможности».',
  'messages.doctorPreferred': '«мүмкүн болсо» — проверить, понятно ли «врач по возможности».',
  'appointment.calendarError': 'Проверить естественность фразы.',
  'privacy.sections': 'Юридический текст: желательно вычитать целиком с юристом.',
  'home.status.openUntil': 'Падежный аффикс времени подбирается автоматически (19:00га, 18:00ге) — проверить.',
  'home.status.opensOn': 'Проверить порядок слов: «… күнү саат 09:00до ачылабыз».',
  'languages.speaks': 'Проверить склонение списка языков.',
};

type Row = { key: string; ru: string; ky: string; note: string };

/** Примерные значения аргументов по имени параметра. */
function sampleArgs(fn: (...args: never[]) => unknown, lang: Language): unknown[] {
  // Стрелочные функции после компиляции: «time=>…» или «(date,time)=>…».
  const match = /^\s*(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>/.exec(fn.toString());
  const params = match?.[1] ?? match?.[2] ?? '';
  const names = params
    .split(',')
    .map((p) => p.replace(/[:=].*$/, '').trim())
    .filter(Boolean);
  const samples: Record<string, unknown> = {
    time: '15:00',
    start: '09:00',
    end: '19:00',
    date: lang === 'ru' ? '30 сентября' : '30-сентябрь',
    label: lang === 'ru' ? 'завтра, 1 октября' : 'эртең, 1-октябрь',
    relative: lang === 'ru' ? 'Сегодня' : 'Бүгүн',
    weekday: lang === 'ru' ? 'среда' : 'шаршемби',
    onWeekday: lang === 'ru' ? 'в среду' : 'шаршемби күнү',
    month: lang === 'ru' ? 'сентября' : 'сентябрь',
    day: 30,
    channel: 'WhatsApp',
    clinic: 'SmileLab',
    name: 'Айдана',
    service: lang === 'ru' ? 'Консультация' : 'Консультация',
    phone: '+996 507 597 099',
    langs: ['ky', 'ru'],
    languages: ['ky', 'ru'],
    c: { clinic: 'SmileLab', phone: '+996 507 597 099', email: 'email@example.com', operator: null },
  };
  return names.map((name) =>
    name in samples ? samples[name] : /^(n|count|minutes|amount|price|value|total|current)$/.test(name) ? 3 : name,
  );
}

function render(value: unknown, lang: Language): string {
  if (typeof value === 'function') {
    try {
      return render((value as (...a: unknown[]) => unknown)(...sampleArgs(value as never, lang)), lang);
    } catch {
      return '(функция)';
    }
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => (v && typeof v === 'object' && 'title' in v ? `${v.title}: ${v.body}` : render(v, lang)))
      .join(' / ');
  }
  return String(value);
}

/** Служебные русские слова, которых нет в кыргызском: признак непереведённого куска. */
const RUSSIAN_WORDS = new Set(
  'и в во на не для что это по от или вы мы вас нас ваш ваша ваши при как только если после чтобы уже ещё также'.split(
    ' ',
  ),
);
/** Слова, одинаковые в обоих языках (заимствования), — не замечание. */
const SAME_OK = /^(Профиль|Телефон|Комментарий|Демо|Кыргызча|Русский|Тилди тандаңыз · Выберите язык|Версия .*)$/;

function autoNote(key: string, ruText: string, kyText: string): string {
  const notes: string[] = [];
  if (kyText === ruText && /[а-яё]{4,}/i.test(kyText) && !SAME_OK.test(kyText) && !key.endsWith('.name')) {
    notes.push(
      /^[А-ЯЁа-яё-]+$/.test(kyText)
        ? 'одинаково на обоих языках (термин) — проверить, так ли говорят пациенты'
        : 'совпадает с русским — переведено?',
    );
  }
  const russian = kyText
    .toLowerCase()
    .split(/[^a-zа-яёңөү]+/)
    .filter((w) => RUSSIAN_WORDS.has(w));
  if (kyText !== ruText && russian.length > 0) {
    notes.push(`русские слова в тексте: ${[...new Set(russian)].join(', ')}`);
  }
  if (/[щъ]/i.test(kyText)) notes.push('буквы щ/ъ — проверить, не русское ли слово');
  const ratio = kyText.length / Math.max(1, ruText.length);
  if (ruText.length > 15 && (ratio > 1.8 || ratio < 0.5)) {
    notes.push(`длина отличается в ${ratio.toFixed(1)} раза — проверить смысл и вёрстку`);
  }
  const manual = Object.entries(NOTES).find(
    ([prefix]) => key === prefix || key.startsWith(`${prefix}.`) || key.startsWith(`${prefix}[`),
  );
  if (manual) notes.push(manual[1]);
  return notes.join('; ');
}

function walk(ruNode: unknown, kyNode: unknown, path: string, rows: Row[]) {
  if (ruNode && typeof ruNode === 'object' && !Array.isArray(ruNode)) {
    for (const key of Object.keys(ruNode)) {
      walk(
        (ruNode as Record<string, unknown>)[key],
        (kyNode as Record<string, unknown>)?.[key],
        path ? `${path}.${key}` : key,
        rows,
      );
    }
    return;
  }
  if (path.endsWith('languageName') || path === 'locale') return;
  const r = render(ruNode, 'ru');
  const k = render(kyNode, 'ky');
  rows.push({ key: path, ru: r, ky: k, note: autoNote(path, r, k) });
}

function localizedRows(prefix: string, value: unknown, rows: Row[]) {
  if (value && typeof value === 'object' && 'ru' in value && 'ky' in value && Object.keys(value).length === 2) {
    const text = value as LocalizedText | { ru: unknown; ky: unknown };
    const r = Array.isArray(text.ru) ? text.ru.join(' / ') : String(text.ru);
    const k = Array.isArray(text.ky) ? text.ky.join(' / ') : String(text.ky);
    rows.push({ key: prefix, ru: r, ky: k, note: autoNote(prefix, r, k) });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => localizedRows(`${prefix}[${(item as { id?: string })?.id ?? i}]`, item, rows));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) localizedRows(`${prefix}.${key}`, child, rows);
  }
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, '<br>');

function table(title: string, rows: Row[]): string {
  const flagged = rows.filter((r) => r.note).length;
  return [
    `## ${title}`,
    '',
    `Строк: ${rows.length}, с замечаниями: ${flagged}.`,
    '',
    '| Ключ | Русский | Кыргызский | Замечание |',
    '| --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r.note ? '⚠ ' : ''}\`${r.key}\` | ${cell(r.ru)} | ${cell(r.ky)} | ${cell(r.note)} |`),
    '',
  ].join('\n');
}

const ui: Row[] = [];
walk(ru, ky, '', ui);

const demoUi: Row[] = [];
walk(
  Object.fromEntries(Object.entries(demoStrings.ru)),
  Object.fromEntries(Object.entries(demoStrings.ky)),
  'demo',
  demoUi,
);

const content: Row[] = [];
localizedRows('clinicContent', clinicContent, content);

const demoData: Row[] = [];
localizedRows('demo.services', demoCatalog.services, demoData);
localizedRows('demo.doctors', demoCatalog.doctors, demoData);
localizedRows('demo.content', demoCatalog.content, demoData);

const all = [...ui, ...demoUi, ...content, ...demoData];
const md = [
  '# Вычитка кыргызского перевода',
  '',
  'Файл создан скриптом `npm run ky:review`. Носитель языка может отмечать правки прямо здесь (в колонке «Замечание»);',
  'затем их переносят в `src/i18n/ky.ts`, `src/data/clinic/*.ts` (и `src/data/demo/*.ts`) и пересоздают таблицу.',
  '',
  'Как читать: строки с ⚠ проверить в первую очередь. Функции показаны с примерными значениями',
  '(время 15:00, дата 30 сентября, канал WhatsApp). Замечания — подсказки, а не ошибки.',
  '',
  `Всего строк: ${all.length}, с замечаниями: ${all.filter((r) => r.note).length}.`,
  '',
  table('Интерфейс приложения (src/i18n)', ui),
  table('Демо-тексты (только демо-сборка)', demoUi),
  table('Тексты клиники (src/data/clinic/content.ts)', content),
  table('Демо-услуги и демо-врачи — образец для заполнения (src/data/demo)', demoData),
].join('\n');

const out = resolve(__dirname, '../docs/ky-review.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, md);
console.log(`✓ ${out}: ${all.length} строк, с замечаниями: ${all.filter((r) => r.note).length}`);
