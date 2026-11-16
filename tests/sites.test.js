/* Injection sites: the map data and site rotation (src/logic/sites.js).
 *
 * The first tests are about the data file itself, assets/figures/
 * injection-sites.json, because the app's notion of "right" comes from it and
 * it was wrong on the back view until this was written.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, same, local } = require('./helpers/app');

const app = loadApp({ files: ['src/logic/sites.js'] });
const file = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'figures', 'injection-sites.json'), 'utf8'));
const MAP = { figure: file.figure, sites: file.sites };

const NOW = local('2026-03-10T12:00').getTime();
const hoursAgo = (h) => new Date(NOW - h * 36e5).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);
const dose = (extra, ts) => Object.assign({ type: 'medication', ts, medication: 'X', dose: '', site: null, notes: '' }, extra);
const site = (id) => app.tlSiteById(MAP, id);

/* ---- the data ------------------------------------------------------------ */

test('the map has 24 sites, twelve on each view, in left and right pairs', () => {
  assert.equal(MAP.sites.length, 24);
  assert.equal(new Set(MAP.sites.map((s) => s.id)).size, 24);
  assert.equal(MAP.sites.filter((s) => s.view === 'front').length, 12);
  assert.equal(MAP.sites.filter((s) => s.view === 'back').length, 12);
  for (const r of MAP.sites.filter((s) => s.id.endsWith('-r'))) {
    const l = site(r.id.slice(0, -1) + 'l');
    assert.ok(l, r.id + ' has no left partner');
    same([l.view, l.route, l.restDays, l.y], [r.view, r.route, r.restDays, r.y], r.id);
    assert.ok(Math.abs(r.x + l.x - 1) < 1e-9, r.id + ' and its partner are not mirror images');
  }
});

test('right is the person\'s right: on your left from the front, on your right from behind', () => {
  for (const s of MAP.sites) {
    const personsRight = s.id.endsWith('-r');
    const onViewersRight = s.x > 0.5;
    assert.equal(onViewersRight, s.view === 'back' ? personsRight : !personsRight, s.id);
    assert.equal(/^Right /.test(s.name), personsRight, s.id + ' is named ' + s.name);
  }
});

test('every site has a route, a rest period and a place on the figure', () => {
  for (const s of MAP.sites) {
    assert.ok(s.route === 'im' || s.route === 'sq', s.id);
    assert.ok(s.restDays >= 3 && s.restDays <= 14, s.id);
    assert.ok(s.x > 0 && s.x < 1 && s.y > 0 && s.y < 1, s.id);
  }
  same(file.figure, { male: [478, 1038], female: [477, 1036] });
});

test('scripts/build-app.js inlines this file into app.html as TL_SITE_MAP', () => {
  const html = require('../scripts/lib/app-source.js').readApp();
  const m = html.match(/var TL_SITE_MAP = (\{.*\});/);
  assert.ok(m, 'TL_SITE_MAP is not in app.html');
  same(JSON.parse(m[1]), MAP);
});

/* ---- entries ------------------------------------------------------------- */

test('the nine old site labels map to site ids, and the belly to an id on no map', () => {
  same(Object.assign({}, app.TL_LEGACY_SITES), {
    'L Delt': 'delt-l', 'R Delt': 'delt-r', 'L Glute': 'dg-l', 'R Glute': 'dg-r',
    'L Quad': 'quad-l', 'R Quad': 'quad-r', 'L Lat': 'lat-l', 'R Lat': 'lat-r',
    'Sub-Q Belly': 'legacy-subq', 'Sub-Q': 'legacy-subq'
  });
  for (const id of Object.values(app.TL_LEGACY_SITES)) {
    if (id !== 'legacy-subq') assert.ok(site(id), id + ' is not on the map');
  }
  assert.equal(site('legacy-subq'), null);
});

test('an entry\'s site is its id, or its old label mapped, or nothing', () => {
  assert.equal(app.tlSiteIdOf(dose({ siteId: 'dg-r', site: 'Right dorsogluteal' })), 'dg-r');
  assert.equal(app.tlSiteIdOf(dose({ site: 'L Glute' })), 'dg-l');
  assert.equal(app.tlSiteIdOf(dose({ site: 'Sub-Q Belly' })), 'legacy-subq');
  assert.equal(app.tlSiteIdOf(dose({ site: 'somewhere else' })), null);
  assert.equal(app.tlSiteIdOf(dose({ site: null })), null);
  assert.equal(app.tlSiteIdOf(dose({ site: 'toString' })), null);
  assert.equal(app.tlSiteIdOf(null), null);
});

test('a site is named from the map, and an old label that maps nowhere is shown as stored', () => {
  assert.equal(app.tlSiteName(MAP, dose({ site: 'L Glute' })), 'Left dorsogluteal');
  assert.equal(app.tlSiteName(MAP, dose({ siteId: 'abd-r' })), 'Right abdomen');
  assert.equal(app.tlSiteName(MAP, dose({ site: 'Sub-Q Belly' })), 'Sub-Q Belly');
  assert.equal(app.tlSiteName(MAP, dose({})), '');
});

test('last used is the most recent dose at a site, whatever the compound', () => {
  const entries = [
    dose({ siteId: 'dg-r', medication: 'A' }, daysAgo(9)),
    dose({ site: 'R Glute', medication: 'B' }, daysAgo(2)),
    dose({ site: 'L Delt' }, daysAgo(5)),
    dose({ site: null }, daysAgo(1)),
    { type: 'weight', ts: daysAgo(0), siteId: 'delt-r' }
  ];
  same(app.tlSiteLastUsed(entries), { 'dg-r': daysAgo(2), 'delt-l': daysAgo(5) });
  same(app.tlSiteLastUsed([]), {});
});

/* ---- status -------------------------------------------------------------- */

test('a site goes from recent to recovering at 48 hours and to rested when its rest period is up', () => {
  const quad = site('quad-r');                              /* seven days */
  const state = (h) => app.tlSiteStatus(quad, hoursAgo(h), NOW).state;
  assert.equal(app.tlSiteStatus(quad, null, NOW).state, 'never');
  same([0, 23, 47.9].map(state), ['recent', 'recent', 'recent']);
  same([48, 100, 167.9].map(state), ['recovering', 'recovering', 'recovering']);
  same([168, 500].map(state), ['rested', 'rested']);
});

test('the status line reads as the design has it', () => {
  const quad = site('quad-r');
  const line = (lastIso) => app.tlSiteStatus(quad, lastIso, NOW).line;
  assert.equal(line(null), 'Not used yet.');
  assert.equal(line(hoursAgo(3)), 'Used today. The 7-day rest ends in 7 days.');
  assert.equal(line(daysAgo(1)), 'Used yesterday. The 7-day rest ends in 6 days.');
  assert.equal(line(daysAgo(3)), 'Used 3 days ago. The 7-day rest ends in 4 days.');
  assert.equal(line(daysAgo(6)), 'Used 6 days ago. The 7-day rest ends in 1 day.');
  assert.equal(line(daysAgo(7)), 'Last used 7 days ago. Rested.');
  assert.equal(line(daysAgo(20)), 'Last used 20 days ago. Rested.');
});

test('a subcutaneous site, with a three-day rest, is rested on the third day', () => {
  const abd = site('abd-l');
  same([1, 2, 3].map((d) => app.tlSiteStatus(abd, daysAgo(d), NOW).state), ['recent', 'recovering', 'rested']);
});

test('a dose stamped in the future does not produce a negative count', () => {
  const st = app.tlSiteStatus(site('quad-r'), hoursAgo(-5), NOW);
  same([st.state, st.days], ['recent', 0]);
});

/* ---- choosing a site ----------------------------------------------------- */

test('the route decides which sites exist, and a route that is not injected has none', () => {
  assert.equal(app.tlSitesFor(MAP, 'im').length, 18);
  assert.equal(app.tlSitesFor(MAP, 'sq').length, 6);
  assert.equal(app.tlSitesFor(MAP, 'im', 'front').length, 6);
  assert.equal(app.tlSitesFor(MAP, 'im', 'back').length, 12);
  assert.equal(app.tlSitesFor(MAP, 'sq', 'back').length, 0);
  same(app.tlSitesFor(MAP, 'oral'), []);
  same(app.tlSitesFor(MAP, null), []);
});

test('the site offered is the rested one that has waited longest', () => {
  const entries = [
    dose({ siteId: 'delt-r' }, daysAgo(9)), dose({ siteId: 'quad-r' }, daysAgo(16)),
    dose({ siteId: 'dg-r' }, daysAgo(20)), dose({ siteId: 'quad-l' }, daysAgo(1))
  ];
  const pick = app.tlLongestRested(MAP, 'im', entries, NOW);
  same([pick.site.id, pick.days, pick.state], ['dg-r', 20, 'rested']);
});

test('with nothing rested yet it offers a site never used, and with every site in use the oldest', () => {
  const some = [dose({ siteId: 'abd-r' }, daysAgo(1)), dose({ siteId: 'abd-l' }, daysAgo(2))];
  const never = app.tlLongestRested(MAP, 'sq', some, NOW);
  same([never.site.id, never.state], ['flank-r', 'never']);
  const all = app.tlSitesFor(MAP, 'sq').map((s, i) => dose({ siteId: s.id }, hoursAgo(10 + i)));
  const oldest = app.tlLongestRested(MAP, 'sq', all, NOW);
  same([oldest.site.id, oldest.state], [app.tlSitesFor(MAP, 'sq')[5].id, 'recent']);
  assert.equal(app.tlLongestRested(MAP, 'oral', [], NOW), null);
});

test('with no history at all it offers the first site for the route', () => {
  assert.equal(app.tlLongestRested(MAP, 'im', [], NOW).site.id, 'delt-r');
  assert.equal(app.tlLongestRested(MAP, 'sq', [], NOW).site.id, 'abd-r');
});

test('an old dose at "Sub-Q Belly" rests no site on the map', () => {
  const states = app.tlSiteStates(MAP, 'sq', [dose({ site: 'Sub-Q Belly' }, daysAgo(0))], NOW);
  assert.ok(states.every((s) => s.state === 'never'));
});

test('a tap picks the nearest site for the route on that view, within 15% of the figure\'s width', () => {
  const aspect = 1038 / 478;
  const tap = (route, view, x, y) => { const s = app.tlNearestSite(MAP, route, view, x, y, aspect); return s ? s.id : null; };
  assert.equal(tap('im', 'front', 0.275, 0.225), 'delt-r');
  assert.equal(tap('im', 'front', 0.30, 0.24), 'delt-r');
  /* On the back view the person's right is at x over 0.5. */
  assert.equal(tap('im', 'back', 0.635, 0.207), 'trap-r');
  /* A subcutaneous compound cannot pick an intramuscular site, however close. */
  assert.equal(tap('sq', 'front', 0.275, 0.225), null);
  assert.equal(tap('sq', 'front', 0.445, 0.415), 'abd-r');
  /* Off the body. */
  assert.equal(tap('im', 'front', 0.02, 0.95), null);
  assert.equal(tap('sq', 'back', 0.5, 0.5), null);
});
