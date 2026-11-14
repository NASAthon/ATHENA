import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMissionBaselines } from "./baseline.js";
import { DRIFT_INDICATOR_KEYS } from "./indicators.js";
import { allIndicatorStatuses, indicatorStatus } from "./status.js";
import { makeMission } from "./testData.js";

test("no_data with no records or no baselines", () => {
  assert.equal(indicatorStatus([], {}, "sleepHours", 50).status, "no_data");
  const records = makeMission({ seed: 1, toDay: 50 });
  assert.equal(indicatorStatus(records, {}, "sleepHours", 50).status, "no_data");
});

test("healthy astronaut is steady on every indicator with data", () => {
  const records = makeMission({ seed: 2 });
  const baselines = calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
  for (const s of allIndicatorStatuses(records, baselines, 150)) {
    assert.ok(["steady", "no_data"].includes(s.status), `${s.key} was ${s.status}`);
  }
  // SpO₂ isn't in the test data, so it has no data.
  assert.equal(indicatorStatus(records, baselines, "spo2", 150).status, "no_data");
});

test("a slow decline after the in-flight baseline is 'drifting'", () => {
  const records = makeMission({ seed: 3, shift: (d) => (d > 75 ? { sleepHours: -0.03 * (d - 75) } : {}) });
  const baselines = calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
  const s = indicatorStatus(records, baselines, "sleepHours", 130);
  assert.equal(s.status, "drifting");
  assert.ok(s.worryingZ >= 3.5);
});

test("a change since Earth that is stable in flight is 'expected_adaptation'", () => {
  // Heart rate settles 10 bpm higher from launch onwards and stays there.
  const records = makeMission({ seed: 4, shift: (d) => (d > 0 ? { heartRate: 10 } : {}) });
  const baselines = calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
  assert.equal(indicatorStatus(records, baselines, "heartRate", 15).status, "expected_adaptation");
  assert.equal(indicatorStatus(records, baselines, "heartRate", 120).status, "expected_adaptation");
});

test("drifting is impossible before the in-flight window ends (day 36)", () => {
  const records = makeMission({ seed: 5, toDay: 35, shift: (d) => (d > 25 ? { sleepHours: -3 } : {}) });
  const baselines = calculateMissionBaselines(records, DRIFT_INDICATOR_KEYS);
  assert.notEqual(indicatorStatus(records, baselines, "sleepHours", 35).status, "drifting");
});

test("rejects an indicator that isn't drift-tracked", () => {
  assert.throws(() => indicatorStatus([], {}, "reactionFalseStarts", 1), RangeError);
});
