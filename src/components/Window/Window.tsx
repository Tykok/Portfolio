import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { WindowState } from 'types/window';
import { useWindowContext } from 'context/WindowContext';
import { getAppMeta } from 'data/apps';
import { useLang } from 'context/LangContext';
import { TitleBar } from './TitleBar/TitleBar';

interface Props {
  win: WindowState;
  isActive: boolean;
  children: ReactNode;
}

const TASKBAR_H = 38;
const DRAG_THRESHOLD = 4;

export function Window({ win, isActive, children }: Props) {
  const { lang } = useLang();
  const { closeWindow, focusWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow } = useWindowContext();
  const meta = getAppMeta(win.key);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs to avoid stale closures in mousemove effect
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; winW: number; winH: number } | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const handleFocus = (e: React.MouseEvent) => {
    // TitleBar calls focusWindow itself + stops propagation, so only handle body clicks here
    if (!isActive) focusWindow(win.id);
  };

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.max) return;
    if ((e.target as HTMLElement).closest('.os-tb-btn-real')) return;
    e.preventDefault();
    e.stopPropagation(); // prevent bubble to handleFocus
    focusWindow(win.id);
    // Store drag start — isDragging only becomes true after threshold in mousemove
    dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
  };

  const handleTitleDblClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.os-tb-btn-real')) return;
    maximizeWindow(win.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (win.max) return;
    e.preventDefault();
    e.stopPropagation();
    focusWindow(win.id);
    // Store resize start — isResizing only becomes true after threshold
    resizeRef.current = { startX: e.clientX, startY: e.clientY, winW: win.w, winH: win.h };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        // Start drag only after threshold — avoids animation restart on simple clicks
        if (!isDraggingRef.current && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (!isDraggingRef.current) { isDraggingRef.current = true; setIsDragging(true); }
        moveWindow(win.id, dragRef.current.winX + dx, dragRef.current.winY + dy);
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        if (!isResizingRef.current && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (!isResizingRef.current) { isResizingRef.current = true; setIsResizing(true); }
        const nw = Math.max(240, resizeRef.current.winW + dx);
        const nh = Math.max(150, resizeRef.current.winH + dy);
        resizeWindow(win.id, nw, nh);
      }
    };
    const onMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      isDraggingRef.current = false;
      isResizingRef.current = false;
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [win.id, moveWindow, resizeWindow]);

  if (!meta) return null;

  const isMin = win.min;
  const isMax = win.max;
  const isClosing = win.closing;

  const style: React.CSSProperties = isMax
    ? { left: 0, top: 0, width: '100%', height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  if (win.moX !== undefined && win.moY !== undefined) {
    (style as Record<string, unknown>)['--mo-x'] = `${win.moX}px`;
    (style as Record<string, unknown>)['--mo-y'] = `${win.moY}px`;
  }

  const classes = [
    'os-window tq',
    isActive ? 'active' : 'inactive',
    isMin ? 'is-min' : '',
    isClosing ? 'is-closing' : '',
    isMax ? 'maxd' : '',
    isDragging ? 'dragging' : '',
    isResizing ? 'resizing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} onMouseDown={handleFocus}>
      <div className="os-winflex tq-win">
        <TitleBar
          icon={meta.icon}
          title={meta.title[lang]}
          isMax={isMax}
          onMouseDown={handleTitleMouseDown}
          onDblClick={handleTitleDblClick}
          onMin={() => minimizeWindow(win.id)}
          onMax={() => maximizeWindow(win.id)}
          onClose={() => closeWindow(win.id)}
        />
        <div className="os-winbody">
          {children}
        </div>
        {!isMax && (
          <div className="os-resize" onMouseDown={handleResizeMouseDown} />
        )}
      </div>
    </div>
  );
}
