import type { ReactElement } from 'react';

import type { Lang } from 'types/lang';

/** Un nœud schema.org, sérialisé tel quel dans un bloc application/ld+json. */
export type JsonLdNode = Record<string, unknown>;

export interface SeoAlternate {
  /** `x-default` désigne la version servie à un visiteur dont la langue n'est pas couverte. */
  hreflang: Lang | 'x-default';
  href: string;
}

export interface SeoPage {
  /** Chemin absolu servi, sans slash final — sauf la racine, qui est `/`. */
  path: string;
  /** Chemin du fichier écrit sous le répertoire de build. */
  file: string;
  lang: Lang;
  title: string;
  description: string;
  /** Absolu. Les crawlers rejettent un canonical relatif. */
  canonical: string;
  alternates: SeoAlternate[];
  jsonLd: JsonLdNode[];
  /** Exclut la page du sitemap et lui ajoute une meta robots. */
  noindex: boolean;
  /** Priorité sitemap, entre 0 et 1. */
  priority: number;
  body: ReactElement;
}
