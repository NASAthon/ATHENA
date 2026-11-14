"use client";

import { useState } from "react";
import BodyMap from "@/components/BodyMap";
import RegionCard from "@/components/RegionCard";
import { getRegionStatuses, SAMPLE_RIVERA } from "@/lib/regionStatus";

// Body page: the body map plus the card for the selected region.
// TEMPORARY: uses Rivera's sample data. Swap SAMPLE_RIVERA for the logic owner's
// real output for the selected astronaut before submission.
export default function Page() {
  const statuses = getRegionStatuses(SAMPLE_RIVERA);

  // Start on the worst region, so the most important one is open first.
  const worst = [...statuses].sort((a, b) => b.rank - a.rank)[0];
  const [selectedId, setSelectedId] = useState(worst?.id ?? null);
  const selected = statuses.find((s) => s.id === selectedId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <h1 className="text-3xl font-semibold">Body</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Commander Rivera · sample data (simulated) · each region shows the worst status of the readings linked to it
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[3_1_560px]">
          <BodyMap statuses={statuses} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="min-w-0 flex-[2_1_340px]">
          <RegionCard status={selected} />
        </div>
      </div>
    </main>
  );
}