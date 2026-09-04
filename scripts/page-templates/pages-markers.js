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
    description: 'Standard estradiol immunoassays are unreliable at the concentrations men run. ' +
      'What the sensitive and LC/MS-MS methods measure, how to read the number, and why a range quoted without a method is not usable.',
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
    description: 'Why two labs report different total testosterone from the same blood, what the ' +
      'reference range does with age, and how to read a result when the method is not stated.',
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
    description: 'Calculated, direct immunoassay and equilibrium dialysis free testosterone are ' +
      'three different measurements. What each one does, why they disagree, and where SHBG comes in.',
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
    description: 'Sex hormone-binding globulin decides how much of your testosterone is available. ' +
      'What raises and lowers it, why high SHBG on TRT is a common complaint, and how to read it.',
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
    description: 'Testosterone raises hematocrit. What the guideline thresholds are, why the draw ' +
      'conditions matter, and why routine blood donation trades one problem for iron deficiency.',
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
          `${'@@EV_ESTABLISHED@@'} The 2018 Endocrine Society clinical practice guideline advises
           against starting testosterone in men whose baseline hematocrit is above 50%, and
           recommends withholding therapy when hematocrit exceeds 54% until it normalises, then
           resuming at a lower dose. It sets the monitoring schedule at baseline, three to six
           months, and annually thereafter.${cite(2)}`,
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
        note: 'The 50% baseline and 54% action thresholds, and the baseline / 3–6 month / annual monitoring schedule.' },
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
    description: 'Prolactin is easy to elevate by accident and easy to over-treat. What raises it, ' +
      'why a single high value is usually repeated before anything is done, and how the units differ.',
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
    description: 'LH and FSH are the two markers that show whether your own production is running. ' +
      'What they do on testosterone therapy, what recovery looks like on paper, and why timing decides the result.',
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
    description: 'How mmol/mol converts to percent, what fasting glucose and insulin add, and why ' +
      'anything that shortens red cell lifespan — phlebotomy included — biases HbA1c low.',
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
    description: 'LDL-C measures cholesterol carried; ApoB counts the particles carrying it. Why ' +
      'they disagree, which LDL calculation your lab used, and what changes on testosterone or a GLP-1.',
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
