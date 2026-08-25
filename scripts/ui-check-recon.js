let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) {
  console.error('ui-check-recon: playwright-core is not installed — skipping.');
  process.exit(0);
}
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
function serve(){return new Promise(r=>{const s=http.createServer((q,p)=>{let rel=decodeURIComponent(q.url.split('?')[0]);if(rel==='/app')rel='/app.html';const f=path.join(ROOT,rel);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){p.writeHead(404);return p.end('x');}p.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(p);});s.listen(0,'127.0.0.1',()=>r({s,base:`http://127.0.0.1:${s.address().port}`}));});}
const R=[];const t=(n,c,d)=>{R.push(c);console.log(`${c?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`)};
(async()=>{
  const {s:srv,base}=await serve();
  const b=await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(base+'/app.html',{waitUntil:'load'});
  await p.evaluate(()=>{try{localStorage.setItem('tl-disclaimer-done','1');localStorage.setItem('tl-ob-done','1');}catch(e){}});
  await p.reload({waitUntil:'load'}); await p.waitForTimeout(2000);

  t('page loads with no JS errors', errs.length===0, errs.slice(0,2).join(' | '));

  // The calculator lives under Tools; reach the elements directly.
  const present = await p.evaluate(()=>({
    vial: !!document.getElementById('uc-vial'),
    toggle: !!document.getElementById('uc-solve-toggle'),
    panel: !!document.getElementById('uc-solve-panel'),
    fnSolve: typeof window.tlReconSolve,
    fnOpts: typeof window.tlReconOptions,
    fnRender: typeof window.tlReconRender,
  }));
  t('calculator inputs exist', present.vial);
  t('the water helper toggle exists', present.toggle);
  t('solve fns are global', present.fnSolve==='function'&&present.fnOpts==='function'&&present.fnRender==='function',
    JSON.stringify(present));

  // Fill vial size, open the helper, enter a dose.
  const out = await p.evaluate(()=>{
    document.getElementById('uc-vial').value='10';
    if(typeof calcUnified==='function') calcUnified();
    window.tlReconToggle();
    document.getElementById('uc-solve-dose').value='250';
    document.getElementById('uc-solve-unit').value='mcg';
    window.tlReconRender();
    const panel=document.getElementById('uc-solve-panel');
    const o=document.getElementById('uc-solve-out');
    return { open: panel.style.display, html: o.innerHTML, text: o.innerText };
  });
  t('panel opens', out.open==='block', out.open);
  t('it renders selectable options', /Tap one to use it/.test(out.html));
  t('2 ml appears as an option', /<strong>2 ml<\/strong>/.test(out.html), (out.text||'').slice(0,120).replace(/\n/g,' | '));
  t('it states doses per vial', /40 full doses/.test(out.text), (out.text||'').slice(-90).replace(/\n/g,' '));

  // Tap the 2 ml row and confirm it drives the main calculator.
  const after = await p.evaluate(()=>{
    window.tlReconPick(2);
    return {
      water: document.getElementById('uc-water').value,
      conc: (document.getElementById('uc-conc-val')||{}).textContent,
    };
  });
  t('tapping a row sets the water volume', after.water==='2', 'water='+after.water);
  t('and the concentration recalculates', /5,?000/.test(after.conc||''), 'conc='+after.conc);

  // Impossible combination should say so, not render junk.
  const bad = await p.evaluate(()=>{
    document.getElementById('uc-vial').value='1';
    document.getElementById('uc-solve-dose').value='5';
    document.getElementById('uc-solve-unit').value='mg';   // 5mg from a 1mg vial
    window.tlReconRender();
    return document.getElementById('uc-solve-out').innerText;
  });
  t('an impossible dose is explained, not silently blank', /No standard water volume|bigger syringe|different dose/i.test(bad),
    (bad||'').slice(0,110).replace(/\n/g,' '));

  await b.close(); srv.close();
  const f=R.filter(x=>!x).length;
  console.log(`\n${R.length-f}/${R.length} checks passed`);
  process.exit(f?1:0);
})();
