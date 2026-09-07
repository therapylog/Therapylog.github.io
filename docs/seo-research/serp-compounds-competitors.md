# SERP research: compound queries, competitor landscape, brand indexation

Date: 2026-09-03. Subject: TherapyLog (therapylog.app) — free-tier TRT / peptide / GLP-1 tracker with a 130-compound encyclopedia, PK curves, and a marker registry.

## Method and caveats

- Search-only session: every finding below comes from result titles, URLs and snippets returned by the WebSearch tool. No pages were fetched, so bylines and page structure are inferred from snippets and known publisher practice, and are marked as such.
- The search index used here skews toward reference/academic sources (PMC, clinicaltrials.gov, USPTO) and away from Reddit and YouTube. Reddit and video results did not appear for any query, even with "reddit" appended. Treat "reddit/video winners" as unverified rather than absent — on live Google, `testosterone cypionate every 3.5 days`, `HCG dose on TRT` and `subq vs im testosterone` typically carry r/Testosterone / r/trt threads.
- `site:` probes on small domains returned mixed results (the engine sometimes ignored the operator and returned unrelated Wikipedia pages). Where a `site:` query returned nothing from the domain, the domain is marked "no indexed pages surfaced", not "no pages exist".

---

## Part A — Compound queries

### Summary table

| Query | Who wins (top ~8) | Winner type | Medical bylines on winners? | Gap TherapyLog can own |
|---|---|---|---|---|
| BPC-157 half life | PMC narrative review, Wikipedia, formationmed.com, swolverine.com, jaycampbell.com, naturadermatology.com, peptideslabuk.com | Reference + clinic + supplement vendor + influencer + UK peptide vendor | Mostly no (Swolverine/Jay Campbell/vendors have no MD byline; clinic pages unbylined in snippet). Only PMC is peer-reviewed. | SERP is contradictory (rat IV/IM t1/2 < 30 min vs vendor claims of "4-6 h subq"). No page shows a route-aware PK curve or reconciles the PK/PD disconnect with a chart. |
| testosterone cypionate half life | Pfizer label (x2), FDA label PDF, themenshealthclinic.co.uk (x2), ScienceDirect, PMC (long vs short esters), Wikipedia, clinicaltrials PDFs | Official label + reference + UK telehealth clinic | Labels/PMC are authoritative; clinic pages unclear. | Everyone quotes "8 days" from the label; only calculator pages (later SERP) mention the 6.9-day population-PK figure. No page shows the frequency-vs-trough curve in the answer itself. |
| semaglutide half life | PubMed PK review, 6x clinicaltrials.gov protocol PDFs, PNAS/bioRxiv, 2x USPTO patents | Almost entirely academic/reference; zero consumer pages in top 10 | Peer-reviewed only | Widest open gap in Part A: no consumer page with steady-state (4-5 weeks), missed-dose, washout and a curve. Telehealth (Hers/Ro) likely rank on live Google, but the reference-heavy index shows how thin the mid-funnel content is. |
| tirzepatide half life | NCBI StatPearls, faynutrition.com, medical.lilly.com, Healthline, forhers.com, allenmedicalaesthetics.com, fellahealth.com (half-life plotter), trimbodymd.com | Reference + telehealth + med-spa + Lilly | Yes: Healthline, Drugs.com, MedicalNewsToday (pharmacist-reviewed), Hers carry medical review. | Fella Health already ranks a "half-life plotter" tool page — proof that PK-curve tool pages rank for `<drug> half life`. Gap: multi-dose accumulation + titration-step overlay + "what my level is today". |
| enclomiphene half life | hims.com, ScienceDirect (x2), AUA Journal abstract, strivepharmacy.com, Wikipedia, USPTO, conciergemdla.com, maximustribe.com | Telehealth (Hims, Maximus), compounding pharmacy, clinic, reference | Hims/Maximus are medically reviewed; Strive/Concierge MDLA are clinic marketing. | No page contrasts enclomiphene (~10 h) vs zuclomiphene (~30 d) with a curve, or ties it to LH/FSH/T markers and "what happens when you stop". |
| HCG dose on TRT | doctronic.ai, PMC (HCG monotherapy, HCG after T use), maleinfertilityguide.com, droracle.ai, clinicaltrials, USPTO, off-topic PMC (cows, PCOS) | AI-health content sites + PMC + fertility guide; live Google adds FormBlends, Hone Health, Tactus, Balance My Hormones, HCG Institute | Yes, strong: Doctronic (Veronica Hackethal MD), FormBlends (PharmD author + MD reviewer), HCG Institute (Mark Smith MD), Tactus (DNP). | Bylines are table stakes here. Gap: a dose/IU-to-units calculator with an HCG half-life curve (t1/2 ~24-36 h) and marker linkage (estradiol rise, ITT). Nobody shows the curve. |
| anastrozole dose TRT | vantageurology.com, then breast-cancer trials (x5), USPTO (x3), PMC breast-cancer | One urology clinic post, rest irrelevant oncology | Vantage Urology is a physician practice (likely MD-authored). | Weakest SERP in Part A: essentially one relevant page. A TherapyLog page with E2-driven dosing, sensitive-assay caveat, ~46-50 h half-life curve, and "when to hold" logic could rank quickly. |
| retatrutide | PMC review, GoodRx, UCHealth, clinicaltrials expanded-access, PMC MASLD trial, joinmidi.com, lilly.com | Big-brand news + reference + Lilly | Yes (GoodRx, UCHealth, Lilly). | Head term is not winnable. Long tail is: `retatrutide half life`, `retatrutide dosing` (Regimen already has a dosing guide + reconstitution calculator), `retatrutide vs tirzepatide curve`. |
| tesamorelin dose | clinicaltrials PDF, PMC (Egrifta WR bioequivalence), Drugs.com, perfectb.com, Mayo Clinic, riteaid.com/peptides, parahealth.de, swolverine.com | Reference + vendor/clinic + Rite Aid (!) | Drugs.com/Mayo yes; PerfectB/Parahealth/Swolverine no. | Gap: Egrifta SV vs WR formulation math (1.4 mg vs 2 mg), IGF-1 marker monitoring page, GH-pulse timing. |
| CJC-1295 ipamorelin dosing | perfectb.com, pathtopeptides.com, pspeptides.com, wearetulsi.com, andersonlongevityclinic.com, mypeptidematch.com, innerbody.com | Peptide vendors + telehealth + clinic + review site | Innerbody is medically reviewed; vendors/clinics generally not. | No page models DAC (~8 d) vs no-DAC (~30 min) + ipamorelin (~2 h) as overlaid curves, or explains why timing vs meals matters with a chart. |
| testosterone cypionate every 3.5 days | ScienceDirect, balancemyhormones.co.uk, Healthline, themenshealthclinic.co.uk, formblends.com, highlandlongevity.com, **helloregimen.com/tools/trt-dose-calculator**, **helloregimen.com/blog/testosterone-cypionate-dosage-guide**, PMC table, bowtiedloon.substack.com | UK telehealth + clinic + FormBlends + **Regimen (2 URLs)** + substack | Healthline yes; FormBlends yes (PharmD/MD); Regimen no medical byline visible. | Regimen already holds two slots. To displace: ester- and route-aware PK (IM vs subq ka), trough prediction from a single lab value, and marker linkage (hematocrit/E2 by frequency). |
| subq vs im testosterone | LinkedIn Pulse, AUA Journal, clinicaltrials, PMC (estradiol subq vs IM), clinicaltrials (adolescents), ScienceDirect, medicalspecialistsmn.com, olympiapharmacy.com | Journals + clinic + compounding pharmacy + LinkedIn | Journals yes; clinic/pharmacy marketing pages no. | No page shows the two routes as PK curves with peak-to-trough ratio, hematocrit and E2 deltas. Route-aware PK is a natural TherapyLog differentiator. |

### Cross-cutting observations for Part A

1. Winner types cluster by query family:
   - Half-life queries for approved drugs (semaglutide, tirzepatide, T-cyp): labels, PMC, Healthline/Drugs.com, telehealth (Hims/Hers/Maximus/Fella).
   - Half-life/dose queries for research peptides (BPC-157, CJC/ipa, tesamorelin): vendors (Swolverine, PS Peptides, PathToPeptides, Peptides Lab UK), clinics (PerfectB, Anderson Longevity), influencers (Jay Campbell).
   - Ancillary queries (HCG, anastrozole, every-3.5-days): telehealth content hubs (FormBlends TRT Hub, Balance My Hormones, Men's Health Clinic UK, Doctronic) plus Regimen.
2. Medical bylines are present and explicit on the HCG, tirzepatide, enclomiphene and HCG-adjacent winners (Doctronic, FormBlends, Hims, Healthline, Drugs.com). They are largely absent on research-peptide winners. TherapyLog needs at least "reviewed by" credentials to compete on ancillaries; for research peptides the bar is lower and the differentiator is a real PK chart plus honest data provenance (species, route, assay).
3. Tool pages rank for half-life terms: Fella Health (tirzepatide half-life plotter), Regimen (tirzepatide / testosterone enanthate half-life calculators, half-life visualizer), PeptideGraph (/peptides/testosterone-cypionate, /peptides/tesamorelin), MyTRT (/learn/calculators/half-life). A TherapyLog compound page that embeds the live PK curve is on-trend rather than novel — it must go deeper (route, ester, assay).
4. Nobody on any of these SERPs ties compound PK to the marker you would check and which assay to order. That linkage (compound page -> marker page -> assay note) is unclaimed.

---

## Part B — Category and competitor queries

### Per-query winners

| Query | Top results (order as returned) |
|---|---|
| TRT tracking app | App Store: TRT Tracker: Injections log (x2), OptiPin, Trough; Play: TRT Plus; trtracker.com; **himcules.com/blog/best-trt-tracking-apps**; discountedlabs.com/blog/trt-app; App Store TRT Tracker (id6504778597) |
| TRT tracker app | App Store TRT Tracker (id6504778597), TRT Tracker: Injections log (x2), OptiPin, Trough; trtbuddy.com; trtracker.com; trtplus.app |
| peptide tracker app | Play: Peptide Tracker & Calculator (PepTra); App Store: PeptideKit, Peptide Tracker & Calculator; Play: Smart Peptide Tracker; peptiq.io; **helloregimen.com/blog/best-peptide-tracker-apps-2026**; shotlee.app/peptide-tracker |
| peptide log app | App Store: Peptide Library – Peptide Log, Peptide Log, PepTracker: Dose Log, SHOTLOG; appadvice; peptidelog.com; shotlogapp.com; peptiq.io; shotlee.app |
| peptide dosing app | App Store/Play: Peptide Calculator App (PepCalc), Peptide AI, Peptide Tracker & Calculator, PepTracker, Peptide Calculator & Dosage, PepCalc; peptiq.io; pepcalc.app; peptracker.app |
| bloodwork tracking app | Play: Blood Test Tracker, Health3; App Store: BloodTrends, Carrot Care; carrotcare.health; labme.ai (x2) — no TRT/peptide tracker appears |
| hormone tracker app for men | App Store: SNlFFlES, Mojo: Testosterone Tracker, Andropause Tracker; Play: Mayday (period tracker for guys); aware.app; menopause trackers — noisy, low-intent SERP |
| regimen app trt | App Store TRT Tracker (id6504778597) first, then Regimen Play/App Store, mwm.ai listing, helloregimen.com (/beta-access, /about, /regimen-app, /, /blog/best-trt-tracker-apps-2026) |
| regimen peptide app | mwm.ai, Regimen App Store, Peptide Tracker & Calculator, Peptide Vault: Regimen Tracker (name-squatting app), Regimen reviews, Play, helloregimen.com/beta-access, helloregimen.com/blog/best-glp1-peptide-tracker-apps-2026 |
| shotsy app | Instagram, Play, App Store reviews, shotsyapp.com (home, blog, "why GLP-1 users need a new kind of app"), uptodown APK, GLP-1 Studio substack interview |
| best peptide tracker 2026 | lynkdose.com/blog, mypepcalc.com/learn/tracking, **helloregimen.com/blog/best-peptide-tracker-apps-2026**, getmiora.com/blog, dosefi.app/best, dosetrack.app/best-peptide-tracker-apps, pepflow.app/blog — 7 of 7 are self-serving "best of" posts by apps/tool sites |

Observations:
- App Store / Play listings dominate the "app" queries; the only web pages that break in are (a) "best X apps" listicles published by the apps themselves (Regimen, Himcules, Dose Track, LynkDose, PepFlow, Miora, MyPepCalc, Dosefi, OptiPin) and (b) single-page marketing sites (trtbuddy.com, trtracker.com, trtplus.app, peptiq.io, shotlee.app).
- "bloodwork tracking app" and "hormone tracker app for men" are owned by generic lab/wellness apps (Carrot Care, BloodTrends, Health3, Mojo). No TRT-specific tracker ranks — an adjacent category TherapyLog's marker registry could enter.
- Regimen has an SEO-driven marketing site that already ranks for `testosterone cypionate every 3.5 days`, `hematocrit TRT`, `best peptide tracker 2026`, `regimen app trt`; it also publishes `llms-full.txt` for AI crawlers.

### Competitor matrix (from indexed pages)

| Competitor | Domain | Blog | Tool pages | Compound pages | Marker pages | Comparison pages | Pages seen ranking | Notes |
|---|---|---|---|---|---|---|---|---|
| **Regimen** (Awaken Labs) | helloregimen.com | Yes, large: TRT injection schedule, T-cyp dosage guide, microdosing, hematocrit, peptide blood work, peptide cycling, BPC-157 nasal/reconstitution, retatrutide dosing, UK dose conversion, best-apps listicles | Yes, /tools/: TRT dose calc, testosterone-calculator, T-enanthate half-life calc, tirzepatide half-life calc, half-life-visualizer, GLP-1 dose calc, retatrutide/tirzepatide/cagrilintide reconstitution, mg-to-units, units-to-mL, split-dose, vial-longevity | Partial: per-compound *tracker landing pages* (/bpc-157-tracker, /trt-tracker, /peptide-tracker-calculator) with half-life modeling blurbs; no encyclopedia-style compound pages seen | No dedicated marker pages (hematocrit exists only as a blog post; app logs 50+ biomarkers) | Yes: /regimen-vs-pep-ai, /regimen-vs-peptiq, /regimen-vs-shotsy (+ blog dup), /regimen-vs-optipin, /blog/how-to-choose-peptide-tracker | every 3.5 days (2 URLs), hematocrit TRT, best peptide tracker 2026, regimen app trt, steady-state calc query, T-cyp half-life calc | Free tier = 1 compound; $4.99/mo. 4.9★/230+ reviews. 150-600+ compound claims vary by page. No visible medical byline. |
| MyTRT | mytrt.app | Yes (/learn/) | /learn/calculators/half-life (simulates serum T across schedules, all esters) | Yes: /learn/peptides/<slug> (89 peptides; e.g. RAD-150 with half-life) | **Yes: /learn/markers/shbg, /hematocrit, /psa** ("Normal range, high/low causes, TRT impact") | Not seen | testosterone cypionate half life calculator | Closest structural analogue to TherapyLog's encyclopedia + marker registry. Free core, iOS/Android. |
| PeptideGraph | peptidegraph.com | No | /halflife-calculator, /dose-calculator | Yes: /peptides/<slug> (40+; T-cyp, tesamorelin) | No | No | testosterone cypionate half life calculator | Free, no account; compound page = half-life + tools. |
| Arcline | arcline.health | Yes (/blog/) | Not seen | Not seen | Not seen, but logs **assay type alongside estradiol** in-app | Not seen | sensitive estradiol vs standard | iOS TRT tracker explicitly built around assay context — the only competitor already on the assay-aware angle. |
| Dose Track | dosetrack.app (+ dosetrack.shop) | Minimal | Reconstitution calc in-app | No web compound pages; 600+ compounds with PK in-app | No | /best-peptide-tracker-apps/ (self-ranked #1) | best peptide tracker 2026, PK-curve query | Claims "only app with true PK" — a direct PK-curve positioning rival. |
| TRT Plus | trtplus.app | No | Steroid plotter + "Testimator" (PK anchored to one lab value) in-app | No | No | No | TRT tracking app, PK-curve query | Also on Play (com.trtplus.app). |
| Trough | none found (App Store id6760955550 only) | — | PK curves in-app | — | — | — | TRT tracking/tracker app | Offline-first, HealthKit, peptides. |
| Himcules | himcules.com | Yes: TRT dosage chart, injection sites (x2), TRT cost, stopping TRT, best TRT apps (iOS + Android) | No | No | No | "Best TRT tracking apps" listicles | TRT tracking app | Free on-device injection tracker; blog is the SEO engine. |
| TRTBuddy | trtbuddy.com | Not seen | No | No | No | No | TRT tracker app | Single landing page. |
| TRT Tracker (trtracker.com) | trtracker.com | Not seen | No | No | No | No | TRT tracking app | Single landing page + App Store. |
| OptiPin (Vitaloom) | optipin.app, vitaloom.xyz | No | Calculators in-app | No | No | /best-peptide-tracker-app (listicle) | TRT tracking app, TRT tracker app | 100+ meds, on-device, no account. |
| PeptIQ | peptiq.io | In-app "Learn" (30+ articles, glossary, FAQs); web has /features, /pricing, /clinics, /help, /about, /download | Calculators in-app | In-app (35+ peptides) | No | No (Regimen publishes the vs page) | peptide tracker/log/dosing app | Claims an **interaction checker** in-app; B2B clinics tier. |
| Shotsy | shotsyapp.com | Yes (/blog/) | Estimated medication level chart in Shotsy+ | Drug landing pages: /ozempic-tracker, /zepbound-tracker, /glp-1-tracker, /free-glp-1-tracker | No | /alternatives/ | shotsy app | 4.8★/30,000+ ratings; GLP-1 only. |
| Shotlee | shotlee.app | Not seen | No | Per-compound *tracker* pages: /tesamorelin-tracker, /tirzepetide-tracker, /testosterone-tracker, /glutathione-tracker, /ecnoglutide-tracker, /insulin-tracker, /injection-tracker, /peptide-tracker | No | No | peptide tracker app, peptide log app, therapylog niche query | Programmatic "<compound> tracker" pages; AI insights. |
| Smart Peptide Tracker | smart-peptide-tracker.web.app | No | Stack Analyzer (6-dimension score) in-app | No | No | No | peptide tracker app | One-time purchase; Android favourite. |
| PeptideKit | peptidekit.app | Not seen | Calculator in-app | No | No | No | peptide tracker app | iOS. |
| LynkDose | lynkdose.com | Yes (best tracker, FDA approvals 2026, how to track a cycle) | No | No | No | No | best peptide tracker 2026 | iPhone, vial-label scanner. |
| PepFlow | pepflow.app | Yes (calculators, storage, hair-growth peptides, health apps) | Calculator in-app | No | No | No | best peptide tracker 2026 | iOS. |
| Miora | getmiora.com | Yes (AI health assistant blog) | No | No | No | No | best peptide tracker 2026 | Not a tracker; iMessage/WhatsApp AI. |
| MyPepCalc | mypepcalc.com | /learn/tracking/ | Calculator | No | No | No | best peptide tracker 2026 | Site: probe returned nothing from domain. |
| Dosefi | dosefi.app | Yes (aesthetics products) | No | Aesthetic product pages | No | /best/peptide-tracker-apps | best peptide tracker 2026 | Aesthetics logbook, not a real competitor. |
| Others seen (App Store only) | Peptide Log (peptidelog.com, unindexed), ShotLog (shotlogapp.com), PepTracker (peptracker.app), PepCalc (pepcalc.app), Peptide AI, PepTra, Peptide Vault "Regimen Tracker", CycleViz, Anre (anre.app), Dose (protocoltracker.app), Mojo, SNlFFlES, Andropause Tracker, TRT Calculator app | — | — | — | — | — | — | Long tail; no meaningful web content. |

### Adjacent content competitors on TherapyLog's planned page types

- Interaction / stack checkers (web-indexed): peptideprotocolwiki.com/tools/stack-checker (50+ pairwise, synergistic/compatible/caution/contraindicated with citations), peptideclock.com/tools/stack-checker, pathtopeptides.com/StackChecker.html, peptidesexplorer.com/tools/peptide-stack-calculator, compoundstacks.com, peppal.app/tools, pep-guide.com/tools. FormBlends publishes pairwise "BPC-157 with tirzepatide" / "BPC-157 with GLP-1" stacking guides; pepedhub.com has /peptides/tirzepatide-bpc-157 combo pages. None of the trackers (other than PeptIQ and Smart Peptide Tracker in-app) has an indexed checker, and none of the checkers cover TRT ancillaries (anastrozole, HCG, enclomiphene, tamoxifen) or drug-drug issues (GLP-1 gastric emptying vs oral meds).
- Assay-aware marker content: `sensitive estradiol vs standard` is won by moreplatesmoredates.com (influencer), personalabs.com (lab vendor), marekhealth.com (telehealth/labs), **arcline.health** (tracker), vikingalternative.com (telehealth), formblends.com, trtfaq.com. `LabCorp vs Quest testosterone assay` returned nothing consumer-grade — open gap. Free-T (Vermeulen) calculators are crowded (issam.ch, healthmatters.io, mdapp.co, vitalmetrics.org, lablooker.com, agemd.com).
- Marker explainer pages: MyTRT /learn/markers/* is the only tracker with them; telehealth blogs (Leger Clinic, Brentwood MD, Regimen blog, Discounted Labs, TRT Catalog) own `hematocrit TRT what is too high`.
- PK/steady-state tools: Regimen (half-life visualizer, T-enanthate calc), medplore.com TRT dosage calculator (Bateman + superposition), steroidplotter.com, steroidplanner.com, MyTRT, PeptideGraph, Fella Health (tirzepatide plotter), omnicalculator generic half-life.

### What is missing that TherapyLog could own

1. **Assay-aware marker registry pages** — `<marker>`: normal range by assay (LC-MS/MS vs ECLIA), LabCorp vs Quest test codes and reference intervals, how TRT/peptides move it, when to retest, plus a "log with assay" CTA. Only Arcline (in-app field) and MyTRT (three generic marker pages) touch this; nobody publishes assay-specific ranges.
2. **Route- and ester-aware PK curve pages per compound** — IM vs subq absorption, DAC vs no-DAC, Egrifta SV vs WR, enclomiphene vs zuclomiphene, with data provenance (species, route, n). Regimen/Dose Track/PeptideGraph model a single half-life per compound.
3. **Compound -> marker linkage** — each compound page names the 2-4 markers it moves, the assay to order, and the timing relative to dose (trough draw). No competitor connects these.
4. **A cross-class interaction checker** covering TRT + ancillaries + peptides + GLP-1s + common orals, with severity and citation. Existing checkers are peptide-only and vendor-run.
5. **Anastrozole / enclomiphene / HCG ancillaries** — thin SERPs, strongest for anastrozole. Regimen has no visible ancillary pages beyond hematocrit.
6. **Comparison pages against Regimen** — Regimen publishes "Regimen vs X" for four rivals; nobody publishes "X vs Regimen". A neutral-toned "TherapyLog vs Regimen" (free tier: unlimited vs 1 compound; PK: route-aware vs single half-life; markers: assay-aware) would capture the branded comparison intent Regimen itself is creating.
7. **"bloodwork tracking app" and "hormone tracker app for men"** — no TRT-specific tracker ranks; marker-registry landing pages can target both.

---

## Part C — Brand and indexation

### What shows for the brand today

- `TherapyLog`: apps.apple.com/us/app/therapylog/id1098719720 (Research To Practice LLC), instagram.com/therapylog_k12, linkedin.com/company/therapylog, play.google.com Therapylog PCA (com.pcaapp.therapylog), Facebook post, Wikipedia "Journal therapy", a Framer template demo (silly-opportunities-767946.framer.app "Doctr X"), therapylog.com, HSWorx "Therapy Log Basics".
- `therapylog app`: Therapylog PCA (Play), Therapylog (App Store), Therapylog Transit (Play, com.dtta), appadvice listing, reinvently.com/work/therapylog (agency case study), Framer template, soft112 download mirror, Therapy Journal: AI Journal, HSWorx.
- `therapylog.app` and `"therapylog.app"`: identical set — Therapylog PCA, Therapylog App Store, Therapylog Transit, appadvice, Reinvently, Framer template, soft112, Therapy Journal apps, "Therapy App".
- `therapylog TRT peptide tracker`: no TherapyLog result; SERP is Trough, CycleViz, OptiPin (x2), anre.app, nextleveltrt.com, shotlee.app/testosterone-tracker, protocoltracker.app, dosetrack.app.

Interpretation: the brand name is fully occupied by **Therapylog (therapylog.com, Research To Practice LLC)** — a Missouri school-based-therapist Medicaid documentation platform with three apps (Therapylog, Therapylog PCA, Therapylog Transit), 2,500+ schools, an Instagram, LinkedIn, Facebook and an agency case study. Every brand query returns that entity. There is also a generic-noun problem ("therapy log" = HSWorx feature, therapy journals).

### Does site:therapylog.app return anything?

- `site:therapylog.app`: **zero URLs from therapylog.app**. All returned links were third-party (Play, App Store, appadvice, reinvently, soft112, apkpure mirror, unrelated therapy-journal apps).
- `allowed_domains: ["therapylog.app"]` with query `therapylog`: **"No links found."**
- Conclusion: therapylog.app has no indexed pages in this engine. On live Google this needs confirming with Search Console, but the signal is consistent across four queries: the domain is either not indexed or so weakly indexed that it never surfaces for its own name.

Curiosity worth checking: a Framer template demo ("Home V1 - Doctr X Framer Template", silly-opportunities-767946.framer.app) appears for three brand queries. If therapylog.app is built on that template, the demo may be outranking the real site on shared boilerplate text — a canonical/duplicate-content risk.

### Brand implications

1. Name collision is severe: the incumbent has app-store listings on both stores, social profiles, and a 2016-era App Store presence. Expect long-term difficulty owning the unqualified brand term; qualify it ("TherapyLog TRT tracker", "TherapyLog peptide tracker") in titles, app-store names, and schema.
2. Fix indexation first: submit sitemap, verify robots/noindex, ensure the homepage title carries the qualifier, and get at least one third-party mention (Product Hunt, an app-store listing, a directory such as mwm.ai which already lists Regimen and Smart Peptide Tracker).
3. Because "therapylog TRT peptide tracker" returns Shotlee/Dose Track/Anre style landing pages, TherapyLog's own "<compound> tracker" landing pages will compete directly with Shotlee's programmatic pages and Regimen's /bpc-157-tracker, /trt-tracker.

---

## Prioritised page opportunities (compound + marker)

| Priority | Page | Why now |
|---|---|---|
| 1 | Anastrozole on TRT: dose, half-life curve, E2 (sensitive assay) targets | Near-empty SERP; ties compound + assay-aware marker |
| 2 | Semaglutide half-life / steady-state / missed-dose with curve | SERP is all PDFs and papers; no consumer page |
| 3 | HCG on TRT: IU-to-units calc + half-life curve + E2/ITT markers | Strong bylined competitors exist, but none show the curve; needs a medical reviewer |
| 4 | Subq vs IM testosterone: route-aware PK curves + hematocrit/E2 deltas | No curve on SERP; route-awareness is TherapyLog's differentiator |
| 5 | Enclomiphene vs zuclomiphene half-life + LH/FSH/T timeline | Telehealth-owned but shallow |
| 6 | CJC-1295 DAC vs no-DAC + ipamorelin overlaid curves | Vendor-owned, no medical content, no charts |
| 7 | BPC-157 half-life: reconcile rat IV/IM (<30 min) vs subq claims, PK/PD disconnect chart | Contradictory SERP; provenance-labelled data wins |
| 8 | Testosterone cypionate half-life: 8 d label vs 6.9 d pop-PK, frequency-vs-trough curve | Label-dominated; a curve page can take the "calculator" intent Regimen/PeptideGraph/MyTRT hold |
| 9 | Marker pages: estradiol (sensitive vs standard, LabCorp vs Quest), hematocrit, SHBG/free T, IGF-1, PSA | MyTRT has three generic ones; nobody is assay-specific |
| 10 | Cross-class interaction checker (TRT + ancillaries + peptides + GLP-1 + orals) | All existing checkers are peptide-only vendor tools |
| 11 | "TherapyLog vs Regimen" comparison | Regimen created the "vs" intent; free-tier contrast is the hook |
| 12 | Retatrutide half-life + titration curve | Head term unwinnable; Regimen owns dosing; half-life curve is open |
