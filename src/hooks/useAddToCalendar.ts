import { clinicConfig, getBranch } from '../config/clinic';
import { useI18n } from '../i18n';
import { calendarSupported, openCalendarInsert } from '../services/calendar';
import { buildCalendarEvent } from '../services/calendarEvent';
import { fullAddress } from '../services/contactLinks';
import { useToast } from '../state/ToastProvider';
import type { Appointment, Service } from '../types/domain';

/** «Добавить в календарь»: на Android открывает событие с услугой, временем и адресом клиники. */
export function useAddToCalendar() {
  const { t, l } = useI18n();
  const { showToast } = useToast();

  const add = async (appointment: Appointment, service: Service | undefined) => {
    const branch = getBranch(appointment.branchId);
    const serviceName = service ? l(service.name) : '';
    const event = buildCalendarEvent({
      title: t.appointment.calendarTitle(clinicConfig.name, serviceName),
      date: appointment.date,
      time: appointment.time,
      durationMin: service?.durationMin ?? 30,
      location: [clinicConfig.name, fullAddress(branch.address, l)].join(', '),
      description: t.appointments.status[appointment.status === 'confirmed' ? 'confirmed' : 'requested'],
      utcOffsetMinutes: clinicConfig.utcOffsetMinutes,
    });
    const opened = await openCalendarInsert(event);
    if (!opened) showToast(t.appointment.calendarError, 'error');
  };

  return { supported: calendarSupported, add };
}
