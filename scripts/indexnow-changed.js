#!/usr/bin/env node
/* Which public URLs did these files change?
 *
 * Takes changed repo paths and prints the site URLs they publish, one per
 * line, ready to hand to indexnow-submit.js. Used by the IndexNow workflow so
 * a merge submits only what actually moved instead of the whole sitemap.
 *
 *   node scripts/indexnow-changed.js compounds/insulin/index.html app.html
 *   git diff --name-only HEAD^ HEAD | xargs node scripts/indexnow-changed.js
 *
 * sitemap.xml is the authority on what is a public URL. A derived path that is
 * not in it prints nothing — that is what keeps a renamed script, a deleted
 * page or a docs edit from being submitted as a URL that does not exist.
 *
 * Prints nothing and exits 0 when nothing public changed. Callers must treat
 * empty output as "submit nothing": indexnow-submit.js with no arguments
 * submits the entire sitemap, which is the opposite of what this is for.
 *
 * Dependency-free. No network calls. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* The two rules the site actually follows: a directory index publishes the
   directory, and any other .html publishes itself without the extension.
   providers/apply.html is /providers/apply; providers/index.html is
   /providers/. Anything else — scripts, docs, assets, the sitemap itself —
   has no URL of its own. */
function urlPathFor(file) {
  const rel = file.replace(/^\.\//, '').replace(/\\/g, '/');
  if (!rel.endsWith('.html')) return null;
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel.slice(0, -'.html'.length);
}

function sitemapPaths() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const byPath = new Map();
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    try { byPath.set(new URL(m[1]).pathname, m[1]); } catch { /* skip a malformed loc */ }
  }
  if (!byPath.size) {
    console.error('indexnow-changed: sitemap.xml contains no <loc> entries');
    process.exit(1);
  }
  return byPath;
}

const files = process.argv.slice(2).filter(Boolean);
const inSitemap = sitemapPaths();
const out = [];
for (const f of files) {
  const p = urlPathFor(f);
  const loc = p && inSitemap.get(p);
  if (loc && !out.includes(loc)) out.push(loc);
}
if (out.length) console.log(out.join('\n'));
