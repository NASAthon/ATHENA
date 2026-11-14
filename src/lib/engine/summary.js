// Flight-surgeon summary builder (docs/CHECKLIST.md › 2. Logic, S item "Summary builder").
// Pure logic: no React, DOM, database or Node-only APIs. The one-page screen is CHECKLIST §3.

import { INDICATORS } from "../../data/index.js";
import { DRIFT_INDICATORS } from "./indicators.js";
import { earthLink } from "./missionMode.js";

const indicatorName = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const groupOfKey = Object.fromEntries(DRIFT_INDICATORS.map((d) => [d.key, d.group]));
// Plain-English names for record fields that share one indicator (DECISIONS › Content Style).
const PART_NAME = Object.freeze({ bpSystolic: "top number", bpDiastolic: "bottom number", reactionMedianMs: "median", reactionLapses: "lapses" });
const LEVEL_TEXT = Object.freeze({ watch: "watch", act: "act", urgent: "red limit" });

/**
 * Plain-English name of a record field, e.g. "bpSystolic" → "Blood pressure (top number)".
 *
 * @param {string} key A drift-tracked record field.
 * @returns {string}
 */
export function driftKeyName(key) {
  const name = indicatorName[groupOfKey[key]] ?? key;
  return PART_NAME[key] ? `${name} (${PART_NAME[key]})` : name;
}

/**
 * @typedef {Object} SurgeonSummary
 * @property {string} astronaut
 * @property {number} day
 * @property {number | null} score
 * @property {string | null} band
 * @property {{ sinceYesterday: number | null, over7Days: number | null }} change
 * @property {string} alertLevel
 * @property {number | null} alertSince
 * @property {ReadonlyArray<{ key: string, worryingZ: number | null }>} drifting
 * @property {ReadonlyArray<{ indicatorId: string, level: string, label: string, values: Object<string, number>, action: string, source: string | null }>} limitBreaches
 * @property {number | null} replyExpectedMinutes Longest round trip in minutes (rounded up), or null if unknown.
 * @property {string | null} replyText  Plain-English wait for a reply, e.g. "up to 40 minutes".
 * @property {ReadonlyArray<string>} lines Plain-text lines, ready to show or send.
 */

/**
 * CHECKLIST §2 (S): "Summary builder for the flight-surgeon report".
 *
 * Builds the report from one day's evaluation. The reply time comes from the mission
 * mode's sourced Earth-link delay (src/data/missionModes.js), or from
 * `earthOneWayMinutes` if given. Without either it is null and the text says so.
 *
 * @param {Object} input
 * @param {string} input.astronaut Display name, e.g. "Commander Rivera".
 * @param {Readonly<import("./evaluate.js").DayEvaluation>} input.evaluation From evaluateDay()/evaluateMission().
 * @param {string} [input.missionModeId] e.g. "mars"; used when earthOneWayMinutes isn't given.
 * @param {number | null} [input.earthOneWayMinutes] One-way signal delay in minutes (overrides the mode).
 * @returns {Readonly<SurgeonSummary>}
 */
export function buildSurgeonSummary({ astronaut, evaluation, missionModeId, earthOneWayMinutes = null }) {
  const { day, health, change, alert, indicators, limitBreaches } = evaluation;
  const drifting = indicators
    .filter((i) => i.status === "drifting")
    .map((i) => Object.freeze({ key: i.key, worryingZ: i.worryingZ }));
  const breaches = limitBreaches.map((b) =>
    Object.freeze({
      indicatorId: b.indicatorId,
      level: b.level,
      label: b.label,
      values: b.values,
      action: b.action,
      basisLabel: b.basisLabel,
      source: b.source ? b.source.url : null,
    }),
  );
  let replyExpectedMinutes = null;
  let replyText = null;
  if (typeof earthOneWayMinutes === "number" && Number.isFinite(earthOneWayMinutes) && earthOneWayMinutes >= 0) {
    replyExpectedMinutes = Math.round(earthOneWayMinutes * 2);
    replyText = `about ${replyExpectedMinutes} minutes`;
  } else if (missionModeId) {
    const link = earthLink(missionModeId);
    if (link) {
      replyExpectedMinutes = Math.ceil(link.roundTripMaxSeconds / 60);
      replyText = link.replyText;
    }
  }

  const signed = (n) => (n > 0 ? `+${n}` : String(n));
  const lines = [
    `${astronaut}, mission day ${day}`,
    health.score === null
      ? "Health score: not enough data"
      : `Health score: ${health.score} (${health.label})` +
        (change.sinceYesterday !== null ? `, ${signed(change.sinceYesterday)} since yesterday` : "") +
        (change.over7Days !== null ? `, ${signed(change.over7Days)} over 7 days` : ""),
    `Alert level: ${alert.level}${alert.alertSince !== null ? ` (since day ${alert.alertSince})` : ""}`,
    drifting.length > 0
      ? `Drifting from own in-flight normal: ${drifting.map((d) => `${driftKeyName(d.key)} (drift score ${d.worryingZ?.toFixed(1)})`).join(", ")}`
      : "Drifting from own in-flight normal: none",
    ...breaches.map(
      (b) =>
        `${indicatorName[b.indicatorId] ?? b.indicatorId}: ${b.label} (${LEVEL_TEXT[b.level] ?? b.level}), reading ${Object.values(b.values).join("/")}. ` +
        `${b.action} [${b.basisLabel}${b.source ? `; source: ${b.source}` : ""}]`,
    ),
    replyText !== null
      ? `Reply from Earth expected ${replyText} (signal delay).`
      : "Reply time: Earth signal delay not known.",
    "Thresholds are general clinical reference ranges or ATHENA design choices, not NASA flight standards. Not medical advice.",
  ];

  return Object.freeze({
    astronaut,
    day,
    score: health.score,
    band: health.band,
    change,
    alertLevel: alert.level,
    alertSince: alert.alertSince,
    drifting: Object.freeze(drifting),
    limitBreaches: Object.freeze(breaches),
    replyExpectedMinutes,
    replyText,
    lines: Object.freeze(lines),
  });
}
