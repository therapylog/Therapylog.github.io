# Feature inventory — what TherapyLog actually does

**Generated from the code, 5 September 2026.** Every number here was counted out
of `app.html`, not estimated. Re-count before reusing in an ad:

```
node -e "const A=require('./scripts/lib/app-source.js');const d=A.loadAppData();
console.log(Object.keys(d.byId).length,'compounds',d.INTERACTIONS.length,'rules')"
```

This exists because the app has more in it than one person can hold in their
head, and features nobody knows about convert nobody.

---

## The one-line version

> A dose log, a bloodwork record, and a 131-compound reference — that turn into
> a document your doctor will actually read.

## The positioning that matters

Do not sell the AI. It loses to a free chatbot on day one and loses harder every
model release. **Sell what a general assistant structurally cannot do**: it does
not know what you injected on Tuesday, it does not hold eight months of your
panels, and it cannot hand you a PDF for your endocrinologist.

The moat is accumulated personal state. It compounds with retention instead of
decaying with model releases.

---

## By the numbers

| | |
|---|---|
| Compounds | **131** across 30 classes |
| Pharmacokinetic profiles | **97** with published half-lives |
| Interaction rules | **53** — 9 danger, 14 warn, 30 informational |
| Lab markers tracked | **101** |
| Side-effect playbooks | **12** |
| Protocol templates | **17** (7 general, 4 specialist, 6 female) |
| Storage rule classes | 5, applied per compound |
| Public reference pages | 81 compound, 16 marker, 16 tool |

---

## Free forever

The line is **capture is free, analysis is paid**. Everything that gets data in
stays free, because a log you cannot fill is worth nothing to either of us.

- **Daily dose log** — every compound, dose, route and time
- **Manual bloodwork entry** — all 101 markers, unlimited panels
- **Body composition** — weight, body fat, lean mass over time
- **Compound encyclopedia** — what each of the 131 compounds is, what it does,
  what it costs you, regulatory status, storage and handling
- **Reconstitution calculator** — the real one, the same code the app runs
- **Dose reminders** — scheduled, and discreet if you want them to be
- **Interaction checker** — all 53 rules. Safety is never behind a paywall

## Pro

**Your record, analysed**
- **Bloodwork trends** — every marker across every panel, not just the latest
- **Between-panel analysis** — what you logged over exactly the interval a
  marker moved in, placed side by side, no causal claim made
- **Clinical report** — a document for your physician: trajectories, dose
  changes, logging gaps, coverage. Neutral by design; it presents, they decide
- **Symptom correlations** — what tracks with what, over time
- **Cost and supply tracking** — what a protocol actually costs, and when you run out

**The compound detail**
- **Dosing tables** — level, dose, frequency and duration, as reported in the literature
- **Stacking detail** — documented combinations, per compound
- **Steady-state modelling** — how far levels swing between doses, how much
  accumulates, how long steady state takes, and what changes if you split the
  same daily amount across two or three administrations

**Protocol and cycle**
- **Protocol templates** — 17 researched starting structures
- **Cycle tracker** — protocol timeline, phases, adherence
- **Refill alerts** — days remaining per compound, from what you have logged
- **Progress check-ins** — photos and measurements over time
- **Blood pressure log** — with staging
- **Symptom log** — category, severity, what you related it to

**AI (Pro tier specifically)**
- **Research assistant** — answers grounded in your own protocol and labs
- **Lab scanner** — photograph a panel, it fills the fields

---

## The five nobody knows about

These are built, they work, and they are almost never mentioned:

1. **101 lab markers with unit conversion.** Not a dozen. A hundred and one,
   with assay variants handled — sensitive versus standard estradiol, LC-MS
   versus immunoassay testosterone.
2. **Storage and handling per compound.** Reconstituted or not, fridge or
   ambient, how long it keeps, and whether it is light- or freeze-sensitive.
3. **Female protocol templates.** Six of them. Nobody in this category ships this.
4. **The side-effect playbooks.** Twelve worked responses to the things that
   actually go wrong, each ending at a clinician.
5. **Everything is on-device.** No account, no server copy of your protocol.
   The AI only receives your data if you switch it to Personalized, and the
   switch is real — it is checked in CI.

---

## Lines you can lift

> Your doctor gets one panel. You have eight months.

> Free chatbots know pharmacology. They do not know what you injected on Tuesday.

> 131 compounds. 97 half-lives. 53 interaction rules. One log.

> The reconstitution calculator on the website is the same code the app runs.
> Not a re-implementation — the same function, checked byte for byte in CI.

> Split a daily dose in two and total exposure is unchanged, but the peak drops
> and the trough rises. Oxandrolone swings 83% once daily and 58% split. That
> is the kind of question the app answers.

> It presents. Your physician decides. No app should do the second part.

---

## What not to claim

- Not a medical device, not clinical decision support, not a telehealth
  platform. `terms.html` §02 says so and the app must keep matching it.
- Nothing about accuracy or outcomes that the record cannot support.
- No App Store or Play Store availability. Neither listing is live.
- No "verified" or "certified" language anywhere — `validate-claims.js` fails
  the build on it, deliberately.
