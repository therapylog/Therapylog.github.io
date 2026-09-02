# Brand & Entity Structure — where the telehealth business goes

**Decision date:** 1 September 2026
**Question asked:** Fuse Health and OpenLoop both offer a white-labeled telehealth
experience branded as mine. Does that need to be a third business, or can it run under
TherapyLog?
**Answer:** **A third brand and a third entity. Not TherapyLog, and definitely not Arctos.**

This document records the reasoning so it does not get re-litigated, and so the next
session — code, design, or marketing — inherits the decision rather than re-deriving it.

---

## 1. The three rails

| | Entity | What it sells | Regulatory frame |
|---|---|---|---|
| **1. Software** | TherapyLog LLC (Floresville, TX) | A tracking app and compound reference. $9.99/mo, $99.99/yr, $34.99 lifetime | FTC Act §5, FTC Health Breach Notification Rule, state consumer-health-privacy law. **Not** HIPAA. |
| **2. Supplements** | Arctos Nutrition LLC (Willis, TX) | Dietary supplements only | DSHEA, 21 CFR 101 & 111, FTC Health Products Compliance Guidance |
| **3. Telehealth** | **New — a third Texas LLC** | Brand + marketing + patient experience for a white-labeled clinical service | Texas CPOM, DEA/Ryan Haight, HIPAA (as a Business Associate), state medical boards, LegitScript |

Three rails, three risk profiles, three sets of counterparties. They do not belong in one
box.

---

## 2. Why not TherapyLog

This is not generic "keep your businesses separate" advice. It is specific to what is
actually in this repository.

### 2.1 The content makes co-branding unworkable

TherapyLog is not a TRT-adjacent wellness brand. It is a harm-reduction reference for
people using non-prescribed anabolic compounds, and it is good at that on purpose:

- `app.html` carries full cycle protocols. The Oxandrolone entry lists a "Strength Cycle"
  stack of *"Oxandrolone 60-80mg/day · Testosterone Cypionate 200-300mg/week · HCG 250IU
  2x/week during cycle."* That is supraphysiologic AAS use, not testosterone replacement.
  The Ligandrol entry prescribes a PCT: *"begin 1 week after last dose with enclomiphene
  25mg/day for 6–8 weeks."*
- The AI system prompt in `therapylog-api/api/ai-research.js` instructs the assistant to
  *"give complete, candid information — including for anabolic steroids and higher-risk
  PEDs,"* and to answer storage and reconstitution questions for oil-based injectables
  and ten-vial peptide kits, closing with *"your supplier's insert or COA overrides
  this."* That sentence presumes a gray-market supplier.
- `marketing.html` targets `r/PEDs` and `r/firstcycle` by name.

All of that is defensible for a publisher. **None of it survives contact with a licensed
prescribing practice sharing the same name.** Concretely, it breaks at five separate
gates, each of which is independently fatal:

1. **The white-label partner's compliance review and medical director.** No medical
   director signs off on being the clinical arm of a brand whose assistant explains how
   to store nandrolone.
2. **Malpractice / E&O underwriting.** Carrier applications ask what the business
   publishes. "Dosing protocols for non-prescribed Schedule III substances" is a
   declination or a very expensive quote.
3. **Google Ads.** Telehealth advertising requires LegitScript certification, and
   LegitScript and the platforms are specifically attuned to messaging that frames
   testosterone as a **performance enhancer** rather than a hormone treatment. The
   TherapyLog corpus is exactly that framing. Expect certification to fail, which means
   no paid search — the primary acquisition channel for every TRT telehealth business.
4. **State medical boards.** The clinicians' licenses are the asset at risk. A board
   looking at a testosterone telemedicine practice whose brand also publishes first-cycle
   content is the worst possible optics for the people whose licenses are on the line.
5. **Stripe.** Telemedicine is a *restricted business* requiring individual
   pre-approval, and payment for prescription medication must occur outside Stripe.
   Running it through the account that processes TherapyLog subscriptions puts the
   software revenue in the blast radius of a telehealth underwriting decision.

### 2.2 It also damages TherapyLog

The ledger already locks *"mission is harm reduction, not performance enhancement"* and
frames web-first as *"the integrity position."* TherapyLog's standing with its community
rests on being the neutral tool that doesn't sell you anything but software. The day
TherapyLog is the front door of a clinic, every compound page reads as a funnel, and the
credibility that took the whole build to earn is spent on one cross-sell.

There is a legal edge to this too. Detailed drug information published by a **publisher**
is protected speech. The same information published by a **prescribing enterprise** that
profits from hormone therapy starts to look like inducement rather than education. Do not
give a regulator that argument for free.

### 2.3 Terms of Use already says the opposite

`terms.html` §02 states, in a binding consumer contract:

> "It is not a medical device, electronic health record, clinical decision support
> system, **or telehealth platform**."

That sentence is correct today and is load-bearing for the whole disclaimer stack. Adding
telehealth under this brand means deleting it, which means rewriting §02, §03, §05, §06
and §11 and giving up the "we are not in the treatment business" position that protects
the free content.

---

## 3. Why not Arctos — harder no

Putting a testosterone practice under Arctos does precisely what
`Arctos-Labs/legal/arctos-claim-substantiation-binder.md` was written to prevent.

FDA reads **intended use** from the totality of a marketer's communications
(21 CFR 201.128; 21 CFR 801.4) — the other products the company sells, adjacent sites, the
audience addressed. Arctos already ships two SKUs that would flip meaning instantly:

- **BALANCE** — "estrogen metabolism support," DIM plus a grape seed extract whose own
  spec notes *"in-vitro aromatase activity,"* already carrying a mandatory *"not an
  aromatase inhibitor"* label statement.
- **CYCLE** — inositol 40:1, "hormonal support."

A supplement called BALANCE that supports estrogen metabolism, sold by a company that
also prescribes testosterone, is an aromatase-inhibitor adjunct marketed for hormone
therapy management. That is an unapproved drug claim built entirely out of context, with
nothing on the label having changed. It converts every Arctos SKU into an enforcement
target and forfeits the "not cycle support" refusal the RFQs make in writing.

Recorded as a permanent exclusion in
`Arctos-Labs/legal/arctos-scope-and-separation-policy.md` §2.2.

---

## 4. What the third entity actually is — and is not

The most important structural fact, which decides how much entity you need:

**In a white-label arrangement you are the brand licensee and marketer, not the medical
provider.** OpenLoop operates its own 50-state PC network; the client owns the brand
while OpenLoop runs the clinical and administrative operations. Fuse Health likewise
supplies provider review, prescribing workflow, and pharmacy fulfillment behind the
customer's brand. The patient's consent forms, the prescription, the Notice of Privacy
Practices, and the pharmacy label carry the clinical entity's name, not yours.

**Confirm this in writing before signing anything.** Ask both partners, in one email:

1. Which legal entity employs or contracts the prescribing clinicians, and who owns it?
2. Whose name appears on the patient consent, the Notice of Privacy Practices, the
   prescription, and the pharmacy label?
3. Do you support Schedule III testosterone prescribing, in which states, and through
   which pharmacies (503A compounding or commercial)?
4. Am I a Business Associate of your PC, a covered entity, or neither? Send the BAA you
   expect me to sign.
5. What advertising review, claim substantiation, insurance minimums, and indemnity do
   you require of me as the brand?
6. What are my obligations if the DEA telemedicine flexibilities lapse or narrow at the
   end of 2026?

Question 6 matters most. **Telemedicine prescribing of Schedule III controlled
substances — testosterone — without a prior in-person exam currently runs on a temporary
extension that expires 31 December 2026.** DEA and HHS issued a fourth temporary
extension covering calendar 2026, and DEA has signaled it intends to finalize the
"Special Registrations for Telemedicine" framework before that expires. The proposed
framework contemplates special registration, PDMP checks, data reporting, credentialing
and record retention. Do not build a business plan that assumes today's rules are
permanent; ask each partner what their plan is for 1 January 2027.

### 4.1 Texas corporate practice of medicine

Texas is a strict CPOM state: only physicians may own a professional entity that
practices medicine. The new LLC therefore **must not** hold the clinical practice. It is
the brand / management entity. Two workable shapes:

- **Preferred:** the partner's PC is the clinical entity. Your LLC signs a services and
  brand agreement with the partner. You never own a medical practice. Simplest, cheapest,
  and the reason to use a white-label partner at all.
- **Only if a partner requires it:** a friendly PC owned by a Texas-licensed physician,
  with a management services agreement to your LLC. If you go here, note that regulators
  and state AGs now look at operational reality, not the contract: management fees must be
  fair market value for services actually rendered, and the MSO must not control clinical
  protocols, prescribing, or provider hiring. Get a healthcare regulatory attorney to
  paper it. Do not template it.

### 4.2 Why a separate entity even though you are "just the marketer"

- **Ostensible agency.** A patient who believes "the brand" treated them will name the
  brand. Apparent-agency doctrine asks whether the entity represented, or acquiesced in
  the appearance, that the clinician was its agent, and whether the patient reasonably
  relied on that appearance. White-labeling is the deliberate construction of exactly
  that appearance. The entity holding the brand is the entity that gets sued — so make
  sure that entity is not also holding the app and the supplement inventory.
- **Insurance.** Software/media liability, supplement product liability, and medical
  professional liability are three different underwriting classes. Combined in one
  entity, you get the worst rate of the three, or a declination.
- **Payments.** Separate merchant accounts. Telehealth underwriting problems must not be
  able to freeze software revenue.
- **HIPAA.** Once you receive PHI from the PC, that entity is a Business Associate with
  Security Rule obligations and downstream BAAs. Keep that boundary at an entity line,
  not a folder line.
- **Exit.** Someone will eventually buy the software or the supplement brand. A clean,
  single-purpose entity sells. A holding company with a clinic bolted on gets a discount
  and a longer diligence.

### 4.3 Practical setup

Form a Texas LLC. Separate EIN, bank account, books, insurance, contracts, domain, email,
ad accounts, and Stripe account. Every relationship between the three companies in
writing at arm's length. Do not commingle — an alter-ego finding would collapse exactly
the protection you formed the entity to get. A holding company on top is optional and can
wait; three sibling LLCs are simpler to insure and to sell.

---

## 5. What you still get to keep

Separating the brands does not mean giving up the synergy. It means pricing it as an
arm's-length deal instead of assuming it.

| Permitted | Prohibited |
|---|---|
| The clinic **licenses TherapyLog** as its patient-facing tracking app — a real software deal, written contract, BAA, paid at fair market value | Shared login, shared account system, or shared customer database |
| The clinic appears in the TherapyLog directory **on the same published terms as everyone else**, with a conspicuous common-ownership disclosure | Preferential placement, a free or discounted listing, or a "Verified" badge the clinic did not earn under the same criteria as third parties |
| A single static "also from the maker of TherapyLog" credit line on an About page | Any clinic promotion inside the TherapyLog app, or health-data-driven targeting of TherapyLog users |
| Separate email lists, each with its own opt-in | Emailing TherapyLog users about the clinic without a fresh opt-in on the clinic brand |
| Separate domains, ad accounts, pixels, Business Managers, and social handles | Linking the ad accounts. Platform enforcement travels across linked assets; a steroid-content strike on one domain should not be able to take down the clinic's ad account |

**Do not put the clinic in the affiliate program, and do not take referral-volume
payments from clinics or labs.** The Eliminating Kickbacks in Recovery Act
(18 U.S.C. § 220) is an all-payor statute reaching cash-pay laboratory referrals, and the
Ninth Circuit upheld a criminal conviction in 2025 for paying marketers on referral
volume. This is the same reason the Quest/Labcorp reseller bundle idea in the Arctos
backlog needs a healthcare attorney before it is built.

---

## 6. Naming

Do not reuse TherapyLog or Arctos. Candidates, all men's-health/hormone-clinic
appropriate, none colliding with the existing brands' meaning. **Clear each one for
trademark and domain before committing — this list is a starting point, not a search
result.**

| Name | Note |
|---|---|
| Meridian Men's Health | "Meridian" is well-used in healthcare — clear carefully |
| Northgate Health | Neutral, clinical, expandable beyond men's health |
| Keystone Hormone Health | Descriptive, easy to explain |
| Baseline Health | Plays to the bloodwork-first positioning |
| Trailhead Health | Warm, Texas-friendly, not gym-coded |
| Anvil Health | Strong, masculine without being PED-coded |
| Latitude Men's Health | Clean, ownable |
| Cardinal Hormone Clinic | Traditional, credible |
| Foundry Health | Industrial, sober |
| Longview Health | Longevity-adjacent without the biohacker signal |

**Avoid** anything with *cycle, stack, peak, alpha, apex, elite, prime, max, beast*, or a
bear. Those read as bodybuilding, which is the association the clinic must not have — and
"PRIME" is already an Arctos SKU.

Register the domain, the trademark class 44 (medical services), and the social handles
before spending anything on the brand.

---

## 7. Sequence

1. Send the six questions in §4 to Fuse and OpenLoop. Their answers determine everything
   downstream, especially the answer to §4.1.
2. One session with a **healthcare regulatory attorney** (Texas CPOM + telemedicine +
   controlled substances). This is a different specialist from the FDA/DSHEA attorney
   Arctos needs. Bring: the two partner proposals, this memo, and the question of whether
   the TherapyLog directory can list your own clinic.
3. Name and trademark clearance.
4. Form the LLC. Separate everything per §4.3.
5. Insurance: professional liability (or confirm the PC's policy covers the brand as an
   additional insured), cyber, and media liability.
6. LegitScript certification for the clinic domain **before** building paid acquisition
   plans around it.
7. Only then build the site.

---

## 8. What does not change

- TherapyLog stays what it is: a neutral, local-first tracking tool with a candid
  encyclopedia and no product to push. That is the asset.
- Arctos stays supplements-only, per
  `Arctos-Labs/legal/arctos-scope-and-separation-policy.md`.
- The gray-market question is unchanged and is not the issue here. Not policing what
  users source is a defensible publisher position. What is **not** defensible is putting
  your own "Verified — products tested" badge on a peptide seller for a monthly fee. See
  `docs/COMPLIANCE-AUDIT.md` finding C-1.

---

## Sources

- [DEA, Fourth Temporary Extension of COVID-19 Telemedicine Flexibilities (90 FR, 31 Dec 2025)](https://www.federalregister.gov/documents/2025/12/31/2025-24123/fourth-temporary-extension-of-covid-19-telemedicine-flexibilities-for-prescription-of-controlled) · [DEA press release](https://www.dea.gov/press-releases/2025/12/31/dea-extends-telemedicine-flexibilities-ensure-continued-access-care) · [HHS telehealth policy](https://telehealth.hhs.gov/providers/telehealth-policy/prescribing-controlled-substances-via-telehealth)
- [DEA, Special Registrations for Telemedicine proposed rules (Jan 2025)](https://www.dea.gov/press-releases/2025/01/16/dea-announces-three-new-telemedicine-rules-continue-open-access)
- [Texas corporate practice of medicine overview](https://www.hchlawyers.com/blog/2026/june/texas-s-corporate-practice-of-medicine-prohibiti/) · [Friendly PC–MSO model](https://www.permithealth.com/post/the-friendly-pc-mso-model-for-corporate-practice-of-medicine-compliance) · [CPOM ownership structures 2026](https://djholtlaw.com/corporate-practice-of-medicine-is-your-ownership-structure-legal-under-2026-regulations/)
- [OpenLoop white-label telehealth](https://openloophealth.com/) · [Who is OpenLoop](https://openloophealth.com/blog/who-is-openloop-health) · [Fuse Health white-label case study](https://www.fusehealth.com/casestudies/how-a-lab-brand-launched-white-label-telemedicine-fast)
- [LegitScript telehealth advertising](https://www.legitscript.com/healthcare/certified-but-still-getting-disapproved-key-takeaways-from-our-telehealth-advertising-webinar/) · [Google prescription-drug ad enforcement](https://lengealaw.com/googles-prescription-drug-advertising-enforcement-what-your-business-needs-to-know/) · [LegitScript certification for telehealth](https://karpahealth.com/resources/legitscript-certification-telehealth-guide/)
- [Stripe prohibited and restricted businesses](https://stripe.com/en-br/legal/restricted-businesses) · [Telehealth on Stripe](https://bloomconsulting.agency/can-telehealth-providers-use-stripe-a-full-compliance-breakdown/)
- [DOJ Done Global prosecution — expanded criminal risk for telehealth platforms, MSOs and investors (Ropes & Gray, Jan 2026)](https://www.ropesgray.com/en/insights/alerts/2026/01/dojs-done-global-telehealth-prosecution-signals-expanded-criminal-risk) · [Done Global convictions](https://www.verrill-law.com/news/digital-health-company-executives-convicted-in-first-ever-federal-drug-distribution-prosecution-related-to-telehealth/)
- [EKRA: Ninth Circuit upholds conviction for paying marketers for referrals (Venable, 2025)](https://www.venable.com/insights/publications/2025/07/ekra-has-teeth-ninth-circuit-upholds-lab-operators) · [EKRA and commission-based compensation](https://www.dorseyhealthlaw.com/how-ekra-and-aks-impact-laboratories-and-commission-based-compensation/)
- [Ostensible/apparent agency in medical malpractice](https://drjfgconsulting.com/vicarious-liability-doctrines-in-medical-malpractice-ostensible-or-apparent-agency/)

---

*Business and structuring analysis, not legal advice. Items 1–2 in §7 are the ones that
must happen before money moves.*
