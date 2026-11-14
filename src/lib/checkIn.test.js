// Saving from the app, against the REAL database (sql.js with memory persistence).
import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { openDatabase } from "./db/database.js";
import { memoryPersistence } from "./db/persistence.js";
import { loadDemoMission, resetData } from "./sim/demo.js";
import { EXAM_META_PREFIX, checkInStreak, loadExamResults, saveCheckIn, saveExamResult } from "./checkIn.js";

const SQL = await initSqlJs();
const freshDb = () => openDatabase({ SQL, persistence: memoryPersistence() });

test("saveCheckIn stores today's readings and keeps fields saved earlier the same day", async () => {
  const db = await freshDb();
  const first = await saveCheckIn(db, "rivera", 10, { reactionMedianMs: 281, reactionLapses: 1, reactionFalseStarts: 0 });
  assert.equal(first.ok, true);
  const second = await saveCheckIn(db, "rivera", 10, { heartRate: 64, bpSystolic: 112, bpDiastolic: 70, symptoms: ["headache"] });
  assert.equal(second.ok, true);
  const stored = db.loadDailyRecords("rivera", { fromDay: 10, toDay: 10 })[0];
  assert.equal(stored.reactionMedianMs, 281); // kept from the reaction test
  assert.equal(stored.heartRate, 64);
  assert.deepEqual(stored.symptoms, ["headache"]);
  assert.equal(stored.date, "2026-07-11");
});

test("saveCheckIn refuses a typing mistake and saves nothing", async () => {
  const db = await freshDb();
  const result = await saveCheckIn(db, "singh", 5, { heartRate: 640 });
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /typing mistake/);
  assert.equal(db.loadDailyRecords("singh").length, 0);
});

test("saveCheckIn returns the previous days as history for the engine", async () => {
  const db = await freshDb();
  for (const day of [1, 2, 3]) await saveCheckIn(db, "nakamura", day, { sleepHours: 6 });
  const result = await saveCheckIn(db, "nakamura", 4, { sleepHours: 6 });
  assert.deepEqual(result.history.map((r) => r.missionDay), [1, 2, 3]);
});

test("checkInStreak counts consecutive checked days, skipping launch day", () => {
  const rec = (missionDay, extra = { mood: 4 }) => ({ missionDay, ...extra });
  assert.equal(checkInStreak([rec(5), rec(6), rec(7)], 7), 3);
  assert.equal(checkInStreak([rec(5), rec(6)], 7), 2); // today not done yet: counts up to yesterday
  assert.equal(checkInStreak([rec(4), rec(6), rec(7)], 7), 2); // day 5 missing breaks it
  assert.equal(checkInStreak([rec(-2), rec(-1), rec(1), rec(2)], 2), 4); // launch day 0 skipped
  assert.equal(checkInStreak([rec(7, { symptoms: [] })], 7), 0); // a record with no readings doesn't count
  assert.equal(checkInStreak([], 7), 0);
});

test("exam results are stored per astronaut, replaced on the same day, and cleared by Reset data", async () => {
  const db = await freshDb();
  await loadDemoMission(db);
  await db.deleteMetaPrefix(EXAM_META_PREFIX); // start from no exam history (the demo seeds some)
  await saveExamResult(db, "rivera", "eye-scan", 100);
  await saveExamResult(db, "rivera", "eye-scan", 100, "no change");
  await saveExamResult(db, "rivera", "fitness-check", 120);
  assert.deepEqual(loadExamResults(db, "rivera").map((r) => [r.examId, r.missionDay, r.note]), [
    ["fitness-check", 120, ""],
    ["eye-scan", 100, "no change"],
  ]);
  assert.deepEqual(loadExamResults(db, "singh"), []);
  await assert.rejects(saveExamResult(db, "rivera", "x-ray", 100), /unknown exam/);

  await resetData(db);
  assert.deepEqual(loadExamResults(db, "rivera"), []);
});
