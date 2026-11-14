"use client";

// Presenter controls for the simulated live feed (docs/DECISIONS.md › Always-On Live Monitoring):
// speed, pause, jump to the next scripted moment and what is coming up. For presenting only:
// in flight the clock simply runs in real time.

import { FastForward, Pause, Play, SkipForward } from "lucide-react";
import { useLive } from "@/components/LiveProvider";
import { SPEEDS } from "@/lib/live/clock";
import { timeText } from "@/lib/live/stream";
import { focusRing } from "@/lib/ui";

const button = `inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-semibold ${focusRing}`;

export default function LiveDemoControls() {
  const live = useLive();
  if (!live.active) return <p className="text-muted-foreground">Load the demo mission to start the live feed.</p>;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div>
        <h3 className="font-semibold">Live clock | Day {live.day} | {live.time}</h3>
        <div role="group" aria-label="Clock speed" className="mt-2 flex flex-wrap gap-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={live.speed === s && !live.paused}
              onClick={() => live.setSpeed(s)}
              className={`${button} ${live.speed === s && !live.paused ? "border-primary bg-primary/15" : "border-input hover:bg-accent"}`}
            >
              {s === 1 ? <Play aria-hidden="true" className="size-4" /> : <FastForward aria-hidden="true" className="size-4" />}
              {s === 1 ? "1× real time" : `${s}×`}
            </button>
          ))}
          <button type="button" aria-pressed={live.paused} onClick={live.togglePause} className={`${button} ${live.paused ? "border-primary bg-primary/15" : "border-input hover:bg-accent"}`}>
            {live.paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
            {live.paused ? "Resume" : "Pause"}
          </button>
        </div>
        <button
          type="button"
          onClick={live.jumpToNext}
          disabled={!live.next}
          className={`${button} mt-2 w-full justify-center border-input hover:bg-accent disabled:opacity-50`}
        >
          <SkipForward aria-hidden="true" className="size-4" />
          {live.next ? `Jump to next event: ${live.next.presenter}` : "No more scripted events today"}
        </button>
      </div>
      <div>
        <h3 className="font-semibold">Coming up</h3>
        <ol className="mt-1 space-y-1">
          {live.upcoming.map((e) => (
            <li key={e.at} className="flex gap-3">
              <span className="w-12 shrink-0 font-semibold tabular-nums">{timeText(e.at)}</span>
              <span>{e.presenter}</span>
            </li>
          ))}
          <li className="flex gap-3 text-muted-foreground">
            <span className="w-12 shrink-0 font-semibold tabular-nums">00:00</span>
            <span>Day {live.day + 1}: today rolls up into the daily records</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
