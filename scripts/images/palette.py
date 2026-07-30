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
