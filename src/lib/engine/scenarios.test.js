import { test } from "node:test";
import assert from "node:assert/strict";
import { applyScenario } from "./scenarios.js";

const records = [
  { missionDay: 9, sleepHours: 7, mood: 4 },
  { missionDay: 10, sleepHours: 7, mood: 4, spo2: 98 },
  { missionDay: 11, sleepHours: 7, mood: 1 },
];

test("changes only the chosen days, never the input", () => {
  const out = applyScenario(records, { type: "sleepLoss", fromDay: 10, days: 2, intensity: 1 });
  assert.equal(out[0], records[0]);
  assert.equal(out[1].sleepHours, 4.5);
  assert.equal(out[1].origin, "scenario");
  assert.equal(records[1].sleepHours, 7);
  assert.equal(out[2].mood, 1); // clamped to the 1–5 scale
});

test("never invents readings that weren't taken", () => {
  const out = applyScenario(records, { type: "hypoxia", fromDay: 9, days: 3, intensity: 0.5 });
  assert.equal(out[1].spo2, 94);
  assert.equal("spo2" in out[0], false);
  assert.equal(out[0].origin, undefined);
});

test("rejects bad input", () => {
  assert.throws(() => applyScenario(records, { type: "zombies", fromDay: 1, days: 1, intensity: 1 }), RangeError);
  assert.throws(() => applyScenario(records, { type: "fatigue", fromDay: 1, days: 0, intensity: 1 }), RangeError);
  assert.throws(() => applyScenario(records, { type: "fatigue", fromDay: 1, days: 1, intensity: 2 }), RangeError);
});
