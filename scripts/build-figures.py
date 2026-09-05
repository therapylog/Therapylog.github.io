#!/usr/bin/env python3
"""Regenerate assets/figures/*.png from the source artwork in assets/.

The source files are JPEGs of a labelled anatomy chart: two figures per file on
white, with muscle names floating beside them. The app needs four separate
figures, no text, transparent background, and one channel a CSS mask can drive
so the artwork recolours with the theme rather than shipping a second copy for
light mode.

Output is committed. This is a record of how it was made, not a CI step — the
source art changes about never. Re-run by hand if it is replaced:

    pip install Pillow numpy && python3 scripts/build-figures.py

The interesting part is isolating the figure. A crop rectangle cannot do it: the
labels sit beside the figures at varying distances, and a rectangle tight enough
to exclude them clips the hands. Keeping the largest 4-connected dark component
drops every glyph regardless of where it sits.
"""
from PIL import Image
import numpy as np, os
from collections import deque

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'figures')

# Generous windows around each figure — the component pass does the real work,
# so these only need to contain the figure and exclude the opposite one.
# Windows are deliberately GENEROUS — wide enough to contain the whole figure
# including the fingers, and to sweep up some label text along the way. The
# component pass removes the labels, so the only job here is to separate the two
# figures from each other. Tight windows are the trap: the first pass used them
# and silently amputated the hands, because the fingers are drawn in light line
# work that sits further out than the dense torso columns suggest.
SRC = {
    'male':   ('assets/male figure.jpg',   [(0, 462), (468, 1023)]),
    'female': ('assets/female figure.jpg', [(0, 530), (536, 1023)]),
}
VIEWS = ['front', 'back']
# No resampling. Baking an upscale into the asset only enlarges the file and
# softens the edges; CSS scales it, and the image sharpens for free the day
# higher-resolution source art arrives.
PAD = 8


def largest_blob(mask):
    h, w = mask.shape
    seen = np.zeros((h, w), bool)
    best, best_n = None, 0
    for sy in range(0, h, 3):
        for sx in range(0, w, 3):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; cells = []
            while q:
                y, x = q.popleft(); cells.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
            if len(cells) > best_n:
                best_n, best = len(cells), cells
    out = np.zeros((h, w), bool)
    for y, x in best:
        out[y, x] = True
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    widths = {}
    for sex, (path, spans) in SRC.items():
        g = np.array(Image.open(os.path.join(ROOT, path)).convert('L')).astype(np.float32)
        for view, (x0, x1) in zip(VIEWS, spans):
            sub = g[:, x0:x1 + 1]
            keep = largest_blob(sub < 215)
            ys, xs = np.where(keep)
            crop = sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            kept = keep[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

            # Alpha from darkness. Muscle separations are LIGHTER than the body
            # in the source, so they come through at lower alpha and keep
            # reading as separations once one fill colour is masked through.
            a = np.clip((235.0 - crop) / 175.0, 0, 1)
            a[~kept] = 0.0
            a[a < 0.06] = 0.0
            rgba = np.dstack([np.full(crop.shape + (3,), 255, np.uint8),
                              (a * 255).astype(np.uint8)]).astype(np.uint8)
            img = Image.fromarray(rgba)
            widths.setdefault(sex, {})[view] = img.size
            img.save(os.path.join(OUT, f'{sex}-{view}.png'))

    # One canvas per sex so front and back register exactly when switching.
    for sex, views in widths.items():
        W = max(v[0] for v in views.values()) + PAD * 2
        H = max(v[1] for v in views.values()) + PAD * 2
        for view in VIEWS:
            p = os.path.join(OUT, f'{sex}-{view}.png')
            im = Image.open(p)
            canvas = Image.new('RGBA', (W, H), (255, 255, 255, 0))
            canvas.paste(im, ((W - im.size[0]) // 2, (H - im.size[1]) // 2), im)
            # Only alpha carries information under a mask; LA halves the bytes.
            canvas.convert('LA').save(p, optimize=True)
        print(f'{sex}: {W}x{H}')


if __name__ == '__main__':
    main()
