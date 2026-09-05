# Compound tag dataset v0 — staged, NOT shipped

**Generated:** 5 September 2026. All 131 compounds tagged against the closed
vocabulary in `compound-tag-vocabulary-v0.md`, each batch adversarially audited
(35 corrections applied), then reviewed by a completeness critic.

**Do not write this into `app.html` as it stands.** It has four defects, three of
them mine. Fix them first, then generate `TL_TAGS`.

## What is here

| File | |
|---|---|
| `compound-tags-v0.json` | 131 records: `tags`, `store`, `dea`, `aa`, `notes` |
| `compound-tags-v0-audit.json` | the 35 audit corrections and the critic's findings |
| `compound-tag-vocabulary-v0.md` | the closed vocabulary the tagging ran against |

Store split: 27 `ok`, 73 `reframe`, 31 `exclude`. 40 of ~36 vocabulary tags used.

## Defect 1 — the uncertainty instruction over-fired  *(my error)*

The vocabulary said: *"When genuinely uncertain, apply the tag. A false positive
produces an unnecessary caution. A false negative produces a missing one."*

That asymmetry is right for anabolic steroids. Applied uniformly it produced
nonsense at the benign end:

| Compound | Tagged | Should be |
|---|---|---|
| Creatine monohydrate | `neuropsychiatric` | nothing |
| Taurine | `neuropsychiatric`, `hypoglycemic` | nothing |
| Glycine | `neuropsychiatric` | nothing — being a sleep aid is not a CNS risk |
| NAC / NALT | `nitrate-contraindicated` | at most a noted nitroglycerin interaction |

Aggregate rates confirm it: `neuropsychiatric` on 62 of 131 compounds (47%),
`teratogenic` on 49 (37%), `warfarin-potentiating` on 34 (26%), `cardiotoxic` on
38 (29%).

A `neuropsychiatric` tag on creatine does not produce "an unnecessary caution."
It produces noise that trains users to ignore the same tag on trenbolone —
exactly the failure the research brief identified when it found 30 of 53
interaction rules were `info`.

**Fix:** re-scope the asymmetry to the AAS/PED classes only, and add a
clinical-significance threshold to the vocabulary. Tags are for properties that
change what someone should do.

## Defect 2 — `hpta-suppressive` has no direction  *(my error, and the worst one)*

The critic caught this and it is a genuine vocabulary design flaw:

> `hpta-suppressive` is applied to the recovery TOOLS as well as the
> suppressants: `hcg2`, `gonadorelin`, `kissp` and `kisspeptin54` all carry it,
> identically to trenbolone.

The tag conflates *acts on the axis* with *suppresses the axis*. **A PCT builder
keyed on this cannot tell a suppressant from a recovery agent** — which is the
one distinction a PCT builder exists to make.

**Fix:** split into `hpta-suppressive` and `hpta-stimulating`, and add a
magnitude field. The critic's related finding stands: `trenace` ("near-total"),
`nandro` ("profound and slow-recovering") and `osta` ("minimal") currently
reduce to the same boolean.

## Defect 3 — no cross-batch consistency pass ran

The agent that would have caught inconsistency across the 11 batch boundaries
**failed on a session limit**. The critic independently confirmed the problem is
real:

> Six records are the same molecule (`tc`, `te`, `tprop`, `testsusp`,
> `sustanon`, `testpellets`) and they carry THREE different tag sets.

Also unreconciled: 6 records whose `store` field contradicts the store call
written in their own `notes` (the critic names `hcg2` — field `reframe`, notes
say `exclude`), and 5 whose `tags` contradict their notes.

**Fix:** re-run the consistency pass, then reconcile field-versus-notes conflicts
before any of this is machine-read.

## Defect 4 — the vocabulary is ahead of the database

`sympathomimetic` is applied to **zero** of 131 compounds, because clenbuterol,
albuterol, ephedrine and yohimbine do not exist in the encyclopedia yet. Two of
the intended interaction rules (clenbuterol + T3; AAS + stimulant cardiac load)
cannot be written until Wave 1 lands. That is expected, not a bug — but the
`assertTags()` guard must not fail the build on an unused tag until then.

## What the critic found that is worth acting on regardless

- **Route is not a tag.** "AI + oral AAS compounded HDL suppression" needs an
  `oral` marker. `TL_PK.medium` and `TL_FORM` carry route today but the rule
  layer cannot see them.
- **Interactions need direction.** `hematocrit-raising` has no
  `hematocrit-lowering` counterpart; `prolactin-raising` has no
  `prolactin-lowering`. Rules that pair a problem with its counter-agent cannot
  be expressed.
- **`assay-interfering` is too coarse** — immunoassay cross-reaction and true
  analyte shift are different findings and need an affected-analyte field.
- **`pct1` is not a compound.** It is a protocol stored in the compound shape,
  and it got tagged with the union of tamoxifen and clomiphene properties. It
  needs its own type.
- **Doses are unparsed free text.** `pct1`'s rows read
  `"Nolvadex 40/40/20/20/20/20mg + Clomid 50/50/25/25mg"`. **No PCT builder can
  read a taper out of that** — structured dose fields are a prerequisite for
  Phase 4.3, not a nicety.
- **`hepatotoxic` needs magnitude.** Stacked-oral hepatotoxicity is a severity
  rule and a boolean cannot express it.

## Verdict

The per-compound reasoning in `notes` is good and worth keeping — several entries
correctly explain why a tag was withheld (testosterone is deliberately not
`hepatotoxic` because injectables bypass first pass, and tagging it would dilute
the `17aa-oral` signal). The structure is sound. The calibration is not.

Treat this as a first draft with a good rationale trail, not as data to ship.
