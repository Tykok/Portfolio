import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EMPTY_ROUTE, formatRoute, parseHash, type Route, sameRoute } from 'routing/route';

import type { AppKey } from 'types/app';

interface RouteContextValue {
  route: Route;
  /** The focused window changed: name it in the address bar, drop any slide. */
  setRouteApp: (app: AppKey | null) => void;
  /** The deck moved: keep the app, change the slide. */
  setRouteSlide: (slide: string | undefined) => void;
  /** Entering or leaving the console profile — the hash names the mode. */
  setRouteConsole: (on: boolean) => void;
}

const RouteContext = createContext<RouteContextValue>({
  route: EMPTY_ROUTE,
  setRouteApp: () => {},
  setRouteSlide: () => {},
  setRouteConsole: () => {},
});

export function readInitialRoute(): Route {
  return parseHash(window.location.hash);
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(readInitialRoute);

  const setRouteApp = useCallback((app: AppKey | null) => {
    setRoute((prev) => (prev.app === app ? prev : { app }));
  }, []);

  const setRouteSlide = useCallback((slide: string | undefined) => {
    setRoute((prev) => (prev.slide === slide ? prev : { ...prev, slide }));
  }, []);

  const setRouteConsole = useCallback((on: boolean) => {
    setRoute((prev) => (Boolean(prev.console) === on ? prev : on ? { app: null, console: true } : EMPTY_ROUTE));
  }, []);

  /* replaceState, never a hash assignment: assigning fires `hashchange`, which
     this provider listens to, and the round trip would fight whatever set the
     state in the first place. Replacing also keeps the deck's slide-by-slide
     browsing out of the history stack, so Back leaves the site rather than
     rewinding eleven slides. */
  useEffect(() => {
    const next = formatRoute(route);
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', next);
    }
  }, [route]);

  /* Only genuine outside navigation reaches this: a pasted link, an edited
     address bar, a back button crossing an entry someone else pushed. */
  useEffect(() => {
    const onHashChange = () => {
      const incoming = parseHash(window.location.hash);
      setRoute((prev) => (sameRoute(prev, incoming) ? prev : incoming));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const value = useMemo<RouteContextValue>(
    () => ({ route, setRouteApp, setRouteSlide, setRouteConsole }),
    [route, setRouteApp, setRouteSlide, setRouteConsole],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute(): RouteContextValue {
  return useContext(RouteContext);
}

export default RouteProvider;
