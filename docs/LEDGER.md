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
3. **SEO Phase 0** (`docs/SEO-PLAN.md` §4): take control of Jekyll (the repo's
   config file is named `" config.yml"` with a leading space, so Jekyll is on by
   accident and every `.md` in `docs/` — this ledger, the compliance audit, the
   brand structure doc — plus the root PDF/zip/PNG junk is published at
   therapylog.app), then `robots.txt`, `sitemap.xml`, IndexNow, Search Console
   and Bing verification, `404.html`, `/about/` author page, JSON-LD on
   index/guide/support, Tools and Lab markers in the nav, and scope the
   service worker's offline fallback to `/app`. Indexation lags 4–8 weeks so
   the clock should start early.
3a. **SEO Phase 1** (`docs/SEO-PLAN.md` §5): `scripts/build-pages.js` generates
   `/tools/` pages from the calculators already in `app.html` — reconstitution
   (plus compound-specific variants), insulin-syringe units, syringe builder,
   half-life calculator plus per-compound half-life pages, stack checker — with
   the app's own function source inlined at build time and a validator that
   fails on drift. Tier C compounds (AAS, SARMs, PCT) never get public pages.
3b. **SEO Phase 2** (`docs/SEO-PLAN.md` §6): fifteen lab-marker pages, five a
   week, authored under the founder's byline with a generated fact box.
   Search-landscape check (3 Sep 2026): no tracker app has assay-aware marker
   pages; IGF-1-by-age and ferritin-on-TRT are effectively unowned; estradiol
   sensitive-vs-standard is the flagship.
4. Generate the 30 class illustrations + hero renders, wire into the encyclopedia
   and landing page (`/assets/art/class-{id}.png`, ids match `compounds.json`).
5. Compliance pass module in the Marketing Suite — gates all content publishing.
6. Compound pages, batches of 20 weekly with human review. Tier A and B only
   (`docs/SEO-PLAN.md` §7); gated on the marker pages having four weeks of
   Search Console data, not on the named author (resolved).
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
