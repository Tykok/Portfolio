import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { getBadge } from 'data/techBadges';
import type { LocalizedStringArray } from 'types/lang';

const EXPERIENCE = [
  {
    org: { fr: 'Pictarine · Toulouse', en: 'Pictarine · Toulouse' },
    pos: { fr: 'Développeur Back-End', en: 'Back-End Developer' },
    when: { fr: 'oct. 2024 – présent', en: 'Oct 2024 – present' },
    bullets: {
      fr: [
        'APIs backend en Kotlin / Spring Boot, données sur PostgreSQL',
        'Intégrations de paiement (Stripe) et de services tiers (Klaviyo pour le marketing)',
        'Intégration et gestion de compte client',
        'Maintenance et évolution du tooling interne utilisé par toutes les équipes',
        'Collaboration avec Produit, Design, Data et Front (iOS, Android, Web)',
        "Cycle complet : conception, développement, mise en production, analyse d'impact — Docker & monitoring",
      ],
      en: [
        'Backend APIs in Kotlin / Spring Boot, data on PostgreSQL',
        'Payment integrations (Stripe) and third-party services (Klaviyo for marketing)',
        'Customer account onboarding and management',
        'Maintenance and evolution of the internal tooling used by every team',
        'Working with Product, Design, Data and Front (iOS, Android, Web)',
        'Full cycle: design, build, release, impact analysis — Docker & monitoring',
      ],
    },
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Stripe', 'Docker'],
  },
  {
    org: { fr: 'Pictarine · Toulouse', en: 'Pictarine · Toulouse' },
    pos: { fr: 'Développeur Back-End', en: 'Back-End Developer' },
    when: { fr: 'oct. 2022 – oct. 2024', en: 'Oct 2022 – Oct 2024' },
    bullets: {
      fr: [
        'APIs backend en Kotlin / Spring Boot',
        "Intégration d'une première version du catalogue produit",
        "Évolution de la gestion du paiement utilisateur dans l'application (Stripe)",
        "Création d'un outil interne (Next.js / TypeScript) utilisé par plusieurs équipes",
        'Amélioration et maintenance de services existants, gestion des données sous PostgreSQL',
        'Environnement agile avec les équipes Produit et Techniques',
      ],
      en: [
        'Backend APIs in Kotlin / Spring Boot',
        'Shipped a first version of the product catalogue',
        'Grew in-app user payment handling (Stripe)',
        'Built an internal tool (Next.js / TypeScript) used by several teams',
        'Improved and maintained existing services, data handling on PostgreSQL',
        'Agile environment alongside Product and Engineering teams',
      ],
    },
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Next.js', 'TypeScript'],
  },
  {
    org: { fr: 'MecaLIFE Group · Toulouse', en: 'MecaLIFE Group · Toulouse' },
    pos: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    when: { fr: 'sept. 2021 – sept. 2022', en: 'Sep 2021 – Sep 2022' },
    bullets: {
      fr: [
        'Plateforme de ventes aux enchères & outils internes : APIs REST, modélisation de bases de données',
        'Sécurisation des accès (JWT, droits utilisateurs), paiement Stripe, tarification dynamique',
        'Administration serveur (Apache, PostgreSQL, SSH), automatisation (Python / Bash / cron)',
        'Qualité logicielle & déploiement : tests, CI/CD, GitFlow',
      ],
      en: [
        'Auction platform & internal tools: REST APIs, database modeling',
        'Access security (JWT, user rights), Stripe payments, dynamic pricing',
        'Server administration (Apache, PostgreSQL, SSH), automation (Python / Bash / cron)',
        'Software quality & delivery: tests, CI/CD, GitFlow',
      ],
    },
    tags: ['TypeScript', 'PostgreSQL', 'Stripe', 'Python', 'Bash'],
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

const EDUCATION = [
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

const HARD_SKILLS = [
  'Kotlin',
  'Spring Boot',
  'Java',
  'TypeScript',
  'Next.js',
  'PostgreSQL',
  'MySQL',
  'Docker',
  'Stripe',
  'Python',
  'Bash',
  'Git',
  'Linux',
];
const SOFT_SKILLS: LocalizedStringArray = {
  fr: ['Communication claire', 'Esprit critique', 'Autonomie', 'Curiosité technique', 'Amélioration continue'],
  en: ['Clear communication', 'Critical thinking', 'Autonomy', 'Technical curiosity', 'Continuous improvement'],
};
const LANGUAGES: LocalizedStringArray = {
  fr: ['Français — langue maternelle', 'Anglais — professionnel'],
  en: ['French — native', 'English — professional working'],
};

export function Cv() {
  const { lang, t } = useLang();

  const handlePrint = () => window.print();

  return (
    <div className="cv2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="cv2-tb">
        <button className="cv2-act primary" onClick={handlePrint}>
          {t('cv_print')}
        </button>
        <button className="cv2-act" style={{ opacity: 0.5, cursor: 'default' }}>
          {t('cv_dl')}
        </button>
      </div>

      <div className="cv2-body">
        {/* Header */}
        <div className="cv2-head">
          <h1 className="cv2-nm">{identity.name}</h1>
          <div className="cv2-role">{identity.role[lang]}</div>
          <div className="cv2-contact">
            <b>{identity.email}</b>
            <i>·</i>
            <span>{identity.github}</span>
            <i>·</i>
            <span>{identity.location[lang]}</span>
          </div>
        </div>

        {identity.bio[lang].split('\n\n').map((para) => (
          <p key={para.slice(0, 24)} className="cv2-profile">
            {para}
          </p>
        ))}

        {/* Two-column body */}
        <div className="cv2-cols">
          {/* Main column */}
          <div>
            <div className="cv2-sec">
              <h2>{t('cv_exp')}</h2>
              {EXPERIENCE.map((xp, i) => (
                <div key={i} className="cv2-xp">
                  <div className="when">{xp.when[lang]}</div>
                  <div className="org">{xp.org[lang]}</div>
                  <div className="pos">{xp.pos[lang]}</div>
                  <ul>
                    {xp.bullets[lang].map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                  <div className="cv2-tags">
                    {xp.tags.map((tag) => (
                      <span key={tag} className="cv2-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="cv2-sec">
              <h2>{t('cv_edu')}</h2>
              {EDUCATION.map((ed, i) => (
                <div key={i} className="cv2-edu">
                  <div className="yr">{ed.yr}</div>
                  <div className="ti">{ed.ti[lang]}</div>
                  <div className="sc">{ed.sc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Side column */}
          <div className="cv2-side">
            <div>
              <h3>{t('cv_skills')}</h3>
              <div className="wrap">
                {HARD_SKILLS.map((tech) => {
                  const badge = getBadge(tech);
                  return (
                    <div key={tech} className="cv2-skill">
                      <span className="cvb" style={{ background: badge.color }}>
                        {badge.monogram}
                      </span>
                      {tech}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3>{t('cv_soft')}</h3>
              <div className="wrap">
                {SOFT_SKILLS[lang].map((s) => (
                  <span key={s} className="cv2-soft">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_lang')}</h3>
              <div className="wrap" style={{ flexDirection: 'column', gap: 4 }}>
                {LANGUAGES[lang].map((l) => (
                  <span key={l} style={{ fontSize: 12, color: 'var(--ink)' }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_interests')}</h3>
              <div className="wrap">
                {identity.interests[lang].map((i) => (
                  <span key={i} className="cv2-soft">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
