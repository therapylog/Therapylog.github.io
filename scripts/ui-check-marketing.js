#!/usr/bin/env node
/* Mobile-viewport reachability check for marketing.html.
 *
 * The reported bug: on a phone the "✨ Generate" button sat underneath the
 * fixed bottom tab bar and could not be tapped. Root cause was .view
 * reserving a hard-coded 80px of bottom padding — less than the real bar
 * height once safe-area inset and the browser toolbar slice were counted.
 *
 * The invariant this locks in: with any tab scrolled all the way to the
 * bottom, every interactive element in it is hit-testable — elementFromPoint
 * at its centre returns the element (or a descendant), never the nav bar.
 */
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright-core');

const FILE = 'file://' + path.resolve(__dirname, '..', 'marketing.html');
const EXEC = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TABS = ['focus', 'generate', 'campaigns', 'visuals', 'library', 'schedule', 'bizdev', 'settings'];

let pass = 0, fail = 0;
const ok  = m => { pass++; console.log('  ok   ' + m); };
const bad = m => { fail++; console.log('  FAIL ' + m); };

/* Runs in the page: scroll the active view to the bottom, then hit-test every
   interactive element that is on screen. Returns the ones the nav covers. */
function probe() {
  const view = document.querySelector('.view.active');
  if (!view) return { err: 'no active view' };
  view.scrollTop = view.scrollHeight;
  const bar = document.querySelector('.mob-tab-bar');
  /* a comma list does NOT inherit the descendant prefix — scope each part */
  const sel = ['button', 'input', 'select', 'textarea', 'summary', '.chip', '.platform-tile', '[onclick]']
    .map(s => '.view.active ' + s).join(',');
  const blocked = [], offscreen = [];
  let checked = 0;
  document.querySelectorAll(sel).forEach(el => {
    if (el.disabled) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return;
    const b = el.getBoundingClientRect();
    if (b.width < 4 || b.height < 4) return;
    if (b.bottom < 0 || b.top > window.innerHeight) return;   // scrolled out of the view — fine
    checked++;
    const name = el.id || el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 24);
    /* sample the element's own centre, clamped inside its box */
    const x = Math.round(Math.min(Math.max(b.left + b.width / 2, 1), window.innerWidth - 1));
    const y = Math.round(Math.min(Math.max(b.top + b.height / 2, 1), window.innerHeight - 1));
    const hit = document.elementFromPoint(x, y);
    if (bar && hit && bar.contains(hit)) { blocked.push(name); return; }
    if (b.bottom > window.innerHeight + 0.5 && b.top > window.innerHeight - 4) offscreen.push(name);
  });
  return { checked, blocked, offscreen, navBottom: bar ? Math.round(bar.getBoundingClientRect().height) : 0 };
}

/* Source invariants live in validate-marketing-static.js so CI can run them
   without a browser. Headless Chromium cannot reproduce the condition that
   actually broke the Generate button on a phone — on iOS Safari and Chrome
   Android, 100vh is the *large* viewport and overshoots the visible area while
   position:fixed elements sit at the *visible* bottom, so the tail of the
   scroll container lives off screen. In headless there is no browser chrome and
   100vh === innerHeight, so geometry alone always passes. */
function sourceChecks() {
  console.log('\nsource invariants (shared with validate-marketing-static.js)');
  const res = require(path.resolve(__dirname, 'validate-marketing-static.js'))(console.log);
  pass += 0; /* the module logs its own lines; fold its verdict into ours */
  if (res.errors.length) { fail += res.errors.length; }
  else { pass += 1; console.log('  ok   all static invariants hold'); }
}

(async () => {
  sourceChecks();
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });

  for (const [label, viewport] of [
    ['iPhone 14 (390x844)',     { width: 390, height: 844 }],
    ['iPhone SE (375x667)',     { width: 375, height: 667 }],
    ['small Android (360x640)', { width: 360, height: 640 }],
    ['tablet edge (768x1024)',  { width: 768, height: 1024 }],
  ]) {
    console.log('\n' + label);
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message)));
    await page.addInitScript(() => { try { sessionStorage.setItem('tl_mkt_pin_ok', '1'); } catch (e) {} });
    await page.goto(FILE, { waitUntil: 'load' });
    await page.waitForTimeout(250);

    const gateHidden = await page.evaluate(() => {
      const g = document.getElementById('pin-gate');
      return !g || g.style.display === 'none';
    });
    gateHidden ? ok('pin gate unlocked for the harness') : bad('pin gate still covering the page');

    const m = await page.evaluate(() => ({
      navh: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navh'), 10),
      barH: (() => { const b = document.querySelector('.mob-tab-bar');
                     return b && getComputedStyle(b).display !== 'none'
                       ? Math.round(b.getBoundingClientRect().height) : 0; })(),
      pad:  (() => { const v = document.querySelector('.view.active');
                     return v ? Math.round(parseFloat(getComputedStyle(v).paddingBottom)) : 0; })(),
    }));
    m.navh === m.barH
      ? ok('--navh (' + m.navh + 'px) matches the measured tab bar (' + m.barH + 'px)')
      : bad('--navh=' + m.navh + 'px but the tab bar measures ' + m.barH + 'px');
    m.pad > m.barH
      ? ok('.view reserves ' + m.pad + 'px, clear of the ' + m.barH + 'px bar')
      : bad('.view reserves only ' + m.pad + 'px for a ' + m.barH + 'px bar');

    /* the reported bug, asserted directly */
    await page.evaluate(() => window.showView('generate', null));
    await page.waitForTimeout(90);
    const gen = await page.evaluate(() => {
      const v = document.querySelector('.view.active'); v.scrollTop = v.scrollHeight;
      const el = document.getElementById('gen-btn'), bar = document.querySelector('.mob-tab-bar');
      const b = el.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2));
      return { hits: hit === el || el.contains(hit), navBlocked: !!(hit && bar.contains(hit)),
               gap: Math.round(bar.getBoundingClientRect().top - b.bottom) };
    });
    gen.hits && !gen.navBlocked
      ? ok('#gen-btn is tappable, ' + gen.gap + 'px above the nav')
      : bad('#gen-btn is ' + (gen.navBlocked ? 'covered by the nav' : 'not hit-testable'));

    /* every tab, scrolled to the bottom */
    for (const tab of TABS) {
      await page.evaluate(t => window.showView(t, null), tab);
      await page.waitForTimeout(90);
      const r = await page.evaluate(probe);
      if (r.err) { bad(tab + ': ' + r.err); continue; }
      if (r.blocked.length)   bad(tab + ': nav covers ' + r.blocked.length + ' control(s): ' + r.blocked.join(', '));
      else if (r.offscreen.length) bad(tab + ': below the viewport: ' + r.offscreen.join(', '));
      else ok(tab + ': all ' + r.checked + ' on-screen controls reachable');
    }

    const toastClear = await page.evaluate(() => {
      window.toast('probe');
      const t = document.getElementById('toast'), b = document.querySelector('.mob-tab-bar');
      if (!t || !b) return false;
      return t.getBoundingClientRect().bottom <= b.getBoundingClientRect().top + 0.5;
    });
    toastClear ? ok('toast clears the tab bar') : bad('toast overlaps the tab bar');

    errors.length === 0 ? ok('no uncaught page errors') : bad('page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  /* desktop: --navh must collapse to 0 so nothing gains phantom padding */
  console.log('\ndesktop (1280x800)');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const derr = [];
  page.on('pageerror', e => derr.push(String(e.message)));
  await page.addInitScript(() => { try { sessionStorage.setItem('tl_mkt_pin_ok', '1'); } catch (e) {} });
  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(200);
  const d = await page.evaluate(() => ({
    navh: getComputedStyle(document.documentElement).getPropertyValue('--navh').trim(),
    barShown: getComputedStyle(document.querySelector('.mob-tab-bar')).display !== 'none',
  }));
  d.navh === '0px' ? ok('--navh collapses to 0px on desktop') : bad('--navh is "' + d.navh + '" on desktop');
  !d.barShown ? ok('tab bar hidden on desktop') : bad('tab bar visible on desktop');
  derr.length === 0 ? ok('no uncaught page errors') : bad('page errors: ' + derr.join(' | '));
  await ctx.close();

  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
