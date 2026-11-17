/* Supply: how many doses are left, and when the vial runs out.
 *
 * Each compound may carry an inventory:
 *
 *     inv = { per, left, spare, since }
 *
 *   per     doses in one vial, as the user counts them
 *   left    doses left in the open vial at the moment `since`
 *   spare   unopened vials at that moment
 *   since   the instant those numbers were entered
 *
 * Nothing is decremented. Doses left NOW is `left` minus the doses logged
 * since `since`, opening a spare vial each time the open one runs out. So
 * logging a dose lowers the count and undoing it raises it again, with no
 * counter to drift out of step with the log. This is the same idea the old
 * refill alert used (vials on hand, minus doses logged since), with the vial
 * size coming from the user instead of a fixed table. A dose logged the old
 * way, by a name two protocol lines share, comes off the count of the line it
 * ticked (tlEntryOwner in rounds.js), not of both.
 *
 * How long the open vial lasts is found by walking the protocol forward a day
 * at a time and taking out each dose due, not from an average rate. An
 * average hides the shape of a schedule: five doses left of a fourteen-dose
 * taper run out on day five whatever the four-week average says, and a
 * monthly rule averaged over four weeks can come out at nothing a day. A vial
 * that covers every dose until its rule ends lasts the protocol.
 *
 * The numbers are the user's. Nothing here supplies a vial size or a dose.
 */

var TL_SUPPLY_WINDOW_DAYS = 28;
var TL_SUPPLY_HORIZON_DAYS = 400;

/* Doses a day, averaged over the four weeks from `date`, for showing a rate.
   Four weeks, because that is a whole number of weeks for weekday rules and a
   whole number of cycles for every-3.5-days, so "Mon and Thu" comes out as
   exactly 2/7. How long a vial lasts is not worked out from this; see
   tlSupplyDays. */
function tlDailyUse(protocol, c, date) {
  if (!c || !c.rule || !(c.slots || []).length) return 0;
  var start = tlDay(tlDayKey(date)), n = 0;
  for (var i = 0; i < TL_SUPPLY_WINDOW_DAYS; i++) {
    var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (tlDoseDueOn(protocol, c, day) !== null) n += c.slots.length;
  }
  return n / TL_SUPPLY_WINDOW_DAYS;
}

/* The last day a compound can be due, or null when its rule runs on with no
   end: the end of its window (toDay, toWeek, forWeeks) or of its taper, read
   as tlDueOn reads them. */
function tlRuleLastDay(protocol, c) {
  if (!c || !c.rule) return null;
  var rule = tlNormalizeRule(c.rule), w = tlRuleWindow(rule, tlRuleAnchor(protocol, c));
  if (!w.anchor) return null;
  var last = w.toDay;
  if (rule.taper && rule.taper.length) last = Math.min(last, w.fromDay + rule.taper.length * (rule.per === 'day' ? 1 : 7) - 1);
  return isFinite(last) ? new Date(w.anchor.getFullYear(), w.anchor.getMonth(), w.anchor.getDate() + last) : null;
}

/* How long `left` doses last from `date`: { days, lasts }.

   Walks the days from `date`, taking out every dose due, and `days` is the
   offset of the first day with a dose they cannot cover (0 when one due
   today cannot be). Today counts in full whether or not today's doses are
   logged yet, as it did in the average: six left of a daily compound is six
   days, the design's own number, and a count that is a day early errs the
   safe way. `lasts` is true when they cover every dose until the rule ends;
   `days` is then null. `days` is also null, with `lasts` false, when they
   outlast the horizon on a rule with no end. */
function tlSupplyDays(protocol, c, left, date) {
  var start = tlDay(tlDayKey(date)), end = tlRuleLastDay(protocol, c);
  var reach = end ? tlDaysBetween(start, end) + 1 : Infinity;
  var span = Math.min(TL_SUPPLY_HORIZON_DAYS, reach);
  for (var i = 0; i < span; i++) {
    var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (tlDoseDueOn(protocol, c, day) === null) continue;
    if (left < c.slots.length) return { days: i, lasts: false };
    left -= c.slots.length;
  }
  return { days: null, lasts: reach <= TL_SUPPLY_HORIZON_DAYS };
}

/* Doses of a compound logged at or after an instant. With the protocol, a
   dose logged the old way by a name another line shares counts only for the
   line it was matched to. */
function tlDosesSince(entries, c, sinceIso, protocol) {
  var since = sinceIso ? new Date(sinceIso).getTime() : 0, n = 0, cache = {};
  (entries || []).forEach(function (e) {
    if (!tlEntryIsFor(e, c) || !(new Date(e.ts).getTime() >= since)) return;
    if (protocol && !e.key && tlEntryOwner(protocol, e, entries, cache) !== c.key) return;
    n++;
  });
  return n;
}

/* Where a compound's supply stands.
 *
 *   { known, per, left, spare, daily, days, state, stock, note }
 *
 * `known` is false until the user has said how many doses a vial holds and
 * how many are left; nothing is estimated in its place. `days` is how long
 * the OPEN vial lasts on the protocol's schedule, which is when a spare has
 * to be opened or, with none, when the compound runs out (tlSupplyDays). It
 * is null when the vial lasts the protocol, or lasts past the 400 days looked
 * ahead. `daily` is the average rate, for display only.
 *
 *   danger   7 days or fewer and no spare vial
 *   ok       more than 21 days, or null days: it lasts
 *   warn     anything else
 *
 * A compound with no schedule has neither days nor a state.
 */
function tlSupply(protocol, c, entries, date) {
  var inv = c && c.inv;
  var out = { known: false, per: inv ? inv.per : null, left: null, spare: inv ? (inv.spare || 0) : 0,
              daily: tlDailyUse(protocol, c, date), days: null, state: null, stock: '', note: '' };
  if (!inv || !(inv.per > 0) || inv.left === null || inv.left === undefined) return out;

  var left = inv.left - tlDosesSince(entries, c, inv.since, protocol), spare = inv.spare || 0;
  while (left <= 0 && spare > 0) { left += inv.per; spare--; }
  if (left < 0) left = 0;

  out.known = true;
  out.left = left;
  out.spare = spare;
  out.note = left + ' of ' + inv.per + ' doses left in the vial';
  var lasts = false;
  if (c.rule && (c.slots || []).length) {
    var run = tlSupplyDays(protocol, c, left, date);
    out.days = run.days;
    lasts = run.lasts;
    out.state = out.days === null ? 'ok' : (out.days <= 7 && !spare) ? 'danger' : out.days > 21 ? 'ok' : 'warn';
  }
  var vials = spare === 1 ? '1 spare vial' : spare + ' spare vials';
  if (lasts) {
    out.stock = 'Lasts the protocol' + (spare ? ' · ' + vials : '');
  } else if (spare) {
    out.stock = vials + (spare === 1 ? ' · open it' : ' · open one') +
      (out.days === null ? '' : out.days === 0 ? ' today' : ' in ' + out.days + ' d');
  } else {
    out.stock = out.state === 'danger' ? 'No spare vial · reorder' : 'No spare vial';
  }
  return out;
}

/* Supply for every compound that has an inventory, soonest to run out first.
   The first row is Home's "Next vial needed". */
function tlSupplyAll(protocol, entries, date) {
  var rows = [];
  (protocol.compounds || []).forEach(function (c) {
    var s = tlSupply(protocol, c, entries, date);
    if (!s.known) return;
    s.key = c.key;
    s.name = c.name;
    rows.push(s);
  });
  return rows.sort(function (a, b) {
    return (a.days === null ? Infinity : a.days) - (b.days === null ? Infinity : b.days);
  });
}

/* Set a compound's inventory from what the user entered. Returns the inv, or
   null if the numbers are not usable; nothing is changed in that case. */
function tlSetInventory(c, values, nowIso) {
  var per = Math.floor(+values.per), left = Math.floor(+values.left), spare = Math.floor(+(values.spare || 0));
  if (!(per > 0) || !(left >= 0) || left > per || !(spare >= 0)) return null;
  c.inv = { per: per, left: left, spare: spare, since: nowIso };
  return c.inv;
}

/* The pips under an inventory row: one per dose in the vial, the first `left`
   of them filled. */
function tlSupplyPips(s) {
  var pips = [];
  for (var i = 0; i < (s.per || 0); i++) pips.push(i < s.left);
  return pips;
}
