import { getLocales } from 'expo-localization';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clinicConfig } from '../config/clinic';
import { track } from '../services/analytics';
import { getJSON, setJSON, storageKeys } from '../services/storage';
import type { Language } from '../types/domain';

interface StoredSettings {
  language: Language;
  onboardingDone: boolean;
}

interface SettingsContextValue extends StoredSettings {
  /** Настройки прочитаны из хранилища. До этого сплэш не скрывается. */
  ready: boolean;
  setLanguage: (language: Language) => void;
  completeOnboarding: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const isLanguage = (value: unknown): value is Language => value === 'ky' || value === 'ru';

/** Язык телефона: kyrgyz → ky, russian → ru, иначе язык по умолчанию. */
function detectLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode;
    return isLanguage(code) ? code : clinicConfig.fallbackLanguage;
  } catch {
    return clinicConfig.fallbackLanguage;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({
    ready: false,
    language: detectLanguage(),
    onboardingDone: false,
  }));

  useEffect(() => {
    let active = true;
    getJSON<Partial<StoredSettings>>(storageKeys.settings, {}).then((saved) => {
      if (!active) return;
      setState((prev) => ({
        ready: true,
        language: isLanguage(saved.language) ? saved.language : prev.language,
        onboardingDone: saved.onboardingDone === true,
      }));
    });
    return () => {
      active = false;
    };
  }, []);

  const { language: currentLanguage, onboardingDone } = state;

  const setLanguage = useCallback(
    (language: Language) => {
      if (language === currentLanguage) return;
      setState((prev) => ({ ...prev, language }));
      setJSON(storageKeys.settings, { language, onboardingDone } satisfies StoredSettings);
      track('language_changed', { language });
    },
    [currentLanguage, onboardingDone],
  );

  const completeOnboarding = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language, onboardingDone: true }));
    setJSON(storageKeys.settings, { language, onboardingDone: true } satisfies StoredSettings);
    track('language_changed', { language, onboarding: true });
  }, []);

  const value = useMemo(
    () => ({ ...state, setLanguage, completeOnboarding }),
    [state, setLanguage, completeOnboarding],
  );

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  const context = use(SettingsContext);
  if (!context) throw new Error('useSettings вне SettingsProvider');
  return context;
}
