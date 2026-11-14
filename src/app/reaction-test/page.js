"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const RUN_SECONDS = 60;
const LAPSE_MS = 500; // slower than this counts as a lapse
const TIMEOUT_MS = 2000; // no tap after this long counts as a lapse
// ASSUMPTION: placeholder personal baseline, not an official value.
// Replace with the real baseline from src/data once it exists.
const BASELINE = { median: 274, low: 255, high: 293 };

function median(list) {
  if (list.length === 0) return null;
  const s = [...list].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

const card = "rounded-2xl border border-border bg-card p-6";

export default function ReactionTest() {
  const [phase, setPhase] = useState("idle"); // idle | waiting | signal | done
  const [times, setTimes] = useState([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RUN_SECONDS);
  const [liveMs, setLiveMs] = useState(0);
  const [notice, setNotice] = useState("");

  const phaseRef = useRef("idle");
  const signalAt = useRef(0);
  const endAt = useRef(0);
  const waitTimer = useRef(null);
  const timeoutTimer = useRef(null);
  const tapRef = useRef(() => {});

  const go = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const clearTimers = () => {
    clearTimeout(waitTimer.current);
    clearTimeout(timeoutTimer.current);
  };
  const finish = () => {
    clearTimers();
    setSecondsLeft(0);
    go("done");
  };

  const scheduleSignal = () => {
    clearTimeout(waitTimer.current);
    waitTimer.current = setTimeout(() => {
      signalAt.current = performance.now();
      setLiveMs(0);
      setNotice("");
      go("signal");
      timeoutTimer.current = setTimeout(() => record(TIMEOUT_MS), TIMEOUT_MS);
    }, 2000 + Math.random() * 3000); // random wait of 2 to 5 seconds
  };

  const record = (ms) => {
    clearTimers();
    setTimes((t) => [...t, ms]);
    if (performance.now() >= endAt.current) return finish();
    go("waiting");
    scheduleSignal();
  };

  const start = () => {
    clearTimers();
    setTimes([]);
    setFalseStarts(0);
    setNotice("");
    setSecondsLeft(RUN_SECONDS);
    endAt.current = performance.now() + RUN_SECONDS * 1000;
    go("waiting");
    scheduleSignal();
  };

  const handleTap = () => {
    const p = phaseRef.current;
    if (p === "idle") return start();
    if (p === "waiting") {
      setFalseStarts((n) => n + 1);
      setNotice("Too early. Wait for the light.");
      scheduleSignal();
      return;
    }
    if (p === "signal") record(Math.round(performance.now() - signalAt.current));
  };
  tapRef.current = handleTap;

  // Space bar works anywhere on the page, except on buttons and links.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("a, button, input, select, textarea")
      )
        return;
      e.preventDefault();
      tapRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const running = phase === "waiting" || phase === "signal";

  // Countdown
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((endAt.current - performance.now()) / 1000)
      );
      setSecondsLeft(left);
      if (left === 0 && phaseRef.current === "waiting") finish();
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // Running millisecond counter while the panel is lit
  useEffect(() => {
    if (phase !== "signal") return;
    const id = setInterval(
      () => setLiveMs(Math.round(performance.now() - signalAt.current)),
      30
    );
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => () => clearTimers(), []);

  const lapses = times.filter((ms) => ms > LAPSE_MS).length;
  const med = median(times);
  const signalNo = times.length + (phase === "signal" ? 1 : 0);
  const progress = ((RUN_SECONDS - secondsLeft) / RUN_SECONDS) * 100;
  const slower = med !== null && med > BASELINE.high;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="text-4xl font-bold">Reaction test</h1>
      <p className="mt-2 text-lg text-foreground/70">
        Step 1 of 3 · {RUN_SECONDS} seconds · tap the panel or press the space
        bar as soon as it lights up
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <button
            type="button"
            disabled={phase === "done"}
            onPointerDown={handleTap}
            onClick={(e) => {
              if (e.detail === 0) handleTap(); // keyboard activation
            }}
            className={`flex min-h-72 w-full select-none flex-col items-center justify-center rounded-3xl border p-6 text-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary md:min-h-[26rem] ${
              phase === "signal"
                ? "border-amber-400 bg-amber-400 text-neutral-900"
                : "border-border bg-card"
            }`}
          >
            {phase === "idle" && (
              <>
                <span className="text-3xl font-bold">Start</span>
                <span className="mt-3 text-lg text-foreground/70">
                  Tap here or press the space bar. The test runs {RUN_SECONDS}{" "}
                  seconds.
                </span>
              </>
            )}
            {phase === "waiting" && (
              <>
                <span className="text-3xl font-bold">Wait…</span>
                <span className="mt-3 text-lg text-foreground/70">
                  Do not tap until the panel lights up.
                </span>
              </>
            )}
            {phase === "signal" && (
              <>
                <span className="text-2xl font-bold tracking-[0.3em]">
                  TAP NOW
                </span>
                <span className="my-4 text-8xl font-bold tabular-nums md:text-9xl">
                  {liveMs}
                </span>
                <span className="text-xl">milliseconds</span>
              </>
            )}
            {phase === "done" && (
              <span className="text-3xl font-bold">Test finished</span>
            )}
          </button>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-foreground/70">
            <span>
              {running
                ? `Signal ${signalNo} · ${secondsLeft} seconds left`
                : phase === "done"
                  ? "Finished"
                  : "Not started"}
            </span>
            <span>
              Between signals the panel is dark. Tapping early counts as a false
              start.
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Time used"
            aria-valuemin={0}
            aria-valuemax={RUN_SECONDS}
            aria-valuenow={RUN_SECONDS - secondsLeft}
            className="mt-3 h-3 overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p role="status" className="mt-3 min-h-7 text-lg font-semibold">
            {notice && (
              <>
                <span aria-hidden="true">⚠ </span>
                {notice}
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          <aside className={card}>
            <p className="text-sm uppercase tracking-wider text-foreground/60">
              Why this test
            </p>
            <p className="mt-3 text-lg">
              Slower reactions and missed signals are early signs of sleep loss
              and fatigue, often before you feel tired.
            </p>
            <p className="mt-4 text-foreground/70">
              NASA risk: inadequate sleep and irregular schedules. Your result is
              only compared with your own earlier results on this device.
            </p>
          </aside>

          <aside className={card}>
            <p className="text-sm uppercase tracking-wider text-foreground/60">
              This run so far
            </p>
            {times.length === 0 ? (
              <p className="mt-3 text-foreground/70">No signals yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {times.map((ms, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border px-3 py-2 ${
                      ms > LAPSE_MS
                        ? "border-amber-400 text-amber-400"
                        : "border-border"
                    }`}
                  >
                    {ms}
                    {ms > LAPSE_MS && " lapse"}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      {phase === "done" && (
        <section className={`${card} mt-6`} aria-labelledby="result-title">
          <h2 id="result-title" className="text-2xl font-bold">
            Result
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-foreground/70">Median reaction time</p>
              <p
                className={`mt-1 text-4xl font-bold ${slower ? "text-amber-400" : ""}`}
              >
                {med === null ? "—" : `${med} ms`}
              </p>
              <p className="mt-1 text-sm text-foreground/70">
                Your normal: {BASELINE.median} ms (range {BASELINE.low} to{" "}
                {BASELINE.high})
              </p>
            </div>
            <div>
              <p className="text-foreground/70">Lapses (over {LAPSE_MS} ms)</p>
              <p className="mt-1 text-4xl font-bold">{lapses}</p>
              <p className="mt-1 text-sm text-foreground/70">
                Your normal: 0 to 1
              </p>
            </div>
            <div>
              <p className="text-foreground/70">False starts</p>
              <p className="mt-1 text-4xl font-bold">{falseStarts}</p>
              <p className="mt-1 text-sm text-foreground/70">
                Your normal: 0 to 1
              </p>
            </div>
            <div>
              <p className="text-lg">
                {slower
                  ? "Slower than your normal today. One slow day is not a concern: ATHENA looks at your 7-day average."
                  : "In line with your normal today."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/daily-check"
                  className="flex min-h-14 items-center rounded-xl bg-primary px-6 text-lg font-semibold text-background"
                >
                  Continue to readings
                </Link>
                <button
                  type="button"
                  onClick={start}
                  className="min-h-14 rounded-xl border border-border px-6 text-lg hover:bg-white/5"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
