"use client";

import Link from "next/link";
import { useLive } from "@/components/LiveProvider";
import { focusRing } from "@/lib/ui";

// Header indicator on every page: the live feed is running (or paused by the presenter).
export default function LiveChip() {
  const live = useLive();
  if (!live.active) return null;
  return (
    <Link
      href="/live"
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-accent ${focusRing}`}
      aria-label={`${live.paused ? "Live feed paused" : "Live feed running"}, day ${live.day}, ${live.time}. Open the Live Monitor.`}
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full"
        style={{ background: live.paused ? "var(--status-nodata)" : "var(--status-live)", boxShadow: live.paused ? "none" : "0 0 0 4px rgba(74,222,128,0.18)" }}
      />
      <strong>{live.paused ? "Paused" : "Live"}</strong>
      <span className="text-muted-foreground">
        | Day {live.day} | {live.time}
      </span>
    </Link>
  );
}
