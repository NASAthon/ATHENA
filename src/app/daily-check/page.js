"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, TriangleAlert, Volume2 } from "lucide-react";
import { INDICATORS, SYMPTOMS, SOURCES, EMERGENCIES } from "@/data";
import { focusRing } from "@/lib/ui";

// Daily check (layout and design by Izabela, PR #8).
// All health text, units, steps, limits and symptoms come from src/data (AGENTS.md rule),
// so the screen always matches the verified research.

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const FORM_ORDER = ["sleep", "heartRate", "bloodPressure", "glucose", "temperature", "exercise", "spo2"];
const WIDE = new Set(["exercise", "spo2"]);
const mood = byId.mood;
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));

const card = "rounded-2xl border border-border bg-card p-6";
const inputClass = `mt-2 min-h-14 w-full rounded-lg border border-input bg-input/30 px-4 text-xl ${focusRing}`;

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

export default function DailyCheck() {
  const [values, setValues] = useState({});
  const [moodValue, setMoodValue] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [focusId, setFocusId] = useState("bloodPressure");
  const [saved, setSaved] = useState(false);

  const focused = byId[focusId];
  const redFlags = SYMPTOMS.filter((s) => s.redFlag && symptoms.includes(s.id));

  const setValue = (key) => (value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };

  const toggleSymptom = (id) => {
    setSaved(false);
    setSymptoms((list) => (list.includes(id) ? list.filter((s) => s !== id) : [...list, id]));
  };

  const readAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const steps = focused.howToMeasure.map((s) => s.step).join(" ");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${focused.name}. ${steps}`));
  };

  const save = () => {
    // Storage comes with the data layer (CHECKLIST section 1). Until then, nothing is saved.
    setSaved(true);
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="text-4xl font-bold">Daily check</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Skip anything you can&apos;t measure today. Tap a box to see how to measure it.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className={card} aria-labelledby="readings-heading">
            <h2 id="readings-heading" className="text-2xl font-bold">
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
            <h2 id="mood-heading" className="text-2xl font-bold">
              How is your mood today?
            </h2>
            <p className="mt-1 text-muted-foreground">{mood.glance}</p>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {mood.scale.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={moodValue === value}
                  onFocus={() => setFocusId("mood")}
                  onClick={() => {
                    setMoodValue(value);
                    setSaved(false);
                  }}
                  className={`min-h-20 rounded-lg border px-2 py-3 text-center ${focusRing} ${
                    moodValue === value
                      ? "border-primary bg-primary/15"
                      : "border-input bg-input/30 hover:bg-accent"
                  }`}
                >
                  <span className="block text-2xl font-bold">{value}</span>
                  <span className="block text-sm text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={card} aria-labelledby="symptoms-heading">
            <h2 id="symptoms-heading" className="text-2xl font-bold">
              Any of these today?
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SYMPTOMS.map((s) => (
                <label
                  key={s.id}
                  className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-input bg-input/30 px-4 hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s.id)}
                    onChange={() => toggleSymptom(s.id)}
                    className="size-6 shrink-0 accent-primary outline-none"
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
              <div role="alert" className="mt-5 rounded-lg border-2 border-destructive p-4">
                <p className="flex items-center gap-2 text-lg font-bold">
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

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={save}
              className={`min-h-14 rounded-lg bg-primary px-8 text-lg font-semibold text-primary-foreground hover:bg-primary/90 ${focusRing}`}
            >
              Save today&apos;s check
            </button>
            <Link href="/today" className={`rounded text-primary underline ${focusRing}`}>
              Cancel
            </Link>
            {saved && (
              <p role="status" className="flex items-center gap-2 font-semibold">
                <Check aria-hidden="true" className="size-5" />
                Checked (demo: not stored yet)
              </p>
            )}
          </div>
        </div>

        <aside className={`${card} h-fit lg:sticky lg:top-4`} aria-live="polite">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">How to measure</p>
          <h2 className="mt-3 text-2xl font-bold">{focused.name}</h2>
          <p className="mt-1 text-muted-foreground">{focused.glance}</p>

          {focused.howToMeasure.length > 0 && (
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-lg">
              {focused.howToMeasure.map((s) => (
                <li key={s.step}>{s.step}</li>
              ))}
            </ol>
          )}
          {focused.spaceNote && <p className="mt-3 text-muted-foreground">{focused.spaceNote}</p>}

          <details className="mt-5 rounded-lg border border-border p-4">
            <summary className={`cursor-pointer rounded font-bold ${focusRing}`}>Learn more</summary>
            <h3 className="mt-3 font-bold">Why it matters in space</h3>
            <p className="mt-1 text-muted-foreground">{focused.whyItMatters}</p>
            <h3 className="mt-3 font-bold">When to get help</h3>
            <p className="mt-1 text-muted-foreground">{focused.briefAnswers.whenToEscalate}</p>
            {focused.personalBaselineOnly && (
              <p className="mt-3 text-muted-foreground">{focused.personalBaselineOnly}</p>
            )}
            <h3 className="mt-3 font-bold">Sources</h3>
            <ul className="mt-1 space-y-1">
              {focused.sourceIds.map((sid) => (
                <li key={sid}>
                  <a
                    href={SOURCES[sid].url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 rounded text-primary underline ${focusRing}`}
                  >
                    {SOURCES[sid].publisher}: {SOURCES[sid].title}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Ranges are general clinical reference ranges, not NASA flight standards. Not medical advice.
            </p>
          </details>

          {focused.howToMeasure.length > 0 && (
            <button
              type="button"
              onClick={readAloud}
              className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-lg border border-input hover:bg-accent ${focusRing}`}
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
