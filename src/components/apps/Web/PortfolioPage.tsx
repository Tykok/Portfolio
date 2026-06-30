import { identity } from 'data/identity';
import { projects } from 'data/projects';
import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';

const EXT_LINKS = [
  { label: 'GitHub',   url: 'https://github.com/Tykok',               color: '#24292f', mono: 'GH' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/elie-treport',   color: '#0a66c2', mono: 'in' },
  { label: 'Dev.to',   url: 'https://dev.to/tykok',                   color: '#0a0a0a', mono: 'D'  },
];

interface Props {
  onNavigate: (url: string) => void;
}

export function PortfolioPage({ onNavigate }: Props) {
  const { lang } = useLang();
  const { openApp } = useWindowContext();

  return (
    <div className="np-root">

      {/* Notion-style sticky breadcrumb toolbar */}
      <div className="np-toolbar">
        <span className="np-crumb dim">TicoqOS</span>
        <span className="np-sep">›</span>
        <span className="np-crumb dim">{lang === 'fr' ? 'Portfolio' : 'Portfolio'}</span>
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
            <span className="np-pk"><span className="np-pico">💼</span>{lang === 'fr' ? 'Rôle' : 'Role'}</span>
            <span className="np-pv">{identity.role[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk"><span className="np-pico">📍</span>{lang === 'fr' ? 'Ville' : 'Location'}</span>
            <span className="np-pv">{identity.location[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk"><span className="np-pico">🟢</span>Status</span>
            <span className="np-pv np-status-pill">{identity.status[lang]}</span>
          </div>
          <div className="np-prop">
            <span className="np-pk"><span className="np-pico">✉️</span>Email</span>
            <span className="np-pv np-link-val" onClick={() => {}}>
              {identity.email}
            </span>
          </div>
          <div className="np-prop">
            <span className="np-pk"><span className="np-pico">🐙</span>GitHub</span>
            <span className="np-pv np-link-val" onClick={() => onNavigate(identity.githubUrl)}>
              {identity.github} ↗
            </span>
          </div>
        </div>

        {/* Bio callout */}
        <div className="np-callout">
          <span className="np-callout-ico">💡</span>
          <span className="np-callout-body">{identity.bio[lang]}</span>
        </div>

        <div className="np-divider" />

        {/* Projects — Notion database table */}
        <div className="np-h2">
          <span>💼</span>
          {lang === 'fr' ? 'Projets' : 'Projects'}
        </div>
        <div className="np-db">
          <div className="np-db-head">
            <span className="np-dh" style={{ flex: '1 1 auto' }}>{lang === 'fr' ? 'Nom' : 'Name'}</span>
            <span className="np-dh np-hide-sm">Stack</span>
            <span className="np-dh">Status</span>
            <span className="np-dh np-yr-col">{lang === 'fr' ? 'Année' : 'Year'}</span>
          </div>
          {projects.map((p) => (
            <div className="np-dbrow" key={p.id} onClick={() => openApp('projects')} title={lang === 'fr' ? 'Ouvrir Projets' : 'Open Projects'}>
              <span className="np-db-ico">{p.emoji}</span>
              <span className="np-db-name">{p.title[lang]}</span>
              <span className="np-db-tags np-hide-sm">
                {p.stack.slice(0, 2).map((s) => (
                  <span key={s.label} className="np-tag">{s.label}</span>
                ))}
              </span>
              <span className={`np-badge np-st-${p.status.type}`}>
                {p.status.label[lang]}
              </span>
              <span className="np-yr">{p.year}</span>
            </div>
          ))}
        </div>

        <div className="np-divider" />

        {/* Links */}
        <div className="np-h2">
          <span>🔗</span>
          {lang === 'fr' ? 'Liens' : 'Links'}
        </div>
        <div className="np-linklist">
          {EXT_LINKS.map((l) => (
            <div key={l.label} className="np-extlink" onClick={() => onNavigate(l.url)}>
              <span
                className="np-extlink-dot"
                style={{ background: l.color }}
              >
                {l.mono}
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
