import { test } from "node:test";
import assert from "node:assert/strict";
import { reactionRecordFields, scoreReactionTest } from "./reaction.js";

test("median, lapses over 500 ms and false starts", () => {
  const score = scoreReactionTest({ trialsMs: [320, 280, 510, 300, 500], falseStarts: 2 });
  assert.equal(score.medianMs, 320);
  assert.equal(score.lapses, 1); // 500 exactly is not "over 500"
  assert.equal(score.falseStarts, 2);
  assert.deepEqual(reactionRecordFields(score), { reactionMedianMs: 320, reactionLapses: 1, reactionFalseStarts: 2 });
});

test("even number of trials averages the middle two", () => {
  assert.equal(scoreReactionTest({ trialsMs: [300, 200, 400, 100] }).medianMs, 250);
});

test("invalid entries are ignored; no valid trials gives a null median", () => {
  const score = scoreReactionTest({ trialsMs: [null, -5, 0, "300", Number.NaN] });
  assert.equal(score.medianMs, null);
  assert.equal(score.ignoredTrials, 5);
  assert.throws(() => scoreReactionTest({ trialsMs: "fast" }), TypeError);
  assert.throws(() => scoreReactionTest({ trialsMs: [], falseStarts: -1 }), TypeError);
});

test("ten runs in a row give identical results", () => {
  const trials = [301, 299, 650, 280, 310, 305];
  const first = scoreReactionTest({ trialsMs: trials, falseStarts: 1 });
  for (let i = 0; i < 10; i += 1) assert.deepEqual(scoreReactionTest({ trialsMs: trials, falseStarts: 1 }), first);
});
