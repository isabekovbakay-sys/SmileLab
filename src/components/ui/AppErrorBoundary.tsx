import { router } from 'expo-router';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { CircleAlert, House, RotateCcw } from './icons';

interface BoundaryState {
  error: Error | null;
}

/** Ловит ошибки отрисовки и показывает понятный экран с выходом на главную. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Сюда можно подключить отправку отчёта об ошибке (services/analytics).
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) return <ErrorFallback onRetry={this.reset} />;
    return this.props.children;
  }
}

export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.icon}>
        <CircleAlert size={iconSize.xl} color={colors.error} />
      </View>
      <AppText variant="h2" align="center" accessibilityRole="header">
        {t.errorBoundary.title}
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        {t.errorBoundary.text}
      </AppText>
      <View style={styles.actions}>
        <Button label={t.errorBoundary.retry} icon={RotateCcw} onPress={onRetry} />
        <Button
          label={t.common.toHome}
          icon={House}
          variant="secondary"
          onPress={() => {
            onRetry();
            router.replace('/');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    width: layout.touch + spacing.md,
    height: layout.touch + spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});
