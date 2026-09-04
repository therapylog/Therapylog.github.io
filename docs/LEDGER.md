# TherapyLog Project Ledger

**Purpose:** a single shared reference so separate chats — code, design, marketing,
whatever memory each one has — stay on the same page. If you're starting a new
chat about this project, read this file first. If you finish work in a chat that
changes status, decisions, or next steps, update this file before you end the
session so the next chat inherits accurate state.

This file is the source of truth for *direction and status*. It is not the source
of truth for content — that lives in `COMPOUNDS.md` (compound data) and
`ART-DIRECTION.md` (visual prompt library). Link out to those rather than
duplicating them here.

**Day-to-day execution lives in the Marketing Suite → Focus board**, which shows
one item at a time. This ledger holds direction; the Focus board holds sequence.
When an item resolves there, reflect it here.

**Last updated:** 3 September 2026

---

## 1. Locked decisions — don't re-litigate these

- **Web-first, indefinitely.** App Store / Play Store listings are shelved on
  purpose, not by default. Reasoning: getting listed would require cutting
  compounds/dosing information the TRT/AAS community relies on, and doing that
  would compromise credibility in that community. A separate, store-compliant
  version is a possible *future* fork, not a current plan. Don't propose
  App/Play Store submission as a near-term action, and never generate marketing
  copy claiming store availability (the Suite's system prompt now enforces this).
- **Mission is harm reduction**, not performance enhancement. Every side-effect
  workflow (e.g. high prolactin → cabergoline, elevated E2 → help pick an AI)
  ends with "consult your doctor." Keep that framing in any new feature or
  marketing copy — it's both the ethical stance and the legitimacy argument
  with the community.
- **The telehealth business is a third brand and a third entity.** Not TherapyLog,
  not Arctos. Decided 1 Sep 2026; full reasoning, the questions to put to Fuse
  Health and OpenLoop, and the naming shortlist are in
  `docs/BRAND-AND-ENTITY-STRUCTURE.md`. Do not re-open this without reading it —
  the decisive facts are that TherapyLog's own content (AAS cycle protocols, an
  AI told to cover PEDs candidly, r/PEDs and r/firstcycle targeting) cannot share
  a brand with a licensed prescribing practice, and that Arctos would turn
  BALANCE and CYCLE into hormone-therapy adjuncts by context.
- **Arctos is supplements only, permanently.** No hormone, steroid, SARM,
  injectable-peptide or prescription product will ever carry the Arctos name. See
  `Arctos-Labs/legal/arctos-scope-and-separation-policy.md`.
- **Promotion is cleared** for organic/forums/social once this branch is deployed
  and the C-0 notification question has been put to a lawyer — see
  `docs/PROMOTION-READINESS.md`. Paid ads, corrected 3 Sep 2026: Google is
  **content-blocked, not certification-blocked** — LegitScript certification is
  required of pharmacies, telehealth and addiction treatment, none of which
  TherapyLog is; what fails review is a landing page full of compound names and
  dosing. Meta and TikTok stay closed (account risk). Reddit Ads and newsletter/
  podcast sponsorships are open. Still do not spend effort on Google or Meta
  now; a single small Google test on a clean landing page is the only paid
  search action worth taking, and only after the free tool pages exist. Full
  table in `docs/SEO-PLAN.md` §11. Affiliate claim controls must exist before
  the first affiliate enrols.
- **Compliance findings and their fixes are in `docs/COMPLIANCE-AUDIT.md`**, and
  `scripts/validate-compliance.js` guards the four regressions that are easiest to
  reintroduce. The open items list at the end of that document is the live one.
- **Pricing:** $9.99/mo, $99.99/yr, both live at therapylog.app/pro (Monthly/
  Annual tabs). Don't re-verify this or claim there's no annual tier — it exists.
- **Encyclopedia is 130 unique compounds across 30 classes**, stored
  deduplicated in `app.html`'s `DB` itself (synced 17 Aug 2026 — see §2).
  `docs/compounds.json` mirrors it and `scripts/validate-encyclopedia.js`
  fails CI on any drift between the app data, the JSON, the markdown, and the
  counts claimed in page copy. Competitors (Regimen ~150+, Smart Peptide
  Tracker ~200+) beat pure count, so positioning is **per-entry depth**
  (PK curves, side-effect guidance, regulatory status), not raw compound count.
  Never inflate the catalog to hit a marketing number.
- **Lab results are normalized through one registry, keyed by LOINC.**
  `MARKER_REGISTRY` in `app.html` (100 markers, docs/MARKERS.md) sits between
  every result source — manual form, photo/PDF scanner, a future lab API — and
  the rest of the app. Its rules are not preferences: unknown markers go to
  `unmapped` and are logged rather than guessed; a reference range printed on
  the user's report always beats our generic one; a unit with no valid
  conversion (Lp(a) mg/dL↔nmol/L, absolute count vs percentage) is refused, not
  approximated; optimal bands live only in `LAB_REF` and stay separate from the
  lab's range; assay method is carried as a first-class field because standard
  and sensitive E2 — or immunoassay and LC/MS-MS testosterone — are not the same
  measurement. Don't add a marker path that bypasses it, and don't let a scanned
  value reach a form field without going through `normalizeValue()`.
  Anything outside those 100 markers is logged as a **user-defined marker**
  rather than dropped, so a 100+ analyte panel logs in full — those rows are
  never unit-converted, never given an optimal band, and are labelled
  `userDefined` to the AI. Manual entry is a first-class path, not a fallback:
  every marker can be typed in, with or without a scan.
  ⚠️ The registry's LOINC codes are an **unverified seed** — verify against real
  vendor payloads before wiring a lab API.
- **Paid acquisition is not the growth channel** at this price point. Growth
  channels in priority order: affiliates → SEO/free tools → community
  (Reddit/X) → newsletter partnerships → PR. Paid social only as retargeting.
  With stores shelved *and* paid deprioritized, organic search and AI-answer
  citation carry most of the acquisition load — which raises the stakes on
  compound pages and the blog.
- **Named author for reference content is Joel (decided 3 Sep 2026).** Founder,
  disclosed non-clinical role, a published editorial and review policy at
  `/about/`, primary-literature citations on every claim. A paid clinical
  reviewer is a later upgrade, not a prerequisite. Resolves §3 #2 and the Focus
  board decision `d-author`. Confirm the public form of the name before the
  first page ships.
- **SEO order is foundation → free calculator pages → lab-marker pages →
  compound pages.** Calculators are free tier and ungated (`TLTier.check`
  wraps only the AI scanner and assistant), so they are the funnel, not the
  encyclopedia. Comparison pages ("vs Regimen") are deferred indefinitely — they
  feed the competitor's brand query. The plan, with file paths and line numbers,
  is `docs/SEO-PLAN.md`; the prompt to hand a coding agent is its §0.
- **The brand query is occupied.** "TherapyLog" in search returns an unrelated
  school-therapy documentation product (therapylog.com, three store apps).
  Qualify the brand in titles and structured data ("TherapyLog — TRT and peptide
  tracker") and never rely on the bare name to be found. therapylog.app showed
  as unindexed on 3 Sep 2026; Search Console will confirm.
- **Generated art never carries data or chemistry.** The in-app syringe fill
  indicator stays code-drawn (real ml/unit numbers). Molecular structures on
  compound pages are never AI-generated (chemically unreliable) — if wanted,
  generate from SMILES via RDKit instead. **No per-compound images** — class art
  plus class color gets ~90% of the benefit without the consistency and
  maintenance trap. Full detail in `ART-DIRECTION.md`.
- **Visual platform is "the observatory, not the laboratory"** (set 17 Aug after
  the first direction was rejected). Dark but warming, solid forms with weight,
  a low amber first-light source — never cold clinical studio lighting, never
  thin luminous line work, never molecular lattices. Palette adds warm
  `#F5A65B` to the existing `#4ADE9A` / `#3BC4FF` / `#0B1015`. Two separate
  style blocks exist in `ART-DIRECTION.md` — one for marks, one for
  photographic renders — and mixing them is what produced the failed logos.
- **Model IDs in this codebase:** `claude-sonnet-5` (default) / `claude-opus-5`
  (quality option) in the Marketing Suite; `gemini-3-pro-image` ("Nano Banana
  Pro") for image generation. Don't downgrade these without being asked.
- **Arctos Labs** (supplement/pouch side brand) has its own repo:
  `therapylog/Arctos-Labs`. Brand and product context for it lives there, not
  here — this repo briefly carried an `arctos-reference/` folder that has been
  moved out.

---

## 1a. Read this before anything else (24 Aug 2026)

**The failure that cost a weekend was a process one, not a code one.** The
entitlement work below was finished on 19–22 Aug across two branches, and then:
no pull request was opened, and **this ledger was never updated**. GitHub's Code
tab shows `main` unless you pick a branch from the dropdown, and with no PR there
was nothing in the PR tab either — so the work was invisible. Sessions after it
re-derived the same findings from scratch, and one of them told the owner the
license system "was never built" because it searched `main` and never fetched
other branches. The owner had already gone looking on GitHub and found nothing.

Two rules follow, and they matter more than any technical decision here:

1. **A branch that is finished gets a pull request, immediately.** An unmerged
   branch with no PR is indistinguishable from work that does not exist.
2. **Update this file in the same session that does the work**, not later.
   `ENV-VARS.md` and `docs/LAUNCH-CHECKLIST.md` were both written on 19 Aug and
   neither was recorded here. If you are reading this file to learn the state of
   the project, also run `git ls-remote origin` (in **all four** repos) and
   check what is sitting on a branch — do not trust `main` to be the whole story.

The four repos: `therapylog-api`, `therapylog.github.io`, `therapylog-app` (iOS
Capacitor wrapper, stale), `Arctos-Labs` (a separate business — not TherapyLog).

## 1b. Launch prep — merged and settled (24 Aug 2026)

Both release branches were audited line by line against live Stripe and the
deployed API before merging. What changed on top of the 19 Aug work:

**Blockers found and fixed**

- **`verify-license` handed out license keys.** An email lookup returned the
  key — unauthenticated, unrate-limited, lapsed customers included. The key is
  the credential that spends the AI budget, so knowing any customer's address
  was enough to spend it. The key is now returned only to a caller who proved
  they hold it (presenting the key, or a Checkout Session id from a payment they
  just completed); an email lookup confirms the plan and stops there. `resend`
  is unchanged and still reveals nothing.
- **Webhook signatures were optional.** Verification ran only when secret,
  header and raw body were all present, so omitting the header skipped it.
  Re-fetching from Stripe stops a forged event fabricating a payment, but
  `customer.subscription.deleted` acts on the payload's customer id — so
  unsigned requests were a way to mail "your plan ended" to any customer whose
  id you could guess. Signatures are now mandatory.
- **A dead Redis would have killed the paid feature on day one.** The Upstash
  credentials in Vercel pointed at `crisp-shrimp-89132.upstash.io`, which no
  longer resolves — the database had been deleted. `meterUsage` took the Upstash
  path on env-var *presence* and refused the request when the call threw, so
  every subscriber's AI would have returned an error. An unreachable cache now
  falls through to the Stripe meter. **Set fresh Upstash credentials** — the
  fallback works but the per-day and global ceilings need the cache.
- **Post-checkout activation was broken.** The app posts `{session}`;
  `verify-license` only read `key`/`email`/`action` and answered 400, which the
  app treated as a silent definitive failure. There is now a session branch that
  retrieves the Checkout Session and returns the entitlement. A 5xx from Stripe
  surfaces as 503 so an outage never reads as "you didn't pay".

**Decisions taken**

- **AI cap is 50/month, 15/day** (was advertised as 145 while the cost analysis
  in `docs/AI-COST-AND-MODEL-NOTES.md` concluded 145 loses money on Sonnet 5).
  Copy and defaults now agree; `validate-guide.js` locks guide↔pro.html
  together. Revisit once real usage data exists — that was the owner's explicit
  intent in choosing 50, not a permanent ceiling.
- **The one-time / lifetime tier is retired.** Its Stripe price sits on an
  archived product, which makes Checkout refuse it outright, and the whole point
  of a subscription is that updates keep coming. The plan key is gone from
  `create-pro-subscription.js`, the cards are gone from `download.html` and
  `index.html`, and the checkout path no longer infers lifetime from
  `mode === "payment"` (which also closed a $0 grant via a 100%-off promo code).
  Honouring `tl_lifetime` is left in place for anyone grandfathered later.
  If it returns: expect **$49.99–$59.99**, restore the Stripe product first, and
  give it its own verification — the subscription path does not cover it.
- **Every App Store / Play Store claim is gone.** Four pages promised imminent
  native apps — `download.html` said they were "in review", and
  `providers/apply.html` said "Launching on iOS App Store now". §1 locks
  web-first indefinitely *because* the dosing content would be rejected, so
  those were unfulfillable, not merely early. `privacy.html` and
  `partnership.html` no longer imply store billing exists either. The Suite's
  system prompt already forbade store claims and still does.
- **Support and feedback are stated in the emails.** The purchase and welcome
  emails now say one person builds and answers the mail, and ask for bug
  reports, interface friction and feature ideas by name. This is a deliberate
  positioning choice, not filler — treat it as load-bearing copy.

**Verification standard used** — 92 API assertions (including new coverage for
unsigned, forged and unconfigured webhooks, and 17 for the key-disclosure fix),
plus all 10 site validators green, `ui-check-entitlement` among them at 31
browser checks confirming the honour-system bypasses are dead.

**Still owner-only, before promoting:** fresh Upstash credentials; add
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted` and `invoice.payment_failed` to the
`api.therapylog.app` webhook (it was subscribed to `payment_intent.succeeded`
alone, so a purchase would never have issued a license); delete the dead
duplicate endpoint `we_1Tdy5gFwxOceIOZwiqRUabq2`; and run one test-mode purchase
end to end. `ENTITLEMENT_SECRET` and `REQUIRE_ENTITLEMENT` are dead variables —
`api/entitlement.js` was deleted as superseded, so remove both.

## 2. What's shipped (verified live 17 Aug 2026)

All merged to `main`, deployed on GitHub Pages (therapylog.app) and Vercel.

**Bug fixes**
- Clinic Mode stack-overflow crash (function-hoisting self-reference)
- Onboarding "Continue" button unreachable on 390px-wide screens
- Light theme unreadable (dark-mode `!important` was overriding it)

**Data integrity (17 Aug)**
- **Encyclopedia stored deduplicated: 130 compounds in the data, not just at
  runtime.** History and lesson: the first dedupe pass (16 Aug) shipped as a
  load-time merge IIFE, so the *live app* showed 130 while the raw `const DB`
  still carried 148 entries with 12 duplicate ids — and the docs, exported from
  the merged view, disagreed with the source. An external verification read the
  raw source and reasonably called it a live defect. The merge now lives in the
  data itself: field-unioned entries, cross-class placements kept as `alsoIn`
  (13 cross-listings, rendered in every listed class), retired ids
  (epithalon→epi, tesamorelin→tesam, enclomiphene→enclo, lgd4033→lgd,
  somatropin→rhgh, urolithina→urolithin, ketoDhea→keto-dhea) still resolve via
  an alias map so old deep links work. `scripts/validate-encyclopedia.js` +
  a GitHub Actions workflow fail the build on duplicate ids/names, dangling
  `alsoIn` refs, and drift across app/JSON/markdown/page-copy counts.
- Hardcoded "148-Compound" copy corrected to 130 in app onboarding and the
  Marketing Suite prompts.

**Bloodwork normalization (18 Aug)**
- **Marker registry shipped** — `MARKER_REGISTRY` + resolution, unit conversion,
  classification, panel building and AI-payload construction, covering all 50
  lab form fields plus Lp(a). Keys match `LAB_FIELDS`/`LAB_REF` exactly, so the
  existing bloodwork tab is extended rather than replaced, and nothing needs
  migrating. Contract and how to add a marker: `docs/MARKERS.md`.
- **The scanner no longer discards units and ranges.** It now reads the unit as
  printed, the report's own reference interval, and the assay method; values are
  converted into the form's canonical units before they touch an input, and
  anything unconvertible is left blank with a reason rather than filled in
  wrongly. This fixes a real defect: a report in nmol/L or pmol/L previously put
  the raw foreign number straight into a ng/dL or pg/mL field.
- **Provenance is stored per marker** (`entry.labMeta`: reported unit, the lab's
  interval, assay method, conversion, `<`/`>` limits, edited-after-scan), and
  flagging now prefers the lab's own interval — in the bloodwork cards, the
  trend chart points, and the clinic summary.
- **The AI chat context is registry-normalized.** It was cherry-picking 11
  markers by hand and dropping the rest; it now sends every logged marker with
  its unit, range provenance and assay method, plus an explicit "NOT TESTED in
  this panel" list so the model can't comment on a marker that was never drawn.
- **Lab intake takes PDFs, screenshots and multi-page uploads (18 Aug).** The
  file picker was single-file, and a PDF — though the picker accepted it — was
  sent as an image content block, which the API rejects, so PDF upload could
  only ever fail. PDFs now go as `document` blocks, the picker is `multiple`
  (photos, screenshots and PDFs together; the camera button is unchanged),
  images are downscaled to a 1568px long edge before upload, and the request is
  size-checked against the 32MB API cap first.
- **The 50-field form became 100 built-in markers plus unlimited user-defined
  ones (18 Aug).** Added the analytes comprehensive panels actually print (CBC
  differential and indices, iron studies, GGT/LDH/CK/uric acid/magnesium/
  phosphorus, DHT/progesterone/pregnenolone/PTH/aldosterone, total T3/T4,
  ApoA1/LDL-P/homocysteine/fibrinogen/ESR/Omega-3, and more). The scanner now
  returns every result on the report — untracked ones come back as `extras` and
  can be added to the form in one tap. A filter box makes a 100-field form
  navigable.
**Money, entitlement and delivery (19 Aug)**
- **The paywall was decorative and is now real.** The gate was
  `localStorage.tl_tier`, set by an in-app dialog that let anyone pick their own
  tier; `/api/ai-research` spent the Anthropic budget for anyone who asked, with
  quotas keyed to an IP and a rate limiter that failed open when Upstash was
  unset. Buyers, meanwhile, were sent to `?tl_activated=pro` — a parameter the
  app never read — so paying customers got nothing. Entitlement now comes from
  Stripe: a license key (HMAC of the customer id, `TL-XXXX-XXXX-XXXX`) emailed
  on purchase, verified by `/api/verify-license`, cached with an expiry and
  re-checked daily. Outages don't downgrade anyone; lapses do. **No database** —
  Stripe holds the billing truth and the key.
- **Delivery is the installed PWA, not an APK.** `/download` was selling a
  $34.99 APK behind a `drive.google.com` link that redirects to a Google
  sign-in page (the file was never shared), and the button charged nothing.
  Replaced with a real $34.99 Checkout → license key → Add to Home Screen, on
  iPhone and Android. Updates were always automatic (the service worker is
  network-first); an APK is what would have broken that.
- **Sonnet 5 for the assistant** (Haiku was too shallow for protocol design,
  rehab and meal planning), adaptive thinking at `effort: medium`, cached system
  prompt, and `maxDuration` 10s → 60s because a Sonnet 5 answer with web search
  does not fit in ten seconds. Costs roughly 3× Haiku — watch the average
  against the 145/month cap.
- **Backups are surfaced properly**, since local-only data is the trade-off
  users get burned by: weekly nag (was 30 days), Web Share to iCloud/Drive/Files
  on mobile, a linked file that rewrites itself weekly on desktop Chromium, and
  a Profile card stating plainly that this device is the only copy.
- **One email list.** `/support` posted straight to Mailchimp while the privacy
  policy named only Resend; it now posts to `launch-notify` like everything
  else. Signups finally get a welcome email, and sales notify hello@.
- **Attribution without a server:** first-touch `utm_*`/`ref`/`rdt_cid` stored
  on landing and passed to Stripe as `ref`, so Stripe payments show which
  campaign produced them. Vercel Web Analytics added to all 13 pages — note it
  only collects once the domain is served by Vercel rather than GitHub Pages.
- Manual steps live in `docs/LAUNCH-CHECKLIST.md` (Vercel env vars, the
  duplicate Stripe webhook to delete, the DNS move, test-mode purchase run).

- **Two more CI guards** (`scripts/validate-markers.js`,
  `scripts/validate-bloodwork-flow.js`, workflow `Validate bloodwork`): registry
  integrity and namespace/unit/optimal-band drift, plus 35 assertions that run
  `app.html`'s real functions behind a DOM stub to prove scan→save→flag→AI
  context still holds — 68 assertions, including a stubbed `fetch` that proves a
  PDF leaves as a document block and untracked markers are proposed rather than
  dropped. Both were fault-injection tested.

**New app features**
- PWA layer: manifest, service worker, install-to-home-screen, real push
  notifications for dose reminders (works around the iOS 16.4+ /
  installed-PWA `Notification()` restriction via `registration.showNotification()`)
- Google/Apple Calendar sync via ICS export + Google TEMPLATE render URLs
  (recurring dosing schedules, RRULE)
- **Levels tab**: pharmacokinetic serum-level curves (Bateman one-compartment
  model, Tmax-matched absorption), ~60 compounds with published half-lives,
  28-day history + 7-day decay projection
- **Syringe builder** (Tools tab): multi-compound draw planning, stacked fill
  visualization, compatibility warnings (oil+water, suspensions, fragile
  proteins like HGH/IGF-1)
- **Side-effect response guide** (Tools tab): symptom → management pathway,
  always ending in "consult your doctor"
- **Sex-aware lab reference ranges** — verified working. `LAB_REF` is overridden
  per sex with age banding; `isFemale()` and female cycle visibility present.

**Marketing / ops**
- Landing page revamp: real app screenshots, dropped "Coming Soon to App Stores"
- Open Graph share cards across all pages
- Marketing Suite: **Graphics Studio** — Claude writes an image prompt →
  Gemini/Nano Banana renders → Claude critiques against the brief with
  vision → Nano Banana revises via image+text input
- Marketing Suite: **Biz Dev checklist** — 31-item working list
- Marketing Suite: **Focus board (17 Aug)** — new default view; one actionable
  card at a time from a 16-item seeded queue with Done/Skip, blocker
  dependencies, decision resolutions, and an Add-item control. Persistence
  bumped to `tl_mkt_v4` (v3 localStorage/gists migrate losslessly); Focus
  state and the Biz Dev checklist now sync via Gist too.
- Marketing Suite system prompt corrected: it claimed live App Store / Google
  Play listings, which would have generated false store claims in content.
  Now states the deliberate web-first/PWA position.
- Regulatory freshness pass (BPC-157/TB-500/KPV/MOTS-c/Semax 503A status,
  retatrutide/tirzepatide updates, 19 stale references refreshed)
- `docs/COMPOUNDS.md` + `docs/compounds.json` — regenerated from the deduped
  DB; machine-readable source of truth for class ids/colors/cross-listings
- `docs/ART-DIRECTION.md` — full Nano Banana prompt library

**Outreach (3 Sep 2026)**
- A creator/podcast/newsletter/community target list was researched and lives
  in the private `therapylog-api` repo at `docs/outreach-targets.md` (kept out of
  this public repo). It was built in a search-only environment: names,
  platforms, niches, audience signals and vendor-risk flags are usable as-is;
  every contact route is labelled by how it was found, and addresses marked
  unverified must be confirmed on the creator's own page before use. The
  verification prompt to run in a Claude Code session with web access is at
  the top of that file. Podcasts and newsletters publish sponsorship contacts;
  YouTube hides them behind a captcha — start with the former.

**SEO Phase 0 — technical foundation (3 Sep 2026)**

Implements `docs/SEO-PLAN.md` §4. Ships on its own; nothing here waits on Phase 1.

- **Jekyll is under control.** The config file was named `" config.yml"` with a
  leading space, so GitHub never read it and Jekyll ran on defaults — publishing
  `docs/LEDGER.md`, `docs/COMPLIANCE-AUDIT.md`, `docs/BRAND-AND-ENTITY-STRUCTURE.md`
  and the root PDF/zip/PNG junk at therapylog.app for anyone who guessed a URL.
  Renamed to `_config.yml` with an `exclude:` list covering `docs`, `scripts`,
  `*.md`, `*.pdf`, `*.zip`, `IMG_*.PNG`, `assets-1786901*.png`, `arctos-labs`,
  `README.md` and `.github`. **The files are excluded, not deleted** — the plan
  forbids deleting them here. The owner can delete them from git separately;
  they are listed in the Phase 0 commit message.
- **Crawl control exists for the first time:** `robots.txt`, a hand-written
  `sitemap.xml` (16 URLs; `<lastmod>` deliberately omitted until
  `build-pages.js` can keep it honest in Phase 1), a 32-hex IndexNow key file at
  the root, and `scripts/indexnow-submit.js` (dependency-free, run by hand after
  a deploy; `--dry-run` prints the payload). **Google does not participate in
  IndexNow** — Bing/Yandex/Naver/Seznam only.
- **`404.html`** with the site shell, every main page listed, and `noindex`.
- **`/about/`** — the author and editorial-policy page every later reference page
  links to: named non-clinical author, three-tier evidence labelling, "your lab's
  printed range wins", non-diagnostic optimal bands, corrections process, and a
  plain statement of what the site earns from.
- **`/tools/` and `/markers/` hub pages** so nothing links to a 404, plus
  `llms.txt`. Tools and Lab markers are now in the home nav and footer, Tools is
  in the guide, download and support footers, and `pro.html` finally links home.
- **JSON-LD** on `index.html` (Organization, WebSite, WebApplication with the
  free/monthly/annual offers), `guide.html` (Article) and `support.html`
  (ContactPage — deliberately **not** FAQPage; Google retired those rich
  results). Every page's graph is self-contained: the Person, Organization and
  WebSite nodes it references are defined on the page, so no `@id` dangles.
  `guide.html` also gained a visible byline, since an `author` in markup with no
  author on the page is not an E-E-A-T signal.
- **Service worker scoped.** `sw.js` fell back to the app shell for *any* failed
  navigation, so an unvisited `/tools/...` opened offline rendered the tracker.
  The fallback is now app-routes-only and `CACHE` is bumped to `therapylog-v3`.
- **The affiliate coupon no longer leaks to campaign traffic.**
  `pro.html`'s `tlStoredRef()` falls back to `utm_campaign` then `utm_source`,
  which is deliberate campaign attribution — so a tool-page visitor arriving on
  `?utm_campaign=reconstitution` reached checkout with `ref=reconstitution` and
  `create-pro-subscription.js` handed them the affiliate's one-month-free coupon,
  then reported the sale as UNKNOWN REF. Fixed **on the API side** as the plan
  requires: the coupon is applied only when the ref matches an enrolled key in
  `affiliates.json` (normalised through the same filter the handler runs over an
  incoming ref, so a code with a dot or a space still matches). Every ref is
  still written to subscription metadata, so attribution is untouched.
  `scripts/test-checkout-coupon.js` (26 assertions, fault-injection tested) runs
  in that repo's CI. **Consequence to know about:** `affiliates.json` now gates a
  discount, not just a payout — enrol an affiliate there *before* handing over
  their link, or their referrals pay full price. `pro.html` no longer promises
  "1 month free" for an arbitrary `?ref=`, because the page cannot know the
  roster; it says any discount is shown at checkout.
- **Validator coverage extended:** `about/`, `tools/`, `markers/` and `404.html`
  are in `validate-compliance.js` (`PUBLIC` and the banned-phrase scan),
  `validate-claims.js` (`PAGES` and the retired-tier scan) and
  `validate-encyclopedia.js` rule 9. `validate-claims.js` was running in **no**
  workflow at all and now runs in `validate-compliance.yml`. Workflow `paths:`
  filters were completed — `validate-encyclopedia.yml` never fired on
  `download.html` or `pro.html`, which rule 9 scans.
- **Still owner-only:** create a Search Console **Domain property** for
  therapylog.app via DNS TXT, submit the sitemap, import it into Bing Webmaster
  Tools and confirm the IndexNow key. No verification token was invented, so
  nothing is stubbed in the repo waiting to be wrong. First thing to check once
  verified: whether *any* therapylog.app URL is indexed.

**SEO Phase 1 — the /tools/ pages and the generator (3 Sep 2026)**

Implements `docs/SEO-PLAN.md` §5. **28 generated pages**, all committed as
output because GitHub Pages has no build step.

- **`scripts/build-pages.js` is the generator**, with `scripts/lib/app-source.js`
  as the shared extractor and `scripts/page-templates/` as the templates. It
  lifts out of `app.html` at build time: `DB`, `TL_PK`, `SYR_SIZES`,
  `TL_STORAGE`, `TL_FORM`, `SIDEFX`, `PK_COLORS`, the three interaction arrays
  merged the way the app merges them, the marker registry through
  `validate-markers.js`'s own harness, the `#tool-calc` markup, the syringe
  builder's markup (a template literal inside `tlFeaturesInit`, lifted and
  rendered with the real `SYR_SIZES`), the CSS rules the widgets need — and
  **19 functions as source text**. Multi-selector CSS rules are *narrowed*
  rather than dropped, so `.card,.li,.sdc,.gb,…` contributes `.card` without
  dragging app chrome onto a public page.
- **The pages run the app's code, not a copy of it.** That is the load-bearing
  claim and it is now mechanically enforced: `validate-public-pages.js` compares
  every inlined function against `app.html` byte for byte (**60 copies across
  the pages**), and then *runs* each page's script in a DOM stub and checks the
  numbers — because a function can match perfectly and still be broken by the
  markup surgery around it. It also re-derives **every published
  milligram-to-units row** by calling the app's real `calcUnified()`, so a
  static table cannot disagree with the calculator printed above it.
  `pro.html`'s first-touch attribution snippet is lifted the same way rather
  than pasted.
- **What shipped:** the `/tools/` hub; the reconstitution calculator plus five
  compound versions (semaglutide, tirzepatide, retatrutide, BPC-157, TB-500)
  each with an mg-to-units ladder; the insulin syringe unit converter; the
  testosterone dose calculator; the free testosterone calculator (Vermeulen
  1999, constants printed on the page); the combined syringe planner; the
  half-life and steady-state calculator (Chart.js from `/vendor`); **15
  per-compound half-life pages** with the curves pre-rendered as inline SVG
  from the app's own `pkCurve()` so a crawler sees them without JS; and the
  combination checker at `/tools/stack-checker/` with **45 pairs** — the app's
  50 minus the 5 that name a Tier C compound. Note for anyone reading
  `SEO-PLAN.md` §5.3: it predicts 46, having counted four Tier C *compounds*
  (Nandrolone Decanoate, Cardarine, RAD-140, Ligandrol) as four pairs. Cardarine
  appears in two of them, so five pairs drop. The filter is right and the plan's
  arithmetic was not.
- **Tier C never reaches a public page**, and the check is against the *inlined
  data* rather than a substring search, because `card` is Cardarine's id and
  also the `.card` CSS class the app's own markup emits. The validator parses
  each page's inlined arrays and reads the rendered compound names and
  `<option>` lists. Eight interaction names carry parentheticals matching no DB
  name or aka ("Cardarine (GW-501516)", "Natural Desiccated Thyroid (NDT)" and
  the like); they are hand-mapped in `app-source.js` and a name that stops
  resolving **fails the build** rather than quietly letting a pair through.
- **Determinism.** Nothing reads the clock except the one thing that must —
  a page's review date. Pages render with `@@DATE@@` placeholders, get hashed,
  then stamped from the committed `scripts/page-dates.json`, so a date changes
  only when that page's content does and `--check` never depends on today.
  `build-pages.js --check` runs in CI.
- **Content gates.** `validate-public-pages.js` enforces a per-page authored-word
  minimum (200 for compound pages, 250 for tool pages, 400 for `/about/`, 600
  reserved for marker pages) counted outside the widget, formula, table, caption
  and footer blocks — plus a **sibling-similarity ceiling** on 5-word shingles,
  so two compound variants cannot ship with near-identical prose. That is the
  defence against a thin-content classification, and it is a check rather than
  an intention.
- **`scripts/ui-check-tools.js`** drives all 28 pages in a real browser —
  page errors, 4xx requests, sideways scroll at 390px, and every widget worked
  the way a visitor would work it, including that a short-acting compound at a
  long interval reports *no* peak-to-trough ratio and that the share card's text
  is not mangled. Manual like the other `ui-check-*` scripts (Playwright is not
  in CI, and there is no install step), and it skips cleanly without
  `playwright-core`. It is the layer that caught bug 1 below.
- **Two bugs worth recording**, both found by verification rather than by
  reading:
  1. The syringe page inserted the widget *object* instead of its HTML, so the
     planner was absent while every other check passed. Found by driving the
     page in Chromium.
  2. The share-card script is emitted from a JS template literal, where a
     single-backslash `\s` is just `s` — so the page shipped
     `replace(/s+/g, ' ')` and the card's subtitle lost **every letter s**. The
     drift guard could not see it (the function text was fine), the script
     parsed, and the DOM stub never renders the card. Found by looking at the
     PNG. There is now a validator check for that whole bug class: a bare
     escape letter with a quantifier in an emitted regex.
- **Share cards.** Every generated page renders a 1200×630 card at `?og=1`,
  built from its own `<h1>` and lede so it cannot say something the page does
  not; `scripts/capture-og-shots.js` screenshots them to `assets/og/` and skips
  cleanly when `playwright-core` is absent, like the other capture scripts. The
  generator points a page at its own card when the PNG is committed and at the
  shared `icons/og-image.png` when it is not, and the validator fails if any
  `og:image` 404s.
- **`sitemap.xml` and `llms.txt` are generated now**, not hand-written. Generated
  pages carry `<lastmod>`; the hand-written ones deliberately do not.
- **Validator page lists are globs, not lists.** `validate-compliance.js`,
  `validate-claims.js` and `validate-encyclopedia.js` rule 9 walk
  `about/`, `tools/` and `markers/`, so a page is covered the moment it is
  generated rather than when someone remembers to add it. New workflow
  `.github/workflows/validate-public-pages.yml` runs `build-pages --check` and
  the new validator.
- **Linked from where it matters:** both feature headings on the home page, the
  guide's reconstitution section, and the support FAQ.
- **Owner action after deploy:** `node scripts/indexnow-submit.js` to push the
  28 new URLs to Bing and friends. Google picks them up from the sitemap and
  internal links only.

**Insulin added to the encyclopedia and a /compounds/insulin/ page written from
scratch (4 Sep 2026)**

The first compound added to `app.html`'s database rather than lifted from it,
and the first public page authored without a DB entry already behind it.
Requested by the owner: insulin is used at the top of bodybuilding, people ask
about it, and what they find is written either by someone selling a protocol or
by someone who will not discuss it at all. 131 compounds now, 81 pages, sitemap
143 to 144 URLs.

- **This is the one exception to "never edit app.html".** The standing rule
  through Phases 0-3 was that the app's data and logic are read, never written.
  The owner lifted it explicitly for this compound. What changed in `app.html`:
  one DB entry under `metabolic`, one `TL_STORAGE.overrides` entry, three
  `INTERACTIONS` rules, and the catalogue count. No logic, no functions, no CSS.
- **The DB entry carries no performance dose and says so in the table.** Two
  rows are the FDA-approved indications with "Individualised by a prescriber"
  where a number would go, because that is what insulin dosing actually is --- an
  output of measurement, not a figure read off a table. The third row is labelled
  "Performance and body-composition use" with "No dose is published here", which
  the app shows and the section 7 strip filter removes from the public page. An
  explicit refusal inside the tool, nothing to copy on the web.
- **Three interaction rules, and the GLP-1 one is the reason to add them at
  all.** Insulin + semaglutide is `danger`: a recognised clinical interaction
  where guidelines call for the insulin dose to come down, and this site's
  audience is full of people on a GLP-1. Insulin + recombinant HGH is `danger`
  --- the combination in the published fatality reports, dangerous precisely
  because the two effects run on different clocks. Insulin + T3 is `warn`.
- **The storage override deliberately declares no `medium`.** Every class medium
  describes something mixed, decanted or swallowed. With `medium: 'aq'` the rows
  rendered as "Before mixing" and "Once reconstituted", which is wrong for a
  ready-to-use solution; omitting it gives "Unopened" and "Once opened" in both
  the app and the generated page. `validate-storage.js` already permitted an
  override with no medium --- the check is `!o.medium || CLASSES.includes(...)`.
- **1,911 authored words, the longest page on the site.** Four sections:
  mechanism, and why product timing rather than a single half-life is the whole
  safety picture; the physique rationale and the fact that no controlled trial in
  non-diabetic athletes exists or can; the failure mode in sequence, including
  that the stage where someone could still save themselves ends before the danger
  does; and a harm-reduction section --- CGM, fast carbohydrate within reach,
  someone nearby who knows, glucagon, unit-versus-millilitre errors, and the
  over-the-counter availability of regular human insulin in most US states.
- **The count moved from 130 to 131 in eleven files.** `validate-encyclopedia.js`
  rule 9 caught every marketing instance, which is what it was written for:
  `app.html`, `index.html`, `download.html`, `marketing.html`, `guide.html`,
  both providers pages, `docs/COMPOUNDS.md`, `docs/compounds.json` and the hub
  template. `TIER_A` is 55 now and `assertTiers` expects it.
- **Owner action after deploy:** `node scripts/indexnow-submit.js /compounds/insulin/ /compounds/`
  submits just the two changed URLs.

**SEO Phase 3, batch 4 — the last twenty /compounds/ pages, and the hub rebuilt
(4 Sep 2026)**

Twelve Tier A and eight Tier B: gonadorelin, isotretinoin, raloxifene,
progesterone, oxytocin, quercetin, GHK-Cu, NAC/NALT, therapeutic melatonin,
acarbose, taurine and spermidine; thymalin, the NAD+ IV protocol, humanin,
LL-37, larazotide, SLU-PP-332, follistatin and dihexa. Eighty compound pages
now, 701-1,198 authored words each, worst sibling similarity 0.181 (humanin vs
MOTS-c, both mitochondrial-derived peptides — expected, and well under the 0.4
ceiling). Sitemap 123 to 143 URLs.

- **The hub was the actual problem, not the page count.** The owner reported
  that `/compounds/` "only shows a small handful" and that there was no way to
  find any of this from the top of the site. Three fixes: a `Compounds` link in
  the main nav on `index.html` and in the generated shell, the hub rewritten
  into ten labelled groups with a blurb each instead of one flat list, and a
  filter box above them that narrows the cards as you type and opens the first
  match on Enter — the encyclopedia's pattern, applied to compounds.
- **The hub asserts its own completeness at build time.** `GROUPS` in
  `pages-compounds-hub.js` throws unless every shipped compound appears in
  exactly one group and no group names a compound that has not shipped. That is
  what makes "a small handful" impossible to reintroduce silently: adding a page
  without placing it fails the build.
- **Class labels no longer leak the app's internal taxonomy.** Isotretinoin and
  raloxifene sit in the app class "Bodybuilding & PED Compounds", which is a
  correct internal label and a terrible public one. `displayClass()` maps every
  app class to a public equivalent, `COMPOUND_CLASS` overrides individual
  compounds where the class is wrong for them, and the four "Additional …"
  buckets throw rather than render — a compound in one has no public class until
  someone writes it. The validator checks the rendered label is non-empty, does
  not start with "Additional" and does not contain "Bodybuilding" or "PED".
- **Urolithin A was dropped from the batch and spermidine took its place.** The
  app's urolithin rows and drawbacks name commercial brands. Every compound page
  states that it names no vendor, so shipping that entry would have contradicted
  the page's own sentence. Spermidine covers the same autophagy ground without
  the conflict.
- **Deliberately not shipped, and why.** The Khavinson bioregulators are
  near-identical to one another in the app's own data and would produce pages
  that differ only in the organ named. `bpc157sys`, `tbnouveau` and
  `kisspeptin54` are data twins of pages that already exist. `igf1lr3` has no
  publishable dosing left after the strip filter and nothing but performance
  framing behind it. Insulin is not in app.html's database at all, so there is
  nothing to generate from — a page on it would be authored from scratch, which
  is a different decision and one for the owner.
- **Selank and semax were already live** from batch 3; the owner asked for them
  and they had shipped the day before under `/compounds/selank/` and
  `/compounds/semax/`.
- **Owner action after deploy:** `node scripts/indexnow-submit.js` for the 20 new
  URLs, and resubmit `sitemap.xml` in Search Console and Bing Webmaster — the
  "43 pages" figure the owner saw is a cached fetch of the Phase 1 sitemap.

**SEO Phase 3, batch 3 — twenty more /compounds/ pages (4 Sep 2026)**

Ten Tier A and ten Tier B: testosterone propionate, proviron, testosterone
pellets, tamoxifen, natural desiccated thyroid, creatine, berberine, fisetin,
dasatinib and telmisartan; hexarelin, GHRP-6, selank, cerebrolysin, DSIP, MOTS-c,
VIP, kisspeptin-10, ARA-290 and 5-Amino-1MQ. Sixty compound pages now, 871-1,379
authored words each, worst sibling similarity 0.173 — the four growth hormone
releasing peptides, as expected, and still well under the 0.4 ceiling. Sitemap
103 to 123 URLs.

- **Chosen to close out families and to correct things.** The GHRP set is now
  complete (ipamorelin, GHRP-2, GHRP-6, hexarelin), which is what lets each page
  be about what distinguishes it rather than about growth hormone in general.
  Berberine exists to say plainly that it is not a GLP-1 agonist and the weight
  effect is a couple of kilograms, not fifteen per cent. Creatine exists mostly
  for one paragraph: it raises serum creatinine and gets healthy people referred
  for renal workup, and cystatin C settles it.
- **Tamoxifen ships with no dosing table and the page says why.** Both rows the
  app holds are post-cycle or during-cycle protocols, so the strip filter removes
  them and nothing survives. Rather than hide that, the page has a section
  explaining that every compound page is filtered the same way and this is the
  one entry where the filter leaves nothing.
- **"bulking" added to the dose strip filter.** GHRP-6's "Bulking and Mass" row
  was the only place that word appears anywhere in the reference, and it survived
  the §7 word list. One row removed across the whole DB.
- **A data disagreement flagged rather than papered over.** app.html's regulatory
  field for natural desiccated thyroid says "FDA approved". Desiccated thyroid
  products are not FDA-approved drugs — they predate the 1938 approval pathway
  and are marketed under enforcement discretion. The fact box still reproduces
  the app's string, because that is the policy, and the prose says openly that it
  disagrees with the box and why. **Owner action: correct that field in
  app.html.** This site's policy of reproducing app data verbatim only works if
  the prose is allowed to contradict it in public when it is wrong.
- **Forty-seven publishable compounds remain.** No generator or validator changes
  beyond the filter word and the coded-word fix from batch 2.

---

**SEO Phase 3, batch 2 — twenty more /compounds/ pages (4 Sep 2026)**

Ten Tier A and ten Tier B, chosen by search demand rather than alphabetically:
tesamorelin, dutasteride and finasteride, levothyroxine, liothyronine,
cabergoline, exemestane, PT-141, low-dose naltrexone, DHEA and the NAD+
precursors; CJC-1295 with DAC, enclomiphene, melanotan II, GHRP-2, HGH fragment
176-191, AOD-9604, thymosin alpha-1, semax, KPV and SS-31. Forty compound pages
now, 896-1,379 authored words each, worst sibling similarity 0.159 against the
0.4 ceiling. Sitemap 83 to 103 URLs.

- **Chosen so the pages explain each other.** Batch 1 shipped CJC-1295 without
  DAC without the compound the name belongs to; this one adds it, and the two
  pages carry the naming problem between them. HGH fragment 176-191 and AOD-9604
  are the same argument: the fragment is sold on a 12.5x potency figure that
  traces to rodents, and AOD-9604 is the modified version of the same region
  that reached phase IIb in people and missed its endpoint. Enclomiphene
  completes clomiphene. Dutasteride links the DHT page, cabergoline the
  prolactin page, the two thyroid hormones the thyroid panel.
- **`igf1lr3` was pulled from the shortlist.** Its only dosing rows are a
  performance row, which the strip filter removes, and a site-injection row for
  local muscle growth. What survives is a page whose entire subject is a
  performance practice with a mitogenicity concern attached, and the honest
  version of it is one nobody would publish. It stays Tier B in the policy and
  unwritten in practice; §7 assigns tiers, it does not oblige a batch.
- **The bodybuilding-coded-word guard was flagging a molecule's own name.**
  Thymosin Alpha-1 is called that, and the check added in batch 1 read "alpha"
  in both its slug and its title as a marketing choice. The compound's own DB
  name and the slug derived from it are now removed before the test, which keeps
  the rule sharp for everything an author actually picks — fault-injected with
  "Rapamycin: peak mTOR protocol" to confirm it still fires.
- **Sixty-seven publishable compounds remain.** The generator, the tier lists and
  the validators have not changed since batch 1: a batch is content plus a
  rebuild.

**On the sitemap reading 43.** Reported this session as a live problem; it is
not. 43 is exactly the Phase 1 sitemap from 3 Sep — 14 static plus 29 tool
pages. The repository has carried 62, then 83, then 103 since, `sitemap.xml`
parses clean with no duplicates and no malformed entries at 8.5 KB, there is no
second sitemap file and no `jekyll-sitemap` plugin, `robots.txt` points at the
right URL, and the Pages deployment for every merge including the most recent
completed successfully. The number is a stale reading in the webmaster tool from
the last time it fetched the file. Resubmitting the sitemap forces a re-fetch;
`node scripts/indexnow-submit.js` pushes the URL list to Bing directly and still
has to be run from the owner's machine, because `api.indexnow.org` and
`therapylog.app` are both blocked from the CI sandbox.

---

**SEO Phase 3, batch 1 — the first twenty /compounds/ pages (4 Sep 2026)**

Implements `docs/SEO-PLAN.md` §7, first of the twenty-at-a-time batches. Ten
Tier A and ten Tier B compounds, plus the generated `/compounds/` hub. Every page
runs 971–1,379 authored words outside the shared blocks against a 450 floor, and
the worst sibling-similarity pair is 0.143 against a 0.4 ceiling.

- **The tier policy is now data, not prose.** `TIER_A` (54) and `TIER_B` (53)
  sit beside `TIER_C` (23) in `scripts/lib/app-source.js` as explicit frozen
  lists, with `assertTiers()` failing the build if the three do not partition
  DB's 130 ids exactly. Explicit lists rather than a regex over the approval
  strings: those strings are authored copy, and a classifier reading them would
  silently reclassify a compound the next time someone fixes a typo.
- **Where the split diverges from §7's estimate, and why.** §7 guessed 56 Tier A
  and 46 Tier B. The rule actually applied — Tier A means obtainable lawfully in
  the US as an approved drug or as a supplement, OTC or cosmetic — puts thymosin
  alpha-1, cerebrolysin, selank, semax, epithalon and pinealon in Tier B instead.
  All are approved somewhere and none is obtainable here on a prescription, so
  they carry the regulatory block. Tier B publishes *with* labelling; it does not
  withhold, so this is the more protective placement rather than a downgrade.
- **What the pages publish from the app, and what they refuse to.** Name,
  aliases, class, regulatory string, PK row, storage rule and caveat, monitoring
  panel, filtered dosing rows, drawbacks list and interaction rules are all
  lifted at build time. `summary` and `pros` are never rendered: `summary`
  carries editorial lines and `pros` is a benefits list, and both read as
  advertising under a founder's byline on a page built to rank. `cons` **is**
  rendered. Publishing the risks and withholding the benefits is deliberate, and
  each page says so in its own words.
- **`stacks[]` is not rendered at all**, which goes further than §7 asked (it
  only required stripping groups naming a Tier C compound). A combination
  presented as a plan under this byline is a recommendation to run it, which is
  what B-5 forbids; the combination content lives on `/tools/stack-checker/`,
  framed as a conflict check. It also closes the last route by which a Tier C
  name could reach one of these pages.
- **The dose strip filter needed two patterns, not one.** §7's word list applied
  to the whole row emptied fourteen compounds' tables — "cycle" in a frequency
  field is usually the Khavinson peptides' "10-day pulse cycles, twice a year",
  which is the schedule those compounds are actually studied at. The label keeps
  the broad pattern; the row fields get a narrower one that catches use during or
  after a suppressive cycle. Net effect is four rows removed: tamoxifen's two,
  clomiphene's PCT row and HCG's pre-PCT primer.
- **The authored-word floor was counting app text on every page type.** The
  exclusion used a non-greedy scan to the first closing tag, so a nested `<div>`
  ended the match early — an interaction block is
  `<div class="pair"><div class="sev">…</div>…</div>`, and only the inner div was
  removed. Testosterone cypionate's fourteen interaction rules were worth roughly
  700 words a compound page would have been credited with writing.
  `stripBlocks()` now counts tag depth. The real numbers were lower everywhere:
  `/tools/stack-checker/` reported 3,218 authored words and has 590. Every page
  still clears its floor.
- **New assertions in `validate-public-pages.js`:** the tier partition; every
  `/compounds/` page maps to a tiered compound; every Tier B page carries the
  regulatory block, the app's own approval string and the storage caveat
  verbatim; no page reproduces a combination protocol line (scanned with the
  interaction, drawbacks and table blocks removed, because those legitimately
  carry app text that collides — sermorelin's own dosing row is "Sermorelin
  200mcg + Ipamorelin 200mcg"); no stripped dosing row leaks; the benefits list
  never appears; and no bodybuilding-coded word in a `/compounds/` slug or title.
- **Sources are named, not linked.** Phase 2's citation pass could not resolve
  publisher URLs from this sandbox, and a link that 404s in two years is worse
  than a title and a year you can search. Each page carries a "where the
  load-bearing numbers come from" block naming trial, journal and year.
- **Internal linking is derived, not chosen.** A compound page links to a marker
  page only when the app's own monitoring note for that compound names one of
  that marker's registry aliases — the inverse of the matching the marker pages
  already use. A monitoring note that stops naming a marker drops the link rather
  than leaving a wrong one.

Sitemap is 83 URLs, up from 62. Batch 2 onward: add entries to
`scripts/page-templates/compounds-content.js`; everything else is wired.

---

**SEO Phase 2 — the fifteen /markers/ pages (3 Sep 2026)**

Implements `docs/SEO-PLAN.md` §6. Fifteen marker pages plus
`/markers/trt-bloodwork-checklist/`, all under the founder's byline, each with
three or more cited guideline or primary sources, three-tier evidence labels and
a side-effect discussion that ends with the prescribing clinician.

- **Only the prose is authored.** Units and their conversion factors, the assay
  variants with the app's own `<select>` labels, the generic range, the optimal
  band and the sex/age tables are all generated from `app.html`. The sex/age
  tables are produced by *running* the app's own `getAdjustedLabRanges()` against
  a synthetic profile per band rather than transcribing it, so they cannot drift.
  The unit converter on each page runs the app's real `normalizeValue()`, which
  means it refuses exactly what the app refuses.
- **The checklist hub is entirely generated** from `MARKER_REGISTRY` and the
  protocol templates: the 6 markers whose assay must be specified, the 7 results
  that need context recorded beside them, the values the app will not convert,
  and draw timing. Nothing on it is a list somebody typed.
- **Guards added, every one fault-injection tested:** B-5 enforced rather than
  trusted (the app's `SIDEFX.resp` entries name drugs at doses — anastrozole and
  exemestane among them — and a page publishing one now fails the build); every
  unit surviving into a page's inlined registry, including function-valued
  conversions; the optimal band labelled non-diagnostic *in the row it appears
  in*; LOINC labelled unverified; sex/age bands re-derived cell by cell.
- **A real serialisation bug caught:** `JSON.stringify` silently drops
  function-valued properties, and HbA1c's mmol/mol conversion is a non-linear
  function. The first build shipped an HbA1c converter with no conversion at all.

**What the adversarial review pass taught us, worth keeping.** Each of the last
five pages was checked by three independent reviewers. Half of what they reported
was wrong, and telling which half took real verification:

- Three reviewers independently called an Lp(a) molar/mass ratio of 3.6 a
  fabrication, each supplying the same confident correction. It is real — the
  ratio runs 1.82 below 75 nmol/L to 3.64 above 324 nmol/L. All three were
  recalling the same table, none could fetch the paper, and they converged on a
  wrong answer. **Majority agreement between agents that cannot check a source is
  not evidence.** Settle it by searching.
- They did correctly catch an arithmetically inverted worked example, a swapped
  citation pair, an overstated claim about what the app does, and a broken
  renderer token that would have published verbatim.
- The same pass produced a correction to already-shipped content: the hematocrit
  page stated the 2018 Endocrine Society guideline discourages starting therapy
  above a baseline of 50%. Sources disagree (48% and 50% both appear, and reviews
  note the definition of erythrocytosis itself varies). The page now leads with
  the 54% withholding threshold, which is consistent everywhere.

**Known not-shipped**
- No art assets have been generated. Every `assets/art/*.png` returns 404.
  Prompts are ready; images are not. (`favicon.ico` shipped with the 2026-08
  logo update, along with the new `icons/icon.svg` and derived icons.)

---

## 3. Open questions — need a decision, not yet resolved

Numbered so a chat can say "resolved #4" and update this section. These mirror
the decision items on the Focus board; resolve in either place and sync.

1. **Logo direction.** The molecular/thin-line concepts were generated and
   rejected — they rendered badly, and the diagnosis is now written into
   `ART-DIRECTION.md`: image models paint light and texture rather than vector
   geometry, so thin lines and fused-ring topology fail structurally. The kit
   was rebuilt (17 Aug) on a new platform, **"the observatory, not the
   laboratory"**, with five non-molecular marks — the Beacon (lighthouse,
   guidance in dangerous conditions), the Peak (the asymmetric PK curve as a
   solid form), the Ibex (sure-footed on lethal terrain), the Dial, and a heavy
   TL lockup. Need a pick before vector tracing.
2. ~~**Named author for medical content.**~~ **Resolved 3 Sep 2026: Joel, with a
   disclosed non-clinical role and a published review process** (see §1). A paid
   clinical reviewer is a later upgrade. The compound-page rollout is no longer
   gated on this; it is gated on the marker pages having four weeks of Search
   Console data (`docs/SEO-PLAN.md` §7).
3. **In-app lab ordering with commissions** — partners listed in the Biz Dev
   checklist, none contacted. Needs outreach plus an attorney check; per-test
   commission structures brush anti-kickback rules even cash-pay, and a flat
   marketing fee is usually cleaner.
4. **White-label / boutique pivot** — targets identified, zero conversations.
   Near-term priority given the contracting slow season, or after app work?
5. **Nootropic oral pouch + supplement line** (Arctos Labs) as a parallel
   business. Still exploratory; brand context now lives in the
   `therapylog/Arctos-Labs` repo. Decision needed on parallel vs deferred.
6. **Affiliate program** — built, **zero affiliates recruited**. Still the
   single biggest gap between current state and revenue, and the only item on
   the board with a same-month revenue path.
7. **Aggregate anonymized user stats** on compound pages ("of users tracking X,
   62% also track Y") would be original data no competitor can replicate and the
   strongest defense against a thin-content classification. Needs a minimum
   cohort threshold and a check that the current Terms permit aggregate display.
8. **SteroidPlotter / CycleVitals feature parity** — checked, nothing found that
   TherapyLog lacks. Closed unless a chat finds something new.

**Resolved and closed:**
- *Named author (#2)* — Joel, non-clinical, published review policy. 3 Sep 2026.
- *Female reference ranges* — raised as a possible live bug, verified working.
  Sex-aware ranges with age banding are implemented. No action needed.
- *Encyclopedia sync (was top open action)* — landed 17 Aug, see §2. The
  Focus board's first card is a five-minute spot-check of the live result.

---

## 4. Next steps, roughly in priority order

The Focus board holds the working sequence. This is the summary.

1. ~~Generate the four logo concepts, pick one, vector-trace, replace
   `icons/icon.svg` and derived icons. Add the missing `favicon.ico`.~~
   Done (2026-08): the hexagon TL monogram logo is vector-traced into
   `icons/icon.svg` + `icons/logo-dark.svg`/`logo-light.svg`, every derived
   icon and the og-image are regenerated, and `favicon.ico` ships at the root.
2. **Start affiliate recruitment** — highest-leverage unstarted item, and the
   only near-term revenue path.
3. ~~**SEO Phase 0** (`docs/SEO-PLAN.md` §4).~~ **Done 3 Sep 2026** — see §2.
   Jekyll is under control, `robots.txt`/`sitemap.xml`/IndexNow/`404.html`/
   `/about/`/`llms.txt` are live, JSON-LD is on index, guide and support, Tools
   and Lab markers are in the nav, the service worker fallback is scoped, and the
   affiliate-coupon leak is closed on the API side. **Two things still need the
   owner in a browser:** the Search Console Domain property (DNS TXT) with the
   sitemap submitted, and the Bing import plus IndexNow key confirmation.
   Indexation lags 4–8 weeks, so do those now rather than with Phase 1.
3a. ~~**SEO Phase 1** (`docs/SEO-PLAN.md` §5).~~ **Done 3 Sep 2026** — see §2.
   28 pages under `/tools/`, generated by `scripts/build-pages.js` with the
   app's own function source inlined and a byte-for-byte drift guard plus a
   DOM-stub execution check in CI. Tier C never reaches a public page, checked
   against the inlined data. Submit the new URLs with
   `node scripts/indexnow-submit.js` after the deploy.
3b. ~~**SEO Phase 2** (`docs/SEO-PLAN.md` §6).~~ **Done 3 Sep 2026** — see §2.
   All fifteen marker pages plus the bloodwork checklist hub are live.
   **Search Console is verified and the pages are submitted for indexing** (owner,
   3 Sep), so the four-to-eight week clock that gates Phase 3 is now running.
   Bing Webmaster Tools and the IndexNow key are the remaining owner step;
   `node scripts/indexnow-submit.js` pushes all 62 URLs once that is done, and
   Bing is also the route into ChatGPT's search index.
4. Generate the 30 class illustrations + hero renders, wire into the encyclopedia
   and landing page (`/assets/art/class-{id}.png`, ids match `compounds.json`).
5. Compliance pass module in the Marketing Suite — gates all content publishing.
6. **SEO Phase 3 — compound pages**, batches of 20 with human review. Tier A and
   B only (`docs/SEO-PLAN.md` §7). **Batch 1 done 4 Sep 2026** — see §2: twenty
   pages plus the `/compounds/` hub, tier lists frozen and asserted, generator
   and validators wired so a batch is now content-only work. The four-week
   Search Console gate was waived deliberately: there is no query data yet (the
   marker pages deployed the same week), and marker queries sit in a different
   query space from compound queries, so waiting would not have informed the
   selection. **Batch 2 done 4 Sep 2026** — twenty more, also see §2, taking the
   sitemap to 103 URLs. **Batch 3 done 4 Sep 2026** — twenty more, taking it to
   123. **Batch 4 done 4 Sep 2026** — the last twenty, taking it to 143, along
   with the nav link, the grouped hub and the filter box the owner asked for.
   **Phase 3 is complete at 80 compound pages.** The 27 tiered compounds not
   shipped were left out on purpose — the Khavinson bioregulators are
   near-identical to one another in the app's own data, `bpc157sys`, `tbnouveau`
   and `kisspeptin54` are data twins of pages that exist, and `igf1lr3` has no
   publishable dosing left after the strip filter. See the batch 4 entry in §2.
7. Weekly blog pipeline from PubMed / Europe PMC / ClinicalTrials.gov.
8. Decide white-label and pouch priority relative to core app growth.
9. Decide the BYOK price. At $8.99/mo it sits $1 under Pro while the customer
   also pays their own API costs, so nobody rational picks it. Either drop it
   (~$3.99) or fold BYOK into the lifetime license. Pricing was deliberately
   left unchanged for the 19 Aug plumbing work.
10. Verify the marker registry's LOINC codes against real vendor payloads
   (Quest/LabCorp) before any lab API work, and check `getUnmappedLog()` output
   from real scans to see which marker names the registry is still missing.

---

## 5. How to keep chats in sync

- **Start of a new chat/task:** read this file (`docs/LEDGER.md`) first,
  before doing research or making recommendations that touch product
  direction, pricing, positioning, or compliance stance. Don't re-derive or
  re-question the "locked decisions" in §1 unless the user explicitly
  reopens one.
- **Verify before asserting state.** The encyclopedia episode is the standing
  example: the app's runtime behavior, its raw source data, and the docs told
  three different stories, and each observer read a different one. Raw GitHub
  responses also cache — cache-bust when checking file state, and measure the
  runtime artifact, not just the documentation about it. Where a guarantee
  matters, encode it as a check (`scripts/validate-encyclopedia.js`) rather
  than a claim in a document.
- **End of a chat that changed status:** update the relevant section —
  move a shipped item into §2, resolve or add an item in §3, reorder §4 if
  priorities shifted. Bump "Last updated" at the top.
- **Detailed content lives elsewhere, referenced not duplicated:**
  `COMPOUNDS.md` / `compounds.json` for compound data,
  `ART-DIRECTION.md` for image-generation prompts.
- **This file is committed to the repo** (`therapylog/Therapylog.github.io`,
  `docs/LEDGER.md`) so any chat with repo access can read and edit it
  directly — no separate doc store to keep in sync.
