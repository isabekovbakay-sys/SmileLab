import { Easing } from 'react-native';

export const motion = {
  duration: {
    fast: 160,
    base: 240,
    slow: 380,
    hero: 620,
  },
  easing: {
    out: Easing.bezier(0.2, 0.8, 0.2, 1),
    inOut: Easing.bezier(0.4, 0, 0.2, 1),
  },
  spring: {
    press: { speed: 40, bounciness: 0 },
    release: { speed: 22, bounciness: 6 },
  },
  pressScale: 0.97,
  toastMs: 3600,
} as const;
