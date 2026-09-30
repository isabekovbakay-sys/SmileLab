import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { TopBar } from '@/components/ui/TopBar';
import { clinicConfig } from '@/config/clinic';
import { useI18n } from '@/i18n';
import { colors, layout, spacing } from '@/theme';
import { formatInternationalPhone } from '@/utils/phone';

/** Политика конфиденциальности. Тот же текст генерирует docs/privacy-policy.html (npm run privacy:html). */
export default function PrivacyScreen() {
  const { t } = useI18n();
  const sections = t.privacy.sections({
    clinic: clinicConfig.name,
    phone: formatInternationalPhone(clinicConfig.contacts.phone),
    email: clinicConfig.contacts.email,
  });
  return (
    <View style={styles.screen}>
      <TopBar title={t.privacy.title} />
      <ScrollView contentContainerStyle={styles.content}>
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
    padding: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.xs,
  },
});
