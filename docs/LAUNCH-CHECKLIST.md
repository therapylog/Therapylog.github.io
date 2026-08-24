# Launch checklist — the parts only you can do

Everything in code is done and on branches. This is the dashboard work: Vercel,
Stripe, Resend, DNS, ads. Roughly **60–90 minutes**, and the order matters —
each section depends on the one above it.

Branches to merge when you're ready:

- `therapylog/therapylog.github.io` → `claude/therapylog-marker-registry-rd6hia`
- `therapylog/therapylog-api` → `claude/entitlements-and-delivery`

---

## 1. Vercel env vars — do this BEFORE merging the API branch

Vercel → **therapylog-api** → Settings → Environment Variables (Production).
The new code fails closed, so a missing variable means AI is off rather than
free.

- [ ] `LICENSE_SECRET` — paste a long random string. **Set this first.** Without
      it, keys are derived from your Stripe secret key, so rotating that key
      would change every customer's license key.
- [ ] `STRIPE_LIFETIME_PRICE` — the $34.99 one-time price id
      (`price_1TdjGQFwxOceIOZwj1sMdk0F` is the one in your Stripe account)
- [ ] Confirm these already exist: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
      `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `ANTHROPIC_API_KEY`,
      `STRIPE_PRO_MONTHLY_PRICE`, `STRIPE_PRO_ANNUAL_PRICE`,
      `STRIPE_BYOK_MONTHLY_PRICE`, `STRIPE_BYOK_ANNUAL_PRICE`
- [ ] Check whether `UPSTASH_REDIS_REST_URL` / `_TOKEN` are set. **If they are
      not, AI usage is currently uncapped** — the old limiter failed open. The
      new code falls back to counting on the Stripe customer, which works, but
      Upstash is faster and cheaper. Free tier at upstash.com is plenty.
- [ ] Optional: `AI_EFFORT` (default `medium`), `AI_MAX_TOKENS_CHAT` (4000),
      `AI_MAX_PER_MONTH` (145), `OWNER_EMAIL`

**Sonnet 5 cost check.** At the 145/month cap, a heavy Pro user costs roughly
**$5–7/month** in API spend against $9.99 revenue (Haiku was ~$1). Most users
won't come close, but if you're paying a 25% affiliate commission on Pro, a
maxed-out user is close to break-even. Watch it for two weeks in the Anthropic
console; if the average lands above ~$4, drop `AI_MAX_PER_MONTH` to 100 or set
`AI_EFFORT=low` for the scanner.

## 2. Stripe webhook

Stripe → Developers → Webhooks.

- [ ] Open the endpoint for `https://api.therapylog.app/api/webhook` and set the
      events to exactly: `checkout.session.completed`,
      `customer.subscription.updated`, `customer.subscription.deleted`,
      `invoice.payment_failed`, `payment_intent.succeeded`
- [ ] **Delete the duplicate endpoint** pointing at
      `therapylog-api.vercel.app` — two endpoints means two of every email
- [ ] Archive the orphaned prices so nobody buys a ghost: the old $7.99/mo and
      $59.99/yr under the archived "TherapyLog Pro" product
- [ ] Reactivate the product holding the $34.99 lifetime price (the product is
      archived; the price is still active, which is a confusing state)

## 3. Resend

- [ ] Confirm `therapylog.app` is still verified (Domains)
- [ ] Send yourself a test: buy the lifetime plan in Stripe **test mode** and
      check the license email arrives, reads well on a phone, and that the copy
      to `hello@therapylog.app` lands in Gmail
- [ ] Create a Broadcast audience view for the weekly blog / monthly newsletter
      (the audience is already filling from every signup form)

## 4. Move the site to Vercel (this is what turns analytics on)

Vercel Web Analytics only collects data when the page is served by Vercel. The
script is already on all 13 pages, harmlessly 404ing until then.

- [ ] Vercel → **therapylog-github-io** → connect it to
      `therapylog/therapylog.github.io`, production branch `main`
- [ ] Deploy once and check the preview URL renders the site
- [ ] Add domains `therapylog.app` and `www.therapylog.app` to that project
- [ ] In your DNS: replace the four GitHub Pages A records (185.199.108–111.153)
      with the A record Vercel gives you, and point `www` at Vercel's CNAME
- [ ] Leave the `CNAME` file in the repo — harmless, and it keeps GitHub Pages
      working as a fallback while DNS propagates
- [ ] Vercel → Analytics → enable **Web Analytics** (and Speed Insights if you
      want load timings)
- [ ] After propagation, confirm `curl -I https://therapylog.app` shows
      `server: Vercel` instead of `GitHub.com`

## 5. Verify the money path end to end (test mode first)

- [ ] Stripe test mode → buy **Pro monthly**. You should land back in the app
      already unlocked, see your key on screen, and get the email.
- [ ] Enter the key on a second browser profile → Profile shows the plan
- [ ] Cancel the test subscription in Stripe → reopen the app tomorrow (or clear
      `tl_ent.verifiedAt`) → AI features switch off and a lapse email arrives
- [ ] Try the AI assistant with **no** license → it should refuse, and nothing
      should appear in your Anthropic usage
- [ ] Switch to live mode and buy one real lifetime license yourself ($34.99 to
      your own card) as a production smoke test

## 6. Ad tracking

- [ ] Tag every link you post. Reddit: `?utm_source=reddit&utm_medium=cpc&utm_campaign=NAME`.
      Facebook: `utm_source=facebook`. Influencers: `?ref=THEIRCODE`.
- [ ] The campaign is stored on first touch and travels to Stripe as `ref`, so
      Stripe → Payments shows which campaign produced each sale. No pixel needed
      for that part.
- [ ] Reddit Ads → install the Reddit Pixel if you want in-platform optimisation
      (send me the pixel id and I'll add it). Expect creative rejections framed
      around performance enhancement — lead with the harm-reduction angle.
- [ ] Heads up: your own ledger lists paid acquisition as deprioritised. Reddit
      is worth testing, but cap the spend until the conversion path has real
      numbers behind it.

## 7. After launch

- [ ] Watch Vercel → Logs for `webhook event:` lines on the first few real sales
- [ ] Watch Anthropic usage daily for the first week (Sonnet 5 is ~3× Haiku)
- [ ] `node scripts/ui-check-entitlement.js` after any change to the paywall
- [ ] Verify the LOINC codes in the marker registry against a real Quest or
      LabCorp payload before wiring any lab API (nine markers have no code at
      all — the validator lists them)

---

## What changed, in one screen

| Before | Now |
|---|---|
| "Already purchased? Activate here" → pick your own tier | License key from the purchase email, verified against Stripe |
| `tl_tier` in localStorage, no expiry | `tl_ent` with expiry, re-verified daily, 7-day offline grace |
| AI endpoint open to anyone, quota per IP | License required, fails closed, quota per customer |
| Buyers landed on `?tl_activated=pro`, which nothing read | Activated from the checkout session, key shown on screen |
| APK behind a Google sign-in wall, free to click | $34.99 Checkout → license key → installable app |
| Signups filed silently in Resend | Welcome email, and sales notify hello@ |
| Two email lists (Resend + Mailchimp) | One list |
| Haiku 4.5, 10s function timeout | Sonnet 5, adaptive thinking, 60s timeout |
| Backup nag at 30 days, download only | Weekly, share sheet to iCloud/Drive, auto-rewrite on desktop |
| No version stamp, silent updates | Version in Profile, "new version — reload" prompt |
