import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Variant = 'surface' | 'muted' | 'tinted' | 'hero' | 'dark';

interface CardProps extends ViewProps {
  variant?: Variant;
  padded?: boolean;
}

/** Спокойная карточка: без теней, тонкая граница только у белой. */
export function Card({ variant = 'surface', padded = true, style, ...rest }: CardProps) {
  return <View style={[styles.base, variants[variant], padded ? styles.padded : null, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.md,
  },
});

const variants = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  muted: { backgroundColor: colors.surfaceMuted },
  tinted: { backgroundColor: colors.surfaceTinted },
  hero: { backgroundColor: colors.hero },
  dark: { backgroundColor: colors.primary },
});
