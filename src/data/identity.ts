import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface Identity {
  name: string;
  alias: string;
  initials: string;
  /** Self-hosted under /identity. */
  photo: string;
  /** GitHub account picture, self-hosted under /identity — the login screen's tile, not the site's photo. */
  githubAvatar: string;
  role: LocalizedString;
  location: LocalizedString;
  status: LocalizedString;
  email: string;
  github: string;
  githubUrl: string;
  /** Short pitch — one line, used where space is tight (terminal, tooltips). */
  tagline: LocalizedString;
  /** Full profile paragraph — Portfolio page, CV header. */
  bio: LocalizedString;
  /** What I'm doing right now, in one sentence. */
  now: LocalizedString;
  interests: LocalizedStringArray;
}

export const identity: Identity = {
  name: 'Elie Treport',
  alias: 'Tykok',
  initials: 'ET',
  photo: '/identity/elie-treport.jpg',
  githubAvatar: '/identity/github-avatar.png',
  role: { fr: 'Développeur Backend Kotlin', en: 'Kotlin Backend Developer' },
  location: { fr: 'Escalquens, Occitanie · Toulouse', en: 'Escalquens, Occitania · Toulouse' },
  status: { fr: "À l'écoute, sans chercher", en: 'Not looking, but listening' },
  email: 'treportelie12@gmail.com',
  github: 'github.com/Tykok',
  githubUrl: 'https://github.com/Tykok',
  tagline: {
    fr: 'APIs Kotlin / Spring Boot, PostgreSQL et intégrations qui tiennent en production.',
    en: 'Kotlin / Spring Boot APIs, PostgreSQL and integrations that hold up in production.',
  },
  bio: {
    fr: "Développeur backend chez Pictarine depuis 2022, je conçois des APIs en Kotlin / Spring Boot avec PostgreSQL : paiement (Stripe), services tiers (Klaviyo), gestion de compte client et un tooling interne utilisé par toutes les équipes. Je suis les fonctionnalités de bout en bout — conception, mise en production, analyse d'impact — en travaillant avec le Produit, le Design, la Data et les équipes Front (iOS, Android, Web).\n\nCréatif, avec un esprit critique et une vraie envie de progresser en continu. Ma curiosité me pousse à explorer de nouveaux sujets en permanence, et j'aime particulièrement partager et discuter d'informatique — d'où ce portfolio et mes articles.\n\nJe suis originaire de La Réunion, et ça se voit dans ce que je construis à côté : une base de la flore de l'île, une application de signalement des dépôts sauvages. Le reste tourne sur mon propre serveur, à la maison. Ce que je cherche à faire, au fond, c'est quelque chose d'utile.",
    en: "Backend developer at Pictarine since 2022, I build APIs in Kotlin / Spring Boot with PostgreSQL: payments (Stripe), third-party services (Klaviyo), customer account management and internal tooling used across every team. I follow features end to end — design, release, impact analysis — working with Product, Design, Data and the Front teams (iOS, Android, Web).\n\nCreative, with a critical eye and a real drive to keep getting better. Curiosity keeps pushing me into new territory, and I especially enjoy sharing and talking software — hence this portfolio and my articles.\n\nI am from Réunion, and it shows in what I build on the side: a database of the island's flora, an app for reporting illegal dumping. The rest runs on my own server, at home. What I am really after is building something useful.",
  },
  now: {
    fr: 'Actuellement : APIs backend Kotlin / Spring Boot chez Pictarine, à Toulouse.',
    en: 'Currently: Kotlin / Spring Boot backend APIs at Pictarine, in Toulouse.',
  },
  interests: {
    fr: [
      'Écriture technique (Medium, dev.to)',
      'Projets personnels & side projects',
      'Veille et discussions autour du dev',
      'Apprentissage continu',
    ],
    en: ['Technical writing (Medium, dev.to)', 'Personal & side projects', 'Keeping up with dev and talking shop', 'Continuous learning'],
  },
};
