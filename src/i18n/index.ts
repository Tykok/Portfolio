import type { Lang } from '../types/lang';

import en from './en';
import fr from './fr';
import type { Translations } from './types';

export type { Translations };

const translations: Record<Lang, Translations> = { fr, en };

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}

/** Values allowed as interpolation arguments in a translation string. */
export type TVars = Record<string, string | number>;

/**
 * Replaces every `{name}` placeholder in `text` with `vars.name`.
 * A placeholder with no matching var is left untouched, so a missing
 * argument is visible in the UI instead of silently rendering nothing.
 */
export function interpolate(text: string, vars?: TVars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function t<K extends keyof Translations>(lang: Lang, key: K, vars?: TVars): Translations[K] {
  const value = translations[lang][key] ?? translations.fr[key];
  if (typeof value === 'string') {
    return interpolate(value, vars) as Translations[K];
  }
  return value;
}
