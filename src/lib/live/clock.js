// The always-on mission clock for live monitoring (docs/DECISIONS.md › Always-On Live Monitoring).
// It runs in real time by default; the presenter's demo controls on the Crew page can speed it up,
// pause it or jump to the next scripted moment. Pure logic plus one database helper (rollOverDay).

import { DAY_MINUTES, SCRIPT, SCRIPTED_DAY, liveDay, liveSnapshot } from "./stream.js";
import { liveTodayRecord } from "./recordSync.js";
import { DEMO_SEED, MISSION_DAYS, simulateAstronaut } from "../sim/simulator.js";

/** Meta key the clock is saved under, so a reload carries on where it left off. */
export const LIVE_CLOCK_KEY = "live_clock";

/** Speeds the presenter can pick: simulated minutes per real minute. */
export const SPEEDS = Object.freeze([1, 10, 60]);

/** Where a fresh clock starts on the current mission day: 08:00 (simulated). */
export const START_MINUTE = 8 * 60;

/**
 * The scripted demo day opens at 14:40, PAUSED, so the three crew show three different stories at
 * once (Rivera deteriorating, Singh stable, Nakamura fluctuating) and nothing moves until the
 * presenter acts. One "Jump to next event" then plays Nakamura's emergency.
 */
export const DEMO_START_MINUTE = 14 * 60 + 40;

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
  if (today === SCRIPTED_DAY) return { day: today, minute: DEMO_START_MINUTE, speed: 1, paused: true };
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
 * Where "Jump to next event" goes: the next scripted moment whose start (one minute before it, so it
 * happens on screen) is still ahead. An event the clock is already parked in front of is skipped, so
 * pressing the button again always moves on.
 *
 * @returns {{ at: number } | null}
 */
export function nextJumpTarget(clock) {
  if (clock.day !== SCRIPTED_DAY) return null;
  // Lands ON the next moment, so it happens at once even while paused; pressing again moves on.
  return SCRIPT.find((e) => e.at > Math.floor(clock.minute)) ?? null;
}

/**
 * Midnight roll-up. First the day that just ended is closed: its heart rate, blood pressure and SpO₂
 * become that day's live-feed averages (values a live event wrote, like a red-limit reading, are kept),
 * so the history matches what the Live Monitor showed. Then the next day's record is saved (the
 * simulated summary of the sleep, glucose, temperature and exercise sensors, from the same seeded
 * simulator) and "today" moves on, so Today, Trends, Body, Calendar and Summary all move to the new day.
 *
 * @param {import("../db/database.js").AthenaDatabase} db
 * @param {ReadonlyArray<string>} crewIds
 * @param {number} newDay
 */
export async function rollOverDay(db, crewIds, newDay, { seed = DEMO_SEED } = {}) {
  const ended = newDay - 1;
  for (const id of crewIds) {
    const done = db.loadDailyRecords(id, { fromDay: ended, toDay: ended })[0];
    if (done) {
      const snapshot = liveSnapshot(liveDay(id, ended, db.loadMissionBaselines(id), { seed }), DAY_MINUTES - 1);
      await db.saveDailyRecord(id, liveTodayRecord(done, snapshot));
    }
    const exists = db.loadDailyRecords(id, { fromDay: newDay, toDay: newDay }).length > 0;
    if (exists) continue;
    const record = simulateAstronaut(id, { seed, fromDay: newDay, toDay: newDay })[0];
    if (record) await db.saveDailyRecord(id, { ...record, astronautId: id });
  }
  await db.setMeta("today", String(newDay));
}
