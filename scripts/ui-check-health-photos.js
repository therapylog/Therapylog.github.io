#!/usr/bin/env node
/* Health -> Photos (6d), in a browser (src/ui/photos.js).
 *
 * Without a plan: the pose chips and their Pro tag, no photos yet, importing
 * two photos (kept with their own dates) and taking one, each compressed to
 * JPEG with a thumbnail, in IndexedDB and not in the record; comparing is the
 * paid part; a photo opened, kept on Cancel and deleted on Delete; the zip
 * export read back; photos still there after a reload; "Delete all data"
 * deleting them. With a plan: the first and latest of a pose side by side,
 * with dates and "Week N · Pose", and the written check-ins. Light at 320 px.
 *
 *   node scripts/ui-check-health-photos.js
 *   SHOTS=dir node scripts/ui-check-health-photos.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-health-photos: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const SHOTS = process.env.SHOTS || null;
const DEMO = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'demo-backup.json'), 'utf8')).data;

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: 'http://127.0.0.1:' + server.address().port }));
  });
}

const results = [];
const t = (name, ok, detail) => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const PAID = (now) => JSON.stringify({ tier: 'pro', status: 'active', expires: null, plan: 'yearly', lifetime: false,
  willRenew: true, key: 'TL-TEST-TEST-TEST', email: null, verifiedAt: now - 60000, source: 'license' });
/* Thursday 19 November 2026, 06:00: no round due yet, so no banner. */
const CLOCK = new Date(2026, 10, 19, 6, 0, 0);

async function open(browser, base, opts) {
  const context = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [], dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  await page.clock.install({ time: CLOCK });
  await page.addInitScript(([record, theme, ent]) => {
    try {
      if (sessionStorage.getItem('tl-test-seeded')) return;
      sessionStorage.setItem('tl-test-seeded', '1');
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-theme', theme);
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
      localStorage.setItem('tlv2', record);
      if (ent) localStorage.setItem('tl_ent', ent);
    } catch (e) {}
  }, [JSON.stringify(opts.record || DEMO), opts.theme || 'dark', opts.paid ? PAID(CLOCK.getTime()) : null]);
  await page.goto(base + '/app.html' + (opts.hash || '#/health/photos'), { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('tl-shell') && !!document.getElementById('tl-tabs').firstChild);
  await page.waitForTimeout(250);
  return { context, page, errors, dialogs };
}

const shot = async (page, name, full) => {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: !!full });
};
const record = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null'));

const fit = (page, sel) => page.evaluate((sel) => {
  const box = document.querySelector(sel);
  const out = { unnamed: [], small: [], tiny: [], overflow: 0 };
  if (!box) return { missing: sel };
  box.querySelectorAll('button,a,input,select,textarea').forEach((el) => {
    if (el.offsetParent === null) return;
    const r = (el.closest('.ds-seg') || el).getBoundingClientRect();
    const name = (el.getAttribute('aria-label') || el.textContent || el.value || el.placeholder || '').trim() ||
      (el.id && document.querySelector('label[for="' + el.id + '"]') ? 'label' : '');
    if (!name) out.unnamed.push(el.outerHTML.slice(0, 80));
    if (r.height < 43.5) out.small.push((name || el.tagName).slice(0, 30) + ' ' + Math.round(r.height));
  });
  const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const n = walk.currentNode, el = n.parentElement;
    if (!n.textContent.trim() || !el || el.offsetParent === null || el.closest('.ds-sr')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) out.tiny.push(n.textContent.trim().slice(0, 20) + ' ' + size);
  }
  out.overflow = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  return out;
}, sel);
const fitOk = (f) => f && !f.missing && !f.unnamed.length && !f.small.length && !f.tiny.length && f.overflow <= 0;
const fitDetail = (f) => JSON.stringify(f).slice(0, 300);


const where = (page) => page.evaluate(() => {
  const vis = (id) => { const el = document.getElementById(id); return !!el && el.offsetParent !== null && el.getBoundingClientRect().height > 0; };
  return {
    route: tlRoute, title: (document.querySelector('#tl-top h1') || {}).textContent || null, shown: ['page-photos'].filter(vis),
    upgrade: (document.getElementById('tl-upgrade-overlay') || {}).textContent || null, ph: !!document.querySelector('#tl-screen .tl-photo')
  };
});
const closeUpgrade = (page) => page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });
const screen = (page) => page.evaluate(() => ({
  chips: Array.from(document.querySelectorAll('.tl-photo-poses .ds-chip')).map((c) => c.textContent + (c.getAttribute('aria-pressed') === 'true' ? '*' : '')),
  pro: !!document.querySelector('.tl-photo-poses .ds-tag'),
  lock: !!document.querySelector('.tl-photo-lock [data-photo="compare"]'),
  frames: Array.from(document.querySelectorAll('.tl-photo-frame')).map((f) => f.classList.contains('tl-photo-frame-empty') ? 'empty:' + f.textContent.trim()
    : (f.querySelector('figcaption') || {}).textContent + '|' + (f.querySelector('img').complete && f.querySelector('img').naturalWidth > 0 ? 'img' : 'noimg')),
  thumbs: Array.from(document.querySelectorAll('.tl-photo-thumb')).map((t) => t.textContent),
  thumbsLoaded: Array.from(document.querySelectorAll('.tl-photo-thumb img')).every((i) => i.complete && i.naturalWidth > 0),
  none: !!document.querySelector('.tl-photo-none'), foot: (document.querySelector('.tl-photo .ds-foot') || {}).textContent || null
}));
/* Photos as the browser would hand them over: Files with a date, made from
   a canvas, set on one of the two file inputs. */
const give = async (page, input, specs, bad) => {
  await page.evaluate(async ([input, specs, bad]) => {
    const dt = new DataTransfer();
    for (const s of specs) {
      const c = document.createElement('canvas'); c.width = s.w; c.height = s.h;
      const g = c.getContext('2d'); g.fillStyle = s.color; g.fillRect(0, 0, s.w, s.h); g.fillStyle = '#fff'; g.fillRect(s.w / 4, s.h / 4, s.w / 2, s.h / 2);
      const blob = await new Promise((r) => c.toBlob(r, s.type || 'image/png'));
      dt.items.add(new File([blob], s.name || 'photo.png', { type: blob.type, lastModified: s.date ? new Date(s.date).getTime() : Date.now() }));
    }
    if (bad) dt.items.add(new File(['not an image'], 'notes.png', { type: 'image/png' }));
    const el = document.getElementById(input);
    el.files = dt.files;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [input, specs, !!bad]);
  /* Polled from here: the harness's fake clock also stops the
     requestAnimationFrame that waitForFunction polls with. */
  for (let i = 0; i < 80; i++) {
    if (await page.evaluate(() => /saved to|could not be read/.test((document.getElementById('tl-toast') || {}).textContent || ''))) break;
    await page.waitForTimeout(100);
  }
  const toast = await page.evaluate(() => (document.getElementById('tl-toast') || {}).textContent || null);
  await page.evaluate(() => { const t = document.getElementById('tl-toast'); if (t) t.remove(); });
  await page.waitForTimeout(300);
  return toast;
};
const stored = (page) => page.evaluate(() => tlPhotoAll().then((l) => Promise.all(l.map((p) => new Promise((res) => {
  const i = new Image(); i.onload = () => res({ id: p.id, ts: p.ts, pose: p.pose, w: p.w, h: p.h, type: p.blob.type, thumbType: p.thumb.type, iw: i.naturalWidth, ih: i.naturalHeight, tw: null }); i.src = URL.createObjectURL(p.thumb);
}).then((r) => { r.tw = Math.max(r.iw, r.ih); return r; })))));

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tl-photos-'));

  /* ===== without a plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    let w = await where(page);
    t('#/health/photos is the new Photos screen, open without a plan', w.route === 'health/photos' && w.ph && !w.upgrade && !w.shown.includes('page-photos'), JSON.stringify(w));
    let s = await screen(page);
    t('Front, Side, Back, Front chosen, with a Pro tag', JSON.stringify(s.chips) === '["Front*","Side","Back"]' && s.pro, JSON.stringify(s.chips));
    t('no photos yet, and comparing is offered with Pro', s.none && !s.thumbs.length && s.lock);
    t('the footnote says photos stay on the phone and are not in the backup',
      s.foot === 'Photos stay on this phone with the rest of your log. They are not in your backup file: export them to keep a copy.', s.foot);
    const recordBefore = JSON.stringify(await record(page));

    let toast = await give(page, 'tl-photo-import', [{ w: 500, h: 700, color: '#2a6', date: '2026-11-01T09:00:00' }, { w: 3000, h: 4000, color: '#a26', date: '2026-11-15T09:00:00' }]);
    t('importing two photos saves both to the chosen pose', toast === '2 photos saved to Front', toast);
    let st = await stored(page);
    t('  each kept with the date the file carries', JSON.stringify(st.map((p) => [p.pose, p.ts.slice(0, 10)])) === JSON.stringify([['front', '2026-11-01'], ['front', '2026-11-15']]), JSON.stringify(st.map((p) => p.ts)));
    t('  as a JPEG no longer than 1600 px, with a JPEG thumbnail no longer than 360', st.every((p) => p.type === 'image/jpeg' && p.thumbType === 'image/jpeg' && Math.max(p.w, p.h) <= 1600 && p.tw <= 360) &&
      st[0].w === 500 && st[0].h === 700 && st[1].w === 1200 && st[1].h === 1600 && st[1].tw === 360, JSON.stringify(st.map((p) => [p.w, p.h, p.tw])));
    s = await screen(page);
    t('every photo is a thumbnail, newest first, with its date', JSON.stringify(s.thumbs) === '["Nov 15","Nov 1"]' && s.thumbsLoaded, JSON.stringify(s.thumbs));
    await page.click('.tl-photo-poses .ds-chip[data-value="side"]');
    await page.waitForTimeout(80);
    toast = await give(page, 'tl-photo-take', [{ w: 600, h: 800, color: '#26a' }]);
    st = await stored(page);
    const now = await page.evaluate(() => Date.now());
    t('taking a photo saves it to the pose chosen then, dated now', toast === 'Photo saved to Side' && st.length === 3 && st[2].pose === 'side' && Math.abs(new Date(st[2].ts).getTime() - now) < 60000, toast);
    toast = await give(page, 'tl-photo-import', [], true);
    t('a file that is not an image is said so, and nothing is kept', toast === 'That image could not be read' && (await stored(page)).length === 3, toast);
    t('none of it is in the record (and so none in a backup)', JSON.stringify(await record(page)) === recordBefore);
    await shot(page, 'photos-free-dark');

    w = await (async () => { await page.click('[data-photo="compare"]'); await page.waitForTimeout(250); return where(page); })();
    t('without a plan, "Compare with Pro" opens the upgrade screen', !!w.upgrade && /Progress Check-Ins/.test(w.upgrade) && w.route === 'health/photos', (w.upgrade || '').slice(0, 40));
    await closeUpgrade(page);
    await page.click('[data-tl-go="health/checkins"]'); await page.waitForTimeout(250);
    w = await where(page);
    t('  and so do the written check-ins', !!w.upgrade && w.route === 'health/photos');
    await closeUpgrade(page);

    /* One photo, opened. */
    await page.click('.tl-photo-thumb:nth-child(1)');
    await page.waitForTimeout(250);
    const view = await page.evaluate(() => { const v = document.querySelector('.tl-photo-view'); const i = v && v.querySelector('img');
      return v ? { text: v.querySelector('.tl-photo-view-t').textContent, loaded: i.complete && i.naturalWidth > 0, w: i.naturalWidth } : null; });
    t('a thumbnail opens the photo, full size, with its date and pose', !!view && view.loaded && view.w === 600 && /^[A-Z][a-z]{2} \d{1,2} · (Week \d+ · )?Side$/.test(view.text), JSON.stringify(view));
    await page.click('.tl-photo-view [data-photo="delete"]');
    await page.waitForTimeout(150);
    const ask = await page.evaluate(() => (document.getElementById('tl-confirm') || {}).textContent || '');
    t('  Delete asks first, and says it cannot be brought back', /Delete this photo\?/.test(ask) && /not in your backup file/.test(ask), ask.slice(0, 80));
    await page.click('#tl-confirm [data-tl-confirm="cancel"]');
    await page.waitForTimeout(150);
    t('  Cancel keeps it', (await stored(page)).length === 3 && !!(await page.$('.tl-photo-view')));
    await page.click('.tl-photo-view [data-photo="delete"]');
    await page.waitForTimeout(150);
    await page.click('#tl-confirm [data-tl-confirm="action"]');
    await page.waitForTimeout(400);
    s = await screen(page);
    st = await stored(page);
    t('  Delete removes it, from the store and the screen', st.length === 2 && st.every((p) => p.pose === 'front') && s.thumbs.length === 2 && !(await page.$('.tl-photo-view')), JSON.stringify(s.thumbs));

    /* Export. */
    const [download] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click('[data-photo="export"]')]);
    let names = null, jpeg = false;
    if (download) {
      const file = path.join(tmp, 'photos.zip');
      await download.saveAs(file);
      const b = fs.readFileSync(file);
      const end = b.lastIndexOf(Buffer.from([0x50, 0x4B, 0x05, 0x06]));
      const count = b.readUInt16LE(end + 10); let p = b.readUInt32LE(end + 16); names = []; jpeg = true;
      for (let i = 0; i < count; i++) {
        const nlen = b.readUInt16LE(p + 28), local = b.readUInt32LE(p + 42);
        names.push(b.slice(p + 46, p + 46 + nlen).toString('utf8'));
        const lnlen = b.readUInt16LE(local + 26), lelen = b.readUInt16LE(local + 28), at = local + 30 + lnlen + lelen;
        jpeg = jpeg && b[at] === 0xFF && b[at + 1] === 0xD8;
        p += 46 + nlen + b.readUInt16LE(p + 30) + b.readUInt16LE(p + 32);
      }
    }
    t('"Export photos" downloads a zip of every photo, as JPEGs named by day and pose', !!download && /^TherapyLog photos \d{4}-\d{2}-\d{2}\.zip$/.test(download.suggestedFilename()) &&
      JSON.stringify(names) === '["2026-11-01 front.jpg","2026-11-15 front.jpg"]' && jpeg, JSON.stringify([download && download.suggestedFilename(), names]));

    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(600);
    s = await screen(page);
    t('the photos are still there after a reload', s.thumbs.length === 2 && s.thumbsLoaded);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));

    /* Delete all data. */
    await page.evaluate(() => { resetAllData(); });
    await page.waitForTimeout(200);
    await page.click('#tl-confirm [data-tl-confirm="action"]');
    await page.waitForTimeout(500);
    const dbs = await page.evaluate(() => indexedDB.databases().then((l) => l.map((d) => d.name)));
    t('"Delete all data" deletes the photos too', !dbs.includes('TherapyLogPhotos'), JSON.stringify(dbs));
    await context.close();
  }

  /* ===== with a plan ===== */
  {
    const { context, page, errors } = await open(browser, base, { paid: true });
    await give(page, 'tl-photo-import', [{ w: 600, h: 800, color: '#2a6', date: '2026-10-20T09:00:00' }, { w: 600, h: 800, color: '#6a2', date: '2026-11-10T09:00:00' },
      { w: 600, h: 800, color: '#a62', date: '2026-11-17T09:00:00' }]);
    await page.click('.tl-photo-poses .ds-chip[data-value="side"]');
    await page.waitForTimeout(80);
    await give(page, 'tl-photo-import', [{ w: 600, h: 800, color: '#26a', date: '2026-11-12T09:00:00' }]);
    await page.click('.tl-photo-poses .ds-chip[data-value="front"]');
    await page.waitForTimeout(150);
    const cap = await page.evaluate(() => [tlPhotoCaption({ ts: '2026-10-20T09:00:00', pose: 'front' }, gd().proto && gd().proto.start), tlPhotoCaption({ ts: '2026-11-17T09:00:00', pose: 'front' }, gd().proto && gd().proto.start)]);
    let s = await screen(page);
    t('with a plan: no Pro tag, and the first and latest front photo side by side', !s.pro && !s.lock &&
      JSON.stringify(s.frames) === JSON.stringify(['Oct 20' + cap[0] + '|img', 'Nov 17' + cap[1] + '|img']), JSON.stringify(s.frames));
    t('  each captioned "Week N · Front" from the protocol\'s start', /^Week \d+ · Front$/.test(cap[1]), cap[1]);
    await shot(page, 'photos-paid-dark');
    await page.click('.tl-photo-poses .ds-chip[data-value="side"]');
    await page.waitForTimeout(150);
    s = await screen(page);
    t('  one side photo: the first frame, and "Latest" waiting', s.frames.length === 2 && /^Nov 12/.test(s.frames[0]) && s.frames[1] === 'empty:Latest', JSON.stringify(s.frames));
    await page.click('.tl-photo-poses .ds-chip[data-value="back"]');
    await page.waitForTimeout(150);
    s = await screen(page);
    t('  no back photo: both frames waiting', JSON.stringify(s.frames) === '["empty:First","empty:Latest"]', JSON.stringify(s.frames));
    await page.click('[data-tl-go="health/checkins"]'); await page.waitForTimeout(250);
    let w = await where(page);
    t('the written check-ins open, the old Photos page', w.route === 'health/checkins' && w.shown.includes('page-photos') && w.title === 'Written check-ins', JSON.stringify(w));
    await page.click('#tl-top [data-tl-back]'); await page.waitForTimeout(400);
    w = await where(page);
    t('  and Back returns to Photos', w.route === 'health/photos' && w.ph, w.route);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    await give(page, 'tl-photo-import', [{ w: 600, h: 800, color: '#2a6', date: '2026-11-01T09:00:00' }]);
    const f = await fit(page, '#tl-screen');
    t('light at 320 px: Photos fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'photos-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-health-photos: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
