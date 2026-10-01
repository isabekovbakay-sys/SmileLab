import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { CalendarPlus, CalendarDays, Clock } from '@/components/ui/icons';
import { Segmented } from '@/components/ui/Selection';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { TabHeader } from '@/components/ui/TabHeader';
import { useAppointmentGroups } from '@/hooks/useAppointmentGroups';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n';
import { useAppointments } from '@/state/AppointmentsProvider';
import { useBooking } from '@/state/BookingProvider';
import { layout, spacing } from '@/theme';

type Segment = 'upcoming' | 'history';

export default function AppointmentsScreen() {
  const { t } = useI18n();
  const { status, upcoming, history } = useAppointmentGroups();
  const { reload } = useAppointments();
  const services = useServices();
  const doctors = useDoctors();
  const { start } = useBooking();
  const now = useNow();
  const [segment, setSegment] = useState<Segment>('upcoming');
  const list = segment === 'upcoming' ? upcoming : history;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TabHeader title={t.appointments.title} />
      <View style={styles.body}>
        <Segmented<Segment>
          testID="appointments-segments"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'upcoming', label: t.appointments.upcoming(upcoming.length) },
            { value: 'history', label: t.appointments.history },
          ]}
        />
        {status === 'loading' ? (
          <SkeletonList rows={2} />
        ) : status === 'error' ? (
          <ErrorState onRetry={reload} />
        ) : list.length === 0 ? (
          segment === 'upcoming' ? (
            <EmptyState
              icon={CalendarDays}
              title={t.appointments.emptyUpcomingTitle}
              text={t.appointments.emptyUpcomingText}
              actionLabel={t.common.book}
              actionIcon={CalendarPlus}
              onAction={() => router.push(start())}
            />
          ) : (
            <EmptyState
              icon={Clock}
              title={t.appointments.emptyHistoryTitle}
              text={t.appointments.emptyHistoryText}
              actionLabel={t.common.book}
              actionIcon={CalendarPlus}
              onAction={() => router.push(start())}
            />
          )
        ) : (
          <View style={styles.list}>
            {list.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                testID={`appointment-${appointment.id}`}
                appointment={appointment}
                service={services.data?.find((s) => s.id === appointment.serviceId)}
                doctor={doctors.data?.find((d) => d.id === appointment.doctorId)}
                now={now}
                onPress={() => router.push(`/appointment/${appointment.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  body: {
    paddingHorizontal: layout.gutter,
    gap: spacing.md,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  list: {
    gap: spacing.sm,
  },
});
