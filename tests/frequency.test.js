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
  /* A decimal comma before a unit stays in its field. */
  same(plain(app.tlSplitProtocolLine('A, 2,5mg, daily')), ['A', '2,5mg', 'daily']);
  same(plain(app.tlSplitProtocolLine('Ozempic, 0,5 mg, weekly')), ['Ozempic', '0,5 mg', 'weekly']);
  same(plain(app.tlSplitProtocolLine('A, 1,0000, daily')), ['A', '1', '0000', 'daily']);
  /* A name ending in digits, with no space after the comma, is still a name. */
  same(plain(app.tlSplitProtocolLine('TB-500,250mcg,2x weekly')), ['TB-500', '250mcg', '2x weekly']);
  same(plain(app.tlSplitProtocolLine('BPC 157,250mcg,daily')), ['BPC 157', '250mcg', 'daily']);
  same(plain(app.tlSplitProtocolLine('Sema,1,000mcg,weekly')), ['Sema', '1,000mcg', 'weekly']);
  /* A decimal comma stays one field; what it means is left to the dose. */
  same(plain(app.tlSplitProtocolLine('Sema, 0,250mg, weekly')), ['Sema', '0,250mg', 'weekly']);
  same(plain(app.tlSplitProtocolLine('Mon, Wed, Fri')), ['Mon', 'Wed', 'Fri']);
  same(plain(app.tlSplitProtocolLine('')), ['']);
});

test('weekdays written as letters are read like day names; anything else with letters is not', () => {
  const days = (p) => { const r = app.tlFreqDayRule(p); return r ? plain(r.days) : null; };
  same(days('m/w/f'), [1, 3, 5]);
  same(days('mwf'), [1, 3, 5]);
  same(days('m-w-f'), [1, 3, 5]);
  same(days('t/th'), [2, 4]);
  same(days('tu/th'), [2, 4]);
  same(days('sa/su'), [0, 6]);
  /* Two days joined by a dash are a range, whichever days they are. */
  same(days('m-f'), [1, 2, 3, 4, 5]);
  same(days('m-th'), [1, 2, 3, 4]);
  same(days('t-f'), [2, 3, 4, 5]);
  same(days('m-sat'), [1, 2, 3, 4, 5, 6]);
  same(days('m-sa'), [1, 2, 3, 4, 5, 6]);
  for (const text of ['am/pm', 'a.m./p.m.', 'daily', '2x/w', 'subq', 'm', 'with food', 'w/o food', 'im']) {
    assert.equal(app.tlFreqDayRule(text), null, text);
  }
});

test('days ruled out are rest days, never dose days; a daily line takes the rest of the week', () => {
  const r = (p) => plain(app.parseFrequency(p));
  for (const p of ['every day but Sunday', 'Daily (Sun off)', 'Daily - Sun off', 'Daily (Sundays off)', 'Daily w/o Sunday',
    'Daily other than Sunday', 'daily besides Sunday', 'Daily (rest Sunday)', 'Daily except Sunday']) {
    same([r(p).type, r(p).days], ['weekly', [1, 2, 3, 4, 5, 6]], p);
  }
  same(r('Daily (Sat & Sun off)').days, [1, 2, 3, 4, 5]);
  same(r('Daily except T/Th').days, [0, 1, 3, 5, 6]);
  same(r('Mon-Fri except Fri').days, [1, 2, 3, 4]);
  /* A start is not a schedule. */
  same([r('Weekly starting Monday').type, r('Weekly starting Monday').named], ['weekly', undefined]);
  /* Rest days do not move a weekly count. */
  assert.equal(r('Twice weekly, Sun off').named, undefined);
});

test('only a daily, interval, weekly or monthly reading puts doses on any day', () => {
  for (const p of ['daily', 'every other day', 'weekly', 'monthly', 'with food']) assert.equal(app.tlFreqScheduled(app.parseFrequency(p)), true, p);
  for (const p of ['10-day pulse', 'as needed', 'biweekly', 'every 4.5 days']) assert.equal(app.tlFreqScheduled(app.parseFrequency(p)), false, p);
  assert.equal(app.tlFreqScheduled(null), false);
});

test('a calendar repeat falls on the protocol\'s day of the month, and the last day of a shorter one', () => {
  assert.equal(app.tlMonthlyRrule(15), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=15');
  assert.equal(app.tlMonthlyRrule(28), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=28');
  assert.equal(app.tlMonthlyRrule(29), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=28,29;BYSETPOS=-1');
  assert.equal(app.tlMonthlyRrule(31), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=28,29,30,31;BYSETPOS=-1');
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

test('days written as letters after "except" or "not" are never dose days', () => {
  for (const [p, off] of [['Daily except T/Th', [2, 4]], ['Daily, not M/W', [1, 3]], ['daily except M-F', [1, 2, 3, 4, 5]], ['skip MWF', [1, 3, 5]]]) {
    const days = plain(app.parseFrequency(p).days) || [];
    assert.ok(off.every((d) => days.indexOf(d) < 0), p + ' ' + JSON.stringify(days));
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

/* ---- found in the second review ------------------------------------------ */

test('a name ending in digits keeps its dose when the commas have no spaces', () => {
  for (const [line, name, dose, type] of [['TB-500,250mcg,2x weekly', 'TB-500', '250mcg', 'weekly'], ['CJC-1295,100mcg,EOD', 'CJC-1295', '100mcg', 'interval'],
    ['PT-141,500mcg,as needed', 'PT-141', '500mcg', 'asneeded'], ['GHRP-6,100mcg,3x daily', 'GHRP-6', '100mcg', 'daily']]) {
    const m = app.parseMeds(line)[0];
    same([m.name, m.dose, m.freq.type], [name, dose, type], line);
  }
});

test('weekdays given as separate fields are all dose days', () => {
  same(plain(app.parseMeds('Test C, 100mg, Mon, Thu')[0].freq.days), [1, 4]);
  same(plain(app.parseMeds('Test C, 100mg, Mon, Wed, Fri')[0].freq.days), [1, 3, 5]);
  same(plain(app.parseMeds('Test C, 100mg, Mon AM, Thu PM')[0].freq.days), [1, 4]);
});

test('"N days a week" is that many days', () => {
  assert.equal(app.parseFrequency('7 days/week').type, 'daily');
  assert.equal(app.parseFrequency('7 days a week').type, 'daily');
  for (const [p, n] of [['5 days/week', 5], ['6 days/wk', 6], ['3 days per week', 3], ['5 days a week', 5]]) {
    same([app.parseFrequency(p).type, app.parseFrequency(p).count], ['weekly', n], p);
  }
});

test('five or six doses a day get five or six reminder times, in the engine too', () => {
  assert.equal(app.getDefaultTimes(app.parseFrequency('5x daily')).length, 5);
  assert.equal(app.getDefaultTimes(app.parseFrequency('q4h')).length, 6);
});

test('a time before or after something else is a time, not a schedule to check', () => {
  same(plain(app.parseFrequency('1 hour before bed')), { type: 'daily', times: 1, label: '1 hour before bed', days: null, at: ['21:30'] });
  for (const p of ['2 hours before bed', '1 hour pre workout', '1 hr before training', '1 hour after dinner']) {
    assert.equal(app.parseFrequency(p).type, 'daily', p);
  }
});

test('clock times are the reminder times; "pm" in "2pm" is not the evening', () => {
  same(plain(app.parseFrequency('Daily at 2pm').at), ['14:00']);
  same(plain(app.parseFrequency('Daily at 12pm').at), ['12:00']);
  same(plain(app.parseFrequency('daily 21:00').at), ['21:00']);
  same([app.parseFrequency('8am and 8pm').times, plain(app.parseFrequency('8am and 8pm').at)], [2, ['08:00', '20:00']]);
  same(plain(app.parseFrequency('9am/9pm').at), ['09:00', '21:00']);
});

test('a dose that may use a decimal comma gets no amount and no curve', () => {
  same(plain(app.tlParseDose('0,250mg')), { amount: null, unit: null, text: '0,250mg' });
  same(plain(app.tlParseDose('2,500mg')), { amount: null, unit: null, text: '2,500mg' });
  same(plain(app.parseMeds('Sema, 0,250mg, weekly')[0].dose), '0,250mg');
});

test('with only a name and a dose, the schedule in the dose is read', () => {
  same(plain(app.parseMeds('Test C, 200mg every 2 weeks')[0].freq.interval), 14);
  assert.equal(app.parseMeds('BPC-157, 250mcg twice daily')[0].freq.times, 2);
  assert.equal(app.parseMeds('Sema, 0.25mg once weekly')[0].freq.type, 'weekly');
  assert.equal(app.parseMeds('HCG, 500IU')[0].freq.type, 'daily');
});

test('biweekly is asked about however it is spaced, and a model round trip keeps the question', () => {
  for (const p of ['Bi  weekly', 'bi - weekly', 'BI-WEEKLY']) assert.equal(app.parseFrequency(p).ask, 'biweekly', p);
  const p = app.tlProtocolFromLegacy({ entries: [], proto: proto('Test C, 100mg biweekly, IM') }, env);
  const back = app.tlProtocolToLegacy(p).proto.meds;
  assert.equal(back, 'Test C, 100mg biweekly, IM');
  assert.equal(app.parseMeds(back)[0].freq.ask, 'biweekly');
});

/* ---- found in the third review -------------------------------------------- */

/* What a line reads as, briefly: type, doses a day, interval, count, days. */
const brief = (f) => [f.type, f.times || 1, f.interval || null, f.count || null, f.days ? plain(f.days) : null];
const line = (l) => brief(app.parseMeds(l)[0].freq);
const phrase = (p) => brief(app.parseFrequency(p));

test('a weekday or "sun" in a note is not a dose day', () => {
  for (const l of ['Melanotan II, 250mcg, daily before sun exposure', 'Enclomiphene, 12.5mg, daily (half dose Sunday)',
    'Anastrozole, 0.25mg, daily through Friday', 'Test Cyp, 20mg, daily (labs Monday)', 'Vit D, 5000iu, daily w/f']) {
    same(line(l), ['daily', 1, null, null, null], l);
  }
  same(line('Test Cyp, 100mg, Weekly (refill on Fridays)'), ['weekly', 1, null, 1, [1]]);
});

test('hyphens, "x2" and "N <things> a week" keep their counts', () => {
  for (const [p, want] of [['twice-weekly', ['weekly', 1, null, 2, [1, 4]]], ['twice-daily', ['daily', 2, null, null, null]],
    ['3x-weekly', ['weekly', 1, null, 3, [1, 3, 5]]], ['x2 weekly', ['weekly', 1, null, 2, [1, 4]]], ['2 time per week', ['weekly', 1, null, 2, [1, 4]]],
    ['2 pins/week', ['weekly', 1, null, 2, [1, 4]]], ['2 injections per week', ['weekly', 1, null, 2, [1, 4]]], ['5 nights/week', ['weekly', 1, null, 5, [1, 2, 3, 4, 5]]],
    ['2 injections daily', ['daily', 2, null, null, null]], ['2 a day', ['daily', 2, null, null, null]]]) {
    same(phrase(p), want, p);
  }
});

test('prescription shorthand is read: q7d, q2w, EOW, wkly, 12-hourly', () => {
  for (const [p, want] of [['q7d', ['interval', 1, 7, null, null]], ['Q2W', ['interval', 1, 14, null, null]], ['q1w', ['weekly', 1, null, 1, [1]]],
    ['q3.5d', ['weekly', 1, null, 2, [1, 4]]], ['q14d', ['interval', 1, 14, null, null]], ['EOW', ['interval', 1, 14, null, null]],
    ['wkly', ['weekly', 1, null, 1, [1]]], ['qweekly', ['weekly', 1, null, 1, [1]]], ['E.O.D.', ['interval', 1, 2, null, null]],
    ['alt days', ['interval', 1, 2, null, null]], ['12-hourly', ['daily', 2, null, null, null]]]) {
    same(phrase(p), want, p);
  }
});

test('a pulse or "10 days" is the reading only when nothing else is named', () => {
  same(phrase('10 days daily'), ['daily', 1, null, null, null]);
  same(phrase('EOD pulse'), ['interval', 1, 2, null, null]);
  same(phrase('10-day pulse cycles annually'), ['pulse', 1, null, null, null]);
  assert.equal(app.parseFrequency('every 7-10 days').type, 'check');
});

test('doses a day and the days they fall on are read together', () => {
  for (const [l, want] of [['CJC/Ipa, 100mcg, 2x daily 5 on/2 off', ['weekly', 2, null, 5, [1, 2, 3, 4, 5]]],
    ['HGH, 2iu, daily (5 days on, 2 off)', ['weekly', 1, null, 5, [1, 2, 3, 4, 5]]],
    ['Ipamorelin, 100mcg, 3x daily, 5 days a week', ['weekly', 3, null, 5, [1, 2, 3, 4, 5]]],
    ['Sermorelin, 300mcg, nightly, Mon-Fri', ['weekly', 1, null, 5, [1, 2, 3, 4, 5]]],
    ['HCG, 500iu, EOD AM and PM', ['interval', 2, 2, null, null]], ['X, 1mg, Mon-Fri AM and PM', ['weekly', 2, null, 5, [1, 2, 3, 4, 5]]]]) {
    same(line(l), want, l);
  }
  same(plain(app.parseFrequency('nightly Mon-Fri').at), ['21:30']);
  same(plain(app.parseFrequency('morning and before bed').at), ['08:00', '21:30']);
  same(plain(app.parseFrequency('daily at 10.30pm').at), ['22:30']);
});

test('a schedule after a route or site field is read', () => {
  same(line('Test Cyp, 100mg, IM, twice weekly'), ['weekly', 1, null, 2, [1, 4]]);
  same(line('BPC-157, 250mcg, SC, BID'), ['daily', 2, null, null, null]);
  same(line('Semaglutide, 0.25mg, abdomen, weekly (Sunday)'), ['weekly', 1, null, 1, [0]]);
});

test('decimal-comma doses keep the line together', () => {
  same([app.parseMeds('Ozempic, 0,5 mg, weekly')[0].dose, line('Ozempic, 0,5 mg, weekly')], ['0,5 mg', ['weekly', 1, null, 1, [1]]]);
  same(app.parseMeds('Mounjaro, 2,5mg, weekly')[0].dose, '2,5mg');
});

test('days a schedule cannot place, and periods it cannot keep, are checked', () => {
  for (const p of ['every other Friday', 'alternate Mondays', 'first Monday of the month', 'every third month', 'twice monthly', '2x monthly', 'quarterly', 'annually', '20 days on 10 off']) {
    assert.equal(app.parseFrequency(p).type, 'check', p);
  }
  same(phrase('every third week'), ['interval', 1, 21, null, null]);
});

test('weekdays, weekends and letters with spaces are days', () => {
  for (const [p, days] of [['weekdays', [1, 2, 3, 4, 5]], ['daily except weekends', [1, 2, 3, 4, 5]], ['weekends only', [0, 6]],
    ['M W F', [1, 3, 5]], ['T Th', [2, 4]], ['every week day', [1, 2, 3, 4, 5]]]) {
    same(plain(app.parseFrequency(p).days), days, p);
  }
  same(phrase('5d on 2d off'), ['weekly', 1, null, 5, [1, 2, 3, 4, 5]]);
});

test('rest days fix a weekly count when they leave as many days', () => {
  for (const l of ['HGH, 3iu, 5x weekly Sat/Sun off', 'Ipamorelin, 100mcg, 5x weekly (skip Sat, Sun)', 'HGH, 3iu, 5x/week, no weekends',
    'Ipamorelin, 100mcg, 5 on 2 off (Mon-Fri)', 'Enclomiphene, 12.5mg, daily except Sat, Sun']) {
    same(plain(app.parseMeds(l)[0].freq.days), [1, 2, 3, 4, 5], l);
  }
});

test('a day named in a later field places a weekly dose, with its time', () => {
  same(line('Tirz, 5mg, weekly, every Sunday'), ['weekly', 1, null, 1, [0]]);
  same(plain(app.parseMeds('Tirz, 5mg, weekly, Sun at 8pm')[0].freq.at), ['20:00']);
});

test('a note about titration or labs does not replace the schedule in the dose', () => {
  same(line('Sema, 0.25mg weekly, titrate every 4 weeks'), ['weekly', 1, null, 1, [1]]);
  same(line('Test Cyp, 100mg twice weekly, bloods every 8 weeks'), ['weekly', 1, null, 2, [1, 4]]);
  same(line('Test C, 200mg/week (100mg twice weekly)'), ['weekly', 1, null, 2, [1, 4]]);
});

test('a model round trip keeps 3x daily, and the field a dose-read schedule left behind', () => {
  const back = (meds) => app.tlProtocolToLegacy(app.tlProtocolFromLegacy({ entries: [], proto: proto(meds) }, env)).proto.meds;
  assert.equal(back('Ipamorelin, 100mcg, 3x daily'), 'Ipamorelin, 100mcg, 3x daily');
  assert.equal(back('Test Cyp, 100mg twice weekly, IM glute'), 'Test Cyp, 100mg twice weekly, Twice weekly (Mon · Thu), IM glute');
  assert.equal(back('HCG, 1,000 IU, twice weekly'), 'HCG, 1000 IU, Twice weekly (Mon · Thu)');
});
