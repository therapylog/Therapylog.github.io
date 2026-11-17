#!/usr/bin/env node
/* The confirm sheet, in a browser.
 *
 * Six browser confirm() dialogs became one in-app sheet (src/logic/confirm.js).
 * tests/confirm.test.js pins its wording. This proves what only a page can:
 * that each dangerous action really waits for the sheet, that cancelling
 * leaves the data alone, that the sheet names the thing being deleted, that
 * "Export a backup first" exports and then asks again, and that no browser
 * dialog appears on any of these paths.
 *
 * The redesign restyles this sheet. Its behaviour must not change when it
 * does, and this is the check for that.
 *
 *   node scripts/ui-check-confirm.js
 *
 * Needs Playwright and a Chromium, like the other ui-check scripts:
 *   CHROMIUM_PATH=/path/to/chrome node scripts/ui-check-confirm.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-confirm: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel === '/app') rel = '/app.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: 'http://127.0.0.1:' + server.address().port }));
  });
}

const results = [];
const t = (name, ok, detail) => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [], dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
    } catch (e) {}
  });
  await page.goto(base + '/app.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.tlConfirm === 'function' && typeof window.loadDemoData === 'function');
  await page.waitForTimeout(600);

  const sheet = page.locator('#tl-confirm');
  const button = (id) => page.locator(`#tl-confirm [data-tl-confirm="${id}"]`);
  const text = async (sel) => ((await page.locator(sel).textContent()) || '').trim();
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null'));
  /* Start an action that asks, and hand back its promise without waiting on it. */
  const start = (fn, arg) => { const p = page.evaluate(fn, arg); p.catch(() => {}); return p; };

  /* ---- loading demo data ---- */
  let pending = start(() => window.loadDemoData());
  await button('action').waitFor({ timeout: 10000 });
  t('loading demo data asks in the sheet', (await text('#tl-confirm-title')) === 'Replace your log with demo data?');
  t('  as a dialog a screen reader announces', (await page.locator('#tl-confirm [role="alertdialog"][aria-modal="true"]').count()) === 1);
  t('  with focus on Cancel, so Enter cannot destroy anything',
    await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-tl-confirm')) === 'cancel');
  t('  offering a backup first', (await button('export').count()) === 1);
  await button('cancel').click();
  await pending;
  t('cancelling loads nothing', (await stored()) === null && (await sheet.count()) === 0);

  pending = start(() => window.loadDemoData());
  await button('action').waitFor();
  await page.keyboard.press('Escape');
  await pending;
  t('Escape cancels', (await stored()) === null && (await sheet.count()) === 0);

  pending = start(() => window.loadDemoData());
  await button('action').waitFor();
  await page.mouse.click(195, 40);                   /* the scrim, above the sheet */
  await pending;
  t('a tap outside the sheet cancels', (await stored()) === null && (await sheet.count()) === 0);

  pending = start(() => window.loadDemoData());
  await button('action').waitFor();
  await button('action').click();
  await pending;
  await page.waitForTimeout(700);
  const demo = await stored();
  t('confirming loads the demo record', !!demo && demo.entries.length === 35, demo ? demo.entries.length + ' entries' : 'nothing stored');

  /* ---- deleting a blood-pressure reading ---- */
  const bpBefore = demo.entries.filter((e) => e.type === 'bloodpressure');
  pending = start(() => window.deleteBPEntry(0));
  await button('action').waitFor();
  const body = await text('#tl-confirm-body');
  t('deleting a reading names the reading', body.startsWith(`${bpBefore[0].sys}/${bpBefore[0].dia}, pulse ${bpBefore[0].hr}, `) &&
    body.endsWith('Your averages and chart update.'), body);
  t('  and does not offer a backup', (await button('export').count()) === 0);
  await button('cancel').click();
  await pending;
  t('cancelling keeps the reading', (await stored()).entries.filter((e) => e.type === 'bloodpressure').length === bpBefore.length);
  pending = start(() => window.deleteBPEntry(0));
  await button('action').click();
  await pending;
  const bpAfter = (await stored()).entries.filter((e) => e.type === 'bloodpressure');
  t('confirming deletes that reading and no other', bpAfter.length === bpBefore.length - 1 &&
    !bpAfter.some((e) => e.ts === bpBefore[0].ts && e.sys === bpBefore[0].sys), `${bpBefore.length} -> ${bpAfter.length}`);

  /* ---- deleting a check-in ---- */
  const photosBefore = (await stored()).photos;
  pending = start(() => window.deletePhotoEntry(1));
  await button('action').waitFor();
  t('deleting a check-in names it', (await text('#tl-confirm-body')).startsWith(photosBefore[1].week + ', ' + photosBefore[1].date + '.'),
    await text('#tl-confirm-body'));
  await button('action').click();
  await pending;
  const photosAfter = (await stored()).photos;
  t('  and deletes that one', photosAfter.length === photosBefore.length - 1 && !photosAfter.some((p) => p.ts === photosBefore[1].ts && p.week === photosBefore[1].week));

  /* ---- clearing the protocol ---- */
  pending = start(() => window.clearProtocol());
  await button('action').waitFor();
  t('clearing the protocol asks, as a warning', (await text('#tl-confirm-title')) === 'Clear the active protocol?');
  await button('cancel').click();
  await pending;
  t('cancelling keeps the protocol', !!(await stored()).proto);
  pending = start(() => window.clearProtocol());
  await button('action').click();
  await pending;
  const cleared = await stored();
  t('confirming clears it and keeps the log', cleared.proto === null && cleared.entries.length === 34);

  /* ---- deleting everything ---- */
  pending = start(() => window.resetAllData());
  await button('action').waitFor();
  t('deleting everything is one question', (await text('#tl-confirm-title')) === 'Delete all TherapyLog data?');
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), button('export').click()]);
  t('"Export a backup first" downloads a backup', /^therapylog-backup-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()), download.suggestedFilename());
  await button('action').waitFor({ timeout: 5000 });
  t('  and then asks again rather than going ahead', (await text('#tl-confirm-title')) === 'Delete all TherapyLog data?' &&
    (await stored()).entries.length === 34);
  await button('cancel').click();
  await pending;
  t('cancelling after the export deletes nothing', (await stored()).entries.length === 34);

  pending = start(() => window.resetAllData());
  await button('action').click();
  await page.waitForFunction(() => localStorage.getItem('tlv2') === null, null, { timeout: 5000 }).catch(() => {});
  t('confirming deletes the record', (await page.evaluate(() => localStorage.getItem('tlv2'))) === null);

  t('no browser dialog appeared on any of these paths', dialogs.length === 0, dialogs.join(' | '));
  t('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();
  server.close();
  const failed = results.filter((ok) => !ok).length;
  if (failed) { console.error(`CONFIRM SHEET CHECK FAILED — ${failed} of ${results.length}`); process.exit(1); }
  console.log(`confirm sheet OK: ${results.length} checks — every dangerous action waits for the sheet, cancelling changes nothing, and the backup offer exports and asks again`);
})().catch((e) => { console.error('ui-check-confirm: ' + (e && e.stack || e)); process.exit(2); });
