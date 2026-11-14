"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OctagonAlert, TriangleAlert } from "lucide-react";
import { INDICATORS } from "@/data";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import { focusRing } from "@/lib/ui";

const nameOf = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));

// Alert banner at the top of every screen (CHECKLIST › Layout) for the astronaut selected in the
// header: red limits first, then drift alerts. Hidden on Today, which shows the full alert card.
export default function AlertBanner() {
  const pathname = usePathname();
  const { state, member, evaluation } = useTodayEvaluation();
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
  );
}
