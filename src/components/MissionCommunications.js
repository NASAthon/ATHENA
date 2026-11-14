"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  CircleCheck,
  Clock3,
  Hourglass,
  Radio,
  Satellite,
  Send,
} from "lucide-react";
import { MISSION_MODES } from "@/data";
import { useMissionData } from "@/components/MissionDataProvider";
import {
  COMMUNICATION_CLOCK_KEY,
  COMMUNICATION_STATUSES,
  COMMUNICATION_SPEEDS,
  changeCommunicationSpeed,
  communicationDelay,
  communicationState,
  createCommunicationClock,
  createCommunicationMessage,
  formatCommunicationDuration,
  parseCommunicationClock,
  simulatedNow,
} from "@/lib/communications";
import { focusRing } from "@/lib/ui";

const modeName = Object.fromEntries(MISSION_MODES.map((m) => [m.id, m.name]));
const card = "rounded-xl border border-border bg-card p-3";
let fallbackId = 0;

const STATUS_ICON = {
  queued: Clock3,
  transmitting: Satellite,
  delivered: CheckCheck,
  awaiting: Hourglass,
  returning: Radio,
  received: CircleCheck,
};
const STATUS_ORDER = Object.values(COMMUNICATION_STATUSES);

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  fallbackId += 1;
  return `communication-${Date.now()}-${fallbackId}`;
}

function delayText(ms) {
  const seconds = ms / 1000;
  if (seconds < 1) return `${Math.round(ms)} ms`;
  if (seconds < 60) return `${seconds.toFixed(seconds % 1 === 0 ? 0 : 1)} s`;
  return `${Math.round(seconds / 60)} min`;
}

export default function MissionCommunications({ astronautId, astronautName, missionDay, missionModeId, report }) {
  const { db, status: dataStatus, version, saveCommunication, saveCommunicationClock } = useMissionData();
  const [clock, setClock] = useState(null);
  const [realNow, setRealNow] = useState(() => Date.now());
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) return;
    const initialise = window.setTimeout(() => {
      const now = Date.now();
      setRealNow(now);
      setClock(parseCommunicationClock(db.getMeta(COMMUNICATION_CLOCK_KEY), now));
    }, 0);
    return () => window.clearTimeout(initialise);
  }, [db]);

  useEffect(() => {
    const timer = window.setInterval(() => setRealNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const messages = useMemo(
    () => (db ? db.loadCommunications(astronautId) : []),
    // version changes after every persisted message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, astronautId, version],
  );
  const simNow = clock ? simulatedNow(clock, realNow) : realNow;
  const current = messages.find((message) => communicationState(message, simNow).status.id !== "received") ?? messages[0] ?? null;
  const currentState = current ? communicationState(current, simNow) : null;
  const delay = communicationDelay(missionModeId);

  async function changeSpeed(speed) {
    if (!clock) return;
    const now = Date.now();
    const next = changeCommunicationSpeed(clock, Number(speed), now);
    setClock(next);
    setRealNow(now);
    setError("");
    try {
      await saveCommunicationClock(next);
    } catch {
      setError("The new simulation speed is active for this session but could not be saved.");
    }
  }

  async function send() {
    if (!clock || dataStatus !== "ready") return;
    const now = Date.now();
    const anchored = changeCommunicationSpeed(clock, clock.speed, now);
    const message = createCommunicationMessage({
      id: makeId(),
      astronautId,
      missionModeId,
      missionDay,
      report,
      sentAt: new Date(now).toISOString(),
      sentSimMs: anchored.simulatedNowMs,
    });
    setClock(anchored);
    setRealNow(now);
    setNotice("Adding the report to the Earth-link queue…");
    setError("");
    try {
      await saveCommunication(message, anchored);
      setNotice("Report queued. ATHENA continues to provide onboard guidance while the signal travels.");
    } catch {
      setNotice("");
      setError("The simulated report could not be saved or queued. Try again.");
    }
  }

  return (
    <section className={`${card} mt-2`} aria-labelledby="communications-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="communications-heading" className="flex items-center gap-2 text-base font-bold">
            <Radio className="size-5" aria-hidden="true" /> Mission communications
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Offline simulation only. No report leaves this device and replies are not from a real flight surgeon.
          </p>
        </div>
        <button
          type="button"
          onClick={send}
          disabled={!clock || dataStatus !== "ready"}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${focusRing}`}
        >
          <Send className="size-5" aria-hidden="true" /> Send to Earth
        </button>
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(15rem,auto)]">
        <div className="rounded-lg border border-border p-3">
          <p className="font-semibold">Earth-link delay for this report</p>
          <p className="text-sm text-muted-foreground">
            {modeName[missionModeId]}: simulated {delayText(delay.milliseconds)} one way. Published range: {delay.sourceText}
            {delay.inferred ? " (lunar estimate)." : "."}
          </p>
        </div>
        <label className="rounded-lg border border-border p-3 font-semibold" htmlFor="communication-speed">
          Simulation speed
          <select
            id="communication-speed"
            value={clock?.speed ?? 720}
            onChange={(event) => changeSpeed(event.target.value)}
            disabled={!clock}
            className={`mt-1 min-h-11 w-full rounded-lg border border-input bg-input/30 px-3 font-normal ${focusRing}`}
          >
            {COMMUNICATION_SPEEDS.map((speed) => (
              <option key={speed.id} value={speed.multiplier} className="bg-popover text-popover-foreground">
                {speed.label} — {speed.multiplier}×
              </option>
            ))}
          </select>
        </label>
      </div>

      {current && currentState && (
        <CurrentTransmission message={current} state={currentState} speed={clock?.speed ?? 1} />
      )}

      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-muted-foreground">{notice}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="mt-2 border-t border-border pt-2">
        <h3 className="font-semibold">Communication history | {astronautName}</h3>
        {messages.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">No simulated reports sent for this astronaut.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {messages.map((message) => (
              <HistoryItem key={message.id} message={message} state={communicationState(message, simNow)} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function CurrentTransmission({ message, state, speed }) {
  const Icon = STATUS_ICON[state.status.id] ?? Radio;
  const remaining = formatCommunicationDuration(state.remainingSimMs, speed);
  const currentIndex = STATUS_ORDER.findIndex((item) => item.id === state.status.id);
  return (
    <div className="mt-2 rounded-lg border-2 border-primary p-3" role="status" aria-live="polite">
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {state.status.label}
      </div>
      <progress className="mt-2 h-3 w-full" max="100" value={Math.round(state.progress * 100)} aria-label={`Communication progress: ${Math.round(state.progress * 100)} percent`} />
      <p className="mt-1 text-sm text-muted-foreground">
        {state.status.id === "received" ? "Round trip complete." : `${remaining} remaining at ${speed}× simulation speed.`}
      </p>
      <ol className="mt-2 grid gap-1 text-xs sm:grid-cols-3" aria-label="Communication stages">
        {STATUS_ORDER.map((status, index) => {
          const stage = index < currentIndex ? "Complete" : index === currentIndex ? "Current" : "Waiting";
          const StageIcon = STATUS_ICON[status.id] ?? Radio;
          return (
            <li
              key={status.id}
              aria-current={stage === "Current" ? "step" : undefined}
              className="flex items-center gap-1.5 rounded border border-border px-2 py-1.5"
            >
              <StageIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{status.label} | {stage}</span>
            </li>
          );
        })}
      </ol>
      {state.status.id === "received" && (
        <div className="mt-2 rounded-lg border border-border bg-background p-3">
          <p className="font-semibold">Simulated flight-surgeon response</p>
          <p className="mt-1">{message.response.text}</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{message.response.simulationLabel}</p>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ message, state }) {
  const Icon = STATUS_ICON[state.status.id] ?? Radio;
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Day {message.missionDay} | {modeName[message.missionModeId] ?? message.missionModeId}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="size-4" aria-hidden="true" /> {state.status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Sent {new Date(message.sentAt).toLocaleString()} | {delayText(message.oneWayDelayMs)} simulated one-way delay
      </p>
      {state.status.id === "received" && (
        <p className="mt-2"><span className="font-semibold">Simulated response:</span> {message.response.text}</p>
      )}
      <details className="mt-2">
        <summary className={`min-h-11 cursor-pointer rounded py-2 font-medium ${focusRing}`}>Report snapshot</summary>
        <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap">{message.report.lines.join("\n")}</pre>
      </details>
    </li>
  );
}
