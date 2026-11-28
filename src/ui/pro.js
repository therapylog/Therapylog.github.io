/*
 * Pro (5c): the upgrade screen. Opened from Settings' "Upgrade to Pro" row and
 * from every feature gate: TLTier.prompt() -> openUpgrade() (wire.js) ->
 * tlProScreen(). A gate names its feature at the top from TLTier.names.
 *
 * What a purchase does depends on where the app runs, as it always has:
 *   iOS      the App Store, through TLIAP (yearly or monthly product)
 *   Android  no in-app checkout: a plan bought on the web is entered as a
 *            license key (TLTier.showActivation), as the old screen offered
 *   web      the same checkout pro.html uses (create-pro-subscription, then
 *            Stripe), with the plan chosen here; Pro or Own key, yearly or
 *            monthly. The 'std' gate (any paid plan) preselects Own key.
 * "Restore" is tlRestorePurchases(): the App Store's restore on iOS, the
 * license key everywhere else.
 */

var TL_PRO_CHECKOUT = 'https://api.therapylog.app/api/create-pro-subscription';
var TL_PRO_PRICES = {
  pro: { annual: '$99.99', monthly: '$9.99', perMonth: '$8.33' },
  byok: { annual: '$89.99', monthly: '$8.99', perMonth: '$7.50' }
};
var TL_PRO_FEATURES = [
  { icon: 'chart-line-up', title: 'Trends across panels', sub: 'Changes between panels, and a report PDF for your physician' },
  { icon: 'drop-half', title: 'Supply that counts itself', sub: 'Doses left per vial, refill alerts and monthly cost' },
  { icon: 'pulse', title: 'Patterns', sub: 'Symptom and blood pressure logs against dose changes' },
  { icon: 'wave-sine', title: 'Planning tools', sub: 'Steady state, stacking and 17 protocol templates' },
  { icon: 'sparkle', title: 'Assistant and lab scanner', sub: 'Questions about your own log; scan a printed report' }
];

function tlProPlatform() {
  return (window.Capacitor && window.Capacitor.getPlatform) ? window.Capacitor.getPlatform() : 'web';
}

/* Where a checkout came from, for the affiliate the person arrived through:
   the first-touch attribution pro.html and the site store (tl_attr). */
function tlProRef() {
  try {
    var a = JSON.parse(localStorage.getItem('tl_attr') || 'null') || {};
    var ref = localStorage.getItem('tl_ref') || a.ref || a.utm_campaign || a.utm_source || '';
    return String(ref).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
  } catch (e) { return ''; }
}

/* "Continue · $99.99 a year". */
function tlProCta(st) {
  var p = TL_PRO_PRICES[st.plan];
  return 'Continue · ' + (st.billing === 'annual' ? p.annual + ' a year' : p.monthly + ' a month');
}

function tlProCards(st) {
  var p = TL_PRO_PRICES[st.plan];
  var card = function (billing, label, price, sub, tag) {
    var on = st.billing === billing;
    return '<button type="button" class="tl-pro-card" role="radio" aria-checked="' + on + '" data-pro-billing="' + billing + '">' +
      '<span class="tl-pro-card-top"><span class="tl-pro-card-l">' + label + '</span>' + (tag ? '<span class="ds-tag ds-tag-accent">' + tag + '</span>' : '') + '</span>' +
      '<span class="tl-pro-card-p">' + price + '</span><span class="tl-pro-card-s">' + sub + '</span></button>';
  };
  return '<div class="tl-pro-cards" role="radiogroup" aria-label="Billing">' +
    card('annual', 'Yearly', p.annual, 'a year · ' + p.perMonth + ' a month', 'Save 17%') +
    card('monthly', 'Monthly', p.monthly, 'a month', '') + '</div>';
}

function tlProBody(st) {
  var plat = tlProPlatform();
  var lock = st.feature ? '<p class="tl-pro-lock">' + tlIcon('lock-simple') + '<span>' + tlEsc(st.feature) + ' is part of Pro</span></p>' : '';
  var features = '<ul class="tl-pro-feats">' + TL_PRO_FEATURES.map(function (f) {
    return '<li>' + tlIcon(f.icon) + '<span><span class="tl-pro-feat-t">' + f.title + '</span><span class="tl-pro-feat-s">' + f.sub + '</span></span></li>';
  }).join('') + '</ul>';
  var buy;
  if (plat === 'android') {
    buy = '<p class="tl-pro-note">Bought TherapyLog on the web? Enter the license key from your receipt to turn it on here.</p>' +
      '<button type="button" class="ds-btn ds-btn-primary ds-btn-block tl-pro-cta" data-pro="key">Enter license key</button>';
  } else {
    var own = plat === 'web' ? '<button type="button" class="tl-pro-own" role="checkbox" aria-checked="' + (st.plan === 'byok') + '" data-pro="own">' +
        '<span class="tl-pro-own-box" aria-hidden="true">' + tlIcon('check') + '</span>' +
        '<span><span class="tl-pro-own-t">Use my own AI key</span><span class="tl-pro-own-s">Everything in Pro, at ' + TL_PRO_PRICES.byok.monthly + ' a month or ' +
        TL_PRO_PRICES.byok.annual + ' a year. The assistant and scanner run on your own Anthropic key.</span></span></button>' : '';
    var fine = plat === 'ios'
      ? 'Renews automatically at the same price until you cancel in your App Store account settings, at least 24 hours before the renewal date.'
      : 'Renews automatically at the price shown, on the same date each period, until you cancel. Cancel any time from the Stripe billing portal linked in your receipt; access runs to the end of the period you paid for.';
    buy = tlProCards(st) + own +
      '<button type="button" class="ds-btn ds-btn-primary ds-btn-block tl-pro-cta" data-pro="buy"' + (st.busy ? ' disabled' : '') + '>' +
        (st.busy ? 'Opening checkout…' : tlProCta(st)) + '</button>' +
      '<p class="tl-pro-err" role="alert">' + tlEsc(st.error || '') + '</p>' +
      '<p class="tl-pro-fine">' + fine + '</p>';
  }
  return '<div class="tl-pro-top"><button type="button" class="ds-btn ds-btn-ghost tl-pro-x" data-pro="close" aria-label="Close">' + tlIcon('x') + '</button>' +
      '<button type="button" class="ds-btn ds-btn-ghost tl-pro-restore" data-pro="restore">Restore</button></div>' +
    lock + '<h1 class="tl-pro-h" id="tl-pro-h">TherapyLog Pro</h1>' +
    '<p class="tl-pro-sub">Logging stays free. Pro adds the analysis.</p>' + features + buy +
    '<p class="tl-pro-links"><a href="/terms" target="_blank" rel="noopener">Terms of use</a><a href="/privacy" target="_blank" rel="noopener">Privacy policy</a></p>';
}

/* "Pro is on". */
function tlProSuccessBody() {
  var e = (typeof tlReadEnt === 'function' ? tlReadEnt() : null) || {};
  var line = e.plan === 'monthly' || /monthly/.test(e.plan || '') ? 'Monthly' : e.plan ? 'Yearly' : 'Your plan';
  return '<div class="tl-pro-done">' + tlHex('check', { size: 'lg' }) + '<h1 class="tl-pro-h" id="tl-pro-h">Pro is on</h1>' +
    '<p class="tl-pro-sub">' + tlEsc(line) + '. Everything already in your log feeds the trends.</p>' +
    '<button type="button" class="ds-btn ds-btn-primary ds-btn-block" data-pro="done">Back to Settings</button></div>';
}

/* Open the screen. tier: 'pro' (the managed-AI features) or 'std' (any
   paid plan). featureKey: the gate's feature, or null from Settings. */
function tlProScreen(tier, featureKey) {
  var old = document.getElementById('tl-upgrade-overlay');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var names = (window.TLTier && TLTier.names) || {};
  var st = {
    feature: featureKey ? (names[featureKey] || featureKey) : null,
    plan: tier === 'std' && tlProPlatform() === 'web' ? 'byok' : 'pro',
    billing: 'annual', busy: false, error: ''
  };
  var before = document.activeElement;
  var wasPaid = !!(window.TLTier && TLTier.isStd && TLTier.isStd());
  var wrap = document.createElement('div');
  wrap.id = 'tl-upgrade-overlay';
  wrap.className = 'ds-ui tl-pro';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'tl-pro-h');
  var inner = document.createElement('div');
  inner.className = 'tl-pro-in';
  wrap.appendChild(inner);
  var draw = function () { inner.innerHTML = tlProBody(st); };
  var timer = null;
  var close = function () {
    if (timer) clearInterval(timer);
    document.removeEventListener('keydown', onKey, true);
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    if (before && typeof before.focus === 'function') { try { before.focus(); } catch (e) {} }
  };
  var onKey = function (e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(wrap.querySelectorAll('button,a[href]'), function (n) { return !n.disabled && n.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  var buy = function () {
    var plat = tlProPlatform();
    if (plat === 'ios') {
      if (window.TLIAP && typeof TLIAP.purchase === 'function') TLIAP.purchase(st.billing === 'annual' ? TLIAP.ANNUAL : TLIAP.MONTHLY);
      return;
    }
    var key = (st.plan === 'byok' ? 'byok_' : 'pro_') + st.billing;
    var body = { plan: key, billing: st.billing };
    var ref = tlProRef();
    if (ref) body.ref = ref;
    st.busy = true; st.error = ''; draw();
    try { if (typeof window.va === 'function') window.va('event', { name: 'checkout_started', data: { plan: key, billing: st.billing, ref: ref, from: 'app' } }); } catch (e) {}
    fetch(TL_PRO_CHECKOUT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }, function () { return { ok: false, data: {} }; }); })
      .then(function (r) {
        if (r.ok && r.data && r.data.url) { window.location.href = r.data.url; return; }
        st.busy = false; st.error = (r.data && r.data.error) || 'Checkout could not start. Try again in a moment.'; draw();
      }, function () {
        st.busy = false; st.error = 'No connection. Check your network and try again.'; draw();
      });
  };
  wrap.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var billing = t.closest('[data-pro-billing]');
    if (billing) { st.billing = billing.getAttribute('data-pro-billing'); draw(); wrap.querySelector('[data-pro-billing="' + st.billing + '"]').focus(); return; }
    var b = t.closest('[data-pro]');
    if (!b) return;
    var act = b.getAttribute('data-pro');
    if (act === 'close') close();
    else if (act === 'done') { close(); if (typeof tlGo === 'function') tlGo('settings'); }
    else if (act === 'own') { st.plan = st.plan === 'byok' ? 'pro' : 'byok'; draw(); wrap.querySelector('[data-pro="own"]').focus(); }
    else if (act === 'buy') buy();
    else if (act === 'key' || act === 'restore') { close(); if (act === 'key' && window.TLTier) TLTier.showActivation(); else if (typeof tlRestorePurchases === 'function') tlRestorePurchases(); }
  });
  document.addEventListener('keydown', onKey, true);
  draw();
  document.body.appendChild(wrap);
  var x = wrap.querySelector('[data-pro="close"]');
  if (x) x.focus();
  /* A purchase that completes while the screen is up (the App Store sheet,
     a license key entered elsewhere) turns it into the success screen. */
  if (!wasPaid) {
    timer = setInterval(function () {
      if (!wrap.parentNode) { clearInterval(timer); return; }
      if (window.TLTier && TLTier.isStd && TLTier.isStd()) {
        clearInterval(timer); timer = null;
        inner.innerHTML = tlProSuccessBody();
        var done = wrap.querySelector('[data-pro="done"]');
        if (done) done.focus();
      }
    }, 1000);
  }
  return { el: wrap, close: close };
}
