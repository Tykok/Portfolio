# Personal Projects and Developer Expectations — Design

**Date:** 2026-07-30
**Status:** Approved
**Scope:** Turn the Projects deck into eight personal projects with real narrative copy, and
state in the CV what Elie wants to work on.

## Goal

Two gaps, closed together because the same interview answered both.

The deck holds six projects, five of which are salaried or internship work. Their
`context` and `takeaway` fields render but no project fills them. Meanwhile five personal
projects are absent from the site entirely — a self-hosted Proxmox platform, a Kotlin
backend for reporting illegal waste dumps in Réunion, a scraped NoSQL flora database, a
game backend, and a Python script that half a class actually used.

Nothing anywhere says what Elie wants to do next, beyond a green pill reading *Ouvert aux
opportunités* — which he does not want the site to say.

## Supersedes

This supersedes `2026-07-30-projects-deck-content-design.md`, whose Task 6 was never
implemented. That spec's structural work (the `context` and `takeaway` fields, the
takeaway block, the rail keeping monograms, the banner generator) is done and stands.
Three of its decisions are withdrawn:

1. **The deck is not eight projects, five of them employer work.** It is eight personal
   projects. Employer work leaves the deck.
2. **`p_no_public_code` is not "Projet d'entreprise — code non public".** With no employer
   projects left, that wording is wrong. It becomes a generic fallback, and per-project
   notes take over.
3. **Five of its banners are deleted.** `payments`, `pictarine-tooling`, `auction`,
   `threaddump` and `schools` have no slide to sit on.

The reason its Task 6 stalled is worth recording: it asked Elie to narrate employer work
in the first person, stating problems and lessons he cannot publish the details of. Every
draft for those five read as invention because it was. The personal projects have no such
constraint.

## Why employer work leaves the deck

It is already in the CV. `Cv.tsx` carries six positions with detailed bullets. The deck
repeated them under the word "projects", which duplicated the content and forced prose
that could not be written honestly.

Employer work gets its own lot instead, in a shape Elie specified: **one company, one
card** — a presentation of the company, its objective, his role there, and the projects he
led inside it. That framing works where per-project narration failed, because it describes
a context rather than claiming a personal lesson from work owned by someone else.

Until that lot lands, the five entries and their copy stay in git history and in the
superseded spec. Nothing is lost.

## Non-goals

- **No employer-project slides.** Deferred to the company-card lot below.
- **No per-role summary sentence in the CV.** The previous spec listed it as a follow-up.
  It waits for the company-card lot, which covers the same ground; writing it twice would
  mean writing it differently twice.
- **No invented metrics.** Unchanged from the superseded spec. Cedict's twelve GitHub
  stars are verified and deliberately unused: Elie reports no feedback from users, and
  twelve stars are not feedback.
- **No architecture diagrams.** Still deferred, for the reason the previous spec gave: the
  hero is a 3.5:1 band with white text over it.
- **No change to the projects API contract shape**, beyond the field removals below.

## Data model

Three changes to `Project` in `src/data/projects.ts`.

**Remove `tags: string[]`.** Nothing reads it. `grep` for `.tags` across `src/` returns
one hit, `Cv.tsx:244`, which iterates the CV's own `EXPERIENCE` constant — not
`Project.tags`.

**Replace `stack: StackItem[]` with `stack: string[]`,** and delete the `StackItem`
interface and its re-export from `data/index.ts`. `ProjectSlide.tsx:57` calls
`getBadge(s.label)` and never reads `s.color`. The colour was being maintained in two
places, and only one of them was rendered. `getBadge` already falls back to grey plus the
first two characters for an unknown name, so a stack entry never needs a registered badge
to render.

Two consumers, not one: `PortfolioPage.tsx:127` also reads `p.stack.slice(0, 2)` for the
browser page's project table. An earlier revision of this section named `ProjectSlide` as
the only reader; it is not, and the implementation plan carries both files.

Both fields would otherwise have to be filled for five new projects, with nothing to show
for it.

**Add `linkNote?: LocalizedString`.** One i18n key cannot cover four situations that now
coexist:

| Project     | Why it has no link                                      |
| ----------- | ------------------------------------------------------- |
| `ticoqos`   | the visitor is already looking at it                    |
| `homelab`   | it is infrastructure, not software; there is no repo     |
| `ramassali` | private until the project is presentable                |
| `meyiv`     | private, in progress, and not solely his                |

`linkNote` renders in place of the fallback when set. `p_no_public_code` stays as the
fallback for an API-served project with neither links nor a note, reworded to the generic
*Code non public* / *Code is not public*.

## The deck — eight personal projects

Order, and the reasoning: the visitor is inside the first one; the second is the platform
the others run on; three and four are the ones with a purpose; five and six are published
and installable; seven is in flight; eight closes on the best line in the deck.

| # | id             | Title                                   | Year | Status           | Accent    |
| - | -------------- | --------------------------------------- | ---- | ---------------- | --------- |
| 1 | `ticoqos`      | TicoqOS — Portfolio                     | 2025 | `in-progress`    | `#0a66c2` |
| 2 | `homelab`      | Homelab — ma propre plateforme          | 2024 | `live`           | `#475569` |
| 3 | `ramassali`    | RamassALi — signalement des dépôts sauvages | 2025 | `in-progress` | `#2f9e44` |
| 4 | `plant974`     | Plant974 — flore de La Réunion          | 2024 | `open-source`    | `#5c940d` |
| 5 | `pokeapi-kotlin` | PokeAPI-Kotlin — bibliothèque         | 2022 | `maintained`     | `#e8590c` |
| 6 | `cedict`       | Cedict — dictionnaire chinois           | 2022 | `open-source`    | `#0e7490` |
| 7 | `meyiv`        | Meyiv — backend de jeu                  | 2025 | `in-progress`    | `#7048e8` |
| 8 | `ipi-calendar` | Scraping de l'agenda de l'IPI           | 2022 | `archived`       | `#c2255c` |

Accents are spread across blue, slate, green, olive, orange, teal, violet and magenta so
that no two adjacent slides share a hue, and each banner is drawn from its own accent.

`all-for-trash` is renamed **RamassALi** at Elie's request. It has never shipped under the
old name, so nothing needs a redirect.

### Facts verified against GitHub, not inferred

The superseded spec set this rule and it caught three errors in the drafts:

| Project          | Draft said | GitHub API says                                       |
| ---------------- | ---------- | ----------------------------------------------------- |
| `plant974`       | 2023       | created 2024-03-19, last push 2024-04-25, TypeScript  |
| `ipi-calendar`   | 2023       | created 2022-10-29, last push 2022-10-31, Python      |
| `pokeapi-kotlin` | 2023       | created 2022-07-26, **last push 2026-03-11**          |

`pokeapi-kotlin` is still being touched in 2026, so its status is `maintained` rather than
merely published. Both GitHub Pages demos were fetched and return **200**; the two demo
links are safe to publish. `Plant974` and `IPI-Calendar-Scrap` are public and carry no
licence file, which is why neither claims one.

### Copy

French is the source of truth below, validated line by line with Elie. English is written
during implementation as a mirror of it, under the same rules, and reviewed by him before
the branch merges.

`desc` stays one line of roughly 90 to 120 characters. `context` is one to three sentences
on the problem the project existed to solve. `takeaway` is one or two sentences on what
building it taught — including, for a project still in flight, an honest statement that
the lesson has not arrived yet.

#### 1. `ticoqos`

- **desc** — Portfolio façon OS rétro : fenêtres, taskbar, terminal et apps. Le site que vous parcourez.
- **context** — Le premier système que j'ai eu entre les mains, c'était pour faire des exposés en primaire. Reconstruire ce bureau-là était d'abord un plaisir, et un prétexte : écrire un vrai gestionnaire de fenêtres plutôt qu'une page de plus. Un CV en PDF ne montre pas comment quelqu'un construit — celui-ci se manipule.
- **takeaway** — Le drag, le z-index et le focus clavier m'ont pris du temps, mais ils ont une fin. Ce qui n'en a pas, c'est la cohérence : deux langues, cinq thèmes et sept apps qui doivent rester d'accord sans qu'une seule chaîne soit écrite deux fois.

An earlier revision of this sentence said *une douzaine d'apps*. A review checked it against
the code: `AppKey` in `src/types/app.ts` and the registry in `src/data/apps.ts` hold exactly
seven apps, and `OSContext.tsx:6` exactly five themes. Two of the three figures were right
and the app count was not. Elie chose the exact number over the figure of speech, which is
what the no-invented-metrics rule demanded of a sentence that is trivially checkable by
anyone who opens the repository.
- **bullets** — Gestionnaire de fenêtres & taskbar maison · i18n FR/EN, thèmes et easter eggs · API projets dynamique
- **role** — Projet personnel — conception, design et développement
- **stack** — React, TypeScript, Vite
- **links** — none. **linkNote:** « Vous êtes dedans. »

Windows XP is not named, here or anywhere. `fr.ts:57` already states the OS is a tribute
recreation with no affiliation to a real vendor; naming the original would contradict it.

#### 2. `homelab`

- **desc** — Un Proxmox sur NUC et NAS, chez moi : réseau, reverse proxy, supervision et déploiement de mes projets.
- **context** — En première alternance, j'administrais des serveurs Linux, je faisais du monitoring et du déploiement automatisé. J'ai voulu refaire cette expérience pour moi, avec ce que j'ai appris depuis : mon propre Proxmox, mon propre réseau, et mes projets qui tournent dessus plutôt que chez un hébergeur.
- **takeaway** — S'héberger soi-même veut dire tout posséder : les certificats, les sauvegardes, ce que Fail2Ban attrape dans les logs. Ce qui rend ça tenable n'est pas d'aller vérifier à la main, c'est un flow n8n qui me prévient quand une sauvegarde Proxmox s'est mal passée.
- **bullets** — Proxmox sur NUC et NAS, reverse proxy Traefik, Fail2Ban · Sauvegardes et veille tech automatisées avec n8n · Héberge mes projets persos — ce portfolio bientôt
- **role** — Projet personnel — infrastructure, réseau, exploitation
- **stack** — Proxmox, Docker, Traefik, PostgreSQL
- **links** — none. **linkNote:** « Pas de dépôt : c'est une infrastructure, pas un logiciel. »

The first-alternance thread is the load-bearing detail. `Cv.tsx:63` already records *server
administration (Apache, PostgreSQL, SSH), automation (Python / Bash / cron)* at MecaLIFE.
The homelab is that experience repeated for himself, which is why it is a project and not a
line in a skills list.

HomeAssistant and Nginx also run there and are deliberately left out of `stack`, which is
capped at four entries to keep the badge row on one line.

#### 3. `ramassali`

- **desc** — Backend Kotlin / Spring pour signaler les dépôts de déchets sauvages à La Réunion et organiser les sorties de nettoyage.
- **context** — À La Réunion, les dépôts sauvages se signalent de bouche-à-oreille et les associations organisent leurs sorties sans carte commune. L'idée est simple : un signalement collaboratif, pour que les habitants et les associations voient les mêmes points au même endroit.
- **takeaway** — Le backend est la partie que je sais faire. Le vrai obstacle est ailleurs : une application collaborative ne vaut rien sans communauté, donc le travail qui compte est d'aller parler aux associations, pas d'écrire des endpoints.
- **bullets** — Backend Kotlin / Spring Boot · Application mobile et site web à venir · Hébergé sur mon homelab
- **role** — Projet personnel — conception et backend
- **stack** — Kotlin, Spring Boot, PostgreSQL
- **links** — none. **linkNote:** « Dépôt privé tant que le projet n'est pas présentable. »

#### 4. `plant974`

- **desc** — Base NoSQL de la flore réunionnaise, constituée par scraping, explorable dans Grafana.
- **context** — Un projet d'école demandait de bâtir une base NoSQL à partir d'une source publique. Je suis allé plus loin : plutôt qu'un jeu de données d'exercice, j'ai scrapé un site répertoriant les espèces présentes à La Réunion avec leurs images, pour obtenir une base réelle qui n'existait nulle part sous cette forme.
- **takeaway** — Mon premier vrai contact avec le NoSQL : stocker chaque espèce en JSON complet dans Redis suffit pour démarrer, et c'est en voulant explorer la donnée — d'où le Grafana branché dessus — que j'ai commencé à voir ce qu'un choix de base fait gagner ou coûter.
- **bullets** — Scraping en Node / TypeScript, images comprises · Stockage JSON dans Redis · Exploration des données via Grafana
- **role** — Projet d'école poussé plus loin — scraping, modélisation, restitution
- **stack** — Redis, TypeScript, Node.js, Grafana
- **repo** — `https://github.com/Tykok/Plant974`
- **demo** — none (`has_pages` is false)

The NoSQL requirement came from the school; Redis was Elie's choice, and the storage is
full JSON documents rather than hashes or a secondary index. The takeaway says exactly
that, and claims no more: an earlier draft credited him with a lesson about key-value
access paths that he did not report having.

#### 5. `pokeapi-kotlin`

- **desc** — Bibliothèque Kotlin publiée sur Maven Central, qui expose la PokéAPI en un appel typé.
- **context** — J'avais utilisé la PokéAPI pour des projets scolaires et je voulais lui rendre hommage : un wrapper Kotlin qui expose ses données en un appel typé, au lieu de réécrire les mêmes classes de données à chaque fois. Mais l'objectif premier était ailleurs — publier une première bibliothèque sur Maven Central et voir ce que ça demande vraiment.
- **takeaway** — Le code n'était pas le morceau, la publication l'était : signature GPG, staging Sonatype, javadoc obligatoire — et une migration de la méthode de déploiement en cours de route, qui m'a fait tout reprendre. Une bibliothèque n'existe qu'au moment où quelqu'un d'autre peut l'ajouter en une ligne.
- **bullets** — Publiée sur Maven Central sous `fr.tykok:pokeapi` · Documentation MkDocs sur GitHub Pages · Licence MIT, CHANGELOG et guide de contribution
- **role** — Projet personnel — conception, publication, documentation
- **stack** — Kotlin, Gradle, JUnit
- **repo** — `https://github.com/Tykok/PokeAPI-Kotlin`
- **demo** — `https://tykok.github.io/PokeAPI-Kotlin/`

The Maven Central deployment migration mid-project is the detail that earns the takeaway.
The closing sentence claims a *possibility*, not usage: Elie knows of no users, and the
sentence is true regardless.

#### 6. `cedict`

- **desc** — Bibliothèque et CLI TypeScript publiées sur npm pour interroger le dictionnaire chinois CEDICT.
- **context** — J'apprenais le chinois — réputé une des langues les plus difficiles, ce qui suffisait à me motiver — avec l'idée d'en tirer une application pour quelqu'un. Le CEDICT, la référence libre du domaine, est distribué comme un fichier texte au format maison que chacun re-parse à sa façon. Je voulais au passage comprendre ce que publier sur npm demande.
- **takeaway** — Le vrai travail a été le parsing : le format n'a rien de standard, et le rendre exploitable a pris bien plus de temps que la CLI qui l'expose. Le reste de la valeur tient dans un workflow planifié qui récupère la version amont, la teste et la publie — sans lui, la bibliothèque serait déjà périmée.
- **bullets** — Publiée sur npm sous `@tykok/cedict-dictionary` · Parsing d'un format texte non standard · Workflow planifié qui suit le dictionnaire amont
- **role** — Projet personnel — parseur, CLI, chaîne de publication
- **stack** — TypeScript, Node.js, Jest
- **repo** — `https://github.com/Tykok/cedict-chinese-transformation`
- **demo** — `https://tykok.github.io/cedict-chinese-transformation/`

The superseded spec's draft claimed *the parser took an afternoon*. Elie says the opposite:
decomposing the non-standard file was the time sink. The takeaway is inverted accordingly.

#### 7. `meyiv`

- **desc** — Backend Kotlin / Spring d'un jeu clicker de rôle : authentification, comptes et progression du joueur.
- **context** — Un collègue construisait un jeu clicker inspiré du jeu de rôle, et il lui manquait tout l'arrière : comptes, connexion, sauvegarde de l'avancée. Je suis venu prendre cette partie, seul sur le back.
- **takeaway** — Un back de jeu clicker a une contrainte que les autres n'ont pas : le client peut mentir sur ce qu'il a fait, et la progression doit continuer d'avancer hors ligne. Je sais que ce sera le sujet ; le back est encore en cours et je n'y suis pas encore.
- **bullets** — Authentification et gestion de compte · Progression du joueur persistée · Kotlin / Spring Boot, seul sur le back
- **role** — Projet perso, en renfort d'un collègue — tout le backend
- **stack** — Kotlin, Spring Boot, PostgreSQL
- **links** — none. **linkNote:** « Dépôt privé — projet en cours, et il n'est pas que le mien. »

The takeaway names a problem Elie has not solved yet and says so. That is deliberate: a
project in flight that claims a finished lesson is the failure mode this whole spec exists
to avoid.

#### 8. `ipi-calendar`

- **desc** — Petit script Python qui transforme l'agenda de l'école en fichier .ics, pour l'ouvrir dans n'importe quel calendrier.
- **context** — L'agenda de l'IPI n'était consultable que dans son propre outil, qui n'avait rien de moderne. Il fallait aller le regarder à la main au lieu de voir ses cours à côté du reste de sa semaine.
- **takeaway** — C'est mon plus petit projet et le seul dont d'autres gens se sont vraiment servis : une partie de ma promo l'a utilisé un moment. L'utilité ne se mesure pas à la taille de ce qu'on écrit.
- **bullets** — Récupération de l'agenda et export .ics · Script Python lancé en local · Utilisé par une partie de ma promo
- **role** — Projet personnel — script et format de sortie
- **stack** — Python
- **repo** — `https://github.com/Tykok/IPI-Calendar-Scrap`
- **demo** — none

The repository is named `IPI-Calendar-Scrap`; the displayed title is *Scraping de l'agenda
de l'IPI*. The repository name keeps its spelling because renaming it would break the URL;
the title uses the correct English spelling because visitors read the title.

## The CV

### Status

`identity.status` becomes **À l'écoute, sans chercher** / *Not looking, but listening*.
Elie is employed and not searching, and the site should not claim otherwise. The value is
consumed in three places already — `About.tsx:25`, `Terminal.tsx:102`, and
`PortfolioPage.tsx:67` — so one edit propagates.

Five further pieces of copy are written for a job hunt and go with it:

| Location            | Today                                            | Becomes                                                          |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `fr/en.ts:41`       | mascot tip: *Elie est ouvert aux opportunités !* | *Elie héberge ce portfolio sur son propre serveur.*              |
| `fr/en.ts:58`       | *Mémoire : suffisante pour recruter ce développeur* | *Mémoire disponible : assez pour huit projets et un homelab.* |
| `Bsod.tsx:10`       | `RECURSIVE_HIRE_LOOP_IN_BACKEND_DEVELOPER`       | `KERNEL_PANIC_IN_COCORICO_MODULE`                                |
| `Bsod.tsx:16,18,20` | budget *sufficient for hiring*, *hiring process*, *new recruiters* | the same three lines, aimed at the OS (see below) |
| `make_og.py:71`     | pill reading *Ouvert aux opportunités*, baked in | regenerated with the new status                                  |

The BSOD parody keeps its Windows cadence and drops the recruitment framing. The middle
paragraph becomes:

> Check to make sure your coffee supply is sufficient.
> If the mascot is still crowing, run the window manager
> to make sure any new themes are properly configured.

**And a rendering bug is fixed while the file is open.** `Bsod.tsx:12` writes `you&aposve`
— an HTML entity missing its semicolon. Babel does not decode it, so the built bundle ships
the literal string: `grep` finds `you&aposve seen` in `build/assets/index-BW2uh7F6.js`. It
becomes `you&apos;ve`. Unrelated to this spec's goal, in scope because the alternative is
leaving a visible defect in a file being edited anyway.

`public/og-image.png` does not exist on this branch — it lives on `feat/site-identity`.
The card must be regenerated there too, or it will ship the old pill. This is recorded as a
cross-branch dependency, not silently handled here.

`t_neofetch` hardcodes *6 projets / 1 développeur* in both locales and becomes *8*.
`SlideRail` and `Terminal` count `projects.length`, so they need nothing.

### "Ce qui m'intéresse"

A new block in the CV side column, after *Langues*, three lines:

> **Le back, l'infra et les bases de données.** C'est là que je veux rester.
>
> **Un endroit où on apprend.** C'est ma seule condition non négociable.
>
> **Construire quelque chose de vraiment utile**, qui ait du sens — c'est ce que je vise à trois ans.

Titled *Ce qui m'intéresse*, not *Ce que je recherche*. The status says he is not looking;
a heading that says he is would contradict it on the same screen. Talking about the work
rather than the position removes the tension and keeps the block out of cover-letter
register.

Rendered as three short paragraphs, not as chips: `cv2-soft` chips hold two or three words,
and these are sentences. They print with the rest of the CV, which is intended.

### Bio

A third paragraph is added to `identity.bio`, short, covering the spine the interview
surfaced and that nothing on the site currently states: Réunion, self-hosting, and building
things that are useful. The existing two paragraphs are untouched, and `About.tsx:28` and
`Cv.tsx:221` both split on `\n\n`, so a third paragraph renders in both with no code change.

## Assets

**Deleted:** `public/projects/{payments,pictarine-tooling,auction,threaddump,schools}.png`
— five banners whose slides are gone.

**Kept:** `pokeapi-kotlin.png`, `cedict.png`.

**New, five motifs in `make_covers.py`,** abstract, no text, each drawn from its project's
accent:

| id             | Motif                                                              |
| -------------- | ------------------------------------------------------------------ |
| `homelab`      | rack silhouettes with routed lines between them, behind one shield outline |
| `ramassali`    | scattered points over a contour, converging into one cleared zone   |
| `plant974`     | frond and vein structures fanning out over a faint grid             |
| `meyiv`        | an ascending step curve above accumulating blocks                   |
| `ipi-calendar` | a week grid of blocks with one arrow leaving it                     |

**Still a placeholder:** `ticoqos.png` carries `À REMPLACER`. It wants a real screenshot of
the deployed desktop. It is the one image allowed to contain words, precisely so it cannot
reach production unnoticed, and it is Elie's to produce.

The generator's constraints are unchanged: 1200×340 PNG, under 80 000 bytes, enforced
inside `save_png`; Pillow floor 8.1; run by hand, never in CI.

## i18n

| Key                | Change  | Note                                                     |
| ------------------ | ------- | -------------------------------------------------------- |
| `p_no_public_code` | reworded | generic *Code non public*; no employer projects remain    |
| `cv_interests`     | kept    | *Centres d'intérêt*, unrelated to the new block           |
| `cv_wants`         | added   | *Ce qui m'intéresse*, heading of the new CV block         |
| `t_neofetch`       | edited  | 6 → 8 projects, both locales                              |

The `fr`/`en` parity assertion in `i18n.test.ts` catches a key added to one file only.

## Testing

`api/projects.test.ts` currently asserts unique ids, localized `title`/`desc`/`bullets`,
and `role` in both languages. It asserts nothing about `tags` or stack colours, so removing
those fields costs it nothing — only `tsc` and the mock change.

**Updated**

- `ProjectSlide.test.tsx` — the private-code assertion moves to the reworded fallback.
- `identity.test.ts` — the status assertion follows the new value; the bio is asserted to
  split into three paragraphs.
- `i18n.test.ts` — needs nothing; parity and list lengths are already generic.

**Added**

- `api/projects.test.ts` — `cover`, `context` and `takeaway` set on all eight projects in
  both languages, following the existing `role` assertion's shape; every `cover` matches
  `/^\/projects\/[a-z0-9-]+\.png$/`; every cover resolves to a file that exists under
  `public/` and stays under 80 kB. The disk check is the most valuable assertion of the lot:
  a typo produces a broken hero in production and nothing else notices.
- `api/projects.test.ts` — every `repo` and `demo` is either `'#'` or an absolute `https://`
  URL. This is the cheap half of the link check; the expensive half was done by hand against
  the GitHub API and is recorded above rather than repeated in CI, which must not depend on
  the network.
- `ProjectSlide.test.tsx` — `linkNote` renders in place of the fallback when set; the
  fallback shows when a project has neither links nor a note; a project with a repo shows
  the button and neither note.
- `Cv.test.tsx` — the *Ce qui m'intéresse* block and its three lines render.

**Not covered, deliberately**

- **Banner dimensions.** Guaranteed by `save_png`, which refuses any other canvas size.
- **Visual regression.** The five new banners are judged by eye before being committed.
- **Live links.** Asserting that `tykok.github.io` answers would make the suite depend on
  the network and on someone else's uptime.

## Decisions left to the owner

Recorded because they are Elie's and were left open on purpose:

1. **`github.com/Tykok/Portfolio` is public.** The remote of this repository resolves to it
   and the GitHub API reports `private: false`. Elie stated he does not want the portfolio
   public. `.env.example` holds only variable names, so nothing is leaking, but the
   repository and its full history are readable by anyone. This spec assumes the current
   intent — TicoqOS ships **no links** and the note *Vous êtes dedans* — so that the deck
   is correct whether he makes the repository private or decides to own it. Reversing it is
   a two-line change.
2. **Cedict's twelve stars go unmentioned.** Verified, and unused: Elie reports no user
   feedback, and a star is not feedback.

## Follow-up lots

1. **One company, one card.** Elie's framing for employer work: the company, its objective,
   his role, and the projects he led there. Replaces the five slides this spec removes, and
   covers the per-role CV summary sentence that is deferred with it.
2. **Architecture diagrams** — a `deck-arch` section, enlargeable, still deferred.
3. **A real TicoqOS screenshot**, replacing the `À REMPLACER` placeholder.
4. **`index.html` metadata** — `content="Web site created using create-react-app"` is still
   the Create React App default, and the title is *Tykok Portfolio*. Out of scope here;
   `feat/site-identity` is where head metadata lives.
5. **Regenerate `og-image.png` on `feat/site-identity`** with the new status pill.
