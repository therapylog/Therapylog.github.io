#!/usr/bin/env node
/* The Log sheet and the injection-site map, in a browser (src/ui/log-sheet.js,
 * site-map.js).
 *
 * On the demo patient's record, with the clock fixed: the centre button
 * opens the sheet without going anywhere; the due card logs its round; the
 * tiles open their forms, Pro marked for free users only; the dose form
 * starts on the user's own protocol amount and saves by ticking off that
 * compound's next pending dose, with the longest-rested site; the map shows
 * the route's sites in their rest colours, picks by tap and by keyboard,
 * flips to the longest-rested site, keeps the form across the trip, and logs
 * "here". Then fit in the light theme at 320 px.
 *
 *   node scripts/ui-check-log.js
 *   SHOTS=dir node scripts/ui-check-log.js     also save screenshots
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-log: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const SHOTS = process.env.SHOTS || null;
const DEMO = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'demo-backup.json'), 'utf8')).data;
const SITES = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'figures', 'injection-sites.json'), 'utf8')).sites;

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

/* Thursday 19 November 2026, 21:50: every round so far is pending. */
const CLOCK = new Date(2026, 10, 19, 21, 50, 0);

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
  await page.goto(base + '/app.html#/today', { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('tl-shell') && !!document.getElementById('tl-tabs').firstChild);
  await page.waitForTimeout(250);
  return { context, page, errors, dialogs };
}

const shot = async (page, name) => {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
};
const record = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null'));
const openSheet = async (page) => { await page.click('#tl-tabs [data-ds-tab="log"]'); await page.waitForSelector('.ds-sheet .tl-log'); };

const fit = (page, sel) => page.evaluate((sel) => {
  const box = document.querySelector(sel);
  const out = { unnamed: [], small: [], tiny: [], overflow: 0 };
  if (!box) return { missing: sel };
  box.querySelectorAll('button,a,input,select,textarea').forEach((el) => {
    if (el.offsetParent === null) return;
    /* A site marker takes no taps (the figure picks the nearest site); it is
       there for the keyboard. A segmented option's tap area is the control. */
    if (getComputedStyle(el).pointerEvents === 'none') return;
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
  out.overflow = Math.max(0, document.documentElement.scrollWidth - innerWidth, box.scrollWidth - box.clientWidth);
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
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true, record: Object.assign({}, DEMO, { settings: { figure: 'female' } }) });
    const DAY = await page.evaluate(() => tlDayKey(new Date()));

    await openSheet(page);
    let s = await page.evaluate(() => ({
      route: tlRoute, label: document.querySelector('.ds-sheet').getAttribute('aria-label'),
      focus: document.activeElement && document.activeElement.textContent,
      due: (document.querySelector('.tl-log-due') || {}).textContent || '',
      pro: document.querySelectorAll('.tl-log-pro').length,
      tiles: Array.from(document.querySelectorAll('.tl-log-tile-l')).map((n) => n.textContent)
    }));
    t('the centre button opens the Log sheet over Today, focus on its title', s.route === 'today' && s.label === 'Log' && s.focus === 'Log', JSON.stringify(s).slice(0, 160));
    t('the due card is the next round with anything pending', /Due at 08:00/.test(s.due) && /Morning round · 4 to log/.test(s.due) && /Log morning round/.test(s.due), s.due);
    t('eight tiles, in the design\'s order', s.tiles.join() === 'Dose,Weight,BP,Labs,Symptom,Photo,Measure,Scan', s.tiles.join());
    t('a paid user sees no "Pro" labels', s.pro === 0);
    await shot(page, 'log-sheet-dark-390');

    await page.click('.tl-log-due [data-log="round"]');
    let d = await record(page);
    s = await page.evaluate(() => ({ saved: (document.querySelector('.tl-log-saved') || {}).textContent || '', due: document.querySelector('.tl-log-due').textContent }));
    t('"Log morning round" logs the round and says so', d.entries.filter((e) => e.slot === 'am' && e.day === DAY).length === 4 && /Saved · Morning round, 4 doses/.test(s.saved), s.saved);
    t('and the card moves on to the next round', /Evening round/.test(s.due), s.due);
    t('Today, under the sheet, follows', await page.evaluate(() => /^4 of/.test(document.querySelector('.tl-sec-note').textContent)));

    /* The dose form. */
    await page.click('[data-log-tile="dose"]');
    s = await page.evaluate(() => ({
      title: document.querySelector('.tl-log h2').textContent, focus: document.activeElement === document.querySelector('.tl-log h2'),
      chip: (document.querySelector('.tl-log-chips [aria-pressed="true"]') || {}).textContent,
      amount: document.getElementById('tl-log-amount').value, unit: document.getElementById('tl-log-unit').value,
      inputmode: document.getElementById('tl-log-amount').inputMode,
      help: document.querySelector('.tl-log-form .ds-small').textContent,
      time: document.querySelector('.tl-log-line').textContent,
      site: (document.querySelector('.tl-log-form .ds-row') || {}).textContent || ''
    }));
    t('Dose opens the form on the compound due next', s.title === 'Log a dose' && s.focus && s.chip === 'BPC-157', JSON.stringify(s).slice(0, 200));
    t('the dose is the user\'s own protocol amount, labelled as theirs, with a decimal keypad',
      s.amount === '250' && s.unit === 'mcg' && s.inputmode === 'decimal' && /From your protocol\. Change it if today was different\./.test(s.help), JSON.stringify(s));
    t('the time is now', /Now · 21:50/.test(s.time), s.time);
    t('the site row offers the longest-rested SubQ site', /Site · longest rested, SubQ/.test(s.site), s.site);
    await shot(page, 'dose-form-dark-390');

    await page.fill('#tl-log-amount', 'abc');
    await page.click('.tl-log-save');
    t('a dose that is not a number is refused, and says why', /has to be a number/.test(await page.textContent('.tl-log .tl-cs-error')));
    await page.fill('#tl-log-amount', '300');
    await page.fill('#tl-log-notes', 'Left side, no sting');
    const longest = await page.evaluate(() => tlLongestRested(TL_SITE_MAP, 'sq', gd().entries, Date.now()).site.id);
    await page.click('.tl-log-save');
    d = await record(page);
    const bpc = d.entries.find((e) => e.key === 'bpc' && e.day === DAY && e.slot === 'eve');
    t('"Save dose" ticks off that compound\'s next pending dose today', !!bpc, JSON.stringify(d.entries.slice(0, 2)).slice(0, 200));
    t('with the dose as changed, the site and the notes', bpc && bpc.dose === '300 mcg' && bpc.siteId === longest && bpc.notes === 'Left side, no sting' && !!bpc.site, JSON.stringify(bpc));
    s = await page.evaluate(() => ({ title: document.querySelector('.tl-log h2').textContent, saved: (document.querySelector('.tl-log-saved') || {}).textContent }));
    t('and returns to the menu, saying what was saved', s.title === 'Log' && /Saved · BPC-157 300 mcg, /.test(s.saved), JSON.stringify(s));

    /* A dose with nothing pending is still recorded. */
    await page.click('[data-log-tile="dose"]');
    await page.click('.tl-log-chips .ds-chip[data-value="ai1"]').catch(() => {});
    const chosen = await page.evaluate(() => (document.querySelector('.tl-log-chips [aria-pressed="true"]') || {}).getAttribute && document.querySelector('.tl-log-chips [aria-pressed="true"]').getAttribute('data-value'));
    await page.click('.tl-log-save');
    d = await record(page);
    const extra = d.entries.filter((e) => e.key === chosen && e.day === undefined && !e.slot);
    t('a dose of a compound with none pending today is recorded on its own', extra.length === 1, chosen + ' ' + JSON.stringify(extra).slice(0, 160));

    /* The map. */
    await page.click('[data-log-tile="dose"]');
    await page.click('.tl-log-chips .ds-chip[data-value="tc"]');
    await page.fill('#tl-log-notes', 'kept across the map');
    await page.click('.tl-log-form [data-log="map"]');
    await page.waitForSelector('.tl-map');
    s = await page.evaluate(() => ({
      sheet: document.querySelectorAll('.tl-log').length, title: document.querySelector('.tl-map h1').textContent,
      focus: document.activeElement === document.querySelector('.tl-map h1'),
      view: document.querySelector('[data-ds-seg="View"] [aria-checked="true"]').getAttribute('data-value'),
      markers: Array.from(document.querySelectorAll('.tl-map .tl-fig .tl-site')).map((m) => m.getAttribute('data-site')),
      fig: getComputedStyle(document.querySelector('.tl-fig-img')).webkitMaskImage || getComputedStyle(document.querySelector('.tl-fig-img')).maskImage,
      chips: Array.from(document.querySelectorAll('.tl-map-chips .ds-chip')).map((c) => c.textContent),
      card: (document.querySelector('.tl-map-card') || {}).textContent || ''
    }));
    const imFront = SITES.filter((x) => x.route === 'im' && x.view === s.view).map((x) => x.id).sort();
    t('the map opens in place of the sheet, focus on its title', s.sheet === 0 && s.title === 'Injection site' && s.focus, JSON.stringify(s).slice(0, 160));
    t('it shows the IM sites of the view, for an IM compound', JSON.stringify(s.markers.slice().sort()) === JSON.stringify(imFront), s.markers.join());
    t('on the chosen figure, female, from settings', /female-/.test(s.fig), s.fig);
    t('the chips are today\'s injected compounds with their route', s.chips.includes('Testosterone Cypionate · IM') && s.chips.some((c) => /· SubQ$/.test(c)), s.chips.join(' | '));
    t('it starts on the longest-rested site, with its rest in words', /Rested\.|Not used yet\.|rest ends in/.test(s.card) && /Log Testosterone Cypionate here/.test(s.card), s.card);
    await shot(page, 'map-dark-390');

    /* Tap the figure near a site, off the marker. */
    const onNow = await page.evaluate(() => { const o = document.querySelector('.tl-site-on'); return o && o.getAttribute('data-site'); });
    const target = SITES.find((x) => x.route === 'im' && x.view === s.view && x.id !== onNow);
    const box = await page.locator('.tl-map .tl-fig').boundingBox();
    await page.mouse.click(box.x + target.x * box.width + 4, box.y + target.y * box.height + 3);
    t('a tap near a site picks it', await page.evaluate((id) => !!document.querySelector('.tl-site-on[data-site="' + id + '"]'), target.id), target.id);
    await page.mouse.click(box.x + 2, box.y + 2);
    t('a tap far from any site changes nothing', await page.evaluate((id) => !!document.querySelector('.tl-site-on[data-site="' + id + '"]'), target.id));
    await page.click('[data-ds-seg="View"] [data-value="back"]');
    const back = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-map .tl-fig .tl-site')).map((m) => m.getAttribute('data-site')).sort());
    t('Back shows the back view\'s IM sites', JSON.stringify(back) === JSON.stringify(SITES.filter((x) => x.route === 'im' && x.view === 'back').map((x) => x.id).sort()), back.join());
    const restId = await page.evaluate(() => tlLongestRested(TL_SITE_MAP, 'im', gd().entries, Date.now()).site);
    await page.click('[data-map="rest"]');
    t('"Longest rested" selects that site and turns the figure to it', await page.evaluate((r) =>
      !!document.querySelector('.tl-site-on[data-site="' + r.id + '"]') && document.querySelector('[data-ds-seg="View"] [aria-checked="true"]').getAttribute('data-value') === r.view, restId), restId.id);
    /* The keyboard reaches each marker. */
    const other = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-map .tl-fig .tl-site:not(.tl-site-on)'))[0].getAttribute('data-site'));
    await page.focus(`.tl-map [data-site="${other}"]`);
    await page.keyboard.press('Enter');
    t('a marker is a button: Enter picks it, and its name says its state', await page.evaluate((id) => {
      const b = document.querySelector('.tl-site-on[data-site="' + id + '"]');
      return !!b && b.getAttribute('aria-pressed') === 'true' && /, (rested|recovering|used under 48 hours ago|not used yet)$/.test(b.getAttribute('aria-label'));
    }, other), other);
    await page.keyboard.press('Escape');
    await page.waitForSelector('.ds-sheet .tl-log-form');
    t('Escape on the map returns to the form as it was', await page.evaluate(() => document.getElementById('tl-log-notes').value === 'kept across the map' &&
      document.querySelector('.tl-log-chips [aria-pressed="true"]').getAttribute('data-value') === 'tc'));
    t('  with the site picked on the map', /your choice/.test(await page.textContent('.tl-log-form .ds-row')));

    await page.click('.tl-log-form [data-log="map"]');
    await page.waitForSelector('.tl-map');
    const here = await page.evaluate(() => document.querySelector('.tl-site-on').getAttribute('data-site'));
    await page.click('[data-map="log"]');
    await page.waitForSelector('.ds-sheet .tl-log-saved');
    d = await record(page);
    const tc = d.entries.find((e) => e.key === 'tc' && e.siteId === here && e.notes === 'kept across the map');
    t('"Log Testosterone Cypionate here" logs it at that site, with the form\'s notes', !!tc, JSON.stringify(d.entries[0]).slice(0, 200));
    await page.click('[data-log-tile="dose"]');
    await page.click('.tl-log-chips .ds-chip[data-value="tc"]');
    await page.click('.tl-log-form [data-log="map"]');
    await page.waitForSelector('.tl-map');
    t('that site now shows as used under 48 hours', await page.evaluate((id) => {
      const fig = document.querySelector('[data-ds-seg="View"] [aria-checked="true"]');
      const m = document.querySelector('.tl-map [data-site="' + id + '"]');
      return !m || m.classList.contains('tl-site-recent');
    }, here));
    await page.keyboard.press('Escape');
    await page.waitForSelector('.ds-sheet');
    await page.keyboard.press('Escape');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });

    /* The other tiles. */
    for (const [tile, route] of [['weight', 'log'], ['labs', 'log/labs'], ['measure', 'health/body'], ['photo', 'health/photos'], ['bp', 'health/bp'], ['symptom', 'log/symptom']]) {
      await openSheet(page);
      await page.click(`[data-log-tile="${tile}"]`);
      await page.waitForTimeout(200);
      const r = await page.evaluate(() => ({ route: tlRoute, sheet: document.querySelectorAll('.ds-sheet').length }));
      t(`the ${tile} tile opens ${route}`, r.route === route && r.sheet === 0, JSON.stringify(r));
    }
    t('the labs form has no old tab row over it', !(await page.evaluate(() => { tlGo('log/labs'); const seg = document.querySelector('#page-log .seg'); return seg && seg.offsetParent !== null; })));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, [errors, dialogs].join(' | ').slice(0, 300));
    await context.close();
  }

  /* ===== a free user ===== */
  {
    const { context, page, errors } = await open(browser, base, {});
    await openSheet(page);
    const pro = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-log-tile')).filter((b) => b.querySelector('.tl-log-pro')).map((b) => b.getAttribute('data-log-tile')));
    t('a free user sees "Pro" on BP, Symptom, Photo and Scan', pro.join() === 'bp,symptom,photo,scan', pro.join());
    await page.click('[data-log-tile="bp"]');
    await page.waitForTimeout(200);
    t('and BP opens the upgrade screen, leaving them where they were', await page.evaluate(() => !!document.getElementById('tl-upgrade-overlay') && tlRoute === 'today'));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light', paid: true });
    await openSheet(page);
    let f = await fit(page, '.ds-sheet');
    t('light at 320 px: the sheet fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'log-sheet-light-320');
    await page.click('[data-log-tile="dose"]');
    f = await fit(page, '.ds-sheet');
    t('  the dose form too', fitOk(f), fitDetail(f));
    await shot(page, 'dose-form-light-320');
    await page.click('.tl-log-form [data-log="map"]');
    await page.waitForSelector('.tl-map');
    f = await fit(page, '.tl-layer .ds-sheet');
    t('  and the map', fitOk(f), fitDetail(f));
    await shot(page, 'map-light-320');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-log: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
