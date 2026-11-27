#!/usr/bin/env node
/* Library -> Tools, in a browser (src/ui/tools.js).
 *
 * The reconstitution calculator: empty fields that are never pre-filled, the
 * design's arithmetic on what is typed (strength, volume, units, doses in the
 * vial), the syringe chips and the over-capacity warning, a comma decimal,
 * nonsense and zero, Clear, and the numbers kept while the app is open. Then
 * "More tools": every tool a row that opens it, a Pro tag on the gated ones
 * for someone without a plan (whose tap opens the upgrade screen), and Back
 * returning to where the tool was opened from. Fit at 320 px, light.
 *
 *   node scripts/ui-check-tools.js
 *   SHOTS=dir node scripts/ui-check-tools.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-tools: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/library/tools'), { waitUntil: 'load' });
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


const fill = async (page, mg, ml, dose) => {
  for (const [id, v] of [['tl-recon-mg', mg], ['tl-recon-ml', ml], ['tl-recon-dose', dose]]) await page.fill('#' + id, v);
  await page.waitForTimeout(60);
};
const out = (page) => page.evaluate(() => {
  const o = document.getElementById('tl-recon-out');
  const dd = Array.from(o.querySelectorAll('.tl-recon-stat dd')).map((x) => x.textContent.replace(/\s+/g, ' ').trim());
  const fillEl = o.querySelector('.tl-recon-fill'), bar = o.querySelector('.tl-recon-bar');
  return {
    empty: !!o.querySelector('.tl-recon-empty'), text: o.textContent.replace(/\s+/g, ' ').trim(),
    big: (o.querySelector('.ds-big') || {}).textContent || null,
    strength: dd[0] || null, volume: dd[1] || null, doses: dd[2] || null,
    fill: fillEl ? parseFloat(fillEl.style.width) : null,
    scale: (o.querySelector('.tl-recon-scale span:last-child') || {}).textContent || null,
    over: !!o.querySelector('.tl-recon-over'), barOver: !!bar && bar.classList.contains('tl-recon-bar-over')
  };
});
const values = (page) => page.evaluate(() => ['tl-recon-mg', 'tl-recon-ml', 'tl-recon-dose'].map((id) => document.getElementById(id).value));
/* The typed number ends before its unit begins. */
const unitsClear = (page) => page.evaluate(() => ['tl-recon-mg', 'tl-recon-ml', 'tl-recon-dose'].every((id) => {
  const el = document.getElementById(id), unit = el.parentNode.querySelector('.tl-recon-unit');
  return el.getBoundingClientRect().right - parseFloat(getComputedStyle(el).paddingRight) <= unit.getBoundingClientRect().left - 2;
}));
const syringe = async (page, v) => { await page.click(`.tl-recon-syr .ds-chip[data-value="${v}"]`); await page.waitForTimeout(60); };
const tools = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.tl-tools-list [data-tl-go]')).map((r) => ({
  route: r.getAttribute('data-tl-go'), title: r.querySelector('.ds-row-title').textContent,
  sub: (r.querySelector('.ds-row-sub') || {}).textContent || '', tags: Array.from(r.querySelectorAll('.ds-tag')).map((x) => x.textContent)
})));
const where = (page) => page.evaluate(() => {
  const vis = (id) => { const el = document.getElementById(id); return !!el && el.offsetParent !== null && el.getBoundingClientRect().height > 0; };
  return {
    route: tlRoute, hash: location.hash, title: (document.querySelector('#tl-top h1') || {}).textContent || null,
    shown: ['tool-calc', 'tool-interact', 'tool-templates', 'tool-body', 'tool-symptom', 'tool-cost', 'tool-pct', 'tool-syringe', 'tool-manage',
      'page-tools', 'page-stack', 'page-cycle', 'pk-ss'].filter(vis),
    oldTabs: Array.from(document.querySelectorAll('#page-tools .seg, #page-cycle .seg')).some((s) => s.offsetParent !== null),
    upgrade: (document.getElementById('tl-upgrade-overlay') || {}).textContent || null,
    tools: !!document.querySelector('#tl-screen .tl-tools')
  };
});
const tap = async (page, sel) => { await page.click(sel); await page.waitForTimeout(250); return where(page); };
const back = (page) => tap(page, '#tl-top [data-tl-back]');
const closeUpgrade = (page) => page.evaluate(() => { const o = document.getElementById('tl-upgrade-overlay'); if (o) o.remove(); });

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== no plan, dark ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, {});
    let w = await where(page);
    t('#/library/tools is the new Tools screen, under the Library\'s Tools segment', w.route === 'library/tools' && w.tools && !w.shown.includes('page-tools') &&
      await page.evaluate(() => (document.querySelector('#tl-top .ds-seg [aria-selected="true"]') || {}).getAttribute('data-value') === 'tools'), JSON.stringify(w));
    const before = await record(page);
    t('the three fields start empty, with nothing suggested', JSON.stringify(await values(page)) === '["","",""]' &&
      await page.evaluate(() => ['tl-recon-mg', 'tl-recon-ml', 'tl-recon-dose'].every((id) => !/\d/.test(document.getElementById(id).placeholder || ''))));
    t('  each takes decimals, at 16 px so iOS does not zoom, and is labelled with its unit', await page.evaluate(() => ['tl-recon-mg', 'tl-recon-ml', 'tl-recon-dose'].every((id) => {
      const el = document.getElementById(id), label = document.querySelector('label[for="' + id + '"]');
      return el.inputMode === 'decimal' && getComputedStyle(el).fontSize === '16px' && !!label && /\((mg|mL|mcg)\)/.test(label.textContent);
    })));
    let o = await out(page);
    t('  and the result says what it needs', o.empty && o.text === 'Enter your vial, water and dose to see the draw.', o.text);
    t('  the 1 mL syringe is the one chosen to begin with', await page.evaluate(() => document.querySelector('.tl-recon-syr .ds-chip[aria-pressed="true"]').getAttribute('data-value') === '100'));
    t('the footer says it is arithmetic', /Arithmetic on your numbers\. It does not suggest a dose\./.test(await page.textContent('.tl-recon')));
    await shot(page, 'tools-empty-dark');

    await fill(page, '5', '2', '250');
    o = await out(page);
    t('5 mg in 2 mL, 250 mcg: 10 units, 2,500 mcg/mL, 0.1 mL, 20 doses', o.big === '10' && o.strength === '2,500 mcg/mL' && o.volume === '0.1 mL' && o.doses === '20', JSON.stringify(o));
    t('  at 390 px each unit sits clear of its number', await unitsClear(page));
    t('  the bar is a tenth full, on a 100 unit scale', Math.abs(o.fill - 10) < 0.01 && o.scale === '100 units' && !o.over, JSON.stringify(o));
    await shot(page, 'tools-filled-dark');
    await syringe(page, '30');
    o = await out(page);
    t('a 0.3 mL syringe: the same 10 units, a third of a 30 unit scale', o.big === '10' && Math.abs(o.fill - 33.33) < 0.01 && o.scale === '30 units' && !o.over, JSON.stringify(o));
    await page.fill('#tl-recon-dose', '1000');
    await page.waitForTimeout(60);
    o = await out(page);
    t('  40 units on it is more than it holds, and it says so', o.big === '40' && o.over && o.barOver && o.fill === 100 &&
      /More than this syringe holds\. Pick a larger one or add less water\./.test(o.text), JSON.stringify(o));
    await shot(page, 'tools-over-dark');
    await syringe(page, '50');
    o = await out(page);
    t('  and on a 0.5 mL one it fits', o.big === '40' && !o.over && !o.barOver && Math.abs(o.fill - 80) < 0.01 && o.scale === '50 units', JSON.stringify(o));
    await syringe(page, '30');
    await page.fill('#tl-recon-dose', '300');
    await page.waitForTimeout(60);
    o = await out(page);
    t('  exactly 30 units on 0.3 mL is not over', o.big === '12' && !o.over, JSON.stringify(o));
    await fill(page, '2,5', '1', '250');
    o = await out(page);
    t('a comma decimal reads as a point: 2,5 mg in 1 mL, 250 mcg is 10 units', o.big === '10' && o.strength === '2,500 mcg/mL' && o.doses === '10', JSON.stringify(o));
    await fill(page, '2', '1.5', '250');
    o = await out(page);
    t('uneven numbers: 18.8 units, 1,333 mcg/mL, 0.188 mL, 8 doses', o.big === '18.8' && o.strength === '1,333 mcg/mL' && o.volume === '0.188 mL' && o.doses === '8', JSON.stringify(o));
    await fill(page, '0.7', '1', '100');
    o = await out(page);
    t('  0.7 mg at 100 mcg is 7 doses, not 6', o.doses === '7', JSON.stringify(o));
    await fill(page, '5', '2', '6000');
    o = await out(page);
    t('  a dose larger than the vial: 0 doses in it', o.doses === '0', JSON.stringify(o));
    for (const [mg, ml, dose, why] of [['5', '0', '250', 'no water'], ['abc', '2', '250', 'a word'], ['5', '2', '-250', 'a negative dose'], ['5', '2', '', 'no dose'], ['1.2.3', '2', '250', 'two points']]) {
      await fill(page, mg, ml, dose);
      o = await out(page);
      t(`  ${why}: no result, only what it needs`, o.empty && o.big === null, JSON.stringify(o));
    }

    await fill(page, '10', '2', '500');
    await page.click('#tl-recon-clear');
    await page.waitForTimeout(60);
    o = await out(page);
    t('Clear empties the three fields and the result, and puts the cursor in the first', JSON.stringify(await values(page)) === '["","",""]' && o.empty &&
      await page.evaluate(() => document.activeElement && document.activeElement.id === 'tl-recon-mg'));
    await fill(page, '10', '2', '500');
    await page.click('#tl-top .ds-seg-opt[data-value="compounds"]');
    await page.waitForTimeout(200);
    await page.click('#tl-top .ds-seg-opt[data-value="tools"]');
    await page.waitForTimeout(200);
    o = await out(page);
    t('the numbers stay while the app is open: Compounds and back', JSON.stringify(await values(page)) === '["10","2","500"]' && o.big === '10', JSON.stringify(await values(page)));
    t('  and none of it is saved to the record', JSON.stringify(await record(page)) === JSON.stringify(before));
    await page.focus('#tl-recon-mg');
    await page.keyboard.press('Enter');
    t('Enter moves to the next field', await page.evaluate(() => document.activeElement.id === 'tl-recon-ml'));

    /* More tools. */
    const list = await tools(page);
    const nIx = await page.evaluate(() => INTERACTIONS.length), nTpl = await page.evaluate(() => TEMPLATES.length);
    t('More tools lists every tool once', JSON.stringify(list.map((r) => r.title)) === JSON.stringify(['Interaction checker', 'Protocol templates', 'Steady state', 'Cost and supply',
      'PCT builder', 'Body composition', 'Symptom patterns', 'Combined syringe', 'Stack builder', 'Side effects guide']), list.map((r) => r.title).join(', '));
    t('  with the counts from the app\'s own lists', list[0].sub === nIx + ' rules, checked against your stack' && list[1].sub === nTpl + ' starting points for a stack',
      list[0].sub + ' / ' + list[1].sub);
    const tags = Object.fromEntries(list.map((r) => [r.title, r.tags.join(',')]));
    t('  Pro on the gated tools, "Some Pro" on templates, nothing on the free ones', tags['Steady state'] === 'Pro' && tags['Cost and supply'] === 'Pro' && tags['PCT builder'] === 'Pro' &&
      tags['Symptom patterns'] === 'Pro' && tags['Protocol templates'] === 'Some Pro' && ['Interaction checker', 'Body composition', 'Combined syringe', 'Stack builder', 'Side effects guide'].every((x) => tags[x] === ''),
      JSON.stringify(tags));

    for (const [route, id, title] of [['library/interactions', 'tool-interact', 'Interactions'], ['library/templates', 'tool-templates', 'Templates'],
      ['library/bodycomp', 'tool-body', 'Body composition'], ['library/syringe', 'tool-syringe', 'Combined syringe'], ['library/sidefx', 'tool-manage', 'Side effects guide'],
      ['library/stack', 'page-stack', 'Stack builder']]) {
      w = await tap(page, `.tl-tools-list [data-tl-go="${route}"]`);
      t(`${title} opens, without the old page's row of tabs`, w.route === route && w.shown.includes(id) && !w.oldTabs && w.title === title, JSON.stringify(w));
      w = await back(page);
      t('  and Back returns to Tools', w.route === 'library/tools' && w.tools, w.route);
    }
    for (const [route, name] of [['library/steady', 'Steady-State'], ['library/cost', 'Cost & Supply'], ['library/pct', 'PCT Protocol Builder'], ['library/symptoms', 'Symptom Correlations']]) {
      w = await tap(page, `.tl-tools-list [data-tl-go="${route}"]`);
      t(`without a plan, ${route.split('/')[1]} opens the upgrade screen with its name, and stays on Tools`, !!w.upgrade && w.upgrade.includes(name) && w.route === 'library/tools' && w.tools,
        JSON.stringify({ route: w.route, upgrade: (w.upgrade || '').slice(0, 60) }));
      await closeUpgrade(page);
    }

    /* Back goes to where the tool was opened from. */
    await page.evaluate(() => tlGo('protocol'));
    await page.waitForTimeout(200);
    await page.evaluate(() => tlGo('library/interactions'));
    await page.waitForTimeout(200);
    w = await back(page);
    t('the interaction checker opened from Protocol goes Back to Protocol', w.route === 'protocol', w.route);
    await page.evaluate(() => tlGo('library/compound/tc'));
    await page.waitForTimeout(200);
    await page.click('.tl-lib-page [data-tl-go="library/interactions"]');
    await page.waitForTimeout(250);
    w = await back(page);
    t('  and from a compound\'s page, back to that compound', w.route === 'library/compound' && w.hash === '#/library/compound/tc' &&
      await page.evaluate(() => document.querySelector('.tl-lib-name').textContent === 'Testosterone Cypionate'), w.hash);
    await page.evaluate(() => { location.hash = '#/library/templates'; });
    await page.waitForTimeout(250);
    w = await back(page);
    t('  and when the address went straight there, Back to Protocol', w.route === 'protocol', w.route);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== a plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true });
    const list = await tools(page);
    t('with a plan: no Pro tags', list.every((r) => !r.tags.length), JSON.stringify(list.map((r) => r.tags)));
    let w = await tap(page, '.tl-tools-list [data-tl-go="library/pct"]');
    const pct = await page.evaluate(() => (document.getElementById('tool-pct') || {}).textContent || '');
    t('the PCT builder opens, drawn', w.route === 'library/pct' && w.shown.includes('tool-pct') && !w.oldTabs && w.title === 'PCT builder' && pct.trim().length > 40 && !w.upgrade,
      JSON.stringify(w));
    await shot(page, 'tools-pct-dark', true);
    w = await back(page);
    t('  and Back returns to Tools', w.route === 'library/tools' && w.tools);
    for (const [route, id, title] of [['library/cost', 'tool-cost', 'Cost and supply'], ['library/symptoms', 'tool-symptom', 'Symptom patterns'], ['library/steady', 'page-cycle', 'Steady state']]) {
      w = await tap(page, `.tl-tools-list [data-tl-go="${route}"]`);
      t(`${title} opens`, w.route === route && w.shown.includes(id) && !w.oldTabs && w.title === title && !w.upgrade, JSON.stringify(w));
      w = await back(page);
      t('  and Back returns to Tools', w.route === 'library/tools' && w.tools, w.route);
    }
    await page.evaluate(() => { location.hash = '#/library/pct'; });
    await page.waitForTimeout(300);
    w = await where(page);
    t('an address can link straight to a tool', w.route === 'library/pct' && w.shown.includes('tool-pct'), JSON.stringify(w));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light' });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Tools fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await fill(page, '10', '3', '10000');
    await syringe(page, '30');
    f = await fit(page, '#tl-screen');
    t('  and with large numbers and the warning showing', fitOk(f), fitDetail(f));
    t('  a field\'s unit never sits over its number', await unitsClear(page));
    await shot(page, 'tools-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-tools: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
