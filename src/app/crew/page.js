"use client";

// Crew status (design and layout by the team, PR #23). Every number and sentence comes from the
// astronauts' STORED data evaluated by the logic engine; nothing is hard-coded (AGENTS.md: no health text or
// numbers in components). Demo controls are the real Load demo mission / Reset data panel.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, CircleCheck, Eye, FlaskConical, Minus, OctagonAlert, TriangleAlert } from "lucide-react";
import { EMERGENCIES, INDICATORS } from "@/data";
import { SCORE_CAPS } from "@/lib/engine";
import { CREW } from "@/lib/crew";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { useMissionMode } from "@/components/MissionModeProvider";
import { evaluateStored } from "@/components/useTodayEvaluation";
import MissionDataPanel from "@/components/MissionDataPanel";
import { focusRing } from "@/lib/ui";

const nameOf = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));

// Health score bands (src/lib/engine/healthScore.js): colour token + icon + text label.
const BAND_STYLE = {
  good: { Icon: CircleCheck, colour: "var(--status-steady)" },
  watch: { Icon: Eye, colour: "var(--status-amber)" },
  alert: { Icon: TriangleAlert, colour: "var(--status-orange)" },
  critical: { Icon: OctagonAlert, colour: "var(--status-red)" },
};
const NO_SCORE = { Icon: Minus, colour: "var(--status-nodata)" };

/** One plain-English line about an astronaut's status, and where their button goes. */
function describe(member, evaluation) {
  const firstName = member.name.split(" ").pop();
  const red = evaluation.limitBreaches.filter((b) => b.redLimit);
  if (red.length > 0) {
    const emergencyId = red.find((r) => r.emergencyId)?.emergencyId;
    return {
      text: `Red limit today: ${red.map((r) => `${nameOf[r.indicatorId]} ${r.label.toLowerCase()} (${Object.values(r.values).join("/")})`).join("; ")}.`,
      href: emergencyId ? `/emergency?id=${emergencyId}` : "/today",
      button: emergencyId ? `Open: ${emergencyName[emergencyId]}` : `Open ${firstName}`,
      urgent: true,
    };
  }
  const drifting = evaluation.groups.filter((g) => g.status === "drifting").map((g) => nameOf[g.group] ?? g.group);
  const { level, alertSince } = evaluation.alert;
  const capped = evaluation.health.cappedAt;
  const cap =
    capped === SCORE_CAPS.escalated
      ? ` Score capped at ${capped} because the alert has been escalated.`
      : capped === SCORE_CAPS.alert
        ? ` Score capped at ${capped} while the alert is active.`
        : "";
  const text =
    level === "escalated" || level === "alert"
      ? `${drifting.join(", ")} drifting from their own normal since day ${alertSince}.${cap}`
      : level === "note"
        ? `${drifting.join(", ")} drifting from their own normal. One indicator is a note, not an alert.`
        : "All tracked indicators inside their own normal. No alerts.";
  return { text, href: "/today", button: `Open ${firstName}`, urgent: false };
}

function CrewCard({ member, result, onOpen }) {
  if (result.state !== "ready" || !result.evaluation) {
    return (
      <article className="flex flex-col rounded-3xl border border-border bg-card p-3">
        <h2 className="text-base font-bold">{member.name}</h2>
        <p className="text-muted-foreground">{member.role}</p>
        <p className="mt-2 flex-1 text-base text-muted-foreground">No data stored yet. Load the demo mission below.</p>
      </article>
    );
  }
  const { health, change } = result.evaluation;
  const band = health.band ? BAND_STYLE[health.band] : NO_SCORE;
  const info = describe(member, result.evaluation);
  const week = change.over7Days;
  const WeekIcon = week === null || week === 0 ? Minus : week < 0 ? ArrowDown : ArrowUp;
  return (
    <article className="flex flex-col rounded-3xl border-2 bg-card p-3" style={{ borderColor: health.band === "good" ? "var(--border)" : band.colour }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold">{member.name}</h2>
          <p className="text-muted-foreground">{member.role}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold" style={{ borderColor: band.colour, color: band.colour }}>
          <band.Icon className="size-4" aria-hidden="true" />
          {health.label ?? "No score"}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-7xl font-bold leading-none 2xl:text-8xl" style={{ color: band.colour }}>
          {health.score ?? "—"}
        </span>
        <div>
          <p className="text-muted-foreground">health score / 100</p>
          <p className="mt-1 inline-flex items-center gap-1">
            <WeekIcon className="size-4" aria-hidden="true" />
            {week === null ? "no change data yet" : week === 0 ? "no change this week" : `${Math.abs(week)} ${week < 0 ? "down" : "up"} this week`}
          </p>
        </div>
      </div>
      <p className="mt-2 flex-1 text-base">{info.text}</p>
      <Link
        href={info.href}
        onClick={onOpen}
        className={`mt-2 flex min-h-11 items-center justify-center rounded-xl px-4 text-center text-base font-semibold ${focusRing} ${
          info.urgent ? "bg-destructive text-background hover:bg-destructive/90" : "border border-input hover:bg-accent"
        }`}
      >
        {info.button}
      </Link>
    </article>
  );
}

export default function Crew() {
  const { setCrewId } = useCrew();
  const { db, status, today, version } = useMissionData();
  const { mode } = useMissionMode();

  const results = useMemo(
    () => (db && today !== null ? Object.fromEntries(CREW.map((m) => [m.id, evaluateStored(db, m.id, today)])) : null),
    // version changes after every save, so everything is recalculated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, today, version],
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
      <h1 className="text-xl font-bold">Crew status</h1>
      <p className="mt-2 text-base text-muted-foreground">
        {mode.name}
        {today !== null && ` | Day ${today}`} | each score compares the astronaut with their own normal | simulated demo mission
      </p>

      {status === "loading" ? (
        <p className="mt-2 text-base text-muted-foreground">Opening the mission data…</p>
      ) : (
        <div className="mt-2 grid auto-rows-fr gap-2 lg:grid-cols-3">
          {CREW.map((m) => (
            <CrewCard key={m.id} member={m} result={results?.[m.id] ?? { state: "empty" }} onOpen={() => setCrewId(m.id)} />
          ))}
        </div>
      )}

      <details className="mt-2 rounded-xl border border-dashed border-border p-3">
        <summary className={`flex min-h-11 cursor-pointer items-center font-bold ${focusRing}`}>
          Demo and backup controls
        </summary>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">
              Demo controls
            </h2>
            <p className="text-muted-foreground">All crew data is simulated. Reload the demo mission, clear it, or try events in the Scenario Lab.</p>
          </div>
          <Link href="/scenario-lab" className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-input px-4 hover:bg-accent ${focusRing}`}>
            <FlaskConical className="size-5" aria-hidden="true" /> Scenario Lab
          </Link>
        </div>
        <div className="mt-2">
          <MissionDataPanel />
        </div>
      </details>
    </main>
  );
}
