import { identity } from 'data/identity';
import { profileSocials } from 'data/socials';
import type { Lang } from 'types/lang';
import { localize } from 'types/lang';

import type { JsonLdNode } from './types';

const SCHEMA = 'https://schema.org';

/**
 * `inLanguage` attend du BCP47 (`xx-XX`), à la différence de `og:locale` en
 * tête de document (`xx_XX`, voir render.ts) : deux standards, donc deux
 * tables plutôt qu'une conversion approximative de l'une vers l'autre.
 */
const SCHEMA_LOCALE: Record<Lang, string> = { fr: 'fr-FR', en: 'en-US' };

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
 * Les profils externes, dérivés de `profileSocials` (data/socials.ts) pour
 * qu'ils ne puissent pas diverger de ce que la fenêtre Contact — et, depuis
 * ce lot, la section Contact du document SEO — affichent.
 *
 * L'email est écarté en amont, dans `profileSocials` : `sameAs` attend des
 * pages de profil, et un `mailto:` y est rejeté.
 */
export function profileUrls(): string[] {
  return profileSocials.map((s) => s.href);
}

/**
 * Le nœud qui porte tout le chantier.
 *
 * `alternateName` est ce qui associe « Tykok » à la personne — l'alias
 * n'apparaissait jusqu'ici dans aucun texte de page. `sameAs` déclare que le
 * GitHub, le LinkedIn, le dev.to, le Medium et ce portfolio sont la même
 * personne ; sans lui, ce sont cinq entités faibles au lieu d'une forte.
 */
export function personJsonLd(siteUrl: string, lang: Lang): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: identity.name,
    alternateName: identity.alias,
    jobTitle: localize(identity.role, lang),
    description: localize(identity.tagline, lang),
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

export function webSiteJsonLd(siteUrl: string, lang: Lang): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: `${identity.name} — Portfolio`,
    inLanguage: SCHEMA_LOCALE[lang],
    author: { '@id': personId(siteUrl) },
  };
}

export function profilePageJsonLd(siteUrl: string, lang: Lang): JsonLdNode {
  return {
    '@context': SCHEMA,
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/#profilepage`,
    url: `${siteUrl}/`,
    inLanguage: SCHEMA_LOCALE[lang],
    mainEntity: { '@id': personId(siteUrl) },
  };
}
