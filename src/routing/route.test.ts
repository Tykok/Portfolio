import { EMPTY_ROUTE, formatRoute, parseHash, sameRoute } from './route';

describe('parseHash', () => {
  it('reads an app on its own', () => {
    expect(parseHash('#/cv')).toEqual({ app: 'cv' });
    expect(parseHash('#/terminal')).toEqual({ app: 'terminal' });
  });

  it('reads a deck slide alongside its app', () => {
    expect(parseHash('#/projects/plant974')).toEqual({ app: 'projects', slide: 'plant974' });
  });

  it('treats an empty, bare or unknown hash as the desktop', () => {
    ['', '#', '#/', '#/nope', '#/media'].forEach((hash) => {
      expect(parseHash(hash)).toEqual(EMPTY_ROUTE);
    });
  });

  it('tolerates a hash written without the slash', () => {
    expect(parseHash('#cv')).toEqual({ app: 'cv' });
  });

  it('drops a slide that could not be an id', () => {
    // The segment lands in the DOM and in a data lookup; anything outside the
    // shape ids actually take is discarded rather than carried around.
    ['#/projects/../etc', '#/projects/<script>', '#/projects/A_B'].forEach((hash) => {
      expect(parseHash(hash)).toEqual({ app: 'projects' });
    });
  });

  it('ignores trailing segments', () => {
    expect(parseHash('#/projects/plant974/extra')).toEqual({ app: 'projects', slide: 'plant974' });
  });
});

describe('formatRoute', () => {
  it('round-trips every shape', () => {
    [{ app: null }, { app: 'cv' as const }, { app: 'projects' as const, slide: 'pictarine' }].forEach((route) => {
      expect(parseHash(formatRoute(route))).toEqual(route.app === null ? EMPTY_ROUTE : route);
    });
  });

  it('names the bare desktop', () => {
    expect(formatRoute({ app: null })).toBe('#/');
  });
});

describe('sameRoute', () => {
  it('treats a missing slide and an undefined slide as one', () => {
    expect(sameRoute({ app: 'cv' }, { app: 'cv', slide: undefined })).toBe(true);
    expect(sameRoute({ app: 'cv' }, { app: 'cv', slide: 'x' })).toBe(false);
    expect(sameRoute({ app: 'cv' }, { app: 'contact' })).toBe(false);
  });
});

describe('the console profile', () => {
  it('reads #/console as the console, with no app', () => {
    expect(parseHash('#/console')).toEqual({ app: null, console: true });
  });

  it('ignores anything after it — a shell has no page to restore', () => {
    expect(parseHash('#/console/projects/pictarine')).toEqual({ app: null, console: true });
  });

  it('round-trips', () => {
    expect(formatRoute({ app: null, console: true })).toBe('#/console');
    expect(parseHash(formatRoute({ app: null, console: true }))).toEqual({ app: null, console: true });
  });

  it('is not the same route as the bare desktop', () => {
    expect(sameRoute({ app: null }, { app: null, console: true })).toBe(false);
  });

  it('is never confused with an app, because no app is called console', () => {
    expect(parseHash('#/console').app).toBeNull();
  });
});
