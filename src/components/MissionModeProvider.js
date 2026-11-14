"use client";

import { createContext, useContext, useState } from "react";
import { DEFAULT_MISSION_MODE, MISSION_MODES } from "@/data";

// The mission mode (ISS, Lunar Gateway, Mars Transit) shared by every screen: the header switch
// sets it; the flight-surgeon summary uses its Earth-link delay; search can switch it.
const MissionModeContext = createContext({ modeId: DEFAULT_MISSION_MODE, setModeId: () => {} });

export function MissionModeProvider({ children }) {
  const [modeId, setModeId] = useState(DEFAULT_MISSION_MODE);
  return <MissionModeContext.Provider value={{ modeId, setModeId }}>{children}</MissionModeContext.Provider>;
}

/** { modeId, setModeId, mode } for the current mission mode. */
export function useMissionMode() {
  const { modeId, setModeId } = useContext(MissionModeContext);
  const mode = MISSION_MODES.find((m) => m.id === modeId) ?? MISSION_MODES[0];
  return { modeId: mode.id, setModeId, mode };
}
