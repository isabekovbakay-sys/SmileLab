import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/hooks/useSvgId';
import { colors } from '@/theme';

import { BrandBackdrop } from './BrandBackdrop';
import { HeroVideo } from './HeroVideo';

/** Фон героя: фирменная заставка + видео в нижней части с мягкими затемнениями. */
export function HeroMedia({ video }: { video: number | string | null }) {
  const fadeId = useSvgId('hero-fade');
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BrandBackdrop />
      {video !== null ? (
        <View style={styles.videoArea}>
          <HeroVideo source={video} />
          <View style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 10 100">
              <Defs>
                <LinearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.hero} stopOpacity={1} />
                  <Stop offset="0.35" stopColor={colors.hero} stopOpacity={0.35} />
                  <Stop offset="0.7" stopColor={colors.heroDeep} stopOpacity={0.45} />
                  <Stop offset="1" stopColor={colors.heroDeep} stopOpacity={0.92} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={10} height={100} fill={`url(#${fadeId})`} />
            </Svg>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  videoArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
  },
});
