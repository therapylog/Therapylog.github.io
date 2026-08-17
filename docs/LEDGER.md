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

**Last updated:** 17 August 2026

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
- **Paid acquisition is not the growth channel** at this price point. Growth
  channels in priority order: affiliates → SEO/free tools → community
  (Reddit/X) → newsletter partnerships → PR. Paid social only as retargeting.
  With stores shelved *and* paid deprioritized, organic search and AI-answer
  citation carry most of the acquisition load — which raises the stakes on
  compound pages and the blog.
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

**Known not-shipped**
- No art assets have been generated. Every `assets/art/*.png` returns 404 and
  `favicon.ico` is missing. Prompts are ready; images are not.

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
2. **Named author for medical content.** Compound pages and the blog are YMYL.
   Without an identifiable responsible party and a stated review process they
   won't earn trust signals. Options: Joel with a disclosed non-clinical role
   and a published review process, or a paid clinical reviewer. **Gates the
   compound-page rollout.**
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
- *Female reference ranges* — raised as a possible live bug, verified working.
  Sex-aware ranges with age banding are implemented. No action needed.
- *Encyclopedia sync (was top open action)* — landed 17 Aug, see §2. The
  Focus board's first card is a five-minute spot-check of the live result.

---

## 4. Next steps, roughly in priority order

The Focus board holds the working sequence. This is the summary.

1. Generate the four logo concepts, pick one, vector-trace, replace
   `icons/icon.svg` and derived icons. Add the missing `favicon.ico`.
2. **Start affiliate recruitment** — highest-leverage unstarted item, and the
   only near-term revenue path.
3. Submit sitemap to Bing Webmaster and Search Console, wire IndexNow. Thirty
   minutes; indexation lags 4–8 weeks so the clock should start early.
4. Generate the 30 class illustrations + hero renders, wire into the encyclopedia
   and landing page (`/assets/art/class-{id}.png`, ids match `compounds.json`).
5. Compliance pass module in the Marketing Suite — gates all content publishing.
6. Compound pages, batches of 20 weekly with human review. Gated on #2 in §3
   (named author) and #3 above.
7. Weekly blog pipeline from PubMed / Europe PMC / ClinicalTrials.gov.
8. Decide white-label and pouch priority relative to core app growth.

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
