#!/usr/bin/env node
/* Compliance invariants, checked the same way the claim counts are.
   Every rule here exists because the thing it forbids was actually on the site
   at some point — see docs/COMPLIANCE-AUDIT.md for what each one is about.
   These are cheap, mechanical checks; they do not make the site compliant, they
   stop four specific regressions that are easy to make and expensive to find.

   Run: node scripts/validate-compliance.js */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (rel) => {
  try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return null; }
};
const results = [];
const t = (name, pass, detail) => results.push([pass, name, detail || '']);

/* Pages a visitor can reach. The internal Marketing Suite is excluded — it is
   PIN-gated and never shown to a customer — and add-partner.html is the
   operator's own listing generator. */
/* Every index.html under these folders, so a page added by
   scripts/build-pages.js is covered the moment it is generated rather than
   when someone remembers to list it here. */
const walk = (dir, out = []) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.isDirectory()) walk(dir + '/' + e.name, out);
    else if (e.name === 'index.html') out.push(dir + '/' + e.name);
  }
  return out;
};
const REFERENCE_PAGES = ['about', 'tools', 'markers', 'compounds'].flatMap((d) => walk(d)).sort();

const PUBLIC = ['index.html', 'download.html', 'pro.html', 'guide.html',
                'partnership.html', 'privacy.html', 'terms.html',
                'health-data-privacy.html', 'directory/index.html',
                'providers/index.html', 'providers/apply.html',
                /* Reachable by definition, and it carries the legal links. */
                '404.html']
  /* Reference pages published under the founder's byline. */
  .concat(REFERENCE_PAGES);

/* ---- 1. Legal links reachable from every public page -------------------- */
/* Both forms are in use across the site: root-relative on index, absolute
   elsewhere. Accept either; what matters is that the link exists. */
const linkTo = (html, slug) =>
  new RegExp(`href="(?:/|https://(?:www\\.)?therapylog\\.app/)${slug}"`).test(html);

PUBLIC.forEach((rel) => {
  const html = read(rel);
  if (html === null) { t(`${rel} exists`, false, 'file not found'); return; }
  t(`${rel} links the privacy policy`, linkTo(html, 'privacy'));
  t(`${rel} links the terms`, linkTo(html, 'terms'));
  /* Washington's My Health My Data Act wants the consumer health data policy
     as its own distinct link, not a section of the general policy. */
  t(`${rel} links the consumer health data policy`, linkTo(html, 'health-data-privacy'));
});

/* ---- 1b. Exactly one <h1> on every indexable page ----------------------- */
/* Bing Webmaster's site scan flagged /app and /pro as missing an <h1>, and it
   was right about both: pro.html had no heading element at all and app.html's
   only <h1> lived inside a markdown renderer's template literal. Scripts and
   styles are stripped before counting for exactly that reason — a heading a
   crawler never sees is not a heading.

   marketing.html is deliberately absent: it is noindex,nofollow, so no crawler
   scans it and no ranking depends on it. Generated pages are not here either;
   validate-public-pages.js already asserts a single <h1> on every one of them. */
const visibleMarkup = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '');

PUBLIC.concat(['app.html']).forEach((rel) => {
  const html = read(rel);
  if (html === null) return;
  const n = (visibleMarkup(html).match(/<h1[\s>]/g) || []).length;
  t(`${rel} has exactly one <h1>`, n === 1, `found ${n}`);
});

/* ---- 1c. Titles and descriptions that survive truncation ---------------- */
/* Bing truncates a title around 65 characters and Google around 600 pixels,
   which is roughly 60 for mixed-case text; descriptions are cut near 155-160.
   Past those points the tail is thrown away, and on this site the tail is
   "| TherapyLog" — so an over-long title costs the brand, not the keywords.
   The caps are deliberately tight and there is no headroom left: the longest
   title on the site is 60 and the longest description 155. A new page that does
   not fit has to be written shorter rather than have the cap raised.

   Both are also asserted non-empty. A generated page with no description is a
   template bug that no other check would notice. */
const MAX_TITLE = 60;
const MAX_DESC = 155;

PUBLIC.concat(['app.html']).forEach((rel) => {
  const html = read(rel);
  if (html === null) return;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  t(`${rel} has a title of at most ${MAX_TITLE} characters`,
    title.length > 0 && title.length <= MAX_TITLE, `${title.length}: ${title}`);
  t(`${rel} has a description of at most ${MAX_DESC} characters`,
    desc.length > 0 && desc.length <= MAX_DESC, `${desc.length} characters`);
});

/* ---- 2. No unsubstantiated verification or testing claims --------------- */
/* The directory sold a "Verified" badge by tier while telling readers the
   badge was "earned, not bought", and offered "products tested" over sellers
   of unapproved drugs. Neither claim can be substantiated, so neither comes
   back without this failing. */
const BANNED = [
  [/products?\s+tested/i, 'claims products are tested'],
  [/earned,\s*not\s+bought/i, 'claims a paid badge is not paid'],
  [/TherapyLog\s+Verified/i, 'uses the retired "TherapyLog Verified" badge'],
  [/COA\s+authenticity/i, 'claims COA authenticity is verified'],
];
['directory/index.html', 'providers/index.html', 'providers/apply.html',
 'directory/add-partner.html', 'directory/providers-data.js',
 'app.html', 'index.html', '404.html']
  .concat(REFERENCE_PAGES).forEach((rel) => {
  const src = read(rel);
  if (src === null) return;
  BANNED.forEach(([re, why]) => {
    const m = src.match(re);
    t(`${rel} — ${why}`, !m, m ? `found: ${JSON.stringify(m[0])}` : '');
  });
});

/* ---- 3. The directory ships no placeholder listings --------------------- */
/* Worked examples in providers-data.js are not inert: directory/index.html
   reads window.PARTNERS and renders whatever is there, so an "example" peptide
   supplier carrying a verification marker is a published endorsement. */
const partners = read('directory/providers-data.js');
if (partners !== null) {
  const live = partners
    .split('\n')
    .filter((l) => /^\s*id:\s*["']/.test(l))
    .map((l) => l.trim());
  const fake = live.filter((l) => /example|placeholder|test|demo|sample/i.test(l));
  t('no placeholder listings render on /directory', fake.length === 0,
    fake.length ? fake.join(' ') : `${live.length} real listing(s)`);
}

/* ---- 4. Claims the app cannot keep --------------------------------------- */
/* privacy.html described a "General mode" in which no personal data is sent.
   For two releases the app had no such mode and sent a full health profile on
   every message in every mode. If the policy promises the switch, the switch
   has to be in the code. */
const privacy = read('privacy.html');
const app = read('app.html');
if (privacy && app) {
  const promisesGeneral = /General mode/i.test(privacy);
  const hasSwitch = /aiPersonalized\s*\(/.test(app) && /tl_ai_personalize/.test(app);
  t('the "General mode" the policy promises exists in app.html',
    !promisesGeneral || hasSwitch,
    promisesGeneral && !hasSwitch ? 'privacy.html promises it; app.html has no such switch' : '');

  /* And it has to actually gate the payload, not merely exist. */
  const gated = /context:\s*aiPersonalized\(\)\s*\?\s*getFullCtx\(\)\s*:\s*""/.test(app);
  t('the health-context payload is gated on that switch', !promisesGeneral || gated);

  /* Consent before health data first leaves the device. */
  t('app asks before health data first leaves the device',
    /aiCtxConsented\s*\(/.test(app) && /showAICtxConsent\s*\(/.test(app));

  /* The gate attests to the age the Terms require. */
  t('the onboarding gate carries the 18+ attestation the Terms require',
    /18 or older/i.test(app));
  t('the onboarding gate links the privacy policy',
    /therapylog\.app\/privacy/.test(app));
}

/* ---- 5. Commercial email carries what CAN-SPAM requires ----------------- */
/* The API lives in its own repo; skip quietly when it is not checked out
   beside this one rather than failing a site-only CI run. */
const emailLib = (() => {
  for (const p of ['../therapylog-api/api/_lib/email.js', '../../therapylog-api/api/_lib/email.js']) {
    try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch { /* next */ }
  }
  return null;
})();
if (emailLib) {
  t('email footer carries a physical postal address', /POSTAL_ADDRESS/.test(emailLib));
  t('email carries an unsubscribe link', /UNSUB/.test(emailLib));
  t('email sets List-Unsubscribe headers', /List-Unsubscribe/.test(emailLib));
}

/* ---- entitlement coverage ------------------------------------------------ */

/* Every feature TLTier advertises as paid must actually be enforced somewhere.
 *
 * This exists because it was not true. TLTier.check() has always known about
 * nine features, and app.html called it for two of them — so bloodwork trends,
 * clinical reports, blood pressure, symptom logging, cycle tracking, refill
 * alerts and progress check-ins were advertised on /pro and shipped free. The
 * gates are cheap to add and equally cheap to lose in a refactor, so the
 * expected set is derived from TLTier itself rather than hard-coded here: add a
 * feature to the pro/std arrays without gating it and this fails.
 *
 * Call sites must be written out literally as TLTier.check('<feature>'). A
 * lookup map or a computed key would pass a human reading the code and fail
 * this check, which is the intended trade — greppable gates are auditable ones. */
const freeArr = app.match(/var FREE = \[([\s\S]*?)\]/);
const proArr = app.match(/var PRO = \[([^\]]*)\]/);
const paidArr = app.match(/var PAID = \[([\s\S]*?)\]/);
t('TLTier.check() declares FREE, PRO and PAID', !!freeArr && !!proArr && !!paidArr);
if (freeArr && proArr && paidArr) {
  const names = (m) => [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
  const free = names(freeArr), paid = [...names(proArr), ...names(paidArr)];

  const ungated = paid.filter((f) => !new RegExp(`TLTier\\.check\\('${f}'\\)`).test(app));
  t('every paid feature TLTier declares is gated at a call site', ungated.length === 0,
    ungated.length ? `advertised but never enforced: ${ungated.join(', ')}` : '');

  /* The inverse, which matters just as much now the model is an allowlist: a
     feature on the free list must not be sitting behind a gate somewhere. That
     would be a paywall on something the pricing page says is free. */
  const wronglyGated = free.filter((f) => new RegExp(`TLTier\\.check\\('${f}'\\)`).test(app));
  t('no free feature is gated at a call site', wronglyGated.length === 0,
    wronglyGated.length ? `free but gated: ${wronglyGated.join(', ')}` : '');

  const overlap = free.filter((f) => paid.includes(f));
  t('no feature is both free and paid', overlap.length === 0, overlap.join(', '));

  /* Every gated call site must name a feature one of the lists knows about,
     or the console warning fires in production and nobody sees it. */
  const called = [...new Set([...app.matchAll(/TLTier\.check\('([a-z_]+)'\)/g)].map((m) => m[1]))];
  const unknown = called.filter((f) => !free.includes(f) && !paid.includes(f));
  t('every gated call site names a declared feature', unknown.length === 0,
    unknown.length ? `gated but undeclared: ${unknown.join(', ')}` : '');
}

/* ---- report ------------------------------------------------------------- */
const failed = results.filter(([ok]) => !ok);
results.forEach(([ok, name, detail]) => {
  if (!ok) console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`);
});
if (failed.length) {
  console.log(`\ncompliance: ${failed.length} of ${results.length} checks failed`);
  process.exit(1);
}
console.log(`compliance OK: ${results.length} checks — legal links on every public page, ` +
            `no unsubstantiated verification claims, no placeholder listings, ` +
            `the privacy switch the policy promises, every advertised paid feature `+
            `actually gated, and CAN-SPAM email requisites`);
