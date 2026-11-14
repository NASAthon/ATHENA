// Flight-surgeon summary builder (docs/CHECKLIST.md › 2. Logic, S item "Summary builder").
// Pure logic: no React, DOM, database or Node-only APIs. The one-page screen is CHECKLIST §3.

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
 * @property {number | null} replyExpectedMinutes Round trip (2 × one-way delay), or null if unknown.
 * @property {ReadonlyArray<string>} lines Plain-text lines, ready to show or send.
 */

/**
 * CHECKLIST §2 (S): "Summary builder for the flight-surgeon report".
 *
 * Builds the report from one day's evaluation. The Earth delay is passed in because
 * its values depend on mission mode, which has no sourced numbers yet; without it,
 * `replyExpectedMinutes` is null and the text says the delay is unknown.
 *
 * @param {Object} input
 * @param {string} input.astronaut Display name, e.g. "Commander Rivera".
 * @param {Readonly<import("./evaluate.js").DayEvaluation>} input.evaluation From evaluateDay()/evaluateMission().
 * @param {number | null} [input.earthOneWayMinutes] One-way signal delay in minutes.
 * @returns {Readonly<SurgeonSummary>}
 */
export function buildSurgeonSummary({ astronaut, evaluation, earthOneWayMinutes = null }) {
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
  const replyExpectedMinutes =
    typeof earthOneWayMinutes === "number" && Number.isFinite(earthOneWayMinutes) && earthOneWayMinutes >= 0
      ? Math.round(earthOneWayMinutes * 2)
      : null;

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
      ? `Drifting from in-flight baseline: ${drifting.map((d) => `${d.key} (z ${d.worryingZ?.toFixed(1)})`).join(", ")}`
      : "Drifting from in-flight baseline: none",
    ...breaches.map(
      (b) =>
        `${b.indicatorId}: ${b.label} (${b.level}), reading ${Object.values(b.values).join("/")}. ` +
        `${b.action} [${b.basisLabel}${b.source ? `; source: ${b.source}` : ""}]`,
    ),
    replyExpectedMinutes !== null
      ? `Reply expected in about ${replyExpectedMinutes} minutes (Earth signal delay).`
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
    lines: Object.freeze(lines),
  });
}
