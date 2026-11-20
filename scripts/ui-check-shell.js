#!/usr/bin/env node
/* The shell and navigation, in a browser (src/ui/shell.js).
 *
 * The handoff's navigation map, old to new, checked route by route:
 *
 *   Home                       -> Today tab
 *   Log tab                    -> Log (centre button)
 *   Reference: Encyclopedia    -> Library: Compounds
 *   Reference: Tools & Calc    -> Library: Tools (and the Stack builder from there)
 *   Health: Bloodwork          -> Health: Bloodwork
 *   BP (in the Log tab)        -> Health: BP
 *   Health: Cycle / Protocol   -> Protocol tab
 *   Health: Photos             -> Health: Photos
 *   "AI" tab                   -> profile button: Settings, then Profile and History
 *   AI chat and the 🤖 button  -> the Ask bar on Today
 *   hub button grids           -> segmented controls
 *
 * Every old page has to stay reachable. Paid features have to stay gated: a
 * free user tapping BP gets the upgrade screen and stays where they were.
 *
 *   node scripts/ui-check-shell.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-shell: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

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
const DEMO = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'demo-backup.json'), 'utf8')).data;

/* A paid plan, written the way tlWriteEnt does, verified a minute ago so the
   daily re-check does not reach for the network. */
const PAID = (now) => JSON.stringify({ tier: 'pro', status: 'active', expires: null, plan: 'yearly', lifetime: false,
  willRenew: true, key: 'TL-TEST-TEST-TEST', email: null, verifiedAt: now - 60000, source: 'license' });

async function open(browser, base, opts) {
  const context = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [], dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  await page.addInitScript(([record, ent, theme]) => {
    try {
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-theme', theme);
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
      if (record && !sessionStorage.getItem('tl-test-seeded')) { localStorage.setItem('tlv2', record); sessionStorage.setItem('tl-test-seeded', '1'); }
      if (ent) localStorage.setItem('tl_ent', ent);
    } catch (e) {}
  }, [opts.record ? JSON.stringify(opts.record) : null, opts.paid ? PAID(Date.now()) : null, opts.theme || 'dark']);
  await page.goto(base + '/app.html' + (opts.hash || ''), { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('tl-shell') && !!document.getElementById('tl-tabs').firstChild);
  await page.waitForTimeout(300);
  return { context, page, errors, dialogs };
}

/* What is on screen: the route, the active tab, the title, and which old page
   is visible. */
const state = (page) => page.evaluate(() => {
  const visible = (id) => { const el = document.getElementById(id); return !!el && el.offsetParent !== null && el.getBoundingClientRect().height > 0; };
  const pages = ['page-dashboard', 'page-log', 'page-encyclopedia', 'page-tools', 'page-stack', 'page-bloodwork', 'page-cycle',
    'page-femcycle', 'page-photos', 'page-profile', 'page-ai', 'page-history', 'page-settings', 'lt-weight', 'lt-bp', 'lt-body', 'lt-meds'];
  const cur = document.querySelector('#tl-tabs [aria-current="page"]');
  const seg = document.querySelector('#tl-top .ds-seg [aria-selected="true"]');
  return {
    hash: location.hash, route: tlRoute,
    tab: cur ? cur.getAttribute('data-ds-tab') : null,
    seg: seg ? seg.getAttribute('data-value') : null,
    title: (document.querySelector('#tl-top h1') || {}).textContent || null,
    shown: pages.filter(visible),
    upgrade: !!document.getElementById('tl-upgrade-overlay')
  };
});
const closeUpgrade = (page) => page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== a paid user with the demo record ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { record: DEMO, paid: true });
    const chrome = await page.evaluate(() => ({
      oldNav: getComputedStyle(document.querySelector('.nav')).display,
      fab: getComputedStyle(document.getElementById('fab-ai')).display,
      header: getComputedStyle(document.querySelector('.header')).display,
      hubNav: Array.from(document.querySelectorAll('.hub-nav')).every((n) => getComputedStyle(n).display === 'none'),
      tabs: Array.from(document.querySelectorAll('#tl-tabs .ds-tab')).map((b) => b.getAttribute('data-ds-tab'))
    }));
    t('the five tabs, in order', chrome.tabs.join(' ') === 'today protocol log health library', chrome.tabs.join(' '));
    t('the old bottom nav, header, hub grids and floating 🤖 button are hidden',
      chrome.oldNav === 'none' && chrome.fab === 'none' && chrome.header === 'none' && chrome.hubNav);

    let s = await state(page);
    t('it opens on Today, the new screen under the Ask bar, with the old home page out of sight', s.route === 'today' && s.hash === '#/today' && s.tab === 'today' &&
      !s.shown.includes('page-dashboard') && (await page.locator('#tl-screen .tl-today').count()) === 1 &&
      (await page.locator('#tl-top .ds-askbar').count()) === 1, JSON.stringify(s));
    t('  the profile button carries the profile\'s initial', (await page.locator('#tl-top .ds-avatar').textContent()) === 'J');

    /* Every tab and segment, by tapping. */
    const tap = async (sel) => { await page.locator(sel).click(); await page.waitForTimeout(250); return state(page); };
    s = await tap('#tl-tabs [data-ds-tab="protocol"]');
    t('Protocol shows the old cycle page (protocol, reminders, week, levels)', s.route === 'protocol' && s.tab === 'protocol' && s.shown.includes('page-cycle'), s.shown.join(','));
    const before = s.route;
    s = await tap('#tl-tabs [data-ds-tab="log"]');
    t('the centre Log button opens the Log sheet over the page, without going anywhere', s.route === before &&
      (await page.locator('.ds-sheet[aria-label="Log"]').count()) === 1, JSON.stringify({ before, after: s.route }));
    await page.keyboard.press('Escape');
    await page.evaluate(() => tlGo('log')); await page.waitForTimeout(250);
    s = await state(page);
    t('  and #/log still shows the old log page, its tabs included', s.route === 'log' && s.shown.includes('page-log') && s.shown.includes('lt-weight') &&
      (await page.locator('#page-log .seg').first().isVisible()));
    s = await tap('#tl-tabs [data-ds-tab="health"]');
    t('Health opens on Bloodwork', s.route === 'health/bloodwork' && s.seg === 'bloodwork' && s.shown.includes('page-bloodwork'), s.shown.join(','));
    s = await tap('#tl-top .ds-seg-opt[data-value="bp"]');
    t('Health: BP shows the old BP log without the log page\'s own tabs', s.route === 'health/bp' && s.tab === 'health' && s.shown.includes('lt-bp') &&
      !s.shown.includes('lt-weight') && !(await page.locator('#page-log .seg').first().isVisible()));
    s = await tap('#tl-top .ds-seg-opt[data-value="body"]');
    t('Health: Body shows weight and measurements', s.route === 'health/body' && s.shown.includes('lt-weight') && s.shown.includes('lt-body') && !s.shown.includes('lt-bp'));
    s = await tap('#tl-top .ds-seg-opt[data-value="photos"]');
    t('Health: Photos shows the old progress check-ins', s.route === 'health/photos' && s.shown.includes('page-photos'));
    t('  no Cycle segment for a male profile', (await page.locator('#tl-top .ds-seg-opt[data-value="cycle"]').count()) === 0);
    s = await tap('#tl-tabs [data-ds-tab="library"]');
    t('Library opens on Compounds', s.route === 'library/compounds' && s.seg === 'compounds' && s.shown.includes('page-encyclopedia'));
    s = await tap('#tl-top .ds-seg-opt[data-value="tools"]');
    t('Library: Tools shows the old tools page', s.route === 'library/tools' && s.shown.includes('page-tools'));
    const tools = await page.evaluate(() => Array.from(document.querySelectorAll('#page-tools .seg-btn')).map((b) => (b.getAttribute('onclick') || '').match(/'([a-z]+)'/)[1]));
    t('  every tool is still on it, the PCT builder included', ['calc', 'interact', 'templates', 'body', 'symptom', 'cost', 'pct'].every((x) => tools.includes(x)), tools.join(','));
    s = await tap('#tl-tools-links [data-tl-go="library/stack"]');
    t('  and the Stack builder is a row there', s.route === 'library/stack' && s.shown.includes('page-stack') && s.title === 'Stack builder');
    s = await tap('#tl-top [data-tl-back]');
    t('  whose Back returns to Tools', s.route === 'library/tools');

    s = await tap('#tl-top .ds-avatar');
    t('the profile button opens Settings, with a Back button and no tab lit', s.route === 'settings' && s.tab === null && s.shown.includes('page-settings') &&
      (await page.locator('#tl-top [data-tl-back]').count()) === 1);
    s = await tap('#tl-settings-links [data-tl-go="profile"]');
    t('Settings leads to Profile', s.route === 'profile' && s.shown.includes('page-profile'));
    s = await tap('#tl-top [data-tl-back]');
    t('  and back to Settings', s.route === 'settings');
    s = await tap('#tl-settings-links [data-tl-go="history"]');
    t('Settings leads to History', s.route === 'history' && s.shown.includes('page-history'));
    await page.goBack(); await page.waitForTimeout(250);
    s = await state(page);
    t('the browser\'s Back button works too', s.route === 'settings' && s.shown.includes('page-settings'), s.route);

    const theme = page.locator('#tl-settings-links .ds-seg-opt[data-value="light"]');
    await theme.click(); await page.waitForTimeout(200);
    t('Settings: Appearance switches the theme, and it is kept', await page.evaluate(() => document.body.classList.contains('light-mode') && localStorage.getItem('tl-theme') === 'light'));
    await page.locator('#tl-settings-links .ds-seg-opt[data-value="dark"]').click(); await page.waitForTimeout(200);
    t('  and back', await page.evaluate(() => !document.body.classList.contains('light-mode') && localStorage.getItem('tl-theme') === 'dark'));
    s = await tap('#tl-top [data-tl-back]');
    t('Back from Settings returns to the last tab', s.route === 'library/tools', s.route);

    await page.locator('#tl-tabs [data-ds-tab="today"]').click(); await page.waitForTimeout(200);
    s = await tap('#tl-top .ds-askbar');
    t('the Ask bar opens the assistant', s.route === 'ask' && s.shown.includes('page-ai'));
    const chat = await page.evaluate(() => { const c = document.querySelector('.chat-card'); return !!c && !!c.closest('#page-ai'); });
    t('  whose chat lives inside its own page', chat);

    /* The old app navigating by itself. */
    await page.locator('#tl-tabs [data-ds-tab="today"]').click(); await page.waitForTimeout(200);
    await page.evaluate(() => showPage('bloodwork')); await page.waitForTimeout(250);
    s = await state(page);
    t('an old button that opens Bloodwork moves the tab bar and the address with it', s.route === 'health/bloodwork' && s.tab === 'health' && s.hash === '#/health/bloodwork', JSON.stringify(s));
    await page.evaluate(() => showHub('log', document.getElementById('nav-log'))); await page.waitForTimeout(250);
    s = await state(page);
    /* The centre Log button is never the current page: it opens something. */
    t('  and one that opens the log', s.route === 'log' && s.tab === null && s.hash === '#/log', JSON.stringify({ route: s.route, tab: s.tab }));

    /* Deep links. */
    await page.goto(base + '/app.html#/library/tools'); await page.waitForTimeout(500);
    s = await state(page);
    t('changing the address to #/library/tools goes there', s.route === 'library/tools' && s.seg === 'tools' && s.shown.includes('page-tools'));
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.body.classList.contains('tl-shell')); await page.waitForTimeout(600);
    s = await state(page);
    t('opening the app on #/library/tools starts there, after the old start-up has run', s.route === 'library/tools' && s.shown.includes('page-tools') &&
      !s.shown.includes('page-dashboard'), JSON.stringify(s.shown));
    await page.goto(base + '/app.html#/library'); await page.waitForTimeout(800);
    s = await state(page);
    t('a link to a tab opens its first segment', s.route === 'library/compounds' && s.hash === '#/library/compounds');
    await page.goto(base + '/app.html#/nonsense'); await page.waitForTimeout(800);
    s = await state(page);
    t('an unknown address opens Today', s.route === 'today' && s.hash === '#/today');

    t('no browser dialogs', dialogs.length === 0, dialogs.join(' | '));
    t('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await context.close();
  }

  /* ===== a free user: the paid features stay gated ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO, paid: false });
    await page.locator('#tl-tabs [data-ds-tab="health"]').click(); await page.waitForTimeout(200);
    for (const seg of ['bp', 'photos']) {
      await page.locator(`#tl-top .ds-seg-opt[data-value="${seg}"]`).click(); await page.waitForTimeout(250);
      const s = await state(page);
      t(`free: Health ${seg} opens the upgrade screen and leaves you on Bloodwork`, s.upgrade && s.route === 'health/bloodwork' && s.seg === 'bloodwork' &&
        s.hash === '#/health/bloodwork', JSON.stringify({ upgrade: s.upgrade, route: s.route, seg: s.seg }));
      await closeUpgrade(page);
    }
    await page.locator('#tl-tabs [data-ds-tab="protocol"]').click(); await page.waitForTimeout(250);
    let s = await state(page);
    t('free: the Protocol tab is gated as the old cycle page was', s.upgrade && s.route === 'health/bloodwork', s.route);
    await closeUpgrade(page);
    await page.goto(base + '/app.html#/health/bp'); await page.waitForTimeout(500);
    s = await state(page);
    t('free: changing the address to a paid route is gated, and you stay where you were', s.upgrade && s.route === 'health/bloodwork' &&
      s.hash === '#/health/bloodwork', s.route + ' ' + s.hash);
    await closeUpgrade(page);
    /* A fresh load straight onto the paid address. */
    await page.goto('about:blank');
    await page.goto(base + '/app.html#/health/bp', { waitUntil: 'load' });
    await page.waitForFunction(() => window.tlRoute !== null && document.body.classList.contains('tl-shell'));
    await page.waitForTimeout(400);
    s = await state(page);
    t('free: opening the app on a paid route is gated, and lands on Today', s.upgrade && s.route === 'today' && s.hash === '#/today', s.route + ' ' + s.hash);
    t('free: no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await context.close();
  }

  /* ===== a female profile gets the Cycle segment ===== */
  {
    const record = JSON.parse(JSON.stringify(DEMO));
    record.profile.sex = 'Female';
    const { context, page, errors } = await open(browser, base, { record, paid: true, hash: '#/health' });
    t('a female profile: Health has a fifth segment, Cycle', (await page.locator('#tl-top .ds-seg-opt[data-value="cycle"]').count()) === 1);
    await page.locator('#tl-top .ds-seg-opt[data-value="cycle"]').click(); await page.waitForTimeout(250);
    const s = await state(page);
    t('  which shows the old cycle tracker', s.route === 'health/cycle' && s.shown.includes('page-femcycle'), s.shown.join(','));
    t('  no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await context.close();
  }

  /* ===== the narrowest phone, in light ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO, paid: true, width: 320, theme: 'light', hash: '#/health' });
    const fit = await page.evaluate(() => ({
      over: Array.from(document.querySelectorAll('#tl-top *, #tl-tabs *')).filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5).map((el) => el.className),
      labels: Array.from(document.querySelectorAll('#tl-tabs .ds-tab-label')).every((l) => l.scrollWidth <= l.clientWidth + 1)
    }));
    t('320 px: the top bar and tab bar fit', fit.over.length === 0 && fit.labels, fit.over.slice(0, 3).join(', '));
    t('  no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((ok) => !ok).length;
  if (failed) { console.error(`SHELL CHECK FAILED — ${failed} of ${results.length}`); process.exit(1); }
  console.log(`shell OK: ${results.length} checks — every old page is reachable through the new tabs, paid features stay gated, links and Back work`);
})().catch((e) => { console.error('ui-check-shell: ' + (e && e.stack || e)); process.exit(2); });
