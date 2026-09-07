/* /markers/trt-bloodwork-checklist/ — the hub SEO-PLAN §3 specifies: which
 * markers, which assay, when to draw, how often, linking every marker page.
 *
 * Almost all of it is generated. The three tables that make the page worth
 * existing — the markers whose assay must be specified, the results that are
 * uninterpretable without context recorded beside them, and the values the app
 * refuses to convert — are read straight out of MARKER_REGISTRY. They are the
 * registry's own rules, published. The draw-timing table comes from the app's
 * protocol templates. Nothing here is a list somebody typed and will forget to
 * update.
 */

const shell = require('./shell.js');
const A = require('../lib/app-source.js');
const L = require('./markers-lib.js');

const GROUP_LABEL = {
  hormones: 'Hormones', growth: 'Growth axis', metabolic: 'Metabolic',
  lipids: 'Lipids', inflammation: 'Inflammation', thyroid: 'Thyroid',
  cbc: 'Complete blood count', renal: 'Kidney', chemistry: 'Chemistry',
  hepatic: 'Liver', vitamins: 'Vitamins and minerals', prostate: 'Prostate'
};

/* Why each assay-critical marker is assay-critical. Authored, because the
   registry's own note is written at the app rather than at a reader — but keyed
   to the registry so a marker that gains or loses an assay field changes the
   table without this file being touched. */
const ASSAY_WHY = {
  tott: 'Immunoassay and LC/MS-MS diverge materially at low concentrations. A trend that switches method is partly measuring the switch.',
  freet: 'Direct immunoassay, calculated and equilibrium dialysis are three different procedures. The calculated value also inherits whatever the SHBG assay did.',
  e2: 'A standard immunoassay is not valid at the concentrations men run — it reads high, and unpredictably. Sensitive or LC/MS-MS is the one to ask for.',
  ldl: 'Most LDL is calculated, not measured. Friedewald is unreliable at high triglycerides; Martin-Hopkins and direct assays behave differently there.',
  bioavailt: 'Usually calculated from total testosterone, SHBG and albumin, so it carries the error in all three.',
  ldlp: 'NMR and ion mobility particle counts are not interchangeable. Changing platform changes the number without anything changing in you.'
};

const CONTEXT_WHY = {
  collectionTime: 'Follows a diurnal rhythm steep enough that the clock time of the draw changes what the number means.',
  age: 'The reference interval is age-banded. A raw value with no age attached cannot be interpreted.',
  fastingStatus: 'A non-fasted draw measures the meal. Without the fasting state recorded, the result is not comparable to anything.'
};

function build(ctx, api) {
  const { app, reg, attribution, W } = ctx;
  const M = reg.MARKER_REGISTRY;
  const esc = api.esc;

  /* Which marker pages exist, so the index links what is live and names the rest. */
  const markers = require('./pages-markers.js').MARKERS;
  const pageForKey = {};
  for (const [k, mk] of Object.entries(markers)) {
    mk.keys.forEach((key) => { pageForKey[key] = { slug: mk.slug, primary: key === mk.keys[0] }; });
  }
  const linkMarker = (key) => {
    const p = pageForKey[key];
    const label = esc(M[key].label);
    return p ? `<a href="/markers/${p.slug}/">${label}</a>` : label;
  };

  /* ---- table 1: specify the assay ------------------------------------- */
  const assayKeys = Object.keys(M).filter((k) => M[k].assay);
  const assayRows = assayKeys.map((k) => {
    const labels = L.assayLabels(app.src, k) || {};
    const variants = M[k].assay.variants.map((v) => esc(labels[v] || v)).join(' · ');
    return [linkMarker(k), variants, esc(ASSAY_WHY[k] || M[k].assay.note || '')];
  });

  /* ---- table 2: record the context ------------------------------------ */
  const ctxKeys = Object.keys(M).filter((k) => M[k].contextRequired);
  const ctxRows = ctxKeys.map((k) => {
    const c = Array.isArray(M[k].contextRequired) ? M[k].contextRequired[0] : M[k].contextRequired;
    const pretty = { collectionTime: 'Time of the draw', age: 'Your age', fastingStatus: 'Fasted or not' }[c] || c;
    return [linkMarker(k), esc(pretty), esc(CONTEXT_WHY[c] || '')];
  });

  /* ---- table 3: never converted --------------------------------------- */
  const noConvKeys = Object.keys(M).filter((k) => M[k].noConvert);
  /* The differential markers all refuse the same thing for the same reason, so
     they collapse into one row rather than five identical ones. */
  const diff = noConvKeys.filter((k) => /^(neut|lymph|mono|eos|baso)$/.test(k));
  const diffAbs = noConvKeys.filter((k) => /abs$/.test(k));
  const singles = noConvKeys.filter((k) => !diff.includes(k) && !diffAbs.includes(k));
  const noConvRows = singles.map((k) => [
    linkMarker(k),
    M[k].noConvert.map(esc).join(', '),
    esc(M[k].unitNote || 'No valid conversion exists.')
  ]);
  if (diff.length) {
    noConvRows.push([
      diff.map((k) => esc(M[k].label)).join(', '),
      esc(M[diff[0]].noConvert.join(', ')),
      'A percentage of white cells and an absolute count per litre are different quantities. Converting one to the other needs the total white count, so the app refuses rather than guessing it.'
    ]);
  }
  if (diffAbs.length) {
    noConvRows.push([
      diffAbs.map((k) => esc(M[k].label)).join(', '),
      esc(M[diffAbs[0]].noConvert.join(', ')),
      'The same refusal in the other direction: an absolute count is not a percentage.'
    ]);
  }

  /* ---- table 4: when to draw ------------------------------------------ */
  const templates = eval('(' + A.literal(app.src, 'const TEMPLATES = [', '[', ']') + ')');
  const drawRows = templates
    .filter((t) => t.bloodwork && !(t.compounds || []).some((c) => {
      const id = app.resolveDrugName(c.name);
      return id && A.isTierC(id);
    }))
    .map((t) => [esc(t.name), esc(t.bloodwork)]);

  /* ---- the full index -------------------------------------------------- */
  const byGroup = {};
  Object.keys(M).forEach((k) => { (byGroup[M[k].group] = byGroup[M[k].group] || []).push(k); });
  const indexBlocks = Object.keys(byGroup).sort((a, b) =>
    (GROUP_LABEL[a] || a).localeCompare(GROUP_LABEL[b] || b)).map((g) => {
    const items = byGroup[g].sort((a, b) => M[a].label.localeCompare(M[b].label))
      .map((k) => linkMarker(k)).join(' · ');
    return `      <li><strong>${esc(GROUP_LABEL[g] || g)}</strong> <span class="src">${items}</span></li>`;
  }).join('\n');

  const body = [
    `    <h1>The bloodwork checklist: which markers, which assay, when to draw</h1>`,
    `    <p class="lede">Ordering the right markers is the easy half. The half that decides whether
    a panel is worth drawing is what you specify when you order it — the assay, the timing, and
    the context that has to be written down beside the number.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,

    `    <h2>Why a checklist rather than a panel</h2>`,
    `    <p>Most bloodwork advice for this audience is a list of marker names. A list of names is
    not enough, and the reason is that several of the most-ordered markers here can be measured in
    more than one way, and the ways disagree. Order "estradiol" without saying which assay and a
    laboratory will run the cheap one, which is not valid at the concentrations men run. Order
    "free testosterone" without saying which and you may get a direct immunoassay, which is the
    least reliable of the three procedures that share the name. Neither result is wrong, exactly —
    they are answers to a question you did not mean to ask.</p>`,
    `    <p>The same goes for context. A cortisol without a draw time, an IGF-1 without an age, a
    glucose without knowing whether the person had eaten: each is a number that cannot be
    interpreted, and none of them looks broken on the report. The app stores those alongside the
    value for that reason, and the tables below are its own rules, published rather than
    described.</p>`,

    `    <h2>Markers where you have to specify the assay</h2>`,
    `    <p>These are the ones where the method changes the answer enough to change what you would
    do about it. Ask for the method by name when you order, and record which you got — a trend
    that silently switches method is measuring the switch as much as measuring you.</p>`,
    api.table(['Marker', 'Methods the app tracks', 'Why it matters'], assayRows),

    `    <h2>Results that need context recorded beside them</h2>`,
    `    <p>Each of these is uninterpretable without the second piece of information in the middle
    column, and each of them is routinely reported without it.</p>`,
    api.table(['Marker', 'Record this too', 'Why'], ctxRows),

    `    <h2>Values that must never be converted</h2>`,
    `    <p>Most units convert with a factor. A few do not, and the app refuses those rather than
    approximating them — which is worth knowing, because conversion tables for exactly these
    exist online and are confidently wrong.</p>`,
    api.table(['Marker', 'Unit refused', 'Why there is no valid conversion'], noConvRows),
    `    <p>${api.EV.established} The Lp(a) case is the one people meet most often. Mass in mg/dL and
    particle count in nmol/L are not two scales for the same quantity, because the apo(a) protein
    varies in size between individuals — so a factor that is right for one person is wrong for
    another. A value converted with a rule of thumb is not a measurement of anything.${
      pageForKey.lpa ? ` The <a href="/markers/${pageForKey.lpa.slug}/">Lp(a) page</a> covers what to do instead.` : ''
    }</p>`,

    `    <h2>When to draw, and how often</h2>`,
    `    <p>Taken from the monitoring notes on the app's own protocol templates. They are a
    starting point for a conversation with whoever manages your therapy, not a schedule to adopt
    from a web page — the right interval depends on what you are taking, how long you have been
    taking it and what your last panel showed.</p>`,
    api.table(['Protocol shape', 'What the template records'], drawRows),
    `    <p>${api.EV.offlabel} Two timing rules are worth stating separately because they invalidate
    a result rather than merely weakening it. Draw hormones in the morning, consistently, and
    consistently relative to your injection schedule — a trough and a peak are both "your level"
    and they are not comparable to each other. And when you are looking for recovery of your own
    production after stopping, wait out the ester first, or you are measuring the drug rather
    than yourself.${pageForKey.lh ? ` The <a href="/markers/${pageForKey.lh.slug}/">LH and FSH page</a> covers that in detail.` : ''}</p>`,

    `    <h2>Every marker the app tracks</h2>`,
    `    <p>All ${Object.keys(M).length} of them, by panel group. Linked where a reference page
    exists; the rest are logged, unit-converted and flagged in the app just the same.</p>`,
    `    <ul class="mon-list">\n${indexBlocks}\n    </ul>`,

    L.LAB_RANGE_WINS,

    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['What is the minimum useful panel on testosterone therapy?',
        [`The app's own TRT template records total testosterone, free testosterone, estradiol on a
          sensitive assay, SHBG, hematocrit and PSA, drawn at baseline and rechecked at six to
          eight weeks. That is a reasonable starting shape rather than a recommendation — what
          belongs on your panel depends on your history and what you are taking, and the person to
          settle it with is whoever prescribes for you.`]],
      ['My lab will not run the assay I asked for. Now what?',
        [`Use what you can get, keep using the same one so the trend is internally consistent, and
          record which assay produced each value. A standard-immunoassay estradiol read as though
          it were a sensitive result is the error worth avoiding; the same number read as what it
          is remains useful.`]],
      ['How often is too often?',
        [`Testing more frequently than the thing you are watching can change is how people end up
          reacting to noise. Hormones after a protocol change need weeks to settle; a marker like
          Lp(a) is largely genetic and stable, so a single measurement generally settles it for
          good. The intervals in the table above reflect that difference.`]],
      ['Should I fast for all of it?',
        [`Only glucose and insulin genuinely require it, and the app marks fasting status as
          context those two cannot be read without. Fasting for a full panel does no harm and
          makes results comparable, which is why most people default to it — but a non-fasted
          estradiol is not a spoiled result.`]]
    ]),

    shell.ctaBox('trt-bloodwork-checklist',
      'The app records each of these with the unit, the reference interval your report printed and the assay method beside it — which is what makes a trend mean anything a year later.',
      'Log your bloodwork')
  ].join('\n\n');

  return [api.render(ctx, {
    url: '/markers/trt-bloodwork-checklist/',
    title: 'Bloodwork checklist: markers, assays and timing | TherapyLog',
    description: 'Which markers to order, which assay to specify, what to record beside ' +
      'each result, and how often to draw. From the app’s own registry.',
    type: 'Article',
    trail: [
      { name: 'Home', url: '/', absolute: api.SITE + '/' },
      { name: 'Lab markers', url: '/markers/', absolute: api.SITE + '/markers/' },
      { name: 'Bloodwork checklist', url: '/markers/trt-bloodwork-checklist/',
        absolute: api.SITE + '/markers/trt-bloodwork-checklist/' }
    ],
    body,
    script: W.prologue({ attribution })
  })];
}

module.exports = { build, ASSAY_WHY, CONTEXT_WHY };
