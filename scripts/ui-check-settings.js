#!/usr/bin/env node
/* Settings (5b), in a browser (src/ui/settings.js).
 *
 * The profile row, the plan card for a free and a paid plan (Upgrade, Manage,
 * Restore), the backup warning, Back up now, the restore file picker, the
 * two exports, Rounds and alerts and its own screen, discreet alerts, the
 * calendar file, Appearance, the body map figure, Clinic mode (gated), History,
 * demo data and delete-all asking first, the About links and the footer.
 * Light at 320 px.
 *
 *   node scripts/ui-check-settings.js
 *   SHOTS=dir node scripts/ui-check-settings.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-settings: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/settings'), { waitUntil: 'load' });
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


const tap = async (page, sel) => { await page.click(sel); await page.waitForTimeout(250); return page.evaluate(() => tlRoute); };
const subOf = (page, sel) => page.evaluate((sel) => { const r = document.querySelector(sel); return r ? (r.querySelector('.ds-row-sub') || {}).textContent || '' : null; }, sel);
const settings = async (page) => { await page.evaluate(() => tlGo('settings')); await page.waitForTimeout(250); };
const download = async (page, sel) => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click(sel)]);
  return d ? d.suggestedFilename() : null;
};

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== without a plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    t('#/settings is the new Settings screen', await page.evaluate(() => tlRoute === 'settings' && !!document.querySelector('#tl-screen .tl-set')));
    const me = await page.evaluate(() => { const r = document.querySelector('.tl-set-me'); return { avatar: r.querySelector('.tl-set-avatar').textContent, title: r.querySelector('.ds-row-title').textContent, sub: r.querySelector('.ds-row-sub').textContent }; });
    t('the profile row: the initial, the name, "Male · 41 · sets your lab reference ranges"', me.avatar === 'J' && me.title === 'James Mitchell (sample data)' && me.sub === 'Male · 41 · sets your lab reference ranges', JSON.stringify(me));
    t('  and it opens Profile', await tap(page, '.tl-set-me') === 'profile');
    await settings(page);
    t('a free plan: "Upgrade to Pro", and Restore worded for the web', (await subOf(page, '[data-set="upgrade"]')) === 'Trends, supply, reports and the assistant' &&
      (await subOf(page, '[data-set="restore"]')) === 'Have a license key? Enter it here.');
    await page.click('[data-set="upgrade"]'); await page.waitForTimeout(150);
    t('  Upgrade opens Pro, with no feature named', await page.evaluate(() => !!document.getElementById('tl-upgrade-overlay') && !document.querySelector('.tl-pro-lock')));
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    await page.click('[data-set="restore"]'); await page.waitForTimeout(150);
    t('  Restore opens the license key', await page.evaluate(() => !!document.getElementById('tl-activate-overlay')));
    await page.evaluate(() => { const o = document.getElementById('tl-activate-overlay'); if (o) o.remove(); });

    t('never backed up: the warning says so', /You have never backed up\. Your log exists only on this phone\./.test(await page.textContent('.tl-set-warn')));
    await page.evaluate(() => localStorage.setItem('tl-last-export', String(Date.now() - 9 * 864e5)));
    await settings(page);
    t('  nine days: "Last backup was 9 days ago. Weekly is the recommendation."', (await page.textContent('.tl-set-warn')).trim() === 'Last backup was 9 days ago. Weekly is the recommendation.');
    await page.evaluate(() => localStorage.setItem('tl-last-export', String(Date.now() - 2 * 864e5)));
    await settings(page);
    t('  two days: no warning', !(await page.$('.tl-set-warn')));
    await page.evaluate(() => localStorage.setItem('tl-last-export', String(Date.now() - 9 * 864e5)));
    await settings(page);
    const bk = await download(page, '[data-set="backup"]');
    await page.waitForTimeout(300);
    t('Back up now writes the backup file, says "Saved just now", and the warning goes', !!bk && /\.json$/.test(bk) && (await subOf(page, '[data-set="backup"]')) === 'Saved just now' && !(await page.$('.tl-set-warn')), String(bk));
    const auto = await page.evaluate(() => { const t = document.getElementById('tl-set-auto'); return { on: t.getAttribute('aria-checked'), disabled: t.disabled, can: tlCanLinkFile() }; });
    t('the weekly file\'s switch is off, and disabled where the browser cannot link a file', auto.on === 'false' && auto.disabled === !auto.can, JSON.stringify(auto));
    const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), page.click('[data-set="restore-file"]')]);
    t('"Restore from a backup file" opens the file picker for a backup', !!chooser && await page.evaluate(() => document.getElementById('import-file').accept || '') !== null);
    await page.click('[data-set="export"]'); await page.waitForTimeout(150);
    const json = await download(page, '[data-exp="json"]');
    await page.click('[data-set="export"]'); await page.waitForTimeout(150);
    const csv = await download(page, '[data-exp="csv"]');
    t('Export: the backup file and the spreadsheet', /\.json$/.test(json || '') && /\.csv$/.test(csv || ''), JSON.stringify([json, csv]));

    /* Reminders. */
    const rounds = await page.evaluate(() => { const r = tlSetupRounds(tlProtocol(gd(), tlEnv())); return r.length + (r.length === 1 ? ' round' : ' rounds') + ' · ' + r.map((x) => x.time).join(', '); });
    t('"Rounds and alerts" says the rounds and their times', (await subOf(page, '[data-tl-go="settings/rounds"]')) === rounds, rounds);
    t('  and opens its screen, with each round\'s card', await tap(page, '[data-tl-go="settings/rounds"]') === 'settings/rounds' &&
      await page.evaluate(() => document.querySelectorAll('.tl-set-rounds .tl-round').length > 0));
    const slot = await page.evaluate(() => { const b = document.querySelector('.tl-set-rounds [data-shift$=":1"]'); return b.getAttribute('data-shift').split(':')[0]; });
    const timeOf = (s) => page.evaluate((s) => (tlSetupRounds(tlProtocol(gd(), tlEnv())).find((r) => r.slot === s) || {}).time, s);
    const before = await timeOf(slot);
    await page.click(`.tl-set-rounds [data-shift="${slot}:1"]`); await page.waitForTimeout(100);
    const after = await timeOf(slot);
    t('  "later" moves the round and saves it', !!before && !!after && before !== after, before + ' -> ' + after);
    await page.click(`#tl-cu-alert-${slot}`); await page.waitForTimeout(100);
    t('  its switch turns the alert off', await page.evaluate((s) => tlProtocol(gd(), tlEnv()).slots[s].alert === false, slot));
    await page.click(`#tl-cu-alert-${slot}`); await page.waitForTimeout(100);
    t('  Back returns to Settings, which shows the new time', await tap(page, '#tl-top [data-tl-back]') === 'settings' && (await subOf(page, '[data-tl-go="settings/rounds"]')).includes(after));
    await page.click('#tl-set-discreet'); await page.waitForTimeout(100);
    t('Discreet alerts switch on, saved with the protocol and for the alerts', await page.evaluate(() => tlProtocol(gd(), tlEnv()).discreet === true && localStorage.getItem('tl_notif_discreet') === '1'));
    const ics = await download(page, '[data-set="calendar"]');
    t('"Add to my calendar" downloads the schedule as .ics', /\.ics$/.test(ics || ''), String(ics));

    /* Display. */
    await page.click('.tl-set .ds-seg[data-ds-seg="Appearance"] [data-value="light"]'); await page.waitForTimeout(150);
    t('Appearance: Light switches the theme', await page.evaluate(() => document.body.classList.contains('light-mode') && localStorage.getItem('tl-theme') === 'light'));
    await page.click('.tl-set .ds-seg[data-ds-seg="Appearance"] [data-value="dark"]'); await page.waitForTimeout(150);
    await page.click('.tl-set .ds-seg[data-ds-seg="Body map figure"] [data-value="female"]'); await page.waitForTimeout(100);
    t('Body map figure: Female is saved to the record', (await record(page)).settings.figure === 'female');
    await page.click('[data-set="clinic"]'); await page.waitForTimeout(150);
    t('Clinic mode without a plan opens Pro', await page.evaluate(() => /Clinical Reports/.test((document.getElementById('tl-upgrade-overlay') || {}).textContent || '')));
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);

    /* Data. */
    t('History opens', await tap(page, '[data-tl-go="history"]') === 'history');
    await settings(page);
    const nEntries = (await record(page)).entries.length;
    await page.click('[data-set="demo"]'); await page.waitForTimeout(150);
    t('"Load demo data" asks first', /Replace your log with demo data\?/.test(await page.evaluate(() => (document.getElementById('tl-confirm') || {}).textContent || '')));
    await page.click('#tl-confirm [data-tl-confirm="cancel"]'); await page.waitForTimeout(100);
    await page.click('[data-set="wipe"]'); await page.waitForTimeout(150);
    const wipe = await page.evaluate(() => (document.getElementById('tl-confirm') || {}).textContent || '');
    t('"Delete all data" asks first, and names the photos', /Delete all TherapyLog data\?/.test(wipe) && /progress photos/.test(wipe), wipe.slice(0, 80));
    await page.click('#tl-confirm [data-tl-confirm="cancel"]'); await page.waitForTimeout(100);
    t('  cancelling both changed nothing', (await record(page)).entries.length === nEntries);

    const about = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-set a.ds-row')).map((a) => a.querySelector('.ds-row-title').textContent + '>' + a.getAttribute('href')));
    t('About: the guide, sources and terms', JSON.stringify(about) === '["Guide>/guide/","Sources and methodology>/sources/","Terms and privacy>/terms"]', JSON.stringify(about));
    t('the footer: the version, and not a medical device', await page.evaluate(() => document.querySelector('.tl-set-foot').textContent === 'TherapyLog ' + APP_VERSION + '. Records and presents; not a medical device.'));
    await shot(page, 'settings-free-dark', true);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== a plan ===== */
  {
    const { context, page, errors } = await open(browser, base, { paid: true });
    await page.evaluate(() => { const e = JSON.parse(localStorage.getItem('tl_ent')); e.expires = Math.floor(new Date(2027, 10, 16, 12).getTime() / 1000); e.willRenew = true; localStorage.setItem('tl_ent', JSON.stringify(e)); });
    await settings(page);
    const plan = await page.evaluate(() => { const r = document.querySelector('.tl-set-plan-row'); return r ? r.querySelector('.ds-row-title').textContent + '|' + r.querySelector('.ds-row-sub').textContent : null; });
    t('a plan: "TherapyLog Pro Active", "Yearly · renews Nov 16, 2027"', plan === 'TherapyLog Pro Active|Yearly · renews Nov 16, 2027', plan);
    await page.click('[data-set="manage"]'); await page.waitForTimeout(150);
    const man = await page.evaluate(() => (document.querySelector('.ds-sheet') || {}).textContent || '');
    t('  Manage shows the plan, its key and where to change it', /License key TL-TEST-TEST-TEST/.test(man) && /Stripe billing portal/.test(man), man.slice(0, 90));
    await page.click('[data-man="close"]'); await page.waitForTimeout(100);
    await page.click('[data-set="clinic"]'); await page.waitForTimeout(250);
    t('Clinic mode opens the clinic view', await page.evaluate(() => { const o = document.getElementById('clinic-mode-overlay'); return !!o && getComputedStyle(o).display !== 'none'; }));
    await page.evaluate(() => toggleClinicMode()); await page.waitForTimeout(100);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Settings fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'settings-light-320', true);
    await page.evaluate(() => tlGo('settings/rounds')); await page.waitForTimeout(250);
    f = await fit(page, '#tl-screen');
    t('  and Rounds and alerts', fitOk(f), fitDetail(f));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-settings: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
