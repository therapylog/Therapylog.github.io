/* Characterization tests: injection-site suggestion, and the level curve.
 *
 * getSiteSuggestion() is today's whole site-rotation model: a fixed list per
 * compound family, and "the first site on the list not among the last five
 * used". The redesign replaces it with a rest clock per site on a body map, and
 * migrates the nine site strings stored on medication entries. The strings are
 * pinned here because the migration maps them by exact text.
 *
 * pkCurve() and pkParseDose() draw the "levels" chart, which becomes the first
 * hero card on the new Home. The public half-life pages inline both functions
 * byte for byte (scripts/validate-public-pages.js), so they must not change
 * shape without those pages being regenerated.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same } = require('./helpers/app');

const med = (medication, site, ts) => ({ type: 'medication', ts, medication, dose: '', site, notes: '' });
/* Entries are stored newest first; these are listed that way. */
const suggest = (name, entries) => loadApp({ functions: ['getSiteSuggestion'], record: { entries, proto: null } })
  .getSiteSuggestion(name);

test('the nine site strings the dose form can store', () => {
  /* Read from the markup rather than typed in, so a renamed button fails here.
     The ninth button is labelled "Sub-Q" and stores "Sub-Q Belly". */
  const html = require('../scripts/lib/app-source.js').readApp();
  const stored = [...html.matchAll(/class="site-btn" onclick="selSite\(this,'([^']*)'\)">([^<]*)/g)]
    .map((m) => [m[1], m[2].trim()]);
  same(stored, [
    ['L Delt', 'L Delt'], ['R Delt', 'R Delt'], ['L Glute', 'L Glute'], ['R Glute', 'R Glute'],
    ['L Quad', 'L Quad'], ['R Quad', 'R Quad'], ['L Lat', 'L Lat'], ['R Lat', 'R Lat'],
    ['Sub-Q Belly', 'Sub-Q']
  ]);
});

test('no suggestion until the compound has a logged dose with a site', () => {
  assert.equal(suggest('BPC-157', []), null);
  assert.equal(suggest('BPC-157', [med('BPC-157', '', '2026-03-03T08:00:00.000Z')]), null);
  assert.equal(suggest('BPC-157', [med('Ipamorelin', 'L Delt', '2026-03-03T08:00:00.000Z')]), null);
});

test('it suggests the first site on the compound\'s list that the last five doses did not use', () => {
  same(suggest('Testosterone Cypionate', [
    med('Testosterone Cypionate', 'R Delt', '2026-03-03T08:00:00.000Z'),
    med('Testosterone Cypionate', 'L Delt', '2026-02-27T08:00:00.000Z'),
  ]), { lastSite: 'R Delt', suggest: 'L Glute' });
});

test('anything with "test" in its name rotates through delts, glutes and quads', () => {
  const one = [med('Test E', 'L Delt', '2026-03-03T08:00:00.000Z')];
  assert.equal(suggest('Test E', one).suggest, 'R Delt');
});

test('every other compound rotates through belly, delts and lats', () => {
  const one = [med('BPC-157', 'Sub-Q Belly', '2026-03-03T08:00:00.000Z')];
  assert.equal(suggest('BPC-157', one).suggest, 'L Delt');
});

test('"test" is matched as a word, so a name that merely contains the letters keeps the subcutaneous list', () => {
  /* The check used to be includes('test'), so "Contest Prep Blend" was sent
     to the glutes and quads. */
  const one = [med('Contest Prep Blend', 'Sub-Q Belly', '2026-03-03T08:00:00.000Z')];
  assert.equal(suggest('Contest Prep Blend', one).suggest, 'L Delt');
  const two = [med('Contest Prep Blend', 'L Delt', '2026-03-03T08:00:00.000Z'),
               med('Contest Prep Blend', 'R Delt', '2026-03-02T08:00:00.000Z')];
  assert.equal(suggest('Contest Prep Blend', two).suggest, 'Sub-Q Belly');
  /* "Test C", "Test E" and testosterone are still intramuscular. */
  const test = [med('Test C', 'L Delt', '2026-03-03T08:00:00.000Z'), med('Test C', 'R Delt', '2026-03-02T08:00:00.000Z')];
  assert.equal(suggest('Test C', test).suggest, 'L Glute');
});

test('only the five most recent doses count, so an older site comes round again', () => {
  const sites = ['R Quad', 'L Quad', 'R Glute', 'L Glute', 'R Delt', 'L Delt'];
  const entries = sites.map((s, i) => med('Testosterone Cypionate', s, `2026-03-0${9 - i}T08:00:00.000Z`));
  /* L Delt was sixth-most-recent, so it is free again. */
  same(suggest('Testosterone Cypionate', entries), { lastSite: 'R Quad', suggest: 'L Delt' });
});

test('when every site on the list was used recently, it suggests the first that is not the last one used', () => {
  const sites = ['Sub-Q Belly', 'L Delt', 'R Delt', 'L Lat', 'R Lat'];
  const entries = sites.map((s, i) => med('BPC-157', s, `2026-03-0${9 - i}T08:00:00.000Z`));
  same(suggest('BPC-157', entries), { lastSite: 'Sub-Q Belly', suggest: 'L Delt' });
});

test('the compound name must match the logged name exactly', () => {
  const one = [med('BPC-157', 'L Delt', '2026-03-03T08:00:00.000Z')];
  assert.equal(suggest('bpc-157', one), null);
  assert.equal(suggest('BPC 157', one), null);
});

/* ---- the level curve ---------------------------------------------------- */

const pk = loadApp({ functions: ['pkCurve', 'pkParseDose'] });

test('pkParseDose reads the first number and its unit, and converts mcg to mg', () => {
  same(pk.pkParseDose('200mg'), { v: 200, unit: 'mg' });
  same(pk.pkParseDose('250 mcg'), { v: 0.25, unit: 'mg' });
  same(pk.pkParseDose('2 IU'), { v: 2, unit: 'IU' });
  same(pk.pkParseDose('10 units'), { v: 10, unit: 'IU' });
  same(pk.pkParseDose('0.5ml'), { v: 0.5, unit: 'ml' });
  same(pk.pkParseDose('.25 mg'), { v: 0.25, unit: 'mg' });
});

test('pkParseDose assumes mg when there is no unit, and gives null for no number or zero', () => {
  same(pk.pkParseDose('200'), { v: 200, unit: 'mg' });
  assert.equal(pk.pkParseDose(''), null);
  assert.equal(pk.pkParseDose(null), null);
  assert.equal(pk.pkParseDose('a little'), null);
  assert.equal(pk.pkParseDose('0mg'), null);
});

test('pkParseDose reads a thousands comma as part of the number, and draws no curve for a range', () => {
  /* "200mg/week" logged as a dose is one 200 mg administration. */
  same(pk.pkParseDose('200mg/week'), { v: 200, unit: 'mg' });
  /* A range is not one dose. "250-500mcg" used to read as 250 mg, a thousand
     times the low end of the range, because the hyphen hid the unit. */
  for (const range of ['250-500mcg', '10-20mg/week', '0.5-1mg', '100 to 200mg', '250 \u2013 500 mcg']) {
    assert.equal(pk.pkParseDose(range), null, range);
  }
  /* "1,000mcg" used to stop at the comma: 1 with no unit, so 1 mg, right by
     accident; "1,500mcg" read as 1 mg, a third too little. */
  same(pk.pkParseDose('1,000mcg'), { v: 1, unit: 'mg' });
  same(pk.pkParseDose('1,500mcg'), { v: 1.5, unit: 'mg' });
  same(pk.pkParseDose('10,000 IU'), { v: 10000, unit: 'IU' });
  /* Only a range that starts at the dose is a range. */
  same(pk.pkParseDose('5mg (weeks 1-2)'), { v: 5, unit: 'mg' });
  same(pk.pkParseDose('40mg/day weeks 1-2; 20mg/day weeks 3-6'), { v: 40, unit: 'mg' });
});

test('pkCurve is zero at and before the dose, and peaks at exactly 1.0 at Tmax', () => {
  const c = pk.pkCurve(144, 48);                     /* six-day half-life, peak at two days */
  assert.equal(c(0), 0);
  assert.equal(c(-5), 0);
  assert.ok(Math.abs(c(48) - 1) < 1e-9, `peak was ${c(48)}`);
  assert.ok(c(47) < 1 && c(49) < 1);
});

test('pkCurve falls by half per half-life once absorption is over', () => {
  const c = pk.pkCurve(4, 0.5);                      /* four-hour half-life */
  const ratio = c(24) / c(20);
  assert.ok(Math.abs(ratio - 0.5) < 1e-6, `ratio was ${ratio}`);
});

test('pkCurve caps Tmax so the curve still has a solution when Tmax is long for the half-life', () => {
  /* Tmax is limited to 0.95 / ke. With a 3 h half-life that is about 4.1 h, so
     an 8 h Tmax peaks there instead. */
  const c = pk.pkCurve(3, 8);
  const cap = 0.95 / (Math.LN2 / 3);
  assert.ok(Math.abs(c(cap) - 1) < 1e-9);
  assert.ok(c(8) < 1);
});
