# Is TherapyLog clear to promote?

**Asked:** 1 September 2026 — "I haven't run ads or pushed it much because I want to make
sure we're free of bugs as much as possible and ready to go."
**Short answer: yes, for the channels you already use — organic, forums, communities,
social. Two things to do first, both small. Paid ads are a separate question with a
separate answer, in §4.**

---

## 1. What was actually blocking you, and whether it still is

You had a real reason to hesitate, and it turned out to be better-founded than a general
nervousness. Two of the things found in this audit would have been genuinely bad to
discover *after* a growth push rather than before:

- **C-0** — the privacy policy described an AI "General mode" that did not exist, while
  the assistant sent a full protocol and lab history on every message. Growing the user
  base multiplies the exposure of a false privacy representation; that is the GoodRx
  pattern, and the FTC's interest scales with the number of people affected.
- **C-6** — six cardiovascular markers (LDL, triglycerides, ApoB, hs-CRP, fasting insulin,
  LDL-P) never flagged as sub-optimal, because their optimal floor is `0` and the check
  used `&&`. An LDL of 85 read "In Range". For an audience on testosterone and AAS, those
  are the six numbers that matter most, and the app was quietly reassuring people about
  exactly the wrong thing.

Both are fixed and both now have regression tests. Neither was findable by using the app —
which is why they survived your previous sweep.

**So: the instinct to wait was right, and the reason to wait is now gone.**

---

## 2. Two things to do before you push

**a. Decide the C-0 notification question.** Before today, people used the AI assistant
under a privacy promise the code did not keep. Whether that requires notice under the FTC
Health Breach Notification Rule turns on how many people it affected. Pull the number from
the Anthropic console and your licence records, and put it to a lawyer — it is one
question and probably one hour. Everything else here is yours to decide; this one is not.

If the answer is "notify", it is far better to do that at 200 users than at 20,000. That
is an argument for pushing *soon*, not for waiting.

**b. Merge and deploy this branch.** All of the above is on
`claude/telehealth-branding-structure-niharn` and none of it is live yet. Promoting the
currently-deployed build means promoting the version with C-0 and C-6 still in it.

That is the whole list. Nothing else on the backlog blocks growth.

---

## 3. What is not blocking, despite looking like it might

**The AAS and PED content.** Keep it. It is the reason the app is trusted by the people it
serves, and nothing in this audit asks you to cut it. Publishing accurate drug information
is protected speech, and doing it well — with the evidence tiers, the monitoring guidance,
and the "stop and seek help now" signs your AI prompt already requires — is a defensible
public-health position, not a liability you are getting away with.

Three things keep it that way, and all three are already true:

1. **You are a publisher, not a prescriber.** `terms.html` §02 says so explicitly. This is
   why the telehealth business has to be a separate brand — see
   [`BRAND-AND-ENTITY-STRUCTURE.md`](./BRAND-AND-ENTITY-STRUCTURE.md). The moment the same
   brand prescribes, the content stops being education and starts looking like inducement.
2. **You do not sell, source, or vouch for anything.** This is why the "Verified" directory
   had to go (C-1): selling a trust badge to a peptide seller was the one thing in the
   estate that crossed from publishing into vouching. It is the only place you were
   genuinely exposed, and it is now closed.
3. **The information is honest about its own limits.** That is what most of this audit's
   app-side fixes were: the interaction checker's blank result no longer reads as a safety
   clearance, the timing tool no longer claims to find correlations, the calculators say
   they only do the arithmetic you typed.

**Staying off the App Store and Play Store.** Correct, and for the reason you give. Apple
and Google would both require cutting the compound and dosing detail, and the ledger
already locks this as a deliberate decision. Web-first is not a limitation you are working
around; it is the thing that lets the product be what it is. Nothing here changes that.

---

## 4. Paid ads: different answer

Organic, forums, Reddit posts, community groups, and word of mouth — go. Paid advertising
is a separate decision and mostly is not available to you, for reasons that have nothing
to do with the audit:

| Channel | Status |
|---|---|
| **Organic / forums / social posts** | **Clear.** This is where your audience is anyway. |
| **Reddit Ads** | Worth testing. Your launch checklist already predicts creative rejections framed around performance enhancement — lead with harm reduction, as it says. |
| **Google Ads** | Effectively closed. Anything referencing prescription compounds, TRT, or peptides needs LegitScript certification, and the platforms specifically watch for testosterone framed as performance enhancement. Do not spend time on this. |
| **Meta / TikTok** | Expect rejection and account risk on the same grounds. |
| **Affiliates / newsletters / podcasts** | Open, and probably your best paid channel — **but** put claim controls in the affiliate agreement first (B-4). Nobody is enrolled yet, so this is free today and expensive later. The FTC holds the advertiser responsible for the affiliate's claims. |

The practical read: your organic strategy is not a fallback you settled for. Given the
category, it is the strategy. Budget the effort you would have spent fighting ad platforms
on affiliates and community presence instead.

---

## 5. Bug posture

Everything mechanical that can be checked, passes: 8 site validators, 7 UI checks, and the
API suite at 231 assertions. `validate-bloodwork-flow.js` is at 92 assertions, up from 68,
with the 20 new ones covering the two classifier bugs.

Honest limits on that statement:

- **`validate-marketing.js` does not run** — it needs `playwright-core`, which is not
  installed. Predates this work; worth fixing, not a blocker.
- **These are static and unit checks, not a user walking through the app.** The bugs found
  here were both in classification logic, which is exactly what tests catch. A layout
  problem on a specific phone, or a flow that dead-ends, would not show up.
- **The two bugs found were of the same shape** — a boolean test reading a numeric bound
  for truthiness, and an OR chain in the wrong order — and both failed in the reassuring
  direction. If you want one more sweep before pushing hard, that shape is where to look:
  every other place the app decides "is this number OK".

---

## 6. Summary

- Merge and deploy this branch.
- Put the C-0 notification question to a lawyer.
- Then promote through the channels you already use, without hesitation.
- Set up affiliate claim controls before enrolling the first affiliate.
- Do not spend effort on Google or Meta ads.
- Keep the content, keep the audience, stay off the stores.
