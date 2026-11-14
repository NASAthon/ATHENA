"use client";
import { useState } from "react";
import Link from "next/link";

const card = "rounded-2xl border border-white/10 bg-[#131b2d] p-6";

const bpSteps = [
  "Sit still and strap in for 5 minutes first.",
  "Wrap the cuff around your bare upper arm, two fingers above the elbow.",
  "Keep the arm at heart level and stay silent while it inflates.",
  "Enter both numbers: top (systolic) and bottom (diastolic).",
];

const moods = [
  [1, "Very low"],
  [2, "Low"],
  [3, "OK"],
  [4, "Good"],
  [5, "Very good"],
];

const symptomList = [
  ["vision", "Vision change"],
  ["dizzy", "Dizziness or poor balance"],
  ["rash", "Rash"],
  ["unwell", "Feeling unwell"],
  ["headache", "Headache"],
  ["none", "None of these"],
];

function Field({ id, label, hint, value, onChange, span = "md:col-span-2" }) {
  return (
    <div className={span}>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-14 w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 text-xl"
      />
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </div>
  );
}

export default function DailyCheck() {
  const [v, setV] = useState({
    sleep: "5.5",
    hr: "65",
    sys: "112",
    dia: "71",
    sugar: "",
    temp: "37.0",
    exercise: "95",
    spo2: "",
  });
  const [mood, setMood] = useState(4);
  const [symptoms, setSymptoms] = useState(["none"]);
  const [saved, setSaved] = useState(false);

  const set = (key) => (value) => {
    setV({ ...v, [key]: value });
    setSaved(false);
  };

  const toggleSymptom = (id) => {
    setSaved(false);
    if (id === "none") return setSymptoms(["none"]);
    const without = symptoms.filter((s) => s !== "none");
    setSymptoms(
      without.includes(id) ? without.filter((s) => s !== id) : [...without, id]
    );
  };

  const readAloud = () => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance("Blood pressure. " + bpSteps.join(" "))
    );
  };

  const save = () => {
    console.log("Daily check", { ...v, mood, symptoms });
    setSaved(true);
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-4xl font-bold">Daily check · mission day 129</h1>
          <p className="mt-2 text-lg text-slate-300">
            Step 2 of 3 · reaction test done (median 312 ms, 2 lapses) · skip
            anything you cannot measure today
          </p>
        </div>
        <p className="text-slate-300">Streak: 41 days</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="text-2xl font-bold">Readings</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-6">
              <Field id="sleep" label="Sleep last night" value={v.sleep} onChange={set("sleep")} hint="hours · count from lights out to waking" />
              <Field id="hr" label="Resting heart rate" value={v.hr} onChange={set("hr")} hint="beats per minute · after sitting still for 5 minutes" />
              <Field id="sys" label="Blood pressure, top number" value={v.sys} onChange={set("sys")} hint="mmHg · cuff on bare upper arm, arm at heart level" />
              <Field id="dia" label="Blood pressure, bottom number" value={v.dia} onChange={set("dia")} hint="mmHg · from the same reading" />
              <Field id="sugar" label="Blood sugar" value={v.sugar} onChange={set("sugar")} hint="mg/dL · finger-prick meter, before eating" />
              <Field id="temp" label="Body temperature" value={v.temp} onChange={set("temp")} hint="°C · under the tongue, wait for the beep" />
              <Field id="exercise" label="Exercise today" value={v.exercise} onChange={set("exercise")} span="md:col-span-3" hint="minutes · treadmill, cycle and resistance combined" />
              <Field id="spo2" label="Blood oxygen (optional)" value={v.spo2} onChange={set("spo2")} span="md:col-span-3" hint="% · finger clip, hold still for 10 seconds" />
            </div>
          </section>

          <section className={card}>
            <h2 className="text-2xl font-bold">How is your mood today?</h2>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {moods.map(([n, label]) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={mood === n}
                  onClick={() => {
                    setMood(n);
                    setSaved(false);
                  }}
                  className={`min-h-20 rounded-xl border px-2 py-3 text-center ${
                    mood === n
                      ? "border-sky-400 bg-sky-900/40"
                      : "border-white/10 bg-[#0b1120] hover:bg-white/5"
                  }`}
                >
                  <span className="block text-2xl font-bold">{n}</span>
                  <span className="block text-sm text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-2xl font-bold">Any of these today?</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {symptomList.map(([id, label]) => (
                <label
                  key={id}
                  className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0b1120] px-4 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(id)}
                    onChange={() => toggleSymptom(id)}
                    className="h-6 w-6 accent-sky-400"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={save}
              className="min-h-14 rounded-xl bg-sky-400 px-8 text-lg font-semibold text-slate-900 hover:bg-sky-300"
            >
              Save today&apos;s check
            </button>
            <Link href="/today" className="text-sky-400 underline">
              Cancel
            </Link>
            {saved && (
              <p role="status" className="font-semibold">
                <span aria-hidden="true">✓ </span>Saved (demo only, not stored yet)
              </p>
            )}
          </div>
        </div>

        <aside className={`${card} h-fit`}>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            How to measure
          </p>
          <h2 className="mt-3 text-2xl font-bold">Blood pressure</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-lg">
            {bpSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <hr className="my-5 border-white/10" />
          <h3 className="font-bold">Why it matters in space</h3>
          <p className="mt-2 text-slate-300">
            Weightlessness changes how blood circulates and how the heart and
            vessels work. NASA risk: cardiovascular adaptations. Hazard: gravity
            fields.
          </p>
          <button
            type="button"
            onClick={readAloud}
            className="mt-5 min-h-14 w-full rounded-xl border border-white/15 hover:bg-white/5"
          >
            Read these steps aloud
          </button>
        </aside>
      </div>
    </main>
  );
}