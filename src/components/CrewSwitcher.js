"use client";

import { useState } from "react";
import { CREW } from "@/lib/crew";
import { focusRing } from "@/lib/ui";

// Picks which astronaut the app is showing. The selection is local for now;
// wire it to shared state once the data layer (CHECKLIST section 1) exists.
// Mission day is a placeholder until the mission simulator provides it.
export default function CrewSwitcher() {
  const [crewId, setCrewId] = useState(CREW[0].id);
  const missionDay = 1;

  return (
    <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm">
      <span className="text-muted-foreground">Day {missionDay}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <label htmlFor="crew-switcher" className="sr-only">
        Astronaut
      </label>
      <select
        id="crew-switcher"
        value={crewId}
        onChange={(event) => setCrewId(event.target.value)}
        className={`min-h-9 rounded-md bg-transparent pr-1 font-medium text-foreground ${focusRing}`}
      >
        {CREW.map((member) => (
          <option key={member.id} value={member.id} className="bg-popover text-popover-foreground">
            {member.name}
          </option>
        ))}
      </select>
    </div>
  );
}
