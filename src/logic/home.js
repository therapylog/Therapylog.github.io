/* Home (Today, 2a) and Customize Home (2b): what shows, in what order, and
 * the latest lab panel it summarises.
 *
 * The layout is stored in settings.home, so a restored backup brings it back:
 *
 *   { hero: [{ key, on }], sections: [{ key, on }] }      in display order
 *
 * A view or section this build does not know is dropped; one it knows that is
 * missing from the stored list is added at the end, switched on, so a new
 * view reaches people who customised Home before it existed.
 */

var TL_HOME_HERO = [
  { key: 'levels', label: 'Levels', sub: 'Estimated curve, one compound at a time' },
  { key: 'system', label: 'In your system', sub: 'Every active compound at a glance' },
  { key: 'supply', label: 'Supply', sub: 'Next vial and doses left' },
  { key: 'labs', label: 'Labs', sub: 'Latest panel and flags' }
];
var TL_HOME_SECTIONS = [
  { key: 'doses', label: 'Today’s doses', sub: 'Checklist by round' },
  { key: 'inventory', label: 'Inventory', sub: 'Doses left per vial, spare vials' },
  { key: 'flags', label: 'Lab flags', sub: 'Markers outside reference range' }
];

function tlHomeList(defs, stored) {
  var known = {}, out = [], seen = {};
  defs.forEach(function (d) { known[d.key] = d; });
  (Array.isArray(stored) ? stored : []).forEach(function (s) {
    if (!s || !known[s.key] || seen[s.key]) return;
    seen[s.key] = true;
    out.push({ key: s.key, label: known[s.key].label, sub: known[s.key].sub, on: s.on !== false });
  });
  defs.forEach(function (d) {
    if (!seen[d.key]) out.push({ key: d.key, label: d.label, sub: d.sub, on: true });
  });
  return out;
}

/* The layout for a record, filled in. */
function tlHomeLayout(d) {
  var home = (typeof tlSetting === 'function' ? tlSetting(d, 'home', null) : null) || {};
  return { hero: tlHomeList(TL_HOME_HERO, home.hero), sections: tlHomeList(TL_HOME_SECTIONS, home.sections) };
}

/* Store a layout: keys and switches only, in order. */
function tlSetHomeLayout(d, layout) {
  var strip = function (list) { return list.map(function (x) { return { key: x.key, on: !!x.on }; }); };
  tlSetSetting(d, 'home', { hero: strip(layout.hero), sections: strip(layout.sections) });
  return d;
}

/* Move item `key` of a list one place up (-1) or down (+1). */
function tlHomeMove(list, key, by) {
  var i = -1;
  list.forEach(function (x, n) { if (x.key === key) i = n; });
  var j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return list;
  var item = list.splice(i, 1)[0];
  list.splice(j, 0, item);
  return list;
}

/* ---- the latest lab panel ------------------------------------------------- */

/* Short names for the markers Home shows, where the form's label is long. */
var TL_MARKER_SHORT = {
  tott: 'Total T', freet: 'Free T', bioavailt: 'Bioavailable T', e2: 'Estradiol', shbg: 'SHBG',
  lh: 'LH', fsh: 'FSH', psa: 'PSA', igf1: 'IGF-1', dheas: 'DHEA-S', tsh: 'TSH', ft4: 'Free T4',
  ft3: 'Free T3', hct: 'Hematocrit', hgb: 'Hemoglobin', rbc: 'RBC', wbc: 'WBC', plt: 'Platelets',
  ldl: 'LDL', hdl: 'HDL', trig: 'Triglycerides', chol: 'Cholesterol', apob: 'ApoB',
  glucose: 'Glucose', hba1c: 'HbA1c', alt: 'ALT', ast: 'AST', crp: 'hs-CRP', vitd: 'Vitamin D',
  creat: 'Creatinine', egfr: 'eGFR', prolactin: 'Prolactin', dht: 'DHT', ferritin: 'Ferritin'
};

/* The names the bloodwork screen lists markers by, where the form's label
   reads badly as a row title ("SHBG Sex Hormone Binding"). */
var TL_MARKER_FULL = {
  tott: 'Total testosterone', freet: 'Free testosterone', bioavailt: 'Bioavailable testosterone',
  e2: 'Estradiol (E2)', shbg: 'SHBG', lh: 'LH', fsh: 'FSH', psa: 'PSA', igf1: 'IGF-1', dheas: 'DHEA-S',
  cortam: 'Cortisol (morning)', prolactin: 'Prolactin', tsh: 'TSH', ft4: 'Free T4', ft3: 'Free T3',
  hct: 'Hematocrit', hgb: 'Hemoglobin', rbc: 'Red blood cells', wbc: 'White blood cells', plt: 'Platelets',
  chol: 'Total cholesterol', ldl: 'LDL cholesterol', hdl: 'HDL cholesterol', trig: 'Triglycerides',
  apob: 'ApoB', glucose: 'Glucose', hba1c: 'HbA1c', alt: 'ALT', ast: 'AST', crp: 'hs-CRP',
  vitd: 'Vitamin D', b12: 'Vitamin B12', creat: 'Creatinine', egfr: 'eGFR', dht: 'DHT', ferritin: 'Ferritin'
};

function tlLabHasValue(e) {
  return !!(e && e.type === 'bloodwork' && e.labs && Object.keys(e.labs).some(function (k) {
    return typeof e.labs[k] === 'number' && isFinite(e.labs[k]);
  }));
}

/* When a panel was drawn: its lab date, or when it was logged. -Infinity for
   neither, so it sorts last rather than poisoning the sort with NaN. */
function tlLabWhen(e) {
  var t = e.labDate ? tlDay(e.labDate).getTime() : new Date(e.ts).getTime();
  return typeof t === 'number' && isFinite(t) ? t : -Infinity;
}

/* Every bloodwork entry with a value in it, newest first: by lab date, then,
   for two on the same date, the one logged later. */
function tlLabPanels(entries) {
  var list = (entries || []).filter(tlLabHasValue);
  return list.map(function (e, i) { return { e: e, t: tlLabWhen(e), ts: new Date(e.ts).getTime() || 0, i: i }; })
    .sort(function (a, b) {
      if (a.t !== b.t) return a.t === -Infinity ? 1 : b.t === -Infinity ? -1 : b.t - a.t;
      return (b.ts - a.ts) || (a.i - b.i);
    })
    .map(function (x) { return x.e; });
}

/* One bloodwork entry, read for display.
 *
 *   labs = { range(key, entry) -> { lo, hi } | null,     labRangeFor
 *            status(key, value, entry) -> 'good' | 'warn' | 'bad' | 'neutral',   labSt
 *            label(key), unit(key, labMeta[key]) }   tlMarkerLabel, tlLabUnit
 *
 * Returns { entry, date, rows, out }. A row is
 *   { key, name, full, value, unit, lo, hi, status, dir }
 * name is short (Home), full the bloodwork screen's. dir is 'below' or
 * 'above' when the value is outside the range. `out` is the rows outside it.
 * Out of range means what the bloodwork screen means by it (labSt's 'bad'),
 * so the two never disagree. */
function tlPanelOf(entry, labs) {
  var rows = Object.keys(entry.labs).filter(function (k) {
    return typeof entry.labs[k] === 'number' && isFinite(entry.labs[k]);
  }).map(function (k) {
    var v = entry.labs[k], r = labs.range(k, entry) || {};
    var lo = typeof r.lo === 'number' && isFinite(r.lo) ? r.lo : null;
    var hi = typeof r.hi === 'number' && isFinite(r.hi) ? r.hi : null;
    var status = labs.status(k, v, entry);
    var label = labs.label(k);
    return {
      key: k, name: TL_MARKER_SHORT[k] || label, full: TL_MARKER_FULL[k] || TL_MARKER_SHORT[k] || label, value: v,
      unit: labs.unit(k, (entry.labMeta && entry.labMeta[k]) || {}) || '',
      lo: lo, hi: hi, status: status,
      dir: status === 'bad' ? (lo !== null && v < lo ? 'below' : hi !== null && v > hi ? 'above' : null) : null
    };
  });
  return {
    entry: entry, date: entry.labDate || tlDayKey(entry.ts), rows: rows,
    out: rows.filter(function (r) { return r.status === 'bad'; })
  };
}

/* The newest bloodwork entry with a value in it, read for Home. Null when
   there is none. */
function tlLatestPanel(entries, labs) {
  var panels = tlLabPanels(entries);
  return panels.length ? tlPanelOf(panels[0], labs) : null;
}

/* A panel's count for the bloodwork summary: the markers that have a range,
   how many sit inside it, and the names below and above it. */
function tlPanelSummary(panel) {
  var ranged = panel ? panel.rows.filter(function (r) { return r.lo !== null || r.hi !== null; }) : [];
  var names = function (dir) { return panel.out.filter(function (r) { return r.dir === dir; }).map(function (r) { return r.name; }); };
  return {
    ranged: ranged,
    inRange: ranged.filter(function (r) { return r.status !== 'bad'; }).length,
    below: panel ? names('below') : [],
    above: panel ? names('above') : []
  };
}

/* The bloodwork screen's range bar (3b): the reference band from 20% to 80%
   of the width, the value at 20% + 60% x (v - lo)/(hi - lo), kept between 3%
   and 97% so a value far outside still shows. A one-sided range is open on
   its other side: "40 or more" runs from 20% to the end, with twice the floor
   at 80%; "up to 100" from the start to 80%, with zero at 20%. Null without
   a range. */
function tlMarkerBar(row) {
  var lo = row.lo, hi = row.hi, v = row.value, from = 0.2, to = 0.8, at;
  if (lo !== null && hi !== null) {
    if (!(hi > lo)) return null;
    at = 0.2 + 0.6 * (v - lo) / (hi - lo);
  } else if (lo !== null) {
    to = 1;
    at = 0.2 + 0.6 * (v - lo) / (lo > 0 ? lo : 1);
  } else if (hi !== null) {
    if (!(hi > 0)) return null;
    from = 0;
    at = 0.2 + 0.6 * v / hi;
  } else {
    return null;
  }
  return { from: from, to: to, at: Math.max(0.03, Math.min(0.97, at)) };
}

/* "Reference 300–950", "Reference 40 or more", "Reference up to 100". */
function tlRangeText(row) {
  var n = function (x) { return String(Math.round(x * 1000) / 1000); };
  if (row.lo !== null && row.hi !== null) return 'Reference ' + n(row.lo) + '\u2013' + n(row.hi);
  if (row.lo !== null) return 'Reference ' + n(row.lo) + ' or more';
  if (row.hi !== null) return 'Reference up to ' + n(row.hi);
  return 'No reference range on file';
}

/* "In range", "Below range", "Above range", or nothing without a range. */
function tlRangeStatus(row) {
  if (row.lo === null && row.hi === null) return '';
  if (row.status === 'bad') return row.dir === 'below' ? 'Below range' : row.dir === 'above' ? 'Above range' : 'Out of range';
  return 'In range';
}

/* Up to `n` rows for the Labs view: those out of range first, then the rest
   in the order the panel lists them. */
function tlPanelRows(panel, n) {
  if (!panel) return [];
  var bad = panel.rows.filter(function (r) { return r.status === 'bad'; });
  var rest = panel.rows.filter(function (r) { return r.status !== 'bad'; });
  return bad.concat(rest).slice(0, n);
}

function tlJoinNames(names) {
  if (names.length <= 1) return names.join('');
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

/* The lab flags row: "2 markers out of range", "LH and FSH below reference".
   Null when nothing is out of range. */
function tlFlagsText(panel) {
  if (!panel || !panel.out.length) return null;
  var n = panel.out.length;
  var below = panel.out.filter(function (r) { return r.dir === 'below'; }).map(function (r) { return r.name; });
  var above = panel.out.filter(function (r) { return r.dir === 'above'; }).map(function (r) { return r.name; });
  var parts = [];
  if (below.length) parts.push(tlJoinNames(below) + ' below');
  if (above.length) parts.push(tlJoinNames(above) + ' above');
  return {
    title: n + (n === 1 ? ' marker' : ' markers') + ' out of range',
    sub: parts.length ? parts.join(', ') + ' reference' : 'Outside the reference range'
  };
}

/* Where a value sits on its range bar, as fractions of the bar: the range
   occupies the middle half, so a value outside it still has somewhere to be
   drawn. */
function tlRangeBar(row) {
  if (row.lo === null && row.hi === null) return null;
  var lo = row.lo !== null ? row.lo : 0, hi = row.hi !== null ? row.hi : lo * 2 || 1;
  var span = hi - lo || 1;
  var at = 0.25 + 0.5 * (row.value - lo) / span;
  return { from: 0.25, to: 0.75, at: Math.max(0.02, Math.min(0.98, at)) };
}
