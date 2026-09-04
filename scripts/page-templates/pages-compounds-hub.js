/* /compounds/ — the hub, generated from the compound pages that exist, split by
   the tier the page shipped under. The tier split is the interesting thing on
   this page: it is the site stating its own publishing rule, including the part
   where it declines to publish, which is worth more to a reader than a
   directory would be. */

const shell = require('./shell.js');
const A = require('../lib/app-source.js');

function build(ctx, api) {
  const mod = require('./pages-compounds.js');
  const built = mod.build(ctx, api);
  const pageFor = new Map(built.map((p) => [p.url, p]));

  const groups = { A: [], B: [] };
  for (const [id, def] of Object.entries(mod.COMPOUNDS)) {
    const page = pageFor.get('/compounds/' + def.slug + '/');
    if (!page) continue;
    groups[A.tierOf(id)].push({ id, def, entry: ctx.app.byId[id] });
  }
  for (const k of ['A', 'B']) groups[k].sort((a, b) => a.entry.name.localeCompare(b.entry.name));

  const cards = (rows) => `    <div class="cards">\n` + rows.map(({ def, entry }) =>
    `      <div class="tcard">
        <h3><a href="/compounds/${def.slug}/">${api.esc(entry.name)}</a></h3>
        <p>${api.esc(entry.clsName)}${entry.aka ? ' &middot; ' + api.esc(entry.aka) : ''}</p>
      </div>`).join('\n') + `\n    </div>`;

  const counts = A.assertTiers(ctx.app.byId);
  const publishable = counts.A + counts.B;
  const shipped = groups.A.length + groups.B.length;

  const body = [
    `    <h1>Compound reference: what each one is, how it is dosed, and what to monitor</h1>`,
    `    <p class="lede">One page per compound, built from the same reference data the TherapyLog
    app runs on &mdash; the modelled half-life, the storage rule, the monitoring panel, the
    documented interactions &mdash; with the pharmacology written out rather than summarised into
    a benefits list.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,

    `    <h2>What these pages are, and what they are not</h2>`,
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

    `    <h2>Which compounds get a page</h2>`,
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

    shipped ? [
      groups.A.length ? [`    <h2>Approved and available</h2>`, cards(groups.A)].join('\n\n') : '',
      groups.B.length ? [
        `    <h2>Research and unapproved</h2>`,
        `    <p>Each of these opens with its regulatory status. None of them has been reviewed by a
        regulator for identity, purity, potency or safety in people.</p>`,
        cards(groups.B)
      ].join('\n\n') : ''
    ].filter(Boolean).join('\n\n') : '',

    `    <h2>The rest of the reference</h2>`,
    `    <p>${shipped} of the ${publishable} publishable compounds have a page so far; the others
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

  return [api.render(ctx, {
    url: '/compounds/',
    title: 'Compound reference: half-life, dosing and monitoring | TherapyLog',
    description: 'One page per compound, built from the reference data the TherapyLog app runs ' +
      'on: modelled half-life, storage rule, monitoring panel and documented interactions.',
    type: 'CollectionPage',
    trail: [
      { name: 'Home', url: '/', absolute: api.SITE + '/' },
      { name: 'Compounds', url: '/compounds/', absolute: api.SITE + '/compounds/' }
    ],
    body,
    script: ctx.W.prologue({ attribution: ctx.attribution })
  })];
}

module.exports = { build };
