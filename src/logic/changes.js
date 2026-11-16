/* The dose-change log.
 *
 * Saving a protocol used to overwrite the one before it, so nothing recorded
 * that testosterone went from 100 mg to 80 mg on 7 November. The charts want
 * exactly that: a line on the blood-pressure, weight and lab charts where the
 * dose changed.
 *
 *     d.doseChanges = [{ ts, key, name, from, to }]        newest first
 *
 * `from` and `to` are the dose as text, the way the user had it. A change is
 * recorded when a compound present before and after has a different dose;
 * adding or removing a compound is not a dose change.
 */

/* The same compound in another protocol: by key, and failing that by name,
   since a protocol read from the old text has keys made from its names. */
function tlSameCompound(list, c) {
  var i;
  for (i = 0; i < list.length; i++) if (list[i].key === c.key) return list[i];
  for (i = 0; i < list.length; i++) if (list[i].name === c.name) return list[i];
  return null;
}

/* Two doses are the same when their amounts and units match, or, where an
   amount could not be read, when their text matches ignoring case and space. */
function tlSameDose(a, b) {
  a = a || {}; b = b || {};
  var hasA = a.amount !== null && a.amount !== undefined, hasB = b.amount !== null && b.amount !== undefined;
  if (hasA && hasB) return a.amount === b.amount && (a.unit || null) === (b.unit || null);
  var norm = function (t) { return String(t || '').toLowerCase().replace(/\s+/g, ''); };
  return norm(a.text) === norm(b.text);
}

/* The dose changes between two protocols, as log rows stamped `nowIso`. */
function tlDoseChangesBetween(before, after, nowIso) {
  var out = [], old = (before && before.compounds) || [];
  ((after && after.compounds) || []).forEach(function (c) {
    var was = tlSameCompound(old, c);
    if (!was || tlSameDose(was.dose, c.dose)) return;
    out.push({ ts: nowIso, key: c.key, name: c.name, from: tlDoseText(was.dose), to: tlDoseText(c.dose) });
  });
  return out;
}

/* Record the changes between two protocols on the record. Returns the rows
   added. Changes `d`; the caller saves. */
function tlRecordDoseChanges(d, before, after, nowIso) {
  var rows = tlDoseChangesBetween(before, after, nowIso);
  if (!rows.length) return rows;
  if (!Array.isArray(d.doseChanges)) d.doseChanges = [];
  rows.forEach(function (r, i) {
    /* One ts per row, for the same reason as a logged round. */
    r.ts = new Date(new Date(nowIso).getTime() + i).toISOString();
    d.doseChanges.unshift(r);
  });
  return rows;
}

/* A change as a line: "Testosterone cyp 100 → 80 mg" when both doses share a
   unit, "Testosterone cyp 100mg/week → 80 mg" when they do not. */
function tlDoseChangeLine(change) {
  var a = tlParseDose(change.from), b = tlParseDose(change.to);
  if (a.amount !== null && b.amount !== null && a.unit === b.unit) {
    return change.name + ' ' + a.amount + ' → ' + b.amount + (b.unit ? ' ' + b.unit : '');
  }
  return change.name + ' ' + change.from + ' → ' + change.to;
}

/* The changes that fall inside a chart's span, oldest first, for its markers. */
function tlDoseChangesIn(d, fromMs, toMs) {
  return ((d && d.doseChanges) || []).filter(function (c) {
    var t = new Date(c.ts).getTime();
    return t >= fromMs && t <= toMs;
  }).slice().sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
}
