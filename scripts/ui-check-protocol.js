#!/usr/bin/env node
/* The Protocol tab, in a browser (src/ui/protocol.js).
 *
 * On the demo patient's record with the clock fixed: the summary, the week
 * strip and the stack as the logic has them; editing a dose (recorded as a
 * dose change, and Today follows), times, and supply; adding and removing a
 * compound, with Undo; every row (interactions, templates, round alerts,
 * calendar, the full levels chart, name, start and length, clearing); the
 * old app's own way to the old cycle page landing here; a free user (the
 * screen is free, the analysis rows say Pro and gate); fit at 320 px.
 *
 *   node scripts/ui-check-protocol.js
 *   SHOTS=dir node scripts/ui-check-protocol.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-protocol: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/protocol'), { waitUntil: 'load' });
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
const screen = (page) => page.evaluate(() => ({
  route: tlRoute, newScreen: document.body.classList.contains('tl-new-screen'),
  count: (document.querySelector('.tl-pc-big .ds-big') || {}).textContent,
  sub: (document.querySelector('.tl-pc-sub') || {}).textContent || '',
  rows: Array.from(document.querySelectorAll('.tl-pc-row')).map((r) => [r.getAttribute('data-pc-edit'), r.querySelector('.tl-pc-name').textContent,
    r.querySelector('.tl-pc-line').textContent, r.querySelector('.tl-pc-times').textContent, (r.querySelector('.tl-pc-days') || {}).textContent || '']),
  week: Array.from(document.querySelectorAll('.tl-pc-day')).map((d) => d.textContent + (d.querySelector('.tl-pc-today') ? '*' : '')),
  changes: Array.from(document.querySelectorAll('.tl-pc-change .tl-pc-name')).map((n) => n.textContent)
}));
const editRow = async (page, key) => { await page.click(`.tl-pc-row[data-pc-edit="${key}"]`); await page.waitForSelector('.ds-sheet .tl-cs'); };
const done = async (page) => { await page.click('.ds-sheet .tl-cs-save'); await page.waitForSelector('.ds-sheet', { state: 'detached' }); };

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

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== a paid user, the demo record ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true });
    await page.evaluate(() => { window.__calls = []; window.exportRemindersICS = () => window.__calls.push('ics'); window.requestNotifPermission = () => window.__calls.push('permission'); });

    let s = await screen(page);
    const want = await page.evaluate(() => {
      const p = tlProtocol(gd(), tlEnv());
      return { keys: p.compounds.map((c) => c.key), week: tlWeekStrip(p, new Date()).map((w) => w.letter + w.count + (w.today ? '*' : '')) };
    });
    t('the Protocol tab is the new screen', s.route === 'protocol' && s.newScreen, JSON.stringify(s).slice(0, 160));
    t('the summary: six compounds, three rounds a day, week 10 of 16', s.count === '6' && /3 rounds a day/.test(s.sub) && /week 10 of 16, started 17 Sep/.test(s.sub), s.sub);
    t('the week strip is the logic\'s, Monday to Sunday, today ringed', JSON.stringify(s.week) === JSON.stringify(want.week) && s.week[3].endsWith('*'), JSON.stringify(s.week));
    t('the stack lists every compound, in order', JSON.stringify(s.rows.map((r) => r[0])) === JSON.stringify(want.keys), JSON.stringify(s.rows.map((r) => r[0])));
    t('each row says dose, days and route, and its round times', s.rows.some((r) => r[1] === 'BPC-157' && r[2] === '250 mcg · Daily · SubQ' && /^Morning 08:00 · Evening 20:00$/.test(r[3])),
      JSON.stringify(s.rows.find((r) => r[1] === 'BPC-157')));
    t('the compliance footnote is there', /never suggests one/.test(await page.textContent('.tl-proto .ds-foot')));
    await shot(page, 'protocol-dark-390', true);

    /* Editing a dose. */
    await editRow(page, 'bpc');
    t('a row opens its edit sheet, titled with its name, focus on the title, nothing typed for the user',
      await page.evaluate(() => document.getElementById('tl-cs-title').textContent === 'BPC-157' && document.activeElement.id === 'tl-cs-title' &&
        document.getElementById('tl-cs-amount').value === '250' && document.querySelector('.tl-cs-save').textContent === 'Done'));
    await page.fill('#tl-cs-amount', '300');
    await done(page);
    let d = await record(page);
    const bpc = d.protocol && d.protocol.compounds.find((c) => c.key === 'bpc');
    t('Done stores the protocol with the new dose, and the old fields in step', bpc && bpc.dose.text === '300 mcg' && /BPC-157, 300 mcg/.test(d.proto.meds), d.proto && d.proto.meds.split('\n')[1]);
    t('the dose change is recorded, and listed under Changes', d.doseChanges && d.doseChanges[0].key === 'bpc' && d.doseChanges[0].from === '250 mcg' && d.doseChanges[0].to === '300 mcg' &&
      (await screen(page)).changes[0] === 'BPC-157 250 → 300 mcg', JSON.stringify([d.doseChanges && d.doseChanges[0], (await screen(page)).changes]));
    t('and said', /Dose change recorded: BPC-157 250 → 300 mcg/.test(await page.textContent('#tl-toast').catch(() => '')));
    t('focus returns to the row', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-pc-edit') === 'bpc'));
    t('Today follows', await page.evaluate(() => { tlGo('today'); return Array.from(document.querySelectorAll('.tl-dose')).some((x) => /BPC-157/.test(x.textContent) && /300 mcg/.test(x.textContent)); }));
    await page.evaluate(() => tlGo('protocol'));

    /* Times and supply. */
    await editRow(page, 'bpc');
    await page.click('.ds-sheet .tl-slots .tl-slot[data-slot="bed"]');
    await page.fill('#tl-cs-per', '20');
    await page.fill('#tl-cs-left', '25');
    await page.click('.ds-sheet .tl-cs-save');
    t('doses left above doses per vial is refused, and says why', /cannot be more/.test(await page.textContent('.ds-sheet .tl-cs-error')));
    await page.fill('#tl-cs-left', '6');
    await page.click('.ds-sheet [data-spare="1"]');
    t('the supply note follows the fields', /6 of 20 doses left in the open vial/.test(await page.textContent('.ds-sheet .tl-cs-supply-note')));
    await done(page);
    d = await record(page);
    const bpc2 = d.protocol.compounds.find((c) => c.key === 'bpc');
    t('times and supply are stored', JSON.stringify(bpc2.slots) === '["am","eve","bed"]' && bpc2.inv && bpc2.inv.per === 20 && bpc2.inv.left === 6 && bpc2.inv.spare === 1 && !!bpc2.inv.since,
      JSON.stringify([bpc2.slots, bpc2.inv]));
    s = await screen(page);
    const row = s.rows.find((r) => r[0] === 'bpc');
    t('the row shows the new times and how many days the supply lasts', /Bedtime 21:30/.test(row[3]) && /^\d+ d$/.test(row[4]), JSON.stringify(row));
    await page.evaluate(() => tlGo('today'));
    t('Today\'s bedtime round now has BPC-157, and its inventory row appears', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.tl-round-h')).some((h) => /Bedtime/.test(h.textContent)) &&
      /BPC-157/.test((document.querySelector('.tl-sec[aria-label="Inventory"]') || {}).textContent || '')));
    await page.evaluate(() => tlGo('protocol'));

    /* Add and remove. */
    await page.click('[data-pc="add"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    await page.fill('#tl-cs-name', 'Vitamin D3');
    await page.fill('#tl-cs-amount', '5000');
    await page.selectOption('#tl-cs-unit', 'IU');
    await page.click('.ds-sheet [data-ds-seg="How it is taken"] [data-value="oral"]');
    await page.click('.ds-sheet .tl-cs-save');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    s = await screen(page);
    const vit = s.rows.find((r) => r[1] === 'Vitamin D3');
    t('a compound can be added', !!vit && vit[2] === '5000 IU · Daily · Oral' && s.count === '7', JSON.stringify(vit));
    await editRow(page, vit[0]);
    await page.click('.ds-sheet [data-cs-remove]');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    s = await screen(page);
    t('and removed, with a note that its log entries stay', !s.rows.some((r) => r[1] === 'Vitamin D3') && s.count === '6' &&
      /removed\. Its log entries stay\./.test(await page.textContent('#tl-toast')));
    await page.click('#tl-toast .ds-toast-action');
    s = await screen(page);
    t('Undo puts it back', s.rows.some((r) => r[1] === 'Vitamin D3') && s.count === '7');
    d = await record(page);
    t('adding and removing are not dose changes', d.doseChanges.length === 1, String(d.doseChanges.length));

    /* The rows. */
    await page.click('[data-pc="ix"]');
    await page.waitForTimeout(200);
    const ix = await page.evaluate(() => ({ route: tlRoute, shown: document.getElementById('tool-interact').offsetParent !== null,
      a: document.getElementById('ix-d1').value, b: document.getElementById('ix-d2').value, result: document.getElementById('ix-result').textContent.length > 0,
      seg: !!document.querySelector('#page-tools .seg') && document.querySelector('#page-tools .seg').offsetParent !== null }));
    t('Interactions opens the checker with the stack\'s flagged pair chosen and checked', ix.route === 'library/interactions' && ix.shown && ix.a && ix.b && ix.result && !ix.seg, JSON.stringify(ix));
    await page.click('#tl-top [data-tl-back]');
    t('and Back returns to Protocol', await page.evaluate(() => tlRoute) === 'protocol');

    await page.click('[data-pc="levels"]');
    await page.waitForTimeout(200);
    t('the full levels chart opens the old chart on its own', await page.evaluate(() => tlRoute === 'protocol/levels' &&
      document.getElementById('cyc-levels').offsetParent !== null && document.querySelector('#page-cycle .seg').offsetParent === null));
    await page.click('#tl-top [data-tl-back]');

    await page.click('[data-pc="alerts"]');
    await page.click('[data-pc="ics"]');
    t('with alerts off, Round alerts asks for permission; Add to calendar exports', JSON.stringify(await page.evaluate(() => window.__calls)) === '["permission","ics"]',
      JSON.stringify(await page.evaluate(() => window.__calls)));

    await page.click('[data-pc="templates"]');
    await page.waitForTimeout(200);
    t('Start from a template opens the templates', await page.evaluate(() => tlRoute === 'library/templates' && document.getElementById('tool-templates').offsetParent !== null &&
      document.querySelectorAll('#template-list [onclick^="loadTemplate"]').length > 0));
    await page.click('#template-list [onclick^="loadTemplate"]');
    await page.waitForSelector('#tl-confirm');
    t('loading one over a protocol asks first, and says to check doses with a physician', /physician/.test(await page.textContent('#tl-confirm')));
    await page.click('#tl-confirm button:has-text("Use template")');
    await page.waitForTimeout(300);
    d = await record(page);
    s = await screen(page);
    const tname = await page.evaluate(() => { const id = /loadTemplate\('([^']+)'/.exec(document.querySelector('#template-list [onclick^="loadTemplate"]').getAttribute('onclick'))[1]; return TEMPLATES.find((x) => x.id === id).name; });
    t('confirming replaces the protocol with the template and returns to Protocol', s.route === 'protocol' && d.protocol.name === tname && /physician/.test(await page.textContent('#tl-toast')),
      JSON.stringify([s.route, d.protocol.name]));

    /* Name, start and length; then clearing. */
    await page.click('[data-pc="details"]');
    await page.waitForSelector('#tl-pd-name');
    await page.fill('#tl-pd-name', 'Winter block');
    await page.fill('#tl-pd-weeks', 'twelve');
    await page.click('.ds-sheet button[type="submit"]');
    t('a length that is not a number of weeks is refused', /number of weeks/.test(await page.textContent('.ds-sheet .tl-cs-error')));
    await page.fill('#tl-pd-weeks', '8');
    await page.fill('#tl-pd-start', '2026-11-02');
    await page.click('.ds-sheet button[type="submit"]');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    d = await record(page);
    s = await screen(page);
    t('name, start and length are stored and shown', d.protocol.name === 'Winter block' && d.protocol.weeks === 8 && d.protocol.start === '2026-11-02' &&
      /Winter block/.test(s.sub) && /week 3 of 8, started 2 Nov/.test(s.sub), s.sub);
    await page.click('[data-pc="details"]');
    await page.click('.ds-sheet [data-pd-clear]');
    await page.waitForSelector('#tl-confirm');
    await page.click('#tl-confirm button:has-text("Clear protocol")');
    await page.waitForTimeout(300);
    s = await screen(page);
    d = await record(page);
    t('clearing asks first, then empties the protocol and its stored model', s.count === '0' && !d.proto && !d.protocol && /No compounds yet/.test(await page.textContent('.tl-proto')),
      JSON.stringify([s.count, !!d.proto, !!d.protocol]));

    /* The old app's own way to its cycle page lands here. */
    await page.evaluate(() => { tlGo('today'); showPage('cycle'); });
    await page.waitForTimeout(100);
    t('the old app opening its cycle page lands on the new Protocol', await page.evaluate(() => tlRoute === 'protocol' && document.body.classList.contains('tl-new-screen') && !!document.querySelector('.tl-proto')));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, [errors, dialogs].join(' | ').slice(0, 300));
    await context.close();
  }

  /* ===== a free user ===== */
  {
    const { context, page, errors } = await open(browser, base, { hash: '#/today' });
    await page.click('#tl-tabs [data-ds-tab="protocol"]');
    await page.waitForTimeout(200);
    const s = await screen(page);
    t('the Protocol tab is free: the stack editor is capture', s.route === 'protocol' && s.newScreen && !(await page.$('#tl-upgrade-overlay')));
    const pro = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-pc-rows .ds-row')).filter((r) => r.querySelector('.ds-tag') && r.querySelector('.ds-tag').textContent === 'Pro').map((r) => r.getAttribute('data-pc')));
    t('the full levels chart says Pro; templates say peptides are free', pro.join() === 'levels' &&
      /Peptides free/.test(await page.textContent('[data-pc="templates"]')), pro.join());
    await page.click('[data-pc="levels"]');
    await page.waitForTimeout(200);
    t('and the levels chart is gated, leaving them on Protocol', await page.evaluate(() => !!document.getElementById('tl-upgrade-overlay') && tlRoute === 'protocol'));
    await page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });

    await page.click('[data-pc="templates"]');
    await page.waitForTimeout(200);
    const tpl = await page.evaluate(() => ({
      route: tlRoute, overlay: !!document.getElementById('tl-upgrade-overlay'),
      cards: Array.from(document.querySelectorAll('#template-list .card')).map((c) => ({
        name: c.querySelector('div[style*="font-size:16px"]').textContent.trim(),
        tag: (c.querySelector('.tl-tpl-tag') || {}).textContent || '',
        load: !!c.querySelector('[onclick^="loadTemplate"]'),
        doses: /mcg|mg|IU/.test(c.textContent)
      }))
    }));
    const free = tpl.cards.filter((c) => c.tag === 'Free'), locked = tpl.cards.filter((c) => c.tag === 'Pro');
    t('free: templates open without the upgrade screen', tpl.route === 'library/templates' && !tpl.overlay, JSON.stringify([tpl.route, tpl.overlay]));
    t('  the peptide-only templates come first, marked Free, with their doses and a Load button',
      free.length === 3 && tpl.cards.slice(0, 3).every((c) => c.tag === 'Free' && c.load && c.doses) &&
      free.map((c) => c.name).join('|') === '🩹 Injury Recovery Protocol|⏳ Anti-Aging GH Protocol|🧬 Female Peptide Protocol', free.map((c) => c.name).join('|'));
    t('  every other template says Pro, names its compounds, and shows no doses', locked.length === tpl.cards.length - 3 &&
      locked.every((c) => !c.load && !c.doses), JSON.stringify(locked.filter((c) => c.load || c.doses)).slice(0, 200));
    await page.click('#template-list .card:nth-child(4) button');
    await page.waitForTimeout(200);
    t('  and unlocking one opens the upgrade screen', await page.evaluate(() => !!document.getElementById('tl-upgrade-overlay')));
    await page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });
    await page.click('#template-list .card:nth-child(1) [onclick^="loadTemplate"]');
    await page.waitForSelector('#tl-confirm');
    await page.click('#tl-confirm button:has-text("Use template")');
    await page.waitForTimeout(300);
    const loaded = await page.evaluate(() => ({ route: tlRoute, name: (JSON.parse(localStorage.getItem('tlv2')).protocol || {}).name, overlay: !!document.getElementById('tl-upgrade-overlay') }));
    t('  a free template loads for a free user', loaded.route === 'protocol' && loaded.name === 'Injury Recovery Protocol' && !loaded.overlay, JSON.stringify(loaded));
    t('  a Pro template cannot be loaded by calling it directly', await page.evaluate(() => {
      loadTemplate('trt-starter');
      return !!document.getElementById('tl-upgrade-overlay') && JSON.parse(localStorage.getItem('tlv2')).protocol.name === 'Injury Recovery Protocol';
    }));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light', paid: true });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Protocol fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'protocol-light-320', true);
    await editRow(page, 'bpc');
    f = await fit(page, '.ds-sheet');
    t('  and its edit sheet, supply included', fitOk(f), fitDetail(f));
    await shot(page, 'edit-light-320');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-protocol: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
