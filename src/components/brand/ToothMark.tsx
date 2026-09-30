import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/** Контур зуба на сетке 48×48 — основа логотипа и иконки приложения. */
export const TOOTH_PATH =
  'M24 9.5C21 9.5 18.6 7 14.2 7 8.6 7 5 11.4 5 17.4c0 6.8 3 10 4.4 16.4 1.2 5.6 2.2 9.2 5.2 9.2 3.2 0 3.8-4.4 4.8-8.6.8-3.4 2.2-5 4.6-5s3.8 1.6 4.6 5c1 4.2 1.6 8.6 4.8 8.6 3 0 4-3.6 5.2-9.2C40 27.4 43 24.2 43 17.4 43 11.4 39.4 7 33.8 7 29.4 7 27 9.5 24 9.5Z';
export const SMILE_PATH = 'M15.5 18.5Q24 25.5 32.5 18.5';

interface ToothMarkProps {
  size?: number;
  /** light — белый зуб (на фирменном фоне), dark — бирюзовый зуб (на светлом). */
  tone?: 'light' | 'dark';
  /** С подложкой-скруглённым квадратом (как иконка приложения). */
  tile?: boolean;
}

export function ToothMark({ size = 32, tone = 'light', tile = false }: ToothMarkProps) {
  const toothColor = tile || tone === 'light' ? colors.white : colors.hero;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {tile ? <Rect x={0} y={0} width={48} height={48} rx={12} fill={colors.hero} /> : null}
      <Path
        d={TOOTH_PATH}
        fill={toothColor}
        transform={tile ? 'translate(7.2 7.2) scale(0.7)' : undefined}
      />
      <Path
        d={SMILE_PATH}
        stroke={colors.accent}
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
        transform={tile ? 'translate(7.2 7.2) scale(0.7)' : undefined}
      />
    </Svg>
  );
}
