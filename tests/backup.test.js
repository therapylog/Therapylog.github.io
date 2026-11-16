/* Backup state, the CSV of the log, and the starting theme (src/logic/backup.js).
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, same, local, DAY_MS } = require('./helpers/app');

const app = loadApp({ files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/backup.js'] });
const NOW = local('2026-03-10T12:00').getTime();
const at = (text) => local(text).toISOString();

/* ---- backup state -------------------------------------------------------- */

test('a backup under a week old is fine, and a week old is stale', () => {
  const s = (days) => app.tlBackupState(NOW - days * DAY_MS, NOW, false, true);
  same([s(0).stale, s(6.9).stale, s(7).stale, s(30).stale], [false, false, true, true]);
  same([s(0).days, s(6.9).days, s(7).days], [0, 6, 7]);
  assert.equal(s(9).line, 'Last backup was 9 days ago. Weekly is the recommendation.');
  assert.equal(s(3).line, '');
});

test('never having backed up is stale once there is something to lose', () => {
  const none = app.tlBackupState(null, NOW, false, true);
  same([none.never, none.stale, none.days, none.lastAt], [true, true, null, null]);
  assert.equal(none.line, 'No backup yet. Weekly is the recommendation.');
  assert.equal(app.tlBackupState(null, NOW, false, false).stale, false);
  assert.equal(app.tlBackupState(0, NOW, false, true).never, true);
});

test('weekly is on when a backup file is linked', () => {
  assert.equal(app.tlBackupState(NOW, NOW, true, true).weekly, true);
  assert.equal(app.tlBackupState(NOW, NOW, false, true).weekly, false);
});

test('a clock set back does not give a negative age', () => {
  assert.equal(app.tlBackupState(NOW + DAY_MS, NOW, false, true).days, 0);
});

/* ---- CSV ----------------------------------------------------------------- */

test('cells are quoted only when they need to be, and quotes are doubled', () => {
  assert.equal(app.tlCsvCell('plain'), 'plain');
  assert.equal(app.tlCsvCell('a, b'), '"a, b"');
  assert.equal(app.tlCsvCell('say "hi"'), '"say ""hi"""');
  assert.equal(app.tlCsvCell('two\nlines'), '"two\nlines"');
  assert.equal(app.tlCsvCell(12.5), '12.5');
  assert.equal(app.tlCsvCell(null), '');
  assert.equal(app.tlCsvCell(undefined), '');
  assert.equal(app.tlCsvCell(NaN), '');
});

test('a note that looks like a formula is made inert, and a negative number is left alone', () => {
  assert.equal(app.tlCsvCell('=HYPERLINK("http://x","y")'), '"\'=HYPERLINK(""http://x"",""y"")"');
  assert.equal(app.tlCsvCell('+1 better'), "'+1 better");
  assert.equal(app.tlCsvCell('-felt off'), "'-felt off");
  assert.equal(app.tlCsvCell('@home'), "'@home");
  assert.equal(app.tlCsvCell(-3.6), '-3.6');
});

test('rows end with CRLF, the way spreadsheets expect', () => {
  assert.equal(app.tlCsv([['a', 'b'], [1, 'x,y']]), 'a,b\r\n1,"x,y"\r\n');
});

const record = {
  entries: [
    { type: 'bloodwork', ts: at('2026-03-09T18:00'), labDate: '2026-03-06', labs: { tott: 748, cm_zonulin: 42 },
      labMeta: { tott: { unit: 'ng/dL', method: 'LC/MS-MS' } }, notes: 'fasted' },
    { type: 'medication', ts: at('2026-03-05T07:03'), medication: 'BPC-157', dose: '250 mcg', site: 'Right abdomen', notes: '' },
    { type: 'bloodpressure', ts: at('2026-03-05T07:12'), sys: 128, dia: 82, hr: 64, device: 'Arm cuff', conditions: 'Resting AM', notes: '' },
    { type: 'weight', ts: at('2026-03-05T06:50'), weight: 195.2, energy: 8, sleep: 7.5, mood: { e: 'x', l: 'Great' }, notes: 'ok' },
    { type: 'symptom', ts: at('2026-03-04T15:00'), severity: 6, category: 'Energy', description: 'Afternoon crash', related: '' },
    { type: 'body', ts: at('2026-03-03T08:00'), measurements: { waist: 34, bf: 16.2 }, notes: '' },
    { type: 'weight', ts: at('2026-03-02T23:30'), weight: null, hrv: 60 }
  ],
  bodyComp: [{ ts: at('2026-03-05T08:00'), weight: 195.2, bf: 16.2, lean: 163.6, fat: 31.6 }],
  photos: [{ ts: at('2026-03-05T09:00'), date: '2026-03-05', week: 'Week 8', notice: 'leaner', conditions: '', notes: '' }],
  doseChanges: [{ ts: at('2026-03-04T09:00'), key: 'test', name: 'Testosterone cyp', from: '100 mg', to: '80 mg' }]
};

test('the log becomes one row per logged thing, oldest first, in local dates and times', () => {
  const rows = app.tlLogRows(record, (k) => ({ tott: 'Total testosterone' }[k] || k));
  same(rows[0], ['Date', 'Time', 'Type', 'Item', 'Value', 'Unit', 'Notes']);
  same(rows.slice(1), [
    ['2026-03-02', '23:30', 'Daily', 'Daily log', '', '', 'HRV 60 ms'],
    ['2026-03-03', '08:00', 'Measurement', 'waist', 34, 'in', ''],
    ['2026-03-03', '08:00', 'Measurement', 'bf', 16.2, '%', ''],
    ['2026-03-04', '09:00', 'Dose change', 'Testosterone cyp', '100 mg to 80 mg', '', ''],
    ['2026-03-04', '15:00', 'Symptom', 'Energy', 6, '/10', 'Afternoon crash'],
    ['2026-03-05', '06:50', 'Weight', 'Weight', 195.2, 'lb', 'energy 8/10; sleep 7.5 h; mood Great; ok'],
    ['2026-03-05', '07:03', 'Dose', 'BPC-157', '250 mcg', '', 'site Right abdomen'],
    ['2026-03-05', '07:12', 'Blood pressure', 'Systolic/diastolic', '128/82', 'mmHg', 'pulse 64; Arm cuff; Resting AM'],
    ['2026-03-05', '08:00', 'Body composition', 'Weight', 195.2, 'lb', ''],
    ['2026-03-05', '08:00', 'Body composition', 'Body fat', 16.2, '%', ''],
    ['2026-03-05', '08:00', 'Body composition', 'Lean mass (estimate)', 163.6, 'lb', ''],
    /* A check-in is filed under the date the user gave it. */
    ['2026-03-05', '', 'Check-in', 'Week 8', '', '', 'leaner'],
    /* A lab panel is filed under the day the blood was drawn, not the day it was typed in. */
    ['2026-03-06', '', 'Lab', 'Total testosterone', 748, 'ng/dL', 'LC/MS-MS; fasted'],
    ['2026-03-06', '', 'Lab', 'cm_zonulin', 42, '', 'fasted']
  ]);
});

test('an empty record is a header and nothing else', () => {
  assert.equal(app.tlLogCsv({ entries: [] }), 'Date,Time,Type,Item,Value,Unit,Notes\r\n');
  assert.equal(app.tlLogCsv(null), 'Date,Time,Type,Item,Value,Unit,Notes\r\n');
});

test('every entry in the demo patient\'s backup makes it into the spreadsheet', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'demo-backup.json'), 'utf8')).data;
  const rows = app.tlLogRows(data).slice(1);
  const count = (type) => rows.filter((r) => r[2] === type).length;
  assert.equal(count('Weight'), 9);
  assert.equal(count('Dose'), 14);
  assert.equal(count('Blood pressure'), 6);
  assert.equal(count('Symptom'), 4);
  assert.equal(count('Lab'), data.entries.filter((e) => e.type === 'bloodwork').reduce((n, e) => n + Object.keys(e.labs).length, 0));
  assert.equal(count('Body composition'), 12);
  assert.equal(count('Check-in'), 3);
  const csv = app.tlLogCsv(data);
  assert.equal(csv.split('\r\n').length - 1, rows.length + 1);
});

/* ---- theme --------------------------------------------------------------- */

test('the theme is the user\'s choice, and the device\'s preference until they make one', () => {
  assert.equal(app.tlThemeFrom('light', true), 'light');
  assert.equal(app.tlThemeFrom('dark', false), 'dark');
  assert.equal(app.tlThemeFrom(null, true), 'dark');
  assert.equal(app.tlThemeFrom(null, false), 'light');
  assert.equal(app.tlThemeFrom('purple', true), 'dark');
});
