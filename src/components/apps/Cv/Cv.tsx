import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { getBadge } from 'data/techBadges';

const EXPERIENCE = [
  {
    org: { fr: 'Startup FinTech (confidentiel)', en: 'FinTech Startup (confidential)' },
    pos: { fr: 'Développeur Backend Senior', en: 'Senior Backend Developer' },
    when: '2023 – présent',
    bullets: {
      fr: ['Passerelle de paiement idempotente (Go + Kafka) : milliers de tx/min, p99 < 40 ms', 'Bus d\'événements interne : at-least-once delivery + rejeu horodaté', 'Migration PostgreSQL sans downtime sur 50M+ lignes'],
      en: ['Idempotent payment gateway (Go + Kafka): thousands of tx/min, p99 < 40 ms', 'Internal event bus: at-least-once delivery + time-stamped replay', 'Zero-downtime PostgreSQL migration on 50M+ rows'],
    },
    tags: ['Go', 'Kafka', 'PostgreSQL', 'Redis'],
  },
  {
    org: { fr: 'Agence web · Toulouse', en: 'Web agency · Toulouse' },
    pos: { fr: 'Développeur Fullstack', en: 'Fullstack Developer' },
    when: '2021 – 2023',
    bullets: {
      fr: ['Service OAuth2 + sessions (Go / gRPC) : p99 < 20 ms', 'SDK multi-langages généré depuis spec OpenAPI — publié en open source', 'APIs REST & microservices pour 3 clients e-commerce'],
      en: ['OAuth2 + sessions service (Go / gRPC): p99 < 20 ms', 'Multi-language SDK generated from OpenAPI spec — released open source', 'REST APIs & microservices for 3 e-commerce clients'],
    },
    tags: ['Go', 'gRPC', 'TypeScript', 'OpenAPI'],
  },
  {
    org: { fr: 'Mission freelance', en: 'Freelance project' },
    pos: { fr: 'Ingénieur Données', en: 'Data Engineer' },
    when: '2022',
    bullets: {
      fr: ['Pipeline ETL orchestré avec Airflow (DAGs idempotents)', 'Tableaux de bord BigQuery quasi temps réel · réduction des coûts stockage –35 %'],
      en: ['ETL pipeline orchestrated with Airflow (idempotent DAGs)', 'Near-real-time BigQuery dashboards · storage cost reduction –35%'],
    },
    tags: ['Python', 'Airflow', 'BigQuery'],
  },
];

const EDUCATION = [
  { yr: '2019 – 2021', ti: { fr: 'BUT Informatique', en: 'Computer Science Degree (BUT)' }, sc: 'IUT · Toulouse' },
  { yr: '2019', ti: { fr: 'Baccalauréat STI2D', en: 'Technology Baccalaureate (STI2D)' }, sc: 'Lycée · Toulouse' },
];

const HARD_SKILLS = ['Go', 'TypeScript', 'Python', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'gRPC', 'Git', 'Linux'];
const SOFT_SKILLS_FR = ['Communication claire', 'Autonomie', 'Code maintenable', 'Curiosité technique'];
const SOFT_SKILLS_EN = ['Clear communication', 'Autonomy', 'Maintainable code', 'Technical curiosity'];
const LANGUAGES_FR = ['Français — natif', 'Anglais — professionnel (B2)'];
const LANGUAGES_EN = ['French — native', 'English — professional (B2)'];

export function Cv() {
  const { lang, t } = useLang();

  const handlePrint = () => window.print();

  return (
    <div className="cv2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="cv2-tb">
        <button className="cv2-act primary" onClick={handlePrint}>{String(t('cv_print'))}</button>
        <button className="cv2-act" style={{ opacity: 0.5, cursor: 'default' }}>{String(t('cv_dl'))}</button>
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
              <h2>{String(t('cv_exp'))}</h2>
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
              <h2>{String(t('cv_edu'))}</h2>
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
              <h3>{String(t('cv_skills'))}</h3>
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
              <h3>{String(t('cv_soft'))}</h3>
              <div className="wrap">
                {(lang === 'fr' ? SOFT_SKILLS_FR : SOFT_SKILLS_EN).map((s) => (
                  <span key={s} className="cv2-soft">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h3>{String(t('cv_lang'))}</h3>
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
