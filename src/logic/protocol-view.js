/* The Protocol screen (6a): its numbers, and changing the protocol through it.
 *
 * Everything the screen shows is read from the protocol model (protocol.js)
 * and the log: the week strip from tlWeekCounts, supply from tlSupplyAll, the
 * changes from d.doseChanges. Every change goes through tlEditProtocol, which
 * records any dose that changed (changes.js) and stores the model with the
 * old fields rewritten to match (tlSaveProtocol), so the old screens, Today,
 * the alerts and supply all follow at once.
 */

var TL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var TL_COUNT_WORDS = ['none', 'one', 'two', 'three', 'four'];

function tlRouteLabel(route) {
  return route === 'im' ? 'IM' : route === 'sq' ? 'SubQ' : route === 'oral' ? 'Oral' : route === 'topical' ? 'Topical' : '';
}

/* The Monday of the week a date falls in, as a local date. */
function tlMondayOf(date) {
  var d = tlDay(tlDayKey(date));
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
}

/* The summary line's numbers: compounds, rounds a day, the protocol's week. */
function tlProtocolSummary(p, date) {
  var rounds = TL_SLOT_KEYS.filter(function (k) {
    return (p.compounds || []).some(function (c) { return c.rule && (c.slots || []).indexOf(k) >= 0; });
  }).length;
  var days = p.start ? tlDaysBetween(p.start, tlDayKey(date)) : null;
  return {
    count: (p.compounds || []).length,
    rounds: rounds,
    week: days !== null && days >= 0 ? Math.floor(days / 7) + 1 : null,
    start: p.start || null,
    weeks: p.weeks || null
  };
}

/* The week strip: Monday to Sunday of the week `date` is in, each day's dose
   count, and which day is today. */
function tlWeekStrip(p, date) {
  var today = tlDayKey(date);
  return tlWeekCounts(p, tlMondayOf(date)).map(function (w) {
    return { day: w.day, letter: TL_DAY_NAMES[w.weekday].charAt(0), name: TL_DAY_NAMES[w.weekday], count: w.count, today: w.day === today };
  });
}

function tlJoinWords(words) {
  if (words.length <= 1) return words.join('');
  return words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
}

/* The strip's caption: what makes one day differ from another. "Doses per
   day this week. Testosterone cyp adds one on Monday and Thursday." */
function tlWeekCaption(p, date) {
  var monday = tlMondayOf(date), parts = [];
  (p.compounds || []).forEach(function (c) {
    if (!c.rule || !(c.slots || []).length) return;
    var on = [];
    for (var i = 0; i < 7; i++) {
      var day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      if (tlDoseDueOn(p, c, day) !== null) on.push(TL_DAY_NAMES[day.getDay()]);
    }
    if (!on.length || on.length === 7) return;
    var n = c.slots.length;
    parts.push(c.name + ' adds ' + (TL_COUNT_WORDS[n] || n) + ' on ' + tlJoinWords(on));
  });
  return 'Doses per day this week.' + (parts.length ? ' ' + parts.join('. ') + '.' : '');
}

/* A compound's line: "2 IU · Daily · SubQ". */
function tlCompoundLine(c) {
  return [tlDoseText(c.dose) || 'No dose set', tlRuleLabel(c.rule), tlRouteLabel(c.route)]
    .filter(function (x) { return x; }).join(' · ');
}

/* Its round times: "Morning 07:00 · Bedtime 22:30". */
function tlSlotTimesText(c, p) {
  var parts = (c.slots || []).map(function (k) { return tlSlotDef(k).label + ' ' + tlMinToTime(p.slots[k].t); });
  return parts.length ? parts.join(' · ') : 'No time set yet';
}

/* Known interactions within the stack, from the app's own curated list
   (INTERACTIONS: { drugs: [names], severity, title, ... }). A compound counts
   by its own name and by its encyclopedia name (`nameOf(drugId)`). Two or
   more of an entry's drugs on the stack is a flag, as in the checker. The
   list is curated, not complete, and the screen says so. */
function tlStackInteractions(p, interactions, nameOf) {
  var names = {};
  (p.compounds || []).forEach(function (c) {
    names[String(c.name).toLowerCase()] = true;
    var n = c.drugId && nameOf ? nameOf(c.drugId) : null;
    if (n) names[String(n).toLowerCase()] = true;
  });
  return (interactions || []).filter(function (ix) {
    return (ix.drugs || []).filter(function (n) { return names[String(n).toLowerCase()]; }).length >= 2;
  });
}

/* What is wrong with a supply form, or null. Blank per and left together
   mean "no count", which is allowed. */
function tlSupplyProblem(values) {
  var blank = function (v) { return String(v === null || v === undefined ? '' : v).trim() === ''; };
  if (blank(values.per) && blank(values.left)) return null;
  var per = +values.per, left = +values.left, spare = +(values.spare || 0);
  if (!(Number.isInteger(per) && per > 0)) return 'Doses per vial has to be a whole number, like 20.';
  if (!(Number.isInteger(left) && left >= 0)) return 'Doses left has to be a whole number, 0 or more.';
  if (left > per) return 'Doses left cannot be more than doses per vial.';
  if (!(Number.isInteger(spare) && spare >= 0)) return 'Spare vials has to be a whole number, 0 or more.';
  return null;
}

/* Change the protocol: `change(p)` edits a copy, and the copy is stored, with
   any dose that changed written to the dose-change log. Returns
   { protocol, changes }. Changes `d`; the caller saves. */
function tlEditProtocol(d, env, nowIso, change) {
  var before = tlProtocol(d, env), after = tlProtocol(d, env);
  change(after);
  var changes = tlRecordDoseChanges(d, before, after, nowIso);
  tlSaveProtocol(d, after, nowIso);
  return { protocol: tlProtocol(d, env), changes: changes };
}

/* A protocol template (the app's TEMPLATES) as a protocol model, read the way
   the old form read the same lines, so a template means what it always did.
   Its doses are the template's, which the screen asks the user to check with
   their physician. */
function tlTemplateProtocol(t, startDay, env) {
  var lines = (t.compounds || []).map(function (c) {
    var clean = function (s) { return String(s || '').replace(/,/g, ';').replace(/[\r\n]+/g, ' ').trim(); };
    return clean(c.name) + ', ' + clean(c.dose) + ', ' + clean(c.freq);
  });
  var weeks = parseInt(String(t.duration || ''), 10);
  var p = tlProtocolFromLegacy({ entries: [], proto: { name: t.name, start: startDay, weeks: isFinite(weeks) ? weeks : null, meds: lines.join('\n'), pct: t.pct || '' } }, env);
  delete p.derived;
  return p;
}
