import { groupAppointments, useAppointments } from '../state/AppointmentsProvider';
import { useNow } from './useNow';

/** Предстоящие записи и история (отменённые и прошедшие). */
export function useAppointmentGroups() {
  const { appointments, status } = useAppointments();
  const now = useNow(60_000);
  return { status, ...groupAppointments(appointments, now) };
}
