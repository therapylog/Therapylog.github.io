/* Reproduces the reported chat glitch: on a phone, scrolling collapses the URL
   bar, which fires `resize`. The old handler re-measured the card from a
   mid-scroll viewport position and grew it, opening a blank band under the
   header. Simulated here by shrinking the viewport height only (width fixed) —
   exactly what URL-bar collapse looks like to the page. */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  console.error('ui-check-chat-layout: playwright-core is not installed — skipping.');
  console.error('  npm install playwright-core   (then re-run; this check is optional)');
  process.exit(0);
}
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json' };
function serve(){return new Promise(r=>{const s=http.createServer((q,p)=>{let rel=decodeURIComponent(q.url.split('?')[0]);if(rel==='/app')rel='/app.html';const f=path.join(ROOT,rel);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){p.writeHead(404);return p.end('x');}p.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(p);});s.listen(0,'127.0.0.1',()=>r({s,base:`http://127.0.0.1:${s.address().port}`}));});}

const results=[]; const check=(n,p,d)=>{results.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`);};

(async () => {
  const { s: srv, base } = await serve();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  page.on('pageerror',()=>{});

  await page.goto(base + '/app.html', { waitUntil:'load' });
  await page.waitForTimeout(2000);
  // Dismiss disclaimer/onboarding so the AI tab is reachable.
  await page.evaluate(() => {
    try { localStorage.setItem('tl-disclaimer-done','1'); localStorage.setItem('tl-ob-done','1'); } catch(e){}
  });
  await page.reload({ waitUntil:'load' });
  await page.waitForTimeout(2000);

  // Open the AI hub, where the chat card lives.
  // The chat card lives in the "me" hub's AI section: page → hub section.
  const opened = await page.evaluate(() => {
    const steps = [];
    if (typeof window.showPage === 'function') { window.showPage('ai'); steps.push('showPage(ai)'); }
    if (typeof window.switchHubSection === 'function') {
      window.switchHubSection('me', 'ai', document.getElementById('hbtn-ai'));
      steps.push('switchHubSection(me,ai)');
    }
    return steps.join(' + ') || 'no nav fn';
  });
  await page.waitForTimeout(1200);

  const before = await page.evaluate(() => {
    const c = document.querySelector('.chat-card');
    return c ? { h: Math.round(c.getBoundingClientRect().height), inline: c.style.height } : null;
  });
  check('the chat card is present and sized', before && before.h > 200, JSON.stringify(before) + ' via ' + opened);

  // URL-bar collapse: height shrinks, width identical.
  await page.setViewportSize({ width: 390, height: 744 });
  await page.waitForTimeout(600);
  const afterCollapse = await page.evaluate(() => {
    const c = document.querySelector('.chat-card');
    return c ? { h: Math.round(c.getBoundingClientRect().height), inline: c.style.height } : null;
  });
  const grew = afterCollapse && before && (afterCollapse.h - before.h);
  check('a URL-bar-only change does not resize the card',
    afterCollapse && Math.abs(afterCollapse.h - before.h) <= 1,
    `before=${before && before.h} after=${afterCollapse && afterCollapse.h} (delta ${grew})`);

  // Scroll back / bar reappears.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  const back = await page.evaluate(() => {
    const c = document.querySelector('.chat-card');
    return c ? Math.round(c.getBoundingClientRect().height) : null;
  });
  check('and it does not snap back either', back !== null && Math.abs(back - before.h) <= 1,
    `before=${before && before.h} back=${back}`);

  // A real layout change (rotation) still re-measures.
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(700);
  const rotated = await page.evaluate(() => {
    const c = document.querySelector('.chat-card');
    return c ? Math.round(c.getBoundingClientRect().height) : null;
  });
  check('a genuine width change still re-measures', rotated !== null && rotated !== before.h,
    `portrait=${before && before.h} landscape=${rotated}`);

  await browser.close(); srv.close();
  const failed = results.filter(x=>!x).length;
  if (failed) { console.error(`CHAT LAYOUT CHECK FAILED — ${failed} of ${results.length}`); process.exit(1); }
  console.log(`chat layout OK: ${results.length} checks — the card holds still when the URL bar collapses, and still re-measures on a real rotation`);
})();
