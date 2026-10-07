import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HoursTable } from '@/components/domain/ClinicInfo';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { DoctorRow } from '@/components/domain/DoctorCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarPlus } from '@/components/ui/icons';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateViews';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { TopBar } from '@/components/ui/TopBar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useClinicContent, useDoctors } from '@/hooks/useClinicData';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { colors, layout, radius, spacing } from '@/theme';

/** О клинике: принципы работы (без цифр), врачи, часы, запись. */
export default function AboutScreen() {
  const { t, l } = useI18n();
  const content = useClinicContent();
  const doctors = useDoctors();
  const { start } = useBooking();

  return (
    <View style={styles.screen}>
      <TopBar title={t.about.title} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer padded style={styles.content}>
          <AppText variant="h2" accessibilityRole="header">
            {t.about.lead}
          </AppText>

          <View style={styles.section}>
            <AppText variant="h3" accessibilityRole="header">
              {t.about.principlesTitle}
            </AppText>
            {content.status === 'ready' ? (
              <View style={styles.principles}>
                {content.data.principles.map((principle, index) => (
                  <Card key={principle.id} style={styles.principle}>
                    <View style={styles.number}>
                      <AppText variant="title" color="hero">
                        {index + 1}
                      </AppText>
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="title">{l(principle.title)}</AppText>
                      <AppText variant="bodySm" color="textSecondary">
                        {l(principle.text)}
                      </AppText>
                    </View>
                  </Card>
                ))}
              </View>
            ) : content.status === 'error' ? (
              <ErrorState onRetry={content.reload} />
            ) : (
              <SkeletonList rows={3} withIcon={false} />
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="h3" accessibilityRole="header">
              {t.about.doctorsTitle}
            </AppText>
            {doctors.status === 'ready' ? (
              <Card padded={false}>
                {doctors.data.map((doctor, index) => (
                  <DoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    divider={index > 0}
                    onPress={() => router.push(`/doctor/${doctor.id}`)}
                  />
                ))}
              </Card>
            ) : doctors.status === 'error' ? (
              <ErrorState onRetry={doctors.reload} />
            ) : (
              <SkeletonList rows={3} />
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="h3" accessibilityRole="header">
              {t.about.hoursTitle}
            </AppText>
            <HoursTable />
          </View>

          <DemoNotice compact />
        </ScreenContainer>
      </ScrollView>
      <StickyFooter>
        <Button label={t.common.bookVisit} icon={CalendarPlus} variant="accent" onPress={() => router.push(start())} />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  content: {
    paddingTop: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  principles: {
    gap: spacing.xs,
  },
  principle: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  number: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
