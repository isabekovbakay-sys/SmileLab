import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToothMark } from '@/components/brand/ToothMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { House, Phone } from '@/components/ui/icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useContactActions } from '@/hooks/useContactActions';
import { useI18n } from '@/i18n';
import { colors, spacing } from '@/theme';

export default function NotFoundScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const contact = useContactActions();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <ScreenContainer padded style={styles.column} outerStyle={styles.grow}>
        <View style={styles.center}>
          <ToothMark size={88} tone="dark" />
          <AppText variant="h1" align="center" accessibilityRole="header">
            {t.notFound.title}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {t.notFound.text}
          </AppText>
        </View>
        <View style={styles.actions}>
          <Button testID="notfound-home" label={t.common.toHome} icon={House} onPress={() => router.replace('/')} />
          {contact.available.call ? (
            <Button label={contact.phoneLabel} icon={Phone} variant="secondary" onPress={contact.call} />
          ) : null}
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
  },
});
