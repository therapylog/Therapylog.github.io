#!/usr/bin/env node
/* Source registry and the /sources/ index page.
 *
 * The site cites 88 distinct works across the marker pages, each inside an
 * <ol class="sources"> block, and every one of them was reachable only from the
 * single page that happened to cite it. There was no way to ask "what does
 * TherapyLog actually base its claims on" and get an answer — which is the
 * question that decides whether a reader trusts the rest.
 *
 * Two inputs, deliberately separate:
 *
 *   DISCOVERED — scraped from the <ol class="sources"> blocks already in the
 *   pages. Derived, never hand-edited; the page stays the source of truth for
 *   what it cites.
 *
 *   assets/sources/manual.json — AUTHORED. Sources that have been researched
 *   and verified but are not yet cited on a page, and sources backing in-app
 *   content (the encyclopedia and marker guide) which live in app.html rather
 *   than in a page with a sources block.
 *
 * Both land in one registry with stable ids, so a claim anywhere in the product
 * can point at /sources/#<id> and a reader gets from an assertion to the paper
 * in two clicks.
 *
 * Ids are derived from the work, not from position: a PubMed id, a PMC id or a
 * DOI where one exists. That means the same paper cited from three pages
 * resolves to one anchor, and reordering a page's list never moves an anchor.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANUAL = path.join(ROOT, 'assets', 'sources', 'manual.json');
const REGISTRY = path.join(ROOT, 'assets', 'sources', 'registry.json');
const PAGE = path.join(ROOT, 'sources', 'index.html');

const SKIP_DIRS = new Set(['node_modules', '.git', 'vendor', 'icons', 'assets']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/* Stable id from the work itself. Falls back to a host slug plus a short digest
   of the URL so an id is always deterministic and never collides. */
function idFor(url) {
  let m;
  if ((m = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/))) return 'pmid-' + m[1];
  if ((m = url.match(/PMC(\d{4,})/i))) return 'pmc-' + m[1];
  if ((m = url.match(/doi\.org\/(10\.[^\s?#]+)/i))) {
    return 'doi-' + m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  if ((m = url.match(/\/doi\/(?:full\/|abs\/|pdf\/)?(10\.[^\s?#]+)/i))) {
    return 'doi-' + m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  let host = 'src';
  try { host = new URL(url).hostname.replace(/^www\./, '').split('.')[0]; } catch (e) {}
  const digest = require('crypto').createHash('sha1').update(url).digest('hex').slice(0, 8);
  return `${host}-${digest}`;
}

const clean = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function discover() {
  const found = new Map();
  for (const file of walk(ROOT)) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/index\.html$/, '');
    const re = /<li id="src-\d+">\s*<a href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>\s*(?:<span class="src">([\s\S]*?)<\/span>)?/g;
    let m;
    while ((m = re.exec(html))) {
      const url = m[1];
      const id = idFor(url);
      if (!found.has(id)) {
        found.set(id, { id, url, title: clean(m[2]), note: clean(m[3]), citedBy: [] });
      }
      const e = found.get(id);
      if (!e.citedBy.includes(rel)) e.citedBy.push(rel);
      /* Longest note wins — pages annotate the same work at different depths. */
      const note = clean(m[3]);
      if (note.length > (e.note || '').length) e.note = note;
    }
  }
  return found;
}

function loadManual() {
  if (!fs.existsSync(MANUAL)) return [];
  let raw;
  try { raw = JSON.parse(fs.readFileSync(MANUAL, 'utf8')); }
  catch (e) { throw new Error(`assets/sources/manual.json is not valid JSON: ${e.message}`); }
  const list = Array.isArray(raw) ? raw : raw.sources;
  if (!Array.isArray(list)) throw new Error('manual.json must be an array, or an object with a "sources" array');
  return list.map((s, i) => {
    if (!s.url || !/^https?:\/\//.test(s.url)) throw new Error(`manual.json[${i}]: missing or non-http url`);
    if (!s.title) throw new Error(`manual.json[${i}] (${s.url}): missing title`);
    if (!s.note) throw new Error(`manual.json[${i}] (${s.url}): missing note — say what this source establishes and why it is cited`);
    return { id: s.id || idFor(s.url), url: s.url, title: clean(s.title), note: clean(s.note),
             topic: s.topic || 'general', tier: s.tier || null, citedBy: [] };
  });
}

function build() {
  const discovered = discover();
  const manual = loadManual();

  for (const m of manual) {
    if (discovered.has(m.id)) {
      /* Already cited on a page — keep the page's citedBy, take the authored
         topic and tier, which the scraper cannot know. */
      const d = discovered.get(m.id);
      d.topic = m.topic; d.tier = m.tier;
      if (m.note.length > d.note.length) d.note = m.note;
    } else {
      discovered.set(m.id, m);
    }
  }

  const sources = [...discovered.values()].sort((a, b) => a.title.localeCompare(b.title));
  const registry = { version: 1, count: sources.length, sources };
  return { registry, json: JSON.stringify(registry, null, 1) + '\n', page: renderPage(sources) };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderPage(sources) {
  const byTopic = {};
  for (const s of sources) (byTopic[s.topic || 'general'] = byTopic[s.topic || 'general'] || []).push(s);
  const topics = Object.keys(byTopic).sort((a, b) => (a === 'general' ? 1 : b === 'general' ? -1 : a.localeCompare(b)));

  const body = topics.map((t) => `
    <h2 id="topic-${esc(t)}">${esc(t.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()))} <span class="n">${byTopic[t].length}</span></h2>
    <ol class="sources">
${byTopic[t].map((s) => `      <li id="${esc(s.id)}">
        <a href="${esc(s.url)}" rel="nofollow noopener" target="_blank">${esc(s.title)}</a>
        ${s.note ? `<span class="src">${esc(s.note)}</span>` : ''}
        ${s.tier ? `<span class="tier tier-${esc(s.tier)}">${esc(s.tier)}</span>` : ''}
        ${s.citedBy && s.citedBy.length ? `<span class="cited">Cited on ${s.citedBy.map((p) => `<a href="/${esc(p)}">/${esc(p)}</a>`).join(', ')}</span>` : ''}
      </li>`).join('\n')}
    </ol>`).join('\n');

  const desc = 'Every source behind TherapyLog’s compound, lab-marker and protocol content, in one place.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Sources | TherapyLog</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Joel Gonzales">
<link rel="canonical" href="https://therapylog.app/sources/">
<meta property="og:type" content="website"><meta property="og:site_name" content="TherapyLog"><meta property="og:title" content="Sources | TherapyLog"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="https://therapylog.app/sources/"><meta property="og:image" content="https://therapylog.app/icons/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0c0f;--surface:#111418;--surface2:#181c22;--border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.10);--accent:#4ade9a;--accent2:#3bc4ff;--accent3:#f59e0b;--text:#e8edf5;--text2:#8a95a3;--text3:#78859b;--r:16px;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:"DM Sans",system-ui,-apple-system,sans-serif;margin:0;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto;padding:40px 22px 60px}
h1{font-family:"DM Serif Display",serif;font-size:33px;font-weight:400;letter-spacing:-0.01em;line-height:1.2;margin:0 0 10px}
h2{font-family:"DM Serif Display",serif;font-size:22px;font-weight:400;margin:38px 0 12px;display:flex;align-items:baseline;gap:10px}
h2 .n{font-family:"DM Mono",monospace;font-size:12px;color:var(--text3);font-weight:400}
a{color:var(--accent2);text-decoration:none}
a:hover{text-decoration:underline}
.lede{color:var(--text2);font-size:15.5px;margin:0 0 6px}
.note{color:var(--text3);font-size:13.5px;border-left:2px solid var(--border2);padding-left:14px;margin:22px 0 10px}
ol.sources{list-style:decimal;padding-left:20px;margin:0}
ol.sources li{margin:0 0 18px;padding-left:4px}
ol.sources li:target{background:rgba(74,222,154,0.07);outline:1px solid rgba(74,222,154,0.25);border-radius:8px;padding:10px 10px 10px 14px;margin-left:-14px}
.src{display:block;color:var(--text2);font-size:13.5px;margin-top:4px}
.cited{display:block;color:var(--text3);font-size:12px;margin-top:5px}
.tier{display:inline-block;font-family:"DM Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;padding:2px 7px;border-radius:5px;margin-top:6px;border:1px solid var(--border2);color:var(--text3)}
.tier-clinical{color:var(--accent);border-color:rgba(74,222,154,.35)}
.tier-off-label{color:var(--accent2);border-color:rgba(59,196,255,.35)}
.tier-community{color:var(--accent3);border-color:rgba(245,158,11,.35)}
.tier-preclinical{color:var(--text3)}
footer{margin-top:50px;padding-top:22px;border-top:1px solid var(--border);color:var(--text3);font-size:13px}
</style>
</head>
<body>
<div class="wrap">
<h1>Sources</h1>
<p class="lede">${esc(desc)} ${sources.length} works, linked to the original.</p>
<p class="note">Where a claim in the app or on this site rests on something other than a
definition, it points here. Evidence tier is labelled where it is not established clinical
use &mdash; a lot of what is done with anabolic compounds and research peptides has no
controlled human trial behind it, and this page says so rather than implying otherwise.</p>
${body}
<footer>
<p><a href="/">TherapyLog</a> &middot; <a href="/markers/">Lab markers</a> &middot; <a href="/compounds/">Compounds</a></p>
<p>Reference material for adults managing their own protocols. Not medical advice, and not a
substitute for a clinician who can examine you and order tests.</p>
</footer>
</div>
</body>
</html>
`;
}

function main() {
  const check = process.argv.includes('--check');
  const { registry, json, page } = build();

  if (check) {
    let stale = [];
    if (!fs.existsSync(REGISTRY) || fs.readFileSync(REGISTRY, 'utf8') !== json) stale.push('assets/sources/registry.json');
    if (!fs.existsSync(PAGE) || fs.readFileSync(PAGE, 'utf8') !== page) stale.push('sources/index.html');
    if (stale.length) {
      console.error(`stale: ${stale.join(', ')} — run: node scripts/build-sources.js`);
      process.exit(1);
    }
    console.log(`sources up to date (${registry.count} works)`);
    return;
  }

  fs.mkdirSync(path.dirname(REGISTRY), { recursive: true });
  fs.mkdirSync(path.dirname(PAGE), { recursive: true });
  fs.writeFileSync(REGISTRY, json);
  fs.writeFileSync(PAGE, page);
  const withTopic = registry.sources.filter((s) => s.topic && s.topic !== 'general').length;
  console.log(`wrote assets/sources/registry.json and sources/index.html — ${registry.count} works (${withTopic} topic-tagged)`);
}

main();
