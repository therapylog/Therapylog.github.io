/* The four calculators that are not the reconstitution widget, plus the
   combined-draw planner.
 *
 * Three of them need arithmetic app.html does not have a function for — insulin
 * unit conversion, the TRT cadence split, and the Vermeulen equation — so those
 * are written here as pure functions with the formula printed on the page.
 * Everything that DOES exist in the app is lifted: pkCurve and pkParseDose for
 * the half-life pages, the whole syr* family for the draw planner.
 *
 * The steady-state sampler is emitted from scripts/page-templates/curve.js by
 * toString(), so the number a reader gets from the widget and the number
 * pre-rendered onto a compound page come from one implementation rather than
 * two that have to be kept in agreement. */

const shell = require('./shell.js');
const curve = require('./curve.js');

/* ---- shared client-side helpers ---------------------------------------- */

/* One definition, two runtimes. */
function emitSteadyState() {
  return [
    '/* Emitted from scripts/page-templates/curve.js — the same functions that',
    '   pre-render the curves on the compound pages, so the widget and the',
    '   pictures cannot disagree. */',
    'var round = ' + curve.round.toString() + ';',
    'var repeated = ' + curve.repeated.toString() + ';',
    'var steadyState = ' + curve.steadyState.toString() + ';',
    'var fmtHours = ' + curve.fmtHours.toString() + ';'
  ].join('\n');
}

const num = (n, p) => Number(n.toFixed(p === undefined ? 2 : p));

/* ---- 1. insulin syringe units ------------------------------------------ */

const INSULIN_JS = `
/* U-100 means a hundred units per millilitre. It is a concentration marking,
   not a capacity: 0.1 ml is 10 units on a 0.3 ml barrel and on a 1 ml barrel
   alike. The only thing the barrel decides is whether the draw fits. */
function isuToMcg(v, unit) { return unit === 'mg' ? v * 1000 : v; }
function isuCalc() {
  var barrel = parseFloat(document.getElementById('isu-size').value);
  var conc = parseFloat(document.getElementById('isu-conc').value);
  var concUnit = document.getElementById('isu-conc-unit').value;
  var dose = parseFloat(document.getElementById('isu-dose').value);
  var doseUnit = document.getElementById('isu-dose-unit').value;
  var out = document.getElementById('isu-out');
  var maxUnits = barrel * 100;
  if (!(conc > 0) || !(dose > 0)) {
    out.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:10px 0">' +
      'Enter a concentration and a dose.</div>';
    return;
  }
  var concMcg = isuToMcg(conc, concUnit);
  var doseMcg = isuToMcg(dose, doseUnit);
  var ml = doseMcg / concMcg;
  var units = ml * 100;
  var practical = Math.round(units * 2) / 2;
  var warn = '';
  if (units > maxUnits) {
    warn = '<div style="color:var(--danger);font-size:12px;margin-top:6px">' +
      'That is ' + units.toFixed(1) + ' units — more than the ' + maxUnits +
      '-unit barrel holds. A more concentrated solution, or a larger syringe, not two draws.</div>';
  } else if (units < 2) {
    warn = '<div style="color:var(--accent3);font-size:12px;margin-top:6px">' +
      'Under 2 units is finer than an insulin syringe can be read honestly. Dilute further so the draw is bigger.</div>';
  } else if (Math.abs(units - practical) > 0.001) {
    warn = '<div style="color:var(--text3);font-size:12px;margin-top:6px">' +
      'Nearest half-unit mark: ' + practical + ' units (' + (practical / 100).toFixed(3) + ' ml).</div>';
  }
  out.innerHTML =
    '<div style="padding:12px;background:rgba(59,196,255,0.06);border:1px solid rgba(59,196,255,0.22);border-radius:11px">' +
    '<div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--accent2);margin-bottom:4px">Draw to this line</div>' +
    '<div style="display:flex;align-items:baseline;gap:8px">' +
    '<div style="font-family:\\'DM Serif Display\\',serif;font-size:36px;color:var(--accent2);line-height:1">' +
    (Math.round(units * 10) / 10) + '</div><div style="font-size:14px;color:var(--text2)">units</div></div>' +
    '<div style="font-size:12px;color:var(--text2);margin-top:2px">' + ml.toFixed(3) + ' ml at ' +
    (concMcg >= 1000 ? (concMcg / 1000) + ' mg' : concMcg + ' mcg') + '/ml</div>' + warn + '</div>';
}
function isuMlToUnits() {
  var ml = parseFloat(document.getElementById('isu-ml').value);
  var el = document.getElementById('isu-ml-out');
  el.textContent = (ml > 0) ? (ml * 100).toFixed(1).replace(/\\.0$/, '') + ' units' : '';
}
function isuUnitsToMl() {
  var u = parseFloat(document.getElementById('isu-units').value);
  var el = document.getElementById('isu-units-out');
  el.textContent = (u > 0) ? (u / 100).toFixed(3) + ' ml' : '';
}
`.trim();

function insulinPage(ctx, api) {
  const { app, attribution, W } = ctx;
  const sizes = app.SYR_SIZES.map((s) =>
    `<option value="${s.ml}"${s.ml === 1 ? ' selected' : ''}>${api.esc(s.label)}</option>`).join('');

  const widget = `    <div class="widget">
      <div class="card">
        <div class="card-title">Dose to units</div>
        <div class="ig"><label class="il" for="isu-size">Syringe</label>
          <select id="isu-size" onchange="isuCalc()">${sizes}</select></div>
        <div class="ig"><label class="il" for="isu-conc">Concentration</label>
          <div style="display:flex;gap:8px">
            <input type="number" id="isu-conc" value="2500" step="any" oninput="isuCalc()" style="flex:1">
            <select id="isu-conc-unit" onchange="isuCalc()" style="width:110px;flex:none">
              <option value="mcg" selected>mcg/ml</option><option value="mg">mg/ml</option></select>
          </div></div>
        <div class="ig"><label class="il" for="isu-dose">Dose</label>
          <div style="display:flex;gap:8px">
            <input type="number" id="isu-dose" value="250" step="any" oninput="isuCalc()" style="flex:1">
            <select id="isu-dose-unit" onchange="isuCalc()" style="width:110px;flex:none">
              <option value="mcg" selected>mcg</option><option value="mg">mg</option></select>
          </div></div>
        <div id="isu-out"></div>
      </div>
      <div class="card">
        <div class="card-title">Straight ml and units</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="ig"><label class="il" for="isu-ml">Millilitres</label>
            <input type="number" id="isu-ml" placeholder="0.25" step="any" oninput="isuMlToUnits()">
            <div id="isu-ml-out" style="font-family:'DM Mono',monospace;font-size:14px;color:var(--accent2);margin-top:6px"></div></div>
          <div class="ig"><label class="il" for="isu-units">Units (U-100)</label>
            <input type="number" id="isu-units" placeholder="25" step="any" oninput="isuUnitsToMl()">
            <div id="isu-units-out" style="font-family:'DM Mono',monospace;font-size:14px;color:var(--accent2);margin-top:6px"></div></div>
        </div>
      </div>
    </div>`;

  const rows = [[0.05, 5], [0.1, 10], [0.15, 15], [0.2, 20], [0.25, 25], [0.3, 30],
                [0.4, 40], [0.5, 50], [0.75, 75], [1, 100]];
  const body = [
    `    <h1>Insulin syringe unit converter</h1>`,
    `    <p class="lede">Units to millilitres and back on a U-100 syringe, and the dose-to-units
    conversion for whatever concentration is in your vial. Free, no account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p><strong>U-100 means one hundred units per millilitre.</strong> That single sentence
    settles most of the confusion around insulin syringes: the "100" is a concentration
    marking, not a capacity. A 0.3 ml syringe, a 0.5 ml syringe and a 1 ml syringe are all
    U-100, so 0.1 ml is ten units on every one of them. What the barrel size decides is only
    how far the scale goes — 30, 50 or 100 units.</p>`,
    `    <p>Worked through: a vial at <strong>2,500 mcg/ml</strong> and a dose of
    <strong>250 mcg</strong>. Volume is 250 ÷ 2,500 = <strong>0.1 ml</strong>, and 0.1 ml ×
    100 = <strong>10 units</strong>. Halve the concentration to 1,250 mcg/ml and the same dose
    becomes 0.2 ml, or 20 units — the same drug, twice the liquid, twice the number on the
    barrel.</p>`,
    widget,
    `    <h2>How the math works</h2>`,
    api.formula([
      'volume (ml)  =  dose ÷ concentration      (in matching units)',
      'units        =  volume (ml) × 100         (U-100: 100 units per ml)',
      'ml           =  units ÷ 100'
    ]),
    `    <p>Two rules the calculator applies. A draw is rounded to the <strong>nearest
    half-unit</strong>, because that is the finest mark an insulin syringe carries and reading
    between marks against a meniscus is not measurement. And a draw <strong>under two
    units</strong> is flagged rather than reported cleanly: at that size the error in reading
    the barrel is a large fraction of the dose, and the fix is a more dilute solution rather
    than a steadier hand.</p>`,
    `    <h2>The conversions people look up</h2>`,
    `    <p>These hold for any U-100 syringe regardless of barrel size. Where a row says "over
    the barrel", the volume is larger than that syringe holds.</p>`,
    api.table(['Volume', 'Units (U-100)', '0.3 ml barrel', '0.5 ml barrel', '1 ml barrel'],
      rows.map(([ml, u]) => [
        ml + ' ml', u + ' units',
        u <= 30 ? u + ' u' : 'over the barrel',
        u <= 50 ? u + ' u' : 'over the barrel',
        u <= 100 ? u + ' u' : 'over the barrel'
      ])),
    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['Is a unit the same as a millilitre?', [
        `No, and conflating the two is the most expensive mistake in this whole area. On a
         U-100 syringe a unit is one hundredth of a millilitre. "10 units" and "10 ml" differ
         by a factor of a hundred.`
      ]],
      ['Is a unit a fixed amount of drug?', [
        `Not for anything measured this way. For insulin itself a unit is a defined
         international unit of activity, and U-100 insulin is formulated so that one unit
         occupies 0.01 ml — which is where the marking comes from. For a reconstituted peptide
         there is no such standard: a unit is purely a volume, so how much drug it contains
         depends entirely on the concentration you mixed. This is why "how many units should I
         take" has no answer without a concentration.`
      ]],
      ['What about U-40 or U-50 insulin syringes?', [
        `U-40 syringes exist (mostly veterinary) and are marked 40 units to the millilitre, so
         a unit there is 0.025 ml. Mixing a U-40 syringe with a U-100 assumption over-doses by
         two and a half times. The syringes people describe as "U-50" are almost always 0.5 ml
         U-100 barrels marked to 50 — still a hundred units per millilitre. Check the barrel,
         not the box.`
      ]],
      ['Why does my draw not land on a mark?', [
        `Because the concentration was not chosen with the dose in mind. Adjusting the diluent
         volume moves every future draw onto a round number — that is what the
         <a href="/tools/peptide-reconstitution-calculator/">reconstitution calculator's</a>
         reverse solver is for.`
      ]]
    ]),
    shell.ctaBox('insulin-syringe-units-calculator',
      'The app stores each vial’s concentration and shows the draw in units next to a syringe diagram, so the conversion happens once rather than every injection.')
  ].join('\n\n');

  return api.render(ctx, {
    url: '/tools/insulin-syringe-units-calculator/',
    title: 'Insulin syringe unit converter | TherapyLog',
    description: 'Units to ml and back on U-100 syringes, plus dose-to-units for any ' +
      'concentration. U-100 means 100 units per ml. Free, no account.',
    trail: api.toolsTrail([{ name: 'Insulin syringe units',
      url: '/tools/insulin-syringe-units-calculator/',
      absolute: api.SITE + '/tools/insulin-syringe-units-calculator/' }]),
    body,
    script: W.prologue({ attribution }) + '\n\n' + INSULIN_JS +
      '\n\ndocument.addEventListener(\'DOMContentLoaded\', function () { isuCalc(); });'
  });
}


/* ---- 2. TRT dose calculator -------------------------------------------- */

/* Esters, with the half-life and Tmax read from app.html's PK table at build
   time rather than written here. Testosterone propionate is Tier A under
   SEO-PLAN §7's borderline rule; the strip filter keeps performance dosing off
   the page. */
const TRT_ESTERS = ['tc', 'te', 'tprop'];

const TRT_JS = `
/* Interval in hours from injections per week, then the same three steps the
   reconstitution calculator takes: concentration, volume, units. */
function trtCalc() {
  var id = document.getElementById('trt-ester').value;
  var e = TRT_PK[id];
  var weekly = parseFloat(document.getElementById('trt-weekly').value);
  var perWeek = parseFloat(document.getElementById('trt-freq').value);
  var conc = parseFloat(document.getElementById('trt-conc').value);
  var out = document.getElementById('trt-out');
  if (!(weekly > 0) || !(perWeek > 0) || !(conc > 0)) {
    out.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:10px 0">' +
      'Enter a weekly dose and a vial concentration.</div>';
    return;
  }
  var perShot = weekly / perWeek;
  var ml = perShot / conc;
  var units = ml * 100;
  var interval = 168 / perWeek;
  var f = pkCurve(e.hl, e.tmax);
  var ss = steadyState(f, e.hl, interval);
  var ttss = 5 * e.hl / 24;
  var barrels = TRT_SIZES.filter(function (s) { return units <= s.ml * 100; });
  var fits = barrels.length
    ? barrels[0].label + ' — draw to ' + (Math.round(units * 2) / 2) + ' units'
    : 'More than a 1 ml syringe holds at ' + conc + ' mg/ml';
  var swing = ss.cleared ? '' : ss.ratio <= 1.25 ? 'flat' : ss.ratio <= 1.6 ? 'moderate' : 'pronounced';
  out.innerHTML =
    '<div style="padding:12px;background:rgba(74,222,154,0.06);border:1px solid rgba(74,222,154,0.22);border-radius:11px;margin-bottom:10px">' +
      '<div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--accent);margin-bottom:4px">Per injection</div>' +
      '<div style="display:flex;align-items:baseline;gap:8px">' +
        '<div style="font-family:\\'DM Serif Display\\',serif;font-size:34px;color:var(--accent);line-height:1">' +
        (Math.round(perShot * 10) / 10) + '</div><div style="font-size:14px;color:var(--text2)">mg</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-top:3px">' + ml.toFixed(3) + ' ml at ' +
      conc + ' mg/ml &middot; ' + (Math.round(units * 10) / 10) + ' units on a U-100</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-top:4px">' + fits + '</div>' +
    '</div>' +
    '<div style="padding:12px;background:var(--surface2);border:1px solid var(--border2);border-radius:11px">' +
      '<div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--text2);margin-bottom:8px">' +
        'Modelled at steady state, injecting every ' + fmtHours(interval) + '</div>' +
      row('Peak-to-trough ratio', ss.cleared
        ? 'not meaningful \u2014 the level clears between doses'
        : ss.ratio + '&times; (' + swing + ')') +
      row('Accumulation vs one dose', ss.accumulation + '&times;') +
      row('Time to steady state', '~' + Math.round(ttss) + ' days (about five half-lives)') +
      row('Modelled half-life', fmtHours(e.hl) + (e.est ? ' (estimated)' : '')) +
      '<div style="font-size:11px;color:var(--text3);line-height:1.55;margin-top:8px">' +
      'Relative levels from a one-compartment model, not concentrations in ng/dL. What your ' +
      'blood actually shows depends on absorption, SHBG and clearance — a trough draw before ' +
      'your next injection is the measurement that settles it.</div>' +
    '</div>';
  function row(k, v) {
    return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0">' +
      '<span style="color:var(--text2)">' + k + '</span>' +
      '<span style="font-family:\\'DM Mono\\',monospace;color:var(--text)">' + v + '</span></div>';
  }
}
`.trim();

function trtPage(ctx, api) {
  const { app, attribution, W } = ctx;
  const pk = {};
  TRT_ESTERS.forEach((id) => {
    const p = app.TL_PK[id];
    if (!p || p.hl == null) throw new Error('TRT page needs PK data for ' + id);
    pk[id] = { hl: p.hl, tmax: p.tmax, est: !!p.est, name: app.byId[id].name };
  });
  const opts = TRT_ESTERS.map((id, i) =>
    `<option value="${id}"${i === 0 ? ' selected' : ''}>${api.esc(pk[id].name)}</option>`).join('');

  const widget = `    <div class="widget">
      <div class="card">
        <div class="card-title">Weekly dose, split by cadence</div>
        <div class="ig"><label class="il" for="trt-ester">Ester</label>
          <select id="trt-ester" onchange="trtCalc()">${opts}</select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="ig"><label class="il" for="trt-weekly">Weekly dose (mg)</label>
            <input type="number" id="trt-weekly" value="120" step="any" oninput="trtCalc()"></div>
          <div class="ig"><label class="il" for="trt-conc">Vial (mg/ml)</label>
            <input type="number" id="trt-conc" value="200" step="any" oninput="trtCalc()"></div>
        </div>
        <div class="ig"><label class="il" for="trt-freq">Injections per week</label>
          <select id="trt-freq" onchange="trtCalc()">
            <option value="1">Once weekly</option>
            <option value="2" selected>Twice weekly (every 3.5 days)</option>
            <option value="3">Three times weekly</option>
            <option value="3.5">Every other day</option>
            <option value="7">Daily</option>
          </select></div>
        <div id="trt-out"></div>
      </div>
    </div>`;

  /* A table of the same split, so the page carries the numbers without JS. */
  const cadences = [[1, 'Once weekly'], [2, 'Twice weekly'], [3, 'Three times weekly'],
                    [3.5, 'Every other day'], [7, 'Daily']];
  const pkCurveFn = new Function(ctx.A.fnSource(app.src, 'pkCurve') + '; return pkCurve;')();
  const cadRows = cadences.map(([n, label]) => {
    const interval = 168 / n;
    const ss = curve.steadyState(pkCurveFn(pk.tc.hl, pk.tc.tmax), pk.tc.hl, interval);
    return [label, (120 / n).toFixed(120 % n === 0 ? 0 : 1) + ' mg',
      ((120 / n) / 200).toFixed(3) + ' ml',
      (Math.round(((120 / n) / 200) * 100 * 10) / 10) + ' u',
      ss.cleared ? 'clears' : ss.ratio + '×'];
  });

  const body = [
    `    <h1>Testosterone dose calculator</h1>`,
    `    <p class="lede">A weekly dose split by injection frequency — milligrams, millilitres and
    syringe units per shot — with the modelled peak-to-trough swing for cypionate, enanthate
    and propionate at that cadence. Free, no account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p>Two calculations, and they are usually run together. The first is arithmetic: a
    weekly dose divided by the number of injections gives milligrams per shot, that divided by
    the vial's concentration gives millilitres, and that times a hundred gives units on a U-100
    syringe. <strong>120 mg a week at 200 mg/ml, twice weekly</strong>, is 60 mg per shot,
    <strong>0.3 ml</strong>, <strong>30 units</strong>.</p>`,
    `    <p>The second is why the cadence question exists at all. Testosterone esters differ in
    how fast they release, and that decides how much a level rises and falls between
    injections. This page models it from the half-life and time-to-peak the app uses, and
    reports the <strong>peak-to-trough ratio</strong> — how many times higher the peak is than
    the trough at steady state. Once-weekly cypionate is a noticeably bigger swing than twice
    weekly; propionate, with a half-life under a day, is a bigger swing again at any weekly
    cadence, which is the entire reason it is injected as often as it is.</p>`,
    `    <div class="note">
      <p>${api.EV.established} Testosterone therapy itself is established clinical use and
      requires a prescription. ${api.EV.offlabel} The specific cadences below — twice weekly,
      every other day — are common clinical and community practice rather than what most
      approved labelling specifies, which is longer intervals. This page computes what a
      cadence does to a modelled level; it does not tell anyone which dose or cadence is right
      for them, and that is a decision for the clinician who prescribes it.</p>
    </div>`,
    widget,
    `    <h2>How the math works</h2>`,
    api.formula([
      'per injection (mg)  =  weekly dose ÷ injections per week',
      'volume (ml)         =  per injection (mg) ÷ vial concentration (mg/ml)',
      'units (U-100)       =  volume (ml) × 100',
      'interval (hours)    =  168 ÷ injections per week',
      'accumulation        =  1 ÷ (1 − 2^(−interval ÷ half-life))',
      'time to steady state ≈  5 × half-life'
    ]),
    `    <p>The peak-to-trough figure is not a formula but a simulation: the app's own
    <code>pkCurve</code> function builds a one-compartment absorption-and-elimination curve
    matched to the compound's published time-to-peak, and the page adds up enough repeated
    doses for the total to stop changing, then reads the highest and lowest points of the last
    interval. That is what "steady state" means — not that the level is flat, but that each
    cycle repeats the one before.</p>`,
    `    <h2>The same dose at five cadences</h2>`,
    `    <p>Worked for <strong>120 mg a week of testosterone cypionate at 200 mg/ml</strong>, so
    only the split changes. The ratio column is the modelled peak divided by the modelled
    trough — closer to 1 is flatter.</p>`,
    api.table(['Cadence', 'Per injection', 'Volume', 'Units (U-100)', 'Peak:trough'], cadRows),
    `    <h2>Where these half-lives come from, and what they are not</h2>`,
    `    <p>Provenance matters more here than the incumbents on this query admit. The figures
    are the ones app.html's PK table carries — cypionate
    ${curve.fmtHours(pk.tc.hl)}, enanthate ${curve.fmtHours(pk.te.hl)}, propionate
    ${curve.fmtHours(pk.tprop.hl)}, with times to peak of ${curve.fmtHours(pk.tc.tmax)},
    ${curve.fmtHours(pk.te.tmax)} and ${curve.fmtHours(pk.tprop.tmax)} — drawn from published
    pharmacokinetic literature on intramuscular ester preparations. None of the three is
    flagged as an estimate; where a compound's half-life in this app <em>is</em> an estimate,
    every page saying so is a rule rather than a courtesy.</p>`,
    `    <p>What they are not: a prediction of your serum testosterone. A one-compartment model
    with a matched Tmax reproduces the shape of a release curve well and says nothing about
    absolute concentration, which depends on the injection site and depth, the volume, your
    SHBG, and your clearance. The number that settles what a protocol is actually doing is a
    trough draw taken immediately before the next injection, on a
    <a href="/markers/">total testosterone assay whose method you know</a>.</p>`,
    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['Cypionate or enanthate — does it matter?', [
        `Pharmacokinetically, barely. The modelled half-lives here differ by about a day and a
         half (${curve.fmtHours(pk.tc.hl)} against ${curve.fmtHours(pk.te.hl)}), which at a
         weekly or twice-weekly cadence moves the peak-to-trough ratio only slightly. The
         app's own entry for enanthate says it is clinically interchangeable with cypionate in
         all protocols. Where they differ in practice is the carrier oil and local
         tolerability, not the curve.`
      ]],
      ['Why does splitting the dose change anything if the weekly total is the same?', [
        `Because the total is not what varies — the swing is. Injecting once a week means the
         level peaks a day or two after the shot and falls for the rest of the week; twice
         weekly halves both the rise and the fall. Whether a flatter curve feels better is
         individual, and the honest position is that the model tells you the swing, not whether
         you will notice it.`
      ]],
      ['How long before a change shows up in bloodwork?', [
        `About five half-lives to reach the new steady state — roughly
         ${Math.round(5 * pk.tc.hl / 24)} days for cypionate,
         ${Math.round(5 * pk.te.hl / 24)} for enanthate, and
         ${Math.round(5 * pk.tprop.hl / 24)} for propionate. Drawing labs before that measures
         a level still on its way somewhere, which is the most common reason two panels a
         fortnight apart disagree.`
      ]],
      ['Does this calculator suggest a dose?', [
        `No, and it will not. It takes a dose you enter and tells you what that dose looks like
         split different ways. Which dose is appropriate depends on symptoms, bloodwork,
         haematocrit, prostate history and a clinical examination, and belongs with the person
         who prescribes it.`
      ]]
    ]),
    `    <p>Related: <a href="/tools/half-life/testosterone-cypionate/">testosterone cypionate
    half-life</a> and <a href="/tools/half-life/testosterone-enanthate/">enanthate half-life</a>,
    the <a href="/tools/free-testosterone-calculator/">free testosterone calculator</a>, and the
    <a href="/tools/insulin-syringe-units-calculator/">insulin syringe unit converter</a>.</p>`,
    shell.ctaBox('trt-dose-calculator',
      'The app charts this curve against the doses you have actually logged, and flags a bloodwork result against the reference range your own lab printed.')
  ].join('\n\n');

  return api.render(ctx, {
    url: '/tools/trt-dose-calculator/',
    title: 'Testosterone dose calculator | TherapyLog',
    description: 'Split a weekly testosterone dose by injection frequency — mg, ml and ' +
      'syringe units — with the modelled swing per ester. Free, no account.',
    trail: api.toolsTrail([{ name: 'Testosterone dose', url: '/tools/trt-dose-calculator/',
      absolute: api.SITE + '/tools/trt-dose-calculator/' }]),
    body,
    script: [
      W.prologue({ attribution }),
      emitSteadyState(),
      ctx.A.fnSource(app.src, 'pkCurve'),
      `var TRT_PK = ${JSON.stringify(pk)};`,
      `var TRT_SIZES = ${JSON.stringify(app.SYR_SIZES)};`,
      TRT_JS,
      `document.addEventListener('DOMContentLoaded', function () { trtCalc(); });`
    ].join('\n\n')
  });
}

/* ---- 3. free testosterone (Vermeulen) ---------------------------------- */

/* Written here rather than lifted: the app has no calculated-free-T function.
   The equation is Vermeulen 1999 and the constants are printed on the page, so
   a reader can check the arithmetic rather than trust it. Unit factors come
   from MARKER_REGISTRY at build time, so the accepted units are exactly the
   ones the app accepts. */
const FREET_JS = `
/* Vermeulen A, Verdonck L, Kaufman JM. J Clin Endocrinol Metab 1999;84(10):3666-72.
   Free testosterone solves N·Kshbg·FT² + (N + Kshbg·(SHBG − T))·FT − T = 0,
   where N = 1 + Kalb·[albumin]. Bioavailable testosterone is FT × N — free plus
   the loosely albumin-bound fraction. */
var VT_KALB = 3.6e4;      /* L/mol, testosterone-albumin association constant */
var VT_KSHBG = 1.0e9;     /* L/mol, testosterone-SHBG association constant */
var VT_ALB_MW = 66500;    /* g/mol */
var VT_NGDL_PER_NMOL = 28.84;  /* MARKER_REGISTRY tott: nmol/L × 28.84 = ng/dL */

function tlVermeulen(totalNgDl, shbgNmol, albGdl) {
  if (!(totalNgDl > 0) || !(shbgNmol > 0) || !(albGdl > 0)) return null;
  var T = (totalNgDl / VT_NGDL_PER_NMOL) * 1e-9;   /* mol/L */
  var S = shbgNmol * 1e-9;                         /* mol/L */
  var alb = (albGdl * 10) / VT_ALB_MW;             /* g/dL -> g/L -> mol/L */
  var N = 1 + VT_KALB * alb;
  var a = N * VT_KSHBG;
  var b = N + VT_KSHBG * (S - T);
  var c = -T;
  var disc = b * b - 4 * a * c;
  if (!(disc >= 0)) return null;
  var FT = (-b + Math.sqrt(disc)) / (2 * a);       /* mol/L */
  var freeNgDl = FT * 1e9 * VT_NGDL_PER_NMOL;
  return {
    freeNgDl: freeNgDl,
    freePgMl: freeNgDl * 10,                        /* registry freet: ng/dL × 10 = pg/mL */
    freePct: (FT / T) * 100,
    bioNgDl: FT * N * 1e9 * VT_NGDL_PER_NMOL,
    N: N
  };
}

function ftToCanonical(id) {
  var v = parseFloat(document.getElementById('ft-' + id).value);
  var u = document.getElementById('ft-' + id + '-unit').value;
  var f = FT_UNITS[id][u];
  return (v > 0 && f) ? v * f : NaN;
}

function ftCalc() {
  var out = document.getElementById('ft-out');
  var total = ftToCanonical('total');
  var shbg = ftToCanonical('shbg');
  var alb = ftToCanonical('alb');
  if (!(total > 0) || !(shbg > 0) || !(alb > 0)) {
    out.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:10px 0">' +
      'Enter total testosterone, SHBG and albumin.</div>';
    return;
  }
  var r = tlVermeulen(total, shbg, alb);
  if (!r) {
    out.innerHTML = '<div style="color:var(--danger);font-size:12px;padding:10px 0">' +
      'Those values do not produce a solution — check the units.</div>';
    return;
  }
  var band = FT_REF.freet;
  var flag = '';
  if (band) {
    var pg = r.freePgMl;
    var where = pg < band.lo ? 'below' : pg > band.hi ? 'above' : 'within';
    flag = '<div style="font-size:12px;color:var(--text2);margin-top:8px;line-height:1.6">' +
      'That is <strong>' + where + '</strong> the generic reference range of ' + band.lo + '&ndash;' +
      band.hi + ' pg/mL (male default, not your lab\\'s range)' +
      (band.olo ? ', and ' + (pg >= band.olo && pg <= band.ohi ? 'inside' : 'outside') +
        ' the ' + band.olo + '&ndash;' + band.ohi + ' pg/mL band this app treats as optimal &mdash; ' +
        'a <strong>non-diagnostic</strong> band for reading a trend, not a threshold that ' +
        'diagnoses anything' : '') + '.</div>';
  }
  out.innerHTML =
    '<div style="padding:12px;background:rgba(59,196,255,0.06);border:1px solid rgba(59,196,255,0.22);border-radius:11px">' +
      '<div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--accent2);margin-bottom:6px">Calculated free testosterone</div>' +
      '<div style="display:flex;align-items:baseline;gap:8px">' +
        '<div style="font-family:\\'DM Serif Display\\',serif;font-size:34px;color:var(--accent2);line-height:1">' +
        r.freePgMl.toFixed(1) + '</div><div style="font-size:14px;color:var(--text2)">pg/mL</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-top:3px">' +
        r.freeNgDl.toFixed(2) + ' ng/dL &middot; ' + r.freePct.toFixed(2) + '% of total' +
      '</div>' + flag +
    '</div>' +
    '<div style="padding:12px;background:var(--surface2);border:1px solid var(--border2);border-radius:11px;margin-top:10px">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0">' +
        '<span style="color:var(--text2)">Bioavailable testosterone</span>' +
        '<span style="font-family:\\'DM Mono\\',monospace;color:var(--text)">' +
        r.bioNgDl.toFixed(1) + ' ng/dL</span></div>' +
      '<div style="display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0">' +
        '<span style="color:var(--text2)">Total, in canonical units</span>' +
        '<span style="font-family:\\'DM Mono\\',monospace;color:var(--text)">' +
        total.toFixed(1) + ' ng/dL (' + (total / VT_NGDL_PER_NMOL).toFixed(2) + ' nmol/L)</span></div>' +
      '<div style="font-size:11px;color:var(--text3);line-height:1.55;margin-top:8px">' +
      'Bioavailable testosterone is the free fraction plus the loosely albumin-bound fraction ' +
      '(free × ' + r.N.toFixed(1) + ' here). It is a calculated value like the free figure, so ' +
      'it inherits the same assay error.</div>' +
    '</div>';
}
`.trim();

function freeTPage(ctx, api) {
  const { app, attribution, W } = ctx;
  const reg = ctx.registry.MARKER_REGISTRY;
  const need = ['tott', 'shbg', 'albumin', 'freet', 'bioavailt'];
  need.forEach((k) => { if (!reg[k]) throw new Error('registry is missing marker ' + k); });

  /* Only the units the registry accepts, with its own factors to canonical. */
  const units = {
    total: reg.tott.units,
    shbg: reg.shbg.units,
    alb: reg.albumin.units
  };
  const ref = {
    freet: ctx.registry.LAB_REF.freet,
    tott: ctx.registry.LAB_REF.tott,
    shbg: ctx.registry.LAB_REF.shbg
  };
  const unitSelect = (id, table, dflt) => `<select id="ft-${id}-unit" onchange="ftCalc()" style="width:104px;flex:none">` +
    Object.keys(table).map((u) => `<option value="${api.esc(u)}"${u === dflt ? ' selected' : ''}>${api.esc(u)}</option>`).join('') +
    `</select>`;

  const widget = `    <div class="widget">
      <div class="card">
        <div class="card-title">Calculated free and bioavailable testosterone</div>
        <div class="ig"><label class="il" for="ft-total">Total testosterone</label>
          <div style="display:flex;gap:8px">
            <input type="number" id="ft-total" value="600" step="any" oninput="ftCalc()" style="flex:1">
            ${unitSelect('total', units.total, 'ng/dL')}
          </div></div>
        <div class="ig"><label class="il" for="ft-shbg">SHBG</label>
          <div style="display:flex;gap:8px">
            <input type="number" id="ft-shbg" value="30" step="any" oninput="ftCalc()" style="flex:1">
            ${unitSelect('shbg', units.shbg, 'nmol/L')}
          </div></div>
        <div class="ig"><label class="il" for="ft-alb">Albumin <span style="font-weight:400;color:var(--text3)">(4.3 g/dL is the usual default)</span></label>
          <div style="display:flex;gap:8px">
            <input type="number" id="ft-alb" value="4.3" step="any" oninput="ftCalc()" style="flex:1">
            ${unitSelect('alb', units.alb, 'g/dL')}
          </div></div>
        <div id="ft-out"></div>
      </div>
    </div>`;

  const body = [
    `    <h1>Free testosterone calculator</h1>`,
    `    <p class="lede">Calculated free and bioavailable testosterone from total testosterone,
    SHBG and albumin, by the Vermeulen equation — in whatever units your lab printed. Free, no
    account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p>Most of the testosterone in your blood is not available to your tissues. Roughly
    two-thirds is bound tightly to <strong>sex hormone binding globulin</strong>, most of the
    rest is bound loosely to <strong>albumin</strong>, and a couple of per cent circulates
    free. Because SHBG varies enormously between people — and moves with thyroid status,
    insulin, alcohol, oestrogen and age — two men with the same total testosterone can have
    substantially different free levels. That is the entire reason this calculation exists.</p>`,
    `    <p>Worked through: <strong>600 ng/dL total, SHBG 30 nmol/L, albumin 4.3 g/dL</strong>
    gives a calculated free testosterone of about <strong>13.4 ng/dL — 134 pg/mL, or 2.2% of
    total</strong>, and a bioavailable testosterone of roughly <strong>325 ng/dL</strong>. Hold
    the total at 600 and raise SHBG to 60 and the free figure falls by close to a third,
    without the total moving at all.</p>`,
    widget,
    `    <h2>The equation, and where it comes from</h2>`,
    `    <p>This is the Vermeulen equation, published in 1999 and still the calculation most
    laboratories and clinical calculators use. It treats binding to SHBG and albumin as two
    equilibria and solves for the free concentration that satisfies both.</p>`,
    api.formula([
      'N   =  1 + Kalb × [albumin]',
      'N·Kshbg·FT²  +  (N + Kshbg·([SHBG] − [T]))·FT  −  [T]  =  0',
      'FT  =  ( −b + √(b² − 4ac) ) ÷ 2a      with a = N·Kshbg, b = N + Kshbg·([SHBG] − [T]), c = −[T]',
      'bioavailable T  =  FT × N',
      '',
      'Kalb   =  3.6 × 10⁴ L/mol        Kshbg  =  1.0 × 10⁹ L/mol',
      'albumin molar mass  =  66,500 g/mol',
      'unit factor: nmol/L × 28.84 = ng/dL;  ng/dL × 10 = pg/mL'
    ]),
    `    <p>The constants are printed above rather than buried, because they are what a reader
    would need to check the arithmetic — and because different published implementations use
    slightly different association constants and albumin molar masses, which is one reason two
    online calculators can disagree by a few per cent on the same inputs. Source: Vermeulen A,
    Verdonck L, Kaufman JM. <em>A critical evaluation of simple methods for the estimation of
    free testosterone in serum.</em> J Clin Endocrinol Metab 1999;84(10):3666–72
    (<a href="https://doi.org/10.1210/jcem.84.10.6079" rel="nofollow">doi:10.1210/jcem.84.10.6079</a>).</p>`,
    `    <h2>Why the calculated value depends on the SHBG assay</h2>`,
    `    <p>${api.EV.established} A calculated free testosterone is only as good as the three
    numbers going into it, and SHBG is the one that carries the most weight. The registry note
    the app uses for free testosterone puts it plainly: <em>direct immunoassay free T is
    unreliable; equilibrium dialysis is the reference method; calculated values depend on the
    SHBG assay.</em></p>`,
    `    <p>Three practical consequences. First, a calculated free testosterone from one lab and
    a calculated one from another are not interchangeable if their SHBG platforms differ —
    SHBG immunoassays are not harmonised the way many analytes are. Second, a
    <strong>direct immunoassay</strong> free testosterone (sometimes just labelled "free
    testosterone" with no method) is a different measurement again, and generally a worse one;
    it is not what this page computes. Third, <strong>equilibrium dialysis</strong> remains the
    reference method, and where a free level is genuinely decision-relevant — a total in range
    with symptoms that are not, or an unusually high or low SHBG — that is the test worth
    asking for rather than a calculation.</p>`,
    `    <p>The total testosterone assay matters too. The app's registry note for it:
    <em>LC/MS-MS and immunoassay diverge materially at low concentrations; do not trend across
    methods without flagging the switch.</em> Feeding an immunoassay total into this equation
    and comparing the answer with a calculation from an LC/MS-MS total is comparing two
    different things.</p>`,
    `    <h2>Reading the result</h2>`,
    api.factBox([
      ['Generic reference range, free T',
        `${ref.freet.lo}&ndash;${ref.freet.hi} ${api.esc(ref.freet.unit)} &mdash; male default. <em>The range printed on your own report belongs to the assay that produced your number and wins over this one.</em>`],
      ref.freet.olo ? ['Optimal band, free T',
        `${ref.freet.olo}&ndash;${ref.freet.ohi} ${api.esc(ref.freet.unit)} &mdash; <strong>non-diagnostic</strong>. Drawn from clinical literature and community practice for reading a trend over time; being outside it is not a finding.`] : null,
      ['Generic reference range, total T',
        `${ref.tott.lo}&ndash;${ref.tott.hi} ${api.esc(ref.tott.unit)} (male default)`],
      ['Generic reference range, SHBG',
        `${ref.shbg.lo}&ndash;${ref.shbg.hi} ${api.esc(ref.shbg.unit)}`],
      ['What this does not do',
        'Diagnose anything. A calculated free testosterone is one input to a clinical picture that also includes symptoms, an examination, and the rest of the panel. Take the number to the clinician who ordered it.']
    ]),
    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['Which is better, calculated or direct free testosterone?', [
        `Calculated, in almost every case where equilibrium dialysis is not available. Direct
         (analog) immunoassay free testosterone has been criticised for decades for tracking
         total testosterone and SHBG poorly, and several professional bodies advise against it.
         Calculated free testosterone from a reliable total and SHBG agrees far better with
         equilibrium dialysis. Where the stakes are high, ask for the dialysis method.`
      ]],
      ['What albumin should I enter if I do not have one?', [
        `4.3 g/dL (43 g/L) is the conventional default and the value most published calculators
         assume. Albumin varies much less between healthy people than SHBG does, so the error
         it introduces is small — but if you have a real albumin on the same panel, use it.
         Genuinely low albumin, as in liver or kidney disease, changes the answer materially
         and is a reason to use the measured value.`
      ]],
      ['Why is my free testosterone low when my total is normal?', [
        `High SHBG is the usual explanation, and it is exactly what this calculation is for.
         SHBG rises with thyroid hormone excess, oestrogen, some anticonvulsants, liver
         disease, low insulin and age; it falls with insulin resistance, obesity,
         hypothyroidism and androgen exposure. A total in the middle of the range with a
         high SHBG can leave a free level near the bottom of it. What to do about that is a
         clinical question — the value of the calculation is that it makes the discrepancy
         visible instead of invisible.`
      ]],
      ['Does this work for women?', [
        `The equation is not sex-specific and the arithmetic is the same, but the reference
         ranges quoted on this page are male defaults and would be badly misleading applied to
         a female result. The app applies sex-aware ranges with age banding; this page does
         not, and a female free testosterone should be read against a female interval from the
         lab that ran it.`
      ]]
    ]),
    `    <p>Related: <a href="/tools/trt-dose-calculator/">testosterone dose calculator</a>, and
    the <a href="/markers/">lab-marker pages</a> for free versus total testosterone, SHBG and
    the assay questions behind both.</p>`,
    shell.ctaBox('free-testosterone-calculator',
      'The app stores total testosterone, SHBG, albumin and the assay method for each together, flags each against your own lab’s printed range, and charts the trend.',
      'Log this panel in the app')
  ].filter(Boolean).join('\n\n');

  return api.render(ctx, {
    url: '/tools/free-testosterone-calculator/',
    title: 'Free testosterone calculator (Vermeulen) | TherapyLog',
    description: 'Free and bioavailable testosterone from total T, SHBG and albumin by ' +
      'the Vermeulen equation, in your lab’s units. Free, no account.',
    trail: api.toolsTrail([{ name: 'Free testosterone', url: '/tools/free-testosterone-calculator/',
      absolute: api.SITE + '/tools/free-testosterone-calculator/' }]),
    body,
    script: [
      W.prologue({ attribution }),
      `var FT_UNITS = ${JSON.stringify(units)};`,
      `var FT_REF = ${JSON.stringify(ref)};`,
      FREET_JS,
      `document.addEventListener('DOMContentLoaded', function () { ftCalc(); });`
    ].join('\n\n')
  });
}

/* ---- 4. combined syringe planner --------------------------------------- */

function syringePage(ctx, api) {
  const { app, attribution, W, A } = ctx;

  /* The static injectables array that replaces the app's live one, built from
     DB × a PK medium that is actually injectable, with Tier C removed. */
  const injectables = Object.values(app.byId)
    .filter((d) => {
      const pk = app.TL_PK[d.id];
      return pk && ['aq', 'oil', 'susp'].includes(pk.medium) && !A.isTierC(d.id);
    })
    /* `id` is carried because the app's syrAddRow() defaults the first row with
       inj.find(x => x.id === 'tc') — without it the planner would open on
       whatever sorts first instead of on testosterone cypionate. */
    .map((d) => ({
      id: d.id,
      name: d.name,
      medium: app.TL_PK[d.id].medium,
      fragile: !!app.TL_PK[d.id].fragile
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const widget = W.syringeWidget(app.src, {
    syrSizes: app.SYR_SIZES,
    pkColors: app.PK_COLORS,
    injectables,
    slug: 'syringe-builder'
  });

  const counts = injectables.reduce((a, x) => { a[x.medium] = (a[x.medium] || 0) + 1; return a; }, {});

  const body = [
    `    <h1>Combined syringe planner</h1>`,
    `    <p class="lede">Plan a multi-compound draw, see the fill level compound by compound, and
    get told when two things should not share a syringe. ${injectables.length} injectables,
    free, no account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p>Two separate questions get run together when people combine compounds in one draw,
    and only one of them is arithmetic. The arithmetic is easy: a dose divided by the vial's
    concentration is a volume, volumes add, and the total either fits the barrel or does not.
    The other question is whether the two solutions should be in the same barrel at all — and
    that one is about chemistry, not capacity.</p>`,
    `    <p>Worked through: 60 mg of a 200 mg/ml oil is 0.3 ml, 250 mcg of a 2,500 mcg/ml
    aqueous peptide is 0.1 ml, and 0.4 ml fits a 1 ml syringe comfortably. The planner will
    still stop you — because one is oil-based and one is water-based, and mixing those two
    phases in a barrel makes the dose of each unreliable.</p>`,
    widget.html,
    `    <h2>The compatibility rules, and why each one exists</h2>`,
    `    <p>${api.EV.established} These are formulation rules rather than clinical ones — they
    are about what the solutions do, and they are the same three the app enforces.</p>`,
    `    <h3>Oil and water do not share a syringe</h3>`,
    `    <p>An oil-based injectable and an aqueous one are immiscible. In a barrel they
    separate, and because they separate you cannot know what proportion of each you are
    actually delivering — including at the end of the push, where whatever settled last goes
    in first. The arithmetic says 0.4 ml; the syringe delivers an unknown split of it. The
    planner blocks this combination rather than warning about it.</p>`,
    `    <h3>Aqueous suspensions draw alone</h3>`,
    `    <p>A suspension is solid particles held in a liquid, not a dissolved solution. Drawn
    with anything else, the particles distribute unevenly and can also be filtered unevenly by
    the needle. There is no reliable way to co-draw a suspension, so it is a block too.</p>`,
    `    <p><strong>You will not be able to trigger that one here</strong>, and it is worth saying
    so rather than leaving you to wonder. The rule is real and the planner enforces it, but every
    suspension in the app's reference belongs to a class this site does not publish pages for, so
    the list above contains none. The rule is documented because you may meet a suspension
    outside this list; it is not demonstrable on this page.</p>`,
    `    <h3>Fragile proteins are not blended</h3>`,
    `    <p>Some peptides — growth hormone and IGF-1 among them — are large, structurally
    delicate proteins that lose activity when they are agitated, exposed to a different pH, or
    left in contact with another solvent. Mixing them into a shared draw risks degrading them
    into something inert. The planner flags these rather than blocking them, because the risk
    is loss of potency rather than an unmeasurable dose.</p>`,
    `    <h2>What the planner knows about</h2>`,
    api.factBox([
      ['Injectables listed', `${injectables.length} &mdash; ` +
        `${counts.oil || 0} oil-based, ${counts.aq || 0} aqueous, ${counts.susp || 0} suspensions`],
      ['Syringe sizes', app.SYR_SIZES.map((s) => api.esc(s.label)).join(' &middot; ')],
      ['What it computes', 'Volume per compound from dose ÷ vial concentration, the total against the barrel, and the fill shown as a stacked diagram coloured per compound.'],
      ['What it does not do', 'Decide a dose, check a clinical interaction, or vouch for what is in a vial. The combination question about your body rather than your syringe is a different page.']
    ]),
    `    <div class="note">
      <p><strong>Compatibility in a barrel is not the same as safety in a person.</strong> Two
      compounds that co-draw perfectly well can still be a combination worth thinking twice
      about, and two that cannot share a syringe may be entirely reasonable injected
      separately. For the pharmacological question — whether these two should be taken together
      at all — see <a href="/tools/stack-checker/">can you take these together</a>, and take
      anything you are unsure about to your prescribing clinician or pharmacist.</p>
    </div>`,
    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['Can I mix two water-based peptides in one syringe?', [
        `Usually yes as far as the formulation goes, and the planner will let you — CJC-1295 and
         ipamorelin drawn together is the common example. What it still checks is the total
         volume against the barrel, and whether either one is a fragile protein. Whether the
         combination makes sense is a separate question from whether it draws.`
      ]],
      ['Does drawing two compounds together change the dose of either?', [
        `Not if both are true solutions and the total fits — you are delivering the same
         milligrams, in more liquid. That is exactly why the oil-and-water case is a block
         rather than a warning: there, the delivered amount of each becomes genuinely unknown.`
      ]],
      ['Why does the diagram matter if I have the numbers?', [
        `Because a volume in millilitres is abstract and a fill line is not. Seeing that a
         planned draw reaches the top of a 1 ml barrel tends to prompt the right question — is
         this one injection or two — before the syringe is in your hand rather than after.`
      ]],
      ['Is this list every injectable?', [
        `No. It is every entry in the app's compound reference that has an injectable
         formulation recorded, minus the ones this site does not publish pages about. A vial in
         front of you that is not on the list is not thereby unusual; the list is what the app
         models, not a formulary.`
      ]]
    ]),
    `    <p>Related: the <a href="/tools/peptide-reconstitution-calculator/">reconstitution
    calculator</a> for the concentration each of these draws depends on, and
    <a href="/tools/insulin-syringe-units-calculator/">units and millilitres</a>.</p>`,
    shell.ctaBox('syringe-builder',
      'In the app the planned draw logs as one injection across every compound in it, with the site rotation and the vial counts kept up to date.')
  ].join('\n\n');

  return api.render(ctx, {
    url: '/tools/syringe-builder/',
    title: 'Combined syringe planner | TherapyLog',
    description: 'Plan a multi-compound draw, see the stacked fill level, and get warned ' +
      'when compounds should not share a syringe. Free, no account.',
    trail: api.toolsTrail([{ name: 'Syringe planner', url: '/tools/syringe-builder/',
      absolute: api.SITE + '/tools/syringe-builder/' }]),
    body,
    script: [
      W.prologue({ attribution }),
      widget.fns,
      `document.addEventListener('DOMContentLoaded', function () { ${widget.init} });`
    ].join('\n\n')
  });
}

/* ---- 5. half-life calculator ------------------------------------------- */

const HL_JS = `
/* How wide the chart should be for THIS compound at THIS interval. A fixed
   window cannot work: the modelled half-lives here span 0.1 h to 840 h, so
   42 days is five doses of a GLP-1 and forty-two invisible spikes of a peptide
   that clears in an afternoon. Show five half-lives (the approach to steady
   state) or five dosing intervals (enough sawtooth to read), whichever is
   wider, clamped to something a chart can actually draw. */
function hlFitDays(hl, interval) {
  var d = Math.max(5 * hl, 5 * interval) / 24;
  return Math.min(120, Math.max(2, Math.round(d)));
}

/* The user's own number wins once they have typed one. */
var hlDaysTouched = false;
function hlTouchDays() { hlDaysTouched = true; hlCalc(); }

/* Re-fit the frequency and the window to the newly chosen compound. The
   frequency comes from that compound's own dosing rows in the app's reference,
   so picking BPC-157 proposes daily rather than leaving it on a twice-weekly
   setting that suits testosterone. */
function hlPick() {
  var e = HL_PK[document.getElementById('hl-compound').value];
  if (e && e.freq) {
    var sel = document.getElementById('hl-freq');
    for (var i = 0; i < sel.options.length; i++) {
      if (parseFloat(sel.options[i].value) === e.freq) { sel.value = sel.options[i].value; break; }
    }
  }
  hlDaysTouched = false;
  hlRefit();
}

function hlRefit() {
  var e = HL_PK[document.getElementById('hl-compound').value];
  if (e && !hlDaysTouched) {
    var perWeek = parseFloat(document.getElementById('hl-freq').value) || 2;
    document.getElementById('hl-days').value = hlFitDays(e.hl, 168 / perWeek);
  }
  hlCalc();
}

function hlCalc() {
  var id = document.getElementById('hl-compound').value;
  var e = HL_PK[id];
  var out = document.getElementById('hl-out');
  if (!e) { out.innerHTML = ''; return; }
  var perWeek = parseFloat(document.getElementById('hl-freq').value);
  var interval = 168 / perWeek;
  var days = parseFloat(document.getElementById('hl-days').value) || 28;
  var fit = hlFitDays(e.hl, interval);
  var note = document.getElementById('hl-fit');
  if (note) {
    note.innerHTML = (Math.abs(days - fit) <= 0.5)
      ? 'Window fitted to this compound: five half-lives, or five doses, whichever is longer.'
      : 'Showing ' + days + ' days. <a href="#" onclick="hlDaysTouched=false;hlRefit();return false;" ' +
        'style="color:var(--accent2)">Fit to ' + fit + ' days</a> for this compound.';
  }
  var f = pkCurve(e.hl, e.tmax);
  var ss = steadyState(f, e.hl, interval);
  var ttss = 5 * e.hl;
  var doses = Math.max(1, Math.ceil((days * 24) / interval));
  var g = repeated(f, interval, doses);
  /* {x, y} points on a linear x scale rather than 300 category labels, so
     Chart.js picks whole-day ticks instead of 4.34, 8.68, 13.02… */
  var pts = [], single = [];
  var n = 300, hours = days * 24;
  for (var i = 0; i <= n; i++) {
    var t = (i / n) * hours;
    var day = round(t / 24, 3);
    pts.push({ x: day, y: round(g(t), 4) });
    single.push({ x: day, y: round(f(t), 4) });
  }
  drawChart(pts, single, days);
  out.innerHTML =
    row('Modelled half-life', fmtHours(e.hl) + (e.est ? ' <em>— estimated, limited human PK data</em>' : '')) +
    row('Time to peak after a dose', fmtHours(e.tmax)) +
    row('Dosing interval', fmtHours(interval)) +
    row('Time to steady state', '~' + fmtHours(ttss) + ' (about five half-lives)') +
    row('Accumulation vs one dose', ss.accumulation + '&times;') +
    row('Peak-to-trough ratio', ss.cleared
      ? 'not meaningful \u2014 the level clears between doses'
      : ss.ratio + '&times;') +
    '<div style="font-size:11px;color:var(--text3);line-height:1.55;margin-top:8px">' +
    'Relative levels from a one-compartment model with the peak of a single dose set to 1 — ' +
    'not concentrations. The shape is the useful part.</div>';
  function row(k, v) {
    return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:4px 0;border-top:1px solid var(--border)">' +
      '<span style="color:var(--text2)">' + k + '</span>' +
      '<span style="font-family:\\'DM Mono\\',monospace;color:var(--text);text-align:right">' + v + '</span></div>';
  }
}

var hlChart = null;
function drawChart(stacked, single, days) {
  var cv = document.getElementById('hl-chart');
  if (!cv || typeof Chart === 'undefined') return;
  if (hlChart) hlChart.destroy();
  hlChart = new Chart(cv.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        { label: 'Repeated dosing', data: stacked, borderColor: '#4ade9a',
          backgroundColor: 'rgba(74,222,154,0.12)', fill: true, borderWidth: 2,
          pointRadius: 0, tension: 0.25 },
        { label: 'One dose alone', data: single, borderColor: '#78859b',
          borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.25 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      parsing: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#8a95a3', boxWidth: 10, usePointStyle: false, font: { size: 11 } } },
        tooltip: { callbacks: {
          title: function (it) {
            var d = it[0].parsed.x;
            return d < 1 ? 'Hour ' + Math.round(d * 24) : 'Day ' + (Math.round(d * 10) / 10);
          },
          label: function (c) { return c.dataset.label + ': ' + c.parsed.y.toFixed(2) + '×'; }
        } }
      },
      scales: {
        /* Under about two days the useful unit is hours — a peptide that clears
           in an afternoon has nothing to say on a day scale. */
        x: { type: 'linear', min: 0, max: days,
             title: { display: true, text: days <= 2 ? 'Hours' : 'Days', color: '#78859b', font: { size: 11 } },
             ticks: { color: '#78859b', maxTicksLimit: 10, font: { size: 10 },
                      callback: function (v) {
                        if (days <= 2) return String(Math.round(v * 24));
                        return v < 1 && v > 0 ? '' : String(v);
                      } },
             grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { beginAtZero: true,
             title: { display: true, text: 'Relative level (one dose peak = 1)', color: '#78859b', font: { size: 11 } },
             ticks: { color: '#78859b', font: { size: 10 } },
             grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}
`.trim();

function halfLifeCalcPage(ctx, api) {
  const { app, attribution, W, A } = ctx;
  const eligible = Object.keys(app.TL_PK)
    .filter((id) => app.TL_PK[id].hl != null && !A.isTierC(id) && app.byId[id])
    .map((id) => ({ id, name: app.byId[id].name, ...app.TL_PK[id] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  /* Each compound's usual dosing frequency, read out of its own dosing rows in
     the app's reference rather than assumed. 47 of the 50 eligible compounds
     state one; the rest keep the twice-weekly default. Performance and cycle
     rows never contribute — the same filter every other page applies. */
  const PERF_ROW = /performance|cycle|blast|advanced|intermediate/i;
  const freqPerWeek = (entry) => {
    for (const r of (entry.doses || [])) {
      if (PERF_ROW.test(r.l)) continue;
      const f = String(r.f || '') + ' ' + String(r.d || '');
      if (/twice\s+daily|2x\s*daily|\bBID\b|AM and PM/i.test(f)) return 14;
      if (/every\s+other\s+day|\bEOD\b/i.test(f)) return 3.5;
      if (/once\s+daily|\bdaily\b|\bED\b|\/day\b|per day/i.test(f)) return 7;
      if (/three\s+times\s+(?:a\s+)?week|3x\s*(?:per\s*)?week/i.test(f)) return 3;
      if (/twice\s+(?:a\s+)?week|2x\s*(?:per\s*)?week|two\s+times\s+(?:a\s+)?week|Mon\/Thu/i.test(f)) return 2;
      if (/every\s+two\s+weeks|every\s+2\s+weeks|biweekly|fortnight/i.test(f)) return 0.5;
      if (/once\s+weekly|weekly|per\s+week|\/week/i.test(f)) return 1;
    }
    return null;
  };

  const pk = {};
  eligible.forEach((e) => {
    pk[e.id] = { hl: e.hl, tmax: e.tmax, est: !!e.est, name: e.name };
    const f = freqPerWeek(app.byId[e.id]);
    if (f) pk[e.id].freq = f;
  });

  const opts = eligible.map((e, i) =>
    `<option value="${e.id}"${e.id === 'tc' ? ' selected' : ''}>${api.esc(e.name)}` +
    `${e.est ? ' (estimated)' : ''}</option>`).join('');

  const estCount = eligible.filter((e) => e.est).length;

  /* The page opens on testosterone cypionate; its window is fitted the same way
     the widget refits on every later change, so the first render is already
     right rather than a constant that happens to suit one compound. */
  const opening = pk.tc || pk[eligible[0].id];
  const openingFreq = opening.freq || 2;
  const DEFAULT_DAYS = Math.min(120, Math.max(2,
    Math.round(Math.max(5 * opening.hl, 5 * (168 / openingFreq)) / 24)));

  const widget = `    <div class="widget">
      <div class="card">
        <div class="card-title">Half-life and steady state</div>
        <div class="ig"><label class="il" for="hl-compound">Compound</label>
          <select id="hl-compound" onchange="hlPick()">${opts}</select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="ig"><label class="il" for="hl-freq">Injections/doses per week</label>
            <select id="hl-freq" onchange="hlRefit()">
              <option value="0.5">Every two weeks</option>
              <option value="1">Once weekly</option>
              <option value="2" selected>Twice weekly</option>
              <option value="3">Three times weekly</option>
              <option value="3.5">Every other day</option>
              <option value="7">Once daily</option>
              <option value="14">Twice daily</option>
            </select></div>
          <div class="ig"><label class="il" for="hl-days">Days to chart</label>
            <input type="number" id="hl-days" value="${DEFAULT_DAYS}" min="1" max="365" step="1" oninput="hlTouchDays()"></div>
        </div>
        <div id="hl-fit" style="font-size:11px;color:var(--text3);line-height:1.5;margin:-2px 0 8px"></div>
        <div style="height:280px;margin:6px 0 12px"><canvas id="hl-chart"></canvas></div>
        <div id="hl-out"></div>
        <div style="font-size:10.5px;color:var(--text3);line-height:1.55;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">This does the arithmetic you typed and nothing else. Modelled half-lives are population figures from published pharmacokinetics, not measurements of you, and dosing decisions belong with a qualified provider.</div>
      </div>
    </div>`;

  const body = [
    `    <h1>Half-life and steady-state calculator</h1>`,
    `    <p class="lede">How long a compound takes to clear, how much it builds up when you dose
    it repeatedly, and how far the level swings between doses — for
    ${eligible.length} PK-modelled compounds. Free, no account.</p>`,
    `    <div class="updated">Last reviewed: @@DATE_LONG@@</div>`,
    `    <p>A half-life is the time for a level to fall by half, and on its own it answers less
    than people expect. What it actually determines are three things: how long one dose stays
    meaningfully present, how much repeated doses <strong>accumulate</strong>, and how long
    until that accumulation stops changing — <strong>steady state</strong>. All three fall out
    of the same number and the interval between doses.</p>`,
    `    <p>Worked through with testosterone cypionate, whose modelled half-life is
    ${curve.fmtHours(app.TL_PK.tc.hl)}: injected <strong>twice weekly</strong>, the interval is
    84 hours, so each dose lands with roughly ${(Math.pow(2, -84 / app.TL_PK.tc.hl) * 100).toFixed(0)}%
    of the previous one still there. Levels therefore stack to about
    <strong>${(1 / (1 - Math.pow(2, -84 / app.TL_PK.tc.hl))).toFixed(2)}×</strong> what a single
    dose reaches, plateau after about <strong>${Math.round(5 * app.TL_PK.tc.hl / 24)} days</strong>,
    and then oscillate between a trough and a peak only about 1.2 times higher. Move the same
    weekly total to a single injection and the accumulation falls while the swing roughly
    doubles.</p>`,
    widget,
    `    <h2>How the math works</h2>`,
    api.formula([
      'elimination rate  ke  =  ln 2 ÷ half-life',
      'one dose:  level(t)  ∝  e^(−ke·t) − e^(−ka·t)      (one-compartment, ka matched to time-to-peak)',
      'repeated dosing:  add one curve per dose, offset by the interval',
      '',
      'accumulation ratio  =  1 ÷ (1 − 2^(−interval ÷ half-life))',
      'time to steady state  ≈  5 × half-life        (~97% of the way there)',
      'fraction left after one interval  =  2^(−interval ÷ half-life)'
    ]),
    `    <p>The curve is the app's own <code>pkCurve</code> function — a one-compartment model
    with absorption and elimination, where the absorption rate is fitted so the peak lands at
    the compound's published time-to-peak. It is normalised so a single dose peaks at 1, which
    is why the vertical axis reads in multiples rather than in ng/dL: the shape and the ratios
    transfer between people, the absolute concentrations do not.</p>`,
    `    <p>"Five half-lives to steady state" is the same arithmetic read from the other end:
    each half-life closes half the remaining gap, so after five you are about 97% of the way
    there. It is also why a bloodwork panel drawn two weeks into a change measures a level
    still travelling.</p>`,
    `    <h2>Where these numbers come from</h2>`,
    `    <p>Every half-life and time-to-peak here is the figure the TherapyLog app carries for
    that compound, drawn from published pharmacokinetic literature.
    <strong>${estCount} of the ${eligible.length}</strong> are marked
    <em>estimated</em> in the compound list above and everywhere else they appear: that means
    the human PK data is limited or absent and the figure is inferred. Most research peptides
    are in that category, and treating an estimated four-hour half-life as though it were a
    measured one is the most common way this kind of calculation goes wrong.</p>`,
    `    <p>The app also lets you override a half-life per compound, in the Levels tab under
    Adjust — useful when you have reason to prefer a different published figure. This page uses
    the defaults.</p>`,
    `    <h2>Questions people actually ask</h2>`,
    api.faq([
      ['How long until a compound is completely out of my system?', [
        `Practically, four to five half-lives leaves a few per cent, and most people treat that
         as cleared. Mathematically it never reaches zero. Two cautions: "cleared from serum"
         is not the same as "its effects have resolved" — suppression of your own hormone axis
         outlasts the drug that caused it — and detection windows for testing purposes are a
         different question again, with different answers.`
      ]],
      ['Why does the level keep rising if I am taking the same dose?', [
        `Because each dose lands on what is left of the last one. If half the previous dose is
         still present when the next arrives, the level climbs until the amount cleared per
         interval equals the amount given per interval. That plateau is steady state, and the
         accumulation ratio above says how much higher it sits than a single dose.`
      ]],
      ['Does a longer half-life mean a stronger compound?', [
        `No. It means a smoother and more persistent one. Half-life describes how fast something
         leaves, not how much it does while it is there. Two compounds with the same half-life
         can differ enormously in potency, and a very short half-life is why some compounds are
         dosed daily rather than being weaker.`
      ]],
      ['What is the peak-to-trough ratio for?', [
        `Choosing a cadence. It is the modelled peak divided by the modelled trough at steady
         state, so 1.2 is a fairly flat line and 4 is a sawtooth. Whether a flatter curve feels
         better is individual and this page cannot tell you — what it can tell you is which
         cadences produce which shape, which is the part that is actually calculable.`
      ]]
    ]),
    `    <p>Per-compound pages with the curve already drawn, the provenance, the monitoring panel
    and the interaction rules that name it are linked from <a href="/tools/">the tools hub</a>.
    Related: <a href="/tools/trt-dose-calculator/">testosterone dose calculator</a>.</p>`,
    shell.ctaBox('half-life-calculator',
      'In the app this curve is drawn from the doses you actually logged, with your own dates, and projects seven days forward from your last one.')
  ].join('\n\n');

  return api.render(ctx, {
    url: '/tools/half-life-calculator/',
    title: 'Half-life and steady-state calculator | TherapyLog',
    description: `Half-life, time to steady state, accumulation ratio and peak-to-trough swing ` +
      `for ${eligible.length} PK-modelled compounds. Free, no account.`,
    trail: api.toolsTrail([{ name: 'Half-life calculator', url: '/tools/half-life-calculator/',
      absolute: api.SITE + '/tools/half-life-calculator/' }]),
    body,
    script: [
      W.prologue({ attribution }),
      emitSteadyState(),
      A.fnSource(app.src, 'pkCurve'),
      A.fnSource(app.src, 'pkParseDose'),
      `var HL_PK = ${JSON.stringify(pk)};`,
      HL_JS,
      `document.addEventListener('DOMContentLoaded', function () { hlCalc(); });`
    ].join('\n\n'),
    extraHead: '<script defer src="/vendor/chart.umd.min.js"></script>'
  });
}

function build(ctx, api) {
  return [
    insulinPage(ctx, api),
    trtPage(ctx, api),
    freeTPage(ctx, api),
    syringePage(ctx, api),
    halfLifeCalcPage(ctx, api)
  ];
}

module.exports = { build, emitSteadyState, INSULIN_JS, TRT_JS, FREET_JS, HL_JS, num, TRT_ESTERS };
