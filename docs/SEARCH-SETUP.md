# Search Console, Bing and the DNS behind them

Every fact here was read off live DNS, the running site, the Vercel API and RDAP on
**3 September 2026**. Nothing is assumed. Re-check anything that has moved since.

Companion to `SEO-PLAN.md` §6 ("Search Console and Bing"), which specifies what to do;
this says how, with the account and record detail filled in.

## What is actually true right now

| | Finding | Evidence |
|---|---|---|
| Website host | **GitHub Pages** | apex → `185.199.108–111.153`; response header `server: GitHub.com`; repo `CNAME` = `therapylog.app` |
| Registrar | **Squarespace Domains II LLC** | RDAP: registered 2026-06-01, expires 2027-06-01, transfer-locked |
| DNS zone | **Google nameservers** | `ns-cloud-c1`–`c4.googledomains.com` |
| `www` | **Does not exist** ⚠ | NXDOMAIN, no record of any type |
| `api.therapylog.app` | **Vercel** | `216.198.79.65` / `64.29.17.65` via `vercel-dns-017.com` |
| Email | **Google Workspace** | MX `smtp.google.com`; SPF `v=spf1 include:_spf.google.com ~all`; DKIM live at `google._domainkey` |
| DMARC | `v=DMARC1; p=none;` ⚠ | monitor-only, no `rua=` reporting address |
| Search Console | **Not verified** | no `google-site-verification` TXT, no token in repo |
| Bing | **Not verified** | no `msvalidate.01`, no `BingSiteAuth.xml` |
| Sitemap | **Live, 44 URLs** | `https://therapylog.app/sitemap.xml` → 200 |
| IndexNow key | **Rotated 4 Sep 2026** | Now `615f8693ff6f4e55a3985a0ae070b7a3` — the key Bing Webmaster Tools generated. Replaces the earlier self-generated `b9905eb…`, which was live and equally valid; rotated only so the dashboard and the hosted file agree. **Not live until this lands on `main` and Pages rebuilds.** |
| Vercel site project | **Built, no domain** | `therapylog-github-io` connected to this repo; last deploy READY and rendering; no production target, no custom domain |
| Analytics script | **On all 46 pages** | `LAUNCH-CHECKLIST.md` §4's "13 pages" is stale |

The registration sits at Squarespace while the DNS zone sits on Google's nameservers.
That split is the signature of a domain bought during Google Workspace signup — Workspace
registers through Squarespace, Enom or DomainDiscount24 and keeps DNS on Google's
nameservers. Both "I got it from Google" and "the registrar is Squarespace" are true.

## Where to change DNS

```
admin.google.com → Account → Domains → Manage domains
→ View details next to therapylog.app → Advanced DNS settings
```

That page hands over the sign-in for the DNS console holding the records. If it comes up
empty, check `account.squarespace.com` → Domains; if `therapylog.app` is listed there with
nameservers still `ns-cloud-*`, Squarespace holds only the registration and the records
live in Google Cloud DNS (`console.cloud.google.com` → Network Services → Cloud DNS).

**Do not change the nameservers.** Everything below edits a record *inside* the existing
zone. Repointing nameservers away from `ns-cloud-*` takes the MX, SPF and DKIM records with
it and Google Workspace mail stops delivering the same hour.

## Part 1 — Google Search Console

Goes first: Bing's fast path imports from it.

1. **Use a Domain property, not a URL prefix.** It is verified by DNS, so it survives the
   move to Vercel, and it covers `therapylog.app`, `www` and `api` in one property. A
   URL-prefix property verified by an HTML file covers one exact prefix.
2. `search.google.com/search-console` → property dropdown → Add property → **Domain** →
   `therapylog.app` (bare domain, no scheme, no `www`).
3. Copy the `google-site-verification=…` TXT value.
4. Add it: type `TXT`, host `@` (or blank), TTL 3600, value = the full string.
   **Add, never replace** — the `@` host already holds the SPF TXT record, and a hostname
   can carry many TXT records. Deleting SPF to make room breaks mail deliverability.
5. Wait 5–15 minutes, then Verify. Re-clickable if it fails the first time.
6. Sitemaps → paste the **full URL** `https://therapylog.app/sitemap.xml` → Submit.
   A Domain property spans www, non-www and every subdomain, so the field shows **no
   prefix** and a bare `sitemap.xml` will not resolve. (The URL-prefix property is the one
   that prefills `https://therapylog.app/`.) Sitemaps also only accepts a submission on a
   *verified* property — confirm the green verified state first. The file is live and
   correct: 200, `application/xml`, and `robots.txt` points at it. Nothing on the site links
   to it, and nothing needs to. Expect Success and 44 URLs within a day.
7. URL Inspection → Request Indexing (~10/day) on:
   - `/tools/`
   - `/tools/peptide-reconstitution-calculator/`
   - `/tools/tirzepatide-reconstitution-calculator/`
   - `/tools/semaglutide-reconstitution-calculator/`
   - `/tools/trt-dose-calculator/`
   - `/tools/free-testosterone-calculator/`

Coverage data lands in 2–3 days. The Performance report needs impressions first, and the
domain is three months old with days-old tool pages — realistically **3–8 weeks** before it
is worth reading. Quiet week-one numbers are not a setup error.

## Part 2 — Bing Webmaster Tools

Bing is the index behind Copilot and ChatGPT search, and an IndexNow ping to Bing is shared
with Yandex, Naver and Seznam. Google takes no part in IndexNow.

1. `bing.com/webmasters` — sign in with the Google account, no Microsoft account needed.
2. **Import from Google Search Console** → authorize → pick `therapylog.app`. Carries the
   verification and the sitemap across. This is why Part 1 goes first.
   - Manual fallback: verify by XML file. Put `BingSiteAuth.xml` at the repo root **and add
     `- BingSiteAuth.xml` under `include:` in `_config.yml`** — Jekyll skips it otherwise
     and the file 404s.
3. Sitemaps → confirm `https://therapylog.app/sitemap.xml` is listed.
4. Settings → IndexNow. The key is `615f8693ff6f4e55a3985a0ae070b7a3` — the one Bing
   generated for you, now the one this repo hosts.

   IndexNow keys are **not credentials**: the whole scheme works by publishing the key at a
   public URL, so it is fine in a repo, in a dashboard screenshot, or in chat. Any key you
   control is valid — Bing's generated key has no special status, it is just a convenience.
   What matters is that `https://therapylog.app/<key>.txt` exists and contains exactly that
   key. Rotation is "add the new file, delete the old one"; `scripts/indexnow-submit.js`
   finds whichever 32-hex `.txt` sits at the repo root and refuses to run if there is more
   than one.
5. `node scripts/indexnow-submit.js` (add `--dry-run` to inspect the payload). Run after
   any deploy that changes pages; it reads `sitemap.xml`, so new pages need no script edit.

## Part 3 — the move to Vercel

Independent of Parts 1 and 2 — a Domain property survives a host change, so do not wait on
this.

1. Settings → Git → Production Branch = `main`; redeploy latest to Production. The current
   newest deployment has no production target.
2. Settings → Domains → add `therapylog.app`, then `www.therapylog.app`. **Use the record
   values Vercel prints**, not values from docs or blog posts: Vercel's own docs still show
   `76.76.21.21` while `api.therapylog.app` is already on `216.198.79.65`.
3. In the zone: delete the four `185.199.10x.153` A records, add Vercel's A record at `@`,
   add the `www` CNAME Vercel gives. **Leave MX, SPF, DKIM, DMARC and the Search Console
   TXT untouched.**
4. `curl -I https://therapylog.app` → `server: Vercel`. Records carry a 3600s TTL, so allow
   an hour.
5. Analytics → enable Web Analytics (and Speed Insights if wanted). All 46 pages already
   carry the script.
6. Leave the `CNAME` file in the repo — harmless, and it keeps Pages as a fallback during
   propagation.

Two cautions. The Vercel team is on **Hobby**, which is licensed for non-commercial use,
and TherapyLog sells Pro subscriptions and lifetime licences through Stripe; `therapylog-api`
is already there, and adding the marketing site makes that more visible. Hobby Web Analytics
also has a monthly event cap and short retention — check the figures before relying on it.
Cloudflare Web Analytics is a free alternative that needs no DNS change and works on Pages
today, but the Vercel tag is already deployed, so moving is the shorter path from here.

## Three gaps found while checking

1. **`www.therapylog.app` does not resolve.** Anyone typing the www form gets a DNS error.
   Fix with the Vercel `www` CNAME above, or today with `CNAME www → therapylog.github.io.`
   plus `www.therapylog.app` added in the GitHub Pages settings so it redirects to the apex.
2. **DMARC is `p=none` with no reporting address.** Fine for the website; a real problem
   before any cold-email outreach from this domain. Minimum:
   `v=DMARC1; p=none; rua=mailto:dmarc@therapylog.app;` so reports start arriving, then
   tighten to `p=quarantine` once they come back clean.
3. **`DNS SETUP.md` is wrong.** It points at `domains.google.com` (gone) and at ImprovMX MX
   records that would break Google Workspace mail if followed. Banner added; this file
   supersedes it.

## Order of operations

| # | Step | When |
|---|---|---|
| 1 | Search Console Domain property + TXT | today, 10 min |
| 2 | Submit sitemap, request indexing on the six tool URLs | same sitting |
| 3 | Bing import from Search Console, confirm IndexNow key | same sitting, 5 min |
| 4 | `node scripts/indexnow-submit.js` | same sitting |
| 5 | Add the `www` record | today |
| 6 | DMARC `rua=` reporting address | before outreach |
| 7 | Vercel production deploy, domains, DNS swap, analytics | when ready |
| 8 | Read the Performance report | in 3 weeks |

Steps 1–5 have no dependency on the Vercel move. Search visibility and analytics are
separate problems and the search half is the one with a long clock on it.
