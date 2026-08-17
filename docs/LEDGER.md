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

**Last updated:** 17 August 2026

---

## 1. Locked decisions — don't re-litigate these

- **Web-first, indefinitely.** App Store / Play Store listings are shelved on
  purpose, not by default. Reasoning: getting listed would require cutting
  compounds/dosing information the TRT/AAS community relies on, and doing that
  would compromise credibility in that community. A separate, store-compliant
  version is a possible *future* fork, not a current plan. Don't propose
  App/Play Store submission as a near-term action.
- **Mission is harm reduction**, not performance enhancement. Every side-effect
  workflow (e.g. high prolactin → cabergoline, elevated E2 → help pick an AI)
  ends with "consult your doctor." Keep that framing in any new feature or
  marketing copy — it's both the ethical stance and the legitimacy argument
  with the community.
- **Pricing:** $9.99/mo, $99.99/yr, both live at therapylog.app/pro (Monthly/
  Annual tabs). Don't re-verify this or claim there's no annual tier — it exists.
- **Encyclopedia is 130 unique compounds across 30 classes** (deduped from
  raw list; see `COMPOUNDS.md`). Competitors (Regimen ~150+, Smart Peptide
  Tracker ~200+) beat pure count, so positioning is **per-entry depth**
  (PK curves, side-effect guidance, regulatory status), not raw compound count.
  Don't market "300+ compounds" — that number was wrong and has been corrected
  everywhere.
- **Paid acquisition is not the growth channel** at this price point (mobile
  CAC benchmarks make it upside-down; see research summary below). Growth
  channels in priority order: affiliates → SEO/free tools → community
  (Reddit/X) → newsletter partnerships → PR. Paid social only as retargeting.
- **Generated art never carries data or chemistry.** The in-app syringe fill
  indicator stays code-drawn (real ml/unit numbers). Molecular structures on
  compound pages are never AI-generated (chemically unreliable) — if wanted,
  generate from SMILES via RDKit instead. Stylized/abstract molecular art
  (logo, class icons, hero renders) is fine and encouraged. Full detail in
  `ART-DIRECTION.md`.
- **Model IDs in this codebase:** `claude-sonnet-5` (default) / `claude-opus-5`
  (quality option) in the Marketing Suite; `gemini-3-pro-image` ("Nano Banana
  Pro") for image generation. Don't downgrade these without being asked.

---

## 2. What's shipped (as of 17 Aug 2026)

All merged to `main`, deployed live on GitHub Pages (therapylog.app) and
Vercel (production target, confirmed via deployment list).

**Bug fixes**
- Clinic Mode stack-overflow crash (function-hoisting self-reference)
- Onboarding "Continue" button unreachable on 390px-wide screens
- Light theme unreadable (dark-mode `!important` was overriding it)
- Duplicate/hidden encyclopedia entries from inconsistent dedupe

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

**Marketing / ops**
- Landing page revamp: real app screenshots, corrected compound counts,
  dropped "Coming Soon to App Stores" badge
- Open Graph share cards across all pages
- Marketing Suite: **Graphics Studio** — Claude writes an image prompt →
  Gemini/Nano Banana renders → Claude critiques against the brief with
  vision → Nano Banana revises via image+text input. Download button, brand
  reference baked into every prompt.
- Marketing Suite: **Biz Dev checklist** — 31-item working list (lab-ordering
  partners, white-label clinic targets, pouch manufacturer leads, growth
  actions, legal loose ends)
- Regulatory freshness pass (BPC-157/TB-500/KPV/MOTS-c/Semax 503A status,
  retatrutide/tirzepatide updates, 19 stale references refreshed)
- `docs/COMPOUNDS.md` + `docs/compounds.json` — machine-readable compound
  inventory, source of truth for class ids/colors
- `docs/ART-DIRECTION.md` — full Nano Banana prompt library (logo, 30 class
  icons, hero renders, empty states, onboarding, social/ad creative)

---

## 3. Open questions — need a decision, not yet resolved

Numbered so a chat can say "resolved #4" and update this section.

1. **Logo direction.** Four concepts drafted in `ART-DIRECTION.md` (shared
   skeleton / conversion sequence / TL monogram / emblem wildcard), all built
   on testosterone↔estradiol sharing a steroid backbone and diverging at the
   A-ring. Need the user to generate all four in Nano Banana and pick one (or
   ask for a synthesis) before vector tracing.
2. **In-app lab ordering with commissions** — evaluated as a monetization
   idea (Lab Testing API, DirectLabs, Evexia, Rupa/Fullscript, Quest, Marek
   listed in the Biz Dev checklist as contacts to pursue) but no partner has
   been contacted yet. Needs outreach + an attorney check on compliance
   before building any in-app flow.
3. **White-label / boutique pivot** — targets identified (Hone, Defy, TRT
   Nation, PeterMD, directory providers, coaches) but zero conversations
   started. Is this a near-term priority given the user is heading into a
   contracting slow season with more time, or does app-feature work come
   first?
4. **Nootropic oral pouch + supplement line** as a second, side-by-side
   business. Smaller pouch manufacturers to inquire with are listed in Biz
   Dev; no outreach yet. Still exploratory — needs a decision on whether this
   is worth pursuing in parallel or after TherapyLog's own growth channels
   are further along.
5. **Affiliate program** — built into the app/marketing infrastructure but
   **zero affiliates recruited**. Flagged repeatedly in research as the
   single biggest gap between current state and revenue. Whose job is
   recruiting them, and is there a target list yet?
6. **Higher-quality art assets** — prompts are ready (`ART-DIRECTION.md`) but
   no images have been generated yet. Once generated, wiring into the app
   (encyclopedia class tiles, empty states, onboarding) is unstarted but
   scoped (file paths match `compounds.json` class ids).
7. **SteroidPlotter / CycleVitals feature parity** — checked, no undiscovered
   features found that TherapyLog lacks. Consider this question closed
   unless a chat finds something new; if so, log it here.

---

## 4. Next steps, roughly in priority order

1. Generate the four logo concepts, pick a direction, vector-trace it,
   replace `icons/icon.svg` and derived app icons/favicon.
2. Generate the 30 class illustrations + 2 hero renders, wire into the
   encyclopedia and landing page (paths: `/assets/art/class-{id}.png`, etc.
   — see file plan in `ART-DIRECTION.md`).
3. Start affiliate recruitment — this is the highest-leverage unstarted item.
4. Begin outreach on lab-ordering partnerships (Biz Dev checklist has the
   contact list) — gate behind attorney review before any in-app integration.
5. Decide on white-label/boutique and pouch/supplement side-business
   priority relative to core app growth (open questions #3–4).

---

## 5. How to keep chats in sync

- **Start of a new chat/task:** read this file (`docs/LEDGER.md`) first,
  before doing research or making recommendations that touch product
  direction, pricing, positioning, or compliance stance. Don't re-derive or
  re-question the "locked decisions" in §1 unless the user explicitly
  reopens one.
- **End of a chat that changed status:** update the relevant section —
  move a shipped item into §2, resolve or add an item in §3, reorder §4 if
  priorities shifted. Bump "Last updated" at the top.
- **Detailed content lives elsewhere, referenced not duplicated:**
  `COMPOUNDS.md` / `compounds.json` for compound data,
  `ART-DIRECTION.md` for image-generation prompts. Don't copy their content
  in here — link to them.
- **This file is committed to the repo** (`therapylog/Therapylog.github.io`,
  `docs/LEDGER.md`) so any chat with repo access can read and edit it
  directly — no separate doc store to keep in sync.
