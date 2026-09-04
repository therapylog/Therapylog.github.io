/* /tools/ — the hub. Regenerated so the card list cannot drift from the pages
   that actually exist: it is built from the other modules' output, not typed. */

const shell = require('./shell.js');

/* Order is editorial, not alphabetical: highest-intent first. Anything not
   listed here still gets a card, so a new page cannot go unlinked. */
const ORDER = [
  '/tools/peptide-reconstitution-calculator/',
  '/tools/insulin-syringe-units-calculator/',
  '/tools/trt-dose-calculator/',
  '/tools/free-testosterone-calculator/',
  '/tools/half-life-calculator/',
  '/tools/syringe-builder/',
  '/tools/stack-checker/'
];

const BLURB = {
  '/tools/peptide-reconstitution-calculator/':
    'Vial strength, bacteriostatic water and target dose in; the draw in units and ml out, with a syringe diagram. Also runs backwards — tell it the dose and the units you want to draw, and it solves for the water to add.',
  '/tools/insulin-syringe-units-calculator/':
    'Units to ml and back on U-100 syringes, with the half-unit rule, the barrel sizes and a table of the conversions people look up over and over.',
  '/tools/trt-dose-calculator/':
    'A weekly testosterone dose split by injection frequency, in mg, ml and syringe units, with the modelled peak-to-trough swing for cypionate, enanthate and propionate at that cadence.',
  '/tools/free-testosterone-calculator/':
    'Calculated free and bioavailable testosterone from total T, SHBG and albumin by the Vermeulen equation, in whatever units your lab printed — and why the answer depends on the SHBG assay.',
  '/tools/half-life-calculator/':
    'Single-dose and repeated-dose curves from published half-lives, plus time to steady state, accumulation ratio and peak-to-trough ratio for the interval you pick.',
  '/tools/syringe-builder/':
    'Plan a multi-compound draw and see the fill level, with the compatibility rules the app enforces: oil and water do not share a syringe, suspensions draw alone, fragile proteins are not blended.',
  '/tools/stack-checker/':
    'Every interaction pair the app knows about, by severity, with what to watch. Not exhaustive and not a safety clearance.'
};

function build(ctx, api) {
  /* Built after the others so it can list them. build-pages.js calls the
     modules in order and this one is first, so it asks the others directly. */
  const others = [
    require('./pages-recon.js'),
    require('./pages-blend.js'),
    require('./pages-calc.js'),
    require('./pages-halflife.js'),
    require('./pages-stack.js')
  ].flatMap((m) => m.build(ctx, api));

  const byUrl = new Map(others.map((p) => [p.url, p]));
  const titleOf = (p) => (p.html.match(/<h1>([\s\S]*?)<\/h1>/) || [, p.url])[1]
    .replace(/<[^>]+>/g, '').trim();

  const primary = ORDER.filter((u) => byUrl.has(u));
  const missing = ORDER.filter((u) => !byUrl.has(u));
  if (missing.length) throw new Error('the tools hub lists pages that were not built: ' + missing.join(', '));

  const compoundRecon = others.filter((p) => /-reconstitution-calculator\/$/.test(p.url) &&
    p.url !== '/tools/peptide-reconstitution-calculator/');
  const halfLife = others.filter((p) => /^\/tools\/half-life\/[^/]+\/$/.test(p.url));
  const blends = others.filter((p) => /-blend-calculator\/$/.test(p.url));

  const cards = primary.map((u) => `      <div class="tcard">
        <h3><a href="${u}">${api.esc(titleOf(byUrl.get(u)))}</a></h3>
        <p>${api.esc(BLURB[u])}</p>
      </div>`).join('\n');

  const linkList = (list) => list
    .map((p) => `<a href="${p.url}">${api.esc(titleOf(p)
      .replace(/:[\s\S]*$/, '')
      .replace(/ (reconstitution calculator|half-life[\s\S]*)$/i, ''))}</a>`)
    .join(', ');

  const body = [
    `    <h1>Free calculators for injectable protocols</h1>`,
    `    <p class="lede">Reconstitution, syringe units, half-lives and steady state — the
    arithmetic people do on the back of an envelope at the kitchen table, done properly. Free,
    no account, no email.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <h2>Why these exist</h2>`,
    `    <p>Every one of these calculators already runs inside the TherapyLog app, where it is
    part of the free tier. Putting them on their own pages is not a marketing exercise: the
    questions they answer — <em>how much water goes in this vial</em>, <em>how many units is
    2.5&nbsp;mg</em>, <em>how long until this has cleared</em> — get asked by people holding a
    vial right now, and the answers they find are usually a forum reply with no working
    shown.</p>`,
    `    <p>So each page shows its working: the formula written out, and one worked example run
    through it with real numbers. And each calculator runs <strong>the same code the app
    runs</strong> rather than a re-implementation of it — the function source is copied out of
    the app when this page is built, and a check in continuous integration compares the two so
    they cannot drift apart. The comment above that function in the app says why it matters: a
    wrong number here ends up in a syringe.</p>`,
    `    <h2>The calculators</h2>`,
    `    <div class="cards">\n${cards}\n    </div>`,
    `    <h2>Per-compound pages</h2>`,
    `    <p><strong>Reconstitution, pre-filled:</strong> the same calculator started at that
    compound's typical vial sizes, with a milligram-to-units table, the modelled half-life and
    the storage rule — ${linkList(compoundRecon)}.</p>`,
    `    <p><strong>Half-life and steady state:</strong> one page per compound with published
    pharmacokinetic data, each with the curve pre-drawn, the numbers, where they come from, and
    the monitoring panel the app records — ${linkList(halfLife)}.</p>`,
    `    <h2>Pre-mixed blends</h2>`,
    `    <p>A blend vial dissolves several peptides in the same water, so a draw takes all of
    them in whatever ratio the vial was compounded at — you cannot dose one without dosing the
    others. These pages work out what a single draw actually delivers of each, and compare it
    against what the literature and community practice describe for each compound
    <em>on its own</em>. The gap is usually larger than people expect:
    ${linkList(blends)}.</p>`,
    `    <h2>What a calculator can and cannot tell you</h2>`,
    `    <p>Serum-level curves are modelled from published half-lives and time-to-peak values,
    not measured in you. Where the published data is thin, the page says the half-life is an
    estimate rather than presenting it as fact. And none of these pages decides a dose: they
    make the arithmetic reliable, which is a different job.</p>`,
    `    <h2>Reading your bloodwork instead</h2>`,
    `    <p>If what you actually want is help reading a lab report — what the number means,
    which assay produced it, and why two labs can disagree about the same blood — that is what
    the <a href="/markers/">lab-marker pages</a> are for.</p>`,
    shell.ctaBox('tools-hub',
      'The app is where these calculators live alongside the log they feed: doses, vials, bloodwork and the curve for everything you have entered.',
      'Open the app')
  ].join('\n\n');

  return [api.render(ctx, {
    url: '/tools/',
    title: 'Free calculators for injectable protocols | TherapyLog',
    description: 'Reconstitution, syringe units, half-life and steady-state calculators that ' +
      'run the same code as the TherapyLog app. Free, no account, no email.',
    type: 'CollectionPage',
    trail: api.toolsTrail(),
    body,
    script: ctx.W.prologue({ attribution: ctx.attribution })
  })];
}

module.exports = { build, ORDER, BLURB };
