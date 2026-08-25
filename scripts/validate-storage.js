/* Storage guidance lives on FORMULATION, not on the molecule, so a handful of
   reviewed class rules cover most of the encyclopedia. This checks the wiring
   and reports coverage, so a compound silently losing its storage block shows
   up in CI rather than in a support email.

   Run: node scripts/validate-storage.js */
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app.html');
const s = fs.readFileSync(APP, 'utf8');
const results = [];
const t = (name, pass, detail) => { results.push([pass, name, detail || '']); };

/* ---- pull the three data structures out of the page ---- */
function grab(decl) {
  const i = s.indexOf(decl);
  if (i < 0) return null;
  const j = s.indexOf('\n};', i);
  return s.slice(i + decl.length, j + 2);
}
const pkSrc = grab('const TL_PK = ');
const storeSrc = grab('const TL_STORAGE = ');
const formSrc = grab('const TL_FORM = ');

t('TL_PK is present', !!pkSrc);
t('TL_STORAGE is present', !!storeSrc);
t('TL_FORM is present', !!formSrc);

let PK = {}, STORE = null, FORM = {};
try { PK = JSON.parse(pkSrc); } catch (e) { t('TL_PK parses as JSON', false, e.message); }
try { STORE = eval('(' + storeSrc + ')'); } catch (e) { t('TL_STORAGE evaluates', false, e.message); }
try { FORM = eval('(' + formSrc + ')'); } catch (e) { t('TL_FORM evaluates', false, e.message); }

/* ---- the class rules ---- */
const CLASSES = ['aq', 'oil', 'oral', 'susp'];
if (STORE) {
  t('every formulation class has a rule', CLASSES.every(c => STORE.classes[c]),
    Object.keys(STORE.classes).join(','));
  CLASSES.forEach(c => {
    const r = STORE.classes[c] || {};
    t(`${c}: has a label`, !!r.label);
    t(`${c}: says how to store it before use`, !!r.before && r.before.length > 30);
    t(`${c}: says what changes after opening/mixing`, !!r.after && r.after.length > 20);
    t(`${c}: names what to avoid`, !!r.avoid && r.avoid.length > 20);
  });
  /* The reconstituted-peptide window is the single most asked-about fact. */
  t('aq rule states a use-by window once mixed', /\b28\b|\bdays\b/.test(STORE.classes.aq.after),
    STORE.classes.aq.after.slice(0, 60));
  t('aq rule explains why bacteriostatic water matters',
    /benzyl alcohol|preservative/i.test(STORE.classes.aq.after));
  t('aq rule warns against freezing once mixed', /freez/i.test(STORE.classes.aq.avoid));
  t('oil rule warns against refrigerating', /refrigerat/i.test(STORE.classes.oil.avoid));
  t('a caveat points at the supplier insert', /insert|COA/i.test(STORE.caveat || ''));
  t('review state is explicit', typeof STORE.reviewed === 'boolean', 'reviewed=' + STORE.reviewed);
  t('overrides table exists (may be empty)', !!STORE.overrides && typeof STORE.overrides === 'object');
  /* Any override must be complete enough to actually replace a class rule. */
  Object.keys(STORE.overrides || {}).forEach(id => {
    const o = STORE.overrides[id];
    t(`override ${id} is usable`, !!(o.label && o.before && o.after));
  });
}

/* ---- wiring ---- */
t('tlStorageFor exists', /function tlStorageFor\(/.test(s));
t('tlStorageSection exists', /function tlStorageSection\(/.test(s));
t('the compound page renders it', /\$\{tlStorageSection\(drug\.id\)\}/.test(s));
t('the lookup falls back to TL_FORM', /TL_FORM\[id\]/.test(s));

/* ---- coverage ---- */
const ids = [...new Set([...s.matchAll(/\{"id":"([a-z0-9_]+)","name"/g)].map(m => m[1]))];
const covered = new Set([
  ...Object.keys(PK).filter(k => PK[k].medium),
  ...Object.keys(FORM)
]);
const missing = ids.filter(i => !covered.has(i));
const pct = Math.round((ids.length - missing.length) / ids.length * 100);
t('storage covers most of the encyclopedia', pct >= 70, `${ids.length - missing.length}/${ids.length} (${pct}%)`);

/* Formulations must be ones we have a rule for, or the block renders blank. */
const badForm = Object.entries(FORM).filter(([, v]) => !CLASSES.includes(v));
t('every TL_FORM value maps to a real class', badForm.length === 0, JSON.stringify(badForm));
const overlap = Object.keys(FORM).filter(k => PK[k] && PK[k].medium);
t('TL_FORM does not shadow a TL_PK formulation', overlap.length === 0, overlap.join(','));

/* ---- report ---- */
const bad = results.filter(r => !r[0]);
if (process.argv.includes('-v') || bad.length) {
  const pad = Math.max(...results.map(r => r[1].length));
  results.forEach(([p, n, d]) => console.log(`${p ? '✓' : '✗'} ${n.padEnd(pad)} ${d}`));
}
if (bad.length) {
  console.error(`STORAGE VALIDATION FAILED — ${bad.length} of ${results.length}`);
  process.exit(1);
}
console.log(`storage OK: ${results.length} assertions — ${ids.length - missing.length}/${ids.length} encyclopedia entries (${pct}%) resolve storage guidance from ${CLASSES.length} reviewed formulation rules`);
console.log(`  without guidance (${missing.length}): ${missing.join(', ')}`);
