/* The words on the confirm sheet (src/logic/confirm.js).
 *
 * The sheet itself needs a browser and is exercised there (see
 * scripts/capture-backup-fixture.js, which loads the demo data through it).
 * What can be pinned here is what it says, which is the design's table for
 * screen 5d, word for word.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, local } = require('./helpers/app');

const app = loadApp({ files: ['src/logic/protocol.js', 'src/logic/confirm.js'] });
const NOW = local('2026-11-16T09:00').getTime();
const at = (text) => local(text).toISOString();
const copy = (kind, detail) => app.tlConfirmCopy(kind, detail, NOW);

test('an instant reads as today, yesterday, or a date', () => {
  assert.equal(app.tlWhen(at('2026-11-16T07:03'), NOW), 'today at 07:03');
  assert.equal(app.tlWhen(at('2026-11-15T22:31'), NOW), 'yesterday at 22:31');
  assert.equal(app.tlWhen(at('2026-11-07T07:03'), NOW), '7 Nov at 07:03');
  assert.equal(app.tlWhen(at('2025-12-31T23:59'), NOW), '31 Dec 2025 at 23:59');
  assert.equal(app.tlWhen('nonsense', NOW), '');
});

test('yesterday is the calendar day before, not the last 24 hours', () => {
  assert.equal(app.tlWhen(at('2026-11-15T23:50'), local('2026-11-16T00:10').getTime()), 'yesterday at 23:50');
  assert.equal(app.tlWhen(at('2026-11-16T00:05'), local('2026-11-16T23:55').getTime()), 'today at 00:05');
});

test('clearing the protocol is a warning, and says the log stays', () => {
  same(copy('protocol'), { kind: 'protocol', tone: 'warn', icon: 'ph-stack', title: 'Clear the active protocol?',
    body: 'Rounds and alerts stop until you set up a new one. Your log entries stay.',
    action: 'Clear protocol', exportFirst: false });
});

test('deleting an entry names the entry', () => {
  const c = copy('entry', { name: 'BPC-157', dose: '250 mcg', ts: at('2026-11-16T07:03') });
  same([c.tone, c.icon, c.title, c.action, c.exportFirst], ['danger', 'ph-trash', 'Delete this entry?', 'Delete entry', false]);
  assert.equal(c.body, 'BPC-157, 250 mcg, today at 07:03. It comes off your log, your charts and the supply count.');
  assert.equal(copy('entry', { name: 'BPC-157', dose: '', ts: null }).body, 'BPC-157. It comes off your log, your charts and the supply count.');
  assert.equal(copy('entry').body, 'It comes off your log, your charts and the supply count.');
});

test('deleting a reading names the reading, with or without a pulse', () => {
  const c = copy('reading', { sys: 128, dia: 82, hr: 64, ts: at('2026-11-16T07:12') });
  same([c.tone, c.title, c.action], ['danger', 'Delete this reading?', 'Delete reading']);
  assert.equal(c.body, '128/82, pulse 64, today at 07:12. Your averages and chart update.');
  assert.equal(copy('reading', { sys: 128, dia: 82, hr: null, ts: at('2026-11-07T07:12') }).body,
    '128/82, 7 Nov at 07:12. Your averages and chart update.');
});

test('deleting a check-in names it', () => {
  const c = copy('checkin', { label: 'Week 8 Check-in', date: '2026-11-16' });
  same([c.tone, c.title, c.action], ['danger', 'Delete this check-in?', 'Delete check-in']);
  assert.equal(c.body, 'Week 8 Check-in, 2026-11-16. It comes off your progress log.');
});

test('deleting everything is one question, not two, and offers a backup first', () => {
  same(copy('wipe'), { kind: 'wipe', tone: 'danger', icon: 'ph-trash', title: 'Delete all TherapyLog data?',
    body: 'Every entry, your profile and your protocol. Nothing is kept anywhere else, so this cannot be undone.',
    action: 'Delete everything', exportFirst: true });
});

test('loading demo data is a warning, and offers a backup first', () => {
  same(copy('demo'), { kind: 'demo', tone: 'warn', icon: 'ph-flask', title: 'Replace your log with demo data?',
    body: 'Sample entries take the place of everything in the app now. Export a backup first to keep your log.',
    action: 'Replace with demo data', exportFirst: true });
});

test('only the two questions that destroy everything offer the backup', () => {
  same(['protocol', 'entry', 'reading', 'checkin', 'wipe', 'demo'].map((k) => copy(k).exportFirst),
    [false, false, false, false, true, true]);
  assert.equal(copy('something else'), null);
});
