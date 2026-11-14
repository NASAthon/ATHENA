"use client";

// One-page flight-surgeon summary (CHECKLIST §3 › Calendar, summary, extras) for the astronaut
// selected in the header. Built by the engine's buildSurgeonSummary (src/lib/engine/summary.js)
// from today's evaluation of STORED data; the reply time comes from the mission mode's sourced
// Earth-link delay (header switch). The plain-text version can be copied to send to the ground.

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Copy, OctagonAlert, Radio, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import { DRIFT_INDICATORS, buildSurgeonSummary, driftKeyName, earthLink, likelyHazards } from "@/lib/engine";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { useMissionMode } from "@/components/MissionModeProvider";
import { focusRing } from "@/lib/ui";

const nameOf = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const groupOf = Object.fromEntries(DRIFT_INDICATORS.map((d) => [d.key, d.group]));

const card = "rounded-xl border border-border bg-card p-4";
const ALERT_TEXT = {
  none: "No alert",
  note: "Note: one indicator drifting",
  alert: "Drift alert: two or more indicators drifting",
  escalated: "Escalated: drift alert not recovered after 14 days",
};

export default function SummaryPage() {
  const { state, today, member, evaluation } = useTodayEvaluation();
  const { modeId, mode } = useMissionMode();
  const [copied, setCopied] = useState(null);

  if (state !== "ready" || !evaluation) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <h1 className="text-3xl font-bold">Flight-surgeon summary</h1>
        <p className="mt-4 text-base text-muted-foreground">
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

  const summary = buildSurgeonSummary({ astronaut: member.name, evaluation, missionModeId: modeId });
  const link = earthLink(modeId);
  const hazards = likelyHazards([...new Set(summary.drifting.map((d) => groupOf[d.key]))]);
  const red = summary.limitBreaches.filter((b) => b.level === "urgent");
  const urgent = red.length > 0 || summary.alertLevel === "escalated";
  const statusColour = red.length > 0 ? "var(--status-red)" : summary.alertLevel === "none" ? "var(--status-steady)" : "var(--status-amber)";
  const StatusIcon = red.length > 0 ? OctagonAlert : summary.alertLevel === "none" ? CircleCheck : TriangleAlert;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary.lines.join("\n"));
      setCopied("Copied. Paste it into the message to the ground.");
    } catch {
      setCopied("Couldn't copy automatically. Select the text below and copy it.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
      <h1 className="text-3xl font-bold">Flight-surgeon summary</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {member.name} · mission day {today} · {mode.name}. One page for the flight surgeon on the ground.
      </p>

      <section aria-labelledby="reply-heading" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border-2 p-4" style={{ borderColor: urgent ? "var(--status-red)" : "var(--border)" }}>
        <Radio className="size-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h2 id="reply-heading" className="text-lg font-bold">
            {summary.replyText ? `Reply expected ${summary.replyText}` : "Reply time unknown"}
          </h2>
          <p className="text-muted-foreground">
            {link ? `Earth link: ${link.text}${link.inferred ? " (lunar estimate)" : ""}. ` : ""}
            {urgent ? "Don't wait for the reply to act: follow the emergency guide or the advice on Today now." : "Send the summary, then carry on with the daily routine."}
          </p>
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className={card} aria-labelledby="status-heading">
          <h2 id="status-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Status today
          </h2>
          <p className="mt-3 text-4xl font-bold">
            {summary.score ?? "—"}
            <span className="ml-2 text-lg font-normal text-muted-foreground">/ 100 health score</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-base font-semibold" style={{ color: statusColour }}>
            <StatusIcon className="size-5" aria-hidden="true" />
            {ALERT_TEXT[summary.alertLevel] ?? summary.alertLevel}
            {summary.alertSince !== null && ` · since day ${summary.alertSince}`}
          </p>
          <p className="mt-2 text-muted-foreground">
            {summary.change.sinceYesterday !== null && `${summary.change.sinceYesterday > 0 ? "+" : ""}${summary.change.sinceYesterday} since yesterday`}
            {summary.change.over7Days !== null && ` · ${summary.change.over7Days > 0 ? "+" : ""}${summary.change.over7Days} over 7 days`}
          </p>
        </section>

        <section className={card} aria-labelledby="drift-heading">
          <h2 id="drift-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Drifting from own in-flight normal
          </h2>
          {summary.drifting.length === 0 ? (
            <p className="mt-3 text-base">None</p>
          ) : (
            <ul className="mt-3 space-y-1 text-base">
              {summary.drifting.map((d) => (
                <li key={d.key}>
                  {driftKeyName(d.key)} <span className="text-muted-foreground">(drift score {d.worryingZ?.toFixed(1)})</span>
                </li>
              ))}
            </ul>
          )}
          {hazards.length > 0 && (
            <p className="mt-3 text-muted-foreground">
              Likely hazard: {hazards.map((h) => h.name).join(", ")} (ATHENA&apos;s interpretation of the NASA hazard pages, not a diagnosis).
            </p>
          )}
        </section>
      </div>

      {summary.limitBreaches.length > 0 && (
        <section className={`${card} mt-4`} aria-labelledby="readings-heading">
          <h2 id="readings-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Today&apos;s readings outside the reference range
          </h2>
          <ul className="mt-3 space-y-4">
            {summary.limitBreaches.map((b) => (
              <li key={`${b.indicatorId}-${b.label}`}>
                <p className="flex items-center gap-2 text-base font-semibold" style={{ color: b.level === "urgent" ? "var(--status-red)" : "var(--status-amber)" }}>
                  {b.level === "urgent" ? <OctagonAlert className="size-5" aria-hidden="true" /> : <TriangleAlert className="size-5" aria-hidden="true" />}
                  {nameOf[b.indicatorId] ?? b.indicatorId}: {b.label} · {Object.values(b.values).join(" / ")}
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

      <section className={`${card} mt-4`} aria-labelledby="message-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="message-heading" className="text-lg font-bold">
            Message to send
          </h2>
          <button
            type="button"
            onClick={copy}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 ${focusRing}`}
          >
            <Copy className="size-5" aria-hidden="true" />
            Copy text
          </button>
        </div>
        <p role="status" className="mt-2 text-muted-foreground">
          {copied}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-4 text-sm whitespace-pre-wrap">{summary.lines.join("\n")}</pre>
      </section>

      <p className="mt-4 text-muted-foreground">Demo mission: all data on this screen is simulated. Not medical advice.</p>
    </main>
  );
}
