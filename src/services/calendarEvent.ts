import type { ClockTime, LocalDate } from '../types/domain';
import { clinicTimestamp } from '../utils/datetime';

export interface CalendarEvent {
  title: string;
  /** Начало и конец, epoch ms (время клиники UTC+6 переведено в абсолютное). */
  beginTime: number;
  endTime: number;
  eventLocation: string;
  description: string;
}

/** Событие календаря для записи. Чистая функция — проверяется тестом. */
export function buildCalendarEvent(input: {
  title: string;
  date: LocalDate;
  time: ClockTime;
  durationMin: number;
  location: string;
  description: string;
  utcOffsetMinutes: number;
}): CalendarEvent {
  const beginTime = clinicTimestamp(input.date, input.time, input.utcOffsetMinutes);
  return {
    title: input.title,
    beginTime,
    endTime: beginTime + Math.max(input.durationMin, 15) * 60_000,
    eventLocation: input.location,
    description: input.description,
  };
}
