import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { useMenu } from '@/state/MenuProvider';
import { layout, spacing } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { Menu } from './icons';

/** Крупный заголовок вкладки с кнопкой меню. */
export function TabHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useI18n();
  const { openMenu } = useMenu();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.row}>
        <AppText variant="h1" style={styles.title} accessibilityRole="header">
          {title}
        </AppText>
        <IconButton icon={Menu} accessibilityLabel={t.a11y.openMenu} onPress={openMenu} variant="surface" />
      </View>
      {subtitle ? (
        <AppText variant="bodySm" color="textSecondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touch,
  },
  title: {
    flex: 1,
  },
});
