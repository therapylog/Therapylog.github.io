# Restructure plan — schema tagging, interaction engine, and the store fork

**Opened:** 4 September 2026
**Supersedes nothing.** Companion to `RESEARCH-ENCYCLOPEDIA-PRO-AND-STORE-FORK.md`,
which is the research; this is the build sequence.
**Ledger note:** `LEDGER.md` §1 locks web-first and names "a separate,
store-compliant version" as a possible future fork. This plan builds that fork.
It does **not** soften therapylog.app.

---

## 0. The finding that reorders everything

The June 2026 App Store rejection (submission `898a4a18`, reviewed 22 June on an
iPad Air 5 / iPadOS 26.5) cited **three** guidelines. **None of them was 1.4.3 —
the drugs guideline.**

| Guideline | What Apple said | What it actually is |
|---|---|---|
| **2.1(a) Performance** | Crash: launch → log in → Log tab → **Camera button** | A missing Info.plist key. Engineering, ~3 lines. |
| **2.1(b) Information Needed** | "cannot locate the In-App Purchases" | Downstream of the crash — the reviewer never reached a gated feature. |
| **1.4.1 Safety — Physical Harm** | "provides medical related data, health related measurements, diagnoses or treatment advice without the appropriate regulatory clearance" | The real content finding. **It is about acting like a medical device, not about steroids.** |

And Google Play's rejection, per `therapylog-app/THERAPYLOG-OPEN-QUESTIONS-UPDATED.md`
§4, was **"org account policy for health apps"** — the verified Organization
Account requirement, not a content judgement.

**So neither store has ever told you the compound database is the problem.**
Two of Apple's three findings are pure engineering. The third is a framing
problem with a known remedy that does not require deleting compounds.

Caveat, stated honestly: the reviewer crashed on the Log tab and may never have
opened the encyclopedia. 1.4.3 has **not been ruled out** — it has only not been
raised. Plan as if a deeper review could raise it; do not plan as if it already has.

### 0.1 The crash, diagnosed

`app.html` invokes the camera through a plain web control:

```html
<input type="file" id="lab-camera-input" accept="image/*" capture="environment" ...>
```

There is no `@capacitor/camera` dependency — `capture="environment"` hands off to
iOS directly. iOS terminates a process with `SIGABRT` the moment it touches the
camera with no `NSCameraUsageDescription` in `Info.plist`.

`grep -rn "NSCamera" therapylog-app/` returns **nothing**. `ios/` is not
committed — `codemagic.yaml` runs `npx cap add ios` on every build, producing a
stock `Info.plist`. The build script then adds exactly two keys,
`UIUserInterfaceStyle` and `ITSAppUsesNonExemptEncryption`, and **no usage
descriptions at all**.

This is a deterministic crash on every iOS device. The reviewer's iPad was
incidental. **Fix: two `PlistBuddy` lines.**

### 0.2 The IAP finding, diagnosed

The wiring is correct — the shell calls `TLIAP.showPurchaseSheet()` on
`Capacitor.getPlatform() === 'ios'`, with products `com.therapylog.app.pro.monthly`
and `com.therapylog.app.pro.annual`, and `restorePurchases` exists.

The problem is **discoverability**: the paywall only renders from
`TL_UPGRADE.prompt(tier, feat)`, which fires when a user taps a gated feature.
The reviewer's path crashed before reaching one. Fix the crash and this likely
resolves itself — but do not rely on that. Add a permanent, always-visible
**Upgrade** and **Restore Purchases** pair in Settings, and write App Review
notes naming the exact taps.

### 0.3 The 1.4.1 finding, diagnosed

Apple's remedy — "attach your regulatory approval documentation" — is not
available to you and never will be. So the store build must stop being the kind
of app that needs it.

What trips 1.4.1 is **interpretation and recommendation**, not data. Charting a
lab value over time is fine. These are the triggers, in descending order:

1. **Lab classification.** `classify()`, `LAB_REF`, `getAdjustedLabRanges()` take a
   measurement and return LOW / NORMAL / HIGH against sex- and age-adjusted
   bands. That is interpreting a health measurement.
2. **The SIDEFX playbooks.** "High prolactin → cabergoline, typically 0.25 mg
   twice weekly, titrated on labs" is treatment advice in plain terms.
3. **Dose tables.** "TRT / Starting — 100-150 mg/week" reads as a prescription.
4. **Protocol templates.** 17 complete multi-compound plans with dose, frequency
   and bloodwork schedule.
5. **The interaction checker's `monitor:` field.** Clinical decision support.
6. **The AI lab scanner**, which photographs a lab report and interprets it.

`terms.html` §02 already asserts the app "is not a medical device, electronic
health record, clinical decision support system, or telehealth platform." The
web app's behaviour does not match that sentence. In the store build it must.

**This is the single most important structural insight in this document: the
store fork is primarily a fork of the *interpretation layer*, not of the
compound list.** A compound entry that says what a compound is, what the
literature reports, and what the risks are, is reference. The same entry with a
"your starting dose" row is advice. That distinction — not the compound's
schedule — is what decides most of what changes.

---

## 1. Structural outline — what gets built

### 1.1 One source, two builds

`app.html` stays the single source of truth. `scripts/lib/app-source.js`
already lifts `DB`, `TL_PK`, `TL_FORM`, `TL_STORAGE`, `SIDEFX` and the
interaction arrays out of it, and `build-pages.js` already generates the public
site from that lift. The store build becomes **a third consumer of the same
lift**, not a second copy of the app.

```
                    app.html  ← single source of truth
                        │
              scripts/lib/app-source.js   (existing lift + new tag layer)
                        │
        ┌───────────────┼────────────────┬─────────────────────┐
        │               │                │                     │
   therapylog.app   /compounds/,    therapylog-app/      store-build/
   /app (full)      /tools/,        www/index.html       www/index.html
                    /markers/       (full, NEW: generated) (filtered, NEW)
                    (Tier A/B only)
```

Two things there are new. `therapylog-app/www/index.html` becomes **generated
rather than hand-copied** — it is currently a stale snapshot, 130 compounds
against the site's 131 and ~13 KB behind, with no sync step anywhere in
`codemagic.yaml`. And the store build is a **filtered render**, produced by the
same generator under a policy flag.

### 1.2 The tag layer

A new `TL_TAGS` block in `app.html`, sitting alongside `TL_PK` and `TL_FORM` and
following the same shape — a flat id-keyed map, one contiguous reviewable block,
lifted by the existing `literal()` matcher.

```js
/* TAG-VOCAB:START — closed vocabulary; see docs/COMPOUND-TAGS.md */
const TL_TAG_DEFS = {
  '17aa-oral':  { label: '17α-alkylated oral', why: 'Additive hepatotoxicity when stacked' },
  '19-nor':     { label: '19-nortestosterone derivative', why: 'Prolactin, neuropsychiatric, deeper suppression' },
  /* ... ~36 tags, each with the rule that consumes it ... */
};
/* TAG-VOCAB:END */

const TL_TAGS = {
  "tc": { tags: ["aas","aromatizing","hematocrit-raising","hpta-suppressive",
                 "lipid-suppressing","virilizing"],
          store: "reframe", dea: 3, aa: [100,100] },
  /* ... 131 entries ... */
};
```

Four axes, deliberately kept orthogonal:

| Axis | Values | Consumed by |
|---|---|---|
| `tags` | closed vocabulary, ~36 entries | interaction engine, side-effect surfacing, PCT builder |
| `store` | `ok` \| `reframe` \| `exclude` | the store-build filter |
| `dea` | `2`–`5` or `null` | store framing, PCT builder, legal copy |
| `aa` | `[anabolic, androgenic]` or `null` | encyclopedia display; parity with competitors |

**`store` is deliberately NOT `TIER_A/B/C`.** The existing tiers answer *"can a
US reader lawfully obtain this?"* and gate public SEO pages. `store` answers
*"does this survive App Review?"*. They correlate but disagree in both
directions — `hcg2` is Tier A yet Google Play explicitly prohibits hCG promoted
alongside anabolic steroids or weight loss, and several Tier B research peptides
are perfectly fine as neutral reference. Collapsing them would be a bug.

The three-state `store` value matters more than a boolean: **`reframe` is where
most of the work is.** It marks entries that belong in a store build but whose
text must be rewritten from advice to reference first.

### 1.3 The guard

`assertTags()` in `scripts/lib/app-source.js`, modelled directly on the existing
`assertTiers()` — which already fails the build when a compound is added without
a tier. It must fail when:

- a compound in `DB` has no `TL_TAGS` entry
- `TL_TAGS` names an id `DB` does not have
- any tag is outside `TL_TAG_DEFS`
- a tag is defined but applied to zero compounds (dead vocabulary)
- `store` is not one of the three values
- a structural invariant breaks — anything tagged `17aa-oral` must also be
  `hepatotoxic`; anything `19-nor` must also be `hpta-suppressive`; anything
  `aas` must carry `hpta-suppressive`

That last group is the point. Hand-maintained safety data drifts; asserted
invariants are what stop it.

Wired into `.github/workflows/validate-encyclopedia.yml`, which already runs
`validate-encyclopedia.js` on every push.

---

## 2. Build sequence

Seven phases. Each ends in something committed, validated, and independently
useful — no phase depends on a later one to be worth having.

### Phase 0 — Unblock the resubmission  ·  *engineering only, no content*

| # | Work | Repo |
|---|---|---|
| 0.1 | Add `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription` (and `NSPhotoLibraryAddUsageDescription`) via `PlistBuddy` in the iOS build step. Android: confirm `CAMERA` / media permissions in the generated manifest. | `therapylog-app` |
| 0.2 | Generate `www/index.html` from `Therapylog.github.io/app.html` at build time; add a `--check` guard that fails CI when the committed copy is stale, mirroring `build-pages.js --check`. | both |
| 0.3 | Permanent **Upgrade** and **Restore Purchases** rows in Settings, visible on iOS regardless of entitlement state. | `Therapylog.github.io` |
| 0.4 | Written App Review notes: demo account, exact taps to reach the paywall, IAP product ids, and a statement that the app neither diagnoses nor recommends treatment. | — |
| 0.5 | iPad-viewport smoke test in CI covering launch → Log → camera → paywall. The existing `ui-check-*.js` scripts are the pattern. | `Therapylog.github.io` |
| 0.6 | Google Play: complete the verified Organization Account and the Health apps declaration. This was the *only* thing Play ever rejected. | — |

**Exit:** an iOS build that does not crash and whose IAPs a reviewer can find in
under thirty seconds. 0.6 clears Play's only known blocker.

### Phase 1 — Schema tagging  ·  *in progress*

| # | Work |
|---|---|
| 1.1 | Closed tag vocabulary — ~36 tags, each justified by the rule that consumes it. **Done.** |
| 1.2 | Assign tags, `store`, `dea` and `aa` across all 131 compounds, with an adversarial audit pass biased toward catching **omissions** (a missing tag means a missing warning; a spurious one only means an extra caution). |
| 1.3 | `TL_TAGS` + `TL_TAG_DEFS` blocks written into `app.html`. |
| 1.4 | `assertTags()` + CI wiring. |
| 1.5 | `docs/COMPOUND-TAGS.md` generated from the data, same pattern as `COMPOUNDS.md`. |

**Exit:** every compound carries machine-readable pharmacology, and the build
fails if a new one arrives untagged.

### Phase 2 — Interaction engine v2  ·  *the biggest safety win available*

Today: 53 rules, only 23 of them `warn`/`danger`, and **trenbolone participates
in none of them.** Rules are hand-written pairs, so adding Trenbolone Enanthate
inherited nothing from Nandrolone.

| # | Work |
|---|---|
| 2.1 | Extend the rule shape to accept tag predicates as well as name pairs — `{ when: ['17aa-oral','17aa-oral'], severity: 'danger', ... }` — and keep every existing pair rule working unchanged. |
| 2.2 | Write the ~15 class rules from the research brief §2: stacked 17-AA hepatotoxicity, AI + oral lipid suppression, two 19-nors and prolactin, AAS + warfarin, stacked hematocrit-raising agents, GLP-1 absorption effects, T4 absorption, assay interference, AAS + stimulant cardiac load. |
| 2.3 | Rebalance severity. 30 of 53 rules currently being `info` reads as an app that mostly tells you your stack is fine — the opposite of the ledger's harm-reduction lock. |
| 2.4 | Coverage report in CI: every compound must participate in at least one rule, or be explicitly listed as legitimately interaction-free. |

**Exit:** interaction coverage scales with the database instead of falling
behind it quadratically.

### Phase 3 — Wave 1 content

| # | Work |
|---|---|
| 3.1 | **The eight blends** — Wolverine, GLOW, KLOW, CJC-1295+Ipamorelin, Tesamorelin+Ipamorelin, CagriSema, Sermorelin+Ipamorelin, Lipo-C. Each deep-links to the calculator that already exists on the site. |
| 3.2 | The 20 conspicuous omissions — clenbuterol, letrozole, tadalafil, TUDCA, testosterone undecanoate, topical testosterone, orforglipron, toremifene, minoxidil, RU58841 and the rest. |
| 3.3 | Every new entry ships with `TL_PK` and `TL_TAGS` on arrival. No backlog. |
| 3.4 | Backfill PK for the 34 existing compounds that lack it — or, where modelling genuinely doesn't apply, say so explicitly in place of an empty panel. |

**Exit:** ~159 compounds, no conspicuous holes, full tag and PK coverage.

### Phase 4 — Pro features

Ordered by competitive gap, not by effort.

| # | Work | Why first |
|---|---|---|
| 4.1 | **Injection site map + rotation tracking** | Dosafy ships one; we track zero sites despite naming them 13 times in prose. Used every dose. Best screenshot in the app. |
| 4.2 | **Stacked PK across a cycle** | We have per-compound curves and no summed view. Pure extension of existing work. |
| 4.3 | **PCT protocol builder** | Highest-intent moment in the category. Built as a *document generator* — see §3 below. |
| 4.4 | **Hematocrit / blood-donation manager** | Named in the harm-reduction literature as primary tertiary prevention. Nobody has built it. |
| 4.5 | **Deterministic lab-trend intelligence** | Rate-of-change, time-to-out-of-range, dose correlation — the analytical value users want from the AI, with no per-question cost. |
| 4.6 | Provider-ready CSV + clinical-summary PDF | "A document you can hand your doctor" is close to the mission statement. |

Plus one structural change with no engineering cost: **move the paywall trigger**
to fire on the user's second lab panel or fourth week of logging — the
demonstrated-value moment — rather than on the AI tab.

### Phase 5 — The store fork

Only after Phases 0–4. The `store` flag from Phase 1 is what makes this a
filtered render instead of a rewrite.

| # | Work |
|---|---|
| 5.1 | Extend `build-pages.js` into a store-build target: filter `DB` by `store !== 'exclude'`, strip performance dose rows, strip protocol templates, strip the SIDEFX response lists. |
| 5.2 | **The 1.4.1 reframe.** Lab values chart and export but do not classify. Interaction rules state the mechanism without a `monitor:` instruction. Dose rows become "what the published literature reports", cited, never "your dose". |
| 5.3 | Rewrite every `store: "reframe"` entry's text to reference framing. This is the bulk of the phase. |
| 5.4 | Store listing copy, screenshots and metadata written independently — reviewers read listings more carefully than app content. |
| 5.5 | Health apps declaration, privacy labels, Data Safety form. |
| 5.6 | Submit. iOS first: it has the harder content bar and the known findings to answer. |

### Phase 6 — Directory and telehealth

The infrastructure exists — `directory/providers-data.js`, `providers/apply.html`,
a 25–30% recurring affiliate program in `affiliates.json` — and holds **zero
listings**. Gate on LegitScript or NABP accreditation, disclose the commercial
relationship on every card, and do not sign long deals before the DEA
telemedicine rule lands (current flexibilities expire 31 December 2026; the
Special Registration final rule entered OMB review 25 August, forecast November).

---

## 3. The PCT builder, specified

Recorded here because it is the one Phase-4 item whose framing decides whether
it can ship at all.

**It generates a document for a clinician, not a protocol for a user.**

- Compute **clearance timing** from `TL_PK` — time from last injection to
  negligible. This is the number people get wrong most often, and it is
  arithmetic the app can already do.
- Enforce **sequencing**: hCG before SERMs, never alongside. The app's own
  `INTERACTIONS` array already flags this twice and no tool enforces it.
- Surface **suppression depth** as inputs — cycle length, dose, 19-nor
  involvement — using the Phase-1 tags.
- Produce a **bloodwork schedule** with the exact panel. Lowest risk, highest help.
- Output a **printable summary** with blank fields for the clinician.

Hard rules: never generate a dose the user did not enter; show published ranges
with citations and make the user select. Lead with honest recovery data —
recovery is variable and duration and dose predict it. Every path terminates in
a clinician. State the assumption plainly: these are prescription-only compounds
and the tool assumes a prescriber is involved.

Reporting what the literature describes is publishing. Computing *your* dose is
not. Keep it on the publishing side and it is no more exposed than the
encyclopedia already is — arguably less, because it routes people toward a
clinician rather than away from one.

---

## 4. Store identity — the open decision

Not decided. Recorded so it can be decided on the facts.

The June rejection changes the weighting: Apple raised **1.4.1**, not 1.4.3, and
Google raised an **org account** issue. Before that was known, a separate brand
looked close to mandatory. It now looks like risk management rather than
necessity.

### Option A — New brand, new bundle id

**For.** A clean App Store Connect record with no rejection lineage. Reviewers
check a developer's website, and `marketing.html` currently names `r/PEDs` and
`r/firstcycle` as target audiences — a new brand does not import that. Lets the
store app be positioned for the larger audience (GLP-1, thyroid, women's
hormones) without the PED association. Protects TherapyLog's standing with its
existing community, because the web app never has to soften. Makes the
directory/telehealth business defensible, per `BRAND-AND-ENTITY-STRUCTURE.md`.

**Against.** Zero brand equity — ASO and reviews start at nothing. Two support
surfaces, two sets of store assets, two identities to keep straight. Existing
affiliates promote one brand and get nothing from the other. Cross-promotion
requires explaining a relationship you may not want to explain.

### Option B — Same brand, new bundle id

**For.** Keeps brand equity and cross-promotion; affiliates promote one thing.
One support surface. The 131-compound reference is a real differentiator you can
talk about in the listing.

**Against.** **The website becomes the exposure.** A reviewer who visits
therapylog.app finds the full-content app, the r/PEDs marketing copy, and
compound pages carrying cycle protocols. That imports 1.4.3 risk the binary
itself would not have. Mitigating it means softening the public site, which
spends exactly the credibility `LEDGER.md` §1 was written to protect. And if the
store app is pulled later, the brand takes the hit.

### Option C — Same brand, same bundle id (`com.therapylog.app`)

**For.** Fastest. Keeps TestFlight testers, metadata and any accrued history.

**Against.** The 1.4.1 finding is on that record and a resubmission is judged
against it. You would be asking the same reviewer pool to revisit a decision
rather than make a fresh one.

### The deciding question

Not "which brand is better" but **"am I willing to soften therapylog.app?"**
If no — and the ledger says no — then A. If the public site is genuinely
negotiable, B is materially cheaper and now has better odds than it did before
the rejection letter was read.

A middle path worth naming: ship under a new name, keep it owned by TherapyLog
LLC, cross-link one way only (web → store app, never the reverse), and revisit
convergence once it has cleared review and has traction. That preserves the
option without paying for it twice up front.

---

## 5. What is not in this plan

- Softening therapylog.app. `LEDGER.md` §1 stands.
- Running telehealth under TherapyLog. Decided 1 September 2026;
  `BRAND-AND-ENTITY-STRUCTURE.md` is unchanged by anything here.
- Waves 2–4 of the compound expansion. They are volume, not credibility, and
  they wait until the schema and the interaction engine can carry them.
