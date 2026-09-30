import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, fontFamily, radius } from '@/theme';
import { hashString, initials } from '@/utils/text';

/** Монограмма врача вместо фото (стоковые портреты не используем). */
export function Monogram({ id, name, size = 56 }: { id: string; name: string; size?: number }) {
  const index = hashString(id) % colors.monogram.length;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, backgroundColor: colors.monogram[index] }]}>
      <AppText
        variant="title"
        maxFontSizeMultiplier={1}
        style={{ fontSize: size * 0.36, lineHeight: size * 0.44, color: colors.monogramInk[index], fontFamily: fontFamily.bold }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
