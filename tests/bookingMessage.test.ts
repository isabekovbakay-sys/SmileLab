import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ky } from '../src/i18n/ky';
import { ru } from '../src/i18n/ru';
import { buildBookingMessage, type BookingMessageInput } from '../src/services/bookingMessage';

const base: BookingMessageInput = {
  kind: 'new',
  serviceName: 'Консультация и план лечения',
  doctorLabel: 'Любой свободный врач',
  date: '2026-10-05',
  time: '15:00',
  patientName: '  Бакай ',
  patientPhone: '+996555123456',
  comment: 'Болит зуб слева',
};

describe('текст заявки для мессенджера', () => {
  it('RU: новая запись со всеми полями', () => {
    assert.equal(
      buildBookingMessage(ru, base),
      [
        'Здравствуйте! Хочу записаться на приём.',
        '',
        'Услуга: Консультация и план лечения',
        'Врач: Любой свободный врач',
        'Дата: 05.10.2026',
        'Время: 15:00',
        'Имя: Бакай',
        'Телефон: +996 555 123 456',
        'Комментарий: Болит зуб слева',
        '',
        'Отправлено из приложения SmileLab',
      ].join('\n'),
    );
  });

  it('KY: новая запись', () => {
    const text = buildBookingMessage(ky, { ...base, serviceName: 'Консультация жана дарылоо планы', doctorLabel: 'Бош болгон каалаган дарыгер' });
    assert.ok(text.startsWith('Саламатсызбы! Кабыл алууга жазылгым келет.'));
    assert.ok(text.includes('Кызмат: Консультация жана дарылоо планы'));
    assert.ok(text.includes('Күнү: 05.10.2026'));
    assert.ok(text.includes('Убактысы: 15:00'));
    assert.ok(text.includes('Телефон: +996 555 123 456'));
    assert.ok(text.endsWith('SmileLab тиркемесинен жөнөтүлдү'));
  });

  it('пустой комментарий не выводится (RU и KY)', () => {
    for (const dict of [ru, ky]) {
      const text = buildBookingMessage(dict, { ...base, comment: '   ' });
      assert.ok(!text.includes(dict.messages.comment));
    }
  });

  it('перенос: было и стало', () => {
    const text = buildBookingMessage(ru, {
      ...base,
      kind: 'reschedule',
      date: '2026-10-07',
      time: '10:30',
      previous: { date: '2026-10-05', time: '15:00' },
    });
    assert.ok(text.startsWith('Здравствуйте! Прошу перенести мою запись.'));
    assert.ok(text.includes('Было: 05.10.2026, 15:00'));
    assert.ok(text.includes('Стало: 07.10.2026, 10:30'));
    assert.ok(!text.includes('Комментарий'));
  });

  it('отмена: без врача и комментария', () => {
    const text = buildBookingMessage(ky, { ...base, kind: 'cancel' });
    assert.ok(text.startsWith('Саламатсызбы! Жазылуумду жокко чыгаргым келет.'));
    assert.ok(!text.includes('Дарыгер:'));
    assert.ok(!text.includes('Комментарий'));
  });
});
