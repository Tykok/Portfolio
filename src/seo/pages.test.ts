import { identity } from 'data/identity';

import { buildPages } from './pages';

const SITE = 'https://tykok.fr';
const pages = buildPages(SITE);

describe('buildPages', () => {
  it('génère la page d\'accueil française, seule page de ce lot', () => {
    expect(pages).toHaveLength(1);
    expect(pages[0].path).toBe('/');
    expect(pages[0].lang).toBe('fr');
    expect(pages[0].file).toBe('index.html');
  });

  it('donne un canonical absolu à chaque page', () => {
    pages.forEach((page) => {
      expect(page.canonical).toMatch(/^https:\/\//);
      expect(page.canonical).toBe(`${SITE}${page.path}`);
    });
  });

  it('nomme la personne dans chaque titre, ce qui fait de chaque page un candidat', () => {
    pages.forEach((page) => expect(page.title).toMatch(/Elie Treport/));
  });

  it('porte l\'alias dans le titre de l\'accueil', () => {
    expect(pages[0].title).toMatch(/Tykok/);
  });

  it('garde le titre synchronisé avec identity.role.fr — comme jsonld.test.ts le fait pour worksFor et companies.ts', () => {
    expect(pages[0].title).toContain(identity.role.fr);
  });

  it('tient les titres sous la limite que Google tronque', () => {
    pages.forEach((page) => {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.title.length).toBeLessThanOrEqual(60);
    });
  });

  it('écrit des descriptions dans la fenêtre utile de la SERP', () => {
    pages.forEach((page) => {
      expect(page.description.length).toBeGreaterThanOrEqual(120);
      expect(page.description.length).toBeLessThanOrEqual(160);
    });
  });

  it('n\'a aucun chemin en double — deux pages sur une URL en écraseraient une', () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.file)).size).toBe(pages.length);
  });

  it('attache Person, WebSite et ProfilePage à l\'accueil', () => {
    const types = pages[0].jsonLd.map((node) => node['@type']);
    expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'ProfilePage']));
  });

  it('indexe tout ce qu\'elle génère dans ce lot', () => {
    pages.forEach((page) => expect(page.noindex).toBe(false));
  });

  it('n\'écrit hors du répertoire de build par aucun chemin de fichier', () => {
    pages.forEach((page) => {
      expect(page.file).not.toMatch(/^\//);
      expect(page.file).not.toContain('..');
    });
  });
});
