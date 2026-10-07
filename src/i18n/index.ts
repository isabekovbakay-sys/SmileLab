import { useMemo } from 'react';

import { clinicConfig } from '../config/clinic';
import { demo } from '../data/demoGate';
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

/** Тексты демо-режима. В релизной сборке их нет (null) — демо-модуль не попадает в бандл. */
export function useDemoStrings() {
  const { language } = useSettings();
  return demo?.demoStrings[language] ?? null;
}
