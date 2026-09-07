# therapylog.app — technical SEO constraints (GitHub Pages) — research notes

Date: 2026-09-03. Repo inspected: `/home/user/Therapylog.github.io` (branch `claude/therapylog-influencer-seo-3v1qus`; Pages source is `main`).
Method: local file reads + 12 web searches (result titles/snippets only; page fetching is blocked in this session, and the search budget was exhausted after the first batch). Statements that could not be backed by a fetched source this session are marked **[background knowledge]**.

---

## 0. Corrections to the brief (things the repo actually shows)

| Assumed | Actual |
|---|---|
| "there is a `_config.yml` at the repo root" | **There is no `_config.yml`.** The file is named `" config.yml"` — a leading space, no underscore (`git log` shows it was added that way in commit `e32c926`). Jekyll only reads `_config.yml`, so this file is ignored and is itself served as a static file at `/%20config.yml`. Its comment ("Tells GitHub Pages not to process this as Jekyll") is wrong twice over: only a `.nojekyll` file disables Jekyll, and `include: [CNAME]` would not do that anyway. |
| Site served by GitHub Pages | Confirmed by DNS: `therapylog.app` → `185.199.108-111.153` (GitHub Pages A records). `www.therapylog.app` has **no DNS record at all**. Note `docs/LAUNCH-CHECKLIST.md` §4 is an open item to move the domain to Vercel; every page already carries `<script defer src="/_vercel/insights/script.js">` which 404s on GitHub Pages. |
| — | No `.nojekyll`, no `404.html`, no `robots.txt`, no `sitemap.xml`, no `tools/` or `markers/` folders, and **no JSON-LD anywhere on the site** (clean slate for structured data). |
| — | No HTML file has YAML front matter, so Jekyll copies every `.html` verbatim (Liquid is never evaluated). Keep it that way for the new pages: do not start them with `---`. |

---

## 1. GitHub Pages constraints that matter

### 1.1 Jekyll is on, and what it does
- Jekyll processing is the default; it is off only if a `.nojekyll` file exists at the root of the publishing source, committed and pushed. Sources: [About GitHub Pages and Jekyll / "files that start with an underscore are missing"](https://help.github.com/en/articles/files-that-start-with-an-underscore-are-missing), [How to use underscores with GitHub Pages](https://www.ianwootten.co.uk/2022/11/08/how-to-use-underscores-with-github-pages/), [.nojekyll troubleshooting](https://www.codegenes.net/blog/pushed-nojekyll-file-to-github-pages-no-effect/).
- **Underscore files/folders**: anything beginning with `_` (or `.`) is treated as Jekyll-internal and dropped from the published site. Source: [jekyll/jekyll#55](https://github.com/jekyll/jekyll/issues/55), [Antora issue documenting the same](https://gitlab.com/antora/antora/-/issues/194). Practical rule for this plan: never name a folder `_tools`, `_data`, `_partials`, etc. unless you intend Jekyll to consume it.
- **`.md` without front matter** is copied to `_site` as-is (raw markdown, no HTML conversion). Source: [jekyll-optional-front-matter README](https://github.com/benbalter/jekyll-optional-front-matter) ("Markdown files with no front matter are copied to _site as-is, with no .html version"), [Jekyll Talk](https://talk.jekyllrb.com/t/markdown-has-no-front-matter/5032).
- **`docs/` is served publicly.** None of the docs have front matter, `docs/` has no underscore, and there is no `_config.yml` `exclude:` list. Therefore these are reachable today as raw markdown:
  - `https://therapylog.app/docs/LEDGER.md` (29 KB, internal project ledger)
  - `https://therapylog.app/docs/COMPLIANCE-AUDIT.md` (41 KB — names infrastructure partners, the marketing-page PIN problem, DEA/NPI collection, open legal to-dos)
  - plus `docs/AI-COST-AND-MODEL-NOTES.md`, `BRAND-AND-ENTITY-STRUCTURE.md`, `LAUNCH-CHECKLIST.md`, `PROMOTION-READINESS.md`, `ART-DIRECTION.md`, `MARKERS.md`, `COMPOUNDS.md`, `compounds.json`
  - also at the root: `DNS SETUP.md`, `README.md`, `Arctos Labs packaging spec.pdf` (1.2 MB), `Supplement Website Design Project (4).zip` (6.8 MB), four stray `assets-*.png` / `IMG_*.PNG`, and the whole `scripts/` folder of Node/puppeteer validators.
  - **Yes, plainly: they are reachable by anyone who knows or guesses the URL.** Nothing served links to them (verified by grep), so search engines are unlikely to discover them by crawling, but "unlinked" is not "private": Google indexes PDFs and any URL it learns of, and once a sitemap/robots.txt/IndexNow key exist, more crawlers will probe the host. `robots.txt Disallow` is a crawl hint, not access control (the compliance audit makes the same point about `noindex`).
  - Fix options, cleanest first: (a) move `docs/`, `scripts/`, the PDF/zip/PNGs off the published branch (separate branch or repo); (b) if they must stay in the repo, create a real `_config.yml` with `exclude: [docs, scripts, "*.md", "*.pdf", "*.zip", "IMG_*", "assets-*"]` and `include: [CNAME]` — `exclude` removes them from the Jekyll build without touching git. `app.html` does not fetch `docs/compounds.json` at runtime (only a code comment at line 2062 mentions it), and the CI workflows read it from the checkout, so excluding `docs/` is safe. Do **not** add `.nojekyll` as the "fix" — that would make even more of the tree public.
- Jekyll's default `exclude` covers `node_modules`, `Gemfile*`, `vendor/bundle|cache|gems|ruby` — **not** `vendor/` itself **[background knowledge]**; `/vendor/chart.umd.min.js` is served today (the app and the service worker depend on it), which confirms this.

### 1.2 No server-side redirects, no custom headers
- "GitHub Pages is not a webserver like Apache or NGINX and there is no settings about redirects"; only client-side emulation (meta refresh / JS) is possible. Source: [Redirects on GitHub Pages — LPRP.fr](https://www.lprp.fr/2022/11/redirects-on-github-pages/), [Haacked: better 404 and redirects](https://haacked.com/archive/2015/07/28/github-pages-redirect-handling/), [opensource.com HTTP-hack redirect](https://opensource.com/article/19/7/permanently-redirect-github-pages).
- The only server-level hook is a custom `404.html` (or `404.md` with front matter) at the root, which is served with a real 404 status. Source: [Creating a custom 404 page — GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site), [gh-pages-404-redirect](https://github.com/dmsnell/gh-pages-404-redirect). The repo has no `404.html` today.
- The `jekyll-redirect-from` plugin is whitelisted on GitHub Pages **[background knowledge]**, but it emits meta-refresh HTML pages (still client-side, still 200), and requires front-mattered pages, so it is not a substitute for 301s.
- No custom HTTP headers (no CSP, HSTS, X-Robots-Tag, cache tuning). GitHub Pages serves `Cache-Control: max-age=600` **[background knowledge]**, so edits to `robots.txt`/`sitemap.xml` are live within ~10 minutes of the Pages build finishing. Consequence: any noindex must be a `<meta name="robots">` tag, never a header, and IndexNow key/verification tokens must be files, not headers.
- Pages limits **[background knowledge]**: ~1 GB site, 100 GB/month bandwidth, 10 builds/hour, and Pages builds are triggered on push to `main` (no build step of your own — everything committed is what ships).

### 1.3 How a clean URL resolves
- GitHub Pages resolves an extensionless request `/tools/reconstitution` to `tools/reconstitution.html` if that file exists, otherwise to `tools/reconstitution/index.html`; a trailing-slash request `/tools/reconstitution/` only matches the `index.html` form; and a bare folder request `/tools` 301s to `/tools/` when `tools/index.html` exists **[background knowledge — the confirming search was cut off by the budget]**. The repo already depends on both forms: `providers/apply.html` is canonicalised as `/providers/apply`, and `providers/index.html` as `/providers/`.
- Both `/x` and `/x.html` serve the same bytes with 200, so every page is reachable at two URLs; the `<link rel="canonical">` is what keeps them from being duplicate content. Pick one pattern for `/tools/*` and `/markers/*` and use it consistently in canonical, sitemap, internal links and IndexNow submissions. Recommendation: `tools/<slug>.html` → canonical `https://therapylog.app/tools/<slug>` (matches `/pro`, `/guide`, `/providers/apply`), plus `tools/index.html` → `https://therapylog.app/tools/`.

### 1.4 Custom-domain HTTPS
- With the four A records in place and "Enforce HTTPS" ticked, GitHub obtains a Let's Encrypt certificate; the option can take up to 24 h to become available, certs sometimes 24–48 h after DNS is clean; extra A/ALIAS records on `@` or CAA records that do not allow `letsencrypt.org` block issuance. Sources: [Managing a custom domain — GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [dcycle: apex and www on GitHub Pages](https://blog.dcycle.com/blog/2023-11-15/github-pages-https-apex-www/), [community discussion #184514](https://github.com/orgs/community/discussions/184514).
- `www.therapylog.app` currently does not resolve. That is fine for canonical hygiene (there is exactly one host), but if a `www` CNAME is ever added it must point at `therapylog.github.io` so GitHub can redirect it to the apex with a valid cert — GitHub only provisions the cert for the domain in `CNAME` and redirects the other variant. Source: [isaacs/github#1675](https://github.com/isaacs/github/issues/1675).
- `DNS SETUP.md` references `domains.google.com`; Google Domains has been migrated to Squarespace **[background knowledge]** — the DNS TXT records for Search Console will be added wherever the zone lives now.

---

## 2. How `https://therapylog.app/app` resolves today, and its canonical

- There is **no `app/` folder**, no redirect in `index.html`, no Jekyll config. `app.html` (928,824 bytes, 8,812 lines) sits at the repo root, so GitHub Pages' extensionless resolution serves it for `/app`; `/app.html` serves the identical file.
- Both URLs are in active use, for different audiences:
  - Humans: every marketing page links `href="/app"` (index.html x4, providers/apply.html x2, download/pro/etc.).
  - PWA/offline machinery uses `/app.html`: `manifest.webmanifest` has `"id": "/app.html"`, `"start_url": "/app.html"`, `"scope": "/"`; `sw.js` precaches `/app.html`, falls back to `/app.html` for offline navigations, and `notificationclick` matches `client.url.includes('/app.html')`.
- `app.html` already declares `<link rel="canonical" href="https://therapylog.app/app">`. That is the right canonical: it is the URL humans and links use, and it consolidates `/app.html`, `?session_id=…` (Stripe return), `?utm_*` attribution variants, and `?src=` links onto one URL. After Stripe returns, the app calls `history.replaceState({}, '', location.pathname)` (lines 7844/7850), so a user who entered via `/app.html` stays on `/app.html` — harmless because of the canonical.
- There is no client-side router: no `location.hash` or `pathname` routing exists in `app.html` (only attribution capture at line 7468). So the 130 compounds and 100 markers inside the app have **no URL of their own** — see §6.
- The pre-JS DOM of `/app` is the onboarding overlay ("Before you begin") and an empty `#app` shell; there is no `<noscript>` and no robots meta. Google's rendered snapshot of `/app` will be the onboarding/consent screen. Keep `/app` indexable (it is the product) and in the sitemap, but do not expect it to rank for anything except the brand.
- Recommendation: leave canonical as `/app`; in the sitemap list `/app` (not `/app.html`); optionally give `/app` a short server-rendered `<noscript>`/visible intro paragraph plus `WebApplication` JSON-LD (§7) so the indexed version says what the app is.

---

## 3. IndexNow mechanics for a static site, and Bing import from Search Console

Sources: [IndexNow documentation](https://www.indexnow.org/documentation), [IndexNow FAQ](https://www.indexnow.org/faq), [Bing: how to add IndexNow](https://www.bing.com/indexnow/getstarted), [IndexNow for search engines](https://www.indexnow.org/searchengines), [Wikipedia: IndexNow](https://en.wikipedia.org/wiki/IndexNow).

1. **Key**: generate an IndexNow key (8–128 hexadecimal characters, `a-f0-9`; Bing Webmaster Tools can generate one) **[key-format detail: background knowledge]**. Publish it as a plain text file at the site root, `https://therapylog.app/<key>.txt`, whose entire body is the key (UTF-8, no BOM, no newline noise). On GitHub Pages a `.txt` at the repo root is copied verbatim by Jekyll (no underscore, no front matter needed). Alternatively host it elsewhere and pass `keyLocation`.
2. **Single URL** (GET): `https://api.indexnow.org/indexnow?url=<url-encoded URL>&key=<key>`.
3. **Bulk** (POST): `https://api.indexnow.org/indexnow` with header `Content-Type: application/json; charset=utf-8` and body

   ```json
   {
     "host": "therapylog.app",
     "key": "<key>",
     "keyLocation": "https://therapylog.app/<key>.txt",
     "urlList": [
       "https://therapylog.app/tools/reconstitution",
       "https://therapylog.app/markers/total-testosterone"
     ]
   }
   ```
   Up to 10,000 URLs per request; `200` = accepted (`202` = accepted, key validation pending **[background]**), `400` bad request, `403` key not valid/mismatch, `422` URLs don't belong to the host or key mismatch, `429` too many requests. URLs must be on the `host` named in the body; `keyLocation` may be omitted when the key file is at the root under its own name.
4. **Shared index**: a submission to any participating engine is shared with all of them — Bing, Yandex, Naver, Seznam.cz, Yep, (and others that have joined) **[participant list: background knowledge; Wikipedia article in results]**. **Google is not a participant**, so IndexNow does nothing for Google; Google discovery relies on the sitemap, internal links and Search Console.
5. **Automation on GitHub Pages**: there is no server, so submissions must come from outside — `curl` by hand, or a GitHub Actions workflow (the repo already runs five validator workflows). Trigger it on the completion of the built-in `pages-build-deployment` workflow (`on: workflow_run`) rather than on `push`, so the URLs are live when Bing fetches them. Keep the key out of the workflow file (repo secret) even though it is public by design — it stops casual reuse.
6. **Bing Webmaster Tools import from Google Search Console**: Bing WMT → My Sites → **Import** → sign in with the Google account that owns the GSC property → Allow → select the site → Import. Imported sites are auto-verified and their sitemaps are imported; Bing periodically re-validates against GSC; traffic data appears within ~48 h; limits are 100 sites per import / 1,000 total. Sources: [Bing blog, Sept 2019](https://blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools), [Bing help: Add and verify site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b), [Search Engine Land](https://searchengineland.com/bing-webmaster-tools-allows-site-verification-via-google-search-console-321197). Native Bing verification (if not importing) is `BingSiteAuth.xml` at the root, a `msvalidate.01` meta tag, or a CNAME record — all workable on GitHub Pages **[background knowledge]**.

---

## 4. Search Console verification options that work on GitHub Pages

Source: [Verify your site ownership — Search Console Help](https://support.google.com/webmasters/answer/9008080?hl=en), plus [SE Ranking setup guide](https://seranking.com/blog/how-to-set-up-google-search-console/), [koanthic: 7 methods](https://koanthic.com/en/site-ownership-verification/).

| Method | Works on GH Pages? | Notes |
|---|---|---|
| **DNS TXT record** (required for a *Domain* property `therapylog.app`) | Yes | Most durable; covers http/https, apex and any future `www`/subdomain in one property. Add at the registrar (the zone that holds the four A records). Recommended primary. |
| **HTML file** `google<token>.html` at root (URL-prefix property `https://therapylog.app/`) | Yes | Jekyll copies it verbatim (no front matter, no underscore). Do not put it under a folder; do not `exclude: ["*.html"]` if you later add a `_config.yml`. |
| **Meta tag** `<meta name="google-site-verification">` in the `<head>` of `index.html` | Yes | Must be on the home page's HTML head. Easy second method so verification survives a DNS change. |
| Google Analytics / Tag Manager snippet | Only if those are installed | Not currently installed (the site uses Vercel Analytics, which 404s on Pages). |

Recommendation: create a **Domain property** via DNS TXT (needed anyway for Bing's GSC import to carry the sitemap), and also add the meta tag on `index.html` as a fallback. Both Bing import and sitemap submission require a verified property first. Keep one method as canonical and do not delete the token later — Google re-checks periodically.

---

## 5. `sitemap.xml` and `robots.txt`

Sources: [Build and submit a sitemap — Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [sitemaps.org FAQ](https://www.sitemaps.org/faq.html), [Create and submit a robots.txt — Google](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt), [How Google interprets robots.txt](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), [CrawlSense on lastmod](https://crawlsense.ai/blog/xml-sitemap-best-practices), [Nightwatch sitemap best practices 2026](https://nightwatch.io/blog/sitemap-best-practices/).

**Sitemap**
- One sitemap: max 50,000 URLs and 50 MB uncompressed; beyond that, a sitemap index (which itself may list 50,000 sitemaps). This site will have a few dozen URLs — a single file at `https://therapylog.app/sitemap.xml` (root placement lets it cover the whole host).
- Use absolute, canonical-form URLs only (one form per page — `/tools/x`, not `/tools/x.html`), XML-escape `&`, UTF-8.
- `lastmod` in W3C datetime (`2026-09-03` or `2026-09-03T14:00:00+00:00`). Google ignores `priority` and `changefreq`; it uses `lastmod` only while it stays accurate — set it from the real content change date, never "now" on every build, or Google will start ignoring it.
- Exclude `noindex` pages (`/marketing`, `/directory/add-partner`), non-canonical duplicates (`/app.html`), and all non-page assets.
- Hand-maintain the file (or generate it with a Node script in `scripts/` and commit it, validated in CI like the existing checks). Do **not** enable the Jekyll `jekyll-sitemap` plugin: it enumerates static files too, which on this repo would advertise the PDF, zip, PNGs and `docs/*.md` **[background knowledge]**.
- Submit in GSC → Sitemaps and (via import or manually) in Bing WMT; also list it in `robots.txt`.

**robots.txt**
- Plain-text, UTF-8, at `https://therapylog.app/robots.txt` (Jekyll copies `.txt` verbatim). Rules are grouped under `User-agent:` lines with `Allow:`/`Disallow:`; the `Sitemap:` line takes a **fully-qualified URL**, may appear anywhere, is independent of groups, and may repeat. Directive names are case-insensitive.
- Suggested starting point:

  ```
  User-agent: *
  Disallow: /docs/
  Disallow: /scripts/
  Disallow: /marketing
  Disallow: /directory/add-partner

  Sitemap: https://therapylog.app/sitemap.xml
  ```
  Caveats: `Disallow` blocks crawling, not indexing — a disallowed URL can still be indexed as a bare URL if linked, and a disallowed page's `noindex` can no longer be read. For `/marketing` (already `noindex,nofollow`) either approach works; for `docs/` the real fix is §1.1. Do not disallow `/vendor/`, `/icons/`, `/sw.js` or `/manifest.webmanifest` — Google needs JS/CSS/icons to render.
- Optional AI-crawler groups (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`) if the business wants to steer answer-engine use; note those crawlers do not run JavaScript (see §6), so they only ever see the static pages.

---

## 6. Will Google index the JS-rendered 929 KB single-file app, and why static pages are still right

Sources: [Understand JavaScript SEO basics — Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [JavaScript SEO in 2026 (rewatikhare)](https://www.rewatikhare.com/post/javascript-seo-in-2026-what-google-actually-handles-vs-what-still-bites-you), [Heroic Rankings: rendering for Google and AI crawlers](https://heroicrankings.com/seo/technical/javascript-seo-rendering-choices/), [SPA SEO guide 2026](https://www.weweb.io/blog/seo-single-page-application-ultimate-guide).

- Google can render JS: crawl → render queue → headless Chromium (WRS) → index. The queue delay ranges from seconds to days/weeks depending on crawl priority; a March-2026 Search Console analysis cited in results found ~80% of SPAs have pages queued for rendering that never get rendered. Googlebot's per-resource fetch cap is 15 MB **[background knowledge]**, so the 929 KB file is fetched whole.
- But rendering is not the real problem for TherapyLog — **URL structure is**:
  1. The app has one URL. Google indexes URLs, not in-app views. The compound encyclopedia (`const DB = {...}` at ~line 100) and `MARKER_REGISTRY` are JS object literals; text inside `<script>` is not page content, and there is no router that exposes `/app#bpc-157` or `/app/markers/…` as separate documents.
  2. What Google renders at `/app` is the onboarding overlay, so the indexable text of the product is a consent screen.
  3. Bing's renderer is weaker than Google's **[background]**, and the measured 2026 behaviour of GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bytespider and Meta-ExternalAgent is **zero JavaScript execution** — those agents see the empty shell. For a health-tool site whose traffic plan includes AI answers, that alone decides it.
  4. Static pages give each marker/tool its own title, description, canonical, H1, body text, internal links, JSON-LD, and `lastmod` — and they index on the first crawl wave, not the render wave.
- Therefore: build `/tools/<slug>` and `/markers/<slug>` as committed static HTML (generated from `docs/compounds.json` / the marker registry by a script if desired, then committed — Pages has no build step of yours), with clear CTAs into `/app`. Keep `/app` as one canonical entry point. If deep links into the app are wanted later, add a query/hash convention (`/app?open=marker:tt`) and keep the canonical on `/app`.

---

## 7. Structured data that fits

Sources: [Software app structured data — Google](https://developers.google.com/search/docs/appearance/structured-data/software-app), [WebApplication schema fields](https://www.karpi.studio/schema-glossary-types/web-application), [Changes to HowTo and FAQ rich results — Google, Aug 2023](https://developers.google.com/search/blog/2023/08/howto-faq-changes), [Google drops FAQ rich results — SEJ](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/), [FAQ rich results deprecated: May 2026](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now), [Search Engine Land: rise and fall of FAQ schema](https://searchengineland.com/faq-schema-rise-fall-seo-today-463993), [Schema App: FAQ/How-to changes](https://www.schemaapp.com/schema-app-news/changes-to-faq-and-how-to-rich-results-on-google/).

- **SoftwareApplication / WebApplication (for `/` and `/app`)**: Google's software-app rich result supports `SoftwareApplication`, `MobileApplication` and `WebApplication`. Required for a rich result: `name`, `offers` (with `price: 0` for the free tier, or the Pro `$9.99` monthly offer as an `Offer` with `priceCurrency`), and `aggregateRating` **or** a `review`. Recommended: `applicationCategory` (`HealthApplication` is a schema.org enumerated value), `operatingSystem` (`"Web"`; don't claim iOS/Android — `scripts/validate-marketing-static.js` explicitly enforces "no App Store claim"), `browserRequirements` (WebApplication-specific), `screenshot`, `featureList`, `publisher`/`author` Organization. Do **not** invent an `aggregateRating`; without genuine on-site ratings there is simply no star snippet, which is fine — the markup still helps entity understanding. Google's review guidelines forbid self-serving/fabricated ratings **[background knowledge]**.
- **`MedicalWebPage` for marker pages**: valid schema.org type, `WebPage` subtype, with `about` (`MedicalTest` / `MedicalCondition` / `MedicalSignOrSymptom`), `lastReviewed`, `reviewedBy` (Person with credentials), `citation`, `medicalAudience`. Google has **no rich result** for it and no penalty for using it **[background knowledge]**; its value is entity clarity and the E-E-A-T signals Google's helpful-content guidance asks for on YMIL/health pages (who wrote it, how, why). Only assert `reviewedBy`/"medically reviewed" if a named, credentialed reviewer actually reviewed the page — `docs/LEDGER.md` gates compound pages on a named author for this reason, and the compliance validator forbids unsubstantiated claims. If no clinician reviewer exists, use `WebPage` + `about` + `author` and keep the existing not-medical-advice disclaimer visible. Google's health guidance (background): YMYL pages are held to higher E-E-A-T standards; that is about visible content and authorship, not a schema type.
- **FAQPage (2026 status)**: Aug 2023 restricted FAQ rich results to "well-known, authoritative government and health websites" and removed HowTo entirely (desktop-only, then gone in Sept 2023). Results from this session ([SEJ](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/), [Passionfruit](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now), [Search Engine Land](https://searchengineland.com/faq-schema-rise-fall-seo-today-463993)) report a further step in **May 2026: FAQ rich results dropped from Search entirely**, with the documentation retired. `FAQPage` remains valid schema.org; unused structured data causes no harm and Google says there is no need to remove it. Bottom line: write FAQs as visible HTML (they still feed snippets and AI answers); FAQPage JSON-LD is optional and will produce **no rich result** for therapylog.app in any case (it was never an "authoritative health site" under the 2023 rule).
- **Author / Person**: Google's Article guidance wants `author` as a `Person` with `name`, `url` (a real profile/about page) and `sameAs` links; use a stable `@id` (e.g. `https://therapylog.app/about#founder`) reused on every page, plus `jobTitle`, `knowsAbout`, and `worksFor` → the `Organization` **[details: background knowledge]**. Pair with an `Organization` node on `/` (`logo`, `sameAs`, `contactPoint`). No credentials that are not real.
- **BreadcrumbList** is a supported rich result and cheap: `Home › Tools › Reconstitution calculator`, `Home › Markers › Total testosterone`. Recommended on every `/tools/*` and `/markers/*` page.
- **Calculators (`/tools/*`)**: no dedicated rich result. `WebPage` (+ `BreadcrumbList`) is enough; `WebApplication` per tool is defensible if the tool is genuinely interactive. HowTo is dead — don't use it.
- Test with the Rich Results Test / Schema Markup Validator before shipping; keep all JSON-LD inline (`<script type="application/ld+json">`), since there is no header/route control on Pages.

---

## 8. Would `/sw.js` intercept or precache the new `/tools/` URLs?

File: `/home/user/Therapylog.github.io/sw.js` (81 lines). Registered only from `app.html` line 3409: `navigator.serviceWorker.register('/sw.js')` — default scope is `/` because the script lives at the root, and `activate` calls `self.clients.claim()`.

- **Precache**: fixed list — `/app.html`, `/manifest.webmanifest`, `/vendor/chart.umd.min.js`, three icons. **No `/tools/` or `/markers/` URL is precached**, and adding pages does not require touching `sw.js`.
- **Intercept**: yes — the `fetch` handler catches **every same-origin GET** (`url.origin === self.location.origin`), so in any browser that has ever opened `/app`, requests for `/tools/*`, `/markers/*`, `/robots.txt`, `/sitemap.xml`, verification files, etc. go through the SW. Strategy is network-first: it fetches from the network, and on `resp.ok` writes a copy into cache `therapylog-v2`, returning the network response. So static pages are always fresh online; they are cached opportunistically after first visit (runtime cache, never evicted until the cache name changes).
- **Offline behaviour**: cached copy if present; otherwise, for a *navigation* request with no cached copy, it serves `/app.html`. So an offline user opening a never-visited `/tools/x` sees the app instead of a browser offline page. Cosmetic, not an SEO issue.
- **Crawlers are unaffected**: Googlebot/Bingbot do not run service workers; SW behaviour never changes what search engines see. Nothing here blocks indexing of new pages.
- Small optional cleanups when the pages ship: (a) exclude `/tools/` and `/markers/` (or all non-`/app` navigations) from the `/app.html` fallback so marketing pages fail cleanly offline; (b) skip `cache.put` for `robots.txt`/`sitemap.xml`/`*.txt` — harmless either way; (c) bump `CACHE` to `therapylog-v3` only if `sw.js` itself changes.

---

## Risks / gotchas summary

1. **Internal docs are public**: `docs/LEDGER.md`, `docs/COMPLIANCE-AUDIT.md` (and the rest of `docs/`, `scripts/`, the PDF, the zip, `DNS SETUP.md`) are served verbatim at `https://therapylog.app/docs/...`. Remove from the publishing branch or `exclude:` them in a real `_config.yml`. Do it *before* publishing a sitemap/robots/IndexNow key, which will attract more crawler attention.
2. **`" config.yml"` is a no-op** and its comment is misleading; anyone relying on it thinking Jekyll is off will be surprised by underscore-folder drops and Liquid.
3. **`/_vercel/insights/script.js` 404s on every page** until the Vercel migration (LAUNCH-CHECKLIST §4). If that migration happens, most of §1 changes: Vercel supports `cleanUrls`, real redirects and headers in `vercel.json` — the robots/sitemap/verification files carry over unchanged, and canonical URLs should be chosen now so they survive the move (`/tools/<slug>` with no `.html` does).
4. **Two URLs per page** (`/x` and `/x.html`) — canonical tags must be exact and match sitemap/IndexNow lists.
5. **No 301s**: any renamed slug later means a `404.html` JS hop or a stub page with meta-refresh + canonical; choose slugs carefully the first time.
6. **IndexNow does not reach Google**; Google needs the sitemap + GSC. Bing/Yandex/Naver/Seznam/Yep get IndexNow.
7. **FAQPage yields no rich result** (2023 restriction; reportedly removed entirely May 2026). HowTo is gone. Don't spend effort on either beyond visible content.
8. **Structured-data honesty**: no fabricated `aggregateRating`, no `reviewedBy` without a real reviewer, no iOS/App-Store claims (`validate-marketing-static.js` and `validate-compliance.js` will fail CI on some of these anyway).
9. **YMYL**: marker pages are health content; Google will weigh authorship and visible disclaimers — plan the named author/about page (LEDGER step 6 already gates on it).
10. **Search budget**: items marked **[background knowledge]** (clean-URL edge cases, IndexNow key format/participant list, Jekyll default excludes, Googlebot 15 MB cap, jekyll-sitemap static-file behaviour, Bing native verification methods) were not confirmed by a fetched document in this session; they match long-standing documented behaviour but should be spot-checked against the linked docs when implementing.
