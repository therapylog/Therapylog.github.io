# TherapyLog Art Direction — The Observatory

Prompt library for generating the app's visual system with Gemini
(`gemini-3-pro-image`, "Nano Banana Pro"). Class ids below match
[`compounds.json`](./compounds.json).

**Supersedes the molecular/thin-line direction (16 Aug 2026).** That version is
retired — see "Why the first pass failed" below before reusing anything from it.

Last updated: 17 August 2026 · 130 compounds · 30 classes

---

## Why the first pass failed

The first kit produced consistently ugly logos. The cause was the prompts, not
the operator. Three instructions were poisoning every render:

1. **"Thin luminous line work."** Diffusion models paint light and texture; they
   do not draw vectors. Thin lines render wobbly, broken, and blooming with
   glow — and they vanish entirely at 32px. This is the worst possible
   instruction for a logo.
2. **Molecular structures.** Fused-ring topology is precise geometry the model
   cannot hold. It invents bonds, breaks symmetry, adds rings. The result reads
   as *chemistry drawn wrong*, which is worse than no chemistry.
3. **One style block for marks and photographic renders alike.** The logos
   inherited a "dark studio photograph" preamble, so they came out looking like
   out-of-focus product shots instead of icons. These need opposite instructions.

There was also a platform problem: *"laboratory instrumentation photographed in
a dark studio"* is cold. Nothing built on that brief was going to feel
inspiring.

## The platform: an observatory, not a laboratory

Same instruments, opposite feeling. A lab is where things get dissected under
flat white light. An observatory is where someone points a careful instrument at
something worth seeing and waits for first light.

That is closer to what the app is for. Users are taking powerful compounds,
often without a doctor in the loop, and what they want is to **know where they
stand**. TherapyLog turns an unknown into a known. That is navigation, not
analysis — and navigation in the dark is what harm reduction actually is.

So the system stays dark but gains warmth: a low amber light entering from the
edge of frame, solid forms with real weight instead of fragile glowing
filaments.

**Palette:** night `#0B1015` · signal green `#4ADE9A` · beam cyan `#3BC4FF` ·
first light `#F5A65B`

The greens and cyans are unchanged. The warm amber is new and is the difference
between clinical and human.

## The standing rule (unchanged)

**Generated art never carries data or chemistry.** The in-app syringe fill bar
stays code-drawn because it renders a real number. Molecular structures on
compound pages would come from SMILES via RDKit, never an image model.
Everything here is identity and atmosphere.

**No per-compound images.** Class art plus the compound's class color gets ~90%
of the benefit for 4% of the work; 130 images is a consistency trap.

---

## 1. Two style blocks — never one

### STYLE — MARKS (logos, icons, anything that must survive at 32px)

```text
Flat vector logo. Solid filled shapes only — no gradients, no glow, no 3D,
no bevels, no outlines, no thin lines, no texture. Two colors maximum on a
plain flat background. One centered subject with generous margin. Bold simple
silhouette that still reads clearly at 32 pixels. Geometric and confident, in
the visual language of a modern app icon. Crisp hard edges, high contrast.
```

### STYLE — RENDERS (heroes, class art, anything photographic)

```text
Cinematic photograph shot on a dark set at the blue hour. Deep blue-black
background (#0B1015), and one warm low light source raking in from the left
like first light through a window. Real tactile materials: brushed aluminium,
matte ceramic, cool glass. One subject, centered, generous negative space,
shallow depth of field, long soft shadow. Calm, precise and quietly hopeful —
an observatory at dawn, not a laboratory. No people, no clutter, no white
backdrop, no text.
```

---

## 2. Marks

Five concepts, none molecular. Each is a single solid subject with a silhouette
recognizable across a room. Generate four variations of each.

### MARK A — The Beacon (start here)

A lighthouse is a machine whose entire purpose is keeping people from wrecking
on ground they cannot see — the mission stated as an object. Unused in the
TRT/peptide space, and it sits beside the Arctos grizzly without competing (one
is wild power, one is guidance). Survives because it is two solid shapes, one of
them a triangle.

```text
[STYLE — MARKS]

App icon: a lighthouse reduced to its simplest possible geometry. A solid
tapered tower rising from the bottom of the frame, drawn as one clean shape
with straight edges, filled in bright green (#4ADE9A). From a point near the
top of the tower, a single solid triangular wedge of light sweeps out to the
upper right in the same green at lower opacity — one wedge, not rays, not
beams, not sparkles, not a starburst. Exactly two shapes make up the entire
mark. Flat, heavy, balanced, iconic. Plain near-black background.
```

### MARK B — The Peak (most ownable)

A pharmacokinetic curve is *asymmetric*: fast rise to a crest, then a long slow
tail. That shape is the signature of the thing the app does that competitors do
worse, and it is nothing like the symmetric bell every other health app uses.
Reads as a hill, a wave, and a rising signal at once. Survives because smooth
continuous curves are what these models render best, and the asymmetry avoids
the bilateral symmetry they render worst.

```text
[STYLE — MARKS]

App icon: one solid shape formed by a single continuous curve. The curve rises
steeply from the lower left, crests in a smooth rounded peak just past center,
then descends in a long gentle tail toward the lower right. Everything beneath
the curve is filled solid bright green (#4ADE9A); everything above it is empty
near-black. Deliberately asymmetrical — the rise is fast, the fall is slow.
The whole form sits inside a rounded square. No line, no stroke, no grid, no
axis, no dots, no markers. One filled shape only.
```

### MARK C — The Ibex (creature mark)

An ibex stands on ledges that would kill anything less sure-footed. It does not
avoid dangerous ground — it crosses it deliberately and does not fall. Harm
reduction with a heartbeat, and unlike wolves and stags it is almost unused in
this category. The horns carry the silhouette.

```text
[STYLE — MARKS]

App icon: the head of an ibex in strict side profile, facing left, built from
flat geometric planes. Two long ridged horns sweep back and up in one confident
continuous curve and dominate the silhouette. Solid bright green (#4ADE9A) on
plain near-black, with only two or three clean straight plane divisions cutting
the form — no fur, no fine detail, no shading, no eye detail beyond a single
simple shape. Powerful and completely still. Heraldic, emblem-like, carved.
```

Swap-ins if the ibex doesn't land: a peregrine falcon head (precision, sees
detail from a mile up) or a heron in profile (stillness, patience). Same prompt,
change only the animal.

### MARK D — The Dial (instrument)

The app is fundamentally a gauge — it tells you where you are on a scale that
matters. Says precision and calm without saying medical. Two geometric
primitives, near-impossible to render badly.

```text
[STYLE — MARKS]

App icon: a precision instrument dial reduced to two solid shapes. A thick
half-circle arc opening upward, drawn as one heavy even band in cool grey. From
the center of that arc, one short bold needle rises at a confident angle just
right of vertical, filled bright green (#4ADE9A). No numbers, no tick marks, no
housing, no bezel, no text, no shading. Two shapes total. Heavy, machined and
calm, centered on plain near-black.
```

### MARK E — The Lockup (safest)

If none of the above earns its place, a blunt well-cut monogram beats a clever
mark nobody believes in. Heavy letterforms are also what Nano Banana Pro renders
most reliably, making this the highest-hit-rate option.

```text
[STYLE — MARKS]

App icon: the letters T and L forming a single solid monogram cut from one
heavy geometric slab. The horizontal bar of the T extends further right than
normal and becomes the baseline of the L, so the two letters share one stroke
and interlock into a single connected shape. Extremely bold weight, completely
flat fill, bright green (#4ADE9A) on plain near-black. No serifs, no outline,
no shadow, no gradient. Blunt and confident — reads instantly at 32 pixels.
```

### Wordmark (pairs with any mark)

```text
A logotype reading exactly "TherapyLog" as one word, set in a heavy geometric
sans-serif with tight letter spacing, on a plain near-black background.
"Therapy" in near-white, "Log" in bright green (#4ADE9A). Completely flat — no
effects, no glow, no gradient, no icon, no tagline. Clean modern technology
wordmark, horizontally centered with generous margin. Spell it exactly:
TherapyLog
```

---

## 3. Class art — solid objects, not wireframes

Same 30 classes, opposite treatment. The retired prompts asked for glowing
filament butterflies and neurons, which is why they read as clip art. These are
chunky physical objects in warm light.

```text
[STYLE — RENDERS]

A single icon-object representing {SUBJECT}, rendered as one chunky solid
three-dimensional object resting in a dark space. Matte ceramic and brushed
metal in a muted neutral grey, with one {COLOR} element as the only saturated
color anywhere in the frame. Simple and heavy — bold rounded forms, thick
proportions, no delicate parts, no fine detail, no wireframes, no glowing
lines. Strong readable silhouette, centered, slight three-quarter angle, one
warm key light from the lower left throwing a long soft shadow to the right.
One of a set of thirty siblings with identical lighting, scale and materials.
```

**Consistency trick:** generate one you love first. For every subsequent image,
attach it and append — *"Match the lighting, materials, scale and camera angle
of the attached reference exactly. Only the subject changes."* The Graphics
Studio already does this on its revise step.

| Class id | `{SUBJECT}` | `{COLOR}` |
| --- | --- | --- |
| `androgens` | a heavy amber glass vial with a thick metal cap, standing upright | `#4ADE9A` |
| `peptides` | a squat lyophilized peptide vial with a rubber stopper and crimped collar | `#3BC4FF` |
| `glp1` | a thick unbranded injector pen lying at a three-quarter angle | `#F59E0B` |
| `ghs` | a solid twisted column, like a rope of polished ceramic rising and turning | `#A78BFA` |
| `ancil` | a thick rounded shield, slightly domed, standing on edge | `#F472B6` |
| `pct` | a heavy closed ring of brushed metal, one quarter of it a different color | `#4ADE9A` |
| `aas` | a dense solid hexagonal block of machined chrome, weighty and squat | `#F87171` |
| `sarmsclass` | three thick concentric rings with one solid dot at their center | `#34D399` |
| `hghclass` | three solid blocks of increasing height, like a stepped podium | `#A78BFA` |
| `nootroplonge` | a smooth rounded brain form in matte ceramic, simplified to soft lobes | `#818CF8` |
| `addlpeptides` | three small vials of graduated heights clustered close together | `#22D3EE` |
| `addlancil` | two thick interlocking gears in matte titanium, chunky teeth | `#FB923C` |
| `thyroid` | a solid butterfly form carved from smooth stone, wings flat and simplified | `#22D3EE` |
| `adrenal` | a thick solid lightning bolt shape standing upright, rounded edges | `#FBBF24` |
| `metabolic` | a smooth simplified heart form in matte ceramic, one clean groove across it | `#F87171` |
| `longevity2` | a solid hourglass with thick wooden ends and a heavy glass waist | `#818CF8` |
| `collagen` | three thick cords braided together into one solid rope, cut clean at both ends | `#F9A8D4` |
| `neuro2` | a rounded central node with four thick tapering arms reaching outward | `#C084FC` |
| `muscle` | a thick bundle of parallel cords bound at the middle, like a cable | `#F87171` |
| `khavinson2` | four solid spheres linked in a short chain, each a slightly different tone | `#6EE7B7` |
| `metabolic2` | a solid stylized flame carved from smooth stone, thick and rounded | `#FB923C` |
| `sexhealth` | two thick interlocking rings of polished ceramic, overlapping | `#F472B6` |
| `antiinflam` | a thick rounded shield lying flat, with one broad ripple across its face | `#34D399` |
| `senolytics` | a smooth sphere with one clean segment cut away and lifted slightly clear | `#A78BFA` |
| `supps` | a chunky two-piece capsule lying on its side, matte finish | `#34D399` |
| `sleep-neuro` | a thick crescent moon carved from frosted stone, standing on end | `#818CF8` |
| `performance` | a heavy pocket stopwatch in brushed metal, thick crown on top | `#F59E0B` |
| `longevity3` | a solid four-pointed star with thick tapering arms, carved and symmetrical | `#34D399` |
| `newcompounds` | a round-bottomed laboratory flask with a thick neck, half filled | `#A78BFA` |
| `bbcompounds` | a thick hexagonal iron plate standing on edge, chunky and industrial | `#EF4444` |

---

## 4. Hero images

### HERO — The Ridgeline (lead image, 16:9 · 2048px)

If only one gets made, make this one. Note the ridge profile is deliberately the
same asymmetric curve as Mark B — the shape recurring across the identity is
what makes a system feel designed rather than assembled.

```text
A wide landscape photographed from high ground at first light. A dark ridgeline
crosses the foreground: it rises steeply on the left, crests in a smooth
rounded peak just past center, then falls away in a long slow tail to the right.
Beyond it a valley fills with cool blue mist, and at the horizon a thin band of
warm amber light is just beginning. Deep blue-black land, almost silhouette,
with the warm band the only bright thing in the frame. Vast, quiet and
contemplative. Sharp focus, natural light, no people, no buildings, no roads,
no text.
```

### HERO — The Syringe (16:9 and 1:1 · 2048px)

```text
[STYLE — RENDERS]

A single insulin syringe lying on a smooth dark surface, photographed from a low
three-quarter angle. Clear barrel with crisp printed gradations, fine short
needle, plunger drawn partway back, holding a small measured volume of pale
liquid. One warm shaft of low morning light rakes across the frame from the
left, catching the top edge of the barrel and throwing a long soft shadow to the
right. Everything the light misses falls into deep blue shadow. Photographed the
way a good wristwatch is photographed — patient, precise, almost affectionate.
No hands, no vials, no packaging, no clutter.
```

### HERO — The Volume (4:5 or 16:9 · 2048px)

```text
[STYLE — RENDERS]

A heavy reference volume lying closed on a dark wooden surface, seen from a low
angle. The cover is dark matte cloth, worn slightly at the corners, with one
small blind-embossed mark. A warm shaft of first light falls across the cover
and lights the edge of the closed pages, and fine dust drifts in the beam. Deep
blue shadow everywhere the light does not reach. It should feel like a book
somebody actually opens and consults, not a prop. No title, no lettering, no
text anywhere on the cover.
```

---

## 5. Empty states and onboarding

### EMPTY STATES (1:1 · 1024px · run 5×)

```text
[STYLE — MARKS]

A small simple spot illustration for an empty state in a dark app interface.
Subject: {SUBJECT}. Drawn as two or three solid flat shapes in muted grey with a
single small bright green (#4ADE9A) accent, sitting quietly on plain near-black
with lots of empty space around it. Understated and calm — this appears before a
user has entered anything, so it should feel like an invitation rather than a
decoration. Very few elements. No text.

{SUBJECT} — generate one each:
1. an empty calendar grid with one square filled solid
2. a flat horizon line with one small shape just beginning to rise from it
3. an empty vial standing upright, waiting
4. a closed notebook seen from above
5. a single point of light alone in a large empty field
```

### ONBOARDING (4:5 · 1536px · matched set of 3)

```text
[STYLE — RENDERS]

A vertical image for an app onboarding screen, dark and atmospheric, with the
composition weighted to the upper two thirds and generous empty space at the
bottom for text. Subject: {SUBJECT}. Warm low light from the left, deep blue
shadow, one saturated accent color. Calm and premium. No text.

{SUBJECT} — generate all three as a matched set:
1. "Log it"  — a syringe and a small vial arranged like a still life on a dark
   surface in warm raking light, green (#4ADE9A) accent
2. "See it"  — a dark ridgeline rising and falling against a valley of mist at
   dawn, seen from above, cool blue (#3BC4FF) dominant
3. "Know it" — an open reference volume face down on a desk beside a cup, warm
   amber (#F5A65B) light, the scene of someone mid-way through learning
   something
```

---

## 6. Social / announcement graphics

Nano Banana Pro renders in-image text reliably. Swap the headline, keep
everything else fixed so the series holds together.

```text
A social announcement graphic for a health app. Deep blue-black background with
a warm amber glow low along the bottom edge, like light before sunrise. Across
the lower third, a bold solid green (#4ADE9A) shape formed by a curve that rises
steeply, crests, and falls away in a long tail — filled solid beneath, empty
above. Above it, in clean heavy modern sans-serif, the headline "KNOW WHERE YOU
STAND" in near-white, large and confident with generous letter spacing. Below
the headline in smaller muted grey text: "Estimated serum levels for 60+
compounds". In the bottom left corner, small and understated in green:
"TherapyLog". Editorial and premium — a product announcement from a design-led
company, not a supplement ad. Spell all text exactly as written.
```

---

## 7. Troubleshooting

Specific moves for specific failures, instead of regenerating and hoping.

1. **Mushy, soft, or glowing when you wanted a mark.** The render style block
   leaked in. Strip every word about light, glow, luminous, depth, and material,
   and make sure "flat vector logo" is the first phrase in the prompt.
2. **Too busy or cluttered.** Cut the prompt in half. Every sentence removed
   makes the shape bolder — the best-performing logo prompts here are the
   shortest ones.
3. **Wobbly, asymmetric, or structurally wrong.** Too much geometry requested.
   Reduce to two shapes and say so explicitly: *"exactly two shapes make up the
   entire mark"* does real work.
4. **Right idea, wrong execution.** Don't re-roll from scratch. Attach the
   closest attempt and describe only the delta: *"Same mark. Make the horns
   sweep further back and thicken the neck."* Iterating beats regenerating.
5. **Never ask for two subjects in one mark.** The retired kit's "two skeletons
   overlapping and sharing a backbone" asked the model to blend two objects into
   one coherent form. It cannot, and it returns spaghetti every time.
6. **When you have a winner**, send it back with: *"Reproduce this exact mark as
   a flat two-color version on a plain black background — no glow, no depth, no
   shading, no texture — suitable for tracing to SVG."* Then trace in Figma or
   Illustrator. The PNG is concept art; the vector is the asset.

---

## 8. File plan and wiring

Class art filenames match the class ids in `compounds.json`, so lookup is one
line.

| Path | Size | Used by |
| --- | --- | --- |
| `/assets/art/class-{id}.png` | 1024² | Encyclopedia class tiles (`class-peptides.png`) |
| `/assets/art/hero-ridgeline.png` | 2048 | Landing hero, onboarding, social |
| `/assets/art/hero-syringe.png` | 2048 | Tools empty state, social |
| `/assets/art/hero-volume.png` | 2048 | Encyclopedia header |
| `/assets/art/empty-{name}.png` | 1024² | Empty states across Log, Levels, Bloodwork |
| `/assets/art/onboard-{1,2,3}.png` | 1536 | Onboarding steps |
| `/icons/icon.svg` | vector | App icon, favicon, PWA — the hexagon TL monogram mark (2026-08 rebrand) |
| `/icons/logo-dark.svg` | vector | Full lockup (mark + wordmark) for dark backgrounds — site navs and headers |
| `/icons/logo-light.svg` | vector | Full lockup for light backgrounds — print/exports (wordmark ink #191919, from the logo artwork) |

**Compress before committing.** Run PNGs through `pngquant` or export WebP at
~85%. Class tiles should land at 40–80 KB each, not 400 KB.

**`favicon.ico`** ships at the repo root (16/32/48 px, generated from the
hexagon TL mark) — browsers request it unconditionally, so keep it in sync
with `icons/icon.svg` whenever the mark changes.
