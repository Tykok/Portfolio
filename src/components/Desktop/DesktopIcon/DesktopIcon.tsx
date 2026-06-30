import { useRef, useState } from 'react';

import type { AppMeta } from 'types/app';
import { useLang } from 'context/LangContext';
import { AppIcon } from '../../AppIcon/AppIcon';

interface Props {
  app: AppMeta;
  x: number;
  y: number;
  selected: boolean;
  onSelect: (e: React.PointerEvent) => void;
  onOpen: () => void;
  onDragMove: (x: number, y: number) => void;
}

export function DesktopIcon({ app, x, y, selected, onSelect, onOpen, onDragMove }: Props) {
  const { lang } = useLang();
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const didDragRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(e);

    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: x, oy: y };
    didDragRef.current = false;

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.sx;
      const dy = ev.clientY - dragRef.current.sy;
      if (!didDragRef.current && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      if (!didDragRef.current) { didDragRef.current = true; setIsDragging(true); }
      onDragMove(
        Math.max(0, dragRef.current.ox + dx),
        Math.max(0, dragRef.current.oy + dy),
      );
    };

    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleDoubleClick = () => {
    if (!didDragRef.current) onOpen();
  };

  return (
    <div
      className={`os-deskicon${selected ? ' sel' : ''}${isDragging ? ' dragging' : ''}`}
      style={{ left: x, top: y }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <AppIcon kind={app.icon} size={48} />
      <div className="tq-iconlabel">{app.title[lang]}</div>
    </div>
  );
}
