// Offline mission-communications simulation. Pure JavaScript: no React, DOM, database
// or network. The UI persists messages and the clock through MissionDataProvider.

import { getMissionMode } from "./engine/missionMode.js";

export const COMMUNICATION_CLOCK_KEY = "communications_clock";

export const COMMUNICATION_SPEEDS = Object.freeze([
  Object.freeze({ id: "realtime", label: "Real-time", multiplier: 1 }),
  Object.freeze({ id: "accelerated", label: "Accelerated", multiplier: 60 }),
  Object.freeze({ id: "demo", label: "Fast demo", multiplier: 720 }),
]);

export const DEFAULT_COMMUNICATION_SPEED = 720;
export const QUEUE_DELAY_MS = 1000;
export const DELIVERY_HOLD_MS = 1000;
export const EARTH_PROCESSING_MS = 5000;

const SPEED_VALUES = new Set(COMMUNICATION_SPEEDS.map((s) => s.multiplier));

export const COMMUNICATION_STATUSES = Object.freeze({
  queued: Object.freeze({ id: "queued", label: "Queued" }),
  transmitting: Object.freeze({ id: "transmitting", label: "Transmitting" }),
  delivered: Object.freeze({ id: "delivered", label: "Delivered to Earth" }),
  awaiting: Object.freeze({ id: "awaiting", label: "Awaiting Earth response" }),
  returning: Object.freeze({ id: "returning", label: "Response in transit" }),
  received: Object.freeze({ id: "received", label: "Response received" }),
});

/**
 * Deterministic demo delay inside the sourced range. We intentionally do not use the
 * published maximum as though it were the exact delay for every transmission.
 */
export function communicationDelay(modeId) {
  const mode = getMissionMode(modeId);
  const range = mode.earthDelay?.oneWaySeconds;
  if (!range || !(range.max > 0)) throw new RangeError(`No Earth-link delay for mission mode "${mode.id}".`);
  const seconds = typeof range.min === "number"
    ? range.min + (range.max - range.min) * 0.6
    : range.max * 0.7;
  return Object.freeze({
    modeId: mode.id,
    seconds,
    milliseconds: Math.round(seconds * 1000),
    range: Object.freeze({ min: range.min, max: range.max }),
    inferred: Boolean(mode.earthDelay.inferred),
    sourceText: mode.earthDelay.text,
  });
}

/** A persistent simulated clock that advances by `speed` simulation ms per real ms. */
export function createCommunicationClock(realNowMs, speed = DEFAULT_COMMUNICATION_SPEED) {
  assertTime(realNowMs, "realNowMs");
  assertSpeed(speed);
  return Object.freeze({ simulatedNowMs: Math.round(realNowMs), realAnchorMs: Math.round(realNowMs), speed });
}

/** Current simulation time without changing the stored clock anchor. */
export function simulatedNow(clock, realNowMs) {
  assertClock(clock);
  assertTime(realNowMs, "realNowMs");
  return Math.round(clock.simulatedNowMs + Math.max(0, realNowMs - clock.realAnchorMs) * clock.speed);
}

/** Re-anchor at the current instant, preserving time when the speed changes. */
export function changeCommunicationSpeed(clock, speed, realNowMs) {
  assertSpeed(speed);
  const now = simulatedNow(clock, realNowMs);
  return Object.freeze({ simulatedNowMs: now, realAnchorMs: Math.round(realNowMs), speed });
}

export function parseCommunicationClock(raw, realNowMs) {
  try {
    const clock = typeof raw === "string" ? JSON.parse(raw) : raw;
    assertClock(clock);
    // Re-anchor on load so old real time is applied exactly once.
    return changeCommunicationSpeed(clock, clock.speed, realNowMs);
  } catch {
    return createCommunicationClock(realNowMs);
  }
}

export function serialiseCommunicationClock(clock) {
  assertClock(clock);
  return JSON.stringify(clock);
}

/** Creates the immutable report and deterministic simulated response snapshots. */
export function createCommunicationMessage({ id, astronautId, missionModeId, missionDay, report, sentAt, sentSimMs }) {
  if (typeof id !== "string" || id.length === 0) throw new TypeError("A message id is required.");
  if (typeof astronautId !== "string" || astronautId.length === 0) throw new TypeError("An astronaut id is required.");
  if (!Number.isInteger(missionDay) || missionDay < 1) throw new TypeError("Mission day must be a positive whole number.");
  if (!report || typeof report !== "object") throw new TypeError("A report snapshot is required.");
  assertTime(sentSimMs, "sentSimMs");
  const delay = communicationDelay(missionModeId);
  const reportSnapshot = clone({
    ...report,
    astronautId,
    missionModeId: delay.modeId,
    transmittedAt: String(sentAt),
  });
  const response = simulatedSurgeonResponse(reportSnapshot);
  return Object.freeze({
    id,
    astronautId,
    missionModeId: delay.modeId,
    missionDay,
    report: Object.freeze(reportSnapshot),
    response: Object.freeze(response),
    sentAt: String(sentAt),
    sentSimMs: Math.round(sentSimMs),
    oneWayDelayMs: delay.milliseconds,
    queueDelayMs: QUEUE_DELAY_MS,
    deliveryHoldMs: DELIVERY_HOLD_MS,
    earthProcessingMs: EARTH_PROCESSING_MS,
  });
}

export function simulatedSurgeonResponse(report) {
  const urgent = report.limitBreaches?.some((b) => b.level === "urgent") || report.alertLevel === "escalated";
  const drift = report.alertLevel === "note" || report.alertLevel === "alert";
  const category = urgent ? "urgent" : drift ? "drift" : "normal";
  const text = urgent
    ? "Report received. Follow the existing onboard emergency procedure now and do not wait for Earth."
    : drift
      ? "Report received. Continue measurements and follow ATHENA's onboard guidance while the trend is reviewed."
      : "Report received. Continue routine monitoring and scheduled measurements.";
  return {
    category,
    text,
    simulationLabel: "Simulation only — not a real flight surgeon response.",
  };
}

/** Status and phase boundaries derived only from elapsed simulation time. */
export function communicationState(message, simNowMs) {
  assertMessageTiming(message);
  assertTime(simNowMs, "simNowMs");
  const start = message.sentSimMs;
  const transmitStart = start + message.queueDelayMs;
  const earthArrival = transmitStart + message.oneWayDelayMs;
  const awaitStart = earthArrival + message.deliveryHoldMs;
  const responseStart = awaitStart + message.earthProcessingMs;
  const responseArrival = responseStart + message.oneWayDelayMs;
  let status;
  let phaseStart;
  let phaseEnd;
  if (simNowMs < transmitStart) [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.queued, start, transmitStart];
  else if (simNowMs < earthArrival) [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.transmitting, transmitStart, earthArrival];
  else if (simNowMs < awaitStart) [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.delivered, earthArrival, awaitStart];
  else if (simNowMs < responseStart) [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.awaiting, awaitStart, responseStart];
  else if (simNowMs < responseArrival) [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.returning, responseStart, responseArrival];
  else [status, phaseStart, phaseEnd] = [COMMUNICATION_STATUSES.received, responseArrival, responseArrival];
  const total = responseArrival - start;
  const elapsed = Math.max(0, Math.min(total, simNowMs - start));
  return Object.freeze({
    status,
    progress: total > 0 ? elapsed / total : 1,
    remainingSimMs: Math.max(0, responseArrival - simNowMs),
    phaseRemainingSimMs: Math.max(0, phaseEnd - simNowMs),
    phaseStart,
    phaseEnd,
    earthArrival,
    responseStart,
    responseArrival,
  });
}

export function formatCommunicationDuration(simulatedMs, speed = 1) {
  const realSeconds = Math.max(0, simulatedMs) / 1000 / speed;
  if (realSeconds < 1) return "under 1 second";
  if (realSeconds < 60) return `about ${Math.ceil(realSeconds)} seconds`;
  return `about ${Math.ceil(realSeconds / 60)} minutes`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertMessageTiming(message) {
  if (!message || typeof message !== "object") throw new TypeError("A communication message is required.");
  for (const key of ["sentSimMs", "oneWayDelayMs", "queueDelayMs", "deliveryHoldMs", "earthProcessingMs"]) {
    assertTime(message[key], key);
  }
}

function assertClock(clock) {
  if (!clock || typeof clock !== "object") throw new TypeError("A communication clock is required.");
  assertTime(clock.simulatedNowMs, "simulatedNowMs");
  assertTime(clock.realAnchorMs, "realAnchorMs");
  assertSpeed(clock.speed);
}

function assertTime(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new TypeError(`${name} must be a non-negative number.`);
}

function assertSpeed(speed) {
  if (!SPEED_VALUES.has(speed)) throw new RangeError(`Unknown communication speed "${speed}".`);
}
