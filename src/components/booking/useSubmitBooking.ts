import { router } from 'expo-router';
import { useState } from 'react';

import { clinicConfig } from '@/config/clinic';
import { useI18n } from '@/i18n';
import { SlotUnavailableError } from '@/services';
import { track } from '@/services/analytics';
import { getDeliveryMode, requestChannel, sendToMessenger } from '@/services/bookingDelivery';
import { useAppointments } from '@/state/AppointmentsProvider';
import { ANY_DOCTOR, useBooking } from '@/state/BookingProvider';
import { useProfile } from '@/state/ProfileProvider';
import { useToast } from '@/state/ToastProvider';
import type { Doctor, Service } from '@/types/domain';
import { hapticSuccess, hapticWarning } from '@/utils/haptics';
import { toE164 } from '@/utils/phone';

import { appointmentMessage } from './bookingText';

export interface BookingForm {
  name: string;
  /** Национальные цифры, 9 шт. */
  phone: string;
  comment: string;
}

/**
 * Отправка новой записи: повторная проверка слота (в репозитории), сохранение,
 * доставка в клинику (сервер или мессенджер) и переход на экран успеха.
 */
export function useSubmitBooking(service: Service | undefined, doctors: Doctor[]) {
  const i18n = useI18n();
  const { draft, update } = useBooking();
  const { create } = useAppointments();
  const { updateProfile } = useProfile();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (form: BookingForm) => {
    if (!service || !draft.date || !draft.time || submitting) return;
    const anyDoctor = draft.doctorChoice === ANY_DOCTOR;
    const doctorId = anyDoctor ? (draft.slotDoctorIds[0] ?? '') : draft.doctorChoice;

    setSubmitting(true);
    try {
      const appointment = await create({
        serviceId: service.id,
        doctorId,
        anyDoctor,
        branchId: clinicConfig.defaultBranchId,
        date: draft.date,
        time: draft.time,
        patient: { name: form.name.trim(), phone: toE164(form.phone) },
        comment: form.comment.trim(),
        contactChannel: clinicConfig.booking.requestChannel,
      });
      // Имя и телефон подставятся в следующую запись.
      const phone = toE164(form.phone);
      const comment = form.comment.trim();
      updateProfile({ name: form.name.trim(), phone });
      update({ submitted: { appointmentId: appointment.id, phone, comment } });
      track('booking_submitted', { serviceId: service.id, anyDoctor });
      hapticSuccess();

      const mode = getDeliveryMode();
      if (mode === 'whatsapp' || mode === 'telegram') {
        const doctor = doctors.find((d) => d.id === appointment.doctorId);
        await sendToMessenger(
          requestChannel(),
          appointmentMessage(i18n, 'new', appointment, service, doctor, { phone, comment }),
        );
      }
      router.push({ pathname: '/booking/success', params: { id: appointment.id } });
    } catch (error) {
      hapticWarning();
      track('booking_failed', { reason: error instanceof SlotUnavailableError ? 'slot' : 'error' });
      if (error instanceof SlotUnavailableError) {
        showToast(i18n.t.booking.slotTaken, 'error');
        update({ time: null, slotDoctorIds: [], slotsNonce: draft.slotsNonce + 1 });
        router.back();
      } else {
        showToast(i18n.t.booking.submitError, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting };
}
