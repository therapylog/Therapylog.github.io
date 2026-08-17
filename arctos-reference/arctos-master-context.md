# ARCTOS LABS — MASTER CONTEXT DOCUMENT
## Code & Build Handoff · August 2026

This document is the complete context for the Arctos Labs brand, product line, website,
and GitHub/Vercel build. Paste this entire document at the start of a code session to
initialize. The code agent should have GitHub and Vercel MCP access.

---

# PART 1 — IMMEDIATE BUILD INSTRUCTIONS

## What to build in this session

### Priority 1 — GitHub Repository Setup
Create a new repository: `arctos-labs` under the same GitHub account/org as TherapyLog.

Structure:
```
arctos-labs/
├── README.md
├── .gitignore
├── brand/
│   ├── brand-guidelines.md
│   ├── color-tokens.md
│   └── typography.md
├── products/
│   ├── pouches/
│   │   ├── CHARGE-spec.md
│   │   ├── STEADY-spec.md
│   │   ├── TUNDRA-spec.md
│   │   └── DEN-spec.md
│   ├── powders/
│   │   ├── DEN-nightcap-spec.md
│   │   ├── prime-creatine-spec.md
│   │   ├── tundra-electrolyte-spec.md
│   │   ├── ritual-mushroom-coffee-spec.md
│   │   ├── ritual-matcha-spec.md
│   │   ├── surge-pump-spec.md
│   │   └── restore-recovery-spec.md
│   ├── capsules/
│   │   ├── DEN-night-caps-spec.md
│   │   ├── foundation-spec.md
│   │   ├── circuit-spec.md
│   │   ├── balance-spec.md
│   │   └── glycine-tub-spec.md
│   └── tablets/
│       └── H2-tablet-spec.md
├── manufacturing/
│   ├── manufacturer-rfq.md
│   ├── claim-substantiation-binder.md
│   └── qa-testing-requirements.md
├── packaging/
│   ├── master-carton-spec.md
│   ├── label-copy/
│   │   ├── CHARGE-label.md
│   │   ├── STEADY-label.md
│   │   ├── TUNDRA-label.md
│   │   ├── DEN-label.md
│   │   └── prime-creatine-label.md
│   └── prepress-spec.md
├── marketing/
│   ├── ambassador-program.md
│   ├── gym-pitch-guide.md
│   └── approved-claims.md
├── legal/
│   ├── business-structure.md
│   └── excluded-ingredients-log.md
└── website/
    └── sitemap.md
```

Populate every file with content from Part 2 of this document.
Commit with message: "Initial Arctos Labs brand and product specification"

### Priority 2 — Website
Build and deploy to Vercel: `arctos-labs` project.
Full website spec in Part 3 of this document.
Tech stack: Next.js 14 App Router, Tailwind CSS, shadcn/ui.
Deploy as production on arctoslabs.com (or preview URL until domain is connected).

### Priority 3 — Handoff Documents
Generate print-ready PDFs or Word documents from the spec files:
- Manufacturer RFQ (formal letterhead)
- Brand guidelines (full color, typography, logo usage)
- Claim substantiation binder (legal-formatted)

---

# PART 2 — BRAND & PRODUCT COMPLETE SPECIFICATION

## 2A — Brand Identity

**Company name:** Arctos Labs
**Entity:** Arctos Nutrition LLC (separate from TherapyLog software entity and any future research-peptide entity)
**Core promise:** Every lot third-party tested. COA behind a QR code on every unit. "Verify yours."

### Color System (locked for print and digital)
```
Forest Green    PMS 5535 C   HEX #22372C   CMYK 78/47/71/60   Primary base
Metallic Gold   PMS 871      HEX #C9A227   Hot foil only      Shield, wordmark, rules
Matte Black     100K         HEX #17170F   CMYK 0/0/0/100     Label stock base
Off-White       —            HEX #F5F1E8   —                  Background, digital
```

**Print rule:** supply CMYK, never RGB. Base must print at exactly CMYK 78/47/71/60 — deep
and fully saturated, no pastel, no tint. Printer instruction: ignore washed-out digital proof.

**Digital equivalents:**
```css
--arctos-green: #22372C;
--arctos-gold: #C9A227;
--arctos-black: #17170F;
--arctos-cream: #F5F1E8;
--arctos-gold-light: #E8C547;   /* hover/accent */
--arctos-green-dark: #1A2B22;  /* footer/dark sections */
```

### Typography
```
Display/Wordmark:  Montserrat Black (weight 900), uppercase, tracking +2%
Headings:          Montserrat Bold (weight 700), uppercase
Body:              Barlow Regular (weight 400)
Technical/Label:   Barlow Condensed Regular, min 5.5pt on labels
```

Google Fonts import: Montserrat (weights 700, 900) + Barlow (400, 600) +
Barlow Condensed (400).

### Logo System
- Primary: Gold bear-and-mountain shield + "ARCTOS LABS" wordmark below
- Horizontal: Shield left, wordmark right
- Icon only: Shield mark alone
- Print: hot foil gold on forest green base
- Digital: #C9A227 on #22372C, or white on #22372C

### Packaging System
- Board: 18pt SBS solid bleached sulfate
- Outer coat: velvet soft-touch matte lamination
- Tactile: raised spot UV over-pattern, off knockouts
- Closure: gold foil tamper-evident seal over top tuck
- Insert: thermoformed PET blister (black or clear)
- Label stock: waterproof matte BOPP, permanent adhesive
- Knockout zones: uncoated, varnish-free, laminate-free areas where
  variable labels (product name, QR/COA) are applied post-print
- Master carton inner dims: 49 × 24 × 64 mm, straight tuck end
- QR label: 30 × 20 mm thermal direct, Niimbot B2 Pro
- Vial label: 60 × 25.4 mm matte BOPP forest green base

---

## 2B — Product Naming Architecture

| SKU name | Product |
|---|---|
| CHARGE | Focus / stim pouch |
| STEADY | Stim-free all-day pouch |
| TUNDRA | Mineral / electrolyte pouch |
| DEN | PM recovery pouch |
| PRIME | Creatine monohydrate |
| RITUAL | Mushroom coffee + ceremonial matcha |
| SURGE | Stim-free pump powder |
| RESTORE | Universal recovery powder |
| FOUNDATION | Liver & renal support capsules |
| CIRCUIT | Cardiovascular & lipid support |
| BALANCE | Estrogen metabolism support |
| H2 | Molecular hydrogen two-tablet system |
| DEN NIGHTCAP | PM drink powder |
| DEN NIGHT CAPS | PM capsules |
| PURE GLYCINE | Standalone glycine powder |

---

## 2C — Product Specifications

### POUCHES — all specs
Format: 600 mg fill weight, 20-count can, child-resistant lid
Base: plant fiber (bamboo or MCC), monk fruit extract, natural essential oils,
moisture stabilizer, salt. Zero carbs. Zero calories. Zero artificial anything.
Design constraint: pouches only contain ingredients effective at ≤100 mg doses.
Gram-scale clinical doses belong in powders.

**CHARGE — Focus Pouch**
Actives per pouch:
- Natural caffeine: 75 mg
- L-theanine: 75 mg
- Methylliberine (Dynamine®): 40 mg
- Alpha-GPC: 100 mg
- Methylcobalamin (B12): 250 mcg
Flavors at launch: Cool Mint
Secondary flavors: Ginger (no curcuminoids — staining risk), Espresso (stain-test required)
Stacking: 1 pouch = focus; 2 pouches = pre-workout (150 mg caffeine)
Warning: max 4 pouches/day; not for under 18, pregnant/nursing, caffeine-sensitive

**STEADY — Stim-Free Pouch**
Actives per pouch:
- L-theanine: 50 mg
- Saffron extract (affron®): 14 mg
- Methylcobalamin (B12): 500 mcg
Flavors: Peppermint, Espresso
Use: habitual all-day, evening-safe, oral-habit satisfaction

**TUNDRA — Mineral Pouch**
Actives per pouch:
- Unrefined sea salt → sodium: 80 mg elemental
- Potassium citrate: 50 mg (≈19 mg elemental potassium)
- Magnesium bisglycinate: 25 mg (≈3.5 mg elemental magnesium)
Flavors: Pure Purist (unflavored — flagship SKU), Spearmint-Lime
Positioning: trace electrolytes + saliva flow + oral habit. Not a hydration replacement.
Companion upsell: TUNDRA Electrolyte Sticks (full dose)

**DEN — PM Recovery Pouch**
Actives per pouch:
- L-theanine: 100 mg
- Glycine: 100 mg
- Melatonin: 0.5 mg
- Apigenin: 25 mg
- Magnesium bisglycinate: 25 mg
Flavors: Honey Mint (matches DEN Nightcap — stack flavor coherence),
         Chamomile-Lavender
Positioning: fast onset companion to DEN Nightcap. "Pouch starts the descent, cup finishes it."
Warning: do not drive after use; not for under 18; consult physician if taking
         sedatives or psychiatric medication

---

### POWDERS

**PRIME CREATINE**
- Creatine monohydrate (Creapure® German-sourced, micronized 200 mesh): 5 g
- Servings: 80
- Fill: 400 g
- Other ingredients: NONE
- Packaging: matte forest-green resealable stand-up pouch or 400 g tub
- Per-lot testing: identity, potency, DCD (dicyandiamide), creatinine, heavy metals
- SKU note: zero anti-caking agents, zero sweeteners, zero flow agents

**TUNDRA ELECTROLYTE STICKS**
Per stick:
- Sodium: 1,000 mg elemental
- Potassium: 200 mg elemental
- Magnesium: 60 mg elemental (as bisglycinate)
- Chloride: declared
- Sweetener: monk fruit only
- Zero sugar, zero maltodextrin, zero dextrose
Flavors: Arctic Citrus, Salted Watermelon, Unflavored Purist
Format: 30-count carton stick packs; 10-count trial carton

**DEN NIGHTCAP — PM Drink Powder**
Per ~12 g serving:
- Glycine: 3,000 mg [FLAGSHIP ACTIVE — only sleep ingredient needing grams]
- Magnesium bisglycinate: 200 mg elemental [declare elemental, not compound weight]
- L-theanine: 200 mg
- Montmorency tart cherry extract: 500 mg
- Lemon balm extract (standardized, declare rosmarinic acid %): 300 mg
- Saffron (affron®): 28 mg
- Apigenin: 50 mg
- Melatonin: 0.5 mg
- Zinc bisglycinate: 7 mg elemental
SKUs: with melatonin / melatonin-free (export version)
Flavors: Night Cacao (alkalized cocoa — verify theobromine level with co-man),
         Honey Mint, Roasted Chicory
Note: chicory is caffeine-free coffee-adjacent — better story than decaf

**RITUAL MUSHROOM COFFEE**
Per ~6 g serving:
- Freeze-dried arabica instant (NOT spray-dried): ~2 g (~90–100 mg caffeine)
- L-theanine: 200 mg
- Citicoline (Cognizin®): 250 mg [preferred over Alpha-GPC in powders — not hygroscopic]
- Lion's mane fruiting body (≥30% beta-glucan, enzymatic assay): 1,000 mg
- Cordyceps militaris fruiting body: 1,000 mg
- Chaga: 500 mg [label: caution for kidney stone history — high oxalates]
- C8 MCT powder: 1,500 mg
Mushroom spec: fruiting body only, no mycelium-on-grain, min 25% beta-glucan,
DNA species verification, starch content <5%

**RITUAL CEREMONIAL MATCHA**
Per serving:
- Ceremonial-grade single-origin matcha (Uji or Kagoshima, first harvest): 2–4 g
- Added L-theanine: 100 mg
- Citicoline (Cognizin®): 250 mg
SKU 2: Pure Ceremonial (matcha only, no additions)
Requires: heavy metals and radiological COA per lot (whole-leaf product)
Supply note: Japanese ceremonial grade supply has been tight — get multiple
             suppliers and lock pricing early

**SURGE — Stim-Free Pump Powder**
Per serving:
- L-citrulline: 8,000 mg
- Glycerol powder (65%, HydroMax® or GlycerSize®): 4,000 mg
- Beetroot extract standardized to nitrate: dose to deliver 400–500 mg nitrate
  [declare nitrate mg, not just extract weight — most competitors don't do this]
- Betaine anhydrous: 2,500 mg
- Taurine: 2,000 mg
- Sodium (sea salt): 400 mg
- Alpha-GPC (50% carrier form, AlphaSize 50P): 300 mg
Note: glycerol is highly hygroscopic — manufacturer to advise on desiccant and
      moisture spec for packaging

**RESTORE — Universal Recovery Powder**
Per serving:
- Hydrolyzed collagen peptides (bovine, grass-fed): 15,000 mg
- Glycine: 3,000 mg
- Vitamin C: 200 mg (cofactor for collagen synthesis — modest dose intentional)
- Montmorency tart cherry extract: 500 mg
- Curcumin bioavailable form (phytosome/Meriva® or equivalent): 500 mg
- Magnesium bisglycinate: 200 mg elemental
- Taurine: 2,000 mg
Note: ~60% ingredient overlap with DEN Nightcap. Evaluate consolidation
      before committing to two sets of tooling.

---

### CAPSULES & TABLETS

**DEN NIGHT CAPS — PM Capsules (2-cap serving)**
- Magnesium bisglycinate: 200 mg elemental
- L-theanine: 200 mg
- Lemon balm: 300 mg
- Saffron (affron®): 28 mg
- Apigenin: 50 mg
- Melatonin: 0.5 mg
Label note: "For full glycine dosing, use DEN NIGHTCAP powder. Glycine
             cannot be practically dosed in capsules."

**PURE GLYCINE**
- Glycine: 3,000 mg per scoop
- Other ingredients: NONE
- 300 g tub, unflavored, mildly sweet naturally
Use case: mixes into protein shakes; pairs with DEN NIGHT CAPS

**FOUNDATION — Liver & Renal Support (3 caps twice daily)**
- TUDCA: 1,000 mg/day [require identity verification — adulteration is common]
- N-Acetyl-L-Cysteine: 1,200 mg/day
- Choline bitartrate: 1,000 mg/day
- Milk thistle (80% silymarin): 600 mg/day
- Taurine: 3,000 mg/day
- Astaxanthin: 12 mg/day
- CoQ10 (ubiquinone): 200 mg/day
Positioning: general athlete organ support. NOT "cycle support." No language
             implying protection from any drug.
Label note: honest disclosure that renal protection from supplements is limited;
            the real interventions are blood pressure control and hydration.

**CIRCUIT — Cardiovascular & Lipid Support**
- Citrus bergamot extract (standardized polyphenols): 1,000 mg
- EPA/DHA (triglyceride-form, IFOS 5-star, TOTOX tested): 2,000–3,000 mg combined
- CoQ10: 200 mg
- Taurine: 3,000 mg
- Aged garlic extract: 600 mg
- Magnesium bisglycinate: 200 mg elemental
EXCLUDED: red yeast rice — monacolin K is chemically identical to lovastatin;
          FDA treats standardized RYR as an unapproved drug. Hard exclude.
Positioning: addresses CVD risk, which is the actual mortality risk in
             hard-training populations.

**BALANCE — Estrogen Metabolism Support**
- DIM (diindolylmethane, bioavailable form): 200 mg
- Calcium-D-glucarate: 1,000 mg
- Grape seed extract (procyanidin-standardized): 300 mg
- Zinc bisglycinate: 20 mg elemental
- Pyridoxal-5-phosphate (P5P): 25 mg MAXIMUM [see warning below]
- Boron: 6 mg
MANDATORY LABEL WARNING (all jurisdictions):
"Contains vitamin B6. Stop use and consult a healthcare practitioner if you
experience tingling, burning, or numbness in hands or feet. Do not use with
other B6-containing supplements without medical advice."
Reason for cap: TGA found neuropathy at under 50 mg/day; nerve damage may be
               irreversible. Our audience stacks multiple products. Not negotiable.
MANDATORY LABEL NOTE:
"Supports normal estrogen metabolism. Not an aromatase inhibitor and not a
substitute for medical evaluation. Consult a physician about breast tissue changes."

**ARCTOS H2 — Two-Tablet Blister System**
Tablet A (gold) — H2 core:
- Metallic magnesium H2-generating tablet
- Target: ≥5 mg H2 in 500 mL sealed vessel
- Unflavored
- Residual elemental magnesium: declare on panel (asset, not liability)

Tablet B (green) — TUNDRA electrolyte companion:
- Sodium: 400 mg (bicarbonate + chloride)
- Potassium: 200 mg elemental (citrate)
- Taurine: 1,000 mg
- Chloride: 250 mg
- Monk fruit, natural flavor
- VITAMIN C DELIBERATELY EXCLUDED — would undercut the selective-antioxidant
  premise of H2. This omission is a marketing talking point.

Packaging: foil/foil blister barrier (moisture-reactive), paired cavities per dose,
           bear mark printed on each cavity. Forest green foil backing.
SKUs: 10-dose travel strip, 30-dose carton
Required per-lot testing: measured H2 output in mg and ppm (third-party, not internal),
                          H2 retention at 5/10/30 min sealed vs. open
Evidence grade: B for endurance/perceived exertion/recovery. C for everything else.
Approved claims: "Supports endurance and exercise capacity" · "Supports recovery"
                 "Supports reduced perceived exertion" · "Selective antioxidant support"

**PRE-WORKOUT (Tier 2, Q2 development)**
- Caffeine: 200 mg
- L-citrulline: 8,000 mg
- Beta-alanine: 3,200 mg
- Betaine anhydrous: 2,500 mg
- Taurine: 2,000 mg
- L-theanine: 100 mg
- Alpha-GPC (50% carrier form): 300 mg
- Sodium: 300 mg
Zero proprietary blend. Every ingredient and dose declared.

---

## 2D — Hard Exclusions Log

| Ingredient | Reason | Status |
|---|---|---|
| Vinpocetine | FDA: not a lawful dietary ingredient; 2019 safety warning; DoD prohibited | HARD EXCLUDE |
| 5-HTP, L-tryptophan | Serotonin syndrome risk; audience overlaps with psychiatric medication users | HARD EXCLUDE |
| St. John's Wort | CYP450 induction; SSRIs, contraceptives, anticoagulants | HARD EXCLUDE |
| Ashwagandha (nightly) | Fatal liver injury cases in literature; wrong risk for nightly-use product | EXCLUDE from PM SKUs |
| Red yeast rice | Monacolin K = lovastatin; FDA unapproved drug | HARD EXCLUDE |
| DMSO | Not a dietary ingredient; any topical pain claim = unapproved drug | HARD EXCLUDE |
| PTD-DBM in consumer product | Zero human data; RUO only; DMSO carrier compounds the problem | HARD EXCLUDE |
| High-dose B6 (>25 mg) | Peripheral neuropathy; irreversible in some cases | CAPPED AT 25 mg |
| Vitamin C in H2 companion | Blunts training adaptations; contradicts selective-antioxidant premise | INTENTIONAL OMISSION |
| Creatine in pouches | 3–5 g effective dose; impossible in 600 mg fill | NOT FEASIBLE |
| GABA | Poor BBB penetration; largely peripheral effect | EFFICACY EXCLUDE |
| Valerian | Mixed evidence; organoleptically incompatible with premium flavor system | QUALITY EXCLUDE |
| BCAAs standalone | Redundant with adequate protein; weak independent evidence | NOT BUILDING |
| Melatonin >1 mg | Not superior for onset; causes next-day residual; 0.5 mg is the premium position | DOSE CAPPED |

---

## 2E — Claims Discipline

APPROVED structure/function language (examples):
- "Supports alertness and energy"
- "Supports focus and attention"
- "Supports sleep onset"
- "Supports sleep quality"
- "Supports relaxation"
- "Supports hydration and electrolyte balance"
- "Supports strength, power, and muscle mass with resistance training"
- "Supports endurance and exercise capacity"
- "Supports recovery after training"
- "Acetylcholine precursor"
- "Supports a healthy scalp environment" [if copper peptide serum built later]

PROHIBITED in all channels including ambassador posts:
- Any disease name: insomnia, ADHD, anxiety, depression, dementia, alopecia
- Treats, cures, prevents, heals, reverses, manages, diagnoses
- "Like Adderall" "natural Ambien" "better than [drug name]"
- "Quit" "cessation" "replacement therapy" (nicotine cessation = drug claim)
- "Clinically proven" (our finished products are not clinically tested)
- "No crash" as an absolute
- Any COVID, cancer, anti-aging, or detox claims for H2

FDA 30-day notification (21 CFR 101.93) required within 30 days of first
commercial use of each structure/function claim.

---

## 2F — Ambassador & Distribution Framework

### Track A — D2C Ambassador/Trainer Codes

| Tier | Requirement | Customer discount | Commission | Extras |
|---|---|---|---|---|
| Bronze | Sign up | 10% | 15% of net sales | Free 4-tin starter kit |
| Silver | $500/mo, 3 months | 10% | 20% | Monthly product box, early access |
| Gold | $1,500/mo | 15% | 20% + $100 bonus | Co-branded content, event sponsorship |

Key mechanics:
- Commission on NET sales (after customer discount)
- 30-day cookie + permanent code attribution
- Monthly payout, $50 minimum threshold
- Commission applies to all reorders from referred customers for 12 months
- This recurring-reorder mechanic is the core retention driver for ambassadors

### Track B — Gym Wholesale
- Wholesale price: 50% off MSRP (standard 2× keystone)
- MOQ: one case (e.g., 15 tins)
- First case: consignment — paid on sell-through, not upfront
  [This is the most effective door-opener with independent gym owners]
- Free branded counter display with first order
- Gym wholesale accounts can also hold a staff ambassador code (tracks compound)

### Gym Pitch Sequence
1. Drop free tins, zero ask. "Try these for two weeks, I'll come back."
2. Return visit, 60-second pitch:
   "Scan the tin. COA comes up. Zero carbs, fast-safe, fits every client on
   keto, carnivore, or fasted training. You earn 15–20% forever on your
   people — including their reorders. Onnit pays 15% once. We pay recurring."
3. Leave-behinds: laminated one-pager (brand + commission table + sign-up QR),
   10 single-serve sample sachets, counter display offer

Target order: independent gyms and CrossFit boxes first →
              jiu-jitsu/MMA gyms (nicotine-pouch culture present, natural conversion) →
              franchise gyms last (corporate vendor approval walls)

### Ambassador Agreement Must Include
- Approved claims appendix (what they may say verbatim)
- FTC disclosure: clear and conspicuous #ad or #ArctosPartner in every post
- No medical/condition claims clause + right of immediate termination
- No testimonials referencing personal conditions (even their own)
- Annual re-acknowledgment, monthly spot-check, documented log

---

## 2G — Business Structure

```
[Arctos Holdings LLC — recommended parent]
         /               \
Arctos Nutrition LLC    [Separate name] Research LLC
(pouches, powders,      (RUO peptides — separate LLC,
protein, H2)            separate brand, NO Arctos
                         name or bear, no cross-links)
                         [Do not build until attorney consult]

TherapyLog Inc/LLC — separate, existing entity
Cross-promotion: brand-level only, no health-data targeting
```

Critical rules:
- Supplements + TherapyLog may cross-promote at brand level ("from the makers of")
- NEVER target supplement offers using health/symptom/diagnosis data from the app
- NEVER place supplement offers adjacent to symptom-tracking screens in the app
- Research peptide entity: completely isolated — no shared URLs, no shared social,
  no shared customer lists, no bear, no Arctos name resemblance
- Product liability insurance for Arctos Nutrition: non-negotiable at launch
- Attorney consult required before first sale (DSHEA/FDA specialist)

---

# PART 3 — WEBSITE SPECIFICATION

## Tech Stack
- Framework: Next.js 14 App Router
- Styling: Tailwind CSS + shadcn/ui
- Fonts: Google Fonts (Montserrat 700/900 + Barlow 400/600 + Barlow Condensed 400)
- E-commerce: Shopify Storefront API (headless) OR Stripe + custom cart
- Deployment: Vercel (production)
- Domain target: arctoslabs.com
- Analytics: Vercel Web Analytics
- CMS: Contentful or Sanity for product/blog content (optional Phase 2)

## Design System Constants
```javascript
// tailwind.config.js additions
colors: {
  'arctos-green': '#22372C',
  'arctos-gold': '#C9A227',
  'arctos-black': '#17170F',
  'arctos-cream': '#F5F1E8',
  'arctos-gold-light': '#E8C547',
  'arctos-green-dark': '#1A2B22',
}
fontFamily: {
  display: ['Montserrat', 'sans-serif'],
  body: ['Barlow', 'sans-serif'],
  condensed: ['Barlow Condensed', 'sans-serif'],
}
```

## Sitemap & Page Architecture

### Public pages (all routes)

```
/ (home)
/products
  /products/pouches
  /products/[slug]         (individual product PDPs)
/collections
  /collections/pouches
  /collections/powders
  /collections/athlete-support
  /collections/bundles
/verify                    (COA lookup by lot number — THE brand page)
/science                   (ingredient evidence hub)
  /science/[ingredient]    (individual ingredient pages)
/ambassadors               (program signup + info)
/wholesale                 (gym/trainer wholesale application)
/about
/faq
/blog (Phase 2)
/cart
/checkout
/account
```

### Page-level specs

**/ (Homepage)**
Sections in order:
1. Hero: full-bleed forest green, animated gold bear shield, headline "PREMIUM. VERIFIED. EVERY LOT." CTA: "Shop" + "Verify Your Product"
2. Product collection grid: CHARGE, STEADY, TUNDRA, DEN, PRIME in card format
3. The Verify Promise: large section explaining the QR/COA system with animated scan demo
4. Product ecosystem: 24-hour product map graphic (CHARGE → STEADY → TUNDRA → DEN)
5. Ingredient evidence grades: A/B/C grading callout with 3 featured ingredients
6. Ambassador program CTA
7. Gym/wholesale CTA
8. Footer

**Design notes:**
- Dark (forest green #22372C) base everywhere, cream (#F5F1E8) text
- Gold accents on CTAs, rules, and icon details only
- Velvet-texture CSS on cards to echo the soft-touch packaging
- NO neon, NO gradients, NO confetti, NO emoji in UI
- Type is UPPERCASE for all product names, sentence case for body copy
- Minimal copy per section — the bear doesn't beg

**Individual Product Page (PDP)**
Required elements:
- Product name (Montserrat Black, uppercase, gold)
- Tagline (1 line)
- Full ingredient list with doses — no proprietary blends, ever
- Evidence grade per ingredient (A/B/C badge)
- Supplement Facts panel (accurate, complete)
- "SCAN FOR COA" section with lot number input to pull current COA
- Flavor selector if applicable
- Subscription toggle (10–15% off subscribe + save)
- Usage instructions
- Warnings (complete, never abbreviated)
- Related products

**/verify — COA Verification Page**
This is the brand's most important page. Design it like a product, not a utility.
- Input: lot number
- Output: pulls from COA database (Supabase or Airtable), displays:
  - Test date
  - Lab name and accreditation number
  - All tested parameters with pass/fail
  - PDF download
  - QR to this exact lot's page (shareable)
- Copy: "Every lot. Every test. Right here."
- If lot not found: "This lot may not be in our system yet.
  Contact us with your lot number and purchase date."

**/science — Ingredient Evidence Hub**
- Intro: our grading system (A/B/C defined clearly)
- Grid of all ingredients across the line with grade badges
- Each links to /science/[ingredient] for full breakdown
- Excluded ingredients section: "What we don't use and why" — this is a trust
  page, not a defensive page. Own the exclusions as a quality signal.
- Sources: link to PubMed for every cited study

**/ambassadors**
- Program overview
- Three-tier table (Bronze/Silver/Gold) with requirements and commissions
- "The recurring commission" callout — most important differentiator to highlight
- Signup form (collects: name, IG/TikTok handle, gym/box affiliation, monthly
  reach estimate, city/state)
- FAQ: payout timing, FTC disclosure requirements, what you can/can't say
- Download: Approved Claims Guide (PDF)

**/wholesale**
- Gym owner and trainer specific language
- Consignment offer: "Zero risk. First case on us."
- Product catalog with wholesale pricing
- Application form: gym name, address, owner name, size, current supplement brands
- After approval: portal access to order, track, manage counter display

**Navigation**
Top nav (desktop): Logo | Products | Science | Verify | Ambassadors | Wholesale | Cart
Mobile: Hamburger | Logo | Cart icon
Sticky on scroll, forest green background, gold logo mark only when sticky

**Footer**
- Logo
- Nav links
- "These statements have not been evaluated by the Food and Drug Administration.
  This product is not intended to diagnose, treat, cure, or prevent any disease."
- Links: Privacy Policy, Terms, Contact, Wholesale, Ambassador Program
- Social: Instagram, TikTok (not linked to any peptide entity)

---

# PART 4 — GITHUB REPOSITORY INSTRUCTIONS

## Repository Name: `arctos-labs`

Keep alongside TherapyLog in the same GitHub organization/account for easy
cross-reference, but the two projects are completely separate codebases and
separate Vercel projects. No shared dependencies, no monorepo structure.

## Branch Strategy
- `main` — production (deploys to arctoslabs.com)
- `develop` — staging (deploys to preview URL)
- `feature/*` — feature branches, PR into develop
- `hotfix/*` — emergency fixes, PR into main + develop

## Environment Variables Required (Vercel + local .env.local)
```
# E-commerce (if Shopify headless)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN=

# If Stripe + custom cart
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# COA database
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Email (Resend or similar)
RESEND_API_KEY=
```

## Vercel Project Settings
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- Node version: 18.x or 20.x
- Team: [same team as TherapyLog]

---

# PART 5 — HANDOFF DOCUMENTS TO GENERATE

When a code agent builds this repo, also generate the following as downloadable
files (PDF preferred, Word as fallback):

1. **Manufacturer RFQ** (`/manufacturing/manufacturer-rfq.pdf`)
   Formal letterhead document with all product specs, quality standards,
   commercial questions. Source content: Part 2C above.

2. **Brand Guidelines** (`/brand/arctos-brand-guidelines.pdf`)
   Full-color document: logo usage rules, color swatches with codes,
   typography specimens, do/don't examples, packaging finish specs.

3. **Claim Substantiation Binder** (`/legal/claim-substantiation-binder.pdf`)
   Legal-formatted document. Per-ingredient claim language, evidence grades,
   exclusion log with reasoning, ambassador controls.
   This is the document produced if FDA or FTC comes knocking.

4. **Ambassador One-Pager** (`/marketing/ambassador-one-pager.pdf`)
   Single page, print-ready. Brand story, commission table, sign-up QR,
   "scan for COA" demo. Design matches brand: forest green, gold, matte feel.

5. **Gym Pitch Sheet** (`/marketing/gym-pitch-sheet.pdf`)
   For leaving behind at gyms. Product grid with brief descriptions,
   wholesale terms, consignment offer, contact/wholesale application QR.

---

# PART 6 — REFERENCE NOTES FOR THIS RESEARCH CHAT

This chat is the research and strategy source for Arctos Labs. The code environment
has Vercel and GitHub access. When building, reference this document as the single
source of truth.

If returning to this chat for research:
- All formulation decisions with evidence grades are in Part 2C
- All excluded ingredients with documented reasons are in Part 2D
- All approved/prohibited claims language is in Part 2E
- Business structure boundaries (esp. peptide isolation) are in Part 2G
- Website architecture is in Part 3

Outstanding items not yet resolved (bring back to research chat):
- Trainer one-pager design (copy drafted, needs final design)
- Copper peptide (GHK-Cu/AHK-Cu) scalp serum — early-stage, separate
  cosmetic-track project, not part of Arctos Nutrition
- Protein powder line (Tier 3, after creatine and electrolyte launch)
  — leading candidates: grass-fed whey isolate + beef protein isolate/
  colostrum SKU for carnivore audience ("Arctos Primal")
- Blood panel partnership (Quest/Labcorp reseller) to bundle with FOUNDATION
  and CIRCUIT — "verify your product, verify yourself" extension
- Attorney consult: DSHEA/FDA specialist before first sale
- Peptide entity: separate attorney session, do not build until that session

---

*Arctos Labs master context document v1.0 · August 2026*
*Single source of truth for brand, product, website, and build.*
*Do not share this document publicly — contains proprietary formulations.*
