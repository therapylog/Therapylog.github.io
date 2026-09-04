/* /compounds/<slug>/ — one page per publishable compound (SEO-PLAN §7).
 *
 * What is app data and what is authored, and why the split is where it is:
 *
 *   From app.html, unchanged: the name and aliases, the class, the regulatory
 *   string, the PK row, the storage rule, the monitoring panel, the drawbacks
 *   list, the dosing rows that survive the strip filter, and the interaction
 *   rules that name the compound. Those are facts the app already stands
 *   behind, and lifting them means a page cannot drift from the app.
 *
 *   Authored per compound: everything in prose. The app's `summary` and `pros`
 *   are not rendered anywhere. `summary` carries editorial lines like "arguably
 *   the most promising longevity compound", and `pros` is a benefits list —
 *   both read as advertising under a founder's byline on an indexable page, so
 *   the prose here makes the same points where they are true, with the evidence
 *   tier attached. `cons` IS rendered: publishing the drawbacks is harm
 *   reduction, publishing the benefits is marketing. The asymmetry is
 *   deliberate and the page says so.
 *
 *   `stacks[]` is not rendered at all. §7 only asks that groups naming a Tier C
 *   compound be stripped, but a combination protocol under this byline is a
 *   recommendation to run it, which is exactly what B-5 in §9 forbids. The
 *   combination content lives on /tools/stack-checker/, which is framed as a
 *   safety check rather than a protocol. Not rendering it also removes the last
 *   route by which a Tier C name could reach one of these pages.
 *
 * Tier A pages and Tier B pages are the same template with one difference: a
 * Tier B page opens with the regulatory block, carrying the app's own approval
 * string, the storage caveat and the sourcing warning. §7 requires that.
 *
 * The curve is not repeated here when /tools/half-life/<slug>/ exists — the two
 * pages would then compete for the same query with the same figure. Compounds
 * with published PK and no half-life page get the single-dose curve; the rest
 * get a prominent link. */

const shell = require('./shell.js');
const curve = require('./curve.js');
const A = require('../lib/app-source.js');

/* Marker pages whose analyte the compound's monitoring panel actually names.
   Same alias matching markers-lib.monitoredBy() uses, run the other way round,
   so the internal links are derived from the app's data rather than chosen by
   an author — and a monitoring note that stops naming a marker silently drops
   the link rather than leaving a wrong one. */
function markerLinks(ctx, entry) {
  const { MARKERS } = require('./pages-markers.js');
  const mon = entry.mon || entry.monitoring;
  const text = String(Array.isArray(mon) ? mon.join('; ') : (mon || '')).toLowerCase();
  if (!text) return [];
  const out = [];
  for (const mk of Object.values(MARKERS)) {
    const hit = mk.keys.some((k) => {
      const m = ctx.reg.MARKER_REGISTRY[k];
      if (!m) return false;
      return (m.aliases || []).some((a) => text.includes(String(a).toLowerCase()));
    });
    if (hit) out.push(mk);
  }
  return out;
}

/* The evidence tier a dosing table is shown under, from the app's own
   regulatory string and PK flags rather than an author's judgement. */
function doseEvidence(api, entry, pk) {
  const reg = api.regStatus(entry) || '';
  if (/FDA APPROVED|FDA approved/.test(reg) && !/not fda approved|no fda approval/i.test(reg)) {
    return api.EV.established;
  }
  if (pk && pk.est) return api.EV.theoretical;
  return api.EV.offlabel;
}

/* The Tier B regulatory block. §7: every Tier B page shows the approval or
   reg.status string, the storage caveat, and pairs with no vendor. */
function regulatoryBlock(api, app, entry, tier) {
  if (tier !== 'B') return '';
  const reg = api.regStatus(entry);
  const store = app.storageFor(entry.id);
  return `    <div class="note reg">
      <p><strong>Regulatory status.</strong> ${api.esc(reg || 'No approval recorded in the app’s reference.')}
      That is the app’s own field, reproduced here rather than summarised. It means no
      regulator has reviewed a manufacturer’s evidence for identity, purity, potency or
      safety in people for this compound, so nothing below is a marketing claim about a
      product you can buy.</p>
      <p>Purity, identity and concentration are therefore unverified by anyone but whoever made
      the vial. ${store ? `The storage rule in the fact box below is general practice for this
      formulation rather than a specification for a particular product:
      <em>${api.esc(app.TL_STORAGE.caveat)}</em>` : ''}</p>
      <p>This page names no vendor, no clinic and no testing service, and there is no discount
      code anywhere on this site &mdash; the moment a page like this recommends where to buy, it
      stops being information.</p>
    </div>`;
}

function build(ctx, api) {
  const { app, attribution, W } = ctx;
  A.assertTiers(app.byId);
  const HL_SLUGS = Object.fromEntries(
    Object.entries(require('./pages-halflife.js').PAGES).map(([id, p]) => [id, p.slug]));
  const pkCurve = new Function(A.fnSource(app.src, 'pkCurve') + '; return pkCurve;')();
  const out = [];

  for (const [id, def] of Object.entries(COMPOUNDS)) {
    const entry = app.byId[id];
    if (!entry) throw new Error('compound page for unknown id: ' + id);
    const tier = A.tierOf(id);
    if (tier === 'C') throw new Error('Tier C compound reached a public page: ' + id);
    if (tier !== 'A' && tier !== 'B') throw new Error('untiered compound: ' + id);

    const url = `/compounds/${def.slug}/`;
    const pk = app.TL_PK[id];
    const hasPk = !!(pk && pk.hl != null);
    const hlSlug = HL_SLUGS[id];
    const pairs = api.pairsNaming(app, id, A.isTierC);
    const doses = api.publishableDoses(entry);
    const markers = markerLinks(ctx, entry);

    const prose = def.sections.map((sec) => [
      `    <h2>${api.esc(sec.h2)}</h2>`,
      sec.paras.map((p) => '    <p>' + p
        .replace(/@@EV_ESTABLISHED@@/g, api.EV.established)
        .replace(/@@EV_OFFLABEL@@/g, api.EV.offlabel)
        .replace(/@@EV_THEORETICAL@@/g, api.EV.theoretical)
        .replace(/\s+/g, ' ').trim() + '</p>').join('\n')
    ].join('\n')).join('\n\n');

    /* The curve, only where it is not already the substance of another page. */
    const curveBlock = (hasPk && !hlSlug) ? (() => {
      const f = pkCurve(pk.hl, pk.tmax);
      const single = curve.singleDose(f, pk.hl, pk.tmax, entry.name);
      return [
        `    <h2>How long one dose lasts</h2>`,
        `    <figure class="curve">
${single.svg}
      <figcaption>Modelled level after a single dose as a percentage of that dose&rsquo;s own
      peak, rising to the peak at ${curve.fmtHours(pk.tmax)} and falling by half every
      ${curve.fmtHours(pk.hl)}. Drawn with the app&rsquo;s own <code>pkCurve</code> function.
      The vertical axis is relative: the shape carries across people, the absolute
      concentration does not.${pk.est ? ' This compound’s half-life is flagged as an estimate in the app, so read the curve as the right shape rather than the right numbers.' : ''}</figcaption>
      </figure>`,
        `    <p>Try other intervals on the <a href="/tools/half-life-calculator/">half-life and
      steady-state calculator</a>, which runs the same function against whatever cadence you
      type.</p>`
      ].join('\n\n');
    })() : '';

    const pkPointer = (hasPk && hlSlug) ? `    <p>The curve, the accumulation ratio and the
      peak-to-trough figures have a page of their own: <a href="/tools/half-life/${hlSlug}/">${api.esc(entry.name)}
      half-life and steady state</a>.</p>` : '';

    const doseBlock = doses.length ? [
      `    <h2>The dosing rows the app records</h2>`,
      `    <p>${doseEvidence(api, entry, pk)} Reproduced from the app&rsquo;s reference so you can
      see what it holds, not as a recommendation. Which row applies to a particular person, if
      any, is a clinical decision this page does not make &mdash; and rows describing
      supraphysiological or post-cycle use are filtered out before this table is built, so what
      you see here is a subset.</p>`,
      api.table(['Label', 'Amount', 'Route and frequency', 'Duration recorded'],
        doses.map((r) => [api.esc(r.l), api.esc(r.d), api.esc(r.f || '—'), api.esc(r.c || '—')]))
    ].join('\n\n') : '';

    const monBlock = api.monPanel(entry) ? [
      `    <h2>What the app monitors alongside it</h2>`,
      `    <p>The panel below is the app&rsquo;s own monitoring note for ${api.esc(entry.name)},
      verbatim. ${markers.length
        ? `The analytes in it that have a page here are linked; those pages cover what each one measures, which assay produced it and how to read a trend.`
        : `None of the analytes it names has a page here yet.`}</p>`,
      `    <div class="facts">
      <dl>
        <dt>Monitoring panel</dt><dd>${api.esc(api.monPanel(entry))}</dd>
      </dl>
    </div>`,
      markers.length ? `    <ul class="mon-list">\n` + markers.map((mk) =>
        `      <li><a href="/markers/${mk.slug}/">${api.esc(mk.h1.split(':')[0])}</a></li>`).join('\n') +
        `\n    </ul>` : ''
    ].filter(Boolean).join('\n\n') : '';

    const consBlock = (entry.cons && entry.cons.length) ? [
      `    <h2>Drawbacks and risks the app records</h2>`,
      `    <p>${def.consLede.replace(/\s+/g, ' ').trim()}</p>`,
      `    <ul class="cards risks">\n` +
        [...new Set(entry.cons)].map((c) => `      <li>${api.esc(c)}</li>`).join('\n') +
        `\n    </ul>`,
      `    <div class="shared">
      <p>That list is the app&rsquo;s, not a complete adverse-effect profile, and none of it is a
      diagnosis. Anything on it that you are actually experiencing belongs in front of the
      clinician who prescribes or supervises for you &mdash; they are the only person who can
      weigh it against your history, your other medications and your bloodwork.</p>
    </div>`
    ].join('\n\n') : '';

    const pairBlock = pairs.length ? [
      `    <h2>Interaction rules that name ${api.esc(entry.name)}</h2>`,
      `    <p>From the app&rsquo;s interaction data, filtered so no rule naming a compound this
      site does not publish appears. Not exhaustive, and not a safety clearance: a combination
      that is not listed is one nobody has documented here, which is not the same as one that
      is fine. The <a href="/tools/stack-checker/">combination checker</a> has the rest.</p>`,
      `    <div class="pairs">\n${api.pairBlocks(pairs)}\n    </div>`
    ].join('\n\n') : '';

    const basisBlock = def.basis && def.basis.length ? [
      `    <h2>Where the load-bearing numbers come from</h2>`,
      `    <p>Named rather than linked. Publisher URLs move, and a citation that resolves to a
      404 two years from now is worse than one you can search for by name &mdash; every entry
      below is findable from the title and year alone.</p>`,
      `    <div class="facts">
      <dl>
${def.basis.map(([k, v]) => `        <dt>${api.esc(k)}</dt><dd>${api.esc(v)}</dd>`).join('\n')}
      </dl>
    </div>`
    ].join('\n\n') : '';

    const body = [
      `    <h1>${api.esc(def.h1)}</h1>`,
      `    <p class="lede">${def.lede.replace(/\s+/g, ' ').trim()}</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
      regulatoryBlock(api, app, entry, tier),
      api.factBox([
        ['Also known as', api.esc(entry.aka || '—')],
        ['Class', api.esc(entry.clsName)],
        api.regStatus(entry) ? ['Regulatory status', api.esc(api.regStatus(entry))] : null,
        ...api.pkRows(app, id),
        ...api.storageRows(app, id)
      ]),
      prose,
      curveBlock,
      pkPointer,
      doseBlock,
      monBlock,
      consBlock,
      pairBlock,
      `    <h2>Questions people actually ask</h2>`,
      api.faq(def.faq),
      basisBlock,
      shell.ctaBox('compound-' + def.slug, def.cta)
    ].filter(Boolean).join('\n\n');

    out.push(api.render(ctx, {
      url,
      title: def.title,
      description: def.description,
      type: 'Article',
      calcDisclaimer: false,
      trail: [
        { name: 'Home', url: '/', absolute: api.SITE + '/' },
        { name: 'Compounds', url: '/compounds/', absolute: api.SITE + '/compounds/' },
        { name: entry.name, url, absolute: api.SITE + url }
      ],
      body,
      script: W.prologue({ attribution })
    }));
  }

  return out;
}

/* Authored content lives in its own file: SEO-PLAN §7 rolls these out twenty at
   a time, so the prose grows and the assembly above does not. */
const COMPOUNDS = require('./compounds-content.js');

module.exports = { build, COMPOUNDS, markerLinks };
