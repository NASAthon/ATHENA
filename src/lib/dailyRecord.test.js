import { test } from "node:test";
import assert from "node:assert/strict";
import {
  READING_FIELDS,
  INPUT_LIMITS,
  dateForMissionDay,
  emptyRecord,
  validateRecord,
} from "./dailyRecord.js";
import { DRIFT_INDICATOR_KEYS } from "./engine/indicators.js";

const good = {
  astronautId: "rivera",
  missionDay: 96,
  heartRate: 64,
  bpSystolic: 112,
  bpDiastolic: 70,
  glucose: 92,
  temperature: 36.9,
  sleepHours: 6.5,
  mood: 4,
  reactionMedianMs: 281,
  reactionLapses: 1,
  reactionFalseStarts: 0,
  exerciseMinutes: 110,
  spo2: 98,
  radiationMsv: 57.8,
  symptoms: ["headache"],
};

test("every engine field is a record field, and every field has input limits", () => {
  for (const key of DRIFT_INDICATOR_KEYS) assert.ok(READING_FIELDS.includes(key), key);
  for (const field of READING_FIELDS) assert.ok(INPUT_LIMITS[field], field);
});

test("dates: day -1 is the day before launch, day 1 the day after", () => {
  assert.equal(dateForMissionDay(0, "2026-07-01"), "2026-07-01");
  assert.equal(dateForMissionDay(-1, "2026-07-01"), "2026-06-30");
  assert.equal(dateForMissionDay(1, "2026-07-01"), "2026-07-02");
  assert.equal(dateForMissionDay(184, "2026-07-01"), "2027-01-01");
});

test("a complete record is valid", () => {
  assert.deepEqual(validateRecord(good), { ok: true, errors: [] });
});

test("skipped measurements are allowed", () => {
  assert.equal(validateRecord(emptyRecord("singh", 12)).ok, true);
  assert.equal(validateRecord({ ...good, glucose: null, spo2: undefined }).ok, true);
});

test("bad records are caught with plain-English errors", () => {
  assert.equal(validateRecord({ ...good, astronautId: "bob" }).ok, false);
  assert.equal(validateRecord({ ...good, missionDay: 0 }).ok, false);
  assert.equal(validateRecord({ ...good, missionDay: 2.5 }).ok, false);
  assert.equal(validateRecord({ ...good, heartRate: 640 }).ok, false);
  assert.equal(validateRecord({ ...good, heartRate: "64" }).ok, false);
  assert.equal(validateRecord({ ...good, mood: 3.5 }).ok, false);
  assert.equal(validateRecord({ ...good, symptoms: ["sneezing-fit"] }).ok, false);
  assert.equal(validateRecord(null).ok, false);
  assert.match(validateRecord({ ...good, heartRate: 640 }).errors[0], /typing mistake/);
});

test("emptyRecord fills id, day, date and an empty symptom list", () => {
  const r = emptyRecord("nakamura", -3);
  assert.equal(r.astronautId, "nakamura");
  assert.equal(r.missionDay, -3);
  assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(r.symptoms, []);
});