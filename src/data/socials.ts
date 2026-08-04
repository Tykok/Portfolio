import type { AppKey } from '../types/app';
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
  /**
   * An app that shows this account's content without leaving the desktop.
   *
   * Where it is set, a list of links opens the window instead of sending the
   * visitor off-site — `href` stays, as the way out for whoever wants the real
   * thing, and as the fallback for any list that has no app to open.
   */
  opensApp?: AppKey;
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
    opensApp: 'articles',
  },
  {
    key: 'medium',
    label: 'Medium',
    value: 'medium.com/@tykok',
    href: 'https://medium.com/@tykok',
    monogram: 'M',
    color: '#191919',
    primary: false,
    desc: { fr: 'Articles de fond, quand le sujet mérite du temps.', en: 'Longer reads, when a topic deserves the time.' },
  },
];

export const primarySocials = socials.filter((s) => s.primary);
