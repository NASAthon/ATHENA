"use client";

// One-page flight-surgeon summary (CHECKLIST §3 › Calendar, summary, extras) for the astronaut
// selected in the header. Built by the engine's buildSurgeonSummary (src/lib/engine/summary.js)
// from today's evaluation of STORED data; the reply time comes from the mission mode's sourced
// Earth-link delay (header switch). "Send to Earth" sends the plain-text version to the ground
// (simulated in the demo: ATHENA has no real link to Earth).

import Link from "next/link";
import { CircleCheck, OctagonAlert, Radio, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import { DRIFT_INDICATORS, IN_FLIGHT_WINDOW, buildSurgeonSummary, driftKeyName, earthLink, evaluateMission, likelyHazards } from "@/lib/engine";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { useMissionMode } from "@/components/MissionModeProvider";
import MissionCommunications from "@/components/MissionCommunications";
import { useLive } from "@/components/LiveProvider";
import { useCrew } from "@/components/CrewProvider";
import { LIVE_STYLE, LiveStateBadge } from "@/components/LiveUI";
import { timeText } from "@/lib/live/stream";
import { focusRing } from "@/lib/ui";

const nameOf = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const groupOf = Object.fromEntries(DRIFT_INDICATORS.map((d) => [d.key, d.group]));

const card = "rounded-xl border border-border bg-card p-3";
const ALERT_TEXT = {
  none: "No alert",
  note: "Note: one indicator drifting",
  alert: "Drift alert: two or more indicators drifting",
  escalated: "Escalated: drift alert not recovered after 14 days",
};

export default function SummaryPage() {
  const { state, today, member, evaluation, records, baselines } = useTodayEvaluation();
  const { modeId, mode } = useMissionMode();
  const live = useLive();
  const { crewId } = useCrew();
  const snap = live.active && live.day === today ? live.crew[crewId] : null;
  if (state !== "ready" || !evaluation) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
        <h1 className="text-xl font-bold">Flight-surgeon summary</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {state === "loading" ? (
            "Opening the mission data…"
          ) : (
            <>
              No mission data stored yet. Load the demo mission on the{" "}
              <Link href="/crew" className={`rounded text-primary underline ${focusRing}`}>
                Crew page
              </Link>
              .
            </>
          )}
        </p>
      </main>
    );
  }

  const base = buildSurgeonSummary({ astronaut: member.name, evaluation, missionModeId: modeId });
  // What the live feed has flagged today (not routine "back to normal" or exercise notes), newest first.
  const liveFlags = snap ? snap.events.filter((e) => ["deteriorating", "critical", "no_data"].includes(e.state)).slice(-6).reverse() : [];
  const summary = snap
    ? {
        ...base,
        lines: [
          ...base.lines,
          "",
          `Live sensor feed (simulated), ${timeText(snap.minute)}: ${LIVE_STYLE[snap.overall]?.label ?? snap.overall} | confidence ${snap.confidence.level} | ${snap.sensor}`,
          ...(liveFlags.length ? liveFlags.map((e) => `- ${timeText(e.minute)} ${e.text}`) : ["- Nothing flagged today"]),
        ],
      }
    : base;
  const link = earthLink(modeId);
  const hazards = likelyHazards([...new Set(summary.drifting.map((d) => groupOf[d.key]))]);
  const red = summary.limitBreaches.filter((b) => b.level === "urgent");
  const urgent = red.length > 0 || summary.alertLevel === "escalated";
  const statusColour = red.length > 0 ? "var(--status-red)" : summary.alertLevel === "none" ? "var(--status-steady)" : "var(--status-amber)";
  const StatusIcon = red.length > 0 ? OctagonAlert : summary.alertLevel === "none" ? CircleCheck : TriangleAlert;
  const evaluations = evaluateMission(records, baselines, Math.min(IN_FLIGHT_WINDOW.toDay + 1, today), today);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
      <h1 className="text-xl font-bold">Flight-surgeon summary</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {member.name} | Day {today} | {mode.name}. One page for the flight surgeon on the ground.
      </p>

      <section aria-labelledby="reply-heading" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border-2 p-3" style={{ borderColor: urgent ? "var(--status-red)" : "var(--border)" }}>
        <Radio className="size-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h2 id="reply-heading" className="text-base font-bold">
            {summary.replyText ? `Reply expected ${summary.replyText}` : "Reply time unknown"}
          </h2>
          <p className="text-muted-foreground">
            {link ? `Earth link: ${link.text}${link.inferred ? " (lunar estimate)" : ""}. ` : ""}
            {urgent ? "Don't wait for the reply to act: follow the emergency guide or the advice on Today now." : "Send the summary, then carry on with the daily routine."}
          </p>
        </div>
      </section>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <section className={card} aria-labelledby="status-heading">
          <h2 id="status-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Status today
          </h2>
          <p className="mt-2 text-2xl font-bold">
            {summary.score ?? "—"}
            <span className="ml-2 text-base font-normal text-muted-foreground">/ 100 health score</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold" style={{ color: statusColour }}>
            <StatusIcon className="size-5" aria-hidden="true" />
            {ALERT_TEXT[summary.alertLevel] ?? summary.alertLevel}
            {summary.alertSince !== null && ` | since day ${summary.alertSince}`}
          </p>
          <p className="mt-2 text-muted-foreground">
            {summary.change.sinceYesterday !== null && `${summary.change.sinceYesterday > 0 ? "+" : ""}${summary.change.sinceYesterday} since yesterday`}
            {summary.change.over7Days !== null && ` | ${summary.change.over7Days > 0 ? "+" : ""}${summary.change.over7Days} over 7 days`}
          </p>
        </section>

        <section className={card} aria-labelledby="drift-heading">
          <h2 id="drift-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Drifting from own in-flight normal
          </h2>
          {summary.drifting.length === 0 ? (
            <p className="mt-2 text-base">None</p>
          ) : (
            <ul className="mt-2 space-y-1 text-base">
              {summary.drifting.map((d) => (
                <li key={d.key}>
                  {driftKeyName(d.key)} <span className="text-muted-foreground">(drift score {d.worryingZ?.toFixed(1)})</span>
                </li>
              ))}
            </ul>
          )}
          {hazards.length > 0 && (
            <p className="mt-2 text-muted-foreground">
              Likely hazard: {hazards.map((h) => h.name).join(", ")} (ATHENA&apos;s interpretation of the NASA hazard pages, not a diagnosis).
            </p>
          )}
        </section>
      </div>

      {snap && (
        <section className={`${card} mt-2`} aria-labelledby="live-heading">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="live-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
              Live sensor feed today | {timeText(snap.minute)}
            </h2>
            <LiveStateBadge state={snap.overall} size="sm" />
            <span className="text-sm text-muted-foreground">
              Confidence {snap.confidence.level.toLowerCase()} | {snap.sensor} | simulated
            </span>
          </div>
          {liveFlags.length === 0 ? (
            <p className="mt-2">Nothing flagged by the live feed today.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {liveFlags.map((e) => (
                <li key={`${e.minute}-${e.text}`} className="flex flex-wrap items-center gap-2">
                  <span className="w-12 font-semibold tabular-nums">{timeText(e.minute)}</span>
                  <LiveStateBadge state={e.state} size="sm" />
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/live" className={`mt-2 inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
            Open the Live Monitor
          </Link>
        </section>
      )}

      {summary.limitBreaches.length > 0 && (
        <section className={`${card} mt-2`} aria-labelledby="readings-heading">
          <h2 id="readings-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Today&apos;s readings outside the reference range
          </h2>
          <ul className="mt-2 space-y-2">
            {summary.limitBreaches.map((b) => (
              <li key={`${b.indicatorId}-${b.label}`}>
                <p className="flex items-center gap-2 text-base font-semibold" style={{ color: b.level === "urgent" ? "var(--status-red)" : "var(--status-amber)" }}>
                  {b.level === "urgent" ? <OctagonAlert className="size-5" aria-hidden="true" /> : <TriangleAlert className="size-5" aria-hidden="true" />}
                  {nameOf[b.indicatorId] ?? b.indicatorId}: {b.label} | {Object.values(b.values).join(" / ")}
                </p>
                <p className="mt-1">{b.action}</p>
                <p className="text-sm text-muted-foreground">
                  {b.basisLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className={`${card} mt-2`}>
        <summary className={`flex min-h-11 cursor-pointer items-center font-bold ${focusRing}`}>
          Current report snapshot
        </summary>
        <p className="mt-1 text-sm text-muted-foreground">Sending stores this exact report. Later health changes do not alter message history.</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap">{summary.lines.join("\n")}</pre>
      </details>

      <MissionCommunications
        astronautId={member.id}
        astronautName={member.name}
        missionDay={today}
        missionModeId={modeId}
        report={summary}
        evaluations={evaluations}
      />

      <p className="mt-2 text-muted-foreground">Demo mission: all data on this screen is simulated. Not medical advice.</p>
    </main>
  );
}
