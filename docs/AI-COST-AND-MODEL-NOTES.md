# AI cost, model choice and usage credits

Recorded 19 Aug 2026. This is the reasoning behind the model and cap decisions, so
they don't have to be re-derived later. Numbers are **estimates from published
per-token prices and measured prompt sizes**, not billing measurements — check
them against real Anthropic usage after a couple of weeks.

## Measured prompt sizes

Taken from the actual source, not guessed (~3.7 chars/token):

| Component | chars | ~tokens |
|---|---|---|
| `SYSTEM_CHAT` (guardrails, evidence tiering) | 4,467 | **1,207** |
| `SEARCH_DOMAINS` allow-list | 770 | 208 |
| `SYSTEM_LABSCAN` | 252 | 68 |
| Lab-scan prompt template | 2,282 | 617 |
| Lab-scan marker list (101 fields) | 5,382 | **1,455** |
| User context cap (4,000 chars) | 4,000 | 1,081 |

So a chat question sends ~3,400 input tokens before history, and a lab scan ~3,700
including one 1568px page image. The system prompt is cached (`cache_control`),
which is why the model below bills ~2,500 rather than 3,400 on a cache hit.

## Cost per call

Sonnet 5 list pricing ($3 / $15 per MTok), Haiku 4.5 ($1 / $5), web search ~$0.01
per search. Output includes adaptive-thinking tokens, which are billed as output.

| Per call | Cost |
|---|---|
| Chat question, 3 searches (Sonnet 5) | **$0.072** |
| Chat question, 5 searches (the old default) | $0.092 |
| Chat question, intro pricing (through 31 Aug 2026) | $0.058 |
| Chat question on Haiku 4.5 | $0.044 |
| Lab scan, 1 page (Sonnet 5) | $0.020 |
| Lab scan, 1 page (Haiku 4.5) | $0.007 |
| Lab scan, 6-page PDF (Sonnet 5) | $0.044 |

**Web search is ~$0.03 of a $0.072 question, and it costs the same on any model.**
That single fact drives most of what follows.

## Cost per month, Pro at $9.99

Net after Stripe (2.9% + 30¢) is $9.40. Assumes 4 lab scans/month.

| Monthly usage | API cost | Margin | After a 25% commission |
|---|---|---|---|
| 145 questions (the old cap) | $10.52 | **−$1.12** | **−$3.62** |
| 100 questions | $7.28 | $2.12 | −$0.38 |
| **50 questions (chosen)** | $3.68 | $5.72 | **$3.22** |
| 20 questions (typical) | $1.52 | $7.88 | $5.38 |
| 8 questions (likely median) | $0.66 | $8.74 | $6.24 |

## Decisions

**Sonnet 5 for chat.** Haiku saves only $0.028/question because search dominates
the cost, and it measurably loses the things being sold: holding several
constraints at once (injury history + protocol + macros + training age) and the
a/b/c evidence tiering `SYSTEM_CHAT` demands. Tested and found shallow by the
owner; that matches expectation for a small model on constrained planning.

**Sonnet 5 for the lab scanner too.** Haiku would save ~1.3¢ per scan — about 5¢
per user per month. The registry layer validates units, markers and ranges
deterministically, so the residual risk isn't malformed output: it's a *misread*
(a transposed digit, or a value paired with the wrong reference column on a dense
multi-column report). Those pass validation silently and land in dosing decisions.
Not worth 5¢. Haiku's 200K context also caps PDFs at 100 pages vs 600.

**No Opus by default.** Opus 5 is ~1.67× Sonnet for marginal gain on most
questions. Better as an opt-in "deep research" action the user funds — see credits.

**Cap at 50/month, not 145.** The old cap lost money outright and lost more with
an affiliate commission attached. 50 is profitable even on commissioned signups
and above what almost any user will reach. Set `AI_MAX_PER_MONTH=50` and
`AI_MAX_PER_DAY=15` (a daily burst guard of 50 under a monthly cap of 50 is
meaningless).

**Search capped at 3 uses** (`AI_SEARCH_MAX_USES`, was hardcoded 5). Cuts $0.02
per answer with no real loss of grounding.

**Price stays at $9.99.** The leak was the cap, not the price.

## Timing: the intro-pricing cliff

Sonnet 5 is on introductory pricing ($2 / $10) **through 31 August 2026**, then
$3 / $15. Costs rise ~50% on 1 September. Every monthly figure above already uses
list pricing, which is the right basis for planning — but usage observed in late
August will look ~20% cheaper than it will be in September. Don't set the cap from
launch-weekend data.

## Usage credits (planned, not yet built)

Approved in principle 19 Aug, deliberately deferred until after the launch weekend
so it isn't a brand-new payment surface under first traffic.

- **1 credit** = one question or one lab scan. **4 credits** = deep research
  (higher effort, more searches, longer answer — optionally Opus).
- **Included:** Pro 50/month (resets monthly); BYOK unlimited on the user's own
  key (credits never needed); Lifetime 0 included.
- **Packs**, against a ~7¢ cost basis: 25 for $4.99, 100 for $14.99, 300 for
  $34.99 — roughly 40–50% gross margin, and they never expire.
- **Storage:** a counter on the Stripe customer, exactly like the usage metering
  already added. Top-ups are a Checkout purchase handled by the same webhook. No
  new database.
- Credits are consumed only *after* the monthly allowance, and the app shows the
  balance (`/api/ai-research` already returns remaining quota).

**Affiliate commission should NOT apply to credit purchases.** Commission belongs
on plan and licence revenue. A credit pack is roughly half cost of goods, so 25%
of the sale is close to half the margin — and it would push affiliates to promote
token consumption rather than subscriptions. State this explicitly in the
affiliate terms before recruiting influencers, because it is much harder to walk
back later.

Why credits also fix BYOK: BYOK's pitch becomes "never buy credits, unlimited
depth, your own key", which is a real reason to choose it. That doesn't remove the
separate problem that $8.99/mo sits $1 under Pro (see LEDGER §3).

## How to read config you can't see in Vercel

Vercel hides values once saved. Two ways to check:

1. **Dashboard:** Settings → Environment Variables → the ⋯ menu on a row → Edit
   reveals the value. Or `vercel env pull .env.local` and open the file.
2. **`/api/health`** (added 19 Aug): set `HEALTH_TOKEN` to any random string, then
   open `https://api.therapylog.app/api/health?token=YOUR_TOKEN`. It reports
   which variables are **present** (never their values), the effective model,
   effort, token and search limits, the active caps, whether Upstash actually
   answers a PING, and a list of warnings. With `HEALTH_TOKEN` unset it 404s.

### The three caps are different things — keep all of them

| Variable | Scope | Purpose |
|---|---|---|
| `AI_MAX_PER_DAY` | per licence, per day | burst guard |
| `AI_MAX_PER_MONTH` | per licence, per calendar month | the included allowance |
| `AI_MAX_GLOBAL_PER_DAY` | everyone, per day | total-spend circuit breaker |

`AI_MAX_GLOBAL_PER_DAY` (set 17 June) is still read by the code — **do not delete
it**. Add the two per-licence caps alongside it. If you can't recall its value,
re-set it to a known number rather than removing it.

**Caveat:** the global ceiling needs a shared counter, so it is only enforced when
Upstash is reachable. On the Stripe-metadata fallback each customer is capped but
there is no single breaker across everyone — which is the main reason to get
Upstash working (free tier is plenty).
