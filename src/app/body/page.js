"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BodyMap from "@/components/BodyMap";
import RegionCard from "@/components/RegionCard";
import { useCrew } from "@/components/CrewProvider";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { getRegionStatuses, regionInputFromEvaluation } from "@/lib/regionStatus";
import { REGIONS } from "@/data";
import { focusRing } from "@/lib/ui";

// Body page (Mercy, PR #9): the body map plus the card for the selected region, for the
// astronaut picked in the header. Statuses come from the logic engine's evaluation of the
// astronaut's STORED data (the same as Today), each judged against their own baseline.
// `?region=<id>` opens a region directly (used by search).
function BodyPage() {
  const { crewId, member } = useCrew();
  const { state, evaluation, records, baselines, today } = useTodayEvaluation();
  const requested = useSearchParams().get("region");
  const requestedId = REGIONS.some((r) => r.id === requested) ? requested : null;

  const statuses = useMemo(
    () =>
      state === "ready" && evaluation
        ? getRegionStatuses(regionInputFromEvaluation({ evaluation, records, baselines, today }))
        : getRegionStatuses({ today }),
    [state, evaluation, records, baselines, today],
  );

  // Open the region asked for in the link, otherwise the worst one, so the most important is shown first.
  const worstId = [...statuses].sort((a, b) => b.rank - a.rank)[0]?.id ?? null;
  const defaultId = requestedId ?? worstId;
  // Only a region the user picked is remembered; otherwise the default is worked out on every render,
  // so it updates once the stored data has loaded (on a full page load it starts as "loading").
  const [picked, setPicked] = useState(null);
  const stillValid = picked !== null && picked.crewId === crewId && picked.requestedId === requestedId;
  const selectedId = stillValid ? picked.regionId : defaultId;
  const selected = statuses.find((s) => s.id === selectedId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
      <h1 className="text-2xl font-semibold">Body</h1>
      {state === "empty" ? (
        <p className="mt-2 mb-6 text-muted-foreground">
          No mission data stored yet, so every region shows &quot;No recent data&quot;. Load the demo mission on the{" "}
          <Link href="/crew" className={`rounded text-primary underline ${focusRing}`}>
            Crew page
          </Link>
          .
        </p>
      ) : (
        <p className="mt-2 mb-6 text-muted-foreground">
          {member.name}
          {today != null && ` · mission day ${today}`} · simulated demo mission · each region shows the worst status of the
          readings and recent symptoms linked to it, compared with {member.name.split(" ").pop()}&apos;s own normal
        </p>
      )}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-[3_1_560px]">
          <BodyMap
            statuses={statuses}
            selectedId={selectedId}
            onSelect={(regionId) => setPicked({ crewId, requestedId, regionId })}
          />
        </div>
        <div className="min-w-0 flex-[2_1_340px]">
          <RegionCard status={selected} />
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4"><h1 className="text-2xl font-semibold">Body</h1></main>}>
      <BodyPage />
    </Suspense>
  );
}
