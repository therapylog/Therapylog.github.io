/* Setting up a protocol: onboarding (screen 3d) now, the Protocol screen (6a)
 * next.
 *
 * The screens collect a compound the way the user thinks of it: a name, an
 * amount and a unit, how often, how it is taken, and which of the four rounds
 * it is in. These functions turn that into the protocol model (protocol.js)
 * and back, so the screens hold no rules of their own about what a protocol
 * is. Nothing here suggests a dose: an amount is whatever was typed, or none.
 */

/* Units the dose field offers. tlParseDose reads the same ones from text. */
var TL_UNITS = ['mg', 'mcg', 'IU', 'mL', 'units', 'tab', 'cap', 'drop', 'click', 'pump'];

/* What onboarding asks "What are you tracking?" about. The keys are stored in
   settings.focus; Home (2b) reads them, and 'hrt' shows Health's Cycle
   segment. */
var TL_FOCUS = [
  { key: 'trt', label: 'TRT', icon: 'drop' },
  { key: 'peptides', label: 'Peptides', icon: 'dna' },
  { key: 'gh', label: 'Growth hormone', icon: 'arrows-out-line-vertical' },
  { key: 'cycle', label: 'Cycle and PCT', icon: 'arrows-clockwise' },
  { key: 'glp1', label: 'GLP-1', icon: 'chart-line-down' },
  { key: 'hrt', label: 'HRT', icon: 'gender-female' }
];

/* How a compound is taken. 'other' stands for any route the map has no sites
   for: topical, nasal, and the rest. */
var TL_ROUTES_TAKEN = [
  { value: 'im', label: 'IM' },
  { value: 'sq', label: 'SubQ' },
  { value: 'oral', label: 'Oral' },
  { value: 'other', label: 'Other' }
];

/* ---- how often ----------------------------------------------------------- */

/* A rule, as the Repeat control shows it:
 *
 *   { mode: 'daily' }
 *   { mode: 'days', days: [1, 4] }        weekdays, Sunday 0
 *   { mode: 'every', n: 3 }                every n days, n from 2
 *   { mode: 'keep', label }                a rule the control has no words
 *                                          for (a taper, an on/off pattern,
 *                                          monthly, every 3.5 days, none),
 *                                          kept as it is unless the user
 *                                          picks something else
 */
function tlRepeatOf(rule) {
  if (rule && !rule.taper && !rule.pattern) {
    if (rule.daily) return { mode: 'daily' };
    if (rule.every && rule.every.days === 1) return { mode: 'daily' };
    if (rule.weekdays && rule.weekdays.length >= 7) return { mode: 'daily' };
    if (rule.weekdays && rule.weekdays.length) {
      return { mode: 'days', days: rule.weekdays.slice().sort(function (a, b) { return a - b; }) };
    }
    if (rule.every && Number.isInteger(rule.every.days) && rule.every.days >= 2) return { mode: 'every', n: rule.every.days };
  }
  return { mode: 'keep', label: tlRuleLabel(rule) };
}

var TL_EVERY_MAX = 60;

/* The rule for a Repeat setting. `prev` is the compound's rule before the
   edit, and `today` (YYYY-MM-DD) the day an interval counts from when it is
   new. An interval that did not change keeps the day it counted from, so
   editing the dose does not move every future dose day. */
function tlRuleOfRepeat(repeat, prev, today) {
  if (!repeat || repeat.mode === 'keep') return prev || null;
  if (repeat.mode === 'daily') return { daily: true };
  if (repeat.mode === 'days') {
    var seen = {}, days = [];
    (repeat.days || []).forEach(function (d) {
      d = +d;
      if (Number.isInteger(d) && d >= 0 && d <= 6 && !seen[d]) { seen[d] = true; days.push(d); }
    });
    days.sort(function (a, b) { return a - b; });
    return days.length >= 7 ? { daily: true } : { weekdays: days };
  }
  if (repeat.mode === 'every') {
    var n = Math.round(+repeat.n);
    var same = prev && prev.every && prev.every.days === n && !prev.taper && !prev.pattern;
    var rule = { every: { days: n } };
    var start = same ? prev.start : today;
    if (start) rule.start = start;
    return rule;
  }
  return prev || null;
}

/* ---- the dose ------------------------------------------------------------ */

/* An amount as typed ("0.5", "250", ",5" on a comma keyboard), or null. */
function tlAmountOf(text) {
  var s = String(text === null || text === undefined ? '' : text).trim().replace(',', '.');
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  var n = parseFloat(s);
  return isFinite(n) && n > 0 ? n : null;
}

/* The dose for an amount and unit. A blank amount keeps a dose that was only
   ever text (an old protocol line such as "250-500mcg", which has no single
   amount) rather than erase it; it clears one that had an amount. */
function tlDoseOfInput(amountText, unit, prev) {
  var blank = String(amountText === null || amountText === undefined ? '' : amountText).trim() === '';
  if (blank) {
    if (prev && (prev.amount === null || prev.amount === undefined) && prev.text) return prev;
    return { amount: null, unit: null, text: '' };
  }
  var amount = tlAmountOf(amountText);
  if (amount === null) return null;
  var u = TL_UNITS.indexOf(unit) >= 0 ? unit : null;
  return { amount: amount, unit: u, text: String(amount) + (u ? ' ' + u : '') };
}

/* ---- one compound -------------------------------------------------------- */

/* What is wrong with a compound form, in words for the form, or null.
   fields: { name, amount, unit, repeat, route, slots } */
function tlCompoundProblem(fields) {
  if (!String(fields.name || '').trim()) return 'Give it a name.';
  if (String(fields.amount === null || fields.amount === undefined ? '' : fields.amount).trim() !== '' && tlAmountOf(fields.amount) === null) {
    return 'The dose has to be a number, like 0.5 or 200.';
  }
  var r = fields.repeat || {};
  if (r.mode === 'days' && !(r.days || []).length) return 'Pick at least one day.';
  if (r.mode === 'every') {
    var n = +r.n;
    if (!Number.isInteger(n) || n < 2 || n > TL_EVERY_MAX) return 'Every 2 to ' + TL_EVERY_MAX + ' days.';
  }
  return null;
}

/* A compound from the form. `prev` is the compound being edited, or null for
   a new one; `protocol` is the protocol it belongs to, for a key no other
   compound has. An edited compound keeps its key whatever its new name, since
   the dose log refers to it by key. */
function tlCompoundOfFields(fields, prev, protocol, env, today) {
  env = env || {};
  var name = String(fields.name || '').trim().replace(/\s+/g, ' ');
  var drugId = env.resolve ? (env.resolve(name) || null) : null;
  var out = {};
  if (prev) Object.keys(prev).forEach(function (k) { out[k] = prev[k]; });

  if (!prev) {
    var taken = {};
    ((protocol && protocol.compounds) || []).forEach(function (c) { taken[c.key] = true; });
    out.key = tlCompoundKey(name, drugId, taken);
  }
  out.name = name;
  out.drugId = drugId;
  out.dose = tlDoseOfInput(fields.amount, fields.unit, prev && prev.dose) || { amount: null, unit: null, text: '' };

  var route = fields.route;
  if (route === 'im' || route === 'sq' || route === 'oral') out.route = route;
  else if (route === 'other') out.route = prev && prev.route && ['im', 'sq', 'oral'].indexOf(prev.route) < 0 ? prev.route : null;
  else out.route = prev ? (prev.route || null) : null;

  var repeat = fields.repeat || { mode: 'daily' };
  out.rule = tlRuleOfRepeat(repeat, prev && prev.rule, today);
  /* The old frequency text describes the old rule; it goes once the rule is
     the user's own choice. */
  if (repeat.mode !== 'keep') delete out.freqText;

  out.slots = TL_SLOT_KEYS.filter(function (k) { return (fields.slots || []).indexOf(k) >= 0; });
  out.inv = prev ? (prev.inv || null) : null;
  return out;
}

/* How a compound reads in a list: "200 mg · Mon · Thu". */
function tlCompoundMeta(c) {
  var parts = [];
  var dose = tlDoseText(c.dose);
  parts.push(dose || 'No dose set');
  parts.push(tlRuleLabel(c.rule));
  return parts.join(' · ');
}

/* The route for the form: one of TL_ROUTES_TAKEN's values. */
function tlRouteChoice(route) {
  return route === 'im' || route === 'sq' || route === 'oral' ? route : route ? 'other' : null;
}

/* ---- the rounds ---------------------------------------------------------- */

/* The rounds a protocol makes, whatever the day: every slot that holds a
   compound with a schedule. For onboarding's last step and Settings, where
   the question is "which alerts will I get", not "what is due today".

     [{ slot, label, icon, t, time, alert, names }]   sorted by time */
function tlSetupRounds(protocol) {
  if (!protocol) return [];
  return TL_SLOT_KEYS.map(function (k) {
    var names = (protocol.compounds || []).filter(function (c) {
      return c.rule && (c.slots || []).indexOf(k) >= 0;
    }).map(function (c) { return c.name; });
    var def = tlSlotDef(k), s = protocol.slots[k];
    return { slot: k, label: def.label, icon: def.icon, t: s.t, time: tlMinToTime(s.t), alert: s.alert !== false, names: names };
  }).filter(function (r) { return r.names.length; })
    .sort(function (a, b) { return a.t - b.t; });
}

var TL_SLOT_STEP = 15;

/* Move a slot's time by `steps` quarter hours. Wraps past midnight, so a
   bedtime round can be at 00:30. Returns the new time in minutes. */
function tlShiftSlot(protocol, slot, steps) {
  var s = protocol.slots[slot];
  /* A time carried over from an old protocol (07:10) first snaps to the
     quarter hour in the direction of the step: 07:15 later, 07:00 earlier. */
  var base = steps > 0 ? Math.floor(s.t / TL_SLOT_STEP) : Math.ceil(s.t / TL_SLOT_STEP);
  var t = (base + steps) * TL_SLOT_STEP;
  s.t = ((t % 1440) + 1440) % 1440;
  return s.t;
}

/* ---- finishing ----------------------------------------------------------- */

/* Write what onboarding collected into the record.
 *
 *   setup = { focus: ['trt', ...], figure: 'male' | 'female', protocol }
 *
 * The protocol is stored (with the old fields rewritten to match, so the old
 * screens agree) when it has a compound, or when the record already had a
 * protocol the user has just emptied. An empty protocol on a new record is
 * not stored, so that restoring a backup afterwards can still bring one in. */
function tlFinishSetup(d, setup, nowIso) {
  setup = setup || {};
  tlSetSetting(d, 'focus', (setup.focus || []).filter(function (k) {
    return TL_FOCUS.some(function (f) { return f.key === k; });
  }));
  if (setup.figure === 'male' || setup.figure === 'female') tlSetSetting(d, 'figure', setup.figure);
  var p = setup.protocol;
  var had = !!(d.proto || (d.protocol && Array.isArray(d.protocol.compounds)));
  if (p && ((p.compounds || []).length || had)) tlSaveProtocol(d, p, nowIso);
  return d;
}

/* Store a protocol edited through the new screens: the model, and the old
   fields rewritten to match. A protocol stored for the first time gets the
   start, created and name the old screens expect. */
function tlSaveProtocol(d, p, nowIso) {
  if (!p.created) p.created = nowIso;
  if (!p.start) p.start = tlDayKey(nowIso);
  /* The new screens do not ask for a name; the old screens print one. */
  if (!p.name) p.name = 'My protocol';
  delete p.derived;
  tlStoreProtocol(d, p);
  return d;
}
