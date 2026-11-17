/* The round cards: a round's name and doses, its alert switch, and its time
 * in quarter-hour steps. Onboarding's last step (3d) and Customize Home (2b)
 * both show them, from the same protocol, so a time moved in one shows in
 * the other. Each screen handles the events itself:
 *
 *   ds-change on  #{prefix}-alert-{slot}   the alert switch
 *   ds-change on  #{prefix}-discreet       discreet alerts
 *   click on      [data-shift="{slot}:±1"] earlier, later
 */

function tlRoundCardsHtml(protocol, prefix, emptyText) {
  var rounds = tlSetupRounds(protocol);
  if (!rounds.length) return '<p class="tl-ob-empty">' + tlEsc(emptyText) + '</p>';
  return rounds.map(function (r) {
    var n = r.names.length;
    return '<div class="tl-round"' + (r.alert ? '' : ' data-off') + '>' +
      '<div class="tl-round-head"><div class="tl-round-main">' +
        '<div class="tl-round-title">' + tlEsc(r.label) + ' round · ' + tlDoseCount(n) + '</div>' +
        '<div class="tl-round-names">' + tlEsc(r.names.join(' · ')) + '</div></div>' +
        tlToggle(prefix + '-alert-' + r.slot, r.alert, r.label + ' round alert') + '</div>' +
      '<div class="tl-round-time">' + tlIcon('bell-ringing') + '<span class="tl-round-time-l">Alert at</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-shift="' + r.slot + ':-1" aria-label="' + tlEsc(r.label) + ' round earlier">' + tlIcon('minus') + '</button>' +
        '<span class="tl-round-time-v" aria-live="polite">' + r.time + '</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-shift="' + r.slot + ':1" aria-label="' + tlEsc(r.label) + ' round later">' + tlIcon('plus') + '</button>' +
      '</div></div>';
  }).join('');
}

function tlDiscreetRowHtml(on, prefix) {
  return '<div class="tl-ob-discreet">' + tlIcon('eye-slash') +
    '<div class="tl-round-main"><div class="tl-round-title">Discreet alerts</div><div class="tl-round-names">Hide compound names on the lock screen</div></div>' +
    tlToggle(prefix + '-discreet', !!on, 'Discreet alerts') + '</div>';
}
