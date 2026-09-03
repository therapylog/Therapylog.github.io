#!/usr/bin/env node
/*
 * The guard on every generated public page.
 *
 * Run: node scripts/validate-public-pages.js
 *
 * The load-bearing check here is the drift guard: every calculator function a
 * page inlines is compared byte for byte against the current text in app.html.
 * That is what turns "these pages run the same math as the app" from a claim
 * into a fact, and it is why editing a lifted function inside a generated page
 * fails the build rather than shipping a page that quietly disagrees with the
 * app about a dose.
 *
 * It also runs each page's inlined script in a DOM stub and exercises the
 * calculators, because a function that matches app.html byte for byte can still
 * be broken by markup surgery — a dropped field, a renamed id — and a hash
 * compare would not notice.
 *
 * Everything else is the SEO-PLAN §9 compliance checklist, mechanically:
 * structure, legal links, the byline, the disclaimer, banned phrases, the tier
 * policy, the sitemap, per-page authored-word minimums and a
 * sibling-similarity ceiling.
 *
 * Dependency-free: fs, path, crypto, vm.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const A = require('./lib/app-source.js');

const ROOT = A.ROOT;
const results = [];
const t = (name, pass, detail) => results.push([!!pass, name, detail || '']);

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* ---- what to check ------------------------------------------------------ */

/* Every public page under the founder's byline. Generated pages come from the
   dates file so a page that exists but was never generated is caught by
   build-pages --check rather than silently skipped here. */
function publicPages() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) walk(rel);
      else if (e.name === 'index.html') out.push(rel);
    }
  };
  ['tools', 'markers', 'about'].forEach((d) => { if (exists(d)) walk(d); });
  return out.sort();
}

const urlOf = (rel) => '/' + rel.replace(/index\.html$/, '');

/* Generated pages are the ones build-pages.js owns; the rest are hand-written
   and exempt from the checks that only make sense for generated output. */
const GENERATED = new Set(
  exists('scripts/page-dates.json')
    ? Object.keys(JSON.parse(read('scripts/page-dates.json')))
    : []
);

/* ---- 1. structure ------------------------------------------------------- */

const pages = publicPages();
t('found public pages to check', pages.length >= 4, pages.length + ' pages');

const LEGAL = ['privacy', 'terms', 'health-data-privacy'];
const DISCLAIMER = 'is not a substitute for professional';

for (const rel of pages) {
  const html = read(rel);
  const url = urlOf(rel);

  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  t(`${url} has a <title>`, !!title && title.trim().length > 10, title);
  t(`${url} title ends with the brand`, !!title && /\| TherapyLog$|— TherapyLog$/.test(title.trim()),
    title);

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  t(`${url} has a meta description`, !!desc && desc.length >= 50 && desc.length <= 320,
    desc ? desc.length + ' chars' : 'missing');

  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  t(`${url} canonical equals its own URL`, canon === 'https://therapylog.app' + url, canon);

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  t(`${url} has exactly one <h1>`, h1s === 1, h1s + ' found');

  t(`${url} names its author in a meta tag`, /<meta name="author" content="Joel Gonzales">/.test(html));
  t(`${url} carries a byline linking /about/`,
    /Joel Gonzales/.test(html) && (url === '/about/' || /href="\/about\/"/.test(html)),
    url === '/about/' ? 'the author page is the target, so it need not link itself' : '');
  t(`${url} says the author is not a clinician`, /Not a clinician/i.test(html));
  t(`${url} carries a last-reviewed date`, /Last reviewed \d{1,2} \w+ \d{4}/.test(html));

  LEGAL.forEach((slug) => t(`${url} links /${slug}`,
    new RegExp(`href="(?:/|https://therapylog\\.app/)${slug}"`).test(html)));

  t(`${url} carries the site disclaimer`, html.includes(DISCLAIMER));

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  t(`${url} has JSON-LD`, !!ld);
  if (ld) {
    let graph = null;
    try { graph = JSON.parse(ld[1]); } catch (e) { /* reported below */ }
    t(`${url} JSON-LD parses`, !!graph);
    if (graph) {
      const nodes = graph['@graph'] || [graph];
      const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean));
      const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
      const dangling = [...new Set(refs.filter((r) => !defined.has(r)))];
      t(`${url} JSON-LD has no dangling @id`, dangling.length === 0, dangling.join(', '));
      t(`${url} JSON-LD author is the /about/ Person`,
        JSON.stringify(graph).includes('https://therapylog.app/about/#joel'));
      /* HowTo rich results were retired in 2023; the markup is dead weight and
         invites a manual action if it disagrees with the page. */
      t(`${url} uses no HowTo markup`, !/"@type"\s*:\s*"HowTo"/.test(ld[1]));
      t(`${url} claims no aggregateRating`, !/aggregateRating/.test(ld[1]));
    }
  }
}

/* ---- 2. banned phrases (SEO-PLAN §9) ----------------------------------- */

const BANNED = [
  [/products?\s+tested/i, 'claims products are tested'],
  [/earned,\s*not\s+bought/i, 'claims a paid badge is not paid'],
  [/TherapyLog\s+Verified/i, 'uses the retired "TherapyLog Verified" badge'],
  [/COA\s+authenticity/i, 'claims COA authenticity is verified'],
  [/\blifetime\b/i, 'advertises a retired lifetime tier'],
  [/\bone-time\b/i, 'advertises a retired one-time purchase'],
  [/\bpay once\b|\bpay-once\b/i, 'advertises a retired pay-once tier'],
  [/\$34\.99/, 'quotes the retired APK price'],
  /* \b after "store" matters: "the app stores this vial's strength" is not a
     store claim, and neither is "no app-store listing" (a denial, handled by
     the negation test below). */
  [/\bapp[\s-]+store\b|\bgoogle[\s-]+play\b|\bplay[\s-]+store\b/i, 'claims app-store availability'],
  [/\b148\b/, 'quotes the pre-dedupe compound count'],
  [/50\+\s*(?:lab\s*)?markers/i, 'under-claims the marker registry'],
];
/* Scanned over the page's PROSE, not its markup. Two reasons: the pre-rendered
   SVG curves are full of coordinates, so "148" as a path number is not a stale
   compound count; and a class name or a hex colour is not a claim. Titles and
   meta descriptions are scanned too, since those are copy. */
function proseOf(html) {
  const meta = [...html.matchAll(/<meta name="(?:description|author)" content="([^"]*)"/g)]
    .map((m) => m[1]).join(' ');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const body = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return [title, meta, body].join(' \n ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
    .replace(/&mdash;|&ndash;/g, '-').replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ');
}

/* "There is no app-store listing" is the copy §9 wants, not the copy it bans.
   The rule is about claiming availability, so a match inside a negated sentence
   passes. */
const NEGATED = /\b(?:no|not|never|without|neither|nor|isn't|aren't|rather than|instead of|unavailable)\b/i;
function sentenceAround(text, index) {
  const start = Math.max(0, text.lastIndexOf('.', index - 1), text.lastIndexOf('\n', index - 1));
  let end = text.indexOf('.', index);
  if (end < 0) end = text.length;
  return text.slice(start, end + 1);
}
const NEGATABLE = new Set(['claims app-store availability']);

for (const rel of pages) {
  const prose = proseOf(read(rel));
  BANNED.forEach(([re, why]) => {
    const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let hit = null;
    for (const m of prose.matchAll(rx)) {
      if (NEGATABLE.has(why) && NEGATED.test(sentenceAround(prose, m.index))) continue;
      hit = m;
      break;
    }
    t(`${urlOf(rel)} - ${why}`, !hit,
      hit ? 'found: ' + JSON.stringify(sentenceAround(prose, hit.index).trim().slice(0, 130)) : '');
  });
}

/* ---- 3. the tier policy, checked against the inlined data --------------- */

/* A raw substring search would be useless: `card` is Cardarine's id and also
   the .card CSS class the app's own markup and checkInteractions() emit. So the
   inlined arrays are parsed and the rendered compound names are read out of the
   markup, and neither may contain a denied id or name. */
const app = A.loadAppData();
const tierCNames = A.TIER_C.map((id) => (app.byId[id] || {}).name).filter(Boolean);
t('every Tier C id resolves to a compound name', tierCNames.length === A.TIER_C.length,
  `${tierCNames.length} of ${A.TIER_C.length}`);

const jsonArrays = (html, varName) => {
  const re = new RegExp(`var ${varName} = (\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\});\\n`);
  const m = html.match(re);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return undefined; }
};

for (const rel of pages) {
  const html = read(rel);
  const url = urlOf(rel);
  if (!GENERATED.has(url)) continue;

  /* the inlined data arrays */
  for (const v of ['TL_SYR_INJECTABLES', 'INTERACTIONS', 'HL_PK', 'TRT_PK']) {
    const data = jsonArrays(html, v);
    if (data === null) continue;
    t(`${url} inlined ${v} parses as JSON`, data !== undefined);
    if (!data) continue;
    const blob = JSON.stringify(data);
    const idHits = A.TIER_C.filter((id) => {
      /* ids appear as object keys or as an "id" value, never as free text */
      return new RegExp(`"${id}"\\s*:`).test(blob) || new RegExp(`"id"\\s*:\\s*"${id}"`).test(blob);
    });
    const nameHits = tierCNames.filter((n) => blob.includes(`"${n}"`) ||
      blob.includes(`"name":"${n}"`) || blob.includes(n));
    t(`${url} ${v} contains no Tier C id`, idHits.length === 0, idHits.join(', '));
    t(`${url} ${v} contains no Tier C compound name`, nameHits.length === 0, nameHits.join(', '));
  }

  /* the names actually rendered into the markup */
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '')
                   .replace(/<style[\s\S]*?<\/style>/g, '')
                   .replace(/<[^>]+>/g, ' ');
  const rendered = tierCNames.filter((n) => new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text));
  t(`${url} renders no Tier C compound name`, rendered.length === 0, rendered.join(', '));

  /* the <option> lists a reader can actually pick from */
  const opts = [...html.matchAll(/<option[^>]*>([^<]+)<\/option>/g)].map((m) => m[1].trim());
  const badOpts = opts.filter((o) => tierCNames.some((n) => o.replace(/ \(estimated\)$/, '') === n));
  t(`${url} offers no Tier C compound in a dropdown`, badOpts.length === 0, badOpts.join(', '));
}

/* ---- 4. the drift guard: inlined functions match app.html --------------- */

/* Every function the generator is allowed to lift. A page containing
   "function <name>(" for any of these must contain app.html's current text for
   it, byte for byte. */
const LIFTABLE = [
  'ucPreset', 'tlReconSolve', 'tlReconOptions', 'tlReconToggle', 'tlReconPick',
  'tlReconRender', 'calcUnified', 'renderSyringe', 'pkCurve', 'pkParseDose',
  'checkInteractions', 'syrAddRow', 'syrRemoveRow', 'syrField', 'syrSetSize',
  'syrMediumOf', 'syrFragile', 'renderSyringeBuilder', 'syrRecalc'
];
const canonical = {};
LIFTABLE.forEach((n) => { canonical[n] = A.fnSource(app.src, n); });

let liftedTotal = 0;
for (const rel of pages) {
  const html = read(rel);
  const url = urlOf(rel);
  for (const name of LIFTABLE) {
    if (!html.includes('function ' + name + '(')) continue;
    liftedTotal++;
    let inPage = null;
    try { inPage = A.fnSource(html, name); } catch (e) { /* reported below */ }
    t(`${url} inlines ${name}() extractably`, !!inPage);
    if (!inPage) continue;
    const ok = inPage === canonical[name];
    t(`${url} ${name}() matches app.html byte for byte`, ok,
      ok ? '' : `sha ${A.sha(inPage).slice(0, 12)} vs app ${A.sha(canonical[name]).slice(0, 12)} ` +
                `— regenerate with node scripts/build-pages.js, do not edit the page`);
  }
}
t('the drift guard actually checked lifted functions', liftedTotal >= 30,
  liftedTotal + ' inlined function copies compared');

/* The first-touch attribution snippet is lifted from pro.html for the same
   reason, so it gets the same treatment. */
{
  const snippet = A.attributionSnippet();
  const hits = pages.filter((rel) => GENERATED.has(urlOf(rel)))
    .filter((rel) => read(rel).includes(snippet));
  const generated = pages.filter((rel) => GENERATED.has(urlOf(rel)));
  t('every generated page carries pro.html\'s first-touch snippet verbatim',
    hits.length === generated.length, `${hits.length} of ${generated.length}`);
}

/* ---- 5. the calculators actually run ----------------------------------- */

/* A hash compare proves the function text is right. It does not prove the
   markup around it still has the ids the function reads. This runs each page's
   inline script against a DOM stub built from the page's own markup and checks
   the numbers. */
function domStub(html) {
  const ids = new Map();
  const attrsOf = (tag) => {
    const o = {};
    for (const m of tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) o[m[1]] = m[2];
    return o;
  };
  /* Seed every element the page declares an id for, with its value/selected
     option, so a lifted function reads what a browser would read. */
  for (const m of html.matchAll(/<(input|select|div|button|canvas|textarea)\b([^>]*)>/g)) {
    const a = attrsOf(m[0]);
    if (!a.id) continue;
    ids.set(a.id, { tag: m[1], value: a.value || '', attrs: a });
  }
  /* A <select>'s initial value is its selected option, or its first. */
  for (const m of html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)) {
    const a = attrsOf('<select' + m[1] + '>');
    if (!a.id) continue;
    const opts = [...m[2].matchAll(/<option([^>]*)>([^<]*)<\/option>/g)].map((o) => {
      const oa = attrsOf('<option' + o[1] + '>');
      return { value: oa.value !== undefined ? oa.value : o[2].trim(), selected: /\bselected\b/.test(o[1]) };
    });
    const sel = opts.find((o) => o.selected) || opts[0];
    if (sel) ids.get(a.id).value = sel.value;
  }
  const els = new Map();
  const el = (id) => {
    if (!els.has(id)) {
      const seed = ids.get(id);
      if (!seed) return null;
      els.set(id, {
        id, value: seed.value, textContent: '', innerHTML: '', innerText: '',
        style: { cssText: '', display: seed.attrs.style && /display:none/.test(seed.attrs.style) ? 'none' : '' },
        className: seed.attrs.class || '', dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        appendChild() {}, remove() {}, focus() {}, blur() {},
        getContext: () => ({}), querySelector: () => null, querySelectorAll: () => [],
        addEventListener() {}, setAttribute() {}, options: []
      });
    }
    return els.get(id);
  };
  const listeners = [];
  const store = new Map();
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    Math, JSON, Number, String, Array, Object, RegExp, Date, Error, isFinite,
    parseFloat, parseInt, encodeURIComponent, decodeURIComponent, URLSearchParams,
    Set, Map, Promise, setTimeout: () => 0, clearTimeout() {}, Chart: undefined,
    document: {
      getElementById: el,
      createElement: () => ({ id: '', style: { cssText: '' }, setAttribute() {}, appendChild() {},
                              textContent: '', innerHTML: '' }),
      querySelector: () => null,
      querySelectorAll: () => ({ forEach() {} }),
      addEventListener: (ev, fn) => listeners.push([ev, fn]),
      body: { appendChild() {} }
    },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null),
                    setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    location: { search: '', pathname: '/tools/', href: 'https://therapylog.app/tools/' },
    navigator: { userAgent: 'node' }
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
  return { sandbox, el, listeners };
}

function runPage(rel) {
  const html = read(rel);
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1]).filter((s) => s.trim().length > 200);
  if (!blocks.length) return null;
  const { sandbox, el, listeners } = domStub(html);
  const ctx = vm.createContext(sandbox);
  for (const b of blocks) vm.runInContext(b, ctx, { timeout: 5000 });
  listeners.filter(([ev]) => ev === 'DOMContentLoaded').forEach(([, fn]) => fn());
  return { sandbox, el, ctx };
}

/* Every generated page's script has to at least load and run its own
   initialiser without throwing. */
for (const rel of pages) {
  const url = urlOf(rel);
  if (!GENERATED.has(url)) continue;
  let ran = null, err = null;
  try { ran = runPage(rel); } catch (e) { err = e; }
  t(`${url} inline script runs in a DOM stub`, !err, err && String(err.message).slice(0, 200));
  if (!ran) continue;
}

/* The reconstitution widget, exercised through the app's real calcUnified(). */
{
  const rel = 'tools/peptide-reconstitution-calculator/index.html';
  if (exists(rel)) {
    const { sandbox, el } = runPage(rel);
    el('uc-vial').value = '5'; el('uc-water').value = '2';
    el('uc-dose').value = '250'; el('uc-unit').value = 'mcg';
    el('uc-syringe').value = '100';
    sandbox.calcUnified();
    const units = parseFloat(el('uc-units').textContent);
    t('recon page: 5 mg in 2 ml, 250 mcg -> 10 units through the app\'s calcUnified()',
      Math.abs(units - 10) < 0.001, String(el('uc-units').textContent));
    t('recon page: the concentration block reads 2,500 mcg/ml',
      /2,?500/.test(el('uc-conc-val').textContent), el('uc-conc-val').textContent);
    const solved = sandbox.tlReconSolve(5, 250, 100, 10);
    t('recon page: tlReconSolve back-solves 5 mg / 250 mcg / 10 u to 2 ml',
      solved && Math.abs(solved.bacMl - 2) < 1e-9, JSON.stringify(solved));
  }
}

/* Every published milligram-to-units row, re-derived by running the app's own
   calcUnified() against the page's own widget. A table that disagreed with the
   calculator printed above it would be the worst kind of error here. */
{
  const recon = require('./page-templates/pages-recon.js');
  let rows = 0, bad = [];
  for (const [id, c] of Object.entries(recon.COMPOUNDS)) {
    const rel = `tools/${c.slug}-reconstitution-calculator/index.html`;
    if (!exists(rel)) { bad.push(rel + ' missing'); continue; }
    const html = read(rel);
    const { sandbox, el } = runPage(rel);
    for (const mcg of c.steps) {
      rows++;
      el('uc-vial').value = String(c.vialMg);
      el('uc-water').value = String(c.bacMl);
      el('uc-dose').value = String(mcg >= 1000 ? mcg / 1000 : mcg);
      el('uc-unit').value = mcg >= 1000 ? 'mg' : 'mcg';
      el('uc-syringe').value = '100';
      sandbox.calcUnified();
      const fromApp = parseFloat(el('uc-units').textContent);
      const fromTable = recon.unitsFor(c.vialMg, c.bacMl, mcg, 100).units;
      /* calcUnified renders to one decimal, so compare at that resolution. */
      if (Math.abs(fromApp - Math.round(fromTable * 10) / 10) > 0.051) {
        bad.push(`${c.slug} ${mcg}mcg: page table ${fromTable} vs app ${fromApp}`);
      }
      /* And the number really is in the published table. */
      const shown = (Math.round(fromTable * 10) / 10).toFixed(1).replace(/\.0$/, '');
      if (!html.includes(shown + ' units')) bad.push(`${c.slug} ${mcg}mcg: "${shown} units" not in the table`);
    }
  }
  t('every published mg-to-units row matches the app\'s own calcUnified()',
    bad.length === 0, bad.slice(0, 4).join(' | '));
  t('the ladder cross-check actually ran', rows >= 15, rows + ' rows re-derived');
}

/* The blend pages' ratio table, re-derived the same way. This table is the whole
   argument of those pages — that a fixed-ratio vial cannot deliver each
   component at what the literature describes for it alone — so it gets the same
   treatment as the mg-to-units ladders: every published number recomputed by
   running app.html's own calcUnified() against the page's own widget, once per
   component. A ratio table that drifted from the calculator above it would be
   worse than no table. */
{
  const blend = require('./page-templates/pages-blend.js');
  /* Same filter index.js applies before anything reaches a public page. */
  const PERF_RE = /performance|cycle|blast|advanced|intermediate/i;
  const api = { publishableDoses: (e) => (e.doses || []).filter((r) => !PERF_RE.test(r.l)) };
  let cells = 0, bad = [];
  for (const [key, b] of Object.entries(blend.BLENDS)) {
    const rel = `tools/${b.slug}/index.html`;
    if (!exists(rel)) { bad.push(rel + ' missing'); continue; }
    const html = read(rel);
    /* Scope the "is it published" test to the ratio table itself. Searching the
       whole page would let a wrong cell pass because the right number happened
       to appear in the prose somewhere. */
    const tableM = html.match(/<h2>The ratio problem, in numbers<\/h2>[\s\S]*?<\/table>/);
    if (!tableM) { bad.push(b.slug + ': the ratio table is missing'); continue; }

    /* Parse the table into cells. A substring search over the whole table is not
       enough: the same number legitimately appears in more than one column, so a
       value moved into the wrong cell would still be "present". Check position. */
    const trs = [...tableM[0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
      [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1].trim()));
    const header = trs[0] || [];
    const bodyRows = trs.slice(1);

    const { sandbox, el } = runPage(rel);
    const comps = b.components.map((c) => ({
      ...c, name: app.byId[c.id].name, range: blend.componentDoseRange(api, app.byId[c.id])
    }));

    /* Column layout: "If you dose for", "Draw", then one column per component,
       in the vial's own order. */
    const wantHeader = ['If you dose for', 'Draw'].concat(comps.map((c) => c.name));
    if (header.join('|') !== wantHeader.join('|')) {
      bad.push(`${b.slug}: ratio-table columns are ${header.join('|')}, expected ${wantHeader.join('|')}`);
      continue;
    }
    const anchors = comps.filter((c) => c.range);
    if (bodyRows.length !== anchors.length) {
      bad.push(`${b.slug}: ratio table has ${bodyRows.length} rows, expected ${anchors.length}`);
      continue;
    }

    anchors.forEach((anchorC, rowIdx) => {
      const row = bodyRows[rowIdx];
      if (!row[0].includes(anchorC.name)) {
        bad.push(`${b.slug}: row ${rowIdx} is labelled "${row[0]}", expected ${anchorC.name}`);
        return;
      }
      el('uc-vial').value = String(anchorC.mg);
      el('uc-water').value = String(b.bacMl);
      el('uc-dose').value = String(anchorC.range.lo >= 1000 ? anchorC.range.lo / 1000 : anchorC.range.lo);
      el('uc-unit').value = anchorC.range.lo >= 1000 ? 'mg' : 'mcg';
      el('uc-syringe').value = '100';
      sandbox.calcUnified();
      const ml = parseFloat((el('uc-ml').textContent || '').replace(/[^0-9.]/g, ''));
      if (!(ml > 0)) { bad.push(`${b.slug}: calcUnified produced no draw volume for ${anchorC.id}`); return; }

      comps.forEach((other, colIdx) => {
        cells++;
        const mcg = other.mg * 1000 * (ml / b.bacMl);
        const shown = blend.fmtAmt(mcg);
        /* The cell at this exact position must carry this exact amount. */
        const cell = row[2 + colIdx] || '';
        const cellAmount = cell.replace(/<em>[\s\S]*?<\/em>/g, '').replace(/<[^>]+>/g, '').trim();
        if (cellAmount !== shown) {
          bad.push(`${b.slug}: dosing ${anchorC.name}, the ${other.name} cell says "${cellAmount}", app math says "${shown}"`);
        }
        /* And the app agrees that that amount needs that same draw. */
        el('uc-vial').value = String(other.mg);
        el('uc-dose').value = String(mcg >= 1000 ? mcg / 1000 : mcg);
        el('uc-unit').value = mcg >= 1000 ? 'mg' : 'mcg';
        sandbox.calcUnified();
        const back = parseFloat((el('uc-ml').textContent || '').replace(/[^0-9.]/g, ''));
        if (Math.abs(back - ml) > 0.002) {
          bad.push(`${b.slug}: ${other.name} split does not round-trip through calcUnified (${back} vs ${ml})`);
        }
      });
    });
  }
  t('every blend ratio-table cell round-trips through the app\'s calcUnified()',
    bad.length === 0, bad.slice(0, 4).join(' | '));
  t('the blend cross-check actually ran', cells >= 20, cells + ' cells re-derived');
}

/* The blend split panel, executed. The ratio table above is generated in Node;
   this is the browser-side code that has to agree with it, and a hash compare
   cannot catch a panel that throws or renders nothing. Drive blSync() the way a
   visitor would and read what it wrote. */
{
  const blend = require('./page-templates/pages-blend.js');
  let bad = [], ran = 0;
  for (const [, b] of Object.entries(blend.BLENDS)) {
    const rel = `tools/${b.slug}/index.html`;
    if (!exists(rel)) { bad.push(rel + ' missing'); continue; }
    const { sandbox, el } = runPage(rel);
    if (typeof sandbox.blSync !== 'function') { bad.push(b.slug + ': blSync() is not defined'); continue; }

    b.components.forEach((c, i) => {
      const f = el('bl-c' + i);
      if (!f) { bad.push(`${b.slug}: no bl-c${i} field for ${c.id}`); return; }
      f.value = String(c.mg);
    });
    el('bl-water').value = String(b.bacMl);
    el('uc-syringe').value = '100';

    /* Anchor on each component in turn and check the panel's own numbers. */
    b.components.forEach((anchorC, idx) => {
      el('bl-anchor').value = String(idx);
      /* Ask for one milligram of the anchored component. */
      el('uc-dose').value = '1';
      el('uc-unit').value = 'mg';
      try { sandbox.blSync(); } catch (e) { bad.push(`${b.slug}: blSync() threw — ${e.message}`); return; }

      const ml = parseFloat((el('uc-ml').textContent || '').replace(/[^0-9.]/g, ''));
      const panel = el('bl-split').innerHTML || '';
      if (!ml) { bad.push(`${b.slug}: blSync() produced no draw volume`); return; }
      if (!/<li>/.test(panel)) { bad.push(`${b.slug}: the split panel rendered nothing`); return; }

      b.components.forEach((other) => {
        ran++;
        const mcg = other.mg * 1000 * (ml / b.bacMl);
        const want = sandbox.blFmt(mcg);
        const name = app.byId[other.id].name;
        /* The panel must name this component and carry this amount for it. */
        const row = (panel.match(new RegExp('<li><span>' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                                            '</span><strong>([^<]*)</strong></li>')) || [])[1];
        if (row === undefined) { bad.push(`${b.slug}: the split panel has no row for ${name}`); return; }
        if (row.trim() !== want) {
          bad.push(`${b.slug}: split panel says ${name} = "${row.trim()}", math says "${want}"`);
        }
      });
    });
  }
  t('the blend split panel runs and agrees with the app\'s own draw volume',
    bad.length === 0, bad.slice(0, 4).join(' | '));
  t('the split-panel check actually ran', ran >= 18, ran + ' panel rows exercised');
}

/* The combination checker, through the app's real checkInteractions(). */
{
  const rel = 'tools/stack-checker/index.html';
  if (exists(rel)) {
    const { sandbox, el } = runPage(rel);
    el('ix-d1').value = 'Semaglutide'; el('ix-d2').value = 'Tirzepatide'; el('ix-d3').value = '';
    sandbox.checkInteractions();
    const hit = el('ix-result').innerHTML;
    t('stack page: a known danger pair is found by the app\'s checkInteractions()',
      /GLP-1|Never Combine/i.test(hit), hit.slice(0, 120));
    el('ix-d2').value = 'Ipamorelin';
    sandbox.checkInteractions();
    const miss = el('ix-result').innerHTML;
    /* app.html's own words on the empty branch. Both branches carry a caveat
       and SEO-PLAN §5.3 says to keep that; this pins the wording so a future
       edit to the app cannot quietly drop it from the public page. */
    t('stack page: an empty result still carries the not-a-clearance caveat',
      /not a complete list/i.test(miss) && /not a safety clearance/i.test(miss),
      miss.replace(/<[^>]+>/g, ' ').slice(0, 200));
    t('stack page: inlined pair count is the app\'s minus Tier C',
      sandbox.INTERACTIONS.length === app.INTERACTIONS.filter((ix) =>
        !ix.drugs.map(app.resolveDrugName).some(A.isTierC)).length,
      `page ${sandbox.INTERACTIONS.length}`);
  }
}

/* The Vermeulen equation, against a hand-worked value. */
{
  const rel = 'tools/free-testosterone-calculator/index.html';
  if (exists(rel)) {
    const { sandbox } = runPage(rel);
    const r = sandbox.tlVermeulen(600, 30, 4.3);
    t('free-T page: 600 ng/dL, SHBG 30, albumin 4.3 -> ~134 pg/mL free',
      r && Math.abs(r.freePgMl - 134) < 4, r && r.freePgMl.toFixed(1));
    t('free-T page: free fraction is about 2.2% of total',
      r && Math.abs(r.freePct - 2.23) < 0.2, r && r.freePct.toFixed(2));
    t('free-T page: bioavailable testosterone is about 325 ng/dL',
      r && Math.abs(r.bioNgDl - 325) < 15, r && r.bioNgDl.toFixed(0));
    t('free-T page: nonsense input returns null rather than a number',
      sandbox.tlVermeulen(0, 30, 4.3) === null && sandbox.tlVermeulen(600, 0, 4.3) === null);
  }
}

/* The TRT split and its steady-state numbers. */
{
  const rel = 'tools/trt-dose-calculator/index.html';
  if (exists(rel)) {
    const { sandbox, el } = runPage(rel);
    el('trt-weekly').value = '120'; el('trt-conc').value = '200';
    el('trt-freq').value = '2'; el('trt-ester').value = 'tc';
    sandbox.trtCalc();
    const out = el('trt-out').innerHTML;
    t('TRT page: 120 mg twice weekly is 60 mg, 0.300 ml, 30 units',
      /\b60\b/.test(out) && /0\.300 ml/.test(out) && /30 units/.test(out), out.slice(0, 200));
    const f = sandbox.pkCurve(sandbox.TRT_PK.tc.hl, sandbox.TRT_PK.tc.tmax);
    const ss = sandbox.steadyState(f, sandbox.TRT_PK.tc.hl, 84);
    const build = require('./page-templates/curve.js');
    const pkCurve = new Function(A.fnSource(app.src, 'pkCurve') + '; return pkCurve;')();
    const expect = build.steadyState(pkCurve(app.TL_PK.tc.hl, app.TL_PK.tc.tmax), app.TL_PK.tc.hl, 84);
    t('TRT page: the page\'s steady-state sampler agrees with the generator\'s',
      ss.ratio === expect.ratio && ss.accumulation === expect.accumulation,
      `page ${JSON.stringify(ss)} vs generator ${JSON.stringify(expect)}`);
  }
}

/* ---- 5b. emitted escapes survived the template literal ------------------ */

/* This exists because it happened. The share-card script is emitted from a JS
   template literal, and a single-backslash \\s inside one is just "s" — so the
   page shipped `replace(/s+/g, ' ')`, which stripped every letter s out of the
   card's subtitle. Nothing else caught it: the function text matched app.html,
   the script parsed, and the DOM stub never renders the card.
 *
 * A bare escape letter with a quantifier in a regex literal is the signature of
 * that mistake, and it is not something this codebase writes on purpose. */
{
  const ESC = /^[sSdDwWbBnrtvf0]$/;
  const suspects = [];
  for (const rel of pages) {
    if (!GENERATED.has(urlOf(rel))) continue;
    const html = read(rel);
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1]);
    for (const src of scripts) {
      for (const m of src.matchAll(/\/(\^?)([^/\n\\[]{1,2})([+*?$])[^/\n]{0,6}\/[gimsuy]*/g)) {
        const body = m[2];
        const letter = body.length === 1 ? body : (body[0] === '^' ? body[1] : null);
        if (letter && ESC.test(letter)) suspects.push(`${urlOf(rel)} ${m[0]}`);
      }
    }
  }
  t('no emitted regex lost a backslash in a template literal', suspects.length === 0,
    suspects.slice(0, 4).join(' | '));
}

/* ---- 5c. the share card renders from the page's own copy ---------------- */

/* Every page's og:image has to exist, whether it is the page's own captured
   card or the shared fallback. A share card that 404s is worse than none. */
{
  const missing = [];
  for (const rel of pages) {
    const html = read(rel);
    for (const m of html.matchAll(/(?:og:image|twitter:image)" content="https:\/\/therapylog\.app([^"]*)"/g)) {
      if (!exists(m[1].replace(/^\//, ''))) missing.push(urlOf(rel) + ' -> ' + m[1]);
    }
  }
  t('every og:image and twitter:image resolves to a committed file',
    missing.length === 0, missing.slice(0, 4).join(' | '));
}

/* ---- 6. sitemap --------------------------------------------------------- */

{
  const bp = require('./build-pages.js');
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>https:\/\/therapylog\.app([^<]*)<\/loc>/g)].map((m) => m[1]);
  const expected = bp.STATIC_PAGES.concat([...GENERATED]);
  const missing = expected.filter((u) => !locs.includes(u));
  const extra = locs.filter((u) => !expected.includes(u));
  t('sitemap lists every generated page and every static page', missing.length === 0,
    missing.join(', '));
  t('sitemap lists nothing else', extra.length === 0, extra.join(', '));
  t('sitemap excludes /app.html, /marketing and add-partner',
    !locs.includes('/app.html') && !locs.some((u) => /marketing|add-partner|404/.test(u)));
  t('sitemap has no duplicate entries', new Set(locs).size === locs.length);
  /* Every generated page carries a lastmod; the hand-written ones deliberately
     do not, because nothing keeps their date honest. */
  const dated = [...xml.matchAll(/<loc>https:\/\/therapylog\.app([^<]*)<\/loc><lastmod>/g)].map((m) => m[1]);
  t('every generated page carries a <lastmod>', [...GENERATED].every((u) => dated.includes(u)),
    [...GENERATED].filter((u) => !dated.includes(u)).join(', '));
  t('no hand-written page carries a <lastmod>',
    bp.STATIC_PAGES.every((u) => !dated.includes(u)),
    bp.STATIC_PAGES.filter((u) => dated.includes(u)).join(', '));
}

/* ---- 7. authored-word minimums and sibling similarity ------------------ */

/* Words in the page's own prose: paragraphs, list items and subheadings, with
   the widget, the formula blocks, tables, figure captions, the CTA, the byline,
   the disclaimer and the footer excluded. That is the content that has to carry
   the page. */
function authoredWords(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  /* Drop the excluded containers by class, non-greedily to the matching close
     of the block they open. The generated markup nests these predictably. */
  ['widget', 'formula', 'cta-box', 'byline', 'disclaimer', 'foot', 'facts', 'tbl', 'topnav', 'crumbs']
    .forEach((cls) => {
      const re = new RegExp(`<(div|figure)[^>]*class="[^"]*\\b${cls}\\b[^"]*"[\\s\\S]*?<\\/\\1>`, 'g');
      s = s.replace(re, ' ');
    });
  s = s.replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ')
       .replace(/<table[\s\S]*?<\/table>/g, ' ')
       .replace(/<svg[\s\S]*?<\/svg>/g, ' ');
  const chunks = [...s.matchAll(/<(p|li|h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => m[2]);
  return chunks.join(' ').replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
}

const MIN_WORDS = [
  [/^\/tools\/half-life\/[^/]+\/$/, 200, 'per-compound half-life page'],
  [/^\/tools\/[a-z0-9-]+-reconstitution-calculator\/$/, 200, 'compound reconstitution page'],
  [/^\/markers\/[^/]+\/$/, 600, 'marker page'],
  [/^\/tools\/[^/]+\/$/, 250, 'tool page'],
  [/^\/tools\/$/, 250, 'tools hub'],
  [/^\/markers\/$/, 250, 'markers hub'],
  [/^\/about\/$/, 400, 'author page']
];

const wordCounts = {};
for (const rel of pages) {
  const url = urlOf(rel);
  const words = authoredWords(read(rel));
  wordCounts[url] = words;
  const rule = MIN_WORDS.find(([re]) => re.test(url));
  if (!rule) { t(`${url} matches a word-count rule`, false, 'no rule for this URL shape'); continue; }
  t(`${url} has at least ${rule[1]} authored words (${rule[2]})`, words.length >= rule[1],
    words.length + ' words');
}

/* Sibling similarity. Two compound variants must not ship near-identical prose:
   that is what a thin-content classification looks for, and it is the easiest
   corner to cut when generating pages from a template. */
function shingles(words, n) {
  const out = new Set();
  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (let i = 0; i + n <= lower.length; i++) out.add(lower.slice(i, i + n).join(' '));
  return out;
}
function jaccard(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
const FAMILIES = [
  [/^\/tools\/half-life\/[^/]+\/$/, 'half-life pages', 0.5],
  [/^\/tools\/[a-z0-9-]+-reconstitution-calculator\/$/, 'reconstitution pages', 0.65]
];
for (const [re, label, ceiling] of FAMILIES) {
  const urls = Object.keys(wordCounts).filter((u) => re.test(u) &&
    u !== '/tools/peptide-reconstitution-calculator/');
  const sh = {};
  urls.forEach((u) => { sh[u] = shingles(wordCounts[u], 5); });
  let worst = null;
  for (let i = 0; i < urls.length; i++) {
    for (let j = i + 1; j < urls.length; j++) {
      const s = jaccard(sh[urls[i]], sh[urls[j]]);
      if (!worst || s > worst.s) worst = { s, a: urls[i], b: urls[j] };
    }
  }
  if (!worst) continue;
  t(`${label}: no two siblings exceed ${ceiling} prose similarity`, worst.s <= ceiling,
    `worst pair ${worst.a} vs ${worst.b} at ${worst.s.toFixed(3)}`);
}

/* ---- 8. internal links resolve ----------------------------------------- */

const ROUTES = {
  '/': 'index.html', '/app': 'app.html', '/guide': 'guide.html', '/pro': 'pro.html',
  '/download': 'download.html', '/support': 'support.html', '/partnership': 'partnership.html',
  '/privacy': 'privacy.html', '/terms': 'terms.html',
  '/health-data-privacy': 'health-data-privacy.html', '/marketing': 'marketing.html'
};
for (const rel of pages) {
  const html = read(rel);
  const url = urlOf(rel);
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
  const bad = [...new Set(hrefs)].filter((h) => {
    if (h.endsWith('/')) return !exists(h.slice(1) + 'index.html');
    if (ROUTES[h] !== undefined) return !exists(ROUTES[h]);
    return !exists(h.slice(1));
  });
  t(`${url} internal links all resolve`, bad.length === 0, bad.join(', '));
}

/* ---- 9. the app itself is untouched ------------------------------------ */

/* A generated page must never be the reason app.html changed. This does not
   pin app.html's contents — it checks the one thing the pages depend on, that
   every liftable function is still extractable and unique. */
LIFTABLE.forEach((n) => {
  t(`app.html still declares ${n}() exactly once`, !!canonical[n] && canonical[n].length > 20);
});

/* ---- report ------------------------------------------------------------- */

const failed = results.filter(([ok]) => !ok);
if (process.argv.includes('-v')) {
  results.forEach(([ok, n, d]) => console.log(`${ok ? '✓' : '✗'} ${n}${d ? '  — ' + d : ''}`));
} else {
  failed.forEach(([, n, d]) => console.log(`FAIL  ${n}${d ? '  — ' + d : ''}`));
}
if (failed.length) {
  console.error(`\npublic pages: ${failed.length} of ${results.length} checks failed`);
  process.exit(1);
}
console.log(`public pages OK: ${results.length} checks across ${pages.length} pages — ` +
  `${liftedTotal} inlined function copies match app.html byte for byte, the calculators run ` +
  `and produce the app's own numbers, the tier policy holds in the inlined data, and the ` +
  `sitemap matches the generated set`);
