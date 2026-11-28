/* Progress photos: what is pure about them.
 *
 * The images themselves live on the device, in their own IndexedDB database
 * (src/ui/photos.js), never in the record and never in the backup file: a
 * year of photos would make the backup too large to email or keep, and the
 * decision on record (docs/ROADMAP.md) is that they stay on the phone, with
 * their own export. That export is a zip of the JPEGs, written here without
 * a library: stored, not compressed again, since a JPEG is already
 * compressed.
 */

var TL_POSES = [
  { value: 'front', label: 'Front' },
  { value: 'side', label: 'Side' },
  { value: 'back', label: 'Back' }
];

function tlPoseLabel(pose) {
  for (var i = 0; i < TL_POSES.length; i++) if (TL_POSES[i].value === pose) return TL_POSES[i].label;
  return 'Photo';
}

/* Which week of the protocol a photo falls in: week 1 is its first seven
   days. Null without a start date, or for a photo from before it. */
function tlPhotoWeek(ts, start) {
  if (!start) return null;
  var a = tlDay(tlDayKey(ts)).getTime(), b = tlDay(start).getTime();
  if (!isFinite(a) || !isFinite(b) || a < b) return null;
  return Math.floor(Math.round((a - b) / 864e5) / 7) + 1;
}

/* "Week 3 · Front", or just "Front". */
function tlPhotoCaption(photo, start) {
  var w = tlPhotoWeek(photo.ts, start);
  return (w ? 'Week ' + w + ' · ' : '') + tlPoseLabel(photo.pose);
}

/* The first and the latest photo of a pose, oldest first by when taken.
   { first, latest } with latest null when there is only one. */
function tlPhotoPair(photos, pose) {
  var list = (photos || []).filter(function (p) { return p && p.pose === pose; })
    .slice().sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
  if (!list.length) return { first: null, latest: null };
  return { first: list[0], latest: list.length > 1 ? list[list.length - 1] : null };
}

/* File names for the export: "2026-11-16 front.jpg", with " 2", " 3" for a
   second and third of the same pose on the same day. In the order given. */
function tlPhotoFileNames(photos) {
  var seen = {};
  return (photos || []).map(function (p) {
    var base = tlDayKey(p.ts) + ' ' + (p.pose || 'photo');
    seen[base] = (seen[base] || 0) + 1;
    return base + (seen[base] > 1 ? ' ' + seen[base] : '') + '.jpg';
  });
}

/* ---- the zip ------------------------------------------------------------ */

var TL_CRC_TABLE = null;

function tlCrc32(bytes) {
  if (!TL_CRC_TABLE) {
    TL_CRC_TABLE = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      TL_CRC_TABLE[n] = c >>> 0;
    }
  }
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < bytes.length; i++) crc = TL_CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/* A stored (method 0) zip of files [{ name, bytes: Uint8Array, date: Date }].
   Names are written as UTF-8 with the flag that says so. Returns a
   Uint8Array. */
function tlZip(files) {
  var enc = function (s) {
    var out = [], str = unescape(encodeURIComponent(s));
    for (var i = 0; i < str.length; i++) out.push(str.charCodeAt(i));
    return out;
  };
  var dos = function (date) {
    var d = date instanceof Date && isFinite(date) ? date : new Date(1980, 0, 1);
    var y = Math.max(1980, d.getFullYear());
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
      date: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
  };
  var parts = [], central = [], offset = 0;
  var u16 = function (a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF); };
  var u32 = function (a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF); };
  (files || []).forEach(function (f) {
    var name = enc(f.name), bytes = f.bytes, crc = tlCrc32(bytes), t = dos(f.date);
    var head = [];
    u32(head, 0x04034B50); u16(head, 20); u16(head, 0x0800); u16(head, 0);
    u16(head, t.time); u16(head, t.date); u32(head, crc); u32(head, bytes.length); u32(head, bytes.length);
    u16(head, name.length); u16(head, 0);
    head = head.concat(name);
    parts.push(new Uint8Array(head), bytes);
    var c = [];
    u32(c, 0x02014B50); u16(c, 20); u16(c, 20); u16(c, 0x0800); u16(c, 0);
    u16(c, t.time); u16(c, t.date); u32(c, crc); u32(c, bytes.length); u32(c, bytes.length);
    u16(c, name.length); u16(c, 0); u16(c, 0); u16(c, 0); u16(c, 0); u32(c, 0); u32(c, offset);
    central = central.concat(c, name);
    offset += head.length + bytes.length;
  });
  var end = [];
  u32(end, 0x06054B50); u16(end, 0); u16(end, 0); u16(end, (files || []).length); u16(end, (files || []).length);
  u32(end, central.length); u32(end, offset); u16(end, 0);
  parts.push(new Uint8Array(central), new Uint8Array(end));
  var total = parts.reduce(function (n, p) { return n + p.length; }, 0), out = new Uint8Array(total), at = 0;
  parts.forEach(function (p) { out.set(p, at); at += p.length; });
  return out;
}
