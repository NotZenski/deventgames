#!/usr/bin/env python3
"""Build favicon.png and apple-touch-icon.png from the transparent assets/logo.png.

Usage: python3 scripts/make_icons.py
Keep TILE_COLOR in sync with .logo-tile in styles.css.
"""
import pathlib

from PIL import Image, ImageDraw

TILE_COLOR = (20, 20, 28, 255)
ASSETS = pathlib.Path(__file__).resolve().parent.parent / "assets"


def tile(size, radius_ratio):
    logo = Image.open(ASSETS / "logo.png").convert("RGBA")
    big = size * 4
    canvas = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).rounded_rectangle(
        (0, 0, big - 1, big - 1), radius=int(big * radius_ratio), fill=TILE_COLOR
    )
    canvas.alpha_composite(logo.resize((big, big), Image.LANCZOS))
    return canvas.resize((size, size), Image.LANCZOS)


tile(64, 0.22).save(ASSETS / "favicon.png")
# iOS rounds home-screen icon corners itself, so this one stays square.
tile(180, 0).save(ASSETS / "apple-touch-icon.png")
print("Wrote favicon.png and apple-touch-icon.png")
