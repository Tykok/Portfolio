import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';
import { getBadge } from 'data/techBadges';

export function ProjectSlide({ project }: { project: Project }) {
  const { lang, t } = useLang();
  const noLinks = project.repo === '#' && project.demo === '#';

  return (
    <article className="deck-slide">
      {/* Hero */}
      <header className="deck-hero" style={{ background: project.gradient }}>
        {project.cover && <img className="deck-hero-img" src={project.cover} alt="" />}
        <div className="deck-hero-body">
          <span className="deck-monogram">{project.emoji || project.monogram}</span>
          <h2 className="deck-title">{project.title[lang]}</h2>
          <div className="deck-meta">
            <span className="deck-year">{project.year}</span>
            <span className={`deck-status ${project.status.type}`}>
              {project.status.label[lang]}
            </span>
          </div>
        </div>
      </header>

      {/* Pitch */}
      <section className="deck-pitch">
        <p className="deck-desc">{project.desc[lang]}</p>
        {project.role && (
          <p className="deck-role">
            <span className="deck-role-l">{t('p_role')}</span>
            {project.role[lang]}
          </p>
        )}
      </section>

      {/* Highlights */}
      <ul className="deck-bul">
        {project.bullets[lang].map((b, i) => (
          <li key={i}>
            <span className="ck">✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* Stack & links */}
      <section className="deck-foot">
        <div className="deck-badges">
          {project.stack.map((s) => {
            const badge = getBadge(s.label);
            return (
              <div key={s.label} className="pj-chip">
                <span
                  className="pj-bdg"
                  style={{ background: badge.color, width: 17, height: 17, borderRadius: 5, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}
                >
                  {badge.monogram}
                </span>
                {s.label}
              </div>
            );
          })}
        </div>
        <div className="deck-acts">
          {project.repo !== '#' && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="pj-btn">
              ↗ {t('p_repo')}
            </a>
          )}
          {project.demo !== '#' && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="pj-btn ghost">
              ▶ {t('p_demo')}
            </a>
          )}
          {noLinks && (
            <span style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic' }}>
              {t('p_links_ph')}
            </span>
          )}
        </div>
      </section>
    </article>
  );
}
