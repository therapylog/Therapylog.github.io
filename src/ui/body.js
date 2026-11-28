/*
 * Health -> Body (6c): weight over 30 days, body composition, a new weight,
 * and the latest measurements.
 *
 * Weight is stored in pounds and lengths in inches whatever the display
 * (docs/DATA-MODEL.md); a metric profile (settings.units) converts at the
 * edge, both ways. Lean mass and FFMI are estimates built on the body-fat
 * figure and the profile's height, and the screen says so.
 *
 * The daily check-in (energy, sleep, mood and the rest), the measurement
 * form and the body-composition tool are the old forms, one row away.
 */

function tlBodyMetric(d) { return tlSetting(d, 'units', 'imperial') === 'metric'; }

/* Pounds or inches as shown, to one decimal. */
function tlBodyW(lb, metric) { return Math.round((metric ? tlLbToKg(lb) : lb) * 10) / 10; }
function tlBodyL(inches, metric) { return Math.round((metric ? tlInToCm(inches) : inches) * 10) / 10; }
function tlBodyFix(n) { return n.toFixed(1); }
/* A change with its sign: "−3.6", "+0.5", "0.0". */
function tlBodySigned(n) { return (n < 0 ? '−' : n > 0 ? '+' : '') + Math.abs(n).toFixed(1); }

/* The 30-day chart: an area and a line through the weights, the last as a
   ring, a dashed line where a dose changed. SVG stretched to the card, the
   strokes kept at their width; the ring is HTML so it stays round. */
function tlBodyChart(d, series, fromMs, nowMs, metric) {
  if (series.length < 2) return '';
  var W = 340, H = 124, span = nowMs - fromMs;
  var ws = series.map(function (p) { return p.weight; });
  var lo = Math.min.apply(null, ws), hi = Math.max.apply(null, ws);
  var pad = Math.max(1, (hi - lo) * 0.25);
  lo -= pad; hi += pad;
  var X = function (ts) { return (new Date(ts).getTime() - fromMs) / span * W; };
  var Y = function (w) { return H - (w - lo) / (hi - lo) * H; };
  var pts = series.map(function (p) { return [X(p.ts), Y(p.weight)]; });
  var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
  var area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + H + ' L' + pts[0][0].toFixed(1) + ' ' + H + ' Z';
  var last = pts[pts.length - 1];
  var changes = tlDoseChangesIn(d, fromMs, nowMs);
  var unit = metric ? 'kg' : 'lb';
  var label = 'Weight, last 30 days: from ' + tlBodyFix(tlBodyW(series[0].weight, metric)) + ' to ' + tlBodyFix(tlBodyW(series[series.length - 1].weight, metric)) + ' ' + unit;
  return '<div class="tl-body-chart" role="img" aria-label="' + tlEsc(label) + '">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" focusable="false" aria-hidden="true">' +
        '<path class="tl-body-area" d="' + area + '"/><path class="tl-body-line" d="' + line + '"/></svg>' +
      changes.map(function (c) {
        return '<span class="tl-body-change" style="left:' + (X(c.ts) / W * 100).toFixed(2) + '%"></span>';
      }).join('') +
      '<span class="tl-body-ring" style="left:' + (last[0] / W * 100).toFixed(2) + '%;top:' + (last[1] / H * 100).toFixed(2) + '%"></span>' +
    '</div>' +
    '<div class="tl-bp-axis tl-body-axis" aria-hidden="true"><span>' + tlShortDate(fromMs) + '</span><span>Today</span></div>' +
    changes.map(function (c) {
      return '<p class="tl-bp-legend"><span class="tl-bp-legend-key" aria-hidden="true"></span>' + tlEsc(tlDoseChangeCaption(c)) + '</p>';
    }).join('');
}

function tlBodyStat(label, value, unit, none) {
  return '<div class="tl-body-stat"><span class="tl-body-stat-l">' + label + '</span>' +
    (value !== null ? '<span class="tl-body-stat-v">' + tlEsc(value) + (unit ? ' <span class="tl-body-stat-u">' + unit + '</span>' : '') + '</span>'
      : '<span class="tl-body-stat-none">' + none + '</span>') + '</div>';
}

/* The weight typed, as pounds, when it is one a person can have (60 to 700
   lb, or the same in kg). Null otherwise. */
function tlBodyTyped(text, metric) {
  var s = String(text || '').trim().replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  var v = parseFloat(s), lb = metric ? Math.round(tlKgToLb(v) * 10) / 10 : v;
  return tlWeightValid(lb) ? lb : null;
}

function tlBodyScreen(el) {
  var d = gd(), now = Date.now(), metric = tlBodyMetric(d);
  var wu = metric ? 'kg' : 'lb', lu = metric ? 'cm' : 'in';
  var from = now - 30 * 864e5;
  var series = tlWeightSeries(d.entries || [], 30, now);
  var all = tlWeightSeries(d.entries || [], 0, now), latest = all[all.length - 1] || null;
  var ch = tlWeightChange(d.entries || [], 30, now);
  var head;
  if (latest) {
    var change = ch.change !== null ? tlBodyW(ch.change, metric) : null;
    head = '<div class="tl-body-head"><span class="tl-body-big">' + tlBig(tlBodyFix(tlBodyW(latest.weight, metric)), wu) + '</span>' +
      (change !== null ? '<span class="tl-body-delta" aria-label="' + tlEsc((change < 0 ? 'down ' : change > 0 ? 'up ' : 'no change, ') + Math.abs(change).toFixed(1) + ' ' + wu + ' in 30 days') + '">' +
        tlBodySigned(change) + ' ' + wu + '</span>' : '') + '</div>' +
      '<p class="tl-bp-meta">' + tlEsc(tlWhenText(latest.ts, now)) + (series.length > 1 ? ' · 30 days' : '') + '</p>' +
      tlBodyChart(d, series, from, now, metric);
  } else {
    head = '<p class="tl-bp-none">No weight logged yet. Log one below.</p>';
  }
  var fat = tlLatestBodyFat(d);
  var height = tlParseHeight((d.profile || {}).height);
  var lean = latest && fat ? tlLeanMass(latest.weight, fat.bf) : null;
  var ffmi = latest && fat && height ? tlFFMI(latest.weight, fat.bf, height) : null;
  var waist = tlLatestMeasure(d.entries, 'waist');
  var stats = '<div class="tl-body-stats">' +
    tlBodyStat('Body fat', fat ? tlBodyFix(fat.bf) : null, '%', 'Not logged') +
    tlBodyStat('Lean mass', lean !== null ? tlBodyFix(tlBodyW(lean, metric)) : null, wu, latest ? 'Needs body fat' : 'Needs a weight') +
    tlBodyStat('FFMI', ffmi !== null ? tlBodyFix(ffmi) : null, '', !fat || !latest ? 'Needs body fat' : 'Needs your height') +
    tlBodyStat('Waist', waist ? tlBodyFix(tlBodyL(waist.value, metric)) : null, lu, 'Not measured') +
    '</div>';
  var m = tlLatestMeasurements(d.entries);
  var measures = '<div class="tl-body-mhead"><h2 class="ds-label">Measurements' + (m ? ' · ' + tlEsc(tlShortDate(new Date(m.ts).getTime())) : '') + '</h2>' +
      '<button type="button" class="ds-btn ds-btn-ghost tl-body-measure" data-tl-go="health/measure">' + tlIcon('ruler') + '<span>Measure</span></button></div>' +
    (m ? '<div class="tl-body-mlist">' + m.rows.map(function (r) {
      return '<div class="tl-body-mrow"><span class="tl-body-mname">' + tlEsc(r.label) + '</span>' +
        '<span class="tl-body-mval">' + tlBodyFix(tlBodyL(r.value, metric)) + ' ' + lu + '</span>' +
        '<span class="tl-body-mchg">' + (r.change !== null ? tlBodySigned(tlBodyL(r.change, metric)) : '') + '</span></div>';
    }).join('') + '</div>' : '<p class="tl-body-mnone">No measurements yet.</p>');
  el.innerHTML = '<div class="ds-screen tl-body ds-under-tabbar">' +
    '<section class="ds-hero tl-bp-hero" aria-label="Weight">' + head + '</section>' +
    stats +
    '<h2 class="ds-label tl-bp-h"><label for="tl-body-w">New weight</label></h2>' +
    '<form class="tl-body-form" novalidate><div class="tl-recon-input tl-body-input">' +
      '<input class="ds-input" id="tl-body-w" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-describedby="tl-body-wu">' +
      '<span class="tl-recon-unit" id="tl-body-wu">' + wu + '</span></div>' +
      '<button type="submit" class="ds-btn ds-btn-primary" id="tl-body-save" disabled>Log weight</button></form>' +
    measures +
    tlFootnote('Lean mass and FFMI are estimates from your weight, body fat and height, not measurements. Review changes with your physician.') +
    '<div class="ds-list tl-bp-more">' +
      tlRow({ as: 'button', icon: 'sun-horizon', title: 'Daily check-in', sub: 'Weight with energy, sleep, mood and more', caret: true, attrs: 'data-tl-go="log"' }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'scales', title: 'Body composition', sub: 'Log body fat; lean and fat mass', caret: true, attrs: 'data-tl-go="library/bodycomp"' }) +
    '</div>' +
    '</div>';
  var root = el.firstChild, input = root.querySelector('#tl-body-w'), save = root.querySelector('#tl-body-save');
  input.addEventListener('input', function () { save.disabled = tlBodyTyped(input.value, metric) === null; });
  root.querySelector('.tl-body-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var lb = tlBodyTyped(input.value, metric);
    if (lb === null) return;
    var rec = gd();
    rec.entries.unshift({ type: 'weight', ts: new Date().toISOString(), weight: lb, energy: null, sleep: null, hrv: null,
      steps: null, stress: null, alcohol: null, mood: null, notes: '' });
    sd(rec);
    tlBodyScreen(el);
    if (typeof tlToast === 'function') tlToast('Weight logged: ' + tlBodyFix(tlBodyW(lb, metric)) + ' ' + wu);
  });
}

/* After the old measurement form saves (from Body's "Measure"), back to Body
   to see them. Wrapped once by the shell at start-up. */
function tlWrapSaveBody() {
  var orig = window.saveBody;
  if (typeof orig !== 'function' || orig.tlWrapped) return;
  var wrapped = function () {
    var before = (gd().entries || []).length;
    var out = orig.apply(this, arguments);
    if ((gd().entries || []).length > before && tlRoute === 'health/measure') tlGo('health/body');
    return out;
  };
  wrapped.tlWrapped = true;
  window.saveBody = wrapped;
}
