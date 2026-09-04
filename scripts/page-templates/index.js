/* Assembles every generated page. build-pages.js owns the file list, dates and
   sitemap; this owns what a page contains.
 *
 * Conventions every page here follows, from SEO-PLAN §5.2 and §9:
 *   - one <h1>, naming the tool and the question it answers;
 *   - authored words above the widget, with the formula and a worked example;
 *   - the widget, working with no account and no app;
 *   - "how the math works", then FAQs as plain h3 + paragraphs;
 *   - the calculator disclaimer in the app's own framing;
 *   - the CTA, byline, legal links and JSON-LD from shell.js.
 * No HowTo markup anywhere: those rich results were retired in 2023. */

const shell = require('./shell.js');
const curve = require('./curve.js');

const esc = shell.esc;

/* ---- shared bits -------------------------------------------------------- */

const SITE = 'https://therapylog.app';

/* Definition list. Rows are [label, html] and a null row is skipped, so a
   caller can pass a row that only sometimes exists without branching. */
function factBox(rows) {
  const body = rows.filter(Boolean).map(([k, v]) =>
    `        <dt>${esc(k)}</dt><dd>${v}</dd>`).join('\n');
  return `    <div class="facts">\n      <dl>\n${body}\n      </dl>\n    </div>`;
}

/* Three-tier evidence labelling (SEO-PLAN §9). The wording matches what
   ai-research.js already uses in the app. */
const EV = {
  established: '<span class="ev ev-est">Established clinical use</span>',
  offlabel: '<span class="ev ev-off">Off-label or community practice</span>',
  theoretical: '<span class="ev ev-theo">Animal-only or theoretical</span>'
};

const table = (headers, rows) =>
  `    <div class="tbl">\n      <table>\n        <thead><tr>` +
  headers.map((h) => `<th>${esc(h)}</th>`).join('') +
  `</tr></thead>\n        <tbody>\n` +
  rows.map((r) => '          <tr>' + r.map((c, i) =>
    (i === 0 ? `<td>${c}</td>` : `<td class="num">${c}</td>`)).join('') + '</tr>').join('\n') +
  `\n        </tbody>\n      </table>\n    </div>`;

const formula = (lines) =>
  `    <div class="formula">${lines.map(esc).join('<br>')}</div>`;

/* app.html's dosing rows carry performance and cycle protocols. Those never
   appear on a page under the founder's byline (SEO-PLAN §7).

   Two patterns, because "cycle" means two different things in this data. In a
   row label it is nearly always the bodybuilding sense, so the label filter is
   the broad one §7 specifies. In the frequency and duration fields it is
   usually the Khavinson peptides' "10-day pulse cycles, twice a year", which is
   the dosing pattern those compounds are actually studied at — filtering the
   whole row on the same pattern emptied fourteen compounds' tables of
   legitimate content. So the row fields get a narrower test that catches use
   during or after a suppressive cycle and leaves a pulse schedule alone. It
   removes five rows in total: tamoxifen's two, clomiphene's PCT row, HCG's
   pre-PCT primer, and GHRP-6's "Bulking and Mass" row — the only place in the
   whole reference where that word appears. */
const PERF = /performance|cycle|blast|advanced|intermediate|\bpct\b|post-?cycle|restart|\bbulking\b/i;
const CYCLE_CONTEXT = /during (a |an |the )?cycle|of (a |an |the )?cycle\b|post-?cycle|before starting serm|\bpct\b/i;
const publishableDoses = (entry) => (entry.doses || []).filter((r) =>
  !PERF.test(r.l) && !CYCLE_CONTEXT.test([r.d, r.f, r.c].filter(Boolean).join(' ')));

/* app.html's class names are the encyclopedia's own navigation labels, and three
   kinds of them cannot go in a fact box under the founder's byline: the coded
   one ("Bodybuilding & PED Compounds"), the catch-alls that say nothing
   ("Additional Compounds", "Additional Ancillaries", "Additional Peptides"), and
   the ones that are merely clumsy. NEEDS_LABEL lists the classes where the app's
   own name will not do; every compound in one of them must have an entry in
   COMPOUND_CLASS or the build fails, which is what stops a future batch from
   quietly publishing "Class: Bodybuilding & PED Compounds". */
const NEEDS_LABEL = new Set([
  'Bodybuilding & PED Compounds', 'Additional Compounds', 'Additional Ancillaries',
  'Additional Peptides'
]);
const CLASS_LABEL = {
  'Peptides': 'Peptide',
  'Nootropics and Longevity': 'Nootropic and longevity',
  'Sleep and Neurological': 'Sleep and neurological',
  'Supplements and Nutraceuticals': 'Supplement',
  'Longevity Supplements': 'Longevity supplement',
  'Senolytics and Autophagy': 'Senolytic',
  'Performance and Recovery': 'Performance and recovery',
  'Metabolic and Cardiovascular': 'Metabolic and cardiovascular',
  'Neurological and Cognitive': 'Neurological and cognitive',
  'Collagen and Skin Peptides': 'Skin and collagen peptide',
  'Sexual Health Peptides': 'Sexual health peptide',
  'Anti-Inflammatory Peptides': 'Anti-inflammatory peptide',
  'Metabolic Peptides': 'Metabolic peptide',
  'Khavinson Bioregulators': 'Khavinson bioregulator',
  'Muscle and Myostatin': 'Myostatin pathway',
  'DHEA and Adrenal': 'Adrenal steroid',
  'Thyroid Hormones': 'Thyroid hormone',
  'GH Secretagogues': 'Growth hormone secretagogue',
  'HGH and IGF-1': 'Growth hormone and IGF-1',
  'GLP-1 / Metabolic': 'Incretin (GLP-1 class)',
  'Longevity Compounds': 'Longevity compound',
  'Androgens / TRT': 'Androgen',
  'Ancillaries — AIs and SERMs': 'Ancillary — aromatase inhibitors and SERMs'
};
const COMPOUND_CLASS = {
  tprop: 'Androgen (testosterone ester)',
  proviron: 'Androgen (DHT derivative)',
  amino1mq: 'Metabolic research compound',
  isotretinoin: 'Retinoid',
  raloxifene: 'Selective oestrogen receptor modulator',
  caberbromo: 'Dopamine agonist',
  slupp332: 'Metabolic research compound',
  thymalpha: 'Immune peptide',
  mots: 'Mitochondrial-derived peptide',
  dutast: '5-alpha reductase inhibitor',
  caberg: 'Dopamine agonist',
  exemest: 'Aromatase inhibitor (steroidal)'
};
function displayClass(entry) {
  const own = COMPOUND_CLASS[entry.id];
  if (own) return own;
  if (NEEDS_LABEL.has(entry.clsName)) {
    throw new Error(`no public class label for ${entry.id}: app class "${entry.clsName}" ` +
      'cannot be published as written — add an entry to COMPOUND_CLASS');
  }
  return CLASS_LABEL[entry.clsName] || entry.clsName;
}

const regStatus = (entry) =>
  entry.approval || (entry.reg && entry.reg.status) || entry.status || entry.approvalStatus || null;

const monPanel = (entry) => {
  const m = entry.mon || entry.monitoring;
  if (!m) return null;
  return Array.isArray(m) ? m.join('; ') : m;
};

/* The storage rule, with TL_STORAGE.caveat carried verbatim — SEO-PLAN §9
   requires that sentence wherever a storage rule is shown. */
function storageRows(app, id) {
  const s = app.storageFor(id);
  if (!s) return [];
  /* "Before mixing" only means anything for a lyophilised powder. An oil vial
     or a tablet is never mixed, and the label read as a mistake on those. */
  const mixed = s.medium === 'aq' || /reconstitut/i.test(s.label || '');
  return [
    [mixed ? 'Before mixing' : 'Storage', esc(s.before)],
    s.after ? [mixed ? 'After mixing' : 'Once opened', esc(s.after)] : null,
    s.avoid ? ['What ruins it', esc(s.avoid)] : null,
    ['Handling caveat', `<em>${esc(app.TL_STORAGE.caveat)}</em>`]
  ].filter(Boolean);
}

/* Half-life and Tmax, with est:1 labelled every time it is shown. */
function pkRows(app, id) {
  const pk = app.TL_PK[id];
  if (!pk || pk.hl == null) return [];
  const medium = { aq: 'Aqueous (reconstituted powder)', oil: 'Oil-based (intramuscular or subcutaneous)',
                   susp: 'Aqueous suspension', oral: 'Oral', topical: 'Topical' }[pk.medium] || pk.medium;
  return [
    ['Modelled half-life', curve.fmtHours(pk.hl) +
      (pk.est ? ' <em>&mdash; estimated half-life, limited human PK data</em>' : '')],
    ['Time to peak', curve.fmtHours(pk.tmax)],
    ['Formulation', esc(medium) + (pk.fragile ? ' &middot; fragile protein' : '')]
  ];
}

/* Interaction rules that name this compound, resolved through the same index
   the stack checker uses so a renamed DB entry fails the build. */
function pairsNaming(app, id, isTierC) {
  return app.INTERACTIONS.filter((ix) => {
    const ids = ix.drugs.map(app.resolveDrugName);
    if (ids.some((x) => x === null || isTierC(x))) return false;
    return ids.includes(id);
  });
}

function pairBlocks(pairs) {
  const label = { danger: 'Do not combine', warn: 'Caution', info: 'Worth knowing' };
  return pairs.map((ix) => `      <div class="pair ${esc(ix.severity)}">
        <div class="sev">${esc(label[ix.severity] || ix.severity)}</div>
        <h3>${esc(ix.title)}</h3>
        <p>${esc(ix.desc)}</p>
        <p class="mon"><strong>What to watch:</strong> ${esc(ix.monitor)}</p>
      </div>`).join('\n');
}

const faq = (items) => items.map(([q, a]) =>
  `    <h3>${esc(q)}</h3>\n${a.map((p) => `    <p>${p}</p>`).join('\n')}`).join('\n');

/* ---- page assembly ------------------------------------------------------ */

/* trail: the breadcrumb, innermost last. Both the visible crumbs and the
   BreadcrumbList come from it. */
function toolsTrail(extra) {
  const base = [
    { name: 'Home', url: '/', absolute: SITE + '/' },
    { name: 'Tools', url: '/tools/', absolute: SITE + '/tools/' }
  ];
  return extra ? base.concat(extra) : base;
}

function render(ctx, o) {
  const url = o.url;
  return {
    url,
    file: url.replace(/^\//, '') + 'index.html',
    html: shell.page({
      title: o.title,
      description: o.description,
      canonical: SITE + url,
      ogImage: ctx.ogFor ? ctx.ogFor(url) : undefined,
      appCss: ctx.appCss,
      trail: o.trail,
      type: o.type,
      dateModified: '@@DATE_ISO@@',
      reviewed: '@@DATE_LONG@@',
      calcDisclaimer: o.calcDisclaimer,
      body: o.body,
      script: o.script,
      extra: o.extra,
      extraHead: o.extraHead
    })
  };
}

function buildAll(ctx) {
  const pages = [];
  const mods = [
    require('./pages-hub.js'),
    require('./pages-recon.js'),
    require('./pages-blend.js'),
    require('./pages-calc.js'),
    require('./pages-halflife.js'),
    require('./pages-stack.js'),
    require('./pages-markers.js'),
    require('./pages-markers-checklist.js'),
    require('./pages-markers-hub.js'),
    require('./pages-compounds.js'),
    require('./pages-compounds-hub.js')
  ];
  const api = {
    esc, factBox, EV, table, formula, publishableDoses, regStatus, monPanel, displayClass,
    storageRows, pkRows, pairsNaming, pairBlocks, faq, toolsTrail, render, curve,
    SITE
  };
  for (const m of mods) pages.push(...m.build(ctx, api));

  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.url)) throw new Error('two pages claim the same URL: ' + p.url);
    seen.add(p.url);
  }
  /* Stable order so the sitemap and --check are reproducible. */
  pages.sort((a, b) => a.url.localeCompare(b.url));
  return pages;
}

module.exports = { buildAll };
