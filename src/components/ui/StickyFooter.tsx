import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme';

import { ScreenContainer } from './ScreenContainer';

/** Закреплённые внизу кнопки: главное действие не нужно искать прокруткой. */
export function StickyFooter({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.xs }, style]}>
      <ScreenContainer style={styles.inner}>{children}</ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.gutter,
  },
  inner: {
    gap: spacing.xs,
  },
});
