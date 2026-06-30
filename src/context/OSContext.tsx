import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type DesktopTheme = 'bliss' | 'field' | 'dusk' | 'matrix' | 'rose';

const THEMES: DesktopTheme[] = ['bliss', 'field', 'dusk', 'matrix', 'rose'];

interface OSContextValue {
  bsod: boolean;
  triggerBsod: () => void;
  clearBsod: () => void;
  konamiRain: boolean;
  triggerRain: () => void;
  clearRain: () => void;
  theme: DesktopTheme;
  setTheme: (t: DesktopTheme | 'next') => void;
  mascot: { visible: boolean; msg: string };
  showMascot: (msg: string) => void;
  hideMascot: () => void;
  aboutOpen: boolean;
  openAbout: () => void;
  closeAbout: () => void;
}

const OSContext = createContext<OSContextValue>({
  bsod: false, triggerBsod: () => {}, clearBsod: () => {},
  konamiRain: false, triggerRain: () => {}, clearRain: () => {},
  theme: 'bliss', setTheme: () => {},
  mascot: { visible: false, msg: '' }, showMascot: () => {}, hideMascot: () => {},
  aboutOpen: false, openAbout: () => {}, closeAbout: () => {},
});

export function OSProvider({ children }: { children: ReactNode }) {
  const [bsod, setBsod] = useState(false);
  const [konamiRain, setKonamiRain] = useState(false);
  const [theme, setThemeState] = useState<DesktopTheme>('bliss');
  const [mascot, setMascot] = useState<{ visible: boolean; msg: string }>({ visible: false, msg: '' });
  const [aboutOpen, setAboutOpen] = useState(false);

  const triggerBsod = useCallback(() => setBsod(true), []);
  const clearBsod = useCallback(() => setBsod(false), []);
  const triggerRain = useCallback(() => setKonamiRain(true), []);
  const clearRain = useCallback(() => setKonamiRain(false), []);

  const setTheme = useCallback((t: DesktopTheme | 'next') => {
    if (t === 'next') {
      setThemeState((prev) => {
        const idx = THEMES.indexOf(prev);
        return THEMES[(idx + 1) % THEMES.length];
      });
    } else {
      setThemeState(t);
    }
  }, []);

  const showMascot = useCallback((msg: string) => setMascot({ visible: true, msg }), []);
  const hideMascot = useCallback(() => setMascot((m) => ({ ...m, visible: false })), []);
  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  return (
    <OSContext.Provider value={{
      bsod, triggerBsod, clearBsod,
      konamiRain, triggerRain, clearRain,
      theme, setTheme,
      mascot, showMascot, hideMascot,
      aboutOpen, openAbout, closeAbout,
    }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS(): OSContextValue {
  return useContext(OSContext);
}
