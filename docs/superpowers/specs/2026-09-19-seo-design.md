# SEO — référencement naturel du portfolio

Date : 2026-09-19
Statut : validé, prêt pour le plan d'implémentation

## Objectif

Faire remonter `tykok.fr` sur les requêtes portant sur l'identité du
propriétaire, puis sur les sujets de ses projets et de ses articles.

Cibles primaires, par ordre de faisabilité :

| Requête | Verdict |
| --- | --- |
| `Tykok` | gagnable |
| `Elie Treport` | gagnable |
| `Elie Treport développeur` | gagnable |
| `Elie` | **hors de portée**, et la spec ne le poursuit pas |

`Elie` seul est un prénom générique — Élie biblique, Elie Grekoff, des
commerces nommés Elie. Aucun signal disponible à l'échelle d'un portfolio
personnel ne déplacera ces résultats. Le viser gaspillerait l'effort sans
rien produire. Les deux premières lignes du tableau sont l'objectif réel.

Cible secondaire : que chaque projet et chaque article retenu dispose de sa
propre URL indexable, de façon qu'une recherche sur leur sujet mène au
portfolio.

## État des lieux au 2026-09-19

Mesuré sur le site en production, pas déduit du dépôt.

**Ce qui est déjà en place.** `index.html` porte un `title`, une
`description`, un `canonical`, un jeu Open Graph et Twitter complet, et
`lang="fr"`. `src/head.test.ts` garde l'ensemble. Le site est indexé : une
recherche sur `tykok.fr` remonte le domaine avec son titre et sa
description. La base est saine, elle n'est pas le problème.

**Les six trous.**

1. **Le HTML servi est vide.** `curl https://tykok.fr/` renvoie
   `<div id="root"></div>` et rien d'autre. Le contenu n'apparaît qu'après
   un boot de 2 800 ms **puis un clic sur une tuile de login**. Un crawler
   ne clique pas. Google n'indexe donc que le `title` et la meta
   description ; Bing, DuckDuckGo et les crawlers de modèles de langage,
   qui n'exécutent pas ou peu de JavaScript, ne voient rien du tout.

2. **Routing par fragment.** `#/projects/plant974` n'est pas une URL
   distincte — Google ignore le fragment. Le site entier tient en un seul
   document indexable, ce qui rend la cible secondaire inatteignable.

3. **Aucun `sitemap.xml`**, et `robots.txt` n'en déclare aucun.

4. **Aucune donnée structurée.** Ni `Person`, ni `WebSite`, ni `sameAs`.
   C'est le levier le plus fort sur une requête de nom, et il est absent.

5. **Soft-404.** `try_files $uri $uri/ /index.html` renvoie 200 et la même
   page pour n'importe quelle URL. Google traite ce motif comme un défaut
   de qualité.

6. **Aucune mesure.** Ni Search Console, ni Bing Webmaster Tools. Vérifié :
   aucune balise de vérification servie, et `dig TXT tykok.fr` ne renvoie
   que `OSSRH-94483` et le SPF IONOS.

**Un détail qui décide de tout :** la chaîne « Tykok » n'apparaît dans
aucun texte de page. Elle vit uniquement dans la meta description et dans
`og:site_name`. Un alias absent du corps des pages et des données
structurées ne peut pas être associé à la personne.

## Décisions

Prises avec le propriétaire avant rédaction, et non rouvertes ici.

1. **Prérendu au build, plus de vraies URLs.** Le HTML statique est généré
   à la construction et le routing quitte le fragment. Couvre la cible
   primaire et la secondaire.
2. **L'OS reste l'expérience.** Un visiteur venu de Google sur
   `/parcours/plant974` voit l'OS démarrer directement sur la bonne
   fenêtre — le comportement de deep link déjà implémenté. Le contenu
   prérendu demeure dans le DOM, sous l'interface.
3. **Les articles sont rapatriés, canonique chez soi.** Le contenu
   complet est servi depuis `tykok.fr`, et les `canonical_url` de dev.to
   sont ensuite retournés vers le domaine.
4. **Bilingue en URLs distinctes.** Le français est canonique, l'anglais
   vit sous `/en/`, les deux sont reliés par `hreflang`.
5. **Périmètre élargi** à la checklist hors-code, à `llms.txt` et à une
   suite de tests dédiée.

## Approche retenue

Un composant React dédié au SEO, rendu en `renderToStaticMarkup` par un
script de build.

Deux approches ont été écartées :

- **Crawl du bundle construit** (Playwright, react-snap). Impose un
  Chromium dans l'image Docker, résiste mal au boot animé, et sérialise
  tout le chrome de l'OS dans chaque fichier.
- **Injection au bord** via un Worker Cloudflare. Zone grise du cloaking,
  et hors de la chaîne GitOps homelab existante.

L'approche retenue n'introduit aucun navigateur dans le build, reste
déterministe, et laisse un contrôle complet sur le balisage produit.

## Carte des URLs

Les URLs calquent la structure du deck, qui mêle quatre entreprises et
huit projets personnels sous une seule application « Parcours ». Une seule
source de vérité, et le modèle `app + slide` déjà présent dans
`src/routing/route.ts` reste valable.

| FR (canonique) | EN | Nombre |
| --- | --- | --- |
| `/` | `/en/` | 1 |
| `/parcours` | `/en/work` | 1 |
| `/parcours/<id>` | `/en/work/<id>` | 12 |
| `/cv` | `/en/resume` | 1 |
| `/articles` | `/en/articles` | 1 |
| `/articles/<slug>` | `/en/articles/<slug>` | variable |
| `/contact` | `/en/contact` | 1 |
| `/a-propos` | `/en/about` | 1 |
| `/terminal` *(noindex)* | `/en/terminal` *(noindex)* | 1 |
| `/console` *(noindex)* | — | 1 |

Identifiants de slides — entreprises : `pictarine`, `mecalife`, `canope`,
`cegid`. Projets : `ticoqos`, `homelab`, `ramassali`, `plant974`,
`pokeapi-kotlin`, `cedict`, `meyiv`, `ipi-calendar`.

`/terminal` et `/console` sont générés pour que le routing reste complet,
mais portent `noindex` et sortent du sitemap : un shell et un easter egg
n'ont rien à indexer et dilueraient le budget de crawl.

**Slugs localisés.** `src/routing/route.ts` impose aujourd'hui des slugs
anglais pour qu'un lien partagé survive à un changement de langue. Le
préfixe `/en/` et les `hreflang` résolvent ce besoin autrement, donc le
français prend `/parcours`, `/cv`, `/a-propos`. Le commentaire du fichier
qui justifie l'ancienne règle doit être réécrit pour expliquer la
nouvelle, non supprimé.

**Rétrocompatibilité.** Au premier rendu, tout `#/<app>[/<slide>]` hérité
est traduit en son path équivalent et remplacé par `history.replaceState`.
Les liens déjà partagés sur LinkedIn et dev.to continuent de fonctionner.

## Architecture

### Où vit le contenu dans le DOM

`createRoot().render()` remplace les enfants de sa cible. Tout contenu
prérendu à l'intérieur de `#root` disparaîtrait donc au montage, et Google
indexant le DOM rendu, il ne subsisterait rien. Le contenu va dans un
frère de `#root` :

```html
<body>
  <div id="root"></div>
  <main id="seo-content"> … </main>
</body>
```

React n'y touche jamais. Avant l'exécution du JavaScript, c'est une page
lisible et mise en forme : un visiteur sans JavaScript obtient un vrai
site. Une fois l'OS monté, celui-ci la recouvre via `position: fixed;
inset: 0` opaque, et `#seo-content` reçoit `inert` et `aria-hidden="true"`
pour ne pas dupliquer l'arbre d'accessibilité.

Ni `display: none`, ni `visibility: hidden`, ni déport hors écran : le
contenu est réel et simplement occulté par un élément placé au-dessus.
C'est de l'amélioration progressive.

### Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/seo/pages.ts` | Registre. Construit les descripteurs de page depuis `identity`, `mockProjects`, `companies`, `cv`, le snapshot d'articles et `i18n`. Chaque descripteur porte `path`, `lang`, `title`, `description`, `canonical`, `alternates`, `jsonLd`, `noindex`. |
| `src/seo/SeoDocument.tsx` | Composant pur rendant le `<main>`. Piloté par les données, sans état. |
| `src/seo/jsonld.ts` | Construit `Person`, `WebSite`, `ProfilePage`, `CollectionPage`, `ItemList`, `Article`, `CreativeWork`, `BreadcrumbList`. |
| `src/seo/seo.css` | Mise en forme sobre du `<main>`, lisible sans JavaScript. |
| `scripts/seo/build-pages.ts` | Exécuté après `vite build`. Rend chaque page, injecte dans le gabarit, écrit les fichiers, le `sitemap.xml`, le `robots.txt` et le `llms.txt`. |
| `scripts/seo/snapshot-articles.ts` | Récupère dev.to et écrit `src/data/articles.snapshot.json`. |

### Le gabarit

`vite build` produit `build/index.html` avec les balises d'assets
empreintées. Le script le lit comme gabarit et, pour chaque page, remplace
`title`, `description`, `canonical` et le jeu Open Graph, puis ajoute les
`hreflang` et le JSON-LD. Les références d'assets restent identiques d'une
page à l'autre : un seul bundle, mis en cache une fois pour tout le site.

### Articles : snapshot, jamais de réseau au build

Un build qui appelle dev.to casse les déploiements le jour où dev.to est
indisponible. `scripts/seo/snapshot-articles.ts` écrit
`src/data/articles.snapshot.json`, rafraîchi par un workflow planifié qui
ouvre une pull request — le modèle déjà en place pour Dependabot. Le build
ne lit que le snapshot et reste reproductible. L'application continue
d'appeler dev.to au runtime pour la fraîcheur d'affichage.

`/api/articles?username=tykok` ne renvoie pas `body_markdown`. Le script
récupère donc la liste, puis appelle `/api/articles/{id}` pour chaque
entrée. Ces appels sont publics et ne demandent pas de clé.

### Filtre de qualité sur les articles

Sur les quatorze posts publiés, une part notable est du recyclage
d'actualité de 2022, des billets d'une ligne, ou porte un titre corrompu
par un échappement — `"An auctions due to the close of \"` et un titre
réduit à `"\"`. Rapatrier l'ensemble tel quel ajouterait du contenu mince
et périmé au domaine, ce qui pèserait sur les pages qui comptent.

Le snapshot applique donc un filtre explicite :

- un `body_markdown` sous 1 500 caractères est écarté ;
- un titre qui ne survit pas à `/^[\p{L}\p{N}]/u` après nettoyage est
  écarté ;
- une liste `EXCLUDED_IDS` permet d'en retirer à la main, chaque entrée
  accompagnée de la raison en commentaire.

Un article écarté n'est pas rapatrié et reste simplement listé sur
`/articles` avec un lien vers dev.to. Aucun contenu n'est perdu, seule la
surface indexable est tenue.

## Contenu des pages

### `/` — la page cible

```html
<h1>Elie Treport</h1>
<p class="lead">
  Alias Tykok. Développeur backend Kotlin / Spring Boot chez Pictarine,
  à Toulouse.
</p>
```

Puis `identity.bio` en entier — environ 1 200 caractères de texte réel,
ce qui manque le plus aujourd'hui — suivi de `tagline`, `now`,
`location`, `status`, des liens sortants en `rel="me"` vers GitHub,
LinkedIn, dev.to et Medium, et des liens internes vers les douze slides,
les articles, le CV et le contact. Cette page porte le graphe de crawl.

L'alias « Tykok » apparaît dans le `h1` étendu, dans le `title`, et dans
`alternateName`. C'est la condition pour qu'une recherche sur l'alias
résolve vers la personne.

### JSON-LD de `/`

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Elie Treport",
  "alternateName": "Tykok",
  "jobTitle": "Développeur Backend Kotlin",
  "worksFor": { "@type": "Organization", "name": "Pictarine" },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Toulouse",
    "addressRegion": "Occitanie",
    "addressCountry": "FR"
  },
  "image": "https://tykok.fr/identity/elie-treport.jpg",
  "url": "https://tykok.fr/",
  "sameAs": [
    "https://github.com/Tykok",
    "https://www.linkedin.com/in/elie-treport",
    "https://dev.to/tykok",
    "https://medium.com/@tykok"
  ]
}
```

`sameAs` déclare que le GitHub, le LinkedIn, le dev.to, le Medium et le
portfolio désignent une seule personne. Sans lui, ce sont cinq entités
faibles au lieu d'une forte. C'est le levier de plus fort rendement du
chantier, pour une vingtaine de lignes.

### Par type de page

| Page | Contenu | JSON-LD |
| --- | --- | --- |
| `/parcours/<projet>` | `h1` = titre, `desc`, `context`, `bullets`, `takeaway`, stack, année, statut, cover avec `alt`, liens repo et démo | `CreativeWork`, `author: Person`, `BreadcrumbList` |
| `/parcours/<entreprise>` | `h1` = nom, rôle, période, missions, stack | `WebPage`, `about: Organization`, `BreadcrumbList` |
| `/cv` | expériences, formation, attentes, depuis `src/data/cv.ts` | `Person` avec `hasOccupation`, `alumniOf`, `worksFor` |
| `/articles/<slug>` | markdown dev.to converti en HTML | `Article` : `headline`, `datePublished`, `author`, `keywords` issus des tags |
| `/parcours`, `/articles` | listes avec extraits réels, pas de simples menus de liens | `CollectionPage`, `ItemList` |
| `/a-propos`, `/contact` | courtes mais substantielles | `WebPage`, `ContactPage` |

`BreadcrumbList` sur toutes les pages enfants : c'est ce qui déclenche les
fils d'Ariane en SERP et, à terme, les sitelinks sous le nom.

### Gabarits de titres

Le nom figure sur chaque page, ce qui fait de chacune un candidat sur la
requête « Elie Treport ». Le site passe d'un unique candidat à une
trentaine par langue — le compte exact dépend du nombre d'articles
retenus par le filtre de qualité.

- `/` → `Elie Treport (Tykok) — Développeur Backend Kotlin à Toulouse`
- `/parcours/plant974` → `Plant974 — projet d'Elie Treport`
- `/articles/<slug>` → `<titre de l'article> — Elie Treport`

### `llms.txt`

Index markdown des pages françaises indexables, une ligne de résumé
chacune, plus une version markdown brute servie sous `/<page>.md`. C'est
ce que consomment les crawlers de modèles de langage, de plus en plus
souvent porte d'entrée sur une requête de nom.

## Service et routing

### nginx

Le repli SPA est la source du soft-404. Chaque route étant désormais
prérendue, il n'a plus de raison d'être.

```nginx
error_page 404 /404.html;
location = /404.html { internal; }

location / {
    try_files $uri $uri/index.html =404;
}
```

Deux corollaires :

- **Slash final.** `$uri/index.html` sert `/parcours` et `/parcours/` en
  200, soit deux URLs pour une page. Une redirection 301 de `/x/` vers
  `/x` tranche, le `canonical` sert de filet.
- **`/404.html`** est généré par `build-pages`, porte l'OS, et est servi
  avec un vrai statut 404.

La politique de cache existante s'applique telle quelle : le `map` place
tout ce qui n'est pas sous `/assets/` en `no-cache, must-revalidate`, ce
qui est le comportement voulu pour les nouveaux fichiers HTML.

### Code de routing

- `src/routing/route.ts` passe de `location.hash` à `location.pathname`,
  et `Route` gagne un champ `lang`.
- `src/context/RouteContext.tsx` bascule sur `history.pushState`.
- Traduction au premier rendu des anciens fragments, via
  `history.replaceState`.
- `src/context/LangContext.tsx` lit la langue depuis l'URL ; le sélecteur
  de langue navigue au lieu de basculer en mémoire.
- Le garde-fou qui refuse une application nommée `console` est conservé,
  adapté aux paths.
- `src/Main.tsx` conserve sa logique : `readInitialRoute` court-circuite
  déjà boot et login sur un deep link.

### Outillage

Le script de génération importe `src/seo/pages.ts`, donc du TypeScript
avec les alias `tsconfig`. `.nvmrc` est sur Node 20.14, qui n'exécute pas
le TypeScript nativement.

Retenu : **`vite-node` en devDependency**. Il lit `vite.config.ts`, donc
TypeScript et alias fonctionnent sans configuration supplémentaire.

```jsonc
"build": "tsc --noEmit && vite build && vite-node scripts/seo/build-pages.ts"
```

Alternative sans dépendance nouvelle, si elle est préférée en revue : un
`vite build --ssr` qui compile le script avant de l'exécuter, au prix d'un
artefact de build supplémentaire.

`.nvmrc` n'est pas modifié. Monter la version de Node est un chantier
distinct, pas un effet de bord de celui-ci.

Deux devDependencies au total, `vite-node` et `marked`, aucune en runtime.
Le bundle envoyé au navigateur ne grossit pas.

### CSP et JSON-LD — à vérifier, pas à supposer

La CSP déclare `script-src 'self'`. Un `<script type="application/ld+json">`
est un bloc de données que le navigateur n'exécute pas, et il ne devrait
donc pas être bloqué. Cette spec ne le tient pas pour acquis.

`.github/workflows/image.yml` exécute déjà nginx en CI : c'est là que la
vérification a sa place. Si le blocage se produit, `build-pages` génère un
`docker/csp.conf` contenant l'union des hashes sha256 des blocs JSON-LD,
inclus par `nginx.conf`. Aucun affaiblissement de la politique.

Googlebot n'applique pas la CSP pour l'indexation : le risque porte sur
les navigateurs, pas sur le référencement.

## Tests

Dans la continuité du dépôt, qui couvre déjà le `head` et la configuration
nginx.

| Suite | Ce qu'elle garde |
| --- | --- |
| `src/seo/pages.test.ts` | chaque page a un `title` non vide d'au plus 60 caractères, une `description` entre 120 et 160 caractères, un `canonical` unique, des `hreflang` symétriques — si le français pointe l'anglais, l'anglais pointe le français —, un JSON-LD parsable, et un `<main>` non vide |
| `scripts/seo/build-pages.test.ts` | le sitemap liste exactement les pages indexables : aucune page `noindex` présente, aucune page indexable absente |
| `src/routing/route.test.ts` | étendu aux paths, à la langue, et à la traduction des anciens fragments |
| `src/head.test.ts` | réécrit pour vérifier les pages générées, et plus seulement le gabarit |
| `docker/test/image.test.sh` | une URL inconnue renvoie 404 et non 200 ; `/parcours/` redirige en 301 vers `/parcours` ; le JSON-LD n'est pas bloqué par la CSP ; `sitemap.xml` et `robots.txt` sont servis avec le bon content-type |

`scripts/seo/snapshot-articles.ts` est couvert sur son filtre de qualité,
avec des entrées de test reproduisant les titres corrompus observés.

## Livrables hors code

Le code seul plafonne. Ces actions sont manuelles et reviennent au
propriétaire du domaine ; elles sont classées par rendement décroissant.

1. **Search Console.** Déclarer `tykok.fr`, vérifier par TXT DNS,
   soumettre `sitemap.xml`, demander l'indexation de `/`. Sans cette
   étape, rien n'est mesurable et l'effet du chantier reste invisible.
2. **Bing Webmaster Tools.** Import direct depuis Search Console une fois
   celle-ci en place. Alimente aussi DuckDuckGo.
3. **`sameAs` réciproque.** Renseigner `tykok.fr` comme site web sur
   LinkedIn, GitHub, dev.to et Medium. `sameAs` déclare le lien dans un
   sens ; ces profils le confirment dans l'autre, et c'est la
   confirmation qui porte le signal.
4. **Cohérence du libellé.** Écrire « Elie Treport » à l'identique
   partout : LinkedIn, GitHub, dev.to, Medium, signature de commits. Une
   variante orthographique fragmente l'entité.
5. **`canonical_url` dev.to.** Pour chaque article rapatrié, renseigner
   l'URL `tykok.fr` correspondante dans le champ dédié de dev.to. À faire
   **après** la mise en production des pages, jamais avant : un canonical
   pointant vers une URL absente ferait sortir l'article de l'index sans
   le remplacer.
6. **Medium.** Même logique via l'option d'import avec lien canonique, si
   les articles concernés y sont dupliqués.

## Découpage de l'implémentation

Le chantier est large : il touche le routing, le build, le service nginx et
les données. Il reste un seul objectif cohérent, mais le plan
d'implémentation devrait l'exécuter en quatre lots livrables
indépendamment, chacun déployable sans attendre le suivant.

1. **Socle indexable.** `src/seo/`, `build-pages.ts`, prérendu de `/` en
   français seulement, JSON-LD `Person` et `WebSite`, `sitemap.xml`,
   `robots.txt` généré. Le routing ne bouge pas encore. Ce lot seul règle
   l'essentiel de la cible primaire et peut partir en production en
   premier, ce qui laisse le temps à l'indexation de démarrer pendant que
   le reste se construit.
2. **Routing en paths.** `route.ts`, `RouteContext`, traduction des
   anciens fragments, nginx et fin du soft-404, `/404.html`. Débloque les
   pages enfants.
3. **Pages enfants et bilingue.** Les douze slides, le CV, le contact,
   l'à-propos, puis `/en/` et les `hreflang`.
4. **Articles.** Snapshot dev.to, filtre de qualité, `marked`, pages
   d'articles, `llms.txt`, workflow planifié. Suivi du basculement manuel
   des `canonical_url`.

Les livrables hors code numérotés 1 et 2 — Search Console et Bing — sont à
faire **avant** le lot 1, afin que la mise en production soit mesurée dès
le premier jour.

## Hors périmètre

- Monter la version de Node.
- Réécrire le site sur un framework SSG.
- Poursuivre la requête `Elie` seule.
- Publicité, achat de liens, ou toute technique hors référencement
  naturel.
- Rapatrier les articles écartés par le filtre de qualité.

## Critères de réussite

Mesurés dans Search Console, dont la mise en place est elle-même le
premier livrable.

1. `curl https://tykok.fr/` renvoie un HTML contenant le nom, l'alias et
   la biographie, sans exécution de JavaScript.
2. Les pages indexables sont présentes dans le sitemap et signalées comme
   indexées.
3. Une URL inconnue renvoie 404 et non 200.
4. Le test de résultats enrichis de Google valide `Person` sur `/` et
   `Article` sur une page d'article.
5. À trois mois, `tykok.fr` occupe le premier résultat sur « Elie
   Treport » et sur « Tykok ».
