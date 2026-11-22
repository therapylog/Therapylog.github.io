/* The record's new keys through import, and the old protocol form's save
 * (src/logic/record.js).
 *
 * importData() dropped every top-level key it did not know. These are the
 * rules for the keys the redesign adds.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, plain } = require('./helpers/app');

const app = loadApp({
  files: ['src/logic/protocol.js', 'src/logic/frequency.js', 'src/logic/changes.js', 'src/logic/record.js'],
  functions: ['parseMeds', 'parseFrequency', 'getDefaultTimes', 'tlFreqDays'],
  consts: ['tlLocalDate']
});
const env = { resolve: () => null, medium: () => null, discreet: false };
const model = (name) => ({ name: 'P', compounds: [{ key: 'x', name, dose: { amount: 1, unit: 'mg', text: '1mg' }, rule: { daily: true }, slots: ['am'] }], slots: {} });
const oldProto = (meds) => ({ name: 'P', start: '2026-03-02', weeks: 12, meds, pct: '', _created: '2026-03-02T12:00:00.000Z' });

test('an empty device takes the file\'s protocol model, and is then version 3', () => {
  const current = { entries: [], proto: oldProto('X, 1mg, Daily') };       /* importData just took proto */
  app.tlImportModel(current, { v: 3, protocol: model('X') }, true);
  assert.equal(current.protocol.compounds[0].name, 'X');
  assert.equal(current.v, 3);
  assert.equal(current.protocol.slots.am.t, 420);                          /* filled in, not trusted */
});

test('a device that already has a protocol keeps it, in either shape', () => {
  const stored = { entries: [], proto: oldProto('Mine, 1mg, Daily'), protocol: model('Mine'), v: 3 };
  app.tlImportModel(stored, { v: 3, protocol: model('Theirs') }, false);
  assert.equal(stored.protocol.compounds[0].name, 'Mine');
  /* An old-style protocol on the device, which importData kept: the file's
     model must not be laid over it. */
  const legacy = { entries: [], proto: oldProto('Mine, 1mg, Daily') };
  app.tlImportModel(legacy, { v: 3, protocol: model('Theirs') }, false);
  assert.equal(legacy.protocol, undefined);
  assert.equal(legacy.v, undefined);
});

test('a file with a model and no old-style protocol still restores onto an empty device', () => {
  const current = { entries: [], proto: null };
  app.tlImportModel(current, { v: 3, protocol: model('X') }, false);
  assert.equal(current.protocol.compounds.length, 1);
});

test('dose changes are merged by timestamp, newest first, without duplicates', () => {
  const current = { entries: [], doseChanges: [{ ts: '2026-03-05T09:00:00.000Z', name: 'A' }] };
  const out = app.tlImportModel(current, { doseChanges: [
    { ts: '2026-03-20T09:00:00.000Z', name: 'B' }, { ts: '2026-03-05T09:00:00.000Z', name: 'A' }, { name: 'no ts' }
  ] }, false);
  same(current.doseChanges.map((c) => c.name), ['B', 'A']);
  assert.equal(out.added, 1);
});

test('importing a file with no dose changes does not invent an empty list', () => {
  const current = { entries: [], proto: null };
  app.tlImportModel(current, { entries: [] }, false);
  same(Object.keys(current), ['entries', 'proto']);
});

test('settings fill gaps, and anything set on this device wins', () => {
  const current = { entries: [], settings: { figure: 'female' } };
  app.tlImportModel(current, { settings: { figure: 'male', units: 'metric' } }, false);
  same(current.settings, { figure: 'female', units: 'metric' });
  const none = { entries: [] };
  app.tlImportModel(none, { settings: ['not', 'an', 'object'] }, false);
  assert.equal(none.settings, undefined);
});

test('a file from a newer version of the app is flagged, and what is known is still taken', () => {
  const current = { entries: [], proto: null };
  const out = app.tlImportModel(current, { v: 4, protocol: model('X'), somethingNew: true }, false);
  assert.equal(out.newer, true);
  assert.equal(current.protocol.compounds.length, 1);
  assert.equal(app.tlImportModel({ entries: [] }, { v: 3 }, false).newer, false);
  assert.equal(app.tlImportModel({ entries: [] }, {}, false).newer, false);
});

test('a missing file or record is left alone', () => {
  same(plain(app.tlImportModel(null, {}, false)), { added: 0, newer: false });
  same(plain(app.tlImportModel({ entries: [] }, null, false)), { added: 0, newer: false });
});

test('settings read with a default and write into the record', () => {
  const d = { entries: [] };
  assert.equal(app.tlSetting(d, 'figure', 'male'), 'male');
  app.tlSetSetting(d, 'figure', 'female');
  assert.equal(app.tlSetting(d, 'figure', 'male'), 'female');
  same(d.settings, { figure: 'female' });
});

test('saving the old protocol form with a different dose records the change', () => {
  const d = { entries: [], proto: oldProto('Testosterone Cypionate, 100mg, Weekly\nBPC-157, 250mcg, Daily') };
  const before = app.tlProtocol(d, env);
  d.proto = oldProto('Testosterone Cypionate, 80mg, Weekly\nBPC-157, 250mcg, Daily');
  const rows = app.tlAfterLegacyProtocolSave(d, before, env, '2026-03-05T15:00:00.000Z');
  same(rows.map((r) => [r.name, r.from, r.to]), [['Testosterone Cypionate', '100 mg', '80 mg']]);
  assert.equal(d.doseChanges.length, 1);
});

test('saving the old form unchanged, or for the first time, records nothing', () => {
  const d = { entries: [], proto: oldProto('BPC-157, 250mcg, Daily') };
  same(app.tlAfterLegacyProtocolSave(d, app.tlProtocol(d, env), env, '2026-03-05T15:00:00.000Z'), []);
  assert.equal(d.doseChanges, undefined);
  const fresh = { entries: [], proto: null };
  const before = app.tlProtocol(fresh, env);
  fresh.proto = oldProto('BPC-157, 250mcg, Daily');
  same(app.tlAfterLegacyProtocolSave(fresh, before, env, '2026-03-05T15:00:00.000Z'), []);
});

test('saving the old form over a stored model reads the text just written into it', () => {
  const d = { entries: [], proto: oldProto('Old Name, 1mg, Daily'), protocol: model('Old Name'), v: 3 };
  const before = app.tlProtocol(d, env);
  d.proto = oldProto('New Name, 1mg, Daily');
  app.tlAfterLegacyProtocolSave(d, before, env, '2026-03-05T15:00:00.000Z');
  /* The model stays stored, so what the text cannot hold is not lost. */
  same(d.protocol.compounds.map((c) => c.name), ['New Name']);
  assert.equal(app.tlProtocol(d, env).compounds[0].name, 'New Name');
});
