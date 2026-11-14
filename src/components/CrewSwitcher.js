"use client";

import { CREW } from "@/lib/crew";
import { useCrew } from "@/components/CrewProvider";
import { focusRing } from "@/lib/ui";

// Picks which astronaut the whole app is showing (shared through CrewProvider).
// Mission day is a placeholder until the mission simulator provides it.
export default function CrewSwitcher() {
  const { crewId, setCrewId } = useCrew();
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
