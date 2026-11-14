import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMMUNICATION_STATUSES,
  changeCommunicationSpeed,
  communicationDelay,
  communicationState,
  createCommunicationClock,
  createCommunicationMessage,
  parseCommunicationClock,
  simulatedNow,
} from "./communications.js";

const report = (overrides = {}) => ({
  astronaut: "Commander Rivera",
  day: 129,
  score: 59,
  alertLevel: "alert",
  drifting: [{ key: "sleepHours", worryingZ: 4.2 }],
  limitBreaches: [],
  lines: ["snapshot"],
  ...overrides,
});

const message = (overrides = {}) => createCommunicationMessage({
  id: "message-1",
  astronautId: "rivera",
  missionModeId: "mars",
  missionDay: 129,
  report: report(),
  sentAt: "2026-11-14T12:00:00.000Z",
  sentSimMs: 10000,
  ...overrides,
});

test("deterministic delays stay inside every mission mode's sourced range and below the maximum", () => {
  for (const id of ["iss", "gateway", "mars"]) {
    const delay = communicationDelay(id);
    assert.ok(delay.seconds > (delay.range.min ?? 0), id);
    assert.ok(delay.seconds < delay.range.max, id);
    assert.deepEqual(communicationDelay(id), delay);
  }
  assert.equal(communicationDelay("gateway").inferred, true);
});

test("outgoing and incoming statuses follow elapsed simulation time", () => {
  const m = message();
  const t0 = m.sentSimMs;
  const transmit = t0 + m.queueDelayMs;
  const earth = transmit + m.oneWayDelayMs;
  const awaiting = earth + m.deliveryHoldMs;
  const returning = awaiting + m.earthProcessingMs;
  const received = returning + m.oneWayDelayMs;
  assert.equal(communicationState(m, t0).status, COMMUNICATION_STATUSES.queued);
  assert.equal(communicationState(m, transmit).status, COMMUNICATION_STATUSES.transmitting);
  assert.equal(communicationState(m, earth).status, COMMUNICATION_STATUSES.delivered);
  assert.equal(communicationState(m, awaiting).status, COMMUNICATION_STATUSES.awaiting);
  assert.equal(communicationState(m, returning).status, COMMUNICATION_STATUSES.returning);
  assert.equal(communicationState(m, received).status, COMMUNICATION_STATUSES.received);
  assert.equal(communicationState(m, received).progress, 1);
});

test("accelerated clocks and speed changes preserve simulation time", () => {
  const start = createCommunicationClock(1000, 60);
  assert.equal(simulatedNow(start, 2000), 61000);
  const faster = changeCommunicationSpeed(start, 720, 2000);
  assert.equal(faster.simulatedNowMs, 61000);
  assert.equal(simulatedNow(faster, 3000), 781000);
  const loaded = parseCommunicationClock(JSON.stringify(faster), 4000);
  assert.equal(loaded.simulatedNowMs, 1501000);
  assert.equal(loaded.realAnchorMs, 4000);
});

test("reports and simulated responses are immutable snapshots", () => {
  const original = report();
  const m = message({ report: original });
  original.alertLevel = "none";
  original.drifting[0].worryingZ = 0;
  assert.equal(m.report.alertLevel, "alert");
  assert.equal(m.report.drifting[0].worryingZ, 4.2);
  assert.equal(m.response.category, "drift");
  assert.match(m.response.simulationLabel, /Simulation only/);
});

test("urgent and normal reports get deterministic replies without new treatment advice", () => {
  const urgent = message({ id: "urgent", report: report({ alertLevel: "escalated" }) });
  const normal = message({ id: "normal", report: report({ alertLevel: "none", drifting: [] }) });
  assert.equal(urgent.response.category, "urgent");
  assert.match(urgent.response.text, /onboard emergency procedure/);
  assert.equal(normal.response.category, "normal");
  assert.match(normal.response.text, /routine monitoring/);
});

