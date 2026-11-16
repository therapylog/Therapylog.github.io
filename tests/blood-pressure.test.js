/* Characterization tests: blood-pressure staging.
 *
 * getBPStage() is stored with every reading (the entry's `stage` field) and
 * drives the colour and the advice text beside it. The redesign keeps the same
 * ACC/AHA categories on a new screen, so every boundary is pinned here first.
 *
 * This function has been wrong before. A copy of it in the native shell called
 * 200/85 "Stage 1" because it only reported a crisis when both numbers were
 * high (therapylog-app/shell/README.md), so the one-number-high cases are
 * spelled out.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/app');

const app = loadApp({ functions: ['getBPStage'] });
const stage = (sys, dia) => { const s = app.getBPStage(sys, dia); return s ? s.stage : null; };

test('normal is under 120 and under 80', () => {
  assert.equal(stage(119, 79), 'Normal');
  assert.equal(stage(90, 60), 'Normal');
});

test('elevated is 120 to 129 with diastolic under 80', () => {
  assert.equal(stage(120, 79), 'Elevated');
  assert.equal(stage(129, 79), 'Elevated');
});

test('stage 1 is 130 to 139, or diastolic 80 to 89', () => {
  assert.equal(stage(130, 79), 'High — Stage 1');
  assert.equal(stage(139, 89), 'High — Stage 1');
  /* Either number alone is enough. */
  assert.equal(stage(120, 80), 'High — Stage 1');
  assert.equal(stage(110, 85), 'High — Stage 1');
});

test('stage 2 is 140 or over, or diastolic 90 or over', () => {
  assert.equal(stage(140, 89), 'High — Stage 2');
  assert.equal(stage(139, 90), 'High — Stage 2');
  assert.equal(stage(180, 120), 'High — Stage 2');
  assert.equal(stage(110, 95), 'High — Stage 2');
});

test('a crisis is over 180 or over 120, and one number alone is enough', () => {
  assert.equal(stage(181, 85), 'Hypertensive Crisis');
  assert.equal(stage(200, 85), 'Hypertensive Crisis');
  assert.equal(stage(150, 121), 'Hypertensive Crisis');
  assert.equal(stage(181, 121), 'Hypertensive Crisis');
});

test('a missing or zero number gives no stage at all', () => {
  assert.equal(app.getBPStage(0, 80), null);
  assert.equal(app.getBPStage(120, 0), null);
  assert.equal(app.getBPStage(undefined, undefined), null);
  assert.equal(app.getBPStage(NaN, 80), null);
});

test('readings that cannot be real are still staged, because nothing validates them here', () => {
  /* PINNED, suspected bug: diastolic above systolic, and numbers no person has,
     get a stage like any other reading. The redesign validates the input
     (systolic 60 to 250, diastolic 30 to 160, systolic above diastolic). */
  assert.equal(stage(80, 110), 'High — Stage 2');
  assert.equal(stage(20, 10), 'Normal');
  assert.equal(stage(900, 10), 'Hypertensive Crisis');
});

test('each stage carries a colour, a tint, a border and advice text', () => {
  for (const [sys, dia] of [[110, 70], [125, 70], [135, 70], [150, 70], [190, 70]]) {
    const s = app.getBPStage(sys, dia);
    for (const key of ['stage', 'color', 'bg', 'border', 'desc']) {
      assert.equal(typeof s[key], 'string', `${sys}/${dia} has no ${key}`);
      assert.ok(s[key].length > 0);
    }
  }
});
