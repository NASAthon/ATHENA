"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OctagonAlert, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { useLive } from "@/components/LiveProvider";
import { useCrew } from "@/components/CrewProvider";
import { CREW } from "@/lib/crew";
import { focusRing } from "@/lib/ui";
import { appPathname } from "@/lib/basePath";

const nameOf = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const crewName = Object.fromEntries(CREW.map((m) => [m.id, m.name]));

// The most serious live event of any astronaut still in that state (or a recent crew-wide event).
function topLiveEvent(live) {
  const rank = { critical: 2, deteriorating: 1 };
  const current = live.events.filter((e) => {
    if (!rank[e.state]) return false;
    if (e.astronautId === null) return live.minute - e.minute < 90; // crew-wide event: 90 minutes
    return live.crew[e.astronautId]?.overall === e.state;
  });
  return current.sort((a, b) => rank[b.state] - rank[a.state] || b.minute - a.minute)[0] ?? null;
}

// The live alert bar (docs/DECISIONS.md › Always-On Live Monitoring), shown on every page except the
// Live Monitor.
function LiveAlertBar({ live, top }) {
  // The guide opens for the astronaut the alert is about (works for a crewmate), not whoever is selected.
  const { setCrewId } = useCrew();
  const isRed = top.state === "critical";
  const colour = isRed ? "var(--status-red)" : "var(--status-amber)";
  const Icon = isRed ? OctagonAlert : TriangleAlert;
  const who = top.astronautId ? `${crewName[top.astronautId]}, ` : "";
  return (
    <div className="px-4">
      <div role="status" className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center gap-3 rounded-lg border-2 px-4 py-2" style={{ borderColor: colour }}>
        <Icon className="size-5 shrink-0" style={{ color: colour }} aria-hidden="true" />
        <p className="min-w-0 flex-1 basis-64 font-semibold">
          <span style={{ color: colour }}>Live, {live.time}:</span> {who}
          {top.text.charAt(0).toLowerCase() + top.text.slice(1)}
        </p>
        {top.emergencyId && (
          <Link
            href={`/emergency?id=${top.emergencyId}`}
            onClick={() => top.astronautId && setCrewId(top.astronautId)}
            className={`inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
          >
            Open emergency guide
          </Link>
        )}
        <Link href="/live" className={`inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
          See Live Monitor
        </Link>
      </div>
    </div>
  );
}

// Alert banners at the top of the main content. ONE banner per problem: the live bar (any astronaut)
// and the stored-data banner (the selected astronaut) are about the same problem when they concern the
// same astronaut, e.g. a live red-limit reading that was also written into today's record. Then only
// the more serious one is shown, and on a tie the live one (it has the time and the live reading).
// Different astronauts, or the crew-wide event, are different problems and each keep their banner.
export default function AlertBanner() {
  const pathname = appPathname(usePathname());
  const { state, member, evaluation } = useTodayEvaluation();
  const live = useLive();
  const top = live.active && pathname !== "/live" ? topLiveEvent(live) : null;
  const stored = storedAlert({ pathname, state, member, evaluation });

  const sameAstronaut = top && stored && top.astronautId === member.id;
  const liveRank = top ? (top.state === "critical" ? 2 : 1) : 0;
  const showLive = top && !(sameAstronaut && stored.rank > liveRank);
  const showStored = stored && !(sameAstronaut && liveRank >= stored.rank);
  return (
    <>
      {showLive && <LiveAlertBar live={live} top={top} />}
      {showStored && <StoredAlertBanner alert={stored} />}
    </>
  );
}

// What the stored-data banner would say for the selected astronaut (daily drift and red limits), or
// null. Hidden on Today, which shows the full alert card.
function storedAlert({ pathname, state, member, evaluation }) {
  if (state !== "ready" || !evaluation || pathname === "/" || pathname === "/today") return null;
  const red = evaluation.limitBreaches.filter((b) => b.redLimit);
  const level = evaluation.alert.level;
  if (red.length === 0 && level !== "alert" && level !== "escalated") return null;
  const isRed = red.length > 0;
  const text = isRed
    ? `${member.name}: red limit (${red.map((r) => `${nameOf[r.indicatorId]}: ${r.label}`).join("; ")})`
    : level === "escalated"
      ? `${member.name}: drift alert not recovered. Tell the crew and the ground.`
      : `${member.name}: ${evaluation.alert.driftingGroups} indicators drifting from their normal.`;
  return { isRed, rank: isRed ? 2 : 1, text, emergencyId: red.find((r) => r.emergencyId)?.emergencyId ?? null };
}

// The stored-data banner for the selected astronaut.
function StoredAlertBanner({ alert }) {
  const { isRed, text, emergencyId } = alert;
  const colour = isRed ? "var(--status-red)" : "var(--status-amber)";
  const Icon = isRed ? OctagonAlert : TriangleAlert;

  return (
    <div className="px-4">
      <div role="status" className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center gap-3 rounded-lg border-2 px-4 py-2" style={{ borderColor: colour }}>
        <Icon className="size-5 shrink-0" style={{ color: colour }} aria-hidden="true" />
        <p className="flex-1 font-semibold">{text}</p>
        {emergencyId ? (
          <Link
            href={`/emergency?id=${emergencyId}`}
            className={`inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
          >
            Open emergency guide
          </Link>
        ) : (
          <Link href="/today" className={`inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
            See today
          </Link>
        )}
      </div>
    </div>
  );
}
