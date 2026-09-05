#!/usr/bin/env python3
"""Draw assets/figures/injection-sites.json on the figures so you can look at it.

That is the whole job. Where a zone belongs is an anatomy question — middle
third of the thigh, lateral aspect; upper outer quadrant of the buttock — and
the only way to check it is to put the marker on the drawing and look. Nothing
here scores the placement.

    pip install Pillow && python3 scripts/audit-injection-sites.py

Writes build/figure-audit/{male,female}.png (gitignored), front and back side
by side, subcutaneous zones warm and intramuscular zones cool.
"""
import json, os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
FIGS = os.path.join(ROOT, 'assets', 'figures')
OUT = os.path.join(ROOT, 'build', 'figure-audit')

INK = {'sq': ((255, 140, 60, 85), (255, 175, 105, 255)),
       'im': ((60, 205, 255, 85), (110, 225, 255, 255))}


def main():
    spec = json.load(open(os.path.join(FIGS, 'injection-sites.json')))
    os.makedirs(OUT, exist_ok=True)

    for sex, (ew, eh) in spec['figure'].items():
        tiles = []
        for view in ('front', 'back'):
            im = Image.open(os.path.join(FIGS, f'{sex}-{view}.png')).convert('LA')
            w, h = im.size
            if (w, h) != (ew, eh):
                print(f'  ! {sex}-{view} is {w}x{h}, injection-sites.json says {ew}x{eh}')
            card = Image.new('RGBA', (w, h), (11, 13, 19, 255))
            card.paste(Image.new('RGBA', (w, h), (165, 185, 212, 255)), (0, 0), im.split()[1])
            ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
            d = ImageDraw.Draw(ov)
            for s in spec['sites']:
                if s['view'] != view:
                    continue
                fill, line = INK[s['route']]
                d.ellipse([(s['x'] - s['rx']) * w, (s['y'] - s['ry']) * h,
                           (s['x'] + s['rx']) * w, (s['y'] + s['ry']) * h],
                          fill=fill, outline=line, width=2)
                d.text((s['x'] * w - 13, s['y'] * h - 4), s['id'], fill=(255, 255, 255, 235))
            tiles.append(Image.alpha_composite(card, ov))

        w, h = tiles[0].size
        sheet = Image.new('RGBA', (w * 2 + 18, h), (0, 0, 0, 255))
        sheet.paste(tiles[0], (0, 0))
        sheet.paste(tiles[1], (w + 18, 0))
        sheet.save(os.path.join(OUT, f'{sex}.png'))
        print(f'{sex}: build/figure-audit/{sex}.png')


if __name__ == '__main__':
    main()
