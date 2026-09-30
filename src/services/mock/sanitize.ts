import type { Appointment } from '../../types/domain';
import { isValidClockTime, isValidLocalDate } from '../../utils/datetime';

/** Отбрасывает повреждённые записи из хранилища, чтобы экран не падал. */
export function sanitizeAppointments(value: unknown): Appointment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Appointment => {
    if (!item || typeof item !== 'object') return false;
    const a = item as Partial<Appointment>;
    return (
      typeof a.id === 'string' &&
      typeof a.serviceId === 'string' &&
      typeof a.doctorId === 'string' &&
      isValidLocalDate(a.date) &&
      isValidClockTime(a.time) &&
      (a.status === 'requested' || a.status === 'confirmed' || a.status === 'cancelled') &&
      typeof a.patient?.name === 'string' &&
      typeof a.patient?.phone === 'string'
    );
  });
}
