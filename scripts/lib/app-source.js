/* Lifting data and code out of app.html.
 *
 * The public pages under /tools/ run the app's own calculator functions rather
 * than re-implementations of them. That promise is only worth making if it is
 * mechanical, so this module is the single place that knows how to pull a
 * literal or a function body out of app.html, and both the generator
 * (build-pages.js) and the guard (validate-public-pages.js) use it. If they
 * extracted independently they could disagree, which is the failure this whole
 * arrangement exists to prevent.
 *
 * The brace matcher is the one from validate-encyclopedia.js and
 * validate-markers.js, kept string-aware, with comment handling added because
 * function bodies contain both // and /* comments and app.html has braces
 * inside them.
 *
 * Dependency-free: fs, path and crypto only.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'app.html');

const readApp = () => fs.readFileSync(APP, 'utf8');
const sha = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

/* ---- bracket matching -------------------------------------------------- */

/* Walk from `marker` to the bracket that closes the first `open` after it.
   Strings, template literals, line comments and block comments are all skipped,
   so a brace inside any of them cannot end the match early. */
function matchBracket(source, from, open, close) {
  const i = source.indexOf(open, from);
  if (i < 0) throw new Error(`no "${open}" after offset ${from}`);
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false;
  for (let j = i; j < source.length; j++) {
    const c = source[j], n = source[j + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; j++; } continue; }
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; j++; continue; }
    if (c === '/' && n === '*') { inBlock = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    if (c === close) { depth--; if (!depth) return { start: i, end: j + 1 }; }
  }
  throw new Error(`unbalanced ${open}${close} after offset ${from}`);
}

/* The bracketed literal only — "{ ... }" or "[ ... ]". */
function literal(source, marker, open, close) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error('marker not found in app.html: ' + marker);
  const { start, end } = matchBracket(source, at, open, close);
  return source.slice(start, end);
}

/* A template literal, from the backtick after `marker` to the one that closes
   it. Needed because some of app.html's markup exists only as a template string
   inside a function — the syringe builder's container, for one — and copying it
   out by hand would be a copy that can drift. Nested ${...} substitutions may
   themselves contain backticks, so this tracks substitution depth. */
function templateLiteral(source, marker) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error('marker not found in app.html: ' + marker);
  const open = source.indexOf('`', at);
  if (open < 0) throw new Error('no template literal after ' + marker);
  let subDepth = 0, braceDepth = 0, esc = false;
  for (let j = open + 1; j < source.length; j++) {
    const c = source[j], n = source[j + 1];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (subDepth === 0 && c === '`') return source.slice(open + 1, j);
    if (c === '$' && n === '{') { subDepth++; braceDepth++; j++; continue; }
    if (subDepth > 0) {
      if (c === '{') braceDepth++;
      else if (c === '}') { braceDepth--; if (!braceDepth) subDepth = 0; }
      else if (c === '`') {
        /* a nested literal inside a substitution: skip it whole */
        let k = j + 1, e2 = false, sub2 = 0, br2 = 0;
        for (; k < source.length; k++) {
          const d = source[k], m = source[k + 1];
          if (e2) { e2 = false; continue; }
          if (d === '\\') { e2 = true; continue; }
          if (sub2 === 0 && d === '`') break;
          if (d === '$' && m === '{') { sub2++; br2++; k++; continue; }
          if (sub2 > 0) { if (d === '{') br2++; else if (d === '}') { br2--; if (!br2) sub2 = 0; } }
        }
        j = k;
      }
    }
  }
  throw new Error('unterminated template literal after ' + marker);
}

/* The whole declaration, marker included, so it can be re-evaluated as-is. */
function declaration(source, marker, open, close) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error('marker not found in app.html: ' + marker);
  const { end } = matchBracket(source, at, open, close);
  return source.slice(at, end);
}

/* A function's source text, byte for byte as app.html has it. This is what gets
   inlined into a page and what the drift guard hashes. */
function fnSource(source, name) {
  const marker = 'function ' + name + '(';
  const at = source.indexOf(marker);
  if (at < 0) throw new Error('function not found in app.html: ' + name);
  if (source.indexOf(marker, at + 1) >= 0) {
    throw new Error(`function ${name} is declared more than once in app.html — ` +
                    'the wrong one could be lifted silently');
  }
  const afterParams = source.indexOf(')', at);
  const { end } = matchBracket(source, afterParams, '{', '}');
  return source.slice(at, end);
}

function block(source, startMark, endMark) {
  const a = source.indexOf(startMark);
  const b = source.indexOf(endMark, a);
  if (a < 0 || b < 0) throw new Error(`block markers not found: ${startMark} .. ${endMark}`);
  return source.slice(a + startMark.length, b);
}

/* ---- the first-touch attribution snippet -------------------------------- */

/* SEO-PLAN §5.2 item 7 says to copy pro.html's first-touch writer verbatim onto
   every tool page. Same origin means shared localStorage, so an affiliate who
   links to /tools/x?ref=CODE gets credit even when the page's CTA is a bare
   /app link — which is what makes these pages something an affiliate can link
   to at all.
 *
 * Lifted rather than pasted, for the same reason the calculator functions are:
 * a copy is a thing that can drift. It guards on tl_attr already being set, so
 * it never overwrites an earlier touch. */
function attributionSnippet(siteRoot) {
  const file = fs.readFileSync(path.join(siteRoot || ROOT, 'pro.html'), 'utf8');
  const startMark = '/* First touch: store whatever brought them here before anything overwrites it. */';
  const a = file.indexOf(startMark);
  if (a < 0) {
    throw new Error('pro.html no longer contains the first-touch attribution comment — ' +
                    'the tool pages copy that snippet, so find where it moved');
  }
  const endMark = '})();';
  const b = file.indexOf(endMark, a);
  if (b < 0) throw new Error('pro.html first-touch snippet has no closing "})();"');
  const snippet = file.slice(a, b + endMark.length);
  if (!/tl_attr/.test(snippet) || !/utm_campaign/.test(snippet)) {
    throw new Error('the lifted first-touch snippet does not look right: ' + snippet.slice(0, 120));
  }
  return snippet;
}

/* ---- CSS, lifted by selector ------------------------------------------- */

/* The tool pages reuse the app's own widget markup, so they need the app's own
   rules for it. Copying the declarations would let the two drift; this lifts
   them from app.html's <style> block every build, so a restyle in the app
   carries over to the pages on the next generate.
 *
 * Multi-selector rules are NARROWED rather than dropped: app.html writes
 * ".card,.li,.sdc,.gb,..." and "#page-dashboard,.card,.stat-card", and taking
 * the whole selector list would drag app chrome onto a public page. The rule is
 * kept with only the selectors on the wanted list.
 *
 * At-rules are skipped. The only media query in app.html that could matter
 * styles scrollbars. */
const CSS_WANTED = [
  /^:root$/,
  /^\*$/,
  /^html$/,
  /^html:has\(body\.light-mode\)$/,
  /^body(\.light-mode)?(::?[a-z-]+)?$/,
  /^(body\.light-mode |\.light-mode )?\.card(-title)?$/,
  /^(body\.light-mode |\.light-mode )?\.(ig|il)$/,
  /^(body\.light-mode |\.light-mode )?\.btn(-[ps])?(:active)?$/,
  /^(body\.light-mode |\.light-mode )?\.preset-btn(:active)?$/,
  /^(body\.light-mode |\.light-mode )?\.uc-(step|step-hd|num|flow-arrow)(:last-of-type)?$/,
  /^(body\.light-mode |\.light-mode )?\.syringe-[a-z]+(::?[a-z-]+)?$/,
  /^(body\.light-mode |\.light-mode )?\.seg(-btn)?(\.active)?(::-webkit-scrollbar)?$/,
  /^(body\.light-mode )?(input|select|textarea|button)(\[[^\]]+\])?(:focus|:active)?$/,
  /^(body\.light-mode )?select option$/
];

function splitRules(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    let j = i;
    while (j < text.length && text[j] !== '{') j++;
    if (j >= text.length) break;
    const sel = text.slice(i, j).trim();
    let k = j, d = 0;
    for (; k < text.length; k++) {
      if (text[k] === '{') d++;
      else if (text[k] === '}') { d--; if (!d) { k++; break; } }
    }
    out.push({ sel, body: text.slice(j + 1, k - 1), atRule: sel.startsWith('@') });
    i = k;
  }
  return out;
}

function extractCss(source) {
  const src = source || readApp();
  const open = src.indexOf('<style');
  const shut = src.indexOf('</style>', open);
  if (open < 0 || shut < 0) throw new Error('app.html has no <style> block');
  const sheet = src.slice(src.indexOf('>', open) + 1, shut).replace(/\/\*[\s\S]*?\*\//g, '');
  const kept = [];
  for (const rule of splitRules(sheet)) {
    if (rule.atRule) continue;
    const sels = rule.sel.split(',').map((s) => s.trim())
      .filter((s) => CSS_WANTED.some((re) => re.test(s)));
    if (!sels.length) continue;
    kept.push(sels.join(',') + '{' + rule.body.trim() + '}');
  }
  if (kept.length < 30) {
    throw new Error(`only ${kept.length} CSS rules matched — app.html's style block ` +
                    'was probably restructured; check CSS_WANTED before shipping pages ' +
                    'that would render unstyled');
  }
  return kept.join('\n');
}

/* ---- the tier policy (SEO-PLAN §7) ------------------------------------- */

/* No public page under the founder's byline carries these. They stay in the
   app — LEDGER §1 locks that content deliberately — and off anything indexable.
   The generator filters every array it inlines through this, and
   validate-public-pages.js re-checks the result. */
const TIER_C = Object.freeze([
  'nandro', 'oxan', 'mast', 'primo', 'osta', 'lgd', 'rad140', 'card', 'pct1',
  'yk11', 'andarine', 'stanozolol', 'npp', 'boldenone', 'trenace', 'trenenan',
  'dianabol', 'anadrol', 'turinabol', 'mastenan', 'primooral', 'testsusp',
  'sustanon'
]);
const isTierC = (id) => TIER_C.includes(id);

/* Eight names in the interaction arrays carry a parenthetical that matches no
   DB name or aka, so they cannot be resolved by index. Resolved by hand here
   and checked by validate-public-pages.js, which fails if a name stops
   resolving — that is how a renamed DB entry gets caught rather than quietly
   dropping a Tier C compound past the filter. */
const DRUG_NAME_TO_ID = Object.freeze({
  'cardarine (gw-501516)': 'card',
  'dutasteride': 'dutast',
  'finasteride': 'dutast',
  'low-dose naltrexone (ldn)': 'ldn',
  'melanotan ii (mt-2)': 'mt2',
  'natural desiccated thyroid (ndt)': 'ndt',
  'pt-141 (bremelanotide)': 'pt141',
  'vip (vasoactive intestinal peptide)': 'vip'
});

/* ---- the app's data ----------------------------------------------------- */

function loadAppData(source) {
  const src = source || readApp();

  const DB = JSON.parse(literal(src, 'const DB = {', '{', '}'));
  const TL_PK = JSON.parse(literal(src, 'const TL_PK = {', '{', '}'));

  const byId = {};
  DB.classes.forEach((c) => c.drugs.forEach((d) => {
    byId[d.id] = Object.assign({}, d, { cls: c.id, clsName: c.name, clsColor: c.color });
  }));

  /* Not strict JSON — single quotes, unquoted keys, escapes — so these are
     evaluated in a bare Function rather than parsed. They are literals lifted
     from a file already in this repo; there is no untrusted input here. */
  const evalLit = (marker, open, close) =>
    new Function('return (' + literal(src, marker, open, close) + ')')();

  const SYR_SIZES = evalLit('const SYR_SIZES', '[', ']');
  const TL_STORAGE = evalLit('const TL_STORAGE = {', '{', '}');
  const TL_FORM = evalLit('const TL_FORM = {', '{', '}');
  const SIDEFX = evalLit('const SIDEFX = [', '[', ']');
  const PK_COLORS = evalLit('const PK_COLORS', '[', ']');

  /* app.html pushes the other two arrays into INTERACTIONS at load; the lifted
     checkInteractions() reads one merged array, so merge at build time. */
  const INTERACTIONS = [
    ...evalLit('const INTERACTIONS = [', '[', ']'),
    ...evalLit('const NEW_INTERACTIONS = [', '[', ']'),
    ...evalLit('const CLINIC_INTERACTIONS = [', '[', ']')
  ];

  /* Display name -> DB id, for resolving interaction pairs against the tier
     policy. Longest match wins so "Testosterone Cypionate" does not lose to a
     shorter aka. */
  const nameIndex = {};
  Object.values(byId).forEach((d) => {
    nameIndex[d.name.toLowerCase()] = d.id;
    String(d.aka || '').split(/,\s*/).forEach((a) => {
      const k = a.trim().toLowerCase();
      if (k && !nameIndex[k]) nameIndex[k] = d.id;
    });
  });
  const resolveDrugName = (name) => {
    const k = String(name).trim().toLowerCase();
    return DRUG_NAME_TO_ID[k] || nameIndex[k] || null;
  };

  /* Storage rule for a compound, replicating tlStorageFor()'s resolution order
     (override, then PK medium, then TL_FORM). Not lifted: the app's copy reads
     nothing else, but replicating it here keeps the generator free of the
     `typeof TL_PK !== 'undefined'` guard that only makes sense in the app. */
  const storageFor = (id) => {
    const over = TL_STORAGE.overrides && TL_STORAGE.overrides[id];
    if (over) return Object.assign({ source: 'override' }, over);
    const pk = TL_PK[id];
    const medium = (pk && pk.medium) || TL_FORM[id];
    const rule = medium && TL_STORAGE.classes[medium];
    if (!rule) return null;
    return Object.assign({ source: 'class', medium }, rule, { fragile: !!(pk && pk.fragile) });
  };

  return {
    src, DB, byId, TL_PK, SYR_SIZES, TL_STORAGE, TL_FORM, SIDEFX, PK_COLORS,
    INTERACTIONS, nameIndex, resolveDrugName, storageFor
  };
}

/* The marker registry, evaluated with the same harness validate-markers.js
   uses, so a page's unit converter runs the app's real normalizeValue(). */
function loadRegistry(source) {
  const src = source || readApp();
  const labRefSrc = declaration(src, 'const LAB_REF = {', '{', '}');
  const labFieldsSrc = declaration(src, 'const LAB_FIELDS = [', '[', ']');
  const registrySrc = block(src, '/* MARKER-REGISTRY:START', '/* MARKER-REGISTRY:END */');
  return new Function(`
${labRefSrc};
${labFieldsSrc};
function getAdjustedLabRanges() { return JSON.parse(JSON.stringify(LAB_REF)); }
${registrySrc.slice(registrySrc.indexOf('\n'))}
return { MARKER_REGISTRY, LAB_REF, LAB_FIELDS, resolveMarker, normalizeValue,
         classify, matchAssayVariant };
`)();
}

module.exports = {
  ROOT, APP, readApp, sha, matchBracket, literal, declaration, fnSource, block,
  templateLiteral,
  TIER_C, isTierC, DRUG_NAME_TO_ID, loadAppData, loadRegistry,
  extractCss, splitRules, CSS_WANTED, attributionSnippet
};
