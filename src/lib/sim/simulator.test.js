// The simulated crew must tell the stories in docs/DECISIONS.md › Crew, judged by the real
// engine with the real content (CHECKLIST §6 tests, at engine level).
import { test } from "node:test";
import assert from "node:assert/strict";
import { INDICATORS } from "../../data/index.js";
import { calculateMissionBaselines } from "../engine/baseline.js";
import { evaluateMission } from "../engine/evaluate.js";
import { DRIFT_INDICATOR_KEYS, RECORD_FIELDS } from "../engine/indicators.js";
import { indicatorStatus } from "../engine/status.js";
import { NAKAMURA_EVENT_DAY, RIVERA_DECLINE_FROM, simulateAstronaut, simulateCrew } from "./simulator.js";

const crew = simulateCrew();
const baselinesFor = (records) => calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);
const evaluate = (id) => evaluateMission(crew[id], baselinesFor(crew[id]), 1, 180);
const days = Object.fromEntries(Object.keys(crew).map((id) => [id, evaluate(id)]));

test("180 days for 3 crew, plus 30 pre-flight days; no launch-day record; a few missed days", () => {
  assert.deepEqual(Object.keys(crew), ["rivera", "singh", "nakamura"]);
  for (const records of Object.values(crew)) {
    assert.equal(records[0].missionDay, -30);
    assert.equal(records.at(-1).missionDay, 180);
    assert.ok(!records.some((r) => r.missionDay === 0));
    assert.ok(records.length >= 205 && records.length < 210);
  }
});

test("deterministic: same seed, same mission; different seed, different noise", () => {
  assert.deepEqual(simulateAstronaut("singh"), simulateAstronaut("singh"));
  assert.notDeepEqual(simulateAstronaut("singh", { seed: 1 }), simulateAstronaut("singh", { seed: 2 }));
  // A shorter mission is the start of the full one (the demo can stop on any day).
  assert.deepEqual(simulateAstronaut("rivera", { toDay: 100 }), simulateAstronaut("rivera").filter((r) => r.missionDay <= 100));
});

test("every value is within the entry form's limits in src/data", () => {
  const limits = {};
  for (const i of INDICATORS) {
    if (i.input) limits[RECORD_FIELDS[i.id]?.value] = i.input;
    for (const f of i.inputs ?? []) limits[RECORD_FIELDS[i.id]?.[f.id]] = f;
  }
  for (const records of Object.values(crew)) {
    for (const r of records) {
      for (const [field, lim] of Object.entries(limits)) {
        if (field in r) assert.ok(r[field] >= lim.min && r[field] <= lim.max, `${field}=${r[field]} on day ${r.missionDay}`);
      }
      assert.ok(Array.isArray(r.symptoms));
      assert.ok(r.mood >= 1 && r.mood <= 5 && Number.isInteger(r.mood));
    }
  }
});

test("Pilot Singh stays healthy: no alert all mission, score always Good, harmless bad day ignored", () => {
  assert.ok(days.singh.every((d) => d.alert.level === "none" || d.alert.level === "note"));
  assert.ok(days.singh.every((d) => d.health.score === null || d.health.score >= 80));
  const badDay = crew.singh.find((r) => r.missionDay === 100);
  assert.ok(badDay.sleepHours < 6, "the bad night is really there");
});

test("Commander Rivera: adapts early, then drifts from week 12 into an alert that escalates", () => {
  const firstAlert = days.rivera.find((d) => d.alert.level === "alert");
  assert.ok(firstAlert, "no alert");
  assert.ok(firstAlert.day > RIVERA_DECLINE_FROM && firstAlert.day <= 129, `alert on day ${firstAlert.day}`);
  assert.ok(days.rivera.some((d) => d.alert.level === "escalated"), "never escalated");
  assert.ok(days.rivera.slice(0, RIVERA_DECLINE_FROM).every((d) => d.alert.level !== "alert" && d.alert.level !== "escalated"));
  const at129 = days.rivera.find((d) => d.day === 129);
  const drifting = at129.groups.filter((g) => g.status === "drifting").map((g) => g.group);
  for (const g of ["sleep", "reaction"]) assert.ok(drifting.includes(g), `${g} not drifting on day 129: ${drifting}`);
  assert.ok(at129.health.score <= 79);
  // Early adaptation: temperature changed since Earth but stable in flight.
  assert.equal(indicatorStatus(crew.rivera, baselinesFor(crew.rivera), "temperature", 60).status, "expected_adaptation");
});

test("Engineer Nakamura: sudden red limit with chest pain on day 129 opens the emergency guide", () => {
  const event = days.nakamura.find((d) => d.day === NAKAMURA_EVENT_DAY);
  const bp = event.limitBreaches.find((b) => b.indicatorId === "bloodPressure");
  assert.equal(bp.level, "urgent");
  assert.equal(bp.label, "Emergency");
  assert.equal(bp.emergencyId, "severe-high-bp");
  assert.ok(event.health.score <= 25);
  assert.ok(days.nakamura.filter((d) => d.day < NAKAMURA_EVENT_DAY).every((d) => !d.limitBreaches.some((b) => b.redLimit)));
  assert.ok(days.nakamura.filter((d) => d.day < NAKAMURA_EVENT_DAY).every((d) => d.alert.level !== "alert"));
});

test("unknown astronaut is rejected", () => {
  assert.throws(() => simulateAstronaut("hal"), RangeError);
});
