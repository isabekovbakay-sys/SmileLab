import { useState, type ReactNode } from 'react';
import { Animated, Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion, opacity } from '@/theme';
import { useNativeDriver } from '@/utils/animation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Во сколько уменьшается элемент при нажатии. */
  scaleTo?: number;
}

/**
 * Единый компонент нажатия: пружинящее уменьшение (анимирован сам Pressable).
 * С reduced motion вместо масштаба меняется только прозрачность.
 */
export function PressableScale({
  style,
  children,
  scaleTo = motion.pressScale,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion();
  const [value] = useState(() => new Animated.Value(1));

  const animateTo = (pressed: boolean) => {
    if (reduced) {
      Animated.timing(value, {
        toValue: pressed ? opacity.pressed : 1,
        duration: motion.duration.fast,
        useNativeDriver,
      }).start();
      return;
    }
    Animated.spring(value, {
      toValue: pressed ? scaleTo : 1,
      ...(pressed ? motion.spring.press : motion.spring.release),
      useNativeDriver,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(true);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(false);
    onPressOut?.(event);
  };

  const animatedStyle = reduced ? { opacity: value } : { transform: [{ scale: value }] };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle, disabled ? { opacity: opacity.disabled } : null]}>
      {children}
    </AnimatedPressable>
  );
}
