import { test } from "node:test";
import assert from "node:assert/strict";
import { DRIFT_CUTOFF, driftZ } from "./drift.js";

const baseline = { status: "ok", mean: 7, sd: 0.5, n: 15 };

test("implements z = (recent − mean) ÷ (s × √(1/n + 1/m))", () => {
  const recent = { status: "ok", mean: 6, n: 7 };
  const expected = (6 - 7) / (0.5 * Math.sqrt(1 / 7 + 1 / 15));
  const result = driftZ(recent, baseline, "down", 0.25);
  assert.equal(result.z, expected);
  assert.equal(result.worryingZ, -expected);
});

test("cut-off is 3.5 and only the worrying direction counts", () => {
  assert.equal(DRIFT_CUTOFF, 3.5);
  const lower = { status: "ok", mean: 6, n: 7 }; // z ≈ −4.4
  assert.equal(driftZ(lower, baseline, "down", 0.25).drifting, true);
  assert.equal(driftZ(lower, baseline, "up", 0.25).drifting, false);
  assert.equal(driftZ(lower, baseline, "both", 0.25).drifting, true);
});

test("the sd floor stops a very steady baseline from inflating z", () => {
  const steady = { status: "ok", mean: 7, sd: 0.01, n: 15 };
  const recent = { status: "ok", mean: 6.9, n: 7 };
  const result = driftZ(recent, steady, "down", 0.25);
  assert.equal(result.floorApplied, true);
  assert.equal(result.s, 0.25);
  assert.equal(result.drifting, false);
});

test("returns null when either side lacks data", () => {
  assert.equal(driftZ({ status: "insufficient_data", mean: null, n: 2 }, baseline, "down", 0.25), null);
  assert.equal(driftZ({ status: "ok", mean: 6, n: 7 }, { status: "no_data", mean: null, sd: null, n: 0 }, "down", 0.25), null);
  assert.equal(driftZ({ status: "ok", mean: 6, n: 7 }, undefined, "down", 0.25), null);
});

test("rejects a missing floor or unknown direction", () => {
  assert.throws(() => driftZ({ status: "ok", mean: 6, n: 7 }, baseline, "down", 0), RangeError);
  assert.throws(() => driftZ({ status: "ok", mean: 6, n: 7 }, baseline, "sideways", 1), RangeError);
});
