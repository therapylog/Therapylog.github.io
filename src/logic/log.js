/* Logging from the Log sheet (5a) and the injection-site map (4a).
 *
 * "Save dose" ticks off that compound's next pending dose today, the same
 * dose id Today's checklist and the round alert would tick, so all three
 * write one kind of entry. A dose taken when none is pending (an extra dose,
 * or a compound with no schedule) is still recorded, as a medication entry
 * with the compound's key and no round.
 */

/* The dose a compound is next due today, from the day's rounds: the first
   pending one in round order. Null when it has none left today. */
function tlNextPendingFor(rounds, key) {
  for (var i = 0; i < (rounds || []).length; i++) {
    for (var j = 0; j < rounds[i].doses.length; j++) {
      var x = rounds[i].doses[j];
      if (x.key === key && !x.at) return x;
    }
  }
  return null;
}

/* The compound the dose form should start on: the one whose dose is due
   soonest today, else the protocol's first. */
function tlDefaultDoseCompound(protocol, rounds) {
  var next = tlNextDueRound(rounds);
  if (next) {
    var pending = next.doses.filter(function (x) { return !x.at; })[0];
    if (pending) return tlCompound(protocol, pending.key);
  }
  return (protocol.compounds || [])[0] || null;
}

/* The dose the form starts with: the user's own protocol amount and unit,
   or the text they typed when it has no single amount. Never a suggestion. */
function tlFormDose(c) {
  var dose = c && c.dose;
  if (!dose) return { amount: '', unit: 'mg', text: '' };
  var has = dose.amount !== null && dose.amount !== undefined;
  return {
    amount: has ? String(dose.amount) : '',
    unit: dose.unit && TL_UNITS.indexOf(dose.unit) >= 0 ? dose.unit : 'mg',
    text: has ? '' : (dose.text || '')
  };
}

/* Save a dose of compound `key`, as the dose form does.
 *
 *   extra = { dose, site, siteId, notes }    dose as text, "250 mcg"
 *
 * Returns { entry, ticked }: ticked is the dose id it ticked off, or null when
 * nothing was pending and the dose was recorded on its own. Changes `d`; the
 * caller saves. */
function tlLogCompoundDose(d, protocol, key, nowIso, extra) {
  extra = extra || {};
  var c = tlCompound(protocol, key);
  if (!c) return null;
  var day = tlDayKey(nowIso);
  var pending = tlNextPendingFor(tlRoundsFor(protocol, day, d.entries || []), key);
  if (pending) {
    var entry = tlLogDose(d, protocol, pending.id, nowIso, extra);
    if (entry) return { entry: entry, ticked: pending.id };
  }
  var e = {
    type: 'medication',
    ts: tlFreshTs(d.entries, nowIso),
    medication: c.name,
    dose: extra.dose !== undefined && extra.dose !== null && extra.dose !== '' ? String(extra.dose) : tlDoseText(c.dose),
    site: extra.site || null,
    notes: extra.notes || '',
    key: c.key
  };
  if (extra.siteId) e.siteId = extra.siteId;
  if (!Array.isArray(d.entries)) d.entries = [];
  d.entries.unshift(e);
  return { entry: e, ticked: null };
}

/* What "Saved" says: "Testosterone Cypionate 100 mg, right deltoid". */
function tlSavedLine(entry) {
  if (!entry) return '';
  return entry.medication + (entry.dose ? ' ' + entry.dose : '') + (entry.site ? ', ' + entry.site.charAt(0).toLowerCase() + entry.site.slice(1) : '');
}
