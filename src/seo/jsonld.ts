import { identity } from 'data/identity';
import { socials } from 'data/socials';

import type { JsonLdNode } from './types';

const SCHEMA = 'https://schema.org';

/**
 * Identifiant stable de la personne.
 *
 * Tous les autres nœuds s'y réfèrent par `@id` au lieu de redéclarer la
 * personne : un graphe avec une seule entité forte, et non plusieurs entités
 * homonymes que Google devrait deviner identiques.
 */
export function personId(siteUrl: string): string {
  return `${siteUrl}/#person`;
}

/**
 * Les profils externes, dérivés de `socials` pour qu'ils ne puissent pas
 * diverger de ce que la fenêtre Contact affiche.
 *
 * L'email est écarté : `sameAs` attend des pages de profil, et un `mailto:`
 * y est rejeté.
 */
export function profileUrls(): string[] {
  return socials.filter((s) => s.href.startsWith('https://')).map((s) => s.href);
}

/**
 * Le nœud qui porte tout le chantier.
 *
 * `alternateName` est ce qui associe « Tykok » à la personne — l'alias
 * n'apparaissait jusqu'ici dans aucun texte de page. `sameAs` déclare que le
 * GitHub, le LinkedIn, le dev.to, le Medium et ce portfolio sont la même
 * personne ; sans lui, ce sont cinq entités faibles au lieu d'une forte.
 */
export function personJsonLd(siteUrl: string): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: identity.name,
    alternateName: identity.alias,
    jobTitle: identity.role.fr,
    description: identity.tagline.fr,
    // L'employeur est en littéral plutôt que dérivé de companies : deux places
    // doivent rester synchronisées (cette fonction et companies.ts), mais couplées
    // mécaniquement elles masquent les divergences silencieuses. Le test « garde le nom
    // de l'employeur synchronisé avec companies.ts » vérifie qu'elles ne dérivent pas.
    worksFor: { '@type': 'Organization', name: 'Pictarine' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toulouse',
      addressRegion: 'Occitanie',
      addressCountry: 'FR',
    },
    image: `${siteUrl}${identity.photo}`,
    url: `${siteUrl}/`,
    sameAs: profileUrls(),
  };
}

export function webSiteJsonLd(siteUrl: string): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: `${identity.name} — Portfolio`,
    inLanguage: 'fr-FR',
    author: { '@id': personId(siteUrl) },
  };
}

export function profilePageJsonLd(siteUrl: string): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/#profilepage`,
    url: `${siteUrl}/`,
    inLanguage: 'fr-FR',
    mainEntity: { '@id': personId(siteUrl) },
  };
}
