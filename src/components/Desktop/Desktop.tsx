import { useState } from 'react';

import { appsMeta } from 'data/apps';
import { useWindowContext } from 'context/WindowContext';
import { useOS } from 'context/OSContext';
import { useIconPositions } from 'hooks/useIconPositions';
import { DesktopIcon } from './DesktopIcon/DesktopIcon';
import { Wallpaper } from './Wallpaper/Wallpaper';
import { ContextMenu } from './ContextMenu/ContextMenu';

interface CtxPos { x: number; y: number }

export function Desktop() {
  const { openApp } = useWindowContext();
  const { theme } = useOS();
  const { positions, moveIcon, resetPositions } = useIconPositions();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ctx, setCtx] = useState<CtxPos | null>(null);

  const visibleApps = appsMeta.filter((a) => !a.hidden);

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
      <div className="os-icons">
        {visibleApps.map((app) => {
          const pos = positions[app.key] ?? { x: 14, y: 14 };
          return (
            <DesktopIcon
              key={app.key}
              app={app}
              x={pos.x}
              y={pos.y}
              selected={selectedKey === app.key}
              onSelect={(e) => { e.stopPropagation(); setSelectedKey(app.key); setCtx(null); }}
              onOpen={() => { setSelectedKey(null); openApp(app.key); }}
              onDragMove={(nx, ny) => moveIcon(app.key, nx, ny)}
            />
          );
        })}
      </div>
      {ctx && (
        <ContextMenu x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} onLineup={resetPositions} />
      )}
    </div>
  );
}
