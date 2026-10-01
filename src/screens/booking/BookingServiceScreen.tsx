import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BookingScaffold } from '@/components/booking/BookingScaffold';
import { RadioMark } from '@/components/booking/RadioMark';
import { ServiceRow } from '@/components/domain/ServiceRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Info } from '@/components/ui/icons';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateViews';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useI18n } from '@/i18n';
import { track } from '@/services/analytics';
import { ANY_DOCTOR, bookingRoutes, useBooking } from '@/state/BookingProvider';
import { colors, iconSize, layout, spacing } from '@/theme';
import type { Service } from '@/types/domain';
import { hapticSelection } from '@/utils/haptics';

/** Шаг 1: услуга. Консультация первой; выбор сразу ведёт к шагу 2. */
export default function BookingServiceScreen() {
  const { t, l } = useI18n();
  const services = useServices();
  const doctors = useDoctors();
  const { draft, update, stepNumber, steps } = useBooking();
  const preferred = draft.preferredDoctorId ? doctors.data?.find((d) => d.id === draft.preferredDoctorId) : undefined;
  const hasPrevious = router.canDismiss();

  const list = [...(services.data ?? [])]
    .filter((s) => !preferred || preferred.serviceIds.includes(s.id))
    .sort((a, b) => Number(b.isConsultation) - Number(a.isConsultation));

  const choose = (service: Service) => {
    hapticSelection();
    const current = doctors.data?.find((d) => d.id === draft.doctorChoice);
    const keepDoctor = Boolean(current?.serviceIds.includes(service.id));
    update({
      serviceId: service.id,
      doctorChoice: keepDoctor ? draft.doctorChoice : ANY_DOCTOR,
      date: null,
      time: null,
      slotDoctorIds: [],
    });
    track('booking_step_viewed', { step: 'datetime', serviceId: service.id });
    // Пришли сюда кнопкой «Изменить» — возвращаемся к уже открытому шагу времени.
    if (hasPrevious) router.dismissTo(bookingRoutes.datetime);
    else router.push(bookingRoutes.datetime);
  };

  return (
    <BookingScaffold
      title={t.booking.serviceTitle}
      step={{ current: stepNumber('service'), total: steps.length }}
      confirmClose={hasPrevious}
      onBack={hasPrevious ? () => router.back() : undefined}>
      <View style={styles.body}>
        <View style={styles.hint}>
          <Info size={iconSize.md} color={colors.hero} />
          <AppText variant="bodySm" color="textSecondary" style={styles.flex}>
            {preferred ? `${l(preferred.name)} · ${l(preferred.role)}` : t.booking.serviceHint}
          </AppText>
        </View>
        {services.status === 'ready' ? (
          <Card padded={false}>
            {list.map((service, index) => {
              const selected = service.id === draft.serviceId;
              return (
                <ServiceRow
                  key={service.id}
                  testID={`book-service-${service.id}`}
                  service={service}
                  divider={index > 0}
                  selected={selected}
                  right={<RadioMark selected={selected} />}
                  onPress={() => choose(service)}
                />
              );
            })}
          </Card>
        ) : services.status === 'error' ? (
          <ErrorState onRetry={services.reload} />
        ) : (
          <SkeletonList rows={6} />
        )}
      </View>
    </BookingScaffold>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.gutter,
    gap: spacing.md,
  },
  hint: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
});
