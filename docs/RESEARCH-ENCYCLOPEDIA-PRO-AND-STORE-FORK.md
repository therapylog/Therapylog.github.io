# Research brief — encyclopedia gaps, Pro-tier value, and the store-compliant fork

**Written:** 4 September 2026
**Status:** Research only. **Nothing in here is built.** This is the staging document for a
future update; treat every list as a candidate list, not a commitment.
**Questions asked:** (1) what compounds are we missing, including the popular blends;
(2) are the stacking cautions actually comprehensive; (3) what else goes behind Pro,
because the AI assistant alone may not carry a $99.99/yr decision; (4) should there be a
PCT protocol builder; (5) should the app be restructured — steroid content removed — for
a Play Store submission, and can telehealth be promoted from it.

---

## 0. Baseline — what is actually in the app today

Measured from `app.html` on this branch, not from memory:

| | Count |
|---|---|
| Compounds (unique `id`) | **131** |
| Classes | 30 |
| Compounds with pharmacokinetic data (`TL_PK`) | **97** (74%) |
| Compounds **without** PK | **34** |
| Interaction rules | **53** — 9 `danger`, 14 `warn`, 30 `info` |
| Side-effect playbooks (`SIDEFX`) | 12 |
| Protocol templates | 17 (7 general, 4 added, 6 female) |
| Pro-gated features | 9 |
| In-app tools | 6 (Calculator, Interactions, Templates, Body Comp, Correlate, Cost) |

Pro today gates: AI Lab Scanner, AI Research Assistant, Bloodwork Trends, Clinical
Reports, Blood Pressure Tracker, Symptom Logging, Cycle Tracker, Refill Tracker,
Progress Check-Ins.

---

## 1. The encyclopedia

### 1.1 First, a correction on the "200+" number

I could not find a competitor with 200+ compounds. What the market actually looks like:

| App | Compounds | Notes |
|---|---|---|
| **TherapyLog** | **131** | PK on 97, 53 interaction rules |
| Dosafy | ~75 | AAS, peptides, SARMs, GLP-1, AIs, PCT. Half-life, A:A ratios, PK curves |
| AnaProtoKol | 52 | "52 documented compounds" |
| Regimen | ~50 biomarkers, fewer compounds | GLP-1/peptide-led |
| Anabolyx | "100+ resources" (not compounds) | PK charts, AI assistant, cycle design |

**We are already the largest compound database in the category.** Apps advertising 200+
are almost certainly counting brand names and esters as separate entries — every
testosterone brand, every trade name — which is a legitimate presentation choice we
could adopt, but it isn't more information.

So the problem is not the count. **The problem is composition.** The 131 skews heavily
toward TRT, peptides, and clinic-wellness, and a bodybuilder opening it hits conspicuous
holes within about ninety seconds. There is no Clenbuterol. No Letrozole. No Tadalafil.
No TUDCA. No Testosterone Undecanoate. No blends at all. Those absences read as "this app
isn't really for me" far louder than a headline number does.

### 1.2 The blends — the specifically requested piece

**This is the sharpest gap, and the most embarrassing one, because the website already
covers it and the app does not.**

`therapylog.app/tools/` ships three blend calculators — Wolverine (BPC-157 + TB-500),
GLOW, and KLOW — with genuinely good copy about ratio problems. The app encyclopedia
contains **zero blend entries**. Someone reads the GLOW calculator on the site, opens the
app, searches "GLOW", and gets nothing.

Blends worth entries, with the ratios in circulation (every entry must say the label on
the vial is the only authority — there is no standard for any of these):

| Blend | Components | Commonly circulated ratio |
|---|---|---|
| **Wolverine** | BPC-157 + TB-500 | 5/5 mg or 10/10 mg |
| **GLOW** | GHK-Cu + BPC-157 + TB-500 | 50/10/10 mg |
| **KLOW** | KPV + GHK-Cu + BPC-157 + TB-500 | 10/50/10/10 mg |
| **CJC-1295 + Ipamorelin** | — | 2/2 mg or 5/5 mg. *The single most common blend in circulation* |
| **Tesamorelin + Ipamorelin** | — | 6/2 mg (8 mg total) is a common vendor spec |
| **CagriSema** | Cagrilintide + Semaglutide | Named clinical combination; currently only mentioned in passing |
| **Sermorelin + Ipamorelin** | — | Clinic-dispensed variant |
| **Lipo-C / MIC-B12** | Methionine, inositol, choline, B12 (± L-carnitine) | Standard clinic weight-loss injection |

The structural argument these entries should all make — and which the website already
makes well — is that **a blend collapses several dosing schedules into one**, so the
component with the tightest therapeutic window governs the whole vial. That framing is
harm reduction, it is defensible, and no competitor is making it.

Each blend entry should deep-link to the matching website calculator. That is a free
retention loop between the two properties that does not exist today.

### 1.3 The gaps that matter most, by category

Verified absent from the database (mentions in prose don't count — several of these are
named in other entries' text but have no entry of their own):

**Ancillaries / harm reduction — the most damaging omissions**
- **Letrozole** — the second most common AI in the community after anastrozole. Mentioned twice in prose, no entry.
- **Toremifene** — SERM, increasingly preferred over tamoxifen in some protocols.
- **Tadalafil** — extremely widely used on cycle (BP, prostate, pump). Real interaction surface (nitrates, alpha-blockers).
- **TUDCA** — the standard liver support on orals. Referenced 5× in prose, no entry.
- **hMG / Menotropins** — fertility protocols alongside hCG.
- **Arimistane** — OTC AI, heavily marketed.
- **P5P** — the community's prolactin adjunct; deserves an entry that says the evidence is thin.
- **Minoxidil (oral + topical)** and **RU58841** — androgenic alopecia is the single most-discussed side effect and we have nothing but finasteride/dutasteride.
- **Ezetimibe / rosuvastatin / citrus bergamot / nattokinase / low-dose aspirin** — the lipid-and-clot rescue kit. Telmisartan is in; the rest of the cardioprotective stack isn't.
- **Nebivolol** — the beta-blocker of choice in this population.

**Fat loss / stimulants**
- **Clenbuterol** — a top-five most-searched PED with zero coverage. Its absence is the most conspicuous single gap in the database.
- **Albuterol/salbutamol**, **Ephedrine (ECA)**, **Yohimbine / alpha-yohimbine**
- **Tesofensine**, **SR9009 / SR9011**
- **DNP** — needs an explicit editorial decision (see §1.6).

**GLP-1 / metabolic — we are behind the news**
- **Orforglipron (Foundayo)** — **FDA-approved 1 April 2026**, first oral GLP-1 with no food/water/timing restriction, ~12.4% weight loss at 72 weeks in ATTAIN-1. We do not have it. This is the highest-traffic compound in the category right now and it is missing.
- **Survodutide** (Phase 3, GLP-1/glucagon), **Amycretin** (Phase 3, GLP-1/amylin), **Petrelintide** (Phase 2 amylin), **Mazdutide** (approved in China, not US).

**AAS**
- **Testosterone Undecanoate** — both injectable (Nebido/Aveed) and oral (Jatenzo/Kyzatrex). An *approved* TRT route we don't cover.
- **Testosterone gel / cream (topical)** — the most commonly *prescribed* TRT form in the US and we have no entry.
- **Trestolone / MENT**, **DHB (dihydroboldenone / 1-testosterone)**, **Superdrol (methasterone)**, **Halotestin (fluoxymesterone)**, **Parabolan (tren hex)**, **Methyltestosterone**.

**SARMs** — **S-23**, **LGD-3303**, **ACP-105**, **RAD-150**.

**Peptides** — **MGF / PEG-MGF**, **IGF-1 DES**, **ACE-031**, **Adipotide**, **Melanotan I**,
**Glutathione**, **Methylene blue**, **B12 (methylcobalamin)**, **NA-Semax / NA-Selank amidate**.

**Supplements the audience actually takes** — Tongkat Ali, Fadogia Agrestis, Boron,
Shilajit, Turkesterone/ecdysterone, Ashwagandha, ZMA, CoQ10, omega-3, vitamin K2,
curcumin, milk thistle. These matter more than they look: they are the compounds users
add *without* telling anyone, and several have real interaction surface.

**Nootropics** — Modafinil, Bromantane, Phenylpiracetam, Noopept, Alpha-GPC.

### 1.4 A route to ~230

| Wave | Content | Adds | Running total |
|---|---|---|---|
| 1 | Blends (8) + the top 20 conspicuous omissions (clenbuterol, letrozole, tadalafil, TUDCA, test undecanoate, topical test, orforglipron, toremifene, minoxidil, RU58841…) | 28 | 159 |
| 2 | AAS completion + SARM completion | 25 | 184 |
| 3 | Metabolic / fat-loss / GLP-1 pipeline | 18 | 202 |
| 4 | Support, supplements, nootropics | 30 | 232 |

Wave 1 alone closes the credibility gap. Waves 3–4 are volume.

### 1.5 The PK gap is a better investment than raw count

34 of 131 compounds have no PK entry, so the pharmacokinetics feature — the thing you
correctly identify as the app's best recent addition — silently does nothing on a quarter
of the database. Several are compounds where a curve is genuinely useful and expected:
**Testosterone Pellets** (the whole point is the release profile), **Insulin** (the
profile *is* the safety information), **Progesterone**, **NDT**, **Pregnenolone**,
**5-Amino-1MQ**, **SLU-PP-332**, **Estriol**, **Dasatinib**.

Others in the list are honestly not PK-shaped (Creatine, Taurine, Glycine, Collagen,
NAD+ IV, "Standard PCT" as a pseudo-entry). For those the right fix is a stated
"pharmacokinetic modelling doesn't apply here, and here's why" rather than an empty
panel — which is itself a small trust signal.

**Every new compound in Waves 1–4 should ship with PK on day one.** Backfilling is how
you get to 74%.

### 1.6 Two editorial decisions to make before Wave 1

1. **DNP.** It kills people, it is used anyway, and reliable dosing information is nearly
   impossible to find. A harm-reduction entry that refuses to give a dosing table and
   instead covers the mechanism, the thermal ceiling, and the fact that there is no
   antidote is defensible and arguably obligatory for a harm-reduction app. Including a
   dose range is not. Decide deliberately; don't let it happen by default either way.
2. **Insulin.** Already in, correctly flagged. If AAS-context insulin gets expanded, the
   entry needs the same treatment as DNP — mechanism and danger, not a protocol.

---

## 2. Stacking cautions and interactions — the honest answer

**No, it isn't comprehensive, and the shape of the gap is specific: the interaction
engine is built for the TRT/peptide/wellness half of the app and is close to empty for
the AAS/bodybuilding half — the exact audience you're trying to serve.**

Of 53 rules, **30 are `info`** — synergy notes, not cautions ("Gold Standard GH
Secretagogue Pairing", "Metformin + TRT — Insulin Sensitivity Benefits"). Only **23** are
`warn` or `danger`. And the coverage is lopsided:

- **Trenbolone appears in zero interaction rules.** Both tren entries exist; neither
  participates in the checker. Same for Oxymetholone, Methandrostenolone,
  Chlorodehydromethyltestosterone, Stanozolol, Boldenone, Proviron, YK-11, Andarine.
- **There is no hepatotoxicity stacking rule at all.** Dianabol + Anadrol, Superdrol +
  anything, any 17-AA oral + isotretinoin (both of which we stock), any oral + alcohol.
  This is the most common genuinely dangerous stack in the community and the checker is
  silent on it.
- **No lipid-stacking rule.** An AI plus an oral AAS is an additive HDL catastrophe.
  Both classes are in the database; the combination is unflagged.
- **No 19-nor prolactin rule** despite the SIDEFX playbook covering exactly that pathway.
  The knowledge is in the app, just not wired into the checker.

Missing rules with genuine clinical grounding, roughly in priority order:

| Rule | Severity | Why |
|---|---|---|
| Testosterone/AAS + warfarin | `danger` | Androgens potentiate warfarin — a labelled, documented DDI. Bleeding risk. |
| Two or more 17-AA orals | `danger` | Additive hepatotoxicity |
| Oral AAS + isotretinoin | `danger` | Additive hepatic and lipid burden; both stocked |
| 19-nor (tren/nandrolone) + any second 19-nor | `warn` | Prolactin, neuropsychiatric, cardiac |
| AI + oral AAS | `warn` | Compounded HDL suppression |
| Testosterone + SGLT2 inhibitor | `warn` | Both raise hematocrit |
| Clenbuterol + T3 | `warn` | Cardiac/electrolyte — needs the clen entry first |
| Clenbuterol + beta-blocker | `warn` | Direct antagonism |
| Tadalafil/sildenafil + nitrates, and + alpha-blockers | `danger` | Real, well-documented |
| GLP-1 + oral medications | `info` | Delayed gastric emptying alters absorption |
| GLP-1 + elective surgery/endoscopy | `warn` | Per the Oct-2024 multi-society guidance: **not** a blanket hold — most patients continue; risk concentrates in the dose-escalation phase and in pre-existing delayed emptying, where a 24-hour liquid diet is advised. State it that precisely or don't state it. |
| Levothyroxine + calcium/iron/biotin | `warn` | Absorption and assay interference |
| Biotin + immunoassay labs | `warn` | Biotin skews thyroid and troponin immunoassays — a lab-*interpretation* trap for a supplement-heavy population |
| AAS + ADHD stimulants | `warn` | BP and cardiac load |
| AAS + SSRIs | `info` | Libido/mood confound; commonly co-taken |

Two structural upgrades matter more than any individual rule:

1. **Class-level rules, not pair-level.** Today every rule is an explicit pair, which is
   why adding Trenbolone Enanthate didn't inherit Nandrolone's warnings. Tagging
   compounds (`17aa-oral`, `19-nor`, `hepatotoxic`, `hematocrit-raising`,
   `qt-prolonging`, `lipid-suppressing`) and writing rules against tags makes coverage
   scale with the database instead of quadratically behind it. **Do this before Wave 1**,
   or you will hand-write hundreds of pairs.
2. **Rebalance `info` vs `warn`.** 57% info reads as an app that mostly tells you your
   stack is great. That is the opposite of the harm-reduction position in the ledger.

---

## 3. Pro tier — you're right that the AI isn't enough

### 3.1 Why the concern is well founded

The AI assistant is a **consumable** — 50 questions/month — priced against a free ChatGPT
tab. It is a real feature, but users discount hosted-LLM wrappers heavily, and the value
is hard to feel before purchase. Meanwhile the current split puts **Bloodwork Trends,
Symptom Logging, Blood Pressure, and Cycle Tracker** behind Pro too — those are the
features that actually create switching costs, and they're being sold as an afterthought
to the AI.

The 2026 subscription benchmarks are unambiguous about the shape of the fix:

- Health & fitness converts trial-to-paid at **62%**, above the 53% all-category average —
  this audience does pay.
- **Annual plans are 60.6% of health & fitness revenue**, and expensive annual plans earn
  **4.5× more per user** than cheap ones. $99.99/yr is not the problem.
- Paywalls fired **after a demonstrated value moment** see **2.1× the trial-start rate** of
  immediate hard paywalls.
- Conversion in health apps is "**a demonstrated value problem**", not a pricing problem.
- Testing **two plans vs three** moved conversion **63% more than a price change** did.

Read against the current setup, that says: the price is fine, the tier count (three:
Pro/BYOK/free) may be one too many, and the paywall should trigger on the user's *own
accumulating data*, not on the AI tab.

### 3.2 Features that would carry $99.99, ranked

**Tier A — build these**

1. **Injection site map with rotation tracking.** Dosafy ships "a visual body map showing
   where to pin next, colour-coded by recovery time" and we have *nothing* — the app
   mentions injection sites 13 times in prose and tracks zero. The harm-reduction
   literature names site rotation as one of the practices users develop informally
   because no one gives them guidance. It's visual, it demos in one screenshot, it's
   used every single dose, and it's the clearest competitive hole we have.
2. **Cycle planner with stacked PK.** We have per-compound PK; we don't have *summed*
   curves across a stack with a timeline, taper, and overlap view. This is the single
   most impressive-looking thing the category has, it's a pure extension of work already
   done, and it makes the encyclopedia and the tracker into one product.
3. **PCT protocol builder.** See §4 — big enough for its own section.
4. **Hematocrit / blood-donation manager.** Track hematocrit and haemoglobin against
   donation dates, predict the next crossing of the threshold, hold a donation-eligibility
   countdown (8 weeks whole blood), and flag when a trend is heading for a deferral. The
   harm-reduction literature names donation as a primary tertiary-prevention practice.
   Nobody has built the tool for it.
5. **Lab-trend intelligence without the AI.** Deterministic: rate-of-change per marker,
   time-to-out-of-range projection, correlation of a marker against dose changes,
   flagging when two markers move together. This gets the analytical value users want
   from the AI without the per-question cost, and it improves as their data accumulates —
   which is exactly the value moment a paywall should fire on.

**Tier B — cheap and worth it**

6. **Provider-ready PDF/CSV export.** Dosafy exports CSV "to share with your healthcare
   provider." We export ICS and JSON but not CSV, and there's no clinical-summary PDF.
   For a harm-reduction app, "a document you can hand your doctor" is close to the whole
   mission statement.
7. **A:A ratios, detection times, and ester tables** as structured fields. Standard in
   every competitor. Detection windows are also a harm-reduction fact (tested athletes).
8. **Reconstitution/vial inventory** — how much is left, when it expires, when to reorder.
   Refill Tracker exists; the vial-level version is a different, more-used thing.
9. **Bloodwork panel builder** — "you're running X, Y, Z; here is the panel to order and
   the timing," exportable. The `markers/` content is written already.

**Tier C — differentiators, higher effort**

10. **Wearable integration** — there's already a spec in `therapylog-app`. HR/HRV/sleep
    against dose is a genuinely novel correlation nobody in this niche has.
11. **Side-effect early warning** — SIDEFX playbooks fired automatically from logged
    symptom + lab patterns instead of waiting for the user to go looking.

### 3.3 One structural change

Move the paywall trigger. Let free users log doses and read the encyclopedia
indefinitely; fire the upgrade prompt when they have **enough of their own data for a
trend to exist** — the second lab panel, the fourth week of logging. That is the
"demonstrated value moment" the benchmark data points to, and it costs nothing but
sequencing.

---

## 4. The PCT protocol builder

**Recommendation: build it, as a Tier-A Pro feature, framed as a document generator
rather than a protocol generator.** It is the highest-intent moment in this entire
category — someone finishing a cycle is anxious, motivated, and searching hard — and it
is the one thing no competitor does properly.

**What it should do.** Take the logged cycle (compounds, doses, duration, last dose date,
esters) and compute the *structure* from what's already in the database:

- **Clearance timing.** Half-lives are already in `TL_PK`. Time-to-negligible from the
  last injection is arithmetic the app can already do, and it's the number people get
  wrong most often — starting SERMs while a long ester is still clearing.
- **Sequencing.** hCG *before* SERMs, not alongside — an ordering error the app's own
  `INTERACTIONS` already flags twice ("HCG Must Stop Before PCT SERMs Begin") but which
  no tool enforces.
- **Suppression depth inputs.** Cycle length, dose, and 19-nor involvement drive how deep
  the suppression is; the tool should surface those as the variables that change the plan.
- **A bloodwork schedule.** Baseline, mid, and post — with the exact panel. This is the
  part that most helps and carries the least risk.
- **A printable summary to take to a PCP** — compounds used, dates, doses, current labs,
  and a list of questions to ask. Blank fields for the clinician, not filled ones.

**Framing, which is the whole ballgame.** The output must be a **structured question set
and timeline for a clinician**, not a prescription. Concretely:

- Never generate a dose the user didn't enter. Show published protocol *ranges* from the
  encyclopedia entries with citations, and require the user to select — the difference
  between reporting the literature and writing a script.
- Lead with the recovery data, honestly: recovery is variable, some men don't recover,
  and duration and dose predict that. An app that says this plainly is more credible than
  one that promises a four-week fix.
- Terminate every path in "take this to a physician", consistent with the ledger's
  harm-reduction lock.
- Name the assumption that makes it lawful and honest: **these compounds are
  prescription-only, and this tool assumes you are working with a prescriber.**

**Why this is defensible.** Published PCT structures are widely documented — the
two-weeks-after-last-injection start, the 40/40/20/20 tamoxifen and 50/50/25/25
clomiphene schedules, hCG at 500–1,500 IU EOD *before* SERMs, six-to-eight-week total
windows. Reporting what the literature and clinical practice describe, with citations and
without personalising a dose, is publishing. Computing *your* dose is not. Keep the tool
on the publishing side of that line and it is no more exposed than the encyclopedia
already is — arguably less, because it pushes users toward a clinician rather than away.

---

## 5. The Play Store fork

This is the biggest question here and deserves the most direct answer.

### 5.1 What the ledger says, and why this isn't re-litigating it

`docs/LEDGER.md` §1 locks web-first *indefinitely*, on the reasoning that listing would
require cutting content the community relies on. But it also says, in the same entry:

> A separate, store-compliant version is a possible *future* fork, not a current plan.

So this is the door the ledger deliberately left open. **The recommendation below is to
walk through it as a fork — and to not touch therapylog.app.**

### 5.2 Don't gut the existing app. Fork it.

Gutting is the wrong move for three reasons:

1. **It destroys the moat to enter the most competitive category in mobile.** The AAS/PED
   content is the reason TherapyLog is the largest database in its niche. Strip it and
   you are a generic supplement tracker competing against thousands of funded apps.
2. **The existing audience is the paying audience.** The $99.99/yr buyer is the person on
   a protocol who needs the compound detail. The store audience is broader and converts
   worse; you'd be trading a high-ARPU niche for low-ARPU volume.
3. **The premise may be wrong anyway.** "Steroid Compounds" (`com.steroids_by_oliva`) is
   live on **both** Google Play and the Apple App Store right now, as an educational
   reference covering steroid profiles, cycles, PCT concepts and harm reduction, with a
   consult-a-professional disclaimer. Cycle Track and several steroid planners are on
   Play too. Enforcement here is inconsistent, and "the content is disqualifying" is less
   certain than the ledger assumed. That is a reason to test cheaply, not a reason to
   demolish something that works.

**So: two products, one codebase, one content pipeline.**

| | TherapyLog (web/PWA) | Store build |
|---|---|---|
| Distribution | therapylog.app, PWA | Play + App Store |
| Compounds | All ~230 | Filtered subset by a `storeSafe` flag |
| Dosing | Full protocol tables | Ranges reframed as "what the literature reports", or suppressed |
| PCT builder | Full | Present, clinician-referral framing only |
| Pro | $9.99/mo · $99.99/yr | Store IAP (the Apple `CdvPurchase` plumbing is already in `app.html`) |
| Positioning | Harm reduction for people on protocols | Hormone-therapy and peptide tracking for people working with a clinic |

Mechanically this is a **per-compound and per-field flag in the existing database**, not a
rewrite. `compounds.json` and the `DB.classes` structure already support adding fields;
`alsoIn` proves the pattern. One content source, two renders. That keeps the two versions
from diverging, which is the thing that kills every "lite version" project.

### 5.3 What the store build has to satisfy

**Google Play**
- **Health apps declaration is mandatory for every developer**, including apps with no
  health features. Submit it accurately — an inaccurate declaration is itself an
  enforcement trigger, and it's a common rejection reason.
- Health apps must be on a **verified Organization Account** (the migration deadline was
  28 January 2026). TherapyLog LLC needs to be that account.
- The **January 2026** enforcement round added medical-device labelling questions,
  stricter Health Connect data justification, and a ban on age-restricted signals for
  health profiling.
- Adding a clinical feature later means **re-submitting the declaration before the update
  ships**. Plan releases around that.
- The controlling prohibition is *"apps that promote or sell unapproved substances,
  irrespective of any claims of legality."* The operative word is **promote**. A neutral
  reference that describes risk is a different posture from protocol tables with stack
  suggestions — that distinction is the whole design brief for the store build.
- Note specifically: **hCG is prohibited when promoted in conjunction with anabolic
  steroids or weight loss.** Our hCG entry does both. In the store build hCG has to be a
  fertility/hypogonadism entry or absent.

**Apple** — Guideline **1.4.3**: no apps that encourage consumption of illegal drugs or
facilitate sale of controlled substances. Again "encourage", not "describe."

### 5.4 What survives the cut, and it's a lot

Removing supraphysiologic AAS protocols does **not** leave a thin app:

- **GLP-1 / metabolic** — semaglutide, tirzepatide, retatrutide, cagrilintide,
  orforglipron. The largest and fastest-growing health audience on either store: US
  peptide searches hit **10.1M/month in January 2026**, up 5× since 2020; tirzepatide
  alone draws ~1M US searches/month.
- **Prescribed TRT** — testosterone under clinical supervision, correctly framed.
- **Thyroid, DHEA/adrenal, female BHRT and cycle tracking** — already built, already
  store-safe, and female-hormone tracking is a large market we currently under-serve.
- **Longevity and metabolic health** — rapamycin, metformin, acarbose, NAD+, senolytics.
- **Recovery peptides** — BPC-157, TB-500, and the blends, framed as reference.
- **Bloodwork tracking, the lab scanner, trends, and the marker library** — the entire
  `markers/` corpus is already written and is completely uncontroversial.

That is a coherent, genuinely useful product. And your instinct about a **broader
encyclopedia** is right, for a reason beyond store safety: a general medication,
supplement, and lab-marker reference with the same PK modelling and interaction engine
has a far larger addressable audience than PEDs, and it makes the *existing* app better
too — because the compounds people are actually co-taking (SSRIs, statins, ADHD
stimulants, thyroid meds) are precisely the ones missing from the interaction table in §2.

**One caution.** A store build is not a free option. It brings app review, IAP
economics (Apple/Google take 15–30% versus Stripe's ~3%), store-listing policy risk on
every update, and a second support surface. Size it as a real product line, not a
re-skin. And keep the store listing's own copy scrupulously clean — listings get read by
reviewers more carefully than app content does.

### 5.5 Telehealth promotion

Two things are being conflated, and the distinction matters:

**Running telehealth under TherapyLog** was decided against on 1 September 2026 and that
decision holds — `docs/BRAND-AND-ENTITY-STRUCTURE.md` is thorough and its reasoning has
not weakened. Third brand, third entity.

**Promoting third-party clinics from the app** is different, and the infrastructure is
already built: `directory/` (with `providers-data.js`, tiers, ref codes),
`providers/apply.html`, and a 25–30% recurring affiliate program in `partnership.html`
and `affiliates.json`. The directory is currently **empty** — zero listings. That is
revenue sitting idle.

Constraints to design around:

- **A store build changes this calculus favourably.** Promoting licensed telehealth from
  a store-compliant hormone-tracking app is a normal, defensible business. Promoting it
  from an app that also carries first-cycle AAS protocols is the co-branding problem the
  entity doc already dismantled.
- **LegitScript certification is the gate for paid acquisition** — mandatory for telehealth
  advertisers in the US, UK, Canada, France and Japan, at $975/site application plus
  $2,150/site/year. That burden falls on the *clinic*, not on us, but it is the right
  filter for the directory: **list only LegitScript-certified or NABP-accredited
  providers.** It's a real quality bar, it's checkable, and it doubles as marketing.
- **DEA telemedicine flexibilities expire 31 December 2026.** The fourth temporary
  extension runs through calendar 2026; the Special Registration final rule entered OMB
  review on 25 August and is forecast for November 2026. Every testosterone-telehealth
  partner's business model depends on what lands. Don't sign a long directory deal that
  assumes today's rules; ask each partner what their 1 January 2027 plan is.
- **Disclose the commercial relationship plainly** on every listing. FTC endorsement
  rules, and it's also the thing that keeps a directory from reading as a funnel — which
  is the credibility risk the ledger cares about.

---

## 6. What I'd do first

In order, and the order matters:

1. **Tag the compound schema before adding anything.** `storeSafe`, class tags
   (`17aa-oral`, `19-nor`, `hepatotoxic`, `hematocrit-raising`, `lipid-suppressing`), and
   `aaRatio`/`detectionTime` fields. Adding 100 compounds first means retrofitting 231.
2. **Ship the blends.** Eight entries, deep-linked to the calculators that already exist.
   Smallest possible change, closes the most visible gap, and connects the two properties.
3. **Convert the interaction engine to class-level rules** and write the ~15 AAS rules in
   §2. This is the single biggest safety improvement available, and it makes the "is it
   comprehensive?" answer yes.
4. **Wave 1 compounds** (28), each with PK on arrival. Clenbuterol, letrozole, tadalafil,
   TUDCA, orforglipron, testosterone undecanoate and topical first.
5. **Injection site map.** The clearest competitive hole and the best screenshot in the
   app.
6. **PCT builder**, on the framing in §4.
7. **Then** evaluate the store fork with real numbers, using the flags from step 1 to
   generate the filtered build and see what's actually left before committing.

Steps 1–6 make the existing product materially better whether or not the fork happens.
Step 1 is what makes step 7 cheap instead of a rewrite. That sequencing is the main
recommendation in this document.

---

## Sources

Competitive and market: [Dosafy features](https://dosafy.com/features) ·
[Anabolyx](https://anabolyx.ai/) · [AnaProtoKol](https://www.anaprotokol.com/en) ·
[Regimen](https://play.google.com/store/apps/details?id=com.regimen.app) ·
[Steroid Compounds on Google Play](https://play.google.com/store/apps/details?id=com.steroids_by_oliva) ·
[Steroid Compounds on the App Store](https://apps.apple.com/us/app/steroid-compounds/id6720753282)

Blends: [GLOW vs KLOW vs Wolverine](https://www.peptoralabs.com/research/glow-vs-klow-vs-wolverine) ·
[KLOW vs Wolverine](https://smtpeptides.com/research/klow-vs-wolverine-peptide-blend-comparison/) ·
[Tesamorelin + Ipamorelin blend spec](https://www.corepeptides.com/peptides/tesamorelin-ipamorelin-blend-8mg/)

Compounds and pipeline: [FDA approves Lilly's Foundayo (orforglipron)](https://investor.lilly.com/news-releases/news-release-details/fda-approves-lillys-foundayotm-orforglipron-only-glp-1-pill) ·
[GLP-1 pipeline 2026](https://www.drugdiscoverynews.com/glp-1-agonist-clinical-pipeline-2026-semaglutide-tirzepatide-and-what-s-in-phase-2-17286) ·
[Obesity peptide pipeline tracker](https://rethinkpeptides.com/articles/every-obesity-peptide-in-the-pipeline-a-2026-tracker) ·
[Peptide search statistics 2026](https://peptidesexplorer.com/blog/peptide-statistics-2026)

Harm reduction: [Towards a harm reduction paradigm (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S2211266924000252) ·
[Community-led harm reduction for people who use steroids](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12581924/) ·
[Harm reduction in AAS dependence (Harm Reduction Journal)](https://link.springer.com/article/10.1186/s12954-025-01294-w) ·
[Multi-society GLP-1 perioperative guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11666732/) ·
[ASA release on that guidance](https://www.asahq.org/about-asa/newsroom/news-releases/2024/10/new-multi-society-glp-1-guidance)

PCT: [Complete PCT guide — SERMs, hCG, recovery](https://medsbase.com/pct-guide/) ·
[hCG for PCT protocol and bloodwork](https://medsbase.com/hcg-pct-after-cycle-protocol/)

Store policy: [Google Play Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en) ·
[Health apps declaration form](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en) ·
[Google Play Developer Program Policy](https://support.google.com/googleplay/android-developer/answer/17190352?hl=en) ·
[Google Play health apps 2026 requirements](https://myappmonitor.com/blog/google-play-health-apps-update-2026-requirements) ·
[Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

Monetisation: [RevenueCat State of Subscription Apps 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026) ·
[Adapty health & fitness benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) ·
[Trial-to-paid playbook for health & wellness](https://lifecyclearchitect.com/guides/trial-to-paid-for-health-wellness/) ·
[Paywall optimisation 2026](https://www.rocketshiphq.com/optimize-app-paywall-higher-conversion/)

Telehealth: [LegitScript / Google certification requirements](https://www.accelerateddigitalmedia.com/insights/health-policies-and-restrictions-guide-for-google-ads-microsoft-ads-2026/) ·
[DEA fourth telemedicine extension through 2026](https://www.hhs.gov/press-room/dea-telemedicine-extension-2026.html) ·
[Special Registration rule status](https://www.mcdermottplus.com/insights/dea-extends-telemedicine-flexibilities-for-controlled-substance-prescribing-for-2026/)
