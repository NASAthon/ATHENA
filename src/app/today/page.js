import Link from "next/link";
import {
  ArrowDown,
  CircleCheck,
  CircleMinus,
  Eye,
  Info,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";

// DEMO DATA: copied from the design screenshot, not from the engine yet.
const DEMO = {
  name: "Commander Rivera",
  score: 72,
  scoreLabel: "Watch",
  sinceYesterday: 2,
  thisWeek: 9,
  alert: {
    day: 14,
    title: "Your sleep and reaction time are drifting together",
    text: "Next step: keep a fixed sleep time this week and repeat the reaction test daily. If nothing improves by day 143, tell the crew and send the summary to the ground.",
    why: "Demo text: your 7-day average sleep and reaction time are both outside your own in-flight normal. Two indicators drifting together raises the alert level.",
  },
  indicators: [
    { name: "Sleep", value: "5.8 h", note: "Your normal: 6.8 h · below range for 14 days", status: "drifting" },
    { name: "Reaction time", value: "307 ms", note: "Your normal: 274 ms · slower for 26 days", status: "drifting" },
    { name: "Mood", value: "3.8 / 5", note: "Your normal: 4.2 · inside your range", status: "steady" },
    { name: "Resting heart rate", value: "64 bpm", note: "Your normal: 63 bpm", status: "steady" },
    { name: "Blood pressure", value: "110 / 70", note: "Your normal: 110 / 70 mmHg", status: "steady" },
    { name: "Blood glucose", value: "91 mg/dL", note: "Your normal: 90 mg/dL", status: "steady" },
  ],
  extras: [
    { name: "Body temperature", value: "37.0 °C", note: "0.4 °C above pre-flight: expected in space", status: "adapted" },
    { name: "Radiation dose", value: "77 mSv", note: "Cumulative, from the onboard dosimeter", status: "reading" },
  ],
};

// Status is always colour + icon + text label (inclusive design rule).
const STATUS = {
  drifting: { label: "Drifting", Icon: TrendingDown, cls: "border-amber-400 text-amber-400" },
  steady: { label: "Steady", Icon: CircleCheck, cls: "border-sky-400 text-sky-300" },
  adapted: { label: "Adapted", Icon: Info, cls: "border-violet-400 text-violet-300" },
  reading: { label: "Reading only", Icon: CircleMinus, cls: "border-border text-foreground/70" },
};

function StatusPill({ status }) {
  const { label, Icon, cls } = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cls}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}

function IndicatorCard({ item }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg text-foreground/80">{item.name}</h3>
        <StatusPill status={item.status} />
      </div>
      <p className="mt-3 text-4xl font-bold">{item.value}</p>
      <p className="mt-3 text-foreground/70">{item.note}</p>
    </article>
  );
}

export default function Today() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/crew" className="text-primary hover:underline">
            Back to crew
          </Link>
          <h1 className="mt-2 text-4xl font-bold">{DEMO.name} · today</h1>
        </div>
        <Link
          href="/daily-check"
          className="flex min-h-14 items-center rounded-xl bg-primary px-6 text-lg font-semibold text-background hover:opacity-90"
        >
          Start today&apos;s check
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm uppercase tracking-wider text-foreground/60">
            Health score
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-8xl font-bold leading-none text-amber-400">
              {DEMO.score}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400 px-4 py-1 text-lg font-semibold text-amber-400">
              <Eye className="h-5 w-5" aria-hidden="true" />
              {DEMO.scoreLabel}
            </span>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-lg">
            <span className="inline-flex items-center gap-1">
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              {DEMO.sinceYesterday} since yesterday
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              {DEMO.thisWeek} this week
            </span>
          </p>
          <p className="mt-4 text-foreground/70">
            Capped at 79 while a drift alert is active. Good 80–100 · Watch
            60–79 · Alert 40–59 · Critical 0–39.
          </p>
        </section>

        <section
          aria-labelledby="alert-title"
          className="rounded-2xl border border-amber-400 bg-amber-950/30 p-6"
        >
          <p className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            Drift alert · day {DEMO.alert.day}
          </p>
          <h2 id="alert-title" className="mt-3 text-3xl font-bold">
            {DEMO.alert.title}
          </h2>
          <p className="mt-3 text-lg">{DEMO.alert.text}</p>
          <details className="mt-5 border-t border-amber-400/30 pt-4">
            <summary className="flex min-h-11 cursor-pointer items-center text-lg font-semibold text-amber-400">
              Why this alert?
            </summary>
            <p className="mt-2 text-foreground/80">{DEMO.alert.why}</p>
          </details>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold">Indicators, last 7 days</h2>
        <p className="text-foreground/70">
          Compared with your own in-flight normal, not Earth ranges
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {DEMO.indicators.map((item) => (
          <IndicatorCard key={item.name} item={item} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {DEMO.extras.map((item) => (
          <IndicatorCard key={item.name} item={item} />
        ))}
      </div>

      <p className="mt-6 text-foreground/70">
        Demo mission: all data on this screen is simulated.
      </p>
    </main>
  );
}
