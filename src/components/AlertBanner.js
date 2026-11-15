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

// The live alert bar (docs/DECISIONS.md › Always-On Live Monitoring): shown on every page except the
// Live Monitor, for the most serious live event of any astronaut who is still in that state.
function LiveAlertBar({ live }) {
  // The guide opens for the astronaut the alert is about (works for a crewmate), not whoever is selected.
  const { setCrewId } = useCrew();
  const rank = { critical: 2, deteriorating: 1 };
  const current = live.events.filter((e) => {
    if (!rank[e.state]) return false;
    if (e.astronautId === null) return live.minute - e.minute < 90; // crew-wide event: 90 minutes
    return live.crew[e.astronautId]?.overall === e.state;
  });
  const top = current.sort((a, b) => rank[b.state] - rank[a.state] || b.minute - a.minute)[0];
  if (!top) return null;
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

// Alert banner at the top of the main content for the astronaut selected in the header: red limits
// first, then drift alerts. Hidden on Today, which shows the full alert card.
export default function AlertBanner() {
  const pathname = appPathname(usePathname());
  const { state, member, evaluation } = useTodayEvaluation();
  const live = useLive();
  const liveBar = live.active && pathname !== "/live" ? <LiveAlertBar live={live} /> : null;
  return (
    <>
      {liveBar}
      <StoredAlertBanner pathname={pathname} state={state} member={member} evaluation={evaluation} />
    </>
  );
}

// The stored-data banner for the selected astronaut (daily drift and red limits). Hidden on Today,
// which shows the full alert card.
function StoredAlertBanner({ pathname, state, member, evaluation }) {
  if (state !== "ready" || !evaluation || pathname === "/" || pathname === "/today") return null;

  const red = evaluation.limitBreaches.filter((b) => b.redLimit);
  const level = evaluation.alert.level;
  if (red.length === 0 && level !== "alert" && level !== "escalated") return null;

  const isRed = red.length > 0;
  const colour = isRed ? "var(--status-red)" : "var(--status-amber)";
  const Icon = isRed ? OctagonAlert : TriangleAlert;
  const text = isRed
    ? `${member.name}: red limit (${red.map((r) => `${nameOf[r.indicatorId]}: ${r.label}`).join("; ")})`
    : level === "escalated"
      ? `${member.name}: drift alert not recovered. Tell the crew and the ground.`
      : `${member.name}: ${evaluation.alert.driftingGroups} indicators drifting from their normal.`;
  const emergencyId = red.find((r) => r.emergencyId)?.emergencyId;

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
