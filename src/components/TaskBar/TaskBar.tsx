import { useEffect, useRef } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';

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
  const { startOpen, setStartOpen, toggleStart } = useOS();
  const startWrapRef = useRef<HTMLDivElement>(null);

  /* Close StartMenu when clicking outside the button *or* the menu itself.
     The menu is a sibling of the button, so checking only the button would
     treat clicks on menu items as "outside" — closing (and unmounting) the
     menu on mousedown before the item's click handler can fire. */
  useEffect(() => {
    if (!startOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!startWrapRef.current?.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    /* Small delay so the current click that opened the menu doesn't immediately close it */
    const id = setTimeout(() => document.addEventListener('mousedown', onDown), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
    };
  }, [startOpen, setStartOpen]);

  /* Escape closes StartMenu */
  useEffect(() => {
    if (!startOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStartOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [startOpen, setStartOpen]);

  const handleShowDesktop = () => {
    windows.filter((w) => !w.min).forEach((w) => minimizeWindow(w.id));
  };

  return (
    <>
      <div className="os-taskbar tq-taskbar" role="toolbar" aria-label={t('a11y_taskbar')}>
        <div className="tq-start-wrap" ref={startWrapRef}>
          {startOpen && (
            <StartMenu
              onClose={() => setStartOpen(false)}
              onShutdown={() => {
                setStartOpen(false);
                onShutdown();
              }}
              onLogoff={() => {
                setStartOpen(false);
                onLogoff();
              }}
            />
          )}
          <button
            className={`tq-start${startOpen ? ' open' : ''}`}
            data-sound="menu"
            onClick={toggleStart}
            title={t('tip_start')}
            aria-haspopup="menu"
            aria-expanded={startOpen}
          >
            <span className="orb" />
            {t('start')}
          </button>
        </div>
        <div className="os-quickdiv" />
        <button className="os-showdesk" onClick={handleShowDesktop} title={t('tip_show_desktop')} aria-label={t('tip_show_desktop')}>
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
