// Mission mode against the real data in src/data/missionModes.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HAZARDS } from "../../data/index.js";
import { adviceForMode, earthLink, getMissionMode, hazardsForMode } from "./missionMode.js";

test("three modes, Mars Transit by default, no Lunar Surface Base", () => {
  assert.equal(getMissionMode("iss").id, "iss");
  assert.equal(getMissionMode("gateway").id, "gateway");
  assert.equal(getMissionMode().id, "mars");
  assert.equal(getMissionMode("lunar-surface").id, "mars"); // out of scope: falls back to the default
});

test("Earth link per mode, from the cited NASA sources", () => {
  const iss = earthLink("iss");
  const gateway = earthLink("gateway");
  const mars = earthLink("mars");
  assert.equal(iss.replyText, "almost immediately (a second or two)");
  assert.equal(gateway.replyText, "about 6–28 seconds");
  assert.equal(gateway.inferred, true); // NASA's lunar-mission estimate applied to Gateway
  assert.equal(mars.replyText, "up to 40 minutes");
  assert.equal(mars.roundTripMaxSeconds, 2400);
  for (const link of [iss, gateway, mars]) assert.match(link.source.url, /^https:\/\/(www\.nasa\.gov|ntrs\.nasa\.gov)\//);
});

test("hazards: all 5 always shown, the mode's emphasis first", () => {
  for (const mode of ["iss", "gateway", "mars"]) {
    const list = hazardsForMode(mode);
    assert.equal(list.length, HAZARDS.length);
    assert.equal(new Set(list.map((h) => h.id)).size, HAZARDS.length);
    const firstPlain = list.findIndex((h) => !h.emphasised);
    assert.ok(list.slice(firstPlain).every((h) => !h.emphasised), "emphasised hazards come first");
  }
  assert.deepEqual(hazardsForMode("mars").filter((h) => h.emphasised).map((h) => h.id), ["distance", "radiation", "isolation"]);
  assert.equal(hazardsForMode("iss")[0].id, "gravity");
});

test("advice changes with the mode and is labelled a design choice", () => {
  const iss = adviceForMode("iss");
  const mars = adviceForMode("mars");
  assert.notEqual(iss.glance, mars.glance);
  assert.match(mars.glance, /40 minutes/);
  assert.match(mars.basisLabel, /design choice/);
  assert.equal(mars.earthLink.modeId, "mars");
});
