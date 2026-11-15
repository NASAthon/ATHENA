import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAY_MINUTES, LIVE_MEASURES, RULES, SCRIPTED_DAY, confidenceAt, crewEvents, evaluateFeed, generateDay,
  liveDay, liveNormals, liveSnapshot, overallState, upcomingScript,
} from "./stream.js";

const NO_BASELINE = { inflight: { indicators: {} } };
const at = (h, m) => h * 60 + m;
const day = (id, d = SCRIPTED_DAY, base = NO_BASELINE) => liveDay(id, d, base);

test("the feed is deterministic and covers every minute of the day", () => {
  const a = generateDay("rivera", 50, liveNormals(NO_BASELINE));
  const b = generateDay("rivera", 50, liveNormals(NO_BASELINE));
  assert.equal(a.length, DAY_MINUTES);
  assert.deepEqual(a, b);
});

test("own normal comes from the stored in-flight baseline", () => {
  const normals = liveNormals({ inflight: { indicators: { heartRate: { mean: 52 } } } });
  assert.equal(normals.heartRate.mean, 52);
  const feed = generateDay("singh", 50, normals);
  const resting = feed.filter((r) => r.minute >= at(9, 0) && r.minute < at(12, 0) && !r.exercise);
  const avg = resting.reduce((s, r) => s + r.heartRate, 0) / resting.length;
  assert.ok(Math.abs(avg - 52) < 4, `resting average ${avg}`);
});

test("an ordinary day with exercise raises no deteriorating or critical state", () => {
  for (const id of ["rivera", "singh", "nakamura"]) {
    const d = day(id, 60);
    for (const m of LIVE_MEASURES) {
      const states = new Set(d.evaluation.states[m.id]);
      assert.ok(!states.has("deteriorating") && !states.has("critical"), `${id} ${m.id}: ${[...states]}`);
    }
    assert.ok(d.events.some((e) => e.text.startsWith("Exercise session")), `${id} exercise event`);
    assert.ok(!d.events.some((e) => e.request), `${id}: no extra-check request on an ordinary day`);
  }
});

test("Nakamura: red-limit blood pressure fires on the first reading and opens the right guide", () => {
  const d = day("nakamura");
  const crit = d.events.find((e) => e.state === "critical" && e.measureId === "bloodPressure");
  assert.ok(crit, "critical event");
  assert.ok(crit.minute >= at(14, 30) && crit.minute <= at(14, 51), `at ${crit.minute}`);
  assert.equal(crit.emergencyId, "severe-high-bp");
  const firstRed = d.evaluation.red.indexOf(true);
  assert.equal(d.evaluation.states.bloodPressure[firstRed], "critical");
  assert.ok(d.events.some((e) => e.text === "Chest pain reported" && e.emergencyId === "chest-pain"));
  assert.ok(!d.events.some((e) => e.request), "no cuff request once a red limit has fired");
  assert.equal(liveSnapshot(d, at(14, 55)).overall, "critical");
});

test("Nakamura: one isolated heart-rate spike is ignored, not alerted", () => {
  const d = day("nakamura");
  assert.ok(d.events.some((e) => e.text.startsWith("Single heart-rate spike")));
  assert.notEqual(d.evaluation.states.heartRate[at(12, 58)], "deteriorating");
});

test("Rivera: a slow slide becomes deteriorating only after it is sustained, then ATHENA asks for a check", () => {
  const d = day("rivera");
  const det = d.events.find((e) => e.state === "deteriorating" && e.measureId);
  assert.ok(det && det.minute > at(13, 30) && det.minute < at(14, 40), `deteriorating at ${det?.minute}`);
  const req = d.events.find((e) => e.request === "cuffBp");
  assert.ok(req && req.minute >= det.minute);
  assert.equal(liveSnapshot(d, at(14, 51)).request?.request, "cuffBp");
  assert.equal(liveSnapshot(d, at(12, 0)).overall, "stable");
});

test("Singh: a removed shirt reads as no data, lowers confidence, and never counts as fine", () => {
  const d = day("singh");
  const s = liveSnapshot(d, at(17, 0));
  assert.equal(s.measures.heartRate.state, "no_data");
  assert.equal(s.measures.heartRate.reading, null);
  assert.equal(s.overall, "no_data");
  assert.notEqual(s.confidence.level, "High");
  assert.match(s.sensor, /Shirt not worn since 16:20/);
  assert.equal(liveSnapshot(d, at(17, 45)).measures.heartRate.state === "no_data", false);
});

test("confidence: High when worn all hour, Low after an hour off", () => {
  const worn = Array.from({ length: 120 }, (_, m) => ({ minute: m, worn: true }));
  const off = Array.from({ length: 120 }, (_, m) => ({ minute: m, worn: m < 30 }));
  assert.equal(confidenceAt(worn, 119).level, "High");
  assert.equal(confidenceAt(off, 119).level, "Low");
});

test("overall state is the most serious known state; no data doesn't hide a problem", () => {
  assert.equal(overallState({ a: "stable", b: "deteriorating", c: "no_data" }), "deteriorating");
  assert.equal(overallState({ a: "no_data" }), "no_data");
});

test("snapshots carry the last 60 minutes and today's average so far", () => {
  const s = liveSnapshot(day("rivera"), at(10, 0));
  assert.equal(s.measures.heartRate.series.length, 60);
  assert.ok(Number.isFinite(s.measures.bloodPressure.averageSoFar.bpSystolic));
});

test("crew-wide event and the presenter's coming-up list exist only on the scripted day", () => {
  assert.equal(crewEvents(SCRIPTED_DAY).length, 1);
  assert.equal(crewEvents(SCRIPTED_DAY + 1).length, 0);
  assert.ok(upcomingScript(SCRIPTED_DAY, at(8, 0)).length > 5);
  assert.equal(upcomingScript(SCRIPTED_DAY + 1, 0).length, 0);
});

test("rules stay within sensible bounds", () => {
  assert.ok(RULES.deteriorateAfter > RULES.spikeMinutes);
  assert.ok(evaluateFeed(generateDay("singh", 10, liveNormals(null)), liveNormals(null)).red.every((x) => x === false));
});
