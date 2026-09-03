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
  }

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
