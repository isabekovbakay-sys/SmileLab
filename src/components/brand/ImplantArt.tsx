import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useSvgId } from '@/hooks/useSvgId';
import { colors } from '@/theme';

/** Имплант: коронка, абатмент и винт с резьбой. viewBox 120×260. */
export function ImplantSvg({ height }: { height: number }) {
  const metal = useSvgId('metal');
  const crown = useSvgId('crown');
  const width = (height * 120) / 260;
  return (
    <Svg width={width} height={height} viewBox="0 0 120 260" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id={metal} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.metal} />
          <Stop offset="0.45" stopColor={colors.metalHighlight} />
          <Stop offset="1" stopColor={colors.metalShadow} />
        </LinearGradient>
        <LinearGradient id={crown} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.white} />
          <Stop offset="1" stopColor={colors.crownShade} />
        </LinearGradient>
      </Defs>
      <Path
        d="M60 22c-8 0-13-8-27-8C17 14 8 26 8 42c0 16 8 26 12 38h80c4-12 12-22 12-38 0-16-9-28-25-28-14 0-19 8-27 8Z"
        fill={`url(#${crown})`}
      />
      <Path d="M34 40q26 14 52 0" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Rect x={40} y={80} width={40} height={26} rx={4} fill={`url(#${metal})`} />
      <Path d="M36 106h48l-6 138c-.4 8-6 12-18 12s-17.6-4-18-12Z" fill={`url(#${metal})`} />
      <G stroke={colors.metalThread} strokeWidth={3} strokeLinecap="round">
        {[124, 144, 164, 184, 204, 224].map((y, i) => (
          <Path key={y} d={`M${36 + i * 1.4} ${y}L${84 - i * 1.4} ${y - 8}`} />
        ))}
      </G>
    </Svg>
  );
}

/**
 * Фирменная композиция для имплантации: первое слово за имплантом, второе — перед ним.
 */
export function ImplantComposition({ words, height = 260 }: { words: [string, string]; height?: number }) {
  const fontSize = Math.round(height * 0.3);
  const text = { fontSize, lineHeight: Math.round(fontSize * 1.05) };
  return (
    <View style={[styles.root, { height }]} accessible accessibilityRole="image" accessibilityLabel={words.join(' ')}>
      <AppText variant="display" color="textOnHero" maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.first, text]}>
        {words[0]}
      </AppText>
      <View style={styles.implant} pointerEvents="none">
        <ImplantSvg height={height} />
      </View>
      <AppText variant="display" color="accent" maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.second, text]}>
        {words[1]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    justifyContent: 'center',
  },
  first: {
    position: 'absolute',
    top: '6%',
    left: 0,
    right: '8%',
    textAlign: 'left',
  },
  implant: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '22%',
  },
  second: {
    position: 'absolute',
    bottom: '8%',
    left: '8%',
    right: 0,
    textAlign: 'right',
  },
});
