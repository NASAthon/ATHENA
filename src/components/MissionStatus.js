"use client";

import { useMissionMode } from "@/components/MissionModeProvider";
import { MISSION_MODES } from "@/data";
import { focusRing } from "@/lib/ui";

// Mission mode switch (design by Izabela, PR #8), shown in the header's top row.
// The selected mode is shared app-wide (MissionModeProvider).
export default function MissionStatus() {
  const { modeId, setModeId } = useMissionMode();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="mission-mode" className="text-sm text-muted-foreground">
        Mission mode
      </label>
      <select
        id="mission-mode"
        value={modeId}
        onChange={(event) => setModeId(event.target.value)}
        className={`min-h-11 rounded-lg border border-input bg-input/30 px-3 text-foreground ${focusRing}`}
      >
        {MISSION_MODES.map((m) => (
          <option key={m.id} value={m.id} className="bg-popover text-popover-foreground">
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
