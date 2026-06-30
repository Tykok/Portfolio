import { useEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import { useClock } from 'hooks/useClock';
import type { Lang } from 'types/lang';
import { CalPopup } from './CalPopup';

export function Tray() {
  const { lang, setLang } = useLang();
  const clock = useClock();
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!calOpen) return;
    const handleDown = (e: MouseEvent) => {
      if (
        calRef.current && !calRef.current.contains(e.target as Node) &&
        clockRef.current && !clockRef.current.contains(e.target as Node)
      ) {
        setCalOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCalOpen(false); };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [calOpen]);

  return (
    <>
      {calOpen && (
        <div ref={calRef}>
          <CalPopup onClose={() => setCalOpen(false)} />
        </div>
      )}
      <div className="tq-tray">
        <div className="os-langsw">
          <button className={`os-langopt${lang === 'fr' ? ' on' : ''}`} onClick={() => setLang('fr' as Lang)}>FR</button>
          <button className={`os-langopt${lang === 'en' ? ' on' : ''}`} onClick={() => setLang('en' as Lang)}>EN</button>
        </div>
        <span
          ref={clockRef}
          className="tq-clock"
          style={{ cursor: 'pointer' }}
          onClick={() => setCalOpen((v) => !v)}
          title="Cliquer pour afficher le calendrier"
        >
          {clock}
        </span>
      </div>
    </>
  );
}
