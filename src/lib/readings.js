// Display helpers for stored readings: a reading and the astronaut's in-flight "normal",
// formatted with units. Shared by Today and the body map so they always show the same numbers.
// Display only: no health rules here (those live in src/lib/engine).

import { INDICATORS } from "@/data";
import { RECORD_FIELDS } from "@/lib/engine";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));

/** Unit shown for an indicator (mood is a 1–5 scale). */
export const unitOf = (id) => (id === "mood" ? "/ 5" : (byId[id]?.unit ?? ""));

const WHOLE_UNITS = new Set(["ms", "mmHg", "bpm", "minutes"]);
const round = (v, unit) => (WHOLE_UNITS.has(unit) ? Math.round(v) : Math.round(v * 10) / 10);

/** One value rounded for display in an indicator's unit (whole numbers for ms, mmHg, bpm, minutes). */
export const formatValue = (id, value) => (Number.isFinite(value) ? String(round(value, unitOf(id))) : "—");

/** Record fields shown for an indicator (the reaction test shows its median only). */
export const displayKeys = (id) => {
  const fields = RECORD_FIELDS[id];
  if (!fields) return [];
  return id === "reaction" ? [fields.median] : Object.values(fields);
};

function format(keys, unit, get) {
  if (keys.length === 0) return null;
  const vals = keys.map(get);
  if (vals.some((v) => v === null || v === undefined || !Number.isFinite(v))) return null;
  return vals.map((v) => round(v, unit)).join(" / ");
}

/**
 * A reading and the in-flight "your normal" for one content indicator.
 *
 * @param {string} id Content indicator id, e.g. "bloodPressure".
 * @param {Object | null} record A stored daily record.
 * @param {Object | null} baselines Stored { preflight, inflight } baselines.
 * @returns {{ unit: string, value: string | null, normal: string | null }}
 */
export function readingFor(id, record, baselines) {
  const unit = unitOf(id);
  const keys = displayKeys(id);
  const inflight = baselines?.inflight?.indicators ?? {};
  return {
    unit,
    value: record ? format(keys, unit, (k) => record[k]) : null,
    normal: format(keys, unit, (k) => (inflight[k]?.status === "ok" ? inflight[k].mean : null)),
  };
}

/**
 * The most recent record (on or before `today`) that has a reading for this indicator.
 *
 * @param {string} id
 * @param {ReadonlyArray<Object>} records Sorted or unsorted daily records for one astronaut.
 * @param {number} today
 * @returns {Object | null}
 */
export function latestRecordWith(id, records, today) {
  const keys = displayKeys(id);
  if (keys.length === 0) return null;
  let best = null;
  for (const r of records) {
    if (!Number.isInteger(r.missionDay) || r.missionDay > today) continue;
    if (!keys.every((k) => Number.isFinite(r[k]))) continue;
    if (!best || r.missionDay > best.missionDay) best = r;
  }
  return best;
}

// Record field → plain name for messages, e.g. "bpSystolic" → "Blood pressure: Top number (systolic)".
const FIELD_NAME = Object.fromEntries(
  Object.entries(RECORD_FIELDS).flatMap(([id, parts]) =>
    Object.entries(parts).map(([part, field]) => {
      const sub = byId[id]?.inputs?.find((f) => f.id === part)?.label;
      return [field, sub ? `${byId[id].name}: ${sub}` : (byId[id]?.name ?? field)];
    }),
  ),
);

/** A validation message with its leading record field name made plain English. */
export const plainFieldError = (message) => String(message).replace(/^(\w+)/, (field) => FIELD_NAME[field] ?? field);
