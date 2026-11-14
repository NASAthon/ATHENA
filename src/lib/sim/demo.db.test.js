// Demo loading against the REAL database (sql.js 1.16.0 with memory persistence).
import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { openDatabase } from "../db/database.js";
import { memoryPersistence } from "../db/persistence.js";
import { evaluateMission } from "../engine/evaluate.js";
import { DEMO_TODAY, loadDemoMission, missionSummary, resetData, seedOnFirstRun } from "./demo.js";

const SQL = await initSqlJs();
const CREW_IDS = ["rivera", "singh", "nakamura"];

test("first run seeds the demo mission once; it survives reopening", async () => {
  const persistence = memoryPersistence();
  const db = await openDatabase({ SQL, persistence });
  assert.equal(await seedOnFirstRun(db), true);
  assert.equal(await seedOnFirstRun(db), false);

  const reopened = await openDatabase({ SQL, persistence });
  assert.equal(await seedOnFirstRun(reopened), false);
  const summary = missionSummary(reopened, CREW_IDS);
  assert.equal(summary.today, DEMO_TODAY);
  for (const c of summary.crew) {
    assert.equal(c.latestDay, DEMO_TODAY);
    assert.ok(c.records > 150 && c.preflight && c.inflight, JSON.stringify(c));
  }
  // The stored mission tells Nakamura's story after reopening (red limit on day 129).
  const nakamura = evaluateMission(reopened.loadDailyRecords("nakamura"), reopened.loadMissionBaselines("nakamura"), DEMO_TODAY, DEMO_TODAY)[0];
  assert.ok(nakamura.limitBreaches.some((b) => b.redLimit));
});

test("after Reset data the app stays empty, even on the next start, until Load demo mission", async () => {
  const persistence = memoryPersistence();
  const db = await openDatabase({ SQL, persistence });
  await seedOnFirstRun(db);
  await resetData(db);

  const reopened = await openDatabase({ SQL, persistence });
  assert.equal(await seedOnFirstRun(reopened), false);
  const empty = missionSummary(reopened, CREW_IDS);
  assert.equal(empty.today, null);
  assert.ok(empty.crew.every((c) => c.records === 0 && c.latestDay === null && !c.preflight && !c.inflight));

  await loadDemoMission(reopened);
  assert.equal(missionSummary(reopened, CREW_IDS).today, DEMO_TODAY);
});
