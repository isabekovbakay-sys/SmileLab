import { StyleSheet, View } from 'react-native';

import { Check } from '@/components/ui/icons';
import { colors, iconSize, radius, spacing } from '@/theme';

/** Отметка выбора: заполненный круг с галочкой (не только цвет). */
export function RadioMark({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.circle, selected ? styles.selected : null]} accessibilityElementsHidden importantForAccessibility="no">
      {selected ? <Check size={iconSize.sm} color={colors.onPrimary} strokeWidth={3} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
