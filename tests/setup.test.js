/* Setting up a protocol: src/logic/setup.js.
 *
 * Onboarding (3d) and the Protocol screen collect a compound as fields; these
 * pin how the fields become the model, and that what onboarding writes reads
 * back through the same functions every other screen uses: tlProtocol for
 * the model, tlRoundsFor for the day's rounds, and the old fields for the old
 * screens.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/frequency.js', 'src/logic/rounds.js', 'src/logic/record.js', 'src/logic/setup.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays',
    'tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['tlLocalDate', 'TL_DAY_MS']
});

const IDS = { 'Testosterone Cypionate': 'tc', 'BPC-157': 'bpc' };
const MEDIUM = { tc: 'oil', bpc: 'aq' };
const env = { resolve: (n) => IDS[n] || null, medium: (id) => MEDIUM[id] || null, discreet: false };

const empty = () => app.tlProtocol({ entries: [], proto: null }, env);
const fields = (over) => Object.assign({ name: 'BPC-157', amount: '250', unit: 'mcg', repeat: { mode: 'daily' }, route: 'sq', slots: ['am'] }, over);
const add = (p, over, today) => {
  const c = app.tlCompoundOfFields(fields(over), null, p, env, today || '2026-03-02');
  p.compounds.push(c);
  return c;
};

/* ---- the Repeat control ---------------------------------------------------- */

test('a rule reads as the Repeat control shows it', () => {
  same(app.tlRepeatOf({ daily: true }), { mode: 'daily' });
  same(app.tlRepeatOf({ every: { days: 1 } }), { mode: 'daily' });
  same(app.tlRepeatOf({ weekdays: [4, 1] }), { mode: 'days', days: [1, 4] });
  same(app.tlRepeatOf({ weekdays: [0, 1, 2, 3, 4, 5, 6] }), { mode: 'daily' });
  same(app.tlRepeatOf({ every: { days: 3 } }), { mode: 'every', n: 3 });
});

test('a rule the control has no words for is kept, with its label', () => {
  same(app.tlRepeatOf({ every: { days: 3.5 } }), { mode: 'keep', label: 'Every 3.5 days' });
  same(app.tlRepeatOf({ monthly: true }), { mode: 'keep', label: 'Monthly' });
  same(app.tlRepeatOf({ daily: true, pattern: { on: 5, off: 2 } }), { mode: 'keep', label: 'Daily, 5 on 2 off' });
  same(app.tlRepeatOf(null), { mode: 'keep', label: 'No schedule' });
  const taper = { taper: [{ dose: '10 mg' }], per: 'week' };
  assert.equal(app.tlRuleOfRepeat({ mode: 'keep' }, taper, '2026-03-02'), taper);
});

test('the Repeat control makes rules the schedule engine reads', () => {
  same(app.tlRuleOfRepeat({ mode: 'daily' }, null, '2026-03-02'), { daily: true });
  same(app.tlRuleOfRepeat({ mode: 'days', days: [4, 1, 4, 9, -1] }, null, '2026-03-02'), { weekdays: [1, 4] });
  same(app.tlRuleOfRepeat({ mode: 'days', days: [0, 1, 2, 3, 4, 5, 6] }, null, '2026-03-02'), { daily: true });
  same(app.tlRuleOfRepeat({ mode: 'every', n: 3 }, null, '2026-03-02'), { every: { days: 3 }, start: '2026-03-02' });
});

test('an interval that did not change keeps the day it counts from', () => {
  const prev = { every: { days: 3 }, start: '2026-01-10' };
  same(app.tlRuleOfRepeat({ mode: 'every', n: 3 }, prev, '2026-03-02'), { every: { days: 3 }, start: '2026-01-10' });
  same(app.tlRuleOfRepeat({ mode: 'every', n: 4 }, prev, '2026-03-02'), { every: { days: 4 }, start: '2026-03-02' });
});

/* ---- the dose ---------------------------------------------------------------- */

test('an amount is a positive number as typed, with a comma for a point', () => {
  assert.equal(app.tlAmountOf('250'), 250);
  assert.equal(app.tlAmountOf(' 0.5 '), 0.5);
  assert.equal(app.tlAmountOf('0,5'), 0.5);
  assert.equal(app.tlAmountOf('.25'), 0.25);
  for (const bad of ['', '0', '-1', '1e3', '250mg', '1/2', 'abc', '1.2.3']) assert.equal(app.tlAmountOf(bad), null, bad);
});

test('the dose is the amount and unit typed, and nothing else', () => {
  same(app.tlDoseOfInput('200', 'mg', null), { amount: 200, unit: 'mg', text: '200 mg' });
  same(app.tlDoseOfInput('2', 'IU', null), { amount: 2, unit: 'IU', text: '2 IU' });
  same(app.tlDoseOfInput('', 'mg', null), { amount: null, unit: null, text: '' });
  assert.equal(app.tlDoseOfInput('two', 'mg', null), null);
  /* A unit the form does not offer is not invented. */
  same(app.tlDoseOfInput('5', 'grains', null), { amount: 5, unit: null, text: '5' });
});

test('a blank amount keeps a dose that was only ever text, and clears one that had an amount', () => {
  const range = { amount: null, unit: null, text: '250-500mcg' };
  assert.equal(app.tlDoseOfInput('', 'mcg', range), range);
  same(app.tlDoseOfInput('', 'mg', { amount: 200, unit: 'mg', text: '200 mg' }), { amount: null, unit: null, text: '' });
});

/* ---- one compound -------------------------------------------------------------- */

test('a form with a problem says what it is', () => {
  assert.equal(app.tlCompoundProblem(fields({ name: '  ' })), 'Give it a name.');
  assert.match(app.tlCompoundProblem(fields({ amount: '2x' })), /dose/);
  assert.equal(app.tlCompoundProblem(fields({ repeat: { mode: 'days', days: [] } })), 'Pick at least one day.');
  assert.match(app.tlCompoundProblem(fields({ repeat: { mode: 'every', n: 1 } })), /Every 2 to/);
  assert.equal(app.tlCompoundProblem(fields({ amount: '' })), null);
  assert.equal(app.tlCompoundProblem(fields()), null);
});

test('a new compound gets a key no other compound has, and the encyclopedia id when the name resolves', () => {
  const p = empty();
  const a = add(p, { name: 'BPC-157' });
  const b = add(p, { name: 'bpc 157' });
  assert.equal(a.key, 'bpc');
  assert.equal(a.drugId, 'bpc');
  assert.notEqual(b.key, a.key);
  same(a.slots, ['am']);
  same(a.dose, { amount: 250, unit: 'mcg', text: '250 mcg' });
  assert.equal(a.route, 'sq');
  same(a.rule, { daily: true });
  assert.equal(a.inv, null);
});

test('an edited compound keeps its key, supply and anything else it had, whatever its new name', () => {
  const p = empty();
  const prev = add(p, { name: 'Testosterone Cypionate', amount: '80', unit: 'mg', route: 'im', repeat: { mode: 'days', days: [1, 4] } });
  prev.inv = { per: 10, left: 6, spare: 1, since: null };
  prev.droppedTimes = ['23:00'];
  const next = app.tlCompoundOfFields(fields({ name: 'Test C', amount: '100', unit: 'mg', route: 'im', repeat: { mode: 'days', days: [1, 4] }, slots: ['am', 'bed'] }), prev, p, env, '2026-03-09');
  assert.equal(next.key, prev.key);
  assert.equal(next.name, 'Test C');
  same(next.inv, prev.inv);
  same(next.droppedTimes, ['23:00']);
  same(next.slots, ['am', 'bed']);
  same(next.dose, { amount: 100, unit: 'mg', text: '100 mg' });
  /* The original is left alone: the screen can still cancel. */
  same(prev.dose, { amount: 80, unit: 'mg', text: '80 mg' });
});

test('slots come back in round order, whatever order they were tapped in', () => {
  const c = add(empty(), { slots: ['bed', 'am', 'eve', 'am'] });
  same(c.slots, ['am', 'eve', 'bed']);
});

test('"Other" keeps a route the form has no button for, and otherwise means none', () => {
  const p = empty();
  const gel = add(p, { name: 'Testogel', route: 'oral' });
  gel.route = 'topical';
  assert.equal(app.tlCompoundOfFields(fields({ name: 'Testogel', route: 'other' }), gel, p, env, '2026-03-02').route, 'topical');
  assert.equal(app.tlCompoundOfFields(fields({ name: 'X', route: 'other' }), null, p, env, '2026-03-02').route, null);
  assert.equal(app.tlRouteChoice('topical'), 'other');
  assert.equal(app.tlRouteChoice('sq'), 'sq');
  assert.equal(app.tlRouteChoice(null), null);
});

test('the old frequency text goes once the user chooses a rule, and stays while the rule is kept', () => {
  const p = app.tlProtocolFromLegacy({ entries: [], proto: { name: 'P', start: '2026-03-02', weeks: 12, meds: 'BPC-157, 250mcg, Monthly', pct: '' } }, env);
  const prev = p.compounds[0];
  same(prev.rule, { monthly: true });
  assert.equal(prev.freqText, 'Monthly');
  const kept = app.tlCompoundOfFields(fields({ repeat: app.tlRepeatOf(prev.rule) }), prev, p, env, '2026-03-02');
  assert.equal(kept.freqText, prev.freqText);
  assert.equal(kept.rule, prev.rule);
  const daily = app.tlCompoundOfFields(fields({ repeat: { mode: 'daily' } }), prev, p, env, '2026-03-02');
  assert.equal(daily.freqText, undefined);
});

test('a compound reads as its dose and days', () => {
  const p = empty();
  assert.equal(app.tlCompoundMeta(add(p, { amount: '80', unit: 'mg', repeat: { mode: 'days', days: [4, 1] } })), '80 mg · Mon · Thu');
  assert.equal(app.tlCompoundMeta(add(p, { amount: '' })), 'No dose set · Daily');
});

/* ---- the rounds ---------------------------------------------------------------- */

test('the rounds are every slot holding a scheduled compound, in time order, whatever the day', () => {
  const p = empty();
  add(p, { name: 'Somatropin', slots: ['am', 'bed'] });
  add(p, { name: 'Testosterone Cypionate', repeat: { mode: 'days', days: [1, 4] }, slots: ['am'] });
  add(p, { name: 'Ipamorelin', slots: ['bed'] });
  const loose = add(p, { name: 'As needed', slots: ['mid'] });
  loose.rule = null;
  same(app.tlSetupRounds(p).map((r) => [r.slot, r.time, r.alert, r.names]), [
    ['am', '07:00', true, ['Somatropin', 'Testosterone Cypionate']],
    ['bed', '22:30', true, ['Somatropin', 'Ipamorelin']]
  ]);
  /* Moved past midnight, bedtime is still a round, now the first. */
  p.slots.bed.t = 30;
  same(app.tlSetupRounds(p).map((r) => r.slot), ['bed', 'am']);
});

test('a round steps by quarter hours, snapping to the grid, and wraps past midnight', () => {
  const p = empty();
  assert.equal(app.tlShiftSlot(p, 'am', 1), 435);
  assert.equal(app.tlShiftSlot(p, 'am', -2), 405);
  p.slots.am.t = 430;                             /* 07:10, from an old protocol */
  assert.equal(app.tlMinToTime(app.tlShiftSlot(p, 'am', 1)), '07:15');
  p.slots.am.t = 430;
  assert.equal(app.tlMinToTime(app.tlShiftSlot(p, 'am', -1)), '07:00');
  p.slots.bed.t = 1425;                           /* 23:45 */
  assert.equal(app.tlMinToTime(app.tlShiftSlot(p, 'bed', 1)), '00:00');
  assert.equal(app.tlMinToTime(app.tlShiftSlot(p, 'bed', -1)), '23:45');
});

/* ---- finishing -------------------------------------------------------------------- */

test('finishing stores the protocol, the focus and the figure, and the old fields agree', () => {
  const d = { entries: [], proto: null };
  const p = empty();
  add(p, { name: 'Testosterone Cypionate', amount: '80', unit: 'mg', route: 'im', repeat: { mode: 'days', days: [1, 4] }, slots: ['am'] });
  add(p, { name: 'BPC-157', slots: ['am', 'bed'] });
  p.slots.am.t = 450;
  p.slots.bed.alert = false;
  p.discreet = true;
  const now = local('2026-03-04 09:15').toISOString();
  app.tlFinishSetup(d, { focus: ['trt', 'peptides', 'nonsense'], figure: 'female', protocol: p }, now);

  same(d.settings, { focus: ['trt', 'peptides'], figure: 'female' });
  assert.equal(d.v, app.TL_SCHEMA);
  assert.equal(d.protocol.start, '2026-03-04');
  assert.equal(d.protocol.created, now);
  assert.equal(d.protocol.derived, undefined);
  assert.equal(d.protocol.discreet, true);
  assert.equal(d.protocol.slots.bed.alert, false);

  /* The old screens read the old fields. */
  assert.equal(d.proto.meds, 'Testosterone Cypionate, 80 mg, Twice weekly (Mon · Thu)\nBPC-157, 250 mcg, Twice daily');
  assert.equal(d.proto.start, '2026-03-04');
  assert.equal(d.proto.name, 'My protocol');
  same(plain(d.reminderTimes), { 'Testosterone Cypionate': ['07:30'], 'BPC-157': ['07:30', '22:30'] });

  /* Every other screen reads the stored model back the same. */
  const back = app.tlProtocol(d, env);
  same(back.compounds.map((c) => [c.key, c.slots, c.rule]), [
    ['tc', ['am'], { weekdays: [1, 4] }],
    ['bpc', ['am', 'bed'], { daily: true }]
  ]);
});

test('what onboarding stores is what Today shows', () => {
  const d = { entries: [], proto: null };
  const p = empty();
  add(p, { name: 'Testosterone Cypionate', amount: '80', unit: 'mg', route: 'im', repeat: { mode: 'days', days: [1, 4] }, slots: ['am'] });
  add(p, { name: 'BPC-157', slots: ['am', 'bed'] });
  app.tlFinishSetup(d, { focus: [], figure: 'male', protocol: p }, local('2026-03-04 09:15').toISOString());
  const stored = app.tlProtocol(d, env);
  /* Wednesday: no testosterone. Thursday: both. */
  same(app.tlRoundsFor(stored, '2026-03-04', []).map((r) => [r.slot, r.doses.map((x) => x.name)]),
    [['am', ['BPC-157']], ['bed', ['BPC-157']]]);
  same(app.tlRoundsFor(stored, '2026-03-05', []).map((r) => [r.slot, r.doses.map((x) => x.name)]),
    [['am', ['Testosterone Cypionate', 'BPC-157']], ['bed', ['BPC-157']]]);
});

test('an interval compound is due from the day it was set up', () => {
  const d = { entries: [], proto: null };
  const p = empty();
  add(p, { name: 'Every third', repeat: { mode: 'every', n: 3 }, slots: ['eve'] }, '2026-03-04');
  app.tlFinishSetup(d, { protocol: p }, local('2026-03-04 09:15').toISOString());
  const stored = app.tlProtocol(d, env);
  const due = ['2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-10']
    .filter((day) => app.tlRoundsFor(stored, day, []).length);
  same(due, ['2026-03-04', '2026-03-07', '2026-03-10']);
});

test('an empty stack on a new record stores no protocol, so a backup restored later can bring one', () => {
  const d = { entries: [], proto: null };
  app.tlFinishSetup(d, { focus: ['hrt'], figure: 'male', protocol: empty() }, new Date().toISOString());
  assert.equal(d.protocol, undefined);
  assert.equal(d.proto, null);
  same(d.settings, { focus: ['hrt'], figure: 'male' });
});

test('emptying a protocol the record already had is stored as emptied', () => {
  const d = { entries: [], proto: { name: 'P', start: '2026-03-02', weeks: 12, meds: 'BPC-157, 250mcg, Daily', pct: '' } };
  const p = app.tlProtocol(d, env);
  p.compounds = [];
  app.tlFinishSetup(d, { protocol: p }, new Date().toISOString());
  same(d.protocol.compounds, []);
  /* The old text keeps the protocol's name, and no longer lists the compound. */
  assert.equal(d.proto.meds, '');
});

test('a figure that is not one of the two is not stored', () => {
  const d = { entries: [] };
  app.tlFinishSetup(d, { figure: 'other' }, new Date().toISOString());
  assert.equal(d.settings.figure, undefined);
});
