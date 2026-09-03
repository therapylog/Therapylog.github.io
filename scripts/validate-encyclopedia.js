#!/usr/bin/env node
/*
 * Encyclopedia integrity guard.
 *
 * Validates the runtime compound database inside app.html and checks it against
 * the exported docs (docs/compounds.json, docs/COMPOUNDS.md) so the three can
 * never silently drift apart again — the failure mode this exists to prevent is
 * "docs say 130, the app ships 148."
 *
 * Run:  node scripts/validate-encyclopedia.js
 * Exit: 0 on success (prints the resolved unique count), 1 with a list of
 *       violations on failure.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
const errors = [];
const fail = (msg) => errors.push(msg);

/* --- extract `const DB = {...}` by brace matching (string-aware) --- */
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

const DB = extractObject(html, 'const DB = {');
const drugs = [];
DB.classes.forEach((c) => c.drugs.forEach((d) => drugs.push({ c, d })));
const classIds = new Set(DB.classes.map((c) => c.id));

/* --- 1. duplicate ids --- */
const idSeen = new Map();
drugs.forEach(({ c, d }) => {
  if (idSeen.has(d.id)) fail(`duplicate id "${d.id}" (${idSeen.get(d.id)} and ${c.id})`);
  else idSeen.set(d.id, c.id);
});

/* --- 2. duplicate names (lowercased, trimmed) --- */
const nameSeen = new Map();
drugs.forEach(({ c, d }) => {
  const n = String(d.name || '').toLowerCase().trim();
  if (nameSeen.has(n)) fail(`duplicate name "${d.name}" (${nameSeen.get(n)} and ${c.id})`);
  else nameSeen.set(n, c.id);
});

/* --- 3. required fields --- */
drugs.forEach(({ c, d }) => {
  ['id', 'name', 'summary'].forEach((k) => {
    if (!d[k]) fail(`${c.id}/${d.id || d.name || '?'}: missing required field "${k}"`);
  });
});
DB.classes.forEach((c) => {
  ['id', 'name', 'color', 'desc'].forEach((k) => {
    if (!c[k]) fail(`class ${c.id || c.name || '?'}: missing "${k}"`);
  });
});

/* --- 4. alsoIn must reference existing, other classes --- */
drugs.forEach(({ c, d }) => {
  (d.alsoIn || []).forEach((x) => {
    if (!classIds.has(x)) fail(`${d.id}: alsoIn references nonexistent class "${x}"`);
    if (x === c.id) fail(`${d.id}: alsoIn references its own class "${x}"`);
  });
});

/* --- 5. id format --- */
drugs.forEach(({ d }) => {
  if (!/^[a-z0-9-]+$/.test(String(d.id))) fail(`bad id format: "${d.id}"`);
});

/* --- 6. no leftover runtime-merge artifacts --- */
drugs.forEach(({ d }) => { if (d.xref) fail(`${d.id}: stale xref stub — DB must be stored deduplicated`); });

/* --- 7. drift: app.html DB vs docs/compounds.json --- */
const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'compounds.json'), 'utf8'));
const dbIds = new Set(drugs.map(({ d }) => d.id));
const jsonIds = new Set(json.flatMap((c) => c.drugs.map((d) => d.id)));
[...dbIds].filter((id) => !jsonIds.has(id)).forEach((id) => fail(`drift: "${id}" in app.html but not docs/compounds.json`));
[...jsonIds].filter((id) => !dbIds.has(id)).forEach((id) => fail(`drift: "${id}" in docs/compounds.json but not app.html`));
if (json.length !== DB.classes.length) fail(`drift: ${DB.classes.length} classes in app.html, ${json.length} in docs/compounds.json`);
// class membership must match too, not just the id set
const dbHome = new Map(); drugs.forEach(({ c, d }) => dbHome.set(d.id, c.id));
json.forEach((c) => c.drugs.forEach((d) => {
  if (dbHome.has(d.id) && dbHome.get(d.id) !== c.id) fail(`drift: "${d.id}" homed in ${dbHome.get(d.id)} (app) vs ${c.id} (json)`);
}));

/* --- 8. drift: the count stated in docs/COMPOUNDS.md --- */
const md = fs.readFileSync(path.join(ROOT, 'docs', 'COMPOUNDS.md'), 'utf8');
const mdCount = md.match(/(\d+)\s+unique compounds across\s+(\d+)\s+classifications/);
if (!mdCount) fail('docs/COMPOUNDS.md: count line not found');
else {
  if (Number(mdCount[1]) !== dbIds.size) fail(`drift: COMPOUNDS.md says ${mdCount[1]} compounds, app.html has ${dbIds.size}`);
  if (Number(mdCount[2]) !== DB.classes.length) fail(`drift: COMPOUNDS.md says ${mdCount[2]} classes, app.html has ${DB.classes.length}`);
}

/* --- 9. drift: literal "N-Compound" / "N+ compounds" marketing copy --- */
/* Public reference pages are listed here too, so a generated page that prints a
   catalog size is held to the same number. The reference pages roll out over
   several phases, so those may be absent — but a missing file in the first list
   is a failure, not a pass. A blanket existsSync skip would have quietly
   disabled this rule for every page it was written to guard. */
const RULE9_REQUIRED = ['app.html', 'index.html', 'marketing.html', 'download.html', 'pro.html'];
const RULE9_WHEN_PRESENT = ['about/index.html', 'tools/index.html', 'markers/index.html', '404.html'];
RULE9_REQUIRED.forEach((f) => {
  if (!fs.existsSync(path.join(ROOT, f))) fail(`rule 9: ${f} is missing — the count guard cannot run`);
});
[...RULE9_REQUIRED, ...RULE9_WHEN_PRESENT].forEach((f) => {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) return;
  const src = fs.readFileSync(abs, 'utf8');
  const re = /(\d+)(\+?)[- ][Cc]ompound(?!ing)/g;
  let m;
  while ((m = re.exec(src))) {
    const n = Number(m[1]);
    if (n < 40) continue; // "30-compound", dosages, etc. — only guard catalog-size claims
    const ok = m[2] === '+' ? n <= dbIds.size : n === dbIds.size;
    if (!ok) fail(`${f}: stale compound count "${m[0]}" (actual: ${dbIds.size})`);
  }
});

/* --- verdict --- */
if (errors.length) {
  console.error(`ENCYCLOPEDIA VALIDATION FAILED — ${errors.length} problem(s):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log(`encyclopedia OK: ${dbIds.size} unique compounds, ${DB.classes.length} classes, ` +
  `${drugs.reduce((a, { d }) => a + (d.alsoIn || []).length, 0)} cross-listings — app.html, compounds.json and COMPOUNDS.md agree`);
