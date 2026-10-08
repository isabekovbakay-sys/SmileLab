import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/theme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Боковые отступы экрана (gutter). */
  padded?: boolean;
  /** Стиль внутренней колонки (gap, отступы сверху и снизу). */
  style?: StyleProp<ViewStyle>;
  /** Стиль внешней полосы на всю ширину (фон). */
  outerStyle?: StyleProp<ViewStyle>;
}

/**
 * Колонка контента по центру шириной до 560 dp. На планшетах и в альбомной ориентации
 * (Android 16 игнорирует блокировку портрета на экранах от 600 dp) текст не растягивается,
 * а боковые безопасные зоны (вырез камеры, панель навигации сбоку) не перекрывают контент.
 */
export function ScreenContainer({ children, padded = false, style, outerStyle }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.outer, { paddingLeft: insets.left, paddingRight: insets.right }, outerStyle]}>
      <View style={[styles.inner, padded ? styles.padded : null, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
  },
  padded: {
    paddingHorizontal: layout.gutter,
  },
});
