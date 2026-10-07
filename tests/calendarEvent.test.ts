import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ky } from '../src/i18n/ky';
import { ru } from '../src/i18n/ru';
import { buildCalendarEvent } from '../src/services/calendarEvent';

describe('событие календаря', () => {
  it('время клиники UTC+6 → epoch ms, конец = начало + длительность', () => {
    const event = buildCalendarEvent({
      title: ru.appointment.calendarTitle('SmileLab', 'Имплантация'),
      date: '2026-09-30',
      time: '15:00',
      durationMin: 90,
      location: 'SmileLab, Бишкек',
      description: 'Ждёт подтверждения',
      utcOffsetMinutes: 360,
    });
    // 15:00 в Бишкеке = 09:00 UTC.
    assert.equal(event.beginTime, Date.UTC(2026, 8, 30, 9, 0));
    assert.equal(event.endTime - event.beginTime, 90 * 60_000);
    assert.equal(event.title, 'SmileLab: Имплантация');
    assert.equal(event.eventLocation, 'SmileLab, Бишкек');
  });

  it('заголовок на кыргызском и без названия услуги', () => {
    assert.equal(ky.appointment.calendarTitle('SmileLab', 'Имплантация'), 'SmileLab: Имплантация');
    assert.equal(ru.appointment.calendarTitle('SmileLab', ''), 'SmileLab');
  });

  it('слишком короткая длительность не даёт событие нулевой длины', () => {
    const event = buildCalendarEvent({
      title: 'SmileLab',
      date: '2026-09-30',
      time: '09:00',
      durationMin: 0,
      location: '',
      description: '',
      utcOffsetMinutes: 360,
    });
    assert.ok(event.endTime > event.beginTime);
  });
});
