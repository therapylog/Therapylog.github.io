# Lab Marker Registry

`MARKER_REGISTRY` in `app.html` is the normalization layer between a lab result
and everything the app does with it. It holds **100 markers**, covering the core
panel plus the analytes comprehensive Quest/LabCorp-style reports usually print.
Anything beyond that is handled by user-defined markers (below), so a 100+
analyte panel logs in full.

Results arrive from three places — the manual form, the photo/PDF scanner, and
(later) a lab API — and all three go through the same path:

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

## Getting results in

Three routes, and every one of them ends in the same normalization path:

1. **Type them in.** The Lab Values form has a field per built-in marker, a
   filter box that searches labels, keys, aliases and panel names (so "sgpt"
   finds ALT), and per-marker assay pickers where the assay changes the reading.
   Manual entry is never a fallback path — it is the primary one, and the
   scanner is optional.
2. **Scan a photo, screenshot, or PDF.** The picker takes multiple files at
   once, so a six-page report goes up in one request; the camera button still
   snaps a single page. Images are downscaled to Claude's recommended 1568px
   long edge before upload (a phone photo drops from ~4MB to ~200KB), PDFs are
   sent whole as `document` content blocks — the only shape the Messages API
   accepts for a PDF — and the request is size-checked against the API's 32MB
   cap before the user waits on it. An undecodable or unsupported file is
   rejected at pick time, not silently dropped at send time.
3. **Accept what the scan found.** The scanner is asked for *every* result on
   the report: tracked markers by key, everything else as `extras`. Extras are
   resolved against the registry first (so "SGPT" lands in ALT), and whatever is
   left is offered as "add all N to my form".

## User-defined markers

A marker TherapyLog doesn't know is not a dead end. `d.customMarkers` holds
user (or scanner) definitions — name, unit, and optionally the lab's own
interval — keyed `cm_<slug>`:

```js
d.customMarkers = { cm_zonulin: { name: 'Zonulin', unit: 'ng/mL', lo: 0, hi: 40 } }
```

Values store in `labs` beside the built-ins, and `getAdjustedLabRanges()` merges
the definitions into the same range table, so the bloodwork grid, Trends, the
clinic summary and the AI context pick them up with no special-casing. What they
deliberately do **not** get:

- **No unit conversion.** The app has no conversion table for a marker it
  doesn't know, so the value is stored exactly as recorded.
- **No optimal band.** Inventing one would breach rule 4.
- **No implied validation.** Rows go to the AI flagged `userDefined`, with a
  constraint telling the model the unit and range are the user's own.

Naming one that the registry already tracks returns the built-in key instead —
you get the real field, with its units and range, rather than a duplicate.
Removing one that has history hides it from the form and keeps the definition,
so past panels stay readable.

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

Most of the time you don't need to: an unrecognized marker can be added from the
form (or accepted from a scan) as a user-defined marker. Promote it to a
built-in when the app should know its units and reference range.

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
6. If the female reference differs enough that the male range would mislead, add
   an override in `getAdjustedLabRanges()` (as `uricacid`, `iron`, `esr`, `dht`,
   `estrone` and `progesterone` do).
7. Run `node scripts/validate-markers.js && node scripts/validate-bloodwork-flow.js`.

`validate-markers.js` fails if a form field has no registry entry (it would go
`unmapped`), if units disagree with `LAB_FIELDS`, if an assay marker has no
picker, if the scanner prompt stops asking for units/ranges/methods/extras, or
if PDFs stop being sent as document blocks. `validate-bloodwork-flow.js` runs
`app.html`'s real functions behind a DOM stub — including a stubbed `fetch`, so
it asserts what actually leaves the browser.

## The LOINC caveat

⚠️ **The LOINC codes in the registry are an unverified seed.** They were written
from memory, not from vendor payloads, and have not been checked against the
LOINC database, and nine markers carry none at all (the validator warns and
lists them). Verify them against real payloads before trusting them for
routing — particularly before wiring up a lab API. The design limits the damage
(a wrong code falls through to name matching, and `logUnmapped()` surfaces every
gap), but "it resolved correctly in the app" is not evidence the code is right.
