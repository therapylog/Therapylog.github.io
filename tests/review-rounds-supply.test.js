/* Supply after the Phase 1 review (src/logic/supply.js), and the supply
 * alerts that follow from it (src/logic/alerts.js).
 *
 * How long the open vial lasts is found by walking the protocol forward a day
 * at a time, not from a four-week average, so a taper or a rule that ends
 * soon is counted dose by dose, and a rule with long gaps never reads as
 * using nothing. And a dose logged the old way, by a name two protocol lines
 * share, comes off one line's count, not both.
 *
 * 2 March 2026 is a Monday. All times are local.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/frequency.js', 'src/logic/rounds.js', 'src/logic/supply.js', 'src/logic/alerts.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['TL_DAY_MS']
});

const at = (text) => local(text).toISOString();
const MON = '2026-03-02', THU = '2026-03-05';
const SINCE = at('2026-03-01T12:00');

const compound = (key, name, dose, rule, slots, inv) => ({
  key, name, drugId: null, dose: app.tlParseDose(dose), route: 'oral', rule, slots,
  inv: inv ? Object.assign({ since: SINCE }, inv) : null });
const protocol = (compounds, over) => Object.assign({
  name: 'P', start: MON, weeks: 12, pct: '', created: null, discreet: false,
  slots: { am: { t: 420, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } },
  compounds
}, over);
const legacy = (name, when) => ({ type: 'medication', ts: at(when), medication: name, dose: '', site: null, notes: '' });
const supply = (p, date, entries) => app.tlSupply(p, p.compounds[0], entries || [], date);
const row = (s) => [s.days, s.state, s.stock];

/* ---- rules that end ------------------------------------------------------- */

test('a taper that needs more doses than are left is danger when the vial runs out in five days', () => {
  /* 40 mg a day for a week, then 20 mg a day for a week: fourteen doses, five left. */
  const p = protocol([compound('tam', 'Tamoxifen', '20 mg', { taper: ['40mg', '20mg'], per: 'week' }, ['am'],
    { per: 30, left: 5, spare: 0 })]);
  same(row(supply(p, MON)), [5, 'danger', 'No spare vial · reorder']);
  assert.equal(supply(p, MON).daily, 0.5, 'the average rate is still given for display');
  same(app.tlSupplyAlerts(p, [], MON).map((a) => a.title), ['Tamoxifen is on its last vial.']);
});

test('a rule that ends in ten days with three doses left runs out in three, not nine', () => {
  const p = protocol([compound('x', 'X', '1 mg', { daily: true, toDay: 9 }, ['am'], { per: 30, left: 3, spare: 0 })]);
  same(row(supply(p, MON)), [3, 'danger', 'No spare vial · reorder']);
});

test('"open it in" counts the days the open vial lasts, not the protocol\'s average', () => {
  const p = protocol([compound('tam', 'Tamoxifen', '20 mg', { taper: ['40mg', '20mg'], per: 'week' }, ['am'],
    { per: 4, left: 4, spare: 1 })]);
  same(row(supply(p, MON)), [4, 'warn', '1 spare vial · open it in 4 d']);
});

test('a vial that outlasts its rule lasts the protocol, and is ok', () => {
  const daily = protocol([compound('x', 'X', '1 mg', { daily: true, toDay: 9 }, ['am'], { per: 30, left: 20, spare: 0 })]);
  same(row(supply(daily, MON)), [null, 'ok', 'Lasts the protocol']);
  const exact = protocol([compound('x', 'X', '1 mg', { daily: true, toDay: 9 }, ['am'], { per: 30, left: 10, spare: 1 })]);
  same(row(supply(exact, MON)), [null, 'ok', 'Lasts the protocol · 1 spare vial']);
  const pct = protocol([compound('nol', 'Nolvadex', '20 mg', { taper: ['40mg', '40mg', '20mg', '20mg'], per: 'week' }, ['am'],
    { per: 30, left: 28, spare: 2 })]);
  same(row(supply(pct, MON)), [null, 'ok', 'Lasts the protocol · 2 spare vials']);
  same(app.tlSupplyAlerts(daily, [], MON), []);
});

test('one dose short of the end of the rule is still a run-out, on the last day', () => {
  const p = protocol([compound('x', 'X', '1 mg', { daily: true, toDay: 9 }, ['am'], { per: 30, left: 9, spare: 0 })]);
  same(row(supply(p, MON)), [9, 'warn', 'No spare vial']);
});

test('a four-week taper with ten left still comes out at ten days', () => {
  const p = protocol([compound('nol', 'Nolvadex', '20 mg', { taper: ['40mg', '40mg', '20mg', '20mg'], per: 'week' }, ['am'],
    { per: 30, left: 10, spare: 0 })]);
  same(row(supply(p, MON)), [10, 'warn', 'No spare vial']);
});

/* ---- rules with long gaps -------------------------------------------------- */

test('a monthly compound with nothing left has a state on every day of the month, counting down', () => {
  const p = protocol([compound('m', 'Monthly', '1 mg', { monthly: true }, ['am'], { per: 4, left: 0, spare: 0 })],
    { start: '2026-03-01' });
  const days = [], states = [];
  for (let d = 1; d <= 31; d++) {
    const s = supply(p, '2026-03-' + String(d).padStart(2, '0'));
    days.push(s.days);
    states.push(s.state);
  }
  assert.ok(states.every((s) => s !== null), 'never without a state');
  same(days.slice(0, 5), [0, 30, 29, 28, 27]);
  same([states[0], states[1], states[9], states[10], states[23], states[24]], ['danger', 'ok', 'ok', 'warn', 'warn', 'danger']);
  same(app.tlSupplyAlerts(p, [], '2026-03-02'), []);
  assert.equal(app.tlSupplyAlerts(p, [], '2026-03-25').length, 1);
});

test('every six weeks with nothing left counts down to the next dose instead of going blank', () => {
  const p = protocol([compound('e6', 'E6', '1 mg', { every: { weeks: 6 } }, ['am'], { per: 4, left: 0, spare: 0 })]);
  same(['2026-03-02', '2026-03-03', '2026-03-16', '2026-04-06', '2026-04-13'].map((d) => row(supply(p, d)).slice(0, 2)),
    [[0, 'danger'], [41, 'ok'], [28, 'ok'], [7, 'danger'], [0, 'danger']]);
});

test('a vial that lasts beyond the horizon is ok, without claiming the rule ends', () => {
  const p = protocol([compound('x', 'X', '1 mg', { every: { weeks: 2 } }, ['am'], { per: 60, left: 60, spare: 0 })]);
  same(row(supply(p, MON)), [null, 'ok', 'No spare vial']);
});

test('a spare that has to be opened today says so', () => {
  const p = protocol([compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed'], { per: 18, left: 1, spare: 1 })]);
  same(row(supply(p, THU)), [0, 'warn', '1 spare vial · open it today']);
});

/* ---- two protocol lines with the same name -------------------------------- */

const twins = () => protocol([
  compound('hgh', 'HGH', '2 IU', { daily: true }, ['am'], { per: 10, left: 5, spare: 0 }),
  compound('hgh-2', 'HGH', '1 IU', { daily: true }, ['bed'], { per: 10, left: 5, spare: 0 })
]);
const lefts = (p, entries) => app.tlSupplyAll(p, entries, THU).map((s) => s.key + ' ' + s.left).sort();

test('an old-style dose shared by two same-name lines comes off one count, the line it ticked', () => {
  const p = twins();
  same(lefts(p, [legacy('HGH', '2026-03-05T08:00')]), ['hgh 4', 'hgh-2 5']);
  same(lefts(p, [legacy('HGH', '2026-03-05T22:10')]), ['hgh 5', 'hgh-2 4']);
  same(lefts(p, [legacy('HGH', '2026-03-05T08:00'), legacy('HGH', '2026-03-05T22:10')]), ['hgh 4', 'hgh-2 4']);
});

test('an old-style dose that matches no dose of either line comes off the first line only', () => {
  const p = twins();
  p.compounds.forEach((c) => { c.rule = { weekdays: [1] }; });   /* Mondays only; the entry is on a Thursday */
  same(lefts(p, [legacy('HGH', '2026-03-05T08:00')]), ['hgh 4', 'hgh-2 5']);
});

test('an old-style after-midnight dose comes off the line whose bedtime dose it was', () => {
  const p = twins();
  same(lefts(p, [legacy('HGH', '2026-03-06T00:20')]), ['hgh 5', 'hgh-2 4']);
});


/* ---- today's dose, once logged, is taken out once ------------------------ */

test('a course bought to fit stays "lasts the protocol" all day, before and after today\'s dose is logged', () => {
  /* Four weeks of a taper, 28 doses, every one bought. */
  const nol = () => protocol([compound('nol', 'Nolvadex', '20 mg', { taper: ['40mg', '40mg', '20mg', '20mg'], per: 'week' }, ['am'],
    { per: 28, left: 28, spare: 0 })]);
  const entries = [];
  for (let i = 0; i < 21; i++) {
    const day = new Date(2026, 2, 2 + i);
    entries.push({ type: 'medication', ts: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 7, 5).toISOString(),
      medication: 'Nolvadex', dose: '', key: 'nol', slot: 'am', day: app.tlDayKey(day) });
  }
  const before = supply(nol(), '2026-03-23', entries);
  assert.equal(before.left, 7);
  same(row(before), [null, 'ok', 'Lasts the protocol']);
  entries.push({ type: 'medication', ts: at('2026-03-23T07:05'), medication: 'Nolvadex', dose: '', key: 'nol', slot: 'am', day: '2026-03-23' });
  const after = supply(nol(), '2026-03-23', entries);
  assert.equal(after.left, 6);
  same(row(after), [null, 'ok', 'Lasts the protocol']);
  same(app.tlSupplyAlerts(nol(), entries, '2026-03-23'), []);
});

test('a daily count does not jump when today\'s dose is logged', () => {
  const p = () => protocol([compound('bpc', 'BPC-157', '250 mcg', { daily: true }, ['am'], { per: 20, left: 6, spare: 0 })]);
  assert.equal(supply(p(), THU, []).days, 6);
  assert.equal(supply(p(), THU, [{ type: 'medication', ts: at('2026-03-05T07:05'), medication: 'BPC-157', dose: '', key: 'bpc', slot: 'am', day: THU }]).days, 6);
});

/* ---- two lines with one name: the same answer, quickly ------------------- */

test('supply for two same-name lines over a long log gives the same answer with the shared index, and quickly', () => {
  const p = protocol([
    compound('hgh', 'HGH', '2 IU', { daily: true }, ['am'], { per: 2000, left: 1900, spare: 0 }),
    compound('hgh-2', 'HGH', '1 IU', { daily: true }, ['bed'], { per: 2000, left: 1900, spare: 0 })
  ], { start: '2023-03-01' });
  p.compounds.forEach((c) => { c.inv.since = at('2023-03-01T00:00'); });
  const entries = [];
  for (let i = 0; i < 1100; i++) {
    const day = new Date(2023, 2, 1 + i);
    entries.push(legacy('HGH', app.tlDayKey(day) + 'T07:10'), legacy('HGH', app.tlDayKey(day) + 'T22:20'));
  }
  const date = app.tlDayKey(new Date(2023, 2, 1 + 1100));
  const t0 = Date.now();
  const rows = app.tlSupplyAll(p, entries, date);
  const took = Date.now() - t0;
  /* Without the shared index each line reads every entry for every day. */
  const slow = p.compounds.map((c) => c.inv.left - app.tlDosesSince(entries, c, c.inv.since, p));
  same(rows.map((r) => [r.key, r.left]).sort(), p.compounds.map((c, i) => [c.key, slow[i]]).sort());
  same(slow, [1900 - 1100, 1900 - 1100]);
  assert.ok(took < 1500, 'tlSupplyAll took ' + took + ' ms');
});
