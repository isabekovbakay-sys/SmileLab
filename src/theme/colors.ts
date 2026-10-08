/**
 * Цветовые токены. Контраст основных пар проверяется тестом tests/contrast.test.ts (WCAG AA).
 * Палитра: глубокая бирюза (фирменный цвет), тёплый светлый фон, коралловый акцент.
 */
export const colors = {
  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEBE3',
  surfaceTinted: '#E4EFED',

  hero: '#0F4C53',
  heroDeep: '#0A363B',
  heroLight: '#1B6A72',
  heroLine: '#3F8F96',

  primary: '#10282C',
  primaryPressed: '#1E3B40',
  onPrimary: '#FFFFFF',

  accent: '#FF7A59',
  accentSoft: '#FFE6DE',
  onAccent: '#10282C',

  textPrimary: '#16252A',
  textSecondary: '#44565A',
  textMuted: '#5B696C',
  textOnHero: '#FFFFFF',
  textOnHeroMuted: '#CFE3E1',
  textLink: '#0F5E66',

  border: '#E2DDD3',
  borderStrong: '#C9C1B3',
  focus: '#0F5E66',

  success: '#1D7048',
  successSoft: '#DFF1E6',
  warning: '#8A5300',
  warningSoft: '#FBEBD0',
  error: '#B3261E',
  errorSoft: '#FBE4E1',

  scrim: 'rgba(10, 30, 33, 0.48)',
  heroScrim: 'rgba(10, 54, 59, 0.72)',
  heroScrimClear: 'rgba(10, 54, 59, 0)',
  skeleton: '#E6E1D7',
  white: '#FFFFFF',

  /** Иллюстрация импланта. */
  metal: '#8FA3A6',
  metalHighlight: '#E9F0F0',
  metalShadow: '#6E8488',
  metalThread: '#5E7478',
  crownShade: '#E6ECEA',

  brandWhatsApp: '#1B8F4B',
  brandTelegram: '#1C7EC0',

  /** Фоны монограмм врачей. */
  monogram: ['#E4EFED', '#FFE6DE', '#E8E4F4', '#F5EBD6'],
  monogramInk: ['#0F4C53', '#9A3B22', '#43377A', '#6F4B09'],
} as const;

export type ColorToken = {
  [K in keyof typeof colors]: (typeof colors)[K] extends string ? K : never;
}[keyof typeof colors];
