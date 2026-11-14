import { test } from "node:test";
import assert from "node:assert/strict";
import { dueMeasurements, MEASUREMENT_SCHEDULE } from "./reminders.js";

test("schedule comes from src/data: non-optional indicators plus symptoms", () => {
  assert.deepEqual(MEASUREMENT_SCHEDULE.map((m) => m.id), [
    "heartRate", "bloodPressure", "glucose", "temperature", "sleep", "mood", "reaction", "exercise", "symptoms",
  ]);
});

test("everything is due with no record yet", () => {
  assert.equal(dueMeasurements(undefined, 5).length, MEASUREMENT_SCHEDULE.length);
});

test("recorded measurements drop off; blood pressure needs both numbers", () => {
  const due = dueMeasurements({ heartRate: 64, bpSystolic: 118, glucose: Number.NaN, symptoms: [], reactionMedianMs: 300 }, 5);
  assert.ok(!due.includes("heartRate"));
  assert.ok(due.includes("bloodPressure"));
  assert.ok(due.includes("glucose")); // NaN isn't a reading
  assert.ok(!due.includes("symptoms")); // empty list = "no symptoms today"
  assert.ok(!due.includes("reaction"));
});

test("nothing is due before day 1; custom intervals work", () => {
  assert.deepEqual([...dueMeasurements(null, 0)], []);
  const schedule = [{ id: "weekly", fields: ["x"], everyDays: 7 }];
  assert.deepEqual([...dueMeasurements({}, 8, schedule)], ["weekly"]);
  assert.deepEqual([...dueMeasurements({}, 9, schedule)], []);
});
