import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { getBadge } from 'data/techBadges';

const EXPERIENCE = [
  {
    org: { fr: 'Pictarine · Toulouse', en: 'Pictarine · Toulouse' },
    pos: { fr: 'Développeur Back-End', en: 'Back-End Developer' },
    when: '2022 – présent',
    bullets: {
      fr: ['APIs backend en Kotlin / Spring Boot avec PostgreSQL', 'Intégrations de paiement (Stripe) et de services tiers (Klaviyo)', 'Tooling interne (Next.js / TypeScript) utilisé par toutes les équipes', 'Cycle complet : conception, mise en production, analyse d\'impact — Docker & monitoring'],
      en: ['Backend APIs in Kotlin / Spring Boot with PostgreSQL', 'Payment integrations (Stripe) and third-party services (Klaviyo)', 'Internal tooling (Next.js / TypeScript) used across all teams', 'Full feature cycle: design, release, impact analysis — Docker & monitoring'],
    },
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Stripe', 'Next.js'],
  },
  {
    org: { fr: 'MecaLIFE Group · Toulouse', en: 'MecaLIFE Group · Toulouse' },
    pos: { fr: 'Développeur Full Stack', en: 'Full Stack Developer' },
    when: '2021 – 2022',
    bullets: {
      fr: ['Plateforme de ventes aux enchères & outils internes : APIs REST, modélisation BDD', 'Sécurisation des accès (JWT, droits utilisateurs), paiement Stripe, tarification dynamique', 'Admin serveur (Apache, PostgreSQL, SSH), automatisation (Python / Bash / cron)', 'Qualité logicielle & déploiement : tests, CI/CD, GitFlow'],
      en: ['Auction platform & internal tools: REST APIs, database modeling', 'Access security (JWT, user rights), Stripe payments, dynamic pricing', 'Server admin (Apache, PostgreSQL, SSH), automation (Python / Bash / cron)', 'Software quality & delivery: tests, CI/CD, GitFlow'],
    },
    tags: ['TypeScript', 'PostgreSQL', 'Stripe', 'Python', 'Bash'],
  },
  {
    org: { fr: 'Réseau Canopé · La Réunion', en: 'Réseau Canopé · Réunion' },
    pos: { fr: 'Développeur Web (Front & Back)', en: 'Web Developer (Front & Back)' },
    when: '2020',
    bullets: {
      fr: ['Localisation des établissements scolaires sur carte interactive', 'Recherche avancée par formulaire, connexion sécurisée & gestion des droits', 'Modélisation et création de la base de données (MySQL)'],
      en: ['School locator on an interactive map', 'Advanced form search, secure login & rights management', 'Database modeling and creation (MySQL)'],
    },
    tags: ['MySQL', 'JavaScript', 'PHP'],
  },
  {
    org: { fr: 'Cegid · Roubaix', en: 'Cegid · Roubaix' },
    pos: { fr: 'Développeur JEE & Angular', en: 'JEE & Angular Developer' },
    when: '2019',
    bullets: {
      fr: ['Outil d\'analyse de Thread Dump Java', 'API : récupération des dumps, transformation JSON, exposition HTTP', 'Interface web de tri des threads'],
      en: ['Java Thread Dump analysis tool', 'API: dump retrieval, JSON transformation, HTTP exposure', 'Web UI for thread sorting'],
    },
    tags: ['Java', 'JEE', 'Angular'],
  },
];

const EDUCATION = [
  { yr: '2022 – 2024', ti: { fr: 'Chef de projet Ingénierie Logicielle — IA & Big Data', en: 'Software Engineering Project Manager — AI & Big Data' }, sc: 'IPI · Toulouse' },
  { yr: '2020 – 2021', ti: { fr: 'L3 MIAGE — Ingénierie des systèmes d\'information', en: 'BSc MIAGE — Information Systems Engineering' }, sc: 'Université Paul Sabatier · Toulouse III' },
  { yr: '2018 – 2020', ti: { fr: 'BTS SIO option SLAM — Développement', en: 'BTS SIO (SLAM) — Software Development' }, sc: 'Lycée Bellepierre · La Réunion' },
];

const HARD_SKILLS = ['Kotlin', 'Spring Boot', 'TypeScript', 'Next.js', 'PostgreSQL', 'MySQL', 'Docker', 'Stripe', 'Python', 'Git', 'Linux'];
const SOFT_SKILLS_FR = ['Communication claire', 'Autonomie', 'Esprit critique', 'Curiosité technique'];
const SOFT_SKILLS_EN = ['Clear communication', 'Autonomy', 'Critical thinking', 'Technical curiosity'];
const LANGUAGES_FR = ['Français — natif', 'Anglais — professionnel'];
const LANGUAGES_EN = ['French — native', 'English — professional'];

export function Cv() {
  const { lang, t } = useLang();

  const handlePrint = () => window.print();

  return (
    <div className="cv2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="cv2-tb">
        <button className="cv2-act primary" onClick={handlePrint}>{t('cv_print')}</button>
        <button className="cv2-act" style={{ opacity: 0.5, cursor: 'default' }}>{t('cv_dl')}</button>
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

        <p className="cv2-profile">{identity.bio[lang]}</p>

        {/* Two-column body */}
        <div className="cv2-cols">
          {/* Main column */}
          <div>
            <div className="cv2-sec">
              <h2>{t('cv_exp')}</h2>
              {EXPERIENCE.map((xp, i) => (
                <div key={i} className="cv2-xp">
                  <div className="when">{xp.when}</div>
                  <div className="org">{xp.org[lang]}</div>
                  <div className="pos">{xp.pos[lang]}</div>
                  <ul>
                    {xp.bullets[lang].map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                  <div className="cv2-tags">
                    {xp.tags.map((tag) => <span key={tag} className="cv2-tag">{tag}</span>)}
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
                {(lang === 'fr' ? SOFT_SKILLS_FR : SOFT_SKILLS_EN).map((s) => (
                  <span key={s} className="cv2-soft">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_lang')}</h3>
              <div className="wrap" style={{ flexDirection: 'column', gap: 4 }}>
                {(lang === 'fr' ? LANGUAGES_FR : LANGUAGES_EN).map((l) => (
                  <span key={l} style={{ fontSize: 12, color: 'var(--ink)' }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
