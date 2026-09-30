import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

interface GlyphProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Узнаваемые знаки мессенджеров в стиле линейных иконок приложения. */
export function WhatsAppGlyph({ size = 24, color = colors.brandWhatsApp }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path
        d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.1 8.3c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.7 1.6c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.5.9 1.3 1.7 2.2 2.2.2.1.4.1.5 0l.6-.5c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.6v.5c0 .3-.1.6-.5.8-.5.3-1.2.4-1.9.3-1.4-.3-2.9-1.2-4.1-2.4S9 11.3 8.7 9.9c-.1-.6 0-1.2.4-1.6Z"
        fill={color}
      />
    </Svg>
  );
}

export function TelegramGlyph({ size = 24, color = colors.brandTelegram }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path
        d="M20.6 4.3 3.7 10.9c-.9.4-.9 1.5.1 1.8l4.2 1.3 1.6 5c.2.7 1.1.9 1.6.4l2.4-2.3 4.4 3.2c.6.4 1.4.1 1.6-.6l2.3-13.9c.2-.9-.6-1.6-1.3-1.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="m8 14 9.2-6.3-6.5 7.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
