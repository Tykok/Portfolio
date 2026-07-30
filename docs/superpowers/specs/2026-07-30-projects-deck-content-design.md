# Projects Deck — Content and Visuals — Design

**Date:** 2026-07-30
**Status:** Approved
**Scope:** Fill the Projects deck with narrative copy and a hero banner per project.

## Goal

The deck built by `2026-07-09-projects-deck-design.md` is structurally finished and
substantively empty. Every project carries a one-line description of 90 to 120
characters, three technical bullets and a role. Every hero falls back to a gradient,
because `cover` is rendered by `ProjectSlide` and `SlideRail` but set by no project.
Five of six projects show *placeholder links* where a repository would go.

A reader learns which technologies were involved and nothing about what problem was
solved. This adds that, and gives each slide an image.

## Non-goals

- **No architecture diagrams.** They were wanted, and they do not fit the hero. See
  *Superseded and rejected* below.
- **No invented metrics.** The original fictional projects claimed things like
  "p99 under 40 ms" and "storage cost -35%"; those were removed when the real
  projects landed. Nothing here reintroduces a number that cannot be sourced.
- **No screenshots of employer or client software.** Five of the six projects are
  professional work at Pictarine, MecaLIFE, Cegid and Réseau Canopé. Their
  interfaces are not ours to publish.
- **No changes to the projects data source contract.** New fields are optional, so
  an API that omits them still renders.
- **No CV, browser-page or OS personality copy.** Those are separate lots, agreed
  during design and listed at the end.

## Data model

Two optional fields on `Project` in `src/data/projects.ts`:

```ts
context?: LocalizedString;   // the problem the project existed to solve
takeaway?: LocalizedString;  // what was learned from building it
```

`cover?: string` already exists and stays optional; this work fills it for all six.
The gradient remains the fallback when an API returns a project without one.

No `coverFit` field. An earlier draft had one, to let diagrams render `contain` on a
light plate. Dropping diagrams from this lot removed the need.

## Rendering

`ProjectSlide` keeps its structure. Two blocks are added and the link logic changes.

```
deck-hero       banner image + overlaid title      unchanged
deck-pitch      desc → context (new) → role
deck-bul        three bullets                      unchanged
deck-takeaway   label + one sentence               new
deck-foot       stack badges + links               link logic revised
```

`context` renders as a second paragraph inside `deck-pitch`, after `desc` and before
`role`. Both new blocks are omitted entirely when their field is absent.

`deck-foot` currently prints an italic *liens placeholder* when `repo` and `demo` are
both `'#'`, which reads as unfinished. It becomes a deliberate statement: *Projet
d'entreprise — code non public*. Nothing was forgotten; the code belongs to someone
else.

### Removal in `SlideRail`

`SlideRail` paints its thumbnail with `cover` when present. The thumbnail
(`.deck-thumb-ico`) is **34×26 px**. Any real image is unreadable at that size. The
branch is removed and the rail always shows gradient plus monogram, which is less
code than before.

## Assets

**Format:** 1200×340 WebP — the hero's true ratio, measured from
`.deck-hero { min-height: 168px }` at full slide width. A 1200×630 image would be
cropped hard by `object-fit: cover`. WebP because the content is flat and graphic:
20–40 kB where a PNG would take 150.

**No text inside the images.** Three reasons, in order of importance:

1. The site is bilingual. A banner with `Paiement & compte client` baked in would be
   wrong in English.
2. `ProjectSlide` already overlays the title, year and status, and the stack appears
   as badges in the foot. Text in the image would duplicate all of it.
3. It removes any font dependency — and with it the missing-accented-glyph problem
   hit while drawing the sharing card.

Each banner draws from the project's own `accent`, so the hero and the rail monogram
agree. A dark gradient occupies the bottom third, where the white overlaid title
sits.

**Per-project assignment**

| Project             | Visual             | Motif                                                     | Why                                          |
| ------------------- | ------------------ | --------------------------------------------------------- | -------------------------------------------- |
| `ticoqos`           | marked placeholder | —                                                         | public and ours; a real screenshot is better |
| `payments`          | illustrated banner | card silhouettes over a ledger grid, one row highlighted   | Pictarine, not publishable                   |
| `pictarine-tooling` | illustrated banner | stacked window frames sharing one toolbar                  | internal tool, not publishable               |
| `auction`           | illustrated banner | ascending bid bars closing on a gavel mark                 | MecaLIFE, not publishable                    |
| `threaddump`        | illustrated banner | parallel thread lines, some stalled, some running          | Cegid, 2019                                  |
| `schools`           | illustrated banner | abstract map contour with located pins                     | Réseau Canopé, 2020                          |

Motifs are abstract on purpose. They should read as *the kind of problem this was*
without pretending to depict a real interface.

The placeholder is deliberately loud: diagonal hatching, the project id, and
`À REMPLACER` in plain text. It is the one image allowed to contain words, precisely
so it cannot reach production unnoticed. Its text is French only, and that does not
contradict the bilingual rule above: it addresses the repository owner, not a
visitor, and it is meant to be deleted. Swapping any banner for a placeholder later
is a one-line change.

**Files**

```
public/projects/<id>.webp        referenced as cover: '/projects/payments.webp'

scripts/images/
  palette.py       the colours, in one place, mirroring design.css
  make_covers.py   the six banners
  make_og.py       recovered from a scratch directory
  README.md        prerequisites and the command
```

Absolute paths under `/projects/` work in dev and in production, where the site is
served from a domain root, and survive the eventual move to an API returning paths.

Python plus Pillow, run by hand, **never in CI**: six files that change almost never
do not justify adding Python to the build. The README records the minimum Pillow
version — the 8.1 installed locally lacks `rounded_rectangle`.

`make_og.py` is recovered rather than written. `public/og-image.png` shipped in
PR #11 from a script left in a temporary directory, so the image existed and nobody
could regenerate it. Committing the generator closes that.

**Weight:** `SlideStage` renders only the active slide, so exactly one banner is ever
requested. Loading is lazy by construction, with nothing to declare.

## Copy

`context` is one or two sentences on the problem. `takeaway` is one sentence on what
the work taught. Both come from the LinkedIn profile already used for the CV. Where a
sentence would need a figure to stand up, it is rewritten without one.

Illustrative, for `payments`:

> **context** — Le paiement et la gestion de compte touchent à la fois
> l'application, la facturation et les outils marketing. Chaque évolution devait
> traverser ces trois domaines sans casser les commandes en cours.
>
> **takeaway** — Sur un flux qui manipule de l'argent, la partie difficile n'est pas
> l'appel à l'API de paiement : c'est de rendre chaque étape rejouable sans double
> débit.

## i18n

| Key                | Change  | Note                                        |
| ------------------ | ------- | ------------------------------------------- |
| `p_links_ph`       | removed | "liens placeholder"                         |
| `p_no_public_code` | added   | replaces it with a deliberate statement     |
| `p_takeaway`       | added   | label above the takeaway sentence           |

The `fr`/`en` parity assertion in `i18n.test.ts` catches a key added to one file only,
so no new test is needed for that.

## Testing

**Updated**

- `ProjectSlide.test.tsx:66` asserts `'liens placeholder'`; it moves to the new
  wording.
- `api/projects.test.ts` extends its per-project contract block from `role` to
  `cover`, `context` and `takeaway`, each in both languages.

**Added — data**

- Every `cover` path resolves to a file that exists in `public/`. This is the most
  valuable assertion here: a typo or a forgotten export produces a broken hero in
  production and nothing else notices. Same disk-reading approach as `head.test.ts`.
- Every banner is under 80 kB, which catches an oversized PNG renamed to `.webp`.

**Added — rendering, in `ProjectSlide.test.tsx`**

- `context` renders when present; its paragraph is absent otherwise.
- the takeaway block and its label render when present; absent otherwise.
- `p_no_public_code` shows when `repo` and `demo` are both `'#'`; real buttons show
  otherwise.

**Added — rail, in `SlideRail.test.tsx`**

- the monogram is shown **even for a project that has a `cover`**. Without this,
  someone will helpfully restore the image thumbnail and the 34×26 problem returns.

**Not covered, deliberately**

- **Image dimensions.** Parsing a WebP header by hand is possible and brittle across
  encoders. 1200×340 is guaranteed by the generator, which is the only thing that
  produces these files. That is the right division of labour, not a gap.
- **Visual regression.** No test here shows the banners look good. They will be
  reviewed by eye before being committed.

## Superseded and rejected

**Supersedes** `2026-07-09-projects-deck-design.md`, which specified
*"Thumbnail = mini gradient (or cover if present) + monogram + short title"*. The
cover half of that is withdrawn: at 34×26 px it cannot work.

**Architecture diagrams were wanted and are deferred.** The hero is a 3.5:1 banner
with white text overlaid on it — a decorative surface, not a readable one. A diagram
placed there is illegible, and forcing `contain` fits an image behind overlaid text,
which looks broken. Diagrams need their own section, with room and a way to enlarge
them. That is the next lot rather than a compromise here.

**Rejected:** a gallery or carousel per project. Twelve to twenty-four assets to
draw and maintain, plus a component with keyboard handling and accessibility, for a
deck that is itself already a carousel.

**Rejected:** generating images during the build. Adds Python to the deploy path for
files that change almost never.

## Follow-up lots

Agreed during design, each with its own spec:

1. **Architecture diagrams** — a `deck-arch` section, enlargeable, one diagram per
   backend project.
2. **CV and browser page** — a summary sentence per role in `Cv`, and a fuller
   `PortfolioPage`.
3. **OS personality** — boot, login, terminal and mascot copy. Almost entirely i18n.
