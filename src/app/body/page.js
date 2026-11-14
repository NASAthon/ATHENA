"use client";

import { useState } from "react";
import BodyMap from "@/components/BodyMap";
import { getRegionStatuses, SAMPLE_RIVERA } from "@/lib/regionStatus";

// TEMPORARY: shows the body map with Rivera's sample data.
// Step 5 replaces this with the full Body page (map + region card).
export default function Page() {
  const [selectedId, setSelectedId] = useState("brain");
  const statuses = getRegionStatuses(SAMPLE_RIVERA);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <h1 className="text-3xl font-semibold">Body</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Commander Rivera · sample data (simulated)
      </p>
      <BodyMap statuses={statuses} selectedId={selectedId} onSelect={setSelectedId} />
    </main>
  );
}