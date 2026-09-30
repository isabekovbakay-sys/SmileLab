import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/hooks/useSvgId';
import { colors } from '@/theme';

import { TOOTH_PATH } from './ToothMark';

/**
 * Фирменная заставка: градиент + «улыбчивые» дуги и крупный контур зуба.
 * Лежит под видео всегда: видна при загрузке, ошибке, офлайн и с reduced motion.
 * SVG — в absoluteFill-обёртке: проценты у Svg с padding родителя не доходят до краёв на Android/iOS.
 */
export function BrandBackdrop({ variant = 'hero' }: { variant?: 'hero' | 'deep' }) {
  const gradientId = useSvgId('backdrop');
  const top = variant === 'hero' ? colors.heroLight : colors.hero;
  const bottom = variant === 'hero' ? colors.heroDeep : colors.heroDeep;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="0.55" stopColor={colors.hero} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={700} fill={`url(#${gradientId})`} />
        <Path d="M-60 250 Q200 470 460 250" stroke={colors.heroLine} strokeOpacity={0.35} strokeWidth={1.5} fill="none" />
        <Path d="M-60 320 Q200 560 460 320" stroke={colors.heroLine} strokeOpacity={0.22} strokeWidth={1.5} fill="none" />
        <Path d="M-60 390 Q200 650 460 390" stroke={colors.heroLine} strokeOpacity={0.14} strokeWidth={1.5} fill="none" />
        <Path
          d={TOOTH_PATH}
          transform="translate(230 40) scale(5.2)"
          stroke={colors.white}
          strokeOpacity={0.09}
          strokeWidth={0.35}
          fill={colors.white}
          fillOpacity={0.03}
        />
      </Svg>
    </View>
  );
}
