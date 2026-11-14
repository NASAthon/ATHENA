// Daily record: the one shape every part of ATHENA reads and writes
// (docs/CHECKLIST.md › 1. Data and storage, "Daily record defined").
//
// One record = one astronaut's daily check on one mission day.
// Field names come from the logic engine (src/lib/engine/indicators.js › RECORD_FIELDS),
// so the engine, the simulator, storage and the screens can never disagree.
// Units are the ones in src/data/indicators.js.
//
// Pure logic: no React, DOM, database or network. Runs in the browser and in `node --test`.

import { CREW } from "./crew.js";
import { INDICATORS, SYMPTOMS } from "../data/index.js";
import { DAY_KEY, RECORD_FIELDS, SYMPTOMS_FIELD } from "./engine/indicators.js";

/**
 * Example of a complete record (Commander Rivera, mission day 96):
 *
 * {
 *   astronautId: "rivera",
 *   missionDay: 96,            // negative = before launch, 0 = launch day (no check), 1 = first day in flight
 *   date: "2026-10-05",        // calendar date (ISO), worked out from the mission day
 *   heartRate: 64,             // bpm, resting
 *   bpSystolic: 112,           // mmHg, top number
 *   bpDiastolic: 70,           // mmHg, bottom number
 *   glucose: 92,               // mg/dL
 *   temperature: 36.9,         // °C
 *   sleepHours: 6.5,           // hours, last night
 *   mood: 4,                   // 1 (very low) to 5 (very good)
 *   reactionMedianMs: 281,     // ms, from the reaction test
 *   reactionLapses: 1,         // responses of 500 ms or slower
 *   reactionFalseStarts: 0,    // taps before the signal
 *   exerciseMinutes: 110,      // minutes
 *   spo2: 98,                  // %, optional
 *   radiationMsv: 57.8,        // mSv cumulative dose, optional, display only
 *   symptoms: ["headache"],    // ids from src/data/symptoms.js
 * }
 *
 * Any reading may be missing: the astronaut can skip a measurement.
 * One record per astronaut per mission day: saving again on the same day replaces it.
 */

/** Demo launch date: mission day 1 is the day after this (ASSUMPTION, simulated mission). */
export const LAUNCH_DATE = "2026-07-01";

/** Every numeric reading field, in display order, taken from the engine. */
export const READING_FIELDS = Object.freeze(
  Object.values(RECORD_FIELDS).flatMap((fields) => Object.values(fields)),
);

/**
 * Limits for readings that src/data does not define (no `input`, `inputs` or `scale` there).
 * DESIGN CHOICE, only to catch typing mistakes. Move them into src/data/indicators.js
 * if the content owner adds input limits for these indicators.
 */
const FALLBACK_LIMITS = Object.freeze({
  reactionMedianMs: { min: 100, max: 2000 },
  reactionLapses: { min: 0, max: 100, integer: true },
  reactionFalseStarts: { min: 0, max: 100, integer: true },
  radiationMsv: { min: 0, max: 10000 },
});

/**
 * Input checks to catch typing mistakes (e.g. 640 instead of 64), per record field.
 * Taken from the input limits in src/data/indicators.js (`input`, `inputs` per part, or the
 * mood `scale`), so they match the daily-check form. These are NOT health thresholds:
 * whether a value is healthy is decided by the bands in src/data and the engine.
 * `integer: true` means whole numbers only.
 */
export const INPUT_LIMITS = Object.freeze(buildInputLimits());

function buildInputLimits() {
  const limits = { ...FALLBACK_LIMITS };
  for (const [indicatorId, fields] of Object.entries(RECORD_FIELDS)) {
    const content = INDICATORS.find((i) => i.id === indicatorId);
    if (!content) continue;
    for (const [part, field] of Object.entries(fields)) {
      const input = content.inputs?.find((x) => x.id === part) ?? (part === "value" ? content.input : null);
      if (input) {
        limits[field] = { min: input.min, max: input.max };
      } else if (content.scale && part === "value") {
        const values = content.scale.map((x) => x.value);
        limits[field] = { min: Math.min(...values), max: Math.max(...values), integer: true };
      }
    }
  }
  return limits;
}

const CREW_IDS = new Set(CREW.map((c) => c.id));
const SYMPTOM_IDS = new Set(SYMPTOMS.map((s) => s.id));

/**
 * Calendar date (YYYY-MM-DD) for a mission day.
 * Day -1 is the day before launch, day 0 is launch day, day 1 is the day after.
 *
 * @param {number} missionDay
 * @param {string} [launchDate=LAUNCH_DATE]
 * @returns {string}
 */
export function dateForMissionDay(missionDay, launchDate = LAUNCH_DATE) {
  const d = new Date(`${launchDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + missionDay);
  return d.toISOString().slice(0, 10);
}

/**
 * A new record with no readings yet.
 *
 * @param {string} astronautId
 * @param {number} missionDay
 * @returns {Object}
 */
export function emptyRecord(astronautId, missionDay) {
  return {
    astronautId,
    [DAY_KEY]: missionDay,
    date: dateForMissionDay(missionDay),
    [SYMPTOMS_FIELD]: [],
  };
}

/**
 * Checks a record before it is saved. Missing readings are allowed; wrong ones are not.
 *
 * @param {Object} record
 * @returns {{ ok: boolean, errors: string[] }} errors are plain-English, one per problem.
 */
export function validateRecord(record) {
  const errors = [];

  if (!record || typeof record !== "object") {
    return { ok: false, errors: ["The record is empty."] };
  }
  if (!CREW_IDS.has(record.astronautId)) {
    errors.push(`Unknown astronaut "${record.astronautId}".`);
  }
  const day = record[DAY_KEY];
  if (!Number.isInteger(day)) {
    errors.push("Mission day must be a whole number.");
  } else if (day === 0) {
    errors.push("Mission day 0 is launch day: there is no daily check.");
  }

  for (const field of READING_FIELDS) {
    const value = record[field];
    if (value === undefined || value === null || value === "") continue; // skipped measurement
    const limits = INPUT_LIMITS[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a number.`);
    } else if (limits && (value < limits.min || value > limits.max)) {
      errors.push(`${field} ${value} looks like a typing mistake (expected ${limits.min} to ${limits.max}).`);
    } else if (limits?.integer && !Number.isInteger(value)) {
      errors.push(`${field} must be a whole number.`);
    }
  }

  const symptoms = record[SYMPTOMS_FIELD];
  if (symptoms !== undefined) {
    if (!Array.isArray(symptoms)) {
      errors.push("Symptoms must be a list.");
    } else {
      for (const id of symptoms) {
        if (!SYMPTOM_IDS.has(id)) errors.push(`Unknown symptom "${id}".`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}