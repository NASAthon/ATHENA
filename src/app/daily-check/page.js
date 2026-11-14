"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Eye, OctagonAlert, TriangleAlert, Volume2 } from "lucide-react";
import { INDICATORS, SYMPTOMS, EMERGENCIES } from "@/data";
import { RECORD_FIELDS, SYMPTOMS_FIELD, checkReading } from "@/lib/engine";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { checkInStreak } from "@/lib/checkIn";
import { plainFieldError } from "@/lib/readings";
import { focusRing } from "@/lib/ui";

// Daily check (layout and design by Izabela, PR #8).
// All health text, units, steps, limits and symptoms come from src/data (AGENTS.md rule),
// so the screen always matches the verified research.

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const FORM_ORDER = ["sleep", "heartRate", "bloodPressure", "glucose", "temperature", "exercise", "spo2"];
const WIDE = new Set(["exercise", "spo2"]);
const mood = byId.mood;
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));

const card = "rounded-xl border border-border bg-card p-4";

// How each engine band level is shown: always icon + text label + colour token.
const LEVEL_STYLE = {
  urgent: { label: "Urgent", Icon: OctagonAlert, colour: "var(--status-red)" },
  act: { label: "Act", Icon: TriangleAlert, colour: "var(--status-amber)" },
  watch: { label: "Watch", Icon: Eye, colour: "var(--status-amber)" },
};

const plainError = plainFieldError;

// Turns the form into the engine's daily record (src/lib/engine/indicators.js › RECORD_FIELDS),
// so the form and the logic engine always use the same field names.
function toRecord(values, moodValue, symptoms) {
  const record = { [SYMPTOMS_FIELD]: symptoms };
  for (const id of FORM_ORDER) {
    const fields = RECORD_FIELDS[id];
    const parts = byId[id].inputs ? byId[id].inputs.map((f) => [f.id, values[`${id}.${f.id}`]]) : [["value", values[id]]];
    for (const [part, raw] of parts) {
      if (raw !== undefined && raw !== "" && Number.isFinite(Number(raw))) record[fields[part]] = Number(raw);
    }
  }
  if (moodValue != null) record[RECORD_FIELDS.mood.value] = moodValue;
  return record;
}
const inputClass = `mt-2 min-h-12 w-full rounded-lg border border-input bg-input/30 px-4 text-lg ${focusRing}`;

// One input box. Limits come from the indicator data (plausibility bounds, not health thresholds).
function NumberInput({ id, label, unit, limits, value, onChange, onFocus }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label} <span className="font-normal text-muted-foreground">({unit})</span>
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={limits?.min}
        max={limits?.max}
        step={limits?.step ?? "any"}
        value={value}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

// A fresh form for each astronaut: switching crew in the header never carries one person's
// readings over to another.
function DailyCheckForCrew() {
  const { crewId } = useCrew();
  return <DailyCheck key={crewId} />;
}

function DailyCheck() {
  const [values, setValues] = useState({});
  const [moodValue, setMoodValue] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  // `?guide=<indicator id>` (from search) opens that indicator's "How to measure" guide.
  const guide = useSearchParams().get("guide");
  const guideId = guide && byId[guide] ? guide : null;
  const [focusId, setFocusId] = useState(guideId ?? "bloodPressure");
  const [lastGuide, setLastGuide] = useState(guideId);
  if (guideId !== lastGuide) {
    setLastGuide(guideId);
    if (guideId) setFocusId(guideId);
  }
  const [result, setResult] = useState(null);
  const [saveInfo, setSaveInfo] = useState(null); // { day, streak } after a successful save
  const [errors, setErrors] = useState([]);
  const { crewId, member } = useCrew();
  const { db, status, today, saveCheckIn } = useMissionData();
  const canSave = status === "ready" && today !== null;

  const focused = byId[focusId];
  const redFlags = SYMPTOMS.filter((s) => s.redFlag && symptoms.includes(s.id));

  // Any edit after saving clears the result and the "Saved…" message (the edit isn't saved yet).
  const clearOutcome = () => {
    setResult(null);
    setSaveInfo(null);
    setErrors([]);
  };

  const setValue = (key) => (value) => {
    setValues((v) => ({ ...v, [key]: value }));
    clearOutcome();
  };

  const toggleSymptom = (id) => {
    clearOutcome();
    setSymptoms((list) => (list.includes(id) ? list.filter((s) => s !== id) : [...list, id]));
  };

  const readAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const steps = focused.howToMeasure.map((s) => s.step).join(" ");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${focused.name}. ${steps}`));
  };

  // Saves today's readings to the selected astronaut's stored record (validated first,
  // src/lib/dailyRecord.js), then checks them with the engine's red-limit check, using the
  // previous days for the streak bands.
  const save = async () => {
    setErrors([]);
    setResult(null);
    setSaveInfo(null);
    try {
      const saved = await saveCheckIn(crewId, toRecord(values, moodValue, symptoms));
      if (!saved.ok) {
        setErrors(saved.errors);
        return;
      }
      setResult(checkReading(saved.record, saved.history));
      setSaveInfo({ day: today, streak: checkInStreak(db.loadDailyRecords(crewId), today) });
    } catch (e) {
      setErrors([`Couldn't save: ${e instanceof Error ? e.message : String(e)}`]);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
      <h1 className="text-3xl font-bold">Daily check</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Skip anything you can&apos;t measure today. Tap a box to see how to measure it.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <section className={card} aria-labelledby="readings-heading">
            <h2 id="readings-heading" className="text-xl font-bold">
              Readings
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {FORM_ORDER.map((id) => {
                const ind = byId[id];
                const title = ind.optional ? `${ind.name} (optional)` : ind.name;
                if (ind.inputs) {
                  return (
                    <fieldset key={id} className="md:col-span-2" onFocus={() => setFocusId(id)}>
                      <legend className="font-semibold">{title}</legend>
                      <div className="grid gap-4 md:grid-cols-2">
                        {ind.inputs.map((f) => (
                          <NumberInput
                            key={f.id}
                            id={`${id}-${f.id}`}
                            label={f.label}
                            unit={ind.unit}
                            limits={f}
                            value={values[`${id}.${f.id}`] ?? ""}
                            onChange={setValue(`${id}.${f.id}`)}
                            onFocus={() => setFocusId(id)}
                          />
                        ))}
                      </div>
                    </fieldset>
                  );
                }
                return (
                  <div key={id} className={WIDE.has(id) ? "md:col-span-1" : ""}>
                    <NumberInput
                      id={id}
                      label={title}
                      unit={ind.unit}
                      limits={ind.input}
                      value={values[id] ?? ""}
                      onChange={setValue(id)}
                      onFocus={() => setFocusId(id)}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className={card} aria-labelledby="mood-heading">
            <h2 id="mood-heading" className="text-xl font-bold">
              How is your mood today?
            </h2>
            <p className="mt-1 text-muted-foreground">{mood.glance}</p>
            <div className="mt-4 grid auto-rows-fr grid-cols-5 gap-3">
              {mood.scale.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={moodValue === value}
                  onFocus={() => setFocusId("mood")}
                  onClick={() => {
                    setMoodValue(value);
                    clearOutcome();
                  }}
                  className={`min-h-16 rounded-lg border px-2 py-3 text-center ${focusRing} ${
                    moodValue === value
                      ? "border-primary bg-primary/15"
                      : "border-input bg-input/30 hover:bg-accent"
                  }`}
                >
                  <span className="block text-xl font-bold">{value}</span>
                  <span className="block text-sm text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={card} aria-labelledby="symptoms-heading">
            <h2 id="symptoms-heading" className="text-xl font-bold">
              Any of these today?
            </h2>
            <div className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SYMPTOMS.map((s) => (
                <label
                  key={s.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-input bg-input/30 px-4 hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s.id)}
                    onChange={() => toggleSymptom(s.id)}
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

            {redFlags.length > 0 && (
              <div role="alert" className="mt-3 rounded-lg border-2 border-destructive p-4">
                <p className="flex items-center gap-2 text-base font-bold">
                  <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
                  Urgent: open the emergency guide now
                </p>
                <ul className="mt-3 space-y-2">
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
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className={`min-h-12 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${focusRing}`}
            >
              Save today&apos;s check
            </button>
            <Link href="/today" className={`rounded text-primary underline ${focusRing}`}>
              Cancel
            </Link>
            <p role="status" className="flex items-center gap-2 font-semibold">
              {saveInfo && (
                <>
                  <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} />
                  Saved to {member.name}&apos;s record for mission day {saveInfo.day}. Check-in streak: {saveInfo.streak}{" "}
                  {saveInfo.streak === 1 ? "day" : "days"}.
                </>
              )}
            </p>
          </div>
          {status === "ready" && today === null && (
            <p className="text-muted-foreground">
              No mission data stored, so there&apos;s nothing to save to. Load the demo mission on the{" "}
              <Link href="/crew" className={`rounded text-primary underline ${focusRing}`}>
                Crew page
              </Link>
              .
            </p>
          )}
          {errors.length > 0 && (
            <div role="alert" className="rounded-lg border-2 border-destructive p-4">
              <p className="flex items-center gap-2 font-semibold">
                <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
                Not saved. Please check:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {errors.map((e) => (
                  <li key={e}>{plainError(e)}</li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <section className={card} aria-labelledby="result-heading">
              <h2 id="result-heading" className="text-xl font-bold">
                Today&apos;s result
              </h2>
              {result.length === 0 ? (
                <p className="mt-3 flex items-center gap-2 text-base">
                  <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} />
                  No flags on today&apos;s readings. Trends are checked against your own baseline over the coming days.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {result.map((r) => {
                    const { label, Icon, colour } = LEVEL_STYLE[r.level];
                    return (
                      <li key={r.indicatorId} className="rounded-lg border border-border p-4" style={{ borderColor: colour }}>
                        <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
                          <span className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm" style={{ borderColor: colour, color: colour }}>
                            <Icon aria-hidden="true" className="size-4" />
                            {label}
                          </span>
                          {byId[r.indicatorId].name}: {r.label}
                        </p>
                        <p className="mt-1 text-muted-foreground">{r.rule}</p>
                        <p className="mt-2">{r.action}</p>
                        {r.emergencyId && (
                          <Link
                            href={`/emergency?id=${r.emergencyId}`}
                            className={`mt-3 inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                          >
                            Open: {emergencyName[r.emergencyId]}
                          </Link>
                        )}
                        <p className="mt-3 text-sm text-muted-foreground">
                          {r.basisLabel}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-4 text-sm text-muted-foreground">Not medical advice. The flight surgeon makes every medical decision.</p>
            </section>
          )}
        </div>

        <aside className={`${card} h-fit lg:sticky lg:top-4`} aria-live="polite">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">How to measure</p>
          <h2 className="mt-3 text-xl font-bold">{focused.name}</h2>
          <p className="mt-1 text-muted-foreground">{focused.glance}</p>

          {focused.howToMeasure.length > 0 && (
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base">
              {focused.howToMeasure.map((s) => (
                <li key={s.step}>{s.step}</li>
              ))}
            </ol>
          )}
          {focused.spaceNote && <p className="mt-3 text-muted-foreground">{focused.spaceNote}</p>}

          <p className="mt-3 text-sm text-muted-foreground">
            Ranges are general clinical reference ranges, not NASA flight standards. Not medical advice.
          </p>

          {focused.howToMeasure.length > 0 && (
            <button
              type="button"
              onClick={readAloud}
              className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-input hover:bg-accent ${focusRing}`}
            >
              <Volume2 aria-hidden="true" className="size-5" />
              Read these steps aloud
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function DailyCheckPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5"><h1 className="text-3xl font-bold">Daily check</h1></main>}>
      <DailyCheckForCrew />
    </Suspense>
  );
}
