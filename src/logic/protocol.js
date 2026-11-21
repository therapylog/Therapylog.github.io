/* The protocol model.
 *
 * Until now a protocol was free text: one line per compound, "name, dose,
 * frequency", parsed again at every call, with reminder times and supply kept
 * in separate maps keyed by the compound's name (docs/DATA-MODEL.md, 3.2 to
 * 3.4). The redesign needs a protocol it can ask questions of: which compounds
 * are in the morning round, which days this one is due, how many doses are
 * left in its vial.
 *
 *   protocol = {
 *     name, start, weeks, pct, created,        carried from the old record
 *     compounds: [{
 *       key,          stable id, safe inside a dose id ("key:slot:YYYY-MM-DD")
 *       name,         as the user typed it; still the join to older entries
 *       drugId,       the encyclopedia id when the name resolves, else null
 *       dose: { amount, unit, text },   text is what was typed, always kept
 *       route,        'im' | 'sq' | 'oral' | 'topical' | null
 *       rule,         which days, in tlDueOn()'s rule shape; null = unscheduled
 *       freqText,     the old frequency text, when there was one
 *       note,         what the old line said after its frequency, if anything
 *       slots,        which of the four time slots it is taken in
 *       inv           { per, left, spare, since } or null (supply.js)
 *     }],
 *     slots: { am: { t, alert }, mid: ..., eve: ..., bed: ... },   t = minutes
 *     discreet       hide compound names in alerts
 *   }
 *
 * tlProtocol(record, env) returns it. If the record already holds a protocol
 * in this shape, that is returned. Otherwise it is DERIVED from the old
 * fields, every time, and nothing is written. That is deliberate: while the
 * old screens are still the only way to edit a protocol, the old fields are
 * the truth and the model has to follow them, and a backup made today has to
 * restore to the same bytes. tlMigrateRecord() makes the derivation permanent,
 * and is called on the first write through the new model.
 *
 * `env` carries the three things this file must not reach for itself, so it
 * stays testable: resolve(name) -> encyclopedia id, medium(id) -> formulation,
 * and the old discreet-reminders flag.
 *
 * Reads four of the app's own functions, so an old protocol means here exactly
 * what it means to the old screens: parseMeds, parseFrequency,
 * getDefaultTimes, tlFreqDays.
 */

var TL_SCHEMA = 3;

/* The four slots. `from` is where a slot starts when an arbitrary clock time
   has to be put in one: 04:00, 11:00, 16:00 and 20:30. Bedtime wraps past
   midnight to 03:59. */
var TL_SLOTS = [
  { key: 'am', label: 'Morning', t: 420, from: 240, icon: 'ph-sun-horizon' },
  { key: 'mid', label: 'Midday', t: 750, from: 660, icon: 'ph-sun' },
  { key: 'eve', label: 'Evening', t: 1080, from: 960, icon: 'ph-cloud-sun' },
  { key: 'bed', label: 'Bedtime', t: 1350, from: 1230, icon: 'ph-moon' }
];
var TL_SLOT_KEYS = ['am', 'mid', 'eve', 'bed'];
var TL_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ---- clock times --------------------------------------------------------- */

/* "07:30" -> 450. null for anything that is not a 24-hour time. */
function tlTimeToMin(s) {
  var m = String(s === null || s === undefined ? '' : s).match(/^\s*(\d{1,2}):(\d{2})\s*$/);
  if (!m) return null;
  var h = +m[1], n = +m[2];
  return (h > 23 || n > 59) ? null : h * 60 + n;
}

/* 450 -> "07:30". Wraps, so a time stepped past midnight stays a time. */
function tlMinToTime(min) {
  var m = ((Math.round(min) % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60), n = m % 60;
  return (h < 10 ? '0' : '') + h + ':' + (n < 10 ? '0' : '') + n;
}

function tlSlotDef(key) {
  for (var i = 0; i < TL_SLOTS.length; i++) if (TL_SLOTS[i].key === key) return TL_SLOTS[i];
  return null;
}

/* The slot a clock time belongs in. */
function tlSlotOf(min) {
  if (min === null || min === undefined || isNaN(min)) return null;
  var m = ((Math.round(min) % 1440) + 1440) % 1440;
  var key = 'bed';                                    /* before 04:00 is still last night */
  for (var i = 0; i < TL_SLOTS.length; i++) if (m >= TL_SLOTS[i].from) key = TL_SLOTS[i].key;
  return key;
}

/* A slot's time, kept inside the slot's own span: morning 04:00 to 10:59,
   midday 11:00 to 15:59, evening 16:00 to 20:29, bedtime 20:30 to 03:59. The
   old fields store clock times, not slots, and are read back into slots by
   time of day, so a morning round set to 11:30 would come back as midday and
   take its compounds with it. A time outside the span moves to the nearer
   end of it. */
function tlClampSlotTime(key, min) {
  var i = TL_SLOT_KEYS.indexOf(key);
  var m = ((Math.round(min) % 1440) + 1440) % 1440;
  if (i < 0 || tlSlotOf(m) === key) return m;
  var from = TL_SLOTS[i].from, to = (TL_SLOTS[(i + 1) % 4].from + 1439) % 1440;
  var toFrom = (from - m + 1440) % 1440, pastTo = (m - to + 1440) % 1440;
  return toFrom <= pastTo ? from : to;
}

/* A compound's old reminder times, as slots. A compound sits in a slot at most
   once, so a second time that lands in a taken slot moves to the next free
   one: 08:00 and 10:00 become morning and midday, not one dose. More than four
   times a day cannot be kept, and the ones dropped are reported, not hidden. */
function tlSlotsFromTimes(times) {
  var mins = [];
  (times || []).forEach(function (t) { var m = tlTimeToMin(t); if (m !== null) mins.push(m); });
  mins.sort(function (a, b) { return a - b; });
  var at = {}, dropped = [];
  mins.forEach(function (m) {
    var want = TL_SLOT_KEYS.indexOf(tlSlotOf(m));
    for (var i = 0; i < 4; i++) {
      var k = TL_SLOT_KEYS[(want + i) % 4];
      if (at[k] === undefined) { at[k] = m; return; }
    }
    dropped.push(tlMinToTime(m));
  });
  return { slots: TL_SLOT_KEYS.filter(function (k) { return at[k] !== undefined; }), at: at, dropped: dropped };
}

/* ---- dose ---------------------------------------------------------------- */

/* A typed dose, as an amount and a unit where that is certain.
 *
 * The text is always kept. An amount is only read when the text is a number,
 * an optional unit, and then nothing that could change what the number means:
 * "250mcg twice daily" is 250 mcg, but "200mg/week" (a weekly total),
 * "250-500mcg" (a range) and "0.5ml (100mg)" (two numbers) keep the text and
 * get no amount. The app never guesses a dose.
 *
 * A number with no unit read is a bare amount only when nothing that could be
 * a unit follows it. "250 mcg/day" is a unit this parser does not take (a
 * daily total), and "2 sprays" or "250 mcgs" one it does not know; reading
 * either as a bare 250 or 2 would drop what the number counts, and a later
 * reader would take a bare number as milligrams. So a word, a % sign or a
 * slash after an unread unit leaves the dose as text. */
function tlParseDose(text) {
  var raw = String(text === null || text === undefined ? '' : text).trim();
  var out = { amount: null, unit: null, text: raw };
  /* "1,000mcg" and "10,000 IU": a comma that groups thousands, where amounts
     that size are usual. "2,500mg" or "0,250mg" may use a decimal comma, so
     it keeps its text and gets no amount. */
  /* "5.000 IU" may be five thousand: it keeps its text and gets no amount. */
  if (/^\d+\.\d{3}\s*(?:iu|units?|mcg|\u00b5g|ug)\b/i.test(raw)) return out;
  var m = raw.replace(/^([1-9]\d{0,2}(?:,\d{3})+)(?!\d)(?=\s*(?:mcg|\u00b5g|ug|iu|units?)\b)/i, function (n) { return n.replace(/,/g, ''); }).match(/^(\d+(?:\.\d+)?|\.\d+)\s*(mcg|µg|ug|mg|g|iu|units?|ml|cc|tabs?|tablets?|caps?|capsules?|pills?|drops?|pumps?|clicks?)?(?![\w.,\/%-])(.*)$/i);
  if (!m) return out;
  var rest = m[3] || '';
  if (/\d/.test(rest) || /^\s*(\/|per\b|x\b|to\b)/i.test(rest)) return out;
  if (!m[2] && (/^\s*(\p{L}|%)/u.test(rest) || rest.indexOf('/') >= 0)) return out;
  var amount = parseFloat(m[1]);
  if (!isFinite(amount) || amount <= 0) return out;
  var u = (m[2] || '').toLowerCase();
  var unit = !u ? null
    : (u === 'µg' || u === 'ug') ? 'mcg'
    : u === 'iu' ? 'IU'
    : u === 'ml' || u === 'cc' ? 'mL'
    : u.indexOf('unit') === 0 ? 'units'
    : u.indexOf('tab') === 0 ? 'tab'
    : u.indexOf('cap') === 0 ? 'cap'
    : u.indexOf('pill') === 0 ? 'pill'
    : u.indexOf('drop') === 0 ? 'drop'
    : u.indexOf('pump') === 0 ? 'pump'
    : u.indexOf('click') === 0 ? 'click'
    : u;
  out.amount = amount;
  out.unit = unit;
  return out;
}

/* A dose as the user would read it: "80 mg" when there is an amount, the text
   they typed when there is not. */
function tlDoseText(dose) {
  if (!dose) return '';
  if (dose.amount === null || dose.amount === undefined) return dose.text || '';
  return String(dose.amount) + (dose.unit ? ' ' + dose.unit : '');
}

/* ---- which days ---------------------------------------------------------- */

/* The day words in a text, in order, as { d, at, end } with d 0-6 and Sunday
   0. Short and long forms and plurals: "Thu", "Thurs", "Thursday",
   "Thursdays". "Monthly" and "thus" name no day. */
function tlDayWords(text) {
  var re = /\b(sun(?:days?)?|mon(?:days?)?|tue(?:s(?:days?)?)?|wed(?:s|nesdays?)?|thu(?:r(?:s(?:days?)?)?)?|fri(?:days?)?|sat(?:urdays?)?)\b/gi;
  var s = String(text || ''), out = [], m;
  while ((m = re.exec(s))) {
    out.push({ d: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(m[1].toLowerCase().slice(0, 3)),
      at: m.index, end: m.index + m[0].length });
  }
  return out;
}

/* Weekdays the user named as dose days ("Twice weekly (Mon/Thu)", "Mon-Fri"),
   as 0-6 with Sunday 0, or null when the text names none it can take.
 *
 * Only a plain list of days counts, or a range: "Mon-Fri", "Mon through
 * Fri" and "Monday to Friday" are the days between, and a dash joining three
 * days or more ("Mon-Wed-Fri") is a list. A day named after a word that makes
 * it an exception or a starting point ("except Sunday", "skip Sundays",
 * "starting Mon", "from Tuesday") is not a dose day, and then the text says
 * nothing this can trust, so it gives null and the caller falls back to the
 * reading the old screens used. */
function tlWeekdaysInText(text) {
  var s = String(text || ''), words = tlDayWords(s);
  if (!words.length) return null;
  var guard = /\b(except|excluding|skip\w*|no|not|off|start\w*|begin\w*|from|until|till)\b/i.exec(s);
  if (guard && guard.index < words[words.length - 1].at) return null;
  var link = function (a, b) { return /^\s*(-|–|—|through|thru|to)\s*$/i.test(s.slice(a.end, b.at)); };
  var found = {}, i = 0;
  while (i < words.length) {
    var j = i;
    while (j + 1 < words.length && link(words[j], words[j + 1])) j++;
    if (j === i + 1) {
      for (var d = words[i].d; ; d = (d + 1) % 7) { found[d] = true; if (d === words[j].d) break; }
    } else {
      for (var k = i; k <= j; k++) found[words[k].d] = true;
    }
    i = j + 1;
  }
  var days = [];
  for (var n = 0; n < 7; n++) if (found[n]) days.push(n);
  return days;
}

/* The rule for an old protocol line. `note` is whatever the line said after
   its frequency.
 *
 * Where the user wrote weekdays in the frequency text, those are the rule:
 * they are the user's own words, and neither old schedule engine read them
 * (the visible one placed "twice weekly" from the protocol's start day, the
 * other always on Monday and Thursday). They are taken only when they can be
 * taken safely (tlWeekdaysInText), never for a pulse, an interval or a monthly
 * line, and for a weekly line only when there are exactly as many as it
 * takes a week: "Twice weekly (Mon)" leaves a dose unplaced, and is read the
 * old way instead. How many it takes is parseFrequency's count unless the
 * text states one: parseFrequency reads "3x weekly" as once a week, and
 * "3x weekly (Mon/Wed/Fri)" names its three days plainly.
 *
 * Days in the note count only for a weekly line whose frequency names none,
 * and under the same conditions: "Twice weekly, Mon AM and Thu PM" is Monday
 * and Thursday. A daily line is never made weekly by its note, which might
 * say anything ("refill on Fridays").
 *
 * Otherwise this follows getDoseDays(), the engine behind every screen the
 * user has been looking at: weekly protocols fall on the start weekday, and
 * the 10-day pulse, which that engine never scheduled, has no rule. */
function tlRuleFromLegacy(med, start, note) {
  var freq = med && med.freq;
  var type = freq && freq.type;
  var named = null;
  /* A schedule the reader could not take, and "as needed", have no rule. The
     old text keeps the user's words, and the screens ask about it. */
  if (type === 'check' || type === 'asneeded') return null;
  if (type !== 'interval' && type !== 'monthly' && type !== 'pulse') {
    /* The days the reader took from the line (rest days ruled out). */
    if (freq.named && freq.days && freq.days.length) named = freq.days.slice();
    else if (type === 'weekly' && note) {
      /* Only the parts of the note that say nothing but days: "Mon AM and Thu
         PM, glute only" places the line; "refill on Fridays" does not. */
      var dayParts = String(note).split(',').filter(function (x) { return typeof tlFreqOnlyDays !== 'function' || tlFreqOnlyDays(x); });
      named = dayParts.length ? tlWeekdaysInText(dayParts.join(', ')) : null;
    }
    var stated = /\b([1-7])\s*(?:x|times)\s*(?:\/|a|per|each)?\s*week/i.exec((med && med.freqStr) || '');
    if (named && type === 'weekly' && named.length !== (stated ? +stated[1] : (freq.count || 1))) named = null;
  }
  if (named && named.length && named.length < 7) return { weekdays: named };
  if (!freq || freq.type === 'daily') return { daily: true };
  if (freq.type === 'interval') return { every: { days: freq.interval || 1 } };
  if (freq.type === 'weekly') {
    var days = (tlFreqDays(freq, start) || [1]).slice().sort(function (a, b) { return a - b; });
    return { weekdays: days };
  }
  if (freq.type === 'monthly') return { monthly: true };
  if (freq.type === 'pulse') return null;
  return { daily: true };
}

/* A rule in words, for a compound's line: "Daily", "Mon · Thu", "Every other
   day". Weekdays read Monday first. */
function tlRuleLabel(rule) {
  if (!rule) return 'No schedule';
  var label;
  if (rule.taper && rule.taper.length) {
    label = 'Taper, ' + rule.taper.length + (rule.per === 'day' ? ' days' : ' weeks');
  } else if (rule.daily) {
    label = 'Daily';
  } else if (rule.every && rule.every.days) {
    var n = rule.every.days;
    label = n === 1 ? 'Daily' : n === 2 ? 'Every other day' : 'Every ' + n + ' days';
  } else if (rule.every && rule.every.weeks) {
    label = rule.every.weeks === 1 ? 'Weekly' : 'Every ' + rule.every.weeks + ' weeks';
  } else if (rule.weekdays && rule.weekdays.length) {
    if (rule.weekdays.length >= 7) label = 'Daily';
    else label = rule.weekdays.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); })
      .map(function (d) { return TL_WEEKDAYS[d]; }).join(' · ');
  } else if (rule.weeklyCount) {
    label = rule.weeklyCount === 2 ? 'Twice weekly' : 'Weekly';
  } else if (rule.monthly) {
    label = 'Monthly';
  } else {
    label = 'Daily';
  }
  if (rule.pattern && rule.pattern.on) label += ', ' + rule.pattern.on + ' on ' + (rule.pattern.off || 0) + ' off';
  return label;
}

/* ---- building the model -------------------------------------------------- */

function tlDefaultSlots() {
  var s = {};
  TL_SLOTS.forEach(function (d) { s[d.key] = { t: d.t, alert: true }; });
  return s;
}

/* A key for a compound: the encyclopedia id when there is one, otherwise the
   name reduced to letters, digits and hyphens. A name with none of those
   ("Сустанон") gets "c-" and a short hash of the name, so its key is its own
   and does not change when lines are reordered; a shared fallback with a
   number by position would hand one compound's key to another. Never
   contains a colon, so it is safe inside a dose id. `taken` is the set of
   keys already used. */
function tlCompoundKey(name, drugId, taken) {
  var text = String(drugId || name || '');
  var base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'c-' + tlHash(text);
  var key = base, n = 2;
  while (taken[key]) key = base + '-' + (n++);
  taken[key] = true;
  return key;
}

/* A short stable hash of a text, in base 36: 32-bit FNV-1a over its UTF-16
   code units. */
function tlHash(text) {
  var h = 0x811c9dc5, s = String(text);
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function tlRouteForMedium(medium) {
  return medium === 'oil' || medium === 'susp' ? 'im'
    : medium === 'aq' ? 'sq'
    : medium === 'oral' ? 'oral'
    : medium === 'topical' ? 'topical'
    : null;
}

/* The time a slot gets when several compounds bring different ones: the time
   most of them share, and the earliest of those on a tie. */
function tlPickSlotTime(mins, fallback) {
  if (!mins.length) return fallback;
  var count = {}, best = null;
  mins.forEach(function (m) { count[m] = (count[m] || 0) + 1; });
  Object.keys(count).forEach(function (k) {
    var m = +k;
    if (best === null || count[m] > count[best] || (count[m] === count[best] && m < best)) best = m;
  });
  return best;
}

/* The model, derived from the old fields: proto (the text), reminderTimes and
   supply. Pure: reads `d`, changes nothing. */
function tlProtocolFromLegacy(d, env) {
  env = env || {};
  var proto = (d && d.proto) || null;
  var out = {
    name: (proto && proto.name) || '',
    start: (proto && proto.start) || null,
    weeks: (proto && proto.weeks) || null,
    pct: (proto && proto.pct) || '',
    created: (proto && proto._created) || null,
    compounds: [],
    slots: tlDefaultSlots(),
    discreet: !!env.discreet,
    derived: true
  };
  if (!proto || !proto.meds) return out;

  var times = (d && d.reminderTimes) || {};
  var supply = (d && d.supply) || {};
  var taken = {}, bySlot = { am: [], mid: [], eve: [], bed: [] };
  /* The same lines parseMeds reads, kept whole for what it drops: everything
     after the third comma, a note the user wrote ("glute only"). */
  var raw = String(proto.meds).split('\n').filter(function (l) { return l.trim(); });
  var fields = function (i) { return typeof tlSplitProtocolLine === 'function' ? tlSplitProtocolLine(raw[i] || '') : String(raw[i] || '').split(','); };

  parseMeds(proto.meds).forEach(function (med, i) {
    /* When the schedule was read from the dose or a later field, the frequency
       field is part of the note too, so it is written back ("IM glute"). */
    var parts = fields(i);
    var drugId = env.resolve ? (env.resolve(med.name) || null) : null;
    var rule = tlRuleFromLegacy(med, proto.start, parts.slice(3).join(', ').trim());
    /* When the schedule was read from the dose or a later field, the
       frequency field is part of the note, so it is written back ("IM
       glute"). Not for a line with no rule: its own words are written back
       as its frequency (tlLegacyFreqText). */
    var note = parts.slice(rule && (med.freqFrom === 'dose' || med.freqFrom === 'rest') ? 2 : 3).join(', ').trim();
    /* Stored times if the user set any, else the defaults the old screens show
       and fire for this frequency. */
    var placed = tlSlotsFromTimes(times[med.name] || getDefaultTimes(med.freq));
    placed.slots.forEach(function (k) { bySlot[k].push(placed.at[k]); });
    var had = supply[med.name];
    var c = {
      key: tlCompoundKey(med.name, drugId, taken),
      name: med.name,
      drugId: drugId,
      dose: tlParseDose(med.dose),
      route: tlRouteForMedium(drugId && env.medium ? env.medium(drugId) : null),
      rule: rule,
      freqText: med.freqStr || '',
      slots: rule ? placed.slots : [],
      inv: null
    };
    if (note) c.note = note;
    if (placed.dropped.length) c.droppedTimes = placed.dropped;
    /* Vials on hand say nothing about doses per vial, so the count starts
       unknown: one vial open, the rest spare, and the user fills in the rest. */
    if (had && had.vials >= 0) {
      c.inv = { per: null, left: null, spare: Math.max(0, Math.floor(had.vials) - 1), since: had.sinceTs || null };
    }
    out.compounds.push(c);
  });

  /* Clamped as a stored protocol's are (tlNormalizeProtocol), so making this
     reading permanent does not move a round. A time is outside its slot only
     when two of a compound's times shared one and the later moved on. */
  TL_SLOT_KEYS.forEach(function (k) {
    out.slots[k].t = tlClampSlotTime(k, tlPickSlotTime(bySlot[k], out.slots[k].t));
  });
  return out;
}

function tlIsObject(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }

/* Fill in whatever a stored protocol is missing, so readers need no guards.
 *
 * A stored protocol can come from a backup made by another build, or edited
 * by hand, so nothing in it is trusted to have its shape: a field of the wrong
 * type is replaced, never read, and a bad compound loses the bad part rather
 * than stopping the read (or the import it is part of).
 *
 * Keys are kept where they can be, since doses already logged carry them: a
 * non-empty key with no colon that no earlier compound holds. A compound
 * without one gets a key made from its name, which never takes a good key
 * held by a later compound. A compound with neither key nor name is dropped;
 * there is nothing to show for it. */
function tlNormalizeProtocol(p) {
  p = tlIsObject(p) ? p : {};
  var out = {
    name: p.name || '', start: p.start || null, weeks: p.weeks || null, pct: p.pct || '',
    created: p.created || null, compounds: [], slots: tlDefaultSlots(), discreet: !!p.discreet
  };
  TL_SLOT_KEYS.forEach(function (k) {
    var s = tlIsObject(p.slots) && p.slots[k];
    if (!tlIsObject(s)) return;
    if (typeof s.t === 'number' && isFinite(s.t)) out.slots[k].t = tlClampSlotTime(k, s.t);
    out.slots[k].alert = s.alert !== false;
  });

  var list = (Array.isArray(p.compounds) ? p.compounds : []).filter(tlIsObject);
  var text = function (x) { return (typeof x === 'string' || typeof x === 'number') && String(x).trim() ? String(x) : ''; };
  var taken = {}, kept = [];
  list.forEach(function (c, i) {
    var key = typeof c.key === 'string' ? c.key : '';
    if (key && key.indexOf(':') < 0 && !taken[key]) { taken[key] = true; kept[i] = key; }
  });
  list.forEach(function (c, i) {
    var name = text(c.name) || text(c.key);
    if (!name) return;
    var copy = {};
    Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
    copy.name = name;
    copy.drugId = c.drugId || null;
    copy.key = kept[i] || tlCompoundKey(name, copy.drugId, taken);
    copy.dose = tlNormalizeDose(c.dose);
    copy.route = typeof c.route === 'string' && c.route ? c.route : null;
    copy.rule = tlIsObject(c.rule) ? c.rule : null;
    copy.slots = Array.isArray(c.slots) ? TL_SLOT_KEYS.filter(function (k) { return c.slots.indexOf(k) >= 0; }) : [];
    copy.inv = tlIsObject(c.inv) ? c.inv : null;
    if (!text(c.note)) delete copy.note;
    else copy.note = String(c.note);
    out.compounds.push(copy);
  });
  return out;
}

/* A stored dose with an amount that is a positive number or null, a unit that
   is text or null, and text. Anything else in it is kept. */
function tlNormalizeDose(dose) {
  if (!tlIsObject(dose)) return tlParseDose(typeof dose === 'string' || typeof dose === 'number' ? dose : '');
  var out = {};
  Object.keys(dose).forEach(function (k) { out[k] = dose[k]; });
  out.amount = typeof dose.amount === 'number' && isFinite(dose.amount) && dose.amount > 0 ? dose.amount : null;
  out.unit = out.amount !== null && typeof dose.unit === 'string' && dose.unit ? dose.unit : null;
  out.text = typeof dose.text === 'string' ? dose.text : (out.amount !== null ? tlDoseText(out) : '');
  return out;
}

/* The protocol for a record: the stored one, or the old fields read as one.
 *
 * There are two discreet switches: the stored protocol's, and this device's
 * old discreet-reminders setting (env.discreet), which only the device
 * knows. Either one hides compound names. A lock screen that shows a name the
 * user asked to hide in one place cannot be taken back. */
function tlProtocol(d, env) {
  if (d && d.protocol && Array.isArray(d.protocol.compounds)) {
    var p = tlNormalizeProtocol(d.protocol);
    p.discreet = p.discreet || !!(env && env.discreet);
    return p;
  }
  return tlProtocolFromLegacy(d, env);
}

function tlCompound(protocol, key) {
  var list = (protocol && protocol.compounds) || [];
  for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
  return null;
}

/* ---- writing ------------------------------------------------------------- */

/* The old fields, written from the model.
 *
 * Once the model is stored it is the truth, but a good deal still reads the
 * old shape: the level chart, the report, the assistant's context, the
 * calendar export, and every older build of the app, which drops keys it does
 * not know when it imports a backup. So each save also rewrites the old
 * fields as the closest thing they can say. They cannot say everything: the
 * old frequency text has no word for "Mon, Wed and Fri", "every two weeks" or
 * "five on, two off", and an older reader takes any text it does not know as
 * daily. So a rule the text cannot say exactly is written as a pulse, which
 * every old reader treats as never due (tlLegacyFreqText): no dose days is a
 * gap the user can see, daily dosing of a fortnightly compound is not.
 *
 * Each line is "name, dose, frequency" and then the compound's note, if it
 * has one, where parseMeds ignores it. Reminder times are keyed by the name
 * exactly as the line has it, since that is how they are looked up. */
function tlProtocolToLegacy(p) {
  var lines = [], reminderTimes = {};
  (p.compounds || []).forEach(function (c) {
    var name = tlLegacyName(c.name), freq = tlLegacyFreqText(c, p.start), slots = c.slots || [];
    var line = name + ', ' + tlLegacyName(tlLegacyDoseText(c.dose)) + ', ' + freq;
    var note = String(c.note || '').replace(/[\r\n]+/g, ' ').trim();
    if (note) line += ', ' + note;
    lines.push(line);
    if (slots.length) {
      reminderTimes[name] = slots.map(function (k) { return p.slots[k].t; })
        .sort(function (a, b) { return a - b; }).map(tlMinToTime);
    } else if (parseFrequency(freq).type !== 'pulse') {
      /* Scheduled, but in no round: no reminder, rather than the defaults. */
      reminderTimes[name] = [];
    }
  });
  return {
    proto: lines.length || p.name ? {
      name: p.name || '', start: p.start || null, weeks: p.weeks || null,
      meds: lines.join('\n'), pct: p.pct || '', _created: p.created || null
    } : null,
    reminderTimes: reminderTimes
  };
}

/* Text as one field of an old line: a comma would start the next field. */
function tlLegacyName(s) {
  return String(s === null || s === undefined ? '' : s).replace(/,/g, ';').replace(/[\r\n]+/g, ' ').trim();
}

/* A dose for an old line: the text the user typed when it says the amount the
   model holds ("250mcg twice daily" is 250 mcg), otherwise the amount itself,
   so the line never states a dose the model does not. */
function tlLegacyDoseText(dose) {
  if (!dose) return '';
  var text = String(dose.text || '');
  if (dose.amount === null || dose.amount === undefined) return text;
  var read = tlParseDose(tlLegacyName(text));
  return read.amount === dose.amount && read.unit === (dose.unit || null) ? text : tlDoseText(dose);
}

/* The frequency an old line gets for a compound, and the only texts used are
   ones the old screens and tlProtocolFromLegacy both read back as the same
   doses on the same days: daily, every other day, every third day, monthly,
   weekly and twice weekly from the start day, and one or two named weekdays.
   Intervals and monthly need the protocol's start, which is where both
   engines count from.
 *
 * Anything else, a null rule included, is written as a pulse, which every
 * reader of the old text treats as never due: "Every 2 weeks (pulse - see
 * app)". The label is dropped where it would read as another frequency
 * ("Daily, 5 on 2 off" says daily first). An unscheduled compound whose own
 * old text was already a pulse keeps that text. */
function tlLegacyFreqText(c, start) {
  var rule = c && c.rule, n = ((c && c.slots) || []).length;
  if (!tlIsObject(rule)) {
    /* The user's own words when the line they make still reads as unscheduled
       (a pulse, "as needed", one to check, also when the schedule was in the
       dose: "Test C, 100mg biweekly, IM"). */
    var own = tlLegacyName(c && c.freqText);
    var line = own ? parseMeds('x, ' + tlLegacyName(tlLegacyDoseText(c && c.dose)) + ', ' + own)[0] : null;
    var ownType = line ? line.freq.type : null;
    return ownType === 'pulse' || ownType === 'check' || ownType === 'asneeded' ? own : tlPulseText('No schedule');
  }
  /* A rule's own start that is the protocol's start says nothing the old
     text does not: the old screens count intervals from the protocol's start. */
  var keys = Object.keys(rule).filter(function (k) {
    return rule[k] !== undefined && rule[k] !== null && !(k === 'start' && rule.start === start);
  });
  var only = function (k) { return keys.length === 1 && keys[0] === k; };
  var every = tlIsObject(rule.every) && Object.keys(rule.every).join() === 'days' ? rule.every.days : null;
  var days = Array.isArray(rule.weekdays) ? rule.weekdays : [];
  var plain = days.every(function (d, i) { return d >= 0 && d <= 6 && d % 1 === 0 && days.indexOf(d) === i; });
  if ((only('daily') && rule.daily === true) || (only('every') && every === 1) || (only('weekdays') && plain && days.length === 7)) {
    return n >= 3 ? n + 'x daily' : n === 2 ? 'Twice daily' : 'Daily';
  }
  if (only('weekdays') && plain && days.length === 1) return 'Weekly (' + tlRuleLabel(rule) + ')';
  if (only('weekdays') && plain && days.length === 2) return 'Twice weekly (' + tlRuleLabel(rule) + ')';
  /* The start day and three days on, as the old week view placed twice weekly.
     Written out as weekdays, so a note after the frequency cannot move them. */
  var fromStart = /^\d{4}-\d{2}-\d{2}$/.test(String(start || '')) ? tlFreqDays({ type: 'weekly', count: 2 }, start) : null;
  if (fromStart) {
    if (only('every') && every === 2) return 'Every other day';
    if (only('every') && every === 3) return 'Every 3 days';
    if ((only('every') && every === 7) || (only('weeklyCount') && rule.weeklyCount === 1)) {
      return 'Weekly (' + TL_WEEKDAYS[fromStart[0]] + ')';
    }
    if (only('weeklyCount') && rule.weeklyCount === 2) return 'Twice weekly (' + tlRuleLabel({ weekdays: fromStart }) + ')';
    if (only('monthly') && rule.monthly === true) return 'Monthly';
  }
  return tlPulseText(tlRuleLabel(rule));
}

function tlPulseText(label) {
  var text = tlLegacyName(label) + ' (pulse - see app)';
  return parseFrequency(text).type === 'pulse' ? text : 'Custom schedule (pulse - see app)';
}

/* Make the derived model the stored one. Idempotent: a record that already
   holds a protocol comes back as it is. The old fields are left in place. */
function tlMigrateRecord(d, env) {
  if (!d) return d;
  if (d.protocol && Array.isArray(d.protocol.compounds)) {
    if (!(d.v >= TL_SCHEMA)) d.v = TL_SCHEMA;
    return d;
  }
  var p = tlProtocolFromLegacy(d, env);
  delete p.derived;
  d.protocol = p;
  d.v = TL_SCHEMA;
  return d;
}

/* Store a protocol: the model, and the old fields rewritten to match it. */
function tlStoreProtocol(d, protocol) {
  var p = tlNormalizeProtocol(protocol);
  var old = tlProtocolToLegacy(p);
  d.protocol = p;
  d.v = TL_SCHEMA;
  d.proto = old.proto;
  d.reminderTimes = old.reminderTimes;
  return d;
}
