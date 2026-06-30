import { useEffect, useRef, useState } from 'react';

import { LangProvider } from 'context/LangContext';
import { WindowProvider, useWindowContext } from 'context/WindowContext';
import { OSProvider, useOS } from 'context/OSContext';
import { Boot } from 'components/OS/Boot/Boot';
import { Login } from 'components/OS/Login/Login';
import { Off } from 'components/OS/Off/Off';
import { Bsod } from 'components/OS/Bsod/Bsod';
import { KonamiRain } from 'components/OS/KonamiRain/KonamiRain';
import { Mascot } from 'components/OS/Mascot/Mascot';
import { AboutDialog } from 'components/OS/AboutDialog/AboutDialog';
import { Desktop } from 'components/Desktop/Desktop';
import { TaskBar } from 'components/TaskBar/TaskBar';
import { Window } from 'components/Window/Window';
import { About } from 'components/apps/About/About';
import { Projects } from 'components/apps/Projects/Projects';
import { Cv } from 'components/apps/Cv/Cv';
import { Contact } from 'components/apps/Contact/Contact';
import { Terminal } from 'components/apps/Terminal/Terminal';
import { Media } from 'components/apps/Media/Media';
import { Web } from 'components/apps/Web/Web';
import type { AppKey } from 'types/app';
import type { JSX } from 'react';

type Phase = 'boot' | 'login' | 'desktop' | 'off';

const BOOT_MS = 2800;
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function AppContent({ appKey }: { appKey: AppKey }): JSX.Element | null {
  switch (appKey) {
    case 'about':    return <About />;
    case 'projects': return <Projects />;
    case 'cv':       return <Cv />;
    case 'contact':  return <Contact />;
    case 'terminal': return <Terminal />;
    case 'media':    return <Media />;
    case 'web':      return <Web />;
    default:         return null;
  }
}

function OS() {
  const { windows, activeId } = useWindowContext();
  const { bsod, konamiRain, triggerRain, aboutOpen, closeAbout, theme } = useOS();
  const [phase, setPhase] = useState<Phase>('boot');
  const konamiSeq = useRef<string[]>([]);

  /* Auto-transition boot → login */
  useEffect(() => {
    const id = setTimeout(() => setPhase('login'), BOOT_MS);
    return () => clearTimeout(id);
  }, []);

  /* Konami code listener (global) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiSeq.current = [...konamiSeq.current, e.key].slice(-KONAMI.length);
      if (konamiSeq.current.join(',') === KONAMI.join(',')) {
        triggerRain();
        konamiSeq.current = [];
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [triggerRain]);

  /* Escape closes About dialog */
  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAbout(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aboutOpen, closeAbout]);

  const themeClass = phase === 'desktop' && theme !== 'bliss' ? ` theme-${theme}` : '';

  return (
    /* .tq always present — CSS variables are always in scope */
    <div className={`os-root tq${themeClass}`}>
      {phase === 'boot'    && <Boot    onDone={() => setPhase('login')} />}
      {phase === 'login'   && <Login   onLogin={() => setPhase('desktop')} />}
      {phase === 'off'     && <Off     onRestart={() => setPhase('boot')} />}

      {phase === 'desktop' && (
        <>
          <Desktop />
          {windows.map((win) => (
            <Window key={win.id} win={win} isActive={win.active}>
              <AppContent appKey={win.key} />
            </Window>
          ))}
          <TaskBar
            onShutdown={() => setPhase('off')}
            onLogoff={() => setPhase('login')}
          />
          <Mascot />
          {bsod        && <Bsod />}
          {konamiRain  && <KonamiRain />}
          {aboutOpen   && <AboutDialog />}
        </>
      )}
    </div>
  );
}

function Main() {
  return (
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <OS />
        </OSProvider>
      </WindowProvider>
    </LangProvider>
  );
}

export default Main;
