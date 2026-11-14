"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_MISSION_MODE, MISSION_MODES } from "@/data";
import { useMissionData } from "@/components/MissionDataProvider";

// The mission mode (ISS, Lunar Gateway, Mars Transit) shared by every screen: the header switch
// sets it; the flight-surgeon summary and emergency guides use its Earth-link delay; search can
// switch it. It's remembered on the device (database meta key below), so a reload keeps it.
const MODE_KEY = "mission_mode";
const isMode = (id) => MISSION_MODES.some((m) => m.id === id);

const MissionModeContext = createContext({ modeId: DEFAULT_MISSION_MODE, setModeId: () => {} });

export function MissionModeProvider({ children }) {
  const { db } = useMissionData();
  const [chosen, setChosen] = useState(null);
  // What was stored last time, read once the database is open.
  const stored = useMemo(() => {
    const id = db?.getMeta(MODE_KEY);
    return isMode(id) ? id : null;
  }, [db]);
  const modeId = chosen ?? stored ?? DEFAULT_MISSION_MODE;

  const setModeId = (id) => {
    if (!isMode(id)) return;
    setChosen(id);
    // Saved in the background; if saving fails the choice still applies until reload.
    db?.setMeta(MODE_KEY, id).catch(() => {});
  };

  return <MissionModeContext.Provider value={{ modeId, setModeId }}>{children}</MissionModeContext.Provider>;
}

/** { modeId, setModeId, mode } for the current mission mode. */
export function useMissionMode() {
  const { modeId, setModeId } = useContext(MissionModeContext);
  const mode = MISSION_MODES.find((m) => m.id === modeId) ?? MISSION_MODES[0];
  return { modeId: mode.id, setModeId, mode };
}
