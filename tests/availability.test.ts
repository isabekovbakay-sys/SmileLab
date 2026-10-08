import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clinicConfig, getBranch } from '../src/config/clinic';
import { demoDoctors } from '../src/data/demo/doctors';
import { demoWorkingHours } from '../src/data/demo/schedule';
import { demoServices } from '../src/data/demo/services';
import {
  computeAvailability,
  computeDay,
  freeDoctorsAt,
  isTimeAvailable,
  roundUpToStep,
  SLOT_STEP_MINUTES,
  type AvailabilityContext,
} from '../src/services/mock/availability';
import type { Appointment } from '../src/types/domain';
import { toMinutes } from '../src/utils/datetime';

// Понедельник 2026-10-05, «сейчас» — воскресенье 2026-10-04 12:00 по Бишкеку.
const NOW = Date.UTC(2026, 9, 4, 6, 0);
const MONDAY = '2026-10-05';
// Демо-часы: будни 09–19, обед 13–14, суббота 10–16, воскресенье — выходной.
const branch = { ...getBranch(), workingHours: demoWorkingHours };
const off = { hours: null, breaks: [] };

function ctx(overrides: Partial<AvailabilityContext> = {}): AvailabilityContext {
  return {
    services: demoServices,
    doctors: demoDoctors,
    branch,
    appointments: [],
    now: NOW,
    minLeadMinutes: 60,
    utcOffsetMinutes: 360,
    isDemo: false,
    mode: 'slots',
    ...overrides,
  };
}

const request = (overrides: Partial<AvailabilityContext> = {}) => ctx({ mode: 'request', ...overrides });

function appointment(partial: Partial<Appointment>): Appointment {
  return {
    id: 'a1',
    serviceId: 'caries',
    doctorId: 'aigerim',
    branchId: 'main',
    date: MONDAY,
    time: '10:00',
    patient: { name: 'Тест' },
    contactChannel: 'whatsapp',
    status: 'requested',
    startsAt: `${MONDAY}T10:00:00+06:00`,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

const times = (date: string, serviceId: string, doctorId: string | null, c: AvailabilityContext) =>
  computeDay(date, { serviceId, doctorId }, c).slots.map((s) => s.time);

describe('расчёт свободного времени (сервер или демо)', () => {
  it('длительность округляется до ячеек по 30 минут; 90 минут — 3 ячейки', () => {
    assert.equal(roundUpToStep(30), 30);
    assert.equal(roundUpToStep(45), 60);
    assert.equal(roundUpToStep(90) / SLOT_STEP_MINUTES, 3);
    assert.equal(roundUpToStep(0), 30);
  });

  it('все рабочие слоты врача: пересечение часов, минус перерыв', () => {
    // Айгерим 09–18, клиника 09–19, перерыв 13–14, услуга 60 мин.
    assert.deepEqual(times(MONDAY, 'caries', 'aigerim', ctx()), [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
    ]);
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
    assert.equal(times('2026-10-06', 'caries', 'aigerim', ctx({ now }))[0], '14:00');
  });

  it('детерминированность: одинаковый вход — одинаковый результат', () => {
    const query = { serviceId: 'consultation', doctorId: null, fromDate: MONDAY, days: 14 };
    assert.deepEqual(
      computeAvailability(query, ctx({ isDemo: true })),
      computeAvailability(query, ctx({ isDemo: true })),
    );
  });

  it('демо-занятость есть только при isDemo', () => {
    const query = { serviceId: 'consultation', doctorId: 'aigerim', fromDate: MONDAY, days: 5 };
    const count = (c: AvailabilityContext) => computeAvailability(query, c).reduce((n, d) => n + d.slots.length, 0);
    assert.ok(count(ctx({ isDemo: true })) < count(ctx()));
    assert.ok(count(ctx({ isDemo: true })) > 0);
  });

  it('запись на 60 минут убирает пересекающиеся слоты, отменённая — возвращает', () => {
    const list = times(MONDAY, 'caries', 'aigerim', ctx({ appointments: [appointment({})] }));
    // Запись 10:00–11:00 блокирует 09:30 (60 мин), 10:00 и 10:30.
    for (const blocked of ['09:30', '10:00', '10:30']) assert.ok(!list.includes(blocked), blocked);
    assert.ok(list.includes('09:00'));
    assert.ok(list.includes('11:00'));
    const cancelled = ctx({ appointments: [appointment({ status: 'cancelled' })] });
    assert.ok(times(MONDAY, 'caries', 'aigerim', cancelled).includes('10:00'));
  });

  it('запись на 90 минут занимает все 3 ячейки', () => {
    // Имплантация у Елены 10:00–11:30: заняты ячейки 10:00, 10:30 и 11:00.
    const busy = ctx({ appointments: [appointment({ serviceId: 'implant', doctorId: 'elena' })] });
    const list = times(MONDAY, 'consultation', 'elena', busy);
    for (const cell of ['10:00', '10:30', '11:00']) assert.ok(!list.includes(cell), `${cell} должна быть занята`);
    assert.ok(list.includes('09:30'));
    assert.ok(list.includes('11:30'));
  });

  it('при переносе собственная запись не блокирует время', () => {
    const c = ctx({ appointments: [appointment({})] });
    const free = freeDoctorsAt(
      MONDAY,
      '10:00',
      { serviceId: 'caries', doctorId: 'aigerim', excludeAppointmentId: 'a1' },
      c,
    );
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

describe('«желаемое время» (заявка в WhatsApp/Telegram без сервера)', () => {
  it('сетка = часы клиники минус обед; 90 минут не пересекают обед и конец дня', () => {
    const list = times(MONDAY, 'implant', null, request());
    assert.deepEqual(list, [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
    ]);
    // 12:00–13:30 задело бы обед, 18:00–19:30 — конец дня.
    assert.ok(!list.includes('12:00'));
    assert.ok(!list.includes('12:30'));
    assert.ok(!list.includes('18:00'));
  });

  it('60 минут: последний старт — за час до закрытия; суббота без обеда', () => {
    const monday = times(MONDAY, 'caries', null, request());
    assert.equal(monday.at(-1), '18:00');
    assert.ok(!monday.includes('12:30'));
    const saturday = times('2026-10-10', 'caries', null, request());
    assert.equal(saturday[0], '10:00');
    assert.equal(saturday.at(-1), '15:00');
    assert.ok(saturday.includes('13:00'));
  });

  it('не зависит от расписаний врачей, демо-занятости и записей на телефоне', () => {
    const plain = times(MONDAY, 'consultation', 'aigerim', request());
    const noisy = times(MONDAY, 'consultation', 'aigerim', request({ isDemo: true, appointments: [appointment({})] }));
    assert.deepEqual(noisy, plain);
    // У Айгерим смена до 18:00, но клиника работает до 19:00 — желаемое время до 18:30.
    assert.equal(plain.at(-1), '18:30');
  });

  it('врач «по возможности»: выбранный врач передаётся, «любой» — пусто', () => {
    const chosen = computeDay(MONDAY, { serviceId: 'consultation', doctorId: 'elena' }, request());
    assert.deepEqual(chosen.slots[0]?.doctorIds, ['elena']);
    const any = computeDay(MONDAY, { serviceId: 'consultation', doctorId: null }, request());
    assert.deepEqual(any.slots[0]?.doctorIds, []);
  });

  it('прошедшее время и minLead убираются', () => {
    // Понедельник 15:10 по Бишкеку → не раньше 16:10 → первая ячейка 16:30.
    const now = Date.UTC(2026, 9, 5, 9, 10);
    assert.equal(times(MONDAY, 'consultation', null, request({ now }))[0], '16:30');
    assert.ok(isTimeAvailable(MONDAY, '16:30', { serviceId: 'consultation', doctorId: null }, request({ now })));
    assert.ok(!isTimeAvailable(MONDAY, '15:30', { serviceId: 'consultation', doctorId: null }, request({ now })));
  });

  it('без часов работы — дни закрыты, сетки нет', () => {
    const days = computeAvailability(
      { serviceId: 'consultation', doctorId: null, fromDate: MONDAY, days: 7 },
      request({
        branch: { ...branch, workingHours: { mon: off, tue: off, wed: off, thu: off, fri: off, sat: off, sun: off } },
      }),
    );
    assert.ok(days.every((d) => !d.clinicOpen && d.slots.length === 0));
  });
});
