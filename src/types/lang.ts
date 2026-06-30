export type Lang = 'fr' | 'en';

export type LocalizedString = { fr: string; en: string };
export type LocalizedStringArray = { fr: string[]; en: string[] };

export function localize(value: LocalizedString, lang: Lang): string {
  return value[lang] ?? value.fr;
}

export function localizeArray(value: LocalizedStringArray, lang: Lang): string[] {
  return value[lang] ?? value.fr;
}
