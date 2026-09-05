# Spec — the cycle tracker

**Opened:** 5 September 2026. Not implemented.
**Answers the design question that prompted it:** should it be "smart" and learn
her rhythm, or should analysis be triggered manually over a chosen window?

**Answer: both, split by kind. Prediction is passive and always on. Analysis is
manual and windowed.** The reasoning is in §2, because it decides the shape of
everything else.

---

## 1. Why this is the biggest unclaimed thing on the roadmap

A dedicated period tracker knows the cycle and nothing about hormone therapy.
A TRT app knows the therapy and nothing about the cycle. TherapyLog can hold
both, and that is not a small overlap — **it is the only place the two datasets
already live in one record.**

The app is further along than it looks: six female protocol templates, BHRT
support, and 101 lab markers with assay variants. What is missing is the cycle
itself.

And the payoff is specific. Estradiol, progesterone, LH and FSH are close to
uninterpretable without knowing the day of the cycle they were drawn on. The
same estradiol on day 3 and day 21 is two entirely different findings from one
physiology. Every one of those markers is already in `LAB_FIELDS`. Nothing
stamps them with a cycle day, so the app currently records the number and
discards the thing that makes it mean something.

---

## 2. Passive prediction, active analysis

**Prediction runs continuously and silently.** Next period, cycle length,
variability, fertile window. It is cheap, it is expected, and without it she
keeps a second app on her phone — at which point none of the rest of this
matters.

**Analysis runs when she asks, over a window she picks.** "Show me my last six
cycles." Three reasons it must not auto-run:

1. **It needs n ≥ 3 cycles to say anything true.** Firing it at cycle one
   produces noise, and noise teaches people to distrust a feature permanently.
   You get one chance at that first impression.
2. **A manual trigger is a moment of intent.** She asks a question and gets an
   answer. That is when an insight lands, as opposed to a card she scrolls past
   on a dashboard she has stopped reading.
3. **It is the safer posture.** Software that continuously volunteers hormone
   interpretations behaves like a monitor. Software that answers when asked
   behaves like a reference. Given the App Store 1.4.1 finding, that difference
   is not cosmetic.

### Do not call it smart, or AI, or learning

Call it **"your last six cycles."** The honest name is also the more credible
one, and it cannot over-promise a prediction it did not make. "Smart" invites
her to expect something the maths does not deliver, and the first wrong
confident prediction costs the trust the whole feature runs on.

---

## 3. The prediction maths — deliberately not machine learning

n is about twelve cycles a year. There is no training data here, and a model
would be a worse answer than the median.

```
lengths      = gaps between recorded period starts, most recent 6
predicted    = median(lengths)                 // median, not mean: one illness
                                               // or one missed log should not
                                               // move the estimate
variability  = median absolute deviation of lengths
nextStart    = lastStart + predicted
band         = ± max(1, MAD)                   // always a band, never a date
ovulation    ≈ nextStart − 14                  // the luteal phase is the stable
                                               // half; predicting forward from
                                               // the next period is more honest
                                               // than counting from the last
fertileWindow = ovulation − 5 … ovulation + 1
```

Rules that keep it honest:

- **Show nothing until three cycles are recorded.** Say why: "two more cycles
  and this can estimate."
- **Always render the band, never a bare date.** "Sep 28 – Oct 2", not "Sep 30".
- **Widen the band rather than hiding uncertainty.** If MAD is 6 days, say so.
- **Never predict through a gap.** If she stopped logging for two months, the
  estimate is stale and should say it is, not quietly extrapolate.

This is explainable in one sentence to a user, runs on-device, and needs no
server — which the local-first architecture requires anyway.

---

## 4. Table stakes

Not differentiation. Without these she will not adopt it, and the parts that
matter never get used.

- Period start and end, logged in two taps
- Flow (light / medium / heavy), spotting
- Cycle length history, with the current cycle's day number always visible
- Predicted next period, as a band
- Fertile window and predicted ovulation
- Symptom logging that maps onto cycle phase, not just onto a date
- Cycle-length variability, shown plainly

---

## 5. The differentiators — what only this app can do

Ordered by how much they matter.

1. **Lab panels stamped with cycle day.** Every panel records the day it was
   drawn on. The bloodwork trend view groups by phase — follicular, ovulatory,
   luteal — rather than by calendar date. **This is the feature.** It turns a
   scatter of estradiol values into a readable curve, and it is the single
   thing no competitor on either side can build.
2. **Cycle day on every panel in the clinical report.** What makes the report
   useful to a gynaecologist or a prescriber rather than merely tidy. A panel
   without a cycle day is a number a clinician has to discard.
3. **Protocol adherence against phase.** Cyclical progesterone is dosed on
   specific cycle days. The scheduling engine can already express that; the
   cycle tracker is what tells it which day it is.
4. **Symptom heatmap by cycle day.** Her own pattern over her own history —
   not a generic "typical PMS" overlay, which is the thing consumer trackers
   get wrong and women notice immediately.
5. **Phase-aware reminders.** "Day 14 tomorrow — progesterone starts." Only
   possible because the scheduler and the cycle model are in the same app.

---

## 6. Perimenopause mode

The clearest gap in the consumer market and directly adjacent to the audience
the BHRT templates already serve.

In the forties, cycles lengthen and become erratic. Consumer trackers keep
predicting with the same confidence and are repeatedly wrong, which is
distressing rather than merely inaccurate — a late prediction reads as a
pregnancy scare or a health scare.

Handling it properly:

- **Detect rising variability** from her own history rather than from her age.
  Nothing here should key off a birthday.
- **Widen the band and say why**: "Your last six cycles ranged 24–41 days. This
  estimate is wide because your cycles are."
- **Switch the language from prediction to observation.** Stop saying "your next
  period is"; start saying "here is what your cycles have been doing."
- **Surface the pattern as something to take to a doctor** — cycle length trend,
  variability trend, and the symptom record, in the clinical report. Not a
  suggestion, not a diagnosis. A record.

---

## 7. Data model

```js
cycles: [
  { start: '2026-08-12', end: '2026-08-17',
    flow: [{ day: 1, level: 'heavy' }, …],
    notes: '' }
]
```

Everything else is derived. Cycle day for any date is a lookup against the most
recent start on or before it; phase is a function of cycle day and predicted
length. Lab entries gain one field — `cycleDay` — computed at save time from the
record, and recomputed if she corrects a start date afterwards.

That last point matters: **a corrected start date must re-stamp the panels.**
Storing cycle day as a frozen number and never revisiting it is how this quietly
goes wrong three months in.

---

## 8. Free versus Pro

The line elsewhere in the app is capture free, analysis paid. Here that needs one
deliberate exception.

**Free:** period logging, flow, symptoms, cycle length history, **and
prediction.**

Prediction belongs in the free tier even though it is technically analysis,
because it is what makes the capture worth doing. A cycle log that does not tell
her when her period is coming is a diary, and she will use a real tracker
instead — and then none of the paid features have any data to work with. The
prediction is the retention hook that fills the record the paid features read.

**Pro:** cycle-day-stamped labs, phase-grouped bloodwork trends, the symptom
heatmap, phase-aware reminders, perimenopause analysis, and cycle day in the
clinical report.

That split gives away a good period tracker and charges for the thing no period
tracker can do.

---

## 9. Constraints

- **Not contraception.** The fertile window is derived from her own logged
  history and must never be presented as a basis for preventing or achieving
  pregnancy. Say so where it is displayed, once, plainly.
- **No pregnancy inference.** A late period has many causes. The app records
  that it is late and stops there.
- **Consistent with 1.4.1.** Phase grouping and cycle-day stamping are record
  keeping. "Your estradiol is high for day 21" would be interpretation, and is
  out of scope — the app shows the value, the day, and the trend, and the
  clinician reads it.
- **Local-first, as everything else.** Menstrual data is among the most
  sensitive categories a health app can hold, and several US state laws now
  treat it specifically. It stays on the device, it never reaches the AI unless
  she turns on Personalized, and the privacy copy should name it explicitly
  rather than leaving her to infer it from a general statement.

---

## 10. What not to build

- A social or community layer. Wrong app.
- Partner sharing. Wrong app, and a consent problem.
- Generic "what to expect in your luteal phase" content. She can get that
  anywhere, it dates badly, and it is interpretation the app does not need.
- Mood tracking as a separate system. The symptom log already does this; adding
  a parallel one splits her history in half.
