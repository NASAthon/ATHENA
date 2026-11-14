// Scenario Lab data injection (docs/CHECKLIST.md › 2. Logic, S item "Scenario Lab").
// Pure logic: no React, DOM, database or Node-only APIs. The Scenario Lab screen
// ("watch the alerts react") is CHECKLIST §3.
//
// ASSUMPTION: the effect sizes below are invented DEMO values to show the engine
// reacting. They are not physiological data and must never be presented as such
// in the app or the pitch.

import { DAY_KEY, readingOrNull } from "./indicators.js";

/**
 * Change per day at full intensity (intensity 1). Only fields that already hold a
 * reading are changed: a scenario never invents a measurement that wasn't taken.
 * Radiation dose isn't drift-tracked and has no sourced limit, so the radiation
 * scenario only raises the recorded dose.
 */
export const SCENARIO_EFFECTS = Object.freeze({
  radiation: Object.freeze({ radiationMsv: 1 }),
  fatigue: Object.freeze({ reactionMedianMs: 80, reactionLapses: 3, mood: -1.2, exerciseMinutes: -20 }),
  sleepLoss: Object.freeze({ sleepHours: -2.5, mood: -1, reactionMedianMs: 60 }),
  hypoxia: Object.freeze({ spo2: -8, heartRate: 20 }),
});

/** Value limits so injected data stays possible (mood is 1–5, SpO₂ at most 100 %). */
const BOUNDS = Object.freeze({
  mood: [1, 5],
  spo2: [0, 100],
  sleepHours: [0, 24],
  reactionLapses: [0, Infinity],
  exerciseMinutes: [0, Infinity],
  radiationMsv: [0, Infinity],
});

/**
 * @typedef {Object} Scenario
 * @property {keyof typeof SCENARIO_EFFECTS} type
 * @property {number} fromDay   First affected mission day (integer).
 * @property {number} days      Number of affected days (integer ≥ 1).
 * @property {number} intensity 0–1; multiplies the effect.
 */

/**
 * CHECKLIST §2 (S): "Scenario Lab: inject radiation, fatigue, sleep loss or hypoxia
 * into the data and watch the alerts react".
 *
 * Returns NEW records with the scenario applied to days fromDay … fromDay + days − 1;
 * the input is never modified. Changed records get `origin: "scenario"` so the app can
 * label them and "undo" by reloading the originals. Mood and reaction lapses are
 * rounded to whole numbers, as they're recorded that way.
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records Daily records for ONE astronaut.
 * @param {Scenario} scenario
 * @returns {ReadonlyArray<Object<string, unknown>>}
 * @throws {RangeError} On an unknown type or invalid days/intensity.
 */
export function applyScenario(records, { type, fromDay, days, intensity }) {
  const effects = SCENARIO_EFFECTS[type];
  if (!effects) throw new RangeError(`applyScenario: unknown scenario "${type}".`);
  if (!Number.isInteger(fromDay) || !Number.isInteger(days) || days < 1) {
    throw new RangeError("applyScenario: fromDay must be an integer and days an integer ≥ 1.");
  }
  if (!(typeof intensity === "number" && intensity >= 0 && intensity <= 1)) {
    throw new RangeError("applyScenario: intensity must be between 0 and 1.");
  }
  const toDay = fromDay + days - 1;

  return Object.freeze(
    records.map((record) => {
      if (record === null || typeof record !== "object") return record;
      const day = record[DAY_KEY];
      if (!Number.isInteger(day) || day < fromDay || day > toDay) return record;

      const changed = { ...record };
      let touched = false;
      for (const [field, perDay] of Object.entries(effects)) {
        const value = readingOrNull(record[field]);
        if (value === null) continue;
        let next = value + perDay * intensity;
        const [min, max] = BOUNDS[field] ?? [-Infinity, Infinity];
        next = Math.min(max, Math.max(min, next));
        if (field === "mood" || field === "reactionLapses") next = Math.round(next);
        changed[field] = next;
        touched = true;
      }
      if (touched) changed.origin = "scenario";
      return changed;
    }),
  );
}
