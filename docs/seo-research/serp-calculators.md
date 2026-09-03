# SERP audit: calculator-shaped queries for TherapyLog

Date: 2026-09-03. Method: WebSearch only (page fetching blocked; reddit.com cannot be domain-filtered by this engine, so reddit presence is inferred from whether reddit URLs surfaced in unrestricted results — none did in any query). Result order below is as returned; treat as approximate page-1.

Legend for page type: TOOL = interactive calculator; ART = article/guide; APP = app-store listing; ACAD = journal/patent/clinical-trial noise; VENDOR = sells peptides or is a vendor aggregator/affiliate; CLINIC = TRT/weight-loss clinic; TRACKER = tracker-app marketing site.

## Recurring incumbents (classification used throughout)

| Domain | What it is | Vendor? |
|---|---|---|
| riteaid.com/tools/peptide-dosage-calculator | Rite Aid's new peptide vertical (hub at riteaid.com/peptides with guides, comparisons, news, dose converter). Early-access waitlist promises "20% off an eligible first peptide order when ordering opens" — i.e. the highest-authority "neutral" tool is a pre-launch vendor. | Pre-vendor |
| helloregimen.com/tools/* | Regimen (Awaken Labs), peptide/TRT/GLP-1 tracker app, 4.9 stars App Store, free for one compound, $4.99/mo. Programmatic tool pages: glp1-dose-calculator, tirzepatide-reconstitution-calculator, retatrutide-reconstitution-calculator, trt-dose-calculator, testosterone-enanthate-half-life-calculator, half-life-visualizer, mg-to-units-calculator, bpc-157-dosage-calculator, plus supporting blog posts. | No (tracker) |
| worldpeptideassociation.com | "WPA" — vendor price aggregator (worldpeptideassociation.com/vendors/retatrutide lists 16 vendors); gridinsoft flags it "Peptide Vendor Warning (50/100 trust)". Per-compound calculators with PDF charts. | Vendor-affiliate |
| peptideuniv.com/calculators/* | Education site + local-only iOS/Android app; per-compound calculator pages (semaglutide, tirzepatide, retatrutide, BPC-157, TB-500, CJC-1295, ipamorelin). "Research" framing. | No (tracker) |
| peptidecalcs.com (PepSync) | Free web calculators funnelling to an iPhone app; per-compound pages. | No (tracker) |
| peptidemind.com | Education hub (PR-launched June 2026), "does not sell peptides"; calculator preloaded with 100+ peptides, plus half-life/accumulation tool. | No |
| mypeptidematch.com/tools/* | Peptide-clinic directory (lead-gen); BAC water calc, units converter, per-compound calcs. | Clinic lead-gen |
| shotlee.app | GLP-1 tracker app (10k+ users); syringe-calculator and units-to-mg-calculator pages. | No (tracker) |
| mytrt.app | TRT companion app; learn/calculators/half-life page (peak/trough/steady state). | No (tracker) |
| primepeptides.co, cellgenic.com, particlepeptides.com, onyxbiolabs.com, pspeptides.com, thepeptidelabs.ca, ukmedi.co.uk, buyretatrutide.net, glunovabio.com, bergdorfbio.com | Peptide vendors with calculator pages | Vendor |
| jaycampbell.com/peptide-calculator, peptides.org, muscleandbrawn.com | Influencer/affiliate content (Jay Campbell uses Limitless Life affiliate code "JayC") | Affiliate |
| rndsystems.com, tocris.com, bio-techne.com | Lab-reagent reconstitution calculators (mass/molarity) — wrong intent for consumers | B2B lab supplier |
| howmuchbacwater.com, semaglutidereconstitutioncalculator.com, tirzepatidedosagecalculator.com, peptidescalculator.com, peptidecalculatorapp.com, insulin-calculator.org, biopeptidecalculator.com | Exact-match-domain single-purpose tools, ownership opaque; "research purposes only" boilerplate | Unknown |

TherapyLog presence: **zero** in every query. Worse, `therapylog.app` as a query returns an unrelated product — "Therapylog" by Research To Practice LLC (school-based therapist Medicaid logging; apps.apple.com/us/app/therapylog/id1098719720, play.google.com/store/apps/details?id=com.pcaapp.therapylog). Brand-name collision on the exact string.

Regimen presence: ranks on page 1 for 8 of the 14 target queries (semaglutide recon, tirzepatide recon x2 slots, insulin units-to-mg x2 slots, testosterone half-life x2 slots, TRT dose, cypionate x2 slots) and on variants (mg to units, BPC-157 "250 mcg", retatrutide, units-to-mL). Absent from: peptide reconstitution calculator, BAC water, bacteriostatic water, BPC-157 head term, 0.25 mL question, peptide dosage calculator, interaction checker, free testosterone.

---

## 1. `peptide reconstitution calculator`

Top results:
1. riteaid.com/tools/peptide-dosage-calculator — TOOL (pre-vendor)
2. rndsystems.com/resources/calculators/reconstitution-calculator — TOOL, lab reagent (wrong intent)
3. youtube.com/watch?v=alfhb6EvbYM "How to Use a Peptide Calculator" — VIDEO
4. tocris.com/resources/reconstitution-calculator — TOOL, lab reagent
5. onyxbiolabs.com/peptide-calculator — TOOL, VENDOR
6. howmuchbacwater.com — TOOL, EMD
7. royalmedicalcenters.com/peptide-calculator — TOOL, CLINIC
8. primepeptides.co/peptide-calculator — TOOL, VENDOR
9. particlepeptides.com/en/content/48-peptide-calculator — TOOL, VENDOR
10. cellgenic.com/peptide-calculator — TOOL, VENDOR

Tools vs articles: almost entirely interactive tools (9/10). Vendors: 4 explicit vendors + Rite Aid pre-vendor + 2 B2B lab suppliers = vendor-heavy. Trackers: none (no Regimen). Reddit/forum: none surfaced.
Weaknesses: vendor ownership; two of the top four are molarity calculators irrelevant to injectable users; single-shot with no dose log or doses-remaining follow-through; "research" disclaimers.
Related variants seen: "reconstitution calculator" (R&D/Tocris/Bio-Techne take top 3, then Rite Aid, Onyx, howmuchbacwater, PeptideMind, Particle), "peptide reconstitution chart" (patent noise + extension.health article — no good chart page exists).

## 2. `BAC water calculator`

1. freemedicaljournals.com/blog/tirzepatide-bac-water-calculator — ART with chart (odd domain, tirzepatide-specific)
2. peptidecalculatorapp.com/reconstitution-calculator — TOOL (also an app)
3. peptidemind.com/peptide-dosage-calculator — TOOL
4. mypeptidematch.com/tools/bac-water-calculator — TOOL (clinic directory)
5. pepmath.com/bac — TOOL (indie; praised in a graymarket Substack for its syringe visual)
6. peptidefox.com/tools/calculator — TOOL (content site + local-only app by HZ29 Inc)
7. riteaid.com/tools/peptide-dosage-calculator — TOOL
8. buyretatrutide.net/retatrutide-calculator/bacteriostatic-water — TOOL, VENDOR (EMD)

Tools vs articles: 7 tools, 1 article. Vendors: 1 explicit + Rite Aid; NOT vendor-dominated — mostly independent tools and app funnels. Regimen absent.
Weaknesses: no consensus authority; #1 is a blog on a "free medical journals" domain; most tools compute concentration only, none link water choice to syringe-readability guidance except by prose.

## 3. `bacteriostatic water calculator`

1. riteaid.com/tools/peptide-dosage-calculator — TOOL
2. ukmedi.co.uk/pages/peptide-dilution-calculator — TOOL, VENDOR (UK)
3. peptidemind.com/peptide-dosage-calculator — TOOL
4. howmuchbacwater.com — TOOL
5. mypeptidematch.com/tools/bac-water-calculator — TOOL
6. primepeptides.co/peptide-calculator — TOOL, VENDOR
7. cellgenic.com/peptide-calculator — TOOL, VENDOR

Vendors: 3/7 + Rite Aid. Regimen absent. Same page set as #1/#2 — these three queries share one page pool, so one page can target all three.

## 4. `semaglutide reconstitution calculator`

1. worldpeptideassociation.com/semaglutide-calculator — TOOL, vendor aggregator (5/10/15/20/30 mg presets + PDF chart)
2. semaglutidereconstitutioncalculator.com — TOOL, EMD ("Trusted by Medical Experts", unverifiable)
3. helloregimen.com/tools/glp1-dose-calculator — TOOL, TRACKER (Regimen)
4-6. ncbi.nlm.nih.gov PMC x3 — ACAD noise
7. peptideuniv.com/calculators/semaglutide-dosage-calculator — TOOL (tracker-app funnel)
8. peptidecalcs.com/calculators/semaglutide — TOOL, PepSync (tracker-app funnel)

Tools vs articles: 5 tools, 3 academic. Vendors: WPA only. Tracker apps: 3 of 5 tools (Regimen, PeptideUniv, PepSync) — this SERP already rewards tracker-app tool pages. Reddit: none.
Weaknesses: academic noise on page 1 means low-competition slots; EMD site has no brand; WPA has vendor conflict; none show a dose-escalation ladder (0.25→2.4 mg) as units side-by-side with the calculator except as PDF.
Variants: "semaglutide units calculator" → glapp.io, floridaweightlossmd.com, flowwellness.com ("how many units is 0.25 mg of semaglutide"), rivasweightloss.com, peptideuniv, fifty410.com, glp3planner.com — clinics + GLP-1 apps, vendors 0. "semaglutide 5mg vial 2ml bac water units chart" → peptidesexplorer, mypeptidematch x2, glp3planner, peptidefox, thepeptidecatalog, glunovabio (vendor), seekpeptides x2 — chart/article intent, strongly long-tail.

## 5. `tirzepatide reconstitution calculator`

1. freemedicaljournals.com/blog/tirzepatide-bac-water-calculator — ART/chart
2. worldpeptideassociation.com/tirzepatide-calculator — TOOL, vendor aggregator
3. helloregimen.com/tools/tirzepatide-reconstitution-calculator — TOOL, TRACKER
4. tirzepatidedosagecalculator.com — TOOL, EMD ("research protocols" framing)
5. helloregimen.com/tools/glp1-dose-calculator — TOOL, TRACKER (Regimen double-ranks)
6. peptideuniv.com/calculators/tirzepatide-dosage-calculator — TOOL

Only 6 results returned — thin SERP. Vendors: WPA only. Regimen owns 2/6 slots. Reddit none.
Weaknesses: #1 is an article; the EMD speaks to "laboratory and research settings"; nobody handles both compounded mg/mL vials (Rivas/Glapp/Florida Weight Loss MD do that on the "units" variant) and lyophilized reconstitution on one page (biopeptidecalculator.com claims to).
Variants: "tirzepatide units calculator" → shop.bodybuilding.com blog tool (VENDOR-adjacent big brand), glapp.io, biopeptidecalculator.com, wellness.goalbmi.com, floridaweightlossmd.com, peptideuniv, findlina.com, mypeptidematch. "how many units is 2.5 mg tirzepatide" → doctronic.ai article #1 then pure patent/clinical-trial noise — a question page with a chart would own this.

## 6. `BPC-157 dosage calculator`

1. en.wikipedia.org/wiki/BPC-157 — ART (informational intent bleed)
2. youtube.com/watch?v=iyoiTOkhOCs — VIDEO
3. peptidesexplorer.com/tools/bpc-157-dosage-calculator — TOOL (content site; runs vendor reviews, 25-question "find your peptide" quiz; weight/experience-based dose suggestions)
4. floridaweightlossmd.com/home-peptide-dosage-calculator/bpc-157-dosage-calculator — TOOL, CLINIC
5. calorize.com.ua/en/peptides/bpc-157 — TOOL, thin (Ukrainian calorie site)
6. peptidecalcs.com/calculators/bpc-157 — TOOL, PepSync
7-8. pmc.ncbi.nlm.nih.gov PMC4717094 — ACAD

Tools vs articles: 4 tools, Wikipedia, YouTube, 2 academic. Vendors: 0 explicit on the head term (buyretatrutide.net appears on the "bpc 157 reconstitution calculator" variant). Regimen absent on head term, present on variant. Reddit none.
Weaknesses: SERP is mixed-intent, so a tool page needs a dosing-protocol explainer to rank; PeptidesExplorer "dose by body weight/goal" is pseudo-personalization with no evidence base; many thin per-peptide pages (calorize, dosagepeptide.com, peptidesolver.com, mypepcalc.com).
Variants: "how many units is 250 mcg bpc 157" → floridaweightlossmd, mypepcalc.com, peptidesolver.com, peptidemind, peptidecalcs, helloregimen.com/tools/bpc-157-dosage-calculator, peptideuniv, thepeptidecatalog, dosagepeptide.com. "how much bac water for 5mg bpc 157" → brainly.com, freemedicaljournals, justanswer, peptidemind article, arpovohealth (clinic), floridaweightlossmd. Question phrasing is a large long-tail. TB-500 SERP is the same shape (perfectb.com clinic, WPA, peptidesexplorer, peptideuniv, dosagetools.com, peptidedosingprotocols.com, peptides.org, peptidespower.com).

## 7. `insulin syringe units to mg`

1. riteaid.com/peptides/guides/insulin-syringe-units — ART
2. defymedical.com/blog/how-to-read-an-insulin-syringe — ART, CLINIC
3. helloregimen.com/blog/how-to-read-insulin-syringe-guide — ART, TRACKER
4. helloregimen.com/tools/mg-to-units-calculator — TOOL, TRACKER
5. shotlee.app/units-to-mg-calculator — TOOL, TRACKER (dedicated reverse-direction page)
6. shotlee.app/syringe-calculator — TOOL, TRACKER
7. mypeptidematch.com/tools/units-converter — TOOL

Tools vs articles: 3 articles, 4 tools. Vendors: 0. Tracker apps hold 4/7 slots (Regimen x2, Shotlee x2). Reddit none.
Weaknesses: most converters go mg→units; the reverse (units→mg, which needs concentration) is only Shotlee; no page covers U-100/U-50/U-40/0.3-0.5-1 mL barrels plus a printable chart in one place (Regimen's blog "units-vs-ml-vs-mg-syringe-guide" is closest).
Variants: "mg to units calculator" → mypharmatools (IU), glapp.io reverse calculator, helloregimen, peptideclock, rivasweightloss, mypeptidematch, fifty410. "insulin syringe calculator" → owncalculator.com, donedose.com, peptideclock, helloregimen, shotlee, everycalculators.com, fifty410 — generic calculator farms compete here. "units to ml insulin syringe calculator" → riteaid guide, insulin-calculator.org x2, helloregimen blog + tool, versacalculator, hannspharmacy, calculator.academy, shotlee.

## 8. `how many units in 0.25 ml insulin syringe`

1. riteaid.com/peptides/guides/insulin-syringe-units — ART
2. hmdhealthcare.com/blog/how-to-read-an-insulin-syringe — ART (syringe manufacturer)
3. defymedical.com — ART, CLINIC
4. hannspharmacy.com/how-to-measure-with-an-insulin-syringe — ART
5. shotlee.app/syringe-calculator — TOOL (only tool)
6. buycanadianinsulin.com/reading-insulin-syringe — ART (online pharmacy)
7. canadianinsulin.com/articles/insulin-syringes-measurements — ART
8. kdlnc.com/u100-insulin-syringes-guide — ART
9. polarbearmeds.com — ART (online pharmacy)
10. pandameds.com/blog/how-to-read-insulin-syringe — ART

Tools vs articles: 9 articles, 1 tool. Vendors: insulin/online pharmacies, not peptide vendors. Regimen absent. Answer is trivial (25 units) and snippet-shaped; this is a FAQ block, not a page. Low tool intent.

## 9. `peptide dosage calculator`

1. omnicalculator.com/health/peptide-dosage — TOOL (generic calculator brand)
2. riteaid.com/tools/peptide-dosage-calculator — TOOL
3. thepeptidelabs.ca/dosage-calculator — TOOL, VENDOR
4. peptidemind.com/peptide-dosage-calculator — TOOL
5. jaycampbell.com/peptide-calculator — TOOL, AFFILIATE/influencer
6. peptides.org/peptide-dosage-calculator — TOOL, affiliate content ("premier peptides dosage calculator on the interwebs")
7. primepeptides.co — VENDOR
8. cellgenic.com — VENDOR
9. peptidescalculator.com — TOOL, EMD

Vendors/affiliates: 5/9. Regimen absent. Omni at #1 shows a generic brand can outrank vendors on the head term. Reddit none.
Weaknesses: Omni is generic and non-specialist; vendor/affiliate conflict on half the page; none tie dose to doses-remaining, half-life, or a log.
Variant "peptide calculator" → Google Play x2 (apps), Rite Aid, thepeptidelabs.ca, pspeptides.com, primepeptides, cellgenic, particlepeptides — head term is app listings + vendors. "peptide calculator app" → App Store x4, peptidecalc.io ($4.99), helloregimen.com/blog/best-peptide-tracker-apps-2026, peptidescalculator.app, pepcalc.app, peppal.app — Regimen does comparison-content SEO here.

## 10. `testosterone half life calculator`

1. apps.apple.com "TRT Calculator: Testosterone" (id6749503940) — APP
2. mwm.ai/apps/trt-calculator-testosterone — APP mirror
3. clinicaltrials.gov NCT02233751 — ACAD
4. USPTO patent 6503894 — ACAD
5. helloregimen.com/tools/testosterone-enanthate-half-life-calculator — TOOL, TRACKER
6. clinicaltrials.gov PDF — ACAD
7. USPTO patent 11426416 — ACAD
8. mytrt.app/learn/calculators/half-life — TOOL, TRACKER (explicit superposition model, peak/trough/steady state)
9. helloregimen.com/tools/half-life-visualizer — TOOL, TRACKER

Tools vs articles: only 3 real web tools, the rest app listings and patent/trial noise. Vendors: 0. Regimen 2 slots, MyTRT 1. Reddit none.
Weaknesses: page 1 is half noise (very low competition); Regimen's page is enanthate-only and ranks for cypionate by default; the App Store entry is not usable on the web; no page compares esters or injection cadences side-by-side with a visible steady-state day count.
Variants: "testosterone cypionate half life calculator" → App Store, Wikipedia, helloregimen enanthate page, peptidegraph.com, steroidplotter.com (bodybuilding cycle planner), mytrt.app, steroidplanner.com, omnicalculator drug-half-life (generic), balancemyhormones. "TRT steady state calculator peak trough" → Cornell PICU trough calc, metricgate, trtpro.us app tutorial, medplore.com TRT calculator, patents, mytrt.app. "peptide half life calculator" → 5 USPTO patents, then peptidemind accumulation tool, peptideperformancecalculator.com, bergdorfbio.com (vendor) — nearly empty.

## 11. `TRT dose calculator`

1. play.google.com "TRT & hCG Calculator" (com.appsoup) — APP
2. sanctuarywellnessinstitute.com/mens-health/testosterone-dosage-calculator.php — TOOL, CLINIC
3. balancemyhormones.co.uk/trt-uk/trt-dosages — ART+TOOL, UK CLINIC
4. USPTO 12310978 — ACAD
5. origintrt.co.uk/syringe-guide — ART, UK CLINIC
6. USPTO 11672807 — ACAD
7. helloregimen.com/tools/trt-dose-calculator — TOOL, TRACKER
8. USPTO 10881670 — ACAD

Tools vs articles: 3 tools, 2 articles, 3 patents, 1 app. Vendors: 0 (clinics instead). Regimen ~#7. Reddit none; excelmale.com forum thread appears on the 200 mg/mL variant.
Weaknesses: 3 patents on page 1 = weak SERP; clinic tools are lead magnets; Muscle & Brawn's "dose by age/BF%" is medically dubious; no page offers weekly-dose → per-injection units across cadence (E3.5D, EOD, daily) with a syringe visual plus a steady-state estimate together (Regimen has the first half).
Variant "testosterone injection calculator 200mg/ml insulin syringe units" → trtplug.com/tools/trt-syringe-calculator, helloregimen tool + 2 blog posts, trtinjectioncalculator.com (EMD), injectbuddy.com (indie, no-login, embed widget), menshealthspan.com (clinic), optipin.app/trt-dose-calculator (tracker app), excelmale forum.

## 12. `testosterone cypionate calculator`

1-2. Wikipedia (cyclohexylpropionate, cypionate) — noise
3. evrycalc.com/trt.php — TOOL, generic calc site (simulates T/E2 and flags hematocrit/prostate/lipid "risk" — overreach)
4. menshealthspan.com/testosterone-dosage-calculator-use-insulin-syringes-for-trt — TOOL, CLINIC
5. helloregimen.com/tools/trt-dose-calculator — TOOL, TRACKER
6. helloregimen.com/blog/testosterone-cypionate-dosage-guide — ART, TRACKER
7. balancemyhormones.co.uk — CLINIC
8. muscleandbrawn.com/testosterone/trt-dosage-calculator — TOOL, AFFILIATE (dose by age/BF%/activity)

Vendors: 0. Regimen 2/8. Reddit none. Ambiguous intent (dose vs half-life vs cost) — the SERP mixes them.

## 13. `peptide interaction checker`

1. nature.com/articles/s41598-019-38498-7 (InterPep) — ACAD
2. arxiv.org/pdf/2604.18467 — ACAD
3. USPTO 9243243 — ACAD
4. ncbi PMC11386291 (crosslinking assay) — ACAD
5. biorxiv InterPep preprint — ACAD
6. ncbi PMC6414505 — ACAD

100% academic protein-peptide binding-site prediction. Zero consumer tools, zero vendors, zero trackers. The literal phrase has no consumer SERP — do not target it as-is.
Consumer-phrased variants:
- "peptide stack interactions checker" → peptideprotocolwiki.com/tools/stack-checker ("50+ documented pairwise interactions", "no vendor affiliations", launched 18 tools via 24-7pressrelease), peptideclock.com/tools/stack-checker, greypeptides.com/tools/drug-interactions (296-peptide encyclopedia, "no product sales"; note separate vendor lookalikes greypeptidesmarket.com / greypeptidesupplies.com), pathtopeptides.com/StackChecker.html (50+ compounds, "safety score").
- "peptide drug interaction checker semaglutide testosterone" → drugs.com semaglutide interactions (#1-2; authority, but no research peptides), 5x PMC, pathtopeptides.com/InteractionChecker.html, pepedhub.com/tools/interaction-checker ("clinical-grade"), formblends.com/tools/drug-interaction-checker.
- "can you take BPC-157 with semaglutide together" → YouTube, four med-spa/clinic blogs (optimumpeakwellness, vigammedicalspa, prestigemedigroup, adprecisionhealth), trimrx.com — all articles, all say "no human data".
Weaknesses: incumbents are 2026-launched content sites with unverifiable interaction databases and "synergy scores"; drugs.com covers approved drugs only; Regimen has no such tool in results. Demand is question-shaped ("can I take X with Y"), not tool-shaped.

## 14. `free testosterone calculator`

1. issam.ch/freetesto.htm — TOOL, academic (Ghent/Vermeulen, decades old)
2. apps.apple.com Bio-T — APP
3. optimaldx.com/calculators/free-testosterone — TOOL (functional-medicine lab platform)
4. blog.healthmatters.io free-testosterone-calculator (May 2026) — ART+TOOL (lab-tracking SaaS)
5. pctag.uk/testosterone-calculator — TOOL
6. balancemyhormones.co.uk/free-testosterone-calculator — TOOL, CLINIC
7. apexmenswellness.com — TOOL, CLINIC
8. elevatewellnessgroup.com — TOOL, CLINIC
9. truenorthmetabolic.com — TOOL, CLINIC
10. edenclinic.co.uk — TOOL, CLINIC
Also seen: omnicalculator.com/health/free-testosterone, mdapp.co.

Tools vs articles: all tools. Vendors: 0; clinics 6/10. Regimen absent (targeted search confirmed no helloregimen free-T page). Reddit none. Different intent (lab interpretation, Vermeulen from total T + SHBG + albumin) — not a dosing tool, but a natural add for a tracker that logs labs; HealthMatters (a lab tracker) is doing exactly that. Ambiguity: "free" = free-of-charge vs free-T.

---

## Cross-cutting observations

- Vendor domination is real only on the generic head terms (`peptide reconstitution calculator`, `bacteriostatic water calculator`, `peptide dosage calculator`, `peptide calculator`): 40-55% of slots are vendors/affiliates, plus Rite Aid (pre-vendor) at or near #1. Compound-specific GLP-1 and all TRT/testosterone queries have zero explicit vendors and are won by tracker apps, clinics, EMD tools, or noise.
- Tracker-app tool pages already rank: Regimen (8/14 SERPs), Shotlee, MyTRT, PeptideUniv, PepSync, OptiPin. The format that wins is a standalone, indexable, no-login page with the calculator above the fold, an on-page units chart, worked example, FAQ ("how many units is X mg"), and a soft app CTA.
- Programmatic per-compound pages are table stakes (WPA, PeptideUniv, PepSync, Regimen, mypeptidematch all have semaglutide / tirzepatide / retatrutide / BPC-157 / TB-500 variants).
- Page-1 noise (patents, clinical trials, Wikipedia, PMC) on half-life, TRT dose, cypionate, interaction, and "how many units is 2.5 mg tirzepatide" signals low competition — a competent page should land on page 1 quickly.
- Question-phrased long-tail is large and mostly served by articles (Doctronic, Flow Wellness, freemedicaljournals, brainly, justanswer, med-spa blogs). Calculator pages that embed the specific answers ("5 mg + 2 mL: 0.25 mg = 10 units") capture these.
- Reddit did not surface for any query in this engine; excelmale.com (TRT forum) did once. YouTube surfaced for peptide reconstitution, BPC-157, and the BPC+semaglutide question.
- Weak spots in Regimen's coverage: no cypionate-specific half-life page (enanthate page ranks by proxy), no generic BAC-water page ranking, no interaction/stack checker in results, no free-T calculator, absent from the BPC-157 head term.
- TherapyLog: no presence, and the brand string collides with an unrelated school-therapy Medicaid app that owns apps.apple.com/us/app/therapylog/id1098719720.

## Verdict: what to build first

1. **Semaglutide + tirzepatide (+ retatrutide) reconstitution/units pages, one per compound**, with vial-size presets, BAC-water presets, dose-escalation-to-units table, U-100 syringe visual, and FAQ answers for "how many units is X mg". Highest demand cluster, vendors are a minority, thin SERPs (6 results on tirzepatide), and tracker apps already rank at #3. Add a single generic "peptide reconstitution / BAC water calculator" page as a hub but don't expect to beat Rite Aid/vendors on it.
2. **TRT dose calculator + testosterone half-life/steady-state page (cypionate, enanthate, propionate, undecanoate with ester compare and peak/trough at any cadence)**. Zero vendors, patents and app listings on page 1, only Regimen and MyTRT compete, and Regimen lacks a cypionate page. TherapyLog already has PK curves, so this is the cheapest differentiated page. Pair with a **units ↔ mg ↔ mL converter** that handles both directions and the 0.3/0.5/1 mL barrels, with the "0.25 mL = 25 units" FAQ.
3. **Defer the interaction checker under that name**; there is no consumer SERP for "peptide interaction checker". If shipped, frame it as "peptide stack checker" / "can you take X with Y" pages driven by question phrasing, and expect to compete with 2026 content sites (Peptide Protocol Wiki, Grey Peptides, PathToPeptides). A **free testosterone (Vermeulen) calculator** is a cheaper adjacent win for the TRT audience: clinic-dominated, no tracker app ranks, and it feeds TherapyLog's lab logging.
