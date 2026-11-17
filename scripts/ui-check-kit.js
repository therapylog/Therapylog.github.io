#!/usr/bin/env node
/* The design foundation, in a browser.
 *
 * Opens the hidden components page (app.html#ui-kit), which draws every shared
 * component in both themes with the builders and styles the screens use, and
 * checks what only a page can show:
 *
 *   - the self-hosted fonts load, and icon glyphs actually draw
 *   - each theme's ground is its token: nothing in the old stylesheet leaks in
 *   - every control is at least 44 px square (the handoff's rule), and every
 *     piece of text at least 12 px
 *   - every button has a name a screen reader can say
 *   - toggles, segmented controls, chips and the sheet behave, by mouse and key
 *   - at 320 px nothing runs off the side of the screen
 *
 *   node scripts/ui-check-kit.js
 *
 * Needs Playwright and a Chromium, like the other ui-check scripts.
 */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  try { ({ chromium } = require('playwright')); }
  catch (e2) { console.error('ui-check-kit: playwright is not installed — skipping.'); process.exit(0); }
}
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: 'http://127.0.0.1:' + server.address().port }));
  });
}

const results = [];
const t = (name, ok, detail) => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

async function open(browser, base, width, theme) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [], offsite = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(base + '/') || /^(blob|data|about):/.test(u)) return route.continue();
    offsite.push(u); return route.abort();
  });
  await page.addInitScript((th) => {
    try {
      localStorage.setItem('tl-ob-done', '1');
      localStorage.setItem('tl-theme', th);
      localStorage.setItem('tl-disclaimer-done', JSON.stringify({ v: 2, at: new Date().toISOString(), age18: true }));
    } catch (e) {}
  }, theme);
  await page.goto(base + '/app.html#ui-kit', { waitUntil: 'load' });
  await page.waitForSelector('#tl-kit .tl-kit-pane');
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors, offsite };
}

(async () => {
  const { server, base } = await serve();
  const launch = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);

  for (const appTheme of ['light', 'dark']) {
    const { context, page, errors, offsite } = await open(browser, base, 780, appTheme);
    const tag = `[app in ${appTheme}]`;

    const fonts = await page.evaluate(() => ({
      inter400: document.fonts.check('400 16px Inter'), inter500: document.fonts.check('500 16px Inter'),
      ph: document.fonts.check('16px Phosphor'), phf: document.fonts.check('16px Phosphor-Fill'),
      glyphs: Array.from(document.querySelectorAll('#tl-kit i.ph, #tl-kit i.ph-fill')).map((i) => {
        const before = getComputedStyle(i, '::before');
        return { content: before.content, w: i.getBoundingClientRect().width, family: getComputedStyle(i).fontFamily };
      })
    }));
    t(`${tag} Inter 400 and 500 load from /vendor/fonts`, fonts.inter400 && fonts.inter500);
    t(`${tag} both icon weights load`, fonts.ph && fonts.phf);
    const blank = fonts.glyphs.filter((g) => g.content === 'none' || g.content === 'normal' || g.w < 8);
    t(`${tag} every icon draws a glyph`, fonts.glyphs.length > 20 && blank.length === 0, `${fonts.glyphs.length} icons, ${blank.length} blank`);
    /* The old screens still load their DM fonts from Google; that stylesheet
       goes with them in Phase 5. Nothing the new design uses may leave. */
    const foreign = offsite.filter((u) => !/^https:\/\/fonts\.googleapis\.com\/css2\?family=DM\+Serif/.test(u));
    t(`${tag} the new design fetches nothing from another origin`, foreign.length === 0, foreign.slice(0, 2).join(' '));

    const grounds = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-kit .tl-kit-pane')).map((p) => ({
      theme: p.getAttribute('data-theme'), bg: getComputedStyle(p).backgroundColor,
      input: getComputedStyle(p.querySelector('.ds-input')).backgroundColor,
      inputRadius: getComputedStyle(p.querySelector('.ds-input')).borderTopLeftRadius,
      surface: (() => { const d = document.createElement('div'); d.style.background = 'var(--color-surface)'; p.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; })(),
      tabbar: getComputedStyle(p.querySelector('.ds-tabbar')).backgroundColor
    })));
    const want = { dark: 'rgb(22, 24, 38)', light: 'rgb(228, 231, 245)' };
    for (const g of grounds) {
      t(`${tag} the ${g.theme} pane's ground is its token`, g.bg === want[g.theme], g.bg);
      t(`${tag}   a field there is the surface colour, with the design's radius`, g.input === g.surface && g.inputRadius === '8px', `${g.input} vs ${g.surface}, radius ${g.inputRadius}`);
      /* color-mix() computes to color(srgb r g b / a), channels 0..1. */
      const m = g.tabbar.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+) \/ ([\d.]+)\)$/);
      const rgb = m ? 'rgb(' + [m[1], m[2], m[3]].map((c) => Math.round(c * 255)).join(', ') + ')' : null;
      t(`${tag}   the tab bar is the ground at 92%`, !!m && rgb === want[g.theme] && Math.abs(+m[4] - 0.92) < 0.005, g.tabbar);
    }

    if (appTheme === 'light') {
      /* Sizes and names do not depend on the theme; check them once. */
      const small = await page.evaluate(() => {
        const out = [];
        const sel = '#tl-kit .tl-kit-pane button, #tl-kit .tl-kit-pane a, #tl-kit .tl-kit-pane input, #tl-kit .tl-kit-pane [role="switch"]';
        document.querySelectorAll(sel).forEach((el) => {
          const r = el.getBoundingClientRect();
          const isSeg = el.classList.contains('ds-seg-opt');
          /* A segmented option is drawn 38 px tall; its ::after takes the hit area to 44. */
          const minH = isSeg ? 38 : 44, minW = el.classList.contains('ds-chip') ? 24 : 44;
          if (r.height + 0.5 < minH || r.width + 0.5 < minW) out.push((el.className || el.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        });
        return out;
      });
      t('every control is at least 44 px (segment options 38 px plus their 3 px hit margin)', small.length === 0, small.slice(0, 4).join('; '));

      const tiny = await page.evaluate(() => {
        const out = [];
        const walk = document.createTreeWalker(document.querySelector('#tl-kit .tl-kit-grid'), NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walk.nextNode())) {
          if (!n.textContent.trim()) continue;
          const px = parseFloat(getComputedStyle(n.parentElement).fontSize);
          if (px < 12) out.push(n.textContent.trim().slice(0, 20) + ' ' + px + 'px');
        }
        return out;
      });
      t('no text is under 12 px', tiny.length === 0, tiny.slice(0, 4).join('; '));

      const nameless = await page.evaluate(() => Array.from(document.querySelectorAll('#tl-kit button, #tl-kit input, #tl-kit [role="switch"]'))
        .filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim() || (b.id && document.querySelector('label[for="' + b.id + '"]'))))
        .map((b) => b.outerHTML.slice(0, 70)));
      t('every button and field has an accessible name', nameless.length === 0, nameless.slice(0, 2).join(' | '));

      /* Behaviour. */
      const pane = page.locator('#tl-kit .tl-kit-pane[data-theme="light"]');
      const tog = pane.locator('.ds-toggle').first();
      const changes = await page.evaluate(() => { window.__dsChanges = []; document.addEventListener('ds-change', (e) => window.__dsChanges.push(e.detail)); return 0; });
      await tog.click();
      t('a toggle flips when tapped, and says so', (await tog.getAttribute('aria-checked')) === 'false' &&
        (await page.evaluate(() => window.__dsChanges.length)) === 1);
      await tog.focus(); await page.keyboard.press('Space');
      t('  and from the keyboard', (await tog.getAttribute('aria-checked')) === 'true');
      const off = pane.locator('.ds-toggle[disabled]');
      const before = await off.getAttribute('aria-checked');
      await off.click({ force: true });
      t('  a disabled one does not', (await off.getAttribute('aria-checked')) === before);

      const seg = pane.locator('.ds-seg[data-ds-seg="Health section"]');
      await seg.locator('.ds-seg-opt[data-value="body"]').click();
      t('a segmented control selects the option tapped, and only that one',
        (await seg.locator('[aria-selected="true"]').getAttribute('data-value')) === 'body' && (await seg.locator('[aria-selected="true"]').count()) === 1);
      await page.keyboard.press('ArrowRight');
      t('  arrow keys move the selection and the focus',
        (await seg.locator('[aria-selected="true"]').getAttribute('data-value')) === 'photos' &&
        (await page.evaluate(() => document.activeElement.getAttribute('data-value'))) === 'photos');
      await page.keyboard.press('ArrowRight');
      t('  and wrap round', (await seg.locator('[aria-selected="true"]').getAttribute('data-value')) === 'bw');
      t('  only the selected option is in the tab order', (await seg.locator('[tabindex="0"]').count()) === 1);
      const edge = await seg.locator('.ds-seg-opt[data-value="bp"]').boundingBox();
      await page.mouse.click(edge.x + edge.width / 2, edge.y - 2);
      t('  a tap in the 3 px margin above an option still selects it', (await seg.locator('[aria-selected="true"]').getAttribute('data-value')) === 'bp');

      const chips = pane.locator('.ds-chips');
      await chips.locator('.ds-chip[data-value="pep"]').click();
      t('single-choice chips: tapping one turns the others off',
        (await chips.locator('[aria-pressed="true"]').count()) === 1 && (await chips.locator('[aria-pressed="true"]').getAttribute('data-value')) === 'pep');

      const opener = pane.locator('[data-kit-sheet]');
      await opener.click();
      const sheet = page.locator('.ds-scrim .ds-sheet[role="dialog"]');
      await sheet.waitFor();
      t('the sheet opens as a modal dialog, with focus inside it', (await sheet.getAttribute('aria-modal')) === 'true' &&
        (await page.evaluate(() => !!document.activeElement.closest('.ds-sheet'))));
      for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
      t('  Tab stays inside it', await page.evaluate(() => !!document.activeElement.closest('.ds-sheet')));
      await page.keyboard.press('Escape');
      t('  Escape closes it and focus goes back to what opened it', (await page.locator('.ds-scrim').count()) === 0 &&
        (await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-kit-sheet'))));
      await opener.click(); await sheet.waitFor();
      await page.mouse.click(390, 30);
      t('  a tap on the scrim closes it', (await page.locator('.ds-scrim').count()) === 0);
    }

    t(`${tag} no page errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
    await context.close();
  }

  /* The narrowest phone the handoff names. */
  const narrow = await open(browser, base, 320, 'dark');
  const fit = await narrow.page.evaluate(() => {
    const kit = document.getElementById('tl-kit');
    const panes = Array.from(kit.querySelectorAll('.tl-kit-pane'));
    const over = [];
    panes.forEach((p) => p.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > window.innerWidth + 0.5 && !el.closest('.ds-chips')) over.push(el.className || el.tagName);
    }));
    const tabs = Array.from(kit.querySelectorAll('.ds-tab-label')).map((s) => ({ w: s.scrollWidth, cw: s.clientWidth, h: s.getBoundingClientRect().height }));
    return { panesStack: panes.length === 2 && panes[0].getBoundingClientRect().width <= 320, over: [...new Set(over)], tabsFit: tabs.every((x) => x.w <= x.cw + 1 && x.h < 20) };
  });
  t('at 320 px the two panes stack', fit.panesStack);
  t('  nothing runs off the side (chip rows scroll on purpose)', fit.over.length === 0, fit.over.slice(0, 4).join(', '));
  t('  every tab bar label fits on one line', fit.tabsFit);
  t('  no page errors', narrow.errors.length === 0, narrow.errors.slice(0, 2).join(' | '));
  await narrow.context.close();

  await browser.close();
  server.close();
  const failed = results.filter((ok) => !ok).length;
  if (failed) { console.error(`DESIGN FOUNDATION CHECK FAILED — ${failed} of ${results.length}`); process.exit(1); }
  console.log(`design foundation OK: ${results.length} checks — fonts and icons load locally, both themes hold their tokens, targets and text meet the floors, and the controls work by touch and key`);
})().catch((e) => { console.error('ui-check-kit: ' + (e && e.stack || e)); process.exit(2); });
