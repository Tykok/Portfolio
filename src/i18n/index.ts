import type { Lang } from '../types/lang';

import en from './en';
import fr from './fr';
import type { Translations } from './types';

export type { Translations };

const translations: Record<Lang, Translations> = { fr, en };

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}

export function t(lang: Lang, key: keyof Translations): Translations[typeof key] {
  return translations[lang][key] ?? translations.fr[key];
}
