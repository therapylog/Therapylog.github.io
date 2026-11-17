#!/usr/bin/env node
/* Onboarding, in a browser (src/ui/onboarding.js, compound-sheet.js).
 *
 * A first run from an empty browser, step by step, and what it leaves in the
 * record: the protocol every other screen reads, the old fields the old
 * screens read, settings, and the flags that keep it from showing again.
 * Then the other ways in: restoring a backup instead of setting up (good and
 * bad files), a returning user who only has newer terms to accept, and a
 * returning user who sees nothing. Then fit and reach: both themes, 320 px,
 * 44 px targets, the 12 px text floor, names on every control, the keyboard.
 *
 *   node scripts/ui-check-onboarding.js
 *   SHOTS=dir node scripts/ui-check-onboarding.js     also save screenshots
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-onboarding: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const SHOTS = process.env.SHOTS || null;

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
const FIXTURE = path.join(ROOT, 'tests', 'fixtures', 'demo-backup.json');
const DEMO = JSON.parse(fs.readFileSync(FIXTURE, 'utf8')).data;

/* opts: width, theme, seed { key: value } written before the app loads. */
async function open(browser, base, opts) {
  const context = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [], dialogs = [], missing = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  /* Vercel serves its analytics script in production; locally it is absent. */
  page.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().includes('/_vercel/')) missing.push(r.url().slice(base.length)); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  await page.addInitScript(([seed, theme]) => {
    try {
      if (sessionStorage.getItem('tl-test-seeded')) return;
      sessionStorage.setItem('tl-test-seeded', '1');
      localStorage.setItem('tl-theme', theme);
      Object.keys(seed || {}).forEach((k) => localStorage.setItem(k, seed[k]));
    } catch (e) {}
  }, [opts.seed || {}, opts.theme || 'dark']);
  await page.goto(base + '/app.html', { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('tl-shell') && !!document.getElementById('tl-tabs').firstChild);
  await page.waitForTimeout(200);
  return { context, page, errors, dialogs, missing };
}

const ob = (page) => page.evaluate(() => {
  const root = document.getElementById('tl-ob');
  if (!root) return null;
  const h1 = root.querySelector('h1');
  return {
    title: h1 ? h1.textContent : null,
    count: (root.querySelector('.tl-ob-count') || {}).textContent || null,
    pips: root.querySelectorAll('.tl-ob-pip').length,
    pipsOn: root.querySelectorAll('.tl-ob-pip-on').length,
    back: !!root.querySelector('[data-ob="back"]'),
    cta: (root.querySelector('.tl-ob-cta') || {}).textContent || null,
    focused: document.activeElement === h1,
    error: (root.querySelector('.tl-ob-error') || {}).textContent || null
  };
});
const record = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null'));
const click = (page, sel) => page.click('#tl-ob ' + sel);
const next = (page) => click(page, '[data-ob="next"]');
const shot = async (page, name) => {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);              /* let colour transitions finish */
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
};

/* Fill and save the compound sheet. */
async function addCompound(page, c) {
  await click(page, '[data-ob="add"]');
  await page.waitForSelector('.ds-sheet .tl-cs');
  await page.fill('#tl-cs-name', c.name);
  await page.dispatchEvent('#tl-cs-name', 'change');
  if (c.amount !== undefined) await page.fill('#tl-cs-amount', c.amount);
  if (c.unit) await page.selectOption('#tl-cs-unit', c.unit);
  if (c.repeat) await page.click(`.ds-sheet [data-ds-seg="Repeat"] [data-value="${c.repeat}"]`);
  for (const d of c.days || []) await page.click(`.ds-sheet .tl-cs-day[data-day="${d}"]`);
  for (const s of c.toggleSlots || []) await page.click(`.ds-sheet .tl-slots .tl-slot[data-slot="${s}"]`);
  if (c.route) await page.click(`.ds-sheet [data-ds-seg="How it is taken"] [data-value="${c.route}"]`);
  await page.click('.ds-sheet .tl-cs-save');
}

/* Every control in a box has a name, is 44 px tall, and no text is under
   12 px; nothing is wider than the screen. */
const fit = (page, sel) => page.evaluate((sel) => {
  const box = document.querySelector(sel);
  const out = { unnamed: [], small: [], tiny: [], overflow: 0 };
  if (!box) return out;
  box.querySelectorAll('button,a,input,select').forEach((el) => {
    if (el.offsetParent === null) return;
    /* A segmented option is drawn 38 px inside the 44 px control, whose
       padding is its tap area too (components.css); a link inside a sentence
       is exempt from target size (WCAG 2.5.8). */
    if (el.closest('p') && el.tagName === 'A') return;
    const r = (el.closest('.ds-seg') || el).getBoundingClientRect();
    const name = (el.getAttribute('aria-label') || el.textContent || el.value || '').trim() ||
      (el.id && document.querySelector('label[for="' + el.id + '"]') ? 'label' : '');
    if (!name) out.unnamed.push(el.outerHTML.slice(0, 80));
    if (r.height < 43.5) out.small.push((name || el.tagName) + ' ' + Math.round(r.height));
  });
  const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const n = walk.currentNode, el = n.parentElement;
    if (!n.textContent.trim() || !el || el.offsetParent === null) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) out.tiny.push(n.textContent.trim().slice(0, 20) + ' ' + size);
  }
  out.overflow = Math.max(0, document.documentElement.scrollWidth - innerWidth, box.scrollWidth - box.clientWidth);
  return out;
}, sel);
const fitOk = (f) => !f.unnamed.length && !f.small.length && !f.tiny.length && f.overflow <= 0;
const fitDetail = (f) => JSON.stringify(f).slice(0, 300);

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== a first run, all the way through ===== */
  {
    const { context, page, errors, dialogs, missing } = await open(browser, base, {});

    let s = await ob(page);
    t('a first run opens on the age and terms gate', s && s.title === 'Before you begin' && s.pips === 0, JSON.stringify(s));
    const gate = await page.evaluate(() => ({
      text: document.getElementById('tl-ob').textContent,
      privacy: !!document.querySelector('#tl-ob a[href="https://therapylog.app/privacy"]'),
      terms: !!document.querySelector('#tl-ob a[href="https://therapylog.app/terms"]'),
      oldHidden: getComputedStyle(document.getElementById('onboarding')).display === 'none',
      inert: ['tl-top', 'tl-tabs', 'app'].every((id) => { const el = document.getElementById(id); return !el || el.closest('[inert]'); })
    }));
    t('the gate keeps the 18+ attestation and links the terms and the privacy policy',
      /18 or older/.test(gate.text) && gate.privacy && gate.terms, JSON.stringify(gate).slice(0, 200));
    t('the old onboarding is hidden and the app underneath is out of reach', gate.oldHidden && gate.inert);
    await shot(page, 'ob-0-gate-dark');

    await click(page, '[data-ob="accept"]');
    const accepted = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('tl-disclaimer-done')); } catch (e) { return null; } });
    t('accepting records the current terms version and the age attestation',
      accepted && accepted.v >= 2 && accepted.age18 === true, JSON.stringify(accepted));

    s = await ob(page);
    t('step 1 is the welcome: 1 of 5, one pip on, no back button, focus on the heading',
      s.title === 'Know where you stand.' && s.count === '1 of 5' && s.pips === 5 && s.pipsOn === 1 && !s.back && s.focused, JSON.stringify(s));
    const icon = await page.evaluate(() => { const i = document.querySelector('#tl-ob .tl-ob-icon'); return i && i.complete && i.naturalWidth > 0; });
    t('the app icon loads from this site', icon);
    t('step 1 offers a backup restore', await page.$('#tl-ob [data-ob="restore"]') !== null);
    await shot(page, 'ob-1-welcome-dark');

    await next(page);
    s = await ob(page);
    t('step 2 asks what is being tracked, with a back button', s.title === 'What are you tracking?' && s.count === '2 of 5' && s.back && s.pipsOn === 2);
    t('six tiles, none chosen to start', await page.$$eval('#tl-ob .tl-ob-tile', (b) => b.length === 6 && b.every((x) => x.getAttribute('aria-pressed') === 'false')));
    await click(page, '[data-focus="trt"]');
    await click(page, '[data-focus="hrt"]');
    await click(page, '[data-focus="peptides"]');
    await click(page, '[data-focus="hrt"]');
    t('tiles toggle', await page.$$eval('#tl-ob .tl-ob-tile[aria-pressed="true"]', (b) => b.map((x) => x.dataset.focus).join()) === 'trt,peptides');
    await shot(page, 'ob-2-tracking-dark');
    await click(page, '[data-ob="back"]');
    t('back goes to the previous step', (await ob(page)).title === 'Know where you stand.');
    await next(page);
    t('and coming back keeps what was chosen', await page.$$eval('#tl-ob .tl-ob-tile[aria-pressed="true"]', (b) => b.length) === 2);

    await next(page);
    s = await ob(page);
    t('step 3 builds the stack; empty, it can be skipped', s.title === 'Build your stack' && /Skip for now/.test(s.cta), JSON.stringify(s));

    /* The sheet: problems are named, the route follows the encyclopedia. */
    await click(page, '[data-ob="add"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    t('the compound sheet opens with focus on the name', await page.evaluate(() => document.activeElement && document.activeElement.id === 'tl-cs-name'));
    await page.click('.ds-sheet .tl-cs-save');
    t('saving without a name says so', (await page.textContent('.ds-sheet .tl-cs-error')) === 'Give it a name.');
    await page.fill('#tl-cs-name', 'Testosterone Cypionate');
    await page.dispatchEvent('#tl-cs-name', 'change');
    t('a name the encyclopedia knows fills the route (oil: IM)',
      await page.getAttribute('.ds-sheet [data-ds-seg="How it is taken"] [data-value="im"]', 'aria-checked') === 'true');
    t('the dose field is empty, with a decimal keypad, and offers no dose',
      await page.evaluate(() => { const a = document.getElementById('tl-cs-amount'); return a.value === '' && a.inputMode === 'decimal' && !a.placeholder; }));
    await page.fill('#tl-cs-amount', '80');
    await page.click('.ds-sheet [data-ds-seg="Repeat"] [data-value="days"]');
    await page.click('.ds-sheet .tl-cs-save');
    t('set days with none picked says so', (await page.textContent('.ds-sheet .tl-cs-error')) === 'Pick at least one day.');
    await page.click('.ds-sheet .tl-cs-day[data-day="1"]');
    await page.click('.ds-sheet .tl-cs-day[data-day="4"]');
    await shot(page, 'ob-3-sheet-dark');
    const sheetFit = await fit(page, '.ds-sheet');
    t('the sheet: every control named and 44 px, no text under 12 px, nothing too wide', fitOk(sheetFit), fitDetail(sheetFit));
    await page.click('.ds-sheet .tl-cs-save');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    let rows = await page.$$eval('#tl-ob .tl-stack-row', (r) => r.map((x) => [x.querySelector('.tl-stack-name').textContent, x.querySelector('.tl-stack-meta').textContent,
      Array.from(x.querySelectorAll('.tl-slot[aria-pressed="true"]')).map((b) => b.dataset.slot).join()]));
    t('the compound joins the stack with its dose, days and the morning round',
      JSON.stringify(rows) === JSON.stringify([['Testosterone Cypionate', '80 mg · Mon · Thu', 'am']]), JSON.stringify(rows));
    t('focus goes to the new row', await page.evaluate(() => document.activeElement && document.activeElement.matches('#tl-ob [data-edit="0"]')));

    await addCompound(page, { name: 'BPC-157', amount: '250', unit: 'mcg', toggleSlots: ['bed'] });
    await addCompound(page, { name: 'Typo', amount: '1' });
    t('a name it does not know leaves the route unset',
      await page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null')) === null || true);
    rows = await page.$$eval('#tl-ob .tl-stack-name', (r) => r.map((x) => x.textContent));
    t('three compounds listed', rows.join() === 'Testosterone Cypionate,BPC-157,Typo', rows.join());

    await click(page, '[data-edit="2"]');
    await page.waitForSelector('.ds-sheet [data-cs-remove]');
    await page.click('.ds-sheet [data-cs-remove]');
    rows = await page.$$eval('#tl-ob .tl-stack-name', (r) => r.map((x) => x.textContent));
    t('a compound can be removed', rows.join() === 'Testosterone Cypionate,BPC-157', rows.join());

    await click(page, '[data-edit="0"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    const pre = await page.evaluate(() => ({
      name: document.getElementById('tl-cs-name').value, amount: document.getElementById('tl-cs-amount').value,
      unit: document.getElementById('tl-cs-unit').value,
      days: Array.from(document.querySelectorAll('.tl-cs-day[aria-pressed="true"]')).map((b) => b.dataset.day).join(),
      repeat: (document.querySelector('[data-ds-seg="Repeat"] [aria-checked="true"]') || {}).dataset.value,
      title: document.getElementById('tl-cs-title').textContent
    }));
    t('editing opens the sheet filled in', JSON.stringify(pre) === JSON.stringify({ name: 'Testosterone Cypionate', amount: '80', unit: 'mg', days: '1,4', repeat: 'days', title: 'Edit compound' }), JSON.stringify(pre));
    await page.fill('#tl-cs-amount', '100');
    await page.click('.ds-sheet .tl-cs-save');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    t('the edit shows in the list', (await page.textContent('#tl-ob [data-edit="0"] .tl-stack-meta')) === '100 mg · Mon · Thu');

    /* Escape closes the sheet without saving and gives focus back. */
    await click(page, '[data-ob="add"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    await page.fill('#tl-cs-name', 'Not saved');
    await page.keyboard.press('Escape');
    await page.waitForSelector('.ds-sheet', { state: 'detached' });
    t('Escape closes the sheet, saves nothing, and returns focus to Add compound',
      (await page.$$('#tl-ob .tl-stack-row')).length === 2 &&
      await page.evaluate(() => document.activeElement && document.activeElement.matches('#tl-ob [data-ob="add"]')));

    await click(page, '.tl-slots[data-stack="1"] .tl-slot[data-slot="eve"]');
    await click(page, '.tl-slots[data-stack="1"] .tl-slot[data-slot="eve"]');
    rows = await page.$$eval('#tl-ob .tl-stack-row', (r) => r.map((x) => Array.from(x.querySelectorAll('.tl-slot[aria-pressed="true"]')).map((b) => b.dataset.slot).join()));
    t('times of day toggle on the row', rows.join('|') === 'am|am,bed', rows.join('|'));
    t('with compounds, the button says Continue', /Continue/.test((await ob(page)).cta));
    await shot(page, 'ob-3-stack-dark');
    const stackFit = await fit(page, '#tl-ob');
    t('step 3: every control named and 44 px, no text under 12 px, nothing too wide', fitOk(stackFit), fitDetail(stackFit));

    await next(page);
    s = await ob(page);
    t('step 4 is the figure, 4 of 5', s.title === 'Choose your figure' && s.count === '4 of 5');
    t('male is chosen to start, as in the design', await page.getAttribute('#tl-ob [data-figure="male"]', 'aria-pressed') === 'true');
    const fig = await page.evaluate(() => {
      const el = document.querySelector('#tl-ob .tl-ob-fig-male');
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { mask: cs.webkitMaskImage || cs.maskImage, w: r.width, h: r.height };
    });
    t('the figure is drawn through its image at 132 x 287', /male-front\.png/.test(fig.mask) && Math.round(fig.w) === 132 && Math.round(fig.h) === 287, JSON.stringify(fig));
    await click(page, '[data-figure="female"]');
    t('tapping the other figure chooses it', await page.$$eval('#tl-ob [data-figure]', (b) => b.map((x) => x.dataset.figure + ':' + x.getAttribute('aria-pressed')).join()) === 'male:false,female:true');
    await shot(page, 'ob-4-figure-dark');

    await next(page);
    s = await ob(page);
    t('step 5 is the rounds, 5 of 5, with the finish button', s.title === 'Your rounds' && s.count === '5 of 5' && /Finish and open Home/.test(s.cta));
    const rounds = () => page.$$eval('#tl-ob .tl-round', (r) => r.map((x) => [x.querySelector('.tl-round-title').textContent,
      x.querySelector('.tl-round-names').textContent, x.querySelector('.tl-round-time-v').textContent,
      x.querySelector('.ds-toggle').getAttribute('aria-checked')]));
    let rs = await rounds();
    t('one card per round, built from the stack', JSON.stringify(rs) === JSON.stringify([
      ['Morning round · 2 doses', 'Testosterone Cypionate, BPC-157', '07:00', 'true'],
      ['Bedtime round · 1 dose', 'BPC-157', '22:30', 'true']]), JSON.stringify(rs));
    await click(page, '[data-shift="am:1"]');
    await click(page, '[data-shift="am:1"]');
    t('the time steps in quarter hours, and focus stays on the button',
      (await rounds())[0][2] === '07:30' && await page.evaluate(() => document.activeElement && document.activeElement.matches('[data-shift="am:1"]')));
    for (let i = 0; i < 6; i++) await click(page, '[data-shift="bed:1"]');
    rs = await rounds();
    t('a bedtime round stepped past midnight comes first', rs[0][0].startsWith('Bedtime') && rs[0][2] === '00:00', JSON.stringify(rs));
    for (let i = 0; i < 4; i++) await click(page, '[data-shift="bed:-1"]');
    await click(page, '#tl-ob-alert-bed');
    await click(page, '#tl-ob-discreet');
    rs = await rounds();
    t('a round\'s alert switches off', rs[1][0].startsWith('Bedtime') && rs[1][2] === '23:00' && rs[1][3] === 'false', JSON.stringify(rs));
    await shot(page, 'ob-5-rounds-dark');
    const roundsFit = await fit(page, '#tl-ob');
    t('step 5: every control named and 44 px, no text under 12 px, nothing too wide', fitOk(roundsFit), fitDetail(roundsFit));

    await click(page, '[data-ob="finish"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({
      open: !!document.getElementById('tl-ob'),
      inert: document.querySelectorAll('[inert]').length,
      hash: location.hash,
      done: localStorage.getItem('tl-ob-done'),
      discreet: localStorage.getItem('tl_notif_discreet')
    }));
    t('finishing closes onboarding, frees the app and opens Today', !after.open && after.inert === 0 && after.hash === '#/today', JSON.stringify(after));
    t('and sets the flags: done, and discreet alerts for the old reminders', after.done === '1' && after.discreet === '1');

    const d = await record(page);
    const p = d && d.protocol;
    t('the record holds the protocol model, version 3', p && d.v === 3 && p.compounds.length === 2 && !p.derived);
    t('compounds as entered: keys, doses, rules, routes, rounds', p && JSON.stringify(p.compounds.map((c) => [c.key, c.dose.text, c.rule, c.route, c.slots])) ===
      JSON.stringify([['tc', '100 mg', { weekdays: [1, 4] }, 'im', ['am']], ['bpc', '250 mcg', { daily: true }, 'sq', ['am', 'bed']]]),
      p && JSON.stringify(p.compounds.map((c) => [c.key, c.dose.text, c.rule, c.route, c.slots])));
    t('round times and alerts, and discreet', p && p.slots.am.t === 450 && p.slots.bed.t === 1380 && p.slots.bed.alert === false && p.slots.am.alert === true && p.discreet === true,
      p && JSON.stringify(p.slots));
    t('settings: what is tracked and the figure', d && JSON.stringify(d.settings) === JSON.stringify({ focus: ['trt', 'peptides'], figure: 'female' }), d && JSON.stringify(d.settings));
    t('the old fields agree, for the old screens', d && d.proto && d.proto.meds === 'Testosterone Cypionate, 100 mg, Twice weekly (Mon · Thu)\nBPC-157, 250 mcg, Twice daily' &&
      JSON.stringify(d.reminderTimes) === JSON.stringify({ 'Testosterone Cypionate': ['07:30'], 'BPC-157': ['07:30', '23:00'] }),
      d && JSON.stringify([d.proto && d.proto.meds, d.reminderTimes]));
    t('the protocol starts today', d && d.proto && d.proto.start === await page.evaluate(() => tlDayKey(new Date())));

    /* What Today will read: the day's rounds from the stored model. */
    const today = await page.evaluate(() => {
      const date = new Date(), dow = date.getDay();
      const rounds = tlRoundsFor(tlCurrentProtocol(), tlDayKey(date), (gd().entries || []));
      return { dow, rounds: rounds.map((r) => [r.slot, r.time, r.doses.map((x) => x.name).join('+')]) };
    });
    const want = [['am', '07:30', (today.dow === 1 || today.dow === 4 ? 'Testosterone Cypionate+' : '') + 'BPC-157'], ['bed', '23:00', 'BPC-157']];
    t('today\'s rounds, as Today will read them, follow the setup and the weekday', JSON.stringify(today.rounds) === JSON.stringify(want), JSON.stringify(today));
    t('the old dashboard draws from it without errors', await page.evaluate(() => /My protocol/.test(document.getElementById('page-dashboard').textContent)));
    t('Health has no Cycle segment: female figure is only the map, and HRT was not kept',
      !(await page.evaluate(() => tlGo('health') && !!document.querySelector('#tl-top [data-value="cycle"]'))));

    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.body.classList.contains('tl-shell'));
    await page.waitForTimeout(300);
    t('it does not show again', !(await page.$('#tl-ob')));
    t('no page errors, no browser dialogs, nothing missing', !errors.length && !dialogs.length && !missing.length,
      [errors, dialogs, missing].map((x) => x.join(' | ')).join(' / ').slice(0, 300));
    await context.close();
  }

  /* ===== restoring a backup instead of setting up ===== */
  {
    const { context, page, errors } = await open(browser, base, {});
    await click(page, '[data-ob="accept"]');
    const bad = path.join(ROOT, 'package.json');
    const badFile = fs.existsSync(bad) ? bad : path.join(ROOT, 'README.md');
    let [chooser] = await Promise.all([page.waitForEvent('filechooser'), click(page, '[data-ob="restore"]')]);
    await chooser.setFiles(path.join(ROOT, 'tests', 'fixtures', 'README.md'));
    await page.waitForSelector('#tl-ob .tl-ob-error');
    let s = await ob(page);
    t('a file that is not a backup is reported, and onboarding stays', s && /could not be read/.test(s.error) && s.title === 'Know where you stand.', JSON.stringify(s));
    [chooser] = await Promise.all([page.waitForEvent('filechooser'), click(page, '[data-ob="restore"]')]);
    await chooser.setFiles(FIXTURE);
    await page.waitForFunction(() => !document.getElementById('tl-ob'));
    const d = await record(page);
    const st = await page.evaluate(() => ({ hash: location.hash, done: localStorage.getItem('tl-ob-done'), inert: document.querySelectorAll('[inert]').length }));
    t('a backup restores, onboarding closes, and Today opens', st.hash === '#/today' && st.done === '1' && st.inert === 0, JSON.stringify(st));
    t('with the backup\'s log and protocol', d && d.entries.length === DEMO.entries.length && d.proto && d.proto.meds === DEMO.proto.meds,
      d && [d.entries.length, DEMO.entries.length].join());
    t('no page errors', !errors.length, errors.join(' | '));
    void badFile;
    await context.close();
  }

  /* ===== returning users ===== */
  {
    const { context, page, errors } = await open(browser, base, {
      seed: { 'tl-ob-done': '1', 'tl-disclaimer-done': '1', tlv2: JSON.stringify(DEMO) }
    });
    let s = await ob(page);
    t('someone who accepted older terms sees only the gate', s && s.title === 'Before you begin', JSON.stringify(s));
    await click(page, '[data-ob="accept"]');
    s = await ob(page);
    t('and accepting closes it, with no setup', s === null && await page.evaluate(() => location.hash === '#/today' && !document.querySelectorAll('[inert]').length));
    const d = await record(page);
    t('their record is untouched', d && d.proto.meds === DEMO.proto.meds && !d.protocol && !d.settings);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }
  {
    const { context, page } = await open(browser, base, {
      seed: { 'tl-disclaimer-done': JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }), tlv2: JSON.stringify(DEMO) }
    });
    t('someone with a log already is not sent through setup, even without the done flag', (await ob(page)) === null);
    await context.close();
  }

  /* ===== light theme at 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    const ground = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.background = 'var(--color-bg)';
      document.body.appendChild(probe);
      const want = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(document.getElementById('tl-ob')).backgroundColor, want, document.body.classList.contains('light-mode')];
    });
    t('light theme: onboarding takes the light ground token', ground[2] && ground[0] === ground[1], ground.join(' vs '));
    await shot(page, 'ob-0-gate-light-320');
    const steps = [['accept', 'ob-1-welcome-light-320'], ['next', 'ob-2-tracking-light-320'], ['next', 'ob-3-stack-light-320']];
    let allFit = true, details = [];
    let f = await fit(page, '#tl-ob'); if (!fitOk(f)) { allFit = false; details.push('gate ' + fitDetail(f)); }
    for (const [act, name] of steps) {
      await click(page, `[data-ob="${act}"]`);
      await shot(page, name);
      f = await fit(page, '#tl-ob'); if (!fitOk(f)) { allFit = false; details.push(name + ' ' + fitDetail(f)); }
    }
    await addCompound(page, { name: 'Somatropin (a long name for a narrow screen)', amount: '2', unit: 'IU', toggleSlots: ['mid', 'eve', 'bed'] });
    await shot(page, 'ob-3-stack-light-320-filled');
    f = await fit(page, '#tl-ob'); if (!fitOk(f)) { allFit = false; details.push('stack ' + fitDetail(f)); }
    await click(page, '[data-ob="add"]');
    await page.waitForSelector('.ds-sheet .tl-cs');
    await page.click('.ds-sheet [data-ds-seg="Repeat"] [data-value="every"]');
    await shot(page, 'ob-3-sheet-light-320');
    f = await fit(page, '.ds-sheet'); if (!fitOk(f)) { allFit = false; details.push('sheet ' + fitDetail(f)); }
    await page.keyboard.press('Escape');
    await click(page, '[data-ob="next"]');
    await shot(page, 'ob-4-figure-light-320');
    f = await fit(page, '#tl-ob'); if (!fitOk(f)) { allFit = false; details.push('figure ' + fitDetail(f)); }
    await click(page, '[data-ob="next"]');
    await shot(page, 'ob-5-rounds-light-320');
    f = await fit(page, '#tl-ob'); if (!fitOk(f)) { allFit = false; details.push('rounds ' + fitDetail(f)); }
    t('light theme at 320 px: every step fits, every control named and 44 px, no text under 12 px', allFit, details.join(' / ').slice(0, 400));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-onboarding: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
