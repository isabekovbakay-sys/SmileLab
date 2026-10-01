import { Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

/** Весь текст приложения идёт через AppText: шкала типографики и ограничение системного масштаба. */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  maxFontSizeMultiplier,
  ...rest
}: AppTextProps) {
  const { maxFontSizeMultiplier: variantMax, ...variantStyle } = typography[variant];
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? variantMax}
      style={[variantStyle, { color: colors[color] }, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
