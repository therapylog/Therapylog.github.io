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
    title: 'Testosterone Cypionate: half-life and dosing | TherapyLog',
    description: 'What the cypionate ester does to the release curve, why the schedule is weekly or twice weekly, and the bloodwork that follows.',
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
    title: 'Testosterone Enanthate: half-life and dosing | TherapyLog',
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
    title: 'Semaglutide: mechanism and titration | TherapyLog',
    description: 'The GLP-1 agonist behind the STEP and SELECT trials: mechanism, why titration runs in four-week steps, and what the panel asks.',
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
    title: 'Tirzepatide: mechanism and titration | TherapyLog',
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
    title: 'Metformin: mechanism, dosing and monitoring | TherapyLog',
    description: 'Hepatic glucose output, AMPK, the B12 problem, the renal limit, and where the longevity evidence for metformin actually is.',
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
    title: 'Rapamycin: mTOR inhibition and weekly dosing | TherapyLog',
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
    title: 'Anastrozole: aromatase inhibition and dosing | TherapyLog',
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
    title: 'HCG: LH receptor agonism and dosing | TherapyLog',
    description: 'Why hCG acts like luteinising hormone, why it lasts a hundred times longer, and what it does to testicular volume and estradiol.',
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
    title: 'Clomiphene: SERM pharmacology and dosing | TherapyLog',
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
    title: 'Recombinant HGH (somatropin): pharmacology | TherapyLog',
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
    title: 'BPC-157: the evidence, and what is unknown | TherapyLog',
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
    title: 'TB-500 and thymosin beta-4: the evidence | TherapyLog',
    description: 'TB-500 is described as thymosin beta-4, but the two are not the same molecule. What the research covers, and what that means.',
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
          migration &mdash; the process by which cells move into a wound. That role is not in
          dispute; it is basic cell biology.`,
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
    title: 'CJC-1295 without DAC: what it actually is | TherapyLog',
    description: 'What is sold as CJC-1295 without DAC is modified GRF(1-29), a thirty-minute peptide. The DAC was the innovation in the name.',
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
    title: 'Ipamorelin: selective GH secretagogue | TherapyLog',
    description: 'Ipamorelin releases growth hormone through the ghrelin receptor with little cortisol or prolactin effect. What the selectivity is worth.',
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
          Ipamorelin is a synthetic agonist at that receptor. It is not a GHRH
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
    title: 'Retatrutide: triple agonist, trial data | TherapyLog',
    description: 'A GIP, GLP-1 and glucagon agonist in late-stage trials. What the glucagon arm adds, and why nothing sold is the trial drug.',
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
    title: 'MK-677 (ibutamoren): what the trials found | TherapyLog',
    description: 'An oral ghrelin receptor agonist with a day-long half-life. What continuous rather than pulsatile GH does, and what two years of it showed.',
    lede: `The only orally active growth hormone secretagogue in common use, and the one with the
      most human trial data behind it. That data is worth reading carefully, because it is more
      informative than the marketing and less flattering.`,
    sections: [
      {
        h2: 'Continuous rather than pulsatile, and why that is the whole story',
        paras: [
          `MK-677 is a non-peptide agonist at the ghrelin receptor &mdash; the
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
    title: 'Sermorelin: GHRH(1-29) and a lapsed approval | TherapyLog',
    description: 'Sermorelin is GHRH(1-29), once an approved product and withdrawn for commercial reasons. Why its half-life is twelve minutes.',
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
    title: 'Cagrilintide: the amylin analogue | TherapyLog',
    description: 'A long-acting amylin analogue working through a satiety pathway GLP-1 does not touch. What amylin does, and what trials measured.',
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
    title: 'Epithalon: the telomerase claims examined | TherapyLog',
    description: 'A tetrapeptide studied almost entirely by one research group. What the telomerase claims are, and what replication exists.',
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
    title: 'Pentadeca arginate (PDA): what is known | TherapyLog',
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

  tesam: {
    slug: 'tesamorelin',
    h1: 'Tesamorelin: the one GHRH analogue that finished the approval process',
    title: 'Tesamorelin: the approved GHRH analogue | TherapyLog',
    description: 'A GHRH analogue with a real FDA approval, for one specific indication. What the trials measured, and what happens when it stops.',
    lede: `Almost every growth-hormone peptide in this reference is a research compound. This one is
      an approved drug, for one narrow indication, with the trial data that implies. Both halves of
      that sentence matter when reading anything written about it.`,
    sections: [
      {
        h2: 'What it is, and what it was approved for',
        paras: [
          `Tesamorelin is a stabilised analogue of growth-hormone-releasing hormone: the native
          44-amino-acid sequence with a trans-3-hexenoyl group attached at the N-terminus, which is
          what keeps DPP-4 from cutting it. Like every GHRH analogue it acts on the pituitary rather
          than replacing its output, so the axis&rsquo;s own feedback stays in place and growth
          hormone is released in pulses rather than held up continuously.`,
          `@@EV_ESTABLISHED@@ The approval is for excess visceral adipose tissue in adults with
          HIV-associated lipodystrophy, and that is a narrower thing than "body composition". The
          trials measured visceral fat by CT scan and reported reductions in the region of 15 to 18
          per cent against placebo over six to twelve months, with IGF-1 rising into the normal
          range and triglycerides improving. Subcutaneous fat did not change much, which is the
          point: the drug was developed for the compartment that carries the metabolic risk.`,
          `The finding that travels least well is what happened on withdrawal. In the extension
          phase, participants who stopped regained the visceral fat they had lost. That is not a
          criticism of the drug &mdash; it is a description of what kind of intervention it is, and
          it is the single most useful thing to know before starting one.`
        ]
      },
      {
        h2: 'A half-life of minutes, an effect measured in months',
        paras: [
          `The app models the peptide at a half-life well under an hour, which is normal for this
          class and tells you almost nothing about the effect. What the injection does is trigger a
          growth hormone pulse; what the pulse does is raise hepatic IGF-1, which turns over on a
          scale of days; what IGF-1 does to visceral fat took the trials months to measure. Three
          different timescales stacked on top of each other, and only the shortest of them is the
          half-life.`,
          `That is why the monitoring marker is IGF-1 rather than growth hormone, and why the
          protocol is daily rather than as-needed. The <a href="/markers/igf-1/">IGF-1 page</a>
          covers why the reference interval is age-dependent and what a change in it does and does
          not mean. The <a href="/tools/half-life/tesamorelin/">half-life page</a> has the curve
          for the peptide itself.`
        ]
      },
      {
        h2: 'The trade-off that shows up on the panel',
        paras: [
          `@@EV_ESTABLISHED@@ Raising growth hormone reduces insulin sensitivity, and tesamorelin is
          not exempt. The trials recorded increases in fasting glucose and in HbA1c, mostly modest
          and mostly reversible, and glycaemic monitoring is part of the approved labelling rather
          than an optional extra. In a population being treated for a metabolic problem, a drug
          that improves visceral fat while nudging glucose the other way is a trade to be measured
          rather than assumed.`,
          `Fluid retention, joint discomfort and injection-site reactions are the other reported
          effects, and they are dose-related and familiar from the whole GH axis. @@EV_OFFLABEL@@
          Use outside the approved indication &mdash; general body composition, or the cognitive
          question a small trial in older adults has raised &mdash; is off-label and rests on
          evidence collected in a different population for a different endpoint. Whether any of it
          applies to a particular person is a prescribing decision, and anything experienced while
          taking it belongs with the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. Unusually reliable for a peptide, because these came
      out of a trial programme that reached a regulator rather than from case reports.`,
    faq: [
      ['Is it better than the research GHRH analogues?', [
        `It is the one with a completed trial programme and an approved label, which is a statement
         about evidence rather than about potency. Sermorelin and modified GRF(1-29) act at the same
         receptor; what they do not have is a body of controlled human data for any indication. That
         difference is the whole reason this page can quote percentages.`]],
      ['Does the visceral fat come back?', [
        `In the trial extension it did, in people who stopped. Treat it as an ongoing intervention
         rather than a course with an end point, and have the conversation about stopping before
         starting rather than after.`]],
      ['Why is IGF-1 the marker rather than growth hormone?', [
        `Because growth hormone is released in pulses and cleared in hours, so a single measurement
         mostly reports where in a pulse the needle went. IGF-1 integrates exposure over a longer
         window. That is true across this whole class of compounds.`]],
      ['What does it cost metabolically?', [
        `Reduced insulin sensitivity, showing up as fasting glucose and HbA1c drifting upward. It
         was modest and largely reversible in the trials, and it is monitored rather than ignored —
         the <a href="/markers/hba1c-and-fasting-glucose/">HbA1c page</a> covers why those two
         markers can disagree.`]]
    ],
    basis: [
      ['Visceral fat reduction and the withdrawal result',
        'The tesamorelin phase III programme in HIV-associated lipodystrophy, reported 2010 onward, including the extension phase'],
      ['Approved indication and glycaemic monitoring',
        'The approval string in the fact box is app.html’s own field; the monitoring requirement comes from the approved labelling'],
      ['GHRH analogue mechanism',
        'Standard endocrinology references on growth hormone releasing hormone'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A daily injection judged on a quarterly lab and a scan is exactly the case for a written
      record. TherapyLog keeps the dose beside the IGF-1.`
  },

  dutast: {
    slug: 'dutasteride-and-finasteride',
    h1: 'Dutasteride and finasteride: what suppressing DHT actually costs',
    title: 'Dutasteride and finasteride: the DHT trade | TherapyLog',
    description: 'Type I and type II 5-alpha reductase, 70 versus 90 per cent suppression, a 35-day half-life, and what a 5-ARI does to your PSA.',
    lede: `Two drugs that do the same thing to different degrees, with a genuine benefit, a genuine
      and contested harm, and one practical consequence for bloodwork that gets missed more often
      than either.`,
    sections: [
      {
        h2: 'Two isoenzymes, two drugs',
        paras: [
          `5-alpha reductase converts testosterone to dihydrotestosterone, an androgen several times
          more potent at the receptor. It exists as two main isoenzymes: type II dominates in the
          prostate and hair follicles, type I in skin, liver and sebaceous glands.
          @@EV_ESTABLISHED@@ Finasteride inhibits type II and lowers serum DHT by roughly 70 per
          cent; dutasteride inhibits both and lowers it by roughly 90 per cent. That is the entire
          pharmacological difference, and it is a difference of degree.`,
          `The half-lives are not a difference of degree. Finasteride clears in hours. The app
          models dutasteride at about 35 days, which is among the longest in this whole reference,
          and the practical consequence is that stopping it is not an event but a process: serum
          DHT takes months to return, and anyone deciding whether an effect is drug-related is
          working against a very slow washout.`,
          `Both are established treatments &mdash; benign prostatic hyperplasia for both, male
          pattern hair loss for finasteride &mdash; and the hair-loss efficacy data is solid. This
          page is not arguing that they do not work. It is about what else they do.`
        ]
      },
      {
        h2: 'The PSA correction almost nobody is told about',
        paras: [
          `@@EV_ESTABLISHED@@ A 5-alpha reductase inhibitor roughly halves serum PSA after six to
          twelve months of use. That is a drug effect, not a change in the prostate, and it means a
          PSA drawn on one of these drugs has to be interpreted against that: the conventional
          adjustment is to double the measured value before comparing it to a reference range built
          on untreated men.`,
          `The failure mode is specific and serious. A man on finasteride with a PSA of 2.0 has an
          effective PSA nearer 4.0, and a clinician who does not know he is taking it reads a
          reassuring number. This is why the drug belongs on the medication list handed to whoever
          orders the test, and why a rising PSA on a 5-ARI &mdash; even one still inside the range
          &mdash; is the finding that matters rather than the absolute value.`
        ]
      },
      {
        h2: 'The contested harm, described accurately',
        paras: [
          `@@EV_OFFLABEL@@ Sexual dysfunction &mdash; reduced libido, erectile difficulty, reduced
          ejaculate volume &mdash; is a recognised adverse effect and appears in the labelling. What
          is contested is whether a subset of men experience symptoms that persist after stopping,
          the cluster usually called post-finasteride syndrome. Reports are consistent enough that
          regulators in several countries have added warnings; controlled evidence establishing
          incidence, mechanism or predisposition does not exist, and the studies that have looked
          disagree.`,
          `Two things follow from that honestly. The risk is not zero and not quantified, which
          means a decision to take one of these is a decision made under genuine uncertainty rather
          than a settled calculation. And the long washout means a trial period is not really
          available with dutasteride the way it is with finasteride.`,
          `DHT is not a waste product. It contributes to libido, erectile function, and to the
          androgenic side of body composition, and the <a href="/markers/dht/">DHT page</a> covers
          what a serum measurement can and cannot tell you about any of that. There is also a
          teratogenicity point that is not optional: these drugs are hazardous in pregnancy, and
          the tablets should not be handled by anyone who could be pregnant. Every part of this
          belongs in a conversation with the clinician who prescribes, before starting rather than
          after.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first item is the one that deserves the most
      thought rather than the least.`,
    faq: [
      ['Is dutasteride simply stronger finasteride?', [
        `It inhibits both isoenzymes rather than one, so it suppresses more DHT, and it has a
         far longer half-life. "Stronger" is accurate for the suppression and misleading for the
         decision: more complete suppression is more of whatever you wanted and more of whatever
         you did not, and it is much harder to reverse.`]],
      ['Does it interact with testosterone therapy?', [
        `The app records a rule about the combination and it is in the interactions section on this
         page. The mechanism is straightforward — testosterone therapy raises the substrate, a 5-ARI
         blocks the conversion — and the reason people combine them is hair. What that costs is the
         subject of this page.`]],
      ['Can the dose be lowered instead of stopped?', [
        `Intermittent and reduced-dose schedules are described in practice, on the reasoning that
         suppression is dose-related. Whether that is a sensible course for a particular person is a
         prescribing decision, and with dutasteride the long half-life blurs what "intermittent"
         even means.`]],
      ['How long until DHT recovers after stopping?', [
        `With finasteride, days to weeks. With dutasteride, months — five half-lives at the modelled
         figure is roughly six months. Any assessment of whether an effect was drug-related has to be
         read against that timescale.`]]
    ],
    basis: [
      ['70 versus 90 per cent DHT suppression',
        'The comparative pharmacology of type II and dual 5-alpha reductase inhibition, established in the BPH trial literature'],
      ['PSA halving on a 5-ARI',
        'Reported consistently in the long-term BPH prevention trials and reflected in urology guidance on interpreting PSA in treated men'],
      ['Persistent sexual dysfunction reports',
        'Post-marketing reports and regulatory label changes in several countries; incidence and mechanism are not established'],
      ['Modelled half-lives', 'app.html’s TL_PK entry, which models the dutasteride figure']
    ],
    cta: `A drug with a 35-day half-life makes the start and stop dates the most important numbers
      you have. TherapyLog keeps them beside the PSA.`
  },

  t4: {
    slug: 'levothyroxine-t4',
    h1: 'Levothyroxine (T4): a seven-day half-life, and why absorption decides the dose',
    title: 'Levothyroxine (T4): absorption and dosing | TherapyLog',
    description: 'A prohormone with a week-long half-life. Why labs before six weeks are premature, what blocks absorption, and what TRT does to total T4.',
    lede: `The most prescribed hormone in the country, and a drug whose dose is decided less by
      pharmacology than by how much of the tablet actually gets absorbed. Six weeks to steady state,
      and a long list of things that interfere.`,
    sections: [
      {
        h2: 'A prohormone, and what that implies',
        paras: [
          `@@EV_ESTABLISHED@@ Levothyroxine is synthetic thyroxine, and thyroxine is not the active
          hormone. It circulates bound to thyroxine-binding globulin, albumin and transthyretin, and
          the deiodinase enzymes in peripheral tissue convert a fraction of it to triiodothyronine,
          which is what binds the receptor. Replacing T4 therefore relies on the conversion step
          working, which in most people it does.`,
          `Its half-life is about a week, and that single number explains most of how it is used.
          Once-daily dosing produces a nearly flat level. A missed dose barely registers. And a
          change takes about five half-lives to settle, which is why the conventional interval
          before rechecking is six weeks &mdash; a panel drawn at three weeks is measuring a level
          still moving, and adjusting on it is how people end up oscillating.`,
          `The therapeutic index is narrow enough that formulation matters. Different products and
          different generics are not always superimposable in absorption, and switching between them
          without rechecking is a recognised source of drift.`
        ]
      },
      {
        h2: 'Absorption is the variable',
        paras: [
          `@@EV_ESTABLISHED@@ Levothyroxine is absorbed in the small intestine and the fraction
          absorbed is modest and easily reduced. Food does it. Coffee does it, specifically and
          measurably. Calcium and iron supplements bind it. Proton pump inhibitors and other acid
          suppression reduce it. Coeliac disease, atrophic gastritis and <em>H. pylori</em> reduce
          it. This is why the instruction is an empty stomach with water, thirty to sixty minutes
          before anything else, and why "take it consistently" matters more than which hour you
          pick.`,
          `Consistency is the actionable version of all of that. A person who takes it with coffee
          every day is on a stable, if lower, absorbed dose; a person who takes it with coffee some
          days is producing their own variability and then attributing it to the thyroid. The most
          common reason a dose "stopped working" is a change in what surrounds it.`
        ]
      },
      {
        h2: 'Reading the panel, and one thing testosterone does to it',
        paras: [
          `Dosing is conventionally titrated against TSH, and the argument about that is genuine
          rather than fringe: a proportion of people on levothyroxine with a TSH squarely in range
          continue to report symptoms, and whether that reflects inadequate tissue T3, an unrelated
          cause, or the limits of a population reference interval applied to an individual is not
          settled. @@EV_OFFLABEL@@ Combination therapy with liothyronine is the intervention that
          argument usually leads to, and the randomised evidence for it has mostly not shown
          consistent benefit over T4 alone.`,
          `One finding on this panel is specific to this site&rsquo;s readers and is not thyroid
          disease. @@EV_ESTABLISHED@@ Testosterone lowers thyroxine-binding globulin, so a man on
          testosterone therapy can show a low <em>total</em> T4 with entirely normal free hormones
          and a normal thyroid. Reading totals rather than free hormones in that situation generates
          alarm and sometimes generates a prescription. The
          <a href="/markers/thyroid-panel/">thyroid panel page</a> covers which values to read and
          why.`,
          `Over-replacement is the risk that accumulates quietly: a suppressed TSH sustained over
          years is associated with reduced bone density and with atrial fibrillation, particularly
          in older people. None of that is a page&rsquo;s call to make. Dose, formulation and target
          belong with the clinician who prescribes, reading your own report against the interval
          your own lab printed.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. Note how many are about absorption and conversion
      rather than about the drug: that is an accurate reflection of where the problems live.`,
    faq: [
      ['How long before labs mean anything after a change?', [
        `About six weeks. Five half-lives at a week each is five weeks to a settled level, and TSH
         lags the free hormones by a further stretch. Drawing earlier measures a system still moving.`]],
      ['Does it matter which brand or generic?', [
        `It can. The therapeutic index is narrow and absorption is not identical across products, so
         switching is a reason to recheck at six weeks rather than assume equivalence. That is a
         pharmacy and prescriber conversation.`]],
      ['Why does my total T4 look low on testosterone therapy?', [
        `Because testosterone lowers thyroxine-binding globulin, and total T4 measures bound plus
         free. The free hormones are the ones to read. This is a binding-protein effect, not thyroid
         disease, and it is covered on the thyroid panel page.`]],
      ['Is T4 alone enough?', [
        `For most people the conversion step works and it is. A minority report persistent symptoms
         with a normal TSH, and that is where the combination-therapy argument comes from — an
         argument the randomised evidence has not settled in favour of either side.`]]
    ],
    basis: [
      ['Absorption interference by food, coffee, calcium and acid suppression',
        'Well characterised in the levothyroxine pharmacology literature and reflected in prescribing information'],
      ['Randomised evidence on T4 versus T4 plus T3',
        'Multiple randomised trials and meta-analyses from the 2000s onward, without consistent benefit for combination therapy'],
      ['Testosterone and thyroxine-binding globulin',
        'See the thyroid panel page on this site for the binding-protein effect and its sources'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `Six weeks between a change and a meaningful lab is long enough to forget when the change
      happened. TherapyLog dates it.`
  },

  t3: {
    slug: 'liothyronine-t3',
    h1: 'Liothyronine (T3): a short half-life, a suppressed TSH, and a real argument',
    title: 'Liothyronine (T3): the optimisation debate | TherapyLog',
    description: 'The active thyroid hormone, taken directly. Why the TSH stops being usable, why a free T3 is a peak, and what the trials actually found.',
    lede: `T4 is a prohormone; T3 is the hormone. Taking it directly skips the conversion step, and
      it also skips most of the buffering that makes thyroid replacement forgiving. Two consequences
      follow, and both are about measurement.`,
    sections: [
      {
        h2: 'Skipping the conversion step',
        paras: [
          `@@EV_ESTABLISHED@@ Triiodothyronine binds the thyroid hormone receptor directly. Every
          effect attributed to thyroid hormone &mdash; metabolic rate, cardiac output, thermogenesis,
          cognition &mdash; is a T3 effect, and T4 produces them only after deiodinase enzymes remove
          an iodine. Taking T3 removes that step, which is the entire argument for it: someone whose
          conversion is impaired gets the hormone anyway.`,
          `It also removes the buffer. The body normally holds a large, slowly turning pool of T4
          and converts from it as needed, which smooths supply. Dosing T3 directly replaces a
          regulated conversion with a fixed schedule, and the app models its half-life at about a
          day against thyroxine&rsquo;s week. That is why it is described in split doses, and why
          the level over a day is a series of peaks rather than a plateau.`
        ]
      },
      {
        h2: 'Two measurement problems it creates',
        paras: [
          `The first is TSH. @@EV_ESTABLISHED@@ Therapeutic T3 suppresses thyroid-stimulating
          hormone, and that is expected rather than a finding. But it means the marker that titrates
          T4 therapy stops working here: a suppressed TSH on T3 tells you the pituitary is seeing
          hormone, not whether the dose is right. Whatever the target is, TSH is not it.`,
          `The second is the free T3 measurement itself. With a day-long half-life and split dosing,
          a level drawn two hours after a dose is a peak and a level drawn before the next one is a
          trough, and they can differ substantially. A free T3 without a recorded interval since the
          last dose is close to uninterpretable, and comparing two of them drawn at different points
          is worse than having neither. The
          <a href="/markers/thyroid-panel/">thyroid panel page</a> covers what the individual values
          mean.`,
          `Those two together are why this is a harder drug to run than levothyroxine, not a
          stronger one. The feedback loop that makes T4 forgiving has been removed at both ends.`
        ]
      },
      {
        h2: 'What the evidence says, and the risk that accrues quietly',
        paras: [
          `@@EV_OFFLABEL@@ The clinical argument is about people who remain symptomatic on
          levothyroxine with a normal TSH. Combination T4 and T3 therapy is the usual proposal, and
          the randomised trials have mostly not found consistent benefit over T4 alone on the
          outcomes they measured &mdash; while some preference studies have found patients choosing
          combination therapy when blinded. Those two findings are not contradictory and neither
          settles it. Anyone telling you the question is closed in either direction is
          overstating.`,
          `@@EV_ESTABLISHED@@ The risk side is better established. Sustained excess thyroid hormone
          reduces bone mineral density and raises the incidence of atrial fibrillation, and both
          accumulate silently over years rather than announcing themselves. This is the reason T3 is
          described as physician-supervised everywhere in the app&rsquo;s own entry, and the reason
          resting heart rate and bone density appear on the monitoring panel alongside the
          hormones.`,
          `Symptoms of too much overlap with the symptoms people started treatment for &mdash;
          palpitations, anxiety, poor sleep, heat intolerance &mdash; which makes self-titration
          particularly unreliable here. Anything on that list belongs with the clinician who
          prescribed, read against your own lab&rsquo;s printed intervals.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The bone and cardiac items are the ones that do not
      produce a symptom until they are advanced, which is what makes them the ones to plan around.`,
    faq: [
      ['Why is my TSH suppressed on T3?', [
        `Because exogenous T3 feeds back on the pituitary directly. It is expected on therapeutic
         doses rather than a new finding, and it is why TSH cannot be used to titrate here the way it
         is with levothyroxine.`]],
      ['When should free T3 be drawn?', [
        `At a consistent point relative to the dose, recorded with the result. With a day-long
         half-life and split dosing the value moves substantially across the day, so the interval is
         part of the measurement rather than a detail beside it.`]],
      ['Is combination T4 and T3 better than T4 alone?', [
        `The randomised trials have mostly not shown consistent benefit on measured outcomes; some
         blinded preference studies have found patients favouring combination therapy. The question is
         open, and it is a prescribing conversation rather than one a page can answer.`]],
      ['What does "sustained-release T3" change?', [
        `The intent is to flatten the peaks a short half-life produces. Compounded slow-release
         preparations vary in how well they achieve that, and a preparation whose release profile is
         not characterised does not remove the measurement problem — it hides it.`]]
    ],
    basis: [
      ['Deiodinase conversion and direct receptor binding',
        'Standard endocrinology references on thyroid hormone physiology'],
      ['Randomised evidence on combination therapy',
        'Multiple randomised trials and meta-analyses from the 2000s onward, alongside blinded preference studies reporting a different result'],
      ['Bone density and atrial fibrillation with excess thyroid hormone',
        'Long-established in the endocrinology literature on subclinical hyperthyroidism'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A split-dose hormone whose level swings across the day is only readable if the draw time
      is written down. TherapyLog records it with the dose.`
  },

  caberg: {
    slug: 'cabergoline',
    h1: 'Cabergoline: a long-acting dopamine agonist, and when prolactin actually needs treating',
    title: 'Cabergoline: dopamine agonism and prolactin | TherapyLog',
    description: 'A D2 agonist with a two-and-a-half-day half-life. Why a single high prolactin is repeated before anything is done, and what the valve question is.',
    lede: `Highly effective at the thing it does, and prescribed for a number that is wrong more
      often than most. The pharmacology is simple; the difficulty is deciding whether the result
      that prompted it was real.`,
    sections: [
      {
        h2: 'What it does, and why twice weekly',
        paras: [
          `@@EV_ESTABLISHED@@ Prolactin release from the pituitary is under continuous inhibitory
          control by dopamine &mdash; unusually, the default state is suppression rather than
          stimulation. Cabergoline is a dopamine D2 receptor agonist that supplies that inhibition
          pharmacologically, and it is the first-line treatment for hyperprolactinaemia and for
          prolactin-secreting pituitary adenomas, where it both normalises the hormone and shrinks
          the tumour.`,
          `The app models its half-life at about two and a half days, which is very long for this
          class and is why a twice-weekly schedule works where other dopamine agonists need daily
          dosing. It also means the level accumulates for a couple of weeks before it settles, so an
          effect assessed at one week is being assessed before the drug has finished arriving.`
        ]
      },
      {
        h2: 'Most high prolactin results are not what they look like',
        paras: [
          `@@EV_ESTABLISHED@@ Prolactin is one of the easiest hormones to elevate by accident. It
          rises with the stress of venipuncture itself, with sleep, with exercise, with a meal, with
          nipple stimulation, and with a long list of common medications &mdash; antipsychotics and
          some antidepressants and antiemetics among them. A mildly high value on a single draw is
          more often one of those than a pituitary problem, which is why the standard response is to
          repeat it under controlled conditions rather than to treat it.`,
          `The other trap is macroprolactin: prolactin bound into large immune complexes that most
          immunoassays detect but which is biologically inactive. Someone with macroprolactinaemia
          has a genuinely high assay result and no disease, and the laboratory test that separates
          them has to be requested. Treating that patient achieves nothing except side effects.
          The <a href="/markers/prolactin/">prolactin page</a> covers both problems and how the
          units differ between labs.`,
          `@@EV_OFFLABEL@@ In hormone-therapy contexts, cabergoline is often used against prolactin
          elevated by progestogenic anabolic compounds &mdash; which this site does not publish
          pages for &mdash; or by higher-dose gonadotropin use. The app&rsquo;s own protocol note
          is explicit that it should not be used prophylactically without a confirmed lab result,
          and that is the right instinct: this is a drug that treats a number, so the number has to
          be real first.`
        ]
      },
      {
        h2: 'The valve question, stated in proportion',
        paras: [
          `@@EV_ESTABLISHED@@ Ergot-derived dopamine agonists are associated with cardiac valve
          fibrosis, and the finding is real. What matters is the dose. The association was
          established in Parkinson&rsquo;s disease, where cumulative doses run an order of magnitude
          or more above what is used for hyperprolactinaemia, and studies at endocrine doses have
          largely not found clinically significant valvulopathy. That is reassuring rather than
          conclusive, and it is why guidance for long-term use at higher endocrine doses includes
          periodic echocardiography.`,
          `The commoner effects are nausea, which is worst at initiation and usually settles,
          orthostatic dizziness, and fatigue. Impulse-control problems &mdash; a recognised class
          effect of dopamine agonists &mdash; are rare at these doses but worth naming, because
          the person experiencing one is often the last to attribute it to a tablet taken twice a
          week.`,
          `All of it is a prescribing decision made against a confirmed result. Anything on this
          page that you are actually experiencing belongs with the clinician who prescribed it,
          who is the only person who can weigh it against why you started.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The fourth item — that it is not needed unless
      prolactin is genuinely elevated — is the one that prevents the other five.`,
    faq: [
      ['How high does prolactin have to be before it means something?', [
        `That is a clinician call against your own lab’s interval, and it depends on how the sample
         was taken. What is standard is that a mildly high value is repeated under controlled
         conditions, and that macroprolactin is excluded, before anything is treated.`]],
      ['How long until it works?', [
        `Prolactin usually falls within days and normalises over weeks. Because the half-life is
         long, the level of the drug itself is still accumulating for the first couple of weeks, so
         early assessments underestimate the eventual effect.`]],
      ['Is an echocardiogram necessary?', [
        `Guidance generally reserves it for higher doses or long-term use, on the basis that the
         valve association was established at Parkinson’s-disease doses far above endocrine ones.
         Whether it applies to a particular person and schedule is a prescribing decision.`]],
      ['Does it affect testosterone?', [
        `Indirectly. High prolactin suppresses gonadotropin release and therefore testosterone, so
         correcting a genuinely elevated prolactin can raise it. Correcting a normal prolactin does
         nothing useful. The <a href="/markers/lh-fsh/">LH and FSH page</a> covers that axis.`]]
    ],
    basis: [
      ['Dopaminergic inhibition of prolactin release',
        'Standard endocrinology references on pituitary regulation'],
      ['Macroprolactin and pre-analytical elevation',
        'See the prolactin page on this site for the assay and sampling problems and their sources'],
      ['Valve fibrosis at Parkinson’s-disease doses versus endocrine doses',
        'The valvulopathy literature from 2007 onward, and subsequent studies at hyperprolactinaemia doses'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A twice-weekly tablet judged on a hormone that moves with the draw itself needs the dates
      written down. TherapyLog keeps them.`
  },

  exemest: {
    slug: 'exemestane',
    h1: 'Exemestane: irreversible aromatase inhibition, and what that changes',
    title: 'Exemestane: irreversible aromatase inhibition | TherapyLog',
    description: 'A steroidal aromatase inactivator rather than a competitive blocker. What irreversibility means in practice, and why it is not dose-equivalent.',
    lede: `Anastrozole competes with the substrate for the enzyme; exemestane destroys the enzyme.
      That difference sounds academic and has one very practical consequence: an overshoot here does
      not resolve when the drug clears.`,
    sections: [
      {
        h2: 'Inactivation, not competition',
        paras: [
          `@@EV_ESTABLISHED@@ Aromatase converts androgens to oestrogens. Anastrozole and letrozole
          are non-steroidal inhibitors that bind the enzyme reversibly and compete with the natural
          substrate: remove the drug and the enzyme works again. Exemestane is a steroidal analogue
          of the substrate itself, and it binds irreversibly &mdash; the enzyme is permanently
          inactivated, and activity returns only as the cell synthesises new enzyme.`,
          `The half-life of the drug is therefore not the duration of the effect. The app models
          about a day for the molecule; recovery of aromatase activity is measured in days beyond
          that, and depends on protein turnover rather than clearance. Anyone reasoning about
          exemestane from its half-life is reasoning about the wrong quantity.`,
          `The practical consequence is asymmetric. Suppressing too little is easy to correct.
          Suppressing too much is not corrected by stopping and waiting a day, which is exactly the
          situation an aromatase inhibitor should be least likely to create. That is the main
          argument for treating exemestane as the less forgiving of the two.`
        ]
      },
      {
        h2: 'It is a steroid, and that cuts both ways',
        paras: [
          `@@EV_OFFLABEL@@ Being a steroidal molecule gives exemestane properties anastrozole does
          not have. It is weakly androgenic itself and is metabolised to 17-hydroxyexemestane, which
          is more so. That is offered as an advantage &mdash; a lipid profile that some argue holds
          up better than with the non-steroidal inhibitors &mdash; and it is also the source of the
          androgenic effects the app&rsquo;s own drawbacks list mentions. Both follow from the same
          fact.`,
          `The two drugs are not dose-equivalent and results with one do not transfer to the other.
          Milligram comparisons between them are meaningless: they inhibit the same enzyme by
          mechanisms with different kinetics and different recovery. A schedule copied across from
          anastrozole is a guess.`
        ]
      },
      {
        h2: 'Everything the anastrozole page says still applies',
        paras: [
          `@@EV_ESTABLISHED@@ Oestrogen in men is required for bone mineralisation, contributes to
          libido and erectile function, and affects lipid handling. Suppressing it toward zero is not
          a conservative choice, and the symptoms of too little overlap almost entirely with the
          symptoms of too much &mdash; low libido, flat mood, joint aches. Distinguishing them
          requires a measurement, and it has to be a sensitive assay: standard immunoassay estradiol
          is unreliable at male concentrations. The
          <a href="/markers/estradiol-sensitive-vs-standard/">estradiol assay page</a> covers why.`,
          `@@EV_OFFLABEL@@ Use in hormone therapy is off-label; the approval is in oncology, where
          the goal is maximal suppression in a completely different population. The direction of
          practice over the last decade has been away from routine or prophylactic aromatase
          inhibition and toward adjusting the testosterone protocol first. The
          <a href="/compounds/anastrozole/">anastrozole page</a> covers that argument in full, and
          it applies here with the added caution that this drug is harder to walk back.`,
          `Which of these applies to a particular person, and at what amount, is a decision made
          from a sensitive-assay result by a prescriber. Anything on the drawbacks list below that
          you are experiencing belongs in front of them rather than being managed against a page.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first item is the one that distinguishes this drug
      from the alternative, and it is a reason for more caution rather than less.`,
    faq: [
      ['Is exemestane better than anastrozole for men?', [
        `It has a different mechanism, a steroidal structure and arguments made for its lipid
         profile. It is also irreversible, which makes over-suppression harder to undo. "Better"
         depends on which of those matters more for a given person, and that is a prescribing
         judgement rather than a settled answer.`]],
      ['Can it be dosed like anastrozole?', [
        `No. They are not dose-equivalent, and the kinetics of recovery differ completely — one
         resolves as the drug clears, the other as new enzyme is made. Converting a schedule between
         them by milligrams has no basis.`]],
      ['What does over-suppression look like?', [
        `A sensitive-assay estradiol below the lower reference limit, usually with joint discomfort,
         low libido and low mood that began after the inhibitor rather than before it. The temporal
         relationship is the informative part, which is the argument for recording when a change was
         made.`]],
      ['Why is the effect longer than the half-life?', [
        `Because the enzyme is inactivated rather than blocked. Clearing the drug does not restore
         activity; synthesising new aromatase does, and that runs on protein turnover rather than
         pharmacokinetics.`]]
    ],
    basis: [
      ['Irreversible steroidal inactivation versus competitive inhibition',
        'The comparative pharmacology of type I and type II aromatase inhibitors, established in the oncology literature'],
      ['Androgenic metabolite',
        '17-hydroxyexemestane is a recognised active metabolite with androgenic activity'],
      ['Oestrogen’s role in male bone and lipid handling',
        'Case reports of aromatase deficiency and oestrogen-receptor mutation in men, N Engl J Med, 1994, and the subsequent literature'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry, which describes the molecule rather than the enzyme recovery']
    ],
    cta: `An inhibitor whose effect outlasts its half-life makes the date of the last change the
      number that matters. TherapyLog keeps it beside the estradiol.`
  },

  pt141: {
    slug: 'pt-141',
    h1: 'PT-141: a melanocortin agonist that works on desire rather than plumbing',
    title: 'PT-141 (bremelanotide): how it differs | TherapyLog',
    description: 'Bremelanotide acts centrally on melanocortin receptors, not on blood vessels. What that changes, and why nausea is the dose-limiting effect.',
    lede: `Every other drug in this category works on blood flow. This one works in the brain, which
      is why it does something different and why its side effects are different too.`,
    sections: [
      {
        h2: 'A completely different target',
        paras: [
          `@@EV_ESTABLISHED@@ PDE5 inhibitors act peripherally: they prevent the breakdown of cyclic
          GMP in vascular smooth muscle, so an erection that has been initiated is sustained. They do
          nothing about whether the signal to initiate one arrives. Bremelanotide is a melanocortin
          receptor agonist acting in the central nervous system, principally at MC4R in the
          hypothalamus, on the circuitry that generates sexual desire and arousal in the first
          place. It is a fragment of the alpha-MSH family rather than anything related to
          testosterone.`,
          `That is why the two are not substitutes and why bremelanotide has been studied in people
          for whom PDE5 inhibitors did not work: they address different steps. It is also why it is
          taken before an occasion rather than daily &mdash; the app models a half-life under three
          hours, and the effect is an episode rather than a background state.`,
          `The approval is real but narrow: it is approved for hypoactive sexual desire disorder in
          premenopausal women. @@EV_OFFLABEL@@ Use in men is off-label, and it has been studied
          reasonably extensively in that population without an approval following. That is a
          meaningful distinction to hold on to when reading confident claims about it.`
        ]
      },
      {
        h2: 'Nausea is the effect that decides the dose',
        paras: [
          `Nausea is the most common adverse effect and it is dose-related, sometimes severe, and it
          is the reason the dosing rows the app records start low. Melanocortin receptors are
          expressed in brainstem regions involved in emesis, so this is mechanism rather than an
          idiosyncrasy. Flushing and a transient rise in blood pressure with a small fall in heart
          rate are the other consistent findings, which is why the approved labelling excludes people
          with uncontrolled hypertension or established cardiovascular disease.`,
          `@@EV_OFFLABEL@@ Hyperpigmentation is the effect that turns up with repeated use rather
          than with a single dose, and it comes from MC1R activity &mdash; the same receptor that
          drives tanning. Darkening of the face, gums and existing naevi has been reported. A
          moleprogression that would be worth a dermatologist&rsquo;s attention is exactly the
          thing this drug can also cause benignly, which is an argument for a baseline skin check
          rather than a reason for alarm.`
        ]
      },
      {
        h2: 'What it is not',
        paras: [
          `It is not a testosterone substitute and it does not treat low testosterone. Someone whose
          libido has fallen because their testosterone has fallen is being offered a drug that
          bypasses the question rather than answering it, and the useful order of operations is to
          measure first. The <a href="/markers/free-vs-total-testosterone/">free versus total
          testosterone page</a> covers what to measure and why the two can move differently.`,
          `It is also not a treatment for the many non-hormonal causes of low desire &mdash;
          relationship context, depression, medication side effects, sleep debt, alcohol. A drug
          that acts on the desire circuit will produce an effect regardless of why desire was low,
          and that is not the same as it being the right intervention.`,
          `Nitrates are the one hard contraindication worth stating on a page: the blood-pressure
          effect makes that combination dangerous. Everything else here &mdash; whether it applies,
          at what amount, alongside what else &mdash; is a prescribing decision, and any effect from
          the list below belongs with the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The nausea item is not a footnote — it is the effect
      that most often ends use, and it is predictable from the mechanism.`,
    faq: [
      ['Can it be combined with a PDE5 inhibitor?', [
        `They act at different steps and the combination is described in practice. Both affect blood
         pressure, which is the reason that decision belongs with a prescriber who knows your
         cardiovascular history rather than with a page.`]],
      ['Why does it cause tanning?', [
        `Because MC1R — the melanocortin receptor that controls melanin production — is one of the
         receptors it activates. That is the same mechanism the tanning peptides use, and it is why
         hyperpigmentation shows up with repeated dosing.`]],
      ['Is the female approval evidence for the male use?', [
        `Partly, and only partly. It establishes the mechanism works in people and gives a real
         safety database. The male trials were run and did not result in an approval, which is
         information in itself. Off-label means off-label.`]],
      ['How long does it last?', [
        `The app models a half-life under three hours, and the dosing rows describe taking it
         forty-five minutes or so beforehand. The subjective effect is reported as outlasting the
         peptide, which is what you would expect from something acting on a signalling circuit
         rather than on a muscle.`]]
    ],
    basis: [
      ['Central melanocortin mechanism versus peripheral PDE5 inhibition',
        'The bremelanotide pharmacology literature and the approved labelling for the female indication'],
      ['Nausea, blood pressure and hyperpigmentation',
        'The phase III programme for hypoactive sexual desire disorder, reported 2019'],
      ['Approved indication',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `An as-needed compound is the easiest one to lose track of. TherapyLog records what you
      took and when, so a pattern is visible rather than remembered.`
  },

  ldn: {
    slug: 'low-dose-naltrexone',
    h1: 'Low-dose naltrexone: a familiar drug at a fraction of the dose, doing something else',
    title: 'Low-dose naltrexone: what LDN actually is | TherapyLog',
    description: 'Naltrexone at a thirtieth of its approved dose, proposed to work by transient receptor blockade and TLR4 modulation. What the evidence covers.',
    lede: `The same molecule approved at 50 mg for opioid and alcohol dependence, used at 1.5 to
      4.5 mg for something entirely different. The dose is not a smaller version of the same
      intervention &mdash; it is the whole basis for the claim.`,
    sections: [
      {
        h2: 'Why the low dose is the point',
        paras: [
          `@@EV_ESTABLISHED@@ At its approved dose naltrexone blocks opioid receptors continuously,
          which is what makes it useful in dependence. @@EV_THEORETICAL@@ The low-dose proposal is
          different: a brief, partial blockade taken at night is said to provoke a compensatory
          upregulation of endogenous opioid production and receptor expression once the drug clears
          &mdash; a rebound rather than a block. A second and increasingly emphasised mechanism is
          antagonism at toll-like receptor 4 on microglia and other immune cells, which is where the
          anti-inflammatory and neuroinflammation claims come from and which is not an opioid
          mechanism at all.`,
          `Both are plausible and neither is settled in humans. The TLR4 account has better
          mechanistic support; the endorphin-rebound account is the older story and is the one most
          often repeated. The app models a half-life around six hours, which is consistent with a
          bedtime dose producing transient exposure and being gone by morning &mdash; the schedule
          is doing real work in the hypothesis rather than being a convenience.`
        ]
      },
      {
        h2: 'What the evidence actually covers',
        paras: [
          `@@EV_OFFLABEL@@ Small randomised trials have reported benefit in fibromyalgia and in
          Crohn&rsquo;s disease, and there is a wider body of observational and open-label work
          across multiple sclerosis, complex regional pain syndrome and other chronic pain and
          autoimmune conditions. The trials are genuinely randomised and genuinely small &mdash;
          tens of participants rather than hundreds &mdash; and large confirmatory trials have not
          been run. That is an unusual evidence profile: better than most things on this site,
          considerably weaker than an approved indication.`,
          `The practical consequences are two. Effects are described as taking four to eight weeks
          rather than days, so an early judgement is premature. And there is no biomarker that
          tracks it: the app records inflammatory markers where they are relevant to the underlying
          condition, but nothing on the panel tells you whether the drug is doing what it is
          supposed to. Assessment is symptomatic, which makes a written record of how you actually
          felt over time more useful here than almost anywhere else in this reference.`
        ]
      },
      {
        h2: 'The interaction that is not negotiable',
        paras: [
          `Naltrexone is an opioid antagonist at any dose. Taken alongside opioid analgesics it
          blunts or blocks them, and in someone who is opioid-dependent it can precipitate
          withdrawal. This is why the standard guidance is a gap of hours around any opioid dose and
          why anyone facing planned surgery needs the prescriber to know they are taking it &mdash;
          not because low-dose naltrexone is dangerous, but because analgesia planned without that
          knowledge may not work.`,
          `The other practical constraint is supply: 1.5 to 4.5 mg is not a manufactured strength, so
          it comes from a compounding pharmacy, and the accuracy of a compounded low-dose capsule is
          the compounder&rsquo;s to guarantee. This site names no pharmacy.`,
          `Vivid dreams and disturbed sleep in the first weeks are the commonly reported effects and
          usually settle. Anything that does not, or anything on the list below, belongs with the
          clinician who prescribed it &mdash; particularly for anyone with liver disease, where the
          drug&rsquo;s metabolism becomes a real consideration rather than a theoretical one.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the opioid item is the one with immediate
      practical consequences rather than gradual ones.`,
    faq: [
      ['Why at bedtime?', [
        `Because the endorphin-rebound hypothesis depends on transient exposure — a brief blockade
         overnight with the drug cleared by morning. Whether that mechanism is the operative one is
         unsettled, but the schedule follows from it and is what the trials used.`]],
      ['How long before it is worth judging?', [
        `The reported window is four to eight weeks. That is longer than most people expect, and it
         is the main reason people conclude it did nothing.`]],
      ['Can it be taken with painkillers?', [
        `Not with opioid ones without a prescriber’s plan — it antagonises them and can precipitate
         withdrawal in someone dependent. Non-opioid analgesics are unaffected. Anyone scheduling
         surgery should raise it in advance.`]],
      ['Is there a blood test that shows it is working?', [
        `No. Inflammatory markers are followed where the underlying condition warrants it, but nothing
         on a panel tracks the drug itself. Assessment is symptomatic, over weeks.`]]
    ],
    basis: [
      ['Randomised trials in fibromyalgia and Crohn’s disease',
        'Small randomised placebo-controlled trials published from 2007 onward, tens of participants each'],
      ['TLR4 antagonism as the proposed anti-inflammatory mechanism',
        'The preclinical glial and neuroinflammation literature from the 2000s onward'],
      ['Opioid antagonism at all doses',
        'Naltrexone prescribing information for the approved 50 mg indication'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A compound judged on how you felt over eight weeks needs the weeks written down.
      TherapyLog keeps the dose and the notes on one timeline.`
  },

  dhea: {
    slug: 'dhea',
    h1: 'DHEA: a precursor, which is the reason it is hard to dose',
    title: 'DHEA: a precursor, and why that complicates it | TherapyLog',
    description: 'DHEA converts to both androgens and oestrogens, and the ratio is individual. What DHEA-S measures, and why the trial results are mixed.',
    lede: `The most abundant steroid in circulation, sold over the counter, and genuinely difficult
      to reason about &mdash; because what it becomes depends on the person taking it.`,
    sections: [
      {
        h2: 'A substrate, not a hormone with one job',
        paras: [
          `@@EV_ESTABLISHED@@ DHEA is an adrenal steroid that sits upstream of both the androgen and
          the oestrogen pathways. Peripheral tissues convert it to androstenedione and onward to
          testosterone, and separately to estrone and estradiol, using enzymes whose expression
          differs by tissue, by sex and by individual. The consequence is that the same dose in two
          people produces different downstream hormones in different proportions, and neither of them
          can predict which without measuring.`,
          `It circulates mostly as the sulphated ester, DHEA-S, which is far more abundant and far
          more stable across the day than DHEA itself. That is why DHEA-S is what gets measured: the
          unsulphated hormone fluctuates with the adrenal rhythm, the sulphate does not. The app puts
          DHEA-S first on the monitoring panel for exactly that reason, alongside testosterone and
          estradiol &mdash; because the point is not the precursor level but what it turned into.`,
          `Levels fall with age from a peak in the twenties, and that decline is the entire origin
          of the supplementation idea. A decline is not by itself a deficiency, and this is one of
          the places where the distinction does real work.`
        ]
      },
      {
        h2: 'What the trials found, which is less than the marketing',
        paras: [
          `@@EV_OFFLABEL@@ Randomised trials in older adults have generally found small or absent
          effects on body composition, strength and quality of life, with the clearest signals in
          people who started with genuinely low levels &mdash; adrenal insufficiency being the case
          where replacement has the best support. In women, the topical vaginal preparation has a
          real approval for a real indication, which is a narrower claim than systemic
          supplementation.`,
          `The honest summary is that DHEA does something measurable to circulating hormones in most
          people and something clinically meaningful in a minority, and that the minority is
          identified by measuring rather than by symptoms. Taking it without a baseline DHEA-S is
          the common pattern and the one least likely to inform anything.`,
          `@@EV_OFFLABEL@@ In hormone-therapy contexts there is a second consideration. Someone
          already on testosterone is adding a precursor to a system that is already supplied, and
          the most likely effect is on estradiol rather than on testosterone &mdash; the app&rsquo;s
          own interaction data flags exactly that. Adding it and then attributing an estradiol rise
          to the testosterone dose is a common and avoidable confusion.`
        ]
      },
      {
        h2: 'Supplement status is not a safety finding',
        paras: [
          `DHEA is sold as a dietary supplement in the United States and is a controlled or
          prescription substance in several other countries, including much of Europe. Supplement
          status means it has not been reviewed for identity, purity or potency the way a drug is,
          and independent analyses of over-the-counter DHEA products have repeatedly found content
          varying substantially from the label. This site names no brand and no testing service.`,
          `The effects worth watching are the ones you would predict from a steroid precursor: acne
          and oily skin, hair thinning in people predisposed to it, and in women, hair growth in an
          androgenic pattern and voice changes at higher doses. Because it aromatises, gynaecomastia
          is possible in men. Hormone-sensitive cancer is the situation where this is not a casual
          supplement decision at all.`,
          `All of which is to say it deserves the same treatment as any hormone: a baseline
          measurement, a reason, and a clinician who knows you are taking it. Anything on the
          drawbacks list below that you are experiencing belongs in front of them.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the last item — not without a confirmed
      deficiency — is the one that makes the rest of the list avoidable.`,
    faq: [
      ['DHEA or DHEA-S on the lab form?', [
        `DHEA-S. The sulphated ester is more abundant and far more stable across the day; unsulphated
         DHEA follows the adrenal rhythm and a single value is hard to place. Order the downstream
         hormones alongside it, because those are what the supplement is really changing.`]],
      ['Will it raise testosterone?', [
        `In some people, modestly. In others most of it goes to oestrogens instead, and which one
         happens depends on individual enzyme expression. That is the reason to measure testosterone
         and estradiol rather than assume, particularly in men.`]],
      ['Does it help if levels are normal?', [
        `The trial evidence is weakest exactly there. The clearest benefit is in people with genuinely
         low levels, adrenal insufficiency most of all. A normal DHEA-S is a reason to look elsewhere
         for the symptom.`]],
      ['Is 7-keto DHEA the same thing?', [
        `No. 7-keto is a metabolite that does not convert to testosterone or oestrogen, which makes it
         a different proposition entirely — the app records it as its own entry with its own
         regulatory status.`]]
    ],
    basis: [
      ['Peripheral conversion to androgens and oestrogens',
        'Standard endocrinology references on adrenal steroid metabolism'],
      ['Randomised trials in older adults',
        'Placebo-controlled trials from the 1990s onward, with small or absent effects outside genuinely deficient groups'],
      ['Label accuracy of over-the-counter products',
        'Independent analyses of commercial DHEA supplements reporting content varying substantially from label'],
      ['Approved topical indication and supplement status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim']
    ],
    cta: `A precursor is only readable through what it becomes. TherapyLog keeps DHEA-S, testosterone
      and estradiol on one chart.`
  },

  nad: {
    slug: 'nmn-and-nr',
    h1: 'NMN and NR: raising NAD+ is established, what it buys is not',
    title: 'NMN and NR: what raising NAD+ has shown | TherapyLog',
    description: 'Oral NAD+ precursors reliably raise blood NAD+. What the human trials measured beyond that, and where NMN and NR actually differ.',
    lede: `Two supplements with an unusually clean first half to their story and an unusually thin
      second half. They do raise NAD+ in people. Whether that produces anything you would notice is
      a separate question with a separate, much weaker answer.`,
    sections: [
      {
        h2: 'What NAD+ does, and why it declines',
        paras: [
          `@@EV_ESTABLISHED@@ Nicotinamide adenine dinucleotide is a coenzyme in hundreds of
          reactions and the electron carrier at the centre of energy metabolism. It is also consumed
          &mdash; not merely recycled &mdash; by three families of enzymes: the sirtuins, the PARPs
          that repair DNA, and CD38. Because those enzymes destroy NAD+ in the course of working,
          demand rises with damage and inflammation, and tissue levels fall with age in most animals
          measured.`,
          `Nicotinamide mononucleotide and nicotinamide riboside are precursors on the salvage
          pathway. NR is converted to NMN inside the cell; NMN is one step from NAD+. Both are sold
          orally, and the practical question for years was whether either survives digestion in a
          useful form.`,
          `@@EV_ESTABLISHED@@ That question is now answered. Human trials of both compounds have
          measured increases in blood NAD+ concentrations, dose-dependently and reproducibly, with
          good tolerability at the doses studied. This is the part of the story that is solid, and
          it is worth separating cleanly from the rest.`
        ]
      },
      {
        h2: 'What the trials did not find',
        paras: [
          `@@EV_THEORETICAL@@ Beyond the biomarker, the human results are modest and inconsistent.
          Trials have reported small changes in insulin sensitivity in specific groups, some
          measures of muscle function, and inflammatory markers, and other trials looking at similar
          endpoints have found nothing. No human trial has measured anything that could be called a
          longevity outcome, because that would take decades and nobody has run one.`,
          `The animal picture is stronger and is where the enthusiasm comes from &mdash; improvements
          in metabolic and vascular measures in aged mice, and the sirtuin story that connects NAD+
          to the caloric-restriction literature. Extrapolating from mouse lifespan work to a human
          taking a capsule is exactly the step that has failed for a long list of compounds.`,
          `The NMN-versus-NR argument is largely commercial. Both raise NAD+; neither has been shown
          superior on a clinical endpoint in a head-to-head trial, because there are almost no
          clinical endpoints to compare on. The regulatory status of NMN in the United States has
          also been contested, which is a supply question rather than a safety one.`
        ]
      },
      {
        h2: 'The caveat that deserves saying out loud',
        paras: [
          `@@EV_THEORETICAL@@ NAD+ is required by proliferating cells, and tumours proliferate. The
          concern that raising NAD+ systemically could support an existing malignancy is theoretical
          &mdash; there is no human evidence of harm &mdash; but it is not fringe, it appears in the
          app&rsquo;s own drawbacks list, and it is a reasonable thing to raise with an oncologist
          rather than resolve from a supplement label. The same reasoning applies to anyone under
          active cancer surveillance.`,
          `Beyond that these are well tolerated in trials, with flushing largely absent (that is
          niacin, a different precursor) and gastrointestinal effects uncommon. There is no
          monitoring panel: the app records none, because nothing on a routine panel tracks this.
          Specialty NAD+ assays exist and are not standardised well enough to follow a trend
          against.`,
          `The reasonable position is that this is a low-risk supplement with a well-demonstrated
          biochemical effect and an undemonstrated clinical one, which is a perfectly respectable
          thing to be as long as it is described that way. Anyone with a cancer history should raise
          it with the clinician who manages that.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and unusually candid: most of these are statements
      about the state of the evidence rather than adverse effects, which is the accurate emphasis.`,
    faq: [
      ['Does oral NMN actually reach the bloodstream?', [
        `The endpoint that matters is whether NAD+ rises, and in human trials it does, for both NMN
         and NR. The mechanistic argument about which transporter carries what is unresolved and, for
         this purpose, secondary.`]],
      ['NMN or NR?', [
        `No head-to-head trial has separated them on a clinical outcome, largely because there are so
         few clinical outcomes to compare. Both raise NAD+. Availability and regulatory status differ,
         and that is a more practical basis for choosing than the biochemistry.`]],
      ['Is there a test to see if it is working?', [
        `Not a routine one. Specialty NAD+ assays exist but are not standardised well enough to follow
         a trend, and nothing on a standard panel reflects it. The app records no monitoring for this
         compound, which is honest.`]],
      ['How does it relate to NAD+ IV infusions?', [
        `Different route, different regulatory status and a much weaker evidence base — an infusion of
         NAD+ itself is not the same intervention as an oral precursor, and it is not an approved
         therapy for anything. That is a separate entry in the app.`]]
    ],
    basis: [
      ['NAD+ consumption by sirtuins, PARPs and CD38',
        'Established biochemistry of NAD+-consuming enzymes'],
      ['Human trials raising blood NAD+',
        'Placebo-controlled trials of nicotinamide riboside and of nicotinamide mononucleotide, reported from 2016 onward'],
      ['Absence of longevity endpoints',
        'No human trial has measured a lifespan or healthspan outcome for either compound'],
      ['Theoretical concern in malignancy',
        'Drawn from NAD+ requirements of proliferating cells; no human evidence of harm exists either way']
    ],
    cta: `A supplement with no monitoring marker is one where your own record of what changed is the
      only evidence you will ever have. TherapyLog keeps it.`
  },

  dac: {
    slug: 'cjc-1295-with-dac',
    h1: 'CJC-1295 with DAC: the albumin trick, and what a week-long GHRH signal changes',
    title: 'CJC-1295 with DAC: the albumin version | TherapyLog',
    description: 'The DAC binds the peptide to albumin and takes the half-life from thirty minutes to about a week. What that does to the GH pulse pattern.',
    lede: `This is the molecule the name CJC-1295 was coined for. The drug affinity complex is the
      innovation, and it turns a thirty-minute peptide into a week-long one &mdash; which changes
      what the compound is, not just how often it is injected.`,
    sections: [
      {
        h2: 'What the DAC is',
        paras: [
          `@@EV_ESTABLISHED@@ The drug affinity complex is a maleimidopropionic acid group attached
          to the peptide. Maleimide reacts with free thiol groups, and the most abundant free thiol
          in blood is the cysteine-34 residue on serum albumin. So the peptide forms a covalent bond
          with albumin in circulation and travels as part of it: protected from enzymatic
          degradation, too large to be filtered by the kidney, and released slowly. The app models
          the result at a week-long half-life against the unmodified peptide&rsquo;s thirty
          minutes.`,
          `That is the same strategic idea behind the fatty-acid chains on semaglutide and
          tirzepatide, executed with a covalent bond rather than a reversible one.
          <a href="/compounds/cjc-1295/">The non-DAC page</a> covers the naming confusion this
          creates: what most vendors sell as "CJC-1295 without DAC" is modified GRF(1-29), a
          different compound entirely, and the two are dosed nothing alike.`
        ]
      },
      {
        h2: 'Sustained elevation is a different intervention from a bigger pulse',
        paras: [
          `Growth hormone is normally released in discrete bursts, largely during slow-wave sleep,
          against a suppressive background of somatostatin. A short-acting GHRH analogue amplifies a
          burst when the pituitary is ready to produce one. @@EV_OFFLABEL@@ A week-long analogue
          instead holds the releasing signal up continuously, which produces what practitioners call
          a GH bleed &mdash; a raised baseline rather than a taller peak.`,
          `Whether that matters is a genuine open question rather than a settled preference. The
          argument that it does rests on the observation that pulsatility appears to matter to how
          tissues respond to growth hormone, which is established in physiology; the argument that it
          does not is that IGF-1 rises either way and IGF-1 is what mediates most of the downstream
          effect. Nobody has run the trial that would separate them in this population.`,
          `Two consequences are less speculative. Receptor desensitisation is a recognised risk with
          continuous agonism at any receptor, and the app&rsquo;s own drawbacks list flags faster
          tachyphylaxis here than with the pulsatile version. And water retention is reported more
          often, which is what a sustained rather than intermittent GH elevation would predict.`
        ]
      },
      {
        h2: 'What to measure, and what nobody has measured',
        paras: [
          `IGF-1 is the marker, for the same reason it is on every page in this class: a random serum
          growth hormone reports where in a pulse the needle went. With a week-long compound the
          level plateaus over roughly five weeks, so an IGF-1 drawn at two weeks is measuring
          something still climbing. The <a href="/markers/igf-1/">IGF-1 page</a> covers why the
          reference interval is age-dependent. Fasting glucose sits beside it because raising growth
          hormone reduces insulin sensitivity.`,
          `@@EV_THEORETICAL@@ There is no approved product and no controlled trial of this compound
          for the uses it is put to. Identity, purity and concentration rest entirely with whoever
          made the vial, and for a molecule whose entire function depends on an intact reactive
          maleimide group, manufacturing quality is not a peripheral concern &mdash; a degraded
          batch would behave like the short-acting peptide while being dosed like the long one. This
          site names no vendor and no testing service.`,
          `Anything experienced while using it, and a rising fasting glucose in particular, belongs
          with a clinician who knows the whole picture rather than being managed against a page.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first three all follow from the same property —
      continuous rather than pulsatile signalling — which is the thing the DAC buys and costs.`,
    faq: [
      ['Is this the same as CJC-1295 without DAC?', [
        `No, and the naming is the single most common confusion in this family. Without the DAC the
         compound sold under that name is modified GRF(1-29), with a thirty-minute half-life. This one
         lasts about a week. They are dosed on completely different schedules.`]],
      ['Does it still need pairing with a secretagogue?', [
        `The mechanistic argument for pairing a GHRH analogue with a ghrelin receptor agonist — two
         receptors, complementary actions on the same pulse — applies here as it does to the
         short-acting version, and the app’s dosing rows describe it. Whether continuous GHRH
         signalling plus an intermittent secretagogue behaves like the studied combination is not
         something anyone has tested.`]],
      ['How long until IGF-1 settles?', [
        `About five weeks, at a week-long half-life. Anything drawn before that is measuring a level
         still accumulating, which is a common reason people conclude a dose is too low and raise it.`]],
      ['Why does it cause more water retention?', [
        `Fluid retention is a growth hormone effect, and a compound that raises the signal
         continuously produces more total exposure than one that raises a pulse. That is the trade the
         weekly schedule buys.`]]
    ],
    basis: [
      ['Maleimide-albumin covalent binding',
        'The published pharmacology of the drug affinity complex, which is where the CJC-1295 name originates'],
      ['Pulsatile versus continuous GH signalling',
        'Established growth hormone physiology; its application to this compound is inference, not a trial result'],
      ['Absence of controlled trials for current use',
        'No published randomised trial exists for the uses this compound is put to'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A weekly compound whose marker takes five weeks to settle is one to date carefully.
      TherapyLog keeps the dose beside the IGF-1.`
  },

  enclo: {
    slug: 'enclomiphene',
    h1: 'Enclomiphene: the useful half of clomiphene, without the half that lingers',
    title: 'Enclomiphene: the isolated trans isomer | TherapyLog',
    description: 'Clomiphene is two isomers; enclomiphene is the one that raises LH. What isolating it changes, and what its regulatory status actually is.',
    lede: `Clomiphene citrate is a mixture. One isomer does the work and clears in hours; the other
      lingers for weeks and carries most of the complaints. Enclomiphene is the first one on its
      own &mdash; a clean idea whose regulatory story is anything but.`,
    sections: [
      {
        h2: 'Why isolating it makes sense',
        paras: [
          `@@EV_ESTABLISHED@@ Clomiphene citrate contains two geometric isomers. Enclomiphene, the
          trans isomer, is the antioestrogen at the hypothalamus: blocking oestrogen receptors there
          removes the brake on GnRH, so LH and FSH rise and the testis produces more testosterone.
          Zuclomiphene, the cis isomer, has oestrogenic activity and a half-life measured in days to
          weeks rather than hours, so it accumulates over sustained daily use.`,
          `That accumulation is the most likely explanation for effects that appear after several
          weeks on clomiphene rather than at the start &mdash; mood changes among them &mdash; and
          it is the entire rationale for the purified product. The app models enclomiphene at about
          ten hours against clomiphene&rsquo;s blended five-day figure, and that difference is the
          zuclomiphene being gone rather than a change in what the active isomer does.`,
          `The mechanism is worth stating clearly because it is structurally different from
          testosterone therapy. LH and FSH rise rather than fall, testicular volume is preserved,
          and spermatogenesis is preserved or improved &mdash; which is why it is discussed as an
          option for men who want testosterone restored without losing fertility. It also means it
          only works if the pituitary and the testis can respond, so it does nothing for primary
          testicular failure. The <a href="/markers/lh-fsh/">LH and FSH page</a> covers how that
          distinction is made.`
        ]
      },
      {
        h2: 'The regulatory position, stated plainly',
        paras: [
          `@@EV_OFFLABEL@@ Enclomiphene is not approved. A new drug application was filed and did not
          result in an approval, and what is available in the United States comes from compounding
          pharmacies. That places it in an awkward category: it is not a research chemical in the
          sense that most of this site&rsquo;s Tier B compounds are &mdash; it has been through
          clinical trials in the intended population and the trial results are published &mdash; but
          it also has no approved product behind it, and no regulator has signed off on any
          particular preparation.`,
          `The practical consequence is the usual one. Identity, purity and content rest with the
          compounder, and there is no reference product to compare against. This site names no
          pharmacy and no testing service.`
        ]
      },
      {
        h2: 'What it will and will not do',
        paras: [
          `@@EV_OFFLABEL@@ The trials reported testosterone rising into the normal range with sperm
          concentration preserved, which is the combination testosterone therapy cannot offer. What
          they did not show is testosterone reaching the levels people commonly target on
          testosterone therapy: this raises your own production within what your own axis can do,
          and for some men that ceiling is lower than they were hoping for. Setting that expectation
          before starting avoids a lot of disappointment.`,
          `Estradiol is the number to watch alongside it. Raising testosterone raises the substrate
          for aromatisation, and a SERM blocking receptors in the hypothalamus does not stop
          circulating estradiol rising elsewhere. The measured value and the receptor-level effect
          can move in different directions, which is exactly why the number alone does not settle
          anything &mdash; and why the assay has to be a sensitive one. The
          <a href="/markers/estradiol-sensitive-vs-standard/">estradiol page</a> covers that.`,
          `Visual disturbance is the effect from this drug class with a conventional instruction
          attached: blurring or persistent after-images are a reason to stop and contact the
          prescriber rather than continue and monitor. Everything else on the drawbacks list below
          belongs in the same conversation. The <a href="/compounds/clomiphene/">clomiphene page</a>
          covers the parent compound.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. Note that most of these are about availability and
      evidence rather than about tolerability — which is the accurate picture for this one.`,
    faq: [
      ['Is it better than clomiphene?', [
        `It removes the isomer that accumulates and carries most of the complaints, which is a coherent
         rationale and the reason it was developed separately. It is also less available, not approved,
         and compounded. Which of those matters more is a prescribing conversation.`]],
      ['Does it work in primary hypogonadism?', [
        `No. It works by raising the pituitary signal, so it requires a testis able to respond. Where
         the testis itself is the problem, stimulating harder achieves little — which is what LH and
         FSH are measured to establish before starting.`]],
      ['How high will testosterone go?', [
        `Into the normal range in the trials, not to the levels commonly targeted on testosterone
         therapy. It raises what your own axis can produce, and that ceiling is individual.`]],
      ['How long before labs are meaningful?', [
        `LH and FSH respond within days, testosterone over two to four weeks. Without zuclomiphene
         accumulating in the background, an assessment at six weeks is measuring a settled state — which
         is one practical advantage over the parent compound.`]]
    ],
    basis: [
      ['Isomer composition of clomiphene citrate',
        'Established since the 1980s; zuclomiphene has a half-life orders of magnitude longer than enclomiphene'],
      ['Trials in men with secondary hypogonadism',
        'The enclomiphene clinical programme, reporting testosterone restoration with sperm concentration preserved'],
      ['Regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A restoration protocol is judged on LH, FSH, testosterone and estradiol moving together
      over weeks. TherapyLog charts them against the dose.`
  },

  mt2: {
    slug: 'melanotan-ii',
    h1: 'Melanotan II: a non-selective melanocortin agonist, and the skin question it raises',
    title: 'Melanotan II: the melanocortin trade-off | TherapyLog',
    description: 'MT-2 activates every melanocortin receptor, which is why it does several things at once. What that means for moles and for dosing.',
    lede: `PT-141 was derived from this molecule by narrowing it down. Melanotan II is the version
      that was not narrowed: it hits the whole melanocortin family, which is why it produces tanning,
      appetite suppression and sexual effects from one injection &mdash; and why the skin question
      is not optional.`,
    sections: [
      {
        h2: 'One peptide, four receptors',
        paras: [
          `@@EV_ESTABLISHED@@ Alpha-melanocyte stimulating hormone acts across a family of receptors
          with quite different jobs. MC1R on melanocytes controls melanin production. MC3R and MC4R
          in the hypothalamus are involved in energy balance, appetite and sexual arousal. MC5R sits
          in exocrine tissue including sebaceous glands. Melanotan II is a cyclic analogue that
          activates all of them without much selectivity.`,
          `That explains the whole effect profile in one sentence. Tanning without ultraviolet
          exposure is MC1R. Reduced appetite is MC3R and MC4R. Spontaneous erections and increased
          desire are MC4R &mdash; the same mechanism PT-141 uses, which is unsurprising since
          bremelanotide is a metabolite of this molecule. Flushing, yawning and nausea come along
          with the rest.`,
          `The app models its half-life at about an hour and flags it as an estimate, meaning
          published human pharmacokinetic data is limited or absent. That figure is the basis for
          the as-needed rather than daily framing in the app&rsquo;s own dosing rows, and like every
          estimated figure on this site, anything calculated from it inherits the uncertainty.`
        ]
      },
      {
        h2: 'The skin problem is the real one',
        paras: [
          `@@EV_OFFLABEL@@ Stimulating MC1R does not only produce a tan. Existing naevi darken,
          new pigmented lesions can appear, and the ones that were already there change appearance.
          Case reports of melanoma diagnosed in users exist, and what they cannot establish is
          causation &mdash; a compound that makes every mole on the body darker and larger is also a
          compound that makes an existing melanoma easier to notice, and the population using it
          overlaps with the population that tans deliberately.`,
          `What follows from that is practical rather than alarming. Darkening moles are the specific
          reason the app puts baseline photography and periodic dermatological review on the
          monitoring list for this compound, and it is one of the few entries in this reference where
          the monitoring is a skin examination rather than a blood test. Someone using this without a
          baseline has removed their own ability to tell a benign change from a significant one,
          because everything changed at once.`,
          `Anyone with a personal or family history of melanoma, a large number of atypical naevi, or
          previous significant sun damage is in the group where this conversation belongs with a
          dermatologist before rather than after.`
        ]
      },
      {
        h2: 'Sourcing, and the honest comparison with the approved version',
        paras: [
          `@@EV_THEORETICAL@@ There is no approved product and there never has been; development was
          not completed. Identity, purity and concentration rest entirely with whoever made the vial,
          and the app&rsquo;s own regulatory string says so. This site names no vendor and no testing
          service.`,
          `The comparison worth drawing is with <a href="/compounds/pt-141/">PT-141</a>, which is the
          MC4R-selective fragment and which does have an approval, for one indication in one
          population. If the reason for interest is sexual function, the approved molecule targets
          that receptor specifically and leaves MC1R largely alone &mdash; which removes the skin
          question rather than managing it. If the reason for interest is tanning, there is no
          approved option, and the honest framing is that the trade is a cosmetic effect against an
          unquantified dermatological risk.`,
          `Nausea and transient blood pressure changes are the common effects, and dose titration
          from very low is what the app&rsquo;s rows describe for that reason. Anything here belongs
          with a clinician who knows your history &mdash; dermatological history included &mdash;
          rather than being worked out from a page.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The mole item is not a cosmetic footnote; it is the
      one that changes what monitoring this compound needs.`,
    faq: [
      ['How is it different from PT-141?', [
        `PT-141 is bremelanotide, a metabolite of this molecule, and it is far more selective for MC4R.
         That means it produces the sexual effect without much of the pigmentation effect — and it has
         an approval, which MT-2 does not.`]],
      ['Does the tan protect against sunburn?', [
        `Melanin produced this way is real melanin, but treating it as sun protection is not supported
         and the practice it is usually paired with — using it alongside deliberate ultraviolet exposure
         to "start" the tan — adds the exposure risk back on top. It does not replace sunscreen.`]],
      ['What monitoring does it actually need?', [
        `A skin examination, which is unusual for this reference. Baseline photography of existing
         moles and periodic dermatological review, because the compound changes the appearance of every
         pigmented lesion at once and removes the usual signal.`]],
      ['Why the spontaneous erections?', [
        `MC4R activation in the hypothalamus, the same mechanism the approved fragment uses
         deliberately. In a non-selective agonist it arrives whether or not that was the reason for
         taking it, and the app’s drawbacks list flags it as a practical problem rather than a
         benefit.`]]
    ],
    basis: [
      ['Melanocortin receptor subtypes and their functions',
        'Standard endocrinology and dermatology references on the melanocortin system'],
      ['Bremelanotide as a metabolite of melanotan II',
        'The published development history of both molecules'],
      ['Pigmented lesion change and melanoma case reports',
        'Dermatology case reports and series; causation is not established'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `Baseline photographs and dated doses are the whole monitoring plan for this one.
      TherapyLog keeps the dates.`
  },

  ghrp2: {
    slug: 'ghrp-2',
    h1: 'GHRP-2: effective at releasing growth hormone, and not selective about it',
    title: 'GHRP-2: potency without the selectivity | TherapyLog',
    description: 'A ghrelin receptor agonist that raises cortisol and prolactin alongside growth hormone. Why that matters, and what it is still used for.',
    lede: `The compound ipamorelin was developed to replace. It releases growth hormone reliably and
      it also moves two other hormones, which is the whole reason the class kept iterating.`,
    sections: [
      {
        h2: 'Where it sits in the family',
        paras: [
          `@@EV_ESTABLISHED@@ The growth hormone releasing peptides act at the ghrelin receptor,
          where they both stimulate GH release and reduce somatostatin tone. GHRP-6 came first and
          produced marked hunger. GHRP-2 is more potent for GH release with less appetite
          stimulation. Hexarelin is more potent still and desensitises fastest. Ipamorelin came last
          and was selected specifically for producing GH release with minimal effect on ACTH,
          cortisol and prolactin.`,
          `GHRP-2 sits in the middle of that progression, and its position is defined by what it does
          besides releasing growth hormone: cortisol and prolactin rise moderately at effective
          doses. Whether that matters depends on the person and the dose &mdash; it is not a
          dramatic effect &mdash; but it is the reason the app puts prolactin and cortisol on the
          monitoring panel here and not for
          <a href="/compounds/ipamorelin/">ipamorelin</a>.`,
          `It has a more serious clinical history than most peptides in this reference. It was
          studied as a diagnostic agent for growth hormone deficiency, which is a use that requires
          the GH response to be reliable and reproducible, and it is. What it never acquired was an
          approval for the purposes it is used for now.`
        ]
      },
      {
        h2: 'Desensitisation is the practical limit',
        paras: [
          `@@EV_OFFLABEL@@ Continuous agonism at any receptor tends toward reduced response, and the
          ghrelin receptor is no exception. GHRP-2 is described as desensitising faster than
          ipamorelin, which is the reason the app&rsquo;s dosing rows carry on-and-off framing rather
          than continuous use. This is a real pharmacological phenomenon rather than a superstition
          about cycling, though the specific intervals in circulation are convention rather than
          anything derived from a trial.`,
          `The pairing with a GHRH analogue applies here as it does across the class: two receptors,
          complementary actions on the same pulse, a combined effect on a GH pulse larger than either
          alone. That synergy is established in human physiology studies of the mechanism. The
          specific product combinations people use have not been through trials.`,
          `Fasted administration and a pre-sleep dose come from the same physiology as everywhere
          else in this class: insulin and glucose blunt GH release, and the largest natural pulse is
          nocturnal.`
        ]
      },
      {
        h2: 'What to measure, and what nobody established',
        paras: [
          `IGF-1 is the marker that tells you the axis moved &mdash; a random serum growth hormone
          reports where in a pulse the needle went and little else. The
          <a href="/markers/igf-1/">IGF-1 page</a> covers why the reference interval is
          age-dependent. Prolactin and cortisol are on this compound&rsquo;s panel specifically, and
          the <a href="/markers/prolactin/">prolactin page</a> covers how easily that particular
          hormone is elevated by the draw itself, which matters when you are looking for a drug
          effect. Fasting glucose sits alongside, because raising growth hormone reduces insulin
          sensitivity.`,
          `@@EV_THEORETICAL@@ What is unestablished is everything downstream. Amplifying GH pulses
          in a person with a normal axis is measurable; whether it changes body composition,
          recovery or sleep in a way that matters is not something the literature answers for any
          compound in this class. IGF-1 is a marker of exposure, not of benefit.`,
          `There is no approved product, so identity and purity rest with whoever made the vial, and
          this site names no vendor. Anything experienced while using it &mdash; and a rising fasting
          glucose in particular &mdash; belongs with a clinician who has the whole picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it is a fair self-assessment: every item is a
      comparison against the more selective compound that replaced it.`,
    faq: [
      ['Why choose it over ipamorelin?', [
        `Greater potency for GH release, at the cost of selectivity. Whether that trade is worth making
         is not something a page can answer, and the monitoring differs between them precisely because
         the trade is real — cortisol and prolactin are on this panel and not on that one.`]],
      ['How much does it raise cortisol?', [
        `Moderately at effective doses, which is less than GHRP-6 or hexarelin and more than
         ipamorelin. It is a dose-related effect rather than a fixed one, and the app puts cortisol on
         the panel to be measured rather than assumed.`]],
      ['What does desensitisation feel like?', [
        `Usually nothing — it shows up as a diminishing IGF-1 response rather than as a symptom, which
         is an argument for measuring rather than judging by feel.`]],
      ['Is it the same as pralmorelin?', [
        `Yes. Pralmorelin is the international non-proprietary name for the same molecule, which is why
         it appears in the clinical literature under a name most vendors do not use.`]]
    ],
    basis: [
      ['Selectivity across the GHRP family',
        'The growth hormone secretagogue characterisation literature of the 1990s'],
      ['Use as a diagnostic agent for GH deficiency',
        'Clinical studies of GHRP-2 as a provocative test of pituitary GH reserve'],
      ['Synergy with GHRH analogues',
        'Human physiology studies of combined GHRH and secretagogue administration'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A compound whose response fades rather than announcing itself is one to track on a chart.
      TherapyLog keeps IGF-1 beside the dose.`
  },

  hghfrag: {
    slug: 'hgh-fragment-176-191',
    h1: 'HGH fragment 176-191: the fat-loss end of the molecule, and the number nobody sourced',
    title: 'HGH fragment 176-191: what is claimed | TherapyLog',
    description: 'The C-terminal fragment of growth hormone, sold on a potency figure with no traceable human source. What the animal work shows, and what it does not.',
    lede: `A short piece of the growth hormone molecule, marketed almost entirely on one statistic.
      The mechanism is real and the statistic is not what people think it is &mdash; and the
      difference between those two sentences is most of what is worth knowing here.`,
    sections: [
      {
        h2: 'What the fragment is',
        paras: [
          `Human growth hormone is 191 amino acids. @@EV_THEORETICAL@@ Work in the 1990s identified
          the C-terminal region as carrying the lipolytic activity independently of the rest of the
          molecule, and fragment 176-191 is that region synthesised on its own. The claim that
          follows is appealing: fat metabolism without the growth-promoting and
          insulin-desensitising effects that come with whole growth hormone, because the fragment
          does not bind the growth hormone receptor and does not raise IGF-1.`,
          `That last part is testable and is the one genuinely useful monitoring instruction in the
          app&rsquo;s entry: IGF-1 should not move. If it does, the vial contains something other
          than what the label says. For a compound with no reference standard and no approved
          product, a marker that detects mislabelling is worth more than a marker of effect.`,
          `The app models the half-life at about thirty minutes and flags it as an estimate. That is
          why the dosing rows describe one to two injections daily rather than a single dose, and
          like every estimated figure here, anything derived from it inherits the uncertainty.`
        ]
      },
      {
        h2: 'The 12.5-times figure',
        paras: [
          `@@EV_THEORETICAL@@ Nearly every description of this peptide reports that it is 12.5 times
          more potent than growth hormone for fat burning. The app&rsquo;s own entry repeats it. It
          traces back to animal work &mdash; obese rodent models comparing the fragment against
          whole growth hormone on lipolytic endpoints &mdash; and not to any human study. It is a
          real finding about mice, presented for two decades as though it were a fact about people.`,
          `What exists in humans is much thinner: no published randomised controlled trial of this
          fragment for fat loss at all. Compare that with <a href="/compounds/aod-9604/">AOD-9604</a>,
          a modified version of the same region that was taken into phase IIb trials in humans and
          did not separate from placebo on its primary endpoint. That is the closest thing to a human
          test this mechanism has had, and it is not an encouraging one.`,
          `None of that makes the mechanism wrong. It makes the confidence unwarranted, and it makes
          the specific number a marketing artefact rather than a result.`
        ]
      },
      {
        h2: 'The local-injection row, and sourcing',
        paras: [
          `The app records a row describing injection near a target fat area. @@EV_THEORETICAL@@ It
          is reproduced above because this site publishes what the app holds, and it is worth saying
          plainly that the idea behind it &mdash; that injecting subcutaneously near a fat depot
          produces a local rather than systemic effect &mdash; has no controlled human evidence
          behind it. Spot reduction is one of the more thoroughly examined claims in exercise
          science and has not held up in other contexts.`,
          `There is no approved product. Identity, purity and concentration rest entirely with
          whoever made the vial, and this fragment is a case where a mislabelled product is
          particularly plausible: the aka field in the app&rsquo;s own reference overlaps with
          AOD-9604&rsquo;s, and the two are frequently sold under each other&rsquo;s names. This
          site names no vendor and no testing service.`,
          `There is no meaningful bloodwork to follow here beyond the IGF-1 check described above and
          a fasting glucose that should stay put. Assessment is body composition over months, which
          means an honest record of diet and training alongside it or the result means nothing.
          Anything experienced while using it belongs with a clinician who knows the whole picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first item and the fourth are the load-bearing
      ones, and the sixth — that it does not build muscle — is a useful corrective to how it is
      usually sold.`,
    faq: [
      ['Is the 12.5x potency figure real?', [
        `It is a real finding in animal models and it has never been demonstrated in people. Treating
         it as a human fact is the single most common error in writing about this compound.`]],
      ['Why does IGF-1 matter if the fragment does not raise it?', [
        `That is exactly why it matters. The fragment should leave IGF-1 unchanged; a rise suggests the
         vial contains growth hormone or something else. It is a mislabelling detector rather than an
         efficacy marker.`]],
      ['How does it compare to AOD-9604?', [
        `AOD-9604 is a modified version of the same C-terminal region and is the one that went into
         human trials, where it did not separate from placebo on its primary obesity endpoint. That is
         the closest human evidence this mechanism has.`]],
      ['Does injecting near the target area do anything?', [
        `No controlled human evidence supports it. The app records the practice because it is in the
         reference; this page reports that the idea is untested rather than endorsing it.`]]
    ],
    basis: [
      ['C-terminal lipolytic activity',
        'Animal work from the 1990s identifying the fragment as carrying lipolytic activity independently of the whole molecule'],
      ['The 12.5-times potency comparison',
        'Obese rodent models; no human study has reported this comparison'],
      ['Human trial evidence for the mechanism',
        'The AOD-9604 phase IIb obesity programme, which did not separate from placebo on its primary endpoint'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `A compound assessed on body composition over months needs the months recorded alongside it.
      TherapyLog keeps the doses dated.`
  },

  aod9604: {
    slug: 'aod-9604',
    h1: 'AOD-9604: the version of the fragment that was actually tested in people',
    title: 'AOD-9604: the trial the fragment got | TherapyLog',
    description: 'A modified growth hormone fragment that reached phase IIb for obesity and did not separate from placebo. What that result is worth.',
    lede: `This is the one compound in this family with a completed human trial programme. It did not
      work on its primary endpoint, which is a more useful piece of information than most of what is
      written about the class.`,
    sections: [
      {
        h2: 'What it is, and what it is not',
        paras: [
          `@@EV_ESTABLISHED@@ AOD-9604 is a modified analogue of the C-terminal region of human
          growth hormone, developed specifically as an anti-obesity drug. The design goal was to
          keep the lipolytic activity attributed to that region while avoiding the growth hormone
          receptor entirely &mdash; so no IGF-1 elevation, no effect on insulin sensitivity, and
          none of the growth-promoting effects that make whole growth hormone unsuitable for
          long-term metabolic use.`,
          `It is closely related to but not identical with
          <a href="/compounds/hgh-fragment-176-191/">HGH fragment 176-191</a>, and the two are
          routinely sold under each other&rsquo;s names &mdash; the app&rsquo;s own aliases field
          for this entry lists the other compound&rsquo;s name, which is a fair reflection of how
          confused the market is. If the distinction matters to you, and it should, no vendor label
          resolves it.`
        ]
      },
      {
        h2: 'The trial result, which is the whole point of this page',
        paras: [
          `@@EV_ESTABLISHED@@ AOD-9604 was taken into human trials for obesity and completed phase
          IIb. The primary weight-loss endpoint was not met: the compound did not separate from
          placebo. Development for that indication did not continue, and the molecule was
          subsequently repositioned toward other applications, including cartilage and joint
          indications, which is where the app&rsquo;s second dosing row comes from.`,
          `That is an unusual and valuable thing to be able to say about a research peptide. Most of
          the compounds on this site have no human trial in either direction &mdash; their evidence
          is animal work and their status is unknown rather than negative. This one was tested at
          scale in the intended population and did not deliver. Nothing published since has
          overturned it.`,
          `@@EV_THEORETICAL@@ The safety picture is the other side of that coin, and it is the
          genuinely favourable part: a completed phase II programme produced a tolerability database
          that no research peptide has, and the compound was well tolerated. It is a compound with
          good evidence of being safe and good evidence of not working for the thing it was designed
          for, which is a combination worth naming precisely.`
        ]
      },
      {
        h2: 'Why it is still sold, and what that means',
        paras: [
          `@@EV_OFFLABEL@@ The peptide market did not stop at the trial result. It is widely
          available and widely marketed on the mechanism &mdash; lipolysis without IGF-1 elevation
          &mdash; which is true as far as it goes and has not translated into measurable weight loss
          in the population that was studied. Marketing that quotes the mechanism and omits the
          endpoint is the pattern to watch for.`,
          `The joint and cartilage direction is more interesting and much earlier: preclinical and
          early work rather than anything conclusive, and the app records a dosing row for it. Treat
          that as a hypothesis under investigation, not a second indication.`,
          `There is no approved product anywhere, so identity and purity rest with whoever made the
          vial &mdash; and given how routinely this compound and the unmodified fragment are sold
          under each other&rsquo;s names, that uncertainty is larger here than usual. This site names
          no vendor and no testing service. Anything experienced while using it belongs with a
          clinician who knows the full picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. Note that the first item — less potent for fat loss
      than growth hormone — is putting mildly what the phase IIb result showed directly.`,
    faq: [
      ['Did it work?', [
        `Not on its primary endpoint in phase IIb for obesity, where it did not separate from placebo.
         That is a clearer answer than exists for almost anything else in this reference, and it is a
         negative one.`]],
      ['Is it the same as HGH fragment 176-191?', [
        `No. It is a modified analogue of the same region, and the two are frequently sold under each
         other’s names — including in the app’s own aliases field. The distinction is real and no label
         reliably settles it.`]],
      ['Does it affect IGF-1 or blood sugar?', [
        `By design, no — it does not bind the growth hormone receptor. That is the property the trials
         confirmed, and it is also why an IGF-1 that does move on this compound suggests the vial
         contains something else.`]],
      ['Why is it in the app at all if the trial failed?', [
        `Because the app’s reference documents what people use, so a log stays accurate for someone
         already using it. That is a different job from recommending it, which is why this page reports
         the endpoint rather than the mechanism.`]]
    ],
    basis: [
      ['Phase IIb obesity programme and the primary endpoint',
        'The AOD-9604 clinical development programme, completed and not continued for the obesity indication'],
      ['Design goal of avoiding the growth hormone receptor',
        'The molecule’s published pharmacology'],
      ['Regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `The most useful thing about a compound with a negative trial is knowing it. TherapyLog keeps
      the record if you use it anyway.`
  },

  thymalpha: {
    slug: 'thymosin-alpha-1',
    h1: 'Thymosin alpha-1: an approved drug, in about forty countries that are not this one',
    title: 'Thymosin alpha-1: approved elsewhere | TherapyLog',
    description: 'A thymic peptide approved in dozens of countries for hepatitis B and C, and not in the US. What the evidence covers and where it thins out.',
    lede: `Most research peptides have no approval anywhere. This one has approvals in dozens of
      countries and none here, which puts it in an unusual position: a real drug with a real
      evidence base that a US reader still cannot obtain through a normal prescription.`,
    sections: [
      {
        h2: 'What it does to the immune system',
        paras: [
          `@@EV_ESTABLISHED@@ Thymosin alpha-1 is a 28-amino-acid peptide originally isolated from
          thymic tissue, where T cells mature. Its action is immunomodulatory rather than
          immunostimulatory in the blunt sense: it acts largely through toll-like receptors on
          dendritic cells and promotes T-cell maturation and function, improving antigen presentation
          and the response to a challenge without the generalised inflammatory activation that a
          cytokine produces.`,
          `That distinction is the reason it has an unusually clean tolerability record for something
          that acts on immunity. It has been used as an adjuvant in chronic hepatitis B and C, in
          vaccine response, and in sepsis and cancer settings, and the adverse-effect profile across
          those uses is mild &mdash; injection-site reactions and little else.`,
          `The app models a two-hour half-life. As with the growth hormone peptides, that number
          describes the molecule rather than the effect: what it triggers is a change in immune cell
          behaviour that persists well beyond clearance, which is why the dosing rows describe twice
          weekly rather than continuous administration.`
        ]
      },
      {
        h2: 'The evidence, and the gap in it',
        paras: [
          `@@EV_ESTABLISHED@@ The approvals rest on hepatitis trials, and that is a specific
          population with a specific problem: an immune system failing to clear a chronic viral
          infection. The sepsis and oncology work is real and more mixed. Across all of it, the
          endpoint is a measurable immunological or clinical outcome in someone who is unwell.`,
          `@@EV_THEORETICAL@@ What the app&rsquo;s entry describes as immune optimisation in healthy
          people is a different proposition and has essentially no evidence behind it. There is no
          trial showing that a healthy adult with a normal immune system gets anything from this,
          and the app&rsquo;s own drawbacks list says as much &mdash; effects may be subtle in
          healthy individuals is a polite way of putting it. The plausible reading is that a
          modulator has more to modulate when something is dysregulated.`,
          `Monitoring reflects that honestly: the app records a complete blood count and general
          inflammatory markers, which is a reasonable baseline and is not a way to tell whether the
          compound is doing anything. There is no biomarker that tracks it.`
        ]
      },
      {
        h2: 'The regulatory position, and why it puts this in Tier B',
        paras: [
          `Approved in dozens of countries, not approved here. This site places it with the research
          compounds rather than the approved ones for a practical reason rather than a scientific
          one: a reader in the United States cannot obtain it on a prescription for an approved
          indication, so what they would actually be getting is a compounded preparation with no
          reference product behind it. That is the same situation as any research peptide regardless
          of what a regulator elsewhere concluded.`,
          `The identity and purity question therefore stands: it rests entirely with whoever made
          the vial. It ships lyophilised and becomes a refrigerated, time-limited solution once
          reconstituted, and the storage rule above is the app&rsquo;s own with its handling caveat
          attached. This site names no pharmacy, vendor or testing service.`,
          `One group should have this conversation with a clinician before rather than after: anyone
          with an autoimmune condition or on immunosuppressive therapy. A compound that modulates
          T-cell function is not a neutral addition in either of those situations, and the reasoning
          cuts both ways rather than obviously one.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the last item is the most useful one on it — the
      effect may be subtle in people who are already well, which is most of the people reading.`,
    faq: [
      ['If it is approved elsewhere, why is it Tier B here?', [
        `Because a US reader cannot get it on a prescription. What is actually obtainable is a
         compounded or research-supply preparation with no approved product behind it, which puts the
         identity and purity question exactly where it sits for every other unapproved compound.`]],
      ['Does it help a healthy immune system?', [
        `No trial has shown that. The evidence base is in people with something wrong — chronic viral
         infection, sepsis, cancer — and a modulator plausibly has less to do when there is less
         dysregulation. The app’s own drawbacks list makes the same point.`]],
      ['Is there a test that shows it is working?', [
        `Not really. A complete blood count and inflammatory markers give a baseline; nothing on a
         routine panel tracks this compound’s effect. Assessment is clinical.`]],
      ['Is it safe with an autoimmune condition?', [
        `That is precisely the question to put to the clinician managing it, before starting. A
         T-cell modulator in an autoimmune setting is not a neutral addition and the reasoning does not
         obviously run one way.`]]
    ],
    basis: [
      ['Immunomodulatory mechanism through toll-like receptors',
        'The thymosin alpha-1 immunology literature'],
      ['Approvals and hepatitis trial base',
        'The approval string in the fact box is app.html’s own field; the approvals rest on chronic hepatitis B and C programmes'],
      ['Absence of evidence in healthy adults',
        'No trial has reported an outcome for immune optimisation in people without an underlying condition'],
      ['Modelled half-life and storage rule',
        'app.html’s TL_PK and TL_STORAGE entries, lifted at build time']
    ],
    cta: `A twice-weekly peptide with no marker to follow leaves your own record as the only data.
      TherapyLog keeps it.`
  },

  semax: {
    slug: 'semax',
    h1: 'Semax: an ACTH fragment with no hormonal activity, and a research base in one country',
    title: 'Semax: BDNF claims and Russian approval | TherapyLog',
    description: 'A heptapeptide approved in Russia for stroke and cognitive impairment. What the BDNF evidence is, and what has never been replicated in the West.',
    lede: `A fragment of ACTH with the hormonal part removed, approved and used clinically in Russia
      for decades, and almost entirely absent from Western literature. Both of those facts are load
      bearing.`,
    sections: [
      {
        h2: 'What it is derived from, and what was taken out',
        paras: [
          `@@EV_ESTABLISHED@@ Adrenocorticotropic hormone has effects on learning and attention that
          are separable from its hormonal role. Semax is the ACTH(4-7) fragment with a
          proline-glycine-proline tail added for stability, and the important consequence of using a
          fragment is that it has no corticotropic activity: it does not stimulate the adrenal
          gland and does not raise cortisol. The neurological activity was kept and the hormone was
          discarded.`,
          `@@EV_THEORETICAL@@ The mechanism most often cited is upregulation of brain-derived
          neurotrophic factor and nerve growth factor, along with effects on dopaminergic and
          serotonergic transmission and on the balance of neurotrophin expression after ischaemic
          injury. The animal and cell work supporting that is real and reasonably extensive; whether
          intranasal administration in a healthy person produces a meaningful central concentration
          is a separate question that is much less well answered.`,
          `The app records no half-life for it, and that is not an oversight &mdash; no
          characterisation has been published, which is why the fact box above carries no
          pharmacokinetic rows.`
        ]
      },
      {
        h2: 'Approved somewhere, unstudied here',
        paras: [
          `@@EV_OFFLABEL@@ Semax is an approved medicine in Russia, used for ischaemic stroke,
          transient ischaemic attack, cognitive impairment and optic nerve conditions, with a
          clinical history spanning decades and a safety record that appears good. That is
          substantially more than most compounds in this reference can claim.`,
          `What does not exist is independent Western replication. There is no published randomised
          controlled trial of semax outside the research tradition that developed it, and the
          approval rests on a body of work that has largely not been examined by investigators with
          no connection to it. That is not an accusation of anything &mdash; it is the same
          criticism that applies to any finding concentrated in one research lineage, and it is why
          this site places it with the research compounds rather than the approved ones.`,
          `The practical position for a reader outside Russia is that they cannot obtain the approved
          product, so what is available is a research-supply preparation. Identity and purity rest
          with whoever made it, and this site names no vendor or testing service.`
        ]
      },
      {
        h2: 'What people actually report, and what to watch',
        paras: [
          `The reported effects are stimulant-like &mdash; alertness, drive, verbal fluency &mdash;
          and the reported problems are the mirror image: anxiety, irritability and disturbed sleep
          at higher doses or later in the day. Vivid dreams turn up frequently in reports. Intranasal
          irritation is the local effect. None of that is surprising for something acting on
          catecholamine transmission, and none of it has been quantified in a controlled setting
          outside its country of origin.`,
          `There is no bloodwork to follow. The app records none, and that is honest: nothing on a
          routine panel reflects this. Assessment is subjective, which makes a dated written record
          of dose, timing and effect the only evidence anyone will have &mdash; and makes it easy to
          attribute to the peptide a good week that had other causes.`,
          `Anyone taking psychiatric medication, or with an anxiety or mood disorder, should be
          having this conversation with the clinician managing that rather than working it out
          alone. A compound reported to shift dopaminergic and serotonergic transmission is not a
          neutral addition to that picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The stimulation items and the sourcing item are the
      two that come up most in practice.`,
    faq: [
      ['Does it raise cortisol like ACTH?', [
        `No. The fragment used excludes the corticotropic region, which is the point of using a
         fragment rather than the hormone. Adrenal stimulation is not part of its profile.`]],
      ['Intranasal or injected?', [
        `The clinical use it is approved for is intranasal, and the app records both routes. Whether
         intranasal delivery produces a meaningful central concentration is the least well answered
         question about this compound.`]],
      ['Why is there no half-life in the fact box?', [
        `Because none has been published, so the app holds none. Any duration figure quoted elsewhere
         for this peptide is not coming from a characterisation study.`]],
      ['How does it compare to selank?', [
        `Same research tradition, same country of approval, different peptide and a different reported
         profile — selank is described as anxiolytic where semax is described as stimulating. Both
         carry the same replication gap.`]]
    ],
    basis: [
      ['ACTH(4-7) fragment without corticotropic activity',
        'The peptide’s published design; the fragment excludes the hormonally active region'],
      ['BDNF and neurotrophin upregulation',
        'Animal and cell work from the Russian research programme; not independently replicated in the West'],
      ['Approval and clinical use',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `A subjective effect with no lab to anchor it is the easiest thing to misattribute.
      TherapyLog keeps the dose, the date and your own note together.`
  },

  kpv: {
    slug: 'kpv',
    h1: 'KPV: three amino acids off the end of alpha-MSH, and what that fragment does',
    title: 'KPV: the anti-inflammatory tripeptide | TherapyLog',
    description: 'A three-residue fragment of alpha-MSH that acts inside the cell rather than at a receptor. What the gut work shows, and what has never been trialled.',
    lede: `The shortest peptide in this reference, and an unusual one: the evidence for it points at
      an intracellular mechanism rather than a receptor, which is why the oral route is taken
      seriously here in a way it usually should not be.`,
    sections: [
      {
        h2: 'A fragment that skips the receptor',
        paras: [
          `@@EV_THEORETICAL@@ Alpha-melanocyte stimulating hormone has anti-inflammatory properties
          separate from its pigmentation role, and KPV &mdash; lysine, proline, valine &mdash; is
          the last three residues of it. What makes it interesting is that the anti-inflammatory
          activity appears to survive in the fragment while the melanocortin receptor activity does
          not: KPV does not meaningfully stimulate MC1R, so it does not produce the tanning or the
          other melanocortin effects that <a href="/compounds/melanotan-ii/">the full agonists</a>
          do.`,
          `The mechanism proposed is intracellular. Rather than binding a surface receptor, the
          tripeptide is reported to be taken up by peptide transporters &mdash; PepT1 in intestinal
          epithelium among them &mdash; and to interfere with NF-kB signalling directly inside the
          cell, which is the master switch for a large part of the inflammatory response. If that
          account is right it explains both the potency at very low concentrations and the
          plausibility of an oral route for gut-directed use, since PepT1 is exactly the transporter
          the gut uses for di- and tripeptides.`,
          `The app records no half-life or time to peak, because none has been published. That is why
          the fact box above carries no pharmacokinetic rows, and it means any duration figure
          quoted for this compound elsewhere is not coming from a characterisation study.`
        ]
      },
      {
        h2: 'The gut evidence, and the ceiling on it',
        paras: [
          `@@EV_THEORETICAL@@ The strongest work is in animal models of colitis, where oral or
          nanoparticle-delivered KPV reduced inflammation and mucosal damage at strikingly low doses.
          There is cell-culture work supporting the NF-kB mechanism, and work on skin inflammation
          from the same direction. It is a coherent and reasonably deep preclinical literature.`,
          `What does not exist is a published randomised controlled trial in people, for any
          indication. The app&rsquo;s regulatory string notes an orphan drug designation in progress
          for inflammatory bowel disease, and it is worth being precise about what that means: an
          orphan designation is a regulatory incentive granted early in development, not a finding
          about whether something works. It says a sponsor is pursuing an indication. It does not say
          the compound has been shown to treat it.`,
          `So the honest summary is a well-supported preclinical mechanism, an unusually plausible
          case for an oral route, and no human efficacy data. The gap between the first two and the
          third is where all the uncertainty sits.`
        ]
      },
      {
        h2: 'Practical points, and the caution that matters',
        paras: [
          `The app records both oral and subcutaneous rows with different targets &mdash; gut-local
          for the oral, systemic for the injection &mdash; and that split follows the mechanism
          rather than being arbitrary. It also means the two routes are not interchangeable: an oral
          dose taken for a tendon is relying on systemic absorption of an intact tripeptide, which is
          a much larger claim than local action on intestinal epithelium.`,
          `There is no monitoring marker. The app records inflammatory markers where the underlying
          condition warrants following them, and nothing on a panel tracks the compound. Assessment
          is symptomatic over weeks.`,
          `The caution that deserves stating: inflammatory bowel disease is a diagnosis with
          effective treatments, real complications when undertreated, and a course that can look
          like improvement while damage continues. Substituting an unstudied peptide for treatment
          that works is the specific harm available here. Anyone using this alongside a diagnosed
          condition should be doing it with the knowledge of the clinician managing that condition,
          not instead of them.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The dosing item is the practical one — optimal dosing
      is not established, so every number in the rows above is convention rather than a finding.`,
    faq: [
      ['Does it cause tanning like the other melanocortin peptides?', [
        `No. The fragment retains the anti-inflammatory activity and not the receptor activity that
         drives pigmentation, which is the main reason it is interesting as a separate compound rather
         than as a version of alpha-MSH.`]],
      ['Does oral KPV actually work?', [
        `For gut-local effects the argument is genuinely plausible — PepT1 transports tripeptides and
         the target tissue is the intestine itself. For systemic effects from an oral dose it is a much
         weaker claim. Neither has a human trial behind it.`]],
      ['What does "orphan drug designation in progress" mean?', [
        `That a sponsor is pursuing a rare-disease indication and seeking the regulatory incentives
         that come with it. It is a statement about development intent, not about evidence, and it is
         routinely quoted as though it were an endorsement.`]],
      ['Can it replace IBD treatment?', [
        `No, and that is the one thing on this page worth being blunt about. Inflammatory bowel disease
         has treatments that work and complications when it is undertreated. This belongs beside a
         clinician’s plan, not instead of one.`]]
    ],
    basis: [
      ['KPV as the C-terminal tripeptide of alpha-MSH',
        'Established peptide chemistry of the melanocortin family'],
      ['NF-kB interference and PepT1 uptake',
        'Cell-culture and animal colitis models published from the 2000s onward'],
      ['Orphan drug designation',
        'The regulatory string in the fact box is app.html’s own field; a designation is a development incentive, not an efficacy finding'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `A compound judged on symptoms over weeks needs the weeks recorded. TherapyLog keeps the
      dose, the route and your own notes on one timeline.`
  },

  ss31: {
    slug: 'ss-31',
    h1: 'SS-31: a peptide that goes to the mitochondrion, and the trials that followed it there',
    title: 'SS-31 (elamipretide): cardiolipin and trials | TherapyLog',
    description: 'A mitochondria-targeted peptide that binds cardiolipin. What the clinical programme found in Barth syndrome and heart failure, and what it did not.',
    lede: `Almost everything else in this reference acts on a receptor at the cell surface. This one
      accumulates inside the mitochondrion and binds a specific lipid there, which is a genuinely
      different kind of intervention and has a genuinely different evidence base.`,
    sections: [
      {
        h2: 'Cardiolipin, and why targeting it makes sense',
        paras: [
          `@@EV_ESTABLISHED@@ Cardiolipin is a phospholipid found almost exclusively in the inner
          mitochondrial membrane, where it shapes the cristae and organises the electron transport
          chain complexes into functional supercomplexes. When cardiolipin is damaged &mdash; by
          oxidation, or by a genetic defect in the enzyme that remodels it &mdash; the membrane
          architecture degrades, electron transport becomes inefficient, and the mitochondrion leaks
          more reactive oxygen species, which damages more cardiolipin. It is a self-reinforcing
          failure.`,
          `SS-31, also called elamipretide, is a four-amino-acid peptide with an alternating
          aromatic-cationic structure that causes it to concentrate in the inner mitochondrial
          membrane at concentrations far above the surrounding cytosol, where it associates with
          cardiolipin. The proposed effect is to stabilise the architecture and interrupt that
          cycle. @@EV_THEORETICAL@@ Preclinical work across ischaemia-reperfusion, heart failure and
          age-related mitochondrial decline supports it consistently.`
        ]
      },
      {
        h2: 'What the human trials found',
        paras: [
          `@@EV_ESTABLISHED@@ This compound has had a real clinical programme, which distinguishes
          it sharply from most research peptides. It has been studied in primary mitochondrial
          myopathy, in Barth syndrome &mdash; a rare genetic disorder of cardiolipin remodelling,
          which is about as clean a test of the mechanism as biology offers &mdash; and in heart
          failure and other indications.`,
          `The results have been mixed rather than triumphant. A phase III trial in primary
          mitochondrial myopathy did not meet its primary endpoint. The Barth syndrome work,
          conducted in a very small population with extension data, produced signals that the
          sponsor pursued toward approval. Heart failure trials have not delivered a clear positive.
          The overall picture is a well-founded mechanism that has been hard to convert into
          endpoints, which is a common outcome for mitochondrial therapeutics and not a
          disqualification of the idea.`,
          `That is a far more informative position than "promising preclinical data", and it is the
          reason this page can say something concrete. It also means the longevity framing &mdash;
          which the app&rsquo;s entry reflects &mdash; runs ahead of the evidence: nothing in the
          programme measured ageing, and the populations studied had specific diseases.`
        ]
      },
      {
        h2: 'What is available, and what it costs to be wrong',
        paras: [
          `@@EV_THEORETICAL@@ There is no approved product. What is available is research-supply
          material, and for a compound whose entire function depends on a precise
          aromatic-cationic sequence reaching an intracellular compartment, purity is not a
          peripheral concern. This site names no vendor and no testing service. The app&rsquo;s own
          drawbacks list flags sourcing and expense before anything else, which is the right
          ordering.`,
          `The app records no half-life or time to peak, because none is published for the
          preparations in circulation, which is why the fact box above has no pharmacokinetic rows.
          It also records no meaningful monitoring: there is no blood test that reflects
          mitochondrial function well enough to follow a trend against, and the honest assessment
          markers are exercise capacity and how you actually feel, measured the same way each
          time.`,
          `The dosing rows above include a performance-framed entry that survives this site&rsquo;s
          filters, and it is worth saying that nothing in the trial programme studied that use. The
          amounts in trials were set for disease indications under monitoring that does not exist
          outside one. Anyone considering this should be having that conversation with a clinician
          who knows their cardiac history in particular, given where the trials were run.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it is honest: cost, sourcing and the absence of
      established dosing are the practical barriers, ahead of any adverse effect.`,
    faq: [
      ['Did the trials work?', [
        `Mixed. The phase III in primary mitochondrial myopathy missed its primary endpoint; the Barth
         syndrome work in a very small population produced signals the sponsor pursued; heart failure
         trials have not delivered a clear positive. A real programme with an unresolved result is still
         far more than most compounds here have.`]],
      ['Is it a longevity drug?', [
        `Nothing in the clinical programme measured ageing. The longevity framing comes from the
         mechanism — mitochondrial decline is a hallmark of ageing — and from preclinical work, not from
         a human outcome.`]],
      ['Why is there no half-life in the fact box?', [
        `Because the app holds none for the material in circulation. Duration figures quoted elsewhere
         are not coming from a characterisation of what people are actually using.`]],
      ['What should be monitored?', [
        `Nothing on a routine panel reflects mitochondrial function usefully. Exercise capacity measured
         consistently is the honest proxy, which means measuring it the same way each time rather than
         comparing impressions.`]]
    ],
    basis: [
      ['Cardiolipin in inner membrane architecture',
        'Established mitochondrial biochemistry'],
      ['Mitochondrial accumulation of the aromatic-cationic peptide',
        'The elamipretide pharmacology literature'],
      ['Clinical programme outcomes',
        'Trials in primary mitochondrial myopathy, Barth syndrome and heart failure, reported from 2018 onward, with mixed results'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `With no marker to follow, a consistent measure of what you can actually do is the whole
      dataset. TherapyLog keeps it beside the dose.`
  },

  tprop: {
    slug: 'testosterone-propionate',
    h1: 'Testosterone propionate: the short ester, and what the frequency buys',
    title: 'Testosterone propionate: the short ester | TherapyLog',
    description: 'A two-day modelled half-life against cypionate’s six. What every-other-day dosing changes, and why the injection site complains more.',
    lede: `The same hormone as cypionate and enanthate on a much shorter leash. Two days rather than
      six, which means more injections, a flatter response to a change, and one specific tolerability
      problem the longer esters do not have.`,
    sections: [
      {
        h2: 'A three-carbon chain and everything that follows',
        paras: [
          `@@EV_ESTABLISHED@@ Propionate is a three-carbon ester against enanthate&rsquo;s seven and
          cypionate&rsquo;s eight-carbon ring. Shorter and less lipophilic means the depot empties
          faster, and the app models the result at about two days. The molecule underneath is
          identical: once the ester is cleaved, propionate delivers exactly the same testosterone as
          the others.`,
          `That half-life is what makes it a genuinely different protocol rather than a variant.
          Every-other-day injection against a two-day half-life produces a modest peak-to-trough
          swing; the same weekly amount given once would swing enormously and would leave several
          days at almost nothing. The frequency is not a preference, it is a consequence.`,
          `What it buys is responsiveness. Time to steady state is about five half-lives &mdash;
          ten days rather than a month &mdash; so a change to the amount is assessable in a
          fortnight instead of six weeks. For someone titrating, or someone who reacted badly to a
          long ester and wants it out of the system quickly, that is the argument. The
          <a href="/compounds/testosterone-cypionate/">cypionate page</a> covers the other side of
          the trade.`
        ]
      },
      {
        h2: 'The injection-site problem is real',
        paras: [
          `Propionate has a reputation for post-injection discomfort that the longer esters do not,
          and it is not folklore. The shorter ester requires a higher concentration of ester per
          milligram of testosterone delivered, the injections are more frequent so any given site
          gets less recovery time, and propionate formulations have historically used higher
          benzyl-alcohol content. Any of the three would produce soreness; together they reliably
          do.`,
          `@@EV_OFFLABEL@@ Subcutaneous administration is widely described as better tolerated than
          intramuscular here for exactly that reason, and rotation across sites matters more than it
          does at weekly frequency. This is one of the few places in this reference where the
          practical obstacle to a protocol is comfort rather than pharmacology, and it is the main
          reason people move off it.`
        ]
      },
      {
        h2: 'Everything downstream is unchanged',
        paras: [
          `The monitoring panel is testosterone&rsquo;s panel, because the hormone is testosterone.
          Luteinising hormone and FSH are suppressed. Haematocrit rises and has a published
          threshold attached &mdash; the <a href="/markers/hematocrit-on-trt/">haematocrit page</a>
          covers it. Estradiol tracks testosterone through aromatase, and the
          <a href="/markers/estradiol-sensitive-vs-standard/">estradiol assay page</a> covers why
          the method changes the number. SHBG usually falls.`,
          `The one measurement difference is draw timing, and it cuts the opposite way from the
          long esters. A two-day half-life on an every-other-day schedule means the level moves
          substantially within a single interval, so a result drawn the morning after an injection
          and one drawn the morning before the next are not comparable. Recording the interval is
          not optional here; it is part of the number.`,
          `Which ester, at what amount, on what schedule, is a prescribing decision. Anything on the
          drawbacks list below that you are experiencing belongs with the clinician who prescribes
          for you.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and honest about where the difficulty is: five of the
      six items are about injection frequency and comfort rather than about the hormone.`,
    faq: [
      ['Why does propionate hurt more?', [
        `Three things stack: more ester per milligram of testosterone, more frequent injections into
         sites that get less recovery, and historically higher benzyl-alcohol content in the
         formulations. Subcutaneous administration and site rotation are the usual responses.`]],
      ['How quickly does it clear?', [
        `About five half-lives, so roughly ten days at the modelled figure. That is the fastest exit
         of the common esters and is the reason it is described as the one to use when reversibility
         matters.`]],
      ['Can it be dosed weekly?', [
        `Not usefully. At a two-day half-life a weekly injection would leave most of the week near
         nothing. The frequency follows from the pharmacokinetics rather than from preference.`]],
      ['Is it stronger than cypionate?', [
        `No. Same hormone, different release rate. Because the ester is a smaller fraction of the
         molecular weight, an identical milligram amount contains slightly more testosterone — a few
         per cent, well inside the variation between two draws.`]]
    ],
    basis: [
      ['Ester chain length and depot release rate',
        'Standard pharmacology of esterified androgens'],
      ['Injection-site tolerability',
        'Consistently reported in clinical use; the formulation and frequency explanations are mechanistic rather than trial-derived'],
      ['Haematocrit monitoring',
        'Endocrine Society clinical practice guideline, Testosterone Therapy in Men with Hypogonadism, J Clin Endocrinol Metab, 2018'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `An every-other-day schedule is the easiest one to lose track of, and the interval is part
      of every lab result. TherapyLog records both.`
  },

  proviron: {
    slug: 'proviron',
    h1: 'Proviron: a DHT derivative that works mostly by moving SHBG out of the way',
    title: 'Proviron (mesterolone): the SHBG angle | TherapyLog',
    description: 'Mesterolone does not aromatise and binds SHBG avidly. Why that raises free testosterone without raising total, and what it costs.',
    lede: `An old oral androgen with a mechanism that is easy to misdescribe. It is not doing much
      anabolically. What it is doing is competing for a binding protein, and the consequence shows
      up on a panel in a way that surprises people.`,
    sections: [
      {
        h2: 'Binding competition, not aromatase inhibition',
        paras: [
          `@@EV_ESTABLISHED@@ Mesterolone is a 1-methylated derivative of dihydrotestosterone. Two
          properties follow from that structure. It is not a substrate for aromatase, so none of it
          converts to oestrogen. And it binds sex hormone-binding globulin with high affinity
          &mdash; DHT and its derivatives bind SHBG more avidly than testosterone does.`,
          `That second property is the mechanism people usually attribute to something else.
          Occupying SHBG displaces testosterone from it, which raises the free fraction without
          raising the total, and it displaces estradiol too, which is where the anti-oestrogenic
          reputation comes from. It is not an aromatase inhibitor and it does not lower estradiol
          production; it changes how much of what is already there is bound. The
          <a href="/markers/shbg/">SHBG page</a> covers why that distinction changes how a panel
          reads.`,
          `The practical consequence for anyone reading their own bloodwork: free testosterone can
          rise substantially while total testosterone barely moves, and estradiol measured as a
          total can look unchanged while its free fraction has shifted. A panel that reports only
          totals will under-describe what happened.`
        ]
      },
      {
        h2: 'Where it fits, and where the honest limits are',
        paras: [
          `@@EV_OFFLABEL@@ The situation it is described for is high SHBG with a good total
          testosterone and a poor free testosterone &mdash; a common and genuinely frustrating
          pattern, where raising the testosterone dose mostly raises SHBG-bound hormone. Using
          mesterolone there is off-label; the approvals are older and narrower than the use.`,
          `Two limits are worth stating plainly. It has little anabolic effect on its own, which the
          app&rsquo;s own drawbacks list says, so anyone expecting a muscle effect is expecting the
          wrong thing. And it is an androgen, so it does suppress luteinising hormone &mdash;
          mildly, but it is not free of the axis effects that oral androgens have.`,
          `Being a DHT derivative also means it does what DHT does in tissues that respond to DHT:
          it can accelerate androgenic hair loss in people predisposed to it, and it is not suitable
          for women. And like most oral androgens it reduces HDL cholesterol, which is the effect
          that shows up on a lipid panel rather than in how someone feels.`
        ]
      },
      {
        h2: 'What to measure',
        paras: [
          `The app&rsquo;s panel here is unusually well matched to the mechanism: free testosterone
          and SHBG together, because the point is the ratio between them, plus estradiol, a lipid
          panel for the HDL effect, and DHT. Reading total testosterone alone on this compound will
          tell you almost nothing.`,
          `@@EV_ESTABLISHED@@ Free testosterone is itself a measurement with a method problem
          &mdash; calculated, direct immunoassay and equilibrium dialysis give three different
          answers, and calculated values assume an SHBG binding behaviour this compound is
          deliberately interfering with. The
          <a href="/markers/free-vs-total-testosterone/">free versus total testosterone page</a>
          covers which is which. That caveat matters more here than almost anywhere.`,
          `Whether this applies to a particular person, and at what amount, is a prescribing
          decision made from a panel that includes SHBG. Anything on the drawbacks list below that
          you are experiencing belongs in front of the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The lipid item is the one that shows up on paper
      rather than in symptoms, which makes it the one worth actually measuring.`,
    faq: [
      ['Does it lower estradiol?', [
        `Not by reducing production. It displaces estradiol from SHBG, which changes the bound and free
         fractions rather than the total made. That is a different intervention from an aromatase
         inhibitor and it should not be substituted for one on the assumption they do the same thing.`]],
      ['Why did my free testosterone rise but not my total?', [
        `That is the expected result. Occupying SHBG frees testosterone that was already circulating
         bound. Nothing new was produced, so the total is unchanged.`]],
      ['Is calculated free testosterone still valid on it?', [
        `Less so. Calculated free testosterone assumes normal binding behaviour, and this compound is
         competing for the binding protein. Equilibrium dialysis is the method that does not make that
         assumption — the free versus total page covers the difference.`]],
      ['Does it suppress natural production?', [
        `Mildly. It is an androgen and it does feed back on luteinising hormone, which the app’s own
         drawbacks list notes. It is not exempt from the axis effects other androgens have.`]]
    ],
    basis: [
      ['SHBG binding affinity of DHT derivatives',
        'Standard endocrinology references on sex hormone-binding globulin affinity'],
      ['Absence of aromatisation',
        'Mesterolone is not a substrate for aromatase; established in its published pharmacology'],
      ['HDL reduction with oral androgens',
        'A consistent class effect in the lipid literature'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `Free testosterone and SHBG only mean something read together. TherapyLog charts them on
      one timeline with the dose.`
  },

  testpellets: {
    slug: 'testosterone-pellets',
    h1: 'Testosterone pellets: steady levels, and no way to take them back',
    title: 'Testosterone pellets: the trade-off | TherapyLog',
    description: 'Implanted pellets give months of steady release with no peaks. The cost is that the dose cannot be changed once it is under the skin.',
    lede: `The flattest testosterone curve available, bought with the one property no other route
      has: once the pellets are in, the dose is fixed until they dissolve. Everything worth knowing
      about this route follows from that single fact.`,
    sections: [
      {
        h2: 'How the release works',
        paras: [
          `@@EV_ESTABLISHED@@ Pellets are small crystalline cylinders of testosterone, typically 75 mg
          each, placed in subcutaneous fat through a trocar under local anaesthetic, usually in the
          upper outer buttock. They have no ester and no carrier oil: release is governed by surface
          dissolution of the crystal itself, which is why the curve is so flat and why it stretches
          over months rather than days.`,
          `That also means there is no half-life to model in the usual sense, which is why the fact
          box above carries no pharmacokinetic rows &mdash; the app holds none for this entry. The
          release profile is a slow decline over three to six months rather than a repeating peak
          and trough, and the level people describe as a trough is the tail end before the next
          insertion.`,
          `The flatness is the genuine advantage. Someone whose symptoms track the injection cycle
          &mdash; good for four days, flat for three &mdash; is describing a problem this route does
          not have. Adherence is the other: two or three appointments a year replaces a weekly task.`
        ]
      },
      {
        h2: 'The irreversibility is the whole risk',
        paras: [
          `Every other testosterone route can be stopped. A gel is washed off, an injection is not
          repeated, a tablet is not taken. A pellet keeps releasing for months regardless of what
          anyone learns in the meantime. @@EV_OFFLABEL@@ If the amount turns out to be too high
          &mdash; haematocrit climbing, estradiol symptomatic, mood worsening &mdash; the options are
          to manage around it or to have the pellets surgically removed, and removal is not always
          straightforward once they have partly dissolved.`,
          `That is why the first insertion is the one that deserves the most conservatism, and why
          people already established on injections have more information to size it with than someone
          starting from scratch. It is also why the app puts haematocrit at four weeks post-insertion
          on the monitoring list rather than at the usual interval: the point is to catch a problem
          while there is still time to plan around it.`,
          `Extrusion &mdash; a pellet working its way back out through the insertion site &mdash;
          happens in a small percentage of procedures, and site infection is uncommon but real. Both
          are procedural risks that the other routes do not have at all, and both are reasons the
          insertion site is on the monitoring list.`
        ]
      },
      {
        h2: 'Approved product, and the compounded parallel',
        paras: [
          `@@EV_ESTABLISHED@@ There is an FDA-approved pellet product, which is unusual in this
          reference and means a real manufacturing standard and a real label. There is also a large
          parallel market in compounded pellets used in hormone-therapy practices, and those are not
          the same thing: a compounded pellet has not been through the approval process, its dose
          consistency depends on the compounder, and pellets in particular are a formulation where
          crystal size and packing affect the release rate.`,
          `That distinction is worth asking about directly, because both are described with the same
          word. This site names no clinic and no pharmacy.`,
          `Monitoring is drawn at two points for a reason: about four weeks after insertion, near the
          peak of the release, and again just before the next insertion, at the trough. Two numbers
          three months apart describe the curve; one number does not tell you which part of it you
          measured. Everything about whether this route suits a particular person is a prescribing
          conversation, and it is one to have before the first insertion rather than after.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first and last items are the same problem
      stated twice — which is a fair reflection of how much it dominates this route.`,
    faq: [
      ['Can pellets be removed if something goes wrong?', [
        `Surgically, yes, and it is not always simple once they have begun dissolving. That is the
         reason to be conservative on a first insertion rather than to plan on correction.`]],
      ['When should bloodwork be drawn?', [
        `Two points: about four weeks after insertion, near the top of the release, and just before the
         next one, at the bottom. The app’s own panel says the same. A single mid-interval draw does not
         tell you which part of the curve it came from.`]],
      ['Are compounded pellets the same as the approved product?', [
        `No. One has been through approval with a manufacturing standard behind it; the other depends
         on the compounder. For a formulation where crystal packing affects release rate, that is not a
         technicality — and both are called pellets.`]],
      ['Why is there no half-life in the fact box?', [
        `Because the app holds none, and the release mechanism is surface dissolution rather than
         clearance of a depot. The profile is a months-long decline, not a repeating curve, so a
         half-life would not describe it.`]]
    ],
    basis: [
      ['Surface-dissolution release from crystalline implants',
        'The pharmacology of subcutaneous testosterone implants, established since the 1930s'],
      ['Approved product and the compounded parallel',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Extrusion and site infection rates',
        'Reported in the implant literature at low single-digit percentages'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this route, which is why no such rows appear above']
    ],
    cta: `Two draws three months apart only describe a curve if you know which is which.
      TherapyLog dates the insertion and both panels.`
  },

  nolv: {
    slug: 'tamoxifen',
    h1: 'Tamoxifen: a receptor blocker that leaves the hormone alone',
    title: 'Tamoxifen: receptor blockade, not suppression | TherapyLog',
    description: 'Tamoxifen blocks oestrogen at the receptor in breast tissue without lowering circulating estradiol. Why that matters for gynaecomastia.',
    lede: `An aromatase inhibitor lowers the hormone. Tamoxifen leaves the hormone where it is and
      blocks the receptor in the tissue that matters. Those are different interventions with
      different consequences, and conflating them is the most common error made about it.`,
    sections: [
      {
        h2: 'Selective, and what the selectivity means',
        paras: [
          `@@EV_ESTABLISHED@@ Tamoxifen is a selective oestrogen receptor modulator: it antagonises
          the receptor in some tissues and acts as an agonist in others. In breast tissue it is an
          antagonist, which is the basis for both its oncology approval and its off-label use for
          gynaecomastia. In bone and in the liver it behaves more like an agonist, which is why it
          does not carry the bone-density concern that oestrogen suppression does and why it affects
          lipids the way it does.`,
          `That tissue selectivity is the whole reason to prefer it over an aromatase inhibitor for
          a breast-tissue problem. An aromatase inhibitor lowers estradiol everywhere &mdash;
          including the bone, the brain and the vasculature where a man needs it &mdash; to fix a
          problem in one tissue. Tamoxifen blocks the receptor where the problem is and leaves
          circulating estradiol intact. The
          <a href="/compounds/anastrozole/">anastrozole page</a> covers what over-suppression costs.`,
          `Its half-life is long &mdash; the app models about six days, and the active metabolites
          run longer still &mdash; so it accumulates over weeks and clears over weeks. An effect
          assessed at a fortnight is being assessed before the level has settled.`
        ]
      },
      {
        h2: 'What it does for gynaecomastia, and when',
        paras: [
          `@@EV_OFFLABEL@@ Gynaecomastia is glandular proliferation, and the window in which it
          responds to anything pharmacological is early. In the proliferative phase, while the tissue
          is tender and recently changed, receptor blockade can reduce or reverse it. Once the
          tissue has become fibrotic &mdash; typically after about a year &mdash; no drug reliably
          removes it, and surgery is the only thing that does. That timeline is the single most
          practically useful fact on this page.`,
          `It is also why the honest answer to "will this fix it" is a question about how long it has
          been there. Someone with tender, recently developed tissue is in a different situation
          from someone with a firm, painless, long-standing lump, and only the first has a
          pharmacological option worth trying.`
        ]
      },
      {
        h2: 'Why there is no dosing table on this page',
        paras: [
          `You will notice this page carries no reproduced dosing rows. That is deliberate and
          automatic: the two rows the app holds for tamoxifen are a post-cycle recovery protocol and
          a during-cycle prevention schedule, and the generator strips rows framed that way before a
          page is built. Every compound page here is filtered the same way; tamoxifen is simply the
          one entry where nothing survives it.`,
          `What is left to say is the approved pharmacology, which is what this page covers. The
          amounts used in the oncology indication are published in the labelling and are a
          prescribing matter, not a page&rsquo;s.`,
          `The risk worth naming is thromboembolism. Tamoxifen raises the risk of venous
          thromboembolic events, which is established in the oncology trial data, and it is the
          reason a personal or family history of clotting matters here more than it does with most
          things in this reference. Visual disturbance is the other class effect with a conventional
          instruction attached: blurring or persistent after-images are a reason to stop and contact
          the prescriber rather than to continue and watch. Anything on the drawbacks list below
          belongs in the same conversation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The clot item is the one that changes who should be
      taking this at all rather than how much.`,
    faq: [
      ['Tamoxifen or an aromatase inhibitor for gynaecomastia?', [
        `They work differently. Tamoxifen blocks the receptor in the tissue with the problem and leaves
         circulating estradiol alone; an aromatase inhibitor lowers estradiol everywhere. For a
         breast-tissue problem the first is the more targeted intervention. Which is appropriate is a
         prescribing decision.`]],
      ['Does it lower estradiol?', [
        `No. It does not reduce production at all — it occupies the receptor. Someone expecting the
         estradiol number on their panel to fall will be confused by a result that has not moved, and
         the unchanged number is not evidence the drug is not working.`]],
      ['How long does gynaecomastia stay treatable?', [
        `Roughly the first year, while the tissue is still proliferative and usually tender. Once it
         fibroses, no drug reliably reverses it. That makes the timing of the conversation more
         important than the choice of drug.`]],
      ['Why does this page show no dosing rows?', [
        `Because both rows the app holds for tamoxifen are post-cycle or during-cycle protocols, and
         the generator strips those from every compound page before building it. Tamoxifen is the one
         entry where that leaves nothing.`]]
    ],
    basis: [
      ['Tissue-selective receptor modulation',
        'Standard pharmacology of selective oestrogen receptor modulators'],
      ['Thromboembolic risk',
        'Established in the tamoxifen oncology trial data and carried in the approved labelling'],
      ['Proliferative versus fibrotic gynaecomastia',
        'The endocrinology and surgical literature on gynaecomastia natural history'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `Whether tissue is weeks old or a year old changes what is possible. TherapyLog keeps the
      dates that answer that.`
  },

  ndt: {
    slug: 'natural-desiccated-thyroid',
    h1: 'Natural desiccated thyroid: a fixed ratio, and a regulatory status worth knowing',
    title: 'Natural desiccated thyroid: NDT explained | TherapyLog',
    description: 'Porcine thyroid extract supplies T4 and T3 in a fixed ratio. What that ratio does to a panel, and why these products are not FDA approved.',
    lede: `Thyroid extract from pig glands, in clinical use since before the FDA existed &mdash;
      which turns out to be the key to its regulatory status. It supplies both hormones in a ratio
      you cannot change, and that constraint shapes everything about how it reads on a panel.`,
    sections: [
      {
        h2: 'A fixed ratio you do not control',
        paras: [
          `@@EV_ESTABLISHED@@ Desiccated thyroid is standardised by content and supplies both T4 and
          T3 in roughly a four-to-one ratio by weight. Human thyroid output is closer to fourteen to
          one. That difference is the central pharmacological fact about NDT: relative to what a
          human gland secretes, it is a T3-heavy preparation, and the consequences follow from
          that.`,
          `Because the ratio is fixed, dose is one dial rather than two. Raising the T4 raises the
          T3 proportionally, so someone who needs more of one and not the other cannot get there
          from here &mdash; which is exactly the situation combination therapy with separate
          <a href="/compounds/levothyroxine-t4/">levothyroxine</a> and
          <a href="/compounds/liothyronine-t3/">liothyronine</a> exists to address. NDT is simpler
          and less adjustable; separate hormones are more work and fully titratable.`,
          `The T3 fraction also carries T3&rsquo;s measurement problem. It has a day-long half-life
          against thyroxine&rsquo;s week, so the level moves across the day, and a free T3 drawn
          without a recorded interval since the dose is hard to place. The
          <a href="/markers/thyroid-panel/">thyroid panel page</a> covers what each value means.`
        ]
      },
      {
        h2: 'The approval question',
        paras: [
          `@@EV_ESTABLISHED@@ Desiccated thyroid products are not FDA-approved drugs. They predate
          the 1938 legislation that created the modern approval pathway and have been marketed ever
          since under enforcement discretion rather than through an application. No manufacturer has
          taken one through approval, and the agency has periodically said so.`,
          `That matters more than a regulatory footnote usually does, because approval is what
          forces a manufacturer to demonstrate potency, purity and bioequivalence to a regulator
          before a product reaches a pharmacy. Nobody has done that for these. Unapproved is not
          the same as unavailable, though &mdash; these are ordinary prescription drugs dispensed
          by ordinary pharmacies, which is why the distinction gets lost.`,
          `The practical consequence is the one the app&rsquo;s drawbacks list already names:
          potency consistency between batches and between brands is a real historical problem for
          these products, and there have been recalls over it. Switching brand or batch is a reason
          to recheck rather than assume equivalence &mdash; more so than with levothyroxine, where
          the same caution applies for a narrower reason.`
        ]
      },
      {
        h2: 'Reading the panel',
        paras: [
          `@@EV_OFFLABEL@@ TSH suppresses on adequate NDT, as it does on any preparation containing
          T3, and that is expected rather than a finding. It also means the marker that titrates
          levothyroxine stops being the one to steer by, which is what the app&rsquo;s own note says
          &mdash; guide by free T3 rather than TSH.`,
          `The argument about whether people do better on NDT than on levothyroxine is the same
          argument the T3 page covers, with the same unsettled evidence: randomised trials of
          combination therapy have mostly not shown consistent benefit on measured outcomes, and
          some blinded preference work has found patients choosing the T3-containing option. Neither
          finding closes it, and anyone presenting it as closed in either direction is
          overstating.`,
          `@@EV_ESTABLISHED@@ The risk that accrues quietly is the same too: sustained excess
          thyroid hormone reduces bone mineral density and raises atrial fibrillation incidence,
          neither of which announces itself. That is why resting heart rate sits on the app&rsquo;s
          monitoring list beside the hormones, and why this is a prescribing decision rather than a
          self-titration. Anything on the drawbacks list below belongs with the clinician who
          prescribes.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the potency-variation item is the one with a real
      history behind it rather than a theoretical one.`,
    faq: [
      ['Is NDT FDA approved?', [
        `No. These products predate the 1938 approval pathway and are marketed under enforcement
         discretion rather than through an application, so no manufacturer has had to demonstrate
         potency, purity or bioequivalence to a regulator before selling one. They are still
         prescription drugs dispensed by ordinary pharmacies — unapproved is not the same as
         unavailable.`]],
      ['What does "one grain" mean?', [
        `It is the historical unit for desiccated thyroid, roughly 60-65 mg of thyroid powder,
         standardised by hormone content. The app’s dosing rows use both the milligram and the grain
         figure, which is how these products are labelled.`]],
      ['Why is my TSH suppressed?', [
        `Because the preparation contains T3, which feeds back on the pituitary directly. That is
         expected on an adequate dose and is why free T3 rather than TSH is what the app’s own
         monitoring note steers by.`]],
      ['Is it better than levothyroxine?', [
        `The randomised evidence has not settled it. What is different is that NDT gives both hormones
         in a fixed ratio, which is simpler but not adjustable — where separate T4 and T3 are more work
         and fully titratable. Which suits a person is a prescribing conversation.`]]
    ],
    basis: [
      ['T4 to T3 ratio in desiccated thyroid versus human secretion',
        'Standard endocrinology references; roughly 4:1 in the preparation against roughly 14:1 physiologically'],
      ['Regulatory status of desiccated thyroid products',
        'Marketed as pre-1938 products under enforcement discretion; no manufacturer has completed an approval'],
      ['Randomised evidence on T3-containing therapy',
        'Trials and meta-analyses from the 2000s onward, alongside blinded preference studies reporting a different result'],
      ['Bone density and atrial fibrillation with excess thyroid hormone',
        'Long established in the literature on subclinical hyperthyroidism']
    ],
    cta: `A preparation whose potency can vary between batches makes the brand and the date part of
      the result. TherapyLog records both.`
  },

  creatine: {
    slug: 'creatine-monohydrate',
    h1: 'Creatine monohydrate: the most studied supplement there is, and the lab result it ruins',
    title: 'Creatine: the evidence, and your creatinine | TherapyLog',
    description: 'Creatine works, loading is optional, and it raises serum creatinine without touching your kidneys. Tell the lab before they read an eGFR.',
    lede: `Almost everything about creatine is settled, which is rare enough to be worth saying
      plainly. The part worth a page is the one nobody mentions: it changes a routine blood result
      in a way that gets misread as kidney damage.`,
    sections: [
      {
        h2: 'What it does, and what the evidence actually supports',
        paras: [
          `@@EV_ESTABLISHED@@ Creatine is stored in muscle as phosphocreatine, which donates a
          phosphate to regenerate ATP during short, maximal efforts. Supplementation raises muscle
          phosphocreatine stores by roughly twenty per cent, and the downstream effect &mdash;
          improved performance in repeated high-intensity efforts, and greater training adaptation
          over time &mdash; is among the best-replicated findings in sports science. Several hundred
          trials, decades of use, consistent direction.`,
          `@@EV_OFFLABEL@@ The newer claims are less settled but not baseless. Cognitive effects
          appear in trials under conditions of stress &mdash; sleep deprivation, hypoxia, mental
          fatigue &mdash; more consistently than in rested healthy people. Effects in vegetarians,
          who start with lower stores, tend to be larger across the board. Preservation of lean mass
          during a caloric deficit has reasonable support. None of these are on the same footing as
          the performance data, and describing them as if they were is the usual overreach.`,
          `Loading is optional. Twenty grams a day for a week saturates muscle faster; three to five
          grams a day gets to the same saturation in three or four weeks with far less
          gastrointestinal upset. The app&rsquo;s own rows say exactly that.`
        ]
      },
      {
        h2: 'The creatinine problem',
        paras: [
          `@@EV_ESTABLISHED@@ Creatine degrades to creatinine at a steady rate, and serum creatinine
          is what laboratories use to estimate kidney function. Supplementing creatine therefore
          raises serum creatinine and lowers a calculated eGFR &mdash; without anything having
          happened to the kidney. The rise is real; the interpretation is wrong.`,
          `This is not a curiosity. It is one of the more common ways a healthy person gets referred
          for renal workup, and it is entirely avoidable by telling whoever ordered the test. The
          app puts it on the monitoring note for this compound specifically, and it is the single
          most useful thing on this page: if you supplement creatine, say so before a metabolic
          panel, and say it again if anyone raises an eGFR with you. Cystatin C is a kidney marker
          that creatine does not disturb, and it is the usual way to settle the question if it
          arises.`,
          `The kidney concern itself &mdash; that creatine harms renal function &mdash; has been
          examined repeatedly in people with healthy kidneys and has not been found. Existing kidney
          disease is a different conversation and one for the clinician managing it.`
        ]
      },
      {
        h2: 'The rest of the practical detail',
        paras: [
          `The initial weight gain is intramuscular water, not fat and not subcutaneous fluid, and it
          arrives in the first week or two. Anyone tracking body composition through a scale will see
          it and misread it, which is worth knowing in advance rather than discovering.`,
          `Monohydrate is the form with the evidence. The alternatives &mdash; hydrochloride,
          ethyl ester, buffered preparations &mdash; are sold on solubility or absorption claims and
          none has demonstrated superiority on an outcome. Paying more for one is paying for
          marketing. Since these are supplements rather than drugs, content varies with the
          manufacturer; this site names no brand and no testing service.`,
          `Non-responders exist &mdash; people whose muscle stores are already near saturated from
          diet get little further benefit &mdash; and that is a real phenomenon rather than an
          excuse. Anyone with kidney disease, or on medication that affects renal function, should
          be having this conversation with their clinician rather than treating it as a
          consumer-goods decision.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and unusually mild: for a compound this well studied,
      the drawback list is mostly about measurement artefacts and expectations.`,
    faq: [
      ['Does creatine damage the kidneys?', [
        `Not in people with healthy kidneys — that has been looked at repeatedly. What it does is raise
         serum creatinine, which is the marker used to estimate kidney function, so it makes a healthy
         kidney look impaired on paper. Existing kidney disease is a separate conversation.`]],
      ['Do I need to load?', [
        `No. Loading saturates muscle in about a week rather than three or four, at the cost of more
         gastrointestinal upset. The endpoint is identical.`]],
      ['Is any form better than monohydrate?', [
        `No form has demonstrated superiority on an outcome. Monohydrate has the evidence and is the
         cheapest, which is an unusual combination.`]],
      ['What do I tell the lab?', [
        `That you supplement creatine, before the draw. If an eGFR has already come back low, cystatin
         C is a kidney marker creatine does not affect and is the usual way to settle it.`]]
    ],
    basis: [
      ['Phosphocreatine stores and performance',
        'Several hundred randomised trials and multiple meta-analyses spanning three decades'],
      ['Serum creatinine elevation without renal impairment',
        'Consistently reported; cystatin C is the standard unaffected alternative marker'],
      ['Cognitive effects under stress conditions',
        'Trials in sleep deprivation, hypoxia and mental fatigue, with larger effects in vegetarians'],
      ['Form comparisons',
        'No alternative form has demonstrated superiority to monohydrate on a performance outcome']
    ],
    cta: `A supplement that changes a routine lab result is one your log should know about.
      TherapyLog keeps it with the panel.`
  },

  berberine: {
    slug: 'berberine',
    h1: 'Berberine: the glucose data is real, the "nature’s Ozempic" framing is not',
    title: 'Berberine: the evidence, and the GLP-1 myth | TherapyLog',
    description: 'Berberine has genuine meta-analysed glucose and lipid data. It is not a GLP-1 agonist and does not work like one. What it actually does.',
    lede: `Two things are true at once and get confused. Berberine has a real body of randomised
      evidence for glucose and lipids, better than most supplements manage. And it is not remotely
      what the viral comparison says it is.`,
    sections: [
      {
        h2: 'What it does, and what it does not',
        paras: [
          `@@EV_ESTABLISHED@@ Berberine is a plant alkaloid that activates AMP-activated protein
          kinase, largely by inhibiting mitochondrial complex I and shifting the cell&rsquo;s energy
          balance &mdash; the same route metformin takes. Downstream it reduces hepatic glucose
          production, improves peripheral insulin sensitivity, and lowers LDL cholesterol partly
          through upregulating the LDL receptor. It also has direct antimicrobial activity and
          measurably shifts gut microbiome composition, which may contribute to the metabolic
          effect.`,
          `@@EV_OFFLABEL@@ It is not a GLP-1 receptor agonist. It does not bind that receptor, does
          not slow gastric emptying the way semaglutide does, and produces nothing like the appetite
          suppression or the weight loss. Meta-analysed weight change on berberine is small &mdash;
          a couple of kilograms at most, in trials mostly conducted in people with metabolic
          disease. The comparison that made it briefly famous is wrong in mechanism and wrong by an
          order of magnitude in effect. The <a href="/compounds/semaglutide/">semaglutide page</a>
          covers what the drug it was compared to actually does.`,
          `The honest comparison is with <a href="/compounds/metformin/">metformin</a>, which shares
          the mechanism. Head-to-head trials have reported broadly comparable glucose control, and
          those trials are mostly small and mostly conducted in one country. That is a real result
          worth taking seriously and not the same thing as sixty years of prescribing data.`
        ]
      },
      {
        h2: 'Bioavailability is the problem the dosing solves',
        paras: [
          `Oral berberine is poorly absorbed &mdash; single-digit percentage bioavailability &mdash;
          which is why the effective amounts are high and why they are split across meals rather
          than taken once. That is also why the gastrointestinal effects mirror metformin&rsquo;s:
          much of the dose stays in the gut, where a good deal of the action may be.`,
          `@@EV_ESTABLISHED@@ The interaction that matters is pharmacokinetic rather than
          pharmacodynamic. Berberine inhibits CYP3A4 and P-glycoprotein, which means it can raise
          blood levels of drugs cleared through those routes &mdash; a long list that includes
          statins, several immunosuppressants, some anticoagulants and many others. This is the
          single most under-discussed thing about it: an over-the-counter supplement with a real
          enzyme-inhibition profile is a genuine interaction risk, and it belongs on the medication
          list you hand a clinician rather than being left off because it came from a shop.`
        ]
      },
      {
        h2: 'What to measure, and what supplement status means',
        paras: [
          `The app&rsquo;s panel is the sensible one: fasting glucose and HbA1c for the metabolic
          effect, a lipid panel because the LDL effect is one of the better-supported ones, and
          liver enzymes. The <a href="/markers/hba1c-and-fasting-glucose/">HbA1c page</a> covers
          why those two glucose markers can disagree and what the disagreement means.`,
          `Supplement status is not a safety finding. It means no regulator has reviewed identity,
          purity or content, and berberine content in commercial products has been found to vary
          substantially from label in independent analyses. This site names no brand and no testing
          service.`,
          `Two groups should not treat this as a consumer decision: anyone pregnant or
          breastfeeding, where berberine is contraindicated, and anyone on medication metabolised
          through CYP3A4. Both are conversations with a clinician before starting, and anything on
          the drawbacks list below belongs in the same conversation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the CYP3A4 item is the one most likely to matter
      and least likely to be mentioned anywhere else.`,
    faq: [
      ['Is berberine like Ozempic?', [
        `No. Different mechanism entirely — AMPK activation rather than GLP-1 receptor agonism — and
         the weight effect in trials is a couple of kilograms against fifteen per cent of body weight.
         The comparison is wrong in kind and in size.`]],
      ['Is it as good as metformin?', [
        `Head-to-head trials have reported broadly comparable glucose control, and they are small and
         geographically concentrated. That is a real finding and not the same as metformin’s sixty years
         of prescribing data. Metformin also requires a prescription, which is often the actual reason
         people choose berberine.`]],
      ['Why three times a day?', [
        `Because oral bioavailability is in the single digits, so the effective amount is high and is
         split across meals. Taking it once daily wastes most of the effect and concentrates the
         gastrointestinal upset.`]],
      ['Does it interact with anything?', [
        `Yes, and this is the part that gets left out. It inhibits CYP3A4 and P-glycoprotein, so it can
         raise levels of a long list of prescription drugs. It belongs on the medication list you give a
         clinician even though it came from a shop.`]]
    ],
    basis: [
      ['Meta-analysed glucose and lipid effects',
        'Multiple meta-analyses of randomised trials, largely in people with type 2 diabetes or metabolic syndrome'],
      ['AMPK activation via complex I',
        'The shared mechanistic literature with metformin'],
      ['CYP3A4 and P-glycoprotein inhibition',
        'Established in the drug-interaction literature'],
      ['Label accuracy of commercial products',
        'Independent analyses reporting berberine content varying substantially from label']
    ],
    cta: `A supplement with a real interaction profile belongs on the same list as your prescriptions.
      TherapyLog keeps them together.`
  },

  fisetin: {
    slug: 'fisetin',
    h1: 'Fisetin: a senolytic candidate, dosed in pulses, on mouse evidence',
    title: 'Fisetin: the senolytic case, examined | TherapyLog',
    description: 'A flavonoid proposed to clear senescent cells in high intermittent doses. What the mouse data showed, and what human trials have not yet.',
    lede: `The senolytic idea is genuinely interesting and the pulse-dosing logic follows from it
      properly. What has not happened yet is a human trial reporting an outcome, and the amounts
      people take are extrapolated from animals by body weight.`,
    sections: [
      {
        h2: 'Why pulses rather than daily',
        paras: [
          `@@EV_THEORETICAL@@ Senescent cells are cells that have stopped dividing but refuse to die,
          and they accumulate with age while secreting a mix of inflammatory signals known as the
          senescence-associated secretory phenotype. The senolytic hypothesis is that periodically
          killing them off produces a durable benefit, because the cells take months to accumulate
          again. If that is right, the drug does not need to be present continuously &mdash; it
          needs to be present in enough concentration, briefly, to trigger apoptosis in cells that
          have made themselves resistant to it.`,
          `That is the logic behind two or three days of high dose every few months rather than a
          daily supplement, and it is a coherent piece of reasoning rather than a marketing
          schedule. It is also completely different from how fisetin is sold as an everyday
          antioxidant flavonoid, and the two uses should not be conflated.`,
          `@@EV_ESTABLISHED@@ Fisetin itself is a flavonoid found in strawberries and other produce,
          with a long history as an ordinary dietary constituent. Its safety at food-level intake is
          not in question. The senolytic amounts are orders of magnitude above that.`
        ]
      },
      {
        h2: 'The evidence, and the arithmetic behind the dose',
        paras: [
          `@@EV_THEORETICAL@@ The central finding is that fisetin reduced senescent cell burden across
          tissues and extended median and maximum lifespan in aged mice, alongside cell work showing
          selective killing of senescent cells. That is a real, notable result. What does not exist
          is a published human trial reporting a clinical outcome &mdash; trials have been registered
          and run, and results establishing benefit in people have not landed.`,
          `The dose arithmetic deserves scrutiny because it is where most of the confidence comes
          from. The commonly cited amounts derive from the mouse studies at around 20 mg/kg,
          scaled to a human by body weight. Straight body-weight scaling across species is not how
          dose translation is normally done, and fisetin&rsquo;s oral bioavailability is poor and
          highly variable with the fat content of the meal. So the number in circulation is an
          estimate built on an approximation, and the app&rsquo;s own drawbacks list says the human
          optimal dose is not established.`,
          `Monitoring reflects the state of things honestly: the app records inflammatory markers
          before and after a pulse, which is a plausible proxy and not a validated one. There is no
          test that tells you whether senescent cells were cleared.`
        ]
      },
      {
        h2: 'Practical points',
        paras: [
          `Absorption depends on being taken with fat, which is why the app&rsquo;s row specifies a
          fatty meal. Content varies between products, as it does with any supplement, and this site
          names no brand and no testing service.`,
          `@@EV_OFFLABEL@@ The interaction question is real: flavonoids at these concentrations
          affect drug-metabolising enzymes, and a two-day pulse at a gram or more per day is not the
          same exposure as eating strawberries. Anyone on prescription medication should treat the
          pulse as a medication event rather than a supplement, and anyone on an anticoagulant
          should be raising it with a clinician specifically.`,
          `The comparison worth knowing is with <a href="/compounds/dasatinib/">dasatinib</a>, the
          prescription drug used in the same senolytic role, which does have human trial data and
          real risks. Fisetin is the option people can buy; that is a statement about availability,
          not about evidence. Anything on the drawbacks list below belongs with the clinician who
          knows your history.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The third item — human optimal dose not established —
      is the one that undercuts the confident numbers everywhere else on the internet.`,
    faq: [
      ['Has fisetin been shown to work in people?', [
        `No trial has reported a clinical outcome establishing benefit. The evidence is mouse lifespan
         and senescent cell clearance plus cell work. That is a real finding about mice.`]],
      ['Where does the 20 mg/kg dose come from?', [
        `From the mouse studies, scaled to human body weight directly. Straight body-weight scaling is
         not standard dose translation between species, and fisetin’s absorption is poor and variable —
         so the figure is an estimate on top of an approximation.`]],
      ['Why take it with fat?', [
        `Oral absorption is poor and improves substantially with dietary fat. The app’s own row specifies
         a fatty meal for that reason.`]],
      ['Is it the same as taking quercetin?', [
        `Both are flavonoids proposed as senolytics and they are frequently taken together, but they are
         different molecules with different potencies in the cell work. Quercetin is the one paired with
         dasatinib in the trial protocols.`]]
    ],
    basis: [
      ['Senescent cell clearance and mouse lifespan extension',
        'Rodent studies reporting reduced senescent cell burden across tissues and extended median and maximum lifespan'],
      ['Absence of human outcome data',
        'Trials have been registered and run; no published result establishes clinical benefit in people'],
      ['Dose derivation',
        'Commonly cited amounts scale a rodent dose to human body weight directly'],
      ['Bioavailability and fat dependence',
        'The flavonoid absorption literature']
    ],
    cta: `A pulse taken three times a year is the schedule people lose track of first. TherapyLog
      dates each one.`
  },

  dasatinib: {
    slug: 'dasatinib',
    h1: 'Dasatinib: a leukaemia drug used three days at a time, and why that is not a small thing',
    title: 'Dasatinib: the senolytic use, in proportion | TherapyLog',
    description: 'An approved kinase inhibitor used intermittently as a senolytic. What the human trials measured, and what the drug does at any dose.',
    lede: `This is the senolytic with actual human trial data, and it is also a cancer drug with a
      real adverse-effect profile. Both facts belong in the same sentence, and most writing about it
      keeps them apart.`,
    sections: [
      {
        h2: 'What it is before it is a senolytic',
        paras: [
          `@@EV_ESTABLISHED@@ Dasatinib is a tyrosine kinase inhibitor approved for chronic myeloid
          leukaemia and Philadelphia-chromosome-positive acute lymphoblastic leukaemia. It inhibits
          BCR-ABL and a broad range of other kinases including the SRC family, and that breadth is
          both why it works in leukaemia and why it has the side-effect profile it does. Pleural
          effusion, myelosuppression, bleeding risk and QT prolongation are all recognised effects at
          treatment doses.`,
          `@@EV_OFFLABEL@@ Its senolytic identity came out of a screen: senescent cells resist
          apoptosis by upregulating specific survival pathways, and dasatinib was one of the
          compounds found to disable them. The proposed use is nothing like the leukaemia use
          &mdash; two or three days every few months rather than continuously &mdash; and the
          argument is that a brief exposure is enough to kill cells whose defences it disables while
          being too short for the cumulative toxicity that daily treatment produces.`,
          `That argument is plausible and it is not the same as demonstrated. Total exposure is
          genuinely far lower. Whether it is low enough to avoid the effects that matter is
          something the trials were not powered to establish.`
        ]
      },
      {
        h2: 'What the human trials actually measured',
        paras: [
          `@@EV_ESTABLISHED@@ Dasatinib combined with quercetin is the most studied senolytic
          protocol in people, and the trials are small, open-label and endpoint-modest. In diabetic
          kidney disease, a short course reduced senescent cell burden in adipose tissue and skin
          &mdash; measured directly, which is the strongest thing anyone has shown for a senolytic
          in humans. In idiopathic pulmonary fibrosis, an open-label pilot reported improvement in
          some physical function measures.`,
          `What has not been shown is a change in a hard clinical outcome, in any trial, in any
          indication. Reduced senescent cell burden is a mechanistic confirmation, not a benefit.
          The distance between "the drug does the thing it was supposed to do" and "people are better
          off" is exactly where this field currently sits, and it is the honest summary.`,
          `The <a href="/compounds/fisetin/">fisetin page</a> covers the supplement alternative,
          which has mouse data and no human outcome trial. Neither is established. This one at least
          has been measured in people.`
        ]
      },
      {
        h2: 'Why this one is not a self-directed decision',
        paras: [
          `Dasatinib requires a prescription and the app&rsquo;s own entry says physician oversight
          is absolutely required, which is unusually emphatic for this reference and is correct.
          Three specifics make it so. It has a broad and clinically significant interaction profile
          through CYP3A4, so the full medication list matters. It suppresses blood counts, which is
          why the app puts a full blood count before and two weeks after each pulse on the
          monitoring list. And bleeding risk means anticoagulants and antiplatelet drugs are a
          genuine concern rather than a theoretical one.`,
          `@@EV_OFFLABEL@@ Nobody has established what the cumulative risk of a pulse protocol
          repeated over years looks like, because nobody has run it for years. That is not a reason
          to assume harm; it is a reason to describe this as an experimental protocol being taken
          outside a trial, which is what it is.`,
          `The trial protocols this is copied from ran under monitoring, with stopping rules and
          scheduled bloodwork. Reproducing the dose without reproducing the monitoring is taking the
          risk without the safeguards, and that is the specific thing to avoid here. Anything on the
          drawbacks list below is a conversation with a prescriber, not a page.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first item is not boilerplate on this compound —
      it is the one that separates it from everything else in the senolytic category.`,
    faq: [
      ['Is it safe at senolytic doses?', [
        `Total exposure is far lower than in leukaemia treatment, and the short trials reported it as
         tolerated. What nobody has established is the cumulative risk of repeating a pulse protocol over
         years, because that has not been run.`]],
      ['What did the trials actually show?', [
        `Directly measured reduction in senescent cell burden in tissue, which is the strongest
         mechanistic confirmation any senolytic has in people, and some physical-function signals in a
         small open-label pilot. No hard clinical outcome in any trial.`]],
      ['Why is it paired with quercetin?', [
        `Because the two disable different survival pathways, and senescent cells in different tissues
         depend on different ones. The pairing is what the trial protocols used, and it is why the
         combination rather than either alone is what has human data.`]],
      ['What monitoring does a pulse need?', [
        `A full blood count before and about two weeks after, because it suppresses counts, plus liver
         enzymes and a review of every other medication for CYP3A4 interactions. That is the app’s own
         panel and it is not optional.`]]
    ],
    basis: [
      ['Approved indication and kinase inhibition profile',
        'The dasatinib approved labelling and its published pharmacology'],
      ['Senescent cell burden reduction in humans',
        'Open-label trials of the dasatinib and quercetin combination in diabetic kidney disease and idiopathic pulmonary fibrosis, reported from 2019'],
      ['Absence of hard clinical outcomes',
        'No senolytic trial in any indication has reported a change in a hard clinical endpoint'],
      ['Interaction and myelosuppression profile',
        'Carried in the approved labelling for the oncology indication']
    ],
    cta: `A pulse protocol with bloodwork before and after only works if the dates line up.
      TherapyLog keeps them.`
  },

  telmisartan: {
    slug: 'telmisartan',
    h1: 'Telmisartan: an ARB with a second mechanism, and a reason it comes up on TRT',
    title: 'Telmisartan: the ARB with PPAR activity | TherapyLog',
    description: 'An approved blood pressure drug that also partially activates PPAR-gamma. Why it is chosen over other ARBs, and what to monitor.',
    lede: `Angiotensin receptor blockers are interchangeable for blood pressure. This one is picked
      for something else it does, and it comes up in hormone therapy because testosterone raises two
      things it addresses.`,
    sections: [
      {
        h2: 'Two mechanisms in one molecule',
        paras: [
          `@@EV_ESTABLISHED@@ Telmisartan blocks the angiotensin II type 1 receptor, which is what
          every ARB does and what the approval is for. What distinguishes it is partial agonism at
          PPAR-gamma &mdash; the nuclear receptor the thiazolidinedione diabetes drugs target
          &mdash; at concentrations reached with ordinary dosing. Most ARBs do not do this, or do it
          too weakly to matter.`,
          `@@EV_OFFLABEL@@ That second activity is the basis for the metabolic interest: improved
          insulin sensitivity, effects on adipose tissue distribution, and anti-inflammatory
          signalling, all reported in trials and mechanistic work. The effect size is modest
          compared with a dedicated PPAR-gamma agonist, and it is a genuine pharmacological
          difference rather than marketing. It also has the longest half-life of the ARBs, which
          gives it the most consistent twenty-four-hour blood pressure coverage in the class.`
        ]
      },
      {
        h2: 'Why it turns up in hormone therapy',
        paras: [
          `Testosterone therapy can raise blood pressure and reliably raises haematocrit, and both
          push in the same cardiovascular direction. @@EV_OFFLABEL@@ The app records an interaction
          note pairing telmisartan with testosterone therapy for that reason, and it is one of the
          few genuinely constructive interactions in the reference &mdash; one drug addressing an
          effect of another rather than conflicting with it.`,
          `Two caveats keep that honest. Treating a blood pressure that testosterone raised is
          managing a consequence, and whether the underlying protocol should be adjusted instead is a
          question worth asking first. And nothing about an ARB addresses haematocrit directly; the
          <a href="/markers/hematocrit-on-trt/">haematocrit page</a> covers what the guideline
          thresholds are and why routine donation trades one problem for another.`,
          `Blood pressure itself is the marker that most people on testosterone therapy do not
          measure and should. It is the cheapest, most actionable number in the whole panel and it
          requires no phlebotomy.`
        ]
      },
      {
        h2: 'What to watch',
        paras: [
          `@@EV_ESTABLISHED@@ Potassium and renal function are the two that matter, and they belong
          together: blocking the renin-angiotensin system reduces aldosterone, which raises serum
          potassium, and it reduces intraglomerular pressure, which can cause a small early rise in
          creatinine that is expected rather than alarming. A larger rise is not. Both are on the
          app&rsquo;s panel and both are checked after starting or after a dose increase rather than
          only annually.`,
          `Hypotension on starting is the common practical problem, which is why the app&rsquo;s
          rows begin at the lower amount. The combination with a potassium-sparing diuretic, a
          potassium supplement, or an NSAID raises the potassium risk materially, and lithium levels
          rise on an ARB &mdash; both are on the app&rsquo;s interaction data.`,
          `The absolute contraindication is pregnancy: drugs acting on the renin-angiotensin system
          cause fetal injury, and this is not a relative caution. Everything else here is a
          prescribing decision made against a measured blood pressure, and anything on the drawbacks
          list below belongs with the clinician who prescribed it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The potassium item and the pregnancy item are the two
      that are not negotiable rather than dose-dependent.`,
    faq: [
      ['Why telmisartan rather than another ARB?', [
        `For blood pressure alone there is little to choose between them. Telmisartan is picked for its
         partial PPAR-gamma activity and its long half-life. Whether that difference is worth anything
         for a given person is a prescribing judgement.`]],
      ['Does it lower haematocrit?', [
        `No. It addresses blood pressure, not red cell mass. Those are two separate effects of
         testosterone therapy and only one of them is an ARB’s job.`]],
      ['My creatinine rose after starting — is that bad?', [
        `A small early rise is expected from reduced intraglomerular pressure and is not kidney damage.
         A large one is a different matter. That is exactly why renal function is checked after starting
         rather than at the next annual, and it is a clinician’s call to interpret.`]],
      ['Can it be combined with testosterone therapy?', [
        `The app records a note describing exactly that pairing, and the rationale is that testosterone
         raises blood pressure. Whether to treat that or adjust the protocol is the question worth asking
         first, and it is a prescriber’s.`]]
    ],
    basis: [
      ['Partial PPAR-gamma agonism',
        'Established in the telmisartan pharmacology literature and not shared by most ARBs'],
      ['Approved indication',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Potassium and creatinine effects of renin-angiotensin blockade',
        'A class effect established in the ARB and ACE-inhibitor literature'],
      ['Fetal toxicity',
        'A boxed contraindication across the drug class']
    ],
    cta: `Blood pressure is the number on a TRT panel that needs no phlebotomy and gets recorded
      least. TherapyLog takes it alongside the labs.`
  },

  hexarelin: {
    slug: 'hexarelin',
    h1: 'Hexarelin: the strongest pulse in the family, and the fastest to stop working',
    title: 'Hexarelin: potency and desensitisation | TherapyLog',
    description: 'The most potent GHRP, with the fastest tolerance and a separate cardiac receptor story. Why it is not a daily compound.',
    lede: `The end of the potency scale that starts with ipamorelin. It produces the largest acute
      growth hormone pulse of the family and loses that ability faster than any of them, which makes
      it the one compound in this class where the schedule is the whole design.`,
    sections: [
      {
        h2: 'Potency and tolerance are the same property',
        paras: [
          `@@EV_ESTABLISHED@@ Hexarelin is a hexapeptide agonist at the ghrelin receptor, and across
          the growth hormone releasing peptides it produces the largest single GH pulse. It is also
          the least selective: cortisol and prolactin rise more than with
          <a href="/compounds/ghrp-2/">GHRP-2</a> and considerably more than with
          <a href="/compounds/ipamorelin/">ipamorelin</a>.`,
          `Desensitisation is the defining practical limit. Strong, sustained agonism at a receptor
          reliably reduces its response, and hexarelin does this faster than any other compound in
          the family &mdash; measurably, within weeks of continuous use. That is why the
          app&rsquo;s own dosing rows specify two to three times weekly rather than daily, with
          explicit breaks. Unlike most on-and-off schedules in this reference, this one has a
          pharmacological reason behind it rather than a convention.`,
          `The consequence for anyone comparing the class: hexarelin&rsquo;s advantage is acute
          rather than sustained. If what you want is the biggest possible pulse from a single
          administration it wins; if what you want is a raised IGF-1 held over months, the more
          selective compounds get there and stay there.`
        ]
      },
      {
        h2: 'The cardiac receptor is a genuinely separate story',
        paras: [
          `@@EV_THEORETICAL@@ Hexarelin binds CD36 in cardiac tissue, a receptor unrelated to the
          growth hormone axis, and the cardioprotective effects reported in animal work &mdash;
          improved left ventricular function, protection against ischaemia-reperfusion injury
          &mdash; appear to run through that binding rather than through growth hormone at all. GH
          receptor knockout models still show the cardiac effect, which is the evidence that
          separates the two.`,
          `That is one of the more interesting findings attached to any research peptide, and it has
          not been translated. There is no human trial of hexarelin for a cardiac indication, no
          approved use, and the app&rsquo;s own cardiac dosing row is a research protocol rather
          than a therapy. Anyone with a cardiac condition reading that as a treatment option is
          reading it wrong, and it belongs with a cardiologist rather than as a self-directed
          decision.`
        ]
      },
      {
        h2: 'What to measure',
        paras: [
          `IGF-1 is the marker that tells you whether the axis moved, as across this whole class, and
          on this compound it doubles as the desensitisation check: a falling IGF-1 on an unchanged
          protocol is what tolerance looks like, and it does not announce itself as a symptom. The
          <a href="/markers/igf-1/">IGF-1 page</a> covers the age-dependent reference interval.`,
          `Prolactin and cortisol are on this compound&rsquo;s panel for a reason that does not apply
          to the selective ones &mdash; the <a href="/markers/prolactin/">prolactin page</a> covers
          how easily that particular hormone is elevated by the draw itself, which matters when
          looking for a drug effect. Water retention is reported more here than elsewhere in the
          class, consistent with the size of the GH response.`,
          `@@EV_THEORETICAL@@ There is no approved product and no controlled trial for the uses this
          is put to. Identity and purity rest with whoever made the vial, and this site names no
          vendor. Anything experienced while using it belongs with a clinician who has the full
          picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it reads as a coherent description of one property
      seen from six angles: this compound is the potent, unselective, fast-tolerating end of a
      family.`,
    faq: [
      ['Why not use it daily?', [
        `Because it desensitises faster than anything else in the class — within weeks of continuous
         use. The intermittent schedule in the app’s rows exists for that pharmacological reason rather
         than as a general cycling convention.`]],
      ['Is the cardiac effect real?', [
        `In animal models, and it appears to run through CD36 rather than growth hormone — knockout
         models still show it. No human trial has tested it for a cardiac indication, and there is no
         approved use.`]],
      ['How does it compare to ipamorelin?', [
        `Larger acute pulse, much less selectivity — more cortisol and prolactin — and far faster
         tolerance. Ipamorelin was developed specifically to avoid the second and third of those.`]],
      ['How would I know it stopped working?', [
        `IGF-1 falling on an unchanged protocol. Tolerance does not produce a symptom, which is the
         argument for measuring rather than judging by feel.`]]
    ],
    basis: [
      ['Potency and selectivity across the GHRP family',
        'The growth hormone secretagogue characterisation literature of the 1990s'],
      ['CD36 binding and GH-independent cardiac effects',
        'Animal work including growth hormone receptor knockout models'],
      ['Desensitisation kinetics',
        'Reported across the GHRP literature as fastest for this compound'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `Tolerance shows up as a number falling, not as a feeling. TherapyLog charts IGF-1 against
      the schedule that produced it.`
  },

  ghrp6: {
    slug: 'ghrp-6',
    h1: 'GHRP-6: the first one, and the one that makes you hungry',
    title: 'GHRP-6: appetite as the defining effect | TherapyLog',
    description: 'The original growth hormone releasing peptide, notable for strong ghrelin-driven hunger. Why that is mechanism rather than side effect.',
    lede: `The compound the rest of the family was developed to improve on. It releases growth
      hormone well and it makes people extremely hungry, and the second of those is not a flaw in
      the design &mdash; it is what a ghrelin mimetic does when nothing has been trimmed off it.`,
    sections: [
      {
        h2: 'Hunger is the point of comparison',
        paras: [
          `@@EV_ESTABLISHED@@ Ghrelin is the stomach hormone that signals hunger and also stimulates
          growth hormone release; the two functions travel together in the natural molecule. GHRP-6
          was among the first synthetic agonists at that receptor and it reproduces both effects
          substantially. Everything that came after &mdash; GHRP-2, hexarelin, ipamorelin &mdash;
          was an attempt to keep the growth hormone release while shedding something: appetite,
          cortisol, prolactin, or all three.`,
          `So the appetite stimulation is the baseline the family is measured against rather than an
          unfortunate extra. It is strong enough to be the deciding factor for most people: useful
          if the goal involves eating more, actively counterproductive during a caloric deficit,
          which is the goal most people in this space actually have.`,
          `@@EV_OFFLABEL@@ Cortisol and prolactin rise more with GHRP-6 than with any of the others
          except hexarelin, and desensitisation is faster than with the selective compounds. Those
          are the other two things later molecules were built to reduce. The
          <a href="/compounds/ipamorelin/">ipamorelin page</a> covers what the end of that
          development looked like.`
        ]
      },
      {
        h2: 'The clinical history, and where it stops',
        paras: [
          `@@EV_ESTABLISHED@@ GHRP-6 has a real research base. It was studied through the 1980s and
          1990s as a growth hormone secretagogue, used in provocative testing of pituitary reserve,
          and characterised properly &mdash; which is more than most peptides in this reference can
          claim. There is also work in cardiac and tissue-protective contexts from the ghrelin
          receptor&rsquo;s wider biology.`,
          `What never happened is an approval for anything. The compound was superseded by
          orally-active secretagogues in pharmaceutical development and by more selective peptides in
          practice, and it survives now mostly in the research-peptide market. Its characterisation
          is good; its clinical development is finished and negative by omission rather than by
          result.`
        ]
      },
      {
        h2: 'What to measure, and what nobody established',
        paras: [
          `IGF-1 is the marker for whether the axis responded, as everywhere in this class &mdash;
          a random serum growth hormone mostly reports where in a pulse the draw landed. The
          <a href="/markers/igf-1/">IGF-1 page</a> covers the age-dependent range. Prolactin,
          cortisol and fasting glucose are on this compound&rsquo;s panel specifically, and body
          weight is on it for the obvious reason.`,
          `Fasted administration and a pre-sleep dose follow from the same physiology as the rest of
          the class: insulin blunts growth hormone release and the largest natural pulse is
          nocturnal. That constraint is harder to keep here than with the other compounds, because
          the drug itself is arguing against it.`,
          `@@EV_THEORETICAL@@ What amplifying GH pulses does for a person with a normal axis remains
          unestablished across this entire family. IGF-1 is a marker of exposure rather than of
          benefit. There is no approved product, identity and purity rest with whoever made the
          vial, and this site names no vendor. Anything experienced while using it &mdash; a rising
          fasting glucose in particular &mdash; belongs with a clinician.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and every item is a comparison against a later
      compound in the same family. That is a fair description of where this one sits.`,
    faq: [
      ['How strong is the hunger?', [
        `Strong enough that it is the usual reason people stop, and strong enough that it is described
         as a use rather than a side effect where increasing intake is the goal. It is mechanism: this
         is a ghrelin mimetic with nothing trimmed off it.`]],
      ['Is it obsolete?', [
        `In development terms, yes — it was superseded by more selective peptides and by orally active
         secretagogues. It remains well characterised, which is why it still appears in the reference.`]],
      ['Does it raise cortisol?', [
        `More than any of the family except hexarelin. That is why cortisol and prolactin sit on this
         compound’s monitoring panel and not on ipamorelin’s.`]],
      ['Can the hunger be avoided by timing?', [
        `Taking it before sleep shifts when it lands rather than removing it, and the fasted requirement
         works against eating anyway. If a caloric deficit is the goal, a more selective compound in the
         family is the straightforward answer.`]]
    ],
    basis: [
      ['Ghrelin receptor agonism and dual GH-appetite signalling',
        'Standard endocrinology references on the GH secretagogue receptor'],
      ['Comparative selectivity across the family',
        'The secretagogue characterisation literature of the 1980s and 1990s'],
      ['Use in provocative pituitary testing',
        'Clinical studies of GHRP-6 as a test of GH reserve'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A compound whose main effect is on appetite is one where the food log matters as much as
      the dose. TherapyLog keeps both.`
  },

  selank: {
    slug: 'selank',
    h1: 'Selank: an anxiolytic peptide that is not a benzodiazepine, on evidence from one country',
    title: 'Selank: anxiolysis without sedation | TherapyLog',
    description: 'A tuftsin analogue approved in Russia for anxiety. What the GABA and BDNF claims rest on, and what has never been replicated.',
    lede: `An anxiolytic with a mechanism that is not the usual one, a clinical history in a country
      whose research rarely gets replicated elsewhere, and the same evidence gap that applies to
      everything in that category.`,
    sections: [
      {
        h2: 'Derived from an immune peptide, acting on anxiety',
        paras: [
          `@@EV_ESTABLISHED@@ Tuftsin is a naturally occurring tetrapeptide fragment of an
          immunoglobulin, with immune-modulating activity. Selank is a synthetic heptapeptide
          analogue of it, stabilised with a proline-glycine-proline tail &mdash; the same
          stabilising trick used on <a href="/compounds/semax/">semax</a>, from the same research
          programme.`,
          `@@EV_THEORETICAL@@ Its reported mechanism is not the benzodiazepine one. Rather than
          binding the GABA-A receptor directly, it is described as modulating GABA-A subunit
          expression and affecting serotonin and dopamine turnover, alongside raising brain-derived
          neurotrophic factor. The claimed consequence is the profile that makes it interesting:
          anxiolysis without sedation, without cognitive dulling, and without the tolerance and
          dependence that define the benzodiazepines.`,
          `That is an appealing profile and it is exactly the kind of claim that needs independent
          confirmation, because "works like a benzodiazepine without any of the drawbacks" is what
          every anxiolytic in development has claimed. The app records no half-life for it &mdash;
          none has been published &mdash; which is why the fact box above has no pharmacokinetic
          rows.`
        ]
      },
      {
        h2: 'Approved there, unstudied here',
        paras: [
          `@@EV_OFFLABEL@@ Selank is an approved medicine in Russia for anxiety and asthenic
          conditions, with clinical use behind it. That is more than most compounds in this reference
          have. What does not exist is a published randomised controlled trial from investigators
          outside the research tradition that produced it, which is the same limitation that applies
          to semax, epithalon and the Khavinson peptides.`,
          `The criticism is not that the work is wrong. It is that a finding concentrated in one
          research lineage is weaker evidence than the same finding from several, and independent
          replication is what is missing rather than what has failed. A reader outside Russia cannot
          obtain the approved product in any case, so what is available is research-supply material
          with identity and purity resting on whoever made it. This site names no vendor or testing
          service.`
        ]
      },
      {
        h2: 'What people report, and the caution that matters',
        paras: [
          `Reported effects are subtle rather than dramatic: reduced anxiety without a sedative
          feel, and some report better verbal fluency and mood. Nasal irritation is the common local
          effect of the intranasal route. The app records no bloodwork, honestly &mdash; nothing on
          a routine panel reflects this, so assessment is entirely subjective, which makes it easy
          to attribute a good fortnight to the peptide.`,
          `@@EV_THEORETICAL@@ The caution worth stating is about what anxiety is. It is a
          diagnosable condition with treatments that work, and treating it with an unstudied peptide
          instead of seeking care is the specific harm available here &mdash; more so than with most
          compounds in this reference, because the symptom itself discourages people from going.
          Anyone using this alongside psychiatric medication, or instead of seeking help for anxiety
          that is affecting their life, should be having that conversation with a clinician.`,
          `The <a href="/compounds/semax/">semax page</a> covers the other peptide from the same
          programme, which is described as stimulating where this one is described as calming. Both
          carry the same replication gap and the same sourcing problem.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The limited-Western-data item and the source-quality
      item are the two that actually constrain what can be said here.`,
    faq: [
      ['Is it like a benzodiazepine?', [
        `Not mechanistically. It is described as modulating GABA-A subunit expression rather than binding
         the receptor directly, and the claimed absence of sedation, tolerance and dependence is the
         reason it is interesting. That claim has not been independently tested.`]],
      ['Why is there no half-life in the fact box?', [
        `Because none has been published, so the app holds none. Duration figures quoted elsewhere for
         this peptide are not coming from a characterisation study.`]],
      ['Intranasal or injected?', [
        `The approved clinical use is intranasal and the app records both routes. Whether intranasal
         delivery produces a meaningful central concentration is the least well answered question about
         this whole family.`]],
      ['Can it replace treatment for anxiety?', [
        `No, and that is the one thing on this page worth being direct about. Anxiety has treatments with
         evidence behind them, and substituting an unstudied peptide is the specific risk here.`]]
    ],
    basis: [
      ['Tuftsin analogue structure',
        'The peptide’s published design; a stabilised heptapeptide analogue of an immunoglobulin fragment'],
      ['GABA-A subunit and monoamine effects',
        'Animal and cell work from the Russian research programme; not independently replicated in the West'],
      ['Approval and clinical use',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `A subjective effect with no lab behind it needs a dated record to mean anything.
      TherapyLog keeps the dose and your own note together.`
  },

  cerebrolysin: {
    slug: 'cerebrolysin',
    h1: 'Cerebrolysin: a porcine brain extract with more trial data than most approved drugs',
    title: 'Cerebrolysin: a large, contested evidence base | TherapyLog',
    description: 'A peptide mixture approved in dozens of countries for stroke and dementia, with a large trial base and unfavourable independent reviews.',
    lede: `Unusual in this reference for having too much evidence rather than too little &mdash; and
      for that evidence pointing in two directions depending on who assembled it. Both halves of
      that need saying.`,
    sections: [
      {
        h2: 'What it actually is',
        paras: [
          `@@EV_ESTABLISHED@@ Cerebrolysin is not a single molecule. It is a standardised enzymatic
          hydrolysate of porcine brain tissue: a mixture of low-molecular-weight peptides and free
          amino acids, produced to a manufacturing specification rather than synthesised to a
          formula. That makes it closer to a biological product than to the peptides elsewhere on
          this site, and it is the reason there is no half-life in the fact box &mdash; the app
          holds none, and a mixture does not have one.`,
          `@@EV_THEORETICAL@@ The proposed mechanism is neurotrophic: the fragments are said to
          mimic the action of endogenous neurotrophic factors, promoting neuronal survival,
          synaptogenesis and plasticity after injury. That account is supported by animal and cell
          work. Whether a peptide mixture given intravenously reaches the brain in a form that does
          any of that in a human is the question the mechanism does not answer by itself.`,
          `It requires intramuscular or intravenous administration &mdash; there is no oral or
          intranasal route with systemic effect &mdash; and the courses described are daily for ten
          to twenty days, repeated. That is a clinical undertaking rather than a supplement
          schedule.`
        ]
      },
      {
        h2: 'A large evidence base, and what independent review made of it',
        paras: [
          `@@EV_OFFLABEL@@ It is an approved medicine in dozens of countries and has been studied in
          well over a hundred clinical trials for acute ischaemic stroke, traumatic brain injury,
          vascular dementia and Alzheimer&rsquo;s disease. By volume, that is more clinical
          investigation than almost anything else in this reference.`,
          `Independent systematic reviews have been considerably less positive than that volume
          suggests. Cochrane reviews of cerebrolysin in acute ischaemic stroke have not found
          evidence of benefit on death or dependence, and have raised concerns about the
          concentration of trials among investigators connected to the manufacturer and about
          reporting quality. Reviews in dementia have been similarly cautious. That is not the same
          as saying it does not work; it is saying that a large body of trials has not convinced
          reviewers who were not part of producing it.`,
          `The honest summary for a reader is that the evidence is voluminous, geographically and
          commercially concentrated, and unpersuasive to independent assessment. Anyone quoting the
          number of studies without quoting the reviews is telling half of it.`
        ]
      },
      {
        h2: 'What that means for cognitive use in a healthy person',
        paras: [
          `Every indication it is approved for involves a damaged brain &mdash; stroke, injury,
          dementia. @@EV_THEORETICAL@@ Use for cognitive enhancement in a healthy adult is
          off-label everywhere it is approved and unstudied everywhere else. A neurotrophic agent
          plausibly has more to do where there is damage to repair, which is the same logic that
          applies to thymosin alpha-1 and immunity.`,
          `The practical obstacles are real. It is not available in the United States, so it is
          imported or compounded; it is porcine-derived, which matters for some people on dietary or
          religious grounds; and being a protein-derived mixture given by injection, allergic
          reaction is a genuine possibility rather than a boilerplate warning &mdash; which is why
          a test dose appears in the app&rsquo;s own drawbacks list. This site names no vendor.`,
          `Anyone considering this for a diagnosed neurological condition should be having the
          conversation with the neurologist managing it, in a country where it is licensed if that
          is possible. Anything on the drawbacks list below belongs in the same conversation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the allergy item deserves more weight than its
      position suggests: this is an injected biological mixture, not a synthetic peptide.`,
    faq: [
      ['If there are 130 studies, why is it not approved in the US?', [
        `Because volume is not the same as persuasiveness. Independent systematic reviews, including
         Cochrane, have not found convincing evidence of benefit in stroke and have raised concerns about
         where the trials came from and how they were reported.`]],
      ['Does it work for cognitive enhancement?', [
        `That has not been studied. Every approved indication involves a damaged brain, and a neurotrophic
         agent plausibly has less to do where there is nothing to repair.`]],
      ['Why is there no half-life in the fact box?', [
        `Because it is a mixture of many peptides rather than one molecule, and the app holds no entry. A
         hydrolysate does not have a single half-life.`]],
      ['Is a test dose really necessary?', [
        `It is a porcine-derived protein mixture given by injection, so allergic reaction is a real
         possibility rather than a formality. That is what the app’s own drawbacks list is pointing at.`]]
    ],
    basis: [
      ['Composition as a standardised porcine brain hydrolysate',
        'The product’s published manufacturing description'],
      ['Approvals and trial volume',
        'The approval string in the fact box is app.html’s own field; over a hundred clinical trials have been conducted'],
      ['Independent systematic review findings',
        'Cochrane reviews of cerebrolysin in acute ischaemic stroke and in dementia, which did not find evidence of benefit and raised reporting concerns'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry, which is why no such rows appear above']
    ],
    cta: `A ten to twenty day course repeated a few times a year is a schedule worth writing down.
      TherapyLog keeps the dates.`
  },

  dsip: {
    slug: 'dsip',
    h1: 'DSIP: named for an effect that has been hard to reproduce',
    title: 'DSIP: the sleep peptide, and its evidence | TherapyLog',
    description: 'Delta sleep-inducing peptide was named in 1974 for an effect later studies struggled to replicate. What is actually known about it.',
    lede: `A peptide whose name is a claim, made in 1974, that the subsequent fifty years have not
      settled. That is unusual and worth knowing before reading anything else about it.`,
    sections: [
      {
        h2: 'Where the name came from',
        paras: [
          `@@EV_THEORETICAL@@ DSIP was isolated from the blood of rabbits in induced slow-wave sleep
          and named for what it appeared to do when transferred: increase delta sleep in recipients.
          That original finding is real and is where the name comes from. What happened afterwards is
          the interesting part &mdash; replication was inconsistent, the sleep effect proved
          difficult to demonstrate reliably in later work, and the peptide&rsquo;s endogenous role
          has never been clearly established.`,
          `Later research has been more interested in it as a stress-response modulator than as a
          hypnotic: effects on ACTH and cortisol, on stress-induced physiological changes, and some
          antioxidant activity. Those are the mechanisms most often cited now, and they are a
          different account from the one the name implies.`,
          `The app models a very short half-life and flags it as an estimate, which is consistent
          with a small peptide and means limited or absent human pharmacokinetic data. Anything
          calculated from it inherits that.`
        ]
      },
      {
        h2: 'What the sleep claim rests on',
        paras: [
          `@@EV_THEORETICAL@@ Human work exists and is small, old and mixed. Some studies in people
          with disturbed sleep reported improvements in sleep onset and subjective quality; others
          found little. There is no modern randomised trial with polysomnography as the endpoint,
          which is what would actually settle whether it increases slow-wave sleep in people.`,
          `The reason that matters more than usual: sleep is one of the most placebo-responsive
          things anyone measures, and self-reported sleep quality is unusually easy to shift with
          expectation and with the ritual of taking something at bedtime. A compound whose only
          available assessment is subjective, taken for an outcome that responds strongly to
          expectation, is close to the worst case for judging by feel. A consumer sleep tracker is
          not polysomnography, but it is at least an external measurement, and it is what the
          app&rsquo;s own monitoring note suggests.`,
          `@@EV_OFFLABEL@@ The use that has more internal logic is the one the app&rsquo;s entry
          mentions in passing: growth hormone secretagogues taken too late disrupt sleep
          architecture, and DSIP is described in that context as a corrective. That is a
          hypothesis about an interaction rather than a finding, and the simpler answer to a
          secretagogue disrupting sleep is usually to move the secretagogue.`
        ]
      },
      {
        h2: 'Sourcing, tolerance and the alternative worth naming',
        paras: [
          `There is no approved product anywhere. Identity and purity rest with whoever made the
          vial, and this site names no vendor or testing service. The app&rsquo;s rows describe
          intermittent rather than nightly use, on the basis that tolerance develops &mdash;
          plausible for any sleep agent and not demonstrated for this one.`,
          `The comparison worth making is with things that have been studied properly. Sleep is one
          of the few areas in this reference where the boring interventions have strong evidence:
          cognitive behavioural therapy for insomnia outperforms hypnotics in trials and holds up
          after treatment stops. A person taking an unstudied peptide for chronic insomnia has
          usually not tried the thing that works.`,
          `Persistent sleep disruption is also a symptom rather than a diagnosis &mdash; sleep
          apnoea, depression, thyroid disease and a long list of medications all cause it, and all
          of them are worth excluding before treating the symptom. That conversation belongs with a
          clinician, and anything on the drawbacks list below belongs in it too.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first item is doing the most work: for a compound
      named after an effect, the absence of large-scale human data on that effect is the story.`,
    faq: [
      ['Does it actually increase deep sleep?', [
        `The original 1974 work said so and later replication has been inconsistent. There is no modern
         randomised trial with polysomnography as an endpoint, which is what would answer it.`]],
      ['Why is the assessment so unreliable?', [
        `Because self-reported sleep quality responds strongly to expectation, and a bedtime ritual is
         itself an intervention. A tracker is not polysomnography but it is at least external, which is
         why the app suggests one.`]],
      ['Should it be taken every night?', [
        `The app’s rows describe intermittent use on the basis that tolerance develops. That is plausible
         for any sleep agent and has not been demonstrated for this one specifically.`]],
      ['What has better evidence for insomnia?', [
        `Cognitive behavioural therapy for insomnia, which outperforms hypnotic drugs in trials and keeps
         working after treatment ends. It is also worth excluding sleep apnoea, thyroid disease,
         depression and medication effects before treating sleep as the problem.`]]
    ],
    basis: [
      ['Original isolation and naming',
        'Work published in 1974 isolating the peptide from blood during induced slow-wave sleep'],
      ['Inconsistent replication of the sleep effect',
        'Subsequent human and animal studies with mixed results; no modern polysomnographic trial'],
      ['Stress-axis and antioxidant activity',
        'The later DSIP literature, which shifted emphasis away from the hypnotic claim'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `Sleep is the outcome most distorted by expectation, so an external measure beats a memory.
      TherapyLog keeps the dose beside what you recorded.`
  },

  mots: {
    slug: 'mots-c',
    h1: 'MOTS-c: a peptide encoded in mitochondrial DNA, discovered in 2015',
    title: 'MOTS-c: a mitochondrial peptide, early | TherapyLog',
    description: 'A peptide encoded by mitochondrial rather than nuclear DNA, proposed to mimic exercise metabolically. What is known ten years in.',
    lede: `Genuinely novel biology &mdash; a peptide written into mitochondrial DNA rather than the
      nucleus, which was not thought to happen. The science is interesting. The human evidence is
      about as early as it gets.`,
    sections: [
      {
        h2: 'Why the discovery mattered',
        paras: [
          `@@EV_ESTABLISHED@@ Mitochondria carry their own small genome, and it was long assumed to
          encode only the handful of proteins needed for the electron transport chain. MOTS-c is one
          of a small family of mitochondrial-derived peptides &mdash; short sequences encoded within
          mitochondrial DNA that act as signalling molecules elsewhere in the cell and in
          circulation. That was a real addition to the picture of how mitochondria communicate with
          the rest of the body, and it is why the discovery attracted attention beyond the longevity
          field.`,
          `@@EV_THEORETICAL@@ Functionally, MOTS-c is reported to activate AMPK and to improve
          glucose uptake in skeletal muscle through a route that does not depend on insulin. That is
          the basis for the exercise-mimetic framing: AMPK activation is one of the things exercise
          does, and circulating MOTS-c rises with exercise and declines with age. Animal work reports
          improved metabolic measures and, in mice, extended healthspan.`,
          `The app records no half-life, because none has been published for the material in
          circulation, which is why the fact box above carries no pharmacokinetic rows.`
        ]
      },
      {
        h2: 'How early is early',
        paras: [
          `@@EV_THEORETICAL@@ The peptide was described in 2015. Human data consists of observational
          work &mdash; circulating levels correlating with metabolic status, age and exercise &mdash;
          and a small amount of early interventional work. There is no published randomised
          controlled trial reporting a clinical outcome from administering it.`,
          `That is a much thinner base than the enthusiasm around it suggests, and the app&rsquo;s
          own drawbacks list is right to lead with it. "Very early human research stage" is the
          accurate description, and a compound at that stage sold on animal healthspan data is the
          familiar pattern this site keeps flagging.`,
          `The observational finding is also worth reading carefully. Higher circulating MOTS-c in
          metabolically healthier, more active people is consistent with it being a marker of
          mitochondrial function rather than a cause of it. Administering the marker does not
          necessarily produce the state, and distinguishing those two is exactly what an
          interventional trial is for.`
        ]
      },
      {
        h2: 'What to measure, and the sourcing problem',
        paras: [
          `The app&rsquo;s panel is glucose-focused &mdash; fasting glucose, HbA1c, a metabolic panel
          &mdash; which follows the proposed mechanism sensibly. The
          <a href="/markers/hba1c-and-fasting-glucose/">HbA1c page</a> covers why those two markers
          can disagree. Exercise capacity assessed consistently is the other honest measure, and
          consistently is the operative word.`,
          `@@EV_THEORETICAL@@ There is no approved product and no reference standard. Identity and
          purity rest entirely with whoever made the vial, and for a sixteen-residue peptide sold
          into an enthusiastic market, that is not a small caveat. This site names no vendor and no
          testing service.`,
          `The reasonable position is that this is real and novel biology at a stage where nobody
          can say what administering it does to a person over months. Anyone using it should be
          treating their own record as the only data available, and anyone with a metabolic
          condition should be raising it with the clinician managing that.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first two items are the honest summary of
      everything else on this page.`,
    faq: [
      ['Does it really mimic exercise?', [
        `It activates one of the pathways exercise activates, in animal and cell work. Exercise does a
         great many other things at the same time, and no human trial has compared them. "Exercise
         mimetic" is a mechanism claim being used as an outcome claim.`]],
      ['Is there human trial data?', [
        `Observational work relating circulating levels to metabolic status, and early interventional
         work. No published randomised trial reporting a clinical outcome from administering it.`]],
      ['Why is there no half-life in the fact box?', [
        `Because none has been published for the material people are using, so the app holds none.`]],
      ['If levels decline with age, does replacing them help?', [
        `That is the hypothesis and it is not established. A level that tracks mitochondrial health may
         be a marker rather than a cause, and administering a marker does not necessarily produce the
         state it marks.`]]
    ],
    basis: [
      ['Mitochondrial-derived peptides as a class',
        'Described from 2015 onward; MOTS-c was among the first characterised'],
      ['AMPK activation and insulin-independent glucose uptake',
        'Cell and animal work from the discovery programme onward'],
      ['Human evidence stage',
        'Observational studies relating circulating levels to age, exercise and metabolic status; no randomised outcome trial'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `At this stage of evidence, your own dated record is the entire dataset. TherapyLog keeps
      it beside the metabolic panel.`
  },

  vip: {
    slug: 'vip',
    h1: 'VIP: a real neuropeptide, attached to a protocol that is not consensus medicine',
    title: 'VIP: the peptide and the CIRS protocol | TherapyLog',
    description: 'Vasoactive intestinal peptide is well characterised physiology. The protocol it is best known for in this space is a different question.',
    lede: `Two separate things share this page. VIP is a real, well-studied endogenous neuropeptide.
      The reason most people encounter it is a specific practitioner protocol for a diagnosis that
      mainstream medicine does not recognise, and those deserve to be separated.`,
    sections: [
      {
        h2: 'The physiology is not in doubt',
        paras: [
          `@@EV_ESTABLISHED@@ Vasoactive intestinal peptide is a 28-amino-acid neuropeptide found
          throughout the nervous system, the gut and the immune system. It is a potent vasodilator,
          a bronchodilator, a regulator of intestinal secretion, and one of the more powerful
          endogenous anti-inflammatory signals known &mdash; it shifts immune responses away from
          inflammatory patterns and promotes regulatory T-cell activity. It is also the principal
          neurotransmitter of the suprachiasmatic nucleus, which is the body clock.`,
          `That is textbook physiology rather than a claim, and it is why VIP has been of
          pharmaceutical interest for conditions including pulmonary arterial hypertension and
          sarcoidosis. Its problem as a drug is delivery: it is cleared in minutes, which is why the
          routes described are intranasal or inhaled rather than anything systemic and lasting. The
          app records no half-life for the preparations in use, which is why the fact box carries no
          pharmacokinetic rows.`
        ]
      },
      {
        h2: 'The protocol, described accurately',
        paras: [
          `@@EV_OFFLABEL@@ In this space VIP is known almost entirely through one framework: a
          practitioner-developed protocol for chronic inflammatory response syndrome, attributed to
          water-damaged buildings and biotoxin exposure, in which VIP is the final step after other
          interventions. The app&rsquo;s own dosing rows name it.`,
          `Being precise about its status matters. CIRS as defined by that protocol is not a
          diagnosis recognised by mainstream medical bodies, its proposed biomarker panel &mdash;
          TGF-beta1, C4a, MMP-9, MSH &mdash; is not validated for that purpose, and the protocol as
          a whole has not been through controlled trials. That is not an accusation that the people
          using it are unwell in no way; chronic fatigue, cognitive difficulty and multi-system
          symptoms are real, and patients arriving at this protocol have usually been failed
          elsewhere. It is a statement about what has been demonstrated.`,
          `The honest reading is that a genuinely anti-inflammatory endogenous peptide has been
          attached to an unvalidated diagnostic framework, and the strength of the first does not
          transfer to the second. Anyone considering it should know which part rests on textbook
          physiology and which part does not.`
        ]
      },
      {
        h2: 'Practical considerations',
        paras: [
          `There is no approved product. What is used is compounded, typically as an intranasal
          preparation, and identity, concentration and sterility rest with the compounder. This site
          names no pharmacy, clinic or testing service. It is also expensive relative to almost
          everything else in this reference.`,
          `@@EV_ESTABLISHED@@ The predictable effects follow from the pharmacology: flushing and
          hypotension, because it is a potent vasodilator. That is a real consideration for anyone
          already on blood-pressure medication or prone to orthostatic symptoms, and it is why the
          app puts blood pressure on the monitoring list.`,
          `The markers the protocol calls for are specialty tests with their own interpretive
          problems, and a result on an unvalidated panel is not a finding. Anyone with persistent
          multi-system symptoms deserves a diagnostic workup that excludes the things that are
          treatable and well characterised first, and that is the conversation to have with a
          clinician before this one.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the physician-guidance item is the one that
      matters most here — less because of the peptide than because of what it is being used to
      treat.`,
    faq: [
      ['Is CIRS a recognised diagnosis?', [
        `Not by mainstream medical bodies, and the biomarker panel associated with it is not validated
         for that use. The symptoms people bring to it are real; the framework interpreting them has not
         been through the process that would establish it.`]],
      ['Is VIP itself well studied?', [
        `As physiology, yes — it is textbook material with a substantial literature. As a therapy
         delivered intranasally for the indications it is used for here, no.`]],
      ['Why intranasal?', [
        `Because it is cleared in minutes, so a systemic route achieves little. Intranasal delivery is
         an attempt to reach the central nervous system directly, which is a reasonable strategy and not
         a demonstrated one.`]],
      ['What are the immediate effects to expect?', [
        `Flushing and a drop in blood pressure, both predictable from a potent vasodilator. That matters
         for anyone on antihypertensives or prone to orthostatic symptoms, and it is why blood pressure is
         on the monitoring list.`]]
    ],
    basis: [
      ['VIP physiology',
        'Standard references on neuropeptide and immune physiology; the anti-inflammatory and vasodilatory roles are well established'],
      ['Status of the CIRS framework',
        'Not recognised as a diagnosis by mainstream medical bodies; the associated biomarker panel is not validated for the purpose'],
      ['Absence of controlled trials for the protocol',
        'The protocol as a whole has not been evaluated in randomised trials'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for the preparations in use']
    ],
    cta: `A protocol with many steps and specialty labs is one where the sequence and the dates
      matter. TherapyLog keeps them straight.`
  },

  kissp: {
    slug: 'kisspeptin-10',
    h1: 'Kisspeptin-10: the switch above the axis, and why continuous dosing turns it off',
    title: 'Kisspeptin-10: pulsatility is the drug | TherapyLog',
    description: 'Kisspeptin sits upstream of GnRH and is the master switch of the reproductive axis. Given continuously it desensitises and suppresses.',
    lede: `One level above everything else that acts on the testosterone axis. It also has the most
      counterintuitive property in this reference: administered wrongly it does the exact opposite of
      what it is taken for.`,
    sections: [
      {
        h2: 'Upstream of the whole axis',
        paras: [
          `@@EV_ESTABLISHED@@ The hypothalamic-pituitary-gonadal axis is usually drawn starting at
          GnRH. Kisspeptin sits above it: kisspeptin neurons drive the GnRH pulse generator, and
          loss-of-function mutations in the kisspeptin receptor cause failure of puberty. That
          finding, in the mid-2000s, is what established it as the master regulator of reproduction
          rather than a modulator of it.`,
          `Kisspeptin-10 is the C-terminal decapeptide fragment that retains receptor activity.
          Administered to a person, it triggers GnRH release, which triggers luteinising hormone,
          which triggers testosterone &mdash; an intact chain that only works if every link below it
          works. The <a href="/markers/lh-fsh/">LH and FSH page</a> covers how the state of that
          chain is established before anything is given.`
        ]
      },
      {
        h2: 'The property that makes it easy to get exactly wrong',
        paras: [
          `@@EV_ESTABLISHED@@ The GnRH system responds to pulses and shuts down under continuous
          stimulation. This is not a subtlety &mdash; it is the basis of an entire drug class:
          continuous GnRH agonists are used clinically to suppress testosterone in prostate cancer,
          and they work by desensitising the very receptors they stimulate. The same logic runs one
          level up.`,
          `So kisspeptin given in properly spaced pulses raises testosterone, and kisspeptin given
          continuously or too frequently desensitises the axis and lowers it. The app&rsquo;s own
          drawbacks list says this in capitals, and it is right to. It is the only compound in this
          reference where getting the schedule wrong does not merely reduce the effect but reverses
          it.`,
          `That is also why the app puts an LH surge thirty to sixty minutes after an injection on
          the monitoring list. It is a direct test of whether the receptor is still responding, and
          it is the closest thing available to a real-time check that the protocol is doing what it
          is supposed to.`
        ]
      },
      {
        h2: 'What the research actually covers',
        paras: [
          `@@EV_OFFLABEL@@ Kisspeptin has been studied seriously in humans, mostly in reproductive
          endocrinology: as a trigger for oocyte maturation in fertility treatment, in
          investigations of hypothalamic amenorrhoea, and in studies of the axis itself. It is
          genuine clinical research, and none of it is a trial of sustained testosterone restoration
          in men. The app&rsquo;s regulatory string says exactly that.`,
          `The app models a very short half-life and flags it as an estimate, consistent with a small
          peptide cleared quickly. The practical difficulty follows: a compound that must be
          delivered in properly separated pulses, with a very short half-life, on a schedule nobody
          has established, is one where the margin for getting it wrong is narrow and the failure
          mode is suppression.`,
          `There is no approved product for this use. Identity and purity rest with whoever made the
          vial, and this site names no vendor. Anyone considering it for hypogonadism should know
          that <a href="/compounds/enclomiphene/">enclomiphene</a> and
          <a href="/compounds/hcg/">hCG</a> address the same axis with far more human data behind
          them, and that which if any is appropriate is a prescribing decision.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the last item is the one to read twice: continuous
      dosing suppresses the axis rather than stimulating it.`,
    faq: [
      ['Why does continuous dosing suppress testosterone?', [
        `Because the GnRH system responds to pulses and desensitises under constant stimulation. That is
         the same mechanism continuous GnRH agonists use clinically to suppress testosterone in prostate
         cancer. Kisspeptin sits one level above and behaves the same way.`]],
      ['How would I know it is working?', [
        `An LH surge thirty to sixty minutes after an injection, which is the app’s own monitoring
         suggestion and is a direct test that the receptor is still responding.`]],
      ['Has it been studied for raising testosterone?', [
        `Not as a sustained restoration therapy. The human research is reproductive endocrinology —
         fertility treatment, hypothalamic amenorrhoea, axis physiology — which is real research about a
         different question.`]],
      ['How does it compare to enclomiphene or hCG?', [
        `Both act on the same axis with substantially more human data: enclomiphene at the hypothalamic
         oestrogen receptor, hCG at the LH receptor on the testis. Kisspeptin acts above both and has the
         least evidence for this use.`]]
    ],
    basis: [
      ['Kisspeptin as the upstream regulator of GnRH',
        'Established by loss-of-function mutation findings in the mid-2000s and the subsequent literature'],
      ['Desensitisation under continuous stimulation',
        'The same pharmacology that underlies continuous GnRH agonist therapy for androgen suppression'],
      ['Human research context',
        'Reproductive endocrinology studies including oocyte maturation triggering; not sustained testosterone restoration'],
      ['Estimated half-life',
        'app.html’s TL_PK entry, flagged est: limited or absent human pharmacokinetic data']
    ],
    cta: `A compound where the interval between doses decides the direction of the effect is one to
      log precisely. TherapyLog records the time, not just the day.`
  },

  ara290: {
    slug: 'ara-290',
    h1: 'ARA-290: the tissue-protective half of erythropoietin, without the red cells',
    title: 'ARA-290 (cibinetide): EPO without the EPO | TherapyLog',
    description: 'A peptide from the helix B face of erythropoietin that activates the tissue repair receptor without raising haematocrit. What the trials found.',
    lede: `Erythropoietin does two unrelated jobs through two different receptors. This peptide was
      engineered to keep one of them and drop the other, which is an unusually clean piece of drug
      design &mdash; and it has the phase II data to discuss.`,
    sections: [
      {
        h2: 'Two receptors, one hormone',
        paras: [
          `@@EV_ESTABLISHED@@ Erythropoietin is known for stimulating red cell production, which it
          does through the classical homodimeric EPO receptor on erythroid precursors. It also has a
          tissue-protective role &mdash; anti-inflammatory, anti-apoptotic, promoting repair after
          injury &mdash; and that runs through a completely different receptor complex, a
          heterodimer of the EPO receptor and the beta-common receptor, often called the innate
          repair receptor.`,
          `ARA-290, also called cibinetide, is a short peptide corresponding to the helix B surface
          of erythropoietin: the face that engages the repair receptor and not the erythropoietic
          one. The design goal was therefore to get the tissue protection without raising
          haematocrit, and that separation has held in trials &mdash; which matters, because raising
          haematocrit is exactly what makes EPO unusable as a repair therapy and is a concern this
          site&rsquo;s readers already track. The
          <a href="/markers/hematocrit-on-trt/">haematocrit page</a> covers why.`,
          `The app records no half-life for the preparations in circulation, which is why the fact
          box carries no pharmacokinetic rows.`
        ]
      },
      {
        h2: 'What phase II reported',
        paras: [
          `@@EV_ESTABLISHED@@ ARA-290 has been through controlled human trials, principally in small
          fibre neuropathy associated with sarcoidosis and in diabetic neuropathy. The reported
          findings were reductions in neuropathic pain scores and, more interestingly, increases in
          corneal nerve fibre density measured by confocal microscopy &mdash; a structural rather
          than symptomatic endpoint, which is much harder to produce by expectation.`,
          `It holds orphan drug designation for sarcoidosis. Development has not produced an approval,
          and the trials are phase II: real, controlled, and not large enough or long enough to
          establish what a phase III would.`,
          `That is a considerably stronger position than most research peptides occupy, and it is
          worth being precise about what it supports. The evidence is for neuropathic pain and nerve
          fibre density in specific neuropathies. The app&rsquo;s own drawbacks list notes that body
          composition data is limited, which is a polite way of saying the general repair and
          anti-inflammatory uses it gets put to are extrapolation.`
        ]
      },
      {
        h2: 'The practical position',
        paras: [
          `@@EV_THEORETICAL@@ There is no approved product, so what is available is research-supply
          material with identity and purity resting on whoever made it, and it is expensive. This
          site names no vendor and no testing service.`,
          `Monitoring is unusual for this reference in being mostly clinical: pain scales recorded
          consistently, nerve conduction studies where available, inflammatory markers, and a full
          blood count &mdash; the last one specifically to confirm that haematocrit is not rising,
          which would suggest the material is not what it claims to be. That is the same
          mislabelling-detector logic the HGH fragment page describes, and it is one of the more
          useful checks available on an unapproved compound.`,
          `Neuropathic pain is a diagnosable problem with treatments that have evidence behind them,
          and it is also a symptom of conditions worth identifying &mdash; diabetes and B12
          deficiency among them. Anyone treating it with an unapproved peptide before that workup
          has happened is treating a symptom whose cause may be both findable and fixable. That is
          the conversation to have with a clinician first.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the fourth item is the honest one: the trials were
      about neuropathy, and everything else it is used for is extrapolation from them.`,
    faq: [
      ['Does it raise haematocrit like EPO?', [
        `No — that separation is the entire point of the molecule, and it held in the trials. A rising
         haematocrit on this compound would suggest the vial contains something else, which is why a full
         blood count is on the monitoring list.`]],
      ['What did the trials actually measure?', [
        `Neuropathic pain scores and corneal nerve fibre density in small fibre neuropathy. The second
         is a structural endpoint, which makes it more persuasive than a symptom score alone.`]],
      ['Is it approved for anything?', [
        `No. It holds orphan drug designation for sarcoidosis, which is a development incentive rather
         than an approval or an efficacy finding.`]],
      ['Does it help with recovery or body composition?', [
        `That has not been studied. The evidence is in neuropathy, and the app’s own drawbacks list says
         body composition data is limited. Applying a neuropathy result to a training context is
         extrapolation.`]]
    ],
    basis: [
      ['Innate repair receptor versus the classical EPO receptor',
        'The erythropoietin tissue-protection literature and the peptide’s published design rationale'],
      ['Phase II findings in small fibre neuropathy',
        'Controlled trials reporting reduced neuropathic pain and increased corneal nerve fibre density'],
      ['Orphan drug designation',
        'A development incentive for sarcoidosis; not an approval and not an efficacy finding'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry for this compound, which is why no such rows appear above']
    ],
    cta: `A pain score only means something as a series recorded the same way. TherapyLog keeps it
      beside the dose.`
  },

  amino1mq: {
    slug: '5-amino-1mq',
    h1: '5-Amino-1MQ: an enzyme inhibitor with a coherent mechanism and no human data',
    title: '5-Amino-1MQ: mechanism without evidence | TherapyLog',
    description: 'An NNMT inhibitor proposed to raise cellular NAD+ and drive fat loss. The preclinical case is real; the human case does not exist yet.',
    lede: `A small molecule with a specific, well-described target and a preclinical story that hangs
      together. What it does not have is a single published human trial, which is worth holding on
      to while reading anything that sells it.`,
    sections: [
      {
        h2: 'What NNMT does, and what blocking it is meant to achieve',
        paras: [
          `@@EV_ESTABLISHED@@ Nicotinamide N-methyltransferase takes nicotinamide &mdash; the
          salvage-pathway precursor cells use to regenerate NAD+ &mdash; and methylates it into a
          form destined for excretion. High NNMT activity therefore diverts nicotinamide away from
          NAD+ regeneration and consumes methyl groups doing it. NNMT is expressed strongly in
          adipose tissue and liver, and its expression rises in obesity.`,
          `@@EV_THEORETICAL@@ 5-Amino-1MQ is a small-molecule inhibitor of that enzyme. The proposed
          consequence is straightforward: block the diversion, intracellular NAD+ rises in the
          tissues where NNMT is most active, sirtuin signalling increases, and fat cells shift toward
          oxidation. Rodent work has reported reduced fat mass without reduced food intake, which is
          the finding that generated the interest.`,
          `The <a href="/compounds/nmn-and-nr/">NMN and NR page</a> covers the other approach to the
          same target: supplying more precursor rather than stopping its removal. The two are
          mechanistically distinct routes to the same intracellular quantity, and only one of them
          has human data showing the quantity actually moves.`
        ]
      },
      {
        h2: 'How thin the human evidence is',
        paras: [
          `@@EV_THEORETICAL@@ There is no published randomised controlled trial of 5-Amino-1MQ in
          people. No published pharmacokinetics in people either &mdash; the app records no half-life
          or time to peak, which is why the fact box has no pharmacokinetic rows, and the dosing row
          it does hold is convention rather than a finding. The app&rsquo;s own drawbacks list says
          research is primarily preclinical and dosing is not standardised, which is the accurate
          summary.`,
          `Two specific unknowns follow from the mechanism rather than from the absence of trials.
          NNMT inhibition affects methyl-group metabolism, which touches a great deal more than fat
          cells &mdash; DNA methylation among it &mdash; and nobody has characterised what sustained
          inhibition does to that in a person. And NNMT expression varies substantially between
          tissues and individuals, so the effect of inhibiting it is unlikely to be uniform.`,
          `None of that makes it dangerous. It makes it unstudied, which is a different and more
          accurate word, and it is the same position pentadeca arginate occupies on this site.`
        ]
      },
      {
        h2: 'What to do with it',
        paras: [
          `There is no approved product and it is sold as a compounded or research-supply oral
          preparation. Identity, purity and content rest entirely with whoever made it, and this
          site names no pharmacy, vendor or testing service.`,
          `The app&rsquo;s monitoring list is body composition, glucose, insulin and HbA1c, which is
          the sensible set for the proposed mechanism and is the only assessment available &mdash;
          nothing measures NNMT activity or intracellular NAD+ outside a research setting. The
          <a href="/markers/hba1c-and-fasting-glucose/">HbA1c page</a> covers why the two glucose
          markers can disagree.`,
          `The reasonable position is interest without confidence: a specific target, a coherent
          preclinical case, and a complete absence of the evidence that would tell you whether any of
          it happens in a person. Anyone using it should treat their own record as the entire
          dataset, and anyone with a metabolic condition should be raising it with the clinician
          managing it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it is refreshingly blunt: the first three items say
      preclinical, unstudied and unstandardised, which is the whole picture.`,
    faq: [
      ['Is there any human data?', [
        `No published randomised trial, and no published human pharmacokinetics. The evidence is
         preclinical, and the dosing in circulation is convention rather than a finding.`]],
      ['How is it different from taking NMN?', [
        `Opposite ends of the same pathway. NMN supplies more precursor; this blocks the enzyme that
         removes it. NMN has human data showing blood NAD+ rises; this has none showing anything happens
         in a person.`]],
      ['Why does methyl metabolism come up?', [
        `Because the enzyme it inhibits consumes methyl groups. Blocking it does not only affect fat
         cells — it changes the availability of methyl groups for other processes, DNA methylation
         included, and nobody has characterised that under sustained inhibition.`]],
      ['Why is there no half-life in the fact box?', [
        `Because none has been published, so the app holds none. Any duration figure quoted for it
         elsewhere is not from a characterisation study.`]]
    ],
    basis: [
      ['NNMT function in nicotinamide and methyl-group metabolism',
        'Established enzymology; expression is high in adipose tissue and rises in obesity'],
      ['Preclinical fat-mass findings',
        'Rodent studies reporting reduced fat mass without reduced food intake'],
      ['Absence of human trial and pharmacokinetic data',
        'No published randomised controlled trial or human pharmacokinetic study exists as of this review date'],
      ['Regulatory status',
        'The regulatory string in the fact box is app.html’s own field, reproduced verbatim']
    ],
    cta: `With no published dose and no published half-life, what you did and what followed is the
      only evidence there is. TherapyLog keeps it.`
  },

  gonadorelin: {
    slug: 'gonadorelin',
    h1: 'Gonadorelin: real GnRH, and why the interval between doses is the whole protocol',
    title: 'Gonadorelin: GnRH, and why pulses matter | TherapyLog',
    description: 'Synthetic GnRH used off-label as an hCG alternative. Given continuously it suppresses the axis rather than stimulating it.',
    lede: `The hormone one step above luteinising hormone, used off-label to keep the testis working
      during testosterone therapy. It has the same knife-edge property kisspeptin does: pulses
      stimulate, continuous exposure shuts the axis down.`,
    sections: [
      {
        h2: 'Where it acts, and how that differs from hCG',
        paras: [
          `@@EV_ESTABLISHED@@ Gonadotropin-releasing hormone is released by the hypothalamus in
          pulses roughly every ninety minutes and instructs the pituitary to secrete luteinising
          hormone and FSH. Gonadorelin is that decapeptide, synthesised. Given properly it raises
          your own LH, which then acts on the testis.`,
          `That is a different intervention from <a href="/compounds/hcg/">hCG</a>, which skips the
          pituitary entirely and binds the LH receptor on the testis directly. Two consequences
          follow. Gonadorelin keeps the pituitary in the loop, so LH and FSH actually move and can
          be measured &mdash; the <a href="/markers/lh-fsh/">LH and FSH page</a> covers what that
          looks like. And it needs a pituitary able to respond, where hCG does not.`,
          `The app models a half-life of about twenty minutes, which is the shortest of anything in
          this reference apart from sermorelin. That is not a flaw: native GnRH is cleared in
          minutes too, and the brevity is what makes a pulse a pulse.`
        ]
      },
      {
        h2: 'Continuous exposure does the opposite',
        paras: [
          `@@EV_ESTABLISHED@@ The pituitary gonadotroph responds to intermittent GnRH and
          desensitises under constant stimulation. This is not a subtlety &mdash; it is the basis
          of an entire drug class. Continuous GnRH agonists are used to suppress testosterone in
          prostate cancer and in precocious puberty, and they work precisely by overwhelming the
          receptor they stimulate.`,
          `So the schedule is the drug. Properly spaced administration maintains testicular function;
          administration that is too frequent, or a preparation that releases slowly, produces
          chemical castration. The app&rsquo;s own drawbacks list says this in capitals and it is
          right to. It is also why the approved product is a pump that delivers a dose every ninety
          minutes, and why the subcutaneous schedules used in clinics are an approximation of that
          rather than the thing itself.`,
          `@@EV_OFFLABEL@@ How good an approximation twice-daily injection is, against a pump
          running sixteen pulses a day, has not been established in trials. That is the honest gap
          in this protocol: the mechanism is textbook, the approved delivery is a pump, and the way
          it is actually used is neither.`
        ]
      },
      {
        h2: 'What to measure',
        paras: [
          `The app&rsquo;s panel is well matched to the mechanism. LH and FSH will show activity
          here, unlike on hCG where they stay suppressed, and an LH rise thirty to sixty minutes
          after a dose is a direct test that the pituitary responded. Total testosterone and
          estradiol follow, and testicular volume is the clinical endpoint the protocol exists
          for.`,
          `@@EV_OFFLABEL@@ The approval is for diagnostic use and for a pump in hypogonadotropic
          hypogonadism. Subcutaneous use alongside testosterone therapy is off-label, and the
          preparations used are compounded. This site names no pharmacy or clinic.`,
          `Anyone weighing this against hCG should know the comparison is not settled: hCG has far
          more use behind it for this purpose, gonadorelin has the more physiological mechanism,
          and no trial has compared them for testicular maintenance during testosterone therapy.
          That is a prescribing conversation, and anything on the drawbacks list below belongs in
          it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first item is not a side effect — it is the
      protocol failing in the exact opposite direction from the one intended.`,
    faq: [
      ['How is it different from hCG?', [
        `hCG binds the LH receptor on the testis directly and bypasses the pituitary; gonadorelin acts
         on the pituitary and raises your own LH. That means LH and FSH move on gonadorelin and stay
         suppressed on hCG, and it means gonadorelin needs a pituitary able to respond.`]],
      ['Why can continuous dosing cause suppression?', [
        `Because the gonadotroph desensitises under constant stimulation. That is the mechanism behind
         GnRH agonist therapy for prostate cancer, and it is why the interval between doses matters more
         here than the amount.`]],
      ['How do I know the pituitary responded?', [
        `An LH rise thirty to sixty minutes after a dose, which is the app’s own monitoring suggestion
         and the closest thing to a direct check available.`]],
      ['Is twice-daily injection equivalent to the pump?', [
        `Nobody has established that. The approved delivery is a pump giving a dose roughly every ninety
         minutes; twice daily is a practical approximation with no trial behind it.`]]
    ],
    basis: [
      ['Pulsatile GnRH and gonadotroph desensitisation',
        'Standard endocrinology; the same pharmacology underlies GnRH agonist therapy for androgen suppression'],
      ['Approved indications',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Off-label subcutaneous use',
        'Described in hormone-therapy practice; no controlled trial has compared it with hCG for testicular maintenance'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `When the gap between doses decides the direction of the effect, the clock matters as much
      as the amount. TherapyLog records the time.`
  },

  isotretinoin: {
    slug: 'isotretinoin',
    h1: 'Isotretinoin: the acne drug that actually works, and what it asks in return',
    title: 'Isotretinoin: how it works, and monitoring | TherapyLog',
    description: 'A retinoid that shrinks sebaceous glands rather than suppressing bacteria. Why lipids and liver enzymes are followed, and the pregnancy rule.',
    lede: `The only acne treatment that produces durable remission rather than control, and the one
      with a monitoring schedule and a legal framework attached. Both of those are the same fact
      seen from different sides.`,
    sections: [
      {
        h2: 'It changes the gland, not the bacteria',
        paras: [
          `@@EV_ESTABLISHED@@ Most acne treatments work on one part of the process: antibiotics
          reduce <em>C. acnes</em>, topical retinoids normalise keratinisation, hormonal treatments
          reduce androgen drive. Isotretinoin is a retinoid that acts on all of it by shrinking the
          sebaceous gland itself &mdash; sebum output falls dramatically and stays low, the follicle
          stops being an anaerobic environment, and the bacterial and inflammatory components
          resolve as a consequence.`,
          `That is why a course produces remission rather than suppression, and why a proportion of
          people never need it again. It is also why the effect takes weeks to appear and why an
          initial worsening in the first month is common rather than a sign of failure.`,
          `@@EV_OFFLABEL@@ In hormone-therapy contexts it comes up because androgens drive sebum
          production, so acne is a predictable consequence of raising testosterone &mdash; and the
          lower amounts the app records for that situation are widely used, though the approvals and
          the trials are for the standard weight-based course in severe nodular acne.`
        ]
      },
      {
        h2: 'What is monitored, and why',
        paras: [
          `@@EV_ESTABLISHED@@ Two things move on bloodwork and both are on the app&rsquo;s panel.
          Triglycerides rise, sometimes substantially, and the rise is the reason a lipid panel is
          drawn before starting and repeated during the course &mdash; severe hypertriglyceridaemia
          is the mechanism behind the rare pancreatitis cases. Liver transaminases rise in a
          minority, usually modestly and usually reversibly.`,
          `Someone on testosterone therapy is already in a population where lipids can move, so
          having a baseline before adding a retinoid is worth more here than it would be otherwise.
          The <a href="/markers/apob-vs-ldl/">ApoB page</a> covers why the standard lipid panel does
          not tell the whole story.`,
          `The predictable effects are mucocutaneous and near-universal: dry lips, dry eyes, dry
          nasal passages, sometimes nosebleeds, and joint or muscle aches. They are dose-related and
          resolve when the course ends. Contact lens intolerance and reduced night vision are worth
          knowing about in advance rather than discovering while driving.`
        ]
      },
      {
        h2: 'The two things that are not negotiable',
        paras: [
          `@@EV_ESTABLISHED@@ Isotretinoin is a potent teratogen. Exposure in early pregnancy causes
          severe malformations, and this is not a relative caution or a formality &mdash; it is why
          the drug is dispensed under a mandatory risk-management programme with pregnancy testing
          and contraception requirements in every country that licenses it. Blood donation is also
          prohibited during and for a period after treatment for the same reason.`,
          `The mood question is the other. Depression and suicidality have been reported and the
          causal relationship remains genuinely contested &mdash; severe acne is itself strongly
          associated with depression, which makes the confounding hard to untangle, and large
          studies have not consistently found an increase. What is not contested is that the
          reports exist and that a change in mood during a course is a reason to contact the
          prescriber promptly rather than to finish and see. The app puts mental health on the
          monitoring list for that reason.`,
          `All of this sits with the clinician who prescribes and dispenses it, under a programme
          designed around exactly these risks. Anything on the drawbacks list below belongs in that
          conversation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The pregnancy item is the one that is absolute rather
      than dose-dependent, and it is why this drug is dispensed the way it is.`,
    faq: [
      ['Does the low-dose approach work?', [
        `Lower daily amounts over a longer period are widely used and are what the app records for the
         androgen-driven situation. The approvals and the pivotal trials are for the standard
         weight-based course, so the low-dose approach is practice rather than label.`]],
      ['Why does acne get worse at first?', [
        `An initial flare in the first weeks is common and is not a sign the drug is failing. It settles
         as sebum output falls.`]],
      ['What bloodwork is needed?', [
        `A lipid panel and liver enzymes before starting and during the course, plus the pregnancy
         testing the risk programme requires. Triglycerides are the value that moves most.`]],
      ['Is the depression link real?', [
        `It is contested and not resolved. Severe acne is itself associated with depression, which makes
         the confounding difficult, and large studies have not consistently shown an increase. A mood
         change during a course is still a reason to contact the prescriber promptly.`]]
    ],
    basis: [
      ['Sebaceous gland effect and durable remission',
        'Established dermatology; the mechanism distinguishes it from every other acne treatment'],
      ['Lipid and transaminase changes',
        'Carried in the approved labelling and consistently reported in the trial and post-marketing literature'],
      ['Teratogenicity and risk-management programmes',
        'The reason the drug is dispensed under mandatory pregnancy prevention requirements in every licensing country'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `A course judged on a lipid panel drawn before and during is one where the dates matter.
      TherapyLog keeps them together.`
  },

  raloxifene: {
    slug: 'raloxifene',
    h1: 'Raloxifene: the SERM used when gynaecomastia is already there',
    title: 'Raloxifene: the SERM for established gyno | TherapyLog',
    description: 'A second-generation SERM with a stronger breast-tissue effect than tamoxifen. What the comparison rests on, and the clot risk it shares.',
    lede: `Tamoxifen is the first thing tried; raloxifene is what comes up when the tissue is
      established. The reason people prefer it here is a real pharmacological difference, and the
      evidence for that preference is thinner than the confidence around it.`,
    sections: [
      {
        h2: 'The same class, a different profile',
        paras: [
          `@@EV_ESTABLISHED@@ Raloxifene is a selective oestrogen receptor modulator, like
          <a href="/compounds/tamoxifen/">tamoxifen</a>: it antagonises the oestrogen receptor in
          breast tissue and behaves as an agonist elsewhere. The difference between them is the
          tissue pattern. Tamoxifen is a partial agonist in the uterus, which is why it carries an
          endometrial cancer signal in women; raloxifene is not, which is why it was developed and
          why its approvals are for osteoporosis and for breast cancer risk reduction rather than
          for treatment.`,
          `@@EV_OFFLABEL@@ In gynaecomastia, the preference for raloxifene over tamoxifen for
          established tissue comes from small comparative work in adolescent gynaecomastia
          suggesting a greater reduction in breast diameter. That is a real finding in a small,
          specific population, and it is doing a lot of work in how confidently the preference is
          usually stated. There is no large trial in adults.`,
          `The important framing is the same as on the tamoxifen page. Gynaecomastia responds to
          receptor blockade while it is proliferative &mdash; tender, recent, still changing. Once
          the tissue fibroses, typically after about a year, no SERM reliably reverses it and
          surgery is what does. How long it has been there matters more than which SERM is
          chosen.`
        ]
      },
      {
        h2: 'It does not lower estradiol, and that is the point',
        paras: [
          `@@EV_ESTABLISHED@@ Like every SERM, raloxifene occupies the receptor and leaves
          circulating oestrogen where it is. Someone watching their estradiol number expecting it
          to fall will be confused by a result that has not moved, and the unchanged number is not
          evidence the drug is not working. The app&rsquo;s own drawbacks list is explicit that it
          does not prevent conversion and is not a substitute for an aromatase inhibitor.`,
          `That is also the argument for using it rather than an aromatase inhibitor when the
          problem is breast tissue specifically: an aromatase inhibitor lowers oestrogen everywhere,
          including the bone and vasculature where a man needs it, to fix a problem in one tissue.
          The <a href="/compounds/anastrozole/">anastrozole page</a> covers what over-suppression
          costs.`
        ]
      },
      {
        h2: 'The risk it shares with the class',
        paras: [
          `@@EV_ESTABLISHED@@ Venous thromboembolism is a class effect of the SERMs and is
          established for raloxifene in its own large trials &mdash; the same trials that produced
          the osteoporosis and risk-reduction approvals also produced a clear increase in venous
          thromboembolic events. This is the finding that determines who should not take it: a
          personal or family history of clotting, prolonged immobility, or a planned operation all
          change the calculation.`,
          `Hot flushes and leg cramps are the common tolerability complaints and follow from the
          same receptor pharmacology. The app&rsquo;s monitoring note asks for signs of clotting
          &mdash; calf pain, swelling &mdash; alongside the breast examination, which is the right
          emphasis: one of those is the reason for treatment and the other is the reason to stop
          it.`,
          `Use for gynaecomastia is off-label everywhere. Whether it applies, at what amount, and
          for how long is a prescribing decision made against an examination rather than a lab
          value, and anything on the drawbacks list below belongs with that clinician.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The clot item is the one that decides whether someone
      should take this at all, rather than how much.`,
    faq: [
      ['Raloxifene or tamoxifen for gynaecomastia?', [
        `Tamoxifen has more use behind it; raloxifene is preferred by many for established tissue on the
         strength of small comparative work in adolescents. Neither has a large adult trial. Both are
         off-label for this, and which to use is a prescribing judgement.`]],
      ['Will it lower my estradiol reading?', [
        `No. It blocks the receptor and leaves circulating oestrogen alone. An unchanged estradiol on a
         SERM is expected, not a sign it is not working.`]],
      ['How long does gynaecomastia stay treatable?', [
        `Roughly the first year, while the tissue is proliferative and usually tender. After it fibroses,
         no SERM reliably reverses it. Timing matters more than the choice of drug.`]],
      ['Can it be used instead of an aromatase inhibitor?', [
        `Not for general oestrogen control — it does not reduce how much oestrogen is made. For breast
         tissue specifically it is the more targeted option, which is a different question.`]]
    ],
    basis: [
      ['Tissue-selective receptor pharmacology',
        'Standard pharmacology of the selective oestrogen receptor modulators'],
      ['Comparative effect in gynaecomastia',
        'Small comparative studies in adolescent gynaecomastia; no large adult trial exists'],
      ['Venous thromboembolic risk',
        'Established in raloxifene’s own large osteoporosis and risk-reduction trials and carried in the labelling'],
      ['Modelled half-life and time to peak', 'app.html’s TL_PK entry']
    ],
    cta: `Whether tissue is weeks old or a year old changes what is possible. TherapyLog keeps the
      dates that answer that.`
  },

  progesterone: {
    slug: 'progesterone',
    h1: 'Progesterone: a hormone whose best-known effect in this context is sleep',
    title: 'Progesterone: neurosteroid effects and dosing | TherapyLog',
    description: 'Progesterone is metabolised to allopregnanolone, which acts on GABA receptors. Why the oral route matters, and why progestins differ.',
    lede: `A reproductive hormone with a second life as a neurosteroid. The reason it makes people
      sleepy is a real metabolic pathway, and it is also the reason the route it is taken by changes
      what it does.`,
    sections: [
      {
        h2: 'Two different molecules doing two different jobs',
        paras: [
          `@@EV_ESTABLISHED@@ Progesterone acts at the progesterone receptor &mdash; the
          reproductive role, and in hormone therapy the reason it is given alongside oestrogen to
          protect the endometrium. It is also converted by 5-alpha reductase and 3-alpha
          hydroxysteroid dehydrogenase to allopregnanolone, which is not a sex hormone at all: it is
          a positive allosteric modulator at the GABA-A receptor, the same site benzodiazepines act
          on.`,
          `That second pathway is where the sedation, the anxiolytic effect and the sleep
          improvement come from, and it explains a practical detail that otherwise looks arbitrary.
          Oral progesterone passes through the liver first, where much of that conversion happens,
          so the oral route produces markedly more allopregnanolone than a transdermal or vaginal
          one. Taking it orally at night is not a convenience; it is how you get the neurosteroid
          effect. Vaginal delivery targets the uterus and largely bypasses it.`,
          `@@EV_ESTABLISHED@@ Synthetic progestins are not this molecule. Medroxyprogesterone and
          the others bind the progesterone receptor but are not substrates for the same conversion,
          so they do not produce allopregnanolone, and their cardiovascular and breast signals in
          the large hormone therapy trials are not interchangeable with bioidentical
          progesterone&rsquo;s. Conflating the two is the most common error made about this
          hormone.`
        ]
      },
      {
        h2: 'Where it is used, and how well established each use is',
        paras: [
          `@@EV_ESTABLISHED@@ The approved use is the solid one: in women taking oestrogen with a
          uterus, progesterone opposes endometrial proliferation, and that is not optional. It is
          also used in fertility treatment and in pregnancy support.`,
          `@@EV_OFFLABEL@@ Use for sleep, in women and men, rests on the allopregnanolone mechanism
          and on small studies rather than on large trials. It is plausible, widely practised, and
          not established. The low topical amounts the app records for men are further out still
          &mdash; the rationale is that progesterone modestly inhibits 5-alpha reductase and so
          moderates DHT, and there is very little human data behind using it that way.`,
          `Anyone whose actual problem is sleep should know that the boring interventions have
          stronger evidence than any hormone: cognitive behavioural therapy for insomnia outperforms
          hypnotics in trials and keeps working afterwards, and sleep apnoea, thyroid disease and
          medication effects are worth excluding first.`
        ]
      },
      {
        h2: 'What to watch',
        paras: [
          `Sedation is the effect people notice, which is why it is taken at night and why driving
          the next morning is worth a thought during the first week. Bloating, breast tenderness and
          mood changes are the common complaints, and they are dose-related.`,
          `The app&rsquo;s panel is a hormone panel &mdash; serum progesterone, estradiol, SHBG,
          with breast examination and cervical screening for women, and a full hormone panel in men.
          Serum progesterone is worth a caveat: it fluctuates enormously across the menstrual cycle
          and after an oral dose, so a single value without a stated timing is difficult to place,
          much like <a href="/compounds/liothyronine-t3/">T3</a>.`,
          `Whether this applies to a particular person, in what form and by what route, is a
          prescribing decision, and anything on the drawbacks list below belongs with the clinician
          who makes it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the third item is the important one: bioidentical
      progesterone and the synthetic progestins are not the same drug and do not share evidence.`,
    faq: [
      ['Why take it at night?', [
        `Because oral progesterone is converted on first pass through the liver to allopregnanolone,
         which acts on GABA-A receptors and is sedating. Taking it at night uses that rather than fighting
         it.`]],
      ['Is a progesterone cream equivalent to a capsule?', [
        `Not for the neurosteroid effect. Transdermal delivery bypasses the first-pass conversion that
         produces allopregnanolone, and cream absorption is variable. For endometrial protection the route
         matters differently again — that is a prescriber’s call.`]],
      ['Are progestins the same thing?', [
        `No. Synthetic progestins bind the same receptor but are not converted to allopregnanolone, and
         their trial data on cardiovascular and breast outcomes does not transfer to bioidentical
         progesterone.`]],
      ['Does it help men?', [
        `The rationale is modest 5-alpha reductase inhibition and the sleep effect, and the human data
         behind using it that way is very thin. The app records low topical amounts with a three-month
         reassessment, which is an appropriately cautious framing for something this unstudied.`]]
    ],
    basis: [
      ['Allopregnanolone and GABA-A modulation',
        'Established neurosteroid pharmacology; the conversion occurs largely on hepatic first pass'],
      ['Endometrial protection',
        'The approved indication and the basis for progesterone in oestrogen therapy'],
      ['Progestins versus bioidentical progesterone',
        'Distinct molecules with distinct receptor and metabolic behaviour; trial data does not transfer between them'],
      ['Regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim']
    ],
    cta: `A hormone whose level swings with the day and the cycle is only readable with a recorded
      draw time. TherapyLog keeps it.`
  },

  oxytocin: {
    slug: 'oxytocin',
    h1: 'Oxytocin: a hormone with an approval for labour and a research literature about everything else',
    title: 'Oxytocin: the intranasal question | TherapyLog',
    description: 'Intranasal oxytocin is one of the most studied compounds in social neuroscience and one of the least replicated. What is actually established.',
    lede: `An approved obstetric drug, a research tool in hundreds of psychology studies, and a
      wellness product. The gap between those three is wider than almost anything else in this
      reference, and the replication problem is the interesting part.`,
    sections: [
      {
        h2: 'What is established, and what the nose has to do with it',
        paras: [
          `@@EV_ESTABLISHED@@ Oxytocin is a nine-amino-acid peptide made in the hypothalamus. Its
          approved use is intravenous, for labour induction and postpartum haemorrhage, and that
          pharmacology is not in question. What is in question is everything downstream of the
          claim that spraying it up the nose produces central effects.`,
          `The problem is delivery. Oxytocin is a peptide, cleared from blood in minutes, and it
          does not meaningfully cross the blood-brain barrier. The intranasal route is proposed to
          bypass that via the olfactory and trigeminal pathways, and there is evidence that some
          reaches cerebrospinal fluid &mdash; but the fraction is small, the dose-response is not
          established, and how much of any observed effect comes from central versus peripheral
          action is genuinely unresolved.`,
          `@@EV_THEORETICAL@@ That matters because the intranasal literature is enormous and its
          replication record is poor. Early findings on trust, generosity and social cognition were
          striking and have replicated inconsistently; the field is now a standard example in
          discussions of underpowered studies and publication bias. This is not a compound with
          little evidence &mdash; it is a compound with a great deal of evidence pointing in
          several directions.`
        ]
      },
      {
        h2: 'The effect people actually report',
        paras: [
          `@@EV_OFFLABEL@@ Setting the research aside, the reported subjective effects are
          consistent: a short window of warmth, social ease and heightened emotional
          responsiveness, sometimes with an effect on arousal, lasting under an hour. The
          app&rsquo;s dosing rows describe as-needed use before an event, which follows from a
          half-life measured in minutes.`,
          `The app&rsquo;s drawbacks list contains one item worth taking seriously: it is
          emotionally sensitising rather than uniformly positive. The same amplification that makes
          a good interaction better makes a difficult one worse, and the research on this is more
          consistent than the research on the benefits &mdash; effects appear to depend heavily on
          context and on the person. Anyone expecting a reliable mood lift is expecting the wrong
          thing.`,
          `Tolerance is the other reported constraint, and it is why the app frames this as
          intermittent rather than daily. Receptor downregulation under repeated stimulation is
          plausible for any peptide hormone and is not specifically demonstrated here.`
        ]
      },
      {
        h2: 'Practical points',
        paras: [
          `The approved product is intravenous and for a completely different purpose. Intranasal
          preparations are compounded, so concentration and sterility rest with the compounder, and
          this site names no pharmacy. Nothing on a routine panel tracks it; the app records mood
          self-assessment and cortisol only where stress is a separate concern, which is honest.`,
          `The muscle and recovery claims in circulation come from animal work on satellite cell
          activation and are a long way from a human outcome. Treating them as established is the
          kind of extrapolation this site keeps flagging.`,
          `Anyone taking psychiatric medication, or using this to manage a mood or relationship
          difficulty, should be having that conversation with a clinician rather than a page &mdash;
          a compound that amplifies emotional response is not a neutral addition to either
          situation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the last item is the most useful thing on it:
      this amplifies whatever is there rather than reliably improving it.`,
    faq: [
      ['Does intranasal oxytocin reach the brain?', [
        `Some appears to, via olfactory and trigeminal routes, and the fraction is small and the
         dose-response is not established. How much of any observed effect is central rather than
         peripheral remains unresolved.`]],
      ['Why is the research so inconsistent?', [
        `Because much of it was underpowered and the early striking findings have replicated poorly. It
         is now a standard case study in discussions of replication in psychology, which is a reason to
         read confident claims about it carefully.`]],
      ['How long does it last?', [
        `Under an hour, subjectively. The peptide itself is cleared in minutes, which is why the app’s
         rows describe taking it shortly before something rather than on a schedule.`]],
      ['Does it help recovery or muscle?', [
        `The claims come from animal work on satellite cell activation. No human outcome supports it, and
         treating that as established is a long extrapolation.`]]
    ],
    basis: [
      ['Approved intravenous indication',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim'],
      ['Intranasal delivery to the central nervous system',
        'Evidence that a small fraction reaches cerebrospinal fluid; dose-response is not established'],
      ['Replication record of the social-cognition literature',
        'Widely documented; early findings have replicated inconsistently in larger studies'],
      ['Context dependence of effects',
        'Reported more consistently than benefit itself across the intranasal literature']
    ],
    cta: `An as-needed compound with a context-dependent effect is one where your own notes are the
      only evidence. TherapyLog keeps them with the dose.`
  },

  quercetin: {
    slug: 'quercetin',
    h1: 'Quercetin: the other half of the senolytic protocol, and a flavonoid with an absorption problem',
    title: 'Quercetin: the senolytic pairing, examined | TherapyLog',
    description: 'Quercetin is the compound paired with dasatinib in the human senolytic trials. What it contributes, and why bioavailability is the catch.',
    lede: `Best known as half of a protocol rather than on its own. The pairing has a real
      mechanistic reason behind it, and quercetin taken alone is a different and much less studied
      proposition.`,
    sections: [
      {
        h2: 'Why the pairing exists',
        paras: [
          `@@EV_THEORETICAL@@ Senescent cells resist apoptosis by upregulating survival pathways,
          and different cell types depend on different ones. That is the reason the senolytic screen
          that identified <a href="/compounds/dasatinib/">dasatinib</a> also identified quercetin,
          and the reason the two are used together: dasatinib is more effective against senescent
          preadipocytes, quercetin against senescent endothelial cells and some others. Neither
          covers the range alone.`,
          `So the combination is not a supplement bolted onto a drug &mdash; it is what the
          protocol was designed as, and every human senolytic trial to date has used both. Quercetin
          on its own has not been tested as a senolytic in people, which makes taking it alone for
          that purpose an extrapolation from a pairing.`,
          `@@EV_ESTABLISHED@@ Separately from any of that, quercetin has a long history as an
          anti-inflammatory flavonoid: it inhibits NLRP3 inflammasome activation and stabilises mast
          cells, which is the basis for its use as a natural antihistamine. That use is at daily
          amounts rather than pulses and is a different intervention from the senolytic one.`
        ]
      },
      {
        h2: 'Absorption is the recurring problem',
        paras: [
          `@@EV_ESTABLISHED@@ Plain quercetin aglycone is poorly absorbed &mdash; low single-digit
          bioavailability &mdash; and is rapidly conjugated in the gut and liver, so plasma
          concentrations after an oral dose are a small fraction of what the cell studies used. That
          gap between the concentration that kills senescent cells in a dish and the concentration
          a capsule produces is the central uncertainty about the whole approach.`,
          `Phytosome and other enhanced formulations improve absorption substantially and cost more,
          which is what the app&rsquo;s drawbacks list is pointing at. Taking it with a fat-containing
          meal helps. None of that resolves the underlying question of whether the achieved
          concentration is enough.`
        ]
      },
      {
        h2: 'The interaction nobody expects from a supplement',
        paras: [
          `@@EV_ESTABLISHED@@ Quercetin inhibits CYP3A4 and P-glycoprotein and affects several drug
          transporters, so it can raise blood levels of drugs cleared by those routes. It also
          chelates and reduces the absorption of quinolone antibiotics, and it has antiplatelet
          activity that matters alongside anticoagulants. At the gram-per-day amounts a senolytic
          pulse uses, this is a pharmacological exposure rather than a dietary one.`,
          `That is the practical thing to carry away: it belongs on the medication list you give a
          clinician even though it came from a shop, and a pulse taken while on prescription
          medication is a medication event rather than a supplement day.`,
          `Monitoring, per the app, is inflammatory markers before and after a pulse &mdash; a
          plausible proxy rather than a validated one, since nothing measures senescent cell
          clearance outside a research setting. The <a href="/compounds/fisetin/">fisetin page</a>
          covers the other flavonoid senolytic and the dose-scaling problem both share.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the last item is the honest one: the human trials
      used the combination, not quercetin alone.`,
    faq: [
      ['Does quercetin work as a senolytic on its own?', [
        `That has not been tested in people. Every human senolytic trial used it paired with dasatinib,
         and the pairing exists because the two cover different senescent cell types. Taking it alone for
         that purpose is an extrapolation.`]],
      ['Which form should be taken?', [
        `Plain quercetin is poorly absorbed; phytosome and similar enhanced formulations absorb
         substantially better and cost more. Taking it with fat helps either way. Whether any of them
         reaches a senolytic concentration is the unresolved question.`]],
      ['Does it interact with medication?', [
        `Yes — it inhibits CYP3A4 and P-glycoprotein, reduces absorption of quinolone antibiotics, and has
         antiplatelet activity. At senolytic amounts that is a pharmacological exposure and belongs on the
         medication list you give a clinician.`]],
      ['Is the antihistamine use the same thing?', [
        `No. That is a daily anti-inflammatory and mast-cell-stabilising use at lower amounts, and it is a
         separate proposition from the intermittent high-dose senolytic protocol.`]]
    ],
    basis: [
      ['Complementary senolytic coverage with dasatinib',
        'The senolytic screen that identified both compounds and the trial protocols that followed'],
      ['Bioavailability of quercetin aglycone',
        'The flavonoid absorption literature; plasma concentrations are a small fraction of cell-study levels'],
      ['CYP3A4, P-glycoprotein and quinolone interactions',
        'Established in the drug-interaction literature'],
      ['NLRP3 and mast cell effects',
        'The anti-inflammatory flavonoid literature, at daily rather than pulse amounts']
    ],
    cta: `A pulse every few months alongside prescription medication is a medication event worth
      dating. TherapyLog records it.`
  },

  ghkcu: {
    slug: 'ghk-cu',
    h1: 'GHK-Cu: a copper-binding tripeptide with good topical evidence and a thinner injected case',
    title: 'GHK-Cu: the copper peptide, by route | TherapyLog',
    description: 'A copper-carrying tripeptide with real cosmetic evidence applied to skin. What the systemic injected use rests on, which is much less.',
    lede: `Three amino acids carrying a copper ion, present naturally in plasma and declining with
      age. The topical case is the strongest cosmetic-peptide evidence in this reference; the
      injected case is a different question with a different answer.`,
    sections: [
      {
        h2: 'The copper is the active part',
        paras: [
          `@@EV_ESTABLISHED@@ GHK is glycyl-histidyl-lysine, a tripeptide that binds copper with
          high affinity. That complex is what does the work: copper is a cofactor for lysyl oxidase,
          which cross-links collagen and elastin, and for superoxide dismutase. The peptide is
          essentially a delivery vehicle that hands copper to the enzymes that need it, in a form
          the tissue can use without the toxicity free copper would cause.`,
          `Its plasma concentration falls substantially between young adulthood and later life,
          which is where the anti-ageing framing comes from. The gene-expression work often cited
          &mdash; that GHK-Cu shifts the expression of a large number of genes toward a younger
          pattern &mdash; is real and is cell-culture work, and it is a long way from a clinical
          outcome.`
        ]
      },
      {
        h2: 'Topical is where the evidence is',
        paras: [
          `@@EV_ESTABLISHED@@ Applied to skin, GHK-Cu has controlled cosmetic studies behind it
          reporting improved skin density, reduced fine lines and better wound healing. That is a
          genuinely better evidence base than most things in this reference and is why it appears in
          commercial skincare. The app records topical rows for exactly that use.`,
          `@@EV_THEORETICAL@@ Subcutaneous administration for systemic effect &mdash; injury
          healing, tissue regeneration, general anti-ageing &mdash; is a different proposition and
          has no controlled human trial. The app&rsquo;s own regulatory string draws the line
          precisely: topical use is cosmetic and over-the-counter, systemic use is research only.
          That is the cleanest statement of the situation on this page and it comes from the app
          rather than from me.`,
          `The intranasal row is further out again. It exists in practice and has nothing published
          behind it.`
        ]
      },
      {
        h2: 'Copper is the thing to watch',
        paras: [
          `@@EV_OFFLABEL@@ A peptide whose function is to carry copper, injected daily, is
          delivering copper. Copper accumulation is theoretical rather than demonstrated at the
          amounts described, and it is the reason the app puts copper levels on the monitoring list
          for extended high-dose use. Anyone with Wilson&rsquo;s disease or another copper-handling
          disorder is in a different situation entirely and this is not a supplement decision for
          them.`,
          `Copper and zinc also compete for absorption and transport, so someone supplementing zinc
          heavily alongside is running two things against each other. That is worth mentioning to
          whoever manages their supplements.`,
          `There is no approved injectable product. Identity and purity rest with whoever made the
          vial, and this site names no vendor or brand. Photographic documentation is the honest
          assessment method for anything cosmetic, which is what the app records &mdash; the same
          before-and-after that makes a skin claim checkable is the one that makes a personal result
          readable.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The topical-versus-systemic item at the top is the
      whole page in one line.`,
    faq: [
      ['Does the injected form work like the topical form?', [
        `Nobody has shown that. The controlled evidence is topical and cosmetic; systemic subcutaneous
         use has no human trial, which is what the app’s own regulatory string says.`]],
      ['Is copper accumulation a real risk?', [
        `Theoretical at the amounts described rather than demonstrated, which is why the app puts copper
         levels on the panel for extended high-dose use. Anyone with a copper-handling disorder is in a
         different category.`]],
      ['Does it regrow hair?', [
        `Copper peptides appear in hair products and the follicle-stimulation claims come from cell and
         animal work. There is no controlled human trial of GHK-Cu for hair loss comparable to the ones
         behind the approved treatments.`]],
      ['Why is there no half-life in the fact box?', [
        `Because the app holds none, and for a topical the systemic half-life would not be the relevant
         quantity anyway.`]]
    ],
    basis: [
      ['Copper as cofactor for lysyl oxidase and superoxide dismutase',
        'Established biochemistry of copper-dependent enzymes'],
      ['Topical cosmetic studies',
        'Controlled studies reporting improved skin density and wound healing with topical application'],
      ['Gene expression findings',
        'Cell-culture work; not a clinical outcome'],
      ['Route-dependent regulatory status',
        'The approval string in the fact box is app.html’s own field, which distinguishes topical from systemic use']
    ],
    cta: `Anything cosmetic is judged on a photograph taken the same way each time. TherapyLog keeps
      the dates beside it.`
  },

  nalt: {
    slug: 'nac-and-nalt',
    h1: 'NAC and NALT: two different amino acid derivatives sold as one entry',
    title: 'NAC and NALT: two compounds, one entry | TherapyLog',
    description: 'N-acetylcysteine feeds glutathione; N-acetyl L-tyrosine feeds catecholamines. They do unrelated things and are often bought together.',
    lede: `The app holds these as one entry and they are not one compound. One is a glutathione
      precursor with a genuine approved use; the other is a catecholamine precursor with a much
      weaker case. Separating them is most of what this page is for.`,
    sections: [
      {
        h2: 'NAC: the one with an approval behind it',
        paras: [
          `@@EV_ESTABLISHED@@ N-acetylcysteine is a cysteine donor, and cysteine is the
          rate-limiting amino acid for glutathione synthesis &mdash; the cell&rsquo;s principal
          antioxidant. That is not a supplement claim: intravenous NAC is the standard antidote for
          paracetamol overdose, where it works by restoring hepatic glutathione, and it is on the
          WHO essential medicines list for that reason. It is also used as a mucolytic.`,
          `@@EV_OFFLABEL@@ The uses people take it for &mdash; psychiatric conditions,
          compulsive behaviours, respiratory health, liver support &mdash; rest on a mixed body of
          trials. There is reasonable randomised evidence in trichotillomania and some in
          obsessive-compulsive and substance-use disorders; results elsewhere are inconsistent.
          It is one of the better-evidenced supplements in this reference and that is a low bar
          being cleared rather than a strong claim.`,
          `Its regulatory position in the United States has been contested, because it was approved
          as a drug before being marketed as a supplement &mdash; which is what the app&rsquo;s own
          string means by "in flux". It remains widely available.`
        ]
      },
      {
        h2: 'NALT: a different molecule with a narrower case',
        paras: [
          `@@EV_ESTABLISHED@@ N-acetyl L-tyrosine is a more soluble form of tyrosine, the precursor
          to dopamine, noradrenaline and adrenaline, and also to thyroid hormone. The case for
          supplementing it is specific: tyrosine appears to help cognitive performance under
          conditions that deplete catecholamines &mdash; cold, sleep deprivation, sustained stress
          &mdash; and much less under ordinary conditions.`,
          `@@EV_THEORETICAL@@ Whether the acetylated form is actually better is questionable. It is
          more water-soluble, and there is evidence that a substantial fraction is excreted
          unchanged rather than deacetylated to free tyrosine, which would make it a worse delivery
          vehicle rather than a better one. Plain L-tyrosine is cheaper and is what most of the
          trials used.`,
          `It also competes with other large neutral amino acids for transport across the
          blood-brain barrier, which is why it is taken away from protein-containing meals. That
          detail is in the app&rsquo;s own drawbacks list and it is the one that most often explains
          a disappointing result.`
        ]
      },
      {
        h2: 'What each is worth watching',
        paras: [
          `NAC&rsquo;s common effect is gastrointestinal at higher amounts. The interaction worth
          knowing is that it may reduce the efficacy of some chemotherapy, which is the app&rsquo;s
          own note and is a conversation for anyone in oncology care rather than a footnote. It also
          has mild antiplatelet activity.`,
          `NALT&rsquo;s constraint is that it feeds a pathway shared with thyroid hormone synthesis
          and with catecholamines, so anyone on thyroid medication, on a monoamine oxidase
          inhibitor, or with hyperthyroidism should be raising it with a clinician rather than
          treating it as inert.`,
          `The app records liver enzymes on the panel, noting NAC is hepatoprotective. That is
          reasonable and it is also worth saying plainly that "hepatoprotective" does not make an
          oral androgen safe &mdash; taking NAC alongside something that stresses the liver is not
          a licence, and the compounds where that argument gets made are ones this site does not
          publish.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it covers both compounds at once — which is
      exactly the conflation this page is trying to undo.`,
    faq: [
      ['Is NAC actually a medicine?', [
        `Intravenously, yes — it is the standard antidote for paracetamol overdose and is on the WHO
         essential medicines list. The oral supplement use for other purposes is a separate and much
         weaker evidence base.`]],
      ['Is NALT better than plain tyrosine?', [
        `Probably not, and possibly worse. It is more soluble, and evidence suggests a substantial
         fraction is excreted unchanged rather than converted to free tyrosine. Most of the trials used
         plain L-tyrosine.`]],
      ['When does tyrosine actually help?', [
        `Under conditions that deplete catecholamines — cold, sleep deprivation, sustained stress — more
         than in rested ordinary conditions. That is a narrower claim than it is usually sold with.`]],
      ['Why take NALT away from food?', [
        `Because it competes with other large neutral amino acids for transport into the brain. Taken with
         a protein meal, most of it loses that competition.`]]
    ],
    basis: [
      ['NAC as a glutathione precursor and paracetamol antidote',
        'Established clinical pharmacology; NAC is on the WHO essential medicines list for this use'],
      ['Randomised evidence in psychiatric indications',
        'Trials in trichotillomania and mixed results in obsessive-compulsive and substance-use disorders'],
      ['Tyrosine under catecholamine-depleting stress',
        'Human performance trials under cold, sleep deprivation and sustained stress'],
      ['Regulatory status',
        'The approval string in the fact box is app.html’s own field, reproduced verbatim']
    ],
    cta: `Two different compounds bought as one is exactly the situation where a log that names what
      you actually took earns its keep.`
  },

  'melatonin-ther': {
    slug: 'melatonin',
    h1: 'Melatonin: a timing signal that gets used as a sedative, at doses far above what it needs',
    title: 'Melatonin: timing, dose, and the high-dose case | TherapyLog',
    description: 'Melatonin shifts the body clock more reliably than it sedates. Why lower doses work better for sleep, and what high-dose protocols rest on.',
    lede: `The most commonly misused compound in this reference, and the misuse is a dosing error
      rather than a safety one. It is a circadian signal, and most people take ten to a hundred
      times more of it than the signal requires.`,
    sections: [
      {
        h2: 'A clock signal, not a sleeping tablet',
        paras: [
          `@@EV_ESTABLISHED@@ Melatonin is secreted by the pineal gland as darkness falls and acts
          on receptors in the suprachiasmatic nucleus &mdash; the body clock. Its physiological job
          is to tell the system what time it is, not to induce unconsciousness. That distinction
          predicts almost everything about how it behaves: it shifts the timing of sleep reliably,
          and it produces sedation weakly.`,
          `@@EV_ESTABLISHED@@ The dose that saturates those receptors is small. Physiological
          nocturnal concentrations are reproduced by roughly 0.3 mg, and studies comparing doses for
          sleep onset have generally not found more to be better &mdash; higher amounts produce
          concentrations far above anything the body makes, sustained into the morning, which is
          where next-day grogginess comes from. The app&rsquo;s own sleep row says 0.3 to 1 mg and
          explicitly advises against going higher for sleep, which is correct and unusual advice to
          find on a supplement.`,
          `Timing matters more than amount for the circadian use. Taken several hours before the
          desired sleep time it advances the clock; taken in the early morning it delays it. For jet
          lag and for delayed sleep phase, that is the mechanism doing the work, and getting the
          timing wrong can move the clock in the wrong direction.`
        ]
      },
      {
        h2: 'The high-dose protocols, and where they come from',
        paras: [
          `@@EV_THEORETICAL@@ The app records therapeutic rows an order of magnitude higher, and
          those come from a different literature: melatonin as an antioxidant and mitochondrial
          protectant, and from oncology, where high-dose melatonin has been studied as an adjunct
          alongside conventional treatment. Some of that work reports benefit and much of it is
          small and open-label.`,
          `Two things follow. Those amounts are not for sleep &mdash; they are worse for sleep than
          the small ones &mdash; and the population they were studied in is people with cancer
          receiving treatment, which is not the population reading this page. Extrapolating an
          oncology adjunct dose into a longevity supplement is exactly the move this site keeps
          flagging.`,
          `Melatonin is a hormone, which the app&rsquo;s own regulatory string says. Long-term
          high-dose use has not been characterised for its effects on the reproductive axis in
          adults, and the app puts reproductive hormones on the monitoring list for that reason
          &mdash; theoretical rather than demonstrated, and a reasonable thing to have measured
          rather than assumed.`
        ]
      },
      {
        h2: 'Practical points',
        paras: [
          `It is a supplement in the United States and a prescription medicine in much of Europe and
          in Australia, which tells you something about how the same evidence is read in different
          places. Independent analyses of commercial melatonin products have repeatedly found
          content varying widely from label, sometimes by several fold, and some products have been
          found to contain serotonin. This site names no brand and no testing service.`,
          `The interaction worth naming is with anticoagulants, where melatonin may add to bleeding
          risk, and with anything sedating. Anyone on either should be raising it rather than
          assuming an over-the-counter product is inert.`,
          `And the same caveat the DSIP page carries applies here: persistent sleep disruption is a
          symptom rather than a diagnosis, and sleep apnoea, thyroid disease, depression and
          medication effects are all worth excluding before treating it. Cognitive behavioural
          therapy for insomnia outperforms hypnotics in trials and keeps working after it stops.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first two items are the practical
      consequences of taking a clock signal at sedative-sized amounts.`,
    faq: [
      ['How much should be taken for sleep?', [
        `Less than most products sell. Roughly 0.3 to 1 mg reproduces physiological concentrations, and
         comparisons have generally not found more to work better — higher amounts mainly add next-day
         grogginess. The app’s own row says the same.`]],
      ['Why does timing matter?', [
        `Because it acts on the body clock. Taken hours before the target sleep time it advances the
         clock; taken in the early morning it delays it. For jet lag that is the whole mechanism.`]],
      ['What are the 10 to 60 mg protocols for?', [
        `Not sleep. They come from antioxidant and oncology-adjunct work in people receiving cancer
         treatment, which is a different population and a different purpose. Using that dose for sleep
         makes sleep worse.`]],
      ['Is content on the label reliable?', [
        `Often not. Independent analyses have repeatedly found melatonin content varying widely from
         label, sometimes several fold, and it is a prescription medicine in much of Europe and
         Australia.`]]
    ],
    basis: [
      ['Suprachiasmatic receptor action and phase shifting',
        'Standard circadian physiology; the phase-response relationship is well characterised'],
      ['Dose comparisons for sleep onset',
        'Human studies comparing physiological and supraphysiological doses, generally without benefit for more'],
      ['High-dose oncology adjunct literature',
        'Small and largely open-label studies in people receiving cancer treatment'],
      ['Label accuracy of commercial products',
        'Independent analyses reporting wide deviation from stated content']
    ],
    cta: `A compound where the hour it was taken matters more than the amount is one that needs the
      time recorded, not just the day.`
  },

  acarbose: {
    slug: 'acarbose',
    h1: 'Acarbose: an old diabetes drug with the best mouse lifespan data outside rapamycin',
    title: 'Acarbose: the glucose curve, and the ITP data | TherapyLog',
    description: 'An alpha-glucosidase inhibitor that blunts post-meal glucose. What the NIA mouse programme found, and why the effect was sex-dependent.',
    lede: `A drug that works entirely inside the gut, taken for an effect measured over decades in
      mice. The mechanism is unglamorous and the longevity data is among the strongest in the field
      &mdash; and it came with a wrinkle that rarely gets mentioned.`,
    sections: [
      {
        h2: 'It works before absorption, not after',
        paras: [
          `@@EV_ESTABLISHED@@ Alpha-glucosidase enzymes on the intestinal brush border break
          disaccharides and oligosaccharides into absorbable glucose. Acarbose competitively
          inhibits them, so carbohydrate digestion is slowed and shifted further down the gut. The
          effect is a blunted post-meal glucose rise rather than a lower fasting glucose, and the
          drug barely enters the circulation at all &mdash; which is why it has essentially no
          systemic pharmacology and why the app holds no half-life for it.`,
          `Two practical consequences follow directly. It must be taken with the first bite of a
          meal, because it has to be present when the carbohydrate arrives; taken afterwards it does
          nothing. And it does nothing at all on a meal without carbohydrate, which makes it a poor
          fit for anyone eating low-carbohydrate &mdash; there is no substrate to slow.`,
          `The gastrointestinal effects come from the same mechanism. Carbohydrate that reaches the
          colon undigested gets fermented by gut bacteria, and the flatulence and bloating that
          follow are the drug working rather than a side effect in the usual sense. They diminish
          over weeks as the microbiome adapts, which is why starting low and titrating is standard.`
        ]
      },
      {
        h2: 'What the ITP found, and the part that gets left out',
        paras: [
          `@@EV_ESTABLISHED@@ The National Institute on Aging&rsquo;s Interventions Testing Program
          is the multi-site programme designed specifically to weed out lifespan results that do not
          replicate. Acarbose extended median lifespan in genetically heterogeneous mice, and the
          effect was substantial &mdash; on the order of twenty per cent in males. In later work,
          acarbose combined with rapamycin outperformed either alone.`,
          `The wrinkle is that the effect was strongly sex-dependent: much larger in males than in
          females, where it was modest. That pattern recurs across several ITP interventions and
          nobody has a settled explanation for it. Anyone quoting the twenty per cent figure without
          saying which sex it applies to is quoting half the result.`,
          `@@EV_THEORETICAL@@ And it is a mouse result. There is no human longevity trial of
          acarbose, and the human evidence is for glycaemic control in type 2 diabetes plus a
          cardiovascular signal in impaired glucose tolerance that has been argued over. The
          mechanistic story &mdash; fewer glucose excursions, less glycation, less oxidative stress
          &mdash; is plausible and is not the same as a demonstrated outcome.`
        ]
      },
      {
        h2: 'What to watch',
        paras: [
          `The app&rsquo;s panel is fasting glucose, HbA1c and liver enzymes. HbA1c is the marker
          that reflects what this drug does over time, and the
          <a href="/markers/hba1c-and-fasting-glucose/">HbA1c page</a> covers why it and fasting
          glucose can disagree &mdash; which is exactly what a drug that flattens post-meal peaks
          without lowering the fasting value should produce. Continuous glucose monitoring, where
          available, shows the effect far more directly than either.`,
          `Liver enzyme elevation is rare and dose-related and is the reason it is on the panel.
          Hypoglycaemia is not a risk from acarbose alone, but it is worth knowing that if
          hypoglycaemia occurs alongside another glucose-lowering drug, ordinary table sugar will
          not correct it quickly &mdash; the drug is blocking the enzyme that breaks it down, so
          glucose itself is needed.`,
          `It requires a prescription and the longevity use is off-label. Whether it applies to a
          particular person is a prescribing decision, and anything on the drawbacks list below
          belongs in that conversation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and note how many items are the same fact: this drug
      acts on carbohydrate in the gut, so timing and diet decide whether it does anything at all.`,
    faq: [
      ['Why must it be taken with the first bite?', [
        `Because it competes with carbohydrate for the same intestinal enzymes and has to be present when
         the carbohydrate arrives. Taken after a meal it does nothing.`]],
      ['Does it work on a low-carbohydrate diet?', [
        `Barely. There is nothing for it to slow. That is a genuine limitation for anyone whose diet is
         already low in carbohydrate.`]],
      ['How big was the mouse effect?', [
        `Around twenty per cent in median lifespan in males in the NIA programme, and considerably
         smaller in females. The sex difference is real and is usually omitted when the figure is
         quoted.`]],
      ['What if I have a hypo while taking it?', [
        `Acarbose alone does not cause hypoglycaemia, but if one occurs alongside another
         glucose-lowering drug, table sugar will not correct it quickly — the enzyme that breaks it down is
         what the drug is blocking. Glucose itself is what works.`]]
    ],
    basis: [
      ['Alpha-glucosidase inhibition and minimal systemic absorption',
        'Standard clinical pharmacology; the approved indication rests on post-prandial glucose control'],
      ['Mouse lifespan extension and the sex difference',
        'NIA Interventions Testing Program results for acarbose, with a substantially larger effect in males'],
      ['Combination with rapamycin',
        'Later ITP work reporting greater lifespan extension for the combination than either alone'],
      ['Absence of human longevity data',
        'No human trial has measured a longevity outcome for acarbose']
    ],
    cta: `A drug whose effect depends on the meal it was taken with is one where the log has to
      record both. TherapyLog does.`
  },

  taurine: {
    slug: 'taurine',
    h1: 'Taurine: a 2023 paper made it famous, and the paper was about mice',
    title: 'Taurine: what the 2023 paper actually showed | TherapyLog',
    description: 'Taurine supplementation extended lifespan in mice and correlates with health markers in people. What separates those two statements.',
    lede: `An amino acid found in most diets, cheap, well tolerated, and the subject of one of the
      most widely reported longevity papers of recent years. What that paper showed and what it is
      usually said to have shown are not the same.`,
    sections: [
      {
        h2: 'What it does in the body',
        paras: [
          `@@EV_ESTABLISHED@@ Taurine is a sulfonic acid rather than a protein-building amino acid
          &mdash; it is never incorporated into protein. It is abundant in heart, skeletal muscle,
          retina and brain, where it regulates calcium handling, contributes to osmotic balance,
          conjugates bile acids, and acts on GABA-A and glycine receptors, which is the basis for
          its calming reputation.`,
          `Most people get it from diet, principally shellfish and meat, and the body also
          synthesises some from cysteine. Vegetarians and vegans have measurably lower intake and
          lower circulating levels, which is the group where supplementation is most likely to do
          something.`,
          `@@EV_OFFLABEL@@ The best-supported human effects are cardiovascular: modest blood
          pressure reduction in meta-analysed trials, and improvement in exercise measures in some
          studies. Those are small effects and are more solid than the longevity claim.`
        ]
      },
      {
        h2: 'The 2023 paper, described precisely',
        paras: [
          `@@EV_THEORETICAL@@ The paper reported that circulating taurine declines with age across
          species, that supplementing it extended median lifespan in mice by roughly ten per cent
          and improved multiple healthspan measures, and that in humans lower taurine correlated
          with worse markers of metabolic and inflammatory health. It also reported that exercise
          raises taurine.`,
          `Two of those three are mouse results and the third is a correlation. No human
          intervention trial has tested whether supplementing taurine changes any outcome that
          matters. The correlation is the part most easily misread: if taurine falls with age and
          with ill health, a low level may be a consequence rather than a cause, and topping it up
          would then achieve nothing. Distinguishing those is exactly what an intervention trial is
          for, and one has been proposed rather than reported.`,
          `That is not a criticism of the paper, which was careful about this. It is a criticism of
          how it was reported.`
        ]
      },
      {
        h2: 'Practical points',
        paras: [
          `The amounts used for the longevity framing &mdash; three to six grams a day &mdash; are
          well above dietary intake and are extrapolated from the animal work rather than
          established in people. Tolerability at that level is good; gastrointestinal upset is the
          usual limit.`,
          `@@EV_ESTABLISHED@@ Two interactions are worth naming. Taurine lowers blood pressure
          modestly, which matters for anyone already on antihypertensives, and the app puts blood
          pressure on the monitoring list for that reason. And it interacts with lithium, which is
          in the app&rsquo;s own drawbacks list &mdash; anyone taking lithium should be raising it
          with the clinician managing that rather than spacing doses on their own judgement.`,
          `Content varies between supplement products as it does with anything unregulated, and this
          site names no brand. The honest position is a cheap, well-tolerated compound with modest
          proven cardiovascular effects and a longevity case built entirely on mice and
          correlation.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the second item is the one that matters most:
      the longevity claims are animal-based, and the app says so.`,
    faq: [
      ['Did the 2023 study show taurine extends human lifespan?', [
        `No. It showed lifespan extension in mice and a correlation between taurine levels and health
         markers in people. No human intervention trial has reported an outcome.`]],
      ['Could low taurine be a consequence rather than a cause?', [
        `That is exactly the open question. If it falls with age and illness, supplementing it may change
         the number without changing anything else. Only an intervention trial separates the two.`]],
      ['Who is most likely to benefit?', [
        `People with genuinely low intake — vegetarians and vegans have measurably lower levels, since the
         main dietary sources are shellfish and meat.`]],
      ['Does it interact with anything?', [
        `It lowers blood pressure modestly, which matters alongside antihypertensives, and it interacts
         with lithium. Both are worth raising with a prescriber rather than managing alone.`]]
    ],
    basis: [
      ['Physiological roles',
        'Standard biochemistry; taurine is not incorporated into protein and acts on calcium handling, bile conjugation and inhibitory receptors'],
      ['Mouse lifespan and human correlation',
        'The 2023 report of taurine deficiency as a driver of ageing, Science, with murine intervention and human observational components'],
      ['Blood pressure effect',
        'Meta-analysed randomised trials reporting modest reductions'],
      ['Lithium interaction',
        'Noted in app.html’s own drawbacks entry']
    ],
    cta: `A supplement whose case rests on a correlation is one where your own before-and-after is
      worth recording carefully. TherapyLog keeps it.`
  },

  spermidine: {
    slug: 'spermidine',
    h1: 'Spermidine: an autophagy inducer you already eat, at amounts you probably do not',
    title: 'Spermidine: autophagy, diet and the evidence | TherapyLog',
    description: 'A polyamine that induces autophagy, found in wheat germ and aged cheese. What the epidemiology shows, and where the supplement case is thin.',
    lede: `One of the few longevity compounds with a real dietary route, a plausible mechanism and
      supporting epidemiology. Also one where the supplement amounts and the food amounts are close
      enough that the case for a capsule is less obvious than it looks.`,
    sections: [
      {
        h2: 'Autophagy, and why that is a different lever',
        paras: [
          `@@EV_ESTABLISHED@@ Spermidine is a polyamine present in every cell and abundant in wheat
          germ, soybeans, mushrooms and aged cheese. Its best-characterised action is induction of
          autophagy &mdash; the process by which a cell digests and recycles damaged proteins and
          organelles &mdash; largely by inhibiting the acetyltransferase EP300. Cellular polyamine
          content declines with age.`,
          `That places it alongside <a href="/compounds/rapamycin/">rapamycin</a> and caloric
          restriction as an autophagy-directed intervention, and distinguishes it from the
          senolytics, which remove cells rather than clean them. Whether inducing autophagy
          pharmacologically produces the benefits associated with it physiologically is the open
          question that hangs over all three.`,
          `@@EV_OFFLABEL@@ The human evidence is largely epidemiological: cohort studies have
          reported an association between higher dietary spermidine intake and lower all-cause and
          cardiovascular mortality. That is a genuine and repeated finding, and it is observational
          &mdash; higher spermidine intake tracks a dietary pattern, and the pattern may be doing
          the work.`
        ]
      },
      {
        h2: 'The supplement question',
        paras: [
          `@@EV_THEORETICAL@@ Small randomised trials of spermidine supplementation in older adults
          have looked at cognition and reported mixed results &mdash; one wheat-germ-extract trial
          found a signal in memory, a larger follow-up did not. That is the whole interventional
          base, and it does not currently support the claims made for it.`,
          `The amounts are also worth examining. Typical dietary intake in a European diet is
          roughly the same order as what supplements provide, which means the supplement is a
          modest addition rather than a categorical change. The app&rsquo;s own rows put dietary and
          supplement amounts side by side at one to five milligrams, which makes the point better
          than any argument.`,
          `That leads somewhere practical. If the epidemiology is about dietary pattern, and the
          supplement amount is comparable to food, then eating more of the foods is at least as
          defensible as buying a capsule and considerably cheaper. Wheat germ is the densest common
          source.`
        ]
      },
      {
        h2: 'What to watch',
        paras: [
          `Tolerability is good and there is no monitoring marker &mdash; the app records none, and
          nothing on a routine panel reflects autophagy. Assessment is subjective, over months.`,
          `@@EV_THEORETICAL@@ One caution belongs on the page. Polyamines are required by rapidly
          dividing cells, and polyamine metabolism is a target of interest in oncology for exactly
          that reason. Whether supplementing spermidine matters for someone with an existing
          malignancy is unknown in both directions, and it is a reasonable thing to raise with an
          oncologist rather than resolve from a label &mdash; the same reasoning the
          <a href="/compounds/nmn-and-nr/">NAD+ precursor page</a> carries.`,
          `Supplement status means content is the manufacturer&rsquo;s to guarantee, and this site
          names no brand. Fasting is described as potentiating the autophagy effect, which is
          mechanistically coherent and untested as a combination.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first item deserves a second look: if the
      effective amount is close to what food provides, the case for a capsule is weaker than the
      marketing.`,
    faq: [
      ['Can I just eat more of it?', [
        `Plausibly, yes. Typical dietary intake is in the same range as supplement doses, wheat germ is
         the densest common source, and the human evidence is mostly about dietary intake in the first
         place.`]],
      ['What did the trials show?', [
        `Mixed. A wheat-germ-extract trial in older adults found a memory signal; a larger follow-up did
         not. That is the whole interventional base.`]],
      ['How is it different from a senolytic?', [
        `Senolytics remove senescent cells; spermidine induces autophagy, which cleans up inside cells
         that remain. Different mechanisms and different evidence.`]],
      ['Is there a reason for caution with cancer?', [
        `Polyamines are required by rapidly dividing cells and polyamine metabolism is an oncology target,
         so the question is open in both directions. It is worth raising with an oncologist rather than
         settling from a supplement label.`]]
    ],
    basis: [
      ['Autophagy induction via EP300 inhibition',
        'Established in the polyamine and autophagy literature'],
      ['Dietary intake and mortality association',
        'Cohort studies reporting lower all-cause and cardiovascular mortality with higher intake; observational'],
      ['Interventional trials in older adults',
        'Small randomised trials of wheat germ extract with mixed cognitive results'],
      ['Polyamines in proliferating cells',
        'The basis for oncology interest in polyamine metabolism; no human evidence of harm either way']
    ],
    cta: `A compound assessed subjectively over months needs the months written down. TherapyLog
      keeps the dose and the notes together.`
  },

  thymalin: {
    slug: 'thymalin',
    h1: 'Thymalin: a thymic peptide complex, and the family of bioregulators it belongs to',
    title: 'Thymalin and the Khavinson bioregulators | TherapyLog',
    description: 'A thymus-derived peptide complex from the Russian bioregulator programme. What the mortality follow-up showed, and why it stands alone.',
    lede: `The most cited compound in a family of about a dozen that share a protocol, an evidence
      base and a single research lineage. This page covers the family as well as the compound,
      because the arguments for and against are the same for all of them.`,
    sections: [
      {
        h2: 'What the bioregulator family is',
        paras: [
          `@@EV_THEORETICAL@@ The Khavinson bioregulators are short peptide preparations, each
          derived from or modelled on a specific organ &mdash; thymus, pineal, vascular tissue,
          cartilage, bone marrow, lung &mdash; on the premise that each carries tissue-specific
          regulatory information and restores function in that organ. Thymalin is the thymic one;
          <a href="/compounds/epithalon/">epithalon</a> is the pineal one and the best known.`,
          `They share almost everything: a ten-day course repeated once or twice a year, an
          identical regulatory position, and a research base concentrated almost entirely in one
          programme. The app holds around a dozen of them and their entries differ mainly in which
          organ is named. That is the honest description, and it is why this site publishes two of
          them rather than twelve near-identical pages.`,
          `Thymalin itself is a polypeptide complex rather than a defined molecule, which the
          app&rsquo;s drawbacks list flags as a standardisation problem. That distinguishes it from
          the synthetic tetrapeptides in the same family and puts it closer to
          <a href="/compounds/cerebrolysin/">cerebrolysin</a> in kind.`
        ]
      },
      {
        h2: 'The thymus premise, and the mortality follow-up',
        paras: [
          `@@EV_ESTABLISHED@@ The biological starting point is real. The thymus involutes after
          puberty, output of naive T cells falls steadily, and that decline is a well-characterised
          component of immune ageing. Restoring thymic function is a legitimate target &mdash; other
          groups pursue it with growth hormone and with thymic transplantation.`,
          `@@EV_THEORETICAL@@ The finding most often cited for thymalin is a long-term follow-up of
          older adults reporting substantially reduced mortality in treated groups over a period of
          years. If that result were robust it would be among the most important findings in
          geroscience. The reasons to hold it loosely are the design &mdash; allocation, blinding and
          outcome ascertainment do not meet the standard a contemporary trial would be held to
          &mdash; and the concentration of the work in the group that produced it. Independent
          replication is what is missing rather than what has failed.`,
          `That combination, a large claimed effect from a single lineage with methodological
          limits, is the same situation the epithalon page describes. It is a reason for interest
          and not a basis for confidence.`
        ]
      },
      {
        h2: 'Practical position',
        paras: [
          `There is no approved product outside the country where the research was done, and what
          is available elsewhere is research-supply material with identity and purity resting on
          whoever made it &mdash; more so for a polypeptide complex than for a defined peptide,
          because there is less to verify against. This site names no vendor or testing service.`,
          `The app records a complete blood count with differential and infection frequency, which
          is a reasonable way to look for an immune effect and is not a validated marker of one.
          The app&rsquo;s own drawbacks list makes the useful observation that effects are most
          pronounced in older or immunocompromised people and subtle in the young and healthy
          &mdash; which is what a restorative intervention should look like, and also what a null
          result looks like in a group with nothing to restore.`,
          `Anyone with an autoimmune condition or on immunosuppressive therapy should treat a
          T-cell-directed compound as a conversation with the clinician managing that, as with
          <a href="/compounds/thymosin-alpha-1/">thymosin alpha-1</a>.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it is candid: limited Western replication and
      standardisation difficulty are the two things that constrain everything else here.`,
    faq: [
      ['Why does this site publish only two of the bioregulators?', [
        `Because their app entries differ mainly in which organ is named, and a dozen near-identical
         pages would be thin content by construction. Thymalin and epithalon are the two with distinct
         enough evidence and search interest to justify separate pages.`]],
      ['Is the mortality finding credible?', [
        `It is published and it comes from one research lineage, with a design that does not meet
         contemporary trial standards on allocation, blinding and outcome ascertainment. The effect size
         claimed is large enough that those limitations matter a great deal.`]],
      ['Is thymus decline real?', [
        `Yes — thymic involution and falling naive T-cell output are well-characterised parts of immune
         ageing. Whether this preparation reverses any of it is the separate question.`]],
      ['How does it compare with thymosin alpha-1?', [
        `Thymosin alpha-1 is a defined 28-amino-acid peptide with approvals in dozens of countries and
         hepatitis trial data behind it. Thymalin is an undefined polypeptide complex with a
         single-lineage evidence base. They are not equivalent.`]]
    ],
    basis: [
      ['Thymic involution and immune ageing',
        'Established immunology; naive T-cell output declines steadily after puberty'],
      ['Long-term mortality follow-up',
        'Published by the Russian bioregulator programme; design does not meet contemporary trial standards'],
      ['Family composition and shared protocol',
        'app.html holds around a dozen bioregulator entries sharing a ten-day pulse schedule and regulatory status'],
      ['Absence of pharmacokinetic data',
        'app.html holds no half-life or time-to-peak entry, which is why no such rows appear above']
    ],
    cta: `A ten-day course once or twice a year is the schedule nobody remembers the dates of.
      TherapyLog keeps them.`
  },

  'nad-iv': {
    slug: 'nad-iv',
    h1: 'NAD+ infusions: a much bigger spike, an infusion you have to sit through, and no outcome data',
    title: 'NAD+ IV: what the infusion actually does | TherapyLog',
    description: 'Intravenous NAD+ raises blood levels far above oral precursors. Why the infusion is uncomfortable, and what has never been demonstrated.',
    lede: `The expensive version of the NAD+ idea. It does produce concentrations the oral
      precursors cannot, and what that buys has never been measured against anything.`,
    sections: [
      {
        h2: 'A different pharmacokinetic problem',
        paras: [
          `@@EV_ESTABLISHED@@ Oral NMN and NR are precursors: they are absorbed and converted to
          NAD+ inside cells. Intravenous NAD+ delivers the coenzyme itself into the bloodstream,
          producing peak concentrations far above anything an oral dose reaches. That much is
          straightforward and is the whole rationale.`,
          `@@EV_THEORETICAL@@ The complication is that NAD+ is a large, charged molecule that does
          not readily cross cell membranes, and what happens to an infused dose is contested. Much
          of it is degraded extracellularly to nicotinamide and other metabolites, which are then
          taken up and re-synthesised &mdash; in other words, the infusion may work substantially as
          an expensive precursor after all. Whether intracellular NAD+ in the tissues people care
          about rises more from an infusion than from a capsule is not established.`,
          `The infusion has to be given slowly for a reason that is itself informative. Pushed
          quickly it reliably causes chest tightness, flushing, nausea and a feeling of pressure
          &mdash; rate-dependent effects that are the standard experience rather than a rare
          reaction, which is why a session takes hours.`
        ]
      },
      {
        h2: 'What has and has not been shown',
        paras: [
          `@@EV_OFFLABEL@@ The most substantive clinical use is in addiction and withdrawal, where
          NAD+ infusion protocols have been used for decades and studied in small trials with mixed
          results. There is also interest in neurodegenerative conditions and chronic fatigue. None
          of that amounts to an approval for anything, and the wellness use &mdash; energy,
          cognition, anti-ageing &mdash; has no controlled human evidence at all.`,
          `The oral comparison is the one worth making. Oral NMN and NR have placebo-controlled
          human trials demonstrating that blood NAD+ rises &mdash; a modest, verified biochemical
          effect. Intravenous NAD+ produces a much larger spike and has no comparable trial base for
          any outcome. Choosing the infusion is choosing a bigger biomarker change with less
          evidence behind it, at a hundred times the cost. The
          <a href="/compounds/nmn-and-nr/">oral precursor page</a> covers what that evidence
          actually says.`
        ]
      },
      {
        h2: 'The practical shape of it',
        paras: [
          `This is a clinic service rather than a compound someone doses at home: it needs
          intravenous access, hours of supervision, and it is expensive per session. The app&rsquo;s
          own drawbacks list leads with exactly those, and it is the only entry in this reference
          where the delivery is the main constraint. This site names no clinic and no provider.`,
          `There is no monitoring marker. The app records general wellness self-assessment and liver
          enzymes for frequent high-dose infusions, which is honest &mdash; nothing on a routine
          panel reflects this, and specialty NAD+ assays are not standardised well enough to follow
          a trend against.`,
          `@@EV_THEORETICAL@@ The same caution the oral page carries applies and applies more, since
          the concentrations are higher: NAD+ is required by proliferating cells, and anyone with a
          cancer history or under active surveillance has a reasonable question to put to an
          oncologist rather than to a clinic selling the infusion.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and it is unusually practical: the first three items
      are about the delivery rather than the molecule, which is a fair reflection of this one.`,
    faq: [
      ['Is an infusion better than oral NMN or NR?', [
        `It produces much higher blood concentrations. Whether that translates into more intracellular
         NAD+ where it matters is contested, and the oral precursors are the ones with placebo-controlled
         trials showing the biomarker moves. Bigger spike, less evidence.`]],
      ['Why does the infusion feel bad?', [
        `Chest tightness, flushing and nausea are rate-dependent and are the standard experience rather
         than a rare reaction. That is why a session is slow and takes hours.`]],
      ['Is it approved for anything?', [
        `No. It has been used in addiction and withdrawal protocols for decades with mixed small-trial
         results, and the wellness indications have no controlled human evidence.`]],
      ['Is there a test to see if it worked?', [
        `Not a usable one. Specialty NAD+ assays are not standardised well enough to follow a trend, and
         nothing on a standard panel reflects it.`]]
    ],
    basis: [
      ['Extracellular degradation and re-synthesis',
        'The NAD+ transport literature; the coenzyme does not readily cross cell membranes intact'],
      ['Oral precursor trial evidence',
        'Placebo-controlled trials of nicotinamide riboside and mononucleotide showing blood NAD+ rises'],
      ['Addiction and withdrawal use',
        'Small trials with mixed results; no approval for any indication'],
      ['Rate-dependent infusion effects',
        'Consistently reported and the reason infusions are given slowly']
    ],
    cta: `An expensive intermittent intervention with no marker is one where your own record is the
      only way to judge it. TherapyLog keeps the dates.`
  },
  humanin: {
    slug: 'humanin',
    h1: 'Humanin: found in a brain that resisted Alzheimer’s, and still mostly an observation',
    title: 'Humanin: a mitochondrial peptide, early | TherapyLog',
    description: 'A mitochondrially encoded peptide that correlates with longevity in centenarian studies. What that association supports, and what it does not.',
    lede: `Discovered by looking for whatever was protecting a brain that should have had
      Alzheimer&rsquo;s and did not. Twenty years on it is one of the better-characterised
      mitochondrial-derived peptides and still has no human intervention data.`,
    sections: [
      {
        h2: 'Where it came from and what it does',
        paras: [
          `@@EV_ESTABLISHED@@ Humanin is a 21 to 24 amino acid peptide encoded within the
          mitochondrial genome &mdash; not the nucleus &mdash; making it a member of the same class
          as <a href="/compounds/mots-c/">MOTS-c</a>. It was identified in 2001 from a cDNA library
          made from the surviving brain region of an Alzheimer&rsquo;s patient, screened for
          whatever was conferring resistance.`,
          `@@EV_THEORETICAL@@ Its characterised activity is anti-apoptotic: it interferes with the
          Bax pathway and with several other death signals, and it binds receptor complexes on the
          cell surface. Downstream, the reported effects are neuroprotection, improved insulin
          sensitivity, and protection against ischaemic and oxidative injury &mdash; a broad
          cytoprotective profile rather than one specific action.`,
          `Circulating humanin declines with age, and studies in centenarians and their offspring
          have reported higher levels than in age-matched controls. That association is the source
          of most of the longevity interest.`
        ]
      },
      {
        h2: 'What the association can and cannot support',
        paras: [
          `@@EV_THEORETICAL@@ There is no published randomised controlled trial of administering
          humanin to people, for any indication. Nor is there published human pharmacokinetics for
          the material in circulation, which is why the fact box above carries no rows for it.`,
          `The centenarian finding is worth reading carefully, because it is doing most of the
          persuasive work and it is the weakest kind of evidence for an intervention. Higher humanin
          in people who lived longer is consistent with humanin protecting them, and equally
          consistent with it being a readout of mitochondrial health that healthier people have more
          of. Administering a marker does not necessarily produce the state it marks &mdash; the
          same problem the MOTS-c page describes, and the reason both compounds sit at the same
          early stage despite twenty years of interest.`,
          `The app&rsquo;s own drawbacks list leads with "very early clinical stage" and "limited
          human dosing data", which is the accurate summary and unusually restrained for a compound
          with this much enthusiasm behind it.`
        ]
      },
      {
        h2: 'The practical position',
        paras: [
          `There is no approved product and no reference standard. Identity and purity rest entirely
          with whoever made the vial, and this site names no vendor or testing service. It is also
          expensive and difficult to source, which the app notes.`,
          `The app records fasting glucose and HbA1c alongside cognitive self-assessment &mdash;
          reasonable given the insulin-sensitivity findings, and not a marker of whether the
          compound is doing anything. The <a href="/markers/hba1c-and-fasting-glucose/">HbA1c
          page</a> covers why those two markers can disagree.`,
          `The reasonable position is real and interesting biology at a stage where nobody can say
          what administering it does to a person over months. Anyone using it is generating the only
          data that exists about it, and anyone with a metabolic or neurological condition should be
          raising it with the clinician managing that.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the first two items are the whole page: very
      early stage, limited human data.`,
    faq: [
      ['Is there human trial data?', [
        `No published randomised trial for any indication, and no published human pharmacokinetics for the
         material people are using.`]],
      ['What does the centenarian finding show?', [
        `That people who lived a long time have higher circulating humanin than age-matched controls. That
         is consistent with it protecting them and equally consistent with it being a readout of
         mitochondrial health rather than a cause of it.`]],
      ['How does it relate to MOTS-c?', [
        `Same class — both encoded in mitochondrial DNA rather than the nucleus — and both at the same early
         evidence stage. Their reported activities differ: humanin is characterised as anti-apoptotic and
         cytoprotective, MOTS-c as metabolic.`]],
      ['Why is there no half-life in the fact box?', [
        `Because none has been published for the material in circulation, so the app holds none.`]]
    ],
    basis: [
      ['Discovery and mitochondrial encoding',
        'Identified in 2001 from a cDNA library of a surviving brain region in Alzheimer’s disease'],
      ['Anti-apoptotic and cytoprotective activity',
        'Cell and animal work characterising interference with Bax and related death pathways'],
      ['Centenarian association',
        'Observational studies reporting higher circulating levels in long-lived individuals and their offspring'],
      ['Absence of pharmacokinetic and trial data',
        'No published randomised trial or human pharmacokinetic study exists as of this review date']
    ],
    cta: `At this stage of evidence your own dated record is the entire dataset. TherapyLog keeps it
      beside the metabolic panel.`
  },

  ll37: {
    slug: 'll-37',
    h1: 'LL-37: the body’s own antimicrobial peptide, and why injecting it is not obviously a good idea',
    title: 'LL-37: antimicrobial peptide, both directions | TherapyLog',
    description: 'The only human cathelicidin, with real innate-immune roles and a documented double-edged relationship with autoimmunity.',
    lede: `Genuine innate immunity, well characterised, made by your own cells and dependent on
      vitamin D. It also has a documented role in driving autoimmune inflammation, which is the part
      that rarely accompanies the enthusiasm.`,
    sections: [
      {
        h2: 'What it is and what it does',
        paras: [
          `@@EV_ESTABLISHED@@ LL-37 is the active fragment of hCAP18, the only cathelicidin humans
          make. It is produced by neutrophils, macrophages and epithelial surfaces, and it disrupts
          bacterial membranes directly, neutralises endotoxin, and acts as a signalling molecule
          &mdash; recruiting immune cells, promoting wound repair, and interfering with biofilms.
          That is textbook innate immunity rather than a claim.`,
          `@@EV_ESTABLISHED@@ Its production is directly vitamin D dependent: the gene carries a
          vitamin D response element, and cathelicidin expression falls when vitamin D is low. That
          is a real and well-established link, and it is the single most actionable thing on this
          page &mdash; a person with low vitamin D and an interest in LL-37 has a cheaper, safer and
          better-evidenced route to raising it. The <a href="/markers/vitamin-d/">vitamin D page</a>
          covers how the number is read and why the optimal band is contested.`
        ]
      },
      {
        h2: 'The double edge',
        paras: [
          `@@EV_ESTABLISHED@@ LL-37 is not simply protective. In psoriasis it complexes with
          self-DNA and self-RNA and drives plasmacytoid dendritic cells to produce interferon, which
          is a core mechanism of the disease; it is a recognised autoantigen in psoriasis and has
          been implicated in lupus, rheumatoid arthritis and atherosclerosis. Elevated cathelicidin
          is a feature of several inflammatory conditions rather than a marker of good defence.`,
          `That is why the app&rsquo;s drawbacks list says it may exacerbate autoimmune conditions,
          and it is a stronger caution than that phrasing suggests. Administering more of a peptide
          that is part of the pathogenic mechanism in psoriasis, to someone with psoriasis, is not a
          neutral act. Anyone with an autoimmune or autoinflammatory diagnosis should treat this as
          a conversation with the clinician managing it rather than a supplement decision.`,
          `@@EV_THEORETICAL@@ Local injection-site inflammation is the common practical effect and
          follows from the same biology &mdash; it is an inflammatory mediator, so injecting it
          inflames things.`
        ]
      },
      {
        h2: 'Evidence and sourcing',
        paras: [
          `@@EV_THEORETICAL@@ There is no published randomised trial of systemic LL-37 for any
          indication. Topical work in wound healing exists and is more advanced; the systemic use is
          extrapolation. The app records no half-life, because none has been published, which is why
          the fact box carries no pharmacokinetic rows.`,
          `There is also a delivery problem intrinsic to the molecule: peptides of this kind are
          degraded quickly and bind serum proteins, so how much of an injected dose reaches anywhere
          useful in an active form is unknown.`,
          `No approved product, so identity and purity rest with whoever made the vial. The
          app&rsquo;s panel &mdash; complete blood count, vitamin D, CRP &mdash; is sensible, and
          vitamin D is on it for the reason above rather than as a formality. This site names no
          vendor.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry, and the autoimmune item deserves more weight than its
      position gives it — this peptide is part of the disease mechanism in psoriasis.`,
    faq: [
      ['Is vitamin D a better route to raising it?', [
        `For most people, yes. Cathelicidin expression is directly vitamin D dependent, and correcting a
         low vitamin D is cheaper, safer and far better evidenced than injecting the peptide.`]],
      ['Why would an antimicrobial peptide be a problem in autoimmunity?', [
        `Because in psoriasis it complexes with self-nucleic acids and drives interferon production — it is
         a recognised autoantigen there, and it has been implicated in lupus and rheumatoid arthritis.
         More of it is not obviously better.`]],
      ['Is there trial evidence for injecting it?', [
        `None published for systemic use. Topical wound-healing work is further along, and the systemic use
         is extrapolation from it and from the basic immunology.`]],
      ['Why does the injection site react?', [
        `Because it is an inflammatory signalling molecule as well as an antimicrobial one. Local
         inflammation is the mechanism working, not an impurity.`]]
    ],
    basis: [
      ['Cathelicidin structure and innate immune function',
        'Standard immunology; LL-37 is the only human cathelicidin'],
      ['Vitamin D dependence',
        'The cathelicidin gene carries a vitamin D response element; expression falls with deficiency'],
      ['Role in psoriasis and autoimmunity',
        'Established in the psoriasis literature as a self-nucleic-acid complexing autoantigen driving interferon production'],
      ['Absence of systemic trial and pharmacokinetic data',
        'No published randomised trial of systemic administration; app.html holds no half-life entry']
    ],
    cta: `A peptide whose effect depends on what is already inflamed is one to log alongside the
      symptoms. TherapyLog keeps both.`
  },
  larazotide: {
    slug: 'larazotide',
    h1: 'Larazotide: a zonulin antagonist that reached phase IIb and stopped there',
    title: 'Larazotide: the tight junction peptide | TherapyLog',
    description: 'An oral peptide that blocks the zonulin pathway, tested in celiac disease through phase IIb. What the trials measured and why it has not been approved.',
    lede: `Most peptides discussed for gut health have never been in a controlled human trial.
      Larazotide has been in several, in a real patient population, with a real endpoint &mdash;
      and it still is not approved. The gap between those two facts is the useful part of this
      page.`,
    sections: [
      {
        h2: 'Zonulin, tight junctions and a specific mechanism',
        paras: [
          `@@EV_ESTABLISHED@@ The cells lining the small intestine are sealed to one another by
          tight junctions, protein complexes that decide what crosses between cells rather than
          through them. Zonulin is a signalling protein that loosens those junctions. In celiac
          disease, gluten fragments trigger zonulin release, permeability rises, and immunogenic
          peptides reach the tissue underneath. Larazotide is an eight-amino-acid peptide that
          antagonises that pathway, and it is designed to act in the gut lumen rather than
          systemically.`,
          `That is a narrower and better-specified mechanism than most of this category offers. It
          is worth contrasting with <a href="/compounds/bpc-157/">BPC-157</a>, which is discussed
          for gut repair on the basis of animal healing models and has no human trial data at all.
          Larazotide targets one protein interaction and was tested against a clinical endpoint;
          BPC-157 is a broader claim with a thinner base. The app&rsquo;s own notes put them
          together as complementary, and the honest version of that is that one of them has been
          measured in patients.`,
          `Because the peptide is meant to work at the epithelial surface, systemic absorption is
          low by design. That is a deliberate feature, not a limitation, and it explains why the
          route is oral rather than injected.`
        ]
      },
      {
        h2: 'What the trials actually found',
        paras: [
          `@@EV_OFFLABEL@@ Larazotide has been through phase II trials in celiac disease in patients
          already following a gluten-free diet but still symptomatic. A phase IIb study reported a
          reduction in symptom scores at the lowest of the doses tested, with the higher doses
          performing no better &mdash; an inverted dose response that the investigators discussed
          openly and that is unusual enough to be worth stating plainly.`,
          `A phase III trial was subsequently begun and was discontinued after an interim analysis
          indicated it was unlikely to meet its primary endpoint. That is the most important
          sentence on this page, and it is the one that marketing copy for the peptide tends to
          omit. Phase IIb data is a reason to keep studying a compound; it is not evidence of
          benefit, and here the larger, better-powered study did not confirm it.`,
          `@@EV_THEORETICAL@@ Uses outside celiac disease &mdash; irritable bowel syndrome,
          non-alcoholic steatohepatitis, the broad idea of &ldquo;leaky gut&rdquo; as a driver of
          systemic disease &mdash; rest on the mechanism rather than on outcome data. Intestinal
          permeability is measurable and is genuinely abnormal in several conditions. Whether
          reducing it changes how a person feels is a separate question, and outside celiac disease
          it has not been answered.`
        ]
      },
      {
        h2: 'What to watch, and what there is to watch with',
        paras: [
          `The app records symptom tracking, inflammatory markers and zonulin levels through
          specialty laboratories. Serum zonulin assays are worth a caution: the commercial tests
          have been criticised for measuring proteins other than the intended target, so a number
          from one is weaker evidence than it appears. Symptom scores kept consistently over weeks
          are the more defensible measurement here.`,
          `Tolerability across the trials was broadly comparable to placebo, with gastrointestinal
          complaints the most commonly reported events on both arms. That is a reassuring profile
          within a trial population and a defined duration, and it says nothing about use for
          longer than the twelve weeks studied. Anyone with celiac disease considering this should
          be discussing it with the gastroenterologist already managing the diagnosis, not
          substituting it for the gluten-free diet the trials required participants to stay on.`,
          `@@EV_ESTABLISHED@@ Sourcing is a real constraint. The compound is an investigational drug
          under an IND, not a supplement, so material sold outside that framework is not the trial
          product and no one has verified that it is the same molecule at the same purity. This
          site names no vendor and this page does not tell you where to get it.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first line understates the position &mdash; the
      phase III programme was stopped early, which is more than an absence of approval.`,
    faq: [
      ['Is larazotide approved anywhere?', [
        `No. It has been through phase II trials in celiac disease and a phase III trial that was
         discontinued at interim analysis. It has no marketing approval in any jurisdiction.`]],
      ['Does it replace a gluten-free diet?', [
        `Nothing in the trial programme supports that. Participants remained on a gluten-free diet
         throughout; the peptide was studied as an addition for people who were still symptomatic
         despite the diet.`]],
      ['Is it the same idea as BPC-157?', [
        `No. Larazotide antagonises one signalling pathway at the tight junction and was tested against
         a clinical endpoint in patients. BPC-157 is a broad tissue-repair claim resting on animal
         models with no human trials.`]],
      ['Can I test my own zonulin?', [
        `Specialty laboratories offer it, and the assays have been criticised for cross-reactivity with
         other proteins. Treat a result as suggestive at best, and take a consistent symptom record more
         seriously than a single number.`]]
    ],
    basis: [
      ['Zonulin regulates intestinal tight junctions',
        'Established mechanism in gastrointestinal physiology'],
      ['Phase IIb symptom reduction in celiac disease',
        'Randomised trial in diet-adherent symptomatic patients; benefit at the lowest dose tested'],
      ['Phase III discontinued at interim analysis',
        'Sponsor announcement of futility; the confirmatory evidence does not exist'],
      ['Use for IBS, NASH or general permeability',
        'Mechanistic extrapolation only; no completed outcome trials'],
      ['Oral route with low systemic absorption',
        'By design; the target is at the luminal surface']
    ],
    cta: `A compound assessed on symptom scores needs the symptoms written down consistently.
      TherapyLog keeps the dose and the daily record in one place.`
  },
  slupp332: {
    slug: 'slu-pp-332',
    h1: 'SLU-PP-332: an exercise mimetic with no human data whatsoever',
    title: 'SLU-PP-332: the exercise mimetic, examined | TherapyLog',
    description: 'A pan-ERR agonist that reproduced endurance-training effects in mice. Why there is no human dose, and what the rodent results do and do not show.',
    lede: `This page exists to describe a compound accurately rather than to help anyone use it.
      Every published result comes from rodents, no human has been dosed in a study, and there is
      no dose to report. That is the whole picture, and it is worth understanding as an example of
      how early a compound can be while still circulating.`,
    sections: [
      {
        h2: 'What a pan-ERR agonist does',
        paras: [
          `@@EV_ESTABLISHED@@ The estrogen-related receptors &mdash; ERR&alpha;, ERR&beta; and
          ERR&gamma; &mdash; are nuclear receptors that, despite the name, are not activated by
          oestrogen. They regulate mitochondrial biogenesis, oxidative metabolism and the
          expression programme that endurance training switches on in skeletal muscle. That
          biology is well established and independent of any particular drug.`,
          `SLU-PP-332 is a synthetic agonist at all three. The reasoning behind it is direct: if
          endurance exercise produces its metabolic adaptations partly through this pathway, an
          agonist might reproduce some of them. The term &ldquo;exercise mimetic&rdquo; describes
          that intent, and it is an intent rather than a demonstrated result.`,
          `@@EV_THEORETICAL@@ In published mouse work the compound increased fatty-acid oxidation,
          extended running capacity on a treadmill and reduced fat mass without a change in food
          intake or in voluntary activity. Those are real, reported findings in mice. Half-life in
          the rodent data is short, on the order of a couple of hours, which is one of several
          reasons a human schedule cannot be inferred from them.`
        ]
      },
      {
        h2: 'Why there is no dose on this page',
        paras: [
          `@@EV_THEORETICAL@@ The app&rsquo;s own entry records no established human dose, and this
          page does not invent one. No phase I study has been published, so nothing is known about
          human pharmacokinetics, tolerated exposure, or which of the rodent effects translate.
          Interspecies scaling from a mouse dose is a method for designing a first-in-human study,
          not for choosing what to take.`,
          `The gap matters more here than it would for a compound with a long clinical history in a
          different indication. Nuclear receptor agonists act by changing gene expression across
          many tissues, and the receptors here are expressed in heart, kidney and liver as well as
          in skeletal muscle. A compound that shifts the oxidative programme everywhere is not
          obviously benign because the muscle result looked good, and cardiac effects in particular
          are the sort of thing a phase I study exists to detect.`,
          `It is also worth naming what a research chemical is. Material sold under this name has
          not been through any pharmaceutical quality process, identity and purity rest on the
          seller&rsquo;s own certificate, and there is no regulator between that certificate and
          the buyer. This site names no vendor.`
        ]
      },
      {
        h2: 'The comparison that actually matters',
        paras: [
          `Endurance exercise is the intervention this compound is named after, and it has outcome
          data no drug in this class approaches: reduced cardiovascular and all-cause mortality
          across large cohorts and randomised trials of structured training. Whatever an exercise
          mimetic eventually turns out to do, it starts from a long way behind that.`,
          `@@EV_OFFLABEL@@ For fat loss specifically, there are compounds with human trial evidence
          and approvals &mdash; the <a href="/compounds/semaglutide/">GLP-1 receptor agonists</a>
          are the obvious point of contrast, with cardiovascular outcome data behind them. Someone
          reaching for a preclinical research compound for body composition is choosing the option
          with the least evidence available for that goal.`,
          `There is no monitoring protocol to offer, because nobody has established what to monitor
          or what a concerning value would be. The app records exactly that, and it is the correct
          entry. Anyone weighing a compound at this stage should be having that conversation with a
          doctor who can see the rest of their picture.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. Read the last item as the summary rather than an
      afterthought.`,
    faq: [
      ['Has any person taken this in a study?', [
        `No published human study exists. Everything reported comes from rodent work, and no phase I
         data has appeared.`]],
      ['What dose do people use?', [
        `This page does not carry one, because there is no established human dose to carry. The app records
         the same. A dose scaled from mouse data is a hypothesis for a trial, not a protocol.`]],
      ['Does it replace cardio?', [
        `No. The compound reproduced some metabolic markers of endurance training in mice. Endurance
         exercise has mortality and cardiovascular outcome data behind it that nothing in this class
         approaches.`]],
      ['What should be monitored?', [
        `Nothing has been established, which is itself the answer. There are no reference values, no known
         signal to watch, and no way to tell an expected effect from an adverse one.`]]
    ],
    basis: [
      ['ERR receptors regulate oxidative metabolism',
        'Established nuclear receptor biology, independent of this compound'],
      ['Increased fat oxidation and running capacity',
        'Rodent studies; no human replication'],
      ['Fat loss without change in intake or activity',
        'Reported in mouse models only'],
      ['Human dose and safety',
        'No published phase I data; app.html records no established dose'],
      ['Endurance exercise outcomes',
        'Large cohort and randomised training data; the comparison the name invites']
    ],
    cta: `If you are tracking anything at this stage, track it carefully. TherapyLog keeps the
      record, whatever the compound turns out to be worth.`
  },
  follistatin: {
    slug: 'follistatin',
    h1: 'Follistatin: myostatin inhibition, and the distance between gene therapy and a vial',
    title: 'Follistatin: myostatin inhibition examined | TherapyLog',
    description: 'A myostatin-binding glycoprotein studied mostly as gene therapy. What the muscular dystrophy trials delivered, and why an injected peptide is not that.',
    lede: `The myostatin story is real biology with striking animal results and a genuine clinical
      programme behind it. What is sold as follistatin is not what that programme delivered, and
      the difference is not a technicality &mdash; it changes what can be expected and what is
      known about risk.`,
    sections: [
      {
        h2: 'The brake, and what removing it does',
        paras: [
          `@@EV_ESTABLISHED@@ Myostatin, also called GDF-8, is a member of the TGF-&beta; family
          that limits skeletal muscle growth. Animals and the small number of people with loss-of-
          function mutations in the myostatin gene have substantially more muscle mass than
          expected. Follistatin is an endogenous glycoprotein that binds myostatin and activin and
          neutralises them, which removes that brake. All of that is settled biology.`,
          `Because it works through a pathway entirely separate from the androgen receptor, it does
          not carry the mechanism behind the androgenic effects or the suppression of the
          hypothalamic-pituitary-testicular axis that
          <a href="/compounds/testosterone-cypionate/">testosterone</a> does. That is a real
          mechanistic distinction and it is often presented as though it also implies a better
          safety profile. It does not. It means the risks are different ones, and less well
          characterised.`,
          `@@EV_OFFLABEL@@ The clinical work has been almost entirely gene therapy: a viral vector
          delivering the follistatin gene to muscle, studied in Becker and inclusion body myositis
          in small early-phase trials. Those studies reported functional changes in some
          participants and are the strongest human evidence the molecule has. They also delivered
          sustained local expression inside muscle tissue &mdash; a fundamentally different
          exposure from an injected peptide.`
        ]
      },
      {
        h2: 'Why the injected version is a different question',
        paras: [
          `@@EV_THEORETICAL@@ Follistatin is a glycoprotein, not a small peptide, and circulating
          follistatin is cleared quickly. Whether a subcutaneous injection produces meaningful
          myostatin neutralisation in muscle, at what exposure, and for how long, has not been
          established in humans. The app records a research protocol of 100mcg daily in short
          runs with breaks; that figure comes from community practice rather than from a trial,
          and this page presents it as the app&rsquo;s entry rather than as a recommendation.`,
          `The pharmaceutical industry has also tested this pathway directly, with monoclonal
          antibodies and receptor decoys against myostatin and activin in muscular dystrophy,
          sarcopenia and cachexia. Several increased lean mass. Most failed to improve function,
          and the programmes were largely discontinued. That is the most instructive result in the
          whole field: the pathway does what it is supposed to do to muscle size, and size did not
          translate into people doing more.`,
          `Product identity is a further problem specific to this compound. Recombinant
          glycoproteins are difficult and expensive to manufacture correctly, glycosylation affects
          activity, and there is no way for a buyer to confirm any of it. This site names no
          vendor.`
        ]
      },
      {
        h2: 'Risks worth taking seriously',
        paras: [
          `@@EV_THEORETICAL@@ The concern the app records first is the right one. Myostatin and
          activin signalling participates in growth restraint in tissues beyond muscle, and
          activin signalling has tumour-suppressive roles in several cell types. Whether systemic
          inhibition affects cancer risk in humans is unknown, and unknown here means untested
          rather than reassuring. Anyone with a personal or family history of malignancy should
          treat that as a conversation with an oncologist rather than a footnote.`,
          `The antibody trials also surfaced effects that had not been predicted from the muscle
          story, including reports of gynaecomastia and epistaxis attributed to off-target
          activity within the TGF-&beta; family. A pathway this central rarely turns out to have a
          single consequence.`,
          `Monitoring, per the app, is body composition, liver enzymes, a complete blood count and
          general cancer screening awareness. Note what that list cannot do: none of those tests
          detects the theoretical risk this compound carries. They are the reasonable general
          panel, not a safety net, and the appropriate step before any of it is a discussion with
          a doctor who knows your history.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The cancer item is not a disclaimer added for form
      &mdash; it is the reason the pharmaceutical programmes were watched as closely as they were.`,
    faq: [
      ['Is follistatin approved for anything?', [
        `No. Gene therapy approaches have been studied in small early-phase muscular dystrophy trials.
         There is no approved follistatin product and no approved myostatin inhibitor for muscle growth.`]],
      ['Do the gene therapy results apply to an injection?', [
        `Not directly. Those trials delivered a gene to muscle tissue for sustained local expression. An
         injected glycoprotein that clears from circulation quickly is a different exposure, and it has
         not been studied the same way.`]],
      ['Why did the pharmaceutical myostatin programmes stop?', [
        `Several increased lean mass without improving function in the populations studied, which is not
         enough to approve a drug. The pathway worked; the outcome did not follow.`]],
      ['What about the cancer concern?', [
        `Activin and myostatin signalling has growth-restraining roles outside muscle, so systemic
         inhibition raises a theoretical question that no human study has answered. It is worth raising
         with a doctor, particularly with any personal or family cancer history.`]]
    ],
    basis: [
      ['Myostatin limits skeletal muscle growth',
        'Established; supported by loss-of-function phenotypes in animals and humans'],
      ['Follistatin binds and neutralises myostatin and activin',
        'Established biochemistry'],
      ['Gene therapy trials in muscular dystrophy',
        'Small early-phase studies reporting functional change; the strongest human data'],
      ['Injected peptide protocols',
        'Community practice; app.html records 100mcg daily in short runs, with no trial behind it'],
      ['Lean mass without functional benefit',
        'Repeated finding across discontinued myostatin and activin antibody programmes'],
      ['Cancer risk from systemic inhibition',
        'Theoretical, from tumour-suppressive roles of activin signalling; untested in humans']
    ],
    cta: `A compound with no validated marker needs an unusually careful record of everything else.
      TherapyLog keeps the dose, the measurements and the notes together.`
  },
  dihexa: {
    slug: 'dihexa',
    h1: 'Dihexa: the potency figure everyone quotes, and what it was measured against',
    title: 'Dihexa: potency, synapses and open questions | TherapyLog',
    description: 'An angiotensin IV derivative and HGF agonist. Where the widely quoted potency figure comes from, and why it is not a claim about people.',
    lede: `Almost every description of this compound leads with a number in the millions. The number
      is real and it comes from a published experiment, but it describes a specific measurement in
      cell culture rather than anything observed in a person. Understanding what was measured is
      most of what there is to understand here.`,
    sections: [
      {
        h2: 'Where the compound came from',
        paras: [
          `@@EV_ESTABLISHED@@ Dihexa is a small synthetic molecule derived from angiotensin IV,
          developed in academic laboratories at Washington State University. Angiotensin IV had been
          observed to improve performance in rodent memory tasks, and the derivative was built to
          survive metabolism, cross into the brain and retain the activity. Its proposed mechanism
          is potentiation of hepatocyte growth factor signalling at its receptor, c-Met, which is
          involved in synapse formation.`,
          `@@EV_THEORETICAL@@ The potency figure comes from a cell-culture assay of spine and synapse
          formation, in which the concentration producing an effect was compared with that of brain-
          derived neurotrophic factor in the same system. A ratio between two concentrations in a
          dish is a statement about relative potency in that assay. It is not a statement about
          effect size, about the brain, or about anyone&rsquo;s memory, and it is quoted as though
          it were all three.`,
          `The animal work is more informative and still preclinical: improvement on water-maze
          performance in rodent models of cognitive impairment, including scopolamine-induced
          deficits and lesion models. That is a real body of published work. It is the same stage
          at which a great many compounds have looked convincing and then not translated.`
        ]
      },
      {
        h2: 'The human gap, and the dose problem',
        paras: [
          `@@EV_THEORETICAL@@ No published controlled human trial exists. The app records a research
          range of 1&ndash;10mg by oral or intranasal route in short runs, which reflects community
          practice rather than a study, and the tenfold width of that range is itself informative:
          nobody knows what the right amount is because nobody has measured it in a person.`,
          `That width matters more than usual for this compound. A molecule described as extremely
          potent, dosed in milligrams by a route with variable absorption, gives no basis for
          judging whether an effect or an absence of one reflects the compound or the delivery.
          Intranasal and oral administration of the same substance are not interchangeable, and no
          bioavailability data settles which the range refers to.`,
          `Assessment is a further problem. The app records cognitive and mood self-assessment and
          no blood monitoring, which is accurate &mdash; there is no marker. Self-assessed cognition
          is the measurement most vulnerable to expectation in the whole of this field, and it is
          the only one available here. A structured, timed task repeated on the same schedule is
          weak evidence but is better than a recollection.`
        ]
      },
      {
        h2: 'The risk that follows from the mechanism',
        paras: [
          `@@EV_THEORETICAL@@ The HGF/c-Met axis is not a neurological curiosity. It is a growth
          factor pathway that is amplified or activated in several cancers, and it is an active
          oncology drug target &mdash; approved medicines exist that inhibit c-Met precisely
          because that signalling drives tumour growth. A compound designed to potentiate the same
          axis raises an obvious question in the opposite direction, and no human data addresses
          it.`,
          `The app lists this among the drawbacks and it deserves the emphasis. There is no test
          that would detect the concern, no dose known to be below it, and no duration established
          as safe. This is the reason the page carries no recommendation and the reason anyone
          considering it, particularly with any personal or family cancer history, should be
          raising it with a doctor first.`,
          `Compared with the other compounds on this site discussed for cognition &mdash;
          <a href="/compounds/semax/">semax</a> and <a href="/compounds/cerebrolysin/">cerebrolysin</a>
          both have decades of human use and published trials in their countries of origin, whatever
          the quality of those trials &mdash; dihexa is earlier by a wide margin. It is a
          preclinical academic compound, and material sold under the name comes with no verified
          identity. This site names no vendor.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The tumour item and the dosing-accuracy item are
      connected: an extremely potent compound with no established range is hard to keep below a
      threshold nobody has located.`,
    faq: [
      ['Is dihexa really millions of times stronger than BDNF?', [
        `That ratio comes from a cell-culture assay comparing the concentrations at which each promoted
         synapse formation. It describes relative potency in that dish, not the size of any effect and
         not anything measured in a person.`]],
      ['Are there human trials?', [
        `No published controlled trial exists. The evidence is preclinical: cell culture and rodent
         cognition models.`]],
      ['Oral or intranasal?', [
        `The app records both within one range, and no bioavailability data distinguishes them. That is a
         reason for caution rather than a choice this page can resolve.`]],
      ['What is the cancer concern?', [
        `The compound potentiates HGF/c-Met signalling. That pathway drives growth in several cancers and
         is the target of approved inhibitors. Potentiating it has not been studied in humans, and it is
         a question for a doctor rather than a message board.`]]
    ],
    basis: [
      ['Derived from angiotensin IV; acts on HGF/c-Met',
        'Published academic characterisation'],
      ['The potency ratio versus BDNF',
        'Cell-culture synaptogenesis assay; a concentration comparison, not an effect size'],
      ['Cognitive improvement in animal models',
        'Rodent water-maze and lesion studies; preclinical'],
      ['Human dose of 1-10mg',
        'Community practice recorded in app.html; no pharmacokinetic or trial basis'],
      ['Tumour growth concern',
        'c-Met is an established oncology target; potentiation untested in humans'],
      ['No monitoring marker',
        'app.html records self-assessment only; no blood test reflects the mechanism']
    ],
    cta: `Self-assessed cognition is the easiest measurement to fool yourself with. TherapyLog keeps
      a dated record so you are comparing notes rather than impressions.`
  },
  insulin: {
    slug: 'insulin',
    h1: 'Insulin: the one compound here where a mistake can kill you the same afternoon',
    title: 'Insulin: what it does and what it costs | TherapyLog',
    description: 'The hormone every metabolic compound here is ultimately about, and the one practice in bodybuilding with a same-day fatal failure mode.',
    lede: `This page exists because people use insulin for physique goals and because the
      information they find is usually written either by someone selling a protocol or by someone
      who will not discuss it at all. Neither helps. What follows is what the hormone does, what
      the evidence for the non-medical use actually is, and what the failure mode looks like &mdash;
      in enough detail to make a decision with.`,
    sections: [
      {
        h2: 'What insulin does',
        paras: [
          `@@EV_ESTABLISHED@@ Insulin is a 51-amino-acid peptide hormone made by the beta cells of
          the pancreas. Its central job is to move things out of the bloodstream and into cells:
          glucose, amino acids and potassium. It switches the body from breaking fuel down to
          storing it &mdash; glycogen synthesis up, gluconeogenesis down, lipolysis suppressed,
          protein synthesis supported. It has been in clinical use since 1922 and there is no
          hormone in medicine that is better characterised.`,
          `Injected insulin replaces or supplements that signal. In type 1 diabetes it is not a
          treatment but a requirement, and in type 2 it is added when other agents stop holding the
          line. Products differ mainly in timing: rapid-acting analogues (lispro, aspart) begin
          working within about fifteen minutes and are finished in a few hours; regular human
          insulin is slower on both ends; long-acting analogues (glargine, degludec) are designed
          to sit flat across a day or more. That difference in timing is the whole safety picture,
          which is why this page carries no single half-life figure &mdash; the number depends
          entirely on which product is in the vial.`,
          `Everything else in this site&rsquo;s metabolic section is, in one way or another, about
          this hormone. <a href="/compounds/metformin/">Metformin</a> reduces hepatic glucose
          output and improves sensitivity to it. The
          <a href="/compounds/semaglutide/">GLP-1 agonists</a> amplify the body&rsquo;s own
          glucose-dependent insulin release. <a href="/compounds/berberine/">Berberine</a> and
          <a href="/compounds/acarbose/">acarbose</a> blunt the glucose load that provokes it.
          Insulin is the only one that bypasses the regulation entirely, and that is exactly what
          makes it different.`
        ]
      },
      {
        h2: 'Why it appears in bodybuilding, and what the evidence is',
        paras: [
          `@@EV_THEORETICAL@@ The physique rationale is nutrient partitioning: insulin drives
          glucose and amino acids into muscle, so administering it around training or around a
          large carbohydrate feed is supposed to fill glycogen faster and improve the anabolic
          response. It is usually described alongside growth hormone, on the reasoning that growth
          hormone raises glucose and insulin lowers it. At the top of the sport this is an open
          practice rather than a rumour.`,
          `The evidence for benefit in a healthy, well-fed, resistance-trained person is not
          weak &mdash; it is absent. There are no controlled trials of insulin for muscle gain or
          body composition in non-diabetic athletes, and there is no realistic prospect of one,
          because no ethics committee will approve deliberately inducing hypoglycaemia in healthy
          volunteers for a physique endpoint. What exists is mechanism, case series and the
          testimony of people with a reason to be believed and a reason not to be.`,
          `There is a specific reason to be sceptical of the mechanism as applied. In a person who
          is eating enough, training hard and already on supraphysiologic androgens, muscle protein
          synthesis is not obviously insulin-limited &mdash; the studies that separate insulin&rsquo;s
          effect from amino acid availability generally find that insulin permits protein synthesis
          rather than driving it, and that ordinary post-meal levels are enough to saturate that
          permission. Much of the visible change people attribute to it is glycogen and the water
          that comes with glycogen, which is real, and is not the same thing as tissue.`,
          `@@EV_ESTABLISHED@@ What is not in doubt is that insulin promotes fat storage with the
          same enthusiasm it promotes glycogen storage. It does not select for the outcome anyone
          wants.`
        ]
      },
      {
        h2: 'The failure mode',
        paras: [
          `@@EV_ESTABLISHED@@ Hypoglycaemia is not a side effect of insulin in the way that nausea
          is a side effect of a GLP-1. It is the same action, taken further than intended. Every
          other compound on this site has a risk profile you would notice over weeks or months and
          could act on. This one has a risk that can begin within twenty minutes and be
          irreversible within an hour.`,
          `The sequence is consistent. Early: sweating, tremor, a racing heart, hunger, anxiety
          &mdash; the adrenaline response to a falling glucose. Then the brain runs short:
          confusion, slurred speech, poor judgement, an inability to recognise what is happening or
          to do the simple thing that would fix it. Then seizure, then coma. The critical feature
          is that the stage where a person could still save themselves ends before the danger does.
          Once someone is unconscious, they cannot eat, and there is nothing about insulin that
          wears off fast enough to matter.`,
          `That is why sleep is the recurring circumstance in the case reports. So is being alone.
          Hypoglycaemic deaths and permanent hypoglycaemic brain injury in bodybuilders are
          documented in the medical literature, and the accounts share a pattern: a dose taken, a
          meal that did not follow, and no one present. Prolonged neuroglycopenia does not always
          kill &mdash; sometimes it leaves someone alive with a brain that no longer works
          properly, which is the outcome that rarely gets discussed.`,
          `@@EV_ESTABLISHED@@ There is a second, quieter failure mode. Insulin drives potassium
          into cells along with glucose, and a large dose can drop serum potassium enough to cause
          arrhythmia. It is the reason hospitals give insulin deliberately to treat
          hyperkalaemia. It is invisible without a blood test, and it does not announce itself the
          way a hypo does.`,
          `The margin also moves, which is the part that catches experienced users rather than new
          ones. Alcohol suppresses the liver&rsquo;s ability to release stored glucose, so the same
          dose goes further after drinking. Unplanned cardio, a hot shower, a sauna, heat, a missed
          or delayed meal, a smaller meal than expected, an injection into a site about to be
          exercised &mdash; each of these deepens the same drop. A dose that was fine ten times is
          not thereby a safe dose.`
        ]
      },
      {
        h2: 'Why there is no dose on this page, and what to know if it is in your protocol anyway',
        paras: [
          `Every compound page on this site strips performance dosing, and this is the one where
          that policy needs no defending. Prescribed insulin is titrated by a clinician against
          measured glucose: an estimate from body weight and current control, then weeks of
          adjustment against readings. The dose is an output of measurement. There is no table it
          can be read off, and a number published here would be a number applied by someone whose
          circumstances it was never derived from.`,
          `If insulin is in your protocol for any reason, medical or not, the boring part is the
          entire safety system. Glucose measured before and after each dose and again before
          sleep; a continuous glucose monitor if you can get one, because it is the only monitoring
          that works while you are asleep and it alarms before you would notice. Fast-acting
          carbohydrate within arm&rsquo;s reach every single time &mdash; glucose tablets, juice,
          regular soda, not something that needs cooking. Someone nearby who knows what you have
          taken and what a hypo looks like, because the person having one is the person least able
          to describe it. Glucagon, as a nasal powder or an auto-injector, is what that person uses
          when you can no longer swallow, and it is available on prescription. If someone is
          confused or unresponsive: emergency services first, glucagon if it is there, nothing by
          mouth into an unconscious person.`,
          `@@EV_ESTABLISHED@@ Two more things worth knowing plainly. Insulin syringes are marked in
          units rather than millilitres, and pens deliver in units too &mdash; unit-versus-millilitre
          confusion and pen-versus-syringe confusion are documented sources of tenfold overdose in
          hospitals, where people do this professionally. And in the United States, regular human
          insulin is sold without a prescription in most states, which makes the most dangerous
          compound in this reference also one of the easiest to obtain. Cheap and available are
          facts about supply chains, not about safety.`,
          `The honest summary is that insulin has an unmatched record as replacement therapy for
          people who cannot make their own, and no controlled evidence at all as a physique drug,
          set against a failure mode that is fast, common in the case reports, and unforgiving of
          an ordinary bad day. That is a real trade-off and it belongs to the person making it, but
          it should be made with a doctor who knows what else you are taking rather than from a
          forum thread.`
        ]
      }
    ],
    consLede: `From the app&rsquo;s own entry. The first two items are the page: everything else is
      a consequence of them.`,
    faq: [
      ['Is insulin legal to buy?', [
        `In the United States, regular human insulin &mdash; Humulin R and Novolin R &mdash; is sold
         without a prescription in most states. The rapid- and long-acting analogues require one. Being
         legal and being safe are unrelated questions here, and the availability is a large part of why
         the risk is worth spelling out.`]],
      ['Does it actually build muscle?', [
        `There are no controlled trials in non-diabetic athletes, and there are unlikely ever to be, because
         inducing hypoglycaemia in healthy volunteers for a physique endpoint is not approvable. The
         mechanistic case is that insulin permits protein synthesis rather than driving it, and that ordinary
         post-meal levels already saturate that. Much of the visible effect is glycogen and water.`]],
      ['What does a hypo feel like?', [
        `Sweating, shaking, a racing heart, sudden hunger and anxiety first. Then confusion, slurred speech
         and impaired judgement as the brain runs short of glucose &mdash; and that stage is the problem,
         because it removes the ability to recognise what is happening and act on it. Seizure and coma follow.`]],
      ['What do you do if someone is confused or unresponsive?', [
        `If they can still swallow reliably, fast-acting carbohydrate: glucose tablets, juice, regular soda.
         If they cannot, call emergency services and give glucagon if it is available &mdash; nasal or
         auto-injector. Never put anything in the mouth of an unconscious person.`]],
      ['Why does this page carry no dose?', [
        `Because insulin dosing is titrated against measured glucose by someone who can see the whole
         picture, not chosen from a reference table. Every compound page here strips performance dosing;
         this is the one where publishing a number could kill a reader.`]],
      ['Does it interact with semaglutide or tirzepatide?', [
        `Yes, and it is a recognised clinical interaction rather than a theoretical one. GLP-1 agonists lower
         glucose and suppress appetite, so the same insulin dose goes further. Guidelines call for the insulin
         to be reduced when a GLP-1 is started or increased, under medical supervision.`]]
    ],
    basis: [
      ['Glucose, amino acid and potassium uptake into cells',
        'Established endocrinology; the basis for insulin therapy since 1922'],
      ['FDA approval for diabetes mellitus',
        'Approved and on the WHO Model List of Essential Medicines'],
      ['Over-the-counter availability of regular human insulin',
        'Sold without prescription in most US states; the analogues are prescription-only'],
      ['Muscle gain in non-diabetic athletes',
        'No controlled trials exist; the case rests on mechanism and on reports from users'],
      ['Insulin permits rather than drives protein synthesis',
        'Clamp studies separating insulin from amino acid availability in healthy adults'],
      ['Hypoglycaemic death and brain injury in bodybuilders',
        'Documented in published case reports; sleep and being alone recur in the accounts'],
      ['Hypokalaemia from a large dose',
        'Established; insulin with glucose is a standard hospital treatment for hyperkalaemia'],
      ['Alcohol deepening hypoglycaemia',
        'Established: alcohol suppresses hepatic glucose output'],
      ['Unit-versus-millilitre dosing errors',
        'A documented source of tenfold overdose in clinical settings']
    ],
    cta: `If insulin is in your protocol, the record is not paperwork &mdash; it is the thing that
      lets someone else reconstruct what happened. TherapyLog keeps the dose, the time and the
      glucose together.`
  },
};
