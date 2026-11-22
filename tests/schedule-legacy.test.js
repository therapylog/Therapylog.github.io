/* Characterization tests: the legacy protocol schedule.
 *
 * A protocol is stored as free text, one compound per line ("name, dose,
 * frequency"). parseMeds() and parseFrequency() turn that text into meds, and
 * getDoseDays() / tlFreqDays() / getDefaultTimes() answer "which of the next N
 * days is a dose day, and at what time" for the dashboard, the week view, the
 * reminders and the calendar export.
 *
 * These pinned what that code did, including the parts that looked wrong, so
 * that the redesign's protocol model could be shown to read every stored
 * protocol the way the app read it. The suspected bugs they pinned were then
 * fixed (src/logic/frequency.js), and the tests that pinned them now say what
 * the app does instead.
 *
 * The functions are lifted from app.html and run as they are; see
 * tests/helpers/app.js. The clock is frozen at noon on Wednesday 4 March 2026,
 * local time, because getDoseDays() counts from "today".
 *
 * Run:  node --test tests/
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same } = require('./helpers/app');

const NOW = '2026-03-04T12:00';   /* a Wednesday */

const load = (extra) => loadApp(Object.assign({
  files: ['src/logic/protocol.js', 'src/logic/frequency.js'],
  functions: ['parseFrequency', 'parseMeds', 'tlFreqDays', 'getDoseDays', 'tlLegacyDue', 'getDefaultTimes'],
  consts: ['tlLocalDate'],
  now: NOW
}, extra));

const TWICE_DAILY = { type: 'daily', times: 2, label: 'Twice daily', days: null };
const DAILY = { type: 'daily', times: 1, label: 'Daily', days: null };
const EOD = { type: 'interval', interval: 2, label: 'Every other day', days: null };
const E3D = { type: 'interval', interval: 3, label: 'Every 3 days', days: null };
const TWICE_WEEKLY = { type: 'weekly', count: 2, label: 'Twice weekly', days: [1, 4] };
const WEEKLY = { type: 'weekly', count: 1, label: 'Weekly', days: [1] };
const MONTHLY = { type: 'monthly', label: 'Monthly', days: null };
const PULSE = { type: 'pulse', label: '10-day pulse cycle', days: null };
/* What a phrase that names no schedule becomes: once daily, labelled with the
   text. */
const unrecognised = (text) => ({ type: 'daily', times: 1, label: text, days: null });
const AS_NEEDED = { type: 'asneeded', label: 'As needed', days: null };
/* A schedule the text states but the reader cannot take. */
const check = (text) => ({ type: 'check', label: 'Check this schedule', days: null, text: text.trim() });
const weekly = (count, days, label) => ({ type: 'weekly', count, label, days });
const named = (count, days, label) => ({ type: 'weekly', count, label, days, named: true });
const interval = (n, label) => ({ type: 'interval', interval: n, label, days: null });
const daily = (times, label) => ({ type: 'daily', times, label, days: null });

/* Every phrase in the list parses to the same value. */
const allParseTo = (app, phrases, expected) => {
  phrases.forEach((p) => same(app.parseFrequency(p), expected, `parseFrequency(${JSON.stringify(p)})`));
};

/* ---- parseFrequency: what it recognises, in the order it checks ---------- */

test('twice daily, 2x daily and bid are read as twice a day', () => {
  allParseTo(load(), ['twice daily', '2x daily', 'bid'], TWICE_DAILY);
});

test('daily, once daily, every day and qd are read as once a day', () => {
  allParseTo(load(), ['daily', 'once daily', 'every day', 'qd'], DAILY);
});

test('eod, every other day and every 2 days are read as every second day', () => {
  allParseTo(load(), ['eod', 'every other day', 'every 2 day', 'every 2 days'], EOD);
});

test('e3d, every 3 days and every third day are read as every third day', () => {
  allParseTo(load(), ['e3d', 'every 3 day', 'every 3 days', 'every third', 'every third day'], E3D);
});

test('e3.5d, twice weekly, 2x week and 2x/week are read as twice a week on Monday and Thursday', () => {
  allParseTo(load(), ['e3.5d', 'twice week', 'twice weekly', '2x week', '2x weekly', '2x/week', 'every 3.5 days'],
    TWICE_WEEKLY);
});

test('weekly, once weekly, 1x week and per week are read as once a week on Monday', () => {
  allParseTo(load(), ['weekly', 'once week', 'once weekly', '1x week', '1x weekly', 'per week'], WEEKLY);
});

test('monthly and once monthly are read as monthly', () => {
  allParseTo(load(), ['monthly', 'once month', 'once monthly'], MONTHLY);
});

test('10 day, 10-day and pulse are read as a ten-day pulse cycle', () => {
  allParseTo(load(), ['10 day', '10 days on', '10-day', '10-day cycle', 'pulse'], PULSE);
});

test('matching ignores letter case and surrounding whitespace', () => {
  const app = load();
  same(app.parseFrequency('  TWICE DAILY  '), TWICE_DAILY);
  same(app.parseFrequency('EOD'), EOD);
  same(app.parseFrequency('E3.5D'), TWICE_WEEKLY);
  same(app.parseFrequency('\tWeekly\n'), WEEKLY);
});

test('a phrase is matched as a word, anywhere inside the text', () => {
  const app = load();
  same(app.parseFrequency('SubQ daily AM fasted'), Object.assign({}, DAILY, { at: ['08:00'] }));
  same(app.parseFrequency('Weekly SubQ, titrate by 2.5mg'), WEEKLY);
  /* "bid" inside "libido" used to read as twice a day. */
  same(app.parseFrequency('as needed for libido'), AS_NEEDED);
  same(app.parseFrequency('morbid curiosity'), unrecognised('morbid curiosity'));
});

test('when the text names more than one schedule, the first one named wins', () => {
  const app = load();
  /* How long a course runs is not a schedule. */
  same(app.parseFrequency('twice daily for 10 days'), TWICE_DAILY);
  same(app.parseFrequency('daily for 10 days'), DAILY);
  same(app.parseFrequency('Daily for 8 weeks'), DAILY);
  same(app.parseFrequency('Twice weekly for 4-6 weeks, then once weekly'), TWICE_WEEKLY);
  same(app.parseFrequency('Daily oral, start 2 weeks after last injection'), DAILY);
  /* These used to follow the order the old reader checked in. */
  same(app.parseFrequency('EOD or daily'), EOD);
  same(app.parseFrequency('weekly, or every 3 days'), WEEKLY);
  same(app.parseFrequency('Weekly SubQ injection OR twice weekly for steadier levels'), WEEKLY);
  same(app.parseFrequency('Weekly SubQ, titrate by 2.5mg every 4 weeks'), WEEKLY);
  /* A pulse, or "10 days", is the reading only when nothing else is named. */
  same(app.parseFrequency('monthly pulse'), MONTHLY);
  same(app.parseFrequency('EOD pulse'), EOD);
  same(app.parseFrequency('10 days daily'), DAILY);
});

test('a phrase that names no schedule becomes once daily and keeps the text as its label', () => {
  const app = load();
  same(app.parseFrequency('with food'), unrecognised('with food'));
  same(app.parseFrequency('As directed'), unrecognised('As directed'));
  same(app.parseFrequency('As per physician'), unrecognised('As per physician'));
  /* The label is the text as given: not trimmed, not lower-cased. */
  same(app.parseFrequency('  SubQ  '), unrecognised('  SubQ  '));
  same(app.parseFrequency(''), unrecognised(''));
  /* A time of day it names is when the reminder goes off. */
  same(app.parseFrequency('Before bed SubQ fasted'), Object.assign(unrecognised('Before bed SubQ fasted'), { at: ['21:30'] }));
  /* Two named times of day are two doses. */
  same(app.parseFrequency('Split dose AM and noon'),
    { type: 'daily', times: 2, label: 'Split dose AM and noon', days: null, at: ['08:00', '12:00'] });
});

test('"as needed" is not a schedule: no dose days and no reminders', () => {
  allParseTo(load(), ['As needed', 'PRN', '  prn  ', 'when needed', 'as required'], AS_NEEDED);
});

test('a value that is not a string throws', () => {
  const app = load();
  assert.throws(() => app.parseFrequency(undefined), { name: 'TypeError' });
  assert.throws(() => app.parseFrequency(null), { name: 'TypeError' });
  assert.throws(() => app.parseFrequency(7), { name: 'TypeError' });
});

test('common ways of writing a weekly or longer schedule are read as written', () => {
  const app = load();
  /* These all used to become once daily: a weekly injection written "once a
     week" was scheduled, reminded and counted seven times a week. */
  same(app.parseFrequency('once a week'), WEEKLY);
  same(app.parseFrequency('twice a week'), TWICE_WEEKLY);
  same(app.parseFrequency('every 2 weeks'), interval(14, 'Every 2 weeks'));
  same(app.parseFrequency('every other week'), interval(14, 'Every 2 weeks'));
  same(app.parseFrequency('fortnightly'), interval(14, 'Every 2 weeks'));
  same(app.parseFrequency('every 4 weeks'), interval(28, 'Every 4 weeks'));
  same(app.parseFrequency('every 7 days'), interval(7, 'Every 7 days'));
  same(app.parseFrequency('every 4 days'), interval(4, 'Every 4 days'));
  same(app.parseFrequency('every 3.5 days'), TWICE_WEEKLY);
  same(app.parseFrequency('once a month'), MONTHLY);
  same(app.parseFrequency('1x per month'), MONTHLY);
  same(app.parseFrequency('QOD'), EOD);
  same(app.parseFrequency('Mon/Thu'), named(2, [1, 4], 'Twice weekly (Mon \u00b7 Thu)'));
  same(app.parseFrequency('M/W/F'), named(3, [1, 3, 5], '3x weekly (Mon \u00b7 Wed \u00b7 Fri)'));
  same(app.parseFrequency('Mon-Fri'), named(5, [1, 2, 3, 4, 5], '5x weekly (Mon \u00b7 Tue \u00b7 Wed \u00b7 Thu \u00b7 Fri)'));
  same(app.parseFrequency('5 on 2 off'), { type: 'weekly', count: 5, label: '5 on, 2 off', days: [1, 2, 3, 4, 5], run: true });
});

test('a schedule the text states but the reader cannot take is a check, never a guess', () => {
  /* Text that only mentions weeks is not a schedule it cannot read: it is
     read as the old reader read it. */
  assert.equal(load().parseFrequency('Cycle 12 weeks').type, 'daily');
  const app = load();
  for (const p of ['every 4.5 days', '2x per month', 'every 2 months', '5 on 3 off', 'every 5 hours', 'every other Friday', 'twice monthly', 'quarterly']) {
    same(app.parseFrequency(p), check(p), p);
  }
});

test('doses a day are read however the count is written', () => {
  const app = load();
  /* "3x daily" used to lose its count, and "twice a day" and "TID" to read
     as once daily. */
  allParseTo(app, ['3x daily', 'three times daily', 'TID', 't.i.d.', '3x/day', 'every 8 hours', 'q8h'], daily(3, '3x daily'));
  allParseTo(app, ['twice a day', '2x/day', '2x a day', 'two times a day', 'q12h', 'every 12 hours'], TWICE_DAILY);
  allParseTo(app, ['4x daily', 'QID'], daily(4, '4x daily'));
  same(app.parseFrequency('1x daily'), DAILY);
});

test('a weekly count is the count, spread across the week', () => {
  const app = load();
  /* These used to lose their count, so two or three injections a week were
     scheduled as one. */
  allParseTo(app, ['Twice per week', '2x per week', '2 per week', '2/wk'], TWICE_WEEKLY);
  allParseTo(app, ['3x per week', '3x weekly', 'three times weekly', 'three times a week'], weekly(3, [1, 3, 5], '3x weekly'));
  same(app.parseFrequency('4x weekly'), weekly(4, [1, 3, 5, 0], '4x weekly'));
  same(app.parseFrequency('7x per week'), DAILY);
  same(app.parseFrequency('14x weekly'), TWICE_DAILY);
});

test('biweekly is asked about, because it means both every two weeks and twice a week', () => {
  const app = load();
  for (const p of ['biweekly', 'Bi-weekly', 'bi weekly']) {
    same(app.parseFrequency(p), { type: 'check', label: 'Biweekly: every 2 weeks or twice a week?', days: null, text: p, ask: 'biweekly' }, p);
  }
  /* Two named days settle it. */
  same(app.parseFrequency('Biweekly (Mon/Thu)'), named(2, [1, 4], 'Twice weekly (Mon \u00b7 Thu)'));
});

test('the frequency phrases used by the app\'s own protocol templates parse as follows', () => {
  const app = load();
  const at = (f, times) => Object.assign({}, f, { at: times });
  const expected = {
    'Twice weekly': TWICE_WEEKLY,
    '100mg twice weekly (Mon/Thu)': named(2, [1, 4], 'Twice weekly (Mon · Thu)'),
    'Split: 50mg twice weekly (Mon/Thu)': named(2, [1, 4], 'Twice weekly (Mon · Thu)'),
    'Weekly SubQ': WEEKLY,
    'Weekly oral fasted': WEEKLY,
    'Weekly SubQ — titrate by 2.5mg every 4 weeks': WEEKLY,
    'Daily oral AM': at(DAILY, ['08:00']),
    'SubQ daily': DAILY,
    'Topical daily': DAILY,
    'Daily SubQ with CJC-1295': DAILY,
    'Twice daily fasted': TWICE_DAILY,
    'Twice daily fasted with CJC-1295': TWICE_DAILY,
    'Twice daily fasted (AM + pre-bed)': at(TWICE_DAILY, ['08:00', '21:30']),
    '10-day pulse cycles annually': PULSE,
    'SubQ pulse cycles twice yearly': PULSE,
    /* These used to be once daily at 08:00. Two describe two doses a day. */
    'Before bed SubQ fasted': at(unrecognised('Before bed SubQ fasted'), ['21:30']),
    'Once before bed with CJC-1295': at(unrecognised('Once before bed with CJC-1295'), ['21:30']),
    'Split dose AM and noon': { type: 'daily', times: 2, label: 'Split dose AM and noon', days: null, at: ['08:00', '12:00'] },
    '250mcg AM + 250mcg PM SubQ near injury':
      { type: 'daily', times: 2, label: '250mcg AM + 250mcg PM SubQ near injury', days: null, at: ['08:00', '20:00'] },
    /* Days are read only from text that says nothing but a schedule. */
    'Mon/Thu alongside Test injection': unrecognised('Mon/Thu alongside Test injection'),
    /* How long to keep going is not a schedule: once daily, as written. */
    'Final 2 weeks of cycle (then stop completely)': unrecognised('Final 2 weeks of cycle (then stop completely)')
  };
  Object.keys(expected).forEach((p) => {
    same(app.parseFrequency(p), expected[p], `parseFrequency(${JSON.stringify(p)})`);
  });
});

test('every line of every template the app offers gets a schedule a person would read from it', () => {
  /* A template line is "name, dose, freq". Three of them put the schedule in
     the dose ("250mcg twice daily", "500IU 3x/week", "Apply topically
     2x/day"), so a line whose frequency names none is read from its dose. */
  const app = load();
  const lines = {
    'BPC-157, 250mcg twice daily, SubQ — helps gut during GLP-1 initiation': 'Twice daily',
    'HCG, 500IU 3x/week, Final 2 weeks of cycle (then stop completely)': '3x weekly',
    'GHK-Cu, Apply topically 2x/day, Face, neck, and hands — morning and evening': 'Twice daily',
    'HCG, 250IU twice weekly, Mon/Thu alongside Test injection': 'Twice weekly',
    'TB-500, 2.5mg loading, Twice weekly for 4-6 weeks, then once weekly': 'Twice weekly'
  };
  Object.keys(lines).forEach((line) => assert.equal(app.parseMeds(line)[0].freq.label, lines[line], line));
});

/* ---- parseMeds ----------------------------------------------------------- */

test('no protocol text gives no meds', () => {
  const app = load();
  same(app.parseMeds(''), []);
  same(app.parseMeds(undefined), []);
  same(app.parseMeds(null), []);
  same(app.parseMeds('  \n\t\n  '), []);
});

test('a line of name, dose and frequency becomes one med', () => {
  same(load().parseMeds('Testosterone Cypionate, 100mg, Twice weekly'), [{
    name: 'Testosterone Cypionate',
    dose: '100mg',
    freqStr: 'Twice weekly',
    freq: TWICE_WEEKLY,
    freqFrom: 'field',
    color: '#4ade9a',
    id: 'med-0'
  }]);
});

test('each line is a med, numbered and coloured in order', () => {
  const meds = load().parseMeds(
    'Testosterone Cypionate, 100mg, Twice weekly\nBPC-157, 250mcg, Daily\nHCG, 500IU, EOD');
  same(meds, [
    { name: 'Testosterone Cypionate', dose: '100mg', freqStr: 'Twice weekly', freq: TWICE_WEEKLY,
      freqFrom: 'field', color: '#4ade9a', id: 'med-0' },
    { name: 'BPC-157', dose: '250mcg', freqStr: 'Daily', freq: DAILY, freqFrom: 'field', color: '#3bc4ff', id: 'med-1' },
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, freqFrom: 'field', color: '#f59e0b', id: 'med-2' }
  ]);
});

test('blank lines are dropped before numbering, so ids and colours have no gaps', () => {
  const meds = load().parseMeds('\n\nAnastrozole, 0.5mg, EOD\n   \n\nHCG, 500IU, EOD\n');
  same(meds.map((m) => [m.name, m.id, m.color]), [
    ['Anastrozole', 'med-0', '#4ade9a'],
    ['HCG', 'med-1', '#3bc4ff']
  ]);
});

test('whitespace around each part is trimmed, including a Windows line ending', () => {
  same(load().parseMeds('  BPC-157 ,  250mcg ,daily \r\n\tHCG,500IU,  EOD\r'), [
    { name: 'BPC-157', dose: '250mcg', freqStr: 'daily', freq: DAILY, freqFrom: 'field', color: '#4ade9a', id: 'med-0' },
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, freqFrom: 'field', color: '#3bc4ff', id: 'med-1' }
  ]);
});

test('a missing frequency is Daily, a missing dose is empty and a missing name is Unknown', () => {
  const app = load();
  same(app.parseMeds('HCG'), [
    { name: 'HCG', dose: '', freqStr: 'Daily', freq: DAILY, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds('HCG, 500IU'), [
    { name: 'HCG', dose: '500IU', freqStr: 'Daily', freq: DAILY, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds('HCG, , EOD'), [
    { name: 'HCG', dose: '', freqStr: 'EOD', freq: EOD, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds(', ,'), [
    { name: 'Unknown', dose: '', freqStr: 'Daily', freq: DAILY, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds(', 5mg, Weekly'), [
    { name: 'Unknown', dose: '5mg', freqStr: 'Weekly', freq: WEEKLY, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
});

test('freqStr keeps the text as written while freq.label is the normalised name', () => {
  const [med] = load().parseMeds('HCG, 500IU, every other day');
  assert.equal(med.freqStr, 'every other day');
  assert.equal(med.freq.label, 'Every other day');
});

test('a frequency that names no schedule is kept as the label of a once-daily med', () => {
  same(load().parseMeds('Ipamorelin, 200mcg, with food'), [{
    name: 'Ipamorelin', dose: '200mcg', freqStr: 'with food',
    freq: unrecognised('with food'), freqFrom: 'field', color: '#4ade9a', id: 'med-0'
  }]);
});

test('there are eight colours and the ninth med starts the cycle again', () => {
  const text = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((n) => n + ', 1mg, Daily').join('\n');
  const meds = load().parseMeds(text);
  same(meds.map((m) => m.color), [
    '#4ade9a', '#3bc4ff', '#f59e0b', '#f472b6', '#a78bfa', '#34d399', '#fb923c', '#22d3ee',
    '#4ade9a', '#3bc4ff'
  ]);
  same(meds.map((m) => m.id), ['med-0', 'med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6', 'med-7',
    'med-8', 'med-9']);
});

test('only the first three comma-separated parts are used', () => {
  same(load().parseMeds('HCG, 500IU, EOD, with the testosterone, in the morning'), [
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, freqFrom: 'field', color: '#4ade9a', id: 'med-0' }
  ]);
});

test('a comma that groups thousands stays in the dose', () => {
  const app = load();
  /* The line used to be split on every comma, so "1,000mcg" became dose "1"
     and frequency "000mcg", read as daily: the weekly schedule was lost. */
  same(app.parseMeds('Vitamin B12, 1,000mcg, Weekly'), [{
    name: 'Vitamin B12', dose: '1,000mcg', freqStr: 'Weekly',
    freq: WEEKLY, freqFrom: 'field', color: '#4ade9a', id: 'med-0'
  }]);
  same(app.parseMeds('Vitamin D3, 10,000 IU, Daily')[0].dose, '10,000 IU');
  /* Any other comma still separates fields. */
  same(app.parseMeds('HCG, 500IU, EOD, with the testosterone')[0].freqStr, 'EOD');
  /* A frequency field cut short by its own comma names no schedule, and the
     next field is a later phase ("then once weekly"), not this one: the old
     reading stands. */
  same(app.parseMeds('BPC-157, 500mcg, SubQ loading phase 4-6 weeks, then once weekly')[0].freq, unrecognised('SubQ loading phase 4-6 weeks'));
});

test('two lines for the same compound are two meds', () => {
  const meds = load().parseMeds('BPC-157, 250mcg, Daily\nBPC-157, 250mcg, Daily');
  same(meds.map((m) => [m.name, m.id]), [['BPC-157', 'med-0'], ['BPC-157', 'med-1']]);
});

test('anything other than text throws', () => {
  const app = load();
  /* The protocol's meds are stored as one string. A list of meds is not
     accepted. */
  assert.throws(() => app.parseMeds([{ name: 'HCG', dose: '500IU' }]), { name: 'TypeError' });
  assert.throws(() => app.parseMeds({ name: 'HCG' }), { name: 'TypeError' });
});

/* ---- tlLocalDate: how a stored start date is read ------------------------ */

test('a date-only string is read as local midnight of that calendar day', () => {
  const d = load().tlLocalDate('2026-03-04');
  same([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()], [2026, 2, 4, 0, 0]);
});

test('anything else is handed to Date unchanged', () => {
  const app = load();
  const at = new Date(2026, 2, 4, 15, 30);
  assert.equal(app.tlLocalDate(at).getTime(), at.getTime());
  assert.equal(app.tlLocalDate(at.getTime()).getTime(), at.getTime());
  assert.equal(app.tlLocalDate(at.toISOString()).getTime(), at.getTime());
  assert.ok(isNaN(app.tlLocalDate('not a date')));
  assert.ok(isNaN(app.tlLocalDate(undefined)));
});

/* ---- tlFreqDays: which weekdays a weekly med falls on -------------------- */

test('no frequency gives null', () => {
  const app = load();
  assert.equal(app.tlFreqDays(null, '2026-03-04'), null);
  assert.equal(app.tlFreqDays(undefined, '2026-03-04'), null);
});

test('a frequency that is not weekly returns its own days, which is null for the parsed ones', () => {
  const app = load();
  assert.equal(app.tlFreqDays(DAILY, '2026-03-04'), null);
  assert.equal(app.tlFreqDays(EOD, '2026-03-04'), null);
  assert.equal(app.tlFreqDays(MONTHLY, '2026-03-04'), null);
  assert.equal(app.tlFreqDays(PULSE, '2026-03-04'), null);
  same(app.tlFreqDays({ type: 'daily', days: [2, 5] }, '2026-03-04'), [2, 5]);
});

test('a weekly med with no start date keeps the parsed days: Monday, or Monday and Thursday', () => {
  const app = load();
  same(app.tlFreqDays(WEEKLY), [1]);
  same(app.tlFreqDays(TWICE_WEEKLY), [1, 4]);
  same(app.tlFreqDays(WEEKLY, ''), [1]);
  same(app.tlFreqDays(TWICE_WEEKLY, null), [1, 4]);
  same(app.tlFreqDays({ type: 'weekly', count: 2 }), [1]);
});

test('a weekly med with an unreadable start date keeps the parsed days', () => {
  const app = load();
  same(app.tlFreqDays(TWICE_WEEKLY, 'not a date'), [1, 4]);
  same(app.tlFreqDays({ type: 'weekly', count: 1 }, 'not a date'), [1]);
});

test('a once-weekly med falls on the weekday the protocol started', () => {
  const app = load();
  same(app.tlFreqDays(WEEKLY, '2026-03-01'), [0]);   /* Sunday */
  same(app.tlFreqDays(WEEKLY, '2026-03-02'), [1]);   /* Monday */
  same(app.tlFreqDays(WEEKLY, '2026-03-04'), [3]);   /* Wednesday */
  same(app.tlFreqDays(WEEKLY, '2026-03-07'), [6]);   /* Saturday */
});

test('a twice-weekly med falls on the start weekday and three days after it', () => {
  const app = load();
  same(app.tlFreqDays(TWICE_WEEKLY, '2026-03-01'), [0, 3]);   /* Sunday, Wednesday */
  same(app.tlFreqDays(TWICE_WEEKLY, '2026-03-02'), [1, 4]);   /* Monday, Thursday */
  same(app.tlFreqDays(TWICE_WEEKLY, '2026-03-04'), [3, 6]);   /* Wednesday, Saturday */
  same(app.tlFreqDays(TWICE_WEEKLY, '2026-03-06'), [5, 1]);   /* Friday, Monday */
  same(app.tlFreqDays(TWICE_WEEKLY, '2026-03-07'), [6, 2]);   /* Saturday, Tuesday */
});

test('the start date may be a Date as well as a date string', () => {
  same(load().tlFreqDays(TWICE_WEEKLY, new Date(2026, 2, 4, 18, 45)), [3, 6]);
});

test('a weekly count is spread from the start day; days the user named stay put', () => {
  const app = load();
  /* 4 March 2026 is a Wednesday. Three a week: Wednesday, Friday, Sunday. */
  same(app.tlFreqDays({ type: 'weekly', count: 3, days: [1, 3, 5] }, '2026-03-04'), [3, 5, 0]);
  same(app.tlFreqDays({ type: 'weekly' }, '2026-03-04'), [3]);
  same(app.tlFreqDays({ type: 'weekly', count: 3, days: [1, 3, 5], named: true }, '2026-03-04'), [1, 3, 5]);
  /* Five on, two off, from Wednesday: Wednesday to Sunday. */
  same(app.tlFreqDays({ type: 'weekly', count: 5, days: [1, 2, 3, 4, 5], run: true }, '2026-03-04'), [3, 4, 5, 6, 0]);
});

/* ---- getDoseDays: which of the next N days are dose days ----------------- */

const med = (freq) => ({ name: 'Compound', dose: '1mg', freq });

test('a daily med is due on every one of the next seven days by default', () => {
  const app = load();
  same(app.getDoseDays(med(DAILY), '2026-03-02'), [0, 1, 2, 3, 4, 5, 6]);
  same(app.getDoseDays(med(DAILY), '2026-03-02', 3), [0, 1, 2]);
  same(app.getDoseDays(med(DAILY), '2026-03-02', 0), []);
});

test('a twice-daily med is one dose day per day, not two', () => {
  same(load().getDoseDays(med(TWICE_DAILY), '2026-03-02', 3), [0, 1, 2]);
});

test('nothing is due before the protocol has started', () => {
  /* The start date is three weeks away. Every day until then used to be a
     dose day; only interval meds checked the start. */
  same(load().getDoseDays(med(DAILY), '2026-03-25'), []);
  /* It starts the day after tomorrow. */
  same(load().getDoseDays(med(DAILY), '2026-03-06'), [2, 3, 4, 5, 6]);
});

test('an every-other-day med counts from the start date', () => {
  const app = load();
  same(app.getDoseDays(med(EOD), '2026-03-04'), [0, 2, 4, 6]);        /* started today */
  same(app.getDoseDays(med(EOD), '2026-03-03'), [1, 3, 5]);           /* started yesterday */
  same(app.getDoseDays(med(EOD), '2026-01-01'), [0, 2, 4, 6]);        /* 62 days ago */
  same(app.getDoseDays(med(EOD), '2026-01-02'), [1, 3, 5]);           /* 61 days ago */
});

test('an every-third-day med counts from the start date', () => {
  const app = load();
  same(app.getDoseDays(med(E3D), '2026-03-04', 10), [0, 3, 6, 9]);
  same(app.getDoseDays(med(E3D), '2026-03-02', 10), [1, 4, 7]);
  same(app.getDoseDays(med(E3D), '2026-03-03', 10), [2, 5, 8]);
});

test('an interval med is not due before its start date', () => {
  same(load().getDoseDays(med(EOD), '2026-03-07', 10), [3, 5, 7, 9]);
});

test('an interval med with no start date counts from today', () => {
  const app = load();
  same(app.getDoseDays(med(EOD), undefined), [0, 2, 4, 6]);
  same(app.getDoseDays(med(E3D), ''), [0, 3, 6]);
});

test('interval dose days stay in step across a daylight-saving change', () => {
  /* 8 March 2026 is 23 hours long in Chicago; 5 April is 25 hours long in
     Auckland. Forty days from 4 March covers both. */
  const expected = [];
  for (let i = 0; i < 40; i += 2) expected.push(i);
  same(load().getDoseDays(med(EOD), '2026-03-04', 40), expected);
});

test('a weekly med with no start date is due on Monday', () => {
  const app = load();
  /* Today is Wednesday, so Monday is five days out and Thursday is tomorrow. */
  same(app.getDoseDays(med(WEEKLY), undefined), [5]);
  same(app.getDoseDays(med(TWICE_WEEKLY), undefined), [1, 5]);
  same(app.getDoseDays(med(TWICE_WEEKLY), undefined, 14), [1, 5, 8, 12]);
});

test('a weekly med with a start date is due on the weekday the protocol started', () => {
  const app = load();
  same(app.getDoseDays(med(WEEKLY), '2026-02-25'), [0]);        /* started on a Wednesday */
  same(app.getDoseDays(med(WEEKLY), '2026-02-27'), [2]);        /* started on a Friday */
  same(app.getDoseDays(med(WEEKLY), '2026-03-02', 14), [5, 12]); /* started on a Monday */
});

test('a twice-weekly med with a start date is due on the start weekday and three days later', () => {
  const app = load();
  same(app.getDoseDays(med(TWICE_WEEKLY), '2026-02-25', 14), [0, 3, 7, 10]);   /* Wed, Sat */
  same(app.getDoseDays(med(TWICE_WEEKLY), '2026-02-27', 14), [2, 5, 9, 12]);   /* Fri, Mon */
  same(app.getDoseDays(med(TWICE_WEEKLY), '2026-03-02', 14), [1, 5, 8, 12]);   /* Mon, Thu */
});

test('a weekly med is not due before the protocol has started', () => {
  /* The protocol starts on Friday 10 April, five weeks from now. This Friday
     and next used to be dose days already. */
  same(load().getDoseDays(med(WEEKLY), '2026-04-10', 14), []);
  same(load().getDoseDays(med(WEEKLY), '2026-04-10', 45), [37, 44]);
});

test('a monthly med is due on the day of the month the protocol started', () => {
  const app = load();
  same(app.getDoseDays(med(MONTHLY), '2026-01-04'), [0]);            /* the 4th is today */
  same(app.getDoseDays(med(MONTHLY), '2026-01-10'), [6]);            /* the 10th */
  same(app.getDoseDays(med(MONTHLY), '2026-01-04', 32), [0, 31]);    /* 4 March and 4 April */
  same(app.getDoseDays(med(MONTHLY), '2026-01-20'), []);             /* the 20th is past the window */
});

test('a monthly med with no start date is due today and on this day of each month', () => {
  same(load().getDoseDays(med(MONTHLY), undefined, 32), [0, 31]);
});

test('a monthly med started on the 31st falls on the last day of a shorter month', () => {
  /* 31 March is 27 days out, 30 April 57 and 31 May 88. April used to have no
     dose at all. */
  same(load().getDoseDays(med(MONTHLY), '2026-01-31', 90), [27, 57, 88]);
});

test('a ten-day pulse med is never due', () => {
  /* PINNED, suspected bug: parseFrequency() produces type "pulse" and nothing
     in getDoseDays() handles it, so the med has no dose days, no reminders
     and no calendar entries. */
  same(load().getDoseDays(med(PULSE), '2026-03-04', 30), []);
});

test('a frequency of an unknown type is never due', () => {
  same(load().getDoseDays(med({ type: 'fortnightly' }), '2026-03-04', 30), []);
});

test('a med without a frequency, or with one that is not a schedule, has no dose days', () => {
  const app = load();
  same(app.getDoseDays({ name: 'HCG', dose: '500IU' }, '2026-03-04'), []);
  same(app.getDoseDays(med(AS_NEEDED), '2026-03-04', 30), []);
  same(app.getDoseDays(med(check('every 4.5 days')), '2026-03-04', 30), []);
});

test('dose days are counted from today, so they move when the clock does', () => {
  const app = load();
  same(app.getDoseDays(med(WEEKLY), '2026-03-02'), [5]);
  app.harness.setNow('2026-03-08T23:59');   /* Sunday night */
  same(app.getDoseDays(med(WEEKLY), '2026-03-02'), [1]);
  app.harness.setNow('2026-03-09T00:01');   /* Monday morning */
  same(app.getDoseDays(med(WEEKLY), '2026-03-02'), [0]);
});

test('meds parsed from protocol text can be passed straight in', () => {
  const app = load();
  const meds = app.parseMeds('Testosterone Cypionate, 100mg, Twice weekly\nHCG, 500IU, EOD\nAnastrozole, 0.5mg, Daily');
  same(meds.map((m) => app.getDoseDays(m, '2026-03-02', 7)), [
    [1, 5],            /* Monday start: Thursday and Monday */
    [0, 2, 4, 6],
    [0, 1, 2, 3, 4, 5, 6]
  ]);
});

/* ---- getDefaultTimes: the reminder times a med gets ---------------------- */

test('a twice-daily med is reminded at 08:00 and 21:00', () => {
  same(load().getDefaultTimes(TWICE_DAILY), ['08:00', '21:00']);
});

test('a once-daily med is reminded at 08:00', () => {
  const app = load();
  same(app.getDefaultTimes(DAILY), ['08:00']);
  same(app.getDefaultTimes(unrecognised('Before bed')), ['08:00']);
});

test('every other kind of med is reminded at 09:00', () => {
  const app = load();
  same(app.getDefaultTimes(EOD), ['09:00']);
  same(app.getDefaultTimes(E3D), ['09:00']);
  same(app.getDefaultTimes(WEEKLY), ['09:00']);
  same(app.getDefaultTimes(TWICE_WEEKLY), ['09:00']);
  same(app.getDefaultTimes(MONTHLY), ['09:00']);
  same(app.getDefaultTimes(PULSE), ['09:00']);
});

test('default reminder times follow the doses a day, or the times the line named', () => {
  const app = load();
  same(app.getDefaultTimes({ type: 'weekly', times: 2 }), ['08:00', '21:00']);
  same(app.getDefaultTimes({ type: 'daily', times: 3 }), ['08:00', '14:00', '20:00']);
  same(app.getDefaultTimes({ type: 'daily', times: 4 }), ['08:00', '12:00', '16:00', '20:00']);
  same(app.getDefaultTimes({ type: 'daily', times: 1, at: ['21:30'] }), ['21:30']);
  same(app.getDefaultTimes({ type: 'daily', times: 2, at: ['08:00', '12:00'] }), ['08:00', '12:00']);
  /* Times that do not match the count are not used. */
  same(app.getDefaultTimes({ type: 'daily', times: 2, at: ['21:30'] }), ['08:00', '21:00']);
  same(app.getDefaultTimes({}), ['09:00']);
});

test('no frequency at all throws', () => {
  assert.throws(() => load().getDefaultTimes(undefined), { name: 'TypeError' });
});
