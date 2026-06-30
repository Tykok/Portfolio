import { useEffect, useRef, useState } from 'react';

import { useWindowContext } from 'context/WindowContext';
import { useLang } from 'context/LangContext';
import { StartMenu } from '../StartMenu/StartMenu';
import { TaskList } from './TaskList/TaskList';
import { Tray } from './Tray/Tray';

interface Props {
  onShutdown: () => void;
  onLogoff: () => void;
}

export function TaskBar({ onShutdown, onLogoff }: Props) {
  const { windows, activeId, minimizeWindow } = useWindowContext();
  const { t } = useLang();
  const [startOpen, setStartOpen] = useState(false);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  /* Close StartMenu when clicking outside the button */
  useEffect(() => {
    if (!startOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!startBtnRef.current?.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    /* Small delay so the current click that opened the menu doesn't immediately close it */
    const id = setTimeout(() => document.addEventListener('mousedown', onDown), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
    };
  }, [startOpen]);

  /* Escape closes StartMenu */
  useEffect(() => {
    if (!startOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setStartOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [startOpen]);

  const handleShowDesktop = () => {
    windows.filter((w) => !w.min).forEach((w) => minimizeWindow(w.id));
  };

  return (
    <>
      {startOpen && (
        <StartMenu
          onClose={() => setStartOpen(false)}
          onShutdown={() => { setStartOpen(false); onShutdown(); }}
          onLogoff={() => { setStartOpen(false); onLogoff(); }}
        />
      )}
      <div className="os-taskbar tq-taskbar">
        <button
          ref={startBtnRef}
          className={`tq-start${startOpen ? ' open' : ''}`}
          onClick={() => setStartOpen((v) => !v)}
          title={String(t('tip_start'))}
        >
          <span className="orb" />
          {t('start')}
        </button>
        <div className="os-quickdiv" />
        <button
          className="os-showdesk"
          onClick={handleShowDesktop}
          title={String(t('tip_show_desktop'))}
        >
          🖥
        </button>
        <div className="os-quickdiv" />
        <TaskList windows={windows} activeId={activeId} />
        <Tray />
      </div>
    </>
  );
}

export default TaskBar;
