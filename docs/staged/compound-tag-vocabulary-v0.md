# TherapyLog compound tag vocabulary — v1 (CLOSED)

This is a **closed vocabulary**. Never invent a tag. If a compound needs a
property not on this list, record it under `notes` instead and it will be
considered for v2.

Every tag exists because an interaction rule, a store-build filter, or a
protocol tool will consume it. A tag is a **property of the compound**, not an
opinion about it.

## Rule of application

Apply a tag when the property is **clinically meaningful for this compound at
the doses this app documents** — not when it is merely theoretically present.
Aspirin is not `hepatotoxic`. Superdrol is. Testosterone cypionate at TRT dose
is `lipid-suppressing` only mildly, but the app documents 300-500mg/week
performance dosing, so it qualifies.

When genuinely uncertain, **apply the tag**. A false positive produces an
unnecessary caution. A false negative produces a missing one. The asymmetry is
the whole point.

---

## A. Structural / class tags — what the compound IS

| tag | apply when |
|---|---|
| `aas` | An anabolic-androgenic steroid (any ester, any route) |
| `17aa-oral` | 17α-alkylated for oral bioavailability. **This is the hepatotoxicity driver** |
| `19-nor` | A 19-nortestosterone derivative (nandrolone, trenbolone and their esters) |
| `dht-derived` | Derived from / is a 5α-reduced androgen (drostanolone, stanozolol, oxandrolone, mesterolone, methenolone) |
| `sarm` | Selective androgen receptor modulator |
| `peptide` | A peptide or peptide analogue |
| `glp1` | GLP-1 receptor agonist, including dual/triple incretin agonists |
| `serm` | Selective estrogen receptor modulator |
| `aromatase-inhibitor` | Inhibits aromatase (steroidal or non-steroidal) |
| `gh-axis` | Acts on the GH/IGF-1 axis (GHRH analogues, GHRPs/ghrelin agonists, GH itself, IGF-1) |
| `thyroid-hormone` | Contains or is a thyroid hormone |
| `sympathomimetic` | Beta-agonist or CNS stimulant |
| `dopamine-agonist` | Dopamine receptor agonist |
| `5ar-inhibitor` | Inhibits 5α-reductase |
| `insulin-secretagogue-or-analogue` | Insulin itself, or drives insulin action/secretion directly |

## B. Risk / effect tags — what it DOES that a rule must warn about

| tag | apply when |
|---|---|
| `hepatotoxic` | Meaningful hepatic burden at documented doses |
| `hematocrit-raising` | Raises haematocrit / haemoglobin / RBC mass |
| `lipid-suppressing` | Meaningfully suppresses HDL and/or raises LDL |
| `bp-raising` | Raises blood pressure |
| `cardiotoxic` | Direct cardiac risk beyond BP (hypertrophy, arrhythmia, ischaemic risk) |
| `qt-prolonging` | Prolongs the QT interval |
| `aromatizing` | Converts to estradiol |
| `prolactin-raising` | Raises prolactin |
| `hpta-suppressive` | Suppresses the hypothalamic-pituitary-gonadal axis |
| `nephrotoxic` | Meaningful renal burden |
| `hypoglycemic` | Can cause or potentiate hypoglycaemia |
| `neuropsychiatric` | Mood, aggression, anxiety, insomnia or other CNS effects |
| `virilizing` | Significant virilization risk in women |
| `teratogenic` | Established fetal risk |
| `photosensitizing` | Increases photosensitivity or drives pigmentary/skin change needing monitoring |
| `gastric-emptying-delaying` | Delays gastric emptying |
| `immunosuppressive` | Suppresses immune function |
| `serotonergic` | Meaningful serotonergic activity |
| `electrolyte-disturbing` | Disturbs potassium/sodium/magnesium meaningfully |

## C. Interaction-mechanism tags — drive real drug-drug rules

| tag | apply when |
|---|---|
| `cyp3a4-substrate` | Cleared meaningfully via CYP3A4 |
| `cyp3a4-inhibitor` | Inhibits CYP3A4 |
| `cyp3a4-inducer` | Induces CYP3A4 |
| `warfarin-potentiating` | Potentiates warfarin / anticoagulants |
| `assay-interfering` | Interferes with lab immunoassays (e.g. biotin) |
| `absorption-sensitive` | Its own absorption is meaningfully altered by co-administered drugs/minerals/food |
| `nitrate-contraindicated` | Contraindicated with nitrates |

---

## D. Non-tag structured fields

**`store`** — the app-store build policy. Exactly one of:

- `"ok"` — ships in a store build as written.
- `"reframe"` — belongs in a store build, but **the entry text must be rewritten** to a clinical/reference frame before it ships: performance dose rows removed, cycle/stack language removed, indication stated as the approved or clinically-supervised one. Use this for compounds with a legitimate supervised medical use whose current entry is written for performance use.
- `"exclude"` — must not appear in a store build at all.

Judge against these platform rules, which are the operative ones:
- Google Play prohibits apps that **promote** unapproved substances, "irrespective of any claims of legality". Neutral reference that describes risk is a different posture from a protocol table with stack suggestions.
- Google Play specifically prohibits **hCG promoted in conjunction with anabolic steroids or weight loss**.
- Apple 1.4.3 prohibits apps that **encourage** consumption of illegal drugs or facilitate sale of controlled substances.
- Dietary supplements, OTC products, and FDA-approved drugs used for their approved indication are fine.

Default reasoning: Schedule III AAS and SARMs → `exclude`. Approved prescription drugs → `ok` or `reframe`. Supplements/OTC → `ok`. Research peptides → judge individually; a peptide with no approval anywhere but a large legitimate clinical-research literature and no performance framing is usually `reframe`, one whose whole documented use is performance enhancement is `exclude`.

**`dea`** — US DEA schedule as an integer (2, 3, 4, 5), or `null` if not federally scheduled. Note: AAS are Schedule III. SARMs are **not** federally scheduled (they are unapproved drugs, which is different) — use `null` and say so in notes.

**`aa`** — anabolic:androgenic ratio as `[anabolic, androgenic]` with testosterone = `[100, 100]`. Only for AAS and SARMs where a conventionally cited figure exists. `null` otherwise. These are assay-derived rodent figures with poor human correlation — if you supply one, note that it is the conventionally cited figure, not a measured human ratio.

**`notes`** — free text. Use it for anything the vocabulary can't express, for uncertainty you want recorded, and for the reason behind a non-obvious `store` call.
