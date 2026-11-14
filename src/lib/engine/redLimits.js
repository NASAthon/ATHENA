// Red-limit check (docs/CHECKLIST.md › 2. Logic, items 9 and 10).
// Pure logic: no React, DOM, database or Node-only APIs.
//
// Every threshold comes from the bands in src/data/indicators.js (their `check` field is
// the machine-readable form of `rule`), and every source from src/data/sources.js.
// Nothing is hard-coded here (AGENTS.md). Heart rate and SpO₂ have no bands by design:
// they are judged only against the astronaut's own baseline (DECISIONS › Heart Rate and SpO₂).
//
// Band levels: "normal" | "watch" | "act" | "urgent". An "urgent" band is a RED LIMIT:
// it opens the red-limit screen and caps the health score at 25 (DECISIONS › Health Score).

import { INDICATORS, SOURCES } from "../../data/index.js";
import { DAY_KEY, RECORD_FIELDS, SYMPTOMS_FIELD, readingOrNull } from "./indicators.js";

/** Labels by band basis (DECISIONS › Thresholds: never call these NASA flight standards). */
export const BASIS_LABELS = Object.freeze({
  clinical: "general clinical reference range",
  design: "ATHENA design choice (not a clinical standard)",
});

/** Level ranking, mildest first. */
export const LEVELS = Object.freeze(["normal", "watch", "act", "urgent"]);

/**
 * @typedef {Object} BandResult
 * @property {string} indicatorId   Content indicator id, e.g. "glucose".
 * @property {"normal" | "watch" | "act" | "urgent"} level
 * @property {boolean} redLimit     True for "urgent".
 * @property {string} label         Band label from src/data, e.g. "Very high".
 * @property {string} rule          Band rule text from src/data.
 * @property {string} action        Band action text from src/data.
 * @property {Object<string, number>} values The reading's numbers, by part.
 * @property {string | null} emergencyId Emergency guide to open, if the band names one.
 * @property {{ id: string, title: string, url: string } | null} source
 * @property {string} basisLabel    From BASIS_LABELS.
 */

/**
 * CHECKLIST §2: "Red-limit check on every new reading, independent of baselines".
 *
 * Classifies each indicator in today's reading against its bands in src/data and
 * returns the ones that aren't "normal", most serious first. No baseline is used, so it
 * works from the very first reading. Missing or invalid values are skipped.
 *
 * If several bands match, the most serious level wins; among equals, the more specific
 * band wins (e.g. "Emergency" with symptoms over "Severe"). Streak bands (e.g. short sleep
 * on 3+ nights in a row, DECISIONS › Trends Over Single Readings) look at `history`: a
 * missing day breaks the streak, so gaps can't raise a streak alert.
 *
 * @param {Object<string, unknown> | null | undefined} reading Today's daily record (or a
 *   partial record such as emergency vitals). `symptoms` is a list of symptom ids.
 * @param {ReadonlyArray<Object<string, unknown>>} [history] Earlier records for the same
 *   astronaut (any order); only needed for streak bands.
 * @returns {ReadonlyArray<Readonly<BandResult>>}
 */
export function checkReading(reading, history = []) {
  if (reading === null || typeof reading !== "object") return Object.freeze([]);
  const results = [];
  for (const indicator of INDICATORS) {
    const band = classifyIndicator(indicator.id, reading, history);
    if (band && band.level !== "normal") results.push(band);
  }
  results.sort((a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level));
  return Object.freeze(results);
}

/**
 * True if the reading breaches any red limit ("urgent" band).
 *
 * @param {Object<string, unknown> | null | undefined} reading
 * @param {ReadonlyArray<Object<string, unknown>>} [history]
 * @returns {boolean}
 */
export function hasRedLimit(reading, history = []) {
  return checkReading(reading, history).some((r) => r.redLimit);
}

/**
 * The band one indicator's reading falls in, including "normal", or null when the
 * reading has no value for it or no band applies.
 *
 * @param {string} indicatorId Content indicator id.
 * @param {Object<string, unknown>} reading
 * @param {ReadonlyArray<Object<string, unknown>>} [history]
 * @returns {Readonly<BandResult> | null}
 */
export function classifyIndicator(indicatorId, reading, history = []) {
  const indicator = INDICATORS.find((i) => i.id === indicatorId);
  const fields = RECORD_FIELDS[indicatorId];
  if (!indicator || !fields || reading === null || typeof reading !== "object") return null;

  const values = readParts(reading, fields);
  if (Object.keys(values).length === 0) return null;

  let best = null;
  indicator.bands.forEach((band, order) => {
    if (!band.check || !bandMatches(band.check, reading, fields, history)) return;
    const rank = [LEVELS.indexOf(band.level), specificity(band.check), order];
    if (!best || compareRank(rank, best.rank) > 0) best = { band, rank };
  });
  if (!best) return null;

  const { band } = best;
  const source = band.sourceId && SOURCES[band.sourceId]
    ? Object.freeze({ id: band.sourceId, title: SOURCES[band.sourceId].title, url: SOURCES[band.sourceId].url })
    : null;
  return Object.freeze({
    indicatorId,
    level: band.level,
    redLimit: band.level === "urgent",
    label: band.label,
    rule: band.rule,
    action: band.action,
    values: Object.freeze(values),
    emergencyId: band.emergencyId ?? null,
    source,
    basisLabel: BASIS_LABELS[band.basis] ?? BASIS_LABELS.design,
  });
}

/**
 * @param {Object<string, unknown>} record
 * @param {Readonly<Record<string, string>>} fields part → record field
 * @returns {Object<string, number>} Usable numbers by part (systolic, diastolic, value…).
 */
function readParts(record, fields) {
  const values = {};
  for (const [part, field] of Object.entries(fields)) {
    const v = readingOrNull(record[field]);
    if (v !== null) values[part] = v;
  }
  return values;
}

/**
 * @param {Object} check   A band's `check` from src/data.
 * @param {Object<string, unknown>} reading
 * @param {Readonly<Record<string, string>>} fields
 * @param {ReadonlyArray<Object<string, unknown>>} history
 * @returns {boolean}
 */
function bandMatches(check, reading, fields, history) {
  if (!valuesMatch(check, readParts(reading, fields))) return false;

  if (Array.isArray(check.withSymptoms)) {
    const ticked = Array.isArray(reading[SYMPTOMS_FIELD]) ? reading[SYMPTOMS_FIELD] : [];
    if (!check.withSymptoms.some((id) => ticked.includes(id))) return false;
  }

  if (Number.isInteger(check.streakDays) && check.streakDays > 1) {
    const today = reading[DAY_KEY];
    if (!Number.isInteger(today)) return false;
    for (let back = 1; back < check.streakDays; back += 1) {
      const earlier = history.find((r) => r && r[DAY_KEY] === today - back);
      if (!earlier || !valuesMatch(check, readParts(earlier, fields))) return false;
    }
  }
  return true;
}

/**
 * True if the numbers meet the check's condition(s). A condition on a part the reading
 * doesn't have counts as not met.
 *
 * @param {Object} check
 * @param {Object<string, number>} values
 * @returns {boolean}
 */
function valuesMatch(check, values) {
  if (Array.isArray(check.all)) return check.all.every((c) => conditionMatches(c, values));
  if (Array.isArray(check.any)) return check.any.some((c) => conditionMatches(c, values));
  return conditionMatches(check, values);
}

/**
 * @param {{ part?: string, below?: number, atMost?: number, atLeast?: number, above?: number }} c
 * @param {Object<string, number>} values
 * @returns {boolean}
 */
function conditionMatches(c, values) {
  const v = values[c.part ?? "value"];
  if (v === undefined) return false;
  if (typeof c.below === "number" && !(v < c.below)) return false;
  if (typeof c.atMost === "number" && !(v <= c.atMost)) return false;
  if (typeof c.atLeast === "number" && !(v >= c.atLeast)) return false;
  if (typeof c.above === "number" && !(v > c.above)) return false;
  return true;
}

/** More conditions = more specific band. */
function specificity(check) {
  return (check.withSymptoms ? 1 : 0) + (check.streakDays ? 1 : 0);
}

/** Lexicographic comparison of [level, specificity, order]; later band order wins ties. */
function compareRank(a, b) {
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
