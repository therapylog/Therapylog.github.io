/* Per-compound authored prose for /compounds/<slug>/ (SEO-PLAN §7).
 *
 * Everything here is written for the page. Nothing in this file is lifted from
 * app.html — the facts that come from the app are pulled at build time by
 * pages-compounds.js, which is what keeps them from drifting. Rules the prose
 * follows, from SEO-PLAN §9:
 *
 *   - B-5: show the basis, describe what the literature and clinical practice
 *     do, never tell a reader what to take.
 *   - Three-tier evidence labelling on non-definitional claims, via the
 *     @@EV_ESTABLISHED@@, @@EV_OFFLABEL@@ and @@EV_THEORETICAL@@ tokens.
 *   - Every discussion of harm ends with the clinician who prescribes.
 *   - No vendor, clinic, lab or discount code, anywhere.
 *   - `basis` names sources rather than linking them: publisher URLs rot, and a
 *     title and year stays findable.
 *
 * Batch 1 of §7's rollout: ten Tier A, ten Tier B. */

module.exports = {
  tc: {
    slug: 'testosterone-cypionate',
    h1: 'Testosterone cypionate: how long it lasts, how it is dosed, and what to monitor',
    title: 'Testosterone Cypionate: Half-Life, Dosing and Monitoring | TherapyLog',
    description: 'What the cypionate ester does to the release curve, why the schedule is ' +
      'usually weekly or twice weekly, and the bloodwork that follows testosterone therapy.',
    lede: `A six-day modelled half-life, a peak two days after the injection, and a panel that
      changes in fairly predictable ways. What the ester actually does, and what the numbers on
      the follow-up bloodwork are answering.`,
    sections: [
      {
        h2: 'The ester is the whole reason the schedule works',
        paras: [
          `Testosterone cypionate is testosterone with a cyclopentylpropionate group attached at
          the 17-beta position. That group does nothing hormonal. Its job is solubility: it makes
          the molecule fat-soluble enough to sit in an oil depot in muscle or subcutaneous tissue
          and leave slowly, and it has to be cleaved off by esterases in the blood before the
          testosterone underneath can bind an androgen receptor at all. Injected testosterone
          without an ester is cleared in hours, which is why unesterified suspension has to be
          given daily and why every practical injectable protocol uses an ester.`,
          `The app models cypionate at a six-day half-life with the level peaking around 48 hours
          after an injection. Published estimates vary more than most people expect &mdash;
          figures between four and eight days appear in the literature, partly because the rate
          of release from the depot, not the clearance of testosterone itself, is what is being
          measured, and depot behaviour depends on injection volume, oil carrier and site.
          @@EV_ESTABLISHED@@ The ester chemistry and the depot mechanism are not controversial;
          the exact half-life figure is a range, and the fact box above reports the app's
          modelled value rather than a consensus.`,
          `One consequence matters more than the number. Because release is slow and continuous,
          a serum testosterone drawn at an arbitrary time says relatively little on its own. The
          same person on the same protocol will produce different totals two days after an
          injection and seven days after it. A result without a stated interval since the last
          dose is difficult to compare against anything, including their own previous result.`
        ]
      },
      {
        h2: 'Why weekly and twice-weekly schedules both exist',
        paras: [
          `At a six-day half-life, a weekly injection leaves roughly 44% of each dose still
          present when the next one arrives, so the level accumulates to somewhere near twice a
          single dose before it plateaus &mdash; about a month in. Splitting the same weekly
          amount into two injections does not change the average level at all. It changes the
          swing: half the amount, half as far to fall, so the difference between the highest and
          lowest point of the week narrows.`,
          `@@EV_OFFLABEL@@ That is the entire argument behind twice-weekly and every-other-day
          protocols, and it is a real one for people whose symptoms track the trough &mdash;
          mood, energy or libido sliding in the last two days before the next injection. It is
          also a real one for people whose estradiol climbs at the peak, since aromatisation
          scales with the substrate available. What it is not is a way to raise the average
          level, and it is not automatically better: more injections is more injections, and
          plenty of people are stable on one a week.`,
          `Subcutaneous and intramuscular administration are both in wide clinical use for
          cypionate. The subcutaneous depot releases somewhat more slowly and flattens the curve
          a little further; the practical difference for most people is the needle rather than
          the pharmacokinetics. Which of these applies to a particular person is a prescribing
          decision, and the schedule in a prescription is usually chosen from symptoms and
          trough labs rather than from a curve.`
        ]
      },
      {
        h2: 'What actually changes on the follow-up panel',
        paras: [
          `Four things move reliably, and they are the reason the monitoring panel looks the way
          it does. Luteinising hormone and FSH fall, usually to unmeasurable, because exogenous
          testosterone suppresses the hypothalamic-pituitary signal &mdash; that is expected on
          therapy rather than a finding. Haematocrit rises, sometimes substantially. Estradiol
          rises roughly in proportion to testosterone, because aromatase converts some of it.
          And SHBG usually falls, which is why free testosterone can move differently from total.`,
          `@@EV_ESTABLISHED@@ Haematocrit is the one with a threshold attached. The Endocrine
          Society's 2018 guideline recommends measuring it at baseline, again at three to six
          months, and annually after that, and evaluating a haematocrit above 54% rather than
          continuing unchanged. Different bodies quote different starting thresholds and the
          baseline figure is reported inconsistently across sources, but the withholding
          threshold is where the agreement is.`,
          `Estradiol is where the most avoidable harm happens, and the mechanism is
          straightforward: symptoms of estradiol that is too low overlap almost completely with
          symptoms of estradiol that is too high &mdash; low libido, flat mood, joint discomfort.
          Treating one as the other on symptoms alone, without a sensitive assay, is how people
          end up worse. The estradiol page covers why the assay method changes the number.`
        ]
      }
    ],
    consLede: `Reproduced from the app's own entry. This site publishes the drawback list and
      not the benefits list, on purpose: a risk you have not heard of is worth reading, and a
      benefits list under a founder's byline on an indexable page is advertising.`,
    faq: [
      ['Is cypionate different from enanthate in practice?', [
        `Chemically they differ by two carbons on the ester chain, and the app models cypionate
         at six days against enanthate's four and a half. In clinical use they are treated as
         interchangeable at equivalent amounts, and guidelines list them together. The carrier
         oil differs between products more than the esters differ from each other, and that is
         what people usually notice at the injection site.`]],
      ['When should bloodwork be drawn relative to the injection?', [
        `The pharmacokinetic answer is that it does not matter which point you pick as long as
         you pick the same one every time and write it down, because the comparison across draws
         is what carries the information. Many clinicians standardise on a trough &mdash;
         immediately before the next dose &mdash; for exactly that reason. After any change to
         the amount or the schedule, the level takes about five half-lives to settle, so roughly
         a month at this half-life; a panel drawn sooner is measuring something still moving.`]],
      ['Does testosterone therapy shut down natural production permanently?', [
        `Suppression of LH and FSH is expected and happens quickly. Recovery after stopping is
         usual but not guaranteed, and it is slower with longer duration of use and higher
         amounts. This is a genuinely consequential decision for anyone who wants biological
         children, and it belongs in a conversation with a clinician before starting rather than
         after &mdash; not in an article.`]],
      ['Why does the app record SHBG on the panel?', [
        `Because total testosterone alone can be misleading when SHBG moves. SHBG binds most
         circulating testosterone; when it falls, a stable total can sit alongside a rising free
         fraction, and when it is high, a reassuring total can sit alongside a low one. The SHBG
         page covers how the two relate and why calculated and measured free testosterone
         disagree.`]]
    ],
    basis: [
      ['Haematocrit monitoring and the 54% threshold',
        'Endocrine Society clinical practice guideline, Testosterone Therapy in Men with Hypogonadism, J Clin Endocrinol Metab, 2018'],
      ['Ester pharmacology and depot release',
        'Standard pharmacology references on esterified androgens; the modelled half-life and time to peak in the fact box are app.html’s own values'],
      ['Estradiol assay methods',
        'See the sensitive-versus-standard estradiol page on this site for the assay comparison and its sources']
    ],
    cta: `TherapyLog records the injection date, the amount and the site, so the interval between
      a dose and a lab draw is a number rather than a memory.`
  },

  te: {
    slug: 'testosterone-enanthate',
    h1: 'Testosterone enanthate: the ester, the schedule, and where it differs from cypionate',
    title: 'Testosterone Enanthate: Half-Life, Dosing and Monitoring | TherapyLog',
    description: 'A four-and-a-half-day modelled half-life, a shorter ester chain than ' +
      'cypionate, and the one formulation difference that actually shows up in practice.',
    lede: `Two carbons shorter than cypionate, modelled at a four-and-a-half-day half-life, and
      the ester behind most of the older clinical literature. What the difference is worth in
      practice, which is less than the internet suggests and more than nothing.`,
    sections: [
      {
        h2: 'Two carbons, and what they change',
        paras: [
          `Enanthate is a seven-carbon straight chain; cypionate is an eight-carbon chain closed
          into a ring. Both attach at the same position, both have to be cleaved by esterases
          before the testosterone underneath can do anything, and both create an oil depot that
          empties over days rather than hours. The shorter, less lipophilic chain leaves the
          depot slightly faster, which is the entire pharmacological difference between them.`,
          `The app models enanthate at four and a half days against cypionate's six. Published
          figures for both esters scatter widely &mdash; you will find enanthate quoted anywhere
          from four to eight days depending on the study, the assay and whether the authors were
          measuring depot release or terminal elimination. @@EV_ESTABLISHED@@ The direction of
          the difference is consistent across sources; the size of it is not, and any page that
          gives you a single confident number for either ester is rounding off a real
          disagreement.`,
          `In clinical practice the two are treated as interchangeable at equivalent amounts, and
          major guidelines list them together rather than distinguishing between them. What
          differs more reliably than the ester is the product: the carrier oil, the concentration
          and the preservative vary between manufacturers, and those are what people actually
          notice as injection-site soreness. Sesame oil, cottonseed oil and grapeseed oil behave
          differently in tissue and some people react to one and not another.`
        ]
      },
      {
        h2: 'Enanthate is the ester in the auto-injector',
        paras: [
          `One practical difference is worth knowing because it changes how the drug is
          administered rather than how it behaves. Enanthate is the ester in the
          subcutaneous auto-injector formulation approved in the United States for weekly
          self-administration &mdash; a fixed-dose device rather than a vial and a syringe.
          @@EV_ESTABLISHED@@ That is an approved route with its own labelling, not an off-label
          adaptation, and it exists for enanthate rather than cypionate.`,
          `That matters for anyone comparing protocols across sources, because a weekly
          subcutaneous enanthate schedule and a weekly intramuscular cypionate schedule are
          often discussed as though the difference were the ester. Usually it is the route and
          the device. Subcutaneous depots release a little more slowly than intramuscular ones
          and produce a slightly flatter curve, and that difference is larger than the
          difference between the two esters.`
        ]
      },
      {
        h2: 'Everything downstream is the same',
        paras: [
          `Because both esters release the same molecule, the monitoring panel does not change
          and neither do the trade-offs. Luteinising hormone and FSH are suppressed. Haematocrit
          rises and is the finding with a published threshold attached to it. Estradiol tracks
          testosterone through aromatase. SHBG usually falls, which is why free and total
          testosterone can move in different directions on the same report.`,
          `The one place the shorter half-life is worth thinking about is the interval between
          the last dose and the blood draw. At four and a half days, a weekly schedule sits at
          about 1.6 half-lives per interval, so the fall from peak to trough is steeper than
          cypionate's at the same cadence. A draw taken two days after an injection and one
          taken six days after it are further apart here than they would be on the longer ester,
          which makes a recorded draw time more useful rather than less.`,
          `Time to steady state is shorter too: roughly three weeks against cypionate's month,
          because it is five half-lives either way. After a change to the amount or the schedule,
          a panel drawn before that is measuring a level still moving, and reading it as the new
          baseline is the most common way people end up chasing a number that was never
          settled.`
        ]
      }
    ],
    consLede: `From the app's own entry, and short because enanthate's drawbacks are testosterone's
      drawbacks. This site publishes the drawback list and not the benefits list on every one of
      these pages, deliberately.`,
    faq: [
      ['Is enanthate weaker than cypionate?', [
        `No. Both deliver testosterone; the ester is a delivery mechanism, not an activity
         modifier. Because the ester itself is a slightly different fraction of the total
         molecular weight, an identical milligram amount of the two contains a marginally
         different amount of testosterone &mdash; on the order of a couple of percent, which is
         far inside the variation between two draws on the same protocol.`]],
      ['Can someone switch between the esters?', [
        `They are treated as interchangeable in clinical practice and guidelines list them
         together, so a switch is not usually treated as a new protocol. Whether it makes sense
         for a particular person, and at what amount, is a prescribing decision. What is worth
         doing around any switch is holding the schedule and the draw timing constant so that
         the next panel is comparable to the last one.`]],
      ['Why do the app and this page give different half-lives to enanthate?', [
        `The fact box on this page reports the app's modelled value, which is what the app's
         curves are drawn from. Its written description elsewhere quotes a longer figure, and
         that inconsistency is real rather than a typo &mdash; published estimates genuinely
         range from about four to about eight days. This page uses the modelled number and says
         plainly that it is one point in a range.`]],
      ['Does the injection site change the result?', [
        `It changes the release rate somewhat. Subcutaneous depots empty more slowly than
         intramuscular ones, and a larger volume in one site behaves differently from the same
         amount split between two. This is one reason a level drawn without a recorded site,
         route and interval is hard to compare against the previous one, and why the app records
         all three with the dose.`]]
    ],
    basis: [
      ['Interchangeability of the esters in clinical use',
        'Endocrine Society clinical practice guideline, Testosterone Therapy in Men with Hypogonadism, J Clin Endocrinol Metab, 2018'],
      ['Weekly subcutaneous auto-injector route',
        'US prescribing information for the testosterone enanthate subcutaneous auto-injector; the route is approved, the product is not named or linked here'],
      ['Modelled half-life and time to peak',
        'app.html’s own TL_PK entry, which is what the curves on this site are drawn from']
    ],
    cta: `Switching esters or routes is exactly the kind of change that makes an old lab result
      incomparable. TherapyLog keeps the ester, the route and the site with every dose.`
  },

  sema: {
    slug: 'semaglutide',
    h1: 'Semaglutide: what it does, how it is titrated, and what to watch',
    title: 'Semaglutide: Mechanism, Titration and Monitoring | TherapyLog',
    description: 'The GLP-1 receptor agonist behind the STEP and SELECT trials — mechanism, ' +
      'why titration is measured in four-week steps, and what the follow-up panel looks for.',
    lede: `A GLP-1 receptor agonist engineered to survive for a week in a body that clears the
      natural hormone in minutes. What that engineering did, what the trials measured, and the
      two things worth monitoring that are not the number on the scale.`,
    sections: [
      {
        h2: 'A hormone with its half-life problem solved',
        paras: [
          `Native glucagon-like peptide-1 is released from the gut after a meal, and it is
          destroyed almost immediately &mdash; the enzyme DPP-4 dismantles it within about two
          minutes. Semaglutide is that hormone with three changes: a substitution at position 8
          that DPP-4 cannot cut, a fatty-acid side chain that binds it tightly to circulating
          albumin, and a linker holding the two together. The albumin binding is the important
          one. Bound drug is not filtered by the kidney and is not available for degradation, so
          it acts as a reservoir that releases slowly.`,
          `@@EV_ESTABLISHED@@ The result is a molecule with a roughly one-week half-life doing
          the job of one with a two-minute half-life. Its effects are the natural hormone's,
          amplified and sustained: it slows gastric emptying, increases glucose-dependent insulin
          secretion, suppresses glucagon, and acts on hypothalamic circuits that regulate
          appetite and food reward. The appetite effect is central rather than gastric, which is
          why it does not simply feel like a full stomach.`
        ]
      },
      {
        h2: 'What the trials actually measured',
        paras: [
          `@@EV_ESTABLISHED@@ In the STEP 1 trial, published in 2021, adults without diabetes
          taking 2.4 mg weekly alongside lifestyle intervention lost about 15% of body weight
          over 68 weeks against roughly 2.4% on placebo. In SELECT, published in 2023, adults
          with established cardiovascular disease and overweight or obesity but without diabetes
          had roughly a 20% relative reduction in major adverse cardiovascular events. SELECT is
          the more consequential of the two, because it measured events rather than a surrogate.`,
          `Two caveats travel with those numbers and rarely travel with the headlines. Both are
          averages across a distribution that includes people who lost very little. And both were
          measured on continued treatment: STEP 4 examined what happens after withdrawal and
          found that most of the lost weight returns over the following year. Framing the drug as
          a course of treatment with an end date is not what the evidence supports; framing it as
          ongoing is.`,
          `@@EV_OFFLABEL@@ The muscle question is genuine and under-discussed. Weight lost on
          any large caloric deficit includes lean mass, and the trials measured weight rather
          than composition in most cases. This is the basis for the widespread practice of
          pairing GLP-1 treatment with resistance training and adequate protein, which is
          sensible and not the same thing as proven &mdash; the evidence for it is inference
          from body-composition principles rather than a trial of the combination.`
        ]
      },
      {
        h2: 'Why titration is in four-week steps',
        paras: [
          `The titration schedule is not caution for its own sake; it is pharmacokinetics. At a
          one-week half-life the level roughly doubles from the first dose to steady state, and
          it takes about five weeks to get there. A step taken sooner than that raises the amount
          before the previous step has finished arriving, which is how people end up with
          nausea they attribute to the new amount when it was the old one still accumulating.`,
          `Gastrointestinal effects &mdash; nausea, vomiting, diarrhoea, constipation &mdash; are
          the dominant adverse effects and are worst during titration steps. They are usually
          transient. Slower titration is the standard response, and stepping back down is a
          normal part of the process rather than a failure of it. Anything severe, persistent, or
          accompanied by significant abdominal pain is a reason to contact the prescriber rather
          than to wait it out.`
        ]
      }
    ],
    consLede: `From the app's own entry. Worth reading alongside the trial results above rather
      than after them: the same trials that produced the efficacy figures are where most of these
      came from.`,
    faq: [
      ['How long does it take to leave the system after stopping?', [
        `At a one-week half-life, most of a dose is gone in about five weeks and effectively all
         of it in six or seven. Appetite returns over that period rather than the day after the
         last injection, which is why people describe the change as gradual. The
         <a href="/tools/half-life/semaglutide/">half-life page</a> has the curve.`]],
      ['Is compounded semaglutide the same drug?', [
        `It is not the same product, and this page will not tell you it is. A compounded
         preparation has not been through the manufacturing and testing that produced the
         approved product, and identity, purity and concentration are only as good as the
         compounder's own controls. This site names no pharmacy, vendor or testing service, and
         whether a compounded preparation is appropriate is a question for a prescriber, not a
         page.`]],
      ['What does the monitoring panel actually look for?', [
        `Glycaemic markers to see whether the metabolic effect is happening, lipids because they
         usually improve, and amylase or lipase only if there is abdominal pain suggesting
         pancreatitis. Weight and, ideally, some measure of body composition, because weight
         alone cannot tell you what was lost. The app's own panel for this compound is in the
         monitoring section above.`]],
      ['Does it interact with testosterone therapy?', [
        `The app records a rule about the combination, and it is in the interactions section on
         this page. The concern is not a pharmacological interaction between the two drugs but
         the muscle-preservation question above. Whether any combination applies to a particular
         person is a prescribing decision.`]]
    ],
    basis: [
      ['15% mean weight reduction at 68 weeks',
        'STEP 1 trial, Once-Weekly Semaglutide in Adults with Overweight or Obesity, N Engl J Med, 2021'],
      ['Cardiovascular event reduction',
        'SELECT trial, Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes, N Engl J Med, 2023'],
      ['Weight regain after withdrawal',
        'STEP 4 trial, Effect of Continued Weekly Subcutaneous Semaglutide vs Placebo on Weight Loss Maintenance, JAMA, 2021'],
      ['Half-life and albumin binding',
        'The modelled half-life in the fact box is app.html’s own value; the albumin-binding mechanism is from the molecule’s published design papers']
    ],
    cta: `Titration steps, the dates they happened on and how the side effects tracked them are
      exactly what a log is for. TherapyLog records the amount and the date together.`
  },

  tirz: {
    slug: 'tirzepatide',
    h1: 'Tirzepatide: two receptors, one peptide, and what that changes',
    title: 'Tirzepatide: Mechanism, Titration and Monitoring | TherapyLog',
    description: 'A single peptide acting at both the GIP and GLP-1 receptors — what the ' +
      'dual mechanism adds, what SURMOUNT-1 measured, and how the titration is paced.',
    lede: `One molecule that binds two incretin receptors rather than one. What the GIP arm
      contributes, why the trial results sit above semaglutide's, and the parts of the panel that
      are not the scale.`,
    sections: [
      {
        h2: 'The GIP receptor is the part that is new',
        paras: [
          `Tirzepatide is a single 39-amino-acid peptide that activates both the GLP-1 receptor
          and the receptor for glucose-dependent insulinotropic polypeptide, the other major
          incretin hormone. Like semaglutide it carries a fatty-acid chain that binds albumin and
          buys it a multi-day half-life. Unlike semaglutide it is not a modified GLP-1 at all:
          the backbone is derived from GIP and engineered to also fit the GLP-1 receptor, which
          is why it is described as an imbalanced dual agonist rather than two drugs in one.`,
          `@@EV_ESTABLISHED@@ What GIP agonism adds is still being worked out, which is
          genuinely interesting rather than a hedge. GIP receptor agonism and GIP receptor
          antagonism have both produced weight loss in models, which should not be possible if
          the mechanism were simply additive. The leading explanations involve central GIP
          receptor signalling affecting food intake and nausea, and effects on adipose tissue
          nutrient handling. The clinical results are not in doubt; the mechanism behind them
          partly is.`
        ]
      },
      {
        h2: 'What SURMOUNT-1 measured',
        paras: [
          `@@EV_ESTABLISHED@@ In SURMOUNT-1, published in 2022, adults with obesity and without
          diabetes lost roughly 15%, 19.5% and 21% of body weight at 5 mg, 10 mg and 15 mg weekly
          over 72 weeks, against about 3% on placebo. The dose response is the notable part: it
          did not flatten across the range tested, which is unusual and is why the highest
          approved amount is where it is.`,
          `The trial programme for the diabetes indication reported reductions in HbA1c that
          exceeded the comparators it was tested against. As with semaglutide, these are means
          across a wide distribution, they were measured on continued treatment, and weight
          rather than body composition was the primary endpoint in most arms.`,
          `@@EV_OFFLABEL@@ Comparisons between tirzepatide and semaglutide are usually made
          across separate trials with different populations and durations, which is weak
          evidence for a ranking even when the gap looks large. A head-to-head trial in adults
          with obesity has since been run and reported greater weight reduction with tirzepatide.
          That is a stronger basis for the comparison than the cross-trial arithmetic most
          articles use, and it still says nothing about which is right for a particular person.`
        ]
      },
      {
        h2: 'Titration, tolerance and the parts of the panel that matter',
        paras: [
          `The modelled half-life is five days against semaglutide's seven, so the level plateaus
          a little sooner &mdash; three to four weeks rather than five &mdash; and swings
          slightly more between weekly injections. The four-week titration interval exists for
          the same reason it does with semaglutide: stepping up before the previous step has
          finished accumulating attributes to the new amount what the old one was still doing.`,
          `Gastrointestinal effects dominate and follow the titration steps. The monitoring panel
          the app records is glycaemic and lipid markers plus body composition, and the
          composition part is the one people skip. Weight alone cannot distinguish a good outcome
          from a bad one at this rate of loss, which is the whole argument for measuring lean
          mass rather than inferring it.`,
          `Anything severe or persistent &mdash; intractable vomiting, dehydration, sustained
          abdominal pain radiating to the back &mdash; is a reason to contact the prescriber
          rather than to adjust the schedule independently. That is true of the whole class and
          it is the point at which a page like this one stops being useful.`
        ]
      }
    ],
    consLede: `From the app's own entry. Most of these came out of the same trial programme as the
      efficacy figures above, which is the useful thing about drug data that reached a regulator.`,
    faq: [
      ['Is tirzepatide simply a stronger semaglutide?', [
        `Not mechanistically. It acts at a receptor semaglutide does not touch, its backbone comes
         from a different hormone, and its half-life is shorter. The trial results are larger, and
         a head-to-head trial supports that ordering, but "stronger version of the same thing" is
         not an accurate description of the pharmacology.`]],
      ['How long before it is out of the system?', [
        `About five half-lives, so roughly three and a half to four weeks at the modelled figure.
         The <a href="/tools/half-life/tirzepatide/">half-life page</a> has the curve and the
         accumulation arithmetic.`]],
      ['What happens to weight after stopping?', [
        `The withdrawal data for this class consistently shows substantial regain over the
         following year without continued treatment. That is a reason to think about the decision
         to start as a long-term one, and a reason to have the conversation about stopping with a
         prescriber rather than simply running out.`]],
      ['Why does the app record body composition rather than just weight?', [
        `Because at this rate of loss the composition of what is lost is the outcome that matters
         and weight cannot report it. A DEXA scan or a consistent bioimpedance measurement taken
         the same way each time gives you a trend; the scale gives you a number that two very
         different outcomes can produce.`]]
    ],
    basis: [
      ['15% to 21% weight reduction at 72 weeks',
        'SURMOUNT-1 trial, Tirzepatide Once Weekly for the Treatment of Obesity, N Engl J Med, 2022'],
      ['Head-to-head comparison with semaglutide',
        'SURMOUNT-5 trial, reported 2025'],
      ['Dual GIP and GLP-1 receptor agonism',
        'The molecule’s published pharmacology; the modelled half-life and time to peak in the fact box are app.html’s own values']
    ],
    cta: `Four-week titration steps are easy to lose track of. TherapyLog dates each one and keeps
      it beside the bloodwork that followed.`
  },

  metformin: {
    slug: 'metformin',
    h1: 'Metformin: how it works, why the longevity interest, and what it depletes',
    title: 'Metformin: Mechanism, Dosing Patterns and Monitoring | TherapyLog',
    description: 'The biguanide behind most metabolic protocols — hepatic glucose output, ' +
      'AMPK, the B12 problem, the renal limit, and where the longevity evidence actually is.',
    lede: `Sixty years of use, one of the best-characterised safety profiles in medicine, and a
      second life as a longevity candidate on evidence that is thinner than its reputation
      suggests. What it does, and the two monitoring items that are genuinely non-optional.`,
    sections: [
      {
        h2: 'What it does, and where it does it',
        paras: [
          `@@EV_ESTABLISHED@@ Metformin's dominant effect is on the liver: it suppresses hepatic
          gluconeogenesis, which is the process that keeps blood glucose up between meals and
          which runs inappropriately high in type 2 diabetes. It does this largely without
          stimulating insulin secretion, which is why it does not cause hypoglycaemia on its own.
          Secondary effects include improved peripheral insulin sensitivity and altered gut
          glucose handling &mdash; the gut contribution is larger than was appreciated for
          decades and is part of why the extended-release formulation works despite lower peak
          concentrations.`,
          `The mechanism at the molecular level is usually given as AMPK activation, and that is
          part of it, but the fuller account is inhibition of mitochondrial complex I, which
          raises the cell's AMP-to-ATP ratio and activates AMPK as a consequence. AMPK-independent
          effects on hepatic glucose production have also been demonstrated. The short version
          &mdash; "it activates AMPK" &mdash; is the one that circulates, and it is a simplification
          of an incompletely settled question.`,
          `Its half-life is short: the app models six hours, with the peak about two and a half
          hours after an immediate-release dose. That is why it is taken with meals two or three
          times a day in the immediate-release form, and why the extended-release version exists
          at all.`
        ]
      },
      {
        h2: 'The longevity case, stated accurately',
        paras: [
          `@@EV_OFFLABEL@@ The interest comes from observational work: cohorts of people with
          diabetes taking metformin appeared to have mortality closer to non-diabetic controls
          than to diabetic controls on other treatments. That is a striking observation and it is
          also the kind of comparison most vulnerable to confounding, because metformin is
          prescribed to people at an earlier and healthier stage of disease than the drugs it was
          compared against.`,
          `@@EV_THEORETICAL@@ The TAME trial was designed to test the question directly in people
          without diabetes, with agreement from the FDA on a composite ageing-related endpoint
          &mdash; a regulatory first that is often mis-reported as approval of an indication. Its
          funding history has been difficult and it has not reported. Until it does, the honest
          summary is that metformin's longevity case rests on animal data, mechanism and
          confounded observational comparisons, which is a reasonable basis for interest and not
          a basis for confidence.`,
          `@@EV_THEORETICAL@@ The exercise question cuts the other way and deserves mention.
          Several controlled trials have found that metformin blunts some of the adaptations to
          resistance and aerobic training in older adults; others have not. The finding is
          unresolved rather than established, and it is directly relevant to anyone taking it
          alongside a training programme.`
        ]
      },
      {
        h2: 'The two things that are not optional',
        paras: [
          `Vitamin B12 depletion is real, dose-related and cumulative over years, and it can
          present as a peripheral neuropathy that is easy to attribute to diabetes itself.
          @@EV_ESTABLISHED@@ Periodic B12 measurement is standard in the guidance for long-term
          use, and the app records it on the monitoring panel for exactly this reason. It is the
          single most commonly skipped item on a metformin panel.`,
          `Renal function is the other. Metformin is cleared by the kidney and does not undergo
          hepatic metabolism, so impaired clearance raises the level. Lactic acidosis &mdash; the
          serious adverse effect &mdash; is rare, and it is overwhelmingly associated with
          significant renal impairment, acute illness or contrast procedures rather than with
          ordinary use. This is why eGFR appears on the panel and why prescribing information
          carries thresholds below which it is reduced or stopped.`,
          `Gastrointestinal intolerance is the common reason people stop, and it is substantially
          formulation-dependent: the extended-release form is better tolerated at the same daily
          amount. Any of this that you are experiencing belongs with the clinician who prescribes
          it &mdash; the dose, the formulation and the decision to continue are all theirs to
          make with your kidney function in front of them.`
        ]
      }
    ],
    consLede: `From the app's own entry, and unusually well-founded for a compound page: metformin
      has been prescribed at scale for six decades, so its drawback list is drawn from evidence
      rather than from case reports.`,
    faq: [
      ['Does metformin work in people without diabetes?', [
        `It lowers hepatic glucose output regardless, and it produces modest improvements in
         insulin sensitivity in people with insulin resistance short of diabetes. Whether that
         translates into the outcomes the longevity interest is about is exactly the open
         question TAME was designed to answer. It requires a prescription and the decision is a
         clinician's.`]],
      ['Immediate-release or extended-release?', [
        `The extended-release form produces lower peak concentrations and is consistently better
         tolerated for gastrointestinal effects at the same daily amount, which is why it is
         usually preferred when tolerance is the limiting factor. Both are on the app's dosing
         rows above. Which one, and how much, is a prescribing decision.`]],
      ['How long until anything shows up on bloodwork?', [
        `Fasting glucose responds within days to weeks. HbA1c reflects roughly the preceding three
         months of glycaemia, so a panel drawn earlier than about eight weeks after a change is
         reporting mostly the old state. The <a href="/markers/hba1c-and-fasting-glucose/">HbA1c
         page</a> covers why the two markers disagree and what that disagreement means.`]],
      ['Should B12 be supplemented preventively?', [
        `Preventive supplementation is widely practised and is what the app's own protocol note
         describes. Measuring rather than assuming is the more informative version, because a
         normal B12 with a rising methylmalonic acid is the early picture and a supplement taken
         blindly hides it. Either way this is a conversation with the prescriber.`]]
    ],
    basis: [
      ['Hepatic gluconeogenesis and complex I inhibition',
        'Standard clinical pharmacology references; the AMPK-versus-complex-I account is drawn from the mechanistic literature of the last two decades'],
      ['B12 depletion with long-term use',
        'Reported consistently since the 1970s and reflected in current diabetes standards-of-care guidance'],
      ['TAME trial design and FDA endpoint agreement',
        'Targeting Aging with Metformin, described in the trial design literature from 2016 onward; not yet reported'],
      ['Blunted training adaptation',
        'Randomised trials in older adults published from 2019 onward, with conflicting results']
    ],
    cta: `A compound taken daily for years is the one where a log earns its keep — the B12 draw,
      the eGFR, the date the formulation changed.`
  },

  rapamycin: {
    slug: 'rapamycin',
    h1: 'Rapamycin: mTOR, weekly dosing, and what the evidence does and does not show',
    title: 'Rapamycin: mTOR Inhibition, Dosing Patterns and Monitoring | TherapyLog',
    description: 'An approved immunosuppressant used off-label at weekly intervals for ' +
      'longevity — the mTORC1 rationale, the animal evidence, and what the human data covers.',
    lede: `An approved transplant drug with the most consistent lifespan-extension record of any
      molecule in animal studies, used off-label at a fraction of the transplant amount and a
      seventh of the frequency. What the weekly interval is trying to achieve, and where the
      human evidence stops.`,
    sections: [
      {
        h2: 'Two complexes, and why the interval is the whole design',
        paras: [
          `mTOR is a kinase that sits at the centre of the cell's decision about whether to grow
          or to recycle. It exists in two complexes. mTORC1 senses amino acids, energy and growth
          factors and drives protein synthesis while suppressing autophagy; mTORC2 is involved in
          insulin signalling and cytoskeletal organisation. Rapamycin inhibits mTORC1 acutely and
          selectively. It inhibits mTORC2 only with sustained exposure &mdash; and mTORC2
          inhibition is where the glucose intolerance and much of the immunosuppression come
          from.`,
          `@@EV_OFFLABEL@@ That distinction is the entire argument for weekly rather than daily
          administration. The modelled half-life is about two and a half days, so a weekly
          interval allows the level to fall substantially between doses, which is intended to
          give intermittent mTORC1 inhibition without the sustained exposure that engages mTORC2.
          Whether that separation holds cleanly in humans at the amounts used is inference from
          cell and animal work rather than something demonstrated in a human trial. It is a
          well-reasoned protocol built on an incompletely tested premise, and it should be
          described that way.`
        ]
      },
      {
        h2: 'What the animal evidence shows, and what human data exists',
        paras: [
          `@@EV_ESTABLISHED@@ The animal record is unusually strong. The National Institute on
          Aging's Interventions Testing Program &mdash; a multi-site programme designed
          specifically to weed out results that do not replicate &mdash; found rapamycin extended
          median and maximum lifespan in genetically heterogeneous mice, and did so when started
          at 600 days of age, which is roughly late middle age. Lifespan extension has since been
          reproduced in yeast, worms, flies and mice. Very few interventions have that record.`,
          `@@EV_THEORETICAL@@ Human evidence for the longevity use is another matter. A small
          randomised trial of an mTOR inhibitor in older adults reported improved response to
          influenza vaccination, which is a measure of immune ageing rather than of lifespan. A
          placebo-controlled trial of weekly rapamycin in healthy adults has reported on safety
          and self-reported outcomes over a year. Dogs are being studied in an ongoing programme.
          None of that is a lifespan result in humans, and no such result exists.`,
          `The honest summary is that the mechanism is real, the animal data is the best in the
          field, the human data covers safety and surrogate markers over months rather than
          outcomes over decades, and the gap between those two statements is where all the
          uncertainty lives.`
        ]
      },
      {
        h2: 'The adverse effects that actually turn up',
        paras: [
          `Aphthous ulcers &mdash; mouth sores &mdash; are the most common complaint at
          intermittent amounts and are usually the first sign that the amount is too high for
          that person. Lipid elevation, particularly triglycerides, is well documented at
          transplant amounts and is reported at intermittent ones. Glucose intolerance is the
          effect most closely tied to sustained exposure and is the reason fasting glucose is on
          the panel.`,
          `Impaired wound healing and immunosuppression are the two that change what someone
          should do rather than what they should watch. Both are dose- and exposure-dependent,
          both are established at transplant amounts, and both are reasons the timing of any
          planned surgery, dental procedure or live vaccine is a conversation to have in advance
          rather than afterwards. Rapamycin also has substantial interactions through CYP3A4 and
          P-glycoprotein &mdash; grapefruit, several antifungals and several antibiotics among
          them &mdash; which is one of the clearer cases for a prescriber holding the whole
          medication list.`,
          `None of this is a page's decision to make. Rapamycin requires a prescription, the
          off-label use is genuinely off-label, and the person weighing an ulcer or a lipid panel
          against the reason someone started should be the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app's own entry, and note that it mixes transplant-dose effects with
      intermittent-dose ones. That distinction matters more here than on most compounds: several
      of these are established at daily transplant amounts and are the specific thing weekly
      administration is designed to avoid.`,
    faq: [
      ['Why weekly rather than daily?', [
        `To let the level fall far enough between doses that mTORC2 is not sustainedly inhibited,
         while still inhibiting mTORC1 periodically. That is the rationale. It rests on the
         differential sensitivity of the two complexes, which is established in cells, and on the
         assumption that a weekly interval achieves the separation in people, which is not
         directly demonstrated.`]],
      ['Is rapamycin the same as sirolimus?', [
        `Yes — sirolimus is the generic name and rapamycin the original. Everolimus is a related
         but distinct molecule with a shorter half-life, and results from one do not transfer
         automatically to the other.`]],
      ['How long does one dose last?', [
        `The app models a half-life of about two and a half days, so roughly five days for most of
         a dose to clear and about twelve for it to be effectively gone. The curve on this page is
         drawn with the app's own function; the
         <a href="/tools/half-life-calculator/">half-life calculator</a> will run other
         intervals.`]],
      ['What does the monitoring panel look for?', [
        `Fasting glucose and lipids because those are the metabolic effects, a complete blood
         count because immunosuppression shows up there, and a deliberate check for mouth sores
         and wound healing because those are the early clinical signals. The app's panel is in
         the monitoring section above.`]]
    ],
    basis: [
      ['Lifespan extension in mice started in late life',
        'NIA Interventions Testing Program, Rapamycin fed late in life extends lifespan in genetically heterogeneous mice, Nature, 2009'],
      ['Improved vaccination response in older adults',
        'Trial of an mTOR inhibitor on immune function in the elderly, Science Translational Medicine, 2014'],
      ['Placebo-controlled weekly dosing in healthy adults',
        'PEARL trial, reported 2024'],
      ['mTORC1 versus mTORC2 sensitivity',
        'Cell-biology literature on differential complex sensitivity to rapamycin; the weekly interval is an inference from it, not a finding of it']
    ],
    cta: `Weekly dosing with a two-and-a-half-day half-life makes the date of the last dose the
      most important number on the page. TherapyLog keeps it.`
  },

  ai1: {
    slug: 'anastrozole',
    h1: 'Anastrozole: aromatase inhibition, and why over-suppression is the failure mode',
    title: 'Anastrozole: Aromatase Inhibition, Dosing and Monitoring | TherapyLog',
    description: 'How anastrozole blocks estradiol synthesis, why low-estradiol symptoms look ' +
      'like high-estradiol symptoms, and why the sensitive assay is the whole game.',
    lede: `A competitive aromatase inhibitor with a two-day half-life, approved in oncology and
      used off-label in hormone therapy. The pharmacology is simple; the reason it goes wrong is
      that the symptoms it is used to treat and the symptoms it causes are the same symptoms.`,
    sections: [
      {
        h2: 'What it blocks, and how completely',
        paras: [
          `Aromatase is the enzyme that converts androgens to oestrogens &mdash; testosterone to
          estradiol, androstenedione to estrone. It is expressed in adipose tissue, bone, brain,
          and the gonads, which is why estradiol in men is not a gonadal product so much as a
          peripheral one. @@EV_ESTABLISHED@@ Anastrozole is a non-steroidal competitive inhibitor
          of that enzyme, and at oncology amounts it suppresses whole-body estradiol production by
          more than 90%.`,
          `That potency is the source of the problem. The amounts used in oncology were chosen to
          suppress estradiol as completely as possible in postmenopausal women with
          hormone-receptor-positive breast cancer, where estradiol is the thing driving the
          disease. Nothing about that goal transfers to a man on hormone therapy whose estradiol
          is a necessary hormone that has risen more than he wants. The amounts described in the
          app's rows are a small fraction of the oncology amount for exactly this reason.`,
          `The modelled half-life is about two days, so an every-third-day schedule leaves
          substantial carry-over between doses and the level accumulates for roughly ten days
          before it settles. A change assessed sooner than that is being assessed before it has
          finished happening &mdash; which is one of the more common ways people end up
          over-suppressed.`
        ]
      },
      {
        h2: 'Estradiol is not a side effect to be minimised',
        paras: [
          `@@EV_ESTABLISHED@@ In men, estradiol is required for bone mineralisation, and the
          clearest human evidence for that comes from the rare cases of aromatase deficiency and
          oestrogen-receptor mutation, where men present with unfused epiphyses and osteopenia
          despite normal testosterone. Estradiol also contributes materially to libido, to
          erectile function and to lipid handling. Suppressing it toward zero is not a
          conservative choice.`,
          `@@EV_OFFLABEL@@ The clinically important fact for anyone using it is symptom overlap.
          Low libido, flat mood, joint aches and poor erections are reported both when estradiol
          is high relative to testosterone and when it is too low. Someone who feels poorly,
          assumes high estradiol, takes more of an aromatase inhibitor and feels worse has
          produced exactly the outcome the drug was meant to prevent, and the only thing that
          distinguishes the two states is a measurement.`,
          `That measurement has to be the right one. Standard immunoassay estradiol was designed
          for the concentrations found in women and is unreliable at male concentrations, where
          cross-reacting steroids can inflate the result. The
          <a href="/markers/estradiol-sensitive-vs-standard/">sensitive-versus-standard estradiol
          page</a> covers why the two methods disagree and by how much.`
        ]
      },
      {
        h2: 'Where the practice is heading',
        paras: [
          `@@EV_OFFLABEL@@ Prophylactic use &mdash; starting an aromatase inhibitor at the same
          time as testosterone, before any measurement &mdash; has moved from common to
          discouraged in most published discussion of hormone therapy over the last decade. The
          reasoning is that most people on physiological amounts do not develop symptomatic
          estradiol elevation, that the symptom overlap makes self-assessment unreliable, and
          that the bone and lipid consequences of over-suppression accrue silently.`,
          `The alternatives are worth knowing because they are often not mentioned. Reducing the
          amount of testosterone, or splitting it across more frequent smaller injections, lowers
          the substrate available for aromatisation and is a first-line adjustment in many
          protocols. Body composition matters too, since adipose tissue is where much of the
          conversion happens. An aromatase inhibitor is one option among several rather than the
          default response to a number.`,
          `All of that is a prescribing conversation. This page describes what the literature and
          clinical practice do; it does not tell anyone with a particular estradiol result to take
          a particular amount, and anyone experiencing the effects described here should be
          raising them with the clinician who prescribes for them.`
        ]
      }
    ],
    consLede: `From the app's own entry. Note how many of these are consequences of the drug
      working too well rather than of it failing — that is unusual, and it is the single most
      useful thing to understand about this compound.`,
    faq: [
      ['Does everyone on testosterone therapy need an aromatase inhibitor?', [
        `No, and the direction of practice has been away from routine use. Most people on
         physiological amounts do not develop symptomatic estradiol elevation. Whether a
         particular person needs one is a decision made from a sensitive-assay measurement and
         symptoms together, by a prescriber.`]],
      ['How long before a change shows on labs?', [
        `At a two-day half-life the level takes about ten days to settle after a change, and
         estradiol itself then needs time to re-equilibrate. Drawing sooner measures a system
         still moving. Most protocols reassess at around six weeks, which also allows symptoms to
         declare themselves.`]],
      ['Is anastrozole interchangeable with exemestane?', [
        `They inhibit the same enzyme by different means — anastrozole competitively and
         reversibly, exemestane by irreversible inactivation — and their half-lives and metabolic
         profiles differ. They are not dose-equivalent and results with one do not transfer to
         the other.`]],
      ['What does over-suppression look like on a panel?', [
        `A sensitive-assay estradiol below the lower reference limit, often alongside joint
         discomfort, low libido and low mood that started after the inhibitor rather than before
         it. The temporal relationship is the informative part, which is the argument for
         recording when a change was made rather than reconstructing it later.`]]
    ],
    basis: [
      ['Oestrogen’s role in male bone mineralisation',
        'Case reports of aromatase deficiency and oestrogen-receptor mutation in men, N Engl J Med, 1994 and subsequent literature'],
      ['Suppression achieved at oncology amounts',
        'Anastrozole prescribing information and the oncology pharmacology literature'],
      ['Direction of practice on prophylactic use',
        'Endocrine Society clinical practice guideline, Testosterone Therapy in Men with Hypogonadism, J Clin Endocrinol Metab, 2018, and subsequent commentary'],
      ['Assay disagreement at male concentrations',
        'See the sensitive-versus-standard estradiol page on this site for the method comparison and its sources']
    ],
    cta: `The date an aromatase inhibitor started or changed is what makes the next estradiol
      result readable. TherapyLog records it with the dose.`
  },

  hcg2: {
    slug: 'hcg',
    h1: 'HCG: an LH substitute with a much longer half-life, and what it is actually for',
    title: 'HCG: LH Receptor Agonism, Dosing and Monitoring | TherapyLog',
    description: 'Why human chorionic gonadotropin acts like luteinising hormone, why it lasts ' +
      'so much longer, and what it does to testicular volume, fertility and estradiol.',
    lede: `A placental hormone that binds the same receptor as luteinising hormone and stays in
      circulation roughly a hundred times longer. That single pharmacokinetic fact is why it is
      used the way it is, and it explains most of what people find surprising about it.`,
    sections: [
      {
        h2: 'The same receptor, a very different half-life',
        paras: [
          `@@EV_ESTABLISHED@@ Human chorionic gonadotropin and luteinising hormone are
          glycoprotein hormones sharing an identical alpha subunit and differing in the beta
          subunit that determines receptor specificity. Both bind the LH/hCG receptor on
          testicular Leydig cells, and the downstream signal is the same: produce testosterone.
          Functionally, hCG is an LH substitute.`,
          `What differs is persistence. Endogenous LH has a circulating half-life measured in
          tens of minutes and is released in pulses; hCG carries a longer, more heavily
          sialylated beta-subunit tail that resists renal clearance, and the app models its
          half-life at about a day and a half. That is why an every-other-day or twice-weekly
          schedule produces continuous receptor occupancy from a hormone the body normally
          delivers in bursts &mdash; and why very frequent or very high administration can
          desensitise the receptor, which pulsatile LH does not do.`
        ]
      },
      {
        h2: 'Intratesticular testosterone is the point',
        paras: [
          `Exogenous testosterone suppresses LH, and without LH the testis stops producing
          testosterone locally. Serum testosterone can be entirely adequate while the
          concentration inside the testis &mdash; which is normally many times higher than serum
          and is what spermatogenesis depends on &mdash; collapses. @@EV_ESTABLISHED@@ That
          collapse is the mechanism behind both the testicular volume loss and the impaired
          fertility that accompany testosterone therapy, and it is what hCG addresses: it
          restores the local signal that the exogenous testosterone removed.`,
          `@@EV_OFFLABEL@@ Low-amount hCG alongside testosterone therapy for the maintenance of
          intratesticular testosterone, testicular volume and spermatogenesis is well established
          in clinical practice and supported by small human studies, and it remains an off-label
          use &mdash; the approved indications are female infertility and cryptorchidism. It is
          worth being precise about what it does: it maintains function during therapy far more
          reliably than it restores function afterwards.`,
          `Anyone considering testosterone therapy who may want biological children should be
          having this conversation before starting rather than after. The options are meaningfully
          different at the two points in time, and that is a fertility specialist's conversation,
          not a page's.`
        ]
      },
      {
        h2: 'Two practical consequences people run into',
        paras: [
          `The first is estradiol. Leydig cells express aromatase, so stimulating them produces
          oestrogen as well as testosterone, and hCG can raise estradiol more than the equivalent
          rise in serum testosterone would predict. The app records estradiol on the monitoring
          panel for this compound specifically, and a sensitive assay is what makes that number
          usable &mdash; see the
          <a href="/markers/estradiol-sensitive-vs-standard/">estradiol assay page</a>.`,
          `The second is that hCG is the analyte every pregnancy test detects. Anyone using it
          will test positive on a home or clinic pregnancy test, and hCG can interfere with other
          immunoassays. This is worth mentioning to a clinician before a test rather than
          explaining afterwards, and it is a genuine source of alarming false results.`,
          `Storage is the third thing that catches people out. It ships as a lyophilised powder
          and becomes a refrigerated, time-limited solution the moment it is reconstituted; the
          fact box above carries the app's own rule and its handling caveat. Any of the effects
          discussed here belongs with the clinician who prescribed it, who is the person who can
          weigh an estradiol result against everything else on the panel.`
        ]
      }
    ],
    consLede: `From the app's own entry. The estradiol item is the one that most often turns up in
      practice, and the storage item is the one most often ignored.`,
    faq: [
      ['Is HCG a form of testosterone?', [
        `No. It is a hormone that instructs the testis to make its own testosterone by binding the
         receptor luteinising hormone normally binds. That is a different mechanism from taking
         testosterone, and it is why it maintains testicular function where exogenous testosterone
         suppresses it.`]],
      ['Does it work in someone whose testes cannot respond?', [
        `Not usefully. hCG requires functional Leydig cells to act on. Primary testicular failure —
         where the testis itself is the problem rather than the pituitary signal — is the case in
         which stimulating the receptor achieves little, and distinguishing that from secondary
         hypogonadism is exactly what LH and FSH are measured for. The
         <a href="/markers/lh-fsh/">LH and FSH page</a> covers the distinction.`]],
      ['How long does it stay in the system?', [
        `The app models about a day and a half, so roughly a week for a dose to clear. That also
         governs how long a pregnancy test will read positive after the last administration. The
         <a href="/tools/half-life/hcg/">half-life page</a> has the curve.`]],
      ['Why does the app suppress LH and FSH on the panel and call that expected?', [
        `Because exogenous testosterone does that regardless, and hCG does not restore the
         measured pituitary hormones — it replaces the downstream signal. Unmeasurable LH and FSH
         on testosterone therapy is the expected finding rather than a new one, which is why the
         app records it as expected rather than flagging it.`]]
    ],
    basis: [
      ['Shared alpha subunit and LH receptor agonism',
        'Standard endocrinology references on glycoprotein hormone structure'],
      ['Intratesticular testosterone maintenance during testosterone therapy',
        'Small controlled human studies from the mid-2000s onward, reflected in current hormone-therapy practice'],
      ['Approved indications',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Half-life, formulation and storage rule',
        'app.html’s TL_PK and TL_STORAGE entries, lifted at build time']
    ],
    cta: `HCG and testosterone on different schedules is exactly the situation where a written
      log beats memory. TherapyLog records both against the same calendar.`
  },

  clom: {
    slug: 'clomiphene',
    h1: 'Clomiphene: two isomers in one tablet, and why that matters more than the dose',
    title: 'Clomiphene: SERM Pharmacology, Dosing and Monitoring | TherapyLog',
    description: 'Clomiphene citrate is a mixture of two stereoisomers with very different ' +
      'half-lives and effects. What that means for men taking it off-label.',
    lede: `A selective oestrogen receptor modulator approved for female infertility and used
      off-label to raise testosterone by removing the brake on the pituitary. The thing most
      articles omit is that the tablet contains two different molecules.`,
    sections: [
      {
        h2: 'How blocking a receptor raises testosterone',
        paras: [
          `Testosterone production is governed by a feedback loop: the hypothalamus releases GnRH
          in pulses, the pituitary responds with luteinising hormone and FSH, the testis produces
          testosterone, and testosterone &mdash; largely after conversion to estradiol &mdash;
          feeds back to slow the hypothalamus down. @@EV_ESTABLISHED@@ Clomiphene occupies
          oestrogen receptors in the hypothalamus without activating them, so the brake is not
          applied, GnRH pulse frequency rises, and LH and FSH follow. The testis is being asked
          to work harder rather than being replaced.`,
          `That is a structurally different intervention from testosterone therapy, and the
          practical differences follow from it: LH and FSH rise rather than fall, testicular
          volume is preserved, spermatogenesis is preserved or improved, and it is taken as a
          tablet. It also means it only works if the testis and pituitary can respond, which is
          why LH, FSH and testosterone are measured before rather than after.`
        ]
      },
      {
        h2: 'Enclomiphene and zuclomiphene are not the same drug',
        paras: [
          `@@EV_ESTABLISHED@@ Clomiphene citrate is a mixture of two geometric isomers.
          Enclomiphene is the trans isomer and carries the antioestrogenic activity that raises
          LH; zuclomiphene is the cis isomer, has oestrogenic activity, and has a half-life
          measured in days to weeks rather than hours. Because zuclomiphene clears so slowly, it
          accumulates over weeks of daily administration while enclomiphene does not.`,
          `That accumulation is the most likely explanation for the effects people report after
          several weeks that were absent at the start &mdash; mood changes and visual disturbance
          among them &mdash; and it is the reason a purified enclomiphene preparation has been
          pursued as a cleaner alternative. The app models clomiphene at a five-day half-life,
          which is a blended figure across a mixture whose two components differ by more than an
          order of magnitude; treat it as an approximation rather than a property of a single
          molecule.`,
          `Visual symptoms deserve a specific mention because they are the one adverse effect with
          a conventional instruction attached: blurring, scintillations or persistent
          after-images are a recognised effect of this drug class and are a reason to stop and
          contact the prescriber rather than to continue and monitor.`
        ]
      },
      {
        h2: 'What the off-label male use looks like in practice',
        paras: [
          `@@EV_OFFLABEL@@ Use in men with secondary hypogonadism who want to preserve fertility
          is well described in the urology literature and is not an approved indication anywhere.
          Reported testosterone responses vary widely, the response depends on an intact
          hypothalamic-pituitary-testicular axis, and it is not a treatment for primary
          testicular failure. Long-term data in men is thinner than the frequency of use
          suggests, since the approved indication is a short course in women.`,
          `The monitoring panel reflects what the drug does rather than what it treats: LH and
          FSH to confirm the axis responded, total testosterone to see the result, and estradiol
          because raising testosterone raises the substrate for aromatisation and clomiphene's
          own oestrogenic isomer complicates the picture. The dosing rows reproduced above are
          the app's, filtered &mdash; the post-cycle rows it holds are not published here.`,
          `Whether any of this applies to a particular person, and at what amount, is a
          prescribing decision made from measurements. Anyone experiencing the effects described
          above should be raising them with the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app's own entry. The isomer issue above is the mechanism behind several of
      these, which is worth knowing before attributing them to the amount.`,
    faq: [
      ['Is enclomiphene simply better?', [
        `It isolates the isomer that does the intended work and removes the one that accumulates,
         which is a coherent rationale and the reason it was developed separately. The app records
         it as a distinct entry with its own regulatory status, which is not the same as
         clomiphene's. Availability and legal status differ between the two.`]],
      ['How long does it take to see an effect on labs?', [
        `LH and FSH respond within days. Testosterone follows over two to four weeks. Because
         zuclomiphene keeps accumulating for longer than that, an assessment at four to six weeks
         is measuring a system that has responded but not fully settled, which is one reason
         repeat measurement matters more here than a single result.`]],
      ['Does it work after stopping testosterone therapy?', [
        `That use is a recovery protocol and this page does not publish protocols. What is worth
         saying is that recovery of the axis after suppression is variable, slower with longer
         duration of use, and not guaranteed — and that it is managed by a clinician with serial
         measurements rather than by a schedule found online.`]],
      ['Why is estradiol on the panel for a drug that blocks oestrogen receptors?', [
        `Because it blocks receptors in the hypothalamus while leaving circulating estradiol free
         to rise as testosterone rises, and because one of its two isomers is itself oestrogenic.
         The measured number and the receptor-level effect can move in different directions, which
         is exactly why the number alone is not the whole picture.`]]
    ],
    basis: [
      ['Isomer composition and differing half-lives',
        'Clomiphene citrate pharmacology literature; the long-lived zuclomiphene isomer has been characterised since the 1980s'],
      ['Off-label use in men with secondary hypogonadism',
        'Urology literature from the 2000s onward; not an approved indication'],
      ['Visual disturbance as a class effect',
        'Clomiphene prescribing information'],
      ['Modelled half-life',
        'app.html’s TL_PK entry, a blended figure across the isomer mixture']
    ],
    cta: `A drug whose two components clear at different rates makes the start date part of the
      result. TherapyLog keeps the date with the dose.`
  },

  rhgh: {
    slug: 'recombinant-hgh',
    h1: 'Recombinant human growth hormone: a short serum half-life with long-acting effects',
    title: 'Recombinant HGH (Somatropin): Pharmacology and Monitoring | TherapyLog',
    description: 'Somatropin clears from serum in hours but acts through IGF-1 for a day or ' +
      'more. Why IGF-1 is the titration marker, and what the dose-dependent effects are.',
    lede: `Bioidentical human growth hormone, produced recombinantly and identical to the
      pituitary's own 191-amino-acid protein. It leaves the blood in a few hours and its effects
      last far longer, which is the single fact that explains how it is dosed and measured.`,
    sections: [
      {
        h2: 'The hormone is a signal; IGF-1 is the effect',
        paras: [
          `@@EV_ESTABLISHED@@ Growth hormone acts directly on some tissues and indirectly on many
          more by stimulating hepatic production of insulin-like growth factor 1. GH itself is
          released in pulses, mostly at night, and is cleared from serum with a half-life the app
          models at under four hours. IGF-1 circulates bound to binding proteins with a half-life
          of many hours and is far more stable across the day. So a random GH measurement is close
          to uninterpretable, and IGF-1 is what gets measured instead.`,
          `That is why the monitoring panel is built around IGF-1 rather than around growth
          hormone: it integrates the signal over time in a way a serum GH cannot. It is also why
          the effects of a daily injection do not track the injection's own curve. The compound
          is gone by morning; what it set in motion is not.`,
          `The consequence for anyone reading a protocol is that titrating by feel is not
          available here. Body-composition change on GH takes months, the effects that appear
          early are mostly fluid, and the marker that tells you where you are is a blood test.
          The <a href="/markers/igf-1/">IGF-1 page</a> covers what the number means and why the
          reference range is age-dependent.`
        ]
      },
      {
        h2: 'Approved use, and what the off-label use borrows from it',
        paras: [
          `@@EV_ESTABLISHED@@ Somatropin is approved for a specific set of indications, adult
          growth hormone deficiency among them, and in that population the evidence for improved
          body composition, bone density and quality of life is solid. Diagnosing adult deficiency
          is not a matter of a low IGF-1: it requires provocative stimulation testing, because
          IGF-1 overlaps substantially between deficient and sufficient adults.`,
          `@@EV_OFFLABEL@@ Use in adults without a deficiency diagnosis is off-label, and the
          evidence base is genuinely different. Meta-analyses in healthy older adults have found
          small changes in lean and fat mass with no demonstrated improvement in strength or
          function, alongside a consistent increase in oedema, arthralgia and carpal tunnel
          syndrome. Whatever else that is, it is not the same finding as the deficiency
          literature, and using the deficiency evidence to support the off-label use is the most
          common error in writing about this compound.`,
          `The adverse effects that define the off-label experience are dose-dependent and largely
          reversible: fluid retention, joint aches, carpal tunnel symptoms and reduced insulin
          sensitivity. The insulin item is the one that shows up on a panel rather than in a
          symptom, which is why fasting glucose and HbA1c sit alongside IGF-1 on the app's
          monitoring list.`
        ]
      },
      {
        h2: 'Handling, and the counterfeit problem',
        paras: [
          `Somatropin is a protein, and proteins denature. The app flags it as fragile: it ships
          lyophilised or as a refrigerated solution, it does not tolerate freezing once
          reconstituted, and it does not survive heat or agitation. The storage rule in the fact
          box is the app's own, with its handling caveat attached. A vial that has been through a
          warm delivery is a vial of unknown potency, and there is no way to tell by looking.`,
          `The grey market for this compound is large and the counterfeit rate is high &mdash; a
          point the app's own drawbacks list makes. This site names no vendor, no clinic and no
          testing service, and it will not: a page that ranks for a compound and then tells you
          where to buy it has stopped being information. What can be said usefully is that
          identity and potency are unverifiable outside a regulated supply chain, and that a
          product with a real prescription behind it is the only version of this where those
          questions have an answer.`,
          `Everything above is a description of what the literature and clinical practice report.
          Growth hormone is a prescription drug, the diagnosis that justifies it requires
          testing, and the effects described here belong in front of the clinician who prescribes
          rather than being managed from a page.`
        ]
      }
    ],
    consLede: `From the app's own entry. Note the split between the effects that are dose-dependent
      and reversible and the ones about sourcing — they call for completely different responses.`,
    faq: [
      ['Why is IGF-1 measured rather than growth hormone?', [
        `Because GH is pulsatile and clears in a few hours, so a single measurement mostly reports
         where in a pulse the draw happened. IGF-1 is stable across the day and reflects GH
         exposure over a longer window, which is what makes it usable as a titration marker.`]],
      ['Do growth hormone secretagogues do the same thing?', [
        `They raise the body's own GH release rather than supplying GH, so they work within the
         pituitary's feedback loops and produce a pulsatile rather than a continuous signal. That
         is a real pharmacological difference, and it is not the same as saying one is safer or
         more effective. Sermorelin, CJC-1295, ipamorelin and MK-677 each have a page here.`]],
      ['How long does one injection last in the blood?', [
        `The app models a serum half-life of under four hours, so it is essentially gone within a
         day. The IGF-1 elevation it produces lasts considerably longer, which is why daily
         administration produces a sustained effect from a compound with a short half-life.`]],
      ['What does "fragile" mean in the storage rule?', [
        `That it is a protein whose structure is the thing doing the work, so heat, freezing and
         mechanical agitation can destroy activity without changing the appearance of the vial.
         The app flags fragility separately from the storage temperature for that reason.`]]
    ],
    basis: [
      ['GH pulsatility and IGF-1 as the integrated marker',
        'Standard endocrinology references on the GH/IGF-1 axis'],
      ['Effects in adult growth hormone deficiency',
        'Endocrine Society clinical practice guideline on adult growth hormone deficiency and the underlying trial literature'],
      ['Effects in healthy older adults',
        'Systematic review of growth hormone in the healthy elderly, Annals of Internal Medicine, 2007, and subsequent meta-analyses'],
      ['Approved indications, storage rule and fragility flag',
        'app.html’s own approval, TL_STORAGE and TL_PK fields, lifted at build time']
    ],
    cta: `IGF-1 every few months against a daily injection is a trend, not a number. TherapyLog
      charts it against the dose that produced it.`
  },

  bpc: {
    slug: 'bpc-157',
    h1: 'BPC-157: what the animal literature shows, and what nobody has tested in people',
    title: 'BPC-157: Evidence, Routes and What Is Unknown | TherapyLog',
    description: 'A synthetic pentadecapeptide with a large animal literature and almost no ' +
      'human trial data. What the studies actually did, and where the gaps are.',
    lede: `Fifteen amino acids derived from a sequence found in human gastric juice, with one of
      the largest animal literatures of any research peptide and essentially no controlled human
      data. Both halves of that sentence matter.`,
    sections: [
      {
        h2: 'What it is, and what the studies actually measured',
        paras: [
          `BPC-157 is a synthetic peptide corresponding to a fifteen-residue fragment of a larger
          protein isolated from gastric juice. @@EV_THEORETICAL@@ The published work is
          overwhelmingly in rodents, and within that literature the findings are consistent and
          broad: accelerated healing of transected tendon, ligament and muscle; protection of
          gastrointestinal mucosa against several kinds of injury; effects on blood-vessel
          formation; and a range of neurological findings. Proposed mechanisms centre on
          angiogenesis through the VEGF pathway, modulation of nitric oxide signalling, and
          upregulation of growth factor receptors in healing tissue.`,
          `The consistency of that literature is genuinely notable, and so is a second fact about
          it: a large share of it comes from a small number of related research groups. That is
          not an accusation, it is a description of the evidence base, and it is exactly the
          situation where independent replication carries more weight than volume. Consistent
          findings from one lineage of investigators are weaker evidence than the same findings
          from several.`,
          `What does not exist is a published randomised controlled trial in humans for any
          indication. Not a negative one &mdash; an absent one. Everything said about human dose,
          human response, human duration or human safety is extrapolation from animals and
          uncontrolled reports, and the confidence with which it is usually stated is not
          supported by anything.`
        ]
      },
      {
        h2: 'Routes, stability and the oral question',
        paras: [
          `@@EV_THEORETICAL@@ The peptide is described as stable in gastric juice, which is
          unusual for a peptide and is the basis for oral administration &mdash; the argument
          being that it survives the stomach to act locally on gastrointestinal tissue. Local
          action on the gut is a coherent reading of that. Systemic absorption of an intact
          fifteen-residue peptide from the gut is a much stronger claim, and it is the one people
          make when they describe oral administration for a tendon injury.`,
          `Injected subcutaneously, the app models a half-life of about four hours and flags it as
          an estimate &mdash; meaning published human pharmacokinetic data is limited or absent
          and the figure is inferred. Every number derived from it, on this page or anywhere,
          inherits that. Treat the four hours as an order of magnitude rather than a measurement.`,
          `Administration near the site of an injury is the common practice and is described
          throughout the animal work, though several of the animal findings were produced with
          systemic administration. Whether local placement adds anything in humans is another
          question nobody has answered.`
        ]
      },
      {
        h2: 'What "no serious adverse events reported" is worth',
        paras: [
          `The app's entry notes an absence of serious adverse events in the literature, and that
          is accurate as far as it goes. It is worth being clear about how far that is. Adverse
          events are found by controlled trials designed to look for them and by surveillance
          systems that collect them; neither exists here. An absence of reports from a body of
          animal studies and uncontrolled human use is not evidence of safety, and the specific
          unknowns are the ones that a short study cannot reach: chronic administration,
          interaction with existing disease, and the theoretical concern that attaches to any
          compound promoting angiogenesis in a person who may have an undetected malignancy.`,
          `The sourcing problem compounds it. There is no approved product, so identity, purity
          and concentration depend entirely on whoever produced the vial. A peptide sold as
          BPC-157 may be a different sequence, a partially degraded one, or a different quantity
          than the label says, and none of that is visible. This site names no vendor and no
          testing service.`,
          `The reasonable position is that this is an interesting compound with a real mechanistic
          literature and an unusually large evidence gap between the animal work and the way it is
          used. Anyone using it or considering it should have that conversation with a clinician
          who knows their history, and anything that feels wrong while using it is a reason to
          stop and ask rather than to continue.`
        ]
      }
    ],
    consLede: `From the app's own entry, and unusually honest for a compound this popular — the
      first two items are the whole story.`,
    faq: [
      ['Is there any human trial evidence?', [
        `No published randomised controlled trial for any indication. There is animal work, there
         are uncontrolled human reports, and there is a large amount of confident writing that
         does not distinguish between those and a trial. That distinction is the most important
         thing to carry away from this page.`]],
      ['Oral or injected?', [
        `The peptide is reported stable in gastric juice, which supports local action on
         gastrointestinal tissue taken orally. Systemic absorption sufficient to act on a distant
         tendon is a much larger claim and is not established. The app records both routes in its
         dosing rows above; which, if either, is appropriate is not a question this page answers.`]],
      ['How does it compare with TB-500?', [
        `They are different peptides with different proposed mechanisms — BPC-157 is associated
         with angiogenesis and growth-factor signalling, TB-500 with actin regulation and cell
         migration — and both rest on animal data. They are frequently used together, which is a
         community practice rather than a tested combination.
         <a href="/tools/bpc-157-tb-500-blend-calculator/">The blend calculator</a> covers the
         arithmetic of a shared vial, not the case for one.`]],
      ['What does the estimated half-life flag mean?', [
        `That app.html marks the figure as inferred rather than measured, because published human
         pharmacokinetic data is limited or absent. Any duration, clearance or accumulation figure
         calculated from it carries the same uncertainty, and the
         <a href="/tools/half-life/bpc-157/">half-life page</a> says so on every number it
         prints.`]]
    ],
    basis: [
      ['Animal healing and gastroprotection findings',
        'A large rodent literature published from the 1990s onward, concentrated among a small number of related research groups'],
      ['Proposed angiogenic and nitric-oxide mechanisms',
        'The same literature; mechanism proposals rather than demonstrated human pathways'],
      ['Absence of human controlled trials',
        'No published randomised controlled trial exists for any indication as of this review date'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `For a compound with no established human dose, what you actually did and what actually
      happened is the only data there is. TherapyLog keeps both.`
  },

  tb5: {
    slug: 'tb-500',
    h1: 'TB-500 and thymosin beta-4: a naming problem worth understanding first',
    title: 'TB-500: Thymosin Beta-4, Evidence and What Is Unknown | TherapyLog',
    description: 'TB-500 is usually described as thymosin beta-4, but the two are not the ' +
      'same molecule. What the actual research covers, and what that means for the peptide sold.',
    lede: `A peptide named after a protein it is a fragment of, with a research literature that
      mostly belongs to the full protein rather than to the fragment. Sorting that out first makes
      everything else on the subject easier to read.`,
    sections: [
      {
        h2: 'The fragment and the protein are not interchangeable',
        paras: [
          `Thymosin beta-4 is a 43-amino-acid protein found in most cells and in high
          concentration in platelets and wound fluid. Its main established function is binding
          monomeric actin, which makes it a regulator of the cytoskeleton and therefore of cell
          migration &mdash; the process by which cells move into a wound. @@EV_ESTABLISHED@@ That
          role is not in dispute; it is basic cell biology.`,
          `TB-500 as sold is generally a short synthetic peptide corresponding to the
          actin-binding region of that protein, not the protein itself. The two are routinely
          discussed as the same thing, including in most of the material written about it, and
          they are not. A fragment can retain some activity of its parent and lose the rest, and
          the studies people cite for TB-500 are usually studies of full-length thymosin beta-4.`,
          `This is not a pedantic distinction. @@EV_ESTABLISHED@@ Full-length thymosin beta-4 has
          been through genuine clinical development &mdash; formulated as an eye drop, it reached
          late-stage trials for neurotrophic keratopathy and dry eye disease. Those trials tell
          you something about a 43-residue protein applied topically to the cornea. They tell you
          very little about a fragment injected subcutaneously for a tendon.`
        ]
      },
      {
        h2: 'What is actually known about the injected fragment',
        paras: [
          `@@EV_THEORETICAL@@ The musculoskeletal and cardiac findings that motivate its use come
          from animal work: accelerated wound closure, effects on cardiac repair after
          experimental infarction, and improved recovery in soft-tissue injury models. Mechanism
          proposals centre on actin sequestration promoting cell migration and on angiogenesis.
          As with most research peptides, the animal literature is more consistent than it is
          large, and it is not human evidence.`,
          `The app models a 48-hour half-life and flags it as an estimate &mdash; published human
          pharmacokinetic data is limited or absent. Two days is long for a peptide of this size
          and is the basis for the twice-weekly and weekly schedules described in the app's rows.
          Since the figure is inferred rather than measured, so is any accumulation or clearance
          number derived from it.`,
          `The app's own drawbacks list flags a preliminary cancer concern from animal studies,
          and that deserves to be stated plainly rather than buried: a compound whose proposed
          mechanism includes promoting cell migration and blood-vessel formation raises a
          theoretical question about a person with an undetected malignancy. Theoretical is the
          right word &mdash; there is no human evidence either way &mdash; and it is exactly the
          kind of question that belongs with a clinician who knows someone's history and screening
          status.`
        ]
      },
      {
        h2: 'Sourcing, and why identity is the first problem',
        paras: [
          `There is no approved product, so what is in a vial is whatever the manufacturer put
          there. For this compound the naming confusion makes that worse than usual: a vial
          labelled TB-500 could contain the short fragment, something closer to the full protein,
          a different fragment, or a degraded mixture, and none of those is distinguishable
          without analysis. This site names no vendor and no testing service, and it never
          will.`,
          `The peptide ships lyophilised and becomes a refrigerated, time-limited solution once
          reconstituted; the storage rule in the fact box is the app's own with its handling
          caveat attached. The <a href="/tools/tb-500-reconstitution-calculator/">reconstitution
          calculator</a> handles the arithmetic of getting from a vial to a syringe volume, which
          is the one part of this that is not uncertain.`,
          `Anyone using this or considering it should be having the conversation with a clinician
          who knows their history &mdash; particularly the screening question above &mdash; and
          anything that feels wrong while using it is a reason to stop and ask rather than to work
          through it.`
        ]
      }
    ],
    consLede: `From the app's own entry. The cancer item is preliminary and animal-derived, and it
      is the one worth raising with a clinician rather than weighing alone.`,
    faq: [
      ['Is TB-500 the same as thymosin beta-4?', [
        `Not usually. Thymosin beta-4 is a 43-residue protein; TB-500 as sold is generally a short
         synthetic peptide from its actin-binding region. Most of the research cited for TB-500 was
         done on the full protein. Treating results from one as results for the other is the
         single most common error in writing about this compound.`]],
      ['Why is it so often paired with BPC-157?', [
        `Because the two are described as acting on different parts of tissue repair — one on cell
         migration, the other on angiogenesis and growth-factor signalling — so the pairing is a
         mechanistic argument rather than a tested combination. It is community practice with a
         plausible rationale and no trial behind it. The
         <a href="/tools/bpc-157-tb-500-blend-calculator/">blend calculator</a> covers the shared-vial
         arithmetic.`]],
      ['What does the estimated half-life mean for the dosing schedule?', [
        `That the schedule is built on an inferred number. Twice-weekly and weekly intervals follow
         from a two-day half-life, and if the real figure is materially different then so is the
         accumulation. The <a href="/tools/half-life/tb-500/">half-life page</a> carries that
         caveat on every number it prints.`]],
      ['Is there any human trial data for the injected form?', [
        `Not for the fragment in musculoskeletal use. The clinical development that exists is for
         full-length thymosin beta-4 in ophthalmic and cardiac indications, by a different route.`]]
    ],
    basis: [
      ['Thymosin beta-4 actin binding and cell migration',
        'Established cell-biology literature on beta-thymosins'],
      ['Clinical development of full-length thymosin beta-4',
        'Ophthalmic trials of a thymosin beta-4 formulation for neurotrophic keratopathy and dry eye disease, reported from 2015 onward'],
      ['Animal repair findings',
        'Rodent wound-healing and cardiac-repair models; not human evidence'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `When the compound's identity and half-life are both uncertain, your own record of what
      you did and when is the only firm data point. TherapyLog keeps it.`
  },

  cjc: {
    slug: 'cjc-1295',
    h1: 'CJC-1295 without DAC: a name that describes a different molecule',
    title: 'CJC-1295 (Mod GRF 1-29): GHRH Analogue Pharmacology | TherapyLog',
    description: 'What is sold as CJC-1295 without DAC is modified GRF(1-29), a thirty-minute ' +
      'peptide. The DAC is what made CJC-1295 long-acting. Why the distinction changes everything.',
    lede: `A growth-hormone-releasing hormone analogue with a half-life the app models at thirty
      minutes, sold under a name that belongs to a molecule with a half-life of about a week. The
      naming is the first thing to understand, because it determines the dosing.`,
    sections: [
      {
        h2: 'What the DAC was, and what removing it removes',
        paras: [
          `Native GHRH is a 44-amino-acid hypothalamic peptide; its first 29 residues carry the
          activity, and that fragment &mdash; GRF(1-29) &mdash; is the starting point for this
          whole family. It is degraded within minutes. Modified GRF(1-29) adds four amino-acid
          substitutions that resist that degradation and extend the half-life to roughly half an
          hour.`,
          `@@EV_ESTABLISHED@@ CJC-1295 proper is that modified peptide with one further addition:
          a drug affinity complex, a reactive linker that forms a covalent bond with circulating
          albumin. Bound to albumin, the peptide is protected from clearance and its half-life
          extends to about a week. The DAC is not a detail. It is the entire innovation the name
          CJC-1295 refers to.`,
          `So "CJC-1295 without DAC" describes modified GRF(1-29) &mdash; a thirty-minute peptide
          &mdash; under the name of a week-long one. The app records the two separately, and this
          page covers the short-acting version. The distinction matters practically: a
          thirty-minute peptide produces a discrete pulse and is dosed accordingly, while the
          DAC version produces a sustained elevation, which is a pharmacologically different
          intervention with different implications for the feedback loops involved.`
        ]
      },
      {
        h2: 'Why the pulse is the design goal',
        paras: [
          `Growth hormone is normally released in bursts, largely during slow-wave sleep, against
          a background of somatostatin tone that suppresses release between bursts.
          @@EV_ESTABLISHED@@ A GHRH analogue amplifies a pulse when the pituitary is ready to
          release one; it does not override somatostatin. That is the mechanistic argument for
          preferring a short-acting analogue: it works within the existing rhythm rather than
          flattening it, and the pituitary's own feedback remains in place.`,
          `@@EV_OFFLABEL@@ It is also the argument for pairing a GHRH analogue with a ghrelin
          receptor agonist such as ipamorelin. The two act at different receptors &mdash; one
          raising the release signal, the other suppressing somatostatin tone &mdash; and the
          combined effect on a GH pulse is reported as larger than either alone. This is a
          well-founded piece of physiology and a near-universal community practice; it is not a
          combination that has been through trials in this population.`,
          `The fasting requirement follows from the same physiology. Insulin and elevated glucose
          blunt GH release, which is why administration is described in the fasted state and
          typically before sleep, when the natural pulse is largest. The app's dosing rows carry
          that framing.`
        ]
      },
      {
        h2: 'What is not established',
        paras: [
          `@@EV_THEORETICAL@@ There is no approved product and no controlled trial of this
          peptide for the uses it is put to. The GH-releasing effect of GHRH analogues is
          well characterised; what is not characterised is whether producing larger GH pulses in
          a person with a normal axis changes body composition, recovery or anything else people
          are hoping for, over what timescale, or at what cost. IGF-1 is the marker that tells you
          whether the axis moved &mdash; see the <a href="/markers/igf-1/">IGF-1 page</a> &mdash;
          and it is a marker of exposure, not of benefit.`,
          `The adverse effects reported are those of raising GH: fluid retention, transient
          bloating, occasional numbness or tingling suggesting carpal tunnel involvement at higher
          amounts, and reduced insulin sensitivity. The app records fasting glucose alongside
          IGF-1 for that reason. Sourcing carries the usual research-compound problem: identity,
          purity and concentration are unverified outside a regulated supply chain, and no vendor
          or testing service appears anywhere on this site.`,
          `Anyone experiencing the effects described here should raise them with a clinician who
          knows their history, and a rising fasting glucose is a reason to have that conversation
          sooner rather than at the next scheduled panel.`
        ]
      }
    ],
    consLede: `From the app's own entry. These are the effects of raising growth hormone rather
      than effects unique to this peptide, which is worth knowing when comparing it against
      others in the class.`,
    faq: [
      ['Which one am I actually buying?', [
        `If it is labelled "CJC-1295 no DAC" or "Mod GRF 1-29", it is the thirty-minute peptide
         this page describes. If it is labelled CJC-1295 with DAC, it is the long-acting version,
         which the app records as a separate compound. The two are dosed differently because they
         behave differently, and the labelling in this market is not reliable.`]],
      ['Why pair it with ipamorelin?', [
        `Because they act at two different receptors in the same pathway and the combined effect on
         a growth hormone pulse is larger than either alone. It is a mechanistically sound pairing
         and a community standard. It has not been tested as a combination in a controlled trial in
         people using it this way.`]],
      ['How long does one dose last?', [
        `The app models thirty minutes, so the peptide itself is gone within a couple of hours. The
         GH pulse it triggers and the IGF-1 elevation that follows last considerably longer, which
         is why a short half-life does not mean a short effect. The
         <a href="/tools/half-life/cjc-1295/">half-life page</a> has the curve.`]],
      ['Does it work if taken after a meal?', [
        `Less well. Insulin and glucose suppress growth hormone release, so administration in the
         fasted state is described throughout the literature and in the app's own rows. That is a
         property of the axis rather than of this peptide.`]]
    ],
    basis: [
      ['GRF(1-29) as the active fragment of GHRH',
        'Standard endocrinology references on growth hormone releasing hormone'],
      ['The drug affinity complex and albumin binding',
        'The published pharmacology of CJC-1295, which is where the name originates'],
      ['GHRH and ghrelin-receptor synergy on GH pulses',
        'Human physiology studies of combined GHRH and GH-secretagogue administration'],
      ['Modelled half-life',
        'app.html’s TL_PK entry for the non-DAC peptide']
    ],
    cta: `Two peptides, one syringe, a fasted window before sleep — that is a schedule worth
      writing down. TherapyLog records the pairing and the time.`
  },

  ipa: {
    slug: 'ipamorelin',
    h1: 'Ipamorelin: a ghrelin receptor agonist selected for what it does not do',
    title: 'Ipamorelin: Selective GH Secretagogue Pharmacology | TherapyLog',
    description: 'Ipamorelin releases growth hormone through the ghrelin receptor with little ' +
      'effect on cortisol or prolactin. What that selectivity is worth, and what is unproven.',
    lede: `A five-amino-acid peptide developed to release growth hormone without the cortisol and
      prolactin rise that earlier compounds in its class produced. The selectivity is the reason it
      displaced them, and it is also the clearest thing anyone can say about it.`,
    sections: [
      {
        h2: 'Two receptors, one growth hormone pulse',
        paras: [
          `Growth hormone release is governed by two opposing hypothalamic signals: GHRH, which
          stimulates it, and somatostatin, which suppresses it. Ghrelin &mdash; the stomach
          hormone associated with hunger &mdash; acts at a third site, the growth hormone
          secretagogue receptor, where it both stimulates release and reduces somatostatin tone.
          @@EV_ESTABLISHED@@ Ipamorelin is a synthetic agonist at that receptor. It is not a GHRH
          analogue and does not work the same way one does.`,
          `That is the pharmacological basis for pairing it with a GHRH analogue such as modified
          GRF(1-29). Two different receptors, two complementary actions on the same pulse: the
          release signal is raised while the brake is eased. The combined effect on a GH pulse is
          reported as greater than either produces alone, and that finding comes from human
          physiology studies of the mechanism rather than from trials of the specific products
          people use.`
        ]
      },
      {
        h2: 'What "selective" actually refers to',
        paras: [
          `The earlier compounds in this class &mdash; GHRP-6, GHRP-2, hexarelin &mdash; release
          growth hormone effectively and also raise cortisol and prolactin to varying degrees,
          because the receptor's signalling is not confined to the GH axis. @@EV_ESTABLISHED@@
          Ipamorelin was characterised as producing GH release with minimal effect on ACTH,
          cortisol and prolactin at effective amounts, and that separation is the property it was
          selected for and the reason it is preferred.`,
          `Selectivity is dose-dependent rather than absolute, and the appetite effect is not
          eliminated. Stimulating a ghrelin receptor does what stimulating a ghrelin receptor
          does; the app's own drawbacks list notes mild hunger stimulation, and that is a
          predictable consequence of the mechanism rather than a surprise. It is markedly less
          pronounced than with an orally active agonist that occupies the receptor
          continuously.`,
          `@@EV_THEORETICAL@@ What is not established is anything downstream. Ipamorelin was
          developed by a pharmaceutical company and taken into human study before being
          discontinued; there is no approval and no controlled trial supporting the uses it is
          put to now. The GH pulse is real and measurable. Whether repeatedly amplifying pulses in
          a person with a normal axis changes body composition, recovery or sleep in a way that
          matters is not something the literature answers.`
        ]
      },
      {
        h2: 'Timing, monitoring and what the numbers mean',
        paras: [
          `The app models a two-hour half-life, which is long enough to cover a pulse and short
          enough that the compound is gone well before morning. Administration is described in the
          fasted state, usually before sleep, because insulin and glucose blunt GH release and the
          largest natural pulse occurs in slow-wave sleep. Those constraints come from the
          physiology of the axis rather than from this peptide.`,
          `IGF-1 is the marker on the app's panel and the only practical way to see whether
          anything happened, since a serum growth hormone drawn at an arbitrary time reports
          mostly where in a pulse the needle went. IGF-1 integrates exposure over a longer window
          &mdash; the <a href="/markers/igf-1/">IGF-1 page</a> covers why the reference range is
          age-dependent and what a change in it does and does not mean. Fasting glucose sits
          beside it because raising growth hormone reduces insulin sensitivity.`,
          `There is no approved product, so identity, purity and concentration rest entirely with
          whoever made the vial, and no vendor or testing service is named anywhere on this site.
          Anything experienced while using it &mdash; and a rising fasting glucose in particular
          &mdash; belongs with a clinician who has the whole picture.`
        ]
      }
    ],
    consLede: `From the app's own entry. The hunger item is mechanism rather than side effect, and
      the monitoring items are the ones that show up on paper rather than in how someone feels.`,
    faq: [
      ['How is it different from MK-677?', [
        `Both act at the ghrelin receptor. Ipamorelin is an injected peptide with a two-hour
         half-life that produces a discrete pulse; MK-677 is an orally active non-peptide with a
         day-long half-life that produces sustained elevation. Sustained versus pulsatile is a real
         pharmacological difference, and it is the main reason their side-effect profiles differ.
         MK-677 has its own page here.`]],
      ['Why is it always paired with a GHRH analogue?', [
        `Because they act at different receptors and their effects on a growth hormone pulse
         combine. That synergy is established in human physiology studies. The specific pairing
         people use has not been through a controlled trial, which is a different statement from
         saying it does not work.`]],
      ['Does it raise cortisol?', [
        `Far less than the earlier compounds in its class at effective amounts, which is the
         property it was developed for. "Minimal" is not "none", and selectivity narrows as the
         amount rises. Cortisol and prolactin are not on the app's routine panel for this compound
         for that reason.`]],
      ['How long does one dose last?', [
        `The app models about two hours, so the peptide is cleared within a working day. The GH
         pulse it triggers and the IGF-1 response that follows outlast it considerably. The
         <a href="/tools/half-life/ipamorelin/">half-life page</a> has the curve.`]]
    ],
    basis: [
      ['Selectivity for GH release over ACTH and prolactin',
        'The original characterisation of ipamorelin in the growth hormone secretagogue literature, published in the late 1990s'],
      ['Ghrelin receptor signalling and somatostatin tone',
        'Standard endocrinology references on the GH secretagogue receptor'],
      ['Synergy with GHRH analogues',
        'Human physiology studies of combined GHRH and secretagogue administration'],
      ['Modelled half-life', 'app.html’s TL_PK entry']
    ],
    cta: `A fasted, pre-sleep peptide is easy to miss and easy to lose track of. TherapyLog records
      the dose and the time it went in.`
  },

  retatrutide: {
    slug: 'retatrutide',
    h1: 'Retatrutide: three receptors, phase III, and nothing on a pharmacy shelf',
    title: 'Retatrutide: Triple Agonist Pharmacology and Trial Data | TherapyLog',
    description: 'A GIP, GLP-1 and glucagon receptor agonist in late-stage trials. What the ' +
      'glucagon arm adds, what phase II measured, and why nothing available is the trial drug.',
    lede: `A single peptide acting at three receptors, with phase II weight-loss results above
      anything approved. It is not approved anywhere, and that fact is the most important thing on
      this page rather than a footnote to it.`,
    sections: [
      {
        h2: 'The glucagon receptor is the addition',
        paras: [
          `Semaglutide acts at one incretin receptor; tirzepatide acts at two. Retatrutide adds a
          third target that is not an incretin receptor at all: the glucagon receptor.
          @@EV_ESTABLISHED@@ Glucagon is usually thought of as the hormone that raises blood
          glucose, which makes agonising its receptor in a metabolic drug sound backwards. The
          rationale is that glucagon also increases hepatic fat oxidation and raises energy
          expenditure, and that the GLP-1 component offsets the glycaemic effect &mdash; so the
          combination is intended to add a calorie-burning arm to appetite suppression.`,
          `That is a coherent design and it is also where the open safety questions sit. A
          molecule that raises energy expenditure and acts on hepatic glucose handling has more
          places to go wrong than one that only suppresses appetite, and heart rate, hepatic
          effects and glycaemic control in people with diabetes are all things a phase III
          programme exists to characterise.`
        ]
      },
      {
        h2: 'What phase II reported',
        paras: [
          `@@EV_ESTABLISHED@@ The phase II trial in adults with obesity, published in 2023,
          reported mean weight reduction of about 24% at 48 weeks at the highest amount tested,
          against roughly 2% on placebo. That is the largest figure reported for any agent in this
          class and it is what drives the interest. It is also a phase II result: a smaller
          population, a shorter duration and a narrower safety picture than a phase III programme
          produces.`,
          `Gastrointestinal effects dominated, as with the rest of the class, and were amount- and
          titration-related. The app models the half-life at about six days and flags it as an
          estimate, which is appropriate for a compound whose full pharmacokinetic characterisation
          is not published; weekly dosing follows from that figure.`,
          `@@EV_OFFLABEL@@ The muscle-mass question is more pressing here than elsewhere in the
          class for the simple reason that the weight loss is larger. Loss of lean mass scales with
          the size of the deficit, and nothing about this mechanism protects it. Resistance
          training and adequate protein are the standard response and are inference from
          body-composition principles rather than a trial of the combination.`
        ]
      },
      {
        h2: 'Nothing available is the trial compound',
        paras: [
          `This is the part of the page that matters most. Retatrutide is not approved anywhere
          and is not commercially available. Anything obtainable is a research-supply preparation
          made by someone with no obligation to match the trial product's identity, purity or
          concentration, and no regulator has looked at it. The dosing rows above are the amounts
          used in trials, reproduced so that the numbers people cite can be seen in context
          &mdash; they are not a protocol, and they were administered under trial monitoring that
          does not exist outside a trial.`,
          `The specific risk with a compound at this stage is that the safety profile is still
          being written. Phase III exists precisely because phase II is not large enough or long
          enough to find uncommon harms, and using something at that stage means accepting the
          part of the risk the programme has not yet measured &mdash; without the monitoring a
          trial would provide.`,
          `Anyone considering this should be talking to a clinician who can weigh it against
          approved alternatives that have completed the process, and anyone using it who develops
          persistent vomiting, dehydration or severe abdominal pain should be seeking care rather
          than adjusting a schedule.`
        ]
      }
    ],
    consLede: `From the app's own entry, and the last item is the operative one: the compound is
      not commercially available, so nothing on the market is the thing the trials studied.`,
    faq: [
      ['Is it better than tirzepatide?', [
        `Its phase II weight-loss figure is larger than tirzepatide's phase III figures, and
         comparing across trials with different populations, durations and designs is weak
         evidence. No head-to-head trial has reported. "Larger number in a smaller earlier trial"
         is what the evidence supports.`]],
      ['When will it be approved?', [
        `Phase III trials are ongoing. Timelines in the app's own regulatory string are
         projections rather than decisions, and this page will not add a guess to them.`]],
      ['How long does it stay in the system?', [
        `The app models about six days and flags the figure as an estimate. At that half-life a
         weekly schedule accumulates for roughly a month before it plateaus, and clearance after
         stopping takes a similar time. The <a href="/tools/half-life/retatrutide/">half-life
         page</a> carries the estimate caveat on every number.`]],
      ['What monitoring would a trial do?', [
        `The app's panel reflects it: glycaemic markers, lipids, liver enzymes, and body
         composition alongside weight. A trial would add scheduled clinical review, adverse-event
         capture and stopping rules — which is the part that cannot be reproduced outside one.`]]
    ],
    basis: [
      ['24% mean weight reduction at 48 weeks',
        'Phase II trial of retatrutide in adults with obesity, N Engl J Med, 2023'],
      ['Triple GIP, GLP-1 and glucagon receptor agonism',
        'The molecule’s published pharmacology'],
      ['Regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: full human pharmacokinetic characterisation is not published']
    ],
    cta: `For a compound still in trials, a careful personal record is the only data anyone will
      have. TherapyLog keeps the amount, the date and the labs together.`
  },

  mk677: {
    slug: 'mk-677',
    h1: 'MK-677: sustained growth hormone elevation, and what the two-year trial found',
    title: 'MK-677 (Ibutamoren): Pharmacology and Trial Evidence | TherapyLog',
    description: 'An orally active ghrelin receptor agonist with a day-long half-life. What ' +
      'continuous rather than pulsatile GH elevation does, and what the longest human trial showed.',
    lede: `The only orally active growth hormone secretagogue in common use, and the one with the
      most human trial data behind it. That data is worth reading carefully, because it is more
      informative than the marketing and less flattering.`,
    sections: [
      {
        h2: 'Continuous rather than pulsatile, and why that is the whole story',
        paras: [
          `@@EV_ESTABLISHED@@ MK-677 is a non-peptide agonist at the ghrelin receptor &mdash; the
          same receptor ipamorelin and the GHRPs act at &mdash; with two properties that
          distinguish it from all of them: it is orally bioavailable, and the app models its
          half-life at about a day. A single daily tablet therefore produces sustained receptor
          occupancy rather than a discrete pulse.`,
          `That difference explains most of the compound's profile. Growth hormone is normally
          released in bursts against a suppressive background, and the burst pattern is thought to
          matter to how tissues respond. Continuous elevation of GH and IGF-1 is a different
          physiological state from amplified pulses, and it is the state associated with the
          fluid retention, joint symptoms and insulin resistance that show up in the trials.
          Whether it is also the state associated with the benefits people want is the question
          the human data was supposed to answer.`
        ]
      },
      {
        h2: 'What the human trials actually found',
        paras: [
          `@@EV_ESTABLISHED@@ The most informative study is a two-year randomised
          placebo-controlled trial in healthy older adults, published in 2008. Daily MK-677 raised
          growth hormone and IGF-1 into the range of healthy young adults and increased fat-free
          mass by roughly one and a half kilograms against placebo. It did not improve strength or
          physical function. Fasting glucose rose and insulin sensitivity fell.`,
          `That is an unusually clean result and it is rarely quoted in full. The compound does
          what it says at the level of the hormone and at the level of body composition, and the
          functional outcome that would justify the intervention did not follow. Two years is long
          enough to see it if it were there.`,
          `The compound has continued in pharmaceutical development for paediatric growth hormone
          deficiency, where the goal is diagnostic and therapeutic in people whose axis is
          genuinely underactive &mdash; a different question from raising a normal axis. It has
          never been approved for any indication, and the app records its status simply as
          research.`
        ]
      },
      {
        h2: 'The effects that reliably turn up',
        paras: [
          `Appetite stimulation is the most consistent, and it is mechanism rather than side
          effect: this is a ghrelin receptor agonist held at the receptor continuously. For anyone
          whose goal involves a caloric deficit, that is working against them, and it is the most
          common reason people stop.`,
          `Fluid retention, bloating and numbness or tingling consistent with carpal tunnel
          involvement follow from raised GH and are amount-dependent. The metabolic effect is the
          one that does not announce itself: reduced insulin sensitivity and rising fasting glucose
          were consistent findings in the trial data, which is why the app puts fasting glucose and
          HbA1c on the panel beside IGF-1. The <a href="/markers/hba1c-and-fasting-glucose/">HbA1c
          page</a> covers why those two markers can disagree and what the disagreement means.`,
          `Prolactin and cortisol are on the app's panel for this compound and not for ipamorelin,
          reflecting the difference in selectivity and in exposure. None of this is a page's
          decision to weigh: a rising fasting glucose in someone taking a compound known to raise
          it is a conversation with a clinician, not a number to watch alone.`
        ]
      }
    ],
    consLede: `From the app's own entry, and it lines up closely with what the trials reported —
      which is unusual, and is the benefit of a compound that actually went through human study.`,
    faq: [
      ['Is MK-677 a SARM?', [
        `No. It is a growth hormone secretagogue acting at the ghrelin receptor and has nothing to
         do with androgen receptors. It is frequently sold and discussed alongside that class,
         which is a marketing category rather than a pharmacological one.`]],
      ['Why does it cause more side effects than injectable secretagogues?', [
        `Chiefly because of exposure rather than potency. A day-long half-life taken daily means
         continuous receptor occupancy and continuously elevated IGF-1; an injected peptide with a
         two-hour half-life produces a pulse and then clears. Continuous elevation is where fluid
         retention and insulin resistance come from.`]],
      ['Does the lean mass gain mean it works?', [
        `It means fat-free mass increased, which in the trial was accompanied by no improvement in
         strength or function. Fat-free mass includes body water, and growth hormone causes fluid
         retention. That is the most plausible reading of a lean-mass increase with no functional
         change, and it is why the functional endpoints matter.`]],
      ['How long does it take to clear?', [
        `The app models a day-long half-life, so about five days for a dose to clear and roughly
         the same for the level to plateau after starting. The
         <a href="/tools/half-life/mk-677/">half-life page</a> has the curve and the accumulation
         figures.`]]
    ],
    basis: [
      ['Two-year trial in healthy older adults',
        'Effects of an oral ghrelin mimetic on body composition and clinical outcomes in healthy older adults, Annals of Internal Medicine, 2008'],
      ['Ghrelin receptor agonism and oral bioavailability',
        'The compound’s published pharmacology from the 1990s development programme'],
      ['Continued development for paediatric growth hormone deficiency',
        'Ongoing clinical development of the same molecule under a different programme name'],
      ['Modelled half-life', 'app.html’s TL_PK entry']
    ],
    cta: `A daily oral compound with a rising glucose signal is the case for logging the labs
      beside the dose. TherapyLog charts both on one timeline.`
  },

  serm2: {
    slug: 'sermorelin',
    h1: 'Sermorelin: the GHRH fragment that used to be an approved drug',
    title: 'Sermorelin: GHRH(1-29) Pharmacology and Status | TherapyLog',
    description: 'Sermorelin is GHRH(1-29), once marketed as an approved product and withdrawn ' +
      'for commercial reasons. What it does, and why its half-life is measured in minutes.',
    lede: `The first twenty-nine amino acids of growth hormone releasing hormone, which is the
      whole active part of the hormone. It has an unusual regulatory history for a compound in
      this category: it used to be an approved medicine.`,
    sections: [
      {
        h2: 'The active fragment, unmodified',
        paras: [
          `@@EV_ESTABLISHED@@ Native GHRH is 44 amino acids long and its biological activity
          resides in the first 29. Sermorelin is exactly that fragment, synthesised without
          modification. It binds the GHRH receptor on pituitary somatotrophs and stimulates growth
          hormone release, working entirely within the axis's own feedback: somatostatin still
          suppresses release between pulses, and the pituitary's own regulation stays in place.`,
          `Because it is unmodified, it is degraded quickly. The app models a half-life of about
          twelve minutes, which is the shortest of any compound in this reference and is a
          property of the native sequence rather than a formulation problem. Modified GRF(1-29)
          &mdash; the peptide usually sold as CJC-1295 without DAC &mdash; is this molecule with
          four substitutions that resist that degradation, which is why its half-life is measured
          in tens of minutes instead.`,
          `A twelve-minute half-life produces a sharp, brief stimulus. That is closer to what the
          hypothalamus actually does than any longer-acting analogue manages, and it is the basis
          for describing sermorelin as the most physiological intervention in this class. It also
          means the effect depends heavily on a pituitary able to respond, which is why the
          historical clinical use was diagnostic as much as therapeutic.`
        ]
      },
      {
        h2: 'An approval that no longer exists',
        paras: [
          `@@EV_ESTABLISHED@@ Sermorelin was marketed in the United States as an approved product
          for growth hormone deficiency in children, used both to assess pituitary function and to
          treat. It was withdrawn from the market in the late 2000s. The withdrawal was a
          commercial decision rather than a safety action, and that distinction matters when
          reading its current status: this is not a compound that failed, it is one that stopped
          being sold.`,
          `What it is now is a compounded preparation without an approved product behind it, which
          the app records as research-compound status. The practical consequence is the same as for
          any unapproved compound: identity, purity and concentration depend on the preparer, and
          no regulator has reviewed them. This site names no pharmacy, vendor or testing service.`,
          `That history is also why the safety picture is better characterised than for most
          peptides in this reference. A drug that was approved and used clinically for years has an
          adverse-effect profile derived from clinical use rather than from animal work, and
          sermorelin's is unremarkable: injection-site reactions, occasional flushing, and the
          effects of raising growth hormone at higher exposures.`
        ]
      },
      {
        h2: 'What to expect and what to measure',
        paras: [
          `@@EV_OFFLABEL@@ Use in adults for body composition, sleep or recovery is off-label and
          rests on the same gap that affects the whole class: raising GH pulses in a person with a
          normal axis is a measurable intervention with an unmeasured benefit. Sermorelin is less
          potent than the modified analogues and than the GHRH-plus-secretagogue pairings, which is
          the trade-off for being closest to the native signal.`,
          `IGF-1 is the marker that tells you whether the axis moved, for the same reason it is on
          every page in this class: a random serum growth hormone reports where in a pulse the
          draw happened and little else. The <a href="/markers/igf-1/">IGF-1 page</a> covers the
          age-dependent range. Fasting glucose sits beside it because raising growth hormone
          reduces insulin sensitivity.`,
          `Administration is described fasted and before sleep because insulin blunts GH release
          and the largest natural pulse is nocturnal &mdash; the same constraints that apply to
          every compound in this class. Anything experienced while using it belongs with a
          clinician who has the full history rather than being managed against a page.`
        ]
      }
    ],
    consLede: `From the app's own entry, and notably mild — which is what you would expect from a
      molecule identical to a fragment of a native hormone, cleared in minutes.`,
    faq: [
      ['How is sermorelin different from CJC-1295 without DAC?', [
        `They are the same 29-residue sequence, except that modified GRF(1-29) carries four amino
         acid substitutions that resist enzymatic degradation. That raises the half-life from about
         twelve minutes to about thirty. Everything else — receptor, mechanism, feedback — is the
         same. <a href="/compounds/cjc-1295/">The CJC-1295 page</a> covers the naming problem in
         that family.`]],
      ['Is it safer than growth hormone itself?', [
        `It works through the pituitary rather than replacing its output, so the axis's own
         feedback limits how far growth hormone can rise — which is a genuine structural difference
         from injecting somatropin. That is an argument about mechanism, not a safety finding, and
         it does not make an unapproved compounded preparation equivalent to a regulated
         product.`]],
      ['Why did it stop being available as an approved drug?', [
        `The withdrawal was commercial rather than a safety action. That distinction is worth
         carrying, because "withdrawn from the market" reads as a safety event and in this case was
         not one.`]],
      ['How short is twelve minutes in practice?', [
        `Short enough that the peptide is effectively gone within an hour. The growth hormone pulse
         it triggers and the IGF-1 response that follows last far longer, which is why the half-life
         does not describe the duration of effect. The
         <a href="/tools/half-life/sermorelin/">half-life page</a> has the curve.`]]
    ],
    basis: [
      ['GHRH(1-29) as the active fragment',
        'Standard endocrinology references on growth hormone releasing hormone'],
      ['Former approval and market withdrawal',
        'The product was approved in the United States for paediatric growth hormone deficiency and withdrawn in the late 2000s for commercial reasons'],
      ['Current regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Modelled half-life', 'app.html’s TL_PK entry']
    ],
    cta: `A twelve-minute peptide taken fasted before sleep lives or dies on consistency.
      TherapyLog records the dose and the time it went in.`
  },

  cagrilintide: {
    slug: 'cagrilintide',
    h1: 'Cagrilintide: the amylin arm, and why it is studied alongside semaglutide',
    title: 'Cagrilintide: Amylin Analogue Pharmacology and Trials | TherapyLog',
    description: 'A long-acting amylin analogue acting through a different satiety pathway from ' +
      'GLP-1. What amylin does, what the combination trials measured, and its regulatory status.',
    lede: `A once-weekly analogue of amylin &mdash; the pancreatic hormone released alongside
      insulin at every meal. It is interesting mostly because it works through a pathway the GLP-1
      drugs do not touch, which is why it is being developed as a partner rather than a rival.`,
    sections: [
      {
        h2: 'Amylin is the other beta-cell hormone',
        paras: [
          `@@EV_ESTABLISHED@@ Beta cells co-secrete two hormones in response to a meal: insulin,
          and amylin. Amylin's job is to slow the arrival of nutrients and signal that a meal has
          happened. It delays gastric emptying, suppresses postprandial glucagon, and acts on
          receptors in the area postrema &mdash; a brainstem region outside the blood-brain barrier
          &mdash; to promote satiety. Those receptors are not GLP-1 receptors, and that is the
          entire strategic point of the compound.`,
          `Native amylin is unusable as a drug because it aggregates into insoluble fibrils.
          Pramlintide, an approved analogue used with insulin in diabetes, solved the aggregation
          problem but has a half-life measured in minutes and requires dosing at every meal.
          Cagrilintide is a long-acting analogue with a fatty-acid modification of the kind that
          made semaglutide weekly; the app models its half-life at about seven and a half days and
          flags it as an estimate.`
        ]
      },
      {
        h2: 'Why the trials pair it with semaglutide',
        paras: [
          `@@EV_ESTABLISHED@@ Two satiety pathways that act through different receptors should
          combine, and that is what the development programme set out to test. The fixed-dose
          combination of cagrilintide and semaglutide has been through phase III in adults with
          obesity, reporting mean weight reduction of roughly 22-23% at 68 weeks. That is above
          semaglutide's own figure in a comparable trial and in the region of the highest results
          reported for any approved agent.`,
          `Cagrilintide has also been studied on its own, where the effect is real but considerably
          smaller than the combination's. The reasonable summary is that this is a compound
          designed to be additive rather than a standalone therapy, and the evidence supports
          reading it that way.`,
          `@@EV_OFFLABEL@@ The tolerability question is the interesting one for a combination. Two
          agents that both slow gastric emptying and both act on nausea pathways could plausibly
          compound gastrointestinal effects rather than dividing them, and the trial programme is
          where that gets characterised. Reported effects follow the class pattern &mdash; nausea
          and gastrointestinal upset, worst during titration.`
        ]
      },
      {
        h2: 'It is not approved, and that has practical consequences',
        paras: [
          `Cagrilintide is not approved anywhere, alone or in combination. The dosing rows above
          are trial amounts reproduced so the numbers people cite can be seen in context; they were
          administered inside trials with monitoring and stopping rules that do not exist outside
          one. This page does not tell anyone to take an amount, and no vendor, pharmacy or testing
          service appears anywhere on this site.`,
          `Anything obtainable now is a research-supply preparation whose identity, purity and
          concentration rest entirely with whoever produced it, and for a peptide whose native form
          is prone to aggregation, formulation is not a trivial detail. A preparation that has
          aggregated is not the same molecule in solution, and there is no way to tell by
          looking.`,
          `As with the rest of the class, the muscle-composition question applies and scales with
          the size of the deficit, and the standard response &mdash; resistance training and
          adequate protein &mdash; is inference rather than a tested combination. Anyone
          considering this should be weighing it against approved agents that have completed the
          process, with a clinician who can make that comparison.`
        ]
      }
    ],
    consLede: `From the app's own entry. The availability item is the one that governs everything
      else: there is no approved product, so there is no product whose contents anyone has
      verified.`,
    faq: [
      ['How is amylin different from GLP-1?', [
        `Different hormone, different receptors, different origin — amylin comes from the pancreatic
         beta cell alongside insulin, GLP-1 from the gut. Both slow gastric emptying and promote
         satiety, but through separate signalling, which is why combining them is expected to add
         rather than overlap.`]],
      ['Is pramlintide the same idea?', [
        `Same class, and it is the approved proof that an amylin analogue can work in people. It is
         short-acting and dosed with meals, which is a substantial practical difference. Cagrilintide
         is the attempt to make the mechanism weekly.`]],
      ['Can it be used with a GLP-1 drug?', [
        `That is precisely what the phase III programme tested, as a fixed-dose combination product.
         Assembling an equivalent from separate unapproved preparations is not the same thing as the
         combination that was studied, and this page will not describe how to do it.`]],
      ['How long does it stay in the system?', [
        `The app models about seven and a half days and flags the figure as an estimate. At that
         half-life, a weekly schedule accumulates for around five weeks before it plateaus, and
         clearance after stopping takes a similar time.`]]
    ],
    basis: [
      ['Amylin physiology and area postrema signalling',
        'Standard endocrinology references on amylin and the beta-cell secretory response'],
      ['Combination weight reduction at 68 weeks',
        'Phase III trial of the cagrilintide and semaglutide fixed-dose combination in adults with obesity, reported 2025'],
      ['Pramlintide as the approved short-acting analogue',
        'Pramlintide prescribing information'],
      ['Estimated half-life and regulatory status',
        'app.html’s own TL_PK and approval fields, lifted at build time']
    ],
    cta: `Weekly titration steps against a seven-day half-life take a month to settle. TherapyLog
      dates each step so the labs line up with it.`
  },

  epi: {
    slug: 'epithalon',
    h1: 'Epithalon: a four-amino-acid peptide and a single-lineage evidence base',
    title: 'Epithalon: Telomerase Claims and the State of the Evidence | TherapyLog',
    description: 'Epithalon is a tetrapeptide studied almost exclusively by one research group. ' +
      'What the claims are, where they come from, and what independent replication exists.',
    lede: `Four amino acids, a pulse schedule of ten days twice a year, and a set of claims about
      telomerase and lifespan that rest almost entirely on the work of one research lineage. That
      last fact is the most useful thing to know before reading anything else about it.`,
    sections: [
      {
        h2: 'Where it comes from',
        paras: [
          `Epithalon is a synthetic tetrapeptide &mdash; alanine, glutamate, aspartate, glycine
          &mdash; developed as the synthetic counterpart of epithalamin, a peptide preparation
          extracted from pineal tissue. Both belong to a family of short peptide preparations
          developed in Russian gerontology research from the 1970s onward, and the app groups them
          under that programme's name.`,
          `@@EV_THEORETICAL@@ The claims associated with it are unusually specific: activation of
          telomerase and consequent telomere elongation in cell culture, normalisation of melatonin
          rhythm, antioxidant effects, reduced tumour incidence in animal models, and increased
          lifespan in rodents. The reported experiments exist and are published. What is thin is
          replication outside the group that produced them, which is a different criticism from
          saying the work is wrong and a more important one.`,
          `The human evidence most often cited is a long-running cohort followed over several years
          with reported reductions in mortality. The design of that work &mdash; its allocation,
          its controls and its outcome ascertainment &mdash; does not meet the standard a
          contemporary trial would be held to, and the effect sizes reported are large enough that
          the design question is not a technicality.`
        ]
      },
      {
        h2: 'Why telomerase activation is not the reassuring claim it sounds like',
        paras: [
          `@@EV_THEORETICAL@@ Telomere shortening is a real feature of cell ageing and telomerase
          is the enzyme that counteracts it, so "activates telomerase" reads as straightforwardly
          good. The biology is less tidy. Telomerase activity is also a hallmark of most cancers,
          which reactivate it precisely to escape the replicative limit that telomere shortening
          imposes. A compound proposed to raise telomerase activity systemically is proposing to
          alter a mechanism that works in both directions.`,
          `Whether epithalon does this in humans at all is unestablished; the telomerase findings
          are in cell culture. The point is not that the compound is dangerous &mdash; there is no
          human evidence either way &mdash; but that the mechanism is not self-evidently
          beneficial, and articles that present telomerase activation as an unmixed good are
          skipping the part that would make it worth discussing with a clinician.`
        ]
      },
      {
        h2: 'The pulse schedule, and what is not known',
        paras: [
          `The dosing pattern the app records is distinctive: a short course of daily
          administration &mdash; ten to twenty days &mdash; repeated once or twice a year, rather
          than continuous use. That pattern comes from the original research protocols rather than
          from pharmacokinetic reasoning, and the app holds no half-life or time-to-peak for this
          compound, which is why the fact box above has no pharmacokinetic rows. Nobody has
          published the characterisation those rows would come from.`,
          `There is no approved product outside the jurisdiction where the underlying research was
          done, no controlled Western trial, and no established human dose. Identity and purity
          rest with whoever produced the vial, as with every research compound, and this site names
          no vendor or testing service. The peptide ships lyophilised and becomes a refrigerated,
          time-limited solution once reconstituted; the storage rule above is the app's own.`,
          `The honest position is that this is a compound with an interesting and genuinely
          published research programme behind it, concentrated in a way that makes independent
          replication the thing to wait for, and with a mechanism whose desirability is not
          obvious. Anyone using it or considering it should raise it with a clinician who knows
          their history, including their cancer screening history.`
        ]
      }
    ],
    consLede: `From the app's own entry, and unusually candid — the first three items describe the
      state of the evidence rather than an adverse effect, which is the correct emphasis here.`,
    faq: [
      ['Is there any Western trial evidence?', [
        `No controlled Western trial has been published. The research base is the Russian gerontology
         programme described above, and independent replication of its central findings is what is
         missing rather than contradicted.`]],
      ['Why is the dosing a short course twice a year?', [
        `Because that is the pattern used in the original research protocols. It is not derived from
         pharmacokinetics — the app holds no half-life for this compound, because none has been
         published — so the interval reflects a research convention rather than a measured
         property.`]],
      ['Does it lengthen telomeres in people?', [
        `That has not been demonstrated in humans. The telomerase and telomere findings are in cell
         culture. Whether the same thing happens in a person given a short course of the peptide is
         unknown, and it would not automatically be desirable if it did.`]],
      ['How does it relate to melatonin?', [
        `The original preparation was derived from pineal tissue, and one of the reported effects is
         normalisation of melatonin rhythm — which is the basis for the sleep and circadian claims
         attached to it. That link is from the same research lineage as everything else here.`]]
    ],
    basis: [
      ['Telomerase and telomere findings',
        'Cell-culture work published by the Russian gerontology programme associated with Khavinson, from the early 2000s'],
      ['Rodent lifespan and tumour-incidence findings',
        'The same programme; not independently replicated at the time of this review'],
      ['Human cohort mortality reports',
        'A long-running observational follow-up whose design does not meet contemporary trial standards'],
      ['Telomerase in cancer biology',
        'Established cancer-biology literature; telomerase reactivation is a recognised hallmark of most malignancies']
    ],
    cta: `A twice-yearly short course is exactly the thing nobody remembers the dates of.
      TherapyLog keeps them.`
  },

  pda: {
    slug: 'pentadeca-arginate',
    h1: 'Pentadeca arginate: a new name with almost no published literature behind it',
    title: 'Pentadeca Arginate (PDA): What Is Actually Known | TherapyLog',
    description: 'PDA is presented as an improved BPC-157. What is published about it, what is ' +
      'inferred from BPC-157, and what is marketing — separated out.',
    lede: `A compound that arrived in the peptide market recently, described as a more stable
      version of BPC-157. Almost everything written about it is inference from BPC-157 or claims
      from people selling it, and the difference between those two categories and published
      evidence is what this page is for.`,
    sections: [
      {
        h2: 'What it is said to be',
        paras: [
          `Pentadeca arginate is presented as the same fifteen-amino-acid sequence as BPC-157
          prepared as an arginate salt rather than the acetate form, with the claim that the salt
          form improves stability and shelf life. @@EV_THEORETICAL@@ Salt form genuinely does
          affect the stability and solubility of a peptide, so the claim is chemically plausible on
          its face. Plausible is where it stops.`,
          `The app's entry describes enhanced tissue regeneration and nitric-oxide pathway activity
          relative to BPC-157. Those are the claims that circulate; they are not conclusions from a
          published comparison, because no published comparison exists. The app's own drawbacks
          list says this in its first two items, and it is right to.`,
          `The honest statement of the evidence is short. There is no peer-reviewed pharmacology,
          no published pharmacokinetics &mdash; the app holds no half-life or time to peak, which
          is why the fact box above carries no pharmacokinetic rows &mdash; no animal literature
          under this name, and no human data. Everything favourable said about it is either
          transferred from BPC-157's animal literature or originates with a seller.`
        ]
      },
      {
        h2: 'Why transferring BPC-157’s evidence does not work',
        paras: [
          `BPC-157's evidence base is itself entirely animal work with no human controlled trials,
          so the strongest possible inference here is from an already-limited body of research to a
          preparation that has not been studied. That is two steps removed from a human finding,
          and each step is doing real work.`,
          `A changed salt form is a change to the preparation, and it is offered as the reason for
          claimed superiority &mdash; so the same argument that makes PDA worth a different name is
          the argument against assuming BPC-157's results apply to it. Either it behaves
          differently, in which case the borrowed evidence does not transfer, or it behaves the
          same, in which case there is no reason to prefer it. Both cannot be true at once.`,
          `@@EV_THEORETICAL@@ The identity problem is more acute here than for most research
          compounds. With no reference standard, no published analytical method under this name and
          no approved product, a vial labelled pentadeca arginate cannot be checked against
          anything. This site names no vendor and no testing service, and for this compound in
          particular a page that recommended a source would be worthless as well as
          inappropriate.`
        ]
      },
      {
        h2: 'What a reasonable position looks like',
        paras: [
          `None of this makes the compound harmful. It makes it unstudied, which is a different
          claim and a more accurate one. A short peptide from a sequence with a large animal
          literature is not an outlandish thing to be interested in, and a stability improvement
          would be a genuine practical benefit if it were demonstrated.`,
          `What is not reasonable is the confidence with which it is usually described. The
          specific claims &mdash; superior regeneration, enhanced nitric-oxide signalling, better
          bioavailability &mdash; are precisely the claims that would require the studies nobody
          has published, and repeating them without that caveat is how a marketing position becomes
          a widely believed fact.`,
          `Anyone using this or considering it should say plainly to their clinician what it is:
          an unstudied preparation of a sequence whose own evidence is animal-only. That is the
          conversation that lets someone weigh it properly, and anything that feels wrong while
          using it is a reason to stop and ask rather than to continue.`
        ]
      }
    ],
    consLede: `From the app's own entry, and it is the most useful drawbacks list in this reference
      precisely because every item is about the state of the evidence rather than a symptom.`,
    faq: [
      ['Is PDA better than BPC-157?', [
        `No published comparison exists, so the honest answer is that nobody knows. The claim is made
         by people selling it, and it rests on a stability argument that is chemically plausible and
         has not been demonstrated for this preparation.`]],
      ['Why is there no half-life in the fact box?', [
        `Because the app holds none, and it holds none because no pharmacokinetic characterisation
         has been published under this name. Any duration or clearance figure quoted elsewhere is
         borrowed from BPC-157 or invented.`]],
      ['Is it the same molecule as BPC-157?', [
        `It is described as the same peptide sequence in a different salt form. If that is accurate,
         it is the same molecule in solution with different handling properties. Whether a given vial
         contains what the label says is unverifiable outside a laboratory, and there is no reference
         standard to verify it against.`]],
      ['Should the BPC-157 page be read alongside this one?', [
        `Yes — <a href="/compounds/bpc-157/">the BPC-157 page</a> covers the animal literature this
         compound's reputation is borrowed from, including what that literature does and does not
         support. It is the more informative of the two pages, because there is more to say.`]]
    ],
    basis: [
      ['Absence of published literature under this name',
        'No peer-reviewed pharmacology, pharmacokinetics, animal study or human data has been published for pentadeca arginate as of this review date'],
      ['BPC-157’s own evidence base',
        'A rodent literature with no published human controlled trials; see the BPC-157 page on this site'],
      ['Salt form and peptide stability',
        'General peptide chemistry; the principle is established, its application to this preparation is not demonstrated'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `When there is no published dose and no published half-life, your own record is the entire
      dataset. TherapyLog keeps the amount, the date and what followed.`
  },
};
