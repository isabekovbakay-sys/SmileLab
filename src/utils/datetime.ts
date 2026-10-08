import type { ClockTime, LocalDate, Weekday } from '../types/domain';

/**
 * Время клиники. Кыргызстан живёт в UTC+6 без перехода на летнее время,
 * поэтому все расчёты идут по фиксированному смещению и не зависят от часового пояса телефона.
 */
export const DEFAULT_UTC_OFFSET_MINUTES = 360;

export const WEEKDAYS: readonly Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const JS_DAY_TO_WEEKDAY: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export interface ClinicMoment {
  date: LocalDate;
  /** Минуты от полуночи по времени клиники. */
  minutes: number;
  weekday: Weekday;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function formatUtcDate(d: Date): LocalDate {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function parseDate(date: LocalDate): { y: number; m: number; d: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y: y ?? 1970, m: m ?? 1, d: d ?? 1 };
}

/** Текущий момент по времени клиники. */
export function clinicNow(now: Date | number = Date.now(), offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES): ClinicMoment {
  const ms = typeof now === 'number' ? now : now.getTime();
  const shifted = new Date(ms + offsetMinutes * MINUTE_MS);
  return {
    date: formatUtcDate(shifted),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    weekday: JS_DAY_TO_WEEKDAY[shifted.getUTCDay()] ?? 'mon',
  };
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const { y, m, d } = parseDate(date);
  return formatUtcDate(new Date(Date.UTC(y, m - 1, d + days)));
}

export function weekdayOf(date: LocalDate): Weekday {
  const { y, m, d } = parseDate(date);
  return JS_DAY_TO_WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? 'mon';
}

/** Разница в днях: b - a. */
export function diffDays(a: LocalDate, b: LocalDate): number {
  const pa = parseDate(a);
  const pb = parseDate(b);
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / DAY_MS);
}

export function toMinutes(time: ClockTime): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function fromMinutes(total: number): ClockTime {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Абсолютный момент (мс) для даты и времени клиники. */
export function clinicTimestamp(date: LocalDate, time: ClockTime, offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES): number {
  const { y, m, d } = parseDate(date);
  return Date.UTC(y, m - 1, d) + (toMinutes(time) - offsetMinutes) * MINUTE_MS;
}

/** ISO 8601 со смещением клиники: 2026-09-30T15:00:00+06:00. */
export function toClinicIso(date: LocalDate, time: ClockTime, offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  return `${date}T${time}:00${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

/** Слот в прошлом или ближе, чем через leadMinutes от текущего момента. */
export function isSlotInPast(
  date: LocalDate,
  time: ClockTime,
  now: Date | number = Date.now(),
  leadMinutes = 0,
  offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES,
): boolean {
  const ms = typeof now === 'number' ? now : now.getTime();
  return clinicTimestamp(date, time, offsetMinutes) < ms + leadMinutes * MINUTE_MS;
}

/** ДД.ММ.ГГГГ */
export function formatDateNumeric(date: LocalDate): string {
  const { y, m, d } = parseDate(date);
  return `${pad2(d)}.${pad2(m)}.${y}`;
}

export function dayOfMonth(date: LocalDate): number {
  return parseDate(date).d;
}

/** Индекс месяца 0–11. */
export function monthIndex(date: LocalDate): number {
  return parseDate(date).m - 1;
}

export function isValidLocalDate(value: unknown): value is LocalDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isValidClockTime(value: unknown): value is ClockTime {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
