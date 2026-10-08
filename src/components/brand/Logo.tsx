import { StyleSheet, Text, View } from 'react-native';

import { clinicConfig } from '@/config/clinic';
import { colors, fontFamily, spacing } from '@/theme';

import { ToothMark } from './ToothMark';

interface LogoProps {
  tone?: 'light' | 'dark';
  size?: 'md' | 'lg';
}

const sizes = {
  md: { mark: 30, font: 19 },
  lg: { mark: 56, font: 32 },
} as const;

/** Знак-зуб с улыбкой + название клиники («Smile» + «Lab» акцентом). */
export function Logo({ tone = 'light', size = 'md' }: LogoProps) {
  const s = sizes[size];
  const name = clinicConfig.name;
  const split = name.endsWith('Lab') ? name.length - 3 : name.length;
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={name}>
      <ToothMark size={s.mark} tone={tone} />
      <Text
        maxFontSizeMultiplier={1}
        style={[styles.word, { fontSize: s.font, color: tone === 'light' ? colors.textOnHero : colors.textPrimary }]}>
        {name.slice(0, split)}
        <Text style={{ color: tone === 'light' ? colors.accent : colors.hero }}>{name.slice(split)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  word: {
    fontFamily: fontFamily.bold,
    letterSpacing: -0.6,
  },
});
