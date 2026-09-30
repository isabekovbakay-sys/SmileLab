import { useEvent } from 'expo';
import { useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { useEffect, useState } from 'react';
import { Animated, AppState, StyleSheet } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from '@/theme';
import { useNativeDriver } from '@/utils/animation';

type HeroVideoSource = number | string | null;

/**
 * Фоновое видео героя: без звука, по кругу, без контролов.
 * Запускается только после readyToPlay, ставится на паузу вне фокуса и в фоне.
 * Под ним всегда лежит BrandBackdrop.
 */
export function HeroVideo({ source }: { source: HeroVideoSource }) {
  const reduced = useReducedMotion();
  if (source === null || reduced) return null;
  return <HeroVideoPlayer source={typeof source === 'string' ? { uri: source, useCaching: true } : source} />;
}

function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);
  return active;
}

function HeroVideoPlayer({ source }: { source: VideoSource }) {
  const focused = useIsFocused();
  const appActive = useAppActive();
  const player = useVideoPlayer(source, (p) => {
    p.muted = true;
    p.loop = true;
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const [opacity] = useState(() => new Animated.Value(0));
  const shouldPlay = status === 'readyToPlay' && focused && appActive;

  useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();
  }, [shouldPlay, player]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: status === 'readyToPlay' ? 1 : 0,
      duration: motion.duration.slow,
      useNativeDriver,
    }).start();
  }, [status, opacity]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        surfaceType="textureView"
      />
    </Animated.View>
  );
}
