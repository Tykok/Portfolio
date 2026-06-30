import { useCallback, useEffect, useRef, useState } from 'react';

import { useOS } from 'context/OSContext';
import { useLang } from 'context/LangContext';

const TIPS: Record<'fr' | 'en', string[]> = {
  fr: [
    'Double-clique sur une icône pour l\'ouvrir !',
    'Tu peux glisser les icônes du bureau n\'importe où.',
    'Essaie le Konami Code : ↑↑↓↓←→←→BA 🤫',
    'Clic droit sur le bureau pour changer de thème.',
    'Le terminal connaît `neofetch`, `cowsay` et `easter`…',
    'Elie est ouvert aux nouvelles opportunités !',
    'Clique sur l\'horloge pour voir le calendrier.',
    'Je suis Cocorico, mascotte de TicoqOS 🐓',
    'Les fenêtres se redimensionnent par le coin bas-droit.',
    'Double-clique sur la barre de titre pour maximiser.',
    'Ouvre TicoqExplorer pour voir le portfolio complet.',
    'Tu peux changer la langue en bas à droite de l\'écran.',
  ],
  en: [
    'Double-click an icon to open it!',
    'You can drag desktop icons anywhere.',
    'Try the Konami Code: ↑↑↓↓←→←→BA 🤫',
    'Right-click the desktop to switch themes.',
    'The terminal knows `neofetch`, `cowsay` & `easter`…',
    'Elie is open to new opportunities!',
    'Click the clock to view the calendar.',
    'I\'m Cocorico, TicoqOS mascot 🐓',
    'Resize windows from the bottom-right corner.',
    'Double-click a title bar to maximise.',
    'Open TicoqExplorer to see the full portfolio.',
    'Switch language with the FR/EN buttons on the right.',
  ],
};

const SPEED            = 0.75;  // px per frame at 60fps
const WALK_PX_PER_TIP = 300;   // px walked between each tip
const TIP_DURATION_MS  = 5000;  // ms a tip stays visible

export function Mascot() {
  const { mascot, hideMascot } = useOS();
  const { lang } = useLang();

  // DOM reference — position is driven directly to avoid 60fps React re-renders
  const coqRef     = useRef<HTMLDivElement>(null);

  // Mutable state stored in refs so the RAF closure always sees fresh values
  const posRef     = useRef(-50);           // current x position (px)
  const dirRef     = useRef<1 | -1>(1);    // 1 = right, -1 = left
  const walkedRef  = useRef(0);            // px walked since last tip
  const pausedRef  = useRef(false);        // true while a tip is visible
  const tipIdxRef  = useRef(0);            // cycling index in TIPS array
  const rafRef     = useRef(0);
  const resumeRef  = useRef<ReturnType<typeof setTimeout>>();

  // React state — only what needs to trigger a re-render
  const [facingLeft, setFacingLeft] = useState(false);
  const [localTip,   setLocalTip  ] = useState<string | null>(null);

  /* ---- tip logic ---- */
  const showNextTip = useCallback(() => {
    const list = TIPS[lang] ?? TIPS.fr;
    const msg  = list[tipIdxRef.current % list.length];
    tipIdxRef.current++;

    setLocalTip(msg);
    pausedRef.current  = true;
    walkedRef.current  = 0;

    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      setLocalTip(null);
      pausedRef.current = false;
    }, TIP_DURATION_MS);
  }, [lang]);

  /* ---- RAF walking loop ---- */
  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && coqRef.current) {
        posRef.current   += dirRef.current * SPEED;
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
      style={{ left: posRef.current }}
    >
      {activeTip && (
        <div className="mascot-bubble mw-bubble">
          {activeTip}
          <span className="mascot-x" onClick={dismissTip}>✕</span>
          <span className="mw-tail" />
        </div>
      )}
      <div className={`mw-coq${facingLeft ? ' flip' : ''}`} onClick={dismissTip}>
        <span className="mw-step">🐓</span>
      </div>
    </div>
  );
}
