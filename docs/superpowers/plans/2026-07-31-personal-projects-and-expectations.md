# Personal Projects and Developer Expectations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Projects deck into eight personal projects with real narrative copy, and state in the CV what Elie wants to work on.

**Architecture:** `Project` loses two fields nothing reads (`tags`, `stack[].color`) and gains one optional `linkNote`. The mock is rewritten from six entries (five of them employer work) to eight personal projects. Five banners are deleted and five new motifs are drawn by the existing committed Python generator. The CV gains a *Ce qui m'intéresse* block and the site drops its job-hunt tone in five places.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Vitest 4, Testing Library 16. Image generation: Python 3 + Pillow 8.1+, run by hand, never in CI.

**Spec:** `docs/superpowers/specs/2026-07-30-personal-projects-and-expectations-design.md`

## Global Constraints

- **No text inside banner images.** The site is bilingual; baked-in words would be wrong in the other language. `public/projects/ticoqos.png` is the single exception — it is a loud placeholder addressed to the repository owner and meant to be deleted.
- **No invented metrics.** No figure that cannot be sourced. Cedict's twelve GitHub stars are verified and deliberately unused: Elie reports no user feedback, and a star is not feedback.
- **French is the source of truth.** Every French string below was validated line by line with Elie. The English is a mirror written here; **Elie must read the English before this branch merges.**
- **Facts are verified, never inferred.** The years below come from the GitHub API, not from memory: `Plant974` created 2024-03-19, `IPI-Calendar-Scrap` created 2022-10-29, `PokeAPI-Kotlin` created 2022-07-26 and last pushed 2026-03-11. Both GitHub Pages demos were fetched and returned 200.
- **New `Project` fields are optional.** An API that omits `context`, `takeaway`, `cover` or `linkNote` must still render.
- **Banners:** exactly 1200×340, PNG, under 80 000 bytes, at `public/projects/<id>.png`, referenced as `/projects/<id>.png`. Enforced inside `save_png`.
- **Pillow floor is 8.1.** No `ImageDraw.rounded_rectangle` (8.2+), no `Image.Resampling` (10+), no `width=` on `ImageDraw.polygon` (9.4+). `Image.LANCZOS` is fine.
- **Adding an i18n key means adding it to `src/i18n/types.ts`, `fr.ts` and `en.ts`.** Omitting one fails `tsc`.
- **Prettier:** `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 140`, `arrowParens: 'always'`. `*.css` is in `.prettierignore`.
- **All six gates must pass before each commit:** `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run audit`.

## File Structure

**Create**

| File | Responsibility |
| --- | --- |
| `public/projects/{homelab,ramassali,plant974,meyiv,ipi-calendar}.png` | Five new banners. |

**Delete**

| File | Why |
| --- | --- |
| `public/projects/{payments,pictarine-tooling,auction,threaddump,schools}.png` | Their slides are gone. |

**Modify**

| File | Change |
| --- | --- |
| `src/data/identity.ts` | New `status`; a third `bio` paragraph. |
| `src/data/projects.ts` | Drop `tags` and `StackItem`; `stack: string[]`; add `linkNote?`. |
| `src/data/index.ts` | Drop the `StackItem` re-export. |
| `src/api/mock/projects.mock.ts` | Rewritten: eight personal projects. |
| `src/components/apps/Projects/ProjectSlide.tsx` | `stack` is strings; render `linkNote`. |
| `src/components/apps/Web/PortfolioPage.tsx` | `stack` is strings. |
| `src/components/apps/Cv/Cv.tsx` | The *Ce qui m'intéresse* block. |
| `src/components/OS/Bsod/Bsod.tsx` | Drop the recruitment joke; fix a broken HTML entity. |
| `src/i18n/{types,fr,en}.ts` | Reword `p_no_public_code`; add `cv_wants`; mascot tip, `aos_mem`, `t_neofetch`. |
| `src/styles/os.css` | `.cv2-want` rules. |
| `src/api/projects.test.ts` | Field-shape and asset assertions. |
| `src/components/apps/Projects/ProjectSlide.test.tsx` | Fixture shape; `linkNote` cases. |
| `src/components/apps/Projects/SlideRail.test.tsx` | Fixture shape. |
| `src/components/apps/Cv/Cv.test.tsx` | The new CV block. |
| `src/data/identity.test.ts` | Status and bio assertions. |
| `scripts/images/make_covers.py` | Five motifs out, five in, new registry. |

---

### Task 1: Retire the job-hunt tone

The site tells visitors Elie is on the market. He is employed and not searching, and asked for that removed. Five pieces of copy carry it. A sixth lives in `scripts/images/make_og.py` and is handled in Task 4, where the image tooling is already open.

**Files:**

- Modify: `src/data/identity.ts:28`
- Modify: `src/i18n/fr.ts:41,58` and `src/i18n/en.ts:41,58`
- Modify: `src/components/OS/Bsod/Bsod.tsx:10,12,16,18,20`
- Test: `src/data/identity.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `identity.status` reading *À l'écoute, sans chercher* / *Not looking, but listening*. Already rendered by `About.tsx:25`, `Terminal.tsx:102` and `PortfolioPage.tsx:67` — no component changes.

- [ ] **Step 1: Write the failing test**

Append to the `describe('identity', …)` block in `src/data/identity.test.ts`:

```ts
  it('does not advertise a job search — Elie is employed and not looking', () => {
    const serialized = JSON.stringify(identity).toLowerCase();
    expect(serialized).not.toMatch(/opportunit/);
    expect(identity.status.fr).toBe("À l'écoute, sans chercher");
    expect(identity.status.en).toBe('Not looking, but listening');
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/data/identity.test.ts`
Expected: FAIL — `status.fr` is still `'Ouvert aux opportunités'`, and the `opportunit` guard matches it.

- [ ] **Step 3: Change the status**

In `src/data/identity.ts`, replace line 28:

```ts
  status: { fr: "À l'écoute, sans chercher", en: 'Not looking, but listening' },
```

- [ ] **Step 4: Drop the recruitment copy from both locales**

In `src/i18n/fr.ts`, replace the mascot tip on line 41:

```ts
    'Elie héberge ce portfolio sur son propre serveur.',
```

and line 58:

```ts
  aos_mem: 'Mémoire disponible : assez pour huit projets persos.',
```

In `src/i18n/en.ts`, replace line 41:

```ts
    'Elie hosts this portfolio on his own server.',
```

and line 58:

```ts
  aos_mem: 'Available memory: enough for eight personal projects.',
```

- [ ] **Step 5: Point the blue screen at the OS instead of at recruiters**

In `src/components/OS/Bsod/Bsod.tsx`, replace line 10:

```tsx
        <p className="bsod-stop">KERNEL_PANIC_IN_COCORICO_MODULE</p>
```

and replace the whole paragraph currently on lines 15-21:

```tsx
        <p>
          Check to make sure your coffee supply is sufficient.
          <br />
          If the mascot is still crowing, run the window manager
          <br />
          to make sure any new themes are properly configured.
        </p>
```

- [ ] **Step 6: Fix the broken HTML entity on the same screen**

Still in `src/components/OS/Bsod/Bsod.tsx`, line 12 reads `you&aposve` — an HTML entity missing its semicolon, which Babel does not decode, so the bundle ships the literal text. Replace it:

```tsx
          If this is the first time you&apos;ve seen this Stop error screen, restart your computer. If this screen appears again, follow
```

This is unrelated to the task's goal and in scope because the alternative is knowingly leaving a visible defect in a file being edited anyway.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/data/identity.test.ts src/i18n/i18n.test.ts`
Expected: PASS. The i18n parity test confirms `fr` and `en` still agree.

- [ ] **Step 8: Verify the entity fix reached the bundle**

Run:

```bash
npm run build && grep -c 'aposve' build/assets/*.js
```

Expected: the build succeeds and `grep` reports `0` (exit status 1, no match). Before this task it reported `1`.

- [ ] **Step 9: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass. If `format:check` complains, run `npm run format` and re-check.

- [ ] **Step 10: Commit**

```bash
git add src/data/identity.ts src/data/identity.test.ts src/i18n/fr.ts src/i18n/en.ts src/components/OS/Bsod/Bsod.tsx
git commit -m "content: stop advertising a job search, and fix a broken entity in the BSOD"
```

---

### Task 2: Drop the two fields nothing reads

`Project.tags` and `Project.stack[].color` are dead. `ProjectSlide.tsx:57` calls `getBadge(s.label)` and never reads the colour, so the colour was maintained in two places and rendered from one. Nothing renders `tags` at all. Five new projects are about to be written; they should not have to fill either.

**Files:**

- Modify: `src/data/projects.ts:5-8,18,20`
- Modify: `src/data/index.ts:4`
- Modify: `src/components/apps/Projects/ProjectSlide.tsx:56-80`
- Modify: `src/components/apps/Web/PortfolioPage.tsx:126-132`
- Modify: `src/api/mock/projects.mock.ts` (all six entries)
- Test: `src/api/projects.test.ts`, `src/components/apps/Projects/ProjectSlide.test.tsx:17-18`, `src/components/apps/Projects/SlideRail.test.tsx:18-19`

**Interfaces:**

- Consumes: nothing from Task 1.
- Produces: `Project.stack: string[]`, consumed by Tasks 3 and 5. `StackItem` no longer exists.

- [ ] **Step 1: Write the failing tests**

Append to the `describe('mockProjects', …)` block in `src/api/projects.test.ts`:

```ts
  it('carries a plain string stack — no per-entry colour to keep in sync', () => {
    mockProjects.forEach((p) => {
      expect(p.stack.length).toBeGreaterThan(0);
      p.stack.forEach((s) => {
        expect(typeof s).toBe('string');
        expect(s.trim()).not.toBe('');
      });
    });
  });

  it('carries no tags — no component renders them', () => {
    mockProjects.forEach((p) => {
      expect(p).not.toHaveProperty('tags');
    });
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/api/projects.test.ts`
Expected: FAIL on both — `typeof p.stack[0]` is `'object'`, and every entry still has `tags`.

- [ ] **Step 3: Change the type**

In `src/data/projects.ts`, delete the `StackItem` interface (lines 5-8) and change the two fields. The file becomes:

```ts
import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export type ProjectStatus = 'live' | 'maintained' | 'archived' | 'in-progress' | 'open-source';

export interface Project {
  id: string;
  emoji: string;
  monogram: string;
  accent: string;
  gradient: string;
  title: LocalizedString;
  year: string;
  status: { label: LocalizedString; type: ProjectStatus };
  /** Technology labels. Rendered through `getBadge`, which owns the colour. */
  stack: string[];
  desc: LocalizedString;
  bullets: LocalizedStringArray;
  repo: string;
  demo: string;
  cover?: string;
  /** The problem the project existed to solve. */
  context?: LocalizedString;
  /** One sentence on what building it taught. */
  takeaway?: LocalizedString;
  role?: LocalizedString;
}
```

- [ ] **Step 4: Drop the re-export**

In `src/data/index.ts`, replace line 4:

```ts
export type { Project, ProjectStatus } from './projects';
```

- [ ] **Step 5: Update the slide**

In `src/components/apps/Projects/ProjectSlide.tsx`, replace the `deck-badges` block (lines 55-81) with:

```tsx
          {project.stack.map((tech) => {
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
```

- [ ] **Step 6: Update the browser page**

In `src/components/apps/Web/PortfolioPage.tsx`, replace lines 126-132:

```tsx
                <span className="np-db-tags np-hide-sm">
                  {p.stack.slice(0, 2).map((tech) => (
                    <span key={tech} className="np-tag">
                      {tech}
                    </span>
                  ))}
                </span>
```

This file was missed by the spec, which claimed only `ProjectSlide` read `stack`. It does not.

- [ ] **Step 7: Update the mock**

In `src/api/mock/projects.mock.ts`, for each of the six entries: delete the `tags` line and flatten `stack` to strings. The six become:

```ts
    stack: ['React', 'TypeScript', 'Vite'],                            // ticoqos
    stack: ['Next.js', 'TypeScript', 'PostgreSQL'],                    // pictarine-tooling
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Stripe'],          // payments
    stack: ['TypeScript', 'PostgreSQL', 'Stripe'],                     // auction
    stack: ['Java', 'Angular'],                                        // threaddump
    stack: ['MySQL', 'JavaScript'],                                    // schools
```

Task 5 replaces this file wholesale. This step exists so the tree typechecks between commits.

- [ ] **Step 8: Update the two test fixtures**

In `src/components/apps/Projects/ProjectSlide.test.tsx`, replace lines 17-18 of the `base` fixture with:

```tsx
  stack: ['Go'],
```

In `src/components/apps/Projects/SlideRail.test.tsx`, replace lines 18-19 of `mk` with:

```tsx
  stack: [],
```

- [ ] **Step 9: Run the tests**

Run: `npx vitest run src/api/projects.test.ts src/components/apps/Projects`
Expected: PASS. Both new assertions hold, and the slide still renders a badge per stack entry.

- [ ] **Step 10: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass. `tsc` is the real check here — it finds any consumer of `tags` or `StackItem` this plan missed.

- [ ] **Step 11: Commit**

```bash
git add src/data/projects.ts src/data/index.ts src/api/mock/projects.mock.ts src/api/projects.test.ts src/components/apps/Projects src/components/apps/Web/PortfolioPage.tsx
git commit -m "refactor(projects): drop tags and stack colours, which nothing rendered"
```

---

### Task 3: A per-project link note

One i18n key cannot cover four different reasons for having no link. `p_no_public_code` currently reads *Projet d'entreprise — code non public*, which will be wrong for every project in the deck after Task 5: none of them is employer work.

**Files:**

- Modify: `src/data/projects.ts` (after `takeaway`)
- Modify: `src/components/apps/Projects/ProjectSlide.tsx:93`
- Modify: `src/i18n/fr.ts:73`, `src/i18n/en.ts:73`
- Test: `src/components/apps/Projects/ProjectSlide.test.tsx:66-84`

**Interfaces:**

- Consumes: `Project.stack: string[]` from Task 2.
- Produces: `Project.linkNote?: LocalizedString`, consumed by Task 5 for `ticoqos`, `homelab`, `ramassali` and `meyiv`.

- [ ] **Step 1: Update the two existing assertions and add three**

In `src/components/apps/Projects/ProjectSlide.test.tsx`, replace the two tests on lines 66-84 with:

```tsx
it('falls back to the generic private-code note when repo and demo are both "#"', () => {
  renderSlide(base);
  expect(
    screen.getByText((content, element) => {
      return element?.className === 'deck-nolink' && content.includes('Code non public');
    }),
  ).toBeInTheDocument();
});

it('prefers the project’s own note over the generic fallback', () => {
  renderSlide({ ...base, linkNote: { fr: 'Vous êtes dedans.', en: 'You are inside it.' } });
  expect(
    screen.getByText((content, element) => {
      return element?.className === 'deck-nolink' && content.includes('Vous êtes dedans.');
    }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Code non public/)).toBeNull();
});

it('shows the repo button instead when a repo is set', () => {
  renderSlide({ ...base, repo: 'https://example.invalid/repo' });
  expect(screen.getByRole('link', { name: /Voir le repo/ })).toHaveAttribute('href', 'https://example.invalid/repo');
  expect(screen.queryByText(/Code non public/)).toBeNull();
});

it('shows no note at all when a repo is set, even with a linkNote', () => {
  const { container } = renderSlide({
    ...base,
    repo: 'https://example.invalid/repo',
    linkNote: { fr: 'Vous êtes dedans.', en: 'You are inside it.' },
  });
  expect(container.querySelector('.deck-nolink')).toBeNull();
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: FAIL — `linkNote` is not a property of `Project`, so Vitest reports a type error, and the rendered text is still the employer wording.

- [ ] **Step 3: Add the field**

In `src/data/projects.ts`, after the `takeaway` field:

```ts
  /** Why this project has no link, in its own words. Falls back to `p_no_public_code`. */
  linkNote?: LocalizedString;
```

- [ ] **Step 4: Reword the fallback in both locales**

In `src/i18n/fr.ts`, replace line 73:

```ts
  p_no_public_code: 'Code non public',
```

In `src/i18n/en.ts`, replace line 73:

```ts
  p_no_public_code: 'Code is not public',
```

`types.ts` needs no change — the key keeps its name.

- [ ] **Step 5: Render it**

In `src/components/apps/Projects/ProjectSlide.tsx`, replace line 93:

```tsx
          {noLinks && <span className="deck-nolink">🔒 {project.linkNote ? project.linkNote[lang] : t('p_no_public_code')}</span>}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx src/i18n/i18n.test.ts`
Expected: PASS, all four link cases.

- [ ] **Step 7: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/data/projects.ts src/i18n/fr.ts src/i18n/en.ts src/components/apps/Projects/ProjectSlide.tsx src/components/apps/Projects/ProjectSlide.test.tsx
git commit -m "feat(projects): let each project say why it has no public link"
```

---

### Task 4: Five banners out, five in

No unit test drives this one: the output is judged by eye. The contract that can be enforced — dimensions and weight — is enforced inside `save_png`, which writes to a temporary path and only `os.replace`s it onto the target once both checks pass. Task 5 then asserts from the repository that the files exist.

**Files:**

- Modify: `scripts/images/make_covers.py`
- Modify: `scripts/images/make_og.py:71`
- Modify: `scripts/images/README.md`
- Delete: `public/projects/{payments,pictarine-tooling,auction,threaddump,schools}.png`
- Create: `public/projects/{homelab,ramassali,plant974,meyiv,ipi-calendar}.png`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: eight files at `public/projects/<id>.png`, referenced by Task 5 as `/projects/<id>.png`. Accents, which Task 5 copies into the mock: `ticoqos #0a66c2`, `homelab #475569`, `ramassali #2f9e44`, `plant974 #5c940d`, `pokeapi-kotlin #e8590c`, `cedict #0e7490`, `meyiv #7048e8`, `ipi-calendar #c2255c`.

- [ ] **Step 1: Delete the five motif functions**

In `scripts/images/make_covers.py`, delete the functions `payments` (lines 21-34), `pictarine_tooling` (37-53), `auction` (56-68), `threaddump` (71-86) and `schools` (89-101). Keep `pokeapi_kotlin`, `cedict` and `placeholder` exactly as they are.

The `mix` and `shade` imports stay: the new `homelab` motif uses both.

- [ ] **Step 2: Add the five new motifs**

In `scripts/images/make_covers.py`, insert these after `cedict` and before `placeholder`:

```python
def homelab(accent):
    """Rack units wired to one upstream point, with a shield standing over them."""
    img = new_banner(accent)
    d = draw(img)
    for rx in (132, 330):
        for u in range(6):
            y = 72 + u * 34
            d.rectangle([rx, y, rx + 150, y + 24], fill=mix(accent, (255, 255, 255), 0.78) + (232,))
            d.ellipse([rx + 132, y + 8, rx + 142, y + 18], fill=shade(accent, 0.7) + (255,))
    hub_x, hub_y = 700, 150
    for y in (96, 164, 232):
        d.line([492, y, 600, y], fill=(255, 255, 255, 150), width=5)
        d.line([600, y, 600, hub_y], fill=(255, 255, 255, 150), width=5)
    d.line([600, hub_y, hub_x, hub_y], fill=(255, 255, 255, 205), width=7)
    d.ellipse([hub_x - 13, hub_y - 13, hub_x + 13, hub_y + 13], fill=(255, 255, 255, 235))
    # A shield: what Fail2Ban is there for. Polygon takes no width= before Pillow 9.4.
    sx, sy = 940, 78
    d.polygon(
        [(sx, sy), (sx + 118, sy), (sx + 118, sy + 96), (sx + 59, sy + 164), (sx, sy + 96)],
        fill=(255, 255, 255, 52),
        outline=(255, 255, 255, 235),
    )
    d.line([sx + 30, sy + 78, sx + 54, sy + 104], fill=(255, 255, 255, 240), width=9)
    d.line([sx + 54, sy + 104, sx + 92, sy + 46], fill=(255, 255, 255, 240), width=9)
    return add_scrim(img)


def ramassali(accent):
    """Scattered reports over a territory, one zone already cleared."""
    img = new_banner(accent)
    d = draw(img)
    d.polygon(
        [(140, 262), (232, 122), (410, 70), (612, 112), (782, 78), (930, 146), (1046, 258), (846, 296), (520, 274), (300, 300)],
        fill=(255, 255, 255, 52),
    )
    scattered = ((236, 196), (300, 132), (372, 226), (452, 158), (516, 232), (596, 176), (664, 236))
    for i, (x, y) in enumerate(scattered):
        d.ellipse([x - 11, y - 11, x + 11, y + 11], fill=(255, 255, 255, 96 + i * 18))
    cx, cy, cr = 872, 176, 78
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], outline=(255, 255, 255, 240), width=7)
    d.line([cx - 34, cy + 4, cx - 8, cy + 32], fill=(255, 255, 255, 240), width=11)
    d.line([cx - 8, cy + 32, cx + 40, cy - 30], fill=(255, 255, 255, 240), width=11)
    return add_scrim(img)


def plant974(accent):
    """Fronds fanning out over a faint grid — a catalogue, not a landscape."""
    img = new_banner(accent)
    d = draw(img)
    for x in range(96, WIDTH - 60, 58):
        d.line([x, 40, x, HEIGHT - 60], fill=(255, 255, 255, 30), width=2)
    for y in range(46, HEIGHT - 60, 46):
        d.line([80, y, WIDTH - 60, y], fill=(255, 255, 255, 30), width=2)
    for i, bx in enumerate((240, 520, 800)):
        base_x, base_y = bx, HEIGHT - 92
        tip_x, tip_y = bx + 96, 56 + i * 14
        d.line([base_x, base_y, tip_x, tip_y], fill=(255, 255, 255, 210), width=7)
        for k in range(1, 8):
            t = k / 8
            mx = round(base_x + (tip_x - base_x) * t)
            my = round(base_y + (tip_y - base_y) * t)
            span = round(86 * (1 - t) + 20)
            d.line([mx, my, mx - span, my - round(span * 0.42)], fill=(255, 255, 255, 150), width=5)
            d.line([mx, my, mx + span, my - round(span * 0.42)], fill=(255, 255, 255, 150), width=5)
    return add_scrim(img)


def meyiv(accent):
    """A staircase climbing over accumulating blocks: progression that keeps going."""
    img = new_banner(accent)
    d = draw(img)
    for i in range(9):
        x = 118 + i * 76
        h = 26 + i * 24
        d.rectangle([x, HEIGHT - 96 - h, x + 52, HEIGHT - 96], fill=(255, 255, 255, 58 + i * 16))
    x, y = 118, HEIGHT - 112
    for _ in range(9):
        nx, ny = x + 76, y - 22
        d.line([x, y, nx, y], fill=(255, 255, 255, 230), width=7)
        d.line([nx, y, nx, ny], fill=(255, 255, 255, 230), width=7)
        x, y = nx, ny
    d.ellipse([x - 14, y - 14, x + 14, y + 14], fill=(255, 255, 255, 240))
    return add_scrim(img)


def ipi_calendar(accent):
    """A week grid of blocks, with one export leaving it."""
    img = new_banner(accent)
    d = draw(img)
    left, top, colw, rowh = 108, 52, 96, 34
    d.rectangle([left, 30, left + 6 * colw - 18, 44], fill=(255, 255, 255, 150))
    for c in range(6):
        for r in range(6):
            if (c * 7 + r * 3) % 5 == 0:
                continue
            x, y = left + c * colw, top + r * rowh
            d.rectangle([x, y, x + colw - 18, y + rowh - 12], fill=(255, 255, 255, 62 + ((c + r) % 3) * 40))
    ax = left + 6 * colw + 16
    d.line([ax, 150, ax + 128, 150], fill=(255, 255, 255, 235), width=9)
    d.polygon([(ax + 128, 122), (ax + 190, 150), (ax + 128, 178)], fill=(255, 255, 255, 240))
    return add_scrim(img)
```

- [ ] **Step 3: Replace the registry**

In `scripts/images/make_covers.py`, replace the `BANNERS` tuple:

```python
BANNERS = (
    ('ticoqos', '#0a66c2', placeholder),
    ('homelab', '#475569', homelab),
    ('ramassali', '#2f9e44', ramassali),
    ('plant974', '#5c940d', plant974),
    ('pokeapi-kotlin', '#e8590c', pokeapi_kotlin),
    ('cedict', '#0e7490', cedict),
    ('meyiv', '#7048e8', meyiv),
    ('ipi-calendar', '#c2255c', ipi_calendar),
)
```

The order matches the deck order in Task 5, so the generator's output reads in the same sequence a visitor sees.

- [ ] **Step 4: Update the sharing card's status pill**

In `scripts/images/make_og.py`, replace line 71:

```python
    d.text((tx + 36, py + pill_h // 2), "À l'écoute, sans chercher", font=load_font(21), fill=INK, anchor='lm')
```

`public/og-image.png` does not exist on this branch — it lives on `feat/site-identity`. Regenerating the card is a cross-branch follow-up recorded in the spec, not something this task can complete. Fixing the generator now means the branch that owns the image produces the right text.

- [ ] **Step 5: Delete the five orphaned banners**

Run:

```bash
git rm public/projects/payments.png public/projects/pictarine-tooling.png public/projects/auction.png public/projects/threaddump.png public/projects/schools.png
```

- [ ] **Step 6: Generate the new set**

Run:

```bash
python3 scripts/images/make_covers.py
```

Expected: eight lines of output, each reporting `1200x340` and a byte count under 80 000. A `SystemExit` about dimensions or budget means a motif changed the canvas size — fix the motif, not the check.

- [ ] **Step 7: Look at them**

Open all eight and judge them by eye. Confirm specifically:

- the bottom-left is dark enough that white text over it reads
- no banner contains a word, other than `ticoqos.png`
- the placeholder is impossible to mistake for finished work
- no motif has drifted off-canvas: `meyiv`'s staircase should finish inside the frame, and `ipi-calendar`'s arrow should not touch the right edge

Regenerate after any adjustment. No automated test replaces this step.

- [ ] **Step 8: Fix the README's now-dead example**

`scripts/images/README.md:39` points at `pictarine-tooling` as the example of a banner whose colour was copied from the project's `gradient` — and this task deletes that banner. Replace the second *Rules* bullet (lines 35-40) with:

```markdown
- Each banner's colour is a hex copied by hand into `make_covers.py`'s `BANNERS`
  tuple — not read from any project data at build time. No component actually
  renders `accent`; the rail's monogram tile gets its colour from `gradient` in
  the project data. If a banner is meant to match the rail, copy the value from
  `gradient` (as `plant974` does, whose accent is that gradient's second stop) —
  nothing keeps the two in sync automatically, so re-check by eye after either
  one changes.
```

And extend the Pillow-floor sentence on lines 15-16, because this task's `homelab` motif depends on it:

```markdown
The code avoids anything newer than 8.1: no `ImageDraw.rounded_rectangle` (8.2+),
no `width=` on `ImageDraw.polygon` (9.4+), no `Image.Resampling` (10+).
`Image.LANCZOS` is used instead and works up to 11.
```

The *Placeholders awaiting a real image* table needs no change: it lists only `ticoqos.png`, which survives. Line 3's "eight files" also stays correct — five out, five in.

- [ ] **Step 9: Commit**

```bash
git add scripts/images public/projects
git commit -m "feat(images): five banners for the personal projects, five employer ones removed"
```

---

### Task 5: Fill the deck with the eight personal projects

**Files:**

- Modify: `src/api/mock/projects.mock.ts` (rewritten)
- Modify: `src/i18n/fr.ts:154`, `src/i18n/en.ts:154`
- Test: `src/api/projects.test.ts`

**Interfaces:**

- Consumes: `Project.stack: string[]` (Task 2), `Project.linkNote?` (Task 3), the eight PNGs (Task 4).
- Produces: eight entries. `SlideRail` and `Terminal` already count `projects.length`, so nothing else changes.

- [ ] **Step 1: Write the failing tests**

In `src/api/projects.test.ts`, add these two imports. `simple-import-sort` puts them in the same group as the `api/…` imports, sorted by source, so they go **after** the existing two lines:

```ts
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
```

Then extend the `describe('mockProjects', …)` block:

```ts
  it('holds the eight personal projects, in deck order', () => {
    expect(mockProjects.map((p) => p.id)).toEqual([
      'ticoqos',
      'homelab',
      'ramassali',
      'plant974',
      'pokeapi-kotlin',
      'cedict',
      'meyiv',
      'ipi-calendar',
    ]);
  });

  it('gives every project a context and a takeaway, in both languages', () => {
    mockProjects.forEach((p) => {
      expect(p.context?.fr.trim()).toBeTruthy();
      expect(p.context?.en.trim()).toBeTruthy();
      expect(p.takeaway?.fr.trim()).toBeTruthy();
      expect(p.takeaway?.en.trim()).toBeTruthy();
    });
  });

  it('points every cover at a PNG under /projects/', () => {
    mockProjects.forEach((p) => {
      expect(p.cover).toMatch(/^\/projects\/[a-z0-9-]+\.png$/);
    });
  });

  it('either links out over https or says nothing at all', () => {
    mockProjects.forEach((p) => {
      [p.repo, p.demo].forEach((link) => {
        expect(link === '#' || link.startsWith('https://')).toBe(true);
      });
    });
  });

  it('explains itself when it has no link at all', () => {
    mockProjects
      .filter((p) => p.repo === '#' && p.demo === '#')
      .forEach((p) => {
        expect(p.linkNote?.fr.trim()).toBeTruthy();
        expect(p.linkNote?.en.trim()).toBeTruthy();
      });
  });
```

Then, **at the top level of the file** — after the closing `});` of the `describe('mockProjects', …)` block, not inside it — add a third describe:

```ts
describe('cover files on disk', () => {
  // The most valuable assertion here: a typo or a forgotten export produces a
  // broken hero in production and nothing else notices.
  const publicDir = resolve(import.meta.dirname, '..', '..', 'public');
  const coverPath = (cover: string | undefined) => resolve(publicDir, String(cover).replace(/^\//, ''));

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s has its file', (_id, cover) => {
    expect(existsSync(coverPath(cover))).toBe(true);
  });

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s stays under 80 kB', (_id, cover) => {
    expect(statSync(coverPath(cover)).size).toBeLessThanOrEqual(80_000);
  });
});
```

`import.meta.dirname` resolves to `<root>/src/api`, so `'..', '..', 'public'` lands on `<root>/public`. It was verified to both typecheck and run under this tsconfig, whose `types` field lists only `vite/client` and `vitest/globals` — `@types/node` is not auto-included, but an explicit `node:` import still resolves.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/api/projects.test.ts`
Expected: FAIL — the ids are still the old six, and no project has `cover`, `context` or `takeaway`.

- [ ] **Step 3: Rewrite the mock**

Replace the whole body of `src/api/mock/projects.mock.ts` with the eight entries below. Every French string was validated with Elie; every English one is a mirror written here and still needs his read-through.

```ts
import type { Project } from 'data/projects';

export const mockProjects: Project[] = [
  {
    id: 'ticoqos',
    emoji: '🖥️',
    monogram: 'TQ',
    accent: '#0a66c2',
    gradient: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    cover: '/projects/ticoqos.png',
    title: { fr: 'TicoqOS — Portfolio', en: 'TicoqOS — Portfolio' },
    year: '2025',
    status: { label: { fr: 'En cours', en: 'In progress' }, type: 'in-progress' },
    stack: ['React', 'TypeScript', 'Vite'],
    desc: {
      fr: 'Portfolio façon OS rétro : fenêtres, taskbar, terminal et apps. Le site que vous parcourez.',
      en: 'A retro-OS style portfolio: windows, taskbar, terminal and apps. The site you are browsing.',
    },
    context: {
      fr: "Le premier système que j'ai eu entre les mains, c'était pour faire des exposés en primaire. Reconstruire ce bureau-là était d'abord un plaisir, et un prétexte : écrire un vrai gestionnaire de fenêtres plutôt qu'une page de plus. Un CV en PDF ne montre pas comment quelqu'un construit — celui-ci se manipule.",
      en: 'The first system I ever got my hands on was for school presentations in primary school. Rebuilding that desktop was a pleasure first and a pretext second: writing a real window manager rather than one more page. A PDF résumé shows nothing about how someone builds — this one you can operate.',
    },
    takeaway: {
      fr: "Le drag, le z-index et le focus clavier m'ont pris du temps, mais ils ont une fin. Ce qui n'en a pas, c'est la cohérence : deux langues, cinq thèmes et sept apps qui doivent rester d'accord sans qu'une seule chaîne soit écrite deux fois.",
      en: 'Dragging, z-index and keyboard focus took time, but they end. Consistency does not: two languages, five themes and seven apps that have to agree without a single string being written twice.',
    },
    bullets: {
      fr: ['Gestionnaire de fenêtres & taskbar maison', 'i18n FR/EN, thèmes et easter eggs', 'API projets dynamique'],
      en: ['Custom window manager & taskbar', 'FR/EN i18n, themes and easter eggs', 'Dynamic projects API'],
    },
    role: { fr: 'Projet personnel — conception, design et développement', en: 'Personal project — design and development' },
    repo: '#',
    demo: '#',
    linkNote: { fr: 'Vous êtes dedans.', en: 'You are inside it.' },
  },
  {
    id: 'homelab',
    emoji: '🗄️',
    monogram: 'HL',
    accent: '#475569',
    gradient: 'linear-gradient(135deg,#64748b,#334155)',
    cover: '/projects/homelab.png',
    title: { fr: 'Homelab — ma propre plateforme', en: 'Homelab — my own platform' },
    year: '2024',
    status: { label: { fr: 'En production', en: 'Live' }, type: 'live' },
    stack: ['Proxmox', 'Docker', 'Traefik', 'PostgreSQL'],
    desc: {
      fr: 'Un Proxmox sur NUC et NAS, chez moi : réseau, reverse proxy, supervision et déploiement de mes projets.',
      en: 'Proxmox on a NUC and a NAS, at home: network, reverse proxy, monitoring and deployment of my projects.',
    },
    context: {
      fr: "En première alternance, j'administrais des serveurs Linux, je faisais du monitoring et du déploiement automatisé. J'ai voulu refaire cette expérience pour moi, avec ce que j'ai appris depuis : mon propre Proxmox, mon propre réseau, et mes projets qui tournent dessus plutôt que chez un hébergeur.",
      en: 'During my first apprenticeship I administered Linux servers, did the monitoring and the automated deployment. I wanted that experience again for myself, with what I have learned since: my own Proxmox, my own network, and my projects running on it rather than at a host.',
    },
    takeaway: {
      fr: "S'héberger soi-même veut dire tout posséder : les certificats, les sauvegardes, ce que Fail2Ban attrape dans les logs. Ce qui rend ça tenable n'est pas d'aller vérifier à la main, c'est un flow n8n qui me prévient quand une sauvegarde Proxmox s'est mal passée.",
      en: 'Self-hosting means owning everything: the certificates, the backups, whatever Fail2Ban catches in the logs. What makes it sustainable is not checking by hand — it is an n8n flow that tells me when a Proxmox backup went wrong.',
    },
    bullets: {
      fr: [
        'Proxmox sur NUC et NAS, reverse proxy Traefik, Fail2Ban',
        'Sauvegardes et veille tech automatisées avec n8n',
        'Héberge mes projets persos — ce portfolio bientôt',
      ],
      en: [
        'Proxmox on a NUC and a NAS, Traefik reverse proxy, Fail2Ban',
        'Backups and tech watch automated with n8n',
        'Hosts my personal projects — this portfolio soon',
      ],
    },
    role: {
      fr: 'Projet personnel — infrastructure, réseau, exploitation',
      en: 'Personal project — infrastructure, network, operations',
    },
    repo: '#',
    demo: '#',
    linkNote: {
      fr: "Pas de dépôt : c'est une infrastructure, pas un logiciel.",
      en: 'No repository: this is infrastructure, not software.',
    },
  },
  {
    id: 'ramassali',
    emoji: '♻️',
    monogram: 'RA',
    accent: '#2f9e44',
    gradient: 'linear-gradient(135deg,#40c057,#2b8a3e)',
    cover: '/projects/ramassali.png',
    title: { fr: 'RamassALi — signalement des dépôts sauvages', en: 'RamassALi — reporting illegal dumping' },
    year: '2025',
    status: { label: { fr: 'En cours', en: 'In progress' }, type: 'in-progress' },
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL'],
    desc: {
      fr: 'Backend Kotlin / Spring pour signaler les dépôts de déchets sauvages à La Réunion et organiser les sorties de nettoyage.',
      en: 'Kotlin / Spring backend for reporting illegal waste dumps in Réunion and organising clean-up outings.',
    },
    context: {
      fr: "À La Réunion, les dépôts sauvages se signalent de bouche-à-oreille et les associations organisent leurs sorties sans carte commune. L'idée est simple : un signalement collaboratif, pour que les habitants et les associations voient les mêmes points au même endroit.",
      en: 'In Réunion, illegal dumps get reported by word of mouth and associations organise their clean-ups with no shared map. The idea is simple: collaborative reporting, so residents and associations see the same points in the same place.',
    },
    takeaway: {
      fr: "Le backend est la partie que je sais faire. Le vrai obstacle est ailleurs : une application collaborative ne vaut rien sans communauté, donc le travail qui compte est d'aller parler aux associations, pas d'écrire des endpoints.",
      en: 'The backend is the part I know how to do. The real obstacle is elsewhere: a collaborative application is worth nothing without a community, so the work that counts is talking to the associations, not writing endpoints.',
    },
    bullets: {
      fr: ['Backend Kotlin / Spring Boot', 'Application mobile et site web à venir', 'Hébergé sur mon homelab'],
      en: ['Kotlin / Spring Boot backend', 'Mobile app and website to come', 'Hosted on my homelab'],
    },
    role: { fr: 'Projet personnel — conception et backend', en: 'Personal project — design and backend' },
    repo: '#',
    demo: '#',
    linkNote: {
      fr: "Dépôt privé tant que le projet n'est pas présentable.",
      en: 'Private repository until the project is presentable.',
    },
  },
  {
    id: 'plant974',
    emoji: '🌿',
    monogram: 'P9',
    accent: '#5c940d',
    gradient: 'linear-gradient(135deg,#94d82d,#5c940d)',
    cover: '/projects/plant974.png',
    title: { fr: 'Plant974 — flore de La Réunion', en: 'Plant974 — flora of Réunion' },
    year: '2024',
    status: { label: { fr: 'Public', en: 'Public' }, type: 'open-source' },
    stack: ['Redis', 'TypeScript', 'Node.js', 'Grafana'],
    desc: {
      fr: 'Base NoSQL de la flore réunionnaise, constituée par scraping, explorable dans Grafana.',
      en: 'A NoSQL database of Réunion flora, built by scraping, explorable in Grafana.',
    },
    context: {
      fr: "Un projet d'école demandait de bâtir une base NoSQL à partir d'une source publique. Je suis allé plus loin : plutôt qu'un jeu de données d'exercice, j'ai scrapé un site répertoriant les espèces présentes à La Réunion avec leurs images, pour obtenir une base réelle qui n'existait nulle part sous cette forme.",
      en: 'A school project asked for a NoSQL database built from a public source. I went further: rather than an exercise dataset, I scraped a site listing the species found in Réunion along with their images, to get a real base that existed nowhere in that form.',
    },
    takeaway: {
      fr: "Mon premier vrai contact avec le NoSQL : stocker chaque espèce en JSON complet dans Redis suffit pour démarrer, et c'est en voulant explorer la donnée — d'où le Grafana branché dessus — que j'ai commencé à voir ce qu'un choix de base fait gagner ou coûter.",
      en: 'My first real brush with NoSQL: storing each species as a full JSON document in Redis is enough to get started, and it was wanting to explore the data — hence the Grafana wired on top — that I began to see what a choice of database buys or costs.',
    },
    bullets: {
      fr: ['Scraping en Node / TypeScript, images comprises', 'Stockage JSON dans Redis', 'Exploration des données via Grafana'],
      en: ['Scraping in Node / TypeScript, images included', 'Full-JSON storage in Redis', 'Data exploration through Grafana'],
    },
    role: {
      fr: "Projet d'école poussé plus loin — scraping, modélisation, restitution",
      en: 'School project taken further — scraping, modelling, presentation',
    },
    repo: 'https://github.com/Tykok/Plant974',
    demo: '#',
  },
  {
    id: 'pokeapi-kotlin',
    emoji: '📦',
    monogram: 'PK',
    accent: '#e8590c',
    gradient: 'linear-gradient(135deg,#f97316,#c2410c)',
    cover: '/projects/pokeapi-kotlin.png',
    title: { fr: 'PokeAPI-Kotlin — bibliothèque', en: 'PokeAPI-Kotlin — library' },
    year: '2022',
    status: { label: { fr: 'Maintenue', en: 'Maintained' }, type: 'maintained' },
    stack: ['Kotlin', 'Gradle', 'JUnit'],
    desc: {
      fr: 'Bibliothèque Kotlin publiée sur Maven Central, qui expose la PokéAPI en un appel typé.',
      en: 'Kotlin library published to Maven Central, exposing the PokéAPI through one typed call.',
    },
    context: {
      fr: "J'avais utilisé la PokéAPI pour des projets scolaires et je voulais lui rendre hommage : un wrapper Kotlin qui expose ses données en un appel typé, au lieu de réécrire les mêmes classes de données à chaque fois. Mais l'objectif premier était ailleurs — publier une première bibliothèque sur Maven Central et voir ce que ça demande vraiment.",
      en: 'I had used the PokéAPI for school projects and wanted to pay it tribute: a Kotlin wrapper exposing its data in one typed call, instead of rewriting the same data classes every time. But the first goal was elsewhere — publishing a first library to Maven Central and seeing what it actually takes.',
    },
    takeaway: {
      fr: "Le code n'était pas le morceau, la publication l'était : signature GPG, staging Sonatype, javadoc obligatoire — et une migration de la méthode de déploiement en cours de route, qui m'a fait tout reprendre. Une bibliothèque n'existe qu'au moment où quelqu'un d'autre peut l'ajouter en une ligne.",
      en: 'The code was not the hard part, publishing was: GPG signing, Sonatype staging, mandatory javadoc — and a migration of the deployment method mid-way, which made me redo all of it. A library only exists once someone else can add it in one line.',
    },
    bullets: {
      fr: [
        'Publiée sur Maven Central sous fr.tykok:pokeapi',
        'Documentation MkDocs sur GitHub Pages',
        'Licence MIT, CHANGELOG et guide de contribution',
      ],
      en: [
        'Published to Maven Central as fr.tykok:pokeapi',
        'MkDocs documentation on GitHub Pages',
        'MIT licence, CHANGELOG and contributing guide',
      ],
    },
    role: {
      fr: 'Projet personnel — conception, publication, documentation',
      en: 'Personal project — design, release, documentation',
    },
    repo: 'https://github.com/Tykok/PokeAPI-Kotlin',
    demo: 'https://tykok.github.io/PokeAPI-Kotlin/',
  },
  {
    id: 'cedict',
    emoji: '📖',
    monogram: 'CD',
    accent: '#0e7490',
    gradient: 'linear-gradient(135deg,#0891b2,#155e75)',
    cover: '/projects/cedict.png',
    title: { fr: 'Cedict — dictionnaire chinois', en: 'Cedict — Chinese dictionary' },
    year: '2022',
    status: { label: { fr: 'Publié', en: 'Published' }, type: 'open-source' },
    stack: ['TypeScript', 'Node.js', 'Jest'],
    desc: {
      fr: 'Bibliothèque et CLI TypeScript publiées sur npm pour interroger le dictionnaire chinois CEDICT.',
      en: 'TypeScript library and CLI published to npm for querying the CEDICT Chinese dictionary.',
    },
    context: {
      fr: "J'apprenais le chinois — réputé une des langues les plus difficiles, ce qui suffisait à me motiver — avec l'idée d'en tirer une application pour quelqu'un. Le CEDICT, la référence libre du domaine, est distribué comme un fichier texte au format maison que chacun re-parse à sa façon. Je voulais au passage comprendre ce que publier sur npm demande.",
      en: 'I was learning Chinese — reputed one of the hardest languages, which was motivation enough — with the idea of turning it into an application for someone. CEDICT, the free reference in the field, ships as a text file in its own format that everyone re-parses their own way. I also wanted to understand what publishing to npm takes.',
    },
    takeaway: {
      fr: "Le vrai travail a été le parsing : le format n'a rien de standard, et le rendre exploitable a pris bien plus de temps que la CLI qui l'expose. Le reste de la valeur tient dans un workflow planifié qui récupère la version amont, la teste et la publie — sans lui, la bibliothèque serait déjà périmée.",
      en: 'The real work was the parsing: the format is not standard in any way, and making it usable took far longer than the CLI that exposes it. The rest of the value sits in a scheduled workflow that fetches the upstream version, tests it and publishes — without it the library would already be stale.',
    },
    bullets: {
      fr: [
        'Publiée sur npm sous @tykok/cedict-dictionary',
        "Parsing d'un format texte non standard",
        'Workflow planifié qui suit le dictionnaire amont',
      ],
      en: [
        'Published to npm as @tykok/cedict-dictionary',
        'Parsing of a non-standard text format',
        'Scheduled workflow tracking the upstream dictionary',
      ],
    },
    role: { fr: 'Projet personnel — parseur, CLI, chaîne de publication', en: 'Personal project — parser, CLI, release pipeline' },
    repo: 'https://github.com/Tykok/cedict-chinese-transformation',
    demo: 'https://tykok.github.io/cedict-chinese-transformation/',
  },
  {
    id: 'meyiv',
    emoji: '🎮',
    monogram: 'MY',
    accent: '#7048e8',
    gradient: 'linear-gradient(135deg,#845ef7,#5f3dc4)',
    cover: '/projects/meyiv.png',
    title: { fr: 'Meyiv — backend de jeu', en: 'Meyiv — game backend' },
    year: '2025',
    status: { label: { fr: 'En cours', en: 'In progress' }, type: 'in-progress' },
    stack: ['Kotlin', 'Spring Boot', 'PostgreSQL'],
    desc: {
      fr: "Backend Kotlin / Spring d'un jeu clicker de rôle : authentification, comptes et progression du joueur.",
      en: 'Kotlin / Spring backend for a role-playing clicker game: authentication, accounts and player progression.',
    },
    context: {
      fr: "Un collègue construisait un jeu clicker inspiré du jeu de rôle, et il lui manquait tout l'arrière : comptes, connexion, sauvegarde de l'avancée. Je suis venu prendre cette partie, seul sur le back.",
      en: 'A colleague was building a clicker game inspired by role-playing games, and everything behind it was missing: accounts, sign-in, saving progress. I came in to take that part, alone on the backend.',
    },
    takeaway: {
      fr: "Un back de jeu clicker a une contrainte que les autres n'ont pas : le client peut mentir sur ce qu'il a fait, et la progression doit continuer d'avancer hors ligne. Je sais que ce sera le sujet ; le back est encore en cours et je n'y suis pas encore.",
      en: 'A clicker game backend has a constraint others do not: the client can lie about what it did, and progression has to keep advancing offline. I know that will be the subject; the backend is still in progress and I am not there yet.',
    },
    bullets: {
      fr: ['Authentification et gestion de compte', 'Progression du joueur persistée', 'Kotlin / Spring Boot, seul sur le back'],
      en: ['Authentication and account management', 'Persisted player progression', 'Kotlin / Spring Boot, alone on the backend'],
    },
    role: {
      fr: "Projet perso, en renfort d'un collègue — tout le backend",
      en: 'Personal project, backing up a colleague — the whole backend',
    },
    repo: '#',
    demo: '#',
    linkNote: {
      fr: "Dépôt privé — projet en cours, et il n'est pas que le mien.",
      en: 'Private repository — work in progress, and not solely mine.',
    },
  },
  {
    id: 'ipi-calendar',
    emoji: '📅',
    monogram: 'IC',
    accent: '#c2255c',
    gradient: 'linear-gradient(135deg,#e64980,#a61e4d)',
    cover: '/projects/ipi-calendar.png',
    title: { fr: "Scraping de l'agenda de l'IPI", en: 'Scraping the IPI timetable' },
    year: '2022',
    status: { label: { fr: 'Archivé', en: 'Archived' }, type: 'archived' },
    stack: ['Python'],
    desc: {
      fr: "Petit script Python qui transforme l'agenda de l'école en fichier .ics, pour l'ouvrir dans n'importe quel calendrier.",
      en: 'A small Python script turning the school timetable into an .ics file, to open it in any calendar.',
    },
    context: {
      fr: "L'agenda de l'IPI n'était consultable que dans son propre outil, qui n'avait rien de moderne. Il fallait aller le regarder à la main au lieu de voir ses cours à côté du reste de sa semaine.",
      en: 'The IPI timetable could only be read in its own tool, which was nothing like modern. You had to go and look at it by hand instead of seeing your classes next to the rest of your week.',
    },
    takeaway: {
      fr: "C'est mon plus petit projet et le seul dont d'autres gens se sont vraiment servis : une partie de ma promo l'a utilisé un moment. L'utilité ne se mesure pas à la taille de ce qu'on écrit.",
      en: 'It is my smallest project and the only one other people actually used: part of my year group ran it for a while. Usefulness is not measured by the size of what you write.',
    },
    bullets: {
      fr: ["Récupération de l'agenda et export .ics", 'Script Python lancé en local', 'Utilisé par une partie de ma promo'],
      en: ['Timetable retrieval and .ics export', 'Python script run locally', 'Used by part of my year group'],
    },
    role: { fr: 'Projet personnel — script et format de sortie', en: 'Personal project — script and output format' },
    repo: 'https://github.com/Tykok/IPI-Calendar-Scrap',
    demo: '#',
  },
];
```

The displayed title is *Scraping de l'agenda de l'IPI* while the repository stays `IPI-Calendar-Scrap`: renaming the repository would break the URL, and visitors read the title.

- [ ] **Step 4: Update the hardcoded project count**

`t_neofetch` states the count in prose, where `projects.length` cannot reach. In `src/i18n/fr.ts`, replace line 154:

```ts
    ['Mémoire', '8 projets / 1 développeur'],
```

In `src/i18n/en.ts`, replace line 154:

```ts
    ['Memory', '8 projects / 1 developer'],
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/api/projects.test.ts`
Expected: PASS, including the sixteen generated-file assertions (eight projects × two).

- [ ] **Step 6: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 7: See it in the real app**

Run `npm run dev`, open the Projects app, and step through all eight slides. Confirm:

- each hero shows its banner and the white title reads against it
- `context` and the takeaway block appear on every slide
- `ticoqos`, `homelab`, `ramassali` and `meyiv` each show their own note, not the generic one
- `plant974`, `pokeapi-kotlin`, `cedict` and `ipi-calendar` show working buttons — click all six
- the rail header reads `Projets (8)`, and `neofetch` in the terminal agrees
- switch to English and step through again: nothing is left in French

- [ ] **Step 8: Commit**

```bash
git add src/api/mock/projects.mock.ts src/api/projects.test.ts src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat(projects): eight personal projects, each with its problem and its lesson"
```

---

### Task 6: What Elie wants to work on

**Files:**

- Modify: `src/data/identity.ts` (the `bio` field)
- Modify: `src/i18n/types.ts` (the `// CV app` block), `src/i18n/fr.ts`, `src/i18n/en.ts`
- Modify: `src/components/apps/Cv/Cv.tsx`
- Modify: `src/styles/os.css` (after `.cv2-soft`, line 563)
- Test: `src/components/apps/Cv/Cv.test.tsx`, `src/data/identity.test.ts`

**Interfaces:**

- Consumes: the new `status` from Task 1 — the heading is worded to agree with it.
- Produces: i18n key `cv_wants: string`. Used by no later task.

- [ ] **Step 1: Write the failing tests**

Append to `describe('Cv app', …)` in `src/components/apps/Cv/Cv.test.tsx`:

```tsx
  it('states what Elie wants to work on', () => {
    renderCv();
    expect(screen.getByText(fr.cv_wants)).toBeInTheDocument();
    expect(document.querySelectorAll('.cv2-want p')).toHaveLength(3);
    expect(screen.getByText("Le back, l'infra et les bases de données.")).toBeInTheDocument();
    expect(screen.getByText('Un endroit où on apprend.')).toBeInTheDocument();
  });

  it('does not frame that block as a job search', () => {
    const { container } = renderCv();
    expect(container.textContent).not.toMatch(/recherche un poste|opportunit/i);
  });
```

Append to `describe('identity', …)` in `src/data/identity.test.ts`:

```ts
  it('carries a three-paragraph bio, the third one personal', () => {
    (['fr', 'en'] as const).forEach((lang) => {
      const paragraphs = identity.bio[lang].split('\n\n');
      expect(paragraphs).toHaveLength(3);
      paragraphs.forEach((p) => expect(p.trim().length).toBeGreaterThan(0));
    });
    expect(identity.bio.fr).toMatch(/La Réunion/);
    expect(identity.bio.en).toMatch(/Réunion/);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/components/apps/Cv/Cv.test.tsx src/data/identity.test.ts`
Expected: FAIL — `fr.cv_wants` does not exist (a type error), and the bio has two paragraphs.

- [ ] **Step 3: Add the i18n key to all three files**

In `src/i18n/types.ts`, in the `// CV app` block, after `cv_interests: string;`:

```ts
  cv_wants: string;
```

In `src/i18n/fr.ts`, after line 85:

```ts
  cv_wants: "Ce qui m'intéresse",
```

In `src/i18n/en.ts`, after line 85:

```ts
  cv_wants: 'What I want to work on',
```

*Ce qui m'intéresse*, not *Ce que je recherche*: the status two screens away says he is not looking, and a heading claiming otherwise would contradict it. Talking about the work rather than the position removes the tension.

- [ ] **Step 4: Add the third bio paragraph**

In `src/data/identity.ts`, append to the `bio.fr` string, after the existing second paragraph and separated by `\n\n`:

```
Je suis originaire de La Réunion, et ça se voit dans ce que je construis à côté : une base de la flore de l'île, une application de signalement des dépôts sauvages. Le reste tourne sur mon propre serveur, à la maison. Ce que je cherche à faire, au fond, c'est quelque chose d'utile.
```

and to `bio.en`:

```
I am from Réunion, and it shows in what I build on the side: a database of the island's flora, an app for reporting illegal dumping. The rest runs on my own server, at home. What I am really after is building something useful.
```

`About.tsx:28`, `Cv.tsx:221` and `PortfolioPage.tsx:92` all split on `\n\n`, so a third paragraph renders in all three with no code change.

- [ ] **Step 5: Add the block to the CV**

In `src/components/apps/Cv/Cv.tsx`, add this constant after `LANGUAGES` (line 188):

```tsx
const WANTS: { lead: LocalizedString; rest: LocalizedString }[] = [
  {
    lead: { fr: "Le back, l'infra et les bases de données.", en: 'Backend, infrastructure and databases.' },
    rest: { fr: "C'est là que je veux rester.", en: 'That is where I want to stay.' },
  },
  {
    lead: { fr: 'Un endroit où on apprend.', en: 'A place where you learn.' },
    rest: { fr: "C'est ma seule condition non négociable.", en: 'That is my one non-negotiable.' },
  },
  {
    lead: { fr: 'Construire quelque chose de vraiment utile,', en: 'Building something genuinely useful,' },
    rest: { fr: "qui ait du sens — c'est ce que je vise à trois ans.", en: 'with real meaning — that is my three-year aim.' },
  },
];
```

Line 4 currently imports only `LocalizedStringArray`, so widen it — `tsc` fails otherwise:

```tsx
import type { LocalizedString, LocalizedStringArray } from 'types/lang';
```

Then, in the side column, after the `cv_lang` block and before the `cv_interests` block:

```tsx
            <div>
              <h3>{t('cv_wants')}</h3>
              <div className="cv2-want">
                {WANTS.map((w) => (
                  <p key={w.lead.fr}>
                    <b>{w.lead[lang]}</b> {w.rest[lang]}
                  </p>
                ))}
              </div>
            </div>
```

- [ ] **Step 6: Style it**

In `src/styles/os.css`, after the `.cv2-soft` rule on line 563:

```css
.cv2-want { display: flex; flex-direction: column; gap: 9px; }
.cv2-want p { margin: 0; font-size: 12px; line-height: 1.5; color: var(--ink); text-wrap: pretty; }
.cv2-want b { color: #1a52d6; }
```

Three paragraphs rather than `.cv2-soft` chips: a chip holds two or three words, and these are sentences.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/components/apps/Cv/Cv.test.tsx src/data/identity.test.ts src/i18n/i18n.test.ts`
Expected: PASS. The i18n parity test confirms `cv_wants` landed in all three files.

- [ ] **Step 8: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 9: See it printed**

Run `npm run dev`, open the CV, and use its **Imprimer** button. Confirm in the print preview that the *Ce qui m'intéresse* block appears in the side column and that its three lines are not clipped between pages. This block is the only content added to a document that gets printed, so the print path is the one that matters.

- [ ] **Step 10: Commit**

```bash
git add src/data/identity.ts src/data/identity.test.ts src/i18n src/components/apps/Cv src/styles/os.css
git commit -m "feat(cv): say what I want to work on, and who I am outside the job"
```

---

## Verification

After Task 6, from a clean checkout of the branch:

```bash
npm ci
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit
```

Expected: all six pass.

Then, by hand, because no test covers them:

```bash
python3 scripts/images/make_covers.py     # must print eight lines, all 1200x340, all under budget
git status --short                        # must be empty: the committed PNGs are byte-identical
```

A dirty tree after regenerating means a motif is not deterministic, which would make every future run produce a diff.

## Out of scope

Carried by later specs:

1. **One company, one card** — employer work re-presented as the company, its objective, Elie's role, and the projects he led there. Replaces the five slides Task 4 and Task 5 remove, and covers the per-role CV summary sentence deferred with it.
2. **Architecture diagrams** in their own `deck-arch` section.
3. **A real TicoqOS screenshot** to replace the `À REMPLACER` placeholder.
4. **`index.html` metadata** — still the Create React App default description.
5. **Regenerating `og-image.png` on `feat/site-identity`**, whose generator Task 4 fixes but whose image does not exist on this branch.

## Decisions left to the owner

Recorded in the spec, unchanged here:

1. **`github.com/Tykok/Portfolio` is public** while Elie stated he did not want it so. This plan ships `ticoqos` with no links and the note *Vous êtes dedans*, which is correct either way. Reversing it is a two-line change in Task 5's entry.
2. **Cedict's twelve GitHub stars go unmentioned.**
