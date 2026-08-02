import { useCallback, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';
import { appsMeta } from 'data/apps';
import { useIconPositions } from 'hooks/useIconPositions';

import { ContextMenu } from './ContextMenu/ContextMenu';
import { DesktopIcon } from './DesktopIcon/DesktopIcon';
import { Wallpaper } from './Wallpaper/Wallpaper';

interface CtxPos {
  x: number;
  y: number;
}

export function Desktop() {
  const { openApp } = useWindowContext();
  const { theme } = useOS();
  const { t } = useLang();
  const { positions, moveIcon, resetPositions } = useIconPositions();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ctx, setCtx] = useState<CtxPos | null>(null);

  const visibleApps = appsMeta.filter((a) => !a.hidden);

  /* Roving tabindex: the desktop is one tab stop, and the arrows move between
     icons from there. Seven separate tab stops would make reaching the taskbar
     seven presses away.

     The order is `appsMeta`'s, not the icons' coordinates: they are draggable,
     so any geometric reading of "the icon to the right" changes the moment
     someone rearranges the desktop. */
  const [focusedKey, setFocusedKey] = useState<string>(visibleApps[0]?.key ?? '');
  const iconEls = useRef(new Map<string, HTMLDivElement>());

  const registerRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) iconEls.current.set(key, el);
    else iconEls.current.delete(key);
  }, []);

  const moveFocus = (delta: number) => {
    const from = visibleApps.findIndex((a) => a.key === focusedKey);
    const next = visibleApps[(from + delta + visibleApps.length) % visibleApps.length];
    if (!next) return;
    setFocusedKey(next.key);
    iconEls.current.get(next.key)?.focus();
  };

  const handleIconKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(-1);
    }
  };

  const handleDesktopPointerDown = () => {
    setSelectedKey(null);
    setCtx(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={`os-desktop${theme !== 'bliss' ? ` theme-${theme}` : ''}`}
      onPointerDown={handleDesktopPointerDown}
      onContextMenu={handleContextMenu}
    >
      <Wallpaper />
      <div className="os-icons" role="group" aria-label={t('a11y_desktop')}>
        {visibleApps.map((app) => {
          const pos = positions[app.key] ?? { x: 14, y: 14 };
          return (
            <DesktopIcon
              key={app.key}
              app={app}
              x={pos.x}
              y={pos.y}
              selected={selectedKey === app.key}
              tabbable={focusedKey === app.key}
              onSelect={(e) => {
                e.stopPropagation();
                setSelectedKey(app.key);
                setCtx(null);
              }}
              onOpen={() => {
                setSelectedKey(null);
                openApp(app.key);
              }}
              onDragMove={(nx, ny) => moveIcon(app.key, nx, ny)}
              onKeyDown={handleIconKeyDown}
              onFocusIcon={() => setFocusedKey(app.key)}
              registerRef={registerRef}
            />
          );
        })}
      </div>
      {ctx && <ContextMenu x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} onLineup={resetPositions} />}
    </div>
  );
}
