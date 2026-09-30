import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/brand/BrandBackdrop';
import { Fade } from '@/components/brand/Fade';
import { Logo } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useStatusBarStyle } from '@/hooks/useStatusBarStyle';
import { useI18n } from '@/i18n';
import { dictionaries } from '@/i18n/dictionaries';
import { useSettings } from '@/state/SettingsProvider';
import { layout, spacing } from '@/theme';
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
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
      <BrandBackdrop variant="deep" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: layout.gutter,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
