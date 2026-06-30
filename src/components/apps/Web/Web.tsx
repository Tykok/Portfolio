import { useState } from 'react';

import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';
import type { AppKey } from 'types/app';
import { PortfolioPage } from './PortfolioPage';

interface Tab {
  id: string;
  url: string;
  title: string;
}

const HOME_URL = 'about:portfolio';

let tabCounter = 1;
const makeTab = (url = HOME_URL, title = ''): Tab => ({
  id: `t${tabCounter++}`,
  url,
  title: title || (url === HOME_URL ? 'Nouvel onglet' : url),
});

const SPEED_DIAL: Array<{ emoji: string; label: string; labelEn: string; appKey: AppKey }> = [
  { emoji: '💻', label: 'À propos', labelEn: 'About', appKey: 'about' },
  { emoji: '📁', label: 'Projets', labelEn: 'Projects', appKey: 'projects' },
  { emoji: '📄', label: 'CV', labelEn: 'Résumé', appKey: 'cv' },
  { emoji: '✉️', label: 'Contact', labelEn: 'Contact', appKey: 'contact' },
  { emoji: '⌨', label: 'Terminal', labelEn: 'Terminal', appKey: 'terminal' },
  { emoji: '🎵', label: 'Lecteur', labelEn: 'Media', appKey: 'media' },
];

const EXT_LINKS = [
  { label: 'GitHub', url: 'https://github.com/Tykok', color: '#24292f', monogram: 'GH' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/elie-treport', color: '#0a66c2', monogram: 'in' },
  { label: 'Dev.to', url: 'https://dev.to/tykok', color: '#0a0a0a', monogram: 'D' },
];

export function Web() {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const [tabs, setTabs] = useState<Tab[]>([makeTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addr, setAddr] = useState(HOME_URL);
  const [extUrl, setExtUrl] = useState<string | null>(null);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

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

  const openPortfolioApp = (key: AppKey) => { openApp(key); };

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
            <span className="bt-title">{tab.title}</span>
            <span className="bt-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>✕</span>
          </div>
        ))}
        <button className="tq-tabnew" onClick={addTab}>+</button>
      </div>

      {/* Nav bar */}
      <div className="tq-bnav">
        <button className="bnav-btn" disabled>‹</button>
        <button className="bnav-btn" disabled>›</button>
        <button className="bnav-btn" onClick={() => { setAddr(HOME_URL); setExtUrl(null); }}>⟳</button>
        <div className="bnav-addr">
          <span className="bnav-favi">🌐</span>
          <input
            className="bnav-input"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(addr)}
          />
        </div>
        <button className="bnav-go" onClick={() => navigate(addr)}>{String(t('br_go'))}</button>
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
          {String(t('br_bm_home'))}
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
              <p className="ext-body">{String(t('br_ext_body'))}</p>
              <a href={extUrl} target="_blank" rel="noreferrer" className="tq-btn is-default ext-btn">
                {String(t('br_ext_open'))} ↗
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
