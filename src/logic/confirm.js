/* The confirm sheet.
 *
 * The app asked its dangerous questions with the browser's confirm(): an
 * unstyled system box that cannot say what is about to be deleted, cannot
 * offer a way out, and on some platforms carries the page's address as its
 * title. This is the sheet that replaces every one of them.
 *
 *   tlConfirm({ tone, icon, title, body, action, exportFirst })
 *     -> Promise of 'action' | 'export' | 'cancel'
 *
 * tlConfirmCopy() holds the words for each question, taken from the design
 * (screen 5d), so the wording is in one place and under test. tlAsk() is what
 * a caller normally wants: it shows the sheet, runs the backup export if the
 * user asks for that first and shows the sheet again, and resolves to true
 * only when they choose the action.
 *
 * The sheet is built here with the app's current colours. Its final styling
 * arrives with the redesign's components; its behaviour does not change then.
 */

/* An instant in the words the sheet uses: "today at 07:03", "yesterday at
   22:31", "7 Nov at 07:03", and with the year when it is not this one. */
function tlWhen(ts, nowMs) {
  var x = new Date(ts), now = new Date(nowMs);
  if (isNaN(x)) return '';
  var time = tlMinToTime(x.getHours() * 60 + x.getMinutes());
  var day = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  var diff = Math.round((day(now) - day(x)) / 864e5);
  if (diff === 0) return 'today at ' + time;
  if (diff === 1) return 'yesterday at ' + time;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return x.getDate() + ' ' + months[x.getMonth()] + (x.getFullYear() !== now.getFullYear() ? ' ' + x.getFullYear() : '') + ' at ' + time;
}

/* The words for each question. `detail` fills in what is being deleted, so the
   sheet names the thing rather than asking in the abstract.
 *
 *   protocol   clear the active protocol
 *   entry      delete one logged dose          detail: { name, dose, ts }
 *   reading    delete one blood-pressure reading   detail: { sys, dia, hr, ts }
 *   checkin    delete one progress check-in    detail: { label, date }
 *   wipe       delete everything; offers a backup first
 *   demo       replace the log with demo data; offers a backup first
 */
function tlConfirmCopy(kind, detail, nowMs) {
  detail = detail || {};
  var join = function (parts) { return parts.filter(function (p) { return p !== null && p !== undefined && p !== ''; }).join(', '); };
  if (kind === 'protocol') {
    return { kind: kind, tone: 'warn', icon: 'ph-stack', title: 'Clear the active protocol?',
      body: 'Rounds and alerts stop until you set up a new one. Your log entries stay.',
      action: 'Clear protocol', exportFirst: false };
  }
  if (kind === 'entry') {
    var what = join([detail.name, detail.dose, detail.ts ? tlWhen(detail.ts, nowMs) : '']);
    return { kind: kind, tone: 'danger', icon: 'ph-trash', title: 'Delete this entry?',
      body: (what ? what + '. ' : '') + 'It comes off your log, your charts and the supply count.',
      action: 'Delete entry', exportFirst: false };
  }
  if (kind === 'reading') {
    var bp = join([detail.sys && detail.dia ? detail.sys + '/' + detail.dia : '', detail.hr ? 'pulse ' + detail.hr : '',
                   detail.ts ? tlWhen(detail.ts, nowMs) : '']);
    return { kind: kind, tone: 'danger', icon: 'ph-trash', title: 'Delete this reading?',
      body: (bp ? bp + '. ' : '') + 'Your averages and chart update.',
      action: 'Delete reading', exportFirst: false };
  }
  if (kind === 'checkin') {
    var label = join([detail.label, detail.date]);
    return { kind: kind, tone: 'danger', icon: 'ph-trash', title: 'Delete this check-in?',
      body: (label ? label + '. ' : '') + 'It comes off your progress log.',
      action: 'Delete check-in', exportFirst: false };
  }
  if (kind === 'wipe') {
    return { kind: kind, tone: 'danger', icon: 'ph-trash', title: 'Delete all TherapyLog data?',
      body: 'Every entry, your profile and your protocol. Nothing is kept anywhere else, so this cannot be undone.',
      action: 'Delete everything', exportFirst: true };
  }
  if (kind === 'template') {
    return { kind: kind, tone: 'warn', icon: 'ph-stack', title: 'Replace your protocol with this template?',
      body: (detail.name ? detail.name + ' takes the place of the compounds on your protocol. ' : 'The template takes the place of the compounds on your protocol. ') +
        'Your log entries stay. Check every dose with your physician.',
      action: 'Use template', exportFirst: false };
  }
  if (kind === 'demo') {
    return { kind: kind, tone: 'warn', icon: 'ph-flask', title: 'Replace your log with demo data?',
      body: 'Sample entries take the place of everything in the app now. Export a backup first to keep your log.',
      action: 'Replace with demo data', exportFirst: true };
  }
  return null;
}

/* The open sheet's done(), so that a sheet opened while another is up can
   answer that one before taking its place. Removing the old sheet's node was
   not enough: its promise never settled, and its key handler stayed on the
   document, where a later Escape on the page was taken as "cancel" for a sheet
   long gone and focus jumped back to what had opened it. */
var tlConfirmOpen = null;

/* Show the sheet. Resolves when the user chooses, to 'action', 'export' or
   'cancel'. Escape and a tap outside the sheet cancel. Focus starts on Cancel,
   so a stray Enter cannot delete anything, stays in the sheet, and goes back
   where it was. One sheet at a time: a sheet already up is answered 'cancel',
   so its caller goes on as if the user had said no. */
function tlConfirm(opts) {
  return new Promise(function (resolve) {
    opts = opts || {};
    var before = document.activeElement;
    var old = document.getElementById('tl-confirm');
    /* If focus was on the old sheet, its button is about to go. The old
       sheet's done() puts focus back on what opened it, and that is where this
       sheet should return it too. */
    var fromOld = !!(old && before && old.contains(before));
    if (tlConfirmOpen) tlConfirmOpen('cancel');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (fromOld) before = document.activeElement;
    var tone = opts.tone === 'danger' ? 'var(--danger)' : 'var(--accent3)';
    var el = function (tag, css, text) {
      var n = document.createElement(tag);
      if (css) n.style.cssText = css;
      if (text !== undefined) n.textContent = text;
      return n;
    };

    var wrap = el('div', 'position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.5)');
    wrap.id = 'tl-confirm';
    wrap.setAttribute('data-kind', opts.kind || '');

    var sheet = el('div', 'width:100%;max-width:520px;box-sizing:border-box;background:var(--surface);color:var(--text);' +
      'border-radius:16px 16px 0 0;border:1px solid var(--border2);border-bottom:none;' +
      'padding:10px 20px calc(20px + env(safe-area-inset-bottom)) 20px;max-height:86%;overflow-y:auto');
    sheet.setAttribute('role', 'alertdialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'tl-confirm-title');
    sheet.setAttribute('aria-describedby', 'tl-confirm-body');

    sheet.appendChild(el('div', 'width:36px;height:5px;border-radius:3px;background:var(--border2);margin:0 auto 16px'));

    var hex = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hex.setAttribute('viewBox', '0 0 40 44');
    hex.setAttribute('width', '44');
    hex.setAttribute('height', '48');
    hex.setAttribute('aria-hidden', 'true');
    hex.setAttribute('data-icon', opts.icon || '');
    hex.style.cssText = 'display:block;margin-bottom:12px;color:' + tone;
    hex.innerHTML = '<polygon points="20,1.5 38,12 38,32 20,42.5 2,32 2,12" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.25"/>' +
      '<path d="M20 12.5v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="20" cy="30" r="1.4" fill="currentColor"/>';
    sheet.appendChild(hex);

    var title = el('div', 'font-size:20px;font-weight:500;line-height:1.25;margin-bottom:8px', opts.title || '');
    title.id = 'tl-confirm-title';
    sheet.appendChild(title);
    var body = el('div', 'font-size:14.5px;line-height:1.5;color:var(--text2);margin-bottom:18px', opts.body || '');
    body.id = 'tl-confirm-body';
    sheet.appendChild(body);

    var base = 'display:block;width:100%;box-sizing:border-box;min-height:48px;margin-top:8px;padding:10px 14px;border-radius:8px;' +
      'font-family:inherit;font-size:15px;font-weight:500;cursor:pointer;background:transparent;';
    var button = function (id, text, css) {
      var b = el('button', base + css, text);
      b.type = 'button';
      b.setAttribute('data-tl-confirm', id);
      b.onclick = function () { done(id); };
      sheet.appendChild(b);
      return b;
    };
    if (opts.exportFirst) button('export', 'Export a backup first', 'border:1px solid var(--border2);color:var(--text)');
    button('action', opts.action || 'Continue', 'border:1px solid ' + tone + ';color:' + tone);
    var cancel = button('cancel', 'Cancel', 'border:1px solid transparent;color:var(--accent)');

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); done('cancel'); return; }
      if (e.key !== 'Tab') return;
      /* Keep Tab inside the sheet: round from the last button to the first and
         back, and from anywhere that is not one of its buttons to the first,
         or with Shift to the last. Focus is off the buttons after a tap on the
         sheet's text (it goes to the page's body) or when something on the
         page took it, and from there the browser's own Tab order led to the
         page behind the scrim, where Enter could open a second sheet. */
      var bs = sheet.querySelectorAll('button'), first = bs[0], last = bs[bs.length - 1];
      var on = Array.prototype.indexOf.call(bs, document.activeElement) >= 0;
      if (e.shiftKey && (!on || document.activeElement === first)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!on || document.activeElement === last)) { e.preventDefault(); first.focus(); }
    }
    function done(result) {
      if (tlConfirmOpen === done) tlConfirmOpen = null;
      document.removeEventListener('keydown', onKey, true);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      if (before && typeof before.focus === 'function') { try { before.focus(); } catch (e) {} }
      resolve(result);
    }
    wrap.onclick = function (e) { if (e.target === wrap) done('cancel'); };
    document.addEventListener('keydown', onKey, true);
    tlConfirmOpen = done;

    wrap.appendChild(sheet);
    document.body.appendChild(wrap);
    cancel.focus();
  });
}

/* Ask, and resolve to true only if the user chose the action. If they ask to
   export a backup first, that runs and the question is asked again. */
function tlAsk(copy) {
  return tlConfirm(copy).then(function (result) {
    if (result === 'export') {
      if (typeof exportData === 'function') exportData();
      return tlAsk(copy);
    }
    return result === 'action';
  });
}
