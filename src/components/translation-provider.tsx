'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, SupportedLocale } from '@/i18n/dictionaries';
import { translateInline } from '@/i18n/inline-map';

type Dictionary = typeof dictionaries.en | typeof dictionaries.pa;

type TranslationContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: Dictionary;
  translate: (text: string) => string;
};

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

const STORAGE_KEY = 'se-repairs:locale';
const COOKIE_KEY = 'se-repairs-locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const loadInitialLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && stored in dictionaries) {
    return stored as SupportedLocale;
  }
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_KEY}=`))
    ?.split('=')[1];
  if (cookie && cookie in dictionaries) {
    return cookie as SupportedLocale;
  }
  return 'en';
};

type TranslationProviderProps = {
  initialLocale?: SupportedLocale;
  children: React.ReactNode;
};

export function TranslationProvider({ initialLocale = 'en', children }: TranslationProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loaded = loadInitialLocale();
    setLocaleState((current) => (loaded !== current ? loaded : current));
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${COOKIE_KEY}=${next};path=/;max-age=${COOKIE_MAX_AGE}`;
    }
  }, []);

  const value = useMemo<TranslationContextValue>(() => {
    // Use initialLocale during SSR to prevent hydration mismatches
    const currentLocale = mounted ? locale : initialLocale;
    const dictionary = dictionaries[currentLocale] ?? dictionaries.en;
    const translate = (text: string) => translateInline(text, currentLocale);
    return {
      locale: currentLocale,
      setLocale,
      t: dictionary,
      translate,
    };
  }, [locale, setLocale, mounted, initialLocale]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
