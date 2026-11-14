"use client";

// Demo controls: "Load demo mission" and "Reset data" (CHECKLIST §1).
// Inline confirmation instead of browser dialogs; results are announced with aria-live.

import { useState } from "react";
import { Database, RotateCcw, Trash2, Check, TriangleAlert } from "lucide-react";
import { useMissionData } from "@/components/MissionDataProvider";
import { CREW } from "@/lib/crew";
import { focusRing } from "@/lib/ui";

const card = "rounded-xl border border-border bg-card p-4";
const button = `inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-medium disabled:opacity-50 ${focusRing}`;

export default function MissionDataPanel() {
  const { status, error, today, crew, loadDemo, reset } = useMissionData();
  const [confirming, setConfirming] = useState(null); // null | "load" | "reset"
  const [message, setMessage] = useState("");
  const busy = status !== "ready";
  const hasData = crew.some((c) => c.records > 0);

  async function act(kind) {
    setConfirming(null);
    setMessage(kind === "load" ? "Loading demo mission…" : "Clearing all data…");
    try {
      if (kind === "load") await loadDemo();
      else await reset();
      setMessage(kind === "load" ? `Demo mission loaded for all ${CREW.length} astronauts.` : "All data cleared. Nothing is stored now.");
    } catch {
      setMessage("That didn't work. Details below.");
    }
  }

  // Loading over existing data replaces it, so it asks first; on an empty app it runs straight away.
  const onLoad = () => (hasData ? setConfirming("load") : act("load"));

  return (
    <section aria-labelledby="mission-data-heading" className={card}>
      <h2 id="mission-data-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Database aria-hidden="true" className="size-5" /> Mission data
      </h2>
      <p className="mt-1 text-muted-foreground">
        Stored on this device only.{" "}
        {status === "loading"
          ? "Opening the database…"
          : today === null
            ? "No mission data stored."
            : `Today is mission day ${today}.`}
      </p>

      {status !== "loading" && status !== "error" && (
        <ul className="mt-4 grid auto-rows-fr gap-2 sm:grid-cols-3">
          {CREW.map((member) => {
            const c = crew.find((x) => x.id === member.id);
            return (
              <li key={member.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c && c.records > 0
                    ? `${c.records} daily records, up to day ${c.latestDay}`
                    : "No records"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Baselines: pre-flight {c?.preflight ? "saved" : "not yet"} · in-flight {c?.inflight ? "saved" : "not yet"}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {confirming ? (
        <div role="group" aria-labelledby="confirm-text" className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--status-amber)" }}>
          <p id="confirm-text" className="flex items-start gap-2">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" style={{ color: "var(--status-amber)" }} />
            {confirming === "reset"
              ? "Delete every stored record and baseline? This can't be undone. The app stays empty until you load the demo mission."
              : "Replace everything stored with the demo mission? Records entered so far will be deleted."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => act(confirming)}
              className={`${button} ${confirming === "reset" ? "border-destructive bg-destructive text-background hover:bg-destructive/90" : "border-primary bg-primary text-primary-foreground"}`}
            >
              <Check aria-hidden="true" className="size-4" />
              {confirming === "reset" ? "Yes, delete everything" : "Yes, replace with demo"}
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={`${button} border-border`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={onLoad} className={`${button} border-primary bg-primary text-primary-foreground`}>
            <RotateCcw aria-hidden="true" className="size-4" /> Load demo mission
          </button>
          <button type="button" disabled={busy || !hasData} onClick={() => setConfirming("reset")} className={`${button} border-destructive text-destructive hover:bg-destructive/15`}>
            <Trash2 aria-hidden="true" className="size-4" /> Reset data
          </button>
        </div>
      )}

      <p aria-live="polite" className="mt-4 min-h-6 text-sm">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
