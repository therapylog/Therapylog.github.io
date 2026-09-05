/* The reconstitution calculator, generic and per compound.
 *
 * The widget is app.html's #tool-calc fragment running app.html's own
 * tlRecon functions, calcUnified and renderSyringe. The mg-to-units ladders on the
 * compound pages are computed here with the same three steps calcUnified takes
 * — concentration, volume, units — and validate-public-pages.js re-derives
 * every published row by running the app's real calcUnified() behind a DOM
 * stub, so a table cannot disagree with the widget above it. */

const shell = require('./shell.js');

/* concentration, then volume, then units: the arithmetic in calcUnified(). */
function unitsFor(vialMg, bacMl, doseMcg, syrMax) {
  /* U-100 is a concentration marking, not a capacity: 0.1 ml is 10 units on a
     0.3 ml, a 0.5 ml and a 1 ml syringe alike. Only the overflow test depends on
     which barrel you are holding. */
  const conc = (vialMg * 1000) / bacMl;            // mcg per ml
  const ml = doseMcg / conc;
  const units = ml * 100;
  return { conc, ml, units, overflow: units > syrMax };
}

const fmtUnits = (u) => (Math.round(u * 10) / 10).toFixed(1).replace(/\.0$/, '');
const fmtMl = (ml) => ml.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
const fmtDose = (mcg) => (mcg >= 1000 ? (mcg / 1000) + ' mg' : mcg + ' mcg');

/* Presets are assembled per compound and can collide (a 10 mg vial in 1 ml is
   both "this compound's reference" and "the generic 10mg/1ml button"). */
function dedupePresets(list) {
  const seen = new Set();
  return list.filter(([mg, ml]) => {
    const k = mg + '/' + ml;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ---- the compound pages ------------------------------------------------- */

/* Each entry: the DB id, the slug, the reference vial and diluent the ladder is
   computed for, the dose steps, and the authored copy that only applies to that
   compound. Nothing here is a dosing instruction — the steps are the ones the
   app's own dosing rows and the approved labelling describe, and the page says
   so. */
const COMPOUNDS = {
  sema: {
    slug: 'semaglutide',
    display: 'Semaglutide',
    vialMg: 5,
    bacMl: 2,
    steps: [250, 500, 1000, 1700, 2400],
    stepNote: 'the approved titration steps for the obesity indication (0.25, 0.5, 1.0, 1.7, 2.4 mg weekly)',
    intro: [
      `Semaglutide is the reconstitution question people get wrong most often, and the reason is
       the unit. Approved semaglutide is prescribed in <strong>milligrams per week</strong> —
       0.25 to 2.4 mg — while the syringe most people are holding is marked in
       <strong>insulin units</strong>, of which there are a hundred to the millilitre. A tenth
       of a millilitre is ten units, and at a typical reconstitution a tenth of a millilitre is
       a quarter of a milligram. Getting that mapping wrong by one decimal place is a tenfold
       dosing error, in either direction.`,
      `The other thing worth knowing before you mix: semaglutide's modelled half-life is about
       seven days, so a dose does not clear between weekly injections and levels build for
       roughly five weeks before they plateau. That is what the four-week titration steps in
       the approved labelling are pacing. A dose that felt fine in week one can feel very
       different in week five without anything having changed but accumulation.`
    ],
    why: [
      `Semaglutide arrives as a lyophilised powder in vials that are usually labelled 2, 5 or
       10 mg, and it is reconstituted rather than sold pre-mixed because the peptide is
       markedly more stable dry than in solution. Bacteriostatic water is the usual diluent
       specifically because its benzyl alcohol lets a mixed vial be entered repeatedly over
       weeks rather than once — which matters when a 5 mg vial holds twenty 0.25 mg doses.`,
      `Because it is dosed weekly, the arithmetic only has to be done once per vial: pick a
       diluent volume that puts your dose on a round number of units, write the concentration
       on the vial, and read the same number off the syringe every week until the titration
       step changes.`
    ]
  },
  tirz: {
    slug: 'tirzepatide',
    display: 'Tirzepatide',
    vialMg: 10,
    bacMl: 1,
    steps: [2500, 5000, 7500, 10000, 12500, 15000],
    stepNote: 'the approved titration steps (2.5, 5, 7.5, 10, 12.5, 15 mg weekly)',
    intro: [
      `Tirzepatide is dosed in whole milligrams — 2.5 up to 15 mg a week — which makes its
       reconstitution arithmetic different in character from semaglutide's. The doses are ten
       to sixty times larger, so a vial that would hold twenty semaglutide doses holds four
       tirzepatide ones, and the volume you draw is large enough that a 0.3 ml syringe runs out
       of barrel before the dose runs out of milligrams.`,
      `That is the practical trap, and it is a ceiling rather than an inconvenience. Take a
       10 mg vial reconstituted in 1 ml of bacteriostatic water — 10 mg per millilitre, the
       most concentrated a 10 mg vial usefully gets. A 2.5 mg dose is 25 units and a 10 mg dose
       fills the barrel exactly; 12.5 mg and 15 mg do not fit at all. Adding more water makes
       it worse, not better: the same vial in 2 ml puts a 15 mg dose at three millilitres,
       three full syringes. <strong>The milligrams in the vial set the largest dose you can
       draw in one go, and no amount of water changes that</strong> — only a larger or more
       concentrated vial does.`
    ],
    why: [
      `Tirzepatide is a dual GIP and GLP-1 receptor agonist, and like semaglutide it ships as a
       dry powder for stability. Its modelled half-life is about five days, so weekly dosing
       still accumulates — levels plateau after roughly three to four weeks rather than five.`,
      `The approved titration is deliberately slow for tolerability rather than for
       pharmacokinetics, which is why the steps are four weeks apart even though the drug
       reaches steady state sooner than that.`
    ]
  },
  retatrutide: {
    slug: 'retatrutide',
    display: 'Retatrutide',
    vialMg: 10,
    bacMl: 1,
    steps: [1000, 2000, 4000, 8000, 12000],
    stepNote: 'the range used in published phase II trials (1–12 mg weekly, titrated over months)',
    intro: [
      `Retatrutide is not an approved medicine. As of September 2026 it is in phase III trials,
       and the only dosing information that exists is the schedule those trials used — 1 to 12
       mg a week, titrated over months. There is no approved labelling to reconstitute
       against, and the numbers below are the trial range, not a recommendation.`,
      `That matters more here than on the pages for approved drugs. A vial bought outside a
       pharmacy has no verified strength, so the milligram figure the calculator starts from is
       whatever the label claims. The arithmetic will be exactly right about a number that may
       be wrong.`
    ],
    why: [
      `Retatrutide is a triple agonist at the GIP, GLP-1 and glucagon receptors, and its
       modelled half-life — around six days, and an estimate rather than a published human
       figure — puts it in the same weekly-dosing territory as semaglutide and tirzepatide.
       Levels accumulate for roughly a month before plateauing.`,
      `Because the compound is investigational, the wide dose range in the trials was itself
       the experiment: the highest arm was not an established dose, it was the arm being
       tested. Reading a 12 mg row below as a target rather than as the top of a research range
       would be a misreading of it.`
    ]
  },
  bpc: {
    slug: 'bpc-157',
    display: 'BPC-157',
    vialMg: 5,
    bacMl: 2,
    steps: [200, 250, 500],
    stepNote: 'the microgram-scale amounts described in the research literature and community practice (200–500 mcg daily)',
    intro: [
      `BPC-157 is dosed in <strong>micrograms</strong>, which flips the usual reconstitution
       problem. Where a GLP-1 dose can be too large to draw in one syringe, a BPC-157 dose is
       often too small to measure accurately: at a common reconstitution, 250 mcg is a tenth of
       a millilitre — ten units — and if you reconstitute the same vial in half the water it
       becomes five units, which is where syringe graduations start to lose you.`,
      `The rule the app applies, and the one worth applying by hand, is that a draw under two
       units is not reliably measurable on an insulin syringe. If your arithmetic lands there,
       the fix is more diluent, not a steadier hand.`
    ],
    blend: `BPC-157 is very often sold pre-mixed with TB-500 in one vial — usually five
      milligrams of each at the low end — under the community nickname the
      <strong>Wolverine blend</strong>. If that is what you are holding, this page's arithmetic
      is only half the story: a draw takes both compounds in the vial's ratio, and a 1:1 vial
      cannot deliver each at the amounts described for it on its own. The
      <a href="/tools/bpc-157-tb-500-blend-calculator/">BPC-157 and TB-500 blend calculator</a>
      works out what a single draw contains of each. BPC-157 also appears in the multi-peptide
      <a href="/tools/glow-peptide-blend-calculator/">GLOW</a> and
      <a href="/tools/klow-peptide-blend-calculator/">KLOW</a> vials.`,
    why: [
      `BPC-157 is a synthetic pentadecapeptide and a research compound with no approval for
       human use anywhere; the evidence for it is largely animal work, and the dosing amounts
       in circulation come from that literature and from community practice rather than from
       human trials. Its modelled half-life of about four hours is an estimate, which is why
       the daily and twice-daily schedules people use are frequent by peptide standards.`,
      `Reconstituted, it is a peptide in aqueous solution and behaves like one: refrigerated,
       dark, and used within a few weeks rather than months. Because the doses are so small
       relative to the vial, a 5 mg vial can outlast its own stability window — which is a
       reason to reconstitute less water into a smaller working volume, not more.`
    ]
  },
  tb5: {
    slug: 'tb-500',
    display: 'TB-500',
    vialMg: 5,
    bacMl: 2,
    steps: [2000, 2500],
    stepNote: 'the milligram-scale amounts described in the literature and community practice (2–2.5 mg per injection)',
    intro: [
      `TB-500 sits between the two extremes: dosed in milligrams like a GLP-1 but only two to
       two and a half at a time, and injected once or twice a week rather than daily. At a
       5 mg vial in 2 ml of bacteriostatic water, a 2.5 mg dose is one millilitre — a full
       U-100 syringe — and the vial holds exactly two of them.`,
      `That "exactly two" is the thing to plan around. A vial that yields a whole number of
       doses wastes nothing and needs no partial draws; one that yields 2.3 doses leaves a
       remainder you will either discard or stretch. The reverse solver on this page exists for
       that question: tell it the dose you want and the units you want to draw, and it works
       backwards to the diluent volume.`
    ],
    blend: `TB-500 is most often bought pre-mixed with BPC-157 rather than on its own — commonly
      five milligrams of each in one vial, and widely called the <strong>Wolverine blend</strong>.
      That changes the arithmetic on this page: both compounds share the water, so a draw large
      enough for a TB-500 dose carries roughly ten times a typical BPC-157 amount along with it.
      The <a href="/tools/bpc-157-tb-500-blend-calculator/">BPC-157 and TB-500 blend calculator</a>
      shows that split for your own vial. TB-500 is also in the
      <a href="/tools/glow-peptide-blend-calculator/">GLOW</a> and
      <a href="/tools/klow-peptide-blend-calculator/">KLOW</a> blends.`,
    why: [
      `TB-500 is a synthetic fragment of thymosin beta-4, a peptide present in most cells, and
       like BPC-157 it is a research compound with no human approval. Its modelled half-life of
       about two days is an estimate; that is the reason its schedules are weekly or twice
       weekly where BPC-157's are daily.`,
      `Because it is systemically acting rather than applied near a site, the whole dose has to
       be drawn and injected at once, which is why the barrel size matters here in a way it
       does not for a microgram-scale peptide.`
    ]
  }
};

/* ---- builders ----------------------------------------------------------- */

function build(ctx, api) {
  const { app, appCss, attribution, W, A } = ctx;
  const out = [];

  /* --- the generic page ------------------------------------------------- */
  {
    const slug = 'peptide-reconstitution-calculator';
    const widget = W.reconWidget(app.src, {
      ctaInner: ctaLink(slug, 'Save this dose to your log'),
      title: 'Reconstitution Calculator'
    });
    const body = [
      `    <h1>Peptide reconstitution calculator</h1>`,
      `    <p class="lede">How much bacteriostatic water to add, and how many units to draw for
      the dose you want. Works in both directions, needs no account, and runs the same code as
      the TherapyLog app.</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
      GENERIC_INTRO,
      widget.html,
      api.formula([
        'concentration (mcg/ml)  =  vial strength (mg) × 1000 ÷ diluent volume (ml)',
        'volume to draw (ml)     =  dose (mcg) ÷ concentration (mcg/ml)',
        'units on a U-100 syringe =  volume to draw (ml) × 100'
      ]),
      MATH_SECTION,
      api.table(['Draw', 'On a U-100 (1 ml)', 'On a U-50 (0.5 ml)', 'On a 0.3 ml (30 u)'], [
        ['0.05 ml', '5 units', '5 units', '5 units'],
        ['0.1 ml', '10 units', '10 units', '10 units'],
        ['0.25 ml', '25 units', '25 units', 'over the barrel'],
        ['0.5 ml', '50 units', '50 units (full)', 'over the barrel'],
        ['1 ml', '100 units (full)', 'over the barrel', 'over the barrel']
      ]),
      REVERSE_SECTION,
      `    <h2>Questions people actually ask</h2>`,
      api.faq(GENERIC_FAQ),
      compoundLinks(),
      ctaBox(slug, 'The app keeps the vial, the concentration and every dose you draw from it, so this arithmetic only has to be done once.')
    ].join('\n\n');

    out.push(api.render(ctx, {
      url: '/tools/' + slug + '/',
      title: 'Peptide reconstitution calculator | TherapyLog',
      description: 'Work out the bacteriostatic water to add and the units to draw — or ' +
        'start from the dose you want and solve backwards. Free, no account.',
      trail: api.toolsTrail([{ name: 'Reconstitution calculator', url: '/tools/' + slug + '/',
                              absolute: api.SITE + '/tools/' + slug + '/' }]),
      body,
      /* Pre-filled with the worked example from the copy above, so the result
         block is populated on arrival rather than after the visitor guesses
         what to type. */
      script: W.prologue({ attribution, gate: true }) + '\n\n' + widget.fns + '\n\n' +
              `document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('uc-vial').value = 5;
  document.getElementById('uc-water').value = 2;
  document.getElementById('uc-dose').value = 250;
  document.getElementById('uc-unit').value = 'mcg';
  calcUnified();
});`
    }));
  }

  /* --- one page per compound ------------------------------------------- */
  for (const [id, c] of Object.entries(COMPOUNDS)) {
    const entry = app.byId[id];
    if (!entry) throw new Error('reconstitution page for unknown compound id: ' + id);
    if (A.isTierC(id)) throw new Error('Tier C compound reached a public page: ' + id);
    const slug = c.slug + '-reconstitution-calculator';
    const url = '/tools/' + slug + '/';
    const pk = app.TL_PK[id] || {};

    const widget = W.reconWidget(app.src, {
      ctaInner: ctaLink(slug, 'Save this dose to your log'),
      title: c.display + ' Reconstitution',
      presets: dedupePresets([
        [c.vialMg, c.bacMl], [c.vialMg, 1], [c.vialMg, 2], [c.vialMg * 2, 2], [2, 1], [5, 2], [10, 1]
      ]).slice(0, 6)
    });

    const ladder = c.steps.map((mcg) => {
      const r = unitsFor(c.vialMg, c.bacMl, mcg, 100);
      return [fmtDose(mcg), fmtMl(r.ml) + ' ml',
        r.overflow ? `${fmtUnits(r.units)} units <em>(more than one syringe)</em>` : fmtUnits(r.units) + ' units'];
    });

    const conc = (c.vialMg * 1000) / c.bacMl;
    const dosesRows = api.publishableDoses(entry);

    const body = [
      `    <h1>${api.esc(c.display)} reconstitution calculator</h1>`,
      `    <p class="lede">How many units of a reconstituted ${api.esc(c.display.toLowerCase())}
      vial make up the dose you want — and how much bacteriostatic water to add to land on a
      round number. Same code as the TherapyLog app, no account needed.</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
      c.intro.map((p) => `    <p>${p.replace(/\s+/g, ' ').trim()}</p>`).join('\n'),
      widget.html,
      `    <h2>${api.esc(c.display)} milligrams to insulin units</h2>`,
      `    <p>Computed for a <strong>${c.vialMg} mg vial reconstituted in ${c.bacMl} ml</strong>
      of bacteriostatic water, which gives
      <strong>${(conc / 1000).toFixed(2).replace(/\.00$/, '')} mg per ml</strong>
      (${conc.toLocaleString('en-US')} mcg/ml), read off a U-100 syringe. The steps are
      ${api.esc(c.stepNote)} — they are what the numbers are indexed to, not advice about which
      one applies to anyone. Change the vial or the water above and every figure moves; the
      calculator is the authority, this table is the common case.</p>`,
      api.table([api.esc(c.display) + ' dose', 'Volume to draw', 'On a U-100 syringe'], ladder),
      `    <h2>Why ${api.esc(c.display.toLowerCase())} is reconstituted the way it is</h2>`,
      c.why.map((p) => `    <p>${p.replace(/\s+/g, ' ').trim()}</p>`).join('\n'),
      `    <h2>What the app knows about ${api.esc(c.display)}</h2>`,
      `    <p>Generated from the same entry the app's encyclopedia reads, so this page and the
      app cannot disagree about it.</p>`,
      api.factBox([
        ['Also known as', api.esc(entry.aka || '—')],
        ['Class', api.esc(entry.clsName)],
        ...api.pkRows(app, id),
        api.regStatus(entry) ? ['Regulatory status', api.esc(api.regStatus(entry))] : null,
        api.monPanel(entry) ? ['Monitoring panel', api.esc(api.monPanel(entry))] : null,
        ...api.storageRows(app, id)
      ]),
      dosesRows.length ? [
        `    <h3>Dosing rows from that entry</h3>`,
        `    <p>${pk.est ? api.EV.offlabel : (/APPROVED/i.test(api.regStatus(entry) || '') ? api.EV.established : api.EV.offlabel)}
        These are the schedules the entry records, reproduced so you can see what the
        milligram figures above are indexed to. Which one applies to a particular person is a
        prescribing decision, and this page does not make it.</p>`,
        api.table(['Label', 'Amount', 'Route and frequency'],
          dosesRows.map((r) => [api.esc(r.l), api.esc(r.d), api.esc(r.f || '—')]))
      ].join('\n\n') : '',
      `    <h2>How the math works</h2>`,
      api.formula([
        `concentration  =  ${c.vialMg} mg × 1000 ÷ ${c.bacMl} ml  =  ${conc.toLocaleString('en-US')} mcg/ml`,
        `volume to draw =  dose (mcg) ÷ ${conc.toLocaleString('en-US')} mcg/ml`,
        `units (U-100)  =  volume to draw (ml) × 100`
      ]),
      SHARED_RULES,
      `    <h2>Questions people ask about ${api.esc(c.display.toLowerCase())} reconstitution</h2>`,
      api.faq(compoundFaq(api, c, entry, pk, conc)),
      c.blend ? `    <h2>Sold as part of a blend?</h2>\n    <p>${c.blend.replace(/\s+/g, ' ').trim()}</p>` : '',
      `    <p>Related: <a href="/tools/half-life/${c.slug}/">${api.esc(c.display)} half-life and steady state</a>,
      the <a href="/tools/peptide-reconstitution-calculator/">generic reconstitution calculator</a>,
      and the <a href="/tools/insulin-syringe-units-calculator/">insulin syringe unit converter</a>.</p>`,
      ctaBox(slug, `The app stores this vial's strength, its concentration and the date you mixed it, and counts the doses down as you log them.`)
    ].filter(Boolean).join('\n\n');

    out.push(api.render(ctx, {
      url,
      title: `${c.display} reconstitution calculator | TherapyLog`,
      description: `How many units is a ${c.display} dose? Mix a vial, read the draw in units ` +
        `and ml, or solve backwards for the water to add. Free, no account.`,
      trail: api.toolsTrail([
        { name: c.display + ' reconstitution', url, absolute: api.SITE + url }
      ]),
      body,
      script: W.prologue({ attribution, gate: true }) + '\n\n' + widget.fns + '\n\n' +
        `document.addEventListener('DOMContentLoaded', function () {\n` +
        `  document.getElementById('uc-vial').value = ${c.vialMg};\n` +
        `  document.getElementById('uc-water').value = ${c.bacMl};\n` +
        `  document.getElementById('uc-dose').value = ${c.steps[0] >= 1000 ? c.steps[0] / 1000 : c.steps[0]};\n` +
        `  document.getElementById('uc-unit').value = '${c.steps[0] >= 1000 ? 'mg' : 'mcg'}';\n` +
        `  calcUnified();\n});`
    }));
  }

  return out;
}

/* ---- shared copy -------------------------------------------------------- */

const GENERIC_INTRO = `    <p>A reconstitution calculator answers one question in three steps. Adding water to a
    vial of dry peptide gives you a <strong>concentration</strong>; a dose divided by that
    concentration gives you a <strong>volume</strong>; and a volume multiplied by a hundred
    gives you <strong>insulin units</strong>, because a U-100 syringe has a hundred marks to
    the millilitre. Everything else is arithmetic around those three lines.</p>

    <p>Worked through with real numbers: a <strong>5 mg vial</strong> with <strong>2 ml</strong>
    of bacteriostatic water is 5,000 mcg spread through 2 ml, so <strong>2,500 mcg per
    ml</strong>. A <strong>250 mcg</strong> dose is 250 ÷ 2,500 = <strong>0.1 ml</strong>, and
    0.1 ml on a U-100 syringe is <strong>10 units</strong>. The same vial in 1 ml of water
    would be 5,000 mcg/ml, and that same 250 mcg dose would be 5 units instead — half the
    liquid, the same drug, a different number on the barrel.</p>

    <p>That last point is the one worth internalising: <strong>the water changes the number you
    draw, not the dose you get.</strong> More diluent means a larger, easier-to-measure draw
    for the same amount of peptide. Less means a smaller draw, and eventually one too small to
    measure honestly.</p>`;

const MATH_SECTION = `    <h2>How the math works</h2>

    <p>Concentration first, because nothing else can be worked out without it. Vial strength is
    on the label in milligrams; multiply by a thousand to get micrograms, then divide by the
    millilitres of diluent you added. That is micrograms per millilitre, and it is the number
    worth writing on the vial in marker once you have it — it does not change until the vial is
    empty.</p>

    <p>Then the draw. Divide the dose you want by the concentration and you have a volume in
    millilitres. Multiply that by a hundred and you have units on a U-100 syringe, which is
    what almost every insulin syringe sold is. <strong>U-100 means a hundred units per
    millilitre</strong> — the "100" is a concentration marking, not a capacity, which is why a
    0.5 ml syringe is still U-100 and still reads to 50.</p>

    <p>Two rules the calculator applies that are worth knowing on their own. A practical draw
    <strong>lands on a half-unit and is at least two units</strong>: below that, the
    graduations on an insulin syringe are finer than anyone can read against a meniscus, and a
    "1 unit" dose is a guess with a number attached. And a draw larger than the barrel is
    flagged rather than silently split — if your dose needs 130 units, the answer is a
    different reconstitution, not two injections.</p>`;

const REVERSE_SECTION = `    <h2>Working backwards from the dose you want</h2>

    <p>Most calculators only go forwards: you tell them what you mixed, they tell you what to
    draw. The question people actually have is the other one — <em>I want this dose to be a
    round number of units, so how much water do I add?</em></p>

    <p>Rearranged, that is the same three lines read from the bottom up. If you want a dose of
    D micrograms to come out at U units, then the volume per dose is U ÷ 100 millilitres, so
    the concentration has to be D ÷ (U ÷ 100), and the diluent volume is the vial's total
    micrograms divided by that concentration. The "work it out" panel in the calculator above
    does exactly that, and shows every practical fill volume with the concentration and the
    number of doses per vial for each, so you can pick the one that leaves the least
    remainder.</p>

    <p>It also refuses to answer in two situations, both deliberate: more than about 5 ml of
    diluent, because most vials do not have the headspace for it, and less than 0.3 ml, because
    there is not enough liquid to mix and draw from reliably.</p>`;

const SHARED_RULES = `    <p>The rules built into the calculator: a practical draw lands on a half-unit and is at
    least two units; U-100 means a hundred units per millilitre, so 0.1 ml is 10 units on any
    U-100 syringe regardless of its barrel size; and a draw that exceeds the barrel is flagged
    rather than silently split across injections.</p>`;

const GENERIC_FAQ = [
  ['How many units is 250 mcg?', [
    `There is no answer without the concentration — that is the whole point of the calculation.
     250 mcg from a 5 mg vial mixed with 2 ml of bacteriostatic water is 10 units; the same
     250 mcg from the same vial mixed with 1 ml is 5 units. Whenever you see "X mcg is Y units"
     stated flatly, a reconstitution has been assumed and not mentioned.`
  ]],
  ['Does adding more water make the dose weaker?', [
    `No. It makes the <em>solution</em> more dilute, so you draw a larger volume to get the
     same amount of peptide. The dose is however many micrograms end up in you, and that is set
     by what you draw, not by how much water is in the vial. More water generally makes dosing
     more accurate, because a bigger draw is easier to measure.`
  ]],
  ['Bacteriostatic water or sterile water?', [
    `Bacteriostatic water contains about 0.9% benzyl alcohol, which is what allows a vial to be
     entered more than once. Plain sterile water has no preservative, so a vial mixed with it
     is a single-use preparation. If a vial holds several doses over several weeks — which is
     the normal case for a reconstituted peptide — that difference decides whether the vial is
     usable on day ten.`
  ]],
  ['What if my dose needs more units than the syringe holds?', [
    `Reconstitute with less water. A dose needing 130 units on a U-100 syringe becomes 65 units
     if you halve the diluent volume, which fits. Splitting one dose across two injections
     works arithmetically but doubles the injections and the entry points, and it is usually a
     sign the reconstitution was chosen for the wrong dose.`
  ]],
  ['Can I trust the milligram number on the vial?', [
    `The calculator cannot check it, and neither can you without an assay. Everything on this
     page is arithmetic downstream of the strength you type in; if that figure is wrong the
     result will be confidently wrong by the same proportion. For a compounded or
     research-labelled vial, that uncertainty is the largest error term in the whole
     calculation, and it is worth naming rather than rounding away.`
  ]]
];

function compoundFaq(api, c, entry, pk, conc) {
  const q = [];
  q.push([`How many units is ${api.esc(String(c.steps[0] >= 1000 ? c.steps[0] / 1000 + ' mg' : c.steps[0] + ' mcg'))} of ${c.display.toLowerCase()}?`, [
    `At ${c.vialMg} mg in ${c.bacMl} ml — ${conc.toLocaleString('en-US')} mcg/ml — it is
     ${fmtUnits(unitsFor(c.vialMg, c.bacMl, c.steps[0], 100).units)} units on a U-100 syringe.
     At any other reconstitution it is a different number, which is why the table above states
     the vial and the diluent volume it was computed for.`
  ]]);
  q.push([`What size vial should I reconstitute?`, [
    (() => {
      const vialMcg = c.vialMg * 1000;
      const big = c.steps[c.steps.length - 1];
      const small = c.steps[0];
      /* "holds about 0 doses" is what a floor() gives when the largest step is
         bigger than the vial, which is real information stated uselessly. */
      const count = (n) => (n < 1 ? null : n < 2 ? n.toFixed(1) : String(Math.floor(n)));
      const bigN = count(vialMcg / big);
      const smallN = count(vialMcg / small);
      const bigPart = bigN === null
        ? `<strong>cannot supply the largest step above at all</strong> — ${fmtDose(big)} is more
           than the whole vial holds, so that dose needs a bigger or a more concentrated vial,
           not more water`
        : `holds about ${bigN} of the largest step above`;
      return `Whichever one you have — the calculator takes the strength as an input. What the
       vial size decides is how many doses it holds, and therefore whether it will still be
       good when you reach the last one: a ${c.vialMg} mg vial ${bigPart}, and about
       ${smallN === null ? 'none' : smallN} of the smallest. A vial holding more doses than its
       post-mixing window allows is a vial you will be throwing part of away, which is an
       argument for mixing a smaller working volume rather than a bigger one.`;
    })()
  ]]);
  if (pk.hl != null) {
    q.push([`Does ${c.display.toLowerCase()} accumulate between doses?`, [
      `Its modelled half-life is ${api.curve.fmtHours(pk.hl)}${pk.est ? ', and that figure is an estimate from limited human data rather than a published value' : ''}.
       A rough guide is that levels keep building for about five half-lives before they
       plateau, so the effect of a dose you take today is partly the effect of the doses before
       it. The <a href="/tools/half-life/${c.slug}/">${api.esc(c.display)} half-life page</a>
       shows the curve and the steady-state arithmetic.`
    ]]);
  }
  q.push([`How long does it keep once mixed?`, [
    `The entry's handling rule is in the fact box above, along with the caveat that comes with
     it: your supplier's own insert or certificate of analysis overrides anything generic. As a
     rule the constraint is the diluent rather than the peptide — bacteriostatic water's
     preservative is what makes repeated entry reasonable, and it is the reason a mixed vial is
     a weeks-not-months proposition.`
  ]]);
  return q;
}

function compoundLinks() {
  const links = Object.values(COMPOUNDS)
    .map((c) => `<a href="/tools/${c.slug}-reconstitution-calculator/">${c.display}</a>`)
    .join(', ');
  return `    <h2>Pre-filled for a specific compound</h2>

    <p>Same calculator, started at that compound's typical vial sizes, with a milligram-to-units
    table and the half-life and storage rule the app records: ${links}.</p>`;
}

/* CTA and the app-only button replacement, both from shell.js's markup. */
function ctaLink(slug, label) {
  return `<a class="btn btn-p" href="/app?utm_source=tools&amp;utm_medium=web&amp;utm_campaign=${slug}" style="text-decoration:none;display:block;text-align:center;line-height:1.4">${label}</a>`;
}
function ctaBox(slug, lead) {
  return shell.ctaBox(slug, lead, 'Save this dose to your log');
}

module.exports = { build, COMPOUNDS, unitsFor, fmtUnits, fmtMl, fmtDose };
