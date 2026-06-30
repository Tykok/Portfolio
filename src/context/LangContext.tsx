import React, { createContext, type ReactNode,useContext, useMemo, useState } from 'react';

import { getTranslations } from 'i18n';
import type { Translations } from 'i18n/types';
import type { Lang } from 'types/lang';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof Translations) => Translations[keyof Translations];
}

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key as string,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('ticoq.lang');
    return stored === 'en' ? 'en' : 'fr';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('ticoq.lang', newLang);
    document.documentElement.lang = newLang;
  };

  const value = useMemo<LangContextValue>(() => {
    const translations = getTranslations(lang);
    return {
      lang,
      setLang,
      t: (key) => translations[key],
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

export default LangProvider;
