/* Rounds after the Phase 1 review: which entry ticks which dose
 * (src/logic/rounds.js), and the alerts that follow from it
 * (src/logic/alerts.js).
 *
 * Each test pins either something the review found wrong or something the
 * fix for it must keep working:
 *
 *   - A dose logged from an old screen after midnight is last night's bedtime
 *     dose, when the compound is in the bedtime round and was due last night.
 *   - An entry for a dose that is already ticked is a second record of it, not
 *     a dose hours away.
 *   - Two protocol lines with one name share no entry.
 *   - The dose written into the log is the text the user typed.
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
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/supply.js', 'src/logic/alerts.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['TL_DAY_MS']
});

const at = (text) => local(text).toISOString();
const ms = (text) => local(text).getTime();
const MON = '2026-03-02', THU = '2026-03-05', FRI = '2026-03-06';

const compound = (key, name, dose, rule, slots, extra) => Object.assign(
  { key, name, drugId: null, dose: app.tlParseDose(dose), route: 'sq', rule, slots, inv: null }, extra);
const protocol = (compounds, over) => Object.assign({
  name: 'P', start: MON, weeks: 12, pct: '', created: null, discreet: false,
  slots: { am: { t: 420, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } },
  compounds
}, over);
const legacy = (name, when, extra) => Object.assign(
  { type: 'medication', ts: at(when), medication: name, dose: '', site: null, notes: '' }, extra);
const ids = (rounds) => rounds.map((r) => r.slot + ': ' + r.doses.map((x) => x.key + (x.at ? '*' : '')).join(' '));
const plan = (p, entries, from) => app.tlAlertPlan(p, entries, ms(from), 1).map((x) => x.alert.title);

const gh = () => compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed']);
const bpc = () => compound('bpc', 'BPC-157', '250 mcg', { daily: true }, ['am']);
const ipa = (rule) => compound('ipa', 'Ipamorelin', '200 mcg', rule || { daily: true }, ['bed']);

/* ---- a bedtime dose logged from an old screen after midnight -------------- */

test('an old-screen bedtime dose logged at 00:20 ticks the evening before, and the next day stays pending', () => {
  const p = protocol([bpc(), ipa()]);
  const entries = [legacy('Ipamorelin', '2026-03-06T00:20')];
  same(ids(app.tlRoundsFor(p, THU, entries)), ['am: bpc', 'bed: ipa*']);
  same(ids(app.tlRoundsFor(p, FRI, entries)), ['am: bpc', 'bed: ipa']);
  same(plan(p, entries, '2026-03-06T06:00'), ['Morning round · 1 dose', 'Bedtime round · 1 dose']);
  const d = { entries: entries.slice() };
  assert.ok(app.tlLogDose(d, p, 'ipa:bed:2026-03-06', at('2026-03-06T22:30')), 'Friday\'s bedtime dose can still be logged');
});

test('for a morning-and-bedtime compound, a dose at 00:20 is last night\'s, not the next morning\'s', () => {
  const p = protocol([gh()]);
  const entries = [legacy('Somatropin', '2026-03-06T00:20')];
  same(ids(app.tlRoundsFor(p, THU, entries)), ['am: gh', 'bed: gh*']);
  same(ids(app.tlRoundsFor(p, FRI, entries)), ['am: gh', 'bed: gh']);
  same(plan(p, entries, '2026-03-06T06:00'), ['Morning round · 1 dose', 'Bedtime round · 1 dose']);
});

test('someone who logs every bedtime dose at 00:20 from an old screen has each night ticked once', () => {
  const p = protocol([ipa()]);
  const entries = ['03', '04', '05', '06', '07'].map((d) => legacy('Ipamorelin', `2026-03-${d}T00:20`));
  const days = ['02', '03', '04', '05', '06', '07'].map((d) => `2026-03-${d}`);
  same(days.map((day) => ids(app.tlRoundsFor(p, day, entries))[0]),
    ['bed: ipa*', 'bed: ipa*', 'bed: ipa*', 'bed: ipa*', 'bed: ipa*', 'bed: ipa']);
  /* Every entry is counted for exactly one day, whichever day is asked about. */
  const claimed = days.reduce((n, day) => n + app.tlRoundsTally(app.tlRoundsFor(p, day, entries)).done, 0);
  assert.equal(claimed, entries.length);
});

test('an after-midnight dose of a compound with no bedtime round keeps its own day', () => {
  const p = protocol([bpc()]);
  const entries = [legacy('BPC-157', '2026-03-06T00:20')];
  same(ids(app.tlRoundsFor(p, THU, entries)), ['am: bpc']);
  same(ids(app.tlRoundsFor(p, FRI, entries)), ['am: bpc*']);
});

test('an after-midnight dose keeps its own day when the compound was not due the evening before', () => {
  const thuOnly = protocol([ipa({ weekdays: [4] })]);
  same(ids(app.tlRoundsFor(thuOnly, THU, [legacy('Ipamorelin', '2026-03-06T00:20')])), ['bed: ipa*']);
  const friOnly = protocol([ipa({ weekdays: [5] })]);
  same(ids(app.tlRoundsFor(friOnly, THU, [legacy('Ipamorelin', '2026-03-06T00:20')])), []);
  same(ids(app.tlRoundsFor(friOnly, FRI, [legacy('Ipamorelin', '2026-03-06T00:20')])), ['bed: ipa*']);
});

test('the evening before ends at 04:00, where the morning slot starts', () => {
  const p = protocol([gh()]);
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-06T03:59')])), ['am: gh', 'bed: gh*']);
  same(ids(app.tlRoundsFor(p, FRI, [legacy('Somatropin', '2026-03-06T03:59')])), ['am: gh', 'bed: gh']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-06T04:00')])), ['am: gh', 'bed: gh']);
  same(ids(app.tlRoundsFor(p, FRI, [legacy('Somatropin', '2026-03-06T04:00')])), ['am: gh*', 'bed: gh']);
});

test('the evening before is the calendar day before, on the nights the clocks change', () => {
  /* The mornings after Chicago's and Auckland's changes, both ways, in 2026.
     A day 23 or 25 hours long must not move the dose to the wrong evening. */
  const p = protocol([gh()]);
  for (const [evening, morning] of [['2026-03-08', '2026-03-09'], ['2026-11-01', '2026-11-02'],
                                    ['2026-04-05', '2026-04-06'], ['2026-09-27', '2026-09-28']]) {
    const entries = [legacy('Somatropin', morning + 'T00:20')];
    same(ids(app.tlRoundsFor(p, evening, entries)), ['am: gh', 'bed: gh*'], evening);
    same(ids(app.tlRoundsFor(p, morning, entries)), ['am: gh', 'bed: gh'], morning);
  }
});

test('a second record of last night\'s dose after midnight does not tick the next morning', () => {
  const p = protocol([gh()]), d = { entries: [] };
  app.tlLogDose(d, p, 'gh:bed:2026-03-05', at('2026-03-05T22:35'));
  d.entries.unshift(legacy('Somatropin', '2026-03-06T00:20'));
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh', 'bed: gh*']);
  same(ids(app.tlRoundsFor(p, FRI, d.entries)), ['am: gh', 'bed: gh']);
});

/* ---- a second record of a dose already ticked ----------------------------- */

test('an old-screen record of a dose already ticked is a duplicate, not the bedtime dose', () => {
  const p = protocol([gh()]), d = { entries: [] };
  app.tlLogDose(d, p, 'gh:am:2026-03-05', at('2026-03-05T07:00'));
  d.entries.unshift(legacy('Somatropin', '2026-03-05T07:30', { site: 'L Glute', notes: 'real record' }));
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh*', 'bed: gh']);
  same(plan(p, d.entries, '2026-03-05T08:00'), ['Bedtime round · 1 dose']);
  assert.equal(app.tlUndoDose(d, p, 'gh:bed:2026-03-05'), null);
  assert.equal(d.entries.length, 2, 'undoing a pending dose removes nothing');
  assert.ok(app.tlLogDose(d, p, 'gh:bed:2026-03-05', at('2026-03-05T22:30')), 'the bedtime dose can still be logged');
});

test('two entries that both name the morning dose tick it once and leave bedtime pending', () => {
  const p = protocol([gh()]);
  const named = (when) => ({ type: 'medication', ts: at(when), medication: 'Somatropin', dose: '2 IU',
                             key: 'gh', slot: 'am', day: THU });
  const entries = [named('2026-03-05T07:05'), named('2026-03-05T07:00')];
  const rounds = app.tlRoundsFor(p, THU, entries);
  same(ids(rounds), ['am: gh*', 'bed: gh']);
  assert.equal(rounds[0].doses[0].at, at('2026-03-05T07:00'), 'the first record is the one that ticks it');
});

test('an old-screen dose at 19:00 is still an early bedtime dose', () => {
  const p = protocol([gh()]), d = { entries: [] };
  app.tlLogDose(d, p, 'gh:am:2026-03-05', at('2026-03-05T07:00'));
  d.entries.unshift(legacy('Somatropin', '2026-03-05T19:00'));
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh*', 'bed: gh*']);
});

test('clearing a round removes every record of its doses and leaves the other round alone', () => {
  const p = protocol([gh()]);
  const d = { entries: [legacy('Somatropin', '2026-03-05T08:00'), legacy('Somatropin', '2026-03-05T07:10')] };
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh*', 'bed: gh']);
  const removed = app.tlUndoRound(d, p, 'am', THU);
  same(removed.map((e) => e.ts).sort(), [at('2026-03-05T07:10'), at('2026-03-05T08:00')]);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh', 'bed: gh']);
});

test('clearing a round keeps a dose of another round that was logged before it', () => {
  const p = protocol([gh()]);
  const d = { entries: [legacy('Somatropin', '2026-03-05T22:40'), legacy('Somatropin', '2026-03-05T07:10')] };
  assert.equal(app.tlUndoRound(d, p, 'am', THU).length, 1);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh', 'bed: gh*']);
});

/* ---- two protocol lines with the same name -------------------------------- */

const twins = (slots2) => protocol([
  compound('hgh', 'HGH', '2 IU', { daily: true }, ['am']),
  compound('hgh-2', 'HGH', '1 IU', { daily: true }, slots2 || ['am'])
]);

test('one old-style entry ticks one of two lines with the same name, not both', () => {
  const p = twins();
  same(ids(app.tlRoundsFor(p, THU, [legacy('HGH', '2026-03-05T08:00')])), ['am: hgh* hgh-2']);
  /* The other line's dose is still due, so the morning alert still fires for it. */
  same(plan(p, [legacy('HGH', '2026-03-05T05:30')], '2026-03-05T06:00'), ['Morning round · 1 dose']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('HGH', '2026-03-05T08:00'), legacy('HGH', '2026-03-05T08:05')])),
    ['am: hgh* hgh-2*']);
});

test('one old-style entry goes to the nearer of two same-name lines in different rounds', () => {
  const p = twins(['bed']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('HGH', '2026-03-05T08:00')])), ['am: hgh*', 'bed: hgh-2']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('HGH', '2026-03-05T22:00')])), ['am: hgh', 'bed: hgh-2*']);
});

test('undoing a same-name line\'s pending dose does not delete the other line\'s entry', () => {
  const p = twins(['bed']);
  const d = { entries: [legacy('HGH', '2026-03-05T08:00')] };
  assert.equal(app.tlUndoDose(d, p, 'hgh-2:bed:2026-03-05'), null);
  assert.equal(d.entries.length, 1);
  assert.equal(app.tlUndoDose(d, p, 'hgh:am:2026-03-05').ts, at('2026-03-05T08:00'));
  assert.equal(d.entries.length, 0);
});

/* ---- what is written into the log ----------------------------------------- */

test('the dose written into the log is the text the user typed, so the level chart reads its unit', () => {
  const p = protocol([compound('bpc', 'BPC-157', '250 mcg/day', { daily: true }, ['am']),
                      compound('gh', 'Somatropin', '250mcg twice daily', { daily: true }, ['bed'])]);
  const d = { entries: [] };
  assert.equal(app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:00')).dose, '250 mcg/day');
  assert.equal(app.tlLogDose(d, p, 'gh:bed:2026-03-05', at('2026-03-05T22:30')).dose, '250mcg twice daily');
});

test('a taper logs that week\'s dose, and a dose the user changed is logged as they typed it', () => {
  const p = protocol([compound('tam', 'Tamoxifen', '20 mg', { taper: ['40mg', '20mg'], per: 'week' }, ['am'])]);
  const d = { entries: [] };
  assert.equal(app.tlLogDose(d, p, 'tam:am:2026-03-03', at('2026-03-03T07:00')).dose, '40mg');
  assert.equal(app.tlLogDose(d, p, 'tam:am:2026-03-10', at('2026-03-10T07:00')).dose, '20mg');
  assert.equal(app.tlLogDose(d, p, 'tam:am:2026-03-11', at('2026-03-11T07:00'), { dose: '10mg' }).dose, '10mg');
});


/* ---- the evening before, with the protocol's own times ------------------ */

test('a bedtime round set after midnight is its own day\'s: a dose at 00:35 ticks that day\'s bedtime', () => {
  const p = protocol([gh(), ipa()], { slots: { am: { t: 420, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 30, alert: true } } });
  const entries = [legacy('Ipamorelin', '2026-03-06T00:35'), legacy('Somatropin', '2026-03-06T00:35')];
  same(ids(app.tlRoundsFor(p, FRI, entries)), ['bed: gh* ipa*', 'am: gh']);
  same(ids(app.tlRoundsFor(p, THU, entries)), ['bed: gh ipa', 'am: gh']);
  /* Nothing is left for an alert: the round was logged on its own day. */
  assert.equal(app.tlDueBanner(p, entries, ms('2026-03-06T01:00')), null);
});

test('within the hour before the morning round, an early-hours dose is that morning\'s', () => {
  const p = protocol([gh()], { slots: { am: { t: 270, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } } });
  const d = { entries: [] };
  app.tlLogDose(d, p, 'gh:bed:2026-03-05', at('2026-03-05T22:30'));
  d.entries.unshift(legacy('Somatropin', '2026-03-06T03:50'));
  same(ids(app.tlRoundsFor(p, FRI, d.entries)), ['am: gh*', 'bed: gh']);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh', 'bed: gh*']);
  /* Earlier than the hour before, it is still last night's. */
  same(ids(app.tlRoundsFor(p, FRI, [legacy('Somatropin', '2026-03-06T03:20')])), ['am: gh', 'bed: gh']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-06T03:20')])), ['am: gh', 'bed: gh*']);
});

test('the day an entry counts for is the same whichever day is asked, with the protocol\'s own times', () => {
  /* Every quarter hour of a night, for a few slot settings: each entry is
     counted on exactly one of the two days. */
  for (const [am, bed] of [[420, 1350], [270, 1350], [420, 30], [420, 1439], [240, 1230]]) {
    const p = protocol([gh(), ipa()], { slots: { am: { t: am, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: bed, alert: true } } });
    for (let m = 0; m < 300; m += 15) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
      const entries = [legacy('Ipamorelin', '2026-03-06T' + hh + ':' + mm)];
      const count = (day) => app.tlRoundsFor(p, day, entries).reduce((n, r) => n + r.doses.filter((x) => x.at).length, 0);
      assert.equal(count(THU) + count(FRI), 1, `am ${am}, bed ${bed}, entry at ${hh}:${mm}`);
    }
  }
});
