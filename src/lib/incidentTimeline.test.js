import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIncidentTimeline } from "./incidentTimeline.js";
import { createCommunicationMessage } from "./communications.js";

const evaluation = (day, level, options = {}) => ({
  day,
  alert: { level, driftingGroups: level === "none" ? 0 : 2 },
  health: { band: options.band ?? "good", score: options.score ?? 90 },
  limitBreaches: options.limitBreaches ?? [],
});

test("incident timeline records alert transitions, recovery and red limits without daily noise", () => {
  const events = buildIncidentTimeline({
    evaluations: [
      evaluation(1, "none"),
      evaluation(2, "alert", { band: "watch", score: 70 }),
      evaluation(3, "alert", { band: "watch", score: 68, limitBreaches: [{ redLimit: true, indicatorId: "temperature", label: "Severe" }] }),
      evaluation(4, "none", { band: "good", score: 90 }),
    ],
    simulatedNowMs: 0,
  });
  assert.ok(events.some((item) => item.title === "Drift alert started"));
  assert.ok(events.some((item) => item.title === "Alert cleared"));
  assert.ok(events.some((item) => item.type === "red_limit"));
  assert.equal(events.filter((item) => item.type === "alert").length, 1);
});

test("incident timeline includes communication acknowledgement derived from simulated time", () => {
  const message = createCommunicationMessage({
    id: "one", astronautId: "rivera", missionModeId: "iss", missionDay: 8,
    report: { alertLevel: "none", limitBreaches: [], drifting: [], lines: [] },
    sentAt: "2026-11-14T12:00:00Z", sentSimMs: 1000,
  });
  const event = buildIncidentTimeline({ messages: [message], simulatedNowMs: 100000 }).find((item) => item.type === "communication");
  assert.match(event.detail, /acknowledged/);
});
