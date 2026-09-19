import { companies } from 'data/companies';
import { identity } from 'data/identity';
import { socials } from 'data/socials';

import { personId, personJsonLd, profilePageJsonLd, profileUrls, webSiteJsonLd } from './jsonld';

const SITE = 'https://tykok.fr';

describe('profileUrls', () => {
  it("ne retient que de vraies pages de profil — Google rejette un mailto dans sameAs", () => {
    const urls = profileUrls();
    expect(urls).not.toContain('mailto:treportelie12@gmail.com');
    urls.forEach((url) => expect(url).toMatch(/^https:\/\//));
  });

  it('couvre les quatre profils publics, qui sont le signal d\'entité', () => {
    const urls = profileUrls();
    expect(urls).toContain('https://github.com/Tykok');
    expect(urls).toContain('https://www.linkedin.com/in/elie-treport');
    expect(urls).toContain('https://dev.to/tykok');
    expect(urls).toContain('https://medium.com/@tykok');
  });

  it('se dérive de socials, pour ne pas pouvoir diverger de la page Contact', () => {
    expect(profileUrls()).toHaveLength(socials.filter((s) => s.href.startsWith('https://')).length);
  });
});

describe('personJsonLd', () => {
  const person = personJsonLd(SITE);

  it("déclare l'alias en alternateName — c'est ce qui résout la requête « Tykok »", () => {
    expect(person.alternateName).toBe('Tykok');
    expect(person.alternateName).toBe(identity.alias);
  });

  it('porte le nom exactement tel que les profils externes l\'écrivent', () => {
    expect(person.name).toBe('Elie Treport');
  });

  it('rattache la personne à un @id stable, que les autres nœuds référencent', () => {
    expect(person['@id']).toBe(`${SITE}/#person`);
    expect(personId(SITE)).toBe(`${SITE}/#person`);
  });

  it('donne des URLs absolues — une image relative est ignorée par Google', () => {
    expect(person.image).toBe(`${SITE}${identity.photo}`);
    expect(person.url).toBe(`${SITE}/`);
  });

  it('situe la personne à Toulouse, ce que les requêtes locales exploitent', () => {
    expect(person.address).toMatchObject({
      '@type': 'PostalAddress',
      addressLocality: 'Toulouse',
      addressCountry: 'FR',
    });
  });

  it('nomme l\'employeur', () => {
    expect(person.worksFor).toMatchObject({ '@type': 'Organization', name: 'Pictarine' });
  });

  it('garde le nom de l\'employeur synchronisé avec companies.ts — il ne peut pas dériver silencieusement', () => {
    const pictarine = companies.find((c) => c.id === 'pictarine');
    expect(pictarine).toBeDefined();
    expect(person.worksFor).toMatchObject({ '@type': 'Organization', name: pictarine!.name });
  });

  it('est sérialisable sans perte — le bloc est écrit tel quel dans le HTML', () => {
    expect(() => JSON.stringify(person)).not.toThrow();
    expect(JSON.parse(JSON.stringify(person))).toEqual(person);
  });
});

describe('webSiteJsonLd', () => {
  it('attribue le site à la personne par référence, sans la redéclarer', () => {
    const site = webSiteJsonLd(SITE);
    expect(site['@type']).toBe('WebSite');
    expect(site.author).toEqual({ '@id': personId(SITE) });
    expect(site.inLanguage).toBe('fr-FR');
  });
});

describe('profilePageJsonLd', () => {
  it('désigne la personne comme entité principale de la page d\'accueil', () => {
    const page = profilePageJsonLd(SITE);
    expect(page['@type']).toBe('ProfilePage');
    expect(page.mainEntity).toEqual({ '@id': personId(SITE) });
  });
});
