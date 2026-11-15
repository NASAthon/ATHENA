// Demo loading against the REAL database (sql.js 1.16.0 with memory persistence).
import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { openDatabase } from "../db/database.js";
import { memoryPersistence } from "../db/persistence.js";
import { evaluateMission } from "../engine/evaluate.js";
import { examsDueOn, examsOverdue } from "../engine/calendar.js";
import { loadExamResults } from "../checkIn.js";
import { DEMO_TODAY, loadDemoMission, missionSummary, resetData, seedOnFirstRun } from "./demo.js";
import { createCommunicationMessage } from "../communications.js";

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
  // Nakamura's day starts as an ordinary morning: the live feed adds his red limit when it happens
  // (src/lib/live/recordSync.test.js). Rivera's drift alert is already in the stored history.
  const nakamura = evaluateMission(reopened.loadDailyRecords("nakamura"), reopened.loadMissionBaselines("nakamura"), DEMO_TODAY, DEMO_TODAY)[0];
  assert.equal(nakamura.limitBreaches.some((b) => b.redLimit), false);
  const rivera = evaluateMission(reopened.loadDailyRecords("rivera"), reopened.loadMissionBaselines("rivera"), 36, DEMO_TODAY).at(-1);
  assert.ok(["alert", "escalated"].includes(rivera.alert.level));
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

test("the demo mission comes with a realistic exam history: nothing overdue on the demo day", async () => {
  const db = await openDatabase({ SQL, persistence: memoryPersistence() });
  await loadDemoMission(db);
  for (const id of CREW_IDS) {
    const done = loadExamResults(db, id).map((r) => ({ examId: r.examId, day: r.missionDay }));
    assert.ok(done.length > 0, id);
    assert.deepEqual([...examsOverdue(done, DEMO_TODAY)], [], id);
    // Exams due on the demo day itself are still to do.
    for (const examId of examsDueOn(DEMO_TODAY)) assert.ok(!done.some((d) => d.examId === examId && d.day === DEMO_TODAY), examId);
  }
  await resetData(db);
  assert.deepEqual(loadExamResults(db, "rivera"), []);
});

test("Reset and Load demo mission both clear simulated communication history", async () => {
  const db = await openDatabase({ SQL, persistence: memoryPersistence() });
  const message = (id) => createCommunicationMessage({
    id,
    astronautId: "rivera",
    missionModeId: "mars",
    missionDay: DEMO_TODAY,
    report: { alertLevel: "none", limitBreaches: [], lines: ["demo"] },
    sentAt: "2026-11-14T12:00:00.000Z",
    sentSimMs: 1000,
  });
  await loadDemoMission(db);
  await db.saveCommunication(message("before-reset"));
  await resetData(db);
  assert.deepEqual(db.loadCommunications("rivera"), []);
  await db.saveCommunication(message("before-reload"));
  await loadDemoMission(db);
  assert.deepEqual(db.loadCommunications("rivera"), []);
});
