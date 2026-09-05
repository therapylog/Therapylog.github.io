#!/usr/bin/env python3
"""Regenerate assets/figures/*.png from the source artwork in assets/.

The source files are JPEGs of a labelled anatomy chart: two figures per file on
white, with muscle names floating beside them. The app needs four separate
figures, no text, transparent background, and one channel a CSS mask can drive
so the artwork recolours with the theme rather than shipping a second copy for
light mode.

Output is committed. This is a record of how it was made, not a CI step — the
source art changes about never. Re-run by hand if it is replaced:

    pip install Pillow numpy zopfli && python3 scripts/build-figures.py

The interesting part is isolating the figure. A crop rectangle cannot do it: the
labels sit beside the figures at varying distances, and a rectangle tight enough
to exclude them clips the hands. Keeping the largest 4-connected dark component
drops every glyph regardless of where it sits.
"""
from PIL import Image
import numpy as np, io, os
import zopfli.png
from collections import deque

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'figures')

# Generous windows around each figure — the component pass does the real work,
# so these only need to contain the figure and exclude the opposite one.
# One figure per file now, so there is no window to choose — the whole image is
# the window and the component pass does the rest. The earlier two-figures-per-
# file art needed hand-picked spans, and picking them too tight is what
# amputated the hands: fingers are drawn in light line work that sits further
# out than the dense torso columns suggest.
SRC = {
    'male':   {'front': 'assets/male front.jpg',   'back': 'assets/male back.jpg'},
    'female': {'front': 'assets/female front.jpg', 'back': 'assets/female back.jpg'},
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


# Alpha steps kept in the file. The mask is drawn line work, not smooth
# gradients, so quantisation contours have nothing to contour: at 32 steps the
# largest error anywhere on the body is 7/255 once the figure is scaled to the
# ~420 px it actually renders at, and it is not findable by eye at 4x that. It
# cuts the bytes by a third before compression even starts.
ALPHA_STEPS = 32


def write_mask(canvas, path):
    """Save the figure as an indexed PNG whose palette is pure alpha.

    These are CSS masks, so only the alpha channel is ever read — the colour
    comes from the element underneath. Storing them as LA spent a byte per
    pixel on a channel that is 255 everywhere. An indexed PNG spends half that:
    the pixel is a palette index, every palette entry is white, and the tRNS
    chunk holds the alpha ramp. Every browser that can decode a PNG can decode
    this one, which WebP (iOS 14+, and Capacitor 6 still targets iOS 13) cannot
    promise.

    Then zopfli, because deflate at level 9 is leaving a third of the file on
    the table for something built once and shipped inside an app bundle.
    """
    a = np.array(canvas)[:, :, 3]
    idx = np.round(a.astype(np.float32) / 255 * (ALPHA_STEPS - 1)).astype(np.uint8)
    im = Image.fromarray(idx, 'P')
    im.putpalette([255, 255, 255] * ALPHA_STEPS + [0] * (768 - 3 * ALPHA_STEPS))
    trns = bytes(int(round(i / (ALPHA_STEPS - 1) * 255)) for i in range(ALPHA_STEPS))

    buf = io.BytesIO()
    im.save(buf, format='PNG', optimize=True, compress_level=9, transparency=trns)
    with open(path, 'wb') as f:
        f.write(zopfli.png.optimize(buf.getvalue(), num_iterations=15))


def main():
    os.makedirs(OUT, exist_ok=True)
    widths = {}
    for sex, files in SRC.items():
        for view in VIEWS:
            sub = np.array(Image.open(os.path.join(ROOT, files[view]))
                           .convert('L')).astype(np.float32)
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
            write_mask(canvas, p)
        print(f'{sex}: {W}x{H}')


if __name__ == '__main__':
    main()
