import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { appointmentMessage } from '@/components/booking/bookingText';
import { BookingScaffold } from '@/components/booking/BookingScaffold';
import { useBookingNavigation } from '@/components/booking/useBookingNavigation';
import { DateStrip } from '@/components/domain/DateStrip';
import { SlotGrid } from '@/components/domain/SlotGrid';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, CalendarClock, CalendarX, ClipboardList, Phone } from '@/components/ui/icons';
import { Chip } from '@/components/ui/Selection';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { clinicConfig } from '@/config/clinic';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useContactActions } from '@/hooks/useContactActions';
import { useResource } from '@/hooks/useResource';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { repositories, SlotUnavailableError } from '@/services';
import { track } from '@/services/analytics';
import {
  channelTitle,
  getDeliveryMode,
  getScheduleMode,
  requestChannel,
  sendToMessenger,
} from '@/services/bookingDelivery';
import { useAppointments } from '@/state/AppointmentsProvider';
import { ANY_DOCTOR, bookingRoutes, useBooking } from '@/state/BookingProvider';
import { useProfile } from '@/state/ProfileProvider';
import { useToast } from '@/state/ToastProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { LocalDate, TimeSlot } from '@/types/domain';
import { hapticSuccess } from '@/utils/haptics';

/** Шаг 2: врач (чипсы), день (лента) и время (Утро / День / Вечер). В режиме переноса — единственный экран. */
export default function BookingDateTimeScreen() {
  const i18n = useI18n();
  const { t, l, fmt } = i18n;
  const { draft, update, stepNumber, steps } = useBooking();
  const services = useServices();
  const doctors = useDoctors();
  const { version, reschedule } = useAppointments();
  const { today } = useToday();
  const { closeFlow } = useBookingNavigation();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const contact = useContactActions();
  const [saving, setSaving] = useState(false);

  const isReschedule = draft.mode === 'reschedule';
  // Без сервера реального расписания нет: пациент выбирает желаемое время, клиника подтверждает.
  const wanted = getScheduleMode() === 'request';
  const service = services.data?.find((s) => s.id === draft.serviceId);
  const doctorId = draft.doctorChoice === ANY_DOCTOR ? null : draft.doctorChoice;
  const branchId = draft.original?.branchId ?? clinicConfig.defaultBranchId;
  const serviceDoctors = (doctors.data ?? []).filter(
    (d) => draft.serviceId && d.serviceIds.includes(draft.serviceId) && d.branchIds.includes(branchId),
  );

  const key = draft.serviceId
    ? ['slots', draft.serviceId, doctorId ?? 'any', today, version, draft.slotsNonce, draft.original?.id ?? ''].join(
        ':',
      )
    : null;
  const availability = useResource(
    key,
    () =>
      repositories.schedule.getAvailability({
        serviceId: draft.serviceId ?? '',
        doctorId,
        branchId,
        fromDate: today,
        days: clinicConfig.booking.horizonDays,
        excludeAppointmentId: draft.original?.id,
      }),
    { cache: false },
  );

  const days = availability.data ?? [];
  const firstAvailable = days.find((d) => d.slots.length > 0);
  // Ближайший день со свободным временем выбирается автоматически.
  const selectedDate: LocalDate | null =
    draft.date && days.some((d) => d.date === draft.date)
      ? draft.date
      : (firstAvailable?.date ?? days.find((d) => d.clinicOpen)?.date ?? null);
  const selectedDay = days.find((d) => d.date === selectedDate);
  const selectedTime = draft.date === selectedDate ? draft.time : null;
  const nearest =
    days.find((d) => d.slots.length > 0 && selectedDate !== null && d.date > selectedDate) ?? firstAvailable;
  const selectionLabel = selectedDate && selectedTime ? fmt.relativeDateTime(selectedDate, selectedTime, today) : null;

  const chooseDoctor = (choice: string) => update({ doctorChoice: choice, time: null, slotDoctorIds: [] });
  const chooseDay = (date: LocalDate) => update({ date, time: null, slotDoctorIds: [] });
  const chooseSlot = (slot: TimeSlot) => update({ date: selectedDate, time: slot.time, slotDoctorIds: slot.doctorIds });

  const confirmReschedule = async () => {
    const original = draft.original;
    if (!original || !selectedDate || !selectedTime || saving) return;
    const anyDoctor = draft.doctorChoice === ANY_DOCTOR;
    setSaving(true);
    try {
      const updated = await reschedule(original.id, {
        date: selectedDate,
        time: selectedTime,
        doctorId: anyDoctor ? (draft.slotDoctorIds[0] ?? original.doctorId) : draft.doctorChoice,
        anyDoctor,
      });
      hapticSuccess();
      const mode = getDeliveryMode();
      if (mode === 'whatsapp' || mode === 'telegram') {
        const doctor = doctors.data?.find((d) => d.id === updated.doctorId);
        await sendToMessenger(
          requestChannel(),
          appointmentMessage(i18n, 'reschedule', updated, service, doctor, {
            phone: profile.phone,
            previous: { date: original.date, time: original.time },
          }),
        );
      }
      showToast(t.booking.rescheduled, 'success');
      closeFlow();
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        showToast(t.booking.slotTaken, 'error');
        update({ time: null, slotDoctorIds: [], slotsNonce: draft.slotsNonce + 1 });
      } else {
        showToast(t.booking.submitError, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!draft.serviceId) {
    return (
      <BookingScaffold title={t.booking.datetimeTitle} step={null} confirmClose={false}>
        <EmptyState
          icon={ClipboardList}
          title={t.booking.serviceTitle}
          text={t.booking.serviceHint}
          actionLabel={t.common.continue}
          onAction={() => router.replace(bookingRoutes.service)}
        />
      </BookingScaffold>
    );
  }

  const subtitle = isReschedule
    ? draft.original
      ? t.booking.rescheduleCurrent(fmt.dateTime(draft.original.date, draft.original.time))
      : undefined
    : service
      ? [l(service.name), fmt.price(service)].filter(Boolean).join(' · ')
      : undefined;

  const footer = (
    <>
      {selectionLabel && !isReschedule ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {selectionLabel}
        </AppText>
      ) : null}
      <Button
        testID="datetime-continue"
        variant={isReschedule ? 'primary' : 'accent'}
        label={
          !selectionLabel
            ? t.booking.selectTime
            : isReschedule
              ? t.booking.rescheduleTo(fmt.dateTime(selectedDate ?? '', selectedTime ?? ''))
              : t.common.continue
        }
        iconRight={selectionLabel && !isReschedule ? ArrowRight : undefined}
        disabled={!selectionLabel}
        loading={saving}
        onPress={() => {
          if (isReschedule) {
            confirmReschedule();
            return;
          }
          track('booking_step_viewed', { step: 'details' });
          router.push(bookingRoutes.details);
        }}
      />
    </>
  );

  return (
    <BookingScaffold
      title={isReschedule ? t.booking.rescheduleTitle : t.booking.datetimeTitle}
      subtitle={subtitle}
      step={isReschedule ? null : { current: stepNumber('datetime'), total: steps.length }}
      confirmClose={!isReschedule}
      onBack={router.canDismiss() ? () => router.back() : undefined}
      footer={footer}>
      {serviceDoctors.length > 1 && wanted ? (
        <AppText variant="caption" color="textSecondary" style={styles.caption}>
          {t.booking.doctorOptional}
        </AppText>
      ) : null}
      {serviceDoctors.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            label={t.booking.anyDoctor}
            selected={draft.doctorChoice === ANY_DOCTOR}
            onPress={() => chooseDoctor(ANY_DOCTOR)}
          />
          {serviceDoctors.map((doctor) => (
            <Chip
              key={doctor.id}
              label={l(doctor.name)}
              accessibilityLabel={`${l(doctor.name)}, ${l(doctor.role)}`}
              selected={draft.doctorChoice === doctor.id}
              onPress={() => chooseDoctor(doctor.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      {availability.status === 'ready' ? (
        <DateStrip days={days} selected={selectedDate} today={today} onSelect={chooseDay} wanted={wanted} />
      ) : null}

      <View style={styles.body}>
        {availability.status === 'error' ? (
          <ErrorState onRetry={availability.reload} />
        ) : availability.status !== 'ready' ? (
          <View style={styles.skeleton}>
            <View style={styles.skeletonDays}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} width={64} height={80} rounded={radius.md} />
              ))}
            </View>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} height={layout.touch} rounded={radius.md} />
            ))}
          </View>
        ) : !firstAvailable ? (
          <Card variant="tinted" style={styles.notice}>
            <CalendarX size={iconSize.lg} color={colors.hero} />
            <AppText variant="body">
              {wanted
                ? days.every((d) => !d.clinicOpen)
                  ? t.booking.noWorkingHours
                  : t.booking.noWantedTime
                : t.booking.noSlotsAtAll}
            </AppText>
            {contact.available.call ? (
              <Button label={t.booking.call} icon={Phone} variant="primary" size="md" onPress={contact.call} />
            ) : null}
          </Card>
        ) : selectedDay && selectedDay.slots.length > 0 ? (
          <View style={styles.slots}>
            <AppText variant="h3" accessibilityRole="header">
              {wanted ? t.booking.slotsWanted : t.booking.slotsFree}
            </AppText>
            <SlotGrid slots={selectedDay.slots} selected={selectedTime} onSelect={chooseSlot} />
            {wanted ? (
              <AppText variant="bodySm" color="textSecondary">
                {t.booking.wantedNote(channelTitle(requestChannel()))}
              </AppText>
            ) : null}
          </View>
        ) : (
          <Card variant="tinted" style={styles.notice}>
            <CalendarClock size={iconSize.lg} color={colors.hero} />
            <AppText variant="body">
              {selectedDay?.clinicOpen === false
                ? t.booking.dayClosed
                : wanted
                  ? t.booking.noTimeLeft
                  : t.booking.noSlotsDay}
            </AppText>
            {nearest ? (
              <>
                <AppText variant="title">
                  {wanted
                    ? t.booking.nearestWorkday(fmt.relativeDate(nearest.date, today))
                    : t.booking.nearest(fmt.relativeDateTime(nearest.date, nearest.slots[0]!.time, today))}
                </AppText>
                <Button
                  label={t.booking.show}
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onPress={() => chooseDay(nearest.date)}
                />
              </>
            ) : null}
          </Card>
        )}
      </View>
    </BookingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: {
    paddingHorizontal: layout.gutter,
    gap: spacing.xs,
  },
  caption: {
    paddingHorizontal: layout.gutter,
    marginBottom: -spacing.sm,
  },
  slots: {
    gap: spacing.md,
  },
  body: {
    paddingHorizontal: layout.gutter,
  },
  skeleton: {
    gap: spacing.sm,
  },
  skeletonDays: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  notice: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
