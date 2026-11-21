/* Characterization tests: refill alerts.
 *
 * calcRefillAlerts() is today's whole supply model: how many days a compound
 * has left, and whether to warn. The redesign replaces it with doses per vial,
 * doses left and spare vials, counted from the rounds. These tests pin what the
 * current arithmetic does so the new engine can be compared against it, and so
 * the old alerts keep working until the new screen replaces them.
 *
 * Two things about the current model that the tests make visible:
 *
 *   - "days per vial" comes from DRUG_COSTS[name].monthly (vials used per
 *     month at a typical dose), not from the user's dose or vial size.
 *   - a compound the cost table does not list never alerts at all.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, same, local, DAY_MS } = require('./helpers/app');

const NOW = '2026-03-04T12:00';
const ago = (days) => new Date(local(NOW).getTime() - days * DAY_MS).toISOString();
const dose = (name, days) => ({ type: 'medication', ts: ago(days), medication: name, dose: '', site: '', notes: '' });

const alerts = (record) => loadApp({
  functions: ['calcRefillAlerts', 'parseMeds', 'parseFrequency'],
  consts: ['DRUG_COSTS'],
  record, now: NOW
}).calcRefillAlerts();

const proto = (meds) => ({ name: 'P', start: '2026-01-05', weeks: 12, meds, pct: '' });

test('the cost table says BPC-157 lasts 10 days a vial and testosterone cypionate 30', () => {
  const app = loadApp({ consts: ['DRUG_COSTS'] });
  same(app.DRUG_COSTS['BPC-157'], { price: 45, unit: '5mg vial', monthly: 3 });
  same(app.DRUG_COSTS['Testosterone Cypionate'], { price: 35, unit: '10ml vial (200mg/ml)', monthly: 1 });
});

test('no protocol, or a protocol with no text, gives no alerts', () => {
  same(alerts({ entries: [], proto: null }), []);
  same(alerts({ entries: [], proto: proto('') }), []);
});

test('a compound missing from the cost table never alerts, however long ago it was logged', () => {
  /* PINNED, suspected bug: the name must match a DRUG_COSTS key exactly, so a
     compound the table does not list, or one typed with different spelling or
     case, has no refill tracking at all. */
  same(alerts({ entries: [dose('Mystery Peptide', 60)], proto: proto('Mystery Peptide, 1mg, Daily') }), []);
  same(alerts({ entries: [dose('bpc-157', 9)], proto: proto('bpc-157, 250mcg, Daily') }), []);
});

test('with no inventory entered, it estimates from the last logged dose alone', () => {
  /* 10 days a vial, last logged 4 days ago: 6 days left, estimated, urgent. */
  same(alerts({ entries: [dose('BPC-157', 4), dose('BPC-157', 5)], proto: proto('BPC-157, 250mcg, Daily') }), [{
    name: 'BPC-157', daysRemaining: 6, urgent: true, dose: '250mcg', freq: 'Daily',
    cost: 45, unit: '5mg vial', estimate: true, vials: null, since: null
  }]);
});

test('the estimate assumes a fresh vial at every log, so logging a dose pushes the alert away', () => {
  /* PINNED, suspected bug: the estimate is "days per vial minus days since the
     last log". Logging today resets it to a full vial, so a user who logs
     every day is never warned on this path. */
  same(alerts({ entries: [dose('BPC-157', 0)], proto: proto('BPC-157, 250mcg, Daily') }).length, 1);
  assert.equal(alerts({ entries: [dose('BPC-157', 0)], proto: proto('BPC-157, 250mcg, Daily') })[0].daysRemaining, 10);
});

test('with no inventory and nothing logged, there is nothing to estimate from', () => {
  same(alerts({ entries: [], proto: proto('BPC-157, 250mcg, Daily') }), []);
});

test('an alert appears at 14 days or fewer, and is urgent at 7 or fewer', () => {
  const tc = (days) => alerts({ entries: [dose('Testosterone Cypionate', days)],
    proto: proto('Testosterone Cypionate, 100mg, Weekly') });
  same(tc(15), []);                                  /* 15 days left */
  assert.equal(tc(16)[0].daysRemaining, 14);
  assert.equal(tc(16)[0].urgent, false);
  assert.equal(tc(22)[0].urgent, false);             /* 8 days left */
  assert.equal(tc(23)[0].daysRemaining, 7);
  assert.equal(tc(23)[0].urgent, true);
  assert.equal(tc(45)[0].daysRemaining, 0);          /* never negative */
});

test('with inventory entered, it counts vials on hand minus doses logged since', () => {
  /* 2 vials at 10 days each, 8 daily doses logged since: 12 days left. */
  const entries = Array.from({ length: 8 }, (_, i) => dose('BPC-157', i));
  const since = ago(20);
  same(alerts({ entries, proto: proto('BPC-157, 250mcg, Daily'), supply: { 'BPC-157': { vials: 2, sinceTs: since } } }), [{
    name: 'BPC-157', daysRemaining: 12, urgent: false, dose: '250mcg', freq: 'Daily',
    cost: 45, unit: '5mg vial', estimate: false, vials: 2, since
  }]);
});

test('doses logged before the inventory was entered do not count against it', () => {
  const entries = [dose('BPC-157', 1), dose('BPC-157', 2), dose('BPC-157', 30), dose('BPC-157', 31)];
  const got = alerts({ entries, proto: proto('BPC-157, 250mcg, Daily'),
    supply: { 'BPC-157': { vials: 1, sinceTs: ago(3) } } });
  assert.equal(got[0].daysRemaining, 8);             /* 10 minus the 2 since */
});

test('twice-daily dosing halves the days each logged dose uses up', () => {
  /* 8 doses at 2 a day is 4 days used; 1 vial is 10 days; 6 left. */
  const entries = Array.from({ length: 8 }, (_, i) => dose('BPC-157', i / 2));
  const got = alerts({ entries, proto: proto('BPC-157, 250mcg, Twice daily'),
    supply: { 'BPC-157': { vials: 1, sinceTs: ago(20) } } });
  assert.equal(got[0].daysRemaining, 6);
});

test('zero vials on hand is an urgent alert with nothing left', () => {
  const got = alerts({ entries: [], proto: proto('BPC-157, 250mcg, Daily'),
    supply: { 'BPC-157': { vials: 0, sinceTs: ago(1) } } });
  assert.equal(got[0].daysRemaining, 0);
  assert.equal(got[0].urgent, true);
  assert.equal(got[0].estimate, false);
});

test('the 10-day pulse frequency has no dose rate, so the compound is skipped', () => {
  /* PINNED, suspected bug: parseFrequency() types this "pulse", which
     calcRefillAlerts() gives zero doses a day and drops. */
  same(alerts({ entries: [dose('BPC-157', 9)], proto: proto('BPC-157, 250mcg, 10-day pulse') }), []);
});

test('alerts are sorted with the fewest days first', () => {
  const got = alerts({
    entries: [dose('Testosterone Cypionate', 20), dose('BPC-157', 7)],
    proto: proto('Testosterone Cypionate, 100mg, Weekly\nBPC-157, 250mcg, Daily')
  });
  same(got.map((a) => [a.name, a.daysRemaining]), [['BPC-157', 3], ['Testosterone Cypionate', 10]]);
});
