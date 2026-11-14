"use client";

import { useState } from "react";
import BodyMap from "@/components/BodyMap";
import RegionCard from "@/components/RegionCard";
import { useCrew } from "@/components/CrewProvider";
import { getRegionStatuses } from "@/lib/regionStatus";
import { SAMPLE_CREW_STATUS } from "@/lib/sampleData";

// Body page (Mercy, PR #9): the body map plus the card for the selected region, for the
// astronaut picked in the header. Each region is judged against that astronaut's own baseline.
// TEMPORARY: simulated sample statuses until the mission simulator and logic engine are wired in.
export default function Page() {
  const { crewId, member } = useCrew();
  const statuses = getRegionStatuses(SAMPLE_CREW_STATUS[crewId]);

  // Open the worst region first, so the most important one is shown straight away.
  const worstId = [...statuses].sort((a, b) => b.rank - a.rank)[0]?.id ?? null;
  const [picked, setPicked] = useState({ crewId, regionId: worstId });
  const selectedId = picked.crewId === crewId ? picked.regionId : worstId;
  const selected = statuses.find((s) => s.id === selectedId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <h1 className="text-3xl font-semibold">Body</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        {member.name} · sample data (simulated) · each region shows the worst status of the readings linked to it,
        compared with {member.name.split(" ").pop()}&apos;s own normal
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[3_1_560px]">
          <BodyMap
            statuses={statuses}
            selectedId={selectedId}
            onSelect={(regionId) => setPicked({ crewId, regionId })}
          />
        </div>
        <div className="min-w-0 flex-[2_1_340px]">
          <RegionCard status={selected} />
        </div>
      </div>
    </main>
  );
}
