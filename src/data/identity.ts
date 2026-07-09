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
  role: { fr: 'Développeur Backend Kotlin', en: 'Kotlin Backend Developer' },
  location: { fr: 'Escalquens, Occitanie · Toulouse', en: 'Escalquens, Occitania · Toulouse' },
  status: { fr: 'Ouvert aux opportunités', en: 'Open to opportunities' },
  phone: '06 51 77 34 04',
  email: 'treportelie12@gmail.com',
  github: 'github.com/Tykok',
  githubUrl: 'https://github.com/Tykok',
  bio: {
    fr: "Développeur backend chez Pictarine, je conçois des APIs en Kotlin / Spring Boot avec PostgreSQL, intégrations de paiement (Stripe) et de services tiers. Créatif et curieux, j'aime les architectures claires et le code qu'on relit sans grimacer.",
    en: 'Backend developer at Pictarine, I build APIs in Kotlin / Spring Boot with PostgreSQL, payment integrations (Stripe) and third-party services. Creative and curious, I like clean architectures and code you can re-read without wincing.',
  },
};
