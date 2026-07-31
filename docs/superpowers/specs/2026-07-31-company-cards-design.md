# One Company, One Card — Design

**Date:** 2026-07-31
**Status:** Approved
**Scope:** Give the deck a second group of entries — one card per employer — and correct
what the CV was leaving out.

## Goal

`2026-07-30-personal-projects-and-expectations-design.md` removed five employer projects
from the deck and recorded the replacement as its first follow-up lot: *one company, one
card — the company, its objective, his role, and the projects he led there*. This is that
lot.

The removal was right and left a real gap. The site now says a great deal about what Elie
builds on his own and, outside the CV's bullet lists, nothing about where he has worked or
what those places do. A reader of the CV's *"Intégrations de paiement (Stripe) et de
services tiers"* cannot tell whether that served a hundred users or several million.

## What the interview changed

Four things came out of the interview that the repository did not know, and two of them
mean the CV is currently understating real experience:

1. **GCP is absent from the CV.** Elie designs and maintains Cloud Functions, Cloud
   Scheduler and Cloud Run at Pictarine. His CV entry lists `Kotlin, Spring Boot,
   PostgreSQL, Stripe, Docker` and no cloud platform at all. Python is missing too.
2. **The CV names the wrong MecaLIFE product.** It describes an *auction platform with
   dynamic pricing*, which was real but arrived at the end of the role. The main product —
   detailed vehicle reports, giving a model's equipment and options from its make, year and
   version — is not mentioned. Laravel, React, Express, Apache and Debian are missing from
   its tags.
3. **Both internships have the same shape.** At Cegid and at Réseau Canopé, Elie worked
   alone with a tutor, and in both cases the deliverable was a tool for colleagues rather
   than a product for customers. This is a good line and it is deliberately **not** shipped
   — see *Rejected* below.
4. **The partners are not to be named.** Pictarine's apps serve large North American
   chains. Elie was asked and chose not to name them; the copy conveys scale without them.

Because the CV understates two real things, this lot corrects the CV as well as adding the
cards. Elie was offered the narrower scope and chose the wider one: the same interview
answers both, and splitting them means doing the work twice.

## Non-goals

- **No banners for company cards.** `ProjectSlide` already falls back to the gradient and
  monogram when `cover` is absent, and `CompanySlide` will do the same. The previous lot
  deleted five employer banners for good reasons; drawing four more would undo that.
- **No per-card lesson.** Company cards carry what the company does, Elie's role, and the
  work he did there. Nothing else. See *Rejected*.
- **No renamed `AppKey`.** See below — the displayed title changes, the key does not.
- **No new app.** The cards join the existing deck rather than opening a ninth window.
- **No employer screenshots or internal detail.** Unchanged from the previous lot.

## Structure

The deck's rail splits into two titled groups — **Persos (8)** then **Pro (4)** — and the
stage renders one of two slide bodies depending on which kind of entry is active.

### The app keeps its key and changes its name

`AppKey 'projects'` stays. Only the displayed title moves, from *Projets* / *Projects* to
**Parcours** / **Work**, in `apps.ts` (both `title` and `short`, the latter being what the
taskbar button shows).

The key is deliberately untouched: `useIconPositions` persists desktop icon positions in
`localStorage` keyed by app, so renaming the key would silently reset the desktop of every
returning visitor. The key is an identifier; the title is what people read. Changing the
key would also touch `types/app.ts`, `apps.ts`, `Main.tsx`, `StartMenu`'s `PINNED` and
`SUB_KEY`, and the terminal's `open` argument — all to no visible benefit.

`sub_projects` (*Mes réalisations* / *My work*) still reads correctly for a window holding
both groups and is left alone.

### Adding companies changes no project count

Three places state how many projects exist: `p_count_l` as the heading of
`PortfolioPage`'s table, `t_projects_l` in the terminal, and the hardcoded figure in
`t_neofetch`. All three describe the projects loaded through `ProjectsContext`, which stays
personal-only — companies are static data confined to the deck. All three therefore remain
correct with no edit, and the `t_neofetch` guard test added by the previous lot keeps
holding.

## Data model

Two shapes, one union. A company has no `takeaway`, no `context`, no `repo` and no `demo`;
it has a period, a description of the business, a role, and a list of the work done there.

```ts
// src/data/companies.ts — new
export interface Company {
  id: string;
  monogram: string;
  gradient: string;
  name: string;                 // 'Pictarine' — not localized
  place: LocalizedString;
  period: LocalizedString;
  role: LocalizedString;        // title plus one or two sentences on scope
  what: LocalizedString;        // what the company does
  work: LocalizedStringArray;   // the projects and chantiers inside it
  stack: string[];
}

export const companies: Company[] = [ /* four entries, in the order below */ ];
```

```ts
// src/data/deck.ts — new
export type DeckEntry = { kind: 'personal'; project: Project } | { kind: 'company'; company: Company };

/** What the rail needs, whichever kind it is given. */
export function toRailItem(entry: DeckEntry, lang: Lang): { id: string; monogram: string; gradient: string; label: string };
```

The union **wraps** rather than intersects. `Project` and `Company` both carry `monogram`,
`gradient`, `stack` and `role`, with different meanings for `role`; an intersection would
either collide or silently let one shape's field satisfy the other's. Wrapping keeps each
shape intact and makes `entry.kind` the only way to reach a field.

`toRailItem` exists so `SlideRail` stays ignorant of both shapes. It is the one place that
knows a company's rail label is its `name` while a project's is its localized `title`, and
it is unit-testable without rendering anything.

Companies are a **static module constant**, like the CV's `EXPERIENCE`. They do not pass
through `api/projects.ts`. This asymmetry is deliberate: projects have a dynamic API
planned and a `VITE_USE_MOCK` switch behind them, whereas a company is CV data that changes
when Elie changes jobs.

## Rendering

| Component | Change |
| --- | --- |
| `Projects.tsx` | builds `DeckEntry[]` — personal from `useProjects()`, then companies from the constant |
| `SlideRail.tsx` | two titled groups, each with its own count; indices remain global across both |
| `SlideStage.tsx` | dispatches on `entry.kind`; keyboard nav and the `n / total` counter span both groups |
| `CompanySlide.tsx` | **new** — `what`, `role`, `work`, stack badges. No links section, no takeaway block |
| `ProjectSlide.tsx` | unchanged; it still receives a `Project` |

The stage's arrow keys and prev/next buttons run across the whole list, so a visitor can
walk from the last personal project into the first company without touching the rail. That
is the point of merging them into one window.

## Content — the four cards

French is the source of truth, validated with Elie. English is written during
implementation as a mirror, under the same rules, and **Elie must read it before merge** —
the previous lot shipped with the English unreviewed and that is not a precedent worth
repeating.

Order: most recent first, which is also decreasing relevance to a reader.

### 1. Pictarine · Toulouse · oct. 2022 → présent

- **what** — Impression photo en magasin : Pictarine développe les applications par lesquelles les clients commandent leurs tirages, retirés ensuite chez de grandes enseignes nord-américaines.
- **role** — Backend Engineer. Je conçois, fais évoluer et maintiens l'API, et je porte tout ce qui touche à la base PostgreSQL. Je travaille aussi sur GCP : Cloud Functions, Cloud Scheduler, Cloud Run.
- **work** — Paiement Stripe et gestion de compte client · Services tiers pour le marketing (Klaviyo) · Première version du catalogue produit · Tooling interne en Next.js, adopté par toutes les équipes
- **stack** — Kotlin, Spring Boot, PostgreSQL, GCP, Next.js, Python

*grandes enseignes nord-américaines* is the scale statement agreed in place of the partner
names. It is true and it names nobody.

### 2. MecaLIFE Group · Toulouse · mars 2021 → sept. 2022

- **what** — Rapports détaillés de véhicules : les équipements et options d'un modèle donné, à partir de sa marque, son année et sa version.
- **role** — Full Stack Developer, en alternance puis en poste. Front, back, base de données, et l'administration des serveurs Debian avec leur chaîne de déploiement.
- **work** — La plateforme de rapports véhicules · Une plateforme de ventes aux enchères en fin d'alternance, avec paiement Stripe et tarification dynamique selon le type de véhicule · Un outil interne d'aide à la conception de rapports · CI/CD, Apache et Docker sur Debian
- **stack** — PHP, Laravel, React, Node.js, PostgreSQL, Docker

One card covers both MecaLIFE positions, per *one company, one card*. The CV keeps the
two-position chronology; the card carries the context. The auction platform is placed where
it belongs in time — at the end — rather than standing for the whole role as the CV
currently has it.

### 3. Réseau Canopé · Saint-Denis, La Réunion · janv. → févr. 2020

- **what** — Opérateur public de l'Éducation nationale : ressources pédagogiques, livres scolaires, action culturelle. L'antenne de Saint-Denis couvre La Réunion.
- **role** — Full Stack, stage. Seul sur le projet, accompagné d'un tuteur.
- **work** — Un site répertoriant les établissements scolaires de l'île sur une carte interactive · Recueil des besoins, modélisation et création de la base · Recherche avancée, connexion sécurisée et gestion des droits · Objectif : que les équipes voient où des actions ont été menées, pour décider où en mener de nouvelles
- **stack** — PHP, MySQL, JavaScript

### 4. Cegid · Roubaix · juin → juil. 2019

- **what** — Éditeur de logiciels de gestion : paie, comptabilité, ERP.
- **role** — Full Stack, stage. Seul sur le projet, accompagné d'un tuteur.
- **work** — Un analyseur de thread dumps Java · Récupération des dumps, transformation en JSON, exposition HTTP · Une interface de tri pour rendre lisible ce qui ne l'était pas · Destiné aux collaborateurs qui debuggaient en production
- **stack** — Java, JEE, Angular

## The CV corrections

`EXPERIENCE` in `Cv.tsx` holds six positions. Two need correcting, and the corrections are
additive — no existing bullet is wrong, they are incomplete.

**Both Pictarine positions** gain the cloud work. The current-role entry gains a bullet on
designing and maintaining Cloud Functions, Cloud Scheduler and Cloud Run on GCP, and its
`tags` gain `GCP` and `Python`. The earlier entry's tags gain `Python`.

**The MecaLIFE full-stack position** gains the vehicle-report platform as its first bullet,
demoting the auction platform to what it was: the end of the role. Its `tags` gain `Laravel`
and `React`.

`HARD_SKILLS` gains `GCP` and `Laravel`.

**Three badges are missing, not one.** An earlier revision of this section asserted that
only `Laravel` needed registering. Checking the file rather than trusting the sentence
found that the four cards' stacks need **`PHP`, `JavaScript` and `Laravel`** — every other
label they use is already registered. Left unregistered, each renders as a grey chip with
the first two characters, which is exactly the defect the previous lot's final review
caught for Proxmox and Traefik on the infrastructure slide.

```ts
  PHP: { color: '#777bb4', monogram: 'Ph' },
  Laravel: { color: '#ff2d20', monogram: 'Lv' },
  JavaScript: { color: '#c9a227', monogram: 'JS' },
```

`JavaScript` is a darkened gold rather than the brand's `#f7df1e`: `ProjectSlide` hard-codes
the monogram in white, and white on that yellow is illegible. The darkened value sits at the
same contrast as `Grafana`'s orange, already in the file.

## i18n

| Key | Change | Note |
| --- | --- | --- |
| `p_group_personal` | added | rail group heading — *Persos* / *Personal* |
| `p_group_company` | added | rail group heading — *Pro* / *Professional* |
| `c_what` | added | card label — *L'entreprise* / *The company* |
| `c_work` | added | card label — *Ce que j'y ai fait* / *What I did there* |
| `p_count_l` | kept | still the rail's `aria-label` and `PortfolioPage`'s table heading |
| `sub_projects` | kept | reads correctly for both groups |

The `fr`/`en` parity assertion catches a key added to one file only.

## Testing

**Added**

- `data/deck.test.ts` — `toRailItem` returns a company's `name` and a project's localized
  `title`, for both languages. This is the unit that lets the rail stay shape-agnostic, so
  it is worth testing directly rather than through a render.
- `data/companies.test.ts` — every company fills `place`, `period`, `role`, `what` and a
  non-empty `work` in both languages; ids are unique; `stack` is non-empty and every label
  resolves to a registered badge rather than the grey fallback.
- `data/companies.test.ts` — **no card names a partner.** `Walgreens`, `CVS` and `Fuji` do
  not appear anywhere in the serialized company data, in either language. Elie decided not
  to name them, and a decision that lives only in a spec is one edit away from being
  undone.
- `CompanySlide.test.tsx` — renders `what`, `role` and every `work` line; renders no repo
  or demo button; renders no takeaway block.
- `SlideRail.test.tsx` — two group headings with the right counts, and clicking a company
  thumbnail reports its global index, not its index within its group. The global-index case
  is the one a naive implementation gets wrong.
- `Cv.test.tsx` — the Pictarine cloud bullet renders, and the MecaLIFE vehicle-report
  bullet renders before the auction one.

**Updated**

- `SlideStage.test.tsx` — the counter and arrow navigation span both groups.

**Not covered, deliberately**

- Visual layout of the company slide. It reuses the deck's existing classes; it will be
  looked at in a browser before merge, and the plan says so rather than asserting it.

## Rejected

**A ninth app.** Considered and declined in favour of merging: one window answers "what has
this person built" for both kinds of work, and a second window relies on a visitor finding
it. The merge costs a rail change and a second slide component; a new app costs an `AppKey`,
a desktop icon, a saved icon position, a Start-menu entry, a terminal `open` target, and a
permanent split in the answer.

**A context block inside the CV.** The third option offered. Declined because the CV is
already dense, has no room for a hero, and prints — or rather, would print, if the print
path worked, which it does not.

**A lesson per company card.** The interview surfaced that both internships were tools built
for colleagues rather than products for customers, which is a genuinely good line. It is not
shipped: Elie's framing for these cards was *what the company does and my role*, and adding
a fourth narrative field reopens the format the previous lot spent an entire cycle closing.
Recorded here so it is not lost.

**Naming Walgreens, CVS and Fuji.** Elie's call, asked and answered. The scale statement
replaces them.

## Follow-up lots

Unchanged from the previous spec, minus this one:

1. **Architecture diagrams** — a `deck-arch` section, enlargeable.
2. **A print stylesheet**, or an honest relabelling of the CV's *Imprimer* button.
3. **A real TicoqOS screenshot**, replacing the `À REMPLACER` placeholder on slide 1.
4. **Dropping `accent`** — required by `Project`, rendered by no component, duplicated into
   `make_covers.py`.
5. **An IHDR dimension assertion** for a hand-dropped banner that never passes through
   `save_png`.
