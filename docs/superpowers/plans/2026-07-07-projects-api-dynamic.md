# Dynamic Projects via API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load the projects list from an API (mocked behind a flag until the real backend is ready) instead of a static import, consumed via a shared context, with an animated walking-chicken SVG loader.

**Architecture:** A reusable `fetch` client (`api/client.ts`) + a projects endpoint (`api/projects.ts`) that returns mock data (with delay) when `REACT_APP_USE_MOCK !== 'false'`, else hits the real API. A `ProjectsProvider` fetches once on mount and exposes `{ data, loading, error }` via `useProjects()`. Three consumers switch from the static import to the hook and render a `<ChickenLoader />` while loading and translated error text on failure.

**Tech Stack:** React 18, TypeScript (strict), CRA / react-scripts 5, Jest + React Testing Library, SCSS. Path alias: `baseUrl: src` (import as `api/...`, `context/...`, etc.). Native `fetch` — no new dependencies.

## Global Constraints

- No new npm dependencies. Use native `fetch` and the already-installed `@testing-library/*` + jest (via `react-scripts test`).
- TypeScript `strict` is on. No `any` in committed code.
- Imports use the `src` baseUrl alias (e.g. `import { getProjects } from 'api/projects'`), matching existing files.
- The `Project`, `StackItem`, `ProjectStatus` types stay exported from `src/data/projects.ts` — the three consumers already import the type from there; do not move the types.
- i18n keys MUST be added in all three files in sync: the key in `src/i18n/types.ts` (interface), `src/i18n/fr.ts`, and `src/i18n/en.ts`. A missing key in any of the three is a TypeScript error.
- Mock is ON by default (real API not ready): the mock path is taken unless `REACT_APP_USE_MOCK === 'false'`.
- Run tests with `CI=true npx react-scripts test <path> --watchAll=false` so they run once and exit.
- Run `npm run lint` before each commit; fix lint errors (eslint config is strict — simple-import-sort orders imports).

---

## File Structure

- Create `src/setupTests.ts` — jest-dom matchers (CRA auto-loads this).
- Create `src/api/client.ts` — `apiFetch<T>()` + `ApiError`.
- Create `src/api/client.test.ts`.
- Create `src/api/mock/projects.mock.ts` — the example data array (moved out of `data/projects.ts`).
- Create `src/api/projects.ts` — `getProjects()` (mock-flag switch).
- Create `src/api/projects.test.ts`.
- Modify `src/data/projects.ts` — keep ONLY the types; remove the data array.
- Create `src/context/ProjectsContext.tsx` — `ProjectsProvider` + `useProjects()`.
- Create `src/context/ProjectsContext.test.tsx`.
- Create `src/components/ChickenLoader/ChickenLoader.tsx` — animated SVG loader.
- Create `src/components/ChickenLoader/ChickenLoader.scss` — walk-cycle keyframes.
- Create `src/components/ChickenLoader/ChickenLoader.test.tsx`.
- Modify `src/i18n/types.ts`, `src/i18n/fr.ts`, `src/i18n/en.ts` — loading/error keys.
- Modify `src/Main.tsx` — wrap tree in `ProjectsProvider`.
- Modify `src/components/apps/Projects/Projects.tsx` — use `useProjects()`, rework `selected`, loader/error.
- Modify `src/components/apps/Web/PortfolioPage.tsx` — use `useProjects()`, loader/error.
- Modify `src/components/apps/Terminal/Terminal.tsx` — use `useProjects()`, loading/error output.

---

### Task 1: Test setup + reusable API client

**Files:**
- Create: `src/setupTests.ts`
- Create: `src/api/client.ts`
- Test: `src/api/client.test.ts`

**Interfaces:**
- Consumes: nothing (uses global `fetch`, `process.env.REACT_APP_API_URL`).
- Produces:
  - `class ApiError extends Error { status: number }`
  - `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` — prepends `process.env.REACT_APP_API_URL ?? ''`, sets `Accept: application/json`, throws `ApiError` on non-2xx, returns parsed JSON as `T`.

- [ ] **Step 1: Create the jest-dom setup file**

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 2: Write the failing test**

Create `src/api/client.test.ts`:

```ts
import { ApiError, apiFetch } from 'api/client';

describe('apiFetch', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed JSON on 200', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 'x' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await apiFetch<Array<{ id: string }>>('/projects');
    expect(data).toEqual([{ id: 'x' }]);
  });

  it('throws ApiError with status on non-2xx', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('nope', { status: 500 }),
    );

    await expect(apiFetch('/projects')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/projects')).rejects.toMatchObject({ status: 500 });
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `CI=true npx react-scripts test src/api/client.test.ts --watchAll=false`
Expected: FAIL — cannot find module `api/client`.

- [ ] **Step 4: Implement the client**

Create `src/api/client.ts`:

```ts
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL = process.env.REACT_APP_API_URL ?? '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${path} failed with ${res.status}`);
  }

  return (await res.json()) as T;
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `CI=true npx react-scripts test src/api/client.test.ts --watchAll=false`
Expected: PASS (2 tests).

- [ ] **Step 6: Lint + commit**

```bash
npm run lint
git add src/setupTests.ts src/api/client.ts src/api/client.test.ts
git commit -m "feat(api): add reusable fetch client with ApiError"
```

---

### Task 2: Move mock data + projects endpoint

**Files:**
- Create: `src/api/mock/projects.mock.ts`
- Create: `src/api/projects.ts`
- Modify: `src/data/projects.ts` (remove the data array, keep types)
- Test: `src/api/projects.test.ts`

**Interfaces:**
- Consumes: `apiFetch` from Task 1; `Project` type from `data/projects`.
- Produces:
  - `mockProjects: Project[]` (from `api/mock/projects.mock.ts`)
  - `getProjects(): Promise<Project[]>` (from `api/projects.ts`)

- [ ] **Step 1: Move the data array into the mock file**

Create `src/api/mock/projects.mock.ts`. Copy the FULL array currently in `src/data/projects.ts` (all 6 projects, verbatim) under the name `mockProjects`:

```ts
import type { Project } from 'data/projects';

export const mockProjects: Project[] = [
  // ⬇️ paste the exact 6 project objects from the current src/data/projects.ts
  //    (payments, events, auth, analytics, infrabot, sdk) unchanged.
];
```

(Implementer: open `src/data/projects.ts`, copy the array literal `[ … ]` that is currently assigned to `export const projects`, and paste it as the value of `mockProjects` above. Do not alter any field.)

- [ ] **Step 2: Slim down `data/projects.ts` to types only**

Edit `src/data/projects.ts` — delete the `export const projects: Project[] = [ … ]` block entirely. The file must end after the `Project` interface. Final content:

```ts
import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export type ProjectStatus = 'live' | 'maintained' | 'archived' | 'in-progress' | 'open-source';

export interface StackItem {
  label: string;
  color: string;
}

export interface Project {
  id: string;
  emoji: string;
  monogram: string;
  accent: string;
  gradient: string;
  title: LocalizedString;
  year: string;
  status: { label: LocalizedString; type: ProjectStatus };
  stack: StackItem[];
  tags: string[];
  desc: LocalizedString;
  bullets: LocalizedStringArray;
  repo: string;
  demo: string;
}
```

- [ ] **Step 3: Write the failing test**

Create `src/api/projects.test.ts`:

```ts
import { getProjects } from 'api/projects';
import { mockProjects } from 'api/mock/projects.mock';

describe('getProjects (mock mode)', () => {
  it('resolves the mock projects array', async () => {
    const data = await getProjects();
    expect(data).toHaveLength(mockProjects.length);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('title.fr');
  });
});
```

(Note: tests run with `REACT_APP_USE_MOCK` unset → mock path is taken by default.)

- [ ] **Step 4: Run the test, verify it fails**

Run: `CI=true npx react-scripts test src/api/projects.test.ts --watchAll=false`
Expected: FAIL — cannot find module `api/projects`.

- [ ] **Step 5: Implement the endpoint**

Create `src/api/projects.ts`:

```ts
import { apiFetch } from 'api/client';
import { mockProjects } from 'api/mock/projects.mock';
import type { Project } from 'data/projects';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';
const MOCK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return mockProjects;
  }

  return apiFetch<Project[]>('/projects');
}
```

- [ ] **Step 6: Run the test, verify it passes**

Run: `CI=true npx react-scripts test src/api/projects.test.ts --watchAll=false`
Expected: PASS.

- [ ] **Step 7: Verify nothing else broke (consumers still import the static array — expected to fail compile is FINE at this point only if not building; do a lint check)**

Run: `npm run lint`
Expected: lint errors ONLY in `Terminal.tsx`, `Projects.tsx`, `PortfolioPage.tsx` about `projects` no longer being exported. That is expected — Tasks 6–8 fix them. Do NOT fix them here. If lint reports errors elsewhere, fix those before committing.

- [ ] **Step 8: Commit**

```bash
git add src/api/mock/projects.mock.ts src/api/projects.ts src/api/projects.test.ts src/data/projects.ts
git commit -m "feat(api): add getProjects endpoint with mock-flag switch"
```

---

### Task 3: Projects context (provider + hook) + wire into Main

**Files:**
- Create: `src/context/ProjectsContext.tsx`
- Test: `src/context/ProjectsContext.test.tsx`
- Modify: `src/Main.tsx`

**Interfaces:**
- Consumes: `getProjects` from Task 2; `Project` type from `data/projects`.
- Produces:
  - `ProjectsProvider({ children }): JSX.Element`
  - `useProjects(): { data: Project[]; loading: boolean; error: Error | null }`

- [ ] **Step 1: Write the failing test**

Create `src/context/ProjectsContext.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';

import { ProjectsProvider, useProjects } from 'context/ProjectsContext';

function Probe() {
  const { data, loading } = useProjects();
  if (loading) return <div>loading</div>;
  return <div>count:{data.length}</div>;
}

describe('ProjectsProvider', () => {
  it('starts loading then exposes fetched projects', async () => {
    render(
      <ProjectsProvider>
        <Probe />
      </ProjectsProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/count:[1-9]/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `CI=true npx react-scripts test src/context/ProjectsContext.test.tsx --watchAll=false`
Expected: FAIL — cannot find module `context/ProjectsContext`.

- [ ] **Step 3: Implement the provider**

Create `src/context/ProjectsContext.tsx`:

```tsx
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { getProjects } from 'api/projects';
import type { Project } from 'data/projects';

interface ProjectsContextValue {
  data: Project[];
  loading: boolean;
  error: Error | null;
}

const ProjectsContext = createContext<ProjectsContextValue>({
  data: [],
  loading: true,
  error: null,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    let active = true;
    getProjects()
      .then((projects) => {
        if (active) setData(projects);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProjectsContext.Provider value={{ data, loading, error }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsContextValue {
  return useContext(ProjectsContext);
}

export default ProjectsProvider;
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `CI=true npx react-scripts test src/context/ProjectsContext.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Wire the provider into `Main.tsx`**

Edit `src/Main.tsx`. Add the import next to the other context imports:

```tsx
import { ProjectsProvider } from 'context/ProjectsContext';
```

Wrap the tree inside `OSProvider` (so the whole desktop can read it). Replace the `Main` function's return with:

```tsx
function Main() {
  return (
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <ProjectsProvider>
            <OS />
          </ProjectsProvider>
        </OSProvider>
      </WindowProvider>
    </LangProvider>
  );
}
```

- [ ] **Step 6: Lint + commit**

```bash
npm run lint
git add src/context/ProjectsContext.tsx src/context/ProjectsContext.test.tsx src/Main.tsx
git commit -m "feat(context): add ProjectsProvider + useProjects hook"
```

---

### Task 4: ChickenLoader (animated SVG walking chicken)

**Files:**
- Create: `src/components/ChickenLoader/ChickenLoader.tsx`
- Create: `src/components/ChickenLoader/ChickenLoader.scss`
- Test: `src/components/ChickenLoader/ChickenLoader.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `ChickenLoader({ label }?: { label?: string }): JSX.Element` — an accessible (`role="img"`) animated SVG. `label` sets `aria-label` (default `'Loading'`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ChickenLoader/ChickenLoader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';

describe('ChickenLoader', () => {
  it('renders an accessible loading image with a custom label', () => {
    render(<ChickenLoader label="Chargement…" />);
    expect(screen.getByRole('img', { name: 'Chargement…' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `CI=true npx react-scripts test src/components/ChickenLoader/ChickenLoader.test.tsx --watchAll=false`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Create the SCSS (walk cycle)**

Create `src/components/ChickenLoader/ChickenLoader.scss`:

```scss
.chicken-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;

  .cl-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .cl-body {
    transform-box: fill-box;
    transform-origin: center;
    animation: cl-bob 0.5s ease-in-out infinite;
  }

  .cl-leg {
    transform-box: fill-box;
    transform-origin: top center;
    animation: cl-step 0.5s ease-in-out infinite;
  }

  .cl-leg--back {
    animation-delay: 0.25s;
  }
}

@keyframes cl-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes cl-step {
  0%,
  100% {
    transform: rotate(20deg);
  }
  50% {
    transform: rotate(-20deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chicken-loader .cl-body,
  .chicken-loader .cl-leg {
    animation: none;
  }
}
```

- [ ] **Step 4: Create the component**

Create `src/components/ChickenLoader/ChickenLoader.tsx`:

```tsx
import './ChickenLoader.scss';

interface Props {
  label?: string;
}

export function ChickenLoader({ label = 'Loading' }: Props) {
  return (
    <div className="chicken-loader" role="img" aria-label={label}>
      <svg className="cl-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        {/* Legs (drawn first so the body overlaps the hips) */}
        <g className="cl-leg cl-leg--back" stroke="#ff9f1c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 78 L48 102" />
          <path d="M41 106 L48 102 L55 106" />
        </g>
        <g className="cl-leg cl-leg--front" stroke="#ff9f1c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M68 78 L72 102" />
          <path d="M65 106 L72 102 L79 106" />
        </g>

        {/* Body + head bob together */}
        <g className="cl-body">
          {/* comb */}
          <path d="M80 26 q4 -8 8 0 q4 -8 8 0 q4 -6 6 2 l-22 4 z" fill="#e23b3b" />
          {/* body */}
          <ellipse cx="56" cy="60" rx="34" ry="26" fill="#f6d365" />
          {/* wing */}
          <path d="M44 56 q16 -8 30 2 q-14 10 -30 -2 z" fill="#f0b429" />
          {/* head */}
          <circle cx="86" cy="40" r="16" fill="#f6d365" />
          {/* beak */}
          <polygon points="100,38 116,43 100,49" fill="#ff9f1c" />
          {/* wattle */}
          <path d="M99 49 q5 6 0 11 q-5 -4 0 -11 z" fill="#e23b3b" />
          {/* eye */}
          <circle cx="90" cy="37" r="2.6" fill="#232323" />
        </g>
      </svg>
    </div>
  );
}

export default ChickenLoader;
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `CI=true npx react-scripts test src/components/ChickenLoader/ChickenLoader.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 6: Lint + commit**

```bash
npm run lint
git add src/components/ChickenLoader/
git commit -m "feat(ui): add animated walking-chicken SVG loader"
```

---

### Task 5: i18n keys for loading + error

**Files:**
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Interfaces:**
- Produces: translation keys `projects_loading` and `projects_error`, usable via `t('projects_loading')` / `t('projects_error')`.

- [ ] **Step 1: Add the keys to the `Translations` interface**

Edit `src/i18n/types.ts`. Inside the `Translations` interface (anywhere before the closing `}`), add:

```ts
  // Projects data-loading
  projects_loading: string;
  projects_error: string;
```

- [ ] **Step 2: Add the French strings**

Edit `src/i18n/fr.ts`. Add before the final `};` of the `fr` object:

```ts
  projects_loading: 'Chargement des projets…',
  projects_error: 'Impossible de charger les projets.',
```

- [ ] **Step 3: Add the English strings**

Edit `src/i18n/en.ts`. Add before the final `};` of the `en` object:

```ts
  projects_loading: 'Loading projects…',
  projects_error: 'Failed to load projects.',
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no NEW errors about `projects_loading` / `projects_error`. (Consumers from Tasks 6–8 may still show `projects` import errors — expected until those tasks run.)

- [ ] **Step 5: Commit**

```bash
git add src/i18n/types.ts src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat(i18n): add projects loading/error strings"
```

---

### Task 6: Projects app consumes the hook

**Files:**
- Modify: `src/components/apps/Projects/Projects.tsx`
- Test: `src/components/apps/Projects/Projects.test.tsx` (create)

**Interfaces:**
- Consumes: `useProjects` (Task 3), `ChickenLoader` (Task 4), `t` from `useLang`, keys from Task 5.

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Projects/Projects.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';

import { LangProvider } from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';

import { Projects } from './Projects';

function renderProjects() {
  return render(
    <LangProvider>
      <ProjectsProvider>
        <Projects />
      </ProjectsProvider>
    </LangProvider>,
  );
}

describe('Projects app', () => {
  it('shows the chicken loader then the project list', async () => {
    renderProjects();

    expect(screen.getByRole('img', { name: /chargement|loading/i })).toBeInTheDocument();

    await waitFor(() => {
      // sidebar count header appears once data is loaded
      expect(screen.getByText(/\(\d+\)/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `CI=true npx react-scripts test src/components/apps/Projects/Projects.test.tsx --watchAll=false`
Expected: FAIL — still references the removed static `projects` import (compile error) / loader not rendered.

- [ ] **Step 3: Update the imports at the top of `Projects.tsx`**

Edit `src/components/apps/Projects/Projects.tsx`. Replace the current top imports:

```tsx
import { useState } from 'react';

import { useLang } from 'context/LangContext';
import type { Project } from 'data/projects';
import { projects } from 'data/projects';
import { getBadge } from 'data/techBadges';
```

with:

```tsx
import { useState } from 'react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';
import { getBadge } from 'data/techBadges';
```

(The `Project` type import is no longer needed — `selected` becomes derived. If any remaining code references the `Project` type, keep `import type { Project } from 'data/projects';`.)

- [ ] **Step 4: Rework the component head to consume the hook and derive `selected`**

Replace the top of the `Projects` function:

```tsx
export function Projects() {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Project>(projects[0]);

  return (
    <div className="pj-B">
```

with:

```tsx
export function Projects() {
  const { lang, t } = useLang();
  const { data: projects, loading, error } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="pj-B pj-state">
        <ChickenLoader label={String(t('projects_loading'))} />
      </div>
    );
  }

  if (error || projects.length === 0) {
    return (
      <div className="pj-B pj-state">
        <p>{String(t('projects_error'))}</p>
      </div>
    );
  }

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  return (
    <div className="pj-B">
```

- [ ] **Step 5: Update the row click handler**

In the sidebar `.map`, change `onClick={() => setSelected(p)}` to `onClick={() => setSelectedId(p.id)}`. Leave everything else (the JSX using `selected`, `projects.length`, `projects.map`) unchanged — the local `projects` const now comes from the hook.

- [ ] **Step 6: Add minimal centering style for the loader/error state**

Append to `src/styles/os.css` (this file already defines the `pj-` classes):

```css
.pj-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 7: Run the test, verify it passes**

Run: `CI=true npx react-scripts test src/components/apps/Projects/Projects.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 8: Lint + commit**

```bash
npm run lint
git add src/components/apps/Projects/Projects.tsx src/components/apps/Projects/Projects.test.tsx src/styles/os.css
git commit -m "feat(projects): load projects via useProjects with chicken loader"
```

---

### Task 7: PortfolioPage consumes the hook

**Files:**
- Modify: `src/components/apps/Web/PortfolioPage.tsx`

**Interfaces:**
- Consumes: `useProjects` (Task 3), `ChickenLoader` (Task 4), keys from Task 5.

- [ ] **Step 1: Update imports**

Edit `src/components/apps/Web/PortfolioPage.tsx`. Replace:

```tsx
import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';
import { identity } from 'data/identity';
import { projects } from 'data/projects';
```

with:

```tsx
import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';
import { useWindowContext } from 'context/WindowContext';
import { identity } from 'data/identity';
```

- [ ] **Step 2: Read the hook in the component body**

Change the top of `PortfolioPage`:

```tsx
export function PortfolioPage({ onNavigate }: Props) {
  const { lang } = useLang();
  const { openApp } = useWindowContext();
```

to:

```tsx
export function PortfolioPage({ onNavigate }: Props) {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const { data: projects, loading, error } = useProjects();
```

- [ ] **Step 3: Render loader/error only inside the projects database block**

Find the projects table block:

```tsx
        <div className="np-db">
          <div className="np-db-head">
            {/* … head cells … */}
          </div>
          {projects.map((p) => (
            {/* … rows … */}
          ))}
        </div>
```

Replace the `{projects.map(...)}` expression (keep `.np-db-head` as-is) so the body swaps by state:

```tsx
          {loading && (
            <div className="np-dbrow np-db-state">
              <ChickenLoader label={String(t('projects_loading'))} />
            </div>
          )}
          {!loading && error && (
            <div className="np-dbrow np-db-state">{String(t('projects_error'))}</div>
          )}
          {!loading && !error && projects.map((p) => (
            <div className="np-dbrow" key={p.id} onClick={() => openApp('projects')} title={lang === 'fr' ? 'Ouvrir Projets' : 'Open Projets'}>
              <span className="np-db-ico">{p.emoji}</span>
              <span className="np-db-name">{p.title[lang]}</span>
              <span className="np-db-tags np-hide-sm">
                {p.stack.slice(0, 2).map((s) => (
                  <span key={s.label} className="np-tag">{s.label}</span>
                ))}
              </span>
              <span className={`np-badge np-st-${p.status.type}`}>
                {p.status.label[lang]}
              </span>
              <span className="np-yr">{p.year}</span>
            </div>
          ))}
```

(Keep the existing row markup identical — only the guard prefix `!loading && !error &&` and the two state rows are new. Note: preserve the original `title` text `'Ouvrir Projets' / 'Open Projects'` exactly as in the file; do not introduce typos.)

- [ ] **Step 4: Add the centering style for the db state row**

Append to `src/styles/os.css`:

```css
.np-db-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
```

- [ ] **Step 5: Manual verification (no unit test — visual block)**

Run: `npm start`, open the Web app → portfolio page. Expect the chicken loader in the projects table for ~400ms, then the rows.
Also run: `npm run lint` — expect no errors in this file.

- [ ] **Step 6: Commit**

```bash
git add src/components/apps/Web/PortfolioPage.tsx src/styles/os.css
git commit -m "feat(web): load portfolio projects via useProjects with chicken loader"
```

---

### Task 8: Terminal consumes the hook

**Files:**
- Modify: `src/components/apps/Terminal/Terminal.tsx`

**Interfaces:**
- Consumes: `useProjects` (Task 3), keys from Task 5.

- [ ] **Step 1: Update the import**

Edit `src/components/apps/Terminal/Terminal.tsx`. Remove:

```tsx
import { projects } from 'data/projects';
```

and read the hook inside the component. Find where the component reads other context (it already uses `useLang`); add next to it:

```tsx
  const { data: projects, loading, error } = useProjects();
```

(Place this alongside the existing `const { lang, t } = useLang();` line inside the Terminal component function.)

- [ ] **Step 2: Guard the `projects` / `ls` command against loading/error**

Find the command block (around the `case 'projects':` / `case 'ls':`):

```tsx
      case 'projects':
      case 'ls':
        push(
          { type: 'output', text: `${projects.length} projets :` },
          ...projects.map((p) => ({
            type: 'output' as const,
            text: `  ${p.emoji}  ${p.title[lang].padEnd(30)} [${p.stack.map((s) => s.label).join(', ')}]`,
          })),
          { type: 'dim', text: String(t('t_open_hint')) },
        );
        break;
```

Replace with:

```tsx
      case 'projects':
      case 'ls':
        if (loading) {
          push({ type: 'dim', text: String(t('projects_loading')) });
        } else if (error || projects.length === 0) {
          push({ type: 'output', text: String(t('projects_error')) });
        } else {
          push(
            { type: 'output', text: `${projects.length} projets :` },
            ...projects.map((p) => ({
              type: 'output' as const,
              text: `  ${p.emoji}  ${p.title[lang].padEnd(30)} [${p.stack.map((s) => s.label).join(', ')}]`,
            })),
            { type: 'dim', text: String(t('t_open_hint')) },
          );
        }
        break;
```

- [ ] **Step 3: Verify types + lint**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm start`, open Terminal, type `projects`. Since the provider fetches at desktop load, data is normally ready → list prints. (If typed within the first ~400ms, the loading line prints instead.)

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/Terminal/Terminal.tsx
git commit -m "feat(terminal): source projects from useProjects hook"
```

---

### Task 9: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: all tests PASS (client, projects endpoint, provider, loader, Projects app).

- [ ] **Step 2: Typecheck + lint the whole project**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke of all three surfaces**

Run: `npm start`. Verify:
- Projects app: chicken loader → list + detail, clicking a row updates the detail pane.
- Web → portfolio: chicken loader in the projects table → rows.
- Terminal: `projects` command lists projects.

- [ ] **Step 5: (Optional) confirm the real-API switch compiles**

Set `REACT_APP_USE_MOCK=false` in the shell and run `npx tsc --noEmit`. No code change should be needed; `getProjects()` will then call `apiFetch('/projects')` at runtime. Unset it again afterward.

---

## Self-Review

**Spec coverage:**
- API layer separated + reusable → Task 1 (`client.ts`) + Task 2 (`projects.ts`). ✓
- Mock behind flag, default ON → Task 2 (`USE_MOCK`). ✓
- Types stay in `data/projects.ts` → Task 2 Step 2. ✓
- Context Provider + cache + `useProjects` → Task 3. ✓
- Wired into app root → Task 3 Step 5. ✓
- Walking-chicken SVG loader → Task 4. ✓
- Error via `t()` → Tasks 5–8. ✓
- Three consumers updated (Projects, PortfolioPage, Terminal) → Tasks 6, 7, 8. ✓
- `selected` rework in Projects → Task 6 Step 4. ✓
- i18n keys → Task 5. ✓
- Tests → Tasks 1–4, 6 + suite in Task 9. ✓

**Placeholder scan:** The only intentional "paste from existing file" is Task 2 Step 1 (moving the verbatim data array) — full code cannot be inlined without duplicating 150 lines that already exist in the repo; explicit copy instruction given. No TBD/TODO elsewhere.

**Type consistency:** `getProjects(): Promise<Project[]>` used identically in Tasks 2–3. `useProjects()` returns `{ data, loading, error }` — destructured as `{ data: projects, loading, error }` consistently in Tasks 6–8. `ChickenLoader` prop `label?: string` used with `String(t(...))` in Tasks 6–7. i18n keys `projects_loading` / `projects_error` identical across Tasks 5–8.
