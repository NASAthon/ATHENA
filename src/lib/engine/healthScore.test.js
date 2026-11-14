import { test } from "node:test";
import assert from "node:assert/strict";
import { healthScore, scoreBand, scoreChange } from "./healthScore.js";

const g = (group, status, worryingZ = null) => ({ group, status, worryingZ });

test("all steady = 100 Good; no data = null", () => {
  assert.deepEqual({ ...healthScore({ groups: [g("mood", "steady"), g("sleep", "steady")] }), parts: undefined }, { score: 100, band: "good", label: "Good", cappedAt: null, parts: undefined });
  assert.equal(healthScore({ groups: [g("mood", "no_data")] }).score, null);
});

test("sub-scores follow DECISIONS › Health Score", () => {
  assert.equal(healthScore({ groups: [g("a", "expected_adaptation")] }).score, 90);
  assert.equal(healthScore({ groups: [g("a", "drifting", 3.5)] }).score, 80);
  assert.equal(healthScore({ groups: [g("a", "drifting", 4.5)] }).score, 60);
  assert.equal(healthScore({ groups: [g("a", "drifting", 99)] }).score, 20); // floor
});

test("caps: alert 79, escalated 59, red limit 25", () => {
  const groups = [g("a", "drifting", 3.6), g("b", "drifting", 3.6), ...Array.from({ length: 7 }, (_, i) => g(`s${i}`, "steady"))];
  assert.equal(healthScore({ groups }).score, 95); // (2 × 78 + 7 × 100) ÷ 9 = 95.1
  assert.equal(healthScore({ groups, alertLevel: "alert" }).score, 79);
  assert.equal(healthScore({ groups, alertLevel: "escalated" }).score, 59);
  const red = healthScore({ groups, alertLevel: "alert", limitBreaches: [{ indicatorId: "a", redLimit: true }] });
  assert.equal(red.score, 25);
  assert.equal(red.label, "Critical");
  assert.equal(red.parts[0].reason, "red_limit");
});

test("act/watch results don't change the score", () => {
  assert.equal(healthScore({ groups: [g("glucose", "steady")], limitBreaches: [{ indicatorId: "glucose", redLimit: false }] }).score, 100);
});

test("a red limit on an indicator with no drift data still counts", () => {
  const result = healthScore({ groups: [g("mood", "steady")], limitBreaches: [{ indicatorId: "glucose", redLimit: true }] });
  assert.equal(result.score, 25);
  assert.equal(result.parts[0].group, "glucose");
});

test("bands", () => {
  assert.deepEqual([80, 79, 60, 59, 40, 39, 0].map((s) => scoreBand(s).label), ["Good", "Watch", "Watch", "Alert", "Alert", "Critical", "Critical"]);
});

test("change since yesterday and over 7 days", () => {
  const scores = [{ day: 1, score: 90 }, { day: 7, score: 85 }, { day: 8, score: 72 }];
  assert.deepEqual({ ...scoreChange(scores, 8) }, { sinceYesterday: -13, over7Days: -18 });
  assert.deepEqual({ ...scoreChange(scores, 7) }, { sinceYesterday: null, over7Days: null });
});
