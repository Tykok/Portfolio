# Projects Deck — Design

**Date:** 2026-07-09
**Status:** Approved
**Scope:** Redesign the Projects app of TicoqOS into a PowerPoint-style slide deck.

## Goal

Replace the current flat two-pane master/detail Projects view with a presentation
deck: each project is a full-frame, vertically-scrollable slide. This reframes the
page as *presenting* the work (fits the OS metaphor — a native "presentation" app)
and gives the portfolio more personality.

## Non-goals

- Not changing the projects data source contract. The dynamic-projects-via-API work
  (spec `2026-07-07-projects-api-dynamic-design.md`) and the chicken loader are
  independent; this redesign is presentation-only and must not disturb them.
- No mandatory screenshots. Covers are optional; gradients remain the default hero.
- No new routing or window-manager changes.

## Concept

A deck rendered inside the Projects window:

```
┌──────┬─────────────────────────────┐
│ rail │   STAGE (active slide)      │
│ [1]● │   ↑ vertical scroll          │
│ [2]  │                              │
│ [3]  │   ‹ prev        next ›       │
│ ...  │            3 / 6             │
└──────┴─────────────────────────────┘
```

## Layout

### Slide rail (`SlideRail`)
- Left column. Numbered thumbnails, one per project.
- Thumbnail = mini gradient (or cover if present) + monogram + short title.
- Active slide highlighted. Click a thumbnail → jump to that slide.
- **Responsive:** below the existing breakpoint the rail becomes a horizontal
  scrolling strip pinned to the top, reusing the current `.pj-list` responsive
  behaviour (row layout, hide labels/`hd`).

### Slide stage (`SlideStage`)
- Shows exactly one slide at a time, full frame.
- Floating prev/next buttons on the left/right edges. Disabled at ends (no wrap).
- Slide counter `N / total`.
- Keyboard: `←` previous, `→` next. Only when the deck (or a child) has focus so it
  does not fight other apps. `Home`/`End` optional — jump first/last.
- Slide transition: subtle fade + horizontal slide. Must honour
  `@media (prefers-reduced-motion: reduce)` (no transform/opacity animation).
- The stage owns the vertical scroll container so each slide scrolls independently
  and resets to top on slide change.

### Project slide (`ProjectSlide`)
Vertical scroll, four sections in order:

1. **Hero** — full-bleed. `cover` image if the project has one, otherwise the
   `gradient` with a large `monogram`/`emoji`. Overlaid: title, `year`, and a status
   pill (`status.label`, styled by `status.type`).
2. **Pitch** — `desc` for the current language, plus a role line (`role` if present;
   hidden otherwise).
3. **Highlights** — `bullets` for the current language, each with a check icon
   (reuse current `.ck` treatment).
4. **Stack & links** — tech badges (existing `getBadge` + `.pj-chip` treatment) and
   repo/demo buttons. Keep the current placeholder behaviour when `repo`/`demo` are
   `'#'`.

## Data model changes

Add two **optional** fields to `Project` (`src/data/projects.ts`):

```ts
export interface Project {
  // ...existing fields unchanged...
  cover?: string;        // image URL/path for the hero; falls back to gradient
  role?: LocalizedString; // role on the project; pitch line hidden if absent
}
```

- Existing entries in `data/projects.ts` and `mock/projects.mock.ts` need no change
  (fields optional). Optionally populate `role` on a few entries for demonstration.
- Everything degrades gracefully: no `cover` → gradient hero; no `role` → no role line.

## Decoupling / state

- `Projects.tsx` stays the container: reads the `projects[]` source (static today,
  API tomorrow), owns `activeIndex` state, renders `SlideRail` + `SlideStage`.
- `SlideRail`, `SlideStage`, `ProjectSlide` are presentational, driven by props
  (`projects`, `activeIndex`, `onSelect`). Each has one purpose and is testable in
  isolation.
- The source-swap seam (API + chicken loader) sits above this in `Projects.tsx`, so
  the deck is unaffected by how projects are fetched.

## Styling

- Replace the `.pj-*` block in `src/styles/os.css` with a `.deck-*` namespace
  (`.deck-B`, `.deck-rail`, `.deck-stage`, `.deck-slide`, `.deck-nav`, `.deck-dots`…).
- Reuse existing visual tokens (fonts, colors, status/badge treatments) so the deck
  stays consistent with the rest of the OS.
- Keep the current responsive breakpoint behaviour, adapted to the rail/stage split.

## i18n

New keys in `src/i18n/en.ts` and `src/i18n/fr.ts`:

- `p_role` — "Role" / "Rôle" (pitch label).
- `p_prev` / `p_next` — aria-labels for nav buttons.
- `p_slide_of` — counter format, e.g. `"{n} / {total}"` (or a helper if the i18n
  layer has no interpolation — then build the string in the component).

Keep existing keys (`p_count_l`, `p_repo`, `p_demo`, `p_links_ph`); reuse where they
still apply.

## Testing

- Deck navigation: next/prev buttons advance and clamp at ends; keyboard ←/→ work
  when focused; rail click jumps to the right slide; counter reflects `activeIndex`.
- Slide rendering: hero uses cover when present else gradient; role line hidden when
  absent; placeholder links behaviour preserved.
- Scroll resets to top on slide change.
- Reduced-motion: no animation when the media query is set.
- Responsive: rail collapses to top strip at the breakpoint.

## Files touched

- `src/components/apps/Projects/Projects.tsx` — rewrite as deck container.
- `src/components/apps/Projects/SlideRail.tsx` — new.
- `src/components/apps/Projects/SlideStage.tsx` — new.
- `src/components/apps/Projects/ProjectSlide.tsx` — new.
- `src/styles/os.css` — replace `.pj-*` with `.deck-*`.
- `src/data/projects.ts` — add optional `cover`, `role`.
- `src/api/mock/projects.mock.ts` — (optional) populate a few `role`/`cover`.
- `src/i18n/en.ts`, `src/i18n/fr.ts` — new keys.
