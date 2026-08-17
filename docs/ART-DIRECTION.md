# TherapyLog Art Direction Kit

Prompt library for generating the app's visual system with Gemini (`gemini-3-pro-image`,
"Nano Banana Pro"). Companion to [`COMPOUNDS.md`](./COMPOUNDS.md) — the class ids used
below match the ids in [`compounds.json`](./compounds.json).

Last updated: 16 August 2026 · 130 compounds · 30 classes

---

## The rule that governs everything here

**Never let generated art carry data or chemistry.**

- The **in-app syringe fill indicator** stays code-drawn. It renders a real number
  (0.80 ml of 1 ml, 80 units) and must move with the data. A *hero render* of a
  syringe for marketing and empty states is a different object and is fine.
- **Molecular structures** must never come from an image model on a compound page.
  Image models produce plausible-looking, chemically wrong structures — wrong ring
  counts, invented bonds, misplaced hydroxyls. In an app whose promise is accuracy,
  that is the detail the audience will screenshot. Generated molecular art is for
  stylized/abstract use only (logo, backgrounds, hero art). If true structures are
  ever wanted on compound pages, generate them from SMILES with RDKit — deterministic
  and correct.

### Verdict by asset

| Asset | Verdict | Why |
| --- | --- | --- |
| New logo / brand mark | **Do it first** | Highest-leverage visual. Current mark is a placeholder hexagon. |
| 30 class illustrations | **Do it** | Replaces 30 emoji with a real system. Biggest visible upgrade per unit of effort. |
| Hero syringe render | **Do it** | Landing page, empty states, social. *Not* the in-app fill indicator. |
| Encyclopedia hero render | **Do it** | Encyclopedia landing + the "130+ compounds" marketing beat. |
| Empty states & onboarding art | **Do it** | Cheap polish where the app shows a bare emoji today. |
| Social / ad creative | **Do it** | Nano Banana Pro renders text reliably; output is finished, not a Canva draft. |
| 130 per-compound images | **Don't** | Consistency and maintenance trap. Class art + class color gets 90% of the benefit for 4% of the work. |
| Molecular diagrams on compound pages | **Never generated** | Accuracy is the product. Use RDKit from SMILES. |
| In-app syringe fill bar | **Never generated** | Encodes live data. Stays code-drawn. |

---

## 1. The STYLE block

Paste this at the top of **every** image prompt. It is what makes 30 separately
generated images read as one system rather than a stock-art grab bag.

```text
Style system for a clinical health app called TherapyLog. Rendered on a near-black
background (#08090C) with a subtle radial glow. Precise, technical, and calm — like
laboratory instrumentation photographed in a dark studio, not a fitness ad. Thin
luminous line work, glass and brushed-metal surfaces, shallow depth of field, one
soft key light from the upper left plus a colored rim light. Restrained palette:
near-black ground, one dominant accent color, deep teal shadows. No text unless
asked. No people, no muscular physiques, no pills scattered on tables, no white
clinical backdrops, no stock-photo lighting, no purple-to-blue gradients, no
cluttered composition. Centered subject, generous negative space, sharp focus on
the subject, everything else falling into shadow.
```

**Palette:** ground `#08090C` · green `#4ADE9A` · cyan `#3BC4FF` · violet `#A78BFA`
· amber `#F59E0B` · red `#F87171`

### Consistency technique

Generate one image you like first — that is the reference. For every subsequent
image, upload that reference alongside the new prompt and append:

> Match the lighting, material treatment, and rendering style of the attached
> reference image exactly. Only the subject changes.

Nano Banana Pro accepts image + text input. This holds a series together far better
than repeating adjectives. The Graphics Studio in `marketing.html` already uses this
mechanism on its revise step.

---

## 2. Logo

### Why the molecule concept works

Testosterone and estradiol are the same molecule with one ring changed. Both share
the four-ring steroid backbone (three fused six-membered rings plus one
five-membered ring). The difference is almost entirely the A-ring: testosterone has
a non-aromatic A-ring with a ketone at C3 and retains its C19 methyl group, giving a
folded, three-dimensional shape. Estradiol's A-ring is a flat aromatic benzene ring
carrying a phenolic hydroxyl, and the C19 methyl is gone. Aromatase performs that
conversion — and aromatization is exactly what users are managing when they take an
AI and watch their E2.

A mark built on two molecules sharing one skeleton and diverging at a single ring is
therefore the process the app helps people control, and it supplies a built-in visual
language: folded vs. flat, warm vs. cool, one shape becoming another.

Run all four directions; they're cheap.

### LOGO A — the shared skeleton (1:1 · 2048px · strongest concept)

```text
[STYLE BLOCK]

A minimalist app logo mark. Two steroid molecule skeletons rendered as elegant thin
luminous line drawings, overlapping and sharing their fused ring backbone at the
center, diverging only at one end. The left form is warm — its terminal ring drawn
folded and dimensional in bright green (#4ADE9A) with a small glowing node where a
ketone would sit. The right form is cool — its terminal ring drawn perfectly flat
and hexagonal in cyan (#3BC4FF), with a single small hydroxyl node. Where the two
skeletons overlap in the middle, the lines blend into pale teal-white light. Read as
one continuous geometric mark, not two separate objects. Confident, scientific,
balanced. Vector-clean line weights, no gradients on the lines themselves, soft
outer glow only. Centered on a near-black square, generous margin. No text.
```

### LOGO B — the conversion (1:1 · 2048px · motion / story)

```text
[STYLE BLOCK]

A minimalist app logo mark showing a transformation. A single steroid ring structure
drawn in thin luminous line work, repeated three times across a tight horizontal
sweep: on the left a folded three-dimensional ring glowing warm green (#4ADE9A), in
the center a transitional form, and on the right a flat aromatic hexagon glowing cyan
(#3BC4FF). The three states connect through a single continuous flowing line so it
reads as one mark depicting one shape becoming another, not three icons in a row.
Slight arc to the composition. Elegant, inevitable, scientific. Centered on near-black,
strong negative space. No text.
```

### LOGO C — the monogram (1:1 · 2048px · safest / most legible)

```text
[STYLE BLOCK]

A minimalist app logo mark: the letters T and L constructed entirely from steroid
molecular geometry. The T's vertical stem is a fused chain of hexagonal rings drawn in
thin luminous green (#4ADE9A) line work; the L is formed from the same ring lattice in
cyan (#3BC4FF), the two letters interlocking so they share ring edges where they meet.
Reads instantly as the letters TL at a glance, and as molecular structure on closer
inspection. Geometric, precise, engineered. Small glowing nodes at ring vertices.
Centered on near-black, works at 32 pixels. No other text.
```

### LOGO D — the wildcard (1:1 · 2048px · emblem/mascot)

```text
[STYLE BLOCK]

A minimalist emblem logo for a hormone and peptide tracking app. A stylized human
figure in strong geometric profile, the torso and chest formed from an interlocking
lattice of hexagonal molecular rings rendered in thin luminous green (#4ADE9A) and
cyan (#3BC4FF) line work, as though the body were built from molecular structure.
Powerful but not muscular or heroic — proportioned like an anatomical study, calm and
upright. Contained inside a subtle circular boundary. Emblem-like, memorable at small
size, engraved-badge quality. Near-black ground. No text.
```

### After picking a winner

Send it back with:

> Produce this exact mark as a flat two-color vector-style version on a
> transparent-looking pure black background, no glow, no depth, no shading —
> suitable for tracing into SVG.

Then trace it in Illustrator or Figma. **Do not ship the raster PNG as the logo** —
`icons/icon.svg` needs clean vector for the favicon, app icon, and print. The
generated image is concept art; the vector is the asset. Also render a horizontal
lockup with the wordmark — the existing Georgia-italic "TherapyLog" is worth keeping
next to a stronger mark.

---

## 3. Class illustrations (all 30)

Replaces the emoji in the encyclopedia. Generate the reference first, then loop the
template with `{SUBJECT}` and `{COLOR}` swapped, feeding the reference image each time.

```text
[STYLE BLOCK]

A single icon-illustration representing {SUBJECT} for a compound reference library.
Rendered as a floating three-dimensional object in a dark void, lit from the upper left
with a {COLOR} rim light and a soft {COLOR} glow beneath it. Glass, chrome, and
matte-ceramic materials. Thin luminous accent lines tracing the form. The object sits
alone in generous negative space, centered, shot from a slight three-quarter angle with
shallow depth of field. Cohesive with a set of thirty sibling illustrations — same
lighting, same materials, same scale, only the subject changes. No text, no labels,
no background elements.
```

| Class id | `{SUBJECT}` | `{COLOR}` |
| --- | --- | --- |
| `androgens` | an amber glass ampoule of oil with a fine-gauge needle resting beside it | `#4ADE9A` |
| `peptides` | a lyophilized peptide vial with a rubber stopper, fine white powder inside catching the light | `#3BC4FF` |
| `glp1` | a sleek unbranded injector pen, dial visible, floating at a three-quarter angle | `#F59E0B` |
| `ghs` | a double-helix strand rendered as polished glass, coiling upward | `#A78BFA` |
| `ancil` | a faceted crystalline shield deflecting a beam of light | `#F472B6` |
| `pct` | a closed circular arrow loop in brushed metal, one segment glowing | `#4ADE9A` |
| `aas` | a heavy chrome hexagonal molecular ring cluster, dense and weighty | `#F87171` |
| `sarmsclass` | a precision target reticle of concentric glowing rings, one locked marker | `#34D399` |
| `hghclass` | an ascending stepped bar form in glass, each step taller and brighter | `#A78BFA` |
| `nootroplonge` | a geometric faceted brain form in translucent glass, internal light | `#818CF8` |
| `addlpeptides` | three small peptide vials of graduated heights clustered together | `#22D3EE` |
| `addlancil` | an interlocking pair of precision gears in matte titanium | `#FB923C` |
| `thyroid` | a butterfly rendered in thin luminous wire-frame line work, wings mid-beat | `#22D3EE` |
| `adrenal` | a lightning bolt captured inside a smooth glass sphere | `#FBBF24` |
| `metabolic` | an anatomical heart form built from smooth glass with a luminous pulse line across it | `#F87171` |
| `longevity2` | an hourglass with luminous particles suspended mid-fall, flowing upward | `#818CF8` |
| `collagen` | a triple-helix collagen strand woven from fine luminous filament | `#F9A8D4` |
| `neuro2` | a single neuron with branching dendrites rendered in glowing filament | `#C084FC` |
| `muscle` | a bundle of parallel muscle fibers rendered as translucent glass cords | `#F87171` |
| `khavinson2` | a short peptide chain of four linked spheres, each a different translucent tone | `#6EE7B7` |
| `metabolic2` | a stylized flame rendered in cool glass rather than fire, edges luminous | `#FB923C` |
| `sexhealth` | two interlocking glass rings, warm light where they intersect | `#F472B6` |
| `antiinflam` | a smooth shield form with a calm ripple pattern radiating across its face | `#34D399` |
| `senolytics` | a cell form dissolving into fine luminous particles at one edge | `#A78BFA` |
| `supps` | a translucent two-piece capsule floating, contents catching light | `#34D399` |
| `sleep-neuro` | a crescent moon carved from frosted glass, soft internal glow | `#818CF8` |
| `performance` | a stopwatch in brushed metal, hand frozen mid-sweep, motion trail of light | `#F59E0B` |
| `longevity3` | a four-pointed star burst of thin light rays, clean and symmetrical | `#34D399` |
| `newcompounds` | a laboratory flask with luminous liquid, a single bubble rising | `#A78BFA` |
| `bbcompounds` | a compact hexagonal barbell plate in dark iron with a glowing edge bevel | `#EF4444` |

---

## 4. Hero renders

### HERO — the syringe (16:9 and 1:1 · 2048px)

```text
[STYLE BLOCK]

A hero product render of a single insulin syringe, floating horizontally in a dark
void at a slight three-quarter angle. Photographic realism: crystal-clear barrel with
precise printed unit gradations, a fine short needle, and a plunger drawn partway
back. The barrel holds a small measured volume of luminous pale-green fluid (#4ADE9A)
that glows softly and casts light through the glass onto the surfaces below. Cyan rim
light (#3BC4FF) along the top edge of the barrel, deep teal shadow beneath. Shallow
depth of field with the gradation marks in razor focus and the needle tip falling soft.
Clinical, precise, quietly beautiful — the way a watch is photographed, not the way
medical equipment usually is. No hands, no vials, no clutter. No text.
```

### HERO — the encyclopedia (16:9 or 4:5 · 2048px)

```text
[STYLE BLOCK]

A hero render of an open reference volume floating in a dark void, seen from a low
three-quarter angle. The book is bound in dark matte material with a faint hexagonal
lattice embossed on the cover. Its open pages emit soft light, and rising from them is
a slow constellation of translucent molecular structures — hexagonal rings, short
peptide chains, small glowing nodes — drifting upward and outward, each connected by
the faintest luminous threads, dissolving into darkness at the top of the frame. Green
(#4ADE9A) and cyan (#3BC4FF) light sources, deep teal shadow. Feels like accumulated
knowledge, not magic. No readable text on the pages, no title, no lettering anywhere.
```

Syringe render → landing page + Tools empty state. Encyclopedia render → encyclopedia
header + the "130+ compounds" marketing beat. Both stand alone as social posts.

---

## 5. Empty states and onboarding

### EMPTY STATES — run 5× (1:1 · 1024px)

```text
[STYLE BLOCK]

A small, simple spot illustration for an empty state in a dark app interface. Subject:
{SUBJECT}. Rendered minimally in thin luminous line work with a single soft glow,
mostly empty space, sitting quietly on a pure near-black field so it blends seamlessly
into a dark UI. Understated and calm — this appears when a user has no data yet, so it
should feel inviting and unfinished rather than decorative or busy. Very few elements.
No text.
```

`{SUBJECT}` — generate one each:

1. an empty calendar grid with one square softly lit, awaiting a first entry
2. a flat horizontal line with a single small pulse beginning to rise from it
3. an empty vial standing upright, clean and waiting
4. an open notebook with blank luminous pages
5. a simple line chart axis with no data plotted yet, one point of light at the origin

### ONBOARDING — 3-panel set (4:5 · 1536px)

```text
[STYLE BLOCK]

A vertical illustration for an app onboarding screen, dark and atmospheric with
generous space at the bottom for text overlay. Subject: {SUBJECT}. Rendered in the
established style — glass and light on near-black, thin luminous line work, one accent
color dominating. Composition weighted to the upper two-thirds. Calm and premium.
No text.
```

`{SUBJECT}` — generate all three as a matched set:

1. **log** — a syringe and a vial arranged as a still life, one small glowing checkmark
   floating above them, green (`#4ADE9A`) dominant
2. **levels** — a smooth luminous curve rising and falling across a dark grid like a
   serum concentration chart, cyan (`#3BC4FF`) dominant
3. **understand** — a cluster of molecular structures resolving from chaos on the left
   into clean ordered geometry on the right, violet (`#A78BFA`) dominant

---

## 6. Social / ad creative

Nano Banana Pro renders in-image text reliably, so these come out finished.

```text
[STYLE BLOCK]

A social media announcement graphic for a health app. Dark near-black background with
a soft green radial glow in the lower right. Centered composition: a smooth luminous
serum-concentration curve rising and falling across a faint dark grid, rendered in
bright green (#4ADE9A) with a soft glow beneath the line. Above the curve, in clean
modern sans-serif, the headline "KNOW YOUR LEVELS" in white, large and confident,
generous letter spacing. Below the curve in smaller muted grey text: "Estimated serum
levels for 60+ compounds". In the bottom-left corner, small and understated in green:
"TherapyLog". Editorial and premium — like a product announcement from a design-led
company, not a supplement ad. Spell all text exactly as written.
```

Swap the headline/subhead for other launches; keep everything else fixed.

---

## 7. File plan and wiring

Class art filenames match the class ids in `compounds.json`, so lookup is one line.

| Path | Size | Used by |
| --- | --- | --- |
| `/assets/art/class-{id}.png` | 1024² | Encyclopedia class tiles (`class-peptides.png`) |
| `/assets/art/hero-syringe.png` | 2048 | Landing page, Tools empty state, social |
| `/assets/art/hero-encyclopedia.png` | 2048 | Encyclopedia header, marketing |
| `/assets/art/empty-{name}.png` | 1024² | Empty states across Log, Levels, Bloodwork |
| `/assets/art/onboard-{1,2,3}.png` | 1536 | Onboarding steps |
| `/icons/icon.svg` | vector | App icon, favicon, PWA — traced from the logo render, not the PNG |

**Compress before committing.** Run PNGs through `pngquant` or export WebP at ~85%.
Class tiles should land at 40–80 KB each, not 400 KB — thirty full-size PNGs would add
several megabytes to a repo whose entire app is one 718 KB file.

**`favicon.ico` is currently missing from the repo (404).** Generate it from the
chosen logo alongside `icons/icon.svg` and the derived app icons — browsers request
it unconditionally, so until it exists every page load logs a 404.
