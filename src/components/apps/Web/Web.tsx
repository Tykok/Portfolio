import { useState } from 'react';

import { useLang } from 'context/LangContext';

import { PortfolioPage } from './PortfolioPage';

interface Tab {
  id: string;
  url: string;
  /** Empty on the home tab — the label is resolved at render so it follows the language. */
  title: string;
}

const HOME_URL = 'about:portfolio';

let tabCounter = 1;
const makeTab = (url = HOME_URL, title = ''): Tab => ({
  id: `t${tabCounter++}`,
  url,
  title: title || (url === HOME_URL ? '' : url),
});

const EXT_LINKS = [
  { label: 'GitHub', url: 'https://github.com/Tykok', color: '#24292f', monogram: 'GH' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/elie-treport', color: '#0a66c2', monogram: 'in' },
  { label: 'Dev.to', url: 'https://dev.to/tykok', color: '#0a0a0a', monogram: 'D' },
  { label: 'Medium', url: 'https://medium.com/@tykok', color: '#191919', monogram: 'M' },
];

export function Web() {
  const { t } = useLang();
  const [tabs, setTabs] = useState<Tab[]>([makeTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addr, setAddr] = useState(HOME_URL);
  const [extUrl, setExtUrl] = useState<string | null>(null);

  const addTab = () => {
    const t = makeTab();
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
    setAddr(HOME_URL);
    setExtUrl(null);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) { addTab(); }
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id && next.length > 0) setActiveTabId(next[next.length - 1].id);
      return next;
    });
  };

  const navigate = (url: string) => {
    if (!url.startsWith('http')) { setAddr(HOME_URL); setExtUrl(null); return; }
    setExtUrl(url);
    setAddr(url);
  };

  return (
    <div className="tq-browser">
      {/* Tab bar */}
      <div className="tq-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tq-tab${tab.id === activeTabId ? ' on' : ''}`}
            onClick={() => { setActiveTabId(tab.id); setAddr(tab.url); setExtUrl(null); }}
          >
            <span className="bt-favi gly">🌐</span>
            <span className="bt-title">{tab.title || t('br_nt_title')}</span>
            <span
              className="bt-close"
              title={t('br_closetab')}
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            >
              ✕
            </span>
          </div>
        ))}
        <button className="tq-tabnew" title={t('br_newtab')} onClick={addTab}>+</button>
      </div>

      {/* Nav bar */}
      <div className="tq-bnav">
        <button className="bnav-btn" title={t('br_back')} aria-label={t('br_back')} disabled>‹</button>
        <button className="bnav-btn" title={t('br_fwd')} aria-label={t('br_fwd')} disabled>›</button>
        <button
          className="bnav-btn"
          title={t('br_reload')}
          aria-label={t('br_reload')}
          onClick={() => { setAddr(HOME_URL); setExtUrl(null); }}
        >
          ⟳
        </button>
        <div className="bnav-addr">
          <span className="bnav-favi">🌐</span>
          <input
            className="bnav-input"
            placeholder={t('br_addr_ph')}
            aria-label={t('br_addr_ph')}
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(addr)}
          />
        </div>
        <button className="bnav-go" onClick={() => navigate(addr)}>{t('br_go')}</button>
      </div>

      {/* Bookmarks */}
      <div className="tq-bmbar">
        {EXT_LINKS.map((l) => (
          <button key={l.label} className="bm-item" onClick={() => navigate(l.url)}>
            <span className="bm-favi letter" style={{ background: l.color, width: 15, height: 15, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>
              {l.monogram}
            </span>
            {l.label}
          </button>
        ))}
        <div className="bm-sep" />
        <button className="bm-item" onClick={() => { setAddr(HOME_URL); setExtUrl(null); }}>
          <span className="bm-favi">🏠</span>
          {t('br_bm_home')}
        </button>
      </div>

      {/* Page content */}
      <div className="tq-bview">
        {extUrl ? (
          /* External link interstitial */
          <div className="tq-bpage tq-extpage">
            <div className="ext-card">
              <div className="ext-ico" style={{ background: '#2f6ff2' }}>↗</div>
              <div className="ext-name">{extUrl.replace(/^https?:\/\//, '').split('/')[0]}</div>
              <div className="ext-url">{extUrl}</div>
              <p className="ext-body">{t('br_ext_body')}</p>
              <a href={extUrl} target="_blank" rel="noreferrer" className="tq-btn is-default ext-btn">
                {t('br_ext_open')} ↗
              </a>
            </div>
          </div>
        ) : (
          <PortfolioPage onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}
