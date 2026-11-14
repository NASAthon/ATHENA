"use client";

import { useMemo, useState } from "react";
import { CircleCheck, FlaskConical, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import { useCrew } from "@/components/CrewProvider";
import {
  DRIFT_INDICATOR_KEYS,
  IN_FLIGHT_WINDOW,
  RECORD_FIELDS,
  SCENARIO_EFFECTS,
  applyScenario,
  calculateMissionBaselines,
  evaluateMission,
} from "@/lib/engine";
import { MISSION_DAYS, simulateAstronaut } from "@/lib/sim/simulator";
import { focusRing } from "@/lib/ui";

// Scenario Lab (CHECKLIST §2 S item "inject radiation, fatigue, sleep loss or hypoxia into the
// data and watch the alerts react"). Works on a COPY of the simulated mission: nothing here
// changes stored crew data. All health logic is the engine's (src/lib/engine); this page
// only picks the inputs and shows the before/after results.

const card = "rounded-2xl border border-border bg-card p-6";
const indicatorById = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));

// Record field → content indicator name, e.g. "sleepHours" → "Sleep".
const FIELD_NAME = Object.fromEntries(
  Object.entries(RECORD_FIELDS).flatMap(([id, parts]) => Object.values(parts).map((field) => [field, indicatorById[id]?.name ?? id])),
);

// Plain-English names for the engine's scenarios (src/lib/engine/scenarios.js).
const SCENARIOS = [
  { id: "sleepLoss", name: "Sleep loss" },
  { id: "fatigue", name: "Fatigue" },
  { id: "hypoxia", name: "Low oxygen (hypoxia)" },
  { id: "radiation", name: "Radiation event" },
];

const INTENSITIES = [
  { value: 0.33, label: "Low" },
  { value: 0.66, label: "Medium" },
  { value: 1, label: "High" },
];

const LENGTHS = [3, 7, 14, 21];
const FIRST_DAY = IN_FLIGHT_WINDOW.toDay + 1; // drift needs the finished in-flight baseline

// How each alert level is shown: always icon + text label + colour token.
const ALERT_STYLE = {
  none: { label: "No alert", Icon: CircleCheck, colour: "var(--status-steady)" },
  note: { label: "Note (1 indicator drifting)", Icon: Info, colour: "var(--status-adapted)" },
  alert: { label: "Alert (2+ indicators drifting)", Icon: TriangleAlert, colour: "var(--status-amber)" },
  escalated: { label: "Escalated: tell crew and ground", Icon: OctagonAlert, colour: "var(--status-red)" },
};

function changedNames(type) {
  return [...new Set(Object.keys(SCENARIO_EFFECTS[type]).map((field) => FIELD_NAME[field] ?? field))].join(", ");
}

function AlertBadge({ level }) {
  const style = ALERT_STYLE[level] ?? ALERT_STYLE.none;
  return (
    <span className="inline-flex items-center gap-2 font-semibold" style={{ color: style.colour }}>
      <style.Icon aria-hidden="true" className="size-5 shrink-0" />
      {style.label}
    </span>
  );
}

// One side of the before/after comparison for a single day.
function DayResult({ title, day }) {
  const drifting = day.groups.filter((g) => g.status === "drifting").map((g) => indicatorById[g.group]?.name ?? g.group);
  const limits = day.limitBreaches.filter((b) => b.level !== "watch");
  return (
    <section className={card} aria-label={title}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-4xl font-semibold">
        {day.health.score ?? "–"}
        <span className="ml-2 text-base font-normal text-muted-foreground">
          {day.health.label ? `health score · ${day.health.label}` : "not enough data"}
        </span>
      </p>
      <p className="mt-3">
        <AlertBadge level={day.alert.level} />
      </p>
      <p className="mt-3 text-sm">
        <span className="font-semibold">Drifting from own normal:</span> {drifting.length > 0 ? drifting.join(", ") : "none"}
      </p>
      {limits.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {limits.map((b) => (
            <li key={b.indicatorId}>
              <span className="font-semibold">{indicatorById[b.indicatorId]?.name}:</span> {b.label} ({b.basisLabel})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Page() {
  const { crewId, member } = useCrew();
  const [form, setForm] = useState({ type: "sleepLoss", fromDay: 100, days: 14, intensity: 0.66 });
  const [run, setRun] = useState(null); // the scenario last run, or null

  // The simulated mission and its FIXED baselines (DECISIONS › Baselines): a scenario never
  // changes the baseline, only the days it touches.
  const mission = useMemo(() => {
    const records = simulateAstronaut(crewId);
    const baselines = calculateMissionBaselines(records.filter((r) => r.missionDay <= IN_FLIGHT_WINDOW.toDay), DRIFT_INDICATOR_KEYS);
    return { records, baselines, before: evaluateMission(records, baselines, 1, MISSION_DAYS.toDay) };
  }, [crewId]);

  const result = useMemo(() => {
    if (!run || run.crewId !== crewId) return null;
    const changed = applyScenario(mission.records, run);
    const after = evaluateMission(changed, mission.baselines, 1, MISSION_DAYS.toDay);
    const endDay = Math.min(MISSION_DAYS.toDay, run.fromDay + run.days - 1);
    const showFrom = Math.max(1, run.fromDay - 3);
    const showTo = Math.min(MISSION_DAYS.toDay, endDay + 7);
    const firstAlert = (list) => list.find((d) => d.day >= run.fromDay && (d.alert.level === "alert" || d.alert.level === "escalated"))?.day ?? null;
    return {
      endDay,
      touched: changed.filter((r) => r.origin === "scenario").length,
      beforeEnd: mission.before.find((d) => d.day === endDay),
      afterEnd: after.find((d) => d.day === endDay),
      rows: after
        .filter((d) => d.day >= showFrom && d.day <= showTo)
        .map((d) => ({ after: d, before: mission.before.find((b) => b.day === d.day) })),
      firstAlertBefore: firstAlert(mission.before),
      firstAlertAfter: firstAlert(after),
    };
  }, [run, crewId, mission]);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: Number(event.target.value) }));
  const fromDayValid = Number.isInteger(form.fromDay) && form.fromDay >= FIRST_DAY && form.fromDay <= MISSION_DAYS.toDay;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <h1 className="flex items-center gap-3 text-3xl font-semibold">
        <FlaskConical aria-hidden="true" className="size-8" /> Scenario Lab
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        {member.name} · simulated mission · inject an event and watch ATHENA&apos;s alerts react. This works on a copy:
        nothing here changes the crew&apos;s records.
      </p>

      <form
        className={`${card} grid gap-6 md:grid-cols-2`}
        onSubmit={(event) => {
          event.preventDefault();
          if (fromDayValid) setRun({ crewId, ...form });
        }}
      >
        <fieldset className="md:col-span-2">
          <legend className="font-semibold">Event</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map((s) => (
              <label
                key={s.id}
                className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border border-input p-3 has-[:checked]:border-ring has-[:checked]:bg-accent`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={s.id}
                  checked={form.type === s.id}
                  onChange={() => setForm((f) => ({ ...f, type: s.id }))}
                  className={`mt-1 size-5 ${focusRing}`}
                />
                <span>
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted-foreground">Changes: {changedNames(s.id)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="from-day" className="block font-semibold">
            Starts on mission day <span className="font-normal text-muted-foreground">({FIRST_DAY}–{MISSION_DAYS.toDay})</span>
          </label>
          <input
            id="from-day"
            type="number"
            min={FIRST_DAY}
            max={MISSION_DAYS.toDay}
            step={1}
            value={form.fromDay}
            onChange={set("fromDay")}
            aria-describedby="from-day-help"
            className={`mt-2 min-h-14 w-full rounded-lg border border-input bg-input/30 px-4 text-xl ${focusRing}`}
          />
          <p id="from-day-help" className="mt-1 text-sm text-muted-foreground">
            From day {FIRST_DAY}: drift is measured against the in-flight baseline (days {IN_FLIGHT_WINDOW.fromDay}–{IN_FLIGHT_WINDOW.toDay}).
          </p>
        </div>

        <div>
          <label htmlFor="length" className="block font-semibold">
            Lasts
          </label>
          <select
            id="length"
            value={form.days}
            onChange={set("days")}
            className={`mt-2 min-h-14 w-full rounded-lg border border-input bg-input/30 px-4 text-xl ${focusRing}`}
          >
            {LENGTHS.map((n) => (
              <option key={n} value={n} className="bg-popover text-popover-foreground">
                {n} days
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="font-semibold">Strength</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {INTENSITIES.map((i) => (
              <label
                key={i.value}
                className={`flex min-h-11 min-w-24 cursor-pointer items-center gap-2 rounded-lg border border-input px-4 has-[:checked]:border-ring has-[:checked]:bg-accent`}
              >
                <input
                  type="radio"
                  name="intensity"
                  value={i.value}
                  checked={form.intensity === i.value}
                  onChange={set("intensity")}
                  className={`size-5 ${focusRing}`}
                />
                {i.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!fromDayValid}
            className={`min-h-14 w-full rounded-lg bg-primary px-6 text-lg font-semibold text-primary-foreground disabled:opacity-50 ${focusRing}`}
          >
            Run scenario
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-6">
        {result && (
          <>
            <h2 className="text-2xl font-semibold">
              Day {result.endDay}: last day of the event
            </h2>
            <p className="mt-1 text-muted-foreground">
              {result.firstAlertAfter === null
                ? "No drift alert during or after this event."
                : result.firstAlertBefore === result.firstAlertAfter
                  ? `Alert on day ${result.firstAlertAfter}, the same as without the event.`
                  : `With the event, ATHENA raises an alert on day ${result.firstAlertAfter}` +
                    (result.firstAlertBefore ? ` (without it: day ${result.firstAlertBefore}).` : " (without it: no alert).")}
            </p>
            {result.touched === 0 && (
              <p className="mt-3 rounded-lg border border-border p-4 text-sm">
                Nothing changed: {member.name} has no recorded readings for this event to change.
                {run.type === "radiation" && ` ${indicatorById.radiation?.personalBaselineOnly ?? ""}`}
              </p>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DayResult title="Without the event" day={result.beforeEnd} />
              <DayResult title="With the event" day={result.afterEnd} />
            </div>

            <div className={`${card} mt-4 overflow-x-auto`}>
              <table className="w-full text-left">
                <caption className="mb-3 text-left font-semibold">Day by day</caption>
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th scope="col" className="py-2 pr-4">Day</th>
                    <th scope="col" className="py-2 pr-4">Score without</th>
                    <th scope="col" className="py-2 pr-4">Score with</th>
                    <th scope="col" className="py-2">Alert with the event</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(({ before, after }) => (
                    <tr key={after.day} className="border-b border-border last:border-0">
                      <th scope="row" className="py-2 pr-4 font-normal">
                        {after.day}
                        {after.day >= run.fromDay && after.day <= result.endDay ? " (event)" : ""}
                      </th>
                      <td className="py-2 pr-4">{before?.health.score ?? "–"}</td>
                      <td className="py-2 pr-4 font-semibold">{after.health.score ?? "–"}</td>
                      <td className="py-2">
                        <AlertBadge level={after.alert.level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Simulated data. Event sizes are demo values chosen to show how the alerts react, not real physiology
        (docs/DECISIONS.md › Logic Engine Assumptions). Not medical advice.
      </p>
    </main>
  );
}
