# Lab Marker Registry

`MARKER_REGISTRY` in `app.html` is the normalization layer between a lab result
and everything the app does with it. Results arrive from three places — the
manual form, the photo/PDF scanner, and (later) a lab API — and all three go
through the same path:

```
raw result → resolveMarker() → normalizeValue() → classify() → buildPanel() → buildAIPayload()
```

The registry decides what a result *is*, what unit it is in, and which reference
range flags it. A silent mistake there puts a wrong number in front of someone
making a dosing decision, so it is guarded in CI the same way the encyclopedia
is: `scripts/validate-markers.js` (registry integrity) and
`scripts/validate-bloodwork-flow.js` (the app actually using it).

## The six rules

1. **LOINC is the primary key; names are a fallback.** Resolution order is
   `key → LOINC → normalized name/alias`. A wrong LOINC therefore degrades to
   name matching instead of silently mis-mapping.
2. **Unknown markers are never guessed.** They land in `panel.unmapped` and are
   recorded by `logUnmapped()` (read it with `getUnmappedLog()` in the console),
   so real payloads populate the registry rather than someone's memory.
3. **A reference range printed on the report always wins.** `LAB_REF` is the
   fallback for manual entry, where no lab range was captured, and anything
   flagged against it is marked `rangeSource: "registry-fallback"` with a caveat.
4. **Optimal bands are non-diagnostic and stay separate.** They live in
   `LAB_REF`'s `olo`/`ohi` (personalized per profile by
   `getAdjustedLabRanges()`), are surfaced as `optimal`, and never merge into
   `status`. A value can be in-range and sub-optimal at once.
5. **Assay method is a first-class field.** Total T by immunoassay and by
   LC/MS-MS are not interchangeable; neither are standard and sensitive E2. Total
   T, Free T, Estradiol and LDL have method pickers on the form, the scanner
   reads the method off the report when it is printed, and a marker with no
   method reads `assayUnknown`.
6. **The AI is told what was *not* tested.** `buildAIPayload()` emits an explicit
   `NOT TESTED in this panel: …` constraint (built from markers the previous
   panels had and this one doesn't) so the model cannot infer a marker that was
   never drawn.

## Units

`canonicalUnit` is what the app stores and charts, and it always equals the
`LAB_FIELDS` unit for that key — CI fails otherwise. `units` maps a reported unit
onto the canonical one (a number multiplies; a function transforms, e.g. HbA1c
IFCC→NGSP). Two failure modes are deliberate, not oversights:

- `noConvert` — units with no valid conversion at all. Lp(a) in mg/dL vs nmol/L
  (particle size varies) and an absolute neutrophil count vs a percentage are
  refused, never approximated.
- An unrecognized unit is refused too. `normalizeValue()` returns
  `{ok: false, reason}`, the value is left out of the panel, and the scanner
  tells the user to enter it by hand. A blank field beats a nmol/L number sitting
  in a ng/dL box.

A value printed as a limit (`<5`) keeps its operator in `censoredAs` and is
disclosed to the AI as outside the assay's reportable range.

**Reference ranges ride the same transform as the value.** If a report is in
pmol/L, its printed interval is converted too — otherwise every converted marker
mis-flags. `scripts/validate-markers.js` asserts this with a known case.

## Provenance on a saved entry

A bloodwork entry gains an optional `labMeta`, keyed by marker:

```js
{ type: 'bloodwork', labs: { e2: 27.24 }, labMeta: { e2: {
    source: 'scan',            // scan | (absent for hand-typed)
    unit: 'pmol/L',            // as printed on the report
    refLo: 10.9, refHi: 43.58, // the lab's interval, in canonical units
    method: 'sensitive',       // picker value, else the report's wording
    converted: true, convertedFrom: '100 pmol/L',
    censoredAs: '<5',          // when the lab reported a limit
    editedAfterScan: true      // value was corrected by hand after scanning
} } }
```

Entries saved before this existed have no `labMeta` and fall back to `LAB_REF`
ranges — nothing to migrate.

## Adding a marker

1. Add the field to `LAB_FIELDS` (`id` must be `ll-` + `key`) and a range to
   `LAB_REF`, then add the input to the Lab Values markup.
2. Add the registry entry: `label`, `group`, `loinc`, `aliases`,
   `canonicalUnit` (identical to the `LAB_FIELDS` unit), `units`, and
   `noConvert` where a conversion would be invented rather than computed.
3. Do **not** put an `optimal` band in the registry — it is wired in from
   `LAB_REF`'s `olo`/`ohi`. Two copies would drift; CI fails on a mismatch.
4. Registry-only markers with no form field (Lp(a) today) need
   `extension: true`.
5. If the assay changes interpretation, declare `assay.variants` **and** add a
   `ll-method-<key>` picker whose option values are exactly those variants.
6. Run `node scripts/validate-markers.js && node scripts/validate-bloodwork-flow.js`.

## The LOINC caveat

⚠️ **The LOINC codes in the registry are an unverified seed.** They were written
from memory, not from vendor payloads, and have not been checked against the
LOINC database. Verify them against real payloads before trusting them for
routing — particularly before wiring up a lab API. The design limits the damage
(a wrong code falls through to name matching, and `logUnmapped()` surfaces every
gap), but "it resolved correctly in the app" is not evidence the code is right.
