import type { ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useEntrance } from '@/hooks/useEntrance';

interface FadeProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  fromScale?: number;
  style?: StyleProp<ViewStyle>;
}

/** Мягкое появление блока (прозрачность, сдвиг, лёгкий зум). */
export function Fade({ children, delay, distance, fromScale, style }: FadeProps) {
  const entrance = useEntrance({ delay, distance, fromScale });
  return <Animated.View style={[style, entrance]}>{children}</Animated.View>;
}
