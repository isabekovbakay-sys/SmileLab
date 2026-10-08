import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { typography, type ColorToken } from '@/theme';
import { fitFontSize } from '@/utils/fitText';

interface DisplayTitleProps {
  /** Строки разделены "\n". */
  text: string;
  color?: ColorToken;
  maxSize?: number;
  minSize?: number;
}

/**
 * Крупный «редакционный» заголовок: размер подбирается под ширину по самой длинной строке
 * (кыргызские слова длиннее), каждая строка — ровно одна строка.
 */
export function DisplayTitle({ text, color = 'textOnHero', maxSize = typography.display.fontSize, minSize = 26 }: DisplayTitleProps) {
  const [width, setWidth] = useState(0);
  const lines = text.split('\n');
  const size = fitFontSize({ lines, width, maxSize, minSize });
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="header"
      accessibilityLabel={lines.join(' ')}
      style={{ opacity: width ? 1 : 0 }}>
      {lines.map((line, index) => (
        <AppText
          key={`${index}-${line}`}
          variant="display"
          color={color}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ fontSize: size, lineHeight: Math.round(size * 1.1) }}>
          {line}
        </AppText>
      ))}
    </View>
  );
}
