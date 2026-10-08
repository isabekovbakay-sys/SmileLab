import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PhoneField, TextField } from '@/components/ui/Fields';
import { Check, Lock } from '@/components/ui/icons';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { TopBar } from '@/components/ui/TopBar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/i18n';
import { useProfile } from '@/state/ProfileProvider';
import { useToast } from '@/state/ToastProvider';
import { colors, iconSize, layout, spacing } from '@/theme';
import { normalizeKgPhone, toE164 } from '@/utils/phone';
import { validateEmail, validatePhone } from '@/utils/validation';

export default function ProfileEditScreen() {
  const { t } = useI18n();
  const { profile, updateProfile } = useProfile();
  const { showToast } = useToast();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(normalizeKgPhone(profile.phone));
  const [email, setEmail] = useState(profile.email);
  const [attempted, setAttempted] = useState(false);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const phoneStatus = validatePhone(phone);
  const emailStatus = validateEmail(email);
  // Телефон и e-mail необязательны, но если введены — должны быть корректными.
  const phoneError =
    attempted && phoneStatus === 'incomplete'
      ? t.booking.errors.phoneIncomplete
      : attempted && phoneStatus === 'invalidPrefix'
        ? t.booking.errors.phoneInvalidPrefix
        : null;
  const emailError = attempted && emailStatus === 'invalid' ? t.booking.errors.emailInvalid : null;

  const save = () => {
    setAttempted(true);
    if (phoneStatus === 'incomplete' || phoneStatus === 'invalidPrefix') {
      phoneRef.current?.focus();
      return;
    }
    if (emailStatus === 'invalid') {
      emailRef.current?.focus();
      return;
    }
    updateProfile({ name: name.trim(), phone: phoneStatus === 'ok' ? toE164(phone) : '', email: email.trim() });
    showToast(t.profile.saved, 'success');
    router.back();
  };

  return (
    <View style={styles.screen}>
      <TopBar title={t.profile.editTitle} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenContainer padded style={styles.content}>
            <View style={styles.hint}>
              <Lock size={iconSize.md} color={colors.hero} />
              <AppText variant="bodySm" color="textSecondary" style={styles.flex}>
                {t.profile.editHint}
              </AppText>
            </View>
            <TextField
              label={t.booking.nameLabel}
              placeholder={t.booking.namePlaceholder}
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              submitBehavior="submit"
            />
            <PhoneField
              ref={phoneRef}
              label={t.booking.phoneLabel}
              value={phone}
              onChangeNational={setPhone}
              error={phoneError}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              submitBehavior="submit"
            />
            <TextField
              ref={emailRef}
              label={t.profile.email}
              optionalLabel={t.booking.optional}
              placeholder={t.profile.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </ScreenContainer>
        </ScrollView>
        <StickyFooter>
          <Button testID="profile-save" label={t.common.save} icon={Check} onPress={save} />
        </StickyFooter>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: layout.gutter,
    gap: spacing.lg,
  },
  hint: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
});
