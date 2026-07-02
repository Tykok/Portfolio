# Design — Dynamic Projects via API

**Date:** 2026-07-07
**Status:** Approved (design), pending implementation plan

## Goal

Make the projects page data-driven via an API call instead of a static
imported array. The real backend is not ready, so ship a mock behind a flag
that is trivially swappable for the real endpoint. Keep the API layer
separated and reusable, since more endpoints will follow.

## Current state

`src/data/projects.ts` exports a static `projects: Project[]` plus the types
(`Project`, `StackItem`, `ProjectStatus`). Three components import it and read
it synchronously at render:

- `src/components/apps/Projects/Projects.tsx` — `useState<Project>(projects[0])`, `.map`, `.length`
- `src/components/apps/Web/PortfolioPage.tsx` — `.map`
- `src/components/apps/Terminal/Terminal.tsx` — text/command output

Stack: CRA (react-scripts 5), React 18, TypeScript, plain — no react-query /
swr / MSW. Contexts already exist: `LangContext`, `OSContext`, `WindowContext`.

## Architecture

### File layout

```
src/api/
  client.ts              # generic fetch wrapper (reusable for future endpoints)
  projects.ts            # getProjects(): Promise<Project[]> — client OR mock via flag
  mock/
    projects.mock.ts     # example data (moved from data/projects.ts) + simulated delay
src/context/
  ProjectsContext.tsx    # ProjectsProvider + useProjects() -> { data, loading, error }
src/components/
  ChickenLoader/
    ChickenLoader.tsx     # animated walking-chicken SVG loader (reusable)
    ChickenLoader.scss    # walk-cycle keyframes
src/data/projects.ts     # KEEPS ONLY the types (Project, StackItem, ProjectStatus)
```

Types stay in `data/projects.ts` — the three consumers already import the
`Project` type from there, so no import churn. Only the data array moves to
`api/mock/projects.mock.ts`.

### API client (`api/client.ts`)

Thin `apiFetch<T>(path: string): Promise<T>` wrapper:
- Base URL from `process.env.REACT_APP_API_URL`.
- Sets JSON headers, parses JSON response.
- Throws a typed `ApiError` (status + message) on non-2xx.
- No dependency added — native `fetch`.

Reusable by all future endpoints.

### Projects endpoint (`api/projects.ts`)

```
getProjects(): Promise<Project[]>
```
- If `process.env.REACT_APP_USE_MOCK !== 'false'` (default: **mock ON**, since
  the API is not ready) → return the mock array with a simulated ~400 ms delay.
- Else → `apiFetch<Project[]>('/projects')`.

Switching to the real backend = set `REACT_APP_USE_MOCK=false` +
`REACT_APP_API_URL`. No consumer code changes.

### Context (`context/ProjectsContext.tsx`)

- `ProjectsProvider` fetches once on mount via `getProjects()`, holds
  `{ data: Project[], loading: boolean, error: Error | null }` in state, caches
  for the app lifetime.
- `useProjects()` hook returns that state.
- Mounted near `LangContext` / `OSContext` in the app root (`Main.tsx`).
- One fetch even if all three windows are open.

## Data flow

```
ProjectsProvider (mount)
   -> getProjects()
        -> [mock ON]  mock array + delay
        -> [mock OFF] apiFetch('/projects')
   -> { data, loading, error }
        -> useProjects() in each consumer
```

## Consumer changes

Replace the static `import { projects }` with `useProjects()` in all three.

- **Projects.tsx** — REWORK the `selected` state: it currently seeds from
  `projects[0]`, which is empty during loading. Derive/select the first project
  once `data` arrives (effect or derived state guarded on `data.length`). Show
  the chicken loader in the detail pane while loading; error text via `t()`.
- **PortfolioPage.tsx** — chicken loader in the cards area while loading.
- **Terminal.tsx** — text-based; show a `loading…` line until `data` is ready,
  then render the project list/command output.

## Loading & error UI

- **Loading:** shared `<ChickenLoader />` — an animated **SVG** of a chicken
  walking **in place** (legs alternate, body bobs; no horizontal travel), via
  CSS `@keyframes`. Inline SVG React component, theme-aware, scalable. Reused
  across the three views (a compact text variant is acceptable in Terminal).
- **Error:** translated text via `t()` (e.g. "Erreur de chargement" /
  "Failed to load").

## i18n

Add loading/error string keys to the existing lang files (follow the current
`langs/` structure and the `t()` helper).

## Testing

Follow the existing react-scripts / jest setup.
- `getProjects()` — mock path returns a non-empty array with valid shape.
- `useProjects()` / `ProjectsProvider` — state transitions loading → data.

## Out of scope

- Real backend implementation.
- Caching/refetch/invalidation beyond the single lifetime fetch.
- Pagination, filtering server-side.
