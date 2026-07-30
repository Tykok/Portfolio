# Projects Deck Content and Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the six projects a narrative (`context`, `takeaway`) and a hero banner, and replace the "placeholder links" note with a deliberate statement.

**Architecture:** Two optional `LocalizedString` fields are added to `Project` and rendered by `ProjectSlide`. Six 1200×340 WebP banners are drawn by a committed Python generator into `public/projects/` and referenced by the existing `cover` field. `SlideRail` loses its cover branch because its thumbnail is 34×26 px.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Vitest 4, Testing Library 16. Image generation: Python 3 + Pillow (run by hand, never in CI).

**Spec:** `docs/superpowers/specs/2026-07-30-projects-deck-content-design.md`

## Global Constraints

- **No text inside banner images.** The site is bilingual; baked-in words would be wrong in the other language and cannot be fixed without regenerating. The `ticoqos` placeholder is the single exception, because it addresses the repository owner and is meant to be deleted.
- **No invented metrics.** No latency, throughput, percentage or headcount figure that cannot be sourced from the LinkedIn profile.
- **The `context` and `takeaway` strings are drafts written in Elie's voice, and he has to read them before they ship.** They describe problems and state lessons in the first person, which goes further than the LinkedIn profile documents. The profile supports what was built; the framing and the conclusions are an interpretation of it. Wrong-sounding sentences are a one-line fix, but only he can tell.
- **New `Project` fields are optional.** An API that omits them must still render.
- **Banners:** exactly 1200×340, WebP, under 80 000 bytes, at `public/projects/<id>.webp`, referenced as `/projects/<id>.webp`.
- **Pillow floor is 8.1.** Do not use `ImageDraw.rounded_rectangle` (8.2+) or `Image.Resampling` (10+). `Image.LANCZOS` is fine.
- **Image generation never runs in CI.** No Python in the build or deploy path.
- **Adding an i18n key means adding it to `src/i18n/types.ts`, `fr.ts` and `en.ts`.** Omitting one fails `tsc`.
- **Prettier:** `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 140`, `arrowParens: 'always'`. `*.css` is in `.prettierignore`.
- **All six gates must pass before each commit:** `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run audit`.

## File Structure

**Create**

| File | Responsibility |
| --- | --- |
| `scripts/images/palette.py` | The colours, once, mirroring `src/styles/design.css`. Plus `hex_to_rgb`, `mix`, `shade`. |
| `scripts/images/banner.py` | Canvas primitives shared by every generator: gradients, the bottom scrim, and `save_webp` which enforces the size contract. |
| `scripts/images/make_covers.py` | The six motifs and the project→motif registry. |
| `scripts/images/make_og.py` | The sharing card, recovered from a scratch directory. |
| `scripts/images/README.md` | Prerequisites, the command, and which images are placeholders. |
| `public/projects/*.webp` | Six generated banners. |

**Modify**

| File | Change |
| --- | --- |
| `src/data/projects.ts` | Add `context?` and `takeaway?`. |
| `src/i18n/types.ts`, `fr.ts`, `en.ts` | Drop `p_links_ph`; add `p_no_public_code` and `p_takeaway`. |
| `src/components/apps/Projects/ProjectSlide.tsx` | Render `context` and `takeaway`; new link note. |
| `src/components/apps/Projects/SlideRail.tsx` | Remove the `cover` branch. |
| `src/styles/os.css` | Add `.deck-takeaway`, `.deck-takeaway-l`, `.deck-nolink`. |
| `src/api/mock/projects.mock.ts` | Fill `cover`, `context`, `takeaway`; fix the `ticoqos` links. |
| `src/api/projects.test.ts` | Extend the contract block; assert the assets exist and fit the budget. |
| `src/components/apps/Projects/ProjectSlide.test.tsx` | Update the link assertion; add four cases. |
| `src/components/apps/Projects/SlideRail.test.tsx` | Lock in "monogram even with a cover". |

---

### Task 1: The link note

Five of six projects print an italic *liens placeholder*, which reads as unfinished work rather than as employer-owned code.

**Files:**

- Modify: `src/i18n/types.ts` (the `// Projects app` block)
- Modify: `src/i18n/fr.ts:73`, `src/i18n/en.ts:73`
- Modify: `src/components/apps/Projects/ProjectSlide.tsx:85`
- Modify: `src/styles/os.css` (deck section)
- Test: `src/components/apps/Projects/ProjectSlide.test.tsx:66`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: i18n key `p_no_public_code: string`, used by no later task.

- [ ] **Step 1: Update the failing test**

In `src/components/apps/Projects/ProjectSlide.test.tsx`, replace the existing final test:

```tsx
it('states that the code is private when repo and demo are both "#"', () => {
  renderSlide(base);
  expect(screen.getByText("Projet d'entreprise — code non public")).toBeInTheDocument();
  expect(screen.queryByText('liens placeholder')).toBeNull();
});

it('shows the repo button instead when a repo is set', () => {
  renderSlide({ ...base, repo: 'https://example.invalid/repo' });
  expect(screen.getByRole('link', { name: /Voir le repo/ })).toHaveAttribute('href', 'https://example.invalid/repo');
  expect(screen.queryByText("Projet d'entreprise — code non public")).toBeNull();
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: FAIL — the first new test cannot find the text, and `tsc` is not involved yet.

- [ ] **Step 3: Rename the key in all three i18n files**

`src/i18n/types.ts`, in the `// Projects app` block, replace `p_links_ph: string;` with:

```ts
  p_no_public_code: string;
  p_takeaway: string;
```

`src/i18n/fr.ts`, replace the `p_links_ph` line with:

```ts
  p_no_public_code: "Projet d'entreprise — code non public",
  p_takeaway: "Ce que j'en retiens",
```

`src/i18n/en.ts`, replace the `p_links_ph` line with:

```ts
  p_no_public_code: 'Company project — code is not public',
  p_takeaway: 'What I took from it',
```

`p_takeaway` is added here rather than in Task 3 so that `tsc` stays green between tasks: the three files must agree at every commit.

- [ ] **Step 4: Render it**

In `src/components/apps/Projects/ProjectSlide.tsx`, replace line 85:

```tsx
          {noLinks && <span className="deck-nolink">🔒 {t('p_no_public_code')}</span>}
```

- [ ] **Step 5: Style it**

In `src/styles/os.css`, after the `.deck-acts` rule:

```css
.deck-nolink { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-dim); }
```

The previous inline `fontStyle: 'italic'` is dropped: italics signalled "provisional", which is the opposite of the intent.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx src/i18n/i18n.test.ts`
Expected: PASS. The `i18n` parity test confirms all three files agree.

- [ ] **Step 7: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass. If `format:check` complains, run `npm run format` and re-check.

- [ ] **Step 8: Commit**

```bash
git add src/i18n src/components/apps/Projects/ProjectSlide.tsx src/components/apps/Projects/ProjectSlide.test.tsx src/styles/os.css
git commit -m "feat(projects): state that employer code is private, instead of 'placeholder links'"
```

---

### Task 2: The `context` paragraph

**Files:**

- Modify: `src/data/projects.ts:25-26`
- Modify: `src/components/apps/Projects/ProjectSlide.tsx:25-33`
- Test: `src/components/apps/Projects/ProjectSlide.test.tsx`

**Interfaces:**

- Consumes: nothing from Task 1.
- Produces: `Project.context?: LocalizedString`, consumed by Task 6.

- [ ] **Step 1: Write the failing test**

Append to `src/components/apps/Projects/ProjectSlide.test.tsx`:

```tsx
it('renders the context paragraph when present', () => {
  const { container } = renderSlide({
    ...base,
    context: { fr: 'Le problème à résoudre.', en: 'The problem to solve.' },
  });
  expect(screen.getByText('Le problème à résoudre.')).toBeInTheDocument();
  expect(container.querySelector('.deck-context')).toBeTruthy();
});

it('omits the context paragraph when absent', () => {
  const { container } = renderSlide(base);
  expect(container.querySelector('.deck-context')).toBeNull();
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: FAIL — `context` is not a property of `Project`, so Vitest reports a type error, and `.deck-context` does not exist.

- [ ] **Step 3: Add the field**

In `src/data/projects.ts`, inside `interface Project`, after `cover?: string;`:

```ts
  /** The problem the project existed to solve. */
  context?: LocalizedString;
```

- [ ] **Step 4: Render it**

In `src/components/apps/Projects/ProjectSlide.tsx`, inside the `deck-pitch` section, between the `deck-desc` paragraph and the `role` block:

```tsx
        {project.context && <p className="deck-context">{project.context[lang]}</p>}
```

- [ ] **Step 5: Style it**

In `src/styles/os.css`, after the `.deck-desc` rule:

```css
.deck-context { font-size: 13px; line-height: 1.6; color: #5d6470; margin: 10px 0 0; text-wrap: pretty; }
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: PASS, both new tests.

- [ ] **Step 7: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/data/projects.ts src/components/apps/Projects/ProjectSlide.tsx src/components/apps/Projects/ProjectSlide.test.tsx src/styles/os.css
git commit -m "feat(projects): render an optional context paragraph on each slide"
```

---

### Task 3: The `takeaway` block

**Files:**

- Modify: `src/data/projects.ts`
- Modify: `src/components/apps/Projects/ProjectSlide.tsx` (after the `deck-bul` list)
- Modify: `src/styles/os.css`
- Test: `src/components/apps/Projects/ProjectSlide.test.tsx`

**Interfaces:**

- Consumes: `p_takeaway` from Task 1.
- Produces: `Project.takeaway?: LocalizedString`, consumed by Task 6.

- [ ] **Step 1: Write the failing test**

Append to `src/components/apps/Projects/ProjectSlide.test.tsx`:

```tsx
it('renders the takeaway with its label when present', () => {
  renderSlide({ ...base, takeaway: { fr: 'La leçon retenue.', en: 'The lesson learned.' } });
  expect(screen.getByText("Ce que j'en retiens")).toBeInTheDocument();
  expect(screen.getByText('La leçon retenue.')).toBeInTheDocument();
});

it('omits the takeaway block when absent', () => {
  const { container } = renderSlide(base);
  expect(container.querySelector('.deck-takeaway')).toBeNull();
  expect(screen.queryByText("Ce que j'en retiens")).toBeNull();
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: FAIL — `takeaway` is not a property of `Project`.

- [ ] **Step 3: Add the field**

In `src/data/projects.ts`, after `context?: LocalizedString;`:

```ts
  /** One sentence on what building it taught. */
  takeaway?: LocalizedString;
```

- [ ] **Step 4: Render it**

In `src/components/apps/Projects/ProjectSlide.tsx`, between the closing `</ul>` of `deck-bul` and the `{/* Stack & links */}` comment:

```tsx
      {project.takeaway && (
        <section className="deck-takeaway">
          <span className="deck-takeaway-l">{t('p_takeaway')}</span>
          <p>{project.takeaway[lang]}</p>
        </section>
      )}
```

- [ ] **Step 5: Style it**

In `src/styles/os.css`, after the `.deck-bul li` rule:

```css
.deck-takeaway { margin: 4px 20px 10px; padding: 11px 14px; border-left: 3px solid #cfe0ff; background: #f7f9fd; border-radius: 0 8px 8px 0; }
.deck-takeaway-l { display: block; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; font-size: 10px; color: #9aa3b2; margin-bottom: 5px; }
.deck-takeaway p { margin: 0; font-size: 12.5px; line-height: 1.55; color: #3a414d; text-wrap: pretty; }
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/components/apps/Projects/ProjectSlide.test.tsx`
Expected: PASS.

- [ ] **Step 7: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/data/projects.ts src/components/apps/Projects/ProjectSlide.tsx src/components/apps/Projects/ProjectSlide.test.tsx src/styles/os.css
git commit -m "feat(projects): render an optional takeaway block on each slide"
```

---

### Task 4: Stop using covers in the rail

`.deck-thumb-ico` is 34×26 px. The branch that paints it with `cover` predates any real image; a banner or a diagram at that size is mush. This is a deliberate reversal of `2026-07-09-projects-deck-design.md`, so it gets a test to stop it being "fixed" back.

**Files:**

- Modify: `src/components/apps/Projects/SlideRail.tsx:27-32`
- Test: `src/components/apps/Projects/SlideRail.test.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing. `Project.cover` remains in the type, used only by `ProjectSlide`.

- [ ] **Step 1: Write the failing test**

Append to `src/components/apps/Projects/SlideRail.test.tsx`:

```tsx
it('shows the monogram even when the project has a cover', () => {
  // Deliberate: .deck-thumb-ico is 34×26 px, where no real image is legible.
  // Covers belong to the hero only. See the 2026-07-30 spec.
  const withCover: Project = { ...mk('d', 'Delta'), cover: '/projects/delta.webp' };
  const { container } = render(
    <LangProvider>
      <SlideRail projects={[withCover]} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  const ico = container.querySelector('.deck-thumb-ico');
  expect(ico).toHaveTextContent('D');
  expect(ico?.getAttribute('style') ?? '').not.toContain('delta.webp');
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/apps/Projects/SlideRail.test.tsx`
Expected: FAIL — the icon renders no monogram and its style contains `url(/projects/delta.webp)`.

- [ ] **Step 3: Remove the branch**

In `src/components/apps/Projects/SlideRail.tsx`, replace the `deck-thumb-ico` span:

```tsx
          <span className="deck-thumb-ico" style={{ background: p.gradient }}>
            {p.monogram}
          </span>
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/components/apps/Projects/SlideRail.test.tsx`
Expected: PASS, all four tests.

- [ ] **Step 5: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/apps/Projects/SlideRail.tsx src/components/apps/Projects/SlideRail.test.tsx
git commit -m "refactor(projects): keep monograms in the rail, covers are hero-only"
```

---

### Task 5: The banner generator and the six images

No unit test drives this one: its output is judged by eye. The contract that *can* be enforced — dimensions and weight — is enforced inside `save_webp`, so the generator refuses to write a file that breaks it. Task 6 then asserts from the repository that the files exist.

**Files:**

- Create: `scripts/images/palette.py`
- Create: `scripts/images/banner.py`
- Create: `scripts/images/make_covers.py`
- Create: `scripts/images/make_og.py`
- Create: `scripts/images/README.md`
- Create: `public/projects/{ticoqos,payments,pictarine-tooling,auction,threaddump,schools}.webp`

**Interfaces:**

- Consumes: the `accent` of each project, copied into `make_covers.py`:
  `ticoqos #0a66c2`, `pictarine-tooling #2a2a2a`, `payments #635bff`, `auction #147a52`, `threaddump #c3002f`, `schools #b8860b`.
- Produces: six files at `public/projects/<id>.webp`, referenced by Task 6.

- [ ] **Step 1: Write the palette**

Create `scripts/images/palette.py`:

```python
"""Colours for the generated images, mirroring src/styles/design.css.

Kept in one place so a change to the site's palette has one place to follow.
"""

FACE = (236, 233, 216)
FACE_LIGHT = (246, 244, 236)
FACE_DARK = (214, 210, 194)
EDGE_LIGHT = (255, 255, 255)
EDGE_SOFT = (207, 202, 187)
EDGE_DARK = (138, 134, 120)
INK = (28, 28, 28)
INK_DIM = (93, 90, 79)
TB_FROM = (58, 123, 240)
TB_MID = (26, 82, 214)
TB_TO = (14, 58, 168)
GREEN = (58, 148, 71)
RED = (196, 53, 43)
AMBER = (232, 165, 43)
WHITE = (255, 255, 255)


def hex_to_rgb(value):
    """'#635bff' -> (99, 91, 255)"""
    v = value.lstrip('#')
    return tuple(int(v[i : i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    """Linear blend, t=0 gives a, t=1 gives b."""
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def shade(rgb, factor):
    """factor < 1 darkens, > 1 lightens, clamped to the byte range."""
    return tuple(max(0, min(255, round(c * factor))) for c in rgb)
```

- [ ] **Step 2: Write the canvas primitives**

Create `scripts/images/banner.py`:

```python
"""Shared drawing helpers for the project banners.

Pillow floor is 8.1: no ImageDraw.rounded_rectangle (8.2+), no Image.Resampling
(10+). Image.LANCZOS is available across 8.1 to 11.
"""

import os

from PIL import Image, ImageDraw, ImageFont

from palette import mix

WIDTH, HEIGHT = 1200, 340
MAX_BYTES = 80_000

# Tried in order; the first that exists wins. Only the placeholder needs a font.
FONT_CANDIDATES = (
    '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf',
    '/System/Library/Fonts/Supplemental/Verdana Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
)


def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(
        'No usable font found. Install DejaVu or Liberation, or add a path to '
        'FONT_CANDIDATES in scripts/images/banner.py.'
    )


def vertical_gradient(size, top, bottom):
    w, h = size
    strip = Image.new('RGB', (1, h))
    px = strip.load()
    for y in range(h):
        px[0, y] = mix(top, bottom, y / max(h - 1, 1))
    return strip.resize((w, h))


def new_banner(accent):
    """A banner-sized canvas washed from a light tint of the accent to the accent."""
    light = mix(accent, (255, 255, 255), 0.62)
    deep = mix(accent, (0, 0, 0), 0.25)
    return vertical_gradient((WIDTH, HEIGHT), light, deep)


def add_scrim(img, height=150, strength=0.68):
    """Darkens the bottom band so the component's white title stays readable.

    ProjectSlide overlays the title, year and status at the bottom-left of the
    hero, in white with a text shadow. Without this the shadow alone is not
    enough on a light motif.
    """
    band = Image.new('L', (1, height))
    px = band.load()
    for y in range(height):
        px[0, y] = round(255 * strength * (y / max(height - 1, 1)) ** 1.4)
    mask = band.resize((img.width, height))
    black = Image.new('RGB', (img.width, height), (0, 0, 0))
    img.paste(black, (0, img.height - height), mask)
    return img


def save_webp(img, path):
    """Writes the file and refuses to break the contract from the spec."""
    if img.size != (WIDTH, HEIGHT):
        raise SystemExit(f'{path}: expected {WIDTH}x{HEIGHT}, got {img.width}x{img.height}')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for quality in (86, 78, 70, 62, 54):
        img.save(path, 'WEBP', quality=quality, method=6)
        size = os.path.getsize(path)
        if size <= MAX_BYTES:
            print(f'  {path}  {img.width}x{img.height}  {size:,} bytes  q={quality}')
            return
    raise SystemExit(f'{path}: {os.path.getsize(path):,} bytes, over the {MAX_BYTES:,} budget')


def draw(img):
    return ImageDraw.Draw(img, 'RGBA')
```

- [ ] **Step 3: Write the six motifs**

Create `scripts/images/make_covers.py`:

```python
"""Draws the six project banners into public/projects/.

Run from the repository root:  python3 scripts/images/make_covers.py

No text in any banner except the placeholder: the site is bilingual, and words
baked into the file would be wrong in the other language. ProjectSlide overlays
the title, year and status itself.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from banner import HEIGHT, WIDTH, add_scrim, draw, load_font, new_banner, save_webp  # noqa: E402
from palette import hex_to_rgb, mix, shade  # noqa: E402

OUT = Path('public/projects')


def payments(accent):
    """Card silhouettes over a ledger grid, one row picked out."""
    img = new_banner(accent)
    d = draw(img)
    for y in range(60, HEIGHT - 40, 34):
        d.line([70, y, WIDTH - 70, y], fill=(255, 255, 255, 46), width=2)
    d.rectangle([70, 162, WIDTH - 70, 194], fill=(255, 255, 255, 70))
    for i, x in enumerate((150, 250, 350)):
        top = 92 + i * 16
        card = mix(accent, (255, 255, 255), 0.30 + i * 0.16)
        d.rectangle([x, top, x + 190, top + 116], fill=card + (232,))
        d.rectangle([x + 14, top + 26, x + 74, top + 42], fill=(255, 255, 255, 150))
        d.line([x + 14, top + 88, x + 130, top + 88], fill=(255, 255, 255, 120), width=3)
    return add_scrim(img)


def pictarine_tooling(accent):
    """Three window frames stacked behind one shared toolbar."""
    img = new_banner(accent)
    d = draw(img)
    for i in range(3):
        x, y = 140 + i * 54, 66 + i * 26
        w, h = 620, 190
        d.rectangle([x, y, x + w, y + h], fill=mix(accent, (255, 255, 255), 0.82) + (238,))
        d.rectangle([x, y, x + w, y + 26], fill=shade(accent, 0.85) + (255,))
        for b in range(3):
            cx = x + w - 22 - b * 20
            d.ellipse([cx - 5, y + 8, cx + 5, y + 18], fill=(255, 255, 255, 190))
        if i == 2:
            for r in range(4):
                ly = y + 50 + r * 26
                d.line([x + 24, ly, x + 24 + (300 if r % 2 else 420), ly], fill=(255, 255, 255, 170), width=6)
    return add_scrim(img)


def auction(accent):
    """Ascending bids closing on a gavel mark."""
    img = new_banner(accent)
    d = draw(img)
    for i in range(9):
        x = 120 + i * 74
        h = 40 + i * 22
        d.rectangle([x, HEIGHT - 90 - h, x + 44, HEIGHT - 90], fill=(255, 255, 255, 70 + i * 14))
    cx, cy = WIDTH - 250, 120
    d.line([cx - 70, cy + 70, cx + 60, cy - 60], fill=(255, 255, 255, 230), width=16)
    d.ellipse([cx + 30, cy - 96, cx + 104, cy - 22], fill=(255, 255, 255, 240))
    d.line([cx - 96, cy + 96, cx - 20, cy + 96], fill=(255, 255, 255, 200), width=12)
    return add_scrim(img)


def threaddump(accent):
    """Parallel threads: some running, some stalled."""
    img = new_banner(accent)
    d = draw(img)
    stalled = {1, 4, 5, 8}
    for i in range(11):
        y = 46 + i * 24
        if i in stalled:
            x = 90
            while x < WIDTH - 90:
                d.line([x, y, x + 16, y], fill=(255, 255, 255, 96), width=7)
                x += 30
            d.ellipse([WIDTH - 118, y - 9, WIDTH - 100, y + 9], fill=(255, 255, 255, 210))
        else:
            d.line([90, y, WIDTH - 130, y], fill=(255, 255, 255, 178), width=7)
    return add_scrim(img)


def schools(accent):
    """An abstract territory with located points."""
    img = new_banner(accent)
    d = draw(img)
    d.polygon(
        [(150, 250), (240, 120), (420, 74), (610, 118), (760, 86), (900, 150), (1010, 268), (820, 300), (520, 272), (300, 300)],
        fill=(255, 255, 255, 58),
    )
    for x, y in ((330, 190), (520, 150), (700, 196), (860, 214)):
        d.ellipse([x - 20, y - 20, x + 20, y + 20], fill=(255, 255, 255, 235))
        d.polygon([(x - 12, y + 14), (x + 12, y + 14), (x, y + 44)], fill=(255, 255, 255, 235))
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=shade(accent, 0.8) + (255,))
    return add_scrim(img)


def placeholder(accent):
    """Impossible to mistake for finished work. The one banner allowed words."""
    img = new_banner(shade(accent, 0.7))
    d = draw(img)
    for x in range(-HEIGHT, WIDTH + HEIGHT, 46):
        d.line([x, 0, x + HEIGHT, HEIGHT], fill=(0, 0, 0, 58), width=16)
    d.rectangle([60, 116, WIDTH - 60, 236], fill=(0, 0, 0, 150))
    d.text((WIDTH // 2, 152), 'À REMPLACER', font=load_font(46), fill=(255, 255, 255), anchor='mm')
    d.text(
        (WIDTH // 2, 204),
        'capture reelle attendue - public/projects/ticoqos.webp',
        font=load_font(21),
        fill=(255, 235, 160),
        anchor='mm',
    )
    return img


# ASCII only in the second placeholder line: the fallback fonts on a bare Linux
# box are not guaranteed to carry accented glyphs, and this text is disposable.

BANNERS = (
    ('ticoqos', '#0a66c2', placeholder),
    ('payments', '#635bff', payments),
    ('pictarine-tooling', '#2a2a2a', pictarine_tooling),
    ('auction', '#147a52', auction),
    ('threaddump', '#c3002f', threaddump),
    ('schools', '#b8860b', schools),
)


def main():
    if not Path('public').is_dir():
        raise SystemExit('Run this from the repository root.')
    print(f'Writing {len(BANNERS)} banners to {OUT}/')
    for slug, accent, motif in BANNERS:
        save_webp(motif(hex_to_rgb(accent)), str(OUT / f'{slug}.webp'))


main()
```

- [ ] **Step 4: Recover the sharing-card generator**

Create `scripts/images/make_og.py`. It reproduces `public/og-image.png`, which shipped in PR #11 from a script left outside the repository:

```python
"""Draws public/og-image.png, the 1200x630 social sharing card.

Run from the repository root:  python3 scripts/images/make_og.py

Rendered in Tahoma, which is what the app actually uses. The bundled
src/fonts/MS_Sans_Serif*.ttf are never loaded — the project declares no
@font-face — and carry no accented glyphs at all.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from banner import load_font, vertical_gradient  # noqa: E402
from palette import EDGE_DARK, EDGE_LIGHT, FACE, FACE_LIGHT, GREEN, INK, INK_DIM, TB_FROM, TB_TO  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

W, H = 1200, 630
OUT = Path('public/og-image.png')


def main():
    if not Path('public').is_dir():
        raise SystemExit('Run this from the repository root.')

    img = vertical_gradient((W, H), (86, 143, 236), (12, 48, 140))
    d = ImageDraw.Draw(img)

    wx, wy, ww, wh = 90, 96, W - 180, H - 210
    d.rectangle([wx, wy, wx + ww, wy + wh], fill=FACE, outline=EDGE_DARK, width=2)

    tb_h = 46
    img.paste(vertical_gradient((ww - 4, tb_h), TB_FROM, TB_TO), (wx + 2, wy + 2))
    d = ImageDraw.Draw(img)
    d.text((wx + 18, wy + 2 + tb_h // 2), 'TicoqOS — Backend Edition', font=load_font(20), fill=(255, 255, 255), anchor='lm')

    # Drawn, not typed: Tahoma has no ✕ or □ glyph.
    bx = wx + ww - 22
    for kind in ('close', 'max', 'min'):
        x0, y0, x1, y1 = bx - 26, wy + 12, bx, wy + 36
        d.rectangle([x0, y0, x1, y1], fill=FACE, outline=EDGE_DARK)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if kind == 'close':
            d.line([cx - 5, cy - 5, cx + 5, cy + 5], fill=INK, width=2)
            d.line([cx - 5, cy + 5, cx + 5, cy - 5], fill=INK, width=2)
        elif kind == 'max':
            d.rectangle([cx - 6, cy - 5, cx + 6, cy + 5], outline=INK, width=2)
        else:
            d.line([cx - 6, cy + 5, cx + 6, cy + 5], fill=INK, width=2)
        bx -= 32

    logo = Image.open('public/logo512.png').convert('RGBA').resize((190, 190), Image.LANCZOS)
    lx, ly = wx + 44, wy + tb_h + 52
    img.paste(logo, (lx, ly), logo)

    tx = lx + 190 + 44
    d.text((tx, ly + 14), 'Elie Treport', font=load_font(62), fill=INK)
    d.text((tx, ly + 92), 'Développeur Backend Kotlin', font=load_font(30), fill=(26, 82, 214))
    d.text((tx, ly + 140), 'Kotlin · Spring Boot · PostgreSQL · TypeScript', font=load_font(24), fill=INK_DIM)

    # Pillow 8.1 has no rounded_rectangle; compose the pill from two ellipses.
    py, pill_w, pill_h = ly + 186, 300, 40
    r = pill_h // 2
    d.ellipse([tx, py, tx + pill_h, py + pill_h], fill=FACE_LIGHT, outline=EDGE_DARK)
    d.ellipse([tx + pill_w - pill_h, py, tx + pill_w, py + pill_h], fill=FACE_LIGHT, outline=EDGE_DARK)
    d.rectangle([tx + r, py, tx + pill_w - r, py + pill_h], fill=FACE_LIGHT)
    d.line([tx + r, py, tx + pill_w - r, py], fill=EDGE_DARK)
    d.line([tx + r, py + pill_h, tx + pill_w - r, py + pill_h], fill=EDGE_DARK)
    d.ellipse([tx + 15, py + 15, tx + 25, py + 25], fill=GREEN)
    d.text((tx + 36, py + pill_h // 2), 'Ouvert aux opportunités', font=load_font(21), fill=INK, anchor='lm')

    tbar_h = 52
    img.paste(vertical_gradient((W, tbar_h), (60, 128, 240), (12, 52, 160)), (0, H - tbar_h))
    d = ImageDraw.Draw(img)
    d.rectangle([18, H - tbar_h + 9, 168, H - 11], fill=(74, 156, 78), outline=(29, 90, 40))
    d.text((93, H - tbar_h // 2), 'démarrer', font=load_font(22), fill=(255, 255, 255), anchor='mm')
    d.text((W - 26, H - tbar_h // 2), 'github.com/Tykok', font=load_font(20), fill=(226, 236, 255), anchor='rm')
    d.line([wx + 2, wy + 2, wx + ww - 2, wy + 2], fill=EDGE_LIGHT)

    img.save(OUT, optimize=True)
    print(f'  {OUT}  {img.width}x{img.height}  {OUT.stat().st_size:,} bytes')


main()
```

- [ ] **Step 5: Document the tooling**

Create `scripts/images/README.md`:

```markdown
# Image generators

One-off tools, run by hand. **Never wired into CI or the deploy path**: six files
that change almost never do not justify Python in the build.

## Prerequisites

- Python 3
- Pillow **8.1 minimum**

```bash
python3 -m pip install --user 'Pillow>=8.1'
```

The code avoids anything newer than 8.1: no `ImageDraw.rounded_rectangle` (8.2+),
no `Image.Resampling` (10+). `Image.LANCZOS` is used instead and works up to 11.

## Commands

From the repository root:

```bash
python3 scripts/images/make_covers.py   # public/projects/*.webp
python3 scripts/images/make_og.py       # public/og-image.png
```

`save_webp` refuses to write a banner that is not exactly 1200×340 or that exceeds
80 000 bytes, dropping quality in steps before giving up.

## Rules

- **No text inside a banner.** The site is bilingual: baked-in words would be wrong
  in the other language, and no `grep`, type or `i18n` parity test can catch them.
  `ProjectSlide` overlays the title, year and status itself.
- Each banner takes its colour from the project's `accent`, so the hero and the rail
  monogram agree.
- The bottom band is darkened by `add_scrim` because the component's white title sits
  there.

## Placeholders awaiting a real image

| File | Wanted |
| --- | --- |
| `public/projects/ticoqos.webp` | a real screenshot of the deployed portfolio |

Placeholders carry `À REMPLACER` across the middle. That is the one exception to the
no-text rule: it addresses whoever owns the repository, not a visitor, and it is
meant to be deleted.
```

- [ ] **Step 6: Generate the images**

Run:

```bash
python3 scripts/images/make_covers.py
python3 scripts/images/make_og.py
```

Expected: seven lines of output, each reporting `1200x340` (or `1200x630` for the
card) and a byte count under the budget. A `SystemExit` about dimensions or budget
means a motif changed the canvas size — fix the motif, not the check.

- [ ] **Step 7: Look at them**

Open all six and judge them by eye. Confirm specifically:

- the bottom-left is dark enough that white text over it would read
- no banner contains a word, other than `ticoqos.webp`
- the placeholder is impossible to mistake for finished work

Regenerate after any adjustment. No automated test replaces this step.

- [ ] **Step 8: Commit**

```bash
git add scripts/images public/projects public/og-image.png
git commit -m "feat(images): commit the banner generator and the six project banners"
```

---

### Task 6: Fill the projects, and assert the assets exist

**Files:**

- Modify: `src/api/mock/projects.mock.ts`
- Test: `src/api/projects.test.ts`

**Interfaces:**

- Consumes: `Project.context` and `Project.takeaway` from Tasks 2 and 3; the six files from Task 5.
- Produces: nothing.

- [ ] **Step 1: Write the failing tests**

In `src/api/projects.test.ts`, add these imports at the top, keeping the import order Prettier and `simple-import-sort` expect:

```ts
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
```

Then extend the `mockProjects` describe block:

```ts
it('gives every project a context and a takeaway, in both languages', () => {
  mockProjects.forEach((p) => {
    expect(p.context?.fr.trim()).toBeTruthy();
    expect(p.context?.en.trim()).toBeTruthy();
    expect(p.takeaway?.fr.trim()).toBeTruthy();
    expect(p.takeaway?.en.trim()).toBeTruthy();
  });
});

it('points every cover at a WebP under /projects/', () => {
  mockProjects.forEach((p) => {
    expect(p.cover).toMatch(/^\/projects\/[a-z0-9-]+\.webp$/);
  });
});

describe('cover files on disk', () => {
  // The most valuable assertion here: a typo or a forgotten export produces a
  // broken hero in production and nothing else notices.
  const publicDir = resolve(__dirname, '..', '..', 'public');

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s has its file', (_id, cover) => {
    expect(existsSync(resolve(publicDir, String(cover).replace(/^\//, '')))).toBe(true);
  });

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s stays under 80 kB', (_id, cover) => {
    const bytes = statSync(resolve(publicDir, String(cover).replace(/^\//, ''))).size;
    expect(bytes).toBeLessThanOrEqual(80_000);
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/api/projects.test.ts`
Expected: FAIL — no project has `cover`, `context` or `takeaway` yet.

- [ ] **Step 3: Fill the six projects**

Every string below is a draft in Elie's voice. None contains a metric. Each states a
problem and a lesson in the first person, which is an interpretation of the LinkedIn
profile rather than something quoted from it — so they need his read-through before
this branch merges, and any of them is a one-line correction.

In `src/api/mock/projects.mock.ts`, add `cover`, `context` and `takeaway` to each entry. Place `cover` after `gradient`, and `context` / `takeaway` after `desc`.

`ticoqos`:

```ts
    cover: '/projects/ticoqos.webp',
    context: {
      fr: "Un CV en PDF ne montre pas comment quelqu'un construit. Ce portfolio est l'inverse d'une plaquette : un système d'exploitation jouable, où chaque fenêtre est une app réelle avec son état, son clavier et ses cas limites.",
      en: 'A PDF résumé shows nothing about how someone builds. This portfolio is the opposite of a brochure: a playable operating system where every window is a real app with its own state, keyboard handling and edge cases.',
    },
    takeaway: {
      fr: "Le gestionnaire de fenêtres a été la partie facile. Le vrai travail a été de garder deux langues, cinq thèmes et une douzaine d'apps cohérents sans dupliquer une seule chaîne.",
      en: 'The window manager was the easy part. The real work was keeping two languages, five themes and a dozen apps consistent without duplicating a single string.',
    },
```

`pictarine-tooling`:

```ts
    cover: '/projects/pictarine-tooling.webp',
    context: {
      fr: 'Les équipes produit, design, data et front avaient chacune leurs manipulations manuelles pour interroger et corriger les données. Le même besoin, résolu six fois, jamais documenté.',
      en: 'Product, design, data and front teams each had their own manual routines to inspect and fix data. The same need, solved six times over, never written down.',
    },
    takeaway: {
      fr: "Un outil interne se juge à son taux d'adoption, pas à sa stack. Ce qui a fait la différence, c'est de partir des gestes que les équipes faisaient déjà plutôt que de leur proposer un modèle nouveau.",
      en: 'An internal tool is judged by adoption, not by its stack. What made the difference was starting from what the teams already did rather than offering them a new model.',
    },
```

`payments`:

```ts
    cover: '/projects/payments.webp',
    context: {
      fr: "Le paiement et la gestion de compte touchent à la fois l'application, la facturation et les outils marketing. Chaque évolution devait traverser ces trois domaines sans casser les commandes en cours.",
      en: 'Payments and account management touch the app, the billing side and the marketing tools at once. Every change had to cross all three without breaking orders already in flight.',
    },
    takeaway: {
      fr: "Sur un flux qui manipule de l'argent, la partie difficile n'est pas l'appel à l'API de paiement : c'est de rendre chaque étape rejouable sans double débit.",
      en: 'On a flow that moves money, the hard part is not the call to the payment API: it is making every step replayable without charging twice.',
    },
```

`auction`:

```ts
    cover: '/projects/auction.webp',
    context: {
      fr: 'Une vente aux enchères a une contrainte que les autres applications web ignorent : à la seconde de clôture, un seul ordre est valide, et il doit le rester même si deux personnes cliquent en même temps.',
      en: 'An auction has a constraint most web applications never face: at the closing second exactly one bid is valid, and it has to stay valid even when two people click at once.',
    },
    takeaway: {
      fr: "C'est là que j'ai compris qu'une règle métier écrite dans le code applicatif ne tient pas : les garanties qui comptent doivent être posées dans la base.",
      en: 'That is where I learned a business rule living in application code does not hold: the guarantees that matter belong in the database.',
    },
```

`threaddump`:

```ts
    cover: '/projects/threaddump.webp',
    context: {
      fr: "Diagnostiquer un blocage en production revenait à lire des milliers de lignes de thread dump à l'œil, dans l'urgence, sans savoir quels threads comptaient.",
      en: 'Diagnosing a production stall meant reading thousands of lines of thread dump by eye, under pressure, with no idea which threads mattered.',
    },
    takeaway: {
      fr: "Mon premier vrai contact avec l'observabilité : la donnée existait déjà, elle était simplement illisible. Transformer et trier valait mieux que collecter davantage.",
      en: 'My first real brush with observability: the data already existed, it was just unreadable. Transforming and sorting beat collecting more.',
    },
```

`schools`:

```ts
    cover: '/projects/schools.webp',
    context: {
      fr: "Les établissements d'un territoire étaient répartis dans des fichiers sans référentiel commun. La demande était une carte ; le travail réel était de définir ce qu'était un établissement.",
      en: 'The schools of a territory were spread across files with no shared reference. The request was a map; the real work was defining what a school was.',
    },
    takeaway: {
      fr: "Ma première mission où la modélisation a pris plus de temps que le code. Le recueil des besoins n'était pas une formalité avant le développement : c'était le développement.",
      en: 'My first assignment where modelling took longer than coding. Requirements gathering was not a formality before the build: it was the build.',
    },
```

- [ ] **Step 4: Fix the `ticoqos` links**

Still in `src/api/mock/projects.mock.ts`, `ticoqos` points at the GitHub *profile* rather than the repository, and has no demo. Replace its two link lines:

```ts
    repo: 'https://github.com/Tykok/Portfolio',
    demo: 'https://tykok.fr',
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/api/projects.test.ts`
Expected: PASS, including the twelve generated file assertions.

- [ ] **Step 6: Run every gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit`
Expected: all pass.

- [ ] **Step 7: See it in the real app**

Run: `npm run dev`, open the Projects app, and step through all six slides.
Confirm: each hero shows its banner, the white title reads against it, `context` and
the takeaway block appear, five slides state that the code is private, and `ticoqos`
shows two working buttons.

- [ ] **Step 8: Commit**

```bash
git add src/api/mock/projects.mock.ts src/api/projects.test.ts
git commit -m "feat(projects): give every project a context, a takeaway and a banner"
```

---

## Verification

After Task 6, from a clean checkout of the branch:

```bash
npm ci
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run audit
```

Expected: all six pass. Test count rises from 74 to roughly 92: two per new rendering
case, one for the rail, and fourteen in `projects.test.ts`.

## Out of scope

Carried by later specs, agreed during design:

1. **Architecture diagrams** in their own `deck-arch` section. The hero is a 3.5:1
   band with white text on it; a diagram there is illegible.
2. **CV and browser page** — a summary sentence per role, a fuller `PortfolioPage`.
3. **OS personality** — boot, login, terminal and mascot copy.
