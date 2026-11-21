#!/usr/bin/env node
/* The schedule reader, in a browser (src/logic/frequency.js and the old
 * screens that read through it).
 *
 * A protocol written before the reader was fixed, with lines it used to
 * misread: on the home screen, the one-time note lists what now reads
 * differently; "biweekly" asks which is meant, and the answer is saved into
 * the line; a schedule nobody can read says so. Then what the fix changed
 * where users see it: the next-dose card, reminder times, the calendar file
 * (no events for an unscheduled line, the last day of a short month), blood
 * pressure that cannot be real refused, and the note never shown to someone
 * whose protocol was only ever read the new way. Fit at 320 px.
 *
 *   node scripts/ui-check-schedule.js
 *   SHOTS=dir node scripts/ui-check-schedule.js
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-schedule: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
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

/* Wednesday 4 March 2026, 06:00. */
const CLOCK = new Date(2026, 2, 4, 6, 0, 0);
const PROTO = {
  name: 'Winter', start: '2026-03-02', weeks: 12, _created: '2026-02-20T09:00',
  meds: 'Testosterone Cypionate, 100mg, once a week\n' +
        'BPC-157, 250mcg, 3x daily\n' +
        'Tesa, 1mg, biweekly\n' +
        'Epitalon, 10mg, every 4.5 days\n' +
        'HCG, 500IU, EOD',
  pct: ''
};

async function open(browser, base, opts) {
  const context = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, serviceWorkers: 'block',
    colorScheme: opts.light ? 'light' : 'dark' });
  const page = await context.newPage();
  const errors = [], dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await page.route('**/*', (route) => (route.request().url().startsWith(base + '/') || /^(blob|data|about):/.test(route.request().url())
    ? route.continue() : route.abort()));
  await page.clock.install({ time: CLOCK });
  await page.addInitScript(([record, extra]) => {
    try {
      if (sessionStorage.getItem('tl-test-seeded')) return;
      sessionStorage.setItem('tl-test-seeded', '1');
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
      if (record) localStorage.setItem('tlv2', record);
      Object.keys(extra || {}).forEach((k) => localStorage.setItem(k, extra[k]));
    } catch (e) {}
  }, [opts.record ? JSON.stringify(opts.record) : null, opts.storage || null]);
  await page.goto(base + '/app.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.renderScheduleCheck === 'function' && !!document.getElementById('dash-sched-check'));
  await page.waitForTimeout(500);
  return { context, page, errors, dialogs };
}

const shot = async (page, name) => {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.locator('#dash-sched-check').screenshot({ path: path.join(SHOTS, name + '.png') });
};
const record = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('tlv2') || 'null'));
const cards = (page) => page.evaluate(() => Array.from(document.querySelectorAll('#dash-sched-check .next-dose-card')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()));

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  /* ===== a protocol written before the fix ===== */
  {
    const { context, page, errors, dialogs } = await open(browser, base, { record: { entries: [], proto: PROTO } });
    let c = await cards(page);
    const note = c[0] || '';
    t('the home screen opens with a note on what now reads differently', /now reads more accurately/.test(note), note.slice(0, 120));
    t('  each changed line, before and after', /Testosterone Cypionate\s*Was once a day at 08:00\. Now once a week \(Mon\) at 09:00\./.test(note) &&
      /BPC-157\s*Was once a day at 08:00\. Now 3 times a day at 08:00 and 14:00 and 20:00\./.test(note) &&
      /Tesa\s*Was twice a week \(Mon · Thu\) at 09:00\. Now not scheduled until you check it\./.test(note) &&
      /Epitalon\s*Was once a day at 08:00\. Now not scheduled until you check it\./.test(note), note);
    t('  and only those: a line that reads the same is not listed', !/HCG/.test(note));
    t('  with the reminder to check them against what the physician agreed', /physician/.test(note));
    t('"biweekly" asks which is meant', c.some((x) => /Tesa: biweekly means two things/.test(x) && /Every 2 weeks/.test(x) && /Twice a week/.test(x)));
    t('a schedule nobody can read says so, quoting it', c.some((x) => /Epitalon: check this schedule/.test(x) && /“every 4\.5 days”/.test(x)));
    await shot(page, 'schedule-cards-dark-390');

    /* What the fix changed, where the user sees it. */
    const due = await page.evaluate(() => {
      const meds = parseMeds(gd().proto.meds);
      const by = {}; meds.forEach((m) => { by[m.name] = { days: getDoseDays(m, gd().proto.start, 7), times: getDefaultTimes(m.freq) }; });
      return by;
    });
    t('once a week is one dose this week, not seven', JSON.stringify(due['Testosterone Cypionate'].days) === '[5]', JSON.stringify(due['Testosterone Cypionate']));
    t('3x daily is three reminders a day', JSON.stringify(due['BPC-157'].times) === '["08:00","14:00","20:00"]', JSON.stringify(due['BPC-157']));
    t('biweekly and every 4.5 days have no dose days until checked', due.Tesa.days.length === 0 && due.Epitalon.days.length === 0);
    t('the next-dose card still shows what is due today', /BPC-157|HCG/.test(await page.textContent('#dash-next-dose')));

    /* The calendar file: no events for an unscheduled line. */
    const ics = await page.evaluate(async () => {
      let blob = null;
      const orig = URL.createObjectURL;
      URL.createObjectURL = (b) => { blob = b; return 'blob:x'; };
      try { exportRemindersICS(); } finally { URL.createObjectURL = orig; }
      return blob ? await blob.text() : '';
    });
    t('the calendar file has events for the scheduled lines only', /Testosterone Cypionate/.test(ics) && /BPC-157/.test(ics) && /HCG/.test(ics) &&
      !/Tesa/.test(ics) && !/Epitalon/.test(ics), (ics.match(/SUMMARY:[^\r\n]*/g) || []).join(' | '));
    t('  weekly on its day, three a day as three events', /RRULE:FREQ=WEEKLY;BYDAY=MO/.test(ics) && (ics.match(/SUMMARY:💉 BPC-157/g) || []).length === 3);

    /* Answering biweekly. */
    await page.click('#dash-sched-check button:has-text("Twice a week")');
    await page.waitForTimeout(300);
    let d = await record(page);
    t('answering "twice a week" writes it into that line and nothing else', d.proto.meds.split('\n')[2] === 'Tesa, 1mg, twice weekly' &&
      d.proto.meds.split('\n')[0] === 'Testosterone Cypionate, 100mg, once a week', d.proto.meds.split('\n')[2]);
    c = await cards(page);
    t('  and the question goes', !c.some((x) => /biweekly means/.test(x)));
    t('  and the line is scheduled', await page.evaluate(() => getDoseDays(parseMeds(gd().proto.meds)[2], gd().proto.start, 7).length === 2));

    await page.click('#dash-sched-check button:has-text("Got it")');
    t('"Got it" puts the note away for good', !(await cards(page)).some((x) => /more accurately/.test(x)) &&
      await page.evaluate(() => localStorage.getItem('tl-sched-read')) === '2');
    t('the check on the unreadable line stays until it is rewritten', (await cards(page)).some((x) => /Epitalon: check this schedule/.test(x)));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(500);
    t('after a reload the note does not come back', !(await cards(page)).some((x) => /more accurately/.test(x)));

    /* Blood pressure that cannot be real. */
    const bp = await page.evaluate(() => {
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      const before = gd().entries.length;
      set('bp-sys', '80'); set('bp-dia', '110');
      saveBP();
      const after = gd().entries.length;
      set('bp-sys', '128'); set('bp-dia', '82');
      saveBP();
      return { refused: after === before, saved: gd().entries.length === before + 1, toast: (document.getElementById('toast') || {}).textContent || '' };
    });
    t('a diastolic above the systolic is refused, and a real reading saved', bp.refused && bp.saved, JSON.stringify(bp));
    t('no page errors, no browser dialogs', !errors.length && !dialogs.length, [errors, dialogs].join(' | ').slice(0, 300));
    await context.close();
  }

  /* ===== light, 320 px ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: { entries: [], proto: PROTO }, width: 320, light: true,
      storage: { 'tl-theme': 'light' } });
    const fit = await page.evaluate(() => {
      const box = document.getElementById('dash-sched-check');
      const out = { small: [], tiny: [], overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) };
      box.querySelectorAll('button').forEach((b) => { const h = b.getBoundingClientRect().height; if (h < 43.5) out.small.push(b.textContent + ' ' + h); });
      const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const n = walk.currentNode;
        if (!n.textContent.trim()) continue;
        const size = parseFloat(getComputedStyle(n.parentElement).fontSize);
        if (size < 12) out.tiny.push(n.textContent.trim().slice(0, 20) + ' ' + size);
      }
      return out;
    });
    t('light at 320 px: the cards fit, every button 44 px, no text under 12 px', !fit.overflow && !fit.tiny.length && !fit.small.length, JSON.stringify(fit));
    await shot(page, 'schedule-cards-light-320');
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  /* ===== a protocol only ever read the new way ===== */
  {
    const { context, page, errors } = await open(browser, base, { record: { entries: [], proto: null } });
    t('with no protocol yet, the note is marked as never needed', await page.evaluate(() => localStorage.getItem('tl-sched-read')) === '2' &&
      (await cards(page)).length === 0);
    await page.evaluate((p) => { const d = gd(); d.proto = p; sd(d); renderDash(); }, PROTO);
    await page.waitForTimeout(200);
    const c = await cards(page);
    t('a protocol entered after the fix gets no note, but still the question and the check', !c.some((x) => /more accurately/.test(x)) &&
      c.some((x) => /biweekly means/.test(x)) && c.some((x) => /check this schedule/.test(x)), JSON.stringify(c).slice(0, 200));
    t('no page errors', !errors.length, errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();
  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-schedule: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
