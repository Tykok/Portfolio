import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Articles } from 'components/apps/Articles/Articles';
import { Contact } from 'components/apps/Contact/Contact';
import { Cv } from 'components/apps/Cv/Cv';
import { Projects } from 'components/apps/Projects/Projects';
import { Terminal } from 'components/apps/Terminal/Terminal';
import { Web } from 'components/apps/Web/Web';
import { Desktop } from 'components/Desktop/Desktop';
import { AboutDialog } from 'components/OS/AboutDialog/AboutDialog';
import { Boot } from 'components/OS/Boot/Boot';
import { Bsod } from 'components/OS/Bsod/Bsod';
import { Console } from 'components/OS/Console/Console';
import { KonamiRain } from 'components/OS/KonamiRain/KonamiRain';
import type { LoginProfile } from 'components/OS/Login/Login';
import { Login } from 'components/OS/Login/Login';
import { Off } from 'components/OS/Off/Off';
import { TipsDialog } from 'components/OS/TipsDialog/TipsDialog';
import { TaskBar } from 'components/TaskBar/TaskBar';
import { Window } from 'components/Window/Window';
import { ArticlesProvider } from 'context/ArticlesContext';
import { LangProvider } from 'context/LangContext';
import { OSProvider, useOS } from 'context/OSContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { readInitialRoute, RouteProvider, useRoute } from 'context/RouteContext';
import { SoundProvider, useSound } from 'context/SoundContext';
import { useWindowContext, WindowProvider } from 'context/WindowContext';
import type { AppKey } from 'types/app';

type Phase = 'boot' | 'login' | 'desktop' | 'console' | 'off';

const BOOT_MS = 2800;
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function AppContent({ appKey }: { appKey: AppKey }): JSX.Element | null {
  switch (appKey) {
    case 'projects':
      return <Projects />;
    case 'cv':
      return <Cv />;
    case 'contact':
      return <Contact />;
    case 'terminal':
      return <Terminal />;
    case 'articles':
      return <Articles />;
    case 'web':
      return <Web />;
    default:
      return null;
  }
}

function OS() {
  const { windows, activeId, openApp, focusWindow, closeWindow, minimizeWindow } = useWindowContext();
  const { bsod, konamiRain, triggerRain, aboutOpen, closeAbout, tipsOpen, openTips, closeTips, theme, startOpen, toggleStart } = useOS();
  const { route, setRouteApp, setRouteConsole } = useRoute();
  const { play, playWhenAudible } = useSound();
  /* A shared link names a window or the console profile, so it lands there.
     Making someone sit through the boot sequence and click a login tile to
     reach the page they were sent is friction the link was meant to remove. */
  const [initialRoute] = useState(readInitialRoute);
  const deepLinked = initialRoute.app !== null || initialRoute.console === true;
  const [phase, setPhase] = useState<Phase>(initialRoute.console ? 'console' : initialRoute.app ? 'desktop' : 'boot');
  const konamiSeq = useRef<string[]>([]);

  /* Read inside the route effect without making it depend on every window
     change — see the comment there. Declared before that effect so the ref is
     already current when it runs in the same flush. */
  const windowsRef = useRef(windows);
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  /* The startup chime. On a cold visit the browser has not been clicked yet
     and holds all audio back, so this asks to be played *when it can be heard*:
     right away on a restart, and otherwise on the visitor's first click — which
     on this OS is the boot screen or a login tile.

     The ref is what keeps it to one chime: StrictMode runs this effect twice in
     development, and a second pass would lay the four notes over themselves.
     Leaving the boot phase re-arms it, so a restart still sings. */
  const chimed = useRef(false);
  useEffect(() => {
    if (phase !== 'boot') {
      chimed.current = false;
      return;
    }
    if (chimed.current) return;
    chimed.current = true;
    playWhenAudible('boot');
  }, [phase, playWhenAudible]);

  /* A crash deserves a noise — once, for the same reason. */
  const crashed = useRef(false);
  useEffect(() => {
    if (!bsod) {
      crashed.current = false;
      return;
    }
    if (crashed.current) return;
    crashed.current = true;
    play('error');
  }, [bsod, play]);

  /* Auto-transition boot → login */
  useEffect(() => {
    if (deepLinked) return;
    const id = setTimeout(() => setPhase('login'), BOOT_MS);
    return () => clearTimeout(id);
  }, [deepLinked]);

  /* Address bar → windows. Deliberately blind to `windows`: were it a
     dependency, focusing another window would re-run this with the old
     `route.app` still in hand and pull focus straight back. */
  useEffect(() => {
    if (phase !== 'desktop' || !route.app) return;
    const existing = windowsRef.current.find((w) => w.key === route.app);
    if (!existing) openApp(route.app);
    else if (!existing.active || existing.min) focusWindow(existing.id);
  }, [route.app, phase, openApp, focusWindow]);

  /* Windows → address bar. The focused window is what the URL names; with
     none focused there is nothing to share but the desktop.
     `hadWindows` guards the first pass: on a deep link this effect runs once
     before the requested window exists, and clearing the route there wiped
     the very slide the link carried. Only a desktop that once had windows is
     an empty desktop on purpose. */
  const hadWindows = useRef(false);
  useEffect(() => {
    if (phase !== 'desktop') return;
    if (windows.length > 0) hadWindows.current = true;
    const active = windows.find((w) => w.id === activeId && !w.min);
    if (!active && !hadWindows.current) return;
    setRouteApp(active ? active.key : null);
  }, [windows, activeId, phase, setRouteApp]);

  /* Keyboard shortcuts.
     The set is constrained by what a browser lets a page have: Alt+Tab never
     arrives, Alt+← is Back, Ctrl+Tab switches browser tabs. Ctrl+Esc and the
     Ctrl+Alt row do reach us, and Ctrl+Esc happens to be the Start menu's real
     Windows binding. The list is in the Tips window under `os_shortcuts` —
     changing one means changing both. */
  useEffect(() => {
    if (phase !== 'desktop') return;

    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        openTips();
        return;
      }

      if (e.ctrlKey && e.key === 'Escape') {
        e.preventDefault();
        toggleStart();
        return;
      }

      if (e.ctrlKey && e.altKey) {
        const open = windows.filter((w) => !w.closing);
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          open.filter((w) => !w.min).forEach((w) => minimizeWindow(w.id));
          return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && open.length > 0) {
          e.preventDefault();
          const at = open.findIndex((w) => w.id === activeId);
          const step = e.key === 'ArrowRight' ? 1 : -1;
          const next = open[(at + step + open.length) % open.length];
          focusWindow(next.id);
          return;
        }
      }

      /* Escape closes the active window, but not while someone is mid-sentence
         in the terminal or the contact box — and not when a dialog is up, which
         owns Escape for itself. */
      if (e.key === 'Escape' && !isTyping(e.target) && !aboutOpen && !tipsOpen && !startOpen && activeId) {
        closeWindow(activeId);
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, windows, activeId, aboutOpen, tipsOpen, startOpen, openTips, toggleStart, minimizeWindow, focusWindow, closeWindow]);

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

  /* Escape closes whichever dialog is open */
  useEffect(() => {
    if (!aboutOpen && !tipsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (aboutOpen) closeAbout();
      if (tipsOpen) closeTips();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aboutOpen, closeAbout, tipsOpen, closeTips]);

  const enterConsole = useCallback(() => {
    setRouteConsole(true);
    setPhase('console');
  }, [setRouteConsole]);

  const leaveConsole = useCallback(() => {
    setRouteConsole(false);
    setPhase('desktop');
  }, [setRouteConsole]);

  /* Address bar → console. Unlike app hashes, nothing reconciled a *later*
     change to `route.console` with `phase`: pasting `#/console` over the bare
     desktop updated the route but left `phase` at 'desktop' forever, and the
     reverse — editing away from `#/console` while the console showed — had
     the same gap. This only ever fires from outside navigation: `enterConsole`
     and `leaveConsole` already set both `route.console` and `phase` together,
     in the same batched update, so by the time this effect runs the two are
     already in agreement and neither branch matches — see the comment there. */
  useEffect(() => {
    if (phase === 'desktop' && route.console) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external source (address bar); covers both branches, see comment above.
      setPhase('console');
    } else if (phase === 'console' && !route.console) {
      setPhase('desktop');
    }
  }, [phase, route.console]);

  const themed = phase === 'desktop' || phase === 'console';
  const themeClass = themed && theme !== 'bliss' ? ` theme-${theme}` : '';

  return (
    /* .tq always present — CSS variables are always in scope */
    <div className={`os-root tq${themeClass}`}>
      {phase === 'boot' && <Boot onDone={() => setPhase('login')} />}
      {phase === 'login' && <Login onLogin={(profile: LoginProfile) => (profile === 'console' ? enterConsole() : setPhase('desktop'))} />}
      {phase === 'console' && (
        <Console
          onGui={leaveConsole}
          onLogout={() => {
            setRouteConsole(false);
            setPhase('login');
          }}
          onShutdown={() => {
            setRouteConsole(false);
            setPhase('off');
          }}
        />
      )}
      {phase === 'off' && <Off onRestart={() => setPhase('boot')} />}

      {phase === 'desktop' && (
        <>
          <Desktop />
          {windows.map((win) => (
            <Window key={win.id} win={win} isActive={win.active}>
              <AppContent appKey={win.key} />
            </Window>
          ))}
          <TaskBar onShutdown={() => setPhase('off')} onLogoff={() => setPhase('login')} />
          {aboutOpen && <AboutDialog />}
          {tipsOpen && <TipsDialog />}
        </>
      )}

      {/* Full-screen overlays, phase-independent on purpose: `crash`/`konami`
          are reachable from the console too, and a BSOD or the Konami rain
          that a visitor just triggered there should show up right where they
          are, not wait silently for the next `gui` to ambush the desktop.
          Both are `position: fixed` above everything (.os-bsod is z-index
          99999, well above .os-console's 40), so they render correctly no
          matter which phase is showing underneath. */}
      {bsod && <Bsod />}
      {konamiRain && <KonamiRain />}
    </div>
  );
}

function Main() {
  return (
    <LangProvider>
      <RouteProvider>
        {/* Above WindowProvider: opening and closing a window is itself a
            sound, so the window store needs the player. */}
        <SoundProvider>
          <WindowProvider>
            <OSProvider>
              <ProjectsProvider>
                <ArticlesProvider>
                  <OS />
                </ArticlesProvider>
              </ProjectsProvider>
            </OSProvider>
          </WindowProvider>
        </SoundProvider>
      </RouteProvider>
    </LangProvider>
  );
}

export default Main;
