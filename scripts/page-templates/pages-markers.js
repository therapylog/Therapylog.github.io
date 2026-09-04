/* The /markers/ pages — SEO-PLAN §6.
 *
 * Division of labour: markers-lib.js generates everything factual from app.html
 * (units and their conversions, assay variants and the app's own labels for
 * them, the generic range, the optimal band, the sex and age bands, the
 * converter running the app's real normalizeValue). This file holds what has to
 * be written: what the marker is, what moves it, when the assay changes the
 * answer, and what the literature and community practice describe as next steps.
 *
 * Rules every page here follows (SEO-PLAN §6.3 and §9):
 *   - three-tier evidence labelling on every claim that is not a definition;
 *   - primary literature or guideline documents cited inline, three or more;
 *   - optimal bands labelled non-diagnostic, the lab's printed range wins;
 *   - describe what is done and show the basis; never "you should take X mg";
 *   - every side-effect discussion ends with the prescribing clinician.
 *
 * The founder reviews every sentence before a page ships. validate-public-pages.js
 * guards the structure; a human guards the claims.
 */

const shell = require('./shell.js');
const L = require('./markers-lib.js');

/* A citation becomes both an inline superscript and a row in the sources list,
   so a claim and its source cannot be separated by an edit. */
const cite = (n) => `<sup class="cite"><a href="#src-${n}">${n}</a></sup>`;

const MARKERS = {
  /* ------------------------------------------------------------------ 1 */
  e2: {
    slug: 'estradiol-sensitive-vs-standard',
    keys: ['e2'],
    title: 'Sensitive vs standard estradiol | TherapyLog',
    h1: 'Sensitive versus standard estradiol: why the assay changes the answer',
    description: "Standard estradiol immunoassays are unreliable at male concentrations. What the sensitive and LC/MS-MS methods measure, and how to read one.",
    lede: `Two labs can measure the same blood and report estradiol numbers that are far apart, and
           neither is lying. The method is the difference, and most of the ranges quoted online do
           not say which one produced them.`,
    sections: [
      {
        h2: 'What estradiol is, and why this population tests it',
        paras: [
          `Estradiol is the principal estrogen in humans, and men make it too — mostly by aromatising
           testosterone, in adipose tissue, the liver, the brain and the gonads. It is not a
           contaminant of male physiology. It does load-bearing work in bone density, lipid
           handling, cognition and libido, which is why driving it to the floor causes problems of
           its own rather than solving anything.`,
          `Anyone on testosterone therapy has a reason to measure it: more substrate for aromatase
           means more estradiol, and the amount varies with dose, body composition and individual
           aromatase activity rather than following a fixed ratio. That is the practical case for
           measuring rather than guessing.`
        ]
      },
      {
        h2: 'The assay problem, which is the whole point of this page',
        paras: [
          `Direct estradiol immunoassays were developed and validated for the concentrations found in
           premenopausal women — hundreds of pg/mL. Men typically run in the tens. At that end of
           the scale the assay is being asked to work well below the range it was built for, and it
           does not: cross-reactivity with structurally similar steroids and metabolites inflates
           the reading, and the size of the error is not predictable per sample.${cite(1)}`,
          `This is not a fringe position. The recommendation is that estradiol in men and children be
           measured by a sensitive LC-MS/MS-based method, and that people with low estradiol
           concentrations should not have it measured by immunoassay at all, because immunoassays
           overestimate at those concentrations and are unreliable there.${cite(1)} The Journal of
           Clinical Endocrinology and Metabolism went as far as requiring mass spectrometry for sex
           steroid measurements in the work it publishes.${cite(2)} A separate analysis in an
           epidemiological setting concluded that direct immunoassays lack the sensitivity and
           specificity to measure circulating estradiol validly in men or postmenopausal
           women.${cite(3)}`,
          `${'@@EV_ESTABLISHED@@'} That the method matters at male concentrations is established, not
           a matter of opinion. What is <em>not</em> settled is what number you should be aiming at
           once you have a reliable one — see below.`
        ]
      },
      {
        h2: 'What the three methods actually are',
        paras: [
          `<strong>Standard immunoassay</strong> is the default on most general panels. Fast, cheap,
           validated for female concentrations, and the one to distrust in a male sample.`,
          `<strong>Sensitive or ultrasensitive</strong> usually means the lab has added an extraction
           or chromatographic step before the immunoassay, or is running a platform validated to a
           lower limit. Better at low concentrations than the standard assay, and what most
           TRT-oriented panels order.`,
          `<strong>LC/MS-MS</strong> — liquid chromatography with tandem mass spectrometry — separates
           estradiol from the things that confuse an antibody and then measures it by mass. It is
           the reference method, and "sensitive estradiol" is often, though not always, this.`,
          `TherapyLog stores which of these produced a value, because a trend that silently switches
           method is not a trend. If your report does not name the method, that is worth asking the
           lab about before reading much into the number.`
        ]
      },
      {
        h2: 'Reading the number you have',
        paras: [
          `The generic range in the fact box above is a male default and a fallback; the interval
           printed on your own report is better, because it belongs to the assay that produced your
           result. The optimal band the app shows is drawn from clinical literature and community
           practice for reading a trend and is <span class="nondx">non-diagnostic</span> — being
           outside it is not itself a finding.`,
          `${'@@EV_OFFLABEL@@'} The commonly circulated targets for men on testosterone therapy — you
           will see 20–30 pg/mL quoted constantly — come from community practice and clinic
           convention rather than from a trial that established an optimal concentration. Worse,
           they are usually quoted with no method attached, which makes them close to meaningless:
           the same blood can read 45 on a standard immunoassay and 25 on LC/MS-MS. If you take a
           number off a forum, it is not usable unless you know which assay produced it.`,
          `The more defensible way to read estradiol is against your own symptoms and your own trend
           on a consistent assay, alongside total and free testosterone, rather than against a
           threshold quoted by a stranger.`
        ]
      },
      {
        h2: 'What high and low estradiol are reported to feel like',
        paras: [
          `${'@@EV_OFFLABEL@@'} These are the symptom patterns described in clinical practice and in
           the community, not diagnostic criteria — every one of them has other explanations, and
           several of them appear at both ends.`,
          '@@SIDEFX_HIGH@@',
          '@@SIDEFX_LOW@@',
          `The reason both lists matter is that "crashed" estradiol is a real and avoidable
           iatrogenic problem. Aromatase inhibitors are potent, the dose–response in an individual
           is not predictable from the label, and joint pain, low mood, poor libido and — over
           time — bone density loss follow from suppressing estradiol too far. Treating a high
           number aggressively without symptoms is how people arrive at the opposite problem.`,
          `If you have symptoms at either end, the next step is a conversation with the clinician who
           prescribes for you, with a result from a method you can name in front of you. That is
           the whole of the advice this page will give about what to do.`
        ]
      }
    ],
    sources: [
      { label: 'ADLM (formerly AACC), Optimal Testing: Estradiol Testing in Men',
        url: 'https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/a-f/estradiol-testing-in-men',
        note: 'Recommends LC/MS-based measurement in men and advises against immunoassay at low concentrations.' },
      { label: 'Handelsman & Wartofsky, Requirement for Mass Spectrometry Sex Steroid Assays, J Clin Endocrinol Metab 98(10):3971 (2013)',
        url: 'https://academic.oup.com/jcem/article/98/10/3971/2834017',
        note: 'The journal\'s editorial requiring mass spectrometry for sex steroid assays.' },
      { label: 'Limitations of Direct Immunoassays for Measuring Circulating Estradiol Levels in Postmenopausal Women and Men in Epidemiologic Studies, Cancer Epidemiol Biomarkers Prev 19(4):903 (2010)',
        url: 'https://aacrjournals.org/cebp/article/19/4/903/68242/Limitations-of-Direct-Immunoassays-for-Measuring',
        note: 'Direct immunoassays lack the sensitivity and specificity required at male and postmenopausal concentrations.' }
    ],
    sidefx: ['High estradiol', 'Crashed estradiol'],
    faq: [
      ['Is "sensitive estradiol" the same as LC/MS-MS?',
        [`Not always, and it is worth checking. Some labs use "sensitive" or "ultrasensitive" for a
          mass-spectrometry method; others use it for an immunoassay preceded by an extraction step.
          Both are more trustworthy than a standard direct immunoassay at male concentrations, but
          they are not identical, and switching between them mid-trend introduces a step change that
          is a method artefact rather than a physiological one.`]],
      ['My lab only offers the standard assay. Is the result useless?',
        [`Not useless, but treat it as an upper bound rather than a measurement, and do not compare it
          to a target quoted for a sensitive assay. If you can only get the standard assay, at least
          keep using the same one so the trend is internally consistent, and say which assay it was
          whenever you show the number to anyone.`]],
      ['Should I be taking an aromatase inhibitor for a high number?',
        [`This page will not answer that, and it is not evasion. Estradiol does necessary work, the
          symptom picture at both extremes overlaps, aromatase inhibitors are potent and easy to
          overshoot with, and a single number from an unnamed assay is thin ground for starting a
          drug. What the literature and community practice describe is treating symptoms rather than
          numbers, and confirming a high reading on a reliable assay first. The decision itself
          belongs to the clinician who prescribes for you.`]],
      ['Does the app convert pmol/L to pg/mL?',
        [`Yes — the converter above is the app's own function, and estradiol converts at 0.2724 from
          pmol/L to pg/mL. Non-US reports usually print pmol/L, which is one of the more common
          reasons a value looks alarming when it is ordinary.`]]
    ]
  },

  /* ------------------------------------------------------------------ 2 */
  tott: {
    slug: 'total-testosterone-immunoassay-vs-lcms',
    keys: ['tott'],
    title: 'Total testosterone: immunoassay vs LC/MS-MS | TherapyLog',
    h1: 'Total testosterone: immunoassay versus LC/MS-MS, and the range by age',
    description: "Why two labs report different total testosterone from the same blood, what the range does with age, and how to read an unstated method.",
    lede: `Total testosterone is the most-ordered hormone test in this population and one of the
           easiest to over-read. The method matters, the reference range moves with age, and a
           single draw says less than people think.`,
    sections: [
      {
        h2: 'What the test measures',
        paras: [
          `Total testosterone is everything in the sample: the fraction bound tightly to sex
           hormone-binding globulin, the fraction bound loosely to albumin, and the small free
           fraction. It is one number covering three populations of molecules with quite different
           availability to tissue, which is why it is a starting point rather than a conclusion.`,
          `It is also the number that moves most over a day. Testosterone follows a diurnal rhythm
           that is pronounced in younger men and flatter with age, which is the reason morning
           draws are the convention — a result taken at four in the afternoon is not comparable to
           one taken at eight in the morning.`
        ]
      },
      {
        h2: 'Immunoassay versus mass spectrometry',
        paras: [
          `Most general panels run an immunoassay. It is fast and cheap and, in the middle of the
           adult male range, broadly adequate. Where it degrades is at the low end and in samples
           with unusual binding-protein or steroid profiles, and the direction of the error is not
           consistent.${cite(1)}`,
          `${'@@EV_ESTABLISHED@@'} That the two methods diverge materially at low concentrations is
           established. The Journal of Clinical Endocrinology and Metabolism requires mass
           spectrometry for the sex steroid measurements it publishes,${cite(2)} and comparisons of
           direct immunoassay against LC-MS/MS in men have found disagreement large enough to
           change how a result reads.${cite(1)} The registry note the app carries puts it plainly:
           do not trend across methods without flagging the switch.`,
          `That last point is the practical one. If your first result came from an immunoassay and
           your second from LC/MS-MS, the difference between them is partly the method, and reading
           it as a change in you is a mistake. The app keeps the method with the value for exactly
           this reason.`
        ]
      },
      {
        h2: 'The range, and why it moves with age',
        paras: [
          `Total testosterone falls gradually with age in most men, and the reference intervals below
           reflect that — they are the bands the app itself applies, generated by running its own
           range function rather than transcribed.`,
          `${'@@EV_OFFLABEL@@'} The optimal band is a different thing from the reference range and is
           <span class="nondx">non-diagnostic</span>. Reference intervals are built from a
           population; an "optimal" band is a convention drawn from clinical literature and
           community practice about where people tend to feel and function well. Neither is a
           diagnosis, and a number inside a range does not rule out a problem any more than a
           number outside one establishes one.`,
          `A diagnosis of testosterone deficiency conventionally rests on symptoms plus more than one
           low morning measurement, not on a single draw — which is worth knowing before acting on
           one number in either direction.`
        ]
      },
      {
        h2: 'Reading a result on therapy',
        paras: [
          `On testosterone therapy the number depends heavily on <em>when</em> it was drawn relative
           to the last injection. A trough drawn the morning of the next dose and a peak drawn two
           days after one are both "your level", and they can differ by a factor that dwarfs any
           change you might be trying to detect. Whatever you choose, keep it consistent, and
           record it — the app stores the draw timing alongside the value.`,
          `${'@@EV_OFFLABEL@@'} Community practice and most clinics settle on trough draws for
           monitoring, because a trough is reproducible in a way a peak is not: it is pinned to the
           injection schedule rather than to how fast a given ester released on a given week.
           Whether your protocol is right for you is a conversation for the clinician prescribing
           it, with a consistent draw time and a named assay in front of you.`
        ]
      }
    ],
    sources: [
      { label: 'Measurement of Serum Testosterone in Nondiabetic Young Obese Men: Comparison of Direct Immunoassay to Liquid Chromatography-Tandem Mass Spectrometry',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7765982/',
        note: 'Direct immunoassay compared against LC-MS/MS in men, with the size of the disagreement.' },
      { label: 'Handelsman & Wartofsky, Requirement for Mass Spectrometry Sex Steroid Assays, J Clin Endocrinol Metab 98(10):3971 (2013)',
        url: 'https://academic.oup.com/jcem/article/98/10/3971/2834017',
        note: 'The journal requiring mass spectrometry for sex steroid assays in published work.' },
      { label: 'ADLM (formerly AACC), Optimal Testing: laboratory test utilisation guidance',
        url: 'https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/a-f/estradiol-testing-in-men',
        note: 'Assay-selection guidance for sex steroids at low concentrations.' }
    ],
    faq: [
      ['My level is "normal" but I feel terrible. What does that mean?',
        [`It means a population reference interval did not answer your question, which is a limit of
          the test rather than a contradiction. Reference intervals are wide, they are built from a
          population that includes people who feel fine and people who do not, and total
          testosterone does not describe how much is actually available to tissue. Free
          testosterone and SHBG address that second point directly. What it means for you is a
          clinical question, not a laboratory one.`]],
      ['Does the draw have to be in the morning?',
        [`For a diagnostic workup, conventionally yes — the diurnal rhythm is real and the reference
          intervals were built on morning samples. On established therapy the more important thing
          is consistency relative to your injection schedule, so that two results are comparable to
          each other.`]],
      ['How do I convert nmol/L to ng/dL?',
        [`The converter above does it with the app's own factor: nmol/L × 28.84 gives ng/dL. Most
          non-US reports print nmol/L, and mixing the two units is one of the more common reasons a
          result looks wildly out of range when it is not.`]]
    ]
  },

  /* ------------------------------------------------------------------ 3 */
  freet: {
    slug: 'free-vs-total-testosterone',
    keys: ['freet', 'bioavailt', 'shbg'],
    title: 'Free vs total testosterone | TherapyLog',
    h1: 'Free versus total testosterone, and the three ways labs get the free number',
    description: "Calculated, direct immunoassay and equilibrium dialysis free testosterone are three measurements. Why they disagree, and where SHBG comes in.",
    lede: `"Free testosterone" on a report can mean any of three quite different procedures. Two of
           them are reasonable and one is widely regarded as unreliable, and reports do not always
           say which you got.`,
    sections: [
      {
        h2: 'Why a free number exists at all',
        paras: [
          `Most circulating testosterone is bound. A large fraction is held tightly by sex
           hormone-binding globulin, a further fraction is held loosely by albumin, and a small
           percentage circulates free. The bound-to-SHBG portion is generally considered unavailable
           to tissue on the relevant timescale; the free portion, and to a debated degree the
           albumin-bound portion, are not.`,
          `That is the entire reason free and bioavailable testosterone are measured. If your SHBG is
           unusual in either direction, total testosterone stops tracking what is actually available
           — which is how two men with identical total testosterone end up with quite different
           free levels and quite different experiences.`
        ]
      },
      {
        h2: 'The three methods, and which to trust',
        paras: [
          `<strong>Equilibrium dialysis</strong> physically separates the free fraction and measures
           it. It is the reference method, it is more expensive and slower, and it is what the other
           two are validated against.${cite(2)}`,
          `<strong>Calculated</strong> free testosterone derives the number from total testosterone,
           SHBG and albumin using the law of mass action. The widely used version comes from
           Vermeulen and colleagues in 1999,${cite(1)} and it correlates well with dialysis when the
           inputs are measured on reliable assays.${cite(1)} It is what most panels labelled
           "free testosterone, calculated" are giving you.`,
          `<strong>Direct immunoassay</strong> — sometimes called analogue free testosterone — is the
           cheap one, and the app's registry note calls it unreliable. That is the mainstream view
           rather than a strong opinion.`,
          `${'@@EV_ESTABLISHED@@'} That the three methods are not interchangeable is established, and
           the app stores which one produced a value for the same reason it does for estradiol.`
        ]
      },
      {
        h2: 'The calculated number inherits its inputs',
        paras: [
          `A calculated free testosterone is only as good as the total testosterone, the SHBG and the
           albumin that went into it. Change the SHBG assay and the calculated free value moves
           without anything having changed in you — which is the registry's own note on this marker,
           and the reason the app records the method.`,
          `${'@@EV_OFFLABEL@@'} There is also live scientific argument about the model itself. The
           binding model underlying the classic mass-action equations has been challenged, with
           evidence of allosteric interaction between the two SHBG binding sites, and reassessments
           have found discrepancies against direct equilibrium dialysis.${cite(3)} This does not make
           calculated free testosterone useless — it remains the most practical option for most
           people — but it does mean a calculated value carries more uncertainty than its decimal
           places suggest.`,
          `<strong>Bioavailable testosterone</strong> is the free fraction plus the albumin-bound
           fraction, and it is usually calculated from the same three inputs, so it inherits the
           same error.`
        ]
      },
      {
        h2: 'Where SHBG comes into it',
        paras: [
          `SHBG is the lever. High SHBG binds more testosterone tightly, so a given total produces
           less free; low SHBG does the reverse. That is why a total testosterone result read
           without an SHBG alongside it is incomplete for anyone whose symptoms and numbers do not
           match.`,
          `The <a href="/markers/shbg/">SHBG page</a> covers what moves it. For the arithmetic itself
           there is a <a href="/tools/free-testosterone-calculator/">free testosterone calculator</a>
           that runs the Vermeulen equation in whatever units your lab printed and shows its
           working.`
        ]
      }
    ],
    sources: [
      { label: 'Vermeulen A, Verdonck L, Kaufman JM, A critical evaluation of simple methods for the estimation of free testosterone in serum, J Clin Endocrinol Metab 84(10):3666 (1999)',
        url: 'https://academic.oup.com/jcem/article/84/10/3666/2660190',
        note: 'The origin of the calculated free testosterone equation in general use.' },
      { label: 'Free testosterone by direct and calculated measurement versus equilibrium dialysis in a clinical population, The Aging Male (2013)',
        url: 'https://www.tandfonline.com/doi/full/10.3109/13685538.2013.835800',
        note: 'Head-to-head comparison of the three approaches in practice.' },
      { label: 'Reassessing Free-Testosterone Calculation by Liquid Chromatography–Tandem Mass Spectrometry Direct Equilibrium Dialysis, J Clin Endocrinol Metab 103(6):2167 (2018)',
        url: 'https://academic.oup.com/jcem/article/103/6/2167/4956600',
        note: 'Challenges the binding model behind the classic equations and quantifies the discrepancy.' }
    ],
    faq: [
      ['Which free testosterone should I ask for?',
        [`Equilibrium dialysis is the reference method if you can get it and afford it. Calculated is
          the practical default and is fine provided the total testosterone and SHBG behind it came
          from good assays and you keep using the same lab. Direct immunoassay free testosterone is
          the one to be sceptical of. Which is appropriate for your situation is a question for the
          clinician ordering it.`]],
      ['My total is fine but my free is low. Which do I believe?',
        [`Both, usually — that pattern is what high SHBG looks like, and it is exactly the situation
          free testosterone exists to reveal. Check whether an SHBG was run at the same time. If the
          free value was a direct immunoassay, treat it with more caution than the total.`]],
      ['Why does my calculated free testosterone change when I switch labs?',
        [`Because the calculation takes SHBG as an input and SHBG assays are not standardised across
          labs. The app records the method with the value so a change of that kind is visible as a
          method change rather than read as a change in you.`]]
    ]
  },

  /* ------------------------------------------------------------------ 4 */
  shbg: {
    slug: 'shbg',
    keys: ['shbg'],
    title: 'SHBG: what it is and what moves it | TherapyLog',
    h1: 'SHBG: what it does, what raises and lowers it, and why it drives your free testosterone',
    description: "SHBG decides how much of your testosterone is available. What raises and lowers it, why high SHBG on TRT is a common complaint, how to read it.",
    lede: `SHBG is the reason two people with the same total testosterone can have different free
           levels and different symptoms. It is also the input that makes a calculated free
           testosterone move when nothing else has.`,
    sections: [
      {
        h2: 'What SHBG is',
        paras: [
          `Sex hormone-binding globulin is a glycoprotein made mainly by the liver that binds sex
           steroids in circulation — testosterone and dihydrotestosterone tightly, estradiol less
           so. Testosterone bound to it is generally treated as unavailable to tissue on the
           relevant timescale.`,
          `So SHBG functions as a buffer and a distributor rather than as a hormone in its own right.
           Its clinical interest here is almost entirely in what it does to the free fraction: high
           SHBG means less free testosterone for a given total, low SHBG means more.`
        ]
      },
      {
        h2: 'What moves it',
        paras: [
          `${'@@EV_ESTABLISHED@@'} SHBG rises with age, with thyroid hormone excess, with liver
           disease, with oral estrogen, and in states of low energy availability such as sustained
           caloric restriction. It falls with insulin resistance and obesity, with hypothyroidism,
           with growth hormone excess, and with androgen exposure — which is the one that matters
           for this audience.`,
          `That last point explains a common and confusing pattern: SHBG frequently falls on
           testosterone therapy. A falling SHBG raises the free fraction for a given total, which is
           why free testosterone can climb faster than total does after a dose change. It is also
           why a total testosterone read without an SHBG can understate what is actually going on.`,
          `${'@@EV_OFFLABEL@@'} "High SHBG on TRT" is a frequent community complaint, usually meaning
           that free testosterone is disappointing despite a respectable total. The underlying
           driver is more often thyroid status, liver, low energy availability or simple individual
           variation than the therapy itself — which is worth establishing before concluding that a
           protocol is at fault.`
        ]
      },
      {
        h2: 'How to read an SHBG result',
        paras: [
          `SHBG is not a marker you treat. It is a marker you interpret other markers <em>through</em>.
           An SHBG at the top of the reference range is not a finding on its own; an SHBG at the top
           of the range alongside a mid-range total testosterone and a low free testosterone is an
           explanation.`,
          `The reference interval in the fact box is a generic male default and the one your own
           report prints is better. SHBG assays are not well standardised between laboratories,
           which is a practical reason to keep using one lab if you are watching a trend — and the
           reason a calculated free testosterone can shift when you switch.`,
          `${'@@EV_OFFLABEL@@'} You will find protocols circulating that claim to lower SHBG. The
           evidence behind most of them is weak, the effect sizes claimed are usually larger than
           anything demonstrated, and SHBG is downstream of things — thyroid, liver, body
           composition, energy availability — that are worth addressing on their own merits. If your
           free testosterone is the problem, that is the conversation to have with your prescribing
           clinician, and it usually starts with the inputs rather than with SHBG itself.`
        ]
      }
    ],
    sources: [
      { label: 'Vermeulen A, Verdonck L, Kaufman JM, A critical evaluation of simple methods for the estimation of free testosterone in serum, J Clin Endocrinol Metab 84(10):3666 (1999)',
        url: 'https://academic.oup.com/jcem/article/84/10/3666/2660190',
        note: 'The binding model in which SHBG determines the free fraction, and the equation built on it.' },
      { label: 'Free testosterone by direct and calculated measurement versus equilibrium dialysis in a clinical population, The Aging Male (2013)',
        url: 'https://www.tandfonline.com/doi/full/10.3109/13685538.2013.835800',
        note: 'How SHBG-dependent calculation compares against the reference method in practice.' },
      { label: 'Reassessing Free-Testosterone Calculation by Liquid Chromatography–Tandem Mass Spectrometry Direct Equilibrium Dialysis, J Clin Endocrinol Metab 103(6):2167 (2018)',
        url: 'https://academic.oup.com/jcem/article/103/6/2167/4956600',
        note: 'Evidence that the SHBG binding model underlying the calculation is more complex than assumed.' }
    ],
    faq: [
      ['Is high SHBG bad?',
        [`Not in itself. It is a finding that explains a low free testosterone rather than a disease.
          What matters is whether the free fraction and your symptoms line up, and what is driving
          the SHBG — thyroid status, liver, and energy availability are the usual places to look.`]],
      ['Why did my SHBG drop after starting testosterone?',
        [`Androgen exposure lowers SHBG, and that is expected rather than alarming. The practical
          consequence is that free testosterone rises more than total alone would predict, which is
          a reason to have both measured rather than extrapolating from one.`]],
      ['What units is SHBG reported in?',
        [`nmol/L nearly everywhere, which is the canonical unit here. Some reports print µg/mL; the
          converter above handles it with the app's own factor.`]]
    ]
  },

  /* ------------------------------------------------------------------ 5 */
  hct: {
    slug: 'hematocrit-on-trt',
    keys: ['hct', 'hgb', 'rbc', 'ferritin'],
    title: 'Hematocrit on TRT | TherapyLog',
    h1: 'Hematocrit on testosterone therapy: the thresholds, the trend, and the ferritin trap',
    description: "Testosterone raises hematocrit. What the guideline thresholds are, why draw conditions matter, and what routine donation trades away.",
    lede: `A rising hematocrit is the most predictable laboratory consequence of testosterone therapy
           and the one most often mismanaged — usually by treating the number without watching what
           the fix does to iron.`,
    sections: [
      {
        h2: 'Why testosterone raises it',
        paras: [
          `${'@@EV_ESTABLISHED@@'} Testosterone stimulates erythropoiesis, and a dose-dependent rise
           in hematocrit is an expected effect of therapy rather than a complication of it. It is
           the single most common laboratory abnormality on treatment. Systematic review of
           drug-induced erythrocytosis places the onset typically within the first one to three
           years, with the largest increase in the first year.${cite(1)}`,
          '@@SIDEFX_HIGH@@'
        ]
      },
      {
        h2: 'The thresholds, and where they come from',
        paras: [
          `${'@@EV_ESTABLISHED@@'} The number to know is <strong>54%</strong>: the 2018 Endocrine
           Society clinical practice guideline recommends withholding testosterone when hematocrit
           exceeds it, until the value normalises, then resuming at a lower dose. It sets the
           monitoring schedule at baseline, three to six months, and annually thereafter.${cite(2)}`,
          `${'@@EV_OFFLABEL@@'} The <em>baseline</em> threshold — the reading above which starting
           therapy is discouraged in the first place — is quoted less consistently than the 54%
           figure, and this page will not pretend otherwise. Values between 48% and 50% appear in
           different guidelines and different editions of the same guideline, and reviews of
           drug-induced erythrocytosis note that even the definition of erythrocytosis varies
           between sources.${cite(1)} If a baseline number is being used to decide whether you
           start, it is worth asking your prescriber which guideline it came from.`,
          `${'@@EV_OFFLABEL@@'} Beyond that, the picture is genuinely unsettled. A systematic review
           found that definitions of erythrocytosis and recommendations for managing it vary
           considerably between sources, and the evidence that therapeutic phlebotomy improves
           outcomes — as opposed to lowering the number — is weaker than its routine use
           implies.${cite(1)}${cite(3)} Treat 54% as the point at which guidelines say to act, not as
           a cliff edge with settled management behind it.`,
          `What the literature and clinical practice describe as the options are dose reduction,
           splitting the same weekly amount into smaller more frequent injections to flatten the
           peaks, screening for and treating sleep apnea, and supervised therapeutic phlebotomy.
           Which applies to you is a prescribing decision and belongs with your clinician.`
        ]
      },
      {
        h2: 'The number is easy to fake',
        paras: [
          `Hematocrit is a concentration, so anything that changes plasma volume changes it without
           changing your red cell mass at all. Dehydration inflates it — a draw after a sauna, a
           hard training session, a long flight or a morning without fluids can add several points.
           So can a tourniquet left on too long.`,
          `Before reacting to a single high reading, the useful question is whether the draw
           conditions were ordinary, and the useful response is usually to repeat it properly
           hydrated rather than to act on it. Hemoglobin and red cell count alongside hematocrit
           help: if all three moved together, that is more likely to be real.`
        ]
      },
      {
        h2: 'The ferritin trap',
        paras: [
          `This is the part that gets missed, and it is why this page covers ferritin as well.
           Donating blood or undergoing phlebotomy removes iron along with red cells. Doing it on a
           schedule — every eight weeks indefinitely — reliably drives ferritin down, and iron
           deficiency without anaemia produces fatigue, poor exercise tolerance and low mood that
           look very much like the symptoms people started testosterone therapy to fix.`,
          `${'@@EV_OFFLABEL@@'} The practice the app records, and what is commonly described, is to
           track ferritin alongside hematocrit whenever donation or phlebotomy is part of the
           picture, rather than watching the hematocrit alone. A falling ferritin with a
           satisfactory hematocrit is a trade, not a success.`,
          `The full iron panel — iron, TIBC, transferrin and saturation — gives a better picture than
           ferritin alone, particularly because ferritin is an acute-phase reactant and rises with
           inflammation, which can mask depletion. If you are donating regularly, that is worth
           raising with the clinician who prescribes for you before the fatigue arrives.`
        ]
      }
    ],
    sidefx: ['High hematocrit', 'High hematocrit'],
    sources: [
      { label: 'Diagnosis, management, and outcomes of drug-induced erythrocytosis: a systematic review, Blood Advances 9(9):2108 (2025)',
        url: 'https://ashpublications.org/bloodadvances/article/9/9/2108/535485/Diagnosis-management-and-outcomes-of-drug-induced',
        note: 'Onset timing, and the variability in how erythrocytosis is defined and managed.' },
      { label: 'Endocrine Society, Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline (2018)',
        url: 'https://academic.oup.com/jcem/article/103/5/1715/4939465',
        note: 'The 54% threshold for withholding therapy, and the baseline / 3–6 month / annual monitoring schedule.' },
      { label: 'Testosterone therapy-induced erythrocytosis: can phlebotomy be justified?',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11466264/',
        note: 'Examines how well the routine use of phlebotomy is supported by outcome evidence.' }
    ],
    faq: [
      ['At what hematocrit should I actually worry?',
        [`The guideline number to know is 54%, which is where the Endocrine Society recommends
          withholding therapy until it normalises. Below that, the trend matters more than any
          single value, and a single high reading in someone who arrived dehydrated is not a
          finding. What to do about a genuinely high result is a prescribing decision — take it to
          the clinician who manages your therapy.`]],
      ['Does splitting my dose into more frequent injections help?',
        [`It is one of the options described in practice, and the rationale is that smaller more
          frequent doses flatten the peak concentrations that drive erythropoiesis. Evidence that it
          reliably lowers hematocrit is not as strong as its popularity suggests. It is a reasonable
          thing to discuss with your prescriber; it is not something this page can tell you to do.`]],
      ['Should I donate blood regularly to keep it down?',
        [`Routine scheduled donation is the specific practice this page cautions about, because it
          reliably depletes iron. If donation is part of your management, ferritin belongs in the
          same panel as your hematocrit so you can see both sides of the trade. Supervised
          therapeutic phlebotomy for a genuine indication is a different thing from donating on a
          calendar, and the distinction is one to settle with your clinician.`]],
      ['Is high hematocrit the same as polycythemia?',
        [`Not quite, and the loose usage causes confusion. Polycythemia vera is a specific myeloid
          neoplasm with its own diagnostic criteria. What testosterone causes is secondary
          erythrocytosis — a raised red cell mass driven by an external stimulus. Any hematocrit
          rise that does not fit the pattern of therapy, or that persists after it is addressed,
          deserves a proper haematological look rather than an assumption.`]]
    ]
  },


  /* ------------------------------------------------------------------ 6 */
  prolactin: {
    slug: 'prolactin',
    keys: ['prolactin'],
    title: 'Prolactin: reading a high result | TherapyLog',
    h1: 'Prolactin: what actually raises it, and what one high draw does not mean',
    description: "Prolactin is easy to elevate by accident and easy to over-treat. What raises it, why a single high value gets repeated, and how units differ.",
    lede: `A single high prolactin is one of the most over-reacted-to results in this population.
           It is also one of the easiest to produce artefactually — by the draw itself, by sleep,
           by a meal, or by a dozen ordinary medications.`,
    sections: [
      {
        h2: 'What prolactin is',
        paras: [
          `Prolactin is a pituitary hormone under continuous inhibitory control by dopamine. That
           inhibition is the important structural fact about it: most things that raise prolactin do
           so by interfering with dopamine, and most things that lower it are dopamine agonists.`,
          `In men its main clinical significance is what it does when it is persistently high —
           suppressing gonadotrophin release, and with it testosterone — and what a genuinely
           elevated value can indicate about the pituitary itself.`
        ]
      },
      {
        h2: 'Why one high draw is usually not enough',
        paras: [
          `Prolactin is secreted in pulses and rises with sleep, stress, food, nipple stimulation,
           chest wall irritation and even the venepuncture itself in some people. A modest elevation
           on a single draw, particularly one taken shortly after waking or after a stressful
           morning, is a common and unremarkable finding.`,
          `${'@@EV_ESTABLISHED@@'} Clinical guidance treats confirmation as the first step rather than
           treatment: a single measurement above the reference interval, drawn without excessive
           venepuncture stress, is what establishes hyperprolactinaemia, and the workup then looks
           for a cause — medication, hypothyroidism, renal impairment, pituitary pathology — before
           anything is treated.${cite(1)}`,
          `${'@@EV_OFFLABEL@@'} There is also a laboratory artefact worth knowing about. Macroprolactin
           — prolactin bound into large complexes — is biologically inactive but is measured by many
           assays, and it produces a high number in someone with no symptoms at all. If your value
           is high and you feel fine, asking whether the lab screened for macroprolactin is a
           reasonable question.${cite(2)}`
        ]
      },
      {
        h2: 'What raises it in this population specifically',
        paras: [
          '@@SIDEFX_HIGH@@',
          `${'@@EV_OFFLABEL@@'} The 19-nortestosterone compounds are the ones community practice
           associates with prolactin symptoms, and the mechanism usually offered is progestogenic
           activity rather than a direct prolactin effect. The evidence is a good deal thinner than
           the confidence with which it is asserted online. What is not in doubt is that the symptom
           picture — low libido, erectile difficulty, flat mood, nipple sensitivity — overlaps
           almost completely with high and with crashed estradiol, which is why the app's own note
           says to confirm the number is actually elevated before treating it.`,
          `A great many ordinary medications raise prolactin too: antipsychotics and antiemetics
           most notably, but also some antidepressants, opioids and antihypertensives.${cite(1)}
           Reviewing the medication list is a standard part of the workup and is worth doing before
           reaching for an explanation involving anything else.`
        ]
      },
      {
        h2: 'How it is treated, and why that is not this page\'s call',
        paras: [
          `${'@@EV_ESTABLISHED@@'} Where treatment is indicated, dopamine agonists are first-line, and
           the Endocrine Society guideline recommends cabergoline in preference to other dopamine
           agonists on the grounds of higher efficacy in normalising prolactin and a higher rate of
           tumour shrinkage.${cite(1)} That is what clinicians commonly use and why.`,
          `This page will not tell you a dose, and that is deliberate rather than coy. Cabergoline is
           prescription-only, it carries real adverse effects — impulse-control changes are
           documented, and valvular concerns exist at chronic high doses — the correct response
           depends entirely on <em>why</em> prolactin is high, and treating a number without
           establishing the cause can leave a pituitary lesion undiagnosed.${cite(3)} Take a
           confirmed elevation to the clinician who prescribes for you.`
        ]
      },
      {
        h2: 'The unit trap',
        paras: [
          `Prolactin is reported in ng/mL in the United States and in mIU/L in much of the rest of the
           world, and the numbers are about twenty-fold apart. A value of 400 mIU/L and a value of
           19 ng/mL are roughly the same result; read one as the other and you will either panic or
           relax for no reason.`,
          `The converter above handles it, but with a caveat the app carries and this page repeats:
           the mIU/L factor depends on the calibration standard the lab used, so a converted value
           is an approximation. Where you can, use the unit your lab reported and keep your trend in
           that unit.`
        ]
      }
    ],
    sidefx: ['High prolactin', 'High prolactin'],
    sources: [
      { label: 'Melmed S et al., Diagnosis and Treatment of Hyperprolactinemia: An Endocrine Society Clinical Practice Guideline, J Clin Endocrinol Metab 96(2):273 (2011)',
        url: 'https://academic.oup.com/jcem/article/96/2/273/2709487',
        note: 'Confirmation before treatment, the causes to exclude including medications, and cabergoline as the preferred dopamine agonist.' },
      { label: 'Prolactinoma Management, Endotext (NCBI Bookshelf)',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK279174/',
        note: 'Review of causes, the macroprolactin artefact and the diagnostic sequence.' },
      { label: 'Clinical guidelines for diagnosis and treatment of prolactinoma and hyperprolactinemia, Endocrinologia y Nutricion',
        url: 'https://www.elsevier.es/en-revista-endocrinologia-nutricion-english-edition--412-articulo-clinical-guidelines-for-diagnosis-treatment-S2173509313001190',
        note: 'A second guideline reaching the same sequence: confirm, find the cause, then treat.' }
    ],
    faq: [
      ['My prolactin is slightly over the range. Is that a problem?',
        [`Usually it is a reason to repeat the test under better conditions rather than a finding in
          itself. Draw it rested, not immediately after waking, not after a stressful commute or a
          workout, and ideally not after a large meal. If a properly taken repeat is still high, the
          question becomes why — and that is a workup, not a prescription.`]],
      ['Do I need an MRI?',
        [`That depends on how high, whether there are symptoms, and what the workup found — and it is
          a decision for the clinician managing you. What is worth knowing is that markedly elevated
          prolactin has causes that matter and that no amount of protocol adjustment will address,
          which is the reason self-treating a high number is a poor idea.`]],
      ['What is the conversion between ng/mL and mIU/L?',
        [`The converter above uses the app's own factor, and the app flags the conversion rather than
          performing it silently, because the relationship depends on the lab's calibration
          standard. Roughly, ng/mL times 21 gives mIU/L — but treat any converted prolactin as
          approximate and keep your trend in one unit.`]]
    ]
  },

  /* ------------------------------------------------------------------ 7 */
  lh: {
    slug: 'lh-fsh',
    keys: ['lh', 'fsh'],
    title: 'LH and FSH on and after testosterone | TherapyLog',
    h1: 'LH and FSH: what they show during suppression and during recovery',
    description: "LH and FSH show whether your own production is running. What they do on testosterone therapy, what recovery looks like, and why timing decides.",
    lede: `LH and FSH are the difference between "my testosterone is fine" and "my testosterone is
           fine because I am injecting it". On therapy they are expected to be low; after it, they
           are how recovery is confirmed.`,
    sections: [
      {
        h2: 'What they do',
        paras: [
          `Luteinising hormone and follicle-stimulating hormone are pituitary gonadotrophins.
           LH drives testosterone production by the Leydig cells; FSH, with intratesticular
           testosterone, drives spermatogenesis in the Sertoli cells. Both are released in pulses
           under hypothalamic control, and both are suppressed by negative feedback from
           testosterone and estradiol.`,
          `${'@@EV_ESTABLISHED@@'} That feedback loop is why they matter here. Exogenous testosterone
           suppresses LH and FSH, which switches off endogenous production and — because
           intratesticular testosterone collapses along with it — impairs spermatogenesis. This is
           expected physiology on therapy rather than a side effect of it, and it is why guidelines
           direct that fertility be discussed before treatment starts.${cite(1)}`
        ]
      },
      {
        h2: 'Reading them on therapy',
        paras: [
          `On adequate testosterone therapy, LH and FSH at or below the bottom of the reference
           interval are the expected finding. A suppressed LH alongside a good total testosterone
           tells you the testosterone is exogenous, which you already knew — the value of measuring
           is in the cases where it is <em>not</em> suppressed, or where it is being deliberately
           maintained.`,
          `${'@@EV_ESTABLISHED@@'} The pair also does diagnostic work before therapy that it cannot do
           after. Low testosterone with low or inappropriately normal LH and FSH points to a
           secondary, pituitary or hypothalamic, cause; low testosterone with high LH and FSH points
           to a primary testicular one. Those are different conditions with different workups, and
           once exogenous testosterone is on board the distinction can no longer be made.${cite(1)}`,
          `Anyone using hCG or a SERM alongside or instead of therapy has a further reason to watch
           these. hCG acts at the LH receptor rather than raising LH itself, so it will not show up
           as a rising LH — which surprises people. SERMs and enclomiphene work by blocking feedback,
           and there LH and FSH are exactly the markers that show whether the drug is doing
           anything.`
        ]
      },
      {
        h2: 'Reading them after stopping',
        paras: [
          '@@SIDEFX_HIGH@@',
          `${'@@EV_OFFLABEL@@'} The timing point in that note is the one people get wrong. Measuring
           LH and FSH while a long-acting ester is still releasing tells you about the ester, not
           about your recovery: the axis is still suppressed because there is still exogenous
           testosterone in circulation. The app's Levels tab models exactly this decay, and the
           practical rule community practice has landed on is to wait out the ester before drawing
           anything you intend to interpret as recovery.`,
          `Recovery, when it happens, generally shows as LH and FSH rising first and testosterone
           following. A rising LH with a still-low testosterone is a different picture from a low LH
           with a low testosterone, and distinguishing the two is most of the reason to measure the
           pair rather than testosterone alone.`,
          `How long recovery takes, and whether anything should be done to assist it, varies with how
           long and how heavily the axis was suppressed and with individual factors nobody can read
           off a chart. That belongs with a clinician, with a timeline and the actual numbers in
           front of them.`
        ]
      },
      {
        h2: 'Units, and why the numbers look odd',
        paras: [
          `LH and FSH are reported in mIU/mL or the numerically identical IU/L, so most reports agree
           without conversion. A report in mIU/L is a thousand-fold different and the converter
           handles it, but a value that looks wildly out of range is worth checking against the unit
           before anything else.`,
          `Both are pulsatile, so a single value is a snapshot of a rhythm. That matters less on
           therapy — suppressed is suppressed — and more during recovery, where a single low reading
           is weaker evidence than a trend.`
        ]
      }
    ],
    sidefx: ['HPTA suppression & recovery', 'HPTA suppression & recovery'],
    sources: [
      { label: 'Bhasin S et al., Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline, J Clin Endocrinol Metab 103(5):1715 (2018)',
        url: 'https://academic.oup.com/jcem/article/103/5/1715/4939465',
        note: 'The role of LH and FSH in separating primary from secondary hypogonadism, and fertility counselling before therapy.' },
      { label: 'Handelsman & Wartofsky, Requirement for Mass Spectrometry Sex Steroid Assays, J Clin Endocrinol Metab 98(10):3971 (2013)',
        url: 'https://academic.oup.com/jcem/article/98/10/3971/2834017',
        note: 'Why the testosterone measured alongside these gonadotrophins needs a stated method.' },
      { label: 'ADLM (formerly AACC), Optimal Testing: laboratory test utilisation guidance',
        url: 'https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/a-f/estradiol-testing-in-men',
        note: 'Test-selection guidance for the hormone panel these sit in.' }
    ],
    faq: [
      ['My LH is zero on TRT. Is that bad?',
        [`It is the expected consequence of exogenous testosterone rather than a finding. What it
          means practically is that your own production is switched off for as long as you are on
          therapy, which is the trade the therapy involves. Whether that matters to you depends
          mostly on fertility plans, and that is worth settling with a prescriber before starting
          rather than after.`]],
      ['Will hCG raise my LH?',
        [`No, and expecting it to is a common misreading. hCG acts at the LH receptor — it substitutes
          for LH rather than stimulating its release — so LH stays suppressed while the downstream
          effect happens anyway. The markers that move are testosterone and, over time, testicular
          volume.`]],
      ['How long after stopping should I test?',
        [`Long enough that the ester has cleared, or the result is measuring the drug rather than you.
          The app's Levels tab models the decay for the compound and dose you logged, which is the
          least arbitrary way to pick a date. What to do with the result once you have it is a
          clinical conversation.`]]
    ]
  },

  /* ------------------------------------------------------------------ 8 */
  igf1: {
    slug: 'igf-1',
    keys: ['igf1', 'igfbp3'],
    title: 'IGF-1 by age, and on peptides | TherapyLog',
    h1: 'IGF-1: why the range is age-banded, and what secretagogues do to it',
    description: 'IGF-1 cannot be read without an age. What the age bands are, why assay ' +
      'standardisation matters, and what growth hormone secretagogues actually move.',
    lede: `IGF-1 is the marker people use to tell whether a growth hormone secretagogue is doing
           anything. It is also the marker most often quoted without the one piece of context it
           cannot be interpreted without: how old the person is.`,
    sections: [
      {
        h2: 'What IGF-1 measures, and why it is used instead of GH',
        paras: [
          `Growth hormone is secreted in pulses, mostly at night, and a random GH measurement is close
           to meaningless as a result. IGF-1 is produced largely by the liver in response to that GH
           exposure, circulates bound to binding proteins with a much longer half-life, and is
           therefore stable enough across a day to be measured once and interpreted.`,
          `That is the whole reason IGF-1 is the standard proxy: it integrates GH exposure over time
           instead of sampling a pulse. IGFBP-3, the main binding protein, is sometimes measured
           alongside it and moves in the same direction.`
        ]
      },
      {
        h2: 'The age problem',
        paras: [
          `${'@@EV_ESTABLISHED@@'} IGF-1 peaks in adolescence and declines continuously through adult
           life.${cite(1)} A value of 200 ng/mL is unremarkable at twenty-five and high at
           sixty-five. This is not a minor adjustment: published adult reference intervals run
           roughly 114–400 ng/mL in the 25–39 band and roughly 70–290 ng/mL over 54.${cite(1)}`,
          `That is why the registry marks age as context this marker <em>requires</em> rather than as
           a nicety, and why a raw IGF-1 quoted with no age attached — as they almost always are in
           forum posts — cannot be interpreted. Many labs report a Z-score or standard deviation
           score against an age- and sex-adjusted median for exactly this reason, and where you have
           one it is more informative than the raw number.`,
          `${'@@EV_OFFLABEL@@'} The generic band in the fact box is a broad adult default. It is a
           fallback for when your report did not carry an age-adjusted interval, and it is weaker
           than the one your lab printed, which is built for your age band.`
        ]
      },
      {
        h2: 'Assay standardisation, which is not settled',
        paras: [
          `${'@@EV_ESTABLISHED@@'} IGF-1 assays have historically disagreed with each other enough to
           matter. Calibration against the WHO reference standard has been recommended, and assays
           conforming to that recommendation have been validated against large multicentre
           cohorts.${cite(1)}${cite(2)} Not every assay in use is calibrated the same way, and
           studies comparing two modern immunoassays in the same cohort still find differences worth
           knowing about.${cite(2)}`,
          `The practical consequence is the same as for every other marker on this site: a trend
           across two laboratories is partly a comparison of two assays. Stay with one lab if you
           are watching a number move.`
        ]
      },
      {
        h2: 'What secretagogues do to it',
        paras: [
          '@@SIDEFX_HIGH@@',
          `${'@@EV_OFFLABEL@@'} Growth hormone secretagogues — the GHRH analogues like sermorelin,
           CJC-1295 and tesamorelin, and the ghrelin-receptor agonists like ipamorelin and MK-677 —
           raise IGF-1 by increasing endogenous GH release rather than by supplying GH. IGF-1 is
           therefore the reasonable marker for whether one is doing anything measurable, and a rise
           is the expected finding. Most of these are research compounds with no approval for this
           use.`,
          `The number worth watching alongside it is fasting glucose, and the reason is mechanistic
           rather than theoretical: growth hormone antagonises insulin. A rising IGF-1 with a
           drifting fasting glucose is the trade, and the app's own guidance is that a rising fasting
           glucose on a secretagogue is the signal to reconsider the dose. The
           <a href="/markers/hba1c-and-fasting-glucose/">HbA1c and fasting glucose page</a> covers
           what to watch and how often.`,
          `How high is too high is not a question with a clean published answer for people using these
           compounds off-label, because the trials that would establish it have not been done. What
           is documented is what sustained GH excess does over years in acromegaly, which is the
           reason the ceiling is worth taking seriously rather than treating a high-normal IGF-1 as a
           target. That is a discussion for a doctor, with an age-adjusted result in front of you.`
        ]
      }
    ],
    sidefx: ['GH secretagogue effects', 'GH secretagogue effects'],
    sources: [
      { label: 'Bidlingmaier M et al., Reference Intervals for Insulin-like Growth Factor-1 (IGF-I) From Birth to Senescence, J Clin Endocrinol Metab 99(5):1712 (2014)',
        url: 'https://academic.oup.com/jcem/article/99/5/1712/2537423',
        note: 'Multicentre age-banded reference intervals on an assay conforming to the international calibration recommendation.' },
      { label: 'Reference values for IGF-I serum concentration in an adult population: use of the VARIETE cohort for two new immunoassays',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8428081/',
        note: 'Adult reference values across two assays, and how far modern assays still differ.' },
      { label: 'Reference ranges for serum insulin-like growth factor I (IGF-I) in healthy adults',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5627923/',
        note: 'An independent population confirming the age-related decline.' }
    ],
    faq: [
      ['What IGF-1 should I be aiming for?',
        [`This page will not give you a target, because one does not exist for off-label use. The
          honest position is that the reference interval for your age says what is ordinary, a
          Z-score says how far from the age-adjusted median you are, and no trial has established an
          optimal value for someone taking a secretagogue for body composition or recovery. Anyone
          quoting a specific target number is quoting a convention, not a finding.`]],
      ['Does IGF-1 need to be fasted?',
        [`Not in the way glucose does — its long half-life is what makes it stable. Consistency still
          helps: same lab, same rough time of day, same relationship to your dosing schedule if you
          are on something that moves it.`]],
      ['Why does my report show a Z-score instead of a range?',
        [`Because the age adjustment is the whole point, and a Z-score expresses it directly: it is
          roughly how many standard deviations you sit from the median for your age and sex. If your
          report gives one, prefer it to comparing a raw number against a generic adult band.`]]
    ]
  },

  /* ------------------------------------------------------------------ 9 */
  hba1c: {
    slug: 'hba1c-and-fasting-glucose',
    keys: ['hba1c', 'glucose', 'insulin'],
    title: 'HbA1c and fasting glucose | TherapyLog',
    h1: 'HbA1c and fasting glucose: the conversion, and why donating blood distorts one of them',
    description: "How mmol/mol converts to percent, what fasting glucose and insulin add, and why anything shortening red cell lifespan biases HbA1c low.",
    lede: `HbA1c is an average, and averages have assumptions. The main one is that your red cells
           live about as long as everyone else's — which is exactly the assumption that routine
           phlebotomy breaks.`,
    sections: [
      {
        h2: 'What each of the three measures',
        paras: [
          `<strong>Fasting glucose</strong> is a single point: what your blood glucose was at the
           moment of the draw, after a fast. It is sensitive to the previous day, to sleep, to
           stress and to whether the fast was real.`,
          `<strong>HbA1c</strong> is glycated haemoglobin, and it reflects average glucose exposure
           over the lifespan of the circulating red cells — conventionally described as two to three
           months, weighted towards the most recent weeks. It is stable and needs no fast.`,
          `<strong>Fasting insulin</strong> is the one most often left off and often the most
           informative here. Glucose can sit in range for years while insulin climbs to keep it
           there. A normal glucose with a high fasting insulin is a different metabolic picture from
           a normal glucose with a low one, and only one of them is reassuring.`
        ]
      },
      {
        h2: 'The unit conversion',
        paras: [
          `HbA1c is reported as a percentage (NGSP) in the United States and as mmol/mol (IFCC) in
           much of the rest of the world, and the two are related by a non-linear master equation
           rather than a simple factor. The converter above runs the app's own formula, which is
           exactly why it is worth using: it is one of the conversions people most often do wrong by
           reaching for a multiplier.`,
          `As a sanity check, 48 mmol/mol is about 6.5%, and 42 mmol/mol is about 6.0%. Fasting
           glucose converts more simply — mmol/L times 18.02 gives mg/dL — and 5.5 mmol/L is about
           99 mg/dL.`
        ]
      },
      {
        h2: 'Why HbA1c can mislead this audience specifically',
        paras: [
          `${'@@EV_ESTABLISHED@@'} HbA1c assumes a normal red cell lifespan. Anything that shortens it
           — haemolysis, some haemoglobinopathies, recent blood loss, transfusion — means the average
           cell has had less time to glycate, and the result reads <strong>falsely
           low</strong>.${cite(1)}${cite(2)} The reverse is true of anything that lengthens it.`,
          `That is not an exotic caveat here. Anyone managing testosterone-driven erythrocytosis with
           regular therapeutic phlebotomy or blood donation is deliberately and repeatedly shortening
           the average age of their circulating red cells,${cite(3)} and the expected consequence is
           an HbA1c that understates true glucose exposure — potentially by enough to make a
           deteriorating metabolic picture look stable.`,
          `${'@@EV_OFFLABEL@@'} If you donate or undergo phlebotomy on a schedule, treat HbA1c as the
           weaker of your two glucose markers and lean on fasting glucose and fasting insulin, which
           do not depend on red cell lifespan. Where the question is important, fructosamine measures
           glycated serum protein over a shorter window and is unaffected by red cell
           turnover.${cite(2)} Which to use is worth raising with your clinician rather than deciding
           alone — and the <a href="/markers/hematocrit-on-trt/">hematocrit page</a> covers the other
           half of that trade.`
        ]
      },
      {
        h2: 'What moves these on protocol',
        paras: [
          '@@SIDEFX_HIGH@@',
          `${'@@EV_OFFLABEL@@'} Growth hormone antagonises insulin, so GH secretagogues run for months
           are the compounds in this space most likely to move fasting glucose in the wrong
           direction. The app's guidance is to check fasting glucose and HbA1c on anything run long
           term, and to treat a rising fasting glucose as the signal to reconsider rather than as
           noise. The <a href="/markers/igf-1/">IGF-1 page</a> covers the other side of that.`,
          `GLP-1 receptor agonists move these markers in the opposite direction, and substantially.
           A falling HbA1c on semaglutide or tirzepatide is the expected effect rather than a
           surprise. What that means for anything else you are taking, and for how often these are
           worth measuring, is a question for the prescriber.`
        ]
      }
    ],
    sidefx: ['GH secretagogue effects', 'GH secretagogue effects'],
    sources: [
      { label: 'Diagnostic Limitations of Hemoglobin A1c in the Setting of Compound Hemoglobinopathy',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12906350/',
        note: 'Worked example of altered red cell turnover producing a falsely low HbA1c and delaying diagnosis.' },
      { label: 'Unexpectedly Low HbA1c in a Patient With Newly Diagnosed Diabetes Mellitus and Thalassemia Trait',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12326337/',
        note: 'The same failure mode, and the use of alternative glycaemic markers where red cell lifespan is altered.' },
      { label: 'Diagnosis, management, and outcomes of drug-induced erythrocytosis: a systematic review, Blood Advances 9(9):2108 (2025)',
        url: 'https://ashpublications.org/bloodadvances/article/9/9/2108/535485/Diagnosis-management-and-outcomes-of-drug-induced',
        note: 'How commonly phlebotomy is used in this population, which is what makes the HbA1c caveat relevant.' }
    ],
    faq: [
      ['My HbA1c is great but my fasting glucose is creeping up. Which do I believe?',
        [`Look at whether anything is shortening your red cell lifespan — regular donation or
          phlebotomy is the common one in this population, and it biases HbA1c low. If that applies,
          the fasting glucose is the more trustworthy of the two. Adding a fasting insulin usually
          settles the question, and the answer is worth taking to a clinician rather than watching
          for another year.`]],
      ['Does HbA1c need to be fasted?',
        [`No. That is one of its genuine advantages — it is an average over months, so a meal does not
          move it. Fasting glucose and fasting insulin do require a real fast, and the registry marks
          fasting status as context those two results cannot be read without.`]],
      ['48 mmol/mol — what is that in percent?',
        [`About 6.5%. The converter above uses the app's own formula rather than a multiplier, because
          the NGSP-to-IFCC relationship is non-linear and approximating it with a single factor is a
          common source of error.`]]
    ]
  },

  /* ------------------------------------------------------------------ 10 */
  apob: {
    slug: 'apob-vs-ldl',
    keys: ['apob', 'ldl', 'nonhdl', 'ldlp'],
    title: 'ApoB vs LDL cholesterol | TherapyLog',
    h1: 'ApoB versus LDL cholesterol: counting particles instead of cargo',
    description: "LDL-C measures cholesterol carried; ApoB counts the particles carrying it. Why they disagree, and which LDL calculation your lab used.",
    lede: `LDL cholesterol and ApoB usually agree, and the interesting cases are the ones where they
           do not. Knowing which number your report actually gave you — and how it was arrived at —
           is most of the work.`,
    sections: [
      {
        h2: 'The difference in one paragraph',
        paras: [
          `LDL cholesterol measures the <em>cholesterol carried inside</em> LDL particles. ApoB counts
           the <em>particles</em>: each atherogenic particle carries exactly one apolipoprotein B
           molecule, so an ApoB concentration is a particle count in all but name. LDL-P, measured by
           NMR or ion mobility, counts the same thing a different way.`,
          `${'@@EV_ESTABLISHED@@'} They diverge when particles are unusually cholesterol-poor or
           cholesterol-rich. Someone with many small dense particles can carry a reassuring LDL-C and
           a high ApoB — more particles, less cargo in each. Where the two disagree, meta-analysis
           has found ApoB the better marker of risk.${cite(2)} That discordant pattern travels with
           insulin resistance and high triglycerides, which makes it relevant to a good part of this
           audience.`
        ]
      },
      {
        h2: 'Which LDL number did your lab actually give you?',
        paras: [
          `${'@@EV_ESTABLISHED@@'} Most LDL-C is not measured at all — it is calculated. The classic
           Friedewald equation derives it from total cholesterol, HDL and triglycerides, and it is
           unreliable when triglycerides are high, which is the app's own note on this marker. The
           Martin-Hopkins method uses an adjustable factor instead of a fixed one and misclassifies
           substantially fewer people, particularly at low LDL and high triglycerides.${cite(1)}
           Direct LDL assays measure it, and are less common.`,
          `The registry tracks all three because they are not interchangeable, and because the case
           where they disagree most — high triglycerides — is exactly the case where someone is most
           likely to be looking. If your LDL-C came from Friedewald with high triglycerides, it is
           not a usable number, and that is a laboratory fact rather than an opinion.`,
          `${'@@EV_OFFLABEL@@'} Non-HDL cholesterol sidesteps the calculation problem: it is total
           cholesterol minus HDL, requires no fast and no equation, and captures cholesterol in all
           atherogenic particles. It is the cheapest sensible answer to "my LDL number looks odd",
           and it sits in guideline practice alongside ApoB.${cite(3)}`
        ]
      },
      {
        h2: 'Particle counts do not travel between platforms',
        paras: [
          `${'@@EV_ESTABLISHED@@'} LDL-P measured by NMR and LDL-P measured by ion mobility are not
           interchangeable, and the app's registry says so explicitly: do not trend across platforms.
           The absolute numbers differ, so a change of laboratory can produce an apparent change in
           you that is entirely a change of method.`,
          `ApoB is the more portable of the two. It is a standardised immunoassay, widely available,
           inexpensive, and does not require a fast — which is a large part of why it has been gaining
           ground as the preferred single measure of atherogenic burden.${cite(3)}`
        ]
      },
      {
        h2: 'What moves these on protocol',
        paras: [
          '@@SIDEFX_HIGH@@',
          `${'@@EV_OFFLABEL@@'} The lipid effects of androgens are dose- and route-dependent and are
           not uniform: oral 17-alpha-alkylated compounds are the ones associated with the sharpest
           HDL suppression, while injectable testosterone at replacement doses has a more modest
           effect. What the community reports and what the literature describes agree that the effect
           is real and that it is worth measuring rather than assuming.`,
          `GLP-1 receptor agonists generally move lipids favourably, largely through weight loss. A
           lipid panel that improves on semaglutide or tirzepatide is expected. Neither direction is
           a reason to change anything on your own — an atherogenic burden that is genuinely elevated
           is a long-horizon cardiovascular question, and the person to have it with is a clinician
           who can see your whole risk picture rather than one line of a panel.`
        ]
      }
    ],
    sidefx: ['Lipid strain', 'Lipid strain'],
    sources: [
      { label: 'Martin SS et al., Comparison of a novel method vs the Friedewald equation for estimating low-density lipoprotein cholesterol levels, JAMA 310(19):2061 (2013)',
        url: 'https://jamanetwork.com/journals/jama/fullarticle/1774093',
        note: 'The Martin-Hopkins method, and where Friedewald misclassifies — particularly at low LDL and high triglycerides.' },
      { label: 'Sniderman AD et al., A meta-analysis of LDL-C, non-HDL-C and apoB as markers of cardiovascular risk, Circ Cardiovasc Qual Outcomes 4(3):337 (2011)',
        url: 'https://www.ahajournals.org/doi/10.1161/CIRCOUTCOMES.110.959247',
        note: 'Head-to-head comparison of the three measures as risk markers.' },
      { label: 'Grundy SM et al., 2018 AHA/ACC Guideline on the Management of Blood Cholesterol',
        url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625',
        note: 'Where ApoB and non-HDL cholesterol sit in guideline practice, and the thresholds used.' }
    ],
    faq: [
      ['Should I ask for ApoB instead of a standard lipid panel?',
        [`ApoB is inexpensive, standardised, needs no fast and answers the particle question directly,
          so asking for it alongside a standard panel is reasonable. Whether it changes anything about
          your management is a clinical question — but it is the number least likely to mislead you,
          and the one least sensitive to how your lab calculates LDL.`]],
      ['My LDL is fine but my ApoB is high. What does that mean?',
        [`It means your particles are carrying less cholesterol each, so you have more of them than
          the LDL number implies. That discordant pattern is the reason ApoB is measured at all, and
          it travels with insulin resistance and high triglycerides. It is worth showing to a
          clinician rather than reconciling yourself — the discordance is the finding.`]],
      ['Does the converter handle mmol/L?',
        [`Yes, for LDL and non-HDL cholesterol — mmol/L times 38.67 gives mg/dL, using the app's own
          factor. ApoB converts from g/L. LDL-P is reported in nmol/L only, and the app refuses to
          convert particle counts between platforms because there is no valid conversion.`]]
    ]
  },


  /* ---------------------------------------------------------------- */
  lpa: {
    slug: "lipoprotein-a",
    keys: ["lpa"],
    title: "Lp(a): nmol/L vs mg/dL and why we won't convert | TherapyLog",
    h1: "Lipoprotein(a): nmol/L, mg/dL, and why the two do not convert",
    description: "Lp(a) is reported in nmol/L or mg/dL and the two are not interconvertible. Why the 2.5 factor is wrong, what the assay does, and what one number is for.",
    lede: `Lp(a) is the only marker in TherapyLog that the app flatly refuses to convert. That refusal
           is not fussiness: mg/dL and nmol/L measure two different physical things, and the factor
           that translates one into the other is different in you than it is in the person standing
           next to you.`,
    sections: [
      {
        h2: "The one result this app will not convert",
        paras: [
          `Lipoprotein(a) is an LDL particle with a second protein bolted on. Apolipoprotein B-100 sits
           inside it exactly as it does in ordinary LDL, and a molecule of apolipoprotein(a) — apo(a) —
           is joined to that by a disulphide bond. Labs report the result in one of two units.
           Milligrams per decilitre is a <strong>mass</strong>: how much lipoprotein(a) material is in
           the sample. Nanomoles per litre is a <strong>count</strong>: how many apo(a) molecules, and
           so how many Lp(a) particles, are in it. Those are different quantities, not two scales for
           the same quantity.`,
          `${'@@EV_ESTABLISHED@@'} Turning one into the other requires knowing what a single particle
           weighs, and that weight is not the same in everyone. The apo(a) protein contains a segment
           called kringle IV type 2 which is present as a variable number of identical copies — one to
           more than forty per allele — so apo(a) exists in over forty sizes across the population, and
           a large-isoform particle is simply heavier than a small-isoform one. The European
           Atherosclerosis Society's 2022 consensus statement therefore declines to endorse any fixed
           conversion factor and asks that results be reported in molar units wherever the assay allows
           it.${cite(1)} When molar and mass results were measured head to head in 1,635 samples across
           five commercial assays, the ratio between them was not a constant: it ran from roughly 1.8
           in samples below 75 nmol/L to roughly 3.6 in the highest samples, and varied by method as
           well as by isoform size.${cite(2)}`,
          `That is the entire argument for the refusal. Every "multiply by 2.5" table online applies a
           population average to an individual, and the error is not random noise — it is
           systematically largest at the top of the range, where decisions actually get made, because
           high Lp(a) travels with small apo(a) isoforms. Run it in the direction people actually do. A
           mass result of 45 mg/dL, multiplied by the usual 2.5, reads 113 nmol/L — inside the grey
           zone and comfortably below the 125 nmol/L line. But at the ratios genuinely observed near
           and above that line, the same sample can be anywhere from about 85 to 126 nmol/L depending
           on the assay pair and the isoform, and the top of that spread is over the threshold rather
           than under it. The conversion did not tell you where you stand; it told you where an average
           person with your mass result would stand. So TherapyLog’s Lp(a) field is nmol/L only. Hand
           its converter an mg/dL value and it answers <em>no valid conversion</em> and declines to
           store a number, rather than approximating one. That is deliberate: two results in different
           units are two facts, and they are not a trend.`
        ]
      },
      {
        h2: "The assay is part of the result",
        paras: [
          `Ask which assay produced the number. Mass assays measure the whole particle and report
           mg/dL. Molar assays are calibrated to count apo(a) and report nmol/L. Nearly all routine
           assays are immunoassays, and nearly all of them use polyclonal antibodies raised against
           apo(a) — which means part of the antibody population binds the repeated kringle IV epitopes,
           the very feature that differs in number between people.`,
          `${'@@EV_ESTABLISHED@@'} This is a measurement problem, not a theoretical one. Work published
           in Clinical Chemistry in 1995 built three ELISAs differing only in the detecting antibody,
           calibrated them against a single serum containing apo(a) with 21 kringle 4 domains, and ran
           them across 723 people typed for apo(a) size. Assays whose antibody bound the repeated
           domain read high in carriers of large isoforms and low in carriers of small ones.${cite(3)}
           Since small isoforms are the ones found in people with high Lp(a), a size-sensitive assay is
           least reliable in precisely the group whose result matters most.`,
          `The fix is to measure something that does not repeat. An IFCC-endorsed reference measurement
           procedure quantifies apo(a) by mass spectrometry using proteotypic peptides drawn from the
           kringle 5, kringle 9 and protease domains — regions present once per molecule — with
           calibrators traceable to the former WHO/IFCC reference material SRM 2B, which makes it
           independent of the size polymorphism.${cite(4)} Almost no routine lab runs it, but it is
           what molar assays are increasingly standardised against. The practical version for you is
           short. Record the assay and the lab beside the number, and treat a result from a different
           lab as a different measurement rather than a change in you. A printout that says nmol/L has
           not, by itself, told you the assay was calibrated in molar units; the consensus asks labs to
           report in the units their assay was actually calibrated in.${cite(1)}`
        ]
      },
      {
        h2: "Why one number is worth having at all",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Lp(a) concentration is among the most strongly inherited
           quantitative traits in humans. Something close to 90% of its variance is controlled at the
           LPA locus, and the kringle IV type 2 copy number alone accounts for roughly 40 to 70% of it,
           with larger isoforms tracking lower concentrations.${cite(5)} Adult levels are reached early
           and are broadly stable for the rest of adult life. Nothing you eat, lift or inject was ever going to
           be the main determinant of this one.`,
          `The reason to know it is that the association with cardiovascular disease looks causal
           rather than incidental. Because apo(a) size variants are allocated at conception and
           independently of how anyone lives, they function as a natural randomisation. In three
           Copenhagen cohorts, genetically raised Lp(a) carried a hazard ratio of about 1.22 for
           myocardial infarction per doubling of Lp(a) on instrumental-variable analysis, closely
           matching the observational estimate — which is the signature of a causal exposure rather
           than a bystander marker.${cite(6)} That is also why Lp(a) sits outside the panels the app
           tracks for any compound: it is not something a protocol moves, so nothing in the app
           monitors it.`,
          `Guidelines have followed the genetics. The National Lipid Association's 2024 focused update
           asks for Lp(a) to be measured at least once in all adults and treats the result as a
           continuum, with below 75 nmol/L low risk, 75 to 125 nmol/L an intermediate grey zone, and
           125 nmol/L or above high.${cite(7)} TherapyLog's generic 0–75 nmol/L range is a fallback for
           reports that carry no range of their own. <strong>Your own lab's stated range wins</strong>,
           because it belongs to the assay that produced your number. There is no optimal band for
           Lp(a) and this page will not invent one — a result of 80 nmol/L is not a finding, it is a
           reason to look harder at everything else.`
        ]
      },
      {
        h2: "Does TRT or a GLP-1 move it?",
        paras: [
          `${'@@EV_OFFLABEL@@'} Testosterone does move Lp(a), and this is the part the general Lp(a)
           pages leave out. In a study in normal men published in the American Journal of Cardiology in
           1996, average Lp(a) fell by 37% on testosterone alone and by 28% when an aromatase inhibitor
           was given alongside it, which the authors read as an androgenic effect rather than one
           mediated by conversion to oestradiol.${cite(8)} The studies are small, short and decades
           old, they used a surrogate endpoint, and no trial has asked whether lowering Lp(a) with an
           androgen lowers anybody's risk of anything. Lowering Lp(a) is not an indication for
           testosterone and should not be treated as one. What it does mean is concrete: <em>if you
           were already on TRT when your first Lp(a) was drawn, that number may not be your untreated
           baseline</em>, and a fall after starting therapy is not evidence your arteries are safer.`,
          `${'@@EV_THEORETICAL@@'} GLP-1 receptor agonists are a different case, mostly because there
           is not yet a case. I could not find published Lp(a) data from the large semaglutide or
           tirzepatide outcome trials. The nearest human evidence points the wrong way: across four
           cohorts of people with and without type 2 diabetes, three to four months of
           energy-restricted dieting improved almost every conventional risk factor while Lp(a) rose,
           by about 15 nmol/L on average, with the rise correlating with the amount of weight
           lost.${cite(9)} Extrapolating from diet-induced weight loss to drug-induced weight loss is
           exactly that, an extrapolation, but it is the only direction the data currently point.
           Expecting a GLP-1 to fix an Lp(a) result is not supported by anything published.`,
          `Statins deserve a paragraph because the community is confident about something the
           literature is not. A 2020 analysis in the European Heart Journal pooled six randomised
           trials, 5,256 patients, and found statin therapy raised Lp(a) by around 11% relative to
           placebo, with supporting cell work showing increased apo(a) production.${cite(10)} A network
           meta-analysis of 39 randomised trials and 24,448 patients, published two years later, found
           no clinically important difference between any statin and placebo.${cite(11)} Both are real
           analyses and they disagree. What they agree on is the point that matters here: statins do
           not lower Lp(a), so an Lp(a) problem is not one that LDL therapy has quietly solved for you
           already.`
        ]
      },
      {
        h2: "What to do with a number you cannot change",
        paras: [
          `Log it once, properly. The unit exactly as printed, the assay if the report names it, the
           lab, the date. Do not convert it, do not average it against a result in the other unit, and
           do not read a trend across units — the app will not draw one for you, and that is the point.`,
          `The measure-once advice is guideline consensus, and it is being questioned. A 2025 study of
           1,263 patients with two Lp(a) measurements taken at least a year apart found a median
           intra-individual change of 16.7%, with 44% shifting by 20% or more and 14% by 50% or more,
           and its authors argue the measure-once recommendation should be revised.${cite(12)} Read
           that as a caution about precision rather than a licence to trend. A repeat that differs by a
           fifth is telling you about assay and biological variation, not about something you did last
           quarter.`,
          `${'@@EV_THEORETICAL@@'} There is at present no approved drug whose purpose is to lower
           Lp(a), and no completed outcome trial showing that lowering it prevents events. Pelacarsen,
           an antisense oligonucleotide directed at apo(a), is being tested for exactly that question
           in a phase 3 trial of 8,323 people with established cardiovascular disease and elevated
           Lp(a), running monthly injections against placebo over roughly six years, with a primary
           endpoint of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke or
           urgent coronary revascularisation.${cite(13)} At the time of writing, follow-up has finished
           and no outcome result has been published. Until one is, the case for lowering Lp(a) rests on
           genetics — a strong argument, and not a proven one.`,
          `None of this is a reason to do anything on your own. A high Lp(a) is a reason to look harder
           at every risk factor you <em>can</em> move, and to do that with the clinician who manages
           your care rather than against a threshold read off a web page.`,
          `So the honest use of a high Lp(a) is as a multiplier on the things you can actually change:
           apoB and LDL cholesterol, blood pressure, smoking, and — if you are on testosterone — the
           haematocrit and blood pressure effects that come with it. Every one of those alters what
           someone might prescribe, and none of them is a decision to make from a number on a screen,
           least of all one whose meaning depends on which machine measured it. Take the printed
           report, with its unit, its range and its assay named, to the clinician who prescribes for
           you, and let the number change that conversation rather than your protocol.`
        ]
      }
    ],
    sources: [
      { label: "Kronenberg F, Mora S, Stroes ESG, et al. Lipoprotein(a) in atherosclerotic cardiovascular disease and aortic stenosis: a European Atherosclerosis Society consensus statement. European Heart Journal 2022;43(39):3925–3946.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9639807/",
        note: "The EAS panel declines to endorse a fixed mg/dL-to-nmol/L conversion factor, asks for molar reporting where available, and sets the 75 and 125 nmol/L rule-out and rule-in zones." },
      { label: "Marcovina SM, et al. Relationship of lipoprotein(a) molar concentrations and mass according to lipoprotein(a) thresholds and apolipoprotein(a) isoform size. Journal of Clinical Lipidology 2018;12(5):1313–1323.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30100157/",
        note: "Head-to-head molar and mass measurement in 1,635 samples across five assays: molar/mass ratios are threshold-, method- and isoform-dependent, so a single conversion factor is not appropriate." },
      { label: "Marcovina SM, Albers JJ, Gabel B, Koschinsky ML, Gaur VP. Effect of the number of apolipoprotein(a) kringle 4 domains on immunochemical measurements of lipoprotein(a). Clinical Chemistry 1995;41(2):246–255.",
        url: "https://pubmed.ncbi.nlm.nih.gov/7533064/",
        note: "Establishes apo(a) isoform-size bias in immunoassays: antibodies binding the repeated kringle IV domain over-read large isoforms and under-read small ones against a single calibrator." },
      { label: "An LC–MS-based designated comparison method with similar performance to the Lp(a) reference measurement procedure to guide molar Lp(a) standardization. Clinical Proteomics, 2024.",
        url: "https://pubmed.ncbi.nlm.nih.gov/38267848/",
        note: "Describes the IFCC-endorsed mass-spectrometry reference procedure using proteotypic peptides outside the repeat region, traceable to WHO/IFCC SRM 2B and independent of apo(a) size polymorphism." },
      { label: "Lipoprotein(a) beyond the kringle IV repeat polymorphism: the complexity of genetic variation in the LPA gene. Atherosclerosis, 2022.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7613587/",
        note: "Source for heritability approaching 90%, the KIV-2 copy number variation generating over forty isoforms, and the inverse relationship between isoform size and concentration." },
      { label: "Kamstrup PR, Tybjærg-Hansen A, Steffensen R, Nordestgaard BG. Genetically elevated lipoprotein(a) and increased risk of myocardial infarction. JAMA 2009;301(22):2331–2339.",
        url: "https://pubmed.ncbi.nlm.nih.gov/19509380/",
        note: "Mendelian randomisation across three Copenhagen cohorts giving a hazard ratio of about 1.22 for myocardial infarction per doubling of Lp(a) on instrumental-variable analysis." },
      { label: "A focused update to the 2019 NLA scientific statement on use of lipoprotein(a) in clinical practice. Journal of Clinical Lipidology, 2024.",
        url: "https://www.lipidjournal.com/article/S1933-2874(24)00033-3/fulltext",
        note: "National Lipid Association recommendation to measure Lp(a) at least once in all adults, with the risk continuum expressed in nmol/L (<75, 75–125, ≥125)." },
      { label: "Zmuda JM, Thompson PD, Dickenson R, Bausserman LL. Testosterone decreases lipoprotein(a) in men. American Journal of Cardiology 1996;77(14):1244–1247.",
        url: "https://pubmed.ncbi.nlm.nih.gov/8651107/",
        note: "Testosterone administration in normal men lowered Lp(a) by an average of 37%, attributed to an androgenic rather than an oestrogenic effect." },
      { label: "Berk KA, Yahya R, Verhoeven AJM, et al. Effect of diet-induced weight loss on lipoprotein(a) levels in obese individuals with and without type 2 diabetes. Diabetologia 2017;60(6):989–997.",
        url: "https://pubmed.ncbi.nlm.nih.gov/28386638/",
        note: "Across four cohorts, energy-restricted dieting improved conventional risk factors while Lp(a) rose, with the increase correlating with weight lost." },
      { label: "Tsimikas S, Gordts PLSM, Nora C, Yeang C, Witztum JL. Statin therapy increases lipoprotein(a) levels. European Heart Journal 2020;41(24):2275–2284.",
        url: "https://pubmed.ncbi.nlm.nih.gov/31111151/",
        note: "Pooled analysis of six randomised trials (5,256 patients) reporting an increase in Lp(a) on statin therapy relative to placebo, with supporting hepatocyte data." },
      { label: "de Boer LM, et al. Statin therapy and lipoprotein(a) levels: a systematic review and meta-analysis. European Journal of Preventive Cardiology 2022;29(5):779–792.",
        url: "https://pubmed.ncbi.nlm.nih.gov/34849724/",
        note: "Network meta-analysis of 39 randomised trials and 24,448 patients finding no clinically important difference in Lp(a) between statins and placebo — the counterweight to the 2020 analysis." },
      { label: "Burzyńska M, Jankowski P, Banach M, Chudzik M. Is a single lipoprotein(a) measurement enough? Results from the STAR-Lp(a) study. Medical Sciences 2025;13(4):320.",
        url: "https://pubmed.ncbi.nlm.nih.gov/41440551/",
        note: "1,263 patients with repeat Lp(a) at least a year apart: median intra-individual change 16.7%, with 44% shifting by 20% or more — challenges the measure-once recommendation." },
      { label: "Design and rationale of Lp(a)HORIZON trial: assessing the effect of lipoprotein(a) lowering with pelacarsen on major cardiovascular events in patients with CVD and elevated Lp(a). American Heart Journal, 2025.",
        url: "https://pubmed.ncbi.nlm.nih.gov/40185318/",
        note: "Design of the 8,323-patient phase 3 outcome trial of pelacarsen — the trial that will decide whether lowering Lp(a) prevents events." }
    ],
    faq: [
      ["Can I convert my Lp(a) from mg/dL to nmol/L?",
        [`Not reliably, and TherapyLog will not do it for you. mg/dL measures the mass of Lp(a)
           material; nmol/L counts apo(a) molecules. The weight of a single particle depends on how
           many kringle IV type 2 repeats your apo(a) carries, which is genetic and differs between
           people, so the factor that is correct for one person is wrong for another.`,
         `When both were measured on the same 1,635 samples, the observed ratio ran from about 1.8 at
           low concentrations to about 3.6 at high ones, and also varied by assay. A fixed factor of
           2.5 is a population average being applied to an individual, and it goes most wrong at the
           high end where the answer actually matters.`]],
      ["My old result was in mg/dL and my new one is in nmol/L. Can I compare them?",
        [`No. Store both, keep each with the unit and lab that produced it, and treat them as two
           separate facts rather than two points on a line. The app deliberately refuses to plot them
           together.`,
         `If you want a comparable pair, ask for the repeat to be run by the same lab on the same
           assay in the same unit. Anything else confounds a change in you with a change in method.`]],
      ["Does TRT lower Lp(a)?",
        [`Small older studies say yes — average falls of roughly 25 to 40% have been reported in men
           given testosterone, apparently through an androgenic rather than an oestrogenic route. No
           trial has tested whether that reduction changes any clinical outcome, and lowering Lp(a) is
           not an approved reason to prescribe testosterone.`,
         `The practical consequence is about interpretation. If your first Lp(a) was drawn while you
           were already on testosterone, it may sit below your untreated baseline, and a drop after
           starting therapy is not evidence that your risk has fallen. Discuss what your particular
           result means with the clinician who prescribes for you.`]],
      ["Will a GLP-1 lower my Lp(a)?",
        [`There is no published Lp(a) result from the large semaglutide or tirzepatide cardiovascular
           outcome trials that I could find. The closest human evidence comes from diet-induced weight
           loss, where Lp(a) rose modestly even as almost every other risk factor improved.`,
         `So the honest answer is that it probably will not, and it might nudge it the other way. That
           is precisely why knowing your Lp(a) matters independently of the rest of your panel — it is
           the one line that your protocol is not quietly managing.`]],
      ["Do I need to repeat the test?",
        [`Guidelines say once in adulthood is enough, because Lp(a) is largely set by the LPA gene and
           is broadly stable across life. That advice is now being questioned: a 2025 study found
           nearly half of patients shifted by 20% or more between two measurements taken at least a
           year apart.`,
         `Read that as a statement about measurement precision, not as a reason to trend Lp(a)
           quarterly. A repeat that differs by a fifth is more likely assay and biological variation
           than a real change, and any decision to retest belongs with your prescribing clinician.`]],
      ["My Lp(a) is 80 nmol/L. Is that bad?",
        [`It is in the intermediate zone that the EAS and NLA describe — above the 75 nmol/L rule-out
           threshold, below the 125 nmol/L rule-in one. That is not a diagnosis and there is no optimal
           band for Lp(a) that this page will offer you.`,
         `The generic 0–75 nmol/L range in the app is a fallback for reports that carry no range of
           their own; if your lab printed a range, that one wins, because it belongs to the assay that
           produced your number. A result in the grey zone is a reason to take your other, modifiable
           risk factors more seriously — a conversation for the clinician who prescribes for you.`]]
    ]
  },

  /* ---------------------------------------------------------------- */
  ferritin: {
    slug: "ferritin-and-iron-panel",
    keys: ["ferritin","iron","tibc","transferrin","ironsat"],
    title: "Ferritin and the Iron Panel on TRT | TherapyLog",
    h1: "Ferritin and the iron panel on TRT: what donating blood costs you",
    description: "Testosterone lowers ferritin before you ever donate. How to read ferritin, iron, TIBC, transferrin and saturation together as one panel.",
    lede: `Testosterone lowers your ferritin before anyone takes a unit off you. The standard fix for a
           high haematocrit then removes 200 to 250 mg of iron at a time, every eight weeks,
           indefinitely — and the fatigue that follows looks exactly like the low-testosterone picture
           you started therapy to fix.`,
    sections: [
      {
        h2: "Testosterone moves iron before anything removes it",
        paras: [
          `Ferritin is the protein your body stores iron in. A small fraction of it leaks into the
           blood, and that is what a ferritin test measures — an indirect read on the size of the
           reserve rather than on how much iron is in circulation at the moment of the draw. It is
           reported in ng/mL on most panels and in µg/L on others; those are the same number, so a
           result of 45 on one report and 45 on another needs no conversion between them.`,
          `${'@@EV_ESTABLISHED@@'} Testosterone does two things to iron at once. It raises
           erythropoietin, which increases demand for iron, and it suppresses hepcidin, the hormone
           that gates iron out of storage and out of the gut. In men given testosterone, hepcidin and
           ferritin both fell measurably at one and three months while haemoglobin and haematocrit
           rose, and the fall in hepcidin tracked the rise in red cells ${cite(1)}. Iron is being
           unlocked from stores and built into haemoglobin.`,
          `The practical consequence is that <strong>a ferritin that drops during the first months of
           therapy is expected</strong>, and it is not by itself evidence that you are losing iron.
           Redistribution and depletion both lower ferritin. Ferritin on its own cannot tell them
           apart. The rest of the panel can, which is the entire reason for ordering it instead of a
           single number.`,
          '@@SIDEFX_HIGH@@'
        ]
      },
      {
        h2: "What a unit of blood actually costs",
        paras: [
          `${'@@EV_ESTABLISHED@@'} A whole blood donation removes roughly 200 to 250 mg of iron along
           with the red cells, and replacing that from an ordinary diet takes more than 24 weeks
           without supplementation ${cite(2)}. The minimum interval most collection services allow is
           eight weeks. The arithmetic is not subtle: donating at the permitted frequency removes iron
           about three times faster than food replaces it. The enrolment data from the REDS-II Donor
           Iron Status Evaluation study bear this out — among frequent male donors, 16.4% had
           <em>no</em> measurable iron stores and 48.7% showed iron-deficient erythropoiesis
           ${cite(3)}. Those are healthy volunteers with no reason to be iron deficient other than the
           donations themselves.`,
          `${'@@EV_ESTABLISHED@@'} Now put that next to the reason people on testosterone end up
           donating in the first place. The 2018 Endocrine Society clinical practice guideline
           recommends withholding therapy above a haematocrit of 54% until the value normalises before
           resuming at a lower dose; therapeutic phlebotomy appears among the management options
           described ${cite(4)}. That is a haematocrit protocol. It does not arrive with an
           iron-monitoring schedule attached, and no compound protocol in this app's own reference set
           lists ferritin in its monitoring panel either. The other side of this trade is covered on <a
           href="/markers/hematocrit-on-trt/">haematocrit on TRT</a>.`,
          `${'@@EV_OFFLABEL@@'} What people actually do is book a donation every eight weeks and keep
           doing it indefinitely, because it works, because it is free, and because nothing in the
           process tells them to stop. Run without a stopping rule, that is a controlled iron-depletion
           protocol. It is worth knowing that the finger-prick haemoglobin check at the donation centre
           will not catch it: that screen exists to keep the collected unit adequate and to stop donors
           becoming frankly anaemic, and a person can pass it repeatedly with empty stores, because
           haemoglobin is the <em>last</em> thing to fall, not the first. <strong>Whether to donate,
           and how often, is a prescribing decision.</strong> The ferritin trend and the donation dates
           belong with the clinician who prescribes your testosterone, not with the donation centre.`
        ]
      },
      {
        h2: "Ferritin is an inflammation marker as well as an iron marker",
        paras: [
          `Ferritin is an acute-phase protein. Its concentration in blood rises as part of the general
           inflammatory response, independently of how much iron you are actually holding. That is not
           an occasional artefact to be waved away; it is one of the things the molecule does.`,
          `${'@@EV_ESTABLISHED@@'} Inflammatory signalling raises hepcidin, which sequesters iron
           inside storage cells and restricts what reaches the marrow, so serum ferritin can sit
           comfortably in range — or above it — while iron available for making red cells is genuinely
           short ${cite(5)}. The size of the effect is not trivial. Pooled analyses across large
           population surveys found that failing to adjust ferritin for inflammation underestimates the
           prevalence of iron deficiency by as much as 25% ${cite(6)}. Obesity, fatty liver, heavy
           alcohol intake, a recent infection and hard training all push the number up. A ferritin of
           90 with a CRP of 8 is not the same finding as a ferritin of 90 with a CRP of 0.4, and adding
           CRP to the request changes the reading more than any other single addition you can make.`,
          `${'@@EV_ESTABLISHED@@'} The thresholds themselves are softer than they look. The WHO
           guideline places iron deficiency in apparently healthy adults below 15 µg/L, but says that
           where infection or inflammation is present a value below 70 µg/L may be used instead — and
           grades that as a conditional recommendation on low-certainty evidence ${cite(7)}. Note the
           width of that gap. The same result can be called deficient or not depending only on whether
           inflammation is assumed. Treat any 'optimal' band, including the 50–200 window this app
           displays, as a convenience for spotting a trend and nothing more: it is non-diagnostic, and
           sitting outside it is not a finding. <strong>Your own laboratory's reference interval,
           produced on the analyser that ran your sample, is the one that applies.</strong>`
        ]
      },
      {
        h2: "Reading iron, TIBC, transferrin and saturation together",
        paras: [
          `The other four numbers describe transport rather than storage. <em>Serum iron</em> is the
           iron bound to transferrin at the moment of the draw. <em>Transferrin</em> is the carrier
           protein itself. <em>TIBC</em> is the total amount of iron that carrier could hold, and it is
           usually not measured directly — most laboratories calculate it, either from a measured
           unsaturated iron-binding capacity plus serum iron, or by estimating it from the transferrin
           concentration. <em>Transferrin saturation</em> is serum iron divided by TIBC, expressed as a
           percentage: how full the carrier is. Because it is a ratio, it inherits the error in both of
           its inputs.`,
          `Two patterns do most of the work. In true iron deficiency, ferritin is low, transferrin and
           TIBC are <em>high</em> — the body makes more carrier when there is less to carry — and
           saturation is low. In inflammation, ferritin is normal or high, serum iron is low, and
           transferrin and TIBC are low or low-normal, because transferrin is a <em>negative</em>
           acute-phase protein and falls as ferritin rises; saturation is low here too. Both patterns
           produce a low saturation. <strong>The direction TIBC and transferrin have moved is what
           separates them.</strong> Someone on testosterone who donates regularly and carries some
           metabolic inflammation can be running both patterns at once, which is precisely the
           situation in which reading ferritin alone goes wrong.`,
          `${'@@EV_ESTABLISHED@@'} Two measurement problems are worth naming, because each one can
           change the interpretation of the same blood. First, serum iron and saturation are noisy:
           within-person biological variation is large, with coefficients of variation for serum iron
           that can exceed 30%, which limits the usefulness of any single transferrin saturation as a
           screening result and is why repeat measurement is normal practice ${cite(8)}. Second,
           ferritin assays are not interchangeable between analysers. A 2022 harmonisation study found
           between-method variation of around 23% despite manufacturers' claimed traceability to the
           WHO international standard, with some platforms reading tens of µg/L apart on the same serum
           ${cite(9)}. If your ferritin appears to have fallen after you switched laboratories, find
           out which analyser ran it before you conclude anything about your iron.`,
          `${'@@EV_ESTABLISHED@@'} Where inflammation is muddying the picture, two tests answer the
           question ferritin cannot. <em>Soluble transferrin receptor</em> rises with cellular iron
           demand and is not an acute-phase protein, so it stays interpretable when ferritin does not;
           <em>reticulocyte haemoglobin content</em> reflects the iron actually being handed to newly
           made red cells over the preceding days rather than the preceding months ${cite(5)}. Neither
           appears on a standard direct-to-consumer iron panel. Both are ordinary hospital laboratory
           tests, and they are the right things to ask about when ferritin and CRP are pulling in
           opposite directions.`
        ]
      },
      {
        h2: "What low iron without anaemia does — and what the trials actually show",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Iron deficiency without anaemia is a real state with a real symptom
           profile: fatigue, poor exercise tolerance, reduced work capacity and low mood in people
           whose haemoglobin is still perfectly normal. A systematic review of randomised trials in
           non-anaemic iron-deficient adults found that iron supplementation reduced
           <em>subjective</em> fatigue but did not produce a matching improvement in <em>objective</em>
           physical capacity ${cite(10)}. That split is the honest summary: people report feeling
           better, and the performance testing does not agree with them.`,
          `${'@@EV_ESTABLISHED@@'} The largest trial run in exactly this population is negative, and it
           deserves to be quoted rather than skated over. Four hundred and five non-anaemic repeat
           blood donors with ferritin at or below 50 µg/L were randomised to a single large intravenous
           iron infusion or to placebo. Ferritin rose by a mean of 114 µg/L and haemoglobin by 5.7 g/L
           in the treated group — the biochemistry moved decisively — and fatigue scores six to eight
           weeks later were 3.9 against 4.0 out of 10, with no difference in any prespecified subgroup,
           including donors who started below 25 µg/L ${cite(11)}. So the confident version you will
           read in forums, that a ferritin under 50 <em>is</em> what is making you tired, is stated far
           more firmly than the evidence supports. <strong>What is well established is the depletion
           itself</strong>: repeat donation empties iron stores reliably and predictably
           ${cite(2)}${cite(3)}. What is unsettled is how much of any given person's fatigue it
           explains, and whether refilling the stores reverses it.`,
          `${'@@EV_ESTABLISHED@@'} A high ferritin has its own differential, and it matters more in
           this group than in most, because people who donate blood happily for years are a
           self-selecting population. Inflammation, obesity, alcohol and liver disease account for the
           majority of high results. Hereditary haemochromatosis is the one not to miss, and the
           screening test for it is <em>transferrin saturation, not ferritin</em>: a saturation above
           45% captures essentially all C282Y homozygotes, and elevated iron studies are what should
           prompt HFE genotyping ${cite(12)}. Screening roughly 100,000 primary care adults found C282Y
           homozygosity in 0.44% of non-Hispanic white participants, about one in 227 ${cite(13)}. A
           man who has been an enthusiastic donor for a decade and has always felt better for it may
           have been treating something without ever knowing what.`,
          `${'@@EV_ESTABLISHED@@'} One further interaction, because it changes how you read the rest of
           your panel. Recent donation lowers HbA1c by refreshing the circulating red cell population
           with younger cells, while iron deficiency pushes HbA1c in the opposite direction, upward,
           through effects on red cell lifespan and glycation ${cite(14)}. Do both at once — donate on
           a schedule and run your ferritin down — and the two biases partly cancel by an amount you
           cannot recover from the number itself. This is covered further on <a
           href="/markers/hba1c-and-fasting-glucose/">HbA1c and fasting glucose</a>.`,
          `None of this is material for a decision you make alone. A ferritin trend, a transferrin
           saturation, a TIBC, a CRP and the dates you last gave blood are the inputs to a
           conversation, not a conclusion. Whether to change donation cadence, whether the testosterone
           dose or injection frequency should be adjusted instead, whether a high ferritin needs
           investigating, and whether iron replacement is appropriate at all are prescribing questions
           — and iron given to someone who does not need it is not a harmless thing to do. Take the
           whole panel and the donation dates to the clinician who prescribes for you, ideally before
           the fatigue turns up rather than after.`
        ]
      }
    ],
    sidefx: ["High hematocrit", "High hematocrit"],
    sources: [
      { label: "Bachman E, Feng R, Travison T, Li M, Olbina G, Ostland V, Ulloor J, Zhang A, Basaria S, Ganz T, Westerman M, Bhasin S. Testosterone suppresses hepcidin in men: a potential mechanism for testosterone-induced erythrocytosis. Journal of Clinical Endocrinology & Metabolism, 95(10):4743–4747, 2010.",
        url: "https://academic.oup.com/jcem/article/95/10/4743/2835251",
        note: "Establishes that testosterone administration suppresses hepcidin and lowers ferritin as haemoglobin and haematocrit rise, which is why ferritin falls on therapy before any blood is removed." },
      { label: "Kiss JE, Vassallo RR. How do we manage iron deficiency after blood donation? British Journal of Haematology, 181(5):590–603, 2018.",
        url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/bjh.15136",
        note: "Quantifies the iron removed by a whole blood donation and the time required to replace it from diet alone, and describes the cumulative effect of repeat donation." },
      { label: "Cable RG, Glynn SA, Kiss JE, et al. Iron deficiency in blood donors: analysis of enrollment data from the REDS-II Donor Iron Status Evaluation (RISE) study. Transfusion, 51(3):511–522, 2011.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3050998/",
        note: "Source of the prevalence figures for absent iron stores and iron-deficient erythropoiesis among frequent donors, defined against a ferritin threshold of 12 ng/mL." },
      { label: "Bhasin S, Brito JP, Cunningham GR, et al. Testosterone therapy in men with hypogonadism: an Endocrine Society clinical practice guideline. Journal of Clinical Endocrinology & Metabolism, 103(5):1715–1744, 2018.",
        url: "https://academic.oup.com/jcem/article/103/5/1715/4939465",
        note: "The guideline that sets the 50% and 54% haematocrit decision points and the monitoring schedule, and lists therapeutic phlebotomy among management options — without an accompanying iron-monitoring recommendation." },
      { label: "Dignass A, Farrag K, Stein J. Limitations of serum ferritin in diagnosing iron deficiency in inflammatory conditions. International Journal of Chronic Diseases, 2018:9394060, 2018.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5878890/",
        note: "Explains ferritin as an acute-phase reactant, the hepcidin mechanism by which inflammation raises it while restricting iron for erythropoiesis, and the role of soluble transferrin receptor and reticulocyte haemoglobin content as alternatives." },
      { label: "Namaste SM, Rohner F, Huang J, et al. Adjusting ferritin concentrations for inflammation: Biomarkers Reflecting Inflammation and Nutritional Determinants of Anemia (BRINDA) project. American Journal of Clinical Nutrition, 106(Suppl 1):359S–371S, 2017.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5490647/",
        note: "Quantifies how much the prevalence of iron deficiency is underestimated when ferritin is not adjusted for inflammation using CRP and AGP." },
      { label: "WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations. World Health Organization, 2020 (Executive Summary, NCBI Bookshelf).",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK569877/",
        note: "Source of the 15 µg/L threshold for apparently healthy adults and the separate 70 µg/L threshold where infection or inflammation is present, both graded on low-certainty evidence." },
      { label: "Adams PC, Barton JC. Biological variability of transferrin saturation and unsaturated iron-binding capacity. American Journal of Medicine, 120(11):999.e1–999.e7, 2007.",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2151312/",
        note: "Documents the large within-person biological and analytical variability of serum iron and transferrin saturation, which limits their value as a single screening measurement." },
      { label: "Braga F, Pasqualetti S, Frusciante E, Borrillo F, Chibireva M, Panteghini M. Harmonization status of serum ferritin measurements and implications for use as marker of iron-related disorders. Clinical Chemistry, 68(9):1202–1210, 2022.",
        url: "https://academic.oup.com/clinchem/article/68/9/1202/6633006",
        note: "Shows that commercial ferritin assays are not interchangeable despite claimed traceability to the WHO international standard, with between-method variation large enough to change clinical classification." },
      { label: "Houston BL, Hurrie D, Graham J, et al. Efficacy of iron supplementation on fatigue and physical capacity in non-anaemic iron-deficient adults: a systematic review of randomised controlled trials. BMJ Open, 8(4):e019240, 2018.",
        url: "https://pubmed.ncbi.nlm.nih.gov/29626044/",
        note: "Finds that iron supplementation in non-anaemic iron-deficient adults reduces subjective fatigue but does not improve objective measures of physical capacity." },
      { label: "Keller P, von Känel R, Hincapié CA, et al. The effects of intravenous iron supplementation on fatigue and general health in non-anemic blood donors with iron deficiency: a randomized placebo-controlled superiority trial. Scientific Reports, 10:14219, 2020.",
        url: "https://www.nature.com/articles/s41598-020-71048-0",
        note: "The large negative trial in non-anaemic iron-deficient repeat donors: ferritin and haemoglobin rose substantially on intravenous iron, and fatigue scores did not differ from placebo in any subgroup." },
      { label: "Kowdley KV, Brown KE, Ahn J, Sundaram V. ACG Clinical Guideline: Hereditary Hemochromatosis. American Journal of Gastroenterology, 114(8):1202–1218, 2019.",
        url: "https://journals.lww.com/ajg/fulltext/2019/08000/acg_clinical_guideline__hereditary_hemochromatosis.11.aspx",
        note: "Establishes transferrin saturation, with a 45% cutoff, rather than ferritin as the screening test for hereditary haemochromatosis, and that elevated iron studies should prompt HFE genotyping." },
      { label: "Adams PC, Reboussin DM, Barton JC, et al. Hemochromatosis and iron-overload screening in a racially diverse population. New England Journal of Medicine, 352(17):1769–1778, 2005 (HEIRS Study).",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa041534",
        note: "Source of the C282Y homozygote prevalence of 0.44% in non-Hispanic white participants from a primary-care screening population of approximately 100,000 adults." },
      { label: "Ford ES, Cowie CC, Li C, Handelsman Y, Bloomgarden ZT. Iron-deficiency anemia, non-iron-deficiency anemia and HbA1c among adults in the US. Journal of Diabetes, 2011.",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1753-0407.2010.00100.x",
        note: "Supports the association between iron deficiency anaemia and higher HbA1c, the opposite direction to the bias introduced by recent blood donation." }
    ],
    faq: [
      ["Does TRT lower ferritin even if I never donate blood?",
        [`Yes, and it is expected. Testosterone suppresses hepcidin and raises erythropoietin, so iron
           is pulled out of storage and built into new red cells. Ferritin and hepcidin both fall
           measurably within the first one to three months of therapy while haemoglobin and haematocrit
           rise.`,
         `That fall is redistribution rather than loss, at least initially. Ferritin cannot
           distinguish the two on its own, because it drops in both cases. The way to tell them apart
           is to look at TIBC and transferrin alongside it: in genuine depletion the carrier proteins
           rise, and in simple redistribution they do not move the same way.`]],
      ["My ferritin is normal but I feel terrible. Could I still be iron deficient?",
        [`Possibly. Ferritin is an acute-phase protein, so inflammation, obesity, fatty liver,
           alcohol, a recent infection and heavy training all raise it independently of your iron. A
           normal-looking ferritin can sit on top of genuinely short iron supply to the marrow.`,
         `The additions that resolve this are CRP, so you know whether inflammation is in play at all,
           and the full transport panel — iron, TIBC, transferrin and saturation. If ferritin and CRP
           are pulling in opposite directions, soluble transferrin receptor and reticulocyte
           haemoglobin content are the tests that stay interpretable when ferritin does not.
           Interpreting that combination is a job for the clinician who ordered it.`]],
      ["How low is too low for ferritin if I donate to control my haematocrit?",
        [`There is no single number, and anyone who gives you one is overstating what is known. The
           WHO guideline uses below 15 µg/L in apparently healthy adults and below 70 µg/L where
           inflammation is present, and grades the second as a conditional recommendation on
           low-certainty evidence. That is a very wide band for the same measurement.`,
         `Your own laboratory's reference interval, on the analyser that ran your sample, is what
           applies to your result. The 50–200 band this app shows is a convenience for spotting a trend
           and is non-diagnostic; being outside it is not a finding on its own. What is far more
           informative than any single value is the direction of travel across several donations, read
           next to your donation dates.`]],
      ["Why did my ferritin change when I switched labs?",
        [`Partly because ferritin assays are not interchangeable. A 2022 harmonisation study found
           around 23% between-method variation despite manufacturers claiming traceability to the WHO
           international standard, and some analysers read tens of µg/L apart on the same serum.`,
         `So before concluding that your iron stores moved, check whether the analyser did. The
           practical rule is to track ferritin on one laboratory where you can, and to treat a change
           that coincides with a change of provider as unexplained until proven otherwise.`]],
      ["Should I take iron if my ferritin is low from donating?",
        [`That is a prescribing decision and it genuinely depends on why the ferritin is low, which
           the number alone does not tell you. Iron given to someone who does not need it is not
           harmless, and a high ferritin in a long-term donor has its own differential — including
           hereditary haemochromatosis, for which transferrin saturation rather than ferritin is the
           screening test.`,
         `It is also worth knowing the evidence is weaker than the community assumes. The largest
           randomised trial in non-anaemic iron-deficient blood donors raised ferritin and haemoglobin
           substantially with intravenous iron and produced no improvement in fatigue against placebo.
           Iron replacement, and any change to how often you donate, belong with the clinician who
           prescribes your testosterone.`]]
    ]
  },

  /* ---------------------------------------------------------------- */
  vitd: {
    slug: "vitamin-d",
    keys: ["vitd"],
    title: "Vitamin D (25-OH): the contested range | TherapyLog",
    h1: "Vitamin D (25-OH-D): why your \"optimal\" target is a convention, not a trial result",
    description: "Vitamin D is reported in ng/mL or nmol/L, 2.5x apart, and the 50-80 'optimal' band is a convention the Endocrine Society itself stopped endorsing in 2024.",
    lede: `Two things decide whether your vitamin D result means anything, and neither is the number
           itself. The first is which unit your lab printed it in. The second is that the "optimal"
           band you are measuring yourself against was never the output of a trial — and in 2024 the
           society that wrote the most-quoted threshold stopped endorsing it.`,
    sections: [
      {
        h2: "Two units, one blood sample",
        paras: [
          `Vitamin D status is reported as 25-hydroxyvitamin D, written <strong>25(OH)D</strong>,
           25-OH-D or sometimes calcidiol. American laboratories report it in nanograms per millilitre
           (ng/mL). Most of the rest of the world — the UK, Europe, Australia, Canada — reports the
           same molecule in nanomoles per litre (nmol/L). The two differ by a factor of almost exactly
           2.5: multiply ng/mL by 2.496 to get nmol/L, or multiply nmol/L by 0.4006 to go the other
           way. Micrograms per litre (µg/L) is numerically identical to ng/mL and needs no conversion
           at all.`,
          `${'@@EV_ESTABLISHED@@'} Guideline documents quote both units side by side precisely because
           the confusion is so common — the Institute of Medicine's threshold is written as 20 ng/mL
           (50 nmol/L). ${cite(1)} Notice what that means in practice. A UK reader whose report says
           <em>75 nmol/L</em> has 30 ng/mL. Read against a community target of "50 to 80", that 75
           looks comfortably mid-range when it is in fact sitting exactly on the lowest line any
           guideline body has ever drawn. It is the easiest misreading of a vitamin D result there is,
           and it runs in one direction: people reading nmol/L conclude they are fine against a target
           that was written for ng/mL.`,
          `The reverse error is rarer and worse. A US reader who meets a European figure of 50 nmol/L
           and treats it as 50 ng/mL has silently multiplied their goal by two and a half. Before
           comparing your number to anything — a forum post, a guideline, this page — check the unit
           printed on your own report, and if a tool converted it for you, check it converted in the
           direction you assumed.`
        ]
      },
      {
        h2: "25-OH-D is the test. 1,25-dihydroxy is not.",
        paras: [
          `Vitamin D from sunlight or a supplement is hydroxylated in the liver to 25-hydroxyvitamin D,
           which circulates bound to vitamin D binding protein with a half-life of two to three weeks.
           That long half-life and large circulating pool are exactly why 25-OH-D is the storage marker
           and the right thing to measure: it integrates weeks of intake and sun exposure rather than
           reflecting yesterday. A second hydroxylation, mostly renal, produces 1,25-dihydroxyvitamin D
           — calcitriol, the hormonally active form.`,
          `${'@@EV_ESTABLISHED@@'} 1,25-dihydroxyvitamin D is <strong>not</strong> a test of vitamin D
           status, and ordering it as one is a recognised laboratory-utilisation error. Its half-life
           is hours, its concentration is roughly a thousandth of 25-OH-D's, and it is held tightly by
           parathyroid hormone — so as stores fall, PTH rises and drives 1,25 <em>up</em>, not down.
           Someone with genuine deficiency can therefore return a perfectly normal or even high 1,25.
           Laboratory-medicine guidance restricts the test to suspected disorders of vitamin D
           metabolism: hypercalcaemia of unclear cause, granulomatous disease such as sarcoidosis,
           chronic kidney disease, inherited rickets. ${cite(2)}`,
          `So if a panel you paid for returned "1,25-dihydroxy vitamin D" and no 25-hydroxy, you did
           not get a vitamin D status result, whatever the number said. Ask for the 25-hydroxy. If it
           returned both and nobody is investigating your calcium metabolism, treat the 1,25 line as
           noise on the report rather than something to trend.`
        ]
      },
      {
        h2: "The assay changes the answer",
        paras: [
          `There are two families of method. Automated immunoassays — Roche, Abbott, DiaSorin, Siemens,
           Beckman — are what most high-volume laboratories run, because they are fast and cheap.
           Liquid chromatography-tandem mass spectrometry (LC-MS/MS) physically separates the
           metabolites before measuring them, and is the reference approach. Both report a figure
           labelled "total 25-OH-D". They do not always agree.`,
          `${'@@EV_ESTABLISHED@@'} The disagreement is not academic. In one large German cohort, women
           had been measured on a DiaSorin Liaison immunoassay and men on an IDS-iSYS; applying a 30
           nmol/L deficiency cut-off classified 48.3% of women and 12.1% of men as deficient.
           Re-measuring a subset by LC-MS/MS and standardising both platforms collapsed that gap to
           15.7% and 14.3% — the apparent sex difference was almost entirely the assay. ${cite(3)}
           Standardisation programmes such as DEQAS have narrowed the spread since, but reviews of
           current assay performance still find meaningful between-method variation. ${cite(4)}`,
          `Two specific interferences are worth knowing about. The C-3 epimer of 25-OH-D3 is a distinct
           molecule that some immunoassays cross-react with and that some LC-MS/MS methods fail to
           separate chromatographically; either way the reported total is inflated. ${cite(5)} And if
           you take ergocalciferol (D2) rather than cholecalciferol (D3), platforms differ in how
           completely they recover the D2 form, so a disappointing result may be the method rather than
           you. The practical consequence is simple. A few ng/mL of movement between two laboratories
           may be entirely analytical. Track on one platform, and when the platform changes, treat the
           series as broken rather than as a trend.`
        ]
      },
      {
        h2: "Where 30, 50 and 80 came from — and why nobody agrees",
        paras: [
          `The number you have been told to aim for has a traceable origin. It is worth following it
           back, because the history is the answer.`,
          `${'@@EV_ESTABLISHED@@'} In 2011 the Endocrine Society published a clinical practice
           guideline defining deficiency as below 20 ng/mL, insufficiency as 21 to 29 ng/mL, and
           sufficiency as 30 ng/mL or above. ${cite(6)} In the same year the Institute of Medicine,
           reviewing largely the same literature, concluded that 20 ng/mL (50 nmol/L) covers the
           requirements of at least 97.5% of the population, set the recommended dietary allowance at
           600 IU daily for most adults and 800 IU above age 70, and flagged risk of harm above 125
           nmol/L. ${cite(1)} Two expert panels, one body of evidence, thresholds 10 ng/mL apart.`,
          `They were not being careless. They were answering different questions. The IOM's remit was a
           population nutrient requirement — what intake keeps nearly everybody above the level needed
           for bone health. The Endocrine Society was writing for a clinician facing one patient who
           might be at risk, and set the bar where it judged that individual was unambiguously covered.
           A population-coverage question and an individual-sufficiency question have different correct
           answers even from identical data. Most pages that quote "30" never mention that "20" exists,
           or why.`,
          `${'@@EV_ESTABLISHED@@'} The part almost nobody repeats is what happened in 2024. The
           Endocrine Society issued a new guideline and withdrew its own thresholds. It no longer
           endorses the 2011 definitions of sufficiency (at least 30 ng/mL) or insufficiency (20 to 30
           ng/mL), on the stated grounds that trial evidence does not identify a 25-OH-D concentration
           predicting net benefit from supplementation in generally healthy people. The same guideline
           recommends against routine 25-OH-D screening in healthy adults, and suggests supplementation
           without testing only for defined groups: children and adolescents, adults over 75,
           pregnancy, and high-risk prediabetes. ${cite(7)} If your target came from that society, the
           society has moved.`,
          `${'@@EV_THEORETICAL@@'} The <strong>50 to 80 ng/mL</strong> band that circulates in training
           and hormone-optimisation communities has no guideline body behind it at all. It is an
           extrapolation: observational cohorts consistently show better outcomes in people with higher
           25-OH-D, and the band was drawn where those associations look strongest. TherapyLog displays
           it because you will meet it everywhere and it helps to see where you sit relative to it. It
           is <em>non-diagnostic</em>. It was not validated against outcomes in any trial, and being
           outside it is not a finding. Your own laboratory's reference interval, printed on your own
           report and matched to the assay your own laboratory ran, is the range that governs.`
        ]
      },
      {
        h2: "What the big trials found, and what they did not",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Between 2019 and 2023 the question finally got the trials it
           deserved. VITAL randomised 25,871 US adults to 2000 IU of vitamin D3 daily or placebo and
           found no reduction in invasive cancer or major cardiovascular events. ${cite(8)} Its
           fracture analysis found no reduction in total, non-vertebral or hip fractures. ${cite(9)}
           D-Health randomised 21,315 Australians aged 60 and over to monthly vitamin D3 or placebo for
           five years and found no reduction in all-cause mortality. ${cite(10)} Its fracture outcome
           was null as well. ${cite(11)} These are large, long, well-conducted trials, and they
           repeatedly failed to reproduce what the observational literature had predicted.`,
          `It matters what those results do and do not license you to conclude. Mean baseline 25-OH-D
           in VITAL was 30.8 ng/mL, and only 12.7% of participants were below 20 ng/mL — the population
           was largely replete before randomisation. ${cite(8)} The fair reading is therefore not
           "vitamin D does nothing". It is that pushing an already-adequate person higher does not buy
           the outcomes the associations promised. Correcting genuine deficiency is a separate
           question, and the evidence that vitamin D prevents rickets and osteomalacia was never in
           dispute.`,
          `${'@@EV_THEORETICAL@@'} For this audience the specific belief worth addressing is that
           raising vitamin D raises testosterone. The observational association is real and
           reproducible — men with lower 25-OH-D do have lower testosterone on average. The randomised
           evidence does not support causation. In a placebo-controlled trial in middle-aged men with
           normal baseline testosterone, vitamin D had no effect on total testosterone, though it did
           raise oestradiol and lower SHBG. ${cite(12)} A second trial restricted to men with low
           baseline testosterone found no significant effect on total testosterone, free testosterone
           or free androgen index. ${cite(13)} Correcting a genuinely low vitamin D is defensible on
           its own terms. Expecting it to move your testosterone is not, and it is not a substitute for
           investigating why your testosterone is low.`,
          `${'@@EV_ESTABLISHED@@'} Vitamin D is treated as harmless in most of the communities that
           push the high targets, and it is not. Toxicity is real, mediated by hypercalcaemia, and
           typically appears at 25-OH-D above 150 ng/mL (375 nmol/L) alongside suppressed parathyroid
           hormone. It presents as nausea, vomiting, polyuria, thirst, dehydration, confusion and
           weakness, and can progress to nephrocalcinosis, acute kidney injury and arrhythmia.
           ${cite(14)} Published cases are overwhelmingly the result of sustained very large intakes
           over months, sometimes compounded by mislabelled products, rather than ordinary
           supplementation. The IOM set a tolerable upper intake level of 4000 IU daily for adults, and
           the gap between that and the intakes in the toxicity case series is wide. ${cite(1)} But
           wide is not infinite, and fat-soluble means it accumulates.`,
          `None of that is a reason to panic about an ordinary dose, and all of it is a reason that a
           sustained high intake belongs on the record of the clinician who prescribes for you — with
           the result, the unit and the assay in front of them. Whether it needs changing is their
           call, not this page’s.`,
          `So the sequence for a result you are unsure about is this. Confirm the unit. Confirm you are
           looking at 25-hydroxy and not 1,25. Compare it against the interval your own laboratory
           printed, on the assay your own laboratory ran, rather than against a band from a forum. If
           it is genuinely low, genuinely high, or has moved a long way without you changing anything,
           that is a conversation with the clinician who prescribes for you — bring the report, the
           units and the method, and let them decide what, if anything, should change. A number on a
           screen is not a treatment decision, and neither is this page.`
        ]
      }
    ],
    sources: [
      { label: "Ross AC, Manson JE, Abrams SA, et al. The 2011 Report on Dietary Reference Intakes for Calcium and Vitamin D from the Institute of Medicine: What Clinicians Need to Know. J Clin Endocrinol Metab 2011;96(1):53-58",
        url: "https://academic.oup.com/jcem/article-abstract/96/1/53/2833225",
        note: "The IOM committee's own summary: 20 ng/mL (50 nmol/L) covers at least 97.5% of the population, with the RDA set at 600 IU (800 IU above 70), an upper intake level of 4000 IU/day, and risk of harm flagged above 125 nmol/L." },
      { label: "Association for Diagnostics & Laboratory Medicine (ADLM), Optimal Testing: Guide to Lab Test Utilization — Vitamin D",
        url: "https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/t-z/vitamin-d",
        note: "Laboratory-medicine guidance that 25-hydroxyvitamin D is the test of status and that 1,25-dihydroxyvitamin D is reserved for suspected disorders of vitamin D metabolism." },
      { label: "Schöttker B, Jansen EHJM, Haug U, Schomburg L, Köhrle J, Brenner H. Standardization of Misleading Immunoassay Based 25-Hydroxyvitamin D Levels with Liquid Chromatography Tandem-Mass Spectrometry in a Large Cohort Study. PLoS ONE 2012;7(11):e48774",
        url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0048774",
        note: "Shows an apparent 48.3% versus 12.1% sex difference in deficiency prevalence collapsing to 15.7% versus 14.3% once two immunoassay platforms were standardised against LC-MS/MS." },
      { label: "Analytical variation concerning total 25-hydroxyvitamin D measurement, where are we now? A DEQAS review of current assay performance. J Steroid Biochem Mol Biol (2023)",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0960076023000833",
        note: "External quality assessment review confirming that between-method variation in total 25-OH-D persists despite standardisation efforts." },
      { label: "25-Hydroxyvitamin D assays: Potential interference from other circulating vitamin D metabolites. J Steroid Biochem Mol Biol",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0960076015301643",
        note: "Documents interference in 25-OH-D measurement from related metabolites, including the C-3 epimer, and how it differs by platform." },
      { label: "Holick MF, et al. Evaluation, Treatment, and Prevention of Vitamin D Deficiency: an Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab 2011;96(7):1911-1930",
        url: "https://academic.oup.com/jcem/article/96/7/1911/2833671",
        note: "The origin of the widely quoted thresholds: deficiency below 20 ng/mL, insufficiency 21-29 ng/mL, sufficiency 30 ng/mL or above." },
      { label: "Demay MB, Pittas AG, Bikle DD, et al. Vitamin D for the Prevention of Disease: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab 2024;109(8):1907-1947",
        url: "https://academic.oup.com/jcem/article/109/8/1907/7685305",
        note: "The 2024 reversal: the Society no longer endorses its 2011 sufficiency and insufficiency definitions, recommends against routine 25(OH)D screening in healthy adults, and limits empiric supplementation to defined groups." },
      { label: "Manson JE, Cook NR, Lee IM, et al. Vitamin D Supplements and Prevention of Cancer and Cardiovascular Disease. N Engl J Med 2019;380(1):33-44",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1809944",
        note: "VITAL: 25,871 adults, 2000 IU/day, no reduction in invasive cancer or cardiovascular events; mean baseline 25-OH-D 30.8 ng/mL with 12.7% below 20 ng/mL." },
      { label: "LeBoff MS, et al. Supplemental Vitamin D and Incident Fractures in Midlife and Older Adults. N Engl J Med 2022;387(4):299-309",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2202106",
        note: "VITAL's fracture endpoint: no lower risk of total, non-vertebral or hip fracture with vitamin D3 versus placebo." },
      { label: "Neale RE, et al. The D-Health Trial: a randomised controlled trial of the effect of vitamin D on mortality. Lancet Diabetes Endocrinol 2022;10(2):120-128",
        url: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(21)00345-4/abstract",
        note: "D-Health: 21,315 Australians aged 60+, monthly vitamin D3 for five years, no reduction in all-cause mortality." },
      { label: "The effect of monthly vitamin D supplementation on fractures: a tertiary outcome from the population-based, double-blind, randomised, placebo-controlled D-Health trial. Lancet Diabetes Endocrinol 2023",
        url: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(23)00063-3/abstract",
        note: "D-Health's fracture outcome, also null, including non-vertebral and major osteoporotic fractures." },
      { label: "Lerchbaum E, et al. Vitamin D and Testosterone in Healthy Men: A Randomized Controlled Trial. J Clin Endocrinol Metab 2017;102(11):4292",
        url: "https://academic.oup.com/jcem/article/102/11/4292/4096785",
        note: "Placebo-controlled trial in men with normal baseline testosterone: no effect on total testosterone, with an increase in oestradiol and a decrease in SHBG." },
      { label: "Lerchbaum E, et al. Effects of vitamin D supplementation on androgens in men with low testosterone levels: a randomized controlled trial. Eur J Nutr (2019)",
        url: "https://link.springer.com/article/10.1007/s00394-018-1858-z",
        note: "Companion trial in men with low baseline testosterone: no significant effect on total testosterone, free testosterone or free androgen index." },
      { label: "Marcinowska-Suchowierska E, Kupisz-Urbańska M, Łukaszkiewicz J, Płudowski P, Jones G. Vitamin D Toxicity–A Clinical Perspective. Front Endocrinol 2018;9:550",
        url: "https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2018.00550/full",
        note: "Clinical review of vitamin D toxicity: hypercalcaemia, typical 25-OH-D above 150 ng/mL (375 nmol/L), symptoms and the sustained very high intakes that cause it." }
    ],
    faq: [
      ["My result says 75 nmol/L. Is that good?",
        [`75 nmol/L is 30 ng/mL. That is exactly the old Endocrine Society sufficiency line and well
           above the Institute of Medicine's 20 ng/mL (50 nmol/L). It is not, however, anywhere near
           the 50 to 80 ng/mL band that circulates in training communities — that band would be 125 to
           200 nmol/L.`,
         `This is the single most common misreading of a vitamin D result. If you are in the UK,
           Europe, Australia or Canada, your result is almost certainly in nmol/L, and the American
           targets you are reading are in ng/mL. The two are 2.5x apart. Compare like with like, and
           compare against the interval your own laboratory printed.`]],
      ["Is 30 ng/mL enough, or do I need to be at 50?",
        [`There is no settled answer, and anyone who gives you one confidently is picking a side
           without telling you. The Endocrine Society said 30 in 2011. The Institute of Medicine said
           20 in the same year, from largely the same evidence, because it was answering a
           population-requirement question rather than an individual-sufficiency one.`,
         `In 2024 the Endocrine Society withdrew its own thresholds, stating that the trial evidence
           does not identify a 25-OH-D concentration that predicts net benefit from supplementation in
           generally healthy people. The 50 figure has no guideline body behind it at all. Your
           laboratory's own reference interval is the range that applies to your result.`]],
      ["Does vitamin D raise testosterone?",
        [`The observational association is real: men with lower 25-OH-D have lower testosterone on
           average. The randomised evidence does not support the causal step. A placebo-controlled
           trial in men with normal baseline testosterone found no effect on total testosterone, and a
           companion trial restricted to men with low baseline testosterone found no effect on total
           testosterone, free testosterone or free androgen index.`,
         `Correcting a genuinely low vitamin D is worth doing for its own reasons. Treating it as a
           testosterone intervention is not supported, and it should not delay looking into why your
           testosterone is low.`]],
      ["Why did my vitamin D drop when I changed labs?",
        [`Very possibly because the assay changed. Immunoassays and LC-MS/MS both report a number
           labelled 'total 25-OH-D' and they do not always agree; in one cohort, standardising two
           immunoassay platforms against mass spectrometry eliminated what had looked like a large sex
           difference in deficiency prevalence.`,
         `Interferences differ by platform too — the C-3 epimer inflates some results, and recovery of
           the D2 form varies if you take ergocalciferol. Track on one platform where you can, and when
           the method changes, treat the run as a new series rather than a fall.`]],
      ["Should I get the 1,25-dihydroxy vitamin D test as well?",
        [`Not for assessing your vitamin D status. 1,25-dihydroxyvitamin D has a half-life of hours
           and is tightly controlled by parathyroid hormone, so it commonly rises as stores fall.
           Someone genuinely deficient can return a normal or high 1,25.`,
         `It is a legitimate test for a narrow set of problems — unexplained hypercalcaemia,
           granulomatous disease, chronic kidney disease, inherited disorders of vitamin D metabolism.
           If none of those is being investigated and you have both numbers on a panel, the 25-hydroxy
           is the one that carries information.`]],
      ["Can you actually take too much vitamin D?",
        [`Yes. Toxicity is mediated by hypercalcaemia and typically appears with 25-OH-D above 150
           ng/mL (375 nmol/L) and suppressed parathyroid hormone, presenting as nausea, vomiting,
           excessive urination, thirst, dehydration, confusion and weakness, and capable of progressing
           to kidney injury and arrhythmia.`,
         `Published cases are dominated by sustained very large intakes over months, sometimes made
           worse by mislabelled products — not by routine supplementation. The IOM's tolerable upper
           intake level for adults is 4000 IU a day. Vitamin D is fat-soluble and accumulates, so if
           you are taking a high intake, the person who prescribes for you should know about it and
           should be the one deciding whether it continues.`]]
    ]
  },

  /* ---------------------------------------------------------------- */
  tsh: {
    slug: "thyroid-panel",
    keys: ["tsh","ft4","ft3","rt3","tpo","tgab","t4total","t3total"],
    title: "Thyroid panel: TSH, free T4, free T3, rT3 | TherapyLog",
    h1: "Thyroid panel: TSH, free T4, free T3, reverse T3 and thyroid antibodies",
    description: "How to read TSH, free T4, free T3, reverse T3 and thyroid antibodies — including why testosterone lowers total T4 with no thyroid disease at all.",
    lede: `Testosterone lowers thyroxine-binding globulin, so a man on TRT can post a low total T4 with
           a completely normal thyroid. That one binding-protein effect explains more alarming thyroid
           panels in this population than thyroid disease does — and it is why this panel is read on
           free hormones, not totals.`,
    sections: [
      {
        h2: "What the panel actually measures",
        paras: [
          `TSH is not a thyroid hormone. It is made by the pituitary, and it is the brain's instruction
           to the thyroid rather than the thyroid's output. The gland itself secretes mostly thyroxine
           (T4) and a little triiodothyronine (T3); most of the T3 circulating in you was made outside
           the thyroid, by enzymes stripping an iodine off T4 in liver, kidney and other tissue.
           Reverse T3 comes off the same T4 pool by a different cut and does nothing. TPO and
           thyroglobulin antibodies are not hormones at all — they are immune proteins aimed at the
           gland.`,
          `The other split on the panel is bound against free. Well over 99 per cent of the T4 and T3
           in blood is stuck to carrier proteins — thyroxine-binding globulin (TBG) mainly, then
           transthyretin and albumin. A <em>total</em> T4 counts everything, bound and unbound. A
           <em>free</em> T4 estimates the small unbound fraction, which is the part that reaches
           tissue. Both are on this panel. They are not the same measurement and they do not fail in
           the same way.`,
          `${'@@EV_ESTABLISHED@@'} TSH is the first test for a reason, and it is not tradition. Because
           the pituitary is itself reading thyroid hormone and responding to it, TSH integrates the
           signal and amplifies it, so it moves before free T4 has visibly left its range. Guideline
           practice is to use serum TSH as the initial test for suspected primary thyroid dysfunction,
           and as the test used to monitor replacement once someone is on it ${cite(1)}. Free T4 is the
           confirming measurement, not the screening one.`
        ]
      },
      {
        h2: "Why testosterone lowers your total T4",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Androgens lower thyroxine-binding globulin, and this has been
           measured directly rather than inferred. When women with normal thyroid function were given
           an androgen, serum TBG and total T4 fell over the following weeks while free T4 and TSH did
           not move at all ${cite(2)}. Oestrogen does the opposite — it raises TBG, and hypothyroid
           women started on oestrogen needed more thyroxine because more of it was being held in the
           bound compartment ${cite(3)}. Less carrier protein, less total hormone, same free hormone.`,
          `For a man on testosterone that has one very practical consequence. A total T4 sitting at the
           bottom of the reference range, or under it, alongside a normal TSH and a normal free T4, is
           the expected binding-protein signature of androgen exposure. It is not hypothyroidism, and
           it does not become hypothyroidism because the number printed in bold on the report. Total T3
           shifts the same way for the same reason. That is why this panel is read on free hormones,
           and why the totals — which the app still stores, because your report prints them — are the
           weaker two numbers on it.`,
          `There is one group for whom this matters a great deal rather than a little: people already
           taking thyroid hormone. In the same study, hypothyroid women on a settled replacement dose
           became biochemically over-replaced once the androgen was added, because their dose had been
           fitted to the old binding-protein state ${cite(2)}. The oestrogen study is the mirror image
           ${cite(3)}. So if you take levothyroxine, liothyronine or desiccated thyroid and you start,
           stop or substantially change testosterone — or change an aromatase inhibitor, which moves
           oestrogen — the panel is worth repeating a few weeks later. What happens to the thyroid dose
           after that is a decision for whoever prescribes it, and they need to be told the
           testosterone changed.`
        ]
      },
      {
        h2: "TSH first, and what a TSH number is worth",
        paras: [
          `${'@@EV_ESTABLISHED@@'} The relationship between TSH and free T4 is roughly logarithmic
           rather than proportional: a small movement in free T4 produces a large movement in TSH.
           Analysis of repeated measurements within individuals found that the log TSH to free T4
           relationship is predominantly linear inside a given person, even though it looks messy and
           non-linear once you pool a population ${cite(4)}. The useful reading is that TSH is a
           sensitive amplifier of <em>your</em> thyroid state, and that your own serial values carry
           more information than where you happen to sit in someone else's distribution.`,
          `An amplifier is also twitchy. TSH has a diurnal rhythm, moves with acute illness, and lags a
           real change in thyroid hormone by weeks rather than days. A single out-of-range TSH with
           normal free hormones is a reason to repeat the test, not a diagnosis. It is also the number
           watched over time on this panel, which is why TSH sits on the monitoring list for
           levothyroxine, liothyronine, desiccated thyroid and lithium in the app rather than being a
           one-off screen.`,
          `Every pattern above is a reason to take the panel, the units and the assay to the clinician
           who manages your thyroid, not a reason to adjust anything on your own. A thyroid result read
           in isolation from symptoms and from the rest of the panel is exactly the kind of number that
           gets treated when it should have been repeated.`,
          `${'@@EV_OFFLABEL@@'} About the 0.5–2.5 optimal band in the fact box: it is a convention and
           should be treated as one. It draws on population data in which most people without thyroid
           antibodies sit comfortably below 2.5, and on a long-running argument that an upper reference
           limit near 4.0 is inflated by undiagnosed autoimmune disease sitting inside the reference
           population. That argument has been made carefully and repeatedly, and it has not been
           settled ${cite(5)}. The band is non-diagnostic. Being outside it is not a finding, being
           inside it is not a clean bill of health, and the interval your own laboratory printed
           against your own result on its own analyser beats both. A TSH outside <em>that</em> interval
           on repeat testing is the version worth taking to the clinician who prescribes for you.`
        ]
      },
      {
        h2: "Reverse T3, honestly",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Reverse T3 is what you get when an enzyme takes the iodine off the
           inner ring of T4 instead of the outer one. It is inactive. It rises reliably when the body
           down-regulates thyroid hormone turnover, and the clearest demonstration is nutritional: in
           fasted men serum T3 fell by roughly half with a reciprocal rise in reverse T3, while a
           hypocaloric diet that removed carbohydrate lowered T3 without significantly raising rT3
           ${cite(6)}. Illness, surgery, injury and sustained energy deficit push the same way, a
           pattern usually called non-thyroidal illness syndrome ${cite(7)}.`,
          `${'@@EV_THEORETICAL@@'} What is not established is the model built on top of that. The
           "reverse T3 dominance" story — that rT3 blocks T3 at the receptor, producing tissue
           hypothyroidism behind a normal TSH, and that the free T3 to reverse T3 ratio is therefore a
           target to be corrected — is a mechanistic extrapolation. It has not been shown to identify
           people who benefit from treatment. The American Thyroid Association's position is that in
           healthy, non-hospitalised people, measuring reverse T3 does not help determine whether
           hypothyroidism exists and is not clinically useful ${cite(8)}, and rT3 testing is not
           recommended in professional practice guidelines for thyroid function ${cite(9)}.`,
          `That is worth saying plainly rather than sneering at, because the observation underneath it
           is real. The people who order rT3 are usually tired, usually dieting or training hard, and
           usually holding a panel that looks slightly off — and a low T3 with a high rT3 is precisely
           what a body under sustained energy restriction produces. An aggressive cut, a GLP-1-driven
           drop in intake, a heavy training block or a recent illness will all do it. The finding is
           genuine; what it means is that you are in a deficit or unwell, not that your thyroid needs a
           drug. This is why the app publishes a reference range for rT3 and deliberately publishes no
           optimal band — there is no target here worth naming, and inventing one would imply a
           treatment decision the evidence does not support. If the pattern persists once intake and
           illness are accounted for, that is a conversation with your prescribing clinician about why,
           not a number to chase.`
        ]
      },
      {
        h2: "Antibodies, biotin, and the assay that produced the number",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Thyroid peroxidase and thyroglobulin antibodies answer a different
           question from the rest of the panel: not whether the gland is working, but why. Their value
           is prognostic. In the twenty-year follow-up of the Whickham cohort, a raised TSH alone and
           positive thyroid antibodies alone each raised the odds of developing overt hypothyroidism
           substantially, and the two together raised them far more than either did on its own — with a
           considerably larger effect in men than in women ${cite(10)}. A positive TPO alongside a
           normal TSH usually changes nothing this month. It changes how closely the panel is watched,
           and for how long.`,
          `${'@@EV_ESTABLISHED@@'} Biotin is the most under-known cause of an alarming thyroid panel in
           a supplement-taking population, and this is a supplement-taking population. Most automated
           thyroid immunoassays run on biotin–streptavidin chemistry, and circulating biotin from a
           hair-skin-and-nails product or a stacked B-complex competes with it. The direction of the
           error depends on the assay format: competitive assays, which is how free T4 and free T3 are
           measured, read falsely <em>high</em>, while sandwich assays, which is how TSH is measured,
           read falsely <em>low</em> ${cite(11)}. The result imitates hyperthyroidism well enough that
           published cases were worked up and diagnosed as Graves' disease before anyone asked about
           the supplement ${cite(12)}. The FDA has issued guidance to diagnostic manufacturers on
           testing for and disclosing biotin interference precisely because it is neither rare nor
           obvious ${cite(13)}.`,
          `Method matters in a quieter way too. Free T4 and free T3 on a routine panel are estimates
           produced by an immunoassay, not direct measurements of unbound hormone, and different
           manufacturers' methods disagree with each other and with equilibrium dialysis followed by
           mass spectrometry, with the gap widest away from the middle of the range ${cite(14)}. They
           are also sensitive to abnormal binding proteins: in familial dysalbuminaemic
           hyperthyroxinaemia, where an albumin variant binds T4 unusually, current free hormone
           immunoassays return wrong answers ${cite(15)}. That is the same class of problem as the TBG
           shift at the top of this page, and it is why a free T4 that moved when you changed
           laboratories may have moved because the assay changed rather than because you did.`,
          `So the working rule for a panel that does not match how you feel is unglamorous. Repeat it,
           on the same platform as last time, after stopping biotin, and tell the laboratory what you
           take — supplements and testosterone included. A result that survives that is worth acting
           on; one that does not was an artefact, and acting on it would have been the mistake. What to
           do about a result that does survive is not something a reference page can tell you, because
           the answer turns on your antibodies, your symptoms, your other medication and your own
           laboratory's intervals. That decision belongs to the clinician who prescribes your thyroid
           medication — and if you are also on testosterone, they need to know that too, because the
           two panels move each other.`
        ]
      }
    ],
    sources: [
      { label: "Jonklaas J, Bianco AC, Bauer AJ, et al., Guidelines for the Treatment of Hypothyroidism: Prepared by the American Thyroid Association Task Force on Thyroid Hormone Replacement, Thyroid 24(12):1670–1751 (2014)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4267409/",
        note: "Establishes serum TSH as the initial test for suspected primary thyroid dysfunction and as the test used to monitor thyroid hormone replacement." },
      { label: "Arafah BM, Decreased levothyroxine requirement in women with hypothyroidism during androgen therapy for breast cancer, Ann Intern Med 121(4):247–251 (1994)",
        url: "https://www.acpjournals.org/doi/10.7326/0003-4819-121-4-199408150-00002",
        note: "Androgen lowered thyroxine-binding globulin and total T4 while free T4 and TSH stayed unchanged in euthyroid women, and over-replaced those already taking thyroxine." },
      { label: "Arafah BM, Increased need for thyroxine in women with hypothyroidism during estrogen therapy, N Engl J Med 344(23):1743–1749 (2001)",
        url: "https://www.nejm.org/doi/full/10.1056/NEJM200106073442302",
        note: "The mirror-image experiment: oestrogen raised TBG and increased the thyroxine requirement in treated hypothyroid women." },
      { label: "Rothacker KM, Brown SJ, Hadlow NC, Wardrop R, Walsh JP, Reconciling the Log-Linear and Non–Log-Linear Nature of the TSH-Free T4 Relationship: Intra-Individual Analysis of a Large Population, J Clin Endocrinol Metab 101(3):1151 (2016)",
        url: "https://academic.oup.com/jcem/article/101/3/1151/2804899",
        note: "Within an individual the log TSH to free T4 relationship is predominantly linear, even where the pooled population relationship is not." },
      { label: "Laurberg P, Andersen S, Carlé A, Karmisholt J, Knudsen N, Pedersen IB, The TSH upper reference limit: where are we at?, Nat Rev Endocrinol 7(4):232–239 (2011)",
        url: "https://www.nature.com/articles/nrendo.2011.13",
        note: "Reviews the unresolved argument over lowering the TSH upper reference limit from about 4.0 towards 2.5, which is where the community 'optimal' band comes from." },
      { label: "Spaulding SW, Chopra IJ, Sherwin RS, Lyall SS, Effect of caloric restriction and dietary composition on serum T3 and reverse T3 in man, J Clin Endocrinol Metab 42(1):197–200 (1976)",
        url: "https://academic.oup.com/jcem/article/42/1/197/2685319",
        note: "Fasting roughly halved serum T3 with a reciprocal rise in reverse T3; a carbohydrate-free hypocaloric diet lowered T3 without significantly raising rT3." },
      { label: "The Non-Thyroidal Illness Syndrome, Endotext (NCBI Bookshelf)",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK285570/",
        note: "Describes the low-T3, high-rT3 pattern as a physiological response to illness and energy restriction rather than thyroid failure." },
      { label: "American Thyroid Association, Thyroid Function Tests",
        url: "https://www.thyroid.org/thyroid-function-tests/",
        note: "States that in healthy, non-hospitalised people reverse T3 measurement does not help determine whether hypothyroidism exists and is not clinically useful." },
      { label: "Trust your Endocrinologist – Report and Recommendations on the Ordering of Reverse T3 Testing, Ann Clin Lab Sci 50(3):383 (2020)",
        url: "https://www.annclinlabsci.org/content/50/3/383.full",
        note: "Finds rT3 testing is not recommended by professional practice guidelines and that most orders audited were not clinically justified." },
      { label: "Vanderpump MPJ, Tunbridge WMG, French JM, et al., The incidence of thyroid disorders in the community: a twenty-year follow-up of the Whickham Survey, Clin Endocrinol 43:55–68 (1995)",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1365-2265.1995.tb01894.x",
        note: "Quantifies how a raised TSH and positive thyroid antibodies, separately and together, change the odds of progressing to overt hypothyroidism, with a larger effect in men." },
      { label: "Favresse J, Burlacu MC, Maiter D, Gruson D, Interferences With Thyroid Function Immunoassays: Clinical Implications and Detection Algorithm, Endocr Rev 39(5):830–850 (2018)",
        url: "https://academic.oup.com/edrv/article/39/5/830/5048350",
        note: "Reviews biotin, macro-TSH, heterophile, anti-streptavidin and anti-ruthenium interference, including the format-dependent direction of biotin error on TSH versus free T4 and free T3." },
      { label: "Elston MS, Sehgal S, Du Toit S, Yarndley T, Conaglen JV, Factitious Graves' Disease Due to Biotin Immunoassay Interference — A Case and Review of the Literature, J Clin Endocrinol Metab 101(9):3251–3255 (2016)",
        url: "https://academic.oup.com/jcem/article/101/9/3251/2806423",
        note: "Documents biotin interference producing a thyroid panel indistinguishable from Graves' disease, with a review of similar published cases." },
      { label: "US Food and Drug Administration, Testing for Biotin Interference in In Vitro Diagnostic Devices (guidance)",
        url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/testing-biotin-interference-in-vitro-diagnostic-devices",
        note: "FDA guidance directing diagnostic manufacturers to test for and disclose biotin interference, which is why the problem is treated as routine rather than exotic." },
      { label: "Large method differences for free thyroid hormone assays in the hyperthyroid range can affect assessment of hyperthyroid status: comparison of Abbott Alinity to Roche Cobas, Siemens Centaur and equilibrium dialysis LC-MS/MS (PubMed 37848158)",
        url: "https://pubmed.ncbi.nlm.nih.gov/37848158/",
        note: "Shows that free T4 and free T3 results are method-dependent and that platforms diverge materially from equilibrium dialysis with mass spectrometry." },
      { label: "Familial dysalbuminaemic hyperthyroxinaemia interferes with current free thyroid hormone immunoassay methods",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7222281/",
        note: "Demonstrates that an abnormal binding protein makes routine free thyroid hormone immunoassays give wrong answers — the same failure mode as an altered TBG state." }
    ],
    faq: [
      ["Why is my total T4 low on testosterone but my free T4 normal?",
        [`Testosterone lowers thyroxine-binding globulin, the main carrier protein for thyroid hormone
           in blood. Less carrier means less bound hormone, so the total falls while the unbound
           fraction that actually reaches tissue stays where it was. A low total T4 with a normal free
           T4 and a normal TSH on testosterone is the expected pattern, not a thyroid problem. Total T3
           behaves the same way.`,
         `It is a different situation if you already take thyroid hormone. That dose was fitted to
           your previous binding-protein state, so a change in testosterone can shift the panel enough
           to matter. Repeat the panel a few weeks after the change and take it to the clinician who
           prescribes the thyroid medication.`]],
      ["Should I test reverse T3?",
        [`Reverse T3 tells you the body is down-regulating thyroid hormone turnover — from illness,
           injury, fasting or a sustained energy deficit. That signal is real and reproducible. What it
           does not do is diagnose hypothyroidism or identify people who benefit from treatment, and it
           is not recommended in professional guidelines for thyroid function testing.`,
         `TherapyLog carries a reference range for reverse T3 and no optimal band, deliberately. There
           is no target here worth naming, and publishing one would imply a treatment decision the
           evidence does not support.`]],
      ["Is a TSH of 3.5 too high?",
        [`It is inside almost every laboratory's reference interval and outside the 0.5–2.5 band you
           will see quoted in community discussion. That band is a convention drawn from population
           data and an unsettled argument about the upper reference limit. It is not a guideline
           threshold and it is non-diagnostic — being outside it is not a finding.`,
         `What matters more is the interval your own laboratory printed on your own report, whether
           the value is stable across repeat draws, whether your free T4 is normal, and whether you
           have thyroid antibodies. A TSH outside your own lab's interval on repeat testing is the
           version worth taking to your clinician.`]],
      ["Can biotin supplements affect a thyroid test?",
        [`Yes, and it is the first thing to rule out on a panel that looks dramatic but does not match
           how you feel. Most automated thyroid immunoassays run on biotin–streptavidin chemistry. High
           circulating biotin pushes free T4 and free T3 falsely high and TSH falsely low, producing a
           picture that closely resembles hyperthyroidism.`,
         `Published cases have been worked up and diagnosed as Graves' disease before anyone asked
           about the supplement. Stop biotin before a draw and tell the laboratory you were taking it.
           Assays vary in how susceptible they are, so the laboratory is the right place to ask.`]],
      ["Does a positive TPO antibody mean I need treatment?",
        [`Not on its own. Antibodies establish that thyroid dysfunction, if it appears, is autoimmune
           in origin. They do not by themselves mean the gland is failing now, and a positive TPO with
           a normal TSH is generally watched rather than treated.`,
         `What they change is prognosis. In long-term follow-up data a raised TSH and positive
           antibodies each increased the odds of progressing to overt hypothyroidism, and the two
           together increased it far more, with a notably larger effect in men. In practice that means
           a closer monitoring interval, and how close is a decision for your clinician.`]]
    ]
  },

  /* ---------------------------------------------------------------- */
  dht: {
    slug: "dht",
    keys: ["dht"],
    title: "DHT: what it means, and the cost of lowering | TherapyLog",
    h1: "DHT (dihydrotestosterone): what the result means, and what lowering it costs",
    description: "Dihydrotestosterone is more than a hair-loss number. What a serum DHT can and cannot tell you, why gels raise it, and what 5-ARI suppression really costs.",
    lede: `Almost every page about DHT treats it as a number to get rid of. The more useful questions
           are what a serum DHT result can actually tell you — which is less than you would hope — and
           what you give up if you decide to suppress it.`,
    sections: [
      {
        h2: "DHT is not a stronger testosterone. It is a different compartment.",
        paras: [
          `Dihydrotestosterone is testosterone with a single double bond reduced away. The enzyme that
           does it, 5-alpha-reductase, comes in two main isoforms with different homes: type 1 in skin,
           sebaceous glands and liver, type 2 in the prostate, genital skin and the hair follicle. The
           reaction runs one way. DHT cannot be converted back to testosterone, and it is not a
           substrate for aromatase, so unlike testosterone it never becomes estradiol.`,
          `${'@@EV_ESTABLISHED@@'} At the androgen receptor DHT is the stronger ligand. In classical
           binding work on the human androgen receptor, DHT bound with roughly twice the affinity of
           testosterone, and testosterone came off the receptor about five times faster ${cite(1)}.
           That is where the folk version comes from — <em>DHT is the real androgen, testosterone is
           just the precursor</em>. The same experiments undercut it: at high enough concentrations,
           testosterone occupied and activated the receptor much as DHT did ${cite(1)}. Greater potency
           is not exclusivity.`,
          `${'@@EV_ESTABLISHED@@'} The second point is the one most pages skip. Blood is not where DHT
           does its work. Circulating DHT sits at roughly a tenth of circulating testosterone, because
           most DHT is made inside target tissue from testosterone that arrived there, used locally,
           and only then leaked out — and intracellular androgen concentrations in androgen-sensitive
           tissue are substantially independent of circulating concentrations ${cite(2)}. A serum DHT
           is a spillover reading from a process happening somewhere you are not sampling. It is a real
           measurement. It is a weak proxy for what your scalp or prostate is seeing.`
        ]
      },
      {
        h2: "Three units and an assay that changes the answer",
        paras: [
          `DHT is reported in at least three units, and the spread between them is wide enough to cause
           real errors. The canonical unit here is ng/dL. A pg/mL figure is ten times the ng/dL figure,
           so 450 pg/mL and 45 ng/dL are the same blood. A nmol/L figure is the ng/dL figure divided by
           29.04, so a generic 30–85 ng/dL band is 300–850 pg/mL, or 1.03–2.93 nmol/L. The predictable
           failure is seeing 450 on a report written in pg/mL, comparing it against a range written in
           ng/dL, and concluding you are five times over the top when you are sitting mid-band. Check
           the unit before you interpret the number, and use the interval your own laboratory printed
           rather than any generic band, including the one on this page.`,
          `${'@@EV_ESTABLISHED@@'} Method matters more for DHT than for almost any other androgen, for
           the same reason it matters for estradiol in men: the analyte sits near the bottom of what an
           immunoassay resolves, and the compound it most resembles chemically is present at ten times
           the concentration. When a validated LC-MS/MS method was compared with established
           immunoassay methods, serum DHT read consistently lower by mass spectrometry, and
           chromatographic clean-up before the immunoassay narrowed the gap — the signature of
           interfering substances rather than of genuinely higher DHT ${cite(3)}. The same work found
           even the collection tube could shift results, with fluoride tubes giving DHT around 15%
           lower than plain tubes ${cite(3)}. The parallel argument for estradiol is laid out <a
           href="/markers/estradiol-sensitive-vs-standard/">here</a>.`,
          `The practical consequence is dull and important. Record the method beside every DHT you log.
           An immunoassay DHT and an LC-MS/MS DHT drawn a month apart are not two points on a trend;
           they are two different measurements sharing a name. If a DHT looks high and the report does
           not say how it was produced, the first question is not what to do about the level.`
        ]
      },
      {
        h2: "Why DHT climbs on testosterone therapy, and why gels climb hardest",
        paras: [
          `${'@@EV_ESTABLISHED@@'} DHT rises when testosterone rises, roughly in proportion, because
           testosterone is the substrate. Less widely known is that the route changes the ratio and not
           only the level. A steady-state comparison of a transdermal testosterone patch against a
           transdermal gel in hypogonadal men found DHT concentrations and DHT/testosterone ratios two-
           to three-fold higher on the gel ${cite(4)}. Manufacturer labelling for a testosterone gel
           reports DHT rising in parallel with testosterone throughout treatment, with steady-state
           DHT/testosterone ratios of roughly 0.23 to 0.33 depending on how much was applied
           ${cite(5)}.`,
          `The mechanism is not mysterious. Skin is rich in 5-alpha-reductase and a gel is spread
           across a large area of it, so a meaningful fraction of the dose is reduced on the way in. An
           injection largely bypasses that. This is worth knowing before you reach for a pathological
           explanation: a raised DHT and a raised DHT/testosterone ratio on a transdermal preparation
           is the expected pharmacology of that route. The same absolute number would mean something
           different on an injectable.`,
          `${'@@EV_ESTABLISHED@@'} Whether the elevation causes harm is a separate question, and the
           honest answer is that the evidence is thinner than either camp claims. The most thorough
           review of the subject concluded that available data are limited by the absence of large,
           long, well-controlled trials, and that on balance modest elevations of circulating DHT
           during testosterone replacement do not appear to have adverse effects ${cite(2)}. That is a
           cautious conclusion, not a clean bill of health. It sits alongside practice: the Endocrine
           Society guideline builds monitoring around symptoms, serum testosterone, haematocrit and
           prostate assessment, and does not make DHT a routine monitoring target ${cite(6)}. If a high
           DHT on a gel is bothering you, the lever that moves it is the route, and route is a
           prescription decision — take the result, with its method and its units, to the clinician who
           prescribes for you.`
        ]
      },
      {
        h2: "Hair loss is a sensitivity, not a level",
        paras: [
          `${'@@EV_ESTABLISHED@@'} Hair is the most common reason people order a DHT, and it is the
           question the test is least able to answer. When serum DHT was measured in people with
           androgenetic alopecia and compared with controls, mean DHT did not differ significantly
           between the groups, and higher DHT did not track with more advanced alopecia; raised
           concentrations turned up in the control group as well ${cite(7)}. The authors' own
           conclusion was that the decisive variable is the genetically determined sensitivity of the
           follicle, not the amount of DHT available to it ${cite(7)}.`,
          `${'@@EV_THEORETICAL@@'} That fits the compartment argument above. Balding and non-balding
           scalp differ in local 5-alpha-reductase activity and androgen receptor density, so the
           exposure that matters is generated and read inside the follicle, largely uncoupled from what
           is circulating ${cite(2)}. This is mechanism and extrapolation rather than a demonstrated
           causal chain in individual people, and it should be held loosely — but it explains the
           observation cleanly. Two men with identical serum DHT can have entirely different scalps.`,
          `So here is what a DHT result cannot do. It cannot tell you whether you will lose hair. It
           cannot tell you that you have too much DHT for your follicles, because there is no threshold
           to compare against. A DHT inside 30–85 ng/dL does not protect you, and one above 85 ng/dL is
           not a diagnosis. Being outside a generic band is not a finding. If your hair is receding,
           the informative examination is of your scalp and your family history, not of your serum.`
        ]
      },
      {
        h2: "What suppression actually costs",
        paras: [
          `${'@@EV_ESTABLISHED@@'} 5-alpha-reductase inhibitors work, in the narrow sense that they do
           what they promise to the number. In a year-long randomised placebo-controlled trial,
           dutasteride suppressed serum DHT by about 94% and finasteride by about 73% at the doses
           studied, while serum testosterone rose transiently ${cite(8)}. Dutasteride inhibits both
           isoforms; finasteride is selective for type 2, which is why one suppresses more deeply than
           the other. If your only objective is a lower DHT on a report, these drugs deliver it
           comprehensively.`,
          `${'@@EV_OFFLABEL@@'} Adding a 5-alpha-reductase inhibitor to testosterone therapy
           specifically to blunt the DHT rise is common in this community and among some clinicians who
           prescribe testosterone, but it is not an approved indication — the licensed indications are
           male pattern hair loss and benign prostatic hyperplasia. What the trial evidence says about
           the cost is genuinely mixed. A meta-analysis of randomised controlled trials found these
           drugs associated with increased sexual dysfunction overall, with pooled relative risks above
           one for erectile dysfunction and for reduced libido in men treated for prostate enlargement,
           while the same association in the hair-loss trials was smaller and did not reach statistical
           significance ${cite(9)}.`,
          `That inconsistency deserves stating rather than smoothing. A review of the same drug class
           from a urological perspective reached close to the opposite conclusion: that
           5-alpha-reductase inhibitors do not cause erectile dysfunction to a clinically significant
           degree, and that DHT is less relevant than testosterone to erectile function in the first
           place ${cite(10)}. Both readings are defensible from the published data. What they share is
           that the effect, where it exists, is a minority effect. The community claim that these drugs
           reliably destroy libido is not supported by the trials. Neither is the counter-claim that
           the risk is zero.`,
          `${'@@EV_ESTABLISHED@@'} The persistence question is where the argument gets hot, and where
           the regulatory record is clearer than the science. United States labelling for the
           finasteride product licensed for hair loss lists sexual adverse reactions — erectile
           dysfunction, libido disorders, ejaculation and orgasm disorders — reported to have continued
           after the drug was stopped, and lists depression and suicidal ideation among reported
           adverse reactions ${cite(11)}. The European Medicines Agency completed a formal review of
           finasteride- and dutasteride-containing products and required measures to minimise the risk
           of suicidal thoughts ${cite(12)}. None of that establishes causation; adding a reported
           adverse reaction to a label is not a finding of cause. Whether post-finasteride syndrome is
           a distinct clinical entity, how often it occurs, whether it persists and by what mechanism
           all remain disputed in the peer-reviewed literature ${cite(13)}.`,
          '@@SIDEFX_HIGH@@',
          `The shape of the decision is therefore this: a drug that reliably removes most of your
           circulating DHT, in exchange for a modest and contested increase in sexual and mood adverse
           effects, plus a rare, unresolved and severe tail the literature has not settled. That is a
           real trade with real numbers on both sides — not a free win, and not a catastrophe. It is
           also not a trade to make from a lab result, because the lab result cannot tell you how
           likely you are to lose hair in the first place. Take the question, the DHT value, its assay
           method and your actual scalp to the clinician who would write the prescription, monitor it
           and stop it. That is the person who has to hold both halves of the trade.`
        ]
      }
    ],
    sidefx: ["Hair shedding", "Hair shedding"],
    sources: [
      { label: "Grino PB, Griffin JE, Wilson JD. Testosterone at high concentrations interacts with the human androgen receptor similarly to dihydrotestosterone. Endocrinology 1990;126(2):1165-1172.",
        url: "https://academic.oup.com/endo/article-abstract/126/2/1165/2533187",
        note: "Direct binding data: DHT binds the human androgen receptor with about twice the affinity of testosterone and testosterone dissociates roughly five times faster, but testosterone at high concentration behaves much like DHT at the receptor." },
      { label: "Swerdloff RS, Dudley RE, Page ST, Wang C, Salameh WA. Dihydrotestosterone: Biochemistry, Physiology, and Clinical Implications of Elevated Blood Levels. Endocrine Reviews 2017;38(3):220-254.",
        url: "https://academic.oup.com/edrv/article/38/3/220/3788611",
        note: "The most complete review of what raised circulating DHT means; establishes that DHT runs at roughly a tenth of testosterone, that intracellular androgen concentrations are largely independent of circulating levels, and that modest elevations during testosterone replacement do not appear to have adverse effects on the available (limited) evidence." },
      { label: "Wang C, Shiraishi S, Leung A, Baravarian S, Hull L, Goh V, Lee PWN, Swerdloff RS. Validation of a testosterone and dihydrotestosterone liquid chromatography tandem mass spectrometry assay: interference and comparison with established methods. Steroids 2008;73(13):1345-1352.",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0039128X08001426",
        note: "Establishes that immunoassay reads DHT higher than LC-MS/MS because of interfering substances, and that collection tube chemistry alters measured testosterone and DHT." },
      { label: "Comparison of the Steady-State Pharmacokinetics, Metabolism, and Variability of a Transdermal Testosterone Patch Versus a Transdermal Testosterone Gel in Hypogonadal Men. The Journal of Sexual Medicine.",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S1743609515311565",
        note: "Head-to-head route comparison finding DHT concentrations and DHT/testosterone ratios two- to three-fold higher on the gel than on the patch." },
      { label: "AndroGel (testosterone gel) US prescribing information, US Food and Drug Administration.",
        url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2007/021015s019s020lbl.pdf",
        note: "Regulatory labelling showing DHT rising in parallel with testosterone during transdermal gel treatment, with steady-state DHT/testosterone ratios of roughly 0.23 to 0.33." },
      { label: "Bhasin S, Brito JP, Cunningham GR, et al. Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab 2018;103(5):1715-1744.",
        url: "https://academic.oup.com/jcem/article/103/5/1715/4939465",
        note: "The guideline framework for monitoring testosterone therapy: symptoms, serum testosterone, haematocrit and prostate assessment, with DHT not a routine monitoring target." },
      { label: "Urysiak-Czubatka E, Kmieć ML, Broniarczyk-Dyła G. Assessment of the usefulness of dihydrotestosterone in the diagnostics of patients with androgenetic alopecia. Postepy Dermatol Alergol 2014;31(4):207-215.",
        url: "https://pubmed.ncbi.nlm.nih.gov/25254005/",
        note: "Found no significant difference in mean serum DHT between people with androgenetic alopecia and controls, and no correlation between serum DHT and severity of hair loss." },
      { label: "Clark RV, Hermann DJ, Cunningham GR, Wilson TH, Morrill BB, Hobbs S. Marked suppression of dihydrotestosterone in men with benign prostatic hyperplasia by dutasteride, a dual 5α-reductase inhibitor. J Clin Endocrinol Metab 2004;89(5):2179-2184.",
        url: "https://academic.oup.com/jcem/article/89/5/2179/2844345",
        note: "Randomised placebo-controlled comparison quantifying serum DHT suppression at one year: approximately 94% with dutasteride and 73% with finasteride." },
      { label: "Liu L, Zhao S, Li F, et al. Effect of 5α-Reductase Inhibitors on Sexual Function: A Meta-Analysis and Systematic Review of Randomized Controlled Trials. J Sex Med 2016;13(9):1297-1310.",
        url: "https://academic.oup.com/jsm/article-abstract/13/9/1297/6940473",
        note: "Pooled randomised trial data showing increased relative risk of sexual dysfunction, erectile dysfunction and reduced libido in benign prostatic hyperplasia populations, with a weaker and non-significant association in androgenetic alopecia trials." },
      { label: "Canguven O, Burnett AL. The effect of 5α-reductase inhibitors on erectile function. J Androl 2008;29(5):514-523.",
        url: "https://onlinelibrary.wiley.com/doi/full/10.2164/jandrol.108.005025",
        note: "A review reaching the opposing conclusion — that 5-alpha-reductase inhibitors do not cause erectile dysfunction to a significant degree, and that DHT is less relevant than testosterone to erectile function." },
      { label: "PROPECIA (finasteride) tablets, US prescribing information, US Food and Drug Administration, 2022.",
        url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/020788s030lbl.pdf",
        note: "Current US labelling listing sexual adverse reactions reported to continue after discontinuation, and depression and suicidal ideation among reported adverse reactions." },
      { label: "European Medicines Agency. Finasteride- and dutasteride-containing medicinal products: Article 31 referral — measures to minimise the risk of suicidal thoughts.",
        url: "https://www.ema.europa.eu/en/documents/referral/finasteride-dutasteride-containing-medicinal-products-article-31-referral-measures-minimise-risk-suicidal-thoughts_en.pdf",
        note: "The European regulator's formal review outcome requiring risk-minimisation measures for suicidal thoughts with 5-alpha-reductase inhibitors." },
      { label: "Cilio S, et al. Post-finasteride syndrome — a true clinical entity? International Journal of Impotence Research, 2025.",
        url: "https://www.nature.com/articles/s41443-025-01025-6",
        note: "Recent peer-reviewed review showing that the existence, frequency, persistence and mechanism of post-finasteride syndrome remain actively disputed." }
    ],
    faq: [
      ["What is a normal DHT level?",
        [`A commonly quoted adult male range is 30 to 85 ng/dL, which is 300 to 850 pg/mL or 1.03 to
           2.93 nmol/L. Published ranges vary widely between laboratories — some report 11 to 95 ng/dL
           — because they depend on the assay and the reference population used to set them.`,
         `Use the interval printed on your own report. It is the only range matched to the method that
           produced your number. A generic band, including the one quoted here, is a fallback for when
           your report does not give one.`]],
      ["My DHT is high on a testosterone gel. Is that a problem?",
        [`A raised DHT and a raised DHT-to-testosterone ratio on a transdermal preparation is the
           expected pharmacology of that route rather than a sign that something has gone wrong. Skin
           is rich in 5-alpha-reductase and a gel is applied across a large area of it, so a meaningful
           share of the dose is converted on the way in. Patch-versus-gel comparisons found gel DHT and
           DHT/testosterone ratios two- to three-fold higher.`,
         `The best available review concluded that modest elevations of circulating DHT during
           testosterone replacement do not appear to cause harm, while noting that large, long,
           well-controlled trials do not exist. If the number bothers you, the variable that actually
           moves it is the route of administration, and that is a conversation with your prescribing
           clinician.`]],
      ["Does a high DHT mean I am going to lose my hair?",
        [`No. Serum DHT does not separate people with androgenetic alopecia from people without it,
           and it does not track with how advanced the hair loss is. Raised serum DHT appears in people
           with full heads of hair.`,
         `Hair loss is driven by the genetically determined sensitivity of the follicle and by local
           androgen metabolism inside the scalp, which is largely uncoupled from what is circulating.
           That is why a DHT result cannot predict who loses hair, and why a result inside the
           reference range is not protective.`]],
      ["Will finasteride or dutasteride ruin my libido?",
        [`The evidence points in both directions and it is worth knowing that honestly. A
           meta-analysis of randomised trials found an increased relative risk of erectile dysfunction
           and reduced libido in men treated for prostate enlargement, with a weaker, non-significant
           signal in the hair-loss trials. A urological review of the same class concluded the drugs do
           not cause erectile dysfunction to a clinically significant degree.`,
         `Where an effect exists it is a minority effect, and most people who take these drugs do not
           report sexual dysfunction. Regulators in the United States and Europe have added persistent
           sexual adverse reactions and psychiatric warnings to the labelling, but causality and
           persistence remain disputed. This is a genuine trade-off to work through with the clinician
           who would prescribe and monitor it.`]],
      ["Should I ask for an LC-MS/MS DHT rather than an immunoassay?",
        [`Method matters more for DHT than for most androgens, for the same reason it matters for
           estradiol in men. DHT circulates at roughly a tenth of testosterone, near the bottom of what
           immunoassays resolve, and testosterone is chemically similar enough to interfere.
           Immunoassay reads DHT higher than mass spectrometry, and the gap closes when interfering
           substances are removed by chromatography.`,
         `The practical rule is to record the method alongside every result. An immunoassay DHT and an
           LC-MS/MS DHT are not two points on the same trend line, and comparing them will manufacture
           a change that never happened.`]],
      ["How do I convert DHT between pg/mL, ng/dL and nmol/L?",
        [`Multiply pg/mL by 0.1 to get ng/dL. Multiply nmol/L by 29.04 to get ng/dL. So 450 pg/mL is
           45 ng/dL, and 2.0 nmol/L is about 58 ng/dL.`,
         `The pg/mL and ng/dL confusion is the one that causes real alarm, because a pg/mL number
           looks ten times larger than the range it is being compared against. Check the unit printed
           on the report before drawing any conclusion from the value.`]]
    ]
  },

};


/* ---- rendering ---------------------------------------------------------- */

/* A SIDEFX topic, rendered as reader copy rather than as the AI-facing note it
   is in the app. B-5 in COMPLIANCE-AUDIT.md applies: the app's entry can name a
   drug at a dose because it is answering one person inside a tool; a public page
   describes what clinicians commonly do and stops there. So `resp` is rendered
   as what is commonly done, and the block always ends with the clinician. */
function sidefxBlock(app, title) {
  const e = app.SIDEFX.find((x) => x.t === title);
  if (!e) throw new Error('no SIDEFX topic named ' + title);
  const esc = shell.esc;
  return `    <div class="sfx">
      <h3>${esc(e.t)}</h3>
      <p><strong>What drives it:</strong> ${esc(e.causes)}</p>
      <p><strong>What people report:</strong> ${esc(e.signs)}</p>
      <p><strong>What to measure:</strong> ${esc(e.labs)}</p>
      ${e.caution ? `<p class="caution"><strong>Worth knowing:</strong> ${esc(e.caution)}</p>` : ''}
      <p class="clin">Anything here is a reason to talk to the clinician who prescribes for you,
      with the result and the assay in front of you — not a reason to change a protocol on your
      own.</p>
    </div>`;
}

function sourcesList(api, sources) {
  const rows = sources.map((s, i) => `      <li id="src-${i + 1}">
        <a href="${s.url}" rel="nofollow noopener" target="_blank">${api.esc(s.label)}</a>
        ${s.note ? `<span class="src">${api.esc(s.note)}</span>` : ''}
      </li>`).join('\n');
  return [
    `    <h2>Sources</h2>`,
    `    <p>Every claim above that is not a definition is either labelled by evidence tier or
    carries a numbered reference to one of these.</p>`,
    `    <ol class="sources">\n${rows}\n    </ol>`
  ].join('\n\n');
}

function build(ctx, api) {
  const { app, attribution, W } = ctx;
  const out = [];

  for (const [key, mk] of Object.entries(MARKERS)) {
    const url = '/markers/' + mk.slug + '/';
    const widget = L.converter(ctx, mk.keys);

    const prose = mk.sections.map((sec) => [
      `    <h2>${api.esc(sec.h2)}</h2>`,
      sec.paras.map((para) => {
        if (para === '@@SIDEFX_HIGH@@') return sidefxBlock(app, mk.sidefx[0]);
        if (para === '@@SIDEFX_LOW@@') return sidefxBlock(app, mk.sidefx[1]);
        return '    <p>' + para
          .replace(/@@EV_ESTABLISHED@@/g, api.EV.established)
          .replace(/@@EV_OFFLABEL@@/g, api.EV.offlabel)
          .replace(/@@EV_THEORETICAL@@/g, api.EV.theoretical)
          .replace(/\s+/g, ' ').trim() + '</p>';
      }).join('\n')
    ].join('\n')).join('\n\n');

    /* Compounds whose monitoring panel names this marker. Links to the
       compound's half-life page where one exists. */
    const halfLifeSlugs = Object.fromEntries(
      Object.entries(require('./pages-halflife.js').PAGES).map(([id, p]) => [id, p.slug]));
    const monitored = L.monitoredBy(ctx, mk.keys[0]);
    const monitoredSection = monitored.length ? [
      `    <h2>Compounds whose monitoring panel includes this marker</h2>`,
      `    <p>Generated by matching this marker's own aliases against the monitoring note on every
      compound in the app's reference, so the list is the app's, not an author's.</p>`,
      `    <ul class="mon-list">\n` + monitored.map((d) => {
        const slug = halfLifeSlugs[d.id];
        const name = slug ? `<a href="/tools/half-life/${slug}/">${api.esc(d.name)}</a>` : api.esc(d.name);
        const mon = d.mon || d.monitoring;
        return `      <li>${name} <span class="src">${api.esc(String(Array.isArray(mon) ? mon.join('; ') : mon))}</span></li>`;
      }).join('\n') + `\n    </ul>`
    ].join('\n\n') : '';

    const sexAge = L.sexAgeTable(api, ctx, mk.keys[0]);

    const body = [
      `    <h1>${api.esc(mk.h1)}</h1>`,
      `    <p class="lede">${mk.lede.replace(/\s+/g, ' ').trim()}</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
      prose,
      `    <h2>What the app records for this marker</h2>`,
      L.factBox(api, ctx, mk.keys[0]),
      sexAge,
      widget.html,
      L.LAB_RANGE_WINS,
      monitoredSection,
      `    <h2>Questions people actually ask</h2>`,
      api.faq(mk.faq),
      sourcesList(api, mk.sources),
      shell.ctaBox(mk.slug,
        'TherapyLog logs this marker with the unit, the reference interval your report printed and ' +
        'the assay method beside it, so a trend cannot silently switch methods on you.',
        'Log your bloodwork')
    ].filter(Boolean).join('\n\n');

    out.push(api.render(ctx, {
      url,
      title: mk.title,
      description: mk.description,
      type: 'Article',
      trail: [
        { name: 'Home', url: '/', absolute: api.SITE + '/' },
        { name: 'Lab markers', url: '/markers/', absolute: api.SITE + '/markers/' },
        { name: mk.h1.split(':')[0], url, absolute: api.SITE + url }
      ],
      body,
      script: W.prologue({ attribution }) + '\n\n' + widget.fns + '\n\n' +
              `document.addEventListener('DOMContentLoaded', function () {\n  ${widget.init}\n});`
    }));
  }

  return out;
}

module.exports = { MARKERS, cite, build, sidefxBlock };
