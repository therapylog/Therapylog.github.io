/* Characterization tests: the legacy protocol schedule.
 *
 * A protocol is stored as free text, one compound per line ("name, dose,
 * frequency"). parseMeds() and parseFrequency() turn that text into meds, and
 * getDoseDays() / tlFreqDays() / getDefaultTimes() answer "which of the next N
 * days is a dose day, and at what time" for the dashboard, the week view, the
 * reminders and the calendar export.
 *
 * These pin what that code DOES today, including the parts that look wrong, so
 * that the redesign's protocol model can be shown to read every stored
 * protocol the way the app reads it now. Nothing here says the behaviour is
 * right. Tests marked "PINNED, suspected bug:" are the ones to decide about.
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
  functions: ['parseFrequency', 'parseMeds', 'tlFreqDays', 'getDoseDays', 'getDefaultTimes'],
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
/* What an unrecognised phrase becomes: once daily, labelled with the text. */
const unrecognised = (text) => ({ type: 'daily', times: 1, label: text, days: null });

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

test('e3.5d, twice weekly, 2x week, 2x/week and biweekly are read as twice a week on Monday and Thursday', () => {
  allParseTo(load(), ['e3.5d', 'twice week', 'twice weekly', '2x week', '2x weekly', '2x/week', 'biweekly'],
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

test('a phrase is matched anywhere inside the text, not as a whole word', () => {
  const app = load();
  same(app.parseFrequency('SubQ daily AM fasted'), DAILY);
  same(app.parseFrequency('Weekly SubQ, titrate by 2.5mg'), WEEKLY);
  /* "bid" is found inside "libido". */
  same(app.parseFrequency('as needed for libido'), TWICE_DAILY);
});

test('the first check that matches wins, so earlier phrases shadow later ones', () => {
  const app = load();
  same(app.parseFrequency('twice daily for 10 days'), TWICE_DAILY);   /* not a pulse */
  same(app.parseFrequency('daily for 10 days'), DAILY);               /* not a pulse */
  same(app.parseFrequency('EOD or daily'), DAILY);                    /* daily is checked before eod */
  same(app.parseFrequency('weekly, or every 3 days'), E3D);           /* every 3 days is checked before weekly */
  same(app.parseFrequency('Weekly SubQ injection OR twice weekly for steadier levels'), TWICE_WEEKLY);
  same(app.parseFrequency('monthly pulse'), MONTHLY);                 /* monthly is checked before pulse */
});

test('a phrase it does not recognise becomes once daily and keeps the text as its label', () => {
  const app = load();
  same(app.parseFrequency('As needed'), unrecognised('As needed'));
  same(app.parseFrequency('Before bed SubQ fasted'), unrecognised('Before bed SubQ fasted'));
  /* The label is the text as given: not trimmed, not lower-cased. */
  same(app.parseFrequency('  PRN  '), unrecognised('  PRN  '));
  same(app.parseFrequency(''), unrecognised(''));
});

test('a value that is not a string throws', () => {
  const app = load();
  assert.throws(() => app.parseFrequency(undefined), { name: 'TypeError' });
  assert.throws(() => app.parseFrequency(null), { name: 'TypeError' });
  assert.throws(() => app.parseFrequency(7), { name: 'TypeError' });
});

test('common ways of writing a weekly or longer schedule fall through to once daily', () => {
  const app = load();
  /* PINNED, suspected bug: none of these contain a phrase the parser looks
     for, so each becomes a DAILY dose labelled with the original text. A
     weekly injection written "once a week" is scheduled, reminded and counted
     seven times a week. */
  ['once a week', 'twice a week', 'every 2 weeks', 'every other week', 'every 7 days',
   'every 4 days', 'every 3.5 days', 'once a month', 'QOD', 'Mon/Thu', 'M/W/F'].forEach((p) => {
    same(app.parseFrequency(p), unrecognised(p), `parseFrequency(${JSON.stringify(p)})`);
  });
});

test('more than one dose a day is read as one unless it says twice daily, 2x daily or bid', () => {
  const app = load();
  /* PINNED, suspected bug: "3x daily" matches "daily" and loses its count;
     "twice a day" and "TID" match nothing and become once daily. */
  same(app.parseFrequency('3x daily'), DAILY);
  same(app.parseFrequency('three times daily'), DAILY);
  same(app.parseFrequency('twice a day'), unrecognised('twice a day'));
  same(app.parseFrequency('TID'), unrecognised('TID'));
  same(app.parseFrequency('2x/day'), unrecognised('2x/day'));
});

test('a weekly count other than the recognised twice-weekly phrases is read as once a week', () => {
  const app = load();
  /* PINNED, suspected bug: these match "per week" or "weekly" and lose their
     count, so two or three injections a week are scheduled as one. */
  same(app.parseFrequency('Twice per week'), WEEKLY);
  same(app.parseFrequency('2x per week'), WEEKLY);
  same(app.parseFrequency('3x per week'), WEEKLY);
  same(app.parseFrequency('3x weekly'), WEEKLY);
  same(app.parseFrequency('three times weekly'), WEEKLY);
});

test('biweekly means twice a week, never every two weeks', () => {
  /* PINNED, suspected bug: the word is ambiguous in English; the parser only
     knows one of its meanings. */
  same(load().parseFrequency('biweekly'), TWICE_WEEKLY);
});

test('the frequency phrases used by the app\'s own protocol templates parse as follows', () => {
  const app = load();
  const expected = {
    'Twice weekly': TWICE_WEEKLY,
    '100mg twice weekly (Mon/Thu)': TWICE_WEEKLY,
    'Split: 50mg twice weekly (Mon/Thu)': TWICE_WEEKLY,
    'Weekly SubQ': WEEKLY,
    'Weekly oral fasted': WEEKLY,
    'Weekly SubQ — titrate by 2.5mg every 4 weeks': WEEKLY,
    'Daily oral AM': DAILY,
    'SubQ daily': DAILY,
    'Topical daily': DAILY,
    'Daily SubQ with CJC-1295': DAILY,
    'Twice daily fasted': TWICE_DAILY,
    'Twice daily fasted with CJC-1295': TWICE_DAILY,
    '10-day pulse cycles annually': PULSE,
    'SubQ pulse cycles twice yearly': PULSE,
    /* PINNED, suspected bug: the rest are once daily by default. Two of them
       describe two doses a day and one names two weekdays. */
    'Before bed SubQ fasted': unrecognised('Before bed SubQ fasted'),
    'Once before bed with CJC-1295': unrecognised('Once before bed with CJC-1295'),
    'Split dose AM and noon': unrecognised('Split dose AM and noon'),
    '250mcg AM + 250mcg PM SubQ near injury': unrecognised('250mcg AM + 250mcg PM SubQ near injury'),
    'Mon/Thu alongside Test injection': unrecognised('Mon/Thu alongside Test injection'),
    'Final 2 weeks of cycle (then stop completely)': unrecognised('Final 2 weeks of cycle (then stop completely)')
  };
  Object.keys(expected).forEach((p) => {
    same(app.parseFrequency(p), expected[p], `parseFrequency(${JSON.stringify(p)})`);
  });
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
    color: '#4ade9a',
    id: 'med-0'
  }]);
});

test('each line is a med, numbered and coloured in order', () => {
  const meds = load().parseMeds(
    'Testosterone Cypionate, 100mg, Twice weekly\nBPC-157, 250mcg, Daily\nHCG, 500IU, EOD');
  same(meds, [
    { name: 'Testosterone Cypionate', dose: '100mg', freqStr: 'Twice weekly', freq: TWICE_WEEKLY,
      color: '#4ade9a', id: 'med-0' },
    { name: 'BPC-157', dose: '250mcg', freqStr: 'Daily', freq: DAILY, color: '#3bc4ff', id: 'med-1' },
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, color: '#f59e0b', id: 'med-2' }
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
    { name: 'BPC-157', dose: '250mcg', freqStr: 'daily', freq: DAILY, color: '#4ade9a', id: 'med-0' },
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, color: '#3bc4ff', id: 'med-1' }
  ]);
});

test('a missing frequency is Daily, a missing dose is empty and a missing name is Unknown', () => {
  const app = load();
  same(app.parseMeds('HCG'), [
    { name: 'HCG', dose: '', freqStr: 'Daily', freq: DAILY, color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds('HCG, 500IU'), [
    { name: 'HCG', dose: '500IU', freqStr: 'Daily', freq: DAILY, color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds('HCG, , EOD'), [
    { name: 'HCG', dose: '', freqStr: 'EOD', freq: EOD, color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds(', ,'), [
    { name: 'Unknown', dose: '', freqStr: 'Daily', freq: DAILY, color: '#4ade9a', id: 'med-0' }
  ]);
  same(app.parseMeds(', 5mg, Weekly'), [
    { name: 'Unknown', dose: '5mg', freqStr: 'Weekly', freq: WEEKLY, color: '#4ade9a', id: 'med-0' }
  ]);
});

test('freqStr keeps the text as written while freq.label is the normalised name', () => {
  const [med] = load().parseMeds('HCG, 500IU, every other day');
  assert.equal(med.freqStr, 'every other day');
  assert.equal(med.freq.label, 'Every other day');
});

test('an unrecognised frequency is kept as the label of a once-daily med', () => {
  same(load().parseMeds('Ipamorelin, 200mcg, Before bed'), [{
    name: 'Ipamorelin', dose: '200mcg', freqStr: 'Before bed',
    freq: unrecognised('Before bed'), color: '#4ade9a', id: 'med-0'
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
    { name: 'HCG', dose: '500IU', freqStr: 'EOD', freq: EOD, color: '#4ade9a', id: 'med-0' }
  ]);
});

test('a comma inside the dose pushes the frequency out of place', () => {
  const app = load();
  /* PINNED, suspected bug: the line is split on every comma, so "1,000mcg"
     becomes dose "1" and frequency "000mcg", which is unrecognised and so
     daily. The weekly schedule the user typed is lost. */
  same(app.parseMeds('Vitamin B12, 1,000mcg, Weekly'), [{
    name: 'Vitamin B12', dose: '1', freqStr: '000mcg',
    freq: unrecognised('000mcg'), color: '#4ade9a', id: 'med-0'
  }]);
  /* The same happens to a template whose frequency text contains a comma: the
     app writes templates into the protocol as "name, dose, freq" lines. */
  same(app.parseMeds('BPC-157, 500mcg, SubQ loading phase 4-6 weeks, then once weekly')[0].freq,
    unrecognised('SubQ loading phase 4-6 weeks'));
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

test('any weekly count other than two is one day a week', () => {
  const app = load();
  same(app.tlFreqDays({ type: 'weekly', count: 3, days: [1, 3, 5] }, '2026-03-04'), [3]);
  same(app.tlFreqDays({ type: 'weekly' }, '2026-03-04'), [3]);
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

test('a daily med is due before the protocol has started', () => {
  /* PINNED, suspected bug: the start date is three weeks away and every day
     until then is still a dose day. Only interval meds check the start. */
  same(load().getDoseDays(med(DAILY), '2026-03-25'), [0, 1, 2, 3, 4, 5, 6]);
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

test('a weekly med is due on its weekday before the protocol has started', () => {
  /* PINNED, suspected bug: the protocol starts on Friday 10 April, five weeks
     from now, and this Friday and next are already dose days. */
  same(load().getDoseDays(med(WEEKLY), '2026-04-10', 14), [2, 9]);
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

test('a monthly med started on the 31st is skipped in months that have no 31st', () => {
  /* PINNED, suspected bug: 31 March is 27 days out and 31 May is 88 days out.
     April has no 31st, so there is no dose in April at all. */
  same(load().getDoseDays(med(MONTHLY), '2026-01-31', 90), [27, 88]);
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

test('a med without a frequency throws', () => {
  assert.throws(() => load().getDoseDays({ name: 'HCG', dose: '500IU' }, '2026-03-04'), { name: 'TypeError' });
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

test('times of 2 decides before the type does, and any other count is ignored', () => {
  const app = load();
  same(app.getDefaultTimes({ type: 'weekly', times: 2 }), ['08:00', '21:00']);
  same(app.getDefaultTimes({ type: 'daily', times: 3 }), ['08:00']);
  same(app.getDefaultTimes({}), ['09:00']);
});

test('no frequency at all throws', () => {
  assert.throws(() => load().getDefaultTimes(undefined), { name: 'TypeError' });
});
