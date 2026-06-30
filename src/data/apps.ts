import type { AppMeta } from '../types/app';

export const appsMeta: AppMeta[] = [
  {
    key: 'about',
    icon: 'pc',
    defaultWidth: 470,
    defaultHeight: 624,
    title: { fr: 'À propos de moi', en: 'About me' },
    short: { fr: 'À propos de moi', en: 'About me' },
  },
  {
    key: 'web',
    icon: 'globe',
    defaultWidth: 940,
    defaultHeight: 640,
    title: { fr: 'Portfolio — TicoqExplorer', en: 'Portfolio — TicoqExplorer' },
    short: { fr: 'Mon Portfolio', en: 'My Portfolio' },
  },
  {
    key: 'projects',
    icon: 'folder',
    defaultWidth: 620,
    defaultHeight: 470,
    title: { fr: 'Projets', en: 'Projects' },
    short: { fr: 'Projets', en: 'Projects' },
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
    key: 'media',
    icon: 'media',
    defaultWidth: 360,
    defaultHeight: 460,
    title: { fr: 'Lecteur média', en: 'Media player' },
    short: { fr: 'Lecteur média', en: 'Media player' },
  },
];

export function getAppMeta(key: string): AppMeta | undefined {
  return appsMeta.find((m) => m.key === key);
}
