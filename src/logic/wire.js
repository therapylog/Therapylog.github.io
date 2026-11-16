/* Where the logic meets the app.
 *
 * Everything else under src/logic/ takes what it needs as arguments, so it can
 * be tested without a browser. This file is the exception: the few functions
 * that read the app's own globals (the stored record, the encyclopedia, the
 * old settings) and hand them to the logic. Keep it thin. Anything worth a
 * test belongs in the file it calls.
 */

/* What protocol.js needs to know about the world outside it. */
function tlEnv() {
  return {
    /* A typed compound name -> encyclopedia id, with the app's own matcher. */
    resolve: typeof pkResolve === 'function' ? pkResolve : null,
    /* An encyclopedia id -> formulation: 'oil', 'aq', 'oral', 'susp', 'topical'. */
    medium: function (id) {
      var pk = (typeof TL_PK !== 'undefined' && TL_PK[id]) || null;
      return (pk && pk.medium) || (typeof TL_FORM !== 'undefined' && TL_FORM[id]) || null;
    },
    discreet: typeof discreetReminders === 'function' ? discreetReminders() : false
  };
}

/* The user's protocol, as the model. */
function tlCurrentProtocol() {
  return tlProtocol(gd(), tlEnv());
}

/* ---- the upgrade screen -------------------------------------------------- */

/* The one way into the upgrade screen. Every feature gate arrives here through
   TLTier.prompt(), carrying the gated feature's display name, which tier
   unlocks it ('pro' or 'std') and the feature's key.
   For now the screen is the overlay TLTier has always shown; the redesign's
   Pro screen replaces the body of this function and nothing else changes. */
function openUpgrade(featureName, tier, featureKey) {
  if (window.TLTier && typeof TLTier._overlay === 'function') {
    TLTier._overlay(tier === 'pro' ? 'pro' : 'std', featureKey || featureName);
  }
}

/* Restore a purchase. On iOS that is the App Store's own restore; everywhere
   else a plan is restored by entering its license key. Returns which was
   started, 'store' or 'license', or null if neither is available. */
function tlRestorePurchases() {
  var platform = (window.Capacitor && window.Capacitor.getPlatform) ? window.Capacitor.getPlatform() : 'web';
  if (platform === 'ios' && window.TLIAP && typeof TLIAP.restore === 'function') { TLIAP.restore(); return 'store'; }
  if (window.TLTier && typeof TLTier.showActivation === 'function') { TLTier.showActivation(); return 'license'; }
  return null;
}

/* ---- backup -------------------------------------------------------------- */

/* Where the user's backup stands. `linked` is whether a backup file is linked
   for the weekly rewrite, which only the caller can know (the handle lives in
   IndexedDB and is read asynchronously, by tlGetHandle). */
function tlBackupStatus(linked) {
  var last = null;
  try { last = parseInt(localStorage.getItem('tl-last-export') || '0', 10) || null; } catch (e) {}
  var d = gd();
  var hasData = (d.entries || []).length > 0 || !!d.proto || !!(d.profile && d.profile.name);
  return tlBackupState(last, Date.now(), !!linked, hasData);
}

/* A lab marker's name, for the spreadsheet: a built-in field's label, a custom
   marker's name, or the key when it is neither. */
function tlMarkerLabel(key) {
  var i;
  if (typeof LAB_FIELDS !== 'undefined') {
    for (i = 0; i < LAB_FIELDS.length; i++) if (LAB_FIELDS[i].key === key) return LAB_FIELDS[i].label || key;
  }
  var custom = (typeof getAllCustomMarkers === 'function') ? getAllCustomMarkers()[key] : null;
  return (custom && custom.name) || key;
}

/* Download the log as a spreadsheet. Not a backup: it cannot be restored from,
   so it does not reset the backup clock. */
function tlExportCsv() {
  var csv = tlLogCsv(gd(), tlMarkerLabel);
  /* The byte-order mark makes Excel read the file as UTF-8. */
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'therapylog-log-' + tlTodayStr() + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  return csv;
}

/* ---- theme --------------------------------------------------------------- */

/* The theme showing now: 'dark' or 'light'. */
function tlTheme() {
  return document.body.classList.contains('light-mode') ? 'light' : 'dark';
}

/* Set the theme, and keep it. toggleTheme() already knows how to switch the
   class, store the choice and redraw the charts, so this only decides whether
   a switch is needed. */
function tlSetTheme(mode) {
  if (mode !== 'light' && mode !== 'dark') return tlTheme();
  if (tlTheme() !== mode) toggleTheme();
  else { try { localStorage.setItem('tl-theme', mode); } catch (e) {} }
  return tlTheme();
}
