import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/brand/BrandBackdrop';
import { Fade } from '@/components/brand/Fade';
import { Logo } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useStatusBarStyle } from '@/hooks/useStatusBarStyle';
import { useI18n } from '@/i18n';
import { dictionaries } from '@/i18n/dictionaries';
import { useSettings } from '@/state/SettingsProvider';
import { colors, spacing } from '@/theme';
import type { Language } from '@/types/domain';

/** Выбор языка при первом запуске. */
export default function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding } = useSettings();
  const insets = useSafeAreaInsets();
  useStatusBarStyle('light');

  const choose = (language: Language) => {
    completeOnboarding(language);
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
      bounces={false}>
      <BrandBackdrop variant="deep" />
      <ScreenContainer padded style={styles.column} outerStyle={styles.grow}>
        <Fade style={styles.center} fromScale={0.94}>
          <Logo tone="light" size="lg" />
          <AppText variant="bodyMedium" color="textOnHeroMuted" align="center">
            {t.common.clinicKind}
          </AppText>
        </Fade>
        <Fade delay={200} style={styles.actions}>
          <AppText variant="h3" color="textOnHero" align="center" accessibilityRole="header">
            {t.onboarding.title}
          </AppText>
          <Button
            testID="onboarding-ky"
            label={dictionaries.ky.languageName}
            variant="onHero"
            onPress={() => choose('ky')}
          />
          <Button
            testID="onboarding-ru"
            label={dictionaries.ru.languageName}
            variant="onHero"
            onPress={() => choose('ru')}
          />
        </Fade>
      </ScreenContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.heroDeep,
  },
  content: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  column: {
    flexGrow: 1,
    gap: spacing.xl,
  },
  center: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
