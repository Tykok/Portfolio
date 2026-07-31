import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

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
  aboutOpen: boolean;
  openAbout: () => void;
  closeAbout: () => void;
  tipsOpen: boolean;
  openTips: () => void;
  closeTips: () => void;
}

const OSContext = createContext<OSContextValue>({
  bsod: false,
  triggerBsod: () => {},
  clearBsod: () => {},
  konamiRain: false,
  triggerRain: () => {},
  clearRain: () => {},
  theme: 'bliss',
  setTheme: () => {},
  aboutOpen: false,
  openAbout: () => {},
  closeAbout: () => {},
  tipsOpen: false,
  openTips: () => {},
  closeTips: () => {},
});

export function OSProvider({ children }: { children: ReactNode }) {
  const [bsod, setBsod] = useState(false);
  const [konamiRain, setKonamiRain] = useState(false);
  const [theme, setThemeState] = useState<DesktopTheme>('bliss');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

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

  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const openTips = useCallback(() => setTipsOpen(true), []);
  const closeTips = useCallback(() => setTipsOpen(false), []);

  return (
    <OSContext.Provider
      value={{
        bsod,
        triggerBsod,
        clearBsod,
        konamiRain,
        triggerRain,
        clearRain,
        theme,
        setTheme,
        aboutOpen,
        openAbout,
        closeAbout,
        tipsOpen,
        openTips,
        closeTips,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS(): OSContextValue {
  return useContext(OSContext);
}
