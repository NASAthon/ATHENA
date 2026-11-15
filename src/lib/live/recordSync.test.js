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

test("liveTodayRecord: today's vitals follow the live average, event values are kept", async () => {
  const { liveTodayRecord, liveTodayKey } = await import("./recordSync.js");
  const nakamura = liveDay("nakamura", 129, null);
  const stored = { missionDay: 129, heartRate: 60, bpSystolic: 110, bpDiastolic: 70, sleepHours: 7 };
  const morning = liveTodayRecord(stored, liveSnapshot(nakamura, 10 * 60));
  assert.equal(morning.sleepHours, 7);
  assert.notEqual(morning.heartRate, 60);
  assert.ok(Number.isInteger(morning.spo2));
  // After the red-limit event its values have been written to the record, and the overlay keeps them.
  const afterEvent = { ...stored, bpSystolic: 182, bpDiastolic: 111, heartRate: 108 };
  const later = liveTodayRecord(afterEvent, liveSnapshot(nakamura, 15 * 60));
  assert.deepEqual([later.bpSystolic, later.bpDiastolic, later.heartRate], [182, 111, 108]);
  assert.equal(liveTodayRecord(null, liveSnapshot(nakamura, 600)), null);
  assert.equal(liveTodayRecord(stored, null), stored);
  assert.notEqual(liveTodayKey(liveSnapshot(nakamura, 600)), liveTodayKey(liveSnapshot(nakamura, 900)));
});
