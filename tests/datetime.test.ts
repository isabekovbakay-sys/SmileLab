import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addDays,
  clinicNow,
  clinicTimestamp,
  diffDays,
  formatDateNumeric,
  fromMinutes,
  isSlotInPast,
  toClinicIso,
  toMinutes,
  weekdayOf,
} from '../src/utils/datetime';

describe('время клиники UTC+6, независимо от пояса телефона', () => {
  it('clinicNow для заданного UTC-момента', () => {
    // 2026-09-30 18:30 UTC = 2026-10-01 00:30 в Бишкеке.
    const moment = clinicNow(Date.UTC(2026, 8, 30, 18, 30));
    assert.deepEqual(moment, { date: '2026-10-01', minutes: 30, weekday: 'thu' });
  });

  it('clinicNow днём', () => {
    const moment = clinicNow(Date.UTC(2026, 8, 30, 3, 15)); // 09:15 в Бишкеке
    assert.equal(moment.date, '2026-09-30');
    assert.equal(moment.minutes, 9 * 60 + 15);
    assert.equal(moment.weekday, 'wed');
  });

  it('addDays через месяц, год и високосный февраль', () => {
    assert.equal(addDays('2026-09-30', 1), '2026-10-01');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-12-25', 10), '2027-01-04');
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
    assert.equal(diffDays('2026-12-25', '2027-01-04'), 10);
  });

  it('weekdayOf', () => {
    assert.equal(weekdayOf('2026-09-30'), 'wed');
    assert.equal(weekdayOf('2026-10-04'), 'sun');
    assert.equal(weekdayOf('2027-01-01'), 'fri');
  });

  it('24-часовой формат и минуты', () => {
    assert.equal(toMinutes('15:30'), 930);
    assert.equal(fromMinutes(930), '15:30');
    assert.equal(fromMinutes(540), '09:00');
  });

  it('ISO со смещением и ДД.ММ.ГГГГ', () => {
    assert.equal(toClinicIso('2026-09-30', '15:00'), '2026-09-30T15:00:00+06:00');
    assert.equal(new Date(toClinicIso('2026-09-30', '15:00')).getTime(), clinicTimestamp('2026-09-30', '15:00'));
    assert.equal(formatDateNumeric('2026-09-03'), '03.09.2026');
  });

  it('isSlotInPast с запасом minLead', () => {
    const now = Date.UTC(2026, 8, 30, 4, 0); // 10:00 в Бишкеке
    assert.equal(isSlotInPast('2026-09-30', '09:30', now), true);
    assert.equal(isSlotInPast('2026-09-30', '10:30', now), false);
    assert.equal(isSlotInPast('2026-09-30', '10:30', now, 60), true);
    assert.equal(isSlotInPast('2026-09-30', '11:00', now, 60), false);
    assert.equal(isSlotInPast('2026-10-01', '09:00', now, 60), false);
  });
});
