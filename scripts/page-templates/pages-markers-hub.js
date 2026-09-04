/* /markers/ — the hub. Generated from the marker pages that actually exist, so
   it cannot promise a page that has not shipped. The Phase 0 version of this
   file was hand-written and said "nothing is linked below until the page is
   live"; that sentence stopped being true the moment the first page landed,
   which is the argument for generating it. */

const shell = require('./shell.js');

/* The fifteen in SEO-PLAN §6.1. Everything not yet built is listed as a plain
   line with no link, so the page states the plan honestly without implying a
   date. Order is the plan's table order. */
const PLANNED = [
  ['e2', 'Estradiol, sensitive versus standard assay'],
  ['tott', 'Total testosterone, immunoassay versus LC/MS-MS'],
  ['freet', 'Free versus total testosterone'],
  ['shbg', 'SHBG'],
  ['hct', 'Hematocrit on testosterone therapy'],
  ['prolactin', 'Prolactin'],
  ['lh', 'LH and FSH'],
  ['igf1', 'IGF-1'],
  ['hba1c', 'HbA1c and fasting glucose'],
  ['apob', 'ApoB versus LDL cholesterol'],
  ['lpa', 'Lipoprotein(a)'],
  ['ferritin', 'Ferritin and the iron panel'],
  ['vitd', 'Vitamin D'],
  ['tsh', 'The thyroid panel'],
  ['dht', 'DHT']
];

function build(ctx, api) {
  const markers = require('./pages-markers.js');
  const built = markers.build(ctx, api);
  const byKey = new Map(Object.entries(markers.MARKERS).map(([k, m]) => [k, m]));
  const pageFor = new Map(built.map((p) => [p.url, p]));

  const live = [];
  const upcoming = [];
  for (const [key, label] of PLANNED) {
    const mk = byKey.get(key);
    const page = mk && pageFor.get('/markers/' + mk.slug + '/');
    if (page) live.push({ mk, page, label });
    else upcoming.push(label);
  }

  const cards = live.map(({ mk }) => `      <div class="tcard">
        <h3><a href="/markers/${mk.slug}/">${api.esc(mk.h1.split(':')[0])}</a></h3>
        <p>${api.esc(mk.description)}</p>
      </div>`).join('\n');

  const body = [
    `    <h1>Lab markers, read with the assay in mind</h1>`,
    `    <p class="lede">What a marker measures, what moves it, and why the method printed on your
    report changes the answer. Reference pages for the bloodwork people on hormone therapy and
    peptide protocols actually run.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,

    `    <h2>The gap these pages fill</h2>`,
    `    <p>Search for a lab marker and you will find a range, a bolded "optimal" number and no
    mention of how the value was produced. That omission is the single most common way people
    misread their own bloodwork.</p>`,
    `    <p>Sensitive (LC/MS-MS) estradiol and standard immunoassay estradiol are not the same
    measurement. Direct-immunoassay free testosterone, calculated free testosterone and
    equilibrium dialysis are three different answers to the same question. A ferritin drawn after
    a blood donation is telling you about the donation. TherapyLog stores the assay method as part
    of the result rather than throwing it away, and these pages are written the same way: whenever
    the method changes the interpretation, the page names it.</p>`,

    `    <h2>Three rules every page here follows</h2>`,
    `    <ul>
      <li><strong>Your lab's printed range wins.</strong> The reference interval on your own report
      belongs to the assay and the instrument that produced your number. Where a page shows a
      generic range, it is labelled generic — a fallback, not a correction of your report.</li>
      <li><strong>Optimal bands are non-diagnostic.</strong> Where a page shows an optimal band
      drawn from clinical literature and community practice, it is there for reading a trend over
      time. It does not diagnose anything, and being outside one is not a finding.</li>
      <li><strong>Interpretation ends with your clinician.</strong> These pages describe what the
      literature and community practice report, and show the basis for every number. They do not
      tell a reader with a particular result to take a particular drug at a particular dose.</li>
    </ul>`,

    `    <h2>Published</h2>`,
    `    <p>Each carries the accepted units and their conversions, the assay variants the app
    tracks, the generic range, the non-diagnostic optimal band where one exists, the sex and age
    bands generated from the app's own range function, a unit converter running the app's own
    conversion code, and cited sources.</p>`,
    `    <div class="cards">\n${cards}\n    </div>`,

    upcoming.length ? [
      `    <h2>Being written</h2>`,
      `    <p>The remaining markers from the same list, in order. Nothing here is linked until the
      page is live and has been read end to end.</p>`,
      `    <ul>\n${upcoming.map((u) => `      <li>${api.esc(u)}</li>`).join('\n')}\n    </ul>`,
      `    <p>A bloodwork checklist page will pull them together: which markers, which assay to ask
      for, when to draw and how often.</p>`
    ].join('\n\n') : '',

    `    <h2>Where to log the results</h2>`,
    `    <p>The TherapyLog app reads a lab report against your own printed reference interval first
    and a generic one only when your report did not carry one, keeps the assay method with the
    value, and charts the trend. It runs in the browser and needs no account —
    <a href="/app">open it here</a>. The <a href="/guide">user guide</a> covers the bloodwork tab
    in detail, and the <a href="/tools/">calculators</a> cover the dosing arithmetic.</p>`,

    shell.ctaBox('markers-hub',
      'Logging a marker with its unit, its printed reference interval and its assay method beside it is what makes a trend mean anything.',
      'Log your bloodwork')
  ].filter(Boolean).join('\n\n');

  return [api.render(ctx, {
    url: '/markers/',
    title: 'Lab markers, read with the assay in mind | TherapyLog',
    description: 'Reference pages for the lab markers people on hormone therapy and peptide ' +
      'protocols track, written with the assay method named wherever it changes the answer.',
    type: 'CollectionPage',
    trail: [
      { name: 'Home', url: '/', absolute: api.SITE + '/' },
      { name: 'Lab markers', url: '/markers/', absolute: api.SITE + '/markers/' }
    ],
    body,
    script: ctx.W.prologue({ attribution: ctx.attribution })
  })];
}

module.exports = { build, PLANNED };
