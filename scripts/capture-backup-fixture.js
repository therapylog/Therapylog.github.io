#!/usr/bin/env node
/* Does a backup survive the redesign?
 *
 * The redesign migrates the data model, and what it migrates is people's
 * health records. This script keeps the one file that question is asked of:
 * the app's own export of its own demo patient. Phase 1 is done when this file
 * still imports and exports unchanged.
 *
 *   node scripts/capture-backup-fixture.js              capture, and write
 *                                                       tests/fixtures/demo-backup.json
 *   node scripts/capture-backup-fixture.js --check      capture again and compare the bytes
 *                                                       with the committed file, then run
 *                                                       the round trip. Exits 1 on any
 *                                                       difference.
 *   node scripts/capture-backup-fixture.js --roundtrip  the round trip alone
 *   ... --file FILE                                     work on FILE instead of the
 *                                                       committed fixture
 *
 * What it proves:
 *
 *   capture      loadDemoData() and exportData() are the app's own functions,
 *                run in the page it ships in, and the file written is the
 *                download itself, byte for byte. Nothing here re-serialises it.
 *                Run twice, it produces the same bytes; --check holds the
 *                committed file to that.
 *   round trip   two restores, each in a browser context with nothing stored,
 *                each through the real file input (#import-file, whose
 *                onchange is importData) and then the real export. Files are
 *                compared as parsed JSON: object key order is not a
 *                difference, array order is. Only the fields in EXCLUDED are
 *                left out, each by name and with its reason printed.
 *                  first: the fixture. The demo record never went through
 *                    sd(), so its entries are grouped by type; import sorts
 *                    them newest-first. That one reorder is allowed, by name.
 *                    Anything else that differs fails.
 *                  second: the first restore's own export. It must come back
 *                    the same in every field and in every array's order.
 *
 * What is pinned, and why:
 *
 *   the clock    loadDemoData builds every date relative to new Date(), and
 *                exportedAt is the moment of export. Date is frozen with
 *                Playwright's clock; timers keep running.
 *   time zone    America/Chicago. The demo dates are stepped back in local
 *                days and written as UTC, so they depend on the zone, and this
 *                one puts a daylight-saving change inside the sixty days the
 *                demo covers.
 *   locale       en-US, so nothing can follow the machine's.
 *   the network  every request that is not to this script's own server is
 *                aborted, and service workers are blocked so none can make a
 *                request the route does not see.
 *   reminders    checkAndFireReminder writes remindersFired into the record
 *                once notifications are granted. They never are here, and the
 *                run fails if they are.
 *
 * Neither loadDemoData nor exportData calls Math.random or crypto, so there is
 * no randomness to pin. If that changes, two captures stop matching and
 * --check says so, which is the right way to find out.
 *
 * The round trip runs at a later instant than the capture, late enough in the
 * evening that the local day and the UTC day are different dates: a restore
 * always happens after the backup, and nothing in the record may move when it
 * does.
 *
 * Needs Playwright and a Chromium, neither of which the repo installs:
 *   npm install --no-save playwright-core
 *   CHROMIUM_PATH=/path/to/chrome node scripts/capture-backup-fixture.js --check
 * Without CHROMIUM_PATH it launches whatever browser Playwright itself has.
 * With neither playwright-core nor playwright installed it skips (exit 0).
 * Exit 2 means it could not run at all.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

let chromium;
for (const name of ['playwright-core', 'playwright']) {
  try { ({ chromium } = require(name)); if (chromium) break; } catch (e) { /* try the next */ }
}
if (!chromium) {
  console.error('capture-backup-fixture: neither playwright-core nor playwright is installed — skipping.');
  process.exit(0);
}

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'app.html';
const FIXTURE = path.join(ROOT, 'tests', 'fixtures', 'demo-backup.json');

const TZ = 'America/Chicago';
const LOCALE = 'en-US';
const CAPTURE_AT = '2026-11-16T15:00:00.000Z';   /* 09:00 in Chicago */
const RESTORE_AT = '2026-11-17T03:30:00.000Z';   /* 21:30 in Chicago, still the 16th there */
const SETTLE_MS = 800;                           /* loadDemoData re-renders 300 ms after it returns */

/* The only fields a re-export may differ in. Paths are from the top of the file. */
const EXCLUDED = [
  { path: ['exportedAt'],
    why: 'the moment of export (nowStr() in _doExportData), so it follows the clock of the run that wrote the file' },
  { path: ['data', '_savedAt'],
    why: 'stamped by sd() on every save. Import saves through sd(); loadDemoData writes localStorage directly and never sets it' },
];

/* ---- arguments ---------------------------------------------------------- */

const argv = process.argv.slice(2);
const opt = { check: false, roundtrip: false, file: FIXTURE };
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--check') opt.check = true;
  else if (argv[i] === '--roundtrip') opt.roundtrip = true;
  else if (argv[i] === '--file' && argv[i + 1]) opt.file = path.resolve(argv[++i]);
  else {
    console.error('usage: node scripts/capture-backup-fixture.js [--check | --roundtrip] [--file FILE]');
    process.exit(2);
  }
}
const rel = path.relative(process.cwd(), opt.file);
const shown = rel && !rel.startsWith('..') ? rel : opt.file;

/* ---- comparing ---------------------------------------------------------- */

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const kind = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

/* One string per value, the same whatever order its keys were written in. */
function canon(v) {
  const k = kind(v);
  if (k === 'array') return '[' + v.map(canon).join(',') + ']';
  if (k === 'object') return '{' + Object.keys(v).sort().map((key) => JSON.stringify(key) + ':' + canon(v[key])).join(',') + '}';
  return JSON.stringify(v);
}

function brief(v) {
  if (kind(v) === 'object' && v.ts) return [v.type, v.ts].filter(Boolean).join(' @ ');
  const s = JSON.stringify(v);
  return s.length > 72 ? s.slice(0, 69) + '...' : s;
}

const newestFirst = (list) => list.every((x, i) => x && x.ts && (i === 0 || new Date(list[i - 1].ts) >= new Date(x.ts)));

/* Indexes of the items in `mine` that `theirs` has no copy of, counting duplicates. */
function unmatched(mine, theirs) {
  const spare = new Map();
  theirs.forEach((c) => spare.set(c, (spare.get(c) || 0) + 1));
  const out = [];
  mine.forEach((c, i) => { const n = spare.get(c) || 0; if (n) spare.set(c, n - 1); else out.push(i); });
  return out;
}

/* Every way `b` is not `a`, as lines a person can act on. `a` is the fixture. */
function diff(a, b, at, out) {
  const ka = kind(a), kb = kind(b);
  const sub = (k) => (at ? at + '.' + k : k);
  if (ka !== kb) { out.push(`${at}: ${ka} ${brief(a)} became ${kb} ${brief(b)}`); return; }
  if (ka === 'object') {
    Object.keys(a).forEach((k) => {
      if (!(k in b)) out.push(`${sub(k)}: lost (was ${brief(a[k])})`);
      else diff(a[k], b[k], sub(k), out);
    });
    Object.keys(b).forEach((k) => { if (!(k in a)) out.push(`${sub(k)}: added (${brief(b[k])})`); });
    return;
  }
  if (ka === 'array') {
    const ca = a.map(canon), cb = b.map(canon);
    if (ca.length === cb.length && ca.every((c, i) => c === cb[i])) return;
    const lost = unmatched(ca, cb), added = unmatched(cb, ca);
    if (a.length === b.length && lost.length && lost.every((i, n) => i === added[n])) {
      lost.forEach((i) => diff(a[i], b[i], `${at}[${i}]`, out));       /* changed where it stands */
    } else {
      lost.forEach((i) => out.push(`${at}[${i}]: lost (${brief(a[i])})`));
      added.forEach((i) => out.push(`${at}[${i}]: added (${brief(b[i])})`));
    }
    const keptA = a.filter((_, i) => !lost.includes(i)), keptB = b.filter((_, i) => !added.includes(i));
    const first = keptA.findIndex((x, i) => canon(x) !== canon(keptB[i]));
    if (first >= 0) {
      let line = `${at}: the same ${keptA.length} items, in a different order. First at [${first}]: ` +
                 `was ${brief(keptA[first])}, now ${brief(keptB[first])}`;
      if (newestFirst(keptB) && !newestFirst(keptA)) line += '. The new order is newest-first by ts; the old one was not';
      out.push(line);
    }
    return;
  }
  if (a !== b) out.push(`${at}: ${brief(a)} became ${brief(b)}`);
}

/* Not a JSON difference, but it is why two equal backups are not equal bytes. */
function keyOrder(a, b, at, out) {
  if (kind(a) !== 'object' || kind(b) !== 'object') return;
  const ka = Object.keys(a).filter((k) => k in b), kb = Object.keys(b).filter((k) => k in a);
  if (ka.join('\n') !== kb.join('\n')) out.push(`${at || '(top level)'}: ${ka.join(', ')}  became  ${kb.join(', ')}`);
  ka.forEach((k) => keyOrder(a[k], b[k], at ? at + '.' + k : k, out));
}

function dig(obj, steps) { return steps.reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function without(obj, steps) {
  const copy = JSON.parse(JSON.stringify(obj));
  const parent = dig(copy, steps.slice(0, -1));
  if (parent && typeof parent === 'object') delete parent[steps[steps.length - 1]];
  return copy;
}

function countByType(entries) {
  const n = {};
  (entries || []).forEach((e) => { n[e.type] = (n[e.type] || 0) + 1; });
  return n;
}
const countsLine = (n) => Object.keys(n).map((k) => `${k} ${n[k]}`).join(', ') || 'none';

/* Where two files part, for --check. */
function byteReport(want, got) {
  const lines = [`committed  ${want.length} bytes  sha256 ${sha(want)}`,
                 `captured   ${got.length} bytes  sha256 ${sha(got)}`];
  let i = 0, line = 1;
  while (i < want.length && i < got.length && want[i] === got[i]) { if (want[i] === 10) line++; i++; }
  if (i === want.length || i === got.length) {
    lines.push(`identical for the first ${i} bytes; the ${want.length > got.length ? 'committed' : 'captured'} file ` +
               `has ${Math.abs(want.length - got.length)} more after that`);
  } else {
    lines.push(`first difference at byte ${i}, line ${line}`);
    const at = (buf) => (buf.toString('utf8').split('\n')[line - 1] || '').trim().slice(0, 110);
    lines.push(`  committed: ${at(want)}`, `  captured:  ${at(got)}`);
  }
  try {
    const out = [];
    diff(JSON.parse(want.toString('utf8')), JSON.parse(got.toString('utf8')), '', out);
    if (!out.length) lines.push('the two parse to the same JSON: only whitespace or key order differs');
    out.slice(0, 25).forEach((d) => lines.push(d));
    if (out.length > 25) lines.push(`... and ${out.length - 25} more`);
  } catch (e) { lines.push('one of the two is not JSON: ' + e.message); }
  return lines;
}

/* ---- the browser -------------------------------------------------------- */

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

const results = [];
function t(name, ok, detail) {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  return ok;
}
const note = (lines, pad) => lines.forEach((l) => console.log((pad || '      ') + l));

/* A context of its own, so nothing is stored when the page opens. */
async function openApp(browser, base, instant) {
  const context = await browser.newContext({ timezoneId: TZ, locale: LOCALE, serviceWorkers: 'block',
    viewport: { width: 414, height: 900 } });
  const page = await context.newPage();
  const s = { context, page, instant, errors: [], blocked: [], confirms: [] };

  page.on('pageerror', (e) => s.errors.push(e.message));
  /* Headless dismisses dialogs, and a dismissed confirm() means loadDemoData
     returns having loaded nothing. */
  page.on('dialog', (d) => { s.confirms.push(d.message()); d.accept().catch(() => {}); });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(base + '/') || /^(blob|data|about):/.test(url)) return route.continue();
    s.blocked.push(url);
    return route.abort();
  });
  await page.clock.setFixedTime(new Date(instant));

  /* Past the first-run screens, the way a person loading demo data or restoring
     a backup already is. Neither flag is part of the record. `v` only has to
     reach DISCLAIMER_VERSION; if it falls behind, the gate draws over the app
     and the data underneath is the same. */
  await page.addInitScript((at) => {
    try {
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: at, age18: true }));
    } catch (e) {}
  }, instant);

  await page.goto(`${base}/${PAGE}`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.loadDemoData === 'function' && typeof window.exportData === 'function' &&
    !!document.getElementById('import-file'), null, { timeout: 15000 });
  await page.waitForTimeout(SETTLE_MS);
  return s;
}

/* Is everything that was pinned still pinned? Asked before and after the work. */
async function pinsHold(s) {
  const p = await s.page.evaluate(() => ({
    now: Date.now(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    notifications: typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  }));
  const bad = [];
  if (p.now !== Date.parse(s.instant)) bad.push(`Date.now() is ${new Date(p.now).toISOString()}, not ${s.instant}`);
  if (p.tz !== TZ) bad.push(`time zone is ${p.tz}`);
  if (p.locale !== LOCALE) bad.push(`locale is ${p.locale}`);
  if (p.notifications === 'granted') bad.push('notifications are granted, so reminders can write to the record');
  return bad;
}

/* The app's own export, as the file the browser was handed. */
async function exportBackup(page) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.evaluate(() => window.exportData()),
  ]);
  const failure = await download.failure();
  if (failure) throw new Error('the export download failed: ' + failure);
  return { bytes: fs.readFileSync(await download.path()), name: download.suggestedFilename() };
}

const storedRecord = (page) => page.evaluate(() => localStorage.getItem('tlv2'));

async function capture(browser, base) {
  const s = await openApp(browser, base, CAPTURE_AT);
  const { page } = s;
  console.log(`capture     ${CAPTURE_AT} · ${TZ} · ${LOCALE}`);
  const before = await pinsHold(s);

  await page.evaluate(() => window.loadDemoData());
  await page.waitForFunction(() => {
    try { return (JSON.parse(localStorage.getItem('tlv2')).entries || []).length > 0; } catch (e) { return false; }
  }, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);

  const stored = await storedRecord(page);
  const file = await exportBackup(page);
  const after = await pinsHold(s);
  await s.context.close();

  let parsed = null;
  try { parsed = JSON.parse(file.bytes.toString('utf8')); } catch (e) { /* reported below */ }
  const entries = (parsed && parsed.data && parsed.data.entries) || [];

  t('clock, time zone and locale stayed pinned', !before.length && !after.length, before.concat(after).join('; '));
  t('loadDemoData() asked once and was confirmed', s.confirms.length === 1,
    s.confirms.length === 1 ? JSON.stringify(s.confirms[0]) : `${s.confirms.length} dialogs`);
  t('the export is JSON with a record in it', entries.length > 0, parsed ? `${entries.length} entries` : 'does not parse');
  /* A full backup: the same record, in the same key order, as the one stored. */
  t('the export carries the whole stored record',
    !!parsed && !!stored && JSON.stringify(parsed.data) === JSON.stringify(JSON.parse(stored)));
  t('no page errors', s.errors.length === 0, s.errors.slice(0, 2).join(' | '));
  console.log(`      ${s.blocked.length} off-origin request(s) aborted`);
  return { bytes: file.bytes, name: file.name, parsed };
}

/* One restore: a context with nothing stored takes `upload` through the real
   file input, then exports. `upload` is a path, or { name, mimeType, buffer }. */
async function importThenExport(browser, base, upload, label, source) {
  const s = await openApp(browser, base, RESTORE_AT);
  const { page } = s;
  const before = await pinsHold(s);

  t(`${label}: nothing is stored before the import`, (await storedRecord(page)) === null);

  await page.setInputFiles('#import-file', upload);
  await page.waitForFunction(() => /Import (successful|failed)/.test(document.getElementById('import-result').textContent),
    null, { timeout: 15000 }).catch(() => {});
  const said = (await page.textContent('#import-result')).replace(/\s+/g, ' ').trim();
  t(`${label}: the app accepts the file`, /Import successful/.test(said), said || 'importData reported nothing');

  let stored = null;
  try { stored = JSON.parse(await storedRecord(page)); } catch (e) { /* reported below */ }
  const want = countByType(source.data && source.data.entries), got = countByType(stored && stored.entries);
  t(`${label}: the stored record has the file's entries, type for type`, canon(want) === canon(got),
    canon(want) === canon(got) ? countsLine(got) : `file: ${countsLine(want)}; stored: ${countsLine(got)}`);

  const again = await exportBackup(page);
  const after = await pinsHold(s);
  await s.context.close();
  t(`${label}: clock, time zone and locale stayed pinned`, !before.length && !after.length, before.concat(after).join('; '));
  t(`${label}: no page errors`, s.errors.length === 0, s.errors.slice(0, 2).join(' | '));

  let exported = null;
  try { exported = JSON.parse(again.bytes.toString('utf8')); } catch (e) { /* reported below */ }
  t(`${label}: the re-export is JSON`, !!exported);
  return { bytes: again.bytes, exported };
}

/* Drop the EXCLUDED fields from both sides, saying what each held. */
function leaveOut(a, b, nameA, nameB) {
  console.log('      left out of the comparison, by name:');
  const show = (v) => (v === undefined ? 'absent' : JSON.stringify(v));
  EXCLUDED.forEach((x) => {
    console.log(`        ${x.path.join('.')}  — ${x.why}`);
    console.log(`          ${nameA} ${show(dig(a, x.path))}, ${nameB} ${show(dig(b, x.path))}`);
    a = without(a, x.path); b = without(b, x.path);
  });
  return [a, b];
}

function reportKeyOrder(a, b) {
  const order = [];
  keyOrder(a, b, '', order);
  if (!order.length) return;
  console.log('      note: object keys are written in a different order, which is not a difference in the');
  console.log('      data but is one in the bytes:');
  note(order.slice(0, 5), '        ');
}

/* Two restores, because one cannot tell "import changed nothing" from "import
   changed it once and would change it again".

   first    the fixture, restored and exported. The demo record is the one
            record in the app that never went through sd(): loadDemoData writes
            localStorage directly, with entries grouped by type. Import saves
            through sd(), which sorts entries newest-first, as every record a
            person builds by logging already is. So the first restore may put
            data.entries in that order, and nothing else: same items, counted
            with duplicates, every field equal. That one reorder is allowed by
            name and printed. Any other difference fails.
   second   the first restore's own export, restored and exported again. Now
            the record has been through sd(), so this one must come back the
            same in every field and in every array's order. This is the check
            the migration is held to: a backup of a real record restores to
            itself. */
async function roundtrip(browser, base, file) {
  const fixture = JSON.parse(fs.readFileSync(file).toString('utf8'));
  console.log(`round trip  ${RESTORE_AT} · ${TZ} · ${LOCALE} · importing ${shown}`);

  const first = await importThenExport(browser, base, file, 'first restore', fixture);
  if (!first.exported) return;
  let [a, b] = leaveOut(fixture, first.exported, 'fixture', 're-export');

  const was = (a.data && a.data.entries) || [], now = (b.data && b.data.entries) || [];
  const ca = was.map(canon), cb = now.map(canon);
  const sameItems = ca.length === cb.length && !unmatched(ca, cb).length && !unmatched(cb, ca).length;
  const moved = sameItems && ca.some((c, i) => c !== cb[i]);
  if (moved) {
    const sorted = newestFirst(now);
    t('first restore: entries are the same items, re-sorted newest-first and nothing else', sorted,
      sorted ? `${now.length} entries; the fixture lists them grouped by type, as loadDemoData wrote them`
             : 'the entries moved, but not into newest-first order');
    if (sorted) a = Object.assign({}, a, { data: Object.assign({}, a.data, { entries: now }) });
  }

  const out = [];
  diff(a, b, '', out);
  t('first restore: the re-export is the fixture, apart from what is named above', out.length === 0,
    out.length ? `${out.length} difference(s)` : `${first.bytes.length} bytes re-exported`);
  note(out.slice(0, 40));
  if (out.length > 40) note([`... and ${out.length - 40} more`]);
  reportKeyOrder(a, b);

  const second = await importThenExport(browser, base,
    { name: 'therapylog-backup-restored.json', mimeType: 'application/json', buffer: first.bytes },
    'second restore', first.exported);
  if (!second.exported) return;
  const [c, d] = leaveOut(first.exported, second.exported, 'first re-export', 'second re-export');
  const out2 = [];
  diff(c, d, '', out2);
  t('second restore: a restored backup restores to itself, field for field and in order', out2.length === 0,
    out2.length ? `${out2.length} difference(s)` : `${second.bytes.length} bytes`);
  note(out2.slice(0, 40));
  if (out2.length > 40) note([`... and ${out2.length - 40} more`]);
  const sameBytes = JSON.stringify(c) === JSON.stringify(d);
  t('second restore: and its keys are written in the same order', sameBytes,
    sameBytes ? 'byte-identical once the two named fields are dropped' : 'equal data, different key order');
  if (!sameBytes) reportKeyOrder(c, d);
}

(async () => {
  if (opt.roundtrip || opt.check) {
    if (!fs.existsSync(opt.file)) {
      console.error(`capture-backup-fixture: ${shown} does not exist. Run without --check or --roundtrip to capture it.`);
      process.exit(1);
    }
  }
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  let browser;
  try { browser = await chromium.launch(launch); }
  catch (e) {
    console.error('capture-backup-fixture: could not start Chromium — ' + String(e.message).split('\n')[0]);
    console.error('Set CHROMIUM_PATH to a Chromium binary.');
    process.exit(2);
  }
  const { server, base } = await serve();
  let wrote = null;
  try {
    if (!opt.roundtrip || opt.check) {
      const cap = await capture(browser, base);
      const ok = results.every(Boolean);
      if (opt.check) {
        const want = fs.readFileSync(opt.file);
        const same = want.equals(cap.bytes);
        t(`the capture is byte-identical to ${shown}`, same,
          same ? `${want.length} bytes, sha256 ${sha(want).slice(0, 16)}` : 'the committed file and a fresh capture differ');
        if (!same) {
          note(byteReport(want, cap.bytes));
          note(['If the change is meant, capture again: node scripts/capture-backup-fixture.js']);
        }
      } else if (ok) {
        fs.mkdirSync(path.dirname(opt.file), { recursive: true });
        fs.writeFileSync(opt.file, cap.bytes);
        wrote = cap;
      }
    }
    if (opt.roundtrip || opt.check) await roundtrip(browser, base, opt.file);
  } finally {
    await browser.close();
    server.close();
  }

  const failed = results.filter((ok) => !ok).length;
  if (failed) {
    console.error(`BACKUP FIXTURE FAILED — ${failed} of ${results.length}`);
    process.exit(1);
  }
  if (wrote) {
    const d = wrote.parsed.data;
    console.log(`wrote ${shown} — ${wrote.bytes.length} bytes, sha256 ${sha(wrote.bytes)}, downloaded as ${wrote.name}`);
    console.log(`      top level: ${Object.keys(wrote.parsed).join(', ')}`);
    console.log(`      data: ${Object.keys(d).join(', ')}`);
    console.log(`      entries: ${d.entries.length} — ${countsLine(countByType(d.entries))}`);
  } else {
    console.log(`backup fixture OK: ${results.length} checks — ` + (opt.check
      ? 'the app still exports the committed bytes, and reads them back without loss'
      : 'the app reads the fixture back without loss'));
  }
})().catch((e) => {
  console.error('capture-backup-fixture: ' + (e && e.stack || e));
  process.exit(2);
});
