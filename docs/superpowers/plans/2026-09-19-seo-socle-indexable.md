# Socle indexable (SEO, lot 1) — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Servir, sans exécution de JavaScript, une page d'accueil qui contient le nom, l'alias, la biographie et l'ensemble du parcours, accompagnée des données structurées `Person` qui relient le portfolio aux profils externes.

**Architecture:** Un composant React dédié au SEO est rendu en `renderToStaticMarkup` par un script exécuté après `vite build`. Le balisage produit est injecté dans `build/index.html` à la place de marqueurs HTML, dans un `<main id="seo-content">` frère de `#root` que React ne touche jamais. Une fois l'OS monté, celui-ci recouvre ce document. Le routing n'est pas modifié dans ce lot.

**Tech Stack:** React 19, `react-dom/server`, TypeScript, Vite 6, Vitest 4, `vite-node` (nouvelle devDependency), nginx.

**Spec:** `docs/superpowers/specs/2026-09-19-seo-design.md`

## Global Constraints

- Node reste sur **20.14.0** (`.nvmrc`). Aucune modification.
- Une seule devDependency ajoutée dans ce lot : **`vite-node`**. Aucune dépendance runtime — le bundle navigateur ne doit pas grossir.
- Prettier : `singleQuote`, `semi`, `trailingComma: "all"`, `printWidth: 140`, `arrowParens: "always"`.
- ESLint impose `simple-import-sort` : les imports sont triés, les imports de types utilisent `import type`.
- Les imports internes passent par `baseUrl: "src"` — donc `data/identity`, jamais `../../data/identity`.
- Vitest tourne avec `globals: true` : `describe`, `it` et `expect` ne s'importent pas.
- Les tests sont colocalisés à côté de leur source, en `*.test.ts(x)`.
- Le site de production est **`https://tykok.fr`**, injecté par `VITE_SITE_URL`. Le repli hors production est `http://localhost:3000`.
- Le français est la langue canonique. Ce lot ne génère que le français, mais tout code écrit ici prend un paramètre `lang: Lang` afin que le lot 3 n'ait rien à réécrire.
- Aucune page de ce lot ne porte `noindex`.
- La commande de vérification complète est `npm run lint && npm run typecheck && npm test`.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `src/seo/siteUrl.ts` | Normalise `VITE_SITE_URL` (repli, retrait du slash final). Partagé par `vite.config.ts` et le script de build — une seule règle, un seul endroit. |
| `src/seo/types.ts` | `SeoPage`, `SeoAlternate`, `JsonLdNode`. Aucune logique. |
| `src/seo/jsonld.ts` | Construit les nœuds `Person`, `WebSite`, `ProfilePage`. |
| `src/seo/HomeBody.tsx` | Le contenu de la page d'accueil, en React, piloté par les données existantes. |
| `src/seo/pages.ts` | `buildPages(siteUrl)` — le registre des pages à générer. |
| `src/seo/render.ts` | `renderDocument`, `renderSitemap`, `renderRobots`. Fonctions pures, aucune I/O. |
| `src/seo/seo.css` | Mise en forme du document, lisible sans JavaScript. Lu au build, injecté en ligne. |
| `scripts/seo/build-pages.ts` | Coquille d'I/O : lit le gabarit, appelle les fonctions pures, écrit les fichiers. Volontairement sans logique. |

La spec nomme `SeoDocument.tsx` ce que ce plan appelle `HomeBody.tsx`. La
responsabilité est scindée : `render.ts` pose l'enveloppe `<main id="seo-content">`,
commune à toutes les pages, et `HomeBody.tsx` ne rend que le contenu de
l'accueil. Les lots suivants ajouteront `ProjectBody.tsx`, `ArticleBody.tsx` et
consorts à côté, sans toucher à l'enveloppe.

Toute la logique vit sous `src/`, donc typée, lintée et testée avec le reste. `scripts/seo/build-pages.ts` ne contient que de la lecture et de l'écriture de fichiers.

---

### Task 1 : Normalisation de l'URL du site

Aujourd'hui, la règle « repli sur localhost, retrait du slash final » vit uniquement dans `vite.config.ts`. Le script de build en a besoin à l'identique. La dupliquer garantit qu'elles divergeront.

**Files:**
- Create: `src/seo/siteUrl.ts`
- Create: `src/seo/siteUrl.test.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `normalizeSiteUrl(raw: string | undefined): string`, `SITE_URL_FALLBACK: string`.

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `src/seo/siteUrl.test.ts` :

```ts
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
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

Run: `npx vitest run src/seo/siteUrl.test.ts`
Expected: FAIL — `Failed to resolve import "./siteUrl"`.

- [ ] **Step 3 : Écrire l'implémentation minimale**

Créer `src/seo/siteUrl.ts` :

```ts
/** Utilisé quand VITE_SITE_URL est absente, ce qui est le cas normal en dev et en CI. */
export const SITE_URL_FALLBACK = 'http://localhost:3000';

/**
 * Origine absolue du site, sans slash final.
 *
 * Partagée par le plugin Vite qui substitue `__SITE_URL__` dans index.html et
 * par le script de prérendu : les deux doivent produire exactement la même
 * chaîne, sinon le canonical d'une page contredit celui du gabarit.
 */
export function normalizeSiteUrl(raw: string | undefined): string {
  const resolved = (raw ?? '').trim().replace(/\/+$/, '');
  return resolved || SITE_URL_FALLBACK;
}
```

- [ ] **Step 4 : Lancer le test et vérifier qu'il passe**

Run: `npx vitest run src/seo/siteUrl.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5 : Faire consommer la fonction par `vite.config.ts`**

Dans `vite.config.ts`, supprimer la constante `SITE_URL_FALLBACK` locale et importer la nouvelle. Remplacer le corps de `transformIndexHtml` :

```ts
import { normalizeSiteUrl, SITE_URL_FALLBACK } from './src/seo/siteUrl';
```

puis, dans `transformIndexHtml` :

```ts
    transformIndexHtml(html) {
      const configured = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL ?? '';
      const resolved = normalizeSiteUrl(configured);

      if (resolved === SITE_URL_FALLBACK && mode === 'production') {
        console.warn(
          '\n[portfolio] VITE_SITE_URL is unset — canonical, og:url and og:image ' +
            `will point at ${SITE_URL_FALLBACK}. Fine for a verification build, ` +
            'never for production.\n',
        );
      }

      return html.replace(/__SITE_URL__/g, resolved);
    },
```

Conserver le grand commentaire qui explique pourquoi le mécanisme `%VITE_%` de Vite n'est pas utilisé : il documente une décision toujours valable.

- [ ] **Step 6 : Vérifier que rien n'a cassé**

Run: `npm run typecheck && npm test`
Expected: PASS, suite entière.

- [ ] **Step 7 : Commit**

```bash
git add src/seo/siteUrl.ts src/seo/siteUrl.test.ts vite.config.ts
git commit -m "refactor(seo): une seule règle pour l'origine du site

Le repli et le retrait du slash final vivaient dans vite.config.ts. Le
script de prérendu a besoin de la même règle, et deux copies finissent
toujours par diverger."
```

---

### Task 2 : Les nœuds JSON-LD

C'est le livrable de plus fort rendement du chantier : `sameAs` déclare que le GitHub, le LinkedIn, le dev.to, le Medium et le portfolio désignent une seule personne, et `alternateName` est ce qui fait résoudre la requête « Tykok ».

**Files:**
- Create: `src/seo/types.ts`
- Create: `src/seo/jsonld.ts`
- Create: `src/seo/jsonld.test.ts`

**Interfaces:**
- Consumes: `identity` (`data/identity`), `socials` (`data/socials`).
- Produces:
  - `type JsonLdNode = Record<string, unknown>`
  - `personId(siteUrl: string): string`
  - `profileUrls(): string[]`
  - `personJsonLd(siteUrl: string): JsonLdNode`
  - `webSiteJsonLd(siteUrl: string): JsonLdNode`
  - `profilePageJsonLd(siteUrl: string): JsonLdNode`

- [ ] **Step 1 : Créer le fichier de types**

Créer `src/seo/types.ts` :

```ts
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
```

- [ ] **Step 2 : Écrire les tests qui échouent**

Créer `src/seo/jsonld.test.ts` :

```ts
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
```

- [ ] **Step 3 : Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/seo/jsonld.test.ts`
Expected: FAIL — `Failed to resolve import "./jsonld"`.

- [ ] **Step 4 : Écrire l'implémentation**

Créer `src/seo/jsonld.ts` :

```ts
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
```

- [ ] **Step 5 : Lancer les tests et vérifier qu'ils passent**

Run: `npx vitest run src/seo/jsonld.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 6 : Commit**

```bash
git add src/seo/types.ts src/seo/jsonld.ts src/seo/jsonld.test.ts
git commit -m "feat(seo): déclarer la personne derrière le portfolio

Le site ne disait nulle part que tykok.fr, le GitHub, le LinkedIn et le
dev.to sont la même personne, et l'alias Tykok n'apparaissait dans aucun
texte de page. Person.sameAs et alternateName règlent les deux."
```

---

### Task 3 : Le contenu de la page d'accueil

**Files:**
- Create: `src/seo/HomeBody.tsx`
- Create: `src/seo/HomeBody.test.tsx`

**Interfaces:**
- Consumes: `identity`, `companies`, `socials` (`data/*`), `mockProjects` (`api/mock/projects.mock`), `localize`/`localizeArray` (`types/lang`).
- Produces: `HomeBody({ lang }: { lang: Lang }): ReactElement`, `NO_LINK: '#'`.

Note d'implémentation : plusieurs projets portent `repo: '#'` et `demo: '#'`, qui signifient « pas de lien public ». Un `<a href="#">` dans le document serait un lien mort pour un crawler ; ces valeurs doivent donc être filtrées, et `linkNote` affiché à la place quand il existe.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `src/seo/HomeBody.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';

import { mockProjects } from 'api/mock/projects.mock';
import { companies } from 'data/companies';
import { identity } from 'data/identity';

import { HomeBody } from './HomeBody';

describe('HomeBody', () => {
  beforeEach(() => {
    render(<HomeBody lang="fr" />);
  });

  it('porte un seul h1, et c\'est le nom nu — la requête cible', () => {
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Elie Treport');
  });

  it('écrit l\'alias en toutes lettres dans le corps de page', () => {
    expect(screen.getByText(/Tykok/)).toBeInTheDocument();
  });

  it('sert la biographie complète, qui est le texte réel de la page', () => {
    identity.bio.fr.split('\n\n').forEach((paragraph) => {
      expect(screen.getByText(paragraph.trim())).toBeInTheDocument();
    });
  });

  it('nomme chaque entreprise du parcours', () => {
    companies.forEach((company) => {
      expect(screen.getByRole('heading', { name: new RegExp(company.name) })).toBeInTheDocument();
    });
  });

  it('nomme et décrit chaque projet personnel', () => {
    mockProjects.forEach((project) => {
      expect(screen.getByRole('heading', { name: new RegExp(project.title.fr.split(' — ')[0]) })).toBeInTheDocument();
      expect(screen.getByText(project.desc.fr)).toBeInTheDocument();
    });
  });

  it('marque les profils externes en rel="me", ce qui confirme sameAs dans l\'autre sens', () => {
    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(github).toHaveAttribute('href', 'https://github.com/Tykok');
    expect(github).toHaveAttribute('rel', expect.stringContaining('me'));
  });

  it('n\'émet aucun lien mort — repo et demo valent « # » quand il n\'y a pas de lien public', () => {
    const deadLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '#');
    expect(deadLinks).toHaveLength(0);
  });

  it('rend aussi en anglais, pour que le lot 3 n\'ait rien à réécrire', () => {
    screen.getByRole('heading', { level: 1 });
    render(<HomeBody lang="en" />);
    expect(screen.getAllByText(identity.bio.en.split('\n\n')[0].trim()).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/seo/HomeBody.test.tsx`
Expected: FAIL — `Failed to resolve import "./HomeBody"`.

- [ ] **Step 3 : Écrire l'implémentation**

Créer `src/seo/HomeBody.tsx` :

```tsx
import type { ReactElement } from 'react';

import { mockProjects } from 'api/mock/projects.mock';
import { companies } from 'data/companies';
import { identity } from 'data/identity';
import { socials } from 'data/socials';
import type { Lang } from 'types/lang';
import { localize, localizeArray } from 'types/lang';

/**
 * Ce que `repo` et `demo` valent quand le projet n'a pas de lien public.
 * Dans l'OS, un tel lien ne fait rien ; dans un document servi à un crawler,
 * il compterait comme un lien mort. On ne le rend pas.
 */
export const NO_LINK = '#';

function hasLink(href: string | undefined): href is string {
  return typeof href === 'string' && href !== NO_LINK && href.trim().length > 0;
}

/**
 * Le document que reçoit un visiteur — ou un crawler — avant que le moindre
 * JavaScript ne s'exécute.
 *
 * Tout vient des données qui alimentent déjà l'OS : rien n'est réécrit ici,
 * donc rien ne peut dériver de ce que les fenêtres affichent. Le paramètre
 * `lang` existe dès maintenant bien que ce lot ne génère que le français —
 * le lot 3 ajoutera `/en/` sans toucher à ce fichier.
 */
export function HomeBody({ lang }: { lang: Lang }): ReactElement {
  const bio = localize(identity.bio, lang).split('\n\n');

  return (
    <>
      <header className="seo-head">
        <h1>{identity.name}</h1>
        <p className="seo-lead">
          Alias {identity.alias}. {localize(identity.role, lang)} — {localize(identity.location, lang)}.
        </p>
        <p className="seo-tagline">{localize(identity.tagline, lang)}</p>
      </header>

      <section aria-labelledby="seo-bio">
        <h2 id="seo-bio">{lang === 'fr' ? 'À propos' : 'About'}</h2>
        {bio.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph.trim()}</p>
        ))}
        <p>{localize(identity.now, lang)}</p>
      </section>

      <section aria-labelledby="seo-work">
        <h2 id="seo-work">{lang === 'fr' ? 'Parcours' : 'Work'}</h2>
        {companies.map((company) => (
          <article key={company.id}>
            <h3>
              {company.name} — {localize(company.place, lang)}
            </h3>
            <p className="seo-meta">{localize(company.period, lang)}</p>
            <p>{localize(company.role, lang)}</p>
            <p>{localize(company.what, lang)}</p>
            <ul>
              {localizeArray(company.work, lang).map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
            <p className="seo-meta">{company.stack.join(' · ')}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="seo-projects">
        <h2 id="seo-projects">{lang === 'fr' ? 'Projets personnels' : 'Personal projects'}</h2>
        {mockProjects.map((project) => (
          <article key={project.id}>
            <h3>{localize(project.title, lang)}</h3>
            <p className="seo-meta">
              {project.year} · {localize(project.status.label, lang)}
            </p>
            <p>{localize(project.desc, lang)}</p>
            {project.context ? <p>{localize(project.context, lang)}</p> : null}
            <ul>
              {localizeArray(project.bullets, lang).map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
            {project.takeaway ? <p>{localize(project.takeaway, lang)}</p> : null}
            <p className="seo-meta">{project.stack.join(' · ')}</p>
            {hasLink(project.repo) ? (
              <p>
                <a href={project.repo}>{lang === 'fr' ? 'Code source' : 'Source code'}</a>
              </p>
            ) : project.linkNote ? (
              <p className="seo-meta">{localize(project.linkNote, lang)}</p>
            ) : null}
            {hasLink(project.demo) ? (
              <p>
                <a href={project.demo}>{lang === 'fr' ? 'Démonstration' : 'Live demo'}</a>
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section aria-labelledby="seo-contact">
        <h2 id="seo-contact">Contact</h2>
        <ul>
          {socials.map((social) => (
            <li key={social.key}>
              {/* rel="me" confirme dans l'autre sens ce que Person.sameAs déclare. */}
              <a href={social.href} rel={social.href.startsWith('https://') ? 'me noopener' : undefined}>
                {social.label} — {social.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

- [ ] **Step 4 : Lancer les tests et vérifier qu'ils passent**

Run: `npx vitest run src/seo/HomeBody.test.tsx`
Expected: PASS, 8 tests.

Si le test « nomme et décrit chaque projet » échoue sur une correspondance multiple, c'est que deux projets partagent un début de titre : resserrer le sélecteur sur `project.title.fr` complet plutôt que sur sa première partie. Ne pas assouplir l'assertion.

- [ ] **Step 5 : Vérifier le lint et les types**

Run: `npm run lint && npm run typecheck`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add src/seo/HomeBody.tsx src/seo/HomeBody.test.tsx
git commit -m "feat(seo): écrire la page que les moteurs n'ont jamais vue

Le HTML servi ne contenait que <div id=\"root\"></div>. Ce composant rend
la biographie, le parcours, les projets et les profils à partir des
données qui alimentent déjà l'OS, donc sans risque de dérive."
```

---

### Task 4 : Le registre des pages

**Files:**
- Create: `src/seo/pages.ts`
- Create: `src/seo/pages.test.ts`

**Interfaces:**
- Consumes: `SeoPage` (`./types`), `HomeBody` (`./HomeBody`), les constructeurs de `./jsonld`.
- Produces: `buildPages(siteUrl: string): SeoPage[]`.

Les bornes de longueur — titre d'au plus 60 caractères, description entre 120 et 160 — sont celles que Google tronque en SERP. Elles sont testées, pas seulement documentées.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `src/seo/pages.test.ts` :

```ts
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
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/seo/pages.test.ts`
Expected: FAIL — `Failed to resolve import "./pages"`.

- [ ] **Step 3 : Écrire l'implémentation**

Créer `src/seo/pages.ts` :

```ts
import { identity } from 'data/identity';

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
  return [
    {
      path: '/',
      file: 'index.html',
      lang: 'fr',
      title: `${identity.name} (${identity.alias}) — Développeur Backend Kotlin`,
      description: HOME_DESCRIPTION,
      canonical: `${siteUrl}/`,
      alternates: [],
      jsonLd: [personJsonLd(siteUrl), webSiteJsonLd(siteUrl), profilePageJsonLd(siteUrl)],
      noindex: false,
      priority: 1,
      body: HomeBody({ lang: 'fr' }),
    },
  ];
}
```

- [ ] **Step 4 : Lancer les tests et vérifier qu'ils passent**

Run: `npx vitest run src/seo/pages.test.ts`
Expected: PASS, 10 tests.

Le titre fait 58 caractères et la description 148 : les deux bornes passent. Si une modification des données les fait sortir, c'est le titre ou la description qu'il faut raccourcir, jamais la borne.

- [ ] **Step 5 : Commit**

```bash
git add src/seo/pages.ts src/seo/pages.test.ts
git commit -m "feat(seo): recenser les pages à prérendre

Une seule pour l'instant, l'accueil française. La forme est celle que les
lots suivants rempliront, et les bornes de titre et de description sont
tenues par les tests plutôt que par la vigilance."
```

---

### Task 5 : Les fonctions de rendu

**Files:**
- Create: `src/seo/render.ts`
- Create: `src/seo/render.test.ts`
- Create: `src/seo/seo.css`

**Interfaces:**
- Consumes: `SeoPage` (`./types`), `renderToStaticMarkup` (`react-dom/server`).
- Produces:
  - `escapeHtml(value: string): string`
  - `renderDocument(template: string, page: SeoPage, css: string): string`
  - `renderSitemap(pages: SeoPage[], lastmod: string): string`
  - `renderRobots(siteUrl: string): string`
  - `HEAD_START`, `HEAD_END`, `BODY_MARKER` — les marqueurs attendus dans le gabarit.

Fonctions pures, sans I/O : c'est ce qui permet de les tester sans construire le site.

- [ ] **Step 1 : Écrire la feuille de style**

Créer `src/seo/seo.css`. Elle n'est importée par aucun module de l'application — le script de build la lit et l'injecte en ligne, donc elle n'entre jamais dans le bundle.

```css
/* Mise en forme du document servi avant l'exécution du JavaScript.
   Volontairement minimale : sa raison d'être est d'être lisible sans JS et
   correcte pour un crawler, pas de concurrencer l'OS. */
#seo-content {
  max-width: 44rem;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font: 16px/1.6 system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #16181d;
  background: #fff;
}
#seo-content h1 { font-size: 2rem; margin: 0 0 .25rem; }
#seo-content h2 { font-size: 1.35rem; margin: 2.5rem 0 .75rem; }
#seo-content h3 { font-size: 1.1rem; margin: 1.75rem 0 .25rem; }
#seo-content .seo-lead { font-size: 1.1rem; margin: 0 0 .5rem; }
#seo-content .seo-meta { color: #5a6270; font-size: .9rem; }
#seo-content a { color: #1a52d6; }
#seo-content ul { padding-left: 1.2rem; }

@media (prefers-color-scheme: dark) {
  #seo-content { color: #e7e9ee; background: #14161a; }
  #seo-content .seo-meta { color: #9aa3b2; }
  #seo-content a { color: #8ab4ff; }
}
```

- [ ] **Step 2 : Écrire les tests qui échouent**

Créer `src/seo/render.test.ts` :

```ts
import { buildPages } from './pages';
import { BODY_MARKER, escapeHtml, HEAD_END, HEAD_START, renderDocument, renderRobots, renderSitemap } from './render';

const SITE = 'https://tykok.fr';
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
```

- [ ] **Step 3 : Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/seo/render.test.ts`
Expected: FAIL — `Failed to resolve import "./render"`.

- [ ] **Step 4 : Écrire l'implémentation**

Créer `src/seo/render.ts` :

```ts
import { renderToStaticMarkup } from 'react-dom/server';

import type { JsonLdNode, SeoPage } from './types';

/**
 * Marqueurs du gabarit.
 *
 * Le bloc de tête est délimité plutôt que remplacé balise par balise : une
 * série d'expressions régulières sur `<title>`, la description, le canonical
 * et les dix balises de partage casserait au premier ajout. Entre les deux
 * marqueurs, index.html garde des valeurs réelles, qui servent en dev et que
 * `head.test.ts` continue de lire.
 */
export const HEAD_START = '<!--seo:head:start-->';
export const HEAD_END = '<!--seo:head:end-->';
export const BODY_MARKER = '<!--seo:body-->';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Pour les valeurs d'attribut. Le corps passe par React, qui échappe déjà. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/**
 * `</script>` à l'intérieur d'une chaîne JSON fermerait le bloc pour l'analyseur
 * HTML, qui ne connaît pas les règles de JSON. Les données viennent du dépôt et
 * non d'un visiteur, mais un titre d'article rapatrié de dev.to au lot 4 en
 * viendra, lui.
 */
function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/<\//g, '<\\/');
}

function headFor(page: SeoPage, css: string): string {
  const lines = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
  ];

  if (page.noindex) {
    lines.push('<meta name="robots" content="noindex, follow" />');
  }

  page.alternates.forEach((alt) => {
    lines.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}" />`);
  });

  lines.push(`<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  lines.push(`<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  lines.push(`<meta property="og:url" content="${escapeHtml(page.canonical)}" />`);

  page.jsonLd.forEach((node) => {
    lines.push(`<script type="application/ld+json">${serializeJsonLd(node)}</script>`);
  });

  lines.push(`<style>${css}</style>`);

  return lines.join('\n    ');
}

/**
 * Produit le HTML d'une page à partir du gabarit construit par Vite.
 *
 * Le gabarit apporte les balises d'assets empreintées, identiques d'une page à
 * l'autre : un seul bundle, mis en cache une fois pour tout le site.
 */
export function renderDocument(template: string, page: SeoPage, css: string): string {
  const headStart = template.indexOf(HEAD_START);
  const headEnd = template.indexOf(HEAD_END);

  if (headStart === -1 || headEnd === -1 || headEnd < headStart) {
    throw new Error(`Le gabarit a perdu le marqueur ${HEAD_START} ou ${HEAD_END} — index.html a été modifié sans mettre à jour le prérendu.`);
  }

  if (!template.includes(BODY_MARKER)) {
    throw new Error(`Le gabarit a perdu le marqueur ${BODY_MARKER} — le document SEO n'aurait nulle part où aller.`);
  }

  const withHead = template.slice(0, headStart) + headFor(page, css) + template.slice(headEnd + HEAD_END.length);

  /* Frère de #root, jamais enfant : createRoot().render() remplace les enfants
     de sa cible, et Google indexe le DOM rendu. Un document placé dans #root
     disparaîtrait au montage sans laisser de trace. */
  const body = `<main id="seo-content">${renderToStaticMarkup(page.body)}</main>`;

  return withHead.replace(BODY_MARKER, body);
}

export function renderSitemap(pages: SeoPage[], lastmod: string): string {
  const entries = pages
    .filter((page) => !page.noindex)
    .map((page) =>
      [
        '  <url>',
        `    <loc>${escapeHtml(page.canonical)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${page.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n'),
    );

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join(
    '\n',
  );
}

export function renderRobots(siteUrl: string): string {
  return ['# https://www.robotstxt.org/robotstxt.html', 'User-agent: *', 'Disallow:', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}
```

- [ ] **Step 5 : Lancer les tests et vérifier qu'ils passent**

Run: `npx vitest run src/seo/render.test.ts`
Expected: PASS, 15 tests.

- [ ] **Step 6 : Commit**

```bash
git add src/seo/render.ts src/seo/render.test.ts src/seo/seo.css
git commit -m "feat(seo): rendre le document, le sitemap et le robots

Fonctions pures, sans I/O : elles se testent sans construire le site. Le
bloc de tête est délimité par des marqueurs plutôt que remplacé balise
par balise, ce qui aurait cassé au premier ajout."
```

---

### Task 6 : Le script de build et son câblage

**Files:**
- Create: `scripts/seo/build-pages.ts`
- Modify: `index.html`
- Modify: `src/head.test.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Delete: `public/robots.txt`

**Interfaces:**
- Consumes: `buildPages`, `renderDocument`, `renderSitemap`, `renderRobots`, `normalizeSiteUrl`.
- Produces: la commande `npm run seo:pages`, et `build/index.html`, `build/sitemap.xml`, `build/robots.txt`.

- [ ] **Step 1 : Poser les marqueurs dans le gabarit**

Dans `index.html`, encadrer le bloc géré par le prérendu. Les balises restent en place : elles servent `npm run dev`, et `head.test.ts` continue de les lire. Insérer `<!--seo:head:start-->` juste avant `<title>` et `<!--seo:head:end-->` juste après la dernière balise `twitter:image`.

Le bloc `<link rel="icon">`, `apple-touch-icon`, `manifest` et `theme-color` reste **en dehors** des marqueurs : il est identique sur toutes les pages et n'a pas à être régénéré.

Puis, dans le `<body>`, après `<div id="root"></div>`, ajouter sur sa propre ligne :

```html
    <!--seo:body-->
```

- [ ] **Step 2 : Étendre `src/head.test.ts` pour garder les marqueurs**

Ajouter dans le `describe('index.html')` existant :

```ts
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
```

- [ ] **Step 3 : Lancer le test et vérifier qu'il passe**

Run: `npx vitest run src/head.test.ts`
Expected: PASS. Les tests existants sur `og:*` et `twitter:*` passent toujours — les balises n'ont pas bougé, elles sont seulement encadrées.

- [ ] **Step 4 : Ajouter `vite-node` et inclure `scripts` dans le typecheck**

```bash
npm install --save-dev vite-node
```

Dans `tsconfig.json`, étendre `include` pour que `tsc --noEmit` couvre aussi la coquille d'I/O :

```jsonc
  "include": ["src", "scripts", "vite.config.ts"]
```

Dans `package.json`, chaîner la génération après le build Vite :

```jsonc
    "build": "tsc --noEmit && vite build && npm run seo:pages",
    "seo:pages": "vite-node scripts/seo/build-pages.ts",
```

- [ ] **Step 5 : Écrire le script**

Créer `scripts/seo/build-pages.ts` :

```ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { buildPages } from 'seo/pages';
import { renderDocument, renderRobots, renderSitemap } from 'seo/render';
import { normalizeSiteUrl } from 'seo/siteUrl';

/*
 * Coquille d'I/O du prérendu. Volontairement sans logique : tout ce qui décide
 * de quelque chose vit sous src/seo, où c'est typé, linté et testé. Ici, on lit
 * un gabarit et on écrit des fichiers.
 *
 * Exécuté par vite-node après `vite build`, afin que le gabarit porte déjà les
 * balises d'assets empreintées.
 */

/* Les scripts npm s'exécutent depuis la racine du dépôt. `import.meta.dirname`
   serait plus précis, mais vite-node ne le renseigne pas de façon fiable. */
const ROOT = process.cwd();
const BUILD_DIR = resolve(ROOT, 'build');
const TEMPLATE_PATH = resolve(BUILD_DIR, 'index.html');
const CSS_PATH = resolve(ROOT, 'src', 'seo', 'seo.css');

function write(relativePath: string, contents: string): void {
  const target = resolve(BUILD_DIR, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, 'utf8');
  /* `no-console` n'autorise que warn et error, et ceci n'est ni l'un ni
     l'autre : c'est la sortie normale d'un script de build. */
  process.stdout.write(`[seo] ${relativePath} — ${contents.length} octets\n`);
}

function main(): void {
  const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  const css = readFileSync(CSS_PATH, 'utf8');
  const lastmod = new Date().toISOString().slice(0, 10);

  const pages = buildPages(siteUrl);

  pages.forEach((page) => {
    write(page.file, renderDocument(template, page, css));
  });

  write('sitemap.xml', renderSitemap(pages, lastmod));
  write('robots.txt', renderRobots(siteUrl));

  process.stdout.write(`[seo] ${pages.length} page(s) prérendue(s) pour ${siteUrl}\n`);
}

main();
```

- [ ] **Step 6 : Supprimer le `robots.txt` statique**

```bash
git rm public/robots.txt
```

Il est désormais généré, parce qu'il doit porter l'URL absolue du sitemap, que seul le build connaît. Le laisser en place le ferait copier par Vite puis écraser par le script — deux sources pour un fichier, et une qui ment.

- [ ] **Step 7 : Construire et vérifier le résultat**

Run:

```bash
VITE_SITE_URL=https://tykok.fr npm run build
```

Expected: le build se termine, et le script affiche `[seo] 1 page(s) prérendue(s) pour https://tykok.fr`.

Puis vérifier ce qui compte réellement — que le contenu est servi sans JavaScript :

```bash
grep -c '<h1>Elie Treport</h1>' build/index.html          # attendu : 1
grep -c 'Tykok' build/index.html                           # attendu : > 0
grep -c 'application/ld+json' build/index.html             # attendu : 3
grep -c 'seo:head:start' build/index.html                  # attendu : 0
grep 'canonical' build/index.html                          # attendu : https://tykok.fr/
cat build/robots.txt                                       # attendu : Sitemap: https://tykok.fr/sitemap.xml
cat build/sitemap.xml                                      # attendu : <loc>https://tykok.fr/</loc>
```

Si `grep -c 'seo:head:start'` ne renvoie pas 0, le gabarit n'a pas été transformé : vérifier que le script tourne bien **après** `vite build` et lit `build/index.html`, et non `index.html` à la racine.

- [ ] **Step 8 : Vérifier que le bundle n'a pas grossi**

Run: `ls -la build/assets/*.js`
Expected: taille inchangée par rapport à un build antérieur. Rien sous `src/seo/` n'est importé par l'application, donc rien ne doit entrer dans le bundle. Si la taille augmente, c'est qu'un module applicatif importe `src/seo` par erreur.

- [ ] **Step 9 : Vérifier la suite complète**

Run: `npm run lint && npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 10 : Commit**

```bash
git add index.html package.json package-lock.json tsconfig.json scripts/seo/build-pages.ts src/head.test.ts
git commit -m "build(seo): prérendre l'accueil après le build Vite

Le gabarit construit par Vite porte déjà les balises d'assets empreintées ;
le script s'y branche et y injecte la tête et le document. robots.txt
devient généré, parce qu'il doit porter l'URL absolue du sitemap."
```

---

### Task 7 : L'OS recouvre le document

Sans cette tâche, `#seo-content` s'affiche **sous** l'OS, atteignable en défilant : le visiteur découvre une version texte du site collée en bas de son bureau.

**Files:**
- Modify: `src/styles/os.css`
- Modify: `src/index.tsx`
- Create: `src/seo/mount.ts`
- Create: `src/seo/mount.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `hideSeoDocument(doc: Document): void`.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `src/seo/mount.test.ts` :

```ts
import { hideSeoDocument } from './mount';

function setup(): HTMLElement {
  document.body.className = '';
  document.body.innerHTML = '<div id="root"></div><main id="seo-content"><h1>Elie Treport</h1></main>';
  return document.getElementById('seo-content') as HTMLElement;
}

describe('hideSeoDocument', () => {
  it('marque le body, ce qui déclenche la superposition décrite dans os.css', () => {
    setup();
    hideSeoDocument(document);
    expect(document.body.classList.contains('os-mounted')).toBe(true);
  });

  it('retire le document de l\'arbre d\'accessibilité, pour ne pas le lire deux fois', () => {
    const seo = setup();
    hideSeoDocument(document);
    expect(seo.getAttribute('aria-hidden')).toBe('true');
    expect(seo.hasAttribute('inert')).toBe(true);
  });

  it('laisse le contenu dans le DOM — Google indexe le DOM rendu, pas le HTML source', () => {
    const seo = setup();
    hideSeoDocument(document);
    expect(seo.isConnected).toBe(true);
    expect(seo.textContent).toContain('Elie Treport');
    expect(seo.hasAttribute('hidden')).toBe(false);
    expect(seo.style.display).not.toBe('none');
  });

  it('ne casse pas quand le document n\'a pas été prérendu, comme en dev', () => {
    document.body.className = '';
    document.body.innerHTML = '<div id="root"></div>';
    expect(() => hideSeoDocument(document)).not.toThrow();
    expect(document.body.classList.contains('os-mounted')).toBe(true);
  });
});
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/seo/mount.test.ts`
Expected: FAIL — `Failed to resolve import "./mount"`.

- [ ] **Step 3 : Écrire l'implémentation**

Créer `src/seo/mount.ts` :

```ts
/**
 * Passe la main de la page prérendue à l'OS.
 *
 * Le contenu reste dans le DOM : Google indexe le DOM rendu, et non le HTML
 * source, donc le retirer au montage reviendrait à n'avoir rien prérendu du
 * tout. Il est recouvert par l'OS — voir `.os-mounted` dans os.css — et sorti
 * de l'arbre d'accessibilité pour ne pas être lu une seconde fois derrière
 * l'interface.
 *
 * En développement, index.html n'est pas prérendu et `#seo-content` n'existe
 * pas : la fonction pose quand même la classe, dont les règles de mise en page
 * valent dans les deux cas.
 */
export function hideSeoDocument(doc: Document): void {
  doc.body.classList.add('os-mounted');

  const seo = doc.getElementById('seo-content');
  if (!seo) return;

  seo.setAttribute('aria-hidden', 'true');
  seo.setAttribute('inert', '');
}
```

- [ ] **Step 4 : Lancer les tests et vérifier qu'ils passent**

Run: `npx vitest run src/seo/mount.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5 : Appeler la fonction au montage**

Dans `src/index.tsx`, importer et appeler avant le rendu :

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import { hideSeoDocument } from './seo/mount';

import Main from './Main';

import './index.scss';
import './styles/design.css';
import './styles/os.css';

/* Avant le rendu : la page prérendue est visible jusqu'ici, et la laisser
   sous un OS en train d'apparaître produirait un empilement visible. */
hideSeoDocument(document);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
```

Vérifier après l'écriture que `simple-import-sort` est satisfait : `npm run lint`. Si l'ordre est refusé, appliquer `npm run lint:fix`.

- [ ] **Step 6 : Écrire les règles de superposition**

Dans `src/styles/os.css`, juste après la règle `#root` de la ligne 7, ajouter :

```css
/* ============================ DOCUMENT PRÉRENDU ============================
   `#seo-content` est un frère de `#root`, écrit au build par
   scripts/seo/build-pages.ts. Avant que React ne monte, c'est la page : un
   visiteur sans JavaScript, et tout crawler qui n'en exécute pas, y trouvent
   le nom, la biographie, le parcours et les projets.

   Une fois l'OS monté, `hideSeoDocument` pose `.os-mounted` et l'OS prend le
   dessus. Le document reste dans le DOM — Google indexe le DOM rendu, donc le
   supprimer annulerait le prérendu — simplement recouvert par un élément
   opaque placé au-dessus. Ni `display: none`, ni déport hors écran : c'est de
   l'amélioration progressive, pas du texte caché.
   ========================================================================== */
body.os-mounted { overflow: hidden; }
body.os-mounted #root { position: relative; z-index: 1; }
body.os-mounted #seo-content {
  position: fixed; inset: 0; z-index: 0;
  overflow: hidden;
}
```

Puis, dans le bloc `@media print` (vers la ligne 1222), ajouter à la liste des éléments qui ne s'impriment pas :

```css
  /* L'impression sert à sortir le CV, pas à doubler la page prérendue. */
  #seo-content { display: none !important; }
```

- [ ] **Step 7 : Vérifier à l'œil dans le navigateur**

Run: `npm run dev`, ouvrir `http://localhost:3000`.

Expected: l'OS s'affiche normalement, le bureau occupe tout l'écran, et la page **ne défile pas**. En développement, `#seo-content` n'existe pas — ce test vérifie que les nouvelles règles ne cassent rien.

Puis sur le build réel :

```bash
VITE_SITE_URL=https://tykok.fr npm run build && npm run preview
```

Ouvrir l'URL affichée par `preview`. Expected :
1. Un bref instant, le document texte est visible — c'est normal et voulu.
2. L'OS le recouvre entièrement dès le montage.
3. Aucun défilement ne révèle le texte sous le bureau.
4. Avec JavaScript désactivé dans les outils de développement, la page reste entièrement lisible.
5. Ouvrir la fenêtre CV, faire Ctrl+P : l'aperçu ne contient que le CV, sans le document prérendu.

Si un empilement reste visible, c'est que `.os-root` ou l'un de ses enfants de phase n'est pas opaque : vérifier `.os-wall` pendant la phase `boot`.

- [ ] **Step 8 : Vérifier la suite complète**

Run: `npm run lint && npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 9 : Commit**

```bash
git add src/seo/mount.ts src/seo/mount.test.ts src/index.tsx src/styles/os.css
git commit -m "feat(seo): laisser l'OS recouvrir la page prérendue

Le document reste dans le DOM, parce que Google indexe le DOM rendu et
non le HTML source. Il est recouvert et sorti de l'arbre
d'accessibilité, jamais supprimé ni masqué."
```

---

### Task 8 : Garder le service

Le vhost n'est couvert par aucun test applicatif, et deux bugs y ont déjà été trouvés en l'exécutant plutôt qu'en le lisant. Les trois nouveaux fichiers servis méritent le même traitement.

**Files:**
- Modify: `docker/test/image.test.sh`

**Interfaces:**
- Consumes: le vhost `docker/nginx.conf`, inchangé dans ce lot.
- Produces: rien.

Le repli SPA reste en place : ce lot ne prérend que `/`, donc supprimer le repli renverrait 404 sur toutes les autres routes. C'est le lot 2 qui le retire, une fois chaque route écrite sur disque.

- [ ] **Step 1 : Lire le test existant pour en suivre la forme**

Run: `sed -n '1,80p' docker/test/image.test.sh`

Relever la façon dont le faux build est peuplé, comment le conteneur est démarré, et le style des assertions. Les nouveaux cas suivent exactement la même forme.

- [ ] **Step 2 : Ajouter deux assistants**

Le script expose déjà `check "libellé" attendu obtenu`, `status /chemin`,
`cache /chemin` et `security_count /chemin`. Il lui manque de quoi interroger
un corps de réponse et un `Content-Type`. Les ajouter à côté des autres, dans
le même style :

```bash
body_has() {
  if curl -s "http://localhost:${PORT}$1" | grep -qF "$2"; then echo present; else echo absent; fi
}
ctype() {
  curl -sI "http://localhost:${PORT}$1" |
    tr -d '\r' | awk 'tolower($1)=="content-type:"{sub(/;.*/,"",$2); print $2}'
}
```

- [ ] **Step 3 : Rendre le faux build réaliste**

Le faux `index.html` actuel est `<!doctype html><title>portfolio</title>` — il
ne peut rien dire du prérendu. Remplacer son `printf` par un document qui a la
forme du vrai, et ajouter les deux fichiers que le build génère désormais :

```bash
printf '%s' '<!doctype html><html lang="fr"><head><title>Elie Treport</title><script type="application/ld+json">{"@type":"Person","alternateName":"Tykok"}</script></head><body><div id="root"></div><main id="seo-content"><h1>Elie Treport</h1></main></body></html>' >"${ROOT}/index.html"
printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n' >"${ROOT}/sitemap.xml"
printf 'User-agent: *\nDisallow:\n\nSitemap: https://tykok.fr/sitemap.xml\n' >"${ROOT}/robots.txt"
```

Une assertion existante compare le corps du repli SPA à l'ancien document
entier et va donc échouer. La reformuler en test de présence, ce qui la rend
aussi insensible au prochain changement de gabarit :

```bash
check 'le fallback sert le shell' present "$(body_has /route/does-not-exist '<div id="root"></div>')"
```

- [ ] **Step 3 bis : Ajouter les assertions du prérendu**

À la suite des sections existantes, dans le même style :

```bash
echo '== prerendu =='
# Tout l'objet du lot : le document doit survivre au service.
check 'le document prerendu est servi' present "$(body_has / '<h1>Elie Treport</h1>')"
check "l alias figure dans la page" present "$(body_has / 'Tykok')"

# La CSP declare script-src 'self'. Un bloc application/ld+json est un data
# block, que le navigateur n execute pas, donc il ne doit pas etre bloque.
# Verifie plutot que suppose : tout le balisage d entite en depend.
check 'le bloc JSON-LD est servi' present "$(body_has / 'application/ld+json')"

echo '== sitemap et robots =='
check 'sitemap servi' 200 "$(status /sitemap.xml)"
check 'robots servi' 200 "$(status /robots.txt)"
# Un sitemap servi en text/html est ignore sans un mot.
check 'sitemap en xml' 'application/xml' "$(ctype /sitemap.xml)"
check 'robots en texte brut' 'text/plain' "$(ctype /robots.txt)"
# Sans cette ligne, Search Console ne trouve le sitemap qu une fois soumis
# a la main.
check 'robots declare le sitemap' present "$(body_has /robots.txt 'Sitemap:')"
# Le HTML doit revalider : un index.html mis en cache laisserait des
# visiteurs sur des noms d assets qui n existent plus.
check 'sitemap revalide' 'no-cache, must-revalidate' "$(cache /sitemap.xml)"
check 'robots revalide' 'no-cache, must-revalidate' "$(cache /robots.txt)"
```

Ajouter enfin `/sitemap.xml` et `/robots.txt` à la boucle des en-têtes de
sécurité, pour que les cinq en-têtes soient gardés sur eux aussi :

```bash
for path in / /index.html /assets/index-abc123.js /og-image.png /route/does-not-exist /assets/absent.js /sitemap.xml /robots.txt; do
```

- [ ] **Step 4 : Lancer le test**

Run: `bash docker/test/image.test.sh`
Expected: PASS, toutes les assertions vertes.

Si `content-type` sur `/sitemap.xml` ne vaut pas `application/xml`, c'est la table MIME de nginx qui décide : ajouter un `types { application/xml xml; }` dans `docker/nginx.conf` plutôt que d'assouplir l'assertion.

- [ ] **Step 5 : Vérifier la CSP dans un vrai navigateur**

Run: `docker build --build-arg VITE_SITE_URL=https://tykok.fr -t portfolio-seo . && docker run --rm -p 8911:8080 portfolio-seo`

Ouvrir `http://localhost:8911`, ouvrir la console. Expected : aucune erreur mentionnant `Content Security Policy` et `ld+json`.

Si une erreur apparaît, appliquer le repli prévu par la spec : faire générer par `build-pages.ts` un `docker/csp.conf` portant l'union des hashes sha256 des blocs JSON-LD, inclus par `nginx.conf`. Ne pas ajouter `'unsafe-inline'` à `script-src`.

- [ ] **Step 6 : Commit**

```bash
git add docker/test/image.test.sh
git commit -m "test(image): garder le sitemap, le robots et le JSON-LD servis

Le vhost n'a aucune couverture applicative et deux bugs y ont déjà été
trouvés en l'exécutant. Les trois fichiers que le prérendu ajoute passent
par le même filet, CSP comprise."
```

---

### Task 9 : Vérification de bout en bout

Rien de neuf n'est écrit ici. Cette tâche existe parce que « les tests passent » et « le site est indexable » sont deux affirmations différentes, et que seule la seconde est l'objectif.

**Files:** aucun.

- [ ] **Step 1 : Construire comme la production**

Run: `VITE_SITE_URL=https://tykok.fr npm run build`
Expected: succès, sans avertissement sur `VITE_SITE_URL`.

- [ ] **Step 2 : Vérifier ce qu'un crawler sans JavaScript reçoit**

Run:

```bash
npm run preview &
sleep 2
curl -s http://localhost:4173/ | grep -o '<h1>[^<]*</h1>'
curl -s http://localhost:4173/ | grep -c 'Tykok'
curl -s http://localhost:4173/ | wc -c
```

Expected: `<h1>Elie Treport</h1>`, un compte de `Tykok` supérieur à zéro, et une taille bien au-delà des 3 296 octets que servait l'ancienne page — c'est la mesure directe du problème résolu.

Ne pas oublier d'arrêter `preview` après la vérification.

- [ ] **Step 3 : Valider les données structurées**

Ouvrir <https://search.google.com/test/rich-results>, onglet « Code », y coller le contenu de `build/index.html`.

Expected: `Person` détecté, sans erreur. Les avertissements sur des champs facultatifs absents sont acceptables ; une erreur ne l'est pas.

- [ ] **Step 4 : Relire le diff complet du lot**

Run: `git diff origin/develop...HEAD --stat`

Vérifier qu'aucun fichier hors périmètre n'a bougé : le routing, les composants d'application et `.nvmrc` doivent être intacts.

- [ ] **Step 5 : Ouvrir la pull request vers `develop`**

```bash
git push -u origin feat/seo
gh pr create --base develop --title "feat(seo): socle indexable" --body "$(cat <<'BODY'
Le HTML servi par tykok.fr ne contenait que `<div id="root"></div>` : le
contenu n'apparaissait qu'après un boot de 2,8 s puis un clic sur une tuile
de login, que nul crawler ne fera. Google n'indexait que le title et la meta
description ; Bing et les crawlers de modèles de langage ne voyaient rien.

Ce lot prérend la page d'accueil au build et la sert dans un frère de `#root`
que React ne touche jamais, avec les données structurées `Person` qui relient
le portfolio au GitHub, au LinkedIn, au dev.to et au Medium.

Lot 1 sur 4. Spec : `docs/superpowers/specs/2026-09-19-seo-design.md`.
Plan : `docs/superpowers/plans/2026-09-19-seo-socle-indexable.md`.

## Vérifié

- `curl` sur le build servi renvoie le nom, l'alias et la biographie, sans JavaScript
- test de résultats enrichis : `Person` détecté sans erreur
- bundle navigateur inchangé — rien sous `src/seo/` n'est importé par l'application
- `docker/test/image.test.sh` passe, JSON-LD non bloqué par la CSP
- impression du CV inchangée

## Hors périmètre

Le routing reste sur des fragments et le repli SPA reste en place : c'est le
lot 2 qui les traite. Les autres URLs ne sont donc pas encore indexables.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
BODY
)"
```

---

## Après la fusion

Ces actions sont manuelles et n'appartiennent à aucune tâche de code. Elles conditionnent la mesure de tout le chantier.

1. Déclarer `tykok.fr` dans Google Search Console, vérification par TXT DNS.
2. Soumettre `https://tykok.fr/sitemap.xml`, puis demander l'indexation de `/`.
3. Importer la propriété dans Bing Webmaster Tools depuis Search Console.
4. Renseigner `tykok.fr` comme site web sur LinkedIn, GitHub, dev.to et Medium — c'est ce qui confirme `sameAs` dans l'autre sens.

Ne pas toucher aux `canonical_url` de dev.to : c'est le lot 4, et le faire avant que les pages d'articles existent sortirait les articles de l'index sans rien mettre à la place.
