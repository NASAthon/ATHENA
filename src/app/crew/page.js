"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  CircleAlert,
  CircleCheck,
  Eye,
  Info,
  Minus,
} from "lucide-react";
import { useCrew } from "@/components/CrewProvider";
import { SAMPLE_DAY } from "@/lib/sampleData";

// DEMO DATA: copied from the design screenshot. Scores and texts are not from the engine yet.
const MEMBERS = [
  {
    id: "rivera",
    name: "Commander Rivera",
    role: "Commander",
    score: 72,
    status: "watch",
    change: "9 this week",
    down: true,
    text: "Sleep and reaction time have drifted below her own normal for 14 days. Score capped at 79 while the alert is active.",
    button: "Open Rivera",
    href: "/today",
  },
  {
    id: "singh",
    name: "Pilot Singh",
    role: "Pilot",
    score: 94,
    status: "good",
    change: "no change this week",
    down: false,
    text: "All indicators inside his personal range. No alerts.",
    button: "Open Singh",
    href: "/today",
  },
  {
    id: "nakamura",
    name: "Engineer Nakamura",
    role: "Flight engineer",
    score: 18,
    status: "critical",
    change: "62 since this morning",
    down: true,
    text: "Red limit: blood oxygen 87% at 09:40. Emergency guide started by Singh.",
    button: "Open emergency guide",
    href: "/emergency",
  },
];

// Status is always colour + icon + text label (inclusive design rule).
const STATUS = {
  watch: {
    label: "Watch",
    Icon: Eye,
    pill: "border-amber-400 text-amber-400",
    card: "border-amber-400/70",
    score: "text-amber-400",
  },
  good: {
    label: "Good",
    Icon: CircleCheck,
    pill: "border-sky-400 text-sky-300",
    card: "border-border",
    score: "text-sky-300",
  },
  critical: {
    label: "Critical",
    Icon: CircleAlert,
    pill: "border-red-400 text-red-400",
    card: "border-red-400/70",
    score: "text-red-400",
  },
};

const REMINDERS = [
  {
    Icon: Eye,
    color: "text-amber-400",
    title: "Rivera: daily check not done",
    note: "Due before 12:00 · about 3 minutes",
  },
  {
    Icon: CircleCheck,
    color: "text-sky-300",
    title: "Singh: blood pressure",
    note: "Scheduled 18:00 · after the evening workout",
  },
  {
    Icon: Info,
    color: "text-violet-300",
    title: "Nakamura: vision check",
    note: "Mission calendar · due in 3 days",
  },
];

const SCENARIOS = [
  { id: "normal", label: "Normal operations" },
  { id: "rivera", label: "Slow decline: Rivera" },
  { id: "nakamura", label: "Sudden event: Nakamura" },
];

const card = "rounded-2xl border border-border bg-card p-6";

export default function Crew() {
  const { setCrewId } = useCrew();
  // DEMO ONLY: this only highlights a button, it does not change any data yet.
  const [scenario, setScenario] = useState("rivera");

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="text-4xl font-bold">Crew status</h1>
      <p className="mt-2 text-lg text-foreground/70">
        Mars transit · mission day {SAMPLE_DAY} · each score compares the
        astronaut with their own normal
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {MEMBERS.map((m) => {
          const s = STATUS[m.status];
          return (
            <article
              key={m.id}
              className={`flex flex-col rounded-3xl border bg-card p-6 ${s.card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">{m.name}</h2>
                  <p className="text-foreground/70">{m.role}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${s.pill}`}
                >
                  <s.Icon className="h-4 w-4" aria-hidden="true" />
                  {s.label}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <span
                  className={`text-8xl font-bold leading-none ${s.score}`}
                >
                  {m.score}
                </span>
                <div>
                  <p className="text-foreground/70">health score / 100</p>
                  <p className="mt-1 inline-flex items-center gap-1">
                    {m.down ? (
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    )}
                    {m.change}
                  </p>
                </div>
              </div>

              <p className="mt-5 flex-1 text-lg">{m.text}</p>

              <Link
                href={m.href}
                onClick={() => setCrewId(m.id)}
                className={`mt-5 flex min-h-14 items-center justify-center rounded-xl px-4 text-lg font-semibold ${
                  m.status === "critical"
                    ? "bg-red-400 text-neutral-900 hover:bg-red-300"
                    : "border border-border hover:bg-white/5"
                }`}
              >
                {m.button}
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className={card}>
          <p className="text-sm uppercase tracking-wider text-foreground/60">
            Reminders today
          </p>
          <ul className="mt-3 divide-y divide-border">
            {REMINDERS.map((r) => (
              <li key={r.title} className="flex gap-4 py-4">
                <r.Icon
                  className={`mt-1 h-6 w-6 shrink-0 ${r.color}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-lg font-semibold">{r.title}</p>
                  <p className="text-foreground/70">{r.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <p className="text-sm uppercase tracking-wider text-foreground/60">
            Earth link
          </p>
          <h2 className="mt-3 text-3xl font-bold">14 min each way</h2>
          <p className="mt-3 text-lg">
            A question to the flight surgeon sent now gets an answer in at least
            28 minutes. ATHENA&apos;s guidance works without waiting for it.
          </p>
          <div
            aria-hidden="true"
            className="mt-5 h-3 overflow-hidden rounded-full bg-border"
          >
            <div className="h-full w-[38%] bg-primary" />
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            Last summary sent to ground: day 128, 19:05
          </p>
        </section>
      </div>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border p-6">
        <div>
          <h2 className="text-xl font-bold">Scenario lab (demo only)</h2>
          <p className="text-foreground/70">
            All crew data is simulated. Use these to replay the demo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              aria-pressed={scenario === sc.id}
              onClick={() => setScenario(sc.id)}
              className={`min-h-12 rounded-xl border px-4 ${
                scenario === sc.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-white/5"
              }`}
            >
              {sc.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setScenario("normal")}
            className="min-h-12 rounded-xl border border-border px-4 hover:bg-white/5"
          >
            Reset demo
          </button>
        </div>
      </section>
    </main>
  );
}
