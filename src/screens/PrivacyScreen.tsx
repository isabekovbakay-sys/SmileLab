import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { TopBar } from '@/components/ui/TopBar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/i18n';
import { privacyParams } from '@/services/privacy';
import { colors, layout, spacing } from '@/theme';

/** Политика конфиденциальности. Тот же текст генерирует docs/privacy-policy.html (npm run privacy:html). */
export default function PrivacyScreen() {
  const { t } = useI18n();
  const sections = t.privacy.sections(privacyParams());

  return (
    <View style={styles.screen}>
      <TopBar title={t.privacy.title} />
      <ScrollView>
        <ScreenContainer padded style={styles.content}>
          <View style={styles.header}>
            <AppText variant="h1" accessibilityRole="header">
              {t.privacy.title}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {t.privacy.updated}
            </AppText>
          </View>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <AppText variant="h3" accessibilityRole="header">
                {section.title}
              </AppText>
              <AppText variant="body" color="textSecondary" selectable>
                {section.body}
              </AppText>
            </View>
          ))}
        </ScreenContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.xs,
  },
});
