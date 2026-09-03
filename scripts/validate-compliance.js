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
const PUBLIC = ['index.html', 'download.html', 'pro.html', 'guide.html',
                'partnership.html', 'privacy.html', 'terms.html',
                'health-data-privacy.html', 'directory/index.html',
                'providers/index.html', 'providers/apply.html',
                /* Reference pages published under the founder's byline. The
                   author page ships first because every later page links it. */
                'about/index.html', 'tools/index.html', 'markers/index.html',
                /* Reachable by definition, and it carries the legal links. */
                '404.html'];

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
 'app.html', 'index.html',
 'about/index.html', 'tools/index.html', 'markers/index.html', '404.html'].forEach((rel) => {
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
            `the privacy switch the policy promises, and CAN-SPAM email requisites`);
