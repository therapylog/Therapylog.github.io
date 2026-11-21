/* The protocol model: src/logic/protocol.js.
 *
 * Two kinds of test. The small ones pin each helper. The large one takes the
 * demo patient's backup, the same file the fixture check restores, and reads
 * its free-text protocol as the model, compound by compound: this is the
 * migration every existing user's protocol goes through.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, same, plain } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays'],
  consts: ['tlLocalDate']
});

/* What the app's encyclopedia would say, for the names used here. */
const IDS = { 'Testosterone Cypionate': 'tc', 'BPC-157': 'bpc', 'CJC-1295': 'cjc', 'Ipamorelin': 'ipa',
              'Anastrozole': 'ai1', 'HCG': 'hcg2' };
const MEDIUM = { tc: 'oil', bpc: 'aq', cjc: 'aq', ipa: 'aq', ai1: 'oral', hcg2: 'aq' };
const env = { resolve: (n) => IDS[n] || null, medium: (id) => MEDIUM[id] || null, discreet: false };

const record = (meds, extra) => Object.assign({
  entries: [], proto: { name: 'P', start: '2026-03-02', weeks: 12, meds, pct: '', _created: '2026-03-02T12:00:00.000Z' }
}, extra);
const one = (line, extra) => app.tlProtocolFromLegacy(record(line, extra), env).compounds[0];

/* ---- clock times and slots ----------------------------------------------- */

test('times convert to minutes and back, and wrap past midnight', () => {
  assert.equal(app.tlTimeToMin('07:30'), 450);
  assert.equal(app.tlTimeToMin('0:05'), 5);
  assert.equal(app.tlTimeToMin('24:00'), null);
  assert.equal(app.tlTimeToMin('7.30'), null);
  assert.equal(app.tlTimeToMin(null), null);
  assert.equal(app.tlMinToTime(450), '07:30');
  assert.equal(app.tlMinToTime(1440 + 15), '00:15');
  assert.equal(app.tlMinToTime(-15), '23:45');
});

test('the four slots have the handoff\'s default times', () => {
  same(app.TL_SLOTS.map((s) => [s.key, s.label, app.tlMinToTime(s.t)]),
    [['am', 'Morning', '07:00'], ['mid', 'Midday', '12:30'], ['eve', 'Evening', '18:00'], ['bed', 'Bedtime', '22:30']]);
});

test('a clock time belongs to the slot whose span it falls in', () => {
  const slot = (t) => app.tlSlotOf(app.tlTimeToMin(t));
  same(['04:00', '07:30', '10:59'].map(slot), ['am', 'am', 'am']);
  same(['11:00', '12:30', '15:59'].map(slot), ['mid', 'mid', 'mid']);
  same(['16:00', '18:00', '20:29'].map(slot), ['eve', 'eve', 'eve']);
  same(['20:30', '22:30', '23:59', '00:00', '03:59'].map(slot), ['bed', 'bed', 'bed', 'bed', 'bed']);
  assert.equal(app.tlSlotOf(null), null);
});

test('reminder times become slots, one dose per slot', () => {
  same(app.tlSlotsFromTimes(['07:30', '20:00']).slots, ['am', 'eve']);
  same(app.tlSlotsFromTimes(['21:30']).slots, ['bed']);
  same(app.tlSlotsFromTimes([]).slots, []);
  same(app.tlSlotsFromTimes(['nonsense']).slots, []);
});

test('two times in one slot stay two doses: the later one moves to the next free slot', () => {
  const two = app.tlSlotsFromTimes(['08:00', '10:00']);
  same(two.slots, ['am', 'mid']);
  same(two.at, { am: 480, mid: 600 });
  /* A twice-daily compound left at one time on both rows is still twice daily. */
  same(app.tlSlotsFromTimes(['08:00', '08:00']).slots, ['am', 'mid']);
  /* Past bedtime it wraps to morning. */
  same(app.tlSlotsFromTimes(['21:00', '23:00']).slots, ['am', 'bed']);
});

test('a fifth time of day cannot be kept, and is reported rather than dropped silently', () => {
  const five = app.tlSlotsFromTimes(['06:00', '10:00', '14:00', '18:00', '22:00']);
  same(five.slots, ['am', 'mid', 'eve', 'bed']);
  same(five.dropped, ['22:00']);
});

/* ---- dose ---------------------------------------------------------------- */

test('a plain dose is read as an amount and a unit, and its text is kept', () => {
  same(app.tlParseDose('200mg'), { amount: 200, unit: 'mg', text: '200mg' });
  same(app.tlParseDose('250 mcg'), { amount: 250, unit: 'mcg', text: '250 mcg' });
  same(app.tlParseDose('2 IU'), { amount: 2, unit: 'IU', text: '2 IU' });
  same(app.tlParseDose('10 units'), { amount: 10, unit: 'units', text: '10 units' });
  same(app.tlParseDose('0.5ml'), { amount: 0.5, unit: 'mL', text: '0.5ml' });
  same(app.tlParseDose('.25 mg'), { amount: 0.25, unit: 'mg', text: '.25 mg' });
  same(app.tlParseDose('1 tab'), { amount: 1, unit: 'tab', text: '1 tab' });
  same(app.tlParseDose('100'), { amount: 100, unit: null, text: '100' });
});

test('words after the dose do not stop it being read', () => {
  assert.equal(app.tlParseDose('250mcg twice daily').amount, 250);
  assert.equal(app.tlParseDose('80 mg IM').amount, 80);
});

test('a dose that could mean more than one amount keeps its text and gets no amount', () => {
  for (const text of ['200mg/week', '250-500mcg', '0.5ml (100mg)', '5 mg per day', '10mg to 20mg',
                      '2x daily', 'a little', '', '0mg', '1,000mcg']) {
    same(app.tlParseDose(text), { amount: null, unit: null, text }, text);
  }
  same(app.tlParseDose(null), { amount: null, unit: null, text: '' });
});

test('a dose is shown as its amount when there is one, and as typed when there is not', () => {
  assert.equal(app.tlDoseText(app.tlParseDose('80mg')), '80 mg');
  assert.equal(app.tlDoseText(app.tlParseDose('200mg/week')), '200mg/week');
  assert.equal(app.tlDoseText(null), '');
});

/* ---- which days ---------------------------------------------------------- */

test('weekdays the user wrote out are found, and "monthly" is not Monday', () => {
  same(app.tlWeekdaysInText('Twice weekly (Mon/Thu)'), [1, 4]);
  same(app.tlWeekdaysInText('Monday, Wednesday and Friday'), [1, 3, 5]);
  same(app.tlWeekdaysInText('tues + sat'), [2, 6]);
  same(app.tlWeekdaysInText('Sunday'), [0]);
  assert.equal(app.tlWeekdaysInText('Monthly'), null);
  assert.equal(app.tlWeekdaysInText('Daily (pre-bed)'), null);
  assert.equal(app.tlWeekdaysInText(''), null);
});

test('each old frequency becomes a rule', () => {
  same(one('X, 1mg, Daily').rule, { daily: true });
  same(one('X, 1mg, Twice daily').rule, { daily: true });
  same(one('X, 1mg, EOD').rule, { every: { days: 2 } });
  same(one('X, 1mg, Every 3 days').rule, { every: { days: 3 } });
  same(one('X, 1mg, Monthly').rule, { monthly: true });
  /* An unrecognised phrase is daily today, and stays daily. */
  same(one('X, 1mg, when needed').rule, { daily: true });
  assert.equal(one('X, 1mg, when needed').freqText, 'when needed');
});

test('a weekly protocol with no days named falls where the old week view put it: from the start day', () => {
  /* The record starts on Monday 2 March 2026. */
  same(one('X, 1mg, Weekly').rule, { weekdays: [1] });
  same(one('X, 1mg, Twice weekly').rule, { weekdays: [1, 4] });
  /* From a Friday start: Friday, and three days on, Monday. */
  const friday = record('X, 1mg, Twice weekly');
  friday.proto.start = '2026-03-06';
  same(app.tlProtocolFromLegacy(friday, env).compounds[0].rule, { weekdays: [1, 5] });
});

test('weekdays the user named win over the start day', () => {
  const friday = record('X, 1mg, Twice weekly (Mon/Thu)');
  friday.proto.start = '2026-03-06';
  same(app.tlProtocolFromLegacy(friday, env).compounds[0].rule, { weekdays: [1, 4] });
  /* Named days are read even when the old parser called the line daily. */
  same(one('X, 1mg, Mon/Wed/Fri').rule, { weekdays: [1, 3, 5] });
});

test('the 10-day pulse, which the old week view never scheduled, has no rule and sits in no round', () => {
  const c = one('X, 1mg, 10-day pulse');
  assert.equal(c.rule, null);
  same(c.slots, []);
  assert.equal(c.freqText, '10-day pulse');
});

test('rules read back in words, weekdays Monday first', () => {
  const label = app.tlRuleLabel;
  assert.equal(label({ daily: true }), 'Daily');
  assert.equal(label({ weekdays: [1, 4] }), 'Mon · Thu');
  assert.equal(label({ weekdays: [0, 4] }), 'Thu · Sun');
  assert.equal(label({ weekdays: [0, 1, 2, 3, 4, 5, 6] }), 'Daily');
  assert.equal(label({ every: { days: 2 } }), 'Every other day');
  assert.equal(label({ every: { days: 3.5 } }), 'Every 3.5 days');
  assert.equal(label({ every: { weeks: 2 } }), 'Every 2 weeks');
  assert.equal(label({ monthly: true }), 'Monthly');
  assert.equal(label({ daily: true, pattern: { on: 5, off: 2 } }), 'Daily, 5 on 2 off');
  assert.equal(label({ taper: ['40mg', '40mg', '20mg', '20mg'], per: 'week' }), 'Taper, 4 weeks');
  assert.equal(label(null), 'No schedule');
});

/* ---- compounds ----------------------------------------------------------- */

test('a compound\'s key is its encyclopedia id, or its name made safe for a dose id', () => {
  assert.equal(one('BPC-157, 250mcg, Daily').key, 'bpc');
  assert.equal(one('My Blend: #2 (AM), 1mg, Daily').key, 'my-blend-2-am');
  assert.ok(!/[:\s]/.test(one('My Blend: #2 (AM), 1mg, Daily').key));
});

test('two lines for one compound get two different keys', () => {
  const p = app.tlProtocolFromLegacy(record('BPC-157, 250mcg, Daily\nBPC-157, 500mcg, Weekly'), env);
  same(p.compounds.map((c) => c.key), ['bpc', 'bpc-2']);
});

test('route comes from the formulation, and is unknown for a compound the encyclopedia does not have', () => {
  assert.equal(one('Testosterone Cypionate, 100mg, Weekly').route, 'im');
  assert.equal(one('BPC-157, 250mcg, Daily').route, 'sq');
  assert.equal(one('Anastrozole, 0.5mg, Weekly').route, 'oral');
  assert.equal(one('Mystery Peptide, 1mg, Daily').route, null);
  assert.equal(one('Mystery Peptide, 1mg, Daily').drugId, null);
});

test('with no stored times a compound takes the defaults the old screens used', () => {
  same(one('X, 1mg, Daily').slots, ['am']);                 /* 08:00 */
  same(one('X, 1mg, Twice daily').slots, ['am', 'bed']);    /* 08:00 and 21:00 */
  same(one('X, 1mg, Weekly').slots, ['am']);                /* 09:00 */
});

test('vials on hand carry over as spares, with doses per vial left for the user to enter', () => {
  const c = one('BPC-157, 250mcg, Daily', { supply: { 'BPC-157': { vials: 3, sinceTs: '2026-03-01T12:00:00.000Z' } } });
  same(c.inv, { per: null, left: null, spare: 2, since: '2026-03-01T12:00:00.000Z' });
  assert.equal(one('BPC-157, 250mcg, Daily').inv, null);
  assert.equal(one('BPC-157, 250mcg, Daily', { supply: { 'BPC-157': { vials: 0, sinceTs: null } } }).inv.spare, 0);
});

test('no protocol gives an empty model with the default slots', () => {
  const p = app.tlProtocolFromLegacy({ entries: [], proto: null }, env);
  same(p.compounds, []);
  same(p.slots, { am: { t: 420, alert: true }, mid: { t: 750, alert: true },
                  eve: { t: 1080, alert: true }, bed: { t: 1350, alert: true } });
  assert.equal(p.derived, true);
  same(app.tlProtocolFromLegacy(undefined, env).compounds, []);
});

/* ---- the demo patient ---------------------------------------------------- */

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'demo-backup.json'), 'utf8')).data;

test('the demo patient\'s free-text protocol reads as six compounds', () => {
  const p = app.tlProtocolFromLegacy(fixture, env);
  assert.equal(p.name, 'TRT + Peptide Optimization Protocol');
  assert.equal(p.start, '2026-09-17');                      /* a Thursday */
  assert.equal(p.weeks, 16);
  same(p.compounds.map((c) => [c.key, c.name, app.tlDoseText(c.dose), app.tlRuleLabel(c.rule), c.route, c.slots.join('+')]), [
    ['tc', 'Testosterone Cypionate', '200mg/week', 'Mon · Thu', 'im', 'am'],
    ['bpc', 'BPC-157', '250 mcg', 'Daily', 'sq', 'am+eve'],
    ['cjc', 'CJC-1295', '200 mcg', 'Daily', 'sq', 'bed'],
    ['ipa', 'Ipamorelin', '200 mcg', 'Daily', 'sq', 'bed'],
    /* No days named, so it follows the start day: Thursday, and Sunday. */
    ['ai1', 'Anastrozole', '0.5 mg', 'Thu · Sun', 'oral', 'am'],
    ['hcg2', 'HCG', '250 IU', 'Mon · Thu', 'sq', 'am']
  ]);
});

test('the demo patient\'s reminder times become three rounds', () => {
  const p = app.tlProtocolFromLegacy(fixture, env);
  /* Morning holds 08:00, 07:30, 08:00 and 08:30; the time most share wins. */
  same([p.slots.am.t, p.slots.eve.t, p.slots.bed.t].map(app.tlMinToTime), ['08:00', '20:00', '21:30']);
  /* Nothing was at midday, so it keeps its default. */
  assert.equal(app.tlMinToTime(p.slots.mid.t), '12:30');
});

test('reading the model changes nothing in the record', () => {
  const before = JSON.stringify(fixture);
  app.tlProtocol(fixture, env);
  assert.equal(JSON.stringify(fixture), before);
});

/* ---- storing ------------------------------------------------------------- */

test('migrating stores the derived protocol and a version, once, and keeps the old fields', () => {
  const d = JSON.parse(JSON.stringify(fixture));
  app.tlMigrateRecord(d, env);
  assert.equal(d.v, 3);
  assert.equal(d.protocol.compounds.length, 6);
  assert.equal(d.protocol.derived, undefined);
  assert.equal(d.proto.meds, fixture.proto.meds);
  same(d.reminderTimes, fixture.reminderTimes);
  /* Again, with the old text now edited: the stored protocol is the truth. */
  const stored = JSON.stringify(d.protocol);
  d.proto.meds = 'Something Else, 1mg, Daily';
  app.tlMigrateRecord(d, env);
  assert.equal(JSON.stringify(d.protocol), stored);
});

test('once a protocol is stored, it is what tlProtocol returns', () => {
  const d = JSON.parse(JSON.stringify(fixture));
  app.tlMigrateRecord(d, env);
  d.proto.meds = 'Something Else, 1mg, Daily';
  const p = app.tlProtocol(d, env);
  assert.equal(p.compounds.length, 6);
  assert.equal(p.derived, undefined);
});

test('storing a protocol rewrites the old fields so older readers still see it', () => {
  const d = JSON.parse(JSON.stringify(fixture));
  const p = app.tlProtocolFromLegacy(d, env);
  p.compounds[1].slots = ['am', 'mid', 'bed'];              /* BPC-157, now three times a day */
  p.slots.mid.t = 780;
  app.tlStoreProtocol(d, p);
  same(d.proto.meds.split('\n'), [
    'Testosterone Cypionate, 200mg/week, Twice weekly (Mon · Thu)',
    'BPC-157, 250mcg twice daily, Twice daily',
    'CJC-1295, 200mcg, Daily',
    'Ipamorelin, 200mcg, Daily',
    'Anastrozole, 0.5mg, Twice weekly (Thu · Sun)',
    'HCG, 250IU, Twice weekly (Mon · Thu)'
  ]);
  same(d.reminderTimes['BPC-157'], ['08:00', '13:00', '21:30']);
  same(d.reminderTimes['Testosterone Cypionate'], ['08:00']);
  assert.equal(d.proto.start, '2026-09-17');
});

test('the old fields written from a stored protocol read back as the same protocol', () => {
  const d = JSON.parse(JSON.stringify(fixture));
  app.tlStoreProtocol(d, app.tlProtocolFromLegacy(d, env));
  const again = app.tlProtocolFromLegacy({ entries: [], proto: d.proto, reminderTimes: d.reminderTimes }, env);
  const shape = (p) => p.compounds.map((c) => [c.key, c.dose.text, app.tlRuleLabel(c.rule), c.slots.join('+')]);
  /* plain(): both sides were built inside the vm context. */
  same(shape(again), plain(shape(d.protocol)));
  same(again.slots, plain(d.protocol.slots));
});

test('a comma typed into a compound name cannot break the old three-field line', () => {
  const d = { entries: [], proto: null };
  app.tlStoreProtocol(d, { compounds: [{ key: 'x', name: 'Blend A, B', dose: app.tlParseDose('1mg'),
    rule: { daily: true }, slots: ['am'] }], slots: {} });
  assert.equal(d.proto.meds, 'Blend A; B, 1mg, Daily');
});

test('a stored protocol missing parts is filled in rather than trusted', () => {
  const p = app.tlNormalizeProtocol({ compounds: [{ key: 'x', dose: '5mg', slots: ['bed', 'nope', 'am'] }, { name: 'no key' }],
    slots: { am: { t: 1500 }, bed: { t: 1350, alert: false } } });
  /* A compound with a name and no key is kept, with a key made from its name. */
  same(p.compounds.map((c) => [c.key, c.name]), [['x', 'x'], ['no-key', 'no key']]);
  same(p.compounds[0].slots, ['am', 'bed']);
  same(p.compounds[0].dose, { amount: 5, unit: 'mg', text: '5mg' });
  assert.equal(p.slots.am.t, 240);                          /* wrapped into the day, then into the morning's span */
  assert.equal(p.slots.bed.alert, false);
  assert.equal(p.slots.mid.t, 750);
});
