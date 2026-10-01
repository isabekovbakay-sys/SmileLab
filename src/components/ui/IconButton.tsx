import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, iconSize, layout, radius } from '@/theme';

import type { IconComponent } from './icons';
import { PressableScale } from './PressableScale';

type Variant = 'plain' | 'surface' | 'onHero';

interface IconButtonProps {
  icon: IconComponent;
  /** Обязательно: экранный диктор читает только это. */
  accessibilityLabel: string;
  onPress: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({ icon: Icon, accessibilityLabel, onPress, variant = 'plain', style, testID }: IconButtonProps) {
  const color = variant === 'onHero' ? colors.textOnHero : colors.textPrimary;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={[styles.base, variantStyles[variant], style]}>
      <Icon size={iconSize.lg} color={color} strokeWidth={2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.touch,
    height: layout.touch,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const variantStyles = StyleSheet.create({
  plain: {},
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  onHero: {
    backgroundColor: colors.heroScrim,
  },
});
