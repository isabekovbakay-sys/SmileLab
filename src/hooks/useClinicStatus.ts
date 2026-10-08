import { clinicConfig, getBranch } from '../config/clinic';
import { useI18n } from '../i18n';
import { computeClinicStatus } from '../utils/clinicStatus';
import { useNow } from './useNow';

/** «Сегодня открыто до 19:00» / «Сейчас перерыв до 14:00» / «Сейчас закрыто · откроемся завтра в 09:00». */
export function useClinicStatus() {
  const { t } = useI18n();
  const now = useNow(60_000);
  const status = computeClinicStatus(getBranch().workingHours, now, clinicConfig.utcOffsetMinutes);
  const s = t.home.status;

  let label: string;
  if (status.kind === 'open') label = s.openUntil(status.until);
  else if (status.kind === 'break') label = s.breakUntil(status.until);
  else if (!status.opens) label = s.unknown;
  else if (status.opens.inDays === 0) label = s.opensToday(status.opens.time);
  else if (status.opens.inDays === 1) label = s.opensTomorrow(status.opens.time);
  else label = s.opensOn(t.dates.onWeekday[status.opens.weekday], status.opens.time);

  return { status, label, isOpen: status.kind === 'open' };
}
