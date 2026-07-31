import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { CompanySlide } from './CompanySlide';
import { ProjectSlide } from './ProjectSlide';

interface SlideStageProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideStage({ entries, activeIndex, onSelect }: SlideStageProps) {
  const { t } = useLang();
  const total = entries.length;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= total - 1;
  const active = entries[activeIndex];

  const go = (i: number) => {
    if (i >= 0 && i < total) onSelect(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    else if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  return (
    <div className="deck-stage" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="deck-scroll" key={activeIndex}>
        {active?.kind === 'personal' && <ProjectSlide project={active.project} />}
        {active?.kind === 'company' && <CompanySlide company={active.company} />}
      </div>

      <button type="button" className="deck-nav prev" aria-label={t('p_prev')} disabled={atStart} onClick={() => go(activeIndex - 1)}>
        ‹
      </button>
      <button type="button" className="deck-nav next" aria-label={t('p_next')} disabled={atEnd} onClick={() => go(activeIndex + 1)}>
        ›
      </button>

      <div className="deck-counter">
        {activeIndex + 1} / {total}
      </div>
    </div>
  );
}
