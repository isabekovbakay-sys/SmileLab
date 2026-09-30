import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

interface TypeStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  /** Насколько системный крупный шрифт может увеличить стиль, не ломая вёрстку. */
  maxFontSizeMultiplier: number;
}

export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.4,
    maxFontSizeMultiplier: 1,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    maxFontSizeMultiplier: 1.2,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.4,
    maxFontSizeMultiplier: 1.25,
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.2,
    maxFontSizeMultiplier: 1.3,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    maxFontSizeMultiplier: 1.35,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    maxFontSizeMultiplier: 1.5,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    maxFontSizeMultiplier: 1.5,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    maxFontSizeMultiplier: 1.5,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    maxFontSizeMultiplier: 1.4,
  },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    maxFontSizeMultiplier: 1.3,
  },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    maxFontSizeMultiplier: 1.3,
  },
  tab: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    maxFontSizeMultiplier: 1.2,
  },
  numeral: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'],
    maxFontSizeMultiplier: 1.15,
  },
} satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;
