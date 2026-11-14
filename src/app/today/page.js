"use client";

// Today (design by Izabela, PR #20). Everything shown is the selected astronaut's STORED data
// evaluated by the logic engine: health score, alert level, red limits, per-indicator status
// against their OWN in-flight baseline, and what is still due today.

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleMinus,
  ClipboardList,
  Eye,
  Info,
  Minus,
  OctagonAlert,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import { INDICATORS, EMERGENCIES } from "@/data";
import { DRIFT_CUTOFF, ESCALATION_DAYS, SCORE_BANDS, SCORE_CAPS, dueMeasurements, hazardForIndicator, likelyHazards } from "@/lib/engine";
import { readingFor } from "@/lib/readings";
import { STATUSES } from "@/lib/regionStatus";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { focusRing } from "@/lib/ui";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));
const MAIN = ["sleep", "reaction", "mood", "heartRate", "bloodPressure", "glucose"];
const EXTRAS = ["temperature", "exercise", "spo2", "radiation"];
const ICONS = { CircleCheck, CircleMinus, Info, OctagonAlert, TrendingDown, MessageCircleWarning: TriangleAlert };

const card = "rounded-2xl border border-border bg-card p-6";

// Health score bands (src/lib/engine/healthScore.js): icon + colour token + label.
const BAND_STYLE = {
  good: { Icon: CircleCheck, colour: "var(--status-steady)" },
  watch: { Icon: Eye, colour: "var(--status-amber)" },
  alert: { Icon: TriangleAlert, colour: "var(--status-red)" },
  critical: { Icon: OctagonAlert, colour: "var(--status-red)" },
};

const CAP_REASON = {
  [SCORE_CAPS.redLimit]: "a red limit is active",
  [SCORE_CAPS.escalated]: "the drift alert has been escalated",
  [SCORE_CAPS.alert]: "a drift alert is active",
};

function StatusPill({ status, label }) {
  const s = STATUSES[status] ?? STATUSES.no_data;
  const Icon = ICONS[s.icon] ?? CircleMinus;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold"
      style={{ borderColor: s.colour, color: s.colour }}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label ?? s.label}
    </span>
  );
}

function IndicatorCard({ id, group, record, baselines }) {
  const { unit, value, normal } = readingFor(id, record, baselines);
  const readingOnly = id === "radiation";
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg text-muted-foreground">{byId[id].name}</h3>
        {readingOnly ? <StatusPill status="no_data" label="Reading only" /> : <StatusPill status={group?.status ?? "no_data"} />}
      </div>
      <p className="mt-3 text-4xl font-bold">
        {value ?? "—"} {value && <span className="text-xl font-normal text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-3 text-muted-foreground">
        {readingOnly
          ? "Running total from the onboard dosimeter"
          : normal
            ? `Your normal: ${normal} ${unit}`
            : "No baseline yet"}
        {!value && " · not measured today"}
      </p>
    </article>
  );
}

function Change({ value, label }) {
  if (value === null || value === undefined) return null;
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-4" aria-hidden="true" />
      {value > 0 ? `+${value}` : value} {label}
    </span>
  );
}

export default function Today() {
  const { state, today, member, evaluation, record, baselines } = useTodayEvaluation();

  if (state !== "ready") {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="text-4xl font-bold">{member.name} · today</h1>
        <p className="mt-4 text-lg text-muted-foreground">
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

  const { health, change, alert, groups, limitBreaches } = evaluation;
  const groupById = Object.fromEntries(groups.map((g) => [g.group, g]));
  const band = health.band ? BAND_STYLE[health.band] : null;
  const redLimits = limitBreaches.filter((b) => b.redLimit);
  const otherFlags = limitBreaches.filter((b) => !b.redLimit);
  const driftingIds = groups.filter((g) => g.status === "drifting").map((g) => g.group);
  const driftingNames = driftingIds.map((id) => byId[id]?.name ?? id);
  const hazards = likelyHazards(driftingIds);
  const due = dueMeasurements(record, today).map((id) => (id === "symptoms" ? "Symptoms" : byId[id]?.name ?? id));

  const alertTitle = {
    note: "One indicator is drifting from your normal",
    alert: `${alert.driftingGroups} indicators are drifting together`,
    escalated: "Drift alert not recovered: tell the crew and the ground",
  }[alert.level];
  const alertNext = {
    note: "Keep doing your daily check. One drifting indicator is a note, not an alert.",
    alert: `Follow the advice for each indicator below. If it hasn't recovered after ${ESCALATION_DAYS} more days, ATHENA will ask you to tell the crew and the ground.`,
    escalated: "Tell the crew and send the summary to the flight surgeon.",
  }[alert.level];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/crew" className={`rounded text-primary hover:underline ${focusRing}`}>
            Back to crew
          </Link>
          <h1 className="mt-2 text-4xl font-bold">
            {member.name} · today <span className="text-2xl font-normal text-muted-foreground">(mission day {today})</span>
          </h1>
        </div>
        <Link
          href="/daily-check"
          className={`flex min-h-14 items-center gap-2 rounded-xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90 ${focusRing}`}
        >
          <ClipboardList className="size-5" aria-hidden="true" />
          Start today&apos;s check
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className={card} aria-labelledby="score-heading">
          <p id="score-heading" className="text-sm uppercase tracking-wider text-muted-foreground">
            Health score
          </p>
          {health.score === null ? (
            <p className="mt-4 text-lg text-muted-foreground">Not enough data yet to score.</p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-8xl font-bold leading-none" style={{ color: band.colour }}>
                  {health.score}
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-lg font-semibold"
                  style={{ borderColor: band.colour, color: band.colour }}
                >
                  <band.Icon className="size-5" aria-hidden="true" />
                  {health.label}
                </span>
              </div>
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-lg">
                <Change value={change.sinceYesterday} label="since yesterday" />
                <Change value={change.over7Days} label="this week" />
              </p>
              {health.cappedAt !== null && (
                <p className="mt-4 text-muted-foreground">
                  Capped at {health.cappedAt} because {CAP_REASON[health.cappedAt] ?? "an alert is active"}.
                </p>
              )}
            </>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {SCORE_BANDS.map((b, i) => `${b.label} ${b.min}–${i === 0 ? 100 : SCORE_BANDS[i - 1].min - 1}`).join(" · ")}
          </p>
        </section>

        {redLimits.length > 0 ? (
          <section aria-labelledby="alert-title" className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-red)" }}>
            <p className="flex items-center gap-2 font-bold uppercase tracking-wider" style={{ color: "var(--status-red)" }}>
              <OctagonAlert className="size-5" aria-hidden="true" />
              Red limit · today
            </p>
            <h2 id="alert-title" className="mt-3 text-3xl font-bold">
              Act now
            </h2>
            <ul className="mt-3 space-y-4">
              {redLimits.map((r) => (
                <li key={r.indicatorId}>
                  <p className="text-lg font-semibold">
                    {byId[r.indicatorId].name}: {r.label}
                  </p>
                  <p className="mt-1">{r.action}</p>
                  {r.emergencyId && (
                    <Link
                      href={`/emergency?id=${r.emergencyId}`}
                      className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                    >
                      <TriangleAlert className="size-4" aria-hidden="true" />
                      Open: {emergencyName[r.emergencyId]}
                    </Link>
                  )}
                  {r.basisLabel && <p className="mt-2 text-sm text-muted-foreground">{r.basisLabel}</p>}
                </li>
              ))}
            </ul>
          </section>
        ) : alert.level !== "none" ? (
          <section aria-labelledby="alert-title" className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-amber)" }}>
            <p className="flex items-center gap-2 font-bold uppercase tracking-wider" style={{ color: "var(--status-amber)" }}>
              <TriangleAlert className="size-5" aria-hidden="true" />
              {alert.level === "note" ? "Note" : alert.level === "escalated" ? "Escalated alert" : "Drift alert"}
              {alert.alertSince !== null && ` · since day ${alert.alertSince}`}
            </p>
            <h2 id="alert-title" className="mt-3 text-3xl font-bold">
              {alertTitle}
            </h2>
            <p className="mt-3 text-lg">Drifting: {driftingNames.join(", ")}.</p>
            {hazards.length > 0 && (
              <div className="mt-2 text-lg">
                <p>
                  Likely hazard: <span className="font-semibold">{hazards[0].name}</span>
                  {hazards.length > 1 && <span className="text-muted-foreground"> (also {hazards.slice(1).map((h) => h.name).join(", ")})</span>}
                </p>
                <ul className="mt-1 list-disc pl-5 text-base text-muted-foreground">
                  {hazards[0].indicatorIds.map((id) => (
                    <li key={id}>
                      {byId[id]?.name}: {hazardForIndicator(id)?.effect}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-sm text-muted-foreground">
                  ATHENA&apos;s interpretation of the NASA hazard page, not a diagnosis.
                </p>
              </div>
            )}
            <p className="mt-2 text-lg">{alertNext}</p>
            <details className="mt-5 border-t border-border pt-4">
              <summary className={`flex min-h-11 cursor-pointer items-center rounded text-lg font-semibold ${focusRing}`}>
                Why this alert?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Your 7-day average for {driftingNames.join(" and ")} has moved outside your own in-flight normal (drift score{" "}
                {DRIFT_CUTOFF} or more in the worrying direction). One drifting indicator is a note; two or more together are
                an alert; no recovery after {ESCALATION_DAYS} more days means telling the crew and the ground. This compares
                you with yourself, not with Earth ranges.
              </p>
            </details>
          </section>
        ) : (
          <section aria-labelledby="alert-title" className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-steady)" }}>
            <p className="flex items-center gap-2 font-bold uppercase tracking-wider" style={{ color: "var(--status-steady)" }}>
              <CircleCheck className="size-5" aria-hidden="true" />
              No alerts
            </p>
            <h2 id="alert-title" className="mt-3 text-3xl font-bold">
              Everything is inside your own normal
            </h2>
          </section>
        )}
      </div>

      {(otherFlags.length > 0 || due.length > 0) && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {otherFlags.length > 0 && (
            <section className={card} aria-labelledby="flags-heading">
              <h2 id="flags-heading" className="text-xl font-bold">
                Today&apos;s readings to watch
              </h2>
              <ul className="mt-3 space-y-3">
                {otherFlags.map((r) => (
                  <li key={r.indicatorId}>
                    <p className="font-semibold">
                      {byId[r.indicatorId].name}: {r.label}
                    </p>
                    <p className="text-muted-foreground">{r.action}</p>
                    <p className="text-sm text-muted-foreground">{r.basisLabel}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {due.length > 0 && (
            <section className={card} aria-labelledby="due-heading">
              <h2 id="due-heading" className="text-xl font-bold">
                Still due today
              </h2>
              <p className="mt-2 text-muted-foreground">{due.join(", ")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/reaction-test" className={`inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
                  Reaction test
                </Link>
                <Link href="/daily-check" className={`inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
                  Daily check
                </Link>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold">Indicators today</h2>
        <p className="text-muted-foreground">Status compares your 7-day average with your own in-flight normal, not Earth ranges</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {MAIN.map((id) => (
          <IndicatorCard key={id} id={id} group={groupById[id]} record={record} baselines={baselines} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {EXTRAS.map((id) => (
          <IndicatorCard key={id} id={id} group={groupById[id]} record={record} baselines={baselines} />
        ))}
      </div>

      <p className="mt-6 text-muted-foreground">Demo mission: all data on this screen is simulated. Not medical advice.</p>
    </main>
  );
}
