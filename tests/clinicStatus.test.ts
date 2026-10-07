import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBranch } from '../src/config/clinic';
import { demoWorkingHours } from '../src/data/demo/schedule';
import { computeClinicStatus } from '../src/utils/clinicStatus';

const schedule = demoWorkingHours;
// Бишкек = UTC+6: локальное время h → UTC h-6.
const at = (y: number, m: number, d: number, h: number, min = 0) => Date.UTC(y, m - 1, d, h - 6, min);

describe('статус клиники', () => {
  it('открыто до конца дня', () => {
    assert.deepEqual(computeClinicStatus(schedule, at(2026, 9, 30, 10), 360), { kind: 'open', until: '19:00' });
  });
  it('перерыв', () => {
    assert.deepEqual(computeClinicStatus(schedule, at(2026, 9, 30, 13, 20), 360), { kind: 'break', until: '14:00' });
  });
  it('утром до открытия — откроемся сегодня', () => {
    assert.deepEqual(computeClinicStatus(schedule, at(2026, 9, 30, 7), 360), {
      kind: 'closed',
      opens: { inDays: 0, weekday: 'wed', time: '09:00' },
    });
  });
  it('вечером — откроемся завтра', () => {
    assert.deepEqual(computeClinicStatus(schedule, at(2026, 9, 30, 20), 360), {
      kind: 'closed',
      opens: { inDays: 1, weekday: 'thu', time: '09:00' },
    });
  });
  it('суббота вечером — откроемся в понедельник', () => {
    assert.deepEqual(computeClinicStatus(schedule, at(2026, 10, 3, 17), 360), {
      kind: 'closed',
      opens: { inDays: 2, weekday: 'mon', time: '09:00' },
    });
  });
  it('часы не заполнены — статус неизвестен, без выдуманного «откроемся»', () => {
    assert.deepEqual(computeClinicStatus(getBranch().workingHours, at(2026, 9, 30, 10), 360), {
      kind: 'closed',
      opens: null,
    });
  });
});
