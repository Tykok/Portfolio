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


def save_png(img, path):
    """Writes the file and refuses to break the contract from the spec.

    PNG rather than WebP: these banners are flat, few-colour graphics, which is
    exactly what PNG compresses best — a representative one is under 4 kB, an
    order of magnitude below the budget. The installed Pillow also has no WebP
    support, so WebP would have cost a dependency to produce a heavier file.
    """
    if img.size != (WIDTH, HEIGHT):
        raise SystemExit(f'{path}: expected {WIDTH}x{HEIGHT}, got {img.width}x{img.height}')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, 'PNG', optimize=True)
    size = os.path.getsize(path)
    if size > MAX_BYTES:
        raise SystemExit(f'{path}: {size:,} bytes, over the {MAX_BYTES:,} budget')
    print(f'  {path}  {img.width}x{img.height}  {size:,} bytes')


def draw(img):
    return ImageDraw.Draw(img, 'RGBA')
