/* The Protocol screen's logic: src/logic/protocol-view.js.
 *
 * Its numbers (summary, week strip and caption, a compound's lines), the
 * stack's interactions, the supply form's checks, editing through
 * tlEditProtocol (which records dose changes and keeps the old fields in
 * step), and templates read as the old form read them.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/changes.js', 'src/logic/record.js', 'src/logic/setup.js', 'src/logic/protocol-view.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays',
    'tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['tlLocalDate', 'TL_DAY_MS']
});

const env = { resolve: () => null, medium: () => null, discreet: false };
const THU = local('2026-03-05 09:00');
const compound = (key, name, dose, rule, slots, route) => ({ key, name, drugId: null, dose: app.tlParseDose(dose), route: route || 'sq', rule, slots, inv: null });
const protocol = () => app.tlNormalizeProtocol({
  name: 'P', start: '2026-02-02', weeks: 12,
  compounds: [
    compound('gh', 'Somatropin', '2 IU', { daily: true }, ['am', 'bed']),
    compound('bpc', 'BPC-157', '250 mcg', { daily: true }, ['am']),
    compound('test', 'Testosterone cyp', '80 mg', { weekdays: [1, 4] }, ['am'], 'im'),
    compound('ipa', 'Ipamorelin', '200 mcg', { daily: true }, ['bed'])
  ]
});

test('the summary: compounds, rounds a day, and the protocol\'s week', () => {
  same(plain(app.tlProtocolSummary(protocol(), THU)), { count: 4, rounds: 2, week: 5, start: '2026-02-02', weeks: 12 });
  const p = protocol(); p.start = null;
  assert.equal(app.tlProtocolSummary(p, THU).week, null);
  p.start = '2026-03-10';
  assert.equal(app.tlProtocolSummary(p, THU).week, null);
});

test('the week strip runs Monday to Sunday, with each day\'s doses and today marked', () => {
  const strip = app.tlWeekStrip(protocol(), THU);
  same(strip.map((w) => w.letter + w.count + (w.today ? '*' : '')), ['M5', 'T4', 'W4', 'T5*', 'F4', 'S4', 'S4']);
  assert.equal(strip[0].day, '2026-03-02');
  /* A Sunday is the end of its week, not the start of the next. */
  assert.equal(app.tlWeekStrip(protocol(), local('2026-03-08 09:00'))[0].day, '2026-03-02');
});

test('the caption names what makes one day differ from another', () => {
  assert.equal(app.tlWeekCaption(protocol(), THU), 'Doses per day this week. Testosterone cyp adds one on Monday and Thursday.');
  const p = protocol(); p.compounds = p.compounds.filter((c) => c.key !== 'test');
  assert.equal(app.tlWeekCaption(p, THU), 'Doses per day this week.');
  p.compounds.push(compound('x', 'X', '1 mg', { weekdays: [1, 3, 5] }, ['am', 'bed']));
  assert.equal(app.tlWeekCaption(p, THU), 'Doses per day this week. X adds two on Monday, Wednesday and Friday.');
});

test('a compound\'s lines: dose, days and route; its round times', () => {
  const p = protocol();
  assert.equal(app.tlCompoundLine(app.tlCompound(p, 'test')), '80 mg · Mon · Thu · IM');
  assert.equal(app.tlSlotTimesText(app.tlCompound(p, 'gh'), p), 'Morning 07:00 · Bedtime 22:30');
  const loose = compound('n', 'N', '', null, []);
  assert.equal(app.tlCompoundLine(loose), 'No dose set · No schedule · SubQ');
  assert.equal(app.tlSlotTimesText(loose, p), 'No time set yet');
});

test('interactions: two or more of an entry\'s drugs on the stack, by name or encyclopedia name', () => {
  const ix = [
    { drugs: ['Ipamorelin', 'CJC-1295'], severity: 'info', title: 'Pairing' },
    { drugs: ['Semaglutide', 'Tirzepatide'], severity: 'danger', title: 'Never combine' },
    { drugs: ['Somatropin', 'BPC-157', 'Insulin'], severity: 'warn', title: 'Watch' }
  ];
  same(app.tlStackInteractions(protocol(), ix, () => null).map((x) => x.title), ['Watch']);
  const p = protocol();
  p.compounds.push(Object.assign(compound('mod', 'Mod GRF', '100 mcg', { daily: true }, ['bed']), { drugId: 'cjc' }));
  same(app.tlStackInteractions(p, ix, (id) => (id === 'cjc' ? 'CJC-1295' : null)).map((x) => x.title), ['Pairing', 'Watch']);
});

test('the supply form: both blank is no count; otherwise whole numbers, left no more than per vial', () => {
  assert.equal(app.tlSupplyProblem({ per: '', left: '', spare: 0 }), null);
  assert.equal(app.tlSupplyProblem({ per: '20', left: '6', spare: 1 }), null);
  assert.match(app.tlSupplyProblem({ per: '', left: '6' }), /per vial/);
  assert.match(app.tlSupplyProblem({ per: '2.5', left: '1' }), /per vial/);
  assert.match(app.tlSupplyProblem({ per: '20', left: '-1' }), /left/);
  assert.match(app.tlSupplyProblem({ per: '20', left: '21' }), /cannot be more/);
});

test('an edit is stored with the old fields in step, and a dose that changed is recorded', () => {
  const d = { entries: [], proto: null };
  app.tlStoreProtocol(d, protocol());
  const out = app.tlEditProtocol(d, env, local('2026-03-05 09:00').toISOString(), (q) => {
    q.compounds.find((c) => c.key === 'test').dose = app.tlParseDose('100 mg');
  });
  same(plain(out.changes.map((c) => [c.name, c.from, c.to])), [['Testosterone cyp', '80 mg', '100 mg']]);
  assert.equal(d.doseChanges.length, 1);
  assert.match(d.proto.meds, /Testosterone cyp, 100 mg, Twice weekly/);
  assert.equal(app.tlCompound(app.tlProtocol(d, env), 'test').dose.amount, 100);
  /* Adding or removing a compound is not a dose change. */
  app.tlEditProtocol(d, env, local('2026-03-05 10:00').toISOString(), (q) => { q.compounds = q.compounds.filter((c) => c.key !== 'ipa'); });
  assert.equal(d.doseChanges.length, 1);
  assert.doesNotMatch(d.proto.meds, /Ipamorelin/);
});

test('an edit to a protocol never stored first stores it, with a start and a name', () => {
  const d = { entries: [], proto: { name: '', start: null, weeks: null, meds: 'BPC-157, 250mcg, Daily', pct: '' } };
  app.tlEditProtocol(d, env, local('2026-03-05 09:00').toISOString(), (q) => { q.slots.am.t = 480; });
  assert.ok(d.protocol);
  assert.equal(d.protocol.slots.am.t, 480);
  assert.equal(d.protocol.start, '2026-03-05');
  assert.equal(d.protocol.name, 'My protocol');
});

test('a template becomes the protocol its lines describe, starting on the day given', () => {
  const t = { id: 't', name: 'Starter', duration: '12 weeks', pct: 'None',
    compounds: [{ name: 'Testosterone Cypionate', dose: '100mg', freq: 'Twice weekly (Mon/Thu)' }, { name: 'Anastrozole', dose: '0.25mg', freq: 'As needed, per labs' }] };
  const p = app.tlTemplateProtocol(t, '2026-03-05', env);
  same([p.name, p.start, p.weeks, p.pct, p.derived], ['Starter', '2026-03-05', 12, 'None', undefined]);
  same(p.compounds.map((c) => [c.name, c.dose.text, plain(c.rule)]), [
    ['Testosterone Cypionate', '100mg', { weekdays: [1, 4] }],
    ['Anastrozole', '0.25mg', { daily: true }]
  ]);
  assert.equal(app.tlTemplateProtocol(Object.assign({}, t, { duration: 'Ongoing' }), '2026-03-05', env).weeks, null);
});
