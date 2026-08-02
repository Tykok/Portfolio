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
    expect(sameRoute({ app: 'cv' }, { app: 'about' })).toBe(false);
  });
});
