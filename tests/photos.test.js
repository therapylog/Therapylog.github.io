/* Progress photos' pure logic (src/logic/photos.js): the week a photo falls
 * in, its caption, the first and latest of a pose, export file names, and
 * the zip writer, read back here the way an unzip tool reads it.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const { loadApp } = require('./helpers/app');

const app = loadApp({ files: ['src/logic/rounds.js', 'src/logic/photos.js'], functions: ['tlDay'], consts: ['tlLocalDate'] });

test('the week of the protocol a photo falls in', () => {
  assert.equal(app.tlPhotoWeek('2026-11-01T09:00:00', '2026-11-01'), 1);
  assert.equal(app.tlPhotoWeek('2026-11-07T23:00:00', '2026-11-01'), 1);
  assert.equal(app.tlPhotoWeek('2026-11-08T07:00:00', '2026-11-01'), 2);
  assert.equal(app.tlPhotoWeek('2026-12-20T07:00:00', '2026-11-01'), 8);
  assert.equal(app.tlPhotoWeek('2026-10-31T07:00:00', '2026-11-01'), null, 'before the start');
  assert.equal(app.tlPhotoWeek('2026-11-08T07:00:00', ''), null);
  assert.equal(app.tlPhotoWeek('2026-11-08T07:00:00', undefined), null);
});

test('a photo\'s caption: the week and the pose', () => {
  assert.equal(app.tlPhotoCaption({ ts: '2026-11-08T07:00:00', pose: 'side' }, '2026-11-01'), 'Week 2 · Side');
  assert.equal(app.tlPhotoCaption({ ts: '2026-11-08T07:00:00', pose: 'front' }, null), 'Front');
  assert.equal(app.tlPhotoCaption({ ts: '2026-11-08T07:00:00', pose: 'odd' }, null), 'Photo');
});

test('the first and the latest of a pose', () => {
  const photos = [
    { id: 'c', ts: '2026-11-20T07:00:00Z', pose: 'front' },
    { id: 'a', ts: '2026-11-01T07:00:00Z', pose: 'front' },
    { id: 'b', ts: '2026-11-10T07:00:00Z', pose: 'front' },
    { id: 's', ts: '2026-11-05T07:00:00Z', pose: 'side' }
  ];
  const p = app.tlPhotoPair(photos, 'front');
  assert.deepEqual([p.first.id, p.latest.id], ['a', 'c']);
  const one = app.tlPhotoPair(photos, 'side');
  assert.deepEqual([one.first.id, one.latest], ['s', null]);
  const none = app.tlPhotoPair(photos, 'back');
  assert.deepEqual([none.first, none.latest], [null, null]);
});

test('export file names say the day and the pose, and never collide', () => {
  const names = app.tlPhotoFileNames([
    { ts: '2026-11-16T09:00:00', pose: 'front' }, { ts: '2026-11-16T09:01:00', pose: 'front' },
    { ts: '2026-11-16T09:02:00', pose: 'side' }, { ts: '2026-11-16T09:03:00', pose: 'front' }
  ]);
  assert.deepEqual(Array.from(names), ['2026-11-16 front.jpg', '2026-11-16 front 2.jpg', '2026-11-16 side.jpg', '2026-11-16 front 3.jpg']);
});

test('CRC-32 matches the standard check values', () => {
  const bytes = (s) => new Uint8Array(Buffer.from(s, 'utf8'));
  assert.equal(app.tlCrc32(bytes('')), 0);
  assert.equal(app.tlCrc32(bytes('123456789')), 0xCBF43926);
  assert.equal(app.tlCrc32(bytes('The quick brown fox jumps over the lazy dog')), 0x414FA339);
  assert.equal(app.tlCrc32(bytes('hello')), zlib.crc32 ? zlib.crc32('hello') : 0x3610A686);
});

/* Read a zip the way an unzip tool does: from the end record, through the
   central directory, to each local header and its bytes. */
function unzip(buf) {
  const b = Buffer.from(buf);
  const end = b.lastIndexOf(Buffer.from([0x50, 0x4B, 0x05, 0x06]));
  assert.ok(end >= 0, 'an end record');
  const count = b.readUInt16LE(end + 10), size = b.readUInt32LE(end + 12), at = b.readUInt32LE(end + 16);
  assert.equal(at + size, end, 'the central directory ends where the end record starts');
  const out = [];
  let p = at;
  for (let i = 0; i < count; i++) {
    assert.equal(b.readUInt32LE(p), 0x02014B50);
    const flags = b.readUInt16LE(p + 8), method = b.readUInt16LE(p + 10), crc = b.readUInt32LE(p + 16);
    const csize = b.readUInt32LE(p + 20), usize = b.readUInt32LE(p + 24), nlen = b.readUInt16LE(p + 28);
    const elen = b.readUInt16LE(p + 30), clen = b.readUInt16LE(p + 32), local = b.readUInt32LE(p + 42);
    const name = b.slice(p + 46, p + 46 + nlen).toString('utf8');
    assert.equal(b.readUInt32LE(local), 0x04034B50, 'a local header where the directory says');
    const lnlen = b.readUInt16LE(local + 26), lelen = b.readUInt16LE(local + 28);
    const data = b.slice(local + 30 + lnlen + lelen, local + 30 + lnlen + lelen + csize);
    out.push({ name, flags, method, crc, csize, usize, data, date: b.readUInt16LE(p + 14), time: b.readUInt16LE(p + 12) });
    p += 46 + nlen + elen + clen;
  }
  return out;
}

test('the zip: every file stored whole, with its name, size, CRC and date', () => {
  const a = new Uint8Array([0xFF, 0xD8, 1, 2, 3, 0xFF, 0xD9]), b = new Uint8Array(70000).map((_, i) => i % 251);
  const zip = app.tlZip([
    { name: '2026-11-16 front.jpg', bytes: a, date: new Date(2026, 10, 16, 9, 30, 10) },
    { name: 'Woche 2 · Seite.jpg', bytes: b, date: new Date(2026, 10, 23, 18, 0, 0) }
  ]);
  const files = unzip(zip);
  assert.equal(files.length, 2);
  assert.equal(files[0].name, '2026-11-16 front.jpg');
  assert.equal(files[1].name, 'Woche 2 · Seite.jpg', 'a UTF-8 name survives');
  files.forEach((f) => { assert.equal(f.method, 0); assert.equal(f.flags & 0x0800, 0x0800); assert.equal(f.csize, f.usize); });
  assert.deepEqual(Array.from(files[0].data), Array.from(a));
  assert.ok(Buffer.from(files[1].data).equals(Buffer.from(b)));
  assert.equal(files[0].crc, app.tlCrc32(a));
  assert.equal(files[0].date, ((2026 - 1980) << 9) | (11 << 5) | 16);
  assert.equal(files[0].time, (9 << 11) | (30 << 5) | 5);
});

test('an empty zip is still a zip', () => {
  const files = unzip(app.tlZip([]));
  assert.equal(files.length, 0);
});
