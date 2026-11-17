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

/* The newest bloodwork entry with a value in it, read for Home.
 *
 *   labs = { range(key, entry) -> { lo, hi } | null,     labRangeFor
 *            status(key, value, entry) -> 'good' | 'warn' | 'bad' | 'neutral',   labSt
 *            label(key), unit(key) }
 *
 * Returns { entry, date, rows, out } or null. A row is
 *   { key, name, value, unit, lo, hi, status, dir }
 * with dir 'below' or 'above' when the value is outside the range. `out` is
 * the rows outside it. Out of range means what the bloodwork screen means by
 * it (labSt's 'bad'), so the two never disagree. */
function tlLatestPanel(entries, labs) {
  var latest = null, when = -Infinity;
  (entries || []).forEach(function (e) {
    if (!e || e.type !== 'bloodwork' || !e.labs) return;
    var any = Object.keys(e.labs).some(function (k) { return typeof e.labs[k] === 'number' && isFinite(e.labs[k]); });
    if (!any) return;
    var t = e.labDate ? tlDay(e.labDate).getTime() : new Date(e.ts).getTime();
    if (t > when || (t === when && latest && new Date(e.ts) > new Date(latest.ts))) { when = t; latest = e; }
  });
  if (!latest) return null;
  var rows = Object.keys(latest.labs).filter(function (k) {
    return typeof latest.labs[k] === 'number' && isFinite(latest.labs[k]);
  }).map(function (k) {
    var v = latest.labs[k], r = labs.range(k, latest) || {};
    var lo = typeof r.lo === 'number' && isFinite(r.lo) ? r.lo : null;
    var hi = typeof r.hi === 'number' && isFinite(r.hi) ? r.hi : null;
    var status = labs.status(k, v, latest);
    return {
      key: k, name: TL_MARKER_SHORT[k] || labs.label(k), value: v, unit: labs.unit(k) || '',
      lo: lo, hi: hi, status: status,
      dir: status === 'bad' ? (lo !== null && v < lo ? 'below' : hi !== null && v > hi ? 'above' : null) : null
    };
  });
  return {
    entry: latest, date: latest.labDate || tlDayKey(latest.ts), rows: rows,
    out: rows.filter(function (r) { return r.status === 'bad'; })
  };
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
