"use client";

// Always-on live monitoring (docs/DECISIONS.md › Always-On Live Monitoring). Starts by itself when
// the app opens: a mission clock runs in real time, and ATHENA evaluates each astronaut's SIMULATED
// sensor feed (src/lib/live/stream.js) as the clock moves. Every page reads it with useLive().
// The presenter's demo controls (Crew page) change speed, pause or jump to the next scripted moment.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMissionData } from "@/components/MissionDataProvider";
import { CREW } from "@/lib/crew";
import { crewEvents, liveDay, liveSnapshot, timeText, upcomingScript } from "@/lib/live/stream";
import { advanceClock, nextScripted, restoreClock, serialiseClock } from "@/lib/live/clock";

const LiveContext = createContext(null);
const TICK_MS = 1000;
const SAVE_EVERY_MS = 15000;

export function LiveProvider({ children }) {
  const { db, status, today, version, rollOverDay, saveLiveClock, getLiveClock } = useMissionData();
  const [clock, setClockState] = useState(null);
  const clockRef = useRef(null);
  const setClock = useCallback((next) => {
    clockRef.current = typeof next === "function" ? next(clockRef.current) : next;
    setClockState(clockRef.current);
  }, []);
  const lastTick = useRef(0);
  const lastSave = useRef(0);
  const rolling = useRef(false);

  // Start (or resume) the clock once the stored mission is open; stop when there's no mission.
  useEffect(() => {
    if (status !== "ready" || !db) return;
    if (today === null) {
      setClock(null);
      return;
    }
    const c = clockRef.current;
    setClock(c && c.day === today ? c : restoreClock(getLiveClock(), today));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, db, today]);

  const persist = useCallback((c) => {
    if (c) saveLiveClock(serialiseClock(c));
    lastSave.current = Date.now();
  }, [saveLiveClock]);

  // The tick: always on, once a second.
  useEffect(() => {
    if (!clock) return;
    lastTick.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick.current;
      lastTick.current = now;
      const c = clockRef.current;
      if (!c) return;
      const { clock: next, rolledOver } = advanceClock(c, elapsed);
      setClock(next);
      if (rolledOver && !rolling.current) {
        rolling.current = true;
        persist(next);
        Promise.resolve(rollOverDay(next.day)).finally(() => {
          rolling.current = false;
        });
      } else if (now - lastSave.current > SAVE_EVERY_MS) {
        persist(next);
      }
    }, TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock === null]);

  // Each astronaut's whole day is computed once (the feed is deterministic), then sliced per minute.
  const days = useMemo(() => {
    if (!clock || !db) return null;
    return Object.fromEntries(CREW.map((m) => [m.id, liveDay(m.id, clock.day, db.loadMissionBaselines(m.id))]));
    // version: baselines are re-read after Load demo mission or Reset data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock?.day, db, version]);

  const minute = clock ? Math.floor(clock.minute) : 0;

  const value = useMemo(() => {
    const setAndSave = (fn) => {
      const c = clockRef.current;
      if (!c) return;
      const next = fn(c);
      setClock(next);
      persist(next);
    };
    if (!clock || !days) {
      return { active: false, setSpeed: () => {}, togglePause: () => {}, jumpToNext: () => {} };
    }
    const crew = Object.fromEntries(CREW.map((m) => [m.id, liveSnapshot(days[m.id], minute)]));
    const events = [
      ...CREW.flatMap((m) => crew[m.id].events),
      ...crewEvents(clock.day).filter((e) => e.minute <= minute),
    ].sort((a, b) => b.minute - a.minute);
    const next = nextScripted(clock);
    return {
      active: true,
      day: clock.day,
      minute,
      time: timeText(minute),
      speed: clock.speed,
      paused: clock.paused,
      crew,
      events,
      upcoming: upcomingScript(clock.day, minute),
      next,
      setSpeed: (speed) => setAndSave((c) => ({ ...c, speed, paused: false })),
      togglePause: () => setAndSave((c) => ({ ...c, paused: !c.paused })),
      // Jumps to just before the next scripted moment, so it happens on screen.
      jumpToNext: () => setAndSave((c) => {
        const n = nextScripted(c);
        return n ? { ...c, minute: Math.max(c.minute, n.at - 1) } : c;
      }),
    };
  }, [clock, days, minute, persist, setClock]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

/** The live picture: clock, each astronaut's snapshot, the alert feed and the demo controls. */
export function useLive() {
  const value = useContext(LiveContext);
  if (!value) throw new Error("useLive must be used inside <LiveProvider>.");
  return value;
}
