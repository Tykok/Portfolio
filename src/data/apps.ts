import type { AppMeta } from '../types/app';

export const appsMeta: AppMeta[] = [
  {
    key: 'web',
    icon: 'globe',
    defaultWidth: 940,
    defaultHeight: 640,
    title: { fr: 'À propos — TicoqExplorer', en: 'About — TicoqExplorer' },
    short: { fr: 'À propos', en: 'About' },
  },
  {
    key: 'projects',
    icon: 'folder',
    defaultWidth: 620,
    defaultHeight: 470,
    title: { fr: 'Parcours', en: 'Work' },
    short: { fr: 'Parcours', en: 'Work' },
  },
  {
    key: 'cv',
    icon: 'doc',
    defaultWidth: 600,
    defaultHeight: 540,
    title: { fr: 'CV — Elie Treport', en: 'Résumé — Elie Treport' },
    short: { fr: 'CV', en: 'Résumé' },
  },
  {
    key: 'contact',
    icon: 'mail',
    defaultWidth: 520,
    defaultHeight: 420,
    title: { fr: 'Contact — Messagerie', en: 'Contact — Messenger' },
    short: { fr: 'Contact', en: 'Contact' },
  },
  {
    key: 'terminal',
    icon: 'term',
    defaultWidth: 560,
    defaultHeight: 360,
    title: { fr: 'Terminal', en: 'Terminal' },
    short: { fr: 'Terminal', en: 'Terminal' },
  },
  {
    key: 'articles',
    icon: 'news',
    defaultWidth: 620,
    defaultHeight: 520,
    title: { fr: 'Articles', en: 'Articles' },
    short: { fr: 'Articles', en: 'Articles' },
  },
];

export function getAppMeta(key: string): AppMeta | undefined {
  return appsMeta.find((m) => m.key === key);
}
