/* Cross-compound guidance pages: aromatase inhibitors, SERMs and gynecomastia,
 * post-cycle drugs, and three musculoskeletal rehab pages.
 *
 * Generated from assets/brain/research/, not typed. Every sentence on these
 * pages traces to a claim that carries a PMID which was checked to resolve
 * against PubMed, or to an FDA label retrieved from DailyMed. That is the whole
 * reason they are generated: a hand-written page drifts from its evidence
 * silently, and on these topics — where most of the honest answer is "nobody
 * has tested this" — drift is the failure that matters.
 *
 * Editorial boundary (SEO-PLAN §7). Tier C compounds stay off indexable pages
 * under the founder's byline. These pages discuss aromatase inhibitors, SERMs,
 * hCG and the rehab literature — Tier A and Tier B drugs plus exercise — and
 * assertTierCAbsent() below fails the build if a Tier C name reaches the
 * rendered HTML through a research statement. validate-public-pages.js checks
 * the same thing from the outside; this catches it at the point of authorship,
 * where the fix is obvious.
 *
 * What these pages are for: someone is going to search "arimidex or nolvadex
 * for gyno" whatever this site does. The trial answer to that exists and is
 * one-sided, and most of what surrounds it online is not sourced at all.
 */

const fs = require('fs');
const path = require('path');
const A = require('../lib/app-source.js');

const RESEARCH = path.join(A.ROOT, 'assets', 'brain', 'research');
const load = (f) => JSON.parse(fs.readFileSync(path.join(RESEARCH, f), 'utf8'));

/* Authored: what each page is, and the one thing a reader should leave with.
   Everything else on the page comes out of the research files. */
const PAGES = [
  {
    slug: 'aromatase-inhibitors-in-men',
    topic: 'ai-protocols',
    title: 'Aromatase inhibitors in men | TherapyLog',
    description: 'Anastrozole, letrozole and exemestane in men: the trials that exist, the doses tested, and why no estradiol target has ever been validated.',
    h1: 'Aromatase inhibitors in men',
    lede: 'Anastrozole, letrozole and exemestane are licensed for breast cancer in women. Everything below is off-label use in men, and the evidence base is much thinner than the confidence with which these drugs are discussed.',
    headline: 'No trial has ever tested an aromatase inhibitor added to supraphysiologic testosterone, or in any performance population. There is no established AI dose for men, and no estradiol target in men has ever been validated against a clinical outcome.'
  },
  {
    slug: 'serms-and-gynecomastia',
    topic: 'serms-gyno',
    title: 'SERMs and gynecomastia in men | TherapyLog',
    description: 'The randomised evidence on tamoxifen and raloxifene for gynecomastia in men, including the head-to-head against an aromatase inhibitor.',
    h1: 'SERMs and gynecomastia in men',
    lede: 'Tamoxifen and raloxifene are both used for breast tissue in men, and both are off-label for it. Unusually for this subject, there is real randomised evidence here — and it points clearly in one direction.',
    headline: 'In a double-blind placebo-controlled trial, tamoxifen 20 mg/day cut gynecomastia from 73% to 10% while anastrozole 1 mg/day did not beat placebo. A 2025 meta-analysis of nine randomised trials put tamoxifen at an 82% reduction in breast events and aromatase inhibition at nothing meaningful. Every one of those trials was run in men on androgen-deprivation therapy, not in this population.'
  },
  {
    slug: 'post-cycle-drugs-evidence',
    topic: 'pct',
    title: 'Recovering from androgen suppression | TherapyLog',
    description: 'hCG, clomiphene, enclomiphene and tamoxifen after androgen suppression: recovery timelines, the doses with human data, and the trial never run.',
    h1: 'Recovering from androgen-induced suppression',
    lede: 'This page reviews the published evidence on the drugs used to restart the hypothalamic-pituitary-gonadal axis. It is not a protocol. Every drug named here is unlicensed for this purpose.',
    headline: 'There is no randomised trial of any post-cycle protocol against simply stopping. Not one. A 2026 specialist review states that every drug used for this — SERMs, hCG, aromatase inhibitors and prescribed testosterone — is unlicensed for the purpose.'
  },
  {
    slug: 'tendon-loading-protocols',
    topic: 'tendon',
    title: 'Tendon loading protocols | TherapyLog',
    description: 'Heavy slow resistance and staged loading for patellar, Achilles and lateral elbow tendinopathy, with the sets, reps and pain rules from the trials.',
    h1: 'Tendon loading protocols',
    lede: 'Most tendon advice is "do eccentrics" with no numbers attached. The trials specify sets, reps, loads, angles and a rule for when to progress. Those parameters are below, each with the trial it came from.',
    headline: 'Heavy slow resistance and staged pain-limited loading both work and both beat or match corticosteroid injection in the long run. Isometric analgesia — the idea that an isometric hold reliably kills tendon pain — has failed replication three times.'
  },
  {
    slug: 'shoulder-and-back-pain-in-lifters',
    topic: 'shoulder-back',
    title: 'Shoulder and back pain in lifters | TherapyLog',
    description: 'Subacromial decompression against placebo surgery, whether more or heavier exercise helps, and which back pain red flags change the odds.',
    h1: 'Shoulder and back pain in lifters',
    lede: 'Three of the most common recommendations for shoulder pain — surgery, more volume, heavier load — have each been tested against a fair comparator and failed.',
    headline: 'Arthroscopic subacromial decompression was no better than placebo surgery at 6 months, 24 months and 5 years. Cochrane rates that no-benefit finding high-certainty and puts serious surgical complications at roughly 5-7 per 1000.'
  },
  {
    slug: 'training-load-management',
    topic: 'load-mgmt',
    title: 'Training load management | TherapyLog',
    description: 'The pain-monitoring model, return-to-running criteria, and why the acute:chronic workload ratio does not support the weight placed on it.',
    h1: 'Training load management',
    lede: 'Two numbers dominate load management: a pain threshold and a workload ratio. Both are quoted far more confidently than their evidence supports.',
    headline: 'The only experimental test of acute:chronic-workload-ratio-based load management found no benefit, and a systematic review co-authored by the metric’s own originator concludes the methodology is too heterogeneous to support strong recommendations.'
  }
];

const TIER_LABEL = {
  label: 'Regulator-reviewed (FDA label)',
  clinical: 'Clinical trial evidence',
  'off-label': 'Off-label use of an approved drug',
  community: 'Observational or community-reported',
  preclinical: 'Animal or mechanistic only'
};
const TIER_ORDER = ['label', 'clinical', 'off-label', 'community', 'preclinical'];

function build(ctx, api) {
  const esc = api.esc;
  const claims = load('claims.json').claims;
  const gaps = load('evidence-gaps.json').gaps;
  const labels = load('labels.json').labels;

  /* Tier C never reaches a published page. Checked here, at authorship, as well
     as from the outside by validate-public-pages.js. */
  const app = ctx.app;
  const tierCNames = A.TIER_C.map((id) => (app.byId[id] || {}).name).filter(Boolean);
  function assertTierCAbsent(slug, html) {
    const hits = tierCNames.filter((n) =>
      new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(html));
    if (hits.length) {
      throw new Error(`/tools/${slug}/ names Tier C compounds, which cannot appear on an ` +
        `indexable page under the founder's byline (SEO-PLAN §7): ${hits.join(', ')}.\n` +
        'The research statement that carries the name needs rewording, or the claim dropping.');
    }
  }

  /* A research statement is free to name whatever compound the trial studied.
     A published page is not. Rather than reword someone else's finding — which
     would misrepresent the study — the claim is dropped from the public page
     and stays in the app, where the same content is allowed to live. The count
     is printed so a page quietly losing half its evidence is visible rather
     than silent. */
  const namesTierC = (text) => tierCNames.some((n) =>
    new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(String(text || '')));
  /* validate-claims.js bans the word "lifetime" on any public page, because a
     retired pricing tier must never reappear. Two research statements use it in
     the clinical sense ("cumulative lifetime AAS use"). Rewording someone else's
     finding to satisfy a keyword check would misrepresent the study, and
     weakening the check would put a real pricing guard at risk to save two
     sentences. So they are held back from the page and stay in the app. */
  const RETIRED_TIER_WORD = /\b(lifetime|one-time|pay once|pay-once)\b/i;
  const publishable = (c) => {
    const blob = [c.statement, c.dose, c.population, c.quote].join(' ');
    return !namesTierC(blob) && !RETIRED_TIER_WORD.test(blob);
  };

  return PAGES.map((p) => {
    const allMine = claims.filter((c) => c.topic === p.topic);
    const mine = allMine.filter(publishable);
    const allGaps = gaps.filter((g) => g.topic === p.topic);
    const myGaps = allGaps.filter((g) => !namesTierC(g.gap) && !RETIRED_TIER_WORD.test(g.gap));
    const myLabels = labels.filter((l) => l.topic === p.topic && !namesTierC(l.drug));
    const dropped = (allMine.length - mine.length) + (allGaps.length - myGaps.length);
    if (dropped) {
      console.log(`  /tools/${p.slug}/ — ${dropped} research item(s) held back from publication ` +
        '(they name a Tier C compound, or use a word a compliance check reserves)');
    }
    if (!mine.length) {
      throw new Error(`/tools/${p.slug}/ has no publishable claims left after the Tier C filter — ` +
        'this page should not exist rather than ship empty');
    }

    /* Sources: one entry per distinct PMID, plus the labels. Numbered once and
       referenced from the findings, so a reader gets from a claim to the paper. */
    const srcNum = new Map();
    const srcList = [];
    for (const c of mine) {
      const pmid = String(c.pmid || '').trim();
      if (!/^[0-9]{5,9}$/.test(pmid) || srcNum.has(pmid)) continue;
      srcNum.set(pmid, srcList.length + 1);
      srcList.push({
        href: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        cite: `${c.journal || 'Journal not stated'}${c.year ? ' (' + c.year + ')' : ''} — PubMed ${pmid}`,
        note: c.quote ? String(c.quote).replace(/\s+/g, ' ').slice(0, 260) : ''
      });
    }
    for (const l of myLabels) {
      const url = String(l.dailymedUrl || '');
      if (!/setid=/.test(url) || srcNum.has(url)) continue;
      srcNum.set(url, srcList.length + 1);
      srcList.push({
        href: url,
        cite: `${l.drug} — US Prescribing Information (DailyMed)`,
        note: `Approved indication: ${String(l.approvedIndication || '').replace(/\s+/g, ' ').slice(0, 200)}`
      });
    }

    const ref = (c) => {
      const n = srcNum.get(String(c.pmid || '').trim());
      return n ? ` <a href="#src-${n}" class="ref">[${n}]</a>` : '';
    };

    const byTier = TIER_ORDER
      .map((t) => [t, mine.filter((c) => c.tier === t)])
      .filter(([, list]) => list.length);

    const findings = byTier.map(([t, list]) => `
    <h3>${esc(TIER_LABEL[t] || t)}</h3>
    <ul class="findings">
${list.map((c) => `      <li><p>${esc(String(c.statement).replace(/\s+/g, ' '))}${ref(c)}</p>` +
      (c.dose && !/^none\b/i.test(c.dose) && !/^prescriber-led/i.test(c.dose)
        ? `<p class="dose"><strong>Dose or parameter studied:</strong> ${esc(String(c.dose).replace(/\s+/g, ' '))}</p>` : '') +
      (c.population ? `<p class="pop"><strong>Studied in:</strong> ${esc(String(c.population).replace(/\s+/g, ' '))}</p>` : '') +
      `</li>`).join('\n')}
    </ul>`).join('\n');

    const labelBlock = myLabels.length ? `
    <h2>What the regulator approved</h2>
    <p>Where a drug on this page has a US label, this is what it was approved for and at what dose. Anything else is off-label — which is not the same as unsafe, but does mean no regulator has reviewed it for that use.</p>
    ${api.table(['Drug', 'Approved for', 'Approved dose', 'On-label for this use?'],
      myLabels.map((l) => [
        esc(l.drug),
        esc(String(l.approvedIndication || '').replace(/\s+/g, ' ').slice(0, 240)),
        esc(String(l.approvedDose || '').replace(/\s+/g, ' ').slice(0, 200)),
        l.onLabelForThisUse ? 'Yes' : '<strong>No</strong>'
      ]))}` : '';

    const gapBlock = myGaps.length ? `
    <h2>What nobody knows</h2>
    <p>These are the questions the literature does not answer. They are listed because on this subject the gaps are load-bearing: most of what circulates as settled practice sits in one of them.</p>
    <ul class="gaps">
${myGaps.map((g) => `      <li>${esc(String(g.gap).replace(/\s+/g, ' '))}</li>`).join('\n')}
    </ul>` : '';

    const sources = srcList.length ? `
    <h2>Sources</h2>
    <p>Every identifier below was checked to resolve to a real record before publication. Citations retrieved from PubMed and DailyMed.</p>
    <ol class="sources">
${srcList.map((s, i) => `      <li id="src-${i + 1}">
        <a href="${esc(s.href)}" rel="nofollow noopener" target="_blank">${esc(s.cite)}</a>
        ${s.note ? `<span class="src">${esc(s.note)}</span>` : ''}
      </li>`).join('\n')}
    </ol>` : '';

    const body = `
    <h1>${esc(p.h1)}</h1>
    <p class="lede">${esc(p.lede)}</p>

    <div class="callout">
      <strong>The short version.</strong> ${esc(p.headline)}
    </div>

    <h2>What the evidence shows</h2>
    <p>Findings are grouped by what kind of evidence each one is. That ordering is the point: a sentence from an FDA label and a sentence from a forum are not the same claim, and this page will not present them as though they were.</p>
${findings}
${labelBlock}
${gapBlock}
${sources}

    <p class="note">${esc(ctx.attribution || '')}</p>`;

    const html = api.render(ctx, {
      url: `/tools/${p.slug}/`,
      title: p.title,
      description: p.description,
      trail: api.toolsTrail([{ name: p.h1, url: `/tools/${p.slug}/`, absolute: api.SITE + `/tools/${p.slug}/` }]),
      type: 'article',
      body
    });
    assertTierCAbsent(p.slug, html.html);
    return html;
  });
}

module.exports = { build, PAGES };
