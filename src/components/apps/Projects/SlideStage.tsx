import { useRef } from 'react';

import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { CompanySlide } from './CompanySlide';
import { ProjectSlide } from './ProjectSlide';

interface SlideStageProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

/** Past this, a touch is a swipe rather than a tap that wandered. */
const SWIPE_PX = 45;

export function SlideStage({ entries, activeIndex, onSelect }: SlideStageProps) {
  const { t } = useLang();
  const total = entries.length;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= total - 1;
  const active = entries[activeIndex];
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);

  const go = (i: number) => {
    if (i >= 0 && i < total) onSelect(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    else if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  /* Touch and pen only. A mouse drag across a slide is someone selecting text,
     and turning that into a page turn would make the deck unreadable. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    swipeFrom.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from) return;

    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    /* Vertical wins ties: the slide scrolls, and a scroll that also turned the
       page would be unusable. */
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return;

    go(dx < 0 ? activeIndex + 1 : activeIndex - 1);
  };

  return (
    <div
      className="deck-stage"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeFrom.current = null;
      }}
    >
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
