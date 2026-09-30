import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createFormatters } from '../src/i18n/format';
import { ky } from '../src/i18n/ky';
import { kyTime } from '../src/i18n/kyGrammar';
import { pluralRu } from '../src/i18n/plural';
import { ru } from '../src/i18n/ru';

type Tree = Record<string, unknown>;

function collect(value: unknown, path: string, out: Map<string, unknown>) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Tree)) collect(child, path ? `${path}.${key}` : key, out);
  } else {
    out.set(path, value);
  }
  return out;
}

const ruLeaves = collect(ru, '', new Map());
const kyLeaves = collect(ky, '', new Map());

describe('словари RU / KY', () => {
  it('одинаковые ключи', () => {
    assert.deepEqual([...kyLeaves.keys()].sort(), [...ruLeaves.keys()].sort());
  });

  it('нет пустых строк, типы значений совпадают', () => {
    for (const [key, value] of ruLeaves) {
      const other = kyLeaves.get(key);
      assert.equal(typeof other, typeof value, key);
      if (typeof value === 'string') {
        assert.ok(value.trim().length > 0, `ru.${key}`);
        assert.ok((other as string).trim().length > 0, `ky.${key}`);
      }
      if (Array.isArray(value)) {
        assert.equal((other as unknown[]).length, value.length, key);
        for (const item of [...value, ...(other as unknown[])]) assert.ok(String(item).trim(), key);
      }
    }
  });

  it('политика: одинаковое число разделов, контакты подставляются', () => {
    const c = { clinic: 'SmileLab', phone: '+996 507 597 099', email: 'isabekovbakay@gmail.com' };
    const r = ru.privacy.sections(c);
    const k = ky.privacy.sections(c);
    assert.equal(r.length, k.length);
    for (const s of [...r, ...k]) assert.ok(s.title && s.body);
    assert.ok(r.some((s) => s.body.includes(c.email)));
    assert.ok(k.some((s) => s.body.includes(c.phone)));
  });

  it('нет английских слов в интерфейсе (кроме названий мессенджеров и e-mail)', () => {
    const allowed = /WhatsApp|Telegram|SmileLab|QR|E-mail|e-mail|3D|name@example\.com/g;
    for (const [key, value] of [...ruLeaves, ...kyLeaves]) {
      if (typeof value !== 'string') continue;
      const cleaned = value.replace(allowed, '');
      assert.ok(!/[A-Za-z]{3,}/.test(cleaned), `${key}: «${value}»`);
    }
  });
});

describe('склонения и кыргызская грамматика', () => {
  it('pluralRu', () => {
    assert.equal(pluralRu(1, 'этап', 'этапа', 'этапов'), 'этап');
    assert.equal(pluralRu(3, 'этап', 'этапа', 'этапов'), 'этапа');
    assert.equal(pluralRu(5, 'этап', 'этапа', 'этапов'), 'этапов');
    assert.equal(pluralRu(11, 'этап', 'этапа', 'этапов'), 'этапов');
    assert.equal(pluralRu(21, 'этап', 'этапа', 'этапов'), 'этап');
    assert.equal(ru.service.processCount(4), '4 этапа');
    assert.equal(ky.service.processCount(4), '4 этап');
  });

  it('падежные аффиксы времени по гармонии гласных', () => {
    assert.equal(kyTime('19:00', 'dat'), '19:00га');
    assert.equal(kyTime('18:00', 'dat'), '18:00ге');
    assert.equal(kyTime('14:00', 'dat'), '14:00кө');
    assert.equal(kyTime('13:00', 'dat'), '13:00кө');
    assert.equal(kyTime('15:00', 'dat'), '15:00ке');
    assert.equal(kyTime('16:00', 'dat'), '16:00га');
    assert.equal(kyTime('10:00', 'loc'), '10:00до');
    assert.equal(kyTime('09:00', 'loc'), '09:00да');
    assert.equal(kyTime('09:30', 'loc'), '09:30да');
    assert.equal(kyTime('20:00', 'abl'), '20:00дан');
    assert.equal(ky.home.status.openUntil('19:00'), 'Бүгүн 19:00га чейин ачыкпыз');
    assert.equal(ru.home.status.opensTomorrow('09:00'), 'Сейчас закрыто · откроемся завтра в\u00A009:00');
  });

  it('даты: «30 сентября» / «30-сентябрь», относительные', () => {
    const r = createFormatters(ru);
    const k = createFormatters(ky);
    assert.equal(r.dateLong('2026-09-30'), '30 сентября');
    assert.equal(k.dateLong('2026-09-30'), '30-сентябрь');
    assert.equal(k.dateWithWeekday('2026-09-30'), '30-сентябрь, шаршемби');
    assert.equal(r.relativeDate('2026-10-01', '2026-09-30'), 'Завтра, 1 октября');
    assert.equal(k.relativeDate('2026-10-01', '2026-09-30'), 'Эртең, 1-октябрь');
    assert.equal(k.relativeDate('2026-09-30', '2026-09-30'), 'Бүгүн, 30-сентябрь');
    assert.equal(r.relativeDate('2026-10-02', '2026-09-30'), '2 октября, пятница');
    assert.equal(r.dateTime('2026-09-30', '15:00'), '30 сентября, 15:00');
    assert.equal(ru.booking.rescheduleTo(r.dateTime('2026-09-30', '15:00')), 'Перенести на 30 сентября, 15:00');
  });

  it('названия языков в начале строки — с заглавной', () => {
    assert.equal(ky.languages.speaks(['ky', 'ru']), 'Кыргыз жана орус тилдеринде');
    assert.equal(ru.languages.speaks(['ky', 'ru']), 'Кыргызский и русский');
    assert.equal(ru.languages.speaks(['ru']), 'Русский');
  });
});
