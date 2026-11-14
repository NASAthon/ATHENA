// Health score 0–100 (docs/CHECKLIST.md › 2. Logic, item 4).
// Pure logic: no React, DOM, database or Node-only APIs.
// Formula, caps and bands: docs/DECISIONS.md › Health Score.

import { DRIFT_CUTOFF } from "./drift.js";

/** Sub-scores per status (DECISIONS › Health Score). */
export const SUB_SCORES = Object.freeze({
  steady: 100,
  expected_adaptation: 90,
  driftingStart: 80,
  driftingPerZ: 20,
  driftingFloor: 20,
  redLimit: 0,
});

/** Score caps (DECISIONS › Health Score). */
export const SCORE_CAPS = Object.freeze({ alert: 79, escalated: 59, redLimit: 25 });

/** Bands, highest first (DECISIONS › Health Score). */
export const SCORE_BANDS = Object.freeze([
  Object.freeze({ band: "good", label: "Good", min: 80 }),
  Object.freeze({ band: "watch", label: "Watch", min: 60 }),
  Object.freeze({ band: "alert", label: "Alert", min: 40 }),
  Object.freeze({ band: "critical", label: "Critical", min: 0 }),
]);

/**
 * @typedef {Object} ScorePart
 * @property {string} group
 * @property {number} subScore
 * @property {"red_limit" | "drifting" | "expected_adaptation" | "steady"} reason
 * @property {number | null} worryingZ
 */

/**
 * @typedef {Object} HealthScore
 * @property {number | null} score  0–100, or null when no indicator has data.
 * @property {"good" | "watch" | "alert" | "critical" | null} band
 * @property {string | null} label  "Good", "Watch", "Alert" or "Critical".
 * @property {number | null} cappedAt The cap that applied, if any.
 * @property {ReadonlyArray<ScorePart>} parts Lowest sub-score first ("Why this score?").
 */

/**
 * CHECKLIST §2: "Health score 0–100 per astronaut (100 = perfect)".
 *
 * Each linked group gets a sub-score: red limit ("urgent" band) today = 0; drifting =
 * 80 − 20 × (z − 3.5), floored at 20; expected adaptation = 90; steady = 100. Groups
 * with no data are left out. The score is the rounded average, then capped: 79 for an
 * active alert, 59 for an escalated alert, 25 for any red limit.
 *
 * @param {Object} input
 * @param {ReadonlyArray<{ group: string, status: string, worryingZ: number | null }>} input.groups
 *   From groupStatuses().
 * @param {ReadonlyArray<{ indicatorId: string, redLimit: boolean }>} [input.limitBreaches]
 *   From checkReading() for today's reading; only red limits ("urgent") count.
 * @param {"none" | "note" | "alert" | "escalated"} [input.alertLevel]
 * @returns {Readonly<HealthScore>}
 */
export function healthScore({ groups, limitBreaches = [], alertLevel = "none" }) {
  // Groups are content indicator ids, so a red-limit result maps straight onto its group.
  const redGroups = new Set(limitBreaches.filter((b) => b.redLimit).map((b) => b.indicatorId));

  /** @type {ScorePart[]} */
  const parts = [];
  for (const g of groups) {
    if (redGroups.has(g.group)) {
      parts.push({ group: g.group, subScore: SUB_SCORES.redLimit, reason: "red_limit", worryingZ: g.worryingZ });
    } else if (g.status === "drifting") {
      const z = g.worryingZ ?? DRIFT_CUTOFF;
      const sub = Math.max(
        SUB_SCORES.driftingFloor,
        SUB_SCORES.driftingStart - SUB_SCORES.driftingPerZ * (z - DRIFT_CUTOFF),
      );
      parts.push({ group: g.group, subScore: sub, reason: "drifting", worryingZ: g.worryingZ });
    } else if (g.status === "expected_adaptation") {
      parts.push({ group: g.group, subScore: SUB_SCORES.expected_adaptation, reason: "expected_adaptation", worryingZ: g.worryingZ });
    } else if (g.status === "steady") {
      parts.push({ group: g.group, subScore: SUB_SCORES.steady, reason: "steady", worryingZ: g.worryingZ });
    }
  }
  // A red limit on an indicator whose group had no drift data still counts.
  for (const group of redGroups) {
    if (!parts.some((p) => p.group === group)) {
      parts.push({ group, subScore: SUB_SCORES.redLimit, reason: "red_limit", worryingZ: null });
    }
  }

  if (parts.length === 0) {
    return Object.freeze({ score: null, band: null, label: null, cappedAt: null, parts: Object.freeze([]) });
  }

  const average = parts.reduce((sum, p) => sum + p.subScore, 0) / parts.length;
  let score = Math.round(average);

  const caps = [];
  if (alertLevel === "alert") caps.push(SCORE_CAPS.alert);
  if (alertLevel === "escalated") caps.push(SCORE_CAPS.escalated);
  if (redGroups.size > 0) caps.push(SCORE_CAPS.redLimit);
  const cap = caps.length > 0 ? Math.min(...caps) : null;
  let cappedAt = null;
  if (cap !== null && score > cap) {
    score = cap;
    cappedAt = cap;
  }

  const { band, label } = scoreBand(score);
  const sortedParts = [...parts]
    .sort((a, b) => a.subScore - b.subScore || a.group.localeCompare(b.group))
    .map((p) => Object.freeze(p));
  return Object.freeze({ score, band, label, cappedAt, parts: Object.freeze(sortedParts) });
}

/**
 * Band for a score (80–100 Good, 60–79 Watch, 40–59 Alert, 0–39 Critical).
 *
 * @param {number} score
 * @returns {{ band: "good" | "watch" | "alert" | "critical", label: string }}
 */
export function scoreBand(score) {
  const found = SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
  return { band: found.band, label: found.label };
}

/**
 * CHECKLIST §2: "…with the change since yesterday and over 7 days".
 *
 * @param {ReadonlyArray<{ day: number, score: number | null }>} scores One entry per day.
 * @param {number} day
 * @returns {Readonly<{ sinceYesterday: number | null, over7Days: number | null }>}
 *   Positive = improved. Null when either score is missing.
 */
export function scoreChange(scores, day) {
  const at = (d) => {
    const entry = scores.find((s) => s.day === d);
    return entry && typeof entry.score === "number" ? entry.score : null;
  };
  const today = at(day);
  const yesterday = at(day - 1);
  const weekAgo = at(day - 7);
  return Object.freeze({
    sinceYesterday: today !== null && yesterday !== null ? today - yesterday : null,
    over7Days: today !== null && weekAgo !== null ? today - weekAgo : null,
  });
}
