import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { BrandBackdrop } from '@/components/brand/BrandBackdrop';
import { ImplantComposition } from '@/components/brand/ImplantArt';
import { ServiceGlyph } from '@/components/brand/ServiceGlyph';
import { DoctorRow } from '@/components/domain/DoctorCard';
import { Accordion } from '@/components/ui/Accordion';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarPlus, Check, ClipboardList, Clock, Info, Stethoscope } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { TopBar } from '@/components/ui/TopBar';
import { clinicConfig } from '@/config/clinic';
import { useClinicContent, useDoctors, useService } from '@/hooks/useClinicData';
import { useContactActions } from '@/hooks/useContactActions';
import { useStatusBarStyle } from '@/hooks/useStatusBarStyle';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import { useNativeDriver } from '@/utils/animation';

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l, language } = useI18n();
  const insets = useSafeAreaInsets();
  const service = useService(id);
  const doctors = useDoctors();
  const content = useClinicContent();
  const { start } = useBooking();
  const contact = useContactActions();
  const [scrollY] = useState(() => new Animated.Value(0));
  useStatusBarStyle('light');

  if (service.status === 'error') {
    return (
      <View style={styles.screen}>
        <TopBar />
        <ErrorState onRetry={service.reload} />
      </View>
    );
  }

  if (service.status === 'ready' && service.data === null) {
    return (
      <View style={styles.screen}>
        <TopBar />
        <EmptyState
          icon={ClipboardList}
          title={t.service.notFoundTitle}
          text={t.service.notFoundText}
          actionLabel={t.home.servicesAll}
          onAction={() => router.navigate('/services')}
        />
      </View>
    );
  }

  const data = service.data ?? null;
  const name = data ? l(data.name) : '';
  const serviceDoctors = data ? (doctors.data ?? []).filter((d) => d.serviceIds.includes(data.id)) : [];
  const artWords = content.data?.implantPromo.artWords[language];
  const askChannel = clinicConfig.booking.requestChannel;

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver })}>
        <View style={[styles.hero, { paddingTop: insets.top + layout.topBarHeight + spacing.xs }]}>
          <BrandBackdrop />
          {data ? (
            <>
              {data.glyph === 'implant' && artWords ? (
                <ImplantComposition words={artWords} height={220} />
              ) : (
                <View style={styles.glyphTile}>
                  <ServiceGlyph glyph={data.glyph} size={iconSize.hero} color={colors.white} accent={colors.accent} />
                </View>
              )}
              <AppText variant="h1" color="textOnHero" accessibilityRole="header">
                {name}
              </AppText>
              <AppText variant="body" color="textOnHeroMuted">
                {l(data.summary)}
              </AppText>
            </>
          ) : (
            <View style={styles.heroSkeleton}>
              <Skeleton width={72} height={72} rounded={radius.lg} />
              <Skeleton width="85%" height={32} />
              <Skeleton width="60%" height={18} />
            </View>
          )}
        </View>

        {data ? (
          <View style={styles.body}>
            <View style={styles.facts}>
              <Card style={styles.fact}>
                <AppText variant="caption" color="textSecondary">
                  {t.service.price}
                </AppText>
                <AppText variant="h3">
                  {data.priceFrom === null ? t.common.priceOnConsultation : t.common.priceFrom(data.priceFrom)}
                </AppText>
              </Card>
              <Card style={styles.fact}>
                <AppText variant="caption" color="textSecondary">
                  {t.service.duration}
                </AppText>
                <View style={styles.factRow}>
                  <Clock size={iconSize.md} color={colors.hero} />
                  <AppText variant="h3">{t.common.duration(data.durationMin)}</AppText>
                </View>
              </Card>
            </View>

            <Section title={t.service.about}>
              <AppText variant="body" color="textSecondary">
                {l(data.description)}
              </AppText>
            </Section>

            {data.highlights.length ? (
              <Section title={t.service.included}>
                <Card style={styles.list}>
                  {data.highlights.map((item) => (
                    <View key={item.ru} style={styles.listRow}>
                      <View style={styles.check}>
                        <Check size={iconSize.sm} color={colors.hero} strokeWidth={2.6} />
                      </View>
                      <AppText variant="body" style={styles.flex}>
                        {l(item)}
                      </AppText>
                    </View>
                  ))}
                </Card>
              </Section>
            ) : null}

            {data.process.length ? (
              <Section title={t.service.process} note={t.service.processCount(data.process.length)}>
                <View>
                  {data.process.map((step, index) => (
                    <View key={step.title.ru} style={styles.step}>
                      <View style={styles.stepRail}>
                        <View style={styles.stepNumber}>
                          <AppText variant="caption" color="onPrimary">
                            {index + 1}
                          </AppText>
                        </View>
                        {index < data.process.length - 1 ? <View style={styles.stepLine} /> : null}
                      </View>
                      <View style={styles.stepText}>
                        <AppText variant="title">{l(step.title)}</AppText>
                        <AppText variant="bodySm" color="textSecondary">
                          {l(step.text)}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}

            {data.expectations.length ? (
              <Section title={t.service.expectations}>
                <Card variant="tinted" style={styles.list}>
                  {data.expectations.map((item) => (
                    <View key={item.ru} style={styles.listRow}>
                      <Info size={iconSize.md} color={colors.hero} />
                      <AppText variant="body" style={styles.flex}>
                        {l(item)}
                      </AppText>
                    </View>
                  ))}
                </Card>
              </Section>
            ) : null}

            {data.faq.length ? (
              <Section title={t.service.faq}>
                <Accordion items={data.faq.map((f) => ({ id: f.id, title: l(f.question), content: l(f.answer) }))} />
              </Section>
            ) : null}

            {serviceDoctors.length ? (
              <Section title={t.service.doctors}>
                <Card padded={false}>
                  {serviceDoctors.map((doctor, index) => (
                    <DoctorRow
                      key={doctor.id}
                      doctor={doctor}
                      divider={index > 0}
                      onPress={() => router.push(`/doctor/${doctor.id}`)}
                    />
                  ))}
                </Card>
              </Section>
            ) : null}

            {content.data ? (
              <View style={styles.disclaimer}>
                <Stethoscope size={iconSize.sm} color={colors.textMuted} />
                <AppText variant="caption" color="textMuted" style={styles.flex}>
                  {l(content.data.medicalDisclaimer)}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </Animated.ScrollView>

      <TopBar overlay scrollY={scrollY} title={name} solidAt={200} />

      {data ? (
        <StickyFooter>
          <View style={styles.footerRow}>
            <Button
              label={t.service.ask}
              icon={askChannel === 'whatsapp' ? WhatsAppGlyph : TelegramGlyph}
              variant="secondary"
              style={styles.footerAsk}
              accessibilityLabel={`${t.service.ask}: ${askChannel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}`}
              onPress={() =>
                askChannel === 'whatsapp'
                  ? contact.whatsapp(t.service.askMessage(name))
                  : contact.telegram(t.service.askMessage(name))
              }
            />
            <Button
              testID="service-book"
              label={t.service.book}
              icon={CalendarPlus}
              variant="accent"
              style={styles.footerBook}
              onPress={() => router.push(start({ serviceId: data.id }))}
            />
          </View>
        </StickyFooter>
      ) : null}
    </View>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="h3" accessibilityRole="header" style={styles.flex}>
          {title}
        </AppText>
        {note ? (
          <AppText variant="caption" color="textSecondary">
            {note}
          </AppText>
        ) : null}
      </View>
      {children}
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
    paddingBottom: spacing.xxl,
  },
  hero: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  glyphTile: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.heroLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroSkeleton: {
    gap: spacing.sm,
    opacity: 0.3,
    paddingVertical: spacing.md,
  },
  body: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    gap: spacing.xl,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  facts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fact: {
    flex: 1,
    gap: spacing.xxs,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  check: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepRail: {
    alignItems: 'center',
    width: spacing.xxl,
  },
  stepNumber: {
    width: spacing.xxl - spacing.xxs,
    height: spacing.xxl - spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.xxs,
  },
  stepText: {
    flex: 1,
    gap: 2,
    paddingBottom: spacing.lg,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  footerAsk: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  footerBook: {
    flex: 1.3,
  },
});
