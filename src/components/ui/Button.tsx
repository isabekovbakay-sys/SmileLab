import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, iconSize, layout, radius, spacing, type ColorToken } from '@/theme';

import { AppText } from './AppText';
import type { IconComponent } from './icons';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'onHero' | 'onHeroOutline' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md';
  icon?: IconComponent;
  iconRight?: IconComponent;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const palette: Record<ButtonVariant, { bg: ColorToken | null; fg: ColorToken; border: ColorToken | null }> = {
  primary: { bg: 'primary', fg: 'onPrimary', border: null },
  accent: { bg: 'accent', fg: 'onAccent', border: null },
  secondary: { bg: 'surface', fg: 'textPrimary', border: 'borderStrong' },
  ghost: { bg: null, fg: 'textLink', border: null },
  onHero: { bg: 'white', fg: 'hero', border: null },
  onHeroOutline: { bg: null, fg: 'textOnHero', border: 'heroLine' },
  danger: { bg: 'surface', fg: 'error', border: 'borderStrong' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const p = palette[variant];
  const fg = colors[p.fg];
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.base,
        { minHeight: size === 'lg' ? layout.buttonHeight : layout.buttonHeightCompact },
        p.bg ? { backgroundColor: colors[p.bg] } : null,
        p.border ? { borderWidth: 1, borderColor: colors[p.border] } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={iconSize.md} color={fg} strokeWidth={2.2} /> : null}
          <AppText variant="button" color={p.fg} align="center" numberOfLines={2} style={styles.label}>
            {label}
          </AppText>
          {IconRight ? <IconRight size={iconSize.md} color={fg} strokeWidth={2.2} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    flexShrink: 1,
  },
});
