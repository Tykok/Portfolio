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
  /**
   * The console profile. Mutually exclusive with `app`: the hash names the
   * mode, and a shell has no page state worth restoring from a URL.
   */
  console?: true;
}

export const EMPTY_ROUTE: Route = { app: null };

/**
 * Slugs are the English `AppKey`, never the displayed title. A link shared in
 * French has to keep working for a reader who then switches to English, and a
 * localized slug would break exactly there.
 */
const APP_KEYS = new Set<string>(appsMeta.map((a) => a.key));

const CONSOLE_SEGMENT = 'console';

/* `console` is a profile, not an app. If one is ever added under that key the
   hash becomes ambiguous, so fail loudly here rather than mysteriously there. */
if (APP_KEYS.has(CONSOLE_SEGMENT)) {
  throw new Error('An app named "console" would collide with the console profile hash.');
}

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
  const [first, slide] = hash.replace(/^#\/?/, '').split('/');
  if (first === CONSOLE_SEGMENT) return { app: null, console: true };
  if (!first || !isAppKey(first)) return EMPTY_ROUTE;
  if (slide && SLIDE_PATTERN.test(slide)) return { app: first, slide };
  return { app: first };
}

export function formatRoute(route: Route): string {
  if (route.console) return `#/${CONSOLE_SEGMENT}`;
  if (!route.app) return '#/';
  return route.slide ? `#/${route.app}/${route.slide}` : `#/${route.app}`;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.app === b.app && (a.slide ?? null) === (b.slide ?? null) && (a.console ?? false) === (b.console ?? false);
}
