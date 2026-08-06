import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface CvExperience {
  org: LocalizedString;
  pos: LocalizedString;
  when: LocalizedString;
  bullets: LocalizedStringArray;
  /** Technology labels, rendered through `getBadge` in the window. */
  tags: string[];
}

export interface CvEducation {
  yr: string;
  ti: LocalizedString;
  /** School name — not localized. */
  sc: string;
}

export interface CvWant {
  lead: LocalizedString;
  rest: LocalizedString;
}

export const EXPERIENCE: CvExperience[] = [
  /* One Pictarine entry, not two. The role never changed title, so splitting it
     at October 2024 read as a padded timeline rather than a progression. The
     bullets are the union of the two former entries, oldest work last. */
  {
    org: { fr: 'Pictarine · Toulouse', en: 'Pictarine · Toulouse' },
    pos: { fr: 'Développeur Back-End', en: 'Back-End Developer' },
    when: { fr: 'oct. 2022 – présent', en: 'Oct 2022 – present' },
    bullets: {
      fr: [
        'APIs backend en Kotlin / Spring Boot, données sur PostgreSQL',
        'Outil interne en Next.js / TypeScript pour gérer le catalogue produit (prix, disponibilité, ajout/suppression) — mon premier projet, adopté par toutes les équipes',
        'Refonte du flux de paiement Stripe : échanges API, live activity sur le suivi de commande, système de refund — plusieurs milliers de commandes par mois aux États-Unis',
        'Picta France : nouvelle API créée de zéro pour déployer imprimantes et logiciel Pictarine en magasin',
        'Services serverless sur GCP : Cloud Functions, Cloud Scheduler et Cloud Run — dont un job planifié qui synchronise les données Postgres vers Klaviyo toutes les 15 minutes',
        "Migration des emails et push notifications d'une API Python legacy vers Kotlin",
        "Compte client (V1), de la conception à l'intégration",
        "Conception de schémas et migrations PostgreSQL ; premier système de migration mis en place avec l'ORM Ebean",
        'En cours : intégration de produits à grande échelle assistée par IA (nouvelle API et application), et migration du panier côté back',
        'Collaboration avec Produit, Design, Data et Front (iOS, Android, Web) — vision technique autant que produit',
      ],
      en: [
        'Backend APIs in Kotlin / Spring Boot, data on PostgreSQL',
        'Internal tool in Next.js / TypeScript to manage the product catalogue (pricing, availability, add/remove) — my first project, adopted by every team',
        'Rebuilt the payment flow around Stripe: API exchanges, live order-tracking activity, a refund system — several thousand orders a month in the US alone',
        "Picta France: a new API built from scratch to deploy Pictarine's own printers and software in stores",
        'Serverless services on GCP: Cloud Functions, Cloud Scheduler and Cloud Run — including a scheduled job syncing Postgres data to Klaviyo every 15 minutes',
        'Migrated transactional emails and push notifications from a legacy Python API to Kotlin',
        'Customer account (V1), from design to integration',
        'Schema design and PostgreSQL migrations; helped set up a first migration system with the Ebean ORM',
        'Ongoing: large-scale, AI-assisted product ingestion (new API and app), and moving the cart from the front end to the backend',
        'Collaboration with Product, Design, Data and Front (iOS, Android, Web) — a technical and product point of view',
      ],
    },
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'GCP', 'Next.js', 'Node.js', 'TypeScript', 'Stripe', 'Docker', 'Python'],
  },
  {
    org: { fr: 'MecaLIFE Group · Toulouse', en: 'MecaLIFE Group · Toulouse' },
    pos: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    when: { fr: 'sept. 2021 – sept. 2022', en: 'Sep 2021 – Sep 2022' },
    bullets: {
      fr: [
        'Plateforme de rapports détaillés de véhicules : une centaine de rapports par mois, équipements et options par marque, année et version',
        "Tarification dynamique par VIN ou immatriculation, et estimation du délai de rapport selon sa complexité et l'agenda des rédacteurs",
        "Plateforme de ventes aux enchères en fin de poste (une vingtaine pendant l'alternance), paiement Stripe",
        'Sécurisation des accès : JWT, gestion des droits utilisateurs',
        'Administration serveur (Apache, PostgreSQL, SSH), automatisation (Python / Bash / cron)',
        'Qualité logicielle & déploiement : tests, CI/CD, GitFlow',
      ],
      en: [
        'Detailed vehicle report platform: around a hundred reports a month, equipment and options by make, year and trim',
        "Dynamic pricing by VIN or licence plate, and report-readiness estimates based on complexity and the report writers' schedules",
        'Auction platform at the end of the role (about twenty auctions during the apprenticeship), Stripe payments',
        'Access security: JWT, user rights management',
        'Server administration (Apache, PostgreSQL, SSH), automation (Python / Bash / cron)',
        'Software quality & delivery: tests, CI/CD, GitFlow',
      ],
    },
    tags: ['PHP', 'Laravel', 'React', 'PostgreSQL', 'Stripe', 'Python', 'Bash'],
  },
  {
    org: { fr: 'MecaLIFE Group · Toulouse', en: 'MecaLIFE Group · Toulouse' },
    pos: { fr: 'Développeur Full Stack — stage', en: 'Full Stack Developer — internship' },
    when: { fr: 'mars – août 2021', en: 'Mar – Aug 2021' },
    bullets: {
      fr: [
        "Outil interne d'aide à la conception de rapports : scores de matching pour estimer les équipements et options les plus probables d'un véhicule",
        'Conception et gestion de la base de données : modélisation, création, migration, administration',
        'Interface web avec recherche et authentification utilisateurs',
        "Mise en place et évolution d'une API : gestion des droits, sécurisation des accès, protection des données",
      ],
      en: [
        'Internal tool to help build reports: matching scores estimating the equipment and options a vehicle most likely carries',
        'Database design and operations: modeling, creation, migration, administration',
        'Web interface with search and user authentication',
        'Built and grew an API: rights management, access security, data protection',
      ],
    },
    tags: ['PostgreSQL', 'JavaScript', 'JWT'],
  },
  {
    org: { fr: 'Réseau Canopé · Saint-Denis, La Réunion', en: 'Réseau Canopé · Saint-Denis, Réunion' },
    pos: { fr: 'Développeur Web (Front & Back)', en: 'Web Developer (Front & Back)' },
    when: { fr: 'janv. – févr. 2020', en: 'Jan – Feb 2020' },
    bullets: {
      fr: [
        'Projet de localisation et de gestion des établissements scolaires',
        'Recueil des besoins, modélisation et création de la base de données (MySQL)',
        'Localisation des établissements sur une carte interactive',
        'Recherche avancée par formulaire, connexion sécurisée & gestion des droits',
        'Restitution du travail à l\'équipe et pistes d\'intégration à leur activité',
      ],
      en: [
        'School location and management project',
        'Requirements gathering, database modeling and creation (MySQL)',
        'Schools plotted on an interactive map',
        'Advanced form search, secure login & rights management',
        'Presented the work back to the team, with next steps for folding it into their process',
      ],
    },
    tags: ['MySQL', 'JavaScript', 'PHP'],
  },
  {
    org: { fr: 'Cegid · Roubaix', en: 'Cegid · Roubaix' },
    pos: { fr: 'Développeur JEE & Angular', en: 'JEE & Angular Developer' },
    when: { fr: 'juin – juil. 2019', en: 'Jun – Jul 2019' },
    bullets: {
      fr: [
        "Outil d'analyse de Thread Dump Java",
        "API : récupération des dumps d'un programme Java, transformation en JSON, exposition HTTP",
        'Interface web de tri des threads',
      ],
      en: [
        'Java Thread Dump analysis tool',
        'API: dump retrieval from a Java program, JSON transformation, HTTP exposure',
        'Web UI for sorting threads',
      ],
    },
    tags: ['Java', 'JEE', 'Angular'],
  },
];

export const EDUCATION: CvEducation[] = [
  {
    yr: '2022 – 2024',
    ti: {
      fr: 'Chef de projet Ingénierie Logicielle — spécialisation IA & Big Data',
      en: 'Software Engineering Project Manager — AI & Big Data',
    },
    sc: "IPI, école d'informatique · Toulouse",
  },
  {
    yr: '2021 – 2022',
    ti: { fr: 'Bachelor — Programmation informatique', en: 'Bachelor — Computer Programming' },
    sc: 'IPI Institut Poly Informatique',
  },
  {
    yr: '2020 – 2021',
    ti: { fr: "L3 MIAGE — Ingénierie des systèmes d'information", en: 'BSc MIAGE — Information Systems Engineering' },
    sc: 'Université Paul Sabatier · Toulouse III',
  },
  {
    yr: '2018 – 2020',
    ti: { fr: 'BTS SIO option SLAM — Développement informatique', en: 'BTS SIO (SLAM) — Software Development' },
    sc: 'Lycée Bellepierre · La Réunion',
  },
  {
    yr: '2015 – 2018',
    ti: { fr: "Baccalauréat — Systèmes d'information de gestion", en: 'Baccalauréat — Management Information Systems' },
    sc: 'Lycée Bellepierre · La Réunion',
  },
];

export const HARD_SKILLS: string[] = [
  'Kotlin',
  'Spring Boot',
  'Java',
  'TypeScript',
  'Next.js',
  'React',
  'Angular',
  'PHP',
  'Laravel',
  'PostgreSQL',
  'MySQL',
  'Docker',
  'GCP',
  'Stripe',
  'Klaviyo',
  'JWT',
  'OAuth2',
  'CI/CD',
  'Python',
  'Bash',
  'Git',
  'Linux',
];
export const SOFT_SKILLS: LocalizedStringArray = {
  fr: ['Communication claire', 'Esprit critique', 'Autonomie', 'Curiosité technique', 'Amélioration continue'],
  en: ['Clear communication', 'Critical thinking', 'Autonomy', 'Technical curiosity', 'Continuous improvement'],
};
export const LANGUAGES: LocalizedStringArray = {
  fr: ['Français — langue maternelle', 'Anglais — professionnel'],
  en: ['French — native', 'English — professional working'],
};

export const WANTS: CvWant[] = [
  {
    lead: { fr: "Le back, l'infra et les bases de données.", en: 'Backend, infrastructure and databases.' },
    rest: { fr: "C'est là que je veux rester.", en: 'That is where I want to stay.' },
  },
  {
    lead: { fr: 'Un endroit où on apprend.', en: 'A place where you learn.' },
    rest: { fr: "C'est ma seule condition non négociable.", en: 'That is my one non-negotiable.' },
  },
  {
    lead: { fr: 'Construire quelque chose de vraiment utile,', en: 'Building something genuinely useful,' },
    rest: { fr: "qui ait du sens — c'est ce que je vise à trois ans.", en: 'with real meaning — that is my three-year aim.' },
  },
];
