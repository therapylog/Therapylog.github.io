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
  { key: 'am', time: '08:00', re: /(?:^|[^a-z])(am|a\.m\.|morning|mornings|qam|waking)(?![a-z])/g },
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
function tlFreqStripCourse(f) {
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
    .replace(/\bx\s*\d+\s*(?:weeks?|wks?|days?|months?)\b(?!\s*(?:\/|per\b|a\b|each\b)\s*(?:weeks?|wks?)\b)/g, ' ');
}

/* Notes and other phases, set aside. Each piece set aside goes into `cut`, so
   the reader can tell when one held a schedule (tlFreqCutSchedule). */
function tlFreqStripNotes(f, cut) {
  var keep = function (m) { if (cut) cut.push(m); return ' '; };
  return f
    /* A note about something else: "titrate by 2.5mg every 4 weeks", "bloods
       every 8 weeks", "increase dose monthly". */
    .replace(/\b(?:titrat\w*|increas\w*|decreas\w*|bloods?|bloodwork|labs?|recheck\w*|refill\w*|reorder\w*|re-?order\w*|vials?|reconstitut\w*|mix\w*)\b[^,;()]*/g, keep)
    /* An optional extra dose: "extra AM dose if needed". */
    .replace(/\b(?:extra|additional|another|add|2nd|second|optional)\b[^,;()]*?\b(?:as|if|when)\s+(?:needed|required)\b/g, keep)
    /* What comes after this phase, or instead of it, or before it: "daily for
       2 weeks then 2x weekly", "daily or 3x/week", "daily (was 2x/wk)",
       "daily (switched from 2x weekly)". The phase named first is the
       schedule. */
    .replace(new RegExp('\\b(?:then|until|till|or|was|were|switched|previously|formerly|prior)\\b(?!\\s+(?:[\\d.,\\/]+\\s*[a-z]*\\s+)?(?:am|pm|a\\.m\\.|p\\.m\\.|morning|evening|night|noon|bed|bedtime|' + TL_FREQ_DAYWORD + ')\\b).*$'), keep);
}

function tlFreqStripDurations(f) {
  return tlFreqStripNotes(tlFreqStripCourse(f));
}

/* Whether text set aside states a schedule: a count, a pattern, or one to
   check. Then setting it aside was a guess, and the reader keeps the old
   reading instead: "SubQ or IM twice weekly", "2.5mg for 4 weeks then 5mg
   weekly", "titrating weekly", "(2x weekly with Test)". An "as needed", a
   ten-day course or a schedule to check ("TSH every 6 months") in it is not
   one. */
function tlFreqCutSchedule(cut) {
  return cut.some(function (c) {
    return tlFreqHits(' ' + tlFreqStripCourse(c) + ' ').some(function (h) { return h.kind !== 'asneeded' && h.kind !== 'pulse' && h.kind !== 'check'; });
  });
}

/* Days written as letters, spelled out so that one reader takes every way of
   writing them: "M/W/F", "T/Th", "M-Th", "M-Sat", "MWF". A letter is a day
   only in a list of days, never on its own. */
function tlFreqSpellDays(f) {
  f = f.replace(/\b(?:every\s+)?week[\s-]?days?\b/g, 'mon-fri').replace(/\bweek[\s-]?ends?\b/g, 'sat/sun');
  /* "M W F", "Tu Th": letters with only spaces between, when that is all the
     text says. */
  if (/^(?:(?:su|mo|tu|th|we|fr|sa|m|t|w|r|f)\s+)+(?:su|mo|tu|th|we|fr|sa|m|t|w|r|f)$/.test(f.trim())) f = f.trim().replace(/\s+/g, '/');
  /* "mth" is a month, not Mon/Thu. */
  f = f.replace(/\bmths?\b/g, 'month');
  var compact = { mwf: 'mon/wed/fri', tuth: 'tue/thu', tth: 'tue/thu', mtwthf: 'mon-fri' };
  f = f.replace(/(^|[^a-z])(mwf|tuth|tth|mtwthf)(?![a-z])/g, function (m, pre, w) { return pre + compact[w]; });
  var tok = '(?:' + TL_FREQ_DAYWORD + '|su|mo|tu|th|we|fr|sa|m|t|w|r|f)';
  var re = new RegExp('(^|[^a-z0-9.])(' + tok + '(?:\\s*[\\/,&-]\\s*' + tok + ')+)(?![a-z])', 'g');
  return f.replace(re, function (m, pre, list) {
    /* "w/f" is "with food". */
    /* "w/f", "w/T", "w/o": "with", not days. */
    if (/^w\s*\/\s*[a-z]+$/.test(list) && !/^w\s*\/\s*(?:mon|tue|wed|thu|fri|sat|sun)/.test(list)) return m;
    /* "M/T/W/T/F", "T/T": a T after W or after another T is Thursday. */
    var seenT = false, seenW = false;
    return pre + list.replace(/[a-z]+/g, function (w) {
      if (w === 't') { var thu = seenT || seenW; seenT = true; return thu ? 'thu' : 'tue'; }
      if (w === 'w' || w === 'we' || /^wed/.test(w)) seenW = true;
      if (/^tu/.test(w)) seenT = true;
      return Object.prototype.hasOwnProperty.call(TL_LETTER_DAY, w) ? TL_DAY_NAME[TL_LETTER_DAY[w]] : w;
    });
  });
}

/* Whether the text says nothing but a schedule: days, rest days, times of
   day, counts, amounts, a route or a site. Only then are the days it names
   taken as dose days. "Daily before sun exposure", "daily (labs Monday)" and
   "Weekly (refill on Fridays)" say more, and their day words are notes. */
function tlFreqClean(f, hits) {
  var day = '(?:' + TL_FREQ_DAYWORD + ')';
  var s = ' ' + f + ' ';
  /* An amount beside days says how much on those days ("100mcg daily,
     150mcg Sundays", "1.5 tabs Mon/Wed/Fri"), not which days to dose. */
  var amount = '[\\d.,\\/]+\\s*(?:mcg|mg|iu|units?|ml|cc|g|tabs?|tablets?|caps?|capsules?|pills?|drops?|sprays?|clicks?)\\b';
  if (new RegExp(amount + '\\s*(?:on\\s+|each\\s+|every\\s+)?(?:\\(\\s*)?' + day + '\\b').test(s) ||
      new RegExp('\\b' + day + '\\s*[:=\\-]?\\s*' + amount).test(s)) return false;
  /* Hits are found in ' ' + f + ' ', which s is. */
  (hits || []).forEach(function (h) { s = s.slice(0, h.at) + new Array(h.len + 1).join(' ') + s.slice(h.at + h.len); });
  s = s.replace(new RegExp('\\b' + day + '\\s*(?:through|thru|to|until|till)\\s*' + day + '\\b', 'g'), ' ')
    .replace(new RegExp('\\b' + day + '\\b', 'g'), ' ')
    .replace(/\b\d{1,2}(?:[:.][0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?)(?![a-z])/g, ' ')
    .replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g, ' ')
    .replace(/[\d.,]+\s*(?:mcg|mg|iu|units?|ml|cc|g|tabs?|caps?|pills?|drops?|sprays?|clicks?)\b/g, ' ')
    .replace(/\b(?:except|excluding|but|besides|other|than|w\/o|without|skip\w*|minus|apart|from|rest(?:ing)?|not|no|off|only|start\w*|begin\w*|until|till|on|at|in|the|a|an|and|or|then|every|each|per|x|times?|once|twice|thrice|one|two|three|four|five|six|seven|daily|weekly|monthly|nightly|days?|weeks?|wks?|am|pm|a\.m\.|p\.m\.|mornings?|evenings?|nights?|noon|midday|afternoon|bed|bedtime|pre-bed|before|after|upon|waking|subq|sq|sc|sub-q|im|iv|oral|orally|topical|topically|injections?|inject|inj|pins?|shots?|doses?|split|fasted|glute|glutes|delt|delts|quad|quads|ventroglute|belly|abdomen|stomach|thigh|arm|left|right|l|r|alternating|alternate|site|sites)\b/g, ' ')
    .replace(/\d+/g, ' ');
  return !/[a-z]/.test(s);
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
  var s = tlFreqSpellDays(f).replace(/\b\d+\s*(?:d|days?)?\s*-?\s*on\s*[,\/&]?\s*(?:and\s+)?\d+\s*(?:d|days?)?\s*-?\s*off\b/g, ' '), exclude = [];
  var day = '(?:' + TL_FREQ_DAYWORD + ')';
  /* "Sun off", "Sat & Sun off", "Sun rest", "Sundays skipped", "Sun: rest",
     "Sunday = rest day", "Sun - off", "Sunday day off", "Sunday: no dose",
     and a range: "Sat-Sun off", "Fri to Sat off", "(Sat - Sun off)". A day
     that ends a range before it is not one of them: in "Mon-Sat - Sun off"
     the dash after Saturday only sets Sunday apart. */
  s = s.replace(new RegExp('(\\b' + day + '(?:\\s+(?:to|through|thru|until|till)\\s+|\\s*[-–]\\s*))?\\b(' + day + '(?:\\s*(?:&|and|,|\\/|\\+|·)\\s*' + day + ')*)\\s*[(:=\\-–]?\\s*(?:off|rest(?:\\s+days?)?|skip(?:ped)?|days?\\s+off|no\\s+doses?|none)\\b\\)?', 'g'),
    function (m, range, list, at, str) {
      var keep = '';
      /* "M/W/F, weekends off", "Mon-Fri, weekends off": a comma after a
         list or range of dose days ends them. Items of one day each before
         the last are rest days too: "Sat, Sun off", "Wed, Sat & Sun off". */
      var items = list.split(/\s*,\s*/);
      if (items.length > 1 && (range || items.slice(0, -1).some(function (x) { return /[&\/+·]|\band\b/.test(x); }))) {
        keep = (range || '') + items.slice(0, -1).join(', ') + ', ';
        list = items[items.length - 1];
        range = null;
      }
      if (range) {
        var first = /^\S+/.exec(list)[0];
        if (new RegExp('\\b' + day + '\\s*(?:[-–]|to|through|thru)\\s*$').test(str.slice(0, at))) {
          keep += range.replace(/[\s\-–]+$/, '') + ' ';
        } else {
          exclude = exclude.concat(tlWeekdaysInText(range.replace(/\s*[-–]\s*$/, '-') + first) || []);
          list = list.slice(first.length);
        }
      }
      exclude = exclude.concat(tlWeekdaysInText(list) || []);
      return keep + ' ';
    });
  var cut = /\b(except|excluding|but|besides|other than|w\/o|without|skip\w*|minus|apart from|rest(?:ing)?|not|no|start\w*|begin\w*|from|until|till)\b/.exec(s);
  var head = cut ? s.slice(0, cut.index) : s;
  /* A rest word this has not placed ("Sundays are off", "Sunday not") leaves
     it unsure which days are rest days, so it names none. */
  if (/\b(?:off|skip\w*|rest\w*|break|holiday|none|pause\w*)\b/.test(head)) return null;
  if (cut && !/^(?:start|begin|from|until|till)/.test(cut[1])) {
    var after = tlWeekdaysInText(s.slice(cut.index + cut[0].length)) || [];
    /* "Sunday not", "Sunday - no": the day before the word is the one ruled
       out, which this does not read. */
    if (!after.length && new RegExp('\\b' + day + '\\s*[:=\\-–]?\\s*$').test(head)) return null;
    exclude = exclude.concat(after);
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
  /* A time the text rules out is no reminder time: "not at night", "avoid
     taking at night", "not PM". */
  f = f.replace(/\b(?:not|no|avoid\w*|never|don'?t|do not)\b(?:\s+\w+){0,3}?\s+(?:at\s+)?(?:night|nights|bed|bedtime|pm|p\.m\.|evening|evenings|am|a\.m\.|morning|mornings)\b/g,
    function (m) { return new Array(m.length + 1).join(' '); });
  /* A deadline is no reminder time either: "before 2pm", "by noon", "no later
     than 3pm", "AM before noon". */
  f = f.replace(/\b(?:before|by|until|till|no\s+later\s+than|not\s+after|prior\s+to)\s+(?:noon|midday|lunch|\d{1,2}(?:[:.][0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?)(?![a-z])|(?:[01]?\d|2[0-3]):[0-5]\d\b)/g,
    function (m) { return new Array(m.length + 1).join(' '); });
  /* Clock times are times: "at 2pm" is 14:00, not the evening. A number that
     ends an amount ("12.5 AM", "1/2 PM") is not an hour, nor is a small
     count set apart from AM or PM ("1 AM 1 PM" is a tablet each time). */
  f = f.replace(/(\d{1,2})(?:([:.])([0-5]\d))?(\s*)(a\.?m\.?|p\.?m\.?)(?![a-z])/g, function (m, h, sep, mi, sp, ap, at, str) {
    var before = str.slice(Math.max(0, at - 2), at);
    if (/[\d.]$/.test(before) || /\d\/$/.test(before)) return m;
    /* "1 AM 1 PM", "2 AM, 2 PM": a tablet each time, not 01:00 and 13:00. So
       is a small number before AM: nobody doses at 2 in the morning. */
    if (!mi && sp && +h <= 3 && (ap.charAt(0) === 'a' || new RegExp('\\b' + h + '\\s+a\\.?m').test(str))) return m;
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
  /* A clock time is the time of the dose its part of the day names: "every
     night at 10pm" is one dose at 22:00, "AM 7am and PM 7pm" two, at 07:00
     and 19:00, but "AM and 2 PM" is two, at 08:00 and 14:00. */
  var part = function (x) {
    if (x.key.charAt(0) !== 'c') return x.key === 'am' ? 'm' : x.key === 'mid' ? 'a' : 'e';
    var h = +x.time.slice(0, 2);
    return h >= 4 && h < 12 ? 'm' : h >= 12 && h < 16 ? 'a' : 'e';
  };
  var clockParts = found.filter(function (x) { return x.key.charAt(0) === 'c'; }).map(part);
  found = found.filter(function (x) {
    if (x.key.charAt(0) === 'c' || clockParts.indexOf(part(x)) < 0) return true;
    f = f.slice(0, x.at) + new Array(x.end - x.at + 1).join(' ') + f.slice(x.end);
    return false;
  });
  found.sort(function (a, b) { return a.at - b.at; });
  var keys = [];
  found.forEach(function (x) { if (keys.indexOf(x.key) < 0) keys.push(x.key); });
  if (keys.length < 2) return { doses: 1, at: found.length ? [found[0].time] : null };
  /* Between two listed times: a joining word, an amount, or a word that only
     places the time ("and before bed", "AM, 1 tab PM"), with at least one
     joining word or amount among them. Never "or". With only a placing word
     between them, the second places the first: "PM before bed" and "evening
     at bedtime" are one evening dose. */
  var join = /^(?:[\s,;+&\/]|\band\b|\bplus\b|\bthen\b|\bagain\b|\bin\b|\bthe\b|\bat\b|\bbefore\b|\bupon\b|\bon\b|\bone\b|\bx\b|[\d.,\/]+\s*(?:mcg|mg|iu|units?|ml|g|tabs?|caps?|pills?|doses?|sprays?)\b|[\d.,\/]+)*$/;
  var joins = /[,;+&\/\d]|\band\b|\bplus\b|\bthen\b|\bagain\b|\bone\b|\bx\b/;
  for (var i = 1; i < found.length; i++) {
    var gap = f.slice(found[i - 1].end, found[i].at);
    /* "PM/bedtime", "evening/night": a slash between two words for the same
       part of the day offers either word for one dose. */
    if (/^\s*\/\s*(?:before|at|upon|in the)?\s*$/.test(gap) && part(found[i - 1]) === part(found[i]) && found[i - 1].key.charAt(0) !== 'c' && found[i].key.charAt(0) !== 'c') {
      found.splice(i - 1, 1); i--; continue;
    }
    if (found[i].key !== found[i - 1].key && !(join.test(gap) && joins.test(gap))) {
      var parts = found.map(part);
      var onePart = parts.every(function (x) { return x === parts[0]; });
      return { doses: 1, at: onePart ? [found[found.length - 1].time] : null };
    }
  }
  var times = [];
  found.forEach(function (x) { if (times.indexOf(x.time) < 0) times.push(x.time); });
  times.sort();
  return { doses: times.length, at: times };
}

/* Whether text that states a schedule says it in words this fully reads,
 * and nothing else. Only then does the new reading replace the old one.
 *
 * Every word must be a schedule phrase (tlFreqHits), a day, a rest word
 * beside days ("Sun off", "except Sat/Sun"), a time of day, an amount at the
 * start or before a time ("250mcg AM, 250mcg PM"), a route, or a word that
 * only places the dose ("with food", "fasted", "before"). And the text has
 * one group of times and one group of days: "Mon AM, Thu PM", "6am daily
 * (8am weekends)" and "daily AM (PM on Sundays)" say different things on
 * different days, which the old screens cannot hold. Anything else ("or",
 * "then", a site, a note, a bare number) leaves the old reading. */
var TL_FREQ_FILLER = /^(?:subq|sq|sc|im|iv|oral|orally|po|topical|topically|sublingual|sl|nasal|intranasal|transdermal|inject|injection|injections|inj|pin|pins|shot|shots|dose|doses|dosing|with|food|meal|meals|breakfast|lunch|dinner|water|fasted|fasting|empty|before|after|upon|at|on|in|the|a|an|every|each|per|x|only|split|day|days|sleep|once|one|apply|applied|gym|workout|workouts|training|exercise|cardio|pre|post|preworkout|postworkout)$/;
/* Sites say where, not when. Between two lists of days they are a rotation
   ("M/W/F glute, T/Th delt"), which this does not read. */
var TL_FREQ_SITE = /^(?:glute|glutes|delt|delts|quad|quads|ventroglute|vg|belly|abdomen|abdominal|abs|stomach|tummy|thigh|thighs|arm|arms|lat|lats|pec|pecs|left|right|l|r|near|injury|site|sites|area|face|neck|shoulder|knee|elbow|tendon)$/;
var TL_FREQ_REST = /^(?:off|except|excluding|but|besides|without|no|not|skip|skipping|skipped|rest|resting|minus|other|than|apart|from)$/;
var TL_FREQ_TIME = /^(?:am|pm|morning|mornings|evening|evenings|night|nights|noon|midday|afternoon|bed|bedtime|prebed|waking|wake|qhs|qam|qpm)$/;
var TL_FREQ_JOIN = /^(?:to|through|thru|and|plus|&|\+|\/|,|;|:|-|\u2013|\u00b7|=)$/;
function tlFreqSimple(g, hits) {
  /* Hits are found in g as given; each becomes one token. */
  var chars = String(g).split('');
  (hits || []).forEach(function (h) {
    for (var k = h.at; k < h.at + h.len && k < chars.length; k++) chars[k] = ' ';
    if (h.at < chars.length) chars[h.at] = '\u00a7';
  });
  var s = ' ' + chars.join('').replace(/\u00a7/g, ' \u00a7 ') + ' ';
  s = s.replace(/\ba\.m\.?/g, 'am').replace(/\bp\.m\.?/g, 'pm').replace(/\bw\/o\b/g, 'without').replace(/\bpre-?bed\b/g, 'prebed')
    /* "12.5 AM, 12.5 PM", "1/2 AM": an amount with no unit, before a time. */
    .replace(/(?:^|[^\d.,\/])\d+(?:[.,]\d+|\/\d+)\s*(?=(?:am|pm|morning|evening|night|bed|bedtime)\b)/g, ' \u00a5 ')
    /* Clock times, amounts, and "30 min" before a time. */
    .replace(/\b(?:1[0-2]|0?[4-9])(?:[:.][0-5]\d)?\s*(?:am|pm)(?![a-z])|\b(?:1[0-2]|0?[1-9])[:.][0-5]\d\s*(?:am|pm)(?![a-z])|\b0?[1-3](?:am|pm)(?![a-z])/g, ' \u00a4 ')
    .replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g, ' \u00a4 ')
    .replace(/[\d.,\/]*\d\s*(?:mcg|mg|iu|units?|ml|cc|g|tabs?|tablets?|caps?|capsules?|pills?|drops?|sprays?|clicks?|pumps?)\b/g, ' \u00a5 ')
    .replace(/\b\d+\s*(?:min|mins|minutes|hours?|hrs?|h)\b/g, ' ')
    /* "with CJC-1295": what it is taken with. */
    .replace(/\bwith\s+(?!(?:am|pm|morning|evening|night|bed|bedtime)\b)[a-z][a-z0-9]*(?:[-\s]?\d+)?/g, ' ');
  var toks = s.match(/[a-z]+|\d+(?:[.,]\d+)?|[\u00a7\u00a4\u00a5()\/,;:&+\-\u2013\u00b7=]/g) || [];
  var day = new RegExp('^(?:' + TL_FREQ_DAYWORD + ')$');
  var kind = toks.map(function (t, i) {
    if (t === '\u00a7') return 'H';
    if (t === '\u00a4') return 'T';
    if (t === '\u00a5') return 'A';
    if (t === '(' || t === ')') return 'B';
    if (day.test(t)) return 'D';
    if (TL_FREQ_TIME.test(t)) return 'T';
    if (TL_FREQ_REST.test(t)) return 'R';
    if (TL_FREQ_JOIN.test(t)) return 'J';
    if (TL_FREQ_FILLER.test(t)) return 'F';
    if (TL_FREQ_SITE.test(t)) return 'S';
    /* A small count before a time is tablets: "1 AM 1 PM". */
    if (/^[1-3]$/.test(t) && TL_FREQ_TIME.test(toks[i + 1] || '')) return 'A';
    return 'X';
  });
  if (kind.indexOf('X') >= 0) return false;
  /* "day after Mon/Thu pins", "night before Mon", "before sun": days that
     say when relative to something else, or the sun itself. */
  for (var z = 0; z < toks.length; z++) {
    if (kind[z] !== 'D') continue;
    var prev = toks[z - 1], prev2 = toks[z - 2];
    if (/^(?:before|after|upon)$/.test(prev || '') || (prev === 'each' && /^(?:before|after)$/.test(prev2 || ''))) return false;
    if (toks[z] === 'sun' && /^(?:without|no|in|the|from|of|avoid)$/.test(prev || '') && kind.filter(function (k) { return k === 'D'; }).length === 1) return false;
  }
  /* "daily + PM Mon/Wed/Fri", "daily and before bed": a count a day joined
     to another time or other days is a second dose. */
  for (var y = 0; y < toks.length; y++) {
    if (!/^(?:\+|and|&|plus)$/.test(toks[y])) continue;
    var left = -1, right = -1;
    for (var u = y - 1; u >= 0; u--) if (kind[u] !== 'F' && kind[u] !== 'B') { left = u; break; }
    for (var w2 = y + 1; w2 < toks.length; w2++) if (kind[w2] !== 'F' && kind[w2] !== 'B') { right = w2; break; }
    if (left >= 0 && right >= 0 && kind[left] === 'H' && (kind[right] === 'T' || kind[right] === 'D')) return false;
  }
  var between = function (i, j) { return kind.slice(i + 1, j); };
  var idx = function (k) { var out = []; kind.forEach(function (x, i) { if (x === k) out.push(i); }); return out; };
  var T = idx('T'), D = idx('D');
  for (var a = 1; a < T.length; a++) {
    if (between(T[a - 1], T[a]).some(function (x) { return x !== 'J' && x !== 'F' && x !== 'A'; })) return false;
  }
  for (var b = 1; b < D.length; b++) {
    if (between(D[b - 1], D[b]).some(function (x) { return x !== 'J' && x !== 'F' && x !== 'R' && x !== 'B'; })) return false;
  }
  var next = function (i, dir) { for (var k = i + dir; k >= 0 && k < kind.length; k += dir) if (kind[k] !== 'J' && kind[k] !== 'F' && kind[k] !== 'B' && kind[k] !== 'S') return kind[k]; return null; };
  var firstReal = -1;
  for (var q = 0; q < kind.length && firstReal < 0; q++) if (kind[q] !== 'J' && kind[q] !== 'F' && kind[q] !== 'B' && kind[q] !== 'S') firstReal = q;
  if (idx('A').some(function (i) { var n = next(i, 1); return n === 'D' || (i !== firstReal && n !== 'T' && n !== 'A'); })) return false;
  if (idx('R').some(function (i) { return next(i, 1) !== 'D' && next(i, -1) !== 'D' && next(i, 1) !== 'R' && next(i, -1) !== 'R'; })) return false;
  return true;
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
  var day = '(?:' + TL_FREQ_DAYWORD + ')';
  /* A count is never the end of an amount: not the 2 of "1/2", the 5 of
     "0.5" or "12.5". */
  var count = '(once|twice|thrice|one|two|three|four|five|six|seven|\\d+)';
  var lead = '(?:^|[^\\d.\\/a-z])';
  var link = '\\s*(?:-\\s*)?(?:a\\s+|per\\s+|each\\s+|every\\s+|in\\s+a\\s+|\\/\\s*)?';
  var times = '\\s*(?:x|times?)';
  /* "2 injections daily", "2 pins/week", "5 nights a week". Days and nights
     count only a week: "10 days daily" is a course, not ten doses a day. */
  /* Tablets, capsules and sprays are how much is taken at once ("2 caps
     daily", "1/2 tab daily"), not how often. */
  var noun = '\\s+(?:pins?|injections?|inj|shots?|doses?|applications?)';
  var nounWk = '\\s+(?:pins?|injections?|inj|shots?|doses?|nights?|days?|applications?)';

  add(/\b(?:prn|as needed|as required|when needed|if needed)\b/, function () { return { kind: 'asneeded' }; });
  add(/\bbi[\s-]*weekly\b/, function () { return { kind: 'check', ask: 'biweekly' }; });
  add(/\b(?:bi[\s-]*monthly|semi[\s-]*monthly|quarterly|yearly|annually|every\s+year|once\s+a\s+year)\b/, function () { return { kind: 'check' }; });
  add(/\bsemi[\s-]*weekly\b/, function () { return { kind: 'weekly', n: 2 }; });
  /* "every other Friday", "first Monday of the month": a day this cannot place. */
  add(new RegExp('\\b(?:every\\s+(?:other|second|2nd|third|3rd)|alternate|alt\\.?|first|1st|second|third|fourth|4th|last)\\s+' + day + '\\b'),
    function () { return { kind: 'check' }; });
  add(/\bevery\s+\d+\s*[-–]\s*\d+\s*(?:days?|weeks?|wks?)\b/, function () { return { kind: 'check', soft: true }; });

  /* Doses a day. */
  add(/\b(b|t|q)\.?i\.?d\b\.?/, function (m) { return { kind: 'daily', n: { b: 2, t: 3, q: 4 }[m[1]] }; });
  add(new RegExp('\\b(once|twice|thrice)' + link + '(?:day|daily)\\b'), function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(new RegExp(lead + count + times + link + '(?:day|daily|d)\\b'), function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(new RegExp(lead + count + noun + '\\s*(?:-\\s*)?(?:a\\s+|per\\s+|each\\s+|\\/\\s*)?(?:day|daily)\\b'), function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(/(?:^|[^\d.\/a-z])(\d|two|three|four)\s+(?:a|per|each)\s+day\b/, function (m) { return { kind: 'daily', n: tlFreqNum(m[1]) }; });
  add(/\bx\s*(\d)\s*(?:-\s*)?(?:a\s+|per\s+|\/\s*)?(?:daily|day)\b/, function (m) { return { kind: 'daily', n: +m[1] }; });
  add(/(?:^|[^\d.\/a-z])(\d+)\s*(?:\/|per\s+)\s*(?:day|d)\b/, function (m) { return { kind: 'daily', n: +m[1] }; });
  add(/\bq\s?(\d+)\s?h(?:rs?|ours?)?\b/, function (m) { return tlFreqHours(+m[1]); });
  add(/\bevery\s+(\d+)\s*(?:hours?|hrs?|h)\b/, function (m) { return tlFreqHours(+m[1]); });
  add(/\b(\d+)[\s-]*hourly\b/, function (m) { return tlFreqHours(+m[1]); });
  /* "ED" is every day, unless anything else is named ("for ED", "ED once
     weekly"). */
  add(/\b(?:ed|e\.d\.)(?![a-z])/, function () { return { kind: 'daily', n: 1, plain: true, weak: true }; });
  add(/\b(?:daily|every\s?day|each\s+day|per\s+day|qd|q\.d\.?|nightly|every\s+(?:night|morning|evening)|each\s+(?:night|morning|evening)|qhs|qam|qpm)\b/,
    function () { return { kind: 'daily', n: 1, plain: true }; });

  /* Doses a week. */
  var wk = '(?:weekly|wkly|weeks?|wks?)';
  add(new RegExp('\\b(once|twice|thrice)' + link + wk + '\\b'), function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(new RegExp(lead + count + times + link + wk + '\\b'), function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(new RegExp(lead + count + nounWk + '\\s*(?:-\\s*)?(?:a\\s+|per\\s+|each\\s+|every\\s+|in\\s+a\\s+|\\/\\s*)?' + wk + '\\b'), function (m) { return { kind: 'weekly', n: tlFreqNum(m[1]) }; });
  add(/\bx\s*(\d)\s*(?:-\s*)?(?:a\s+|per\s+|\/\s*)?(?:weekly|wkly|weeks?|wks?)\b/, function (m) { return { kind: 'weekly', n: +m[1] }; });
  /* "2xweekly", "3xdaily", "1xmonthly": a count glued to its word. */
  add(/(?:^|[^\d.\/a-z])([1-6])x(daily|weekly|monthly)\b/, function (m) {
    var n = +m[1];
    return m[2] === 'daily' ? { kind: 'daily', n: n } : m[2] === 'weekly' ? { kind: 'weekly', n: n } : n === 1 ? { kind: 'monthly' } : { kind: 'check' };
  });
  /* "5d/wk", "5 d a week": days a week. */
  add(/(?:^|[^\d.\/a-z])([1-7])\s*d\s*(?:\/|per\s+|a\s+)\s*(?:weeks?|wks?)\b/, function (m) { return { kind: 'weekly', n: +m[1] }; });
  add(/(?:^|[^\d.\/a-z])(\d+)\s*(?:\/|per\s+)\s*(?:weeks?|wks?)\b/, function (m) { return { kind: 'weekly', n: +m[1] }; });
  add(/(?:\be3\.5d\b|\bevery\s+3\.5\s*(?:days?|d)\b)/, function () { return { kind: 'weekly', n: 2 }; });
  add(/\b(?:weekly|wkly|every\s+week|each\s+week|per\s+week|qwk|q\s?wk|qw|qweekly|q\.w\.?)(?![a-z])/, function () { return { kind: 'weekly', n: 1, plain: true }; });
  add(/\/\s*(?:week|wk)\b/, function () { return { kind: 'weekly', n: 1, plain: true }; });

  /* "Skip 2 days a week", "2 days off a week": the other five. */
  add(/\b(?:skip(?:ping)?\s+(\d)\s+days?|(\d)\s+days?\s+off)\s*(?:a|per|each|\/)\s*(?:weeks?|wks?)\b/, function (m) {
    var off = +(m[1] || m[2]);
    return off >= 1 && off <= 6 ? { kind: 'weekly', n: 7 - off } : null;
  });

  /* Days between doses, also written "q7d", "q2w", "EOW". */
  add(/\b(?:eod|qod|q\.o\.d\.?|e\.o\.d\.?|every\s+other\s+day|every\s+(?:second|2nd)\s+day|alt(?:ernate|\.)?\s+days|every\s+alternate\s+day)(?![a-z])/,
    function () { return { kind: 'interval', n: 2 }; });
  add(/\b(?:e3d|every\s+3rd\s+day|every\s+third(?:\s+day)?)\b(?!\s*(?:weeks?|wks?|months?))/, function () { return { kind: 'interval', n: 3 }; });
  add(/\bevery\s+(second|2nd|third|3rd|fourth|4th)\s+(?:weeks?|wks?)\b/, function (m) { return { kind: 'interval', n: 7 * ({ second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4 }[m[1]]) }; });
  add(/\bevery\s+(?:second|2nd|third|3rd|fourth|4th)\s+months?\b/, function () { return { kind: 'check' }; });
  add(/\be(\d+)d\b/, function (m) { return { kind: 'interval', n: +m[1] }; });
  add(/\bq\s?(\d+(?:\.\d+)?)\s?(?:d|days?)\b/, function (m) {
    var n = parseFloat(m[1]);
    return n === 3.5 ? { kind: 'weekly', n: 2 } : n % 1 === 0 ? { kind: 'interval', n: n } : { kind: 'check' };
  });
  add(/\bq\s?(\d+)\s?(?:w|wks?|weeks?)\b/, function (m) { return +m[1] === 1 ? { kind: 'weekly', n: 1 } : { kind: 'interval', n: 7 * m[1] }; });
  add(/\bq\s?(\d+)\s?(?:m|mo|mos|months?)\b/, function (m) { return +m[1] === 1 ? { kind: 'monthly' } : { kind: 'check' }; });
  add(/\b(?:eow|qow|e\.o\.w\.?|q\.o\.w\.?)(?![a-z])/, function () { return { kind: 'interval', n: 14 }; });
  add(/\bevery\s+(\d+(?:\.\d+)?)\s*(?:days?|d)\b/, function (m) {
    var n = parseFloat(m[1]);
    if (n === 3.5) return { kind: 'weekly', n: 2 };
    return n % 1 === 0 ? { kind: 'interval', n: n } : { kind: 'check' };
  });
  add(/\b(?:every\s+other\s+week|every\s+fortnight|fortnightly)\b/, function () { return { kind: 'interval', n: 14 }; });
  add(/\bevery\s+(\d+|two|three|four|five|six)\s*(?:weeks?|wks?)\b/, function (m) {
    var n = tlFreqNum(m[1]);
    return n === 1 ? { kind: 'weekly', n: 1 } : { kind: 'interval', n: 7 * n };
  });

  /* Months. */
  add(/\bevery\s+(\d+|two|three|four|five|six)\s*months?\b/, function (m) {
    return tlFreqNum(m[1]) === 1 ? { kind: 'monthly' } : { kind: 'check' };
  });
  add(/\b(?:twice|thrice|[2-9]\s*x?)\s*(?:-\s*)?monthly\b/, function () { return { kind: 'check' }; });
  add(/\b(?:monthly|once\s+(?:a\s+|per\s+|each\s+|every\s+)?month|every\s+month|each\s+month|per\s+month|(?:1|one)\s*(?:x|times)\s*(?:a\s+|per\s+|\/\s*)?month)\b/,
    function () { return { kind: 'monthly' }; });
  add(new RegExp('\\b(?:(twice|thrice)' + link + '|(two|three|four|\\d+)' + times + link + ')months?\\b'), function (m) {
    return tlFreqNum(m[1] || m[2]) >= 2 ? { kind: 'check' } : null;
  });

  /* Days on and off. A week of them is a weekly run. */
  add(/\b(\d+)\s*(?:d|days?)?\s*-?\s*on\s*[,\/&]?\s*(?:and\s+)?(\d+)\s*(?:d|days?)?\s*-?\s*off\b/, function (m) {
    var on = +m[1], off = +m[2];
    /* "1 on 1 off" is every other day; "1 on 2 off", every third. */
    if (on === 1 && off >= 1 && off <= 6) return { kind: 'interval', n: 1 + off };
    return on > 0 && on + off === 7 ? { kind: 'weekly', n: on, run: true } : { kind: 'check' };
  });

  /* The old reader's pulse: a ten-day course, never scheduled. Only when
     nothing else is named (tlReadFrequency). */
  add(/\b10[\s-]?days?\b|\bpulse\b/, function () { return { kind: 'pulse' }; });

  hits.sort(function (a, b) { return a.at - b.at || b.len - a.len; });
  return hits;
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
   instead of once a day, so a caller can look elsewhere on the line.
 *
 * A line can say two things: how many doses a day ("2x daily", "AM and PM",
 * "nightly") and which days ("5 on 2 off", "EOD", "Mon-Fri", "weekly"). Each
 * is read on its own and then put together: "2x daily 5 on 2 off" is two
 * doses on each of five days. When the text names two different day
 * patterns, the first one named wins. A pulse, or "10 days", is the reading
 * only when nothing else is named. Days are taken only from text that says
 * nothing but a schedule (tlFreqClean). */
function tlReadFrequency(text, strict) {
  return tlReadFrequencyDetail(text, strict).freq;
}

/* The old reading of a text, or null where it found nothing it knew, or
   found it only inside a word ("bid" in "morbid"). */
var TL_FREQ_OLD_WORDS = /(?:^|[^a-z0-9]|\dx)(?:twice daily|2x daily|bid|daily|once daily|every day|qd|eod|every other day|every 2 day|e3d|every 3 day|every third|e3\.5d|twice week|2x week|2x\/week|biweekly|weekly|once week|1x week|per week|monthly|once month|10 day|10-day|pulse)/;
function tlFreqOld(text) {
  if (!TL_FREQ_OLD_WORDS.test(text.toLowerCase())) return null;
  var old = tlReadFrequencyBefore(text);
  return old.type === 'daily' && old.label === text ? null : old;
}

/* The reading, as { freq, unsure }. `unsure` means text the reader set aside
   held a schedule, so the reading is the old one (tlFreqCutSchedule). */
function tlReadFrequencyDetail(text, strict) {
  var cut = [];
  var aside = function (m) { cut.push(m); return ' '; };
  var blank = function (m) { return new Array(m.length + 1).join(' '); };
  /* "2*daily" is a count; any other asterisk is a footnote mark ("Weekly*"). */
  var f = text.toLowerCase().replace(/[\u00d7\u2715]/g, 'x').replace(/(\d)\s*\*/g, '$1x').replace(/\*/g, ' ')
    .replace(/\s+/g, ' ').trim()
    /* "Sub-Q" is a route, not the "q" of "q5d". */
    .replace(/\bsub[\s-]?q\b/g, 'subq')
    /* An amount per day or per week is a total, not a schedule: "BID
       (3.5mg/wk)", "ED, 140mg/wk". */
    .replace(/[\d.,]+\s*(?:mcg|mg|iu|units?|ml|g)\s*(?:\/|per\s+)\s*(?:days?|d|weeks?|wks?)\b/g, ' ')
    /* "140mg weekly total", "total 140mg/wk", "(140mg a week total)". */
    .replace(/(?:\btotal\s*(?:of\s*)?)?[\d.,]+\s*(?:mcg|mg|iu|units?|ml|g)\s*(?:weekly|wkly|a\s+week|per\s+week|\/\s*wk|\/\s*week)?\s+total\b/g, ' ')
    /* An optional time is no dose time: "PM if needed", "AM + 5mg PM as
       needed", "PM optional", "optional PM dose", "PM on gym days". */
    .replace(/(?:\+\s*)?(?:\b(?:extra|additional|another|optional|2nd|second)\s+)?(?:[\d.,\/]+\s*(?:mcg|mg|iu|units?|ml|g|tabs?|caps?)\s*)?\b(?:am|pm|a\.m\.|p\.m\.|morning|evening|night|bedtime|bed|noon|midday|afternoon)\b\s*(?:dose\s*)?(?:\(\s*|[-\u2013]\s*|only\s+)?(?:(?:if|as|when)\s+(?:needed|required|necessary)|optional(?:ly)?|prn|on\s+(?:gym|training|workout|lifting|lift|rest)\s+days?)\b\)?/g, ' ')
    .replace(/\boptional\s+(?:am|pm|a\.m\.|p\.m\.|morning|evening|night|bedtime)\b(?:\s+dose)?/g, ' ')
    /* An optional extra: "(+Sat if needed)", "AM - double if needed". */
    .replace(/\([^()]*\b(?:if|as|when)\s+(?:needed|required)\b[^()]*\)/g, aside)
    .replace(/\s[-\u2013\u2014]\s[^,;()]*\b(?:if|as|when)\s+(?:needed|required)\b.*$/g, aside)
    /* A note in brackets about labs or a review: "(TSH every 6 months)". */
    .replace(/\([^()]*\b(?:tsh|a1c|hba1c|bloods?|bloodwork|labs?|panel|psa|test(?:ing|ed)?|check(?:ed)?|cycle off|recheck\w*)\b[^()]*\)/g, aside)
    /* A time of day in a note about side effects is not the dose time:
       "daily (can cause insomnia at night)". */
    .replace(/\([^()]*\b(?:insomnia|sleep\w*|wired|awake|sweat\w*|side[\s-]?effects?|nause\w*|caus\w*|keeps?\s+me|jitter\w*|anxi\w*|headaches?)\b[^()]*\)|\s[-\u2013\u2014]\s[^,;()]*\b(?:insomnia|sleep\w*|wired|awake|sweat\w*|side[\s-]?effects?|nause\w*|caus\w*|keeps?\s+me|jitter\w*|anxi\w*|headaches?)\b[^,;()]*/g,
      function (m) { return m.replace(/\b(?:am|pm|morning|evening|night|nights|bed|bedtime|noon|afternoon)\b/g, blank); })
    .replace(/\s+/g, ' ').trim();
  /* The app's own text for a rule the old screens cannot show. */
  if (/\(pulse - see app\)/.test(f)) return { freq: { type: 'pulse', label: '10-day pulse cycle', days: null }, unsure: false };
  f = tlFreqSpellDays(f);
  var g = ' ' + tlFreqStripNotes(tlFreqStripCourse(f), cut) + ' ';
  /* Text set aside held a schedule, and what is left states none: setting
     it aside was a guess, so the reading is the old one. Where what is left
     states one first, the first named wins ("EOD or daily"); a range to
     check is not one ("every 3-4 days or twice weekly"). */
  if (tlFreqCutSchedule(cut) && !tlFreqHits(g).some(function (h) { return h.kind !== 'pulse' && !(h.kind === 'check' && !h.ask); }) && !tlFreqDayRule(g.trim())) {
    var was = tlFreqOld(text);
    return { freq: was || (strict ? null : tlReadFrequencyBefore(text)), unsure: !!was };
  }
  var read = tlFreqReadClean(text, f, g, strict);
  if (read === 'unsure') {
    var before = tlFreqOld(text);
    return { freq: before || (strict ? null : { type: 'daily', times: 1, label: text, days: null }), unsure: !!before };
  }
  return { freq: read, unsure: false };
}

/* The reading of text with its notes and course set aside (g). */
function tlFreqReadClean(text, f, g, strict) {
  var hits = tlFreqHits(g);
  var first = function (kinds) { return hits.filter(function (h) { return kinds.indexOf(h.kind) >= 0; })[0] || null; };
  var special = first(['asneeded', 'check']), perDay = first(['daily']), pattern = first(['weekly', 'interval', 'monthly']);
  var pulse = first(['pulse']);
  /* Times of day, with notes set aside: "before bed (extra AM dose if
     needed)" is a bedtime dose. */
  var tod = tlFreqTimesOfDay(g.trim());
  /* Days come from the same text as the schedule, with notes set aside:
     "daily (labs Monday)" names no dose day. */
  var dayRule = tlFreqClean(g.slice(1, -1), hits) ? tlFreqDayRule(g.trim()) : null;

  if (special && special.ask === 'biweekly' && dayRule && !dayRule.rest && dayRule.days.length === 2) {
    special = null; pattern = { kind: 'weekly', n: 2, at: 0 };
  }
  /* "Biweekly (2x/week)", "biweekly (every 2 weeks)": the text answers its
     own question. Not the "weekly" inside "bi-weekly". */
  if (special && special.ask === 'biweekly') {
    var told = hits.filter(function (h) { return (h.kind === 'weekly' || h.kind === 'interval') && (h.at >= special.at + special.len || h.at + h.len <= special.at); })[0];
    if (told) { special = null; pattern = told; }
  }
  /* A range ("every 3-4 days") yields to a schedule named beside it:
     "every 3-4 days (twice weekly)". */
  if (special && special.soft && (pattern || perDay)) special = null;
  /* "ED" yields to any other pattern: "ED once weekly" is Cialis weekly. */
  if (perDay && perDay.weak && pattern) perDay = hits.filter(function (h) { return h.kind === 'daily' && !h.weak; })[0] || null;
  var firstAt = function (h) { return h ? h.at : Infinity; };
  /* "As needed" is the schedule only when nothing else states one: "AM (+5mg
     if needed)" is a morning dose with an optional extra. */
  if (special && special.kind === 'asneeded' && (tod.at || dayRule ||
      new RegExp('\\b(?:am|pm|morning|evening|night|bed|bedtime|nightly|' + TL_FREQ_DAYWORD + ')\\b').test(g))) special = null;
  /* A schedule to check inside brackets, beside a time of day, is a note:
     "AM (cycle off every 3 months)". */
  if (special && special.kind === 'check' && /\([^()]*$/.test(g.slice(0, special.at)) &&
      (tod.at || /\b(?:am|pm|morning|evening|night|bed|bedtime)\b/.test(g))) special = null;
  /* "10-day pulse cycles annually" is a pulse, named before the year. */
  if (pulse && special && special.kind === 'check' && !perDay && !pattern && pulse.at < special.at) special = null;
  if (special && special.at <= Math.min(firstAt(perDay), firstAt(pattern))) {
    if (special.kind === 'asneeded') return { type: 'asneeded', label: 'As needed', days: null };
    return tlFreqCheck(text, special.ask);
  }
  /* Two different patterns ("weekly (E3.5D)", "weekly (2x/week)"), or two
     different counts a day ("daily (BID)"): which one is the schedule is a
     guess. Every 7 days is weekly, every 3.5 days twice weekly. */
  var norm = function (h) {
    if (h.kind === 'interval' && h.n === 7) return 'weekly1';
    if (h.kind === 'interval' && h.n === 1) return 'daily1';
    return h.kind + (h.n || '') + (h.run ? 'r' : '');
  };
  var pats = [], counts = [], end = -1;
  /* One phrase can match more than one way ("twice weekly" holds "weekly"):
     only phrases that do not overlap count. */
  var apart = hits.filter(function (h) { if (h.at < end) return false; end = h.at + h.len; return true; });
  apart.forEach(function (h) {
    if (h.kind === 'weekly' || h.kind === 'interval' || h.kind === 'monthly') { if (pats.indexOf(norm(h)) < 0) pats.push(norm(h)); }
    if (h.kind === 'daily' && !h.weak) { var c = h.n || 1; if (counts.indexOf(c) < 0) counts.push(c); }
  });
  if (pats.length > 1 || counts.length > 1) return 'unsure';
  /* A plain "daily" and a different pattern. A run ("daily 5 on 2 off") or
     a count of days ("nightly, 5 nights a week") narrows the daily line. A
     daily word that is a time ("nightly EOD", "every morning (EOD)") gives
     the time and the pattern the days. Any other, in either order ("daily
     EOD", "14iu weekly split daily"), is a guess. */
  if (perDay && pattern && perDay.plain && !perDay.weak && !pattern.run && !(pattern.kind === 'weekly' && pattern.n >= 2)) {
    if (/^\W*(?:nightly|every\s+(?:night|morning|evening)|each\s+(?:night|morning|evening)|qhs|qam|qpm)/.test(g.slice(perDay.at, perDay.at + perDay.len))) perDay = null;
    else return 'unsure';
  }
  /* Named days beside a count every N days ("Mon/Thu every 2 weeks") cannot
     both hold, and named days beside a count a day and more than one time
     ("daily AM + PM Mon/Wed/Fri") are a second dose on those days. */
  if (pattern && pattern.kind === 'interval' && pattern.n !== 7 && dayRule && !dayRule.rest) return 'unsure';
  if (perDay && dayRule && !dayRule.rest && tod.doses > 1 && !(perDay.n > 1)) return 'unsure';

  var perDayN = perDay ? perDay.n : null;
  /* What follows schedules doses. It does so only from text this fully
     reads (tlFreqSimple); otherwise the reader is unsure. A pulse, an "as
     needed" or one to check schedules nothing and needs no such care. */
  var schedules = pattern || dayRule || perDay || tod.at || (!pulse && !special && /[\d.,]+\s*(?:mcg|mg|iu|units?|ml|g)\s*per\s+weeks?\b/i.test(text));
  if (schedules && !tlFreqSimple(g, hits)) return 'unsure';
  /* A count a day with one or two days named and no pattern: "daily (Sun
     10am)", "twice daily (AM only on Sundays)", "daily before sun". The days
     are a note about those days, not the only dose days. */
  if (!pattern && perDay && dayRule && !dayRule.rest && dayRule.days.length < 3) return 'unsure';
  var out;
  if (pattern) {
    out = tlFreqPattern(pattern, dayRule, text);
    if (!out) return tlFreqCheck(text);
  } else if (dayRule) {
    out = dayRule.days.length >= 7 ? { type: 'daily', times: 1, label: 'Daily', days: null } : tlFreqWeekly(dayRule.days.length, dayRule.days, false, 1);
  } else if (perDay) {
    out = { type: 'daily', times: 1, label: 'Daily', days: null };
  } else if (pulse) {
    return { type: 'pulse', label: '10-day pulse cycle', days: null };
  } else if (special) {
    return special.kind === 'asneeded' ? { type: 'asneeded', label: 'As needed', days: null } : tlFreqCheck(text, special.ask);
  } else if (/[\d.,]+\s*(?:mcg|mg|iu|units?|ml|g)\s*per\s+weeks?\b/i.test(text)) {
    /* "100mg per week" and nothing else: once a week, as it always was. */
    out = { type: 'weekly', count: 1, label: 'Weekly', days: [1] };
  } else {
    if (strict && tod.doses < 2) return null;
    /* Nothing this reads, and no time of day: what the old reader made of
       it ("2x weeky" was twice weekly), or once a day. */
    if (!tod.at && !hits.length) return tlFreqOld(text) || { type: 'daily', times: 1, label: text, days: null };
    out = { type: 'daily', times: 1, label: text, days: null, plain: true };
  }

  /* Doses a day: stated ("2x daily", "q8h"), or listed times of day, unless
     the text says once ("once daily AM/PM" is one dose at either). */
  var once = /\b(?:once|1\s*x|one\s+time)\b/.test(g);
  if (once && tod.doses > 1) tod = { doses: 1, at: null };
  var n = perDayN && perDayN > 1 ? perDayN : tod.doses;
  if (!(n >= 1) || n > 6) return tlFreqCheck(text);
  if (out.type === 'daily') {
    out.times = (out.times || 1) * n;
    if (!out.plain) out.label = tlFreqDailyLabel(out.times);
  } else if (n > 1) {
    out.times = n;
    out.label = tlFreqDailyLabel(n) + ', ' + out.label.charAt(0).toLowerCase() + out.label.slice(1);
  }
  delete out.plain;
  if (tod.at && tod.at.length === (out.times || 1)) out.at = tod.at;
  return out;
}

/* A day pattern as a reading, with the days the text named where they fit
   it. Null when the pattern cannot be one (zero a week). */
function tlFreqPattern(p, dayRule, text) {
  if (p.kind === 'monthly') return { type: 'monthly', label: 'Monthly', days: null };
  if (p.kind === 'interval') {
    if (!(p.n >= 1)) return null;
    /* "Every 7 days (Sunday)", "q7d Sun": weekly on that day. */
    if (p.n === 7 && dayRule && !dayRule.rest && dayRule.days.length === 1) return tlFreqWeekly(1, dayRule.days, false, 1);
    if (p.n === 1) return { type: 'daily', times: 1, label: 'Daily', days: null };
    return { type: 'interval', interval: p.n,
      label: p.n === 2 ? 'Every other day' : p.n % 7 === 0 && p.n > 7 ? 'Every ' + p.n / 7 + ' weeks' : 'Every ' + p.n + ' days', days: null };
  }
  if (!(p.n >= 1)) return null;
  if (p.n >= 7) {
    if (p.n % 7) return null;
    return { type: 'daily', times: p.n / 7, label: tlFreqDailyLabel(p.n / 7), days: null };
  }
  /* Named days fix a weekly count when there are as many: "Twice weekly
     (Mon/Thu)", "5 on 2 off (Mon-Fri)", "5x weekly, Sat/Sun off". */
  var named = dayRule && dayRule.days.length === p.n ? dayRule.days : null;
  return tlFreqWeekly(p.n, named, p.run && !named, 1);
}

/* Whether a field of a line says nothing but days and times of day: "Wed",
   "Mon AM and Thu PM". "Refill on Fridays" says more, and does not move the
   dose to Friday. */
function tlFreqOnlyDays(text) {
  var s = tlFreqSpellDays(String(text || '').toLowerCase().replace(/\s+/g, ' ').trim());
  var hits = tlFreqHits(' ' + s + ' ');
  return !!tlFreqDayRule(s) && tlFreqClean(s, []) && tlFreqSimple(' ' + s + ' ', hits) && !hits.some(function (h) { return h.kind !== 'daily' || !h.plain; });
}

/* Whether a later field of a line says nothing but a schedule: days, rest
   days, a run or a count of days, and times of day. "Wed", "Mon AM and Thu
   PM", "5 days a week", "5 on 2 off", "Sun off". */
function tlFreqScheduleOnly(text) {
  if (TL_FREQ_NOTE.test(String(text || ''))) return false;
  var f = tlFreqSpellDays(String(text || '').toLowerCase().replace(/\s+/g, ' ').trim());
  var g = ' ' + f + ' ', hits = tlFreqHits(g);
  if (!tlFreqClean(f, hits) || !tlFreqSimple(g, hits)) return false;
  return !!tlFreqDayRule(f) || hits.some(function (h) { return h.kind === 'weekly' && (h.run || h.n >= 2); });
}

/* Whether a field states a schedule outright, and says nothing else: "twice
   weekly", "BID", "weekly (Sunday)", "Mon/Thu". Not "10 days", "vial lasts 10
   days" or "as needed". */
var TL_FREQ_NOTE = /\b(?:titrat\w*|increas\w*|decreas\w*|bloods?|bloodwork|labs?|tsh|a1c|panel|recheck\w*|refill\w*|re-?order\w*|vials?|reconstitut\w*|mix\w*|bac|water|cycle\s+off|if\s+needed|as\s+needed|prn)\b/i;

function tlFreqStatesSchedule(text) {
  if (TL_FREQ_NOTE.test(String(text || ''))) return false;
  var f = tlFreqSpellDays(String(text || '').toLowerCase().replace(/\s+/g, ' ').trim());
  var g = ' ' + tlFreqStripDurations(f) + ' ', hits = tlFreqHits(g);
  if (!tlFreqClean(g.slice(1, -1), hits) || !tlFreqSimple(g, hits)) return false;
  return !!tlFreqDayRule(g.trim()) || hits.some(function (h) { return h.kind === 'daily' || h.kind === 'weekly' || h.kind === 'interval' || h.kind === 'monthly'; });
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
   comma that groups the thousands of a number ("Sema, 1,000mcg, weekly" is a
   name, a dose and a frequency, not "1" and "000mcg"), a decimal comma before
   a unit ("2,5 mg"), and a comma inside parentheses. */
function tlSplitProtocolLine(line) {
  var s = String(line), parts = [], cur = '';
  /* An unclosed "(" protects nothing: "Test C (Pfizer, 100mg, twice weekly".
     Nor does a "(" in the name, which keeps the name it has always had: the
     history, reminder times and supply are filed under it. */
  var balanced = s.split('(').length === s.split(')').length;
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    /* "1,000mcg" and the decimal comma in "2,5 mg", but not "TB-500,250mcg":
       the field so far must be a number. */
    if (ch === ',' && /^\s*\d{1,3}(?:,\d{3})*$/.test(cur) &&
        (/^\d{3}(?!\d)/.test(s.slice(i + 1)) || /^\d{1,3}\s*(?:mcg|mg|iu|units?|ml|g)\b/i.test(s.slice(i + 1)))) { cur += ch; continue; }
    /* "Daily (5 days on, 2 off)", "5x weekly (skip Sat, Sun)". */
    if (ch === ',' && balanced && parts.length && (cur.split('(').length > cur.split(')').length)) { cur += ch; continue; }
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
  /* What a reading puts on the calendar: the days due over eight weeks from
     the start, and the reminder times. Two readings that differ only in
     wording ("every 7 days" and weekly from the start day) change nothing. */
  var anchor = proto.start ? tlLocalDate(proto.start) : new Date();
  anchor.setHours(0, 0, 0, 0);
  var plan = function (freq, name) {
    var days = [];
    for (var k = 0; k < 56; k++) {
      var day = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + k);
      if (tlLegacyDue(freq, proto.start, day)) days.push(k);
    }
    var times = custom[name] ? custom[name].join() : tlFreqScheduled(freq) ? getDefaultTimes(freq).join() : '';
    return days.join() + '|' + times + '|' + (freq.times || 1);
  };
  lines.forEach(function (line, i) {
    var med = now[i];
    if (!med) return;
    var oldParts = line.split(',').map(function (s) { return s.trim(); });
    var oldFreq = tlReadFrequencyBefore(oldParts[2] || 'Daily');
    if (plan(oldFreq, med.name) === plan(med.freq, med.name)) return;
    var when = function (freq) {
      if (!tlFreqScheduled(freq) || custom[med.name]) return '';
      var t = getDefaultTimes(freq);
      return t.length ? ' at ' + t.join(' and ') : '';
    };
    out.push({ name: med.name, before: tlDescribeFreq(oldFreq, proto.start) + when(oldFreq), after: tlDescribeFreq(med.freq, proto.start) + when(med.freq) });
  });
  return out;
}
