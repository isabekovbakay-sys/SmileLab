import type { ViewStyle } from 'react-native';

/** Тени используются редко: только у плавающих слоёв (тост, нижний лист, таб-бар). */
export const shadows = {
  floating: {
    shadowColor: '#0A1F22',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bar: {
    shadowColor: '#0A1F22',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;
