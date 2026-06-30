import { createContext, type ReactNode, useCallback, useContext, useMemo, useReducer } from 'react';

import type { AppKey } from 'types/app';
import type { WindowAction, WindowState } from 'types/window';
import { getAppMeta } from 'data/apps';

let zCounter = 10;
let idCounter = 1;

function nextId(): string {
  return `w${idCounter++}`;
}

function windowReducer(state: WindowState[], action: WindowAction): WindowState[] {
  switch (action.type) {
    case 'OPEN': {
      const existing = state.find((w) => w.key === action.key);
      if (existing) {
        // Re-focus existing window
        return state.map((w) =>
          w.key === action.key
            ? { ...w, min: false, z: ++zCounter, active: true }
            : { ...w, active: false }
        );
      }
      const { defaultWidth: dw, defaultHeight: dh } = action.meta;
      const vw = window.innerWidth;
      const vh = window.innerHeight - 38;
      const w = Math.min(dw, vw - 16);
      const h = Math.min(dh, vh - 16);
      const n = state.length;
      const x = Math.max(8, Math.round((vw - w) / 2) + (n % 5) * 26 - 52);
      const y = Math.max(8, Math.round((vh - h) / 2) + (n % 5) * 22 - 44);
      const id = nextId();
      // New window is active, all others lose focus — single atomic update
      return [
        ...state.map((w) => ({ ...w, active: false })),
        { id, key: action.key, x, y, w, h, z: ++zCounter, min: false, max: false, closing: false, active: true },
      ];
    }
    case 'CLOSE':
      return state.filter((w) => w.id !== action.id);
    case 'START_CLOSE':
      return state.map((w) => (w.id === action.id ? { ...w, closing: true } : w));
    case 'FOCUS':
      return state.map((w) =>
        w.id === action.id
          ? { ...w, min: false, z: ++zCounter, active: true }
          : { ...w, active: false }
      );
    case 'MINIMIZE':
      return state.map((w) =>
        w.id === action.id ? { ...w, min: true, active: false, moX: action.moX, moY: action.moY } : w
      );
    case 'MAXIMIZE':
      return state.map((w) => (w.id === action.id ? { ...w, max: !w.max } : w));
    case 'MOVE':
      return state.map((w) => (w.id === action.id ? { ...w, x: action.x, y: action.y } : w));
    case 'RESIZE':
      return state.map((w) => (w.id === action.id ? { ...w, w: action.w, h: action.h } : w));
    default:
      return state;
  }
}

interface WindowContextValue {
  windows: WindowState[];
  activeId: string | null;
  openApp: (key: AppKey) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string, moX?: number, moY?: number) => void;
  maximizeWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
}

const WindowContext = createContext<WindowContextValue>({
  windows: [],
  activeId: null,
  openApp: () => {},
  closeWindow: () => {},
  focusWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  moveWindow: () => {},
  resizeWindow: () => {},
});

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, dispatch] = useReducer(windowReducer, []);

  // Derived from windows — always in sync, no separate state
  const activeId = useMemo(() => windows.find((w) => w.active)?.id ?? null, [windows]);

  const openApp = useCallback((key: AppKey) => {
    const meta = getAppMeta(key);
    if (!meta) return;
    dispatch({ type: 'OPEN', key, meta: { defaultWidth: meta.defaultWidth, defaultHeight: meta.defaultHeight } });
  }, []);

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: 'START_CLOSE', id });
    setTimeout(() => dispatch({ type: 'CLOSE', id }), 150);
  }, []);

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: 'FOCUS', id });
  }, []);

  const minimizeWindow = useCallback((id: string, moX?: number, moY?: number) => {
    dispatch({ type: 'MINIMIZE', id, moX, moY });
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MAXIMIZE', id });
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE', id, x, y });
  }, []);

  const resizeWindow = useCallback((id: string, w: number, h: number) => {
    dispatch({ type: 'RESIZE', id, w, h });
  }, []);

  const value: WindowContextValue = {
    windows, activeId,
    openApp, closeWindow, focusWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow,
  };

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindowContext(): WindowContextValue {
  return useContext(WindowContext);
}
