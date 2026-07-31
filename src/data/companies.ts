import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface Company {
  id: string;
  monogram: string;
  gradient: string;
  /** Not localized — a company's name is its name. */
  name: string;
  place: LocalizedString;
  period: LocalizedString;
  /** Job title, plus one or two sentences on scope. */
  role: LocalizedString;
  /** What the company does, for a reader who has never heard of it. */
  what: LocalizedString;
  /** The projects and chantiers carried out there. */
  work: LocalizedStringArray;
  stack: string[];
}

export const companies: Company[] = [
  {
    id: 'pictarine',
    monogram: 'PI',
    gradient: 'linear-gradient(135deg,#fb7185,#be123c)',
    name: 'Pictarine',
    place: { fr: 'Toulouse', en: 'Toulouse' },
    period: { fr: 'oct. 2022 → présent', en: 'Oct 2022 → present' },
    what: {
      fr: 'Impression photo en magasin : Pictarine développe les applications par lesquelles les clients commandent leurs tirages, retirés ensuite chez de grandes enseignes nord-américaines.',
      en: 'In-store photo printing: Pictarine builds the apps customers order their prints through, then collect from large North American chains.',
    },
    role: {
      fr: "Backend Engineer. Je conçois, fais évoluer et maintiens l'API, et je porte tout ce qui touche à la base PostgreSQL. Je travaille aussi sur GCP : Cloud Functions, Cloud Scheduler, Cloud Run.",
      en: 'Backend Engineer. I design, grow and maintain the API, and I own everything that touches the PostgreSQL database. I also work on GCP: Cloud Functions, Cloud Scheduler, Cloud Run.',
    },
    work: {
      fr: [
        'Paiement Stripe et gestion de compte client',
        'Services tiers pour le marketing (Klaviyo)',
        'Première version du catalogue produit',
        'Tooling interne en Next.js, adopté par toutes les équipes',
      ],
      en: [
        'Stripe payments and customer account management',
        'Third-party marketing services (Klaviyo)',
        'First version of the product catalogue',
        'Internal tooling in Next.js, adopted by every team',
      ],
    },
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'GCP', 'Next.js', 'Python'],
  },
  {
    id: 'mecalife',
    monogram: 'ML',
    gradient: 'linear-gradient(135deg,#60a5fa,#1d4ed8)',
    name: 'MecaLIFE Group',
    place: { fr: 'Toulouse', en: 'Toulouse' },
    period: { fr: 'mars 2021 → sept. 2022', en: 'Mar 2021 → Sep 2022' },
    what: {
      fr: "Rapports détaillés de véhicules : les équipements et options d'un modèle donné, à partir de sa marque, son année et sa version.",
      en: 'Detailed vehicle reports: the equipment and options of a given model, from its make, year and trim.',
    },
    role: {
      fr: "Full Stack Developer, en alternance puis en poste. Front, back, base de données, et l'administration des serveurs Debian avec leur chaîne de déploiement.",
      en: 'Full Stack Developer, first as an apprentice then on staff. Front, back, database, and the administration of the Debian servers along with their deployment chain.',
    },
    work: {
      fr: [
        'La plateforme de rapports véhicules',
        "Une plateforme de ventes aux enchères en fin d'alternance, avec paiement Stripe et tarification dynamique selon le type de véhicule",
        "Un outil interne d'aide à la conception de rapports",
        'CI/CD, Apache et Docker sur Debian',
      ],
      en: [
        'The vehicle report platform',
        'An auction platform at the end of the apprenticeship, with Stripe payments and pricing that varied by vehicle type',
        'An internal tool to help design reports',
        'CI/CD, Apache and Docker on Debian',
      ],
    },
    stack: ['PHP', 'Laravel', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'canope',
    monogram: 'RC',
    gradient: 'linear-gradient(135deg,#fbbf24,#b45309)',
    name: 'Réseau Canopé',
    place: { fr: 'Saint-Denis, La Réunion', en: 'Saint-Denis, Réunion' },
    period: { fr: 'janv. → févr. 2020', en: 'Jan → Feb 2020' },
    what: {
      fr: "Opérateur public de l'Éducation nationale : ressources pédagogiques, livres scolaires, action culturelle. L'antenne de Saint-Denis couvre La Réunion.",
      en: 'A public body of the French education ministry: teaching resources, school books, cultural programmes. The Saint-Denis branch covers Réunion.',
    },
    role: {
      fr: "Full Stack, stage. Seul sur le projet, accompagné d'un tuteur.",
      en: 'Full Stack, internship. Alone on the project, with a tutor alongside.',
    },
    work: {
      fr: [
        "Un site répertoriant les établissements scolaires de l'île sur une carte interactive",
        'Recueil des besoins, modélisation et création de la base',
        'Recherche avancée, connexion sécurisée et gestion des droits',
        'Objectif : que les équipes voient où des actions ont été menées, pour décider où en mener de nouvelles',
      ],
      en: [
        "A site cataloguing the island's schools on an interactive map",
        'Requirements gathering, modelling and creating the database',
        'Advanced search, secure login and rights management',
        'The point: so the teams could see where activities had already run, and decide where to run new ones',
      ],
    },
    stack: ['PHP', 'MySQL', 'JavaScript'],
  },
  {
    id: 'cegid',
    monogram: 'CG',
    gradient: 'linear-gradient(135deg,#2dd4bf,#0f766e)',
    name: 'Cegid',
    place: { fr: 'Roubaix', en: 'Roubaix' },
    period: { fr: 'juin → juil. 2019', en: 'Jun → Jul 2019' },
    what: {
      fr: 'Éditeur de logiciels de gestion : paie, comptabilité, ERP.',
      en: 'A business software vendor: payroll, accounting, ERP.',
    },
    role: {
      fr: "Full Stack, stage. Seul sur l'outil, accompagné d'un tuteur.",
      en: 'Full Stack, internship. Alone on the tool, with a tutor alongside.',
    },
    work: {
      fr: [
        'Un analyseur de thread dumps Java',
        'Récupération des dumps, transformation en JSON, exposition HTTP',
        "Une interface de tri pour rendre lisible ce qui ne l'était pas",
        'Destiné aux collaborateurs qui debuggaient en production',
      ],
      en: [
        'A Java thread dump analyser',
        'Dump retrieval, transformation to JSON, HTTP exposure',
        'A sorting UI to make readable what was not',
        'Built for the colleagues debugging in production',
      ],
    },
    stack: ['Java', 'JEE', 'Angular'],
  },
];
