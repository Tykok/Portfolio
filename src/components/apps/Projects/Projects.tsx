import { useState } from 'react';

import { useLang } from 'context/LangContext';
import { projects } from 'data/projects';
import { getBadge } from 'data/techBadges';
import type { Project } from 'data/projects';

export function Projects() {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Project>(projects[0]);

  return (
    <div className="pj-B">
      {/* Sidebar */}
      <div className="pj-list">
        <div className="hd">{String(t('p_count_l'))} ({projects.length})</div>
        {projects.map((p) => (
          <div
            key={p.id}
            className={`pj-row${selected.id === p.id ? ' on' : ''}`}
            onClick={() => setSelected(p)}
          >
            <span className="pj-ico" style={{ background: p.gradient, width: 30, height: 30, borderRadius: 9, fontSize: 10.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {p.monogram}
            </span>
            <div>
              <div className="nm">{p.title[lang]}</div>
              <div className="sk">{p.stack.map((s) => s.label).join(', ')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="pj-detail">
        <div className="top">
          <span className="pj-ico" style={{ background: selected.gradient, width: 46, height: 46, borderRadius: 13, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
            {selected.monogram}
          </span>
          <div>
            <div className="pj-nm" style={{ fontSize: 19 }}>{selected.title[lang]}</div>
            <div className="pj-stk" style={{ fontSize: 12 }}>{selected.year} · {selected.status.label[lang]}</div>
          </div>
        </div>

        <p className="desc">{selected.desc[lang]}</p>

        <ul className="pj-bul">
          {selected.bullets[lang].map((b, i) => (
            <li key={i}>
              <span className="ck">✓</span>
              {b}
            </li>
          ))}
        </ul>

        <div className="badges">
          {selected.stack.map((s) => {
            const badge = getBadge(s.label);
            return (
              <div key={s.label} className="pj-chip">
                <span className="pj-bdg" style={{ background: badge.color, width: 17, height: 17, borderRadius: 5, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                  {badge.monogram}
                </span>
                {s.label}
              </div>
            );
          })}
        </div>

        <div className="acts">
          {selected.repo !== '#' && (
            <a href={selected.repo} target="_blank" rel="noreferrer" className="pj-btn">
              ↗ {String(t('p_repo'))}
            </a>
          )}
          {selected.demo !== '#' && (
            <a href={selected.demo} target="_blank" rel="noreferrer" className="pj-btn ghost">
              ▶ {String(t('p_demo'))}
            </a>
          )}
          {selected.repo === '#' && selected.demo === '#' && (
            <span style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic' }}>
              {String(t('p_links_ph'))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
