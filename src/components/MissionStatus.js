"use client";

import { Radio, WifiOff } from "lucide-react";
import { MISSION_MODES, SOURCES } from "@/data";
import { useMissionMode } from "@/components/MissionModeProvider";
import { focusRing } from "@/lib/ui";

// Mission mode switch and Earth-link delay (design by Izabela, PR #8).
// The delay text comes from src/data/missionModes.js; modes without a sourced delay show none.
// The selected mode is shared app-wide (MissionModeProvider).
export default function MissionStatus() {
  const { modeId, setModeId, mode } = useMissionMode();
  const delaySource = mode.earthDelay ? SOURCES[mode.earthDelay.sourceId] : null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="mission-mode" className="text-muted-foreground">
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

      <span className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm">
        <Radio aria-hidden="true" className="size-4" />
        {mode.earthDelay ? (
          <>
            Earth link: {mode.earthDelay.text}
            <a
              href={delaySource.url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex min-h-11 items-center rounded text-muted-foreground underline underline-offset-2 ${focusRing}`}
            >
              Source
            </a>
          </>
        ) : (
          <>Earth link: {mode.environment}</>
        )}
      </span>

      <span className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm">
        <WifiOff aria-hidden="true" className="size-4" />
        Works offline
      </span>
    </div>
  );
}
