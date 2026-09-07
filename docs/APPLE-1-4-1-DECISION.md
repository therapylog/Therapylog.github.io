# Guideline 1.4.1 — what actually clears it

**Written:** 5 September 2026, from five research angles on submission `898a4a18`.
**Evidence caveat:** the `procedure` angle was adversarially challenged (all six
of its inferred claims were refuted or narrowed). The other four angles
**were not** — their challenge agents failed on a session limit. Findings below
are marked accordingly. Anything labelled *inferred* has not been through a
refutation pass.

---

## 1. You cannot argue your way out. Documented.

Five independent first-hand developer threads (807508, 772732, 790653, 764700,
708478) show the same pattern: developers added disclaimers, stripped medical
wording, rewrote terms and privacy policies, asked for specifics — and received
silence, verbatim restatements of the same demand, or a redirect to the appeal
form. **No documented case exists anywhere of a semantic or classification
argument overturning a 1.4.1.**

Worse: the one documented approval (713352) came from *satisfying* the ask —
real FDA/FCC clearance plus storefront restriction — and that same developer's
sibling apps were later rejected again under 1.4.1 **while holding FDA, EU and
Anvisa clearances**. Holding real clearance does not reliably clear this
guideline.

The App Review Board appeal is real but there is no public evidence of it working
on 1.4.1, and you get **one appeal per rejection** — a hard budget. A phone call
is available but its value is diagnostic, not persuasive: a line reviewer cannot
waive a 1.4 safety guideline. Use a call to extract the *"Specifically, we
found…"* detail your letter is missing, not to make a case.

**The Terms-of-Use line asserting the app "is not a medical device" carries no
weight and may be actively counterproductive** — it invites the reviewer to check.

## 2. The genre is approvable. This binary is not. *(reported)*

Roughly ten near-identical apps are live on the US App Store right now: TRT and
steroid cycle trackers with dose logging and PK curves (*Anabolic Steroid & TRT
Tracker*, *Himcules*, *Trough*, *TRT AI* — the last ships a syringe/dose
calculator), AI lab-report interpreters (*Wizey*, *AI Blood Test Analyzer*,
*MedReport AI*), and lab trackers that flag results.

So it is not the compounds, and — importantly — **it is not the LOW/HIGH flag
either.** Live comparators do exactly that:

| App | What it does | Why it survives |
|---|---|---|
| LabResults Blood Test Log | flags NORMAL/LOW/HIGH | **against ranges the user enters** — arithmetic over user thresholds |
| Lab Tracker | user defines min/max per profile | same |
| Health3 | ships its own ranges | **attributes them** to studies/guidelines and concedes plurality |
| BloodTrends | bare LOW/HIGH against built-in ranges | **stops there** — never chains the flag to a drug |

The distinguishing principle across all of them: **the verb, and the source of
the number.** They *record* and *chart*. They do not *output a recommendation*.

## 3. The specific thing that flipped the reviewer *(inferred, but strongly reasoned)*

**The 12 side-effect playbooks.** Specifically the pattern:

> "High prolactin → cabergoline is the commonly used dopamine agonist; literature
> dosing is typically 0.25 mg twice weekly, titrated on labs."

That single string is the one artifact in the app that is simultaneously:

1. **conditioned on the user's own measured value** — so no "educational
   reference" defence reaches it;
2. **a prescription in plain English** — a named Rx-only drug, a dose, a
   frequency, and a titration rule;
3. **quotable in one screenshot.**

Every other alarming-sounding feature in the app has a living App Store
counterpart. This one does not.

### The structural defect underneath it

Fixing the wording will not fix it. **Any navigation path from a user-specific
lab value to a named compound reconstitutes the advice**, sentence or no
sentence. FDA's General Wellness guidance draws the line in exactly this place:
a product may prompt the user to consult a professional when a value falls
outside a threshold, provided it makes no disease-specific or treatment-oriented
statement. An out-of-range flag terminating in *"take this to your prescriber"*
is defensible. One terminating in a compound page is a treatment-oriented output
however it is worded.

## 4. Where US law actually puts each feature *(unchallenged)*

- **Dose log and raw lab display** — non-devices under FD&C Act 520(o)(1)(D) and
  the MDDS rule.
- **Interaction checker and a properly cited compound reference** — FDA's
  published enforcement-discretion bucket.
- **Volume-from-dose calculator** — a simple calculator, *if the user supplies
  the dose*.
- **`classify()`** — **a device function.** 520(o)(1)(D) expressly carves out any
  function "intended to interpret or analyze clinical laboratory test or other
  device data, results, and findings." FDA told Whoop in July 2025 that
  estimating a physiological value is "inherently associated with the diagnosis"
  of the corresponding condition.
- **AI lab scanner** — the same problem with generative AI on top.
- **The side-effect playbooks** — patient-directed treatment recommendations.

## 5. Apple's real remedy list is wider than your letter *(documented)*

A reviewer reply reproduced in the forums lists **three** branches, not one:

1. regulatory clearance documentation;
2. **a report or peer-reviewed study demonstrating the app works as described**;
3. **restricting salable storefronts** in App Store Connect.

Your letter quotes only (1). That is the letter being generic boilerplate, not
the guideline being narrow. Note the same thread is a warning as much as a
reassurance — it records no confirmed approval.

## 6. The remediation, ranked by trigger likelihood × cost

| # | Feature | Action | Replacement |
|---|---|---|---|
| 1 | **Side-effect playbooks** | **delete the drug-and-dose response** | "This pattern is worth taking to your prescriber, with these lab values." No named drug, no dose. |
| 2 | **17 protocol templates** | **invert authorship — ship zero** | Users build their own from an empty state. The closest live comparator markets protocol *tracking*, not protocol *supply*. |
| 3 | **Lab → compound routing** | **cut the path** | An out-of-range flag may link to "what to ask your prescriber". It may not link to a compound page. |
| 4 | **`classify()`** | **cite every interval; stop silently adjusting** | "Free testosterone 4.1 ng/dL — above the interval quoted by [source] for [population]." Attribute, concede plurality, do not issue a verdict. |
| 5 | **PK curves** | **drop concentration units; cite half-lives** | Axis: "Relative modelled level (unitless)". Footer: "Modelled from a published elimination half-life (t½ = 4.5 d, source: […]). A mathematical curve, not a measurement of your blood." |
| 6 | **Interaction checker** | **delete the `monitor:` imperative, keep the flag, add a source** | "Documented interaction: A + B. Reported to affect […]. Source: […]." |
| 7 | **Dose tables** | **reframe as literature, cited** | Not "TRT / Starting". "Doses reported in [source]." |
| 8 | **Doctor reminder** | **raise density** | Currently 2 occurrences in 938 KB against an explicit written guideline obligation. |

## 7. The un-cited second exposure: 1.4.2

> **1.4.2** Drug dosage calculators must come from the drug manufacturer, a
> hospital, university, health insurance company, pharmacy or other approved
> entity, or receive approval by the FDA or one of its international counterparts.

**This is a provenance rule.** It asks *who you are*, not what you disclose.
Citations, disclaimers and wellness framing do nothing against it, and unlike
1.4.1 it has no "greater scrutiny" softener and no conditional clause. The
peptide dose calculator sits inside it.

The challenge pass refuted the comforting reading — that peptide calculators ship
freely so 1.4.2 must be dead letter. The honest position: enforcement is
**reactive and inconsistent**, so this is a live risk that has not yet been
cited against you, not a rule you have already passed.

This is why Epocrates and Medscape carry interaction checkers and independent
developers generally do not.

## 8. Sequence

1. **Do not reply to the open rejection with the current binary.** The AI lab
   scanner and `classify()` disprove a "not a medical device" claim in sixty
   seconds, and a failed reply spends goodwill and possibly your one appeal.
2. **Strip the interpretive layer first** — items 1–3 above are the ones with no
   reframe available.
3. **Then the sourcing layer** — items 4–8, which is the Phase 1 provenance work
   already planned.
4. **Resubmit a new build, with the reply attached to it**, describing what
   changed. Argue classification only from a binary that supports the claim.
5. **Consider storefront restriction** (Apple's branch 3) as a fallback lever.

## 9. What this costs, and what it does not

Losing: the side-effect playbooks, the shipped protocol templates, the lab→
compound path, and probably the dose calculator on iOS.

**Not** losing: the 131-compound encyclopedia, dose logging, bloodwork tracking
and charting, PK curves (reframed), the interaction flags, the AI assistant, or
the compounds themselves. The encyclopedia was never what Apple objected to.

**Android is very likely unaffected.** Google rejected on the health-apps
organization account, not on content, and Play has no 1.4.1 analogue — its
health policy governs declarations and data handling. So "cut it for Apple" and
"cut it for both stores" are different products, and the Android build can stay
fuller. Decide that deliberately.

## 10. Open questions for the owner

- Whether the side-effect playbooks are worth keeping on the **web** build. They
  are the app's most distinctive harm-reduction feature and no guideline reaches
  therapylog.app. The recommendation is to keep them there and drop them from
  store builds — which makes the store build a genuinely different product, not
  a re-skin.
- Whether to spend the one appeal, or go straight to a new submission.
- Whether to attempt Apple's branch 2 (peer-reviewed evidence) for the PK model
  specifically, since single-compartment first-order elimination *is* published
  pharmacokinetics and is the most defensible quantitative claim in the app.
