#!/usr/bin/env node
/* The Library, in a browser (src/ui/library.js).
 *
 * On the demo patient's record: every compound listed once, with one status
 * tag; "in your stack" on the protocol's compounds; search and the class
 * chips; a compound's page with its tags once each, the half-life / route /
 * status grid, the regulatory text and its rows; addresses that link to a
 * compound and Back; fit at 320 px in the light theme.
 *
 *   node scripts/ui-check-library.js
 *   SHOTS=dir node scripts/ui-check-library.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-library: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/library'), { waitUntil: 'load' });
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


const rows = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.tl-lib-list [data-lib-open]')).map((r) => ({
  id: r.getAttribute('data-lib-open'), name: r.querySelector('.ds-row-title').textContent,
  sub: (r.querySelector('.ds-row-sub') || {}).textContent || '', tags: Array.from(r.querySelectorAll('.ds-tag')).map((x) => x.textContent),
  icon: (r.querySelector('.ds-hex i') || {}).className || ''
})));
const search = async (page, q) => { await page.fill('#tl-lib-q', q); await page.waitForTimeout(80); };
const chip = async (page, label) => { await page.click(`.tl-lib-chips .ds-chip:has-text("${label}")`); await page.waitForTimeout(80); };

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== the demo record, dark ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    const want = await page.evaluate(() => {
      const ids = []; DB.classes.forEach((c) => c.drugs.forEach((d) => { if (ids.indexOf(d.id) < 0) ids.push(d.id); }));
      const stack = tlProtocol(gd(), tlEnv()).compounds.map((c) => c.drugId).filter(Boolean);
      return { ids, stack };
    });
    t('#/library opens the Compounds segment, a new screen', await page.evaluate(() => location.hash === '#/library/compounds' && tlRoute === 'library/compounds' &&
      document.body.classList.contains('tl-new-screen') && !!document.querySelector('.tl-lib')));
    let r = await rows(page);
    t('every compound in the encyclopedia is listed, once', r.length === want.ids.length && JSON.stringify(r.map((x) => x.id)) === JSON.stringify(want.ids),
      r.length + ' of ' + want.ids.length);
    t('  each with exactly one status tag: Rx, Research or Supplement', r.every((x) => x.tags.length === 1 && /^(Rx|Research|Supplement)$/.test(x.tags[0])),
      JSON.stringify(r.filter((x) => x.tags.length !== 1)).slice(0, 200));
    const inStack = r.filter((x) => /in your stack/.test(x.sub)).map((x) => x.id).sort();
    t('  "in your stack" on exactly the protocol\'s compounds', inStack.length > 0 && JSON.stringify(inStack) === JSON.stringify(want.stack.slice().sort()),
      JSON.stringify(inStack) + ' vs ' + JSON.stringify(want.stack));
    t('  the search box counts the compounds', (await page.getAttribute('#tl-lib-q', 'placeholder')) === 'Search ' + want.ids.length + ' compounds');
    t('  a not-FDA-approved research compound says Research, not Rx', (r.find((x) => /melanotan ii/i.test(x.name)) || {}).tags + '' === 'Research',
      JSON.stringify(r.find((x) => /melanotan ii/i.test(x.name))));
    t('  progesterone names its own class, not Testosterone', /^Androgens/.test((r.find((x) => /progesterone/i.test(x.name)) || {}).sub || ''),
      (r.find((x) => /progesterone/i.test(x.name)) || {}).sub);

    await search(page, 'bpc');
    r = await rows(page);
    t('search narrows the list as you type', r.length >= 1 && r.every((x) => /bpc/i.test(x.name + ' ' + x.sub)) && r.some((x) => x.name === 'BPC-157'), JSON.stringify(r.map((x) => x.name)));
    await search(page, 'test cyp');
    r = await rows(page);
    t('  every word must match, other names included ("test cyp")', r.length >= 1 && r.some((x) => x.id === 'tc'), JSON.stringify(r.map((x) => x.name)));
    await search(page, 'zzzz');
    t('  nothing matching says so', /Nothing matches\. Try another name or class\./.test(await page.textContent('#tl-lib-rows')));
    await search(page, '');

    let total = 0, peptides = null, labels = ['Peptides', 'Testosterone', 'Growth hormone', 'Ancillaries', 'PCT', 'GLP-1', 'Other'];
    for (const label of labels) {
      await chip(page, label);
      const got = await rows(page);
      total += got.length;
      if (label === 'Peptides') peptides = got;
      if (label === 'GLP-1') t('  GLP-1 lists the GLP-1 drugs wherever they are filed', got.length >= 2 && got.every((x) => /ph-chart-line-down/.test(x.icon)), JSON.stringify(got.map((x) => x.name)));
    }
    t('the class chips filter by class, each row with its class\'s hexagon', peptides.length > 0 && peptides.every((x) => /ph-dna/.test(x.icon)), peptides.length + ' peptides');
    t('  and the chips together, Other included, cover every compound once', total === want.ids.length, total + ' of ' + want.ids.length);
    await chip(page, 'All');
    await shot(page, 'library-dark');

    await page.click('.tl-lib-list [data-lib-open="tc"]');
    await page.waitForSelector('.tl-lib-page');
    const pg = await page.evaluate(() => ({
      hash: location.hash, name: document.querySelector('.tl-lib-name').textContent,
      tags: Array.from(document.querySelectorAll('.tl-lib-tags .ds-tag')).map((x) => x.textContent),
      stats: Array.from(document.querySelectorAll('.tl-lib-stat')).map((x) => x.textContent),
      reg: (document.querySelector('.tl-lib-callout') || {}).textContent || '',
      text: document.querySelector('.tl-lib-page').textContent
    }));
    t('a row opens the compound\'s page at its own address', pg.hash === '#/library/compound/tc' && pg.name === 'Testosterone Cypionate', pg.hash);
    t('  its class and status tags appear once each', JSON.stringify(pg.tags) === JSON.stringify(['Testosterone', 'Prescription']) &&
      (pg.text.match(/Prescription/g) || []).length === 1, JSON.stringify(pg.tags));
    t('  the half-life, route and status grid', pg.stats.length === 3 && /Half-life6 d/.test(pg.stats[0]) && /RouteIM \/ SubQ/.test(pg.stats[1]) && /StatusRx/.test(pg.stats[2]),
      JSON.stringify(pg.stats));
    t('  the regulatory text, the reported protocols beside the physician note, and the footnote',
      /Regulatory status/.test(pg.reg) && /Protocols reported in the literature/.test(pg.text) && /not a dose for you/.test(pg.text) &&
      /Your physician decides what you take and how much/.test(pg.text), pg.text.slice(0, 120));
    await shot(page, 'compound-dark', true);
    await page.click('.tl-lib-page [data-tl-go="library/interactions"]');
    await page.waitForTimeout(250);
    t('  "Check against my stack" opens the interaction checker', await page.evaluate(() => tlRoute === 'library/interactions'));
    await page.goBack();
    await page.waitForTimeout(250);
    t('Back returns to the compound\'s page', await page.evaluate(() => tlRoute === 'library/compound' && location.hash === '#/library/compound/tc' &&
      document.querySelector('.tl-lib-name').textContent === 'Testosterone Cypionate'));
    await page.click('.tl-lib-page .tl-back');
    await page.waitForTimeout(200);
    t('  and "‹ Library" to the list', await page.evaluate(() => location.hash === '#/library/compounds' && !!document.querySelector('.tl-lib-list')));

    const bpc = (await page.evaluate(() => { let id = null; DB.classes.forEach((c) => c.drugs.forEach((d) => { if (d.name === 'BPC-157') id = d.id; })); return id; }));
    await page.evaluate((id) => { location.hash = '#/library/compound/' + id; }, bpc);
    await page.waitForTimeout(250);
    const research = await page.evaluate(() => ({ tags: Array.from(document.querySelectorAll('.tl-lib-tags .ds-tag')).map((x) => x.textContent),
      text: document.querySelector('.tl-lib-page').textContent }));
    t('an address can link straight to a compound; a research compound says "Research only" once', JSON.stringify(research.tags) === JSON.stringify(['Peptides', 'Research only']) &&
      (research.text.match(/Research only/gi) || []).length === 1, JSON.stringify(research.tags));
    await page.evaluate(() => { location.hash = '#/library/compound/no-such-thing'; });
    await page.waitForTimeout(250);
    t('  an unknown compound says so', /not in the Library/.test(await page.textContent('#tl-screen')));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: the Library fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'library-light-320');
    await page.click('.tl-lib-list [data-lib-open="tc"]');
    await page.waitForSelector('.tl-lib-page');
    f = await fit(page, '#tl-screen');
    t('  and a compound\'s page', fitOk(f), fitDetail(f));
    await shot(page, 'compound-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-library: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
