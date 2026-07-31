# One Company, One Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four employer cards as a second group in the projects deck, and correct the two things the interview found the CV was leaving out.

**Architecture:** A new `Company` type and a static `companies` constant sit beside the existing `Project`. A `DeckEntry` discriminated union wraps both, and a `toRailItem` accessor lets the rail stay ignorant of either shape. `SlideRail` renders two titled groups over global indices, `SlideStage` dispatches on `entry.kind`, and a new `CompanySlide` renders the company body reusing the deck's existing CSS classes.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Vitest 4, Testing Library 16.

**Spec:** `docs/superpowers/specs/2026-07-31-company-cards-design.md`

## Global Constraints

- **French is the source of truth.** Every French string below was validated with Elie. The English is a mirror written in this plan; **Elie must read the English before this branch merges.** The previous lot shipped with the English unreviewed and that is not a precedent to repeat.
- **No partner is named.** Pictarine's partners are large North American chains. Elie was asked and chose not to name them. `Walgreens`, `CVS` and `Fuji` must appear nowhere in the shipped content, and a test asserts it.
- **No banners for company cards.** `Company` has no `cover` field. The hero falls back to the gradient and monogram, which `ProjectSlide` already does and `CompanySlide` will do the same way.
- **No lesson field on company cards.** Company cards carry `what`, `role` and `work`. Nothing else. Adding a fourth narrative field reopens a format the previous lot spent a whole cycle closing.
- **The `AppKey` stays `'projects'`.** Only the displayed title changes. `useIconPositions` persists desktop icon positions in `localStorage` keyed by app; renaming the key would silently reset the desktop of every returning visitor.
- **Adding companies changes no project count.** `p_count_l`, `t_projects_l` and `t_neofetch` all describe the projects loaded through `ProjectsContext`, which stays personal-only. None of them is edited, and the `t_neofetch` guard test keeps holding.
- **Every stack label must resolve to a registered badge.** `getBadge` falls back to grey plus two characters for an unknown name; three labels this lot introduces are unregistered and must be added.
- **Adding an i18n key means adding it to `src/i18n/types.ts`, `fr.ts` and `en.ts`.** Omitting one fails `tsc`, and `i18n.test.ts` asserts fr/en key parity.
- **Prettier:** `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 140`, `arrowParens: 'always'`. `src/styles/*.css` is in `.prettierignore`.
- **All six gates must pass before each commit:** `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run audit`.

## Two corrections to the spec, carried by this plan

1. **The i18n prefix.** The spec proposes `c_what` and `c_work`. `c_*` is already the Contact app's prefix (`c_greet`, `c_auto`, `c_online`, `c_ph`, `c_send`). The keys are **`co_what`** and **`co_work`**.
2. **No new CSS.** The spec's testing section implies styling work. There is none: `CompanySlide` reuses `.deck-hero`, `.deck-monogram`, `.deck-title`, `.deck-meta`, `.deck-pitch`, `.deck-role-l`, `.deck-bul`, `.deck-foot` and `.deck-badges` exactly as `ProjectSlide` uses them. `src/styles/os.css` is not touched by this plan.

## File Structure

**Create**

| File | Responsibility |
| --- | --- |
| `src/data/companies.ts` | The `Company` interface and the four entries. |
| `src/data/companies.test.ts` | Field completeness in both languages, unique ids, badge coverage, and the no-partner-named guard. |
| `src/data/deck.ts` | The `DeckEntry` union and `toRailItem`. One job: let the rail read either shape. |
| `src/data/deck.test.ts` | `toRailItem` for both kinds, both languages. |
| `src/components/apps/Projects/CompanySlide.tsx` | The company body. |
| `src/components/apps/Projects/CompanySlide.test.tsx` | Renders `what`, `role`, `work`; renders no links and no takeaway. |

**Modify**

| File | Change |
| --- | --- |
| `src/data/techBadges.ts` | Add `PHP`, `Laravel`, `JavaScript`. |
| `src/data/index.ts` | Re-export `Company`, `companies`, `DeckEntry`, `toRailItem`. |
| `src/data/apps.ts` | The `projects` entry's `title` and `short` become *Parcours* / *Work*. |
| `src/i18n/{types,fr,en}.ts` | Add `p_group_personal`, `p_group_company`, `co_what`, `co_work`. |
| `src/components/apps/Projects/Projects.tsx` | Build `DeckEntry[]` from the context's projects plus the static companies. |
| `src/components/apps/Projects/SlideRail.tsx` | Two titled groups over global indices. |
| `src/components/apps/Projects/SlideStage.tsx` | Take `DeckEntry[]`; dispatch on `kind`. |
| `src/components/apps/Projects/SlideRail.test.tsx` | Fixture becomes `DeckEntry[]`; group and global-index cases. |
| `src/components/apps/Projects/SlideStage.test.tsx` | Fixture becomes `DeckEntry[]`. |
| `src/components/apps/Cv/Cv.tsx` | Two `EXPERIENCE` entries corrected; `HARD_SKILLS` gains two. |
| `src/components/apps/Cv/Cv.test.tsx` | The new bullets render, in the right order. |

---

### Task 1: The four companies, and the three badges they need

**Files:**

- Create: `src/data/companies.ts`
- Create: `src/data/companies.test.ts`
- Modify: `src/data/techBadges.ts`
- Modify: `src/data/index.ts:4-8`

**Interfaces:**

- Consumes: nothing.
- Produces: `Company` (interface below) and `companies: Company[]` with ids, in order: `pictarine`, `mecalife`, `canope`, `cegid`. Consumed by Tasks 2, 3 and 4.

- [ ] **Step 1: Write the failing tests**

Create `src/data/companies.test.ts`:

```ts
import { companies } from './companies';
import { getBadge, techBadges } from './techBadges';

describe('companies', () => {
  it('lists the four employers, most recent first', () => {
    expect(companies.map((c) => c.id)).toEqual(['pictarine', 'mecalife', 'canope', 'cegid']);
  });

  it('fills every localized field in both languages', () => {
    companies.forEach((c) => {
      (['place', 'period', 'role', 'what'] as const).forEach((key) => {
        expect(c[key].fr.trim()).not.toBe('');
        expect(c[key].en.trim()).not.toBe('');
      });
      expect(c.work.fr.length).toBeGreaterThan(0);
      expect(c.work.fr).toHaveLength(c.work.en.length);
      c.work.fr.forEach((line) => expect(line.trim()).not.toBe(''));
      c.work.en.forEach((line) => expect(line.trim()).not.toBe(''));
    });
  });

  it('gives every company a non-empty name, monogram and gradient', () => {
    companies.forEach((c) => {
      expect(c.name.trim()).not.toBe('');
      expect(c.monogram).toMatch(/^[A-Z]{2}$/);
      expect(c.gradient).toMatch(/^linear-gradient\(/);
    });
  });

  it('resolves every stack label to a registered badge, never the grey fallback', () => {
    companies.forEach((c) => {
      expect(c.stack.length).toBeGreaterThan(0);
      c.stack.forEach((tech) => {
        expect(techBadges).toHaveProperty(tech);
        expect(getBadge(tech).color).not.toBe('#7a8394');
      });
    });
  });

  it('names no partner — Elie chose not to cite them', () => {
    // A decision that lives only in a spec is one edit away from being undone.
    const serialized = JSON.stringify(companies);
    ['Walgreens', 'CVS', 'Fuji', 'Fujifilm'].forEach((partner) => {
      expect(serialized).not.toContain(partner);
    });
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/data/companies.test.ts`
Expected: FAIL — `./companies` does not exist, so the file fails to transform.

- [ ] **Step 3: Add the three missing badges**

In `src/data/techBadges.ts`, add each label to its cluster rather than appending all three at the end. `PHP` goes after `Python` (languages), `Laravel` after `Spring Boot` (frameworks), `JavaScript` after `TypeScript` (languages):

```ts
  JavaScript: { color: '#c9a227', monogram: 'JS' },
```

immediately after the `TypeScript` line;

```ts
  PHP: { color: '#777bb4', monogram: 'Ph' },
```

immediately after the `Python` line; and

```ts
  Laravel: { color: '#ff2d20', monogram: 'Lv' },
```

immediately after the `'Spring Boot'` line.

`JavaScript` is a darkened gold rather than the brand's `#f7df1e`: `ProjectSlide` hard-codes the badge monogram in white, and white on that yellow is illegible. `#c9a227` sits at the same contrast as `Grafana`'s `#f46800`, already in the file.

- [ ] **Step 4: Create the companies file**

Create `src/data/companies.ts`:

```ts
import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface Company {
  id: string;
  monogram: string;
  gradient: string;
  /** Not localized — a company's name is its name. */
  name: string;
  place: LocalizedString;
  period: LocalizedString;
  /** Job title, plus one or two sentences on scope. */
  role: LocalizedString;
  /** What the company does, for a reader who has never heard of it. */
  what: LocalizedString;
  /** The projects and chantiers carried out there. */
  work: LocalizedStringArray;
  stack: string[];
}

export const companies: Company[] = [
  {
    id: 'pictarine',
    monogram: 'PI',
    gradient: 'linear-gradient(135deg,#fb7185,#be123c)',
    name: 'Pictarine',
    place: { fr: 'Toulouse', en: 'Toulouse' },
    period: { fr: 'oct. 2022 → présent', en: 'Oct 2022 → present' },
    what: {
      fr: 'Impression photo en magasin : Pictarine développe les applications par lesquelles les clients commandent leurs tirages, retirés ensuite chez de grandes enseignes nord-américaines.',
      en: 'In-store photo printing: Pictarine builds the apps customers order their prints through, then collect from large North American chains.',
    },
    role: {
      fr: "Backend Engineer. Je conçois, fais évoluer et maintiens l'API, et je porte tout ce qui touche à la base PostgreSQL. Je travaille aussi sur GCP : Cloud Functions, Cloud Scheduler, Cloud Run.",
      en: 'Backend Engineer. I design, grow and maintain the API, and I own everything that touches the PostgreSQL database. I also work on GCP: Cloud Functions, Cloud Scheduler, Cloud Run.',
    },
    work: {
      fr: [
        'Paiement Stripe et gestion de compte client',
        'Services tiers pour le marketing (Klaviyo)',
        'Première version du catalogue produit',
        'Tooling interne en Next.js, adopté par toutes les équipes',
      ],
      en: [
        'Stripe payments and customer account management',
        'Third-party marketing services (Klaviyo)',
        'First version of the product catalogue',
        'Internal tooling in Next.js, adopted by every team',
      ],
    },
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'GCP', 'Next.js', 'Python'],
  },
  {
    id: 'mecalife',
    monogram: 'ML',
    gradient: 'linear-gradient(135deg,#60a5fa,#1d4ed8)',
    name: 'MecaLIFE Group',
    place: { fr: 'Toulouse', en: 'Toulouse' },
    period: { fr: 'mars 2021 → sept. 2022', en: 'Mar 2021 → Sep 2022' },
    what: {
      fr: "Rapports détaillés de véhicules : les équipements et options d'un modèle donné, à partir de sa marque, son année et sa version.",
      en: 'Detailed vehicle reports: the equipment and options of a given model, from its make, year and trim.',
    },
    role: {
      fr: "Full Stack Developer, en alternance puis en poste. Front, back, base de données, et l'administration des serveurs Debian avec leur chaîne de déploiement.",
      en: 'Full Stack Developer, first as an apprentice then on staff. Front, back, database, and the administration of the Debian servers along with their deployment chain.',
    },
    work: {
      fr: [
        'La plateforme de rapports véhicules',
        "Une plateforme de ventes aux enchères en fin d'alternance, avec paiement Stripe et tarification dynamique selon le type de véhicule",
        "Un outil interne d'aide à la conception de rapports",
        'CI/CD, Apache et Docker sur Debian',
      ],
      en: [
        'The vehicle report platform',
        'An auction platform at the end of the apprenticeship, with Stripe payments and pricing that varied by vehicle type',
        'An internal tool to help design reports',
        'CI/CD, Apache and Docker on Debian',
      ],
    },
    stack: ['PHP', 'Laravel', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'canope',
    monogram: 'RC',
    gradient: 'linear-gradient(135deg,#fbbf24,#b45309)',
    name: 'Réseau Canopé',
    place: { fr: 'Saint-Denis, La Réunion', en: 'Saint-Denis, Réunion' },
    period: { fr: 'janv. → févr. 2020', en: 'Jan → Feb 2020' },
    what: {
      fr: "Opérateur public de l'Éducation nationale : ressources pédagogiques, livres scolaires, action culturelle. L'antenne de Saint-Denis couvre La Réunion.",
      en: 'A public body of the French education ministry: teaching resources, school books, cultural programmes. The Saint-Denis branch covers Réunion.',
    },
    role: {
      fr: "Full Stack, stage. Seul sur le projet, accompagné d'un tuteur.",
      en: 'Full Stack, internship. Alone on the project, with a tutor alongside.',
    },
    work: {
      fr: [
        "Un site répertoriant les établissements scolaires de l'île sur une carte interactive",
        'Recueil des besoins, modélisation et création de la base',
        'Recherche avancée, connexion sécurisée et gestion des droits',
        "Objectif : que les équipes voient où des actions ont été menées, pour décider où en mener de nouvelles",
      ],
      en: [
        "A site cataloguing the island's schools on an interactive map",
        'Requirements gathering, modelling and creating the database',
        'Advanced search, secure login and rights management',
        'The point: so the teams could see where activities had already run, and decide where to run new ones',
      ],
    },
    stack: ['PHP', 'MySQL', 'JavaScript'],
  },
  {
    id: 'cegid',
    monogram: 'CG',
    gradient: 'linear-gradient(135deg,#2dd4bf,#0f766e)',
    name: 'Cegid',
    place: { fr: 'Roubaix', en: 'Roubaix' },
    period: { fr: 'juin → juil. 2019', en: 'Jun → Jul 2019' },
    what: {
      fr: 'Éditeur de logiciels de gestion : paie, comptabilité, ERP.',
      en: 'A business software vendor: payroll, accounting, ERP.',
    },
    role: {
      fr: "Full Stack, stage. Seul sur l'outil, accompagné d'un tuteur.",
      en: 'Full Stack, internship. Alone on the tool, with a tutor alongside.',
    },
    work: {
      fr: [
        'Un analyseur de thread dumps Java',
        'Récupération des dumps, transformation en JSON, exposition HTTP',
        "Une interface de tri pour rendre lisible ce qui ne l'était pas",
        'Destiné aux collaborateurs qui debuggaient en production',
      ],
      en: [
        'A Java thread dump analyser',
        'Dump retrieval, transformation to JSON, HTTP exposure',
        'A sorting UI to make readable what was not',
        'Built for the colleagues debugging in production',
      ],
    },
    stack: ['Java', 'JEE', 'Angular'],
  },
];
```

Canopé's and Cegid's `role` differ by one word — *le projet* against *l'outil*. Both were solo two-month internships with a tutor, so the sentences are genuinely near-identical; the variation keeps them from reading as a copy-paste while staying true.

- [ ] **Step 5: Re-export from the data barrel**

In `src/data/index.ts`, add these two lines, keeping the file's alphabetical-by-module order — `companies` sorts before `identity`:

```ts
export type { Company } from './companies';
export { companies } from './companies';
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/data/companies.test.ts`
Expected: PASS, all five.

- [ ] **Step 7: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass. If `format:check` complains, run `npm run format` and re-check.

- [ ] **Step 8: Commit**

```bash
git add src/data/companies.ts src/data/companies.test.ts src/data/techBadges.ts src/data/index.ts
git commit -m "feat(data): the four employers, and the three badges their stacks need"
```

---

### Task 2: The deck entry union

`SlideRail` needs a monogram, a gradient and a label for each thumbnail, whichever kind of entry it is given. This task gives it exactly that and nothing more.

**Files:**

- Create: `src/data/deck.ts`
- Create: `src/data/deck.test.ts`
- Modify: `src/data/index.ts`

**Interfaces:**

- Consumes: `Company` from Task 1.
- Produces:
  - `type DeckEntry = { kind: 'personal'; project: Project } | { kind: 'company'; company: Company }`
  - `function toRailItem(entry: DeckEntry, lang: Lang): { id: string; monogram: string; gradient: string; label: string }`

  Both consumed by Task 4.

- [ ] **Step 1: Write the failing tests**

Create `src/data/deck.test.ts`:

```ts
import type { Company } from './companies';
import type { DeckEntry } from './deck';
import { toRailItem } from './deck';
import type { Project } from './projects';

const project: Project = {
  id: 'p',
  emoji: '🚀',
  monogram: 'PP',
  accent: '#123456',
  gradient: 'linear-gradient(135deg,#111,#222)',
  title: { fr: 'Titre FR', en: 'Title EN' },
  year: '2024',
  status: { label: { fr: 'En prod', en: 'Live' }, type: 'live' },
  stack: ['Go'],
  desc: { fr: 'd', en: 'd' },
  bullets: { fr: ['un'], en: ['one'] },
  repo: '#',
  demo: '#',
};

const company: Company = {
  id: 'c',
  monogram: 'CC',
  gradient: 'linear-gradient(135deg,#333,#444)',
  name: 'Contoso',
  place: { fr: 'Lyon', en: 'Lyon' },
  period: { fr: 'jan. 2020', en: 'Jan 2020' },
  role: { fr: 'Rôle FR', en: 'Role EN' },
  what: { fr: 'Quoi FR', en: 'What EN' },
  work: { fr: ['a'], en: ['a'] },
  stack: ['Go'],
};

describe('toRailItem', () => {
  it('labels a personal entry with its localized title', () => {
    const entry: DeckEntry = { kind: 'personal', project };
    expect(toRailItem(entry, 'fr')).toEqual({
      id: 'p',
      monogram: 'PP',
      gradient: 'linear-gradient(135deg,#111,#222)',
      label: 'Titre FR',
    });
    expect(toRailItem(entry, 'en').label).toBe('Title EN');
  });

  it("labels a company entry with its name, which is the same in both languages", () => {
    const entry: DeckEntry = { kind: 'company', company };
    expect(toRailItem(entry, 'fr')).toEqual({
      id: 'c',
      monogram: 'CC',
      gradient: 'linear-gradient(135deg,#333,#444)',
      label: 'Contoso',
    });
    expect(toRailItem(entry, 'en').label).toBe('Contoso');
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/data/deck.test.ts`
Expected: FAIL — `./deck` does not exist.

- [ ] **Step 3: Create the union**

Create `src/data/deck.ts`:

```ts
import type { Lang } from '../types/lang';

import type { Company } from './companies';
import type { Project } from './projects';

/**
 * One entry in the deck, of either kind.
 *
 * The union wraps rather than intersects: `Project` and `Company` both carry
 * `monogram`, `gradient`, `stack` and `role`, and `role` means different things
 * in each. Intersecting them would let one shape's field quietly satisfy the
 * other's; wrapping makes `kind` the only way in.
 */
export type DeckEntry = { kind: 'personal'; project: Project } | { kind: 'company'; company: Company };

/** Everything the rail needs, and nothing it does not. */
export function toRailItem(
  entry: DeckEntry,
  lang: Lang,
): { id: string; monogram: string; gradient: string; label: string } {
  if (entry.kind === 'company') {
    const { id, monogram, gradient, name } = entry.company;
    return { id, monogram, gradient, label: name };
  }
  const { id, monogram, gradient, title } = entry.project;
  return { id, monogram, gradient, label: title[lang] };
}
```

- [ ] **Step 4: Re-export from the data barrel**

In `src/data/index.ts`, after the `companies` exports added in Task 1:

```ts
export type { DeckEntry } from './deck';
export { toRailItem } from './deck';
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/data/deck.test.ts`
Expected: PASS, both.

- [ ] **Step 6: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/data/deck.ts src/data/deck.test.ts src/data/index.ts
git commit -m "feat(data): a deck entry union, so the rail can read either shape"
```

---

### Task 3: The company slide

**Files:**

- Create: `src/components/apps/Projects/CompanySlide.tsx`
- Create: `src/components/apps/Projects/CompanySlide.test.tsx`
- Modify: `src/i18n/types.ts` (the `// Projects app` block)
- Modify: `src/i18n/fr.ts`, `src/i18n/en.ts`

**Interfaces:**

- Consumes: `Company` from Task 1.
- Produces: `CompanySlide({ company }: { company: Company })`, consumed by Task 4. i18n keys `co_what` and `co_work`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/apps/Projects/CompanySlide.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Company } from 'data/companies';

import { CompanySlide } from './CompanySlide';

const company: Company = {
  id: 'c',
  monogram: 'CC',
  gradient: 'linear-gradient(135deg,#333,#444)',
  name: 'Contoso',
  place: { fr: 'Lyon', en: 'Lyon' },
  period: { fr: 'jan. 2020 → mars 2021', en: 'Jan 2020 → Mar 2021' },
  role: { fr: 'Backend Engineer. Je porte la base.', en: 'Backend Engineer. I own the database.' },
  what: { fr: "Ce que fait l'entreprise.", en: 'What the company does.' },
  work: { fr: ['Chantier un', 'Chantier deux'], en: ['Piece one', 'Piece two'] },
  stack: ['Go', 'Docker'],
};

const renderSlide = (c: Company = company) =>
  render(
    <LangProvider>
      <CompanySlide company={c} />
    </LangProvider>,
  );

it('renders the name, place and period in the hero', () => {
  renderSlide();
  expect(screen.getByText('Contoso')).toBeInTheDocument();
  expect(screen.getByText('Lyon')).toBeInTheDocument();
  expect(screen.getByText('jan. 2020 → mars 2021')).toBeInTheDocument();
});

it('renders what the company does, and the role', () => {
  renderSlide();
  expect(screen.getByText("Ce que fait l'entreprise.")).toBeInTheDocument();
  expect(screen.getByText('Backend Engineer. Je porte la base.')).toBeInTheDocument();
});

it('renders every work line', () => {
  const { container } = renderSlide();
  expect(container.querySelectorAll('.deck-bul li')).toHaveLength(2);
  expect(screen.getByText('Chantier un')).toBeInTheDocument();
  expect(screen.getByText('Chantier deux')).toBeInTheDocument();
});

it('renders a badge per stack entry', () => {
  const { container } = renderSlide();
  expect(container.querySelectorAll('.pj-chip')).toHaveLength(2);
});

it('offers no repo or demo button — employer code is not public', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-acts')).toBeNull();
  expect(container.querySelectorAll('a')).toHaveLength(0);
});

it('shows no takeaway block — company cards carry no lesson', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-takeaway')).toBeNull();
});

it('uses the gradient hero and renders no image', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-hero')).toBeTruthy();
  expect(container.querySelector('img')).toBeNull();
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/components/apps/Projects/CompanySlide.test.tsx`
Expected: FAIL — `./CompanySlide` does not exist.

- [ ] **Step 3: Add the two i18n keys to all three files**

In `src/i18n/types.ts`, in the `// Projects app` block, after `p_takeaway: string;`:

```ts
  co_what: string;
  co_work: string;
```

In `src/i18n/fr.ts`, after the `p_takeaway` line:

```ts
  co_what: "L'entreprise",
  co_work: "Ce que j'y ai fait",
```

In `src/i18n/en.ts`, after the `p_takeaway` line:

```ts
  co_what: 'The company',
  co_work: 'What I did there',
```

The prefix is `co_`, not `c_`: `c_*` already belongs to the Contact app (`c_greet`, `c_auto`, `c_online`, `c_ph`, `c_send`).

- [ ] **Step 4: Create the component**

Create `src/components/apps/Projects/CompanySlide.tsx`:

```tsx
import { useLang } from 'context/LangContext';
import type { Company } from 'data/companies';
import { getBadge } from 'data/techBadges';

/**
 * One employer, as a deck slide.
 *
 * Deliberately not a `ProjectSlide` with fields blanked out: a company has no
 * repository, no demo and no lesson, and the hero shows a period where a
 * project shows a year and a status. Every class here is one `ProjectSlide`
 * already uses, so the two stay visually identical without sharing code that
 * would have to branch on kind.
 */
export function CompanySlide({ company }: { company: Company }) {
  const { lang, t } = useLang();

  return (
    <article className="deck-slide">
      <header className="deck-hero" style={{ background: company.gradient }}>
        <div className="deck-hero-body">
          <span className="deck-monogram">{company.monogram}</span>
          <h2 className="deck-title">{company.name}</h2>
          <div className="deck-meta">
            <span className="deck-year">{company.period[lang]}</span>
            <span className="deck-status maintained">{company.place[lang]}</span>
          </div>
        </div>
      </header>

      <section className="deck-pitch">
        <p className="deck-desc">
          <span className="deck-role-l">{t('co_what')}</span>
          {company.what[lang]}
        </p>
        <p className="deck-role">
          <span className="deck-role-l">{t('p_role')}</span>
          {company.role[lang]}
        </p>
      </section>

      <span className="deck-takeaway-l" style={{ margin: '0 20px 6px' }}>
        {t('co_work')}
      </span>
      <ul className="deck-bul">
        {company.work[lang].map((line) => (
          <li key={line}>
            <span className="ck">✓</span>
            {line}
          </li>
        ))}
      </ul>

      <section className="deck-foot">
        <div className="deck-badges">
          {company.stack.map((tech) => {
            const badge = getBadge(tech);
            return (
              <div key={tech} className="pj-chip">
                <span
                  className="pj-bdg"
                  style={{
                    background: badge.color,
                    width: 17,
                    height: 17,
                    borderRadius: 5,
                    fontSize: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {badge.monogram}
                </span>
                {tech}
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
```

`deck-status maintained` reuses the status pill's styling to carry the place; `maintained` is one of the existing `ProjectStatus` class names and is chosen only for its neutral colour.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/components/apps/Projects/CompanySlide.test.tsx src/i18n/i18n.test.ts`
Expected: PASS, all seven plus the locale parity check.

- [ ] **Step 6: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/apps/Projects/CompanySlide.tsx src/components/apps/Projects/CompanySlide.test.tsx src/i18n
git commit -m "feat(projects): a slide for an employer, not a project with blanks"
```

---

### Task 4: Wire the two groups into the deck

**Files:**

- Modify: `src/components/apps/Projects/Projects.tsx:10-39`
- Modify: `src/components/apps/Projects/SlideRail.tsx` (whole file)
- Modify: `src/components/apps/Projects/SlideStage.tsx:2-31`
- Modify: `src/components/apps/Projects/SlideRail.test.tsx` (fixture and cases)
- Modify: `src/components/apps/Projects/SlideStage.test.tsx:5-36`
- Modify: `src/i18n/types.ts`, `src/i18n/fr.ts`, `src/i18n/en.ts`
- Modify: `src/data/apps.ts:25-26`

**Interfaces:**

- Consumes: `companies` (Task 1), `DeckEntry` and `toRailItem` (Task 2), `CompanySlide` (Task 3).
- Produces: nothing later tasks rely on.

- [ ] **Step 1: Write the failing tests**

Replace the fixture block at the top of `src/components/apps/Projects/SlideRail.test.tsx` (lines 9-26) with:

```tsx
const mkProject = (id: string, title: string): DeckEntry => ({
  kind: 'personal',
  project: {
    id,
    emoji: '',
    monogram: id.toUpperCase(),
    accent: '#000',
    gradient: 'linear-gradient(135deg,#111,#222)',
    title: { fr: title, en: title },
    year: '2024',
    status: { label: { fr: 'x', en: 'x' }, type: 'live' },
    stack: [],
    desc: { fr: '', en: '' },
    bullets: { fr: [], en: [] },
    repo: '#',
    demo: '#',
  },
});

const mkCompany = (id: string, name: string): DeckEntry => ({
  kind: 'company',
  company: {
    id,
    monogram: id.toUpperCase().slice(0, 2),
    gradient: 'linear-gradient(135deg,#333,#444)',
    name,
    place: { fr: 'Lyon', en: 'Lyon' },
    period: { fr: 'jan. 2020', en: 'Jan 2020' },
    role: { fr: 'r', en: 'r' },
    what: { fr: 'w', en: 'w' },
    work: { fr: ['a'], en: ['a'] },
    stack: [],
  },
});

const entries = [mkProject('a', 'Alpha'), mkProject('b', 'Beta'), mkCompany('cx', 'Contoso')];
```

and add the import `import type { DeckEntry } from 'data/deck';` alongside the existing `data/` import. Then replace every `projects={projects}` in that file with `entries={entries}`, and append these two cases:

```tsx
it('heads each group with its own count', () => {
  const { container } = render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  const heads = Array.from(container.querySelectorAll('.deck-rail .hd')).map((h) => h.textContent);
  expect(heads).toHaveLength(2);
  expect(heads[0]).toContain('2');
  expect(heads[1]).toContain('1');
});

it('reports a global index when a company thumbnail is clicked, not its index within its group', () => {
  // The company is 3rd overall and 1st among companies. A naive grouped
  // implementation reports 0 here, which silently opens the wrong slide.
  const onSelect = vi.fn();
  render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={onSelect} />
    </LangProvider>,
  );
  fireEvent.click(screen.getByText('Contoso'));
  expect(onSelect).toHaveBeenCalledWith(2);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/components/apps/Projects/SlideRail.test.tsx`
Expected: FAIL — `SlideRail` has no `entries` prop, so Vitest reports type errors, and there are no `.hd` group headings.

- [ ] **Step 3: Add the two group-heading keys to all three i18n files**

In `src/i18n/types.ts`, in the `// Projects app` block, after `co_work: string;`:

```ts
  p_group_personal: string;
  p_group_company: string;
```

In `src/i18n/fr.ts`, after the `co_work` line:

```ts
  p_group_personal: 'Persos',
  p_group_company: 'Pro',
```

In `src/i18n/en.ts`, after the `co_work` line:

```ts
  p_group_personal: 'Personal',
  p_group_company: 'Professional',
```

- [ ] **Step 4: Rewrite the rail**

Replace the whole body of `src/components/apps/Projects/SlideRail.tsx`:

```tsx
import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';
import { toRailItem } from 'data/deck';

interface SlideRailProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideRail({ entries, activeIndex, onSelect }: SlideRailProps) {
  const { lang, t } = useLang();

  /* Indices are global across both groups: the stage's counter and its arrow
     keys run over the whole list, so a thumbnail must report where it sits in
     that list, not where it sits in its group. */
  const numbered = entries.map((entry, index) => ({ entry, index }));
  const groups = [
    { key: 'personal', label: t('p_group_personal'), items: numbered.filter(({ entry }) => entry.kind === 'personal') },
    { key: 'company', label: t('p_group_company'), items: numbered.filter(({ entry }) => entry.kind === 'company') },
  ].filter((group) => group.items.length > 0);

  return (
    <nav className="deck-rail" aria-label={t('p_count_l')}>
      {groups.map((group) => (
        <div key={group.key}>
          <div className="hd">
            {group.label} ({group.items.length})
          </div>
          {group.items.map(({ entry, index }) => {
            const item = toRailItem(entry, lang);
            return (
              <button
                key={item.id}
                type="button"
                className={`deck-thumb${index === activeIndex ? ' on' : ''}`}
                onClick={() => onSelect(index)}
                aria-label={item.label}
              >
                <span className="deck-thumb-n">{index + 1}</span>
                <span className="deck-thumb-ico" style={{ background: item.gradient }}>
                  {item.monogram}
                </span>
                <span className="deck-thumb-t">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
```

A group with no items is dropped, so a deck of only personal projects renders exactly one heading rather than an empty *Pro (0)*.

- [ ] **Step 5: Dispatch in the stage**

In `src/components/apps/Projects/SlideStage.tsx`, replace the import of `Project` and the props interface, and the slide render. The file becomes:

```tsx
import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { CompanySlide } from './CompanySlide';
import { ProjectSlide } from './ProjectSlide';

interface SlideStageProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideStage({ entries, activeIndex, onSelect }: SlideStageProps) {
  const { t } = useLang();
  const total = entries.length;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= total - 1;
  const active = entries[activeIndex];

  const go = (i: number) => {
    if (i >= 0 && i < total) onSelect(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    else if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  return (
    <div className="deck-stage" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="deck-scroll" key={activeIndex}>
        {active?.kind === 'personal' && <ProjectSlide project={active.project} />}
        {active?.kind === 'company' && <CompanySlide company={active.company} />}
      </div>

      <button type="button" className="deck-nav prev" aria-label={t('p_prev')} disabled={atStart} onClick={() => go(activeIndex - 1)}>
        ‹
      </button>
      <button type="button" className="deck-nav next" aria-label={t('p_next')} disabled={atEnd} onClick={() => go(activeIndex + 1)}>
        ›
      </button>

      <div className="deck-counter">
        {activeIndex + 1} / {total}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Build the entry list**

In `src/components/apps/Projects/Projects.tsx`, replace lines 31-38 (from `const safeIndex` to the closing `);`):

```tsx
  const entries: DeckEntry[] = [
    ...projects.map((project) => ({ kind: 'personal' as const, project })),
    ...companies.map((company) => ({ kind: 'company' as const, company })),
  ];
  const safeIndex = Math.min(activeIndex, entries.length - 1);

  return (
    <div className="deck-B">
      <SlideRail entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
      <SlideStage entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
    </div>
  );
```

and add these imports beside the existing `context/` ones, in the order `simple-import-sort` wants (`data/` sorts after `context/`):

```tsx
import { companies } from 'data/companies';
import type { DeckEntry } from 'data/deck';
```

The early return for `projects.length === 0` above is left as it is: with no projects loaded the deck has nothing personal to show, and showing four employer cards under a *Pro* heading alone would misrepresent a loading failure as a design.

- [ ] **Step 7: Update the stage's fixture**

In `src/components/apps/Projects/SlideStage.test.tsx`, replace the `mk` helper and the `projects` constant (lines 5-25) with:

```tsx
import type { DeckEntry } from 'data/deck';

import { SlideStage } from './SlideStage';

const mk = (id: string, title: string): DeckEntry => ({
  kind: 'personal',
  project: {
    id,
    emoji: '',
    monogram: id.toUpperCase(),
    accent: '#000',
    gradient: 'linear-gradient(135deg,#111,#222)',
    title: { fr: title, en: title },
    year: '2024',
    status: { label: { fr: 'x', en: 'x' }, type: 'live' },
    stack: [],
    desc: { fr: 'd', en: 'd' },
    bullets: { fr: [], en: [] },
    repo: '#',
    demo: '#',
  },
});

const entries = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];
```

removing the now-unused `import type { Project } from 'data/projects';`, and replace every `projects={projects}` in the file with `entries={entries}`.

- [ ] **Step 8: Rename the window**

In `src/data/apps.ts`, replace lines 25-26 of the `projects` entry:

```ts
    title: { fr: 'Parcours', en: 'Work' },
    short: { fr: 'Parcours', en: 'Work' },
```

The `key` stays `'projects'`. `useIconPositions` persists desktop icon positions in `localStorage` keyed by app, so renaming the key would reset the desktop of every returning visitor.

- [ ] **Step 9: Run the tests**

Run: `npx vitest run src/components/apps/Projects src/i18n/i18n.test.ts`
Expected: PASS, including the two new rail cases.

- [ ] **Step 10: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 11: See it in the real app**

Run `npm run dev`, open the window now labelled **Parcours**, and confirm:

- the rail shows *Persos (8)* then *Pro (4)*, numbered 1 to 12 continuously
- clicking each of the four company thumbnails opens that company, not a neighbour
- the arrow keys walk from project 8 into Pictarine without touching the rail
- the counter reads `9 / 12` on Pictarine
- a company slide shows no repo or demo button, and every stack badge is coloured — no grey chips
- switch to English and step through the four companies: nothing is left in French

- [ ] **Step 12: Commit**

```bash
git add src/components/apps/Projects src/data/apps.ts src/i18n
git commit -m "feat(projects): two groups in one deck, and the window becomes Parcours"
```

---

### Task 5: The CV corrections

Two `EXPERIENCE` entries understate real experience. The corrections are additive: no existing bullet is wrong, they are incomplete.

**Files:**

- Modify: `src/components/apps/Cv/Cv.tsx` (the first `EXPERIENCE` entry, the third, and `HARD_SKILLS`)
- Modify: `src/components/apps/Cv/Cv.test.tsx`

**Interfaces:**

- Consumes: the `Laravel` badge from Task 1 — `HARD_SKILLS` renders through `getBadge`, so an unregistered label would show grey.
- Produces: nothing.

- [ ] **Step 1: Write the failing tests**

Append to `describe('Cv app', …)` in `src/components/apps/Cv/Cv.test.tsx`:

```tsx
  it('states the GCP work, which the CV was omitting entirely', () => {
    renderCv();
    expect(screen.getByText(/Cloud Functions, Cloud Scheduler et Cloud Run/)).toBeInTheDocument();
  });

  it('names the MecaLIFE vehicle-report platform before the auction one', () => {
    const { container } = renderCv();
    const text = container.textContent ?? '';
    const reports = text.indexOf('rapports détaillés de véhicules');
    const auction = text.indexOf('ventes aux enchères');
    expect(reports).toBeGreaterThan(-1);
    expect(auction).toBeGreaterThan(-1);
    expect(reports).toBeLessThan(auction);
  });

  it('lists PHP, Laravel and GCP among the hard skills', () => {
    // Scoped to .cv2-skill on purpose: these labels also appear as per-role
    // .cv2-tag chips, so an unscoped getByText would match several nodes and
    // Testing Library throws on that.
    const { container } = renderCv();
    const skills = Array.from(container.querySelectorAll('.cv2-skill')).map((s) => s.textContent ?? '');
    ['PHP', 'Laravel', 'GCP'].forEach((tech) => {
      expect(skills.some((label) => label.includes(tech))).toBe(true);
    });
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/components/apps/Cv/Cv.test.tsx`
Expected: FAIL on all three — no GCP bullet, no vehicle-report bullet, and neither skill in the list.

- [ ] **Step 3: Correct the current Pictarine entry**

In `src/components/apps/Cv/Cv.tsx`, in the **first** `EXPERIENCE` entry (`when: 'oct. 2024 – présent'`), insert this bullet into `bullets.fr` immediately after the `'APIs backend en Kotlin / Spring Boot, données sur PostgreSQL'` line:

```ts
        'Services serverless sur GCP : Cloud Functions, Cloud Scheduler et Cloud Run',
```

and into `bullets.en`, after `'Backend APIs in Kotlin / Spring Boot, data on PostgreSQL'`:

```ts
        'Serverless services on GCP: Cloud Functions, Cloud Scheduler and Cloud Run',
```

Then replace that entry's `tags` line:

```ts
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'GCP', 'Stripe', 'Docker', 'Python'],
```

- [ ] **Step 4: Correct the earlier Pictarine entry's tags**

Still in `Cv.tsx`, in the **second** `EXPERIENCE` entry (`when: 'oct. 2022 – oct. 2024'`), replace its `tags` line:

```ts
    tags: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Next.js', 'TypeScript', 'Python'],
```

- [ ] **Step 5: Correct the MecaLIFE full-stack entry**

In the **third** `EXPERIENCE` entry (`org: 'MecaLIFE Group · Toulouse'`, `when: 'sept. 2021 – sept. 2022'`), replace the first bullet of each language. `bullets.fr`'s first line becomes two:

```ts
        'Plateforme de rapports détaillés de véhicules : équipements et options par marque, année et version',
        'Plateforme de ventes aux enchères en fin de poste, et outils internes : APIs REST, modélisation de bases de données',
```

and `bullets.en`'s first line likewise:

```ts
        'Platform for detailed vehicle reports: equipment and options by make, year and trim',
        'An auction platform at the end of the role, plus internal tools: REST APIs, database modeling',
```

Then replace that entry's `tags` line:

```ts
    tags: ['PHP', 'Laravel', 'React', 'PostgreSQL', 'Stripe', 'Python', 'Bash'],
```

`TypeScript` leaves these tags. What Elie named at MecaLIFE was *PHP Laravel, Angular (legacy), MySQL then PostgreSQL, Node/Express, React, on Debian with Apache and Docker* — TypeScript was not among them, and the tag was there without a source.

- [ ] **Step 6: Extend the hard skills**

In `src/components/apps/Cv/Cv.tsx`, replace the whole `HARD_SKILLS` array. `Laravel` joins the frameworks, `PHP` the languages, and `GCP` the infrastructure, so the list keeps its rough grouping:

```ts
const HARD_SKILLS = [
  'Kotlin',
  'Spring Boot',
  'Java',
  'TypeScript',
  'Next.js',
  'PHP',
  'Laravel',
  'PostgreSQL',
  'MySQL',
  'Docker',
  'GCP',
  'Stripe',
  'Python',
  'Bash',
  'Git',
  'Linux',
];
```

`PHP` is added alongside `Laravel`: it is in three of the four companies' stacks and was absent from the skills list, which is the same omission as `GCP`.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/components/apps/Cv/Cv.test.tsx`
Expected: PASS, all three new cases plus the existing ones.

- [ ] **Step 8: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/apps/Cv
git commit -m "fix(cv): state the GCP work, and name MecaLIFE's main product"
```

---

## Verification

After Task 5, from a clean checkout of the branch:

```bash
npm ci
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit
```

Expected: all six pass.

Then by hand, because no test covers it: open the deck in a browser and look at a company slide. The layout reuses `ProjectSlide`'s classes, so the risk is not that a class is missing but that the reused status pill carrying the place, and the work-list label sitting outside `.deck-pitch`, look wrong together. That is a judgement no assertion makes.

## Out of scope

Carried by later specs, unchanged from the spec's follow-up list:

1. **Architecture diagrams** — a `deck-arch` section, enlargeable.
2. **A print stylesheet**, or an honest relabelling of the CV's *Imprimer* button.
3. **A real TicoqOS screenshot**, replacing the `À REMPLACER` placeholder on slide 1.
4. **Dropping `accent`** — required by `Project`, rendered by no component, duplicated into `make_covers.py`.
5. **An IHDR dimension assertion** for a hand-dropped banner that never passes through `save_png`.
