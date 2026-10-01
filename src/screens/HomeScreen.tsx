import { router } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisplayTitle } from '@/components/brand/DisplayTitle';
import { Fade } from '@/components/brand/Fade';
import { HeroMedia } from '@/components/brand/HeroMedia';
import { ImplantComposition } from '@/components/brand/ImplantArt';
import { Logo } from '@/components/brand/Logo';
import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { ClinicStatusLine } from '@/components/domain/ClinicStatusLine';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { DoctorCard } from '@/components/domain/DoctorCard';
import { QuickActions } from '@/components/domain/QuickActions';
import { ServiceRow } from '@/components/domain/ServiceRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ArrowRight, CalendarPlus, Menu, MessageCircle } from '@/components/ui/icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateViews';
import { clinicConfig } from '@/config/clinic';
import { useAppointmentGroups } from '@/hooks/useAppointmentGroups';
import { useClinicContent, useDoctors, useServices } from '@/hooks/useClinicData';
import { useContactActions } from '@/hooks/useContactActions';
import { useNow } from '@/hooks/useNow';
import { useStatusBarStyle } from '@/hooks/useStatusBarStyle';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { useMenu } from '@/state/MenuProvider';
import { layout, spacing } from '@/theme';

export default function HomeScreen() {
  const { t, l, language } = useI18n();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const content = useClinicContent();
  const services = useServices();
  const doctors = useDoctors();
  const { upcoming } = useAppointmentGroups();
  const now = useNow();
  const { start } = useBooking();
  const { openMenu } = useMenu();
  const contact = useContactActions();
  useStatusBarStyle('light');

  const compact = height < layout.shortScreen;
  const featured = services.data?.filter((s) => s.featured) ?? [];
  const consultation = services.data?.find((s) => s.isConsultation);
  const next = upcoming[0];
  const promo = content.data?.implantPromo;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { minHeight: Math.round(height * layout.heroRatio) }]}>
        <HeroMedia video={clinicConfig.media.heroVideo} />
        <Fade distance={-8} style={[styles.heroTop, { paddingTop: insets.top + spacing.xs }]}>
          <Logo tone="light" />
          <IconButton icon={Menu} accessibilityLabel={t.a11y.openMenu} onPress={openMenu} variant="onHero" testID="menu-open" />
        </Fade>
        <View style={styles.heroBody}>
          <Fade delay={120} fromScale={0.96} style={styles.heroText}>
            <AppText variant="overline" color="textOnHeroMuted">
              {t.common.clinicKind}
            </AppText>
            {content.data ? (
              <DisplayTitle text={l(content.data.heroTitle)} maxSize={compact ? 36 : 42} />
            ) : (
              <View style={styles.titleSkeleton}>
                <Skeleton width="80%" height={36} />
                <Skeleton width="60%" height={36} />
              </View>
            )}
            {content.data ? (
              <AppText variant={compact ? 'bodySm' : 'body'} color="textOnHeroMuted" numberOfLines={3}>
                {l(content.data.heroSubtitle)}
              </AppText>
            ) : null}
          </Fade>
          <Fade delay={280}>
            <Button
              testID="home-book"
              label={t.common.bookVisit}
              icon={CalendarPlus}
              variant="accent"
              onPress={() => router.push(start())}
            />
          </Fade>
        </View>
      </View>

      <View style={styles.body}>
        <QuickActions />
        <ClinicStatusLine />
        {next ? (
          <View style={styles.section}>
            <SectionHeader title={t.home.nextAppointment} />
            <AppointmentCard
              appointment={next}
              service={services.data?.find((s) => s.id === next.serviceId)}
              doctor={doctors.data?.find((d) => d.id === next.doctorId)}
              now={now}
              onPress={() => router.push(`/appointment/${next.id}`)}
            />
          </View>
        ) : null}

        <DemoNotice />

        <View style={styles.section}>
          <SectionHeader
            title={t.home.servicesTitle}
            actionLabel={t.home.servicesAll}
            onAction={() => router.navigate('/services')}
          />
          {services.status === 'ready' ? (
            <Card padded={false}>
              {featured.map((service, index) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  divider={index > 0}
                  onPress={() => router.push(`/service/${service.id}`)}
                />
              ))}
            </Card>
          ) : services.status === 'error' ? (
            <ErrorState onRetry={services.reload} />
          ) : (
            <SkeletonList rows={3} />
          )}
        </View>

        {promo ? (
          <Card variant="hero" style={styles.promo}>
            <ImplantComposition words={promo.artWords[language]} height={compact ? 150 : 180} />
            <AppText variant="h2" color="textOnHero">
              {l(promo.title)}
            </AppText>
            <AppText variant="body" color="textOnHeroMuted">
              {l(promo.text)}
            </AppText>
            <Button
              label={t.home.promoMore}
              iconRight={ArrowRight}
              variant="onHero"
              size="md"
              onPress={() => router.push(`/service/${promo.serviceId}`)}
            />
          </Card>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title={t.home.doctorsTitle} actionLabel={t.common.all} onAction={() => router.push('/about')} />
          {doctors.status === 'ready' ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}>
              {doctors.data.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} onPress={() => router.push(`/doctor/${doctor.id}`)} />
              ))}
            </ScrollView>
          ) : doctors.status === 'error' ? (
            <ErrorState onRetry={doctors.reload} />
          ) : (
            <SkeletonList rows={2} />
          )}
        </View>

        <Card variant="dark" style={styles.start}>
          <AppText variant="h2" color="onPrimary">
            {t.home.startTitle}
          </AppText>
          <AppText variant="body" color="textOnHeroMuted">
            {t.home.startText}
          </AppText>
          <Button
            label={t.home.startConsult}
            icon={CalendarPlus}
            variant="accent"
            onPress={() => router.push(start(consultation ? { serviceId: consultation.id } : {}))}
          />
          <Button
            label={t.home.startAsk}
            icon={MessageCircle}
            variant="onHeroOutline"
            onPress={() => contact.whatsapp(t.home.askMessage)}
          />
        </Card>
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
  hero: {
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: layout.gutter,
    paddingRight: spacing.sm,
  },
  heroBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  heroText: {
    gap: spacing.xs,
  },
  titleSkeleton: {
    gap: spacing.xs,
    opacity: 0.3,
  },
  body: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  section: {
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  promo: {
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  carousel: {
    marginHorizontal: -layout.gutter,
  },
  carouselContent: {
    paddingHorizontal: layout.gutter,
    gap: spacing.sm,
  },
  start: {
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
});
