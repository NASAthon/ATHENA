"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, TriangleAlert } from "lucide-react";
import { INDICATORS, SOURCES } from "@/data";
import { useCrew } from "@/components/CrewProvider";
import {
  LAPSE_THRESHOLD_MS,
  compareReactionToBaseline,
  reactionRecordFields,
  scoreReactionTest,
} from "@/lib/engine";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { useMissionData } from "@/components/MissionDataProvider";
import { focusRing } from "@/lib/ui";

// Reaction test (design and test flow by Izabela, PR #16).
// Scoring is the engine's (scoreReactionTest); "your normal" is the selected astronaut's own
// stored in-flight baseline (useTodayEvaluation).
const RUN_SECONDS = 60; // test length (test design)
const TIMEOUT_MS = 2000; // no tap after this long is recorded as a slow response (test design)
const reaction = INDICATORS.find((i) => i.id === "reaction");

// Timing helpers live outside the component: they only run inside event handlers and timers,
// never during render (keeps React's purity rules happy).
const now = () => performance.now();
const randomWaitMs = () => 2000 + Math.random() * 3000; // random wait of 2 to 5 seconds

const card = "rounded-2xl border border-border bg-card p-6";

// A fresh test for each astronaut: switching crew in the header starts over.
export default function ReactionTestPage() {
  const { crewId } = useCrew();
  return <ReactionTest key={crewId} />;
}

function ReactionTest() {
  const { crewId, member } = useCrew();
  const { status: dataStatus, today, saveCheckIn } = useMissionData();
  // Guest mode (for judges): the run is never saved to the crew's records.
  const [guest, setGuest] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedRun, setSavedRun] = useState(false); // this run is already saved
  // The astronaut's own STORED in-flight baseline (fixed, DECISIONS › Baselines), the same one the
  // engine uses for drift, so this result and the Trends chart always agree.
  const { baselines } = useTodayEvaluation();
  const baseline = baselines?.inflight?.indicators ?? {};
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
      signalAt.current = now();
      setLiveMs(0);
      setNotice("");
      go("signal");
      timeoutTimer.current = setTimeout(() => record(TIMEOUT_MS), TIMEOUT_MS);
    }, randomWaitMs());
  };

  const record = (ms) => {
    clearTimers();
    setTimes((t) => [...t, ms]);
    if (now() >= endAt.current) return finish();
    go("waiting");
    scheduleSignal();
  };

  const start = () => {
    clearTimers();
    setTimes([]);
    setFalseStarts(0);
    setSaveMessage("");
    setSavedRun(false);
    setNotice("");
    setSecondsLeft(RUN_SECONDS);
    endAt.current = now() + RUN_SECONDS * 1000;
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
    if (p === "signal") record(Math.round(now() - signalAt.current));
  };
  // Keep the latest handlers for the space-bar listener and the countdown (updated after render).
  const finishRef = useRef(() => {});
  useEffect(() => {
    tapRef.current = handleTap;
    finishRef.current = finish;
  });

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
        Math.ceil((endAt.current - now()) / 1000)
      );
      setSecondsLeft(left);
      if (left === 0 && phaseRef.current === "waiting") finishRef.current();
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // Running millisecond counter while the panel is lit
  useEffect(() => {
    if (phase !== "signal") return;
    const id = setInterval(
      () => setLiveMs(Math.round(now() - signalAt.current)),
      30
    );
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => () => clearTimers(), []);

  const score = scoreReactionTest({ trialsMs: times, falseStarts });
  const med = score.medianMs === null ? null : Math.round(score.medianMs);
  const lapses = score.lapses;
  const compared = compareReactionToBaseline(score, baseline.reactionMedianMs);
  const usualLapses = baseline.reactionLapses?.status === "ok" ? Math.round(baseline.reactionLapses.mean) : null;
  const signalNo = times.length + (phase === "signal" ? 1 : 0);
  const progress = ((RUN_SECONDS - secondsLeft) / RUN_SECONDS) * 100;
  const slower = Boolean(compared?.slower);

  // Adds this run to the selected astronaut's record for today (validated, src/lib/checkIn.js).
  const saveResult = async () => {
    try {
      const saved = await saveCheckIn(crewId, reactionRecordFields(score));
      setSavedRun(saved.ok);
      setSaveMessage(
        saved.ok
          ? `Saved to ${member.name}'s record for mission day ${today}.`
          : `Not saved: ${saved.errors.join(" ")}`,
      );
    } catch (e) {
      setSaveMessage(`Couldn't save: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="text-4xl font-bold">Reaction test</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Step 1 of 3 · {RUN_SECONDS} seconds · tap the panel or press the space
        bar as soon as it lights up
      </p>
      <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-input px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
        <input
          type="checkbox"
          checked={guest}
          disabled={running}
          onChange={(e) => {
            setGuest(e.target.checked);
            setSaveMessage("");
          }}
          className="size-5 accent-primary outline-none"
        />
        <span>
          <span className="font-semibold">Guest mode</span>{" "}
          <span className="text-muted-foreground">(for judges: this run is never saved to the crew&apos;s records)</span>
        </span>
      </label>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <button
            type="button"
            disabled={phase === "done"}
            onPointerDown={handleTap}
            onClick={(e) => {
              if (e.detail === 0) handleTap(); // keyboard activation
            }}
            className={`flex min-h-72 w-full select-none flex-col items-center justify-center rounded-3xl border p-6 text-center md:min-h-[26rem] ${focusRing} ${
              phase === "signal" ? "text-background" : "border-border bg-card"
            }`}
            style={phase === "signal" ? { background: "var(--status-amber)", borderColor: "var(--status-amber)" } : undefined}
          >
            {phase === "idle" && (
              <>
                <span className="text-3xl font-bold">Start</span>
                <span className="mt-3 text-lg text-muted-foreground">
                  Tap here or press the space bar. The test runs {RUN_SECONDS}{" "}
                  seconds.
                </span>
              </>
            )}
            {phase === "waiting" && (
              <>
                <span className="text-3xl font-bold">Wait…</span>
                <span className="mt-3 text-lg text-muted-foreground">
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

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-muted-foreground">
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
                <TriangleAlert aria-hidden="true" className="mr-1 inline size-5 align-text-bottom" />
                {notice}
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          <aside className={card}>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Why this test
            </p>
            <p className="mt-3 text-lg">{reaction.glance}</p>
            <p className="mt-4 text-muted-foreground">{reaction.whyItMatters}</p>
            <p className="mt-4 text-muted-foreground">
              Your result is only compared with {member.name}&apos;s own normal (their stored in-flight baseline; demo data is simulated).
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {reaction.sourceIds.map((id) => (
                <li key={id}>
                  <a
                    href={SOURCES[id].url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 rounded text-primary underline ${focusRing}`}
                  >
                    Source: {SOURCES[id].title}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <aside className={card}>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              This run so far
            </p>
            {times.length === 0 ? (
              <p className="mt-3 text-muted-foreground">No signals yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {times.map((ms, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border px-3 py-2"
                    style={ms > LAPSE_THRESHOLD_MS ? { borderColor: "var(--status-amber)", color: "var(--status-amber)" } : undefined}
                  >
                    {ms}
                    {ms > LAPSE_THRESHOLD_MS && " lapse"}
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
              <p className="text-muted-foreground">Median reaction time</p>
              <p className="mt-1 text-4xl font-bold" style={slower ? { color: "var(--status-amber)" } : undefined}>
                {med === null ? "—" : `${med} ms`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {compared
                  ? `Your normal: ${compared.usualMs} ms (usual range ${compared.typicalLowMs} to ${compared.typicalHighMs})`
                  : "No baseline yet"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Lapses (over {LAPSE_THRESHOLD_MS} ms)</p>
              <p className="mt-1 text-4xl font-bold">{lapses}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {usualLapses === null ? "No baseline yet" : `Your normal: about ${usualLapses} per test`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">False starts</p>
              <p className="mt-1 text-4xl font-bold">{falseStarts}</p>
              <p className="mt-1 text-sm text-muted-foreground">Tapping before the light. Not tracked as a trend.</p>
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
                  className={`flex min-h-14 items-center rounded-xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90 ${focusRing}`}
                >
                  Continue to readings
                </Link>
                {!guest && (
                  <button
                    type="button"
                    onClick={saveResult}
                    disabled={savedRun || dataStatus !== "ready" || today === null || score.validTrials === 0}
                    className={`min-h-14 rounded-xl border border-primary px-6 text-lg font-semibold text-primary hover:bg-accent disabled:opacity-50 ${focusRing}`}
                  >
                    {savedRun ? "Saved" : <>Save to {member.name}&apos;s record</>}
                  </button>
                )}
                <button
                  type="button"
                  onClick={start}
                  className={`min-h-14 rounded-xl border border-input px-6 text-lg hover:bg-accent ${focusRing}`}
                >
                  Try again
                </button>
              </div>
              <p role="status" className="mt-3 min-h-6 font-semibold">
                {guest
                  ? "Guest mode: this run isn't saved."
                  : saveMessage}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
