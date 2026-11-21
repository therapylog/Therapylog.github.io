/* Injection sites: the body map's data, and site rotation.
 *
 * The 24 sites come from assets/figures/injection-sites.json, inlined by
 * scripts/build-app.js as TL_SITE_MAP: an id, a name, the view it is drawn on
 * (front or back), the route it suits (im or sq), a rest period in days, and
 * its position as a fraction of the figure box. Left and right in a site id
 * are the person's own.
 *
 * Nothing about site use is stored separately. A site's "last used" is the
 * most recent medication entry that names it, so undoing or deleting a dose
 * also takes back the use of its site. Entries logged before the map existed
 * carry one of nine text labels instead of an id; TL_LEGACY_SITES maps them.
 *
 * Every function takes the map as an argument rather than reading the global,
 * so a test can pass a small one.
 */

/* The nine strings the old dose form stored (docs/DATA-MODEL.md, 3.1). The old
   "glute" was the dorsogluteal site. "Sub-Q Belly" did not say which side, so
   it maps to an id that is on no map: it stays in history and counts for no
   site's rest clock. */
var TL_LEGACY_SITES = {
  'L Delt': 'delt-l', 'R Delt': 'delt-r',
  'L Glute': 'dg-l', 'R Glute': 'dg-r',
  'L Quad': 'quad-l', 'R Quad': 'quad-r',
  'L Lat': 'lat-l', 'R Lat': 'lat-r',
  'Sub-Q Belly': 'legacy-subq', 'Sub-Q': 'legacy-subq'
};
var TL_LEGACY_SITE_ID = 'legacy-subq';
var TL_HOUR_MS = 36e5;

/* The site an entry was given at: its id if it has one, else its old label
   mapped, else null. */
function tlSiteIdOf(entry) {
  if (!entry) return null;
  if (entry.siteId) return entry.siteId;
  return entry.site && TL_LEGACY_SITES.hasOwnProperty(entry.site) ? TL_LEGACY_SITES[entry.site] : null;
}

function tlSiteById(map, id) {
  var list = (map && map.sites) || [];
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

/* A site as text for an entry or a history row: the map's name, the old
   label for the unmapped one, or what was stored. */
function tlSiteName(map, entry) {
  var id = tlSiteIdOf(entry), site = id ? tlSiteById(map, id) : null;
  if (site) return site.name;
  return (entry && entry.site) || '';
}

/* Sites for a route, optionally only those drawn on one view. Routes that are
   not injected (oral, topical, unknown) have none. */
function tlSitesFor(map, route, view) {
  if (route !== 'im' && route !== 'sq') return [];
  return ((map && map.sites) || []).filter(function (s) {
    return s.route === route && (!view || s.view === view);
  });
}

/* When each site was last used: { siteId: ISO instant }, from every dose that
   names a site, whatever compound it was. */
function tlSiteLastUsed(entries) {
  var last = {};
  (entries || []).forEach(function (e) {
    if (!e || e.type !== 'medication') return;
    var id = tlSiteIdOf(e);
    if (!id) return;
    if (!last[id] || new Date(e.ts) > new Date(last[id])) last[id] = e.ts;
  });
  return last;
}

/* Local calendar days from one instant to another: 0 within a day, 1 from
   last night to this morning. Counted between the two local midnights and
   rounded, so a day that is 23 or 25 hours long, at a clock change, is one. */
function tlSiteDaysApart(fromMs, toMs) {
  var a = new Date(fromMs), b = new Date(toMs);
  return Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) -
    new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
}

/* Where a site stands.
 *
 *   never        no dose names it
 *   recent       used under 48 hours ago
 *   recovering   used 48 hours ago or more, but inside its rest period
 *   rested       its rest period has passed
 *
 * The state is elapsed time, because rest is: a seven-day rest is 168 hours
 * from the dose. The words are calendar days, because that is how a person
 * reads "today" and "yesterday": an injection at 22:00 was yesterday by 08:00
 * the next morning, ten hours on. So the end of the rest is found in hours and
 * then said in calendar days too, and the sentence's two halves agree: used
 * yesterday, a seven-day rest ends in six days.
 *
 * `days` is calendar days since it was used, and `left` calendar days until
 * the rest runs out (0 when that is later today); both are the numbers the
 * line says. The line is the sentence under the site's name on the map. */
function tlSiteStatus(site, lastIso, nowMs) {
  if (!lastIso) return { state: 'never', days: null, left: null, line: 'Not used yet.' };
  /* A dose stamped in the future, from a clock set wrong, counts as now. */
  var last = Math.min(new Date(lastIso).getTime(), nowMs);
  var hours = (nowMs - last) / TL_HOUR_MS, rest = site.restDays || 0;
  var state = hours < 48 ? 'recent' : hours < rest * 24 ? 'recovering' : 'rested';
  var days = tlSiteDaysApart(last, nowMs);
  var ago = days === 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago';
  if (state === 'rested') return { state: state, days: days, left: 0, line: 'Last used ' + ago + '. Rested.' };
  var left = Math.max(0, tlSiteDaysApart(nowMs, last + rest * 24 * TL_HOUR_MS));
  var ends = left === 0 ? 'ends later today.' : 'ends in ' + left + (left === 1 ? ' day.' : ' days.');
  return { state: state, days: days, left: left, line: 'Used ' + ago + '. The ' + rest + '-day rest ' + ends };
}

/* Every site for a route with its status, for drawing the map. */
function tlSiteStates(map, route, entries, nowMs) {
  var last = tlSiteLastUsed(entries);
  return tlSitesFor(map, route).map(function (s) {
    var st = tlSiteStatus(s, last[s.id] || null, nowMs);
    return { site: s, state: st.state, days: st.days, left: st.left, line: st.line, lastUsed: last[s.id] || null };
  });
}

/* The site to offer for a route: the rested one that has waited longest. If
   none is rested yet, one that has never been used; failing that, the one
   used longest ago. Null only when the route has no sites. */
function tlLongestRested(map, route, entries, nowMs) {
  var all = tlSiteStates(map, route, entries, nowMs);
  if (!all.length) return null;
  var byAge = function (a, b) { return new Date(a.lastUsed) - new Date(b.lastUsed); };
  var rested = all.filter(function (x) { return x.state === 'rested'; }).sort(byAge);
  if (rested.length) return rested[0];
  var never = all.filter(function (x) { return x.state === 'never'; });
  if (never.length) return never[0];
  return all.slice().sort(byAge)[0];
}

/* The site a tap means: the nearest one for this route on this view, if it is
   within 15% of the figure's width. `fx` and `fy` are the tap as fractions of
   the figure box; `aspect` is the box's height over its width, because the
   two fractions are not the same distance (the figure is about 1 : 2.17). */
function tlNearestSite(map, route, view, fx, fy, aspect) {
  var best = null, gap = Infinity;
  tlSitesFor(map, route, view).forEach(function (s) {
    var dx = s.x - fx, dy = (s.y - fy) * aspect;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < gap) { gap = dist; best = s; }
  });
  return best && gap < 0.15 ? best : null;
}
