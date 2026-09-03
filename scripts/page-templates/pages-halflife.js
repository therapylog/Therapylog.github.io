/* /tools/half-life/<compound>/ — one page per compound with published PK.
 *
 * The curves are pre-rendered as inline SVG at build time by curve.js, using
 * app.html's own pkCurve(). That is deliberate: the shape of the curve is the
 * substance of these pages, and a crawler that does not run the chart script
 * should still see it. The interactive version lives on
 * /tools/half-life-calculator/.
 *
 * Every fact in the boxes comes from app.html — the PK table, the compound
 * entry's monitoring panel and regulatory status, the storage rule via
 * tlStorageFor's resolution order, and the interaction pairs that name the
 * compound. The prose is authored per compound; SEO-PLAN §5.4 sets a 200-word
 * minimum outside the shared blocks and a sibling-similarity ceiling, both
 * enforced by validate-public-pages.js. */

const shell = require('./shell.js');
const curve = require('./curve.js');

/* Which compound, under what slug, charted at what cadence, with what to say.
   `cadence` is [hours, label] and is taken from the entry's own dosing rows —
   named on the page so the chart is never a claim about what anyone should do. */
const PAGES = {
  sema: {
    slug: 'semaglutide',
    cadence: [168, 'once weekly'],
    cadenceWhy: 'the approved schedule for both the diabetes and the obesity indications',
    prose: [
      `Semaglutide's roughly one-week half-life is the whole reason it is a once-weekly
       injection, and it is unusual for a peptide. Native GLP-1 is cleared in minutes;
       semaglutide survives days because it is engineered to — a fatty-acid side chain binds it
       to albumin, and a substitution at position 8 blocks the DPP-4 enzyme that dismantles the
       natural hormone. The molecule is essentially a GLP-1 with a half-life problem solved.`,
      `What that means in practice is that semaglutide accumulates for about five weeks. Dosing
       weekly against a seven-day half-life leaves half of each dose still present when the
       next arrives, so the level roughly doubles before it plateaus. Two consequences follow.
       A dose that was comfortable in week one can be considerably less so in week four with
       nothing having changed but arithmetic — which is what the four-week titration steps in
       the approved labelling are pacing. And going the other way, stopping does not clear it
       quickly: appetite effects fade over weeks, not days, and the "rebound" people describe
       after discontinuation is partly that long tail ending.`,
      `The flip side of a long half-life is a flat curve. Dosed weekly the modelled
       peak-to-trough swing is small, which is why semaglutide does not produce a
       day-of-injection effect the way a short-acting compound does. A missed dose is also
       forgiving for the same reason: at this half-life, a dose taken a day or two late barely
       registers on the curve.`
    ]
  },
  tirz: {
    slug: 'tirzepatide',
    cadence: [168, 'once weekly'],
    cadenceWhy: 'the approved schedule for both of its indications',
    prose: [
      `Tirzepatide's modelled half-life of about five days is shorter than semaglutide's week,
       and that difference is worth more attention than it usually gets. Weekly dosing against
       a five-day half-life accumulates less — the plateau arrives sooner, around three to four
       weeks — and the level swings slightly more between injections. Neither difference is
       dramatic, but it means the two drugs are not interchangeable on a curve even though both
       are once-weekly.`,
      `Tirzepatide is a single peptide acting at two receptors, GIP and GLP-1, and its
       persistence comes from the same engineering strategy as semaglutide's: a fatty-acid chain
       that keeps it bound to albumin and out of the kidney's reach. Because one molecule does
       both jobs, there is one curve rather than two — the GIP and GLP-1 effects rise and fall
       together, which is not obvious from a mechanism description that lists them separately.`,
      `The practical consequence of a five-day half-life is at the top of the dose range rather
       than the bottom. At 15 mg a week the volume drawn is large, and the plateau is reached
       within a month of each titration step — so tolerability at a new step is knowable within
       weeks rather than being a slow surprise. The approved four-week interval between steps
       is therefore comfortably longer than the pharmacokinetics require, which tells you the
       titration is pacing side effects, not accumulation.`
    ]
  },
  retatrutide: {
    slug: 'retatrutide',
    cadence: [168, 'once weekly'],
    cadenceWhy: 'the schedule used in the published phase II trials',
    prose: [
      `Retatrutide's half-life figure carries a caveat the others on this site do not: it is
       <strong>an estimate</strong>. The app flags it as such, and the flag is not decoration.
       As of September 2026 retatrutide is an investigational compound in phase III trials; the
       public pharmacokinetic record is thin, and a figure of about six days is inferred from
       trial dosing intervals and the compound's design rather than read off a published
       human PK study. Every number on this page inherits that uncertainty.`,
      `What is reasonably solid is the shape. Retatrutide is a triple agonist — GIP, GLP-1 and
       glucagon — built with the same albumin-binding strategy as semaglutide and tirzepatide,
       and it was dosed weekly in trials, which only works for a molecule with a multi-day
       half-life. On that basis it accumulates for roughly a month before plateauing, like its
       predecessors, and produces a similarly flat week-to-week curve.`,
      `The glucagon arm is what makes the long half-life worth thinking about rather than just
       noting. Glucagon receptor agonism raises energy expenditure and also acts on the liver,
       and unlike an appetite effect it is not something a person can feel titrating. A
       compound that takes a month to reach steady state is a compound whose full effect on
       liver enzymes and glucose is a month away from the dose change that caused it — which is
       why the trial monitoring schedules in the app's entry for it are as frequent as they
       are.`
    ]
  },
  tc: {
    slug: 'testosterone-cypionate',
    cadence: [84, 'twice weekly'],
    cadenceWhy: "one of the schedules in the app's own dosing rows, and the most common in practice",
    prose: [
      `Testosterone cypionate's half-life is a property of the <strong>ester</strong>, not of
       testosterone. Testosterone itself has a half-life measured in tens of minutes. Attaching
       an eight-carbon cypionate chain makes the molecule oil-soluble, so an intramuscular or
       subcutaneous depot releases it slowly, and the enzymes that cleave the ester become the
       rate-limiting step. The roughly six-day figure is how fast that depot empties, which is
       why the model's time-to-peak is two full days rather than the minutes you would see from
       an unesterified injection.`,
      `That release-limited behaviour is what makes the cadence question real. At twice weekly
       the modelled peak-to-trough swing is close to flat; at once weekly it roughly doubles,
       while the accumulation falls. Neither is wrong — they are different curves for the same
       weekly milligrams, and which one suits a person is a clinical judgement rather than an
       arithmetic one.`,
      `Two things follow for bloodwork, and they cause more confused panels than anything else
       in TRT. First, a level takes about a month to settle after any change, so labs drawn a
       fortnight into a new dose are measuring a number still climbing. Second, <em>when</em>
       you draw matters: a peak-time draw and a trough draw on the same protocol differ by the
       ratio on this page, so a result without a stated draw time relative to the last
       injection is hard to compare against anything. The convention that makes results
       comparable is a trough draw, immediately before the next injection.`
    ]
  },
  te: {
    slug: 'testosterone-enanthate',
    cadence: [84, 'twice weekly'],
    cadenceWhy: "one of the schedules in the app's own dosing rows",
    prose: [
      `Enanthate is cypionate's near-twin, and the honest version of this page says so rather
       than manufacturing a distinction. The ester is a seven-carbon chain instead of eight,
       which makes the modelled half-life about a day and a half shorter and moves the
       time-to-peak forward by half a day. The app's own entry for it states the practical
       upshot directly: clinically interchangeable with cypionate in all protocols.`,
      `Where the difference does show up is at the sparse end of the cadence range. On a
       once-weekly schedule the shorter half-life means slightly less accumulation and a
       slightly bigger swing than cypionate on the same schedule — a difference of a few per
       cent, visible on a chart and generally not in a person. At twice weekly or more often it
       vanishes into the noise of injection site, absorption and assay variability.`,
      `The reason both esters exist at all is historical and regional rather than
       pharmacological: enanthate is the more commonly prescribed preparation across Europe,
       cypionate across North America. What can differ in practice is the carrier oil and how a
       given preparation feels going in, which is a formulation property of a particular
       product rather than of the ester. If you are switching between them, the thing worth
       knowing is that you are not changing the shape of your curve in any way you will
       measure.`
    ]
  },
  bpc: {
    slug: 'bpc-157',
    cadence: [24, 'once daily'],
    cadenceWhy: "the daily schedule in the app's own dosing rows",
    prose: [
      `BPC-157's four-hour half-life is <strong>an estimate</strong>, and on this compound that
       matters more than on most. There is no published human pharmacokinetic study to read it
       off; the figure is inferred from animal work and from the peptide's size and structure.
       Any statement about how long BPC-157 stays in circulation — including this one — is
       reasoning from limited data, not reporting a measurement.`,
      `Taking four hours at face value, the arithmetic is stark: a once-daily dose is gone
       between doses. Six half-lives fit inside twenty-four hours, so there is no accumulation
       and no steady state to speak of — each dose is essentially independent of the last. That
       is the opposite of the GLP-1 picture, and it is why the schedules people use are daily or
       twice daily rather than weekly.`,
      `Which raises the question the curve cannot answer. If the compound is cleared within
       hours, why would a daily injection do anything lasting? The mechanisms proposed for
       BPC-157 in the literature — angiogenesis, growth-factor receptor upregulation, effects on
       tendon and gut healing — are all <em>downstream</em> processes that take days to weeks,
       so a brief pulse of peptide initiating a slow biological response is at least coherent.
       But that is a mechanistic argument, and the evidence for it is overwhelmingly animal
       work. The honest framing is that the pharmacokinetics here are estimated, the
       pharmacodynamics are inferred, and BPC-157 has no approval for human use anywhere.`
    ]
  },
  tb5: {
    slug: 'tb-500',
    cadence: [84, 'twice weekly'],
    cadenceWhy: "the loading schedule in the app's own dosing rows; maintenance there is once weekly",
    prose: [
      `TB-500's estimated two-day half-life puts it in a different class from BPC-157 despite
       the two being discussed almost interchangeably. Where BPC-157 is cleared between daily
       doses, TB-500 at a twice-weekly cadence does accumulate — the interval is under two
       half-lives, so each dose lands on a meaningful remainder of the last. That is exactly
       why the schedules for the two differ, and it is the most useful thing to know if you have
       seen them paired.`,
      `As with BPC-157, the half-life is <strong>an estimate</strong>. TB-500 is a synthetic
       fragment of thymosin beta-4, a peptide present in most cells, and the published human
       pharmacokinetic record is thin. The two-day figure is inferred rather than measured, and
       the accumulation and steady-state numbers below are as uncertain as the input they are
       computed from.`,
      `The loading-then-maintenance pattern in the app's dosing rows is a direct consequence of
       the accumulation. Twice weekly for several weeks builds a level; once weekly holds it
       roughly where it got to, because a weekly interval against a two-day half-life is nearly
       three half-lives and lets most of each dose clear. Whether that pattern achieves anything
       is a separate question — TB-500 is a research compound with no human approval, its
       evidence base is animal and in-vitro work, and the systemic rather than local action
       means the whole dose has to be given at once.`
    ]
  },
  cjc: {
    slug: 'cjc-1295',
    cadence: [24, 'once daily'],
    cadenceWhy: "the once-daily pre-bed schedule in the app's own dosing rows",
    prose: [
      `The thirty-minute half-life on this page is the single most misread number in peptide
       pharmacokinetics, because two very different compounds are sold under the name
       CJC-1295. What this page describes is <strong>CJC-1295 without DAC</strong> — also
       called modified GRF (1-29) — which is cleared in under an hour. <strong>CJC-1295 with
       DAC</strong> carries a linker that binds it to albumin and has a half-life of about a
       week: two hundred times longer. Buying one when you meant the other is not a minor
       substitution.`,
      `A half-hour half-life is not a defect here; it is the design. CJC-1295 without DAC is a
       GHRH analogue, and growth hormone is released in <em>pulses</em>. A brief spike of GHRH
       produces a pulse and then gets out of the way, letting the pituitary's own feedback
       reassert itself. A version that lingered for a week would flatten the pulse into a
       plateau — which is what the DAC version does, and is precisely the criticism made of it.
       The pulsatile pattern is thought to matter, so the short half-life is doing work.`,
      `Practically: there is no accumulation and no steady state. Each dose is independent,
       which is why the schedule is timed rather than merely counted — fasted, before bed, to
       land the pulse alongside the body's own nocturnal one, and away from food because
       circulating insulin blunts growth hormone release. The pairing with ipamorelin is
       mechanistic rather than pharmacokinetic: the two act on different receptors and the
       combination produces a larger pulse than either alone. Both are research compounds with
       no approval for human use.`
    ]
  },
  ipa: {
    slug: 'ipamorelin',
    cadence: [24, 'once daily'],
    cadenceWhy: "the once-daily pre-bed schedule in the app's own dosing rows",
    prose: [
      `Ipamorelin's two-hour half-life is long enough to be measured and far too short to
       accumulate on any daily schedule — twelve half-lives fit inside a day. Like CJC-1295
       without DAC, it is dosed for a pulse rather than for a level, and for the same reason:
       growth hormone secretion is pulsatile, and a secretagogue that persisted would blunt the
       pattern it is trying to amplify.`,
      `What distinguishes ipamorelin from the other growth hormone secretagogues is
       selectivity rather than duration. GHRP-2 and hexarelin act at the same ghrelin receptor
       but also drive cortisol and prolactin; ipamorelin is described in the literature as
       doing very little of that, which is the entire basis for preferring it. That is a
       receptor-selectivity claim, not a pharmacokinetic one — the curve on this page would look
       much the same for a less selective peptide.`,
      `Because it works through a different receptor from a GHRH analogue, the two are
       complementary rather than redundant, which is what the CJC-1295 pairing in the app's
       dosing rows is about. Two short-acting compounds given together produce one larger pulse
       and then both clear, so the timing constraints are the same for both: fasted, and away
       from carbohydrate, because insulin suppresses growth hormone release. Ipamorelin is a
       research compound with no approval for human use; the monitoring the app records for it —
       IGF-1 and fasting glucose — reflects that a sustained rise in growth hormone signalling
       has metabolic consequences worth watching.`
    ]
  },
  tesam: {
    slug: 'tesamorelin',
    cadence: [24, 'once daily'],
    cadenceWhy: 'the daily subcutaneous schedule of its approved use',
    prose: [
      `Tesamorelin's half-life of roughly forty minutes makes it the shortest-lived compound on
       this site, and it is also — unusually for this category — <strong>an FDA-approved
       medicine</strong>, licensed for HIV-associated lipodystrophy. That combination is worth
       pausing on: the published pharmacokinetics here are regulatory-grade rather than
       inferred, which is not true of most peptides people compare it against.`,
      `Being a stabilised GHRH analogue, it shares CJC-1295 without DAC's logic — a short pulse
       of GHRH signalling, then clearance, leaving the pituitary's feedback intact. No
       accumulation, no steady state, and a schedule driven by timing rather than by
       maintaining a level. The trans-3-hexenoyl group at its N-terminus is what protects it
       from the enzyme that degrades native GHRH within minutes; it buys tens of minutes, not
       days, and that was the design target.`,
      `The clinically interesting consequence of a short-acting GHRH analogue is that its
       downstream marker moves on a completely different timescale from the drug. IGF-1 rises
       over weeks and reflects accumulated growth hormone exposure, not this morning's
       injection — which is why the monitoring interval in the app's entry is quarterly and why
       a single IGF-1 says little about whether a dose was taken. ${''}Approved use aside,
       tesamorelin is also used off-label for body composition, and the app's entry records both;
       the visceral-fat findings that support its licensed indication came from trials in a
       specific population, and generalising them is exactly the step the labelling does not
       take.`
    ]
  },
  hcg2: {
    slug: 'hcg',
    cadence: [56, 'three times weekly'],
    cadenceWhy: "the schedule in the app's own dosing rows for fertility support on TRT",
    prose: [
      `HCG's roughly thirty-three-hour half-life is long for a glycoprotein hormone, and the
       reason is its sugars. Human chorionic gonadotropin is heavily glycosylated, and those
       carbohydrate chains — particularly the sialic acid on them — slow its clearance from the
       kidney dramatically. Luteinising hormone, which HCG mimics at the same receptor, is
       cleared in about twenty minutes. Same receptor, a half-life two orders of magnitude
       apart, entirely because of the glycosylation.`,
      `That difference is the whole clinical point, and it is also the main caution. Endogenous
       LH arrives in pulses every couple of hours; HCG at a three-times-weekly cadence
       accumulates and produces continuous stimulation of the testicular Leydig cells instead.
       Continuous is what makes it useful for maintaining testicular volume and function during
       testosterone therapy — and continuous stimulation of a receptor is also the mechanism by
       which receptors downregulate, which is why the doses in the app's entry are in the
       hundreds of international units rather than the thousands.`,
      `Two things to watch follow directly from the curve. HCG-driven testicular testosterone
       production <em>aromatises</em>, so oestradiol can rise on a dose that leaves total
       testosterone barely changed — the app's monitoring note for it names E2 first for exactly
       this reason. And LH and FSH will read suppressed on any panel drawn while HCG is in use,
       which is expected rather than a finding: the pituitary is responding to the testosterone
       downstream, and the assay may cross-react with HCG itself.`
    ]
  },
  enclo: {
    slug: 'enclomiphene',
    cadence: [24, 'once daily'],
    cadenceWhy: "the daily oral schedule in the app's own dosing rows",
    prose: [
      `Enclomiphene's ten-hour half-life is the number that explains why it exists as a separate
       product at all. Clomiphene citrate is a mixture of two isomers: enclomiphene, which
       blocks oestrogen receptors at the hypothalamus and drives LH and FSH, and zuclomiphene,
       which is a weak oestrogen agonist with a half-life measured in <em>weeks</em>.
       Zuclomiphene accumulates for months on daily clomiphene, and it is the isomer generally
       blamed for the mood and visual complaints people report. Purifying the trans-isomer
       removes the long-lived half of the drug.`,
      `A ten-hour half-life on a daily schedule means modest accumulation — the interval is a
       little over two half-lives, so each dose lands on a small remainder. The level is
       therefore reasonably stable day to day and clears within a few days of stopping, which
       is a very different proposition from a compound whose active metabolite is still present
       a month later.`,
      `The downstream timescale is the one that matters for interpreting results, and it is much
       slower than the drug. Enclomiphene works by removing negative feedback, so the sequence
       is: LH and FSH rise within days, testicular testosterone production follows over weeks,
       and spermatogenesis — if that is the goal — responds over roughly three months, because
       that is how long the cycle takes. Bloodwork at six to eight weeks, which is what the
       app's entry specifies, is timed to that biology rather than to the pharmacokinetics.
       Enclomiphene is not FDA-approved; in the US it is supplied through compounding
       pharmacies.`
    ]
  },
  ai1: {
    slug: 'anastrozole',
    cadence: [72, 'every three days'],
    cadenceWhy: "the every-third-day schedule in the app's own dosing rows",
    prose: [
      `Anastrozole's roughly two-day half-life is the reason it is dosed every third day for
       oestrogen management rather than daily as it is in oncology. At that interval each dose
       lands on a substantial remainder of the last, so the level accumulates and the
       aromatase inhibition is continuous rather than intermittent — which is the intent, since
       partial suppression of a continuously running enzyme is the goal.`,
      `The pharmacokinetic subtlety is that the drug's half-life and its <em>effect's</em>
       half-life are not the same. Anastrozole is a competitive, reversible inhibitor of
       aromatase, so inhibition tracks the drug level fairly closely — but the oestradiol
       measured in blood is the integral of production and clearance over hours to days, and it
       lags. A dose change shows up in an E2 result over the following week, not the following
       morning.`,
      `That lag is why the most consequential risk on this compound is over-correction, and why
       the app's entry carries a warning about it. ${''}Oestradiol is not a waste product in men:
       it is required for bone density, joint comfort, libido and cardiovascular protection,
       and crashing it produces a recognisable and unpleasant syndrome. Because anastrozole
       accumulates over several doses, a dose that seemed too weak in week one can be too strong
       by week three — the level is still rising while the judgement is being made. The
       monitoring the app specifies, a sensitive-assay E2 alongside total and free testosterone
       every six to eight weeks when adjusting, is timed to that. Anastrozole is approved for
       breast cancer; use for oestrogen management on testosterone therapy is off-label, and it
       is a prescription decision.`
    ]
  },
  serm2: {
    slug: 'sermorelin',
    cadence: [24, 'once daily'],
    cadenceWhy: "the once-daily pre-bed schedule in the app's own dosing rows",
    prose: [
      `Sermorelin's twelve-minute half-life is the shortest on this site by an order of
       magnitude, and it is not an approximation of a longer-acting drug — it is native
       biology. Sermorelin is simply the first twenty-nine amino acids of human GHRH, the
       fragment that carries all the receptor activity, with nothing added to protect it. The
       enzyme DPP-4 begins dismantling it almost immediately, exactly as it does the body's
       own GHRH.`,
      `Every other GHRH analogue on this site is an attempt to lengthen that number.
       Tesamorelin adds a group at the N-terminus and buys tens of minutes; CJC-1295 without
       DAC substitutes four amino acids and reaches half an hour; CJC-1295 with DAC binds
       albumin and reaches a week. Sermorelin is the unmodified baseline they are all measured
       against, which makes it the most physiological of them and the most demanding to use —
       a compound with a twelve-minute half-life is entirely dependent on timing.`,
      `There is no accumulation to discuss and no steady state: a dose is a single pulse, gone
       within the hour. What makes that a feature rather than a limitation is the pituitary's
       feedback loop, which stays intact — GHRH signalling this brief cannot override
       somatostatin, so the growth hormone response remains self-limiting in a way exogenous
       growth hormone is not. That is the argument for a secretagogue over the hormone itself,
       and the short half-life is the mechanism behind it. Sermorelin's monitoring in the app is
       IGF-1 quarterly plus fasting glucose, which reflects that the marker worth watching moves
       over weeks even though the drug is measured in minutes.`
    ]
  },
  mk677: {
    slug: 'mk-677',
    cadence: [24, 'once daily'],
    cadenceWhy: "the once-daily bedtime schedule in the app's own dosing rows",
    prose: [
      `MK-677 is the odd one out in this set, and its twenty-four-hour half-life is why. Every
       other growth hormone secretagogue here is an injected peptide cleared in minutes to
       hours, dosed for a pulse. MK-677 is an <strong>orally active non-peptide</strong> with a
       day-long half-life, so a daily dose produces continuous elevation of growth hormone
       signalling rather than a pulse. That is a genuinely different pharmacology wearing the
       same category label.`,
      `The arithmetic: a twenty-four-hour interval against a twenty-four-hour half-life means
       each dose lands on half the last, so the level roughly doubles and plateaus after about
       five days. Unlike the peptides, MK-677 therefore has a real steady state, and the
       curve below shows it building. That is also the source of most of what people report
       from it — the appetite effect, the water retention, the sleep changes — because a
       continuously elevated signal produces continuous effects, not a nightly pulse.`,
      `Continuous is the thing to weigh rather than a detail. Sustained growth hormone and
       IGF-1 signalling has metabolic consequences: fasting glucose and HbA1c commonly drift
       upward, and insulin sensitivity can fall. That is why the monitoring panel the app
       records for MK-677 is the longest of any compound on this page — IGF-1, fasting glucose,
       HbA1c, prolactin, cortisol and a lipid panel, with a baseline before starting. It is not
       an approved medicine, it never completed development for any indication, and it is
       banned in competitive sport. The pharmacokinetics are the clearest thing about it; the
       risk-benefit is not.`
    ]
  }
};

function build(ctx, api) {
  const { app, attribution, W, A } = ctx;
  const pkCurve = new Function(A.fnSource(app.src, 'pkCurve') + '; return pkCurve;')();
  const out = [];

  for (const [id, def] of Object.entries(PAGES)) {
    const entry = app.byId[id];
    if (!entry) throw new Error('half-life page for unknown compound id: ' + id);
    if (A.isTierC(id)) throw new Error('Tier C compound reached a public page: ' + id);
    const pk = app.TL_PK[id];
    if (!pk || pk.hl == null) throw new Error('half-life page for a compound with no PK: ' + id);

    const url = `/tools/half-life/${def.slug}/`;
    const f = pkCurve(pk.hl, pk.tmax);
    const single = curve.singleDose(f, pk.hl, pk.tmax, entry.name);
    const [interval, cadenceLabel] = def.cadence;
    const ssChart = curve.steadyStateChart(f, pk.hl, pk.tmax, interval, entry.name, cadenceLabel);
    const ss = ssChart.ss;
    const remaining = Math.pow(2, -interval / pk.hl) * 100;
    const ttssDays = (5 * pk.hl) / 24;

    const pairs = api.pairsNaming(app, id, A.isTierC);
    const reconSlug = ['sema', 'tirz', 'retatrutide', 'bpc', 'tb5'].includes(id)
      ? def.slug + '-reconstitution-calculator' : null;

    const body = [
      `    <h1>${api.esc(entry.name)} half-life and steady state</h1>`,
      `    <p class="lede">${curve.fmtHours(pk.hl)}${pk.est ? ' (estimated)' : ''} modelled
      half-life, peaking ${curve.fmtHours(pk.tmax)} after a dose. What that means for how long
      it lasts, how much it builds up, and when bloodwork is worth drawing.</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,

      api.factBox([
        ['Also known as', api.esc(entry.aka || '—')],
        ['Class', api.esc(entry.clsName)],
        ...api.pkRows(app, id),
        ['Cleared per dosing interval',
          `${(100 - remaining).toFixed(0)}% gone, ${remaining.toFixed(0)}% still present after ${curve.fmtHours(interval)}`],
        ['Time to steady state', `~${curve.fmtHours(5 * pk.hl)} (about five half-lives)`],
        ['Accumulation at that cadence',
          ss.accumulation >= 1.05
            ? `${ss.accumulation}× a single dose`
            : `${ss.accumulation}× — effectively none; each dose clears before the next`],
        ['Peak-to-trough at steady state', ss.cleared
          ? 'Not meaningful &mdash; the level returns to zero between doses, so there is no trough to divide into a peak'
          : `${ss.ratio}×`],
        api.regStatus(entry) ? ['Regulatory status', api.esc(api.regStatus(entry))] : null,
        api.monPanel(entry) ? ['Monitoring panel', api.esc(api.monPanel(entry))] : null,
        ...api.storageRows(app, id)
      ]),

      def.prose.map((p) => `    <p>${p.replace(/\s+/g, ' ').trim()}</p>`).join('\n\n'),

      `    <h2>One dose</h2>`,
      `    <figure class="curve">
${single.svg}
      <figcaption>Modelled level after a single dose, as a percentage of that dose's own peak.
      Rising to the peak at ${curve.fmtHours(pk.tmax)}, then falling by half every
      ${curve.fmtHours(pk.hl)}. Computed with the app's own <code>pkCurve</code> function — a
      one-compartment absorption-and-elimination model with the absorption rate fitted so the
      peak lands at the published time to peak.</figcaption>
      </figure>`,

      `    <h2>Dosed ${api.esc(cadenceLabel)}</h2>`,
      `    <p>Charted at <strong>${api.esc(cadenceLabel)}</strong> because that is
      ${api.esc(def.cadenceWhy)}. It is what the numbers below are indexed to, not a
      recommendation about frequency — that is a prescribing decision.</p>`,
      `    <figure class="curve">
${ssChart.svg}
      <figcaption>The dashed line is one dose on its own; the filled line is what repeated
      dosing ${api.esc(cadenceLabel)} builds to. The vertical scale is multiples of a single
      dose's peak. ${ss.accumulation >= 1.05
        ? `The level plateaus at about ${ss.accumulation}× a single dose after roughly ${curve.fmtHours(5 * pk.hl)}, then oscillates between a trough and a peak ${ss.ratio}× higher.`
        : `There is essentially no accumulation at this interval — each dose has cleared before the next arrives, so the two lines nearly coincide.`}</figcaption>
      </figure>`,

      `    <h2>The arithmetic behind those numbers</h2>`,
      api.formula([
        `half-life  =  ${curve.fmtHours(pk.hl)}${pk.est ? '  (estimated)' : ''}        interval  =  ${curve.fmtHours(interval)}`,
        `fraction left after one interval  =  2^(−${(interval / pk.hl).toFixed(2)})  =  ${(remaining / 100).toFixed(3)}`,
        `accumulation ratio  =  1 ÷ (1 − ${(remaining / 100).toFixed(3)})  =  ${ss.accumulation}`,
        `time to steady state  ≈  5 × half-life  =  ${curve.fmtHours(5 * pk.hl)}`,
        ss.cleared
          ? `peak-to-trough  =  not meaningful; the trough is ${ss.trough} of a single dose's peak, i.e. cleared`
          : `peak-to-trough  =  simulated, ${ss.peak} ÷ ${ss.trough}  =  ${ss.ratio}`
      ]),
      `    <p>The accumulation ratio is a closed form; the peak-to-trough figure is not. The
      generator adds up enough repeated curves for the total to stop changing, then reads the
      highest and lowest points of the last interval — which is what steady state means in
      practice. The vertical axis is relative, not a concentration: the shape and the ratios
      carry across people, the absolute levels do not.</p>`,
      pk.est ? `    <div class="note">
      <p><strong>This compound's half-life is an estimate.</strong> The app flags it, and every
      number on this page inherits that. It means the published human pharmacokinetic data is
      limited or absent and the figure is inferred — so treat the curves as the right shape
      rather than the right numbers, and treat any claim about exact clearance times with the
      same caution.</p>
    </div>` : '',

      pairs.length ? [
        `    <h2>Interaction rules that name ${api.esc(entry.name)}</h2>`,
        `    <p>From the app's own interaction data. Not exhaustive, and not a safety clearance
        — a combination that is not listed is one nobody has documented here, which is not the
        same as one that is fine. The <a href="/tools/stack-checker/">full combination
        checker</a> has the rest.</p>`,
        `    <div class="pairs">\n${api.pairBlocks(pairs)}\n    </div>`
      ].join('\n\n') : '',

      (() => {
        const rows = api.publishableDoses(entry);
        if (!rows.length) return '';
        return [
          `    <h2>The dosing rows this cadence came from</h2>`,
          `    <p>${/APPROVED/i.test(api.regStatus(entry) || '') ? api.EV.established : (pk.est ? api.EV.theoretical : api.EV.offlabel)}
          Reproduced from the app's entry so you can see what the chart above is indexed to.
          Which row applies to a particular person, if any, is a clinical decision this page
          does not make.</p>`,
          api.table(['Label', 'Amount', 'Route and frequency'],
            rows.map((r) => [api.esc(r.l), api.esc(r.d), api.esc(r.f || '—')]))
        ].join('\n\n');
      })(),

      `    <h2>When to draw bloodwork</h2>`,
      `    <p>${api.monPanel(entry)
        ? `The panel the app records for ${api.esc(entry.name)} is: ${api.esc(api.monPanel(entry))}`
        : `The app records no specific panel for ${api.esc(entry.name)}`}. The
      pharmacokinetic point is the timing rather than the list: after any change, a level takes
      about ${curve.fmtHours(5 * pk.hl)} to settle, so a panel drawn sooner measures something
      still moving. ${ss.cleared
        ? `And because this compound clears completely between doses, a serum level says only what the last few hours did — which is why the marker worth following here is a downstream one measured over weeks, not the compound itself.`
        : ss.ratio > 1.4
          ? `And because the peak-to-trough swing here is ${ss.ratio}×, <em>when</em> in the interval you draw changes the result materially — a result without a stated draw time relative to the last dose is hard to compare with anything.`
          : `The swing at this cadence is small (${ss.ratio}×), so draw timing within the interval matters less here than it does for a short-acting compound.`}
      Whether a result means anything is a question for the clinician who ordered it, read
      against the reference range your own lab printed. The
      <a href="/markers/">lab-marker pages</a> cover what the individual analytes measure.</p>`,

      `    <p>Related: <a href="/tools/half-life-calculator/">the interactive half-life
      calculator</a> to try other cadences${reconSlug ? `, and <a href="/tools/${reconSlug}/">the
      ${api.esc(entry.name)} reconstitution calculator</a>` : ''}.</p>`,

      shell.ctaBox('half-life-' + def.slug,
        `The app draws this curve from the doses you actually logged — your dates, your cadence — and projects seven days forward from the last one.`)
    ].filter(Boolean).join('\n\n');

    out.push(api.render(ctx, {
      url,
      title: `${entry.name} half-life and steady state | TherapyLog`,
      description: `${entry.name}'s modelled half-life is ${curve.fmtHours(pk.hl)}` +
        `${pk.est ? ' (estimated)' : ''}, peaking ${curve.fmtHours(pk.tmax)} after a dose. ` +
        `Accumulation, time to steady state and peak-to-trough, with the curve drawn.`,
      trail: api.toolsTrail([
        { name: 'Half-life', url: '/tools/half-life-calculator/', absolute: api.SITE + '/tools/half-life-calculator/' },
        { name: entry.name, url, absolute: api.SITE + url }
      ]),
      calcDisclaimer: false,
      body,
      script: W.prologue({ attribution })
    }));
  }

  return out;
}

module.exports = { build, PAGES };
