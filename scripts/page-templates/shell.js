/* The shared chrome for every generated public page: head, nav, byline,
   disclaimer, CTA, legal footer and JSON-LD. Plain template strings, no engine.

   Two style layers, in this order:
     1. the rules lifted from app.html, which the lifted widget markup needs
        (tokens, .card, .ig/.il, inputs, .btn, .preset-btn, .uc-*, .syringe-*);
     2. this file's page layout, which reads those tokens so the pages match the
        rest of the site.
   Order matters: the page layer wins where the two overlap. */

const AUTHOR = 'Joel Gonzales';
const AUTHOR_ID = 'https://therapylog.app/about/#joel';
const ORG_ID = 'https://therapylog.app/#organization';
const SITE_ID = 'https://therapylog.app/#website';
const SITE = 'https://therapylog.app';

/* One review date for the whole generation. Passed in rather than computed, so
   the generator stays deterministic and --check can compare byte for byte. */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const PAGE_CSS = `
body{font-size:15px;line-height:1.7}
.wrap{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:40px 22px 60px}
.brand{margin-bottom:18px}
.brand img{height:38px;display:block}
.topnav{display:flex;flex-wrap:wrap;gap:18px;font-size:13.5px;font-weight:500;margin-bottom:34px;padding-bottom:16px;border-bottom:1px solid var(--border2)}
.topnav a{color:var(--text3);text-decoration:none}
.topnav a:hover{color:var(--text2)}
.topnav a.cta{color:var(--accent)}
h1{font-family:"DM Serif Display",serif;font-size:33px;font-weight:400;letter-spacing:-0.01em;line-height:1.2;margin:0 0 10px;color:var(--text)}
.lede{font-size:17px;color:var(--text2);margin-bottom:22px}
.updated{font-size:13px;color:var(--text3);margin-bottom:28px}
h2{font-family:"DM Serif Display",serif;font-size:22px;font-weight:400;margin:38px 0 12px;color:var(--text)}
h3{font-size:16px;font-weight:600;margin:24px 0 8px;color:var(--text)}
p{margin-bottom:14px;color:var(--text2)}
ul,ol{margin:0 0 16px 0;padding-left:22px}
li{margin-bottom:9px;color:var(--text2)}
strong{color:var(--text);font-weight:600}
a{color:var(--accent2);text-decoration:none}
a:hover{text-decoration:underline}
.widget{margin:26px 0 8px}
.widget .card{margin-bottom:0}
.callout{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:0 12px 12px 0;padding:16px 18px;margin:20px 0}
.callout p:last-child{margin-bottom:0}
.note{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent3);border-radius:0 12px 12px 0;padding:16px 18px;margin:20px 0}
.note p:last-child{margin-bottom:0}
/* Blend pages: the per-draw split, and the sourcing list under the ratio table. */
.split{list-style:none;margin:4px 0 12px;padding:0}
.split li{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:9px 0;border-top:1px solid var(--border);font-size:14px}
.split li:first-child{border-top:none}
.split li span{color:var(--text2)}
.split li strong{color:var(--accent);font-variant-numeric:tabular-nums;font-size:15px}
.hint{font-size:12.5px;color:var(--text3);line-height:1.6;margin:8px 0 4px}
.srcs{margin:0 0 16px 0;padding-left:20px}
.srcs li{font-size:13.5px;color:var(--text2);margin-bottom:7px}
.srcs .src{color:var(--text3)}
.facts{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4px 18px;margin:22px 0}
.facts dl{display:grid;grid-template-columns:minmax(130px,auto) 1fr;gap:0}
.facts dt{font-size:10.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--text3);padding:11px 14px 11px 0;border-top:1px solid var(--border)}
.facts dd{font-size:14px;color:var(--text2);padding:11px 0;border-top:1px solid var(--border)}
.facts dt:first-of-type,.facts dd:first-of-type{border-top:none}
.tbl{width:100%;overflow-x:auto;margin:18px 0}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:340px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);color:var(--text2)}
th{font-size:10.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--text3)}
td.num{font-family:'DM Mono',monospace;color:var(--text)}
.formula{background:var(--surface2);border:1px solid var(--border2);border-radius:11px;padding:14px 16px;margin:16px 0;font-family:'DM Mono',monospace;font-size:13px;color:var(--text);line-height:1.9;overflow-x:auto}
.cta-box{margin:26px 0;padding:18px;background:rgba(74,222,154,0.06);border:1px solid rgba(74,222,154,0.22);border-radius:14px}
.cta-box p{margin-bottom:12px;color:var(--text2);font-size:14px}
.cta-box a{display:inline-block;background:var(--accent);color:#0a0c0f;padding:11px 20px;border-radius:11px;font-weight:700;font-size:14px;text-decoration:none}
.pairs{margin:22px 0}
.pair{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px;border-left:3px solid var(--border2)}
.pair.danger{border-left-color:var(--danger)}
.pair.warn{border-left-color:var(--accent3)}
.pair.info{border-left-color:var(--accent)}
.pair h3{margin:0 0 4px;font-size:14.5px}
.pair .sev{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.pair p{font-size:13.5px;margin-bottom:8px}
.pair p:last-child{margin-bottom:0}
.pair .mon{font-size:12.5px;color:var(--text3)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:22px 0 26px}
.tcard{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px}
.tcard h3{margin:0 0 6px;font-size:15px}
.tcard h3 a{color:var(--text)}
.tcard p{font-size:13.5px;margin:0;color:var(--text3);line-height:1.6}
.tcard .soon{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text3);border:1px solid var(--border2);border-radius:20px;padding:2px 9px;margin-top:10px}
.curve{margin:20px 0}
.curve svg{width:100%;height:auto;display:block;background:var(--surface);border:1px solid var(--border);border-radius:14px}
.curve figcaption{font-size:12px;color:var(--text3);margin-top:8px;line-height:1.55}
.ev{display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-radius:20px;padding:2px 8px;margin-right:6px;vertical-align:1px}
.ev-est{background:rgba(74,222,154,0.12);color:var(--accent);border:1px solid rgba(74,222,154,0.3)}
.ev-off{background:rgba(245,158,11,0.12);color:var(--accent3);border:1px solid rgba(245,158,11,0.32)}
.ev-theo{background:rgba(255,255,255,0.05);color:var(--text3);border:1px solid var(--border2)}
.byline{margin-top:40px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;font-size:13.5px;color:var(--text3)}
.byline p{margin:0;color:var(--text3)}
.byline strong{color:var(--text2)}
.disclaimer{margin-top:22px;font-size:12.5px;color:var(--text3);line-height:1.65}
.foot{margin-top:30px;padding-top:20px;border-top:1px solid var(--border);font-size:13px;color:var(--text3)}
.foot a{color:var(--text2)}
.crumbs{font-size:12.5px;color:var(--text3);margin-bottom:14px}
.crumbs a{color:var(--text3)}
/* ?og=1 renders the page as a 1200x630 share card instead. Built from the
   page's own h1, lede and byline, so the card cannot say something the page
   does not. scripts/capture-og-shots.js screenshots it. */
body.og-card{overflow:hidden}
body.og-card .wrap{display:none}
.og{position:fixed;inset:0;width:1200px;height:630px;background:var(--bg);
  display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px;
  background-image:radial-gradient(ellipse 70% 60% at 88% -10%,rgba(74,222,154,0.13) 0%,transparent 62%),
    radial-gradient(ellipse 60% 50% at 4% 108%,rgba(245,166,91,0.10) 0%,transparent 60%)}
.og-top{display:flex;align-items:center;gap:14px}
.og-top img{height:44px}
.og-kicker{font-size:15px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent)}
.og h2{font-family:"DM Serif Display",serif;font-weight:400;font-size:62px;line-height:1.08;
  letter-spacing:-0.015em;color:var(--text);margin:0 0 20px;max-width:19ch}
.og p{font-size:24px;line-height:1.45;color:var(--text2);margin:0;max-width:44ch}
.og-foot{display:flex;align-items:baseline;justify-content:space-between;gap:24px;
  border-top:1px solid var(--border2);padding-top:22px;font-size:18px;color:var(--text3)}
.og-foot strong{color:var(--text2);font-weight:600}
@media(max-width:520px){
  h1{font-size:27px}
  .facts dl{grid-template-columns:1fr}
  .facts dt{padding-bottom:0;border-top:1px solid var(--border)}
  .facts dd{padding-top:4px;border-top:none}
}
`.trim();

/* The calculator disclaimer, in the app's own words. index.html carries the
   same framing; app.html's #tool-calc fragment carries the second sentence
   verbatim, which is why the widget keeps its own copy too. */
const CALC_DISCLAIMER =
  'This calculator does the arithmetic you typed and nothing else. It does not know what is ' +
  'actually in your vial, whether the label is accurate, or anything about you. Confirm the ' +
  'vial strength and the diluent volume on your own label before you draw, and take dosing ' +
  'decisions to a qualified provider.';

const SITE_DISCLAIMER =
  'TherapyLog is an informational tracking tool and is not a substitute for professional ' +
  'medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider ' +
  'before starting, changing, or stopping any medical protocol.';

function nav() {
  return `    <nav class="topnav">
      <a href="/">Home</a>
      <a href="/tools/">Tools</a>
      <a href="/markers/">Lab markers</a>
      <a href="/guide">Guide</a>
      <a class="cta" href="/app">Open the app</a>
    </nav>`;
}

function crumbs(trail) {
  if (!trail || !trail.length) return '';
  const parts = trail.map((t, i) =>
    i === trail.length - 1 ? esc(t.name) : `<a href="${t.url}">${esc(t.name)}</a>`);
  return `    <div class="crumbs">${parts.join(' &rsaquo; ')}</div>\n`;
}

function byline(reviewed) {
  return `    <div class="byline">
      <p><strong>Built by ${AUTHOR}, founder of TherapyLog.</strong> Not a clinician.
      Last reviewed ${reviewed}. The calculator on this page runs the same code as the app;
      how these pages are written, sourced and corrected is set out in the
      <a href="/about/">editorial policy</a>.</p>
    </div>`;
}

function disclaimer(includeCalc) {
  const calc = includeCalc ? `    <div class="callout">
      <p>${CALC_DISCLAIMER}</p>
    </div>\n` : '';
  return `${calc}    <div class="disclaimer">
      ${SITE_DISCLAIMER}
    </div>`;
}

function legalFooter() {
  return `    <div class="foot">
      TherapyLog LLC &middot; Floresville, Texas &middot;
      <a href="/privacy">Privacy Policy</a> &middot;
      <a href="/health-data-privacy">Consumer Health Data</a> &middot;
      <a href="/terms">Terms of Use</a> &middot;
      <a href="/about/">About</a> &middot;
      <a href="mailto:hello@therapylog.app">hello@therapylog.app</a>
    </div>`;
}

/* "Save this dose to your log". The ?ref= forward exists because an affiliate
   can link to a tool page; a synthetic ref is never injected. */
function ctaBox(slug, lead, label) {
  return `    <div class="cta-box">
      <p>${lead}</p>
      <a href="/app?utm_source=tools&amp;utm_medium=web&amp;utm_campaign=${esc(slug)}"
         id="tl-cta" data-campaign="${esc(slug)}">${esc(label || 'Save this dose to your log')}</a>
    </div>`;
}

function head(o) {
  const desc = esc(o.description);
  const title = esc(o.title);
  const og = o.ogImage || `${SITE}/icons/og-image.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="author" content="${AUTHOR}">
<link rel="canonical" href="${o.canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="TherapyLog"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${o.canonical}"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="TherapyLog — hormone therapy and peptide protocol tracking"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${og}">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"><meta name="theme-color" content="#0a0c0f">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Lifted from app.html at build time by scripts/lib/app-source.js — do not edit
   here. Restyle the app and regenerate. */
${o.appCss}
/* Page layout (scripts/page-templates/shell.js). */
${PAGE_CSS}
</style>
${o.extraHead ? o.extraHead + '\n' : ''}<script defer src="/_vercel/insights/script.js"></script><script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script></head>`;
}

/* WebPage + BreadcrumbList, with the author and publisher nodes defined on the
   page so no @id dangles. Never HowTo: those rich results were retired. */
function jsonLd(o) {
  const graph = [
    { '@type': 'Person', '@id': AUTHOR_ID, name: AUTHOR, jobTitle: 'Founder', url: `${SITE}/about/` },
    { '@type': 'Organization', '@id': ORG_ID, name: 'TherapyLog', legalName: 'TherapyLog LLC',
      alternateName: 'TherapyLog TRT and peptide tracker', url: `${SITE}/`,
      email: 'hello@therapylog.app' },
    { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE}/`, name: 'TherapyLog',
      alternateName: 'TherapyLog TRT and peptide tracker', publisher: { '@id': ORG_ID } },
    Object.assign({
      '@type': o.type || 'WebPage',
      '@id': o.canonical + '#page',
      url: o.canonical,
      name: o.title,
      description: o.description,
      inLanguage: 'en-US',
      isPartOf: { '@id': SITE_ID },
      author: { '@id': AUTHOR_ID },
      publisher: { '@id': ORG_ID },
      dateModified: o.dateModified,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: (o.trail || []).map((t, i) => ({
          '@type': 'ListItem', position: i + 1, name: t.name, item: t.absolute
        }))
      }
    }, o.extra || {})
  ];
  return '<script type="application/ld+json">\n' +
         JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2) +
         '\n</script>';
}

/* The share card. Reads the page's own h1 and lede rather than being given
   separate copy, so the two cannot diverge. */
const OG_SCRIPT = `
/* ?og=1 swaps the page for a 1200x630 share card built from its own content.
   scripts/capture-og-shots.js is the only thing that asks for it. */
(function () {
  try {
    if (new URLSearchParams(location.search).get('og') !== '1') return;
    var h1 = document.querySelector('h1');
    var lede = document.querySelector('.lede');
    var card = document.createElement('div');
    card.className = 'og';
    card.innerHTML =
      '<div class="og-top">' +
        '<img src="/icons/logo-dark.svg" alt="TherapyLog">' +
        '<span class="og-kicker">Free tool</span>' +
      '</div>' +
      '<div><h2></h2><p></p></div>' +
      '<div class="og-foot"><span><strong>therapylog.app</strong> &middot; TRT and peptide tracker</span>' +
      '<span>No account &middot; same math as the app</span></div>';
    card.querySelector('h2').textContent = h1 ? h1.textContent.trim() : 'TherapyLog';
    card.querySelector('p').textContent = lede
      ? lede.textContent.replace(/\\s+/g, ' ').trim()
      : 'Hormone therapy and peptide tracking.';
    document.body.appendChild(card);
    document.body.classList.add('og-card');
  } catch (e) {}
})();
`.trim();

/* Assemble. `body` is the page's own markup; everything else is chrome. */
function page(o) {
  return [
    head(o),
    '<body>',
    '  <div class="wrap">',
    '    <div class="brand"><a href="/"><img src="/icons/logo-dark.svg" alt="TherapyLog"></a></div>',
    nav(),
    crumbs(o.trail && o.trail.length > 1 ? o.trail : null).replace(/\n$/, ''),
    o.body.replace(/\s+$/, ''),
    byline(o.dateModified === undefined ? '' : o.reviewed),
    disclaimer(o.calcDisclaimer !== false),
    legalFooter(),
    '  </div>',
    '  <script>',
    o.script,
    OG_SCRIPT,
    '  </script>',
    jsonLd(o),
    '</body>',
    '</html>',
    ''
  ].filter((x) => x !== '').join('\n');
}

module.exports = {
  AUTHOR, AUTHOR_ID, ORG_ID, SITE_ID, SITE, esc, PAGE_CSS,
  CALC_DISCLAIMER, SITE_DISCLAIMER,
  nav, crumbs, byline, disclaimer, legalFooter, ctaBox, head, jsonLd, page, OG_SCRIPT
};
