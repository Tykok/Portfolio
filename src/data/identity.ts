import type { LocalizedString } from '../types/lang';

export interface Identity {
  name: string;
  alias: string;
  initials: string;
  role: LocalizedString;
  location: LocalizedString;
  status: LocalizedString;
  phone: string;
  email: string;
  github: string;
  githubUrl: string;
  bio: LocalizedString;
}

export const identity: Identity = {
  name: 'Elie Treport',
  alias: 'Tykok',
  initials: 'ET',
  role: { fr: 'Développeur Backend', en: 'Backend Developer' },
  location: { fr: 'Toulouse, France · à distance', en: 'Toulouse, France · remote' },
  status: { fr: 'Ouvert aux opportunités', en: 'Open to opportunities' },
  phone: '06 51 77 34 04',
  email: 'treportelie12@gmail.com',
  github: 'github.com/Tykok',
  githubUrl: 'https://github.com/Tykok',
  bio: {
    fr: "Je conçois des APIs et des systèmes côté serveur qui restent simples à maintenir et tiennent la charge. J'aime les architectures claires, les données propres et le code qu'on relit sans grimacer.",
    en: 'I build server-side APIs and systems that stay easy to maintain and hold up under load. I like clean architectures, tidy data, and code you can re-read without wincing.',
  },
};
