// Checks the engine against the real bands in src/data/indicators.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReading, classifyIndicator, hasRedLimit } from "./redLimits.js";

const level = (reading, id, history) => classifyIndicator(id, reading, history)?.level;

test("normal readings report nothing", () => {
  const reading = { bpSystolic: 115, bpDiastolic: 75, glucose: 90, temperature: 36.8, sleepHours: 7.5, mood: 4, exerciseMinutes: 95 };
  assert.deepEqual([...checkReading(reading)], []);
});

test("blood pressure bands (CDC table)", () => {
  assert.equal(level({ bpSystolic: 125, bpDiastolic: 75 }, "bloodPressure"), "watch"); // elevated
  assert.equal(level({ bpSystolic: 118, bpDiastolic: 85 }, "bloodPressure"), "watch"); // stage 1
  assert.equal(level({ bpSystolic: 142, bpDiastolic: 70 }, "bloodPressure"), "act"); // stage 2
  assert.equal(level({ bpSystolic: 181, bpDiastolic: 80 }, "bloodPressure"), "urgent"); // severe
  assert.equal(level({ bpSystolic: 180, bpDiastolic: 120 }, "bloodPressure"), "act"); // "above 180", so 180 itself isn't severe
});

test("severe blood pressure with a listed symptom picks the Emergency band and its guide", () => {
  const without = classifyIndicator("bloodPressure", { bpSystolic: 190, bpDiastolic: 100 });
  const withPain = classifyIndicator("bloodPressure", { bpSystolic: 190, bpDiastolic: 100, symptoms: ["chest-pain"] });
  assert.equal(without.label, "Severe");
  assert.equal(without.emergencyId, null);
  assert.equal(withPain.label, "Emergency");
  assert.equal(withPain.emergencyId, "severe-high-bp");
});

test("glucose bands (ADA)", () => {
  assert.equal(level({ glucose: 65 }, "glucose"), "urgent");
  assert.equal(classifyIndicator("glucose", { glucose: 65 }).emergencyId, "low-blood-sugar");
  assert.equal(level({ glucose: 85 }, "glucose"), "normal");
  assert.equal(level({ glucose: 110 }, "glucose"), "watch");
  assert.equal(level({ glucose: 130 }, "glucose"), "act");
  assert.equal(level({ glucose: 250 }, "glucose"), "urgent"); // very high beats "high"
});

test("temperature bands (CDC)", () => {
  assert.equal(level({ temperature: 34.9 }, "temperature"), "urgent");
  assert.equal(level({ temperature: 37.9 }, "temperature"), "normal");
  assert.equal(level({ temperature: 38 }, "temperature"), "act");
});

test("heart rate and SpO₂ have no fixed limits, by design", () => {
  assert.equal(classifyIndicator("heartRate", { heartRate: 180 }), null);
  assert.equal(classifyIndicator("spo2", { spo2: 80 }), null);
});

test("streak bands need consecutive days; a missing day breaks the streak", () => {
  const day = (missionDay, sleepHours, mood) => ({ missionDay, sleepHours, mood });
  const history = [day(8, 6, 2), day(9, 6.5, 1)];
  assert.equal(level(day(10, 6, 2), "sleep", history), "act");
  assert.equal(level(day(10, 6, 2), "mood", history), "act");
  assert.equal(level(day(10, 6, 2), "sleep", [day(9, 6, 2)]), "watch"); // only 2 nights
  assert.equal(level(day(10, 6, 2), "sleep", [day(8, 6, 2)]), "watch"); // day 9 missing
  assert.equal(level(day(10, 6, 2), "sleep", [day(8, 6, 2), day(9, 7.5, 4)]), "watch"); // day 9 fine
});

test("results: most serious first, each with a label and a source", () => {
  const results = checkReading({ sleepHours: 5, temperature: 34, bpSystolic: 145, bpDiastolic: 80 });
  assert.deepEqual(results.map((r) => r.level), ["urgent", "act", "watch"]);
  assert.equal(results[0].redLimit, true);
  for (const r of results) {
    assert.match(r.basisLabel, /general clinical reference range|ATHENA design choice/);
    assert.match(r.source.url, /^https:\/\//);
  }
  assert.equal(hasRedLimit({ temperature: 34 }), true);
  assert.equal(hasRedLimit({ temperature: 38.5 }), false);
});

test("works on the first reading ever and ignores missing or invalid values", () => {
  assert.deepEqual([...checkReading(null)], []);
  assert.deepEqual([...checkReading({ glucose: "40", temperature: Number.NaN })], []);
});
