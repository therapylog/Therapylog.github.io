/* The shell: five tabs, a top bar, and a router.
 *
 *   Today · Protocol · Log (the centre hexagon) · Health · Library
 *
 * The profile button (top right of every tab) leads to Settings, and from
 * there to Profile and History. The Ask bar on Today leads to the assistant.
 * Health and Library each have a segmented control in place of the old hub's
 * grid of buttons.
 *
 * Routes are hashes: #/today, #/health/bp, #/library/tools, #/settings. The
 * browser's back button works, and a route can be linked to.
 *
 * Each route either has a new screen, registered in TL_SCREENS by the file
 * that draws it, or shows the old page through the old app's own show
 * functions (showHub, showPage, showLogTab), which still do the rendering and
 * the paid-feature gates. Every old page stays reachable this way until its
 * replacement lands, and the ones that are only restyled keep living here.
 *
 * The old chrome (header, bottom nav, hub button grids, the floating 🤖
 * button) is hidden in shell mode rather than deleted; it goes with the old
 * code in Phase 5.
 */

/* name -> { title, tab, segs, seg, back, backs, bare, param, gate, screen, actions, legacy() } */
var TL_ROUTES = {
  today: { title: 'Today', tab: 'today', screen: 'tlTodayScreen', legacy: function () { showHub('home', document.getElementById('nav-home')); } },
  'home/customize': { title: 'Customize Home', back: 'today', bare: true, screen: 'tlCustomizeScreen' },
  /* The stack editor is free: entering a protocol is capture, as onboarding
     and Today already let anyone do. The analysis around it stays paid: the
     full levels chart (cycle_tracker, as the old cycle page was) and the
     templates with a hormone, a steroid or a PCT drug in them
     (protocol_templates, checked per template: peptide-only ones are free). */
  protocol: { title: 'Protocol', tab: 'protocol', screen: 'tlProtocolScreen', legacy: function () { showPage('cycle'); } },
  'protocol/levels': { title: 'Levels', back: 'protocol', gate: 'cycle_tracker',
    legacy: function () { showPage('cycle'); tlLegacyTab('#page-cycle', showCycleTab, 'levels'); } },
  /* Reached from Protocol and from Tools: `backs` lists the routes Back
     returns to when that is where it came from; otherwise `back`. */
  'library/templates': { title: 'Templates', back: 'protocol', backs: ['library/tools'],
    legacy: function () { tlLegacyTool('templates'); } },
  'library/interactions': { title: 'Interactions', back: 'protocol', backs: ['library/tools', 'library/compound'],
    legacy: function () { tlLegacyTool('interact'); } },
  log: { title: 'Log', tab: 'log', legacy: function () { showHub('log', document.getElementById('nav-log')); tlLegacyLogTab('weight'); } },
  'log/labs': { title: 'Log labs', tab: 'log', legacy: function () { showHub('log', document.getElementById('nav-log')); tlLegacyLogTab('labs'); } },
  'log/symptom': { title: 'Log a symptom', tab: 'log', gate: 'symptoms', legacy: function () { showHub('log', document.getElementById('nav-log')); tlLegacyLogTab('symp'); } },
  health: { title: 'Health', tab: 'health', segs: 'health', seg: 'bloodwork' },
  'health/bloodwork': { title: 'Health', tab: 'health', segs: 'health', screen: 'tlBloodworkScreen', actions: 'tlBloodworkActions',
    legacy: function () { showPage('bloodwork'); } },
  /* A marker's trend (#/health/trend/tott) and every panel: the old
     bloodwork page's tabs, without its row of tabs. */
  'health/trend': { title: 'Trend', back: 'health/bloodwork', param: true, gate: 'bloodwork_trends',
    legacy: function () {
      showPage('bloodwork'); tlLegacyTab('#page-bloodwork', showBWTab, 'trends');
      if (tlRouteArg && typeof showTrend === 'function') showTrend(tlRouteArg);
    } },
  'health/panels': { title: 'All panels', back: 'health/bloodwork',
    legacy: function () { showPage('bloodwork'); tlLegacyTab('#page-bloodwork', showBWTab, 'history'); } },
  /* The report builder, which lives on the old profile page: shown alone. */
  'health/report': { title: 'Report', back: 'health/bloodwork', gate: 'clinical_reports',
    legacy: function () { showPage('profile'); tlLegacyTab('#page-profile', showProfileTab, 'report'); } },
  'health/bp': { title: 'Health', tab: 'health', segs: 'health', gate: 'blood_pressure', screen: 'tlBpScreen',
    legacy: function () { showHub('log', document.getElementById('nav-log')); tlLegacyLogTab('bp'); } },
  /* The old BP section: device, notes, the full history, the Apple Health
     import. */
  'health/readings': { title: 'All readings', back: 'health/bp', gate: 'blood_pressure',
    legacy: function () { showHub('log', document.getElementById('nav-log')); tlLegacyLogTab('bp'); } },
  'health/body': { title: 'Health', tab: 'health', segs: 'health', screen: 'tlBodyScreen',
    legacy: function () {
      showHub('log', document.getElementById('nav-log'));
      tlLegacyLogTab('weight');
      var body = document.getElementById('lt-body');
      if (body) body.style.display = '';
    } },
  /* The old measurement form alone. */
  'health/measure': { title: 'Measurements', back: 'health/body',
    legacy: function () {
      showHub('log', document.getElementById('nav-log'));
      tlLegacyLogTab('weight');
      var body = document.getElementById('lt-body');
      if (body) body.style.display = '';
    } },
  /* Taking photos is capture, and free; comparing them is gated on the
     screen (photos.js). The old page's written check-ins keep their gate. */
  'health/photos': { title: 'Health', tab: 'health', segs: 'health', screen: 'tlPhotosScreen', legacy: function () { showPage('photos'); } },
  'health/checkins': { title: 'Written check-ins', back: 'health/photos', gate: 'progress_photos', legacy: function () { showPage('photos'); } },
  'health/cycle': { title: 'Health', tab: 'health', segs: 'health', gate: 'cycle_tracker', legacy: function () { showPage('femcycle'); } },
  library: { title: 'Library', tab: 'library', segs: 'library', seg: 'compounds' },
  'library/compounds': { title: 'Library', tab: 'library', segs: 'library', screen: 'tlLibraryScreen', legacy: function () { showPage('encyclopedia'); } },
  /* One compound: #/library/compound/tc. `param` takes the last part of the
     address as the compound's id (tlRouteArg). */
  'library/compound': { title: 'Library', back: 'library/compounds', bare: true, param: true, screen: 'tlCompoundScreen' },
  'library/tools': { title: 'Library', tab: 'library', segs: 'library', screen: 'tlToolsScreen', legacy: function () { showPage('tools'); } },
  /* The tools listed under the calculator (src/ui/tools.js). Each is still
     the old page's tab for now, shown without the old page's row of tabs. */
  'library/steady': { title: 'Steady state', back: 'library/tools', gate: 'pk_advanced',
    legacy: function () {
      showPage('cycle'); tlLegacyTab('#page-cycle', showCycleTab, 'levels');
      setTimeout(function () { var el = document.getElementById('pk-ss'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' }); }, 0);
    } },
  'library/cost': { title: 'Cost and supply', back: 'library/tools', gate: 'cost_tracking', legacy: function () { tlLegacyTool('cost'); } },
  'library/pct': { title: 'PCT builder', back: 'library/tools', gate: 'pct_builder', legacy: function () { tlLegacyTool('pct'); } },
  'library/bodycomp': { title: 'Body composition', back: 'library/tools', legacy: function () { tlLegacyTool('body'); } },
  'library/symptoms': { title: 'Symptom patterns', back: 'library/tools', gate: 'correlations', legacy: function () { tlLegacyTool('symptom'); } },
  'library/syringe': { title: 'Combined syringe', back: 'library/tools', legacy: function () { tlLegacyTool('syringe'); } },
  'library/sidefx': { title: 'Side effects guide', back: 'library/tools', legacy: function () { tlLegacyTool('manage'); } },
  'library/stack': { title: 'Stack builder', back: 'library/tools', legacy: function () { showPage('stack'); } },
  settings: { title: 'Settings', back: true, screen: 'tlSettingsScreen', legacy: function () { showPage('settings'); } },
  'settings/rounds': { title: 'Rounds and alerts', back: 'settings', screen: 'tlSettingsRoundsScreen' },
  /* Opens on the profile itself, even after the report (health/report) left
     the old page on its Report tab. */
  profile: { title: 'Profile', back: 'settings', legacy: function () { showPage('profile'); tlLegacyTab('#page-profile', showProfileTab, 'patient'); } },
  history: { title: 'History', back: 'settings', legacy: function () { showPage('history'); } },
  ask: { title: 'Ask', back: 'today', legacy: function () { showPage('ai'); } }
};

/* A route's new screen is named in TL_ROUTES (`screen`: the name of a
   function(el, route) that draws it), so the file that draws it runs nothing
   at load. TL_SCREENS[routeName] = { render(el, route) } also works, for
   tests and the kit page. */
var TL_SCREENS = {};

function tlScreenFor(name) {
  if (TL_SCREENS[name]) return TL_SCREENS[name];
  var r = TL_ROUTES[name], fn = r && r.screen && typeof window !== 'undefined' ? window[r.screen] : null;
  return typeof fn === 'function' ? { render: fn } : null;
}

var TL_SEGS = {
  health: [{ value: 'bloodwork', label: 'Bloodwork' }, { value: 'bp', label: 'BP' },
           { value: 'body', label: 'Body' }, { value: 'photos', label: 'Photos' }],
  library: [{ value: 'compounds', label: 'Compounds' }, { value: 'tools', label: 'Tools' }]
};

var tlRoute = null;          /* the route showing now */
var tlRouteArg = null;       /* a param route's argument: the compound's id */
var tlLastTab = 'today';     /* where Back goes from Settings */
var tlBackTo = null;         /* where Back goes from a route with `backs`, when it came from one */
var tlRouting = false;       /* true while the router itself drives the old show functions */

/* ---- routes ------------------------------------------------------------ */

/* "#/health/bp" -> "health/bp". A tab with segments resolves to its default
   segment. Anything unknown is Today. */
function tlRouteFromHash(hash) {
  var raw = String(hash || '').replace(/^#\/?/, '').replace(/[?].*$/, '').replace(/\/+$/, '');
  var name = raw.toLowerCase();
  if (!TL_ROUTES[name]) {
    /* "library/compound/tc": a param route and its argument. */
    var cut = name.lastIndexOf('/'), parent = cut > 0 ? name.slice(0, cut) : '';
    if (parent && TL_ROUTES[parent] && TL_ROUTES[parent].param && cut < name.length - 1) {
      try { tlRouteArg = decodeURIComponent(raw.slice(cut + 1)); } catch (e) { tlRouteArg = raw.slice(cut + 1); }
      return parent;
    }
    return 'today';
  }
  if (TL_ROUTES[name].seg) return name + '/' + TL_ROUTES[name].seg;
  return name;
}

/* Health shows a Cycle segment for someone it applies to: a female profile, or
   HRT chosen as a focus in onboarding. */
function tlShowsCycle(d) {
  var sex = d && d.profile && d.profile.sex;
  var focus = (typeof tlSetting === 'function') ? tlSetting(d, 'focus', []) : [];
  return sex === 'Female' || (Array.isArray(focus) && focus.indexOf('hrt') >= 0);
}

function tlSegsFor(name, d) {
  var r = TL_ROUTES[name];
  if (!r || !r.segs) return null;
  var segs = TL_SEGS[r.segs].slice();
  if (r.segs === 'health' && tlShowsCycle(d)) segs.push({ value: 'cycle', label: 'Cycle' });
  return segs;
}

/* ---- the chrome -------------------------------------------------------- */

function tlInitial(d) {
  var name = (d && d.profile && d.profile.name) || '';
  return String(name).trim().charAt(0).toUpperCase();
}

/* The profile button: the first letter of the name, or a figure before
   there is one. */
function tlAvatar(d) {
  var i = tlInitial(d);
  return '<button type="button" class="ds-avatar" aria-label="Profile and settings" data-tl-go="settings">' +
    (i ? tlEsc(i) : tlIcon('person-simple')) + '</button>';
}

function tlTopBar(name, d) {
  var r = TL_ROUTES[name];
  if (name === 'today') {
    return '<div class="ds-header tl-top-row"><button type="button" class="ds-askbar" data-tl-go="ask">' +
      tlIcon('sparkle', true) + '<span>Ask, or search 131 compounds</span></button>' +
      tlAvatar(d) + '</div>';
  }
  if (r.back) {
    return '<div class="ds-header tl-top-row"><button type="button" class="ds-btn ds-btn-ghost tl-back" data-tl-back>' +
      tlIcon('caret-left') + '<span class="ds-sr">Back</span></button><h1 class="ds-h1">' + tlEsc(r.title) + '</h1></div>';
  }
  /* A route can put its own buttons where the profile button goes
     (Bloodwork's scan and "+ Log labs"): `actions` names the function. */
  var right = r.actions && typeof window[r.actions] === 'function' ? window[r.actions](d) : tlAvatar(d);
  var html = '<div class="ds-header tl-top-row"><h1 class="ds-h1">' + tlEsc(r.title) + '</h1>' +
    right + '</div>';
  var segs = tlSegsFor(name, d);
  if (segs) html += '<div class="tl-top-seg">' + tlSegmented(r.title + ' section', segs, name.split('/')[1]) + '</div>';
  return html;
}

function tlShellChrome(name) {
  var d = gd(), r = TL_ROUTES[name];
  var top = document.getElementById('tl-top');
  /* A bare route draws its own header (Customize Home has Done, not Back). */
  if (top) top.innerHTML = r.bare ? '' : tlTopBar(name, d);
  var tabs = document.getElementById('tl-tabs');
  if (tabs) tabs.innerHTML = tlTabBar(r.tab || null);
  var body = document.body;
  body.className = body.className.replace(/\btl-r-[a-z-]+\b/g, '').replace(/\s+/g, ' ').trim();
  body.classList.add('tl-r-' + name.replace(/\//g, '-'));
  body.classList.toggle('tl-bare', !!r.bare);
}

/* ---- going places ------------------------------------------------------ */

/* Show a route. Returns false when a paid-feature gate refused it, in which
   case the upgrade screen is showing and nothing else changed. */
function tlShow(name) {
  var r = TL_ROUTES[name];
  if (!r) return false;
  if (r.gate && window.TLTier && !TLTier.check(r.gate)) return false;
  if (name !== tlRoute) tlBackTo = r.backs && r.backs.indexOf(tlRoute) >= 0 ? tlRoute : null;
  tlRoute = name;
  if (r.tab) tlLastTab = name;
  tlShellChrome(name);
  var screen = tlScreenFor(name), host = document.getElementById('tl-screen');
  if (screen && host) {
    document.body.classList.add('tl-new-screen');
    host.innerHTML = '';
    screen.render(host, name);
  } else {
    document.body.classList.remove('tl-new-screen');
    if (host) host.innerHTML = '';
    if (r.legacy) {
      tlRouting = true;
      try { r.legacy(); } finally { tlRouting = false; }
    }
  }
  try { window.scrollTo(0, 0); } catch (e) {}
  /* The round-due banner shows everywhere but Today. */
  if (typeof tlRoundBannerRefresh === 'function') { try { tlRoundBannerRefresh(); } catch (e) {} }
  return true;
}

/* A route's address: "#/library/compound/tc" for a param route. */
function tlRouteHash(name) {
  var r = TL_ROUTES[name];
  return '#/' + name + (r && r.param && tlRouteArg ? '/' + encodeURIComponent(tlRouteArg) : '');
}

/* Go to a route, as a new entry in the browser's history. */
function tlGo(path, replace) {
  var name = tlRouteFromHash('#/' + path);
  if (!tlShow(name)) return false;
  var hash = tlRouteHash(name);
  if (location.hash !== hash) {
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
  }
  return true;
}

function tlBack() {
  var r = TL_ROUTES[tlRoute] || {};
  /* A param route (a compound's page) goes back to the same argument, which
     tlRouteArg still holds. */
  if (tlBackTo && r.backs && r.backs.indexOf(tlBackTo) >= 0) { tlGo(tlBackTo); return; }
  tlGo(typeof r.back === 'string' ? r.back : tlLastTab);
}

/* An old page's tab, chosen through the page's own switcher with its own
   button, as a tap on it would: showCycleTab and showToolTab mark the button
   they are given, and run that tab's gate. */
function tlLegacyTab(pageSel, show, tab) {
  if (typeof show !== 'function') return;
  var btn = Array.prototype.filter.call(document.querySelectorAll(pageSel + ' .seg-btn'), function (b) {
    return (b.getAttribute('onclick') || '').indexOf("'" + tab + "'") >= 0;
  })[0];
  if (btn) show(btn, tab);
}

/* One of the old tools page's tabs. */
function tlLegacyTool(tab) {
  showPage('tools');
  if (typeof showToolTab === 'function') tlLegacyTab('#page-tools', showToolTab, tab);
}

/* The old log page's tabs, without their own buttons being on screen. */
function tlLegacyLogTab(tab) {
  if (typeof showLogTab !== 'function') return;
  var btn = Array.prototype.filter.call(document.querySelectorAll('#page-log .seg-btn'), function (b) {
    return (b.getAttribute('onclick') || '').indexOf("'" + tab + "'") >= 0;
  })[0];
  if (btn) showLogTab(btn, tab);
}

/* The old app also navigates by itself: "Log Weight" on the dashboard calls
   showHub('log'), a refill card calls showPage('cycle'). After any of those,
   work out where it went and move the tab bar and the address to match,
   without showing the page a second time. */
function tlRouteFromLegacy() {
  var on = function (id) { var el = document.getElementById(id); return el && el.classList.contains('active'); };
  if (on('page-dashboard')) return 'today';
  if (on('page-log')) return /^(health\/bp|health\/body|log\/)/.test(tlRoute || '') ? tlRoute : 'log';
  var sec = function (s) { return on('hub-sec-' + s); };
  if (on('hub-reference')) return sec('tools') ? 'library/tools' : sec('stack') ? 'library/stack' : 'library/compounds';
  if (on('hub-health')) return sec('cycle') ? 'protocol' : sec('femcycle') ? 'health/cycle' : sec('photos') ? 'health/photos' : 'health/bloodwork';
  if (on('hub-me')) return sec('ai') ? 'ask' : sec('history') ? 'history' : sec('profile') ? 'profile' : 'settings';
  return null;
}

/* One old navigation can call several of the wrapped functions (showPage
   calls showHub and then switchHubSection), so the sync waits until the call
   has finished and runs once. */
var tlSyncPending = false;
function tlScheduleSync() {
  if (tlRouting || tlSyncPending) return;
  tlSyncPending = true;
  Promise.resolve().then(function () { tlSyncPending = false; tlSyncFromLegacy(); });
}

function tlSyncFromLegacy() {
  if (tlRouting || !document.body.classList.contains('tl-shell')) return;
  var name = tlRouteFromLegacy();
  if (!name || name === tlRoute) return;
  /* Where the old app went has a new screen (the old dashboard is Today):
     show that instead. */
  if (tlScreenFor(name)) {
    tlShow(name);
    history.pushState(null, '', '#/' + name);
    return;
  }
  tlRoute = name;
  if (TL_ROUTES[name].tab) tlLastTab = name;
  document.body.classList.remove('tl-new-screen');
  /* The new screen that was showing (Today, say) goes, or it would sit above
     the old page the old app just opened. */
  var host = document.getElementById('tl-screen');
  if (host) host.innerHTML = '';
  tlShellChrome(name);
  history.pushState(null, '', '#/' + name);
}

function tlWrapLegacy(fnName) {
  var original = window[fnName];
  if (typeof original !== 'function' || original.tlWrapped) return;
  var wrapped = function () {
    var out = original.apply(this, arguments);
    tlScheduleSync();
    return out;
  };
  wrapped.tlWrapped = true;
  window[fnName] = wrapped;
}

/* ---- old pages, given the new way in ------------------------------------ */

/* Rows the shell used to add to old pages went with the pages: Settings
   (settings.js) and Tools (tools.js) are new screens now. */
function tlDecorateLegacy() {}

/* ---- start ------------------------------------------------------------- */

function tlShellInit() {
  if (document.body.classList.contains('tl-shell')) return;
  document.body.classList.add('tl-shell');

  var top = document.createElement('div');
  top.id = 'tl-top';
  top.className = 'ds-ui';
  document.body.insertBefore(top, document.body.firstChild);
  var screen = document.createElement('main');
  screen.id = 'tl-screen';
  screen.className = 'ds-ui';
  top.parentNode.insertBefore(screen, top.nextSibling);
  var tabs = document.createElement('div');
  tabs.id = 'tl-tabs';
  document.body.appendChild(tabs);

  ['showHub', 'showPage', 'switchHubSection'].forEach(tlWrapLegacy);
  /* A template's "Load" builds the protocol model (protocol.js). */
  if (typeof tlLoadTemplate === 'function') window.loadTemplate = tlLoadTemplate;
  /* Saving labs shows the panel saved (bloodwork.js). */
  if (typeof tlWrapSaveBloodwork === 'function') tlWrapSaveBloodwork();
  /* Saving measurements from Body's "Measure" goes back to Body (body.js). */
  if (typeof tlWrapSaveBody === 'function') tlWrapSaveBody();
  tlDecorateLegacy();

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target : null;
    if (!el) return;
    var go = el.closest('[data-tl-go]');
    if (go) { e.preventDefault(); tlGo(go.getAttribute('data-tl-go')); return; }
    if (el.closest('[data-tl-back]')) { e.preventDefault(); tlBack(); return; }
    /* A button that runs one of the new screens' functions by name, so a
       button in the top bar works without its screen wiring the bar. */
    var call = el.closest('[data-tl-call]');
    if (call) {
      var fn = call.getAttribute('data-tl-call');
      if (/^tl[A-Z]\w*$/.test(fn) && typeof window[fn] === 'function') { e.preventDefault(); window[fn](call); }
      return;
    }
    var tab = el.closest('[data-ds-tab]');
    if (tab) {
      e.preventDefault();
      /* The centre button is an action, not a place: it opens the Log sheet
         over whatever is showing. */
      if (tab.getAttribute('data-ds-tab') === 'log' && typeof tlOpenLogSheet === 'function') tlOpenLogSheet();
      else tlGo(tab.getAttribute('data-ds-tab'));
    }
  });
  top.addEventListener('ds-change', function (e) {
    var r = TL_ROUTES[tlRoute];
    if (!r || !r.segs || !e.detail) return;
    var target = r.segs + '/' + e.detail.value;
    /* A refused gate leaves the old segment selected. */
    if (!tlGo(target)) tlShellChrome(tlRoute);
  });
  window.addEventListener('popstate', function () {
    var name = tlRouteFromHash(location.hash);
    /* A param route shows again for another argument (one compound to the next). */
    if ((name !== tlRoute || (TL_ROUTES[name] && TL_ROUTES[name].param)) && !tlShow(name)) name = tlRoute;
    /* "#/library" becomes "#/library/compounds"; an unknown address, "#/today". */
    if (location.hash !== tlRouteHash(name)) history.replaceState(null, '', tlRouteHash(name));
  });

  /* A notification's action can arrive in the address ("#/today?round=…"),
     which the router is about to tidy away. */
  if (typeof tlRoundAlertsInit === 'function') tlRoundAlertsInit(location.hash);

  var first = tlRouteFromHash(location.hash);
  if (!tlShow(first)) tlShow('today');
  history.replaceState(null, '', tlRouteHash(tlRoute));

  /* A first run, or terms accepted under an older version: onboarding. */
  if (typeof tlObStart === 'function') tlObStart();
}

/* The old app starts up asynchronously: once its storage has loaded it moves
   its pages into their hubs (mountHubPages) and shows its home page. The shell
   has to start after that, or that home page would replace a linked route and
   the hubs would not hold their pages yet. Both happen in one callback, so
   once the pages are in their hubs, a fresh task sees the start-up finished.
   If the old start-up never gets there, the shell starts anyway after 5 s. */
function tlShellWhenReady(tries) {
  var page = document.getElementById('page-settings'), hub = document.getElementById('hub-sec-settings');
  if ((page && hub && hub.contains(page)) || tries >= 100) setTimeout(tlShellInit, 0);
  else setTimeout(function () { tlShellWhenReady(tries + 1); }, 50);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined' && window.location.hash !== '#ui-kit') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { tlShellWhenReady(0); });
  else tlShellWhenReady(0);
}
