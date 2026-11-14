// Simulated sensor scan for the Daily check (docs/DECISIONS.md › Simulated Sensor Scan).
// Replaces typing vitals by hand: ATHENA "reads" each wearable or device, checks every value is
// plausible, and hands the validated readings to saveCheckIn(). ALL READINGS ARE SIMULATED: they
// come from the seeded mission simulator, so they match what every other screen shows.
//
// Pure logic: no React, DOM or database, so it runs in `node --test`.

import { INDICATORS } from "../../data/index.js";
import { RECORD_FIELDS } from "../engine/indicators.js";
import { DEMO_SEED, SIMULATED_CREW, simulateAstronaut } from "./simulator.js";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));

/**
 * The simulated sensors, in scan order, and the indicators each one supplies. Generic device
 * names (no brands): they stand for the kinds of sensors listed in docs/SOURCES.md.
 */
export const SCAN_SENSORS = Object.freeze([
  Object.freeze({ id: "shirt", name: "Smart shirt", detail: "heart rate, blood pressure trend, SpO₂", indicators: Object.freeze(["heartRate", "bloodPressure", "spo2"]) }),
  Object.freeze({ id: "wrist", name: "Wrist sleep sensor", detail: "last night's sleep", indicators: Object.freeze(["sleep"]) }),
  Object.freeze({ id: "glucose", name: "Glucose sensor", detail: "blood glucose", indicators: Object.freeze(["glucose"]) }),
  Object.freeze({ id: "thermometer", name: "Thermometer", detail: "body temperature", indicators: Object.freeze(["temperature"]) }),
  Object.freeze({ id: "exercise", name: "Exercise equipment log", detail: "today's exercise minutes", indicators: Object.freeze(["exercise"]) }),
]);

/**
 * Scripted sensor faults for the demo story (ASSUMPTION, simulated): Singh's shirt isn't worn on
 * the demo day, so the first scan shows how ATHENA handles a sensor that gives no signal.
 */
export const SCRIPTED_FAULTS = Object.freeze({ singh: Object.freeze({ 129: Object.freeze({ shirt: "no-signal" }) }) });

/** Small deterministic hash (FNV-1a), so the same astronaut, day and sensor always behave the same. */
function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Which fault (if any) a sensor shows on a given attempt. Only the FIRST attempt can fail:
 * a retry always reads cleanly, so the demo never gets stuck. Besides the scripted faults,
 * about 1 first attempt in 12 has a harmless glitch (ASSUMPTION, simulated).
 *
 * @param {string} astronautId
 * @param {number} missionDay
 * @param {string} sensorId
 * @param {number} attempt 0 for the first try.
 * @returns {"no-signal" | "implausible" | null}
 */
export function sensorFault(astronautId, missionDay, sensorId, attempt) {
  if (attempt > 0) return null;
  const scripted = SCRIPTED_FAULTS[astronautId]?.[missionDay]?.[sensorId];
  if (scripted) return scripted;
  const h = hash(`${astronautId}|${missionDay}|${sensorId}`);
  if (h % 12 !== 0) return null;
  return h % 24 === 0 ? "no-signal" : "implausible";
}

/** Plausibility limits for each part of an indicator, from src/data (not health thresholds). */
function limitsFor(indicatorId) {
  const ind = byId[indicatorId];
  if (ind?.inputs) return Object.fromEntries(ind.inputs.map((f) => [f.id, f]));
  return { value: ind?.input ?? {} };
}

/**
 * Checks one sensor reading is plausible before it is saved: every part present and a number,
 * inside the indicator's input limits from src/data, and blood pressure's top number above its
 * bottom number. Returns a plain-English reason when it fails.
 *
 * @param {string} indicatorId
 * @param {Object<string, number | null | undefined>} parts e.g. { systolic: 120, diastolic: 80 }
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function validateScanReading(indicatorId, parts) {
  const ind = byId[indicatorId];
  if (!ind) return { ok: false, reason: "Unknown measurement." };
  const limits = limitsFor(indicatorId);
  for (const [part, lim] of Object.entries(limits)) {
    const v = parts?.[part];
    if (v === null || v === undefined || !Number.isFinite(v)) return { ok: false, reason: "No signal from the sensor." };
    if ((lim.min !== undefined && v < lim.min) || (lim.max !== undefined && v > lim.max)) {
      return { ok: false, reason: `Reading ${v} ${ind.unit} is outside what a sensor can plausibly measure, so it looks like a sensor error.` };
    }
  }
  if (indicatorId === "bloodPressure" && parts.systolic <= parts.diastolic) {
    return { ok: false, reason: "Top number isn't above the bottom number, so it looks like a sensor error." };
  }
  return { ok: true };
}

/** The simulated record for one astronaut and day (null if they aren't in the simulator). */
function simulatedRecord(astronautId, missionDay, seed) {
  if (!SIMULATED_CREW.includes(astronautId)) return null;
  return simulateAstronaut(astronautId, { seed, fromDay: missionDay, toDay: missionDay })[0] ?? null;
}

/** Reads one indicator's parts out of a record, using the engine's field names. */
function partsFromRecord(record, indicatorId) {
  const fields = RECORD_FIELDS[indicatorId];
  return Object.fromEntries(Object.entries(fields).map(([part, field]) => [part, record?.[field] ?? null]));
}

/** A broken value for an "implausible" fault: clearly outside every input limit. */
function garble(parts) {
  return Object.fromEntries(Object.keys(parts).map((p) => [p, 0]));
}

/**
 * Reads one simulated sensor: its indicators' values for the day, after any fault, each checked
 * with validateScanReading(). An indicator the simulator doesn't record for that astronaut
 * (e.g. no SpO₂) comes back as "not measured", which is not an error.
 *
 * @param {string} astronautId
 * @param {number} missionDay
 * @param {string} sensorId One of SCAN_SENSORS.
 * @param {{ attempt?: number, seed?: number }} [options]
 * @returns {{ sensorId: string, ok: boolean, fault: string | null, readings: Array<{
 *   indicatorId: string, parts: Object<string, number | null>, status: "valid" | "invalid" | "not_measured", reason: string | null }> }}
 */
export function readSensor(astronautId, missionDay, sensorId, { attempt = 0, seed = DEMO_SEED } = {}) {
  const sensor = SCAN_SENSORS.find((s) => s.id === sensorId);
  if (!sensor) throw new RangeError(`readSensor: unknown sensor "${sensorId}".`);
  const record = simulatedRecord(astronautId, missionDay, seed);
  const fault = record ? sensorFault(astronautId, missionDay, sensorId, attempt) : "no-signal";

  const readings = sensor.indicators.map((indicatorId) => {
    let parts = partsFromRecord(record, indicatorId);
    const measured = Object.values(parts).some((v) => v !== null);
    if (!fault && !measured) return { indicatorId, parts, status: "not_measured", reason: null };
    if (fault === "no-signal") parts = Object.fromEntries(Object.keys(parts).map((p) => [p, null]));
    if (fault === "implausible") parts = garble(parts);
    const check = validateScanReading(indicatorId, parts);
    return { indicatorId, parts, status: check.ok ? "valid" : "invalid", reason: check.ok ? null : check.reason };
  });
  return { sensorId, ok: readings.every((r) => r.status !== "invalid"), fault, readings };
}

/**
 * Turns validated scan readings into the record fields saveCheckIn() expects. Invalid and
 * not-measured readings are left out, so they never overwrite anything already stored.
 *
 * @param {ReadonlyArray<ReturnType<typeof readSensor>>} sensorResults
 * @returns {Object<string, number>}
 */
export function scanToRecordFields(sensorResults) {
  const fields = {};
  for (const result of sensorResults) {
    for (const r of result.readings) {
      if (r.status !== "valid") continue;
      for (const [part, field] of Object.entries(RECORD_FIELDS[r.indicatorId])) {
        if (Number.isFinite(r.parts[part])) fields[field] = r.parts[part];
      }
    }
  }
  return fields;
}
