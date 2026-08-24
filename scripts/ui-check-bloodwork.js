#!/usr/bin/env node
/*
 * Browser check for the bloodwork tab. OPTIONAL — not wired into CI.
 *
 * The two validators next to this file test logic; this one drives the real app
 * in Chromium: it types values into the form, filters the marker list, defines a
 * user-defined marker, uploads a real PDF and a real screenshot, intercepts the
 * request to the AI endpoint to prove a PDF leaves as a `document` block and an
 * image as an `image` block, then saves and reads the rendered result back.
 *
 * It needs a browser and `playwright-core`, which this repo does not vendor:
 *     npm install playwright-core        # once, anywhere on the PATH's node
 *     node scripts/ui-check-bloodwork.js [--headed] [--shots DIR]
 *
 * The AI endpoint is always stubbed — nothing is uploaded anywhere, and the
 * fixtures (a 5-object PDF and a PNG) are generated in a temp dir at run time.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const zlib = require('zlib');

let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  console.error('ui-check-bloodwork: playwright-core is not installed — skipping.');
  console.error('  npm install playwright-core   (then re-run; this check is optional)');
  process.exit(0);
}

const ROOT = path.join(__dirname, '..');
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
             '/opt/pw-browsers/chromium/chrome-linux/chrome',
             process.env.CHROMIUM_PATH].filter(Boolean).find((p) => fs.existsSync(p));
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > -1 ? process.argv[shotsArg + 1] : null;
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tl-uicheck-'));

/* ---- fixtures: a real one-page PDF and a real oversized PNG ---- */
function writeFixtures() {
  const content = Buffer.from('BT /F1 12 Tf 40 750 Td (Testosterone, Total   20.8 nmol/L   8.6-29.0) Tj '
    + '0 -20 Td (Uric Acid 5.2 mg/dL 3.4-7.0) Tj ET');
  const objs = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>'),
    Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`), content, Buffer.from('\nendstream')]),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  ];
  let pdf = Buffer.from('%PDF-1.4\n');
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n`), o, Buffer.from('\nendobj\n')]);
  });
  const xref = pdf.length;
  let table = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { table += String(o).padStart(10, '0') + ' 00000 n \n'; });
  table += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  fs.writeFileSync(path.join(out, 'panel.pdf'), Buffer.concat([pdf, Buffer.from(table)]));

  const w = 1600, h = 1200;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(w * 3 + 1);
    for (let x = 0; x < w; x++) { row[1 + x * 3] = (x * 2) % 256; row[2 + x * 3] = (y * 3) % 256; row[3 + x * 3] = 200; }
    rows.push(row);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(body) : crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  function crc32(buf) {              /* older Node has no zlib.crc32 */
    let c = ~0;
    for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); }
    return ~c >>> 0;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(path.join(out, 'page2.png'), Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))
  ]));
}

/* ---- serve the repo so storage APIs behave like production ---- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

const results = [];
const t = (name, ok, extra = '') => results.push([ok ? 'PASS' : 'FAIL', name, ok ? '' : String(extra).slice(0, 200)]);
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name) }); };

async function openLabsTab(page, port) {
  /* The AI scanner is a Pro feature; manual entry is not gated. Entitlement now
     comes from a server-verified license, so seed the cached entitlement — the
     old `tl_tier` string is deliberately no longer honoured. */
  await page.addInitScript(() => {
    try {
      localStorage.setItem('tl_ent', JSON.stringify({
        tier: 'pro', status: 'active', expires: null, lifetime: true,
        key: 'TL-TEST-TEST-TEST', verifiedAt: Date.now(), source: 'license'
      }));
    } catch (e) {}
  });
  await page.goto(`http://127.0.0.1:${port}/app.html`);
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("I Understand")').first().click();
  await page.waitForTimeout(250);
  await page.locator('button:has-text("Skip setup, explore first")').first().click();
  await page.waitForTimeout(400);
  await page.locator('.nav-btn', { hasText: 'Log' }).first().click();
  await page.waitForTimeout(250);
  await page.locator('#page-log .seg-btn', { hasText: 'Labs' }).click();
  await page.waitForTimeout(400);
}

(async () => {
  if (!EXE) {
    console.error('ui-check-bloodwork: no Chromium found. Set CHROMIUM_PATH, or install one. Skipping.');
    process.exit(0);
  }
  writeFixtures();
  const { server, port } = await serve();
  const browser = await chromium.launch({ executablePath: EXE, headless: !process.argv.includes('--headed'), args: ['--no-sandbox'] });

  /* ============ manual entry, filtering, user-defined markers ============ */
  {
    const page = await browser.newPage({ viewport: { width: 414, height: 1000 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    await openLabsTab(page, port);
  // --- the upload card and the manual form are both present
  t('upload card visible', await page.locator('text=Scan Lab Report').first().isVisible());
  t('camera button visible', await page.locator('button:has-text("Camera")').first().isVisible());
  t('upload button visible', await page.locator('button:has-text("Upload")').first().isVisible());
  t('manual form visible', await page.locator('#lab-values-card').isVisible());
  await page.locator('#lab-values-card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot(page, 'ui-labs-form.png');

  // --- manual entry works for a built-in and one of the new markers
  await page.fill('#ll-tott', '640');
  await page.fill('#ll-uricacid', '5.2');
  await page.fill('#ll-ggt', '22');
  await page.selectOption('#ll-method-tott', 'lc-ms-ms');
  t('typed values stick', (await page.inputValue('#ll-tott')) === '640' && (await page.inputValue('#ll-ggt')) === '22');

  // --- the filter finds a field by alias and hides the rest
  await page.fill('#ll-filter', 'sgpt');
  await page.waitForTimeout(200);
  const altVisible = await page.locator('#ll-alt').isVisible();
  const tottVisible = await page.locator('#ll-tott').isVisible();
  const filterVisible = await page.locator('#ll-filter').isVisible();
  const countText = (await page.locator('#ll-filter-count').textContent()).trim();
  t('filter by alias shows ALT', altVisible);
  t('filter hides non-matching fields', !tottVisible);
  t('filter box does not hide itself', filterVisible);
  t('filter reports a match count', /match/.test(countText), countText);
  await shot(page, 'ui-filter.png');
  await page.fill('#ll-filter', '');
  await page.waitForTimeout(200);
  t('clearing the filter restores fields', await page.locator('#ll-tott').isVisible());

  // --- a user-defined marker
  await page.fill('#ll-cm-name', 'Zonulin');
  await page.fill('#ll-cm-unit', 'ng/mL');
  await page.fill('#ll-cm-val', '42');
  await page.fill('#ll-cm-lo', '0');
  await page.fill('#ll-cm-hi', '40');
  await page.locator('button:has-text("+ Add marker")').click();
  await page.waitForTimeout(400);
  t('user-defined field appears', await page.locator('#ll-cm_zonulin').isVisible());
  t('user-defined value carried over', (await page.inputValue('#ll-cm_zonulin')) === '42');
  t('its range is shown on the field', /Ref 0-40/.test(await page.locator('#ll-custom-list').textContent()));
  // naming one that already exists points at the built-in
  await page.fill('#ll-cm-name', 'Hemoglobin A1c');
  await page.fill('#ll-cm-val', '5.1');
  await page.locator('button:has-text("+ Add marker")').click();
  await page.waitForTimeout(400);
  t('a known marker routes to its built-in field', (await page.inputValue('#ll-hba1c')) === '5.1');
  await page.locator('#ll-custom-list').scrollIntoViewIfNeeded();
  await shot(page, 'ui-custom-marker.png');

  // --- save, then check it renders in the bloodwork view
  await page.locator('button:has-text("Save Lab Results")').click();
  await page.waitForTimeout(600);
  const saved = await page.evaluate(() => { const e = gd().entries.find(x => x.type === 'bloodwork'); return e ? { labs: e.labs, meta: e.labMeta } : null; });
  t('panel saved with built-ins and the user-defined marker',
    !!saved && saved.labs.tott === 640 && saved.labs.uricacid === 5.2 && saved.labs.cm_zonulin === 42 && saved.labs.hba1c === 5.1,
    JSON.stringify(saved && saved.labs));
  t('assay method saved', !!saved && saved.meta && saved.meta.tott && saved.meta.tott.method === 'lc-ms-ms', JSON.stringify(saved && saved.meta));
  t('the form was cleared after saving', (await page.inputValue('#ll-tott')) === '');

  await page.locator('.nav-btn', { hasText: 'Health' }).first().click();
  await page.waitForTimeout(700);
  const grid = await page.locator('#bw-grid').textContent().catch(() => '');
  t('bloodwork grid shows a built-in marker', /Total T/.test(grid), grid.slice(0, 120));
  t('bloodwork grid shows the user-defined marker', /Zonulin/.test(grid), grid.slice(0, 200));
  t('the user-defined marker is flagged against its own range', /Zonulin/.test(grid) && /Out of Range/.test(grid));
  await page.locator('#bw-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot(page, 'ui-bloodwork-grid.png');

  t('no page errors during the whole flow', errors.length === 0, JSON.stringify(errors));
    await page.close();
  }

  /* ============ file intake and the scan round-trip ============ */
  {
    const page = await browser.newPage({ viewport: { width: 414, height: 1000 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  // stand in for the AI endpoint, and keep what the app sent
  let sent = null;
  await page.route('**/api/ai-research', async (route) => {
    sent = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      content: [{ type: 'text', text: JSON.stringify({
        markers: {
          tott: { value: 20.8, unit: 'nmol/L', refLow: 8.6, refHigh: 29.0, method: 'LC/MS-MS', confidence: 'high' },
          uricacid: { value: 5.2, unit: 'mg/dL', refLow: 3.4, refHigh: 7.0, confidence: 'high' },
          lpa: { value: 40, unit: 'mg/dL', confidence: 'high' },
          labdate: { value: '2026-08-10', confidence: 'high' }
        },
        extras: [
          { name: 'SGPT', value: 31, unit: 'U/L', confidence: 'high' },
          { name: 'Zonulin', value: 42, unit: 'ng/mL', refLow: 0, refHigh: 40, confidence: 'low' }
        ]
      }) }]
    }) });
  });

  await openLabsTab(page, port);

  // pick a PDF and a screenshot together, from the device
  await page.setInputFiles('#lab-file-input', [path.join(out, 'panel.pdf'), path.join(out, 'page2.png')]);
  await page.waitForTimeout(900);
  const listText = await page.locator('#lab-files-list').textContent();
  t('both files listed', /panel\.pdf/.test(listText) && /page2\.png/.test(listText), listText);
  t('the PDF is labelled as all pages', /PDF · all pages/.test(listText));
  t('the image reports its downscaled size', /1568×1176/.test(listText), listText);
  t('a total size note is shown', /file\(s\) ready/.test(await page.locator('#lab-files-note').textContent()));
  await page.locator('#lab-img-preview').scrollIntoViewIfNeeded();
  await shot(page, 'ui-files-queued.png');

  await page.locator('#lab-scan-btn').click();
  await page.waitForTimeout(1500);

  t('the scan actually posted to the AI endpoint', !!sent, 'no request captured');
  const blocks = sent ? (((sent.messages || [])[0] || {}).content || []) : [];
  t('the PDF went as a document block', blocks.some(b => b.type === 'document' && b.source.media_type === 'application/pdf'));
  t('the image went as an image block', blocks.some(b => b.type === 'image' && b.source.media_type === 'image/jpeg'));
  t('nothing was sent as a PDF-in-an-image-block', !blocks.some(b => b.type === 'image' && b.source.media_type === 'application/pdf'));
  t('the PDF base64 is real and unwrapped', (() => {
    const d = (blocks.find(b => b.type === 'document') || {}).source.data || '';
    return !/\s/.test(d) && Buffer.from(d, 'base64').slice(0, 5).toString() === '%PDF-';
  })());
  t('the oversized image was downscaled to the useful long edge',
    /1568×1176/.test(listText) && (blocks.find(b => b.type === 'image') || {}).source.media_type === 'image/jpeg');
  t('the prompt is the last block', blocks[blocks.length - 1].type === 'text');
  t('the prompt asks for untracked results too', /extras/.test(blocks[blocks.length - 1].text));

  t('a nmol/L value was converted into the ng/dL field', (await page.inputValue('#ll-tott')) === '600', await page.inputValue('#ll-tott'));
  t('a same-unit value filled as-is', (await page.inputValue('#ll-uricacid')) === '5.2');
  t('an extra under another name hit its own field (SGPT → ALT)', (await page.inputValue('#ll-alt')) === '31');
  t('the collection date was filled', (await page.inputValue('#ll-date')) === '2026-08-10');
  t('the scanned assay method set the picker', (await page.inputValue('#ll-method-tott')) === 'lc-ms-ms');
  const resultText = await page.locator('#lab-scan-result').textContent();
  t('unconvertible Lp(a) mg/dL was refused, not filled', (await page.inputValue('#ll-lpa')) === '' && /no valid conversion/.test(resultText), resultText.slice(0, 300));
  t('the conversion is disclosed to the user', /20\.8 nmol\/L → 600 ng\/dL/.test(resultText), resultText.slice(0, 400));
  t('untracked markers are offered, not dropped', /Zonulin/.test(resultText) && /Add all 1 to my form/.test(resultText));
  await page.locator('#lab-scan-result').scrollIntoViewIfNeeded();
  await shot(page, 'ui-scan-result.png');

  await page.locator('button:has-text("Add all 1 to my form")').click();
  await page.waitForTimeout(500);
  t('accepting adds the field with its value', (await page.inputValue('#ll-cm_zonulin')) === '42');
  await page.locator('button:has-text("Save Lab Results")').click();
  await page.waitForTimeout(600);
  const saved = await page.evaluate(() => { const e = gd().entries.find(x => x.type === 'bloodwork'); return { labs: e.labs, meta: e.labMeta }; });
  t('the panel saved everything', saved.labs.tott === 600 && saved.labs.uricacid === 5.2 && saved.labs.alt === 31 && saved.labs.cm_zonulin === 42, JSON.stringify(saved.labs));
  t("the lab's own converted range was kept", Math.abs(saved.meta.tott.refLo - 248.02) < 0.05, JSON.stringify(saved.meta.tott));
  t('no page errors during the whole flow', errors.length === 0, JSON.stringify(errors));
    await page.close();
  }

  await browser.close();
  server.close();
  fs.rmSync(out, { recursive: true, force: true });
  const bad = results.filter((r) => r[0] !== 'PASS');
  if (process.argv.includes('-v') || bad.length) {
    const pad = Math.max(...results.map((r) => r[1].length));
    results.forEach(([s, n, e]) => console.log(`${s === 'PASS' ? '\u2713' : '\u2717'} ${n.padEnd(pad)} ${e}`));
  }
  if (bad.length) {
    console.error(`BLOODWORK UI CHECK FAILED — ${bad.length} of ${results.length} check(s)`);
    process.exit(1);
  }
  console.log(`bloodwork UI OK: ${results.length} checks in a real browser — manual entry, marker filter, `
    + 'user-defined markers, PDF + screenshot upload, and the scan round-trip');
  process.exit(0);
})().catch((e) => {
  const pad = results.length ? Math.max(...results.map((r) => r[1].length)) : 10;
  results.forEach(([s, n, x]) => console.log(`${s === 'PASS' ? '\u2713' : '\u2717'} ${n.padEnd(pad)} ${x}`));
  console.error('BLOODWORK UI CHECK FAILED — ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
