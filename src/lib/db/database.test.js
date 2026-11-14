// Storage tests against the real sql.js engine, with memory persistence instead of IndexedDB.
import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { calculateMissionBaselines } from "../engine/baseline.js";
import { evaluateMission } from "../engine/evaluate.js";
import { DRIFT_INDICATOR_KEYS } from "../engine/indicators.js";
import { makeMission } from "../engine/testData.js";
import { openDatabase, SCHEMA_VERSION } from "./database.js";
import { indexedDbPersistence, memoryPersistence } from "./persistence.js";

const SQL = await initSqlJs();
const open = (persistence = memoryPersistence()) =>
  openDatabase({ SQL, persistence, now: () => "2026-11-14T12:00:00.000Z" });

test("a new database has its tables and schema version, and is saved straight away", async () => {
  const persistence = memoryPersistence();
  const db = await open(persistence);
  assert.equal(db.getMeta("schema_version"), String(SCHEMA_VERSION));
  assert.ok(persistence.saves >= 1);
  assert.ok(persistence.bytes.length > 0);
});

test("every write is saved, and data survives reopening (closing the app)", async () => {
  const persistence = memoryPersistence();
  const db = await open(persistence);
  const before = persistence.saves;
  await db.saveDailyRecord("rivera", { missionDay: 1, sleepHours: 7.2, symptoms: [] });
  assert.equal(persistence.saves, before + 1);
  await db.saveDailyRecord("rivera", { missionDay: 2, sleepHours: 6.9 });
  assert.equal(persistence.saves, before + 2);

  const reopened = await open(persistence);
  assert.deepEqual(reopened.loadDailyRecords("rivera"), [
    { missionDay: 1, sleepHours: 7.2, symptoms: [] },
    { missionDay: 2, sleepHours: 6.9 },
  ]);
});

test("records: one per astronaut per day, ranges, and other crew kept apart", async () => {
  const db = await open();
  await db.saveDailyRecords("singh", [{ missionDay: 3, mood: 4 }, { missionDay: 1, mood: 3 }, { missionDay: 2, mood: 5 }]);
  await db.saveDailyRecord("singh", { missionDay: 2, mood: 2 }); // replaces day 2
  await db.saveDailyRecord("rivera", { missionDay: 2, mood: 1 });
  assert.deepEqual(db.loadDailyRecords("singh").map((r) => r.mood), [3, 2, 4]);
  assert.deepEqual(db.loadDailyRecords("singh", { fromDay: 2, toDay: 3 }).map((r) => r.missionDay), [2, 3]);
  assert.equal(db.latestDay("singh"), 3);
  assert.equal(db.latestDay("nakamura"), null);
});

test("an invalid batch writes nothing", async () => {
  const persistence = memoryPersistence();
  const db = await open(persistence);
  const before = persistence.saves;
  await assert.rejects(db.saveDailyRecords("rivera", [{ missionDay: 1 }, { sleepHours: 7 }]), TypeError);
  assert.deepEqual(db.loadDailyRecords("rivera"), []);
  assert.equal(persistence.saves, before);
});

test("baselines are fixed: stored once, kept unless explicitly replaced", async () => {
  const db = await open();
  const first = calculateMissionBaselines(makeMission({ seed: 1, toDay: 40 }), DRIFT_INDICATOR_KEYS);
  const other = calculateMissionBaselines(makeMission({ seed: 2, toDay: 40 }), DRIFT_INDICATOR_KEYS);
  assert.equal(await db.saveBaseline("rivera", "inflight", first.inflight), true);
  assert.equal(await db.saveBaseline("rivera", "inflight", other.inflight), false);
  assert.equal(db.loadMissionBaselines("rivera").inflight.indicators.sleepHours.mean, first.inflight.indicators.sleepHours.mean);
  assert.equal(await db.saveBaseline("rivera", "inflight", other.inflight, { replace: true }), true);
  assert.equal(db.loadMissionBaselines("rivera").inflight.indicators.sleepHours.mean, other.inflight.indicators.sleepHours.mean);
});

test("stored baselines load in the engine's shape and give identical evaluations", async () => {
  const db = await open();
  const records = makeMission({ seed: 3, toDay: 120 });
  const calculated = calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
  await db.saveBaseline("rivera", "preflight", calculated.preflight);
  await db.saveBaseline("rivera", "inflight", calculated.inflight);
  const loaded = db.loadMissionBaselines("rivera");
  for (const kind of ["preflight", "inflight"]) {
    assert.deepEqual(loaded[kind].window, { ...calculated[kind].window });
    for (const key of DRIFT_INDICATOR_KEYS) assert.deepEqual(loaded[kind].indicators[key], { ...calculated[kind].indicators[key] });
  }
  assert.deepEqual(evaluateMission(records, loaded, 60, 120), evaluateMission(records, calculated, 60, 120));
});

test("ensureMissionBaselines: each baseline is calculated once its window has ended, then never changes", async () => {
  const db = await open();
  const records = makeMission({ seed: 4, toDay: 60 });
  await db.saveDailyRecords("rivera", records.filter((r) => r.missionDay <= 0 || r.missionDay <= 20));

  let stored = await db.ensureMissionBaselines("rivera", -1); // pre-flight window still open
  assert.deepEqual(stored, {});
  stored = await db.ensureMissionBaselines("rivera", 1);
  assert.ok(stored.preflight);
  assert.equal(stored.inflight, undefined); // in-flight window (21–35) not complete

  await db.saveDailyRecords("rivera", records.filter((r) => r.missionDay > 20));
  stored = await db.ensureMissionBaselines("rivera", 36);
  assert.ok(stored.inflight);
  const sleepMean = stored.inflight.indicators.sleepHours.mean;

  // Later edits to baseline days don't change a stored (fixed) baseline.
  await db.saveDailyRecord("rivera", { missionDay: 25, sleepHours: 2 });
  stored = await db.ensureMissionBaselines("rivera", 60);
  assert.equal(stored.inflight.indicators.sleepHours.mean, sleepMean);
});

test("ensureMissionBaselines stores nothing when there is no usable data yet", async () => {
  const db = await open();
  await db.saveDailyRecord("nakamura", { missionDay: 30, sleepHours: 7 }); // 1 reading only
  assert.deepEqual(await db.ensureMissionBaselines("nakamura", 50), {});
  assert.equal(db.hasBaseline("nakamura", "inflight"), false);
});

test("reset removes all records and baselines", async () => {
  const db = await open();
  const records = makeMission({ seed: 5, toDay: 40 });
  await db.saveDailyRecords("rivera", records);
  await db.ensureMissionBaselines("rivera", 40);
  await db.resetAll();
  assert.deepEqual(db.loadDailyRecords("rivera"), []);
  assert.deepEqual(db.loadMissionBaselines("rivera"), {});
});

test("a damaged saved copy doesn't lock the crew out", async () => {
  const persistence = memoryPersistence();
  persistence.bytes = new Uint8Array([1, 2, 3, 4, 5]);
  const db = await open(persistence);
  await db.saveDailyRecord("rivera", { missionDay: 1, mood: 4 });
  assert.equal(db.loadDailyRecords("rivera").length, 1);
});

test("wrong arguments throw clear errors", async () => {
  await assert.rejects(openDatabase({ SQL: null, persistence: memoryPersistence() }), TypeError);
  await assert.rejects(openDatabase({ SQL, persistence: {} }), TypeError);
  const db = await open();
  await assert.rejects(db.saveDailyRecord("", { missionDay: 1 }), TypeError);
  await assert.rejects(db.saveBaseline("rivera", "rolling", { window: {}, indicators: {} }), RangeError);
  assert.throws(() => indexedDbPersistence({ indexedDB: undefined }), /IndexedDB/);
});
