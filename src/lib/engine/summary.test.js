import { test } from "node:test";
import assert from "node:assert/strict";
import { simulateAstronaut } from "../sim/simulator.js";
import { calculateMissionBaselines } from "./baseline.js";
import { evaluateMission } from "./evaluate.js";
import { DRIFT_INDICATOR_KEYS, DRIFT_INDICATORS } from "./indicators.js";
import { buildSurgeonSummary, driftKeyName } from "./summary.js";

/** Day-129 evaluation of one simulated crew member, with baselines fixed at day 35. */
function day129(id) {
  const records = simulateAstronaut(id).filter((r) => r.missionDay <= 129);
  const baselines = calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
  return evaluateMission(records, baselines, 36, 129).at(-1);
}

test("every drift-tracked field has a plain-English name", () => {
  for (const { key } of DRIFT_INDICATORS) {
    assert.notEqual(driftKeyName(key), key, `${key} has no display name`);
  }
  assert.equal(driftKeyName("bpSystolic"), "Blood pressure (top number)");
});

test("summary text for the flight surgeon uses plain English, not code field names (Rivera and Nakamura)", () => {
  for (const [id, name] of [["rivera", "Commander Rivera"], ["nakamura", "Engineer Nakamura"]]) {
    const summary = buildSurgeonSummary({ astronaut: name, evaluation: day129(id), missionModeId: "mars" });
    const text = summary.lines.join("\n").replace(/https?:\/\/\S+/g, ""); // URLs may contain anything
    assert.ok(!/\b[a-z]+[A-Z][A-Za-z]*\b/.test(text), `${id}: camelCase name in:\n${text}`);
    assert.ok(text.includes("up to 40 minutes"), `${id}: reply time from the Mars mode`);
  }
});
