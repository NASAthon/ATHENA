"use client";

// The crew's one-minute check on Today (docs/DECISIONS.md › Always-On Live Monitoring): only what
// no sensor can report. Mood, then "Anything new today?" (No saves an empty symptom list; Yes opens
// the symptom checklist). Vitals come from the live sensor feed, so there is nothing else to type.

import { useState } from "react";
import Link from "next/link";
import { Check, TriangleAlert } from "lucide-react";
import { EMERGENCIES, INDICATORS, SYMPTOMS } from "@/data";
import { RECORD_FIELDS, SYMPTOMS_FIELD } from "@/lib/engine";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { plainFieldError } from "@/lib/readings";
import { focusRing } from "@/lib/ui";

const mood = INDICATORS.find((i) => i.id === "mood");
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));

function Check1({ record }) {
  const { crewId, member } = useCrew();
  const { status, today, saveCheckIn } = useMissionData();
  const savedMood = record?.[RECORD_FIELDS.mood.value] ?? null;
  const savedSymptoms = Array.isArray(record?.[SYMPTOMS_FIELD]) ? record[SYMPTOMS_FIELD] : null;
  const [moodValue, setMoodValue] = useState(savedMood);
  const [newToday, setNewToday] = useState(savedSymptoms ? savedSymptoms.length > 0 : null);
  const [symptoms, setSymptoms] = useState(savedSymptoms ?? []);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState([]);
  const canSave = status === "ready" && today !== null && (moodValue !== null || newToday !== null);
  const redFlags = SYMPTOMS.filter((s) => s.redFlag && newToday && symptoms.includes(s.id));

  const touch = () => setSaved(false);
  const save = async () => {
    setErrors([]);
    const fields = newToday === null ? {} : { [SYMPTOMS_FIELD]: newToday ? symptoms : [] };
    if (moodValue !== null) fields[RECORD_FIELDS.mood.value] = moodValue;
    try {
      const result = await saveCheckIn(crewId, fields);
      if (!result.ok) setErrors(result.errors);
      else setSaved(true);
    } catch (e) {
      setErrors([`Couldn't save: ${e instanceof Error ? e.message : String(e)}`]);
    }
  };

  return (
    <section id="one-minute-check" aria-labelledby="crew-check-heading" className="scroll-mt-4 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 id="crew-check-heading" className="text-base font-bold">
          Your one-minute check
        </h2>
        <span className="text-sm text-muted-foreground">Mood and anything new. Everything else comes from your sensors.</span>
      </div>

      <h3 id="mood-heading" className="mt-2 font-semibold">
        How is your mood today?
      </h3>
      <p className="text-sm text-muted-foreground">{mood.glance}</p>
      <div role="group" aria-labelledby="mood-heading" className="mt-2 grid auto-rows-fr grid-cols-5 gap-2">
        {mood.scale.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={moodValue === value}
            onClick={() => {
              setMoodValue(value);
              touch();
            }}
            className={`min-h-12 rounded-lg border px-2 py-2 text-center ${focusRing} ${moodValue === value ? "border-primary bg-primary/15" : "border-input bg-input/30 hover:bg-accent"}`}
          >
            <span className="block text-base font-bold">{value}</span>
            <span className="block text-sm text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      <h3 id="new-heading" className="mt-3 font-semibold">
        Anything new today?
      </h3>
      <div role="group" aria-labelledby="new-heading" className="mt-1 flex flex-wrap gap-2">
        {[
          [false, "No, nothing new"],
          [true, "Yes, something's new"],
        ].map(([value, text]) => (
          <button
            key={text}
            type="button"
            aria-pressed={newToday === value}
            onClick={() => {
              setNewToday(value);
              touch();
            }}
            className={`min-h-11 rounded-lg border px-4 text-base ${focusRing} ${newToday === value ? "border-primary bg-primary/15 font-semibold" : "border-input bg-input/30 hover:bg-accent"}`}
          >
            {text}
          </button>
        ))}
      </div>

      {newToday && (
        <fieldset className="mt-2">
          <legend className="font-semibold">Tick what you&apos;ve noticed</legend>
          <div className="mt-1 grid auto-rows-fr gap-2 md:grid-cols-2 xl:grid-cols-3">
            {SYMPTOMS.map((s) => (
              <label
                key={s.id}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="checkbox"
                  checked={symptoms.includes(s.id)}
                  onChange={() => {
                    touch();
                    setSymptoms((list) => (list.includes(s.id) ? list.filter((x) => x !== s.id) : [...list, s.id]));
                  }}
                  className="size-5 shrink-0 accent-primary outline-none"
                />
                <span>{s.name}</span>
                {s.redFlag && (
                  <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-destructive">
                    <TriangleAlert aria-hidden="true" className="size-4" />
                    Urgent
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {redFlags.length > 0 && (
        <div role="alert" className="mt-2 rounded-lg border-2 border-destructive p-3">
          <p className="flex items-center gap-2 text-base font-bold">
            <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
            Urgent: open the emergency guide now
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {redFlags.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/emergency?id=${s.emergencyId}`}
                  className={`inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                >
                  {emergencyName[s.emergencyId]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className={`min-h-11 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${focusRing}`}
        >
          Save my one-minute check
        </button>
        <p role="status" className="flex items-center gap-2 font-semibold">
          {saved && (
            <>
              <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} />
              Saved to {member.name}&apos;s record for day {today}.
            </>
          )}
        </p>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 list-disc space-y-1 pl-6 text-destructive">
          {errors.map((e) => (
            <li key={e}>{plainFieldError(e)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A fresh check for each astronaut and day, starting from what is already saved. */
export default function OneMinuteCheck({ record }) {
  const { crewId } = useCrew();
  const { today } = useMissionData();
  return <Check1 key={`${crewId}-${today}`} record={record} />;
}
