/* Health arithmetic: blood pressure, weight and body composition.
 *
 * Arithmetic on the user's own readings, and categories from published
 * ranges. Nothing here diagnoses, and the screens that show these numbers say
 * so beside them.
 */

var TL_DAY_MS_HEALTH = 864e5;
var TL_LB_PER_KG = 2.2046226218;
var TL_CM_PER_IN = 2.54;

/* ---- blood pressure ------------------------------------------------------ */

/* The ACC/AHA category for a reading. The boundaries are getBPStage()'s, the
   function the app has always stored a stage with, and a test holds the two
   together. `tone` is which of the design's three colours the tag takes.
   A crisis needs only one number over its line. */
function tlBpStage(sys, dia) {
  if (!(sys > 0) || !(dia > 0)) return null;
  if (sys > 180 || dia > 120) return { key: 'crisis', label: 'Crisis range', tone: 'danger' };
  if (sys >= 140 || dia >= 90) return { key: 'stage2', label: 'Stage 2 range', tone: 'danger' };
  if (sys >= 130 || dia >= 80) return { key: 'stage1', label: 'Stage 1 range', tone: 'warn' };
  if (sys >= 120) return { key: 'elevated', label: 'Elevated', tone: 'warn' };
  return { key: 'normal', label: 'Normal', tone: 'accent' };
}

/* Is a typed reading one a person can have? Whole numbers; systolic 60 to 250,
   diastolic 30 to 160, systolic above diastolic. Pulse is optional, and
   checked only when given. Returns the parsed numbers and, when not ok, which
   part is wrong. */
function tlBpValidate(sysText, diaText, pulseText) {
  var int = function (v) {
    var s = String(v === null || v === undefined ? '' : v).trim();
    return /^\d+$/.test(s) ? parseInt(s, 10) : (s === '' ? null : NaN);
  };
  var sys = int(sysText), dia = int(diaText), pulse = int(pulseText);
  var out = { ok: false, sys: sys, dia: dia, pulse: pulse === null ? null : pulse, error: null };
  if (sys === null || dia === null) out.error = 'incomplete';
  else if (!(sys >= 60 && sys <= 250)) out.error = 'systolic';
  else if (!(dia >= 30 && dia <= 160)) out.error = 'diastolic';
  else if (!(sys > dia)) out.error = 'order';
  else if (pulse !== null && !(pulse >= 20 && pulse <= 250)) out.error = 'pulse';
  else out.ok = true;
  return out;
}

/* Blood-pressure readings, oldest first. */
function tlBpReadings(entries) {
  return (entries || []).filter(function (e) {
    return e && e.type === 'bloodpressure' && e.sys > 0 && e.dia > 0;
  }).slice().sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
}

/* Mean systolic and diastolic over the last `days` days, to the nearest whole
   number, with how many readings went in. Null when there are none. */
function tlBpAverage(entries, days, nowMs) {
  var from = nowMs - days * TL_DAY_MS_HEALTH, sys = 0, dia = 0, n = 0;
  tlBpReadings(entries).forEach(function (e) {
    var t = new Date(e.ts).getTime();
    if (t > from && t <= nowMs) { sys += e.sys; dia += e.dia; n++; }
  });
  return n ? { sys: Math.round(sys / n), dia: Math.round(dia / n), n: n } : null;
}

/* One bar per local day for the chart, oldest first, `days` of them ending
   today. A day with several readings shows their mean; a day with none is
   null, so the chart leaves a gap rather than joining across it. */
function tlBpDaily(entries, days, nowMs) {
  var by = {};
  tlBpReadings(entries).forEach(function (e) {
    var k = tlDayKey(e.ts);
    (by[k] = by[k] || []).push(e);
  });
  var today = new Date(nowMs), out = [];
  for (var i = days - 1; i >= 0; i--) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    var k = tlDayKey(d), list = by[k];
    if (!list) { out.push({ day: k, sys: null, dia: null, n: 0 }); continue; }
    var s = 0, di = 0;
    list.forEach(function (e) { s += e.sys; di += e.dia; });
    out.push({ day: k, sys: Math.round(s / list.length), dia: Math.round(di / list.length), n: list.length });
  }
  return out;
}

/* ---- weight and body ----------------------------------------------------- */

/* Weight is stored in pounds and lengths in inches (docs/DATA-MODEL.md). A
   metric display converts at the edge and stores the same units as before. */
function tlLbToKg(lb) { return lb / TL_LB_PER_KG; }
function tlKgToLb(kg) { return kg * TL_LB_PER_KG; }
function tlInToCm(inches) { return inches * TL_CM_PER_IN; }
function tlCmToIn(cm) { return cm / TL_CM_PER_IN; }

/* A weight a person can have, in pounds: 60 to 700. */
function tlWeightValid(lb) { return typeof lb === 'number' && lb >= 60 && lb <= 700; }

/* Weight entries that have a weight, oldest first, within `days` of now.
   Apple Health rows carry weight: null and are left out. */
function tlWeightSeries(entries, days, nowMs) {
  var from = days ? nowMs - days * TL_DAY_MS_HEALTH : -Infinity;
  return (entries || []).filter(function (e) {
    if (!e || e.type !== 'weight' || !(e.weight > 0)) return false;
    var t = new Date(e.ts).getTime();
    return t >= from && t <= nowMs;
  }).map(function (e) { return { ts: e.ts, weight: e.weight }; })
    .sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
}

/* The latest weight and how far it has moved over `days`: latest minus the
   first reading in the window, to one decimal. `change` is null with fewer
   than two readings, since one reading has not moved. */
function tlWeightChange(entries, days, nowMs) {
  var s = tlWeightSeries(entries, days, nowMs);
  if (!s.length) return { latest: null, change: null, n: 0 };
  var latest = s[s.length - 1].weight;
  return { latest: latest, change: s.length > 1 ? Math.round((latest - s[0].weight) * 10) / 10 : null, n: s.length };
}

/* Lean mass = weight x (1 - body fat). An estimate, and labelled as one. */
function tlLeanMass(weight, bfPct) {
  if (!(weight > 0) || !(bfPct >= 0) || !(bfPct < 100)) return null;
  return Math.round(weight * (1 - bfPct / 100) * 10) / 10;
}

/* A typed height as inches: 5'11", 5 ft 11, 71 in, 180 cm, 1.80 m. A bare
   number is taken as centimetres from 100 up and inches below that. Null when
   it does not read as a height.

   Curly quotes and prime marks count as the straight ones. An iPhone's Smart
   Punctuation, on by default, turns 5'11" into 5’11” as it is typed, and the
   profile stores the text as typed; some people type the primes, 5′11″. */
function tlParseHeight(text) {
  var s = String(text === null || text === undefined ? '' : text).trim().toLowerCase()
    .replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"');
  if (!s) return null;
  var inches = null, m;
  if ((m = s.match(/^(\d)\s*(?:'|ft|feet|foot)\s*(\d{1,2}(?:\.\d+)?)?\s*(?:"|''|in|inches)?$/))) inches = +m[1] * 12 + (m[2] ? +m[2] : 0);
  else if ((m = s.match(/^(\d+(?:\.\d+)?)\s*cm$/))) inches = tlCmToIn(+m[1]);
  else if ((m = s.match(/^(\d(?:\.\d+)?)\s*m$/))) inches = tlCmToIn(+m[1] * 100);
  else if ((m = s.match(/^(\d+(?:\.\d+)?)\s*(?:in|inches|")$/))) inches = +m[1];
  else if ((m = s.match(/^(\d+(?:\.\d+)?)$/))) inches = +m[1] >= 100 ? tlCmToIn(+m[1]) : +m[1];
  return inches !== null && inches >= 36 && inches <= 96 ? Math.round(inches * 10) / 10 : null;
}

/* Fat-free mass index: lean mass in kg over height in metres squared, to one
   decimal. An estimate built on an estimate. */
function tlFFMI(weightLb, bfPct, heightIn) {
  var lean = tlLeanMass(weightLb, bfPct);
  if (lean === null || !(heightIn > 0)) return null;
  var metres = tlInToCm(heightIn) / 100;
  return Math.round(tlLbToKg(lean) / (metres * metres) * 10) / 10;
}

/* The measurements the old form takes, in the order Body lists them. Inches. */
var TL_MEASURES = [
  { key: 'waist', label: 'Waist' }, { key: 'chest', label: 'Chest' }, { key: 'hips', label: 'Hips' },
  { key: 'neck', label: 'Neck' }, { key: 'larm', label: 'Left arm' }, { key: 'rarm', label: 'Right arm' },
  { key: 'lthigh', label: 'Left thigh' }, { key: 'rthigh', label: 'Right thigh' }
];

function tlHealthNum(v) { return typeof v === 'number' && isFinite(v) && v > 0; }

/* The newest body-fat figure and when, from wherever it was logged: the
   body-composition tool (bodyComp) or a measurement entry's `bf`. The record
   keeps both and nothing reconciles them (docs/DATA-MODEL.md 3.9), so the
   newer one wins. Null when there is none. */
function tlLatestBodyFat(d) {
  var best = null;
  var take = function (ts, bf) {
    var t = new Date(ts).getTime();
    if (!isFinite(t) || !(bf > 0 && bf < 100)) return;
    if (!best || t > best.t) best = { t: t, ts: ts, bf: bf };
  };
  ((d && d.bodyComp) || []).forEach(function (b) { if (b) take(b.ts, b.bf); });
  ((d && d.entries) || []).forEach(function (e) { if (e && e.type === 'body' && e.measurements) take(e.ts, e.measurements.bf); });
  return best ? { ts: best.ts, bf: best.bf } : null;
}

/* Measurement entries with at least one measurement, oldest first. */
function tlMeasureEntries(entries) {
  return (entries || []).filter(function (e) {
    return e && e.type === 'body' && e.measurements && isFinite(new Date(e.ts).getTime()) &&
      TL_MEASURES.some(function (m) { return tlHealthNum(e.measurements[m.key]); });
  }).slice().sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
}

/* The newest value of one measurement, from whichever entry last had it. */
function tlLatestMeasure(entries, key) {
  var list = tlMeasureEntries(entries);
  for (var i = list.length - 1; i >= 0; i--) if (tlHealthNum(list[i].measurements[key])) return { ts: list[i].ts, value: list[i].measurements[key] };
  return null;
}

/* The newest measurement entry, each measurement in it with its change since
   the last entry before it that had that measurement (null when none did).
   { ts, rows: [{ key, label, value, change }] } or null. */
function tlLatestMeasurements(entries) {
  var list = tlMeasureEntries(entries);
  if (!list.length) return null;
  var last = list[list.length - 1];
  var rows = TL_MEASURES.filter(function (m) { return tlHealthNum(last.measurements[m.key]); }).map(function (m) {
    var v = last.measurements[m.key], prev = null;
    for (var i = list.length - 2; i >= 0; i--) if (tlHealthNum(list[i].measurements[m.key])) { prev = list[i].measurements[m.key]; break; }
    return { key: m.key, label: m.label, value: v, change: prev === null ? null : Math.round((v - prev) * 10) / 10 };
  });
  return { ts: last.ts, rows: rows };
}
