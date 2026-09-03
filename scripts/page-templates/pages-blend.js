/* Pre-mixed multi-peptide vials — the "blend" pages.
 *
 * These exist because a blend changes the arithmetic in a way single-compound
 * calculators hide. Everything in one vial is dissolved in the same water, so a
 * draw takes every component in the ratio whoever filled the vial chose. You do
 * not get to dose one of them: you dose the vial, and the rest come along in
 * proportion.
 *
 * That is the whole point of the page, and it is a harm-reduction point rather
 * than a marketing one. The generator computes the mismatch from the app's OWN
 * dosing rows for each component (DB.doses), so the numbers are the app's, not
 * an author's opinion — and validate-public-pages.js re-derives every published
 * row by running app.html's real calcUnified() against each component.
 *
 * The visible calculator is the app's #tool-calc widget, unchanged, driven at
 * the component you are anchoring on. The split panel below it is one
 * multiplication, and the page prints that multiplication.
 */

const shell = require('./shell.js');
const recon = require('./pages-recon.js');

/* ---- the blends --------------------------------------------------------- */

/* `mg` is a REFERENCE vial, not a specification. Blend vials are compounded by
   whoever sells them and the ratios vary; every page says so and the widget
   takes the numbers off the reader's own label. The reference exists so the
   worked example has real numbers in it. */
const BLENDS = {
  wolverine: {
    slug: 'bpc-157-tb-500-blend-calculator',
    title: 'BPC-157 and TB-500 blend calculator',
    h1: 'BPC-157 and TB-500 blend: what one draw actually delivers',
    /* Community nickname. Kept out of the slug, the title and the h1 on
       purpose — it is somebody else's trademark in another field — but it is
       what people type, so it is named in the copy and answered in an FAQ. */
    nickname: 'Wolverine blend',
    alsoCalled: ['Wolverine blend', 'Wolverine stack', 'BPC/TB blend'],
    components: [
      { id: 'bpc', mg: 5 },
      { id: 'tb5', mg: 5 }
    ],
    bacMl: 2,
    lede: `A 1:1 BPC-157 and TB-500 vial cannot deliver both at the amounts the literature
           describes for each on its own. Work out what your draw really contains, in both
           compounds at once.`,
    intro: [
      `The most common pre-mixed peptide vial in circulation holds BPC-157 and TB-500 together,
       usually five milligrams of each at the low end and ten of each further up. It is widely
       called the <strong>Wolverine blend</strong>, and the reason people buy it is obvious
       enough: two repair peptides, one reconstitution, one injection.`,
      `The arithmetic is where it gets interesting, and it is not the arithmetic most people
       expect. Both compounds are dissolved in the same water, so <strong>every draw takes them
       in whatever ratio is in the vial</strong>. You cannot dose one without dosing the other.
       That would be unremarkable if the two were dosed alike. They are not — and the gap is
       large enough to be the main thing worth knowing before you mix a vial.`
    ],
    /* The mismatch section is generated from the components' own DB dose rows. */
    mismatch: true,
    why: [
      `BPC-157 is a synthetic pentadecapeptide with a modelled half-life of about four hours —
       an estimate, from limited data — which is why the schedules in circulation are daily or
       twice daily. TB-500 is a synthetic fragment of thymosin beta-4 with a modelled half-life
       of about two days, also an estimate, and its schedules are weekly or twice weekly.`,
      `So the two compounds disagree about frequency as well as amount. A blend injected daily
       to suit the first gives seven TB-500 injections a week; injected weekly to suit the
       second, it gives one BPC-157 injection a week. There is no schedule that is the usual
       schedule for both, and the vial cannot separate them. Neither compound is approved for
       human use anywhere, and none of this is a recommendation to run either — it is what the
       ratio does once the vial is mixed.`
    ],
    faqExtra: [
      ['Is this the "Wolverine blend"?',
        [`Yes — "Wolverine blend" and "Wolverine stack" are the names this BPC-157 and TB-500
          combination circulates under in peptide communities. It is a nickname rather than a
          product: there is no standard formulation behind it, and two vials sold under the
          name can hold different amounts and different ratios. That is exactly why this page
          asks you to enter what is on your own label rather than assuming a recipe.`]],
      ['Is a blend cheaper or more convenient than separate vials?',
        [`Cheaper per milligram, often. More convenient, only if the ratio happens to suit you.
          Separate vials cost more and take two draws, but they let you set each compound's
          amount and schedule independently, which a fixed-ratio vial cannot. That trade —
          convenience against control — is the real decision, and the numbers above are what
          you are trading away.`]],
      ['Can I just inject more to get enough TB-500?',
        [`You can draw more, and the calculator will tell you exactly what that costs you in
          BPC-157, which climbs in lockstep. Whether the resulting amount of either compound is
          appropriate is not an arithmetic question and this page will not answer it. There is
          no human trial data establishing a safe amount for either compound, and that is the
          honest state of the evidence. Take it to a clinician who can look at your whole
          picture.`]]
    ]
  },

  glow: {
    slug: 'glow-peptide-blend-calculator',
    title: 'GLOW peptide blend calculator',
    h1: 'GLOW blend: what one draw actually delivers',
    nickname: 'GLOW',
    alsoCalled: ['GLOW blend', 'GLOW peptide blend'],
    components: [
      { id: 'ghkcu', mg: 50 },
      { id: 'bpc', mg: 10 },
      { id: 'tb5', mg: 10 }
    ],
    bacMl: 5,
    lede: `GHK-Cu, BPC-157 and TB-500 in one vial, at a ratio the compounder chose. Work out
           what a single draw delivers of each — the three are not close to equally dosed.`,
    intro: [
      `GLOW is a three-peptide vial: <strong>GHK-Cu, BPC-157 and TB-500</strong>, the name being
       a loose acronym rather than a formulation. There is no standard recipe. A frequently
       circulated ratio is 50 mg of GHK-Cu to 10 mg each of BPC-157 and TB-500, which is the
       reference this page's worked example uses — but yours may differ, and the only reliable
       source for what is in your vial is the label on it.`,
      `The ratio matters more here than in a two-peptide blend, because the components are
       further apart. At 50:10:10 the vial is five parts GHK-Cu to one part of each of the
       others, so any draw is dominated by the copper peptide. Whether that suits what you are
       trying to do is not something a calculator can tell you — but what the draw contains
       is, and that is worth knowing before it is in a syringe.`
    ],
    mismatch: true,
    why: [
      `GHK-Cu is a naturally occurring copper-binding tripeptide, best evidenced topically,
       where its use is cosmetic and over the counter. Injected use is research only, with no
       approval anywhere, and it is the component that carries a genuinely dose-dependent
       consideration the other two do not: it carries copper. The app's own monitoring note
       for it says to watch copper levels with extended high-dose use, and a blend that is
       mostly GHK-Cu by mass is how someone ends up at a higher intake than they realise.`,
      `BPC-157 and TB-500 are both research compounds with no human approval and modelled
       half-lives — four hours and about two days — that are estimates rather than published
       human figures. As in any blend, their schedules and GHK-Cu's cannot be set separately
       once they share a vial.`
    ],
    faqExtra: [
      ['What does GLOW stand for?',
        [`Nothing official. It circulates as a name for a GHK-Cu, BPC-157 and TB-500 vial, and
          different sellers use it for different ratios and sometimes different components.
          Treat the name as a rough description of the contents, not a specification, and read
          your own label.`]],
      ['Is the copper in GHK-Cu something to think about?',
        [`It is the one component here with an accumulation question attached, and it is why
          this page shows the GHK-Cu number first. The app's monitoring guidance for GHK-Cu is
          to keep an eye on copper levels with extended high-dose use. A blend where GHK-Cu is
          the bulk of the mass makes that easier to overlook, not harder. If you are using one
          for any length of time, that is a conversation for a doctor, with a copper level in
          front of you rather than an estimate.`]]
    ]
  },

  klow: {
    slug: 'klow-peptide-blend-calculator',
    title: 'KLOW peptide blend calculator',
    h1: 'KLOW blend: what one draw actually delivers',
    nickname: 'KLOW',
    alsoCalled: ['KLOW blend', 'KLOW peptide blend'],
    components: [
      { id: 'kpv', mg: 10 },
      { id: 'ghkcu', mg: 50 },
      { id: 'bpc', mg: 10 },
      { id: 'tb5', mg: 10 }
    ],
    bacMl: 5,
    lede: `KPV added to the GLOW three. Four peptides, one ratio, one draw — here is what that
           draw contains of each.`,
    intro: [
      `KLOW is GLOW with <strong>KPV</strong> added: four peptides in one vial, and the same
       structural problem as any blend, one component worse. A frequently circulated ratio is
       10 mg of KPV and 50 mg of GHK-Cu to 10 mg each of BPC-157 and TB-500, which is the
       reference below — but as with every blend on this site, there is no standard and your
       label is the only authority on your vial.`,
      `Four components in a fixed ratio means four dosing schedules collapsed into one. KPV's
       own described use is largely daily, and much of the interest in it is oral rather than
       injected — which a vial mixed for injection settles for you whether or not that is what
       you wanted.`
    ],
    mismatch: true,
    why: [
      `KPV is the C-terminal tripeptide of alpha-MSH, studied for anti-inflammatory effects
       through NF-κB inhibition, with much of the interest in gut conditions and much of the
       described use oral. It has an Orphan Drug Designation in progress for IBD and is not FDA
       approved. Putting it in an injectable blend is a route decision made by whoever mixed
       the vial, not by the evidence.`,
      `The other three behave as described on the GLOW page: GHK-Cu carries the copper
       consideration and usually the bulk of the mass, and BPC-157 and TB-500 disagree with
       each other about frequency before the other two are even counted. None of the four is
       approved for injected human use.`
    ],
    faqExtra: [
      ['What is the difference between KLOW and GLOW?',
        [`KPV. GLOW circulates as GHK-Cu, BPC-157 and TB-500; KLOW is the same three with KPV
          added. Both names are community shorthand rather than formulations, so the ratios and
          even the component lists vary between sellers. Whichever you have, the arithmetic on
          this page is the same: one draw, every component, in the vial's ratio.`]],
      ['Should I take KPV orally instead?',
        [`A good deal of the published interest in KPV is in gut conditions, where oral dosing
          is the route being studied, and the app's own dosing reference lists both an oral and
          a subcutaneous entry for it. A blend vial mixed for injection has made that choice
          already. Whether the route you want matches the route your vial supports is worth
          settling before you mix it, and the question of which is appropriate for you belongs
          with a clinician.`]]
    ]
  }
};

/* ---- generated sections ------------------------------------------------- */

const fmtAmt = (mcg) => (mcg >= 1000
  ? +(mcg / 1000).toFixed(3) + ' mg'
  : +mcg.toFixed(1) + ' mcg');

/* The first dose row that is publishable and carries a parseable amount, used
   to state what the literature and community practice describe for a component
   ON ITS OWN. Everything comes from the app's DB. */
const INJECTED = /subq|sub-q|subcutaneous|\bim\b|inject/i;

function componentDoseRange(api, entry) {
  const rows = api.publishableDoses(entry);
  const parse = (r) => {
    /* "250-500mcg/day", "2-2.5mg twice weekly", "1–2mg/day", "500mcg-1mg orally".
       A range whose two halves carry different units ("500mcg-1mg") is read at
       the low end's unit, which is the half being used as the anchor. */
    const m = String(r.d).match(/([\d.]+)\s*(mcg|mg)?\s*(?:[-–]|to)?\s*([\d.]+)?\s*(mcg|mg)/i);
    if (!m) return null;
    const loUnit = m[2] || m[4];
    const lo = parseFloat(m[1]) * (/mg/i.test(loUnit) ? 1000 : 1);
    const hi = m[3] ? parseFloat(m[3]) * (/mg/i.test(m[4]) ? 1000 : 1) : lo;
    if (!isFinite(lo) || lo <= 0) return null;
    return { lo, hi, label: r.l, raw: r.d, freq: r.f };
  };
  /* A blend vial is mixed for injection, so an injected row is the honest
     comparison. Fall back to any parseable row rather than dropping the
     component out of the table. */
  for (const r of rows) if (INJECTED.test(String(r.f || ''))) { const p = parse(r); if (p) return p; }
  for (const r of rows) { const p = parse(r); if (p) return p; }
  return null;
}

/* ---- the widget --------------------------------------------------------- */

/* The app's own #tool-calc calculator, with a vial-contents card above it that
   drives it and a split panel below it that reads its output. The split is
   delivered_i = mg_i x (ml / water) — one multiplication, printed on the page,
   and independent of which component the widget is anchored at. */
function blendWidget(ctx, blend, ctaInner) {
  const { app, W } = ctx;
  const comps = blend.components.map((c) => ({
    id: c.id, mg: c.mg, name: app.byId[c.id].name
  }));

  const rows = comps.map((c, i) =>
    `          <div class="ig"><label class="il" for="bl-c${i}">${shell.esc(c.name)} in the vial (mg)</label>
            <input id="bl-c${i}" type="number" inputmode="decimal" step="any" min="0" value="${c.mg}" oninput="blSync()"></div>`
  ).join('\n');

  const opts = comps.map((c, i) =>
    `<option value="${i}">${shell.esc(c.name)}</option>`).join('');

  const contents = `    <div class="widget">
      <div class="card">
        <div class="card-title">What is in your vial</div>
        <p class="hint">Blend ratios are chosen by whoever compounded the vial and are not
        standardised. Take these numbers off your own label — the ones below are only the
        reference this page's worked example uses.</p>
${rows}
          <div class="ig"><label class="il" for="bl-water">Bacteriostatic water added (ml)</label>
            <input id="bl-water" type="number" inputmode="decimal" step="any" min="0.1" value="${blend.bacMl}" oninput="blSync()"></div>
          <div class="ig"><label class="il" for="bl-anchor">Which one are you dosing for?</label>
            <select id="bl-anchor" onchange="blSync()">${opts}</select></div>
        <p class="hint">The calculator below is set to that component. Everything else in the
        vial comes along in the vial's ratio — the panel under it says how much.</p>
      </div>
    </div>`;

  const calc = W.reconWidget(app.src, {
    ctaInner,
    title: 'Draw Calculator',
    presets: [[blend.components[0].mg, blend.bacMl]]
  });

  const split = `    <div class="widget">
      <div class="card" id="bl-split-card">
        <div class="card-title">What that draw actually contains</div>
        <div id="bl-split"></div>
      </div>
    </div>`;

  const js = `var TL_BLEND = ${JSON.stringify(comps)};

/* delivered_i = mg_i x (ml / water). Read straight off the app's own output so
   the split can never disagree with the calculator above it. */
function blDelivered() {
  var mlTxt = (document.getElementById('uc-ml').textContent || '').replace(/[^0-9.]/g, '');
  var ml = parseFloat(mlTxt) || 0;
  var water = parseFloat(document.getElementById('uc-water').value) || 0;
  if (!ml || !water) return null;
  return TL_BLEND.map(function (c, i) {
    var mg = parseFloat(document.getElementById('bl-c' + i).value) || 0;
    return { name: c.name, mcg: mg * 1000 * (ml / water) };
  });
}

function blFmt(mcg) {
  if (!isFinite(mcg)) return '—';
  return mcg >= 1000 ? (Math.round(mcg / 10) / 100) + ' mg' : (Math.round(mcg * 10) / 10) + ' mcg';
}

function blRender() {
  var out = document.getElementById('bl-split');
  var d = blDelivered();
  if (!d) { out.innerHTML = '<p class="hint">Enter a dose above to see the split.</p>'; return; }
  out.innerHTML = '<ul class="split">' + d.map(function (x) {
    return '<li><span>' + x.name + '</span><strong>' + blFmt(x.mcg) + '</strong></li>';
  }).join('') + '</ul>' +
  '<p class="hint">Per injection, from this vial at this dilution. Every number moves together: ' +
  'there is no draw that raises one and not the others.</p>';
}

/* Point the app's calculator at the component being dosed for, then re-render
   the split from whatever it computed. */
function blSync() {
  var i = parseInt(document.getElementById('bl-anchor').value, 10) || 0;
  var mg = parseFloat(document.getElementById('bl-c' + i).value) || 0;
  var water = parseFloat(document.getElementById('bl-water').value) || 0;
  if (mg > 0) document.getElementById('uc-vial').value = mg;
  if (water > 0) document.getElementById('uc-water').value = water;
  calcUnified();
  blRender();
}`;

  return {
    html: contents + '\n\n' + calc.html + '\n\n' + split,
    fns: calc.fns + '\n\n' + js,
    init: `document.getElementById('uc-dose').value = ${blend.components[0].id === 'tb5' ? 2 : 250};
  document.getElementById('uc-unit').value = '${blend.components[0].id === 'tb5' ? 'mg' : 'mcg'}';
  blSync();`
  };
}

/* ---- the mismatch table ------------------------------------------------- */

/* Anchor each component at the low end of what the app's OWN dosing rows
   describe for it alone, and show what the same draw delivers of everything
   else. This is the page's reason to exist, and every number in it is derived
   from DB.doses rather than authored. */
function mismatch(api, ctx, blend) {
  const { app } = ctx;
  const comps = blend.components.map((c) => {
    const entry = app.byId[c.id];
    return { id: c.id, mg: c.mg, name: entry.name, range: componentDoseRange(api, entry) };
  });
  const usable = comps.filter((c) => c.range);
  if (usable.length < 2) return null;

  const headers = ['If you dose for', 'Draw'].concat(comps.map((c) => c.name));
  const rows = usable.map((anchor) => {
    const r = recon.unitsFor(anchor.mg, blend.bacMl, anchor.range.lo, 100);
    const cells = comps.map((c) => {
      const mcg = c.mg * 1000 * (r.ml / blend.bacMl);
      if (c.id === anchor.id) return `<strong>${fmtAmt(mcg)}</strong>`;
      if (!c.range) return fmtAmt(mcg);
      const ratio = mcg / c.range.lo;
      if (ratio >= 2) return `${fmtAmt(mcg)} <em>(${Math.round(ratio)}&times; its own low end)</em>`;
      if (ratio <= 0.5) return `${fmtAmt(mcg)} <em>(${(ratio * 100).toFixed(0)}% of its own low end)</em>`;
      return fmtAmt(mcg);
    });
    const draw = `${recon.fmtMl(r.ml)} ml (${recon.fmtUnits(r.units)} u)` +
      (r.overflow ? ' <em>&mdash; more than one syringe</em>' : '');
    return [`${api.esc(anchor.name)} at ${fmtAmt(anchor.range.lo)}`, draw].concat(cells);
  });

  const notes = usable.map((c) =>
    `<li><strong>${api.esc(c.name)}</strong> &mdash; ${api.esc(c.range.raw)}, ${api.esc(c.range.freq)}
     <span class="src">(${api.esc(c.range.label)}, from this site's compound reference)</span></li>`).join('\n');

  return [
    `    <h2>The ratio problem, in numbers</h2>`,
    `    <p>Each row below anchors on one component at the low end of what the literature and
    community practice describe <em>for that compound on its own</em>, then shows what the same
    draw delivers of everything else in the vial. Computed for the reference vial —
    ${comps.map((c) => `${c.mg} mg ${api.esc(c.name)}`).join(', ')} in ${blend.bacMl} ml of
    bacteriostatic water — and the calculator above will redo it for yours.</p>`,
    api.table(headers, rows),
    `    <p>The amounts each row is anchored to, and where they come from:</p>`,
    `    <ul class="srcs">\n${notes}\n    </ul>`,
    `    <p>${api.EV.offlabel} None of these compounds is approved for human use, and the amounts
    above are what is described in the literature and in community practice rather than
    established doses. They are here as the yardstick the blend is being measured against, not
    as a recommendation. What matters on this page is the <em>gap</em> between the columns: it
    is a property of the vial's ratio, and no injection technique changes it.</p>`
  ].join('\n\n');
}



/* ---- build -------------------------------------------------------------- */

/* Which components have a per-compound half-life page to link to. Taken from
   pages-halflife.js so the two lists cannot drift; a component with no page is
   named without a link rather than linked into a 404. */
const HALF_LIFE_SLUGS = Object.fromEntries(
  Object.entries(require('./pages-halflife.js').PAGES).map(([id, p]) => [id, p.slug])
);


function ctaLink(slug, label) {
  return `<a class="btn btn-p" href="/app?utm_source=tools&amp;utm_medium=web&amp;utm_campaign=${slug}" style="text-decoration:none;display:block;text-align:center;line-height:1.4">${label}</a>`;
}

const SHARED_FAQ = (api, blend, comps) => [
  ['Can I separate the components once the vial is mixed?',
    [`No. They are dissolved in the same water and go into the syringe together, in whatever
      ratio is in the vial. The only way to set each compound's amount independently is
      separate vials.`]],
  ['How do I know what is actually in my vial?',
    [`You do not, beyond what the label claims. None of these compounds is sold as an approved
      medicine, so nothing on the label has been verified by a regulator, and a blend adds a
      second unknown on top of the first: the ratio. The calculator is exact about the numbers
      you give it, and those numbers come from a label nobody checked. That is worth holding in
      mind before treating any output here as precise.`]],
  ['What about storage once it is reconstituted?',
    [`Mixed with bacteriostatic water, refrigerated at 2&ndash;8&nbsp;&deg;C and used within
      about 28 days is the rule the app applies to reconstituted peptides, and it applies to a
      blend as a whole rather than to each component. ${api.esc(comps.storageCaveat)}`]],
  ['Does the calculator know these are research compounds?',
    [`It does arithmetic, and nothing else. None of the compounds in this vial is approved for
      human use, and a calculator that tells you a draw is 40 units is not telling you the draw
      is a good idea. Anything you are considering injecting belongs in a conversation with a
      doctor who can see your whole picture.`]]
];

function build(ctx, api) {
  const { app, attribution } = ctx;
  const out = [];

  for (const [key, b] of Object.entries(BLENDS)) {
    const comps = b.components.map((c) => {
      const entry = app.byId[c.id];
      if (!entry) throw new Error('blend page for unknown compound id: ' + c.id);
      if (ctx.A.isTierC(c.id)) throw new Error('Tier C compound reached a blend page: ' + c.id);
      return { ...c, entry, name: entry.name };
    });

    const url = '/tools/' + b.slug + '/';
    const widget = blendWidget(ctx, b, ctaLink(b.slug, 'Save this draw to your log'));

    const facts = api.factBox([
      /* Link a component only where a half-life page exists for it. GHK-Cu and
         KPV have no published half-life in TL_PK, so they have no page and a
         link would 404 — validate-public-pages.js checks every internal link. */
      ['Components', comps.map((c) => {
        const slug = HALF_LIFE_SLUGS[c.id];
        return slug
          ? `<a href="/tools/half-life/${slug}/">${api.esc(c.name)}</a>`
          : api.esc(c.name);
      }).join(' &middot; ')],
      ['Also called', b.alsoCalled.map(api.esc).join(', ')],
      ['Reference vial', comps.map((c) => `${c.mg} mg ${api.esc(c.name)}`).join(' + ') +
        ` in ${b.bacMl} ml bacteriostatic water`],
      ['Regulatory status', comps.map((c) => `${api.esc(c.name)}: ${api.esc(api.regStatus(c.entry) || 'not stated')}`).join('<br>')],
      ...api.storageRows(app, comps[0].id)
    ]);

    const body = [
      `    <h1>${api.esc(b.h1)}</h1>`,
      `    <p class="lede">${b.lede.replace(/\s+/g, ' ').trim()}</p>`,
      `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
      b.intro.map((x) => `    <p>${x.replace(/\s+/g, ' ').trim()}</p>`).join('\n'),
      widget.html,
      api.formula([
        'concentration of one component (mcg/ml) = that component (mg) × 1000 ÷ water (ml)',
        'volume to draw (ml)                     = dose wanted (mcg) ÷ that concentration',
        'what the draw delivers of any other     = that other (mg) × 1000 × volume ÷ water',
        'units on a U-100 syringe                = volume to draw (ml) × 100'
      ]),
      `    <p>Only the last line is specific to a blend, and it is the one people skip. A draw is
      a fraction of the vial, so it takes the same fraction of <em>every</em> component. Draw a
      fifth of the vial and you get a fifth of each thing in it.</p>`,
      mismatch(api, ctx, b),
      `    <h2>Why this blend is put together the way it is</h2>`,
      b.why.map((x) => `    <p>${x.replace(/\s+/g, ' ').trim()}</p>`).join('\n'),
      `    <h2>What is in the reference vial</h2>`,
      facts,
      `    <h2>Questions people actually ask</h2>`,
      api.faq(b.faqExtra.concat(SHARED_FAQ(api, b, { storageCaveat: app.TL_STORAGE.caveat }))),
      shell.ctaBox(b.slug,
        'A blend is one vial with several clocks running in it. The app keeps the vial, the ' +
        'concentration and every draw you take from it, so the split only has to be worked out once.',
        'Save this draw to your log')
    ].filter(Boolean).join('\n\n');

    out.push(api.render(ctx, {
      url,
      title: b.title + ' | TherapyLog',
      description: `What one draw of a ${b.nickname} vial delivers of each component, and why a ` +
        `fixed ratio cannot match what each compound is dosed at on its own. Free, no account.`,
      trail: api.toolsTrail([{ name: b.title, url, absolute: api.SITE + url }]),
      body,
      script: ctx.W.prologue({ attribution }) + '\n\n' + widget.fns + '\n\n' +
              `document.addEventListener('DOMContentLoaded', function () {\n  ${widget.init}\n});`
    }));
  }

  return out;
}

module.exports = { BLENDS, fmtAmt, componentDoseRange, blendWidget, mismatch, build };
