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
 * what it means to the old screens: parseMeds, getDefaultTimes, tlFreqDays.
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
 * get no amount. The app never guesses a dose. */
function tlParseDose(text) {
  var raw = String(text === null || text === undefined ? '' : text).trim();
  var out = { amount: null, unit: null, text: raw };
  var m = raw.match(/^(\d+(?:\.\d+)?|\.\d+)\s*(mcg|µg|ug|mg|g|iu|units?|ml|cc|tabs?|tablets?|caps?|capsules?|pills?|drops?|pumps?|clicks?)?(?![\w.,\/%-])(.*)$/i);
  if (!m) return out;
  var rest = m[3] || '';
  if (/\d/.test(rest) || /^\s*(\/|per\b|x\b|to\b)/i.test(rest)) return out;
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

/* Weekdays the user named in words ("Twice weekly (Mon/Thu)"), as 0-6 with
   Sunday 0, or null. "Monthly" names no weekday. */
function tlWeekdaysInText(text) {
  var re = /\b(sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat)(?:day|sday|nesday|rsday|urday)?\b/gi;
  var found = {}, m, any = false;
  while ((m = re.exec(String(text || '')))) {
    found[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(m[1].toLowerCase().slice(0, 3))] = true;
    any = true;
  }
  if (!any) return null;
  var days = [];
  for (var d = 0; d < 7; d++) if (found[d]) days.push(d);
  return days;
}

/* The rule for an old protocol line.
 *
 * Where the user wrote weekdays in the frequency text, those are the rule:
 * they are the user's own words, and neither old schedule engine read them
 * (the visible one placed "twice weekly" from the protocol's start day, the
 * other always on Monday and Thursday).
 *
 * Otherwise this follows getDoseDays(), the engine behind every screen the
 * user has been looking at: weekly protocols fall on the start weekday, and
 * the 10-day pulse, which that engine never scheduled, has no rule. */
function tlRuleFromLegacy(med, start) {
  var freq = med && med.freq;
  var named = tlWeekdaysInText(med && med.freqStr);
  if (named && named.length && named.length < 7 && !(freq && (freq.type === 'interval' || freq.type === 'monthly'))) {
    return { weekdays: named };
  }
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
   name reduced to letters, digits and hyphens. Never contains a colon, so it
   is safe inside a dose id. `taken` is the set of keys already used. */
function tlCompoundKey(name, drugId, taken) {
  var base = String(drugId || name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'compound';
  var key = base, n = 2;
  while (taken[key]) key = base + '-' + (n++);
  taken[key] = true;
  return key;
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

  parseMeds(proto.meds).forEach(function (med) {
    var drugId = env.resolve ? (env.resolve(med.name) || null) : null;
    var rule = tlRuleFromLegacy(med, proto.start);
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
    if (placed.dropped.length) c.droppedTimes = placed.dropped;
    /* Vials on hand say nothing about doses per vial, so the count starts
       unknown: one vial open, the rest spare, and the user fills in the rest. */
    if (had && had.vials >= 0) {
      c.inv = { per: null, left: null, spare: Math.max(0, Math.floor(had.vials) - 1), since: had.sinceTs || null };
    }
    out.compounds.push(c);
  });

  TL_SLOT_KEYS.forEach(function (k) {
    out.slots[k].t = tlPickSlotTime(bySlot[k], out.slots[k].t);
  });
  return out;
}

/* Fill in whatever a stored protocol is missing, so readers need no guards. */
function tlNormalizeProtocol(p) {
  var out = {
    name: p.name || '', start: p.start || null, weeks: p.weeks || null, pct: p.pct || '',
    created: p.created || null, compounds: [], slots: tlDefaultSlots(), discreet: !!p.discreet
  };
  TL_SLOT_KEYS.forEach(function (k) {
    var s = p.slots && p.slots[k];
    if (!s) return;
    if (typeof s.t === 'number' && isFinite(s.t)) out.slots[k].t = ((Math.round(s.t) % 1440) + 1440) % 1440;
    out.slots[k].alert = s.alert !== false;
  });
  (p.compounds || []).forEach(function (c) {
    if (!c || !c.key) return;
    var copy = {};
    Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
    copy.name = c.name || c.key;
    copy.drugId = c.drugId || null;
    copy.dose = c.dose && typeof c.dose === 'object' ? c.dose : tlParseDose(c.dose);
    copy.route = c.route || null;
    copy.rule = c.rule || null;
    copy.slots = TL_SLOT_KEYS.filter(function (k) { return (c.slots || []).indexOf(k) >= 0; });
    copy.inv = c.inv || null;
    out.compounds.push(copy);
  });
  return out;
}

/* The protocol for a record: the stored one, or the old fields read as one. */
function tlProtocol(d, env) {
  if (d && d.protocol && Array.isArray(d.protocol.compounds)) return tlNormalizeProtocol(d.protocol);
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
 * old frequency text has no word for "Mon, Wed and Fri" or "five on, two
 * off", and an older reader will take those as daily. */
function tlProtocolToLegacy(p) {
  var clean = function (s) { return String(s === null || s === undefined ? '' : s).replace(/,/g, ';').replace(/[\r\n]+/g, ' ').trim(); };
  var lines = [], reminderTimes = {};
  (p.compounds || []).forEach(function (c) {
    var rule = c.rule, n = (c.slots || []).length, freq;
    if (!rule) freq = c.freqText || 'No schedule (pulse)';
    else if (rule.daily && !rule.pattern && !rule.taper) freq = n >= 2 ? 'Twice daily' : 'Daily';
    else if (rule.weekdays && !rule.pattern && !rule.taper) {
      freq = rule.weekdays.length === 1 ? 'Weekly (' + tlRuleLabel(rule) + ')'
        : rule.weekdays.length === 2 ? 'Twice weekly (' + tlRuleLabel(rule) + ')'
        : tlRuleLabel(rule);
    }
    else if (rule.every && rule.every.days === 3.5 && !rule.pattern) freq = 'Twice weekly';
    else if (rule.every && rule.every.days === 7 && !rule.pattern) freq = 'Weekly';
    else if (rule.monthly) freq = 'Monthly';
    else freq = tlRuleLabel(rule);
    lines.push(clean(c.name) + ', ' + clean(c.dose ? (c.dose.text || tlDoseText(c.dose)) : '') + ', ' + clean(freq));
    if (n) {
      reminderTimes[c.name] = c.slots.map(function (k) { return p.slots[k].t; })
        .sort(function (a, b) { return a - b; }).map(tlMinToTime);
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
