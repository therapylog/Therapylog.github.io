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
const CLASSES = ['aq', 'oil', 'oral', 'susp', 'topical'];
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
  /* Kits ship ten vials. Someone who reads the 28-day window as applying to the
     whole kit throws away nine good vials; someone who reads it the other way
     keeps using a vial three months past. Both are worth one sentence. */
  t('aq rule separates the mixed vial from the sealed ones in a kit',
    /kit/i.test(STORE.classes.aq.after) && /sealed/i.test(STORE.classes.aq.after));
  /* Topicals are mostly compounded here, and a pharmacy beyond-use date beats
     any general shelf life we could state. */
  t('topical rule defers to the compounded beyond-use date',
    /beyond-use/i.test(STORE.classes.topical.before));
  t('topical rule names heat and sun as the failure mode',
    /sun/i.test(STORE.classes.topical.avoid) && /heat|glovebox|windowsill/i.test(STORE.classes.topical.avoid));
  t('a caveat points at the supplier insert', /insert|COA/i.test(STORE.caveat || ''));
  t('review state is explicit', typeof STORE.reviewed === 'boolean', 'reviewed=' + STORE.reviewed);
  t('overrides table exists (may be empty)', !!STORE.overrides && typeof STORE.overrides === 'object');
  /* Any override must be complete enough to actually replace a class rule. */
  Object.keys(STORE.overrides || {}).forEach(id => {
    const o = STORE.overrides[id];
    t(`override ${id} is usable`, !!(o.label && o.before && o.after));
    /* An override that declares a medium drives the row labels, so it has to
       name a class the renderer knows. */
    t(`override ${id} declares a known medium or none`,
      !o.medium || CLASSES.includes(o.medium), String(o.medium));
  });

  /* Larazotide ships as a lyophilized powder but is swallowed, so it must keep
     the powder handling and drop the injection framing. Both halves matter: a
     reader who treats it as a shot risks an unnecessary sterile procedure, and
     one who ignores the powder rule stores a peptide on a shelf. */
  const lz = (STORE.overrides || {}).larazotide;
  t('larazotide has a compound-specific rule', !!lz);
  if (lz) {
    t('larazotide keeps the reconstituted use-by window', /28/.test(lz.after));
    t('larazotide is described as taken orally, not injected',
      /oral/i.test(lz.label) && /swallow|orally/i.test(lz.after));
    t('larazotide keeps cold storage for the sealed powder',
      /refrigerat|2\u20138|frozen/i.test(lz.before));
    t('larazotide warns against freezing once mixed', /freez/i.test(lz.avoid));
  }
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
  ...Object.keys(FORM),
  ...Object.keys((STORE && STORE.overrides) || {})
]);
const missing = ids.filter(i => !covered.has(i));
const pct = Math.round((ids.length - missing.length) / ids.length * 100);
t('storage covers most of the encyclopedia', pct >= 70, `${ids.length - missing.length}/${ids.length} (${pct}%)`);

/* Formulations must be ones we have a rule for, or the block renders blank. */
const badForm = Object.entries(FORM).filter(([, v]) => !CLASSES.includes(v));
t('every TL_FORM value maps to a real class', badForm.length === 0, JSON.stringify(badForm));
/* Formulations the owner confirmed from what the gray market actually sells —
   pinned so a later edit cannot quietly drop them back to "no guidance". */
[['ss31', 'aq'], ['argireline', 'topical'], ['estriol', 'topical']].forEach(([id, want]) => {
  t(`${id} resolves to the ${want} rule`, FORM[id] === want, 'got ' + FORM[id]);
});

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
