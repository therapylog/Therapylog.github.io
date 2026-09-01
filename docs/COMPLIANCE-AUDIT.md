# TherapyLog compliance cross-reference — opt-ins, notices, and disclosures

**Audited:** 1 September 2026
**Scope:** `therapylog.github.io` (13 public pages + `app.html`), `therapylog-api`
(all endpoints), `therapylog-app` (native shell), cross-referenced against
`Arctos-Labs`.
**Reason for the audit:** a white-labeled telehealth business is under consideration.
Everything below is worth fixing on its own merits; the telehealth column says what
changes if that goes ahead. The entity decision is in
[`BRAND-AND-ENTITY-STRUCTURE.md`](./BRAND-AND-ENTITY-STRUCTURE.md).

**Headline:** the privacy architecture is largely as advertised. I verified it:
`app.html`'s only outbound hosts are `therapylog.app`, `api.therapylog.app`,
`fonts.googleapis.com`, and two link destinations. No pixel, no Meta, no Google
Analytics, no Segment. Local-first is real, not marketing.

**But two of the promises made about it were not true**, and one of those — C-0 — is the
most serious thing in this audit. Both are now fixed in code; the rest of this document
records what was wrong, what changed, and what is still open.

**Status of each finding is marked `[fixed]`, `[partly fixed]`, or `[open]`.** Everything
marked fixed is in the diff that accompanies this document.

---

## Severity key

| | |
|---|---|
| **C** | Critical — fix before launch or before the next marketing push |
| **A** | High — a real legal exposure or a false statement to consumers |
| **B** | Medium — a gap that a regulator or plaintiff would use |
| **D** | Low / housekeeping |

---

## C-0 · The privacy policy promised an AI privacy switch that did not exist  `[fixed]`

**Where:** `privacy.html` (the claim) · `app.html` lines 2438, 2455, and `getFullCtx()`
(the reality)

**What the policy said, verbatim:**

> **General mode:** If you switch the assistant to General mode, none of your personal
> data is sent — only your typed question.

**What the code did.** `tl_ai_mode` had exactly two values, `"managed"` and `"byok"` —
both *billing* switches deciding whose API key pays. `grep -c "General mode" app.html`
returned **0**. And `sendChat()` sent `context: getFullCtx()` **unconditionally, in both
modes**, on every message.

`getFullCtx()` builds a payload headed `"COMPLETE USER HEALTH PROFILE:"` containing the
active protocol and compound list, the PCT plan, body composition with deltas, recent
weights, recent injections with dose and injection site, a normalised lab panel plus
prior panels, and recent symptoms with severity.

**So:** every user of the AI assistant transmitted a full hormone/AAS/peptide protocol
history and lab record to a third party, while the privacy policy told them a switch
existed to prevent exactly that.

**Why it matters.** This is the GoodRx / BetterHelp / Premom fact pattern:

- **FTC Act §5** — a false privacy representation is a deceptive practice.
- **FTC Health Breach Notification Rule** — as amended effective 29 July 2024, a "breach
  of security" expressly includes an *unauthorized disclosure*. A disclosure that
  contradicts the privacy representation the user relied on is unauthorized, which
  triggers notification to affected consumers and the FTC.
- **WA My Health My Data Act** — sharing consumer health data without the consent the
  Act requires, under a statute with a private right of action.

**What was done.** The honest fix was to build the control that was promised rather than
delete the promise, so:

- `tl_ai_personalize` is now a real, separate **privacy** switch, orthogonal to the
  billing switch. `sendChat()` sends `context: aiPersonalized() ? getFullCtx() : ""`.
- Personalized and General appear in AI → Settings under *"What is sent with your
  question"*, with copy that matches the policy word for word.
- Before health data leaves the device for the first time, a consent sheet names
  Anthropic as the recipient, links the policy, and offers General instead. The decision
  is recorded with a timestamp.
- `privacy.html` now describes both modes accurately and says where the switch is.
- `scripts/validate-compliance.js` fails the build if the policy promises General mode
  and the app does not implement it, or implements it without gating the payload.

**Still needs a decision from you:** whether the past disclosures require notification
under the HBNR. That turns on how many people used the assistant before today and is a
question for counsel, not for me. Pull the number from the Anthropic console usage and
the licence records before that conversation. This is the single item on this list worth
paying for an hour of advice about.

**Note on cycle data:** I checked whether reproductive health data was caught up in this.
It was not. Cycle entries live in `d.femcycle`, a separate array; `getFullCtx()` reads
only `d.entries` (types `bloodwork`, `body`, `medication`, `symptom`, `weight`) plus the
protocol, body composition, and lab payload. It never touched cycle data.

---

## C-1 · The "Verified" directory sold a legitimacy badge to sellers of unapproved drugs  `[fixed]`

**Where:** `providers/index.html:78–120`, `directory/index.html:111–142`

**Evidence, verbatim:**

- `directory/index.html:113` — *"Every clinic, supplier, and coach below has passed
  TherapyLog's verification process — licenses confirmed, products tested, credentials
  checked."*
- `providers/index.html` — *"How verification works … **The badge is earned, not
  bought.**"*
- `providers/index.html` — *"**The Verified badge builds trust.** In a space where
  sourcing trust is everything, the badge signals legitimacy to cautious customers."*
- `providers/index.html` — *"List your clinic, pharmacy, **peptide store**, or coaching
  practice…"*
- `directory/index.html:169` — `tierRank(t) { return t === 'featured' ? 0 : t ===
  'verified' ? 1 : 2 }` — placement is by paid tier. Basic ($49/mo) gets **no badge**.
- `directory/index.html:142` — *"listing fees can be offset by affiliate commissions."*

**Why it matters — three separate problems:**

1. **The badge literally is bought.** The page says "earned, not bought" while the tier
   that grants the badge is the tier you pay more for. Same page, direct contradiction.
   That is a straightforward FTC Act §5 deception, and it is the kind that reads badly
   because it is self-evident from your own pricing table.
2. **"Products tested" for a peptide seller is a claim you cannot support.** Research
   peptides are unapproved new drugs. Certifying their seller as Verified — for a monthly
   fee, explicitly to "signal legitimacy to cautious customers" — is materially different
   from publishing a neutral encyclopedia. Publishing dosing information is protected
   speech. Selling a trust badge to a distributor of unapproved drugs is not publishing,
   and it is the single riskiest asset in the estate.
3. **Two-way money with treating entities.** Providers pay you to be listed, and you pay
   providers 30% recurring for referred subscribers. Once labs are listed (the apply form
   has a "Lab Testing / Bloodwork" checkbox at `providers/apply.html:197`), EKRA
   (18 U.S.C. § 220) reaches it — an all-payor statute covering cash-pay lab referrals,
   under which the Ninth Circuit upheld a criminal conviction in 2025 for paying marketers
   on referral volume.

**Worse than I first thought: the directory was not empty.** `providers-data.js` carried
three worked examples under a `// delete once you add real partners` comment — but
`directory/index.html` reads `window.PARTNERS` and renders whatever is there. So
`/directory` was publicly serving three live listings, among them *"Example Peptide Co. —
Research-grade peptides"* carrying **COA Verified · Product Tested**, and *"Example Men's
Health & Peptides"* carrying **License Verified · DEA Registered**. Placeholder data in
the source is still a published endorsement once a page renders it.

**What was done:**

- The three example listings are gone. The template stays, commented out, with a note
  explaining why they cannot live in the array.
- "Products tested", "COA authenticity", and "The badge is earned, not bought" are gone
  from every page.
- "TherapyLog Verified" is retired as a badge. Cards now say **"Licence checked"** —
  which describes the only check that is actually performed — and featured cards say
  **"Paid placement"** where they used to say "★ Featured Partner".
- The directory hero now says, in the first sentence, that listings are paid advertising,
  that placement depends on the tier purchased, and that a listing is not an endorsement.
- "Peptide Research Supplier" is removed from the application form's business types, and
  the page states plainly that sellers of research chemicals, peptides, SARMs and
  prohormones are not listed — because we cannot check those products and will not put a
  marker on a listing that implies we did.
- The `providers/index.html` verification steps now describe the real check: the licence
  or certification number looked up on the issuing body's public register, confirmed
  active and unrestricted. *"That is the whole check. We do not test products, audit
  facilities, or assess clinical quality."*
- The affiliate commission is now described as what it is — a **software** affiliate
  program for TherapyLog Pro subscriptions — explicitly separate from the listing fee and
  explicitly not paid for patient referrals.
- `scripts/validate-compliance.js` fails the build if any of those claims return.

**Still open (yours, not code):** publish the verification standard as a real document —
what is checked, by whom, how often, and what revokes a listing — before the first paid
listing goes live. And keep listing fees flat and independent of referral volume.

**Telehealth impact:** if you launch your own clinic, you would be running a paid
"Verified" directory that lists your own competitor set. Self-preferencing plus paid
placement plus undisclosed common ownership is an FTC problem on top of the above. Either
the directory publishes an ownership disclosure and objective criteria, or it goes.

---

## A-1 · No Washington My Health My Data Act consumer health data privacy policy  `[fixed]`

**Where:** missing entirely across the site.

**Why it matters:** MHMDA is the most dangerous privacy statute for this business and the
one nothing currently addresses. It regulates "consumer health data" broadly — hormone
therapy status, compound logs, and lab values all qualify. It has **no small-business
exemption**, and unlike every other state privacy law it carries a **private right of
action** through Washington's Consumer Protection Act. It requires:

- A **separate and distinct** consumer health data privacy policy, with its own
  prominently published link on the homepage. It cannot be a section of `privacy.html`.
- **Consent before collection**, and a **separate consent before sharing**. The AI
  assistant sharing protocol and lab context with Anthropic is sharing.
- A signed **authorization** with specified elements before any "sale."
- A geofencing prohibition around health facilities.

Note the Terms already reason about privacy law and reach only Texas —
`terms.html` §05: *"TherapyLog LLC is a small business … generally exempt from the full
requirements of the [TDPSA]."* That is a reasonable read of Texas law and it is also the
whole analysis. It does not reach Washington, and Washington is where the private right
of action lives.

**What was done:** `health-data-privacy.html` is a standalone Consumer Health Data
Privacy Policy, linked with its own distinct text — *"Consumer Health Data"* — from the
footer of every public page including the homepage. It enumerates the data categories
(naming reproductive and wearable data explicitly), the sources, the purposes, the single
processor that receives any of it, the consent and withdrawal mechanics, the no-sale and
no-geofencing statements, the rights and appeal path with the Washington AG's complaint
address, retention, and the breach commitment. The consent step it describes is the one
built in C-0.

**Telehealth impact:** PHI held by a covered entity is carved out of MHMDA, but the
consumer app's self-logged data is not, and a hybrid product makes the boundary something
you have to be able to draw on demand. Another reason for the entity split.

---

## A-2 · Terms of Use and Privacy Policy contained statements that were not true  `[fixed]`

**Where:** `terms.html`

| § | Says | Reality |
|---|---|---|
| 01 | *"whether through the web app at therapylog.app, **the iOS application, the Android application**"* | `download.html:392`: *"Staying off the App Store and Play Store is deliberate."* `privacy.html`: *"There is no App Store or Google Play billing — TherapyLog is not listed in either store."* `docs/LEDGER.md` locks store listings as shelved. |
| 07 | *"**iOS subscriptions are managed through Apple** and subject to Apple's payment terms."* | There are no iOS subscriptions. All billing is Stripe. |
| 07 | Describes monthly and annual plans only | A **$34.99 lifetime** one-time purchase exists (`docs/LAUNCH-CHECKLIST.md`; `license.js` tier `standard: "Lifetime — one-time purchase"`), and BYOK tiers at $8.99/$89.99 are sold at `pro.html:145`. |
| 05 | Names **Upstash** as an infrastructure partner | `privacy.html` says *"We do not share your information with third parties except the processors named here (Anthropic … Stripe … Resend … Vercel)"* — Upstash is not among them, which makes that sentence false. |

A fifth, found while fixing the others: `terms.html` §05 stated that TherapyLog LLC
*"does not have access to, collect, store, or transmit your personal health logs …
to any server."* The AI assistant transmits exactly that, through `api.therapylog.app`,
en route to Anthropic. And §07 described the **lifetime** licence as a current plan; it
was retired on 24 August 2026 and `create-pro-subscription.js` now rejects the plan key.

**Why it matters:** these are representations in a binding consumer contract and in a
privacy policy. A false processor list is the kind of thing the FTC treats as a deceptive
practice, and inaccuracies here undermine the disclaimer and limitation-of-liability
clauses that are your main protection for the free content.

**What was done:** all six reconciled. §01 and §07 now describe the web/PWA product and
Stripe-only billing, with an explicit note that the Terms will be updated *before* any
store billing goes live (the API's Apple receipt path and the Capacitor shell exist, so
this is a real future, not a hypothetical). §05 now states the local-first rule and names
the AI assistant and lab scanner as the exception, in the same paragraph. §07 gains a
proper **automatic renewal** disclosure — plan, price, interval, renewal date, and the
one-message cancellation path — and describes the lifetime licence accurately as retired
but honoured. §05 names all five processors and points at the Privacy Policy as
controlling. `privacy.html` names Upstash and IP-based rate limiting.

**Two claims from the first pass that did not survive verification**, recorded so nobody
re-fixes a non-problem:

- *"fbclid/gclid/rdt_cid are passed to Stripe."* They are not. `tlCaptureAttribution()`
  stores them in `localStorage`, and `checkout()` sends only `{plan, billing, ref}`. The
  click ids never leave the device. The policy's wording was slightly generous —
  "the campaign name" understates what is stored — so it was tightened, but this is an
  accuracy fix, not an exposure.
- *"terms.html contains no arbitration clause"* — true, but that is a choice, not a
  defect. Wilson County venue with no class waiver is a defensible position for a
  one-person company and is left alone.

---

## A-3 · No consent event before health data left the device; no privacy link in the app  `[fixed]`

**Where:** `app.html` (the "Before you begin" gate), `therapylog-api/api/ai-research.js`

**What exists and is good:** a real blocking clickwrap gate. `checkOnboarding()` shows
it, `acceptDisclaimer()` persists `tl-disclaimer-done`, and the copy is solid —
*"TherapyLog is an informational and tracking tool only … By continuing, you confirm you
understand this and agree to the Terms of Use."* It links `therapylog.app/terms`.

**What is missing:**

1. **No privacy policy link — anywhere in `app.html`.** I grepped: exactly one legal link
   exists in the entire 8,656-line app, to `/terms`. The policy that explains that
   Personalized mode transmits your protocol and lab values to Anthropic is not reachable
   from the product that does it.
2. **No consent event before health data leaves the device.** The Personalized-mode
   toggle is a settings preference, not a consent. Under MHMDA this specific act — sharing
   consumer health data with a third party — needs its own affirmative consent.
3. **No age attestation**, though `terms.html` §04 requires 18+ and warrants it.
4. **No record of what was accepted.** `tl-disclaimer-done = '1'` stores no terms version
   and no timestamp, so a material change to the Terms cannot trigger re-acceptance and
   you cannot show which version a given user agreed to.

**What was done:** the gate now reads *"you confirm you are 18 or older, that you
understand the above, and that you agree to the Terms of Use and the Privacy Policy"*,
with both linked, and the button reads *"I am 18 or older — Continue"*. Acceptance is
stored as `{v, at, age18}` against a `DISCLAIMER_VERSION` constant, so bumping the
constant re-prompts everyone and the record shows which version each user accepted.
Anyone holding the old `'1'` record is re-prompted once, because they accepted a gate
that had neither the age attestation nor the privacy link. The AI consent sheet is
described in C-0.

---

## A-4 · Commercial email had no postal address and no unsubscribe link  `[fixed]`

**Where:** `therapylog-api/api/_lib/email.js`, the shared `wrap()` chrome

**Evidence:** the footer every message shares is:

> *"Questions? Just reply to this email, or write to hello@therapylog.app. TherapyLog is
> a tracking tool, not medical advice. Always involve your own clinician."*

`sendEmail()` posts to Resend with `from`, `to`, `subject`, `html`, `reply_to` — no
`List-Unsubscribe` header.

**Why it matters:** CAN-SPAM (15 U.S.C. § 7704(a)(5)) requires a **valid physical postal
address** and a **clear, conspicuous opt-out mechanism** in every commercial email.
The welcome email promotes the guide and the Pro tier, so it is commercial, not purely
transactional. Statutory damages run per message. Resend's broadcast tooling adds an
unsubscribe to *broadcasts*; these direct sends bypass it.

Separately, `privacy.html` promises *"Every email has a one-click unsubscribe"* — which
is currently untrue of these messages.

**What was done:** `wrap()` carries the postal address (`POSTAL_ADDRESS`, env-overridable)
and an unsubscribe link on every message, and `sendEmail()` sets `List-Unsubscribe` and
`List-Unsubscribe-Post: One-Click` — which Gmail and Yahoo require of bulk senders
independently of CAN-SPAM. The link is per-recipient and HMAC-signed, so the new
`api/unsubscribe.js` endpoint can act on one click without becoming an
address-enumeration tool; it handles both the mailbox provider's one-click POST and a
human clicking the footer, and treats "not on the list" as success. Both new env vars are
documented in `ENV-VARS.md` and `validate-env-doc.js` enforces it.

---

## A-5 · Email opt-in captured no consent evidence  `[fixed]`

**Where:** `api/launch-notify.js`, `index.html:258–274`, `download.html:394`,
`pro.html:126`

**Evidence:** `addContact()` sends Resend only `{ email, unsubscribed: false }`. The
`source` field is parsed at line 106 and echoed back at 148 but never stored. No
timestamp, no IP, no page, no double opt-in.

The form copy is honest but thin — `index.html:263`: *"Join the TherapyLog community.
We'll send occasional updates when we add new compounds or ship new features. No spam —
unsubscribe anytime."* and `:273` *"No spam, ever."* There is **no privacy policy link at
the point of collection** and no statement that the address goes to Resend.

**Why it matters:** if a subscriber ever complains, you have no record that they signed
up — no date, no source, no IP. That record is the entire defense under CAN-SPAM and
under every state privacy law's consent requirement, and it is one line of code.

**What was done:** `launch-notify.js` now writes a consent record onto the Resend contact
— the form it came from, an ISO timestamp, and the client's IP truncated to its network
prefix (`/24` or `/48`). Enough to show a real, distinct signup; not a full identifier for
someone who has so far given us only an email address.

**Still open:** a privacy link under each signup form, and a decision on double opt-in for
the newsletter.

---

## B-1 · Terms were linked from only one page  `[fixed]`

**Where:** `pro.html`, `download.html`, `partnership.html` — and `terms.html` and
`privacy.html` do not link to each other.

**Correction to my first pass:** I initially reported that the checkout pages carried no
legal links at all. That was a bad grep — it matched only root-relative `href="/privacy"`,
and most pages use the absolute `https://therapylog.app/privacy`. **Privacy was linked on
10 of 12 public pages.** The real gap was narrower and still worth fixing: **Terms was
linked from `guide.html` and nowhere else**, including both checkout pages.

**Why it matters:** ROSCA and the state automatic-renewal laws require the material terms
to be disclosed clearly and conspicuously *before* the charge, and a clickwrap you cannot
show the user saw is a clickwrap that does not enforce.

**What was done:** every public page's footer now carries Privacy · Consumer Health Data ·
Terms, and `validate-compliance.js` checks all three on all eleven public pages, accepting
either link form.

---

## B-2 · No breach-notification commitment  `[fixed]`

**Where:** `privacy.html` — absent.

The FTC Health Breach Notification Rule, as amended effective 29 July 2024, applies to
health apps not covered by HIPAA, and its definition of "breach of security" expressly
includes an **unauthorized disclosure** — a voluntary sharing or sale to a third party
counts, not just an intrusion. GoodRx and Easy Healthcare are the enforcement precedents.

Local-first architecture makes an actual breach unlikely, which is the point: say so.

**What was done:** `privacy.html` gains a *"What we hold, and what we'd have to tell you
about"* section, and the consumer health data policy carries the same commitment. Both
say plainly that the only personal data on the servers is an email address, a
subscription record and a licence key — so there is very little to lose — and that
notification would go to consumers, the FTC, and where required the media.

Note the interaction with C-0: the HBNR's *unauthorized disclosure* limb is why C-0 is a
notification question and not merely a copy fix.

---

## B-3 · No CCPA/CPRA section, no GPC, no GDPR position  `[open]`

**Where:** `privacy.html` — absent.

Missing: a CCPA/CPRA **sensitive personal information** notice and right-to-limit; a "Do
Not Sell or Share My Personal Information" link; Global Privacy Control handling; a
state-rights section covering the comprehensive privacy laws now in force; and any GDPR
position for EU/UK visitors (Article 9 explicit consent for health data). Decide whether
to comply or to geo-block, then write it down — silence is the one option that helps
nobody.

`privacy.html` does say *"We do not sell your personal data"*, which is the substantive
answer and is worth keeping front and centre. The gap is the mechanics.

---

## B-4 · The affiliate program has no claim controls  `[open]`

**Where:** `therapylog-api/affiliates.json`, `partnership.html`

No affiliates are enrolled yet (`"affiliates": {}`) — so this is free to fix now and
expensive to fix later.

Under the FTC's 2023 Endorsement Guides an advertiser is responsible for its affiliates'
claims. Affiliates promoting a TRT/peptide tracker to a TRT/peptide audience will make
health claims unless told not to. `partnership.html` currently sets commercial terms and
nothing else.

**Fix:** borrow the model Arctos already has. `Arctos-Labs/legal/arctos-claim-substantiation-binder.md`
§6 specifies an approved-claims appendix, a clear-and-conspicuous #ad requirement, a
no-medical-claims clause with immediate termination, a ban on condition testimonials,
annual re-acknowledgment, and a logged monthly spot-check. That is a good program. Point
the TherapyLog affiliate agreement at the same structure.

---

## B-5 · The compound encyclopedia recommends drugs for lab values  `[open]`

**Where:** `app.html` — the side-effect workflows; `app.html:8593`; the AI system prompt.

Examples: elevated prolactin → cabergoline; elevated estradiol → choose an aromatase
inhibitor; PCT protocols specifying enclomiphene 25 mg/day for 6–8 weeks.

Disclaimers are present and well-placed (`app.html:2253`, `:8593`, the AI response
footer). But note where the line sits. FDA's Clinical Decision Support guidance and the
21st Century Cures Act §3060 exclusion turn on whether the software provides a
*recommendation* for a *specific patient* that the user cannot independently review the
basis for. Generic reference information is outside FDA device jurisdiction. Software
that takes **your** lab value and names **a** drug and **a** dose moves toward the line.

Two design rules keep it clearly outside, and they are cheap:

1. Always show the basis — the source, the range, the reasoning — so a user can
   independently review it rather than simply rely on the output.
2. Frame as "what the literature and community practice describe" rather than "what you
   should do." The AI prompt already does this well with its three-tier evidence labelling;
   apply the same discipline to the static workflows.

**Telehealth impact:** this is the finding that changes character most. Reference software
plus a prescribing practice under one brand is no longer software presenting information —
it is a clinic recommending its own treatments. Under a separate brand, both stay clean.

---

## B-6 · Google Fonts loaded from Google  `[open]`

**Where:** `app.html` and every marketing page — `fonts.googleapis.com`.

Every page load sends the visitor's IP to Google. Self-hosting the four DM families
removes the only third-party request on a page that displays health data, and removes an
EU argument entirely. Half an hour of work.

---

## D-1 · Housekeeping

- `terms.html` effective 10 June 2026, `privacy.html` 8 June 2026 — both predate the
  entitlement, licence-key, and AI-metering work. Re-date on the next pass.
- `terms.html` §12 sets venue in **Wilson County** (Floresville); the Arctos RFQs give
  the founder's address as **Willis, TX** (Montgomery County). Different entities may
  legitimately have different addresses — just confirm each is the right registered
  address for its LLC.
- No arbitration clause. That is a deliberate-looking choice and defensible; just make
  sure it is deliberate.
- `directory/placeholder.txt` contains a stray `m`.
- **The Marketing Suite is served from the public web root behind a client-side PIN.**
  `marketing.html:164` — `var PIN = '070917';` — in a page anyone can fetch at
  `therapylog.app/marketing`. `noindex,nofollow` stops search engines, not people, and
  View Source shows the PIN. What is behind it is business intelligence, not customer
  data: the bizdev target list, competitor notes, affiliate mechanics, the marketing
  system prompt, and open legal to-dos. No API keys leak (those are entered at runtime
  and stay in the browser). Two things to do: pick a PIN that is not a date you use
  elsewhere, and move the page behind Vercel deployment protection or a separate
  non-public project. Low urgency, five-minute fix.
- **`provider-application.js` collects DEA and NPI numbers** from prescribers today,
  while `terms.html` §02 represents that TherapyLog is "not … a telehealth platform."
  Both can be true — a directory is not a telehealth platform — but keep them true. Do
  not let the directory drift into scheduling, intake, or anything that looks like
  facilitating care while §02 says otherwise. If the telehealth venture proceeds, it is a
  separate brand and entity and §02 stays as written; see
  [`BRAND-AND-ENTITY-STRUCTURE.md`](./BRAND-AND-ENTITY-STRUCTURE.md).

---

## What is done, and what is left

**Fixed in code with this audit** — C-0, C-1, A-1, A-2, A-3, A-4, A-5, B-1, B-2.
`scripts/validate-compliance.js` (62 checks, wired into CI as
`.github/workflows/validate-compliance.yml`) stops the four that are easiest to
reintroduce. Every other validator in `scripts/` still passes, and the API suite passes
231 assertions.

**Yours, not code — in order:**

1. **C-0 → talk to counsel about breach notification.** How many people used the AI
   assistant before today, and does the FTC Health Breach Notification Rule require
   notice? Bring the Anthropic console usage figures and the licence records. This is the
   one item on this list worth paying for an hour of advice about.
2. **C-1 → publish the verification standard** before the first paid listing goes live:
   what is checked, by whom, how often, what revokes it. Keep listing fees flat and
   independent of referral volume.
3. **B-4 → affiliate claim controls**, before the first affiliate enrols. Nobody is
   enrolled yet, so this is free today. Copy the structure from
   `Arctos-Labs/legal/arctos-claim-substantiation-binder.md` §6.
4. **A-5 → a privacy link under each signup form**, and a decision on double opt-in.
5. **B-3 → CCPA/CPRA section, GPC handling, and a GDPR position** (comply or geo-block —
   pick one and write it down).
6. **B-5 → the CDS framing pass** over the side-effect workflows.
7. **B-6 → self-host the fonts.**
8. **D-1 → the Marketing Suite PIN and page placement.**

**If telehealth proceeds:** all of the above, plus the separate-entity work in
[`BRAND-AND-ENTITY-STRUCTURE.md`](./BRAND-AND-ENTITY-STRUCTURE.md) §4, plus a HIPAA
Security Rule risk analysis and BAAs with every processor that touches PHI.

---

## Sources

- [FTC Health Breach Notification Rule](https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule) · [2024 final rule](https://www.federalregister.gov/documents/2024/05/30/2024-10855/health-breach-notification-rule) · [FTC guidance for health apps](https://www.ftc.gov/business-guidance/blog/2024/04/updated-ftc-health-breach-notification-rule-puts-new-provisions-place-protect-users-health-apps)
- [Washington My Health My Data Act — what it requires](https://www.goodwinlaw.com/en/insights/publications/2024/03/alerts-technology-hltc-my-health-my-data-act-mhmda) · [WA AG on consumer health data](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy)
- [EKRA: Ninth Circuit upholds conviction for paying marketers for referrals](https://www.venable.com/insights/publications/2025/07/ekra-has-teeth-ninth-circuit-upholds-lab-operators) · [EKRA and commission-based compensation](https://www.dorseyhealthlaw.com/how-ekra-and-aks-impact-laboratories-and-commission-based-compensation/)
- [FDA Clinical Decision Support Software guidance (Sept 2022)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)
- [FTC Endorsement Guides (2023)](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)

---

*Compliance analysis for internal planning, not legal advice. C-1, A-1 and A-2 are the
three worth putting in front of counsel.*
