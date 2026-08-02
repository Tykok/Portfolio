import { useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import type { AppMeta } from 'types/app';

import { AppIcon } from '../../AppIcon/AppIcon';

interface Props {
  app: AppMeta;
  x: number;
  y: number;
  selected: boolean;
  /** Roving tabindex: exactly one icon is in the tab order at a time. */
  tabbable: boolean;
  onSelect: (e: React.PointerEvent) => void;
  onOpen: () => void;
  onDragMove: (x: number, y: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Keeps the roving tabindex on whichever icon the browser actually focused. */
  onFocusIcon: () => void;
  registerRef: (key: string, el: HTMLDivElement | null) => void;
}

export function DesktopIcon({ app, x, y, selected, tabbable, onSelect, onOpen, onDragMove, onKeyDown, onFocusIcon, registerRef }: Props) {
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
      if (!didDragRef.current) {
        didDragRef.current = true;
        setIsDragging(true);
      }
      onDragMove(Math.max(0, dragRef.current.ox + dx), Math.max(0, dragRef.current.oy + dy));
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

  /* Enter and Space open, which is what the double click does with a mouse.
     Everything else — the arrows — is the desktop's business, so it goes up. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
      return;
    }
    onKeyDown(e);
  };

  return (
    <div
      ref={(el) => registerRef(app.key, el)}
      className={`os-deskicon${selected ? ' sel' : ''}${isDragging ? ' dragging' : ''}`}
      style={{ left: x, top: y }}
      role="button"
      tabIndex={tabbable ? 0 : -1}
      aria-label={app.title[lang]}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocusIcon}
    >
      <AppIcon kind={app.icon} size={48} />
      <div className="tq-iconlabel">{app.title[lang]}</div>
    </div>
  );
}
