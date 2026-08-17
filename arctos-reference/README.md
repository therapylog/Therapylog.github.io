# Arctos Labs — Reference Folder

This folder lives inside the TherapyLog repository as a **read-only reference store**
for the Arctos Labs brand and product project. It is completely isolated from TherapyLog
code, data, and business operations — it shares this repo only for convenience of access
across chat sessions and code environments.

**Do not import, require, or cross-reference any file in this folder from TherapyLog code.**

---

## Purpose

Every chat session (research, code, design) reads from this folder to stay on the same
page. The `arctos-master-context.md` file at the root is the single source of truth —
paste it at the start of any new code or design session to initialize the full brand context.

---

## Folder Structure

```
arctos-reference/
│
├── README.md                        ← You are here
├── arctos-master-context.md         ← PASTE THIS to initialize any new chat/code session
│
├── brand-assets/                    ← Production logo files
│   ├── arctos-shield.png            (white version — for dark backgrounds)
│   ├── arctos-shield-gold.png       (gradient gold — for light/white backgrounds)
│   ├── arctos-shield-gold-deep.png  (deep matte gold — print preferred)
│   ├── arctos-wordmark.png          (white wordmark)
│   ├── arctos-wordmark-gold.png     (gradient gold wordmark)
│   ├── arctos-wordmark-gold-deep.png (deep matte gold wordmark — print preferred)
│   ├── arctos-lockup.png            (shield + wordmark combined, white)
│   └── qr-coa.png                   (COA QR artwork for packaging mockups)
│
├── design-system/                   ← Nocturne DS adapted for Arctos
│   ├── ARCTOS_LEDGER.md             ← Design decisions, packaging spec, component notes
│   ├── styles.css                   (Nocturne token sheet + component classes)
│   ├── _ds_bundle.js                (Nocturne JS bundle)
│   ├── _ds_manifest.json            (component manifest)
│   ├── _adherence_oxlintrc.json     (linting rules for DS token compliance)
│   ├── nocturne-readme.md           (Nocturne usage guide)
│   ├── image-slot.js                (image mount helper)
│   └── support.js                   (DS support script)
│
├── website/
│   └── Arctos_Labs_dc.html          ← Full site prototype (1075 lines, self-contained)
│                                      Link Nocturne bundle to run. Includes:
│                                      Home, PDP, Science Hub, Verify/COA,
│                                      Cart, Checkout, Packaging reference.
│
├── product-specs/
│   ├── arctos-pouch-line-strategy.md      (full pouch line: formulas, manufacturer
│   │                                       guidance, ambassador framework)
│   ├── arctos-den-ritual-formulations.md  (DEN PM system + RITUAL coffee/matcha,
│   │                                       evidence-graded A/B/C)
│   └── arctos-h2-tablet-spec.md           (H2 two-tablet system, evidence review,
│                                           manufacturer questions)
│
├── manufacturing/
│   └── arctos-manufacturer-specification-rfq.md  (send to co-man candidates:
│                                                   quality standards, all SKU specs,
│                                                   commercial questions)
│
├── marketing/
│   └── arctos-label-copy-mockups.md  (PRIME creatine, CHARGE, DEN label copy
│                                      with voice rules)
│
└── legal/
    └── arctos-claim-substantiation-binder.md  (DSHEA claim language per ingredient,
                                                 A/B/C grades, exclusion log with
                                                 documented reasons, ambassador
                                                 claim controls)
```

---

## Quick Reference — Brand Tokens

```css
--arctos-green:      #22372C   /* PMS 5535 C, CMYK 78/47/71/60 — primary base */
--arctos-green-dark: #1A2B22   /* dark UI ground */
--arctos-gold:       #C9A227   /* PMS 871 hot foil proxy */
--arctos-gold-light: #E8C547   /* hover/accent */
--arctos-black:      #17170F   /* 100K matte black */
--arctos-cream:      #F5F1E8   /* off-white text + background */
```

Fonts: **Montserrat** (700/900, uppercase, tracking +2%) for display/wordmark ·
**Barlow** (400/600) for body · **Barlow Condensed** (400/600) for UI labels

---

## Key Decisions (never reverse without documenting why)

| Decision | Rationale |
|---|---|
| Vinpocetine excluded | FDA: not a lawful dietary ingredient; safety warning; DoD prohibited |
| B6 capped at 25 mg | TGA findings: neuropathy at <50 mg; irreversible cases documented |
| Ashwagandha out of PM SKUs | Fatal liver injury cases; wrong risk for nightly-use product |
| Red yeast rice excluded | Monacolin K = lovastatin; FDA unapproved drug |
| Vitamin C out of H2 companion | Blunts training adaptations; contradicts selective-antioxidant premise |
| No "cycle support" positioning | Enables harm; ad platform restrictions; wrong market anyway |
| No DMSO in any product | Not a dietary ingredient; topical pain claim = unapproved drug |
| Peptide entity fully isolated | Intended-use evidence; no Arctos name, bear, or cross-links |
| No TherapyLog health-data targeting for supplements | FTC Health Breach Notification; trust |

---

## Active GitHub Repository
TherapyLog repo → `arctos-reference/` folder (this folder)
Arctos website deploys separately: `arctos-labs` Vercel project → arctoslabs.com

---

## Outstanding (bring back to research chat before building)
- Protein powder line (Tier 3): grass-fed whey isolate + beef protein isolate/colostrum
- Copper peptide scalp serum: separate cosmetic track, not Arctos Nutrition
- Blood panel partnership: Quest/Labcorp reseller bundled with FOUNDATION + CIRCUIT
- Attorney consult: DSHEA/FDA specialist before first sale
- Peptide entity formation: separate session, do not build until attorney consult

*Last updated: August 2026 — v1.0*
