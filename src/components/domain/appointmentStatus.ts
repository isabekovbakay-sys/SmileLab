import type { PillTone } from '@/components/ui/Selection';
import { clinicConfig } from '@/config/clinic';
import type { Appointment } from '@/types/domain';
import { clinicTimestamp } from '@/utils/datetime';

export type AppointmentStatusKey = 'requested' | 'confirmed' | 'cancelled' | 'past';

/** Статус для пациента: прошедшая запись показывается как «Прошла». */
export function appointmentStatus(appointment: Appointment, now: number): {
  key: AppointmentStatusKey;
  tone: PillTone;
  muted: boolean;
} {
  if (appointment.status === 'cancelled') return { key: 'cancelled', tone: 'muted', muted: true };
  if (clinicTimestamp(appointment.date, appointment.time, clinicConfig.utcOffsetMinutes) < now) {
    return { key: 'past', tone: 'muted', muted: true };
  }
  if (appointment.status === 'confirmed') return { key: 'confirmed', tone: 'success', muted: false };
  return { key: 'requested', tone: 'warning', muted: false };
}
