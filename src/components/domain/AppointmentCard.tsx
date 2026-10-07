import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ChevronRight } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusPill } from '@/components/ui/Selection';
import { useI18n } from '@/i18n';
import { getScheduleMode } from '@/services/bookingDelivery';
import { anyDoctorText } from '@/services/bookingMessage';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { Appointment, Doctor, Service } from '@/types/domain';
import { dayOfMonth, monthIndex, weekdayOf } from '@/utils/datetime';

import { appointmentStatus } from './appointmentStatus';

interface AppointmentCardProps {
  appointment: Appointment;
  service: Service | undefined;
  doctor: Doctor | undefined;
  now: number;
  onPress: () => void;
  testID?: string;
}

/** Карточка записи: дата, услуга, время, врач, статус. */
export function AppointmentCard({ appointment, service, doctor, now, onPress, testID }: AppointmentCardProps) {
  const { t, l, fmt } = useI18n();
  const status = appointmentStatus(appointment, now);
  const doctorLabel = appointment.anyDoctor ? anyDoctorText(t, getScheduleMode()) : doctor ? l(doctor.name) : '';
  const serviceName = service ? l(service.name) : '';
  const month = t.dates.months[monthIndex(appointment.date)] ?? '';

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${fmt.dateTime(appointment.date, appointment.time)}. ${serviceName}. ${t.appointments.status[status.key]}`}
      style={styles.card}>
      <View style={[styles.date, status.muted ? styles.dateMuted : null]}>
        <AppText variant="h2" color={status.muted ? 'textSecondary' : 'hero'} maxFontSizeMultiplier={1}>
          {dayOfMonth(appointment.date)}
        </AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1} maxFontSizeMultiplier={1}>
          {month.slice(0, 3)}
        </AppText>
        <AppText variant="caption" color="textMuted" maxFontSizeMultiplier={1}>
          {t.dates.weekdaysShort[weekdayOf(appointment.date)]}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="h3">{appointment.time}</AppText>
        <AppText variant="title" numberOfLines={2}>
          {serviceName}
        </AppText>
        {doctorLabel ? (
          <AppText variant="bodySm" color="textSecondary" numberOfLines={1}>
            {doctorLabel}
          </AppText>
        ) : null}
        <View style={styles.pill}>
          <StatusPill label={t.appointments.status[status.key]} tone={status.tone} />
        </View>
      </View>
      <ChevronRight size={iconSize.md} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  date: {
    width: layout.touch + spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  dateMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  pill: {
    marginTop: spacing.xs,
  },
});
