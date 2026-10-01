import { clinicConfig } from '../config/clinic';
import { clinicNow } from '../utils/datetime';
import { useNow } from './useNow';

/** Сегодняшняя дата клиники (YYYY-MM-DD) и текущий момент. */
export function useToday() {
  const now = useNow(60_000);
  return { now, today: clinicNow(now, clinicConfig.utcOffsetMinutes).date };
}
