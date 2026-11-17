/* Estimated levels, for Home's Levels and In your system views (2a).
 *
 * The same model the old Levels chart uses (renderPKLevels): one compartment
 * with first-order absorption, every logged dose of the last 90 days summed,
 * and each compound scaled to its own peak over a window from 28 days back to
 * 7 days ahead. So "100% of peak" means as high as this compound has been in
 * that window on the user's own doses, not any reference level. It is an
 * estimate from the log, never a measurement, and every screen that shows it
 * says so.
 *
 * The app's own functions do the pharmacology and are passed in, so this
 * file stays testable and cannot drift from the old chart:
 *
 *   pk = { parse(doseText) -> { v, unit } | null,     pkParseDose
 *          params(name)    -> { hl, tmax } | {},       pkParamsFor
 *          curve(hl, tmax) -> function(hours)          pkCurve }
 */

var TL_LV_HOUR = 36e5;
var TL_LV_BACK_DAYS = 28, TL_LV_AHEAD_DAYS = 7, TL_LV_LOOKBACK_DAYS = 90;

/* One series per compound and unit with a known half-life, most recently
   dosed first:
     { name, unit, label, hl, tmax, pct, last, from, to, now, points: [[t, pct]] }
   Doses in mL are left out (a volume says nothing about the amount); mg and
   IU are never added together. */
function tlLevelSeries(entries, nowMs, pk) {
  var H = TL_LV_HOUR;
  var lookback = nowMs - TL_LV_LOOKBACK_DAYS * 24 * H;
  var from = nowMs - TL_LV_BACK_DAYS * 24 * H, to = nowMs + TL_LV_AHEAD_DAYS * 24 * H;
  var groups = {}, order = [];
  (entries || []).forEach(function (e) {
    if (!e || e.type !== 'medication' || !e.medication) return;
    var t = new Date(e.ts).getTime();
    if (!(t > lookback && t <= nowMs)) return;
    var p = pk.parse(e.dose);
    if (!p || p.unit === 'ml') return;
    var id = e.medication + '\u0000' + p.unit;
    if (!groups[id]) { groups[id] = { name: e.medication, unit: p.unit, doses: [] }; order.push(id); }
    groups[id].doses.push({ t: t, v: p.v });
  });

  var units = {};
  order.forEach(function (id) { units[groups[id].name] = (units[groups[id].name] || 0) + 1; });

  var out = [];
  order.forEach(function (id) {
    var g = groups[id], params = pk.params(g.name) || {};
    if (!params.hl) return;
    var curve = pk.curve(params.hl, params.tmax);
    var level = function (t) {
      var s = 0;
      g.doses.forEach(function (d) { s += d.v * curve((t - d.t) / H); });
      return s;
    };
    /* A two-hour grid, plus each dose's peak and decay landmarks, which a
       grid alone would miss for a short half-life. */
    var times = [], step = 2 * H, tm = (params.tmax || 1) * H;
    for (var t = Math.floor(from / step) * step; t <= to; t += step) if (t >= from) times.push(t);
    g.doses.forEach(function (d) {
      [d.t, d.t + tm, d.t + tm + 0.5 * params.hl * H, d.t + params.hl * H, d.t + 2 * params.hl * H].forEach(function (x) {
        if (x > from && x <= to) times.push(x);
      });
    });
    times.push(nowMs);
    times.sort(function (a, b) { return a - b; });
    var raw = times.map(level);
    var max = Math.max.apply(null, raw.concat([1e-9]));
    var last = Math.max.apply(null, g.doses.map(function (d) { return d.t; }));
    out.push({
      name: g.name, unit: g.unit, label: units[g.name] > 1 ? g.name + ' (' + g.unit + ')' : g.name,
      hl: params.hl, tmax: params.tmax, pct: Math.round(level(nowMs) / max * 100), last: last,
      from: from, to: to, now: nowMs,
      points: times.map(function (x, i) { return [x, raw[i] / max * 100]; })
    });
  });
  return out.sort(function (a, b) { return b.last - a.last; });
}

/* "Half-life 6 d": days from two days up, else hours, else minutes. */
function tlHalfLifeText(hl) {
  if (!(hl > 0)) return '';
  if (hl >= 48) return (Math.round(hl / 24 * 10) / 10) + ' d';
  if (hl >= 1) return (Math.round(hl * 10) / 10) + ' h';
  return Math.round(hl * 60) + ' min';
}

/* The Levels chart's paths, in a w x h box: the line and its area up to now,
   the projection after it, and where now is. The curve runs from y = 6 at
   its peak to y = h - 18 at zero, leaving room for the date labels. */
function tlLevelChart(series, w, h) {
  var top = 6, base = h - 18;
  var x = function (t) { return (t - series.from) / (series.to - series.from) * w; };
  var y = function (p) { return base - (base - top) * Math.max(0, Math.min(100, p)) / 100; };
  var f = function (n) { return Math.round(n * 10) / 10; };
  var past = series.points.filter(function (p) { return p[0] <= series.now; });
  var future = series.points.filter(function (p) { return p[0] >= series.now; });
  var line = past.map(function (p, i) { return (i ? 'L' : 'M') + f(x(p[0])) + ' ' + f(y(p[1])); }).join('');
  var area = past.length ? line + 'L' + f(x(past[past.length - 1][0])) + ' ' + base + 'L' + f(x(past[0][0])) + ' ' + base + 'Z' : '';
  var proj = future.map(function (p, i) { return (i ? 'L' : 'M') + f(x(p[0])) + ' ' + f(y(p[1])); }).join('');
  return { line: line, area: area, proj: proj, nowX: f(x(series.now)), nowY: f(y(series.pct)), base: base, top: top };
}
