import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * index.html has no other coverage, and a missing sharing tag fails silently —
 * the link just renders bare on LinkedIn. These assertions are the guard.
 */
const html = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

describe('index.html', () => {
  it('declares French as the document language', () => {
    expect(html).toMatch(/<html lang="fr">/);
  });

  it('has a title and a description that are not the CRA defaults', () => {
    expect(html).toMatch(/<title>[^<]*Elie Treport[^<]*<\/title>/);
    expect(html).not.toMatch(/create-react-app/i);
    expect(html).not.toMatch(/<title>React App<\/title>/);
  });

  it.each(['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt'])(
    'declares %s',
    (property) => {
      expect(html).toContain(`property="${property}"`);
    },
  );

  it.each(['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'])('declares %s', (name) => {
    expect(html).toContain(`name="${name}"`);
  });

  it('points the sharing image at the file that exists', () => {
    expect(html).toContain('__SITE_URL__/og-image.png');
  });

  it('uses absolute URLs for canonical, og:url and og:image', () => {
    // Crawlers reject relative values here, so each must carry the token the
    // Vite plugin resolves into an absolute origin.
    const absolute = html.match(/__SITE_URL__/g) ?? [];
    expect(absolute.length).toBeGreaterThanOrEqual(4);
    expect(html).toMatch(/<link rel="canonical" href="__SITE_URL__\/" \/>/);
  });

  it("avoids Vite's own %VITE_% mechanism, which leaves the literal when unset", () => {
    expect(html).not.toContain('%VITE_');
  });

  it('porte les marqueurs que le prérendu remplace', () => {
    // Sans eux, build-pages.ts s'arrête net plutôt que de produire des pages
    // silencieusement vides de toute balise de tête.
    expect(html).toContain('<!--seo:head:start-->');
    expect(html).toContain('<!--seo:head:end-->');
    expect(html).toContain('<!--seo:body-->');
  });

  it('place le marqueur de corps après #root, et non dedans', () => {
    // React remplace les enfants de #root au montage : un document prérendu
    // à l'intérieur disparaîtrait avant que Google ne rende la page.
    expect(html).toMatch(/<div id="root"><\/div>\s*<!--seo:body-->/);
  });

  it('garde le bloc de tête dans le bon ordre', () => {
    expect(html.indexOf('<!--seo:head:start-->')).toBeLessThan(html.indexOf('<!--seo:head:end-->'));
  });
});
