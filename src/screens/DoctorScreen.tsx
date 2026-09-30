import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Monogram } from '@/components/brand/Monogram';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { ServiceRow } from '@/components/domain/ServiceRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarPlus, Languages, Users } from '@/components/ui/icons';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { TopBar } from '@/components/ui/TopBar';
import { useDoctor, useServices } from '@/hooks/useClinicData';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import { WEEKDAYS, weekdayOf } from '@/utils/datetime';

export default function DoctorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useI18n();
  const doctor = useDoctor(id);
  const services = useServices();
  const { start } = useBooking();
  const { today } = useToday();
  const todayWeekday = weekdayOf(today);

  if (doctor.status === 'error') {
    return (
      <View style={styles.screen}>
        <TopBar />
        <ErrorState onRetry={doctor.reload} />
      </View>
    );
  }

  if (doctor.status === 'ready' && doctor.data === null) {
    return (
      <View style={styles.screen}>
        <TopBar />
        <EmptyState
          icon={Users}
          title={t.doctor.notFoundTitle}
          text={t.doctor.notFoundText}
          actionLabel={t.menu.about}
          onAction={() => router.replace('/about')}
        />
      </View>
    );
  }

  const data = doctor.data ?? null;
  const doctorServices = data ? (services.data ?? []).filter((s) => data.serviceIds.includes(s.id)) : [];

  return (
    <View style={styles.screen}>
      <TopBar title={data ? l(data.name) : undefined} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {data ? (
          <View style={styles.header}>
            <Monogram id={data.id} name={l(data.name)} size={88} />
            <View style={styles.headerText}>
              <AppText variant="h1" accessibilityRole="header">
                {l(data.name)}
              </AppText>
              <AppText variant="bodyMedium" color="hero">
                {l(data.role)}
              </AppText>
              <AppText variant="body" color="textSecondary">
                {l(data.focus)}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <Skeleton width={88} height={88} rounded={radius.pill} />
            <Skeleton width="60%" height={28} />
            <Skeleton width="40%" height={18} />
          </View>
        )}

        {data ? (
          <>
            <DemoNotice compact />

            <Card style={styles.languages}>
              <View style={styles.languagesIcon}>
                <Languages size={iconSize.md} color={colors.hero} />
              </View>
              <View style={styles.flex}>
                <AppText variant="caption" color="textSecondary">
                  {t.doctor.languages}
                </AppText>
                <AppText variant="title">{t.languages.speaks(data.languages)}</AppText>
              </View>
            </Card>

            <View style={styles.section}>
              <AppText variant="h3" accessibilityRole="header">
                {t.doctor.days}
              </AppText>
              <View style={styles.days}>
                {WEEKDAYS.map((day) => {
                  const hours = data.schedule[day].hours;
                  const isToday = day === todayWeekday;
                  return (
                    <View
                      key={day}
                      accessible
                      accessibilityLabel={`${t.dates.weekdays[day]}: ${
                        hours ? `${hours.start}–${hours.end}` : t.doctor.dayOff
                      }`}
                      style={[styles.day, hours ? styles.dayActive : null, isToday ? styles.dayToday : null]}>
                      <AppText variant="caption" color={hours ? 'hero' : 'textMuted'} maxFontSizeMultiplier={1}>
                        {t.dates.weekdaysShort[day]}
                      </AppText>
                      <AppText variant="tab" color={hours ? 'textPrimary' : 'textMuted'} maxFontSizeMultiplier={1}>
                        {hours ? hours.start : '—'}
                      </AppText>
                      <AppText variant="tab" color={hours ? 'textPrimary' : 'textMuted'} maxFontSizeMultiplier={1}>
                        {hours ? hours.end : ''}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="h3" accessibilityRole="header">
                {t.doctor.services}
              </AppText>
              {services.status === 'ready' ? (
                <Card padded={false}>
                  {doctorServices.map((service, index) => (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      divider={index > 0}
                      onPress={() => router.push(`/service/${service.id}`)}
                    />
                  ))}
                </Card>
              ) : (
                <SkeletonList rows={3} />
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
      {data ? (
        <StickyFooter>
          <Button
            label={t.doctor.book}
            icon={CalendarPlus}
            variant="accent"
            onPress={() => router.push(start({ doctorId: data.id }))}
          />
        </StickyFooter>
      ) : null}
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
    gap: spacing.md,
  },
  headerText: {
    gap: spacing.xxs,
  },
  languages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languagesIcon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  days: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
  },
  dayActive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  dayToday: {
    borderColor: colors.hero,
    borderWidth: 2,
  },
});
