import { useCallback, useEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';

const START_X = -50; // starting x, just off the left edge
const SPEED = 0.75; // px per frame at 60fps
const WALK_PX_PER_TIP = 300; // px walked between each tip
const TIP_DURATION_MS = 5000; // ms a tip stays visible

export function Mascot() {
  const { mascot, hideMascot } = useOS();
  const { t } = useLang();

  // DOM reference — position is driven directly to avoid 60fps React re-renders
  const coqRef = useRef<HTMLDivElement>(null);

  // Mutable state stored in refs so the RAF closure always sees fresh values
  const posRef = useRef(START_X); // current x position (px)
  const dirRef = useRef<1 | -1>(1); // 1 = right, -1 = left
  const walkedRef = useRef(0); // px walked since last tip
  const pausedRef = useRef(false); // true while a tip is visible
  const tipIdxRef = useRef(0); // cycling index in the tips list
  const rafRef = useRef(0);
  // React 19 requires an explicit initial value, even when it is undefined
  const resumeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // React state — only what needs to trigger a re-render
  const [facingLeft, setFacingLeft] = useState(false);
  const [localTip, setLocalTip] = useState<string | null>(null);

  /* ---- tip logic ---- */
  const showNextTip = useCallback(() => {
    const list = t('mascot_tips');
    const msg = list[tipIdxRef.current % list.length];
    tipIdxRef.current++;

    setLocalTip(msg);
    pausedRef.current = true;
    walkedRef.current = 0;

    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      setLocalTip(null);
      pausedRef.current = false;
    }, TIP_DURATION_MS);
  }, [t]);

  /* ---- RAF walking loop ---- */
  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && coqRef.current) {
        posRef.current += dirRef.current * SPEED;
        walkedRef.current += SPEED;
        coqRef.current.style.left = `${posRef.current}px`;

        // Bounce: walk off-screen then come back from the other side
        const vw = window.innerWidth;
        if (posRef.current > vw + 50 && dirRef.current === 1) {
          dirRef.current = -1;
          setFacingLeft(true);
        } else if (posRef.current < -50 && dirRef.current === -1) {
          dirRef.current = 1;
          setFacingLeft(false);
        }

        // Trigger a tip after walking enough distance
        if (walkedRef.current >= WALK_PX_PER_TIP) {
          showNextTip();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resumeRef.current);
    };
  }, [showNextTip]);

  /* ---- external tip (Terminal cowsay, etc.) overrides local tip ---- */
  const activeTip = mascot.visible ? mascot.msg : localTip;

  const dismissTip = () => {
    if (mascot.visible) {
      hideMascot();
    } else {
      clearTimeout(resumeRef.current);
      setLocalTip(null);
      pausedRef.current = false;
    }
  };

  return (
    <div
      ref={coqRef}
      className="mascot-walker"
      /* Only the first paint — after that the RAF loop writes style.left directly,
         so reading posRef here would be an impure render. */
      style={{ left: START_X }}
    >
      {activeTip && (
        <div className="mascot-bubble mw-bubble">
          {activeTip}
          <span className="mascot-x" onClick={dismissTip}>
            ✕
          </span>
          <span className="mw-tail" />
        </div>
      )}
      <div className={`mw-coq${facingLeft ? ' flip' : ''}`} onClick={dismissTip}>
        <span className="mw-step">🐓</span>
      </div>
    </div>
  );
}
