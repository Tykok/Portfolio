import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface Company {
  id: string;
  monogram: string;
  gradient: string;
  /** Official logo, self-hosted under /companies. Falls back to `monogram` when absent. */
  logo?: string;
  /** Not localized — a company's name is its name. */
  name: string;
  place: LocalizedString;
  period: LocalizedString;
  /** Job title, plus one or two sentences on scope. */
  role: LocalizedString;
  /** What the company does, for a reader who has never heard of it. */
  what: LocalizedString;
  /** History and scale — public facts `what` has no room for. */
  description?: LocalizedString;
  /** A few real photos, self-hosted under /companies. Skipped entirely where none exist. */
  images?: string[];
  /** The projects and chantiers carried out there. */
  work: LocalizedStringArray;
  stack: string[];
}

export const companies: Company[] = [
  {
    id: 'pictarine',
    monogram: 'PI',
    gradient: 'linear-gradient(135deg,#fb7185,#be123c)',
    logo: '/companies/pictarine.png',
    name: 'Pictarine',
    place: { fr: 'Toulouse', en: 'Toulouse' },
    period: { fr: 'oct. 2022 → présent', en: 'Oct 2022 → present' },
    what: {
      fr: 'Impression photo en magasin : Pictarine développe les applications par lesquelles les clients commandent leurs tirages, retirés ensuite chez de grandes enseignes nord-américaines.',
      en: 'In-store photo printing: Pictarine builds the apps customers order their prints through, then collect from large North American chains.',
    },
    description: {
      fr: "Fondée à Toulouse en 2010, Pictarine a gardé son équipe à Labège tout en construisant une activité presque entièrement américaine, où l'application est distribuée via des milliers de points de retrait partenaires. Un cas plutôt rare de start-up française : l'essentiel de son chiffre d'affaires, plusieurs dizaines de millions d'euros par an, vient d'un marché où elle n'opère quasiment pas elle-même.",
      en: 'Founded in Toulouse in 2010, Pictarine kept its team in Labège while building a business that runs almost entirely on the US market, where the app is distributed through thousands of partner pickup points. A fairly unusual case for a French start-up: most of its yearly revenue, in the tens of millions of euros, comes from a market the company itself barely operates in.',
    },
    images: ['/companies/pictarine-1.jpg', '/companies/pictarine-2.jpg'],
    role: {
      fr: "Backend Engineer. J'interviens sur le cycle produit complet — conception, développement, mise en production — en apportant ma vision technique et en challengeant les choix, pas seulement en les exécutant. Je travaille aussi sur GCP : Cloud Functions, Cloud Scheduler, Cloud Run.",
      en: 'Backend Engineer. I work the full product cycle — design, build, ship — bringing a technical point of view and pushing back on decisions, not just executing them. I also work on GCP: Cloud Functions, Cloud Scheduler, Cloud Run.',
    },
    work: {
      fr: [
        'Outil interne en Next.js pour gérer le catalogue produit (prix, disponibilité, ajout/suppression) — mon premier projet, toujours utilisé par toutes les équipes',
        'Refonte complète du flux de paiement Stripe : échanges API, live activity, système de refund — plusieurs milliers de commandes par mois aux seuls États-Unis',
        'Services serverless sur GCP (Cloud Functions, Cloud Scheduler, Cloud Run), dont la synchronisation Klaviyo toutes les 15 minutes',
        'Migration des emails et push notifications vers Kotlin, intégration Klaviyo',
        'Picta France, une nouvelle API créée de zéro pour déployer imprimantes et logiciel Pictarine en magasin',
        'En cours : catalogue produit assisté par IA, sur une API et une application entièrement nouvelles',
      ],
      en: [
        'Internal tool in Next.js for managing the product catalogue (pricing, availability, add/remove) — my first project, still used by every team',
        'Full rebuild of the Stripe payment flow: API exchanges, live activity, a refund system — several thousand orders a month in the US alone',
        'Serverless services on GCP (Cloud Functions, Cloud Scheduler, Cloud Run), including a Klaviyo sync every 15 minutes',
        'Migrated emails and push notifications to Kotlin, integrated Klaviyo',
        "Picta France, a new API built from scratch to deploy Pictarine's own printers and software in stores",
        'Ongoing: AI-assisted product catalogue, on a brand-new API and app',
      ],
    },
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'GCP', 'Next.js', 'Node.js', 'Python'],
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
    description: {
      fr: "MecaLIFE Group est né à Toulouse en 2020. Sous une même marque, plusieurs services distincts — identification par immatriculation, cotation, historique d'entretien — équipent professionnels et particuliers du marché de l'occasion, chacun sur son propre nom de domaine.",
      en: 'MecaLIFE Group was founded in Toulouse in 2020. Under one brand, several distinct services — VIN/plate identification, pricing, service history — serve both professionals and private buyers in the used-vehicle market, each running on its own subdomain.',
    },
    role: {
      fr: "Full Stack Developer, en stage puis en poste. Front, back, base de données, et l'administration des serveurs Debian avec leur chaîne de déploiement.",
      en: 'Full Stack Developer, first as an intern then on staff. Front, back, database, and the administration of the Debian servers along with their deployment chain.',
    },
    work: {
      fr: [
        'Plateforme de rapports détaillés de véhicules — une centaine de rapports par mois, équipements et options par marque, année et version',
        "Tarification dynamique à partir du VIN ou de l'immatriculation, et estimation du délai de rapport selon sa complexité et l'agenda des rédacteurs",
        "Outil interne de matching équipements/options, pour estimer ce qu'un véhicule embarque probablement",
        "Plateforme de ventes aux enchères en fin de poste (une vingtaine pendant l'alternance), paiement Stripe",
        'Administration des serveurs Debian (Apache, dépendances), CI/CD et déploiement continu',
      ],
      en: [
        'Detailed vehicle report platform — around a hundred reports a month, equipment and options by make, year and trim',
        "Dynamic pricing from a VIN or licence plate, and report-readiness estimates based on complexity and the report writers' schedules",
        'Internal equipment/options matching tool, to estimate what a given vehicle likely carries',
        'Auction platform at the end of the role (about twenty auctions during the apprenticeship), Stripe payments',
        'Debian server administration (Apache, dependencies), CI/CD and continuous deployment',
      ],
    },
    stack: ['PHP', 'Laravel', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'canope',
    monogram: 'RC',
    gradient: 'linear-gradient(135deg,#fbbf24,#b45309)',
    logo: '/companies/canope.svg',
    name: 'Réseau Canopé',
    place: { fr: 'Saint-Denis, La Réunion', en: 'Saint-Denis, Réunion' },
    period: { fr: 'janv. → févr. 2020', en: 'Jan → Feb 2020' },
    what: {
      fr: "Opérateur public de l'Éducation nationale : ressources pédagogiques, livres scolaires, action culturelle. L'antenne de Saint-Denis couvre La Réunion.",
      en: 'A public body of the French education ministry: teaching resources, school books, cultural programmes. The Saint-Denis branch covers Réunion.',
    },
    description: {
      fr: "Héritier du CNDP, établi dès 1954, Réseau Canopé a pris sa forme actuelle en 2014. L'opérateur coordonne aujourd'hui 12 directions territoriales et une centaine d'Ateliers Canopé à travers la France — dont celui de Saint-Denis, où s'est déroulé le stage — et forme chaque année plus de 200 000 enseignants.",
      en: 'The successor to the CNDP, first established in 1954, Réseau Canopé took its current form in 2014. The operator now coordinates 12 regional directorates and around a hundred Ateliers Canopé across France — including the one in Saint-Denis, where the internship took place — training over 200,000 teachers a year.',
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
        "Restitution finale à l'équipe, avec des pistes concrètes pour intégrer le travail à leur activité",
      ],
      en: [
        "A site cataloguing the island's schools on an interactive map",
        'Requirements gathering, modelling and creating the database',
        'Advanced search, secure login and rights management',
        'The point: so the teams could see where activities had already run, and decide where to run new ones',
        'Final presentation to the team, with concrete ideas for folding the work into their day-to-day',
      ],
    },
    stack: ['PHP', 'MySQL', 'JavaScript'],
  },
  {
    id: 'cegid',
    monogram: 'CG',
    gradient: 'linear-gradient(135deg,#2dd4bf,#0f766e)',
    logo: '/companies/cegid.png',
    name: 'Cegid',
    place: { fr: 'Roubaix', en: 'Roubaix' },
    period: { fr: 'juin → juil. 2019', en: 'Jun → Jul 2019' },
    what: {
      fr: 'Éditeur de logiciels de gestion : paie, comptabilité, ERP.',
      en: 'A business software vendor: payroll, accounting, ERP.',
    },
    description: {
      fr: "Fondé en 1983 et basé à Lyon, Cegid est un poids lourd du logiciel de gestion en France, avec plus de 460 millions d'euros de chiffre d'affaires annuel. L'agence de Roubaix, où s'est déroulé le stage, est une de ses implantations régionales.",
      en: 'Founded in 1983 and based in Lyon, Cegid is a major player in French business software, with over €460 million in annual revenue. The Roubaix office, where the internship took place, is one of its regional locations.',
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
