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
 * size coming from the user instead of a fixed table.
 *
 * The numbers are the user's. Nothing here supplies a vial size or a dose.
 */

var TL_SUPPLY_WINDOW_DAYS = 28;

/* Doses a day, averaged over the four weeks from `date`. Four weeks, because
   that is a whole number of weeks for weekday rules and a whole number of
   cycles for every-3.5-days, so "Mon and Thu" comes out as exactly 2/7. A
   taper that ends inside the window lowers the average, which is right: the
   vial then lasts longer. */
function tlDailyUse(protocol, c, date) {
  if (!c || !c.rule || !(c.slots || []).length) return 0;
  var start = tlDay(tlDayKey(date)), n = 0;
  for (var i = 0; i < TL_SUPPLY_WINDOW_DAYS; i++) {
    var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (tlDoseDueOn(protocol, c, day) !== null) n += c.slots.length;
  }
  return n / TL_SUPPLY_WINDOW_DAYS;
}

/* Doses of a compound logged at or after an instant. */
function tlDosesSince(entries, c, sinceIso) {
  var since = sinceIso ? new Date(sinceIso).getTime() : 0, n = 0;
  (entries || []).forEach(function (e) {
    if (tlEntryIsFor(e, c) && new Date(e.ts).getTime() >= since) n++;
  });
  return n;
}

/* Where a compound's supply stands.
 *
 *   { known, per, left, spare, daily, days, state, stock, note }
 *
 * `known` is false until the user has said how many doses a vial holds and
 * how many are left; nothing is estimated in its place. `days` is how long
 * the OPEN vial lasts at the protocol's rate, which is when a spare has to be
 * opened or, with none, when the compound runs out.
 *
 *   danger   7 days or fewer and no spare vial
 *   ok       more than 21 days
 *   warn     anything else
 */
function tlSupply(protocol, c, entries, date) {
  var inv = c && c.inv;
  var out = { known: false, per: inv ? inv.per : null, left: null, spare: inv ? (inv.spare || 0) : 0,
              daily: tlDailyUse(protocol, c, date), days: null, state: null, stock: '', note: '' };
  if (!inv || !(inv.per > 0) || inv.left === null || inv.left === undefined) return out;

  var left = inv.left - tlDosesSince(entries, c, inv.since), spare = inv.spare || 0;
  while (left <= 0 && spare > 0) { left += inv.per; spare--; }
  if (left < 0) left = 0;

  out.known = true;
  out.left = left;
  out.spare = spare;
  out.note = left + ' of ' + inv.per + ' doses left in the vial';
  if (out.daily > 0) {
    out.days = Math.ceil(left / out.daily);
    out.state = (out.days <= 7 && !spare) ? 'danger' : out.days > 21 ? 'ok' : 'warn';
  }
  if (spare) {
    out.stock = (spare === 1 ? '1 spare vial · open it' : spare + ' spare vials · open one') +
      (out.days === null ? '' : ' in ' + out.days + ' d');
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
