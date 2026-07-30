"""Draws the six project banners into public/projects/.

Run from the repository root:  python3 scripts/images/make_covers.py

No text in any banner except the placeholder: the site is bilingual, and words
baked into the file would be wrong in the other language. ProjectSlide overlays
the title, year and status itself.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from banner import HEIGHT, WIDTH, add_scrim, draw, load_font, new_banner, save_png  # noqa: E402
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


def pokeapi_kotlin(accent):
    """Concentric wrapper plates with one typed call passing straight through."""
    img = new_banner(accent)
    d = draw(img)
    cx, cy = 420, 148
    for i, r in enumerate((152, 112, 72)):
        d.ellipse([cx - r, cy - r * 0.62, cx + r, cy + r * 0.62], outline=(255, 255, 255, 88 + i * 46), width=5)
    d.line([88, cy, WIDTH - 156, cy], fill=(255, 255, 255, 225), width=8)
    d.polygon([(WIDTH - 156, cy - 22), (WIDTH - 100, cy), (WIDTH - 156, cy + 22)], fill=(255, 255, 255, 235))
    for i in range(4):
        x = 748 + i * 86
        d.rectangle([x, cy - 58, x + 58, cy - 28], fill=(255, 255, 255, 108))
    return add_scrim(img)


def cedict(accent):
    """Columns of dictionary entries under a lens.

    No Chinese glyphs, deliberately: the fallback fonts on a bare Linux box carry
    no CJK, so PIL would draw .notdef boxes — the same failure that made the
    sharing card unusable before it moved to Tahoma.
    """
    img = new_banner(accent)
    d = draw(img)
    for col in range(6):
        x = 108 + col * 168
        for row in range(7):
            y = 40 + row * 34
            w = 94 if (col + row) % 3 else 130
            d.rectangle([x, y, x + w, y + 13], fill=(255, 255, 255, 60 + (row % 3) * 34))
    lx, ly, lr = 884, 148, 90
    d.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], outline=(255, 255, 255, 240), width=9)
    d.line([lx + 64, ly + 64, lx + 134, ly + 134], fill=(255, 255, 255, 240), width=14)
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
        'capture reelle attendue - public/projects/ticoqos.png',
        font=load_font(21),
        fill=(255, 235, 160),
        anchor='mm',
    )
    return img


# ASCII only in the second placeholder line: the fallback fonts on a bare Linux
# box are not guaranteed to carry accented glyphs, and this text is disposable.

BANNERS = (
    ('ticoqos', '#0a66c2', placeholder),
    ('pokeapi-kotlin', '#e8590c', pokeapi_kotlin),
    ('cedict', '#0e7490', cedict),
    ('payments', '#635bff', payments),
    ('pictarine-tooling', '#485563', pictarine_tooling),
    ('auction', '#147a52', auction),
    ('threaddump', '#c3002f', threaddump),
    ('schools', '#b8860b', schools),
)


def main():
    if not Path('public').is_dir():
        raise SystemExit('Run this from the repository root.')
    print(f'Writing {len(BANNERS)} banners to {OUT}/')
    for slug, accent, motif in BANNERS:
        save_png(motif(hex_to_rgb(accent)), str(OUT / f'{slug}.png'))


if __name__ == '__main__':
    main()
