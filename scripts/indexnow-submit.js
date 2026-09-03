#!/usr/bin/env node
/* IndexNow submission — tell Bing, Yandex, Naver and Seznam that the site
   changed, instead of waiting for a recrawl.
 *
 * Google does NOT participate in IndexNow. Google discovery is sitemap.xml,
 * internal links and Search Console; nothing here helps with it.
 *
 * Run by hand after a deploy (GitHub Pages has no build step and CI makes no
 * network calls):
 *
 *   node scripts/indexnow-submit.js            # submit every sitemap URL
 *   node scripts/indexnow-submit.js --dry-run  # print the payload, send nothing
 *   node scripts/indexnow-submit.js /tools/ /markers/estradiol-sensitive-vs-standard/
 *
 * Passing paths submits only those (still resolved against HOST). The key file
 * must already be deployed and reachable at https://<host>/<key>.txt before a
 * submission is accepted — deploy first, then run this.
 *
 * Dependency-free: Node 18+ global fetch, no npm install. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOST = 'therapylog.app';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/* The key is whatever 32-hex .txt file sits at the repo root, so rotating it is
   "add the new file, delete the old one" with no edit here. The file's contents
   must equal its own name; IndexNow checks that. */
function findKey() {
  const files = fs.readdirSync(ROOT).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length === 0) die('no IndexNow key file at the repo root (expected <32-hex>.txt)');
  if (files.length > 1) die(`more than one IndexNow key file at the repo root: ${files.join(', ')}`);
  const name = files[0].replace(/\.txt$/, '');
  const body = fs.readFileSync(path.join(ROOT, files[0]), 'utf8').trim();
  if (body !== name) die(`${files[0]} must contain exactly its own key (${name}), found ${JSON.stringify(body)}`);
  return name;
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (!urls.length) die('sitemap.xml contains no <loc> entries');
  return urls;
}

function die(msg) { console.error('indexnow: ' + msg); process.exit(1); }

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const paths = args.filter((a) => !a.startsWith('--'));

const key = findKey();
const urlList = paths.length
  ? paths.map((p) => (/^https?:/.test(p) ? p : `https://${HOST}${p.startsWith('/') ? p : '/' + p}`))
  : sitemapUrls();

const offSite = urlList.filter((u) => {
  try { return new URL(u).host !== HOST; } catch { return true; }
});
if (offSite.length) die(`refusing to submit URLs that are not on ${HOST}: ${offSite.join(', ')}`);

const payload = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}.txt`,
  urlList
};

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  console.log(`\n(dry run — nothing sent; ${urlList.length} URL(s) would go to ${ENDPOINT})`);
  process.exit(0);
}

(async () => {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    die(`could not reach ${ENDPOINT}: ${e.message}`);
  }
  const body = await res.text().catch(() => '');
  /* 200 accepted, 202 accepted but the key is still being verified. Anything
     else is a real failure worth reading: 403 means the key file is not live
     yet, 422 means a URL is not on this host. */
  if (res.status === 200 || res.status === 202) {
    console.log(`indexnow: ${res.status} — submitted ${urlList.length} URL(s) for ${HOST}`);
    process.exit(0);
  }
  console.error(`indexnow: HTTP ${res.status}${body ? ' — ' + body.slice(0, 400) : ''}`);
  process.exit(1);
})();
