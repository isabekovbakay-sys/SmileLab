import type { ClockTime, Language, LocalDate, LocalizedText, Weekday } from '../types/domain';
import { addDays, dayOfMonth, formatDateNumeric, monthIndex, weekdayOf } from '../utils/datetime';
import type { Strings } from './ru';

/** Форматтеры дат и цен для выбранного языка. Чистые функции: «сегодня» передаётся явно. */
export function createFormatters(t: Strings) {
  const dateLong = (date: LocalDate) => t.dates.long(dayOfMonth(date), t.dates.months[monthIndex(date)] ?? '');
  const weekday = (date: LocalDate) => t.dates.weekdays[weekdayOf(date)];
  const weekdayShort = (day: Weekday) => t.dates.weekdaysShort[day];

  const relativeWord = (date: LocalDate, today: LocalDate): string | null => {
    if (date === today) return t.dates.today;
    if (date === addDays(today, 1)) return t.dates.tomorrow;
    return null;
  };

  /** «Сегодня, 30 сентября» / «Эртең, 1-октябрь» / «2 октября, пятница». */
  const relativeDate = (date: LocalDate, today: LocalDate) => {
    const word = relativeWord(date, today);
    return word ? t.dates.relative(word, dateLong(date)) : t.dates.withWeekday(dateLong(date), weekday(date));
  };

  return {
    dateLong,
    weekday,
    weekdayShort,
    dateNumeric: formatDateNumeric,
    dateWithWeekday: (date: LocalDate) => t.dates.withWeekday(dateLong(date), weekday(date)),
    relativeDate,
    /** «Сегодня» / «Завтра» / «Пн» — для ленты дней. */
    dayChipLabel: (date: LocalDate, today: LocalDate) =>
      relativeWord(date, today) ?? t.dates.weekdaysShort[weekdayOf(date)],
    dateTime: (date: LocalDate, time: ClockTime) => t.dates.dateTime(dateLong(date), time),
    relativeDateTime: (date: LocalDate, time: ClockTime, today: LocalDate) =>
      t.dates.dateTime(relativeDate(date, today), time),
    timeRange: (start: ClockTime, end: ClockTime) => t.dates.range(start, end),
    price: (priceFrom: number | null) =>
      priceFrom === null ? t.common.priceOnConsultation : t.common.priceFrom(priceFrom),
    duration: (minutes: number) => t.common.duration(minutes),
  };
}

export type Formatters = ReturnType<typeof createFormatters>;

export function pickLocalized(text: LocalizedText, language: Language, fallback: Language = 'ru'): string {
  return text[language] || text[fallback];
}
