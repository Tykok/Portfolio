import type { WindowState } from 'types/window';
import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';
import { getAppMeta } from 'data/apps';
import { AppIcon } from '../../AppIcon/AppIcon';

interface Props {
  windows: WindowState[];
  activeId: string | null;
}

export function TaskList({ windows, activeId }: Props) {
  const { lang } = useLang();
  const { focusWindow, minimizeWindow } = useWindowContext();

  const handleClick = (win: WindowState) => {
    if (win.min) {
      focusWindow(win.id);
    } else if (activeId === win.id) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  return (
    <div className="os-tasks">
      {windows.map((win) => {
        const meta = getAppMeta(win.key);
        if (!meta) return null;
        const isActive = activeId === win.id && !win.min;
        return (
          <button
            key={win.id}
            className={`tq-task${isActive ? ' is-active' : ''}`}
            onClick={() => handleClick(win)}
          >
            <span className="ti">
              <AppIcon kind={meta.icon} size={14} />
            </span>
            <span className="lbl">{meta.short[lang]}</span>
          </button>
        );
      })}
    </div>
  );
}
