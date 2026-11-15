// Indicator settings used by the logic engine.
//
// Health content (names, units, thresholds, sources, keywords) lives in src/data and
// is never repeated here (AGENTS.md: "Never hard-code health text or numbers").
// This file only holds what the engine needs on top of it: which daily-record fields
// hold each indicator, the worrying direction for drift, and the minimum spread.
//
// Daily-record field names (camelCase; units as in src/data/indicators.js). Change them here only.

import { INDICATORS } from "../../data/index.js";

/**
 * Daily-record fields for each content indicator (src/data/indicators.js ids).
 * Blood pressure and the reaction test have more than one number.
 *
 * @type {Readonly<Record<string, Readonly<Record<string, string>>>>}
 */
export const RECORD_FIELDS = Object.freeze({
  heartRate: Object.freeze({ value: "heartRate" }),
  bloodPressure: Object.freeze({ systolic: "bpSystolic", diastolic: "bpDiastolic" }),
  glucose: Object.freeze({ value: "glucose" }),
  temperature: Object.freeze({ value: "temperature" }),
  sleep: Object.freeze({ value: "sleepHours" }),
  mood: Object.freeze({ value: "mood" }),
  reaction: Object.freeze({ median: "reactionMedianMs", lapses: "reactionLapses", falseStarts: "reactionFalseStarts" }),
  exercise: Object.freeze({ value: "exerciseMinutes" }),
  spo2: Object.freeze({ value: "spo2" }),
  radiation: Object.freeze({ value: "radiationMsv" }),
});

/** The symptoms field: a list of symptom ids from src/data/symptoms.js. */
export const SYMPTOMS_FIELD = "symptoms";

/**
 * Which change counts as worrying (docs/DECISIONS.md › Drift Cut-off):
 * - "down": lower is worrying (sleep, mood, exercise, SpO₂)
 * - "up": higher is worrying (reaction time, lapses)
 * - "both": either way (vital signs)
 *
 * @typedef {"down" | "up" | "both"} Direction
 */

/**
 * @typedef {Object} DriftIndicator
 * @property {string} key       Daily-record field name.
 * @property {string} group     The content indicator id (src/data). Fields of one indicator
 *                              are linked and count once for alerts and the health score
 *                              (DECISIONS › Drift Cut-off).
 * @property {Direction} direction
 * @property {number} sdFloor   Minimum spread `s` for the drift formula, in the field's unit.
 *                              ASSUMPTION: DECISIONS › Drift Cut-off says "s has a minimum per
 *                              indicator" but gives no values. Tune after simulator runs.
 */

/**
 * Fields that get a baseline, a 7-day average, a z-score and a status. Core six first
 * (DECISIONS › Indicators), then daily extras, then optional SpO₂. Not drift-tracked:
 * reaction false starts (no worrying direction given), symptoms (not a number) and
 * radiation dose (a running total, DECISIONS › Heart Rate and SpO₂ / SOURCES).
 *
 * @type {ReadonlyArray<Readonly<DriftIndicator>>}
 */
export const DRIFT_INDICATORS = Object.freeze(
  [
    { key: "heartRate", group: "heartRate", direction: "both", sdFloor: 2 },
    { key: "bpSystolic", group: "bloodPressure", direction: "both", sdFloor: 3 },
    { key: "bpDiastolic", group: "bloodPressure", direction: "both", sdFloor: 2 },
    { key: "glucose", group: "glucose", direction: "both", sdFloor: 4 },
    { key: "temperature", group: "temperature", direction: "both", sdFloor: 0.1 },
    { key: "sleepHours", group: "sleep", direction: "down", sdFloor: 0.25 },
    { key: "mood", group: "mood", direction: "down", sdFloor: 0.3 },
    { key: "reactionMedianMs", group: "reaction", direction: "up", sdFloor: 10 },
    { key: "reactionLapses", group: "reaction", direction: "up", sdFloor: 0.5 },
    { key: "exerciseMinutes", group: "exercise", direction: "down", sdFloor: 10 },
    { key: "spo2", group: "spo2", direction: "down", sdFloor: 0.5 },
  ].map((indicator) => Object.freeze(indicator)),
);

/** Field names of the drift-tracked indicators, in display order. */
export const DRIFT_INDICATOR_KEYS = Object.freeze(DRIFT_INDICATORS.map((i) => i.key));

/** The mission-day field in every daily record (negative = pre-flight). */
export const DAY_KEY = "missionDay";

/**
 * Looks up a drift-tracked field's settings.
 *
 * @param {string} key Daily-record field name.
 * @returns {Readonly<DriftIndicator> | undefined}
 */
export function getIndicator(key) {
  return DRIFT_INDICATORS.find((indicator) => indicator.key === key);
}

/**
 * The content indicator (src/data/indicators.js) for a content id.
 *
 * @param {string} id e.g. "bloodPressure".
 * @returns {Object | undefined}
 */
export function getContentIndicator(id) {
  return INDICATORS.find((indicator) => indicator.id === id);
}

/**
 * Lists the groups (content indicators) in display order with their record fields.
 *
 * @returns {ReadonlyArray<{ group: string, keys: ReadonlyArray<string> }>}
 */
export function listGroups() {
  const groups = [];
  for (const indicator of DRIFT_INDICATORS) {
    let entry = groups.find((g) => g.group === indicator.group);
    if (!entry) {
      entry = { group: indicator.group, keys: [] };
      groups.push(entry);
    }
    entry.keys.push(indicator.key);
  }
  return Object.freeze(groups.map((g) => Object.freeze({ group: g.group, keys: Object.freeze(g.keys) })));
}

/**
 * Returns the value only if it is a usable reading (a finite number). Anything else
 * (missing, null, NaN, Infinity, text) is treated as "no reading".
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function readingOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
