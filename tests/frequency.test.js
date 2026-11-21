/* Reading the schedule a user typed: src/logic/frequency.js.
 *
 * schedule-legacy.test.js covers parseFrequency() phrase by phrase, as the old
 * screens see it. This covers the rest of the module: splitting a line,
 * weekdays written as letters, which readings put doses on any day, the note
 * that tells a user what now reads differently, and the model keeping the
 * user's own words for a line it cannot schedule.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain } = require('./helpers/app');

const NOW = '2026-03-04T12:00';   /* a Wednesday */
const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/frequency.js'],
  functions: ['parseFrequency', 'parseMeds', 'tlFreqDays', 'getDoseDays', 'tlLegacyDue', 'getDefaultTimes', 'tlMonthlyRrule'],
  consts: ['tlLocalDate'],
  now: NOW
});

test('a line splits on its commas, except one that groups the thousands of a number', () => {
  same(plain(app.tlSplitProtocolLine('Sema, 1,000mcg, weekly')), ['Sema', '1,000mcg', 'weekly']);
  same(plain(app.tlSplitProtocolLine('D3, 10,000 IU, daily, with food')), ['D3', '10,000 IU', 'daily', 'with food']);
  same(plain(app.tlSplitProtocolLine('A, 1,000,000 IU, monthly')), ['A', '1,000,000 IU', 'monthly']);
  /* Not a thousands separator: too few digits after it, or a fourth. */
  same(plain(app.tlSplitProtocolLine('A, 2,5mg, daily')), ['A', '2', '5mg', 'daily']);
  same(plain(app.tlSplitProtocolLine('A, 1,0000, daily')), ['A', '1', '0000', 'daily']);
  same(plain(app.tlSplitProtocolLine('Mon, Wed, Fri')), ['Mon', 'Wed', 'Fri']);
  same(plain(app.tlSplitProtocolLine('')), ['']);
});

test('weekdays written as letters are read; anything else with letters is not', () => {
  same(plain(app.tlLetterDays('m/w/f')), [1, 3, 5]);
  same(plain(app.tlLetterDays('mwf')), [1, 3, 5]);
  same(plain(app.tlLetterDays('m-w-f')), [1, 3, 5]);
  same(plain(app.tlLetterDays('t/th')), [2, 4]);
  same(plain(app.tlLetterDays('tu/th')), [2, 4]);
  same(plain(app.tlLetterDays('m-f')), [1, 2, 3, 4, 5]);
  same(plain(app.tlLetterDays('sa/su')), [0, 6]);
  for (const text of ['am/pm', 'a.m./p.m.', 'daily', '2x/w', 'subq', 'm', 'with food']) {
    assert.equal(app.tlLetterDays(text), null, text);
  }
});

test('only a daily, interval, weekly or monthly reading puts doses on any day', () => {
  for (const p of ['daily', 'every other day', 'weekly', 'monthly', 'with food']) assert.equal(app.tlFreqScheduled(app.parseFrequency(p)), true, p);
  for (const p of ['10-day pulse', 'as needed', 'biweekly', 'every 4.5 days']) assert.equal(app.tlFreqScheduled(app.parseFrequency(p)), false, p);
  assert.equal(app.tlFreqScheduled(null), false);
});

test('a calendar repeat started near a month\'s end takes the last day of a shorter month', () => {
  assert.equal(app.tlMonthlyRrule(new Date(2026, 0, 15)), 'RRULE:FREQ=MONTHLY');
  assert.equal(app.tlMonthlyRrule(new Date(2026, 0, 28)), 'RRULE:FREQ=MONTHLY');
  assert.equal(app.tlMonthlyRrule(new Date(2026, 0, 29)), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=28,29;BYSETPOS=-1');
  assert.equal(app.tlMonthlyRrule(new Date(2026, 0, 31)), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=28,29,30,31;BYSETPOS=-1');
});

/* ---- the note: what now reads differently -------------------------------- */

const proto = (meds, start) => ({ name: 'P', start: start || '2026-03-02', weeks: 12, meds });

test('the note lists each line that reads differently now, and nothing else', () => {
  const changes = plain(app.tlScheduleChanges(proto(
    'Testosterone Cypionate, 100mg, once a week\n' +
    'BPC-157, 250mcg, 3x daily\n' +
    'HCG, 500IU, EOD\n' +
    'Sema, 1,000mcg, weekly\n' +
    'Ipamorelin, 200mcg, Before bed\n' +
    'Tesa, 1mg, biweekly'), {}));
  same(changes, [
    { name: 'Testosterone Cypionate', before: 'once a day at 08:00', after: 'once a week (Mon) at 09:00' },
    { name: 'BPC-157', before: 'once a day at 08:00', after: '3 times a day at 08:00 and 14:00 and 20:00' },
    { name: 'Sema', before: 'once a day at 08:00', after: 'once a week (Mon) at 09:00' },
    { name: 'Ipamorelin', before: 'once a day at 08:00', after: 'once a day at 21:30' },
    { name: 'Tesa', before: 'twice a week (Mon · Thu) at 09:00', after: 'not scheduled until you check it' }
  ]);
});

test('reminder times the user set are theirs: only the schedule is compared for those lines', () => {
  const changes = plain(app.tlScheduleChanges(proto('Ipamorelin, 200mcg, Before bed\nBPC-157, 250mcg, 3x daily'),
    { Ipamorelin: ['22:00'], 'BPC-157': ['07:00'] }));
  same(changes, [{ name: 'BPC-157', before: 'once a day', after: '3 times a day' }]);
});

test('a protocol that reads the same as before gives no note', () => {
  same(plain(app.tlScheduleChanges(proto('A, 1mg, Daily\nB, 1mg, Twice weekly\nC, 1mg, EOD\nD, 1mg, Monthly'), {})), []);
  same(plain(app.tlScheduleChanges(null, {})), []);
  same(plain(app.tlScheduleChanges({ meds: '' }, {})), []);
});

/* ---- the protocol model keeps what it cannot schedule ---------------------- */

const env = { resolve: () => null, medium: () => null, discreet: false };

test('a line the reader cannot schedule keeps its words through a save of the model', () => {
  for (const freq of ['biweekly', 'every 4.5 days', 'as needed']) {
    const d = { entries: [], proto: proto('X, 1mg, ' + freq) };
    const p = app.tlProtocolFromLegacy(d, env);
    assert.equal(p.compounds[0].rule, null, freq);
    const legacy = app.tlProtocolToLegacy(p);
    assert.match(legacy.proto.meds, new RegExp(', ' + freq.replace(/\./g, '\\.') + '$'), freq);
  }
});

test('days named in the rest of a weekly line place it in the old screens and the model alike', () => {
  const meds = app.parseMeds('Test C, 100mg, Twice weekly, Mon AM and Thu PM, glute only');
  same(plain(meds[0].freq.days), [1, 4]);
  assert.equal(meds[0].freq.named, true);
  /* Wednesday 4 March: Thursday is tomorrow, Monday is in five days. */
  same(app.getDoseDays(meds[0], '2026-03-02'), [1, 5]);
  /* A daily line is never made weekly by what follows it. */
  assert.equal(app.parseMeds('BPC-157, 250mcg, Daily, refill on Fridays')[0].freq.type, 'daily');
});

/* ---- found in review: phrases the old reader got right ------------------- */

test('a footnote asterisk does not hide the schedule; "2*daily" is a count', () => {
  for (const [p, type] of [['Weekly*', 'weekly'], ['EOD*', 'interval'], ['Twice weekly*', 'weekly'], ['Monthly*', 'monthly'], ['*weekly', 'weekly']]) {
    assert.equal(app.parseFrequency(p).type, type, p);
  }
  assert.equal(app.parseFrequency('2*daily').times, 2);
});

test('"every N days" keeps its interval whatever follows it', () => {
  for (const [p, n] of [['every 3 days before bed', 3], ['every 2 days after workout', 2], ['every 2 days in the AM', 2],
    ['every 3 days pre-workout', 3], ['every 2 weeks in the morning', 14]]) {
    same(plain(app.parseFrequency(p)).interval, n, p);
  }
  /* A length of course is still set aside where it is one. */
  assert.equal(app.parseFrequency('Daily oral, start 2 weeks after last injection').type, 'daily');
  assert.equal(app.parseFrequency('once a week 2 hours before gym').type, 'weekly');
});

test('days written as letters after "except" or "not" are not dose days', () => {
  for (const p of ['Daily except T/Th', 'Daily, not M/W', 'daily except M-F', 'skip MWF']) {
    assert.notEqual(app.parseFrequency(p).named, true, p);
  }
});

test('times of day are doses only when the text lists them; meals are not times', () => {
  const r = (p) => plain(app.parseFrequency(p));
  assert.equal(r('AM or PM').times, 1);
  assert.equal(r('AM or PM').at, undefined);
  same(r('Before bed (2h after dinner)').at, ['21:30']);
  same(r('Daily before bed 2 hours after dinner').at, ['21:30']);
  same(r('AM fasted 30 min before breakfast').at, ['08:00']);
  same([r('AM/PM').times, r('AM/PM').at], [2, ['08:00', '20:00']]);
  same([r('morning, noon and night').times, r('morning, noon and night').at], [3, ['08:00', '12:00', '21:30']]);
});

test('the rest of a line moves a weekly dose only when it names nothing but days', () => {
  assert.equal(app.parseMeds('Test Cyp, 100mg, Weekly, refill on Fridays')[0].freq.named, undefined);
  same(plain(app.parseMeds('X, 1mg, 3 times weekly: Mon, Wed, Fri')[0].freq.days), [1, 3, 5]);
  /* The protocol model reads the note the same way. */
  const d = { entries: [], proto: proto('Test Cyp, 100mg, Weekly, refill on Fridays') };
  same(plain(app.tlProtocolFromLegacy(d, env).compounds[0].rule), { weekdays: [1] });
});
