import { useEffect } from 'react';

import { useOS } from 'context/OSContext';
import { useLang } from 'context/LangContext';

const COQS = ['🐓', '🐔', '🐣', '🥚'];
const COUNT = 28;

interface RainCoq {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rot: number;
  emoji: string;
}

function makeCoqs(): RainCoq[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 96,
    delay: Math.random() * 2.5,
    duration: 2.2 + Math.random() * 1.8,
    size: 22 + Math.floor(Math.random() * 22),
    rot: -360 + Math.floor(Math.random() * 720),
    emoji: COQS[Math.floor(Math.random() * COQS.length)],
  }));
}

const coqs = makeCoqs();

export function KonamiRain() {
  const { clearRain } = useOS();
  const { lang } = useLang();

  useEffect(() => {
    const id = setTimeout(clearRain, 5500);
    return () => clearTimeout(id);
  }, [clearRain]);

  const banner = lang === 'fr' ? 'COCORICO ! 🐓 Tu connais le Konami Code !' : 'COCK-A-DOODLE-DOO! 🐓 You know the Konami Code!';

  return (
    <div className="os-rain" onClick={clearRain}>
      <div className="rain-banner">{banner}</div>
      {coqs.map((c) => (
        <span
          key={c.id}
          className="rain-coq"
          style={{
            left: `${c.left}%`,
            fontSize: c.size,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            '--rot': `${c.rot}deg`,
          } as React.CSSProperties}
        >
          {c.emoji}
        </span>
      ))}
    </div>
  );
}
