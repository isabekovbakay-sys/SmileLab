import { useMemo } from 'react';

import { clinicConfig } from '../config/clinic';
import { useSettings } from '../state/SettingsProvider';
import type { Language, LocalizedText } from '../types/domain';
import { dictionaries } from './dictionaries';
import { createFormatters, pickLocalized } from './format';

export { dictionaries } from './dictionaries';
export type { Strings } from './dictionaries';
export { createFormatters, pickLocalized } from './format';

export function getI18n(language: Language) {
  const t = dictionaries[language];
  return {
    language,
    t,
    fmt: createFormatters(t),
    l: (text: LocalizedText) => pickLocalized(text, language, clinicConfig.fallbackLanguage),
  };
}

export type I18n = ReturnType<typeof getI18n>;

/** Язык, словарь `t`, форматтеры `fmt` и выбор локализованного контента `l(text)`. */
export function useI18n() {
  const { language, setLanguage } = useSettings();
  const i18n = useMemo(() => getI18n(language), [language]);
  return { ...i18n, setLanguage };
}
