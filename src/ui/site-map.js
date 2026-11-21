/* The injection-site map (4a), opened from the dose form's Site row.
 *
 * The figure is the user's choice (settings.figure), front or back. The
 * compound's route decides which sites show: IM or SubQ. Each site is a
 * hexagon in the colour of its rest: rested, recovering, used under 48 hours
 * ago, or not used yet (tlSiteStates). "Longest rested" picks the site that
 * has waited longest and flips the view to it.
 *
 * A tap on the figure picks the nearest site for the route on that view
 * within 15% of the figure's width (tlNearestSite), so a finger does not have
 * to land on a 22 px marker. Each marker is also a button, for the keyboard
 * and screen readers, named with its state.
 *
 *   tlOpenSiteMap({ protocol, compound, siteId, onBack(key, siteId), onLog(key, siteId) })
 */

var TL_SITE_STATE_WORDS = { rested: 'rested', recovering: 'recovering', recent: 'used under 48 hours ago', never: 'not used yet' };

function tlOpenSiteMap(opts) {
  var d = gd(), p = opts.protocol, entries = d.entries || [], now = Date.now();
  var figure = tlSetting(d, 'figure', 'male') === 'female' ? 'female' : 'male';
  var today = tlRoundsFor(p, tlDayKey(new Date(now)), entries);
  /* The chips: today's compounds that go into a site, and the one the form
     was on whether or not it is due today. */
  var keys = [];
  today.forEach(function (r) { r.doses.forEach(function (x) { if (keys.indexOf(x.key) < 0) keys.push(x.key); }); });
  if (keys.indexOf(opts.compound.key) < 0) keys.unshift(opts.compound.key);
  var chipList = keys.map(function (k) { return tlCompound(p, k); })
    .filter(function (c) { return c && (c.route === 'im' || c.route === 'sq'); });

  var st = { key: opts.compound.key, view: 'front', siteId: opts.siteId || null, done: false };

  function compound() { return tlCompound(p, st.key); }
  function states() { return tlSiteStates(TL_SITE_MAP, compound().route, entries, now); }
  function pickDefault() {
    var all = states();
    var cur = st.siteId && all.filter(function (s) { return s.site.id === st.siteId; })[0];
    if (!cur) {
      var best = tlLongestRested(TL_SITE_MAP, compound().route, entries, now);
      st.siteId = best ? best.site.id : null;
      cur = best;
    }
    if (cur) st.view = cur.site.view;
  }
  pickDefault();

  function html() {
    var c = compound(), all = states(), rest = tlLongestRested(TL_SITE_MAP, c.route, entries, now);
    var sel = all.filter(function (s) { return s.site.id === st.siteId; })[0] || null;
    var markers = all.filter(function (s) { return s.site.view === st.view; }).map(function (s) {
      var on = sel && s.site.id === sel.site.id;
      return '<button type="button" class="tl-site tl-site-' + s.state + (on ? ' tl-site-on' : '') + '" data-site="' + s.site.id + '"' +
        ' style="left:' + (s.site.x * 100) + '%;top:' + (s.site.y * 100) + '%"' +
        ' aria-pressed="' + !!on + '" aria-label="' + tlEsc(s.site.name + ', ' + TL_SITE_STATE_WORDS[s.state]) + '">' +
        (on ? '<svg class="tl-site-sel" viewBox="0 0 40 44" aria-hidden="true"><polygon points="' + TL_HEX_POINTS + '"/></svg>' : '') +
        '<svg class="tl-site-hex" viewBox="0 0 40 44" aria-hidden="true"><polygon points="' + TL_HEX_POINTS + '"/></svg></button>';
    }).join('');
    var restLine = rest ? (rest.lastUsed ? rest.days + (rest.days === 1 ? ' day' : ' days') : 'Not used yet') : '';
    return '<div class="tl-map">' +
      '<div class="tl-map-head"><button type="button" class="ds-btn ds-btn-ghost tl-back" data-map="back" aria-label="Back">' + tlIcon('caret-left') + '</button>' +
        '<h1 class="ds-h1" tabindex="-1">Injection site</h1></div>' +
      (chipList.length > 1 ? tlChips('Compound', chipList.map(function (k) { return { value: k.key, label: k.name + ' · ' + tlRouteLabel(k.route) }; }), st.key, true).replace('class="ds-chips"', 'class="ds-chips tl-map-chips"') : '') +
      '<div class="tl-map-bar">' + tlSegmented('View', [{ value: 'front', label: 'Front' }, { value: 'back', label: 'Back' }], st.view, true) +
        (rest ? '<button type="button" class="tl-map-rest" data-map="rest"><span class="tl-map-rest-k">Longest rested</span>' +
          '<span class="tl-map-rest-n">' + tlEsc(rest.site.name) + '</span><span class="tl-map-rest-d">' + restLine + '</span></button>' : '') +
      '</div>' +
      '<div class="tl-map-stage"><div class="tl-fig tl-fig-' + figure + '-' + st.view + '" data-fig>' +
        '<span class="tl-fig-img" aria-hidden="true"></span>' + markers + '</div>' +
        '<ul class="tl-map-legend" aria-label="Key">' +
          '<li><span class="tl-site tl-site-rested tl-site-key"><svg class="tl-site-hex" viewBox="0 0 40 44"><polygon points="' + TL_HEX_POINTS + '"/></svg></span>Rested</li>' +
          '<li><span class="tl-site tl-site-recovering tl-site-key"><svg class="tl-site-hex" viewBox="0 0 40 44"><polygon points="' + TL_HEX_POINTS + '"/></svg></span>Recovering</li>' +
          '<li><span class="tl-site tl-site-recent tl-site-key"><svg class="tl-site-hex" viewBox="0 0 40 44"><polygon points="' + TL_HEX_POINTS + '"/></svg></span>Under 48 h</li>' +
          '<li><span class="tl-site tl-site-never tl-site-key"><svg class="tl-site-hex" viewBox="0 0 40 44"><polygon points="' + TL_HEX_POINTS + '"/></svg></span>Not used</li>' +
        '</ul></div>' +
      (sel ? '<div class="tl-map-card" aria-live="polite"><div class="tl-map-card-top"><span class="tl-map-card-n">' + tlEsc(sel.site.name) + '</span>' +
          '<span class="ds-tag ds-tag-neutral">' + tlRouteLabel(c.route) + '</span></div>' +
          '<p class="tl-map-card-s">' + tlEsc(sel.line) + '</p>' +
          '<button type="button" class="ds-btn ds-btn-primary ds-btn-block" data-map="log">Log ' + tlEsc(c.name) + ' here</button></div>'
        : '<div class="tl-map-card"><p class="tl-map-card-s">Tap a site on the figure.</p></div>') +
      '</div>';
  }

  var layer = tlOpenSheet('<div class="tl-map-box"></div>', {
    label: 'Injection site', cls: 'tl-layer',
    /* Back keeps what was picked: a site chosen and then Back is still the
       site the form uses. Only "Log ... here" logs. */
    onClose: function () { if (!st.done && opts.onBack) { st.done = true; opts.onBack(st.key, st.siteId); } }
  });
  var el = layer.el, box = el.querySelector('.tl-map-box');

  function draw(focusSel) {
    box.innerHTML = html();
    var f = focusSel && box.querySelector(focusSel);
    if (f) f.focus();
  }
  draw('h1');

  el.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var act = t.closest('[data-map]');
    var a = act && act.getAttribute('data-map');
    if (a === 'back') { layer.close(); return; }
    if (a === 'rest') {
      var best = tlLongestRested(TL_SITE_MAP, compound().route, entries, now);
      if (best) { st.siteId = best.site.id; st.view = best.site.view; draw('[data-map="rest"]'); }
      return;
    }
    if (a === 'log') {
      st.done = true;
      layer.close();
      opts.onLog(st.key, st.siteId);
      return;
    }
    var site = t.closest('[data-site]');
    if (site) { st.siteId = site.getAttribute('data-site'); draw('[data-site="' + st.siteId + '"]'); return; }
    var fig = t.closest('[data-fig]');
    if (fig) {
      var r = fig.getBoundingClientRect();
      var hit = tlNearestSite(TL_SITE_MAP, compound().route, st.view, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, r.height / r.width);
      if (hit) { st.siteId = hit.id; draw(); }
    }
  });
  el.addEventListener('ds-change', function (e) {
    if (!e.detail) return;
    var seg = e.target.getAttribute && e.target.getAttribute('data-ds-seg');
    if (seg === 'View') { st.view = e.detail.value; draw('[data-ds-seg="View"] [aria-checked="true"]'); return; }
    if (e.target.closest && e.target.closest('.tl-map-chips')) {
      st.key = e.detail.value;
      st.siteId = null;
      pickDefault();
      draw('.tl-map-chips [aria-pressed="true"]');
    }
  });
  return layer;
}
