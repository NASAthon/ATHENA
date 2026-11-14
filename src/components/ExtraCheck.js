"use client";

// The one extra check ATHENA asks for when a live reading deteriorates (docs/DECISIONS.md ›
// Always-On Live Monitoring): a cuff blood-pressure reading to confirm the shirt's trend. Typed
// values use the input limits from src/data and are saved to today's record.

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { INDICATORS } from "@/data";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { plainFieldError } from "@/lib/readings";
import { timeText } from "@/lib/live/stream";
import { focusRing } from "@/lib/ui";

const bp = INDICATORS.find((i) => i.id === "bloodPressure");
const FIELD = { systolic: "bpSystolic", diastolic: "bpDiastolic" };

export default function ExtraCheck({ request }) {
  const { crewId } = useCrew();
  const { saveCheckIn } = useMissionData();
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState([]);

  const save = async () => {
    setErrors([]);
    const fields = {};
    for (const f of bp.inputs) {
      const v = Number(values[f.id]);
      if (values[f.id] !== undefined && values[f.id] !== "" && Number.isFinite(v)) fields[FIELD[f.id]] = v;
    }
    if (Object.keys(fields).length < 2) {
      setErrors(["Enter both numbers from the cuff."]);
      return;
    }
    const result = await saveCheckIn(crewId, fields);
    if (!result.ok) setErrors(result.errors);
    else setSaved(true);
  };

  return (
    <section id="extra-check" aria-labelledby="extra-heading" className="scroll-mt-4 rounded-xl border-2 bg-card p-3" style={{ borderColor: "var(--status-amber)" }}>
      <h2 id="extra-heading" className="flex items-center gap-2 text-base font-bold">
        <Info aria-hidden="true" className="size-5" style={{ color: "var(--status-amber)" }} />
        ATHENA needs one extra check from you
      </h2>
      <p className="mt-1">
        Requested at {timeText(request.minute)}: a live reading has stayed outside your normal. Take a <strong>cuff blood-pressure reading now</strong> to confirm it.
      </p>
      {saved ? (
        <p role="status" className="mt-2 flex items-center gap-2 font-semibold">
          <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} /> Cuff reading saved to today&apos;s record. Thank you.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          {bp.inputs.map((f) => (
            <label key={f.id} className="flex flex-col text-sm font-semibold">
              {f.label} ({bp.unit})
              <input
                type="number"
                inputMode="numeric"
                min={f.min}
                max={f.max}
                step={f.step}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                className={`mt-1 min-h-11 w-40 rounded-lg border border-input bg-input/30 px-3 text-base font-normal ${focusRing}`}
              />
            </label>
          ))}
          <button type="button" onClick={save} className={`min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90 ${focusRing}`}>
            Save cuff reading
          </button>
        </div>
      )}
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 list-disc pl-6 text-destructive">
          {errors.map((e) => (
            <li key={e}>{plainFieldError(e)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
