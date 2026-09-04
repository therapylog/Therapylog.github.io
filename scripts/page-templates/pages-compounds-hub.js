/* /compounds/ — the hub. Generated from the compound pages that exist.
 *
 * Two jobs beyond listing. It states the site's publishing rule, including the
 * part where it declines to publish, which is worth more to a reader than a
 * directory would be. And it has to be usable as a place to send someone who
 * asked about one compound — which means a filter box and stable anchors per
 * group, not a wall of sixty cards.
 *
 * GROUPS is an authored taxonomy rather than app.html's `cls` field. The app's
 * classes are for the encyclopedia's own navigation and read badly as public
 * headings: "Additional Compounds", "Additional Peptides", and a catch-all
 * "Peptides" holding thirteen unrelated things. These are the groupings someone
 * actually asks in. Being hand-maintained, it is asserted below: a compound
 * with a page and no group fails the build rather than vanishing from the hub. */

const shell = require('./shell.js');
const A = require('../lib/app-source.js');

const GROUPS = [
  { id: 'testosterone', title: 'Sex hormones and androgens',
    blurb: `The esters and the routes, the two oral androgens that act on binding rather than
            on the receptor, and the one hormone here that is usually prescribed alongside
            oestrogen. Everything androgenic in this group suppresses your own production.`,
    ids: ['tc', 'te', 'tprop', 'testpellets', 'proviron', 'progesterone'] },

  { id: 'estrogen-and-recovery', title: 'Oestrogen control and axis recovery',
    blurb: `Aromatase inhibitors, the receptor modulators, and the compounds that act on the
            pituitary or the testis directly. The failure mode across most of this group is
            over-correction, and it looks like the problem it was meant to fix.`,
    ids: ['ai1', 'exemest', 'nolv', 'clom', 'enclo', 'raloxifene', 'hcg2', 'gonadorelin',
          'kissp', 'caberg', 'dutast'] },

  { id: 'thyroid', title: 'Thyroid',
    blurb: `The prohormone, the active hormone, and the porcine extract that supplies both in a
            ratio you cannot change. Which value to read differs between them.`,
    ids: ['t4', 't3', 'ndt'] },

  { id: 'metabolic', title: 'Weight and metabolic',
    blurb: `The incretin drugs and what is behind them in trials, the older metabolic compounds
            people combine with them, and one research compound with no human data at all.`,
    ids: ['sema', 'tirz', 'retatrutide', 'cagrilintide', 'metformin', 'berberine', 'acarbose',
          'telmisartan', 'ldn', 'amino1mq', 'slupp332'] },

  { id: 'growth-hormone', title: 'Growth hormone, IGF-1 and muscle signalling',
    blurb: `Growth hormone itself, the releasing-hormone analogues, the ghrelin receptor
            agonists and the fragments, plus the myostatin pathway. IGF-1 is the marker for
            most of them, and it measures exposure rather than benefit.`,
    ids: ['rhgh', 'tesam', 'serm2', 'cjc', 'dac', 'ipa', 'ghrp2', 'ghrp6', 'hexarelin',
          'mk677', 'hghfrag', 'aod9604', 'follistatin'] },

  { id: 'repair', title: 'Repair, immunity and inflammation',
    blurb: `The healing peptides, the immune peptides and the gut barrier compounds. Also the
            group with the widest gap between how confidently these are described and what has
            actually been tested in people.`,
    ids: ['bpc', 'tb5', 'pda', 'kpv', 'ara290', 'thymalpha', 'thymalin', 'll37', 'larazotide',
          'vip'] },

  { id: 'longevity', title: 'Longevity and mitochondrial',
    blurb: `Compounds taken on mechanism and animal lifespan data. None of them has a human
            longevity outcome, because no such trial has run long enough to have one.`,
    ids: ['rapamycin', 'fisetin', 'dasatinib', 'quercetin', 'spermidine', 'nad', 'nad-iv',
          'mots', 'humanin', 'ss31', 'epi'] },

  { id: 'neuro', title: 'Sleep, mood and cognition',
    blurb: `Mostly compounds approved in one country and unstudied everywhere else, with
            subjective endpoints and no bloodwork to anchor them.`,
    ids: ['semax', 'selank', 'cerebrolysin', 'nalt', 'dihexa', 'dsip', 'melatonin-ther'] },

  { id: 'sexual-health', title: 'Skin, hair and sexual health',
    blurb: `The melanocortin agonists — one selective and approved for one indication, one that
            activates the whole receptor family and changes every mole on the body — alongside
            the skin compounds and the bonding hormone.`,
    ids: ['pt141', 'mt2', 'isotretinoin', 'ghkcu', 'oxytocin'] },

  { id: 'supplements', title: 'Adrenal and supplements',
    blurb: `Available without a prescription, which is a statement about regulation rather
            than about how carefully they need to be used.`,
    ids: ['dhea', 'creatine', 'taurine'] }
];

function build(ctx, api) {
  const mod = require('./pages-compounds.js');
  const built = mod.build(ctx, api);
  const pageFor = new Map(built.map((p) => [p.url, p]));
  const shipped = Object.entries(mod.COMPOUNDS)
    .filter(([, def]) => pageFor.has('/compounds/' + def.slug + '/'));

  /* Every shipped compound is in exactly one group, and no group names one that
     is not shipped. A hub that silently omits a page is worse than a build that
     fails, because nothing else would ever catch it. */
  const grouped = new Set();
  const problems = [];
  GROUPS.forEach((g) => g.ids.forEach((id) => {
    if (grouped.has(id)) problems.push(`${id} is in more than one group`);
    grouped.add(id);
  }));
  const shippedIds = new Set(shipped.map(([id]) => id));
  shippedIds.forEach((id) => { if (!grouped.has(id)) problems.push(`${id} has a page and no group`); });
  grouped.forEach((id) => { if (!shippedIds.has(id)) problems.push(`group names ${id}, which has no page`); });
  if (problems.length) throw new Error('compound hub grouping is inconsistent:\n  ' + problems.join('\n  '));

  const defFor = new Map(shipped);
  const card = (id) => {
    const def = defFor.get(id);
    const entry = ctx.app.byId[id];
    const tier = A.tierOf(id);
    /* data-cx is what the filter box matches against: name, aliases and the
       app's own class, lower-cased at build time so the page does no work. */
    const hay = [entry.name, entry.aka, api.displayClass(entry), tier === 'A' ? 'approved' : 'research']
      .filter(Boolean).join(' ').toLowerCase();
    return `      <div class="tcard" data-cx="${api.esc(hay)}">
        <h3><a href="/compounds/${def.slug}/">${api.esc(entry.name)}</a></h3>
        <p>${api.esc(entry.aka || api.displayClass(entry))}</p>
        <span class="tier tier-${tier.toLowerCase()}">${tier === 'A' ? 'Approved or OTC' : 'Research'}</span>
      </div>`;
  };

  const counts = A.assertTiers(ctx.app.byId);
  const publishable = counts.A + counts.B;
  const total = shipped.length;

  const groupBlocks = GROUPS.map((g) => `    <section class="cx-group" id="${g.id}">
      <h2>${api.esc(g.title)}</h2>
      <p>${g.blurb.replace(/\s+/g, ' ').trim()}</p>
      <div class="cards">
${g.ids.map(card).join('\n')}
      </div>
    </section>`).join('\n\n');

  const body = [
    `    <h1>Compound reference: what each one is, how it is dosed, and what to monitor</h1>`,
    `    <p class="lede">One page per compound, built from the same reference data the TherapyLog
    app runs on &mdash; the modelled half-life, the storage rule, the monitoring panel, the
    documented interactions &mdash; with the pharmacology written out rather than summarised into
    a benefits list.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,

    `    <div class="cx-find">
      <label for="cx-q">Find a compound</label>
      <input type="search" id="cx-q" autocomplete="off" spellcheck="false"
             placeholder="Type a name — semaglutide, BPC-157, T3, anastrozole…">
      <div id="cx-status" class="cx-status"></div>
    </div>`,
    /* No digit may sit next to the word "compound" here. validate-encyclopedia
       rule 9 matches /(\d+)\+?[- ][Cc]ompound/ and holds any count of 40 or
       more to the real catalogue size of 130 — which is right, because a page
       printing "60 compound…" reads as a claim about how many the app covers.
       The count of pages goes in on its own. */
    `    <p class="hint">${total} pages so far. Type to filter, or press Enter to jump
    straight to the first match. Each heading below is a link you can share on its own &mdash;
    <a href="#growth-hormone">/compounds/#growth-hormone</a> opens this page at that group.</p>`,

    groupBlocks,

    `    <h2 id="what-these-are">What these pages are, and what they are not</h2>`,
    `    <p>Every fact in the boxes on a compound page is lifted from the app at build time: the
    half-life and time to peak, the formulation, the storage rule and its handling caveat, the
    monitoring panel, the drawbacks the app records, the dosing rows it holds, and the interaction
    rules that name the compound. That means these pages cannot quietly disagree with the app, and
    a change to the app's reference shows up here on the next build rather than never.</p>`,
    `    <p>What they are not is a protocol. No page here tells a reader to take an amount, and
    none of them reproduces the app's combination protocols &mdash; a combination presented as a
    plan under a byline is a recommendation to run it, whatever the disclaimer underneath says.
    The <a href="/tools/stack-checker/">combination checker</a> covers combinations from the other
    direction, as a check for documented conflicts. There is no vendor, clinic, testing service or
    discount code on any of these pages, and there will not be.</p>`,
    `    <p>Each page also publishes the drawbacks the app records and not the benefits it
    records. That asymmetry is deliberate. A risk someone has not heard of is worth reading; a
    list of benefits under the founder's byline on a page built to rank is advertising, and
    labelling it otherwise would not change what it is.</p>`,

    `    <h2 id="which-compounds">Which compounds get a page</h2>`,
    `    <p>The app's reference covers 130 compounds. ${publishable} of them can be described
    responsibly on a public page, and they are split into two groups that are presented
    differently:</p>`,
    `    <ul>
      <li><strong>Approved and available (${counts.A}).</strong> Compounds obtainable lawfully in
      the United States, either as a prescription drug &mdash; used on-label or off-label &mdash;
      or as a dietary supplement, over-the-counter product or cosmetic. Their pages carry the
      approval string from the app's reference in the fact box.</li>
      <li><strong>Research and unapproved (${counts.B}).</strong> Research compounds, molecules
      still in trials, compounds compounded from an unapproved ingredient, and drugs approved
      somewhere other than the United States. Their pages open with a regulatory block stating the
      approval status, the fact that nobody has verified identity or purity for the vial in
      question, and the storage caveat.</li>
    </ul>`,
    `    <p>The remaining ${counts.C} are in the app and do not get a page here. They are the
    anabolic-androgenic steroids and selective androgen receptor modulators used for
    performance, and the reasoning is not squeamishness: a page about them under this byline,
    written to rank, would function as promotion no matter how it was framed, and the honest
    version of that page is one nobody would publish. They stay in the app, where they exist to
    make a log accurate for someone already using them, and off the indexable site.</p>`,

    `    <h2 id="the-rest">The rest of the reference</h2>`,
    `    <p>${total} of the ${publishable} publishable compounds have a page so far; the others
    are being written in batches, and nothing is linked here until its page is live and has been
    read end to end. In the meantime the app's own encyclopedia carries all 130 with the same
    underlying data &mdash; <a href="/app">open it here</a>, no account needed. The
    <a href="/tools/">calculators</a> cover reconstitution, syringe volumes and half-life
    arithmetic, and the <a href="/markers/">lab-marker pages</a> cover the bloodwork that follows
    most of these.</p>`,

    shell.ctaBox('compounds-hub',
      'The app holds the same reference data these pages are built from, plus the log that turns ' +
      'a dose and a lab result into a trend.',
      'Open the reference')
  ].filter(Boolean).join('\n\n');

  /* Progressive enhancement: with no JavaScript every card is visible and every
     group anchor still works. Guarded throughout because validate-public-pages
     runs this against a DOM stub whose querySelectorAll returns a bare forEach. */
  const filter = `
document.addEventListener('DOMContentLoaded', function () {
  try {
    var box = document.getElementById('cx-q');
    var status = document.getElementById('cx-status');
    if (!box || !document.querySelectorAll) return;
    var cards = [], groups = [], first = null;
    document.querySelectorAll('.tcard[data-cx]').forEach(function (c) { cards.push(c); });
    document.querySelectorAll('.cx-group').forEach(function (g) { groups.push(g); });
    function apply() {
      var q = String(box.value || '').toLowerCase().trim();
      var shown = 0;
      first = null;
      cards.forEach(function (c) {
        var hit = !q || String(c.getAttribute('data-cx') || '').indexOf(q) >= 0;
        c.hidden = !hit;
        if (hit) { shown++; if (!first) first = c; }
      });
      groups.forEach(function (g) {
        var any = false;
        g.querySelectorAll('.tcard[data-cx]').forEach(function (c) { if (!c.hidden) any = true; });
        g.hidden = !any;
      });
      if (status) {
        status.textContent = !q ? ''
          : shown === 0 ? 'No compound matches that yet.'
          : shown + (shown === 1 ? ' match' : ' matches') + ' — press Enter to open the first.';
      }
    }
    box.addEventListener('input', apply);
    box.addEventListener('keydown', function (e) {
      if (!e || e.key !== 'Enter' || !first) return;
      var a = first.querySelector ? first.querySelector('a') : null;
      var href = a && a.getAttribute ? a.getAttribute('href') : null;
      if (href) location.href = href;
    });
    apply();
  } catch (e) {}
});`.trim();

  return [api.render(ctx, {
    url: '/compounds/',
    title: 'Compound reference: half-life and dosing | TherapyLog',
    description: 'One page per compound, built from the data the TherapyLog app runs on: ' +
      'modelled half-life, storage rule, monitoring panel and interactions.',
    type: 'CollectionPage',
    trail: [
      { name: 'Home', url: '/', absolute: api.SITE + '/' },
      { name: 'Compounds', url: '/compounds/', absolute: api.SITE + '/compounds/' }
    ],
    body,
    script: ctx.W.prologue({ attribution: ctx.attribution }) + '\n\n' + filter
  })];
}

module.exports = { build, GROUPS };
