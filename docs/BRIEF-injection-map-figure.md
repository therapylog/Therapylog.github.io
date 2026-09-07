# Design brief — injection site map figure

**For:** Claude Design (Fable 5.1) or any illustrator.
**Deliverable:** two SVG figures — front and back — built for interaction, not decoration.
**Written:** 5 September 2026.

---

## What it is for

TherapyLog is a hormone-therapy and peptide tracking app. Users inject on a
schedule and need to rotate sites so no site is used again before it has rested.
This figure is the interface for that: they look at it, see which sites are
rested and which are not, and tap one to log the injection.

So the figure is a **control surface that happens to be shaped like a body**. Every
decision below follows from that.

---

## Form language

A soft, inflatable-looking humanoid — the register of a friendly vinyl robot or an
air-filled mascot, not a person and not an anatomical model.

- **Rounded, pneumatic volumes.** Every limb and mass reads as gently over-inflated:
  generous radii, no sharp corners anywhere, forms that look pressurised from within.
- **Seamed, not muscled.** Where a real body would show musculature, this shows
  *construction* — soft seams between inflated segments, the way a sewn or welded
  vinyl form is panelled. No pecs, no abs, no deltoid striations, no anatomy.
- **Featureless head.** A smooth rounded head with no face, or at most two minimal
  dots. It must not acquire personality or gender.
- **Neutral, symmetrical, standing.** Arms slightly away from the body so the
  underarm and lateral torso are reachable. Feet together. Front and back views
  mirror each other exactly in silhouette.
- **One flat fill plus a soft interior shadow.** No gradients doing rendering work,
  no highlights implying a light source, no texture.

**Do not reproduce an existing character.** The register described above is a
general design language and is fine; a recognisable copy of any specific
studio-owned character is not, and would follow the app into distribution. What
comes back should be original work.

---

## The mistake to avoid

The first attempt failed in a specific way worth naming, because it is the easy
failure here.

The body was drawn from the same primitive shapes as the injection zones, at
similar sizes and with similar edges. The result read as **a pile of ovals, some
of which happened to be highlighted** — there was no figure, just a zone cloud in
a roughly person-shaped arrangement.

**The figure and the zones must be unmistakably different classes of object.**
The body is a single continuous soft mass with quiet, low-contrast edges. The
zones are flat markers that sit clearly *on top of* it. A viewer should perceive
"a body with markers on it" instantly, never "a collection of shapes."

Practically: the body wants larger unified masses and fewer visible seams than
feels natural while drawing it. Err toward one big soft silhouette.

---

## Construction and proportions

- **Canvas:** `viewBox="0 0 200 430"`, portrait, figure centred on x=100.
- **Proportion:** roughly 6.5 heads tall — slightly squat and soft rather than
  heroic. Wide, rounded shoulders; a soft continuous torso with no waist
  definition; thick limbs of near-constant width with rounded caps.
- **Landmarks** (approximate, adjust for balance): head centre y≈42, shoulder line
  y≈100, natural waist y≈195, hip line y≈245, knee y≈320, ankle y≈400.
- Arms held ~15° out from the torso.

Deliver the body as **one group** (`id="figure"`) so the app can restyle it
wholesale, with the zones in a **separate sibling group** (`id="zones"`).

---

## The zone map

24 zones. Each is a tappable marker sitting on the figure. Give each the exact
`id` below — the app keys its data off these.

**Front**

| id | Site | Route | Position |
|---|---|---|---|
| `delt-r` / `delt-l` | Deltoid | IM | outer shoulder cap |
| `bic-r` / `bic-l` | Biceps | IM | front upper arm |
| `abd-r` / `abd-l` | Abdomen | SubQ | either side of centre, clear of the navel |
| `flank-r` / `flank-l` | Flank | SubQ | soft lateral waist |
| `quad-r` / `quad-l` | Vastus lateralis | IM | outer front thigh, upper-middle third |
| `othigh-r` / `othigh-l` | Outer thigh | SubQ | lateral thigh, above the quad marker |

**Back**

| id | Site | Route | Position |
|---|---|---|---|
| `trap-r` / `trap-l` | Trapezius | IM | between neck and shoulder |
| `tri-r` / `tri-l` | Triceps | IM | back of upper arm |
| `lat-r` / `lat-l` | Lat | IM | lateral back below the armpit |
| `vg-r` / `vg-l` | Ventrogluteal | IM | lateral hip, above the gluteal mass |
| `dg-r` / `dg-l` | Dorsogluteal | IM | upper outer gluteal quadrant |
| `calf-r` / `calf-l` | Calf | IM | rear lower leg, upper third |

Left and right are the **viewer's** left and right, mirrored across x=100.

**Sizing:** every marker must be at least 44×44 CSS pixels at a 360px-wide phone
render. On a 200-unit viewBox scaled to ~250px that means a minimum radius of
about 11 units. Larger where anatomy allows — glutes and quads can be
considerably larger than delts. **No two markers may touch or overlap.** If the
geometry cannot fit them, enlarge that body region rather than shrinking markers.

---

## States

Each zone renders in one of four states. Supply the marker as a shape the app can
recolour — a single `fill` and `stroke` per marker, no baked-in gradients.

| State | Meaning | Treatment |
|---|---|---|
| Rested | past its rest period | solid fill, full opacity |
| Recovering | used, still within rest period | same shape, reduced fill opacity |
| Used <48h | very recent | solid fill plus a heavier ring |
| Never used | no history | outline only, no fill |

Colour is supplied by the app and must not be baked in. Design so the four states
are **distinguishable by shape and weight alone**, in greyscale — colour is
confirmation, never the sole carrier. Additionally supply a `selected` treatment:
a distinct outer ring that reads on all four states.

---

## Technical requirements

- **Format:** hand-editable SVG. Real geometry (`<ellipse>`, `<path>`, `<rect>`),
  no embedded raster, no `<image>`, no base64.
- **No inline styles on the body.** Use `fill="currentColor"` or a class so CSS
  variables drive it. The app themes light and dark from tokens.
- **Body colours** come from two variables: a fill and a stroke. The whole figure
  uses only those two.
- **Every marker** needs `id`, a `data-route` of `im` or `sq`, and a `data-label`
  with the human-readable site name.
- **Accessibility:** each marker gets `role="button"` and `tabindex="0"`; the figure
  group gets `aria-hidden="true"` since it carries no information itself.
- **Weight:** under 25KB per view uncompressed. Optimise paths; no editor cruft, no
  `<metadata>`, no generator comments.
- **Both views identical in scale and registration** so switching between them does
  not shift the figure.

---

## What success looks like

Someone glances at their phone for one second and knows which site to use next,
without reading a word. The figure is calm and recedes; the markers carry all the
signal. It looks like it belongs in a considered medical-adjacent product, not a
clinical textbook and not a cartoon.
