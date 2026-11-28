#!/usr/bin/env node
/* Today, Customize Home and round alerts, in a browser (src/ui/today.js,
 * round-alerts.js).
 *
 * On the demo patient's record, with the clock fixed: the hero views, the
 * day's rounds as tlRoundsFor has them, ticking and unticking a dose, "Log
 * all" and its Undo, the hero menu and dots, the lab flags row, the old app's
 * own navigation landing on Today, the round-due banner, a round alert
 * notification with its "Log round" and "Undo" actions, and an action that
 * arrives in the address. Then Customize Home: views and sections switched
 * and reordered, round times and alerts written to the protocol. Then an
 * empty record, and fit in the light theme at 320 px.
 *
 *   node scripts/ui-check-today.js
 *   SHOTS=dir node scripts/ui-check-today.js     also save screenshots
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-today: playwright is not installed — skipping.'); process.exit(0); }
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

/* A paid plan, so no gate gets in the way of a route this checks. */
const PAID = (now) => JSON.stringify({ tier: 'pro', status: 'active', expires: null, plan: 'yearly', lifetime: false,
  willRenew: true, key: 'TL-TEST-TEST-TEST', email: null, verifiedAt: now - 60000, source: 'license' });

/* Thursday 19 November 2026, 08:30, local time: the morning round is due. */
const CLOCK = new Date(2026, 10, 19, 8, 30, 0);

async function open(browser, base, opts) {
  const context = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, serviceWorkers: 'block' });
  if (opts.notify) {
    await context.grantPermissions(['notifications'], { origin: base });
    /* Some headless builds (CI's among them) report notifications as denied
       whatever is granted. The check captures notifications rather than
       showing them (fireNotification is replaced below), so it only needs the
       app to believe it may send them. */
    await context.addInitScript(() => {
      try { Object.defineProperty(window, 'Notification', { configurable: true, value: Object.assign(function () {}, { permission: 'granted', requestPermission: () => Promise.resolve('granted') }) }); } catch (e) {}
    });
  }
  const page = await context.newPage();
  const errors = [], dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  if (opts.clock !== false) await page.clock.install({ time: opts.clock || CLOCK });
  await page.addInitScript(([record, theme, ent]) => {
    try {
      if (sessionStorage.getItem('tl-test-seeded')) return;
      sessionStorage.setItem('tl-test-seeded', '1');
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-theme', theme);
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
      if (record) localStorage.setItem('tlv2', record);
      if (ent) localStorage.setItem('tl_ent', ent);
    } catch (e) {}
  }, [opts.record ? JSON.stringify(opts.record) : null, opts.theme || 'dark', opts.free ? null : PAID(CLOCK.getTime())]);
  await page.goto(base + '/app.html' + (opts.hash || '#/today'), { waitUntil: 'load' });
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
const today = (page) => page.evaluate(() => {
  const x = tlTodayData();
  return {
    route: tlRoute, newScreen: document.body.classList.contains('tl-new-screen'),
    dashboard: (() => { const el = document.getElementById('page-dashboard'); return !!el && el.offsetParent !== null; })(),
    heroes: Array.from(document.querySelectorAll('.tl-hero-card')).map((c) => c.getAttribute('aria-label')),
    title: (document.querySelector('.tl-hero-title span') || {}).textContent || null,
    rounds: Array.from(document.querySelectorAll('.tl-round-h-t')).map((n) => n.textContent),
    doses: Array.from(document.querySelectorAll('.tl-dose-name')).map((n) => n.textContent),
    tally: (document.querySelector('.tl-sec-note') || {}).textContent || null,
    want: {
      rounds: x.rounds.map((r) => r.label + ' · ' + r.time + (r.alert ? '' : ' · alert off')),
      doses: [].concat.apply([], x.rounds.map((r) => r.doses.map((d) => d.name))),
      tally: (() => { const s = tlRoundsTally(x.rounds); return s.done + ' of ' + s.total + ' logged'; })()
    },
    sections: Array.from(document.querySelectorAll('.tl-today > .tl-sec')).map((s) => s.getAttribute('aria-label'))
  };
});

const fit = (page, sel) => page.evaluate((sel) => {
  const box = document.querySelector(sel);
  const out = { unnamed: [], small: [], tiny: [], overflow: 0 };
  if (!box) return out;
  box.querySelectorAll('button,a,input,select').forEach((el) => {
    if (el.offsetParent === null) return;
    const r = (el.closest('.ds-seg') || el).getBoundingClientRect();
    const name = (el.getAttribute('aria-label') || el.textContent || el.value || '').trim();
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
const fitOk = (f) => !f.unnamed.length && !f.small.length && !f.tiny.length && f.overflow <= 0;
const fitDetail = (f) => JSON.stringify(f).slice(0, 300);

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== the demo record ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { record: DEMO, notify: true });
    await page.evaluate(() => { window.__notes = []; window.fireNotification = (title, o) => window.__notes.push({ title, o }); });
    const DAY = await page.evaluate(() => tlDayKey(new Date()));

    let s = await today(page);
    t('Today is the new screen, and the old dashboard is out of sight', s.route === 'today' && s.newScreen && !s.dashboard, JSON.stringify(s).slice(0, 200));
    t('the hero shows the views this record has something for: Levels, In your system, Labs (no inventory entered, so no Supply)',
      JSON.stringify(s.heroes) === JSON.stringify(['Levels', 'In your system', 'Labs']), JSON.stringify(s.heroes));
    t('the rounds are tlRoundsFor\'s, in time order', JSON.stringify(s.rounds) === JSON.stringify(s.want.rounds) && s.rounds.length > 0, JSON.stringify([s.rounds, s.want.rounds]));
    t('and so are their doses', JSON.stringify(s.doses) === JSON.stringify(s.want.doses), JSON.stringify(s.doses));
    t('the header counts what is logged', s.tally === s.want.tally, s.tally);
    t('sections in the design\'s order', JSON.stringify(s.sections) === JSON.stringify(['Today', 'Inventory', 'Lab flags']), JSON.stringify(s.sections));
    await shot(page, 'today-dark-390', true);

    /* Ticking a dose. */
    const first = await page.$eval('.tl-dose-check[aria-pressed="false"]', (b) => b.getAttribute('data-dose'));
    await page.click(`.tl-dose-check[data-dose="${first}"]`);
    let d = await record(page);
    const [key, slot, day] = first.split(':');
    let e = d.entries.find((x) => x.type === 'medication' && x.key === key && x.slot === slot && x.day === day);
    t('ticking a dose logs it, with its compound, round and day', !!e, first);
    t('its row says when, and focus stays on its check',
      await page.evaluate((id) => {
        const b = document.querySelector('.tl-dose-check[data-dose="' + id + '"]');
        return b.getAttribute('aria-pressed') === 'true' && document.activeElement === b && /Logged 08:30/.test(b.closest('.tl-dose').textContent);
      }, first));
    s = await today(page);
    t('the count goes up by one', s.tally === s.want.tally && /^1 of/.test(s.tally), s.tally);
    await page.click(`.tl-dose-check[data-dose="${first}"]`);
    d = await record(page);
    t('ticking it again takes it back, and logs nothing else', !d.entries.some((x) => x.type === 'medication' && x.day === day && x.key === key) &&
      /^0 of/.test((await today(page)).tally));
    /* A redraw must not add a second listener: after several, one tap is still one toggle. */
    for (let i = 0; i < 3; i++) await page.evaluate(() => tlTodayRefresh());
    await page.click(`.tl-dose-check[data-dose="${first}"]`);
    t('after several redraws, one tap still ticks once', (await record(page)).entries.filter((x) => x.type === 'medication' && x.day === day && x.key === key).length === 1);
    await page.click(`.tl-dose-check[data-dose="${first}"]`);

    /* Log all, and Undo. */
    const many = await page.$('.tl-log-all');
    if (many) {
      const r = await page.evaluate(() => {
        const b = document.querySelector('.tl-log-all');
        return { slot: b.getAttribute('data-log-round'), n: +b.textContent.replace(/\D/g, '') };
      });
      const before = (await record(page)).entries.length;
      await many.click();
      d = await record(page);
      const toast = await page.textContent('#tl-toast .ds-toast-text').catch(() => '');
      t('"Log all" logs every pending dose in the round at once', d.entries.length === before + r.n, `${before} -> ${d.entries.length}, ${r.n}`);
      t('and says so, with Undo', new RegExp('round logged · ' + r.n + ' doses at 08:30').test(toast), toast);
      await page.click('#tl-toast .ds-toast-action');
      d = await record(page);
      t('Undo takes back exactly those doses', d.entries.length === before);
    } else t('the demo record has a round with two doses pending', false);

    /* The hero. */
    await page.click('.tl-dot[data-hero="2"]');
    await page.waitForTimeout(500);
    s = await today(page);
    t('a dot moves the hero, and the title follows', s.title === 'Labs' &&
      await page.evaluate(() => document.querySelector('.tl-dot[data-hero="2"]').getAttribute('aria-current') === 'true'), s.title);
    await page.click('[data-hero-menu]');
    t('the title opens a menu of the views, focus on the first', await page.evaluate(() => {
      const m = document.querySelector('.tl-hero-menu');
      return !m.hidden && document.querySelector('[data-hero-menu]').getAttribute('aria-expanded') === 'true' &&
        document.activeElement === m.querySelector('button') && /Choose what shows here/.test(m.textContent);
    }));
    await page.keyboard.press('Escape');
    t('Escape closes it and returns focus', await page.evaluate(() => document.querySelector('.tl-hero-menu').hidden &&
      document.activeElement === document.querySelector('[data-hero-menu]')));
    await page.click('[data-hero-menu]');
    await page.click('.tl-hero-menu [data-hero="0"]');
    await page.waitForTimeout(500);
    t('a view chosen from the menu shows', (await today(page)).title === 'Levels');
    const chips = await page.$$eval('.tl-hero-chips .ds-chip', (b) => b.map((x) => x.textContent));
    if (chips.length > 1) {
      await page.click(`.tl-hero-chips .ds-chip[data-value="${chips[1]}"]`);
      t('a compound chip switches the Levels view', (await page.textContent('.tl-lv-of')).includes(chips[1]), chips[1]);
    }
    t('the Levels view says it is an estimate', /Estimate from your logged doses, not a measurement/.test(await page.textContent('.tl-hero-card[aria-label="Levels"]')));
    await shot(page, 'today-hero-dark-390');

    await page.click('.tl-sec[aria-label="Lab flags"] button');
    t('the lab flags row opens Bloodwork', await page.evaluate(() => tlRoute) === 'health/bloodwork');

    /* The round-due banner: everywhere but Today. */
    await page.evaluate(() => tlGo('library/compounds'));
    const banner = await page.evaluate(() => { const b = document.getElementById('tl-due'); return b && { text: b.textContent, slot: b.getAttribute('data-slot') }; });
    t('away from Today, a round that is due shows a banner', banner && banner.slot === 'am' && /Morning round/.test(banner.text) && /Log morning round/.test(banner.text), JSON.stringify(banner));
    await shot(page, 'banner-dark-390');
    await page.evaluate(() => tlGo('today'));
    t('Today has no banner: the round is listed right there', !(await page.$('#tl-due')));
    await page.evaluate(() => tlGo('library/compounds'));
    await page.click('#tl-due [data-due="log"]');
    d = await record(page);
    t('"Log morning round" on the banner logs the round, and the banner goes',
      !(await page.$('#tl-due')) && d.entries.some((x) => x.slot === 'am' && x.day === DAY), '');

    /* The old app navigating by itself away from Today: Today goes. */
    await page.evaluate(() => { tlGo('today'); showPage('history'); });
    await page.waitForTimeout(100);
    t('when the old app opens one of its pages from Today, Today is cleared away', await page.evaluate(() =>
      tlRoute === 'history' && !document.querySelector('#tl-screen .tl-today') && !document.body.classList.contains('tl-new-screen') &&
      document.getElementById('page-history').offsetParent !== null));

    /* The old app's own navigation lands on the new Today. */
    await page.evaluate(() => showHub('home', document.getElementById('nav-home')));
    await page.waitForTimeout(100);
    s = await today(page);
    t('the old app going "home" lands on the new Today', s.route === 'today' && s.newScreen && !s.dashboard &&
      await page.evaluate(() => location.hash) === '#/today', JSON.stringify(s).slice(0, 160));

    /* A round alert, as a notification. */
    await page.clock.fastForward('11:00:00');          /* 19:30 */
    await page.evaluate(() => { window.__notes = []; tlRoundReminders(); });
    await page.clock.fastForward('31:00');             /* 20:01 */
    const notes = await page.evaluate(() => window.__notes);
    const eve = notes.find((n) => n.o && n.o.data && n.o.data.kind === 'round');
    t('at a round\'s time, one notification for the whole round', eve && /round ·/.test(eve.title) && eve.o.data.day === DAY, JSON.stringify(notes).slice(0, 200));
    t('carrying "Log {round} round" and "Open"', eve && JSON.stringify(eve.o.actions.map((a) => a.action)) === '["log","open"]' && /^Log \w+ round$/.test(eve.o.actions[0].title));
    const fired = (await record(page)).remindersFired || {};
    t('and remembered, so a reload does not send it twice', eve && fired['round:' + eve.o.data.slot + ':' + DAY] === true);
    if (eve) {
      const before = (await record(page)).entries.length;
      await page.evaluate((x) => { window.__notes = []; tlRoundAction('log', x.slot, x.day); }, eve.o.data);
      d = await record(page);
      const after = await page.evaluate(() => window.__notes);
      t('its "Log round" action logs the round', d.entries.length > before);
      t('and replaces the alert with "logged", with Undo', after.length === 1 && /round logged$/.test(after[0].title) && after[0].o.actions[0].action === 'undo', JSON.stringify(after).slice(0, 200));
      await page.evaluate((x) => tlRoundAction('undo', x.slot, x.day), eve.o.data);
      t('and Undo takes it back', (await record(page)).entries.length === before);
    }
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, [errors, dialogs].join(' | ').slice(0, 300));
    await context.close();
  }

  /* ===== an action arriving in the address ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO });
    const DAY = await page.evaluate(() => tlDayKey(new Date()));
    await page.close();
    const p2 = await context.newPage();
    p2.on('pageerror', (e) => errors.push(e.message));
    await p2.route('**/*', (route) => (route.request().url().startsWith(base + '/') ? route.continue() : route.abort()));
    await p2.clock.install({ time: CLOCK });
    await p2.goto(base + '/app.html#/today?round=log:am:' + DAY, { waitUntil: 'load' });
    await p2.waitForFunction(() => document.body.classList.contains('tl-shell'));
    await p2.waitForTimeout(300);
    const d = await record(p2);
    t('a "Log round" that opened the app logs the round, and the address is tidied', d.entries.some((x) => x.slot === 'am' && x.day === DAY) &&
      await p2.evaluate(() => location.hash) === '#/today');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== Customize Home ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO });
    await page.click('.tl-home-custom');
    const chrome = await page.evaluate(() => ({
      route: tlRoute, top: getComputedStyle(document.getElementById('tl-top')).display, tabs: getComputedStyle(document.getElementById('tl-tabs')).display,
      title: document.querySelector('.tl-custom h1').textContent
    }));
    t('Customize Home is its own screen: title and Done, no tab bar', chrome.route === 'home/customize' && chrome.top === 'none' && chrome.tabs === 'none' && chrome.title === 'Customize Home', JSON.stringify(chrome));
    await shot(page, 'customize-dark-390', true);

    await page.click('#tl-home-hero-system');
    let d = await record(page);
    t('switching a view off is stored', d.settings && d.settings.home && d.settings.home.hero.find((x) => x.key === 'system').on === false);
    await page.focus('.tl-handle[data-move="hero:labs"]');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    d = await record(page);
    t('the arrow keys move a view, and the order is stored', d.settings.home.hero.map((x) => x.key).join() === 'labs,levels,system,supply' &&
      await page.evaluate(() => document.activeElement.getAttribute('data-move') === 'hero:labs'), d.settings.home.hero.map((x) => x.key).join());
    await page.click('#tl-home-sections-inventory');

    const am0 = await page.evaluate(() => tlProtocol(gd(), tlEnv()).slots.am.t);
    await page.click('.tl-custom [data-shift="am:1"]');
    d = await record(page);
    t('moving a round\'s time stores the protocol, with the old fields rewritten to match', d.protocol && d.v === 3 && d.protocol.slots.am.t === Math.floor(am0 / 15) * 15 + 15 &&
      Object.values(d.reminderTimes).some((times) => times.includes(String(Math.floor((am0 + 15) / 60)).padStart(2, '0') + ':' + String((Math.floor(am0 / 15) * 15 + 15) % 60).padStart(2, '0'))),
      JSON.stringify(d.protocol && d.protocol.slots.am));
    t('focus stays on the button', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-shift') === 'am:1'));
    await page.click('#tl-cu-alert-am');
    await page.click('#tl-cu-discreet');
    d = await record(page);
    t('a round\'s alert and discreet alerts are stored', d.protocol.slots.am.alert === false && d.protocol.discreet === true &&
      await page.evaluate(() => localStorage.getItem('tl_notif_discreet')) === '1');

    await page.click('.tl-custom-head [data-tl-back]');
    const s = await today(page);
    t('Done returns to Today', s.route === 'today');
    t('which follows the new order and switches', JSON.stringify(s.heroes) === JSON.stringify(['Labs', 'Levels']) && !s.sections.includes('Inventory'), JSON.stringify([s.heroes, s.sections]));
    t('and shows the morning round\'s alert as off', s.rounds.some((r) => /^Morning .* alert off$/.test(r)), JSON.stringify(s.rounds));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== a free user ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO, free: true });
    const hero = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-hero-card')).map((c) => ({
      label: c.getAttribute('aria-label'), locked: c.classList.contains('tl-hero-locked'),
      chart: !!c.querySelector('svg.tl-lv-chart, .tl-gauges'), pro: !!c.querySelector('.ds-tag'), text: c.textContent })));
    const lv = hero.find((h) => h.label === 'Levels'), sys = hero.find((h) => h.label === 'In your system');
    t('free: the Levels and In your system views say Pro and show no curve', lv && lv.locked && lv.pro && !lv.chart && sys && sys.locked && !sys.chart,
      JSON.stringify(hero.map((h) => [h.label, h.locked, h.chart])));
    t('  while Supply and Labs stay as they are', hero.filter((h) => h.label === 'Supply' || h.label === 'Labs').every((h) => !h.locked && !h.pro));
    t('  and say the log itself stays free', /stays free/.test(lv.text));
    await page.click('.tl-hero-locked [data-today="levels-pro"]');
    await page.waitForTimeout(200);
    t('  the button opens the upgrade screen, and Today stays put', await page.evaluate(() => !!document.getElementById('tl-upgrade-overlay') && tlRoute === 'today'));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== an empty record ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: { entries: [], proto: null } });
    const empty = await page.evaluate(() => ({ heroes: document.querySelectorAll('.tl-hero').length, text: document.querySelector('.tl-today').textContent }));
    t('with nothing in the record: no hero, and a way to start', empty.heroes === 0 && /Nothing scheduled yet/.test(empty.text), JSON.stringify(empty).slice(0, 160));
    await page.click('[data-today="add"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    await page.fill('#tl-cs-name', 'BPC-157');
    await page.fill('#tl-cs-amount', '250');
    await page.selectOption('#tl-cs-unit', 'mcg');
    await page.click('.ds-sheet .tl-cs-save');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    const d = await record(page);
    const s = await today(page);
    t('adding a compound there stores a protocol, and its round appears', d.protocol && d.protocol.compounds.length === 1 && d.protocol.name === 'My protocol' &&
      JSON.stringify(s.doses) === '["BPC-157"]', JSON.stringify([d.protocol && d.protocol.compounds.map((c) => c.name), s.doses]));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: DEMO, width: 320, theme: 'light' });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Today fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'today-light-320', true);
    for (const i of [1, 2]) {
      await page.click(`.tl-dot[data-hero="${i}"]`);
      await page.waitForTimeout(400);
      await shot(page, 'today-hero-' + i + '-light-320');
    }
    f = await fit(page, '#tl-screen');
    t('  and with each hero view showing', fitOk(f), fitDetail(f));
    const ground = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.background = 'var(--color-bg)';
      document.body.appendChild(probe);
      const want = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(document.body).backgroundColor, want, getComputedStyle(document.body, '::before').display];
    });
    t('  on the redesign\'s ground, without the old glow', ground[0] === ground[1] && ground[2] === 'none', ground.join(' / '));
    await page.click('.tl-home-custom');
    f = await fit(page, '#tl-screen');
    t('light at 320 px: Customize Home fits the same way', fitOk(f), fitDetail(f));
    await shot(page, 'customize-light-320', true);
    await page.evaluate(() => tlGo('library/compounds'));
    t('light at 320 px: the banner fits', await page.evaluate(() => { const b = document.getElementById('tl-due'); return !!b && b.getBoundingClientRect().right <= innerWidth; }));
    await shot(page, 'banner-light-320');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-today: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
