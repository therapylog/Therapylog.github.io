#!/usr/bin/env node
/*
 * Bloodwork flow guard.
 *
 * scripts/validate-markers.js proves the registry is internally sound. This
 * proves the app actually uses it: that a scanned reference range reaches the
 * saved entry, that flagging prefers the lab's own interval over ours, that a
 * corrected value drops its stale conversion, and that the AI context declares
 * units, assay method, range provenance and what was NOT tested.
 *
 * app.html is one file with no build step, so there is nothing to import — the
 * main <script> is evaluated in a vm context behind a small DOM stub, then the
 * real functions are called. If app.html starts touching a browser API the stub
 * does not have, this fails loudly and the stub needs one more line.
 *
 * Run:  node scripts/validate-bloodwork-flow.js
 * Exit: 0 when every assertion passes, 1 with the failing list.
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');
const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const main = blocks.reduce((a, b) => (b.length > a.length ? b : a), '');   // the main script

const els = new Map();
function el(id) {
  if (!els.has(id)) els.set(id, {
    id, value: '', textContent: '', innerHTML: '', src: '', className: '',
    style: { cssText: '', display: '' }, dataset: {},
    classList: { _s: new Set(), add(...c) { c.forEach(x => this._s.add(x)); }, remove(...c) { c.forEach(x => this._s.delete(x)); }, contains(c) { return this._s.has(c); } },
    getContext: () => ({}), appendChild() {}, insertBefore() {}, remove() {},
    children: [], childNodes: [], options: [], checked: false, disabled: false, scrollIntoView() {},
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    parentElement: null, focus() {}, blur() {}, closest: () => null
  });
  return els.get(id);
}
const store = new Map();
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, JSON, Math, Date, isFinite, parseFloat, parseInt,
  Promise, Set, Map, Object, Array, String, Number, RegExp, Error, Intl, encodeURIComponent, decodeURIComponent, btoa: s => Buffer.from(s).toString('base64'),
  document: {
    getElementById: el, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => el('_created_' + Math.random()), addEventListener() {},
    body: el('body'), documentElement: el('html'), hidden: false, cookie: '',
    head: el('head'), title: ''
  },
  localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  navigator: { userAgent: 'node', serviceWorker: { register: () => Promise.resolve() }, share: null },
  location: { href: 'https://therapylog.app/app', hash: '', search: '', origin: 'https://therapylog.app' },
  /* a request that never fires: openIDB() stays pending instead of logging a failure */
  indexedDB: { open: () => ({ onsuccess: null, onerror: null, onupgradeneeded: null }) },
  Chart: function () { this.destroy = () => {}; this.update = () => {}; },
  fetch: () => Promise.reject(new Error('no network in harness')),
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: cb => setTimeout(cb, 0), FileReader: function () {},
  Notification: { permission: 'default' }, alert() {}, confirm: () => true, prompt: () => null
};
sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
Chart = sandbox.Chart;
const ctx = vm.createContext(sandbox);
try {
  vm.runInContext(main, ctx, { filename: 'app.html#main' });
} catch (e) {
  console.error('BLOODWORK FLOW VALIDATION FAILED — app.html could not be evaluated in the DOM stub:');
  console.error('  ✗ ' + e.message);
  console.error("  Either app.html has a genuine load-order/syntax fault, or it now uses a browser");
  console.error('  API the stub lacks — in that case add it to `sandbox` in this file.');
  process.exit(1);
}

const run = (code) => vm.runInContext(code, ctx, { filename: 'harness-test' });
const results = [];
const t = (name, fn) => { try { const r = fn(); results.push([r === true ? 'PASS' : 'FAIL', name, r === true ? '' : JSON.stringify(r)]); } catch (e) { results.push(['ERROR', name, e.message]); } };

/* 1. flagging falls back to the generic range when there is no lab range */
t('generic range flags low Total T as bad', () => run(`labSt('tott', 250)`) === 'bad');
t('generic range flags 700 Total T as good', () => run(`labSt('tott', 700)`) === 'good');

/* 2. a lab-supplied range wins over the generic one (rule 3) */
/* 250 sits inside this lab's interval but below the optimal band: in-range, sub-optimal */
t("lab's own range overrides ours", () => run(`labSt('tott', 250, { labMeta: { tott: { refLo: 240, refHi: 950 } } })`) === 'warn');
t("a narrower lab range still flags out of range", () => run(`labSt('tott', 400, { labMeta: { tott: { refLo: 500, refHi: 1000 } } })`) === 'bad');
t("the same value is only sub-optimal against our generic range", () => run(`labSt('tott', 400)`) === 'warn');
t('range source is reported as lab', () => run(`labRangeFor('tott', { labMeta: { tott: { refLo: 240, refHi: 950 } } }).source`) === 'lab');
t('range source is reported as fallback', () => run(`labRangeFor('tott', { labMeta: {} }).source`) === 'registry-fallback');
/* a scanned marker whose report printed no interval must not read as lab-ranged:
   isFinite(null) is true, so a null bound would otherwise flag nothing ever */
t('a null lab range is not mistaken for a real one',
  () => run(`labRangeFor('tott', { labMeta: { tott: { refLo: null, refHi: null } } }).source`) === 'registry-fallback');
t('a marker scanned without a printed range still flags out of range',
  () => run(`labSt('tott', 120, { labMeta: { tott: { source: 'scan', refLo: null, refHi: null } } })`) === 'bad');
t('an unknown key has no range', () => run(`labRangeFor('nosuchmarker', null)`) === null);

/* 3. saving carries provenance through to the entry */
run(`_memCache = { entries: [], proto: null, profile: { sex: 'Male', dob: '1988-04-02' } };`);
run(`
labScanMeta = { e2: { source:'scan', value: 27.24, unit:'pmol/L', refLo: 10.9, refHi: 43.58,
                     method: 'LC/MS-MS', converted: true, convertedFrom: '100 pmol/L', censoredAs: null },
                tott: { source:'scan', value: 599.87, unit:'nmol/L', refLo: 248, refHi: 836,
                        method: null, converted: true, convertedFrom: '20.8 nmol/L', censoredAs: null } };
document.getElementById('ll-e2').value = '27.24';
document.getElementById('ll-tott').value = '640';          // user corrects the scan
document.getElementById('ll-method-tott').value = 'lc-ms-ms';
document.getElementById('ll-date').value = '2026-08-01';
saveBloodwork();
`);
const entry = JSON.parse(run(`JSON.stringify(gd().entries[0])`));
t('the entry saved', () => entry.type === 'bloodwork');
t("the lab's range is persisted", () => entry.labMeta.e2.refLo === 10.9 && entry.labMeta.e2.refHi === 43.58);
t('the reported unit is persisted', () => entry.labMeta.e2.unit === 'pmol/L');
t('the conversion is recorded', () => entry.labMeta.e2.convertedFrom === '100 pmol/L');
t('the scanned method is persisted', () => entry.labMeta.e2.method === 'LC/MS-MS');
t('the picked method wins for Total T', () => entry.labMeta.tott.method === 'lc-ms-ms');
t('a value edited after the scan drops the stale conversion', () => entry.labMeta.tott.editedAfterScan === true && entry.labMeta.tott.converted === undefined);
t('the scan meta is cleared after saving', () => run(`Object.keys(labScanMeta).length`) === 0);
t('the method picker is cleared after saving', () => run(`document.getElementById('ll-method-tott').value`) === '');

/* 4. the AI context is registry-normalized and declares what was not tested */
run(`_memCache = { proto: { name:'TRT', weeks: 12, start:'2026-06-01', meds:'Testosterone Cypionate, 120mg/wk' },
  profile: { sex:'Male', dob:'1988-04-02' },
  entries: [
    { type:'bloodwork', ts:'2026-08-01T00:00:00.000Z', labDate:'2026-08-01',
      labs: { tott: 640, e2: 27.24, hct: 52 },
      labMeta: { e2: { refLo: 10.9, refHi: 43.58, method:'sensitive', unit:'pmol/L', converted:true, convertedFrom:'100 pmol/L' } } },
    { type:'bloodwork', ts:'2026-05-01T00:00:00.000Z', labDate:'2026-05-01', labs: { tott: 410, e2: 22, psa: 0.9 } }
  ] };`);
const c = run(`getFullCtx()`);
t('the panel is labelled and counted', () => /LATEST LAB PANEL \(.*3 markers, normalized\)/.test(c));
t('the marker line carries value and unit', () => /Estradiol: 27\.24 pg\/mL/.test(c));
t("the lab's own range is marked as theirs", () => /ref 10\.9–43\.58 \(the lab's own\)/.test(c));
t('the generic range is marked generic', () => /Total Testosterone: 640 ng\/dL \| in-range \| ref .* \(generic\)/.test(c));
t('the conversion is disclosed', () => /converted from 100 pmol\/L/.test(c));
t('a known assay method is stated', () => /assay sensitive/.test(c));
t('an unknown assay method is stated', () => /assay method unknown/.test(c));
t('out-of-range hematocrit is flagged', () => /Hematocrit: 52 % \| above/.test(c));
t('markers dropped since the last panel are named as NOT TESTED', () => /NOT TESTED in this panel: PSA/.test(c));
t('the model is told not to infer absent markers', () => /Do not infer, estimate, or comment on any marker absent/.test(c));
t('the E2 assay caveat is included once', () => (c.match(/Standard E2 immunoassay is not valid/g) || []).length === 1);
t('prior panels are summarized', () => /PRIOR PANELS:[\s\S]*PSA 0\.9 ng\/mL/.test(c));
t('no date of birth leaks into the context', () => !/1988-04-02/.test(c));

/* 5. rendering the bloodwork grid with and without meta */
t('renderBW runs and shows the lab range label', () => { run(`renderBW()`); return /Your lab's ref: 10\.9-43\.58/.test(el('bw-grid').innerHTML); });
t('renderBW shows the generic label for manual markers', () => /Ref: 350-1000/.test(el('bw-grid').innerHTML));
t('renderBW shows the assay method', () => /· sensitive/.test(el('bw-grid').innerHTML));

if (process.argv.includes('-v')) {
  const pad = Math.max(...results.map((r) => r[1].length));
  results.forEach(([s, n, extra]) => console.log(`${s === 'PASS' ? '✓' : '✗'} ${n.padEnd(pad)} ${extra}`));
}
const bad = results.filter((r) => r[0] !== 'PASS');
if (bad.length) {
  console.error(`BLOODWORK FLOW VALIDATION FAILED — ${bad.length} of ${results.length} assertion(s):`);
  bad.forEach(([status, name, extra]) => console.error(`  ✗ ${name} (${status}${extra ? ': ' + extra : ''})`));
  process.exit(1);
}
console.log(`bloodwork flow OK: ${results.length} assertions — scan provenance, lab-range precedence, ` +
  'and the AI panel context all hold');
/* app.html schedules deferred UI work (chat memory, cost hints) that the stub has
   no reason to satisfy — stop here rather than let those timers run. */
process.exit(0);
