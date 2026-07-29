import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getTranslations, interpolate, type TVars } from 'i18n';
import type { Translations } from 'i18n/types';
import type { Lang } from 'types/lang';

/**
 * Generic in the key so callers get the exact value type back — `string` for
 * labels, `string[]` for lists, `number` for `cal_weekstart`. Without the
 * generic, every call widens to the union of all value types and needs a cast
 * at the call site.
 */
type TranslateFn = <K extends keyof Translations>(key: K, vars?: TVars) => Translations[K];

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
}

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: ((key: keyof Translations) => key) as TranslateFn,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('ticoq.lang');
    return stored === 'en' ? 'en' : 'fr';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('ticoq.lang', newLang);
  };

  /* Mirror the active language onto <html lang>. Doing it here rather than in
     setLang covers the first render too: a visitor who stored 'en' used to get
     the document's hardcoded lang until they toggled the switch. */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangContextValue>(() => {
    const translations = getTranslations(lang);
    const translate = <K extends keyof Translations>(key: K, vars?: TVars): Translations[K] => {
      const entry = translations[key];
      if (typeof entry === 'string') {
        return interpolate(entry, vars) as Translations[K];
      }
      return entry;
    };

    return { lang, setLang, t: translate };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

export default LangProvider;
