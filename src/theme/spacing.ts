/** Шкала отступов кратна 4. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const layout = {
  /** Боковой отступ экрана. */
  gutter: 20,
  /** Минимальная зона нажатия. */
  touch: 48,
  /** Плитка с иконкой в строке списка. */
  iconTile: 40,
  tabBarHeight: 64,
  topBarHeight: 56,
  buttonHeight: 56,
  buttonHeightCompact: 48,
  /** Максимальная ширина контента на планшетах и в альбомной ориентации. */
  maxContentWidth: 560,
  /** Предел высоты героя главной. */
  heroMaxHeight: 520,
  /** Высота героя главной — доля от высоты экрана. */
  heroRatio: 0.6,
  shortScreen: 720,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  strong: 2,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  hero: 44,
} as const;

export const opacity = {
  disabled: 0.45,
  pressed: 0.7,
  subtle: 0.14,
} as const;
