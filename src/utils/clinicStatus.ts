import type { ClockTime, Weekday, WeeklySchedule } from '../types/domain';
import { clinicNow, toMinutes, WEEKDAYS } from './datetime';

export type ClinicStatus =
  | { kind: 'open'; until: ClockTime }
  | { kind: 'break'; until: ClockTime }
  | { kind: 'closed'; opens: { inDays: number; weekday: Weekday; time: ClockTime } | null };

/** Статус клиники по времени клиники (UTC+6), независимо от часового пояса телефона. */
export function computeClinicStatus(schedule: WeeklySchedule, now: number, offsetMinutes: number): ClinicStatus {
  const moment = clinicNow(now, offsetMinutes);
  const today = schedule[moment.weekday];

  if (today.hours) {
    const start = toMinutes(today.hours.start);
    const end = toMinutes(today.hours.end);
    if (moment.minutes >= start && moment.minutes < end) {
      const currentBreak = today.breaks.find(
        (b) => moment.minutes >= toMinutes(b.start) && moment.minutes < toMinutes(b.end),
      );
      return currentBreak ? { kind: 'break', until: currentBreak.end } : { kind: 'open', until: today.hours.end };
    }
    if (moment.minutes < start) {
      return { kind: 'closed', opens: { inDays: 0, weekday: moment.weekday, time: today.hours.start } };
    }
  }

  const todayIndex = WEEKDAYS.indexOf(moment.weekday);
  for (let inDays = 1; inDays <= 7; inDays += 1) {
    const weekday = WEEKDAYS[(todayIndex + inDays) % 7]!;
    const hours = schedule[weekday].hours;
    if (hours) return { kind: 'closed', opens: { inDays, weekday, time: hours.start } };
  }
  return { kind: 'closed', opens: null };
}
