// "Load demo mission" and "Reset data" (docs/CHECKLIST.md › 1). Plain logic: works with
// the shared database from @/lib/db, so the buttons only need to call these.

import { simulateCrew, DEMO_SEED } from "./simulator.js";

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
  const crew = simulateCrew({ seed, toDay: today });
  await db.resetAll();
  for (const [astronautId, records] of Object.entries(crew)) {
    await db.saveDailyRecords(astronautId, records);
    await db.ensureMissionBaselines(astronautId, today);
  }
  await db.setMeta("today", String(today));
  await db.setMeta("demo_seed", String(seed));
  return { today, crew: Object.keys(crew) };
}

/**
 * Removes every record and baseline (CHECKLIST §1 "Reset data").
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 */
export async function resetData(db) {
  await db.resetAll();
  await db.setMeta("today", "");
}
