/* Shared machinery for the /markers/ pages.
 *
 * Everything factual on a marker page is generated from app.html: the accepted
 * units and their conversion factors, the assay variants and the labels the app
 * shows for them, the generic reference range, the optimal band, and the sex and
 * age bands — produced by running the app's OWN getAdjustedLabRanges() against a
 * synthetic profile rather than by transcribing its tables.
 *
 * The converter runs the app's real normalizeValue(), lifted verbatim, so a page
 * refuses exactly the conversions the app refuses (Lp(a) mg/dL, an absolute
 * count against a percentage) instead of approximating them.
 *
 * What is NOT generated is the body copy. That is authored, cited, and reviewed
 * — SEO-PLAN §6.3. This file gives it a factual spine it cannot contradict.
 */

const A = require('../lib/app-source.js');
const shell = require('./shell.js');
const esc = shell.esc;

/* Age bands as getAdjustedLabRanges() itself brackets them, so a published table
   has a row per band the app actually distinguishes rather than per decade. */
const AGE_BANDS = [
  { label: 'Under 30', age: 25, from: 0, to: 29 },
  { label: '30–39', age: 35, from: 30, to: 39 },
  { label: '40–49', age: 45, from: 40, to: 49 },
  { label: '50–59', age: 55, from: 50, to: 59 },
  { label: '60 and over', age: 65, from: 60, to: null }
];

/* Name a run of consecutive bands the way a person would: "under 50", not
   "under 30 to 40-49". */
function bandRunLabel(first, last) {
  if (first.from === 0 && last.to === null) return 'all ages';
  if (first.from === 0) return `under ${last.to + 1}`;
  if (last.to === null) return `${first.from} and over`;
  if (first.from === last.from) return first.label.toLowerCase();
  return `${first.from}–${last.to}`;
}

/* The <select id="ll-method-KEY"> options are the app's own display labels for
   the assay variants. Reading them here means a page and the app call the same
   method the same thing. */
function assayLabels(src, key) {
  const at = src.indexOf(`id="ll-method-${key}"`);
  if (at < 0) return null;
  const end = src.indexOf('</select>', at);
  if (end < 0) throw new Error(`unterminated <select> for ll-method-${key}`);
  const out = {};
  for (const m of src.slice(at, end).matchAll(/<option value="([^"]*)"[^>]*>([^<]*)</g)) {
    if (m[1]) out[m[1]] = m[2].trim();
  }
  return out;
}

const fmtRange = (lo, hi, unit) =>
  lo == null || hi == null ? '—' : `${lo}–${hi} ${esc(unit)}`;

/* The fact box. Rows are omitted rather than filled with a placeholder when the
   registry has nothing for them. */
function factBox(api, ctx, key) {
  const { app, reg } = ctx;
  const m = reg.MARKER_REGISTRY[key];
  if (!m) throw new Error('no registry entry for marker ' + key);
  const ref = reg.LAB_REF[key] || {};
  const labels = assayLabels(app.src, key);

  const units = Object.entries(m.units).map(([u, f]) => {
    if (u === m.canonicalUnit) return `<strong>${esc(u)}</strong> <em>(canonical)</em>`;
    return typeof f === 'function'
      ? `${esc(u)} <em>(converted by formula)</em>`
      : `${esc(u)} <em>(× ${f} → ${esc(m.canonicalUnit)})</em>`;
  }).join('<br>');

  const assay = m.assay
    ? m.assay.variants.map((v) =>
        `${esc((labels && labels[v]) || v)} <span class="src">(<code>${esc(v)}</code>)</span>`).join('<br>')
    : null;

  return api.factBox([
    ['Marker', esc(m.label)],
    ['Panel group', esc(m.group)],
    ['Canonical unit', esc(m.canonicalUnit)],
    ['Units accepted', units],
    m.noConvert ? ['Never converted', m.noConvert.map(esc).join(', ') +
      ' <em>— no valid conversion exists, so a value in this unit is refused rather than approximated</em>'] : null,
    assay ? ['Assay methods tracked', assay] : null,
    ['Generic reference range',
      `${fmtRange(ref.lo, ref.hi, m.canonicalUnit)} <em>— generic reference range, male default. Your lab's printed interval takes precedence over this.</em>`],
    m.optimal ? ['Optimal band',
      `${fmtRange(m.optimal[0], m.optimal[1], m.canonicalUnit)} <span class="nondx">non-diagnostic</span>`] : null,
    m.contextRequired ? ['Context the result needs',
      esc(Array.isArray(m.contextRequired) ? m.contextRequired.join(', ') : m.contextRequired) +
      ' <em>— without it the number cannot be read properly</em>'] : null,
    /* SEO-PLAN §6.2 and MARKERS.md: the LOINC codes are an unverified seed
       written from memory. Publishing them as fact would be the wrong kind of
       precision, so they are named as unverified or left out. */
    (m.loinc && m.loinc.length)
      ? ['LOINC', `${m.loinc.map(esc).join(', ')} <em>— unverified seed, not checked against a vendor payload</em>`]
      : null
  ]);
}

/* Sex and age bands, replicated by running the app's own function. */
function sexAgeTable(api, ctx, key) {
  const m = ctx.reg.MARKER_REGISTRY[key];
  const rows = [];
  let varies = false;
  const base = JSON.stringify(ctx.ranges.Male[25][key] || null);

  for (const sex of ['Male', 'Female']) {
    for (const band of AGE_BANDS) {
      const r = ctx.ranges[sex][band.age][key];
      if (!r) continue;
      if (JSON.stringify(r) !== base) varies = true;
      const row = [
        `${sex}, ${band.label}`,
        fmtRange(r.lo, r.hi, m.canonicalUnit),
        r.olo != null ? fmtRange(r.olo, r.ohi, m.canonicalUnit) : '—'
      ];
      row.__sex = sex;
      row.__bandDef = band;
      rows.push(row);
    }
  }
  if (!rows.length || !varies) return null;

  /* Collapse runs of identical consecutive bands within a sex, and label the run
     by the bands it actually covers. Labelling every run "all ages" was wrong
     the moment a marker had two runs — estradiol's optimal band widens at 50,
     which produced two rows both claiming to cover all ages. */
  const collapsed = [];
  for (const sex of ['Male', 'Female']) {
    const mine = rows.filter((r) => r.__sex === sex);
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const first = run[0], last = run[run.length - 1];
      const label = `${sex}, ${bandRunLabel(first.__bandDef, last.__bandDef)}`;
      collapsed.push([label, first[1], first[2]]);
      run = [];
    };
    mine.forEach((r) => {
      const prev = run[run.length - 1];
      if (prev && prev[1] === r[1] && prev[2] === r[2]) { run.push(r); return; }
      flush();
      run = [r];
    });
    flush();
  }

  return [
    `    <h3>How the app adjusts this range by sex and age</h3>`,
    `    <p>Generated by running the app's own range function against each band, so
    this table cannot drift from what the app flags against. The optimal column is
    <span class="nondx">non-diagnostic</span> throughout.</p>`,
    api.table(['Who', 'Reference range', 'Optimal band'], collapsed)
  ].join('\n\n');
}

/* Compounds whose monitoring panel names this marker, matched on the registry's
   own aliases against DB.mon. Tier C never appears. */
function monitoredBy(ctx, key) {
  const aliases = (ctx.reg.MARKER_REGISTRY[key].aliases || []).map((a) => a.toLowerCase());
  const hits = [];
  ctx.app.DB.classes.forEach((c) => c.drugs.forEach((d) => {
    if (A.isTierC(d.id)) return;
    const mon = d.mon || d.monitoring;
    const text = String(Array.isArray(mon) ? mon.join('; ') : (mon || '')).toLowerCase();
    if (!text) return;
    if (aliases.some((a) => text.includes(a))) hits.push(d);
  }));
  return hits;
}

/* The converter. The app's real normalizeValue() plus the registry subset the
   page needs — never the whole registry. */
function converter(ctx, keys) {
  const { app, reg } = ctx;
  const subset = {};
  keys.forEach((k) => { subset[k] = reg.MARKER_REGISTRY[k]; });

  const opts = keys.map((k) =>
    `<option value="${esc(k)}">${esc(reg.MARKER_REGISTRY[k].label)}</option>`).join('');

  const html = `    <div class="widget">
      <div class="card">
        <div class="card-title">Unit converter</div>
        <p class="hint">Runs the app's own conversion, which means it refuses the
        conversions the app refuses instead of approximating them.</p>
        <div class="ig"><label class="il" for="mk-key">Marker</label>
          <select id="mk-key" onchange="mkConvert()">${opts}</select></div>
        <div class="ig"><label class="il" for="mk-val">Value as your report prints it</label>
          <input id="mk-val" type="text" inputmode="decimal" placeholder="e.g. 96" oninput="mkConvert()"></div>
        <div class="ig"><label class="il" for="mk-unit">Unit on your report</label>
          <select id="mk-unit" onchange="mkConvert()"></select></div>
        <div id="mk-out"></div>
      </div>
    </div>`;

  const fns = [
    `var MARKER_REGISTRY = ${JSON.stringify(subset)};`,
    A.constSource(app.src, '_norm'),
    A.fnSource(app.src, 'normalizeValue'),
    `
function mkUnits() {
  var key = document.getElementById('mk-key').value;
  var sel = document.getElementById('mk-unit');
  var m = MARKER_REGISTRY[key];
  var keep = sel.value;
  sel.innerHTML = Object.keys(m.units).concat(m.noConvert || [])
    .map(function (u) { return '<option value="' + u + '">' + u + '</option>'; }).join('');
  if (keep && Object.keys(m.units).concat(m.noConvert || []).indexOf(keep) >= 0) sel.value = keep;
}

function mkConvert() {
  var key = document.getElementById('mk-key').value;
  var out = document.getElementById('mk-out');
  if (document.getElementById('mk-unit').options.length === 0 ||
      !MARKER_REGISTRY[key].units[document.getElementById('mk-unit').value] &&
      (MARKER_REGISTRY[key].noConvert || []).indexOf(document.getElementById('mk-unit').value) < 0) {
    mkUnits();
  }
  var raw = document.getElementById('mk-val').value;
  if (!raw.trim()) { out.innerHTML = '<p class="hint">Enter a value to convert.</p>'; return; }
  var r = normalizeValue(key, raw, document.getElementById('mk-unit').value);
  if (r.ok) {
    out.innerHTML = '<div class="mk-result"><strong>' + r.value + ' ' + r.unit + '</strong>' +
      (r.converted ? '<span class="src">converted from ' + r.from + '</span>'
                   : '<span class="src">already in the canonical unit</span>') +
      (r.censoredAs ? '<span class="src">reported as ' + r.censoredAs +
        ' — an assay limit, not a measured value</span>' : '') +
      (r.note ? '<span class="src">' + r.note + '</span>' : '') + '</div>';
  } else {
    var why = {
      'no-valid-conversion': 'There is no valid conversion for that unit, so the app refuses it rather than approximating.',
      'unrecognized-unit': 'That unit is not one this marker is reported in.',
      'non-numeric': 'That is not a number the converter can read.',
      'unknown-marker': 'Unknown marker.'
    }[r.reason] || r.reason;
    out.innerHTML = '<div class="mk-result bad"><strong>Not converted</strong><span class="src">' +
      why + (r.note ? ' ' + r.note : '') + '</span></div>';
  }
}`
  ].join('\n\n');

  return { html, fns, init: `mkUnits(); mkConvert();` };
}

/* MARKERS.md rule 3, stated the same way on every page.
   Marked `shared` because it is identical across every marker page:
   validate-public-pages.js excludes it from the authored-word floor, so a page
   has to earn its minimum on prose it actually wrote. */
const LAB_RANGE_WINS = `    <div class="shared">
    <h2>Your lab's range wins</h2>
    <p>The reference interval printed on your own report is the one that counts, and it is the
    one TherapyLog flags against when your report carries it. That is not deference for its own
    sake: a reference interval belongs to the assay, the instrument and the population the lab
    validated it on, and two labs measuring the same blood can legitimately print different
    intervals. A generic range — like the one in the fact box above — is what the app falls back
    to when your report did not include one, and it is the weaker of the two.</p>
    <p>The same applies to any optimal band. Those are drawn from clinical literature and
    community practice for reading a trend over time, they are
    <span class="nondx">non-diagnostic</span>, and sitting outside one is not by itself a
    finding. What a value means for you is a question for the clinician who can see your whole
    chart.</p>
    </div>`;

module.exports = {
  AGE_BANDS, bandRunLabel, assayLabels, factBox, sexAgeTable, monitoredBy, converter,
  LAB_RANGE_WINS, fmtRange
};
