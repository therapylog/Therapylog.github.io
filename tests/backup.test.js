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
  /* The unit of a stored lab value comes from the caller, as the label does:
     in the app, from the marker registry (tlLabUnit in wire.js). */
  const rows = app.tlLogRows(record, (k) => ({ tott: 'Total testosterone' }[k] || k), (k) => ({ tott: 'ng/dL' }[k] || ''));
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
  /* Three check-ins, each with the weight and body fat recorded with it. */
  assert.equal(count('Check-in'), 9);
  const csv = app.tlLogCsv(data);
  assert.equal(csv.split('\r\n').length - 1, rows.length + 1);
});

test('a check-in\'s weight and body fat are rows of their own, filed under the check-in\'s date', () => {
  const rows = app.tlLogRows({ entries: [], photos: [
    { ts: at('2026-03-05T09:00'), date: '2026-03-04', week: 'Week 8 Check-in', weight: 195.2, bf: 16.2,
      notice: 'leaner', conditions: 'Morning fasted', mood: '4', protocol: 'Week 8 of 16', notes: 'on track' }
  ] }).slice(1);
  same(rows, [
    ['2026-03-04', '', 'Check-in', 'Week 8 Check-in', '', '', 'protocol Week 8 of 16; energy and mood 4/5; leaner; Morning fasted; on track'],
    ['2026-03-04', '', 'Check-in', 'Weight', 195.2, 'lb', ''],
    ['2026-03-04', '', 'Check-in', 'Body fat', 16.2, '%', '']
  ]);
});

test('a check-in saved without numbers has no number rows', () => {
  const rows = app.tlLogRows({ entries: [], photos: [
    { ts: at('2026-03-05T09:00'), date: '2026-03-05', week: 'Week 8', weight: null, bf: null, notice: 'leaner', mood: '' }
  ] }).slice(1);
  same(rows, [['2026-03-05', '', 'Check-in', 'Week 8', '', '', 'leaner']]);
});

/* ---- the spreadsheet as the app writes it (wire.js) ----------------------- */

/* A lab value is stored in the app's own unit for its marker: a scan converts
   it, and the form's field is in that unit. labMeta.unit is the unit the lab
   REPORTED, which for a converted value is a different unit. */
const labRecord = {
  entries: [
    /* Scanned. Vitamin D and testosterone came in nmol/L and were converted. Zonulin
       is the user's own marker, never converted, and this lab reported it in mg/L
       although the marker was defined in ng/mL. */
    { type: 'bloodwork', ts: at('2026-03-09T18:00'), labDate: '2026-03-06',
      labs: { vitd: 30, tott: 747, cm_zonulin: 42 },
      labMeta: {
        vitd: { source: 'scan', unit: 'nmol/L', converted: true, convertedFrom: '75 nmol/L' },
        tott: { source: 'scan', unit: 'nmol/L', converted: true, convertedFrom: '25.9 nmol/L', method: 'LC/MS-MS' },
        cm_zonulin: { source: 'scan', unit: 'mg/L' }
      }, notes: '' },
    /* Scanned in pmol/L, converted, then typed over: the number is the user's, in the field's unit. */
    { type: 'bloodwork', ts: at('2026-03-09T19:00'), labDate: '2026-03-08',
      labs: { e2: 31 }, labMeta: { e2: { source: 'scan', unit: 'pmol/L', editedAfterScan: true } }, notes: '' },
    /* Typed by hand: no labMeta at all. */
    { type: 'bloodwork', ts: at('2026-03-10T09:00'), labDate: '2026-03-10', labs: { tott: 700, cm_zonulin: 40, cm_gone: 5 }, notes: '' }
  ],
  customMarkers: { cm_zonulin: { name: 'Zonulin', unit: 'ng/mL', lo: 0, hi: 40 } }
};

function wiredApp() {
  const out = { blobs: [], links: [] };
  out.app = loadApp({
    files: ['src/logic/protocol.js', 'src/logic/rounds.js', 'src/logic/backup.js', 'src/logic/wire.js'],
    consts: ['MARKER_REGISTRY', 'LAB_FIELDS', 'tlTodayStr'],
    functions: ['getAllCustomMarkers'],
    record: labRecord,
    now: '2026-03-10T12:00',
    stubs: {
      Blob: function (parts, opts) { out.blobs.push({ text: parts.join(''), type: opts.type }); },
      URL: { createObjectURL: () => 'blob:csv', revokeObjectURL() {} },
      setTimeout: () => 0,
      document: {
        createElement: () => { const a = { click() {} }; out.links.push(a); return a; },
        body: { appendChild() {}, removeChild() {} }
      }
    }
  });
  return out;
}

test('a converted lab value is written with the unit it is stored in, and the lab\'s own figure in Notes', () => {
  const { app: w } = wiredApp();
  const labs = w.tlLogRows(w.gd(), w.tlMarkerLabel, w.tlLabUnit).slice(1).filter((r) => r[2] === 'Lab');
  same(labs, [
    ['2026-03-06', '', 'Lab', 'Vitamin D 25-OH', 30, 'ng/mL', 'converted from 75 nmol/L'],
    ['2026-03-06', '', 'Lab', 'Total Testosterone', 747, 'ng/dL', 'converted from 25.9 nmol/L; LC/MS-MS'],
    /* A user-defined marker's value is as the lab reported it, so the lab's unit is its unit. */
    ['2026-03-06', '', 'Lab', 'Zonulin', 42, 'mg/L', ''],
    /* Typed over after the scan: the field's unit, and not "converted". */
    ['2026-03-08', '', 'Lab', 'Estradiol E2', 31, 'pg/mL', ''],
    /* Typed by hand: the field's unit, and the user's marker's own unit. */
    ['2026-03-10', '', 'Lab', 'Total Testosterone', 700, 'ng/dL', ''],
    ['2026-03-10', '', 'Lab', 'Zonulin', 40, 'ng/mL', ''],
    /* A key that is no marker any more: no unit rather than a guessed one. */
    ['2026-03-10', '', 'Lab', 'cm_gone', 5, '', '']
  ]);
});

test('the spreadsheet download carries the stored units, behind a byte-order mark', () => {
  const w = wiredApp();
  const csv = w.app.tlExportCsv();
  assert.ok(csv.includes('\r\n2026-03-06,,Lab,Vitamin D 25-OH,30,ng/mL,converted from 75 nmol/L\r\n'), csv);
  assert.ok(csv.includes('\r\n2026-03-10,,Lab,Total Testosterone,700,ng/dL,\r\n'), csv);
  assert.ok(!/,30,nmol\/L,/.test(csv), 'a converted value is labelled with the lab\'s unit');
  same(w.blobs, [{ text: '﻿' + csv, type: 'text/csv;charset=utf-8' }]);
  assert.equal(w.links[0].download, 'therapylog-log-2026-03-10.csv');
});

test('without a unit lookup a lab value has no unit, rather than the unit the lab reported', () => {
  const rows = app.tlLogRows(labRecord).slice(1);
  same(rows.slice(0, 2).map((r) => [r[3], r[4], r[5], r[6]]), [['vitd', 30, '', 'converted from 75 nmol/L'], ['tott', 747, '', 'converted from 25.9 nmol/L; LC/MS-MS']]);
});

/* ---- theme --------------------------------------------------------------- */

test('the theme is the user\'s choice, and the device\'s preference until they make one', () => {
  assert.equal(app.tlThemeFrom('light', true), 'light');
  assert.equal(app.tlThemeFrom('dark', false), 'dark');
  assert.equal(app.tlThemeFrom(null, true), 'dark');
  assert.equal(app.tlThemeFrom(null, false), 'light');
  assert.equal(app.tlThemeFrom('purple', true), 'dark');
});
