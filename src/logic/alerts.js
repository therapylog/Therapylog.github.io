/* What an alert says, and when alerts are due.
 *
 * One alert per round, carrying its checklist, in place of one reminder per
 * compound. This file only decides the WORDS and the TIMES. Putting an alert
 * on a lock screen is the native shell's job (LocalNotifications), and on the
 * web, where a closed tab cannot be woken, the fallback is a banner in the
 * app when a round's time has come.
 *
 * A notification can carry buttons but not checkboxes, so the round is logged
 * whole from the lock screen and individual doses are ticked in the app.
 */

function tlDoseCount(n) { return n + (n === 1 ? ' dose' : ' doses'); }

/* The alert for a round that is due.
 *
 *   { id, slot, day, title, lines, body, actions }
 *
 * Lists what is still pending in the round, then the rounds still to come
 * today. In discreet mode the title stays and the compound names go: a phone
 * face-up on a desk should not say what its owner takes. */
function tlRoundAlert(round, later, discreet) {
  var pending = round.doses.filter(function (x) { return !x.at; });
  var title = round.label + ' round · ' + tlDoseCount(pending.length);
  var lines;
  if (discreet) {
    lines = [tlDoseCount(pending.length) + ' due. Open TherapyLog to see them.'];
  } else {
    lines = pending.map(function (x) { return x.name + (x.dose ? ' ' + x.dose : ''); });
    var rest = (later || []).filter(function (r) { return r.doses.some(function (x) { return !x.at; }); });
    if (rest.length) {
      lines.push('Later today · ' + rest.map(function (r) {
        return r.label + ' ' + r.time + ' · ' + r.doses.filter(function (x) { return !x.at; }).map(function (x) { return x.name; }).join(', ');
      }).join('; '));
    }
  }
  var day = pending.length ? pending[0].day : (round.doses[0] ? round.doses[0].day : null);
  return {
    id: 'round:' + round.slot + ':' + day, slot: round.slot, day: day,
    title: title, lines: lines, body: lines.join('\n'),
    actions: [{ id: 'log', title: 'Log ' + round.label.toLowerCase() + ' round' }, { id: 'open', title: 'Open' }]
  };
}

/* What replaces it once the round is logged from the lock screen. */
function tlRoundLoggedAlert(round, count, timeText) {
  return {
    id: 'round:' + round.slot + ':logged', slot: round.slot,
    title: round.label + ' round logged',
    lines: [tlDoseCount(count) + ' at ' + timeText], body: tlDoseCount(count) + ' at ' + timeText,
    actions: [{ id: 'undo', title: 'Undo' }]
  };
}

/* The supply alert, for a compound on its last vial with no spare. */
function tlSupplyAlert(row, discreet) {
  var body = tlDoseCount(row.left) + ' left, no spare in inventory.';
  return {
    id: 'supply:' + row.key, key: row.key,
    title: discreet ? 'Supply is running low.' : row.name + ' is on its last vial.',
    lines: [body], body: body, actions: [{ id: 'open', title: 'Open' }]
  };
}

/* Supply alerts due: every compound in the danger state. */
function tlSupplyAlerts(protocol, entries, date) {
  return tlSupplyAll(protocol, entries, date)
    .filter(function (s) { return s.state === 'danger'; })
    .map(function (s) { return tlSupplyAlert(s, protocol.discreet); });
}

/* The instant a round is due: its slot's time on its day, local. */
function tlRoundInstant(day, t) {
  var d = tlDay(day);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(t / 60), t % 60, 0, 0).getTime();
}

/* The alerts to schedule: one per round whose alert is on, for `days` days
   from `fromMs`, soonest first. Rounds whose time has passed are left out, and
   so are rounds already fully logged. Each row is { at, alert }. This is what
   the native shell hands to the OS scheduler. */
function tlAlertPlan(protocol, entries, fromMs, days) {
  var out = [], start = new Date(fromMs);
  for (var i = 0; i < days; i++) {
    var day = tlDayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    var rounds = tlRoundsFor(protocol, day, entries);
    rounds.forEach(function (r, n) {
      if (!r.alert) return;
      if (!r.doses.some(function (x) { return !x.at; })) return;
      var at = tlRoundInstant(day, r.t);
      if (at <= fromMs) return;
      out.push({ at: at, alert: tlRoundAlert(r, rounds.slice(n + 1), protocol.discreet) });
    });
  }
  return out.sort(function (a, b) { return a.at - b.at; });
}

/* The web fallback: the round to show a banner for right now. That is the
   latest round today whose time has come, whose alert is on, and which still
   has something pending. Null when there is none. The banner is shown whether
   or not notifications are allowed, because it is the only alert a browser
   tab can be relied on to give. */
function tlDueBanner(protocol, entries, nowMs) {
  var day = tlDayKey(new Date(nowMs)), rounds = tlRoundsFor(protocol, day, entries), hit = null, at = -1;
  rounds.forEach(function (r, n) {
    if (!r.alert || !r.doses.some(function (x) { return !x.at; })) return;
    var due = tlRoundInstant(day, r.t);
    if (due <= nowMs) { hit = n; at = due; }
  });
  if (hit === null) return null;
  return { at: at, alert: tlRoundAlert(rounds[hit], rounds.slice(hit + 1), protocol.discreet) };
}
