#!/usr/bin/env node
/* Health -> Bloodwork (3b), in a browser (src/ui/bloodwork.js).
 *
 * On the demo patient's record: the header's scan and "+ Log labs" buttons,
 * the panel picker and whose ranges they are, the summary (markers in range,
 * a pip each, the names below or above), every marker with its value, unit,
 * reference and a range bar placed by the design's formula, the out-of-range
 * filter, another panel, "Notify me", and where a marker, the scan button,
 * "All panels" and the report lead with and without a plan. No labs at all,
 * a profile without sex or birth date, and fit at 320 px in the light theme.
 *
 *   node scripts/ui-check-health-bloodwork.js
 *   SHOTS=dir node scripts/ui-check-health-bloodwork.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-health-bloodwork: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/health/bloodwork'), { waitUntil: 'load' });
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
    route: tlRoute, hash: location.hash, title: (document.querySelector('#tl-top h1') || {}).textContent || null,
    shown: ['page-bloodwork', 'bw-trends', 'bw-history', 'bw-overview', 'lt-labs', 'page-profile', 'prof-report', 'prof-name'].filter(vis),
    oldTabs: Array.from(document.querySelectorAll('#page-bloodwork .seg')).some((s) => s.offsetParent !== null),
    upgrade: (document.getElementById('tl-upgrade-overlay') || {}).textContent || null,
    bw: !!document.querySelector('#tl-screen .tl-bw')
  };
});
const tap = async (page, sel) => { await page.click(sel); await page.waitForTimeout(250); return where(page); };
const closeUpgrade = (page) => page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });
const screen = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const rows = Array.from(document.querySelectorAll('.tl-bw-row')).map((r) => ({
    key: r.getAttribute('data-bw-trend'), name: r.querySelector('.tl-bw-name').textContent, val: r.querySelector('.tl-bw-val').textContent,
    unit: r.querySelector('.tl-bw-unit').textContent, foot: r.querySelector('.tl-bw-row-foot').textContent,
    status: (r.querySelector('.tl-bw-status') || {}).textContent || '', dot: r.querySelector('.tl-bw-dot') ? parseFloat(r.querySelector('.tl-bw-dot').style.left) : null,
    out: !!r.querySelector('.tl-bw-dot-out'), label: r.getAttribute('aria-label')
  }));
  return {
    pick: (q('.tl-bw-select-t') || {}).textContent || null,
    options: Array.from(document.querySelectorAll('#tl-bw-panel option')).map((o) => o.textContent),
    ranges: (q('.tl-bw-ranges') || {}).textContent || null, rangesLink: !!q('.tl-bw-ranges-link'),
    big: (q('.tl-bw-sum .ds-big') || {}).textContent || null, of: (q('.tl-bw-sum .ds-big-unit') || {}).textContent || null,
    pips: document.querySelectorAll('.tl-bw-pip').length, redPips: document.querySelectorAll('.tl-bw-pip.ds-hex-danger').length,
    sumText: (q('.tl-bw-sum-t') || {}).textContent || null, flags: Array.from(document.querySelectorAll('.tl-bw-sum-t .tl-bw-flag')).map((x) => x.textContent),
    chips: Array.from(document.querySelectorAll('.tl-bw-chips .ds-chip')).map((c) => c.textContent + (c.getAttribute('aria-pressed') === 'true' ? '*' : '')),
    rows, empty: !!q('.tl-bw-empty'), foot: (q('.tl-bw .ds-foot') || {}).textContent || null,
    notify: q('[data-bw="notify"]') ? { pressed: q('[data-bw="notify"]').getAttribute('aria-pressed'), text: q('[data-bw="notify"]').textContent } : null,
    note: !!q('.tl-bw-order-note')
  };
});
/* What the page's own logic says the newest (or a given) panel holds. */
const expected = (page, ts) => page.evaluate((ts) => {
  const all = tlLabPanels(gd().entries);
  const e = ts ? all.find((x) => x.ts === ts) : all[0];
  const p = tlPanelOf(e, tlLabsEnv());
  return { ts: e.ts, rows: p.rows.map((r) => ({ key: r.key, value: r.value, lo: r.lo, hi: r.hi, bad: r.status === 'bad', dir: r.dir, at: (tlMarkerBar(r) || {}).at })),
    out: p.out.map((r) => r.key), panels: all.map((x) => x.ts) };
}, ts);

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== the demo record, no plan, dark ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    let w = await where(page);
    t('#/health/bloodwork is the new Bloodwork screen, not the old page', w.route === 'health/bloodwork' && w.bw && !w.shown.includes('page-bloodwork') &&
      await page.evaluate(() => (document.querySelector('#tl-top .ds-seg [aria-selected="true"]') || {}).getAttribute('data-value') === 'bloodwork'), JSON.stringify(w));
    t('  its header has the scan button and "+ Log labs" where the profile button goes', await page.evaluate(() => {
      const top = document.getElementById('tl-top');
      const scan = top.querySelector('[data-tl-call="tlBwScan"]');
      return !!scan && scan.getAttribute('aria-label') === 'Scan a lab report' && !!scan.querySelector('.ph-scan') &&
        /Log labs/.test((top.querySelector('[data-tl-go="log/labs"]') || {}).textContent || '') && !top.querySelector('.ds-avatar');
    }));
    const ex = await expected(page);
    let s = await screen(page);
    t('the newest panel shows, picked by its date, with the others in the picker', s.pick === 'Panel of Nov 11' && s.options.length === ex.panels.length && s.options[0] === 'Panel of Nov 11',
      JSON.stringify([s.pick, s.options]));
    t('  "Ranges for male, age 41", from the profile', s.ranges === 'Ranges for male, age 41' && !s.rangesLink, s.ranges);
    const ranged = ex.rows.filter((r) => r.lo !== null || r.hi !== null);
    t('the summary: markers in range out of those with a range', s.big === String(ranged.filter((r) => !r.bad).length) && s.of === '/' + ranged.length, s.big + s.of);
    t('  a pip for each, the out-of-range ones in danger', s.pips === ranged.length && s.redPips === ex.out.length && ex.out.length === 2, s.pips + '/' + s.redPips);
    t('  "LH and FSH are below reference.", the names flagged', s.sumText === 'LH and FSH are below reference.' && JSON.stringify(s.flags) === '["LH","FSH"]', s.sumText);
    t('every marker in the panel is a row, in the panel\'s order', JSON.stringify(s.rows.map((r) => r.key)) === JSON.stringify(ex.rows.map((r) => r.key)), s.rows.length + ' rows');
    const tt = s.rows.find((r) => r.key === 'tott');
    t('  Total testosterone: 748 ng/dL, "Reference 300–950", "In range"', tt.name === 'Total testosterone' && tt.val === '748' && tt.unit === 'ng/dL' &&
      tt.foot === 'Reference 300–950In range' && tt.status === 'In range' && !tt.out, JSON.stringify(tt));
    t('  its dot at 20% + 60% x (748 - 300)/(950 - 300)', Math.abs(tt.dot - (20 + 60 * 448 / 650)) < 0.01, String(tt.dot));
    const dotsOk = s.rows.every((r) => { const e = ex.rows.find((x) => x.key === r.key); return e.at === undefined ? r.dot === null : Math.abs(r.dot - e.at * 100) < 0.01; });
    t('  every dot where tlMarkerBar puts it, and within 3–97%', dotsOk && s.rows.every((r) => r.dot === null || (r.dot >= 3 && r.dot <= 97)));
    const lh = s.rows.find((r) => r.key === 'lh');
    t('  LH: filled danger dot, "Below range" in danger, said in its label too', lh.out && lh.status === 'Below range' &&
      await page.evaluate(() => document.querySelector('[data-bw-trend="lh"] .tl-bw-status').classList.contains('tl-bw-status-out')) && /below range/.test(lh.label), JSON.stringify(lh));
    t('  the in-range rows say so, the out-of-range ones which way', s.rows.every((r) => { const e = ex.rows.find((x) => x.key === r.key);
      return e.lo === null && e.hi === null ? r.status === '' : e.bad ? r.status === (e.dir === 'below' ? 'Below range' : 'Above range') && r.out : r.status === 'In range' && !r.out; }));
    t('the footnote', s.foot === 'Reference intervals, not a diagnosis. Review results with your physician.', s.foot);
    t('the filter chips: "All markers" on, "Out of range · 2"', JSON.stringify(s.chips) === JSON.stringify(['All markers*', 'Out of range · 2']), JSON.stringify(s.chips));
    await shot(page, 'bloodwork-dark');
    await page.click('.tl-bw-chips .ds-chip[data-value="out"]');
    await page.waitForTimeout(80);
    s = await screen(page);
    t('  "Out of range" shows just those two', JSON.stringify(s.rows.map((r) => r.key)) === JSON.stringify(ex.out), JSON.stringify(s.rows.map((r) => r.key)));
    await page.click('.tl-bw-chips .ds-chip[data-value="all"]');
    await page.waitForTimeout(80);
    t('  and "All markers" all of them again', (await screen(page)).rows.length === ex.rows.length);

    /* Another panel. */
    const older = ex.panels[1];
    await page.selectOption('#tl-bw-panel', older);
    await page.waitForTimeout(150);
    s = await screen(page);
    const ex2 = await expected(page, older);
    t('picking an older panel shows its markers and its date', s.pick !== 'Panel of Nov 11' && s.pick === s.options[1] &&
      JSON.stringify(s.rows.map((r) => r.key + '=' + r.val)) === JSON.stringify(ex2.rows.map((r) => r.key + '=' + String(Math.round(r.value * 1000) / 1000))), s.pick);
    await page.selectOption('#tl-bw-panel', ex.panels[0]);
    await page.waitForTimeout(150);

    /* Notify me. */
    await page.click('[data-bw="notify"]');
    await page.waitForTimeout(100);
    s = await screen(page);
    let rec = await record(page);
    t('"Notify me" becomes "On the list", says nothing was sent, and is kept in the record', s.notify.pressed === 'true' && /On the list/.test(s.notify.text) && s.note &&
      typeof (rec.settings || {}).labsNotify === 'string', JSON.stringify(s.notify));
    t('  with focus left on the button', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-bw') === 'notify'));
    await page.click('[data-bw="notify"]');
    await page.waitForTimeout(100);
    s = await screen(page);
    rec = await record(page);
    t('  and back off', s.notify.pressed === 'false' && s.notify.text === 'Notify me' && !s.note && !('labsNotify' in (rec.settings || {})), JSON.stringify(s.notify));

    /* Where things lead, without a plan. */
    w = await tap(page, '[data-bw-trend="tott"]');
    t('without a plan, a marker\'s trend opens the upgrade screen, and Bloodwork stays', !!w.upgrade && /Bloodwork Trends/.test(w.upgrade) && w.route === 'health/bloodwork' && w.bw,
      JSON.stringify({ route: w.route, up: (w.upgrade || '').slice(0, 40) }));
    await closeUpgrade(page);
    w = await tap(page, '#tl-top [data-tl-call="tlBwScan"]');
    t('  so does the scan button (the AI scanner is Pro)', !!w.upgrade && /AI Lab Scanner/.test(w.upgrade) && w.route === 'health/bloodwork', (w.upgrade || '').slice(0, 40));
    await closeUpgrade(page);
    w = await tap(page, '[data-tl-go="health/report"]');
    t('  and the report for your physician', !!w.upgrade && /Clinical Reports/.test(w.upgrade) && w.route === 'health/bloodwork', (w.upgrade || '').slice(0, 40));
    await closeUpgrade(page);
    w = await tap(page, '[data-tl-go="health/panels"]');
    t('"All panels" opens the old history, without the old page\'s row of tabs', w.route === 'health/panels' && w.shown.includes('bw-history') && !w.oldTabs && w.title === 'All panels', JSON.stringify(w));
    w = await tap(page, '#tl-top [data-tl-back]');
    t('  and Back returns to Bloodwork', w.route === 'health/bloodwork' && w.bw, w.route);
    w = await tap(page, '#tl-top [data-tl-go="log/labs"]');
    t('"+ Log labs" opens the lab form', w.route === 'log/labs' && w.shown.includes('lt-labs'), JSON.stringify(w));
    await page.fill('#ll-date', '2026-11-18');
    await page.fill('#ll-tott', '650');
    await page.fill('#ll-hct', '53');
    await page.click('#lt-labs button[onclick="saveBloodwork()"]');
    await page.waitForTimeout(300);
    w = await where(page);
    s = await screen(page);
    t('saving it shows Bloodwork, on the panel just saved', w.route === 'health/bloodwork' && w.bw && s.pick === 'Panel of Nov 18' &&
      JSON.stringify(s.rows.map((r) => r.key + '=' + r.val)) === '["tott=650","hct=53"]' && s.sumText === 'Hematocrit is above reference.', JSON.stringify([w.route, s.pick, s.sumText]));
    w = await tap(page, '#tl-tabs [data-ds-tab="today"]');
    await page.evaluate(() => { const b = document.querySelector('#lt-labs button[onclick="saveBloodwork()"]'); if (b) b.click(); });
    await page.waitForTimeout(250);
    t('  a save with nothing typed adds nothing and goes nowhere', (await where(page)).route === 'today' &&
      (await record(page)).entries.filter((e) => e.type === 'bloodwork').length === ex.panels.length + 1);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== a plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true });
    let w = await tap(page, '[data-bw-trend="tott"]');
    const trend = await page.evaluate(() => (document.getElementById('trend-chart-title') || {}).textContent || '');
    t('with a plan, a marker opens its trend', w.route === 'health/trend' && w.hash === '#/health/trend/tott' && w.shown.includes('bw-trends') && !w.oldTabs && !w.upgrade &&
      /^Total T\b/.test(trend), JSON.stringify(w) + ' ' + trend);
    w = await tap(page, '#tl-top [data-tl-back]');
    t('  and Back returns to Bloodwork', w.route === 'health/bloodwork' && w.bw, w.route);
    await page.evaluate(() => { location.hash = '#/health/trend/lh'; });
    await page.waitForTimeout(300);
    w = await where(page);
    t('  an address can link straight to a marker\'s trend', w.route === 'health/trend' && w.shown.includes('bw-trends') &&
      /LH|Luteinizing/i.test(await page.evaluate(() => (document.getElementById('trend-chart-title') || {}).textContent || '')), JSON.stringify(w));
    await page.evaluate(() => tlGo('health/bloodwork'));
    await page.waitForTimeout(250);
    const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), page.click('#tl-top [data-tl-call="tlBwScan"]')]);
    await page.waitForTimeout(250);
    w = await where(page);
    t('with Pro, the scan button opens the lab form and the file picker in one tap', !!chooser && w.route === 'log/labs' && w.shown.includes('lt-labs') && !w.upgrade, JSON.stringify(w));
    await page.evaluate(() => tlGo('health/bloodwork'));
    await page.waitForTimeout(250);
    w = await tap(page, '[data-tl-go="health/report"]');
    t('the report opens the report builder alone, not the profile form above it', w.route === 'health/report' && w.shown.includes('prof-report') && !w.shown.includes('prof-name') &&
      w.title === 'Report' && !w.upgrade, JSON.stringify(w));
    await page.click('#prof-report button[onclick="generateReport()"]');
    await page.waitForTimeout(300);
    t('  and Generate writes the report there', await page.evaluate(() => { const r = document.getElementById('report-doc'); return !!r && r.offsetParent !== null && /Clinical Progress Report/.test(r.textContent); }));
    w = await tap(page, '#tl-top [data-tl-back]');
    t('  Back returns to Bloodwork', w.route === 'health/bloodwork' && w.bw, w.route);
    await page.evaluate(() => tlGo('profile'));
    await page.waitForTimeout(250);
    w = await where(page);
    t('  and Profile afterwards opens on the profile, not the report', w.route === 'profile' && w.shown.includes('prof-name') && !w.shown.includes('prof-report'), JSON.stringify(w.shown));
    await page.evaluate(() => tlGo('health/bloodwork'));
    await page.waitForTimeout(250);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== no labs ===== */
  {
    const bare = JSON.parse(JSON.stringify(DEMO));
    bare.entries = bare.entries.filter((e) => e.type !== 'bloodwork');
    const { context, page, errors } = await open(browser, base, { record: bare });
    const s = await screen(page);
    t('no labs: "No labs yet", with Log labs and Scan, and no picker or chips', s.empty && !s.pick && !s.chips.length && !s.rows.length &&
      await page.evaluate(() => !!document.querySelector('.tl-bw-empty [data-tl-go="log/labs"]') && !!document.querySelector('.tl-bw-empty [data-tl-call="tlBwScan"]')));
    t('  Order labs and the footnote are still there', !!s.notify && /not a diagnosis/.test(s.foot || ''));
    await shot(page, 'bloodwork-empty-dark');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== a panel and no sex or birth date ===== */
  {
    const anon = JSON.parse(JSON.stringify(DEMO));
    delete anon.profile.sex; delete anon.profile.dob;
    const { context, page, errors } = await open(browser, base, { record: anon });
    const s = await screen(page);
    t('no sex or birth date: the ranges say they are a default, and lead to Profile', s.ranges === 'Ranges for male (default), age not set' && s.rangesLink, s.ranges);
    const w = await tap(page, '.tl-bw-ranges-link');
    t('  which opens', w.route === 'profile' && w.shown.includes('page-profile'), w.route);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Bloodwork fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    f = await fit(page, '#tl-top');
    t('  and its header', fitOk(f), fitDetail(f));
    await shot(page, 'bloodwork-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-health-bloodwork: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
