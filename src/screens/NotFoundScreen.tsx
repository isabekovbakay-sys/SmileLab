import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToothMark } from '@/components/brand/ToothMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { House, Phone } from '@/components/ui/icons';
import { useContactActions } from '@/hooks/useContactActions';
import { useI18n } from '@/i18n';
import { colors, layout, spacing } from '@/theme';

export default function NotFoundScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const contact = useContactActions();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.lg }]}>
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
        <Button label={contact.phoneLabel} icon={Phone} variant="secondary" onPress={contact.call} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.gutter,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
