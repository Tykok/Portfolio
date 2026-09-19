import { buildPages } from './pages';
import { BODY_MARKER, escapeHtml, HEAD_END, HEAD_START, renderDocument, renderRobots, renderSitemap } from './render';

const SITE = 'https://portfolio.test';
const pages = buildPages(SITE);
const CSS = '#seo-content { color: red; }';

const TEMPLATE = [
  '<!doctype html>',
  '<html lang="fr">',
  '  <head>',
  '    <meta charset="utf-8" />',
  `    ${HEAD_START}`,
  '    <title>remplacé</title>',
  `    ${HEAD_END}`,
  '    <script type="module" src="/assets/index-abc.js"></script>',
  '  </head>',
  '  <body>',
  '    <div id="root"></div>',
  `    ${BODY_MARKER}`,
  '  </body>',
  '</html>',
].join('\n');

describe('escapeHtml', () => {
  it('neutralise ce qui casserait une valeur d\'attribut', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('dit "bonjour"')).toBe('dit &quot;bonjour&quot;');
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('laisse les accents et la ponctuation française intacts', () => {
    expect(escapeHtml('Développeur — Élie')).toBe('Développeur — Élie');
  });
});

describe('renderDocument', () => {
  const html = renderDocument(TEMPLATE, pages[0], CSS);

  it('remplace le bloc de tête du gabarit, sans laisser de marqueur', () => {
    expect(html).not.toContain(HEAD_START);
    expect(html).not.toContain(HEAD_END);
    expect(html).not.toContain('<title>remplacé</title>');
    expect(html).toContain(`<title>${escapeHtml(pages[0].title)}</title>`);
  });

  it('conserve les balises d\'assets du gabarit — un seul bundle pour tout le site', () => {
    expect(html).toContain('<script type="module" src="/assets/index-abc.js"></script>');
  });

  it('injecte le document dans un frère de #root, que React ne remplacera pas', () => {
    expect(html).not.toContain(BODY_MARKER);
    expect(html).toContain('<div id="root"></div>');
    expect(html).toMatch(/<div id="root"><\/div>\s*<main id="seo-content">/);
  });

  it('sert le nom, l\'alias et la biographie en clair, sans exécuter de JavaScript', () => {
    expect(html).toContain('<h1>Elie Treport</h1>');
    expect(html).toMatch(/Tykok/);
    expect(html).toMatch(/Pictarine/);
  });

  it('déclare un canonical absolu', () => {
    expect(html).toContain(`<link rel="canonical" href="${pages[0].canonical}" />`);
  });

  it('écrit un bloc JSON-LD par nœud, chacun reparsable', () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    expect(blocks).toHaveLength(pages[0].jsonLd.length);
    blocks.forEach((block) => expect(() => JSON.parse(block[1]) as unknown).not.toThrow());
  });

  it('protège le JSON-LD d\'une fermeture de balise prématurée', () => {
    const page = { ...pages[0], jsonLd: [{ '@type': 'Person', name: 'a</script><script>alert(1)' }] };
    const out = renderDocument(TEMPLATE, page, CSS);
    expect(out).not.toContain('</script><script>alert(1)');
    expect(out).toContain('<\\/script>');
  });

  it('injecte la feuille de style en ligne, donc sans requête bloquante', () => {
    expect(html).toContain(`<style>${CSS}</style>`);
  });

  it('n\'ajoute pas de meta robots quand la page est indexable', () => {
    expect(html).not.toContain('name="robots"');
  });

  it('ajoute noindex quand la page le demande', () => {
    const out = renderDocument(TEMPLATE, { ...pages[0], noindex: true }, CSS);
    expect(out).toContain('<meta name="robots" content="noindex, follow" />');
  });

  it('échoue bruyamment si le gabarit a perdu ses marqueurs', () => {
    expect(() => renderDocument('<html><head></head><body></body></html>', pages[0], CSS)).toThrow(/marqueur/i);
  });
});

describe('renderSitemap', () => {
  it('liste les pages indexables avec leur URL absolue', () => {
    const xml = renderSitemap(pages, '2026-09-19');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(`<loc>${pages[0].canonical}</loc>`);
    expect(xml).toContain('<lastmod>2026-09-19</lastmod>');
  });

  it('exclut les pages noindex — les y laisser serait une instruction contradictoire', () => {
    const xml = renderSitemap([{ ...pages[0], noindex: true }], '2026-09-19');
    expect(xml).not.toContain('<loc>');
  });
});

describe('renderRobots', () => {
  it('déclare le sitemap en URL absolue, seule forme acceptée', () => {
    expect(renderRobots(SITE)).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it('n\'interdit rien', () => {
    expect(renderRobots(SITE)).toMatch(/^Disallow:\s*$/m);
  });
});
