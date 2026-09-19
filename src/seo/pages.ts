import { createElement } from 'react';

import { identity } from 'data/identity';
import type { Lang } from 'types/lang';

import { HomeBody } from './HomeBody';
import { personJsonLd, profilePageJsonLd, webSiteJsonLd } from './jsonld';
import type { SeoPage } from './types';

/**
 * La description de l'accueil est écrite à la main plutôt que dérivée de
 * `identity.tagline` : la fenêtre utile de la SERP fait 120 à 160 caractères,
 * et une troncature au milieu d'une phrase coûte plus qu'elle ne rapporte.
 * `pages.test.ts` garde les bornes.
 */
const HOME_DESCRIPTION =
  'Elie « Tykok » Treport, développeur backend Kotlin / Spring Boot chez Pictarine à Toulouse. APIs, PostgreSQL, paiement Stripe et projets personnels.';

/**
 * Tout ce que le build doit écrire.
 *
 * Ce lot ne produit que l'accueil en français : le routing tient encore sur
 * des fragments, donc aucune autre URL n'existe côté serveur. Les lots
 * suivants ajoutent des entrées ici sans changer la forme.
 */
export function buildPages(siteUrl: string): SeoPage[] {
  const lang: Lang = 'fr';

  return [
    {
      path: '/',
      file: 'index.html',
      lang,
      title: `${identity.name} (${identity.alias}) — Développeur Backend Kotlin`,
      description: HOME_DESCRIPTION,
      canonical: `${siteUrl}/`,
      alternates: [],
      jsonLd: [personJsonLd(siteUrl, lang), webSiteJsonLd(siteUrl, lang), profilePageJsonLd(siteUrl, lang)],
      noindex: false,
      priority: 1,
      // Élément, pas résultat d'appel : HomeBody est sans hooks aujourd'hui,
      // mais l'appeler comme une fonction ordinaire le rend eager et sourd à
      // tout ce que React attend d'un composant. Le lot 2 porte ce registre à
      // 31 entrées ; autant ne pas laisser ce piège pour la première qui en
      // aura besoin.
      body: createElement(HomeBody, { lang }),
    },
  ];
}
