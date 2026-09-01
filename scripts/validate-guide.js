#!/usr/bin/env node
/*
 * User-guide integrity guard.
 *
 * guide.html is the document linked from the purchase email, so it is the first
 * thing a paying customer reads. Every navigation path, feature name, count and
 * screenshot in it has to still be true of the app that shipped — a guide that
 * sends someone to a menu that no longer exists is worse than no guide.
 *
 * This checks the guide against app.html, docs/compounds.json and the public
 * pricing pages, and verifies every asset and internal link resolves.
 *
 * Run:  node scripts/validate-guide.js
 * Exit: 0 on success, 1 with a list of violations.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));

const errors = [];
const fail = m => errors.push(m);
const need = (cond, m) => { if (!cond) fail(m); };

const guide = read('guide.html');
const app = read('app.html');

/* ── assets ─────────────────────────────────────────────────────────────── */
const imgs = Array.from(guide.matchAll(/<img\s+([^>]*?)>/g)).map(m => m[1]);
need(imgs.length >= 8, `guide should show the screenshot set, found ${imgs.length} images`);
for (const attrs of imgs) {
  const src = (attrs.match(/src="([^"]+)"/) || [])[1];
  const alt = (attrs.match(/alt="([^"]*)"/) || [])[1];
  need(!!src, 'an <img> has no src');
  if (src && src.startsWith('/')) {
    need(exists(src.slice(1)), `missing asset: ${src}`);
  }
  need(alt && alt.length > 20, `<img src="${src}"> needs descriptive alt text (screen readers, and it is what shows if the image fails)`);
}

/* ── internal links ─────────────────────────────────────────────────────── */
const routes = { '/app': 'app.html', '/download': 'download.html', '/support': 'support.html',
                 '/privacy': 'privacy.html', '/terms': 'terms.html', '/pro': 'pro.html',
                 '/guide': 'guide.html', '/partnership': 'partnership.html', '/marketing': 'marketing.html',
                 '/health-data-privacy': 'health-data-privacy.html' };
for (const m of guide.matchAll(/href="(?:https:\/\/therapylog\.app)?(\/[a-z-]*)"/g)) {
  const r = m[1];
  if (r === '/') continue;
  need(routes[r] !== undefined, `guide links to ${r}, which is not a known route`);
  if (routes[r]) need(exists(routes[r]), `guide links to ${r} but ${routes[r]} is missing`);
}

/* ── counts must match what the app ships ───────────────────────────────── */
const regStart = app.indexOf('/* MARKER-REGISTRY:START');
const regEnd = app.indexOf('/* MARKER-REGISTRY:END');
need(regStart > -1 && regEnd > regStart, 'app.html marker registry sentinels not found');
const markers = countTopLevelKeys(app.slice(regStart, regEnd));
need(markers >= 90, `expected a full marker registry, counted ${markers}`);
need(new RegExp('(^|[^0-9])' + markers + ' (bloodwork )?markers').test(guide),
     `guide must quote the real marker count (${markers})`);

const classes = JSON.parse(read(path.join('docs', 'compounds.json')));
const compoundIds = new Set();
classes.forEach(c => (c.drugs || []).forEach(d => compoundIds.add(d.id)));
need(new RegExp('(^|[^0-9])' + compoundIds.size + '[- ]compound').test(guide),
     `guide must quote the real compound count (${compoundIds.size})`);

/* the AI quota the guide promises must be the one the pricing pages sell */
const quota = (read('pro.html').match(/(\d+) questions\/month/) || [])[1];
need(!!quota, 'could not read the monthly question count from pro.html');
if (quota) need(new RegExp('(^|[^0-9])' + quota + ' questions a month').test(guide),
                `guide must quote the advertised quota (${quota}/month)`);

/* ── every path and control the guide names must exist in the app ───────── */
/* hub sections: switchHubSection('<tab>','<section>') */
const hubs = new Set(Array.from(app.matchAll(/switchHubSection\('(\w+)','(\w+)'/g)).map(m => m[1] + '/' + m[2]));
const claimedPaths = [
  ['Reference → Tools &amp; Calc', 'reference/tools'],
  ['AI → Profile',                 'me/profile'],
  ['Health → Labs',                'health/bloodwork'],
];
for (const [label, hub] of claimedPaths) {
  need(guide.includes(label.split(' → ')[1]) === false || hubs.has(hub),
       `guide names "${label}" but the app has no ${hub} hub section`);
}
need(hubs.has('reference/tools'), 'app.html lost the Reference → Tools & Calc section the guide points at');
need(hubs.has('me/profile'), 'app.html lost the AI → Profile section the guide points at');
need(hubs.has('health/bloodwork'), 'app.html lost the Health → Labs section the guide points at');

/* segment tabs the guide names */
const segs = new Set(Array.from(app.matchAll(/class="seg-btn[^"]*"[^>]*>([^<]{1,24})</g)).map(m => m[1].trim()));
for (const seg of ['Meds', 'Labs', 'Overview', 'Trends', 'History']) {
  need(segs.has(seg), `guide names the "${seg}" section but app.html has no such seg-btn`);
}

/* controls the guide tells the reader to tap, quoted verbatim */
const controls = [
  'Back up now',
  'Set up automatic weekly backup',
  'Email me my key',
  'Use my purchase email instead',
  'Generate Clinical Report',
  'Clear history',
  'BAC Water',
];
for (const c of controls) {
  need(app.includes(c), `guide references the "${c}" control, which is not in app.html`);
}
need(/Activate a license|Activate your plan/.test(app), 'guide describes activation, which app.html no longer offers');

/* ── claims that must not appear ────────────────────────────────────────── */
need(!/App Store|Google Play|Play Store/.test(guide.replace(/There is no App Store or Play Store listing[^.]*\./, '')
       .replace(/no App Store or Play Store listing to hunt for[^.]*\./, '')
       .replace(/<li><strong>No account, no login[\s\S]*?<\/li>/, '')),
     'the guide must not claim a store listing — the app is web-first on purpose');
need(!/50\+\s*markers/.test(guide), 'stale "50+ markers" claim in the guide');
need(/does not diagnose, treat, or prescribe/i.test(guide), 'the guide must carry the not-a-medical-device line');
need(/this device only/i.test(guide), 'the guide must say the log lives on the device only');
need(/no live sync/i.test(guide.toLowerCase()) || /No live sync/.test(guide),
     'the guide must be explicit that there is no cross-device sync');

/* ── the guide has to be reachable ──────────────────────────────────────── */
const linkers = ['index.html', 'download.html', 'support.html', 'pro.html', 'app.html']
  .filter(f => exists(f) && /href="(?:https:\/\/therapylog\.app)?\/guide"/.test(read(f)));
need(linkers.length > 0, 'nothing links to /guide — it would only be reachable from the purchase email');

/* ── shape ──────────────────────────────────────────────────────────────── */
need(/<title>TherapyLog — User Guide<\/title>/.test(guide), 'guide title changed');
need(/rel="canonical" href="https:\/\/therapylog\.app\/guide"/.test(guide), 'guide canonical URL missing');
const sections = (guide.match(/<section id="/g) || []).length;
const tocLinks = (guide.match(/<li><a href="#/g) || []).length;
need(sections === tocLinks, `contents lists ${tocLinks} entries but there are ${sections} sections`);
for (const m of guide.matchAll(/<li><a href="#([a-z]+)"/g)) {
  need(guide.includes(`<section id="${m[1]}"`), `contents links to #${m[1]}, which has no section`);
}

/* MARKER_REGISTRY writes its own keys and its nested keys at column 0, so
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
    if (depth === 1 && /[A-Za-z0-9_]/.test(c)) {
      const m = /^([A-Za-z0-9_]+)\s*:\s*\{/.exec(block.slice(i));
      if (m && (i === 0 || /[\s,{]/.test(block[i - 1]))) { count++; i += m[1].length; }
    }
  }
  return count;
}

if (errors.length) {
  console.error(`GUIDE VALIDATION FAILED — ${errors.length} problem(s):`);
  errors.forEach(e => console.error('  · ' + e));
  process.exit(1);
}
console.log(`guide OK: ${imgs.length} screenshots, ${(guide.match(/<section id="/g) || []).length} sections, ` +
  `${markers} markers and ${compoundIds.size} compounds quoted correctly, all paths and controls resolve` +
  (linkers.length ? ` — linked from ${linkers.join(', ')}` : ''));
