// "Load demo mission" / "Reset data" against a recording stand-in for the database
// (the real database, src/lib/db, has its own tests; this checks what the demo asks of it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_TODAY, loadDemoMission, resetData } from "./demo.js";

function fakeDb() {
  const calls = [];
  const db = {
    calls,
    records: {},
    meta: {},
    async resetAll() { calls.push("reset"); db.records = {}; },
    async saveDailyRecords(id, records) { calls.push(`save:${id}`); db.records[id] = [...records]; },
    async ensureMissionBaselines(id, today) { calls.push(`baselines:${id}:${today}`); return {}; },
    async setMeta(key, value) { db.meta[key] = value; },
    async deleteMetaPrefix(prefix) { for (const k of Object.keys(db.meta)) if (k.startsWith(prefix)) delete db.meta[k]; },
  };
  return db;
}

test("Load demo mission: resets first, stores all 3 crew up to today, then their baselines", async () => {
  const db = fakeDb();
  const result = await loadDemoMission(db);
  assert.equal(result.today, DEMO_TODAY);
  assert.equal(db.calls[0], "reset");
  for (const id of ["rivera", "singh", "nakamura"]) {
    assert.equal(db.records[id].at(-1).missionDay, DEMO_TODAY);
    assert.ok(db.calls.indexOf(`save:${id}`) < db.calls.indexOf(`baselines:${id}:${DEMO_TODAY}`));
  }
  assert.equal(db.meta.today, String(DEMO_TODAY));
});

test("Reset data and bad input", async () => {
  const db = fakeDb();
  await loadDemoMission(db, { today: 60 });
  await resetData(db);
  assert.deepEqual(db.records, {});
  assert.equal(db.meta.today, "");
  await assert.rejects(loadDemoMission(db, { today: 0 }), RangeError);
  await assert.rejects(loadDemoMission(db, { today: 181 }), RangeError);
});
