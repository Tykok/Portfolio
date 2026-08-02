import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type DesktopTheme = 'bliss' | 'field' | 'dusk' | 'matrix' | 'rose';

const THEMES: DesktopTheme[] = ['bliss', 'field', 'dusk', 'matrix', 'rose'];

const THEME_KEY = 'ticoq.theme';

function isTheme(value: string | null): value is DesktopTheme {
  return value !== null && (THEMES as string[]).includes(value);
}

function storedTheme(): DesktopTheme {
  const stored = localStorage.getItem(THEME_KEY);
  return isTheme(stored) ? stored : 'bliss';
}

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
  /** Lifted out of TaskBar so Ctrl+Esc can reach it, as it does on Windows. */
  startOpen: boolean;
  setStartOpen: (open: boolean) => void;
  toggleStart: () => void;
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
  startOpen: false,
  setStartOpen: () => {},
  toggleStart: () => {},
});

export function OSProvider({ children }: { children: ReactNode }) {
  const [bsod, setBsod] = useState(false);
  const [konamiRain, setKonamiRain] = useState(false);
  const [theme, setThemeState] = useState<DesktopTheme>(storedTheme);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);

  const triggerBsod = useCallback(() => setBsod(true), []);
  const clearBsod = useCallback(() => setBsod(false), []);
  const triggerRain = useCallback(() => setKonamiRain(true), []);
  const clearRain = useCallback(() => setKonamiRain(false), []);

  const setTheme = useCallback((t: DesktopTheme | 'next') => {
    setThemeState((prev) => (t === 'next' ? THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length] : t));
  }, []);

  /* The chosen theme outlives the tab. Persisting from an effect rather than
     from setTheme keeps the updater pure and covers 'next', whose resolved
     value only exists after the state settles. */
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const openTips = useCallback(() => setTipsOpen(true), []);
  const closeTips = useCallback(() => setTipsOpen(false), []);
  const toggleStart = useCallback(() => setStartOpen((v) => !v), []);

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
        startOpen,
        setStartOpen,
        toggleStart,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS(): OSContextValue {
  return useContext(OSContext);
}
