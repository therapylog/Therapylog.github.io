# Arctos Labs – Design Ledger

**Brand**: Arctos Labs — High-Performance Luxury Supplement Company  
**Design System**: Nocturne (dark interface, compact 8px radii, gold accent #C9A227)  
**Updated**: 2026-08-17

---

## Visual Identity

### Color Palette
- **Ground**: Dark forest green `#1A2B22` with radial depth gradients
- **Accent**: Metallurgic gold `#C9A227` — hot foil proxy, never flooded (lines, marks, glows only)
- **Text**: Off-white `#F5F1E8` on dark, dark green `#22372C` on light
- **Neutrals**: 100–900 OKLCH ramps from `#F5F1E8` → `#1B2820`

### Typography
- **Headings**: Montserrat 700–900 wt, uppercase, tight letter-spacing
- **Body**: Barlow 400–600, dense leading (1.55), `text-wrap: pretty`
- **UI/Labels**: Barlow Condensed 400–600, high letter-spacing (0.14–0.2em), uppercase

### Packaging (Pouch Tins, Ø 68mm)
Four SKUs, one lid tool, one foil:
1. **CHARGE** (Cool Mint) — Matte black 100K base, gold foil. Focus + pre-workout stack.
2. **STEADY** (Espresso) — Forest green PMS 5535 C, gold foil. Stim-free, all-day.
3. **TUNDRA** (Pure Purist) — Off-white uncoated, darker gold foil. Electrolytes, unflavored.
4. **DEN** (Chamomile-Lavender) — Deep forest, gold foil. PM recovery, 0.5 mg melatonin.

Each tin carries:
- **Lid**: Circular artwork with shield, wordmark, product name, flavor, dose callout
- **Side wrap**: 213.6 × 21 mm BOPP, gold foil, uncoated QR knockout (15×15mm), lot + exp blanks
- **Base**: QR links to CoA for that exact lot (verified by third-party lab)

---

## Core Messaging

### The Promise
**Nothing hidden. Nothing proprietary.**
- Every ingredient and dose printed on the panel
- Every lot tested by third-party lab before ship
- Scan the tin, read the certificate yourself

### Evidence Grades
- **A**: Multiple human trials, consistent effect, dose matches literature
- **B**: Human evidence exists, direction clear, but trials small/short or dose at edge
- **C**: Sound mechanism, thin human data — in the formula because safe + additive, never the reason to buy

### Excluded Ingredients (With Reason)
Vinpocetine, Red Yeast Rice, 5-HTP, St. John's Wort, Ashwagandha (liver risk), B6 >25mg (neuropathy), GABA (poor BBB), melatonin >1mg (residue), vitamin C in H2 companion (blunts adaptation), proprietary blends (always).

---

## Site Sections

### Home
- **Hero**: "Nothing hidden. Nothing proprietary" + shield animation (breathe loop, optional foil glow)
- **Stats band**: 100% tested lots, 0 proprietary blends, 20 pouches/tin, 0.5 mg melatonin
- **Pouch lineup**: Card grid with 3D tin renders, SKU cards (hover lift), flavor/dose callouts
- **Verify section**: Lot number input → real-time CoA fetch (demo: ARC-0824-CH-117), cert display with table
- **24-hour map**: Timeline of the four SKUs with clock times + purpose blurbs
- **Evidence grades**: Brief explanation, then featured ingredients (A/B/C in boxes)
- **Ambassador + wholesale cards**: Image slot for gym photo, call-to-action buttons
- **Footer**: Brand mark, links, FDA disclaimer, placeholder notice

### PDP (Product Detail Page)
- **Left sticky**: 3D tin render at large scale, color swatches for flavors (circular thumbnails)
- **Right**: SKU name (large, accent color), tagline, price, qty, subscription toggle (15% save), add-to-cart
- **Below**: Ingredient table (active, dose, evidence grade), supplement facts panel (off-white bg), usage + warnings
- **CoA box**: Prominent QR + "Scan for CoA" call-to-action, verify button

### Science Hub
- **Header**: Evidence grade definitions (A/B/C in cards)
- **Full ingredient grid**: All 25 ingredients with A/B/C badges, clickable
- **Excluded table**: 10 ingredients, reason out, status (hard exclude / omitted / capped / deliberate)

### Verify Section
- **Lot lookup**: Input field or scan QR
- **States**:
  - **Idle**: QR artwork + "Scan the base or type the lot number"
  - **Scanning**: Animated scan line pass, "Reading lot ARC-0824-…"
  - **Found**: CoA displayed (product, lot, tested date, lab name + accreditation, test table with pass badges)
  - **Missing**: "This lot may not be in our system yet — email the lab desk"

### Cart
- **Lines**: Circular tin thumbs, product name, flavor, qty controls, price, subscription save label, remove link
- **Right sticky**: Order summary (subtotal, sub savings, shipping, tax), total, checkout button, free ship notice >$75

### Checkout
- Step tracker (1. Contact, 2. Shipping, 3. Payment)
- Inline form fields (email, phone, address, card, same-billing checkbox)
- Right sticky: order summary table, total, place order button

### Packaging Reference
- **Family lineup**: 4 tins in 1:1 renders at actual size, labeled with color specs
- **Lid artwork**: Full-color 1:1 at 74mm crop (68mm printed + 3mm bleed), all four SKUs
- **Side wrap**: Flat 213.6 × 21mm artwork with gold foil, QR, lot/exp blanks, demo text
- **Color specs**: Four swatches with Pantone / hex / CMYK values

---

## Design Decisions

### Nocturne Adaptation
- Nocturne tokens retuned to locked print colors (forest green, gold, off-white, matte black)
- Density 0.7× (compact 8px radii, tight spacing scale)
- Gold accent used as rule, glow, line — never flooded fills (except section dividers)
- Photographs wrapped in `.lighten` class (blend-mode: lighten) to fade dark backgrounds

### 3D Tin Rendering
- SVG circles + filters (inset shadows for depth, gold rim glow at 30% opacity)
- Wordmark + shield centered, proportional to container (container queries, cqw units)
- Foil animation optional (prop: `foilSheen`, default true) — `foilglow` keyframe at 7s ease-in-out
- TUNDRA foil darkened 22% and desaturated (dark base on light) via CSS filter

### Interaction Patterns
- Radio buttons + segmented controls on native elements (`.seg`, `.radio`)
- Buttons: outlined primary (accent border), secondary (tinted bg), ghost, icon, block
- Tags: accent, neutral, outline variants — all from Nocturne component set
- Cards: `.card` with kickers, titles, bodies, metadata; elevation via shadows

### State Persistence
- Cart state in Component memory (not localStorage, for design review purity)
- Lot lookup demo: pre-seed with passing lot ARC-0824-CH-117 (fillGood action)
- Subscription toggle: visual radio + price delta in real time

---

## Props (Tweakable)

| Prop | Type | Default | Use |
|------|------|---------|-----|
| `foilSheen` | boolean | true | Foil glow animation on tin renders |
| `canFinish` | enum (tonal / uniform) | tonal | Uniform = all tins same color (for mock-up export) |

---

## Files

- **Arctos Labs.dc.html** — Complete site in one DC (1075 lines), Nocturne bundle linked
- **assets/** — Shield PNG, wordmark PNG, QR artwork PNG
- **_ds/nocturne-.../** — Design system bundle, styles, components (no changes needed)

---

## Next Steps for Brand Extensions

When building other Arctos content in separate chats:
1. Link the same Nocturne bundle and this ledger
2. Reuse the color tokens (green, gold, off-white, black) and type scale
3. Follow the evidence-grade badge system (A/B/C, same styling)
4. Use the same component set (cards, buttons, tables, fields) — do not reinvent
5. Keep packaging specs locked (68mm tin, 213.6 × 21mm wrap, uncoated QR, foil proxy #C9A227)
6. Maintain the density and letter-spacing convention (0.14–0.2em for UI labels)

---

## Verification Notes

- Console clean on load (no missing assets, no DOM errors)
- All four SKU states render correctly (tonal + uniform finishes)
- Lot lookup demo works (pass = ARC-0824-CH-117, fail = anything else)
- Cart operations (add, qty, remove, sub toggle) update in real time
- Responsive breakpoints: clamp() on headings, padding, gaps for mobile-to-desktop flow
