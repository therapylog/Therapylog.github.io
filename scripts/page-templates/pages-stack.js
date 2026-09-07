/* /tools/stack-checker/ — "can you take X with Y".
 *
 * The widget is app.html's own checkInteractions() over app.html's own merged
 * interaction array, with every pair naming a Tier C compound removed at build
 * time. Every surviving pair is also rendered statically below the widget with
 * its own anchor, because that is the indexable version — fifty pages of
 * fifteen-to-forty-word descriptions would be fifty thin pages.
 *
 * Not called an "interaction checker" in the title or the slug: that phrase
 * returns academic protein-binding papers, while the demand is phrased "stack
 * checker" and "can you take X with Y" (SEO-PLAN §5.3). */

const shell = require('./shell.js');

const SEV_LABEL = { danger: 'Do not combine', warn: 'Caution', info: 'Worth knowing' };
const SEV_ORDER = ['danger', 'warn', 'info'];
const SEV_INTRO = {
  danger: 'Pairs the app flags as ones to avoid outright. In most cases the reason is that the ' +
          'two do the same job by the same mechanism, so combining them multiplies the side ' +
          'effects without adding an effect.',
  warn: 'Pairs that are used together but need something watched while they are. The monitoring ' +
        'line on each is the part that matters.',
  info: 'Pairs with a real interaction that is not a problem — usually one worth understanding ' +
        'so a lab result or a symptom later is not a surprise.'
};

const anchorFor = (ix) => 'x-' + ix.drugs.map((d) => d.toLowerCase()
  .replace(/\([^)]*\)/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).join('-with-');

function build(ctx, api) {
  const { app, attribution, W, A } = ctx;

  /* Resolve every name, drop every pair that names a Tier C compound. A name
     that stops resolving is a build failure, not a silently dropped pair —
     that is what keeps the tier filter honest when a DB entry is renamed. */
  const resolved = app.INTERACTIONS.map((ix) => {
    const ids = ix.drugs.map((d) => {
      const id = app.resolveDrugName(d);
      if (!id) {
        throw new Error(`interaction pair names "${d}", which resolves to no compound id. ` +
          'Add it to DRUG_NAME_TO_ID in scripts/lib/app-source.js.');
      }
      return id;
    });
    return { ix, ids };
  });
  const pairs = resolved.filter((r) => !r.ids.some(A.isTierC)).map((r) => r.ix);
  const dropped = resolved.length - pairs.length;

  /* The selects are populated from the names the surviving pairs actually use,
     so nothing selectable produces "no interaction found" for the wrong reason. */
  const compounds = [...new Set(pairs.flatMap((p) => p.drugs))].sort((a, b) => a.localeCompare(b));

  const widget = W.interactionWidget(app.src, { compounds, pairs });

  const grouped = SEV_ORDER.map((sev) => {
    const list = pairs.filter((p) => p.severity === sev)
      .sort((a, b) => a.drugs.join().localeCompare(b.drugs.join()));
    if (!list.length) return '';
    const blocks = list.map((ix) => `      <div class="pair ${api.esc(ix.severity)}" id="${anchorFor(ix)}">
        <div class="sev">${api.esc(SEV_LABEL[ix.severity])}</div>
        <h3>Can you take ${api.esc(ix.drugs.slice(0, -1).join(', '))} with ${api.esc(ix.drugs[ix.drugs.length - 1])}?</h3>
        <p><strong>${api.esc(ix.title)}</strong></p>
        <p>${api.esc(ix.desc)}</p>
        <p class="mon"><strong>What to watch:</strong> ${api.esc(ix.monitor)}</p>
      </div>`).join('\n');
    return `    <h2 id="sev-${sev}">${api.esc(SEV_LABEL[sev])} &mdash; ${list.length} pair${list.length === 1 ? '' : 's'}</h2>

    <p>${api.esc(SEV_INTRO[sev])}</p>

    <div class="pairs">
${blocks}
    </div>`;
  }).filter(Boolean).join('\n\n');

  const body = [
    `    <h1>Can you take these together?</h1>`,
    `    <p class="lede">${pairs.length} documented pairs across testosterone ancillaries,
    GLP-1 medications and research peptides — what the interaction is, why it happens, and what
    to watch if you are taking both. Free, no account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p>The checkers that exist for this are almost all peptide-only and almost all run by
    someone selling peptides. This one covers the ancillaries and metabolic drugs people
    actually combine with them — aromatase inhibitors, SERMs, HCG, thyroid hormone, GLP-1
    agonists — because that is where the combinations that matter tend to be.</p>`,
    `    <p>Pick two or three below and the app's own checker runs over the same
    ${pairs.length} pairs. Every pair is also written out further down the page with its own
    heading, so you can read the one you came for without using the widget at all.</p>`,
    widget.html,
    `    <div class="note">
      <p><strong>This is not a safety clearance, and the list is not exhaustive.</strong> A
      blank result means none of these ${pairs.length} pairs matched what you picked — not that
      the combination is fine. Curated interaction data covers the combinations someone thought
      to document; prescription interactions in particular are far broader than this, and your
      pharmacist can check a full profile against everything you take, including the things
      this list has never heard of. Take any combination you are unsure about to them or to
      your prescribing clinician.</p>
    </div>`,
    `    <h2>Every pair, by severity</h2>`,
    `    <p>Grouped by how the app flags them. The wording is the app's own, so this page and
    the app cannot tell you different things about the same pair.</p>`,
    grouped,
    `    <h2>How this list is put together, and what it leaves out</h2>`,
    `    <p>The pairs come from the app's own interaction data — three curated lists, merged,
    which is exactly what the app does at load. ${dropped > 0 ? `${dropped} pairs are not shown
    here because they name a compound this site does not publish pages about; they are still in
    the app.` : ''} No pair here was generated automatically: each one is a documented
    interaction with a stated mechanism and a stated thing to monitor.</p>`,
    `    <p>What that means for the gaps: a combination missing from this page is one nobody has
    written up in this dataset, and the honest reading of a blank result is "unknown", not
    "safe". Two compounds with no listed interaction can still interact through something none
    of these lists model — a shared metabolic pathway, an additive effect on blood pressure or
    haematocrit, or simply the total load of two things at once.</p>`,
    `    <p>${api.EV.established} Interactions involving approved medicines (aromatase
    inhibitors, SERMs, thyroid hormone, GLP-1 agonists) rest on clinical pharmacology and
    labelling. ${api.EV.offlabel} Interactions between research peptides, and between peptides
    and approved drugs, are largely reasoning from mechanism plus community experience — they
    are worth knowing and they are not the same grade of evidence. Where a pair is the second
    kind, its description says what it is based on.</p>`,
    `    <p>Related: <a href="/tools/syringe-builder/">the combined syringe planner</a> covers a
    different compatibility question — whether two compounds can share one draw, which is about
    the solutions rather than about you.</p>`,
    shell.ctaBox('stack-checker',
      'The app runs this check against what you have actually logged, so it flags a pair you are already taking rather than one you thought to ask about.',
      'Open the app')
  ].join('\n\n');

  return [api.render(ctx, {
    url: '/tools/stack-checker/',
    title: 'Can you take these together? Combination check | TherapyLog',
    description: `${pairs.length} documented interaction pairs across testosterone ancillaries, ` +
      'GLP-1 medications and peptides — the mechanism and what to watch. Free, no account.',
    trail: api.toolsTrail([{ name: 'Combination checker', url: '/tools/stack-checker/',
                            absolute: api.SITE + '/tools/stack-checker/' }]),
    calcDisclaimer: false,
    body,
    script: W.prologue({ attribution, gate: true }) + '\n\n' + widget.fns
  })];
}

module.exports = { build, anchorFor };
