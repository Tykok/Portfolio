import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export type ProjectStatus = 'live' | 'maintained' | 'archived' | 'in-progress' | 'open-source';

export interface StackItem {
  label: string;
  color: string;
}

export interface Project {
  id: string;
  emoji: string;
  monogram: string;
  accent: string;
  gradient: string;
  title: LocalizedString;
  year: string;
  status: { label: LocalizedString; type: ProjectStatus };
  stack: StackItem[];
  tags: string[];
  desc: LocalizedString;
  bullets: LocalizedStringArray;
  repo: string;
  demo: string;
}

export const projects: Project[] = [
  {
    id: 'payments',
    emoji: '🚀',
    monogram: 'PG',
    accent: '#4f5bd5',
    gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
    title: { fr: 'Passerelle de paiement', en: 'Payment Gateway' },
    year: '2024',
    status: { label: { fr: 'En production', en: 'Live' }, type: 'live' },
    stack: [
      { label: 'Go', color: 'blue' },
      { label: 'PostgreSQL', color: 'blue' },
      { label: 'Kafka', color: 'gray' },
      { label: 'Redis', color: 'red' },
    ],
    tags: ['Go', 'PostgreSQL', 'Kafka', 'Redis'],
    desc: {
      fr: 'API de paiement idempotente traitant des milliers de transactions/min, avec reprise sur incident.',
      en: 'Idempotent payment API handling thousands of transactions/min, with failure recovery.',
    },
    bullets: {
      fr: ['Idempotence stricte : payer une fois, vraiment', 'Reprise sur incident & rejeu sûr des transactions', 'p99 sous les 40 ms à plusieurs milliers de req/min'],
      en: ['Strict idempotency: pay once, for real', 'Failure recovery & safe transaction replay', 'p99 under 40 ms at several thousand req/min'],
    },
    repo: '#',
    demo: '#',
  },
  {
    id: 'events',
    emoji: '📦',
    monogram: 'EP',
    accent: '#1f7a8c',
    gradient: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    title: { fr: "Plateforme d'événements", en: 'Event Platform' },
    year: '2024',
    status: { label: { fr: 'En production', en: 'Live' }, type: 'live' },
    stack: [
      { label: 'Python', color: 'yellow' },
      { label: 'Kafka', color: 'gray' },
      { label: 'Redis', color: 'red' },
    ],
    tags: ['Python', 'Kafka', 'Redis'],
    desc: {
      fr: "Bus d'événements interne : ingestion, rejeu et garanties de livraison at-least-once.",
      en: 'Internal event bus: ingestion, replay and at-least-once delivery guarantees.',
    },
    bullets: {
      fr: ['Garanties de livraison at-least-once', 'Rejeu d\'événements horodaté', 'Schéma versionné & validation à l\'ingestion'],
      en: ['At-least-once delivery guarantees', 'Time-stamped event replay', 'Versioned schema & validation on ingest'],
    },
    repo: '#',
    demo: '#',
  },
  {
    id: 'auth',
    emoji: '🔐',
    monogram: 'AS',
    accent: '#3a4250',
    gradient: 'linear-gradient(135deg,#485563,#29323c)',
    title: { fr: "Service d'authentification", en: 'Auth Service' },
    year: '2023',
    status: { label: { fr: 'Maintenu', en: 'Maintained' }, type: 'maintained' },
    stack: [
      { label: 'Go', color: 'blue' },
      { label: 'gRPC', color: 'green' },
      { label: 'Redis', color: 'red' },
    ],
    tags: ['Go', 'gRPC', 'Redis'],
    desc: {
      fr: 'OAuth2 + sessions, rotation de jetons et audit. Latence p99 sous les 20 ms.',
      en: 'OAuth2 + sessions, token rotation and audit. p99 latency under 20 ms.',
    },
    bullets: {
      fr: ['Flows OAuth2 + PKCE', 'Rotation des jetons de rafraîchissement', 'Journal d\'audit signé · p99 < 20 ms'],
      en: ['OAuth2 + PKCE flows', 'Refresh-token rotation', 'Signed audit log · p99 < 20 ms'],
    },
    repo: '#',
    demo: '#',
  },
  {
    id: 'analytics',
    emoji: '📊',
    monogram: 'AP',
    accent: '#147a52',
    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',
    title: { fr: 'Pipeline analytique', en: 'Analytics Pipeline' },
    year: '2023',
    status: { label: { fr: 'Archivé', en: 'Archived' }, type: 'archived' },
    stack: [
      { label: 'Python', color: 'yellow' },
      { label: 'Airflow', color: 'green' },
      { label: 'BigQuery', color: 'blue' },
    ],
    tags: ['Python', 'Airflow', 'BigQuery'],
    desc: {
      fr: 'ETL orchestré, modèles de données versionnés et tableaux de bord temps quasi réel.',
      en: 'Orchestrated ETL, versioned data models and near-real-time dashboards.',
    },
    bullets: {
      fr: ['DAGs Airflow idempotents', 'Modèles de données versionnés', 'Coût de stockage -35 %'],
      en: ['Idempotent Airflow DAGs', 'Versioned data models', 'Storage cost -35%'],
    },
    repo: '#',
    demo: '#',
  },
  {
    id: 'infrabot',
    emoji: '🤖',
    monogram: 'IB',
    accent: '#b03060',
    gradient: 'linear-gradient(135deg,#ec008c,#fc6767)',
    title: { fr: "Bot d'infrastructure", en: 'Infra Bot' },
    year: '2025',
    status: { label: { fr: 'En cours', en: 'In progress' }, type: 'in-progress' },
    stack: [
      { label: 'Go', color: 'blue' },
      { label: 'Kubernetes', color: 'purple' },
    ],
    tags: ['Go', 'Kubernetes'],
    desc: {
      fr: 'ChatOps : déploiements, rollbacks et diagnostics depuis Slack, avec garde-fous.',
      en: 'ChatOps: deploys, rollbacks and diagnostics from Slack, with guardrails.',
    },
    bullets: {
      fr: ['Déploiements & rollbacks depuis Slack', 'Garde-fous et confirmations à deux clés', 'Diagnostics de cluster en un message'],
      en: ['Deploys & rollbacks from Slack', 'Guardrails and two-key confirmations', 'Cluster diagnostics in one message'],
    },
    repo: '#',
    demo: '#',
  },
  {
    id: 'sdk',
    emoji: '🧩',
    monogram: 'SK',
    accent: '#b8860b',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    title: { fr: "SDK d'API publique", en: 'Public API SDK' },
    year: '2022',
    status: { label: { fr: 'Open source', en: 'Open source' }, type: 'open-source' },
    stack: [
      { label: 'TypeScript', color: 'blue' },
      { label: 'OpenAPI', color: 'green' },
    ],
    tags: ['TypeScript', 'OpenAPI'],
    desc: {
      fr: 'Génération de SDK multi-langages depuis une spec OpenAPI, publiée en open source.',
      en: 'Multi-language SDK generation from an OpenAPI spec, released open source.',
    },
    bullets: {
      fr: ['Génération multi-langages depuis OpenAPI', 'Publié et maintenu en open source', 'Tests de contrat sur la spec'],
      en: ['Multi-language generation from OpenAPI', 'Released & maintained open source', 'Contract tests on the spec'],
    },
    repo: '#',
    demo: '#',
  },
];
