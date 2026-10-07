import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Info } from '@/components/ui/icons';
import { useDemoStrings } from '@/i18n';
import { colors, iconSize, radius, spacing } from '@/theme';

/** Честная плашка «Демо-режим». Есть только в демо-сборке (EXPO_PUBLIC_DEMO=1). */
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const demo = useDemoStrings();
  if (!demo) return null;
  return (
    <View style={styles.root} accessible accessibilityLabel={`${demo.badge}. ${demo.notice}`}>
      <Info size={iconSize.md} color={colors.warning} />
      <AppText variant={compact ? 'caption' : 'bodySm'} color="warning" style={styles.text}>
        {demo.notice}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
