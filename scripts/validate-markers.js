#!/usr/bin/env node
/*
 * Marker registry guard.
 *
 * The bloodwork tab normalizes results from three sources — manual entry, the
 * photo/PDF scanner, and (eventually) a lab API. MARKER_REGISTRY is the only
 * thing that decides what a result IS, what unit it is in, and which reference
 * range flags it. A silent mistake there is a wrong number in front of someone
 * making a dosing decision, so it is guarded like the encyclopedia is.
 *
 * This script lifts the registry block straight out of app.html (between the
 * MARKER-REGISTRY sentinels), evaluates it against the real LAB_REF/LAB_FIELDS,
 * runs the in-app validator, and then exercises resolution, unit conversion,
 * range conversion and the AI payload with known inputs.
 *
 * Run:  node scripts/validate-markers.js
 * Exit: 0 on success, 1 with a list of violations.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
const errors = [];
const fail = (msg) => errors.push(msg);

/* --- lift a literal out of app.html by bracket matching (string-aware) --- */
function extractSource(source, marker, open, close) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('marker not found: ' + marker);
  const i = source.indexOf(open, start);
  let depth = 0, inStr = null, esc = false;
  for (let j = i; j < source.length; j++) {
    const c = source[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    if (c === close) { depth--; if (!depth) return source.slice(start, j + 1); }
  }
  throw new Error('unbalanced brackets after ' + marker);
}

function extractBlock(source, startMark, endMark) {
  const a = source.indexOf(startMark);
  const b = source.indexOf(endMark, a);
  if (a < 0 || b < 0) throw new Error('registry sentinels not found — did app.html lose MARKER-REGISTRY:START/END?');
  return source.slice(a + startMark.length, b);
}

const labRefSrc = extractSource(html, 'const LAB_REF = {', '{', '}');
const labFieldsSrc = extractSource(html, 'const LAB_FIELDS = [', '[', ']');
const registrySrc = extractBlock(html, '/* MARKER-REGISTRY:START', '/* MARKER-REGISTRY:END */');

/* getAdjustedLabRanges lives elsewhere in app.html and depends on IndexedDB
   state; the registry only needs it to hand back a range table, so stub it. */
const api = new Function(`
${labRefSrc};
${labFieldsSrc};
function getAdjustedLabRanges() { return JSON.parse(JSON.stringify(LAB_REF)); }
${registrySrc.slice(registrySrc.indexOf('\n'))}
return { MARKER_REGISTRY, NON_MARKER_FIELDS, LAB_REF, LAB_FIELDS, resolveMarker,
         normalizeValue, classify, buildPanel, buildAIPayload, panelFromManualEntry,
         entryToResults, panelFromEntry, validateRegistry, getUnmappedLog, matchAssayVariant };
`)();

const { MARKER_REGISTRY, LAB_FIELDS, resolveMarker, normalizeValue, buildPanel,
        buildAIPayload, panelFromManualEntry, panelFromEntry } = api;

/* --- 1. the in-app validator: structure, namespace and optimal-band drift --- */
const verdict = api.validateRegistry();
verdict.errors.forEach(fail);

/* --- 1b. optimal bands have exactly one home (rule 4) ---
   The registry's bands are wired in from LAB_REF at load, so the runtime cannot
   diverge — but a literal `optimal:` in the registry is a second copy someone
   will later edit, and it would be silently overwritten. Catch it in source. */
const registryLiteral = extractSource(html, 'const MARKER_REGISTRY = {', '{', '}');
if (/\boptimal\s*:/.test(registryLiteral))
  fail('MARKER_REGISTRY hardcodes an `optimal:` band — bands belong in LAB_REF (olo/ohi); see docs/MARKERS.md');
if (!/MARKER_REGISTRY\[k\]\.optimal = \[ref\.olo, ref\.ohi\]/.test(registrySrc))
  fail('the LAB_REF → registry optimal-band wiring is gone; markers would lose their optimal bands');
Object.keys(api.LAB_REF).forEach((key) => {
  const ref = api.LAB_REF[key];
  const m = MARKER_REGISTRY[key];
  if (!m || !isFinite(ref.olo) || !isFinite(ref.ohi)) return;
  if (!m.optimal || m.optimal[0] !== ref.olo || m.optimal[1] !== ref.ohi)
    fail(`${key}: optimal band ${JSON.stringify(m.optimal)} does not match LAB_REF [${ref.olo}, ${ref.ohi}]`);
});

/* --- 2. resolution: key, LOINC, alias, and a hard "no" for the unknown --- */
const near = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 0.01 : tol);
function check(label, got, want) {
  if (got !== want) fail(`${label}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
}
function checkNear(label, got, want, tol) {
  if (!(typeof got === 'number' && near(got, want, tol))) fail(`${label}: expected ~${want}, got ${JSON.stringify(got)}`);
}

check('resolve by key', (resolveMarker({ key: 'e2' }) || {}).via, 'key');
check('resolve by LOINC', (resolveMarker({ loinc: '2986-8' }) || {}).key, 'tott');
check('resolve by alias', (resolveMarker({ name: 'Testosterone, Total' }) || {}).key, 'tott');
check('resolve by label', (resolveMarker({ name: 'Reverse T3' }) || {}).key, 'rt3');
check('unknown marker stays unknown', resolveMarker({ name: 'Serum Unobtainium' }), null);
check('unknown LOINC falls through to name', (resolveMarker({ loinc: '9-9', name: 'SHBG' }) || {}).key, 'shbg');

/* --- 3. unit conversion: linear, non-linear, refused, unrecognized --- */
checkNear('20.8 nmol/L Total T -> ng/dL', normalizeValue('tott', 20.8, 'nmol/L').value, 599.87);
checkNear('100 pmol/L E2 -> pg/mL', normalizeValue('e2', 100, 'pmol/L').value, 27.24);
checkNear('39 mmol/mol HbA1c -> %', normalizeValue('hba1c', 39, 'mmol/mol').value, 5.72);
checkNear('120 nmol/L vitamin D -> ng/mL', normalizeValue('vitd', 120, 'nmol/L').value, 48.07);
check('canonical unit is not "converted"', normalizeValue('tott', 600, 'ng/dL').converted, false);
check('case-insensitive unit match', normalizeValue('tott', 20.8, 'NMOL/L').converted, true);
check('missing unit is assumed canonical, and flagged', normalizeValue('tott', 600, '').unitAssumed, true);
check('Lp(a) mg/dL is refused', normalizeValue('lpa', 50, 'mg/dL').reason, 'no-valid-conversion');
check('absolute neutrophils are not a percentage', normalizeValue('neut', 4.2, 'K/uL').reason, 'no-valid-conversion');
check('unknown unit is refused', normalizeValue('tott', 600, 'furlongs').reason, 'unrecognized-unit');
check('non-numeric is refused', normalizeValue('tott', 'pending', 'ng/dL').reason, 'non-numeric');
check('censored value keeps its operator', normalizeValue('e2', '<5', 'pg/mL').censoredAs, '<5');
checkNear('censored value still yields a number', normalizeValue('e2', '<5', 'pg/mL').value, 5);

/* --- 4. the range must ride the same transform as the value --- */
const panel = buildPanel([
  { name: 'Estradiol, Sensitive', value: 100, unit: 'pmol/L', refLow: 40, refHigh: 160, method: 'lc-ms-ms' },
  { name: 'Total Testosterone', value: 20.8, unit: 'nmol/L', refLow: 8.6, refHigh: 29.0 },
  { name: 'Lipoprotein (a)', value: 50, unit: 'mg/dL' },
  { name: 'Serum Unobtainium', value: 42, unit: 'mg/dL' }
]);
const e2 = panel.recognized.e2 || {};
checkNear('E2 value converted', e2.value, 27.24);
checkNear('E2 lab range low converted', (e2.range || {}).lo, 10.9);
checkNear('E2 lab range high converted', (e2.range || {}).hi, 43.58);
check('lab range wins', e2.rangeSource, 'lab');
check('in-range against the lab range', e2.status, 'in-range');
check('assay method captured', e2.assayMethod, 'lc-ms-ms');
check('optimal band stays separate from status', (e2.optimal || {}).within, true);
check('missing assay method is flagged', (panel.recognized.tott || {}).assayUnknown, true);
check('unconvertible unit is an error, not a number', panel.errors.length, 1);
check('unconvertible marker is excluded', panel.recognized.lpa, undefined);
check('unknown marker is unmapped, not guessed', panel.unmapped.length, 1);
check('unmapped results are logged for triage', api.getUnmappedLog().length > 0, true);

/* a converted value must not be flagged against the raw lab range */
const misflag = buildPanel([{ key: 'tott', value: 20.8, unit: 'nmol/L', refLow: 8.6, refHigh: 29.0 }]);
check('converted value is not flagged out of range', (misflag.recognized.tott || {}).status, 'in-range');

/* --- 5. fallback ranges are marked as generic (rule 3) --- */
const manual = buildPanel(panelFromManualEntry(LAB_FIELDS, { tott: '450', labdate: '2026-01-02' }),
  { fallbackRefs: api.LAB_REF });
check('manual entry resolves without a lab range', (manual.recognized.tott || {}).rangeSource, 'registry-fallback');
check('fallback flagging carries a caveat', !!(manual.recognized.tott || {}).caveat, true);
check('the lab date is not treated as a marker', manual.markerCount, 1);
check('the lab date is not logged as unmapped', manual.unmapped.length, 0);

/* --- 6. AI payload: no PII, states what was not tested --- */
const scored = panelFromEntry({ labs: { tott: 450, e2: 28 }, labMeta: { e2: { method: 'sensitive' } } },
  ['tott', 'e2', 'shbg', 'psa']);
const payload = buildAIPayload(scored, { sex: 'Male', ageBand: '35-44', collectedOn: '2026-01-02' });
const flat = JSON.stringify(payload);
['dob', 'DOB', 'name', 'email', 'address'].forEach((k) => {
  if (new RegExp('"' + k + '"').test(flat)) fail(`AI payload leaks a "${k}" field`);
});
check('payload declares what was not tested',
  payload.constraints.some((c) => /NOT TESTED/.test(c) && /SHBG/.test(c) && /PSA/.test(c)), true);
check('payload forbids inferring absent markers',
  payload.constraints.some((c) => /Do not infer/.test(c)), true);
check('payload marks the generic range', payload.markers.every((m) => m.rangeSource === 'registry-fallback'), true);
check('payload flags an unknown assay method',
  (payload.markers.find((m) => m.marker === 'Total Testosterone') || {}).assayMethodUnknown, true);
check('payload passes the known assay method through',
  (payload.markers.find((m) => m.marker === 'Estradiol') || {}).assayMethod, 'sensitive');
check('optimal band is labelled non-diagnostic',
  /non-diagnostic/.test((payload.markers[0] || {}).optimalBand || ''), true);

/* --- 7. the scanner prompt has to stay in step with the registry ---
   The scan is the only chance to capture the report's own units, reference
   interval and assay method; if the prompt stops asking, the rest of the
   pipeline has nothing to honour. Each field has to appear both in the example
   JSON (so the shape is unambiguous) and in the rules (so it is actually asked
   for) — a half-removed field is how this silently regresses. */
const scanPrompt = extractBlock(html, '/* LAB-SCAN-PROMPT:START', '/* LAB-SCAN-PROMPT:END */');
const [scanExample, scanRules] = scanPrompt.split('Rules:');
if (!scanRules) fail('scanner prompt has no "Rules:" section — cannot verify what it asks for');
['unit', 'refLow', 'refHigh', 'method'].forEach((k) => {
  if (!scanExample.includes(k)) fail(`scanner prompt's example JSON no longer shows "${k}"`);
  if (scanRules && !scanRules.includes(k)) fail(`scanner prompt's rules no longer ask for "${k}"`);
});
if (!/exactly as printed|as printed on the report/i.test(scanPrompt))
  fail('scanner prompt no longer tells the model to report units verbatim (it would convert, and guess)');
if (!/NEVER convert|not convert|do not convert/i.test(scanPrompt))
  fail('scanner prompt no longer forbids the model from converting units itself');
/* every marker on the report must come back, not just the ones with form fields —
   comprehensive panels run past 100 analytes and the extras become custom markers */
if (!/"extras"/.test(scanExample) || !/extras/.test(scanRules))
  fail('scanner prompt no longer collects "extras" — results outside the tracked keys would be dropped');
if (!/LAB_FIELDS\.map/.test(scanPrompt))
  fail('scanner prompt no longer enumerates LAB_FIELDS — new form fields would never be scanned for');

/* --- 7b. file intake: PDFs are document blocks, images are image blocks ---
   A PDF sent as an image block is rejected by the API, which is exactly the bug
   this guards; and an oversized request fails after the user has waited. */
const scanFn = html.slice(html.indexOf('async function scanLabImage()'), html.indexOf('function showLabScanSuccess'));
if (!/type: 'document', source: \{ type: 'base64', media_type: 'application\/pdf'/.test(scanFn))
  fail('PDFs are no longer sent as document content blocks — the API rejects a PDF in an image block');
if (!/type: 'image', source: \{ type: 'base64', media_type: f\.mediaType/.test(scanFn))
  fail('images are no longer sent as image content blocks');
if (!/labFilesBytes\(\) > LAB_MAX_UPLOAD_BYTES/.test(scanFn))
  fail('the upload size guard is gone — an over-cap request fails only after the user waits for it');
if (!/multiple/.test(html.slice(html.indexOf('id="lab-file-input"'), html.indexOf('id="lab-file-input"') + 240)))
  fail('the file picker is no longer `multiple` — multi-page reports could not be uploaded in one go');
[['lab-camera-input', 'capture="environment"'], ['lab-file-input', 'application/pdf']].forEach(([id, needle]) => {
  const tag = html.slice(html.indexOf(`id="${id}"`), html.indexOf(`id="${id}"`) + 240);
  if (!tag.includes(needle)) fail(`input #${id} lost ${needle} — device upload/camera path broken`);
});

/* --- 8. the form has to stay in step with the registry --- */
LAB_FIELDS.forEach((f) => {
  if (f.key === 'labdate') return;
  if (f.id !== 'll-' + f.key)
    fail(`LAB_FIELDS "${f.key}" has id "${f.id}" — the scanner fills fields by "ll-" + key, so it would miss this one`);
  if (!html.includes(`id="${f.id}"`)) fail(`LAB_FIELDS "${f.key}": no input with id "${f.id}" in the markup`);
});

/* assay pickers: every option must be a variant the registry declares (rule 5) */
const pickers = [...html.matchAll(/<select id="ll-method-([a-z0-9]+)"[\s\S]*?<\/select>/g)];
const withAssay = Object.keys(MARKER_REGISTRY).filter((k) => MARKER_REGISTRY[k].assay && !MARKER_REGISTRY[k].extension);
pickers.forEach(([markup, key]) => {
  const m = MARKER_REGISTRY[key];
  if (!m) return fail(`assay picker "ll-method-${key}" has no registry entry`);
  if (!m.assay) return fail(`assay picker "ll-method-${key}" but ${key} declares no assay variants`);
  if (!/<option value="">/.test(markup)) fail(`assay picker "ll-method-${key}" has no "not stated" default`);
  [...markup.matchAll(/value="([^"]*)"/g)].map((x) => x[1]).filter(Boolean).forEach((v) => {
    if (!m.assay.variants.includes(v))
      fail(`assay picker "ll-method-${key}" offers "${v}", which is not one of ${key}'s variants (${m.assay.variants.join(', ')})`);
  });
  if (!api.matchAssayVariant(key, m.assay.variants[0]))
    fail(`matchAssayVariant cannot round-trip ${key}'s own variant "${m.assay.variants[0]}"`);
});
const pickerKeys = pickers.map(([, k]) => k);
withAssay.forEach((k) => {
  if (!pickerKeys.includes(k))
    fail(`${k} declares assay variants but the form has no ll-method-${k} picker — every panel would read assayUnknown`);
});

/* free-text method wording off a real report has to land on a declared variant */
check('LC/MS-MS wording maps to the variant', api.matchAssayVariant('tott', 'Testosterone, LC/MS-MS'), 'lc-ms-ms');
check('dialysis wording maps to the variant', api.matchAssayVariant('freet', 'Free T, equilibrium dialysis'), 'equilibrium-dialysis');
check('sensitive E2 wording maps to the variant', api.matchAssayVariant('e2', 'Estradiol, Ultrasensitive'), 'sensitive');
check('immunoassay wording maps to the variant', api.matchAssayVariant('e2', 'ECLIA immunoassay'), 'standard');
check('unrecognized wording is not guessed', api.matchAssayVariant('tott', 'in-house method 7'), null);
check('a marker with no assay variants has nothing to match', api.matchAssayVariant('shbg', 'LC/MS-MS'), null);

/* --- verdict --- */
if (errors.length) {
  console.error(`MARKER REGISTRY VALIDATION FAILED — ${errors.length} problem(s):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
const loincs = new Set(Object.values(MARKER_REGISTRY).flatMap((m) => m.loinc || []));
const aliases = Object.values(MARKER_REGISTRY).reduce((a, m) => a + 1 + (m.aliases || []).length, 0);
console.log(`marker registry OK: ${Object.keys(MARKER_REGISTRY).length} markers, ${loincs.size} LOINC codes, ` +
  `${aliases} names/aliases, ${LAB_FIELDS.length - 1} form fields covered` +
  (verdict.warnings.length ? ` — ${verdict.warnings.length} warning(s)` : ''));
verdict.warnings.forEach((w) => console.warn('  ⚠ ' + w));
