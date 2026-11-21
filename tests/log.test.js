/* Logging from the Log sheet and the site map: src/logic/log.js.
 *
 * "Save dose" ticks off the compound's next pending dose today, the same
 * entry Today's checklist would write, and records a dose with nothing
 * pending on its own. The form starts on the user's own protocol amount.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/setup.js', 'src/logic/log.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['TL_DAY_MS']
});

const at = (text) => local(text).toISOString();
const THU = '2026-03-05';
const compound = (key, name, dose, rule, slots) => ({ key, name, drugId: null, dose: app.tlParseDose(dose), route: 'sq', rule, slots, inv: null });
const protocol = () => app.tlNormalizeProtocol({
  name: 'P', start: '2026-03-02',
  compounds: [
    compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed']),
    compound('test', 'Testosterone cyp', '80 mg', { weekdays: [1, 4] }, ['am']),
    compound('range', 'Peptide X', '250-500mcg', { daily: true }, ['eve']),
    compound('prn', 'As needed', '10 mg', null, [])
  ]
});

test('the form starts on the user\'s own amount and unit, or their text when there is no single amount', () => {
  const p = protocol();
  same(app.tlFormDose(app.tlCompound(p, 'gh')), { amount: '2', unit: 'IU', text: '' });
  same(app.tlFormDose(app.tlCompound(p, 'range')), { amount: '', unit: 'mg', text: '250-500mcg' });
  same(app.tlFormDose(null), { amount: '', unit: 'mg', text: '' });
});

test('the form starts on the compound due soonest today, else the first', () => {
  const p = protocol(), d = { entries: [] };
  assert.equal(app.tlDefaultDoseCompound(p, app.tlRoundsFor(p, THU, d.entries)).key, 'gh');
  app.tlLogRound(d, p, 'am', THU, at('2026-03-05T07:05'));
  assert.equal(app.tlDefaultDoseCompound(p, app.tlRoundsFor(p, THU, d.entries)).key, 'range');
  app.tlLogRound(d, p, 'eve', THU, at('2026-03-05T18:05'));
  app.tlLogRound(d, p, 'bed', THU, at('2026-03-05T22:35'));
  assert.equal(app.tlDefaultDoseCompound(p, app.tlRoundsFor(p, THU, d.entries)).key, 'gh');
});

test('saving a dose ticks off that compound\'s next pending dose today, with what the form said', () => {
  const p = protocol(), d = { entries: [] };
  const out = app.tlLogCompoundDose(d, p, 'gh', at('2026-03-05T08:00'), { dose: '2.5 IU', site: 'Right abdomen', siteId: 'abd-r', notes: 'ok' });
  assert.equal(out.ticked, 'gh:am:' + THU);
  same([out.entry.key, out.entry.slot, out.entry.day, out.entry.dose, out.entry.siteId, out.entry.site, out.entry.notes],
    ['gh', 'am', THU, '2.5 IU', 'abd-r', 'Right abdomen', 'ok']);
  const again = app.tlLogCompoundDose(d, p, 'gh', at('2026-03-05T22:30'), {});
  assert.equal(again.ticked, 'gh:bed:' + THU);
  same(app.tlRoundsFor(p, THU, d.entries).map((r) => r.slot + ':' + r.doses.filter((x) => x.at).map((x) => x.key).join()),
    ['am:gh', 'eve:', 'bed:gh']);
});

test('with nothing pending, the dose is recorded on its own, with the compound\'s key and no round', () => {
  const p = protocol(), d = { entries: [] };
  app.tlLogCompoundDose(d, p, 'gh', at('2026-03-05T07:00'), {});
  app.tlLogCompoundDose(d, p, 'gh', at('2026-03-05T22:00'), {});
  const extra = app.tlLogCompoundDose(d, p, 'gh', at('2026-03-05T23:00'), {});
  assert.equal(extra.ticked, null);
  same([extra.entry.key, extra.entry.slot, extra.entry.day, extra.entry.dose], ['gh', undefined, undefined, '2 IU']);
  /* Wednesday: no testosterone due, and a dose taken is still recorded. */
  const wed = app.tlLogCompoundDose(d, p, 'test', at('2026-03-04T09:00'), {});
  same([wed.ticked, wed.entry.medication, wed.entry.dose], [null, 'Testosterone cyp', '80 mg']);
  const prn = app.tlLogCompoundDose(d, p, 'prn', at('2026-03-05T12:00'), {});
  same([prn.ticked, prn.entry.key], [null, 'prn']);
  /* Every entry has its own timestamp. */
  assert.equal(new Set(d.entries.map((e) => e.ts)).size, d.entries.length);
});

test('an unknown compound saves nothing', () => {
  const d = { entries: [] };
  assert.equal(app.tlLogCompoundDose(d, protocol(), 'nope', at('2026-03-05T08:00'), {}), null);
  same(d.entries, []);
});

test('"Saved" says what, how much and where', () => {
  assert.equal(app.tlSavedLine({ medication: 'BPC-157', dose: '300 mcg', site: 'Right abdomen' }), 'BPC-157 300 mcg, right abdomen');
  assert.equal(app.tlSavedLine({ medication: 'Anastrozole', dose: '0.5 mg', site: null }), 'Anastrozole 0.5 mg');
  assert.equal(app.tlSavedLine(null), '');
});
