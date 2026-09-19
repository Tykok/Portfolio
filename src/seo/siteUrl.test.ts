import { normalizeSiteUrl, SITE_URL_FALLBACK } from './siteUrl';

describe('normalizeSiteUrl', () => {
  it('retire le slash final, qui produirait sinon des URLs à double slash', () => {
    expect(normalizeSiteUrl('https://tykok.fr/')).toBe('https://tykok.fr');
    expect(normalizeSiteUrl('https://tykok.fr///')).toBe('https://tykok.fr');
  });

  it('laisse intacte une URL déjà normalisée', () => {
    expect(normalizeSiteUrl('https://tykok.fr')).toBe('https://tykok.fr');
  });

  it('se replie sur localhost quand la variable est absente, vide ou blanche', () => {
    expect(normalizeSiteUrl(undefined)).toBe(SITE_URL_FALLBACK);
    expect(normalizeSiteUrl('')).toBe(SITE_URL_FALLBACK);
    expect(normalizeSiteUrl('   ')).toBe(SITE_URL_FALLBACK);
  });

  it('expose un repli qui est une origine absolue, jamais un chemin relatif', () => {
    expect(SITE_URL_FALLBACK).toMatch(/^https?:\/\//);
    expect(SITE_URL_FALLBACK).not.toMatch(/\/$/);
  });
});
