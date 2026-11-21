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
 * adding or removing a compound is not a dose change. Which compound is which
 * across a save is tlPairCompounds(), and the old protocol form's save uses
 * the same pairing to carry a stored model over (record.js).
 */

/* Which compound in one protocol is which in the next, one to one.
 *
 * Keys cannot decide it on their own. A protocol read from the old text has
 * keys made by line position (the second "BPC-157" line is bpc-2, and so is
 * "BPC-157 Oral" when it comes second, since both resolve to bpc), so after
 * an edit the same key can name another line. Pairing by name alone fails
 * too, when one compound has two lines ("Testosterone Cypionate, 100mg,
 * Weekly (Mon)" and "..., 50mg, Weekly (Thu)").
 *
 * So, in passes, each compound taken at most once:
 *   1. same name, same dose, same frequency text: an unchanged line
 *   2. same name, same frequency text: that line's dose changed
 *   3. same name, the rest in order
 *   4. same key, only when neither protocol was read from the text, since
 *      then keys are stable and a key kept across a rename is the same
 *      compound
 * Names compare without case or spacing, and a comma as the semicolon the
 * old text turns it into. Where `before` is a stored model, its frequency
 * text also matches the text tlProtocolToLegacy wrote for it, which is what
 * the old form shows and saves back unchanged.
 *
 * A compound left over in `after` was added, one left over in `before` was
 * removed; neither is a change. Returns { pairs: [{ was, now }], added,
 * removed }, pairs in the order of `after`. */
function tlPairCompounds(before, after) {
  var old = (before && before.compounds) || [], now = (after && after.compounds) || [];
  var stored = !!before && !before.derived, start = before && before.start;
  var used = [], match = [];
  var pass = function (same) {
    now.forEach(function (c, j) {
      if (match[j] !== undefined) return;
      for (var i = 0; i < old.length; i++) {
        if (!used[i] && same(old[i], c)) { used[i] = true; match[j] = i; return; }
      }
    });
  };
  var sameName = function (a, b) { return tlTextKey(a.name, true) === tlTextKey(b.name, true); };
  var sameFreq = function (a, b) { return tlTextKey(a.freqText) === tlTextKey(b.freqText); };
  var wroteFreq = function (a, b) { return stored && tlTextKey(tlLegacyFreqText(a, start)) === tlTextKey(b.freqText); };
  pass(function (a, b) { return sameName(a, b) && tlSameDose(a.dose, b.dose) && sameFreq(a, b); });
  pass(function (a, b) { return sameName(a, b) && tlSameDose(a.dose, b.dose) && wroteFreq(a, b); });
  pass(function (a, b) { return sameName(a, b) && sameFreq(a, b); });
  pass(function (a, b) { return sameName(a, b) && wroteFreq(a, b); });
  pass(sameName);
  if (stored && after && !after.derived) pass(function (a, b) { return !!a.key && a.key === b.key; });
  var out = { pairs: [], added: [], removed: [] };
  now.forEach(function (c, j) {
    if (match[j] === undefined) out.added.push(c);
    else out.pairs.push({ was: old[match[j]], now: c });
  });
  old.forEach(function (c, i) { if (!used[i]) out.removed.push(c); });
  return out;
}

/* Text compared loosely: case and runs of space ignored, and for a name, a
   comma read as the semicolon the old text writes for it. */
function tlTextKey(s, isName) {
  var t = String(s === null || s === undefined ? '' : s);
  if (isName) t = t.replace(/,/g, ';');
  return t.replace(/\s+/g, ' ').trim().toLowerCase();
}

/* Has a compound's frequency text stayed what it was? The same text, or, for
   a stored model, the text the old fields were written with for it. */
function tlFreqUnchanged(was, now, start) {
  var text = tlTextKey(now && now.freqText);
  return tlTextKey(was && was.freqText) === text || tlTextKey(tlLegacyFreqText(was, start)) === text;
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
  var out = [];
  tlPairCompounds(before, after).pairs.forEach(function (p) {
    if (tlSameDose(p.was.dose, p.now.dose)) return;
    out.push({ ts: nowIso, key: p.now.key, name: p.now.name, from: tlDoseText(p.was.dose), to: tlDoseText(p.now.dose) });
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
