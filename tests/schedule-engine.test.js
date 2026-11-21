/* Characterization tests: the schedule rule engine.
 *
 * tlDueOn() answers one question, "which doses of this compound are due on
 * this calendar day?", and the redesign's rounds are built on its answer: a
 * round is a time slot holding at least one compound that is due today. The
 * handoff's own model is weekday chips only. The engine also runs every-N-days,
 * on/off cycling, tapers and windows inside a longer protocol, and those must
 * keep working, so they are pinned here before anything is moved.
 *
 * Dates are built with the local-time Date constructor throughout. The engine
 * works in local calendar days, and these tests pass in any timezone only
 * because nothing in them names an instant.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/frequency.js'],
  functions: ['tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow',
              'tlDoseOn', 'tlDueOn', 'tlScheduleRange', 'tlExpectedDoses'],
  consts: ['TL_DAY_MS']
});

/* 2 March 2026 is a Monday, so day(0) is Monday and day(3) is Thursday. */
const START = '2026-03-02';
const day = (n) => new Date(2026, 2, 2 + n);
/* The offsets, counted from START, on which a rule fires across `span` days. */
const fires = (rule, span, start) => {
  const out = [];
  for (let n = 0; n < span; n++) if (app.tlDueOn(rule, day(n), start === undefined ? START : start).length) out.push(n);
  return out;
};

test('tlDay reads a date-only string as a local day, not as UTC midnight', () => {
  const d = app.tlDay('2026-03-02');
  same([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 2, 2, 0]);
});

test('tlDay returns local midnight of a Date, and null for nothing or nonsense', () => {
  const d = app.tlDay(new Date(2026, 2, 2, 17, 45));
  same([d.getDate(), d.getHours(), d.getMinutes()], [2, 0, 0]);
  assert.equal(app.tlDay(null), null);
  assert.equal(app.tlDay(undefined), null);
  assert.equal(app.tlDay('not a date'), null);
});

test('tlDaysBetween counts whole calendar days, across a daylight-saving change', () => {
  assert.equal(app.tlDaysBetween('2026-03-02', '2026-03-09'), 7);
  assert.equal(app.tlDaysBetween('2026-03-02', '2026-03-01'), -1);
  /* US clocks go forward on 8 March 2026; the count must still be whole days. */
  assert.equal(app.tlDaysBetween(new Date(2026, 2, 7), new Date(2026, 2, 9)), 2);
  assert.equal(app.tlDaysBetween(null, '2026-03-02'), null);
});

test('tlNormalizeRule lifts each legacy frequency into a rule', () => {
  const med = (freq) => ({ name: 'X', dose: '1mg', freq });
  same(app.tlNormalizeRule(med({ type: 'daily', times: 1 })),
    { compound: 'X', dose: '1mg', times: ['08:00'], daily: true });
  same(app.tlNormalizeRule(med({ type: 'daily', times: 2 })),
    { compound: 'X', dose: '1mg', times: ['08:00', '21:00'], daily: true });
  same(app.tlNormalizeRule(med({ type: 'interval', interval: 2 })),
    { compound: 'X', dose: '1mg', times: ['09:00'], every: { days: 2 } });
  /* A weekly count is placed from the start day (tlWeekdaysFor), as the week
     view places it; days the user named are the days. */
  same(app.tlNormalizeRule(med({ type: 'weekly', count: 2, days: [1, 4] })),
    { compound: 'X', dose: '1mg', times: ['09:00'], weekdays: null, weeklyCount: 2 });
  same(app.tlNormalizeRule(med({ type: 'weekly', count: 2, days: [2, 5], named: true })),
    { compound: 'X', dose: '1mg', times: ['09:00'], weekdays: [2, 5], weeklyCount: 2 });
  same(app.tlNormalizeRule(med({ type: 'daily', times: 3 })),
    { compound: 'X', dose: '1mg', times: ['08:00', '14:00', '20:00'], daily: true });
  same(app.tlNormalizeRule(med({ type: 'daily', times: 1, at: ['21:30'] })),
    { compound: 'X', dose: '1mg', times: ['21:30'], daily: true });
  same(app.tlNormalizeRule(med({ type: 'monthly' })),
    { compound: 'X', dose: '1mg', times: ['09:00'], monthly: true });
});

test('tlNormalizeRule gives no rule for a pulse, "as needed" or a schedule that could not be read', () => {
  /* These used to fall through to daily, so a 10-day pulse was dosed every
     day. A med with no frequency at all is still daily, as it always was. */
  for (const type of ['pulse', 'check', 'asneeded']) {
    assert.equal(app.tlNormalizeRule({ name: 'X', dose: '1mg', freq: { type } }), null, type);
    same(fires({ name: 'X', dose: '1mg', freq: { type } }, 7), [], type);
  }
  same(app.tlNormalizeRule({ name: 'X', dose: '1mg' }),
    { compound: 'X', dose: '1mg', times: ['08:00'], daily: true });
  assert.equal(app.tlNormalizeRule(null), null);
});

test('tlNormalizeRule passes a new-style rule through, defaulting its time to 09:00', () => {
  same(app.tlNormalizeRule({ compound: 'X', dose: '1mg', every: { days: 3.5 } }),
    { times: ['09:00'], compound: 'X', dose: '1mg', every: { days: 3.5 } });
  same(app.tlNormalizeRule({ compound: 'X', dose: '1mg', daily: true, times: ['07:00', '22:30'] }),
    { times: ['07:00', '22:30'], compound: 'X', dose: '1mg', daily: true });
});

test('a daily rule is due every day, once per listed time, in the order listed', () => {
  same(fires({ compound: 'X', dose: '1mg', daily: true }, 7), [0, 1, 2, 3, 4, 5, 6]);
  same(app.tlDueOn({ compound: 'X', dose: '1mg', daily: true, times: ['22:30', '07:00'] }, day(0), START),
    [{ compound: 'X', dose: '1mg', time: '22:30' }, { compound: 'X', dose: '1mg', time: '07:00' }]);
});

test('nothing is due before the protocol starts, or without a start date at all', () => {
  same(app.tlDueOn({ compound: 'X', dose: '1mg', daily: true }, new Date(2026, 2, 1), START), []);
  same(app.tlDueOn({ compound: 'X', dose: '1mg', daily: true }, day(0), null), []);
  same(app.tlDueOn(null, day(0), START), []);
});

test('every N days counts from the start date, whatever the weekday', () => {
  same(fires({ compound: 'X', dose: '1mg', every: { days: 2 } }, 10), [0, 2, 4, 6, 8]);
  same(fires({ compound: 'X', dose: '1mg', every: { days: 3 } }, 10), [0, 3, 6, 9]);
});

test('every 3.5 days is twice a week, alternating gaps of four and three days', () => {
  /* The k-th dose falls on round(k * 3.5): 0, 4, 7, 11, 14, 18, 21, 25. */
  same(fires({ compound: 'X', dose: '1mg', every: { days: 3.5 } }, 28), [0, 4, 7, 11, 14, 18, 21, 25]);
});

test('every N weeks fires on the start weekday only', () => {
  same(fires({ compound: 'X', dose: '1mg', every: { weeks: 1 } }, 22), [0, 7, 14, 21]);
  same(fires({ compound: 'X', dose: '1mg', every: { weeks: 2 } }, 30), [0, 14, 28]);
});

test('named weekdays fire on those weekdays; Sunday is 0', () => {
  /* Monday and Thursday from a Monday start. */
  same(fires({ compound: 'X', dose: '1mg', weekdays: [1, 4] }, 14), [0, 3, 7, 10]);
  /* Sunday only: the first Sunday after Monday 2 March is day 6. */
  same(fires({ compound: 'X', dose: '1mg', weekdays: [0] }, 14), [6, 13]);
});

test('a legacy weekly frequency with no weekdays takes them from the start date', () => {
  /* Once a week: the start weekday. Twice: the start weekday and three days on. */
  const weekly = (count) => ({ name: 'X', dose: '1mg', freq: { type: 'weekly', count } });
  same(fires(weekly(1), 14), [0, 7]);
  same(fires(weekly(2), 14), [0, 3, 7, 10]);
  /* A new-style rule carrying only weeklyCount is a weekly rule. It used to
     fall through to the legacy branch and be dosed every day. */
  same(fires({ compound: 'X', dose: '1mg', weeklyCount: 2 }, 7), [0, 3]);
  same(fires({ compound: 'X', dose: '1mg', weeklyCount: 3 }, 7), [0, 2, 4]);
  /* From a Friday start (6 March): Friday and Monday. */
  same(app.tlWeekdaysFor({ weeklyCount: 2 }, '2026-03-06'), [5, 1]);
  same(app.tlWeekdaysFor({ weeklyCount: 1 }, '2026-03-06'), [5]);
});

test('explicit weekdays win over the weekly count, and no start date means Monday', () => {
  same(app.tlWeekdaysFor({ weekdays: [2, 6], weeklyCount: 2 }, '2026-03-06'), [2, 6]);
  /* With no start date the week starts on Monday: Monday, and Thursday. */
  same(app.tlWeekdaysFor({ weeklyCount: 1 }, null), [1]);
  same(app.tlWeekdaysFor({ weeklyCount: 2 }, null), [1, 4]);
});

test('"twice weekly" from the protocol text falls where the week view puts it, and named days stay put', () => {
  /* This engine used to place twice weekly on Monday and Thursday whatever
     the start day, while getDoseDays() placed it from the start day, so the
     two disagreed for any start that was not a Monday. Both now place it
     from the start day; days the user named are the days in both. */
  const from = (freq) => {
    const out = [];
    for (let n = 0; n < 14; n++) if (app.tlDueOn({ name: 'X', dose: '1mg', freq }, new Date(2026, 2, 6 + n), '2026-03-06').length) out.push(n);
    return out;
  };
  /* Friday 6 March, then three days on (Monday 9), weekly. */
  same(from({ type: 'weekly', count: 2, days: [1, 4] }), [0, 3, 7, 10]);
  /* Named Monday and Thursday: Monday 9, Thursday 12, 16 and 19. */
  same(from({ type: 'weekly', count: 2, days: [1, 4], named: true }), [3, 6, 10, 13]);
});

test('monthly fires on the start date\'s day of the month', () => {
  const rule = { compound: 'X', dose: '1mg', monthly: true };
  assert.equal(app.tlDueOn(rule, new Date(2026, 3, 2), START).length, 1);
  assert.equal(app.tlDueOn(rule, new Date(2026, 3, 3), START).length, 0);
});

test('monthly from the 31st falls on the last day of a shorter month', () => {
  /* It used to skip February, April, June, September and November. */
  const rule = { compound: 'X', dose: '1mg', monthly: true };
  const due = (m, d) => app.tlDueOn(rule, new Date(2026, m, d), '2026-01-31').length;
  assert.equal(due(1, 28), 1);
  assert.equal(due(1, 27), 0);
  assert.equal(due(2, 31), 1);
  assert.equal(due(2, 30), 0);
  assert.equal(due(3, 30), 1);
});

test('a weekly taper steps through its doses and then stops', () => {
  const rule = { compound: 'Tamoxifen', taper: ['40mg', '40mg', '20mg', '20mg'], per: 'week' };
  const doseOn = (n) => { const d = app.tlDueOn(rule, day(n), START); return d.length ? d[0].dose : null; };
  assert.equal(doseOn(0), '40mg');
  assert.equal(doseOn(13), '40mg');
  assert.equal(doseOn(14), '20mg');
  assert.equal(doseOn(27), '20mg');
  /* Past the end of the list the rule is finished, with no stop date needed. */
  assert.equal(doseOn(28), null);
  same(fires(rule, 35).length, 28);
});

test('a daily taper steps each day', () => {
  const rule = { compound: 'X', taper: ['3mg', '2mg', '1mg'], per: 'day' };
  same([0, 1, 2, 3].map((n) => { const d = app.tlDueOn(rule, day(n), START); return d.length ? d[0].dose : null; }),
    ['3mg', '2mg', '1mg', null]);
});

test('tlDoseOn returns the fixed dose when there is no taper', () => {
  assert.equal(app.tlDoseOn({ dose: '5mg' }, 100), '5mg');
  assert.equal(app.tlDoseOn({ dose: '5mg', taper: [] }, 100), '5mg');
});

test('five on, two off applies to the days the rule would otherwise fire', () => {
  same(fires({ compound: 'X', dose: '1mg', daily: true, pattern: { on: 5, off: 2 } }, 14),
    [0, 1, 2, 3, 4, 7, 8, 9, 10, 11]);
});

test('a rule can start and stop inside a longer protocol, weeks counted from 1', () => {
  /* Weeks 2 to 3 are offsets 7 to 20. */
  same(fires({ compound: 'X', dose: '1mg', daily: true, fromWeek: 2, toWeek: 3 }, 28),
    Array.from({ length: 14 }, (_, i) => 7 + i));
  /* forWeeks runs from the rule's own first day. */
  same(fires({ compound: 'X', dose: '1mg', daily: true, fromWeek: 2, forWeeks: 1 }, 28),
    [7, 8, 9, 10, 11, 12, 13]);
  same(app.tlRuleWindow({ fromWeek: 4 }, START).fromDay, 21);
  same(app.tlRuleWindow({}, START).toDay, Infinity);
});

test('a staggered rule counts its interval and taper from its own first day', () => {
  same(fires({ compound: 'X', dose: '1mg', every: { days: 2 }, fromWeek: 2 }, 14), [7, 9, 11, 13]);
  const taper = { compound: 'X', taper: ['2mg', '1mg'], per: 'week', fromWeek: 2 };
  assert.equal(app.tlDueOn(taper, day(7), START)[0].dose, '2mg');
  assert.equal(app.tlDueOn(taper, day(14), START)[0].dose, '1mg');
  assert.equal(app.tlDueOn(taper, day(21), START).length, 0);
});

test('a rule\'s own start date overrides the protocol\'s', () => {
  same(fires({ compound: 'X', dose: '1mg', every: { days: 2 }, start: '2026-03-03' }, 7), [1, 3, 5]);
});

test('tlScheduleRange lists each day that has a dose, with that day\'s doses in time order', () => {
  const rules = [
    { compound: 'B', dose: '2mg', daily: true, times: ['22:30'] },
    { compound: 'A', dose: '1mg', weekdays: [1, 4], times: ['07:00'] },
  ];
  const range = app.tlScheduleRange(rules, day(0), day(3), START);
  same(range.map((r) => r.doses.map((d) => d.compound + '@' + d.time)),
    [['A@07:00', 'B@22:30'], ['B@22:30'], ['B@22:30'], ['A@07:00', 'B@22:30']]);
  same(range.map((r) => r.date.getDate()), [2, 3, 4, 5]);
});

test('tlScheduleRange leaves out days with nothing due, and is empty for a backwards range', () => {
  const rules = [{ compound: 'A', dose: '1mg', weekdays: [1, 4] }];
  same(app.tlScheduleRange(rules, day(0), day(6), START).map((r) => r.date.getDate()), [2, 5]);
  same(app.tlScheduleRange(rules, day(6), day(0), START), []);
  same(app.tlScheduleRange(null, day(0), day(6), START), []);
});

test('tlExpectedDoses counts administrations, so twice a day counts twice', () => {
  const rules = [
    { compound: 'A', dose: '1mg', daily: true, times: ['07:00', '22:30'] },
    { compound: 'B', dose: '1mg', every: { days: 3.5 } },
  ];
  /* 28 days: A is 56, B is 8. */
  assert.equal(app.tlExpectedDoses(rules, day(0), day(27), START), 64);
});
