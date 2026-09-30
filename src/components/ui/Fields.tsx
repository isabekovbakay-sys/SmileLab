import { useState, type Ref } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps, type TextStyle } from 'react-native';

import { colors, fontFamily, iconSize, layout, radius, spacing, typography } from '@/theme';
import { formatNationalPhone, normalizeKgPhone } from '@/utils/phone';

import { AppText } from './AppText';
import { CircleAlert } from './icons';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  hint?: string;
  /** Подпись «необязательно» рядом с меткой. */
  optionalLabel?: string;
  /** Неизменяемый префикс внутри поля, например «+996». */
  prefix?: string;
  ref?: Ref<TextInput>;
}

export function TextField({
  label,
  error,
  hint,
  optionalLabel,
  prefix,
  multiline,
  ref,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.focus : colors.borderStrong;
  const { maxFontSizeMultiplier, ...inputType } = typography.body;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
        {optionalLabel ? (
          <AppText variant="caption" color="textMuted">
            {optionalLabel}
          </AppText>
        ) : null}
      </View>
      <View
        style={[
          styles.field,
          multiline ? styles.multiline : null,
          { borderColor },
          focused || error ? styles.emphasis : null,
        ]}>
        {prefix ? (
          <AppText variant="bodyMedium" color="textSecondary" style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          {...inputProps}
          multiline={multiline}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.focus}
          cursorColor={colors.focus}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[inputType, styles.input, multiline ? styles.inputMultiline : null, webInput]}
        />
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <CircleAlert size={iconSize.sm} color={colors.error} />
          <AppText variant="caption" color="error" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

interface PhoneFieldProps extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'prefix' | 'keyboardType'> {
  /** Национальные цифры (до 9), без +996. */
  value: string;
  onChangeNational: (national: string) => void;
}

/** Телефон Кыргызстана: префикс +996, маска XXX XXX XXX, любая вставка нормализуется. */
export function PhoneField({ value, onChangeNational, ...rest }: PhoneFieldProps) {
  return (
    <TextField
      {...rest}
      prefix="+996"
      value={formatNationalPhone(value)}
      onChangeText={(text) => onChangeNational(normalizeKgPhone(text))}
      keyboardType="phone-pad"
      autoComplete="tel"
      textContentType="telephoneNumber"
      placeholder="555 123 456"
    />
  );
}

/** В web у TextInput своя обводка браузера — рамку фокуса рисует поле. */
const webInput = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as TextStyle | null;

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  field: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  emphasis: {
    borderWidth: 2,
    paddingHorizontal: spacing.md - 1,
  },
  multiline: {
    alignItems: 'flex-start',
    minHeight: layout.buttonHeight * 2,
    paddingVertical: spacing.sm,
  },
  prefix: {
    paddingRight: spacing.xxs,
  },
  input: {
    flex: 1,
    minHeight: layout.touch,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: spacing.xxs,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  messageText: {
    flex: 1,
  },
});
