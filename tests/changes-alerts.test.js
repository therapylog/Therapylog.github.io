/* The dose-change log (src/logic/changes.js) and alert text (src/logic/alerts.js).
 *
 * The alert wording is the design's, screen 2c, and is asserted character for
 * character: it is what appears on a lock screen.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/supply.js', 'src/logic/changes.js', 'src/logic/alerts.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['TL_DAY_MS']
});

const at = (text) => local(text).toISOString();
const ms = (text) => local(text).getTime();
const THU = '2026-03-05';
const compound = (key, name, dose, rule, slots, extra) => Object.assign(
  { key, name, drugId: null, dose: app.tlParseDose(dose), route: 'sq', rule, slots, inv: null }, extra);
const protocol = (over) => Object.assign({
  name: 'P', start: '2026-03-02', weeks: 12, pct: '', created: null, discreet: false,
  slots: { am: { t: 420, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } },
  compounds: [
    compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed']),
    compound('bpc', 'BPC-157', '250 mcg', { daily: true }, ['am']),
    compound('test', 'Testosterone cyp', '80 mg', { weekdays: [1, 4] }, ['am']),
    compound('ipa', 'Ipamorelin', '200 mcg', { daily: true }, ['bed'])
  ]
}, over);
const withDose = (p, key, dose) => { const q = JSON.parse(JSON.stringify(p)); app.tlCompound(q, key).dose = plain(app.tlParseDose(dose)); return q; };

/* ---- dose changes -------------------------------------------------------- */

test('a changed dose is recorded with what it was and what it became', () => {
  const before = withDose(protocol(), 'test', '100 mg'), after = protocol();
  same(app.tlDoseChangesBetween(before, after, at('2026-03-05T09:00')),
    [{ ts: at('2026-03-05T09:00'), key: 'test', name: 'Testosterone cyp', from: '100 mg', to: '80 mg' }]);
});

test('the same dose typed differently is not a change', () => {
  assert.equal(app.tlDoseChangesBetween(withDose(protocol(), 'test', '80mg'), protocol(), at('2026-03-05T09:00')).length, 0);
  assert.equal(app.tlDoseChangesBetween(withDose(protocol(), 'test', '80.0 mg'), protocol(), at('2026-03-05T09:00')).length, 0);
  const a = withDose(protocol(), 'test', '200mg/week'), b = withDose(protocol(), 'test', '200 MG / week');
  assert.equal(app.tlDoseChangesBetween(a, b, at('2026-03-05T09:00')).length, 0);
});

test('a change of unit is a change', () => {
  const rows = app.tlDoseChangesBetween(withDose(protocol(), 'bpc', '250 mg'), protocol(), at('2026-03-05T09:00'));
  same(rows.map((r) => [r.from, r.to]), [['250 mg', '250 mcg']]);
});

test('adding or removing a compound is not a dose change', () => {
  const fewer = protocol(); fewer.compounds = fewer.compounds.slice(0, 2);
  assert.equal(app.tlDoseChangesBetween(fewer, protocol(), at('2026-03-05T09:00')).length, 0);
  assert.equal(app.tlDoseChangesBetween(protocol(), fewer, at('2026-03-05T09:00')).length, 0);
  assert.equal(app.tlDoseChangesBetween(null, protocol(), at('2026-03-05T09:00')).length, 0);
});

test('a compound whose key changed is still matched by its name', () => {
  const before = withDose(protocol(), 'test', '100 mg');
  app.tlCompound(before, 'test').key = 'testosterone-cyp';
  assert.equal(app.tlDoseChangesBetween(before, protocol(), at('2026-03-05T09:00')).length, 1);
});

test('recording puts changes on the record, newest first, each with its own timestamp', () => {
  const d = { entries: [], proto: null };
  let before = withDose(withDose(protocol(), 'test', '100 mg'), 'bpc', '500 mcg');
  const rows = app.tlRecordDoseChanges(d, before, protocol(), at('2026-03-05T09:00'));
  assert.equal(rows.length, 2);
  assert.equal(new Set(d.doseChanges.map((r) => r.ts)).size, 2);
  app.tlRecordDoseChanges(d, protocol(), withDose(protocol(), 'test', '60 mg'), at('2026-03-20T09:00'));
  same(d.doseChanges.map((r) => r.to), ['60 mg', '80 mg', '250 mcg']);
  same(app.tlRecordDoseChanges(d, protocol(), protocol(), at('2026-03-21T09:00')), []);
  assert.equal(d.doseChanges.length, 3);
});

test('a change reads as one line, sharing the unit when both doses have it', () => {
  assert.equal(app.tlDoseChangeLine({ name: 'Testosterone cyp', from: '100 mg', to: '80 mg' }), 'Testosterone cyp 100 → 80 mg');
  assert.equal(app.tlDoseChangeLine({ name: 'X', from: '200mg/week', to: '80 mg' }), 'X 200mg/week → 80 mg');
  assert.equal(app.tlDoseChangeLine({ name: 'X', from: '250 mg', to: '250 mcg' }), 'X 250 mg → 250 mcg');
});

test('a chart asks for the changes inside its span, oldest first', () => {
  const d = { doseChanges: [{ ts: at('2026-03-20T09:00'), name: 'B' }, { ts: at('2026-03-05T09:00'), name: 'A' }, { ts: at('2026-01-05T09:00'), name: 'Z' }] };
  same(app.tlDoseChangesIn(d, ms('2026-03-01T00:00'), ms('2026-03-31T00:00')).map((c) => c.name), ['A', 'B']);
  same(app.tlDoseChangesIn({}, 0, Infinity), []);
});

/* ---- round alerts -------------------------------------------------------- */

const rounds = (p, entries) => app.tlRoundsFor(p, THU, entries || []);

test('a round alert lists what is due, then what comes later today', () => {
  const r = rounds(protocol());
  const a = app.tlRoundAlert(r[0], r.slice(1), false);
  assert.equal(a.title, 'Morning round · 3 doses');
  same(a.lines, ['Somatropin 2 IU', 'BPC-157 250 mcg', 'Testosterone cyp 80 mg',
                 'Later today · Bedtime 22:30 · Somatropin, Ipamorelin']);
  same(a.actions, [{ id: 'log', title: 'Log morning round' }, { id: 'open', title: 'Open' }]);
  same([a.id, a.slot, a.day], ['round:am:2026-03-05', 'am', '2026-03-05']);
});

test('the last round of the day has no "later today" line', () => {
  const r = rounds(protocol());
  same(app.tlRoundAlert(r[1], [], false).lines, ['Somatropin 2 IU', 'Ipamorelin 200 mcg']);
});

test('doses already ticked are left off the alert, and one dose is singular', () => {
  const d = { entries: [], proto: null }, p = protocol();
  app.tlLogDose(d, p, 'gh:am:2026-03-05', at('2026-03-05T06:50'));
  app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T06:51'));
  const r = rounds(p, d.entries);
  const a = app.tlRoundAlert(r[0], r.slice(1), false);
  assert.equal(a.title, 'Morning round · 1 dose');
  assert.equal(a.lines[0], 'Testosterone cyp 80 mg');
});

test('discreet mode keeps the title and names no compound', () => {
  const r = rounds(protocol());
  const a = app.tlRoundAlert(r[0], r.slice(1), true);
  assert.equal(a.title, 'Morning round · 3 doses');
  same(a.lines, ['3 doses due. Open TherapyLog to see them.']);
  assert.ok(!/Somatropin|BPC|Testosterone|Ipamorelin/.test(a.title + a.body));
});

test('after logging from the lock screen it says so, with Undo', () => {
  const a = app.tlRoundLoggedAlert(rounds(protocol())[0], 3, '07:05');
  same([a.title, a.body, a.actions[0].title], ['Morning round logged', '3 doses at 07:05', 'Undo']);
  assert.equal(app.tlRoundLoggedAlert(rounds(protocol())[1], 1, '22:31').body, '1 dose at 22:31');
});

/* ---- supply alerts ------------------------------------------------------- */

test('a compound on its last vial gets a supply alert, and discreet mode leaves its name out', () => {
  const row = { key: 'bpc', name: 'BPC-157', left: 6 };
  same([app.tlSupplyAlert(row, false).title, app.tlSupplyAlert(row, false).body],
    ['BPC-157 is on its last vial.', '6 doses left, no spare in inventory.']);
  same([app.tlSupplyAlert(row, true).title, app.tlSupplyAlert(row, true).body],
    ['Supply is running low.', '6 doses left, no spare in inventory.']);
});

test('supply alerts are raised only for compounds in the danger state', () => {
  const p = protocol();
  app.tlCompound(p, 'bpc').inv = { per: 20, left: 6, spare: 0, since: at('2026-03-01T12:00') };
  app.tlCompound(p, 'gh').inv = { per: 18, left: 10, spare: 1, since: at('2026-03-01T12:00') };
  same(app.tlSupplyAlerts(p, [], THU).map((a) => a.title), ['BPC-157 is on its last vial.']);
});

/* ---- when ---------------------------------------------------------------- */

test('the plan is one alert per round per day, soonest first, each at its slot\'s local time', () => {
  const plan = app.tlAlertPlan(protocol(), [], ms('2026-03-05T06:00'), 2);
  same(plan.map((x) => [new Date(x.at).getDate(), new Date(x.at).getHours(), new Date(x.at).getMinutes(), x.alert.title]), [
    [5, 7, 0, 'Morning round · 3 doses'], [5, 22, 30, 'Bedtime round · 2 doses'],
    [6, 7, 0, 'Morning round · 2 doses'], [6, 22, 30, 'Bedtime round · 2 doses']
  ]);
});

test('a round whose time has passed, whose alert is off, or which is fully logged is not scheduled', () => {
  const p = protocol();
  assert.equal(app.tlAlertPlan(p, [], ms('2026-03-05T08:00'), 1).length, 1);          /* morning has passed */
  p.slots.bed.alert = false;
  assert.equal(app.tlAlertPlan(p, [], ms('2026-03-05T06:00'), 1).length, 1);          /* bedtime is off */
  const d = { entries: [], proto: null };
  app.tlLogRound(d, p, 'am', THU, at('2026-03-05T05:55'));
  assert.equal(app.tlAlertPlan(p, d.entries, ms('2026-03-05T06:00'), 1).length, 0);   /* morning is logged */
});

test('the in-app banner shows for the latest round whose time has come and is still pending', () => {
  const p = protocol();
  assert.equal(app.tlDueBanner(p, [], ms('2026-03-05T06:59')), null);
  assert.equal(app.tlDueBanner(p, [], ms('2026-03-05T07:00')).alert.title, 'Morning round · 3 doses');
  assert.equal(app.tlDueBanner(p, [], ms('2026-03-05T23:00')).alert.title, 'Bedtime round · 2 doses');
  const d = { entries: [], proto: null };
  app.tlLogRound(d, p, 'bed', THU, at('2026-03-05T22:35'));
  /* Bedtime is done, so the banner falls back to the morning round that never was. */
  assert.equal(app.tlDueBanner(p, d.entries, ms('2026-03-05T23:00')).alert.title, 'Morning round · 3 doses');
  app.tlLogRound(d, p, 'am', THU, at('2026-03-05T23:01'));
  assert.equal(app.tlDueBanner(p, d.entries, ms('2026-03-05T23:05')), null);
});
