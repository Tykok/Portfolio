import { useLayoutEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { CompanySlide } from './CompanySlide';
import { ProjectSlide } from './ProjectSlide';
import { SlideDots } from './SlideDots';

interface SlideStageProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

/** Past this, a touch is a swipe rather than a tap that wandered. */
const SWIPE_PX = 45;
/** Below this the drag has no direction yet, so neither axis may claim it. */
const AXIS_PX = 8;
/* Past the first and last slide there is nothing to pull in. The track still
   answers the finger, at a third of the distance, rather than going rigid —
   the give is what says "this is the end", where a frozen deck reads as a bug. */
const EDGE_PULL = 1 / 3;

function slideOf(entry: DeckEntry | undefined) {
  if (entry?.kind === 'personal') return <ProjectSlide project={entry.project} />;
  if (entry?.kind === 'company') return <CompanySlide company={entry.company} />;
  return null;
}

export function SlideStage({ entries, activeIndex, onSelect }: SlideStageProps) {
  const { t } = useLang();
  const total = entries.length;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= total - 1;

  /* The track holds the slide before and the slide after, so a drag reveals
     the real neighbour rather than empty space. They are mounted only for the
     duration of the gesture: a company slide carries a hero image and photos,
     and loading three slides' worth up front to serve a gesture most visitors
     never make is a poor trade on a phone. */
  const stageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);
  const [settling, setSettling] = useState(false);
  const dragging = drag !== 0 || settling;

  const from = useRef<{ x: number; y: number } | null>(null);
  /* Which axis owns the gesture. Decided once, at the first few pixels, and
     held: a swipe that drifts vertically mid-turn must not hand the page back
     to the scroller halfway through. */
  const axis = useRef<'none' | 'x' | 'y'>('none');
  /* Set when a release has committed to a neighbour; read by the layout effect
     below, which cannot tell a committed turn from any other re-render. */
  const settleFrom = useRef(false);

  const go = (i: number) => {
    if (i >= 0 && i < total) onSelect(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    else if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  const pull = (dx: number) => ((dx < 0 && atEnd) || (dx > 0 && atStart) ? dx * EDGE_PULL : dx);

  /* Touch and pen only. A mouse drag across a slide is someone selecting text,
     and turning that into a page turn would make the deck unreadable. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    /* A finger that wanders off the stage mid-drag — over a nav button, past
       the window edge — must keep feeding this handler, or the track is left
       parked wherever the last event reached. Optional because jsdom has no
       pointer capture, and the tests are none the worse for it. */
    e.currentTarget.setPointerCapture?.(e.pointerId);
    from.current = { x: e.clientX, y: e.clientY };
    axis.current = 'none';
    setSettling(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const start = from.current;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (axis.current === 'none') {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_PX) return;
      /* Vertical wins ties: the slide scrolls, and a scroll that also turned
         the page would be unusable. */
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis.current === 'y') return;

    setDrag(pull(dx));
  };

  const release = () => {
    from.current = null;
    axis.current = 'none';
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = from.current;
    const wasVertical = axis.current === 'y';
    release();
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const turns = !wasVertical && Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy);
    const next = dx < 0 ? activeIndex + 1 : activeIndex - 1;
    if (!turns || next < 0 || next >= total) {
      setSettling(true);
      setDrag(0);
      return;
    }

    /* Hand the new slide the screen position the old one was dragged to, then
       let it travel the rest of the way on its own. Committing straight to a
       centred track would snap the slide out from under the finger. */
    const width = stageRef.current?.clientWidth ?? 0;
    setSettling(false);
    setDrag(dx < 0 ? dx + width : dx - width);
    settleFrom.current = true;
    onSelect(next);
  };

  /* The compensating offset above has to be painted before the slide animates
     out of it — set both in one frame and the browser sees only the end state,
     which is the snap this exists to avoid. */
  useLayoutEffect(() => {
    if (!settleFrom.current) return;
    settleFrom.current = false;
    const frame = requestAnimationFrame(() => {
      setSettling(true);
      setDrag(0);
    });
    return () => cancelAnimationFrame(frame);
  });

  return (
    <div
      className="deck-stage"
      ref={stageRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        release();
        setSettling(true);
        setDrag(0);
      }}
    >
      <div
        className={`deck-track${settling ? ' settle' : ''}`}
        style={{ transform: `translate3d(calc(-100% + ${drag}px), 0px, 0px)` }}
        onTransitionEnd={() => setSettling(false)}
      >
        <div className="deck-cell">{dragging && slideOf(entries[activeIndex - 1])}</div>
        {/* Keyed so a slide picked from the rail or the arrows animates in.
            Not while settling: there the slide is already on screen, under the
            finger, and fading it in would undo the gesture that put it there. */}
        <div className={`deck-cell deck-scroll${settling ? '' : ' deck-enter'}`} key={activeIndex}>
          {slideOf(entries[activeIndex])}
        </div>
        <div className="deck-cell">{dragging && slideOf(entries[activeIndex + 1])}</div>
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

      <SlideDots entries={entries} activeIndex={activeIndex} onSelect={onSelect} />
    </div>
  );
}
