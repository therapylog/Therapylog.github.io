# Spec — consumables, scheduling, and the cycle tracker

**Opened:** 5 September 2026. Design input on features raised but not built.
Nothing here is implemented.

---

## 1. One consumables model, not three

Inventory, the syringe counter and reorder links were raised separately. They
are one feature and should be built as one, because they share a model: **a
thing you have a quantity of, that depletes as you log, and that you need to
re-buy before it runs out.**

```js
{ id, kind: 'vial'|'syringe'|'needle'|'diluent'|'supply',
  label, qty, unit, perUse, reorderAt,
  vendorUrl, cost, addedTs }
```

Depletion differs by kind and that is the only branching needed:

| Kind | Depletes by |
|---|---|
| Vial | mg or IU drawn, from the logged dose |
| Syringe / needle | one per logged injection |
| Diluent | ml used at reconstitution |
| Supply (swabs, bac water) | one per injection, or manually |

Everything else — low-stock alerting, cost per month, days remaining, the
reorder prompt — is shared. Building them separately means three alert systems
and three settings screens.

**The link to the vial combo builder is the good idea here.** When someone
builds a stack in one vial, the app already knows the compounds, the
concentrations and the draw volume. That is exactly enough to decrement the
right vial *and* the right syringe on every logged dose, with no extra input.
The combo builder should write the consumable record as a side effect of being
used.

### Reorder links

User-pasted only. They paste the URL they actually buy from; the low-stock
alert surfaces it as a tap.

**Do not inject your own affiliate links into this.** You run an affiliate
program, so the temptation is real, and it fails on two counts: the FTC
endorsement rules require conspicuous disclosure at the point of the link, and
an app that steers a hormone user toward a specific vendor at the moment they
are low is a materially different product from one that remembers where they
shop. If you ever do want vendor placement, it belongs in the directory, where
the commercial relationship is already disclosed.

### Gating

Free: **five consumable records.** Enough to cover one real protocol — a vial,
syringes, needles, bac water, swabs — and genuinely useful. The sixth prompts.

That number is defensible rather than arbitrary: it is one complete kit. A free
tier that cannot hold one kit is a demo, not a free tier.

---

## 2. Protocol scheduling

The current model is `freq: { times, perWeek, days }`. It cannot express any of
what was asked for. What real protocols need:

| Pattern | Example |
|---|---|
| Interval dosing | every third day, independent of weekday |
| On/off cycling | 5 on, 2 off — for GH secretagogues |
| Staggered start | compound B begins in week 4 |
| Fixed-length runs | orals for 6 weeks inside a 16-week protocol |
| Taper | 40/40/20/20 across four weeks |
| Multi-daily | 2× or 3× daily, at set clock times |
| Blast and cruise | dose changes at a phase boundary, same compound |

Proposed shape — a schedule is a list of rules, evaluated per day:

```js
schedule: [
  { compound:'Testosterone Cypionate', dose:'100mg',
    every:{ days:3.5 }, from:'week 1', to:'week 16' },
  { compound:'Oxandrolone', dose:'20mg',
    times:['08:00','20:00'], from:'week 1', to:'week 6' },
  { compound:'Ipamorelin', dose:'200mcg',
    times:['22:00'], pattern:{ on:5, off:2 } },
  { compound:'Tamoxifen', taper:['40mg','40mg','20mg','20mg'],
    per:'week', from:'week 19' },
]
```

Everything the app already does downstream — adherence, refill maths, the PK
curve, reminders, the calendar export — reads "what is due on day N", so it all
keeps working if that one function is taught the new rules.

**Sequence this before the PCT builder.** A taper is a schedule, and building
the PCT tool on a scheduler that cannot express `40/40/20/20` means building it
twice.

---

## 3. The cycle tracker is the biggest unclaimed opportunity here

Right now it is a protocol timeline that happens to be called a cycle tracker.
For women it should be a menstrual cycle tracker, and the app is unusually well
placed to build one: it already ships six female protocol templates, BHRT
support, and 101 lab markers.

**The differentiator nobody has.** A dedicated period tracker knows the cycle
and nothing about hormone therapy. A TRT app knows the therapy and nothing about
the cycle. TherapyLog can hold both, which means it can show a woman her
estradiol panel *against the day of her cycle it was drawn on* — and that single
alignment is the thing that makes a panel interpretable at all. Draw the same
marker on day 3 and day 21 and you get two different numbers from one physiology.

To be credible against a real cycle tracker it needs: period start and end, flow,
predicted next cycle from her own history, the fertile window, symptom logging
mapped onto phase, and cycle-length variability. That is table stakes, not
differentiation — but without it the feature is not competitive and she will keep
a second app.

Then the parts only this app can do:
- **Lab panels stamped with cycle day**, and trends grouped by phase rather than
  by date. This is the feature.
- **Protocol adherence against cycle phase** — cyclical progesterone is dosed on
  specific days, and the app should know whether she took it on them.
- **Symptom patterns by phase** rather than by week.
- **The clinical report carrying cycle day on every panel**, which is what makes
  it useful to a gynaecologist or a prescriber.

Premium, and the strongest candidate on this list for a distinct value story:
it reaches an audience the rest of the app does not, and it is defensible.

---

## 4. The PCT builder

Yes, gate it — that was never in question. The reason its feature key is not in
`TLTier` yet is that the guard added earlier fails the build for advertising a
feature with no call site behind it, which is exactly right. `pct_builder` goes
into `PAID` in the same commit that ships the builder.

Design constraints are already recorded in `RESTRUCTURE-PLAN.md` §3 — document
generator, not protocol generator; never a dose the user did not enter; every
path ends at a clinician. The scheduling work in §2 above is its prerequisite.

---

## 5. Suggested order

1. **Scheduling engine.** Unblocks the PCT builder, fixes adherence maths, and
   makes refill and PK correct for anything that is not a fixed weekly dose.
2. **Consumables.** Self-contained, immediately useful, and the combo builder
   already has the data to feed it.
3. **PCT builder.** On top of 1.
4. **Cycle tracker.** Largest build, and the only one that reaches a new
   audience rather than deepening the current one.

One caution on all four: each adds a settings surface and an alert type. The app
already has reminders, refill alerts and notification preferences in three
different places. Consolidate that before adding a fourth, or the next feature
lands on a pile nobody can configure.
