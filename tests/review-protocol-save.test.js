/* Review findings on saving and importing a protocol: the dose-change log's
 * pairing of old and new compounds (5, 9), the old protocol form's save over a
 * stored model (7, 20), the dose's unit in the log (3), and import (19, 21).
 *
 * Names resolve through the app's own pkResolve() and encyclopedia, lifted
 * from app.html, because the false changes came from real names resolving to
 * one id: "BPC-157" and "BPC-157 Oral" are both bpc, "Arimidex" and
 * "Anastrozole" both ai1.
 *
 * The tests for each finding were written against the code before its fix and
 * failed there. A few beside them pin what the fixes had to keep working.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, same, plain } = require('./helpers/app');
const A = require('../scripts/lib/app-source.js');

const data = A.loadAppData();
const LOGIC = ['src/logic/protocol.js', 'src/logic/changes.js', 'src/logic/record.js'];
const LEGACY = ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays'];
const RESOLVER = { functions: ['pkIndex', 'pkResolve'], consts: ['pkNorm', '_pkIndex'] };
const medium = (id) => (data.TL_PK[id] && data.TL_PK[id].medium) || data.TL_FORM[id] || null;

const app = loadApp({
  files: LOGIC,
  functions: LEGACY.concat(RESOLVER.functions),
  consts: ['tlLocalDate'].concat(RESOLVER.consts),
  stubs: { DB: data.DB }
});
const env = { resolve: app.pkResolve, medium, discreet: false };
const NOW = '2026-11-17T18:00:00.000Z';

const proto = (meds) => ({ name: 'P', start: '2026-03-02', weeks: 12, meds, pct: '', _created: '2026-03-02T12:00:00.000Z' });

/* The old form saves `to` over `from`, the way saveProtocol does: the model as
   it was, the new text, then tlAfterLegacyProtocolSave. */
function save(from, to, record) {
  const d = Object.assign({ entries: [], proto: proto(from) }, record ? JSON.parse(JSON.stringify(record)) : {});
  const before = app.tlProtocol(d, env);
  d.proto = Object.assign({}, d.proto, { meds: to, _created: NOW });
  const rows = app.tlAfterLegacyProtocolSave(d, before, env, NOW);
  return { d, rows: plain(rows).map((r) => r.name + ' ' + r.from + ' -> ' + r.to) };
}

/* ---- 5 and 9: which compound is which, across a save --------------------- */

test('names resolving to one encyclopedia id do so here, as the cases below need', () => {
  same(['BPC-157', 'BPC-157 Oral', 'BPC-157 oral', 'Arimidex', 'Anastrozole', 'Test Cyp', 'Testosterone Cypionate']
    .map((n) => app.pkResolve(n)), ['bpc', 'bpc', 'bpc', 'ai1', 'ai1', 'tc', 'tc']);
});

test('removing one of two lines that resolve to one compound records no dose change', () => {
  same(save('BPC-157, 250mcg, Daily\nBPC-157 Oral, 500mcg, Daily', 'BPC-157 Oral, 500mcg, Daily').rows, []);
  same(save('Anastrozole, 0.5mg, Twice weekly\nArimidex, 1mg, Weekly', 'Arimidex, 1mg, Weekly').rows, []);
});

test('swapping two lines records no dose change', () => {
  same(save('BPC-157, 250mcg, Daily\nBPC-157 Oral, 500mcg, Daily', 'BPC-157 Oral, 500mcg, Daily\nBPC-157, 250mcg, Daily').rows, []);
  same(save('Сустанон, 250mg, Weekly\nМельдоний, 500mg, Daily', 'Мельдоний, 500mg, Daily\nСустанон, 250mg, Weekly').rows, []);
  same(save('Сустанон, 250mg, Weekly\nМельдоний, 500mg, Daily', 'Мельдоний, 500mg, Daily').rows, []);
});

test('adding a line above or below an existing one for the same compound records no dose change', () => {
  same(save('Testosterone Cypionate, 100mg, Weekly (Mon)',
    'Testosterone Cypionate, 100mg, Weekly (Mon)\nTestosterone Cypionate, 50mg, Weekly (Thu)').rows, []);
  same(save('BPC-157 oral, 500mcg, Daily', 'BPC-157, 250mcg, Daily\nBPC-157 oral, 500mcg, Daily').rows, []);
  /* An alias of an existing compound, inserted above it. */
  same(save('Testosterone Cypionate, 100mg, Weekly', 'Test Cyp, 20mg, Daily\nTestosterone Cypionate, 100mg, Weekly').rows, []);
});

test('a dose split over two lines with one name: reordering or deleting a line records nothing', () => {
  const split = 'Testosterone Cypionate, 100mg, Weekly (Mon)\nTestosterone Cypionate, 50mg, Weekly (Thu)';
  same(save(split, 'Testosterone Cypionate, 50mg, Weekly (Thu)\nTestosterone Cypionate, 100mg, Weekly (Mon)').rows, []);
  same(save(split, 'Testosterone Cypionate, 50mg, Weekly (Thu)').rows, []);
  same(save('Testosterone Cypionate, 60mg, Weekly (Mon)\nTestosterone Cypionate, 40mg, Weekly (Thu)',
    'Testosterone Cypionate, 40mg, Weekly (Thu)\nTestosterone Cypionate, 60mg, Weekly (Mon)').rows, []);
});

test('a dose split over two lines with one name: changing one line records that line\'s change only', () => {
  const split = 'Testosterone Cypionate, 100mg, Weekly (Mon)\nTestosterone Cypionate, 50mg, Weekly (Thu)';
  same(save(split, 'Testosterone Cypionate, 50mg, Weekly (Thu)\nTestosterone Cypionate, 80mg, Weekly (Mon)').rows,
    ['Testosterone Cypionate 100 mg -> 80 mg']);
  same(save(split, 'Testosterone Cypionate, 80mg, Weekly (Mon)\nTestosterone Cypionate, 50mg, Weekly (Thu)').rows,
    ['Testosterone Cypionate 100 mg -> 80 mg']);
});

test('a real change is still recorded, and a line for another compound moving does not matter', () => {
  same(save('Testosterone Cypionate, 100mg, Weekly', 'Testosterone Cypionate, 80mg, Weekly').rows,
    ['Testosterone Cypionate 100 mg -> 80 mg']);
  same(save('Test Cyp, 100mg, Weekly\nBPC-157, 250mcg, Daily', 'BPC-157, 250mcg, Daily\nTest Cyp, 100mg, Weekly').rows, []);
  /* The frequency changed with the dose: still the one line for that name. */
  same(save('HCG, 250IU, Twice weekly', 'HCG, 500IU, Weekly').rows, ['HCG 250 IU -> 500 IU']);
});

test('between two stored models a compound renamed under the same key is the same compound', () => {
  const c = (key, name, dose) => ({ key, name, dose: app.tlParseDose(dose), rule: { daily: true }, slots: ['am'] });
  const before = { compounds: [c('tc', 'Test Cyp', '100mg'), c('bpc', 'BPC-157', '250mcg')] };
  const after = { compounds: [c('bpc', 'BPC-157', '250mcg'), c('tc', 'Testosterone Cypionate', '80mg')] };
  same(plain(app.tlDoseChangesBetween(before, after, NOW)).map((r) => [r.key, r.from, r.to]), [['tc', '100 mg', '80 mg']]);
  /* Read from the text, keys come from line positions and say nothing. */
  const derived = Object.assign({ derived: true }, after);
  same(plain(app.tlDoseChangesBetween(before, derived, NOW)), []);
});

/* ---- 3: the unit in the dose-change log ---------------------------------- */

test('a dose typed with a space before a unit per day is logged with its unit', () => {
  same(save('BPC-157, 250 mcg/day, Daily', 'BPC-157, 500 mcg/day, Daily').rows, ['BPC-157 250 mcg/day -> 500 mcg/day']);
  /* A thousandfold change of unit is a change. */
  same(save('BPC-157, 250 mcg/day, Daily', 'BPC-157, 250 mg/day, Daily').rows, ['BPC-157 250 mcg/day -> 250 mg/day']);
});

/* ---- 7 and 20: the old form saved over a stored model -------------------- */

const v3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'demo-backup-v3.json'), 'utf8')).data;

test('saving the old form unchanged over a stored model keeps its inventory, alert switches, discreet and rules', () => {
  const { d, rows } = save(v3.proto.meds, v3.proto.meds, v3);
  same(rows, []);
  assert.ok(d.protocol, 'the model is still stored');
  assert.equal(d.v, 3);
  const p = app.tlProtocol(d, env);
  same(p.compounds.map((c) => [c.key, plain(c.inv)]), v3.protocol.compounds.map((c) => [c.key, c.inv]));
  same(p.compounds.map((c) => plain(c.rule)), v3.protocol.compounds.map((c) => c.rule));
  same(plain(p.slots), v3.protocol.slots);
  assert.equal(p.discreet, true);
  /* The old fields keep exactly what the user typed. */
  assert.equal(d.proto.meds, v3.proto.meds);
  same(d.reminderTimes, v3.reminderTimes);
});

test('a dose changed in the old form over a stored model is logged once, and the compound keeps its inventory', () => {
  const to = v3.proto.meds.replace('BPC-157, 250mcg twice daily', 'BPC-157, 300mcg twice daily');
  const { d, rows } = save(v3.proto.meds, to, v3);
  same(rows, ['BPC-157 250 mcg -> 300 mcg']);
  const bpc = app.tlCompound(app.tlProtocol(d, env), 'bpc');
  assert.equal(bpc.dose.amount, 300);
  same(plain(bpc.inv), v3.protocol.compounds[1].inv);
  assert.equal(d.doseChanges.filter((r) => r.ts.startsWith('2026-11-17')).length, 1);
});

test('a rule the old text could not say survives an old-form save that left its line alone', () => {
  const d = { entries: [], proto: null };
  app.tlStoreProtocol(d, { name: 'P', start: '2026-03-02', slots: {}, compounds: [
    { key: 'tc', name: 'Testosterone Cypionate', drugId: 'tc', dose: app.tlParseDose('100mg'), rule: { every: { weeks: 2 } }, slots: ['am'],
      inv: { per: 10, left: 4, spare: 1, since: '2026-03-02T12:00:00.000Z' } },
    { key: 'bpc', name: 'BPC-157', drugId: 'bpc', dose: app.tlParseDose('250mcg'), rule: { every: { days: 3.5 } }, slots: ['am', 'bed'] }
  ] });
  /* The user edits the BPC-157 line's frequency and nothing else. */
  const lines = d.proto.meds.split('\n');
  const { d: after } = save(d.proto.meds, lines[0] + '\nBPC-157, 250mcg, Daily', d);
  const p = app.tlProtocol(after, env);
  same(plain(app.tlCompound(p, 'tc').rule), { every: { weeks: 2 } });
  same(plain(app.tlCompound(p, 'tc').slots), ['am']);
  same(plain(app.tlCompound(p, 'tc').inv), { per: 10, left: 4, spare: 1, since: '2026-03-02T12:00:00.000Z' });
  same(plain(app.tlCompound(p, 'bpc').rule), { daily: true });
});

test('a line added in the old form over a stored model never takes the key of a removed compound', () => {
  const stored = { entries: [], proto: proto('Anastrozole, 0.5mg, Twice weekly'), v: 3,
    protocol: { compounds: [{ key: 'ai1', name: 'Anastrozole', drugId: 'ai1', dose: app.tlParseDose('0.5mg'), rule: { weekdays: [1, 4] },
      freqText: 'Twice weekly', slots: ['am'] }], slots: {} } };
  /* Anastrozole is replaced by Arimidex, which the encyclopedia also calls ai1.
     Doses logged under the old line's key must not become the new line's. */
  const { d, rows } = save('Anastrozole, 0.5mg, Twice weekly', 'Arimidex, 1mg, Weekly', stored);
  same(rows, []);
  const keys = app.tlProtocol(d, env).compounds.map((c) => c.key);
  assert.equal(keys.length, 1);
  assert.notEqual(keys[0], 'ai1');
});

/* The app's own saveProtocol, over `record`, with the old form filled in. */
function form(record, meds, extra) {
  const o = extra || {};
  let ctx = null;
  ctx = loadApp({
    files: o.files || LOGIC,
    functions: LEGACY.concat(o.files ? [] : RESOLVER.functions, ['saveProtocol']),
    consts: ['tlLocalDate', 'nowStr'].concat(o.files ? [] : RESOLVER.consts),
    record: JSON.parse(JSON.stringify(record)), now: '2026-11-17T12:00', toast: true,
    document: { cn: { value: 'Renamed' }, cs: { value: record.proto.start }, cd: { value: String(record.proto.weeks) },
                cm: { value: meds }, cp: { value: record.proto.pct } },
    stubs: Object.assign({ DB: data.DB, renderCycle() {}, showCycleTab() {}, setTimeout() {}, scheduleAllReminders() {},
      tlEnv: () => ({ resolve: (n) => (ctx.pkResolve ? ctx.pkResolve(n) : null), medium, discreet: false }) }, o.stubs || {})
  });
  return ctx;
}

test('the old form saved over a stored model through the app\'s own saveProtocol keeps the model', () => {
  const ctx = form(v3, v3.proto.meds);
  ctx.saveProtocol();
  const r = ctx.harness.record();
  assert.ok(r.protocol);
  assert.equal(r.protocol.name, 'Renamed');
  assert.equal(r.protocol.discreet, true);
  assert.equal(r.protocol.slots.eve.alert, false);
  same(r.protocol.compounds.map((c) => c.inv), v3.protocol.compounds.map((c) => c.inv));
  assert.equal(r.proto.name, 'Renamed');
  assert.equal(r.proto.meds, v3.proto.meds);
});

test('if bringing the model up to date fails, the protocol the user typed is still saved and read from its text', () => {
  const ctx = form(v3, 'BPC-157, 300mcg, Daily', {
    files: ['src/logic/protocol.js'],
    stubs: { tlAfterLegacyProtocolSave() { throw new Error('bad model'); } }
  });
  ctx.saveProtocol();
  const r = ctx.harness.record();
  assert.equal(ctx.harness.saves, 1);
  assert.equal(r.proto.meds, 'BPC-157, 300mcg, Daily');
  /* The stored model no longer matches the text, so it goes. */
  assert.equal(r.protocol, undefined);
  same(ctx.harness.toasts, ['Protocol saved']);
});

test('with no stored model the old form still stores nothing', () => {
  const { d } = save('BPC-157, 250mcg, Daily', 'BPC-157, 300mcg, Daily');
  assert.equal(d.protocol, undefined);
  assert.equal(d.v, undefined);
  assert.equal(d.doseChanges.length, 1);
});

/* ---- 19 and 21: import --------------------------------------------------- */

class FakeReader { readAsText(file) { this.onload({ target: { result: file.text } }); } }
function importer(record, extra) {
  const o = extra || {};
  const ctx = loadApp({
    files: o.files || LOGIC,
    functions: LEGACY.concat(['importData']),
    consts: ['tlLocalDate'],
    record, now: '2026-11-17T12:00', toast: true,
    document: { 'import-result': {} },
    stubs: Object.assign({ FileReader: FakeReader, renderDash() {} }, o.stubs || {})
  });
  ctx.run = (file) => ctx.importData({ target: { files: [{ text: JSON.stringify(file) }] } });
  ctx.result = () => ctx.harness.el('import-result').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return ctx;
}
const legacyBackup = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'demo-backup.json'), 'utf8'));

test('an empty stored model with no protocol text is no protocol: a later import\'s text and model agree', () => {
  const ctx = importer({ entries: [], proto: null });
  ctx.run({ data: { entries: [], proto: null, protocol: { compounds: [], slots: {} }, v: 3 } });
  ctx.run(legacyBackup);
  const r = ctx.harness.record();
  assert.equal(r.proto.meds.split('\n').length, 6);
  assert.equal(ctx.tlProtocol(r, env).compounds.length, 6);
});

test('a file\'s model taken on import brings reminder times that agree with it', () => {
  const ctx = importer({ entries: [], proto: null, reminderTimes: { 'BPC-157': ['06:00'] } });
  ctx.run({ version: 2, data: v3 });
  const r = ctx.harness.record();
  same(r.reminderTimes['BPC-157'], ['08:00', '20:00']);
  same(r.reminderTimes, v3.reminderTimes);
});

test('a file with a model and no protocol text gives the old screens the text too', () => {
  const current = { entries: [], proto: null };
  app.tlImportModel(current, { v: 3, protocol: v3.protocol }, false);
  assert.equal(current.proto.name, v3.protocol.name);
  assert.equal(app.parseMeds(current.proto.meds).length, 6);
  same(current.reminderTimes['CJC-1295'], ['21:30']);
});

test('a backup whose protocol model is damaged still restores its entries and text', () => {
  for (const slots of [5, { am: true }]) {
    const ctx = importer({ entries: [], proto: null });
    ctx.run({ version: 2, data: { v: 4, entries: [{ type: 'weight', ts: '2026-11-10T10:00:00.000Z', weight: 190 }],
      proto: { name: 'P', start: '2026-11-01', weeks: 8, meds: 'X, 1mg, Daily', pct: '' },
      protocol: { compounds: [{ key: 'x', name: 'X', slots }], slots: {} } } });
    const r = ctx.harness.record();
    assert.equal(r.entries.length, 1, JSON.stringify(slots));
    assert.equal(r.proto.meds, 'X, 1mg, Daily');
    assert.match(ctx.result(), /Import successful/);
  }
});

test('if reading the protocol model fails on import, the entries are still saved and the result says so', () => {
  const ctx = importer({ entries: [], proto: null }, {
    files: ['src/logic/protocol.js'],
    stubs: { tlImportModel() { throw new Error('bad model'); } }
  });
  ctx.run({ version: 2, data: { entries: [{ type: 'weight', ts: '2026-11-10T10:00:00.000Z', weight: 190 }],
    proto: { name: 'P', start: '2026-11-01', weeks: 8, meds: 'X, 1mg, Daily', pct: '' }, protocol: { compounds: [] } } });
  const r = ctx.harness.record();
  assert.equal(r.entries.length, 1);
  assert.equal(r.proto.meds, 'X, 1mg, Daily');
  assert.match(ctx.result(), /Import successful/);
  assert.match(ctx.result(), /protocol schedule .*could not be read/i);
});

test('a model in a file that cannot be read is skipped and reported, and the rest of the import goes ahead', () => {
  const current = { entries: [], proto: proto('X, 1mg, Daily') };
  const out = app.tlImportModel(current, { protocol: { compounds: 'nope' }, doseChanges: [{ ts: NOW, name: 'X', from: '1 mg', to: '2 mg' }] }, true);
  assert.equal(out.skipped, true);
  assert.equal(out.added, 1);
  assert.equal(current.protocol, undefined);
});
