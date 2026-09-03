# TherapyLog SEO plan — free tools and lab-marker pages first

**Written:** 3 September 2026, from a line-by-line read of `app.html`, the marketing pages,
`scripts/`, and the docs in this folder. Every file path, line number and function name below
was checked against the repo on that date; re-verify line numbers with `grep -n` before editing,
because `app.html` moves.

**How to use this file:** open the site repo in Claude Code and paste the prompt in §0. The
prompt tells the agent to read this plan and execute it phase by phase. Phases are ordered so
that each one ships on its own and nothing waits on a later phase.

**Decisions this plan records** (mirror them in `LEDGER.md`):

- The **named author is Joel Gonzales**, founder, with a disclosed non-clinical role, a
  published editorial and review policy, and primary-literature citations on every claim. A
  paid clinical reviewer is an upgrade later, not a prerequisite. This resolves ledger open
  item 2 and the Focus board decision `d-author`. Confirm the public form of the name before
  the first page ships.
- **Order:** technical foundation → calculator pages → marker pages → compound pages.
  Comparison pages ("TherapyLog vs Regimen") are deferred indefinitely.
- **Calculators are free tier and stay free.** `TLTier.check()` at `app.html:7898` wraps only
  `scanLabImage` and `sendChat` (lines 8142–8148); none of the calculators reference `TLTier`.
  Public tool pages therefore promise nothing that is gated.
- **Paid ads:** Google is content-blocked, not certification-blocked (§11). Reddit Ads and
  newsletter/podcast sponsorships are open. Meta and TikTok stay closed.

---

## 0. The prompt to paste into Claude Code

Paste this into Claude Code with `/home/<you>/Therapylog.github.io` open (branch off `main`):

```
Read docs/LEDGER.md first, then docs/SEO-PLAN.md in full. Do not re-open any decision in
LEDGER.md §1. Then implement docs/SEO-PLAN.md phase by phase, in order, committing at the end
of each phase with a message that names the phase.

Rules for this work:
- Never edit the data or logic inside app.html except the one change to sw.js described in
  Phase 0. Calculators on the new pages must run the SAME functions as the app: extract their
  source text from app.html at build time (Phase 1 explains how) so the numbers cannot drift.
- Every generated page must pass the compliance checklist in §9 and the validators in
  scripts/. Add the new pages to the validator page lists as §5 and §6 say, then run:
  node scripts/validate-compliance.js && node scripts/validate-claims.js &&
  node scripts/validate-encyclopedia.js && node scripts/validate-markers.js &&
  node scripts/validate-guide.js && node scripts/validate-marketing-static.js &&
  node scripts/validate-public-pages.js
  All must exit 0 before you commit.
- Do not add npm dependencies. Every script in this repo is dependency-free Node and runs in
  CI without an install step. Keep it that way.
- Do not delete files. Phase 0 asks you to exclude some files from the published site; do
  that with _config.yml, and list the files in the commit message so the owner can delete them.
- Before writing marker or compound prose, read §6 and §9. Frame everything as what the
  literature and community practice describe, show the basis for every number, keep optimal
  bands labeled non-diagnostic, and end every side-effect discussion with consulting a doctor.
- The author byline on every generated page is the founder, as §8 specifies. Do not invent
  credentials. Do not name a clinical reviewer.
- When a phase is done, run the validators, run node scripts/build-pages.js --check to prove
  the committed output matches the generator, and stop to summarize what shipped and what is
  left before starting the next phase.

Start with Phase 0. Report each file you create or change and why.
```

---

## 1. Why tools and markers come before compound pages

Compound pages are YMYL (Your Money or Your Life) content. They compete with clinics, vendors
and reference sites that carry medical bylines, and Google's quality raters are told to demand
a responsible party for that content. The ledger already gates them on a named author.

Calculators are a different kind of page. A reconstitution calculator is judged on whether it
works, not on who wrote it. Tool pages earn links because people cite calculators in forum
answers and video descriptions. And the person searching "semaglutide reconstitution
calculator" is holding a vial and a syringe right now. That is the TherapyLog user, at the
moment they are most likely to want a tracker. The calculators are free, so the funnel is:
search → free tool on therapylog.app → "save this dose to your log" → app. No paywall between
the search and the value.

Marker pages sit between the two. They are reference content, so the byline matters, but the
registry gives TherapyLog something most sites get wrong: assay method as a first-class field
(`MARKER_REGISTRY` carries variants for `tott`, `freet`, `e2`, `ldl`, `bioavailt`, `ldlp`).
"Sensitive vs standard estradiol", "free vs total testosterone", "high SHBG on TRT" are
exactly the questions this audience types, and the pages that rank today mostly ignore the
assay distinction. That is the differentiation, and it is also the shape of content AI answers
cite.

Skip comparison pages for now. Regimen has a head start on the format and every such page
feeds their brand query. Win on the pages they do not have.

What the search landscape looked like on 3 Sep 2026 (full notes with URLs in
`docs/seo-research/`, a search-only pass, so bylines and formats are inferred from snippets):

- **Calculators.** Generic head terms ("peptide reconstitution calculator", "peptide dosage
  calculator") are won by a pharmacy chain's tool, lab-supply reagent calculators and
  peptide vendors. GLP-1-specific and every TRT query had no vendor on page one. Regimen
  (helloregimen.com/tools/*) ranks on 8 of 14 calculator queries with programmatic
  per-compound pages, but has no testosterone-cypionate page. "Tirzepatide reconstitution
  calculator" returned six results. No page combines a cadence split, a syringe visual and
  steady-state math for TRT. "Peptide interaction checker" has no consumer results at all;
  the demand is phrased "stack checker" and "can you take X with Y".
- **Markers.** No tracker app appears on any of 17 marker queries. Winners are telehealth
  clinics (bylined), lab resellers and, for IGF-1, ferritin and prolactin, thin content sites
  and AI-answer pages. Nobody explains the free-testosterone method question (direct
  immunoassay vs calculated vs equilibrium dialysis) or writes ferritin-on-TRT at all.
  Every "what does high estradiol on TRT feel like" winner quotes 20–40 pg/mL without naming
  the assay. Arcline is the only tracker on the assay-aware angle and it ranks for
  "sensitive estradiol vs standard".
- **Competitors.** Regimen is the SEO leader among trackers: a large blog, ~12 tool pages,
  per-compound tracker landing pages (`/bpc-157-tracker`, `/trt-tracker`), four "vs" pages
  and an `llms-full.txt`; no marker pages, no visible byline. MyTRT (mytrt.app) has 89
  peptide entries with half-lives and three generic marker pages, the closest structural
  analogue. Shotsy and Shotlee run programmatic "<compound> tracker" landing pages. Every
  "best tracker" result is a self-published listicle.
- **Brand.** Every brand query ("TherapyLog", "therapylog app", "therapylog.app") returns an
  unrelated school-therapy documentation product (Therapylog by Research To Practice LLC,
  therapylog.com, three store apps). `site:therapylog.app` returned nothing in the engine
  used. Consequence: qualify the brand everywhere ("TherapyLog — TRT and peptide tracker"
  in titles, `alternateName` in the Organization markup) and confirm indexation in Search
  Console as the first act of Phase 0.

The open slot is unchanged by all of that: a vendor-neutral, assay-aware, no-account set of
calculators and marker pages from a tracking app, with a named author, does not exist yet.

---

## 2. Current state (verified 3 Sep 2026)

Hosting and build:

- GitHub Pages, deploy-from-branch, custom domain via `CNAME`. No Pages workflow.
- **Jekyll is on by accident.** The config file in the repo root is named `" config.yml"` with
  a leading space, so GitHub never reads it (and the file itself is served at
  `/%20config.yml`). There is no `.nojekyll`. Consequence: every file without a leading
  underscore is published; `.md` files without front matter are copied raw, so
  `docs/LEDGER.md`, `docs/COMPLIANCE-AUDIT.md` and `docs/BRAND-AND-ENTITY-STRUCTURE.md` are
  reachable at `https://therapylog.app/docs/<name>.md` by anyone who knows or guesses the
  URL. Nothing links to them, so crawlers are unlikely to have found them yet; that changes
  the moment a sitemap, robots.txt and IndexNow key exist, so fix it first. So are the root
  junk files: `Arctos Labs packaging spec.pdf` (1.2 MB),
  `Supplement Website Design Project (4).zip` (6.8 MB), `IMG_1844.PNG`, `IMG_1856.PNG`, four
  `assets-1786901*.png`, `DNS SETUP.md`. (Live HTTP checks were not possible from the
  environment that wrote this plan; the finding is from the repo and GitHub Pages' documented
  behaviour. Confirm in a browser: open therapylog.app/docs/LEDGER.md.) GitHub Pages serves
  everything with `Cache-Control: max-age=600` and allows no custom headers or server-side
  redirects, so every `noindex` is a meta tag and every renamed slug later costs a `404.html`
  hop. Choose slugs once.
- No `robots.txt`, no `sitemap.xml`, no IndexNow key, no Search Console or Bing verification
  anywhere in the repo, no `404.html`.
- `/app` and `/app.html` are both live URLs for the same document (extensionless resolution is
  a Pages server feature). `app.html` canonical says `/app`; `manifest.webmanifest`
  `start_url`/`id` and the service-worker precache say `/app.html`.
- `sw.js` (81 lines) is network-first with a fixed six-item precache. Line 42 falls back to
  `/app.html` for any failed navigation, so an unvisited `/tools/...` opened offline renders
  the app shell. Googlebot does not run service workers, so this is a UX oddity, not an
  indexing problem, but fix it in Phase 0 anyway.
- Every page loads `/_vercel/insights/script.js`, which 404s on GitHub Pages.
  `scripts/ui-check-site.js:61` requires it, so leave it.

Content and markup:

- Zero JSON-LD on any page. No `<meta name="author">`, no `rel="author"`, no About page. The
  founder's name appears publicly only inside a mailto body on `partnership.html:155` and
  `:334` ("Hi Joel").
- The home nav (`index.html:102–110`) has four slots: Try Free, Providers, Support, Go Pro.
  The footer (`357–367`) has six. Neither links any tool or marker content, `/partnership`, or
  `/providers/`. `pro.html` has no site nav and no link home.
- `index.html` already contains natural anchors for the new pages: `<h3>Reconstitution
  Calculator</h3>` at line 212 and `<h3>Combined Syringe Builder</h3>` at line 170; the
  free-tier checklist at line 314 says "Dose calculator + syringe diagram".
- `support.html` lines 99–100 have an FAQ entry about the reconstitution calculator.
- `guide.html:263` already states the assay rule: "Sensitive (LC/MS-MS) estradiol and
  standard immunoassay estradiol are not the same measurement."

The app's data, all inside `app.html` as JS literals (line numbers as of 3 Sep 2026):

| Symbol | Lines | Notes |
|---|---|---|
| `const DB = {` | 72–265 | 30 classes, 130 compounds, strict JSON (`JSON.parse` on the brace-matched slice works) |
| `const LAB_REF = {` | 298–399 | 100 markers, `{name,unit,lo,hi,olo?,ohi?}`; 31 have optimal bands |
| `/* MARKER-REGISTRY:START` … `END */` | 440–1543 | `MARKER_REGISTRY` (446–1128) plus the pure helpers `resolveMarker` 1168, `normalizeValue` 1184, `classify` 1220, `matchAssayVariant` 1256 |
| `const INTERACTIONS = [` + `NEW_INTERACTIONS` + `CLINIC_INTERACTIONS` | 2797, 4940, 5180 | 50 pairs total, keyed by display **name** |
| `const LAB_FIELDS = [` | 3827–3940 | 100 markers + `labdate` |
| `function getAdjustedLabRanges()` | 5290–5337 | sex/age overrides; reads profile, so replicate its tables, do not import it |
| Reconstitution calculator | 5875–6200 | `tlReconSolve` 5891 and `tlReconOptions` 5913 are pure; `calcUnified` 6013 and `renderSyringe` 6165 are DOM-bound to `uc-*` ids; HTML is the `#tool-calc` fragment on line 1 |
| Interaction checker | 2982–3038 | `initInteractionDropdowns`, `checkInteractions`; DOM `#ix-d1..3`, `#ix-result` |
| `const TL_PK = {` | 8262–8360 | 97 ids, 72 with `hl`+`tmax` hours, strict JSON; `est:1` marks estimated half-lives |
| `pkCurve(hl,tmax)` / `pkParseDose` | 8391 / 8403 | pure Bateman one-compartment curve, peak normalised to 1 |
| Syringe builder | 8544–8642 | `SYR`, `SYR_SIZES`, `syr*`; HTML built at runtime by `tlFeaturesInit` 8783–8799 |
| `const SIDEFX = [` | 8644–8729 | 12 side-effect topics; the richest marker-adjacent prose in the app |
| `TL_STORAGE` / `TL_FORM` / `tlStorageFor` | 8166 / 8232 / 8250 | storage rules; `reviewed:false`, carry the caveat string verbatim |
| Entitlement | 7886–8148 | `TLTier`; only `ai_scanner` and `ai_assistant` are enforced |

Extraction precedent to reuse: `scripts/validate-encyclopedia.js:22–42` (`extractObject`,
string-aware brace matcher) and `scripts/validate-markers.js:27–72` (`extractSource`,
`extractBlock`, and the `new Function` harness that evaluates the registry with `LAB_REF`,
`LAB_FIELDS` and a stubbed `getAdjustedLabRanges`). Do not reuse the regex in
`validate-claims.js:48–52`; it over-counts markers (102).

Prose depth, measured: compounds carry 90–439 words each (median 239). The marker registry
carries about 444 words of notes across all 100 markers, and those notes are instructions to
the AI, not reader copy. **Marker pages need authored body copy. Compound data is a fact
sheet, not an article.** That is why the plan pairs data with a tool on every page.

---

## 3. Target URLs and what each one is

All new pages are folder-index pages (`/tools/<slug>/index.html`) to match the site's existing
`/directory/` and `/providers/` convention. Never use a path starting with `_`.

| URL | Type | Source data | Phase |
|---|---|---|---|
| `/tools/` | hub | list of tools | 1 |
| `/tools/peptide-reconstitution-calculator/` | interactive + authored | `#tool-calc` HTML, `tlRecon*`, `calcUnified`, `renderSyringe` | 1 |
| `/tools/<compound>-reconstitution-calculator/` for `semaglutide`, `tirzepatide`, `retatrutide`, `bpc-157`, `tb-500` | interactive, pre-filled presets + that compound's `doses[]`, `TL_PK` half-life, storage rule, an mg-to-units ladder | `DB`, `TL_PK`, `TL_STORAGE` | 1 |
| `/tools/trt-dose-calculator/` | interactive + authored: weekly dose → per-injection dose by cadence, ml and units per draw, steady-state peak/trough from `pkCurve` for cypionate, enanthate and propionate | `TL_PK` (`tc`, `te`, `tprop`), `pkCurve`, `SYR_SIZES` | 1 |
| `/tools/free-testosterone-calculator/` | interactive + authored: Vermeulen calculated free and bioavailable T from total T, SHBG and albumin, with the unit conversions from the registry | new pure function (cite Vermeulen 1999); `MARKER_REGISTRY` units for `tott`, `shbg`, `freet` | 1 |
| `/tools/insulin-syringe-units-calculator/` | interactive + authored | `SYR_SIZES`, the `ml × 100` rule from `syrRecalc`/`calcUnified` | 1 |
| `/tools/syringe-builder/` | interactive | `SYR`, `syr*`, static injectables array built from `DB` × `TL_PK.medium` | 1 |
| `/tools/half-life-calculator/` | interactive (Chart.js from `/vendor`) + authored | `TL_PK`, `pkCurve`, `pkParseDose` | 1 |
| `/tools/half-life/<compound>/` for every `TL_PK` id with `hl`, minus the Tier C denylist in §7 | pre-rendered SVG curve + the numbers + steady-state math + fact box | `TL_PK`, `DB` | 1 |
| `/tools/stack-checker/` ("can you take X with Y") | interactive + all 50 pairs rendered statically, grouped by severity | `DB` names, the three interaction arrays | 1 |
| `/markers/` | hub | registry groups | 2 |
| `/markers/<slug>/` for the 15 pages in §6 | authored + generated fact box | `MARKER_REGISTRY`, `LAB_REF`, `getAdjustedLabRanges` tables, `SIDEFX`, compound `mon` strings | 2 |
| `/markers/trt-bloodwork-checklist/` | hub: which markers, which assay, when to draw, how often, generated from compound `mon` strings and template `bloodwork` fields, linking every marker page | `DB.mon`, `TEMPLATES[].bloodwork`, registry assay variants | 2 |
| `/about/` | author + editorial policy | §8 | 0 |
| `/compounds/<id>/` | later | `DB` Tier A and B only | 3 |

Do not generate one page per interaction pair. Each pair's description is 15–44 words; fifty
of those would be thin pages. One checker page with every pair rendered and anchored is the
indexable version.

---

## 4. Phase 0 — housekeeping and technical foundation (one session)

Ship this first. Indexation lags four to eight weeks, so the clock should start before the
pages exist.

1. **Take control of Jekyll.** Rename `" config.yml"` to `_config.yml` with:
   ```yaml
   include: [CNAME]
   exclude:
     - docs
     - scripts
     - "*.md"
     - "*.pdf"
     - "*.zip"
     - "IMG_*.PNG"
     - "assets-1786901*.png"
     - arctos-labs
     - README.md
     - .github
   ```
   This stops `docs/`, `scripts/` and the root junk from being published while keeping the
   HTML pages byte-identical (Jekyll copies files without front matter verbatim; no page in
   the repo has front matter, and none of the new pages may start with `---`). Do **not** use
   `.nojekyll` as the fix: it would publish even more of the tree. Keep `include:` for the
   Search Console HTML token and the IndexNow key file. List the excluded files in the commit
   message so the owner can delete them from git separately. `app.html` never fetches
   `docs/compounds.json` at runtime (only a comment at line 2062 mentions it) and CI reads it
   from the checkout, so excluding `docs/` is safe.
2. **`robots.txt`** at the root:
   ```
   User-agent: *
   Disallow: /marketing
   Disallow: /directory/add-partner
   Disallow: /docs/
   Sitemap: https://therapylog.app/sitemap.xml
   ```
3. **`sitemap.xml`**, generated by `scripts/build-pages.js` (Phase 1), listing every public
   page with a `<lastmod>` from git (`git log -1 --format=%cI -- <file>`). Until Phase 1
   lands, write it by hand for the existing public pages: `/`, `/app`, `/guide`, `/pro`,
   `/download`, `/support`, `/partnership`, `/privacy`, `/terms`, `/health-data-privacy`,
   `/directory/`, `/providers/`, `/providers/apply`, `/about/`. Exclude the two noindex
   pages.
4. **`404.html`** with the site shell, a search-free list of the main pages, and links to
   `/app` and `/tools/`.
5. **IndexNow.** Generate a 32-hex key, save it as `<key>.txt` at the root containing the
   key, and add `scripts/indexnow-submit.js` that POSTs the sitemap's URLs to
   `https://api.indexnow.org/indexnow` as `{host, key, keyLocation, urlList}`. Run it by hand
   after each deploy (no CI network step). Bing, Yandex, Naver and Seznam share the index.
   **Google does not participate in IndexNow**; Google discovery is the sitemap, internal
   links and Search Console only.
6. **Search Console and Bing.** The owner does these in a browser: create a **Domain
   property** for `therapylog.app` via a DNS TXT record (Bing's import from Search Console
   carries the sitemap only from a verified property), and add the `google-site-verification`
   meta tag to `index.html` as a fallback; never remove either later, Google re-checks. Submit
   `sitemap.xml`. In Bing Webmaster Tools, import the Search Console property and confirm the
   IndexNow key. First thing to check once verified: whether any therapylog.app URL is
   indexed at all (the 3 Sep 2026 search check suggested none).
7. **Service worker.** In `sw.js`, restrict the navigate fallback to app routes:
   ```js
   // line ~42, inside the .catch():
   const isApp = new URL(event.request.url).pathname.startsWith('/app');
   return cached || (event.request.mode === 'navigate' && isApp ? caches.match('/app.html') : undefined);
   ```
   Bump `CACHE` to `'therapylog-v3'` so `activate` purges the old cache. `tlCheckForUpdate()`
   (`app.html:7517`) already surfaces the new worker to users.
8. **Canonical hygiene.** Leave `/app` as the canonical (it already is). Add
   `<link rel="canonical">` to `404.html` pointing at `/`. No redirect is possible on Pages, so
   do not try to collapse `/app.html`; the canonical handles it.
9. **JSON-LD** on existing pages (inline `<script type="application/ld+json">`):
   - `index.html`: `Organization` (`name: TherapyLog`, `alternateName: "TherapyLog TRT and
     peptide tracker"`, TherapyLog LLC, Floresville TX, `hello@therapylog.app`, `sameAs` empty
     until social profiles exist) and `WebApplication` (`applicationCategory:
     HealthApplication`, `operatingSystem: Web`, `browserRequirements`, `offers` with the free
     tier at price 0 and Pro at `$9.99`/month with `priceCurrency`). Do not list a lifetime
     tier (`validate-claims.js` bans the word) and do not invent an `aggregateRating`: without
     one there is no star snippet, which is fine; the markup still establishes the entity.
   - `guide.html`: `Article` with `author` → the `Person` from `/about/` by `@id`.
   - `support.html`: skip `FAQPage`. Google removed FAQ rich results for sites like this in
     2023 and reportedly retired them entirely in May 2026. Keep the FAQs as visible HTML;
     they still feed snippets and AI answers.
   - Every page title carries the qualified brand: `<page name> | TherapyLog TRT & Peptide
     Tracker`. The bare word "TherapyLog" belongs to someone else in search.
10. **Navigation.** Add "Tools" (`/tools/`) and "Lab markers" (`/markers/`) to the home nav
    and footer (`index.html:102–110`, `357–367`), turn the `<h3>Reconstitution Calculator</h3>`
    (line 212) and `<h3>Combined Syringe Builder</h3>` (line 170) headings into links to the
    tool pages, and give `pro.html` a link home. Add "Tools" to the footer of `guide.html`,
    `download.html` and `support.html`; when you link `/tools/` from `guide.html`, add the
    route to the map at `scripts/validate-guide.js:44–47` or CI fails.
11. **`/about/`** per §8. Ships in Phase 0 because every later page links to it.
12. **`llms.txt`** at the root: a short plain-text description of the site, the author, the
    tool and marker page list with one line each, and the disclaimer. The ledger names
    AI-answer citation as an acquisition channel and Regimen already ships one. Regenerate it
    from `build-pages.js` in Phase 1.
13. **Attribution fix before any tool page ships.** Two facts from `pro.html` and the API:
    `tlStoredRef()` at `pro.html:166–169` falls back to `utm_campaign` and then `utm_source`
    when no `ref` was captured, and `create-pro-subscription.js:175` applies the
    affiliate's one-month-free coupon to any non-empty `ref`. So a tool-page visitor arriving
    on `/app?utm_campaign=reconstitution` who later buys annual would get the affiliate
    discount and appear in `affiliate-report.js` as `UNKNOWN REF`. Fix: in `pro.html`, make
    `tlStoredRef()` return only a real `ref`; in `create-pro-subscription.js`, accept and
    store `utm_source`/`utm_campaign` as their own subscription metadata keys so tool-page
    sales are visible in Stripe without being paid as referrals. Add a test to
    `scripts/test-entitlements.js` or a new API test for the UTM-only case. This is the one
    change in this plan that touches the `therapylog-api` repo.

Acceptance: `_config.yml` present and read (check the Pages build log shows it), robots and
sitemap return 200, IndexNow key file returns 200, `sw.js` change deployed and cache bumped,
all validators green, `/about/` live.

---

## 5. Phase 1 — `/tools/` pages (one to two weeks)

### 5.1 The generator

Create `scripts/build-pages.js` (dependency-free Node, like every other script here). It:

1. Reads `app.html` and extracts, with the validators' own brace matcher:
   - data: `DB` (`JSON.parse`), `TL_PK` (`JSON.parse`), `LAB_REF`, `LAB_FIELDS`, the
     MARKER-REGISTRY block (evaluated with the `validate-markers.js:59–72` harness so the
     generator gets the real `normalizeValue`/`classify`), the three interaction arrays,
     `SYR_SIZES`, `TL_STORAGE`, `TL_FORM`, `SIDEFX`;
   - **function source text**, not re-implementations: `tlReconSolve`, `tlReconOptions`,
     `tlReconToggle`, `tlReconPick`, `tlReconRender`, `calcUnified`, `renderSyringe`,
     `ucPreset`, `pkCurve`, `pkParseDose`, `checkInteractions`, `syrAddRow`, `syrRemoveRow`,
     `syrField`, `syrSetSize`, `syrMediumOf`, `syrFragile`, `renderSyringeBuilder`,
     `syrRecalc`. Extract each by locating `function <name>(` and brace-matching to the
     closing brace. Inline that text into the page's `<script>`. The comment above
     `tlReconSolve` (`app.html:5887`) says why this matters: "a wrong number here ends up in
     a syringe."
   - the `#tool-calc` HTML fragment from line 1 (locate `id="tool-calc"` and take the element
     up to `id="tool-interact"`), dropping the `#uc-name` field and replacing the `#uc-cta`
     block with the page's own CTA.
   - the CSS rules the fragments need: the `:root` tokens and `body.light-mode` block, and
     the `.card .card-title .ig .il input select .preset-btn .uc-step .uc-step-hd .uc-num
     .uc-flow-arrow .btn .btn-p .btn-s .syringe-*` rules. Extract by selector from the
     `<style>` block on line 1 rather than copying, so restyles in the app carry over.
2. Renders each page from a template in `scripts/page-templates/` (plain template strings,
   no engine): shared head (title, description, canonical, OG tags pointing at a per-page OG
   image or the existing `icons/og-image.png`, theme-color, the same Google Fonts link the
   site uses, `/_vercel/insights/script.js` for `ui-check-site.js`), shared nav, the page
   body, byline block, legal footer with `href="/privacy"`, `href="/terms"`,
   `href="/health-data-privacy"` in exactly that root-relative form
   (`validate-compliance.js:31` accepts only that or the absolute form).
3. Stubs the app-only globals a lifted function touches: `toast()` (a two-line inline
   version), `gd()` returning `{entries:[],pk:{}}`, `showPage`, `showLogTab`,
   `showCycleTab` (no-ops). `ucLogFirstDose` and `ucAddToStack` are not lifted; the CTA
   replaces them.
4. Writes `sitemap.xml` from the list of pages it generated plus the static page list.
5. Supports `--check`: regenerate to a temp dir and exit non-zero if any output differs from
   what is committed. CI runs this so the committed pages can never be stale.

Output is committed. GitHub Pages has no build step, and Playwright is not in CI, so PNGs and
HTML are artifacts in git.

### 5.2 Page anatomy (every tool page)

1. `<h1>` naming the tool and the query it answers.
2. 150–300 authored words above the fold: what it computes, the formula in one sentence,
   one worked example with real numbers (5 mg vial, 2 ml BAC water → 2,500 mcg/ml → 250 mcg
   is 10 units on a U-100 syringe).
3. The widget, working without an account and without the app.
4. "How the math works" with the formula written out, and the rules the app enforces
   (practical draws land on a half-unit and are at least 2 units; U-100 means 100 units per
   ml; oil and water never share a syringe; suspensions draw alone).
5. Three to five FAQs as plain `<h3>` + paragraphs (no FAQ schema needed on tool pages).
6. The calculator disclaimer, using the app's own framing: the calculator does the arithmetic
   you typed and nothing else; confirm the vial strength and diluent volume on your own
   label; dosing decisions belong with a qualified provider. Reuse the wording from
   `index.html:294`.
7. CTA: "Save this dose to your log" → `/app?utm_source=tools&utm_medium=web&utm_campaign=<slug>`,
   **only after Phase 0 item 13 has landed** (otherwise the UTM becomes an affiliate coupon at
   checkout). Attribution rules for every tool page, from the affiliate mechanics in
   `pro.html:157–189` and `app.html:7456–7471`:
   - Include the first-touch writer snippet on the page (copy `pro.html:176–189` verbatim).
     Same origin means shared `localStorage`, so an affiliate who links to
     `/tools/x?ref=CODE` gets credit even when every CTA is a bare `/app` link. That also
     makes the tool pages something affiliates can link to.
   - Forward `?ref=` to `/pro` when it is present, so the "Referred by" banner and the
     one-month-free label render. Never inject a synthetic `ref` such as `ref=tools`.
   - Never overwrite `tl_attr`; the snippet guards with `if (localStorage.getItem('tl_attr')) return;`.
   - Say nothing about affiliate terms on a tool page (claim controls are still open).
   Do not promise Pro features on a tool page; the AI scanner and assistant are the only gated
   features and they are not what the CTA sells.
8. Byline: "Built by Joel Gonzales, founder of TherapyLog. Not a clinician. Last reviewed
   <date>." linking to `/about/`.
9. Legal footer links. Nav with Home, Tools, Lab markers, Open the app.
10. JSON-LD: `WebPage` with `author` (the `Person` from `/about/`), `isPartOf` the `WebSite`,
    `dateModified`, and `BreadcrumbList`. Do not use `HowTo` (rich results retired in 2023).

### 5.3 Per-page notes

- **Reconstitution calculator.** Lift the whole `#tool-calc` flow, including the reverse
  solver (`tlReconToggle`/`tlReconOptions`), which is the differentiator: most vendor
  calculators only go forward. Presets stay (`ucPreset`). Add a "which syringe" note tied to
  `SYR_SIZES`.
- **Compound-specific reconstitution pages.** Build semaglutide, tirzepatide and
  retatrutide first (the biggest demand cluster, vendors a minority, tirzepatide's results
  page nearly empty), then BPC-157 and TB-500. Each carries an mg-to-units escalation ladder
  (0.25 → 0.5 → 1 → 1.7 → 2.4 mg for semaglutide, 2.5 → 5 → 7.5 → 10 → 12.5 → 15 mg for
  tirzepatide) as a static table, because "how many units is X mg" is the question people
  actually type. Same widget, pre-filled with that compound's typical vial sizes, plus a
  generated fact box from `DB` (the `doses[]` rows, minus any row
  whose label matches `/performance|cycle|blast|advanced/i`), `TL_PK` half-life (labelled
  "estimated" when `est:1`), and the storage rule from `tlStorageFor(id)` with the
  `TL_STORAGE.caveat` sentence verbatim. Each page needs 200+ words that only apply to that
  compound, or it is a duplicate; the fact box plus an authored paragraph on why that
  compound is reconstituted the way it is gets there. Cap at five compounds in Phase 1.
- **Insulin syringe units.** Small, fast, high-intent. Inputs: syringe size (from
  `SYR_SIZES`), concentration, dose. Output: units and ml, with the "U-100 = 100 units per ml"
  explanation and the half-unit rule. Show a table of common conversions (0.1 ml = 10 units,
  0.25 ml = 25 units, 0.5 ml = 50 units).
- **Syringe builder.** Lift `SYR`/`syr*` minus `syrLog`. Replace `syrInjectables()` with a
  static array generated at build time from `DB` × `TL_PK.medium ∈ {aq, oil, susp}`
  (66 injectables today), minus Tier C ids.
- **Half-life calculator.** Inputs: compound (from `TL_PK` ids with `hl`, minus Tier C),
  dose, interval, duration. Output: Chart.js curve from `pkCurve` loaded from
  `/vendor/chart.umd.min.js` (same origin, already precached), plus computed facts: time to
  steady state (about five half-lives), accumulation ratio for the chosen interval
  (`1 / (1 − 2^(−interval/hl))`), peak-to-trough ratio. Label `est:1` compounds "estimated
  half-life, limited human PK data". Note where the app's user override lives (Adjust in the
  Levels tab) without importing it.
- **Per-compound half-life pages.** Pre-render the single-dose and steady-state curves as
  inline SVG at build time (use `pkCurve` in Node) so the page has indexable content without
  JavaScript, then enhance with the interactive chart. Fact box: half-life, Tmax, medium,
  estimated flag, storage rule, monitoring panel from `DB.mon`, and the interaction rules that
  name this compound (resolve the display names in `INTERACTIONS[].drugs` to ids via a hand
  map or a `name`/`aka` index like `pkIndex()` at `app.html:8364`). These pages target
  "<compound> half life" queries, which are high-volume and currently won by clinics and
  vendors.
- **TRT dose calculator and testosterone ester page.** No vendor, no patent and no app
  listing outranks a real page here; only Regimen (no cypionate page) and MyTRT compete.
  Inputs: ester (cypionate, enanthate, propionate), weekly dose, injections per week,
  concentration. Output: per-injection mg, ml and units by syringe size, and a steady-state
  curve from `pkCurve` with the peak-to-trough ratio for that cadence. The differentiator
  the incumbents lack is ester and route awareness plus data provenance (say where the
  half-life numbers come from and mark `est:1`).
- **Free testosterone calculator.** Clinic-dominated results, no tracker app ranks, and it
  feeds lab logging directly. Implement the Vermeulen equation as a new pure function with
  the citation on the page, take total T, SHBG and albumin in any unit the registry accepts,
  and explain why the calculated value depends on the SHBG assay (the registry's own
  `freet.assay.note`). Link to the free-vs-total marker page.
- **Stack checker.** Lift `checkInteractions` and the selects, populate from `DB`
  names minus Tier C, and render all 50 pairs statically below the widget, grouped by
  severity, each with an anchor titled "Can you take X with Y?". Do not call it an
  interaction checker in the title or slug: that phrase returns only academic
  protein-binding papers. The existing checkers are peptide-only and vendor-run; this one
  covers TRT ancillaries and GLP-1s too, which is the gap. Keep the mandatory "not exhaustive / not a safety clearance"
  disclaimer on both the empty and the populated result (the app renders it on both
  branches; keep that).

### 5.4 Validators to touch in Phase 1

- `scripts/validate-compliance.js`: add every generated public page (or a glob over
  `tools/**/index.html`, `markers/**/index.html`, `about/index.html`) to `PUBLIC` (line 22)
  and to the `BANNED` scan list (line 48).
- `scripts/validate-claims.js`: add the same pages to `PAGES` (line 64). Derive any count you
  print (130 compounds, 100 markers, 72 PK-modelled, 30 classes) from the extracted data at
  build time, never by hand.
- `scripts/validate-encyclopedia.js`: add the pages that quote a compound count to the rule-9
  file list (line 112).
- `scripts/validate-guide.js`: extend the route map (line 44) for any new route linked from
  `guide.html`.
- New `scripts/validate-public-pages.js`, run in a new workflow
  `.github/workflows/validate-public-pages.yml` with `paths: [tools/**, markers/**, about/**,
  app.html, scripts/**]`: asserts every generated page has a `<title>`, description, canonical
  equal to its URL, exactly one `<h1>`, the byline link to `/about/`, the three legal links,
  the disclaimer sentence, no banned phrase, no Tier C id anywhere in `tools/` or `markers/`;
  that `sitemap.xml` lists exactly the generated pages plus the static list; and that every
  inlined function's source text equals the current text in `app.html` (hash compare). That
  last check is the drift guard that makes "same math as the app" a fact rather than a claim.
- `.github/workflows/validate-compliance.yml` and `validate-encyclopedia.yml`: add `tools/**`
  and `markers/**` to the `paths:` filters.
- Add `node scripts/build-pages.js --check` to the new workflow.

### 5.5 OG images

`scripts/capture-guide-shots.js` shows the pattern: serve the repo over `http`, launch the
system Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with
`playwright-core`, screenshot. For OG images use `viewport: {width: 1200, height: 630},
deviceScaleFactor: 1` and screenshot the generated page itself (or a `?og=1` variant that
hides nav). Commit the PNGs to `assets/og/`. The script must skip cleanly when
`playwright-core` is absent, as the others do. Until it runs, every page uses
`icons/og-image.png`.

Acceptance for Phase 1: all tool pages live, `build-pages.js --check` green in CI, validators
green, sitemap regenerated, IndexNow submitted, tool pages linked from the home page, guide,
and support FAQ.

---

## 6. Phase 2 — `/markers/` pages (weeks two to four, five pages a week)

These need writing. The registry gives a fact box; the body is authored under the founder's
byline with citations.

### 6.1 The 15 pages, in order

Order adjusted by the 3 Sep 2026 search check: the assay-differentiated core first
(estradiol, hematocrit, ferritin, IGF-1), then the TRT side-effect markers where the winners
are AI-answer pages and forums (SHBG, prolactin), then the checklist hub, then the method
pages (free vs total, DHT). Lp(a) and ApoB are institution-owned results; keep them in the
fifteen but last, and angle them at units and "on TRT or GLP-1". Fold "what does high
estradiol on TRT feel like" into the estradiol page as its own section with the assay named
on every number.

| # | Slug | Registry keys | Query targets | Existing material to draw on |
|---|---|---|---|---|
| 1 | `estradiol-sensitive-vs-standard` | `e2` | sensitive estradiol vs standard; estradiol test men LC/MS | `e2.assay` variants and note; `SIDEFX` High estradiol and Crashed estradiol; ~40 compound `mon` strings say "E2 (sensitive assay)" |
| 2 | `total-testosterone-immunoassay-vs-lcms` | `tott` | total testosterone LC/MS vs immunoassay; testosterone range by age | `tott.assay`; five male age bands in `getAdjustedLabRanges` |
| 3 | `free-vs-total-testosterone` | `freet`, `bioavailt`, `shbg` | free vs total testosterone; free testosterone equilibrium dialysis | `freet.assay` three variants; `bioavailt` note |
| 4 | `shbg` | `shbg` | high SHBG on TRT; what is SHBG | unit note; compound summaries that discuss SHBG |
| 5 | `hematocrit-on-trt` | `hct`, `hgb`, `rbc`, `ferritin` | hematocrit on TRT; high hematocrit testosterone | `SIDEFX` High hematocrit (the richest entry) |
| 6 | `prolactin` | `prolactin` | prolactin range men; high prolactin nandrolone | `SIDEFX` High prolactin (rewrite; see B-5 note below) |
| 7 | `lh-fsh` | `lh`, `fsh` | LH FSH on TRT; LH FSH after cycle | `SIDEFX` HPTA suppression |
| 8 | `igf-1` | `igf1`, `igfbp3` | IGF-1 levels by age; IGF-1 on peptides | `igf1` age note; GH secretagogue `SIDEFX` |
| 9 | `hba1c-and-fasting-glucose` | `hba1c`, `glucose`, `insulin` | HbA1c mmol/mol to percent; A1c on GLP-1 | the IFCC→NGSP function at `app.html:553` |
| 10 | `apob-vs-ldl` | `apob`, `ldl`, `nonhdl`, `ldlp` | ApoB vs LDL; ApoB range | `ldl.assay` three variants; `ldlp` note; C-6 history |
| 11 | `lipoprotein-a` | `lpa` | Lp(a) nmol/L vs mg/dL | the only `noConvert:['mg/dL']` marker; its 20-word note |
| 12 | `ferritin-and-iron-panel` | `ferritin`, `iron`, `tibc`, `transferrin`, `ironsat` | ferritin low blood donation TRT | `SIDEFX` hematocrit caution on donation |
| 13 | `vitamin-d` | `vitd` | vitamin D nmol/L to ng/mL; optimal vitamin D | conversion 0.4006 |
| 14 | `thyroid-panel` | `tsh`, `ft4`, `ft3`, `rt3`, `tpo`, `tgab`, `t4total`, `t3total` | TSH free T3 free T4 optimal; reverse T3 | thyroid compounds and templates |
| 15 | `dht` | `dht` | DHT levels TRT; DHT finasteride | interaction rules for finasteride/dutasteride; hair-shedding `SIDEFX` |

### 6.2 What the generator produces per marker page

- Fact box: label, group, canonical unit, every accepted unit with its conversion factor to
  canonical (`units{}`), assay variants with their display labels from the
  `<select id="ll-method-<key>">` options on line 1, the generic reference range from
  `LAB_REF` labelled "generic reference range, male default", the optimal band labelled
  **non-diagnostic** (the word the app uses; `validate-markers.js:176` asserts it), and the
  sex and age bands replicated from `getAdjustedLabRanges()` (5290–5337) as static tables.
  Include the `contextRequired` caveat where present (cortisol needs draw time, IGF-1 and
  PSA need age, insulin and glucose need fasting status).
- A unit converter widget using the real `normalizeValue` for that key (lifted through the
  registry harness), refusing `noConvert` units exactly as the app does.
- "Compounds whose monitoring panel includes this marker": generated by matching
  `MARKER_REGISTRY[key].aliases` against every `DB` entry's `mon` string (it is a string on
  106 entries and an array on 22; `progesterone` and `mk677` use `monitoring`). Link to the
  compound's half-life page where one exists.
- "Your lab's range wins": a fixed paragraph explaining that the range printed on the report
  is the one the app flags against (`MARKERS.md` rule 3).
- Omit LOINC codes or label them unverified; `MARKERS.md` says they are a seed written from
  memory, and nine markers have none.

### 6.3 What has to be written (600–1,200 words per page)

What the marker is, why this audience tests it, what moves it (compounds, timing,
hydration, training), how to read it against the reference range and the optimal band, when
the assay method changes the answer, and what the literature and community practice describe
as next steps, always ending with taking the result to the prescribing clinician. Three-tier
evidence labelling on every claim that is not a definition: established clinical use;
off-label or community practice; animal-only or theoretical. Cite primary literature or
guideline documents inline with links.

B-5 in `COMPLIANCE-AUDIT.md` applies here. Marker pages describe; they do not tell a reader
with a specific value to take a specific drug at a specific dose. The `SIDEFX` prolactin entry
names cabergoline at a dose; the page version says what clinicians commonly use and why, with
the source, and stops there.

Process: Claude drafts from the fact box and the material in §6.1, the founder reviews every
sentence, then the page carries "Written and reviewed by Joel Gonzales, founder. Not a
clinician. Last reviewed <date>." Five pages a week is the pace; `validate-public-pages.js`
guards structure, a human guards the claims.

Acceptance for Phase 2: 15 marker pages live and linked from `/markers/`, from the relevant
tool pages, and from the guide's bloodwork section; the converter on each page uses the lifted
`normalizeValue`; every page cites at least three primary sources.

---

## 7. Phase 3 — compound pages (after Phase 2 has data)

Not before the marker pages have four weeks of Search Console data. When it starts:

- **Tier A (publish, 56 ids):** prescription, OTC and approved compounds. Strip `doses[]` rows
  whose label matches `/performance|cycle|blast|advanced|intermediate/i` and `stacks[]`
  groups that name a Tier C compound.
- **Tier B (publish with regulatory labelling, 46 ids):** research peptides. Every page shows
  the `approval` or `reg.status` string, the storage caveat, and pairs with no vendor.
- **Tier C (no public page, 23 ids):** `nandro, oxan, mast, primo, osta, lgd, rad140, card,
  pct1, yk11, andarine, stanozolol, npp, boldenone, trenace, trenenan, dianabol, anadrol,
  turinabol, mastenan, primooral, testsusp, sustanon`. They stay in the app (ledger §1 locks
  the content) and off indexable pages under the founder's byline. Enforce with a denylist in
  the generator and an assertion in `validate-public-pages.js`. Borderline (`tprop`,
  `proviron`, `mt2`, `igf1lr3`, `mk677`): decide individually; default `tprop` and `proviron`
  to Tier A with the strip filter, the other three to Tier B.
- The full-depth compound data lives only in `app.html`; `docs/compounds.json` is an index.
  Either extract at build time (as Phase 1 does) or add `docs/compounds-full.json` and extend
  `validate-encyclopedia.js` to fail on drift.
- Ledger open item 7 (aggregate anonymised usage stats on compound pages) is the strongest
  defence against a thin-content classification. It needs a cohort threshold and a terms
  check; it is not a Phase 3 prerequisite.

---

## 8. The author page and editorial policy (`/about/`)

Ships in Phase 0. Contents:

- Who: Joel Gonzales, founder of TherapyLog LLC (Floresville, Texas). Not a clinician; state
  the actual background in one or two sentences. Photo optional.
- Why the site exists: the harm-reduction mission from `LEDGER.md` §1, in the founder's
  voice. The one-person framing is load-bearing copy (the emails already say "built and run by
  one person, and I read every message myself"); use it.
- Editorial policy: every reference page names its author and a last-reviewed date; claims
  cite primary literature or guideline documents; evidence is labelled in three tiers
  (established clinical use, off-label or community practice, animal-only or theoretical);
  optimal bands are non-diagnostic; the site sells software and nothing else, lists no
  vendor, and takes no referral fees from clinics or labs (`BRAND-AND-ENTITY-STRUCTURE.md`
  §5). Corrections: how to report one (`hello@therapylog.app`), and that corrections are
  noted on the page.
- What the tools do and do not do: the calculators do the arithmetic you typed; the app
  flags values against your lab's printed range first and a generic range second; nothing on
  the site diagnoses, treats or prescribes.
- JSON-LD: `Person` (`name`, `jobTitle: Founder`, `worksFor` → the Organization, `url`,
  `email`) and `AboutPage`. Every generated page's `author` points at this `Person` by `@id`.
- Legal footer links, like every public page. Add `about/index.html` to
  `validate-compliance.js` `PUBLIC`.

---

## 9. Compliance checklist for every generated page

Enforced by validators where marked (V); the rest is on the writer.

- (V) `href="/privacy"`, `href="/terms"`, `href="/health-data-privacy"` present.
- (V) None of: `products tested`, `earned, not bought`, `TherapyLog Verified`,
  `COA authenticity`.
- (V) No `lifetime`, `one-time`, `pay once`, `$34.99`; no App Store, Google Play or Play Store
  availability; no `148`; no `50+ markers`.
- (V) Any count claim (compounds, classes, markers, PK-modelled) is at most the real number.
- (V) Legal, byline, canonical, single `<h1>`, disclaimer sentence present; no Tier C id.
- (V) Inlined calculator functions match `app.html` byte for byte.
- Harm-reduction framing; every side-effect discussion ends with the prescribing clinician.
- Three-tier evidence labelling on non-definitional claims (`ai-research.js:103` is the
  wording the AI already uses).
- B-5: show the basis; describe what the literature and community practice do; never "you
  should take X mg".
- Optimal bands say "non-diagnostic"; the lab's printed range wins; LOINC omitted or labelled
  unverified.
- `TL_STORAGE.caveat` verbatim wherever a storage rule is shown; `est:1` half-lives labelled.
- No vendor, clinic or lab paired with any page; no affiliate or discount code for any
  product.
- Avoid bodybuilding-coded words in titles and slugs (`cycle, stack, peak, alpha, apex,
  elite, prime, max, beast`), the same list `BRAND-AND-ENTITY-STRUCTURE.md` §6 gives for
  naming.

---

## 10. Measurement

- Google Search Console and Bing Webmaster Tools are the only query-level sources. Set both
  up in Phase 0.
- Vercel Web Analytics is already on every page but collects nothing until the domain is
  served by Vercel (`LAUNCH-CHECKLIST.md` §4). Until that move, Search Console is the traffic
  record, and Stripe's `ref` field plus `utm_campaign=<slug>` on the CTAs is the conversion
  record.
- 90-day targets: all tool and marker URLs indexed (Search Console coverage), impressions
  on the target queries in §5 and §6, and app opens with `utm_source=tools` visible in
  `localStorage.tl_attr` on activation (`tlActivateFromCheckout` passes `ref`; consider
  passing `utm_campaign` too so Stripe shows which page produced a sale).

---

## 11. Paid ads, corrected

`LEDGER.md` §1 and `PROMOTION-READINESS.md` §4 say Google Ads is closed because the category
needs LegitScript certification. The verdict is right for the near term; the reason is wrong,
and the reason matters because it changes what is worth testing.

Google requires LegitScript certification for online pharmacies, telemedicine providers and
addiction-treatment services. TherapyLog is none of those: it prescribes nothing, dispenses
nothing, and sells no compound. There is no certification to fail. What fails is the landing
page: therapylog.app is saturated with prescription drug names, dosing and AAS protocol
content, and a reviewer applying the healthcare and unapproved-substances policies rejects an
ad that lands there.

That is solvable. The standard approach is a dedicated ad landing page with no compound names,
no dosing and no encyclopedia ("log your doses, chart your bloodwork, export a summary for your
doctor"), bidding on generic tracker and calculator queries. Whether it survives review is
empirical and a small test answers it. The tool pages from Phase 1 are candidates for that
landing page once they exist.

| Channel | Verdict |
|---|---|
| Newsletter and podcast sponsorships | Open. Only the publisher's standards apply. Best paid channel; overlaps with affiliate recruiting. |
| Reddit Ads | Open with careful copy. Community targeting needs subreddits of 5,000+ members; r/Testosterone, r/trt and r/peptides qualify. Identity verification required; AI-generated creative must be disclosed. Lead with harm reduction. |
| Google Search and Bing | One careful test on a clean landing page. Content-blocked, not certification-blocked. |
| Meta and Instagram | Closed, with account risk. Before-and-after imagery and anything touching anabolic substances are prohibited, and Meta has been disabling audiences and conversions for health advertisers. Do not risk the business manager. |
| TikTok | Closed on the same grounds with less recourse. |

Google rejects creatives and suspensions are usually recoverable; Meta disables business
assets permanently. Test the first, do not touch the second. Re-read Google's current
healthcare and medicines policy before spending; the text moves. Claim controls
(`COMPLIANCE-AUDIT.md` B-4) apply to any sponsor read or affiliate post before it goes live.

---

## 12. Outreach notes that belong with this plan

Research files: `docs/seo-research/serp-calculators.md`, `serp-markers.md`,
`serp-compounds-competitors.md` (who ranks for each target query, with URLs) and
`technical.md` (GitHub Pages, Jekyll, IndexNow, Search Console and structured-data
constraints with source links). Read the calculator and marker files before writing a page's
copy; they name the incumbents to beat.

- The tool pages are also the outreach asset. "Here is a free reconstitution calculator your
  audience can use" is an easier first email than "please promote my app."
- Podcasts and newsletters publish their sponsorship contacts; YouTube channels hide theirs
  behind a captcha. Same audience, a fraction of the friction. Start there.
- Commenting on YouTube videos with a link gets filtered by spam detection and removed by
  moderators, and doing it on channels you later want to sponsor poisons the relationship.
  Answer the question in the thread with substance and no link.
- The target list lives in the private `therapylog-api` repo at `docs/outreach-targets.md`
  (not in this public repo). Contact routes on it are labelled by how they were found;
  addresses marked unverified must be confirmed on the creator's own page before use.

---

## 13. Definition of done

- Phase 0: `_config.yml` read by Pages; `robots.txt`, `sitemap.xml`, IndexNow key, `404.html`,
  `/about/` live; `sw.js` fallback scoped and cache bumped; Search Console and Bing verified
  and sitemap submitted; JSON-LD on index, guide, support; nav and footer carry Tools and Lab
  markers; validators green.
- Phase 1: every URL in §3 marked Phase 1 live; `build-pages.js --check` in CI and green;
  `validate-public-pages.js` in CI and green; tool pages linked from the home page (both
  headings), the guide, and the support FAQ; IndexNow submitted after deploy.
- Phase 2: 15 marker pages live, each with the fact box, the converter, three or more primary
  sources, and the founder's review line; linked from `/markers/`, the relevant tool pages and
  the guide.
- Ledger updated at the end of each phase (`LEDGER.md` §5 rule).
