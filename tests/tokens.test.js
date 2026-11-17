/* The design tokens (src/ui/tokens.css): every token the handoff lists, in
 * both themes, with the handoff's values, and the colour pairs the screens
 * use holding WCAG 2 AA contrast.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse, over, contrast } = require('./helpers/color');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui', 'tokens.css'), 'utf8');
function block(selector) {
  const i = CSS.indexOf(selector + '{');
  assert.ok(i >= 0, 'tokens.css has no ' + selector + ' block');
  const out = {};
  CSS.slice(i, CSS.indexOf('}', i)).replace(/--([a-z0-9-]+):([^;]+);/g, (_, k, v) => { out[k] = v.trim(); });
  return out;
}
const THEMES = { dark: block(':root,.ds-dark'), light: block('body.light-mode,.ds-light') };

/* The handoff's table, README "Design tokens". Light warn is the one value
   changed, and why is in tokens.css. */
const SPEC = {
  dark: {
    bg: '#161826', surface: '#232532', text: '#e9e9ed', accent: '#4ade9a',
    'neutral-100': '#f3f5fe', 'neutral-500': '#9397ab', 'neutral-900': '#292b31',
    'accent-300': 'oklch(0.88 0.10 158)', 'accent-800': 'oklch(0.36 0.07 158)',
    danger: 'oklch(0.74 0.13 22)', warn: 'oklch(0.82 0.11 80)'
  },
  light: {
    bg: '#e4e7f5', surface: '#f3f5fe', text: '#161826', accent: 'oklch(0.47 0.12 158)',
    'neutral-100': '#161826', 'neutral-500': '#75798c', 'neutral-900': '#d9dcec',
    'accent-300': 'oklch(0.37 0.09 158)', 'accent-800': 'oklch(0.87 0.07 158)',
    danger: 'oklch(0.52 0.17 25)', warn: 'oklch(0.52 0.12 70)'
  }
};

const NAMES = ['bg', 'surface', 'text', 'accent', 'danger', 'warn']
  .concat([100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => 'neutral-' + n))
  .concat([100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => 'accent-' + n));

for (const theme of ['dark', 'light']) {
  test(`${theme}: every colour token is defined and parses`, () => {
    for (const n of NAMES) {
      const v = THEMES[theme]['color-' + n];
      assert.ok(v, `--color-${n} is missing`);
      assert.doesNotThrow(() => parse(v), `--color-${n}: ${v}`);
    }
    for (const s of ['sm', 'md', 'lg']) assert.ok(THEMES[theme]['shadow-' + s], `--shadow-${s} is missing`);
  });

  test(`${theme}: the values are the handoff's`, () => {
    for (const [k, v] of Object.entries(SPEC[theme])) assert.equal(THEMES[theme]['color-' + k], v, k);
  });
}

test('derived tokens are declared in every theme scope, not inherited from :root', () => {
  /* A custom property that uses var() is resolved where it is declared, so one
     declared only on :root would carry dark values into a light subtree. */
  const bare = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const sel = bare.match(/([^{}]+)\{[^}]*--color-divider:/)[1].trim();
  for (const s of [':root', '.ds-dark', '.ds-light', 'body.light-mode']) assert.ok(sel.split(',').includes(s), `${s} does not redeclare the derived tokens`);
  assert.match(CSS, /--color-muted:color-mix\(in srgb,var\(--color-text\) 66%,transparent\)/);
});

/* [what, foreground, background, minimum]. Text needs 4.5:1, large text,
   icons and the parts of a control that identify it need 3:1 (WCAG 2.2 1.4.3
   and 1.4.11). */
function pairs(t) {
  const P = (k) => parse(t['color-' + k]);
  const bg = P('bg'), sf = P('surface'), tx = P('text');
  const muted = (g) => over(tx, 0.66, g);
  return [
    ['text on the ground', tx, bg, 4.5], ['text on a surface', tx, sf, 4.5],
    ['secondary text on the ground', muted(bg), bg, 4.5], ['secondary text on a surface', muted(sf), sf, 4.5],
    ['accent text on the ground', P('accent'), bg, 4.5], ['accent text on a surface', P('accent'), sf, 4.5],
    ['section label', P('accent-300'), bg, 4.5],
    ['danger text on the ground', P('danger'), bg, 4.5], ['danger text on a surface', P('danger'), sf, 4.5],
    ['warn text on the ground', P('warn'), bg, 4.5], ['warn text on a surface', P('warn'), sf, 4.5],
    ['accent tag', P('accent-100'), P('accent-800'), 4.5], ['neutral tag', P('neutral-100'), P('neutral-800'), 4.5],
    ['filter chip', P('neutral-300'), bg, 4.5],
    ['selected segment', tx, over(P('accent'), 0.14, sf), 4.5],
    ['row caret', P('neutral-500'), bg, 3], ['row icon', P('neutral-400'), bg, 3],
    ['the knob of a toggle that is off', P('neutral-500'), bg, 3],
    ['accent outline of a control', P('accent'), bg, 3]
  ];
}

for (const theme of ['dark', 'light']) {
  test(`${theme}: every colour pair the screens use meets WCAG AA`, () => {
    const low = pairs(THEMES[theme]).map(([what, a, b, min]) => [what, contrast(a, b), min])
      .filter(([, r, min]) => r < min).map(([what, r, min]) => `${what} ${r.toFixed(2)} (needs ${min})`);
    assert.deepEqual(low, []);
  });
}

test('light: the off toggle\'s track is faint, and its knob is what carries the contrast', () => {
  /* Known and accepted: the handoff's neutral-600 outline is 2.35:1 on the
     light ground. The knob, neutral-500, is 3.5:1, and the knob is what shows
     both that there is a switch and which way it is set. If the knob ever
     drops below 3:1, this fails. */
  const t = THEMES.light, bg = parse(t['color-bg']);
  assert.ok(contrast(parse(t['color-neutral-600']), bg) < 3);
  assert.ok(contrast(parse(t['color-neutral-500']), bg) >= 3);
});

test('the colour helper agrees with known WCAG values', () => {
  assert.equal(contrast(parse('#000000'), parse('#ffffff')).toFixed(2), '21.00');
  assert.equal(contrast(parse('#777777'), parse('#ffffff')).toFixed(2), '4.48');
  /* oklch(0.627955 0.257683 29.2339) is CSS's pure red. */
  const red = parse('oklch(0.627955 0.257683 29.2339)').map((c) => Math.round(c * 255));
  assert.deepEqual(red, [255, 0, 0]);
});
