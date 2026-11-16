/* Rounds and the dose log (src/logic/rounds.js), and supply (src/logic/supply.js).
 *
 * The protocol used here is the one in the design's own screens: somatropin
 * morning and bedtime, BPC-157 in the morning, testosterone on Monday and
 * Thursday mornings, ipamorelin at bedtime. That makes the expected numbers
 * checkable against the handoff by eye: five doses on a Thursday, four on a
 * Wednesday, a week strip of 5 4 4 5 4 4 4.
 *
 * 2 March 2026 is a Monday. All times are local.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/supply.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['TL_DAY_MS']
});

const at = (text) => local(text).toISOString();
const MON = '2026-03-02', WED = '2026-03-04', THU = '2026-03-05';

const compound = (key, name, dose, rule, slots, extra) => Object.assign(
  { key, name, drugId: null, dose: app.tlParseDose(dose), route: 'sq', rule, slots, inv: null }, extra);
const protocol = (over) => Object.assign({
  name: 'P', start: MON, weeks: 12, pct: '', created: null, discreet: false,
  slots: { am: { t: 420, alert: true }, mid: { t: 750, alert: true }, eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } },
  compounds: [
    compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed']),
    compound('bpc', 'BPC-157', '250 mcg', { daily: true }, ['am']),
    compound('test', 'Testosterone cyp', '80 mg', { weekdays: [1, 4] }, ['am'], { route: 'im' }),
    compound('ipa', 'Ipamorelin', '200 mcg', { daily: true }, ['bed'])
  ]
}, over);
const record = () => ({ entries: [], proto: null });
const ids = (rounds) => rounds.map((r) => r.slot + ': ' + r.doses.map((x) => x.key + (x.at ? '*' : '')).join(' '));

/* ---- which rounds -------------------------------------------------------- */

test('a Thursday has two rounds and five doses; a Wednesday has four', () => {
  same(ids(app.tlRoundsFor(protocol(), THU, [])), ['am: gh bpc test', 'bed: gh ipa']);
  same(ids(app.tlRoundsFor(protocol(), WED, [])), ['am: gh bpc', 'bed: gh ipa']);
});

test('a round carries its slot\'s label, icon, time and alert switch', () => {
  const p = protocol();
  p.slots.bed.alert = false;
  const [am, bed] = app.tlRoundsFor(p, THU, []);
  same([am.label, am.icon, am.time, am.alert], ['Morning', 'ph-sun-horizon', '07:00', true]);
  same([bed.label, bed.icon, bed.time, bed.alert], ['Bedtime', 'ph-moon', '22:30', false]);
});

test('a dose knows its id, compound, dose text, slot and day', () => {
  const dose = app.tlRoundsFor(protocol(), THU, [])[0].doses[2];
  same(plain(dose), { id: 'test:am:2026-03-05', key: 'test', name: 'Testosterone cyp', dose: '80 mg',
                      slot: 'am', day: '2026-03-05', at: null, ts: null });
  same(app.tlParseDoseId('test:am:2026-03-05'), { key: 'test', slot: 'am', day: '2026-03-05' });
  assert.equal(app.tlParseDoseId('test:noon:2026-03-05'), null);
  assert.equal(app.tlParseDoseId('nonsense'), null);
});

test('rounds are in order of their times, not of the slots\' names', () => {
  const p = protocol();
  p.slots.bed.t = 300;                               /* someone sets "bedtime" to 05:00 */
  same(app.tlRoundsFor(p, THU, []).map((r) => r.slot), ['bed', 'am']);
});

test('a slot with nothing due that day is not a round', () => {
  const p = protocol({ compounds: [compound('test', 'Testosterone cyp', '80 mg', { weekdays: [1, 4] }, ['eve'])] });
  same(app.tlRoundsFor(p, WED, []), []);
  same(app.tlRoundsFor(p, THU, []).map((r) => r.slot), ['eve']);
});

test('a compound with no rule, or in no slot, is in no round', () => {
  const p = protocol({ compounds: [
    compound('pulse', 'Pulse thing', '1 mg', null, ['am']),
    compound('loose', 'Unslotted', '1 mg', { daily: true }, [])
  ] });
  same(app.tlRoundsFor(p, THU, []), []);
});

test('the week strip counts doses per day: 5 4 4 5 4 4 4', () => {
  same(app.tlWeekCounts(protocol(), MON).map((d) => d.count), [5, 4, 4, 5, 4, 4, 4]);
  same(app.tlWeekCounts(protocol(), MON).map((d) => d.weekday), [1, 2, 3, 4, 5, 6, 0]);
});

/* ---- rules beyond weekdays ----------------------------------------------- */

test('an every-other-day compound is due on alternate days from the protocol\'s start', () => {
  const p = protocol({ compounds: [compound('x', 'X', '1 mg', { every: { days: 2 } }, ['am'])] });
  const due = (day) => app.tlRoundsFor(p, day, []).length;
  same(['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'].map(due), [1, 0, 1, 0]);
});

test('a rule\'s own start date is used before the protocol\'s', () => {
  const p = protocol({ compounds: [compound('x', 'X', '1 mg', { every: { days: 2 }, start: '2026-03-03' }, ['am'])] });
  same(['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'].map((d) => app.tlRoundsFor(p, d, []).length), [0, 1, 0, 1]);
});

test('a weekday rule still works on a protocol with no dates at all', () => {
  const p = protocol({ start: null, compounds: [compound('test', 'T', '80 mg', { weekdays: [1, 4] }, ['am'])] });
  same([WED, THU].map((d) => app.tlRoundsFor(p, d, []).length), [0, 1]);
});

test('a taper shows that week\'s dose, and the compound leaves its round when the taper ends', () => {
  const p = protocol({ compounds: [compound('tam', 'Tamoxifen', '40 mg', { taper: ['40mg', '20mg'], per: 'week' }, ['am'])] });
  const dose = (day) => { const r = app.tlRoundsFor(p, day, []); return r.length ? r[0].doses[0].dose : null; };
  same(['2026-03-02', '2026-03-08', '2026-03-09', '2026-03-15', '2026-03-16'].map(dose), ['40mg', '40mg', '20mg', '20mg', null]);
});

test('five on, two off skips the off days', () => {
  const p = protocol({ compounds: [compound('x', 'X', '1 mg', { daily: true, pattern: { on: 5, off: 2 } }, ['bed'])] });
  same(app.tlWeekCounts(p, MON).map((d) => d.count), [1, 1, 1, 1, 1, 0, 0]);
});

/* ---- logging ------------------------------------------------------------- */

test('logging a dose adds a medication entry that says which dose it was', () => {
  const d = record(), p = protocol();
  const e = app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03'));
  same(plain(e), { type: 'medication', ts: at('2026-03-05T07:03'), medication: 'BPC-157', dose: '250 mcg',
                   site: null, notes: '', key: 'bpc', slot: 'am', day: '2026-03-05' });
  assert.equal(d.entries.length, 1);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh bpc* test', 'bed: gh ipa']);
  same(app.tlRoundsTally(app.tlRoundsFor(p, THU, d.entries)), { total: 5, done: 1, pending: 4 });
});

test('a dose form can record a different dose, a site and a note', () => {
  const d = record();
  const e = app.tlLogDose(d, protocol(), 'test:am:2026-03-05', at('2026-03-05T07:05'),
    { dose: '100 mg', site: 'Right dorsogluteal', siteId: 'dg-r', notes: 'a little sore' });
  same([e.dose, e.site, e.siteId, e.notes], ['100 mg', 'Right dorsogluteal', 'dg-r', 'a little sore']);
});

test('a dose cannot be logged twice, and an id that names nothing due is refused', () => {
  const d = record(), p = protocol();
  assert.ok(app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03')));
  assert.equal(app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:04')), null);
  assert.equal(app.tlLogDose(d, p, 'test:am:2026-03-04', at('2026-03-04T07:00')), null);   /* not due on Wednesday */
  assert.equal(app.tlLogDose(d, p, 'bpc:eve:2026-03-05', at('2026-03-05T18:00')), null);   /* not in that slot */
  assert.equal(app.tlLogDose(d, p, 'nobody:am:2026-03-05', at('2026-03-05T07:00')), null);
  assert.equal(d.entries.length, 1);
});

test('undo removes the entry and the dose is pending again', () => {
  const d = record(), p = protocol();
  app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03'));
  const gone = app.tlUndoDose(d, p, 'bpc:am:2026-03-05');
  assert.equal(gone.medication, 'BPC-157');
  assert.equal(d.entries.length, 0);
  assert.equal(app.tlUndoDose(d, p, 'bpc:am:2026-03-05'), null);
});

test('"Log round" logs every pending dose in it, each with its own timestamp', () => {
  const d = record(), p = protocol();
  app.tlLogDose(d, p, 'gh:am:2026-03-05', at('2026-03-05T07:02'));
  const added = app.tlLogRound(d, p, 'am', THU, at('2026-03-05T07:10'));
  same(added.map((e) => e.key), ['bpc', 'test']);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh* bpc* test*', 'bed: gh ipa']);
  /* Import and the cross-tab merge treat two entries with one ts as one entry. */
  assert.equal(new Set(d.entries.map((e) => e.ts)).size, d.entries.length);
  assert.equal(app.tlNextDueRound(app.tlRoundsFor(p, THU, d.entries)).slot, 'bed');
  same(app.tlLogRound(d, p, 'am', THU, at('2026-03-05T07:11')), []);
});

test('undoing a round puts every dose in it back, and leaves the other round alone', () => {
  const d = record(), p = protocol();
  app.tlLogRound(d, p, 'am', THU, at('2026-03-05T07:10'));
  app.tlLogRound(d, p, 'bed', THU, at('2026-03-05T22:31'));
  assert.equal(app.tlUndoRound(d, p, 'am', THU).length, 3);
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh bpc test', 'bed: gh* ipa*']);
  assert.equal(app.tlNextDueRound(app.tlRoundsFor(p, THU, d.entries)).slot, 'am');
});

test('when everything is logged there is no next round', () => {
  const d = record(), p = protocol();
  app.tlLogRound(d, p, 'am', WED, at('2026-03-04T07:10'));
  app.tlLogRound(d, p, 'bed', WED, at('2026-03-04T22:31'));
  assert.equal(app.tlNextDueRound(app.tlRoundsFor(p, WED, d.entries)), null);
});

/* ---- doses logged the old way -------------------------------------------- */

const legacy = (name, when) => ({ type: 'medication', ts: at(when), medication: name, dose: '', site: null, notes: '' });

test('a dose logged from an old screen, with no slot, ticks off the round nearest its time', () => {
  const p = protocol();
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-05T07:20')])), ['am: gh* bpc test', 'bed: gh ipa']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-05T21:50')])), ['am: gh bpc test', 'bed: gh* ipa']);
});

test('two old-style doses of a twice-a-day compound tick both rounds', () => {
  const entries = [legacy('Somatropin', '2026-03-05T22:40'), legacy('Somatropin', '2026-03-05T07:20')];
  same(ids(app.tlRoundsFor(protocol(), THU, entries)), ['am: gh* bpc test', 'bed: gh* ipa']);
});

test('an old-style dose only counts for its own compound and its own local day', () => {
  const p = protocol();
  same(ids(app.tlRoundsFor(p, THU, [legacy('somatropin', '2026-03-05T07:20')])), ['am: gh bpc test', 'bed: gh ipa']);
  same(ids(app.tlRoundsFor(p, THU, [legacy('Somatropin', '2026-03-04T23:50')])), ['am: gh bpc test', 'bed: gh ipa']);
});

test('an old-style dose can be undone from the new list', () => {
  const d = { entries: [legacy('BPC-157', '2026-03-05T07:20')], proto: null };
  assert.equal(app.tlUndoDose(d, protocol(), 'bpc:am:2026-03-05').medication, 'BPC-157');
  assert.equal(d.entries.length, 0);
});

test('a bedtime dose ticked off after midnight belongs to the evening it was due', () => {
  const d = record(), p = protocol();
  const e = app.tlLogDose(d, p, 'ipa:bed:2026-03-05', at('2026-03-06T00:20'));
  assert.equal(e.day, '2026-03-05');
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh bpc test', 'bed: gh ipa*']);
  same(ids(app.tlRoundsFor(p, '2026-03-06', d.entries)), ['am: gh bpc', 'bed: gh ipa']);
});

test('a dose already taken still counts when the compound is moved to another round', () => {
  const d = record(), p = protocol();
  app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03'));
  p.compounds[1].slots = ['bed'];
  same(ids(app.tlRoundsFor(p, THU, d.entries)), ['am: gh test', 'bed: gh bpc* ipa']);
});

test('the day of an instant is the local day', () => {
  assert.equal(app.tlDayKey(local('2026-03-05T23:59')), '2026-03-05');
  assert.equal(app.tlDayKey(at('2026-03-05T00:01')), '2026-03-05');
  assert.equal(app.tlDayKey('2026-03-05'), '2026-03-05');
  assert.equal(app.tlDayKey('not a date'), null);
});

/* ---- supply -------------------------------------------------------------- */

const withInv = (inv) => {
  const p = protocol();
  Object.keys(inv).forEach((key) => { app.tlCompound(p, key).inv = Object.assign({ since: at('2026-03-01T12:00') }, inv[key]); });
  return p;
};

test('daily use is doses a day at the protocol\'s rate', () => {
  const p = protocol();
  const use = (key) => app.tlDailyUse(p, app.tlCompound(p, key), THU);
  assert.equal(use('gh'), 2);
  assert.equal(use('bpc'), 1);
  assert.equal(use('test'), 2 / 7);
  const odd = protocol({ compounds: [compound('x', 'X', '1 mg', { every: { days: 3.5 } }, ['am']),
                                     compound('none', 'N', '1 mg', null, [])] });
  assert.equal(app.tlDailyUse(odd, odd.compounds[0], MON), 2 / 7);
  assert.equal(app.tlDailyUse(odd, odd.compounds[1], MON), 0);
});

test('supply is unknown until the user has entered doses per vial and doses left', () => {
  const p = protocol();
  assert.equal(app.tlSupply(p, app.tlCompound(p, 'bpc'), [], THU).known, false);
  app.tlCompound(p, 'bpc').inv = { per: null, left: null, spare: 2, since: null };   /* carried over from old vials */
  const s = app.tlSupply(p, app.tlCompound(p, 'bpc'), [], THU);
  same([s.known, s.spare, s.days, s.state], [false, 2, null, null]);
  same(app.tlSupplyAll(p, [], THU), []);
});

test('the design\'s own numbers: six days and no spare is danger, a spare makes it a warning', () => {
  const p = withInv({ bpc: { per: 20, left: 7, spare: 0 }, gh: { per: 18, left: 11, spare: 1 }, test: { per: 25, left: 19, spare: 0 } });
  const d = record();
  app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03'));
  app.tlLogDose(d, p, 'gh:am:2026-03-05', at('2026-03-05T07:02'));
  const row = (key) => { const s = app.tlSupply(p, app.tlCompound(p, key), d.entries, THU); return [s.left, s.days, s.state, s.stock, s.note]; };
  same(row('bpc'), [6, 6, 'danger', 'No spare vial · reorder', '6 of 20 doses left in the vial']);
  same(row('gh'), [10, 5, 'warn', '1 spare vial · open it in 5 d', '10 of 18 doses left in the vial']);
  same(row('test'), [19, 67, 'ok', 'No spare vial', '19 of 25 doses left in the vial']);
});

test('logging lowers the count and undo raises it again', () => {
  const p = withInv({ bpc: { per: 20, left: 7, spare: 0 } }), d = record();
  const left = () => app.tlSupply(p, app.tlCompound(p, 'bpc'), d.entries, THU).left;
  assert.equal(left(), 7);
  app.tlLogDose(d, p, 'bpc:am:2026-03-05', at('2026-03-05T07:03'));
  assert.equal(left(), 6);
  app.tlUndoDose(d, p, 'bpc:am:2026-03-05');
  assert.equal(left(), 7);
});

test('doses logged before the count was entered do not come off it', () => {
  const p = withInv({ bpc: { per: 20, left: 7, spare: 0, since: at('2026-03-05T12:00') } });
  const entries = [legacy('BPC-157', '2026-03-05T07:00'), legacy('BPC-157', '2026-03-04T07:00')];
  assert.equal(app.tlSupply(p, app.tlCompound(p, 'bpc'), entries, THU).left, 7);
});

test('a dose logged the old way, by name, comes off the count too', () => {
  const p = withInv({ bpc: { per: 20, left: 7, spare: 0 } });
  assert.equal(app.tlSupply(p, app.tlCompound(p, 'bpc'), [legacy('BPC-157', '2026-03-05T07:00')], THU).left, 6);
});

test('when the open vial runs out, a spare is opened', () => {
  const p = withInv({ bpc: { per: 10, left: 2, spare: 1 } });
  const entries = ['2026-03-03', '2026-03-04', '2026-03-05'].map((day) => legacy('BPC-157', day + 'T07:00'));
  const s = app.tlSupply(p, app.tlCompound(p, 'bpc'), entries, THU);
  same([s.left, s.spare, s.stock], [9, 0, 'No spare vial']);
});

test('with nothing left and no spare, it is zero days and danger, never negative', () => {
  const p = withInv({ bpc: { per: 10, left: 1, spare: 0 } });
  const entries = ['2026-03-03', '2026-03-04', '2026-03-05'].map((day) => legacy('BPC-157', day + 'T07:00'));
  const s = app.tlSupply(p, app.tlCompound(p, 'bpc'), entries, THU);
  same([s.left, s.days, s.state, s.stock], [0, 0, 'danger', 'No spare vial · reorder']);
});

test('the three states: danger at 7 days with no spare, ok above 21, warn between', () => {
  const state = (left, spare) => {
    const p = withInv({ bpc: { per: 60, left, spare } });
    return app.tlSupply(p, app.tlCompound(p, 'bpc'), [], THU).state;
  };
  assert.equal(state(7, 0), 'danger');
  assert.equal(state(8, 0), 'warn');
  assert.equal(state(21, 0), 'warn');
  assert.equal(state(22, 0), 'ok');
  assert.equal(state(7, 1), 'warn');
  assert.equal(state(22, 3), 'ok');
});

test('several spare vials read in the plural', () => {
  const p = withInv({ bpc: { per: 20, left: 5, spare: 2 } });
  assert.equal(app.tlSupply(p, app.tlCompound(p, 'bpc'), [], THU).stock, '2 spare vials · open one in 5 d');
});

test('the inventory list is soonest-out first, and only compounds with a count', () => {
  const p = withInv({ bpc: { per: 20, left: 7, spare: 0 }, gh: { per: 18, left: 11, spare: 1 }, test: { per: 25, left: 19, spare: 0 } });
  same(app.tlSupplyAll(p, [], THU).map((s) => [s.key, s.days]), [['gh', 6], ['bpc', 7], ['test', 67]]);
});

test('setting the inventory refuses numbers that cannot be right, and changes nothing when it does', () => {
  const c = compound('x', 'X', '1 mg', { daily: true }, ['am']);
  same(app.tlSetInventory(c, { per: 20, left: 7, spare: 1 }, at('2026-03-05T08:00')),
    { per: 20, left: 7, spare: 1, since: at('2026-03-05T08:00') });
  for (const bad of [{ per: 0, left: 0 }, { per: 20, left: 21 }, { per: 20, left: -1 }, { per: 20, left: 5, spare: -1 }, { per: 'x', left: 1 }]) {
    assert.equal(app.tlSetInventory(c, bad, at('2026-03-05T09:00')), null, JSON.stringify(bad));
  }
  assert.equal(c.inv.left, 7);
});

test('one pip per dose in the vial, filled for the doses left', () => {
  same(app.tlSupplyPips({ per: 5, left: 2 }), [true, true, false, false, false]);
  same(app.tlSupplyPips({ per: null, left: null }), []);
});
