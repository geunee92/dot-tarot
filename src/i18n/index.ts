import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { useCallback, useState, useEffect } from 'react';

import en from './translations/en.json';
import ko from './translations/ko.json';

const i18n = new I18n({ en, ko });

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale === 'ko' ? 'ko' : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

type Listener = () => void;
const listeners = new Set<Listener>();

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18n.t(key, options);
};

export const useTranslation = () => {
  const [locale, setLocaleState] = useState(i18n.locale);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLocaleState(i18n.locale);
    });
    return unsubscribe;
  }, []);

  const translate = useCallback(
    (key: string, options?: Record<string, unknown>) => i18n.t(key, options),
    [locale]
  );

  return { t: translate, locale };
};

export type SupportedLocale = 'en' | 'ko' | 'system';

export const setLocale = (locale: SupportedLocale) => {
  if (locale === 'system') {
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
    i18n.locale = deviceLocale === 'ko' ? 'ko' : 'en';
  } else {
    i18n.locale = locale;
  }
  notifyListeners();
};

export const getLocale = (): string => i18n.locale;

export { i18n };
