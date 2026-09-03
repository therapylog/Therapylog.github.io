# SERP audit: marker-shaped queries for TherapyLog /markers/

Date: 2026-09-03. Method: WebSearch only (page fetching blocked). Page type and byline are inferred from domain, title and snippet, not from reading the page. 17 target queries plus 12 supplementary probes (reddit variants, tracker-app intent, testosterone assay, IGF-1/ferritin/Lp(a) rephrasings).

## Caveats on the engine

- This engine is not Google. Adding "reddit" to a query returned Wikipedia/EPFL/DOAJ noise, not threads. Google SERPs for the TRT queries almost certainly carry r/Testosterone, r/trt and YouTube carousels; treat forum/video presence below as under-counted. Excelmale.com surfaced on 4 queries and is the best forum proxy here.
- USPTO patent PDFs and clinicaltrials.gov protocol PDFs pollute the technical queries (LC/MS estradiol, IGF-1 by age, ferritin TRT). Read that pollution as "few strong consumer pages indexed", i.e. weak competition, not as real competitors.
- No "related searches" block is returned. Volume signal below is a proxy: how many phrasings return dense, overlapping, consumer-grade results.

## Legend for page types

clinic = brick-and-mortar or physician-run practice blog; telehealth = DTC online prescriber (Hims, Hone, Arcline, Tactus); lab co = Labcorp/Mayo/Quest catalog or blog; reseller = online lab-order storefront (RequestATest, Walk-In Lab, Ulta, DiscountedLabs, Life Extension, Accesa); lab startup = at-home/longevity testing companies (SiPhox, Superpower, Levels, Mito, Eureka, Choose Health); reference = medically reviewed encyclopedic site (testing.com, Healthline, Ada, Medscape, hospital encyclopedias); academic = PMC/journal/university; forum; video; AI-answer = droracle.ai-style generated pages; content site = TRT-niche SEO site without clinical identity.

---

## 1. "sensitive estradiol vs standard"

Top results:
- https://requestatest.com/estradiol-sensitive-blood-test — reseller product page, no byline
- https://moreplatesmoredates.com/sensitive-assay-estradiol-test/ — influencer blog (Derek/MPMD), no medical byline
- https://www.arcline.health/blog/sensitive-estradiol-test-vs-standard/ — telehealth blog, title literally "Why the Assay Matters on TRT"
- https://www.excelmale.com/threads/estradiol-sensitive-vs-standard-testing.27629/ — forum
- 2x USPTO patent PDFs — noise

Bylines: none evident on the winners; Arcline probably carries a "medically reviewed" stamp but is a prescriber, not neutral.
Assay distinction explained: yes, by MPMD (Roche ECLIA vs LC-MS/MS, "wildly inaccurate in men") and Arcline. This is the one query where the winners get the assay story right.
Gaps: no reference site (testing.com, Healthline) targets the comparison; no lab company explains it in patient language; nobody lists the actual order codes (Labcorp 140244 vs 004515, Quest 30289 vs 4021) side by side; nobody explains that serial results across methods are not comparable, which is the tracker's core value.
Tracker apps: none.
Volume signal: strong. Three phrasings (this, #2, #3) all return dense results with overlap.

## 2. "estradiol sensitive test vs regular"

Top results:
- https://requestatest.com/estradiol-sensitive-blood-test — reseller
- https://www.lifeextension.com/lab-testing/itemqd030289/estradiol-sensitive-blood-test — reseller
- https://moreplatesmoredates.com/sensitive-assay-estradiol-test/ — influencer
- https://www.labcorp.com/tests/140244/estradiol-sensitive-lc-ms — lab co catalog
- https://www.mayocliniclabs.com/test-catalog/overview/81816 — lab co catalog (EEST)
- https://www.accesalabs.com/Ultrasensitive-Estradiol-Test — reseller
- clinicaltrials.gov PDF — noise

Bylines: none. Labcorp/Mayo are authoritative but catalog pages, not explainers.
Assay distinction: catalog pages state the method and the "results obtained with different assay methods cannot be used interchangeably in serial testing" warning; resellers give one sentence ("better detection at the lower limits"). No page turns the non-interchangeability warning into advice.
Gaps: same as #1. Also "ultrasensitive" vs "sensitive" naming confusion is unaddressed.
Tracker apps: none.

## 3. "LC/MS estradiol test"

Top results:
- https://www.sciencedirect.com/science/article/abs/pii/S0009912023000036 — academic
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7112139/ — academic
- https://womenshealth.labcorp.com/tests/140244/estradiol-sensitive-lc-ms — lab co catalog
- https://www.labcorp.com/tests/500108/estradiol-lc-ms-endocrine-sciences — lab co catalog
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7252770/ — academic
- 4x USPTO patents — noise

Bylines: institutional/academic only.
Assay distinction: it is the whole SERP, but at journal level. Zero consumer explainer.
Gaps: total absence of a plain-English "what LC/MS/MS means on your lab report and which code to order" page. Intent is probably lower volume and more technical, but it is an uncontested long-tail cluster and a natural sub-section of page #1.
Tracker apps: none.

Supplementary probe "estradiol immunoassay overestimates men sensitive assay":
- https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/a-f/estradiol-testing-in-men — ADLM (AACC) guidance: immunoassay only appropriate above ~50 pg/mL; men should be measured by LC-MS. Best citation for the estradiol page.
- https://www.discountedlabs.com/blog/accurate-estradiol-testing — reseller explainer (Nelson Vergel), does explain assay.
- https://aacrjournals.org/cebp/article/19/4/903/68242/ — academic.

## 4. "free vs total testosterone"

Top results:
- https://www.hims.com/blog/free-vs-total-testosterone — telehealth, medically reviewed
- https://www.medichecks.com/blogs/testosterone/what-s-the-difference-between-total-and-free-testosterone — UK lab co
- https://www.ondemand.labcorp.com/blog/total-testosterone-vs-free-testosterone — lab co blog
- https://www.testing.com/tests/testosterone-test-free-and-total-test/ — reference, medically reviewed
- https://www.mayocliniclabs.com/test-catalog/overview/83686/... — lab co catalog (TTFB)
- PMC paper, USPTO patent — noise

Bylines: yes, this is a bylined, saturated head term (Hims, testing.com, Labcorp).
Assay distinction: none of the snippets mention that "free testosterone" arrives via three incompatible methods (direct analog immunoassay, calculated/Vermeulen from total+SHBG+albumin, equilibrium dialysis) and that the direct analog assay is widely considered unreliable. Mayo's TTFB catalog implies it. That angle is open.
Gaps: method-of-free-T explainer plus a calculator; no page connects free T to the SHBG page.
Tracker apps: none.
Volume signal: very high, but head term is owned. Only winnable via the method/calculator angle.

Supplementary probe "testosterone LC/MS vs immunoassay test": 9/9 results academic (PMC 8589107, PubMed 34628183, ScienceDirect, Clin Chem supplement). Zero consumer pages. Snippet-level facts worth reusing: immunoassay ~20% lower than LC-MS/MS with minimal correlation below 100 ng/dL; 53.7% vs 26.3% classified hypoandrogenemic by immunoassay vs LC-MS/MS in one cohort.

## 5. "high SHBG meaning"

Top results:
- https://siphoxhealth.com/articles/what-does-high-shbg-mean — lab startup
- https://drbrighten.com/symptoms-of-high-or-low-shbg-levels/ — ND-bylined blog (women-focused)
- https://ada.com/hormones/sex-hormone-binding-globulin-shgb/ — reference
- 5x PMC papers — academic
- https://pediatric.testcatalog.org/show/SHBG1 — lab co catalog

Bylines: drbrighten (ND), Ada (medical review), SiPhox (unknown).
Assay distinction: n/a (SHBG immunoassay is standard), but no page explains that SHBG feeds the calculated free T and so drives the free/total gap.
Gaps: nothing TRT-specific in the top 3; tail is academic, i.e. weak commercial competition.
Tracker apps: none.

## 6. "low SHBG on TRT"

Top results:
- https://themenshealthclinic.co.uk/trt-shbg-and-health-facts-questions-and-evolution/ — UK clinic
- https://onlinelibrary.wiley.com/doi/full/10.1111/andr.12813 — academic (Ramachandran 2020, SHBG subgroups on TRT)
- https://www.mazemenshealth.com/blog/shbg-low-t/ — clinic
- https://www.youtube.com/watch?v=liuQET6wlM8 — video
- https://superpower.com/guides/sex-hormone-binding-globulin-shbg — lab startup guide
- https://www.excelmale.com/threads/low-shbg-zero-libido-help-please.29830/ — forum
- 2x clinicaltrials.gov PDFs — noise

Bylines: clinics are physician-run; no US telehealth major present.
Assay distinction: n/a.
Gaps: noisy SERP with video, forum and academic in the top 8 = weak competition. No page covers the practical TRT-specific questions together: SHBG suppression from injections, dosing frequency effects, why low-SHBG men need trough-timed draws, and what it does to the calculated free T.
Tracker apps: none.
Supplementary probe "low SHBG TRT reddit" surfaced https://www.healthline.com/health/low-shbg (reference), two Substacks (bowtiedloon, syllabushealth "High SHBG and Low Free T") and a Gumroad ebook (testonation) — i.e. newsletter/creator content is filling the gap, not clinics.
Volume signal: moderate; long-tail but consistent.

## 7. "high hematocrit on testosterone"

Top results:
- https://www.renalandurologynews.com/reports/intramuscular-testosterone-therapy-tied-with-rise-in-hematocrit/ — medical news
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11466264/ — academic (phlebotomy review)
- https://www.auajournals.org/doi/10.1097/JU.0000000000002188 — academic (route meta-analysis)
- https://brentwoodmd.com/what-causes-high-hematocrit/ — clinic, physician-bylined
- https://thebh.us/blog/high-hematocrit-on-trt-why-it-matters-for-your-brain-and-heart/ — clinic/telehealth blog
- https://honehealth.com/edge/how-to-lower-hematocrit-on-trt/ — telehealth, medically reviewed
- clinicaltrials.gov PDF — noise

Bylines: yes (Hone, Brentwood MD).
Assay distinction: n/a.
Gaps: consumer pages cover thresholds (52-54%), route, phlebotomy. Not covered in snippets: trough vs peak timing of the CBC, hydration/altitude artefacts, the ferritin cost of repeated phlebotomy, and trend-over-time framing. The hematocrit-to-ferritin link is the tracker-native angle.
Tracker apps: none.
Volume signal: high; two phrasings return the same three consumer winners.

## 8. "hematocrit TRT"

Top results:
- https://www.auajournals.org/doi/10.1097/JU.0000000000002188 — academic
- https://en.wikipedia.org/wiki/Hematocrit — reference
- https://pubmed.ncbi.nlm.nih.gov/40126900/ — academic (2025 narrative review)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12052019/ — academic
- https://brentwoodmd.com/what-causes-high-hematocrit/ — clinic
- https://honehealth.com/edge/how-to-lower-hematocrit-on-trt/ — telehealth
- https://thebh.us/blog/high-hematocrit-on-trt-why-it-matters-for-your-brain-and-heart/ — clinic/telehealth

Same winners as #7. Supplementary reddit probe surfaced https://excelmale.substack.com/p/high-hematocrit-and-testosterone (forum-owner newsletter) with the cleanest consumer framing seen: investigate >50, intervene >52, stop/phlebotomy >54, and "phlebotomy depletes iron; monitor ferritin".

## 9. "prolactin on TRT"

Top results:
- 2x PMC (ovariectomy/prolactin; hypoprolactinemia) — academic, off-target
- https://trtcatalog.com/protocols/prolactin-on-trt-when-to-test-lower — content site, "(2026)" in title = SEO play
- https://mensreproductivehealth.com/testosterone-and-prolactin-understanding-the-hormonal-relationship/ — content site
- https://mensthrive.com/7-most-important-tests-to-diagnose-low-testosterone-before-starting-trt/ — clinic
- https://www.boltpharmacy.co.uk/guide/can-testosterone-treatment-cause-high-prolactin — UK pharmacy
- https://www.droracle.ai/articles/192228/... and /161787/... — AI-answer pages (2 of top 8)

Bylines: weak. Winners are niche content sites and AI-generated answer pages; no telehealth major, no reference site.
Assay distinction: none. Prolactin has real pre-analytic issues (fasting, mid-morning, no orgasm/exercise before draw, macroprolactin false highs) that snippets only partly mention.
Gaps: clear opening; a bylined explainer with draw conditions, the E2-to-prolactin pathway and when to repeat/confirm would out-rank AI pages.
Tracker apps: none.
Volume signal: low-moderate.

## 10. "DHT levels TRT"

Top results:
- https://academic.oup.com/edrv/article/38/3/220/3788611 — academic (Endocrine Reviews)
- https://blogs.bcm.edu/2025/08/11/does-testosterone-replacement-therapy-cause-hair-loss/ — academic medical center blog, physician byline
- https://www.trted.org/articles/dihydrotestosterone-dht — content site
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4245724/ — academic (route meta-analysis: transdermal 5.46x vs IM 2.20x)
- https://lamkinclinic.com/dht/ — clinic, physician byline, explicitly "Reference Range, TRT Monitoring"
- USPTO patent — noise

Bylines: yes (Baylor, Lamkin).
Assay distinction: not in snippets. DHT is a marker where immunoassay cross-reactivity with testosterone is a known problem and LC/MS/MS is preferred; nobody says so.
Gaps: route effect (gel vs injection) plus assay note plus hair-loss/finasteride framing in one page. Moderate opening.
Tracker apps: none.

## 11. "IGF-1 normal range by age"

Top results:
- 6x USPTO octreotide patents — noise (indicates almost no strong consumer page indexed)
- https://hsc.wvu.edu/media/5178/igf-1-all.pdf — academic PDF
- 2x PMC (Chinese cohorts) — academic
- https://www.urmc.rochester.edu/encyclopedia/content?contenttypeid=167&contentid=insulin_like_growth_factor — hospital reference

Supplementary "IGF-1 levels by age chart ng/mL": same patents, plus https://academicpath.org/normal-igf-1-levels-by-age-chart (thin SEO site) and https://www.healthcare.uiowa.edu/path_handbook/rhandbook/test3578.html (academic table).

Bylines: hospital/academic only; the one consumer page is a thin SEO site.
Assay distinction: none. IGF-1 ranges differ materially by platform (Labcorp Immulite immunoassay vs Quest LC/MS/MS) and results are not interchangeable; nobody says so. Age-banded ranges and Z-scores are also unexplained.
Gaps: the biggest gap in the set. This is the peptide (GH secretagogue: ipamorelin, CJC, tesamorelin) audience's primary marker and there is no good page.
Tracker apps: none (Regimen mentions IGF-1 in its feature copy but has no explainer).
Volume signal: moderate-high judging by a thin SEO site chasing the chart variant.

Supplementary "IGF-1 bloodwork peptides what to test": Labcorp OnDemand product page, Labcorp 010363 catalog, a Taylor & Francis review "Challenges of IGF-1 testing", patents. No consumer peptide-monitoring page at all.

## 12. "ApoB optimal level"

Top results:
- https://superpower.com/blog/optimal-apob — lab startup
- https://siphoxhealth.com/articles/what-are-normal-apob-levels-and-why-do-they-matter — lab startup
- https://www.levels.com/blog/how-to-reduce-apob — lab startup, medically reviewed
- https://www.eurekahealth.com/resources/apob-levels-optimal-range-heart-disease-risk-en — lab startup
- https://mitohealth.com/blog/apob-biomarker-health-heart-longevity — lab startup
- https://lamkinclinic.com/apob/ — clinic, physician byline
- https://emedicine.medscape.com/article/2087335-overview — reference, physician byline

Bylines: yes (Levels, Lamkin, Medscape).
Assay distinction: n/a.
Gaps: saturated by longevity-lab startups (5 of 7). The only unclaimed angle is "ApoB on TRT / on GLP-1" (TRT's LDL/HDL effects, GLP-1's lipid effects), which none of the winners address.
Tracker apps: none.
Volume signal: high.

## 13. "Lp(a) meaning"

Top results: 8/8 PMC review papers (PMC12827608, PMC9918959, PMC5352764, PMC3591100, PMC6865184, PMC12785701, PMC11607505, PMC5471681).

Supplementary "high lipoprotein a what does it mean":
- https://www.heart.org/en/health-topics/cholesterol/genetic-conditions/lipoprotein-a and /lipoprotein-a-risks — AHA
- https://www.heartuk.org.uk/genetic-conditions/high-lipoproteina — charity
- https://familyheart.org/high-lipoprotein-a — charity
- https://www.novartis.com/us-en/stories/high-lipoproteina-explained-... — pharma

Bylines: institutional (AHA, Heart UK, Family Heart, Novartis).
Assay distinction: not in snippets, and it matters: Lp(a) is reported in nmol/L or mg/dL, the two are not convertible by a fixed factor, and the assay isoform-sensitivity issue is real. The AHA snippet quotes both units side by side without saying they are assay-dependent.
Gaps: "what is Lp(a)" is owned by institutions; "Lp(a) nmol/L vs mg/dL, why my two results don't match" is open and squarely an assay-as-first-class-field story.
Tracker apps: none.
Volume signal: high for the generic term, but off-core for TRT/peptide/GLP-1 users.

## 14. "ferritin TRT"

Top results:
- 5x PMC (thalassemia, obesity, blood donors, ferritin history, "biomarker requiring caution") — academic, mostly off-target
- https://www.youtube.com/watch?v=NBfIlC5J1r4 — video ("Low Ferritin Levels: Need Treatment on TRT?")
- https://www.droracle.ai/articles/200603/can-testosterone-replacement-therapy-trt-cause-low-ferritin-levels — AI-answer

Supplementary "low ferritin on TRT":
- https://www.youtube.com/watch?v=-8MtEzWoZs0 and NBfIlC5J1r4 — video x2
- https://www.excelmale.com/threads/warning-for-men-on-trt-low-ferritin-is-bad.5829/ — forum
- droracle.ai — AI-answer
- PMC/clinicaltrials/arxiv — noise

Bylines: none. No clinic, telehealth, lab company or reference page in the top results for either phrasing.
Assay distinction: n/a, but the "ferritin is an acute-phase reactant" nuance (PMC5223018 snippet) is exactly what a tracker page should carry.
Gaps: the second-biggest gap. The story (testosterone suppresses hepcidin, ferritin drops ~32% within 3 months, phlebotomy for hematocrit compounds it, symptoms of low ferritin with normal hemoglobin) is only told on YouTube and a forum thread.
Tracker apps: none.
Volume signal: low-moderate, but tightly coupled to the high-volume hematocrit cluster.

## 15. "what does high estradiol on TRT feel like"

Top results:
- https://legerclinic.co.uk/blogs/testosterone-health-hub/oestrogen-and-trt-... — UK clinic
- https://revolutionhealth.org/blogs/news/high-estrogen-men-testosterone — clinic, physician-run
- https://balancemyhormones.co.uk/testosterone-and-the-symptoms-of-high-estrogen-in-men/ — UK TRT clinic
- https://www.affinitywholehealth.com/blog/estrogen-management-on-trt-... — clinic
- https://tactushealth.com/trt/blog/symptoms-high-estrogen-trt/ — telehealth
- https://honehealth.com/edge/high-estrogen-on-trt-symptoms/ — telehealth, medically reviewed
- https://ultimatemale.com/health-and-wellness-blog/managing-estrogen-on-trt-... — clinic

Bylines: yes across the board; 7/7 are prescribers.
Assay distinction: no. Snippets quote "20-40 pg/mL optimal, symptoms above 40-50" with no statement of which assay, which makes the numbers meaningless for a man whose standard-assay result reads 30 pg/mL higher. This is the single most consequential omission in the whole audit because it sits on the highest-intent query.
Gaps: an assay-aware symptom page ("nipple sensitivity at 45 on sensitive assay is not the same as 45 on ECLIA") would be unique. Also: symptoms of low E2 (from AI over-use) get mentioned by none of the snippets.
Tracker apps: none.
Volume signal: high.

## 16. "TRT bloodwork what to test"

Top results:
- https://www.testing.com/tests/trt-test/ — reference, medically reviewed
- https://www.choosehealth.io/articles/trt-monitoring-what-blood-tests-are-required-on-testosterone-therapy — lab startup
- https://www.discountedlabs.com/blog/monitoring-your-blood-tests-while-on-testosterone — reseller (Nelson Vergel, Excelmale founder)
- https://www.affinitywholehealth.com/blog/essential-labs-for-testosterone-therapy — clinic
- https://www.walkinlab.com/products/view/testosterone-replacement-therapy-trt-blood-test-panel — reseller product page
- https://www.ultalabtests.com/test/testosterone-replacement-therapy-trt-plus-panel — reseller product page

Bylines: testing.com only.
Assay distinction: not in snippets. DiscountedLabs historically insists on sensitive E2 in its panels, but the SERP-level content is a flat list (free/total T, E2, CBC, CMP, lipids, PSA, LH/FSH).
Gaps: 3 of 6 results are storefronts. A neutral checklist that adds assay (sensitive E2, LC/MS T where available), draw timing (trough, 7-10am), cadence (6-12 weeks then 6-monthly), and "record which assay" is unclaimed. This is the natural hub page linking to every marker page.
Tracker apps: none.
Volume signal: high; two phrasings share 4 of 6 results.

## 17. "trt blood test list"

Top results:
- https://www.testing.com/tests/trt-test/ — reference
- https://requestatest.com/testosterone-replacement-therapy-trt-male-hormone-panel-blood-test — reseller
- https://www.choosehealth.io/articles/trt-monitoring-... — lab startup
- https://www.affinitywholehealth.com/blog/essential-labs-for-testosterone-therapy — clinic
- https://www.ultalabtests.com/test/testosterone-replacement-therapy-trt-plus-panel — reseller
- clinicaltrials.gov PDF — noise

Same picture as #16; storefront-heavy.

---

## Tracker-app presence

On the 17 marker queries: zero tracker apps in any result set.

On app-intent queries ("TRT tracker app bloodwork", "lab results tracker app testosterone peptides") the field is crowded with App Store listings and thin landing pages:
- https://apps.apple.com/us/app/trt-ai-testosterone-tracker/id6772991478 (TRT AI)
- https://apps.apple.com/us/app/trough-trt-tracker/id6760955550 (Trough; "custom reference ranges")
- https://apps.apple.com/us/app/my-trt-app/id6745529127 and https://www.mytrt.app/press (My TRT App; AI extraction of 55+ biomarkers from PDFs)
- https://apps.apple.com/us/app/trt-tracker-injections-log/id6747364258
- https://apps.apple.com/us/app/trt-vault/id6762535061 (TRT Vault; explicitly lists TT, FT, E2, SHBG, Hct, Hgb, LH, FSH, prolactin, PSA)
- https://trtbuddy.com/, https://trtmonitor.com/, https://trtplus.app/, https://www.trtracker.com/
- https://apps.apple.com/us/app/optipin-trt-peptide-tracker/id6745631936 (OptiPin; mentions DHT tracking)
- https://helloregimen.com/ plus https://helloregimen.com/testosterone-tracker and https://helloregimen.com/blog/best-peptide-tracker-apps-2026 (Regimen; the only tracker doing content SEO: a "best peptide tracker 2026" listicle and a testosterone-tracker landing page; mentions IGF-1 and PK modelling)
- https://stackeddd.app/ (Stackeddd; women on T/peptides/GLP-1, lab PDF import)
- https://play.google.com/store/apps/details?id=com.regimen.app

None of these publish marker explainer pages. None mention assay method in their snippet copy (Trough's "custom reference ranges" is the closest). /markers/ is uncontested among trackers, and assay-as-field is a differentiator none of them articulate.

## Cross-cutting observations

1. Assay distinction is explained only on the query that names it (sensitive vs standard), and only by an influencer (MPMD) and a telehealth prescriber (Arcline). On every downstream query where it changes the interpretation (high-E2 symptoms, free T method, DHT, IGF-1 platform, Lp(a) units) no winner mentions it.
2. Bylines: telehealth (Hims, Hone) and physician clinics (Lamkin, Brentwood MD, Revolution Health, Baylor) own the head terms. Long-tail TRT-side-effect queries (prolactin, ferritin, low SHBG) are won by content sites, AI-answer pages, YouTube and forums, i.e. beatable with a bylined page.
3. Longevity-lab startups (Superpower, SiPhox, Levels, Mito, Eureka, Choose Health) own the cardiometabolic markers (ApoB, and increasingly SHBG). Competing head-on there is expensive; the TRT/GLP-1 angle is the only opening.
4. The "TRT bloodwork" hub SERP is half storefronts, so a neutral, assay-aware checklist has a real chance and is the right internal-link hub.
5. Authoritative citations to reuse: ADLM "Estradiol Testing in Men" (myadlm.org), Labcorp 140244 / Mayo EEST non-interchangeability language, AUA J Urol route meta-analysis (hematocrit), PMC4245724 (DHT by route), Ramachandran 2020 Andrology (SHBG subgroups), PMC8589107 (testosterone immunoassay inaccuracy).

## Verdict: first 10 /markers/ pages

Tier 1 (assay-differentiated, weak or beatable competition, core audience):
1. estradiol-sensitive-vs-standard — the flagship: ECLIA vs LC/MS/MS, why immunoassay over-reads men, order codes by lab, non-interchangeability, "log the assay". Beats MPMD/Arcline on neutrality and completeness.
2. high-estradiol-on-trt-symptoms — the assay-aware version; every winner quotes 20-40 pg/mL without naming the assay. Include low-E2 symptoms.
3. hematocrit-on-trt — 50/52/54 thresholds, route effect, trough timing, hydration artefacts, and the ferritin cost of phlebotomy. Competitive but the ferritin link is unclaimed.
4. ferritin-on-trt — no clinic/reference page exists; hepcidin, ~32% drop in 3 months, phlebotomy depletion, ferritin as acute-phase reactant.
5. igf-1-by-age — age-banded table plus Z-score plus platform non-interchangeability (Immulite vs LC/MS/MS). Biggest gap; the peptide audience's primary marker.
6. shbg-on-trt — one page for high and low: suppression on injections, dosing frequency, why it drives calculated free T, trough draws. Competition is UK clinics, Substacks and a Gumroad ebook.
7. prolactin-on-trt — draw conditions, macroprolactin, E2 pathway, when to repeat. Winners are AI-answer and content sites.
8. trt-bloodwork-checklist (hub) — what, when, which assay, cadence; links to 1-7 and 9-10; replaces a storefront-heavy SERP.

Tier 2 (head terms owned by others; win only via the method angle):
9. free-vs-total-testosterone — direct RIA vs calculated (Vermeulen) vs equilibrium dialysis, plus a calculator; fold the testosterone immunoassay-vs-LC/MS story in here.
10. dht-on-trt — route (gel 5.5x vs IM 2.2x), immunoassay cross-reactivity vs LC/MS/MS, hair-loss framing.

Defer: lp-a (institution-owned; do "nmol/L vs mg/dL, assay-dependent" later), apob (startup-saturated; do "ApoB on TRT / GLP-1" later), standalone testosterone-lc-ms-vs-immunoassay (academic-only SERP, low consumer volume; cover inside #9).
