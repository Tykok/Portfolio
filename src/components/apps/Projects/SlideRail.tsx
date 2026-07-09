import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';

interface SlideRailProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideRail({ projects, activeIndex, onSelect }: SlideRailProps) {
  const { lang, t } = useLang();

  return (
    <nav className="deck-rail" aria-label={String(t('p_count_l'))}>
      <div className="hd">{String(t('p_count_l'))} ({projects.length})</div>
      {projects.map((p, i) => (
        <button
          key={p.id}
          type="button"
          className={`deck-thumb${i === activeIndex ? ' on' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={p.title[lang]}
        >
          <span className="deck-thumb-n">{i + 1}</span>
          <span
            className="deck-thumb-ico"
            style={p.cover ? { backgroundImage: `url(${p.cover})`, backgroundSize: 'cover' } : { background: p.gradient }}
          >
            {!p.cover && p.monogram}
          </span>
          <span className="deck-thumb-t">{p.title[lang]}</span>
        </button>
      ))}
    </nav>
  );
}
