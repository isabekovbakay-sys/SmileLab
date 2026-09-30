import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { motion } from '../theme';
import { useNativeDriver } from '../utils/animation';
import { useReducedMotion } from './useReducedMotion';

/**
 * Слой (меню, нижний лист) остаётся смонтированным, пока играет анимация закрытия.
 * mounted включается во время render (производное состояние), выключается — по окончании анимации.
 */
export function usePresence(visible: boolean, duration: number = motion.duration.base) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));

  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: reduced ? 0 : duration,
      easing: motion.easing.out,
      useNativeDriver,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, mounted, progress, duration, reduced]);

  return { mounted, progress };
}
