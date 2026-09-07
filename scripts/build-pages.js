#!/usr/bin/env node
/* Generates the public /tools/ pages, sitemap.xml and llms.txt.
 *
 * Why a generator rather than hand-written pages: every calculator on these
 * pages must run the app's own functions, not a copy of them. The generator
 * lifts the function source out of app.html at build time and
 * scripts/validate-public-pages.js fails CI if any inlined copy stops matching.
 * That is what makes "the same math as the app" a fact instead of a claim.
 *
 * Output is committed, because GitHub Pages has no build step.
 *
 *   node scripts/build-pages.js           write the pages
 *   node scripts/build-pages.js --check   fail if the committed output is stale
 *   node scripts/build-pages.js --list    print what it would write
 *
 * Determinism. Nothing here reads the clock except the one place that has to:
 * a page's review date. Dates live in the committed scripts/page-dates.json,
 * keyed by URL and guarded by a content hash, so a page's date changes only
 * when its content does. Pages are rendered with @@DATE@@ placeholders, hashed,
 * then stamped — so --check never depends on today's date, and CI's shallow
 * checkout cannot make the output look stale.
 *
 * Dependency-free.
 */
const fs = require('fs');
const path = require('path');

const A = require('./lib/app-source.js');
const shell = require('./page-templates/shell.js');
const W = require('./page-templates/widgets.js');
const copy = require('./page-copy.js');

const ROOT = A.ROOT;
const DATES_FILE = path.join(ROOT, 'scripts', 'page-dates.json');

const ISO = '@@DATE_ISO@@';
const LONG = '@@DATE_LONG@@';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/* ---- the static pages the sitemap must also list ------------------------ */
/* Hand-maintained pages. /app.html is excluded (duplicate of /app, which is
   canonical), and so are the two meta-noindex pages and 404.html. */
/* Pages this generator does NOT produce, listed so the sitemap covers them.
   /tools/ and /markers/ are absent on purpose: both hubs are generated now, so
   listing them here too would put them in the sitemap twice — which is exactly
   what validate-public-pages.js caught when /markers/ became generated. */
const STATIC_PAGES = [
  '/', '/app', '/about/', '/guide', '/pro', '/download', '/support',
  '/partnership', '/directory/', '/providers/', '/providers/apply',
  '/privacy', '/terms', '/health-data-privacy'
];

/* ---- half-life pages: which compounds, and under what slug -------------- */
/* 50 of app.html's PK entries are eligible (72 with a half-life, minus the 22
   Tier C ids that have one). Not all 50 ship: several are off-audience
   (metformin, telmisartan, isotretinoin, rapamycin, raloxifene, levothyroxine)
   and several are data twins of an entry already here (BPC-157's systemic
   protocol, TB-500's, kisspeptin-10 and -54). These fifteen are the ones with
   search demand behind them — see docs/seo-research/serp-compounds-competitors.md. */
const HALF_LIFE_PAGES = [
  ['sema', 'semaglutide'],
  ['tirz', 'tirzepatide'],
  ['retatrutide', 'retatrutide'],
  ['tc', 'testosterone-cypionate'],
  ['te', 'testosterone-enanthate'],
  ['bpc', 'bpc-157'],
  ['tb5', 'tb-500'],
  ['cjc', 'cjc-1295'],
  ['ipa', 'ipamorelin'],
  ['tesam', 'tesamorelin'],
  ['hcg2', 'hcg'],
  ['enclo', 'enclomiphene'],
  ['ai1', 'anastrozole'],
  ['serm2', 'sermorelin'],
  ['mk677', 'mk-677']
];

/* ---- compound-specific reconstitution pages ---------------------------- */
const RECON_PAGES = [
  ['sema', 'semaglutide'],
  ['tirz', 'tirzepatide'],
  ['retatrutide', 'retatrutide'],
  ['bpc', 'bpc-157'],
  ['tb5', 'tb-500']
];

/* ------------------------------------------------------------------------ */

function main() {
  const check = process.argv.includes('--check');
  const list = process.argv.includes('--list');

  const app = A.loadAppData();
  const appCss = A.extractCss(app.src);
  const attribution = A.attributionSnippet();
  /* The registry is evaluated through validate-markers.js's own harness, so the
     free-testosterone page's unit list and reference ranges are the app's. */
  const registry = A.loadRegistry(app.src);
  /* A page uses its own share card when scripts/capture-og-shots.js has been
     run and the PNG is committed, and the shared icons/og-image.png otherwise.
     Deterministic in any checkout, because it depends only on committed files —
     but adding a card without regenerating makes --check report the pages stale,
     which is the correct complaint. */
  const ogFor = (url) => {
    const slug = url.replace(/^\/|\/$/g, '').replace(/^tools\/?/, '').replace(/\//g, '-') || 'tools';
    return fs.existsSync(path.join(ROOT, 'assets', 'og', slug + '.png'))
      ? `https://therapylog.app/assets/og/${slug}.png`
      : 'https://therapylog.app/icons/og-image.png';
  };
  /* The sex and age bands every marker page publishes, produced by running the
     app's own getAdjustedLabRanges() against a synthetic profile per band. Built
     once here rather than per page: it evaluates app.html each time. */
  const L = require('./page-templates/markers-lib.js');
  const ranges = { Male: {}, Female: {} };
  for (const sex of ['Male', 'Female']) {
    for (const band of L.AGE_BANDS) ranges[sex][band.age] = A.loadRanges(sex, band.age, app.src);
  }

  const ctx = { app, appCss, attribution, registry, reg: registry, ranges,
                copy, shell, W, A, longDate, ogFor };

  const pages = require('./page-templates/index.js').buildAll(ctx);

  /* Stamp dates from the committed file, guarded by a content hash. */
  const stored = fs.existsSync(DATES_FILE)
    ? JSON.parse(fs.readFileSync(DATES_FILE, 'utf8'))
    : {};
  const dates = {};
  const stale = [];
  for (const p of pages) {
    const hash = A.sha(p.html);
    const prev = stored[p.url];
    if (prev && prev.hash === hash) {
      dates[p.url] = { hash, lastmod: prev.lastmod };
    } else if (check) {
      stale.push(p.url);
      dates[p.url] = { hash, lastmod: (prev && prev.lastmod) || todayIso() };
    } else {
      dates[p.url] = { hash, lastmod: todayIso() };
    }
    p.lastmod = dates[p.url].lastmod;
    p.html = p.html.split(ISO).join(p.lastmod).split(LONG).join(longDate(p.lastmod));
  }

  const sitemap = renderSitemap(pages, dates);
  const llms = copy.llmsTxt(pages);

  const files = pages.map((p) => ({ file: p.file, body: p.html }))
    .concat([{ file: 'sitemap.xml', body: sitemap }, { file: 'llms.txt', body: llms }]);

  if (list) {
    files.forEach((f) => console.log(f.file, '(' + f.body.length + ' bytes)'));
    console.log(`\n${pages.length} pages, ${files.length} files`);
    return 0;
  }

  if (check) {
    const diffs = [];
    for (const f of files) {
      const abs = path.join(ROOT, f.file);
      const have = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
      if (have === null) diffs.push(`${f.file} — missing; run: node scripts/build-pages.js`);
      else if (have !== f.body) diffs.push(`${f.file} — differs from the generator's output`);
    }
    stale.forEach((u) => diffs.push(`${u} — content changed but scripts/page-dates.json was not updated`));
    if (diffs.length) {
      console.error('build-pages --check FAILED: the committed output does not match the generator.\n');
      diffs.forEach((d) => console.error('  ✗ ' + d));
      console.error('\nRun `node scripts/build-pages.js` and commit the result.');
      return 1;
    }
    console.log(`build-pages --check OK: ${files.length} generated files match the generator ` +
                `(${pages.length} pages, ${Object.keys(dates).length} dated entries)`);
    return 0;
  }

  for (const f of files) {
    const abs = path.join(ROOT, f.file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, f.body);
  }
  fs.writeFileSync(DATES_FILE, JSON.stringify(sortKeys(dates), null, 2) + '\n');
  console.log(`build-pages: wrote ${files.length} files (${pages.length} pages), ` +
              `sitemap.xml, llms.txt and scripts/page-dates.json`);
  return 0;
}

/* Only called when a page's content actually changed, and never by --check. */
function todayIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

const sortKeys = (o) => Object.keys(o).sort().reduce((a, k) => { a[k] = o[k]; return a; }, {});

function renderSitemap(pages, dates) {
  const generated = pages.map((p) => ({ loc: p.url, lastmod: p.lastmod }));
  const statics = STATIC_PAGES.map((u) => ({ loc: u, lastmod: null }));
  const all = statics.concat(generated);
  const body = all.map((u) =>
    `  <url><loc>https://therapylog.app${u.loc}</loc>` +
    (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
    `</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/build-pages.js. Do not edit; run the generator.
     <lastmod> is carried on generated pages only, from scripts/page-dates.json,
     which changes a page's date only when that page's content changes. The
     hand-written pages carry none: a date this file cannot keep honest is worse
     than no date at all.
     Excluded on purpose: /app.html (duplicate of /app, which is canonical),
     /marketing and /directory/add-partner (both meta noindex), /404.html. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

if (require.main === module) process.exit(main());
module.exports = { STATIC_PAGES, HALF_LIFE_PAGES, RECON_PAGES, longDate, ISO, LONG };
