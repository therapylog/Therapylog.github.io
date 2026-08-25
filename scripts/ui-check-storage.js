/* Proves the storage block actually reaches a compound page in a browser, and
   that a category grouping renders nothing rather than generic filler.
   Run: node scripts/ui-check-storage.js */
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (e) { console.error('ui-check-storage: playwright-core not installed — skipping.'); process.exit(0); }
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json' };
function serve(){return new Promise(r=>{const s=http.createServer((q,p)=>{let rel=decodeURIComponent(q.url.split('?')[0]);if(rel==='/app')rel='/app.html';const f=path.join(ROOT,rel);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){p.writeHead(404);return p.end('x');}p.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(p);});s.listen(0,'127.0.0.1',()=>r({s,base:`http://127.0.0.1:${s.address().port}`}));});}
const R=[]; const t=(n,c,d)=>{R.push(c);console.log(`${c?'PASS':'FAIL'}  ${n}${d?'  — '+d:''}`)};

(async () => {
  const { s: srv, base } = await serve();
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(base+'/app.html',{waitUntil:'load'});
  await p.evaluate(()=>{try{localStorage.setItem('tl-disclaimer-done','1');localStorage.setItem('tl-ob-done','1');}catch(e){}});
  await p.reload({waitUntil:'load'}); await p.waitForTimeout(2000);
  t('page loads clean', errs.length===0, errs.slice(0,2).join(' | '));

  // A lyophilized peptide: the case people ask about most.
  const bpc = await p.evaluate(()=>{
    const st = window.tlStorageFor ? window.tlStorageFor('bpc') : null;
    return { st, html: window.tlStorageSection ? window.tlStorageSection('bpc') : '' };
  });
  t('a peptide resolves storage', !!bpc.st, bpc.st ? bpc.st.medium+' via '+bpc.st.source : 'null');
  t('  it renders a section', /Storage and Handling/.test(bpc.html));
  t('  with the reconstituted window', /28 days/.test(bpc.html), (bpc.html.match(/about 28 days/)||[''])[0]);
  t('  and the supplier caveat', /insert/i.test(bpc.html));

  // An oil: must NOT tell people to refrigerate.
  const oil = await p.evaluate(()=>({ st: window.tlStorageFor('tc'), html: window.tlStorageSection('tc') }));
  t('an oil resolves storage', !!oil.st && oil.st.medium==='oil', oil.st?oil.st.medium:'null');
  t('  it warns against the fridge', /Do not refrigerate/i.test(oil.html));
  t('  and does not mention a 28-day window', !/28 days/.test(oil.html));

  // An oral picked up only via TL_FORM (no PK entry).
  const oral = await p.evaluate(()=>({ st: window.tlStorageFor('berberine'), html: window.tlStorageSection('berberine') }));
  t('a TL_FORM-only oral resolves', !!oral.st && oral.st.medium==='oral', oral.st?oral.st.medium:'null');
  t('  it mentions humidity', /humid/i.test(oral.html));

  // A category grouping must render nothing at all.
  const group = await p.evaluate(()=>({ st: window.tlStorageFor('glp1'), html: window.tlStorageSection('glp1') }));
  t('a category grouping resolves nothing', group.st===null, JSON.stringify(group.st));
  t('  and renders no block', group.html==='', JSON.stringify(group.html).slice(0,60));

  // Fragile compounds get the never-co-mix line.
  /* TL_PK is a const, so it is not on window — the fragile ids come from the
     source (rhgh, igf1lr3, follistatin) and we assert through the public fn. */
  const frag = await p.evaluate(()=>({
    st: window.tlStorageFor('igf1lr3'),
    html: window.tlStorageSection('igf1lr3')
  }));
  t('a fragile compound is flagged as fragile', !!(frag.st && frag.st.fragile),
    JSON.stringify(frag.st && frag.st.fragile));
  t('  and warns about co-mixing in a syringe',
    /never draw it up with another/i.test(frag.html));

  // A topical: it must not inherit any vial, fridge or mixing language.
  const top = await p.evaluate(()=>({ st: window.tlStorageFor('argireline'), html: window.tlStorageSection('argireline') }));
  t('a topical resolves storage', !!top.st && top.st.medium==='topical', top.st?top.st.medium:'null');
  t('  its first row is Unopened, not Before mixing', /Unopened/.test(top.html) && !/Before mixing/.test(top.html));
  t('  it names heat and sun', /sun/i.test(top.html));
  t('  and never mentions reconstituting or a fridge',
    !/reconstitut|28 days|2\u20138/.test(top.html), (top.html.match(/reconstitut\w*|28 days/)||[''])[0]);

  // Estriol reaches the same rule via TL_FORM.
  const est = await p.evaluate(()=>({ st: window.tlStorageFor('estriol'), html: window.tlStorageSection('estriol') }));
  t('estriol resolves as a topical', !!est.st && est.st.medium==='topical', est.st?est.st.medium:'null');
  t('  it defers to the compounded beyond-use date', /beyond-use/i.test(est.html));

  // SS-31 is a powder for injection, so it takes the peptide rule.
  const ss = await p.evaluate(()=>({ st: window.tlStorageFor('ss31'), html: window.tlStorageSection('ss31') }));
  t('ss31 resolves as a lyophilized peptide', !!ss.st && ss.st.medium==='aq', ss.st?ss.st.medium:'null');
  t('  it gets the reconstituted window', /28 days/.test(ss.html));
  t('  and the kit sentence', /kit/i.test(ss.html));

  // Larazotide: powder handling, oral framing. The override, not the class.
  const lz = await p.evaluate(()=>({ st: window.tlStorageFor('larazotide'), html: window.tlStorageSection('larazotide') }));
  t('larazotide uses its compound-specific rule', !!lz.st && lz.st.source==='override', lz.st?lz.st.source:'null');
  t('  the page says compound-specific, not general practice',
    /compound-specific/.test(lz.html) && !/general practice/.test(lz.html));
  t('  it still shows the reconstituted row', /Once reconstituted/.test(lz.html));
  t('  and says it is swallowed', /swallow|orally/i.test(lz.html));

  // It must actually appear on a rendered compound page, not just from the fn.
  const onPage = await p.evaluate(()=>{
    if (typeof window.showDrugPage !== 'function') return 'no showDrugPage';
    try { window.showDrugPage('bpc'); } catch(e) { return 'threw: '+e.message; }
    const el = document.getElementById('enc-dp');
    return el ? (/Storage and Handling/.test(el.innerHTML) ? 'present' : 'missing') : 'no container';
  });
  t('it appears on the real rendered compound page', onPage==='present', onPage);

  await b.close(); srv.close();
  const f=R.filter(x=>!x).length;
  if (f) { console.error(`STORAGE UI CHECK FAILED — ${f} of ${R.length}`); process.exit(1); }
  console.log(`storage UI OK: ${R.length} checks — peptides, oils, orals, topicals and fragile compounds each get the right guidance, larazotide gets its own rule, and category pages get none`);
})();
