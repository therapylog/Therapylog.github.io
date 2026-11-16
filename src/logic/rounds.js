/* Rounds, and the dose log.
 *
 * A round is a time slot that has at least one compound due on the day in
 * question. It is what Home lists, what one alert covers, and what "Log
 * morning round" logs. Rounds are never stored: they are worked out from the
 * protocol (protocol.js) and the day, so a change to the protocol shows
 * everywhere at once.
 *
 * A dose is one compound in one round on one day, and its id says so:
 *
 *     key:slot:YYYY-MM-DD        bpc:am:2026-11-16
 *
 * The dose LOG is not a new store. A logged dose is a medication entry in
 * d.entries, the same array the app has always used, with three more fields
 * (key, slot, day) saying which dose it was. So history, the level chart, the
 * report and supply all see a dose however it was logged, and a dose logged
 * from an old screen, which has no slot, still ticks its round off: an
 * unassigned entry for the same compound on the same day is matched to the
 * round nearest its time.
 *
 * Which days a compound is due is tlDueOn()'s answer, the rule engine already
 * in the app, so every-other-day, on/off cycling and tapers work here without
 * this file knowing about them.
 */

/* A date as the local calendar day it falls on: "2026-11-16". Accepts a Date,
   an ISO instant or a YYYY-MM-DD string. An instant is read in local time, so
   a dose logged at 23:30 belongs to that evening wherever UTC is. */
function tlDayKey(date) {
  var x;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  x = (date instanceof Date) ? date : new Date(date);
  if (isNaN(x)) return null;
  var m = x.getMonth() + 1, d = x.getDate();
  return x.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
}

/* Minutes since local midnight for an instant. */
function tlMinuteOfDay(ts) {
  var x = (ts instanceof Date) ? ts : new Date(ts);
  return isNaN(x) ? null : x.getHours() * 60 + x.getMinutes();
}

function tlDoseId(key, slot, day) { return key + ':' + slot + ':' + day; }

function tlParseDoseId(id) {
  var m = String(id || '').match(/^([^:]+):(am|mid|eve|bed):(\d{4}-\d{2}-\d{2})$/);
  return m ? { key: m[1], slot: m[2], day: m[3] } : null;
}

/* The day a compound's rule counts from. Interval rules need one; a rule may
   carry its own. Failing that the protocol's start, then the day it was
   created, then a Monday long ago, so a weekday rule on a protocol with no
   dates at all is still due on its weekdays. */
function tlRuleAnchor(protocol, c) {
  return (c.rule && c.rule.start) || protocol.start || (protocol.created ? tlDayKey(protocol.created) : null) || '2000-01-03';
}

/* The dose a compound is due on a day, as text, or null if it is not due.
   Text, because a taper's dose changes by the week. */
function tlDoseDueOn(protocol, c, date) {
  if (!c || !c.rule || !(c.slots || []).length) return null;
  var rule = {};
  Object.keys(c.rule).forEach(function (k) { rule[k] = c.rule[k]; });
  rule.compound = c.name;
  rule.dose = tlDoseText(c.dose);
  rule.times = ['00:00'];
  var due = tlDueOn(rule, tlDayKey(date), tlRuleAnchor(protocol, c));
  return due.length ? String(due[0].dose === null || due[0].dose === undefined ? '' : due[0].dose) : null;
}

function tlIsMedEntry(e) { return !!e && e.type === 'medication'; }

/* Does this entry record a dose of this compound? By key when the entry has
   one, otherwise by the exact name, which is how older entries are tied to a
   protocol line. */
function tlEntryIsFor(e, c) {
  if (!tlIsMedEntry(e)) return false;
  return e.key ? e.key === c.key : e.medication === c.name;
}

/* The rounds for a day.
 *
 *   [{ slot, label, icon, t, time, alert,
 *      doses: [{ id, key, name, dose, slot, day, at, ts }] }]
 *
 * `at` is the instant the dose was logged, or null while it is pending, and
 * `ts` the entry that says so. Sorted by the slot's time. A slot with nothing
 * due that day is not a round and is left out. */
function tlRoundsFor(protocol, date, entries) {
  var day = tlDayKey(date);
  if (!day || !protocol) return [];
  /* An entry belongs to the day it names, or failing that the local day it
     was logged on: a bedtime dose ticked off after midnight still belongs to
     the evening it was due. */
  var todays = (entries || []).filter(function (e) { return tlIsMedEntry(e) && (e.day || tlDayKey(e.ts)) === day; });
  var rounds = {};

  (protocol.compounds || []).forEach(function (c) {
    var text = tlDoseDueOn(protocol, c, day);
    if (text === null) return;
    var mine = todays.filter(function (e) { return tlEntryIsFor(e, c); });
    var doses = c.slots.map(function (slot) {
      return { id: tlDoseId(c.key, slot, day), key: c.key, name: c.name, dose: text, slot: slot, day: day, at: null, ts: null };
    });

    /* Entries that say which dose they are. */
    var loose = [];
    mine.forEach(function (e) {
      var hit = null;
      if (e.slot) doses.forEach(function (x) { if (!hit && !x.at && x.slot === e.slot) hit = x; });
      if (hit) { hit.at = e.ts; hit.ts = e.ts; } else loose.push(e);
    });
    /* Entries that do not, and entries whose slot the compound has since been
       moved out of: each goes to the pending dose whose round is nearest the
       time it was logged, earliest entry first. A dose taken still counts when
       the protocol changes under it. */
    loose.sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); }).forEach(function (e) {
      var min = tlMinuteOfDay(e.ts), best = null, gap = Infinity;
      doses.forEach(function (x) {
        if (x.at) return;
        var g = Math.abs(protocol.slots[x.slot].t - min);
        if (g < gap) { gap = g; best = x; }
      });
      if (best) { best.at = e.ts; best.ts = e.ts; }
    });

    doses.forEach(function (x) {
      if (!rounds[x.slot]) {
        var def = tlSlotDef(x.slot), s = protocol.slots[x.slot];
        rounds[x.slot] = { slot: x.slot, label: def.label, icon: def.icon, t: s.t, time: tlMinToTime(s.t), alert: s.alert !== false, doses: [] };
      }
      rounds[x.slot].doses.push(x);
    });
  });

  return TL_SLOT_KEYS.filter(function (k) { return rounds[k]; }).map(function (k) { return rounds[k]; })
    .sort(function (a, b) { return a.t - b.t; });
}

/* Counts for a day's header: "3 of 5 logged". */
function tlRoundsTally(rounds) {
  var total = 0, done = 0;
  (rounds || []).forEach(function (r) { r.doses.forEach(function (x) { total++; if (x.at) done++; }); });
  return { total: total, done: done, pending: total - done };
}

/* The round to act on now: the first with anything still to log. */
function tlNextDueRound(rounds) {
  for (var i = 0; i < (rounds || []).length; i++) {
    if (rounds[i].doses.some(function (x) { return !x.at; })) return rounds[i];
  }
  return null;
}

function tlFindDose(rounds, id) {
  for (var i = 0; i < (rounds || []).length; i++) {
    for (var j = 0; j < rounds[i].doses.length; j++) if (rounds[i].doses[j].id === id) return rounds[i].doses[j];
  }
  return null;
}

/* A timestamp no entry has yet. Import and the cross-tab merge both treat two
   entries with one `ts` as one entry, so a round logged in a single tap needs
   a different millisecond for each dose in it. */
function tlFreshTs(entries, iso) {
  var taken = {}, t = new Date(iso).getTime();
  (entries || []).forEach(function (e) { if (e && e.ts) taken[e.ts] = true; });
  while (taken[new Date(t).toISOString()]) t++;
  return new Date(t).toISOString();
}

/* Log one dose. Adds a medication entry to d.entries and returns it, or null
   if the id names no dose due that day or the dose is already logged.
   `extra` may carry site, notes, and a dose that differed from the protocol's.
   Changes `d`; the caller saves. */
function tlLogDose(d, protocol, id, nowIso, extra) {
  var p = tlParseDoseId(id);
  if (!p) return null;
  var dose = tlFindDose(tlRoundsFor(protocol, p.day, d.entries), id);
  if (!dose || dose.at) return null;
  extra = extra || {};
  var entry = {
    type: 'medication',
    ts: tlFreshTs(d.entries, nowIso),
    medication: dose.name,
    dose: extra.dose !== undefined && extra.dose !== null && extra.dose !== '' ? String(extra.dose) : dose.dose,
    site: extra.site || null,
    notes: extra.notes || '',
    key: dose.key, slot: dose.slot, day: dose.day
  };
  if (extra.siteId) entry.siteId = extra.siteId;
  if (!Array.isArray(d.entries)) d.entries = [];
  d.entries.unshift(entry);
  return entry;
}

/* Take a logged dose back. Removes the entry that ticked it off, whether that
   entry named the dose or was matched to it, and returns it. */
function tlUndoDose(d, protocol, id) {
  var p = tlParseDoseId(id);
  if (!p) return null;
  var dose = tlFindDose(tlRoundsFor(protocol, p.day, d.entries), id);
  if (!dose || !dose.ts) return null;
  var gone = null;
  d.entries = (d.entries || []).filter(function (e) {
    if (!gone && tlIsMedEntry(e) && e.ts === dose.ts && (e.key ? e.key === dose.key : e.medication === dose.name)) { gone = e; return false; }
    return true;
  });
  return gone;
}

/* Log everything still pending in one round, at one moment. Returns the
   entries added. */
function tlLogRound(d, protocol, slot, date, nowIso) {
  var day = tlDayKey(date), added = [];
  tlRoundsFor(protocol, day, d.entries).forEach(function (r) {
    if (r.slot !== slot) return;
    r.doses.forEach(function (x) {
      if (x.at) return;
      var e = tlLogDose(d, protocol, x.id, nowIso);
      if (e) added.push(e);
    });
  });
  return added;
}

/* Clear a round: every dose in it goes back to pending. Returns the entries
   removed. */
function tlUndoRound(d, protocol, slot, date) {
  var day = tlDayKey(date), removed = [];
  tlRoundsFor(protocol, day, d.entries).forEach(function (r) {
    if (r.slot !== slot) return;
    r.doses.forEach(function (x) {
      if (!x.at) return;
      var e = tlUndoDose(d, protocol, x.id);
      if (e) removed.push(e);
    });
  });
  return removed;
}

/* How many doses fall on each of the seven days from `from`, for the week
   strip on the Protocol tab. */
function tlWeekCounts(protocol, from) {
  var start = tlDay(tlDayKey(from)), out = [];
  for (var i = 0; i < 7; i++) {
    var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    var n = 0;
    (protocol.compounds || []).forEach(function (c) { if (tlDoseDueOn(protocol, c, day) !== null) n += c.slots.length; });
    out.push({ day: tlDayKey(day), weekday: day.getDay(), count: n });
  }
  return out;
}
