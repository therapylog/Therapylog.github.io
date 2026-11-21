/* The compound sheet: add or edit one compound of a protocol.
 *
 * Onboarding's "Build your stack" (3d) opens it, and the Protocol screen (6a)
 * will. It collects the fields that setup.js turns into a compound; the
 * caller decides what saving means.
 *
 *   tlCompoundSheet({ compound, protocol, onSave(compound), onRemove(),
 *                     supply, title, saveLabel })
 *
 * With `supply` (the Protocol screen) it also edits the compound's count:
 * doses per vial, doses left now and spare vials (tlSetInventory).
 *
 * The dose field takes whatever the user's protocol says. Nothing is filled
 * in for them and nothing is suggested.
 */

/* Monday first, as the rest of the app reads weekdays. */
var TL_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/* Encyclopedia names for the name field's suggestions. */
function tlCompoundNames() {
  if (tlCompoundNames.list) return tlCompoundNames.list;
  var seen = {}, out = [];
  try {
    (DB.classes || []).forEach(function (cl) {
      (cl.drugs || []).forEach(function (d) {
        if (d && d.name && !seen[d.name]) { seen[d.name] = true; out.push(d.name); }
      });
    });
  } catch (e) { /* no encyclopedia: the field still takes any name */ }
  out.sort(function (a, b) { return a.localeCompare(b); });
  tlCompoundNames.list = out;
  return out;
}

/* The four slot buttons: Morning, Midday, Evening, Bedtime. Each toggles. */
function tlSlotButtons(slots, groupLabel) {
  return '<div class="tl-slots" role="group" aria-label="' + tlEsc(groupLabel) + '">' +
    TL_SLOTS.map(function (s) {
      return '<button type="button" class="tl-slot" data-slot="' + s.key + '" aria-pressed="' +
        ((slots || []).indexOf(s.key) >= 0) + '"><span>' + tlEsc(s.label) + '</span></button>';
    }).join('') + '</div>';
}

function tlEveryText(n) { return 'Every ' + n + ' days'; }

function tlCompoundSheet(opts) {
  opts = opts || {};
  var prev = opts.compound || null;
  var env = typeof tlEnv === 'function' ? tlEnv() : {};
  var repeat = prev ? tlRepeatOf(prev.rule) : { mode: 'daily' };
  var days = repeat.mode === 'days' ? repeat.days.slice() : [];
  var every = repeat.mode === 'every' ? repeat.n : 3;
  var routeTouched = !!(prev && prev.route);
  var dose = prev && prev.dose;
  var unit = dose && dose.unit && TL_UNITS.indexOf(dose.unit) >= 0 ? dose.unit : 'mg';

  var repeatOpts = [{ value: 'daily', label: 'Daily' }, { value: 'days', label: 'Set days' }, { value: 'every', label: 'Interval' }];

  /* Supply, when the caller asks (the Protocol screen): the count as it
     stands now, which a save sets afresh only if one of its fields changed. */
  var supplyNow = null, spare = 0, supplyTouched = false;
  if (opts.supply && prev && prev.inv && typeof tlSupply === 'function') {
    var dd = gd();
    supplyNow = tlSupply(opts.protocol, prev, dd.entries || [], tlDayKey(new Date()));
    spare = supplyNow.known ? supplyNow.spare : (prev.inv.spare || 0);
  }
  var supplyNote = function (per, left) {
    return per > 0 && left !== '' && left !== null && left !== undefined ? left + ' of ' + per + ' doses left in the open vial' : 'Enter both to see what is left and when to reorder.';
  };

  var html = '<form class="tl-cs" novalidate>' +
    '<h2 class="ds-h2" id="tl-cs-title" tabindex="-1">' + tlEsc(prev ? (opts.title || 'Edit compound') : 'Add compound') + '</h2>' +

    '<div class="ds-field"><label for="tl-cs-name">Name</label>' +
    '<input class="ds-input" id="tl-cs-name" type="text" list="tl-cs-names" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" value="' + tlEsc(prev ? prev.name : '') + '">' +
    '<datalist id="tl-cs-names">' + tlCompoundNames().map(function (n) { return '<option value="' + tlEsc(n) + '">'; }).join('') + '</datalist></div>' +

    '<div class="ds-field"><label for="tl-cs-amount">Your dose</label>' +
    '<div class="tl-cs-dose"><input class="ds-input" id="tl-cs-amount" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done"' +
      ' value="' + tlEsc(dose && dose.amount !== null && dose.amount !== undefined ? dose.amount : '') + '"' +
      (dose && (dose.amount === null || dose.amount === undefined) && dose.text ? ' placeholder="' + tlEsc(dose.text) + '"' : '') + '>' +
    '<select class="ds-input" id="tl-cs-unit" aria-label="Unit">' +
      TL_UNITS.map(function (u) { return '<option' + (u === unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') +
    '</select></div>' +
    '<p class="ds-small ds-muted">As your protocol says. Nothing is suggested.</p></div>' +

    '<div class="ds-field"><span class="ds-field-label" id="tl-cs-repeat-l">Repeat</span>' +
    (repeat.mode === 'keep' ? '<p class="ds-small ds-muted" id="tl-cs-keep">Now: ' + tlEsc(repeat.label) + '. Pick one below to change it.</p>' : '') +
    tlSegmented('Repeat', repeatOpts, repeat.mode === 'keep' ? null : repeat.mode, true) +
    '<div class="tl-cs-days" role="group" aria-label="Days"' + (repeat.mode === 'days' ? '' : ' hidden') + '>' +
      TL_DAY_ORDER.map(function (d) {
        return '<button type="button" class="tl-slot tl-cs-day" data-day="' + d + '" aria-pressed="' + (days.indexOf(d) >= 0) + '"><span>' + TL_WEEKDAYS[d] + '</span></button>';
      }).join('') + '</div>' +
    '<div class="tl-cs-every"' + (repeat.mode === 'every' ? '' : ' hidden') + '>' +
      '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-every="-1" aria-label="Fewer days between doses">' + tlIcon('minus') + '</button>' +
      '<span class="tl-cs-every-v" aria-live="polite">' + tlEveryText(every) + '</span>' +
      '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-every="1" aria-label="More days between doses">' + tlIcon('plus') + '</button>' +
    '</div></div>' +

    '<div class="ds-field"><span class="ds-field-label">How it is taken</span>' +
    tlSegmented('How it is taken', TL_ROUTES_TAKEN, tlRouteChoice(prev ? prev.route : null), true) + '</div>' +

    '<div class="ds-field"><span class="ds-field-label">Times of day</span>' +
    tlSlotButtons(prev ? prev.slots : ['am'], 'Times of day') +
    '<p class="ds-small ds-muted">Each time is a round. Its exact hour is set with the round.</p></div>' +

    (opts.supply ? '<div class="ds-field tl-cs-supply"><span class="ds-field-label">Supply</span>' +
      '<div class="tl-cs-supply-row">' +
        '<div class="ds-field"><label for="tl-cs-per">Doses per vial</label>' +
          '<input class="ds-input" id="tl-cs-per" type="text" inputmode="numeric" autocomplete="off" value="' + tlEsc(prev && prev.inv && prev.inv.per ? prev.inv.per : '') + '"></div>' +
        '<div class="ds-field"><label for="tl-cs-left">Doses left now</label>' +
          '<input class="ds-input" id="tl-cs-left" type="text" inputmode="numeric" autocomplete="off" value="' + tlEsc(supplyNow && supplyNow.known ? supplyNow.left : (prev && prev.inv && prev.inv.left !== null && prev.inv.left !== undefined ? prev.inv.left : '')) + '"></div>' +
      '</div>' +
      '<div class="tl-cs-spare"><span class="tl-cs-spare-l">Spare vials</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-spare="-1" aria-label="One spare vial fewer">' + tlIcon('minus') + '</button>' +
        '<span class="tl-cs-spare-v" aria-live="polite">' + spare + '</span>' +
        '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" data-spare="1" aria-label="One spare vial more">' + tlIcon('plus') + '</button></div>' +
      '<p class="ds-small ds-muted tl-cs-supply-note">' + tlEsc(supplyNote(prev && prev.inv ? prev.inv.per : null, supplyNow && supplyNow.known ? supplyNow.left : '')) + '</p>' +
      '</div>' : '') +

    '<p class="tl-cs-error" role="alert"></p>' +
    '<button type="submit" class="ds-btn ds-btn-primary ds-btn-block tl-cs-save">' + tlEsc(prev ? (opts.saveLabel || 'Save') : 'Add to stack') + '</button>' +
    (prev && opts.onRemove ? '<button type="button" class="ds-btn ds-btn-ghost ds-btn-block tl-cs-remove" data-cs-remove>' + tlIcon('trash') + 'Remove ' + tlEsc(prev.name) + '</button>' : '') +
    '</form>';

  var sheet = tlOpenSheet(html, { label: prev ? 'Edit compound' : 'Add compound', focus: prev ? '#tl-cs-title' : '#tl-cs-name' });
  var el = sheet.el, form = el.querySelector('form');
  var $ = function (sel) { return el.querySelector(sel); };

  /* With nothing chosen yet, a radio group still needs one option the Tab
     key reaches. */
  Array.prototype.forEach.call(el.querySelectorAll('.ds-seg'), function (seg) {
    if (!seg.querySelector('[tabindex="0"]')) {
      var first = seg.querySelector('.ds-seg-opt');
      if (first) first.setAttribute('tabindex', '0');
    }
  });

  function segValue(name) {
    var on = el.querySelector('[data-ds-seg="' + name + '"] [aria-checked="true"]');
    return on ? on.getAttribute('data-value') : null;
  }
  function setSeg(name, value) {
    Array.prototype.forEach.call(el.querySelectorAll('[data-ds-seg="' + name + '"] .ds-seg-opt'), function (o) {
      var on = o.getAttribute('data-value') === value;
      o.setAttribute('aria-checked', on ? 'true' : 'false');
      o.setAttribute('tabindex', on ? '0' : '-1');
    });
  }
  function showError(text, field) {
    $('.tl-cs-error').textContent = text || '';
    if (field) field.focus();
  }

  el.addEventListener('ds-change', function (e) {
    var seg = e.target.getAttribute && e.target.getAttribute('data-ds-seg');
    if (seg === 'Repeat') {
      var mode = e.detail.value;
      $('.tl-cs-days').hidden = mode !== 'days';
      $('.tl-cs-every').hidden = mode !== 'every';
      var keep = $('#tl-cs-keep');
      if (keep) keep.hidden = true;
    } else if (seg === 'How it is taken') {
      routeTouched = true;
    }
  });

  el.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var toggle = t.closest('.tl-slot');
    if (toggle) {
      toggle.setAttribute('aria-pressed', toggle.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      return;
    }
    var sp = t.closest('[data-spare]');
    if (sp) {
      spare = Math.max(0, Math.min(99, spare + (+sp.getAttribute('data-spare'))));
      $('.tl-cs-spare-v').textContent = spare;
      supplyTouched = true;
      return;
    }
    var step = t.closest('[data-every]');
    if (step) {
      every = Math.max(2, Math.min(TL_EVERY_MAX, every + (+step.getAttribute('data-every'))));
      $('.tl-cs-every-v').textContent = tlEveryText(every);
      return;
    }
    if (t.closest('[data-cs-remove]')) {
      sheet.close();
      opts.onRemove();
    }
  });

  /* Any edit to the supply fields sets the count afresh on save. */
  ['#tl-cs-per', '#tl-cs-left'].forEach(function (sel) {
    var f = $(sel);
    if (!f) return;
    f.addEventListener('input', function () {
      supplyTouched = true;
      var note = $('.tl-cs-supply-note');
      if (note) note.textContent = supplyNote(+$('#tl-cs-per').value || null, $('#tl-cs-left').value.trim());
    });
  });

  /* A name the encyclopedia knows says how it is usually taken. That fills
     the route only until the user picks one. */
  $('#tl-cs-name').addEventListener('change', function () {
    if (routeTouched || !env.resolve) return;
    var id = env.resolve(this.value);
    var route = id && env.medium ? tlRouteForMedium(env.medium(id)) : null;
    if (route) setSeg('How it is taken', tlRouteChoice(route));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var mode = segValue('Repeat') || (repeat.mode === 'keep' ? 'keep' : 'daily');
    var fields = {
      name: $('#tl-cs-name').value,
      amount: $('#tl-cs-amount').value,
      unit: $('#tl-cs-unit').value,
      repeat: mode === 'days' ? { mode: 'days', days: Array.prototype.map.call(el.querySelectorAll('.tl-cs-day[aria-pressed="true"]'), function (b) { return +b.getAttribute('data-day'); }) }
        : mode === 'every' ? { mode: 'every', n: every }
        : mode === 'keep' ? repeat
        : { mode: 'daily' },
      route: segValue('How it is taken'),
      slots: Array.prototype.map.call(el.querySelectorAll('.tl-slots .tl-slot[aria-pressed="true"]'), function (b) { return b.getAttribute('data-slot'); })
    };
    var problem = tlCompoundProblem(fields);
    if (problem) {
      var field = /name/.test(problem) ? $('#tl-cs-name') : /dose/.test(problem) ? $('#tl-cs-amount')
        : /day/.test(problem) ? el.querySelector('.tl-cs-day, [data-every]') : null;
      showError(problem, field);
      return;
    }
    var today = typeof tlDayKey === 'function' ? tlDayKey(new Date()) : null;
    var c = tlCompoundOfFields(fields, prev, opts.protocol, env, today);
    if (opts.supply && supplyTouched) {
      var values = { per: $('#tl-cs-per').value, left: $('#tl-cs-left').value, spare: spare };
      var bad = tlSupplyProblem(values);
      if (bad) { showError(bad, /per vial/.test(bad) ? $('#tl-cs-per') : $('#tl-cs-left')); return; }
      if (String(values.per).trim() === '' && String(values.left).trim() === '') c.inv = null;
      else tlSetInventory(c, values, new Date().toISOString());
    }
    sheet.close();
    if (opts.onSave) opts.onSave(c);
  });

  return sheet;
}
