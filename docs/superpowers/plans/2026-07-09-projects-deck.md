# Projects Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Projects app into a PowerPoint-style slide deck — one full-frame, scrollable slide per project, with a thumbnail rail and prev/next + keyboard navigation.

**Architecture:** `Projects.tsx` is the container: it holds `activeIndex` state and reads the `projects[]` source, then renders `SlideRail` (thumbnail navigation) and `SlideStage` (active slide + nav). `SlideStage` renders one `ProjectSlide`. All three sub-components are presentational and prop-driven, so the future API/loader swap in the container is unaffected.

**Tech Stack:** React + TypeScript, CRA (`react-scripts`), Jest + React Testing Library, existing `useLang` i18n context, global `os.css`.

## Global Constraints

- Presentation-only: do NOT change the projects data source contract (API spec `2026-07-07-projects-api-dynamic-design.md` and the chicken loader stay independent).
- New `Project` fields `cover` and `role` are OPTIONAL; existing data must keep working untouched.
- Slide transitions and any motion must honour `@media (prefers-reduced-motion: reduce)`.
- Keyboard nav is scoped to the deck (focused container), never a global `window` listener, so it does not fight other OS apps.
- CSS uses a `.deck-*` namespace; the old `.pj-*` block is removed.
- Tests render components wrapped in `LangProvider` (from `context/LangContext`) because they call `useLang`.

---

### Task 1: Data model + i18n keys

**Files:**
- Modify: `src/data/projects.ts` (add optional fields to `Project`)
- Modify: `src/i18n/types.ts` (add key declarations)
- Modify: `src/i18n/en.ts` (add English values)
- Modify: `src/i18n/fr.ts` (add French values)
- Test: `src/i18n/i18n.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Project.cover?: string`, `Project.role?: LocalizedString`
  - i18n keys `p_role`, `p_prev`, `p_next` present in both `en` and `fr`.

- [ ] **Step 1: Write the failing test**

Create `src/i18n/i18n.test.ts`:

```ts
import en from './en';
import fr from './fr';

describe('deck i18n keys', () => {
  const keys = ['p_role', 'p_prev', 'p_next'] as const;

  it.each(keys)('en defines %s', (k) => {
    expect(typeof en[k]).toBe('string');
    expect((en[k] as string).length).toBeGreaterThan(0);
  });

  it.each(keys)('fr defines %s', (k) => {
    expect(typeof fr[k]).toBe('string');
    expect((fr[k] as string).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/i18n/i18n.test.ts --watchAll=false`
Expected: FAIL — `p_role`/`p_prev`/`p_next` are `undefined` (and TypeScript errors on missing keys).

- [ ] **Step 3: Add the optional Project fields**

In `src/data/projects.ts`, inside the `Project` interface, after `demo: string;` add:

```ts
  cover?: string;
  role?: LocalizedString;
```

`LocalizedString` is already imported at the top of the file.

- [ ] **Step 4: Add i18n type declarations**

In `src/i18n/types.ts`, after `p_links_ph: string;` add:

```ts
  p_role: string;
  p_prev: string;
  p_next: string;
```

- [ ] **Step 5: Add English + French values**

In `src/i18n/en.ts`, on the line with `p_links_ph`, extend it to:

```ts
  p_count_l: 'Projects', p_repo: 'View repo', p_demo: 'Demo', p_links_ph: 'placeholder links',
  p_role: 'Role', p_prev: 'Previous project', p_next: 'Next project',
```

In `src/i18n/fr.ts`, find the matching `p_count_l`/`p_repo`/`p_demo`/`p_links_ph` line and add after it:

```ts
  p_role: 'Rôle', p_prev: 'Projet précédent', p_next: 'Projet suivant',
```

- [ ] **Step 6: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/i18n/i18n.test.ts --watchAll=false`
Expected: PASS (6 assertions).

- [ ] **Step 7: Commit**

```bash
git add src/data/projects.ts src/i18n/types.ts src/i18n/en.ts src/i18n/fr.ts src/i18n/i18n.test.ts
git commit -m "feat(projects): add optional cover/role fields and deck i18n keys"
```

---

### Task 2: ProjectSlide component

**Files:**
- Create: `src/components/apps/Projects/ProjectSlide.tsx`
- Test: `src/components/apps/Projects/ProjectSlide.test.tsx`

**Interfaces:**
- Consumes: `Project` (from Task 1), `useLang`, `getBadge` (`data/techBadges`).
- Produces: `export function ProjectSlide({ project }: { project: Project }): JSX.Element` — renders a `<article className="deck-slide">` containing hero, pitch, highlights, stack+links.

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Projects/ProjectSlide.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Project } from 'data/projects';

import { ProjectSlide } from './ProjectSlide';

const base: Project = {
  id: 'x', emoji: '🚀', monogram: 'XX', accent: '#123456',
  gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
  title: { fr: 'Titre', en: 'Title' }, year: '2024',
  status: { label: { fr: 'En prod', en: 'Live' }, type: 'live' },
  stack: [{ label: 'Go', color: 'blue' }],
  tags: ['Go'],
  desc: { fr: 'Desc FR', en: 'Desc EN' },
  bullets: { fr: ['point un'], en: ['bullet one'] },
  repo: '#', demo: '#',
};

const renderSlide = (p: Project) =>
  render(<LangProvider><ProjectSlide project={p} /></LangProvider>);

it('renders title, desc and bullets (FR default)', () => {
  renderSlide(base);
  expect(screen.getByText('Titre')).toBeInTheDocument();
  expect(screen.getByText('Desc FR')).toBeInTheDocument();
  expect(screen.getByText('point un')).toBeInTheDocument();
});

it('uses gradient hero (no cover) — no img rendered', () => {
  const { container } = renderSlide(base);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.deck-hero')).toBeTruthy();
});

it('renders cover image when present', () => {
  renderSlide({ ...base, cover: '/shot.png' });
  expect(screen.getByRole('img')).toHaveAttribute('src', '/shot.png');
});

it('hides role line when role absent, shows it when present', () => {
  const { rerender } = renderSlide(base);
  expect(screen.queryByText(/Role/i)).toBeNull();
  rerender(
    <LangProvider>
      <ProjectSlide project={{ ...base, role: { fr: 'Lead', en: 'Lead' } }} />
    </LangProvider>,
  );
  expect(screen.getByText('Lead')).toBeInTheDocument();
});

it('shows placeholder text when repo and demo are both "#"', () => {
  renderSlide(base);
  expect(screen.getByText('placeholder links')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/apps/Projects/ProjectSlide.test.tsx --watchAll=false`
Expected: FAIL — `Cannot find module './ProjectSlide'`.

- [ ] **Step 3: Write the component**

Create `src/components/apps/Projects/ProjectSlide.tsx`:

```tsx
import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';
import { getBadge } from 'data/techBadges';

export function ProjectSlide({ project }: { project: Project }) {
  const { lang, t } = useLang();
  const noLinks = project.repo === '#' && project.demo === '#';

  return (
    <article className="deck-slide">
      {/* Hero */}
      <header
        className="deck-hero"
        style={project.cover ? undefined : { background: project.gradient }}
      >
        {project.cover && <img className="deck-hero-img" src={project.cover} alt="" />}
        <div className="deck-hero-body">
          <span className="deck-monogram">{project.emoji || project.monogram}</span>
          <h2 className="deck-title">{project.title[lang]}</h2>
          <div className="deck-meta">
            <span className="deck-year">{project.year}</span>
            <span className={`deck-status ${project.status.type}`}>
              {project.status.label[lang]}
            </span>
          </div>
        </div>
      </header>

      {/* Pitch */}
      <section className="deck-pitch">
        <p className="deck-desc">{project.desc[lang]}</p>
        {project.role && (
          <p className="deck-role">
            <span className="deck-role-l">{String(t('p_role'))}</span>
            {project.role[lang]}
          </p>
        )}
      </section>

      {/* Highlights */}
      <ul className="deck-bul">
        {project.bullets[lang].map((b, i) => (
          <li key={i}>
            <span className="ck">✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* Stack & links */}
      <section className="deck-foot">
        <div className="deck-badges">
          {project.stack.map((s) => {
            const badge = getBadge(s.label);
            return (
              <div key={s.label} className="pj-chip">
                <span
                  className="pj-bdg"
                  style={{ background: badge.color, width: 17, height: 17, borderRadius: 5, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}
                >
                  {badge.monogram}
                </span>
                {s.label}
              </div>
            );
          })}
        </div>
        <div className="deck-acts">
          {project.repo !== '#' && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="pj-btn">
              ↗ {String(t('p_repo'))}
            </a>
          )}
          {project.demo !== '#' && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="pj-btn ghost">
              ▶ {String(t('p_demo'))}
            </a>
          )}
          {noLinks && (
            <span style={{ fontSize: 12, color: 'var(--ink-dim)', fontStyle: 'italic' }}>
              {String(t('p_links_ph'))}
            </span>
          )}
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/apps/Projects/ProjectSlide.test.tsx --watchAll=false`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/Projects/ProjectSlide.tsx src/components/apps/Projects/ProjectSlide.test.tsx
git commit -m "feat(projects): add ProjectSlide component"
```

---

### Task 3: SlideRail component

**Files:**
- Create: `src/components/apps/Projects/SlideRail.tsx`
- Test: `src/components/apps/Projects/SlideRail.test.tsx`

**Interfaces:**
- Consumes: `Project`, `useLang`.
- Produces: `export function SlideRail({ projects, activeIndex, onSelect }: { projects: Project[]; activeIndex: number; onSelect: (i: number) => void }): JSX.Element` — renders `<nav className="deck-rail">` with one `<button className="deck-thumb">` per project; the active one has an extra `on` class.

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Projects/SlideRail.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Project } from 'data/projects';

import { SlideRail } from './SlideRail';

const mk = (id: string, title: string): Project => ({
  id, emoji: '', monogram: id.toUpperCase(), accent: '#000',
  gradient: 'linear-gradient(135deg,#111,#222)',
  title: { fr: title, en: title }, year: '2024',
  status: { label: { fr: 'x', en: 'x' }, type: 'live' },
  stack: [], tags: [], desc: { fr: '', en: '' }, bullets: { fr: [], en: [] },
  repo: '#', demo: '#',
});

const projects = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];

it('renders one thumbnail per project', () => {
  render(
    <LangProvider>
      <SlideRail projects={projects} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  expect(screen.getAllByRole('button')).toHaveLength(3);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
});

it('marks the active thumbnail with the "on" class', () => {
  const { container } = render(
    <LangProvider>
      <SlideRail projects={projects} activeIndex={1} onSelect={() => {}} />
    </LangProvider>,
  );
  const active = container.querySelectorAll('.deck-thumb.on');
  expect(active).toHaveLength(1);
  expect(active[0]).toHaveTextContent('Beta');
});

it('fires onSelect with the index when a thumbnail is clicked', () => {
  const onSelect = jest.fn();
  render(
    <LangProvider>
      <SlideRail projects={projects} activeIndex={0} onSelect={onSelect} />
    </LangProvider>,
  );
  fireEvent.click(screen.getByText('Gamma'));
  expect(onSelect).toHaveBeenCalledWith(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/apps/Projects/SlideRail.test.tsx --watchAll=false`
Expected: FAIL — `Cannot find module './SlideRail'`.

- [ ] **Step 3: Write the component**

Create `src/components/apps/Projects/SlideRail.tsx`:

```tsx
import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';

interface SlideRailProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideRail({ projects, activeIndex, onSelect }: SlideRailProps) {
  const { lang, t } = useLang();

  return (
    <nav className="deck-rail" aria-label={String(t('p_count_l'))}>
      <div className="hd">{String(t('p_count_l'))} ({projects.length})</div>
      {projects.map((p, i) => (
        <button
          key={p.id}
          type="button"
          className={`deck-thumb${i === activeIndex ? ' on' : ''}`}
          onClick={() => onSelect(i)}
        >
          <span className="deck-thumb-n">{i + 1}</span>
          <span
            className="deck-thumb-ico"
            style={p.cover ? { backgroundImage: `url(${p.cover})`, backgroundSize: 'cover' } : { background: p.gradient }}
          >
            {!p.cover && p.monogram}
          </span>
          <span className="deck-thumb-t">{p.title[lang]}</span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/apps/Projects/SlideRail.test.tsx --watchAll=false`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/Projects/SlideRail.tsx src/components/apps/Projects/SlideRail.test.tsx
git commit -m "feat(projects): add SlideRail thumbnail navigation"
```

---

### Task 4: SlideStage component

**Files:**
- Create: `src/components/apps/Projects/SlideStage.tsx`
- Test: `src/components/apps/Projects/SlideStage.test.tsx`

**Interfaces:**
- Consumes: `Project`, `useLang`, `ProjectSlide` (Task 2).
- Produces: `export function SlideStage({ projects, activeIndex, onSelect }: { projects: Project[]; activeIndex: number; onSelect: (i: number) => void }): JSX.Element` — renders the active `ProjectSlide`, prev/next buttons (calling `onSelect(activeIndex ± 1)`, clamped, disabled at ends), a `N / total` counter, and handles `ArrowLeft`/`ArrowRight` on its focusable container.

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Projects/SlideStage.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Project } from 'data/projects';

import { SlideStage } from './SlideStage';

const mk = (id: string, title: string): Project => ({
  id, emoji: '', monogram: id.toUpperCase(), accent: '#000',
  gradient: 'linear-gradient(135deg,#111,#222)',
  title: { fr: title, en: title }, year: '2024',
  status: { label: { fr: 'x', en: 'x' }, type: 'live' },
  stack: [], tags: [], desc: { fr: 'd', en: 'd' }, bullets: { fr: [], en: [] },
  repo: '#', demo: '#',
});

const projects = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];

const renderStage = (activeIndex: number, onSelect = jest.fn()) => {
  const utils = render(
    <LangProvider>
      <SlideStage projects={projects} activeIndex={activeIndex} onSelect={onSelect} />
    </LangProvider>,
  );
  return { ...utils, onSelect };
};

it('renders the active slide and the counter', () => {
  renderStage(1);
  expect(screen.getByText('Beta')).toBeInTheDocument();
  expect(screen.getByText('2 / 3')).toBeInTheDocument();
});

it('next button advances, prev button goes back', () => {
  const { onSelect } = renderStage(1);
  fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
  expect(onSelect).toHaveBeenCalledWith(2);
  fireEvent.click(screen.getByRole('button', { name: 'Previous project' }));
  expect(onSelect).toHaveBeenCalledWith(0);
});

it('prev is disabled on first slide, next disabled on last', () => {
  const { rerender } = render(
    <LangProvider>
      <SlideStage projects={projects} activeIndex={0} onSelect={jest.fn()} />
    </LangProvider>,
  );
  expect(screen.getByRole('button', { name: 'Previous project' })).toBeDisabled();
  rerender(
    <LangProvider>
      <SlideStage projects={projects} activeIndex={2} onSelect={jest.fn()} />
    </LangProvider>,
  );
  expect(screen.getByRole('button', { name: 'Next project' })).toBeDisabled();
});

it('arrow keys navigate', () => {
  const { container, onSelect } = renderStage(1);
  const stage = container.querySelector('.deck-stage') as HTMLElement;
  fireEvent.keyDown(stage, { key: 'ArrowRight' });
  expect(onSelect).toHaveBeenCalledWith(2);
  fireEvent.keyDown(stage, { key: 'ArrowLeft' });
  expect(onSelect).toHaveBeenCalledWith(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/apps/Projects/SlideStage.test.tsx --watchAll=false`
Expected: FAIL — `Cannot find module './SlideStage'`.

- [ ] **Step 3: Write the component**

Create `src/components/apps/Projects/SlideStage.tsx`:

```tsx
import { useEffect, useRef } from 'react';

import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';

import { ProjectSlide } from './ProjectSlide';

interface SlideStageProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideStage({ projects, activeIndex, onSelect }: SlideStageProps) {
  const { t } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = projects.length;
  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= total - 1;

  // Reset scroll to top whenever the active slide changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeIndex]);

  const go = (i: number) => {
    if (i >= 0 && i < total) onSelect(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    else if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  return (
    <div className="deck-stage" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="deck-scroll" ref={scrollRef} key={activeIndex}>
        {projects[activeIndex] && <ProjectSlide project={projects[activeIndex]} />}
      </div>

      <button
        type="button"
        className="deck-nav prev"
        aria-label={String(t('p_prev'))}
        disabled={atStart}
        onClick={() => go(activeIndex - 1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="deck-nav next"
        aria-label={String(t('p_next'))}
        disabled={atEnd}
        onClick={() => go(activeIndex + 1)}
      >
        ›
      </button>

      <div className="deck-counter">{activeIndex + 1} / {total}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/apps/Projects/SlideStage.test.tsx --watchAll=false`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/Projects/SlideStage.tsx src/components/apps/Projects/SlideStage.test.tsx
git commit -m "feat(projects): add SlideStage with nav and keyboard"
```

---

### Task 5: Projects container integration

**Files:**
- Modify: `src/components/apps/Projects/Projects.tsx` (full rewrite)
- Test: `src/components/apps/Projects/Projects.test.tsx` (create)

**Interfaces:**
- Consumes: `projects` (`data/projects`), `SlideRail` (Task 3), `SlideStage` (Task 4).
- Produces: unchanged public export `export function Projects(): JSX.Element` — renders `<div className="deck-B">` containing `SlideRail` + `SlideStage`, owning `activeIndex` state.

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Projects/Projects.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import { projects } from 'data/projects';

import { Projects } from './Projects';

const renderApp = () => render(<LangProvider><Projects /></LangProvider>);

it('shows the first project by default with counter 1 / N', () => {
  renderApp();
  expect(screen.getByText(`1 / ${projects.length}`)).toBeInTheDocument();
  // First project title appears both in rail and stage.
  expect(screen.getAllByText(projects[0].title.fr).length).toBeGreaterThan(0);
});

it('clicking a rail thumbnail switches the active slide', () => {
  renderApp();
  const rail = document.querySelector('.deck-rail') as HTMLElement;
  const thumbs = rail.querySelectorAll('.deck-thumb');
  fireEvent.click(thumbs[1]);
  expect(screen.getByText(`2 / ${projects.length}`)).toBeInTheDocument();
});

it('next button advances the counter', () => {
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
  expect(screen.getByText(`2 / ${projects.length}`)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/apps/Projects/Projects.test.tsx --watchAll=false`
Expected: FAIL — old `Projects` renders `.pj-B` (no `.deck-rail`, no counter), so assertions fail.

- [ ] **Step 3: Rewrite the container**

Replace the entire contents of `src/components/apps/Projects/Projects.tsx` with:

```tsx
import { useState } from 'react';

import { projects } from 'data/projects';

import { SlideRail } from './SlideRail';
import { SlideStage } from './SlideStage';

export function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="deck-B">
      <SlideRail projects={projects} activeIndex={activeIndex} onSelect={setActiveIndex} />
      <SlideStage projects={projects} activeIndex={activeIndex} onSelect={setActiveIndex} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/apps/Projects/Projects.test.tsx --watchAll=false`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/Projects/Projects.tsx src/components/apps/Projects/Projects.test.tsx
git commit -m "feat(projects): wire deck container (rail + stage)"
```

---

### Task 6: Deck styles (.deck-*) + responsive

**Files:**
- Modify: `src/styles/os.css` (replace the `.pj-B`/`.pj-list`/`.pj-detail`/`.pj-row`/`.pj-bul` layout block with `.deck-*`; keep the shared `.pj-ico`, `.pj-bdg`, `.pj-chip`, `.pj-btn`, `.ck` treatments, which the slide reuses)

**Interfaces:**
- Consumes: DOM classes emitted by Tasks 2–5 (`deck-B`, `deck-rail`, `hd`, `deck-thumb`(`.on`), `deck-thumb-n`, `deck-thumb-ico`, `deck-thumb-t`, `deck-stage`, `deck-scroll`, `deck-slide`, `deck-hero`, `deck-hero-img`, `deck-hero-body`, `deck-monogram`, `deck-title`, `deck-meta`, `deck-year`, `deck-status`, `deck-pitch`, `deck-desc`, `deck-role`, `deck-role-l`, `deck-bul`, `deck-foot`, `deck-badges`, `deck-acts`, `deck-nav`(`.prev`/`.next`), `deck-counter`).
- Produces: no code interface; visual layout only. Verified by running the app.

- [ ] **Step 1: Locate the block to replace**

Run: `grep -n "\.pj-B\|\.pj-list\|\.pj-detail\|\.pj-row\|\.pj-bul\|\.pj-nm\|\.pj-stk" src/styles/os.css`
Note the line range of the layout block (around lines 450–479 per the current file). The shared atoms `.pj-ico`, `.pj-bdg`, `.pj-chip`, `.pj-btn`, `.ck` MUST be kept — only the layout classes below are replaced.

- [ ] **Step 2: Replace the `.pj-*` layout block with `.deck-*`**

Remove the layout rules (`.pj-B`, `.pj-list`, `.pj-list .hd`, `.pj-row*`, `.pj-detail*`, `.pj-bul*`, `.pj-nm`, `.pj-stk`, and their responsive `@media` overrides) and add this block in their place:

```css
/* ===== Projects deck ===== */
.deck-B { display: grid; grid-template-columns: 210px 1fr; height: 100%; background: #fff; }

.deck-rail { background: #f5f7fa; border-right: 1px solid #e7ebf2; padding: 9px; overflow: auto; display: flex; flex-direction: column; gap: 4px; }
.deck-rail .hd { font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9aa3b2; padding: 4px 8px 6px; }
.deck-thumb { display: flex; align-items: center; gap: 9px; padding: 8px 9px; border-radius: 10px; cursor: pointer; background: none; border: none; text-align: left; width: 100%; font: inherit; color: inherit; }
.deck-thumb:hover { background: #ecf1f8; }
.deck-thumb.on { background: #fff; box-shadow: 0 1px 3px rgba(20,30,60,.12); }
.deck-thumb-n { flex: 0 0 auto; width: 16px; font-size: 10px; font-weight: 700; color: #9aa3b2; text-align: center; }
.deck-thumb-ico { flex: 0 0 auto; width: 34px; height: 26px; border-radius: 7px; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.deck-thumb-t { font-weight: 600; font-size: 12px; color: #20232a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.deck-stage { position: relative; overflow: hidden; outline: none; }
.deck-scroll { height: 100%; overflow: auto; animation: deck-in .28s ease; }
@keyframes deck-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }

.deck-slide { display: flex; flex-direction: column; }
.deck-hero { position: relative; min-height: 168px; display: flex; align-items: flex-end; padding: 16px 20px; overflow: hidden; }
.deck-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.deck-hero-body { position: relative; z-index: 1; color: #fff; text-shadow: 0 1px 8px rgba(0,0,0,.35); }
.deck-monogram { font-size: 26px; }
.deck-title { font-family: var(--font-title); font-weight: 700; letter-spacing: -.2px; font-size: 22px; margin: 6px 0 4px; }
.deck-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; }
.deck-status { padding: 1px 9px; border-radius: 999px; background: rgba(255,255,255,.22); font-weight: 600; }

.deck-pitch { padding: 16px 20px 4px; }
.deck-desc { font-size: 13.5px; line-height: 1.6; color: #444b57; margin: 0; text-wrap: pretty; }
.deck-role { font-size: 12.5px; color: #3a414d; margin: 10px 0 0; }
.deck-role-l { font-weight: 700; text-transform: uppercase; letter-spacing: .06em; font-size: 10px; color: #9aa3b2; margin-right: 8px; }

.deck-bul { list-style: none; margin: 10px 0; padding: 0 20px; display: flex; flex-direction: column; gap: 7px; }
.deck-bul li { display: flex; gap: 9px; align-items: flex-start; font-size: 12.5px; color: #3a414d; line-height: 1.4; }

.deck-foot { padding: 6px 20px 22px; }
.deck-badges { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
.deck-acts { display: flex; gap: 9px; }

.deck-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 1px solid #d4dcea; background: rgba(255,255,255,.9); color: #2f3742; font-size: 18px; line-height: 1; cursor: pointer; box-shadow: 0 2px 8px rgba(20,30,60,.14); z-index: 2; }
.deck-nav:hover:not(:disabled) { background: #fff; }
.deck-nav:disabled { opacity: .35; cursor: default; }
.deck-nav.prev { left: 12px; }
.deck-nav.next { right: 12px; }
.deck-counter { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; color: #6b7280; background: rgba(255,255,255,.9); border: 1px solid #e7ebf2; border-radius: 999px; padding: 2px 12px; z-index: 2; }

@media (max-width: 560px) {
  .deck-B { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
  .deck-rail { flex-direction: row; overflow-x: auto; overflow-y: hidden; border-right: none; border-bottom: 1px solid #e7ebf2; gap: 8px; }
  .deck-rail .hd { display: none; }
  .deck-thumb { flex: 0 0 auto; }
  .deck-thumb-t { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .deck-scroll { animation: none; }
}
```

Note: the `560px` breakpoint matches the current Projects responsive rule. Confirm the actual value in the file you edit and reuse it verbatim.

- [ ] **Step 3: Verify the build compiles and the suite passes**

Run: `CI=true npx react-scripts test --watchAll=false && npx tsc --noEmit`
Expected: all tests PASS, no TypeScript errors.

- [ ] **Step 4: Visual check**

Run: `npm start`, open the Projects app. Confirm: rail on the left with numbered thumbnails, active highlighted; hero shows gradient (or cover); prev/next arrows work and disable at ends; counter reads `N / total`; keyboard ←/→ navigate when the stage is focused; narrow the window to confirm the rail collapses to a top strip.

- [ ] **Step 5: Commit**

```bash
git add src/styles/os.css
git commit -m "style(projects): deck layout, rail, hero and nav styles"
```

---

## Self-Review Notes

- **Spec coverage:** rail + stage nav (T3/T4), keyboard scoped to stage (T4), four slide sections (T2), optional cover/role (T1/T2), decoupled container source (T5), `.deck-*` namespace + responsive + reduced-motion (T6), i18n keys (T1). All spec sections mapped.
- **Type consistency:** `ProjectSlide({project})`, `SlideRail`/`SlideStage`/`Projects` `onSelect: (i:number)=>void`, `activeIndex:number` — consistent across T2–T5. Class names emitted by T2–T5 all styled in T6.
- **No placeholders:** every code/test step contains full content.
