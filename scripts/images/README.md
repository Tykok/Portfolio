# Image generators

One-off tools, run by hand. **Never wired into CI or the deploy path**: eight files
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
python3 scripts/images/make_covers.py   # public/projects/*.png
python3 scripts/images/make_og.py       # public/og-image.png
```

`save_png` refuses to write a banner that is not exactly 1200×340 or that exceeds
80 000 bytes.

## Rules

- **No text inside a banner.** The site is bilingual: baked-in words would be wrong
  in the other language, and no `grep`, type or `i18n` parity test can catch them.
  `ProjectSlide` overlays the title, year and status itself.
- Each banner's colour is a hex copied by hand into `make_covers.py`'s `BANNERS`
  tuple — not read from any project data at build time. No component actually
  renders `accent`; the rail's monogram tile gets its colour from `gradient` in
  the project data. If a banner is meant to match the rail, copy the value from
  `gradient` (as `pictarine-tooling` does) — nothing keeps the two in sync
  automatically, so re-check by eye after either one changes.
- The bottom band is darkened by `add_scrim` because the component's white title sits
  there.

## Placeholders awaiting a real image

| File                          | Wanted                                      |
| ----------------------------- | ------------------------------------------- |
| `public/projects/ticoqos.png` | a real screenshot of the deployed portfolio |

Placeholders carry `À REMPLACER` across the middle. That is the one exception to the
no-text rule: it addresses whoever owns the repository, not a visitor, and it is
meant to be deleted.
