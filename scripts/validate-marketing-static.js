#!/usr/bin/env node
/* Static integrity checks for marketing.html — no browser needed, so CI can run
 * it on every push.
 *
 * Three classes of drift this catches:
 *   1. Layout — the mobile bottom nav burying the primary button on a tab. That
 *      shipped once: .view reserved a hard-coded 80px, less than the real bar
 *      height plus the slice of 100vh that hides behind the browser toolbar.
 *   2. False claims — the Suite writes public marketing copy. It must not tell
 *      the model the app is in the App Store (it is not), quote a price that is
 *      not on the site, or understate the marker count.
 *   3. Broken wiring — an onclick or getElementById that names something that
 *      does not exist.
 *
 * Run: node scripts/validate-marketing-static.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* MARKER_REGISTRY writes both its own keys and its nested keys at column 0, so
   counting entries needs real brace depth, not a line-anchored regex. */
function countTopLevelKeys(block) {
  const open = block.indexOf('{');
  if (open < 0) return 0;
  let depth = 0, inStr = null, esc = false, count = 0;
  for (let i = open; i < block.length; i++) {
    const c = block[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{' || c === '[') { depth++; continue; }
    if (c === '}' || c === ']') { depth--; if (depth === 0) break; continue; }
    /* a key at depth 1 that opens an object is one marker */
    if (depth === 1 && /[A-Za-z0-9_]/.test(c)) {
      const m = /^([A-Za-z0-9_]+)\s*:\s*\{/.exec(block.slice(i));
      if (m && (i === 0 || /[\s,{]/.test(block[i - 1]))) { count++; i += m[1].length; }
    }
  }
  return count;
}

function run(log) {
  const say = log || (() => {});
  const errors = [];
  const warns = [];
  const ok = m => say('  ok   ' + m);
  const err = m => { errors.push(m); say('  FAIL ' + m); };
  const warn = m => { warns.push(m); say('  warn ' + m); };
  const need = (cond, m) => (cond ? ok(m) : err(m));

  const src = read('marketing.html');

  /* ── 1. layout invariants ───────────────────────────────────────────────── */
  const layout = [
    ['.app declares a 100dvh fallback',            /\.app\{[^}]*height:100vh;height:100dvh/],
    ['.main declares a 100dvh fallback',           /\.main\{[^}]*height:100vh;height:100dvh/],
    ['--navh declared on :root',                   /--navh:0px;/],
    ['--navh seeded for mobile',                   /@media\(max-width:768px\)\{:root\{--navh:calc\(72px \+ var\(--sb\)\)\}/],
    ['.view reserves --navh, not a magic number',  /@media\(max-width:768px\)\{\.view\{padding:16px;padding-bottom:calc\(var\(--navh\) \+ 28px\)\}\}/],
    ['toast rides above --navh',                   /\.toast\{position:fixed;bottom:calc\(var\(--navh\) \+ 24px\)/],
    ['top nav grows by the notch inset',           /\.mobile-nav\{[^}]*height:calc\(56px \+ var\(--st\)\)/],
    ['.main clears the top nav plus the inset',    /\.main\{padding-top:calc\(56px \+ var\(--st\)\)\}/],
    ['sizeChrome reads display, not offsetParent', /getComputedStyle\(bar\)\.display !== 'none'/],
    ['sizeChrome pins the shells to innerHeight',  /\['\.app', '\.main'\]\.forEach/],
    ['sizeChrome runs on resize',                  /addEventListener\('resize', sizeChrome\)/],
    ['sizeChrome runs on orientationchange',       /addEventListener\('orientationchange'/],
    ['sizeChrome runs on visualViewport resize',   /visualViewport\.addEventListener\('resize', sizeChrome\)/],
    ['sizeChrome called at init',                  /\nsizeChrome\(\);/],
  ];
  for (const [m, re] of layout) need(re.test(src), m);
  need(!/padding-bottom:calc\(80px \+ var\(--sb\)\)/.test(src),
       'no hard-coded 80px bottom reserve in the stylesheet');

  /* ── 2. claims the Suite feeds the model ────────────────────────────────── */
  /* The app is a PWA. The Focus board's own copy says "stores shelved". Only the
     prohibition itself may mention a store. */
  const prohibition = /NOT in the App Store or Google Play[\s\S]{0,400}?integrity position\./;
  need(prohibition.test(src), 'the store prohibition is intact in BASE_SYSTEM');
  const withoutProhibition = src.replace(prohibition, '');
  for (const claim of ['iOS App Store', 'live on the App Store', 'App Store Launch', 'ios_launch']) {
    need(!withoutProhibition.includes(claim), 'no "' + claim + '" claim anywhere else in the file');
  }

  /* marker count must match the registry the app actually ships */
  const app = read('app.html');
  const regStart = app.indexOf('/* MARKER-REGISTRY:START');
  const regEnd = app.indexOf('/* MARKER-REGISTRY:END');
  need(regStart > -1 && regEnd > regStart, 'app.html marker registry sentinels found');
  const markerCount = countTopLevelKeys(app.slice(regStart, regEnd));
  need(markerCount >= 90, 'app.html ships ' + markerCount + ' markers');
  need(new RegExp('(^|[^0-9])' + markerCount + ' markers').test(src),
       'marketing copy quotes the real marker count (' + markerCount + ')');
  need(!/50\+\s*(markers|fields)/.test(src), 'no stale "50+ markers/fields" claim');

  /* compound count must match the encyclopedia export */
  const classes = JSON.parse(read(path.join('docs', 'compounds.json')));
  const ids = new Set();
  classes.forEach(c => (c.drugs || []).forEach(d => ids.add(d.id)));
  need(ids.size > 0, 'docs/compounds.json parsed (' + ids.size + ' compounds)');
  need(new RegExp('(^|[^0-9])' + ids.size + '[- ]compound').test(src),
       'marketing copy quotes the real compound count (' + ids.size + ')');

  /* every price the Suite states must appear on a public page */
  const publicPrices = new Set();
  for (const f of ['index.html', 'pro.html', 'download.html']) {
    (read(f).match(/\$\d+\.\d\d/g) || []).forEach(p => publicPrices.add(p));
  }
  const sysStart = src.indexOf('const BASE_SYSTEM');
  const sysEnd = src.indexOf('const CHAR_LIMITS');
  const sys = src.slice(sysStart, sysEnd);
  const quoted = Array.from(new Set(sys.match(/\$\d+\.\d\d/g) || []));
  need(quoted.length > 0, 'BASE_SYSTEM quotes prices (' + quoted.join(', ') + ')');
  for (const p of quoted) {
    need(publicPrices.has(p), 'price ' + p + ' in BASE_SYSTEM also appears on the public site');
  }
  /* and every tier the site sells must be in the ladder the model sees */
  /* $34.99 is deliberately absent — the one-time tier was retired 24 Aug 2026
     and the prompt must not quote a price nothing sells. */
  for (const p of ['$9.99', '$99.99', '$8.99', '$89.99']) {
    need(sys.includes(p), 'BASE_SYSTEM lists the ' + p + ' tier');
  }
  need(!sys.includes('$34.99'), 'BASE_SYSTEM does not quote the retired one-time price');
  need(/Never invent or round a price/.test(sys), 'BASE_SYSTEM forbids inventing prices');

  /* ── 3. wiring ──────────────────────────────────────────────────────────── */
  const declaredIds = new Set((src.match(/\bid="([A-Za-z0-9_-]+)"/g) || []).map(m => m.slice(4, -1)));
  const referenced = new Set((src.match(/getElementById\('([A-Za-z0-9_-]+)'\)/g) || [])
    .map(m => m.replace(/.*\('/, '').replace(/'\)/, '')));
  const missingIds = Array.from(referenced).filter(id => !declaredIds.has(id));
  need(missingIds.length === 0, 'every getElementById target exists' +
       (missingIds.length ? ' — missing: ' + missingIds.join(', ') : ''));

  const handlers = new Set((src.match(/onclick="([A-Za-z0-9_$]+)\(/g) || [])
    .concat(src.match(/onchange="([A-Za-z0-9_$]+)\(/g) || [])
    .concat(src.match(/oninput="([A-Za-z0-9_$]+)\(/g) || [])
    .map(m => m.replace(/^on\w+="/, '').replace(/\($/, '')));
  const defined = new Set([
    ...(src.match(/function\s+([A-Za-z0-9_$]+)\s*\(/g) || []).map(m => m.replace(/function\s+/, '').replace(/\s*\($/, '')),
    ...(src.match(/window\.([A-Za-z0-9_$]+)\s*=/g) || []).map(m => m.replace('window.', '').replace(/\s*=$/, '')),
  ]);
  const missingFns = Array.from(handlers).filter(f => !defined.has(f));
  need(missingFns.length === 0, 'every inline handler names a defined function' +
       (missingFns.length ? ' — missing: ' + missingFns.join(', ') : ''));

  /* ── 4. no silent-failure patterns creeping back ────────────────────────── */
  need(/if\(!resp\.ok\)throw new Error\(\(data\.error&&data\.error\.message\)\|\|\('Refine failed/.test(src),
       'refine() surfaces API errors');
  need(/if\(!resp\.ok\)throw new Error\(\(data\.error&&data\.error\.message\)\|\|\('Request failed \(/.test(src),
       'generateBrief() surfaces API errors');
  need(/pushGist[\s\S]{0,600}?if\(!resp\.ok\)\{/.test(src), 'pushGist() checks the response');
  need(/localStorage\.removeItem\(SK\);localStorage\.removeItem\(SK_V3\);/.test(src),
       'clearData() removes the legacy key too');
  need(/function mergeById/.test(src), 'pullGist() merges rather than replaces');
  need(/data\.stop_reason==='max_tokens'/.test(src), 'generate() reports truncated output');
  need(/const MAX_TOKENS=\{/.test(src), 'per-platform output budgets are declared');
  need(!/el\.style\.cssText\+=/.test(src), 'no cssText += accumulation');

  /* the PIN in the page source is not access control — flag it, do not fail */
  if (/var PIN = '\d+';/.test(src)) {
    warn('the PIN is a literal in the page source — anyone who loads /marketing can read it. ' +
         'It keeps casual visitors out; it is not a secret. Keys stay in your own browser, so ' +
         'a stranger reading the PIN gets an empty tool, not your API keys.');
  }

  return { errors, warns };
}

if (require.main === module) {
  console.log('marketing.html static checks');
  const { errors, warns } = run(console.log);
  console.log('');
  if (errors.length) {
    console.error('MARKETING VALIDATION FAILED — ' + errors.length + ' problem(s)');
    process.exit(1);
  }
  console.log('marketing.html OK — ' + warns.length + ' warning(s)');
}

module.exports = run;
