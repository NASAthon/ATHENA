// End-to-end checks on 180-day simulated missions (seeded, so always the same data).
// These mirror CHECKLIST §6 tests for the three crew roles in DECISIONS › Crew.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMissionBaselines } from "./baseline.js";
import { evaluateDay, evaluateMission } from "./evaluate.js";
import { DRIFT_INDICATOR_KEYS } from "./indicators.js";
import { buildSurgeonSummary } from "./summary.js";
import { makeMission } from "./testData.js";

/** Baselines from data up to day 35 only: they're fixed (DECISIONS › Baselines). */
const baselinesFor = (records) =>
  calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);

test("healthy astronaut (Singh): no alert all mission and a stable high score", () => {
  for (const seed of [11, 12, 13]) {
    const records = makeMission({ seed });
    const days = evaluateMission(records, baselinesFor(records), 1, 180);
    assert.ok(days.every((d) => ["none", "note"].includes(d.alert.level)), `seed ${seed}: false alert`);
    const scores = days.map((d) => d.health.score).filter((s) => s !== null);
    assert.ok(Math.min(...scores) >= 80, `seed ${seed}: score fell to ${Math.min(...scores)}`);
  }
});

test("slow decline from day 75 (Rivera): alert appears, then escalates, and the score drops", () => {
  const records = makeMission({
    seed: 21,
    shift: (d) => (d > 75 ? { sleepHours: -0.025 * (d - 75), mood: -0.02 * (d - 75), reactionMedianMs: 1.2 * (d - 75) } : {}),
  });
  const days = evaluateMission(records, baselinesFor(records), 1, 180);
  const firstAlert = days.find((d) => d.alert.level === "alert");
  assert.ok(firstAlert, "no alert raised");
  assert.ok(firstAlert.day > 75 && firstAlert.day < 150, `alert on day ${firstAlert.day}`);
  assert.ok(days.some((d) => d.alert.level === "escalated"), "never escalated");
  assert.ok(firstAlert.health.score <= 79);
  const day180 = days[days.length - 1];
  assert.ok(day180.health.score < days[60].health.score);
});

test("one bad day produces no alert", () => {
  const records = makeMission({ seed: 31, shift: (d) => (d === 100 ? { sleepHours: -4, mood: -2, reactionMedianMs: 150 } : {}) });
  const days = evaluateMission(records, baselinesFor(records), 95, 110);
  assert.ok(days.every((d) => d.alert.level !== "alert" && d.alert.level !== "escalated"));
});

test("dangerous reading (Nakamura): red limit caps the score at 25 that day", () => {
  const records = makeMission({ seed: 41, toDay: 120 });
  const event = records.find((r) => r.missionDay === 120);
  event.bpSystolic = 195;
  const today = evaluateDay(records, baselinesFor(records), 120);
  assert.equal(today.limitBreaches[0].level, "urgent");
  assert.equal(today.limitBreaches[0].label, "Severe");
  assert.ok(today.health.score <= 25);
  const summary = buildSurgeonSummary({ astronaut: "Engineer Nakamura", evaluation: today, earthOneWayMinutes: 20 });
  assert.equal(summary.replyExpectedMinutes, 40);
  const fromMode = buildSurgeonSummary({ astronaut: "Engineer Nakamura", evaluation: today, missionModeId: "mars" });
  assert.equal(fromMode.replyText, "up to 40 minutes");
  assert.ok(fromMode.lines.some((l) => l.includes("up to 40 minutes")));
  assert.ok(summary.lines.some((l) => l.includes("cdc.gov")));
});

test("missing days: no crash and no false alert", () => {
  const missing = [];
  for (let d = 40; d <= 180; d += 1) if (d % 3 === 0 || (d >= 90 && d <= 104)) missing.push(d);
  const records = makeMission({ seed: 51, missingDays: missing });
  const days = evaluateMission(records, baselinesFor(records), 1, 180);
  assert.equal(days.length, 180);
  assert.ok(days.every((d) => ["none", "note"].includes(d.alert.level)));
  const gap = days.find((d) => d.day === 100); // inside a 15-day gap
  assert.equal(gap.health.score, null);
  assert.ok(gap.indicators.every((i) => i.status === "no_data"));
});

test("empty data: everything is no_data and nothing throws", () => {
  const days = evaluateMission([], {}, 1, 10);
  assert.ok(days.every((d) => d.health.score === null && d.alert.level === "none"));
});

test("deterministic: same records give identical evaluations", () => {
  const records = makeMission({ seed: 61, toDay: 60 });
  const baselines = baselinesFor(records);
  assert.deepEqual(evaluateMission(records, baselines, 1, 60), evaluateMission([...records].reverse(), baselines, 1, 60));
});
