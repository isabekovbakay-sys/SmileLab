import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ServiceRow } from '@/components/domain/ServiceRow';
import { PaymentMethods } from '@/components/domain/ClinicInfo';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarPlus } from '@/components/ui/icons';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateViews';
import { TabHeader } from '@/components/ui/TabHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useServices } from '@/hooks/useClinicData';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { layout, spacing } from '@/theme';

export default function ServicesScreen() {
  const { t } = useI18n();
  const services = useServices();
  const { start } = useBooking();
  const consultation = services.data?.find((s) => s.isConsultation);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenContainer>
        <TabHeader title={t.services.title} subtitle={t.services.subtitle} />
        <View style={styles.body}>
          {services.status === 'ready' ? (
            <Card padded={false}>
              {services.data.map((service, index) => (
                <ServiceRow
                  key={service.id}
                  testID={`service-${service.id}`}
                  service={service}
                  divider={index > 0}
                  onPress={() => router.push(`/service/${service.id}`)}
                />
              ))}
            </Card>
          ) : services.status === 'error' ? (
            <ErrorState onRetry={services.reload} />
          ) : (
            <SkeletonList rows={6} />
          )}

          <View style={styles.section}>
            <AppText variant="h3" accessibilityRole="header">
              {t.contacts.payment}
            </AppText>
            <PaymentMethods />
          </View>

          <Card variant="tinted" style={styles.hint}>
            <AppText variant="title">{t.home.startTitle}</AppText>
            <AppText variant="bodySm" color="textSecondary">
              {t.home.startText}
            </AppText>
            <Button
              label={t.home.startConsult}
              icon={CalendarPlus}
              variant="primary"
              size="md"
              onPress={() => router.push(start(consultation ? { serviceId: consultation.id } : {}))}
            />
          </Card>
        </View>
      </ScreenContainer>
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
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  hint: {
    gap: spacing.xs,
  },
});
