import type {
  Appointment,
  Branch,
  ClockTime,
  DayAvailability,
  Doctor,
  LocalDate,
  Service,
  TimeRange,
  TimeSlot,
} from '../../types/domain';
import { addDays, clinicTimestamp, fromMinutes, toMinutes, weekdayOf } from '../../utils/datetime';
import { hashString } from '../../utils/text';

/** Шаг сетки записи. Длительность услуги округляется вверх до ячеек. */
export const SLOT_STEP_MINUTES = 30;
/** Доля «занятых другими пациентами» ячеек в демо-режиме. */
const DEMO_BUSY_PERCENT = 30;

export interface AvailabilityContext {
  services: Service[];
  doctors: Doctor[];
  branch: Branch;
  appointments: Appointment[];
  /** Текущий момент, мс. Передаётся явно — расчёт детерминирован. */
  now: number;
  minLeadMinutes: number;
  utcOffsetMinutes: number;
  isDemo: boolean;
  /**
   * slots — свободное время по расписаниям врачей и записям (сервер или демо);
   * request — «желаемое время»: часы работы клиники без перерывов, прошедшего времени
   * и minLead. Расписание не известно, поэтому занятость не учитывается.
   */
  mode: ScheduleMode;
}

export type ScheduleMode = 'slots' | 'request';

export interface SlotQuery {
  serviceId: string;
  doctorId: string | null;
  excludeAppointmentId?: string;
}

interface Interval {
  start: number;
  end: number;
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

export function roundUpToStep(minutes: number): number {
  return Math.max(1, Math.ceil(minutes / SLOT_STEP_MINUTES)) * SLOT_STEP_MINUTES;
}

function toInterval(range: TimeRange): Interval {
  return { start: toMinutes(range.start), end: toMinutes(range.end) };
}

/** Детерминированная имитация занятости: только при isDemo. */
export function isDemoBusy(doctorId: string, date: LocalDate, time: ClockTime): boolean {
  return hashString(`${doctorId}|${date}|${time}`) % 100 < DEMO_BUSY_PERCENT;
}

function candidateDoctors(query: SlotQuery, ctx: AvailabilityContext): Doctor[] {
  return ctx.doctors
    .filter((d) => d.serviceIds.includes(query.serviceId) && d.branchIds.includes(ctx.branch.id))
    .filter((d) => query.doctorId === null || d.id === query.doctorId);
}

function busyIntervals(doctorId: string, date: LocalDate, query: SlotQuery, ctx: AvailabilityContext): Interval[] {
  return ctx.appointments
    .filter(
      (a) =>
        a.status !== 'cancelled' && a.doctorId === doctorId && a.date === date && a.id !== query.excludeAppointmentId,
    )
    .map((a) => {
      const service = ctx.services.find((s) => s.id === a.serviceId);
      const start = toMinutes(a.time);
      return { start, end: start + roundUpToStep(service?.durationMin ?? SLOT_STEP_MINUTES) };
    });
}

/** Начала слотов (минуты), в которые услуга целиком помещается в окно и не задевает перерывы и занятое. */
function fitStarts(
  date: LocalDate,
  window: Interval,
  blocked: Interval[],
  durationMin: number,
  ctx: AvailabilityContext,
  skip?: (time: ClockTime) => boolean,
): number[] {
  const earliest = ctx.now + ctx.minLeadMinutes * 60_000;
  const result: number[] = [];
  const first = Math.ceil(window.start / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
  for (let start = first; start + durationMin <= window.end; start += SLOT_STEP_MINUTES) {
    const slot = { start, end: start + durationMin };
    if (blocked.some((b) => overlaps(slot, b))) continue;
    const time = fromMinutes(start);
    if (clinicTimestamp(date, time, ctx.utcOffsetMinutes) < earliest) continue;
    if (skip?.(time)) continue;
    result.push(start);
  }
  return result;
}

/** Свободное время одного врача в один день: список начал слотов (минуты). */
function doctorSlots(doctor: Doctor, date: LocalDate, durationMin: number, query: SlotQuery, ctx: AvailabilityContext) {
  const weekday = weekdayOf(date);
  const clinicDay = ctx.branch.workingHours[weekday];
  const doctorDay = doctor.schedule[weekday];
  if (!clinicDay.hours || !doctorDay.hours) return [];

  const clinicHours = toInterval(clinicDay.hours);
  const doctorHours = toInterval(doctorDay.hours);
  const window = {
    start: Math.max(clinicHours.start, doctorHours.start),
    end: Math.min(clinicHours.end, doctorHours.end),
  };
  const blocked = [
    ...[...clinicDay.breaks, ...doctorDay.breaks].map(toInterval),
    ...busyIntervals(doctor.id, date, query, ctx),
  ];
  return fitStarts(date, window, blocked, durationMin, ctx, (time) => ctx.isDemo && isDemoBusy(doctor.id, date, time));
}

export function computeDay(date: LocalDate, query: SlotQuery, ctx: AvailabilityContext): DayAvailability {
  const clinicDay = ctx.branch.workingHours[weekdayOf(date)];
  const service = ctx.services.find((s) => s.id === query.serviceId);
  if (!clinicDay.hours || !service) {
    return { date, clinicOpen: Boolean(clinicDay.hours), slots: [] };
  }
  const duration = roundUpToStep(service.durationMin);

  if (ctx.mode === 'request') {
    // Желаемое время: только часы работы клиники. Врача пациент выбирает «по возможности».
    const starts = fitStarts(date, toInterval(clinicDay.hours), clinicDay.breaks.map(toInterval), duration, ctx);
    const doctorIds = query.doctorId ? [query.doctorId] : [];
    return { date, clinicOpen: true, slots: starts.map((start) => ({ time: fromMinutes(start), doctorIds })) };
  }

  const byTime = new Map<number, string[]>();
  for (const doctor of candidateDoctors(query, ctx)) {
    for (const start of doctorSlots(doctor, date, duration, query, ctx)) {
      const list = byTime.get(start) ?? [];
      list.push(doctor.id);
      byTime.set(start, list);
    }
  }
  const slots: TimeSlot[] = [...byTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, doctorIds]) => ({ time: fromMinutes(start), doctorIds }));
  return { date, clinicOpen: true, slots };
}

export function computeAvailability(
  query: SlotQuery & { fromDate: LocalDate; days: number },
  ctx: AvailabilityContext,
): DayAvailability[] {
  return Array.from({ length: Math.max(0, query.days) }, (_, i) => computeDay(addDays(query.fromDate, i), query, ctx));
}

/** Врачи, свободные в конкретное время (повторная проверка перед записью). */
export function freeDoctorsAt(date: LocalDate, time: ClockTime, query: SlotQuery, ctx: AvailabilityContext): string[] {
  return computeDay(date, query, ctx).slots.find((s) => s.time === time)?.doctorIds ?? [];
}

/** Время есть в сетке дня (повторная проверка перед записью в любом режиме). */
export function isTimeAvailable(date: LocalDate, time: ClockTime, query: SlotQuery, ctx: AvailabilityContext): boolean {
  return computeDay(date, query, ctx).slots.some((s) => s.time === time);
}
