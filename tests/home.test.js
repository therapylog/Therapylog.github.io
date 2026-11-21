/* Home's logic: estimated levels (src/logic/levels.js) and the layout and
 * lab panel (src/logic/home.js).
 *
 * Levels run on the app's own pkParseDose and pkCurve, lifted from app.html,
 * so these pin the redesign's Levels view to the same model as the old
 * Levels chart. The lab panel runs on stand-ins for labRangeFor and labSt
 * that behave as the bloodwork screen's do.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain, local } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/record.js', 'src/logic/levels.js', 'src/logic/home.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays', 'pkParseDose', 'pkCurve',
    'tlDay', 'tlDaysBetween', 'tlNormalizeRule', 'tlWeekdaysFor', 'tlRuleWindow', 'tlDoseOn', 'tlDueOn'],
  consts: ['tlLocalDate', 'TL_DAY_MS']
});

const H = 36e5, D = 24 * H;
const HL = { 'Testosterone Cypionate': { hl: 192, tmax: 48 }, 'BPC-157': { hl: 4, tmax: 0.5 } };
const pk = { parse: app.pkParseDose, params: (n) => HL[n] || {}, curve: app.pkCurve };
const NOW = local('2026-11-17 09:00').getTime();
const med = (name, dose, msAgo) => ({ type: 'medication', medication: name, dose, ts: new Date(NOW - msAgo).toISOString() });

/* ---- levels ------------------------------------------------------------------ */

test('a compound with doses and a half-life gets a series, scaled to its own peak', () => {
  const entries = [];
  for (let i = 0; i < 8; i++) entries.push(med('Testosterone Cypionate', '100mg', i * 3.5 * D + 2 * H));
  const s = app.tlLevelSeries(entries, NOW, pk);
  assert.equal(s.length, 1);
  assert.equal(s[0].name, 'Testosterone Cypionate');
  assert.equal(s[0].unit, 'mg');
  assert.ok(s[0].pct > 0 && s[0].pct <= 100, String(s[0].pct));
  const max = Math.max(...s[0].points.map((p) => p[1]));
  assert.ok(Math.abs(max - 100) < 1e-9, 'the peak of the window is 100%');
  assert.equal(s[0].from, NOW - 28 * D);
  assert.equal(s[0].to, NOW + 7 * D);
  /* Sorted, and "now" is one of the points, exactly. */
  for (let i = 1; i < s[0].points.length; i++) assert.ok(s[0].points[i][0] >= s[0].points[i - 1][0]);
  assert.ok(s[0].points.some((p) => p[0] === NOW));
});

test('the level now matches what the old chart computes for the same doses', () => {
  const entries = [med('Testosterone Cypionate', '200mg', 1 * D), med('Testosterone Cypionate', '200mg', 8 * D)];
  const s = app.tlLevelSeries(entries, NOW, pk)[0];
  const curve = app.pkCurve(192, 48);
  const raw = (t) => entries.reduce((a, e) => a + 200 * curve((t - new Date(e.ts).getTime()) / H), 0);
  const max = Math.max(...s.points.map((p) => raw(p[0])));
  assert.equal(s.pct, Math.round(raw(NOW) / max * 100));
});

test('doses in mL, doses with no half-life and doses older than 90 days are left out; units are never added together', () => {
  const entries = [
    med('Testosterone Cypionate', '0.5ml', 1 * D),
    med('Mystery peptide', '100mcg', 1 * D),
    med('BPC-157', '250mcg', 100 * D),
    med('BPC-157', '250mcg', 1 * H),
    med('BPC-157', '5 IU', 2 * H)
  ];
  const s = app.tlLevelSeries(entries, NOW, pk);
  same(s.map((x) => [x.label, x.unit]), [['BPC-157 (mg)', 'mg'], ['BPC-157 (IU)', 'IU']]);
});

test('series are ordered by the most recent dose', () => {
  const entries = [med('Testosterone Cypionate', '100mg', 3 * D), med('BPC-157', '250mcg', 2 * H)];
  same(app.tlLevelSeries(entries, NOW, pk).map((x) => x.name), ['BPC-157', 'Testosterone Cypionate']);
});

test('half-life reads in days, hours or minutes', () => {
  assert.equal(app.tlHalfLifeText(192), '8 d');
  assert.equal(app.tlHalfLifeText(108), '4.5 d');
  assert.equal(app.tlHalfLifeText(4), '4 h');
  assert.equal(app.tlHalfLifeText(0.5), '30 min');
  assert.equal(app.tlHalfLifeText(null), '');
});

test('the chart: the line and area up to now, the projection after, inside the box', () => {
  const entries = [med('Testosterone Cypionate', '100mg', 2 * D)];
  const s = app.tlLevelSeries(entries, NOW, pk)[0];
  const c = app.tlLevelChart(s, 340, 140);
  assert.ok(c.line.startsWith('M'));
  assert.ok(c.area.endsWith('Z'));
  assert.ok(c.proj.startsWith('M'));
  assert.equal(c.nowX, Math.round((NOW - s.from) / (s.to - s.from) * 340 * 10) / 10);
  const nums = (d) => d.replace(/[MLZ]/g, ' ').trim().split(/\s+/).map(Number);
  for (const d of [c.line, c.area, c.proj]) {
    const n = nums(d);
    for (let i = 0; i < n.length; i += 2) {
      assert.ok(n[i] >= -0.05 && n[i] <= 340.05, 'x in the box: ' + n[i]);
      assert.ok(n[i + 1] >= c.top - 0.05 && n[i + 1] <= c.base + 0.05, 'y in the box: ' + n[i + 1]);
    }
  }
});

/* ---- layout -------------------------------------------------------------------- */

test('with nothing stored, every view and section shows, in the design\'s order', () => {
  const l = app.tlHomeLayout({});
  same(l.hero.map((x) => [x.key, x.on]), [['levels', true], ['system', true], ['supply', true], ['labs', true]]);
  same(l.sections.map((x) => [x.key, x.on]), [['doses', true], ['inventory', true], ['flags', true]]);
});

test('a stored layout keeps its order and switches; unknown keys go, missing ones join at the end, on', () => {
  const d = { settings: { home: { hero: [{ key: 'labs', on: false }, { key: 'nope', on: true }, { key: 'levels', on: true }, { key: 'labs', on: true }],
    sections: [{ key: 'flags', on: false }] } } };
  const l = app.tlHomeLayout(d);
  same(l.hero.map((x) => [x.key, x.on]), [['labs', false], ['levels', true], ['system', true], ['supply', true]]);
  same(l.sections.map((x) => [x.key, x.on]), [['flags', false], ['doses', true], ['inventory', true]]);
});

test('storing a layout keeps keys and switches only', () => {
  const d = {};
  const l = app.tlHomeLayout(d);
  l.hero[1].on = false;
  app.tlHomeMove(l.hero, 'labs', -1);
  app.tlSetHomeLayout(d, l);
  same(plain(d.settings.home.hero), [{ key: 'levels', on: true }, { key: 'system', on: false }, { key: 'labs', on: true }, { key: 'supply', on: true }]);
  same(app.tlHomeLayout(d).hero.map((x) => x.key), ['levels', 'system', 'labs', 'supply']);
});

test('moving past either end changes nothing', () => {
  const l = app.tlHomeLayout({}).sections;
  app.tlHomeMove(l, 'doses', -1);
  app.tlHomeMove(l, 'flags', 1);
  app.tlHomeMove(l, 'nope', 1);
  same(l.map((x) => x.key), ['doses', 'inventory', 'flags']);
});

/* ---- the latest lab panel ------------------------------------------------------- */

const RANGES = { tott: { lo: 264, hi: 916 }, lh: { lo: 1.7, hi: 8.6 }, fsh: { lo: 1.5, hi: 12.4 }, hct: { lo: 38.3, hi: 48.6 }, cm_x: {} };
const labs = {
  range: (k, e) => (e.labMeta && e.labMeta[k] && e.labMeta[k].refLo !== undefined ? { lo: e.labMeta[k].refLo, hi: e.labMeta[k].refHi } : RANGES[k] || null),
  status: (k, v, e) => {
    const r = labs.range(k, e);
    if (!r || (r.lo === undefined && r.hi === undefined)) return 'neutral';
    return v < r.lo || v > r.hi ? 'bad' : 'good';
  },
  label: (k) => ({ tott: 'Total Testosterone', lh: 'LH Luteinizing Hormone', fsh: 'FSH Follicle Stimulating', hct: 'Hematocrit', cm_x: 'My marker' }[k] || k),
  unit: (k) => ({ tott: 'ng/dL', lh: 'mIU/mL', fsh: 'mIU/mL', hct: '%' }[k] || '')
};
const panel = (labDate, ts, values, extra) => Object.assign({ type: 'bloodwork', labDate, ts, labs: values }, extra);

test('the latest panel is the newest by lab date, not by when it was typed in', () => {
  const entries = [
    panel('2026-10-01', '2026-11-15T10:00:00.000Z', { tott: 500 }),
    panel('2026-11-11', '2026-11-12T10:00:00.000Z', { tott: 748, lh: 0.3, fsh: 0.4, hct: 46.2 }),
    panel('', '2026-09-01T10:00:00.000Z', { tott: 900 }),
    { type: 'bloodwork', ts: '2026-11-16T10:00:00.000Z', labDate: '2026-11-16', labs: { tott: null } }
  ];
  const p = app.tlLatestPanel(entries, labs);
  assert.equal(p.date, '2026-11-11');
  same(p.rows.map((r) => [r.key, r.name, r.value, r.unit, r.status, r.dir]), [
    ['tott', 'Total T', 748, 'ng/dL', 'good', null],
    ['lh', 'LH', 0.3, 'mIU/mL', 'bad', 'below'],
    ['fsh', 'FSH', 0.4, 'mIU/mL', 'bad', 'below'],
    ['hct', 'Hematocrit', 46.2, '%', 'good', null]
  ]);
  same(p.out.map((r) => r.key), ['lh', 'fsh']);
});

test('a range from the lab report itself is the one used', () => {
  const p = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { tott: 950 }, { labMeta: { tott: { refLo: 300, refHi: 1000 } } })], labs);
  same([p.rows[0].lo, p.rows[0].hi, p.rows[0].status], [300, 1000, 'good']);
});

test('no panel with a number in it is no panel', () => {
  assert.equal(app.tlLatestPanel([], labs), null);
  assert.equal(app.tlLatestPanel([{ type: 'bloodwork', ts: '2026-11-12T10:00:00.000Z', labs: {} }], labs), null);
});

test('the Labs view lists the out-of-range markers first', () => {
  const p = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { tott: 748, hct: 46.2, lh: 0.3, fsh: 0.4, cm_x: 3 })], labs);
  same(app.tlPanelRows(p, 4).map((r) => r.key), ['lh', 'fsh', 'tott', 'hct']);
  same(app.tlPanelRows(null, 4), []);
});

test('the lab flags row names what is out of range and which way', () => {
  const p = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { tott: 748, lh: 0.3, fsh: 0.4 })], labs);
  same(plain(app.tlFlagsText(p)), { title: '2 markers out of range', sub: 'LH and FSH below reference' });
  const mixed = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { lh: 0.3, hct: 52, tott: 1200 })], labs);
  same(plain(app.tlFlagsText(mixed)), { title: '3 markers out of range', sub: 'LH below, Hematocrit and Total T above reference' });
  const one = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { hct: 52 })], labs);
  assert.equal(app.tlFlagsText(one).title, '1 marker out of range');
  const fine = app.tlLatestPanel([panel('2026-11-11', '2026-11-12T10:00:00.000Z', { hct: 45 })], labs);
  assert.equal(app.tlFlagsText(fine), null);
});

test('the range bar puts the range in the middle half and keeps the value on the bar', () => {
  same(plain(app.tlRangeBar({ lo: 10, hi: 20, value: 15 })), { from: 0.25, to: 0.75, at: 0.5 });
  assert.equal(app.tlRangeBar({ lo: 10, hi: 20, value: 10 }).at, 0.25);
  assert.equal(app.tlRangeBar({ lo: 10, hi: 20, value: -500 }).at, 0.02);
  assert.equal(app.tlRangeBar({ lo: 10, hi: 20, value: 500 }).at, 0.98);
  assert.equal(app.tlRangeBar({ lo: null, hi: null, value: 5 }), null);
});
