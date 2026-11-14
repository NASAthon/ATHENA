"use client";

// Mission calendar (CHECKLIST §3 › Calendar, summary, extras): the periodic exams for the astronaut
// selected in the header. What's due comes from the engine's calendar scheduler
// (src/lib/engine/calendar.js); completions are stored with saveExamResult (src/lib/checkIn.js).
// Exams and their sources come from src/data/exams.js. In-flight intervals are ATHENA design
// choices (NASA doesn't state them), and the screen says so.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarClock, CircleCheck, TriangleAlert } from "lucide-react";
import { EXAMS } from "@/data";
import { EXAM_SCHEDULE, examsDueOn, examsOverdue } from "@/lib/engine";
import { loadExamResults } from "@/lib/checkIn";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { focusRing } from "@/lib/ui";

const LOOK_AHEAD_DAYS = 30;
const examById = Object.fromEntries(EXAMS.map((e) => [e.id, e]));
const card = "rounded-xl border border-border bg-card p-3";

// Exam status: colour + icon + text label (DECISIONS › Inclusive Design).
const EXAM_STATUS = {
  overdue: { label: "Overdue", Icon: TriangleAlert, colour: "var(--status-amber)" },
  due: { label: "Due today", Icon: CalendarClock, colour: "var(--status-steady)" },
  done: { label: "Up to date", Icon: CircleCheck, colour: "var(--status-steady)" },
  upcoming: { label: "Not due yet", Icon: CalendarCheck, colour: "var(--status-nodata)" },
};

function nextDueAfter(exam, day) {
  if (day < exam.firstDay) return exam.firstDay;
  return exam.firstDay + (Math.floor((day - exam.firstDay) / exam.everyDays) + 1) * exam.everyDays;
}

export default function CalendarPage() {
  const { crewId, member } = useCrew();
  const { db, status, today, version, saveExamResult } = useMissionData();
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const results = useMemo(
    () => (db ? loadExamResults(db, crewId) : []),
    // version changes after every save, so results are read again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, crewId, version],
  );

  if (status === "loading" || today === null) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3">
        <h1 className="text-xl font-bold">Mission calendar</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {status === "loading" ? (
            "Opening the mission data…"
          ) : (
            <>
              No mission stored yet. Load the demo mission on the{" "}
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

  const completed = results.map((r) => ({ examId: r.examId, day: r.missionDay }));
  const overdue = examsOverdue(completed, today);
  const dueToday = examsDueOn(today);
  const lastDone = (id) => results.find((r) => r.examId === id)?.missionDay ?? null;

  const rows = EXAM_SCHEDULE.map((exam) => {
    const late = overdue.find((o) => o.id === exam.id);
    const doneToday = lastDone(exam.id) === today;
    const state = late ? "overdue" : dueToday.includes(exam.id) && !doneToday ? "due" : today < exam.firstDay ? "upcoming" : "done";
    return { exam, state, dueDay: late?.dueDay ?? null, next: nextDueAfter(exam, today), last: lastDone(exam.id) };
  }).sort((a, b) => ["overdue", "due", "done", "upcoming"].indexOf(a.state) - ["overdue", "due", "done", "upcoming"].indexOf(b.state));

  const upcoming = [];
  for (let day = today + 1; day <= today + LOOK_AHEAD_DAYS; day += 1) {
    const ids = examsDueOn(day);
    if (ids.length > 0) upcoming.push({ day, ids });
  }
  const notInFlight = EXAMS.filter((e) => !EXAM_SCHEDULE.some((s) => s.id === e.id));

  const markDone = async (examId) => {
    setSaving(examId);
    setError(null);
    try {
      await saveExamResult(crewId, examId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3">
      <h1 className="text-xl font-bold">
        Mission calendar <span className="text-base font-normal text-muted-foreground">| {member.name} | Day {today}</span>
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Periodic exams named on NASA risk pages. How often they repeat in flight is an ATHENA design choice: NASA doesn&apos;t state it.
      </p>

      <section className="mt-2" aria-labelledby="exams-heading">
        <h2 id="exams-heading" className="text-base font-bold">
          Exams
        </h2>
        <ul className="mt-2 grid auto-rows-fr gap-2 md:grid-cols-2">
          {rows.map(({ exam, state, dueDay, next, last }) => {
            const info = examById[exam.id];
            const s = EXAM_STATUS[state];
            const needsDoing = state === "overdue" || state === "due";
            return (
              <li key={exam.id} className={card} style={needsDoing ? { borderColor: s.colour } : undefined}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold">{info.name}</h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold" style={{ borderColor: s.colour, color: s.colour }}>
                    <s.Icon className="size-4" aria-hidden="true" />
                    {s.label}
                  </span>
                </div>
                <p className="mt-2">{info.why}</p>
                <p className="mt-2 text-muted-foreground">
                  Every {exam.everyDays} days
                  {state === "overdue" && ` | was due on day ${dueDay}`}
                  {last !== null ? ` | last done on day ${last}` : " | not done yet this mission"} | next due day {next}
                </p>
                {needsDoing && (
                  <button
                    type="button"
                    onClick={() => markDone(exam.id)}
                    disabled={saving !== null || status === "busy"}
                    className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 ${focusRing}`}
                  >
                    <CircleCheck className="size-5" aria-hidden="true" />
                    {saving === exam.id ? "Saving…" : `Mark done today (day ${today})`}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {error && (
          <p role="alert" className="mt-2 font-semibold" style={{ color: "var(--status-red)" }}>
            Couldn&apos;t save: {error}
          </p>
        )}
      </section>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <section className={card} aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-base font-bold">
            Next {LOOK_AHEAD_DAYS} days
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-muted-foreground">No exams due.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {upcoming.map(({ day, ids }) => (
                <li key={day} className="flex flex-wrap gap-x-3">
                  <span className="w-20 shrink-0 font-semibold">Day {day}</span>
                  <span>{ids.map((id) => examById[id].name).join(", ")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {notInFlight.length > 0 && (
          <section className={card} aria-labelledby="ground-heading">
            <h2 id="ground-heading" className="text-base font-bold">
              Done on the ground
            </h2>
            <ul className="mt-2 space-y-2">
              {notInFlight.map((e) => (
                <li key={e.id}>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-muted-foreground">
                    {e.why} When: {e.interval?.when ?? "not scheduled in flight"}.
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <p className="mt-2 text-muted-foreground">Demo mission: all data on this screen is simulated. Not medical advice.</p>
    </main>
  );
}
