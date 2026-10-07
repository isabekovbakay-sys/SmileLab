import type { Appointment } from '../../types/domain';
import { isValidClockTime, isValidLocalDate } from '../../utils/datetime';

/**
 * Отбрасывает повреждённые записи из хранилища, чтобы экран не падал,
 * и вычищает поля, которые на телефоне больше не храним (телефон пациента, комментарий).
 */
export function sanitizeAppointments(value: unknown): Appointment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Appointment => {
      if (!item || typeof item !== 'object') return false;
      const a = item as Partial<Appointment>;
      return (
        typeof a.id === 'string' &&
        typeof a.serviceId === 'string' &&
        typeof a.doctorId === 'string' &&
        isValidLocalDate(a.date) &&
        isValidClockTime(a.time) &&
        (a.status === 'requested' || a.status === 'confirmed' || a.status === 'cancelled') &&
        typeof a.patient?.name === 'string'
      );
    })
    .map(toStoredAppointment);
}

/** Только то, что нужно для списка «Мои записи». Телефон и комментарий в хранилище не попадают. */
export function toStoredAppointment(appointment: Appointment & { comment?: unknown }): Appointment {
  const { comment: _comment, patient, ...rest } = appointment;
  return { ...rest, patient: { name: patient.name } };
}

/** Есть ли в сырых данных поля, которые нужно удалить из хранилища. */
export function hasLegacyPersonalFields(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (item) =>
        item &&
        typeof item === 'object' &&
        ('comment' in item || (typeof item.patient === 'object' && item.patient && 'phone' in item.patient)),
    )
  );
}
