import { appsMeta } from 'data/apps';
import type { AppKey } from 'types/app';

/**
 * Where the visitor is, as the address bar sees it.
 *
 * `app` is null on the bare desktop — no window focused, nothing to name.
 * `slide` is the deck's own segment; it means nothing for the other apps and
 * is dropped when they take focus.
 */
export interface Route {
  app: AppKey | null;
  slide?: string;
}

export const EMPTY_ROUTE: Route = { app: null };

/**
 * Slugs are the English `AppKey`, never the displayed title. A link shared in
 * French has to keep working for a reader who then switches to English, and a
 * localized slug would break exactly there.
 */
const APP_KEYS = new Set<string>(appsMeta.map((a) => a.key));

/** Ids come from project and company data; anything else is not a slide. */
const SLIDE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

function isAppKey(value: string): value is AppKey {
  return APP_KEYS.has(value);
}

/**
 * Hash routing rather than the History API: the site is served as a static
 * bundle behind nginx, and a real path would 404 on reload unless every
 * deploy target grows a rewrite rule. The hash never reaches the server.
 */
export function parseHash(hash: string): Route {
  const [app, slide] = hash.replace(/^#\/?/, '').split('/');
  if (!app || !isAppKey(app)) return EMPTY_ROUTE;
  if (slide && SLIDE_PATTERN.test(slide)) return { app, slide };
  return { app };
}

export function formatRoute(route: Route): string {
  if (!route.app) return '#/';
  return route.slide ? `#/${route.app}/${route.slide}` : `#/${route.app}`;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.app === b.app && (a.slide ?? null) === (b.slide ?? null);
}
