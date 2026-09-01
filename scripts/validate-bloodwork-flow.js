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
  addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
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
  /* replaced per-test; the default records nothing and fails loudly */
  fetch: () => Promise.reject(new Error('no network in harness')),
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: cb => setTimeout(cb, 0),
  /* reads a canned data URL off the fake file, so the intake path is testable */
  FileReader: function () {
    this.readAsDataURL = (file) => setTimeout(() => { this.result = file._dataUrl; this.onload && this.onload(); }, 0);
  },
  /* decode always fails: exercises the passthrough branch without a real codec */
  Image: function () { Object.defineProperty(this, 'src', { set() { setTimeout(() => this.onerror && this.onerror(), 0); } }); },
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

/* ---------------------------------------------------------------------------
   6. File intake and the scan round-trip — what actually leaves the browser
   -------------------------------------------------------------------------- */
const fakeFile = (name, type, bytes, b64) => ({
  name, type, size: bytes, _dataUrl: `data:${type};base64,${b64 || 'AAAA'}`
});

async function asyncChecks() {
  const tA = async (name, fn) => {
    try { const r = await fn(); results.push([r === true ? 'PASS' : 'FAIL', name, r === true ? '' : JSON.stringify(r)]); }
    catch (e) { results.push(['ERROR', name, e.message]); }
  };

  /* a PDF and an image picked from the device in one go */
  await run(`handleLabFiles({ target: { files: [
    { name: 'panel.pdf', type: 'application/pdf', size: 120000, _dataUrl: 'data:application/pdf;base64,JVBERi0x' },
    { name: 'page2.png', type: 'image/png', size: 90000, _dataUrl: 'data:image/png;base64,iVBORw0KAA' }
  ], value: '' } })`);
  await tA('both a PDF and an image are accepted from one pick', () => run(`labFiles.length`) === 2);
  await tA('the PDF keeps its media type', () => run(`labFiles[0].mediaType`) === 'application/pdf');
  await tA('an undecodable image falls back to its original bytes', () => run(`labFiles[1].mediaType`) === 'image/png');
  await tA('a file the API cannot take is rejected, not sent',
    async () => { await run(`handleLabFiles({ target: { files: [{ name: 'scan.heic', type: 'image/heic', size: 10, _dataUrl: 'data:image/heic;base64,AAAA' }], value: '' } })`); return run(`labFiles.length`) === 2; });
  await tA('files can be removed one at a time',
    () => { run(`removeLabFile(1)`); return run(`labFiles.length`) === 1 && run(`labFiles[0].kind`) === 'pdf'; });

  /* the scan itself: capture the request, answer with a canned report */
  /* scanLabImage now asks once before the report leaves the device, so stand in
     for a user who has already answered — the gate itself is checked below. */
  run(`
  _memCache = { entries: [], proto: null, profile: { sex: 'Male', dob: '1988-04-02' } };
  localStorage.setItem('tl_ai_scan_ok', JSON.stringify({ v: 1, at: '2026-09-01T00:00:00Z' }));
  __sent = null;
  fetch = (url, init) => { __sent = JSON.parse(init.body); return Promise.resolve({ ok: true, json: () => Promise.resolve({
    content: [{ type: 'text', text: JSON.stringify({
      markers: {
        tott: { value: 20.8, unit: 'nmol/L', refLow: 8.6, refHigh: 29.0, method: 'LC/MS-MS', confidence: 'high' },
        e2:   { value: 28, unit: 'pg/mL', confidence: 'low' },
        labdate: { value: '2026-08-14', confidence: 'high' }
      },
      extras: [
        { name: 'Uric Acid', value: 5.2, unit: 'mg/dL', refLow: 3.4, refHigh: 7.0, confidence: 'high' },
        { name: 'SGPT', value: 31, unit: 'U/L', confidence: 'high' },
        { name: 'Zonulin', value: 42, unit: 'ng/mL', refLow: 0, refHigh: 40, confidence: 'low' },
        { name: 'Beta-2 Microglobulin', value: 1.8, unit: 'mg/L', confidence: 'high' }
      ]
    }) }]
  }) }); };
  `);
  await run(`scanLabImage()`);
  const sent = JSON.parse(run(`JSON.stringify(__sent)`));
  const blocks = ((sent.messages || [])[0] || {}).content || [];
  await tA('the request is a labscan', () => sent.mode === 'labscan');

  /* And the gate holds for someone who has not answered yet. A lab report
     carries the patient's name, DOB and MRN, so nothing may be uploaded before
     they have been told that and said yes. */
  run(`
  localStorage.removeItem('tl_ai_scan_ok');
  __sent = null; __consentShown = null;
  document.getElementById('ai-ctx-consent').style.display = 'none';
  `);
  await run(`scanLabImage()`);
  await tA('a first-time scan uploads nothing until the consent sheet is answered',
    () => run(`__sent`) === null);
  await tA('...and the consent sheet is what is shown instead',
    () => run(`document.getElementById('ai-ctx-consent').style.display`) === 'flex');
  /* Answering yes both records the consent and resumes the scan. */
  run(`aiCtxConsent(true)`);
  await tA('answering yes records the consent', () => !!run(`localStorage.getItem('tl_ai_scan_ok')`));
  await tA('...and the scan it interrupted then runs', () => run(`__sent`) !== null);
  await tA('a PDF is sent as a document block, not an image block',
    () => blocks.some((b) => b.type === 'document' && b.source.media_type === 'application/pdf'));
  await tA('no PDF is smuggled into an image block',
    () => !blocks.some((b) => b.type === 'image' && b.source.media_type === 'application/pdf'));
  await tA('the prompt block comes last', () => blocks[blocks.length - 1].type === 'text');
  await tA('the prompt asks for every untracked result too', () => /extras/.test(blocks[blocks.length - 1].text));
  await tA('a converted value lands in the form in canonical units',
    () => Math.abs(parseFloat(run(`document.getElementById('ll-tott').value`)) - 599.87) < 0.02);
  await tA("the lab's own range is captured for the converted marker",
    () => Math.abs(run(`labScanMeta.tott.refLo`) - 248.02) < 0.05);
  await tA('a scanned assay method fills the picker', () => run(`document.getElementById('ll-method-tott').value`) === 'lc-ms-ms');
  await tA('the collection date is filled', () => run(`document.getElementById('ll-date').value`) === '2026-08-14');
  await tA('an extra under a different name resolves to its tracked field (SGPT → ALT)',
    () => parseFloat(run(`document.getElementById('ll-alt').value`)) === 31);
  await tA('a comprehensive-panel marker lands in its own field, not in extras',
    () => parseFloat(run(`document.getElementById('ll-uricacid').value`)) === 5.2);
  await tA('genuinely untracked extras are proposed, not dropped',
    () => run(`labScanUnmapped.map(p => p.name).join('|')`) === 'Zonulin|Beta-2 Microglobulin');

  /* accepting the proposals creates real fields with the lab's range */
  run(`addScannedMarkers()`);
  await tA('accepted extras become user-defined markers', () => run(`Object.keys(getCustomMarkers()).length`) === 2);
  await tA('an accepted extra keeps its value', () => parseFloat(run(`document.getElementById('ll-cm_zonulin').value`)) === 42);
  await tA("an accepted extra keeps the lab's range", () => run(`getCustomMarkers().cm_zonulin.hi`) === 40);
  await tA('accepted extras render as form fields for next time',
    () => /Zonulin \(ng\/mL\)/.test(el('ll-custom-list').innerHTML));

  /* saving carries them, and they flag and reach the AI like any other marker */
  run(`saveBloodwork()`);
  const entry = JSON.parse(run(`JSON.stringify(gd().entries[0])`));
  await tA('a user-defined marker is saved with the panel', () => entry.labs.cm_zonulin === 42);
  await tA("its lab range is saved too", () => entry.labMeta.cm_zonulin.refHi === 40);
  await tA('a user-defined marker gets a range in the range table',
    () => run(`getAdjustedLabRanges().cm_zonulin.hi`) === 40);
  await tA('a user-defined marker flags against its own range', () => run(`labSt('cm_zonulin', 55, gd().entries[0])`) === 'bad');
  await tA('a marker with no range recorded never flags',
    () => run(`labSt('cm_beta2microglobulin', 999)`) === 'neutral');
  await tA('the newly built-in markers are saved as built-ins, not duplicated',
    () => entry.labs.uricacid === 5.2 && !('cm_uricacid' in entry.labs));
  const ctx2 = run(`getFullCtx()`);
  await tA('a user-defined marker reaches the AI context', () => /Zonulin: 42 ng\/mL/.test(ctx2));
  await tA('a newly built-in marker reaches the AI context with its own range',
    () => /Uric Acid: 5\.2 mg\/dL \| in-range \| ref 3\.4–7/.test(ctx2));
  await tA('the AI is told which markers are the user\'s own',
    () => /userDefined|entered by the user|named and recorded by the user/i.test(ctx2));
  await tA('naming a marker the app already tracks points at the built-in field',
    () => { const r = JSON.parse(run(`JSON.stringify(addCustomMarker('Hemoglobin A1c', '%', '', ''))`)); return r.builtIn === true && r.key === 'hba1c'; });

  /* The stub has no query engine, so the filter's DOM work is not covered here —
     only that it is wired up and survives being called. */
  await tA('the marker filter is callable without a live DOM',
    () => run(`document.getElementById('ll-filter').value = 'sgpt'; filterLabFields(); 'ok'`) === 'ok');
  await tA('the filter input is wired to the filter function',
    () => /id="ll-filter"[^>]*oninput="filterLabFields\(\)"/.test(html));
}

function report() {
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
console.log(`bloodwork flow OK: ${results.length} assertions — file intake, scan provenance, ` +
  'lab-range precedence, user-defined markers and the AI panel context all hold');
/* app.html schedules deferred UI work (chat memory, cost hints) that the stub has
   no reason to satisfy — stop here rather than let those timers run. */
process.exit(0);
}

asyncChecks().then(report, (e) => {
  console.error('BLOODWORK FLOW VALIDATION FAILED — the async checks threw:');
  console.error('  ✗ ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
