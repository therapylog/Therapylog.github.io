#!/usr/bin/env node
/* Ask (6b), in a browser (src/ui/ask.js).
 *
 * The screen: its header (Today, Ask with a Pro tag, Clear), the empty text
 * in place of the old canned greeting, the suggestions, the assistant's own
 * input and thread borrowed into it and given back when the screen goes.
 * Without the assistant on the plan, sending opens Pro. With it: a question
 * the app answers itself (the Library) shows, as it never did before; one
 * that goes to the assistant asks for consent first, then shows the answer
 * (the endpoint is stubbed) with where it came from, Copy and "Share with my
 * physician"; a suggestion sends itself; Clear; the assistant's settings.
 * Light at 320 px.
 *
 *   node scripts/ui-check-ask.js
 *   SHOTS=dir node scripts/ui-check-ask.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-ask: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/ask'), { waitUntil: 'load' });
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


const ask = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const vis = (el) => !!el && el.offsetParent !== null && el.getBoundingClientRect().height > 0;
  return {
    route: tlRoute,
    head: q('.tl-ask-head') ? Array.from(q('.tl-ask-head').querySelectorAll('button, h1 span')).map((x) => x.textContent.trim()).filter(Boolean).join(' ') : null,
    empty: vis(q('.tl-ask-empty')),
    borrowed: !!q('#tl-ask-thread #chat-msgs') && !!q('#tl-ask-row #chat-in'),
    home: !!q('.chat-card #chat-msgs') && !!q('.chat-card #chat-in'),
    placeholder: (q('#chat-in') || {}).placeholder || null,
    chips: Array.from(document.querySelectorAll('.tl-ask-chip')).map((c) => c.textContent),
    users: Array.from(document.querySelectorAll('#chat-msgs .cmsg.user')).filter(vis).map((m) => (m.querySelector('.cbub') || m).textContent.trim()),
    answers: Array.from(document.querySelectorAll('#chat-msgs .cmsg.ai, #chat-msgs .msg.ai')).filter(vis).map((m) => ({
      from: (m.querySelector('.tl-ask-from') || {}).textContent || null, text: m.textContent.replace(/\s+/g, ' ').trim().slice(0, 600),
      acts: Array.from(m.querySelectorAll('.cmsg-btn')).map((b) => b.textContent)
    })),
    upgrade: (document.getElementById('tl-upgrade-overlay') || {}).textContent || null,
    consent: (() => { const c = document.getElementById('ai-ctx-consent'); return c && getComputedStyle(c).display !== 'none' ? (document.getElementById('ai-consent-title') || {}).textContent : null; })(),
    disc: (q('.tl-ask-disc') || {}).textContent || null
  };
});
const send = async (page, text) => { await page.fill('#chat-in', text); await page.click('.tl-ask-send'); await page.waitForTimeout(400); };

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== without the assistant on the plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    let a = await ask(page);
    t('#/ask is the new Ask screen, with no tab bar', a.route === 'ask' && await page.evaluate(() => document.body.classList.contains('tl-bare') && !!document.querySelector('#tl-screen .tl-ask')));
    t('  its header: Today, Ask with a Pro tag, Clear', a.head === 'Today Ask Pro Clear', a.head);
    t('  the empty text, not the old canned greeting', a.empty && !a.answers.length, JSON.stringify(a.answers));
    t('  the assistant\'s own thread and input, borrowed into it', a.borrowed && !a.home && a.placeholder === 'Ask about a compound, your labs or your plan');
    t('  suggestions from the stack, and the disclaimer', a.chips.length === 4 && /^What does the research say about /.test(a.chips[1]) && a.disc === 'Informational only, not medical advice. Your physician decides.', JSON.stringify(a.chips));
    await send(page, 'What is BPC-157?');
    a = await ask(page);
    t('sending without the assistant on the plan opens Pro', !!a.upgrade && /AI Research Assistant is part of Pro/.test(a.upgrade), (a.upgrade || '').slice(0, 50));
    await page.keyboard.press('Escape');
    await page.click('.tl-ask-back'); await page.waitForTimeout(250);
    a = await ask(page);
    t('Today: the thread and input are back on the old page', a.route === 'today' && a.home, JSON.stringify([a.route, a.home]));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== with the assistant ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true });
    let sent = null;
    await page.route('https://api.therapylog.app/api/ai-research', async (route) => {
      sent = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text',
        text: 'Your hematocrit of 46.2% on your Nov 11 panel sits inside its reference range.\n\n## What the evidence says\n- Monitoring hematocrit on testosterone therapy is established practice.\n\n## Worth asking your physician\n1. When to repeat the CBC.' }] }) });
    });
    let a = await ask(page);
    t('with the assistant: no Pro tag', a.head === 'Today Ask Clear', a.head);
    await send(page, 'What is BPC-157?');
    a = await ask(page);
    t('a question the app answers itself shows, from the Library', a.users[a.users.length - 1] === 'What is BPC-157?' && a.answers.length === 1 && a.answers[0].from === 'From the Library' && /BPC-157/.test(a.answers[0].text) && !sent,
      JSON.stringify(a.answers));
    t('  and the empty text goes', !a.empty);
    await send(page, 'qzx: summarise the trend in my own entries this fortnight');
    a = await ask(page);
    t('one for the assistant asks first whether to send the protocol with it', /Send your protocol with this question\?/.test(a.consent || '') && !sent, a.consent);
    await page.click('#ai-consent-yes'); await page.waitForTimeout(600);
    a = await ask(page);
    const last = a.answers[a.answers.length - 1];
    t('  after yes, it goes with the log, and the answer shows with where it came from', !!sent && typeof sent.context === 'string' && sent.context.length > 50 &&
      last.from === 'From your log and the assistant' && /What the evidence says/.test(last.text) && /Worth asking your physician/.test(last.text), JSON.stringify([sent && (sent.context || '').length, last]));
    t('  with Copy and "Share with my physician"', JSON.stringify(last.acts) === '["Copy","Share with my physician"]', JSON.stringify(last.acts));
    const n = a.users.length;
    sent = null;
    /* The managed service asks for a moment between questions. */
    await page.clock.runFor(await page.evaluate(() => AI_COOLDOWN_MS + 200));
    await page.click('.tl-ask-chip:nth-child(4)'); await page.waitForTimeout(600);
    a = await ask(page);
    t('  the thread follows the newest message', await page.evaluate(() => { const b = document.getElementById('tl-ask-thread'); return b.scrollHeight - b.clientHeight - b.scrollTop < 4; }));
    t('a suggestion sends itself', a.users.length === n + 1 && a.users[a.users.length - 1] === 'What should I ask my physician at my next visit?', JSON.stringify(a.users.slice(-1)));
    await shot(page, 'ask-dark');
    await page.click('.tl-ask-clear'); await page.waitForTimeout(300);
    a = await ask(page);
    t('Clear empties the conversation and brings back the empty text', !a.answers.length && !a.users.length && a.empty && await page.evaluate(() => !localStorage.getItem('tl-chat-history')), JSON.stringify(a.answers));
    await page.click('.tl-ask-settings'); await page.waitForTimeout(300);
    const st = await page.evaluate(() => { const b = document.getElementById('ai-settings-body'), c = document.querySelector('.chat-card');
      return { route: tlRoute, open: !!b && b.offsetParent !== null, chat: !!c && c.offsetParent !== null, title: document.querySelector('#tl-top h1').textContent }; });
    t('"Assistant settings" opens the assistant\'s own settings, without its chat', st.route === 'ask/settings' && st.open && !st.chat && st.title === 'Assistant settings', JSON.stringify(st));
    await page.click('#tl-top [data-tl-back]'); await page.waitForTimeout(300);
    a = await ask(page);
    t('  and Back returns to Ask, the thread borrowed again', a.route === 'ask' && a.borrowed);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light', paid: true });
    await send(page, 'What is BPC-157?');
    const f = await fit(page, '.tl-ask-head');
    const g = await fit(page, '.tl-ask-composer');
    t('light at 320 px: the header and composer fit, every control named and 44 px, no text under 12 px', fitOk(f) && fitOk(g), fitDetail(f) + ' ' + fitDetail(g));
    await shot(page, 'ask-light-320');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-ask: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
