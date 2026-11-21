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
 * report and supply all see a dose however it was logged. Its `dose` is the
 * text the user typed, as the old screens wrote it.
 *
 * A dose logged from an old screen has no key, slot or day, only a name and a
 * time, and it still ticks its round off (tlMatchDay):
 *
 *   - It counts for the local day of its time, except that before 04:00 it
 *     is the evening before's when a compound of that name is in the bedtime
 *     round and was due that evening. That depends on nothing but the entry
 *     and the protocol, so whichever day is asked about, the entry is counted
 *     for exactly one.
 *   - It goes to the dose whose round is nearest its time, among every
 *     compound with its name, so two protocol lines with one name never share
 *     an entry. If that dose is already ticked, the entry is a second record
 *     of it and ticks nothing else: the morning dose recorded twice does not
 *     make the bedtime dose taken.
 *
 * An entry that names a dose already ticked is likewise a second record. An
 * entry naming a slot its compound has since been moved out of goes to the
 * nearest dose still pending, so a dose taken still counts when the protocol
 * changes under it.
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
   protocol line. Two lines can share a name; tlMatchDay gives such an entry
   to one of them. */
function tlEntryIsFor(e, c) {
  if (!tlIsMedEntry(e)) return false;
  return e.key ? e.key === c.key : e.medication === c.name;
}

/* The compounds an entry may be a dose of: the one with its key, or every one
   with its name. */
function tlEntryCompounds(protocol, e) {
  return ((protocol && protocol.compounds) || []).filter(function (c) { return tlEntryIsFor(e, c); });
}

/* The day an entry counts for, and the minute of its time counted from the
   start of that day: { day, min }.

   An entry logged through the rounds names its day. One logged from an old
   screen has only a time, and counts for the local day of that time, except
   before 04:00, where the morning slot starts and bedtime's wrap past
   midnight ends. Then it is the evening before's, if one of `group` (the
   compounds it may be for) is in the bedtime round and was due that evening.
   Otherwise it keeps its own day, so a morning-only compound is not moved
   back onto a day whose dose is already taken. The evening before is the
   calendar day before, not 24 hours earlier, which on the night the clocks
   change is a different day.

   An entry at 00:20 counted for the evening before is at minute 1460, 110
   minutes after a 22:30 bedtime and far from a 07:00 morning. */
function tlEntryDay(protocol, e, group) {
  var x = new Date(e.ts);
  if (isNaN(x)) return e.day ? { day: e.day, min: null } : null;
  var own = tlDayKey(x), min = tlMinuteOfDay(x), day = e.day || own;
  var cut = tlSlotDef('am').from;
  /* A bedtime set after midnight (00:30) is its own day's first round, not
     the evening before's, so nothing moves back for it. */
  if (!e.day && min < cut && protocol.slots.bed.t >= cut) {
    var before = tlDayKey(new Date(x.getFullYear(), x.getMonth(), x.getDate() - 1));
    if (group.some(function (c) { return (c.slots || []).indexOf('bed') >= 0 && tlDoseDueOn(protocol, c, before) !== null; })) {
      /* Within the hour before its own day's first round, it is an early dose
         of that round: 03:50 with a morning round at 04:30. */
      var first = Infinity;
      group.forEach(function (c) {
        if (tlDoseDueOn(protocol, c, own) === null) return;
        (c.slots || []).forEach(function (s) { first = Math.min(first, protocol.slots[s].t); });
      });
      if (min < first - 60) day = before;
    }
  }
  return { day: day, min: min + 1440 * (tlDaysBetween(day, own) || 0) };
}

/* Which entry ticks which dose on a day.
 *
 *   { day, doses, hits }
 *
 * `doses` is every dose due that day, compound by compound in protocol order,
 * with `at` and `ts` set on each one an entry ticks. `hits` has one
 * { entry, dose, dup } for every entry that counts for that day and has a
 * dose to go to: `dose` is the one it ticks or, with `dup`, the one it is a
 * second record of.
 *
 * Entries go in two passes, earliest first in each. First those that name a
 * slot one of their compounds is in that day: each ticks that dose, or is a
 * second record of it when it is already ticked. Then the rest:
 *
 *   - An entry with no slot goes to the dose whose round is nearest its time,
 *     among every compound it may be for, preferring a pending dose when two
 *     are as near. If that dose is ticked, the entry is a second record of
 *     it, not a dose of some round hours away: an old-screen record next to a
 *     checklist tick is the same dose twice.
 *   - An entry naming a slot its compound has since left goes to the nearest
 *     dose still pending. It was logged through the rounds as a dose of its
 *     own, and the rounds never log one dose twice. */
function tlMatchDay(protocol, date, entries) {
  var day = tlDayKey(date), doses = [], hits = [];
  var out = { day: day, doses: doses, hits: hits };
  if (!day || !protocol) return out;
  var compounds = protocol.compounds || [];
  compounds.forEach(function (c) {
    var text = tlDoseDueOn(protocol, c, day);
    if (text === null) return;
    c.slots.forEach(function (slot) {
      doses.push({ id: tlDoseId(c.key, slot, day), key: c.key, name: c.name, dose: text, slot: slot, day: day, at: null, ts: null });
    });
  });
  if (!doses.length) return out;

  /* An entry from the small hours of the next day may be tonight's. */
  var d0 = tlDay(day), next = tlDayKey(new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1));
  var mine = [];
  (entries || []).forEach(function (e) {
    if (!tlIsMedEntry(e)) return;
    if (e.day ? e.day !== day : [day, next].indexOf(tlDayKey(e.ts)) < 0) return;
    var group = tlEntryCompounds(protocol, e);
    if (!group.length) return;
    var when = tlEntryDay(protocol, e, group);
    if (!when || when.day !== day) return;
    var keys = group.map(function (c) { return c.key; });
    var cands = doses.filter(function (x) { return keys.indexOf(x.key) >= 0; });
    if (cands.length) mine.push({ entry: e, cands: cands, min: when.min, t: new Date(e.ts).getTime() || 0 });
  });
  mine.sort(function (a, b) { return a.t - b.t; });

  function tick(m, x) { x.at = m.entry.ts; x.ts = m.entry.ts; hits.push({ entry: m.entry, dose: x, dup: false }); }
  function repeat(m, x) { hits.push({ entry: m.entry, dose: x, dup: true }); }

  var rest = [];
  mine.forEach(function (m) {
    var named = m.entry.slot ? m.cands.filter(function (x) { return x.slot === m.entry.slot; }) : [];
    if (!named.length) { rest.push(m); return; }
    var free = named.filter(function (x) { return !x.at; })[0];
    if (free) tick(m, free); else repeat(m, named[0]);
  });
  rest.forEach(function (m) {
    var near = null, open = null, gap = Infinity, openGap = Infinity;
    m.cands.forEach(function (x) {
      var g = Math.abs(protocol.slots[x.slot].t - m.min);
      if (g < gap || (g === gap && near.at && !x.at)) { gap = g; near = x; }
      if (!x.at && g < openGap) { openGap = g; open = x; }
    });
    var to = m.entry.slot ? (open || near) : near;
    if (!to) return;
    if (to.at) repeat(m, to); else tick(m, to);
  });
  return out;
}

/* The medication entries tlMatchDay can count for a day: those naming it, and
   undated ones logged on it or the day after. Indexed once per `cache`, so
   asking about many days does not read every entry for each. tlMatchDay
   filters these the same way it filters the whole log, so the answer is the
   same; this only saves reading the rest. */
function tlEntriesNear(entries, day, cache) {
  if (!cache) return entries;
  var idx = cache.__byDay;
  if (!idx) {
    idx = cache.__byDay = {};
    (entries || []).forEach(function (e) {
      if (!tlIsMedEntry(e)) return;
      var k = e.day || tlDayKey(e.ts);
      if (k) (idx[k] = idx[k] || []).push(e);
    });
  }
  var d0 = tlDay(day), next = tlDayKey(new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1));
  return (idx[day] || []).concat(idx[next] || []);
}

/* The compound an entry counts against in supply: the one whose dose it
   ticked, or was a second record of, on its day; failing that, the first it
   may be for. Only a name two protocol lines share needs the question asked.
   `cache` keeps each day's match for a caller asking about many entries. */
function tlEntryOwner(protocol, e, entries, cache) {
  var group = tlEntryCompounds(protocol, e);
  if (!group.length) return null;
  if (group.length === 1) return group[0].key;
  var when = tlEntryDay(protocol, e, group);
  if (when) {
    cache = cache || {};
    var match = cache[when.day] || (cache[when.day] = tlMatchDay(protocol, when.day, tlEntriesNear(entries, when.day, cache)));
    for (var i = 0; i < match.hits.length; i++) if (match.hits[i].entry === e) return match.hits[i].dose.key;
  }
  return group[0].key;
}

/* The rounds for a day.
 *
 *   [{ slot, label, icon, t, time, alert,
 *      doses: [{ id, key, name, dose, slot, day, at, ts }] }]
 *
 * `at` is the instant the dose was logged, or null while it is pending, and
 * `ts` the entry that says so (tlMatchDay). Sorted by the slot's time. A slot
 * with nothing due that day is not a round and is left out. */
function tlRoundsFor(protocol, date, entries) {
  var rounds = {};
  tlMatchDay(protocol, date, entries).doses.forEach(function (x) {
    if (!rounds[x.slot]) {
      var def = tlSlotDef(x.slot), s = protocol.slots[x.slot];
      rounds[x.slot] = { slot: x.slot, label: def.label, icon: def.icon, t: s.t, time: tlMinToTime(s.t), alert: s.alert !== false, doses: [] };
    }
    rounds[x.slot].doses.push(x);
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
   Changes `d`; the caller saves.

   The entry's dose is the text the user typed, as the old screens always
   wrote it, not the tidied text a round shows: the level chart's parser
   reads it, and the history shows it, so it must say what the user said. On
   a taper it is that day's step, which is the user's own text too. */
function tlLogDose(d, protocol, id, nowIso, extra) {
  var p = tlParseDoseId(id);
  if (!p) return null;
  var dose = tlFindDose(tlRoundsFor(protocol, p.day, d.entries), id);
  if (!dose || dose.at) return null;
  extra = extra || {};
  var c = tlCompound(protocol, dose.key);
  var typed = c && c.rule && c.rule.taper && c.rule.taper.length ? dose.dose : (c && c.dose && c.dose.text) || dose.dose;
  var entry = {
    type: 'medication',
    ts: tlFreshTs(d.entries, nowIso),
    medication: dose.name,
    dose: extra.dose !== undefined && extra.dose !== null && extra.dose !== '' ? String(extra.dose) : typed,
    site: extra.site || null,
    notes: extra.notes || '',
    key: dose.key, slot: dose.slot, day: dose.day
  };
  if (extra.siteId) entry.siteId = extra.siteId;
  if (!Array.isArray(d.entries)) d.entries = [];
  d.entries.unshift(entry);
  return entry;
}

/* Take a logged dose back. Removes the one entry that ticked it off, whether
   that entry named the dose or was matched to it, and returns it. An entry
   that ticked another dose, of a same-name line or another round, is never
   it. If the dose was recorded twice, the second record ticks it now, and
   undoing again removes that one. */
function tlUndoDose(d, protocol, id) {
  var p = tlParseDoseId(id);
  if (!p) return null;
  var gone = null;
  tlMatchDay(protocol, p.day, d.entries).hits.forEach(function (h) {
    if (!gone && !h.dup && h.dose.id === id) gone = h.entry;
  });
  if (!gone) return null;
  d.entries = (d.entries || []).filter(function (e) { return e !== gone; });
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

/* Clear a round: every dose in it goes back to pending. Removes each entry
   that ticked one of its doses and each second record of one, all at once,
   since a second record left behind would tick the dose again. Entries for
   doses in other rounds stay. Returns the entries removed. */
function tlUndoRound(d, protocol, slot, date) {
  var gone = [];
  tlMatchDay(protocol, date, d.entries).hits.forEach(function (h) {
    if (h.dose.slot === slot) gone.push(h.entry);
  });
  if (gone.length) d.entries = (d.entries || []).filter(function (e) { return gone.indexOf(e) < 0; });
  return gone;
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
