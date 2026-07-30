"""Draws the eight project banners into public/projects/.

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


def placeholder(accent):
    """Impossible to mistake for finished work. The one banner allowed words.

    Ends with add_scrim like every other motif: ProjectSlide overlays the
    white title at the bottom-left of this banner too, so it needs the same
    guarantee. The text box above already darkens rows 116-236 on its own
    (fill alpha 150); add_scrim's curve only reaches noticeable strength past
    ~y=230 (its band starts at y=190 and ramps with an easing power, so the
    first 40px contribute very little), so the overlap stays mild rather than
    stacking into the mud finding 3 fixed elsewhere - confirmed by eye after
    regenerating.
    """
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
    return add_scrim(img)


# ASCII only in the second placeholder line: the fallback fonts on a bare Linux
# box are not guaranteed to carry accented glyphs, and this text is disposable.

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


def main():
    if not Path('public').is_dir():
        raise SystemExit('Run this from the repository root.')
    print(f'Writing {len(BANNERS)} banners to {OUT}/')
    for slug, accent, motif in BANNERS:
        save_png(motif(hex_to_rgb(accent)), str(OUT / f'{slug}.png'))


if __name__ == '__main__':
    main()
