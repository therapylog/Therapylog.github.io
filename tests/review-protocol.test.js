/* Review findings on reading and writing the protocol model
 * (src/logic/protocol.js): a dose's unit (3), weekday words (4), the old
 * fields written back from the model (10), the text after a line's frequency
 * (11), the discreet switch (13), a stored protocol that is malformed (21),
 * and the key of a name with no letters a-z (5).
 *
 * The tests for each finding were written against the code before its fix and
 * failed there. A few beside them pin what the fixes had to keep working.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays', 'getDoseDays',
              'tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['tlLocalDate', 'TL_DAY_MS'],
  now: '2026-11-17T12:00'
});
const env = { resolve: () => null, medium: () => null, discreet: false };

/* A record starting on Monday 2 March 2026, or on the day given. */
const record = (meds, start) => ({
  entries: [], proto: { name: 'P', start: start || '2026-03-02', weeks: 12, meds, pct: '', _created: '2026-03-02T12:00:00.000Z' }
});
const first = (meds, start) => app.tlProtocolFromLegacy(record(meds, start), env).compounds[0];
const rule = (meds, start) => plain(first(meds, start).rule);

/* ---- 3: a dose whose unit the parser cannot take ------------------------- */

test('a dose with a space before a unit followed by a slash keeps its text and gets no amount', () => {
  for (const text of ['250 mcg/day', '200 mg/week', '10 IU/day', '100 mg/ml']) {
    same(app.tlParseDose(text), { amount: null, unit: null, text }, text);
  }
});

test('a number followed by a word the parser does not know as a unit gets no amount', () => {
  for (const text of ['2 sprays', '250 mcgs', '250 twice daily', '250 мг']) {
    same(app.tlParseDose(text), { amount: null, unit: null, text }, text);
  }
  /* A unit it does know, then a word, is still read. */
  same(app.tlParseDose('80 mg IM'), { amount: 80, unit: 'mg', text: '80 mg IM' });
  same(app.tlParseDose('100'), { amount: 100, unit: null, text: '100' });
});

test('such a dose is shown as typed, so its unit is not lost from the text', () => {
  assert.equal(app.tlDoseText(app.tlParseDose('250 mcg/day')), '250 mcg/day');
  assert.equal(app.tlDoseText(app.tlParseDose('2 sprays')), '2 sprays');
});

/* ---- 4: weekday words ---------------------------------------------------- */

test('a range of weekdays is read as every day it covers', () => {
  same(rule('X, 1mg, Daily (Mon-Fri)'), { weekdays: [1, 2, 3, 4, 5] });
  same(rule('X, 1mg, Mon through Fri'), { weekdays: [1, 2, 3, 4, 5] });
  same(rule('X, 1mg, Monday to Friday'), { weekdays: [1, 2, 3, 4, 5] });
  same(rule('X, 1mg, Daily (Fri - Mon)'), { weekdays: [0, 1, 5, 6] });
  /* A dash between three days is a list, not a range. */
  same(rule('X, 1mg, Mon-Wed-Fri'), { weekdays: [1, 3, 5] });
});

test('days named after "except" or "skip" are not dose days: the line keeps its plain reading', () => {
  same(rule('X, 1mg, Daily except Sunday'), { daily: true });
  same(rule('X, 1mg, Daily except Sat and Sun'), { daily: true });
  same(rule('X, 1mg, Daily, skip Sundays'), { daily: true });
  same(rule('X, 1mg, Daily (not Sun)'), { daily: true });
});

test('a start day is not the only dose day: a twice-weekly line starting Monday stays twice weekly', () => {
  /* From a Friday start the old week view put it on Friday and Monday. */
  same(rule('X, 1mg, Twice weekly (starting Mon)', '2026-03-06'), { weekdays: [1, 5] });
  same(rule('X, 1mg, Weekly from Tuesday', '2026-03-06'), { weekdays: [5] });
});

test('a pulse that names its start day is still a pulse, with no rule and no round', () => {
  const c = first('X, 1mg, 10-day pulse (start Monday)');
  assert.equal(c.rule, null);
  same(plain(c.slots), []);
});

test('plural day names are read as days', () => {
  same(rule('X, 1mg, Weekly on Sundays'), { weekdays: [0] });
  same(rule('X, 1mg, Twice weekly (Tuesdays and Saturdays)'), { weekdays: [2, 6] });
});

test('a weekly line naming a different number of days than it says it takes keeps the start-day reading', () => {
  same(rule('X, 1mg, Twice weekly (Mon)', '2026-03-06'), { weekdays: [1, 5] });
  same(rule('X, 1mg, Weekly (Mon/Thu)', '2026-03-06'), { weekdays: [5] });
  /* The count matches, so the named days win, as before. */
  same(rule('X, 1mg, Twice weekly (Mon/Thu)', '2026-03-06'), { weekdays: [1, 4] });
});

test('a count the line states is the count, though the old parser reads "3x weekly" as once a week', () => {
  assert.equal(app.parseFrequency('3x weekly (Mon/Wed/Fri)').count, 1);
  same(rule('X, 1mg, 3x weekly (Mon/Wed/Fri)', '2026-03-06'), { weekdays: [1, 3, 5] });
  same(rule('X, 1mg, 3 times weekly: Mon, Wed, Fri', '2026-03-06'), { weekdays: [5] });   /* a comma ends the field */
  same(rule('X, 1mg, 3x weekly (Mon/Thu)', '2026-03-06'), { weekdays: [5] });
});

/* ---- 11: the text after the frequency ------------------------------------ */

test('text after a line\'s frequency is kept as a note on the compound', () => {
  const p = app.tlProtocolFromLegacy(record('BPC-157, 250mcg, Daily, inject near the injury\n' +
    'Testosterone Cypionate, 100mg, Twice weekly, Mon AM and Thu PM, glute only\nHCG, 250IU, Daily'), env);
  same(p.compounds.map((c) => [c.name, c.freqText, c.note]), [
    ['BPC-157', 'Daily', 'inject near the injury'],
    ['Testosterone Cypionate', 'Twice weekly', 'Mon AM and Thu PM, glute only'],
    ['HCG', 'Daily', undefined]
  ]);
});

test('weekdays in a note set a weekly line\'s days only when they are as many as the line takes', () => {
  same(rule('X, 1mg, Twice weekly, Mon AM and Thu PM, glute only', '2026-03-06'), { weekdays: [1, 4] });
  /* A daily line is not made weekly by a day in its note. */
  same(rule('X, 1mg, Daily, refill on Fridays'), { daily: true });
  /* Nor is a weekly line moved by a note that does not list its days. */
  same(rule('X, 1mg, Weekly, started on a Wednesday', '2026-03-06'), { weekdays: [5] });
  same(rule('X, 1mg, Twice weekly, Mon/Wed/Fri', '2026-03-06'), { weekdays: [1, 5] });
});

test('storing the model writes the note back after the frequency, where the old screens ignore it', () => {
  const d = record('BPC-157, 250mcg, Daily, inject near the injury\n' +
    'Testosterone Cypionate, 100mg, Twice weekly, Mon AM and Thu PM, glute only');
  app.tlMigrateRecord(d, env);
  app.tlStoreProtocol(d, d.protocol);
  same(d.proto.meds.split('\n'), [
    'BPC-157, 250mcg, Daily, inject near the injury',
    'Testosterone Cypionate, 100mg, Twice weekly (Mon · Thu), Mon AM and Thu PM, glute only'
  ]);
  /* The old screens still read three fields. */
  same(app.parseMeds(d.proto.meds).map((m) => [m.name, m.dose, m.freqStr]),
    [['BPC-157', '250mcg', 'Daily'], ['Testosterone Cypionate', '100mg', 'Twice weekly (Mon · Thu)']]);
});

/* ---- 10: the old fields written from the model --------------------------- */

const SLOTS = { am: { t: 420 }, mid: { t: 750 }, eve: { t: 1080 }, bed: { t: 1350 } };
const C = (o) => Object.assign({ key: 'x', name: 'X', dose: { amount: 1, unit: 'mg', text: '1mg' }, rule: { daily: true }, slots: ['am'] }, o);
const store = (compounds, slots, start) => {
  const d = { entries: [], proto: null };
  app.tlStoreProtocol(d, { name: 'P', start: start === undefined ? '2026-11-02' : start, compounds,
    slots: Object.assign({}, SLOTS, slots) });
  return d;
};
const readBack = (d) => app.tlProtocolFromLegacy({ entries: [], proto: d.proto, reminderTimes: d.reminderTimes }, env);

test('a rule the old text cannot say is written so the old screens show no dose days, not daily', () => {
  const rules = [{ every: { weeks: 2 } }, { every: { days: 4 } }, { every: { days: 10 } }, { every: { days: 3.5 } },
    { daily: true, pattern: { on: 5, off: 2 } }, { taper: ['40mg', '20mg'], per: 'week' }, { weekdays: [1, 3, 5] }];
  rules.forEach((r) => {
    const d = store([C({ rule: r })]);
    const med = app.parseMeds(d.proto.meds)[0];
    assert.equal(med.freq.type, 'pulse', d.proto.meds);
    assert.match(med.freqStr, /pulse - see app/);
    assert.equal(app.getDoseDays(med, d.proto.start, 28).length, 0, d.proto.meds);
    assert.equal(readBack(d).compounds[0].rule, null, d.proto.meds);
  });
  /* The label is kept where it does not read as another frequency. */
  assert.equal(app.parseMeds(store([C({ rule: { every: { weeks: 2 } } })]).proto.meds)[0].freqStr, 'Every 2 weeks (pulse - see app)');
});

test('an unscheduled compound is written as a pulse whatever its old frequency text said', () => {
  const d = store([C({ rule: null, freqText: 'Daily', slots: [] })]);
  assert.equal(app.parseMeds(d.proto.meds)[0].freq.type, 'pulse');
  assert.equal(readBack(d).compounds[0].rule, null);
  /* The user's own pulse wording is kept. */
  assert.equal(app.parseMeds(store([C({ rule: null, freqText: '10-day pulse', slots: [] })]).proto.meds)[0].freqStr, '10-day pulse');
});

test('reminder times are written under the name as it appears in the line', () => {
  const d = store([C({ name: 'Blend A, B', slots: ['eve'] })], { eve: { t: 1140 } });
  assert.equal(d.proto.meds, 'Blend A; B, 1mg, Daily');
  same(Object.keys(d.reminderTimes), ['Blend A; B']);
  const back = readBack(d);
  same(plain(back.compounds[0].slots), ['eve']);
  assert.equal(app.tlMinToTime(back.slots.eve.t), '19:00');
});

test('a slot time is kept inside its own slot, so the compounds in it read back in the same slot', () => {
  /* Morning at 11:30 is past the end of the morning span, 10:59. */
  const p = app.tlNormalizeProtocol({ compounds: [], slots: { am: { t: 690 }, mid: { t: 600 }, eve: { t: 1300 }, bed: { t: 300 } } });
  same([p.slots.am.t, p.slots.mid.t, p.slots.eve.t, p.slots.bed.t].map(app.tlMinToTime), ['10:59', '11:00', '20:29', '03:59']);
  const d = store([C({ key: 'a', name: 'A', slots: ['am'] }), C({ key: 'b', name: 'B', slots: ['mid'] })], { am: { t: 690 }, mid: { t: 780 } });
  const back = readBack(d);
  same(back.compounds.map((c) => plain(c.slots)), [['am'], ['mid']]);
  same([back.slots.am.t, back.slots.mid.t].map(app.tlMinToTime), ['10:59', '13:00']);
});

test('a dose whose amount and text disagree is written as its amount', () => {
  assert.equal(store([C({ dose: { amount: 80, unit: 'mg', text: '100mg' } })]).proto.meds, 'X, 80 mg, Daily');
  /* Text that says the same amount is kept as typed. */
  assert.equal(store([C({ dose: { amount: 250, unit: 'mcg', text: '250mcg twice daily' } })]).proto.meds, 'X, 250mcg twice daily, Daily');
  assert.equal(store([C({ dose: { amount: null, unit: null, text: '200mg/week' } })]).proto.meds, 'X, 200mg/week, Daily');
});

/* The round trip, over a spread of protocols built from a seeded generator:
   whatever the model says, the old fields written from it either read back as
   the same doses on the same days in the same slots at the same times, or, for
   a rule they cannot say, read back as no schedule at all. */
test('the old fields written from any protocol read back as the same protocol, or as no schedule', () => {
  let seed = 20261117;
  const rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const pick = (list) => list[rand(list.length)];
  const NAMES = ['BPC-157', 'Testosterone Cypionate', 'Blend A, B', 'HCG', 'Сустанон', 'TB-500', 'Ipamorelin', 'My Stack: #2'];
  const DOSES = ['250mcg', '250 mcg', '100mg', '0.5 ml', '2 IU', '200mg/week', '250 mcg/day', '2 sprays', '1 tab', '80 mg IM'];
  const RULES = [{ daily: true }, { every: { days: 1 } }, { every: { days: 2 } }, { every: { days: 3 } }, { every: { days: 7 } },
    { weekdays: [1] }, { weekdays: [0, 4] }, { weekdays: [2, 6] }, { weekdays: [0, 1, 2, 3, 4, 5, 6] },
    { weeklyCount: 1 }, { weeklyCount: 2 }, { monthly: true },
    { every: { weeks: 2 } }, { every: { days: 3.5 } }, { every: { days: 10 } }, { weekdays: [1, 3, 5] },
    { daily: true, pattern: { on: 5, off: 2 } }, { taper: ['40mg', '20mg'], per: 'week' }, { daily: true, fromWeek: 3 }, null];
  const NOTES = [undefined, undefined, 'glute only', 'Mon AM and Thu PM, glute only', 'not with food'];
  const SIMPLE = (r, start) => {
    if (!r) return false;
    const k = Object.keys(r);
    if (k.length !== 1) return false;
    if (r.daily === true) return true;
    if (r.every) return Object.keys(r.every).length === 1 && (r.every.days === 1 || ([2, 3, 7].includes(r.every.days) && !!start));
    if (r.weekdays) return r.weekdays.length <= 2 || r.weekdays.length === 7;
    if (r.weeklyCount || r.monthly) return !!start;
    return false;
  };
  const dueDays = (p, c) => {
    const out = [];
    for (let i = 0; i < 70; i++) {
      const day = new Date(2026, 10, 2 + i);
      if (app.tlDoseDueOn(p, c, day) !== null) out.push(i);
    }
    return out;
  };
  for (let n = 0; n < 150; n++) {
    const start = n % 10 === 0 ? null : '2026-11-0' + (2 + rand(7));
    const names = NAMES.slice().sort(() => rand(3) - 1).slice(0, 1 + rand(5));
    const compounds = names.map((name, i) => {
      const r = pick(RULES);
      const slots = ['am', 'mid', 'eve', 'bed'].filter(() => rand(2));
      return { key: 'k' + i, name, dose: app.tlParseDose(pick(DOSES)), rule: r, slots: r && !slots.length ? ['am'] : slots,
        note: pick(NOTES) };
    });
    const slots = {};
    ['am', 'mid', 'eve', 'bed'].forEach((k) => { slots[k] = { t: rand(1440), alert: true }; });
    const model = app.tlNormalizeProtocol({ name: 'P', start, compounds, slots });
    const d = store(compounds, slots, start);
    const back = readBack(d);
    const label = JSON.stringify({ start, line: d.proto && d.proto.meds });
    assert.equal(back.compounds.length, model.compounds.length, label);
    model.compounds.forEach((c, i) => {
      const b = back.compounds[i];
      assert.equal(b.name, c.name.replace(/,/g, ';'), label);
      assert.equal(b.note, c.note, label);
      assert.equal(b.dose.amount, c.dose.amount, label);
      assert.equal(b.dose.unit, c.dose.unit, label);
      if (SIMPLE(c.rule, start)) {
        same(dueDays(back, b), plain(dueDays(model, c)), label + ' ' + c.name);
        same(plain(b.slots), plain(c.slots), label);
        b.slots.forEach((k) => assert.equal(back.slots[k].t, model.slots[k].t, label + ' ' + k));
      } else {
        assert.equal(b.rule, null, label + ' ' + c.name);
        assert.equal(app.parseMeds(d.proto.meds)[i].freq.type, 'pulse', label);
      }
    });
  }
});

/* ---- 13: the discreet switch --------------------------------------------- */

test('a stored protocol hides compound names when either it or this device says to', () => {
  const d = { entries: [], proto: null, protocol: { compounds: [C()], slots: {}, discreet: false }, v: 3 };
  assert.equal(app.tlProtocol(d, { discreet: true }).discreet, true);
  assert.equal(app.tlProtocol(d, { discreet: false }).discreet, false);
  d.protocol.discreet = true;
  assert.equal(app.tlProtocol(d, { discreet: false }).discreet, true);
  assert.equal(app.tlProtocol(d, {}).discreet, true);
});

/* ---- 21: a stored protocol from a damaged or foreign file ---------------- */

test('a compound whose slots are not a list has no slots, rather than stopping the read', () => {
  for (const slots of [5, { am: true }, 'am', null]) {
    const p = app.tlNormalizeProtocol({ compounds: [{ key: 'x', name: 'X', slots }] });
    same(plain(p.compounds[0].slots), [], JSON.stringify(slots));
  }
  assert.doesNotThrow(() => app.tlNormalizeProtocol({ compounds: 'nope', slots: 5 }));
  assert.doesNotThrow(() => app.tlNormalizeProtocol(null));
});

test('a stored key that is repeated or holds a colon is replaced, and a good key is kept', () => {
  const p = app.tlNormalizeProtocol({ compounds: [
    { key: 'bpc:am', name: 'BPC-157' }, { key: 'tc', name: 'Testosterone' }, { key: 'tc', name: 'Test E' },
    { key: 'bpc-157', name: 'Other' }, { key: '', name: 'Blank' }
  ] });
  const keys = p.compounds.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length);
  keys.forEach((k) => assert.ok(typeof k === 'string' && k && !k.includes(':'), k));
  /* The first holder of a good key keeps it, so its logged doses still match. */
  same(keys.slice(1, 2), ['tc']);
  assert.equal(keys[3], 'bpc-157');
  /* A key made for a damaged one does not take a good key that comes later. */
  assert.notEqual(keys[0], 'bpc-157');
  same(keys.map((k) => app.tlParseDoseId(k + ':am:2026-03-05') !== null), [true, true, true, true, true]);
});

/* ---- 5: keys for names with no letters a-z ------------------------------- */

test('a name with no letters a-z gets a key of its own, the same wherever its line is', () => {
  const a = app.tlProtocolFromLegacy(record('Сустанон, 250mg, Weekly\nМельдоний, 500mg, Daily'), env).compounds;
  const b = app.tlProtocolFromLegacy(record('Мельдоний, 500mg, Daily\nСустанон, 250mg, Weekly'), env).compounds;
  const key = (list, name) => list.find((c) => c.name === name).key;
  assert.equal(key(a, 'Сустанон'), key(b, 'Сустанон'));
  assert.equal(key(a, 'Мельдоний'), key(b, 'Мельдоний'));
  assert.notEqual(key(a, 'Сустанон'), key(a, 'Мельдоний'));
  assert.match(key(a, 'Сустанон'), /^c-[0-9a-z]+$/);
});
