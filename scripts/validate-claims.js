#!/usr/bin/env node
/* The marketing pages quote counts — compounds, classifications, lab markers —
   that live in app.html. Nothing kept them in sync, and they had drifted in
   both directions: the site advertised "130+ compounds" against 124 real
   entries (an over-claim) while selling "50+ lab markers" against a registry
   of 100 (an under-claim). Over-claiming is the one that matters; a buyer who
   counts is entitled to find at least what was advertised.

   This derives the real numbers from the app and fails if any page promises
   more than exists.

   Run: node scripts/validate-claims.js */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const results = [];
const t = (name, pass, detail) => results.push([pass, name, detail || '']);

/* ---- what the app actually contains ---- */

/* Parse the real DB the way validate-encyclopedia.js does — brace-matched and
   string-aware — rather than pattern-counting records. An earlier heuristic here
   counted only entries carrying an "aka" field and under-reported by six. */
function extractObject(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('marker not found: ' + marker);
  let i = source.indexOf('{', start), depth = 0, inStr = null, esc = false;
  for (let j = i; j < source.length; j++) {
    const c = source[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    if (c === '}') { depth--; if (!depth) return eval('(' + source.slice(i, j + 1) + ')'); }
  }
  throw new Error('unbalanced braces after ' + marker);
}
const DB = extractObject(app, 'const DB = {');
const compounds = [...new Set(DB.classes.flatMap((c) => c.drugs.map((d) => d.id)))];
const classCount = DB.classes.length;

const registry = app.indexOf('MARKER_REGISTRY');
const regBlock = registry >= 0 ? app.slice(registry, app.indexOf('\n};', registry)) : '';
const markers = new Set([...regBlock.matchAll(/^\s*"?([a-zA-Z0-9_]+)"?\s*:\s*\{/gm)].map((m) => m[1])).size;

const pkModeled = [...new Set([...app.matchAll(/"([a-z0-9_]+)":\{"hl":/g)].map((m) => m[1]))].length;

t('found the encyclopedia', compounds.length > 100, compounds.length + ' compounds, ' + classCount + ' classes');
t('found the marker registry', markers > 50, markers + ' markers');
t('found the PK table', pkModeled > 40, pkModeled + ' modeled');

const REAL = { compounds: compounds.length, markers, pkModeled, classes: classCount };

/* ---- what the pages promise ---- */

/* A claim is "120+" or "100" or "148" next to a label. Parse the number and
   treat a trailing + as "at least". */
const PAGES = ['index.html', 'download.html', 'pro.html', 'guide.html',
               'support.html', 'providers/index.html', 'providers/apply.html'];

const LABELS = [
  { re: /([0-9]+)\s*\+?\s*<\/div><div class="[a-z-]*stat-label">Compounds(?: Covered)?</gi, key: 'compounds' },
  { re: /([0-9]+)\s*\+?\s*(?:compound(?:s)?\s+(?:encyclopedia|reference|entries))/gi, key: 'compounds' },
  { re: /([0-9]+)\s*\+?\s*lab\s+markers/gi, key: 'markers' },
  { re: /(?:across|through)\s+([0-9]+)\s+markers/gi, key: 'markers' },
  { re: /([0-9]+)\s*\+?\s*<\/div><div class="[a-z-]*stat-label">Lab Markers</gi, key: 'markers' },
  { re: /([0-9]+)\s*\+?\s*PK-Modeled/gi, key: 'pkModeled' },
  { re: /across\s+([0-9]+)\s+classifications/gi, key: 'classes' },
  { re: /([0-9]+)\s*<\/div><div class="[a-z-]*stat-label">Classifications</gi, key: 'classes' },
];

let claims = 0;
PAGES.forEach((rel) => {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) return;
  const html = fs.readFileSync(f, 'utf8');
  LABELS.forEach(({ re, key }) => {
    for (const m of html.matchAll(re)) {
      claims++;
      const n = parseInt(m[1], 10);
      t(`${rel}: claims ${n} ${key} (real ${REAL[key]})`, n <= REAL[key],
        n > REAL[key] ? `OVER-CLAIM by ${n - REAL[key]}` : '');
    }
  });
});
t('claims were actually found to check', claims >= 6, claims + ' claims');

/* The lifetime tier was retired. No public page may offer one again without a
   license path built for it — the subscription token does not cover a
   non-expiring purchase. */
['index.html', 'pro.html', 'download.html', 'support.html'].forEach((rel) => {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) return;
  const html = fs.readFileSync(f, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '');           // retirement notes are comments
  t(`${rel}: does not advertise a lifetime/one-time tier`,
    !/\b(lifetime|one-time|pay once|pay-once)\b/i.test(html),
    (html.match(/\b(lifetime|one-time|pay once|pay-once)\b/i) || [''])[0]);
});

/* Support and feedback are a deliberate selling point for a one-person
   product, not an afterthought. */
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
t('the landing page names a support contact', /hello@therapylog\.app/.test(index));
t('the landing page invites feedback', /tell me|feedback|requests from users/i.test(index));

const bad = results.filter((r) => !r[0]);
if (process.argv.includes('-v') || bad.length) {
  const pad = Math.max(...results.map((r) => r[1].length));
  results.forEach(([p, n, d]) => console.log(`${p ? '✓' : '✗'} ${n.padEnd(pad)} ${d}`));
}
if (bad.length) {
  console.error(`CLAIMS VALIDATION FAILED — ${bad.length} of ${results.length}`);
  process.exit(1);
}
console.log(`claims OK: ${results.length} assertions — ${REAL.compounds} compounds, `
  + `${REAL.markers} lab markers, ${REAL.classes} classifications, ${REAL.pkModeled} PK-modeled; no page over-claims, `
  + `no page re-advertises the retired lifetime tier`);
