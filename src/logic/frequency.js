/* Reading the schedule a user typed.
 *
 * The old protocol form is free text, one compound per line: "name, dose,
 * frequency". Everything that schedules from it reads the frequency through
 * parseFrequency(): the week view, the reminders, the calendar export, refill
 * alerts, adherence, and the protocol model when it reads an old protocol.
 * That function used to know a handful of phrases and read everything else as
 * once a day. "Once a week" was scheduled, reminded and counted seven times a
 * week, "3x daily" was read as once a day and "2x per week" as once a week,
 * and even the app's own add-to-stack button wrote phrases it then misread.
 *
 * parseFrequency() now returns tlReadFrequency(). The shapes are the ones the
 * old screens already understand:
 *
 *   { type: 'daily',    times, label, days: null [, at] }
 *   { type: 'interval', interval, label, days: null }        every N days
 *   { type: 'weekly',   count, label, days [, named | run] }
 *   { type: 'monthly',  label, days: null }
 *   { type: 'pulse',    label, days: null }                  never scheduled
 *
 * and two new ones, which every reader treats as never due:
 *
 *   { type: 'asneeded', label, days: null }                  "as needed"
 *   { type: 'check',    label, days: null, text [, ask] }    stated, unreadable
 *
 * `times` is doses a day and may sit on any type. `at` holds the clock times
 * the text named ("AM and PM", "before bed"), one per dose. For a weekly
 * count, `days` is the spread from Monday; the old screens place it from the
 * protocol's start (tlFreqDays), unless `named` (the user named the days) or
 * `run` (back to back: "5 on 2 off").
 *
 * When the text names more than one schedule, the first one named wins:
 * "Weekly SubQ, titrate by 2.5mg every 4 weeks" is weekly. How long to keep
 * going ("for 8 weeks", "final 2 weeks", "weeks 1-4") is not a frequency and
 * is set aside. Text that says nothing about a schedule ("SubQ near injury")
 * is still once a day, labelled with its own words, as it always was. Text
 * that plainly states a schedule this cannot read ("every 4.5 days",
 * "biweekly", which means both every two weeks and twice a week) is a
 * 'check': the screens ask about it instead of guessing.
 */

var TL_FREQ_NUM = { once: 1, one: 1, twice: 2, two: 2, thrice: 3, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

/* N doses a week, as offsets from the first dose day. Two keeps the start day
   and three days on, as the old week view always placed twice weekly. */
var TL_WEEK_SPREAD = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 2, 4, 6], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };

/* Times of day a frequency can name, in day order, each with the reminder
   time it gets. */
var TL_FREQ_AT = [
  { key: 'am', time: '08:00', re: /(?:^|[^a-z])(am|a\.m\.|morning|mornings|qam|on waking)(?![a-z])/g },
  { key: 'mid', time: '12:00', re: /(?:^|[^a-z])(noon|midday|afternoon)(?![a-z])/g },
  { key: 'eve', time: '20:00', re: /(?:^|[^a-z])(pm|p\.m\.|evening|evenings|qpm)(?![a-z])/g },
  { key: 'bed', time: '21:30', re: /(?:^|[^a-z])(pre-bed|bedtime|bed|night|nightly|nights|qhs)(?![a-z])/g }
];

var TL_LETTER_DAY = { su: 0, m: 1, mo: 1, t: 2, tu: 2, w: 3, we: 3, th: 4, r: 4, f: 5, fr: 5, sa: 6 };
var TL_DAY_NAME = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
/* A day's name as tlDayWords reads it (src/logic/protocol.js). */
var TL_FREQ_DAYWORD = 'sun(?:days?)?|mon(?:days?)?|tue(?:s(?:days?)?)?|wed(?:s|nesdays?)?|thu(?:r(?:s(?:days?)?)?)?|fri(?:days?)?|sat(?:urdays?)?';

function tlFreqNum(word) {
  if (/^\d+$/.test(word)) return parseInt(word, 10);
  return TL_FREQ_NUM[word] || null;
}

/* How long a course runs, set aside so that "for 8 weeks" does not read as a
   weekly schedule. */
function tlFreqStripDurations(f) {
  var n = '(?:\\d+(?:\\s*[-\u2013]\\s*\\d+)?|a|an|one|two|three|four|five|six|eight|ten|twelve)';
  var unit = '(?:weeks?|wks?|days?|months?|mos?)';
  return f
    .replace(new RegExp('\\b(?:for|final|last|first|next|over|during|within|after)\\s+(?:the\\s+)?' + n + '\\s*' + unit + '\\b', 'g'), ' ')
    /* "start 2 weeks after", but never "every 3 days before bed". */
    .replace(new RegExp('(\\bevery\\s+)?\\b\\d+(?:\\s*[-\u2013]\\s*\\d+)?\\s*' + unit + '\\s+(?:after|before|later|from|of|post|pre|into|in)\\b', 'g'),
      function (m, every) { return every ? m : ' '; })
    /* "weeks 1-4", "from week 3"; not "once a week 2 hours before". */
    .replace(/\bweeks?\s*\d+\s*(?:[-\u2013]|to|through|thru)\s*\d+\b/g, ' ')
    .replace(/\b(?:in|from|until|till|starting|after|by)\s+week\s*\d+\b/g, ' ')
    .replace(/\bdays?\s*\d+\s*(?:[-\u2013]|to|through|thru)\s*\d+\b/g, ' ')
    .replace(/\bx\s*\d+\s*(?:weeks?|wks?|days?|months?)\b/g, ' ');
}

/* Days written as letters, spelled out so that one reader takes every way of
   writing them: "M/W/F", "T/Th", "M-Th", "M-Sat", "MWF". A letter is a day
   only in a list of days, never on its own. */
function tlFreqSpellDays(f) {
  var compact = { mwf: 'mon/wed/fri', tuth: 'tue/thu', tth: 'tue/thu', mth: 'mon/thu', mtwthf: 'mon-fri' };
  f = f.replace(/(^|[^a-z])(mwf|tuth|tth|mth|mtwthf)(?![a-z])/g, function (m, pre, w) { return pre + compact[w]; });
  var tok = '(?:' + TL_FREQ_DAYWORD + '|su|mo|tu|th|we|fr|sa|m|t|w|r|f)';
  var re = new RegExp('(^|[^a-z0-9.])(' + tok + '(?:\\s*[\\/,&-]\\s*' + tok + ')+)(?![a-z])', 'g');
  return f.replace(re, function (m, pre, list) {
    return pre + list.replace(/[a-z]+/g, function (w) {
      return Object.prototype.hasOwnProperty.call(TL_LETTER_DAY, w) ? TL_DAY_NAME[TL_LETTER_DAY[w]] : w;
    });
  });
}

/* The days the text names to dose on: { days, rest }, or null.
 *
 * Days named after a word that rules them out ("except Sunday", "but Sun",
 * "w/o Sunday", "other than", "rest Sunday") or before "off" ("Sun off",
 * "Sat & Sun off") are rest days, and are never dose days. When the text
 * names only rest days, the dose days are the rest of the week and `rest` is
 * true ("every day but Sunday" is the six others); the caller takes that only
 * for a daily line. Days named after "starting", "from", "until" and the like
 * are when a course starts or stops, not a schedule, and are not read.
 *
 * Ranges and lists are read by tlWeekdaysInText (src/logic/protocol.js), so
 * the old screens and the protocol model take the same days. */
function tlFreqDayRule(f) {
  if (typeof tlWeekdaysInText !== 'function') return null;
  var s = tlFreqSpellDays(f), exclude = [];
  var day = '(?:' + TL_FREQ_DAYWORD + ')';
  s = s.replace(new RegExp('\\b(' + day + '(?:\\s*(?:&|and|,|\\/|\\+|-|–)\\s*' + day + ')*)\\s+off\\b', 'g'), function (m, list) {
    exclude = exclude.concat(tlWeekdaysInText(list) || []);
    return ' ';
  });
  var cut = /\b(except|excluding|but|besides|other than|w\/o|without|skip\w*|minus|apart from|rest(?:ing)?|not|no|start\w*|begin\w*|from|until|till)\b/.exec(s);
  var head = cut ? s.slice(0, cut.index) : s;
  if (cut && !/^(?:start|begin|from|until|till)/.test(cut[1])) {
    exclude = exclude.concat(tlWeekdaysInText(s.slice(cut.index + cut[0].length)) || []);
  }
  var include = (tlWeekdaysInText(head) || []).filter(function (d) { return exclude.indexOf(d) < 0; });
  if (include.length) return { days: include, rest: false };
  if (!exclude.length) return null;
  var rest = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return exclude.indexOf(d) < 0; });
  return rest.length ? { days: rest, rest: true } : null;
}

/* Times of day the text names, in the order it names them. More than one is
   more than one dose only when the text lists them ("AM and PM", "AM +
   250mcg PM", "morning, noon and night"); "AM or PM" is one dose at either.
   Meals are not times here: "before bed, 2h after dinner" is one dose.
   Gives { doses, at }; at is null when the times named are not a list. */
function tlFreqTimesOfDay(f) {
  var found = [];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  /* Clock times are times: "at 2pm" is 14:00, not the evening. */
  f = f.replace(/\b(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/g, function (m, h, mi, ap, at) {
    var hh = +h % 12 + (ap.charAt(0) === 'p' ? 12 : 0);
    if (+h >= 1 && +h <= 12) found.push({ key: 'c' + hh + ':' + (mi || '00'), time: pad(hh) + ':' + (mi || '00'), at: at, end: at + m.length });
    return new Array(m.length + 1).join(' ');
  }).replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, function (m, h, mi, at) {
    found.push({ key: 'c' + +h + ':' + mi, time: pad(+h) + ':' + mi, at: at, end: at + m.length });
    return new Array(m.length + 1).join(' ');
  });
  TL_FREQ_AT.forEach(function (w) {
    var re = new RegExp(w.re.source, 'g'), m;
    while ((m = re.exec(f))) {
      var at = m.index + m[0].length - m[1].length;
      found.push({ key: w.key, time: w.time, at: at, end: at + m[1].length });
    }
  });
  found.sort(function (a, b) { return a.at - b.at; });
  var keys = [];
  found.forEach(function (x) { if (keys.indexOf(x.key) < 0) keys.push(x.key); });
  if (keys.length < 2) return { doses: 1, at: found.length ? [found[0].time] : null };
  var join = /^[\s,]*(?:and|&|\+|\/|plus)?[\s,]*(?:[\d.,]+\s*(?:mcg|mg|iu|units?|ml|g)\s*)?$/;
  for (var i = 1; i < found.length; i++) {
    if (found[i].key !== found[i - 1].key && !join.test(f.slice(found[i - 1].end, found[i].at))) return { doses: 1, at: null };
  }
  var times = [];
  found.forEach(function (x) { if (times.indexOf(x.time) < 0) times.push(x.time); });
  times.sort();
  return { doses: times.length, at: times };
}

/* Every N hours, as doses a day or days between doses. */
function tlFreqHours(h) {
  if (!(h > 0)) return { kind: 'check' };
  if (h <= 24 && 24 % h === 0) return 24 / h > 6 ? { kind: 'check' } : { kind: 'daily', n: 24 / h };
  if (h % 24 === 0) return { kind: 'interval', n: h / 24 };
  return { kind: 'check' };
}

/* The schedule phrases this reads, each with what it means. The first one the
   text names wins. */
function tlFreqHits(g) {
  var hits = [];
  var add = function (re, make) {
    var m = re.exec(g);
    if (m) { var r = make(m); if (r) { r.at = m.index; r.len = m[0].length; hits.push(r); } }
  };
  var count = '(once|twice|thrice|one|two|three|four|five|six|seven|\\d+)';
  var link = '\\s*(?:a\\s+|per\\s+|each\\s+|every\\s+|in\\s+a\\s+|\\/\\s*)?';
  var times = '\\s*(?:x|times)';

  add(/\b(?:prn|as needed|as required|when needed|if needed)\b/, function () { return { kind: 'asneeded' }; });
  add(/\bbi[\s-]*weekly\b/, function () { return { kind: 'check', ask: 'biweekly' }; });
  add(/\b(?:bi[\s-]*monthly|semi[\s-]*monthly)\b/, function () { return { kind: 'check' }; });
  add(/\bsemi[\s-]*weekly\b/, function () { return { kind: 'weekly', n: 2 }; });

  /* Doses a day. */
  add(/\b(b|t|q)\.?i\.?d\b\.?/, function (m) { return { kind: 'daily', n: { b: 2, t: 3, q: 4 }[m[1]] }; });
  add(new RegExp('\\b(once|twice|thrice)' + link + '(?:day|daily)\\b'), function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(new RegExp('\\b' + count + times + link + '(?:day|daily|d)\\b'), function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(/\b(\d+)\s*(?:\/|per\s+)\s*(?:day|d)\b/, function (m) { return { kind: 'daily', n: +m[1] }; });
  add(/\bq\s?(\d+)\s?h(?:rs?|ours?)?\b/, function (m) { return tlFreqHours(+m[1]); });
  add(/\bevery\s+(\d+)\s*(?:hours?|hrs?|h)\b/, function (m) { return tlFreqHours(+m[1]); });
  add(/\b(?:daily|every\s?day|each\s+day|per\s+day|qd|q\.d\.?|nightly|every\s+(?:night|morning|evening)|each\s+(?:night|morning|evening)|qhs|qam|qpm)\b/,
    function () { return { kind: 'daily', n: 1, plain: true }; });

  /* Doses a week. */
  add(new RegExp('\\b(once|twice|thrice)' + link + '(?:weeks?|wks?)\\b'), function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(/\b(once|twice|thrice)\s*weekly\b/, function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(new RegExp('\\b' + count + times + link + '(?:weekly|weeks?|wks?)\\b'), function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(/\b(\d+)\s*(?:\/|per\s+)\s*(?:weeks?|wks?)\b/, function (m) { return { kind: 'weekly', n: +m[1] }; });
  /* "5 days/week", "3 days a week", "7 days per week". */
  add(/\b(\d|one|two|three|four|five|six|seven)\s*days?\s*(?:\/|per\s+|a\s+|each\s+|every\s+|in\s+a\s+)\s*(?:weeks?|wks?)\b/,
    function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(/(?:\be3\.5d\b|\bevery\s+3\.5\s*(?:days?|d)\b)/, function () { return { kind: 'weekly', n: 2 }; });
  add(/\b(?:weekly|every\s+week|each\s+week|per\s+week|qwk|q\s?wk|qw)\b/, function () { return { kind: 'weekly', n: 1, plain: true }; });
  add(/\/\s*(?:week|wk)\b/, function () { return { kind: 'weekly', n: 1, plain: true }; });

  /* Days between doses. */
  add(/\b(?:eod|qod|q\.o\.d\.?|every\s+other\s+day|every\s+(?:second|2nd)\s+day|alternate\s+days|every\s+alternate\s+day)\b/,
    function () { return { kind: 'interval', n: 2 }; });
  add(/\b(?:e3d|every\s+third(?:\s+day)?|every\s+3rd\s+day)\b/, function () { return { kind: 'interval', n: 3 }; });
  add(/\be(\d+)d\b/, function (m) { return { kind: 'interval', n: +m[1] }; });
  add(/\bevery\s+(\d+(?:\.\d+)?)\s*(?:days?|d)\b/, function (m) {
    var n = parseFloat(m[1]);
    if (n === 3.5) return { kind: 'weekly', n: 2 };
    return n % 1 === 0 ? { kind: 'interval', n: n } : { kind: 'check' };
  });
  add(/\b(?:every\s+other\s+week|every\s+(?:second|2nd)\s+week|fortnightly|every\s+fortnight)\b/, function () { return { kind: 'interval', n: 14 }; });
  add(/\bevery\s+(\d+|two|three|four|five|six)\s*(?:weeks?|wks?)\b/, function (m) {
    var n = tlFreqNum(m[1]);
    return n === 1 ? { kind: 'weekly', n: 1 } : { kind: 'interval', n: 7 * n };
  });

  /* Months. */
  add(/\bevery\s+(\d+|two|three|four|five|six)\s*months?\b/, function (m) {
    return tlFreqNum(m[1]) === 1 ? { kind: 'monthly' } : { kind: 'check' };
  });
  add(/\b(?:monthly|once\s+(?:a\s+|per\s+|each\s+|every\s+)?month|every\s+month|each\s+month|per\s+month|(?:1|one)\s*(?:x|times)\s*(?:a\s+|per\s+|\/\s*)?month)\b/,
    function () { return { kind: 'monthly' }; });
  add(new RegExp('\\b(?:(twice|thrice)' + link + '|(two|three|four|\\d+)' + times + link + ')months?\\b'), function (m) {
    return tlFreqNum(m[1] || m[2]) >= 2 ? { kind: 'check' } : null;
  });

  /* Days on and off. A week of them is a weekly run from the start day. */
  add(/\b(\d)\s*(?:days?\s*)?on\s*[,\/&]?\s*(?:and\s+)?(\d)\s*(?:days?\s*)?off\b/, function (m) {
    var on = +m[1], off = +m[2];
    return on > 0 && on + off === 7 ? { kind: 'weekly', n: on, run: true } : { kind: 'check' };
  });

  /* The old reader's pulse: a ten-day course, never scheduled. */
  add(/\b10[\s-]?days?\b/, function () { return { kind: 'pulse' }; });

  hits.sort(function (a, b) { return a.at - b.at || b.len - a.len; });
  return hits;
}

/* Words a schedule is stated in. Text with one of these that matched no
   phrase above states a schedule this cannot read. */
function tlFreqSaysSchedule(g) {
  return /\b(?:every|weekly|monthly|weeks?|wks?|months?)\b|\d\s*(?:x|times)\b/.test(g);
}

function tlFreqCountWord(n) {
  return n === 1 ? 'once' : n === 2 ? 'twice' : n + 'x';
}

function tlFreqDailyLabel(n) {
  return n === 1 ? 'Daily' : n === 2 ? 'Twice daily' : n + 'x daily';
}

function tlFreqDayNames(days) {
  return days.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); })
    .map(function (d) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]; }).join(' · ');
}

function tlFreqWeekly(n, named, run, times) {
  var out = { type: 'weekly', count: n, label: '', days: null };
  if (named) {
    out.days = named.slice();
    out.named = true;
  } else {
    var offs = run ? TL_WEEK_SPREAD[6].slice(0, n) : (TL_WEEK_SPREAD[n] || [0]);
    out.days = offs.map(function (o) { return (1 + o) % 7; });
    if (run && n > 1) out.run = true;
  }
  var base = run ? n + ' on, ' + (7 - n) + ' off' : n === 1 ? 'Weekly' : n === 2 ? 'Twice weekly' : n + 'x weekly';
  if (named) base += ' (' + tlFreqDayNames(named) + ')';
  if (times > 1) { out.times = times; base = tlFreqDailyLabel(times) + ', ' + base.charAt(0).toLowerCase() + base.slice(1); }
  out.label = base;
  return out;
}

function tlFreqCheck(text, ask) {
  var out = { type: 'check', label: ask === 'biweekly' ? 'Biweekly: every 2 weeks or twice a week?' : 'Check this schedule', days: null, text: String(text).trim() };
  if (ask) out.ask = ask;
  return out;
}

/* The reading. With `strict`, text that names no schedule at all gives null
   instead of once a day, so a caller can look elsewhere on the line. */
function tlReadFrequency(text, strict) {
  /* "2*daily" is a count; any other asterisk is a footnote mark ("Weekly*"). */
  var f = text.toLowerCase().replace(/[\u00d7\u2715]/g, 'x').replace(/(\d)\s*\*/g, '$1x').replace(/\*/g, ' ')
    .replace(/\s+/g, ' ').trim();
  if (/pulse/.test(f)) return { type: 'pulse', label: '10-day pulse cycle', days: null };
  var g = ' ' + tlFreqStripDurations(f) + ' ';
  var hits = tlFreqHits(g);
  var base = hits[0] || null;
  var dayRule = tlFreqDayRule(f);
  /* Rest days give the dose days only to a daily line. */
  var named = dayRule && (!dayRule.rest || !base || base.kind === 'daily') ? dayRule.days : null;
  var tod = tlFreqTimesOfDay(f);

  if (base && base.kind === 'check' && base.ask === 'biweekly' && named && named.length === 2) base = { kind: 'weekly', n: 2 };

  if (!base) {
    if (named && named.length) return named.length >= 7 ? { type: 'daily', times: 1, label: 'Daily', days: null } : tlFreqWeekly(named.length, named, false, 1);
    if (strict && tod.doses < 2) return null;
    if (tlFreqSaysSchedule(g)) return tlFreqCheck(text);
    var plain = { type: 'daily', times: tod.doses, label: text, days: null };
    if (tod.at) plain.at = tod.at;
    return plain;
  }

  switch (base.kind) {
    case 'asneeded':
      return { type: 'asneeded', label: 'As needed', days: null };
    case 'check':
      return tlFreqCheck(text, base.ask);
    case 'pulse':
      return { type: 'pulse', label: '10-day pulse cycle', days: null };
    case 'monthly':
      return { type: 'monthly', label: 'Monthly', days: null };
    case 'interval':
      if (!(base.n >= 1)) return tlFreqCheck(text);
      if (base.n === 1) return { type: 'daily', times: 1, label: 'Daily', days: null };
      return { type: 'interval', interval: base.n,
        label: base.n === 2 ? 'Every other day' : base.n % 7 === 0 && base.n > 7 ? 'Every ' + base.n / 7 + ' weeks' : 'Every ' + base.n + ' days', days: null };
    case 'weekly':
      if (!(base.n >= 1)) return tlFreqCheck(text);
      if (base.n >= 7) {
        return base.n % 7 === 0 ? { type: 'daily', times: base.n / 7, label: tlFreqDailyLabel(base.n / 7), days: null } : tlFreqCheck(text);
      }
      return tlFreqWeekly(base.n, !base.run && named && named.length === base.n ? named : null, base.run, 1);
    default: {
      var n = base.n || 1;
      if (!(n >= 1) || n > 6) return tlFreqCheck(text);
      if (named && named.length && named.length < 7) return tlFreqWeekly(named.length, named, false, n);
      if (n === 1 && tod.doses >= 2) n = tod.doses;
      var out = { type: 'daily', times: n, label: tlFreqDailyLabel(n), days: null };
      if (tod.at && tod.at.length === n) out.at = tod.at;
      return out;
    }
  }
}

/* Whether a field of a line says nothing but days and times of day: "Wed",
   "Mon AM and Thu PM". "Refill on Fridays" says more, and does not move the
   dose to Friday. */
function tlFreqOnlyDays(text) {
  var s = tlFreqSpellDays(String(text || '').toLowerCase());
  var r = tlFreqDayRule(s);
  if (!r || r.rest) return false;
  s = s.replace(new RegExp('\\b(?:' + TL_FREQ_DAYWORD + ')\\b', 'g'), ' ')
    .replace(/\b(?:am|pm|morning|evening|night|noon|bedtime|and|only|to|through|thru)\b/g, ' ')
    .replace(/a\.m\.|p\.m\./g, ' ');
  return !/[a-z0-9]/.test(s);
}

/* Reminder times for N doses a day, spread through the waking day. */
function tlFreqDoseTimes(n) {
  return n <= 1 ? ['08:00'] : n === 2 ? ['08:00', '21:00'] : n === 3 ? ['08:00', '14:00', '20:00']
    : n === 4 ? ['08:00', '12:00', '16:00', '20:00'] : n === 5 ? ['07:00', '10:30', '14:00', '17:30', '21:00']
    : ['07:00', '10:00', '13:00', '16:00', '19:00', '22:00'];
}

/* Whether a reading puts doses on any day at all. */
function tlFreqScheduled(freq) {
  var t = freq && freq.type;
  return t === 'daily' || t === 'interval' || t === 'weekly' || t === 'monthly';
}

/* A protocol line split into its fields. Commas separate the fields, except a
   comma that groups the thousands of a number: "Sema, 1,000mcg, weekly" is a
   name, a dose and a frequency, not "1" and "000mcg". */
function tlSplitProtocolLine(line) {
  var s = String(line), parts = [], cur = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    /* "1,000mcg", but not "TB-500,250mcg": the field so far must be a number. */
    if (ch === ',' && /^\s*\d{1,3}(?:,\d{3})*$/.test(cur) && /^\d{3}(?!\d)/.test(s.slice(i + 1))) { cur += ch; continue; }
    if (ch === ',') { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur.trim());
  return parts;
}

/* ---- what changed for this user ------------------------------------------- */

/* The reading before this change, kept only to tell a user what now reads
   differently. Copied as it was; do not use it to schedule anything. */
function tlReadFrequencyBefore(freqStr) {
  var f = freqStr.toLowerCase().trim();
  if (f.includes('twice daily') || f.includes('2x daily') || f.includes('bid')) return { type: 'daily', times: 2, label: 'Twice daily', days: null };
  if (f.includes('daily') || f.includes('once daily') || f.includes('every day') || f.includes('qd')) return { type: 'daily', times: 1, label: 'Daily', days: null };
  if (f.includes('eod') || f.includes('every other day') || f.includes('every 2 day')) return { type: 'interval', interval: 2, label: 'Every other day', days: null };
  if (f.includes('e3d') || f.includes('every 3 day') || f.includes('every third')) return { type: 'interval', interval: 3, label: 'Every 3 days', days: null };
  if (f.includes('e3.5d') || f.includes('twice week') || f.includes('2x week') || f.includes('2x/week') || f.includes('biweekly')) return { type: 'weekly', count: 2, label: 'Twice weekly', days: [1, 4] };
  if (f.includes('weekly') || f.includes('once week') || f.includes('1x week') || f.includes('per week')) return { type: 'weekly', count: 1, label: 'Weekly', days: [1] };
  if (f.includes('monthly') || f.includes('once month')) return { type: 'monthly', label: 'Monthly', days: null };
  if (f.includes('10 day') || f.includes('10-day') || f.includes('pulse')) return { type: 'pulse', label: '10-day pulse cycle', days: null };
  return { type: 'daily', times: 1, label: freqStr, days: null };
}

/* A reading in words, for the note: "twice a day", "once a week (Mon)". */
function tlDescribeFreq(freq, start) {
  if (!freq) return 'no schedule';
  var n = freq.times || 1;
  var perDay = n === 1 ? '' : (n === 2 ? 'twice' : n + ' times') + ' a day, ';
  switch (freq.type) {
    case 'daily': return (n === 1 ? 'once' : n === 2 ? 'twice' : n + ' times') + ' a day';
    case 'interval': return perDay + 'every ' + (freq.interval === 2 ? 'other day' : freq.interval + ' days');
    case 'weekly': {
      var days = (typeof tlFreqDays === 'function' ? tlFreqDays(freq, start) : null) || freq.days || [];
      var c = freq.count || 1;
      return perDay + (c === 1 ? 'once' : c === 2 ? 'twice' : c + ' times') + ' a week' + (days.length ? ' (' + tlFreqDayNames(days) + ')' : '');
    }
    case 'monthly': return 'once a month';
    case 'asneeded': return 'as needed, with no reminders';
    case 'check': return 'not scheduled until you check it';
    default: return 'not scheduled';
  }
}

/* The lines of a protocol whose schedule or reminder times read differently
   now, as { name, before, after }. Reminder times the user set themselves are
   theirs and do not change, so only lines without them compare times. */
function tlScheduleChanges(proto, reminderTimes) {
  if (!proto || !proto.meds) return [];
  var now = parseMeds(proto.meds);
  var lines = String(proto.meds).split('\n').filter(function (l) { return l.trim(); });
  var custom = reminderTimes || {};
  var out = [];
  lines.forEach(function (line, i) {
    var med = now[i];
    if (!med) return;
    var oldParts = line.split(',').map(function (s) { return s.trim(); });
    var oldFreq = tlReadFrequencyBefore(oldParts[2] || 'Daily');
    var when = function (freq) {
      if (!tlFreqScheduled(freq) || custom[med.name]) return '';
      var t = getDefaultTimes(freq);
      return t.length ? ' at ' + t.join(' and ') : '';
    };
    var before = tlDescribeFreq(oldFreq, proto.start) + (tlFreqScheduled(oldFreq) ? when(oldFreq) : '');
    var after = tlDescribeFreq(med.freq, proto.start) + (tlFreqScheduled(med.freq) ? when(med.freq) : '');
    if (before !== after) out.push({ name: med.name, before: before, after: after });
  });
  return out;
}
