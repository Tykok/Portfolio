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
        'Services serverless sur GCP : Cloud Functions, Cloud Scheduler et Cloud Run',
        'Intégrations de paiement (Stripe) et de services tiers (Klaviyo pour le marketing)',
        'Intégration et gestion de compte client',
        "Première version du catalogue produit, de l'intégration à la mise en production",
        'Outil interne en Next.js / TypeScript, créé puis maintenu — adopté par toutes les équipes',
        "Cycle complet : conception, développement, mise en production, analyse d'impact — Docker & monitoring",
        'Collaboration avec Produit, Design, Data et Front (iOS, Android, Web), en agile',
      ],
      en: [
        'Backend APIs in Kotlin / Spring Boot, data on PostgreSQL',
        'Serverless services on GCP: Cloud Functions, Cloud Scheduler and Cloud Run',
        'Payment integrations (Stripe) and third-party services (Klaviyo for marketing)',
        'Customer account onboarding and management',
        'First version of the product catalogue, from integration through to release',
        'Internal tool in Next.js / TypeScript, built then maintained — adopted by every team',
        'Full cycle: design, build, release, impact analysis — Docker & monitoring',
        'Working with Product, Design, Data and Front (iOS, Android, Web), in an agile setup',
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
        'Plateforme de rapports détaillés de véhicules : équipements et options par marque, année et version',
        'Plateforme de ventes aux enchères en fin de poste, et outils internes : APIs REST, modélisation de bases de données',
        'Sécurisation des accès (JWT, droits utilisateurs), paiement Stripe, tarification dynamique',
        'Administration serveur (Apache, PostgreSQL, SSH), automatisation (Python / Bash / cron)',
        'Qualité logicielle & déploiement : tests, CI/CD, GitFlow',
      ],
      en: [
        'Platform for detailed vehicle reports: equipment and options by make, year and trim',
        'An auction platform at the end of the role, plus internal tools: REST APIs, database modeling',
        'Access security (JWT, user rights), Stripe payments, dynamic pricing',
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
        "Outil interne d'aide à la conception de rapports",
        'Conception et gestion de la base de données : modélisation, création, migration, administration',
        'Interface web avec recherche et authentification utilisateurs',
        "Mise en place et évolution d'une API : gestion des droits, sécurisation des accès, protection des données",
      ],
      en: [
        'Internal tool to help design reports',
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
      ],
      en: [
        'School location and management project',
        'Requirements gathering, database modeling and creation (MySQL)',
        'Schools plotted on an interactive map',
        'Advanced form search, secure login & rights management',
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
