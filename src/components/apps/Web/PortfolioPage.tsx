import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';
import { useWindowContext } from 'context/WindowContext';
import { identity } from 'data/identity';
import { socials } from 'data/socials';

/* Read from `socials` rather than redeclared here: the LinkedIn URL used to be
   written in both places, and the two had already drifted apart. */
const EXT_LINKS = socials.filter((s) => s.key !== 'email');

interface Props {
  onNavigate: (url: string) => void;
}

export function PortfolioPage({ onNavigate }: Props) {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const { data: projects, loading, error } = useProjects();

  return (
    <div className="np-root">
      {/* Notion-style sticky breadcrumb toolbar */}
      <div className="np-toolbar">
        <span className="np-crumb dim">TicoqOS</span>
        <span className="np-sep">›</span>
        <span className="np-crumb dim">Portfolio</span>
        <span className="np-sep">›</span>
        <span className="np-crumb">{identity.name}</span>
      </div>

      {/* Cover */}
      <div className="np-cover" />

      {/* Page header */}
      <div className="np-hd">
        <div className="np-emoji">🐓</div>
        <h1 className="np-title">{identity.name}</h1>
        <p className="np-role">{identity.role[lang]}</p>
      </div>

      {/* Body */}
      <div className="np-body">
        {/* Properties block — Notion database-style */}
        <div className="np-props">
          <div className="np-prop">
            <span className="np-pk">
              <span className="np-pico">💼</span>
              {t('p_role')}
            </span>
            <span className="np-pv">{identity.role[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk">
              <span className="np-pico">📍</span>
              {t('np_location')}
            </span>
            <span className="np-pv">{identity.location[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk">
              <span className="np-pico">🟢</span>
              {t('np_status')}
            </span>
            <span className="np-pv np-status-pill">{identity.status[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk">
              <span className="np-pico">✉️</span>
              {t('np_email')}
            </span>
            <a className="np-pv np-link-val" href={`mailto:${identity.email}`}>
              {identity.email}
            </a>
          </div>
          <div className="np-prop">
            <span className="np-pk">
              <span className="np-pico">🐙</span>GitHub
            </span>
            <span className="np-pv np-link-val" onClick={() => onNavigate(identity.githubUrl)}>
              {identity.github} ↗
            </span>
          </div>
        </div>

        {/* Bio callout */}
        <div className="np-callout">
          <span className="np-callout-ico">💡</span>
          <span className="np-callout-body">
            {identity.bio[lang].split('\n\n').map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </span>
        </div>

        <div className="np-divider" />

        {/* Projects — Notion database table */}
        <div className="np-h2">
          <span>💼</span>
          {t('p_count_l')}
        </div>
        <div className="np-db">
          <div className="np-db-head">
            <span className="np-dh" style={{ flex: '1 1 auto' }}>
              {t('np_name')}
            </span>
            <span className="np-dh np-hide-sm">{t('np_stack')}</span>
            <span className="np-dh">{t('np_status')}</span>
            <span className="np-dh np-yr-col">{t('np_year')}</span>
          </div>
          {loading && (
            <div className="np-dbrow np-db-state">
              <ChickenLoader label={t('projects_loading')} />
            </div>
          )}
          {!loading && error && <div className="np-dbrow np-db-state">{t('projects_error')}</div>}
          {!loading &&
            !error &&
            projects.map((p) => (
              <div className="np-dbrow" key={p.id} onClick={() => openApp('projects')} title={t('np_open_projects')}>
                <span className="np-db-ico">{p.emoji}</span>
                <span className="np-db-name">{p.title[lang]}</span>
                <span className="np-db-tags np-hide-sm">
                  {p.stack.slice(0, 2).map((tech) => (
                    <span key={tech} className="np-tag">
                      {tech}
                    </span>
                  ))}
                </span>
                <span className={`np-badge np-st-${p.status.type}`}>{p.status.label[lang]}</span>
                <span className="np-yr">{p.year}</span>
              </div>
            ))}
        </div>

        <div className="np-divider" />

        {/* Links */}
        <div className="np-h2">
          <span>🔗</span>
          {t('np_links')}
        </div>
        <div className="np-linklist">
          {EXT_LINKS.map((l) => (
            <div key={l.key} className="np-extlink" onClick={() => onNavigate(l.href)}>
              <span className="np-extlink-dot" style={{ background: l.color }}>
                {l.monogram}
              </span>
              <span className="np-extlink-name">{l.label}</span>
              <span className="np-extlink-arr">↗</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
