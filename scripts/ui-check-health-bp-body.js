#!/usr/bin/env node
/* Health -> Blood pressure (4c) and Body (6c), in a browser
 * (src/ui/bp.js, src/ui/body.js).
 *
 * Blood pressure, on the demo record with a plan: the latest reading and its
 * ACC/AHA category, the 14-day bars on a 60-150 scale with the 120 and 80
 * lines and a dose-change marker, the averages, the new-reading form's
 * limits and messages, a saved reading stored as the old form stored one, a
 * crisis reading's note, "All readings", no readings at all.
 *
 * Body: the latest weight and its 30-day change, the chart, the four stats,
 * the new-weight limits (60 to 700 lb), a saved weight, a metric profile in
 * kg and cm both ways, measurements with their change, "Measure" and back,
 * no weight at all. Both screens light at 320 px.
 *
 *   node scripts/ui-check-health-bp-body.js
 *   SHOTS=dir node scripts/ui-check-health-bp-body.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-health-bp-body: playwright is not installed — skipping.'); process.exit(0); }
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
  await page.goto(base + '/app.html' + (opts.hash || '#/health/bp'), { waitUntil: 'load' });
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
    shown: ['page-log', 'lt-bp', 'lt-weight', 'lt-body', 'page-tools', 'tool-body'].filter(vis),
    oldTabs: Array.from(document.querySelectorAll('#page-log .seg')).some((s) => s.offsetParent !== null),
    upgrade: (document.getElementById('tl-upgrade-overlay') || {}).textContent || null,
    bp: !!document.querySelector('#tl-screen .tl-bp'), body: !!document.querySelector('#tl-screen .tl-body')
  };
});
const tap = async (page, sel) => { await page.click(sel); await page.waitForTimeout(250); return where(page); };
const seed = (page, fn, arg) => page.evaluate(([src, arg]) => { const d = gd(); (new Function('d', 'arg', src))(d, arg); sd(d); }, [fn, arg]);
const go = async (page, route) => { await page.evaluate((r) => tlGo(r), route); await page.waitForTimeout(250); };
const bp = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const bars = Array.from(document.querySelectorAll('.tl-bp-bar')).map((b) => ({ top: parseFloat(b.style.top), bottom: parseFloat(b.style.bottom), last: b.classList.contains('tl-bp-bar-last') }));
  return {
    big: (q('.tl-bp-big .ds-big') || {}).textContent || null, slash: !!q('.tl-bp-big .tl-bp-slash'),
    stage: (q('.tl-bp-stage') || {}).textContent || null, stageCls: (q('.tl-bp-stage') || { className: '' }).className,
    meta: (q('.tl-bp-hero .tl-bp-meta') || {}).textContent || null, none: !!q('.tl-bp-hero .tl-bp-none'),
    bars, refs: document.querySelectorAll('.tl-bp-ref').length, labels: Array.from(document.querySelectorAll('.tl-bp-reflabel')).map((x) => x.textContent),
    changes: document.querySelectorAll('.tl-bp-hero .tl-bp-change').length, legend: Array.from(document.querySelectorAll('.tl-bp-hero .tl-bp-legend')).map((x) => x.textContent),
    chartLabel: (q('.tl-bp-chart') || { getAttribute: () => null }).getAttribute('aria-label'),
    avgs: Array.from(document.querySelectorAll('.tl-bp-avg')).map((x) => x.textContent),
    crisis: (q('.tl-bp-crisis') || {}).textContent || null,
    save: q('#tl-bp-save') ? q('#tl-bp-save').disabled : null, err: (q('#tl-bp-err') || {}).textContent || ''
  };
});
const typeBp = async (page, sys, dia, pulse) => {
  await page.fill('#tl-bp-sys', sys); await page.fill('#tl-bp-dia', dia); await page.fill('#tl-bp-pulse', pulse || '');
  await page.waitForTimeout(40);
  return bp(page);
};
const body = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return {
    big: (q('.tl-body-big .ds-big') || {}).textContent || null, unit: (q('.tl-body-big .ds-big-unit') || {}).textContent || null,
    delta: (q('.tl-body-delta') || {}).textContent || null, meta: (q('.tl-body .tl-bp-meta') || {}).textContent || null,
    none: !!q('.tl-body .tl-bp-none'), chart: !!q('.tl-body-chart svg .tl-body-line'), ring: !!q('.tl-body-ring'),
    changes: document.querySelectorAll('.tl-body-change').length, legend: Array.from(document.querySelectorAll('.tl-body .tl-bp-legend')).map((x) => x.textContent),
    stats: Object.fromEntries(Array.from(document.querySelectorAll('.tl-body-stat')).map((s) => [s.querySelector('.tl-body-stat-l').textContent, s.textContent.replace(s.querySelector('.tl-body-stat-l').textContent, '').replace(/\s+/g, ' ').trim()])),
    wu: (q('#tl-body-wu') || {}).textContent || null, save: q('#tl-body-save') ? q('#tl-body-save').disabled : null,
    mhead: (q('.tl-body-mhead .ds-label') || {}).textContent || null,
    mrows: Array.from(document.querySelectorAll('.tl-body-mrow')).map((r) => Array.from(r.children).map((c) => c.textContent).join('|')),
    mnone: !!q('.tl-body-mnone')
  };
});
const typeW = async (page, v) => { await page.fill('#tl-body-w', v); await page.waitForTimeout(40); return (await body(page)).save; };

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== blood pressure, with a plan ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { paid: true });
    /* A dose change inside the fortnight, and one before it. */
    await seed(page, "d.doseChanges = [{ ts: '2026-11-10T12:00:00.000Z', key: 'tc', name: 'Testosterone Cypionate', from: '100mg', to: '80mg' }, { ts: '2026-10-01T12:00:00.000Z', key: 'tc', name: 'Testosterone Cypionate', from: '120mg', to: '100mg' }];");
    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(400);
    let w = await where(page);
    t('#/health/bp is the new Blood pressure screen', w.route === 'health/bp' && w.bp && !w.shown.includes('lt-bp') &&
      await page.evaluate(() => (document.querySelector('#tl-top .ds-seg [aria-selected="true"]') || {}).getAttribute('data-value') === 'bp'), JSON.stringify(w));
    const ex = await page.evaluate(() => { const r = tlBpReadings(gd().entries); const l = r[r.length - 1]; const now = Date.now();
      return { sys: l.sys, dia: l.dia, hr: l.hr, stage: tlBpStage(l.sys, l.dia), daily: tlBpDaily(gd().entries, 14, now), a7: tlBpAverage(gd().entries, 7, now), a14: tlBpAverage(gd().entries, 14, now) }; });
    let s = await bp(page);
    t('the latest reading, the slash in accent, and its category', s.big === ex.sys + '/' + ex.dia && s.slash && s.stage === ex.stage.label && ex.stage.label === 'Elevated' && /ds-tag-warn/.test(s.stageCls), JSON.stringify(s.big + ' ' + s.stage));
    t('  "Nov 16 hh:mm · pulse 62"', /^Nov 16 \d\d:\d\d \u00b7 pulse 62$/.test(s.meta), s.meta);
    const days = ex.daily.filter((x) => x.sys !== null);
    t('a bar for each day with a reading in the fortnight, the latest marked', s.bars.length === days.length && s.bars.filter((b) => b.last).length === 1 && s.bars[s.bars.length - 1].last, s.bars.length + ' bars');
    const pct = (v) => Math.max(0, Math.min(100, (v - 60) / 90 * 100));
    t('  each from diastolic to systolic on the 60–150 scale', s.bars.every((b, i) => Math.abs(b.top - (100 - pct(days[i].sys))) < 0.01 && Math.abs(b.bottom - pct(days[i].dia)) < 0.01));
    t('  dashed lines at 120 and 80, labelled', s.refs === 2 && JSON.stringify(s.labels) === '["120","80"]');
    t('  and read out as a list of the days', /^Daily blood pressure, last 14 days: /.test(s.chartLabel) && s.chartLabel.includes('Nov 16 122/78'), s.chartLabel);
    t('the dose change inside the fortnight is marked and captioned; the older one is not', s.changes === 1 && JSON.stringify(s.legend) === '["Testosterone Cypionate dose changed Nov 10"]', JSON.stringify(s.legend));
    t('the 7- and 14-day averages', s.avgs[0] === '7-day average' + (ex.a7 ? ex.a7.sys + '/' + ex.a7.dia : 'No readings') && s.avgs[1] === '14-day average' + ex.a14.sys + '/' + ex.a14.dia, JSON.stringify(s.avgs));
    t('the footnote', /Categories follow the ACC\/AHA ranges\. They are not a diagnosis; share readings with your physician\./.test(await page.textContent('.tl-bp')));
    await shot(page, 'bp-dark');

    /* The form. */
    t('"Log reading" starts disabled, and the three fields are numeric', s.save === true && await page.evaluate(() => ['tl-bp-sys', 'tl-bp-dia', 'tl-bp-pulse'].every((id) => document.getElementById(id).inputMode === 'numeric' && document.getElementById(id).value === '')));
    s = await typeBp(page, '120', '80', '');
    t('  120/80 without a pulse is a reading', s.save === false && s.err === '');
    for (const [sys, dia, pulse, msg, why] of [['300', '80', '', 'Systolic is between 60 and 250.', 'systolic 300'], ['59', '40', '', 'Systolic is between 60 and 250.', 'systolic 59'],
      ['120', '170', '', 'Diastolic is between 30 and 160.', 'diastolic 170'], ['120', '29', '', 'Diastolic is between 30 and 160.', 'diastolic 29'],
      ['80', '90', '', 'Systolic, the first number, is the higher one.', 'the numbers the wrong way round'], ['90', '90', '', 'Systolic, the first number, is the higher one.', 'equal numbers'],
      ['120', '80', '10', 'Pulse is between 20 and 250.', 'pulse 10'], ['12a', '80', '', 'Systolic is between 60 and 250.', 'a letter']]) {
      s = await typeBp(page, sys, dia, pulse);
      t(`  ${why}: disabled, and says why`, s.save === true && s.err === msg, s.err);
    }
    s = await typeBp(page, '120', '', '');
    t('  half a reading: disabled, nothing said yet', s.save === true && s.err === '');
    const before = (await record(page)).entries.length;
    await typeBp(page, '135', '85', '70');
    await page.click('#tl-bp-save');
    await page.waitForTimeout(250);
    let rec = await record(page);
    const saved = rec.entries[0];
    t('saving stores it as the old form did', rec.entries.length === before + 1 && saved.type === 'bloodpressure' && saved.sys === 135 && saved.dia === 85 && saved.hr === 70 &&
      saved.device === '' && saved.conditions === '' && saved.notes === '' && typeof saved.stage === 'string' && saved.stage.length > 0 && !isNaN(new Date(saved.ts)), JSON.stringify(saved));
    s = await bp(page);
    t('  and shows it: 135/85, Stage 1, "Today hh:mm · pulse 70", the form cleared', s.big === '135/85' && s.stage === 'Stage 1 range' && /ds-tag-warn/.test(s.stageCls) &&
      /^Today \d\d:\d\d \u00b7 pulse 70$/.test(s.meta) && s.save === true && await page.inputValue('#tl-bp-sys') === '', JSON.stringify([s.big, s.stage, s.meta]));
    t('  with a toast', /Reading saved: 135\/85/.test(await page.evaluate(() => (document.getElementById('tl-toast') || {}).textContent || '')));
    await typeBp(page, '185', '95', '');
    await page.click('#tl-bp-save');
    await page.waitForTimeout(250);
    s = await bp(page);
    t('a crisis reading: its category in danger, and the AHA\'s note on what to do', s.stage === 'Crisis range' && /ds-tag-danger/.test(s.stageCls) &&
      /measuring again/.test(s.crisis || '') && /call emergency services/.test(s.crisis || ''), JSON.stringify([s.stage, (s.crisis || '').slice(0, 50)]));
    w = await tap(page, '[data-tl-go="health/readings"]');
    t('"All readings" opens the old BP section, without the old row of tabs', w.route === 'health/readings' && w.shown.includes('lt-bp') && !w.oldTabs && w.title === 'All readings', JSON.stringify(w));
    w = await tap(page, '#tl-top [data-tl-back]');
    t('  and Back returns to Blood pressure', w.route === 'health/bp' && w.bp, w.route);
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== no readings ===== */
  {
    const bare = JSON.parse(JSON.stringify(DEMO));
    bare.entries = bare.entries.filter((e) => e.type !== 'bloodpressure' && e.type !== 'weight');
    bare.bodyComp = [];
    const { context, page, errors } = await open(browser, base, { record: bare, paid: true });
    const s = await bp(page);
    t('no readings: says so, no chart, both averages "No readings"', s.none && !s.bars.length && s.avgs.every((a) => /No readings$/.test(a)) && s.big === null, JSON.stringify(s.avgs));
    await go(page, 'health/body');
    const b = await body(page);
    t('no weight: says so, no chart, the stats say what they need', b.none && !b.chart && b.stats['Body fat'] === 'Not logged' && b.stats['Lean mass'] === 'Needs a weight' &&
      b.stats.FFMI === 'Needs body fat' && b.stats.Waist === 'Not measured' && b.mnone, JSON.stringify(b.stats));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== body ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { hash: '#/health/body' });
    await seed(page, "d.doseChanges = [{ ts: '2026-11-10T12:00:00.000Z', key: 'tc', name: 'Testosterone Cypionate', from: '100mg', to: '80mg' }];" +
      "d.entries.push({ type: 'body', ts: '2026-10-25T15:00:00.000Z', measurements: { waist: 34, chest: 44 } }, { type: 'body', ts: '2026-11-09T15:00:00.000Z', measurements: { waist: 33.5, chest: 44.5, larm: 15.5 } });");
    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(400);
    let w = await where(page);
    t('#/health/body is the new Body screen', w.route === 'health/body' && w.body && !w.shown.includes('lt-weight'), JSON.stringify(w));
    const ex = await page.evaluate(() => tlWeightChange(gd().entries, 30, Date.now()));
    let b = await body(page);
    const sign = (n) => (n < 0 ? '\u2212' : n > 0 ? '+' : '') + Math.abs(n).toFixed(1);
    t('the latest weight in lb, and its 30-day change', b.big === '195.2' && b.unit === 'lb' && b.delta === sign(ex.change) + ' lb' && ex.change < 0, JSON.stringify([b.big, b.delta, ex.change]));
    t('  "Nov 16 hh:mm · 30 days"', /^Nov 16 \d\d:\d\d \u00b7 30 days$/.test(b.meta), b.meta);
    t('the chart: line, area and the last weight as a ring; the dose change marked', b.chart && b.ring && b.changes === 1 && JSON.stringify(b.legend) === '["Testosterone Cypionate dose changed Nov 10"]', JSON.stringify(b.legend));
    t('the stats: body fat from the tool, lean mass and FFMI from it, the newest waist', b.stats['Body fat'] === '16.2 %' && b.stats['Lean mass'] === '163.6 lb' && b.stats.FFMI === '22.8' && b.stats.Waist === '33.5 in', JSON.stringify(b.stats));
    t('the measurements of the newest entry, each with its change', b.mhead === 'Measurements \u00b7 Nov 9' &&
      JSON.stringify(b.mrows) === JSON.stringify(['Waist|33.5 in|\u22120.5', 'Chest|44.5 in|+0.5', 'Left arm|15.5 in|']), JSON.stringify(b.mrows));
    t('the footnote says lean mass and FFMI are estimates', /Lean mass and FFMI are estimates/.test(await page.textContent('.tl-body')));
    await shot(page, 'body-dark', true);

    t('"Log weight" starts disabled', b.save === true && b.wu === 'lb');
    for (const [v, ok] of [['59.9', false], ['60', true], ['700', true], ['700.1', false], ['abc', false], ['', false], ['182,4', true]]) {
      const disabled = await typeW(page, v);
      t(`  ${JSON.stringify(v)} lb: ${ok ? 'enabled' : 'disabled'}`, disabled === !ok);
    }
    const n0 = (await record(page)).entries.length;
    await typeW(page, '190.4');
    await page.click('#tl-body-save');
    await page.waitForTimeout(250);
    let rec = await record(page);
    t('saving a weight stores it as the old form did, and shows it', rec.entries.length === n0 + 1 && rec.entries[0].type === 'weight' && rec.entries[0].weight === 190.4 &&
      'energy' in rec.entries[0] && rec.entries[0].notes === '' && (await body(page)).big === '190.4', JSON.stringify(rec.entries[0]));

    /* Measure, and back. */
    w = await tap(page, '[data-tl-go="health/measure"]');
    t('"Measure" opens the old measurement form alone', w.route === 'health/measure' && w.shown.includes('lt-body') && !w.shown.includes('lt-weight') && !w.oldTabs && w.title === 'Measurements', JSON.stringify(w));
    await page.fill('#bwa', '33');
    await page.click('#lt-body button[onclick="saveBody()"]');
    await page.waitForTimeout(300);
    w = await where(page);
    b = await body(page);
    t('  saving there comes back to Body, with the new waist and its change', w.route === 'health/body' && b.stats.Waist === '33.0 in' && b.mrows[0] === 'Waist|33.0 in|\u22120.5', JSON.stringify([w.route, b.mrows]));
    w = await tap(page, '[data-tl-go="log"]');
    t('"Daily check-in" opens the old weight form, with its other fields', w.route === 'log' && w.shown.includes('lt-weight'), JSON.stringify(w));
    await go(page, 'health/body');
    w = await tap(page, '[data-tl-go="library/bodycomp"]');
    t('"Body composition" opens the tool', w.route === 'library/bodycomp' && w.shown.includes('tool-body'), JSON.stringify(w));

    /* Metric. */
    await seed(page, "d.settings = Object.assign({}, d.settings, { units: 'metric' });");
    await go(page, 'health/body');
    b = await body(page);
    t('a metric profile: kg and cm', b.big === (Math.round(190.4 / 2.2046226218 * 10) / 10).toFixed(1) && b.unit === 'kg' && b.wu === 'kg' && b.stats.Waist === '83.8 cm' &&
      b.mrows[0] === 'Waist|83.8 cm|\u22121.3', JSON.stringify([b.big, b.stats.Waist, b.mrows[0]]));
    t('  27 kg (59.5 lb) is too light, 27.3 kg (60.2 lb) is not', await typeW(page, '27') === true && await typeW(page, '27.3') === false);
    await typeW(page, '90');
    await page.click('#tl-body-save');
    await page.waitForTimeout(250);
    rec = await record(page);
    t('  90 kg is stored as 198.4 lb, and shown as 90.0 kg', rec.entries[0].weight === 198.4 && (await body(page)).big === '90.0', String(rec.entries[0].weight));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, errors.concat(dialogs).join(' | '));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { width: 320, theme: 'light', paid: true });
    let f = await fit(page, '#tl-screen');
    t('light at 320 px: Blood pressure fits, every control named and 44 px, no text under 12 px', fitOk(f), fitDetail(f));
    await shot(page, 'bp-light-320', true);
    await go(page, 'health/body');
    f = await fit(page, '#tl-screen');
    t('  and Body', fitOk(f), fitDetail(f));
    await shot(page, 'body-light-320', true);
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-health-bp-body: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
