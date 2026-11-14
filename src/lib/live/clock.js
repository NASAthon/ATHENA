// The always-on mission clock for live monitoring (docs/DECISIONS.md › Always-On Live Monitoring).
// It runs in real time by default; the presenter's demo controls on the Crew page can speed it up,
// pause it or jump to the next scripted moment. Pure logic plus one database helper (rollOverDay).

import { DAY_MINUTES, SCRIPT, SCRIPTED_DAY } from "./stream.js";
import { DEMO_SEED, MISSION_DAYS, simulateAstronaut } from "../sim/simulator.js";

/** Meta key the clock is saved under, so a reload carries on where it left off. */
export const LIVE_CLOCK_KEY = "live_clock";

/** Speeds the presenter can pick: simulated minutes per real minute. */
export const SPEEDS = Object.freeze([1, 10, 60]);

/** Where a fresh clock starts on the current mission day: 08:00 (simulated). */
export const START_MINUTE = 8 * 60;

/**
 * A clock: { day, minute (may be fractional), speed, paused }.
 *
 * @param {string | null} saved The stored JSON, if any.
 * @param {number} today Today's mission day from the stored mission.
 */
export function restoreClock(saved, today) {
  try {
    const c = JSON.parse(saved ?? "");
    if (c && c.day === today && Number.isFinite(c.minute) && c.minute >= 0 && c.minute < DAY_MINUTES && SPEEDS.includes(c.speed)) {
      return { day: c.day, minute: c.minute, speed: c.speed, paused: Boolean(c.paused) };
    }
  } catch {
    // fall through to a fresh clock
  }
  return { day: today, minute: START_MINUTE, speed: 1, paused: false };
}

export const serialiseClock = (c) => JSON.stringify({ day: c.day, minute: c.minute, speed: c.speed, paused: c.paused });

/**
 * Moves the clock on by `realMs` of real time. Crossing midnight moves to the next mission day
 * (`rolledOver: true`); the last mission day stops at 23:59 and pauses.
 */
export function advanceClock(clock, realMs) {
  if (clock.paused) return { clock, rolledOver: false };
  let minute = clock.minute + (realMs / 60000) * clock.speed;
  let day = clock.day;
  let paused = false;
  let rolledOver = false;
  if (minute >= DAY_MINUTES) {
    if (day >= MISSION_DAYS.toDay) {
      minute = DAY_MINUTES - 1;
      paused = true;
    } else {
      minute -= DAY_MINUTES;
      day += 1;
      rolledOver = true;
    }
  }
  return { clock: { ...clock, day, minute, paused }, rolledOver };
}

/** The next scripted moment after the clock's minute today, or null. */
export function nextScripted(clock) {
  if (clock.day !== SCRIPTED_DAY) return null;
  return SCRIPT.find((e) => e.at > Math.floor(clock.minute)) ?? null;
}

/**
 * Midnight roll-up: saves the next day's daily record for each astronaut (the simulated summary of
 * that day's sensor feed, from the same seeded simulator) and moves "today" on, so Today, Trends,
 * Body, Calendar and Summary all move to the new day.
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 * @param {ReadonlyArray<string>} crewIds
 * @param {number} newDay
 */
export async function rollOverDay(db, crewIds, newDay, { seed = DEMO_SEED } = {}) {
  for (const id of crewIds) {
    const exists = db.loadDailyRecords(id, { fromDay: newDay, toDay: newDay }).length > 0;
    if (exists) continue;
    const record = simulateAstronaut(id, { seed, fromDay: newDay, toDay: newDay })[0];
    if (record) await db.saveDailyRecord(id, { ...record, astronautId: id });
  }
  await db.setMeta("today", String(newDay));
}
