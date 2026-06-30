import { useEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';

const TRACKS = [
  { title: 'Système de Démarrage', artist: 'TicoqOS Orch.' },
  { title: 'Barre des Tâches Lo-fi', artist: 'Bureau XP' },
  { title: 'Fenêtre Ouverte', artist: 'Ambient Backend' },
  { title: 'Défragmentation', artist: 'HDD Techno' },
  { title: 'Dial-up Love', artist: '56k Modem Ensemble' },
  { title: 'BSOD Blues', artist: 'Kernel Panic Band' },
];

const VIZ_HEIGHTS = [14, 40, 28, 60, 18, 50, 35, 22, 48, 30];

export function Media() {
  const { t } = useLang();
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 0.5;
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const prev = () => setTrackIdx((i) => (i === 0 ? TRACKS.length - 1 : i - 1));
  const next = () => setTrackIdx((i) => (i + 1) % TRACKS.length);
  const select = (i: number) => { setTrackIdx(i); setProgress(0); setPlaying(true); };

  const track = TRACKS[trackIdx];

  return (
    <div className={`media${playing ? '' : ' paused'}`}>
      <div className="media-screen">
        <div className="media-viz">
          {VIZ_HEIGHTS.map((h, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.12}s`, height: h + 'px' }} />
          ))}
        </div>
        <div className="media-title">{track.title}</div>
        <div className="media-sub">{track.artist}</div>
        <div className="media-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: 11, color: '#8fb0e0', marginTop: 4 }}>
          {String(t('m_demo'))}
        </div>
      </div>

      <div className="media-ctrl">
        <button className="media-btn" onClick={prev} title="Précédent">⏮</button>
        <button className="media-btn big" onClick={() => setPlaying((p) => !p)} title={playing ? 'Pause' : 'Lecture'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="media-btn" onClick={next} title="Suivant">⏭</button>
      </div>

      <div className="media-list">
        {TRACKS.map((tr, i) => (
          <div key={i} className={`media-track${i === trackIdx ? ' on' : ''}`} onClick={() => select(i)}>
            <span>{tr.title}</span>
            <span style={{ fontSize: 11, color: '#8fb0e0' }}>{tr.artist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
