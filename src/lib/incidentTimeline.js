// Builds a concise operational history from engine evaluations and immutable Earth-link
// messages. Pure JavaScript: UI components only render these derived events.

import { communicationState } from "./communications.js";
import { INDICATORS } from "../data/index.js";

const ALERT_SEVERITY = Object.freeze({ none: 0, note: 1, alert: 2, escalated: 3 });
const indicatorName = Object.fromEntries(INDICATORS.map((item) => [item.id, item.name]));

export function buildIncidentTimeline({ evaluations = [], messages = [], simulatedNowMs }) {
  if (!Array.isArray(evaluations) || !Array.isArray(messages)) {
    throw new TypeError("Incident timeline needs evaluation and message arrays.");
  }
  const events = [];
  let previousAlert = "none";
  let previousBand = null;
  for (const evaluation of evaluations) {
    const alert = evaluation?.alert?.level ?? "none";
    if (alert !== previousAlert) {
      if (alert === "none" && previousAlert !== "none") {
        events.push(event(evaluation.day, "recovery", "Alert cleared", `Recovered from ${previousAlert} status.`, 1));
      } else if ((ALERT_SEVERITY[alert] ?? 0) > (ALERT_SEVERITY[previousAlert] ?? 0)) {
        events.push(event(evaluation.day, "alert", alertTitle(alert), alertDetail(evaluation), ALERT_SEVERITY[alert] ?? 1));
      }
      previousAlert = alert;
    }
    const band = evaluation?.health?.band ?? null;
    if (band && previousBand && band !== previousBand) {
      events.push(event(evaluation.day, "score", "Health band changed", `${previousBand} → ${band}; score ${evaluation.health.score ?? "not available"}.`, 1));
    }
    if (band) previousBand = band;
    for (const breach of evaluation?.limitBreaches ?? []) {
      if (!breach.redLimit && breach.level !== "urgent") continue;
      events.push(event(
        evaluation.day,
        "red_limit",
        `${indicatorName[breach.indicatorId] ?? breach.indicatorId}: ${breach.label}`,
        "Reading reached the red-limit pathway; follow onboard guidance without waiting for Earth.",
        4,
      ));
    }
  }
  for (const message of messages) {
    const state = communicationState(message, simulatedNowMs);
    events.push(Object.freeze({
      ...event(message.missionDay, "communication", `Earth report: ${state.status.label}`, state.deliveryAcknowledged
        ? "Ground receipt acknowledged in the simulation."
        : "Report is still travelling; onboard guidance remains active.", 0),
      sentAt: message.sentAt,
      messageId: message.id,
    }));
  }
  return Object.freeze(events.sort((a, b) => b.day - a.day || String(b.sentAt ?? "").localeCompare(String(a.sentAt ?? ""))));
}

function event(day, type, title, detail, severity) {
  return Object.freeze({ day, type, title, detail, severity });
}

function alertTitle(level) {
  if (level === "escalated") return "Drift alert escalated";
  if (level === "alert") return "Drift alert started";
  return "Early drift note";
}

function alertDetail(evaluation) {
  const count = evaluation?.alert?.driftingGroups;
  return `${count ?? "One or more"} health ${count === 1 ? "group is" : "groups are"} drifting from the astronaut's own normal.`;
}
