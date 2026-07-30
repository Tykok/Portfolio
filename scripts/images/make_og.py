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
    d.text((tx + 36, py + pill_h // 2), "À l'écoute, sans chercher", font=load_font(21), fill=INK, anchor='lm')

    tbar_h = 52
    img.paste(vertical_gradient((W, tbar_h), (60, 128, 240), (12, 52, 160)), (0, H - tbar_h))
    d = ImageDraw.Draw(img)
    d.rectangle([18, H - tbar_h + 9, 168, H - 11], fill=(74, 156, 78), outline=(29, 90, 40))
    d.text((93, H - tbar_h // 2), 'démarrer', font=load_font(22), fill=(255, 255, 255), anchor='mm')
    d.text((W - 26, H - tbar_h // 2), 'github.com/Tykok', font=load_font(20), fill=(226, 236, 255), anchor='rm')
    d.line([wx + 2, wy + 2, wx + ww - 2, wy + 2], fill=EDGE_LIGHT)

    img.save(OUT, optimize=True)
    print(f'  {OUT}  {img.width}x{img.height}  {OUT.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
