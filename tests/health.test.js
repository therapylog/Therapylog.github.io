/* Health arithmetic (src/logic/health.js): blood pressure, weight, body.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, local, DAY_MS } = require('./helpers/app');

const app = loadApp({ files: ['src/logic/protocol.js', 'src/logic/frequency.js', 'src/logic/rounds.js', 'src/logic/health.js'], functions: ['getBPStage'] });
const NOW = local('2026-03-10T12:00').getTime();
const ago = (days) => new Date(NOW - days * DAY_MS).toISOString();
const bp = (sys, dia, days, hr) => ({ type: 'bloodpressure', ts: ago(days), sys, dia, hr: hr || null, stage: '' });
const wt = (weight, days) => ({ type: 'weight', ts: ago(days), weight });

/* ---- blood pressure ------------------------------------------------------ */

test('the five categories, with the design\'s labels and colours', () => {
  const s = (sys, dia) => { const x = app.tlBpStage(sys, dia); return [x.key, x.label, x.tone]; };
  same(s(119, 79), ['normal', 'Normal', 'accent']);
  same(s(120, 79), ['elevated', 'Elevated', 'warn']);
  same(s(130, 79), ['stage1', 'Stage 1 range', 'warn']);
  same(s(120, 80), ['stage1', 'Stage 1 range', 'warn']);
  same(s(140, 89), ['stage2', 'Stage 2 range', 'danger']);
  same(s(139, 90), ['stage2', 'Stage 2 range', 'danger']);
  same(s(180, 120), ['stage2', 'Stage 2 range', 'danger']);
  same(s(181, 85), ['crisis', 'Crisis range', 'danger']);
  same(s(150, 121), ['crisis', 'Crisis range', 'danger']);
  assert.equal(app.tlBpStage(0, 80), null);
  assert.equal(app.tlBpStage(120, NaN), null);
});

test('it agrees with getBPStage, the function readings have always been stored with, on every reading', () => {
  const old = { 'Normal': 'normal', 'Elevated': 'elevated', 'High — Stage 1': 'stage1',
                'High — Stage 2': 'stage2', 'Hypertensive Crisis': 'crisis' };
  for (let sys = 60; sys <= 250; sys++) {
    for (let dia = 30; dia <= 160; dia++) {
      const a = app.getBPStage(sys, dia), b = app.tlBpStage(sys, dia);
      if (old[a.stage] !== b.key) assert.fail(`${sys}/${dia}: getBPStage says ${a.stage}, tlBpStage says ${b.key}`);
    }
  }
});

test('a reading is accepted only when a person could have it', () => {
  const v = (s, d, p) => { const r = app.tlBpValidate(s, d, p); return r.ok ? 'ok' : r.error; };
  assert.equal(v('128', '82', ''), 'ok');
  assert.equal(v('128', '82', '64'), 'ok');
  assert.equal(v('60', '30', ''), 'ok');
  assert.equal(v('250', '160', ''), 'ok');
  assert.equal(v('', '82', ''), 'incomplete');
  assert.equal(v('128', '', ''), 'incomplete');
  assert.equal(v('59', '40', ''), 'systolic');
  assert.equal(v('251', '80', ''), 'systolic');
  assert.equal(v('120', '29', ''), 'diastolic');
  assert.equal(v('200', '161', ''), 'diastolic');
  assert.equal(v('80', '80', ''), 'order');
  assert.equal(v('80', '110', ''), 'order');
  assert.equal(v('128', '82', '10'), 'pulse');
  assert.equal(v('12x', '82', ''), 'systolic');
  assert.equal(v('128.5', '82', ''), 'systolic');
});

test('a valid reading comes back as numbers', () => {
  same(app.tlBpValidate(' 128 ', '82', '64'), { ok: true, sys: 128, dia: 82, pulse: 64, error: null });
  assert.equal(app.tlBpValidate('128', '82', '').pulse, null);
});

test('averages cover the last 7 and 14 days, rounded, and say how many readings went in', () => {
  const entries = [bp(120, 80, 1), bp(130, 84, 3), bp(125, 82, 6), bp(140, 90, 10), bp(150, 95, 20), wt(190, 1)];
  same(app.tlBpAverage(entries, 7, NOW), { sys: 125, dia: 82, n: 3 });
  same(app.tlBpAverage(entries, 14, NOW), { sys: 129, dia: 84, n: 4 });
  assert.equal(app.tlBpAverage([], 7, NOW), null);
  assert.equal(app.tlBpAverage([bp(150, 95, 20)], 14, NOW), null);
});

test('the chart gets one bar per local day, a mean for a day with two readings, and a gap for a day with none', () => {
  const entries = [bp(120, 80, 0), bp(130, 84, 0), bp(125, 81, 2)];
  const days = app.tlBpDaily(entries, 4, NOW);
  same(days.map((d) => d.day), ['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10']);
  same(days.map((d) => [d.sys, d.dia, d.n]), [[null, null, 0], [125, 81, 1], [null, null, 0], [125, 82, 2]]);
});

test('readings are returned oldest first, and rows without both numbers are left out', () => {
  const entries = [bp(120, 80, 1), bp(130, 84, 5), { type: 'bloodpressure', ts: ago(2), sys: 120, dia: null }];
  same(app.tlBpReadings(entries).map((e) => e.sys), [130, 120]);
});

/* ---- weight and body ----------------------------------------------------- */

test('the 30-day change is the latest weight minus the first in the window', () => {
  const entries = [wt(195.2, 0), wt(197.5, 14), wt(198.8, 29), wt(207.5, 60)];
  same(app.tlWeightChange(entries, 30, NOW), { latest: 195.2, change: -3.6, n: 3 });
});

test('one reading has not moved, and none has no latest', () => {
  same(app.tlWeightChange([wt(195.2, 0)], 30, NOW), { latest: 195.2, change: null, n: 1 });
  same(app.tlWeightChange([wt(207.5, 60)], 30, NOW), { latest: null, change: null, n: 0 });
});

test('Apple Health rows with no weight are left out of the series', () => {
  const entries = [wt(195.2, 0), { type: 'weight', ts: ago(1), weight: null, hrv: 60 }, wt(196, 2)];
  same(app.tlWeightSeries(entries, 30, NOW).map((p) => p.weight), [196, 195.2]);
});

test('a weight is accepted from 60 to 700 pounds', () => {
  same([59.9, 60, 185.5, 700, 700.1, NaN, '185'].map(app.tlWeightValid), [false, true, true, true, false, false, false]);
});

test('lean mass is weight times one minus body fat, as the body-composition tool has always saved it', () => {
  assert.equal(app.tlLeanMass(195.2, 16.2), 163.6);
  assert.equal(app.tlLeanMass(207.5, 22.4), 161);
  assert.equal(app.tlLeanMass(200, 0), 200);
  assert.equal(app.tlLeanMass(200, 100), null);
  assert.equal(app.tlLeanMass(0, 15), null);
  assert.equal(app.tlLeanMass(200, NaN), null);
});

test('pounds and kilograms, inches and centimetres convert both ways', () => {
  assert.ok(Math.abs(app.tlLbToKg(220.46226218) - 100) < 1e-6);
  assert.ok(Math.abs(app.tlKgToLb(100) - 220.46226218) < 1e-6);
  assert.equal(app.tlInToCm(10), 25.4);
  assert.equal(app.tlCmToIn(25.4), 10);
});

test('a typed height reads as inches in the forms people write it', () => {
  assert.equal(app.tlParseHeight('5\'11"'), 71);
  assert.equal(app.tlParseHeight('5 ft 11'), 71);
  assert.equal(app.tlParseHeight('6\''), 72);
  assert.equal(app.tlParseHeight('71 in'), 71);
  assert.equal(app.tlParseHeight('71'), 71);
  assert.equal(app.tlParseHeight('180 cm'), 70.9);
  assert.equal(app.tlParseHeight('180'), 70.9);
  assert.equal(app.tlParseHeight('1.80 m'), 70.9);
  for (const bad of ['', null, 'tall', '5', '300', '12 cm']) assert.equal(app.tlParseHeight(bad), null, String(bad));
});

test('a height typed with curly quotes or prime marks, as a phone keyboard writes it, still reads', () => {
  /* 5’11” is what iOS Smart Punctuation makes of 5'11"; 5′11″ uses the prime marks. */
  assert.equal(app.tlParseHeight('5’11”'), 71);
  assert.equal(app.tlParseHeight('5′11″'), 71);
  assert.equal(app.tlParseHeight('5’11"'), 71);
  assert.equal(app.tlParseHeight('5’ 11'), 71);
  assert.equal(app.tlParseHeight('6’'), 72);
  assert.equal(app.tlParseHeight('71”'), 71);
  assert.equal(app.tlFFMI(195.2, 16.2, app.tlParseHeight('5’11”')), 22.8);
});

test('FFMI is lean mass in kilograms over height in metres squared', () => {
  /* 195.2 lb at 16.2% is 163.6 lb lean, 74.2 kg; 71 in is 1.8034 m. */
  assert.equal(app.tlFFMI(195.2, 16.2, 71), 22.8);
  assert.equal(app.tlFFMI(195.2, 16.2, null), null);
  assert.equal(app.tlFFMI(195.2, NaN, 71), null);
});

/* ---- Body (6c) --------------------------------------------------------------- */

test('the newest body fat wins, from the tool or a measurement entry', () => {
  const d = {
    bodyComp: [{ ts: '2026-11-16T15:00:00.000Z', weight: 195.2, bf: 16.2 }, { ts: '2026-11-02T15:00:00.000Z', weight: 197.5, bf: 17.1 }],
    entries: [{ type: 'body', ts: '2026-11-10T15:00:00.000Z', measurements: { waist: 34, bf: 18 } }]
  };
  assert.deepEqual(JSON.parse(JSON.stringify(app.tlLatestBodyFat(d))), { ts: '2026-11-16T15:00:00.000Z', bf: 16.2 });
  d.entries.push({ type: 'body', ts: '2026-11-18T15:00:00.000Z', measurements: { bf: 15.9 } });
  assert.equal(app.tlLatestBodyFat(d).bf, 15.9);
  assert.equal(app.tlLatestBodyFat({ entries: [], bodyComp: [{ ts: 'x', bf: 16 }, { ts: '2026-11-01T00:00:00.000Z', bf: 0 }, { ts: '2026-11-02T00:00:00.000Z', bf: 120 }] }), null);
  assert.equal(app.tlLatestBodyFat(null), null);
});

test('the newest measurements, each with its change since it was last measured', () => {
  const entries = [
    { type: 'body', ts: '2026-10-20T15:00:00.000Z', measurements: { waist: 35, chest: 44, neck: 16 } },
    { type: 'body', ts: '2026-11-01T15:00:00.000Z', measurements: { waist: 34, bf: 17 } },
    { type: 'body', ts: '2026-11-09T15:00:00.000Z', measurements: { chest: 44.5, waist: 33.5, larm: 15.5 } },
    { type: 'body', ts: '2026-11-12T15:00:00.000Z', measurements: { bf: 16 } },
    { type: 'weight', ts: '2026-11-13T15:00:00.000Z', weight: 190 }
  ];
  const m = app.tlLatestMeasurements(entries);
  assert.equal(m.ts, '2026-11-09T15:00:00.000Z', 'an entry with only body fat is not a measurement');
  assert.deepEqual(JSON.parse(JSON.stringify(m.rows)), [
    { key: 'waist', label: 'Waist', value: 33.5, change: -0.5 },
    { key: 'chest', label: 'Chest', value: 44.5, change: 0.5 },
    { key: 'larm', label: 'Left arm', value: 15.5, change: null }
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(app.tlLatestMeasure(entries, 'neck'))), { ts: '2026-10-20T15:00:00.000Z', value: 16 });
  assert.equal(app.tlLatestMeasure(entries, 'hips'), null);
  assert.equal(app.tlLatestMeasurements([]), null);
});
