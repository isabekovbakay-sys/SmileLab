import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { motion } from '../theme';
import { useNativeDriver } from '../utils/animation';
import { useReducedMotion } from './useReducedMotion';

/**
 * Появление элемента: прозрачность + сдвиг (и небольшой зум). С reduced motion — сразу видно.
 * Возвращает анимированный стиль.
 */
export function useEntrance({ delay = 0, distance = 12, fromScale = 1, duration = motion.duration.hero } = {}) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay: reduced ? 0 : delay,
      duration: reduced ? 0 : duration,
      easing: motion.easing.out,
      useNativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay, duration, reduced]);

  return {
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] }) },
    ],
  };
}
