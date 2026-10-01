import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { appointmentMessage, doctorLabel } from '@/components/booking/bookingText';
import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { appointmentStatus } from '@/components/domain/appointmentStatus';
import { AppText } from '@/components/ui/AppText';
import { ConfirmSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarClock, CalendarPlus, CalendarX, FileText, MapPin, Stethoscope, User, Users } from '@/components/ui/icons';
import { ListRow } from '@/components/ui/ListRow';
import { StatusPill } from '@/components/ui/Selection';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { TopBar } from '@/components/ui/TopBar';
import { getBranch } from '@/config/clinic';
import { cities } from '@/data/cities';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useContactActions } from '@/hooks/useContactActions';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { getDeliveryMode, requestChannel, sendToMessenger } from '@/services/bookingDelivery';
import { useAppointments } from '@/state/AppointmentsProvider';
import { useBooking } from '@/state/BookingProvider';
import { useToast } from '@/state/ToastProvider';
import { colors, layout, spacing } from '@/theme';
import { formatInternationalPhone } from '@/utils/phone';

export default function AppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const i18n = useI18n();
  const { t, l, fmt } = i18n;
  const { appointments, status, cancel } = useAppointments();
  const services = useServices();
  const doctors = useDoctors();
  const { start } = useBooking();
  const contact = useContactActions();
  const { showToast } = useToast();
  const { now, today } = useToday();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const appointment = appointments.find((a) => a.id === id);

  if (status === 'loading') {
    return (
      <View style={styles.screen}>
        <TopBar title={t.appointment.title} />
        <View style={styles.content}>
          <SkeletonList rows={4} />
        </View>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <TopBar title={t.appointment.title} />
        <EmptyState
          icon={CalendarX}
          title={t.appointment.notFoundTitle}
          text={t.appointment.notFoundText}
          actionLabel={t.menu.appointments}
          onAction={() => router.navigate('/appointments')}
        />
      </View>
    );
  }

  const service = services.data?.find((s) => s.id === appointment.serviceId);
  const doctor = doctors.data?.find((d) => d.id === appointment.doctorId);
  const state = appointmentStatus(appointment, now);
  const active = !state.muted;
  const branch = getBranch(appointment.branchId);
  const address = branch.address;
  const addressLine = [
    l(cities[address.cityId].name),
    address.street ? l(address.street) : null,
    address.building,
  ]
    .filter(Boolean)
    .join(', ');
  const whenLabel = fmt.dateTime(appointment.date, appointment.time);
  const channel = requestChannel();
  const contactClinic = () => {
    const text = t.appointment.contactMessage(whenLabel, service ? l(service.name) : '');
    return channel === 'whatsapp' ? contact.whatsapp(text) : contact.telegram(text);
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const cancelled = await cancel(appointment.id);
      setConfirming(false);
      const mode = getDeliveryMode();
      if (mode === 'whatsapp' || mode === 'telegram') {
        await sendToMessenger(requestChannel(), appointmentMessage(i18n, 'cancel', cancelled, service, doctor));
      }
      showToast(t.appointment.cancelled, 'success');
    } catch {
      showToast(t.booking.submitError, 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar title={t.appointment.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="numeral" color={active ? 'hero' : 'textSecondary'}>
            {appointment.time}
          </AppText>
          <AppText variant="h3">{fmt.relativeDate(appointment.date, today)}</AppText>
          <StatusPill label={t.appointments.status[state.key]} tone={state.tone} />
        </View>

        <Card padded={false}>
          <ListRow
            icon={Stethoscope}
            title={service ? l(service.name) : ''}
            subtitle={service ? `${fmt.price(service.priceFrom)} · ${fmt.duration(service.durationMin)}` : undefined}
            onPress={service ? () => router.push(`/service/${service.id}`) : undefined}
          />
          <ListRow
            divider
            icon={Users}
            title={doctorLabel(i18n, appointment, doctor)}
            subtitle={!appointment.anyDoctor && doctor ? l(doctor.role) : t.appointment.doctor}
            onPress={!appointment.anyDoctor && doctor ? () => router.push(`/doctor/${doctor.id}`) : undefined}
          />
          <ListRow
            divider
            icon={MapPin}
            title={addressLine}
            subtitle={address.street ? undefined : t.contacts.addressUnknown}
            onPress={contact.open2gis}
            accessibilityHint={t.a11y.addressClinic}
          />
          <ListRow
            divider
            icon={User}
            title={appointment.patient.name}
            subtitle={formatInternationalPhone(appointment.patient.phone)}
          />
          {appointment.comment ? (
            <ListRow divider icon={FileText} title={t.appointment.comment} subtitle={appointment.comment} />
          ) : null}
        </Card>

        <View style={styles.actions}>
          {active ? (
            <>
              <Button
                testID="appointment-reschedule"
                label={t.appointment.reschedule}
                icon={CalendarClock}
                variant="primary"
                onPress={() => router.push(start({ reschedule: appointment }))}
              />
              <Button
                testID="appointment-cancel"
                label={t.appointment.cancel}
                icon={CalendarX}
                variant="danger"
                onPress={() => setConfirming(true)}
              />
            </>
          ) : (
            <Button
              label={t.appointment.bookAgain}
              icon={CalendarPlus}
              variant="accent"
              onPress={() =>
                router.push(
                  start({
                    serviceId: appointment.serviceId,
                    doctorId: appointment.anyDoctor ? undefined : appointment.doctorId,
                  }),
                )
              }
            />
          )}
          <Button
            label={t.appointment.contact}
            icon={channel === 'whatsapp' ? WhatsAppGlyph : TelegramGlyph}
            variant="secondary"
            onPress={contactClinic}
          />
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={confirming}
        icon={CalendarX}
        tone="danger"
        title={t.appointment.cancelTitle}
        message={t.appointment.cancelText(whenLabel)}
        confirmLabel={t.appointment.cancelConfirm}
        cancelLabel={t.appointment.cancelKeep}
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  header: {
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.xs,
  },
});
