import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clinicConfig, getBranch } from '../src/config/clinic';
import { mockDoctors } from '../src/data/mock/doctors';
import { mockServices } from '../src/data/mock/services';
import {
  computeAvailability,
  computeDay,
  freeDoctorsAt,
  roundUpToStep,
  type AvailabilityContext,
} from '../src/services/mock/availability';
import type { Appointment } from '../src/types/domain';
import { toMinutes } from '../src/utils/datetime';

// Понедельник 2026-10-05, «сейчас» — воскресенье 2026-10-04 12:00 по Бишкеку.
const NOW = Date.UTC(2026, 9, 4, 6, 0);
const MONDAY = '2026-10-05';

function ctx(overrides: Partial<AvailabilityContext> = {}): AvailabilityContext {
  return {
    services: mockServices,
    doctors: mockDoctors,
    branch: getBranch(),
    appointments: [],
    now: NOW,
    minLeadMinutes: 60,
    utcOffsetMinutes: 360,
    isDemo: false,
    ...overrides,
  };
}

function appointment(partial: Partial<Appointment>): Appointment {
  return {
    id: 'a1',
    serviceId: 'caries',
    doctorId: 'aigerim',
    branchId: 'main',
    date: MONDAY,
    time: '10:00',
    patient: { name: 'Тест', phone: '+996555123456' },
    comment: '',
    contactChannel: 'whatsapp',
    status: 'requested',
    startsAt: `${MONDAY}T10:00:00+06:00`,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('расчёт свободного времени', () => {
  it('длительность округляется до ячеек по 30 минут', () => {
    assert.equal(roundUpToStep(30), 30);
    assert.equal(roundUpToStep(45), 60);
    assert.equal(roundUpToStep(90), 90);
    assert.equal(roundUpToStep(0), 30);
  });

  it('без демо — все рабочие слоты врача: пересечение часов, минус перерыв', () => {
    const day = computeDay(MONDAY, { serviceId: 'caries', doctorId: 'aigerim' }, ctx());
    const times = day.slots.map((s) => s.time);
    // Айгерим 09–18, клиника 09–19, перерыв 13–14, услуга 60 мин.
    assert.deepEqual(times, [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
    ]);
    for (const time of times) assert.match(time, /^([01]\d|2[0-3]):[0-5]\d$/);
  });

  it('перерыв не пересекается ни с одним слотом', () => {
    const day = computeDay(MONDAY, { serviceId: 'implant', doctorId: null }, ctx());
    for (const slot of day.slots) {
      const start = toMinutes(slot.time);
      const end = start + 90;
      assert.ok(end <= 13 * 60 || start >= 14 * 60, `${slot.time} задевает перерыв`);
    }
  });

  it('выходной — клиника закрыта, слотов нет', () => {
    const sunday = computeDay('2026-10-04', { serviceId: 'consultation', doctorId: null }, ctx());
    assert.equal(sunday.clinicOpen, false);
    assert.equal(sunday.slots.length, 0);
  });

  it('сегодня — не раньше «сейчас + minLead»', () => {
    // Вторник 12:00 → первый слот не раньше 13:00; у Айгерим 13–14 перерыв → 14:00.
    const now = Date.UTC(2026, 9, 6, 6, 0);
    const day = computeDay('2026-10-06', { serviceId: 'caries', doctorId: 'aigerim' }, ctx({ now }));
    assert.equal(day.slots[0]?.time, '14:00');
  });

  it('детерминированность: одинаковый вход — одинаковый результат', () => {
    const query = { serviceId: 'consultation', doctorId: null, fromDate: MONDAY, days: 14 };
    const a = computeAvailability(query, ctx({ isDemo: true }));
    const b = computeAvailability(query, ctx({ isDemo: true }));
    assert.deepEqual(a, b);
  });

  it('демо-занятость есть только при isDemo', () => {
    const query = { serviceId: 'consultation', doctorId: 'aigerim', fromDate: MONDAY, days: 5 };
    const demo = computeAvailability(query, ctx({ isDemo: true }));
    const real = computeAvailability(query, ctx({ isDemo: false }));
    const count = (days: typeof demo) => days.reduce((n, d) => n + d.slots.length, 0);
    assert.ok(count(demo) < count(real));
    assert.ok(count(demo) > 0);
  });

  it('созданная запись убирает слот, отменённая — возвращает', () => {
    const query = { serviceId: 'caries', doctorId: 'aigerim' };
    const busy = ctx({ appointments: [appointment({})] });
    const times = computeDay(MONDAY, query, busy).slots.map((s) => s.time);
    // Запись 10:00–11:00 блокирует 09:30 (60 мин), 10:00 и 10:30.
    assert.ok(!times.includes('09:30'));
    assert.ok(!times.includes('10:00'));
    assert.ok(!times.includes('10:30'));
    assert.ok(times.includes('09:00'));
    assert.ok(times.includes('11:00'));

    const cancelled = ctx({ appointments: [appointment({ status: 'cancelled' })] });
    assert.ok(computeDay(MONDAY, query, cancelled).slots.some((s) => s.time === '10:00'));
  });

  it('при переносе собственная запись не блокирует время', () => {
    const c = ctx({ appointments: [appointment({})] });
    const free = freeDoctorsAt(MONDAY, '10:00', { serviceId: 'caries', doctorId: 'aigerim', excludeAppointmentId: 'a1' }, c);
    assert.deepEqual(free, ['aigerim']);
  });

  it('«любой врач» объединяет слоты всех врачей услуги', () => {
    const any = computeDay(MONDAY, { serviceId: 'consultation', doctorId: null }, ctx());
    const doctorsWithSlots = new Set(any.slots.flatMap((s) => s.doctorIds));
    // В понедельник консультируют Айгерим, Елена и Нурлан (Бакыт не работает).
    assert.deepEqual([...doctorsWithSlots].sort(), ['aigerim', 'elena', 'nurlan']);
    const eveningSlot = any.slots.find((s) => s.time === '18:00');
    assert.ok(eveningSlot, 'вечером есть слоты у Елены и Нурлана');
    assert.ok(!eveningSlot.doctorIds.includes('aigerim'));
  });

  it('горизонт записи соответствует конфигу', () => {
    const days = computeAvailability(
      { serviceId: 'consultation', doctorId: null, fromDate: MONDAY, days: clinicConfig.booking.horizonDays },
      ctx(),
    );
    assert.equal(days.length, clinicConfig.booking.horizonDays);
  });
});
