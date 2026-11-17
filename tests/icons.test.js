/* The icon set (src/ui/icons.txt, src/ui/icons.css, vendor/fonts/phosphor-*).
 *
 * The icon fonts are subset to the icons the app uses, so an icon named in the
 * code but not in the list would draw as nothing. This is the check that
 * catches it.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const LIST = read('src/ui/icons.txt').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const CSS = read('src/ui/icons.css');

/* Names used in code: "ph-NAME" in a class, or tlIcon('NAME') / tlHex('NAME'),
   or an icon: 'NAME' property in a table. */
function used() {
  const files = ['src/ui', 'src/logic'].flatMap((d) => fs.readdirSync(path.join(ROOT, d))
    .filter((f) => f.endsWith('.js')).map((f) => d + '/' + f));
  const out = new Map();
  const add = (name, where) => { if (!out.has(name)) out.set(name, where); };
  for (const f of files) {
    const t = read(f);
    for (const m of t.matchAll(/\bph-([a-z0-9]+(?:-[a-z0-9]+)*)\b/g)) if (m[1] !== 'fill') add(m[1], f);
    for (const m of t.matchAll(/\btl(?:Icon|Hex)\(\s*'([a-z0-9-]+)'/g)) add(m[1], f);
    for (const m of t.matchAll(/\bicon:\s*'(?:ph-)?([a-z0-9-]+)'/g)) add(m[1], f);
  }
  return out;
}

test('the list has no duplicates and only plain names', () => {
  assert.equal(new Set(LIST).size, LIST.length);
  for (const n of LIST) assert.match(n, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('icons.css defines exactly the listed icons', () => {
  const defined = [...CSS.matchAll(/^\.ph-([a-z0-9-]+):before\{content:"\\[0-9a-f]+"\}$/gm)].map((m) => m[1]).sort();
  assert.deepEqual(defined, LIST.slice().sort());
});

test('every icon the code names is in the list', () => {
  const missing = [...used()].filter(([n]) => !LIST.includes(n)).map(([n, f]) => `${n} (${f})`);
  assert.deepEqual(missing, [], 'add these to src/ui/icons.txt and run scripts/build-icons.py');
});

test('both subset fonts and both licences are present, and the fonts are small', () => {
  for (const f of ['phosphor-regular.woff2', 'phosphor-fill.woff2']) {
    const size = fs.statSync(path.join(ROOT, 'vendor', 'fonts', f)).size;
    assert.ok(size > 1000 && size < 40000, `${f} is ${size} bytes`);
  }
  for (const f of ['Phosphor-LICENSE.txt', 'Inter-LICENSE.txt']) assert.ok(fs.existsSync(path.join(ROOT, 'vendor', 'fonts', f)), f);
  assert.match(read('vendor/fonts/Phosphor-LICENSE.txt'), /MIT License/);
  assert.match(read('vendor/fonts/Inter-LICENSE.txt'), /SIL Open Font License/);
});

test('every font the stylesheets load is in the repo and in the offline cache', () => {
  const css = read('src/ui/tokens.css') + CSS;
  const urls = [...css.matchAll(/url\("(\/vendor\/fonts\/[^"]+)"\)/g)].map((m) => m[1]);
  assert.equal(new Set(urls).size, 6);
  const sw = read('sw.js');
  for (const u of new Set(urls)) {
    assert.ok(fs.existsSync(path.join(ROOT, u)), u + ' is not in the repo');
    assert.ok(sw.includes("'" + u + "'"), u + ' is not precached by sw.js');
  }
});
