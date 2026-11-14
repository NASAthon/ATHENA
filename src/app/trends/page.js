"use client";

// Trends (CHECKLIST §3 › Trends; team design, 14 Nov). For the astronaut selected in the header:
// - one chart per indicator across the mission: 7-day average, pre-flight and in-flight normal
//   bands, the baseline window and drifting periods (TrendChart, numbers from src/lib/engine/trends.js);
// - a day slider to move through the stored mission (demo fast-forward);
// - "ATHENA vs one-size-fits-all": the engine's personal-baseline status next to the general
//   clinical band for the same day's reading, which is how a slow decline "stays green";
// - what helps (each indicator's NASA countermeasures) and when to tell the ground.
// Everything comes from stored data and the engine; nothing is hard-coded here.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleMinus, Info, OctagonAlert, Radio, TrendingDown, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import {
  DAY_KEY,
  DRIFT_INDICATORS,
  ESCALATION_DAYS,
  adviceForMode,
  classifyIndicator,
  driftBand,
  driftKeyName,
  driftPeriods,
  evaluateMission,
  trendSeries,
} from "@/lib/engine";
import { STATUSES } from "@/lib/regionStatus";
import { formatValue, unitOf } from "@/lib/readings";
import { MISSION_DAYS } from "@/lib/sim/simulator";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { useMissionMode } from "@/components/MissionModeProvider";
import TrendChart from "@/components/TrendChart";
import { focusRing } from "@/lib/ui";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const ICONS = { CircleCheck, CircleMinus, Info, OctagonAlert, TrendingDown, MessageCircleWarning: TriangleAlert };
// Groups in the order of the design: the ones that show slow decline first.
const ORDER = ["sleep", "reaction", "mood", "heartRate", "bloodPressure", "glucose", "temperature", "exercise", "spo2"];
const GROUPS = ORDER.map((id) => ({ id, keys: DRIFT_INDICATORS.filter((d) => d.group === id).map((d) => d.key) })).filter((g) => g.keys.length);
const card = "rounded-2xl border border-border bg-card p-6";
const GENERIC_LABEL = { normal: "Normal", watch: "Watch", act: "Act", urgent: "Red limit" };

function StatusPill({ status }) {
  const s = STATUSES[status] ?? STATUSES.no_data;
  const Icon = ICONS[s.icon] ?? CircleMinus;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold" style={{ borderColor: s.colour, color: s.colour }}>
      <Icon className="size-4" aria-hidden="true" />
      {s.label}
    </span>
  );
}

/** One value of a drift-tracked field for display: lapses get one decimal, the rest use their indicator's unit. */
const fmtKey = (key, groupId, v) => (key === "reactionLapses" ? (Number.isFinite(v) ? String(Math.round(v * 10) / 10) : "—") : formatValue(groupId, v));

/** Start of the current drifting run that includes `day`, or null. */
function driftingSince(periods, day) {
  return periods.find((p) => p.fromDay <= day && p.toDay >= day)?.fromDay ?? null;
}

export default function Trends() {
  const { state, today, member, records, baselines } = useTodayEvaluation();
  const { modeId } = useMissionMode();
  const [picked, setPicked] = useState({ day: null, filter: null });

  // The whole stored mission, evaluated once per astronaut (and after every save).
  const evaluations = useMemo(
    () => (state === "ready" && today >= 1 ? evaluateMission(records, baselines, 1, today) : []),
    [state, records, baselines, today],
  );

  // Series, drifting periods and bands depend only on the stored data, so they're worked out once,
  // not on every slider step.
  const charts = useMemo(
    () =>
      Object.fromEntries(
        GROUPS.flatMap((g) => g.keys).map((key) => {
          const series = trendSeries(evaluations, key);
          return [
            key,
            {
              series,
              periods: driftPeriods(series),
              preBand: driftBand(baselines?.preflight?.indicators?.[key], key),
              inBand: driftBand(baselines?.inflight?.indicators?.[key], key),
            },
          ];
        }),
      ),
    [evaluations, baselines],
  );

  if (state !== "ready" || evaluations.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="text-4xl font-bold">Trends</h1>
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

  const day = Math.min(Math.max(picked.day ?? today, 1), today);
  const evaluation = evaluations[day - 1];
  const lastDay = Math.max(MISSION_DAYS.toDay, today);

  const groupStatus = Object.fromEntries(evaluation.groups.map((g) => [g.group, g.status]));
  const drifting = GROUPS.filter((g) => groupStatus[g.id] === "drifting");
  const filter = picked.filter ?? (drifting.length > 0 ? "drifting" : "all");
  const visible = filter === "drifting" ? drifting : filter === "all" ? GROUPS : GROUPS.filter((g) => g.id === filter);
  const setFilter = (f) => setPicked((p) => ({ ...p, filter: f }));

  // ATHENA (own baseline) vs a one-size-fits-all band, for the selected day's reading.
  const record = records.find((r) => r[DAY_KEY] === day) ?? null;
  const history = records.filter((r) => r[DAY_KEY] < day && r[DAY_KEY] >= day - 7);
  const comparison = GROUPS.map((g) => {
    const generic = record ? classifyIndicator(g.id, record, history) : null;
    const hasBands = (byId[g.id]?.bands ?? []).some((b) => b.check);
    const genericText = !hasBands ? "No fixed range" : generic ? (GENERIC_LABEL[generic.level] ?? generic.level) + (generic.level === "normal" ? "" : `: ${generic.label}`) : "Not measured";
    const missed = groupStatus[g.id] === "drifting" && (!hasBands || generic?.level === "normal");
    return { id: g.id, status: groupStatus[g.id] ?? "no_data", genericText, missed };
  });

  const { level, alertSince } = evaluation.alert;
  const link = adviceForMode(modeId).earthLink;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0 flex-[1_1_480px]">
          <h1 className="text-4xl font-bold">
            Trends <span className="text-2xl font-normal text-muted-foreground">· {member.name}</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Each line is the 7-day average. The gap between the two bands is expected adaptation to space; leaving the blue
            in-flight band in the worrying direction is drift. Simulated demo mission.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <label htmlFor="trend-day" className="block font-semibold">
            Mission day {day} <span className="font-normal text-muted-foreground">(drag to move through the mission)</span>
          </label>
          <input
            id="trend-day"
            type="range"
            min={1}
            max={today}
            value={day}
            onChange={(e) => setPicked((p) => ({ ...p, day: Number(e.target.value) }))}
            className={`mt-3 h-11 w-full cursor-pointer accent-primary ${focusRing}`}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>day 1</span>
            <span>today, day {today}</span>
          </div>
        </div>
      </div>

      <div role="group" aria-label="Show indicators" className="mt-6 flex flex-wrap gap-2">
        {[{ id: "drifting", label: `Drifting (${drifting.length})` }, ...GROUPS.map((g) => ({ id: g.id, label: byId[g.id]?.name ?? g.id })), { id: "all", label: "All" }].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
            className={`min-h-12 rounded-full border px-4 ${focusRing} ${filter === c.id ? "border-primary bg-accent font-semibold" : "border-input hover:bg-accent/60"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          {visible.length === 0 && (
            <section className={card}>
              <p className="flex items-center gap-2 text-lg">
                <CircleCheck className="size-5" aria-hidden="true" style={{ color: "var(--status-steady)" }} />
                Nothing is drifting on day {day}. Choose an indicator or All to see the charts.
              </p>
            </section>
          )}
          {visible.map((g) => {
            const status = groupStatus[g.id] ?? "no_data";
            return (
              <section key={g.id} className={card} aria-labelledby={`trend-${g.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 id={`trend-${g.id}`} className="text-2xl font-bold">
                    {byId[g.id]?.name ?? g.id}
                  </h2>
                  <StatusPill status={status} />
                </div>
                {g.keys.map((key) => {
                  const c = charts[key];
                  const point = c.series[day - 1];
                  const since = driftingSince(c.periods, day);
                  const unit = key === "reactionLapses" ? "lapses" : unitOf(g.id);
                  const fmt = (v) => fmtKey(key, g.id, v);
                  const normal = c.inBand ? `${fmt(c.inBand.mean)} ${unit}` : "not set yet";
                  const summary = `${point?.average != null ? `${fmt(point.average)} ${unit}` : "no 7-day average"} on day ${day} · your normal ${normal}${since ? ` · drifting since day ${since}` : ""}`;
                  return (
                    <div key={key} className="mt-4">
                      {g.keys.length > 1 && <h3 className="font-semibold">{driftKeyName(key)}</h3>}
                      <p className="mt-1" style={since ? { color: "var(--status-amber)" } : undefined}>
                        {since && <TrendingDown className="mr-1 inline size-4 align-text-bottom" aria-hidden="true" />}
                        {summary}
                      </p>
                      <div className="mt-2">
                        <TrendChart
                          title={driftKeyName(key)}
                          series={c.series}
                          selectedDay={day}
                          lastDay={lastDay}
                          preBand={c.preBand}
                          inBand={c.inBand}
                          periods={c.periods}
                          format={(v) => fmt(v)}
                          summary={summary}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>

        <aside className="space-y-6">
          <section className={card} aria-labelledby="compare-heading">
            <h2 id="compare-heading" className="text-xl font-bold">
              ATHENA vs one-size-fits-all
            </h2>
            <p className="mt-2 text-muted-foreground">
              Day {day}. A general range judges one reading against everyone&apos;s limits. ATHENA compares the 7-day average
              with {member.name.split(" ").pop()}&apos;s own normal, so a slow decline can&apos;t hide inside a range that looks fine.
            </p>
            <table className="mt-4 w-full text-left">
              <thead>
                <tr className="text-sm text-muted-foreground">
                  <th scope="col" className="pb-2 font-normal">Indicator</th>
                  <th scope="col" className="pb-2 font-normal">ATHENA</th>
                  <th scope="col" className="pb-2 font-normal">General range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="py-2 pr-2 font-semibold">
                      {byId[row.id]?.name ?? row.id}
                    </th>
                    <td className="py-2 pr-2">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-2">
                      {row.genericText}
                      {row.missed && (
                        <span className="mt-1 block text-sm font-semibold" style={{ color: "var(--status-amber)" }}>
                          Missed by the general range
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm text-muted-foreground">General ranges are general clinical reference ranges (cited on each measurement guide), not NASA flight standards.</p>
          </section>

          {drifting.length > 0 && (
            <section className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-amber)" }} aria-labelledby="helps-heading">
              <h2 id="helps-heading" className="text-xl font-bold">
                What helps
              </h2>
              <ul className="mt-3 space-y-3">
                {drifting.map((g) => {
                  const ind = byId[g.id];
                  return (
                    <li key={g.id}>
                      <p className="font-semibold">{ind?.name}</p>
                      <p>{ind?.briefAnswers?.prevention}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">General guidance, not a diagnosis.</p>
            </section>
          )}

          <section className={card} aria-labelledby="ground-heading">
            <h2 id="ground-heading" className="flex items-center gap-2 text-xl font-bold">
              <Radio className="size-5" aria-hidden="true" /> When to tell the ground
            </h2>
            <p className="mt-3 text-lg">
              {level === "escalated"
                ? `The drift alert hasn't recovered since day ${alertSince}. Tell the crew and send the summary to the flight surgeon now.`
                : level === "alert"
                  ? `Drift alert since day ${alertSince}. If it hasn't recovered by day ${alertSince + ESCALATION_DAYS}, tell the crew and send the summary.`
                  : level === "note"
                    ? "One indicator is drifting: a note, not an alert. Keep doing the daily check."
                    : "No drift alert on this day. Nothing to send."}
            </p>
            {link && <p className="mt-2 text-muted-foreground">Reply from Earth expected {link.replyText}.</p>}
            <Link href="/summary" className={`mt-4 inline-flex min-h-12 items-center rounded-lg border border-input px-4 font-semibold hover:bg-accent ${focusRing}`}>
              Open the flight-surgeon summary
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
