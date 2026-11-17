/* Onboarding: screens 3d and 4b.
 *
 *   1  Welcome            "Know where you stand."
 *   2  What are you tracking?   sets up Home (settings.focus)
 *   3  Build your stack   the protocol's compounds and their rounds
 *   4  Choose your figure (4b)  the body map (settings.figure)
 *   5  Your rounds        each round's time and alert, and discreet alerts
 *
 * These write the protocol and rounds that everything else reads.
 *
 * Before step 1 comes the age and terms gate the old onboarding had ("Before
 * you begin"), worded as it was: it is a legal acceptance, versioned by
 * DISCLAIMER_VERSION, and someone who accepted an older version sees it again
 * on its own, without the rest.
 *
 * Step 1 also offers to restore a backup, for someone moving to a new phone.
 * Setting up first and importing after would not work: an import keeps the
 * protocol already on the device, so the backup's would be dropped.
 *
 * Nothing is written until the last step, so leaving half way changes
 * nothing. The old onboarding (#onboarding) is hidden by the stylesheet.
 */

var TL_OB = null;            /* the flow's state while it is open */
var TL_OB_STEPS = 5;

/* Who sees it: anyone who has not accepted the current terms, and on a fresh
   install, anyone who has not been through setup. A record with a name, a
   protocol or a log in it is not a fresh install. */
function tlObWanted(d) {
  var gate = typeof disclaimerCurrent === 'function' ? !disclaimerCurrent() : false;
  var done = false;
  try { done = !!localStorage.getItem('tl-ob-done'); } catch (e) {}
  var used = !!(d && ((d.profile && d.profile.name) || d.proto || d.protocol || (d.entries && d.entries.length)));
  return { gate: gate, setup: !done && !used };
}

function tlObStart() {
  var want = tlObWanted(gd());
  if (!want.gate && !want.setup) return false;
  tlObOpen(want.gate ? 0 : 1, !want.setup);
  return true;
}

function tlObOpen(step, gateOnly) {
  var d = gd();
  var protocol = tlProtocol(d, tlEnv());
  delete protocol.derived;
  var sex = d && d.profile && d.profile.sex;
  TL_OB = {
    step: step,
    gateOnly: !!gateOnly,
    focus: (tlSetting(d, 'focus', []) || []).slice(),
    figure: tlSetting(d, 'figure', sex === 'Female' ? 'female' : 'male'),
    protocol: protocol,
    error: ''
  };
  var root = document.getElementById('tl-ob');
  if (!root) {
    root = document.createElement('div');
    root.id = 'tl-ob';
    root.className = 'ds-ui tl-ob';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Set up TherapyLog');
    root.addEventListener('click', tlObClick);
    root.addEventListener('ds-change', tlObChange);
    document.body.appendChild(root);
  }
  /* The app underneath is out of reach while this is open. */
  Array.prototype.forEach.call(document.body.children, function (n) {
    if (n !== root && !n.hasAttribute('inert')) { n.setAttribute('inert', ''); n.setAttribute('data-tl-ob-inert', ''); }
  });
  tlObRender();
}

function tlObClose() {
  var root = document.getElementById('tl-ob');
  if (root) root.parentNode.removeChild(root);
  Array.prototype.forEach.call(document.querySelectorAll('[data-tl-ob-inert]'), function (n) {
    n.removeAttribute('inert');
    n.removeAttribute('data-tl-ob-inert');
  });
  TL_OB = null;
}

/* ---- drawing ----------------------------------------------------------- */

function tlObRender() {
  var root = document.getElementById('tl-ob');
  if (!root || !TL_OB) return;
  var s = TL_OB.step, view = tlObView(s);
  var top = '';
  if (s >= 1) {
    top = (s >= 2 ? '<button type="button" class="ds-btn ds-btn-ghost tl-ob-back" data-ob="back" aria-label="Back">' + tlIcon('caret-left') + '</button>' : '');
    for (var i = 1; i <= TL_OB_STEPS; i++) top += '<span class="tl-ob-pip' + (i <= s ? ' tl-ob-pip-on' : '') + '" aria-hidden="true"></span>';
    top += '<span class="tl-ob-count">' + s + ' of ' + TL_OB_STEPS + '</span>';
  }
  root.innerHTML = '<div class="tl-ob-frame">' +
    '<div class="tl-ob-top">' + top + '</div>' +
    '<div class="tl-ob-body">' + view.body + '</div>' +
    '<div class="tl-ob-foot">' + (TL_OB.error ? '<p class="tl-ob-error" role="alert">' + tlEsc(TL_OB.error) + '</p>' : '') + view.foot + '</div>' +
    '</div>';
}

/* Draw the step and put focus on its heading, so a screen reader starts at
   the top of the new step. */
function tlObGo(step) {
  TL_OB.step = step;
  TL_OB.error = '';
  tlObRender();
  var root = document.getElementById('tl-ob');
  var h = root && root.querySelector('h1');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  var body = root && root.querySelector('.tl-ob-body');
  if (body) body.scrollTop = 0;
}

function tlObCta(label, action, arrow) {
  return '<button type="button" class="ds-btn ds-btn-primary ds-btn-block tl-ob-cta" data-ob="' + action + '">' +
    tlEsc(label) + (arrow === false ? '' : tlIcon('arrow-right')) + '</button>';
}

function tlObPoint(icon, title, sub) {
  return '<div class="tl-ob-point">' + tlHex(icon) +
    '<div><div class="tl-ob-point-t">' + tlEsc(title) + '</div><div class="tl-ob-point-s">' + tlEsc(sub) + '</div></div></div>';
}

function tlObView(step) {
  var p = TL_OB.protocol;

  if (step === 0) {
    return {
      body: '<div class="tl-ob-gate">' + tlHex('stethoscope', { size: 'lg' }) +
        '<h1 class="tl-ob-h1">Before you begin</h1>' +
        '<p>TherapyLog is an <strong>informational and tracking tool only</strong>. It does not provide medical advice, diagnosis, or treatment, and it is not a substitute for a qualified healthcare provider.</p>' +
        '<p>Compound information is provided for educational purposes. Always consult your physician before starting, stopping, or changing any medication or protocol.</p>' +
        '<p>By continuing, you confirm you are <strong>18 or older</strong>, that you understand the above, and that you agree to the ' +
        '<a href="https://therapylog.app/terms" target="_blank" rel="noopener">Terms of Use</a> and the ' +
        '<a href="https://therapylog.app/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p></div>',
      foot: tlObCta('I am 18 or older. Continue', 'accept', false)
    };
  }

  if (step === 1) {
    return {
      body: '<img class="tl-ob-icon" src="/icons/icon.svg?v=2026-08-30" alt="TherapyLog" width="56" height="56">' +
        '<h1 class="tl-ob-h1 tl-ob-hero">Know where you stand.</h1>' +
        '<p class="tl-ob-lede">Doses, levels, labs and supply in one log.</p>' +
        '<div class="ds-hr"></div>' + tlObPoint('device-mobile', 'Stays on this phone', 'No account. Your log never leaves the device.') +
        '<div class="ds-hr"></div>' + tlObPoint('stethoscope', 'Your physician decides', 'TherapyLog records and presents. It does not diagnose or advise.') +
        '<div class="ds-hr"></div>' + tlObPoint('lock-open', 'Free to start', 'Dose log, labs, Library and calculators cost nothing.') +
        '<div class="ds-hr"></div>',
      foot: tlObCta('Set up my log', 'next') +
        '<button type="button" class="ds-btn ds-btn-ghost ds-btn-block" data-ob="restore">' + tlIcon('file-arrow-up') + 'Restore from a backup</button>'
    };
  }

  if (step === 2) {
    return {
      body: '<h1 class="tl-ob-h1">What are you tracking?</h1>' +
        '<p class="tl-ob-lede">Pick any. This sets up Home, and you can change it later.</p>' +
        '<div class="tl-ob-tiles">' + TL_FOCUS.map(function (f) {
          var on = TL_OB.focus.indexOf(f.key) >= 0;
          return '<button type="button" class="tl-ob-tile" data-focus="' + f.key + '" aria-pressed="' + on + '">' +
            '<span class="tl-ob-tile-top">' + tlIcon(f.icon) + tlIcon('check-circle', true) + '</span>' + tlEsc(f.label) + '</button>';
        }).join('') + '</div>',
      foot: tlObCta('Continue', 'next')
    };
  }

  if (step === 3) {
    var rows = p.compounds.map(function (c, i) {
      return '<div class="tl-stack-row">' +
        '<button type="button" class="tl-stack-head" data-edit="' + i + '" aria-label="Edit ' + tlEsc(c.name) + ', ' + tlEsc(tlCompoundMeta(c)) + '">' +
          '<span class="tl-stack-name">' + tlEsc(c.name) + '</span>' +
          '<span class="tl-stack-meta">' + tlEsc(tlCompoundMeta(c)) + '</span>' + tlIcon('note-pencil') + '</button>' +
        tlSlotButtons(c.slots, 'Times of day for ' + c.name).replace('class="tl-slots"', 'class="tl-slots" data-stack="' + i + '"') +
        '</div><div class="ds-hr"></div>';
    }).join('');
    return {
      body: '<h1 class="tl-ob-h1">Build your stack</h1>' +
        '<p class="tl-ob-lede">' + (p.compounds.length
          ? 'Tap every time of day you take each one. A compound can have as many as its protocol needs.'
          : 'Add each compound you take, with your dose and the times of day you take it. You can also skip this and add them later under Protocol.') + '</p>' +
        '<div class="ds-hr"></div>' + rows +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-block tl-ob-add" data-ob="add">' + tlIcon('plus') + 'Add compound</button>' +
        '<p class="tl-ob-note">Exact hours are set per round on the next step. Doses are whatever you enter; nothing is suggested.</p>',
      foot: tlObCta(p.compounds.length ? 'Continue' : 'Skip for now', 'next')
    };
  }

  if (step === 4) {
    var fig = function (key, label) {
      var on = TL_OB.figure === key;
      return '<button type="button" class="tl-ob-fig" data-figure="' + key + '" aria-pressed="' + on + '">' +
        '<span class="tl-ob-fig-img tl-ob-fig-' + key + '" aria-hidden="true"></span>' +
        '<span class="tl-ob-fig-label">' + label + tlIcon('check-circle', true) + '</span></button>';
    };
    return {
      body: '<h1 class="tl-ob-h1">Choose your figure</h1>' +
        '<p class="tl-ob-lede">It is the body map you tap when you log an injection site. You can change it later in Settings.</p>' +
        '<div class="tl-ob-figs" role="group" aria-label="Figure">' + fig('male', 'Male') + fig('female', 'Female') + '</div>' +
        '<p class="tl-ob-aside">' + tlIcon('device-mobile') + '<span>Only used to draw the map. It stays on this phone like everything else.</span></p>',
      foot: tlObCta('Continue', 'next')
    };
  }

  /* step 5 */
  var rounds = tlSetupRounds(p);
  var cards = rounds.map(function (r) {
    var n = r.names.length;
    return '<div class="tl-round"' + (r.alert ? '' : ' data-off') + '>' +
      '<div class="tl-round-head"><div class="tl-round-main">' +
        '<div class="tl-round-title">' + tlEsc(r.label) + ' round · ' + n + (n === 1 ? ' dose' : ' doses') + '</div>' +
        '<div class="tl-round-names">' + tlEsc(r.names.join(', ')) + '</div></div>' +
        tlToggle('tl-ob-alert-' + r.slot, r.alert, r.label + ' round alert') + '</div>' +
      '<div class="tl-round-time">' + tlIcon('bell-ringing') + '<span class="tl-round-time-l">Alert at</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-shift="' + r.slot + ':-1" aria-label="' + tlEsc(r.label) + ' round earlier">' + tlIcon('minus') + '</button>' +
        '<span class="tl-round-time-v" aria-live="polite">' + r.time + '</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-shift="' + r.slot + ':1" aria-label="' + tlEsc(r.label) + ' round later">' + tlIcon('plus') + '</button>' +
      '</div></div>';
  }).join('');
  return {
    body: '<h1 class="tl-ob-h1">Your rounds</h1>' +
      '<p class="tl-ob-lede">Built from your stack. Each round sends one alert with its own checklist.</p>' +
      (cards || '<p class="tl-ob-empty">No times picked yet. Go back and tap a time on any compound, or add compounds later under Protocol.</p>') +
      '<div class="tl-ob-discreet">' + tlIcon('eye-slash') +
        '<div class="tl-round-main"><div class="tl-round-title">Discreet alerts</div><div class="tl-round-names">Hide compound names on the lock screen</div></div>' +
        tlToggle('tl-ob-discreet', !!p.discreet, 'Discreet alerts') + '</div>',
    foot: tlObCta('Finish and open Home', 'finish', false)
  };
}

/* ---- acting ------------------------------------------------------------ */

function tlObClick(e) {
  if (!TL_OB) return;
  var t = e.target && e.target.closest ? e.target : null;
  if (!t) return;
  var p = TL_OB.protocol;

  var act = t.closest('[data-ob]');
  if (act) {
    var a = act.getAttribute('data-ob');
    if (a === 'back') tlObGo(Math.max(1, TL_OB.step - 1));
    else if (a === 'next') tlObGo(TL_OB.step + 1);
    else if (a === 'accept') tlObAccept();
    else if (a === 'restore') tlObRestore();
    else if (a === 'add') tlObEdit(null);
    else if (a === 'finish') tlObFinish();
    return;
  }

  var tile = t.closest('[data-focus]');
  if (tile) {
    var key = tile.getAttribute('data-focus'), i = TL_OB.focus.indexOf(key);
    if (i >= 0) TL_OB.focus.splice(i, 1); else TL_OB.focus.push(key);
    tile.setAttribute('aria-pressed', i < 0 ? 'true' : 'false');
    return;
  }

  var slot = t.closest('.tl-slots[data-stack] .tl-slot');
  if (slot) {
    var c = p.compounds[+slot.parentNode.getAttribute('data-stack')];
    var k = slot.getAttribute('data-slot'), on = c.slots.indexOf(k) < 0;
    c.slots = TL_SLOT_KEYS.filter(function (x) { return x === k ? on : c.slots.indexOf(x) >= 0; });
    slot.setAttribute('aria-pressed', on ? 'true' : 'false');
    return;
  }

  var edit = t.closest('[data-edit]');
  if (edit) { tlObEdit(+edit.getAttribute('data-edit')); return; }

  var fig = t.closest('[data-figure]');
  if (fig) {
    TL_OB.figure = fig.getAttribute('data-figure');
    Array.prototype.forEach.call(document.querySelectorAll('#tl-ob [data-figure]'), function (b) {
      b.setAttribute('aria-pressed', b === fig ? 'true' : 'false');
    });
    return;
  }

  var shift = t.closest('[data-shift]');
  if (shift) {
    var parts = shift.getAttribute('data-shift').split(':');
    tlShiftSlot(p, parts[0], +parts[1]);
    /* Rounds sort by time, so a step can reorder them: draw again, then put
       focus back on the same button. */
    tlObRender();
    var again = document.querySelector('#tl-ob [data-shift="' + parts.join(':') + '"]');
    if (again) again.focus();
  }
}

function tlObChange(e) {
  if (!TL_OB || !e.detail) return;
  var id = e.target && e.target.id;
  if (id === 'tl-ob-discreet') { TL_OB.protocol.discreet = !!e.detail.checked; return; }
  var m = /^tl-ob-alert-(am|mid|eve|bed)$/.exec(id || '');
  if (m) {
    TL_OB.protocol.slots[m[1]].alert = !!e.detail.checked;
    var card = e.target.closest('.tl-round');
    if (card) { if (e.detail.checked) card.removeAttribute('data-off'); else card.setAttribute('data-off', ''); }
  }
}

/* Add a compound (index null) or edit one. */
function tlObEdit(index) {
  var p = TL_OB.protocol;
  var prev = index === null ? null : p.compounds[index];
  tlCompoundSheet({
    compound: prev,
    protocol: p,
    onSave: function (c) {
      if (!TL_OB) return;
      if (prev) p.compounds[index] = c; else p.compounds.push(c);
      tlObRender();
      var focusOn = document.querySelector('#tl-ob [data-edit="' + (prev ? index : p.compounds.length - 1) + '"]');
      if (focusOn) focusOn.focus();
    },
    onRemove: prev ? function () {
      if (!TL_OB) return;
      p.compounds.splice(index, 1);
      tlObRender();
      var add = document.querySelector('#tl-ob [data-ob="add"]');
      if (add) add.focus();
    } : null
  });
}

/* The terms, accepted. Someone who only needed to accept them again is done;
   anyone else goes on to set up. */
function tlObAccept() {
  if (typeof acceptDisclaimer === 'function') acceptDisclaimer();
  if (TL_OB.gateOnly) { tlObClose(); return; }
  tlObGo(1);
}

/* Restore a backup through the app's own import, then go straight to Home.
   The import reports into #import-result on the old Settings page, which is
   where this learns whether it worked. */
function tlObRestore() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', function () {
    if (!input.files || !input.files[0] || typeof importData !== 'function') return;
    var res = document.getElementById('import-result');
    if (!res) return;
    res.innerHTML = '';
    var mo = new MutationObserver(function () {
      var text = res.textContent || '';
      if (/successful/i.test(text)) {
        mo.disconnect();
        try { localStorage.setItem('tl-ob-done', '1'); } catch (e) {}
        tlObClose();
        tlGo('today', true);
      } else if (/failed/i.test(text)) {
        mo.disconnect();
        if (!TL_OB) return;
        TL_OB.error = 'That file could not be read as a TherapyLog backup.';
        tlObRender();
      }
    });
    mo.observe(res, { childList: true, subtree: true, characterData: true });
    importData({ target: input });
  });
  input.click();
}

function tlObFinish() {
  var d = gd();
  var p = TL_OB.protocol;
  tlFinishSetup(d, { focus: TL_OB.focus, figure: TL_OB.figure, protocol: p }, new Date().toISOString());
  sd(d);
  try {
    localStorage.setItem('tl-ob-done', '1');
    /* The old reminders read their own flag; keep them in step. */
    localStorage.setItem('tl_notif_discreet', p.discreet ? '1' : '0');
  } catch (e) {}
  if (typeof scheduleAllReminders === 'function') { try { scheduleAllReminders(); } catch (e) {} }
  tlObClose();
  tlGo('today', true);
  if (typeof renderDash === 'function') { try { renderDash(); } catch (e) {} }
}
