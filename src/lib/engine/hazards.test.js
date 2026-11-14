import { test } from "node:test";
import assert from "node:assert/strict";
import { INDICATORS } from "../../data/index.js";
import { hazardForIndicator, likelyHazards } from "./hazards.js";

test("every indicator's guide names a known hazard", () => {
  for (const ind of INDICATORS) {
    assert.ok(hazardForIndicator(ind.id), `${ind.id}: hazardEffect must start with a hazard name from src/data/hazards.js`);
  }
});

test("Rivera's decline (sleep, mood, reaction) points to Isolation and Confinement", () => {
  const [first] = likelyHazards(["sleep", "mood", "reaction"]);
  assert.equal(first.hazardId, "isolation");
  assert.deepEqual([...first.indicatorIds], ["sleep", "mood", "reaction"]);
  assert.ok(first.source.url.startsWith("https://www.nasa.gov/"));
});

test("most linked indicators first; unknown ids skipped; bad input throws", () => {
  const result = likelyHazards(["temperature", "heartRate", "bloodPressure", "nope"]);
  assert.deepEqual(result.map((h) => h.hazardId), ["gravity", "hostile"]);
  assert.deepEqual(likelyHazards([]), []);
  assert.throws(() => likelyHazards("sleep"), TypeError);
});
