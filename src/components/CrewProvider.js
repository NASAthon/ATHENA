"use client";

import { createContext, useContext, useState } from "react";
import { CREW } from "@/lib/crew";

// Which astronaut the whole app is showing. Set by CrewSwitcher in the header and read by
// pages (e.g. Body), so every screen shows that crew member's own health against their own baseline.
const CrewContext = createContext({ crewId: CREW[0].id, setCrewId: () => {} });

export function CrewProvider({ children }) {
  const [crewId, setCrewId] = useState(CREW[0].id);
  return <CrewContext.Provider value={{ crewId, setCrewId }}>{children}</CrewContext.Provider>;
}

export function useCrew() {
  const { crewId, setCrewId } = useContext(CrewContext);
  const member = CREW.find((m) => m.id === crewId) ?? CREW[0];
  return { crewId, setCrewId, member };
}
