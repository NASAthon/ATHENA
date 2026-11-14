"use client";

// Opens the on-device database once and shares the stored mission with every screen:
// today's mission day, what is stored per astronaut, and the two demo controls.
// docs/DECISIONS.md › Database: "Seed 3 simulated astronauts on first run, with a 'reset demo' button."

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDatabase } from "@/lib/db";
import { loadDemoMission, missionSummary, resetData, seedOnFirstRun } from "@/lib/sim/demo";
import { CREW } from "@/lib/crew";

const CREW_IDS = CREW.map((member) => member.id);
const MissionDataContext = createContext(null);

export function MissionDataProvider({ children }) {
  const [db, setDb] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | busy | error
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ today: null, crew: [] });
  // Bumped after every change so screens reading the database know to read again.
  const [version, setVersion] = useState(0);

  const refresh = useCallback((database) => {
    setSummary(missionSummary(database, CREW_IDS));
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const database = await getDatabase();
        await seedOnFirstRun(database);
        if (cancelled) return;
        setDb(database);
        refresh(database);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const run = useCallback(
    async (action) => {
      if (!db) return;
      setStatus("busy");
      setError(null);
      try {
        await action(db);
        refresh(db);
        setStatus("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("ready");
        throw e;
      }
    },
    [db, refresh],
  );

  const value = useMemo(
    () => ({
      db,
      status,
      error,
      today: summary.today,
      crew: summary.crew,
      version,
      loadDemo: () => run((d) => loadDemoMission(d)),
      reset: () => run((d) => resetData(d)),
    }),
    [db, status, error, summary, version, run],
  );

  return <MissionDataContext.Provider value={value}>{children}</MissionDataContext.Provider>;
}

/** The stored mission and the demo controls. Use inside MissionDataProvider. */
export function useMissionData() {
  const value = useContext(MissionDataContext);
  if (!value) throw new Error("useMissionData must be used inside <MissionDataProvider>.");
  return value;
}
