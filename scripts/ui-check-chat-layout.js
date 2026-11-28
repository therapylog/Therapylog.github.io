/* Reproduces the reported chat glitch: on a phone, scrolling collapses the URL
   bar, which fires `resize`. The old handler re-measured the card from a
   mid-scroll viewport position and grew it, opening a blank band under the
   header. Simulated here by shrinking the viewport height only (width fixed) —
   exactly what URL-bar collapse looks like to the page.

   The chat is now the Ask screen (src/ui/ask.js), whose guarantee is
   different and stronger: the page itself never scrolls (only the thread box
   does), so scrolling a conversation gives the URL bar nothing to collapse
   for, and the composer stays at the bottom of whatever height the browser
   gives it, before, during and after a height change, and on a rotation. */
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

  /* No off-origin requests. The Google Fonts stylesheet cannot resolve on an
     offline or sandboxed machine, and waiting for it to time out is most of
     the run. Per-file API stubs are registered separately and still win,
     because routes registered earlier take precedence. */
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  page.on('pageerror',()=>{});

  await page.goto(base + '/app.html', { waitUntil:'load' });
  await page.waitForTimeout(2000);
  // Dismiss disclaimer/onboarding so the AI tab is reachable.
  await page.evaluate(() => {
    try { localStorage.setItem('tl-disclaimer-done','1'); localStorage.setItem('tl-ob-done','1'); } catch(e){}
  });
  await page.reload({ waitUntil:'load' });
  await page.waitForTimeout(2000);

  // Open Ask, with a long conversation so the thread has to scroll.
  await page.evaluate(() => {
    if (typeof tlGo === 'function') tlGo('ask');
    for (let i = 0; i < 14; i++) { addMsg('user', 'Question ' + i + ' about my labs and my plan'); addMsg('ai', 'An answer that runs over a few lines, number ' + i + '. '.repeat(12)); }
  });
  await page.waitForTimeout(800);
  const measure = () => page.evaluate(() => {
    const t = document.getElementById('tl-ask-thread'), c = document.querySelector('.tl-ask-composer');
    if (!t || !c) return null;
    t.scrollTop = 200;
    window.scrollTo(0, 400);
    const r = c.getBoundingClientRect();
    return { docScroll: window.scrollY, docOver: document.documentElement.scrollHeight - innerHeight,
      threadScrolls: t.scrollHeight > t.clientHeight && t.scrollTop > 0, composerBottom: Math.round(r.bottom), vh: innerHeight };
  });
  const before = await measure();
  check('the conversation scrolls inside its box, and the page itself never scrolls', before && before.threadScrolls && before.docScroll === 0 && before.docOver <= 1, JSON.stringify(before));
  check('  the composer sits at the bottom of the screen', before && Math.abs(before.composerBottom - before.vh) <= 1, JSON.stringify(before));

  // URL-bar collapse: height shrinks, width identical.
  await page.setViewportSize({ width: 390, height: 744 });
  await page.waitForTimeout(500);
  const collapsed = await measure();
  check('a URL-bar-only change keeps the composer at the bottom, with no page scroll', collapsed && Math.abs(collapsed.composerBottom - collapsed.vh) <= 1 && collapsed.docScroll === 0, JSON.stringify(collapsed));

  // A real layout change (rotation).
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);
  const rotated = await measure();
  check('a rotation re-lays it out, the composer still at the bottom', rotated && Math.abs(rotated.composerBottom - rotated.vh) <= 1 && rotated.docScroll === 0, JSON.stringify(rotated));

  await browser.close(); srv.close();
  const failed = results.filter(x=>!x).length;
  if (failed) { console.error(`CHAT LAYOUT CHECK FAILED — ${failed} of ${results.length}`); process.exit(1); }
  console.log(`chat layout OK: ${results.length} checks — the page never scrolls under the conversation, and the composer holds the bottom through a URL-bar change and a rotation`);
})();
