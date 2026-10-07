import type { I18n } from '@/i18n';
import { getScheduleMode } from '@/services/bookingDelivery';
import { anyDoctorText, buildBookingMessage, type BookingMessageKind } from '@/services/bookingMessage';
import type { Appointment, Doctor, Service } from '@/types/domain';

/** «Любой (свободный) врач» при anyDoctor — пациенту не показываем врача, подставленного приложением. */
export function doctorLabel(
  i18n: I18n,
  appointment: Pick<Appointment, 'anyDoctor'>,
  doctor: Doctor | undefined,
): string {
  if (appointment.anyDoctor || !doctor) return anyDoctorText(i18n.t, getScheduleMode());
  return i18n.l(doctor.name);
}

export interface MessageExtras {
  /** E.164: из формы записи или из профиля. На телефоне в записи не хранится. */
  phone?: string;
  /** Только для новой заявки: в записи на телефоне не хранится. */
  comment?: string;
  previous?: { date: string; time: string };
}

/** Текст заявки для мессенджера по записи. */
export function appointmentMessage(
  i18n: I18n,
  kind: BookingMessageKind,
  appointment: Appointment,
  service: Service | undefined,
  doctor: Doctor | undefined,
  extras: MessageExtras = {},
): string {
  const wanted = getScheduleMode() === 'request';
  return buildBookingMessage(i18n.t, {
    kind,
    serviceName: service ? i18n.l(service.name) : appointment.serviceId,
    doctorLabel: doctorLabel(i18n, appointment, doctor),
    doctorPreferred: wanted && !appointment.anyDoctor && Boolean(doctor),
    wanted,
    date: appointment.date,
    time: appointment.time,
    previous: extras.previous,
    patientName: appointment.patient.name,
    patientPhone: extras.phone || undefined,
    comment: extras.comment,
  });
}
