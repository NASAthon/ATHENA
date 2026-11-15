// "Load demo mission" and "Reset data". Plain logic: works with
// the shared database from @/lib/db, so the buttons only need to call these.

import { simulateCrew, DEMO_SEED, NAKAMURA_EVENT_DAY } from "./simulator.js";
import { EXAM_META_PREFIX } from "../checkIn.js";
import { EXAM_SCHEDULE } from "../engine/calendar.js";

/**
 * Simulated exam history for the demo: every periodic exam was done on its due day, up to the
 * day before `today`, so the calendar shows a realistic record (nothing falsely "overdue"). An
 * exam due on `today` itself is left to do. Same format as saveExamResult (src/lib/checkIn.js).
 *
 * @param {number} today
 * @returns {Array<{ examId: string, missionDay: number, note: string }>}
 */
export function demoExamResults(today) {
  const results = [];
  for (const exam of EXAM_SCHEDULE) {
    for (let day = exam.firstDay; day < today; day += exam.everyDays) {
      results.push({ examId: exam.id, missionDay: day, note: "Simulated demo record" });
    }
  }
  return results;
}

/**
 * The demo opens at 08:00 on Nakamura's event day, and the live feed plays his event at about 14:50
 * (docs/DECISIONS.md › Always-On Live Monitoring). So his stored record for that day starts as an
 * ordinary morning: blood pressure and heart rate from the day before and no symptoms. The live
 * feed writes the red-limit readings and the chest-pain report into the record when they happen,
 * so every screen turns critical at the same moment as the Live Monitor.
 *
 * @param {Object<string, Object[]>} crew simulateCrew() output
 * @param {number} today The demo day.
 */
export function holdBackLiveEvent(crew, today) {
  if (today !== NAKAMURA_EVENT_DAY || !crew.nakamura) return crew;
  const records = crew.nakamura;
  const before = records.find((r) => r.missionDay === today - 1);
  return {
    ...crew,
    nakamura: records.map((r) =>
      r.missionDay === today && before
        ? { ...r, bpSystolic: before.bpSystolic, bpDiastolic: before.bpDiastolic, heartRate: before.heartRate, symptoms: [] }
        : r,
    ),
  };
}

/** Mission day the demo opens on: the day of Nakamura's event, with Rivera's drift alert active. */
export const DEMO_TODAY = 129;

/**
 * Replaces all stored data with the simulated demo mission up to `today`, then calculates
 * and stores each astronaut's fixed baselines once (DECISIONS › Baselines).
 *
 * @param {import("../db/database.js").AthenaDatabase} db From `await getDatabase()`.
 * @param {{ today?: number, seed?: number }} [options]
 * @returns {Promise<{ today: number, crew: string[] }>}
 */
export async function loadDemoMission(db, { today = DEMO_TODAY, seed = DEMO_SEED } = {}) {
  if (!Number.isInteger(today) || today < 1 || today > 180) throw new RangeError("loadDemoMission: today must be a mission day from 1 to 180.");
  const crew = holdBackLiveEvent(simulateCrew({ seed, toDay: today }), today);
  await db.resetAll();
  await db.deleteMetaPrefix(EXAM_META_PREFIX); // exam results from an earlier mission
  for (const [astronautId, records] of Object.entries(crew)) {
    await db.saveDailyRecords(astronautId, records);
    await db.ensureMissionBaselines(astronautId, today);
    await db.setMeta(`${EXAM_META_PREFIX}${astronautId}`, JSON.stringify(demoExamResults(today)));
  }
  await db.setMeta("today", String(today));
  await db.setMeta("demo_seed", String(seed));
  await db.setMeta("live_clock", ""); // the live feed restarts at 08:00 on the demo day
  return { today, crew: Object.keys(crew) };
}

/**
 * Removes every record and baseline.
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 */
export async function resetData(db) {
  await db.resetAll();
  await db.setMeta("today", "");
  await db.deleteMetaPrefix(EXAM_META_PREFIX); // stored exam results (src/lib/checkIn.js)
}

/** Meta key set once the app has been opened before (so "Reset data" stays empty). */
const INITIALISED_KEY = "initialised";

/**
 * docs/DECISIONS.md › Database: "Seed 3 simulated astronauts on first run". Loads the demo
 * mission the very first time the app opens, and never again by itself: after "Reset data"
 * the app stays empty until "Load demo mission" is pressed.
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 * @returns {Promise<boolean>} True if the demo mission was loaded now.
 */
export async function seedOnFirstRun(db) {
  if (db.getMeta(INITIALISED_KEY)) return false;
  await loadDemoMission(db);
  await db.setMeta(INITIALISED_KEY, "yes");
  return true;
}

/**
 * What is stored, for the mission-data panel and the header: today's mission day and,
 * per astronaut, how many daily records and which fixed baselines exist.
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 * @param {ReadonlyArray<string>} crewIds
 * @returns {{ today: number | null, crew: Array<{ id: string, records: number, latestDay: number | null, preflight: boolean, inflight: boolean }> }}
 */
export function missionSummary(db, crewIds) {
  const raw = db.getMeta("today");
  const today = raw && Number.isInteger(Number(raw)) ? Number(raw) : null;
  return {
    today,
    crew: crewIds.map((id) => ({
      id,
      records: db.loadDailyRecords(id).length,
      latestDay: db.latestDay(id),
      preflight: db.hasBaseline(id, "preflight"),
      inflight: db.hasBaseline(id, "inflight"),
    })),
  };
}
