import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_SEED, simulateCrew } from "../sim/simulator.js";
import { holdBackLiveEvent } from "../sim/demo.js";
import { calculateMissionBaselines } from "../engine/baseline.js";
import { checkReading } from "../engine/redLimits.js";
import { DRIFT_INDICATOR_KEYS } from "../engine/indicators.js";
import { pendingRecordFields } from "./recordSync.js";
import { SCRIPTED_DAY, liveDay, liveSnapshot } from "./stream.js";

const day = SCRIPTED_DAY;
const crew = holdBackLiveEvent(simulateCrew({ seed: DEMO_SEED, toDay: day }), day);
const stored = crew.nakamura.find((r) => r.missionDay === day);
const baselines = calculateMissionBaselines(crew.nakamura.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
const history = crew.nakamura.filter((r) => r.missionDay < day && r.missionDay >= day - 7);
const nakamura = liveDay("nakamura", day, baselines);

test("the demo starts with no red limit for Nakamura: the event hasn't happened yet", () => {
  assert.deepEqual(stored.symptoms, []);
  assert.equal(checkReading(stored, history).some((b) => b.redLimit), false);
  assert.equal(pendingRecordFields(liveSnapshot(nakamura, 8 * 60).events, stored), null);
});

test("after the live event, the record gets the red-limit reading and the chest-pain report", () => {
  const fields = pendingRecordFields(liveSnapshot(nakamura, 15 * 60).events, stored);
  assert.ok(fields.bpSystolic > 180 || fields.bpDiastolic > 120, JSON.stringify(fields));
  assert.deepEqual(fields.symptoms, ["chest-pain"]);
  const updated = { ...stored, ...fields };
  assert.ok(checkReading(updated, history).some((b) => b.redLimit && b.emergencyId), "red limit with its emergency guide");
  // Saving it once is enough: nothing more is pending afterwards.
  assert.equal(pendingRecordFields(liveSnapshot(nakamura, 15 * 60).events, updated), null);
});

test("symptoms are added, never removed", () => {
  const fields = pendingRecordFields([{ record: { symptoms: ["chest-pain"] } }], { symptoms: ["headache"] });
  assert.deepEqual(fields.symptoms.sort(), ["chest-pain", "headache"]);
});
