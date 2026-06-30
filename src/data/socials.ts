import type { LocalizedString } from '../types/lang';

export interface Social {
  key: string;
  label: string;
  value: string;
  href: string;
  monogram: string;
  color: string;
  primary: boolean;
  desc: LocalizedString;
}

export const socials: Social[] = [
  {
    key: 'email',
    label: 'Email',
    value: 'treportelie12@gmail.com',
    href: 'mailto:treportelie12@gmail.com',
    monogram: '@',
    color: '#d9730d',
    primary: true,
    desc: { fr: 'Le plus sûr pour les projets sérieux.', en: 'The surest way for serious projects.' },
  },
  {
    key: 'github',
    label: 'GitHub',
    value: 'github.com/Tykok',
    href: 'https://github.com/Tykok',
    monogram: 'GH',
    color: '#24292f',
    primary: true,
    desc: { fr: 'Mon code open source et mes expérimentations.', en: 'My open-source code and experiments.' },
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    value: 'in/elie-treport',
    href: 'https://www.linkedin.com/in/elie-treport',
    monogram: 'in',
    color: '#0a66c2',
    primary: true,
    desc: { fr: 'Parcours pro, recommandations et actus.', en: 'Career, recommendations and updates.' },
  },
  {
    key: 'devto',
    label: 'Dev.to',
    value: 'dev.to/tykok',
    href: 'https://dev.to/tykok',
    monogram: 'DEV',
    color: '#0a0a0a',
    primary: false,
    desc: { fr: 'Mes articles techniques en clair.', en: 'My technical articles, in the open.' },
  },
  {
    key: 'x',
    label: 'X / Twitter',
    value: 'x.com/tykok',
    href: 'https://x.com/tykok',
    monogram: 'X',
    color: '#000000',
    primary: false,
    desc: { fr: 'Pensées backend, café et dessins.', en: 'Backend thoughts, coffee and drawings.' },
  },
  {
    key: 'bluesky',
    label: 'Bluesky',
    value: 'bsky.app/profile/tykok',
    href: 'https://bsky.app/profile/tykok',
    monogram: 'bs',
    color: '#1185fe',
    primary: false,
    desc: { fr: 'Version plus calme du petit oiseau.', en: 'A calmer version of the little bird.' },
  },
];

export const primarySocials = socials.filter((s) => s.primary);
