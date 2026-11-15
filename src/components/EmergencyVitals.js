"use client";

// "Record vitals" on the Emergency screen (emergency guidance works for a crewmate:
// pick the affected astronaut, follow the steps, record vitals). Saves to the AFFECTED astronaut's
// record for today through useMissionData().saveCheckIn (validated first), then shows the engine's
// red-limit check (checkReading) so the helper sees straight away if a reading is in a red limit.
// Input limits come from src/data/indicators.js; they only catch typing mistakes.

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Eye, OctagonAlert, TriangleAlert } from "lucide-react";
import { EMERGENCIES, INDICATORS } from "@/data";
import { RECORD_FIELDS, checkReading } from "@/lib/engine";
import { useMissionData } from "@/components/MissionDataProvider";
import { plainFieldError } from "@/lib/readings";
import { focusRing } from "@/lib/ui";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));
// The vitals a helper can take quickly in an emergency.
const VITALS = ["heartRate", "bloodPressure", "spo2", "temperature", "glucose"];
const LEVEL_STYLE = {
  urgent: { label: "Red limit", Icon: OctagonAlert, colour: "var(--status-red)" },
  act: { label: "Act", Icon: TriangleAlert, colour: "var(--status-amber)" },
  watch: { label: "Watch", Icon: Eye, colour: "var(--status-amber)" },
};

// One input per number: [key, label, limits].
const FIELDS = VITALS.flatMap((id) => {
  const ind = byId[id];
  return ind.inputs
    ? ind.inputs.map((f) => [`${id}.${f.id}`, `${ind.name}: ${f.label}`, f, RECORD_FIELDS[id][f.id], ind.unit])
    : [[id, ind.name, ind.input, RECORD_FIELDS[id].value, ind.unit]];
});

export default function EmergencyVitals({ astronautId, astronautName, currentGuideId = null }) {
  const { saveCheckIn, today, status } = useMissionData();
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null); // { day, breaches }
  const [errors, setErrors] = useState([]);

  const save = async () => {
    setErrors([]);
    setResult(null);
    const fields = {};
    for (const [key, , , field] of FIELDS) {
      const raw = values[key];
      if (raw !== undefined && raw !== "" && Number.isFinite(Number(raw))) fields[field] = Number(raw);
    }
    if (Object.keys(fields).length === 0) {
      setErrors(["Enter at least one reading."]);
      return;
    }
    try {
      const saved = await saveCheckIn(astronautId, fields);
      if (!saved.ok) return setErrors(saved.errors.map(plainFieldError));
      setResult({ day: today, breaches: checkReading(saved.record, saved.history) });
    } catch (e) {
      setErrors([`Couldn't save: ${e instanceof Error ? e.message : String(e)}`]);
    }
  };

  if (today === null) {
    return (
      <p className="text-muted-foreground">
        No mission stored, so vitals can&apos;t be saved. Write them down and tell the flight surgeon.
      </p>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground">
        For {astronautName}. Skip anything you can&apos;t measure safely. Saved to their record for day {today}.
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {FIELDS.map(([key, label, limits, , unit]) => (
          <div key={key}>
            <label htmlFor={`vital-${key}`} className="block font-semibold">
              {label} <span className="font-normal text-muted-foreground">({unit})</span>
            </label>
            <input
              id={`vital-${key}`}
              type="number"
              inputMode="decimal"
              min={limits?.min}
              max={limits?.max}
              step={limits?.step ?? "any"}
              value={values[key] ?? ""}
              onChange={(e) => {
                setValues((v) => ({ ...v, [key]: e.target.value }));
                setResult(null);
              }}
              className={`mt-2 min-h-11 w-full rounded-lg border border-input bg-input/30 px-4 text-base ${focusRing}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={status === "busy"}
        className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 ${focusRing}`}
      >
        Save vitals
      </button>

      {errors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 font-semibold" style={{ color: "var(--status-red)" }}>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {result && (
        <div role="status" className="mt-2 space-y-2">
          <p className="flex items-center gap-2 font-semibold">
            <CircleCheck className="size-5" aria-hidden="true" style={{ color: "var(--status-steady)" }} />
            Saved to {astronautName}&apos;s record (Day {result.day}).
          </p>
          {result.breaches.length === 0 ? (
            <p className="text-muted-foreground">No reading is outside the reference ranges. Keep following the steps.</p>
          ) : (
            <ul className="space-y-2">
              {result.breaches.map((b) => {
                const s = LEVEL_STYLE[b.level] ?? LEVEL_STYLE.watch;
                return (
                  <li key={`${b.indicatorId}-${b.label}`} className="rounded-lg border-2 p-3" style={{ borderColor: s.colour }}>
                    <p className="flex items-center gap-2 font-semibold" style={{ color: s.colour }}>
                      <s.Icon className="size-5" aria-hidden="true" />
                      {s.label}: {byId[b.indicatorId]?.name}: {b.label}
                    </p>
                    <p className="mt-1">{b.action}</p>
                    {b.emergencyId && b.emergencyId !== currentGuideId && (
                      <Link href={`/emergency?id=${b.emergencyId}`} className={`mt-2 inline-flex min-h-11 items-center rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}>
                        Open: {emergencyName[b.emergencyId]}
                      </Link>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.basisLabel}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
