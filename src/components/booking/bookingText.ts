import type { I18n } from '@/i18n';
import { buildBookingMessage, type BookingMessageKind } from '@/services/bookingMessage';
import type { Appointment, Doctor, Service } from '@/types/domain';

/** «Любой свободный врач» при anyDoctor — пациенту не показываем врача, подставленного приложением. */
export function doctorLabel(i18n: I18n, appointment: Pick<Appointment, 'anyDoctor'>, doctor: Doctor | undefined): string {
  if (appointment.anyDoctor || !doctor) return i18n.t.booking.anyFreeDoctor;
  return i18n.l(doctor.name);
}

/** Текст заявки для мессенджера по записи. */
export function appointmentMessage(
  i18n: I18n,
  kind: BookingMessageKind,
  appointment: Appointment,
  service: Service | undefined,
  doctor: Doctor | undefined,
  previous?: { date: string; time: string },
): string {
  return buildBookingMessage(i18n.t, {
    kind,
    serviceName: service ? i18n.l(service.name) : appointment.serviceId,
    doctorLabel: doctorLabel(i18n, appointment, doctor),
    date: appointment.date,
    time: appointment.time,
    previous,
    patientName: appointment.patient.name,
    patientPhone: appointment.patient.phone,
    comment: appointment.comment,
  });
}
