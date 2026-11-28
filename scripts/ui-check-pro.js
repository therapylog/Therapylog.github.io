#!/usr/bin/env node
/* Pro (5c), in a browser (src/ui/pro.js).
 *
 * A gate opens it, naming the feature; a 'std' gate preselects Own key and a
 * 'pro' gate Pro. Yearly by default; the cards and the Own key switch change
 * the price on the button. On the web, Continue starts the same checkout
 * pro.html uses with the plan chosen (the endpoint is stubbed here), and an
 * error says so. Restore opens the license key; × and Escape close; a
 * purchase landing while it is up turns it into "Pro is on". iOS buys
 * through the App Store, Android takes a license key. Light at 320 px.
 *
 *   node scripts/ui-check-pro.js
 *   SHOTS=dir node scripts/ui-check-pro.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-pro: playwright is not installed — skipping.'); process.exit(0); }
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


const pro = (page) => page.evaluate(() => {
  const o = document.getElementById('tl-upgrade-overlay');
  if (!o) return null;
  const q = (s) => o.querySelector(s);
  return {
    lock: (q('.tl-pro-lock') || {}).textContent || null,
    feats: Array.from(o.querySelectorAll('.tl-pro-feat-t')).map((x) => x.textContent),
    cards: Array.from(o.querySelectorAll('.tl-pro-card')).map((c) => c.querySelector('.tl-pro-card-l').textContent + ' ' + c.querySelector('.tl-pro-card-p').textContent + (c.getAttribute('aria-checked') === 'true' ? '*' : '')),
    own: q('[data-pro="own"]') ? q('[data-pro="own"]').getAttribute('aria-checked') : null,
    cta: (q('.tl-pro-cta') || {}).textContent || null, ctaDisabled: q('.tl-pro-cta') ? q('.tl-pro-cta').disabled : null,
    err: (q('.tl-pro-err') || {}).textContent || '', fine: (q('.tl-pro-fine') || {}).textContent || '',
    links: Array.from(o.querySelectorAll('.tl-pro-links a')).map((a) => a.textContent + '>' + a.getAttribute('href')),
    done: (q('.tl-pro-done') || {}).textContent || null, focus: document.activeElement && o.contains(document.activeElement) ? (document.activeElement.getAttribute('data-pro') || document.activeElement.className) : null
  };
});
const gate = async (page, feat) => { await page.evaluate((f) => TLTier.check(f), feat); await page.waitForTimeout(150); return pro(page); };

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== the web ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    let sent = null, reply = { status: 200, body: { url: base + '/pro.html?checkout=test' } };
    await page.route('https://api.therapylog.app/api/create-pro-subscription', async (route) => {
      sent = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) });
    });
    let p = await gate(page, 'cost_tracking');
    t('a gate opens Pro, naming its feature', !!p && p.lock === 'Cost & Supply Tracking is part of Pro', p && p.lock);
    t('  the five features', JSON.stringify(p.feats) === JSON.stringify(['Trends across panels', 'Supply that counts itself', 'Patterns', 'Planning tools', 'Assistant and lab scanner']));
    t('  a "std" gate preselects Own key, yearly: "Continue · $89.99 a year"', p.own === 'true' && JSON.stringify(p.cards) === '["Yearly $89.99*","Monthly $8.99"]' && p.cta === 'Continue · $89.99 a year', JSON.stringify([p.cards, p.cta]));
    t('  focus starts on Close', p.focus === 'close', p.focus);
    t('  the web\'s renewal terms, and the Terms and Privacy links', /Stripe billing portal/.test(p.fine) && JSON.stringify(p.links) === '["Terms of use>/terms","Privacy policy>/privacy"]', p.fine.slice(0, 40));
    await shot(page, 'pro-std-dark', true);
    await page.click('[data-pro="own"]'); await page.waitForTimeout(60);
    p = await pro(page);
    t('Own key off: Pro\'s prices, $99.99 a year', p.own === 'false' && JSON.stringify(p.cards) === '["Yearly $99.99*","Monthly $9.99"]' && p.cta === 'Continue · $99.99 a year', JSON.stringify([p.cards, p.cta]));
    await page.click('[data-pro-billing="monthly"]'); await page.waitForTimeout(60);
    p = await pro(page);
    t('  Monthly: "Continue · $9.99 a month"', JSON.stringify(p.cards) === '["Yearly $99.99","Monthly $9.99*"]' && p.cta === 'Continue · $9.99 a month', p.cta);
    reply = { status: 400, body: { error: 'That plan is not available right now.' } };
    await page.click('.tl-pro-cta'); await page.waitForTimeout(300);
    p = await pro(page);
    t('a checkout that fails says why, and the button comes back', sent && sent.plan === 'pro_monthly' && sent.billing === 'monthly' && p.err === 'That plan is not available right now.' && p.ctaDisabled === false, JSON.stringify([sent, p.err]));
    reply = { status: 200, body: { url: base + '/pro.html?checkout=test' } };
    await page.click('[data-pro-billing="annual"]'); await page.click('[data-pro="own"]'); await page.waitForTimeout(60);
    await Promise.all([page.waitForURL(/pro\.html\?checkout=test/, { timeout: 5000 }).catch(() => null), page.click('.tl-pro-cta')]);
    t('Continue starts checkout with the plan chosen, and goes to it', sent.plan === 'byok_annual' && sent.billing === 'annual' && /pro\.html\?checkout=test/.test(page.url()), JSON.stringify(sent) + ' ' + page.url());
    await page.goto(base + '/app.html#/today'); await page.waitForTimeout(500);

    p = await gate(page, 'ai_assistant');
    t('a "pro" gate preselects Pro, not Own key', p.lock === 'AI Research Assistant is part of Pro' && p.own === 'false' && p.cta === 'Continue · $99.99 a year', JSON.stringify([p.lock, p.own, p.cta]));
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    t('Escape closes it', (await pro(page)) === null);
    await gate(page, 'pct_builder');
    await page.click('[data-pro="close"]'); await page.waitForTimeout(100);
    t('  and so does ×', (await pro(page)) === null);
    await gate(page, 'pct_builder');
    await page.click('[data-pro="restore"]'); await page.waitForTimeout(200);
    t('Restore, on the web, opens the license key', (await pro(page)) === null && await page.evaluate(() => !!document.getElementById('tl-activate-overlay')));
    await page.evaluate(() => { const o = document.getElementById('tl-activate-overlay'); if (o) o.remove(); });
    await page.evaluate(() => openUpgrade(null, 'pro'));
    await page.waitForTimeout(100);
    p = await pro(page);
    t('from Settings\' row, no feature line', !!p && p.lock === null);
    /* A purchase lands while it is up. */
    await page.evaluate(() => localStorage.setItem('tl_ent', JSON.stringify({ tier: 'pro', status: 'active', expires: null, plan: 'yearly', lifetime: false, willRenew: true, key: 'TL-TEST-TEST-TEST', email: null, verifiedAt: Date.now(), source: 'license' })));
    await page.clock.runFor(1500); await page.waitForTimeout(100);
    p = await pro(page);
    t('a purchase that lands turns it into "Pro is on"', !!p && /Pro is on/.test(p.done || '') && /Yearly\. Everything already in your log feeds the trends\./.test(p.done) && p.focus === 'done', JSON.stringify(p && p.done));
    await shot(page, 'pro-done-dark');
    await page.click('[data-pro="done"]'); await page.waitForTimeout(250);
    t('  and "Back to Settings" goes there', (await pro(page)) === null && await page.evaluate(() => tlRoute === 'settings'));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== iOS and Android ===== */
  for (const plat of ['ios', 'android']) {
    const { context, page, errors } = await open(browser, base, {});
    await page.evaluate((plat) => {
      window.Capacitor = { getPlatform: () => plat, isNativePlatform: () => true };
      window.__bought = [];
      if (window.TLIAP) TLIAP.purchase = (id) => window.__bought.push(id);
    }, plat);
    const p = await gate(page, 'bloodwork_trends');
    if (plat === 'ios') {
      t('iOS: Pro\'s prices, no Own key, the App Store\'s renewal terms', p.own === null && JSON.stringify(p.cards) === '["Yearly $99.99*","Monthly $9.99"]' && /App Store account settings/.test(p.fine), JSON.stringify([p.cards, p.fine.slice(0, 30)]));
      await page.click('[data-pro-billing="monthly"]'); await page.click('.tl-pro-cta'); await page.waitForTimeout(100);
      t('  Continue buys the monthly product through the App Store', JSON.stringify(await page.evaluate(() => window.__bought)) === '["com.therapylog.app.pro.monthly"]');
    } else {
      t('Android: no prices, "Enter license key"', !p.cards.length && p.cta === 'Enter license key', JSON.stringify([p.cards, p.cta]));
      await page.click('.tl-pro-cta'); await page.waitForTimeout(200);
      t('  which opens the license key', (await pro(page)) === null && await page.evaluate(() => !!document.getElementById('tl-activate-overlay')));
    }
    t(plat + ': no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    await gate(page, 'cost_tracking');
    const f = await fit(page, '#tl-upgrade-overlay');
    t('light at 320 px: Pro fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'pro-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-pro: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
