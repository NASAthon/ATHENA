"use client";

// Always-on live monitoring (docs/DECISIONS.md › Always-On Live Monitoring). Starts by itself when
// the app opens: a mission clock runs in real time, and ATHENA evaluates each astronaut's SIMULATED
// sensor feed (src/lib/live/stream.js) as the clock moves. Every page reads it with useLive().
// The presenter's demo controls (Crew page) change speed, pause or jump to the next scripted moment.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMissionData } from "@/components/MissionDataProvider";
import { CREW } from "@/lib/crew";
import { crewEvents, liveDay, liveSnapshot, timeText, upcomingScript } from "@/lib/live/stream";
import { advanceClock, nextJumpTarget, nextScripted, restoreClock, serialiseClock } from "@/lib/live/clock";
import { pendingRecordFields } from "@/lib/live/recordSync";

const LiveContext = createContext(null);
const TICK_MS = 1000;
const SAVE_EVERY_MS = 15000;

export function LiveProvider({ children }) {
  const { db, status, today, version, rollOverDay, saveLiveClock, getLiveClock, saveCheckIn } = useMissionData();
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
    const saved = getLiveClock();
    // "Load demo mission" clears the saved clock: start the demo day again at 08:00 even if the app
    // stayed open. Otherwise keep the running clock.
    const next = c && c.day === today && saved ? c : restoreClock(saved, today);
    setClock(next);
    // Saved straight away, so an empty saved clock only ever means "Load demo mission was pressed".
    if (next !== c) saveLiveClock(serialiseClock(next));
    // version changes after Load demo mission / Reset data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, db, today, version]);

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

  // Live events that change today's record (e.g. Nakamura's red-limit reading and chest-pain report)
  // are saved once the clock passes them, so Today, Crew, the banner and Summary agree with the Live
  // Monitor. pendingRecordFields returns nothing once the record has them, so this never repeats.
  const syncing = useRef(false);
  useEffect(() => {
    // Read the clock from the ref: it's updated at once when "Load demo mission" restarts the day, so
    // an old minute from this render can never write an event back into the fresh demo records.
    const c = clockRef.current;
    if (!days || !db || !c || c.day !== today || syncing.current || status !== "ready") return;
    const now = Math.floor(c.minute);
    const updates = CREW.map((m) => {
      const stored = db.loadDailyRecords(m.id, { fromDay: today, toDay: today })[0] ?? null;
      const fields = pendingRecordFields(liveSnapshot(days[m.id], now).events, stored);
      return fields ? [m.id, fields] : null;
    }).filter(Boolean);
    if (updates.length === 0) return;
    syncing.current = true;
    (async () => {
      try {
        for (const [id, fields] of updates) await saveCheckIn(id, fields);
      } catch {
        // Not saved this time; it's tried again on the next minute.
      } finally {
        syncing.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, days, today, status, version]);

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
    const crew = Object.fromEntries(CREW.map((m) => [m.id, liveSnapshot(days[m.id], clock.minute)]));
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
      // Seconds too at real-time speed, so the clock visibly ticks.
      clockText: clock.speed === 1 ? `${timeText(minute)}:${String(Math.floor((clock.minute % 1) * 60)).padStart(2, "0")}` : timeText(minute),
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
        const n = nextJumpTarget(c);
        return n ? { ...c, minute: n.at - 1 } : c;
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
