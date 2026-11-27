/*
 * Library -> Tools (3c): the reconstitution calculator, then the other tools.
 *
 * The calculator is arithmetic on the user's own three numbers and nothing
 * more. Its fields start empty, it never fills in or suggests a dose, and it
 * does not judge the dose it is given: it says how far to draw, and when that
 * is more than the chosen syringe holds.
 *
 * The other tools are rows. Each opens its own route; the ones behind a plan
 * carry their gate on the route (TL_ROUTES), so a tap without a plan opens the
 * upgrade screen with the tool's name, as every gate does.
 */

/* What is typed stays while the app is open (going to a tool and back keeps
   it), and is never saved. */
var tlReconState = { mg: '', ml: '', dose: '', cap: '100' };

/* U-100 syringes: 100 units to the mL. */
var TL_SYRINGES = [
  { value: '30', label: '0.3 mL' },
  { value: '50', label: '0.5 mL' },
  { value: '100', label: '1 mL' }
];

/* "2.5", "2,5" or ".5" -> a positive number; anything else is NaN. */
function tlReconNum(s) {
  var t = String(s === null || s === undefined ? '' : s).trim().replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  var n = parseFloat(t);
  return n > 0 && isFinite(n) ? n : NaN;
}

/* The design's maths, exactly:
     strength (mcg/mL) = mg x 1000 / mL
     volume (mL)       = dose / strength
     units             = volume x 100
     doses in the vial = floor(mg x 1000 / dose)
   null until all three numbers are there. `cap` is the syringe, in units. */
function tlReconMath(mg, ml, dose, cap) {
  if (!(mg > 0) || !(ml > 0) || !(dose > 0)) return null;
  var strength = mg * 1000 / ml;
  var volume = dose / strength;
  var units = volume * 100;
  /* Rounded first, so 0.7 x 1000 / 100 (7.000000000000001) is 7 doses and
     not, on the other side of the float, 6. */
  var doses = Math.floor(Math.round(mg * 1000 / dose * 1e6) / 1e6);
  var round = Math.round(units * 1e6) / 1e6;
  return { strength: strength, volume: volume, units: units, doses: doses, over: round > cap };
}

/* Up to `max` decimals, without trailing zeros, with thousands separators. */
function tlReconFmt(n, max) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: max });
}

/* Units to one decimal (a 0.3 mL syringe is marked in single units), two
   below one unit. Volume to three decimals, four below 0.01 mL. */
function tlReconUnits(u) { return tlReconFmt(u, u < 1 ? 2 : 1); }
function tlReconVolume(v) { return tlReconFmt(v, v < 0.01 ? 4 : 3); }

function tlReconField(id, label, unit, value) {
  return '<div class="ds-field tl-recon-field">' +
    '<label for="' + id + '">' + tlEsc(label) + '<span class="ds-sr"> (' + tlEsc(unit) + ')</span></label>' +
    '<div class="tl-recon-input">' +
    '<input class="ds-input" id="' + id + '" type="text" inputmode="decimal" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next" value="' + tlEsc(value) + '">' +
    '<span class="tl-recon-unit" aria-hidden="true">' + tlEsc(unit) + '</span></div></div>';
}

/* The result, or what is missing. */
function tlReconOutput(st) {
  var cap = parseInt(st.cap, 10) || 100;
  var r = tlReconMath(tlReconNum(st.mg), tlReconNum(st.ml), tlReconNum(st.dose), cap);
  if (!r) return '<p class="tl-recon-empty">Enter your vial, water and dose to see the draw.</p>';
  var units = tlReconUnits(r.units);
  var fill = Math.min(100, Math.max(0, r.units / cap * 100));
  var stat = function (label, value, unit) {
    return '<div class="tl-recon-stat"><dt>' + label + '</dt><dd>' + tlEsc(value) +
      (unit ? ' <span class="tl-recon-stat-unit">' + unit + '</span>' : '') + '</dd></div>';
  };
  return '<div class="tl-recon-big' + (r.over ? ' tl-recon-big-over' : '') + '">' + tlBig(units, 'units to draw') + '</div>' +
    '<div class="tl-recon-bar' + (r.over ? ' tl-recon-bar-over' : '') + '" role="img" aria-label="' +
      tlEsc(units + ' units on a ' + cap + ' unit syringe') + '">' +
      '<span class="tl-recon-fill" style="width:' + fill.toFixed(2) + '%"></span></div>' +
    '<div class="tl-recon-scale" aria-hidden="true"><span>0</span><span>' + cap + ' units</span></div>' +
    (r.over ? '<p class="tl-recon-over">More than this syringe holds. Pick a larger one or add less water.</p>' : '') +
    '<dl class="tl-recon-stats">' +
      stat('Strength', tlReconFmt(r.strength, r.strength < 100 ? 2 : 0), 'mcg/mL') +
      stat('Volume', tlReconVolume(r.volume), 'mL') +
      stat('Doses in vial', String(r.doses), '') +
    '</dl>';
}

/* ---- the other tools ---------------------------------------------------- */

/* gate: the TLTier feature behind the tool's route, shown as a Pro tag to
   someone without a plan. Templates have no gate of their own: the peptide
   ones are free and the rest are locked one by one (tlTemplateLocked). */
function tlToolsList() {
  var nIx = (typeof INTERACTIONS !== 'undefined' && INTERACTIONS.length) || 0;
  var nTpl = (typeof TEMPLATES !== 'undefined' && TEMPLATES.length) || 0;
  return [
    { route: 'library/interactions', icon: 'intersect', title: 'Interaction checker',
      sub: nIx ? nIx + ' rules, checked against your stack' : 'Checked against your stack' },
    { route: 'library/templates', icon: 'clipboard-text', title: 'Protocol templates',
      sub: (nTpl ? nTpl + ' starting points for a stack' : 'Starting points for a stack'), some: true },
    { route: 'library/steady', icon: 'wave-sine', title: 'Steady state', sub: 'When levels settle on a fixed schedule', gate: 'pk_advanced' },
    { route: 'library/cost', icon: 'coins', title: 'Cost and supply', sub: 'Monthly spend and days of supply', gate: 'cost_tracking' },
    { route: 'library/pct', icon: 'calendar-check', title: 'PCT builder', sub: 'Lay out a post-cycle timeline', gate: 'pct_builder' },
    { route: 'library/bodycomp', icon: 'ruler', title: 'Body composition', sub: 'Body fat, lean mass, FFMI' },
    { route: 'library/symptoms', icon: 'pulse', title: 'Symptom patterns', sub: 'Symptoms against dose changes', gate: 'correlations' },
    { route: 'library/syringe', icon: 'syringe', title: 'Combined syringe', sub: 'Several compounds in one draw' },
    { route: 'library/stack', icon: 'stack', title: 'Stack builder', sub: 'Compounds grouped by goal' },
    { route: 'library/sidefx', icon: 'book-open-text', title: 'Side effects guide', sub: 'What the research reports, by side effect' }
  ];
}

function tlToolsRows() {
  var paid = !!(window.TLTier && TLTier.isStd && TLTier.isStd());
  var rows = tlToolsList().map(function (t) {
    var tag = '';
    if (!paid && t.gate) tag = '<span class="ds-tag ds-tag-accent">Pro</span>';
    else if (!paid && t.some) tag = '<span class="ds-tag ds-tag-outline">Some Pro</span>';
    return tlRow({ as: 'button', hex: { icon: t.icon }, title: t.title, sub: t.sub, trail: tag, caret: true,
      attrs: 'data-tl-go="' + t.route + '" data-tool="' + t.route.split('/')[1] + '"' });
  });
  return '<div class="ds-list tl-tools-list">' + rows.join('<div class="ds-hr"></div>') + '</div>';
}

/* ---- the screen ---------------------------------------------------------- */

function tlToolsScreen(el) {
  var st = tlReconState;
  el.innerHTML = '<div class="ds-screen tl-tools ds-under-tabbar">' +
    '<section class="ds-hero tl-recon" aria-labelledby="tl-recon-h">' +
      '<div class="tl-recon-head"><h2 class="tl-recon-title" id="tl-recon-h">Reconstitution</h2>' +
      '<button type="button" class="tl-recon-clear" id="tl-recon-clear">Clear</button></div>' +
      '<div class="tl-recon-fields">' +
        tlReconField('tl-recon-mg', 'In the vial', 'mg', st.mg) +
        tlReconField('tl-recon-ml', 'Water added', 'mL', st.ml) +
        tlReconField('tl-recon-dose', 'My dose', 'mcg', st.dose) +
      '</div>' +
      '<div class="tl-recon-syr"><span class="tl-recon-syr-label">U-100 syringe</span>' +
        tlChips('Syringe size', TL_SYRINGES, st.cap, true) + '</div>' +
      '<div id="tl-recon-out" class="tl-recon-out" aria-live="polite">' + tlReconOutput(st) + '</div>' +
      '<p class="tl-recon-foot">Arithmetic on your numbers. It does not suggest a dose.</p>' +
    '</section>' +
    '<h2 class="ds-label tl-tools-h">More tools</h2>' +
    tlToolsRows() +
    tlFootnote('Reference and arithmetic only, not medical advice. Your physician decides what you take and how much.') +
    '</div>';
  var root = el.firstChild;
  var out = root.querySelector('#tl-recon-out');
  var redraw = function () { out.innerHTML = tlReconOutput(tlReconState); };
  var keys = { 'tl-recon-mg': 'mg', 'tl-recon-ml': 'ml', 'tl-recon-dose': 'dose' };
  root.addEventListener('input', function (e) {
    var k = keys[e.target.id];
    if (!k) return;
    tlReconState[k] = e.target.value;
    redraw();
  });
  /* Enter moves to the next field, and off the last one closes the keyboard. */
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !keys[e.target.id]) return;
    e.preventDefault();
    var order = ['tl-recon-mg', 'tl-recon-ml', 'tl-recon-dose'];
    var next = order[order.indexOf(e.target.id) + 1];
    if (next) root.querySelector('#' + next).focus(); else e.target.blur();
  });
  root.addEventListener('ds-change', function (e) {
    if (!e.detail || !e.target.closest('.tl-recon-syr')) return;
    tlReconState.cap = e.detail.value;
    redraw();
  });
  root.querySelector('#tl-recon-clear').addEventListener('click', function () {
    tlReconState.mg = tlReconState.ml = tlReconState.dose = '';
    Object.keys(keys).forEach(function (id) { root.querySelector('#' + id).value = ''; });
    redraw();
    root.querySelector('#tl-recon-mg').focus();
  });
}
